"use client";

import React, { useState } from 'react';
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
    Badge,
    KeyRound
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useFetchDataRumpunPelatihan } from '@/hooks/elaut/master/useFetchDataRumpunPelatihan';
import { elautBaseUrl } from '@/constants/urls';
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { HiUserGroup } from "react-icons/hi2";

const formSchema = z.object({
    nama_Ppmkp: z.string().min(1, "Nama P2MKP wajib diisi"),
    status_kepemilikan: z.string().optional(),
    nib: z.string().optional(),
    alamat: z.string().optional(),
    provinsi: z.string().optional(),
    kota: z.string().optional(),
    kecamatan: z.string().optional(),
    kelurahan: z.string().optional(),
    kode_pos: z.string().optional(),
    no_telp: z.string().optional(),
    email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
    password: z.string().min(6, "Password minimal 6 karakter"),
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

export default function CreateP2MKPPage() {
    const router = useRouter();


    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Fetch Rumpun Pelatihan
    const { data: rumpunPelatihan, loading: loadingRumpun } = useFetchDataRumpunPelatihan();

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
            dokumen_identifikasi_pemilik: undefined,
            dokumen_asesment_mandiri: undefined,
            dokument_surat_pernyataan: undefined,
            dokumen_keterangan_usaha: undefined,
            dokumen_afiliasi_parpol: undefined,
            dokumen_rekomendasi_dinas: undefined,
            dokumen_permohonan_pembentukan: undefined,
            dokumen_permohonan_klasifikasi: undefined,
            klasiikasi: "",
            skor_klasifikasi: 0,
            tahun_penetapan: "",
            status_usaha: "",
            status_peltihan: "",
            is_lpk: "",
            status: "Aktif",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
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

            const formData = new FormData();

            // Append all fields to FormData
            Object.keys(values).forEach(key => {
                const value = values[key as keyof typeof values];
                if (value === undefined || value === null || value === "") return;

                // Handle file inputs (if it's a FileList, get the first file)
                if (key.startsWith('dokumen_') || key.startsWith('dokument_')) {
                    if (value instanceof FileList && value.length > 0) {
                        formData.append(key, value[0]);
                    }
                } else {
                    formData.append(key, String(value));
                }
            });

            const response = await axios.post(`${elautBaseUrl}/p2mkp/create_p2mkp`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200 || response.status === 201) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data P2MKP berhasil ditambahkan.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3b82f6',
                }).then(() => {
                    const currentPath = window.location.pathname;
                    // Go back to manage page. Assuming format /.../p2mkp/manage/create -> /.../p2mkp/manage
                    const managePath = currentPath.replace(/\/create$/, '');
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

    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col space-y-6 relative overflow-hidden">
                {/* Immersive Background Glows */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                <HeaderPageLayoutAdminElaut
                    title="Tambah Data P2MKP"
                    description="Integrasi entitas P2MKP baru ke dalam ekosistem pelatihan terpadu."
                    icon={<div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/40"><HiUserGroup className="text-2xl text-white" /></div>}
                />

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 mb-2 px-1 relative z-10"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Kembali ke Daftar</span>
                    </Button>
                </motion.div>

                <article className="w-full h-full p-1 overflow-y-auto pb-20 custom-scrollbar">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-5xl mx-auto">
                            {/* Section 1: Data Umum Kelembagaan */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
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
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 p-8 pt-4">
                                        <FormField
                                            control={form.control}
                                            name="nama_Ppmkp"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nama Lembaga</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Building className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                            <Input placeholder="Nama lengkap lembaga secara resmi..." className="h-14 pl-14 bg-white/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 font-medium transition-all shadow-sm" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] uppercase font-bold text-rose-500" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="status_kepemilikan"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Status Kepemilikan</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 bg-white/50 border-slate-200 rounded-2xl px-6 focus:ring-blue-500/20 font-medium transition-all shadow-sm">
                                                                <SelectValue placeholder="Pilih Status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
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
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nomor Induk Berusaha (NIB)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors bg-slate-100 rounded p-1"><Briefcase size={14} /></div>
                                                            <Input placeholder="Masukkan kode NIB..." className="h-14 pl-14 bg-white/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 font-medium transition-all shadow-sm" {...field} />
                                                        </div>
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
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Resmi</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors uppercase font-black text-[10px] tracking-tighter bg-slate-100 rounded px-1.5 py-0.5">MAIL</div>
                                                            <Input placeholder="contoh@lembaga.go.id" className="h-14 pl-16 bg-white/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 font-medium transition-all shadow-sm" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Kata Sandi</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                            <Input type="password" placeholder="Minimal 6 karakter..." className="h-14 pl-14 bg-white/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 font-medium transition-all shadow-sm" {...field} />
                                                        </div>
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
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Kontak Telepon</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors font-bold text-xs tracking-tighter bg-slate-100 rounded px-1.5 py-0.5">+62</div>
                                                            <Input placeholder="8XXXXXXXXXXX" className="h-14 pl-16 bg-white/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 font-medium transition-all shadow-sm" {...field} />
                                                        </div>
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
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Status LPK</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 bg-white/50 border-slate-200 rounded-2xl px-6 focus:ring-blue-500/20 font-medium transition-all shadow-sm">
                                                                <SelectValue placeholder="Pilih..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
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
                            </motion.div>

                            {/* Section: Administration */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <Badge className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Administrasi & Penetapan</CardTitle>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Status Registrasi & Klasifikasi</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8 pt-4">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Status Akun</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus:ring-blue-500 font-medium italic">
                                                                <SelectValue placeholder="Pilih Status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                                                            <SelectItem value="Aktif">AKTIF</SelectItem>
                                                            <SelectItem value="Tidak Aktif">TIDAK AKTIF</SelectItem>
                                                            <SelectItem value="Calon">CALON</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="klasiikasi"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Klasifikasi</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus:ring-blue-500 font-medium">
                                                                <SelectValue placeholder="Grade" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                                                            <SelectItem value="Pemula">PEMULA</SelectItem>
                                                            <SelectItem value="Madya">MADYA</SelectItem>
                                                            <SelectItem value="Utama">UTAMA</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tahun_penetapan"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tahun Penetapan</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="YYYY" type="number" className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500 font-medium" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="status_usaha"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Status Usaha</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Aktif/Berjalan" className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500 font-medium italic" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Section 2: Alamat */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Geolokasi & Alamat</CardTitle>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Physical Facility Location</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-8 p-8 pt-4">
                                        <FormField
                                            control={form.control}
                                            name="alamat"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Street Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nama jalan, nomor bangunan, RT/RW..." className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500 font-medium" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {[
                                                { id: 'provinsi', label: 'Provinsi' },
                                                { id: 'kota', label: 'Kota / Kabupaten' },
                                                { id: 'kecamatan', label: 'Kecamatan' },
                                                { id: 'kelurahan', label: 'Kelurahan' },
                                                { id: 'kode_pos', label: 'Postal Code' },
                                            ].map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name={item.id as any}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{item.label}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={`Entry ${item.label}...`} className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500 font-medium" {...field} />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Section 3: Training Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Sektor Pelatihan</CardTitle>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Core Educational Expertise</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 pt-4">
                                        <FormField
                                            control={form.control}
                                            name="jenis_bidang_pelatihan"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Rumpun Pelatihan</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus:ring-blue-500 font-medium">
                                                                <SelectValue placeholder={loadingRumpun ? "Loading cluster..." : "Direct Cluster Select"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl italic">
                                                            {rumpunPelatihan?.map((item: any) => (
                                                                <SelectItem key={item.id_rumpun_pelatihan} value={String(item.id_rumpun_pelatihan)}>
                                                                    {item.name.toUpperCase()}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="jenis_pelatihan"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Sub-Kategori Pelatihan</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Contoh: Budidaya Perikanan Darat" className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500 font-medium" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="status_peltihan"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Execution Status</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Draft/Published/Running" className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500 font-medium italic" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Section 5: Registar */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Penanggung Jawab</CardTitle>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Authorization & Contact Person</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 pt-4">
                                        <FormField
                                            control={form.control}
                                            name="nama_penanggung_jawab"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nama penanggung jawab operasional..." className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500 font-medium" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="no_telp_penanggung_jawab"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Direct Mobile Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="08XXXXXXXXXX" className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl px-6 focus-visible:ring-blue-500 font-medium" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Section: Documents */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/20">
                                                <Save className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Support Documents</CardTitle>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Verification Attachments Pool</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 p-8 pt-4">
                                        {[
                                            { name: "dokumen_identifikasi_pemilik", label: "Identity Verification" },
                                            { name: "dokumen_asesment_mandiri", label: "Self-Assessment Matrix" },
                                            { name: "dokument_surat_pernyataan", label: "Integrity Statement" },
                                            { name: "dokumen_keterangan_usaha", label: "Business Permit (SKU)" },
                                            { name: "dokumen_afiliasi_parpol", label: "Non-Political Affidavit" },
                                            { name: "dokumen_rekomendasi_dinas", label: "Regency Recommendation" },
                                            { name: "dokumen_permohonan_pembentukan", label: "Formation Proposal" },
                                            { name: "dokumen_permohonan_klasifikasi", label: "Classification Request" },
                                        ].map((doc) => (
                                            <FormField
                                                key={doc.name}
                                                control={form.control}
                                                name={doc.name as any}
                                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            {doc.label}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="group relative">
                                                                <Input
                                                                    {...fieldProps}
                                                                    type="file"
                                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                                    className="h-16 bg-white border-2 border-dashed border-slate-200 rounded-2xl px-6 py-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/20 transition-all file:hidden text-[11px] font-bold text-slate-400"
                                                                    onChange={(event) => {
                                                                        onChange(event.target.files);
                                                                    }}
                                                                />
                                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-blue-500 transition-colors">
                                                                    <Save size={18} />
                                                                </div>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-[10px] uppercase font-bold" />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex flex-col sm:flex-row justify-end pt-6 gap-4"
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="h-16 px-10 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                                >
                                    Batalkan Perubahan
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-16 px-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Singkronisasi Data...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Save size={18} />
                                            <span>Daftarkan Entitas P2MKP</span>
                                        </div>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </Form>
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
