'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUser,
    FiMail,
    FiLock,
    FiPhone,
    FiBriefcase,
    FiAward,
    FiArrowLeft,
    FiSave,
    FiShield,
    FiChevronRight,
    FiGlobe,
    FiCheckCircle,
    FiInfo
} from 'react-icons/fi';
import Link from 'next/link';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFetchDataRumpunPelatihan } from '@/hooks/elaut/master/useFetchDataRumpunPelatihan';
import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';

import axios from 'axios';
import { elautBaseUrl } from '@/constants/urls';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { HashLoader } from 'react-spinners';
import Toast from '@/commons/Toast';
import Image from 'next/image';

const formSchema = z.object({
    nama_Ppmkp: z.string().min(1, 'Nama Lembaga atau Usaha wajib diisi'),
    email: z.string().email('Format email tidak valid'),
    password: z.string()
        .min(8, 'Kata sandi minimal 8 karakter')
        .regex(/[0-9]/, 'Kata sandi harus mengandung minimal satu angka')
        .regex(/[^A-Za-z0-9]/, 'Kata sandi harus mengandung minimal satu karakter spesial')
        .regex(/[a-z]/, 'Kata sandi harus mengandung minimal satu huruf kecil')
        .regex(/[A-Z]/, 'Kata sandi harus mengandung minimal satu huruf besar'),
    confirm_password: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
    no_telp: z.string()
        .min(10, 'Nomor telepon minimal 10 digit')
        .regex(/^08/, 'Nomor telepon harus diawali dengan 08'),
    status_kepemilikan: z.enum(
        [
            'Koperasi',
            'BUMN',
            'Persero',
            'Perusahaan Umum',
            'Badan Usaha Milik Swasta',
            'Perserorangan',
        ],
        {
            message: 'Status kepemilikan wajib dipilih',
        }
    ),
    jenis_bidang_pelatihan: z.string().min(1, 'Jenis bidang pelatihan wajib dipilih'),
}).refine((data) => data.password === data.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
});

