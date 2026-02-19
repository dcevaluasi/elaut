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
                    <p className="text-slate-800 dark:text-white font-black text-lg tracking-tight">Loading ...</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse tracking-widest">Memuat detail pelatihan</p>
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
        <section className="pb-6 flex flex-col gap-6 w-full">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pointer-events-none sticky top-16 z-50 py-1">
                <div className="pointer-events-auto">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2.5 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-300 transform active:scale-95"
                    >
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ChevronLeft className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 tracking-wider group-hover:text-blue-600 transition-colors uppercase">KEMBALI KE HUB</span>
                    </button>
                </div>

                <div className="pointer-events-auto flex items-center gap-3 px-5 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color === "bg-blue-600" || color === "bg-blue-500" ? "#2563eb" : color === "bg-emerald-600" ? "#10b981" : "#f59e0b" }} />
                        <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">Status Berjalan</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${color.replace('bg-', 'bg-').replace('text-white', 'text-white')} shadow-md shadow-blue-500/10 text-white`}>
                        {React.cloneElement(icon as React.ReactElement, { className: "w-3 h-3" })}
                        {label}
                    </div>
                </div>
            </div>

            {/* Premium Page Header */}
            <div className="relative group -mt-12">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 dark:from-blue-600/10 dark:to-indigo-600/10 rounded-[2.5rem] blur-xl group-hover:blur-2xl transition-all duration-700" />
                <div className="relative overflow-hidden w-full h-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white dark:border-slate-800 shadow-lg rounded-[2.5rem] p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-[60px] pointer-events-none" />

                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center relative z-10 w-full">
                        <div className="relative">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-3xl lg:text-4xl shadow-xl shadow-blue-500/30 relative z-10 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                                <School size={40} className="relative z-20" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
                            </div>
                            <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-700 z-20">
                                <Settings className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dataPelatihan.PenyelenggaraPelatihan}</span>
                            </div>

                            <h1 className="font-black text-2xl md:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl">
                                {dataPelatihan.NamaPelatihan}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hub Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full flex flex-col gap-6"
            >
                <div className="flex justify-center">
                    <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-800 h-auto p-1.5 rounded-[2rem] shadow-xl dark:shadow-none flex flex-wrap md:flex-nowrap items-center gap-2 w-full mx-auto">
                        <TabsTrigger
                            value="1"
                            className="flex-1 rounded-[1.5rem] py-2.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 text-slate-500 dark:text-slate-400 font-bold transition-all duration-300 flex flex-col items-center group ring-0 outline-none"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-blue-100/50 dark:bg-blue-500/10 group-data-[state=active]:bg-white/20 transition-all font-black text-[10px]">
                                    01
                                </div>
                                <span className="text-sm tracking-tight font-black uppercase">Penyelenggaraan</span>
                            </div>
                        </TabsTrigger>

                        <TabsTrigger
                            value="2"
                            disabled={parseInt(dataPelatihan?.StatusPenerbitan) < 5 || dataPelatihan?.StatusPenerbitan == ""}
                            className="flex-1 rounded-[1.5rem] py-2.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-600 data-[state=active]:to-violet-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 text-slate-500 dark:text-slate-400 font-bold transition-all duration-300 flex flex-col items-center group ring-0 outline-none disabled:opacity-40 disabled:grayscale"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-indigo-100/50 dark:bg-indigo-500/10 group-data-[state=active]:bg-white/20 transition-all font-black text-[10px]">
                                    02
                                </div>
                                <span className="text-sm tracking-tight font-black uppercase">Sertifikasi</span>
                            </div>
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
                                    <div className="group relative py-12 md:py-20 px-6 md:px-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-6 md:gap-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-[2.5rem] md:rounded-[3rem] transition-all duration-500 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none">
                                        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/20 rounded-[2.5rem] md:rounded-[3rem] -z-10" />

                                        <div className="relative">
                                            <div className="absolute inset-0 bg-slate-400/20 blur-3xl rounded-full scale-150 group-hover:bg-slate-400/30 transition-all duration-500" />
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-slate-950 shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 relative z-10 overflow-hidden group-hover:rotate-6 transition-transform duration-500">
                                                <Lock className='w-10 h-10 md:w-12 md:h-12 text-slate-300 group-hover:text-amber-500 transition-colors duration-500' />
                                                <div className="absolute top-0 right-0 w-8 h-8 md:w-12 md:h-12 bg-slate-50 dark:bg-slate-800/50 -mr-4 -mt-4 md:-mr-6 md:-mt-6 rounded-full" />
                                            </div>
                                        </div>

                                        <div className="text-center space-y-3 md:space-y-4 relative z-10 max-w-sm">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-full mb-1">
                                                <ShieldCheck className="w-3 md:w-3.5 h-3 md:h-3.5 text-amber-600" />
                                                <span className="text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-widest">Akses Dibatasi</span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Tahap Terkunci</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm leading-relaxed px-4">
                                                Modul penerbitan sertifikat digital belum dapat diakses. Selesaikan administrasi penyelenggaraan dan ajukan
                                                <span className="text-slate-800 dark:text-white font-black mx-1 uppercase">Verifikasi STTPL</span> kepada administrator pusat.
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 mt-2 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all">
                                            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-slate-100 dark:bg-slate-800">
                                                <Info className="w-4 md:w-5 h-4 md:h-5 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Proses menunggu verifikasi</span>
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
