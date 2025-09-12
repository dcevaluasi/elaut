"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CountStats } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instruktur } from "@/types/instruktur";
import { Input } from "@/components/ui/input";
import { Briefcase, FileBadge, GraduationCap, Layers, ShieldCheck, Users } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { UnitKerja } from "@/types/master";
import { generatedSignedCertificate } from "@/utils/certificates";
import AddUnitKerjaAction from "../../Dashboard/Actions/UnitKerja/AddUnitKerjaAction";
import { useUnitKerja } from "@/context/UnitKerjaContext";
import Cookies from "js-cookie";
import UpdateUnitKerjaAction from "../../Dashboard/Actions/UnitKerja/UpdateUnitKerjaAction";

const TableDataUnitKerja = () => {
    const { unitKerjas, loading: loadingUnitKerja, error: errorUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja()

    useEffect(() => {
        fetchUnitKerjaData()
    }, [fetchUnitKerjaData])

    return (
        <div>

            <UnitKerjaTable data={unitKerjas} fetchData={fetchUnitKerjaData} />
        </div>
    );
};

type Props = {
    data: UnitKerja[]
    fetchData: any
}

function UnitKerjaTable({ data, fetchData }: Props) {
    const [search, setSearch] = useState("")
    const [filterKeahlian, setFilterKeahlian] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [filterPendidikan, setFilterPendidikan] = useState("")
    const [filterJabatan, setFilterJabatan] = useState("")


    // const bidangKeahlianOptions = [...new Set(data.map(d => d.bidang_keahlian).filter(Boolean))]
    // const statusOptions = [...new Set(data.map(d => d.status).filter(Boolean))]
    // const pendidikanOptions = [...new Set(data.map(d => d.pendidikkan_terakhir).filter(Boolean))]
    // const jabatanOptions = [...new Set(data.map(d => d.jenjang_jabatan).filter(Boolean))]

    const filteredData = useMemo(() => {
        const cookieIdUnitKerja = Cookies.get("IDUnitKerja");

        return data.filter((row) => {
            // search filter
            const matchesSearch =
                !search ||
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(search.toLowerCase())
                );

            // unit kerja filter (only if cookie exists)
            const matchesUnitKerja =
                cookieIdUnitKerja && cookieIdUnitKerja.toString() !== "0"
                    ? String(row.id_unit_kerja ?? "") === cookieIdUnitKerja
                    : true;

            return matchesSearch && matchesUnitKerja;
        });
    }, [data, search]);


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
                <h2 className="text-lg font-semibold text-gray-800">Daftar Unit Kerja</h2>
                {
                    Cookies.get('Access')?.includes('superAdmin') && <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                        <Input
                            type="text"
                            placeholder="Cari unit kerja..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-48  py-1 text-sm"
                        />

                        <div className="flex flex-wrap gap-2">
                            {
                                Cookies.get('Access')?.includes('superAdmin') && <AddUnitKerjaAction onSuccess={fetchData} />
                            }
                        </div>
                    </div>
                }
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full table-fixed text-sm">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="w-12 px-3 py-3 text-center">No</th>
                            <th className="w-12 px-3 py-3 text-center">Action</th>
                            <th className="w-40 px-3 py-3 text-center">Nama</th>
                            <th className="w-28 px-3 py-3 text-center">Alamat</th>
                            <th className="w-40 px-3 py-3 text-center">Pimpinan</th>
                            <th className="w-36 px-3 py-3 text-center">Call Center</th>
                            <th className="w-32 px-3 py-3 text-center">Tipe</th>
                            <th className="w-32 px-3 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => (
                            <tr
                                key={row.id_unit_kerja}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-3 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-3 py-4 border">
                                    <div className="flex flex-row gap-2 h-full px-3 py-2">
                                        <UpdateUnitKerjaAction onSuccess={fetchData} unitKerja={row} />
                                        {/* <DeleteUnitKerjaAction onSuccess={fetchData} unitKerja={row} /> */}
                                    </div>

                                </td>
                                <td
                                    className="px-3 py-2 border max-w-full"
                                    title={row.nama}
                                >
                                    {row.nama}
                                </td>
                                <td className="px-3 py-2 border">{row.alamat}</td>
                                <td
                                    className="px-3 py-2 border max-w-full"
                                    title={row.pimpinan}
                                >
                                    {generatedSignedCertificate(row.pimpinan).name} - {generatedSignedCertificate(row.pimpinan).status_indo}
                                </td>
                                <td
                                    className="px-3 py-2 border max-w-[200px]"
                                    title={row.call_center}
                                >
                                    {row.call_center}
                                </td>
                                <td className="px-3 py-2 border text-center">{row.tipe}</td>
                                <td className="px-3 py-2 border text-center">{row.status}</td>
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

export default TableDataUnitKerja;
