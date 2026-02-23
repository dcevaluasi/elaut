'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
    FiUser,
    FiBriefcase,
    FiAward,
    FiInfo,
    FiSave,
    FiFileText,
    FiGlobe,
    FiMail,
    FiPhone,
    FiActivity,
    FiCalendar,
    FiEye,
    FiShield,
    FiCheckCircle,
    FiMapPin
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import DashboardLayout from '../DashboardLayout';

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
import { elautBaseUrl } from '@/constants/urls';
import { HashLoader } from 'react-spinners';

const formSchema = z.object({
    NamaPpmkp: z.string().min(1, "Nama Lembaga atau Usaha wajib diisi"),
    StatusKepemilikan: z.string().min(1, "Status kepemilikan wajib dipilih"),
    Nib: z.string().min(1, "NIB wajib diisi"),
    Alamat: z.string().min(1, "Alamat wajib diisi"),
    Provinsi: z.string().min(1, "Provinsi wajib diisi"),
    Kota: z.string().min(1, "Kota/Kabupaten wajib diisi"),
    Kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
    Kelurahan: z.string().min(1, "Kelurahan wajib diisi"),
    KodePos: z.string().min(5, "Kode pos minimal 5 digit"),
    NoTelp: z.string()
        .min(10, "Nomor telepon minimal 10 digit")
        .regex(/^08/, 'Nomor telepon harus diawali dengan 08'),
    Email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
    Password: z.string()
        .optional()
        .refine((val) => !val || (val.length >= 8 && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val) && /[a-z]/.test(val) && /[A-Z]/.test(val)), {
            message: "Kata sandi harus 8+ karakter, mengandung angka, karakter spesial, huruf besar & kecil"
        }),
    JenisBidangPelatihan: z.string().min(1, "Rumpun pelatihan wajib dipilih"),
    JenisPelatihan: z.string().min(1, "Spesifikasi pelatihan wajib diisi"),
    NamaPenanggungJawab: z.string().min(1, "Nama penanggung jawab wajib diisi"),
    NoTelpPenanggungJawab: z.string()
        .min(10, "Nomor telepon penanggung jawab minimal 10 digit")
        .regex(/^08/, "Nomor telepon penanggung jawab harus diawali dengan 08"),
    TempatTanggalLahir: z.string().min(1, "Tempat & tanggal lahir wajib diisi"),
    JenisKelamin: z.string().min(1, "Jenis kelamin wajib dipilih"),
    PendidikanTerakhir: z.string().min(1, "Pendidikan terakhir wajib dipilih"),

    Klasifikasi: z.string().optional(),
    SkorKlasifikasi: z.union([z.string(), z.number()]).optional(),
    TahunPenetapan: z.string().optional(),
    StatusUsaha: z.string().optional(),
    StatusPelatihan: z.string().optional(),
    BidangPelatihan: z.string().optional(),
    IsLpk: z.string().min(1, "Status LPK wajib dipilih"),
    Status: z.string().optional(),
    create_at: z.string().optional(),
    update_at: z.string().optional(),
});