export default function RegistrasiP2MKPPage() {
    const { data: rumpunPelatihan, loading: loadingRumpun } = useFetchDataRumpunPelatihan();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Alert State
    const [alertConfig, setAlertConfig] = React.useState<{
        isOpen: boolean;
        title: string;
        description: string;
        type: 'success' | 'error' | 'warning';
    }>({
        isOpen: false,
        title: '',
        description: '',
        type: 'warning',
    });

    const showAlert = (title: string, description: string, type: 'success' | 'error' | 'warning') => {
        setAlertConfig({ isOpen: true, title, description, type });
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: async (data) => {
            try {
                const result = formSchema.safeParse(data);
                if (result.success) {
                    return { values: result.data, errors: {} };
                }

                // Manually map Zod errors to avoid version mismatch issue with zodResolver
                const errors: any = {};
                result.error.issues.forEach((issue) => {
                    const path = issue.path.join('.');
                    if (!errors[path]) {
                        errors[path] = {
                            type: issue.code,
                            message: issue.message,
                        };
                    }
                });

                return { values: {}, errors };
            } catch (err) {
                console.error("Validation error:", err);
                return { values: {}, errors: { root: { message: "Gagal melakukan validasi" } } };
            }
        },
        defaultValues: {
            nama_Ppmkp: '',
            email: '',
            password: '',
            confirm_password: '',
            no_telp: '',
            status_kepemilikan: undefined,
            jenis_bidang_pelatihan: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${elautBaseUrl}/p2mkp/create_p2mkp`, {
                nama_Ppmkp: values.nama_Ppmkp,
                email: values.email,
                password: values.password,
                no_telp: values.no_telp,
                status_kepemilikan: values.status_kepemilikan,
                jenis_bidang_pelatihan: values.jenis_bidang_pelatihan
            });

            if (response.status === 200 || response.status === 201) {
                Toast.fire({
                    icon: 'success',
                    title: 'Registrasi Berhasil',
                    text: 'Akun P2MKP Anda telah didaftarkan. Silakan login.'
                });
                router.push('/p2mkp/login');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            showAlert(
                'Registrasi Gagal',
                error.response?.data?.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const onInvalid = (errors: any) => {
        const values = form.getValues();
        const isEmpty = !values.nama_Ppmkp && !values.email && !values.no_telp && !values.password && !values.confirm_password && !values.status_kepemilikan && !values.jenis_bidang_pelatihan;

        if (isEmpty) {
            showAlert(
                'Data Masih Kosong',
                'Silakan isi formulir registrasi terlebih dahulu.',
                'warning'
            );
        } else {
            // Get the first error message to show in the alert
            const errorKeys = Object.keys(errors);
            if (errorKeys.length > 0) {
                const firstKey = errorKeys[0];
                const firstError = errors[firstKey];
                showAlert(
                    'Data Belum Sesuai',
                    firstError?.message || 'Mohon periksa kembali inputan Anda.',
                    'error'
                );
            }
        }
    };

    return (
        <section className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-jakarta overflow-x-hidden">
            {/* Immersive Background System */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/15 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px]" />
                <div className="absolute top-[30%] right-[0%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[110px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-150 brightness-100" />
            </div>

            <Header />

            <main className="relative z-10 pt-30 pb-12 px-4 md:px-8 max-w-3xl mx-auto min-h-screen flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full"
                >
                    {/* Header Section */}
                    <div className="text-center mb-6 space-y-3">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-widest"
                        >
                            <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                            Daftarkan Lembaga atau Usaha Anda
                        </motion.div>
                        <h1 className="text-2xl md:text-4xl font-calsans leading-none tracking-tight">
                            MARI BERGABUNG
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-400 to-cyan-400"> MENJADI P2MKP.</span>
                        </h1>
                        <p className="text-gray-400 text-[10px] md:text-xs max-w-lg mx-auto leading-relaxed">
                            Mulai langkah Anda untuk menjadi bagian dari pusat pelatihan mandiri kelautan dan perikanan dalam membangun usaha dan peningkatan SDM di Sektor Kelautan dan Perikanan.
                        </p>
                    </div>

                    {/* Form Container */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000" />

                        <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="nama_Ppmkp"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                        <FiBriefcase className="text-blue-500" /> Nama Lembaga/Usaha
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Contoh: Sinar Mandiri"
                                                            className="h-10 bg-white/5 border-white/10 text-white text-xs rounded-lg focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-rose-500 text-[9px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                        <FiMail className="text-blue-500" /> Email Akun
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            placeholder="lembaga@example.com"
                                                            className="h-10 bg-white/5 border-white/10 text-white text-xs rounded-lg focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                                        />
                                                    </FormControl>
                                                    <p className="text-[10px] italic text-gray-500">*Email aktif pengelola atau perusahaan/lembaga</p>
                                                    <FormMessage className="text-rose-500 text-[9px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="no_telp"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                        <FiPhone className="text-blue-500" /> WhatsApp / Telp
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="0812XXXXXXXX"
                                                            className="h-10 bg-white/5 border-white/10 text-white text-xs rounded-lg focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                                        />
                                                    </FormControl>
                                                    <p className="text-[10px] italic text-gray-500">*No Telepon aktif pengelola atau perusahaan/lembaga</p>

                                                    <FormMessage className="text-rose-500 text-[9px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                        <FiLock className="text-blue-500" /> Kata Sandi
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="password"
                                                            placeholder="••••••••"
                                                            className="h-10 bg-white/5 border-white/10 text-white text-xs rounded-lg focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-rose-500 text-[9px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="confirm_password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                        <FiCheckCircle className="text-blue-500" /> Konfirmasi Sandi
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="password"
                                                            placeholder="••••••••"
                                                            className="h-10 bg-white/5 border-white/10 text-white text-xs rounded-lg focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-rose-500 text-[9px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="status_kepemilikan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                        <FiGlobe className="text-blue-500" /> Status Kepemilikan Usaha
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white text-xs rounded-lg focus:ring-blue-500/20 transition-all">
                                                                <SelectValue placeholder="Pilih Status..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                                                            {['Koperasi', 'BUMN', 'Persero', 'Perusahaan Umum', 'Badan Usaha Milik Swasta', 'Perserorangan'].map((status) => (
                                                                <SelectItem key={status} value={status} className="hover:bg-blue-600 focus:bg-blue-600 transition-colors cursor-pointer text-xs">
                                                                    {status}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-rose-500 text-[9px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="jenis_bidang_pelatihan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                                                        <FiAward className="text-blue-500" /> Bidang Usaha atau Pelatihan
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingRumpun}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white text-xs rounded-lg focus:ring-blue-500/20 transition-all">
                                                                <SelectValue placeholder={loadingRumpun ? "Memuat..." : "Pilih Bidang Usaha atau Pelatihan..."} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#0f172a] border-white/10 text-white max-h-[200px]">
                                                            {rumpunPelatihan?.map((item: any) => (
                                                                <SelectItem key={item.id_rumpun_pelatihan} value={item.id_rumpun_pelatihan.toString()} className="hover:bg-blue-600 focus:bg-blue-600 transition-colors cursor-pointer text-xs">
                                                                    {item.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-[10px] italic text-gray-500">*Pilih bidang yang paling menonjol pada usaha atau pelatihan</p>

                                                    <FormMessage className="text-rose-500 text-[9px] font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold tracking-widest text-xs transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <HashLoader color="#fff" size={16} />
                                            ) : (
                                                <>
                                                    <FiSave className="text-base" />
                                                    BUAT AKUN
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-3">
                                        <p className="text-[10px] text-gray-500 font-medium">
                                            Sudah memiliki akun? <Link href="/p2mkp/login" className="text-blue-400 hover:underline font-bold">Masuk Portal</Link>
                                        </p>
                                        <Link href="/p2mkp" className="inline-flex items-center gap-2 text-[8px] text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em] font-bold">
                                            <FiArrowLeft /> Kembali ke Beranda
                                        </Link>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-6 flex items-center justify-center gap-2 opacity-50"
                    >
                        <FiShield className="text-emerald-500" size={12} />
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none">Sistem Keamanan Terintegrasi BPPSDM KP</p>
                    </motion.div>
                </motion.div>
            </main>

            <Footer />

            <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent className="bg-[#0f172a] border-white/10 text-white font-jakarta">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            {alertConfig.type === 'error' && <FiShield className="text-rose-500" />}
                            {alertConfig.type === 'warning' && <FiInfo className="text-amber-500" />}
                            {alertConfig.type === 'success' && <FiCheckCircle className="text-emerald-500" />}
                            {alertConfig.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            {alertConfig.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="border-t border-white/5 pt-4">
                        <AlertDialogAction className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 border-none">
                            MENGERTI
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
