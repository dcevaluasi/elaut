import { PelatihanMasyarakat } from "@/types/product"
import { getStatusInfo } from "@/utils/text"
import { parseIndonesianDate } from "@/utils/time"

type Props = {
  data: PelatihanMasyarakat[]
  tahun: string
}

// ─── Status grouping for the data layer ──────────────────────────────────────
const ALL_STATUS_CODES = [
  "0", "1", "1.2",
  "2", "3", "4", "5", "6", "7",
  "8", "9", "11", "12", "13", "15",
]

export function groupPelatihanByStatus(
  data: PelatihanMasyarakat[],
  tahun?: string
) {
  const filtered = data.filter((item) => {
    if (!item.TanggalMulaiPelatihan) return false
    let d = new Date(item.TanggalMulaiPelatihan)
    if (isNaN(d.getTime())) {
      d = parseIndonesianDate(item.TanggalMulaiPelatihan) as Date
    }
    if (!d || isNaN(d.getTime())) return false
    const itemTahun = String(d.getFullYear())
    if (tahun && itemTahun !== tahun) return false
    return true
  })

  const counts = filtered.reduce<Record<string, number>>((acc, item) => {
    const status = item.StatusPenerbitan ?? ""
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  return ALL_STATUS_CODES.map((status) => ({
    status,
    count: counts[status] || 0,
    ...getStatusInfo(status),
  }))
}

// ─── Pipeline stage definitions ───────────────────────────────────────────────
// Each stage maps to one or more status codes with a readable name + color
const PIPELINE_STAGES = [
  {
    id: "persiapan",
    label: "Persiapan",
    sublabel: "Draft & pengajuan awal",
    codes: ["0"],
    color: "bg-pink-500",
    lightBg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
    dot: "bg-pink-400",
  },
  {
    id: "pending_spv",
    label: "Review SPV",
    sublabel: "Menunggu / perbaikan supervisor",
    codes: ["1", "1.2"],
    color: "bg-amber-500",
    lightBg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  {
    id: "pending_verifikator",
    label: "Review Verifikator",
    sublabel: "Menunggu / perbaikan verifikator",
    codes: ["2", "3", "4"],
    color: "bg-blue-500",
    lightBg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  {
    id: "pelaksanaan",
    label: "Pelaksanaan",
    sublabel: "Pelatihan berjalan (Closed)",
    codes: ["5", "6"],
    color: "bg-teal-500",
    lightBg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    dot: "bg-teal-400",
  },
  {
    id: "pending_sttpl",
    label: "Review STTPL",
    sublabel: "Menunggu / perbaikan sertifikat",
    codes: ["7", "8", "9"],
    color: "bg-pink-500",
    lightBg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
    dot: "bg-pink-400",
  },
  {
    id: "pending_kabadan",
    label: "Review Kabadan",
    sublabel: "Menunggu / perbaikan kepala badan",
    codes: ["12", "13"],
    color: "bg-amber-500",
    lightBg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  {
    id: "selesai",
    label: "Selesai & Bersertifikat",
    sublabel: "Sertifikat telah diterbitkan",
    codes: ["11", "15"],
    color: "bg-emerald-500",
    lightBg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },

] as const

// ─── Component ────────────────────────────────────────────────────────────────
export function StatsMetricStatus({ data, tahun }: Props) {
  const rawMetrics = groupPelatihanByStatus(data, tahun)
  const countByCode = Object.fromEntries(rawMetrics.map((m) => [m.status, m.count]))
  const grandTotal = rawMetrics.reduce((s, m) => s + m.count, 0)

  // Compute aggregated count per stage
  const stages = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    total: stage.codes.reduce((s, code) => s + (countByCode[code] ?? 0), 0),
    breakdown: stage.codes
      .map((code) => ({ code, count: countByCode[code] ?? 0, label: rawMetrics.find((m) => m.status === code)?.label ?? code }))
      .filter((b) => b.count > 0),
  }))

  const activeStages = stages.filter((s) => s.total > 0)
  const completed = stages.find((s) => s.id === "selesai")?.total ?? 0
  const completionPct = grandTotal > 0 ? Math.round((completed / grandTotal) * 100) : 0

  return (
    <div className="flex flex-col gap-5">

      {/* ── Summary header ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Pelatihan", value: grandTotal, color: "text-slate-800", sub: "dalam periode ini" },
          { label: "Belum Selesai", value: grandTotal - completed, color: "text-amber-600", sub: "masih dalam proses" },
          { label: "Sudah Selesai", value: completed, color: "text-emerald-600", sub: "sertifikat diterbitkan" },
          { label: "Tingkat Selesai", value: `${completionPct}%`, color: "text-indigo-600", sub: "dari total pelatihan" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-black tracking-tight ${s.color}`}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Progress bar (full pipeline) ────────────────────────────────── */}
      <div className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Distribusi Pipeline</p>
          <p className="text-[11px] font-semibold text-slate-500">{grandTotal} pelatihan</p>
        </div>
        <div className="flex w-full h-3 rounded-full overflow-hidden gap-px bg-slate-200">
          {activeStages.map((stage) => (
            <div
              key={stage.id}
              title={`${stage.label}: ${stage.total}`}
              className={`${stage.color} transition-all duration-700 first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${(stage.total / grandTotal) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
          {activeStages.map((stage) => (
            <div key={stage.id} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${stage.color} flex-shrink-0`} />
              <span className="text-[11px] font-medium text-slate-600">{stage.label}</span>
              <span className="text-[11px] font-black text-slate-800">{stage.total}</span>
              <span className="text-[10px] text-slate-400">({Math.round((stage.total / grandTotal) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stage cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {stages.map((stage) => {
          const pct = grandTotal > 0 ? Math.round((stage.total / grandTotal) * 100) : 0
          const isEmpty = stage.total === 0
          return (
            <div
              key={stage.id}
              className={`relative rounded-2xl border p-4 transition-all duration-300 overflow-hidden
                ${isEmpty
                  ? "bg-slate-50 border-slate-100 opacity-50"
                  : `${stage.lightBg} ${stage.border} hover:shadow-md hover:-translate-y-0.5`
                }`}
            >
              {/* Accent bar top */}
              <div className={`absolute top-0 left-0 h-1 w-full ${isEmpty ? "bg-slate-200" : stage.color} rounded-t-2xl`} />

              <div className="mt-1 flex flex-col gap-2">
                {/* Stage name + pct */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-xs font-black tracking-tight leading-tight ${isEmpty ? "text-slate-400" : stage.text}`}>
                      {stage.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">{stage.sublabel}</p>
                  </div>
                  {!isEmpty && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.lightBg} ${stage.text} border ${stage.border} flex-shrink-0`}>
                      {pct}%
                    </span>
                  )}
                </div>

                {/* Count */}
                <p className={`text-3xl font-black tracking-tight ${isEmpty ? "text-slate-300" : "text-slate-800"}`}>
                  {stage.total}
                </p>

                {/* Mini progress */}
                <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden border border-slate-100">
                  <div
                    className={`h-full ${isEmpty ? "bg-slate-200" : stage.color} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Breakdown of sub-statuses */}
                {stage.breakdown.length > 0 && (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {stage.breakdown.map((b) => (
                      <div key={b.code} className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-medium truncate">{b.label}</span>
                        <span className="text-[10px] font-black text-slate-700 ml-2">{b.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