export default function CompleteProfilePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [loading, setLoading] = useState(true);

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

    const [profileId, setProfileId] = useState<string | number | null>(null);

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
            NamaPpmkp: "",
            StatusKepemilikan: "Perserorangan",
            Nib: "",
            Alamat: "",
            Provinsi: "",
            Kota: "",
            Kecamatan: "",
            Kelurahan: "",
            KodePos: "",
            NoTelp: "",
            Email: "",
            Password: "",
            JenisBidangPelatihan: "",
            JenisPelatihan: "",
            NamaPenanggungJawab: "",
            NoTelpPenanggungJawab: "",
            TempatTanggalLahir: "",
            JenisKelamin: "",
            PendidikanTerakhir: "",

            BidangPelatihan: "",
            IsLpk: "",
            Status: "",
            create_at: "",
            update_at: ""
        },
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = Cookies.get('XSRF091');
                if (!token) {
                    router.push('/p2mkp/login');
                    return;
                }

                const response = await axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_jwt`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    const data = response.data.data || response.data;
                    setProfileId(data.IdPpmkp || data.id_p2mkp || data.id);
                    form.reset({
                        NamaPpmkp: data.nama_ppmkp,
                        StatusKepemilikan: data.StatusKepemilikan || data.status_kepemilikan || "Perserorangan",
                        Nib: data.Nib || data.nib || "",
                        Alamat: data.Alamat || data.alamat || "",
                        Provinsi: data.Provinsi || data.provinsi || "",
                        Kota: data.Kota || data.kota || "",
                        Kecamatan: data.Kecamatan || data.kecamatan || "",
                        Kelurahan: data.Kelurahan || data.kelurahan || "",
                        KodePos: data.KodePos || data.kode_pos || "",
                        NoTelp: data.NoTelp || data.no_telp || "",
                        Email: data.Email || data.email || "",
                        JenisBidangPelatihan: data.JenisBidangPelatihan || data.jenis_bidang_pelatihan || "",
                        JenisPelatihan: data.JenisPelatihan || data.jenis_pelatihan || "",
                        NamaPenanggungJawab: data.NamaPenanggungJawab || data.nama_penanggung_jawab || "",
                        NoTelpPenanggungJawab: data.NoTelpPenanggungJawab || data.no_telp_penanggung_jawab || "",
                        TempatTanggalLahir: data.TempatTanggalLahir || data.tempat_tanggal_lahir || "",
                        JenisKelamin: data.JenisKelamin || data.jenis_kelamin || "",
                        PendidikanTerakhir: data.PendidikanTerakhir || data.pendidikan_terakhir || "",
                        BidangPelatihan: data.BidangPelatihan || data.bidang_pelatihan || "",
                        IsLpk: data.IsLpk || data.is_lpk || "",
                        create_at: data.create_at || "",
                        update_at: data.update_at || ""
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [router, form]);

    const { data: rumpunPelatihan, loading: loadingRumpun } = useFetchDataRumpunPelatihan();

    const watchedJenis = form.watch("JenisBidangPelatihan");
    const watchedBidang = form.watch("BidangPelatihan");

    useEffect(() => {
        if (!loadingRumpun && rumpunPelatihan.length > 0) {
            // Check if watchedJenis is an ID and convert to name
            const matchedJenis = rumpunPelatihan.find(r => String(r.id_rumpun_pelatihan) === String(watchedJenis));
            if (matchedJenis) {
                const targetName = matchedJenis.name || matchedJenis.nama_rumpun_pelatihan || "";
                form.setValue("JenisBidangPelatihan", targetName);
            }

            // Check if watchedBidang is an ID and convert to name
            const matchedBidang = rumpunPelatihan.find(r => String(r.id_rumpun_pelatihan) === String(watchedBidang));
            if (matchedBidang) {
                const targetName = matchedBidang.name || matchedBidang.nama_rumpun_pelatihan || "";
                form.setValue("BidangPelatihan", targetName);
            }
        }
    }, [loadingRumpun, rumpunPelatihan, watchedJenis, watchedBidang, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const token = Cookies.get('XSRF091');
            if (!token) {
                router.push('/p2mkp/login');
                return;
            }

            if (!profileId) {
                showAlert(
                    'System Error',
                    'ID Profil tidak ditemukan. Silakan refresh halaman.',
                    'error'
                );
                return;
            }

            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value === undefined || value === null || value === "") return;

                formData.append(key, String(value));
            });

            const response = await axios.put(`${elautBaseUrl}/p2mkp/update_p2mkp?id=${profileId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                showAlert(
                    'Profil Terupdate',
                    'Seluruh perubahan data profil Anda telah disimpan ke server pusat.',
                    'success'
                );
                setTimeout(() => {
                    router.push('/p2mkp/dashboard');
                }, 1500);
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            showAlert(
                'Operation Failed',
                error.response?.data?.message || 'Gagal sinkronisasi data profil.',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const onInvalid = (errors: any) => {
        const values = form.getValues();
        const isEmpty = !values.NamaPpmkp && !values.Alamat && !values.NoTelp && !values.Email;

        if (isEmpty) {
            showAlert(
                'Data Masih Kosong',
                'Silakan lengkapi informasi profil Anda terlebih dahulu.',
                'warning'
            );
        } else {
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
        <DashboardLayout>
            <div className="relative overflow-hidden">
                {/* Background Ambient Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/2 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto space-y-16 pb-32 relative z-10"
                >
                    <div className="space-y-6 pt-6">
                        <div className="flex items-center gap-4">
                            <span className="h-[2px] w-12 bg-blue-500/50 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Gerbang Registrasi</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-white">
                            Lengkapi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">Profil</span>
                        </h1>
                        <p className="text-gray-500 text-lg max-w-3xl font-medium leading-relaxed italic opacity-80 mt-6">
                            Mohon lengkapi parameter kredensial lembaga dan otorisasi penanggung jawab untuk finalisasi sertifikasi standarisasi P2MKP.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-10">
                            {/* Section 1: Data Umum Kelembagaan */}
                            <FormCard
                                icon={<FiBriefcase />}
                                title="Informasi Kelembagaan"
                                subtitle="Identitas inti dan legalitas lembaga atau usaha"
                                color="blue"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormFieldItem label="Nama Lembaga/Usaha" name="NamaPpmkp" control={form.control} placeholder="Masukkan Nama Resmi..." icon={<FiBriefcase />} />
                                    <FormField
                                        control={form.control}
                                        name="StatusKepemilikan"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Status Kepemilikan</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                            <SelectValue placeholder="Pilih Status..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                                                        {['Koperasi',
                                                            'BUMN',
                                                            'Persero',
                                                            'Perusahaan Umum',
                                                            'Badan Usaha Milik Swasta',
                                                            'Perserorangan',].map(val => (
                                                                <SelectItem key={val} value={val} className="hover:bg-blue-600/20 rounded-lg py-3 cursor-pointer">{val}</SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormFieldItem label="Nomor Induk Berusaha (NIB)" name="Nib" control={form.control} placeholder="Masukkan Kode NIB..." icon={<FiFileText />} />
                                    <FormFieldItem label="Email Resmi" name="Email" control={form.control} placeholder="admin@p2mkp.go.id" icon={<FiMail />} type="email" />
                                    <FormFieldItem label="Ubah Kata Sandi" name="Password" control={form.control} placeholder="Kosongkan jika tidak diubah..." icon={<FiGlobe />} type="password" />
                                    <FormFieldItem label="Kontak Telepon" name="NoTelp" control={form.control} placeholder="08XXXXXXXXXX" icon={<FiPhone />} />
                                    <FormField
                                        control={form.control}
                                        name="IsLpk"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Apakah Lembaga LPK?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                            <SelectValue placeholder="Konfirmasi LPK..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                                                        <SelectItem value="Ya" className="hover:bg-blue-600/20 rounded-lg py-3 cursor-pointer">Ya, Terdaftar LPK</SelectItem>
                                                        <SelectItem value="Tidak" className="hover:bg-blue-600/20 rounded-lg py-3 cursor-pointer">Tidak</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </FormCard>

                            {/* Section 2: Alamat */}
                            <FormCard
                                icon={<FiMapPin />}
                                title="Lokasi Operasional"
                                subtitle="Koordinat dan alamat fisik kantor pusat"
                                color="indigo"
                            >
                                <div className="space-y-8">
                                    <FormFieldItem label="Alamat Spesifik" name="Alamat" control={form.control} placeholder="Jalan, No, RT/RW..." icon={<FiMapPin />} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <FormFieldItem label="Provinsi" name="Provinsi" control={form.control} placeholder="Nama Provinsi..." />
                                        <FormFieldItem label="Kota/Kabupaten" name="Kota" control={form.control} placeholder="Nama Kota..." />
                                        <FormFieldItem label="Kecamatan" name="Kecamatan" control={form.control} placeholder="Kecamatan..." />
                                        <FormFieldItem label="Kelurahan" name="Kelurahan" control={form.control} placeholder="Kelurahan..." />
                                        <FormFieldItem label="Kode Pos" name="KodePos" control={form.control} placeholder="5 Digit..." maxlength={5} />
                                    </div>
                                </div>
                            </FormCard>

                            {/* Section 3: Bidang Pelatihan */}
                            <FormCard
                                icon={<FiActivity />}
                                title="Spesialisasi Pelatihan"
                                subtitle="Cakupan rumpun dan jenis kompetensi"
                                color="cyan"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField
                                        control={form.control}
                                        name="JenisBidangPelatihan"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Rumpun Utama</FormLabel>
                                                <Select
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        form.setValue("BidangPelatihan", val, { shouldValidate: true });
                                                    }}
                                                    value={field.value || ""}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                            <SelectValue placeholder={loadingRumpun ? "Singkronisasi..." : "Pilih Rumpun..."} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-4xl">
                                                        {rumpunPelatihan?.map((item: any) => (
                                                            <SelectItem key={item.id_rumpun_pelatihan} value={item.name} className="hover:bg-cyan-600/20 rounded-lg py-3 cursor-pointer">
                                                                {item.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormFieldItem label="Spesifikasi Pelatihan" name="JenisPelatihan" control={form.control} placeholder="Contoh: Budidaya Ikan Nila..." icon={<FiAward />} />
                                </div>
                            </FormCard>

                            {/* Section 5: Penanggung Jawab */}
                            <FormCard
                                icon={<FiUser />}
                                title="Penanggung Jawab"
                                subtitle="Personal data penanggung jawab lembaga"
                                color="purple"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormFieldItem label="Nama Lengkap & Gelar" name="NamaPenanggungJawab" control={form.control} placeholder="Nama lengkap sesuai identitas..." icon={<FiUser />} />
                                    <FormFieldItem label="Kontak PIC" name="NoTelpPenanggungJawab" control={form.control} placeholder="WhatsApp/Telepon..." icon={<FiPhone />} />
                                    <FormFieldItem label="Tempat, Tanggal Lahir" name="TempatTanggalLahir" control={form.control} placeholder="Kota, HH-BB-TTTT" icon={<FiCalendar />} />
                                    <FormField
                                        control={form.control}
                                        name="JenisKelamin"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Jenis Kelamin</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                            <SelectValue placeholder="Pilih..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                                                        <SelectItem value="Laki-laki" className="hover:bg-purple-600/20 rounded-lg py-3 cursor-pointer">Laki-laki</SelectItem>
                                                        <SelectItem value="Perempuan" className="hover:bg-purple-600/20 rounded-lg py-3 cursor-pointer">Perempuan</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="PendidikanTerakhir"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Pendidikan Terakhir</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-300">
                                                            <SelectValue placeholder="Kualifikasi..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl rounded-2xl">
                                                        {['SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3', 'Lainnya'].map(val => (
                                                            <SelectItem key={val} value={val} className="hover:bg-purple-600/20 rounded-lg py-3 cursor-pointer">{val}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </FormCard>

                            <div className="pt-5 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="group/save relative w-full md:w-auto min-w-[330px] px-5 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-[2rem] font-black tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 text-sm disabled:opacity-50 overflow-hidden"
                                >
                                    {isSubmitting ? (
                                        <HashLoader color="#fff" size={24} />
                                    ) : (
                                        <>
                                            <FiSave size={20} className="group-hover:translate-y-[-2px] transition-transform" />
                                            SIMPAN PERUBAHAN PROFIL
                                        </>
                                    )}
                                    <div className="absolute inset-0 w-12 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover/save:translate-x-[600%] transition-transform duration-1000" />
                                </button>
                            </div>
                        </form>
                    </Form>
                </motion.div>
            </div>

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
        </DashboardLayout>
    );
}



// Premium Form Card Container
function FormCard({ icon, title, subtitle, children, color }: any) {
    const colors: any = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group p-8 md:p-12 rounded-[3.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 shadow-2xl space-y-12 relative overflow-hidden transition-all duration-700 hover:border-white/10"
        >
            <div className={`absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <div className="text-9xl">{icon}</div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl border ${colors[color]}`}>
                        {icon}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-calsans tracking-tight text-white">{title}</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

// Reusable Form Field Item
function FormFieldItem({ label, name, control, placeholder, icon, type = "text", ...props }: any) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black italic text-gray-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                        {label}
                    </FormLabel>
                    <FormControl>
                        <div className="relative group/input">
                            {icon && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-all duration-300 z-10">{icon}</span>}
                            <Input
                                placeholder={placeholder}
                                type={type}
                                {...field}
                                {...props}
                                className={`w-full ${icon ? 'pl-14' : 'pl-6'} pr-6 bg-white/[0.03] border border-white/10 rounded-[1.25rem] text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all duration-300 text-gray-200 placeholder:text-gray-600 h-14 italic font-medium group-hover/input:border-white/20`}
                            />
                        </div>
                    </FormControl>
                    <FormMessage className="text-[9px] uppercase font-bold text-rose-500/80 tracking-widest pl-1 mt-1" />
                </FormItem>
            )}
        />
    );
}

// File Input Field Item
function FormFieldFileItem({ label, name, control, icon, ...props }: any) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">{label}</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-3">
                            <div className="relative group/input flex-1">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-colors z-10">
                                    {icon}
                                </div>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        onChange(file);
                                    }}
                                    {...fieldProps}
                                    className="hidden"
                                    id={`file-upload-${name}`}
                                />
                                <label
                                    htmlFor={`file-upload-${name}`}
                                    className={`w-full pl-12 pr-5 py-4 bg-white/5 border border-dashed rounded-2xl text-sm transition-all cursor-pointer flex items-center h-14 overflow-hidden ${value ? 'border-blue-500/50 bg-blue-500/10 shadow-inner' : 'border-white/10 hover:border-blue-500/50'}`}
                                >
                                    <span className={`truncate ${value ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                                        {value instanceof File
                                            ? value.name
                                            : (typeof value === 'string' && value
                                                ? value.split('/').pop()
                                                : 'Unggah Dokumen...')}
                                    </span>
                                </label>
                            </div>

                            {typeof value === 'string' && value && (
                                <a
                                    href={value.startsWith('http') ? value : `${elautBaseUrl}/storage/${value}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-14 w-14 shrink-0 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-500/10 group"
                                    title="Lihat Dokumen Saat Ini"
                                >
                                    <FiEye size={20} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage className="text-rose-400 text-[10px] font-bold mt-1" />
                </FormItem>
            )}
        />
    );
}
