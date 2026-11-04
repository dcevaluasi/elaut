"use client";

import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import { User } from "@/types/user";
import { getDateInIndonesianFormat } from "@/utils/time";
import { formatToRupiah } from "@/lib/utils";
import EditPesertaAction from "@/commons/actions/EditPesertaAction";
import AppDialog from "@/commons/actions/AppDialog";
import {
    TbAlertTriangle, TbArrowsSort, TbAward, TbCalendar, TbCertificate, TbCheck, TbChevronLeft, TbChevronRight,
    TbCircleCheck, TbCircleX, TbExternalLink, TbInfoCircle, TbFileText, TbGenderBigender, TbId, TbLoader2, TbMapPin,
    TbPencil, TbPhone, TbPhotoOff, TbRefresh, TbSchool, TbSearch, TbShieldCheck, TbTrash, TbUser, TbUsers, TbWallet, TbX,
} from "react-icons/tb";

interface UserPelatihanTableProps {
    pelatihan: PelatihanMasyarakat;
    data: UserPelatihan[];
    onSuccess: () => void;
}

type IconType = React.ComponentType<{ className?: string }>;

/* ============================ KONSTANTA ============================ */

export const LULUS = "{PESERTA}{TELAH LULUS}{Has Passed}";
export const HADIR = "{PESERTA}{TELAH MENGIKUTI}{Has Attended}";
// ⚠️ Nilai baru — sesuaikan bila backend memakai teks lain
export const TIDAK_LULUS = "{PESERTA}{TIDAK LULUS}{Not Passed}";
export const TIDAK_HADIR = "{PESERTA}{TIDAK MENGIKUTI}{Not Attended}";

/** AKP & Sistem Jaminan Mutu: Lulus / Mengikuti / Tidak Lulus. Lainnya: Mengikuti / Tidak Mengikuti. */
const PROGRAM_BERLULUS = ["awak kapal perikanan", "sistem jaminan mutu"];
/** true = program memakai Lulus/Mengikuti/Tidak Lulus */
export const isProgramBerlulus = (p?: { JenisProgram?: string; BidangPelatihan?: string } | null) =>
    PROGRAM_BERLULUS.some((k) => `${p?.JenisProgram ?? ""} ${p?.BidangPelatihan ?? ""}`.toLowerCase().includes(k));
const KELULUSAN_LULUS = [
    { v: LULUS, l: "Lulus", on: "bg-blue-600 text-white" },
    { v: HADIR, l: "Mengikuti", on: "bg-teal-600 text-white" },
    { v: TIDAK_LULUS, l: "Tidak Lulus", on: "bg-rose-600 text-white" },
];
const KELULUSAN_HADIR = [
    { v: HADIR, l: "Mengikuti", on: "bg-teal-600 text-white" },
    { v: TIDAK_HADIR, l: "Tidak Mengikuti", on: "bg-rose-600 text-white" },
];
const labelKelulusan = (v?: string) =>
    v === LULUS ? "Lulus" : v === HADIR ? "Mengikuti" : v === TIDAK_LULUS ? "Tidak Lulus" : v === TIDAK_HADIR ? "Tidak Mengikuti" : "Belum ditetapkan";
const CERT_URL = "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde";
const API_KEY = process.env.NEXT_PUBLIC_ELAUT_NOJWT_KEY || "EL@uTs3rv3R"; // ⚠️ terlihat di browser
const PAGE_SIZE = 25;
const fmt = (n: number) => n.toLocaleString("id-ID");
const auth = () => ({ Authorization: `Bearer ${Cookies.get("XSRF091")}` });
const hasCert = (u: UserPelatihan) => !!u.FileSertifikat && u.FileSertifikat !== "";

const updateUserPelatihan = (id: number, fields: Record<string, string>) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    return axios.put(`${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${id}`, fd, { headers: auth() });
};
const deleteCertificate = (id: number) => axios.delete(`${elautBaseUrl}/deleteSertifikatTTde?id=${id}`, { headers: auth() });

type Filter = "all" | "lulus" | "hadir" | "gagal" | "absen" | "valid" | "invalid" | "sertifikat" | "revisi";
type SortKey = "no" | "nama";
type Confirm = { tone: "rose" | "amber"; icon: IconType; title: string; body: React.ReactNode; label: string; run: () => Promise<void> } | null;

/* ============================ TABEL ============================ */

