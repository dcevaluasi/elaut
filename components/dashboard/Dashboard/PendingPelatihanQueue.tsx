"use client";

import React, { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import {
    Inbox,
    Search,
    X,
    ChevronDown,
    ChevronRight,
    Building2,
    Users,
    Calendar,
    RefreshCw,
    Loader2,
    CheckCircle2,
    Clock,
    ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { encryptValue } from "@/lib/utils";
import { useFetchDataPelatihanMasyarakat } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakat";

/* ===================== ROLE ===================== */

export type QueueRole = "supervisor" | "verifikator";

/** Tentukan role antrian dari cookie (sama dengan flag di useFetchDataPelatihanMasyarakat) */
export const getQueueRole = (): QueueRole | null => {
    const access = Cookies.get("Access") || "";
    const role = (Cookies.get("Role") || "").toLowerCase();

    const isVerificator = access.includes("verifyPelaksanaan") && access.includes("verifyCertificate");
    if (isVerificator) return "verifikator";

    // TODO: sesuaikan flag akses Supervisor di sistem
    const isSupervisor = access.toLowerCase().includes("supervisor") || role.includes("supervisor");
    if (isSupervisor) return "supervisor";

    return null;
};

/* ===================== STATUS ===================== */

const STATUS_META = {
    "1": { label: "Pending SPV", short: "SPV", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900" },
    "2": { label: "Pending Verifikator", short: "Verifikator", dot: "bg-blue-500", pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900" },
    "6": { label: "Pending STTPL", short: "STTPL", dot: "bg-violet-500", pill: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900" },
} as const;

type QueueStatus = keyof typeof STATUS_META;

// Status yang tampil per role
const ROLE_STATUS: Record<QueueRole, QueueStatus[]> = {
    supervisor: ["1"],
    verifikator: ["2", "6"],
};

/* ================================================ */

interface PelatihanItem {
    IdPelatihan: number | string;
    NamaPelatihan: string;
    PenyelenggaraPelatihan?: string;
    StatusPenerbitan: string;
    TanggalMulaiPelatihan?: string;
    UpdateAt?: string;
    UserPelatihan?: unknown[];
}

interface Props {
    role: QueueRole;
    currentIdPelatihan: string;
}

const formatTanggal = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d.getTime())
        ? value
        : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const PendingPelatihanQueue: React.FC<Props> = ({ role, currentIdPelatihan }) => {
    const router = useRouter();
    const pathname = usePathname();

    // Data sudah dipersonalisasi oleh hook (verifikator -> hanya pelatihan yang ditugaskan ke dirinya)
    const { data, isFetching, refetch } = useFetchDataPelatihanMasyarakat();

    const statuses = ROLE_STATUS[role];
    const showTabs = statuses.length > 1;

    const [expanded, setExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState<QueueStatus>(statuses[0]);
    const [search, setSearch] = useState("");
    const [navigatingId, setNavigatingId] = useState<string | null>(null);

    const items = useMemo(
        () =>
            (data as unknown as PelatihanItem[]).filter(
                (p) =>
                    statuses.includes(String(p.StatusPenerbitan) as QueueStatus) &&
                    String(p.IdPelatihan) !== String(currentIdPelatihan)
            ),
        [data, statuses, currentIdPelatihan]
    );

    const counts = useMemo(() => {
        const c = {} as Record<QueueStatus, number>;
        statuses.forEach((s) => (c[s] = 0));
        items.forEach((p) => (c[String(p.StatusPenerbitan) as QueueStatus] += 1));
        return c;
    }, [items, statuses]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items
            .filter((p) => String(p.StatusPenerbitan) === activeTab)
            .filter(
                (p) =>
                    !q ||
                    p.NamaPelatihan?.toLowerCase().includes(q) ||
                    p.PenyelenggaraPelatihan?.toLowerCase().includes(q) ||
                    String(p.IdPelatihan).includes(q)
            )
            // paling lama menunggu di atas
            .sort((a, b) => new Date(a.UpdateAt ?? 0).getTime() - new Date(b.UpdateAt ?? 0).getTime());
    }, [items, activeTab, search]);

    const totalPending = items.length;
    const loading = isFetching && data.length === 0;

    const goTo = (id: string | number) => {
        setNavigatingId(String(id));
        const segments = pathname.split("/");
        segments[segments.length - 1] = encryptValue(String(id));
        router.push(segments.join("/"));
    };

    const title = role === "supervisor" ? "Antrian Persetujuan Supervisor" : "Antrian Verifikasi Anda";

    return (
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden">
            {/* Header */}
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full px-5 md:px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                        <Inbox className="w-5 h-5" />
                        {totalPending > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                                {totalPending > 99 ? "99+" : totalPending}
                            </span>
                        )}
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{title}</p>
                        <p className="text-[11px] font-medium text-slate-400 truncate">
                            {loading
                                ? "Memuat antrian..."
                                : totalPending === 0
                                    ? "Tidak ada pelatihan lain yang menunggu 🎉"
                                    : `${totalPending} pelatihan lain menunggu tindakan Anda`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5">
                        {statuses.map((s) => (
                            <span key={s} className={`px-2 py-0.5 rounded-lg border text-[10px] font-black ${STATUS_META[s].pill}`}>
                                {STATUS_META[s].short}: {counts[s]}
                            </span>
                        ))}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 md:px-6 pb-5 pt-1 space-y-4 border-t border-slate-100 dark:border-slate-800">
                            {/* Tabs (khusus verifikator) + search */}
                            <div className={`flex flex-col lg:flex-row lg:items-center gap-3 pt-4 ${showTabs ? "justify-between" : "justify-end"}`}>
                                {showTabs && (
                                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                        {statuses.map((s) => {
                                            const active = activeTab === s;
                                            return (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setActiveTab(s)}
                                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${active
                                                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                        }`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${STATUS_META[s].dot}`} />
                                                    {STATUS_META[s].label}
                                                    <span className={`min-w-[20px] px-1.5 rounded-md text-[10px] font-black ${active ? "bg-white/20 dark:bg-slate-900/10" : "bg-white dark:bg-slate-900"}`}>
                                                        {counts[s]}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1 lg:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Cari nama, penyelenggara, ID..."
                                            className="pl-9 h-9 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
                                        />
                                        {search && (
                                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={refetch}
                                        disabled={isFetching}
                                        title="Muat ulang"
                                        className="h-9 w-9 rounded-xl shrink-0"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                                    </Button>
                                </div>
                            </div>

                            {/* Isi list */}
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="py-10 flex flex-col items-center gap-2 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                                        {search ? "Tidak ada pelatihan yang cocok" : `Tidak ada antrian ${STATUS_META[activeTab].label}`}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        {search ? "Coba kata kunci lain." : showTabs ? "Cek tab status lainnya di atas." : "Semua sudah diproses."}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                                        {filtered.map((p, idx) => {
                                            const meta = STATUS_META[String(p.StatusPenerbitan) as QueueStatus];
                                            const isNav = navigatingId === String(p.IdPelatihan);
                                            return (
                                                <button
                                                    key={p.IdPelatihan}
                                                    type="button"
                                                    onClick={() => goTo(p.IdPelatihan)}
                                                    disabled={!!navigatingId}
                                                    className="group text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-3 disabled:opacity-60"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-black flex items-center justify-center shrink-0">
                                                        {idx + 1}
                                                    </div>

                                                    <div className="min-w-0 flex-1 space-y-1.5">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-wider px-2 py-0 ${meta.pill}`}>
                                                                {meta.label}
                                                            </Badge>
                                                            <span className="text-[10px] font-bold text-slate-400">ID {p.IdPelatihan}</span>
                                                        </div>
                                                        <p className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {p.NamaPelatihan}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
                                                            <span className="flex items-center gap-1 min-w-0">
                                                                <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
                                                                <span className="truncate max-w-[160px]">{p.PenyelenggaraPelatihan || "-"}</span>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3 text-indigo-600" />
                                                                {p.UserPelatihan?.length ?? 0} peserta
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3 text-emerald-600" />
                                                                {formatTanggal(p.TanggalMulaiPelatihan)}
                                                            </span>
                                                            {p.UpdateAt && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3 text-amber-600" />
                                                                    Update {formatTanggal(p.UpdateAt)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 self-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        {isNav ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            Diurutkan dari yang paling lama menunggu.
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={() => goTo(filtered[0].IdPelatihan)}
                                            disabled={!!navigatingId}
                                            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider gap-2 shadow-lg shadow-blue-500/20"
                                        >
                                            Proses Antrian Berikutnya <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PendingPelatihanQueue;