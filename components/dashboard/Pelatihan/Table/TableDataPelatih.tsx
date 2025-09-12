"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CountStats, useFetchDataInstruktur } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instruktur } from "@/types/instruktur";
import { Input } from "@/components/ui/input";
import { truncateText } from "@/utils";
import AddInstrukturAction from "../../Dashboard/Actions/Instruktur/AddInstrukturAction";
import { Briefcase, FileBadge, GraduationCap, Layers, Rows3, ShieldCheck, Users } from "lucide-react";
import UpdateInstrukturAction from "../../Dashboard/Actions/Instruktur/UpdateInstrukturAction";
import DeleteInstrukturAction from "../../Dashboard/Actions/Instruktur/DeleteInstrukturAction";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"
import Cookies from "js-cookie";

const TableDataPelatih = () => {
    const { instrukturs, loading, error, fetchInstrukturData, stats } = useFetchDataInstruktur()

    useEffect(() => {
        fetchInstrukturData()
    }, [fetchInstrukturData])

    return (
        <div>
            <StatsCards data={instrukturs} stats={stats} />
            <InstrukturTable data={instrukturs} fetchData={fetchInstrukturData} />
        </div>
    );
};

type Props = {
    data: Instruktur[]
    fetchData: any
}

function InstrukturTable({ data, fetchData }: Props) {
    const [search, setSearch] = useState("")
    const [filterKeahlian, setFilterKeahlian] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [filterPendidikan, setFilterPendidikan] = useState("")
    const [filterJabatan, setFilterJabatan] = useState("")

    // ambil unique options biar select lebih dinamis
    const bidangKeahlianOptions = [...new Set(data.map(d => d.bidang_keahlian).filter(Boolean))]
    const statusOptions = [...new Set(data.map(d => d.status).filter(Boolean))]
    const pendidikanOptions = [...new Set(data.map(d => d.pendidikkan_terakhir).filter(Boolean))]
    const jabatanOptions = [...new Set(data.map(d => d.jenjang_jabatan).filter(Boolean))]

    // Filtering logic
    const filteredData = useMemo(() => {
        const cookieIdUnitKerja = Cookies.get("IDUnitKerja");

        return data.filter((row) => {
            const matchesSearch = !search || Object.values(row).some((val) =>
                String(val).toLowerCase().includes(search.toLowerCase())
            )
            const matchesKeahlian = !filterKeahlian || row.bidang_keahlian === filterKeahlian
            const matchesStatus = !filterStatus || row.status === filterStatus
            const matchesPendidikan = !filterPendidikan || row.pendidikkan_terakhir === filterPendidikan
            const matchesJabatan = !filterJabatan || row.jenjang_jabatan === filterJabatan

            return matchesSearch && matchesKeahlian && matchesStatus && matchesPendidikan && matchesJabatan
        })
    }, [data, search, filterKeahlian, filterStatus, filterPendidikan, filterJabatan])


    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const clearFilters = () => {
        setFilterKeahlian("")
        setFilterStatus("")
        setFilterPendidikan("")
        setFilterJabatan("")
        setSearch("")
    }

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Instruktur</h2>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <Input
                        type="text"
                        placeholder="Cari instruktur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-48  py-1 text-sm"
                    />

                    <div className="flex flex-wrap gap-2">
                        <FilterDropdown
                            filterKeahlian={filterKeahlian}
                            setFilterKeahlian={setFilterKeahlian}
                            bidangKeahlianOptions={bidangKeahlianOptions}
                            filterJabatan={filterJabatan}
                            setFilterJabatan={setFilterJabatan}
                            jabatanOptions={jabatanOptions}
                            filterPendidikan={filterPendidikan}
                            setFilterPendidikan={setFilterPendidikan}
                            pendidikanOptions={pendidikanOptions}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            statusOptions={statusOptions}
                            clearFilters={clearFilters}
                        />
                        <AddInstrukturAction onSuccess={fetchData} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full table-fixed text-sm border-collapse">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="sticky top-0 left-0 z-30 bg-gray-100 w-12 px-3 py-3 text-center border">
                                No
                            </th>
                            <th className="sticky top-0 left-12 z-30 bg-gray-100 w-12 px-3 py-3 text-center border">
                                Action
                            </th>
                            <th className="sticky top-0 left-64 z-30 bg-gray-100 w-40 px-3 py-3 text-center border">
                                Nama
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-28 px-3 py-3 text-center border">
                                No. Telp
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-40 px-3 py-3 text-center border">
                                Email
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-36 px-3 py-3 text-center border">
                                NIP
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-32 px-3 py-3 text-center border">
                                Jenjang Jabatan
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-32 px-3 py-3 text-center border">
                                Pangkat/Golongan
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-32 px-3 py-3 text-center border">
                                Bidang Keahlian
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-40 px-3 py-3 text-center border">
                                Management of Training
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-40 px-3 py-3 text-center border">
                                Trainer of Training
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-28 px-3 py-3 text-center border">
                                Sertifikat
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-24 px-3 py-3 text-center border">
                                Status
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-28 px-3 py-3 text-center border">
                                Pendidikan Terakhir
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-40 px-3 py-3 text-center border">
                                Eselon I
                            </th>
                            <th className="sticky top-0 z-20 bg-gray-100 w-40 px-3 py-3 text-center border">
                                Eselon II
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => (
                            <tr
                                key={row.IdInstruktur}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                {/* Sticky Columns */}
                                <td className="sticky left-0 z-20 bg-white px-3 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="sticky left-12 z-20 bg-white px-3 py-4 border">
                                    <div className="flex flex-row gap-2 h-full px-3 py-2">
                                        <UpdateInstrukturAction onSuccess={fetchData} instruktur={row} />
                                        <DeleteInstrukturAction onSuccess={fetchData} instruktur={row} />
                                    </div>
                                </td>
                                <td
                                    className="sticky left-64 z-20 bg-white px-3 py-2 border max-w-full"
                                    title={row.nama}
                                >
                                    {row.nama}
                                </td>

                                {/* Normal Columns */}
                                <td className="px-3 py-2 border">{row.no_telpon}</td>
                                <td className="px-3 py-2 border" title={row.email}>
                                    {row.email}
                                </td>
                                <td className="px-3 py-2 border" title={row.nip}>
                                    {row.nip}
                                </td>
                                <td className="px-3 py-2 border text-center">{row.jenjang_jabatan}</td>
                                <td className="px-3 py-2 border text-center">{row.pelatihan_pelatih}</td>
                                <td className="px-3 py-2 border text-center">{row.bidang_keahlian}</td>
                                <td
                                    className="px-3 py-2 border max-w-[200px] text-blue-600 underline truncate"
                                    title={row.management_of_training}
                                >
                                    <a
                                        href={row.management_of_training}
                                        target="_blank"
                                        rel="noopener noreferrer "
                                        className="truncate"
                                    >
                                        {row.management_of_training}
                                    </a>
                                </td>
                                <td
                                    className="px-3 py-2 border max-w-[200px] text-blue-600 underline truncate"
                                    title={row.training_officer_course}
                                >
                                    <a
                                        href={row.link_data_dukung_sertifikat}
                                        target="_blank"
                                        rel="noopener noreferrer "
                                        className="truncate"
                                    >
                                        {row.training_officer_course}
                                    </a>
                                </td>
                                <td className="px-3 py-2 border text-blue-600 underline text-center truncate">
                                    <a
                                        href={row.link_data_dukung_sertifikat}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="truncate"
                                    >
                                        {truncateText(row.link_data_dukung_sertifikat, 20, "...")}
                                    </a>
                                </td>
                                <td className="px-3 py-2 border text-center">{row.status}</td>
                                <td className="px-3 py-2 border text-center">{row.pendidikkan_terakhir}</td>
                                <td className="px-3 py-2 border max-w-[200px] truncate" title={row.eselon_1}>
                                    {row.eselon_1}
                                </td>
                                <td className="px-3 py-2 border max-w-[200px] truncate" title={row.eselon_2}>
                                    {row.eselon_2}
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={18} className="text-center py-6 text-gray-500 italic">
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
    )
}

