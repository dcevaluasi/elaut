'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
    FiFileText,
    FiUploadCloud,
    FiArrowLeft,
    FiShield,
    FiSend,
    FiCheckCircle,
    FiEye,
    FiAlertTriangle,
    FiInfo,
    FiEdit,
} from 'react-icons/fi';
import { TbFileCertificate } from 'react-icons/tb';
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HashLoader } from 'react-spinners';

const fileOrStringSchema = z.any().refine(
    (val) => {
        if (!val) return false;
        if (val instanceof File) {
            return val.name.toLowerCase().endsWith('.pdf');
        }
        if (typeof val === 'string') {
            return val.trim().length > 0;
        }
        return false;
    },
    { message: "Dokumen wajib diunggah dalam format PDF" }
);

const formSchema = z.object({
    DokumenIdentifikasiPemilik: fileOrStringSchema,
    DokumenAsesmentMandiri: fileOrStringSchema,
    DokumentSuratPernyataan: fileOrStringSchema,
    DokumenKeteranganUsaha: fileOrStringSchema,
    DokumenAfiliasiParpol: fileOrStringSchema,
    DokumenRekomendasiDinas: fileOrStringSchema,
    DokumenPermohonanPembentukan: fileOrStringSchema,
});

const DOC_FIELDS = [
    {
        name: 'DokumenIdentifikasiPemilik',
        snakeKey: 'dokumen_identifikasi_pemilik',
        label: 'Identifikasi Calon P2MKP',
        desc: 'Dokumen identitas resmi pemilik/pengelola lembaga P2MKP',
        icon: '🪪',
    },
    {
        name: 'DokumenAsesmentMandiri',
        snakeKey: 'dokumen_asesment_mandiri',
        label: 'Asesmen Mandiri',
        desc: 'Formulir penilaian kompetensi mandiri sesuai standar KKNI',
        icon: '📋',
    },
    {
        name: 'DokumentSuratPernyataan',
        snakeKey: 'dokument_surat_pernyataan',
        label: 'Surat Pernyataan P2MKP',
        desc: 'Surat pernyataan kesanggupan dan kepatuhan terhadap regulasi',
        icon: '📜',
    },
    {
        name: 'DokumenKeteranganUsaha',
        snakeKey: 'dokumen_keterangan_usaha',
        label: 'Legalitas Usaha',
        desc: 'NIB, SIUP, atau dokumen legalitas usaha yang berlaku',
        icon: '🏢',
    },
    {
        name: 'DokumenAfiliasiParpol',
        snakeKey: 'dokumen_afiliasi_parpol',
        label: 'Surat Tidak Afiliasi Parpol',
        desc: 'Surat pernyataan tidak terafiliasi partai politik manapun',
        icon: '⚖️',
    },
    {
        name: 'DokumenRekomendasiDinas',
        snakeKey: 'dokumen_rekomendasi_dinas',
        label: 'Rekomendasi Dinas',
        desc: 'Surat rekomendasi dari Dinas Kelautan dan Perikanan setempat',
        icon: '🏛️',
    },
    {
        name: 'DokumenPermohonanPembentukan',
        snakeKey: 'dokumen_permohonan_pembentukan',
        label: 'Permohonan Pembentukan',
        desc: 'Surat permohonan resmi pembentukan lembaga P2MKP',
        icon: '📩',
    },
] as const;

