"use client";

import React from "react";
import { TbSchool, TbArrowLeft, TbAward, TbSettings } from "react-icons/tb";
import { usePathname, useRouter } from "next/navigation";
import {
    decryptValue,
} from "@/lib/utils";
import { useFetchDataPelatihanMasyarakatDetail } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarkatDetail";
import { HashLoader } from "react-spinners";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PelatihanDetail from "./PelatihanDetail";
import { MdLock, MdOutlineVerifiedUser } from "react-icons/md";
import STTPLDetail from "./STTPLDetail";
import { motion, AnimatePresence } from "framer-motion";
import { getStatusInfo } from "@/utils/text";
import { ChevronLeft, School, Settings, ShieldCheck, Lock, Info, ExternalLink, Calendar, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const ManagePelatihan = () => {
    const router = useRouter();
    const paths = usePathname().split("/");
    const idPelatihan = decryptValue(paths[paths.length - 1]);
    const { data: dataPelatihan, loading: loadingDataPelatihan, error, refetch: refetchDetailPelatihan } = useFetchDataPelatihanMasyarakatDetail(idPelatihan);
    const [activeTab, setActiveTab] = React.useState('1');

    React.useEffect(() => {
        if (dataPelatihan) {
            setActiveTab((parseInt(dataPelatihan?.StatusPenerbitan) >= 5) ? '2' : '1');
        }
    }, [dataPelatihan]);

    if (loadingDataPelatihan) {
        return (
            <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                    <HashLoader color="#2563eb" size={65} />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-slate-800 dark:text-white font-black text-lg tracking-tight">Syncing Operations...</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse uppercase tracking-widest">Memuat semesta pelatihan</p>
                </div>
            </div>
        );
    }

    if (!dataPelatihan) {
        return (
            <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh] gap-6">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-500/20 shadow-xl shadow-rose-500/10">
                    <Info className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">Data Hilang dari Orbit</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto italic">Data pelatihan tidak ditemukan atau terjadi gangguan pada koordinat sistem.</p>
                </div>
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="h-12 px-8 rounded-2xl border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider gap-3 hover:-translate-x-1 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" /> Kembali Ke Hub
                </Button>
            </div>
        );
    }

    const { label, color, icon } = getStatusInfo(dataPelatihan.StatusPenerbitan);

    return (
        <section className="pb-32 flex flex-col gap-10">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pointer-events-none sticky top-0 z-50 py-2">
                <div className="pointer-events-auto">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 px-4 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-300 transform active:scale-95"
                    >
                        <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ChevronLeft className="w-5 h-5 shrink-0" />
                        </div>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight group-hover:text-blue-600 transition-colors uppercase tracking-[0.05em]">KEMBALI KE HUB</span>
                    </button>
                </div>

                <div className="pointer-events-auto flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-full shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color === "bg-blue-600" || color === "bg-blue-500" ? "#2563eb" : color === "bg-emerald-600" ? "#10b981" : "#f59e0b" }} />
                        <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Status Berjalan</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${color.replace('bg-', 'bg-').replace('text-white', 'text-white')} shadow-lg shadow-blue-500/20 text-white`}>
                        {icon}
                        {label}
                    </div>
                </div>
            </div>

            {/* Premium Page Header */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 dark:from-blue-600/10 dark:to-indigo-600/10 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-700" />
                <div className="relative overflow-hidden w-full h-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white dark:border-slate-800 shadow-2xl rounded-[3rem] p-8 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full -mr-40 -mt-40 blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full -ml-40 -mb-40 blur-[80px] pointer-events-none" />

                    <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center relative z-10 w-full">
                        <div className="relative">
                            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-4xl lg:text-5xl shadow-2xl shadow-blue-500/40 relative z-10 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                                <School className="relative z-20" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-700 z-20">
                                <Settings className="w-5 h-5 animate-[spin_4s_linear_infinite]" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">KONSOL MANAJEMEN</span>
                                </div>
                                <div className="h-px w-12 bg-slate-200 dark:bg-slate-700" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{dataPelatihan.PenyelenggaraPelatihan}</span>
                            </div>

                            <h1 className="font-black text-3xl md:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-3xl drop-shadow-sm">
                                {dataPelatihan.NamaPelatihan}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 mt-2">
                                <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner group/chip">
                                    <Settings className="w-4 h-4 text-blue-500 group-hover/chip:rotate-45 transition-transform" />
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight">{dataPelatihan.KodePelatihan}</span>
                                </div>
                                <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner group/chip">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover/chip:scale-110 transition-transform" />
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight text-center uppercase">Terverifikasi Pusat</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hub Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full flex flex-col gap-10"
            >
                <div className="flex justify-center">
                    <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-800 h-auto p-2.5 rounded-[3rem] shadow-[0_25px_60px_rgba(37,99,235,0.08)] dark:shadow-none flex flex-wrap md:flex-nowrap items-center gap-3 w-full max-w-3xl mx-auto">
                        <TabsTrigger
                            value="1"
                            className="flex-1 w-full rounded-[2.5rem] py-4 px-8 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-[0_15px_40px_rgba(37,99,235,0.3)] text-slate-500 dark:text-slate-400 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-100/50 dark:bg-blue-500/10 group-data-[state=active]:bg-white/20 transition-all font-black text-sm">
                                    01
                                </div>
                                <span className="text-base tracking-tight font-black">Penyelenggaraan</span>
                            </div>
                            <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-bold uppercase tracking-[0.1em] mt-1">Kelola Teknis & Peserta</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="2"
                            disabled={parseInt(dataPelatihan?.StatusPenerbitan) < 5 || dataPelatihan?.StatusPenerbitan == ""}
                            className="flex-1 w-full rounded-[2.5rem] py-4 px-8 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-600 data-[state=active]:to-violet-700 data-[state=active]:text-white data-[state=active]:shadow-[0_15px_40px_rgba(79,70,229,0.3)] text-slate-500 dark:text-slate-400 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:grayscale"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-100/50 dark:bg-indigo-500/10 group-data-[state=active]:bg-white/20 transition-all font-black text-sm">
                                    02
                                </div>
                                <span className="text-base tracking-tight font-black">Sertifikasi</span>
                            </div>
                            <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-bold uppercase tracking-[0.1em] mt-1 text-center">Penerbitan STTPL Digital</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="relative w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -30 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full"
                        >
                            <TabsContent value="1" className="mt-0 focus-visible:outline-none w-full">
                                <PelatihanDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                            </TabsContent>

                            <TabsContent value="2" className="mt-0 focus-visible:outline-none w-full">
                                {parseInt(dataPelatihan?.StatusPenerbitan) < 5 ? (
                                    <div className="group relative py-32 px-10 w-full max-w-3xl mx-auto flex flex-col items-center justify-center gap-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-[3rem] transition-all duration-500 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none">
                                        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/20 rounded-[3rem] -z-10" />

                                        <div className="relative">
                                            <div className="absolute inset-0 bg-slate-400/20 blur-3xl rounded-full scale-150 group-hover:bg-slate-400/30 transition-all duration-500" />
                                            <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-slate-950 shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 relative z-10 overflow-hidden group-hover:rotate-6 transition-transform duration-500">
                                                <Lock className='w-14 h-14 text-slate-300 group-hover:text-amber-500 transition-colors duration-500' />
                                                <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 dark:bg-slate-800/50 -mr-6 -mt-6 rounded-full" />
                                            </div>
                                        </div>

                                        <div className="text-center space-y-4 relative z-10 max-w-sm">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-full mb-2">
                                                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Akses Dibatasi</span>
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Tahap Terkunci</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                                                Modul penerbitan sertifikat digital belum dapat diakses. Selesaikan administrasi penyelenggaraan dan ajukan
                                                <span className="text-slate-800 dark:text-white font-bold mx-1 uppercase">Verifikasi STTPL</span> kepada administrator pusat.
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 mt-4 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all">
                                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                                                <Info className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Proses menunggu verifikasi</span>
                                        </div>
                                    </div>
                                ) : (
                                    <STTPLDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                                )}
                            </TabsContent>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Tabs>
        </section>
    );
}

export default ManagePelatihan;
