'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBox,
    FiUser,
    FiBriefcase,
    FiAward,
    FiLogOut,
    FiMenu,
    FiX,
    FiMapPin,
    FiInfo,
    FiSave,
    FiFileText,
    FiGlobe,
    FiMail,
    FiPhone,
    FiChevronRight,
    FiActivity,
    FiLayout,
    FiCalendar,
    FiDatabase
} from 'react-icons/fi';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFetchDataRumpunPelatihan } from '@/hooks/elaut/master/useFetchDataRumpunPelatihan';
import { elautBaseUrl } from '@/constants/urls';
import { HashLoader } from 'react-spinners';
import Toast from '@/commons/Toast';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const { data: rumpunPelatihan, loading: loadingRumpun } = useFetchDataRumpunPelatihan();

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
                router.push('/p2mkp/login');
                return;
            }

            const response = await axios.put(`${elautBaseUrl}/p2mkp/update_p2mkp?id=1`, values, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                Toast.fire({
                    icon: 'success',
                    title: 'Profil Terupdate',
                    text: 'Seluruh perubahan data profil Anda telah disimpan.'
                });
                router.push('/p2mkp/dashboard');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            Swal.fire({
                title: 'Operation Failed',
                text: error.response?.data?.message || 'Gagal sinkronisasi data profil.',
                icon: 'error',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#3b82f6',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
                <HashLoader color="#3b82f6" size={50} />
                <p className="mt-6 text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Decrypting Profile Core...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex font-jakarta overflow-hidden">
            {/* Ambient Ambient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Shared Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a]/60 backdrop-blur-3xl border-r border-white/5 transition-transform duration-500 ease-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="h-full flex flex-col pt-8">
                    <div className="px-8 pb-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <FiBox className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="font-calsans text-2xl leading-none">P2MKP</h1>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Management</p>
                            </div>
                        </div>
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
                                <FiX size={24} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 px-4 space-y-8">
                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Core Menu</p>
                            <SidebarItem href="/p2mkp/dashboard" icon={<FiActivity />} label="Overview" />
                            <SidebarItem href="/p2mkp/dashboard/penetapan" icon={<FiAward />} label="Penetapan P2MKP" />
                        </div>

                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Reports</p>
                            <SidebarItem href="/p2mkp/laporan-kegiatan" icon={<FiFileText />} label="Create Report" />
                            <SidebarItem href="/p2mkp/laporan-kegiatan/report" icon={<FiDatabase />} label="Report History" />
                        </div>

                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Account</p>
                            <SidebarItem href="/p2mkp/dashboard/complete-profile" icon={<FiUser />} label="Profile Lembaga" active />
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="bg-white/5 rounded-[2rem] border border-white/5 p-6 relative overflow-hidden group">
                            <div className="relative z-10 space-y-3 font-bold text-center">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Profile Completion</p>
                                <div className="text-2xl font-calsans text-blue-400">85%</div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-[85%] h-full bg-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header Top */}
                <header className="h-24 bg-transparent flex items-center justify-between px-8 lg:px-12 shrink-0 z-20">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl lg:hidden text-blue-400 border border-white/5">
                            <FiMenu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                            <Link href="/p2mkp/dashboard" className="text-gray-500 hover:text-white transition-colors">Dashboard</Link>
                            <span className="text-gray-700">/</span>
                            <span className="text-blue-400">Complete Profile</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-4 hover:bg-white/5 p-1.5 rounded-2xl transition-all border border-transparent hover:border-white/10">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-white leading-none">Admin P2MKP</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">Institutional Lead</p>
                                    </div>
                                    <Avatar className="h-10 w-10 border-2 border-white/10 shadow-xl rounded-2xl overflow-hidden">
                                        <AvatarImage src="https://github.com/shadcn.png" className="rounded-2xl" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 bg-[#0f172a]/95 backdrop-blur-3xl border-white/10 text-white p-2 rounded-[2rem] mt-2 shadow-2xl">
                                <DropdownMenuLabel className="px-4 py-4 font-calsans text-lg text-blue-400">Portal Akses</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem onClick={handleLogout} className="p-3 rounded-xl hover:bg-rose-500/10 cursor-pointer text-rose-400 text-xs font-black tracking-widest">
                                    <FiLogOut className="mr-3" size={16} /> LOGOUT SESSION
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12 pt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto space-y-12 pb-24"
                    >
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-calsans">Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Registry</span></h1>
                            <p className="text-gray-500 text-sm max-w-2xl font-light italic leading-relaxed">
                                Mohon lengkapi seluruh data kredensial lembaga dan penanggung jawab untuk proses verifikasi standarisasi P2MKP.
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                                {/* Section 1: Data Umum Kelembagaan */}
                                <FormCard
                                    icon={<FiBriefcase />}
                                    title="Informasi Kelembagaan"
                                    subtitle="Identitas inti dan legalitas lembaga P2MKP"
                                    color="blue"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormFieldItem label="Nama P2MKP" name="nama_Ppmkp" control={form.control} placeholder="Masukkan Nama Resmi..." icon={<FiBriefcase />} />
                                        <FormField
                                            control={form.control}
                                            name="status_kepemilikan"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Status Kepemilikan</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                                <SelectValue placeholder="Pilih Status..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                                                            {['Perserorangan', 'Kelompok', 'Instansi Pemerintah', 'Swasta'].map(val => (
                                                                <SelectItem key={val} value={val} className="hover:bg-blue-600/20 rounded-lg py-3 cursor-pointer">{val}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormFieldItem label="NIB (Nomor Induk Berusaha)" name="nib" control={form.control} placeholder="Enter NIB Code..." icon={<FiFileText />} />
                                        <FormFieldItem label="Email Official" name="email" control={form.control} placeholder="admin@p2mkp.go.id" icon={<FiMail />} type="email" />
                                        <FormFieldItem label="Update Password" name="password" control={form.control} placeholder="Leave blank to keep current..." icon={<FiGlobe />} type="password" />
                                        <FormFieldItem label="Kontak Telepon" name="no_telp" control={form.control} placeholder="08XXXXXXXXXX" icon={<FiPhone />} />
                                        <FormField
                                            control={form.control}
                                            name="is_lpk"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Apakah Lembaga LPK?</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                                <SelectValue placeholder="Konfirmasi LPK..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                                                            <SelectItem value="Ya" className="hover:bg-blue-600/20 rounded-lg py-3 cursor-pointer">Ya, Terdaftar LPK</SelectItem>
                                                            <SelectItem value="Tidak" className="hover:bg-blue-600/20 rounded-lg py-3 cursor-pointer">Tidak</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </FormCard>

                                {/* Section 2: Alamat */}
                                <FormCard
                                    icon={<FiMapPin />}
                                    title="Lokasi Operasional"
                                    subtitle="Koordinat dan alamat fisik kantor pusat"
                                    color="indigo"
                                >
                                    <div className="space-y-8">
                                        <FormFieldItem label="Alamat Spesifik" name="alamat" control={form.control} placeholder="Jalan, No, RT/RW..." icon={<FiMapPin />} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <FormFieldItem label="Provinsi" name="provinsi" control={form.control} placeholder="Nama Provinsi..." />
                                            <FormFieldItem label="Kota/Kabupaten" name="kota" control={form.control} placeholder="Nama Kota..." />
                                            <FormFieldItem label="Kecamatan" name="kecamatan" control={form.control} placeholder="Kecamatan..." />
                                            <FormFieldItem label="Kelurahan" name="kelurahan" control={form.control} placeholder="Kelurahan..." />
                                            <FormFieldItem label="Kode Pos" name="kode_pos" control={form.control} placeholder="5 Digit..." maxlength={5} />
                                        </div>
                                    </div>
                                </FormCard>

                                {/* Section 3: Bidang Pelatihan */}
                                <FormCard
                                    icon={<FiActivity />}
                                    title="Spesialisasi Pelatihan"
                                    subtitle="Cakupan rumpun dan jenis kompetensi"
                                    color="cyan"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control}
                                            name="jenis_bidang_pelatihan"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Rumpun Utama</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                                <SelectValue placeholder={loadingRumpun ? "Syncing..." : "Pilih Rumpun..."} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                                                            {rumpunPelatihan?.map((item: any) => (
                                                                <SelectItem key={item.id_rumpun_pelatihan} value={String(item.id_rumpun_pelatihan)} className="hover:bg-cyan-600/20 rounded-lg py-3 cursor-pointer">
                                                                    {item.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormFieldItem label="Spesifikasi Pelatihan" name="jenis_pelatihan" control={form.control} placeholder="Contoh: Budidaya Ikan Nila..." icon={<FiAward />} />
                                    </div>
                                </FormCard>

                                {/* Section 4: Document Links */}
                                <FormCard
                                    icon={<FiFileText />}
                                    title="Kumpulan Dokumentasi"
                                    subtitle="Link verifikasi berkas pendukung"
                                    color="emerald"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { name: "dokumen_identifikasi_pemilik", label: "ID Pemilik" },
                                            { name: "dokumen_asesment_mandiri", label: "Self Asesmen" },
                                            { name: "dokument_surat_pernyataan", label: "Surat Pernyataan" },
                                            { name: "dokumen_keterangan_usaha", label: "Izin Usaha" },
                                            { name: "dokumen_afiliasi_parpol", label: "Non-Parpol Statement" },
                                            { name: "dokumen_rekomendasi_dinas", label: "Rekomendasi Dinas" },
                                            { name: "dokumen_permohonan_pembentukan", label: "Surat Permohonan" },
                                            { name: "dokumen_permohonan_klasifikasi", label: "Kuesioner Klasifikasi" },
                                        ].map((doc) => (
                                            <FormFieldItem key={doc.name} label={doc.label} name={doc.name} control={form.control} placeholder="Cloud Drive Link..." icon={<FiGlobe />} />
                                        ))}
                                    </div>
                                </FormCard>

                                {/* Section 5: Penanggung Jawab */}
                                <FormCard
                                    icon={<FiUser />}
                                    title="Penanggung Jawab"
                                    subtitle="Personal data penanggung jawab lembaga"
                                    color="purple"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormFieldItem label="Nama Lengkap & Gelar" name="nama_penanggung_jawab" control={form.control} placeholder="Full legal name..." icon={<FiUser />} />
                                        <FormFieldItem label="Kontak PIC" name="no_telp_penanggung_jawab" control={form.control} placeholder="WhatsApp/Phone..." icon={<FiPhone />} />
                                        <FormFieldItem label="Tempat, Tanggal Lahir" name="tempat_tanggal_lahir" control={form.control} placeholder="City, DD-MM-YYYY" icon={<FiCalendar />} />
                                        <FormField
                                            control={form.control}
                                            name="jenis_kelamin"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Gender</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                                <SelectValue placeholder="Pilih..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                                                            <SelectItem value="Laki-laki" className="hover:bg-purple-600/20 rounded-lg py-3 cursor-pointer">Laki-laki</SelectItem>
                                                            <SelectItem value="Perempuan" className="hover:bg-purple-600/20 rounded-lg py-3 cursor-pointer">Perempuan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="pendidikan_terakhir"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Pendidikan Terakhir</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                                <SelectValue placeholder="Kualifikasi..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                                                            {['SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3', 'Lainnya'].map(val => (
                                                                <SelectItem key={val} value={val} className="hover:bg-purple-600/20 rounded-lg py-3 cursor-pointer">{val}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </FormCard>

                                <div className="pt-10 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="group/save relative w-full md:w-auto min-w-[300px] h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-[2rem] font-black tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 overflow-hidden"
                                    >
                                        {isSubmitting ? (
                                            <HashLoader color="#fff" size={24} />
                                        ) : (
                                            <>
                                                <FiSave size={20} className="group-hover:translate-y-[-2px] transition-transform" />
                                                SUBMIT UPDATED PROFILE
                                            </>
                                        )}
                                        <div className="absolute inset-0 w-12 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover/save:translate-x-[600%] transition-transform duration-1000" />
                                    </button>
                                </div>
                            </form>
                        </Form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Visual Sidebar Item
function SidebarItem({ href, icon, label, active }: any) {
    return (
        <Link href={href} className="block px-4">
            <motion.div
                whileHover={{ x: 5 }}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative group ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'}`}
            >
                <span className={`text-xl transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-gray-600 group-hover:text-blue-400'}`}>
                    {icon}
                </span>
                <span className={`text-xs font-bold tracking-wide ${active ? 'font-black' : ''}`}>{label}</span>
                {active && (
                    <motion.div layoutId="navBar" className="absolute left-0 w-1 h-6 bg-white rounded-full ml-1" />
                )}
            </motion.div>
        </Link>
    );
}

// Premium Form Card Container
function FormCard({ icon, title, subtitle, children, color }: any) {
    const colors: any = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group p-8 md:p-12 rounded-[3.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 shadow-2xl space-y-12 relative overflow-hidden transition-all duration-700 hover:border-white/10"
        >
            <div className={`absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <div className="text-9xl">{icon}</div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl border ${colors[color]}`}>
                        {icon}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-calsans tracking-tight text-white">{title}</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

// Reusable Form Field Item
function FormFieldItem({ label, name, control, placeholder, icon, type = "text", ...props }: any) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">{label}</FormLabel>
                    <FormControl>
                        <div className="relative group/input">
                            {icon && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-colors">{icon}</span>}
                            <Input
                                placeholder={placeholder}
                                type={type}
                                {...field}
                                {...props}
                                className={`w-full ${icon ? 'pl-12' : 'pl-5'} pr-5 py-6 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600 h-14`}
                            />
                        </div>
                    </FormControl>
                    <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                </FormItem>
            )}
        />
    );
}
