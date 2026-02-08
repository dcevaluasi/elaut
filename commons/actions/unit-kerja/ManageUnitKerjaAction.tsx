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
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    TbPencil,
    TbPlus,
    TbBuildingSkyscraper,
    TbMapPin,
    TbUser,
    TbPhone,
    TbTag,
    TbActivity,
    TbChecks,
    TbX,
    TbBriefcase,
    TbWorld
} from "react-icons/tb";
import { UnitKerja } from "@/types/master";

type Props = {
    unitKerja?: UnitKerja;
    onSuccess?: () => void;
};

const ManageUnitKerjaAction: React.FC<Props> = ({ unitKerja, onSuccess }) => {
    const isUpdate = !!unitKerja;
    const [isOpen, setIsOpen] = useState(false);

    const [nama, setNama] = useState(unitKerja?.nama || "");
    const [alamat, setAlamat] = useState(unitKerja?.alamat || "");
    const [lokasi, setLokasi] = useState(unitKerja?.lokasi || "");
    const [pimpinan, setPimpinan] = useState(unitKerja?.pimpinan || "");
    const [callCenter, setCallCenter] = useState(unitKerja?.call_center || "");
    const [tipe, setTipe] = useState(unitKerja?.tipe || "");
    const [status, setStatus] = useState(unitKerja?.status || "Active");
    const [loading, setLoading] = useState(false);

    const [namaPimpinan, setNamaPimpinan] = useState("");
    const [jabatanIndo, setJabatanIndo] = useState("");
    const [jabatanEng, setJabatanEng] = useState("");
    const [lokasiPimpinan, setLokasiPimpinan] = useState("");

    useEffect(() => {
        if (pimpinan) {
            const parts = pimpinan.match(/\{([^}]+)\}/g)?.map((p) => p.replace(/[{}]/g, ""));
            if (parts && parts.length >= 4) {
                setNamaPimpinan(parts[0]);
                setJabatanIndo(parts[1]);
                setJabatanEng(parts[2]);
                setLokasiPimpinan(parts[3]);
            }
        }
    }, [pimpinan]);

    // Reset when opening in create mode
    useEffect(() => {
        if (isOpen && !isUpdate) {
            clearForm();
        }
    }, [isOpen, isUpdate]);

    const clearForm = () => {
        setNama("");
        setAlamat("");
        setLokasi("");
        setPimpinan("");
        setCallCenter("");
        setTipe("");
        setStatus("Active");
        setNamaPimpinan("");
        setJabatanIndo("");
        setJabatanEng("");
        setLokasiPimpinan("");
    };

    const handleSubmit = async () => {
        if (!nama) {
            Toast.fire({ icon: "error", title: "Validasi Gagal", text: "Nama Unit Kerja wajib diisi." });
            return;
        }

        const combined = `{${namaPimpinan}}{${jabatanIndo}}{${jabatanEng}}{${lokasiPimpinan}}`;
        const form = {
            nama,
            alamat,
            lokasi,
            pimpinan: combined,
            call_center: callCenter,
            tipe,
            status,
        };

        try {
            setLoading(true);
            if (isUpdate) {
                await axios.put(
                    `${elautBaseUrl}/unit-kerja/updateUnitKerja?id=${unitKerja?.id_unit_kerja}`,
                    form,
                    { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
                );
                Toast.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Data unit kerja berhasil diperbarui.",
                });
            } else {
                await axios.post(`${elautBaseUrl}/unit-kerja/createUnitKerja`, form, {
                    headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
                });
                Toast.fire({
                    icon: "success",
                    title: "Created!",
                    text: "Unit kerja baru berhasil ditambahkan.",
                });
            }

            setIsOpen(false);
            if (!isUpdate) clearForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("ERROR SUBMIT UNIT KERJA: ", error);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: `Terjadi kesalahan saat ${isUpdate ? "memperbarui" : "menambahkan"} unit kerja.`,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {isUpdate ? (
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/5 group/edit border border-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white transition-all shadow-sm">
                        <TbPencil size={16} />
                    </button>
                ) : (
                    <button className="flex items-center gap-3 px-6 h-12 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all active:scale-95">
                        <TbPlus size={20} strokeWidth={3} />
                        New Work Unit
                    </button>
                )}
            </AlertDialogTrigger>

            <AlertDialogContent className="w-[95vw] max-w-[95vw] h-[90vh] p-0 bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] z-[999999] flex flex-col">
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-white/5">
                            <TbBuildingSkyscraper size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${isUpdate ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`} />
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    {isUpdate ? "Modification Mode" : "Registration Mode"}
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                                {isUpdate ? "Edit Unit Kerja" : "Registrasi Unit Kerja"}
                            </h2>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors">
                        <TbX size={22} />
                    </button>
                </div>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {/* Primary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Nama Unit - Span 2 */}
                        <div className="lg:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Unit Kerja</label>
                            <div className="relative group">
                                <TbBuildingSkyscraper className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Contoh: BPPP MEDAN"
                                    className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Call Center - Span 1 */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Call Center</label>
                            <div className="relative group">
                                <TbPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="62..."
                                    className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                    value={callCenter}
                                    onChange={(e) => setCallCenter(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tipe Unit - Span 1 */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tipe Unit</label>
                            <Select value={tipe} onValueChange={setTipe}>
                                <SelectTrigger className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10">
                                    <div className="flex items-center gap-3">
                                        <TbTag className="text-slate-400" size={20} />
                                        <SelectValue placeholder="Pilih Tipe" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="max-h-80 z-[9999999]">
                                    <SelectItem value="UPT KKP" className="font-bold py-3 text-xs uppercase">UPT KKP</SelectItem>
                                    <SelectItem value="UPT NON KKP" className="font-bold py-3 text-xs uppercase">UPT NON KKP</SelectItem>
                                    <SelectItem value="P2MKP" className="font-bold py-3 text-xs uppercase">P2MKP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Alamat - Span 3 */}
                        <div className="lg:col-span-3 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Alamat Lengkap</label>
                            <div className="relative group">
                                <TbMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Jl. Raya..."
                                    className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                    value={alamat}
                                    onChange={(e) => setAlamat(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status - Span 1 */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Status</label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10">
                                    <div className="flex items-center gap-3">
                                        <TbActivity className={status === "Active" ? "text-emerald-500" : "text-slate-400"} size={20} />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="max-h-80 z-[9999999]">
                                    <SelectItem value="Active" className="font-bold py-3 text-xs uppercase text-emerald-600">Active</SelectItem>
                                    <SelectItem value="No Active" className="font-bold py-3 text-xs uppercase text-rose-600">Non-Active</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Leadership Section */}
                    <div className="space-y-6 pt-6 border-t border-dashed border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-500">
                                <TbUser size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Otoritas & Pimpinan</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Penandatangan Sertifikat</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <InputField label="Nama Pimpinan" value={namaPimpinan} setValue={setNamaPimpinan} placeholder="Dr. ..." icon={<TbUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />} />
                            <InputField label="Lokasi TTD" value={lokasiPimpinan} setValue={setLokasiPimpinan} placeholder="Kota/Kabupaten" icon={<TbMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />} />
                            <InputField label="Jabatan (ID)" value={jabatanIndo} setValue={setJabatanIndo} placeholder="Kepala Balai..." icon={<TbBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />} />
                            <InputField label="Jabatan (EN)" value={jabatanEng} setValue={setJabatanEng} placeholder="Head of Center..." icon={<TbWorld className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />} isItalic />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[32px]">
                    <button onClick={() => setIsOpen(false)} disabled={loading} className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="group relative h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : <><TbChecks size={18} /> {isUpdate ? "Update Data" : "Confirm Entry"}</>}
                    </button>
                </div>

            </AlertDialogContent>
        </AlertDialog>
    );
};

const InputField = ({ label, value, setValue, placeholder, icon, isItalic }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
        <div className="relative group">
            {icon}
            <input
                type="text"
                placeholder={placeholder}
                className={`w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 ${isItalic ? "italic" : ""}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    </div>
);

export default ManageUnitKerjaAction;
