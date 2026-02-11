"use client";

import React, { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import {
    TbPlus,
    TbPencil,
    TbInfoCircle,
    TbWorld,
    TbCategory,
    TbTextResize,
    TbFileDescription,
    TbChecks,
    TbX
} from "react-icons/tb";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { ProgramPelatihan, RumpunPelatihan } from "@/types/program";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

const ManageProgramPelatihanAction: React.FC<{
    onSuccess?: () => void;
    initialData?: ProgramPelatihan;
}> = ({ onSuccess, initialData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [idRumpunPelatihan, setIdRumpunPelatihan] = useState("");
    const [nama, setNama] = useState("");
    const [namaEng, setNamaEng] = useState("");
    const [nameSingkatan, setNameSingkatan] = useState("");
    const [description, setDescription] = useState({
        headerIndo: "Berdasarkan Peraturan Pemerintah Nomor 62 Tahun 2014 tentang Penyelenggaraan Pendidikan, Pelatihan, dan Penyuluhan Perikanan, serta ketentuan pelaksanaannya",
        headerEnglish: "Based on Government Regulation Number 62 of 2014 concerning the Implementation of Fisheries Education, Training, and Extension as well as its implementing provisions",
        bodyIndo: "",
        bodyEnglish: "",
    });

    const [loading, setLoading] = useState(false);
    const { data: rumpunData, loading: rumpunLoading } = useFetchDataRumpunPelatihan();

    const isEditMode = Boolean(initialData);

    useEffect(() => {
        if (isEditMode && initialData) {
            setIdRumpunPelatihan(initialData.id_rumpun_pelatihan.toString());
            setNama(initialData.name_indo);
            setNamaEng(initialData.name_english);
            setNameSingkatan(initialData.abbrv_name);

            if (initialData.description) {
                const parts = initialData.description.match(/\{([^}]+)\}/g) || [];
                setDescription({
                    headerIndo: parts[0]?.replace(/[{}]/g, "") || "",
                    headerEnglish: parts[1]?.replace(/[{}]/g, "") || "",
                    bodyIndo: parts[2]?.replace(/[{}]/g, "") || "",
                    bodyEnglish: parts[3]?.replace(/[{}]/g, "") || "",
                });
            }
        } else if (isOpen) {
            clearForm();
        }
    }, [isEditMode, initialData, isOpen]);

    const clearForm = () => {
        setIdRumpunPelatihan("");
        setNama("");
        setNamaEng("");
        setNameSingkatan("");
        setDescription({
            headerIndo: "Berdasarkan Peraturan Pemerintah Nomor 62 Tahun 2014 tentang Penyelenggaraan Pendidikan, Pelatihan, dan Penyuluhan Perikanan, serta ketentuan pelaksanaannya",
            headerEnglish: "Based on Government Regulation Number 62 of 2014 concerning the Implementation of Fisheries Education, Training, and Extension as well as its implementing provisions",
            bodyIndo: "",
            bodyEnglish: "",
        });
    };

    const handleSubmit = async () => {
        if (!idRumpunPelatihan || !nama || !namaEng) {
            Toast.fire({ icon: "error", title: "Mandatory Fields", text: "Mohon lengkapi Klaster dan Nama Program." });
            return;
        }

        const formattedDescription = `{${description.headerIndo}}{${description.headerEnglish}}{${description.bodyIndo}}{${description.bodyEnglish}}`;

        const form = {
            id_rumpun_pelatihan: parseInt(idRumpunPelatihan),
            name_indo: nama,
            name_english: namaEng,
            abbrv_name: nameSingkatan,
            description: formattedDescription,
            created_at: "",
            updated_at: "",
        };

        try {
            setLoading(true);
            if (isEditMode && initialData) {
                await axios.put(`${elautBaseUrl}/program_pelatihan/update_program_pelatihan?id=${initialData.id_program_pelatihan}`, form);
                Toast.fire({ icon: "success", title: "Updated!", text: "Program berhasil diperbarui." });
            } else {
                await axios.post(`${elautBaseUrl}/program_pelatihan/create_program_pelatihan`, form);
                Toast.fire({ icon: "success", title: "Created!", text: "Program baru telah ditambahkan." });
            }
            setIsOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            Toast.fire({ icon: "error", title: "Failed", text: "Terjadi kesalahan operasional." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {isEditMode ? (
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/5 group/edit border border-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white transition-all shadow-sm">
                        <TbPencil size={18} />
                    </button>
                ) : (
                    <button className="flex items-center gap-3 px-6 h-12 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all active:scale-95">
                        <TbPlus size={20} strokeWidth={3} />
                        New Program
                    </button>
                )}
            </AlertDialogTrigger>

            <AlertDialogContent className="w-full max-w-5xl h-fit max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] z-[999999] flex flex-col">
                {/* Modal Header */}
                <div className="relative p-8 md:p-10 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-500/5 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    {isEditMode ? "Modify Sequence" : "Initialize Entry"}
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                                {isEditMode ? "Edit Program" : "Add Program"}
                            </h2>
                            <p className="text-xs font-medium text-slate-400 max-w-sm">Manage curriculum metadata and certificate descriptor settings.</p>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full hover:bg-white dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors">
                            <TbX size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-8 md:p-10 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-8">
                    {/* Cluster Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <TbCategory size={16} className="text-blue-500" />
                            <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Klaster Pelatihan</label>
                        </div>
                        <select
                            className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-5 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                            value={idRumpunPelatihan}
                            onChange={(e) => setIdRumpunPelatihan(e.target.value)}
                            disabled={rumpunLoading}
                        >
                            <option value="">-- SELECT CLUSTER --</option>
                            {rumpunData?.map((rumpun: RumpunPelatihan) => (
                                <option key={rumpun.id_rumpun_pelatihan} value={rumpun.id_rumpun_pelatihan}>
                                    {rumpun.name.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <TbTextResize size={16} className="text-emerald-500" />
                                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Nama (Indonesia)</label>
                            </div>
                            <input
                                type="text"
                                placeholder="..."
                                className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-5 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all uppercase"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <TbWorld size={16} className="text-indigo-500" />
                                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Nama (English)</label>
                            </div>
                            <input
                                type="text"
                                placeholder="..."
                                className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-5 font-bold text-sm italic focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                value={namaEng}
                                onChange={(e) => setNamaEng(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <TbInfoCircle size={16} className="text-blue-500" />
                                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Singkatan (Abbreviated Name)</label>
                            </div>
                            <input
                                type="text"
                                placeholder="Example: BST / AKP"
                                className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-5 font-black text-sm text-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all uppercase tracking-tighter"
                                value={nameSingkatan}
                                onChange={(e) => setNameSingkatan(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Specialized Fields (SuperAdmin Only) */}
                    {Cookies.get('Access')?.includes('superAdmin') && (
                        <div className="space-y-10 pt-4">
                            <div className="p-6 bg-slate-900 rounded-[32px] border border-white/5 space-y-8">
                                <div className="flex items-center gap-3">
                                    <TbFileDescription size={24} className="text-blue-400" />
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">STTPL Metadata</h3>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Certificate Content Control</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <STTPLField label="Header (ID)" value={description.headerIndo} onChange={(v: string) => setDescription({ ...description, headerIndo: v })} color="blue" />
                                    <STTPLField label="Header (EN)" value={description.headerEnglish} onChange={(v: string) => setDescription({ ...description, headerEnglish: v })} color="indigo" isItalic />
                                    <STTPLField label="Body (ID)" value={description.bodyIndo} onChange={(v: string) => setDescription({ ...description, bodyIndo: v })} color="emerald" />
                                    <STTPLField label="Body (EN)" value={description.bodyEnglish} onChange={(v: string) => setDescription({ ...description, bodyEnglish: v })} color="teal" isItalic />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 md:p-10 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button onClick={() => setIsOpen(false)} disabled={loading} className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                        Cancel Sequence
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="group relative h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : <><TbChecks size={18} /> {isEditMode ? "Update Repository" : "Add to Vault"}</>}
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

interface STTPLFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    color: "blue" | "indigo" | "emerald" | "teal";
    isItalic?: boolean;
}

const STTPLField: React.FC<STTPLFieldProps> = ({ label, value, onChange, color, isItalic }) => {
    const colorClasses: Record<string, string> = {
        blue: "focus:ring-blue-500/20",
        indigo: "focus:ring-indigo-500/20",
        emerald: "focus:ring-emerald-500/20",
        teal: "focus:ring-teal-500/20",
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1 block">{label}</label>
            <textarea
                className={`w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white/80 font-medium placeholder:text-white/10 outline-none transition-all h-32 custom-scrollbar ${colorClasses[color]} ${isItalic ? "italic" : ""}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default ManageProgramPelatihanAction;
