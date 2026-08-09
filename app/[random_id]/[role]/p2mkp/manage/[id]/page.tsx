"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
    Loader2,
    Save,
    Building,
    MapPin,
    Briefcase,
    User,
    ArrowLeft,
    ShieldCheck,
    Eye,
    Printer,
    FileText,
    CheckCircle2,
    XCircle,
    Globe,
    Layers,
    Tag,
    Badge,
    ExternalLink,
    Lock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useFetchDataRumpunPelatihan } from '@/hooks/elaut/master/useFetchDataRumpunPelatihan';
import { useFetchDataP2MKPById } from '@/hooks/elaut/p2mkp/useFetchDataP2MKPById';
import { elautBaseUrl } from '@/constants/urls';
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { HiUserGroup } from "react-icons/hi2";

const formSchema = z.object({
    nama_Ppmkp: z.string().optional(),
    status_kepemilikan: z.string().optional(),
    nib: z.string().optional(),
    alamat: z.string().optional(),
    provinsi: z.string().optional(),
    kota: z.string().optional(),
    kecamatan: z.string().optional(),
    kelurahan: z.string().optional(),
    kode_pos: z.string().optional(),
    no_telp: z.string().optional(),
    email: z.string().email("Format email tidak valid").optional(),
    password: z.string().optional(),
    jenis_bidang_pelatihan: z.string().optional(),
    jenis_pelatihan: z.string().optional(),
    nama_penanggung_jawab: z.string().optional(),
    no_telp_penanggung_jawab: z.string().optional(),
    tempat_tanggal_lahir: z.string().optional(),
    jenis_kelamin: z.string().optional(),
    pendidikan_terakhir: z.string().optional(),
    dokumen_identifikasi_pemilik: z.any().optional(),
    dokumen_asesment_mandiri: z.any().optional(),
    dokument_surat_pernyataan: z.any().optional(),
    dokumen_keterangan_usaha: z.any().optional(),
    dokumen_afiliasi_parpol: z.any().optional(),
    dokumen_rekomendasi_dinas: z.any().optional(),
    dokumen_permohonan_pembentukan: z.any().optional(),
    dokumen_permohonan_klasifikasi: z.any().optional(),
    klasiikasi: z.string().optional(),
    skor_klasifikasi: z.union([z.string(), z.number()]).optional(),
    tahun_penetapan: z.string().optional(),
    status_usaha: z.string().optional(),
    status_peltihan: z.string().optional(),
    bidang_pelatihan: z.string().optional(),
    is_lpk: z.string().optional(),
    status: z.string().optional(),
});

