"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import { motion, MotionConfig } from "framer-motion";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiCopy,
  FiDownload,
  FiExternalLink,
  FiMaximize,
  FiMinimize,
  FiPlayCircle,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "@/components/ui/badge";
import { TimelineProgressPesertaPelatihan } from "./dashboard/Dashboard/TimelineProgressPesertaPelatihan";
import { useFetchDataInstrukturSelected } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { useFetchDataMateriPelatihanMasyarakatById } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { generateTanggalPelatihan } from "@/utils/text";
import { stringToArray } from "@/utils/input";
import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { ModulPelatihan } from "@/types/module";
import { User } from "@/types/user";

type UserPelatihan = NonNullable<User["Pelatihan"]>[number];

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const CERTIFICATE_BASE_URL =
  "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde";

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
const iconFor = (bidang?: string) =>
  (bidang && BIDANG_ICONS[bidang]) || DEFAULT_ICON;

const card = "rounded-2xl border border-white/10 bg-[#1e293b]/60";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";
const ghostButton =
  "gap-2 rounded-xl border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white";
const detailTabClass =
  "rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-slate-400 hover:text-white data-[state=active]:border-blue-400 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none";

const DETAIL_TABS = [
  { value: "ringkasan", label: "Ringkasan" },
  { value: "materi", label: "Materi" },
  { value: "pengajar", label: "Tenaga pelatih" },
  { value: "nilai", label: "Nilai & sertifikat" },
];

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-white/10 motion-reduce:animate-none ${className}`}
    />
  );
}

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

function StatusBadge({ text }: { text?: string }) {
  if (!text) return null;
  const t = text.toLowerCase();
  const tone = t.includes("tidak")
    ? "border-rose-400/30 bg-rose-500/10 text-rose-300"
    : t.includes("lulus") || t.includes("selesai")
      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
      : "border-blue-400/30 bg-blue-500/10 text-blue-300";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {text}
    </span>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 px-6 py-8 text-center text-sm text-slate-400">
      {children}
    </div>
  );
}

function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
    >
      <span className="flex items-center gap-2">
        <FiAlertCircle className="shrink-0" />
        {message}
      </span>
      <Button size="sm" variant="outline" onClick={onRetry} className={ghostButton}>
        <FiRefreshCw /> Coba lagi
      </Button>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h4 className="text-base font-semibold text-white">{children}</h4>;
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-white">{children}</dd>
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
      /* clipboard unavailable: ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-300 hover:bg-white/10 ${focusRing}`}
    >
      {copied ? <FiCheck /> : <FiCopy />}
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}

