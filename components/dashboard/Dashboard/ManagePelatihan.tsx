"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { TbSettings } from "react-icons/tb";
import {
    ChevronLeft,
    School,
    ShieldCheck,
    Lock,
    Info,
    Check,
    ArrowRight,
    Save,
    Loader2,
    Search,
    Building2,
    Users,
    X,
    UserCheck,
    ClipboardList,
    BadgeCheck,
    Hash,
    LucideIcon,
} from "lucide-react";

import { decryptValue } from "@/lib/utils";
import { getStatusInfo } from "@/utils/text";
import { elautBaseUrl } from "@/constants/urls";
import Toast from "@/commons/Toast";
import HistoryButton from "@/commons/actions/HistoryButton";
import { useFetchDataPelatihanMasyarakatDetail } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarkatDetail";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import PelatihanDetail from "./PelatihanDetail";
import STTPLDetail from "./STTPLDetail";
import PendingPelatihanQueue, { QueueRole, getQueueRole } from "./PendingPelatihanQueue";

/* ============================ STATUS ============================ */

type Category = "Penyelenggaraan" | "STTPL" | "Kabalai" | "Kapus" | "Kabadan";

interface StatusOptionItem {
    value: string;
    category: Category;
    description: string;
}

const CATEGORY_META: Record<Category, { label: string; range: string; accent: string }> = {
    Penyelenggaraan: { label: "Penyelenggaraan", range: "0–5", accent: "#3B82F6" },
    STTPL: { label: "Verifikasi STTPL", range: "6–7", accent: "#8B5CF6" },
    Kabalai: { label: "TTD Kabalai", range: "7A–7D", accent: "#06B6D4" },
    Kapus: { label: "TTD Kapus", range: "8–11", accent: "#10B981" },
    Kabadan: { label: "TTD Kabadan", range: "12–15", accent: "#F59E0B" },
};
const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

const ALL_STATUS: StatusOptionItem[] = [
    { value: "0", category: "Penyelenggaraan", description: "Draft Awal Pelatihan" },
    { value: "0.1", category: "Penyelenggaraan", description: "Pengisian Peserta Pelatihan" },
    { value: "1", category: "Penyelenggaraan", description: "Pengajuan Verifikasi Lemdiklat" },
    { value: "1.1", category: "Penyelenggaraan", description: "Verifikasi Berkas Lemdiklat" },
    { value: "1.2", category: "Penyelenggaraan", description: "Revisi Berkas Lemdiklat" },
    { value: "1.25", category: "Penyelenggaraan", description: "Verifikasi Ulang Lemdiklat" },
    { value: "2", category: "Penyelenggaraan", description: "Pelatihan Disetujui" },
    { value: "3", category: "Penyelenggaraan", description: "Pelatihan Berlangsung" },
    { value: "4", category: "Penyelenggaraan", description: "Pelatihan Selesai" },
    { value: "5", category: "Penyelenggaraan", description: "Pelaporan Penyelenggaraan" },
    { value: "6", category: "STTPL", description: "Pengajuan Verifikasi e-STTPL Pusat" },
    { value: "7", category: "STTPL", description: "Verifikasi e-STTPL Disetujui Pusat" },
    { value: "7A", category: "Kabalai", description: "Draf Penandatanganan Kabalai" },
    { value: "7B", category: "Kabalai", description: "Proses TTD BSrE Kabalai" },
    { value: "7C", category: "Kabalai", description: "Selesai TTD Kabalai" },
    { value: "7D", category: "Kabalai", description: "Revisi Penandatanganan Kabalai" },
    { value: "8", category: "Kapus", description: "Usulan Penandatanganan Kapus" },
    { value: "9", category: "Kapus", description: "Proses TTD BSrE Kapus" },
    { value: "10", category: "Kapus", description: "Selesai TTD Kapus" },
    { value: "11", category: "Kapus", description: "Revisi Penandatanganan Kapus" },
    { value: "12", category: "Kabadan", description: "Usulan Penandatanganan Kabadan" },
    { value: "13", category: "Kabadan", description: "Proses TTD BSrE Kabadan" },
    { value: "14", category: "Kabadan", description: "Selesai TTD Kabadan" },
    { value: "15", category: "Kabadan", description: "Revisi Penandatanganan Kabadan" },
];
const STATUS_BY_VALUE = new Map(ALL_STATUS.map((s) => [s.value, s]));