export default function EditP2MKPPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState("profil");

    // Check Access cookie for superAdmin edit permission
    useEffect(() => {
        const accessCookie = Cookies.get('Access') || "";
        setIsSuperAdmin(accessCookie.includes('superAdmin'));
    }, []);

    // Fetch Rumpun Pelatihan & Existing P2MKP Data
    const { data: rumpunPelatihan, loading: loadingRumpun } = useFetchDataRumpunPelatihan();
    const { data: p2mkpData, loading: loadingData, fetchP2MKPDataById } = useFetchDataP2MKPById(id);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama_Ppmkp: "",
            status_kepemilikan: "Perserorangan",
            nib: "",
            alamat: "",
            provinsi: "",
            kota: "",
            kecamatan: "",
            kelurahan: "",
            kode_pos: "",
            no_telp: "",
            email: "",
            password: "",
            jenis_bidang_pelatihan: "",
            jenis_pelatihan: "",
            nama_penanggung_jawab: "",
            no_telp_penanggung_jawab: "",
            tempat_tanggal_lahir: "",
            jenis_kelamin: "",
            pendidikan_terakhir: "",
            dokumen_identifikasi_pemilik: "",
            dokumen_asesment_mandiri: "",
            dokument_surat_pernyataan: "",
            dokumen_keterangan_usaha: "",
            dokumen_afiliasi_parpol: "",
            dokumen_rekomendasi_dinas: "",
            dokumen_permohonan_pembentukan: "",
            dokumen_permohonan_klasifikasi: "",
            klasiikasi: "",
            skor_klasifikasi: 0,
            tahun_penetapan: "",
            status_usaha: "",
            status_peltihan: "",
            is_lpk: "",
            status: "",
        },
    });

    // Populate form when data is loaded
    useEffect(() => {
        if (p2mkpData) {
            form.reset({
                nama_Ppmkp: p2mkpData.nama_Ppmkp || p2mkpData.nama_ppmkp || "",
                status_kepemilikan: p2mkpData.status_kepemilikan || "Perserorangan",
                nib: p2mkpData.nib || "",
                alamat: p2mkpData.alamat || "",
                provinsi: p2mkpData.provinsi || "",
                kota: p2mkpData.kota || "",
                kecamatan: p2mkpData.kecamatan || "",
                kelurahan: p2mkpData.kelurahan || "",
                kode_pos: p2mkpData.kode_pos || "",
                no_telp: p2mkpData.no_telp || "",
                email: p2mkpData.email || "",
                jenis_bidang_pelatihan: p2mkpData.jenis_bidang_pelatihan || "",
                jenis_pelatihan: p2mkpData.jenis_pelatihan || "",
                nama_penanggung_jawab: p2mkpData.nama_penanggung_jawab || "",
                no_telp_penanggung_jawab: p2mkpData.no_telp_penanggung_jawab || "",
                tempat_tanggal_lahir: p2mkpData.tempat_tanggal_lahir || "",
                jenis_kelamin: p2mkpData.jenis_kelamin || "",
                pendidikan_terakhir: p2mkpData.pendidikan_terakhir || "",
                dokumen_identifikasi_pemilik: p2mkpData.dokumen_identifikasi_pemilik || "",
                dokumen_asesment_mandiri: p2mkpData.dokumen_asesment_mandiri || "",
                dokument_surat_pernyataan: p2mkpData.dokument_surat_pernyataan || "",
                dokumen_keterangan_usaha: p2mkpData.dokumen_keterangan_usaha || "",
                dokumen_afiliasi_parpol: p2mkpData.dokumen_afiliasi_parpol || "",
                dokumen_rekomendasi_dinas: p2mkpData.dokumen_rekomendasi_dinas || "",
                dokumen_permohonan_pembentukan: p2mkpData.dokumen_permohonan_pembentukan || "",
                dokumen_permohonan_klasifikasi: p2mkpData.dokumen_permohonan_klasifikasi || "",
                klasiikasi: (p2mkpData as any).klasifikasi || p2mkpData.klasiikasi || "",
                skor_klasifikasi: p2mkpData.skor_klasifikasi || 0,
                tahun_penetapan: p2mkpData.tahun_penetapan || "",
                status_usaha: p2mkpData.status_usaha || "",
                status_peltihan: p2mkpData.status_peltihan || "",
                is_lpk: p2mkpData.is_lpk || "",
                status: p2mkpData.status || "",
            });
        }
    }, [p2mkpData, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!isSuperAdmin) {
            Swal.fire({
                title: 'Akses Ditolak',
                text: 'Anda tidak memiliki hak akses superAdmin untuk mengubah data ini.',
                icon: 'warning',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = Cookies.get('XSRF091');
            if (!token) {
                Swal.fire({
                    title: 'Error',
                    text: 'Anda belum login atau sesi habis.',
                    icon: 'error',
                });
                return;
            }

            const submitValues = { ...values };
            if (!submitValues.password) {
                delete submitValues.password;
            }

            const formData = new FormData();

            Object.keys(submitValues).forEach(key => {
                const value = submitValues[key as keyof typeof submitValues];
                if (value === undefined || value === null || value === "") return;

                if (key.startsWith('dokumen_') || key.startsWith('dokument_')) {
                    if (value instanceof FileList && value.length > 0) {
                        formData.append(key, value[0]);
                    }
                } else {
                    formData.append(key, String(value));
                }
            });

            const response = await axios.put(`${elautBaseUrl}/p2mkp/update_p2mkp?id=${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data P2MKP berhasil diperbarui.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3b82f6',
                }).then(() => {
                    const currentPath = window.location.pathname;
                    const managePath = currentPath.replace(/\/manage\/.*$/, '/manage');
                    router.push(managePath);
                });
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            Swal.fire({
                title: 'Gagal Menyimpan',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
                icon: 'error',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#d33',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    // Trigger PDF Export Print Dialog
    const handlePrintPDF = () => {
        window.print();
    };

    if (loadingData) {
        return (
            <LayoutAdminElaut>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-500 font-bold">Memuat Data P2MKP...</span>
                </div>
            </LayoutAdminElaut>
        );
    }

    const documentList = [
        { name: "dokumen_identifikasi_pemilik", label: "Verifikasi Identitas Pemilik" },
        { name: "dokumen_asesment_mandiri", label: "Matriks Asesmen Mandiri" },
        { name: "dokument_surat_pernyataan", label: "Surat Pernyataan Integritas" },
        { name: "dokumen_keterangan_usaha", label: "Izin Usaha (SKU/NIB)" },
        { name: "dokumen_afiliasi_parpol", label: "Afiliasi Non-Parpol" },
        { name: "dokumen_rekomendasi_dinas", label: "Rekomendasi Dinas Kelautan" },
        { name: "dokumen_permohonan_pembentukan", label: "Proposal Pembentukan P2MKP" },
        { name: "dokumen_permohonan_klasifikasi", label: "Permohonan Klasifikasi" },
    ];

    const currentValues = form.getValues();

    return (
        <LayoutAdminElaut>
            {/* Custom Style for PDF Print View */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-p2mkp-dossier, #printable-p2mkp-dossier * {
                        visibility: visible !important;
                    }
                    #printable-p2mkp-dossier {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        display: block !important;
                        background: #ffffff !important;
                        color: #0f172a !important;
                    }
                }
            `}</style>

            {/* Printable Dossier Container (Shown only when printing) */}
            <div id="printable-p2mkp-dossier" className="hidden print:block p-8 bg-white text-slate-900 font-sans space-y-6">
                <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                            Kementerian Kelautan dan Perikanan RI
                        </h1>
                        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-widest mt-0.5">
                            Dossier Data Lembaga P2MKP Terdaftar
                        </h2>
                    </div>
                    <div className="text-right text-xs font-semibold text-slate-500">
                        <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="font-bold text-slate-800">ID: {id}</p>
                    </div>
                </div>

                {/* Section 1: Profil Utama */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-1">I. Profil & Identitas Lembaga</h3>
                    <table className="w-full text-xs border-collapse border border-slate-200">
                        <tbody>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 w-1/3 border-r">Nama Lembaga P2MKP</td>
                                <td className="p-2 font-black uppercase text-blue-900">{currentValues.nama_Ppmkp || "-"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Nomor Induk Berusaha (NIB)</td>
                                <td className="p-2 font-bold">{currentValues.nib || "-"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Status Kepemilikan</td>
                                <td className="p-2 font-semibold">{currentValues.status_kepemilikan || "-"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Status LPK</td>
                                <td className="p-2 font-semibold">{currentValues.is_lpk || "-"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Email Resmi</td>
                                <td className="p-2 font-semibold">{currentValues.email || "-"}</td>
                            </tr>
                            <tr>
                                <td className="p-2 font-bold bg-slate-50 border-r">Telepon Kontak</td>
                                <td className="p-2 font-semibold">{currentValues.no_telp || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section 2: Geolokasi */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-1">II. Geolokasi & Alamat</h3>
                    <table className="w-full text-xs border-collapse border border-slate-200">
                        <tbody>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 w-1/3 border-r">Alamat Lengkap</td>
                                <td className="p-2 font-semibold">{currentValues.alamat || "-"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Kelurahan / Desa</td>
                                <td className="p-2 font-semibold">{currentValues.kelurahan || "-"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Kecamatan</td>
                                <td className="p-2 font-semibold">{currentValues.kecamatan || "-"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Kota / Kabupaten</td>
                                <td className="p-2 font-semibold">{currentValues.kota || "-"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Provinsi</td>
                                <td className="p-2 font-semibold">{currentValues.provinsi || "-"}</td>
                            </tr>
                            <tr>
                                <td className="p-2 font-bold bg-slate-50 border-r">Kode Pos</td>
                                <td className="p-2 font-semibold">{currentValues.kode_pos || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section 3: Administrasi & Pelatihan */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-1">III. Administrasi & Sektor Pelatihan</h3>
                    <table className="w-full text-xs border-collapse border border-slate-200">
                        <tbody>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 w-1/3 border-r">Status Registrasi</td>
                                <td className="p-2 font-black uppercase text-emerald-700">{currentValues.status || "APPROVED"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Klasifikasi Lembaga</td>
                                <td className="p-2 font-bold uppercase">{currentValues.klasiikasi || "Belum ditetapkan"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Tahun Penetapan</td>
                                <td className="p-2 font-semibold">{currentValues.tahun_penetapan || "-"}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 border-r">Sub-Kategori Pelatihan</td>
                                <td className="p-2 font-semibold">{currentValues.jenis_pelatihan || "-"}</td>
                            </tr>
                            <tr>
                                <td className="p-2 font-bold bg-slate-50 border-r">Status Pelatihan</td>
                                <td className="p-2 font-semibold">{currentValues.status_peltihan || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section 4: Penanggung Jawab */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-1">IV. Otorisasi & Penanggung Jawab</h3>
                    <table className="w-full text-xs border-collapse border border-slate-200">
                        <tbody>
                            <tr className="border-b border-slate-200">
                                <td className="p-2 font-bold bg-slate-50 w-1/3 border-r">Nama Penanggung Jawab</td>
                                <td className="p-2 font-bold uppercase">{currentValues.nama_penanggung_jawab || "-"}</td>
                            </tr>
                            <tr>
                                <td className="p-2 font-bold bg-slate-50 border-r">Nomor HP / Ponsel</td>
                                <td className="p-2 font-semibold">{currentValues.no_telp_penanggung_jawab || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section 5: Lampiran Dokumen */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-1">V. Status Lampiran Dokumen Verifikasi</h3>
                    <table className="w-full text-xs border-collapse border border-slate-200">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-left">
                                <th className="p-2 w-10 text-center font-bold">No</th>
                                <th className="p-2 font-bold">Nama Dokumen</th>
                                <th className="p-2 w-32 font-bold text-center">Status File</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documentList.map((doc, idx) => {
                                const val = currentValues[doc.name as keyof typeof currentValues];
                                const hasFile = typeof val === 'string' && val.length > 0;
                                return (
                                    <tr key={doc.name} className="border-b border-slate-200">
                                        <td className="p-2 text-center font-bold text-slate-400">{idx + 1}</td>
                                        <td className="p-2 font-semibold">{doc.label}</td>
                                        <td className="p-2 text-center font-bold">
                                            {hasFile ? (
                                                <span className="text-emerald-700">Tersedia (OK)</span>
                                            ) : (
                                                <span className="text-slate-400 italic">Belum Ada</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Stamp */}
                <div className="pt-8 flex justify-between items-end text-xs">
                    <div className="space-y-1">
                        <p className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Sistem Informasi Kelautan & Perikanan (ELAUT)</p>
                        <p className="text-[10px] text-slate-400">Dokumen resmi dicetak otomatis dari server ELAUT.</p>
                    </div>
                    <div className="text-center border-t border-slate-300 pt-2 w-48">
                        <p className="font-bold text-slate-700">Petugas Verifikator</p>
                        <div className="h-12"></div>
                        <p className="font-black uppercase text-slate-900 border-t border-dashed pt-1">Pusat Pelatihan KKP</p>
                    </div>
                </div>
            </div>

            {/* Standard Web Page View */}
            <section className="flex-1 flex flex-col space-y-6 relative overflow-hidden print:hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                <HeaderPageLayoutAdminElaut
                    title={isSuperAdmin ? "Kelola & Edit Data P2MKP" : "Detail & Profil P2MKP"}
                    description={isSuperAdmin ? "Sinkronisasi dan pembaruan profil entitas P2MKP dalam sistem." : "Informasi lengkap entitas P2MKP yang terdaftar (Mode Lihat)."}
                    icon={<div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/40"><HiUserGroup className="text-2xl text-white" /></div>}
                />

                {/* Top Action & Mode Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all font-bold text-xs"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Daftar</span>
                        </Button>

                        {/* Role Access Badge */}
                        {isSuperAdmin ? (
                            <div className="px-3.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-black rounded-full border border-blue-200 flex items-center gap-1.5 shadow-sm">
                                <ShieldCheck size={15} className="text-blue-600" />
                                <span>Mode Edit (superAdmin)</span>
                            </div>
                        ) : (
                            <div className="px-3.5 py-1.5 bg-amber-50 text-amber-800 text-xs font-black rounded-full border border-amber-200 flex items-center gap-1.5 shadow-sm">
                                <Eye size={15} className="text-amber-600" />
                                <span>Mode Lihat (Read-Only)</span>
                            </div>
                        )}
                    </div>

                    {/* PDF Export Button (Visible to everyone) */}
                    <Button
                        onClick={handlePrintPDF}
                        className="h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-wider text-[11px] shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4 text-blue-400" />
                        <span>Cetak / Export PDF</span>
                    </Button>
                </div>

                {!isSuperAdmin && (
                    <div className="p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-center gap-3 text-amber-900 text-xs font-semibold shadow-sm">
                        <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>
                            Anda sedang dalam <strong>Mode Lihat (Read-Only)</strong>. Pengeditan hanya diizinkan untuk akun bertipe <strong>superAdmin</strong>.
                        </span>
                    </div>
                )}

                <article className="w-full h-full p-1 overflow-y-auto pb-20 custom-scrollbar">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto">
                            {/* Interactive Tabs Navigation */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="w-full justify-start h-14 bg-slate-100/80 p-1.5 rounded-3xl border border-slate-200/60 overflow-x-auto custom-scrollbar gap-1">
                                    <TabsTrigger value="profil" className="rounded-2xl px-5 h-11 text-xs font-extrabold uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all gap-2">
                                        <Building size={14} /> Profil Utama
                                    </TabsTrigger>
                                    <TabsTrigger value="lokasi" className="rounded-2xl px-5 h-11 text-xs font-extrabold uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all gap-2">
                                        <MapPin size={14} /> Geolokasi & Alamat
                                    </TabsTrigger>
                                    <TabsTrigger value="pelatihan" className="rounded-2xl px-5 h-11 text-xs font-extrabold uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all gap-2">
                                        <Briefcase size={14} /> Pelatihan & Akses
                                    </TabsTrigger>
                                    <TabsTrigger value="penanggung_jawab" className="rounded-2xl px-5 h-11 text-xs font-extrabold uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all gap-2">
                                        <User size={14} /> Penanggung Jawab
                                    </TabsTrigger>
                                    <TabsTrigger value="dokumen" className="rounded-2xl px-5 h-11 text-xs font-extrabold uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all gap-2">
                                        <FileText size={14} /> Vault Dokumen
                                    </TabsTrigger>
                                </TabsList>

                                {/* TAB 1: Profil Utama */}
                                <TabsContent value="profil" className="mt-4">
                                    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-sm">
                                        <CardHeader className="p-8 pb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                    <Building className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Profil Kelembagaan</CardTitle>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Identitas Utama Entitas P2MKP</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-8 pt-4">
                                            <FormField
                                                control={form.control}
                                                name="nama_Ppmkp"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nama Lembaga</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!isSuperAdmin} placeholder="Nama lembaga secara lengkap..." className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="status_kepemilikan"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Status Kepemilikan</FormLabel>
                                                        <Select disabled={!isSuperAdmin} onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90">
                                                                    <SelectValue placeholder="Pilih Status" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl">
                                                                <SelectItem value="Perserorangan">Perserorangan</SelectItem>
                                                                <SelectItem value="Kelompok">Kelompok</SelectItem>
                                                                <SelectItem value="Instansi Pemerintah">Instansi Pemerintah</SelectItem>
                                                                <SelectItem value="Swasta">Swasta</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="nib"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nomor Induk Berusaha (NIB)</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!isSuperAdmin} placeholder="Nomor NIB..." className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Resmi</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!isSuperAdmin} placeholder="admin@p2mkp.go.id" className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="no_telp"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Kontak Telepon</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!isSuperAdmin} placeholder="08XXXXXXXXXX" className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="is_lpk"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Status LPK</FormLabel>
                                                        <Select disabled={!isSuperAdmin} onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90">
                                                                    <SelectValue placeholder="Pilih..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl">
                                                                <SelectItem value="Ya">Terdaftar LPK (Ya)</SelectItem>
                                                                <SelectItem value="Tidak">Bukan LPK (Tidak)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 2: Geolokasi & Alamat */}
                                <TabsContent value="lokasi" className="mt-4">
                                    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-sm">
                                        <CardHeader className="p-8 pb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                                    <MapPin className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Geolokasi & Alamat</CardTitle>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Lokasi Fisik Lembaga</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6 p-8 pt-4">
                                            <FormField
                                                control={form.control}
                                                name="alamat"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Alamat Lengkap</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!isSuperAdmin} placeholder="Nama jalan, nomor bangunan, RT/RW..." className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {[
                                                    { id: 'provinsi', label: 'Provinsi' },
                                                    { id: 'kota', label: 'Kota / Kabupaten' },
                                                    { id: 'kecamatan', label: 'Kecamatan' },
                                                    { id: 'kelurahan', label: 'Kelurahan' },
                                                    { id: 'kode_pos', label: 'Kode Pos' },
                                                ].map((item) => (
                                                    <FormField
                                                        key={item.id}
                                                        control={form.control}
                                                        name={item.id as any}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">{item.label}</FormLabel>
                                                                <FormControl>
                                                                    <Input disabled={!isSuperAdmin} placeholder={`Entry ${item.label}...`} className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 3: Pelatihan & Administrasi */}
                                <TabsContent value="pelatihan" className="mt-4">
                                    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-sm">
                                        <CardHeader className="p-8 pb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                    <Briefcase className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Pelatihan & Registrasi</CardTitle>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Administrasi & Sektor Keahlian</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 pt-4">
                                            <FormField
                                                control={form.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Status Akun</FormLabel>
                                                        <Select disabled={!isSuperAdmin} onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90">
                                                                    <SelectValue placeholder="Pilih Status" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl">
                                                                <SelectItem value="APPROVED">APPROVED</SelectItem>
                                                                <SelectItem value="Aktif">AKTIF</SelectItem>
                                                                <SelectItem value="Tidak Aktif">TIDAK AKTIF</SelectItem>
                                                                <SelectItem value="Calon">CALON</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="klasiikasi"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Klasifikasi</FormLabel>
                                                        <Select disabled={!isSuperAdmin} onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90">
                                                                    <SelectValue placeholder="Tingkatan" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl">
                                                                <SelectItem value="Mula">Mula</SelectItem>
                                                                <SelectItem value="Madya">Madya</SelectItem>
                                                                <SelectItem value="Utama">Utama</SelectItem>
                                                                <SelectItem value="Pemula">Pemula</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="tahun_penetapan"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Tahun Penetapan</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!isSuperAdmin} placeholder="YYYY" className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="jenis_bidang_pelatihan"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Rumpun Pelatihan</FormLabel>
                                                        <Select disabled={!isSuperAdmin} onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90">
                                                                    <SelectValue placeholder={loadingRumpun ? "Memuat..." : "Pilih Rumpun"} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl">
                                                                {rumpunPelatihan?.map((item: any) => (
                                                                    <SelectItem key={item.id_rumpun_pelatihan} value={String(item.id_rumpun_pelatihan)}>
                                                                        {item.name.toUpperCase()}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="jenis_pelatihan"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Sub-Kategori Pelatihan</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!isSuperAdmin} placeholder="Budidaya Air Tawar..." className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="status_peltihan"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Status Pelatihan</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!isSuperAdmin} placeholder="Status..." className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 4: Penanggung Jawab */}
                                <TabsContent value="penanggung_jawab" className="mt-4">
                                    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-sm">
                                        <CardHeader className="p-8 pb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Penanggung Jawab</CardTitle>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Otorisasi & Person In Charge</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 pt-4">
                                            <FormField
                                                control={form.control}
                                                name="nama_penanggung_jawab"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Nama Lengkap Penanggung Jawab</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!isSuperAdmin} placeholder="Nama penanggung jawab..." className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="no_telp_penanggung_jawab"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Nomor Ponsel Langsung</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!isSuperAdmin} placeholder="08XXXXXXXXXX" className="h-13 bg-slate-50/60 border-slate-200 rounded-2xl px-5 font-bold text-slate-800 disabled:opacity-90" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB 5: Vault Dokumen */}
                                <TabsContent value="dokumen" className="mt-4">
                                    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-sm">
                                        <CardHeader className="p-8 pb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/20">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Vault Dokumen Pendukung</CardTitle>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Lampiran Verifikasi & Persyaratan Legilitas</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 pt-4">
                                            {documentList.map((doc) => (
                                                <FormField
                                                    key={doc.name}
                                                    control={form.control}
                                                    name={doc.name as any}
                                                    render={({ field: { value, onChange, ...fieldProps } }) => {
                                                        const hasExistingFile = typeof value === 'string' && value.length > 0;

                                                        return (
                                                            <FormItem className="p-5 bg-slate-50/60 rounded-3xl border border-slate-200/70 space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <FormLabel className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                                                                        {doc.label}
                                                                    </FormLabel>
                                                                    {hasExistingFile ? (
                                                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1">
                                                                            <CheckCircle2 size={12} /> Tersedia
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2.5 py-0.5 bg-slate-200/80 text-slate-500 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1">
                                                                            <XCircle size={12} /> Belum Ada
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-3">
                                                                    {hasExistingFile && (
                                                                        <a
                                                                            href={value}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-2xl border border-blue-200 text-xs font-bold transition-all group"
                                                                        >
                                                                            <FileText size={16} className="text-blue-600 shrink-0" />
                                                                            <span className="truncate flex-1">Lihat Berkas Terlampir</span>
                                                                            <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                                        </a>
                                                                    )}

                                                                    {isSuperAdmin && (
                                                                        <div className="group relative">
                                                                            <Input
                                                                                {...fieldProps}
                                                                                type="file"
                                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                                className="h-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl px-4 py-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-all text-xs font-semibold text-slate-500"
                                                                                onChange={(event) => {
                                                                                    onChange(event.target.files);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            {/* Bottom Action Footer */}
                            <div className="flex flex-col sm:flex-row justify-end pt-4 gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                >
                                    Kembali
                                </Button>

                                {isSuperAdmin && (
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-14 px-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70 gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                <span>Simpan Perubahan</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </article>
            </section>
        </LayoutAdminElaut>
    );
}


