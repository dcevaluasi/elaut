'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
    Loader2,
    Save,
    LayoutDashboard,
    Award,
    X,
    Menu,
    LogOut,
    User,
    Building,
    MapPin,
    Briefcase
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFetchDataRumpunPelatihan } from '@/hooks/elaut/master/useFetchDataRumpunPelatihan';
import { elautBaseUrl } from '@/constants/urls';

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
    dokumen_identifikasi_pemilik: z.string().optional(),
    dokumen_asesment_mandiri: z.string().optional(),
    dokument_surat_pernyataan: z.string().optional(),
    dokumen_keterangan_usaha: z.string().optional(),
    dokumen_afiliasi_parpol: z.string().optional(),
    dokumen_rekomendasi_dinas: z.string().optional(),
    dokumen_permohonan_pembentukan: z.string().optional(),
    dokumen_permohonan_klasifikasi: z.string().optional(),
    skor_klasifikasi: z.union([z.string(), z.number()]).optional(),
    status_usaha: z.string().optional(),
    status_peltihan: z.string().optional(),
    bidang_pelatihan: z.string().optional(),
    is_lpk: z.string().optional(),
    status: z.string().optional(),
    create_at: z.string().optional(),
    update_at: z.string().optional(),
});

export default function CompleteProfilePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Fetch Rumpun Pelatihan
    const { data: rumpunPelatihan, loading: loadingRumpun } = useFetchDataRumpunPelatihan();

    // Initial Resize Check
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsMobile(true);
                setIsSidebarOpen(false);
            } else {
                setIsMobile(false);
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        Cookies.remove('XSRF091');
        Cookies.remove('Access');
        router.push('/p2mkp/login');
    };

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
            email: "dggama@gmail.com",
            password: "",
            jenis_bidang_pelatihan: "4",
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
            skor_klasifikasi: 0,
            status_usaha: "",
            status_peltihan: "",
            bidang_pelatihan: "",
            is_lpk: "",
            status: "",
            create_at: "",
            update_at: ""
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
                router.push('/p2mkp/login');
                return;
            }

            const response = await axios.put(`${elautBaseUrl}/p2mkp/update_p2mkp?id=1`, values, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                Swal.fire({
                    title: 'Profil Tersimpan!',
                    text: 'Data profil P2MKP Anda berhasil diperbarui.',
                    icon: 'success',
                    confirmButtonText: 'Ke Dashboard',
                    confirmButtonColor: '#3b82f6',
                }).then(() => {
                    router.push('/p2mkp/dashboard');
                });
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            Swal.fire({
                title: 'Gagal Menyimpan',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.',
                icon: 'error',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#d33',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Header Sidebar */}
                    <div className="h-20 flex items-center px-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="font-bold text-xl">P</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg leading-none">P2MKP</h1>
                                <p className="text-xs text-slate-400">Dashboard Area</p>
                            </div>
                        </div>
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-white/70 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        <NavItem href="/p2mkp/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
                        <NavItem href="/p2mkp/dashboard/penetapan" icon={<Award />} label="Penetapan P2MKP" />
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden h-screen">
                {/* Header Top */}
                <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-6 lg:px-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-neutral-100 rounded-lg lg:hidden">
                            <Menu className="w-6 h-6 text-neutral-600" />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-neutral-400 text-sm">
                            <Link href="/p2mkp/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                            <span>/</span>
                            <span className="text-neutral-900 font-medium">Lengkapi Profil</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">

                        <div className="h-8 w-px bg-neutral-200 mx-1"></div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 hover:bg-neutral-50 p-1.5 rounded-full pl-3 transition-colors border border-transparent hover:border-neutral-200">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-semibold text-neutral-900 leading-none">Admin P2MKP</p>
                                        <p className="text-xs text-neutral-500 mt-1">Pengelola</p>
                                    </div>
                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">Profil</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">Pengaturan</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-neutral-900">Lengkapi Profil P2MKP</h1>
                            <p className="text-neutral-500">Lengkapi data profil kelembagaan dan penanggung jawab.</p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                                    <FormLabel>Nomor Induk Berusaha (NIB)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nomor NIB" {...field} />
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
                                                    <FormLabel>Email P2MKP</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="alamat@email.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password (Opsional)</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Isi jika ingin mengubah password" {...field} />
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
                                                    <FormLabel>Nomor Telepon P2MKP</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="08..." {...field} />
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
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                            <FormField
                                                control={form.control}
                                                name="provinsi"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Provinsi</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Nama Provinsi" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="kota"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Kota/Kabupaten</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Nama Kota/Kabupaten" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="kecamatan"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Kecamatan</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Nama Kecamatan" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="kelurahan"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Kelurahan/Desa</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Nama Kelurahan/Desa" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="kode_pos"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Kode Pos</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="5 Digit Kode Pos" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
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
                                            <CardTitle className="text-lg">Pelatihan & Klasifikasi</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
                                        <FormField
                                            control={form.control}
                                            name="jenis_bidang_pelatihan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Jenis Bidang Pelatihan</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    </CardContent>
                                </Card>

                                {/* Section 4: Document Links (Text Inputs for now) */}
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
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{doc.label}</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Link/Path Dokumen..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
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
                                                    <FormLabel>No. Telepon/WA</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="08..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tempat_tanggal_lahir"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tempat, Tanggal Lahir</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Kota, DD-MM-YYYY" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="jenis_kelamin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Jenis Kelamin</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih Jenis Kelamin" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="pendidikan_terakhir"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pendidikan Terakhir</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih Pendidikan" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="SD">SD/Sederajat</SelectItem>
                                                            <SelectItem value="SMP">SMP/Sederajat</SelectItem>
                                                            <SelectItem value="SMA">SMA/SMK/Sederajat</SelectItem>
                                                            <SelectItem value="D3">D3</SelectItem>
                                                            <SelectItem value="S1">S1/D4</SelectItem>
                                                            <SelectItem value="S2">S2</SelectItem>
                                                            <SelectItem value="S3">S3</SelectItem>
                                                            <SelectItem value="Lainnya">Lainnya</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 min-w-[200px] h-12 text-lg">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-5 w-5" />
                                                Simpan Profil
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

// Components
function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                {React.cloneElement(icon as React.ReactElement, { size: 20 })}
                <span className="font-medium text-sm">{label}</span>
            </div>
        </Link>
    );
}
