"use client";

import React from "react";
import { HashLoader } from "react-spinners";
import Image from "next/image";
import { DynamicTablePelatihanMasyarakat } from "./Summary/DynamicTablePelatihanMasyarakat";
import useFetchDataDukung from "@/hooks/elaut/useFetchDataDukung";
import DataDukungPelatihanTable from "./Dashboard/Tables/DataDukungPelatihanTable";
import dayjs from "dayjs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { tahunList } from "@/utils/time";
import { FiFilter } from "react-icons/fi";
import Cookies from "js-cookie";

import { TbFilter, TbChartPie, TbMapPin, TbUsers, TbSchool, TbCertificate } from "react-icons/tb";

const SummaryKinerja: React.FC = () => {
    const [includePusat, setIncludePusat] = React.useState(true);
    const { data: dataDukung, isFetching: isFetchingDataDukung, refetch } = useFetchDataDukung(includePusat)

    const [tahun, setTahun] = React.useState(() => dayjs().year());
    const [triwulan, setTriwulan] = React.useState(() => {
        const month = dayjs().month() + 1;
        if (month <= 3) return "TW I";
        if (month <= 6) return "TW II";
        if (month <= 9) return "TW III";
        return "TW IV";
    });

    return (
        <div className="flex flex-col gap-8 w-full pb-32">
            {isFetchingDataDukung ? (
                <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                    <HashLoader color="#F59E0B" size={60} />
                    <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">Memuat Data Kinerja...</p>
                </div>
            ) : dataDukung.length != 0 ? (
                <>
                    {/* Dashboard Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 shadow-sm transition-all duration-500 hover:shadow-md">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Indikator Kinerja</h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Analisis capaian dan output pelatihan secara komprehensif!</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-4 bg-amber-600/10 rounded-2xl border border-amber-600/20">
                                <TbChartPie className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-sm rounded-[2rem] p-6">
                        <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 border border-blue-600/20">
                                    <TbFilter size={24} />
                                </div>
                                <div className="hidden sm:block">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Parameter Data</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Periode Aktif: {triwulan} {tahun}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
                                <div className="flex-1 min-w-[120px]">
                                    <Select value={String(tahun)} onValueChange={(val) => setTahun(Number(val))}>
                                        <SelectTrigger className="h-12 w-full rounded-2xl bg-white border-slate-200 font-bold text-xs focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-950 dark:border-white/10 shadow-sm transition-all">
                                            <SelectValue placeholder="Tahun" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                                            {tahunList.sort((a, b) => b - a).map((y) => (
                                                <SelectItem key={y} value={String(y)} className="font-bold text-xs py-3">
                                                    TA {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 min-w-[120px]">
                                    <Select value={triwulan} onValueChange={setTriwulan}>
                                        <SelectTrigger className="h-12 w-full rounded-2xl bg-white border-slate-200 font-bold text-xs focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-950 dark:border-white/10 shadow-sm transition-all">
                                            <SelectValue placeholder="Triwulan" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                                            <SelectItem value="TW I" className="font-bold text-xs py-3">TW I</SelectItem>
                                            <SelectItem value="TW II" className="font-bold text-xs py-3">TW II</SelectItem>
                                            <SelectItem value="TW III" className="font-bold text-xs py-3">TW III</SelectItem>
                                            <SelectItem value="TW IV" className="font-bold text-xs py-3">TW IV</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {Cookies.get('Access')?.includes('superAdmin') && (
                                    <div className="flex-1 min-w-[160px]">
                                        <Select
                                            value={includePusat ? "true" : "false"}
                                            onValueChange={(value) => setIncludePusat(value === "true")}
                                        >
                                            <SelectTrigger className="h-12 w-full rounded-2xl bg-white border-slate-200 font-bold text-xs focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-950 dark:border-white/10 shadow-sm transition-all">
                                                <SelectValue placeholder="Scope Data" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                <SelectItem value="false" className="font-bold text-xs py-3">Unit Pelaksana (Balai)</SelectItem>
                                                <SelectItem value="true" className="font-bold text-xs py-3">Konsolidasi (Pusat & Balai)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary & Download Card */}
                    <DataDukungPelatihanTable data={dataDukung} tahun={tahun} triwulan={triwulan} />

                    {/* Detailed Analysis Sections */}
                    <div className="flex flex-col gap-12">
                        {/* Demografi Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 border border-blue-600/20">
                                    <TbUsers className="text-2xl" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Demografi Peserta</h3>
                                    <p className="text-sm font-medium text-slate-500">Analisis profil dan latar belakang pendidikan peserta!</p>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800 ml-4 hidden sm:block"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="PenyelenggaraPelatihan"
                                    colKey="JenisKelamin"
                                    title="Analisis Sebaran Gender"
                                />
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="PenyelenggaraPelatihan"
                                    colKey="PendidikanTerakhir"
                                    title="Tingkat Pendidikan Terakhir"
                                />
                            </div>
                        </div>

                        {/* Geografis Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 border border-emerald-600/20">
                                    <TbMapPin className="text-2xl" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Sebaran Geografis</h3>
                                    <p className="text-sm font-medium text-slate-500">Pemetaan asal wilayah peserta dan jangkauan pelatihan!</p>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800 ml-4 hidden sm:block"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="Provinsi"
                                    colKey="PenyelenggaraPelatihan"
                                    title="Sebaran Peserta per Provinsi"
                                />
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="Provinsi"
                                    colKey="BidangPelatihan"
                                    title="Minat Pelatihan Berdasarkan Wilayah"
                                />
                            </div>
                        </div>

                        {/* Analisis Output Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-violet-600/10 flex items-center justify-center text-violet-600 border border-violet-600/20">
                                    <TbCertificate className="text-2xl" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Analisis Pelatihan</h3>
                                    <p className="text-sm font-medium text-slate-500">Output pelaksanaan berdasarkan program dan sektor kerja!</p>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800 ml-4 hidden sm:block"></div>
                            </div>

                            <DynamicTablePelatihanMasyarakat
                                tahun={tahun.toString()}
                                triwulan={triwulan}
                                dataUser={dataDukung}
                                rowKey="PenyelenggaraPelatihan"
                                colKey="Triwulan"
                                title="Realisasi Output per Triwulan"
                            />

                            <div className="grid grid-cols-1 gap-8">
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="JenisProgram"
                                    colKey="PenyelenggaraPelatihan"
                                    title="Sektor/Jenis Program Pelatihan"
                                />
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="BidangPelatihan"
                                    colKey="PenyelenggaraPelatihan"
                                    title="Rumpun/Klaster Keilmuan"
                                />
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="Program"
                                    colKey="PenyelenggaraPelatihan"
                                    title="Rincian Judul Program Pelatihan"
                                />
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="DukunganProgramPrioritas"
                                    colKey="PenyelenggaraPelatihan"
                                    title="Output Dukungan Program Prioritas"
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="relative max-w-7xl w-full mx-auto mt-20">
                    <div className="flex flex-col items-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-12 rounded-[3rem] border border-slate-200/50 dark:border-slate-800">
                        <Image
                            src={"/illustrations/not-found.png"}
                            alt="Not Found"
                            width={400}
                            height={400}
                            className="w-[300px] md:w-[350px]"
                        />
                        <div className="max-w-md mx-auto text-center mt-4">
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Data Belum Tersedia</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                                Capaian indikator kinerja belum dapat ditampilkan untuk periode ini. Pastikan data penyelenggaraan telah terinput dengan benar.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SummaryKinerja;
