"use client";

/**
 * DashboardUser — satu file berisi seluruh dashboard peserta:
 * hero, tab bar (navy glass), panel Pelatihan, Sertifikat, dan Profil & Dokumen.
 * Data user hanya di-fetch SEKALI di sini lalu dibagikan ke semua panel
 * (sebelumnya panel pelatihan mem-fetch ulang user yang sama).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Toast from "@/commons/Toast";
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, MIN_FILE_SIZE } from "@/utils/file";
import { SATUAN_PENDIDIKAN_KEAHLIAN } from "@/constants/pelatihan";
import { KABUPATENS, PROVINCES } from "@/constants/regions";
import { User } from "@/types/user";
import { ManningAgent, PelatihanMasyarakat } from "@/types/product";
import { ModulPelatihan } from "@/types/module";
import ManningAgentService from "@/components/manning-agent-service";
import { TimelineProgressPesertaPelatihan } from "@/components/dashboard/Dashboard/TimelineProgressPesertaPelatihan";
import { useFetchDataInstrukturSelected } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { useFetchDataMateriPelatihanMasyarakatById } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { capitalize, generateTanggalPelatihan } from "@/utils/text";
import { stringToArray } from "@/utils/input";
import { elautBaseUrl } from "@/constants/urls";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Award,
    BadgeCheck,
    BookOpen,
    Briefcase,
    Building2,
    Cake,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Copy,
    Download,
    Droplet,
    ExternalLink,
    FileText,
    Flag,
    Globe,
    GraduationCap,
    Hash,
    Heart,
    Landmark,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Pencil,
    Phone,
    PlayCircle,
    RefreshCw,
    Save,
    Search,
    ShieldCheck,
    Ship,
    Sparkles,
    UserRound,
    UploadCloud,
    Users,
    X,
} from "lucide-react";

/* ============================ TYPES & KONSTANTA ============================ */

type UserPelatihan = NonNullable<User["Pelatihan"]>[number];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cert = UserPelatihan & Record<string, any>;
type IconType = React.ElementType;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const MODULE_URL = process.env.NEXT_PUBLIC_MODULE_FILE_URL;
const CERTIFICATE_BASE_URL = "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde";

const authHeaders = () => ({ Authorization: `Bearer ${Cookies.get("XSRF081")}` });
const fmt = (n: number) => n.toLocaleString("id-ID");
const DATE_FMT = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const greeting = () => {
    const h = new Date().getHours();
    return h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
};

const DEFAULT_ICON = "/images/bidangPelatihan/sd-perikanan.png";
const BIDANG_ICONS: Record<string, string> = {
    "Pengolahan dan Pemasaran": "/images/bidangPelatihan/pengolahan-pemasaran.png",
    Budidaya: "/images/bidangPelatihan/budidaya.png",
    Penangkapan: "/images/bidangPelatihan/penangkapan.png",
    Konservasi: "/images/bidangPelatihan/konservasi.png",
    "Mesin Perikanan": "/images/bidangPelatihan/mesin-perikanan.png",
    Kepelautan: "/images/bidangPelatihan/kepelautan.png",
    "Manajemen Perikanan": "/images/bidangPelatihan/sd-perikanan.png",
};
const iconFor = (bidang?: string) => (bidang && BIDANG_ICONS[bidang]) || DEFAULT_ICON;
const certificateUrl = (item: Cert) => `${CERTIFICATE_BASE_URL}/${item.FileSertifikat}`;

/* Token gaya (latar gelap) */
const glass = "rounded-3xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-xl";
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70";
const ghostBtn = `inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-xl bg-white/[0.06] ring-1 ring-white/10 text-xs font-semibold text-slate-200 hover:bg-white/[0.12] hover:text-white transition-colors ${focusRing}`;
const primaryBtn = `inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white text-[#0B1B3F] text-sm font-bold hover:bg-sky-100 transition-colors ${focusRing}`;

/* ============================ STATUS PENERBITAN SERTIFIKAT ============================ */

/** Nama field status penerbitan; dicoba berurutan. */
const STATUS_PENERBITAN_KEYS = ["StatusPenerbitan", "StatusApproval"];

type Stage = { id: string; label: string; codes: string[] };

/** Pemetaan kode → tahap dibuat eksplisit karena kode seperti "1.25" tidak berurutan. */
const STAGES: Stage[] = [
    { id: "draft", label: "Draft", codes: ["", "0", "0.1"] },
    { id: "spv", label: "Review SPV", codes: ["1", "1.1", "1.2"] },
    { id: "verifikator", label: "Verifikasi", codes: ["2", "3"] },
    { id: "approved", label: "Disetujui", codes: ["4"] },
    { id: "closed", label: "Closed", codes: ["1.25", "5"] },
    { id: "signing", label: "Penandatanganan", codes: ["6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "7A", "7B", "7C", "7D"] },
];
const CLOSED_STAGE_INDEX = STAGES.findIndex((s) => s.id === "closed");
const STAGE_INDEX_BY_CODE = new Map<string, number>();
STAGES.forEach((s, i) => s.codes.forEach((c) => STAGE_INDEX_BY_CODE.set(c, i)));

const STATUS_DETAIL: Record<string, string> = {
    "": "Draft",
    "0": "Draft",
    "0.1": "Publish",
    "1": "Pending SPV",
    "1.1": "Approved Pelaksanaan",
    "1.2": "Perbaikan SPV",
    "2": "Pending Verifikator",
    "3": "Perbaikan Verifikator",
    "4": "Approved Pelaksanaan",
    "1.25": "Closed",
    "5": "Closed",
};
const REVISION_CODES = new Set(["1.2", "3"]);

type Progress = { stageIndex: number; detail: string; revision: boolean };

/**
 * Kode status penerbitan.
 * 1) SUMBER UTAMA: `StatusPenerbitan` pada DATA PELATIHAN (getPelatihanUser) — selalu terbaru.
 * 2) Cadangan: field di baris user.Pelatihan (StatusPenerbitan → StatusApproval) selama data pelatihan belum termuat.
 */
function getStatusCode(item: Cert, d?: PelDetail | null): string | null {
    const sp = d?.StatusPenerbitan;
    if (sp !== undefined && sp !== null) return String(sp).trim().toUpperCase();
    let fallback: string | null = null;
    for (const k of STATUS_PENERBITAN_KEYS) {
        const v = item[k];
        if (v === undefined || v === null) continue;
        const code = String(v).trim().toUpperCase();
        if (code !== "") return code;
        fallback ??= code;
    }
    return fallback;
}

/**
 * Tahap dari kode. Kode yang tidak ada di tabel (mis. "16", "6.1", "7.0", "8A")
 * sebelumnya mengembalikan null → sertifikat dianggap belum tersedia walau status > 5.
 * Sekarang kode numerik dipetakan berdasarkan nilainya.
 */
function stageOf(code: string): number | undefined {
    const exact = STAGE_INDEX_BY_CODE.get(code);
    if (exact !== undefined) return exact;
    const n = parseFloat(code); // "7A" → 7, "6.1" → 6.1
    if (!Number.isFinite(n)) return undefined;
    if (n > 5) return STAGES.length - 1; // penandatanganan
    if (n === 5) return CLOSED_STAGE_INDEX;
    if (n >= 4) return STAGE_INDEX_BY_CODE.get("4");
    if (n >= 2) return STAGE_INDEX_BY_CODE.get("2");
    if (n >= 1) return STAGE_INDEX_BY_CODE.get("1");
    return 0;
}

function getProgress(item: Cert, d?: PelDetail | null): Progress | null {
    const status = getStatusCode(item, d);
    if (status === null) return null;
    const stageIndex = stageOf(status);
    if (stageIndex === undefined) return null;
    return { stageIndex, detail: STATUS_DETAIL[status] ?? STAGES[stageIndex].label, revision: REVISION_CODES.has(status) };
}

export function isCertificateAvailable(item: Cert, d?: PelDetail | null): boolean {
    const p = getProgress(item, d);
    return p !== null && p.stageIndex >= CLOSED_STAGE_INDEX;
}

/** Bisa diunduh: file ada DAN (sudah TTD "Done" ATAU status ≥ Closed). Dipakai di semua panel agar konsisten. */
const certDownloadable = (p: Cert, d?: PelDetail | null) => !!p.FileSertifikat && (p.StatusPenandatangan === "Done" || isCertificateAvailable(p, d));

/* ============================ STORE DATA PELATIHAN (cache bersama) ============================ */

type PelDetail = PelatihanMasyarakat & { StatusPenerbitan?: string | number | null };

/** Satu cache untuk semua panel: tiap pelatihan hanya di-fetch sekali, request paralel dibatasi. */
const pelStore = {
    data: new Map<number, PelDetail>(),
    failed: new Set<number>(),
    inflight: new Map<number, Promise<PelDetail | null>>(),
    version: 0,
    subs: new Set<() => void>(),
};
const emitPel = () => {
    pelStore.version++;
    pelStore.subs.forEach((f) => f());
};
const subscribePel = (f: () => void) => {
    pelStore.subs.add(f);
    return () => {
        pelStore.subs.delete(f);
    };
};

function fetchPelatihan(id: number, force = false): Promise<PelDetail | null> {
    if (!force && pelStore.data.has(id)) return Promise.resolve(pelStore.data.get(id)!);
    const running = pelStore.inflight.get(id);
    if (running) return running;
    const req: Promise<PelDetail | null> = axios
        .get<PelDetail>(`${elautBaseUrl}/getPelatihanUser?idPelatihan=${id}`, { headers: authHeaders() })
        .then((res) => {
            pelStore.data.set(id, res.data);
            pelStore.failed.delete(id);
            return res.data;
        })
        .catch((e) => {
            console.error("Error fetching data pelatihan:", id, e);
            pelStore.failed.add(id);
            return null;
        })
        .finally(() => {
            pelStore.inflight.delete(id);
            emitPel();
        });
    pelStore.inflight.set(id, req);
    pelStore.failed.delete(id);
    emitPel();
    return req;
}

/** Ambil banyak pelatihan dengan maksimal `limit` request bersamaan. */
async function fetchPelatihanMany(ids: number[], limit = 4) {
    const queue = ids.filter((id) => !pelStore.data.has(id) && !pelStore.inflight.has(id));
    const worker = async () => {
        while (queue.length) await fetchPelatihan(queue.shift()!);
    };
    await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, worker));
}

function usePelatihanStore() {
    const version = useSyncExternalStore(subscribePel, () => pelStore.version, () => 0);
    return useMemo(
        () => ({
            version,
            get: (id: number) => pelStore.data.get(id) ?? null,
            pending: (id: number) => pelStore.inflight.has(id) || (!pelStore.data.has(id) && !pelStore.failed.has(id)),
            failed: (id: number) => pelStore.failed.has(id),
        }),
        [version]
    );
}

/* ============================ DOKUMEN ============================ */

const hasExtension = (url: string) => /\.[0-9a-z]+$/i.test(url);
const docOk = (link?: string) => !!link && !link.endsWith("/") && hasExtension(link);

const getDocs = (u: User | null) => [
    { id: "foto", name: "Pas Foto", link: u?.Foto },
    { id: "kk", name: "Kartu Keluarga", link: u?.KK },
    { id: "ktp", name: "KTP / Identitas", link: u?.Ktp },
    { id: "ijazah", name: "Ijazah", link: u?.Ijazah },
    { id: "sehat", name: "Surat Keterangan Sehat", link: u?.SuratKesehatan },
].map((d) => ({ ...d, ok: docOk(d.link) }));

/* ============================ TAB ============================ */

type TabId = "pelatihan" | "sertifikat" | "profil";
const DEFAULT_TAB: TabId = "pelatihan";

const TABS: { id: TabId; name: string; short: string; sub: string; icon: IconType; accent: string }[] = [
    { id: "pelatihan", name: "Pelatihan Diikuti", short: "Pelatihan", sub: "Riwayat & progres", icon: GraduationCap, accent: "#3B82F6" },
    { id: "sertifikat", name: "Sertifikat", short: "Sertifikat", sub: "E-sertifikat resmi", icon: Award, accent: "#10B981" },
    { id: "profil", name: "Profil & Dokumen", short: "Profil", sub: "Data & berkas", icon: UserRound, accent: "#8B5CF6" },
];

/* ============================ PAGE ============================ */

