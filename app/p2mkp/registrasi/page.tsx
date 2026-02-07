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
    FiChevronRight
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
import { useFetchDataRumpunPelatihan } from '@/hooks/elaut/master/useFetchDataRumpunPelatihan';
import Footer from '@/components/ui/footer';

import axios from 'axios';
import { elautBaseUrl } from '@/constants/urls';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { HashLoader } from 'react-spinners';
import Toast from '@/commons/Toast';

const formSchema = z.object({
    nama_Ppmkp: z.string().min(1, 'Nama P2MKP wajib diisi'),
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
            nama_Ppmkp: '',
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
                nama_Ppmkp: values.nama_Ppmkp,
                email: values.email,
                password: values.password,
                no_telpon: values.no_telpon,
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
            Swal.fire({
                title: 'Registrasi Gagal',
                text: error.response?.data?.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.',
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
                <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-cyan-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="flex-grow flex items-center justify-center p-4 relative z-10 pt-32 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-2xl"
                >
                    {/* Glass Card Container */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000" />

                        <div className="relative bg-[#0f172a]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                            {/* Decorative Background Glow */}
                            <div className="absolute top-0 right-0 p-12 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors" />

                            <div className="relative z-10 space-y-10">
                                {/* Header Section */}
                                <div className="text-center space-y-4">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl md:text-5xl font-calsans tracking-tight">Registrasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">P2MKP</span></h1>
                                        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black">Identity and Institutional Setup</p>
                                    </div>
                                    <p className="text-gray-400 text-sm max-w-md mx-auto font-light leading-relaxed">
                                        Bergabunglah dalam ekosistem pengembangan SDM Kelautan dan Perikanan. Lengkapi formulir di bawah untuk mendaftarkan lembaga Anda.
                                    </p>
                                </div>

                                {/* Form Section */}
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                                        {/* Basic Info Group */}
                                        <div className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="nama_Ppmkp"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Nama Lembaga (P2MKP)</FormLabel>
                                                        <FormControl>
                                                            <div className="relative group/input">
                                                                <FiBriefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                                                <Input
                                                                    placeholder="Masukkan Nama Resmi P2MKP..."
                                                                    {...field}
                                                                    className="w-full pl-12 pr-5 py-6 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600 h-14"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                                        placeholder="nama@email.com"
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
                                                    name="no_telpon"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Kontak Telepon</FormLabel>
                                                            <FormControl>
                                                                <div className="relative group/input">
                                                                    <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                                                    <Input
                                                                        placeholder="08xxxxxxxxxx"
                                                                        type="tel"
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Security Password</FormLabel>
                                                            <FormControl>
                                                                <div className="relative group/input">
                                                                    <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                                                    <Input
                                                                        placeholder="******"
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
                                                <FormField
                                                    control={form.control}
                                                    name="confirm_password"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Konfirmasi Security</FormLabel>
                                                            <FormControl>
                                                                <div className="relative group/input">
                                                                    <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                                                    <Input
                                                                        placeholder="******"
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="status_kepemilikan"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Status Kepemilikan</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                                        <div className="flex items-center gap-3">
                                                                            <FiAward className="text-blue-400 shrink-0" />
                                                                            <SelectValue placeholder="Pilih Status..." />
                                                                        </div>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                                                                    {[
                                                                        'Koperasi',
                                                                        'BUMN',
                                                                        'Persero',
                                                                        'Perusahaan Umum',
                                                                        'Badan Usaha Milik Swasta',
                                                                        'Perserorangan',
                                                                    ].map((status) => (
                                                                        <SelectItem key={status} value={status} className="hover:bg-blue-600/20 focus:bg-blue-600/20 rounded-lg py-3 cursor-pointer">
                                                                            {status}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="jenis_bidang_pelatihan"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Rumpun Bidang Pelatihan</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingRumpun}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                                        <div className="flex items-center gap-3">
                                                                            <FiUser className="text-cyan-400 shrink-0" />
                                                                            <SelectValue placeholder={loadingRumpun ? "Memuat data..." : "Pilih Rumpun..."} />
                                                                        </div>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl max-h-[300px]">
                                                                    {rumpunPelatihan && rumpunPelatihan.map((item: any) => (
                                                                        <SelectItem key={item.id_rumpun_pelatihan} value={item.id_rumpun_pelatihan.toString()} className="hover:bg-cyan-600/20 focus:bg-cyan-600/20 rounded-lg py-3 cursor-pointer">
                                                                            {item.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:opacity-90 text-white rounded-2xl font-bold tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 group/btn overflow-hidden"
                                            >
                                                {isSubmitting ? (
                                                    <HashLoader color="#fff" size={24} />
                                                ) : (
                                                    <>
                                                        <FiSave size={20} className="group-hover:rotate-12 transition-transform" />
                                                        SUBMIT PENDAFTARAN P2MKP
                                                    </>
                                                )}
                                                <div className="absolute inset-0 w-12 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[600%] transition-transform duration-1000" />
                                            </button>
                                        </div>

                                        {/* Footer Links */}
                                        <div className="flex flex-col gap-4 text-center border-t border-white/5 pt-8">
                                            <p className="text-xs text-gray-400">
                                                Sudah memiliki akun lembaga? <Link href="/p2mkp/login" className="text-blue-400 hover:text-blue-300 font-black transition-colors underline-offset-4 hover:underline">MASUK PORTAL</Link>
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
                        className="mt-8 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl max-w-sm mx-auto"
                    >
                        <FiShield className="text-cyan-500 shrink-0" />
                        <p className="text-[9px] text-gray-500 leading-tight">Keamanan data terjamin. Seluruh pengajuan akan diverifikasi oleh unit kerja terkait sesuai mekanisme regulasi yang berlaku.</p>
                    </motion.div>
                </motion.div>
            </div>
            <Footer />
        </section>
    );
}
