"use client";

import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import { useFetchDataPengajuanPenetapan } from "@/hooks/elaut/p2mkp/useFetchDataPengajuanPenetapan";
import { P2MKP, PengajuanPenetapanP2MKP } from "@/types/p2mkp";
import { P2MKPCertificateAction } from "./P2MKPCertificateAction";
import Toast from "@/commons/Toast";
import { TbCertificate } from "react-icons/tb";
import {
    Building2,
    MapPin,
    Search,
    ChevronLeft,
    ChevronRight,
    Settings,
    Briefcase,
    Phone,
    Mail,
    X,
    Globe,
    Tag,
    Plus,
    RefreshCw,
    AlertCircle,
    BadgeCheck,
    FileWarning,
    LucideIcon,
} from "lucide-react";

/* ============================ HELPERS ============================ */

const fmt = (n: number) => n.toLocaleString("id-ID");
const lc = (s?: string) => (s || "").trim().toLowerCase();
const uniqSorted = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));

const KLASIFIKASI_TONE = (k: string) => {
    const v = k.toLowerCase();
    if (v.includes("utama")) return { dot: "bg-violet-500", cls: "bg-violet-50 text-violet-700 ring-violet-200" };
    if (v.includes("madya")) return { dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    if (v.includes("mula")) return { dot: "bg-blue-500", cls: "bg-blue-50 text-blue-700 ring-blue-200" };
    return { dot: "bg-slate-400", cls: "bg-slate-50 text-slate-700 ring-slate-200" };
};

/** Waktu dibuat dari field yang tersedia (penamaan API bisa beda) */
const createdOf = (r: any): number => {
    const v = r?.created_at ?? r?.CreatedAt ?? r?.createdAt ?? r?.updated_at;
    if (!v) return 0;
    const t = typeof v === "number" ? v : Date.parse(String(v).replace(" ", "T"));
    return isNaN(t) ? 0 : t;
};

type SortKey = "terbaru" | "terlama" | "nama";
type CertFilter = "" | "sistem" | "manual";

type Row = {
    raw: P2MKP;
    id: string;
    nama: string;
    nib: string;
    pj: string;
    telp: string;
    email: string;
    alamat: string;
    kota: string;
    provinsi: string;
    kepemilikan: string;
    klasifikasi: string;
    penetapan?: PengajuanPenetapanP2MKP;
    created: number;
    idNum: number;
    haystack: string;
};

/* ============================ COMPONENT ============================ */

const TableDataP2MKP = () => {
    const { data: p2mkpData, loading, error, fetchP2MKPData } = useFetchDataP2MKP();
    const { data: penetapanData } = useFetchDataPengajuanPenetapan();
    const pathname = usePathname();
    const base = `/admin/${pathname?.includes("lemdiklat") ? "lemdiklat" : "pusat"}/p2mkp/manage`;
    const isSuperAdmin = !!Cookies.get("Access")?.includes("superAdmin");

    /* ---------- Normalisasi sekali (hanya Approved) ---------- */
    const rows: Row[] = useMemo(() => {
        if (!p2mkpData) return [];
        // Map penetapan approved → O(1) lookup (sebelumnya .find() per baris)
        const approvedMap = new Map<string, PengajuanPenetapanP2MKP>();
        (penetapanData || []).forEach((p) => {
            if (lc(p.status) === "approved") approvedMap.set(String(p.id_Ppmkp), p);
        });
        const out: Row[] = [];
        for (const r of p2mkpData) {
            if (lc(r.status) !== "approved") continue;
            const nama = r.nama_ppmkp || r.nama_Ppmkp || "P2MKP Tanpa Nama";
            const klasifikasi = ((r as any).klasifikasi || r.klasiikasi || "").trim();
            const kota = (r.kota || "").trim();
            const provinsi = (r.provinsi || "").trim();
            const kepemilikan = (r.status_kepemilikan || "").trim();
            out.push({
                raw: r,
                id: String(r.IdPpmkp),
                nama,
                nib: r.nib || "",
                pj: r.nama_penanggung_jawab || "",
                telp: r.no_telp || "",
                email: r.email || "",
                alamat: r.alamat || "",
                kota,
                provinsi,
                kepemilikan,
                klasifikasi,
                penetapan: approvedMap.get(String(r.IdPpmkp)),
                created: createdOf(r),
                idNum: Number(r.IdPpmkp) || 0,
                haystack: `${nama} ${r.nib ?? ""} ${r.nama_penanggung_jawab ?? ""} ${provinsi} ${kota} ${r.alamat ?? ""} ${kepemilikan} ${klasifikasi}`.toLowerCase(),
            });
        }
        return out;
    }, [p2mkpData, penetapanData]);

    const summary = useMemo(() => {
        const prov = new Set<string>(), kota = new Set<string>();
        let sistem = 0;
        rows.forEach((r) => {
            if (r.provinsi) prov.add(lc(r.provinsi));
            if (r.kota) kota.add(lc(r.kota));
            if (r.penetapan) sistem++;
        });
        return { provinsi: prov.size, kota: kota.size, sistem, manual: rows.length - sistem };
    }, [rows]);

    /* ---------- Filter ---------- */
    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [kepemilikan, setKepemilikan] = useState("");
    const [klasifikasi, setKlasifikasi] = useState("");
    const [provinsi, setProvinsi] = useState("");
    const [kota, setKota] = useState("");
    const [cert, setCert] = useState<CertFilter>("");
    const [sort, setSort] = useState<SortKey>("terbaru");

    const options = useMemo(
        () => ({
            kepemilikan: uniqSorted(rows.map((r) => r.kepemilikan)),
            klasifikasi: uniqSorted(rows.map((r) => r.klasifikasi)),
            provinsi: uniqSorted(rows.map((r) => r.provinsi)),
        }),
        [rows]
    );
    const kotaOptions = useMemo(() => uniqSorted(rows.filter((r) => !provinsi || lc(r.provinsi) === lc(provinsi)).map((r) => r.kota)), [rows, provinsi]);

    const filtered = useMemo(() => {
        const fk = lc(kepemilikan), fkl = lc(klasifikasi), fp = lc(provinsi), fko = lc(kota);
        const list = rows.filter(
            (r) =>
                (!cert || (cert === "sistem" ? !!r.penetapan : !r.penetapan)) &&
                (!fk || lc(r.kepemilikan) === fk) &&
                (!fkl || lc(r.klasifikasi) === fkl) &&
                (!fp || lc(r.provinsi) === fp) &&
                (!fko || lc(r.kota) === fko) &&
                (!q || r.haystack.includes(q))
        );
        const newest = (a: Row, b: Row) => b.created - a.created || b.idNum - a.idNum;
        if (sort === "nama") list.sort((a, b) => a.nama.localeCompare(b.nama));
        else if (sort === "terlama") list.sort((a, b) => -newest(a, b));
        else list.sort(newest);
        return list;
    }, [rows, q, cert, kepemilikan, klasifikasi, provinsi, kota, sort]);

    const latestIds = useMemo(() => new Set([...rows].sort((a, b) => b.created - a.created || b.idNum - a.idNum).slice(0, 5).map((r) => r.id)), [rows]);

    const resetAll = () => {
        setSearch("");
        setKepemilikan("");
        setKlasifikasi("");
        setProvinsi("");
        setKota("");
        setCert("");
    };
    const hasFilter = !!(search || kepemilikan || klasifikasi || provinsi || kota || cert);

    /* ---------- Pagination ---------- */
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    useEffect(() => setPage(1), [q, cert, kepemilikan, klasifikasi, provinsi, kota, sort, perPage]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * perPage;
    const pageRows = filtered.slice(start, start + perPage);

    // "/" → fokus pencarian
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) {
                e.preventDefault();
                document.getElementById("search-p2mkp")?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const certInfo = () =>
        Toast.fire({
            icon: "info",
            title: "Sertifikat tidak tersedia",
            text: "Penetapan lembaga ini tidak melalui sistem E-LAUT, sehingga sertifikat tidak dapat diakses.",
        });

    const initialLoading = loading && rows.length === 0;
    const sistemPct = rows.length ? (summary.sistem / rows.length) * 100 : 0;

    /* ============================ RENDER ============================ */

    return (
        <div className="space-y-5 pb-10 mt-6">
            {/* ---------- Stats ---------- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {initialLoading ? (
                    [0, 1, 2, 3].map((i) => <div key={i} className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />)
                ) : (
                    <>
                        <StatCard
                            label="P2MKP Ditetapkan"
                            value={fmt(hasFilter ? filtered.length : rows.length)}
                            unit="Lembaga"
                            sub={hasFilter ? `dari ${fmt(rows.length)} lembaga` : `${options.klasifikasi.length} tingkat klasifikasi`}
                            icon={Building2}
                            accent="#3B82F6"
                            active={!cert}
                            onClick={() => setCert("")}
                        />
                        <StatCard label="Cakupan Wilayah" value={fmt(summary.kota)} unit="Kab/Kota" sub={`tersebar di ${fmt(summary.provinsi)} provinsi`} icon={Globe} accent="#06B6D4" />
                        <StatCard
                            label="Sertifikat via Sistem"
                            value={fmt(summary.sistem)}
                            unit="Lembaga"
                            sub={`${sistemPct.toFixed(0)}% penetapan melalui E-LAUT`}
                            icon={BadgeCheck}
                            accent="#10B981"
                            progress={sistemPct}
                            active={cert === "sistem"}
                            onClick={() => setCert(cert === "sistem" ? "" : "sistem")}
                        />
                        <StatCard
                            label="Penetapan Manual"
                            value={fmt(summary.manual)}
                            unit="Lembaga"
                            sub="tanpa sertifikat sistem — klik"
                            icon={FileWarning}
                            accent="#F59E0B"
                            active={cert === "manual"}
                            onClick={() => setCert(cert === "manual" ? "" : "manual")}
                        />
                    </>
                )}
            </div>

            {/* ---------- Toolbar ---------- */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm space-y-2.5">
                <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
                        <input
                            id="search-p2mkp"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari lembaga, NIB, penanggung jawab, atau alamat..."
                            className="pl-11 pr-14 border-none w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 placeholder:font-normal"
                        />
                        {search ? (
                            <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200" aria-label="Hapus pencarian">
                                <X className="w-4 h-4" />
                            </button>
                        ) : (
                            <kbd className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white ring-1 ring-slate-200 text-[10px] font-bold text-slate-400">/</kbd>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                            title="Urutkan"
                            className="h-11 shrink-0 border-none rounded-2xl bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold text-slate-600 outline-none hover:ring-1 hover:ring-slate-200"
                        >
                            <option value="terbaru">Terbaru</option>
                            <option value="terlama">Terlama</option>
                            <option value="nama">Nama A–Z</option>
                        </select>
                        <button type="button" onClick={() => fetchP2MKPData()} disabled={loading} title="Muat ulang" className="h-11 w-11 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:ring-1 hover:ring-slate-200 disabled:opacity-40">
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                        {isSuperAdmin && (
                            <Link href={`${base}/create`} className="h-11 px-5 shrink-0 rounded-2xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-900/20 transition-colors">
                                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Tambah P2MKP</span>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <FilterSelect icon={Briefcase} placeholder="Semua kepemilikan" value={kepemilikan} onChange={setKepemilikan} options={options.kepemilikan} />
                    <FilterSelect icon={Tag} placeholder="Semua klasifikasi" value={klasifikasi} onChange={setKlasifikasi} options={options.klasifikasi} />
                    <FilterSelect
                        icon={Globe}
                        placeholder="Semua provinsi"
                        value={provinsi}
                        onChange={(v) => {
                            setProvinsi(v);
                            setKota("");
                        }}
                        options={options.provinsi}
                    />
                    <FilterSelect icon={MapPin} placeholder="Semua kota/kab" value={kota} onChange={setKota} options={kotaOptions} />
                </div>

                {hasFilter && (
                    <div className="flex flex-wrap items-center gap-1.5 px-1 pb-0.5">
                        {search && <Chip label={`"${search}"`} onClear={() => setSearch("")} />}
                        {cert && <Chip label={cert === "sistem" ? "Sertifikat via sistem" : "Penetapan manual"} onClear={() => setCert("")} />}
                        {kepemilikan && <Chip label={kepemilikan} onClear={() => setKepemilikan("")} />}
                        {klasifikasi && <Chip label={klasifikasi} onClear={() => setKlasifikasi("")} />}
                        {provinsi && <Chip label={provinsi} onClear={() => { setProvinsi(""); setKota(""); }} />}
                        {kota && <Chip label={kota} onClear={() => setKota("")} />}
                        <button type="button" onClick={resetAll} className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 px-1">
                            Reset semua
                        </button>
                        <span className="ml-auto text-[11px] text-slate-400"><b className="text-slate-700 tabular-nums">{fmt(filtered.length)}</b> hasil</span>
                    </div>
                )}
            </div>

            {/* ---------- Tabel ---------- */}
            <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                <th className="w-12 pl-5 pr-2 py-3 text-center font-semibold">No</th>
                                <th className="px-3 py-3 font-semibold min-w-[280px]">Lembaga P2MKP</th>
                                <th className="px-3 py-3 font-semibold min-w-[170px]">Klasifikasi</th>
                                <th className="px-3 py-3 font-semibold min-w-[210px]">Penanggung Jawab</th>
                                <th className="px-3 py-3 font-semibold w-[140px]">Sertifikat</th>
                                <th className="w-[1%] px-5 py-3 text-right font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {initialLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-5 py-3">
                                            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : error && rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16">
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">Gagal memuat data P2MKP</p>
                                            <p className="text-xs text-slate-400 max-w-sm">{String((error as any)?.message || error)}</p>
                                            <button type="button" onClick={() => fetchP2MKPData()} className="mt-2 h-9 px-4 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold">Coba lagi</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16">
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{hasFilter ? "Lembaga tidak ditemukan" : "Belum ada P2MKP yang ditetapkan"}</p>
                                            {hasFilter && (
                                                <button type="button" onClick={resetAll} className="text-xs font-semibold text-blue-600 hover:underline">Reset filter</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map((r, i) => {
                                    const tone = r.klasifikasi ? KLASIFIKASI_TONE(r.klasifikasi) : null;
                                    return (
                                        <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="pl-5 pr-2 py-3.5 text-center text-xs text-slate-400 tabular-nums align-top">{start + i + 1}</td>
                                            <td className="px-3 py-3.5 align-top">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[10px] font-semibold text-slate-400">NIB {r.nib || "—"}</span>
                                                    {latestIds.has(r.id) && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-px rounded-md bg-[#0B1B3F] text-white text-[9px] font-black uppercase">
                                                            <span className="w-1 h-1 rounded-full bg-sky-300 animate-pulse" /> Terbaru
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">{r.nama}</p>
                                                <p className="mt-0.5 flex items-start gap-1 text-[11px] text-slate-400">
                                                    <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">
                                                        {r.alamat && <span className="text-slate-500">{r.alamat} · </span>}
                                                        {[r.kota, r.provinsi].filter(Boolean).join(", ") || "-"}
                                                    </span>
                                                </p>
                                            </td>
                                            <td className="px-3 py-3.5 align-top">
                                                {tone ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ring-1 text-[11px] font-semibold ${tone.cls}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} /> {r.klasifikasi}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-300 italic">Belum ditetapkan</span>
                                                )}
                                                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                                                    <Briefcase className="w-3 h-3 text-slate-400" /> {r.kepemilikan || "Perorangan"}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3.5 align-top">
                                                <div className="flex items-start gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-[#0B1B3F] text-sky-100 flex items-center justify-center text-[11px] font-black shrink-0">
                                                        {(r.pj || "P").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{r.pj || "-"}</p>
                                                        {r.telp && (
                                                            <a href={`tel:${r.telp}`} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600">
                                                                <Phone className="w-3 h-3" /> {r.telp}
                                                            </a>
                                                        )}
                                                        {r.email && (
                                                            <a href={`mailto:${r.email}`} title={r.email} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600 max-w-[180px]">
                                                                <Mail className="w-3 h-3 shrink-0" /> <span className="truncate">{r.email}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 align-top">
                                                {r.penetapan ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Via sistem
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Manual
                                                    </span>
                                                )}
                                                <p className="mt-0.5 text-[10px] text-slate-400">Tahun {r.penetapan?.tahun_penetapan || "-"}</p>
                                            </td>
                                            <td className="px-5 py-3 align-top">
                                                <div className="flex items-center justify-end gap-1">
                                                    {r.penetapan ? (
                                                        <P2MKPCertificateAction p2mkp={r.penetapan as unknown as P2MKP} />
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={certInfo}
                                                            title="Penetapan tidak melalui sistem"
                                                            className="h-8 px-3 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-400 inline-flex items-center gap-1.5 hover:bg-amber-50 hover:text-amber-700 hover:ring-amber-200"
                                                        >
                                                            <TbCertificate className="w-4 h-4" /> Sertifikat
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`${base}/${r.id}`}
                                                        className="h-8 px-3 rounded-lg bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors group/btn"
                                                    >
                                                        <Settings className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:rotate-90" /> Kelola
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ---------- Pagination ---------- */}
                {filtered.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                            <span>
                                <b className="text-slate-800 dark:text-white tabular-nums">{start + 1}–{Math.min(start + perPage, filtered.length)}</b> dari <b className="tabular-nums">{fmt(filtered.length)}</b>
                            </span>
                            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 px-2 text-xs font-semibold outline-none ring-1 ring-slate-200 dark:ring-slate-700 border-none">
                                {[10, 25, 50, 100].map((n) => (
                                    <option key={n} value={n}>{n} / hal</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Sebelumnya">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {pageList(safePage, totalPages).map((p, i) =>
                                p === "…" ? (
                                    <span key={`e${i}`} className="px-1 text-slate-300">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPage(p)}
                                        className={`h-8 min-w-8 px-2 rounded-lg text-xs font-bold tabular-nums ${p === safePage ? "bg-[#0B1B3F] text-white" : "hover:bg-slate-100 text-slate-600"}`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                            <button type="button" onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages} className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Berikutnya">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableDataP2MKP;

/* ============================ UI ============================ */

function pageList(cur: number, total: number): (number | "…")[] {
    const out: (number | "…")[] = [];
    for (let p = 1; p <= total; p++) {
        if (p === 1 || p === total || Math.abs(p - cur) <= 1) {
            const prev = out[out.length - 1];
            if (typeof prev === "number" && p - prev > 1) out.push("…");
            out.push(p);
        }
    }
    return out;
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 text-[11px] font-semibold">
            {label}
            <button type="button" onClick={onClear} className="p-0.5 rounded-full hover:bg-blue-100" aria-label={`Hapus ${label}`}>
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}

function FilterSelect({ icon: Icon, placeholder, value, onChange, options }: { icon: LucideIcon; placeholder: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <div className="relative">
            <Icon className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${value ? "text-sky-200" : "text-slate-400"}`} />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={!options.length}
                className={`w-full border-none h-10 pl-9 pr-3 rounded-xl text-xs font-semibold outline-none truncate transition-colors disabled:opacity-50 ${value ? "bg-[#0B1B3F] text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"}`}
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </div>
    );
}

function StatCard({
    label,
    value,
    unit,
    sub,
    icon: Icon,
    accent,
    progress,
    active,
    onClick,
}: {
    label: string;
    value: string;
    unit: string;
    sub?: string;
    icon: LucideIcon;
    accent: string;
    progress?: number;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className={`group relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 text-left text-white ring-1 transition-all duration-300 ${onClick ? "hover:-translate-y-0.5 cursor-pointer" : "cursor-default"} ${active ? "ring-2 ring-white/50 shadow-xl" : "ring-white/10 shadow-lg"}`}
            style={{ boxShadow: active ? `0 18px 40px -16px ${accent}` : undefined }}
        >
            <div className="absolute inset-0 -z-10 opacity-90" style={{ background: `radial-gradient(70% 90% at 100% 0%, ${accent}66 0%, transparent 60%), radial-gradient(60% 80% at 0% 100%, #2563EB55 0%, transparent 60%)` }} />
            <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
            <div
                className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ease-out ${active ? "opacity-70" : "opacity-0 group-hover:opacity-100"}`}
                style={{ background: `linear-gradient(to left, ${accent}59 0%, ${accent}26 35%, transparent 75%)` }}
            />
            <Icon
                aria-hidden
                strokeWidth={1.5}
                className={`pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 ${active ? "opacity-40" : "opacity-20 group-hover:opacity-40"}`}
                style={{ color: accent, filter: `drop-shadow(0 0 24px ${accent}66)` }}
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/75 pr-10">{label}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl md:text-4xl font-black tracking-[-0.03em] tabular-nums">{value}</span>
                <span className="text-[10px] font-bold uppercase text-sky-100/70">{unit}</span>
            </div>
            {progress !== undefined && (
                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #fff)` }} />
                </div>
            )}
            {sub && <p className="mt-2 text-[11px] font-medium text-blue-100/60 truncate">{sub}</p>}
        </button>
    );
}