/** Deskripsi HTML yang dipangkas dengan CSS, jadi tag HTML tidak pernah terpotong. */
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
        className={`prose prose-invert prose-sm max-w-none text-slate-300 ${expanded ? "" : "max-h-40 overflow-hidden"
          } ${!expanded && overflowing
            ? "[mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
            : ""
          }`}
      />
      {(overflowing || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className={`mt-2 rounded-md text-sm font-semibold text-blue-300 hover:underline ${focusRing}`}
        >
          {expanded ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Detail tabs (data hooks live here so they only load when a tab is opened)  */
/* -------------------------------------------------------------------------- */

function ModulSection({ moduleId }: { moduleId: string | number }) {
  const {
    data: modul,
    loading,
    error,
    refetch,
  } = useFetchDataMateriPelatihanMasyarakatById(moduleId);
  const [openId, setOpenId] = useState<number | null>(null);

  if (!modul) {
    if (loading) return <ListSkeleton rows={3} />;
    if (error) {
      return (
        <InlineError message="Materi pelatihan tidak dapat dimuat." onRetry={refetch} />
      );
    }
    return <EmptyNote>Materi untuk pelatihan ini tidak ditemukan.</EmptyNote>;
  }

  const units = modul.ModulPelatihan ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-4">
        <div className="min-w-0">
          <p className="text-xs text-indigo-300">
            {modul.BidangMateriPelatihan} · {modul.Tahun}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-white">
            {modul.NamaMateriPelatihan}
          </p>
        </div>
        <Badge className="border-indigo-500/30 bg-indigo-500/20 text-xs font-semibold text-indigo-200">
          {units.length} unit modul
        </Badge>
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
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
                      <FiBookOpen />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-100">
                        {unit.NamaModulPelatihan}
                      </span>
                      {bahan.length > 0 && (
                        <span className="block text-xs text-slate-400">
                          {bahan.length} bahan tayang
                        </span>
                      )}
                    </span>
                    {bahan.length > 0 && (
                      <FiChevronDown
                        className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </button>
                  {unit.FileModule && (
                    <Link
                      href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${unit.FileModule}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 ${focusRing}`}
                    >
                      <FiDownload /> Unduh
                    </Link>
                  )}
                </div>

                {isOpen && (
                  <ul className="space-y-2 border-t border-white/5 bg-black/10 py-3 pl-16 pr-4">
                    {bahan.map((bt, i) => {
                      const href = bt.BahanTayang
                        ? `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${bt.BahanTayang}`
                        : bt.LinkVideo;
                      return (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-3 text-sm text-slate-300"
                        >
                          <span className="min-w-0 break-words">{bt.NamaBahanTayang}</span>
                          {href && (
                            <Link
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-300 hover:underline"
                            >
                              {bt.BahanTayang ? <FiExternalLink /> : <FiPlayCircle />}
                              {bt.BahanTayang ? "Buka" : "Tonton"}
                            </Link>
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
  const { instrukturs, loading, error, fetchInstrukturData } =
    useFetchDataInstrukturSelected(ids);
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
    if (error) {
      return <InlineError message="Data tenaga pelatih tidak dapat dimuat." onRetry={load} />;
    }
    return <EmptyNote>Data tenaga pelatih tidak ditemukan.</EmptyNote>;
  }

  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      {instrukturs.map((item) => {
        const subtitle = [item.jenjang_jabatan, item.eselon_1].filter(Boolean).join(" · ");
        return (
          <li
            key={item.IdInstruktur}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-200">
                {item.nama.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{item.nama}</p>
                {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
              </div>
            </div>
            <Badge className="border-amber-500/20 bg-amber-500/10 text-xs font-medium text-amber-300">
              {item.bidang_keahlian || "Instruktur"}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

function ScoreTile({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${highlight ? "border-blue-400/30 bg-blue-500/10" : "border-white/10 bg-white/5"
        }`}
    >
      <p className={`text-xs ${highlight ? "text-blue-300" : "text-slate-400"}`}>{label}</p>
      <p
        className={`mt-1 font-calsans text-3xl ${highlight ? "text-blue-200" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}

function certificateUrl(item: UserPelatihan) {
  return `${CERTIFICATE_BASE_URL}/${item.FileSertifikat}`;
}

function NilaiSection({ item }: { item: UserPelatihan }) {
  const hasScore = !!item.PostTest;
  const pre = Number(item.PreTest ?? 0);
  const post = Number(item.PostTest ?? 0);
  const certificateReady = item.StatusPenandatangan === "Done";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionTitle>Nilai</SectionTitle>
        {hasScore ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <ScoreTile label="Pre-test" value={pre} />
            <ScoreTile label="Post-test" value={post} />
            <ScoreTile label="Rata-rata" value={((pre + post) / 2).toFixed(1)} highlight />
          </div>
        ) : (
          <EmptyNote>
            Nilai belum tersedia. Nilai akan muncul setelah post-test selesai dinilai.
          </EmptyNote>
        )}
      </div>

      <div className="space-y-3">
        <SectionTitle>Sertifikat</SectionTitle>
        {certificateReady ? (
          <div className="flex flex-col gap-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-emerald-100">
              Sertifikat Anda sudah ditandatangani dan siap diunduh.
            </p>
            <Link
              href={certificateUrl(item)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500 ${focusRing}`}
            >
              <RiVerifiedBadgeFill className="text-lg" />
              Unduh sertifikat
            </Link>
          </div>
        ) : (
          <EmptyNote>
            Sertifikat belum tersedia. Tombol unduh akan muncul di sini setelah sertifikat
            selesai ditandatangani.
          </EmptyNote>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page-level states                                                          */
/* -------------------------------------------------------------------------- */

function PageSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Memuat daftar pelatihan">
      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Skeleton className="h-11 w-full rounded-xl" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="hidden h-96 w-full rounded-2xl lg:block" />
      </div>
      <span className="sr-only">Memuat…</span>
    </div>
  );
}

function PageError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-rose-500/10 text-rose-300">
        <FiAlertCircle size={26} />
      </div>
      <h2 className="mt-5 font-calsans text-2xl text-white">Pelatihan belum bisa dimuat</h2>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
      <Button
        onClick={onRetry}
        className="mt-6 gap-2 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-500"
      >
        <FiRefreshCw /> Coba lagi
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="relative mb-6 h-52 w-52">
        <Image
          src="/illustrations/not-found.png"
          alt=""
          fill
          sizes="208px"
          className="object-contain"
        />
      </div>
      <h2 className="font-calsans text-3xl text-white">Anda belum mengikuti pelatihan</h2>
      <p className="mt-3 max-w-md text-slate-400">
        Pelatihan kelautan dan perikanan yang Anda ikuti akan muncul di sini, lengkap dengan
        materi, nilai, dan sertifikat.
      </p>
      <Link
        href="/"
        className={`mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-500 ${focusRing}`}
      >
        Cari pelatihan <FiSearch />
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

function UserTrainingService(_props: { user: User | null }) {
  const sectionRef = useRef<HTMLElement>(null);

  // Daftar pelatihan milik pengguna
  const [userDetail, setUserDetail] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Pilihan & detail
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<PelatihanMasyarakat | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [detailTab, setDetailTab] = useState("ringkasan");
  const [isExpand, setIsExpand] = useState(false);
  const [keyword, setKeyword] = useState("");

  const detailCache = useRef(new Map<number, PelatihanMasyarakat>());
  const detailRequest = useRef(0);

  const loadUserDetail = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await axios.get<User>(`${elautBaseUrl}/users/getUsersById`, {
        headers: { Authorization: `Bearer ${Cookies.get("XSRF081")}` },
      });
      setUserDetail(response.data);
      setStatus("ready");
    } catch (error) {
      console.error("Error fetching user detail:", error);
      setErrorMessage(
        axios.isAxiosError(error) && error.response?.status === 401
          ? "Sesi Anda sudah berakhir. Silakan masuk kembali."
          : "Periksa koneksi internet Anda, lalu coba lagi.",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadUserDetail();
  }, [loadUserDetail]);

  const loadDetail = useCallback(async (id: number) => {
    const requestId = ++detailRequest.current;
    setDetailError(false);

    const cached = detailCache.current.get(id);
    if (cached) {
      setDetail(cached);
      setDetailLoading(false);
      return;
    }

    setDetail(null);
    setDetailLoading(true);
    try {
      const response = await axios.get<PelatihanMasyarakat>(
        `${elautBaseUrl}/getPelatihanUser?idPelatihan=${id}`,
        { headers: { Authorization: `Bearer ${Cookies.get("XSRF081")}` } },
      );
      detailCache.current.set(id, response.data);
      if (requestId === detailRequest.current) setDetail(response.data);
    } catch (error) {
      console.error("Error fetching detail pelatihan:", error);
      if (requestId === detailRequest.current) setDetailError(true);
    } finally {
      if (requestId === detailRequest.current) setDetailLoading(false);
    }
  }, []);

  const pelatihanList = useMemo(() => userDetail?.Pelatihan ?? [], [userDetail]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const newestFirst = pelatihanList.slice().reverse();
    if (!q) return newestFirst;
    return newestFirst.filter((p) =>
      `${p.NamaPelatihan} ${p.BidangPelatihan}`.toLowerCase().includes(q),
    );
  }, [pelatihanList, keyword]);

  const selectedUser = useMemo(
    () => pelatihanList.find((p) => p.IdPelatihan === selectedId) ?? null,
    [pelatihanList, selectedId],
  );

  const scrollToTopOnMobile = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      sectionRef.current?.scrollIntoView({ block: "start" });
    }
  };

  const handleSelect = (item: UserPelatihan) => {
    setSelectedId(item.IdPelatihan);
    setDetailTab("ringkasan");
    loadDetail(item.IdPelatihan);
    scrollToTopOnMobile();
  };

  const handleBack = () => {
    setSelectedId(null);
    setIsExpand(false);
    scrollToTopOnMobile();
  };

  const retryDetail = () => {
    if (selectedId !== null) loadDetail(selectedId);
  };

  const detailFallback = detailLoading ? (
    <ListSkeleton rows={3} />
  ) : (
    <InlineError message="Informasi pelatihan tidak dapat dimuat." onRetry={retryDetail} />
  );

  const tanggal = detail
    ? `${generateTanggalPelatihan(detail.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(detail.TanggalBerakhirPelatihan)}`
    : null;

  return (
    <MotionConfig reducedMotion="user">
      <section ref={sectionRef} className="relative w-full scroll-mt-20 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {status === "loading" && <PageSkeleton />}
          {status === "error" && <PageError message={errorMessage} onRetry={loadUserDetail} />}
          {status === "ready" && pelatihanList.length === 0 && <EmptyState />}

          {status === "ready" && pelatihanList.length > 0 && (
            <div className="space-y-8">
              {!isExpand && (
                <div className={`space-y-2 ${selectedUser ? "hidden lg:block" : ""}`}>
                  <h2 className="font-calsans text-3xl text-white md:text-4xl">
                    Pelatihan masyarakat
                  </h2>
                  <p className="max-w-2xl text-slate-400">
                    Lihat progres, buka materi, dan unduh sertifikat dari pelatihan yang Anda
                    ikuti.
                  </p>
                </div>
              )}

              <div
                className={`grid items-start gap-6 ${isExpand ? "" : "lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]"
                  }`}
              >
                {/* ───────────── Daftar pelatihan ───────────── */}
                <aside
                  className={`min-w-0 space-y-4 ${isExpand ? "hidden" : selectedUser ? "hidden lg:block" : "block"
                    }`}
                >
                  <div className="relative">
                    <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      aria-label="Cari pelatihan"
                      placeholder="Cari nama atau bidang pelatihan"
                      className="h-11 rounded-xl border-white/10 bg-[#1e293b]/60 pl-10 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-blue-400"
                    />
                    {keyword && (
                      <button
                        type="button"
                        onClick={() => setKeyword("")}
                        aria-label="Hapus pencarian"
                        className={`absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white ${focusRing}`}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>

                  <Tabs defaultValue="Luring dan Daring" className="w-full">
                    <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl border border-white/10 bg-[#1e293b]/60 p-1">
                      <TabsTrigger
                        value="Luring dan Daring"
                        className="rounded-lg py-2 text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        Luring dan Daring ({pelatihanList.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="Mandiri"
                        className="rounded-lg py-2 text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        Mandiri
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="Luring dan Daring" className="mt-4 space-y-3">
                      {keyword && (
                        <p className="text-xs text-slate-400" aria-live="polite">
                          Menampilkan {filtered.length} dari {pelatihanList.length} pelatihan
                        </p>
                      )}

                      {filtered.length === 0 ? (
                        <div className="space-y-3 rounded-xl border border-dashed border-white/10 p-8 text-center">
                          <p className="text-sm font-semibold text-white">
                            Tidak ada hasil untuk “{keyword}”
                          </p>
                          <p className="text-xs text-slate-400">
                            Periksa ejaan atau coba kata kunci yang lebih singkat.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setKeyword("")}
                            className={ghostButton}
                          >
                            Hapus pencarian
                          </Button>
                        </div>
                      ) : (
                        filtered.map((item) => {
                          const isActive = selectedId === item.IdPelatihan;
                          const certificateReady = item.StatusPenandatangan === "Done";
                          return (
                            <button
                              key={item.IdPelatihan}
                              type="button"
                              onClick={() => handleSelect(item)}
                              aria-current={isActive ? "true" : undefined}
                              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${focusRing} ${isActive
                                ? "border-blue-400 bg-blue-600/20"
                                : "border-white/10 bg-[#1e293b]/60 hover:border-white/25 hover:bg-[#1e293b]"
                                }`}
                            >
                              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white/5">
                                <Image
                                  width={40}
                                  height={40}
                                  alt=""
                                  src={iconFor(item.BidangPelatihan)}
                                  className="h-9 w-9 object-contain"
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span
                                  className={`line-clamp-2 block text-sm font-semibold ${isActive ? "text-blue-200" : "text-white"
                                    }`}
                                >
                                  {item.NamaPelatihan}
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-400">
                                  {item.BidangPelatihan}
                                </span>
                                <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <StatusBadge text={item.Keterangan} />
                                  {certificateReady && (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                                      <FiAward /> Sertifikat siap
                                    </span>
                                  )}
                                </span>
                              </span>
                              <FiChevronRight className="shrink-0 text-slate-500" />
                            </button>
                          );
                        })
                      )}
                    </TabsContent>

                    <TabsContent value="Mandiri" className="mt-4">
                      <EmptyNote>Belum ada pelatihan mandiri yang aktif.</EmptyNote>
                    </TabsContent>
                  </Tabs>
                </aside>

                {/* ───────────── Detail pelatihan ───────────── */}
                {selectedUser ? (
                  <motion.article
                    key={selectedUser.IdPelatihan}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`${card} min-w-0 p-5 sm:p-8`}
                  >
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className={`${ghostButton} lg:hidden`}
                      >
                        <FiArrowLeft /> Semua pelatihan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpand((v) => !v)}
                        className={`${ghostButton} ml-auto hidden lg:inline-flex`}
                      >
                        {isExpand ? <FiMinimize /> : <FiMaximize />}
                        {isExpand ? "Tampilkan daftar" : "Perluas"}
                      </Button>
                    </div>

                    <header className="flex items-start gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white/5">
                        <Image
                          width={48}
                          height={48}
                          alt=""
                          src={iconFor(selectedUser.BidangPelatihan)}
                          className="h-11 w-11 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <StatusBadge text={selectedUser.Keterangan} />
                        <h3 className="font-calsans text-2xl leading-tight text-white sm:text-3xl">
                          {selectedUser.NamaPelatihan}
                        </h3>
                      </div>
                    </header>

                    {selectedUser.StatusPenandatangan === "Done" && (
                      <Link
                        href={certificateUrl(selectedUser)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500 ${focusRing}`}
                      >
                        <RiVerifiedBadgeFill className="text-lg" />
                        Unduh sertifikat
                      </Link>
                    )}

                    <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                      <Fact label="Bidang">{selectedUser.BidangPelatihan || "-"}</Fact>
                      <Fact label="No. STTPL">
                        {selectedUser.NoRegistrasi ? (
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span className="break-all">{selectedUser.NoRegistrasi}</span>
                            <CopyButton
                              value={selectedUser.NoRegistrasi}
                              label="Salin nomor STTPL"
                            />
                          </span>
                        ) : (
                          "-"
                        )}
                      </Fact>
                      <Fact label="Tanggal pelatihan">
                        {detailLoading ? <Skeleton className="h-5 w-40" /> : tanggal || "-"}
                      </Fact>
                      <Fact label="Penyelenggara">
                        {detailLoading ? (
                          <Skeleton className="h-5 w-40" />
                        ) : (
                          detail?.PenyelenggaraPelatihan || "-"
                        )}
                      </Fact>
                    </dl>

                    {detailError && (
                      <div className="mt-4">
                        <InlineError
                          message="Jadwal dan penyelenggara tidak dapat dimuat."
                          onRetry={retryDetail}
                        />
                      </div>
                    )}

                    <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-8">
                      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-white/10 bg-transparent p-0">
                        {DETAIL_TABS.map((tab) => (
                          <TabsTrigger key={tab.value} value={tab.value} className={detailTabClass}>
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <TabsContent value="ringkasan" className="mt-6 space-y-8">
                        <section className="space-y-3">
                          <SectionTitle>Deskripsi pelatihan</SectionTitle>
                          <ExpandableHtml
                            key={selectedUser.IdPelatihan}
                            html={selectedUser.DetailPelatihan ?? ""}
                          />
                        </section>

                        {detail ? (
                          detail.UjiKompotensi !== "Portfolio" && (
                            <section className="space-y-3">
                              <SectionTitle>Progres pelatihan</SectionTitle>
                              <div className="rounded-xl bg-white/5 p-4 sm:p-6">
                                <TimelineProgressPesertaPelatihan
                                  userDetail={selectedUser}
                                  pelatihan={detail}
                                />
                              </div>
                            </section>
                          )
                        ) : detailLoading ? (
                          <Skeleton className="h-40 w-full rounded-xl" />
                        ) : null}
                      </TabsContent>

                      <TabsContent value="materi" className="mt-6 space-y-3">
                        <SectionTitle>Perangkat pelatihan</SectionTitle>
                        {detail ? (
                          detail.ModuleMateri ? (
                            <ModulSection
                              key={String(detail.ModuleMateri)}
                              moduleId={detail.ModuleMateri}
                            />
                          ) : (
                            <EmptyNote>Materi pelatihan belum tersedia.</EmptyNote>
                          )
                        ) : (
                          detailFallback
                        )}
                      </TabsContent>

                      <TabsContent value="pengajar" className="mt-6 space-y-3">
                        <SectionTitle>Tenaga pelatih</SectionTitle>
                        {detail ? (
                          detail.Instruktur ? (
                            <InstrukturSection
                              key={detail.Instruktur}
                              idsRaw={detail.Instruktur}
                            />
                          ) : (
                            <EmptyNote>Tenaga pelatih belum ditetapkan.</EmptyNote>
                          )
                        ) : (
                          detailFallback
                        )}
                      </TabsContent>

                      <TabsContent value="nilai" className="mt-6">
                        <NilaiSection item={selectedUser} />
                      </TabsContent>
                    </Tabs>
                  </motion.article>
                ) : (
                  <div className="hidden min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-10 text-center lg:flex">
                    <FiBookOpen className="text-3xl text-slate-500" />
                    <p className="mt-4 font-semibold text-white">Pilih pelatihan dari daftar</p>
                    <p className="mt-1 max-w-xs text-sm text-slate-400">
                      Detail, materi, tenaga pelatih, nilai, dan sertifikat akan tampil di sini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </MotionConfig>
  );
}

export default UserTrainingService;