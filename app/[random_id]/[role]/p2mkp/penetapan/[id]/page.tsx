"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { useFetchDataPengajuanPenetapan } from "@/hooks/elaut/p2mkp/useFetchDataPengajuanPenetapan";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import {
    FiArrowLeft,
    FiShield,
    FiMapPin,
    FiUser,
    FiFileText,
    FiActivity,
    FiPhone,
    FiMail,
    FiCheckCircle,
    FiInfo,
    FiDownload,
    FiClock,
    FiAlertCircle,
    FiCheck,
    FiXCircle,
    FiEye,
    FiCalendar,
    FiAward,
} from "react-icons/fi";
import { TbGavel, TbCertificate, TbBuildingSkyscraper } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HashLoader } from "react-spinners";
import { P2MKP, PengajuanPenetapanP2MKP } from "@/types/p2mkp";
import { elautBaseUrl } from "@/constants/urls";
import Cookies from "js-cookie";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    getFirestore,
    doc,
    getDoc,
} from "firebase/firestore";

import { generateTimestamp } from "@/utils/time";
import firebaseApp from "@/firebase/config";
import addData from "@/firebase/firestore/addData";

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

// ----------------------------------------------------
// Reusable Progress Stepper Component (Matches User UI)
// ----------------------------------------------------
function PenetapanProgressTracker({ status }: { status: string }) {
    const s = (status || 'diajukan').toLowerCase();

    const isApproved = ['approved', 'disetujui', 'selesai', 'aktif', 'penetapan', 'done'].includes(s);
    const isValidated = ['validated', 'validasi', 'visitasi', 'divalidasi'].includes(s);
    const isVerified = ['verified', 'diverifikasi', 'verifikasi', 'proses'].includes(s);

    const isVerifikasiFailed = s === 'perbaikan' || s === 'ditolak' || s === 'rejected' || s.includes('verifikasi ditolak') || s.includes('berkas ditolak');
    const isValidasiFailed = s.includes('validasi ditolak') || s.includes('visitasi ditolak') || s.includes('lapangan ditolak');

    let step1Done = false;
    let step2Done = false;
    let step3Done = false;

    if (isApproved) {
        step1Done = true;
        step2Done = true;
        step3Done = true;
    } else if (isValidated) {
        step1Done = true;
        step2Done = true;
        step3Done = false;
    } else if (isVerified) {
        step1Done = true;
        step2Done = false;
        step3Done = false;
    }

    const steps = [
        {
            number: 1,
            title: 'Verifikasi Berkas',
            desc: 'Pemeriksaan dokumen & kelayakan administrasi',
            isDone: step1Done,
            isActive: !step1Done && !isVerifikasiFailed && !isValidasiFailed,
            isFailed: isVerifikasiFailed,
        },
        {
            number: 2,
            title: 'Validasi / Visitasi Lapangan',
            desc: 'Peninjauan langsung fasilitas & sarana lapangan',
            isDone: step2Done,
            isActive: step1Done && !step2Done && !isValidasiFailed,
            isFailed: isValidasiFailed,
        },
        {
            number: 3,
            title: 'Penetapan',
            desc: 'Sidang pleno & penerbitan sertifikat resmi',
            isDone: step3Done,
            isActive: step1Done && step2Done && !step3Done,
            isFailed: false,
        },
    ];

    return (
        <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-0.5">
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <FiActivity className="text-blue-600" /> Progress & Status Tahapan Penetapan
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Monitoring alur penetapan yang sinkron dengan tampilan user P2MKP</p>
                    </div>
                    <Badge className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${step3Done ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        (isVerifikasiFailed || isValidasiFailed) ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        Status: {status || 'Diajukan'}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step) => (
                        <div key={step.number} className="relative flex items-start gap-4">
                            <div className="shrink-0 pt-0.5">
                                {step.isDone ? (
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <FiCheck size={20} strokeWidth={3} />
                                    </div>
                                ) : step.isFailed ? (
                                    <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 animate-pulse">
                                        <FiXCircle size={20} />
                                    </div>
                                ) : step.isActive ? (
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/30 ring-4 ring-blue-100">
                                        {step.number}
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center font-bold text-sm">
                                        {step.number}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className={`text-xs font-black uppercase tracking-wider ${step.isDone ? 'text-emerald-700' :
                                        step.isFailed ? 'text-rose-600 font-black' :
                                            step.isActive ? 'text-blue-600' :
                                                'text-slate-400'
                                        }`}>
                                        {step.number}. {step.title}
                                    </h4>
                                    {step.isDone && (
                                        <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                            ✓ Selesai
                                        </span>
                                    )}
                                    {step.isFailed && (
                                        <span className="text-[9px] font-extrabold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                                            ✕ Ditolak
                                        </span>
                                    )}
                                    {step.isActive && (
                                        <span className="text-[9px] font-extrabold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded animate-pulse">
                                            Sedang Proses
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function DetailPenetapanPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: pengajuanList, loading: loadingPengajuan } = useFetchDataPengajuanPenetapan();
    const { data: p2mkpList, loading: loadingP2MKP } = useFetchDataP2MKP();

    const [matchedData, setMatchedData] = useState<{
        pengajuan: PengajuanPenetapanP2MKP;
        master: P2MKP;
    } | null>(null);

    const [isApprovalOpen, setIsApprovalOpen] = useState(false);
    const [catatan, setCatatan] = useState("");
    const [tahunPenetapan, setTahunPenetapan] = useState("");
    const [nomorSurat, setNomorSurat] = useState("");
    const [tanggalSurat, setTanggalSurat] = useState("");
    const [tanggalSertifikat, setTanggalSertifikat] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const isLoading = loadingPengajuan || loadingP2MKP;

    useEffect(() => {
        if (!pengajuanList || !p2mkpList || !id) return;

        // Search pengajuan by IdPengajuanPenetapanPpmkp OR id_Ppmkp OR id
        let currentPengajuan = pengajuanList.find(p =>
            String(p.IdPengajuanPenetapanPpmkp) === String(id) ||
            String(p.id_Ppmkp) === String(id) ||
            String((p as any).id) === String(id)
        );

        // Search master P2MKP by IdPpmkp OR id_p2mkp OR id OR matched pengajuan's id_Ppmkp
        let currentMaster = p2mkpList.find(m =>
            String(m.IdPpmkp) === String(id) ||
            String((m as any).id_p2mkp) === String(id) ||
            String((m as any).id) === String(id) ||
            (currentPengajuan && String(m.IdPpmkp) === String(currentPengajuan.id_Ppmkp)) ||
            (currentPengajuan && String((m as any).id_p2mkp) === String(currentPengajuan.id_Ppmkp))
        );

        // Reverse check: if master was found by id, search pengajuan by master's IdPpmkp
        if (currentMaster && !currentPengajuan) {
            currentPengajuan = pengajuanList.find(p =>
                String(p.id_Ppmkp) === String(currentMaster!.IdPpmkp) ||
                String(p.id_Ppmkp) === String((currentMaster as any).id_p2mkp)
            );
        }

        if (currentMaster) {
            const finalPengajuan: PengajuanPenetapanP2MKP = currentPengajuan || {
                IdPengajuanPenetapanPpmkp: String(id),
                id_Ppmkp: String(currentMaster.IdPpmkp || (currentMaster as any).id_p2mkp),
                tahun_penetapan: currentMaster.tahun_penetapan || new Date().getFullYear().toString(),
                nomor_surat: "",
                nomor_sertifikat: (currentMaster as any).nomor_sertifikat || "",
                tanggal_surat: "",
                tanggal_sertifikat: (currentMaster as any).tanggal_sertifikat || "",
                status_usaha: currentMaster.status_usaha || "Aktif",
                status_pelatihan: currentMaster.status_peltihan || "Berjalan",
                is_lpk: currentMaster.is_lpk || "Ya",
                status: currentMaster.status || "Diajukan",
                create_at: currentMaster.create_at || "",
                update_at: currentMaster.update_at || "",
            };

            setMatchedData({
                pengajuan: finalPengajuan,
                master: currentMaster
            });
            setTahunPenetapan(finalPengajuan.tahun_penetapan || new Date().getFullYear().toString());
            setNomorSurat(finalPengajuan.nomor_surat || "");
            setTanggalSurat(finalPengajuan.tanggal_surat || "");
            setTanggalSertifikat(finalPengajuan.tanggal_sertifikat || "");
        }
    }, [pengajuanList, p2mkpList, id]);

    const handleUpdateStatus = async (status: string, extraNotes?: string) => {
        if (!matchedData) return;
        setIsUpdating(true);

        try {
            const token = Cookies.get("XSRF091");
            const formatToIndonesianDate = (dateStr: string) => {
                if (!dateStr) return dateStr;
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return dateStr;
                return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            };

            const payload: any = {
                status,
                tahun_penetapan: tahunPenetapan,
                nomor_surat: nomorSurat,
                tanggal_surat: formatToIndonesianDate(tanggalSurat),
                tanggal_sertifikat: formatToIndonesianDate(tanggalSertifikat)
            };

            const targetId = matchedData.pengajuan.IdPengajuanPenetapanPpmkp || matchedData.pengajuan.id_Ppmkp;

            await axios.put(
                `${elautBaseUrl}/p2mkp/update_pengjuan_penetapan_p2mkp?id=${targetId}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (status === "Approved") {
                await axios.put(
                    `${elautBaseUrl}/p2mkp/update_p2mkp?id=${matchedData.pengajuan.id_Ppmkp}`,
                    { status: "Approved" },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // Add History Note to Firestore
            const idPpmkp = matchedData.pengajuan.id_Ppmkp;
            const docRef = doc(getFirestore(firebaseApp), 'historical-p2mkp-notes', idPpmkp);
            const docSnap = await getDoc(docRef);
            let existingHistory = [];
            if (docSnap.exists()) {
                existingHistory = docSnap.data().historical || [];
            }

            const newEntry = {
                created_at: generateTimestamp(),
                id: idPpmkp,
                notes: extraNotes || catatan || `Status diperbarui menjadi ${status}`,
                role: Cookies.get("Role") || "Pusat",
                upt: `${Cookies.get("Nama")} - ${Cookies.get("Satker") || "Pusat"}`,
            };
            existingHistory.push(newEntry);

            await addData('historical-p2mkp-notes', idPpmkp, {
                historical: existingHistory,
                status: 'Done',
            });

            Toast.fire({
                icon: "success",
                title: "Pembaruan Status Berhasil",
                text: `Status pengajuan berhasil diubah menjadi '${status}'.`,
            });

            setIsApprovalOpen(false);
            window.location.reload();
        } catch (err: any) {
            console.error("Error updating status:", err);
            Toast.fire({
                icon: "error",
                title: "Gagal Memperbarui",
                text: err.response?.data?.message || "Terjadi kesalahan sistem.",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <LayoutAdminElaut>
                <div className="h-screen w-full flex flex-col items-center justify-center space-y-6">
                    <HashLoader color="#338CF5" size={60} />
                    <div className="text-center">
                        <p className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em] animate-pulse">Memuat Data Penetapan</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Menyamakan Metadata Penetapan & Master P2MKP...</p>
                    </div>
                </div>
            </LayoutAdminElaut>
        );
    }

    if (!matchedData) {
        return (
            <LayoutAdminElaut>
                <div className="h-screen w-full flex flex-col items-center justify-center space-y-6">
                    <div className="w-24 h-24 bg-rose-50 rounded-[3rem] flex items-center justify-center">
                        <FiAlertCircle className="w-10 h-10 text-rose-500" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-slate-800 uppercase tracking-tight text-xl">Data Tidak Ditemukan</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">ID Pengajuan atau Master P2MKP tidak terdaftar dalam sistem.</p>
                    </div>
                    <Button
                        onClick={() => router.back()}
                        className="bg-slate-900 text-white rounded-2xl px-8 h-12 font-black uppercase text-[10px] tracking-widest"
                    >
                        Kembali
                    </Button>
                </div>
            </LayoutAdminElaut>
        );
    }

    const { pengajuan, master } = matchedData;
    const currentStatus = pengajuan.status || master.status || "Diajukan";
    const namaLembaga = master.nama_ppmkp || master.nama_Ppmkp || (pengajuan as any).nama_ppmkp || (pengajuan as any).nama_Ppmkp || "P2MKP";

    const getStatusBadge = (status: string) => {
        const s = (status || "").toLowerCase();
        if (s === "approved" || s === "disetujui") {
            return <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"><FiCheckCircle className="w-4 h-4 mr-2" /> Approved</Badge>;
        }
        if (s === "validated" || s === "validasi" || s === "visitasi") {
            return <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"><FiCheckCircle className="w-4 h-4 mr-2" /> Validasi Lapangan</Badge>;
        }
        if (s === "verified" || s === "diverifikasi") {
            return <Badge className="bg-purple-50 text-purple-600 border border-purple-100 shadow-sm px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"><FiCheckCircle className="w-4 h-4 mr-2" /> Berkas Verified</Badge>;
        }
        if (s === "perbaikan" || s.includes("ditolak")) {
            return <Badge className="bg-rose-50 text-rose-600 border border-rose-100 shadow-sm px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"><FiAlertCircle className="w-4 h-4 mr-2" /> Perbaikan / Ditolak</Badge>;
        }
        return <Badge className="bg-amber-50 text-amber-600 border border-amber-100 shadow-sm px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"><FiClock className="w-4 h-4 mr-2 animate-pulse" /> Diajukan</Badge>;
    };

    // Helper to extract doc file from pengajuan or master
    const getDocValue = (pengajuanKey: string, masterKey: string) => {
        return (pengajuan as any)?.[pengajuanKey] || (master as any)?.[masterKey] || "";
    };

    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col pb-20">
                <HeaderPageLayoutAdminElaut
                    title="Detail Penetapan P2MKP"
                    description={`Review data lengkap & kelola progress verifikasi untuk ${namaLembaga}.`}
                    icon={<TbGavel className="text-3xl" />}
                />

                <article className="w-full flex-1 p-8 space-y-8">
                    {/* Top Action Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-14 px-8 gap-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 group"
                        >
                            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Daftar
                        </Button>

                        <div className="flex items-center gap-3 flex-wrap">
                            {getStatusBadge(currentStatus)}

                            {/* Direct Step Action Buttons */}
                            {currentStatus.toLowerCase() !== "approved" && (
                                <div className="flex items-center gap-2">
                                    {/* Action 1: Verify Berkas */}
                                    {['diajukan', 'dikirim', 'pending', ''].includes(currentStatus.toLowerCase()) && (
                                        <>
                                            <Button
                                                disabled={isUpdating}
                                                onClick={() => handleUpdateStatus("Verified", "Berkas administrasi telah diperiksa & diverifikasi disetujui.")}
                                                className="h-12 px-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-purple-500/20 gap-2 active:scale-95"
                                            >
                                                <FiCheck className="w-4 h-4" /> Verifikasi Berkas (Lolos)
                                            </Button>
                                            <Button
                                                disabled={isUpdating}
                                                onClick={() => handleUpdateStatus("Perbaikan", "Berkas perlu diperbaiki. Diberikan waktu 7 hari kerja.")}
                                                className="h-12 px-5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-2xl text-[10px] font-black uppercase tracking-wider gap-2 active:scale-95"
                                            >
                                                <FiXCircle className="w-4 h-4" /> Berkas Ditolak / Perbaikan
                                            </Button>
                                        </>
                                    )}

                                    {/* Action 2: Validate Visitasi */}
                                    {['verified', 'diverifikasi', 'proses'].includes(currentStatus.toLowerCase()) && (
                                        <>
                                            <Button
                                                disabled={isUpdating}
                                                onClick={() => handleUpdateStatus("Validated", "Visitasi & validasi lapangan telah dinyatakan lolos.")}
                                                className="h-12 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20 gap-2 active:scale-95"
                                            >
                                                <FiCheck className="w-4 h-4" /> Validasi Lapangan (Lolos)
                                            </Button>
                                            <Button
                                                disabled={isUpdating}
                                                onClick={() => handleUpdateStatus("Validasi Ditolak", "Visitasi lapangan belum memenuhi standar. Diberikan waktu 7 hari perbaikan.")}
                                                className="h-12 px-5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-2xl text-[10px] font-black uppercase tracking-wider gap-2 active:scale-95"
                                            >
                                                <FiXCircle className="w-4 h-4" /> Validasi Ditolak
                                            </Button>
                                        </>
                                    )}

                                    {/* Action 3: Final Approval */}
                                    {
                                        currentStatus.toLowerCase() == "validated" && <Button
                                            onClick={() => setIsApprovalOpen(true)}
                                            className="h-14 px-7 gap-3 bg-slate-900 text-white hover:bg-slate-800 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95"
                                        >
                                            <TbGavel className="w-5 h-5 text-blue-400" />
                                            Keputusan Penetapan
                                        </Button>
                                    }

                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Tracker Card (Matches User UI) */}
                    <PenetapanProgressTracker status={currentStatus} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left Column: Full P2MKP Identity & Owner Info */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Main Institution Profile Card */}
                            <Card className="rounded-[3rem] border-none bg-white shadow-2xl shadow-slate-200/50 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                                <CardContent className="p-10 space-y-8 relative z-10">
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-2xl shadow-blue-500/30 shrink-0">
                                            <FiShield size={40} />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{namaLembaga}</h2>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-wrap">
                                                <Badge variant="outline" className="border-slate-200 text-slate-600 rounded-full px-3.5 py-1 font-extrabold">{master.status_kepemilikan || "Lembaga Swadaya"}</Badge>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5"><FiMapPin className="text-rose-500" /> {master.kota || (pengajuan as any).kota || '-'}, {master.provinsi || (pengajuan as any).provinsi || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Institution Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
                                        <DetailItem icon={<FiFileText />} label="NIB / Legalitas Usaha" value={master.nib || "N/A"} />
                                        <DetailItem icon={<FiPhone />} label="Telepon Lembaga" value={master.no_telp || "-"} />
                                        <DetailItem icon={<FiMail />} label="Email Terdaftar" value={master.email || "-"} />
                                    </div>

                                    {/* Full Operational Address */}
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <FiMapPin className="text-blue-500" /> Alamat Lengkap Operasional
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 leading-relaxed uppercase tracking-tight">
                                            {[master.alamat, master.kelurahan, master.kecamatan, master.kota, master.provinsi, master.kode_pos].filter(Boolean).join(', ') || '-'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Penanggung Jawab / Owner Full Info Card */}
                            <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 p-10 space-y-6">
                                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <FiUser size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">Profil Penanggung Jawab P2MKP</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identitas Resmi Pengelola Lembaga</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <DetailItem icon={<FiUser />} label="Nama Penanggung Jawab" value={master.nama_penanggung_jawab || (master as any).Ketua || '-'} />
                                    <DetailItem icon={<FiPhone />} label="No. Telp Penanggung Jawab" value={master.no_telp_penanggung_jawab || master.no_telp || '-'} />
                                    <DetailItem icon={<FiCalendar />} label="Tempat / Tanggal Lahir" value={master.tempat_tanggal_lahir || '-'} />
                                    <DetailItem icon={<FiUser />} label="Jenis Kelamin" value={master.jenis_kelamin || '-'} />
                                    <DetailItem icon={<FiAward />} label="Pendidikan Terakhir" value={master.pendidikan_terakhir || '-'} />
                                    <DetailItem icon={<FiShield />} label="Status Kepemilikan" value={master.status_kepemilikan || '-'} />
                                </div>
                            </Card>

                            {/* Training & Credentials Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 p-8 space-y-6">
                                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <FiActivity size={24} />
                                        </div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight">Fokus Pelatihan</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <DetailItem label="Jenis Bidang Rumpun" value={master.jenis_bidang_pelatihan || (master as any).bidang_pelatihan} small />
                                        <DetailItem label="Spesifikasi Pelatihan" value={master.jenis_pelatihan} small />
                                        <DetailItem label="Status LPK" value={master.is_lpk === "Ya" ? "Tersertifikasi LPK" : "Non-LPK"} small />
                                        <DetailItem label="Status Usaha" value={master.status_usaha || pengajuan.status_usaha || "Aktif"} small />
                                        <DetailItem label="Status Pelatihan" value={master.status_peltihan || pengajuan.status_pelatihan || "Berjalan"} small />
                                    </div>
                                </Card>

                                <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 p-8 space-y-6">
                                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                            <FiShield size={24} />
                                        </div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight">Klasifikasi & Kredensial</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <DetailItem label="Klasifikasi P2MKP" value={master.klasiikasi || (master as any).klasifikasi || "Belum Ditentukan"} small />
                                        <DetailItem label="Skor Klasifikasi" value={master.skor_klasifikasi || "0"} small />
                                        <DetailItem label="Tahun Penetapan" value={pengajuan.tahun_penetapan || master.tahun_penetapan || "-"} small />
                                        <DetailItem label="Tanggal Pendaftaran" value={master.create_at ? new Date(master.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} small />
                                        <DetailItem label="Terakhir Diperbarui" value={master.update_at ? new Date(master.update_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} small />
                                    </div>
                                </Card>
                            </div>

                            {/* Penetapan Digital Record Section */}
                            <Card className="rounded-[3rem] border-none bg-slate-900 text-white shadow-2xl shadow-blue-900/20 overflow-hidden group">
                                <CardContent className="p-10 space-y-8 relative">
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -mr-40 -mt-40 blur-[100px]" />
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                            <TbCertificate className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tighter">Metadata Surat Penetapan</h3>
                                            <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest">Penetapan Digital Signature System</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <DetailItemDark label="Nomor Sertifikat" value={pengajuan.nomor_sertifikat || (master as any).nomor_sertifikat || "DRAFT/PENDING"} />
                                        <DetailItemDark label="Nomor Surat" value={pengajuan.nomor_surat || "DRAFT/PENDING"} />
                                        <DetailItemDark label="Tanggal Penetapan" value={pengajuan.tanggal_sertifikat || (master as any).tanggal_sertifikat || "-"} />
                                        <DetailItemDark label="Berlaku Sejak" value={pengajuan.tahun_penetapan || master.tahun_penetapan || "-"} />
                                        <DetailItemDark label="Status Usaha" value={pengajuan.status_usaha || master.status_usaha} />
                                        <DetailItemDark label="Status Pelatihan" value={pengajuan.status_pelatihan || master.status_peltihan} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Complete Document Vault */}
                        <div className="space-y-8">
                            <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
                                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FiFileText className="text-blue-600 w-5 h-5" />
                                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Semua Berkas Dokumen</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">7/7 Persyaratan</span>
                                </div>
                                <CardContent className="p-4 space-y-3">
                                    <DocumentVaultItem
                                        label="1. Identifikasi Calon P2MKP"
                                        fileName={getDocValue("DokumenIdentifikasiPemilik", "dokumen_identifikasi_pemilik")}
                                    />
                                    <DocumentVaultItem
                                        label="2. Asesmen Mandiri"
                                        fileName={getDocValue("DokumenAsesmentMandiri", "dokumen_asesment_mandiri")}
                                    />
                                    <DocumentVaultItem
                                        label="3. Surat Pernyataan P2MKP"
                                        fileName={getDocValue("DokumentSuratPernyataan", "dokument_surat_pernyataan")}
                                    />
                                    <DocumentVaultItem
                                        label="4. Surat Legalitas Usaha (NIB)"
                                        fileName={getDocValue("DokumenKeteranganUsaha", "dokumen_keterangan_usaha")}
                                    />
                                    <DocumentVaultItem
                                        label="5. Surat Bebas Afiliasi Parpol"
                                        fileName={getDocValue("DokumenAfiliasiParpol", "dokumen_afiliasi_parpol")}
                                    />
                                    <DocumentVaultItem
                                        label="6. Surat Rekomendasi Dinas"
                                        fileName={getDocValue("DokumenRekomendasiDinas", "dokumen_rekomendasi_dinas")}
                                    />
                                    <DocumentVaultItem
                                        label="7. Surat Permohonan Pembentukan"
                                        fileName={getDocValue("DokumenPermohonanPembentukan", "dokumen_permohonan_pembentukan")}
                                    />
                                    {master.dokumen_permohonan_klasifikasi && (
                                        <DocumentVaultItem
                                            label="8. Permohonan Klasifikasi"
                                            fileName={master.dokumen_permohonan_klasifikasi}
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            {/* System Security Notice */}
                            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden space-y-4">
                                <div className="flex items-center gap-3">
                                    <FiInfo className="w-5 h-5 text-blue-200" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sistem Verifikasi E-LAUT</span>
                                </div>
                                <p className="text-[11px] font-medium leading-relaxed opacity-90">
                                    Setiap tindakan verifikasi atau penolakan akan dicatat secara otomatis ke dalam log audit historis dan dikirimkan ke dashboard pemohon P2MKP.
                                </p>
                                <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[9px] font-bold opacity-75">
                                    <span>ID Penetapan: #{pengajuan.IdPengajuanPenetapanPpmkp || master.IdPpmkp}</span>
                                    <span>{pengajuan.create_at || master.create_at ? new Date(pengajuan.create_at || master.create_at).toLocaleDateString('id-ID') : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Approval & Penetapan Dialog */}
                <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
                    <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden border-none rounded-3xl bg-white shadow-2xl max-h-[92vh] flex flex-col">
                        {/* Sticky Header */}
                        <div className="bg-slate-900 px-7 py-5 text-white relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                            <DialogHeader>
                                <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md shrink-0">
                                        <TbGavel className="w-5 h-5 text-blue-400" />
                                    </div>
                                    Keputusan Penetapan P2MKP
                                </DialogTitle>
                                <DialogDescription className="text-blue-200/60 font-medium text-[10px]  mt-1">
                                    {namaLembaga}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        {/* Scrollable Body */}
                        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-5">
                            {/* Lembaga chip */}
                            <div className="flex items-center gap-3 p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
                                <FiShield className="text-blue-600 shrink-0" size={16} />
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-blue-400 uppercase ">Lembaga P2MKP</p>
                                    <p className="text-xs font-black text-blue-800 uppercase truncate">{namaLembaga}</p>
                                </div>
                            </div>

                            {/* Row 1: Tahun + Tanggal Sertifikasi */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase ">Tahun Penetapan</Label>
                                    <Input
                                        type="number"
                                        value={tahunPenetapan}
                                        onChange={(e) => setTahunPenetapan(e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-800 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase ">Tanggal Sertifikat</Label>
                                    <Input
                                        type="date"
                                        value={tanggalSertifikat}
                                        onChange={(e) => setTanggalSertifikat(e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-800 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Nomor Surat + Tanggal Surat */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase ">Nomor Keputusan Ka BPPSDMKP</Label>
                                    <Input
                                        type="text"
                                        placeholder=""
                                        value={nomorSurat}
                                        onChange={(e) => setNomorSurat(e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-800 text-xs placeholder:font-medium"
                                    />
                                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed mt-1 pl-0.5">
                                        Format: <span className="italic">Keputusan Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan Nomor <strong>XXX</strong> Tahun <strong>XXX</strong> tentang <strong>XXX</strong></span>
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase ">Tanggal Keputusan Penetapan</Label>
                                    <Input
                                        type="date"
                                        value={tanggalSurat}
                                        onChange={(e) => setTanggalSurat(e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-800 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Catatan */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-slate-400 uppercase">Catatan Keputusan</Label>
                                <Textarea
                                    placeholder="Tuliskan catatan detail penetapan..."
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    className="min-h-[90px] rounded-xl bg-slate-50 border-slate-200 p-3.5 font-medium text-xs text-slate-700 resize-none"
                                />
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="shrink-0 px-7 py-5 border-t border-slate-100 bg-white flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsApprovalOpen(false)}
                                disabled={isUpdating}
                                className="h-11 flex-1 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest gap-2 transition-all"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={() => handleUpdateStatus("Approved", catatan || "Selamat, penetapan P2MKP telah disetujui.")}
                                disabled={isUpdating}
                                className="h-11 flex-[2] rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                            >
                                {isUpdating ? <HashLoader size={16} color="#fff" /> : <FiCheckCircle className="w-4 h-4" />}
                                Setujui & Tetapkan
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </section>
        </LayoutAdminElaut>
    );
}

function DetailItem({ icon, label, value, small }: { icon?: React.ReactNode; label: string; value: string | number; small?: boolean }) {
    return (
        <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {icon} {label}
            </div>
            <p className={`${small ? "text-xs" : "text-sm"} font-black text-slate-800 uppercase tracking-tight line-clamp-2`}>
                {value || "-"}
            </p>
        </div>
    );
}

function DetailItemDark({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="space-y-1">
            <span className="text-[9px] font-black text-blue-400/80 uppercase tracking-widest">{label}</span>
            <p className="text-xs font-black text-white tracking-widest uppercase">{value || "-"}</p>
        </div>
    );
}

function DocumentVaultItem({ label, fileName }: { label: string; fileName: string }) {
    const hasFile = !!fileName;
    const fullUrl = fileName?.startsWith('http') ? fileName : `${elautBaseUrl}/storage/${fileName}`;
    const fileBasename = fileName ? (fileName.includes('/') ? fileName.split('/').pop() : fileName) : '';

    return (
        <div className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${hasFile ? 'bg-white border-slate-200 hover:border-blue-300' : 'bg-slate-50 border-slate-100 opacity-60'
            }`}>
            <div className="space-y-0.5 min-w-0 flex-1 pr-3">
                <p className="text-[10px] font-black text-slate-700 truncate">{label}</p>
                <p className={`text-[9px] font-bold truncate ${hasFile ? 'text-blue-600' : 'text-slate-400'}`}>
                    {hasFile ? fileBasename : 'Belum diunggah'}
                </p>
            </div>
            {hasFile ? (
                <div className="flex items-center gap-1.5 shrink-0">
                    <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all"
                        title="Preview File"
                    >
                        <FiEye size={14} />
                    </a>
                    <a
                        href={fullUrl}
                        target="_blank"
                        download
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all"
                        title="Download File"
                    >
                        <FiDownload size={14} />
                    </a>
                </div>
            ) : (
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg shrink-0">
                    N/A
                </span>
            )}
        </div>
    );
}
