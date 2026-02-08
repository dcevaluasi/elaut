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
        <div className="w-full space-y-6 pb-32">
            {isFetchingDataDukung ? (
                <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                    <HashLoader color="#3B82F6" size={50} />
                    <p className="text-sm font-medium text-slate-500 animate-pulse">Memuat Data Kinerja...</p>
                </div>
            ) : dataDukung.length != 0 ? (
                <>
                    {/* Filter Section */}
                    {/* Sticky Filter Toolbar */}
                    <div className="sticky top-4 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-2 mb-6">
                        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-2">
                            <div className="flex items-center gap-3 px-2 w-full xl:w-auto">
                                <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                                    <TbFilter size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Filter Data</h3>
                                    <p className="text-[10px] font-medium text-slate-500">Sesuaikan periode data yang ditampilkan</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
                                <Select value={String(tahun)} onValueChange={(val) => setTahun(Number(val))}>
                                    <SelectTrigger className="h-10 w-full md:w-[120px] rounded-xl bg-white border-slate-200 font-bold text-xs focus:ring-2 focus:ring-blue-500/10 dark:bg-slate-800 dark:border-white/10 shadow-sm">
                                        <SelectValue placeholder="Tahun" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        {tahunList.map((y) => (
                                            <SelectItem key={y} value={String(y)} className="font-medium text-xs">
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={triwulan} onValueChange={setTriwulan}>
                                    <SelectTrigger className="h-10 w-full md:w-[120px] rounded-xl bg-white border-slate-200 font-bold text-xs focus:ring-2 focus:ring-blue-500/10 dark:bg-slate-800 dark:border-white/10 shadow-sm">
                                        <SelectValue placeholder="Triwulan" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="TW I" className="font-medium text-xs">TW I</SelectItem>
                                        <SelectItem value="TW II" className="font-medium text-xs">TW II</SelectItem>
                                        <SelectItem value="TW III" className="font-medium text-xs">TW III</SelectItem>
                                        <SelectItem value="TW IV" className="font-medium text-xs">TW IV</SelectItem>
                                    </SelectContent>
                                </Select>

                                {Cookies.get('Access')?.includes('superAdmin') && (
                                    <Select
                                        value={includePusat ? "true" : "false"}
                                        onValueChange={(value) => setIncludePusat(value === "true")}
                                    >
                                        <SelectTrigger className="h-10 w-full md:w-[160px] rounded-xl bg-white border-slate-200 font-bold text-xs focus:ring-2 focus:ring-blue-500/10 dark:bg-slate-800 dark:border-white/10 shadow-sm">
                                            <SelectValue placeholder="Scope Data" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            <SelectItem value="false" className="font-medium text-xs">Tanpa Pusat</SelectItem>
                                            <SelectItem value="true" className="font-medium text-xs">Dengan Pusat</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary & Download Card */}
                    <div className="grid grid-cols-1">
                        <DataDukungPelatihanTable data={dataDukung} tahun={tahun} triwulan={triwulan} />
                    </div>

                    {/* Tabs for Detailed Analysis */}
                    {/* Detailed Analysis Sections */}
                    <div className="space-y-12">
                        {/* Demografi Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                                    <TbUsers className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Demografi Peserta</h3>
                                    <p className="text-xs font-medium text-slate-500">Analisis profil dan latar belakang peserta pelatihan</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1  gap-6">
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="PenyelenggaraPelatihan"
                                    colKey="JenisKelamin"
                                    title="Analisis Gender Peserta"
                                />
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="PenyelenggaraPelatihan"
                                    colKey="PendidikanTerakhir"
                                    title="Latar Belakang Pendidikan"
                                />
                            </div>
                        </div>

                        {/* Geografis Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                                <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600">
                                    <TbMapPin className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Sebaran Geografis</h3>
                                    <p className="text-xs font-medium text-slate-500">Peta sebaran asal peserta dan minat wilayah</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1  gap-6">
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
                                    title="Sebaran Minat Pelatihan per Provinsi"
                                />
                            </div>
                        </div>

                        {/* Pelatihan Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600">
                                    <TbCertificate className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Analisis Pelatihan</h3>
                                    <p className="text-xs font-medium text-slate-500">Detail pelaksanaan, sektor, dan program pelatihan</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="PenyelenggaraPelatihan"
                                    colKey="Triwulan"
                                    title="Realisasi Pelatihan per Triwulan"
                                />
                            </div>

                            <div className="grid grid-cols-1  gap-6">
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="JenisProgram"
                                    colKey="PenyelenggaraPelatihan"
                                    title="Sektor Pelatihan (Program)"
                                />
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="BidangPelatihan"
                                    colKey="PenyelenggaraPelatihan"
                                    title="Klaster/Bidang Pelatihan"
                                />
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="Program"
                                    colKey="PenyelenggaraPelatihan"
                                    title="Judul Program Pelatihan"
                                />
                                <DynamicTablePelatihanMasyarakat
                                    tahun={tahun.toString()}
                                    triwulan={triwulan}
                                    dataUser={dataDukung}
                                    rowKey="DukunganProgramPrioritas"
                                    colKey="PenyelenggaraPelatihan"
                                    title="Dukungan Program Prioritas"
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="relative max-w-7xl w-full mx-auto mt-20">
                    <div className="pt-7 md:pt-0 flex flex-col items-center">
                        <Image
                            src={"/illustrations/not-found.png"}
                            alt="Not Found"
                            width={0}
                            height={0}
                            className="w-[350px] md:w-[400px]"
                        />
                        <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
                            <h1 className="text-2xl md:text-3xl font-calsans leading-[110%] text-black">
                                Belum Ada Pelatihan
                            </h1>
                            <div className="text-gray-600 text-center leading-[125%]  max-w-md">
                                Capaian ataupun summary dari pelaksanaan pelatihan belum dapat
                                dilihat, karena Balai Pelatihan belum memiliki peneyelenggaraan
                                pelatihan!
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SummaryKinerja;
