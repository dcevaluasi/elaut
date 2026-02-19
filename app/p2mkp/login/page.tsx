'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogIn, FiMail, FiLock, FiArrowLeft, FiShield, FiInfo, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { setSecureCookie } from '@/lib/utils';

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
import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import { elautBaseUrl } from '@/constants/urls';
import { HashLoader } from 'react-spinners';
import Toast from '@/commons/Toast';
import Image from 'next/image';

const formSchema = z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
});

export default function P2MKPLoginPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
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

                Toast.fire({
                    icon: 'success',
                    title: 'Login Berhasil',
                    text: 'Selamat datang kembali di portal P2MKP.'
                });

                router.push('/p2mkp/dashboard');
            }
        } catch (error: any) {
            Swal.fire({
                title: 'Otentikasi Gagal',
                text: error.response?.data?.message || 'Email atau password yang Anda masukkan salah.',
                icon: 'error',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#3b82f6',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

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

            <main className="relative z-10 pt-24 pb-12 px-4 md:px-8 max-w-xl mx-auto min-h-screen flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full"
                >
                    {/* Header Section */}
                    <div className="text-center mb-10 space-y-4 w-full">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-widest"
                        >
                            <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                            Akses Masuk
                        </motion.div>
                        <h1 className="text-2xl md:text-4xl leading-none font-calsans min-w-full">
                            MASUK
                            <span className="text-transparent leading-none bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-400 to-cyan-400"> PORTAL P2MKP.</span>
                        </h1>
                        <p className="text-gray-400 text-[10px] leading-none md:text-xs max-w-xs mx-auto -mt-3">
                            Silakan masukkan email dan kata sandi lembaga Anda untuk masuk ke dalam sistem.
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="relative group -mt-6">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000" />

                        <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                                                    <FiMail className="text-blue-500" /> Alamat Email Akun
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        placeholder="lembaga@p2mkp.id"
                                                        className="h-10 bg-white/5 border-white/10 text-white text-xs rounded-lg focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-rose-500 text-[9px] font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                                                    <FiLock className="text-blue-500" /> Kata Sandi Akun
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

                                    <div className="pt-1">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold tracking-widest text-xs transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <HashLoader color="#fff" size={16} />
                                            ) : (
                                                <>
                                                    <FiLogIn className="text-base" />
                                                    MASUK KE DASHBOARD
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="pt-5 border-t border-white/5 flex flex-col items-center gap-3">
                                        <p className="text-[12px] text-gray-500">
                                            Lembaga baru? <Link href="/p2mkp/registrasi" className="text-blue-400 hover:underline font-bold">Daftar Sekarang</Link>
                                        </p>
                                        <Link href="/p2mkp" className="inline-flex items-center gap-2 text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em] font-bold">
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
                        className="mt-8 flex items-center justify-center gap-3 opacity-50"
                    >
                        <FiShield className="text-emerald-500" size={14} />
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Auth Protocol: Secure SSL active</p>
                    </motion.div>
                </motion.div>
            </main>

            <Footer />
        </section>
    );
}
