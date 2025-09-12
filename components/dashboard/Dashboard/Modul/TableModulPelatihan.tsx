
"use client";

import React, { useState, useMemo } from "react";
import { Book, Calendar, File, Layers, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import AddInstrukturAction from "../Actions/Instruktur/AddInstrukturAction";
import UpdateModulAction from "../Actions/Modul/UpdateModulAction";
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
import AddModulAction from "../Actions/Modul/AddModulAction";

export default function TableModulPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data, loading, error, fetchModulPelatihan, stats } = useFetchDataMateriPelatihanMasyarakat();

    const [filterBidang, setFilterBidang] = useState("")
    const [filterTahun, setFilterTahun] = useState("")
    const [filterProdusen, setFilterProdusen] = useState("")

    const bidangOptions = [...new Set(data.map(d => d.BidangMateriPelatihan).filter(Boolean))]
    const tahunOptions = [...new Set(data.map(d => d.NamaPenderitaMateriPelatihan).filter(Boolean))]
    const produsenOptions = [...new Set(data.map(d => d.DeskripsiMateriPelatihan).filter(Boolean))]

    const clearFilters = () => {
        setFilterBidang("")
        setFilterTahun("")
        setFilterProdusen("")
    }

    const filteredData = useMemo(() => {
        return data.filter((row) => {
            const matchesSearch = !searchQuery || Object.values(row).some((val) =>
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            )
            const matchesBidang = !filterBidang || row.BidangMateriPelatihan === filterBidang
            const matchesTahun = !filterTahun || row.NamaPenderitaMateriPelatihan === filterTahun
            const matchesProdusen = !filterProdusen || row.DeskripsiMateriPelatihan === filterProdusen

            return matchesSearch && matchesBidang && matchesTahun && matchesProdusen
        }).sort((a, b) => {
            const yearA = parseInt(a.NamaPenderitaMateriPelatihan, 10) || 0;
            const yearB = parseInt(b.NamaPenderitaMateriPelatihan, 10) || 0;
            return yearB - yearA; // descending
        });
    }, [data, searchQuery, filterBidang, filterTahun, filterProdusen]);

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

    if (loading)
        return <p className="text-center py-10 text-gray-500">Loading...</p>;
    if (error)
        return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-2 w-full h-full gap-4">
                <div className="w-full flex flex-col gap-4">
                    <div className="flex w-full gap-4">
                        <Card className="h-fit rounded-xl w-full border border-gray-200 bg-white shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base font-medium text-gray-600">
                                    Total Modul
                                </CardTitle>
                                <Book className="h-5 w-5 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-gray-800">{totalMateri}</p>
                                <p className="text-xs text-gray-500">Modul tersedia</p>
                            </CardContent>
                        </Card>
                        <Card className="h-fit rounded-xl w-full border border-gray-200 bg-white shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base font-medium text-gray-600">
                                    Total Materi
                                </CardTitle>
                                <File className="h-5 w-5 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-gray-800">{totalModul}</p>
                                <p className="text-xs text-gray-500">Materi tersedia</p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="w-full h-full rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-lg">
                        <CardHeader className="flex items-center">
                            <Calendar className="h-5 w-5 text-teal-500" />
                            <CardTitle className="text-lg font-semibold text-gray-800">
                                Tahun
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="grid grid-cols-4 gap-2">
                                {Object.entries(stats.tahun).map(([key, count]) => (
                                    <li
                                        key={key}
                                        className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2 text-sm transition hover:bg-teal-100"
                                    >
                                        <span className="font-medium text-gray-700">{key}</span>
                                        <span className="font-bold text-teal-600">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <Card className="w-full h-full rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-lg">
                    <CardHeader className="flex items-center">
                        <Layers className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Bidang
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="grid grid-cols-3 gap-2">
                            {Object.entries(stats.bidang).map(([key, count]) => (
                                <li
                                    key={key}
                                    className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm transition hover:bg-blue-100"
                                >
                                    <span className="font-medium text-gray-700">{key}</span>
                                    <span className="font-bold text-blue-600">{count}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>


            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Modul Pelatihan</h2>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <Input
                        type="text"
                        placeholder="Cari modul..."
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
                            <th className="w-40 px-3 py-3 text-center">Nama Modul</th>
                            <th className="w-28 px-3 py-3 text-center">Bidang</th>
                            <th className="w-28 px-3 py-3 text-center">Tahun</th>
                            <th className="w-28 px-3 py-3 text-center">Produsen</th>
                            <th className="w-40 px-3 py-3 text-center">Jumlah Materi</th>

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => (
                            <tr
                                key={row.IdMateriPelatihan}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-3 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-3 py-4 border">
                                    <div className="flex flex-row gap-2 h-full items-center justify-center py-2">
                                        <UpdateModulAction onSuccess={fetchModulPelatihan} materiPelatihan={row} />
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                (window.location.href = `/admin/lemdiklat/master/modul/${row.IdMateriPelatihan}`)
                                            }
                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                                        >
                                            <TbBook className="h-4 w-4" />
                                            Detail Modul
                                        </Button>
                                        {/* <DeleteInstrukturAction onSuccess={fetchData} instruktur={row} /> */}
                                    </div>

                                </td>
                                <td
                                    className="px-3 py-2 border max-w-full"
                                    title={row.NamaMateriPelatihan}
                                >
                                    {row.NamaMateriPelatihan}
                                </td>
                                <td
                                    className="px-3 py-2 border max-w-full text-center"
                                    title={row.BidangMateriPelatihan}
                                >
                                    {row.BidangMateriPelatihan}
                                </td>
                                <td className="px-3 py-2 border text-center">{row.NamaPenderitaMateriPelatihan}</td>
                                <td className="px-3 py-2 border text-center">{row.DeskripsiMateriPelatihan}</td>
                                <td className="px-3 py-2 border text-center">{row.ModulPelatihan.length}</td>

                            </tr>
                        ))}
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
                    <label className="text-xs font-medium text-gray-600">Bidang</label>
                    <Select value={filterBidang} onValueChange={setFilterBidang}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Pilih bidang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-">Semua</SelectItem>
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
                            <SelectValue placeholder="Pilih bidang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-">Semua</SelectItem>
                            {tahunOptions.map((opt: any) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Produsen */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Produsen</label>
                    <Select value={filterProdusen} onValueChange={setFilterProdusen}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Pilih bidang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-">Semua</SelectItem>
                            {produsenOptions.map((opt: any) => (
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