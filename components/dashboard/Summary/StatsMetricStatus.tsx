"use client"

import React, { useMemo } from "react"
import { ChevronRight, AlertTriangle, CheckCircle2, Loader } from "lucide-react"
import { PelatihanMasyarakat } from "@/types/product"
import { getStatusInfo } from "@/utils/text"
import { parseIndonesianDate } from "@/utils/time"

type Props = {
  data: PelatihanMasyarakat[]
  tahun?: string
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/** Tahun dari "YYYY-MM-DD", "DD-MM-YYYY", ISO, atau tanggal Indonesia */
const getYear = (s?: string | null): string | null => {
  if (!s) return null
  if (s.includes("-")) {
    const parts = s.split("-")
    const y = parts[0].length === 4 ? parts[0] : parts[2]?.slice(0, 4)
    return y && /^\d{4}$/.test(y) ? y : null
  }
  const d = parseIndonesianDate(s)
  return d && !isNaN(d.getTime()) ? String(d.getFullYear()) : null
}

const filterByYear = (data: PelatihanMasyarakat[], tahun?: string) =>
  tahun ? data.filter((item) => getYear(item.TanggalMulaiPelatihan) === tahun) : data

/* ─── Data layer (API tetap sama untuk pemakai lain) ───────────────────────── */

const ALL_STATUS_CODES = ["0", "1", "1.2", "2", "3", "4", "5", "6", "7", "8", "9", "11", "12", "13", "15"]

export function groupPelatihanByStatus(data: PelatihanMasyarakat[], tahun?: string) {
  const counts: Record<string, number> = {}
  for (const item of filterByYear(data, tahun)) {
    const s = item.StatusPenerbitan ?? ""
    counts[s] = (counts[s] || 0) + 1
  }
  return ALL_STATUS_CODES.map((status) => ({
    status,
    count: counts[status] || 0,
    ...getStatusInfo(status),
  }))
}

/* ─── Pipeline stages ──────────────────────────────────────────────────────── */

const PIPELINE_STAGES = [
  { id: "persiapan", label: "Persiapan", sublabel: "Draft & pengajuan awal", codes: ["0"], color: "bg-slate-400", soft: "bg-slate-50 dark:bg-slate-800/50", ring: "ring-slate-200 dark:ring-slate-700", text: "text-slate-700 dark:text-slate-200" },
  { id: "pending_spv", label: "Review SPV", sublabel: "Menunggu / perbaikan supervisor", codes: ["1", "1.2"], color: "bg-amber-500", soft: "bg-amber-50 dark:bg-amber-950/30", ring: "ring-amber-200 dark:ring-amber-900", text: "text-amber-700 dark:text-amber-300" },
  { id: "pending_verifikator", label: "Review Verifikator", sublabel: "Menunggu / perbaikan verifikator", codes: ["2", "3", "4"], color: "bg-blue-500", soft: "bg-blue-50 dark:bg-blue-950/30", ring: "ring-blue-200 dark:ring-blue-900", text: "text-blue-700 dark:text-blue-300" },
  { id: "pelaksanaan", label: "Pelaksanaan", sublabel: "Pelatihan berjalan (Closed)", codes: ["5", "6"], color: "bg-teal-500", soft: "bg-teal-50 dark:bg-teal-950/30", ring: "ring-teal-200 dark:ring-teal-900", text: "text-teal-700 dark:text-teal-300" },
  { id: "pending_sttpl", label: "Review STTPL", sublabel: "Menunggu / perbaikan sertifikat", codes: ["7", "8", "9"], color: "bg-violet-500", soft: "bg-violet-50 dark:bg-violet-950/30", ring: "ring-violet-200 dark:ring-violet-900", text: "text-violet-700 dark:text-violet-300" },
  { id: "pending_kabadan", label: "Review Kabadan", sublabel: "Menunggu / perbaikan kepala badan", codes: ["12", "13"], color: "bg-orange-500", soft: "bg-orange-50 dark:bg-orange-950/30", ring: "ring-orange-200 dark:ring-orange-900", text: "text-orange-700 dark:text-orange-300" },
  { id: "selesai", label: "Selesai", sublabel: "Sertifikat telah diterbitkan", codes: ["11", "15"], color: "bg-emerald-500", soft: "bg-emerald-50 dark:bg-emerald-950/30", ring: "ring-emerald-200 dark:ring-emerald-900", text: "text-emerald-700 dark:text-emerald-300" },
] as const

// Status yang tidak masuk tahap mana pun → "Lainnya" (agar total tetap akurat)
const OTHER_STAGE = {
  id: "lainnya",
  label: "Lainnya",
  sublabel: "Status di luar pipeline utama",
  codes: [] as string[],
  color: "bg-zinc-400",
  soft: "bg-zinc-50 dark:bg-zinc-800/50",
  ring: "ring-zinc-200 dark:ring-zinc-700",
  text: "text-zinc-600 dark:text-zinc-300",
}

type Stage = (typeof PIPELINE_STAGES)[number] | typeof OTHER_STAGE

const CODE_TO_STAGE = new Map<string, Stage>()
PIPELINE_STAGES.forEach((s) => s.codes.forEach((c) => CODE_TO_STAGE.set(c, s)))

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0)
const fmt = (n: number) => n.toLocaleString("id-ID")

