"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { TbCalendar, TbPencilCheck, TbExternalLink, TbX, TbCheck, TbLoader2, TbAlertCircle } from "react-icons/tb";
import { HiOutlineEyeOff } from "react-icons/hi";
import { HiOutlineEye } from "react-icons/hi2";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { Clock, Key, ShieldCheck, FileCheck, CheckCircle2, ChevronRight, ChevronLeft, Hash, FileText, Search, CalendarCheck, GraduationCap, LucideIcon } from "lucide-react";

import { PelatihanMasyarakat } from "@/types/product";
import DialogSertifikatPelatihan, { DialogSertifikatHandle } from "@/components/sertifikat/dialogSertifikatPelatihan";
import { elautBaseUrl } from "@/constants/urls";
import { getDateInIndonesianFormat } from "@/utils/time";
import Toast from "@/commons/Toast";
import { countUserWithCertificate, countUserWithDrafCertificate, countUserWithTanggalSertifikat } from "@/utils/counter";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { HADIR, LULUS } from "./Tables/UserPelatihanTable";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: () => void;
}

const PAGE_SIZE = 100;
const MAX_CONCURRENCY = 6; // optimal untuk html2canvas agar main thread tidak tercekik
const SIGN_STAGE = ["7B", "10", "14"];
const NEXT_STATUS: Record<string, string> = { "7B": "7D", "10": "11" }; // selain itu → "15" (sama seperti sebelumnya)
const CERT_URL = "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static";

type Filter = "" | "belum" | "draft" | "signed";
type Peran = "" | "peserta" | "pelatih";

/** Status pelatih (sertifikat "Sebagai Pelatih / As Trainer"). Dicocokkan longgar agar aman bila prefiks berbeda. */
export const PELATIH = "{PELATIH}{SEBAGAI PELATIH}{As Trainer}";
export const isPelatih = (u: { IsActice?: string }) => /SEBAGAI PELATIH|As Trainer/i.test(u?.IsActice ?? "");
/** Yang diproses TTDe: peserta Lulus / Mengikuti + pelatih */
const isTarget = (u: { IsActice?: string }) => u?.IsActice === LULUS || u?.IsActice === HADIR || isPelatih(u);

const statusOf = (u: any): Exclude<Filter, ""> => (u.FileSertifikat?.includes("signed") ? "signed" : u.FileSertifikat ? "draft" : "belum");

const authHeader = () => ({ Authorization: `Bearer ${Cookies.get("XSRF091")}` });

/* ============================ KOMPONEN ============================ */

