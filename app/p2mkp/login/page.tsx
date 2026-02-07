'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogIn, FiMail, FiLock, FiArrowLeft, FiShield, FiInfo } from 'react-icons/fi';
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
import Footer from '@/components/ui/footer';
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
                    Cookies.set('XSRF091', token);
                    Cookies.set('Access', 'p2mkp');
                }

                Toast.fire({
                    icon: 'success',
                    title: 'Login Berhasil',
                    text: 'Selamat datang kembali di portal P2MKP.'
                });

                router.push('/p2mkp/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
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
        <div className="fixed inset-0 z-[999999] font-jakarta overflow-hidden scrollbar-hide">
            <main className="h-full w-full relative bg-slate-950 text-white flex items-center justify-center p-4 scrollbar-hide">
                {/* Animated Background Image */}
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.25 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={"/images/hero-img6.jpg"}
                        className="w-full h-full object-cover"
                        alt="Background"
                        fill={true}
                        priority
                    />
                </motion.div>

                {/* Gradient Blobs with Animation */}
                <motion.div
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/30 blur-[100px] z-1"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px] z-1"
                />

                <section className="relative z-10 w-full max-w-lg flex flex-col items-center max-h-full overflow-y-auto scrollbar-hide py-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full flex flex-col items-center"
                    >
                        {/* Header Section */}
                        <div className="text-center mb-5">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-3"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Portal P2MKP
                            </motion.div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl leading-none font-bold tracking-tight text-white font-calsans">
                                Login Lembaga <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">P2MKP</span>
                            </h1>
                            <p className="text-gray-400 mx-auto text-xs md:text-sm leading-relaxed max-w-md">
                                Selamat datang kembali di portal P2MKP terpadu. Silakan masuk untuk mengelola program lembaga anda.
                            </p>
                        </div>

                        {/* Glassmorphism Form Card */}
                        <div className="w-full relative group px-2 md:px-0">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>

                            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                        <FiMail className="text-blue-400" /> Email Kredensial
                                                    </FormLabel>
                                                    <FormControl>
                                                        <input
                                                            type="email"
                                                            {...field}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base placeholder:text-gray-500 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                                                            placeholder="lembaga@p2mkp.id"
                                                            autoComplete="off"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                        <FiLock className="text-blue-400" /> Password Akses
                                                    </FormLabel>
                                                    <FormControl>
                                                        <input
                                                            type="password"
                                                            {...field}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base placeholder:text-gray-500 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                                                            placeholder="••••••••"
                                                            autoComplete="off"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="pt-2">
                                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-base md:text-lg shadow-lg shadow-blue-500/25 transition-all border-none flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Authenticating...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <FiLogIn /> Sign In P2MKP
                                                        </>
                                                    )}
                                                </button>
                                            </motion.div>
                                        </div>

                                        <div className="pt-4 border-t border-white/10 space-y-4">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400">
                                                    Belum terdaftar? <Link href="/p2mkp/registrasi" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">Daftar Lembaga Baru</Link>
                                                </p>
                                            </div>
                                            <div className="flex justify-center">
                                                <Link href="/" className="inline-flex items-center gap-2 text-[10px] text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-widest">
                                                    <FiArrowLeft /> Kembali ke Beranda
                                                </Link>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl"
                        >
                            <FiShield className="text-emerald-500 shrink-0" size={16} />
                            <p className="text-[10px] text-gray-500 leading-tight">KKP Protected: Secure authentication active. All access attempts are logged.</p>
                        </motion.div>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
