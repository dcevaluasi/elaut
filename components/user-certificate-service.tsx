"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  FiAlertCircle,
  FiAward,
  FiCalendar,
  FiCheck,
  FiClock,
  FiCopy,
  FiDownload,
  FiFileText,
  FiLock,
  FiSearch,
  FiShield,
  FiX,
} from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { User } from "@/types/user";
import { generateTanggalPelatihan } from "@/utils/text";

type UserPelatihan = NonNullable<User["Pelatihan"]>[number];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cert = UserPelatihan & Record<string, any>;

/* -------------------------------------------------------------------------- */
/*  Tahap penerbitan & ketersediaan sertifikat                                 */
/* -------------------------------------------------------------------------- */

const CERTIFICATE_BASE_URL =
  "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde";

/**
 * Nama field status penerbitan di data pelatihan. Dicoba berurutan;
 * sesuaikan jika API memakai nama lain.
 */
const STATUS_PENERBITAN_KEYS = ["StatusPenerbitan", "StatusApproval"];

type Stage = { id: string; label: string; codes: string[] };

/**
 * Urutan tahap untuk progress bar. Pemetaan kode -> tahap dibuat eksplisit
 * (bukan berdasarkan urutan angka) karena kode seperti "1.25" tidak berurutan.
 *
 * Sertifikat tersedia mulai tahap "closed" (CLOSED_STAGE_INDEX). Kode status
 * yang tidak ada di tabel ini, atau kosong, dianggap belum tersedia.
 *
 * Kode 6-15 dan 7A-7D (STTPL, Kapus, Kabadan, Kabalai, Signed) digabung dalam
 * satu tahap "Penandatanganan". Pecah jadi beberapa tahap di sini kalau ingin
 * progress yang lebih detail.
 */
const STAGES: Stage[] = [
  { id: "draft", label: "Draft", codes: ["", "0", "0.1"] },
  { id: "spv", label: "Review SPV", codes: ["1", "1.1", "1.2"] },
  { id: "verifikator", label: "Verifikasi", codes: ["2", "3"] },
  { id: "approved", label: "Disetujui", codes: ["4"] },
  { id: "closed", label: "Closed", codes: ["1.25", "5"] },
  {
    id: "signing",
    label: "Penandatanganan",
    codes: [
      "6", "7", "8", "9", "10", "11", "12", "13", "14", "15",
      "7A", "7B", "7C", "7D",
    ],
  },
];

const CLOSED_STAGE_INDEX = STAGES.findIndex((s) => s.id === "closed");

const STAGE_INDEX_BY_CODE = new Map<string, number>();
STAGES.forEach((stage, index) => {
  stage.codes.forEach((code) => STAGE_INDEX_BY_CODE.set(code, index));
});

/** Nama status yang lebih spesifik daripada nama tahap. */
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

/** Status saat pelatihan dikembalikan untuk diperbaiki. */
const REVISION_CODES = new Set(["1.2", "3"]);

type Progress = {
  stageIndex: number;
  detail: string;
  revision: boolean;
};

function getStatusPenerbitan(item: Cert): string | null {
  for (const key of STATUS_PENERBITAN_KEYS) {
    const value = item[key];
    if (value !== undefined && value !== null) return String(value).trim();
  }
  return null;
}

function getProgress(item: Cert): Progress | null {
  const status = getStatusPenerbitan(item);
  if (status === null) return null;

  const stageIndex = STAGE_INDEX_BY_CODE.get(status);
  if (stageIndex === undefined) return null;

  return {
    stageIndex,
    detail: STATUS_DETAIL[status] ?? STAGES[stageIndex].label,
    revision: REVISION_CODES.has(status),
  };
}

export function isCertificateAvailable(item: Cert): boolean {
  const progress = getProgress(item);
  return progress !== null && progress.stageIndex >= CLOSED_STAGE_INDEX;
}

/* -------------------------------------------------------------------------- */
/*  UI helpers                                                                 */
/* -------------------------------------------------------------------------- */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400";

type FilterId = "all" | "available" | "pending";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "available", label: "Tersedia" },
  { id: "pending", label: "Belum tersedia" },
];

