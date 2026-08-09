'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
    FiLogIn,
    FiMail,
    FiLock,
    FiArrowLeft,
    FiShield,
    FiInfo,
    FiCheckCircle,
    FiEye,
    FiEyeOff,
    FiAlertTriangle,
} from 'react-icons/fi';
import { TbBuildingEstate } from 'react-icons/tb';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { setSecureCookie } from '@/lib/utils';

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
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import { elautBaseUrl } from '@/constants/urls';
import { HashLoader } from 'react-spinners';

const formSchema = z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Kata sandi wajib diisi'),
});

export default function P2MKPLoginPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${elautBaseUrl}/p2mkp/login`, {
                email: values.email,
                password: values.password,
            });

            if (response.status === 200) {
                const token = response.data.token || response.data.access_token;
                if (token) {
                    setSecureCookie('XSRF091', token);
                    setSecureCookie('Access', 'p2mkp');
                }
                router.push('/p2mkp/dashboard');
            }
        } catch (error: any) {
            showAlert(
                'Otentikasi Gagal',
                error.response?.data?.message || 'Email atau kata sandi yang Anda masukkan salah. Periksa kembali dan coba lagi.',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const onInvalid = (errors: any) => {
        const values = form.getValues();
        const isEmpty = !values.email && !values.password;

        if (isEmpty) {
            showAlert('Data Masih Kosong', 'Silakan masukkan email dan kata sandi Anda.', 'warning');
        } else {
            const errorKeys = Object.keys(errors);
            if (errorKeys.length > 0) {
                const firstKey = errorKeys[0];
                const firstError = errors[firstKey];
                showAlert('Data Belum Sesuai', firstError?.message || 'Mohon periksa kembali inputan Anda.', 'error');
            }
        }
    };

    return (
        <section className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-jakarta overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/15 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px]" />
                <div className="absolute top-[30%] right-[0%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[110px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-150 brightness-100" />
            </div>

            <Header />

            <main className="relative z-10 px-4 md:px-8 max-w-md mx-auto min-h-screen flex flex-col justify-center py-28">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="w-full"
                >
                    {/* Icon + Badge */}
                    <div className="flex flex-col items-center mb-8 space-y-3">
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-1"
                        >
                            <TbBuildingEstate className="w-8 h-8 text-white" />
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Portal P2MKP · Akses Masuk
                        </motion.div>

                        <div className="text-center space-y-1">
                            <h1 className="text-2xl md:text-3xl font-calsans leading-none tracking-tight">
                                SELAMAT DATANG
                            </h1>
                            <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed font-light">
                                Masuk untuk mengelola lembaga P2MKP Anda dan mengajukan penetapan serta klasifikasi.
                            </p>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-70 transition duration-1000" />

                        <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-7 md:p-9 shadow-2xl space-y-5">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-5">

                                    {/* Email */}
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                                                    <FiMail className="text-blue-400 w-3.5 h-3.5" /> Alamat Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        placeholder="lembaga@domain.com"
                                                        autoComplete="email"
                                                        className="h-11 bg-white/5 border-white/10 text-white text-xs rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all font-medium placeholder:text-gray-500"
                                                    />
                                                </FormControl>
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
                                                <div className="flex items-center justify-between mb-1">
                                                    <FormLabel className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                                        <FiLock className="text-blue-400 w-3.5 h-3.5" /> Kata Sandi
                                                    </FormLabel>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            autoComplete="current-password"
                                                            className="h-11 bg-white/5 border-white/10 text-white text-xs rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all font-medium pr-10 placeholder:text-gray-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                                                        >
                                                            {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-rose-400 text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Submit */}
                                    <div className="pt-1">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black  text-xs transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50 uppercase"
                                        >
                                            {isSubmitting ? (
                                                <HashLoader color="#fff" size={18} />
                                            ) : (
                                                <>
                                                    <FiLogIn className="text-base" />
                                                    MASUK KE PORTAL P2MKP
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Divider + Links */}
                                    <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-2.5">
                                        <p className="text-xs text-gray-400 font-medium text-center">
                                            Lembaga baru?{' '}
                                            <Link href="/p2mkp/registrasi" className="text-blue-400 hover:text-blue-300 font-black underline underline-offset-4">
                                                Daftar Sekarang
                                            </Link>
                                        </p>
                                        <Link href="/p2mkp" className="inline-flex items-center gap-1.5 text-[9px] text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-[0.2em] font-bold">
                                            <FiArrowLeft size={10} /> Kembali ke Beranda
                                        </Link>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>


                </motion.div>
            </main>

            <Footer />

            <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent className="bg-[#0f172a] border-white/10 text-white font-jakarta rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-base font-bold">
                            {alertConfig.type === 'error' && <FiAlertTriangle className="text-rose-500" />}
                            {alertConfig.type === 'warning' && <FiInfo className="text-amber-500" />}
                            {alertConfig.type === 'success' && <FiCheckCircle className="text-emerald-500" />}
                            {alertConfig.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 text-xs leading-relaxed">
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