const TTDeDetail: React.FC<Props> = ({ data, fetchData }) => {
    // Diproses (tanggal, draft, TTDe): peserta Lulus / Mengikuti + pelatih "Sebagai Pelatih"
    const allUsers = useMemo(() => data.UserPelatihan || [], [data.UserPelatihan]);
    const users = useMemo(() => allUsers.filter(isTarget), [allUsers]);
    const excluded = allUsers.length - users.length;
    const total = users.length;
    const totalPelatih = useMemo(() => users.filter(isPelatih).length, [users]);
    const totalPeserta = total - totalPelatih;
    const targetLabel = totalPelatih ? `${totalPeserta} peserta · ${totalPelatih} pelatih` : "Lulus/Mengikuti";

    /* ---------- Hitungan (sekali per perubahan data) ---------- */
    const counts = useMemo(
        () => ({ draft: countUserWithDrafCertificate(users), signed: countUserWithCertificate(users), tanggal: countUserWithTanggalSertifikat(users) }),
        [users]
    );
    const hasTanggal = counts.tanggal > 0;
    const allSigned = total > 0 && counts.signed === total;

    // Index peserta → ref (Map O(1), bukan findIndex per baris)
    const indexById = useMemo(() => new Map(users.map((u, i) => [u.IdUserPelatihan, i])), [users]);
    const refs = useRef<React.RefObject<DialogSertifikatHandle>[]>([]);
    if (refs.current.length !== total) {
        refs.current = users.map((_, i) => refs.current[i] ?? React.createRef<DialogSertifikatHandle>());
    }

    /* ---------- Hak menandatangani ---------- */
    const [role] = useState(() => Cookies.get("Role") || "");
    const canSign = (!!data.TtdSertifikat && role.includes(data.TtdSertifikat) && SIGN_STAGE.includes(String(data.StatusPenerbitan))) || data.IsRevisi === "Active";

    /* ---------- Filter & halaman ---------- */
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Filter>("");
    const [peran, setPeran] = useState<Peran>("");
    const [page, setPage] = useState(1);

    const statusCounts = useMemo(() => {
        const c = { belum: 0, draft: 0, signed: 0 };
        users.forEach((u) => (!peran || (peran === "pelatih") === isPelatih(u)) && c[statusOf(u)]++);
        return c;
    }, [users, peran]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return users.filter(
            (u) =>
                (!filter || statusOf(u) === filter) &&
                (!peran || (peran === "pelatih") === isPelatih(u)) &&
                (!q || `${u.Nama ?? ""} ${u.NoRegistrasi ?? ""}`.toLowerCase().includes(q))
        );
    }, [users, search, filter, peran]);

    useEffect(() => setPage(1), [search, filter, peran]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageUsers = useMemo(() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filtered, safePage]);
    const pageMissing = useMemo(() => pageUsers.filter((u) => !u.FileSertifikat), [pageUsers]);
    const pageReady = pageMissing.length === 0;

    /* ---------- Tanggal TTDe ---------- */
    const [dateOpen, setDateOpen] = useState(false);
    const [tanggal, setTanggal] = useState("");
    const [savingDate, setSavingDate] = useState(false);
    const [dateProgress, setDateProgress] = useState(0);

    const saveTanggal = async () => {
        if (!tanggal) return;
        setSavingDate(true);
        setDateProgress(0);
        const formatted = getDateInIndonesianFormat(tanggal);
        let failed = 0;
        try {
            const BATCH = 25;
            for (let i = 0; i < users.length; i += BATCH) {
                const batch = users.slice(i, i + BATCH);
                const res = await Promise.allSettled(
                    batch.map((u) => {
                        const fd = new FormData();
                        fd.append("TanggalSertifikat", formatted);
                        return axios.put(`${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${u.IdUserPelatihan}`, fd, { headers: authHeader() });
                    })
                );
                failed += res.filter((r) => r.status === "rejected").length;
                setDateProgress(Math.round((Math.min(i + BATCH, users.length) / users.length) * 100));
            }
            if (failed) Toast.fire({ icon: "warning", title: "Sebagian gagal", text: `${failed} dari ${users.length} peserta belum terset. Coba simpan lagi.` });
            else Toast.fire({ icon: "success", title: "Tanggal TTDe ditetapkan", text: formatted });
            setDateOpen(false);
            setTanggal("");
            fetchData();
        } finally {
            setSavingDate(false);
        }
    };

    /* ---------- Generate draft (halaman aktif) ---------- */
    const [generating, setGenerating] = useState(false);
    const [genProgress, setGenProgress] = useState(0);
    const [genCounter, setGenCounter] = useState(0);
    const [genTotal, setGenTotal] = useState(0);

    const generateDrafts = async () => {
        const todo = pageMissing.map((u) => refs.current[indexById.get(u.IdUserPelatihan) ?? -1]).filter(Boolean);
        if (!todo.length) return;
        setGenerating(true);
        setGenProgress(0);
        setGenCounter(0);
        setGenTotal(todo.length);

        const pool = [...todo];
        let done = 0;
        let last = 0;
        const worker = async (w: number) => {
            await new Promise((r) => setTimeout(r, w * 300)); // stagger awal
            while (pool.length) {
                const ref = pool.shift();
                try {
                    await ref?.current?.uploadPdf?.();
                } catch (err) {
                    console.error("Generate draft gagal:", err);
                } finally {
                    done++;
                    const now = Date.now();
                    if (now - last > 50 || done === todo.length) {
                        setGenProgress((done / todo.length) * 100);
                        setGenCounter(done);
                        last = now;
                    }
                }
            }
        };
        await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENCY, todo.length) }, (_, i) => worker(i)));
        setGenerating(false);
        fetchData();
    };

    /* ---------- TTDe ---------- */
    const [signOpen, setSignOpen] = useState(false);
    const [passphrase, setPassphrase] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [signing, setSigning] = useState(false);

    const openSign = () => {
        setSignOpen(true);
        // Prasyarat: tanggal → draft halaman ini → passphrase
        if (hasTanggal && !pageReady && !generating) generateDrafts();
    };

    const signStep = !hasTanggal ? 1 : generating || !pageReady ? 2 : 3;

    const handleTTDe = async () => {
        if (!passphrase.trim()) {
            Toast.fire({ icon: "warning", title: "Masukkan passphrase" });
            return;
        }
        setSigning(true);
        // Peserta target yang belum signed & belum punya draft → tidak ikut ditandatangani
        const unsigned = users.filter((u) => !u.FileSertifikat?.includes("signed"));
        const tanpaDraft = unsigned.filter((u) => !u.FileSertifikat).length;
        const willComplete = total > 0 && tanpaDraft === 0;
        try {
            await axios.post(
                `${elautBaseUrl}/lemdik/sendSertifikatTtde`,
                { idPelatihan: data.IdPelatihan.toString(), kodeParafrase: passphrase, nik: Cookies.get("NIK") },
                { headers: authHeader() }
            );
            // Status hanya diubah bila jumlah signed = jumlah target; jika belum, tetap di stage sekarang
            if (willComplete) {
                await axios.put(
                    `${elautBaseUrl}/lemdik/updatePelatihan?id=${data.IdPelatihan}`,
                    // CATATAN: StatusApproval = passphrase dipertahankan dari kode lama — sebaiknya ditinjau (menyimpan passphrase tidak aman)
                    { StatusPenerbitan: NEXT_STATUS[String(data.StatusPenerbitan)] ?? "15", StatusApproval: passphrase },
                    { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } }
                );
            }
            await handleAddHistoryTrainingInExisting(data, "Telah menandatangani STTPL", Cookies.get("Role"), `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`);
            Toast.fire(
                willComplete
                    ? { icon: "success", title: "Berhasil ditandatangani", text: `Semua ${total} e-STTPL telah ditandatangani${totalPelatih ? ` (termasuk ${totalPelatih} sertifikat pelatih)` : ""}.` }
                    : { icon: "info", title: "Sebagian ditandatangani", text: `${tanpaDraft} peserta belum punya draft (halaman lain). Status belum diubah — lanjutkan halaman berikutnya.` }
            );
            setPassphrase("");
            setSignOpen(false);
            fetchData();
        } catch (e: any) {
            Toast.fire({ icon: "error", title: "Gagal TTDe", text: e?.response?.data?.message || "Periksa passphrase lalu coba lagi." });
        } finally {
            setSigning(false);
        }
    };

    const busy = generating || signing;

    /* ============================ RENDER ============================ */

    return (
        <div className="space-y-5">
            {/* ---------- Ringkasan + aksi ---------- */}
            <div className="relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 md:p-6 text-white ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(40%_120%_at_100%_100%,#10B981_0%,transparent_60%)] opacity-80" />
                <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                <TbPencilCheck aria-hidden className="pointer-events-none absolute -right-6 -bottom-8 -z-10 w-40 h-40 -rotate-12 text-emerald-300 opacity-10" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Tanda Tangan Elektronik</p>
                        <h3 className="mt-0.5 text-lg font-black tracking-tight">Penandatanganan e-STTPL</h3>
                        <p className="text-xs text-blue-100/70">
                            Penandatangan: <b className="text-white">{data.TtdSertifikat || "-"}</b> · Stage <span className="font-mono">{data.StatusPenerbitan}</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {!allSigned && (
                            <button
                                type="button"
                                onClick={() => setDateOpen(true)}
                                className="group h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-2 text-white bg-white/10 ring-1 ring-white/25 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:bg-white/20"
                            >
                                <TbCalendar className="w-4 h-4 transition-transform group-hover:rotate-12" />
                                {hasTanggal ? "Ubah tanggal TTDe" : "Tetapkan tanggal TTDe"}
                            </button>
                        )}
                        {canSign && !allSigned && (
                            <button
                                type="button"
                                onClick={openSign}
                                className="group h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-2 bg-white text-[#0B1B3F] shadow-md hover:bg-sky-50"
                            >
                                <TbPencilCheck className="w-4 h-4 transition-transform group-hover:-rotate-12" /> Mulai TTDe
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <HeroStat icon={Hash} label="Target" value={`${total}`} sub={excluded ? `${targetLabel} · ${excluded} dilewati` : targetLabel} />
                    <HeroStat icon={CalendarCheck} label="Tanggal TTDe" value={hasTanggal ? `${counts.tanggal}/${total}` : "Belum"} sub={hasTanggal ? "sudah ditetapkan" : "wajib sebelum TTDe"} warn={!hasTanggal} />
                    <HeroStat icon={FileCheck} label="Draft siap" value={`${counts.draft}/${total}`} pct={total ? (counts.draft / total) * 100 : 0} accent="#F59E0B" />
                    <HeroStat icon={ShieldCheck} label="Tuntas TTDe" value={`${counts.signed}/${total}`} pct={total ? (counts.signed / total) * 100 : 0} accent="#10B981" />
                </div>
            </div>

            {/* ---------- Toolbar daftar ---------- */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm flex flex-col md:flex-row md:items-center gap-2.5">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau no. registrasi…"
                        className="w-full h-11 pl-11 pr-10 border-none bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 placeholder:font-normal"
                    />
                    {search && (
                        <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-200" aria-label="Hapus pencarian">
                            <TbX className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex items-center p-1 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-x-auto scrollbar-hide">
                    {([
                        ["", "Semua", total],
                        ["belum", "Belum draft", statusCounts.belum],
                        ["draft", "Draft", statusCounts.draft],
                        ["signed", "Sudah TTDe", statusCounts.signed],
                    ] as [Filter, string, number][]).map(([k, label, n]) => (
                        <button
                            key={k || "all"}
                            type="button"
                            onClick={() => setFilter(k)}
                            className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === k ? "bg-[#0B1B3F] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                        >
                            {label} <span className="opacity-60 tabular-nums">{n}</span>
                        </button>
                    ))}
                </div>
                {totalPelatih > 0 && (
                    <div className="flex items-center p-1 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-x-auto scrollbar-hide" role="radiogroup" aria-label="Peran">
                        {([
                            ["", "Semua peran", total],
                            ["peserta", "Peserta", totalPeserta],
                            ["pelatih", "Pelatih", totalPelatih],
                        ] as [Peran, string, number][]).map(([k, label, n]) => (
                            <button
                                key={k || "all"}
                                type="button"
                                role="radio"
                                aria-checked={peran === k}
                                onClick={() => setPeran(k)}
                                className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all inline-flex items-center gap-1.5 ${peran === k ? "bg-[#0B1B3F] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                {k === "pelatih" && <GraduationCap className="w-3.5 h-3.5" />} {label} <span className="opacity-60 tabular-nums">{n}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ---------- Pagination ---------- */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-1 text-xs text-slate-500">
                    <span>
                        Halaman <b className="text-slate-800 dark:text-white">{safePage}</b> / {totalPages} · {filtered.length} peserta
                        {!pageReady && <span className="ml-2 text-amber-600">· {pageMissing.length} draft belum dibuat di halaman ini</span>}
                    </span>
                    <div className="flex items-center gap-1">
                        <button type="button" disabled={safePage <= 1 || busy} onClick={() => setPage(safePage - 1)} className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Sebelumnya">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button type="button" disabled={safePage >= totalPages || busy} onClick={() => setPage(safePage + 1)} className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Berikutnya">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ---------- Daftar peserta (kartu & DialogSertifikat tidak diubah) ---------- */}
            <div className="grid grid-cols-1 gap-4">
                {pageUsers.length > 0 ? (
                    pageUsers.map((item, i) => {
                        const originalIndex = indexById.get(item.IdUserPelatihan) ?? -1;
                        return (
                            <div key={item.IdUserPelatihan ?? i} className={`group p-5 rounded-[1.5rem] bg-white border ${isPelatih(item) ? "border-violet-100 border-l-4 border-l-violet-400" : "border-slate-100"} hover:border-blue-200 transition-all shadow-sm hover:shadow-md flex flex-col gap-4`}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
                                            {originalIndex !== -1 ? originalIndex + 1 : i + 1}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-black text-slate-900 truncate uppercase leading-none mb-1">{item.Nama}</p>
                                            <p className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                {item.NoRegistrasi}
                                                {isPelatih(item) && (
                                                    <span title="Sertifikat: Sebagai Pelatih / As Trainer" className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-violet-700 ring-1 ring-violet-200 normal-case">
                                                        <GraduationCap className="w-3 h-3" /> Sebagai Pelatih <span className="font-semibold italic opacity-70">As Trainer</span>
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {item.FileSertifikat?.includes("signed") ? (
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                {item.FileSertifikat?.includes("signed") && (
                                    <Link
                                        target="_blank"
                                        href={`${CERT_URL}/sertifikat-ttde/${item.FileSertifikat}`}
                                        className="flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-50/50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group/btn"
                                    >
                                        <RiVerifiedBadgeFill className="h-4 w-4" />
                                        <span>LIHAT e-STTPL</span>
                                        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                )}

                                {item.FileSertifikat && item.StatusPenandatangan == "Spesimen" ? (
                                    <Link
                                        target="_blank"
                                        href={`${CERT_URL}/sertifikat-raw/${item.FileSertifikat}`}
                                        className="flex items-center justify-center gap-2 h-10 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all group/preview border border-slate-100"
                                    >
                                        <FileText className="h-4 w-4 text-slate-400 group-hover/preview:text-white" />
                                        <span>Pratinjau Dokumen</span>
                                        <TbExternalLink className="w-3.5 h-3.5 opacity-50" />
                                    </Link>
                                ) : (
                                    <DialogSertifikatPelatihan ref={refs.current[originalIndex]} pelatihan={data} userPelatihan={item} handleFetchingData={fetchData} isPrint={false} />
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 rounded-3xl border border-dashed border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
                        <Search className="w-5 h-5 text-slate-300" />
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Tidak ada peserta yang cocok</p>
                        {(search || filter || peran) && (
                            <button type="button" onClick={() => { setSearch(""); setFilter(""); setPeran(""); }} className="text-xs font-semibold text-blue-600 hover:underline">
                                Reset filter
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ---------- Dialog tanggal ---------- */}
            <Dialog open={dateOpen} onOpenChange={(o) => !savingDate && setDateOpen(o)}>
                <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-md sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl sm:rounded-3xl border-0 bg-slate-50 dark:bg-slate-950 shadow-2xl [&>button]:hidden">
                    <ModalHeader icon={TbCalendar} eyebrow="Jadwal TTDe" title={hasTanggal ? "Ubah tanggal penandatanganan" : "Tetapkan tanggal penandatanganan"} onClose={() => !savingDate && setDateOpen(false)} />
                    <div className="p-5 space-y-3">
                        <div className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-4 space-y-2">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Tanggal sertifikat</label>
                            <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                disabled={savingDate}
                                className="w-full h-11 px-3.5 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                            {tanggal && <p className="text-xs text-slate-500">Tercetak: <b className="text-slate-800 dark:text-white">{getDateInIndonesianFormat(tanggal)}</b></p>}
                            <p className="text-[11px] text-slate-400">Diterapkan ke {total} orang ({targetLabel}). Pilih sesuai hari penandatanganan digital.</p>
                        </div>
                        {savingDate && <ProgressBar value={dateProgress} label={`Menerapkan tanggal… ${dateProgress}%`} />}
                    </div>
                    <ModalFooter>
                        <button type="button" onClick={() => setDateOpen(false)} disabled={savingDate} className={btnGhost}>Batal</button>
                        <button type="button" onClick={saveTanggal} disabled={savingDate || !tanggal} className={btnPrimary}>
                            {savingDate ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbCheck className="w-4 h-4" />} {savingDate ? "Menyimpan…" : "Simpan tanggal"}
                        </button>
                    </ModalFooter>
                </DialogContent>
            </Dialog>

            {/* ---------- Dialog TTDe ---------- */}
            <Dialog open={signOpen} onOpenChange={(o) => !busy && setSignOpen(o)}>
                <DialogContent
                    onInteractOutside={(e) => busy && e.preventDefault()}
                    className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg sm:max-w-lg p-0 gap-0 overflow-hidden rounded-3xl sm:rounded-3xl border-0 bg-slate-50 dark:bg-slate-950 shadow-2xl [&>button]:hidden"
                >
                    <ModalHeader icon={TbPencilCheck} eyebrow="Otentikasi TTDe" title="Tanda tangan digital e-STTPL" onClose={() => !busy && setSignOpen(false)}>
                        <ol className="mt-4 grid grid-cols-3 gap-2">
                            {["Tanggal", "Draft sertifikat", "Passphrase"].map((label, i) => {
                                const n = i + 1;
                                const done = signStep > n;
                                const active = signStep === n;
                                return (
                                    <li key={label} className={`rounded-xl px-2.5 py-2 ring-1 backdrop-blur-md ${active ? "bg-white/15 ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "bg-white/[0.06] ring-white/10"}`}>
                                        <span className="flex items-center gap-1.5">
                                            <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black ${done ? "bg-emerald-500 text-white" : active ? "bg-white text-[#0B1B3F]" : "bg-white/10 text-blue-100/60"}`}>
                                                {done ? <TbCheck className="w-3 h-3" /> : n}
                                            </span>
                                            <span className={`text-[11px] font-bold truncate ${active ? "text-white" : "text-blue-100/60"}`}>{label}</span>
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </ModalHeader>

                    <div className="p-5">
                        {signStep === 1 && (
                            <div className="rounded-2xl ring-1 ring-amber-200 bg-amber-50/70 dark:bg-amber-950/20 dark:ring-amber-900/40 p-4 flex items-start gap-3">
                                <TbAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Tanggal TTDe belum ditetapkan</p>
                                    <p className="text-xs text-amber-700/80 dark:text-amber-300/80">Tetapkan tanggal sertifikat terlebih dahulu sebelum menandatangani.</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSignOpen(false);
                                            setDateOpen(true);
                                        }}
                                        className="mt-3 h-9 px-3.5 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold inline-flex items-center gap-1.5"
                                    >
                                        <TbCalendar className="w-4 h-4" /> Tetapkan sekarang
                                    </button>
                                </div>
                            </div>
                        )}

                        {signStep === 2 && (
                            <div className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-4 space-y-3">
                                {generating ? (
                                    <ProgressBar value={genProgress} label={`Membuat draft sertifikat ${genCounter}/${genTotal}`} />
                                ) : (
                                    <>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{pageMissing.length} draft belum dibuat di halaman ini</p>
                                        <p className="text-xs text-slate-500">Draft dibuat otomatis sebelum ditandatangani.</p>
                                        <button type="button" onClick={generateDrafts} className={btnPrimary}>
                                            <FileCheck className="w-4 h-4" /> Buat draft sekarang
                                        </button>
                                    </>
                                )}
                                <p className="text-[11px] text-slate-400">Jangan tutup halaman selama proses berjalan.</p>
                            </div>
                        )}

                        {signStep === 3 && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleTTDe();
                                }}
                                className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-4 space-y-3"
                            >
                                <div className="flex items-center gap-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 ring-1 ring-emerald-100 dark:ring-emerald-900/40 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {pageUsers.length} draft di halaman ini siap ditandatangani
                                </div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                    <Key className="w-3.5 h-3.5 text-slate-400" /> Passphrase BSrE
                                </label>
                                <div className="relative">
                                    <input
                                        autoFocus
                                        disabled={signing}
                                        type={showPass ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={passphrase}
                                        onChange={(e) => setPassphrase(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full h-12 pl-3.5 pr-12 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-bold tracking-wider outline-none focus:ring-2 focus:ring-blue-500/30"
                                    />
                                    <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center" aria-label={showPass ? "Sembunyikan" : "Tampilkan"}>
                                        {showPass ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400">Tekan Enter untuk menandatangani.</p>
                            </form>
                        )}
                    </div>

                    <ModalFooter>
                        <button type="button" onClick={() => setSignOpen(false)} disabled={busy} className={btnGhost}>Batal</button>
                        {signStep === 3 && (
                            <button type="button" onClick={handleTTDe} disabled={signing || !passphrase.trim()} className={btnPrimary}>
                                {signing ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbPencilCheck className="w-4 h-4" />} {signing ? "Menandatangani…" : "Tandatangani"}
                            </button>
                        )}
                    </ModalFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

/* ============================ UI ============================ */

const btnPrimary = "h-11 px-5 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-40";
const btnGhost = "h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40";

function HeroStat({ icon: Icon, label, value, sub, pct, accent, warn }: { icon: LucideIcon; label: string; value: string; sub?: string; pct?: number; accent?: string; warn?: boolean }) {
    return (
        <div className={`relative isolate overflow-hidden rounded-2xl px-3.5 py-3 ring-1 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ${warn ? "bg-amber-400/15 ring-amber-300/40" : "bg-white/10 ring-white/15"}`}>
            <Icon aria-hidden className="pointer-events-none absolute -right-2 -bottom-3 -z-10 w-14 h-14 -rotate-12 opacity-15" style={accent ? { color: accent } : undefined} />
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-100/60">{label}</p>
            <p className="text-xl font-black tabular-nums leading-tight">{value}</p>
            {pct !== undefined ? (
                <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, #fff)` }} />
                </div>
            ) : (
                sub && <p className={`text-[10px] ${warn ? "text-amber-200" : "text-blue-100/55"}`}>{sub}</p>
            )}
        </div>
    );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"><TbLoader2 className="w-3.5 h-3.5 animate-spin" /> {label}</span>
                <span className="font-mono font-bold text-slate-500">{Math.round(value)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-[#0B1B3F] transition-all" style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function ModalHeader({ icon: Icon, eyebrow, title, onClose, children }: { icon: React.ElementType; eyebrow: string; title: string; onClose: () => void; children?: React.ReactNode }) {
    return (
        <div className="relative isolate overflow-hidden bg-[#0B1B3F] text-white px-5 py-5">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#10B981_0%,transparent_60%)] opacity-80" />
            <Icon aria-hidden className="pointer-events-none absolute -right-4 -bottom-6 -z-10 w-28 h-28 -rotate-12 text-emerald-300 opacity-20" />
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">{eyebrow}</p>
                    <DialogTitle className="mt-1 text-base font-black text-white leading-snug">{title}</DialogTitle>
                    <DialogDescription className="sr-only">{title}</DialogDescription>
                </div>
                <button type="button" onClick={onClose} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20">
                    <TbX className="w-4 h-4" />
                </button>
            </div>
            {children}
        </div>
    );
}

function ModalFooter({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">{children}</div>;
}

export default TTDeDetail;