function CopyButton({ value }: { value: string }) {
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
      aria-label="Salin nomor sertifikat"
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-cyan-300 hover:bg-white/10 ${focusRing}`}
    >
      {copied ? <FiCheck /> : <FiCopy />}
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}

function StatusProgress({
  progress,
  available,
}: {
  progress: Progress;
  available: boolean;
}) {
  const { stageIndex, detail, revision } = progress;
  const total = STAGES.length;

  const tone = revision
    ? "text-rose-300"
    : available
      ? "text-emerald-300"
      : "text-amber-300";
  const currentBar = revision
    ? "bg-rose-400"
    : available
      ? "bg-emerald-400"
      : "bg-amber-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-slate-300">Status penerbitan</span>
        <span className="text-slate-400">
          Tahap {stageIndex + 1} dari {total}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Progres penerbitan sertifikat"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={stageIndex + 1}
        aria-valuetext={`Tahap ${stageIndex + 1} dari ${total}: ${detail}`}
        className="flex gap-1"
      >
        {STAGES.map((stage, i) => (
          <span
            key={stage.id}
            title={stage.label}
            className={`h-1.5 flex-1 rounded-full ${i < stageIndex
                ? "bg-cyan-400"
                : i === stageIndex
                  ? currentBar
                  : "bg-white/10"
              }`}
          />
        ))}
      </div>

      <p className={`flex items-center gap-1.5 text-sm font-medium ${tone}`}>
        {revision && <FiAlertCircle aria-hidden />}
        {detail}
      </p>
    </div>
  );
}

function CertificateCard({ cert, available }: { cert: Cert; available: boolean }) {
  const progress = getProgress(cert);
  const canDownload = available && !!cert.FileSertifikat;
  const endDate = cert.TanggalAkhirPelatihan || cert.TanggalExpiredSertifikat;

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 ${available ? "bg-[#1e293b]/60" : "bg-[#1e293b]/30"
        }`}
    >
      <div className="flex-1 space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`grid h-11 w-11 place-items-center rounded-xl ${available ? "bg-cyan-500/15 text-cyan-300" : "bg-white/5 text-slate-500"
              }`}
          >
            {available ? <FiAward size={22} /> : <FiLock size={20} />}
          </div>
          {available ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <RiVerifiedBadgeFill /> Tersedia
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
              <FiClock /> Belum tersedia
            </span>
          )}
        </div>

        <div>
          <h3 className="font-calsans text-lg leading-snug text-white">{cert.NamaPelatihan}</h3>
          {cert.BidangPelatihan && (
            <p className="mt-1 text-sm text-slate-400">{cert.BidangPelatihan}</p>
          )}
        </div>

        <dl className="space-y-2 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <FiCalendar className="shrink-0 text-cyan-400" aria-hidden />
            <dt className="sr-only">Tanggal selesai</dt>
            <dd>Selesai {endDate ? generateTanggalPelatihan(endDate) : "-"}</dd>
          </div>
          {available && (
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <FiFileText className="mt-0.5 shrink-0 text-cyan-400" aria-hidden />
                <dt className="sr-only">Nomor sertifikat</dt>
                <dd className="break-all">No. {cert.NoSertifikat}</dd>
              </div>
              <CopyButton value={cert.NoSertifikat} />
            </div>
          )}
        </dl>

        {progress && <StatusProgress progress={progress} available={available} />}

        {!available && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm">
            <p className="font-medium text-amber-100">Sertifikat belum bisa diunduh</p>
            <p className="mt-1 text-amber-200/80">
              Sertifikat tersedia setelah pelatihan berstatus Closed.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-white/10 bg-white/5 p-4">
        {canDownload ? (
          <a
            href={`${CERTIFICATE_BASE_URL}/${cert.FileSertifikat}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex h-11 min-w-[10rem] flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 text-sm font-semibold text-white hover:bg-cyan-500 ${focusRing}`}
          >
            <FiDownload /> Unduh sertifikat
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex h-11 min-w-[10rem] flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/5 px-4 text-sm font-semibold text-slate-500"
          >
            <FiLock /> {available ? "File belum siap" : "Belum bisa diunduh"}
          </button>
        )}
        {available && (
          <Link
            href={`/layanan/cek-sertifikat/${cert.NoSertifikat}`}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white ${focusRing}`}
          >
            <FiShield /> Verifikasi
          </Link>
        )}
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Memuat sertifikat"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-72 animate-pulse rounded-2xl border border-white/5 bg-white/5 motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