// Label status dihitung sekali (bukan tiap render / tiap ketikan)
const STATUS_INDEXED = ALL_STATUS.map((s) => {
    const label = getStatusInfo(s.value).label;
    return { ...s, label, haystack: `${s.value} ${label} ${CATEGORY_META[s.category].label} ${s.description}`.toLowerCase() };
});

/** Fase ringkas di hero (Kabalai & Kapus = satu fase TTD, tergantung penyelenggara) */
const PHASES: { label: string; accent: string; cats: Category[] }[] = [
    { label: "Penyelenggaraan", accent: "#3B82F6", cats: ["Penyelenggaraan"] },
    { label: "Verifikasi STTPL", accent: "#8B5CF6", cats: ["STTPL"] },
    { label: "TTD Kabalai / Kapus", accent: "#10B981", cats: ["Kabalai", "Kapus"] },
    { label: "TTD Kabadan", accent: "#F59E0B", cats: ["Kabadan"] },
];

/** e-STTPL terbuka mulai stage 5 (termasuk 7A dst.) */
const sttplOpen = (status?: string) => {
    const n = parseFloat(String(status ?? ""));
    return !isNaN(n) && n >= 5;
};

/* ============================ KOMPONEN ============================ */

const ManagePelatihan = () => {
    const router = useRouter();
    const paths = (usePathname() || "").split("/");
    const idPelatihan = decryptValue(paths[paths.length - 1]);

    const { data, loading, refetch } = useFetchDataPelatihanMasyarakatDetail(idPelatihan);
    const { adminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan ?? "");

    const [activeTab, setActiveTab] = useState("1");
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [queueRole, setQueueRole] = useState<QueueRole | null>(null);

    useEffect(() => {
        setIsSuperAdmin((Cookies.get("Access") ?? "").includes("superAdmin"));
        setQueueRole(getQueueRole()); // sama dengan logika antrian & lonceng notifikasi
    }, []);

    // Tab awal ditentukan sekali per pelatihan → refetch tidak melempar user ke tab lain
    const initFor = useRef<string | null>(null);
    useEffect(() => {
        if (!data || initFor.current === idPelatihan) return;
        initFor.current = idPelatihan;
        setActiveTab(sttplOpen(data.StatusPenerbitan) ? "2" : "1");
    }, [data, idPelatihan]);

    /* ---------- Loading ---------- */
    if (loading && !data) {
        return (
            <section className="pb-10 flex flex-col gap-5 w-full animate-pulse">
                <div className="h-10 w-40 rounded-xl bg-slate-200/70 dark:bg-slate-800" />
                <div className="h-44 rounded-3xl bg-slate-200/70 dark:bg-slate-800" />
                <div className="h-16 rounded-[1.75rem] bg-slate-200/70 dark:bg-slate-800" />
                <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
            </section>
        );
    }

    /* ---------- Tidak ditemukan ---------- */
    if (!data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-10">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                    <Info className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Data pelatihan tidak ditemukan</h3>
                    <p className="mt-1 text-sm text-slate-500 max-w-md">Pelatihan tidak tersedia atau tautan yang dibuka tidak valid.</p>
                </div>
                <button type="button" onClick={() => router.back()} className="h-11 px-5 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Kembali ke daftar
                </button>
            </div>
        );
    }

    const status = String(data.StatusPenerbitan ?? "");
    const { label, color, icon } = getStatusInfo(status);
    const totalPeserta = data.UserPelatihan?.length || 0;
    const canSttpl = sttplOpen(status);
    const curCategory = STATUS_BY_VALUE.get(status || "0")?.category ?? "Penyelenggaraan";
    const curPhase = PHASES.findIndex((p) => p.cats.includes(curCategory));
    const verifikator = adminPusatData?.Nama || data.VerifikatorPelatihan;

    const TABS: { value: string; no: string; label: string; sub: string; icon: LucideIcon; accent: string; disabled?: boolean }[] = [
        { value: "1", no: "01", label: "Penyelenggaraan", sub: "Administrasi & peserta", icon: ClipboardList, accent: "#3B82F6" },
        { value: "2", no: "02", label: "Penerbitan e-STTPL", sub: canSttpl ? "Sertifikat digital & TTD" : "Terbuka di stage 5", icon: canSttpl ? BadgeCheck : Lock, accent: "#8B5CF6", disabled: !canSttpl },
    ];

    return (
        <section className="pb-10 flex flex-col gap-5 w-full">
            {/* ---------- Hero ---------- */}
            <div className="relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 md:p-7 text-white ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(40%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
                <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                <School aria-hidden strokeWidth={1.25} className="pointer-events-none absolute -right-8 -bottom-12 -z-10 w-56 h-56 -rotate-12 text-sky-300 opacity-10" />

                {/* Baris atas: kembali + aksi */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="group inline-flex items-center gap-1.5 h-9 pl-2 pr-3.5 rounded-xl bg-white/10 ring-1 ring-white/15 text-xs font-bold text-blue-50 hover:bg-white/20 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Kembali
                    </button>
                    <div className="flex flex-wrap items-center gap-2">
                        <HistoryButton
                            pelatihan={data}
                            statusPelatihan={data.Status ?? ""}
                            idPelatihan={data.IdPelatihan?.toString()}
                            handleFetchingData={refetch}
                            statusLabel={label}
                            statusStage={status}
                            isFloating={false}
                            tone="dark"
                        />
                        {isSuperAdmin && <StatusControl current={status} currentLabel={label} idPelatihan={idPelatihan} onSaved={refetch} />}
                    </div>
                </div>

                {/* Identitas */}
                <div className="mt-5 flex flex-col md:flex-row md:items-end justify-between gap-5">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider text-white shadow-sm ${color}`}>
                                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-3.5 h-3.5" }) : null}
                                {label}
                            </span>
                            <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-white/10 ring-1 ring-white/15 text-[11px] font-bold text-blue-100/80">
                                <Hash className="w-3 h-3" /> {idPelatihan}
                            </span>
                            <span className="inline-flex items-center h-7 px-2.5 rounded-lg bg-white/10 ring-1 ring-white/15 text-[11px] font-mono font-bold text-blue-100/80">
                                Stage {status || "0"}
                            </span>
                        </div>
                        <h1 className="mt-3 text-xl md:text-2xl lg:text-[28px] font-black tracking-tight leading-tight">{data.NamaPelatihan}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-blue-100/75">
                            <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-sky-300" /> {data.PenyelenggaraPelatihan || "-"}</span>
                            <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-sky-300" /> {totalPeserta.toLocaleString("id-ID")} peserta</span>
                            {verifikator && <span className="inline-flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-sky-300" /> Verifikator: <b className="text-white">{verifikator}</b></span>}
                        </div>
                    </div>
                </div>

                {/* Fase alur penerbitan */}
                <ol className="mt-6 grid grid-cols-4 gap-1.5">
                    {PHASES.map((c, i) => {
                        const done = i < curPhase;
                        const active = i === curPhase;
                        return (
                            <li key={c.label} className="min-w-0">
                                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: done ? "100%" : active ? "55%" : "0%", background: done ? "#34D399" : `linear-gradient(90deg, ${c.accent}, #fff)` }}
                                    />
                                </div>
                                <p className={`mt-1.5 hidden sm:flex items-center gap-1 text-[10px] font-bold truncate ${active ? "text-white" : done ? "text-emerald-300" : "text-blue-100/45"}`}>
                                    {done && <Check className="w-3 h-3 shrink-0" />} {c.label}
                                </p>
                            </li>
                        );
                    })}
                </ol>
            </div>

            {/* ---------- Antrian (Supervisor / Verifikator) ---------- */}
            {queueRole && <PendingPelatihanQueue role={queueRole} currentIdPelatihan={idPelatihan} />}

            {/* ---------- Tabs ---------- */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-5">
                <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(40%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-70" />
                    <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_right,black,transparent_70%)]" />

                    <TabsList className="bg-transparent h-auto p-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 w-full">
                        {TABS.map((t) => {
                            const Icon = t.icon;
                            return (
                                <TabsTrigger
                                    key={t.value}
                                    value={t.value}
                                    disabled={t.disabled}
                                    style={{ ["--accent" as string]: t.accent }}
                                    className="group relative isolate overflow-hidden justify-start rounded-[1.35rem] py-3 px-4 text-blue-100/70 font-bold ring-1 ring-transparent transition-all duration-300 outline-none
                                        hover:text-white hover:bg-white/[0.06]
                                        focus-visible:ring-2 focus-visible:ring-sky-300/60
                                        disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-transparent
                                        data-[state=active]:text-white data-[state=active]:bg-white/[0.12] data-[state=active]:backdrop-blur-xl data-[state=active]:ring-white/25
                                        data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_-12px_var(--accent)]"
                                >
                                    <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-50 group-data-[state=active]:opacity-100" style={{ background: `linear-gradient(to left, ${t.accent}59 0%, ${t.accent}1f 40%, transparent 80%)` }} />
                                    <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/[0.14] to-transparent opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-100" />
                                    <Icon
                                        aria-hidden
                                        strokeWidth={1.5}
                                        className="pointer-events-none absolute -right-3 -bottom-4 -z-10 w-16 h-16 -rotate-12 opacity-[0.08] transition-all duration-500 ease-out group-hover:opacity-20 group-hover:-rotate-6 group-data-[state=active]:opacity-35 group-data-[state=active]:scale-110 group-data-[state=active]:-rotate-6"
                                        style={{ color: t.accent, filter: `drop-shadow(0 0 16px ${t.accent}80)` }}
                                    />

                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-sky-100 ring-1 ring-white/10 text-xs font-black transition-all duration-300 group-hover:bg-white/15 group-data-[state=active]:text-white group-data-[state=active]:ring-white/30 group-data-[state=active]:[background:var(--accent)] group-data-[state=active]:shadow-[0_6px_16px_-4px_var(--accent)]">
                                            {t.disabled ? <Lock className="w-4 h-4" /> : t.no}
                                        </div>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-sm tracking-tight whitespace-nowrap">{t.label}</span>
                                            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap text-blue-100/45 group-data-[state=active]:text-sky-100/80">{t.sub}</span>
                                        </div>
                                    </div>

                                    <span aria-hidden className="pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 scale-x-50 transition-all duration-300 group-data-[state=active]:opacity-100 group-data-[state=active]:scale-x-100" style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>

                <TabsContent value="1" className="mt-0 outline-none w-full animate-in fade-in-50 slide-in-from-bottom-1 duration-300">
                    <PelatihanDetail data={data} fetchData={refetch} onSwitchToSttpl={() => canSttpl && setActiveTab("2")} />
                </TabsContent>

                <TabsContent value="2" className="mt-0 outline-none w-full animate-in fade-in-50 slide-in-from-bottom-1 duration-300">
                    {canSttpl ? (
                        <STTPLDetail data={data} fetchData={refetch} />
                    ) : (
                        <div className="max-w-xl mx-auto py-12 px-6 flex flex-col items-center gap-4 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Penerbitan e-STTPL belum terbuka</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Butuh minimal <b className="text-slate-800 dark:text-slate-200">Stage 5 (Pelaporan Penyelenggaraan)</b>. Saat ini di stage <b className="font-mono">{status || "0"}</b>.
                                </p>
                            </div>
                            <button type="button" onClick={() => setActiveTab("1")} className="h-10 px-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-amber-500" /> Lanjutkan Penyelenggaraan
                            </button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </section>
    );
};

export default ManagePelatihan;

/* ============================ STATUS CONTROL (SUPER ADMIN) ============================ */

function StatusControl({ current, currentLabel, idPelatihan, onSaved }: { current: string; currentLabel: string; idPelatihan: string; onSaved?: () => void }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(current || "0");
    const [q, setQ] = useState("");
    const [cat, setCat] = useState<Category | "ALL">("ALL");
    const [saving, setSaving] = useState(false);

    // Reset tiap kali dibuka
    useEffect(() => {
        if (!open) return;
        setSelected(current || "0");
        setQ("");
        setCat(STATUS_BY_VALUE.get(current || "0")?.category ?? "ALL");
    }, [open, current]);

    const counts = useMemo(() => {
        const c = {} as Record<Category, number>;
        CATEGORIES.forEach((k) => (c[k] = 0));
        ALL_STATUS.forEach((s) => c[s.category]++);
        return c;
    }, []);

    const list = useMemo(() => {
        const term = q.trim().toLowerCase();
        return STATUS_INDEXED.filter((s) => (cat === "ALL" || s.category === cat) && (!term || s.haystack.includes(term)));
    }, [q, cat]);

    const selectedLabel = getStatusInfo(selected).label;
    const unchanged = selected === (current || "0");

    const save = async () => {
        if (unchanged) return;
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("StatusPenerbitan", selected);
            await axios.put(`${elautBaseUrl}/lemdik/updatePelatihan?id=${idPelatihan}`, fd, {
                headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}`, "Content-Type": "multipart/form-data" },
            });
            Toast.fire({ icon: "success", title: "Status diperbarui", text: `Stage ${current || "0"} → ${selected}` });
            setOpen(false);
            onSaved?.();
        } catch (e) {
            console.error("Error updating status penerbitan:", e);
            Toast.fire({ icon: "error", title: "Gagal memperbarui status" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                title="Ubah status penerbitan (Super Admin)"
                className="group inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0B1B3F] text-xs font-black shadow-md shadow-amber-500/20 transition-colors"
            >
                <TbSettings className="w-4 h-4 transition-transform duration-500 group-hover:rotate-90" /> Ubah Status
            </button>

            <Dialog open={open} onOpenChange={(o) => !saving && setOpen(o)}>
                <DialogContent className="w-[95vw] max-w-3xl p-0 overflow-hidden rounded-3xl border-0 bg-white dark:bg-slate-900 shadow-2xl z-[99999]">
                    {/* Header hero */}
                    <div className="relative isolate overflow-hidden bg-[#0B1B3F] text-white px-6 py-5">
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#F59E0B_0%,transparent_60%)] opacity-80" />
                        <TbSettings aria-hidden className="absolute -right-4 -bottom-6 -z-10 w-28 h-28 -rotate-12 text-amber-300 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">Super Admin</p>
                        <DialogTitle className="mt-0.5 text-lg font-black text-white">Ubah Status Penerbitan</DialogTitle>
                        <DialogDescription className="text-xs text-blue-100/70">Pilih tahapan baru. Perubahan langsung berlaku pada alur pelatihan.</DialogDescription>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/10 ring-1 ring-white/15">
                                <span className="font-mono font-black">{current || "0"}</span> <span className="text-blue-100/80">{currentLabel}</span>
                            </span>
                            <ArrowRight className="w-4 h-4 text-sky-200/70" />
                            <span className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-xl ring-1 ${unchanged ? "bg-white/10 ring-white/15 text-blue-100/60" : "bg-white text-[#0B1B3F] ring-white"}`}>
                                <span className="font-mono font-black">{selected}</span> <span className="font-semibold">{selectedLabel}</span>
                            </span>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="px-6 pt-4 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                autoFocus
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari status, mis. Signed, Kapus, 7A…"
                                className="w-full h-11 pl-10 pr-10 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 placeholder:font-normal"
                            />
                            {q && (
                                <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-200" aria-label="Hapus pencarian">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center p-1 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-x-auto scrollbar-hide">
                            {(["ALL", ...CATEGORIES] as (Category | "ALL")[]).map((k) => (
                                <button
                                    key={k}
                                    type="button"
                                    onClick={() => setCat(k)}
                                    className={`h-8 px-3 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${cat === k ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
                                >
                                    {k === "ALL" ? "Semua" : CATEGORY_META[k].label} <span className="opacity-60">{k === "ALL" ? ALL_STATUS.length : counts[k]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Daftar status */}
                    <div className="px-6 py-4 max-h-[46vh] overflow-y-auto">
                        {list.length === 0 ? (
                            <p className="py-10 text-center text-sm text-slate-400">Tidak ada status yang cocok.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {list.map((s) => {
                                    const isSel = selected === s.value;
                                    const isCur = (current || "0") === s.value;
                                    const accent = CATEGORY_META[s.category].accent;
                                    return (
                                        <button
                                            key={s.value}
                                            type="button"
                                            onClick={() => setSelected(s.value)}
                                            className={`relative flex items-start gap-3 p-3 rounded-2xl text-left ring-1 transition-all ${isSel ? "ring-2 ring-blue-500 bg-blue-50/70 dark:bg-blue-950/40" : "ring-slate-200 dark:ring-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                                        >
                                            <span className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-mono text-[11px] font-black text-white" style={{ background: accent }}>
                                                {s.value}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-1.5">
                                                    <span className={`text-[13px] font-bold truncate ${isSel ? "text-blue-900 dark:text-blue-200" : "text-slate-800 dark:text-slate-200"}`}>{s.label}</span>
                                                    {isCur && <span className="shrink-0 px-1.5 py-px rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500">Saat ini</span>}
                                                </span>
                                                <span className="block text-[11px] text-slate-400 truncate">{s.description}</span>
                                            </span>
                                            <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${isSel ? "bg-blue-600 text-white" : "ring-1 ring-slate-300 dark:ring-slate-700"}`}>
                                                {isSel && <Check className="w-3.5 h-3.5" />}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                        <button type="button" onClick={() => setOpen(false)} disabled={saving} className="h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={save}
                            disabled={saving || unchanged}
                            className="h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Menyimpan…" : unchanged ? "Pilih status baru" : `Simpan ke ${selected}`}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
