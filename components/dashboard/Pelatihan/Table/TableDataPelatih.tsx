"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    TbSearch,
    TbFilter,
    TbDotsVertical,
    TbCertificate,
    TbChartPie,
    TbSchool,
    TbBriefcase,
    TbBuildingSkyscraper,
    TbPhone,
    TbId,
    TbUser,
    TbFileSpreadsheet,
    TbX,
    TbChevronLeft,
    TbChevronRight,
    TbRefresh,
    TbUsers,
    TbCircleCheck,
    TbFolderCheck,
} from "react-icons/tb";
import { IconType } from "react-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useFetchDataInstruktur } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { Instruktur } from "@/types/instruktur";
import { UnitKerja } from "@/types/master";
import AddInstrukturAction from "@/commons/actions/instruktur/AddInstrukturAction";
import UpdateInstrukturAction from "@/commons/actions/instruktur/UpdateInstrukturAction";
import DeleteInstrukturAction from "@/commons/actions/instruktur/DeleteInstrukturAction";
import { exportInstrukturToExcel } from "@/lib/exportToExcel";
import StatsInstruktur from "../StatsInstruktur";

/* ============================ HELPERS ============================ */

const ACTIVE_STATUS = new Set(["Active", "Aktif", "PNS"]);
const INACTIVE_STATUS = new Set(["Non Aktif", "No Active"]);