function StatsCards({
    data,
    stats,
}: {
    data: Instruktur[]
    stats: CountStats
}) {
    return (
        <div className="my-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* --- Column 1 --- */}
                <div className="flex flex-col gap-6">
                    {/* Total Instruktur */}
                    <Card className="h-fit rounded-xl border border-gray-100 bg-white shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-medium text-gray-600">
                                Total Instruktur
                            </CardTitle>
                            <Users className="h-5 w-5 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-800">{data.length}</p>
                            <p className="text-xs text-gray-500">Instruktur terdaftar</p>
                        </CardContent>
                    </Card>

                    {/* Pendidikan & Status */}
                    <div className="flex flex-col gap-6 md:flex-row">
                        {/* Pendidikan Terakhir */}
                        <Card className="w-full h-full rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                            <CardHeader className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-purple-500" />
                                <CardTitle className="text-lg font-semibold text-center text-gray-800">
                                    Pendidikan Terakhir
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="grid grid-cols-1 gap-2">
                                    {Object.entries(stats.pendidikanTerakhir).map(([key, count]) => (
                                        <li
                                            key={key}
                                            className="flex items-center justify-between rounded-lg bg-purple-50 px-3 py-2 text-sm transition hover:bg-purple-100"
                                        >
                                            <span className="font-medium text-gray-700">{key}</span>
                                            <span className="font-bold text-purple-600">{count}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Status Instruktur */}
                        <Card className="w-full h-full rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                            <CardHeader className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-teal-500" />
                                <CardTitle className="text-lg font-semibold text-center text-gray-800">
                                    Status Instruktur
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="grid grid-cols-1 gap-2">
                                    {Object.entries(stats.status).map(([key, count]) => (
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
                </div>

                {/* --- Column 2 --- */}
                <div className="flex flex-col gap-6">
                    {/* Total Instruktur */}
                    <Card className="h-fit rounded-xl border border-gray-100 bg-white shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-medium text-gray-600">
                                Total ToT
                            </CardTitle>
                            <FileBadge className="h-5 w-5 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-800">{stats.tot}</p>
                            <p className="text-xs text-gray-500">Instruktur memiliki ToT</p>
                        </CardContent>
                    </Card>

                    {/* Bidang Keahlian */}
                    <Card className="w-full h-full rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                        <CardHeader className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-lg font-semibold text-gray-800">
                                Bidang Keahlian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="grid grid-cols-2 gap-2">
                                {Object.entries(stats.bidangKeahlian).map(([key, count]) => (
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

                {/* --- Column 3 --- */}
                <Card className="h-full rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-lg">
                    <CardHeader className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-green-500" />
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Jenjang Jabatan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="grid grid-cols-2 gap-2">
                            {Object.entries(stats.jenjangJabatan).map(([key, count]) => (
                                <li
                                    key={key}
                                    className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm transition hover:bg-green-100"
                                >
                                    <span className="font-medium text-gray-700">{key}</span>
                                    <span className="font-bold text-green-600">{count}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


function FilterDropdown({
    filterKeahlian,
    setFilterKeahlian,
    bidangKeahlianOptions,
    filterJabatan,
    setFilterJabatan,
    jabatanOptions,
    filterPendidikan,
    setFilterPendidikan,
    pendidikanOptions,
    filterStatus,
    setFilterStatus,
    statusOptions,
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

                {/* Bidang Keahlian */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Bidang Keahlian</label>
                    <Select value={filterKeahlian} onValueChange={setFilterKeahlian}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Pilih bidang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-">Semua</SelectItem>
                            {bidangKeahlianOptions.map((opt: any) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Jenjang Jabatan */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Jenjang Jabatan</label>
                    <Select value={filterJabatan} onValueChange={setFilterJabatan}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-">Semua</SelectItem>
                            {jabatanOptions.map((opt: any) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Pendidikan */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Pendidikan</label>
                    <Select value={filterPendidikan} onValueChange={setFilterPendidikan}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Pilih pendidikan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-">Semua</SelectItem>
                            {pendidikanOptions.map((opt: any) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-">Semua</SelectItem>
                            {statusOptions.map((opt: any) => (
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

export default TableDataPelatih;
