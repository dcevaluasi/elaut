'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
    FiBox,
    FiActivity,
    FiAward,
    FiUser,
    FiLogOut,
    FiMenu,
    FiX,
    FiFileText,
    FiUploadCloud,
    FiArrowLeft,
    FiShield,
    FiSave,
    FiChevronRight,
    FiLayout,
    FiCalendar,
    FiDatabase,
    FiEye,
    FiCheckCircle
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { elautBaseUrl } from '@/constants/urls';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    useFormField,
} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
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
import { HashLoader } from 'react-spinners';
import Toast from '@/commons/Toast';

const formSchema = z.object({
    DokumenIdentifikasiPemilik: z.string().min(1, "Wajib diunggah"),
    DokumenAsesmentMandiri: z.string().min(1, "Wajib diunggah"),
    DokumentSuratPernyataan: z.string().min(1, "Wajib diunggah"),
    DokumenKeteranganUsaha: z.string().min(1, "Wajib diunggah"),
    DokumenAfiliasiParpol: z.string().min(1, "Wajib diunggah"),
    DokumenRekomendasiDinas: z.string().min(1, "Wajib diunggah"),
    DokumenPermohonanPembentukan: z.string().min(1, "Wajib diunggah"),
});

export default function PengajuanPenetapanPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            DokumenIdentifikasiPemilik: '',
            DokumenAsesmentMandiri: '',
            DokumentSuratPernyataan: '',
            DokumenKeteranganUsaha: '',
            DokumenAfiliasiParpol: '',
            DokumenRekomendasiDinas: '',
            DokumenPermohonanPembentukan: '',
        },
    });

    const [p2mkpData, setP2mkpData] = useState<any>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = Cookies.get('XSRF091');
                if (!token) {
                    router.push('/p2mkp/login');
                    return;
                }

                const response = await axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_jwt`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    const data = response.data.data || response.data;
                    setP2mkpData(data);

                    form.reset({
                        DokumenIdentifikasiPemilik: data.dokumen_identifikasi_pemilik || "",
                        DokumenAsesmentMandiri: data.dokumen_asesment_mandiri || "",
                        DokumentSuratPernyataan: data.dokument_surat_pernyataan || "",
                        DokumenKeteranganUsaha: data.dokumen_keterangan_usaha || "",
                        DokumenAfiliasiParpol: data.dokumen_afiliasi_parpol || "",
                        DokumenRekomendasiDinas: data.dokumen_rekomendasi_dinas || "",
                        DokumenPermohonanPembentukan: data.dokumen_permohonan_pembentukan || "",
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [router, form]);

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

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



    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const token = Cookies.get('XSRF091');
            if (!token) {
                router.push('/p2mkp/login');
                return;
            }

            const payload = {
                id_p2mkp: p2mkpData?.IdPpmkp || p2mkpData?.id_p2mkp || p2mkpData?.id,
                tahun_penetapan: new Date().getFullYear().toString(),
                status_usaha: p2mkpData?.status_usaha || "Aktif",
                status_peltihan: p2mkpData?.status_peltihan || "Berjalan",
                is_lpk: p2mkpData?.is_lpk || "Ya",
                status: "Diajukan"
            };

            const response = await axios.post(`${elautBaseUrl}/p2mkp/create_pengjuan_penetapan_p2mkp`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200 || response.status === 201) {
                Toast.fire({
                    icon: 'success',
                    title: 'Berhasil Diajukan',
                    text: 'Pengajuan penetapan P2MKP Anda telah berhasil dikirim.'
                });
                router.push('/p2mkp/dashboard/penetapan');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            Swal.fire({
                title: 'Operation Failed',
                text: error.response?.data?.message || 'Gagal melakukan pengajuan penetapan.',
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
                <p className="mt-6 text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Loading Secure Form...</p>
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
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Portal</p>
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
                            <SidebarItem href="/p2mkp/dashboard/penetapan" icon={<FiAward />} label="Penetapan P2MKP" active />
                        </div>

                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Reports</p>
                            <SidebarItem href="/p2mkp/laporan-kegiatan" icon={<FiFileText />} label="Create Report" />
                            <SidebarItem href="/p2mkp/laporan-kegiatan/report" icon={<FiDatabase />} label="Report History" />
                        </div>

                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Account</p>
                            <SidebarItem href="/p2mkp/dashboard/complete-profile" icon={<FiUser />} label="Profile Lembaga" />
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
                            <Link href="/p2mkp/dashboard/penetapan" className="text-gray-500 hover:text-white transition-colors">Penetapan</Link>
                            <span className="text-gray-700">/</span>
                            <span className="text-blue-400">Submission Form</span>
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
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto space-y-12 pb-24"
                    >
                        <div className="flex items-center gap-6">
                            <Link href="/p2mkp/dashboard/penetapan">
                                <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-blue-400 transition-all active:scale-95 group">
                                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <div className="space-y-1">
                                <h1 className="text-4xl md:text-5xl font-calsans">Penetapan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Submission</span></h1>
                                <p className="text-gray-500 text-sm font-light italic leading-relaxed">Form pengajuan standarisasi dan verifikasi instrumen P2MKP Terpadu.</p>
                            </div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                                {/* Form Container */}
                                <div className="p-8 md:p-12 rounded-[3.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 shadow-2xl space-y-12 relative overflow-hidden transition-all duration-700 hover:border-white/10">

                                    <div className="space-y-10">
                                        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                                <FiActivity />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-calsans">Core Instruments</h3>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Operational Metadata</p>
                                            </div>
                                        </div>



                                        <div className="space-y-8">

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <FileUploadField name="DokumenIdentifikasiPemilik" label="Identifikasi Pemilik" />
                                                <FileUploadField name="DokumenAsesmentMandiri" label="Asesmen Mandiri" />
                                                <FileUploadField name="DokumentSuratPernyataan" label="Surat Pernyataan Mutu" />
                                                <FileUploadField name="DokumenKeteranganUsaha" label="Legalitas Usaha" />
                                                <FileUploadField name="DokumenAfiliasiParpol" label="Afiliasi Politik" />
                                                <FileUploadField name="DokumenRekomendasiDinas" label="Rekomendasi Satuan Kerja" />
                                                <FileUploadField name="DokumenPermohonanPembentukan" label="Permohonan Pembentukan" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5">
                                        <div className="flex items-start gap-4 max-w-md">
                                            <FiShield className="text-emerald-500 mt-1 shrink-0" size={20} />
                                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
                                                Sistem verifikasi otomatis akan memeriksa integritas digital setiap aset dokumen yang diunggah. Pastikan file dalam format PDF/JPG yang jernih.
                                            </p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="group/btn relative w-full md:w-auto min-w-[300px] h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:opacity-90 text-white rounded-[2rem] font-black tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 overflow-hidden"
                                        >
                                            {isSubmitting ? (
                                                <HashLoader color="#fff" size={24} />
                                            ) : (
                                                <>
                                                    <FiSave size={20} className="group-hover:translate-x-1 transition-transform" />
                                                    AJUKAN PENETAPAN
                                                </>
                                            )}
                                            <div className="absolute inset-0 w-12 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[600%] transition-transform duration-1000" />
                                        </button>
                                    </div>
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

// Premium File Upload Field
function FileUploadField({ name, label }: any) {
    const { watch, control } = useFormContext();
    const value = watch(name);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field: { value: fieldValue, onChange, ...fieldProps } }) => (
                <FormItem className="space-y-4">
                    <FormLabel className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{label}</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-3">
                            <div
                                className={`relative group/upload h-24 rounded-2xl border flex-1 transition-all flex items-center px-6 gap-4 overflow-hidden ${fieldValue ? 'border-blue-500/40 bg-blue-500/5' : 'border-dashed border-white/10 bg-white/5'} hover:border-blue-400/50 hover:bg-blue-400/5`}
                            >
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            onChange(file.name);
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    id={`file-upload-${name}`}
                                    {...fieldProps}
                                />

                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${fieldValue ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-600 group-hover/upload:text-blue-400'}`}>
                                    <FiUploadCloud size={24} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {fieldValue ? (
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-white truncate text-blue-400">
                                                {typeof fieldValue === 'string' && fieldValue.includes('/') ? fieldValue.split('/').pop() : fieldValue}
                                            </p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">SUCCESSFULLY ATTACHED</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 group-hover/upload:text-gray-400 transition-colors">Choose digital asset...</p>
                                            <p className="text-[9px] text-gray-700 font-black tracking-widest uppercase">Max 10MB • PDF, JPG, PNG</p>
                                        </div>
                                    )}
                                </div>

                                {fieldValue && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[8px] font-black uppercase">
                                        <FiCheckCircle /> VERIFIED
                                    </div>
                                )}
                            </div>

                            {typeof fieldValue === 'string' && fieldValue && (
                                <a
                                    href={fieldValue.startsWith('http') ? fieldValue : `${elautBaseUrl}/storage/${fieldValue}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-24 w-16 shrink-0 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-500/10 group active:scale-95"
                                    title="View Document"
                                >
                                    <FiEye size={24} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                </FormItem>
            )}
        />
    );
}