export default function PengajuanPenetapanPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [p2mkpData, setP2mkpData] = useState<any>(null);
    const [existingPengajuan, setExistingPengajuan] = useState<any>(null);

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
                        errors[path] = { type: issue.code, message: issue.message };
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

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = Cookies.get('XSRF091');
                if (!token) {
                    router.push('/p2mkp/login');
                    return;
                }

                const response = await axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_jwt`, {
                    headers: { Authorization: `Bearer ${token}` }
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

                    // Fetch existing pengajuan penetapan entry if any
                    const idP2mkp = data.IdPpmkp || data.id_p2mkp || data.id;
                    if (idP2mkp) {
                        try {
                            const res = await axios.get(`${elautBaseUrl}/p2mkp/get_pengjuan_penetapan_p2mkp?id_p2mkp=${idP2mkp}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (res.status === 200) {
                                const resData = res.data.data || (Array.isArray(res.data) ? res.data : []);
                                const matched = resData.find((item: any) => String(item.id_Ppmkp) === String(idP2mkp));
                                if (matched) setExistingPengajuan(matched);
                            }
                        } catch (err) {
                            console.error('Error fetching pengajuan penetapan:', err);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [router, form]);

    // --- Progress tracking ---
    const allValues = form.watch();
    const uploadedCount = DOC_FIELDS.filter((f) => !!allValues[f.name as keyof typeof allValues]).length;
    const totalDocs = DOC_FIELDS.length;
    const progressPct = Math.round((uploadedCount / totalDocs) * 100);
    const progressColor = progressPct < 40 ? '#ef4444' : progressPct < 85 ? '#f59e0b' : '#10b981';

    async function onSubmit(values: z.infer<typeof formSchema>) {
        showAlert(
            "Konfirmasi Pengajuan",
            existingPengajuan
                ? "Anda akan memperbarui berkas dokumen pengajuan penetapan. Pastikan seluruh dokumen yang diunggah sudah benar."
                : "Pengajuan penetapan hanya dapat diajukan sekali. Pastikan seluruh dokumen yang diunggah telah sesuai ketentuan.",
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

            const idP2mkp = p2mkpData?.IdPpmkp || p2mkpData?.id_p2mkp || p2mkpData?.id;

            // 1. Upload/Update files to P2MKP master table via update_p2mkp multipart/form-data
            const formData = new FormData();
            DOC_FIELDS.forEach((fieldDef) => {
                const fieldValue = values[fieldDef.name as keyof typeof values];

                if (fieldValue instanceof File) {
                    formData.append(fieldDef.name, fieldValue);
                    formData.append(fieldDef.snakeKey, fieldValue);
                } else if (typeof fieldValue === 'string' && fieldValue) {
                    formData.append(fieldDef.name, fieldValue);
                    formData.append(fieldDef.snakeKey, fieldValue);
                }
            });

            if (idP2mkp) {
                await axios.put(`${elautBaseUrl}/p2mkp/update_p2mkp?id=${idP2mkp}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            // 2. Update existing pengajuan entry or create a new one
            const payload = {
                id_p2mkp: idP2mkp,
                tahun_penetapan: new Date().getFullYear().toString(),
                status_usaha: p2mkpData?.StatusUsaha || p2mkpData?.status_usaha || "Aktif",
                status_peltihan: p2mkpData?.StatusPelatihan || p2mkpData?.status_peltihan || "Berjalan",
                is_lpk: p2mkpData?.IsLpk || p2mkpData?.is_lpk || "Ya",
                status: "Diajukan"
            };

            let response;
            const existingId = existingPengajuan?.IdPengajuanPenetapanPpmkp || existingPengajuan?.id;

            if (existingId) {
                // Update existing pengajuan penetapan record back to "Diajukan" status
                response = await axios.put(`${elautBaseUrl}/p2mkp/update_pengjuan_penetapan_p2mkp?id=${existingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Create new pengajuan penetapan entry
                response = await axios.post(`${elautBaseUrl}/p2mkp/create_pengjuan_penetapan_p2mkp`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            if (response.status === 200 || response.status === 201) {
                await Swal.fire({
                    icon: 'success',
                    title: existingId ? 'Berkas Berhasil Diperbarui!' : 'Pengajuan Berhasil Dikirim!',
                    html: `<p style="color:#94a3b8;font-size:13px;line-height:1.6;">${
                        existingId
                            ? 'Dokumen perbaikan dan status pengajuan penetapan P2MKP Anda telah berhasil disinkronisasi ke server pusat.'
                            : 'Dokumen PDF persyaratan dan pengajuan penetapan P2MKP Anda telah berhasil diunggah ke server.'
                    }</p>`,
                    confirmButtonText: 'Lihat Status Penetapan',
                    confirmButtonColor: '#2563eb',
                    background: '#0f172a',
                    color: '#ffffff',
                    customClass: {
                        popup: 'rounded-3xl border border-white/10 shadow-2xl',
                        confirmButton: 'rounded-xl font-bold tracking-wider text-xs px-6 py-3',
                    }
                });
                router.push('/p2mkp/dashboard/penetapan');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            showAlert(
                'Pengajuan Gagal',
                error.response?.data?.message || 'Terjadi kesalahan saat menyimpan dokumen penetapan. Silakan coba kembali.',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const onInvalid = (errors: any) => {
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            const firstKey = errorKeys[0];
            const firstError = errors[firstKey];
            showAlert(
                'Dokumen Belum Lengkap',
                firstError?.message || 'Pastikan seluruh 7 dokumen persyaratan telah diunggah dalam format PDF.',
                'warning'
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <HashLoader color="#3b82f6" size={50} />
                <p className="mt-6 text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Memuat Formulir...</p>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex-1 overflow-y-auto pb-24 pt-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto space-y-8"
                >
                    {/* Header */}
                    <div className="flex items-center gap-5">
                        <Link href="/p2mkp/dashboard/penetapan">
                            <button className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 transition-all active:scale-95 group shadow-sm">
                                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <TbFileCertificate className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl leading-none font-black text-slate-900">
                                    {existingPengajuan ? 'Perbaiki / Update Dokumen' : 'Pengajuan'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Penetapan P2MKP</span>
                                </h1>
                                <p className="text-slate-500 text-xs font-medium mt-0.5">Lengkapi 7 dokumen persyaratan dalam format PDF</p>
                            </div>
                        </div>
                    </div>

                    {/* Notice for Perbaikan / Existing Submission */}
                    {existingPengajuan && ['perbaikan', 'ditolak', 'rejected'].includes((existingPengajuan.status || '').toLowerCase()) && (
                        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                            <FiAlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                            <div className="space-y-1">
                                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">
                                    Mode Perbaikan Berkas Penetapan
                                </h4>
                                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                    Anda sedang melakukan perbaikan dokumen pengajuan penetapan. Mengunggah dokumen baru akan secara otomatis memperbarui berkas di server dan mengembalikan status pengajuan menjadi <strong>"Diajukan"</strong> untuk diverifikasi ulang oleh tim Pusat.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Progress Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-slate-700">Kelengkapan Dokumen</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                                    {uploadedCount} dari {totalDocs} dokumen diunggah
                                </p>
                            </div>
                            <span className="text-3xl font-black" style={{ color: progressColor }}>{progressPct}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                style={{ backgroundColor: progressColor }}
                            />
                        </div>
                        <div className="flex items-center gap-6 flex-wrap pt-1">
                            {DOC_FIELDS.map((f) => {
                                const uploaded = !!allValues[f.name as keyof typeof allValues];
                                return (
                                    <div key={f.name} className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${uploaded ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                        <span className={`text-[9px] font-bold uppercase tracking-wide ${uploaded ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {f.label.split(' ').slice(0, 2).join(' ')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Info banner */}
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                        <FiInfo className="text-blue-500 mt-0.5 shrink-0" size={16} />
                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                            Pastikan seluruh dokumen sudah benar dan sesuai format sebelum mengirim. Setelah terkirim, tim verifikasi akan memproses dalam <strong>3–5 hari kerja</strong>.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                            {/* Document Grid */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                        <FiFileText size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-800">Dokumen Persyaratan</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Upload semua dokumen dalam format PDF · Maks 10MB per file · Klik kotak dokumen untuk mengedit/upload ulang</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {DOC_FIELDS.map((doc, idx) => (
                                        <FileUploadField
                                            key={doc.name}
                                            name={doc.name}
                                            label={doc.label}
                                            desc={doc.desc}
                                            emoji={doc.icon}
                                            index={idx + 1}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-5 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                <div className="flex items-start gap-3 max-w-sm">
                                    <FiShield className="text-emerald-500 mt-0.5 shrink-0" size={18} />
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                        Dokumen yang diunggah akan diverifikasi secara digital oleh sistem. Pastikan file PDF terbaca jelas dan tidak terenkripsi.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || uploadedCount < totalDocs}
                                    className="group/btn relative w-full md:w-auto min-w-[280px] h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden uppercase"
                                >
                                    {isSubmitting ? (
                                        <HashLoader color="#fff" size={20} />
                                    ) : (
                                        <>
                                            <FiSend size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                            {uploadedCount < totalDocs
                                                ? `Lengkapi ${totalDocs - uploadedCount} Dokumen Lagi`
                                                : existingPengajuan ? 'Simpan Perbaikan Dokumen' : 'Ajukan Penetapan'}
                                        </>
                                    )}
                                    <div className="absolute inset-0 w-10 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[600%] transition-transform duration-1000" />
                                </button>
                            </div>
                        </form>
                    </Form>
                </motion.div>
            </div>

            <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent className="bg-white border-slate-200 text-slate-900 font-sans shadow-xl rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-base font-black">
                            {alertConfig.type === 'error' && <FiAlertTriangle className="text-rose-500" />}
                            {alertConfig.type === 'warning' && <FiInfo className="text-amber-500" />}
                            {alertConfig.type === 'success' && <FiCheckCircle className="text-emerald-500" />}
                            {alertConfig.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 text-xs leading-relaxed">
                            {alertConfig.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="border-t border-slate-100 pt-4 gap-2">
                        {alertConfig.showCancel && (
                            <button
                                onClick={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                            >
                                BATAL
                            </button>
                        )}
                        <AlertDialogAction
                            onClick={alertConfig.onConfirm}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 text-xs border-none rounded-xl"
                        >
                            {alertConfig.showCancel ? 'YA, SIMPAN & KIRIM' : 'MENGERTI'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}

// Premium File Upload Field
function FileUploadField({ name, label, desc, emoji, index }: any) {
    const { watch, control } = useFormContext();
    const value = watch(name);
    const isUploaded = !!value;

    const getDisplayName = (val: any) => {
        if (!val) return '';
        if (val instanceof File) return val.name;
        if (typeof val === 'string') return val.split('/').pop() || val;
        return '';
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field: { value: fieldValue, onChange, ...fieldProps } }) => (
                <FormItem className="space-y-0">
                    <div
                        className={`relative group/upload rounded-2xl border-2 transition-all overflow-hidden cursor-pointer ${isUploaded
                            ? 'border-emerald-300 bg-emerald-50/50 hover:border-blue-400 hover:bg-blue-50/50'
                            : 'border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30'
                            }`}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    onChange(file); // Stores actual File object in react-hook-form
                                }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            {...fieldProps}
                        />

                        <div className="p-4 flex items-start gap-4">
                            {/* Status indicator + emoji */}
                            <div className={`relative w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-xl transition-all ${isUploaded ? 'bg-emerald-100 group-hover/upload:bg-blue-100' : 'bg-white border border-slate-200 group-hover/upload:border-blue-200'}`}>
                                {isUploaded
                                    ? <FiCheckCircle className="text-emerald-500 group-hover/upload:text-blue-600 transition-colors" size={22} />
                                    : <span>{emoji}</span>
                                }
                                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-black flex items-center justify-center">
                                    {index}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                                <FormLabel className="text-xs font-black text-slate-700 leading-none cursor-pointer">
                                    {label}
                                </FormLabel>
                                <p className="text-[10px] text-slate-400 font-medium mt-1 leading-snug line-clamp-2">{desc}</p>

                                {isUploaded ? (
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center gap-1 min-w-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wide truncate max-w-[140px]">
                                                {getDisplayName(fieldValue)}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md group-hover/upload:bg-blue-600 group-hover/upload:text-white transition-all">
                                            <FiEdit size={9} /> Upload Ulang
                                        </span>
                                    </div>
                                ) : (
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <FiUploadCloud className="text-slate-400 group-hover/upload:text-blue-500 transition-colors" size={12} />
                                        <p className="text-[10px] text-slate-400 group-hover/upload:text-blue-500 font-bold uppercase tracking-wide transition-colors">
                                            Klik untuk upload PDF
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* View link if from server */}
                            {typeof fieldValue === 'string' && fieldValue?.length > 0 && (
                                <a
                                    href={fieldValue.startsWith('http') ? fieldValue : `${elautBaseUrl}/storage/${fieldValue}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="z-30 relative shrink-0 w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                    title="Lihat Dokumen Saat Ini"
                                >
                                    <FiEye size={14} />
                                </a>
                            )}
                        </div>

                        {/* Top right badges */}
                        {isUploaded && (
                            <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[8px] font-black uppercase shadow-sm group-hover/upload:bg-blue-700 transition-colors">
                                    <FiEdit size={9} /> Upload Ulang
                                </span>
                            </div>
                        )}
                    </div>
                    <FormMessage className="text-rose-500 text-[10px] font-bold mt-1.5 pl-1" />
                </FormItem>
            )}
        />
    );
}
