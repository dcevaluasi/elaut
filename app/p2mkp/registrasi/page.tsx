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
import Image from 'next/image';

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
                        src={"/images/hero-img9.jpg"}
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
                    className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px] z-1"
                />

                <section className="relative z-10 w-full max-w-2xl flex flex-col items-center max-h-full overflow-y-auto scrollbar-hide py-10 md:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full flex flex-col items-center"
                    >
                        {/* Header Section */}
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-3"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Pendaftaran P2MKP
                            </motion.div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl leading-none font-bold tracking-tight text-white font-calsans">
                                Registrasi Lembaga <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">P2MKP</span>
                            </h1>
                            <p className="text-gray-400 mx-auto text-xs md:text-sm leading-relaxed max-w-lg mt-2">
                                Daftarkan lembaga mandiri anda untuk bergabung dalam ekosistem pelatihan kelautan dan perikanan terpadu BPPSDM KP.
                            </p>
                        </div>

                        {/* Glassmorphism Form Card */}
                        <div className="w-full relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[2.5rem] blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>

                            <div className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                        {/* Basic Info Group */}
                                        <div className="space-y-5">
                                            <FormField
                                                control={form.control}
                                                name="nama_Ppmkp"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                            <FiBriefcase className="text-blue-400" /> Nama Lembaga (P2MKP)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <input
                                                                placeholder="Masukkan Nama Resmi P2MKP..."
                                                                {...field}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                                                                autoComplete="off"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                                                    placeholder="nama@email.com"
                                                                    type="email"
                                                                    {...field}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                                                                    autoComplete="off"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="no_telpon"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-1.5">
                                                            <FormLabel className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                                <FiPhone className="text-blue-400" /> Kontak Telepon
                                                            </FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    placeholder="08xxxxxxxxxx"
                                                                    type="tel"
                                                                    {...field}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                                                                    autoComplete="off"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FormField
                                                    control={form.control}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-1.5">
                                                            <FormLabel className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                                <FiLock className="text-blue-400" /> Security Password
                                                            </FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    placeholder="******"
                                                                    type="password"
                                                                    {...field}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                                                                    autoComplete="off"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="confirm_password"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-1.5">
                                                            <FormLabel className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                                <FiLock className="text-blue-400" /> Konfirmasi Password
                                                            </FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    placeholder="******"
                                                                    type="password"
                                                                    {...field}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                                                                    autoComplete="off"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <FormField
                                                    control={form.control}
                                                    name="status_kepemilikan"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-1.5">
                                                            <FormLabel className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                                <FiAward className="text-blue-400" /> Status Kepemilikan
                                                            </FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white hover:bg-white/10 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all">
                                                                        <SelectValue placeholder="Pilih Status..." />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="bg-slate-900 border-white/10 text-white backdrop-blur-2xl rounded-2xl">
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
                                                        <FormItem className="space-y-1.5">
                                                            <FormLabel className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                                <FiUser className="text-blue-400" /> Rumpun Pelatihan
                                                            </FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingRumpun}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white hover:bg-white/10 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all">
                                                                        <SelectValue placeholder={loadingRumpun ? "Memuat..." : "Pilih Rumpun..."} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="bg-slate-900 border-white/10 text-white backdrop-blur-2xl rounded-2xl max-h-[300px]">
                                                                    {rumpunPelatihan && rumpunPelatihan.map((item: any) => (
                                                                        <SelectItem key={item.id_rumpun_pelatihan} value={item.id_rumpun_pelatihan.toString()} className="hover:bg-blue-600/20 focus:bg-blue-600/20 rounded-lg py-3 cursor-pointer">
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

                                        <div className="pt-4">
                                            <motion.button
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                                            >
                                                {isSubmitting ? (
                                                    <HashLoader color="#fff" size={24} />
                                                ) : (
                                                    <>
                                                        <FiSave size={22} className="group-hover:rotate-12 transition-transform" />
                                                        SUBMIT PENDAFTARAN P2MKP
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>

                                        {/* Footer Links */}
                                        <div className="flex flex-col gap-4 text-center border-t border-white/10 pt-6">
                                            <p className="text-sm text-gray-400 leading-relaxed font-light">
                                                Sudah memiliki akun lembaga? <Link href="/p2mkp/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors underline-offset-4 hover:underline">MASUK PORTAL</Link>
                                            </p>

                                            <div className="flex justify-center">
                                                <Link href="/p2mkp" className="inline-flex items-center gap-2 text-[10px] text-gray-500 hover:text-white transition-colors group/back uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                                    KEMBALI KE BERANDA
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
                            className="mt-8 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl"
                        >
                            <FiShield className="text-emerald-500 shrink-0" size={16} />
                            <p className="text-[10px] text-gray-500 leading-tight">KKP Protected: Secure data transmission active. Institutional verification is required.</p>
                        </motion.div>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
