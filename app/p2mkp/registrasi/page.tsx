'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
    FiInfo,
    FiEye,
    FiEyeOff
} from 'react-icons/fi';
import Link from 'next/link';

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
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirm_password"],
});

export default function RegistrasiP2MKPPage() {
    const { data: rumpunPelatihan, loading: loadingRumpun } = useFetchDataRumpunPelatihan();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{
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
                await Swal.fire({
                    icon: 'success',
                    title: 'Registrasi Berhasil!',
                    text: 'Akun P2MKP Anda telah berhasil terdaftar. Silakan login untuk melanjutkan ke portal P2MKP.',
                    confirmButtonText: 'Ke Halaman Login',
                    confirmButtonColor: '#2563eb',
                    background: '#0f172a',
                    color: '#ffffff',
                    customClass: {
                        popup: 'rounded-3xl border border-white/10 shadow-2xl z-[999999]',
                        confirmButton: 'rounded-xl font-bold tracking-wider text-xs px-6 py-3',
                    }
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
                'Silakan isi seluruh formulir registrasi terlebih dahulu.',
                'warning'
            );
        } else {
            const errorKeys = Object.keys(errors);
            if (errorKeys.length > 0) {
                const firstKey = errorKeys[0];
                const firstError = errors[firstKey];
                showAlert(
                    'Data Belum Sesuai',
                    firstError?.message || 'Mohon periksa kembali data yang Anda masukkan.',
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

            <main className="relative z-10 pt-28 pb-16 px-4 md:px-8 max-w-3xl mx-auto min-h-screen flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full"
                >
                    {/* Header Section */}
                    <div className="text-center mb-8 space-y-3">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Daftarkan Lembaga atau Usaha Anda
                        </motion.div>
                        <h1 className="text-2xl md:text-4xl font-calsans leading-none tracking-tight">
                            MARI BERGABUNG
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-400 to-cyan-400"> MENJADI P2MKP</span>
                        </h1>
                        <p className="text-gray-400 text-xs max-w-lg mx-auto leading-relaxed font-light">
                            Isi formulir pendaftaran di bawah ini untuk mendaftarkan lembaga atau usaha Anda sebagai Pusat Pelatihan Mandiri Kelautan dan Perikanan.
                        </p>
                    </div>

                    {/* Form Container */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-70 transition duration-1000" />

                        <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Nama Lembaga */}
                                        <FormField
                                            control={form.control}
                                            name="nama_Ppmkp"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                                                        <FiBriefcase className="text-blue-400 w-3.5 h-3.5" /> Nama Lembaga / Usaha P2MKP
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Contoh: P2MKP Sinar Mandiri Bahari"
                                                            className="h-11 bg-white/5 border-white/10 text-white text-xs rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all font-medium placeholder:text-gray-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-rose-400 text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Email */}
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                                                        <FiMail className="text-blue-400 w-3.5 h-3.5" /> Email Resmi / Pengelola
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            placeholder="lembaga@domain.com"
                                                            className="h-11 bg-white/5 border-white/10 text-white text-xs rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all font-medium placeholder:text-gray-500"
                                                        />
                                                    </FormControl>
                                                    <p className="text-[9px] text-gray-500 italic">*Digunakan sebagai kredensial login portal</p>
                                                    <FormMessage className="text-rose-400 text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Phone */}
                                        <FormField
                                            control={form.control}
                                            name="no_telp"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                                                        <FiPhone className="text-blue-400 w-3.5 h-3.5" /> Nomor WhatsApp / Telp
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="0812XXXXXXXX"
                                                            className="h-11 bg-white/5 border-white/10 text-white text-xs rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all font-medium placeholder:text-gray-500"
                                                        />
                                                    </FormControl>
                                                    <p className="text-[9px] text-gray-500 italic">*Nomor aktif kontak penanggung jawab</p>
                                                    <FormMessage className="text-rose-400 text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Status Kepemilikan */}
                                        <FormField
                                            control={form.control}
                                            name="status_kepemilikan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                                                        <FiGlobe className="text-blue-400 w-3.5 h-3.5" /> Status Kepemilikan Usaha
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white text-xs rounded-xl focus:ring-2 focus:ring-blue-500/30 transition-all font-medium">
                                                                <SelectValue placeholder="Pilih Status..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#0f172a] border-white/10 text-white rounded-xl">
                                                            {['Koperasi', 'BUMN', 'Persero', 'Perusahaan Umum', 'Badan Usaha Milik Swasta', 'Perserorangan'].map((status) => (
                                                                <SelectItem key={status} value={status} className="hover:bg-blue-600 focus:bg-blue-600 transition-colors cursor-pointer text-xs font-semibold">
                                                                    {status}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-rose-400 text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Jenis Bidang Pelatihan */}
                                        <FormField
                                            control={form.control}
                                            name="jenis_bidang_pelatihan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                                                        <FiAward className="text-blue-400 w-3.5 h-3.5" /> Bidang Usaha / Pelatihan
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingRumpun}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white text-xs rounded-xl focus:ring-2 focus:ring-blue-500/30 transition-all font-medium">
                                                                <SelectValue placeholder={loadingRumpun ? "Memuat..." : "Pilih Bidang..."} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[#0f172a] border-white/10 text-white max-h-[220px] rounded-xl">
                                                            {rumpunPelatihan?.map((item: any) => (
                                                                <SelectItem key={item.id_rumpun_pelatihan} value={item.id_rumpun_pelatihan.toString()} className="hover:bg-blue-600 focus:bg-blue-600 transition-colors cursor-pointer text-xs font-semibold">
                                                                    {item.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-rose-400 text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Password with Eye Toggle */}
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                                                        <FiLock className="text-blue-400 w-3.5 h-3.5" /> Kata Sandi
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="••••••••"
                                                                className="h-11 bg-white/5 border-white/10 text-white text-xs rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all font-medium pr-10 placeholder:text-gray-500"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                                                            >
                                                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <p className="text-[9px] text-gray-500 italic">*Min. 8 karakter, huruf besar/kecil, angka & simbol</p>
                                                    <FormMessage className="text-rose-400 text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Confirm Password with Eye Toggle */}
                                        <FormField
                                            control={form.control}
                                            name="confirm_password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                                                        <FiCheckCircle className="text-blue-400 w-3.5 h-3.5" /> Konfirmasi Kata Sandi
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                placeholder="••••••••"
                                                                className="h-11 bg-white/5 border-white/10 text-white text-xs rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all font-medium pr-10 placeholder:text-gray-500"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                                                            >
                                                                {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-rose-400 text-[10px] font-bold" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-3">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black tracking-widest text-xs transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50 uppercase"
                                        >
                                            {isSubmitting ? (
                                                <HashLoader color="#fff" size={18} />
                                            ) : (
                                                <>
                                                    <FiSave className="text-base" />
                                                    DAFTARKAN AKUN P2MKP
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Bottom Links */}
                                    <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-2.5">
                                        <p className="text-xs text-gray-400 font-medium">
                                            Sudah memiliki akun?{' '}
                                            <Link href="/p2mkp/login" className="text-blue-400 hover:text-blue-300 font-black underline underline-offset-4">
                                                Masuk Portal P2MKP
                                            </Link>
                                        </p>
                                        <Link href="/p2mkp" className="inline-flex items-center gap-2 text-[9px] text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-[0.2em] font-bold">
                                            <FiArrowLeft /> Kembali ke Landing Page
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
                        className="mt-6 flex items-center justify-center gap-2 opacity-60"
                    >
                        <FiShield className="text-emerald-400" size={13} />
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Sistem Keamanan Terintegrasi BPPSDM KP</p>
                    </motion.div>
                </motion.div>
            </main>

            <Footer />

            <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent className="bg-[#0f172a] border-white/10 text-white font-jakarta rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-base font-bold">
                            {alertConfig.type === 'error' && <FiShield className="text-rose-500" />}
                            {alertConfig.type === 'warning' && <FiInfo className="text-amber-500" />}
                            {alertConfig.type === 'success' && <FiCheckCircle className="text-emerald-500" />}
                            {alertConfig.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 text-xs">
                            {alertConfig.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="border-t border-white/5 pt-4">
                        <AlertDialogAction className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 text-xs rounded-xl border-none">
                            MENGERTI
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
