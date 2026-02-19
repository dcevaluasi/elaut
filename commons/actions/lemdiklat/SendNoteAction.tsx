"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    LayoutGrid,
    MessageSquareText,
    FileUp,
    CheckCircle2,
    Save,
    X,
    Users,
    ShieldCheck,
    AlertCircle,
    Info,
    FileText,
    ExternalLink,
    Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl, urlFileBeritaAcara } from "@/constants/urls";
import { IconType } from "react-icons";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { PelatihanMasyarakat } from "@/types/product";
import { useFetchDataPusat } from "@/hooks/elaut/pusat/useFetchDataPusat";
import { breakdownStatus } from "@/lib/utils";
import { generateTanggalPelatihan } from "@/utils/text";
import { generatePelatihanMessage } from "@/utils/messages";
import { PusatDetail } from "@/types/pusat";

interface SendNoteActionProps {
    idPelatihan: string;
    title: string;
    description: string;
    buttonLabel: string;
    icon: IconType;
    buttonColor?: string;
    onSuccess: () => void;
    status: string;
    pelatihan: PelatihanMasyarakat;
}

const SendNoteAction: React.FC<SendNoteActionProps> = ({
    idPelatihan,
    title,
    description,
    buttonLabel,
    icon: Icon,
    buttonColor = "blue",
    onSuccess,
    status,
    pelatihan,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [verifikatorPelaksanaan, setVerifikatorPelaksanaan] = useState(pelatihan!.VerifikatorPelatihan)
    const [verifikatorSertifikat, setVerifikatorSertifikat] = useState(pelatihan!.VerifikatorSertifikat)
    const [beritaAcaraFile, setBeritaAcaraFile] = useState<File | null>(null);
    const [lapPengawasan, setLapPengawasan] = useState<File | null>(null);
    const [isPengawas, setIsPengawas] = useState(false)
    const oldFileUrl = pelatihan!.BeritaAcara
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setBeritaAcaraFile(e.target.files[0]);
        }
    };
    const [isSubmitting, setIsSubmitting] = useState(false)


    const { adminPusatData, loading: loadingPusat, error, fetchAdminPusatData } = useFetchDataPusat(status)

    useEffect(() => {
        fetchAdminPusatData()
    }, [fetchAdminPusatData])


    console.log({ adminPusatData })

    const [response, setResponse] = React.useState<any>(null);

    const [selectedVerifikator, setSelectedVerifikator] = useState<PusatDetail | null>(null)

    const handleSendMessage = async (
        pelatihan: PelatihanMasyarakat,
        text: string,
        statusPenerbitan?: string
    ) => {
        setLoading(true);
        setResponse(null);

        try {
            let recipients: string[] = [];

            if (statusPenerbitan === "1") {
                recipients = adminPusatData
                    .map((item) => item.NoTelpon)
                    .filter((phone) => !!phone && phone.trim() !== "");
            } else if (statusPenerbitan === "2") {
                recipients = [selectedVerifikator?.NoTelpon!];
            } else if (statusPenerbitan === "6") {
                recipients = [verifikatorSertifikat];
            } else {
                recipients = [];
            }

            for (const [index, phone] of recipients.entries()) {
                const formattedTo = phone.includes("@s.whatsapp.net")
                    ? phone
                    : `${phone}@s.whatsapp.net`;

                const message = generatePelatihanMessage(pelatihan, statusPenerbitan!);

                const res = await axios.post("/api/sendWhatsapp", {
                    to: formattedTo,
                    text: message,
                });

                // ⏱ Wait 5 seconds before next iteration
                await new Promise((resolve) => setTimeout(resolve, 60000));
            }

            setResponse({ success: true, total: recipients.length });
        } catch (error: any) {
            console.error(error);
            setResponse(error.response?.data || { message: "Request failed" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setLoading(true);
        setIsOpen(true)
        setLoading(true)
        const formData = new FormData();
        formData.append("StatusPenerbitan", status);
        formData.append("VerifikatorPelatihan", verifikatorPelaksanaan);
        formData.append("VerifikatorSertifikat", selectedVerifikator?.NoTelpon!);
        if (beritaAcaraFile) formData.append("BeritaAcara", beritaAcaraFile);
        if (lapPengawasan) formData.append("MemoPusat", lapPengawasan);
        if (status == "4") formData.append("PemberitahuanDiterima", "Active")

        try {

            const response = await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihan?id=${idPelatihan}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            await handleAddHistoryTrainingInExisting(
                pelatihan,
                message,
                Cookies.get("Role"),
                `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`
            );

            handleSendMessage(pelatihan, message, status)

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: `${title} berhasil diproses.`,
            });

            setMessage("");
            setVerifikatorPelaksanaan("");
            setSelectedVerifikator(null)

            setBeritaAcaraFile(null);

            onSuccess();
        } catch (error) {
            setMessage("");
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memproses tindakan.",
            });

        } finally {
            setLoading(false);
            setIsSubmitting(false)
            setIsOpen(false);
        }
    };

    const colorGradients: Record<string, string> = {
        blue: "from-blue-600 to-indigo-700",
        teal: "from-teal-500 to-emerald-700",
        rose: "from-rose-500 to-pink-700",
        amber: "from-amber-500 to-orange-700",
        neutral: "from-slate-600 to-slate-800",
    };

    const gradient = colorGradients[buttonColor] || colorGradients.blue;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        " h-10 flex items-center gap-2.5 rounded-xl px-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm font-bold text-xs transition-all duration-300 shadow-sm",
                        buttonColor === "blue" && "hover:border-blue-500 hover:text-blue-600",
                        buttonColor === "teal" && "hover:border-teal-500 hover:text-teal-600",
                        buttonColor === "rose" && "hover:border-rose-500 hover:text-rose-600",
                        buttonColor === "amber" && "hover:border-amber-500 hover:text-amber-600",
                        buttonColor === "neutral" && "hover:border-slate-500 hover:text-slate-600"
                    )}
                >
                    <div className={cn(
                        "p-1 rounded-lg transition-colors",
                        buttonColor === "blue" && "bg-blue-50 text-blue-500 group-hover:bg-blue-500 ",
                        buttonColor === "teal" && "bg-teal-50 text-teal-500 group-hover:bg-teal-500 ",
                        buttonColor === "rose" && "bg-rose-50 text-rose-500 group-hover:bg-rose-500 ",
                        buttonColor === "amber" && "bg-amber-50 text-amber-500 group-hover:bg-amber-500 ",
                        buttonColor === "neutral" && "bg-slate-100 text-slate-500 group-hover:bg-slate-500 "
                    )}>
                        <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{buttonLabel}</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] md:w-full max-w-lg p-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl border-white/50 dark:border-slate-800 rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl z-[99999]">
                <div className="flex flex-col">
                    <DialogHeader className="p-8 pb-4 space-y-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className={cn(
                                "w-20 h-20 shrink-0 rounded-[2rem] bg-gradient-to-br text-white flex items-center justify-center text-4xl shadow-2xl",
                                gradient,
                                buttonColor === "blue" && "shadow-blue-600/20",
                                buttonColor === "teal" && "shadow-teal-400/20",
                                buttonColor === "rose" && "shadow-rose-600/20",
                                buttonColor === "amber" && "shadow-amber-600/20",
                                buttonColor === "neutral" && "shadow-slate-600/20"
                            )}>
                                <Icon />
                            </div>
                            <div className="space-y-2 text-center md:text-left">
                                <DialogTitle className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">
                                    {title}
                                </DialogTitle>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{pelatihan.KodePelatihan}</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 shadow-inner border border-slate-100 dark:border-slate-800">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Icon className="w-12 h-12" />
                            </div>
                            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                                {description}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="px-8 pb-8 space-y-6">
                        {/* Verifikator Selection */}
                        {(Cookies.get('Access')?.includes('supervisePelaksanaan') && (pelatihan?.StatusPenerbitan == "1") && title == "Pilih Verifikator") && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tunjuk Verifikator Pelaksanaan</Label>
                                </div>
                                <Select
                                    value={verifikatorPelaksanaan?.toString() ?? ""}
                                    onValueChange={(value) => {
                                        setVerifikatorPelaksanaan(value);
                                        const selected = adminPusatData.find((item) => item.IdAdminPusat.toString() === value);
                                        setSelectedVerifikator(selected ?? null);
                                    }}
                                    disabled={loading || loadingPusat}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-sm">
                                        <SelectValue placeholder="Pilih Nama Verifikator..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[999999]">
                                        {loadingPusat ? (
                                            <div className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Memuat Data Pusat...</div>
                                        ) : (
                                            adminPusatData
                                                .filter((item) => breakdownStatus(item.Status)[0] === "Verifikator")
                                                .map((admin) => (
                                                    <SelectItem key={admin.IdAdminPusat} value={admin.IdAdminPusat.toString()} className="font-bold py-3">
                                                        {admin.Nama}
                                                    </SelectItem>
                                                ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* File Upload Section */}
                        {(pelatihan?.StatusPenerbitan == "1.25" || pelatihan?.StatusPenerbitan == "1.5" || pelatihan?.StatusPenerbitan == "5" || pelatihan?.StatusPenerbitan == "7" || pelatihan?.StatusPenerbitan == "9") && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FileUp className="w-4 h-4 text-indigo-500" />
                                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Unggah Dokumen Penerbitan STTPL</Label>
                                </div>
                                <div className="relative group/upload">
                                    <input
                                        type="file"
                                        id="sttplDoc"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="sttplDoc"
                                        className="flex flex-col items-center justify-center w-full h-28 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-500 transition-all cursor-pointer overflow-hidden p-4 text-center"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 mb-2 flex items-center justify-center group-hover/upload:scale-110 transition-transform">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest truncate max-w-full px-4">
                                            {beritaAcaraFile ? beritaAcaraFile.name : "Klik untuk Pilih File (PDF, DOC, DOCX)"}
                                        </p>
                                    </label>
                                </div>
                                {oldFileUrl && (
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">File Terupload Saat Ini</span>
                                        </div>
                                        <a href={`${urlFileBeritaAcara}/${oldFileUrl}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-indigo-600 underline underline-offset-4 hover:text-indigo-700 transition-colors uppercase">
                                            Lihat Dokumen
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Message/Notes Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <MessageSquareText className="w-4 h-4 text-indigo-500" />
                                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tambahkan Catatan atau Pesan Instansi</Label>
                            </div>
                            <Textarea
                                placeholder="Jelaskan alasan pengajuan atau catatan perbaikan di sini..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={loading}
                                className="min-h-[100px] rounded-[1.5rem] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 font-bold text-sm tracking-tight focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
                            <Button
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                disabled={loading}
                                className="w-full sm:w-auto h-12 px-8 rounded-2xl text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Batalkan
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !message || (title === "Ajukan Penerbitan STTPL" && !beritaAcaraFile)}
                                className={cn(
                                    "w-full sm:w-auto h-12 px-10 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3",
                                    buttonColor === "blue" && "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
                                    buttonColor === "teal" && "bg-green-500 hover:bg-green-500 shadow-green-500/20",
                                    buttonColor === "rose" && "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20",
                                    buttonColor === "amber" && "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
                                    buttonColor === "neutral" && "bg-slate-700 hover:bg-slate-800 shadow-slate-500/20"
                                )}
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        <span>Memproses Data...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Konfirmasi & Kirim</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SendNoteAction;
