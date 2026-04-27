'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
    FiX,
    FiFileText,
    FiUploadCloud,
    FiArrowLeft,
    FiShield,
    FiSave,
    FiCheckCircle,
    FiEdit,
    FiEye
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../DashboardLayout';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { elautBaseUrl } from '@/constants/urls';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    useFormField,
} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { FiInfo } from 'react-icons/fi';
import { HashLoader } from 'react-spinners';
import Toast from '@/commons/Toast';

const pdfSchema = z.string()
    .min(1, "Dokumen wajib diunggah")
    .refine((val) => val.toLowerCase().endsWith('.pdf'), {
        message: "Hanya format PDF yang diperbolehkan"
    });

const formSchema = z.object({
    DokumenIdentifikasiPemilik: pdfSchema,
    DokumenAsesmentMandiri: pdfSchema,
    DokumentSuratPernyataan: pdfSchema,
    DokumenKeteranganUsaha: pdfSchema,
    DokumenAfiliasiParpol: pdfSchema,
    DokumenRekomendasiDinas: pdfSchema,
    DokumenPermohonanPembentukan: pdfSchema,
});

export default function PengajuanPenetapanPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [alertConfig, setAlertConfig] = React.useState<{
        isOpen: boolean;
        title: string;
        description: string;
        type: 'success' | 'error' | 'warning';
        onConfirm?: () => void;
        showCancel?: boolean;
    }>({
        isOpen: false,
        title: '',
        description: '',
        type: 'warning',
        showCancel: false
    });

    const showAlert = (title: string, description: string, type: 'success' | 'error' | 'warning', onConfirm?: () => void, showCancel?: boolean) => {
        setAlertConfig({ isOpen: true, title, description, type, onConfirm, showCancel });
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
            DokumenIdentifikasiPemilik: '',
            DokumenAsesmentMandiri: '',
            DokumentSuratPernyataan: '',
            DokumenKeteranganUsaha: '',
            DokumenAfiliasiParpol: '',
            DokumenRekomendasiDinas: '',
            DokumenPermohonanPembentukan: '',
        },
    });

    const [p2mkpData, setP2mkpData] = useState<any>(null);

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
                    setP2mkpData(data);

                    form.reset({
                        DokumenIdentifikasiPemilik: data.dokumen_identifikasi_pemilik || "",
                        DokumenAsesmentMandiri: data.dokumen_asesment_mandiri || "",
                        DokumentSuratPernyataan: data.dokument_surat_pernyataan || "",
                        DokumenKeteranganUsaha: data.dokumen_keterangan_usaha || "",
                        DokumenAfiliasiParpol: data.dokumen_afiliasi_parpol || "",
                        DokumenRekomendasiDinas: data.dokumen_rekomendasi_dinas || "",
                        DokumenPermohonanPembentukan: data.dokumen_permohonan_pembentukan || "",
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

    const handleLogout = () => {
        Cookies.remove('XSRF091');
        Cookies.remove('Access');
        router.push('/p2mkp/login');
    };



    async function onSubmit(values: z.infer<typeof formSchema>) {
        showAlert(
            "Konfirmasi Pengajuan",
            "Penetapan Hanya diajukan sekali, pastikan dokumen yang telah diupload sudah sesuai ketentuan dan lengkap, pastikan juga profile lembaga sudah sesuai dan edit kembali pada Profile Lembaga apabila terdapat penyesuaian.",
            "warning",
            () => handleConfirmSubmit(values),
            true
        );
    }

    async function handleConfirmSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const token = Cookies.get('XSRF091');
            if (!token) {
                router.push('/p2mkp/login');
                return;
            }

            const payload = {
                id_p2mkp: p2mkpData?.IdPpmkp || p2mkpData?.id_p2mkp || p2mkpData?.id,
                tahun_penetapan: new Date().getFullYear().toString(),
                status_usaha: p2mkpData?.StatusUsaha || p2mkpData?.status_usaha || "Aktif",
                status_peltihan: p2mkpData?.StatusPelatihan || p2mkpData?.status_peltihan || "Berjalan",
                is_lpk: p2mkpData?.IsLpk || p2mkpData?.is_lpk || "Ya",
                status: "Diajukan"
            };

            const response = await axios.post(`${elautBaseUrl}/p2mkp/create_pengjuan_penetapan_p2mkp`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200 || response.status === 201) {
                Toast.fire({
                    icon: 'success',
                    title: 'Berhasil Diajukan',
                    text: 'Pengajuan penetapan P2MKP Anda telah berhasil dikirim.'
                });
                router.push('/p2mkp/dashboard/penetapan');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            showAlert(
                'Operation Failed',
                error.response?.data?.message || 'Gagal melakukan pengajuan penetapan.',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const onInvalid = (errors: any) => {
        const values = form.getValues();
        const isEmpty = !values.DokumenIdentifikasiPemilik && !values.DokumenAsesmentMandiri && !values.DokumentSuratPernyataan;

        if (isEmpty) {
            showAlert(
                'Data Masih Kosong',
                'Silakan lengkapi seluruh dokumen instrument yang diperlukan.',
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <HashLoader color="#3b82f6" size={50} />
                <p className="mt-6 text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Loading Secure Form...</p>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex-1 overflow-y-auto pb-24 pt-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto space-y-12"
                >
                    <div className="flex items-center gap-6">
                        <Link href="/p2mkp/dashboard/penetapan">
                            <button className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 transition-all active:scale-95 group shadow-sm">
                                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <div className="space-y-1">
                            <h1 className="text-3xl leading-none md:text-4xl font-bold text-slate-900">Form Pengajuan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Penetapan P2MKP</span></h1>
                            <p className="text-slate-500 text-sm font-medium italic leading-relaxed">Form pengajuan standarisasi dan verifikasi instrumen P2MKP Terpadu.</p>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-10">
                            {/* Form Container */}
                            <div className="p-8 md:p-12 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-12 relative overflow-hidden transition-all duration-700 hover:border-slate-300">

                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                                        <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                            <FiFileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">Dokumen Persyaratan</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Lengkapi dan Upload Dokumen Permohonan Penetapan P2MKP dan Ikuti Format sebagaimana tercantum pada link.</p>
                                        </div>
                                    </div>



                                        <div className="space-y-8">

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <FileUploadField name="DokumenIdentifikasiPemilik" label="Identifikasi Calon P2MKP" />
                                                <FileUploadField name="DokumenAsesmentMandiri" label="Indentifikasi Asesmen Mandiri" />
                                                <FileUploadField name="DokumentSuratPernyataan" label="Surat Pernyataan Calon P2MKP" />
                                                <FileUploadField name="DokumenKeteranganUsaha" label="Surat Legalitas Usaha" />
                                                <FileUploadField name="DokumenAfiliasiParpol" label="Surat Tidak Afiliasi Partai Politik" />
                                                <FileUploadField name="DokumenRekomendasiDinas" label="Surat Rekomendasi Dinas" />
                                                <FileUploadField name="DokumenPermohonanPembentukan" label="Surat Permohonan Pembentukan" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-slate-100">
                                        <div className="flex items-start gap-4 max-w-md">
                                            <FiShield className="text-emerald-500 mt-1 shrink-0" size={20} />
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                                Sistem verifikasi otomatis akan memeriksa integritas digital setiap aset dokumen yang diunggah. Pastikan file dalam format PDF/JPG yang jernih.
                                            </p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="group/btn relative w-full md:w-auto min-w-[300px] h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 overflow-hidden"
                                        >
                                            {isSubmitting ? (
                                                <HashLoader color="#fff" size={24} />
                                            ) : (
                                                <>
                                                    <FiSave size={20} className="group-hover:translate-x-1 transition-transform" />
                                                    AJUKAN PENETAPAN
                                                </>
                                            )}
                                            <div className="absolute inset-0 w-12 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[600%] transition-transform duration-1000" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </Form>
                </motion.div>
            </div>

            <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent className="bg-white border-slate-200 text-slate-900 font-sans shadow-xl rounded-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                {alertConfig.type === 'error' && <FiShield className="text-rose-500" />}
                                {alertConfig.type === 'warning' && <FiInfo className="text-amber-500" />}
                                {alertConfig.type === 'success' && <FiCheckCircle className="text-emerald-500" />}
                                {alertConfig.title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                                {alertConfig.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="border-t border-slate-100 pt-4">
                            {alertConfig.showCancel && (
                                <button
                                    onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                                    className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
                                >
                                    BATAL
                                </button>
                            )}
                            <AlertDialogAction
                                onClick={alertConfig.onConfirm}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 border-none rounded-xl"
                            >
                                {alertConfig.showCancel ? 'YA, LANJUTKAN' : 'MENGERTI'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}

// Premium File Upload Field
function FileUploadField({ name, label }: any) {
    const { watch, control } = useFormContext();
    const value = watch(name);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field: { value: fieldValue, onChange, ...fieldProps } }) => (
                <FormItem className="space-y-4">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{label}</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-3">
                            <div
                                className={`relative group/upload h-24 rounded-2xl border flex-1 transition-all flex items-center px-6 gap-4 overflow-hidden ${fieldValue ? 'border-blue-300 bg-blue-50' : 'border-dashed border-slate-300 bg-slate-50'} hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer`}
                            >
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            onChange(file.name);
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    id={`file-upload-${name}`}
                                    {...fieldProps}
                                />

                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${fieldValue ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-400 group-hover/upload:text-blue-500'}`}>
                                    <FiUploadCloud size={24} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {fieldValue ? (
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold truncate text-blue-700">
                                                {typeof fieldValue === 'string' && fieldValue.includes('/') ? fieldValue.split('/').pop() : fieldValue}
                                            </p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">BERHASIL DIUPLOAD</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-slate-500 group-hover/upload:text-blue-600 transition-colors">Upload Dokumen...</p>
                                            <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Max 10MB • PDF</p>
                                        </div>
                                    )}
                                </div>

                                {fieldValue && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-[8px] font-bold uppercase shadow-sm">
                                        <FiEdit size={10} /> EDITABLE
                                    </div>
                                )}
                            </div>

                            {typeof fieldValue === 'string' && fieldValue?.includes('elaut-bppsdm.kkp.go.id') && (
                                <a
                                    href={fieldValue.startsWith('http') ? fieldValue : `${elautBaseUrl}/storage/${fieldValue}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-24 w-16 shrink-0 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm group active:scale-95"
                                    title="View Document"
                                >
                                    <FiEye size={24} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage className="text-rose-500 text-[10px] font-bold mt-1" />
                </FormItem>
            )}
        />
    );
}


