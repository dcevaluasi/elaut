"use client"

import React from "react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import getDocument from "@/firebase/firestore/getData"
import { HistoryItem, HistoryTraining, PelatihanMasyarakat } from "@/types/product"
import { parseCustomDate } from "@/firebase/firestore/services"
import { motion, AnimatePresence } from "framer-motion"
import { History, Clock, User, Building2, CheckCircle2, ChevronRight, MessageSquareText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface HistoryButtonProps {
  statusPelatihan: string
  idPelatihan: string
  pelatihan: PelatihanMasyarakat
  handleFetchingData: any
}

const HistoryButton: React.FC<HistoryButtonProps> = ({ pelatihan }) => {
  const [dataHistoryTraining, setDataHistoryTraining] =
    React.useState<HistoryTraining | null>(null)

  const handleFetchDataHistoryTraining = async () => {
    const doc = await getDocument("historical-training-notes", pelatihan!.KodePelatihan)
    setDataHistoryTraining(doc.data as HistoryTraining)
  }

  React.useEffect(() => {
    handleFetchDataHistoryTraining()
  }, [])

  return (
    <div className="w-full mt-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="info" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center shadow-sm group-data-[state=open]:rotate-12 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Riwayat Catatan Pelaksanaan</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Pantau Jejak Validasi, Verifikasi, dan Perubahan Status</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 mt-2">
            <AnimatePresence>
              {dataHistoryTraining && dataHistoryTraining.historical.length > 0 ? (
                <div className="relative space-y-4">
                  {/* Timeline Line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500 via-slate-200 dark:via-slate-800 to-transparent" />

                  {dataHistoryTraining.historical
                    .slice()
                    .sort(
                      (a: HistoryItem, b: HistoryItem) =>
                        parseCustomDate(b.created_at).getTime() -
                        parseCustomDate(a.created_at).getTime()
                    )
                    .map((item: HistoryItem, index: number) => {
                      const isLatest = index === 0;

                      return (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          key={index}
                          className="relative pl-12"
                        >
                          {/* Dot */}
                          <div className={cn(
                            "absolute left-0 top-1.5 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 z-10 transition-transform hover:scale-110",
                            isLatest
                              ? "bg-indigo-600 shadow-lg shadow-indigo-500/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          )}>
                            {isLatest ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>

                          <div className={cn(
                            "group p-5 rounded-[1.5rem] border transition-all duration-300",
                            isLatest
                              ? "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-indigo-200 dark:border-indigo-500/30 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500/10"
                              : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                          )}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                              <div className="flex items-center gap-2">
                                <Badge variant={isLatest ? "default" : "outline"} className={cn(
                                  "uppercase font-black text-[9px] px-2.5 py-0.5 tracking-widest",
                                  isLatest ? "bg-indigo-600" : "text-slate-500 border-slate-200 dark:border-slate-800"
                                )}>
                                  {item.role}
                                </Badge>
                                {isLatest && (
                                  <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                    Terbaru
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5" />
                                {item.created_at}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 shrink-0">
                                  <MessageSquareText className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Catatan Internal</p>
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight leading-relaxed">
                                    {item.notes}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Instansi / Unit Kerja</span>
                                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{item.upt}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700">
                    <History className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Belum Ada Riwayat</h4>
                    <p className="text-xs text-slate-500 font-medium italic">Seluruh aktivitas perubahan status dan catatan akan tercatat di sini.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default HistoryButton