/* ─── Component ────────────────────────────────────────────────────────────── */

export function StatsMetricStatus({ data, tahun }: Props) {
  const { stages, grandTotal, completed, bottleneck } = useMemo(() => {
    // 1 pass: hitung per kode status
    const byCode = new Map<string, number>()
    let total = 0
    for (const item of filterByYear(data, tahun)) {
      const code = String(item.StatusPenerbitan ?? "")
      byCode.set(code, (byCode.get(code) || 0) + 1)
      total++
    }

    // Agregasi per tahap
    const agg = new Map<string, { stage: Stage; total: number; breakdown: { code: string; label: string; count: number }[] }>()
    for (const s of [...PIPELINE_STAGES, OTHER_STAGE]) agg.set(s.id, { stage: s, total: 0, breakdown: [] })

    byCode.forEach((count, code) => {
      const entry = agg.get((CODE_TO_STAGE.get(code) ?? OTHER_STAGE).id)!
      entry.total += count
      entry.breakdown.push({ code, label: getStatusInfo(code).label, count })
    })

    const list = Array.from(agg.values())
      .filter((s) => s.stage.id !== "lainnya" || s.total > 0)
      .map((s) => ({ ...s, breakdown: s.breakdown.sort((a, b) => b.count - a.count) }))

    const done = agg.get("selesai")!.total
    // Tahap (non-selesai) dengan pelatihan terbanyak = hambatan utama
    const neck = list
      .filter((s) => s.stage.id !== "selesai" && s.stage.id !== "lainnya" && s.total > 0)
      .sort((a, b) => b.total - a.total)[0]

    return { stages: list, grandTotal: total, completed: done, bottleneck: neck ?? null }
  }, [data, tahun])

  const inProgress = grandTotal - completed
  const completionPct = pct(completed, grandTotal)
  const activeStages = stages.filter((s) => s.total > 0)

  if (grandTotal === 0) {
    return (
      <div className="py-12 flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Loader className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-black text-slate-700 dark:text-slate-200">Belum ada pelatihan pada periode ini</p>
        <p className="text-xs text-slate-400">Pipeline akan tampil setelah pelatihan didaftarkan.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Ringkasan ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Completion ring */}
        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-100 dark:ring-slate-800 px-4 py-3">
          <div
            className="relative w-14 h-14 rounded-full shrink-0"
            style={{ background: `conic-gradient(rgb(16 185 129) ${completionPct * 3.6}deg, rgb(226 232 240) 0deg)` }}
          >
            <div className="absolute inset-[5px] rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
              <span className="text-xs font-black text-slate-800 dark:text-white tabular-nums">{completionPct}%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tingkat Selesai</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">
              {fmt(completed)} <span className="font-medium text-slate-400">/ {fmt(grandTotal)}</span>
            </p>
          </div>
        </div>

        <MiniStat
          icon={<Loader className="w-4 h-4" />}
          tone="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300"
          label="Masih Diproses"
          value={fmt(inProgress)}
          sub="belum terbit sertifikat"
        />

        <MiniStat
          icon={bottleneck ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          tone={bottleneck ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"}
          label="Antrian Terbanyak"
          value={bottleneck ? bottleneck.stage.label : "Tidak ada"}
          sub={bottleneck ? `${fmt(bottleneck.total)} pelatihan menunggu` : "semua tahap lancar"}
        />
      </div>

      {/* ── Distribusi pipeline ───────────────────────────────────────── */}
      <div className="rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800 px-5 py-4">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Distribusi Pipeline</p>
          <p className="text-[11px] font-semibold text-slate-500">{fmt(grandTotal)} pelatihan</p>
        </div>
        <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100 dark:bg-slate-800">
          {activeStages.map((s) => (
            <div
              key={s.stage.id}
              title={`${s.stage.label}: ${fmt(s.total)} (${pct(s.total, grandTotal)}%)`}
              className={`${s.stage.color} transition-all duration-700 hover:brightness-110`}
              style={{ width: `${(s.total / grandTotal) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
          {activeStages.map((s) => (
            <div key={s.stage.id} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${s.stage.color}`} />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{s.stage.label}</span>
              <span className="text-[11px] font-black text-slate-800 dark:text-white tabular-nums">{fmt(s.total)}</span>
              <span className="text-[10px] text-slate-400">({pct(s.total, grandTotal)}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Alur tahap (stepper) ──────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1 snap-x">
        {stages.map((s, i) => {
          const isEmpty = s.total === 0
          const isNeck = bottleneck?.stage.id === s.stage.id
          const share = pct(s.total, grandTotal)
          return (
            <React.Fragment key={s.stage.id}>
              <div
                className={`snap-start relative shrink-0 w-[190px] rounded-2xl p-4 ring-1 transition-all duration-300 ${isEmpty
                  ? "bg-white dark:bg-slate-900 ring-slate-100 dark:ring-slate-800 opacity-60"
                  : `${s.stage.soft} ${isNeck ? "ring-2 ring-amber-400" : s.stage.ring} hover:-translate-y-0.5 hover:shadow-md`
                  }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black text-white ${isEmpty ? "bg-slate-300 dark:bg-slate-700" : s.stage.color}`}>
                    {s.stage.id === "lainnya" ? "?" : i + 1}
                  </span>
                  {isNeck ? (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-white">Terbanyak</span>
                  ) : (
                    !isEmpty && <span className={`text-[10px] font-bold ${s.stage.text}`}>{share}%</span>
                  )}
                </div>

                <p className={`text-xs font-black leading-tight ${isEmpty ? "text-slate-400" : s.stage.text}`}>{s.stage.label}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight line-clamp-2 min-h-[24px]">{s.stage.sublabel}</p>

                <p className={`mt-2 text-3xl font-black tracking-tight tabular-nums ${isEmpty ? "text-slate-300 dark:text-slate-600" : "text-slate-800 dark:text-white"}`}>
                  {fmt(s.total)}
                </p>

                <div className="mt-2 h-1.5 bg-white/70 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${isEmpty ? "" : s.stage.color}`} style={{ width: `${share}%` }} />
                </div>

                {s.breakdown.length > 0 && (
                  <ul className="mt-2.5 space-y-0.5">
                    {s.breakdown.slice(0, 3).map((b) => (
                      <li key={b.code} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium truncate">{b.label}</span>
                        <span className="font-black text-slate-700 dark:text-slate-200 ml-2 tabular-nums">{fmt(b.count)}</span>
                      </li>
                    ))}
                    {s.breakdown.length > 3 && (
                      <li className="text-[10px] text-slate-400 font-medium">+{s.breakdown.length - 3} status lain</li>
                    )}
                  </ul>
                )}
              </div>

              {i < stages.length - 1 && (
                <div className="shrink-0 self-center text-slate-300 dark:text-slate-600">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

/* ─── UI kecil ─────────────────────────────────────────────────────────────── */

function MiniStat({ icon, tone, label, value, sub }: { icon: React.ReactNode; tone: string; label: string; value: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-100 dark:ring-slate-800 px-4 py-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-black text-slate-800 dark:text-white truncate">{value}</p>
        <p className="text-[11px] text-slate-400 font-medium truncate">{sub}</p>
      </div>
    </div>
  )
}
