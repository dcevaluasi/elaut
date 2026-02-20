"use client";

import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import DialogSertifikatP2MKP, { DialogSertifikatP2MKPHandle } from "@/components/sertifikat/dialogSertifikatP2MKP";
import { elautBaseUrl } from "@/constants/urls";
import { P2MKP, PengajuanPenetapanP2MKP } from "@/types/p2mkp";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TbGavel, TbCertificate } from "react-icons/tb";
import { FiDownload } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Page() {
    const { id } = useParams(); // id is IdPengajuanPenetapanPpmkp
    const searchParams = useSearchParams();
    const idPpmkp = searchParams.get("id_ppmkp");

    const [isDownloading, setIsDownloading] = useState(false);
    const [fullP2MKP, setFullP2MKP] = useState<P2MKP | null>(null);
    const [penetapan, setPenetapan] = useState<PengajuanPenetapanP2MKP | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const certificateRef = useRef<DialogSertifikatP2MKPHandle>(null);

    const fetchMasterData = async () => {
        if (!idPpmkp || !id) return;
        setIsLoading(true);
        try {
            const token = Cookies.get("XSRF091");
            const [p2mkpRes, penetapanRes] = await Promise.all([
                axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_by_id?id=${idPpmkp}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${elautBaseUrl}/p2mkp/get_pengjuan_penetapan_p2mkp`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setFullP2MKP(p2mkpRes.data.data);

            const penetapanList: PengajuanPenetapanP2MKP[] = Array.isArray(penetapanRes.data)
                ? penetapanRes.data
                : (penetapanRes.data.data || []);

            const currentPenetapan = penetapanList.find(p => String(p.IdPengajuanPenetapanPpmkp) === String(id));
            if (currentPenetapan) {
                setPenetapan(currentPenetapan);
            }
        } catch (err) {
            console.error("Failed to fetch P2MKP data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, [idPpmkp, id]);

    const handleDownloadPDF = async () => {
        if (!certificateRef.current) return;
        setIsDownloading(true);
        try {
            await certificateRef.current.downloadPdf();
        } catch (err) {
            console.error("Failed to download PDF via ref:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut
                    title="Penetapan P2MKP"
                    description="Kelola dan cetak sertifikat penetapan Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP) yang telah diverifikasi."
                    icon={<TbGavel className="text-3xl" />}
                />
                <article className="w-full h-full py-5 bg-slate-50 min-h-screen">
                    <div className="w-full mx-auto space-y-8">
                        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex flex-col">
                                <h3 className="text-slate-900 font-black text-lg uppercase tracking-widest">Sertifikat Penetapan P2MKP</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">{fullP2MKP?.nama_ppmkp || "Memuat..."}</p>
                            </div>
                            <Button
                                onClick={handleDownloadPDF}
                                className="h-12 px-8 gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-2xl hover:shadow-blue-500/20 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all"
                                disabled={isDownloading || isLoading}
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FiDownload className="w-4 h-4" />
                                )}
                                {isDownloading ? "Mengunduh PDF..." : "Download Ke PDF"}
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Menyiapkan Dokumen Sertifikat...</p>
                            </div>
                        ) : fullP2MKP ? (
                            <div className="w-full">
                                <DialogSertifikatP2MKP
                                    p2mkp={fullP2MKP}
                                    penetapan={penetapan!}
                                    idPenetapan={id as string}
                                    ref={certificateRef}
                                />
                            </div>
                        ) : (
                            <div className="h-[60vh] flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                                <TbCertificate className="w-16 h-16 text-slate-200 mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest">Gagal memuat profil lembaga</p>
                            </div>
                        )}
                    </div>
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