export default function DashboardUser() {
    const isAgent = Cookies.get("isManningAgent") === "true";

    const [user, setUser] = useState<User | null>(null);
    const [agent, setAgent] = useState<ManningAgent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = useCallback(
        async (signal?: AbortSignal, silent = false) => {
            if (!silent) setLoading(true);
            setError(false);
            try {
                if (isAgent) {
                    const id = Cookies.get("IdManningAgent");
                    const res = await axios.get(`${baseUrl}/manningAgent/getManningAgent?id=${id}`, { headers: authHeaders(), signal });
                    setAgent(res.data?.data?.[0] ?? null);
                } else {
                    const res = await axios.get<User>(`${baseUrl}/users/getUsersById`, { headers: authHeaders(), signal });
                    setUser(res.data ?? null);
                }
            } catch (e) {
                if (axios.isCancel(e)) return;
                console.error("Gagal memuat data dashboard:", e);
                setError(true);
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [isAgent]
    );

    useEffect(() => {
        const ctrl = new AbortController();
        load(ctrl.signal);
        return () => ctrl.abort();
    }, [load]);

    /* ---------- Tab (state di sini supaya KPI hero bisa memindah tab) ---------- */
    const [active, setActive] = useState<TabId>(DEFAULT_TAB);
    const [visited, setVisited] = useState<TabId[]>([DEFAULT_TAB]);
    const tabsRef = useRef<HTMLDivElement>(null);

    // Tab dari URL (?tab=sertifikat)
    useEffect(() => {
        const p = new URLSearchParams(window.location.search).get("tab");
        const t = TABS.find((x) => x.id === p)?.id;
        if (t) {
            setActive(t);
            setVisited((v) => (v.includes(t) ? v : [...v, t]));
        }
    }, []);

    const select = useCallback((id: TabId, scroll = false) => {
        setActive(id);
        setVisited((v) => (v.includes(id) ? v : [...v, id]));
        const url = new URL(window.location.href);
        if (id === DEFAULT_TAB) url.searchParams.delete("tab");
        else url.searchParams.set("tab", id);
        window.history.replaceState(window.history.state, "", url);
        if (scroll) tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    /* ---------- Ringkasan (dihitung sekali) ---------- */
    // Status penerbitan dibaca dari DATA PELATIHAN → muat semua pelatihan milik user (cache bersama)
    const pel = usePelatihanStore();
    useEffect(() => {
        const ids = (user?.Pelatihan ?? []).map((p) => p.IdPelatihan).filter((x): x is number => x != null);
        if (ids.length) fetchPelatihanMany(ids);
    }, [user]);

    const stats = useMemo(() => {
        const list = (user?.Pelatihan ?? []) as Cert[];
        const available = list.filter((p) => isCertificateAvailable(p, pel.get(p.IdPelatihan))).length;
        const tracking = list.some((p) => pel.pending(p.IdPelatihan));
        const docs = getDocs(user);
        return { pelatihan: list.length, certs: list.length, available, tracking, docsOk: docs.filter((d) => d.ok).length, docsTotal: docs.length };
    }, [user, pel]);

    const name = (isAgent ? agent?.NamaManingAgent : user?.Nama)?.trim() || "";
    const RoleIcon = isAgent ? Ship : UserRound;

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-jakarta text-white">
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_0%_0%,#2563EB33_0%,transparent_60%),radial-gradient(50%_50%_at_100%_100%,#0EA5E926_0%,transparent_60%)]" />
                <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
            </div>

            <div className="relative z-10 w-full pt-28 md:pt-36 pb-20 px-4">
                <div className="max-w-7xl mx-auto flex flex-col gap-8">
                    {/* ===== HERO ===== */}
                    <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.6)] p-6 md:p-10">
                        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
                        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                        <RoleIcon aria-hidden strokeWidth={1.2} className="pointer-events-none absolute -right-10 -bottom-14 -z-10 w-72 h-72 -rotate-12 text-sky-300 opacity-[0.12]" />

                        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end">
                            <div className="min-w-0 space-y-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        {isAgent ? "Portal Manning Agent" : "Portal Peserta"}
                                    </span>
                                    <span className="text-[11px] text-blue-100/60">{DATE_FMT.format(new Date())}</span>
                                </div>
                                <div>
                                    <p className="text-sm md:text-base font-medium text-sky-100/80">{greeting()},</p>
                                    {loading ? (
                                        <div className="mt-2 h-10 md:h-14 w-3/4 max-w-xl rounded-2xl bg-white/10 animate-pulse" />
                                    ) : (
                                        <h1 className="mt-1 text-3xl md:text-5xl font-calsans leading-[1.1] tracking-tight break-words">
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-300 uppercase">
                                                {name || (isAgent ? "Manning Agent" : "Pengguna E-LAUT")}
                                            </span>
                                        </h1>
                                    )}
                                </div>
                                <p className="max-w-2xl text-sm md:text-base text-blue-100/70 leading-relaxed">
                                    Jelajahi <b className="text-white">E-LAUT</b> dan temukan pelatihan unggul sektor Kelautan dan Perikanan untuk meningkatkan kompetensi Anda.
                                </p>
                            </div>

                            {/* Bento KPI — klik untuk membuka tab terkait */}
                            {isAgent ? (
                                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 lg:w-64">
                                    <HeroKpi icon={GraduationCap} label="Pelatihan" value="Telusuri" accent="#3B82F6" />
                                    <HeroKpi icon={Ship} label="Awak kapal" value="Kelola" accent="#06B6D4" />
                                    <HeroKpi icon={Sparkles} label="Layanan" value="Digital" accent="#10B981" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 lg:w-64">
                                    <HeroKpi icon={GraduationCap} label="Pelatihan diikuti" value={loading ? "…" : fmt(stats.pelatihan)} accent="#3B82F6" onClick={() => select("pelatihan", true)} />
                                    <HeroKpi icon={Award} label="Sertifikat tersedia" value={loading || (stats.tracking && stats.available === 0) ? "…" : `${fmt(stats.available)}/${fmt(stats.certs)}`} accent="#10B981" onClick={() => select("sertifikat", true)} />
                                    <HeroKpi
                                        icon={FileText}
                                        label="Dokumen lengkap"
                                        value={loading ? "…" : `${stats.docsOk}/${stats.docsTotal}`}
                                        accent="#8B5CF6"
                                        progress={(stats.docsOk / stats.docsTotal) * 100}
                                        onClick={() => select("profil", true)}
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ===== KONTEN ===== */}
                    {error ? (
                        <div className={`${glass} mx-auto w-full max-w-md p-8 text-center`}>
                            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-300 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <h3 className="mt-4 text-base font-bold">Data akun gagal dimuat</h3>
                            <p className="mt-1 text-sm text-blue-100/60">Periksa koneksi Anda atau coba lagi. Jika berlanjut, silakan login ulang.</p>
                            <button type="button" onClick={() => load()} className={`${primaryBtn} mt-5 h-10`}>
                                <RefreshCw className="w-4 h-4" /> Coba lagi
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="space-y-4">
                            <div className="h-[72px] rounded-[1.75rem] bg-white/[0.05] ring-1 ring-white/10 animate-pulse" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="h-40 rounded-3xl bg-white/[0.05] ring-1 ring-white/10 animate-pulse" />
                                ))}
                            </div>
                        </div>
                    ) : isAgent ? (
                        <div className="animate-in fade-in-50 duration-500">
                            <ManningAgentService manningAgent={agent} />
                        </div>
                    ) : (
                        <div ref={tabsRef} id="explore" className="flex flex-col gap-5 scroll-mt-24">
                            <TabBar
                                active={active}
                                onSelect={select}
                                badges={{ pelatihan: stats.pelatihan, sertifikat: stats.available, profil: stats.docsTotal - stats.docsOk }}
                            />

                            {TABS.map(({ id }) =>
                                visited.includes(id) ? (
                                    <div
                                        key={id}
                                        id={`panel-${id}`}
                                        role="tabpanel"
                                        aria-labelledby={`tab-${id}`}
                                        hidden={id !== active}
                                        className="animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
                                    >
                                        {id === "pelatihan" && <TrainingPanel user={user} />}
                                        {id === "sertifikat" && <CertificatePanel user={user} />}
                                        {id === "profil" && <ProfilePanel user={user} onSaved={() => load(undefined, true)} />}
                                    </div>
                                ) : null
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ============================ HERO KPI & TAB BAR ============================ */

function HeroKpi({ icon: Icon, label, value, accent, progress, onClick }: { icon: IconType; label: string; value: string; accent: string; progress?: number; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className={`group relative isolate overflow-hidden text-left rounded-2xl bg-white/[0.07] ring-1 ring-white/10 backdrop-blur px-3.5 py-3 transition-all ${onClick ? "hover:bg-white/[0.12] hover:-translate-y-0.5 cursor-pointer" : "cursor-default"} ${focusRing}`}
        >
            <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `linear-gradient(to left, ${accent}40 0%, transparent 75%)` }} />
            <Icon aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-2 -bottom-3 -z-10 w-14 h-14 -rotate-12 opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:-rotate-6" style={{ color: accent }} />
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100/70 truncate">{label}</p>
            <p className="mt-0.5 text-lg sm:text-2xl font-black tabular-nums tracking-tight">{value}</p>
            {progress !== undefined && (
                <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #fff)` }} />
                </div>
            )}
        </button>
    );
}

function TabBar({ active, onSelect, badges }: { active: TabId; onSelect: (id: TabId) => void; badges: Record<TabId, number> }) {
    const refs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

    // Panah kiri/kanan, Home, End
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const i = TABS.findIndex((t) => t.id === active);
        const n = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : -1;
        if (n < 0) return;
        e.preventDefault();
        onSelect(TABS[n].id);
        refs.current[TABS[n].id]?.focus();
    };

    return (
        <div className="sticky top-24 z-20 isolate overflow-hidden rounded-[1.75rem] bg-[#0B1B3F]/95 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(40%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-70" />
            <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_right,black,transparent_70%)]" />

            <div role="tablist" aria-label="Layanan pengguna" onKeyDown={onKeyDown} className="grid grid-cols-3 gap-1.5 p-1.5">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    const on = t.id === active;
                    const badge = badges[t.id];
                    return (
                        <button
                            key={t.id}
                            ref={(el) => {
                                refs.current[t.id] = el;
                            }}
                            id={`tab-${t.id}`}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            aria-controls={`panel-${t.id}`}
                            tabIndex={on ? 0 : -1}
                            data-state={on ? "active" : "inactive"}
                            onClick={() => onSelect(t.id)}
                            style={{ ["--accent" as string]: t.accent }}
                            className={`group relative isolate overflow-hidden flex items-center justify-center sm:justify-start rounded-[1.35rem] py-3 px-2 sm:px-4 text-blue-100/70 font-bold ring-1 ring-transparent transition-all duration-300 outline-none
                                hover:text-white hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-sky-300/60
                                data-[state=active]:text-white data-[state=active]:bg-white/[0.12] data-[state=active]:backdrop-blur-xl data-[state=active]:ring-white/25
                                data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_-12px_var(--accent)]`}
                        >
                            <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-50 group-data-[state=active]:opacity-100" style={{ background: `linear-gradient(to left, ${t.accent}59 0%, ${t.accent}1f 40%, transparent 80%)` }} />
                            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/[0.14] to-transparent opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-100" />
                            <Icon
                                aria-hidden
                                strokeWidth={1.5}
                                className="pointer-events-none absolute -right-3 -bottom-4 -z-10 w-16 h-16 -rotate-12 opacity-[0.08] transition-all duration-500 ease-out group-hover:opacity-20 group-hover:-rotate-6 group-data-[state=active]:opacity-35 group-data-[state=active]:scale-110 group-data-[state=active]:-rotate-6"
                                style={{ color: t.accent, filter: `drop-shadow(0 0 16px ${t.accent}80)` }}
                            />

                            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5">
                                <div className="p-1.5 rounded-xl bg-white/10 text-sky-100 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-white/15 group-data-[state=active]:text-white group-data-[state=active]:ring-white/30 group-data-[state=active]:[background:var(--accent)] group-data-[state=active]:shadow-[0_6px_16px_-4px_var(--accent)]">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col items-center sm:items-start leading-none">
                                    <span className="text-xs sm:text-sm tracking-tight whitespace-nowrap flex items-center gap-1.5">
                                        <span className="sm:hidden">{t.short}</span>
                                        <span className="hidden sm:inline">{t.name}</span>
                                        {badge > 0 && (
                                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full tabular-nums ${t.id === "profil" ? "bg-amber-400/20 text-amber-200" : "bg-white/10 group-data-[state=active]:bg-white/20"}`}>
                                                {badge}
                                            </span>
                                        )}
                                    </span>
                                    <span className="hidden md:block mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap text-blue-100/45 group-data-[state=active]:text-sky-100/80">{t.sub}</span>
                                </div>
                            </div>

                            <span aria-hidden className="pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 scale-x-50 transition-all duration-300 group-data-[state=active]:opacity-100 group-data-[state=active]:scale-x-100" style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ============================ UI BERSAMA ============================ */

function PanelHeader({ icon: Icon, accent, title, desc, children }: { icon: IconType; accent: string; title: string; desc: string; children?: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative isolate overflow-hidden w-12 h-12 rounded-2xl bg-[#0B1B3F] ring-1 ring-white/10 text-white flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 70%)` }} />
                    <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-xl md:text-2xl font-calsans leading-tight">{title}</h2>
                    <p className="text-xs md:text-sm text-slate-400">{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

const Skeleton = ({ className = "" }: { className?: string }) => <div aria-hidden className={`animate-pulse rounded-xl bg-white/10 motion-reduce:animate-none ${className}`} />;

const ListSkeleton = ({ rows = 3 }: { rows?: number }) => (
    <div className="space-y-3" role="status" aria-label="Memuat">
        {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
        ))}
    </div>
);

const EmptyNote = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-8 text-center text-sm text-slate-400">{children}</div>
);

function Notice({ icon: Icon, title, children }: { icon: IconType; title: string; children?: React.ReactNode }) {
    return (
        <div className={`${glass} flex flex-col items-center px-6 py-14 text-center`}>
            <div className="w-14 h-14 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 text-slate-300 flex items-center justify-center">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="mt-4 font-calsans text-xl">{title}</h3>
            <div className="mt-2 max-w-sm text-sm text-slate-400">{children}</div>
        </div>
    );
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-rose-500/10 ring-1 ring-rose-400/30 px-4 py-3 text-sm text-rose-200">
            <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {message}
            </span>
            <button type="button" onClick={onRetry} className={ghostBtn}>
                <RefreshCw className="w-3.5 h-3.5" /> Coba lagi
            </button>
        </div>
    );
}

