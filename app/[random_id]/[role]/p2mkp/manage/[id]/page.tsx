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
    Badge
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
    password: z.string().optional(), // Optional for admin edit, only if changing
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

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Fetch Rumpun Pelatihan
    const { data: rumpunPelatihan, loading: loadingRumpun } = useFetchDataRumpunPelatihan();
    // Fetch Existing Data
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
                nama_Ppmkp: p2mkpData.nama_Ppmkp || "",
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
                klasiikasi: p2mkpData.klasiikasi || "",
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

            // Remove password if empty string to avoid overwriting with empty
            const submitValues = { ...values };
            if (!submitValues.password) {
                delete submitValues.password;
            }

            const formData = new FormData();

            // Append all fields to FormData
            Object.keys(submitValues).forEach(key => {
                const value = submitValues[key as keyof typeof submitValues];
                if (value === undefined || value === null || value === "") return;

                // Handle file inputs
                if (key.startsWith('dokumen_') || key.startsWith('dokument_')) {
                    if (value instanceof FileList && value.length > 0) {
                        // If it's a NEW file, append it
                        formData.append(key, value[0]);
                    }
                    // If it's a string (existing URL), we generally DO NOT append it to formData in a multipart update 
                    // UNLESS the backend specifically handles it. 
                    // Common pattern: if not sent, keep existing.
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
                    // Go back to manage page. Assuming format /.../p2mkp/edit/[id] -> /.../p2mkp/manage
                    // A safer way is using router.back() or explicit path if 'role' and 'random_id' are known easily.
                    // Given the dynamic route, router.back() is safest mostly, or replacing 'edit/...' with 'manage'
                    const managePath = currentPath.replace(/\/edit\/.*$/, '/manage');
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

    if (loadingData) {
        return (
            <LayoutAdminElaut>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-500">Memuat data...</span>
                </div>
            </LayoutAdminElaut>
        )
    }

    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col space-y-4">
                <HeaderPageLayoutAdminElaut title="Edit Data P2MKP" description="Perbarui informasi data P2MKP" icon={<HiUserGroup className="text-3xl" />} />

                <div className="flex items-center gap-2 mb-4 px-1">
                    <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </Button>
                </div>

                <article className="w-full h-full p-1 overflow-y-auto pb-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-6xl mx-auto">
                            {/* Section 1: Data Umum Kelembagaan */}
                            <Card className="border-neutral-200 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <CardTitle className="text-lg">Informasi Kelembagaan</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
                                    <FormField
                                        control={form.control}
                                        name="nama_Ppmkp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama P2MKP</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nama lengkap P2MKP" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="status_kepemilikan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status Kepemilikan</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
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
                                            <FormItem>
                                                <FormLabel>NIB</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nomor Induk Berusaha" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Email P2MKP" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="no_telp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>No. Telepon</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nomor Telepon" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="is_lpk"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Apakah LPK?</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Ya">Ya</SelectItem>
                                                        <SelectItem value="Tidak">Tidak</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </CardContent>
                            </Card>

                            {/* Section 1: Data Umum Kelembagaan */}
                            <Card className="border-neutral-200 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-teal-600 rounded-lg">
                                            <Badge className="w-5 h-5" />
                                        </div>
                                        <CardTitle className="text-lg">Penetapan dan Klasifikasi</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status P2MKP</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Aktif">Aktif</SelectItem>
                                                        <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                                                        <SelectItem value="Calon">Calon</SelectItem>
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
                                            <FormItem>
                                                <FormLabel>Klasifikasi</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Klasifikasi" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Pemula">Pemula</SelectItem>
                                                        <SelectItem value="Madya">Madya</SelectItem>
                                                        <SelectItem value="Utama">Utama</SelectItem>
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
                                            <FormItem>
                                                <FormLabel>Tahun Penetapan</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Tahun Penetapan" type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Section 2: Alamat */}
                            <Card className="border-neutral-200 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <CardTitle className="text-lg">Alamat Lengkap</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-0">
                                    <FormField
                                        control={form.control}
                                        name="alamat"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Alamat (Jalan, RT/RW)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nama jalan, nomor, RT/RW" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {['provinsi', 'kota', 'kecamatan', 'kelurahan', 'kode_pos'].map((item) => (
                                            <FormField
                                                key={item}
                                                control={form.control}
                                                name={item as any}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="capitalize">{item.replace('_', ' ')}</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={`Masukkan ${item}`} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section 3: Bidang Pelatihan & Klasifikasi */}
                            <Card className="border-neutral-200 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <CardTitle className="text-lg">Pelatihan</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
                                    <FormField
                                        control={form.control}
                                        name="jenis_bidang_pelatihan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Jenis Bidang Pelatihan</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={loadingRumpun ? "Memuat..." : "Pilih Rumpun Pelatihan"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {rumpunPelatihan?.map((item: any) => (
                                                            <SelectItem key={item.id_rumpun_pelatihan} value={String(item.id_rumpun_pelatihan)}>
                                                                {item.name}
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
                                            <FormItem>
                                                <FormLabel>Jenis Pelatihan</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Contoh: Budidaya Lele" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status_peltihan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status Pelatihan</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Status Pelatihan" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </CardContent>
                            </Card>

                            {/* Section 5: Penanggung Jawab */}
                            <Card className="border-neutral-200 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <CardTitle className="text-lg">Data Penanggung Jawab</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
                                    <FormField
                                        control={form.control}
                                        name="nama_penanggung_jawab"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Lengkap</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nama Penanggung Jawab" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="no_telp_penanggung_jawab"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>No. HP Penanggung Jawab</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="08..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Section 4: Document Links */}
                            <Card className="border-neutral-200 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                                            <Save className="w-5 h-5" />
                                        </div>
                                        <CardTitle className="text-lg">Dokumen Pendukung</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
                                    {[
                                        { name: "dokumen_identifikasi_pemilik", label: "Dok. Identifikasi Pemilik" },
                                        { name: "dokumen_asesment_mandiri", label: "Dok. Asesmen Mandiri" },
                                        { name: "dokument_surat_pernyataan", label: "Dok. Surat Pernyataan" },
                                        { name: "dokumen_keterangan_usaha", label: "Dok. Keterangan Usaha" },
                                        { name: "dokumen_afiliasi_parpol", label: "Dok. Afiliasi Parpol" },
                                        { name: "dokumen_rekomendasi_dinas", label: "Dok. Rekomendasi Dinas" },
                                        { name: "dokumen_permohonan_pembentukan", label: "Dok. Permohonan Pembentukan" },
                                        { name: "dokumen_permohonan_klasifikasi", label: "Dok. Permohonan Klasifikasi" },
                                    ].map((doc) => (

                                        <FormField
                                            key={doc.name}
                                            control={form.control}
                                            name={doc.name as any}
                                            render={({ field: { value, onChange, ...fieldProps } }) => (
                                                <FormItem>
                                                    <FormLabel>{doc.label}</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-2">
                                                            {typeof value === 'string' && value.length > 0 && (
                                                                <div className="text-sm text-blue-600 flex items-center gap-2">
                                                                    <a href={value} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-[200px]">
                                                                        Lihat Dokumen Saat Ini
                                                                    </a>
                                                                </div>
                                                            )}
                                                            <Input
                                                                {...fieldProps}
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(event) => {
                                                                    onChange(event.target.files);
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="flex justify-end pt-4 gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update P2MKP
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </article>
            </section>
        </LayoutAdminElaut>
    );
}

