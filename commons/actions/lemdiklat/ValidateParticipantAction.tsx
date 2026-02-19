import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import Cookies from "js-cookie";
import { elautBaseUrl } from "@/constants/urls";
import Toast from "@/commons/Toast";
import { DIALOG_TEXTS } from "@/constants/texts";
import { Button } from "@/components/ui/button";
import { UserPelatihan } from "@/types/product";
import { CheckCircle2, UserCheck, X, Save, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ValidateParticipantActionProps {
    data: UserPelatihan[];
    onSuccess?: () => void;
}

export function ValidateParticipantAction({
    data,
    onSuccess,
}: ValidateParticipantActionProps) {
    const [open, setOpen] = useState(false);
    const [isIteratingProcess, setIsIteratingProcess] = useState(false);

    const handleValidasiPeserta = async () => {
        setIsIteratingProcess(true);
        try {
            for (const user of data) {
                const formData = new FormData();
                formData.append("Keterangan", "Valid")

                await axios.put(
                    `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        },
                    }
                );
            }

            Toast.fire({
                icon: "success",
                title: "Sinkronisasi Berhasil!",
                text: `Berhasil memvalidasi ${data.length} peserta pelatihan!`,
            });

            setIsIteratingProcess(false);
            onSuccess?.();
            setOpen(false);
        } catch (error) {
            console.error("ERROR UPDATE PELATIHAN:", error);

            Toast.fire({
                icon: "error",
                title: "Sinkronisasi Gagal!",
                text: `Terjadi kendala saat memvalidasi ${data.length} peserta pelatihan.`,
            });

            setIsIteratingProcess(false);
            onSuccess?.();
            setOpen(false);
        }
    };

    const dialogData = DIALOG_TEXTS["Validasi Grouping Peserta"];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="group h-10 flex items-center gap-2.5 rounded-xl px-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-600 dark:text-slate-400 font-bold text-xs hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 shadow-sm"
                >
                    <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <span>Validasi Peserta</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] md:w-full max-w-lg p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-white/50 dark:border-slate-800 rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl z-[99999]">
                <div className="flex flex-col">
                    <DialogHeader className="p-8 pb-4 space-y-6 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-20 h-20 shrink-0 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/20">
                                <UserCheck />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">
                                    Konfirmasi Validasi Grouping
                                </DialogTitle>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{data.length} Peserta Terpilih</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <AlertCircle className="w-12 h-12" />
                            </div>
                            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                                {dialogData.desc}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogFooter className="p-8 pt-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
                            <Button
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                disabled={isIteratingProcess}
                                className="w-full sm:w-auto h-12 px-8 rounded-2xl text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Batalkan
                            </Button>
                            <Button
                                onClick={handleValidasiPeserta}
                                disabled={isIteratingProcess}
                                className="w-full sm:w-auto h-12 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {isIteratingProcess ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        <span>Proses Sinkronisasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Ya, Validasikan</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