function CopyButton({ value, label }: { value: string; label: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard tidak tersedia */
        }
    };
    return (
        <button type="button" onClick={copy} aria-label={label} className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-sky-300 hover:bg-white/10 ${focusRing}`}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Tersalin" : "Salin"}
        </button>
    );
}

function StatusBadge({ text }: { text?: string }) {
    if (!text) return null;
    const t = text.toLowerCase();
    const tone = t.includes("tidak")
        ? "bg-rose-500/10 text-rose-300 ring-rose-400/30"
        : t.includes("lulus") || t.includes("selesai")
            ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30"
            : "bg-sky-500/10 text-sky-300 ring-sky-400/30";
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${tone}`}>{text}</span>;
}

function SearchBox({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
    return (
        <div className="relative group w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-300" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                placeholder={placeholder}
                className="h-11 w-full rounded-2xl border-none bg-white/[0.05] ring-1 ring-white/10 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-sky-400/50"
            />
            {value && (
                <button type="button" onClick={() => onChange("")} aria-label="Hapus pencarian" className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg grid place-items-center text-slate-400 hover:bg-white/10 hover:text-white ${focusRing}`}>
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

function Chips<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; count?: number }[] }) {
    return (
        <div role="group" className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 overflow-x-auto scrollbar-hide max-w-full">
            {options.map((o) => (
                <button
                    key={o.v}
                    type="button"
                    aria-pressed={value === o.v}
                    onClick={() => onChange(o.v)}
                    className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${focusRing} ${value === o.v ? "bg-white text-[#0B1B3F] shadow" : "text-slate-300 hover:text-white hover:bg-white/[0.06]"}`}
                >
                    {o.label}
                    {o.count !== undefined && <span className="ml-1 tabular-nums opacity-60">{o.count}</span>}
                </button>
            ))}
        </div>
    );
}

/* ============================ PANEL: PELATIHAN ============================ */

const DETAIL_TABS = [
    { value: "ringkasan", label: "Ringkasan" },
    { value: "materi", label: "Materi" },
    { value: "pengajar", label: "Tenaga pelatih" },
    { value: "nilai", label: "Nilai & sertifikat" },
] as const;
type DetailTab = (typeof DETAIL_TABS)[number]["value"];

