"use client"

import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import getDocument from "@/firebase/firestore/getData"
import { HistoryItem, HistoryTraining, PelatihanMasyarakat } from "@/types/product"
import { parseCustomDate } from "@/firebase/firestore/services"
import { History, Clock, Building2, MessageSquareText, RefreshCw, Search, X, Inbox } from "lucide-react"

interface HistoryButtonProps {
  statusPelatihan?: string
  idPelatihan?: string
  pelatihan: PelatihanMasyarakat
  handleFetchingData?: any
  isFloating?: boolean
  statusLabel?: string
  statusStage?: string | number
  /** "dark" = di atas latar navy (hero), "light" = di atas latar terang */
  tone?: "dark" | "light"
}

/* ============================ CACHE BERSAMA ============================
 * Satu fetch per KodePelatihan untuk semua instance (hero, floating, dll).
 * Data lama langsung tampil, revalidasi berjalan di belakang (stale-while-revalidate).
 * ===================================================================== */

type Entry = { data: HistoryTraining | null; loading: boolean; error: boolean; at: number }
const COLLECTION = "historical-training-notes"
const STALE_MS = 30_000
const store = new Map<string, Entry>()
const inflight = new Map<string, Promise<void>>()
const listeners = new Set<() => void>()
const EMPTY: Entry = { data: null, loading: false, error: false, at: 0 }

const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

function loadHistory(kode: string, force = false) {
  const cur = store.get(kode)
  if (!force && cur && Date.now() - cur.at < STALE_MS) return Promise.resolve()
  const running = inflight.get(kode)
  if (running) return running

  store.set(kode, { ...(cur ?? EMPTY), loading: true, error: false })
  emit()

  const p: Promise<void> = getDocument(COLLECTION, kode)
    .then((doc: any) => {
      store.set(kode, { data: (doc?.data as HistoryTraining) ?? null, loading: false, error: false, at: Date.now() })
    })
    .catch((err: unknown) => {
      console.error("Error fetching history training:", err)
      store.set(kode, { ...(store.get(kode) ?? EMPTY), loading: false, error: true })
    })
    .finally(() => {
      inflight.delete(kode)
      emit()
    })
  inflight.set(kode, p)
  return p
}

/** Panggil setelah menambah catatan agar semua tombol riwayat ikut segar */
export const invalidateHistory = (kode?: string) => (kode ? loadHistory(kode, true) : Promise.resolve())

function useHistory(kode?: string) {
  const entry = useSyncExternalStore(
    subscribe,
    () => (kode ? store.get(kode) ?? EMPTY : EMPTY),
    () => EMPTY
  )
  useEffect(() => {
    if (kode) loadHistory(kode)
  }, [kode])
  const refresh = useCallback(() => (kode ? loadHistory(kode, true) : Promise.resolve()), [kode])
  return { ...entry, refresh }
}

/* ============================ KOMPONEN ============================ */

