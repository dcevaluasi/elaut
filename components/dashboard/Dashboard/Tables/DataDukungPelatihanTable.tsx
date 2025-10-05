"use client";

import { UserPelatihan } from "@/types/product";
import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { FiBarChart2, FiDownload } from "react-icons/fi"
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateTanggalPelatihan } from "@/utils/text";

const DataDukungPelatihanTable = ({ data }: { data: UserPelatihan[] }) => {
    const [tahun, setTahun] = useState(() => dayjs().year()); // default ke tahun ini
    const [triwulan, setTriwulan] = useState(() => {
        const month = dayjs().month() + 1;
        if (month <= 3) return "TW I";
        if (month <= 6) return "TW II";
        if (month <= 9) return "TW III";
        return "TW IV";
    });

    const pageSize = 5;

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

    // tahun list (2015 - 2030)
    const tahunList = Array.from({ length: 16 }, (_, i) => 2015 + i);

    // export excel
    const handleExportExcel = () => {
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


        const exportData = sortedData.map((item, index) => ({
            "NO": index + 1,
            "PENYELENGGARA PELATIHAN": item.PenyelenggaraPelatihan.toUpperCase(),
            "NAMA": item.Nama.toUpperCase(),
            NIK: item.Nik || "-",
            "NO TELPON": item.NoTelpon || "-",
            "TEMPAT & TANGGAL LAHIR": item.TempatTanggalLahir,
            "KOTA/KABUPATEN": item.Kota,
            PROVINSI: item.Provinsi,
            "JENIS KELAMIN": item.JenisKelamin,
            ALAMAT: item.Alamat || "-",
            "PENDIDIKAN TERKAHIR": item.PendidikanTerakhir,
            "SEKTOR PELATIHAN": item.JenisProgram.toUpperCase(),
            "BIDANG/KLASTER PELATIHAN": item.BidangPelatihan.toUpperCase(),
            "PROGRAM PELATIHAN": item.Program.toUpperCase(),
            "DUKUNGAN PROGRAM PRIORITAS": item.DukunganProgramPrioritas.toUpperCase(),
            "TANGGAL PELATIHAN": `${generateTanggalPelatihan(item.TanggalMulai)} - ${generateTanggalPelatihan(item.TanggalBerakhir)}`.toUpperCase(),
            "NO SERTIFIKAT": item.NoRegistrasi,
            "FILE SERTIFIKAT": item.FileSertifikat
                ? `https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${item.FileSertifikat}`
                : "-",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        worksheet["!cols"] = Object.keys(exportData[0]).map(() => ({ wch: 25 }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pelatihan");
        XLSX.writeFile(
            workbook,
            `DATA DUKUNG MASYARAKAT DILATIH ${tahun} - ${triwulan}.xlsx`
        );
    };


    return (
        <div className="space-y-6">
            <Card className="shadow-md border rounded-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <FiBarChart2 className="text-blue-600" />
                        Data Dukung <span className="italic">By Name By Address</span> Masyarakat Dilatih
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        <Select value={String(tahun)} onValueChange={(val) => setTahun(Number(val))}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {tahunList.map((y) => (
                                    <SelectItem key={y} value={String(y)}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={triwulan} onValueChange={setTriwulan}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Pilih Triwulan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TW I">TW I</SelectItem>
                                <SelectItem value="TW II">TW II</SelectItem>
                                <SelectItem value="TW III">TW III</SelectItem>
                                <SelectItem value="TW IV">TW IV</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rekap + Action */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-t pt-3">
                        <div>
                            <p className="flex items-center gap-2 font-semibold text-gray-700">
                                <FiBarChart2 className="text-blue-500 flex-shrink-0" /> Rekapitulasi {tahun} - {triwulan}
                            </p>
                            <p>
                                Total Data: <span className="font-bold text-blue-600">{totalData}</span>
                            </p>
                        </div>
                        <Button onClick={handleExportExcel} className="flex items-center gap-2 text-xs">
                            <FiDownload className="w-4 h-4" />
                            Download Data Dukung
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DataDukungPelatihanTable;
