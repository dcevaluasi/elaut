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
        <section className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-jakarta flex flex-col">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="flex-grow flex items-center justify-center p-4 relative z-10 pt-32 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Glass Card Container */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000" />

                        <div className="relative bg-[#0f172a]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                            {/* Decorative Background Glow */}
                            <div className="absolute top-0 right-0 p-12 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors" />

                            <div className="relative z-10 space-y-8">
                                {/* Header Section */}
                                <div className="text-center space-y-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-3xl border border-blue-500/20 shadow-xl"
                                    >
                                        <FiLogIn className="w-10 h-10 text-blue-400" />
                                    </motion.div>

                                    <div className="space-y-1">
                                        <h1 className="text-3xl md:text-4xl font-calsans tracking-tight">Login Portal</h1>
                                        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black">Authorized Personnel Only</p>
                                    </div>
                                </div>

                                {/* Form Section */}
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Email Kredensial</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group/input">
                                                                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                                                <Input
                                                                    placeholder="Enter your email address..."
                                                                    type="email"
                                                                    {...field}
                                                                    className="w-full pl-12 pr-5 py-6 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600 h-14"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Keamanan Password</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group/input">
                                                                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                                                <Input
                                                                    placeholder="Enter security key..."
                                                                    type="password"
                                                                    {...field}
                                                                    className="w-full pl-12 pr-5 py-6 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600 h-14"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold tracking-widest shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 group/btn overflow-hidden"
                                            >
                                                {isSubmitting ? (
                                                    <HashLoader color="#fff" size={24} />
                                                ) : (
                                                    <>
                                                        <FiLogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                                        AKSES DASHBOARD P2MKP
                                                    </>
                                                )}
                                                <div className="absolute inset-0 w-12 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[600%] transition-transform duration-1000" />
                                            </button>
                                        </div>

                                        {/* Footer Links */}
                                        <div className="flex flex-col gap-4 text-center pt-4">
                                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                                <div className="h-px bg-white/5 flex-1" />
                                                <span>ATAU</span>
                                                <div className="h-px bg-white/5 flex-1" />
                                            </div>

                                            <p className="text-xs text-gray-400">
                                                Belum terdaftar? <Link href="/p2mkp/registrasi" className="text-blue-400 hover:text-blue-300 font-black transition-colors underline-offset-4 hover:underline">REGISTRASI LEMBAGA</Link>
                                            </p>

                                            <Link href="/p2mkp" className="inline-flex items-center justify-center gap-2 text-[10px] text-gray-600 hover:text-white transition-colors group/back uppercase font-bold tracking-widest">
                                                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                                KEMBALI KE BERANDA
                                            </Link>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl max-w-xs mx-auto"
                    >
                        <FiShield className="text-emerald-500 shrink-0" />
                        <p className="text-[9px] text-gray-500 leading-tight">Sistem keamanan terintegrasi KKP-Shield aktif. Seluruh aktivitas login dipantau dan dilindungi.</p>
                    </motion.div>
                </motion.div>
            </div>
            <Footer />
        </section>
    );
}