const UserPelatihanTable: React.FC<UserPelatihanTableProps> = ({ pelatihan, data, onSuccess }) => {
    const [users, setUsers] = useState<UserPelatihan[]>(data);
    useEffect(() => setUsers(data), [data]);

    const access = Cookies.get("Access") || "";
    const canCreate = access.includes("createPelatihan");
    const isSuper = access.includes("superAdmin");

    const status = String(pelatihan?.StatusPenerbitan ?? "");
    const statusNum = parseInt(status) || 0; // "7D" → 7
    const berlulus = isProgramBerlulus(pelatihan);
    const kelulusanOpts = berlulus ? KELULUSAN_LULUS : KELULUSAN_HADIR;
    const show = {
        kelulusan: statusNum >= 5,
        revisi: pelatihan?.IsRevisi === "Active",
        validitas: statusNum === 0,
        sertifikat: ["7D", "11", "15"].includes(status),
        nilai: statusNum >= 4,
        kelola: canCreate && (statusNum < 6 || status === "7" || status === "9"),
    };

    /* ---------- state UI ---------- */
    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [filter, setFilter] = useState<Filter>("all");
    const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "no", dir: 1 });
    const [page, setPage] = useState(1);
    const [busy, setBusy] = useState<Set<number>>(new Set());
    const [confirm, setConfirm] = useState<Confirm>(null);
    const [confirming, setConfirming] = useState(false);
    const [nilaiOf, setNilaiOf] = useState<UserPelatihan | null>(null);
    const [tanggalOf, setTanggalOf] = useState<UserPelatihan | null>(null);
    const [detailOf, setDetailOf] = useState<UserPelatihan | null>(null);

    const markBusy = (id: number, on: boolean) =>
        setBusy((s) => {
            const n = new Set(s);
            if (on) n.add(id);
            else n.delete(id);
            return n;
        });
    const patch = (id: number, p: Partial<UserPelatihan>) => setUsers((prev) => prev.map((u) => (u.IdUserPelatihan === id ? { ...u, ...p } : u)));

    /* ---------- ringkasan ---------- */
    const stats = useMemo(() => {
        let lulus = 0, hadir = 0, gagal = 0, absen = 0, valid = 0, cert = 0, revisi = 0;
        users.forEach((u) => {
            if (u.IsActice === LULUS) lulus++;
            else if (u.IsActice === HADIR) hadir++;
            else if (u.IsActice === TIDAK_LULUS) gagal++;
            else if (u.IsActice === TIDAK_HADIR) absen++;
            if (u.Keterangan === "Valid") valid++;
            if (hasCert(u)) cert++;
            if (u.StatusPenandatangan === "Revisi") revisi++;
        });
        return { total: users.length, lulus, hadir, gagal, absen, valid, invalid: users.length - valid, cert, revisi };
    }, [users]);
    const usersWithCertificate = useMemo(() => users.filter(hasCert), [users]);

    const filterOptions = useMemo(() => {
        const o: { v: Filter; l: string; n: number }[] = [{ v: "all", l: "Semua", n: stats.total }];
        if (show.kelulusan) {
            if (berlulus) o.push({ v: "lulus", l: "Lulus", n: stats.lulus }, { v: "hadir", l: "Mengikuti", n: stats.hadir }, { v: "gagal", l: "Tidak Lulus", n: stats.gagal });
            else o.push({ v: "hadir", l: "Mengikuti", n: stats.hadir }, { v: "absen", l: "Tidak Mengikuti", n: stats.absen });
        }
        if (show.validitas) o.push({ v: "valid", l: "Valid", n: stats.valid }, { v: "invalid", l: "Belum valid", n: stats.invalid });
        if (show.sertifikat) o.push({ v: "sertifikat", l: "Ada e-STTPL", n: stats.cert });
        if (show.revisi) o.push({ v: "revisi", l: "Revisi", n: stats.revisi });
        return o;
    }, [stats, berlulus, show.kelulusan, show.validitas, show.sertifikat, show.revisi]);

    const rows = useMemo(() => {
        const list = users
            .map((u, i) => ({ u, no: i + 1, hay: `${u.Nama ?? ""} ${u.IdUserPelatihan} ${u.IdUsers}`.toLowerCase() }))
            .filter(({ u, hay }) => {
                if (q && !hay.includes(q)) return false;
                switch (filter) {
                    case "lulus": return u.IsActice === LULUS;
                    case "hadir": return u.IsActice === HADIR;
                    case "gagal": return u.IsActice === TIDAK_LULUS;
                    case "absen": return u.IsActice === TIDAK_HADIR;
                    case "valid": return u.Keterangan === "Valid";
                    case "invalid": return u.Keterangan !== "Valid";
                    case "sertifikat": return hasCert(u);
                    case "revisi": return u.StatusPenandatangan === "Revisi";
                    default: return true;
                }
            });
        if (sort.key === "nama") list.sort((a, b) => (a.u.Nama || "").localeCompare(b.u.Nama || "") * sort.dir);
        else if (sort.dir === -1) list.reverse();
        return list;
    }, [users, q, filter, sort]);

    useEffect(() => setPage(1), [q, filter, sort]);
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    /* ---------- aksi ---------- */
    const toggleKelulusan = async (u: UserPelatihan, target: string) => {
        if (u.IsActice === target) return;
        markBusy(u.IdUserPelatihan, true);
        try {
            await updateUserPelatihan(u.IdUserPelatihan, { IsActice: target });
            patch(u.IdUserPelatihan, { IsActice: target });
        } catch {
            Toast.fire({ icon: "error", title: "Gagal", text: "Status kelulusan tidak dapat diperbarui." });
        } finally {
            markBusy(u.IdUserPelatihan, false);
        }
    };

    const toggleValid = async (u: UserPelatihan) => {
        const next = u.Keterangan === "Valid" ? "Tidak Valid" : "Valid";
        markBusy(u.IdUserPelatihan, true);
        try {
            await updateUserPelatihan(u.IdUserPelatihan, { Keterangan: next });
            patch(u.IdUserPelatihan, { Keterangan: next });
        } catch {
            Toast.fire({ icon: "error", title: "Gagal", text: "Validasi data peserta gagal." });
        } finally {
            markBusy(u.IdUserPelatihan, false);
        }
    };

    const askRevisi = (u: UserPelatihan) =>
        setConfirm({
            tone: "amber",
            icon: TbRefresh,
            title: "Aktifkan revisi data?",
            body: (
                <>
                    e-STTPL <b className="text-slate-900">{u.Nama}</b> yang sudah terbit akan <b>dihapus</b>. Data peserta dapat diperbarui lalu diajukan untuk penerbitan ulang.
                </>
            ),
            label: "Aktifkan revisi",
            run: async () => {
                await updateUserPelatihan(u.IdUserPelatihan, { StatusPenandatangan: u.StatusPenandatangan === "No Revisi" || u.StatusPenandatangan === "Done" ? "Revisi" : "No Revisi", TanggalSertifikat: "-" });
                if (hasCert(u)) await deleteCertificate(u.IdUserPelatihan).catch((e) => console.error(e)); // dulu tidak ditunggu
                Toast.fire({ icon: "success", title: "Mode revisi aktif", text: u.Nama });
                onSuccess();
            },
        });

    const askDeletePeserta = (u: UserPelatihan) =>
        setConfirm({
            tone: "rose",
            icon: TbTrash,
            title: "Hapus peserta?",
            body: (
                <>
                    <b className="text-slate-900">{u.Nama}</b> akan dihapus dari pelatihan ini. Tindakan ini tidak dapat dibatalkan.
                </>
            ),
            label: "Hapus peserta",
            run: async () => {
                await axios.delete(`${elautBaseUrl}/deleteUserPelatihanById?id=${u.IdUserPelatihan}`, { headers: auth() });
                Toast.fire({ icon: "success", title: "Peserta dihapus", text: u.Nama });
                onSuccess();
            },
        });

    const askDeleteCert = (u: UserPelatihan) =>
        setConfirm({
            tone: "rose",
            icon: TbCertificate,
            title: "Hapus e-STTPL?",
            body: (
                <>
                    File sertifikat milik <b className="text-slate-900">{u.Nama}</b> akan dihapus.
                </>
            ),
            label: "Hapus sertifikat",
            run: async () => {
                await deleteCertificate(u.IdUserPelatihan);
                Toast.fire({ icon: "success", title: "Sertifikat dihapus", text: u.Nama });
                onSuccess();
            },
        });

    const askDeleteAllCert = () =>
        setConfirm({
            tone: "rose",
            icon: TbCertificate,
            title: "Hapus semua e-STTPL?",
            body: (
                <>
                    <b className="text-rose-600">{fmt(usersWithCertificate.length)} file sertifikat</b> pada pelatihan ini akan dihapus. Tindakan ini tidak dapat dibatalkan.
                </>
            ),
            label: `Hapus ${fmt(usersWithCertificate.length)} sertifikat`,
            run: async () => {
                // allSettled: satu gagal tidak menggagalkan semuanya
                const res = await Promise.allSettled(usersWithCertificate.map((u) => deleteCertificate(u.IdUserPelatihan)));
                const fail = res.filter((r) => r.status === "rejected").length;
                const ok = res.length - fail;
                Toast.fire({ icon: fail ? (ok ? "warning" : "error") : "success", title: fail ? `${ok} terhapus, ${fail} gagal` : "Semua sertifikat dihapus", text: `${fmt(ok)} file sertifikat dihapus.` });
                onSuccess();
            },
        });

    const runConfirm = async () => {
        if (!confirm) return;
        setConfirming(true);
        try {
            await confirm.run();
            setConfirm(null);
        } catch (e) {
            console.error(e);
            Toast.fire({ icon: "error", title: "Gagal", text: "Terjadi kesalahan. Coba lagi." });
        } finally {
            setConfirming(false);
        }
    };

    const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
    const colCount = 3 + (show.kelulusan ? 1 : 0) + (show.revisi ? 1 : 0) + (show.validitas ? 1 : 0) + (show.sertifikat ? 1 : 0) + (show.nilai ? 1 : 0);

    /* ============================ RENDER ============================ */
    return (
        <div className="w-full space-y-3">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm">
                <div className="relative flex-1 group">
                    <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama, no. registrasi, atau ID user…"
                        className="pl-11 pr-10 w-full h-11 border-none bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 placeholder:font-normal"
                    />
                    {search && (
                        <button type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-200">
                            <TbX className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {filterOptions.length > 1 && (
                    <div className="flex items-center p-1 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-x-auto [scrollbar-width:none] max-w-full">
                        {filterOptions.map((o) => (
                            <button
                                key={o.v}
                                type="button"
                                onClick={() => setFilter(o.v)}
                                className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === o.v ? "bg-[#0B1B3F] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                {o.l} <span className="ml-0.5 tabular-nums opacity-60">{o.n}</span>
                            </button>
                        ))}
                    </div>
                )}
                {isSuper && usersWithCertificate.length > 0 && (
                    <button type="button" onClick={askDeleteAllCert} className="h-11 shrink-0 px-3.5 rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-rose-200 text-xs font-bold text-rose-600 inline-flex items-center justify-center gap-1.5 hover:bg-rose-50">
                        <TbTrash className="w-4 h-4" /> Hapus semua e-STTPL ({fmt(usersWithCertificate.length)})
                    </button>
                )}
            </div>

            {/* Tabel */}
            <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[860px] border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-widest text-slate-500 [&>th]:h-11 [&>th]:border-b [&>th]:border-slate-200 dark:[&>th]:border-slate-800 [&>th]:align-middle [&>th]:whitespace-nowrap">
                                <th className="w-14 pl-5 pr-2 text-center">
                                    <SortBtn active={sort.key === "no"} onClick={() => toggleSort("no")}>No</SortBtn>
                                </th>
                                <th className="px-4 min-w-[220px]">
                                    <SortBtn active={sort.key === "nama"} onClick={() => toggleSort("nama")}>Peserta</SortBtn>
                                </th>
                                {show.kelulusan && <th className="px-4 text-center w-[220px]">{berlulus ? "Kelulusan" : "Kehadiran"}</th>}
                                {show.revisi && <th className="px-4 text-center w-[130px]">Revisi</th>}
                                {show.validitas && <th className="px-4 text-center w-[140px]">Validitas data</th>}
                                {show.sertifikat && <th className="px-4 text-center w-[190px]">e-STTPL</th>}
                                {show.nilai && <th className="px-4 text-center w-[150px]">Nilai</th>}
                                <th className="w-[1%] px-5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="[&>tr>td]:border-b [&>tr>td]:border-slate-100 dark:[&>tr>td]:border-slate-800 [&>tr:last-child>td]:border-b-0 [&>tr:nth-child(even)]:bg-slate-50/40 dark:[&>tr:nth-child(even)]:bg-slate-800/20">
                            {pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={colCount} className="py-16">
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <span className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <TbUsers className="w-5 h-5 text-slate-400" />
                                            </span>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{users.length ? "Peserta tidak ditemukan" : "Belum ada peserta"}</p>
                                            <p className="text-xs text-slate-400">{users.length ? "Ubah kata kunci atau filter." : "Tambahkan peserta melalui Import Peserta."}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map(({ u, no }) => {
                                    const id = u.IdUserPelatihan;
                                    const isBusy = busy.has(id);
                                    const done = u.StatusPenandatangan === "Done";
                                    return (
                                        <tr key={id} className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30 ${isBusy ? "opacity-60" : ""}`}>
                                            <td className="pl-5 pr-2 py-3.5 text-center text-xs font-semibold text-slate-400 tabular-nums align-middle">{no}</td>
                                            <td className="px-4 py-3.5 align-middle">
                                                <button type="button" onClick={() => setDetailOf(u)} className="text-left group/n">
                                                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug group-hover/n:text-blue-700 group-hover/n:underline underline-offset-2">{u.Nama}</p>
                                                    <p className="text-[11px] text-slate-400 tabular-nums">
                                                        Reg {id} · User {u.IdUsers}
                                                    </p>
                                                </button>
                                            </td>

                                            {show.kelulusan && (
                                                <td className="px-4 py-3.5 align-middle">
                                                    <div className={`mx-auto grid w-fit ${kelulusanOpts.length === 3 ? "grid-cols-3" : "grid-cols-2"} gap-1 p-1 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700`}>
                                                        {kelulusanOpts.map((o) => (
                                                            <button
                                                                key={o.l}
                                                                type="button"
                                                                disabled={done || !canCreate || isBusy}
                                                                onClick={() => toggleKelulusan(u, o.v)}
                                                                aria-pressed={u.IsActice === o.v}
                                                                title={done ? "Sertifikat sudah ditandatangani" : undefined}
                                                                className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all disabled:cursor-not-allowed ${u.IsActice === o.v ? o.on + " shadow-sm" : "text-slate-500 hover:text-slate-800 disabled:hover:text-slate-500"}`}
                                                            >
                                                                {o.l}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            )}

                                            {show.revisi && (
                                                <td className="px-4 py-3.5 text-center align-middle">
                                                    {u.StatusPenandatangan === "Revisi" ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2.5 py-1 text-[11px] font-bold">
                                                            <TbRefresh className="w-3.5 h-3.5" /> Revisi aktif
                                                        </span>
                                                    ) : (
                                                        <button type="button" disabled={!canCreate} onClick={() => askRevisi(u)} className="h-8 px-3 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700 hover:ring-amber-200 disabled:opacity-40">
                                                            Aktifkan
                                                        </button>
                                                    )}
                                                </td>
                                            )}

                                            {show.validitas && (
                                                <td className="px-4 py-3.5 text-center align-middle">
                                                    <button
                                                        type="button"
                                                        disabled={done || isBusy}
                                                        onClick={() => toggleValid(u)}
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 transition-colors disabled:cursor-not-allowed ${u.Keterangan === "Valid" ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100" : "bg-slate-50 text-slate-500 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700"}`}
                                                    >
                                                        {isBusy ? <TbLoader2 className="w-3.5 h-3.5 animate-spin" /> : u.Keterangan === "Valid" ? <TbCircleCheck className="w-3.5 h-3.5" /> : <TbCircleX className="w-3.5 h-3.5" />}
                                                        {u.Keterangan === "Valid" ? "Valid" : "Belum valid"}
                                                    </button>
                                                </td>
                                            )}

                                            {show.sertifikat && (
                                                <td className="px-4 py-3.5 text-center align-middle">
                                                    {u.StatusPenandatangan === "Revisi" && !hasCert(u) ? (
                                                        u.TanggalSertifikat === "-" ? (
                                                            <button type="button" onClick={() => setTanggalOf(u)} className="h-8 px-3 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-slate-50">
                                                                <TbCalendar className="w-3.5 h-3.5" /> Tetapkan tanggal
                                                            </button>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                                                                <TbLoader2 className="w-3.5 h-3.5 animate-spin" /> Diproses
                                                            </span>
                                                        )
                                                    ) : hasCert(u) ? (
                                                        <div className="inline-flex items-center gap-1">
                                                            <a href={`${CERT_URL}/${u.FileSertifikat}`} target="_blank" rel="noopener noreferrer" className="h-8 px-3 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100 text-[11px] font-bold inline-flex items-center gap-1.5 hover:bg-blue-600 hover:text-white">
                                                                <TbCertificate className="w-3.5 h-3.5" /> Lihat
                                                            </a>
                                                            {isSuper && (
                                                                <button type="button" onClick={() => askDeleteCert(u)} title="Hapus sertifikat" aria-label="Hapus sertifikat" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center">
                                                                    <TbTrash className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-300">Belum terbit</span>
                                                    )}
                                                </td>
                                            )}

                                            {show.nilai && (
                                                <td className="px-4 py-3.5 align-middle">
                                                    <button type="button" onClick={() => setNilaiOf(u)} title="Ubah nilai" className="group/v mx-auto flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-blue-50 dark:hover:bg-slate-800">
                                                        <Score label="Pre" v={u.PreTest} />
                                                        <span className="text-slate-300">→</span>
                                                        <Score label="Post" v={u.PostTest} strong />
                                                        <TbPencil className="w-3.5 h-3.5 text-slate-300 group-hover/v:text-blue-600" />
                                                    </button>
                                                </td>
                                            )}

                                            <td className="px-5 py-3.5 align-middle">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button type="button" onClick={() => setDetailOf(u)} title="Detail peserta" aria-label="Detail peserta" className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50 inline-flex items-center justify-center shadow-sm transition-all">
                                                        <TbInfoCircle className="w-4 h-4" />
                                                    </button>
                                                    {show.kelola && (
                                                        <>
                                                            <EditPesertaAction idPelatihan={String(u.IdPelatihan)} idPeserta={String(u.IdUsers)} onSuccess={onSuccess} variant="icon" />
                                                            <button type="button" onClick={() => askDeletePeserta(u)} title="Hapus peserta" aria-label="Hapus peserta" className="w-9 h-9 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-white dark:bg-slate-900 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 inline-flex items-center justify-center shadow-sm transition-all">
                                                                <TbTrash className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer tabel */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    <span>
                        <b className="text-slate-800 dark:text-white tabular-nums">{fmt(rows.length)}</b> dari {fmt(users.length)} peserta
                        {show.kelulusan && (berlulus ? <> · <span className="text-blue-600 font-semibold">{fmt(stats.lulus)} lulus</span></> : <> · <span className="text-teal-600 font-semibold">{fmt(stats.hadir)} mengikuti</span></>)}
                        {show.sertifikat && <> · <span className="text-emerald-600 font-semibold">{fmt(stats.cert)} e-STTPL</span></>}
                    </span>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} aria-label="Sebelumnya" className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center">
                                <TbChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-2 font-semibold tabular-nums">
                                {safePage} / {totalPages}
                            </span>
                            <button type="button" onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages} aria-label="Berikutnya" className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center">
                                <TbChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ---------- Dialog ---------- */}
            <ConfirmDialog confirm={confirm} busy={confirming} onCancel={() => !confirming && setConfirm(null)} onConfirm={runConfirm} />
            <NilaiDialog
                user={nilaiOf}
                onClose={() => setNilaiOf(null)}
                onSaved={(id, pre, post) => {
                    patch(id, { PreTest: pre, PostTest: post } as unknown as Partial<UserPelatihan>);
                    setNilaiOf(null);
                }}
            />
            <TanggalDialog
                user={tanggalOf}
                onClose={() => setTanggalOf(null)}
                onSaved={() => {
                    setTanggalOf(null);
                    onSuccess();
                }}
            />
            <DetailPesertaDialog row={detailOf} onClose={() => setDetailOf(null)} />
        </div>
    );
};

/* ============================ SEL KECIL ============================ */

function SortBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button type="button" onClick={onClick} className={`inline-flex items-center gap-1 uppercase tracking-widest ${active ? "text-slate-700 dark:text-slate-200" : "hover:text-slate-600"}`}>
            {children} <TbArrowsSort className={`w-3 h-3 ${active ? "opacity-80" : "opacity-30"}`} />
        </button>
    );
}

function Score({ label, v, strong }: { label: string; v?: number | string | null; strong?: boolean }) {
    const n = v === null || v === undefined || v === "" ? null : Number(v);
    return (
        <span className="text-center leading-none">
            <span className="block text-[9px] font-semibold uppercase text-slate-400">{label}</span>
            <span className={`block text-sm tabular-nums ${strong ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-600 dark:text-slate-300"} ${n === null ? "text-slate-300" : ""}`}>{n === null || isNaN(n) ? "–" : n}</span>
        </span>
    );
}

/* ============================ DIALOG ============================ */

function ConfirmDialog({ confirm, busy, onCancel, onConfirm }: { confirm: Confirm; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
    const tone = confirm?.tone === "amber" ? { tile: "bg-amber-50 text-amber-600", btn: "bg-amber-600 hover:bg-amber-700" } : { tile: "bg-rose-50 text-rose-600", btn: "bg-rose-600 hover:bg-rose-700" };
    const Icon = confirm?.icon ?? TbAlertTriangle;
    return (
        <AppDialog open={!!confirm} onClose={onCancel} title={confirm?.title || "Konfirmasi"} maxWidth="sm:max-w-md" locked={busy}>
            <div className="p-6 space-y-3 bg-white dark:bg-slate-900">
                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tone.tile}`}>
                    <Icon className="w-5 h-5" />
                </span>
                <h2 id="confirm-title" className="text-lg font-black text-slate-900 dark:text-white">{confirm?.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{confirm?.body}</p>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={onCancel} disabled={busy} className="h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                    Batal
                </button>
                <button type="button" onClick={onConfirm} disabled={busy} className={`h-11 px-5 rounded-xl text-white text-sm font-bold inline-flex items-center gap-2 disabled:opacity-60 ${tone.btn}`}>
                    {busy && <TbLoader2 className="w-4 h-4 animate-spin" />} {busy ? "Memproses…" : confirm?.label}
                </button>
            </div>
        </AppDialog>
    );
}

function NilaiDialog({ user, onClose, onSaved }: { user: UserPelatihan | null; onClose: () => void; onSaved: (id: number, pre: number, post: number) => void }) {
    const [pre, setPre] = useState("");
    const [post, setPost] = useState("");
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (!user) return;
        setPre(user.PreTest != null ? String(user.PreTest) : "");
        setPost(user.PostTest != null ? String(user.PostTest) : "");
    }, [user]);

    const invalid = (v: string) => v !== "" && (isNaN(Number(v)) || Number(v) < 0 || Number(v) > 100);
    const canSave = pre !== "" && post !== "" && !invalid(pre) && !invalid(post);

    const save = async () => {
        if (!user || !canSave) return;
        setSaving(true);
        try {
            await updateUserPelatihan(user.IdUserPelatihan, { PreTest: pre, PostTest: post });
            Toast.fire({ icon: "success", title: "Nilai disimpan", text: user.Nama });
            onSaved(user.IdUserPelatihan, Number(pre), Number(post));
        } catch (e) {
            console.error(e);
            Toast.fire({ icon: "error", title: "Gagal", text: "Nilai tidak dapat disimpan." });
        } finally {
            setSaving(false);
        }
    };

    const delta = canSave ? Number(post) - Number(pre) : null;

    return (
        <AppDialog open={!!user} onClose={onClose} title="Nilai peserta" maxWidth="sm:max-w-md" locked={saving}>
            <MiniHeader icon={TbAward} eyebrow="Penilaian" title="Nilai pre-test & post-test" sub={user?.Nama} id="nilai-title" onClose={onClose} disabled={saving} />
            <div className="p-5 grid grid-cols-2 gap-3">
                {[
                    { l: "Pre-test", v: pre, set: setPre },
                    { l: "Post-test", v: post, set: setPost },
                ].map((f) => (
                    <label key={f.l} className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{f.l}</span>
                        <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={100}
                            step="0.01"
                            value={f.v}
                            onChange={(e) => f.set(e.target.value)}
                            placeholder="0–100"
                            className={`w-full h-14 px-4 border-none rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ${invalid(f.v) ? "ring-rose-300" : "ring-slate-200 dark:ring-slate-700"} text-2xl font-black tabular-nums text-center outline-none focus:ring-2 focus:ring-blue-500/30`}
                        />
                        {invalid(f.v) && <span className="text-[11px] text-rose-600">Nilai 0–100</span>}
                    </label>
                ))}
                {delta !== null && (
                    <p className={`col-span-2 text-center text-xs font-semibold ${delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {delta >= 0 ? "Naik" : "Turun"} {Math.abs(delta).toLocaleString("id-ID")} poin dari pre-test
                    </p>
                )}
            </div>
            <MiniFooter onCancel={onClose} onSave={save} saving={saving} disabled={!canSave} label="Simpan nilai" />
        </AppDialog>
    );
}

