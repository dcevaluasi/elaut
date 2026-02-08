"use client";

import { UserPelatihan } from "@/types/product";
import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { FiBarChart2, FiDownload } from "react-icons/fi"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateTanggalPelatihan, splitCityAndDate } from "@/utils/text";
import { Loader2 } from "lucide-react";
import Toast from "@/commons/Toast";

const DataDukungPelatihanTable = ({ data, tahun, triwulan }: { data: UserPelatihan[], tahun: number, triwulan: string }) => {

    const pageSize = 5;
    const [isDownloading, setIsDownloading] = useState(false);

    // fungsi helper
    const triwulanToMonth = (tw: string) => {
        if (tw === "TW I") return 3;
        if (tw === "TW II") return 6;
        if (tw === "TW III") return 9;
        return 12;
    };


    // filter data
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const berakhir = dayjs(item.TanggalMulai, "YYYY-MM-DD");
            const matchTahun = berakhir.year() === tahun;
            const batasBulan = triwulanToMonth(triwulan);
            const matchTriwulan = matchTahun && berakhir.month() + 1 <= batasBulan;
            return matchTriwulan;
        });
    }, [data, tahun, triwulan]);

    // metrics
    const totalData = filteredData.length;

    // export excel
    const handleExportExcel = async () => {
        if (filteredData.length === 0) {
            Toast.fire({
                icon: "warning",
                title: "Data Kosong",
                text: "Tidak ada data untuk didownload!",
            });
            return;
        }

        setIsDownloading(true);

        try {
            // sort by PenyelenggaraPelatihan (A → Z)
            const sortedData = [...filteredData].sort((a, b) => {
                const aPeny = a.PenyelenggaraPelatihan || "";
                const bPeny = b.PenyelenggaraPelatihan || "";

                const aIsPusat = aPeny.toLowerCase().includes("pusat");
                const bIsPusat = bPeny.toLowerCase().includes("pusat");

                // Prioritize ones with "Pusat"
                if (aIsPusat && !bIsPusat) return -1;
                if (!aIsPusat && bIsPusat) return 1;

                // If both are "Pusat" or both not, sort alphabetically
                return aPeny.localeCompare(bPeny);
            });


            const exportData = sortedData.map((item, index) => {
                // Safely parse tempat tanggal lahir
                let tempatLahir = "-";
                let tanggalLahir = "-";

                if (item.TempatTanggalLahir) {
                    try {
                        const result = splitCityAndDate(item.TempatTanggalLahir);
                        tempatLahir = result.city || "-";
                        tanggalLahir = result.date || "-";
                    } catch (error) {
                        // If splitCityAndDate fails, try to manually split by common patterns
                        const input = item.TempatTanggalLahir;

                        // Try pattern: "City, DD Month YYYY" or "City DD Month YYYY"
                        const commaMatch = input.match(/^([^,]+),?\s*(.*)$/);
                        if (commaMatch && commaMatch[2]) {
                            tempatLahir = commaMatch[1].trim();
                            tanggalLahir = commaMatch[2].trim();
                        } else {
                            // If all parsing fails, just use the original value
                            tempatLahir = input;
                            tanggalLahir = "-";
                        }

                        console.warn("Could not parse TempatTanggalLahir with standard format:", input, "Using fallback parsing");
                    }
                }

                return {
                    "NO": index + 1,
                    "PENYELENGGARA PELATIHAN": item.PenyelenggaraPelatihan?.toUpperCase() || "-",
                    "NAMA": item.Nama?.toUpperCase() || "-",
                    NIK: item.Nik || "-",
                    "NO TELPON": item.NoTelpon || "-",
                    "TEMPAT LAHIR": tempatLahir,
                    "TANGGAL LAHIR": tanggalLahir,
                    "KOTA/KABUPATEN": item.Kota?.toString()?.toUpperCase() || "-",
                    PROVINSI: item.Provinsi?.toString()?.toUpperCase() || "-",
                    "JENIS KELAMIN": item.JenisKelamin || "-",
                    ALAMAT: item.Alamat || "-",
                    "PENDIDIKAN TERKAHIR": item.PendidikanTerakhir || "-",
                    "NAMA PELATIHAN": item.NamaPelatihan?.toUpperCase() || "-",
                    "SEKTOR PELATIHAN": item.JenisProgram?.toUpperCase() || "-",
                    "BIDANG/KLASTER PELATIHAN": item.BidangPelatihan?.toUpperCase() || "-",
                    "PROGRAM PELATIHAN": item.Program?.toUpperCase() || "-",
                    "DUKUNGAN PROGRAM PRIORITAS": item.DukunganProgramPrioritas?.toUpperCase() || "-",
                    "TANGGAL PELATIHAN": `${generateTanggalPelatihan(item.TanggalMulai)} - ${generateTanggalPelatihan(item.TanggalBerakhir)}`.toUpperCase(),
                    "NO SERTIFIKAT": item.NoRegistrasi || "-",
                    "FILE SERTIFIKAT": item.FileSertifikat
                        ? `https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${item.FileSertifikat}`
                        : "-",
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            worksheet["!cols"] = Object.keys(exportData[0]).map(() => ({ wch: 25 }));

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pelatihan");
            XLSX.writeFile(
                workbook,
                `DATA DUKUNG MASYARAKAT DILATIH ${tahun} - ${triwulan}.xlsx`
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: `Data berhasil didownload (${exportData.length} data)`,
            });
        } catch (error) {
            console.error("Error exporting data:", error);
            Toast.fire({
                icon: "error",
                title: "Gagal Download",
                text: "Terjadi kesalahan saat mengunduh data. Silakan coba lagi.",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-none bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden">
                <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-white/5">
                    <CardTitle className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 mb-1">
                            <FiBarChart2 size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Data Dukung Peserta</h3>
                            <p className="text-xs font-medium text-slate-400 normal-case tracking-normal">Rekapitulasi total peserta dilatih <span className="italic">(By Name By Address)</span></p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6 w-full md:w-auto p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/10">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Periode</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{tahun} - {triwulan}</p>
                            </div>
                            <div className="w-px h-8 bg-blue-200 dark:bg-blue-500/20" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Peserta</p>
                                <p className="text-2xl font-black text-blue-600 leading-none">{totalData.toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleExportExcel}
                            disabled={isDownloading}
                            className={`
                                h-14 px-8 rounded-2xl font-bold uppercase tracking-wider transition-all w-full md:w-auto
                                ${isDownloading
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:-translate-y-1 active:scale-95"}
                            `}
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FiDownload className="w-5 h-5 mr-3" />
                                    Download Excel
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DataDukungPelatihanTable;
