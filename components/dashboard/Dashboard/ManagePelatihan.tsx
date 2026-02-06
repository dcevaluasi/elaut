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

const ManagePelatihan = () => {
    const router = useRouter();
    const paths = usePathname().split("/");
    const idPelatihan = decryptValue(paths[paths.length - 1]);
    const { data: dataPelatihan, loading: loadingDataPelatihan, error, refetch: refetchDetailPelatihan } = useFetchDataPelatihanMasyarakatDetail(idPelatihan);
    const [activeTab, setActiveTab] = React.useState((parseInt(dataPelatihan?.StatusPenerbitan!) >= 5) ? '2' : '1');

    React.useEffect(() => {
        if (dataPelatihan) {
            setActiveTab((parseInt(dataPelatihan?.StatusPenerbitan) >= 5) ? '2' : '1');
        }
    }, [dataPelatihan]);

    if (loadingDataPelatihan) {
        return (
            <section className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-4">
                <HashLoader color="#338CF5" size={50} />
                <p className="text-slate-500 animate-pulse font-medium">Memuat detail pelatihan...</p>
            </section>
        );
    }

    if (!dataPelatihan) {
        return (
            <section className="p-10 text-center">
                <p className="text-rose-500">Data pelatihan tidak ditemukan atau terjadi kesalahan.</p>
                <button onClick={() => router.back()} className="mt-4 text-blue-500 hover:underline flex items-center gap-2 mx-auto">
                    <TbArrowLeft /> Kembali
                </button>
            </section>
        );
    }

    const { label, color, icon } = getStatusInfo(dataPelatihan.StatusPenerbitan);

    return (
        <section className="pb-20 space-y-6">
            {/* Action Bar / Breadcrumb-like Header */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                    <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                        <TbArrowLeft className="text-xl" />
                    </div>
                    Kembali ke Daftar
                </button>

                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border ${color.replace('bg-', 'text-').replace('text-white', 'text-slate-700')} bg-slate-50 shadow-sm transition-all`}>
                    <span className="flex items-center gap-1.5">
                        {icon}
                        {label}
                    </span>
                </div>
            </div>

            {/* Premium Page Header */}
            <header
                className="relative overflow-hidden w-full h-auto bg-white border border-slate-200 shadow-sm rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50/30 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />

                <div className="flex flex-row gap-5 items-center relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-4xl shadow-lg shadow-blue-200 shrink-0">
                        <TbSchool />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-blue-600 font-bold text-xs tracking-wider uppercase">Manajemen Pelatihan</span>
                        <h1 id="page-caption" className="font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight leading-tight max-w-2xl">
                            {dataPelatihan.NamaPelatihan}
                        </h1>
                        <div className="flex items-center gap-4 mt-1 text-slate-500 text-sm font-medium">
                            <span className="flex items-center gap-1"><TbSettings className="text-blue-500" /> {dataPelatihan.KodePelatihan}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><MdOutlineVerifiedUser className="text-emerald-500" /> {dataPelatihan.PenyelenggaraPelatihan}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 relative z-10 shrink-0">
                    {/* Progress indicator can go here if needed */}
                </div>
            </header>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <div className="bg-white/50 backdrop-blur-sm border border-slate-200 p-1.5 rounded-2xl inline-flex w-full mb-6 shadow-sm overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2">
                        <TabsTrigger
                            value="1"
                            className="rounded-xl py-3 transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold text-slate-600 hover:bg-white hover:text-blue-600"
                        >
                            <span className="flex items-center gap-2">
                                <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-current bg-opacity-10 text-xs">1</span>
                                Penyelenggaraan Pelatihan
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="2"
                            disabled={parseInt(dataPelatihan?.StatusPenerbitan) < 5 || dataPelatihan?.StatusPenerbitan == ""}
                            className="rounded-xl py-3 transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold text-slate-600 hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center gap-2">
                                <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-current bg-opacity-10 text-xs text-inherit">2</span>
                                Penerbitan STTPL
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === '1' && (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <TabsContent value="1" className="mt-0 focus-visible:outline-none">
                                    <PelatihanDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                                </TabsContent>
                            </motion.div>
                        )}

                        {activeTab === '2' && (
                            <motion.div
                                key="sttpl"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <TabsContent value="2" className="mt-0 focus-visible:outline-none">
                                    {parseInt(dataPelatihan?.StatusPenerbitan) < 5 ? (
                                        <div className="py-24 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-6 bg-white border border-dashed border-slate-300 rounded-3xl p-10 mt-4">
                                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                                                <MdLock className='w-10 h-10 text-slate-400' />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h3 className="text-xl font-bold text-slate-800">Tahap Belum Terbuka</h3>
                                                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                                    Penyelenggara pelatihan belum mengajukan penerbitan STTPL. Segera lengkapi administrasi dan ajukan penerbitan agar proses dapat berlanjut ke tahapan sertifikasi.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <STTPLDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                                    )}
                                </TabsContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Tabs>
        </section>
    );
}

export default ManagePelatihan