const HistoryButton: React.FC<HistoryButtonProps> = ({ pelatihan, statusPelatihan, isFloating = true, statusLabel, statusStage, tone = "light" }) => {
  const kode = pelatihan?.KodePelatihan
  const { data, loading, error, refresh } = useHistory(kode)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [role, setRole] = useState("")

  // Saat dibuka: data cache langsung tampil, revalidasi di belakang
  useEffect(() => {
    if (open && kode) loadHistory(kode)
    if (!open) {
      setQ("")
      setRole("")
    }
  }, [open, kode])

  // Urutkan & parse tanggal sekali
  const items = useMemo(() => {
    const list = data?.historical ?? []
    return list
      .map((it: HistoryItem) => ({ it, t: parseCustomDate(it.created_at)?.getTime?.() || 0, hay: `${it.role ?? ""} ${it.upt ?? ""} ${it.notes ?? ""}`.toLowerCase() }))
      .sort((a, b) => b.t - a.t)
  }, [data])

  const roles = useMemo(() => Array.from(new Set(items.map((x) => x.it.role).filter(Boolean))) as string[], [items])
  const term = q.trim().toLowerCase()
  const resetFilter = () => {
    setQ("")
    setRole("")
  }
  const shown_ = useMemo(() => items.filter((x) => (!role || x.it.role === role) && (!term || x.hay.includes(term))), [items, role, term])

  const count = items.length
  const activeStatus = statusLabel || statusPelatihan || pelatihan?.Status || ""
  const activeStage = statusStage !== undefined && statusStage !== "" ? `Stage ${statusStage}` : pelatihan?.StatusPenerbitan ? `Stage ${pelatihan.StatusPenerbitan}` : ""
  const initialLoading = loading && !data

  /* ---------- Trigger (glassmorphism) ---------- */
  const glassDark =
    "text-white bg-gradient-to-br from-white/[0.22] to-white/[0.06] ring-1 ring-white/30 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(255,255,255,0.08),0_10px_30px_-10px_rgba(14,165,233,0.55)] hover:from-white/[0.3] hover:to-white/[0.1] hover:ring-white/45"
  const glassLight =
    "text-[#0B1B3F] dark:text-white bg-gradient-to-br from-white/90 via-white/60 to-sky-100/50 dark:from-white/15 dark:via-white/5 dark:to-sky-400/10 ring-1 ring-white dark:ring-white/20 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_10px_30px_-12px_rgba(37,99,235,0.45),0_0_0_1px_rgba(148,163,184,0.25)] hover:to-sky-100/80"

  const triggerInner = (dark: boolean) => (
    <>
      {/* kilau kaca + sapuan cahaya saat hover */}
      <span aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b ${dark ? "from-white/25" : "from-white"} to-transparent opacity-70`} />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-[300%]" />
      <span className={`relative flex h-6 w-6 items-center justify-center rounded-lg ${dark ? "bg-white/20" : "bg-[#0B1B3F] text-white"}`}>
        <History className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-45" />
      </span>
      <span className="relative">Riwayat</span>
      {count > 0 ? (
        <span className={`relative min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black tabular-nums flex items-center justify-center ${dark ? "bg-white/25" : "bg-sky-500 text-white"}`}>{count}</span>
      ) : (
        loading && <RefreshCw className="relative h-3 w-3 animate-spin opacity-60" />
      )}
    </>
  )

  const trigger = isFloating ? (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-1.5 pl-4 rounded-full text-white bg-[#0B1B3F]/70 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_20px_40px_-12px_rgba(11,27,63,0.65)] animate-in fade-in slide-in-from-bottom-3"
    >
      {(activeStatus || activeStage) && (
        <span className="flex items-center gap-2.5 pr-3 border-r border-white/15 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="flex flex-col text-left leading-tight min-w-0">
            {activeStage && <span className="text-[9px] font-black uppercase tracking-wider text-sky-300">{activeStage}</span>}
            {activeStatus && <span className="text-xs font-bold truncate max-w-[140px]">{activeStatus}</span>}
          </span>
        </span>
      )}
      <span className={`group relative isolate overflow-hidden inline-flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-full text-xs font-bold transition-all duration-300 ${glassDark}`}>{triggerInner(true)}</span>
    </button>
  ) : (
    <button
      type="button"
      className={`group relative isolate overflow-hidden inline-flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-xl text-xs font-bold transition-all duration-300 hover:-translate-y-px ${tone === "dark" ? glassDark : glassLight}`}
    >
      {triggerInner(tone === "dark")}
    </button>
  )

  // Kelompokkan per hari (Hari ini / Kemarin / tanggal)
  const groups = useMemo(() => {
    const out: { label: string; rows: typeof shown_ }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (const r of shown_) {
      let label = "Tanpa tanggal"
      if (r.t) {
        const d = new Date(r.t)
        d.setHours(0, 0, 0, 0)
        const diff = Math.round((today.getTime() - d.getTime()) / 86_400_000)
        label = diff === 0 ? "Hari ini" : diff === 1 ? "Kemarin" : DATE_FMT.format(d)
      }
      const g = out[out.length - 1]
      if (g && g.label === label) g.rows.push(r)
      else out.push({ label, rows: [r] })
    }
    return out
  }, [shown_])

  const latestKey = items[0] ? `${items[0].it.created_at}-${items[0].t}` : ""

  /* ---------- Drawer: mount + animasi + Esc + kunci scroll ---------- */
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (open) {
      setMounted(true)
      const r = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(r)
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), 300)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  /* ---------- Render ---------- */
  return (
    <>
      {React.cloneElement(trigger, { onClick: () => setOpen(true), "aria-haspopup": "dialog", "aria-expanded": open })}

      {mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="Riwayat catatan pelaksanaan">
            {/* Overlay */}
            <div
              onClick={() => setOpen(false)}
              className={`absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
            />

            {/* Panel kaca dari kanan */}
            <aside
              className={`absolute inset-y-0 right-0 w-[92vw] max-w-xl flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-2xl transition-transform duration-300 ease-out ${shown ? "translate-x-0" : "translate-x-full"}`}
            >
              {/* Header hero */}
              <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 md:px-6 py-5">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(60%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-90" />
                <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                <History aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 text-sky-300 opacity-20" />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">
                      <History className="w-3.5 h-3.5" /> Riwayat Catatan
                    </p>
                    <h2 className="mt-1 text-[15px] font-black leading-snug line-clamp-2 break-words">{pelatihan?.NamaPelatihan || "Pelatihan"}</h2>
                    {activeStatus && <p className="mt-0.5 text-[11px] text-blue-100/70 truncate">{activeStatus}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => refresh()}
                      disabled={loading}
                      title="Muat ulang"
                      className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/20 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      title="Tutup (Esc)"
                      aria-label="Tutup"
                      className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <GlassStat label="Catatan" value={String(count)} />
                  <GlassStat label="Stage" value={activeStage.replace("Stage ", "") || "—"} mono />
                  <GlassStat label="Terakhir" value={items[0]?.t ? relTime(items[0].t) : "—"} />
                </div>
              </div>

              {/* Filter */}
              {count > 0 && (
                <div className="shrink-0 px-5 pt-4 pb-3 space-y-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Cari catatan atau unit…"
                      className="w-full h-10 pl-9 pr-8 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 placeholder:font-normal"
                    />
                    {q && (
                      <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-200" aria-label="Hapus pencarian">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {roles.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-5 px-5">
                      {["", ...roles].map((r) => (
                        <button
                          key={r || "all"}
                          type="button"
                          onClick={() => setRole(r)}
                          title={r || "Semua"}
                          className={`h-7 shrink-0 max-w-[170px] truncate px-3 rounded-full text-[11px] font-semibold transition-all ${role === r ? "bg-[#0B1B3F] text-white shadow" : "bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"}`}
                        >
                          {r || "Semua"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Daftar (scroll di sini) */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4">
                {initialLoading ? (
                  <div className="space-y-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-slate-800 animate-pulse shrink-0" />
                        <div className="flex-1 h-20 rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : error && !data ? (
                  <EmptyState icon={RefreshCw} title="Gagal memuat riwayat" desc="Periksa koneksi lalu coba lagi." action={{ label: "Coba lagi", onClick: () => refresh() }} />
                ) : count === 0 ? (
                  <EmptyState icon={Inbox} title="Belum ada riwayat" desc="Setiap perubahan status dan catatan akan tercatat di sini." />
                ) : shown_.length === 0 ? (
                  <EmptyState icon={Search} title="Tidak ada catatan yang cocok" action={{ label: "Reset filter", onClick: resetFilter }} />
                ) : (
                  <div className="space-y-5">
                    {groups.map((g) => (
                      <section key={g.label}>
                        <div className="sticky top-[-16px] z-10 -mx-5 px-5 py-1.5 mb-2 flex items-center gap-2 bg-slate-50 dark:bg-slate-950">
                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{g.label}</span>
                          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                          <span className="text-[10px] font-semibold text-slate-400 tabular-nums">{g.rows.length}</span>
                        </div>
                        <ol className="relative space-y-2.5">
                          {g.rows.map(({ it, t }, i) => (
                            <HistoryRow key={`${it.created_at}-${t}-${i}`} item={it} time={t} latest={`${it.created_at}-${t}` === latestKey} last={i === g.rows.length - 1} />
                          ))}
                        </ol>
                      </section>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 flex items-center justify-between gap-2 px-5 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                <span>
                  {count > 0 ? (
                    <>
                      Menampilkan <b className="text-slate-700 dark:text-slate-200 tabular-nums">{shown_.length}</b> dari {count}
                    </>
                  ) : (
                    "—"
                  )}
                </span>
                <span className="hidden sm:inline">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 font-bold">Esc</kbd> untuk menutup
                </span>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  )
}

/* ============================ UI ============================ */

const DATE_FMT = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
const TIME_FMT = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" })

const relTime = (t: number) => {
  const m = Math.round((Date.now() - t) / 60_000)
  if (m < 1) return "baru saja"
  if (m < 60) return `${m} mnt lalu`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.round(h / 24)
  return d < 30 ? `${d} hari lalu` : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(t)
}

function GlassStat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-100/60">{label}</p>
      <p className={`text-sm font-black truncate ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  )
}

function HistoryRow({ item, time, latest, last }: { item: HistoryItem; time: number; latest: boolean; last: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const notes = item.notes || ""
  const long = notes.length > 220 || notes.split("\n").length > 4

  return (
    <li className="relative pl-11">
      {!last && <span className="absolute left-[15px] top-9 -bottom-2.5 w-[2px] rounded-full bg-slate-200 dark:bg-slate-800" />}
      <span
        className={`absolute left-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${latest ? "bg-[#0B1B3F] text-white ring-white/20 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.7)]" : "bg-white dark:bg-slate-900 text-slate-400 ring-slate-200 dark:ring-slate-800"}`}
      >
        {latest ? <History className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
      </span>

      <div
        className={`min-w-0 rounded-2xl ring-1 p-3.5 bg-white dark:bg-slate-900 ${latest ? "ring-blue-200 dark:ring-blue-900/60 shadow-[0_10px_30px_-18px_rgba(37,99,235,0.6)]" : "ring-slate-200/80 dark:ring-slate-800"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className={`max-w-full truncate px-2 py-0.5 rounded-md text-[10px] font-bold ${latest ? "bg-[#0B1B3F] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`} title={item.role}>
              {item.role || "—"}
            </span>
            {latest && <span className="text-[10px] font-bold text-blue-600">Terbaru</span>}
          </div>
          <span className="shrink-0 text-[11px] text-slate-400 tabular-nums" title={item.created_at}>
            {time ? TIME_FMT.format(time) : item.created_at}
          </span>
        </div>

        <div className="mt-2 flex items-start gap-2 min-w-0">
          <MessageSquareText className="w-3.5 h-3.5 mt-[3px] shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <p className={`text-[13px] leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] ${long && !expanded ? "line-clamp-4" : ""}`}>
              {notes || <span className="text-slate-300">Tanpa catatan</span>}
            </p>
            {long && (
              <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-1 text-[11px] font-bold text-blue-600 hover:underline">
                {expanded ? "Tampilkan lebih sedikit" : "Selengkapnya"}
              </button>
            )}
          </div>
        </div>

        {item.upt && (
          <p className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-[11px] text-slate-500 min-w-0">
            <Building2 className="w-3.5 h-3.5 mt-px shrink-0 text-slate-400" />
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">{item.upt}</span>
          </p>
        )}
      </div>
    </li>
  )
}

function EmptyState({ icon: Icon, title, desc, action }: { icon: React.ComponentType<{ className?: string }>; title: string; desc?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="py-10 flex flex-col items-center gap-2 text-center">
      <span className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </span>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</p>
      {desc && <p className="text-xs text-slate-400 max-w-xs">{desc}</p>}
      {action && (
        <button type="button" onClick={action.onClick} className="mt-1 h-9 px-4 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold">
          {action.label}
        </button>
      )}
    </div>
  )
}

export default HistoryButton
