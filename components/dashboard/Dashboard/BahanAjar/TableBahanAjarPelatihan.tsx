
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Book, Calendar, CheckCircle, File, Layers, SlidersHorizontal, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { TbBook } from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import Cookies from "js-cookie";
import { findNameUnitKerjaById, findUnitKerjaById } from "@/utils/unitkerja";
import AddModulAction from "@/commons/actions/modul/AddModulAction";
import UpdateModulAction from "@/commons/actions/modul/UpdateModulAction";

export default function TableBahanAjarPelatihan() {
    const idUnitKerja = Cookies.get('IDUnitKerja')
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data, loading, error, fetchModulPelatihan, stats } = useFetchDataMateriPelatihanMasyarakat("Bahan Ajar", idUnitKerja!);

    const { unitKerjas, loading: loadingUnitKerja, error: errorUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja()
    console.log({ unitKerjas })
    useEffect(() => {
        fetchUnitKerjaData()
    }, [fetchUnitKerjaData])

    const [filterBidang, setFilterBidang] = useState("")
    const [filterTahun, setFilterTahun] = useState("")
    const [filterProdusen, setFilterProdusen] = useState("")
    const [filterVerified, setFilterVerified] = useState("")

    const bidangOptions = [...new Set(data.map(d => d.BidangMateriPelatihan).filter(Boolean))]
    const tahunOptions = [...new Set(data.map(d => d.Tahun).filter(Boolean))]
    const produsenOptions = unitKerjas
    const verifiedOptions = [...new Set(data.map(d => d.IsVerified).filter(Boolean))]

    const clearFilters = () => {
        setFilterBidang("")
        setFilterTahun("")
        setFilterProdusen("")
        setFilterVerified("")
    }

    const filteredData = useMemo(() => {
        return data.filter((row) => {
            const matchesSearch = !searchQuery || Object.values(row).some((val) =>
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            )
            const matchesBidang = !filterBidang || row.BidangMateriPelatihan === filterBidang
            const matchesTahun = !filterTahun || row.Tahun === filterTahun
            const matchesProdusen = !filterProdusen || row.DeskripsiMateriPelatihan === filterProdusen.toString()
            const matchesVerified = !filterVerified || row.IsVerified === filterVerified

            return matchesSearch && matchesBidang && matchesTahun && matchesProdusen && matchesVerified
        }).sort((a, b) => {
            const yearA = parseInt(a.Tahun, 10) || 0;
            const yearB = parseInt(b.Tahun, 10) || 0;
            return yearB - yearA; // descending
        });
    }, [data, searchQuery, filterBidang, filterTahun, filterProdusen, filterVerified]);

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Metrics
    const totalModul = data.reduce((acc, m) => acc + m.ModulPelatihan.length, 0);
    const totalMateri = data.length;

    if (loading && loadingUnitKerja)
        return <p className="text-center py-10 text-gray-500">Loading...</p>;
    if (error && errorUnitKerja)
        return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="space-y-6 mt-5">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Bahan Ajar Pelatihan</h2>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <Input
                        type="text"
                        placeholder="Cari bahan ajar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-48  py-1 text-sm"
                    />

                    <div className="flex flex-wrap gap-2">
                        <FilterDropdown
                            filterBidang={filterBidang}
                            setFilterBidang={setFilterBidang}
                            bidangOptions={bidangOptions}
                            filterTahun={filterTahun}
                            setFilterTahun={setFilterTahun}
                            tahunOptions={tahunOptions}
                            filterProdusen={filterProdusen}
                            setFilterProdusen={setFilterProdusen}
                            produsenOptions={produsenOptions}
                            filterVerified={filterVerified}
                            setFilterVerified={setFilterVerified}
                            verifiedOptions={verifiedOptions}
                            clearFilters={clearFilters}
                        />
                        <AddModulAction onSuccess={fetchModulPelatihan} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full table-fixed text-sm">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="w-12 px-3 py-3 text-center">No</th>
                            <th className="w-12 px-3 py-3 text-center">Action</th>
                            <th className="w-40 px-3 py-3 text-center">Nama Bahan Ajar</th>
                            <th className="w-40 px-3 py-3 text-center">Jumlah Materi</th>

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => {
                            const { isMatch, name } = findUnitKerjaById(unitKerjas, idUnitKerja)
                            const { name: nameUK } = findNameUnitKerjaById(unitKerjas, row.DeskripsiMateriPelatihan)
                            return <tr
                                key={row.IdMateriPelatihan}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-3 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-3 py-4 border">
                                    <div className="flex flex-row gap-2 h-full items-center justify-center py-2">
                                        {
                                            (isMatch && row.DeskripsiMateriPelatihan == idUnitKerja) && <UpdateModulAction onSuccess={fetchModulPelatihan} materiPelatihan={row} />
                                        }

                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                (window.location.href = `/admin/lemdiklat/master/bahan-ajar/${row.IdMateriPelatihan}`)
                                            }
                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                                        >
                                            <TbBook className="h-4 w-4" />
                                            Detail Bahan Ajar
                                        </Button>
                                        {/* <DeleteInstrukturAction onSuccess={fetchData} instruktur={row} /> */}
                                    </div>
                                </td>
                                <td
                                    className="px-3 py-4 border max-w-full"
                                    title={row.NamaMateriPelatihan}
                                >
                                    <p className="font-semibold text-base leading-none mb-2">
                                        {row.NamaMateriPelatihan}
                                    </p>
                                    <div className="flex flex-col !font-normal">

                                        <span className="text-sm text-gray-400 leading-tight">Rumpun Pelatihan : {row.BidangMateriPelatihan}</span>
                                        <span className="text-sm text-gray-400 leading-tight">Jumlah Jam Pelajaran : {row?.JamPelajaran} JP</span>
                                        <span className="text-sm text-gray-400 leading-tight">Produsen : {isMatch && row.DeskripsiMateriPelatihan == idUnitKerja ? name : nameUK}</span>
                                    </div>
                                </td>

                                <td className="px-3 py-2 border text-center">{row.ModulPelatihan.length}</td>

                            </tr>
                        })}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td
                                    colSpan={18}
                                    className="text-center py-6 text-gray-500 italic"
                                >
                                    Tidak ada data ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </div>
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-neutral-600">
                    Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

        </div>
    );
}

function FilterDropdown({
    filterBidang,
    setFilterBidang,
    bidangOptions,
    filterTahun,
    setFilterTahun,
    tahunOptions,
    filterProdusen,
    setFilterProdusen,
    produsenOptions,
    filterVerified,
    setFilterVerified,
    verifiedOptions,
    clearFilters,
}: any) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center py-4 gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-3 space-y-3">
                <DropdownMenuLabel className="text-sm font-semibold">Filter Data</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Bidang */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Rumpun Pelatihan</label>
                    <Select value={filterBidang} onValueChange={setFilterBidang}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Pilih rumpun" />
                        </SelectTrigger>
                        <SelectContent>
                            {bidangOptions.map((opt: any) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Tahun */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Tahun</label>
                    <Select value={filterTahun} onValueChange={setFilterTahun}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Pilih tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {tahunOptions.map((opt: any) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Clear Button */}
                <Button
                    onClick={clearFilters}
                    size="sm"
                    variant="outline"
                    className="w-full mt-2 text-xs"
                >
                    Reset Filter
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}