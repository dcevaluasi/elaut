"use client";

import React, { useEffect, useState, useMemo } from "react";
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
    FiCalendar,
    FiPhone,
    FiMail,
    FiBriefcase,
    FiCheckCircle,
    FiInfo,
    FiDownload,
    FiClock,
    FiAlertCircle
} from "react-icons/fi";
import { TbGavel, TbCertificate, TbTarget } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HashLoader } from "react-spinners";
import { motion } from "framer-motion";
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
    const [tanggalSertifikat, setTanggalSertifikat] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const isLoading = loadingPengajuan || loadingP2MKP;

    useEffect(() => {
        if (!pengajuanList || !p2mkpList || !id) return;

        const currentPengajuan = pengajuanList.find(p => String(p.IdPengajuanPenetapanPpmkp) === String(id));
        if (currentPengajuan) {
            const currentMaster = p2mkpList.find(m => String(m.IdPpmkp) === String(currentPengajuan.id_Ppmkp));
            if (currentMaster) {
                setMatchedData({
                    pengajuan: currentPengajuan,
                    master: currentMaster
                });
                setTahunPenetapan(currentPengajuan.tahun_penetapan || new Date().getFullYear().toString());
                setTanggalSertifikat(currentPengajuan.tanggal_sertifikat || "");
            }
        }
    }, [pengajuanList, p2mkpList, id]);

    const handleUpdateStatus = async (status: "Approved" | "Perbaikan") => {
        if (!matchedData) return;
        setIsUpdating(true);

        try {
            const token = Cookies.get("XSRF091");
            await axios.put(
                `${elautBaseUrl}/p2mkp/update_pengjuan_penetapan_p2mkp?id=${matchedData.pengajuan.IdPengajuanPenetapanPpmkp}`,
                { status, tahun_penetapan: tahunPenetapan, tanggal_sertifikat: tanggalSertifikat },
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
                notes: catatan,
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
                title: "Pembaruan Berhasil",
                text: `Pengajuan telah ${status === "Approved" ? "disetujui" : "dikembalikan untuk perbaikan"}.`,
            });

            setIsApprovalOpen(false);
            window.location.reload(); // Refresh to catch updated state
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
                        <p className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em] animate-pulse">Syncing Knowledge Base</p>
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
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">ID Pengajuan atau Master P2MKP tidak valid.</p>
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

    const getStatusBadge = (status: string) => {
        const normalizedStatus = !status ? "diajukan" : status.toLowerCase();
        switch (normalizedStatus) {
            case "disetujui":
                return <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"><FiCheckCircle className="w-4 h-4 mr-2" /> Approved</Badge>;
            case "perbaikan":
                return <Badge className="bg-rose-50 text-rose-600 border border-rose-100 shadow-sm px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"><FiAlertCircle className="w-4 h-4 mr-2" /> Perbaikan</Badge>;
            default:
                return <Badge className="bg-amber-50 text-amber-600 border border-amber-100 shadow-sm px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"><FiClock className="w-4 h-4 mr-2 animate-pulse" /> Diajukan</Badge>;
        }
    };

    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col pb-20">
                <HeaderPageLayoutAdminElaut
                    title="Detail Penetapan P2MKP"
                    description={`Review data lengkap pengajuan penetapan untuk ${master.nama_ppmkp}.`}
                    icon={<TbGavel className="text-3xl" />}
                />

                <article className="w-full flex-1 p-8 space-y-10">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-14 px-8 gap-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 group"
                        >
                            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Daftar
                        </Button>

                        <div className="flex items-center gap-4">
                            {getStatusBadge(pengajuan.status)}
                            {pengajuan.status !== "Approved" && (
                                <Button
                                    onClick={() => setIsApprovalOpen(true)}
                                    className="h-14 px-8 gap-3 bg-slate-900 text-white hover:bg-slate-800 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95"
                                >
                                    <TbGavel className="w-5 h-5" />
                                    Lakukan Penetapan
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left Column: P2MKP Master Identity */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Profile Card */}
                            <Card className="rounded-[3rem] border-none bg-white shadow-2xl shadow-slate-200/50 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                                <CardContent className="p-10 space-y-8 relative z-10">
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-2xl shadow-blue-500/30">
                                            <FiShield size={40} />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{master.nama_ppmkp}</h2>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <Badge variant="outline" className="border-slate-200 text-slate-400 rounded-full px-3">{master.status_kepemilikan}</Badge>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5"><FiMapPin className="text-rose-500" /> {master.kota}, {master.provinsi}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                                        <DetailItem icon={<FiUser />} label="Penanggung Jawab" value={master.nama_penanggung_jawab} />
                                        <DetailItem icon={<FiFileText />} label="NIB / Izin Usaha" value={master.nib || "N/A"} />
                                        <DetailItem icon={<FiPhone />} label="Telepon" value={master.no_telp || "-"} />
                                        <DetailItem icon={<FiMail />} label="Email Terdaftar" value={master.email || "-"} />
                                    </div>

                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <FiMapPin className="text-blue-500" /> Alamat Lengkap
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase tracking-tight">
                                            {master.alamat}, {master.kelurahan}, {master.kecamatan}, {master.kota}, {master.provinsi} {master.kode_pos}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Training & Operation Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 p-10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <FiActivity size={24} />
                                        </div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight">Fokus Pelatihan</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <DetailItem label="Jenis Bidang" value={master.jenis_bidang_pelatihan} small />
                                        <DetailItem label="Jenis Pelatihan" value={master.jenis_pelatihan} small />
                                        <DetailItem label="Status LPK" value={master.is_lpk === "Ya" ? "Tersertifikasi LPK" : "Non-LPK"} small />
                                    </div>
                                </Card>

                                <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 p-10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                            <FiShield size={24} />
                                        </div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight">Klasifikasi Penetapan</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <DetailItem label="Kelas" value={master.klasiikasi || "Belum Ditentukan"} small />
                                        <DetailItem label="Skor Klasifikasi" value={master.skor_klasifikasi || "0"} small />
                                        <DetailItem label="Tahun Penetapan" value={master.tahun_penetapan || "-"} small />
                                    </div>
                                </Card>
                            </div>

                            {/* Penetapan Record Section */}
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        <DetailItemDark label="Nomor Sertifikat" value={pengajuan.nomor_sertifikat || "DRAFT/PENDING"} />
                                        <DetailItemDark label="Nomor Surat" value={pengajuan.nomor_surat || "DRAFT/PENDING"} />
                                        <DetailItemDark label="Tanggal Penetapan" value={pengajuan.tanggal_sertifikat || "-"} />
                                        <DetailItemDark label="Berlaku Sejak" value={pengajuan.tahun_penetapan || master.tahun_penetapan || "-"} />
                                        <DetailItemDark label="Status Usaha" value={pengajuan.status_usaha || master.status_usaha} />
                                        <DetailItemDark label="Status Pelatihan" value={pengajuan.status_pelatihan || master.status_peltihan} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Documents & Audit Trail */}
                        <div className="space-y-10">
                            {/* Document Vault */}
                            <Card className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
                                <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                                    <FiFileText className="text-blue-600 w-5 h-5" />
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Arsip Digital P2MKP</h3>
                                </div>
                                <CardContent className="p-4 space-y-2">
                                    <DocumentLink label="KTP / Identitas Pemilik" fileName={master.dokumen_identifikasi_pemilik} />
                                    <DocumentLink label="Self-Assessment (Asesmen Mandiri)" fileName={master.dokumen_asesment_mandiri} />
                                    <DocumentLink label="Surat Pernyataan Mutu" fileName={master.dokument_surat_pernyataan} />
                                    <DocumentLink label="Izin Usaha / NIB" fileName={master.dokumen_keterangan_usaha} />
                                    <DocumentLink label="Surat Pernyataan Polpar" fileName={master.dokumen_afiliasi_parpol} />
                                    <DocumentLink label="Rekomendasi Dinas" fileName={master.dokumen_rekomendasi_dinas} />
                                    <DocumentLink label="Permohonan Pembentukan" fileName={master.dokumen_permohonan_pembentukan} />
                                    <DocumentLink label="Permohonan Klasifikasi" fileName={master.dokumen_permohonan_klasifikasi} />
                                </CardContent>
                            </Card>

                            {/* System Context */}
                            <div className="p-10 rounded-[2.5rem] bg-blue-600 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <FiInfo className="w-5 h-5" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Audit Intelligence</span>
                                    </div>
                                    <p className="text-[11px] font-bold leading-relaxed opacity-90 uppercase italic">
                                        Data ini telah diverifikasi melalui protokol keamanan E-LAUT. Perubahan data master akan mempengaruhi validitas sertifikat elektronik yang diterbitkan.
                                    </p>
                                    <div className="pt-4 border-t border-white/20">
                                        <span className="block text-[8px] font-black opacity-50 uppercase tracking-widest">Last Modified</span>
                                        <span className="text-[10px] font-bold">{master.update_at || master.create_at}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Approval & Penetapan Dialog */}
                <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
                    <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none rounded-[3rem] bg-white shadow-2xl">
                        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                        <TbGavel className="w-6 h-6 text-blue-400" />
                                    </div>
                                    Keputusan Penetapan P2MKP
                                </DialogTitle>
                                <DialogDescription className="text-blue-200/60 font-medium uppercase text-[10px] tracking-widest mt-2 px-1">
                                    Berikan verifikasi akhir untuk lembaga {master.nama_ppmkp}.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun Penetapan</Label>
                                    <Input
                                        type="number"
                                        value={tahunPenetapan}
                                        onChange={(e) => setTahunPenetapan(e.target.value)}
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Sertifikatasi</Label>
                                    <Input
                                        type="date"
                                        value={tanggalSertifikat}
                                        onChange={(e) => setTanggalSertifikat(e.target.value)}
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institusi</Label>
                                    <div className="h-14 flex items-center px-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                                        <span className="text-xs font-black text-blue-700 uppercase truncate">{master.nama_ppmkp}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Pemeriksaan</Label>
                                <Textarea
                                    placeholder="Tuliskan catatan detail untuk lembaga (Alasan disetujui atau detail perbaikan)..."
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    className="min-h-[150px] rounded-[2rem] bg-slate-50 border-slate-100 p-6 font-medium text-slate-600 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => handleUpdateStatus("Perbaikan")}
                                    disabled={isUpdating}
                                    className="h-16 rounded-2xl border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-black uppercase text-[10px] tracking-widest gap-3 transition-all active:scale-95"
                                >
                                    <FiAlertCircle className="w-5 h-5" />
                                    Kembalikan (Perbaikan)
                                </Button>
                                <Button
                                    onClick={() => handleUpdateStatus("Approved")}
                                    disabled={isUpdating}
                                    className="h-16 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl shadow-emerald-200 transition-all active:scale-95"
                                >
                                    {isUpdating ? <HashLoader size={20} color="#fff" /> : <FiCheckCircle className="w-5 h-5" />}
                                    Setujui & Tetapkan
                                </Button>
                            </div>
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
            <p className={`${small ? "text-xs" : "text-[13px]"} font-black text-slate-800 uppercase tracking-tight line-clamp-2`}>
                {value || "-"}
            </p>
        </div>
    );
}

function DetailItemDark({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="space-y-1">
            <span className="text-[9px] font-black text-blue-400/80 uppercase tracking-widest">{label}</span>
            <p className="text-sm font-black text-white tracking-widest uppercase">{value || "-"}</p>
        </div>
    );
}

function DocumentLink({ label, fileName }: { label: string; fileName: string }) {
    if (!fileName) return null;
    return (
        <a
            href={`${elautBaseUrl}/storage/${fileName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all group active:scale-[0.98]"
        >
            <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
                <p className="text-[10px] font-bold text-slate-800 truncate max-w-[140px]">{fileName}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FiDownload size={14} />
            </div>
        </a>
    );
}
