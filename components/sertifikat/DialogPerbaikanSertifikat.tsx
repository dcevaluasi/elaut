'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPelatihan } from '@/types/user';
import { PelatihanMasyarakat } from '@/types/product';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import {
    FiX,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiUser,
    FiBookOpen,
    FiSend,
    FiEdit3,
    FiHelpCircle,
    FiCheck,
    FiClock
} from 'react-icons/fi';
import { RiShieldFlashLine, RiErrorWarningLine } from 'react-icons/ri';

interface DialogPerbaikanSertifikatProps {
    isOpen: boolean;
    onClose: () => void;
    data: UserPelatihan | null;
    dataPelatihan?: PelatihanMasyarakat | null;
    onSuccess?: (data: any) => void;
}

const PILIHAN_SUDAH_TERBIT = [
    { id: 'salah_nama', label: 'Salah Nama' },
    { id: 'salah_tgl_lahir', label: 'Salah Tanggal Lahir' },
    { id: 'salah_institusi', label: 'Salah Institusi' },
    { id: 'tidak_ada_nama', label: 'Tidak ada Nama' },
    { id: 'tidak_ada_tgl_lahir', label: 'Tidak ada Tanggal Lahir' },
    { id: 'tidak_ada_institusi', label: 'Tidak ada Institusi' },
];