function TanggalDialog({ user, onClose, onSaved }: { user: UserPelatihan | null; onClose: () => void; onSaved: () => void }) {
    const [tgl, setTgl] = useState("");
    const [saving, setSaving] = useState(false);
    useEffect(() => setTgl(""), [user]);

    const save = async () => {
        if (!user || !tgl) return;
        setSaving(true);
        try {
            await updateUserPelatihan(user.IdUserPelatihan, { TanggalSertifikat: getDateInIndonesianFormat(tgl) });
            Toast.fire({ icon: "success", title: "Tanggal revisi ditetapkan", text: getDateInIndonesianFormat(tgl) });
            onSaved();
        } catch {
            Toast.fire({ icon: "error", title: "Gagal", text: "Tanggal sertifikat tidak dapat diubah." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppDialog open={!!user} onClose={onClose} title="Tanggal sertifikat" maxWidth="sm:max-w-md" locked={saving}>
            <MiniHeader icon={TbCalendar} eyebrow="Revisi e-STTPL" title="Tetapkan tanggal sertifikat" sub={user?.Nama} id="tgl-title" onClose={onClose} disabled={saving} />
            <div className="p-5 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Tanggal penandatanganan baru</span>
                <input type="date" value={tgl} onChange={(e) => setTgl(e.target.value)} className="w-full h-12 px-4 border-none rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30" />
                {tgl && <p className="text-[11px] text-slate-500">Tercetak di sertifikat: <b className="text-slate-800 dark:text-white">{getDateInIndonesianFormat(tgl)}</b></p>}
            </div>
            <MiniFooter onCancel={onClose} onSave={save} saving={saving} disabled={!tgl} label="Simpan tanggal" />
        </AppDialog>
    );
}

function MiniHeader({ icon: Icon, eyebrow, title, sub, id, onClose, disabled }: { icon: IconType; eyebrow: string; title: string; sub?: string; id: string; onClose: () => void; disabled?: boolean }) {
    return (
        <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 py-4">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
            <Icon aria-hidden className="pointer-events-none absolute -right-4 -bottom-6 -z-10 w-24 h-24 -rotate-12 text-sky-300 opacity-20" />
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/90">{eyebrow}</p>
                    <h2 id={id} className="mt-0.5 text-base font-black leading-snug">{title}</h2>
                    {sub && <p className="text-xs text-blue-100/70 truncate">{sub}</p>}
                </div>
                <button type="button" onClick={onClose} disabled={disabled} aria-label="Tutup" className="h-8 w-8 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20 disabled:opacity-40">
                    <TbX className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function MiniFooter({ onCancel, onSave, saving, disabled, label }: { onCancel: () => void; onSave: () => void; saving: boolean; disabled: boolean; label: string }) {
    return (
        <div className="flex justify-end gap-2 px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={onCancel} disabled={saving} className="h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                Batal
            </button>
            <button type="button" onClick={onSave} disabled={saving || disabled} className="h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center gap-2 disabled:opacity-40">
                {saving ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbCheck className="w-4 h-4" />} {saving ? "Menyimpan…" : label}
            </button>
        </div>
    );
}

/* ---------- Detail peserta ---------- */

const pathOf = (v = "") => v.split("?")[0];
const fileOk = (v?: string) => !!v && !v.trim().endsWith("/") && /\.[a-z0-9]{2,5}$/i.test(pathOf(v.trim()));
const isImg = (v = "") => /\.(jpe?g|png|webp|gif)$/i.test(pathOf(v));

function DetailPesertaDialog({ row, onClose }: { row: UserPelatihan | null; onClose: () => void }) {
    const [peserta, setPeserta] = useState<User | null>(null);
    const [pp, setPp] = useState<UserPelatihan | null>(null);
    const [state, setState] = useState<"loading" | "ready" | "error">("loading");

    const load = React.useCallback(async () => {
        if (!row) return;
        setState("loading");
        try {
            const res = await axios.get<User>(`${elautBaseUrl}/users/getUsersByIdNoJwt?id=${row.IdUsers}`, { headers: { "x-api-key": API_KEY } });
            setPeserta(res.data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setPp(((res.data as any)?.Pelatihan || []).find((i: UserPelatihan) => String(i.IdUserPelatihan) === String(row.IdUserPelatihan)) || row);
            setState("ready");
        } catch (e) {
            console.error(e);
            setState("error");
        }
    }, [row]);

    useEffect(() => {
        if (row) load();
        else setPeserta(null);
    }, [row, load]);

    const p = peserta;
    const info = pp ?? row;

    return (
        <AppDialog open={!!row} onClose={onClose} title="Detail peserta" maxWidth="sm:max-w-2xl">
            <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 md:px-6 py-5">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
                <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <span className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden bg-white/10 ring-1 ring-white/20 grid place-items-center text-xl font-black">
                            {p?.Foto && fileOk(p.Foto) && isImg(p.Foto) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.Foto} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                            ) : null}
                            {(row?.Nama || "P").charAt(0)}
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/90">Detail Peserta</p>
                            <h2 id="detail-peserta-title" className="mt-0.5 text-base md:text-lg font-black leading-snug truncate">{row?.Nama}</h2>
                            <p className="text-xs text-blue-100/70 tabular-nums truncate">{p?.Nik ? `NIK ${p.Nik}` : `Reg ${row?.IdUserPelatihan ?? "-"}`}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20">
                        <TbX className="w-4 h-4" />
                    </button>
                </div>
                {info && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        <Chip on={info.Keterangan === "Valid"} label={info.Keterangan === "Valid" ? "Data valid" : "Belum valid"} />
                        {info.IsActice && <Chip on={info.IsActice === LULUS || info.IsActice === HADIR} label={labelKelulusan(info.IsActice)} />}
                        <Chip on={hasCert(info)} label={hasCert(info) ? "e-STTPL terbit" : "e-STTPL belum terbit"} />
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-4 md:p-5 space-y-4">
                {state === "loading" ? (
                    <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800 animate-pulse" />)}</div>
                ) : state === "error" ? (
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                        <span className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center"><TbAlertTriangle className="w-5 h-5" /></span>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Data peserta gagal dimuat</p>
                        <button type="button" onClick={load} className="h-9 px-3.5 rounded-xl bg-white ring-1 ring-slate-200 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-slate-50">
                            <TbRefresh className="w-4 h-4" /> Coba lagi
                        </button>
                    </div>
                ) : (
                    <>
                        <Card title="Biodata" icon={TbUser}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Info icon={TbGenderBigender} label="Jenis kelamin" value={p?.JenisKelamin === "L" ? "Laki-laki" : p?.JenisKelamin === "P" ? "Perempuan" : p?.JenisKelamin} />
                                <Info icon={TbCalendar} label="Tempat, tanggal lahir" value={[p?.TempatLahir, p?.TanggalLahir].filter(Boolean).join(", ")} />
                                <Info icon={TbSchool} label="Pendidikan terakhir" value={p?.PendidikanTerakhir} />
                                <Info icon={TbId} label="Instansi" value={p?.Status} />
                            </div>
                        </Card>
                        <Card title="Kontak & domisili" icon={TbMapPin}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Info icon={TbPhone} label="No. telepon" value={p?.NoTelpon?.toString()} />
                                <Info icon={TbMapPin} label="Kota / provinsi" value={[p?.Kota, p?.Provinsi].filter(Boolean).join(", ")} />
                                <Info icon={TbMapPin} label="Alamat" value={p?.Alamat} wide />
                            </div>
                        </Card>
                        <Card title="Status pelatihan" icon={TbShieldCheck}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <Info icon={TbAward} label="Pre-test" value={info?.PreTest != null ? String(info.PreTest) : undefined} />
                                <Info icon={TbAward} label="Post-test" value={info?.PostTest != null ? String(info.PostTest) : undefined} />
                                <Info icon={TbWallet} label="Metode bayar" value={info?.MetodoPembayaran} />
                                <Info icon={TbWallet} label="Total bayar" value={info?.TotalBayar ? formatToRupiah(parseInt(info.TotalBayar)) : undefined} />
                            </div>
                        </Card>
                        <Card title="Dokumen" icon={TbFileText} aside={<DocCount items={[p?.Foto, p?.Ktp]} />}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <DocView label="Pas foto" url={p?.Foto} portrait />
                                <DocView label="KTP / identitas" url={p?.Ktp} />
                            </div>
                        </Card>
                    </>
                )}
            </div>

            <div className="shrink-0 flex justify-end px-5 md:px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={onClose} className="h-11 px-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Tutup
                </button>
            </div>
        </AppDialog>
    );
}

const Chip = ({ on, label }: { on: boolean; label: string }) => (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ring-1 backdrop-blur ${on ? "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30" : "bg-white/[0.08] text-blue-100/70 ring-white/15"}`}>
        {on ? <TbCircleCheck className="w-3.5 h-3.5" /> : <TbCircleX className="w-3.5 h-3.5" />} {label}
    </span>
);

function Card({ title, icon: Icon, aside, children }: { title: string; icon: IconType; aside?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm">
            <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="relative isolate flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-sky-100">
                    <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#3B82F6_0%,transparent_70%)]" />
                    <Icon className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">{title}</h3>
                {aside && <div className="ml-auto">{aside}</div>}
            </header>
            <div className="p-3">{children}</div>
        </section>
    );
}

function Info({ icon: Icon, label, value, wide }: { icon: IconType; label: string; value?: string; wide?: boolean }) {
    return (
        <div className={`flex items-start gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5 min-w-0 ${wide ? "sm:col-span-2" : ""}`}>
            <Icon className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
            <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400">{label}</p>
                <p className={`text-[13px] font-semibold break-words ${value ? "text-slate-800 dark:text-white" : "text-slate-300"}`}>{value || "Belum diisi"}</p>
            </div>
        </div>
    );
}

function DocCount({ items }: { items: (string | undefined)[] }) {
    const n = items.filter(fileOk).length;
    return (
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black tabular-nums ring-1 ${n === items.length ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : n ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-rose-50 text-rose-700 ring-rose-200"}`}>
            {n}/{items.length} tersedia
        </span>
    );
}

/** Pratinjau dokumen read-only dengan status jelas: Tersedia / Belum ada / Tidak dapat dibuka */
function DocView({ label, url, portrait }: { label: string; url?: string; portrait?: boolean }) {
    const v = (url || "").trim();
    const ok = fileOk(v);
    const canOpen = ok && /^https?:\/\//i.test(v);
    const [broken, setBroken] = useState(false);
    useEffect(() => setBroken(false), [v]);
    const state = !ok ? "kosong" : broken ? "rusak" : "ada";
    const badge = state === "ada" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200";

    return (
        <div className={`min-w-0 overflow-hidden rounded-2xl ring-1 ${state === "ada" ? "ring-slate-200 dark:ring-slate-700" : "ring-rose-200 dark:ring-rose-900/40"}`}>
            <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{label}</span>
                <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${badge}`}>
                    {state === "ada" ? <TbCircleCheck className="w-3 h-3" /> : state === "rusak" ? <TbPhotoOff className="w-3 h-3" /> : <TbCircleX className="w-3 h-3" />}
                    {state === "ada" ? "Tersedia" : state === "rusak" ? "Tidak dapat dibuka" : "Belum ada"}
                </span>
            </div>
            <div className={`relative mx-3 ${portrait ? "aspect-[3/4] max-h-60" : "aspect-[16/10]"} rounded-xl overflow-hidden ${state === "kosong" ? "bg-rose-50/50 border-2 border-dashed border-rose-200" : "bg-slate-100 dark:bg-slate-800"}`}>
                {canOpen && isImg(v) && !broken ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v} alt={label} onError={() => setBroken(true)} className="absolute inset-0 w-full h-full object-contain" />
                ) : (
                    <span className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center px-3 ${state === "ada" ? "text-slate-400" : "text-rose-500"}`}>
                        {state === "ada" ? <TbFileText className="w-10 h-10" /> : state === "rusak" ? <TbPhotoOff className="w-10 h-10" /> : <TbCircleX className="w-10 h-10" />}
                        <span className="text-[11px] font-bold">{state === "ada" ? (/\.pdf$/i.test(pathOf(v)) ? "Dokumen PDF" : "File tersimpan") : state === "rusak" ? "Gambar gagal dimuat" : `${label} belum diunggah`}</span>
                    </span>
                )}
            </div>
            <div className="flex justify-end px-3 py-2">
                {canOpen ? (
                    <a href={v} target="_blank" rel="noopener noreferrer" className="h-7 px-2 rounded-lg text-[11px] font-bold text-blue-600 hover:bg-blue-50 inline-flex items-center gap-1">
                        <TbExternalLink className="w-3.5 h-3.5" /> Buka
                    </a>
                ) : (
                    <span className="h-7 text-[11px] text-slate-300 inline-flex items-center">Tidak ada file</span>
                )}
            </div>
        </div>
    );
}

export default UserPelatihanTable;
