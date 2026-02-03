'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, LogIn } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/ui/footer';
import { elautBaseUrl } from '@/constants/urls';

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
                // Assuming the token is in the response data, e.g., response.data.token
                // Or if the backend sets the cookie directly.
                // The prompt says "make the register beautifully too and {{base_url}}/p2mkp/login email and password"
                // and "then direct to @[app/p2mkp/dashboard/page.tsx]".
                // I'll assume standard token response for now and set the cookie manually if present.
                const token = response.data.token || response.data.access_token;
                if (token) {
                    Cookies.set('XSRF091', token);
                    Cookies.set('Access', 'p2mkp'); // Set user role/access type if needed
                }

                Swal.fire({
                    title: 'Login Berhasil!',
                    text: 'Selamat datang kembali.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    router.push('/p2mkp/dashboard');
                });
            }
        } catch (error: any) {
            console.error('Login error:', error);
            Swal.fire({
                title: 'Login Gagal',
                text: error.response?.data?.message || 'Email atau password salah.',
                icon: 'error',
                confirmButtonText: 'Coba Lagi',
                confirmButtonColor: '#d33',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
            <div className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md mt-24"
                >
                    <Card className="border-white/20 bg-white/10 backdrop-blur-lg text-white shadow-2xl overflow-hidden relative">
                        {/* Decorative Elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

                        <CardHeader className="text-center space-y-1 relative z-10">
                            <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-white/20">
                                <LogIn className="w-8 h-8 text-blue-200" />
                            </div>
                            <CardTitle className="text-3xl font-bold tracking-tight">Login P2MKP</CardTitle>
                            <CardDescription className="text-blue-200">
                                Masuk untuk mengelola profil dan pelatihan Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="nama@email.com"
                                                        type="email"
                                                        {...field}
                                                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/20 h-12"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-300" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="******"
                                                        type="password"
                                                        {...field}
                                                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/20 h-12"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-300" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            ) : (
                                                <LogIn className="mr-2 h-5 w-5" />
                                            )}
                                            {isSubmitting ? 'Memproses...' : 'Masuk'}
                                        </Button>
                                    </div>

                                    <div className="text-center space-y-4 mt-6">
                                        <p className="text-sm text-blue-200/60">
                                            Belum punya akun? <Link href="/p2mkp/registrasi" className="text-blue-300 hover:text-white underline font-medium transition-colors">Daftar sekarang</Link>
                                        </p>
                                        <p className="text-xs text-blue-200/40">
                                            <Link href="/p2mkp" className="hover:text-blue-200 transition-colors">Kembali ke Beranda P2MKP</Link>
                                        </p>
                                    </div>

                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
            <Footer />
        </section>
    );
}