function TrainingPanel({ user }: { user: User | null }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const list = useMemo(() => ((user?.Pelatihan ?? []) as Cert[]).slice().reverse(), [user]); // terbaru dulu

    const [keyword, setKeyword] = useState("");
    const [filter, setFilter] = useState<"all" | "ready">("all");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [tab, setTab] = useState<DetailTab>("ringkasan");

    // Data pelatihan dari cache bersama (sudah di-prefetch di DashboardUser)
    const pel = usePelatihanStore();
    const detail = selectedId !== null ? pel.get(selectedId) : null;
    const detailLoading = selectedId !== null && !detail && pel.pending(selectedId);
    const detailError = selectedId !== null && !detail && pel.failed(selectedId);

    const readyCount = useMemo(() => list.filter((p) => certDownloadable(p, pel.get(p.IdPelatihan))).length, [list, pel]);
    const filtered = useMemo(() => {
        const q = keyword.trim().toLowerCase();
        return list.filter((p) => (filter === "all" || certDownloadable(p, pel.get(p.IdPelatihan))) && (!q || `${p.NamaPelatihan} ${p.BidangPelatihan}`.toLowerCase().includes(q)));
    }, [list, keyword, filter, pel]);

    const selected = useMemo(() => list.find((p) => p.IdPelatihan === selectedId) ?? null, [list, selectedId]);

    const pick = (p: Cert) => {
        setSelectedId(p.IdPelatihan);
        setTab("ringkasan");
        fetchPelatihan(p.IdPelatihan);
        requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ block: "start" }));
    };
    const back = () => {
        setSelectedId(null);
        requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ block: "start" }));
    };
    const retry = () => selectedId !== null && fetchPelatihan(selectedId, true);

    if (list.length === 0) {
        return (
            <Notice icon={GraduationCap} title="Anda belum mengikuti pelatihan">
                <p>Pelatihan yang Anda ikuti akan muncul di sini, lengkap dengan materi, nilai, dan sertifikat.</p>
                <Link href="/" className={`${primaryBtn} mt-6`}>
                    Cari pelatihan <Search className="w-4 h-4" />
                </Link>
            </Notice>
        );
    }

    const fallback = detailLoading ? <ListSkeleton rows={3} /> : <InlineError message="Informasi pelatihan tidak dapat dimuat." onRetry={retry} />;
    const tanggal = detail ? `${generateTanggalPelatihan(detail.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(detail.TanggalBerakhirPelatihan)}` : null;

    return (
        <div ref={sectionRef} className="space-y-6 scroll-mt-44">
            {!selected && (
                <>
                    <PanelHeader icon={GraduationCap} accent="#3B82F6" title="Pelatihan Diikuti" desc="Lihat progres, buka materi, dan unduh sertifikat dari pelatihan Anda." />

                    <div className={`${glass} flex flex-col md:flex-row gap-2.5 md:items-center p-2.5`}>
                        <div className="flex-1">
                            <SearchBox value={keyword} onChange={setKeyword} label="Cari pelatihan" placeholder="Cari nama atau bidang pelatihan" />
                        </div>
                        <Chips
                            value={filter}
                            onChange={setFilter}
                            options={[
                                { v: "all", label: "Semua", count: list.length },
                                { v: "ready", label: "Sertifikat siap", count: readyCount },
                            ]}
                        />
                    </div>

                    <DataTable
                        head={[
                            { label: "No", className: "w-12 text-center" },
                            { label: "Pelatihan", className: "min-w-[280px]" },
                            { label: "Jadwal", className: "w-[190px]" },
                            { label: "Keterangan", className: "w-[130px]" },
                            { label: "Status penerbitan", className: "w-[190px]" },
                            { label: "Aksi", className: "w-[1%] text-right" },
                        ]}
                        empty={
                            filtered.length === 0 && (
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm font-semibold">Tidak ada pelatihan yang cocok</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setKeyword("");
                                            setFilter("all");
                                        }}
                                        className={ghostBtn}
                                    >
                                        Hapus filter
                                    </button>
                                </div>
                            )
                        }
                        footer={`${filtered.length} dari ${list.length} pelatihan · klik baris untuk melihat detail`}
                    >
                        {filtered.map((p, i) => {
                            const d = pel.get(p.IdPelatihan);
                            const pending = pel.pending(p.IdPelatihan);
                            const ready = certDownloadable(p, d);
                            return (
                                <tr key={p.IdPelatihan} onClick={() => pick(p)} className="group cursor-pointer transition-colors hover:bg-white/[0.05]">
                                    <td className="pl-5 pr-2 py-3.5 text-center text-xs text-slate-500 tabular-nums align-top">{i + 1}</td>
                                    <td className="px-3 py-3.5 align-top">
                                        <div className="flex items-start gap-3">
                                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                                                <Image width={32} height={32} alt="" src={iconFor(p.BidangPelatihan)} className="h-7 w-7 object-contain" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-sky-200">{p.NamaPelatihan}</p>
                                                <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                                                    {p.BidangPelatihan || "-"}
                                                    {d?.PenyelenggaraPelatihan ? ` · ${d.PenyelenggaraPelatihan}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3.5 align-top text-xs text-slate-300">
                                        {d ? (
                                            <>
                                                <p className="font-medium">{generateTanggalPelatihan(d.TanggalMulaiPelatihan)}</p>
                                                <p className="text-[11px] text-slate-500">s.d. {generateTanggalPelatihan(d.TanggalBerakhirPelatihan)}</p>
                                            </>
                                        ) : pending ? (
                                            <Skeleton className="h-8 w-32" />
                                        ) : (
                                            <span className="text-slate-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-3.5 align-top">{p.Keterangan ? <StatusBadge text={p.Keterangan} /> : <span className="text-xs text-slate-500">-</span>}</td>
                                    <td className="px-3 py-3.5 align-top">
                                        <MiniStage item={p} d={d} loading={pending} />
                                    </td>
                                    <td className="px-5 py-3 align-top">
                                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            {ready && (
                                                <a href={certificateUrl(p)} target="_blank" rel="noopener noreferrer" title="Unduh sertifikat" className={`${ghostBtn} h-8 px-2.5 text-emerald-300`}>
                                                    <Download className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Sertifikat</span>
                                                </a>
                                            )}
                                            <button type="button" onClick={() => pick(p)} className={`${ghostBtn} h-8 px-2.5`}>
                                                Detail <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </DataTable>
                </>
            )}

            {/* ---------- Detail ---------- */}
            {selected ? (
                <article key={selected.IdPelatihan} className={`${glass} min-w-0 overflow-hidden animate-in fade-in-50 slide-in-from-bottom-1 duration-300`}>
                    {/* Header navy */}
                    <div className="relative isolate overflow-hidden bg-[#0B1B3F] p-5 sm:p-7">
                        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
                        <GraduationCap aria-hidden strokeWidth={1.2} className="pointer-events-none absolute -right-6 -bottom-10 -z-10 w-44 h-44 -rotate-12 text-sky-300 opacity-[0.12]" />

                        <div className="mb-5 flex items-center justify-between gap-2">
                            <button type="button" onClick={back} className={ghostBtn}>
                                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke daftar
                            </button>
                        </div>

                        <header className="flex items-start gap-4">
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                                <Image width={48} height={48} alt="" src={iconFor(selected.BidangPelatihan)} className="h-11 w-11 object-contain" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                                <StatusBadge text={selected.Keterangan} />
                                <h3 className="font-calsans text-2xl sm:text-3xl leading-tight">{selected.NamaPelatihan}</h3>
                            </div>
                        </header>

                        {certDownloadable(selected, detail) && (
                            <a href={certificateUrl(selected)} target="_blank" rel="noopener noreferrer" className={`${primaryBtn} mt-5`}>
                                <BadgeCheck className="w-4 h-4" /> Unduh sertifikat
                            </a>
                        )}
                    </div>

                    <div className="p-5 sm:p-7">
                        <dl className="grid gap-2.5 sm:grid-cols-2">
                            <Fact icon={BookOpen} label="Bidang">{selected.BidangPelatihan || "-"}</Fact>
                            <Fact icon={Hash} label="No. STTPL">
                                {selected.NoRegistrasi ? (
                                    <span className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="break-all">{selected.NoRegistrasi}</span>
                                        <CopyButton value={selected.NoRegistrasi} label="Salin nomor STTPL" />
                                    </span>
                                ) : (
                                    "-"
                                )}
                            </Fact>
                            <Fact icon={Calendar} label="Tanggal pelatihan">{detailLoading ? <Skeleton className="h-5 w-40" /> : tanggal || "-"}</Fact>
                            <Fact icon={Building2} label="Penyelenggara">{detailLoading ? <Skeleton className="h-5 w-40" /> : detail?.PenyelenggaraPelatihan || "-"}</Fact>
                        </dl>

                        {detailError && (
                            <div className="mt-4">
                                <InlineError message="Jadwal dan penyelenggara tidak dapat dimuat." onRetry={retry} />
                            </div>
                        )}

                        {/* Sub-tab detail */}
                        <div role="tablist" className="mt-7 flex gap-1 overflow-x-auto scrollbar-hide p-1 rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                            {DETAIL_TABS.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === t.value}
                                    onClick={() => setTab(t.value)}
                                    className={`flex-1 h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${focusRing} ${tab === t.value ? "bg-white/[0.14] text-white ring-1 ring-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "text-slate-400 hover:text-white"}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6">
                            {tab === "ringkasan" && (
                                <div className="space-y-7">
                                    <section className="space-y-3">
                                        <SectionTitle>Status penerbitan sertifikat</SectionTitle>
                                        {(() => {
                                            const pr = getProgress(selected, detail);
                                            if (pr) return <StageTimeline progress={pr} available={isCertificateAvailable(selected, detail)} />;
                                            return detailLoading ? <Skeleton className="h-24 w-full" /> : <EmptyNote>Status penerbitan belum tersedia.</EmptyNote>;
                                        })()}
                                    </section>
                                    <section className="space-y-3">
                                        <SectionTitle>Deskripsi pelatihan</SectionTitle>
                                        <ExpandableHtml key={selected.IdPelatihan} html={selected.DetailPelatihan ?? ""} />
                                    </section>
                                    {detail ? (
                                        detail.UjiKompotensi !== "Portfolio" && (
                                            <section className="space-y-3">
                                                <SectionTitle>Progres pelatihan</SectionTitle>
                                                <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4 sm:p-6">
                                                    <TimelineProgressPesertaPelatihan userDetail={selected} pelatihan={detail} />
                                                </div>
                                            </section>
                                        )
                                    ) : detailLoading ? (
                                        <Skeleton className="h-40 w-full" />
                                    ) : null}
                                </div>
                            )}

                            {tab === "materi" && (
                                <div className="space-y-3">
                                    <SectionTitle>Perangkat pelatihan</SectionTitle>
                                    {detail ? detail.ModuleMateri ? <ModulSection key={String(detail.ModuleMateri)} moduleId={detail.ModuleMateri} /> : <EmptyNote>Materi pelatihan belum tersedia.</EmptyNote> : fallback}
                                </div>
                            )}

                            {tab === "pengajar" && (
                                <div className="space-y-3">
                                    <SectionTitle>Tenaga pelatih</SectionTitle>
                                    {detail ? detail.Instruktur ? <InstrukturSection key={detail.Instruktur} idsRaw={detail.Instruktur} /> : <EmptyNote>Tenaga pelatih belum ditetapkan.</EmptyNote> : fallback}
                                </div>
                            )}

                            {tab === "nilai" && <NilaiSection item={selected} d={detail} />}
                        </div>
                    </div>
                </article>
            ) : null}
        </div>
    );
}

/** Tabel gelap bersama (scroll horizontal di layar kecil). */
function DataTable({ head, children, empty, footer }: { head: { label: string; className?: string }[]; children: React.ReactNode; empty?: React.ReactNode; footer?: string }) {
    return (
        <div className="overflow-hidden rounded-3xl bg-white/[0.03] ring-1 ring-white/10 backdrop-blur-xl">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                    <thead className="bg-[#0B1B3F]/70">
                        <tr className="border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100/60">
                            {head.map((h, i) => (
                                <th key={h.label} className={`${i === 0 ? "pl-5 pr-2" : i === head.length - 1 ? "px-5" : "px-3"} py-3 font-bold ${h.className ?? ""}`}>
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {empty ? (
                            <tr>
                                <td colSpan={head.length} className="py-14 text-center">
                                    {empty}
                                </td>
                            </tr>
                        ) : (
                            children
                        )}
                    </tbody>
                </table>
            </div>
            {footer && <p className="border-t border-white/5 px-5 py-2.5 text-[11px] text-slate-500">{footer}</p>}
        </div>
    );
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200/80">{children}</h4>;

function Fact({ icon: Icon, label, children }: { icon: IconType; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-3.5">
            <Icon className="w-4 h-4 mt-0.5 text-sky-300 shrink-0" />
            <div className="min-w-0 flex-1">
                <dt className="text-[11px] text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold">{children}</dd>
            </div>
        </div>
    );
}

/** Deskripsi HTML dipangkas via CSS, jadi tag tidak terpotong. */
function ExpandableHtml({ html }: { html: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [overflowing, setOverflowing] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (el) setOverflowing(el.scrollHeight > el.clientHeight + 4);
    }, [html]);

    if (!html) return <EmptyNote>Belum ada deskripsi untuk pelatihan ini.</EmptyNote>;
    return (
        <div>
            <div
                ref={ref}
                dangerouslySetInnerHTML={{ __html: html }}
                className={`prose prose-invert prose-sm max-w-none text-slate-300 ${expanded ? "" : "max-h-40 overflow-hidden"} ${!expanded && overflowing ? "[mask-image:linear-gradient(to_bottom,black_55%,transparent)]" : ""}`}
            />
            {(overflowing || expanded) && (
                <button type="button" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)} className={`mt-2 rounded-md text-sm font-semibold text-sky-300 hover:underline ${focusRing}`}>
                    {expanded ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
                </button>
            )}
        </div>
    );
}

function ModulSection({ moduleId }: { moduleId: string | number }) {
    const { data: modul, loading, error, refetch } = useFetchDataMateriPelatihanMasyarakatById(moduleId);
    const [openId, setOpenId] = useState<number | null>(null);

    if (!modul) {
        if (loading) return <ListSkeleton rows={3} />;
        if (error) return <InlineError message="Materi pelatihan tidak dapat dimuat." onRetry={refetch} />;
        return <EmptyNote>Materi untuk pelatihan ini tidak ditemukan.</EmptyNote>;
    }
    const units = modul.ModulPelatihan ?? [];

    return (
        <div className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-4">
                <div className="min-w-0">
                    <p className="text-xs text-indigo-300">
                        {modul.BidangMateriPelatihan} · {modul.Tahun}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">{modul.NamaMateriPelatihan}</p>
                </div>
                <span className="rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/30 px-2.5 py-1 text-[11px] font-bold text-indigo-200">{units.length} unit modul</span>
            </div>

            {units.length === 0 ? (
                <div className="p-4">
                    <EmptyNote>Belum ada unit modul.</EmptyNote>
                </div>
            ) : (
                <ul className="divide-y divide-white/5">
                    {units.map((unit: ModulPelatihan) => {
                        const bahan = unit.BahanTayang ?? [];
                        const isOpen = openId === unit.IdModulPelatihan;
                        return (
                            <li key={unit.IdModulPelatihan}>
                                <div className="flex items-center gap-3 p-4">
                                    <button
                                        type="button"
                                        disabled={bahan.length === 0}
                                        aria-expanded={bahan.length ? isOpen : undefined}
                                        onClick={() => setOpenId(isOpen ? null : unit.IdModulPelatihan)}
                                        className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left disabled:cursor-default ${focusRing}`}
                                    >
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300">
                                            <BookOpen className="w-4 h-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-slate-100">{unit.NamaModulPelatihan}</span>
                                            {bahan.length > 0 && <span className="block text-xs text-slate-400">{bahan.length} bahan tayang</span>}
                                        </span>
                                        {bahan.length > 0 && <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />}
                                    </button>
                                    {unit.FileModule && (
                                        <a href={`${MODULE_URL}/${unit.FileModule}`} target="_blank" rel="noopener noreferrer" className={ghostBtn}>
                                            <Download className="w-3.5 h-3.5" /> Unduh
                                        </a>
                                    )}
                                </div>
                                {isOpen && (
                                    <ul className="space-y-2 border-t border-white/5 bg-black/10 py-3 pl-16 pr-4">
                                        {bahan.map((bt, i) => {
                                            const href = bt.BahanTayang ? `${MODULE_URL}/${bt.BahanTayang}` : bt.LinkVideo;
                                            return (
                                                <li key={i} className="flex items-center justify-between gap-3 text-sm text-slate-300">
                                                    <span className="min-w-0 break-words">{bt.NamaBahanTayang}</span>
                                                    {href && (
                                                        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-sky-300 hover:underline">
                                                            {bt.BahanTayang ? <ExternalLink className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                                                            {bt.BahanTayang ? "Buka" : "Tonton"}
                                                        </a>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

function InstrukturSection({ idsRaw }: { idsRaw: string }) {
    const ids = useMemo(() => stringToArray(idsRaw), [idsRaw]);
    const { instrukturs, loading, error, fetchInstrukturData } = useFetchDataInstrukturSelected(ids);
    const [requested, setRequested] = useState(false);

    const load = useCallback(async () => {
        await fetchInstrukturData();
        setRequested(true);
    }, [fetchInstrukturData]);

    useEffect(() => {
        load();
    }, [load]);

    if (instrukturs.length === 0) {
        if (!requested || loading) return <ListSkeleton rows={2} />;
        if (error) return <InlineError message="Data tenaga pelatih tidak dapat dimuat." onRetry={load} />;
        return <EmptyNote>Data tenaga pelatih tidak ditemukan.</EmptyNote>;
    }

    return (
        <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10">
            {instrukturs.map((it) => {
                const sub = [it.jenjang_jabatan, it.eselon_1].filter(Boolean).join(" · ");
                return (
                    <li key={it.IdInstruktur} className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-200">{(it.nama || "?").charAt(0).toUpperCase()}</div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold">{it.nama}</p>
                                {sub && <p className="text-xs text-slate-400">{sub}</p>}
                            </div>
                        </div>
                        <span className="rounded-full bg-amber-500/10 ring-1 ring-amber-400/20 px-2.5 py-1 text-[11px] font-semibold text-amber-300">{it.bidang_keahlian || "Instruktur"}</span>
                    </li>
                );
            })}
        </ul>
    );
}

function NilaiSection({ item, d }: { item: Cert; d: PelDetail | null }) {
    const hasScore = !!item.PostTest;
    const pre = Number(item.PreTest ?? 0);
    const post = Number(item.PostTest ?? 0);
    const ready = certDownloadable(item, d);
    const delta = post - pre;

    return (
        <div className="space-y-7">
            <div className="space-y-3">
                <SectionTitle>Nilai</SectionTitle>
                {hasScore ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                        <ScoreTile label="Pre-test" value={pre} accent="#64748B" />
                        <ScoreTile label="Post-test" value={post} accent="#3B82F6" sub={delta !== 0 ? `${delta > 0 ? "+" : ""}${delta} dari pre-test` : undefined} />
                        <ScoreTile label="Rata-rata" value={((pre + post) / 2).toFixed(1)} accent="#10B981" highlight />
                    </div>
                ) : (
                    <EmptyNote>Nilai belum tersedia. Nilai muncul setelah post-test selesai dinilai.</EmptyNote>
                )}
            </div>
            <div className="space-y-3">
                <SectionTitle>Sertifikat</SectionTitle>
                {ready ? (
                    <div className="flex flex-col gap-4 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-2 text-sm text-emerald-100">
                            <CheckCircle2 className="w-4 h-4 shrink-0" /> Sertifikat sudah terbit dan siap diunduh.
                        </p>
                        <a href={certificateUrl(item)} target="_blank" rel="noopener noreferrer" className={primaryBtn}>
                            <BadgeCheck className="w-4 h-4" /> Unduh sertifikat
                        </a>
                    </div>
                ) : (
                    <EmptyNote>Sertifikat belum tersedia. Tombol unduh muncul di sini setelah sertifikat ditandatangani.</EmptyNote>
                )}
            </div>
        </div>
    );
}

function ScoreTile({ label, value, accent, sub, highlight }: { label: string; value: string | number; accent: string; sub?: string; highlight?: boolean }) {
    return (
        <div className={`relative isolate overflow-hidden rounded-2xl p-4 ring-1 ${highlight ? "bg-[#0B1B3F] ring-white/20" : "bg-white/[0.04] ring-white/10"}`}>
            <div aria-hidden className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 100% at 100% 0%, ${accent}40 0%, transparent 65%)` }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">{label}</p>
            <p className="mt-1 font-calsans text-3xl tabular-nums">{value}</p>
            {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
        </div>
    );
}

/* ============================ PANEL: SERTIFIKAT ============================ */

type CertFilter = "all" | "available" | "pending";

function CertificatePanel({ user }: { user: User | null }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<CertFilter>("all");

    // Semua pelatihan dilacak (status dari data pelatihan); yang tersedia tampil dulu, lalu tahap terjauh
    const pel = usePelatihanStore();
    const certs = useMemo(
        () =>
            ((user?.Pelatihan ?? []) as Cert[])
                .map((cert) => {
                    const d = pel.get(cert.IdPelatihan);
                    return { cert, d, available: isCertificateAvailable(cert, d), stage: getProgress(cert, d)?.stageIndex ?? -1 };
                })
                .sort((a, b) => Number(b.available) - Number(a.available) || b.stage - a.stage),
        [user, pel]
    );
    const counts = useMemo(() => {
        const available = certs.filter((c) => c.available).length;
        return { all: certs.length, available, pending: certs.length - available };
    }, [certs]);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return certs.filter(({ cert, available }) => {
            if (filter === "available" && !available) return false;
            if (filter === "pending" && available) return false;
            if (!q) return true;
            // Nomor sertifikat hanya bisa dicari setelah tersedia
            return (cert.NamaPelatihan || "").toLowerCase().includes(q) || (available && String(cert.NoSertifikat ?? "").toLowerCase().includes(q));
        });
    }, [certs, filter, search]);

    const reset = () => {
        setSearch("");
        setFilter("all");
    };

    return (
        <div className="space-y-6">
            <PanelHeader
                icon={Award}
                accent="#10B981"
                title="Koleksi E-Sertifikat"
                desc={counts.all ? `${counts.available} tersedia${counts.pending ? ` · ${counts.pending} masih diproses` : ""}` : "Sertifikat resmi dari pelatihan E-LAUT yang Anda ikuti."}
            />

            {counts.all === 0 ? (
                <Notice icon={FileText} title="Belum ada sertifikat">
                    Sertifikat dari pelatihan yang Anda ikuti akan muncul di sini setelah prosesnya selesai.
                </Notice>
            ) : (
                <>
                    <div className={`${glass} flex flex-col md:flex-row gap-2.5 md:items-center p-2.5`}>
                        <div className="flex-1">
                            <SearchBox value={search} onChange={setSearch} label="Cari sertifikat" placeholder="Cari nama pelatihan atau nomor sertifikat" />
                        </div>
                        <Chips
                            value={filter}
                            onChange={setFilter}
                            options={[
                                { v: "all", label: "Semua", count: counts.all },
                                { v: "available", label: "Tersedia", count: counts.available },
                                { v: "pending", label: "Diproses", count: counts.pending },
                            ]}
                        />
                    </div>

                    {visible.length === 0 ? (
                        <Notice icon={Search} title="Tidak ada sertifikat yang cocok">
                            <p>Periksa ejaan atau ubah filter.</p>
                            <button type="button" onClick={reset} className={`${ghostBtn} mt-4`}>
                                Hapus pencarian dan filter
                            </button>
                        </Notice>
                    ) : (
                        <DataTable
                            head={[
                                { label: "No", className: "w-12 text-center" },
                                { label: "Pelatihan", className: "min-w-[260px]" },
                                { label: "No. sertifikat", className: "min-w-[200px]" },
                                { label: "Selesai", className: "w-[130px]" },
                                { label: "Status penerbitan", className: "w-[190px]" },
                                { label: "Aksi", className: "w-[1%] text-right" },
                            ]}
                            footer={`${visible.length} dari ${counts.all} pelatihan · sertifikat dapat diunduh mulai tahap Closed`}
                        >
                            {visible.map(({ cert, d, available }, i) => {
                                const canDownload = available && !!cert.FileSertifikat;
                                const endDate = cert.TanggalAkhirPelatihan || cert.TanggalExpiredSertifikat;
                                return (
                                    <tr key={cert.IdPelatihan} className="transition-colors hover:bg-white/[0.05]">
                                        <td className="pl-5 pr-2 py-3.5 text-center text-xs text-slate-500 tabular-nums align-top">{i + 1}</td>
                                        <td className="px-3 py-3.5 align-top">
                                            <div className="flex items-start gap-3">
                                                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${available ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" : "bg-white/[0.06] text-slate-400 ring-white/10"}`}>
                                                    {available ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-semibold leading-snug line-clamp-2">{cert.NamaPelatihan}</p>
                                                    <p className="mt-0.5 text-[11px] text-slate-400 truncate">{cert.BidangPelatihan || "-"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3.5 align-top">
                                            {available && cert.NoSertifikat ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-medium text-slate-200 break-all tabular-nums">{cert.NoSertifikat}</span>
                                                    <CopyButton value={String(cert.NoSertifikat)} label="Salin nomor sertifikat" />
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                                    <Clock className="w-3 h-3" /> Terbit setelah Closed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3.5 align-top text-xs text-slate-300">{endDate ? generateTanggalPelatihan(endDate) : "-"}</td>
                                        <td className="px-3 py-3.5 align-top">
                                            <MiniStage item={cert} d={d} loading={pel.pending(cert.IdPelatihan)} />
                                        </td>
                                        <td className="px-5 py-3 align-top">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {canDownload ? (
                                                    <a href={certificateUrl(cert)} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-white text-[#0B1B3F] text-xs font-bold hover:bg-sky-100 transition-colors ${focusRing}`}>
                                                        <Download className="w-3.5 h-3.5" /> Unduh
                                                    </a>
                                                ) : (
                                                    <span title={available ? "File belum siap" : "Belum bisa diunduh"} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-xl bg-white/[0.04] text-[11px] font-semibold text-slate-500 cursor-not-allowed">
                                                        <Lock className="w-3.5 h-3.5" /> {available ? "File belum siap" : "Terkunci"}
                                                    </span>
                                                )}
                                                {available && cert.NoSertifikat && (
                                                    <Link href={`/layanan/cek-sertifikat/${cert.NoSertifikat}`} title="Verifikasi" className={`${ghostBtn} h-8 px-2.5`}>
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </DataTable>
                    )}
                </>
            )}
        </div>
    );
}

function MiniStage({ item, d, loading }: { item: Cert; d: PelDetail | null; loading: boolean }) {
    const pr = getProgress(item, d);
    if (!pr) return loading ? <span className="mt-1 block h-1.5 w-full rounded-full bg-white/10 animate-pulse" /> : null;
    const avail = pr.stageIndex >= CLOSED_STAGE_INDEX;
    const cur = pr.revision ? "bg-rose-400" : avail ? "bg-emerald-400" : "bg-amber-400";
    return (
        <span className="mt-1 block" title={`Tahap ${pr.stageIndex + 1}/${STAGES.length}: ${pr.detail}`}>
            <span className="flex gap-0.5">
                {STAGES.map((s, i) => (
                    <span key={s.id} className={`h-1 flex-1 rounded-full ${i < pr.stageIndex ? "bg-sky-400" : i === pr.stageIndex ? cur : "bg-white/10"}`} />
                ))}
            </span>
            <span className={`mt-1 block text-[10px] font-semibold ${pr.revision ? "text-rose-300" : avail ? "text-emerald-300" : "text-amber-200/90"}`}>{pr.detail}</span>
        </span>
    );
}

/** Timeline tahap penerbitan (detail pelatihan). */
function StageTimeline({ progress, available }: { progress: Progress; available: boolean }) {
    const { stageIndex, detail, revision } = progress;
    return (
        <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={`flex items-center gap-1.5 text-sm font-bold ${revision ? "text-rose-300" : available ? "text-emerald-300" : "text-amber-200"}`}>
                    {revision ? <AlertTriangle className="w-4 h-4" /> : available ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    {detail}
                </p>
                <span className="text-[11px] text-slate-400 tabular-nums">
                    Tahap {stageIndex + 1} dari {STAGES.length}
                </span>
            </div>
            <ol className="mt-4 grid grid-cols-6 gap-1">
                {STAGES.map((s, i) => {
                    const done = i < stageIndex;
                    const cur = i === stageIndex;
                    const tone = cur ? (revision ? "bg-rose-400 ring-rose-300/50" : available ? "bg-emerald-400 ring-emerald-300/50" : "bg-amber-400 ring-amber-300/50") : done ? "bg-sky-400 ring-sky-300/40" : "bg-white/10 ring-white/10";
                    return (
                        <li key={s.id} className="flex flex-col items-center gap-1.5 text-center">
                            <span className="relative flex w-full items-center">
                                <span className={`h-1 flex-1 rounded-full ${i === 0 ? "opacity-0" : done || cur ? "bg-sky-400" : "bg-white/10"}`} />
                                <span className={`grid place-items-center w-6 h-6 rounded-full ring-2 shrink-0 ${tone} ${cur ? "scale-110" : ""}`}>
                                    {done ? <Check className="w-3 h-3 text-[#0B1B3F]" /> : <span className={`w-1.5 h-1.5 rounded-full ${cur ? "bg-[#0B1B3F]" : "bg-white/30"}`} />}
                                </span>
                                <span className={`h-1 flex-1 rounded-full ${i === STAGES.length - 1 ? "opacity-0" : done ? "bg-sky-400" : "bg-white/10"}`} />
                            </span>
                            <span className={`text-[9px] sm:text-[10px] font-semibold leading-tight ${cur ? "text-white" : done ? "text-sky-200/80" : "text-slate-500"}`}>{s.label}</span>
                        </li>
                    );
                })}
            </ol>
            {!available && (
                <p className="mt-3 text-[11px] text-slate-400">
                    Sertifikat dapat diunduh mulai tahap <b className="text-slate-200">Closed</b>.
                </p>
            )}
        </div>
    );
}

/* ============================ PANEL: PROFIL & DOKUMEN ============================ */

function ProfilePanel({ user, onSaved }: { user: User | null; onSaved: () => void }) {
    const docs = useMemo(() => getDocs(user), [user]);
    const [editStep, setEditStep] = useState<number | null>(null); // null = mode lihat
    const topRef = useRef<HTMLDivElement>(null);

    // ?edit=1 / ?edit=dokumen membuka form langsung
    useEffect(() => {
        const e = new URLSearchParams(window.location.search).get("edit");
        if (e) setEditStep(e === "dokumen" ? 3 : 0);
    }, []);

    const startEdit = (step = 0) => {
        setEditStep(step);
        requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };

    if (!user) return null;

    if (editStep !== null) {
        return (
            <div ref={topRef} className="scroll-mt-44">
                <EditProfileForm
                    user={user}
                    initialStep={editStep}
                    onCancel={() => setEditStep(null)}
                    onSaved={() => {
                        setEditStep(null);
                        onSaved();
                    }}
                />
            </div>
        );
    }

    const okCount = docs.filter((d) => d.ok).length;
    const pct = Math.round((okCount / docs.length) * 100);
    const foto = user.Foto && user.Foto.includes("http") && docOk(user.Foto) ? user.Foto : "/dummies/profile.jpg";

    const info: { icon: IconType; label: string; value?: string; verified?: boolean }[] = [
        { icon: Hash, label: "NIK", value: String(user.Nik ?? ""), verified: true },
        { icon: Flag, label: "Kewarganegaraan", value: user.Kewarganegaraan },
        { icon: Heart, label: "Status perkawinan", value: user.StatusMenikah },
        { icon: Users, label: "Jenis kelamin", value: user.JenisKelamin },
        { icon: Cake, label: "Tempat & tanggal lahir", value: [user.TempatLahir, user.TanggalLahir].filter(Boolean).join(", ") },
        { icon: MapPin, label: "Alamat domisili", value: user.Alamat },
        { icon: Building2, label: "Kota / provinsi", value: [user.Kota, user.Provinsi].filter(Boolean).join(", ") },
        { icon: Briefcase, label: "Pekerjaan", value: user.Pekerjaan },
        { icon: GraduationCap, label: "Pendidikan terakhir", value: user.PendidikanTerakhir },
        { icon: Landmark, label: "Agama", value: user.Agama },
        { icon: Droplet, label: "Golongan darah", value: user.GolonganDarah },
        { icon: UserRound, label: "Nama ibu kandung", value: user.IbuKandung },
        { icon: Globe, label: "Negara tujuan kerja", value: user.NegaraTujuanBekerja },
    ];

    return (
        <div ref={topRef} className="space-y-6 scroll-mt-44">
            <PanelHeader icon={UserRound} accent="#8B5CF6" title="Profil & Dokumen" desc="Kelola data pribadi dan berkas pendukung untuk validasi keikutsertaan pelatihan.">
                <button type="button" onClick={() => startEdit(0)} className={primaryBtn}>
                    <Pencil className="w-4 h-4" /> Edit profil
                </button>
            </PanelHeader>

            <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
                {/* ---------- Kartu profil ---------- */}
                <aside className="space-y-4 lg:sticky lg:top-48">
                    <div className="relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] ring-1 ring-white/10 p-6 text-center">
                        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,#2563EB_0%,transparent_65%),radial-gradient(60%_60%_at_100%_100%,#8B5CF655_0%,transparent_65%)]" />
                        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />

                        <div className="relative w-28 h-28 mx-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={foto} alt={user.Nama} className="w-full h-full rounded-full object-cover ring-4 ring-white/15 shadow-xl" onError={(e) => (e.currentTarget.src = "/dummies/profile.jpg")} />
                            <span className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#3B82F6] ring-2 ring-[#0B1B3F] text-white">
                                <ShieldCheck className="w-4 h-4" />
                            </span>
                        </div>
                        <h3 className="mt-4 font-calsans text-xl line-clamp-2">{capitalize((user.Nama || "").toLocaleLowerCase())}</h3>
                        <span className="mt-2 inline-flex rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100">
                            {user.KusukaUsers === "yes" ? "Pelaku Utama (KUSUKA)" : "Peserta Umum"}
                        </span>

                        <div className="mt-5 space-y-2 text-left">
                            <ContactRow icon={Hash} value={String(user.Nik ?? "-")} copy />
                            <ContactRow icon={Mail} value={user.Email} href={user.Email ? `mailto:${user.Email}` : undefined} />
                            <ContactRow icon={Phone} value={user.NoTelpon.toString()} href={user.NoTelpon ? `tel:${user.NoTelpon}` : undefined} />
                        </div>
                    </div>

                    {/* Kelengkapan dokumen */}
                    <div className={`${glass} p-5`}>
                        <div className="flex items-baseline justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Kelengkapan dokumen</p>
                            <p className="text-sm font-black tabular-nums">{pct}%</p>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct === 100 ? "#10B981" : "linear-gradient(90deg,#8B5CF6,#3B82F6)" }} />
                        </div>
                        <ul className="mt-4 space-y-2">
                            {docs.map((d) => (
                                <li key={d.id} className="flex items-center justify-between text-xs">
                                    <span className={d.ok ? "text-slate-200" : "text-slate-500"}>{d.name}</span>
                                    {d.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full ring-1 ring-dashed ring-slate-500" />}
                                </li>
                            ))}
                        </ul>
                        {okCount < docs.length && (
                            <button type="button" onClick={() => startEdit(3)} className={`${ghostBtn} mt-4 w-full`}>
                                Lengkapi {docs.length - okCount} berkas <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </aside>

                {/* ---------- Data & berkas ---------- */}
                <div className="min-w-0 space-y-6">
                    <section className="space-y-3">
                        <SectionTitle>Data pribadi</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                            {info.map((it) => (
                                <div key={it.label} className="group flex items-start gap-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-3.5 hover:bg-white/[0.07] transition-colors">
                                    <span className="p-2 rounded-xl bg-sky-500/10 text-sky-300 shrink-0">
                                        <it.icon className="w-4 h-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{it.label}</p>
                                        <p className="mt-0.5 text-sm font-medium text-slate-100 break-words" title={it.value || undefined}>
                                            {it.value || <span className="text-slate-500">-</span>}
                                        </p>
                                        {it.verified && it.value && (
                                            <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400/90">
                                                <span className="w-1 h-1 rounded-full bg-emerald-400" /> Terverifikasi
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-3">
                        <SectionTitle>Berkas & unggahan</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {docs.map((d) => (
                                <DocumentCard key={d.id} name={d.name} link={d.link} ok={d.ok} onEdit={() => startEdit(3)} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function ContactRow({ icon: Icon, value, href, copy }: { icon: IconType; value?: string; href?: string; copy?: boolean }) {
    const body = <span className="truncate">{value || "-"}</span>;
    return (
        <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] ring-1 ring-white/10 px-3 py-2 text-xs text-blue-50/90">
            <Icon className="w-3.5 h-3.5 text-sky-300 shrink-0" />
            {href ? (
                <a href={href} className="min-w-0 flex-1 truncate hover:text-white hover:underline">
                    {value}
                </a>
            ) : (
                <span className="min-w-0 flex-1 truncate tabular-nums">{body}</span>
            )}
            {copy && value && <CopyButton value={value} label="Salin" />}
        </div>
    );
}

function DocumentCard({ name, link, ok, onEdit }: { name: string; link?: string; ok: boolean; onEdit: () => void }) {
    const accent = ok ? "#10B981" : "#64748B";
    const fileName = link?.split("/").pop() || "";
    return (
        <div className="group relative isolate overflow-hidden flex flex-col justify-between gap-4 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 transition-all hover:bg-white/[0.07] hover:-translate-y-0.5">
            <FileText aria-hidden strokeWidth={1.4} className="pointer-events-none absolute -right-4 -bottom-5 -z-10 w-24 h-24 -rotate-12 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity" style={{ color: accent }} />
            <div>
                <div className="flex items-center justify-between mb-4">
                    <span className="p-2.5 rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                        <FileText className="w-4 h-4" style={{ color: ok ? "#6EE7B7" : "#94A3B8" }} />
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ${ok ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30" : "bg-white/[0.05] text-slate-400 ring-white/10"}`}>
                        {ok ? "Terunggah" : "Belum ada"}
                    </span>
                </div>
                <h4 className="font-calsans text-base">{name}</h4>
                {ok ? (
                    <p className="mt-1 text-[11px] text-sky-200/70 truncate" title={fileName}>
                        {fileName}
                    </p>
                ) : (
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">Berkas belum tersedia. Klik di bawah untuk mengunggah.</p>
                )}
            </div>
            {ok ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className={`${ghostBtn} self-start`}>
                    Pratinjau <ExternalLink className="w-3.5 h-3.5" />
                </a>
            ) : (
                <button type="button" onClick={onEdit} className={`${ghostBtn} self-start`}>
                    Lengkapi sekarang <ChevronRight className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}

/* ============================ FORM: EDIT / LENGKAPI PROFIL ============================ */

type ProfileForm = {
    Nama: string;
    Nik: string;
    NoTelpon: string;
    Email: string;
    TanggalLahir: string;
    TempatLahir: string;
    JenisKelamin: string;
    Agama: string;
    Pekerjaan: string;
    GolonganDarah: string;
    StatusMenikah: string;
    PendidikanTerakhir: string;
    Kewarganegaraan: string;
    IbuKandung: string;
    NegaraTujuanBekerja: string;
    Alamat: string;
    Provinsi: string;
    Kota: string;
};
type DocKey = "pasFoto" | "ktp" | "kk" | "ijazah" | "suratKesehatan";

const STATUS_UMUM = "Masyarakat/Pelaku Utama/Pelaku Usaha";
const STATUS_TARUNA = "Taruna Satuan Pendidikan KP";
const PEKERJAAN_UMUM = ["Nelayan", "Pembudidaya Ikan", "Pengolah Ikan", "Pemasar Ikan", "PNS", "Wiraswasta", "Pencari Kerja"];
const OTHER = "__other__";
const SATDIK = SATUAN_PENDIDIKAN_KEAHLIAN.map((x) => x.FullName);

const DOC_FIELDS: { key: DocKey; label: string; api: string; userKey: keyof User; required?: boolean; hint: string }[] = [
    { key: "pasFoto", label: "Pas Foto", api: "Fotos", userKey: "Foto", required: true, hint: "JPG/PNG, wajah jelas" },
    { key: "ktp", label: "E-KTP", api: "Ktps", userKey: "Ktp", required: true, hint: "Scan/foto KTP terbaca" },
    { key: "kk", label: "Kartu Keluarga", api: "KKs", userKey: "KK", hint: "Opsional" },
    { key: "ijazah", label: "Ijazah Terakhir", api: "Ijazahs", userKey: "Ijazah", hint: "Opsional" },
    { key: "suratKesehatan", label: "Surat Keterangan Sehat", api: "SuratKesehatans", userKey: "SuratKesehatan", hint: "Opsional" },
];

const FORM_STEPS: { name: string; sub: string; icon: IconType; accent: string }[] = [
    { name: "Info Pribadi", sub: "Identitas & data diri", icon: UserRound, accent: "#3B82F6" },
    { name: "Domisili", sub: "Alamat tinggal", icon: MapPin, accent: "#06B6D4" },
    { name: "Pekerjaan", sub: "Status kepesertaan", icon: Briefcase, accent: "#F59E0B" },
    { name: "Dokumen", sub: "Berkas pendukung", icon: FileText, accent: "#10B981" },
];

const MAX_MB = Math.round(MAX_FILE_SIZE / 1024 / 1024);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toForm = (u: User): ProfileForm => ({
    Nama: u.Nama || "",
    Nik: String(u.Nik ?? ""),
    NoTelpon: String(u.NoTelpon ?? ""),
    Email: u.Email || "",
    TanggalLahir: u.TanggalLahir || "",
    TempatLahir: u.TempatLahir || "",
    JenisKelamin: u.JenisKelamin || "",
    Agama: u.Agama || "",
    Pekerjaan: u.Pekerjaan || "",
    GolonganDarah: u.GolonganDarah || "",
    StatusMenikah: u.StatusMenikah || "",
    PendidikanTerakhir: u.PendidikanTerakhir || "",
    Kewarganegaraan: u.Kewarganegaraan || "",
    IbuKandung: u.IbuKandung || "",
    NegaraTujuanBekerja: u.NegaraTujuanBekerja || "",
    Alamat: u.Alamat || "",
    Provinsi: u.Provinsi || "",
    Kota: u.Kota || "",
});

function EditProfileForm({ user, initialStep = 0, onCancel, onSaved }: { user: User; initialStep?: number; onCancel?: () => void; onSaved?: () => void }) {
    const router = useRouter();
    const initial = useMemo(() => toForm(user), [user]);
    const [form, setForm] = useState<ProfileForm>(initial);
    const [step, setStep] = useState(initialStep);
    const [touched, setTouched] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);
    const [files, setFiles] = useState<Partial<Record<DocKey, File>>>({});

    // Status kepesertaan diturunkan dari pekerjaan tersimpan (dulu selalu kosong saat edit)
    const [status, setStatus] = useState(() => (initial.Pekerjaan ? (SATDIK.includes(initial.Pekerjaan) ? STATUS_TARUNA : STATUS_UMUM) : ""));
    // Teks "lainnya" disimpan terpisah — dulu input hilang setelah ketikan pertama
    const [jobChoice, setJobChoice] = useState(() => (!initial.Pekerjaan || PEKERJAAN_UMUM.includes(initial.Pekerjaan) || SATDIK.includes(initial.Pekerjaan) ? initial.Pekerjaan : OTHER));
    const [otherJob, setOtherJob] = useState(() => (jobChoice === OTHER ? initial.Pekerjaan : ""));

    const set = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) => setForm((f) => ({ ...f, [k]: v }));
    const pekerjaanFinal = status === STATUS_UMUM ? (jobChoice === OTHER ? otherJob.trim() : jobChoice) : status === STATUS_TARUNA ? jobChoice : "";

    // Kab/Kota difilter per provinsi bila data region punya field provinsi
    const kabOptions = useMemo(() => {
        const all = KABUPATENS as unknown as { kabupaten: string; provinsi?: string }[];
        const hasProv = all.some((k) => k.provinsi);
        const list = hasProv && form.Provinsi ? all.filter((k) => k.provinsi === form.Provinsi) : all;
        const names = Array.from(new Set(list.map((k) => k.kabupaten)));
        if (form.Kota && !names.includes(form.Kota)) names.unshift(form.Kota);
        return names;
    }, [form.Provinsi, form.Kota]);

    const docState = (d: (typeof DOC_FIELDS)[number]) => {
        const current = String(user[d.userKey] ?? "");
        return { current, has: !!files[d.key] || docOk(current) };
    };

    /* ---------- Validasi per langkah ---------- */
    const errorsOf = (i: number): Partial<Record<string, string>> => {
        const e: Record<string, string> = {};
        const req = (k: keyof ProfileForm, label: string) => !form[k].trim() && (e[k] = `${label} wajib diisi`);
        if (i === 0) {
            if (form.Email && !EMAIL_RE.test(form.Email)) e.Email = "Format email tidak valid";
            req("TanggalLahir", "Tanggal lahir");
            req("TempatLahir", "Tempat lahir");
            req("JenisKelamin", "Jenis kelamin");
            req("Agama", "Agama");
            req("PendidikanTerakhir", "Pendidikan");
            req("StatusMenikah", "Status menikah");
            req("IbuKandung", "Nama ibu kandung");
        }
        if (i === 1) {
            req("Provinsi", "Provinsi");
            req("Kota", "Kabupaten/kota");
            req("Alamat", "Alamat");
        }
        if (i === 2) {
            if (!status) e.status = "Pilih status kepesertaan";
            else if (!pekerjaanFinal) e.Pekerjaan = status === STATUS_TARUNA ? "Pilih satuan pendidikan" : "Pilih / isi pekerjaan";
        }
        if (i === 3) DOC_FIELDS.forEach((d) => d.required && !docState(d).has && (e[d.key] = `${d.label} wajib diunggah`));
        return e;
    };
    const stepErrors = FORM_STEPS.map((_, i) => errorsOf(i));
    const stepOk = (i: number) => Object.keys(stepErrors[i]).length === 0;
    const errs = touched.has(step) ? stepErrors[step] : {};
    const missing = Object.values(stepErrors[step]);

    const dirty = useMemo(
        () => Object.keys(files).length > 0 || (Object.keys(initial) as (keyof ProfileForm)[]).some((k) => (k === "Pekerjaan" ? pekerjaanFinal !== initial.Pekerjaan : form[k] !== initial[k])),
        [files, initial, form, pekerjaanFinal]
    );

    const go = (i: number) => {
        // Maju hanya bila langkah sebelumnya valid
        if (i > step) {
            for (let s = step; s < i; s++) {
                if (!stepOk(s)) {
                    setTouched((t) => new Set(t).add(s));
                    setStep(s);
                    return;
                }
            }
        }
        setStep(i);
    };
    const next = () => {
        setTouched((t) => new Set(t).add(step));
        if (stepOk(step)) setStep((s) => s + 1);
    };

    const pickFile = (key: DocKey, file?: File | null) => {
        if (!file) return;
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) return void Toast.fire({ icon: "error", title: "Format file tidak didukung" });
        if (file.size > MAX_FILE_SIZE) return void Toast.fire({ icon: "error", title: `Ukuran file maksimal ${MAX_MB}MB` });
        if (file.size < MIN_FILE_SIZE) return void Toast.fire({ icon: "error", title: "File terlalu kecil / rusak" });
        setFiles((f) => ({ ...f, [key]: file }));
    };

    const submit = async () => {
        const bad = FORM_STEPS.findIndex((_, i) => !stepOk(i));
        if (bad !== -1) {
            setTouched(new Set(FORM_STEPS.map((_, i) => i)));
            setStep(bad);
            Toast.fire({ icon: "warning", title: `Lengkapi langkah "${FORM_STEPS[bad].name}"` });
            return;
        }
        setSaving(true);
        const fd = new FormData();
        (Object.keys(form) as (keyof ProfileForm)[]).forEach((k) => fd.append(k, k === "Pekerjaan" ? pekerjaanFinal : form[k].trim()));
        DOC_FIELDS.forEach((d) => files[d.key] && fd.append(d.api, files[d.key] as File));

        try {
            await axios.put(`${baseUrl}/users/updateUsers`, fd, { headers: { ...authHeaders(), "Content-Type": "multipart/form-data" } });
            Toast.fire({ icon: "success", title: "Profil berhasil diperbarui!" });
            // Pengguna baru → kembali ke halaman asal (alur lama dipertahankan)
            if (Cookies.get("XSRF087")) {
                const redirect = Cookies.get("XSRF088");
                Cookies.remove("XSRF087");
                router.push(redirect || "/");
                return;
            }
            if (onSaved) onSaved();
            else router.push("/dashboard?tab=profil");
        } catch (e) {
            console.error(e);
            Toast.fire({ icon: "error", title: "Gagal memperbarui profil" });
        } finally {
            setSaving(false);
        }
    };

    const S = FORM_STEPS[step];
    const doneCount = FORM_STEPS.filter((_, i) => stepOk(i)).length;

    return (
        <div className="space-y-5">
            <PanelHeader icon={Pencil} accent="#8B5CF6" title="Perbarui Data Profil" desc="Data yang valid mempercepat verifikasi kepesertaan pelatihan.">
                {onCancel && (
                    <button type="button" onClick={onCancel} disabled={saving} className={`${ghostBtn} h-11 px-4`}>
                        <ArrowLeft className="w-4 h-4" /> Kembali ke profil
                    </button>
                )}
            </PanelHeader>

            <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
                {/* ---------- Timeline langkah (vertikal di desktop) ---------- */}
                <aside className="relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] ring-1 ring-white/10 p-4 lg:p-5 lg:sticky lg:top-48">
                    <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_0%_0%,#2563EB_0%,transparent_65%),radial-gradient(60%_60%_at_100%_100%,#0EA5E955_0%,transparent_65%)]" />
                    <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />

                    <div className="flex items-baseline justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/70">Kelengkapan</p>
                        <p className="text-lg font-black tabular-nums">{Math.round((doneCount / FORM_STEPS.length) * 100)}%</p>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-500" style={{ width: `${(doneCount / FORM_STEPS.length) * 100}%` }} />
                    </div>

                    <ol className="mt-4 grid grid-cols-4 lg:grid-cols-1 gap-1.5 lg:gap-0">
                        {FORM_STEPS.map((st, i) => {
                            const on = i === step;
                            const ok = stepOk(i);
                            const warn = touched.has(i) && !ok;
                            const Icon = st.icon;
                            return (
                                <li key={st.name} className="relative">
                                    {i < FORM_STEPS.length - 1 && <span aria-hidden className={`hidden lg:block absolute left-[1.35rem] top-12 bottom-0 w-px ${ok ? "bg-emerald-400/50" : "bg-white/15"}`} />}
                                    <button
                                        type="button"
                                        onClick={() => go(i)}
                                        aria-current={on ? "step" : undefined}
                                        style={{ ["--accent" as string]: st.accent }}
                                        className={`group relative isolate overflow-hidden w-full flex flex-col lg:flex-row items-center lg:items-start gap-1.5 lg:gap-3 rounded-2xl p-2 lg:p-2.5 text-center lg:text-left ring-1 transition-all ${focusRing} ${on ? "bg-white/[0.12] ring-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_26px_-12px_var(--accent)]" : "ring-transparent hover:bg-white/[0.06]"}`}
                                    >
                                        {on && <span aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: `linear-gradient(to left, ${st.accent}50 0%, transparent 75%)` }} />}
                                        <span
                                            className={`relative grid place-items-center w-9 h-9 rounded-xl ring-1 shrink-0 transition-all ${ok ? "bg-emerald-500 ring-emerald-300/50 text-white" : warn ? "bg-rose-500/20 ring-rose-400/50 text-rose-200" : on ? "ring-white/30 text-white [background:var(--accent)]" : "bg-white/10 ring-white/10 text-sky-100"}`}
                                        >
                                            {ok && !on ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                        </span>
                                        <span className="min-w-0">
                                            <span className={`block text-[11px] lg:text-sm font-bold leading-tight ${on ? "text-white" : "text-blue-100/80"}`}>{st.name}</span>
                                            <span className="hidden lg:block text-[10px] text-blue-100/50">{warn ? "Belum lengkap" : ok ? "Lengkap" : st.sub}</span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>

                    {dirty && (
                        <p className="hidden lg:flex mt-4 items-center gap-2 rounded-xl bg-amber-400/10 ring-1 ring-amber-300/20 px-3 py-2 text-[11px] text-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" /> Ada perubahan belum disimpan
                        </p>
                    )}
                </aside>

                {/* ---------- Panel langkah ---------- */}
                <div className={`${glass} min-w-0 overflow-hidden`}>
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 sm:px-7 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="relative isolate overflow-hidden w-10 h-10 rounded-xl bg-[#0B1B3F] ring-1 ring-white/10 grid place-items-center shrink-0">
                                <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${S.accent} 0%, transparent 70%)` }} />
                                <S.icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                    Langkah {step + 1} dari {FORM_STEPS.length}
                                </p>
                                <h3 className="font-calsans text-lg leading-tight">{S.name}</h3>
                            </div>
                        </div>
                    </div>

                    <div key={step} className="p-5 sm:p-7 animate-in fade-in-50 slide-in-from-right-2 duration-300">
                        {step === 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FField label="Nama lengkap" locked>
                                    <input value={form.Nama} readOnly className={fieldCls(false, true)} />
                                </FField>
                                <FField label="NIK" locked>
                                    <input value={form.Nik} readOnly className={`${fieldCls(false, true)} tabular-nums`} />
                                </FField>
                                <FField label="Nomor telepon" locked>
                                    <input value={form.NoTelpon} readOnly className={`${fieldCls(false, true)} tabular-nums`} />
                                </FField>
                                <FField label="Email" error={errs.Email}>
                                    <input type="email" value={form.Email} onChange={(e) => set("Email", e.target.value)} placeholder="email@aktif.com" className={fieldCls(!!errs.Email)} />
                                </FField>
                                <FField label="Tempat lahir" required error={errs.TempatLahir}>
                                    <input value={form.TempatLahir} onChange={(e) => set("TempatLahir", e.target.value)} placeholder="Kota kelahiran" className={fieldCls(!!errs.TempatLahir)} />
                                </FField>
                                <FField label="Tanggal lahir" required error={errs.TanggalLahir}>
                                    <input type="date" value={form.TanggalLahir} onChange={(e) => set("TanggalLahir", e.target.value)} className={`${fieldCls(!!errs.TanggalLahir)} [color-scheme:dark]`} />
                                </FField>
                                <FField label="Jenis kelamin" required error={errs.JenisKelamin}>
                                    <PillChoice value={form.JenisKelamin} onChange={(v) => set("JenisKelamin", v)} options={[{ v: "L", l: "Laki-laki" }, { v: "P", l: "Perempuan" }]} />
                                </FField>
                                <FField label="Status menikah" required error={errs.StatusMenikah}>
                                    <PillChoice value={form.StatusMenikah} onChange={(v) => set("StatusMenikah", v)} options={["Belum Menikah", "Sudah Menikah"].map((x) => ({ v: x, l: x }))} />
                                </FField>
                                <FField label="Agama" required error={errs.Agama}>
                                    <NSelect value={form.Agama} onChange={(v) => set("Agama", v)} placeholder="Pilih agama" options={["Islam", "Kristen Protestan", "Kristen Katolik", "Hindu", "Buddha", "Konghucu"]} invalid={!!errs.Agama} />
                                </FField>
                                <FField label="Pendidikan terakhir" required error={errs.PendidikanTerakhir}>
                                    <NSelect value={form.PendidikanTerakhir} onChange={(v) => set("PendidikanTerakhir", v)} placeholder="Pilih pendidikan" options={["SD", "SMP", "SMA/SMK", "DI/DII/DIII", "DIV/S1", "S2", "S3"]} invalid={!!errs.PendidikanTerakhir} />
                                </FField>
                                <FField label="Golongan darah">
                                    <NSelect value={form.GolonganDarah} onChange={(v) => set("GolonganDarah", v)} placeholder="Pilih golongan darah" options={["A", "B", "AB", "O", "-"]} />
                                </FField>
                                <FField label="Kewarganegaraan">
                                    <NSelect value={form.Kewarganegaraan} onChange={(v) => set("Kewarganegaraan", v)} placeholder="Pilih kewarganegaraan" options={["WNI", "WNA"]} />
                                </FField>
                                <FField label="Nama ibu kandung" required error={errs.IbuKandung}>
                                    <input value={form.IbuKandung} onChange={(e) => set("IbuKandung", e.target.value)} placeholder="Nama ibu kandung" className={fieldCls(!!errs.IbuKandung)} />
                                </FField>
                                <FField label="Negara tujuan kerja" hint="Opsional">
                                    <input value={form.NegaraTujuanBekerja} onChange={(e) => set("NegaraTujuanBekerja", e.target.value)} placeholder="Mis. Korea Selatan" className={fieldCls(false)} />
                                </FField>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FField label="Provinsi" required error={errs.Provinsi}>
                                    <NSelect
                                        value={form.Provinsi}
                                        onChange={(v) => setForm((f) => ({ ...f, Provinsi: v, Kota: v !== f.Provinsi ? "" : f.Kota }))}
                                        placeholder="Pilih provinsi"
                                        options={PROVINCES.map((p) => p.provinsi)}
                                        invalid={!!errs.Provinsi}
                                    />
                                </FField>
                                <FField label="Kabupaten / kota" required error={errs.Kota}>
                                    <NSelect value={form.Kota} onChange={(v) => set("Kota", v)} placeholder="Pilih kabupaten/kota" options={kabOptions} invalid={!!errs.Kota} />
                                </FField>
                                <FField label="Alamat lengkap" required error={errs.Alamat} hint={`${form.Alamat.length} karakter`} className="md:col-span-2">
                                    <textarea rows={4} value={form.Alamat} onChange={(e) => set("Alamat", e.target.value)} placeholder="Jalan, RT/RW, kelurahan, kecamatan…" className={`${fieldCls(!!errs.Alamat)} h-auto py-3`} />
                                </FField>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5">
                                <FField label="Status kepesertaan" required error={errs.status}>
                                    <div className="grid sm:grid-cols-2 gap-2.5">
                                        {[
                                            { v: STATUS_UMUM, l: "Umum / Pelaku Utama", d: "Nelayan, pembudidaya, pengolah, dll.", icon: Users },
                                            { v: STATUS_TARUNA, l: "Taruna / Siswa KKP", d: "Peserta didik satuan pendidikan KP", icon: GraduationCap },
                                        ].map((o) => {
                                            const on = status === o.v;
                                            return (
                                                <button
                                                    key={o.v}
                                                    type="button"
                                                    onClick={() => {
                                                        if (on) return;
                                                        setStatus(o.v);
                                                        setJobChoice("");
                                                        setOtherJob("");
                                                    }}
                                                    className={`flex items-start gap-3 rounded-2xl p-4 text-left ring-1 transition-all ${focusRing} ${on ? "bg-white/[0.12] ring-sky-300/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" : "bg-white/[0.04] ring-white/10 hover:bg-white/[0.08]"}`}
                                                >
                                                    <span className={`p-2 rounded-xl shrink-0 ${on ? "bg-sky-500 text-white" : "bg-white/10 text-sky-200"}`}>
                                                        <o.icon className="w-4 h-4" />
                                                    </span>
                                                    <span>
                                                        <span className="block text-sm font-bold">{o.l}</span>
                                                        <span className="block text-[11px] text-slate-400">{o.d}</span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </FField>

                                {status === STATUS_UMUM && (
                                    <FField label="Pekerjaan" required error={errs.Pekerjaan}>
                                        <div className="flex flex-wrap gap-2">
                                            {[...PEKERJAAN_UMUM, OTHER].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setJobChoice(p)}
                                                    className={`h-9 px-3.5 rounded-xl text-xs font-bold ring-1 transition-all ${focusRing} ${jobChoice === p ? "bg-white text-[#0B1B3F] ring-white" : "bg-white/[0.05] text-slate-300 ring-white/10 hover:bg-white/[0.1]"}`}
                                                >
                                                    {p === OTHER ? "Lainnya…" : p}
                                                </button>
                                            ))}
                                        </div>
                                        {jobChoice === OTHER && <input autoFocus value={otherJob} onChange={(e) => setOtherJob(e.target.value)} placeholder="Sebutkan pekerjaan Anda" className={`${fieldCls(!!errs.Pekerjaan)} mt-2.5`} />}
                                    </FField>
                                )}

                                {status === STATUS_TARUNA && (
                                    <FField label="Asal satuan pendidikan" required error={errs.Pekerjaan}>
                                        <NSelect value={jobChoice} onChange={setJobChoice} placeholder="Pilih satuan pendidikan" options={SATDIK} invalid={!!errs.Pekerjaan} />
                                    </FField>
                                )}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {DOC_FIELDS.map((d) => (
                                        <FileDrop key={d.key} field={d} current={docState(d).current} file={files[d.key]} error={errs[d.key]} onPick={(f) => pickFile(d.key, f)} onClear={() => setFiles((x) => ({ ...x, [d.key]: undefined }))} />
                                    ))}
                                </div>
                                <p className="flex items-start gap-2 rounded-2xl bg-sky-500/10 ring-1 ring-sky-400/20 p-3.5 text-[11px] text-sky-100/90 leading-relaxed">
                                    <ShieldCheck className="w-4 h-4 shrink-0 text-sky-300" />
                                    Pas Foto dan E-KTP wajib untuk memvalidasi kepemilikan akun. Format: {ALLOWED_EXTENSIONS.join(", ").toUpperCase()} · maks {MAX_MB}MB.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ---------- Navigasi ---------- */}
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 border-t border-white/10 bg-white/[0.03] px-5 sm:px-7 py-4">
                        <p className="text-[11px] text-slate-400 sm:mr-auto min-h-[1rem]">
                            {missing.length > 0 ? (
                                <span className="text-amber-200/90">
                                    Belum lengkap: {missing.length} isian{touched.has(step) ? "" : " wajib"}
                                </span>
                            ) : (
                                <span className="text-emerald-300/90">Langkah ini sudah lengkap</span>
                            )}
                        </p>
                        <div className="flex gap-2">
                            {step > 0 && (
                                <button type="button" onClick={() => setStep((s) => s - 1)} disabled={saving} className={`${ghostBtn} h-11 px-4`}>
                                    <ArrowLeft className="w-4 h-4" /> Kembali
                                </button>
                            )}
                            {step < FORM_STEPS.length - 1 ? (
                                <button type="button" onClick={next} className={`${primaryBtn} flex-1 sm:flex-none`}>
                                    {FORM_STEPS[step + 1].name} <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button type="button" onClick={submit} disabled={saving} className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-emerald-400 text-emerald-950 text-sm font-bold hover:bg-emerald-300 transition-colors disabled:opacity-60 flex-1 sm:flex-none ${focusRing}`}>
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? "Menyimpan…" : "Simpan profil"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const fieldCls = (invalid: boolean, locked = false) =>
    `w-full h-11 px-3.5 rounded-xl text-sm outline-none transition-all placeholder:text-slate-500 ${locked ? "bg-white/[0.03] ring-1 ring-white/5 text-slate-400 cursor-not-allowed" : invalid ? "bg-rose-500/[0.06] ring-1 ring-rose-400/50 focus:ring-2 focus:ring-rose-400/60" : "bg-white/[0.05] ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-sky-400/50"}`;

function FField({ label, required, locked, error, hint, className = "", children }: { label: string; required?: boolean; locked?: boolean; error?: string; hint?: string; className?: string; children: React.ReactNode }) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-baseline justify-between gap-2">
                <label className="text-[11px] font-semibold text-slate-300">
                    {label} {required && <span className="text-rose-400">*</span>}
                    {locked && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-normal text-slate-500">
                            <Lock className="w-2.5 h-2.5" /> terkunci
                        </span>
                    )}
                </label>
                {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
            </div>
            {children}
            {error && <p className="text-[11px] font-medium text-rose-300">{error}</p>}
        </div>
    );
}

function NSelect({ value, onChange, options, placeholder, invalid }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string; invalid?: boolean }) {
    return (
        <div className="relative">
            <select value={value} onChange={(e) => onChange(e.target.value)} className={`${fieldCls(!!invalid)} appearance-none pr-9 cursor-pointer ${value ? "text-white" : "text-slate-500"}`}>
                <option value="" className="bg-[#0B1B3F] text-slate-400">
                    {placeholder}
                </option>
                {options.map((o) => (
                    <option key={o} value={o} className="bg-[#0B1B3F] text-white">
                        {o}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
    );
}

function PillChoice({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
    return (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.05] ring-1 ring-white/10">
            {options.map((o) => (
                <button key={o.v} type="button" onClick={() => onChange(o.v)} className={`h-9 rounded-lg text-xs font-bold transition-all ${focusRing} ${value === o.v ? "bg-white text-[#0B1B3F] shadow" : "text-slate-300 hover:text-white"}`}>
                    {o.l}
                </button>
            ))}
        </div>
    );
}

function FileDrop({ field, current, file, error, onPick, onClear }: { field: (typeof DOC_FIELDS)[number]; current: string; file?: File; error?: string; onPick: (f?: File | null) => void; onClear: () => void }) {
    const [drag, setDrag] = useState(false);
    const preview = useMemo(() => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null), [file]);
    useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

    const hasOld = docOk(current);
    const oldIsImage = /\.(jpe?g|png|webp)$/i.test(current);
    const img = preview || (!file && hasOld && oldIsImage ? current : null);
    const inputId = `file-${field.key}`;

    return (
        <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-semibold text-slate-300">
                    {field.label} {field.required && <span className="text-rose-400">*</span>}
                </span>
                <span className="text-[10px] text-slate-500">{field.hint}</span>
            </div>
            <label
                htmlFor={inputId}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    onPick(e.dataTransfer.files?.[0]);
                }}
                className={`group relative flex items-center gap-3.5 min-h-[96px] rounded-2xl p-3.5 cursor-pointer ring-1 border border-dashed transition-all ${drag ? "bg-sky-500/10 ring-sky-400/50 border-sky-400/60" : error ? "bg-rose-500/[0.06] ring-rose-400/40 border-rose-400/40" : file ? "bg-emerald-500/[0.06] ring-emerald-400/30 border-emerald-400/30" : "bg-white/[0.04] ring-white/10 border-white/15 hover:bg-white/[0.07]"}`}
            >
                <span className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-white/[0.06] ring-1 ring-white/10 grid place-items-center">
                    {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : file || hasOld ? (
                        <FileText className="w-6 h-6 text-sky-300" />
                    ) : (
                        <UploadCloud className="w-6 h-6 text-slate-400 transition-transform group-hover:-translate-y-0.5" />
                    )}
                </span>
                <span className="min-w-0 flex-1">
                    {file ? (
                        <>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" /> File baru dipilih
                            </span>
                            <span className="block mt-0.5 text-[11px] text-slate-300 truncate" title={file.name}>
                                {file.name}
                            </span>
                            <span className="block text-[10px] text-slate-500 tabular-nums">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </>
                    ) : hasOld ? (
                        <>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-sky-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Sudah terunggah
                            </span>
                            <span className="block mt-0.5 text-[11px] text-slate-400">Klik / seret file untuk mengganti</span>
                        </>
                    ) : (
                        <>
                            <span className="block text-xs font-bold">Unggah berkas</span>
                            <span className="block mt-0.5 text-[11px] text-slate-400">Klik atau seret file ke sini · maks {MAX_MB}MB</span>
                        </>
                    )}
                </span>
                <input id={inputId} type="file" accept={ALLOWED_EXTENSIONS.map((x) => `.${x}`).join(",")} className="sr-only" onChange={(e) => (onPick(e.target.files?.[0]), (e.target.value = ""))} />
            </label>
            <div className="flex items-center justify-between min-h-[1rem]">
                {error ? <p className="text-[11px] font-medium text-rose-300">{error}</p> : <span />}
                <span className="flex gap-3">
                    {hasOld && !file && (
                        <a href={current} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300 hover:underline">
                            Lihat <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                    {file && (
                        <button type="button" onClick={onClear} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white">
                            <X className="w-3 h-3" /> Batalkan
                        </button>
                    )}
                </span>
            </div>
        </div>
    );
}

/**
 * Halaman mandiri /dashboard/edit-profile (alur pengguna baru tetap jalan).
 * Pakai di route: `export { FormCompleteProfile as default } from "@/components/dashboard-user/DashboardUser";`
 */
export function FormCompleteProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState(false);

    const load = useCallback(async () => {
        setError(false);
        try {
            const res = await axios.get<User>(`${baseUrl}/users/getUsersById`, { headers: authHeaders() });
            setUser(res.data);
        } catch (e) {
            console.error("Error fetching user detail:", e);
            setError(true);
        }
    }, []);
    useEffect(() => {
        load();
    }, [load]);

    return (
        <section className="relative min-h-screen overflow-hidden bg-[#020617] font-jakarta text-white px-4 pt-28 md:pt-36 pb-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_0%_0%,#2563EB33_0%,transparent_60%),radial-gradient(50%_50%_at_100%_100%,#0EA5E926_0%,transparent_60%)]" />
            <div className="relative max-w-6xl mx-auto">
                {error ? (
                    <div className={`${glass} mx-auto max-w-md p-8 text-center`}>
                        <AlertTriangle className="mx-auto w-6 h-6 text-rose-300" />
                        <p className="mt-3 font-bold">Data profil gagal dimuat</p>
                        <button type="button" onClick={load} className={`${primaryBtn} mt-5 h-10`}>
                            <RefreshCw className="w-4 h-4" /> Coba lagi
                        </button>
                    </div>
                ) : !user ? (
                    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                        <div className="h-80 rounded-3xl bg-white/[0.05] animate-pulse" />
                        <div className="h-[28rem] rounded-3xl bg-white/[0.05] animate-pulse" />
                    </div>
                ) : (
                    <EditProfileForm user={user} />
                )}
            </div>
        </section>
    );
}
