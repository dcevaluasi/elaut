"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import getDocument from "@/firebase/firestore/getData"
import { HistoryItem, HistoryTraining, PelatihanMasyarakat } from "@/types/product"
import { parseCustomDate } from "@/firebase/firestore/services"
import { motion, AnimatePresence } from "framer-motion"
import { History, Clock, Building2, CheckCircle2, MessageSquareText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface HistoryButtonProps {
  statusPelatihan?: string
  idPelatihan?: string
  pelatihan: PelatihanMasyarakat
  handleFetchingData?: any
  isFloating?: boolean
  statusLabel?: string
  statusStage?: string | number
}

const HistoryButton: React.FC<HistoryButtonProps> = ({
  pelatihan,
  statusPelatihan,
  isFloating = true,
  statusLabel,
  statusStage,
}) => {
  const [open, setOpen] = React.useState(false)
  const [dataHistoryTraining, setDataHistoryTraining] =
    React.useState<HistoryTraining | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleFetchDataHistoryTraining = async () => {
    if (!pelatihan?.KodePelatihan) return
    setLoading(true)
    try {
      const doc = await getDocument("historical-training-notes", pelatihan.KodePelatihan)
      if (doc?.data) {
        setDataHistoryTraining(doc.data as HistoryTraining)
      }
    } catch (err) {
      console.error("Error fetching history training:", err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (pelatihan?.KodePelatihan) {
      handleFetchDataHistoryTraining()
    }
  }, [pelatihan?.KodePelatihan])

  React.useEffect(() => {
    if (open) {
      handleFetchDataHistoryTraining()
    }
  }, [open])

  const historyCount = dataHistoryTraining?.historical?.length ?? 0
  const activeStatusText = statusLabel || statusPelatihan || pelatihan?.Status || ""
  const activeStageText = statusStage || (pelatihan?.StatusPenerbitan ? `Stage ${pelatihan.StatusPenerbitan}` : "")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isFloating ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="fixed bottom-6 right-6 z-50 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 p-2 pl-4 bg-slate-900/90 dark:bg-slate-950/95 text-white backdrop-blur-2xl border border-slate-700/60 dark:border-slate-800 shadow-2xl shadow-indigo-950/50 rounded-full transition-all duration-300 hover:border-indigo-500/50 group">
              {/* Status Indicator Pill */}
              {(activeStatusText || activeStageText) && (
                <div className="flex items-center gap-2.5 pr-3 border-r border-slate-700/60 dark:border-slate-800">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="flex flex-col text-left">
                    {activeStageText && (
                      <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider leading-none">
                        {activeStageText}
                      </span>
                    )}
                    {activeStatusText && (
                      <span className="text-xs font-bold text-slate-100 truncate max-w-[140px] leading-tight">
                        {activeStatusText}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* History Trigger Button */}
              <div className="flex items-center gap-2 py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-xs shadow-md shadow-indigo-600/30 transition-all">
                <History className="h-4 w-4 group-hover:rotate-45 transition-transform duration-300" />
                <span className="tracking-tight">Riwayat Catatan</span>
                {historyCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black">
                    {historyCount}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 rounded-xl border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all gap-2 shadow-sm"
          >
            <History className="h-4 w-4" />
            <span>Riwayat Catatan</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black">
                {historyCount}
              </span>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="flex flex-row items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800 space-y-0">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
            <History className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Riwayat Catatan Pelaksanaan
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Pantau Jejak Validasi, Verifikasi, dan Perubahan Status
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-3">
          <AnimatePresence>
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                  Memuat Riwayat...
                </span>
              </div>
            ) : dataHistoryTraining && dataHistoryTraining.historical?.length > 0 ? (
              <div className="relative space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                {/* Timeline Vertical Line */}
                <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-500 via-slate-200 dark:via-slate-800 to-transparent" />

                {dataHistoryTraining.historical
                  .slice()
                  .sort(
                    (a: HistoryItem, b: HistoryItem) =>
                      parseCustomDate(b.created_at).getTime() -
                      parseCustomDate(a.created_at).getTime()
                  )
                  .map((item: HistoryItem, index: number) => {
                    const isLatest = index === 0

                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={index}
                        className="relative pl-12"
                      >
                        {/* Dot Icon */}
                        <div
                          className={cn(
                            "absolute left-0 top-1.5 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 z-10 transition-transform hover:scale-110",
                            isLatest
                              ? "bg-indigo-600 shadow-lg shadow-indigo-500/30 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          )}
                        >
                          {isLatest ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>

                        <div
                          className={cn(
                            "group p-4 rounded-2xl border transition-all duration-300",
                            isLatest
                              ? "bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 border-indigo-200 dark:border-indigo-800 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/10"
                              : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                          )}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={isLatest ? "default" : "outline"}
                                className={cn(
                                  "uppercase font-black text-[9px] px-2.5 py-0.5 tracking-widest",
                                  isLatest
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                                )}
                              >
                                {item.role}
                              </Badge>
                              {isLatest && (
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                  Catatan Terbaru
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              <Clock className="w-3.5 h-3.5" />
                              {item.created_at}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                                <MessageSquareText className="w-3.5 h-3.5" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                                  Catatan Internal
                                </p>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight leading-relaxed">
                                  {item.notes}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                <Building2 className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                  Instansi / Unit:
                                </span>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">
                                  {item.upt}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <History className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">
                    Belum Ada Riwayat
                  </h4>
                  <p className="text-xs text-slate-500 font-medium italic mt-0.5">
                    Seluruh aktivitas perubahan status dan catatan akan tercatat di sini.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default HistoryButton