const statusTone = (s?: string) =>
    ACTIVE_STATUS.has(s || "")
        ? { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" }
        : INACTIVE_STATUS.has(s || "")
            ? { pill: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" }
            : s === "Tugas Belajar"
                ? { pill: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" }
                : { pill: "bg-slate-50 text-slate-600 ring-slate-200", dot: "bg-slate-400" };

const uniq = (arr: (string | undefined | null)[]) =>
    Array.from(new Set(arr.filter((v): v is string => !!v && v.trim() !== ""))).sort((a, b) => a.localeCompare(b));

const initials = (name = "") =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

const fmt = (n: number) => n.toLocaleString("id-ID");

const pct = (n: number, t: number) => (t > 0 ? Math.round((n / t) * 100) : 0);

const PAGE_SIZES = [10, 25, 50];

type QuickFilter = "" | "aktif" | "mot" | "berkas";
const QUICK_LABEL: Record<Exclude<QuickFilter, "">, string> = {
    aktif: "Status aktif",
    mot: "Punya MOT",
    berkas: "Berkas lengkap",
};

/* ============================ PAGE ============================ */

const TableDataPelatih = () => {
    const { instrukturs, loading, fetchInstrukturData, stats } = useFetchDataInstruktur();
    const [showCharts, setShowCharts] = useState(false);

    useEffect(() => {
        fetchInstrukturData();
    }, [fetchInstrukturData]);

    return (
        <div className="space-y-6 pb-20">
            <InstrukturTable
                data={instrukturs}
                loading={loading}
                fetchData={fetchInstrukturData}
                showCharts={showCharts}
                onToggleCharts={() => setShowCharts((v) => !v)}
            />

            <AnimatePresence initial={false}>
                {showCharts && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <StatsInstruktur data={instrukturs} stats={stats} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ============================ TABLE ============================ */

type Props = {
    data: Instruktur[];
    loading: boolean;
    fetchData: () => void | Promise<unknown>;
    showCharts: boolean;
    onToggleCharts: () => void;
};

function InstrukturTable({ data, loading, fetchData, showCharts, onToggleCharts }: Props) {
    const { unitKerjas, fetchUnitKerjaData } = useFetchDataUnitKerja();
    useEffect(() => {
        fetchUnitKerjaData();
    }, [fetchUnitKerjaData]);

    /* ---------- State filter ---------- */
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());
    const [filterKeahlian, setFilterKeahlian] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPendidikan, setFilterPendidikan] = useState("");
    const [filterJabatan, setFilterJabatan] = useState("");
    const [filterUnitKerja, setFilterUnitKerja] = useState("");
    const [quick, setQuick] = useState<QuickFilter>("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Shortcut "/" → fokus pencarian
    const searchRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* ---------- Lookup unit kerja O(1) ---------- */
    const unitName = useMemo(() => {
        const m = new Map<string, string>();
        (unitKerjas || []).forEach((u: UnitKerja) => m.set(String(u.id_unit_kerja), u.nama));
        return m;
    }, [unitKerjas]);

    /* ---------- Index sekali per data: sort + teks pencarian ---------- */
    const indexed = useMemo(
        () =>
            [...data]
                .sort((a, b) => (a.nama || "").localeCompare(b.nama || ""))
                .map((row) => ({
                    row,
                    unit: unitName.get(String(row.id_lemdik)) || "-",
                    haystack: [row.nama, row.nip, row.no_telpon, row.bidang_keahlian, row.jenjang_jabatan, row.pendidikkan_terakhir, row.status, unitName.get(String(row.id_lemdik))]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase(),
                })),
        [data, unitName]
    );

    const options = useMemo(
        () => ({
            keahlian: uniq(data.map((d) => d.bidang_keahlian)),
            status: uniq(data.map((d) => d.status)),
            pendidikan: uniq(data.map((d) => d.pendidikkan_terakhir)),
            jabatan: uniq(data.map((d) => d.jenjang_jabatan)),
        }),
        [data]
    );

    /* ---------- Filter + ringkasan (1 loop) ---------- */
    const { rows, summary } = useMemo(() => {
        const out: typeof indexed = [];
        let total = 0, aktif = 0, mot = 0, berkas = 0;
        for (const it of indexed) {
            const r = it.row;
            if (filterKeahlian && r.bidang_keahlian !== filterKeahlian) continue;
            if (filterStatus && r.status !== filterStatus) continue;
            if (filterPendidikan && r.pendidikkan_terakhir !== filterPendidikan) continue;
            if (filterJabatan && r.jenjang_jabatan !== filterJabatan) continue;
            if (filterUnitKerja && String(r.id_lemdik) !== filterUnitKerja) continue;
            if (deferredSearch && !it.haystack.includes(deferredSearch)) continue;

            // Ringkasan dihitung sebelum filter cepat → angka kartu tetap stabil
            const isAktif = ACTIVE_STATUS.has(r.status);
            const hasMot = !!r.management_of_training;
            const isLengkap = hasMot && !!r.link_data_dukung_sertifikat;
            total++;
            if (isAktif) aktif++;
            if (hasMot) mot++;
            if (isLengkap) berkas++;

            if (quick === "aktif" && !isAktif) continue;
            if (quick === "mot" && !hasMot) continue;
            if (quick === "berkas" && !isLengkap) continue;
            out.push(it);
        }
        return { rows: out, summary: { total, aktif, mot, berkas } };
    }, [indexed, filterKeahlian, filterStatus, filterPendidikan, filterJabatan, filterUnitKerja, deferredSearch, quick]);

    // Reset ke halaman 1 saat filter berubah
    useEffect(() => setPage(1), [filterKeahlian, filterStatus, filterPendidikan, filterJabatan, filterUnitKerja, deferredSearch, pageSize, quick]);

    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pageRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
    const fromIdx = rows.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const toIdx = Math.min(safePage * pageSize, rows.length);

    /* ---------- Chip filter aktif ---------- */
    const chips = [
        filterUnitKerja && { key: "unit", label: unitName.get(filterUnitKerja) || "Unit", clear: () => setFilterUnitKerja("") },
        filterKeahlian && { key: "keahlian", label: filterKeahlian, clear: () => setFilterKeahlian("") },
        filterJabatan && { key: "jabatan", label: filterJabatan, clear: () => setFilterJabatan("") },
        filterPendidikan && { key: "pendidikan", label: filterPendidikan, clear: () => setFilterPendidikan("") },
    ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

    if (quick) chips.unshift({ key: "quick", label: QUICK_LABEL[quick], clear: () => setQuick("") });

    const advancedCount = chips.filter((c) => c.key !== "quick").length;
    const hasAnyFilter = chips.length > 0 || !!filterStatus || !!search;

    const clearFilters = () => {
        setFilterKeahlian("");
        setFilterStatus("");
        setFilterPendidikan("");
        setFilterJabatan("");
        setFilterUnitKerja("");
        setSearch("");
        setQuick("");
    };

    const handleDownloadExcel = () => {
        exportInstrukturToExcel(
            rows.map((r) => r.row),
            (idLemdik) => unitName.get(String(idLemdik)) || ""
        );
    };

    const initialLoading = loading && data.length === 0;

    /* ============================ RENDER ============================ */

    return (
        <div className="space-y-5">
            {/* ─── Statistik (gaya hero) ─────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {initialLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />)
                ) : (
                    <>
                        <StatCard
                            label="Total Tenaga Pelatih"
                            value={summary.total}
                            unit="Orang"
                            sub={hasAnyFilter ? "sesuai filter aktif" : "instruktur & pelatih terdaftar"}
                            icon={TbUsers}
                            accent="#3B82F6"
                            active={!quick}
                            onClick={() => setQuick("")}
                        />
                        <StatCard
                            label="Status Aktif"
                            value={summary.aktif}
                            unit="Orang"
                            sub={`${pct(summary.aktif, summary.total)}% siap penugasan`}
                            icon={TbCircleCheck}
                            accent="#10B981"
                            progress={pct(summary.aktif, summary.total)}
                            active={quick === "aktif"}
                            onClick={() => setQuick(quick === "aktif" ? "" : "aktif")}
                        />
                        <StatCard
                            label="Punya MOT"
                            value={summary.mot}
                            unit="Orang"
                            sub={`${pct(summary.mot, summary.total)}% memiliki Management of Training`}
                            icon={TbCertificate}
                            accent="#8B5CF6"
                            progress={pct(summary.mot, summary.total)}
                            active={quick === "mot"}
                            onClick={() => setQuick(quick === "mot" ? "" : "mot")}
                        />
                        <StatCard
                            label="Berkas Lengkap"
                            value={summary.berkas}
                            unit="Orang"
                            sub={summary.total - summary.berkas > 0 ? `${fmt(summary.total - summary.berkas)} belum lengkap` : "semua berkas lengkap"}
                            icon={TbFolderCheck}
                            accent="#F59E0B"
                            progress={pct(summary.berkas, summary.total)}
                            active={quick === "berkas"}
                            onClick={() => setQuick(quick === "berkas" ? "" : "berkas")}
                        />
                    </>
                )}
            </div>

            {/* ─── Toolbar ────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm">
                <div className="relative flex-1 group">
                    <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Cari nama, NIP, telepon, keahlian, unit kerja..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 pr-12 w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none border-none ring-0 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                    {search ? (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                            aria-label="Hapus pencarian"
                        >
                            <TbX className="w-4 h-4" />
                        </button>
                    ) : (
                        <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 px-2 items-center rounded-md border border-slate-200 bg-white text-[10px] font-bold text-slate-400">/</kbd>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <FilterDropdown
                        filterKeahlian={filterKeahlian}
                        setFilterKeahlian={setFilterKeahlian}
                        bidangKeahlianOptions={options.keahlian}
                        filterJabatan={filterJabatan}
                        setFilterJabatan={setFilterJabatan}
                        jabatanOptions={options.jabatan}
                        filterPendidikan={filterPendidikan}
                        setFilterPendidikan={setFilterPendidikan}
                        pendidikanOptions={options.pendidikan}
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                        statusOptions={options.status}
                        filterUnitKerja={filterUnitKerja}
                        setFilterUnitKerja={setFilterUnitKerja}
                        unitKerjaOptions={unitKerjas || []}
                        clearFilters={clearFilters}
                        hasActiveFilters={advancedCount > 0 || !!filterStatus}
                        activeCount={advancedCount + (filterStatus ? 1 : 0)}
                    />

                    <ToolbarButton onClick={onToggleCharts} active={showCharts} title="Tampilkan statistik">
                        <TbChartPie className="w-4 h-4" />
                        <span className="hidden sm:inline">Statistik</span>
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={handleDownloadExcel}
                        disabled={rows.length === 0}
                        title={rows.length === 0 ? "Tidak ada data untuk diunduh" : `Unduh ${rows.length} data instruktur`}
                        className="text-emerald-700 hover:bg-emerald-50 hover:ring-emerald-200"
                    >
                        <TbFileSpreadsheet className="w-4 h-4" />
                        <span className="hidden sm:inline">Excel</span>
                    </ToolbarButton>

                    <ToolbarButton onClick={() => fetchData()} disabled={loading} title="Muat ulang data">
                        <TbRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </ToolbarButton>

                    <AddInstrukturAction onSuccess={fetchData} />
                </div>
            </div>

            {/* ─── Status pills + chips ─────────────────────────────────────── */}
            {options.status.length > 0 && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
                        {["", ...options.status].map((s) => {
                            const isActive = filterStatus === s;
                            const tone = statusTone(s);
                            return (
                                <button
                                    key={s || "all"}
                                    type="button"
                                    onClick={() => setFilterStatus(isActive && s ? "" : s)}
                                    className={`inline-flex items-center gap-2 h-8 px-3.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ring-1 ${isActive
                                        ? "bg-[#0B1B3F] text-white ring-[#0B1B3F] shadow-md shadow-blue-900/20"
                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-800 hover:ring-slate-300"
                                        }`}
                                >
                                    {s && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-sky-300" : tone.dot}`} />}
                                    {s || "Semua Status"}
                                </button>
                            );
                        })}
                    </div>

                    {(chips.length > 0 || hasAnyFilter) && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            {chips.map((c) => (
                                <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold max-w-[220px]">
                                    <span className="truncate">{c.label}</span>
                                    <button type="button" onClick={c.clear} className="p-0.5 rounded-full hover:bg-blue-100" aria-label={`Hapus filter ${c.label}`}>
                                        <TbX className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {hasAnyFilter && (
                                <button type="button" onClick={clearFilters} className="text-[11px] font-bold text-rose-500 hover:text-rose-600 ml-1">
                                    Reset semua
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ─── Table ──────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-100 dark:border-slate-800">
                                {["No", "Instruktur", "Unit Kerja & Jabatan", "Kompetensi", "Pendidikan", "Status", "Berkas", ""].map((h, i) => (
                                    <th
                                        key={i}
                                        className={`px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap ${i === 0 || i >= 3 ? "text-center" : ""}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800">
                            {initialLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={8} className="px-5 py-3">
                                            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : pageRows.length > 0 ? (
                                pageRows.map(({ row, unit }, index) => {
                                    const tone = statusTone(row.status);
                                    return (
                                        <tr key={row.IdInstruktur} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group/row">
                                            <td className="px-5 py-4 text-center text-xs font-bold text-slate-400 tabular-nums">{fromIdx + index}</td>

                                            <td className="px-5 py-4 min-w-[240px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                                                        {initials(row.nama)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-black text-slate-800 dark:text-white leading-tight truncate group-hover/row:text-blue-600 transition-colors">
                                                            {row.nama}
                                                        </p>
                                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-semibold text-slate-400">
                                                            <span className="flex items-center gap-1"><TbId size={12} /> {row.nip || "-"}</span>
                                                            {row.no_telpon && (
                                                                <a href={`tel:${row.no_telpon}`} className="flex items-center gap-1 hover:text-blue-600">
                                                                    <TbPhone size={12} /> {row.no_telpon}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 max-w-[260px]">
                                                <div className="flex items-start gap-2">
                                                    <TbBuildingSkyscraper className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-snug line-clamp-2" title={unit}>
                                                        {unit}
                                                    </span>
                                                </div>
                                                <Badge variant="secondary" className="mt-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 border-none text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                                    {row.jenjang_jabatan || "Umum"}
                                                </Badge>
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                {row.bidang_keahlian ? (
                                                    <span className="inline-block max-w-[180px] truncate rounded-lg bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-[10px] font-black text-blue-700 dark:text-blue-300" title={row.bidang_keahlian}>
                                                        {row.bidang_keahlian}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-700 dark:text-slate-200">
                                                    <TbSchool className="w-3.5 h-3.5 text-violet-500" />
                                                    {row.pendidikkan_terakhir || "-"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ring-1 whitespace-nowrap ${tone.pill}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                                                    {row.status || "-"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <FileLink href={row.management_of_training} label="Management of Training" icon={<TbCertificate className="w-4 h-4" />} tone="indigo" />
                                                    <FileLink href={row.link_data_dukung_sertifikat} label="Data dukung sertifikat" icon={<TbBriefcase className="w-4 h-4" />} tone="orange" />
                                                </div>
                                            </td>

                                            <td className="px-3 py-4 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100" aria-label="Opsi">
                                                            <TbDotsVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-xl p-2 z-[9999] bg-white/95 backdrop-blur-xl">
                                                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Opsi Tindakan</DropdownMenuLabel>
                                                        <div className="space-y-1">
                                                            <UpdateInstrukturAction onSuccess={fetchData} instruktur={row} />
                                                            <DeleteInstrukturAction onSuccess={fetchData} instruktur={row} />
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20">
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <TbUser className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                                                {hasAnyFilter ? "Tidak ada instruktur yang cocok" : "Belum ada data instruktur"}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {hasAnyFilter ? "Coba ubah kata kunci atau filter." : "Tambahkan instruktur pertama Anda."}
                                            </p>
                                            {hasAnyFilter && (
                                                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 rounded-xl text-xs">
                                                    Hapus semua filter
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {rows.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>
                                Menampilkan <b className="text-slate-800 dark:text-white tabular-nums">{fromIdx}–{toIdx}</b> dari{" "}
                                <b className="tabular-nums">{fmt(rows.length)}</b>
                            </span>
                            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                                <SelectTrigger className="h-8 w-[84px] rounded-lg text-xs font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {PAGE_SIZES.map((s) => (
                                        <SelectItem key={s} value={String(s)} className="text-xs">{s} / hal</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
                    </div>
                )}
            </div>
        </div>
    );
}

/* ============================ UI KECIL ============================ */

/** Kartu statistik bergaya hero: navy mesh + ikon besar di kanan + cahaya hover kanan→kiri */
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
    value: number;
    unit: string;
    sub?: string;
    icon: IconType;
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
            <div
                className="absolute inset-0 -z-10 opacity-90"
                style={{ background: `radial-gradient(70% 90% at 100% 0%, ${accent}66 0%, transparent 60%), radial-gradient(60% 80% at 0% 100%, #2563EB55 0%, transparent 60%)` }}
            />
            <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />

            {/* Cahaya lembut kanan → kiri saat hover / aktif */}
            <div
                className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ease-out ${active ? "opacity-70" : "opacity-0 group-hover:opacity-100"}`}
                style={{ background: `linear-gradient(to left, ${accent}59 0%, ${accent}26 35%, transparent 75%)` }}
            />

            {/* Ikon besar sebagai background di kanan */}
            <Icon
                aria-hidden
                className={`pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 ${active ? "opacity-40" : "opacity-20 group-hover:opacity-40"}`}
                style={{ color: accent, filter: `drop-shadow(0 0 24px ${accent}66)` }}
            />

            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/75 pr-10">{label}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl md:text-4xl font-black tracking-[-0.03em] tabular-nums">{fmt(value)}</span>
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

function ToolbarButton({
    children,
    active,
    className = "",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
    return (
        <button
            type="button"
            {...props}
            className={`h-11 px-4 rounded-2xl text-xs font-bold flex items-center gap-2 ring-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${active
                ? "bg-[#0B1B3F] text-white ring-[#0B1B3F] shadow-md shadow-blue-900/20"
                : `bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-transparent hover:ring-slate-200 ${className}`
                }`}
        >
            {children}
        </button>
    );
}

function FileLink({ href, label, icon, tone }: { href?: string; label: string; icon: React.ReactNode; tone: "indigo" | "orange" }) {
    const cls =
        tone === "indigo"
            ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
            : "bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white";
    return href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" title={label} aria-label={label} className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${cls}`}>
            {icon}
        </a>
    ) : (
        <span title={`${label} belum diunggah`} className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center">
            {icon}
        </span>
    );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
    const pages = useMemo(() => {
        const set = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages));
        const sorted = Array.from(set).sort((a, b) => a - b);
        const out: (number | "…")[] = [];
        sorted.forEach((p, i) => {
            if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
            out.push(p);
        });
        return out;
    }, [page, totalPages]);

    const btn = "h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all";

    return (
        <div className="flex items-center gap-1">
            <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className={`${btn} text-slate-500 hover:bg-slate-100 disabled:opacity-30`} aria-label="Sebelumnya">
                <TbChevronLeft className="w-4 h-4 mx-auto" />
            </button>
            {pages.map((p, i) =>
                p === "…" ? (
                    <span key={`e${i}`} className="px-1 text-xs text-slate-400">…</span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        aria-current={p === page ? "page" : undefined}
                        className={`${btn} tabular-nums ${p === page ? "bg-[#0B1B3F] text-white shadow-md shadow-blue-900/20" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                        {p}
                    </button>
                )
            )}
            <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={`${btn} text-slate-500 hover:bg-slate-100 disabled:opacity-30`} aria-label="Berikutnya">
                <TbChevronRight className="w-4 h-4 mx-auto" />
            </button>
        </div>
    );
}

/* ============================ FILTER DROPDOWN ============================ */

type FilterSelectProps = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    allLabel: string;
};

function FilterSelect({ label, value, onChange, options, allLabel }: FilterSelectProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            {/* "all" ↔ "" supaya pilihan "Semua" benar-benar menghapus filter */}
            <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-transparent font-bold text-xs focus:ring-2 focus:ring-blue-500/10">
                    <SelectValue placeholder={allLabel} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl max-h-64">
                    <SelectItem value="all" className="font-bold text-xs">{allLabel}</SelectItem>
                    {options.map((o) => (
                        <SelectItem key={o.value} value={o.value} className="font-medium text-xs">{o.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

const toOpts = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

export function FilterDropdown({
    filterKeahlian,
    setFilterKeahlian,
    bidangKeahlianOptions,
    filterJabatan,
    setFilterJabatan,
    jabatanOptions,
    filterPendidikan,
    setFilterPendidikan,
    pendidikanOptions,
    filterStatus,
    setFilterStatus,
    statusOptions,
    filterUnitKerja,
    setFilterUnitKerja,
    unitKerjaOptions,
    clearFilters,
    hasActiveFilters,
    activeCount,
}: any) {
    const [open, setOpen] = useState(false);
    const unitOpts = useMemo(
        () => (unitKerjaOptions || []).map((u: UnitKerja) => ({ value: String(u.id_unit_kerja), label: u.nama })),
        [unitKerjaOptions]
    );

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={`h-11 px-4 rounded-2xl font-bold text-xs flex items-center gap-2 ring-1 transition-all ${hasActiveFilters
                        ? "bg-[#0B1B3F] text-white ring-[#0B1B3F] shadow-md shadow-blue-900/20"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-transparent hover:ring-slate-200"
                        }`}
                >
                    <TbFilter className="w-4 h-4" />
                    Filter
                    {hasActiveFilters && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-sky-400 text-[#0B1B3F] text-[10px] font-black flex items-center justify-center">
                            {activeCount ?? "•"}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border-none bg-white/95 backdrop-blur-xl z-[9999]" align="end">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Filter Data</h4>
                    {hasActiveFilters && (
                        <button className="text-[11px] font-bold text-rose-500 hover:text-rose-600" onClick={clearFilters}>
                            Reset
                        </button>
                    )}
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    <FilterSelect label="Unit Kerja" value={filterUnitKerja} onChange={setFilterUnitKerja} options={unitOpts} allLabel="Semua Unit" />
                    <FilterSelect label="Keahlian" value={filterKeahlian} onChange={setFilterKeahlian} options={toOpts(bidangKeahlianOptions || [])} allLabel="Semua Keahlian" />
                    <FilterSelect label="Jabatan" value={filterJabatan} onChange={setFilterJabatan} options={toOpts(jabatanOptions || [])} allLabel="Semua Jabatan" />
                    <div className="grid grid-cols-2 gap-3">
                        <FilterSelect label="Pendidikan" value={filterPendidikan} onChange={setFilterPendidikan} options={toOpts(pendidikanOptions || [])} allLabel="Semua" />
                        <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={toOpts(statusOptions || [])} allLabel="Semua" />
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default TableDataPelatih;
