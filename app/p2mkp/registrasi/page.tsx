'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Save } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFetchDataRumpunPelatihan } from '@/hooks/elaut/master/useFetchDataRumpunPelatihan';
import Footer from '@/components/ui/footer';

import axios from 'axios';
import { elautBaseUrl } from '@/constants/urls';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    nama_p2mkp: z.string().min(1, 'Nama P2MKP wajib diisi'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirm_password: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
    no_telpon: z.string().min(10, 'Nomor telepon minimal 10 digit'),
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama_p2mkp: '',
            email: '',
            password: '',
            confirm_password: '',
            no_telpon: '',
            status_kepemilikan: undefined,
            jenis_bidang_pelatihan: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${elautBaseUrl}/p2mkp/create_p2mkp`, {
                nama_p2mkp: values.nama_p2mkp,
                email: values.email,
                password: values.password,
                no_telpon: values.no_telpon,
                status_kepemilikan: values.status_kepemilikan,
                jenis_bidang_pelatihan: values.jenis_bidang_pelatihan
            });

            if (response.status === 200 || response.status === 201) {
                Swal.fire({
                    title: 'Registrasi Berhasil!',
                    text: 'Silakan login untuk melanjutkan.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3b82f6',
                }).then(() => {
                    router.push('/p2mkp/login');
                });
            }
        } catch (error: any) {
            console.log("FULL ERROR : ", error);
            console.log("ERROR RESPONSE : ", error.response);
            console.error('Registration error:', error);
            Swal.fire({
                title: 'Registrasi Gagal',
                text: error.response?.data?.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.',
                icon: 'error',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#d33',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
            <div className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8 mt-20 mb-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl mt-14"
                >
                    <Card className="border-white/20 bg-white/10 backdrop-blur-lg text-white shadow-2xl">
                        <CardHeader className="text-center space-y-2">
                            <CardTitle className="text-3xl font-bold">Registrasi P2MKP</CardTitle>
                            <CardDescription className="text-blue-200">
                                Lengkapi data diri dan profil P2MKP Anda untuk mendaftar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                    <FormField
                                        control={form.control}
                                        name="nama_p2mkp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Nama P2MKP</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan Nama P2MKP" {...field} className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/20" />
                                                </FormControl>
                                                <FormMessage className="text-red-300" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white">Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="email@contoh.com" type="email" {...field} className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/20" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-300" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="no_telpon"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white">No. Telepon</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="08xxxxxxxxxx" type="tel" {...field} className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/20" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-300" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white">Password</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="******" type="password" {...field} className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/20" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-300" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="confirm_password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white">Konfirmasi Password</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="******" type="password" {...field} className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/20" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-300" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="status_kepemilikan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white">Status Kepemilikan</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20">
                                                                <SelectValue placeholder="Pilih Status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Koperasi">Koperasi</SelectItem>
                                                            <SelectItem value="BUMN">BUMN</SelectItem>
                                                            <SelectItem value="Persero">Persero</SelectItem>
                                                            <SelectItem value="Perusahaan Umum">Perusahaan Umum</SelectItem>
                                                            <SelectItem value="Badan Usaha Milik Swasta">Badan Usaha Milik Swasta</SelectItem>
                                                            <SelectItem value="Perserorangan">Perserorangan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-red-300" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="jenis_bidang_pelatihan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white">Jenis Bidang Pelatihan</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingRumpun}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20">
                                                                <SelectValue placeholder={loadingRumpun ? "Memuat..." : "Pilih Bidang Pelatihan"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {rumpunPelatihan && rumpunPelatihan.map((item: any) => (
                                                                <SelectItem key={item.id_rumpun_pelatihan} value={item.id_rumpun_pelatihan.toString()}>
                                                                    {item.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-red-300" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">
                                            {isSubmitting ? (
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            ) : (
                                                <Save className="mr-2 h-5 w-5" />
                                            )}
                                            {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}
                                        </Button>
                                    </div>

                                    <div className="text-center text-sm text-blue-200/60 mt-4">
                                        Sudah punya akun? <Link href="/p2mkp/login" className="text-blue-300 hover:text-white underline">Masuk di sini</Link>
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
