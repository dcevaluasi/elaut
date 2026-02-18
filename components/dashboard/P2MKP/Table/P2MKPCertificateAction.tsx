"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { P2MKP } from "@/types/p2mkp";
import { FiEye, FiDownload, FiPrinter } from "react-icons/fi";
import { TbCertificate } from "react-icons/tb";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import DialogSertifikatP2MKP from "@/components/sertifikat/dialogSertifikatP2MKP";
import { Loader2 } from "lucide-react";

/**
 * P2MKPCertificateAction handles the viewing and downloading of a P2MKP certificate.
 * It encapsulates the dialog and PDF generation logic for a single P2MKP entry.
 */
export const P2MKPCertificateAction = ({ p2mkp }: { p2mkp: P2MKP }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);
    const certificatePageRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        if (!certificateRef.current || !p2mkp) return;

        setIsDownloading(true);
        try {
            const html2pdf = (await import("html2pdf.js")).default;
            const element = certificateRef.current;

            // Optimization for the established design
            const opt = {
                margin: 0,
                filename: `Sertifikat_P2MKP_${p2mkp.nama_Ppmkp.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: {
                    scale: 2, // High resolution for premium look
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    backgroundColor: "#ffffff"
                },
                jsPDF: {
                    unit: 'px',
                    format: [1122.52, 793.7], // Exact A4 Landscape in px at 96 DPI
                    orientation: 'landscape',
                    compress: true
                }
            };

            await html2pdf().from(element).set(opt).save();
        } catch (err) {
            console.error("Failed to download PDF:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 gap-2 border-blue-200 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                    <TbCertificate className="w-4 h-4" />
                    Sertifikat
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[1240px] w-[95vw] h-[90vh] p-0 overflow-hidden bg-slate-900 border-none rounded-3xl">
                <div className="flex flex-col h-full">
                    {/* Header Actions */}
                    <div className="flex items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-md border-b border-white/10 z-20">
                        <div className="flex flex-col">
                            <h3 className="text-white font-black text-sm uppercase tracking-widest">Pratinjau Sertifikat</h3>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-tight mt-1">{p2mkp.nama_Ppmkp}</p>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <Button
                                onClick={handleDownloadPDF}
                                className="h-10 px-6 gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20"
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FiDownload className="w-4 h-4" />
                                )}
                                {isDownloading ? "Mengunduh..." : "Download PDF"}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-10 px-4 gap-2 border-white/20 bg-white/5 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/10 hover:border-white/40"
                                onClick={() => window.print()}
                            >
                                <FiPrinter className="w-4 h-4" />
                                Cetak
                            </Button>
                        </div>
                    </div>

                    {/* Scrollable Preview Area */}
                    <div className="flex-1 overflow-y-auto bg-[#f0f4f8] p-8 md:p-12 scroll-smooth custom-scrollbar">
                        <div className="mx-auto flex justify-center items-center">
                            {/* The actual certificate component */}
                            <DialogSertifikatP2MKP
                                p2mkp={p2mkp}
                                ref={certificateRef}
                                refPage={certificatePageRef}
                            />
                        </div>

                        {/* Status/Help Banner */}
                        <div className="max-w-[1122.52px] mx-auto mt-10 p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                                <FiEye className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-blue-900 font-black text-xs uppercase tracking-wider">Informasi Pratinjau</h4>
                                <p className="text-xs text-blue-700 font-medium leading-relaxed opacity-80">
                                    Dokumen ini merupakan sertifikat penetapan resmi P2MKP. Gunakan tombol download untuk menyimpan salinan PDF berkualitas tinggi atau tombol cetak untuk mencetak langsung ke printer.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