function Notice({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-slate-400">
        {icon}
      </div>
      <h3 className="mt-4 font-calsans text-xl text-white">{title}</h3>
      <div className="mt-2 max-w-sm text-sm text-slate-400">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function UserCertificateService({ user }: { user: User | null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  // Hanya pelatihan yang punya nomor sertifikat; yang sudah tersedia tampil lebih dulu.
  const certificates = useMemo(
    () =>
      ((user?.Pelatihan ?? []) as Cert[])
        .filter((p) => p.NoSertifikat && p.NoSertifikat !== "")
        .map((cert) => ({ cert, available: isCertificateAvailable(cert) }))
        .sort((a, b) => Number(b.available) - Number(a.available)),
    [user],
  );

  const counts: Record<FilterId, number> = useMemo(() => {
    const available = certificates.filter((c) => c.available).length;
    return {
      all: certificates.length,
      available,
      pending: certificates.length - available,
    };
  }, [certificates]);

  const visible = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return certificates.filter(({ cert, available }) => {
      if (filter === "available" && !available) return false;
      if (filter === "pending" && available) return false;
      if (!q) return true;
      // Nomor sertifikat baru bisa dicari setelah sertifikat tersedia.
      return (
        cert.NamaPelatihan.toLowerCase().includes(q) ||
        (available && cert.NoSertifikat.toLowerCase().includes(q))
      );
    });
  }, [certificates, filter, searchTerm]);

  const isFiltering = searchTerm.trim() !== "" || filter !== "all";
  const resetFilters = () => {
    setSearchTerm("");
    setFilter("all");
  };

  return (
    <div className="w-full space-y-8">
      <header className="space-y-2">
        <h2 className="font-calsans text-3xl text-white md:text-4xl">Koleksi e-sertifikat</h2>
        <p className="max-w-2xl text-slate-400">
          Sertifikat resmi dari pelatihan E-LAUT yang Anda ikuti. Sertifikat bisa diunduh setelah
          pelatihan selesai diproses.
        </p>
        {counts.all > 0 && (
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">{counts.available}</span> tersedia
            {counts.pending > 0 && (
              <>
                , <span className="font-semibold text-white">{counts.pending}</span> masih diproses
              </>
            )}
          </p>
        )}
      </header>

      {user === null ? (
        <CardSkeleton />
      ) : counts.all === 0 ? (
        <Notice icon={<FiFileText size={26} />} title="Belum ada sertifikat">
          Sertifikat dari pelatihan yang Anda ikuti akan muncul di sini setelah prosesnya selesai.
        </Notice>
      ) : (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                aria-label="Cari sertifikat"
                placeholder="Cari nama pelatihan atau nomor sertifikat"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`h-11 w-full rounded-xl border border-white/10 bg-[#1e293b]/60 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 ${focusRing}`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Hapus pencarian"
                  className={`absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white ${focusRing}`}
                >
                  <FiX />
                </button>
              )}
            </div>

            {counts.pending > 0 && counts.available > 0 && (
              <div role="group" aria-label="Filter sertifikat" className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${focusRing} ${filter === f.id
                        ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                        : "border-white/10 text-slate-300 hover:bg-white/5"
                      }`}
                  >
                    {f.label} ({counts[f.id]})
                  </button>
                ))}
              </div>
            )}
          </div>

          {isFiltering && (
            <p className="-mt-4 text-xs text-slate-400" aria-live="polite">
              Menampilkan {visible.length} dari {counts.all} sertifikat
            </p>
          )}

          {visible.length === 0 ? (
            <Notice icon={<FiSearch size={24} />} title="Tidak ada sertifikat yang cocok">
              <p>Periksa ejaan, coba kata kunci yang lebih singkat, atau ubah filter.</p>
              <button
                type="button"
                onClick={resetFilters}
                className={`mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 ${focusRing}`}
              >
                Hapus pencarian dan filter
              </button>
            </Notice>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map(({ cert, available }) => (
                <CertificateCard
                  key={`${cert.IdPelatihan}-${cert.NoSertifikat}`}
                  cert={cert}
                  available={available}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}