export const DialogPerbaikanSertifikat: React.FC<DialogPerbaikanSertifikatProps> = ({
    isOpen,
    onClose,
    data,
    dataPelatihan,
    onSuccess,
}) => {
    const [jenisPerbaikan, setJenisPerbaikan] = useState<'Belum Terbit' | 'Sudah Terbit' | 'Lainnya'>('Sudah Terbit');
    const [perbaikanSudahTerbit, setPerbaikanSudahTerbit] = useState<string[]>([]);
    const [perbaikanLainnya, setPerbaikanLainnya] = useState('');
    const [perbaikanSeharusnya, setPerbaikanSeharusnya] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [ticketNumber, setTicketNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!isOpen || !data) return null;

    const noSertifikat = data.NoRegistrasi || data.NoSertifikat || '-';
    const namaUser = data.Nama || '-';
    const namaPelatihan = data.NamaPelatihan || dataPelatihan?.NamaPelatihan || '-';
    const kodePelatihan = (data as any)?.KodePelatihan || dataPelatihan?.KodePelatihan || '';

    const handleCheckboxToggle = (label: string) => {
        if (perbaikanSudahTerbit.includes(label)) {
            setPerbaikanSudahTerbit(perbaikanSudahTerbit.filter((item) => item !== label));
        } else {
            setPerbaikanSudahTerbit([...perbaikanSudahTerbit, label]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (jenisPerbaikan === 'Sudah Terbit' && perbaikanSudahTerbit.length === 0) {
            setErrorMessage('Silakan pilih setidaknya satu jenis kesalahan pada sertifikat.');
            return;
        }

        if (jenisPerbaikan === 'Lainnya' && !perbaikanLainnya.trim()) {
            setErrorMessage('Silakan tuliskan detail jenis kesalahan pada kolom Lainnya.');
            return;
        }

        if (!perbaikanSeharusnya.trim()) {
            setErrorMessage('Silakan tuliskan data/informasi yang seharusnya benar.');
            return;
        }

        setIsSubmitting(true);

        try {
            const db = getFirestore(firebaseApp);
            const newDocRef = doc(collection(db, 'perbaikan-sertifikat'));
            const generatedTicket = `REV-${Date.now().toString().slice(-6)}`;

            const payload = {
                idDoc: newDocRef.id,
                TiketPerbaikan: generatedTicket,
                NoSertifikat: noSertifikat,
                Nama: namaUser,
                IdUsers: data.IdUsers || 0,
                IdUserPelatihan: data.IdUserPelatihan || 0,
                IdPelatihan: data.IdPelatihan || 0,
                KodePelatihan: kodePelatihan,
                NamaPelatihan: namaPelatihan,
                JenisPerbaikan: jenisPerbaikan,
                PerbaikanSudahTerbit: jenisPerbaikan === 'Sudah Terbit' ? perbaikanSudahTerbit : [],
                PerbaikanLainnya: jenisPerbaikan === 'Lainnya' ? perbaikanLainnya.trim() : '',
                PerbaikanSeharusnya: perbaikanSeharusnya.trim(),
                Status: 'Pending',
                CreatedAt: new Date().toISOString(),
                UpdatedAt: new Date().toISOString(),
            };

            await setDoc(newDocRef, payload);
            setTicketNumber(generatedTicket);
            setSubmitSuccess(true);
            onSuccess?.(payload);
        } catch (err: any) {
            console.error('Error submitting certificate revision request:', err);
            setErrorMessage(
                err?.message || 'Terjadi kesalahan saat mengumpulkan permohonan. Silakan coba lagi nanti.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetAndClose = () => {
        setSubmitSuccess(false);
        setJenisPerbaikan('Sudah Terbit');
        setPerbaikanSudahTerbit([]);
        setPerbaikanLainnya('');
        setPerbaikanSeharusnya('');
        setErrorMessage(null);
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-2xl bg-[#0b1120] border border-white/10 rounded-3xl shadow-2xl overflow-hidden font-jakarta text-white my-8"
                >
                    {/* Top Accent Gradient Bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                <RiShieldFlashLine className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold font-calsans text-white">
                                    Pengajuan Perbaikan Sertifikat
                                </h2>
                                <p className="text-xs text-gray-400">
                                    Laporkan kesalahan atau perbaikan sertifikat elektronik E-LAUT
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleResetAndClose}
                            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {submitSuccess ? (
                        /* SUCCESS STATE VIEW */
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
                                <FiCheckCircle className="w-10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                    <FiClock className="w-3.5 h-3.5" /> Tiket #{ticketNumber}
                                </span>
                                <h3 className="text-2xl font-bold font-calsans text-white">
                                    Permohonan Berhasil Dikirim!
                                </h3>
                                <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                                    Laporan perbaikan sertifikat Anda telah tersimpan dengan status{' '}
                                    <span className="font-bold text-amber-400">Pending</span>. Tim E-LAUT akan segera meninjau dan memproses pembaruan sertifikat Anda.
                                </p>
                            </div>

                            {/* Summary Card */}
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-left space-y-2 text-xs">
                                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                                    <span className="text-gray-400">No. STTPL:</span>
                                    <span className="font-mono font-bold text-cyan-300">{noSertifikat}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                                    <span className="text-gray-400">Nama Peserta:</span>
                                    <span className="font-semibold text-white">{namaUser}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                                    <span className="text-gray-400">Jenis Perbaikan:</span>
                                    <span className="font-semibold text-amber-300">{jenisPerbaikan}</span>
                                </div>
                                {perbaikanSudahTerbit.length > 0 && (
                                    <div className="flex justify-between border-b border-white/[0.04] pb-2">
                                        <span className="text-gray-400">Detail Kesalahan:</span>
                                        <span className="font-semibold text-rose-300 text-right">
                                            {perbaikanSudahTerbit.join(', ')}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-400 block mb-1">Perbaikan Seharusnya:</span>
                                    <p className="text-gray-200 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.05] italic">
                                        &ldquo;{perbaikanSeharusnya}&rdquo;
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleResetAndClose}
                                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-all shadow-lg shadow-blue-600/30"
                            >
                                Selesai & Tutup
                            </button>
                        </div>
                    ) : (
                        /* FORM VIEW */
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            {/* Alert Error if any */}
                            {errorMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs text-rose-300"
                                >
                                    <RiErrorWarningLine className="w-5 h-5 flex-shrink-0 text-rose-400" />
                                    <span>{errorMessage}</span>
                                </motion.div>
                            )}

                            {/* Section 1: Data Sertifikat (Otomatis) */}
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <FiFileText className="text-blue-400" />
                                    <span>Data Sertifikat (Otomatis)</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                        <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                                            No. STTPL / Registrasi
                                        </span>
                                        <span className="font-mono font-bold text-cyan-300 text-sm">{noSertifikat}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                        <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                                            Nama Peserta
                                        </span>
                                        <span className="font-semibold text-white text-sm">{namaUser}</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs">
                                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-0.5">
                                        Nama Pelatihan
                                    </span>
                                    <span className="font-semibold text-gray-200">{namaPelatihan}</span>
                                </div>
                            </div>

                            {/* Section 2: Pilihan Jenis Perbaikan */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                                    Pilih Jenis Perbaikan <span className="text-rose-400">*</span>
                                </label>

                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    {[
                                        { id: 'Sudah Terbit', label: 'Sudah Terbit', desc: 'Sertifikat ada kesalahan' },
                                        { id: 'Belum Terbit', label: 'Belum Terbit', desc: 'Belum bisa diunduh' },
                                        { id: 'Lainnya', label: 'Lainnya', desc: 'Permasalahan lain' },
                                    ].map((opt) => {
                                        const selected = jenisPerbaikan === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => {
                                                    setJenisPerbaikan(opt.id as any);
                                                    setErrorMessage(null);
                                                }}
                                                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                                                    selected
                                                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-2 ring-amber-500/20'
                                                        : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.06]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-white">{opt.label}</span>
                                                    {selected && (
                                                        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-slate-950">
                                                            <FiCheck className="w-3 h-3 stroke-[3]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-400 block">{opt.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 3: Sub-Options for 'Sudah Terbit' */}
                            <AnimatePresence mode="wait">
                                {jenisPerbaikan === 'Sudah Terbit' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 pt-1"
                                    >
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                                            Detail Kesalahan pada Sertifikat <span className="text-rose-400">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {PILIHAN_SUDAH_TERBIT.map((item) => {
                                                const checked = perbaikanSudahTerbit.includes(item.label);
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => handleCheckboxToggle(item.label)}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium transition-all text-left ${
                                                            checked
                                                                ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                                                                : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                                                                checked
                                                                    ? 'bg-rose-500 border-rose-400 text-white'
                                                                    : 'border-white/20 bg-white/5'
                                                            }`}
                                                        >
                                                            {checked && <FiCheck className="w-3 h-3 stroke-[3]" />}
                                                        </div>
                                                        <span>{item.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {jenisPerbaikan === 'Lainnya' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 pt-1"
                                    >
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                                            Tuliskan Jenis Perbaikan / Permasalahan <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={perbaikanLainnya}
                                            onChange={(e) => setPerbaikanLainnya(e.target.value)}
                                            placeholder="Contoh: Format nomor registrasi tidak valid, dsb."
                                            className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Section 4: Data Seharusnya */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                                    Perbaikan Seharusnya / Data yang Benar <span className="text-rose-400">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={perbaikanSeharusnya}
                                    onChange={(e) => setPerbaikanSeharusnya(e.target.value)}
                                    placeholder="Tuliskan data yang benar secara mendetail (Contoh: Nama seharusnya: Alief Nugroho, Tanggal Lahir: 15 Agustus 1998, Instansi: BPPSDM KP)"
                                    className="w-full p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all leading-relaxed resize-none"
                                />
                                <span className="text-[10px] text-gray-500 block">
                                    Gunakan keterangan yang jelas agar memudahkan verifikasi oleh admin.
                                </span>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleResetAndClose}
                                    className="h-12 px-5 rounded-2xl bg-white/[0.05] border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/10 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                            <span>Mengirim Permohonan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSend className="w-4 h-4" />
                                            <span>Kirim Pengajuan Perbaikan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
