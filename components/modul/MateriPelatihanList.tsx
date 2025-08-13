"use client";

import { useState, useMemo } from "react";
import { BookOpen, FileText, Loader2, Calendar, Users, Clock, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { MdBusiness, MdClear, MdSchool, MdSearch } from "react-icons/md";
import { UPT } from "@/constants/nomenclatures";
import { PROGRAM_AKP, PROGRAM_KELAUTAN, PROGRAM_PERIKANAN } from "@/constants/pelatihan";

export function MateriPelatihanList() {
    const { data, loading, error } = useFetchDataMateriPelatihanMasyarakat();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterCategorySasaran, setFilterCategorySasaran] = useState("");
    const [filterCategoryPenyelenggara, setFilterCategoryPenyelenggara] = useState("");

    // Filtered & paginated data
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter((materi) => {
            const matchSearch = materi.NamaMateriPelatihan.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCategory = filterCategory ? materi.BidangMateriPelatihan === filterCategory : true;

            return matchSearch && matchCategory;
        });
    }, [data, searchQuery, filterCategory, filterCategorySasaran, filterCategoryPenyelenggara]);


    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="max-w-6xl mx-auto mt-36 space-y-8">
            {/* Search Bar */}
            <div className="mb-4 flex flex-wrap items-center !text-sm w-full gap-3 p-3 bg-white rounded-2xl shadow-sm border border-neutral-200">

                {/* Program Pelatihan */}
                <Select
                    value={filterCategory}
                    onValueChange={(value) => setFilterCategory(value)}
                >
                    <SelectTrigger className="w-fit md:w-1/4  bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 flex text-left items-center gap-2">
                        <MdSchool className="text-neutral-500 w-5 h-5" />
                        <SelectValue placeholder="Program Pelatihan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>AKP</SelectLabel>
                            {PROGRAM_AKP.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Perikanan</SelectLabel>
                            {PROGRAM_PERIKANAN.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Kelautan</SelectLabel>
                            {PROGRAM_KELAUTAN.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* Penyelenggara */}
                <Select

                >
                    <SelectTrigger className="w-fit  bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 flex items-center gap-2">
                        <MdBusiness className="text-neutral-500 w-5 h-5" />
                        <SelectValue placeholder="Pilih Satker/Penyelenggara" />
                    </SelectTrigger>
                    <SelectContent>
                        {UPT.map((item, index) => (
                            <SelectItem key={index} value={item}>
                                {item}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Search */}
                <div className="flex items-center w-full md:flex-1 bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 gap-2">
                    <MdSearch className="text-neutral-500 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Cari berdasarkan Nama Pelatihan"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full border-none bg-transparent text-sm focus:ring-0 focus:outline-none"
                    />
                </div>

                {/* Clear Filter */}
                {(filterCategory || filterCategoryPenyelenggara || filterCategorySasaran) && (
                    <Button
                        onClick={() => {
                            setFilterCategory("");
                            setFilterCategoryPenyelenggara("");
                            setFilterCategorySasaran("");
                        }}
                        className="h-12 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl shadow-sm flex items-center gap-2"
                    >
                        <MdClear className="w-5 h-5" />
                        Bersihkan Filter
                    </Button>
                )}
            </div>

            {/* Grid Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {paginatedData.map((materi) => {
                    const jumlahModul = materi.ModulPelatihan.length;
                    const jumlahPengajar = Math.floor(Math.random() * 5) + 1; // dummy
                    const jamPelajaran = jumlahModul * 2; // dummy

                    return (
                        <Card
                            key={materi.IdMateriPelatihan}
                            className="shadow-sm border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white"
                        >
                            {/* HEADER */}
                            <CardHeader className="bg-gradient-to-r from-blue-500/5 via-blue-500/5 to-transparent p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                            <BookOpen className="w-5 h-5 text-blue-500" />
                                            {materi.NamaMateriPelatihan.replace(/-/g, " ")}
                                        </CardTitle>
                                        <CardDescription className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            {materi.CreateAt}
                                        </CardDescription>
                                    </div>
                                    {materi.BidangMateriPelatihan && (
                                        <Badge variant="secondary" className="text-xs">
                                            {materi.BidangMateriPelatihan}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            {/* CONTENT */}
                            <CardContent className="p-6 space-y-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {materi.DeskripsiMateriPelatihan ||
                                        "Pelatihan ini membahas materi terkait perikanan dan akuakultur secara mendalam."}
                                </p>

                                {/* Info Row */}
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <Users className="w-5 h-5 mx-auto text-blue-500" />
                                        <p className="text-xs text-gray-500 mt-1">Pengajar</p>
                                        <p className="text-sm font-semibold">{jumlahPengajar}</p>
                                    </div>
                                    <div>
                                        <FileText className="w-5 h-5 mx-auto text-blue-500" />
                                        <p className="text-xs text-gray-500 mt-1">Modul</p>
                                        <p className="text-sm font-semibold">{jumlahModul}</p>
                                    </div>
                                    <div>
                                        <Clock className="w-5 h-5 mx-auto text-blue-500" />
                                        <p className="text-xs text-gray-500 mt-1">JP</p>
                                        <p className="text-sm font-semibold">{jamPelajaran}</p>
                                    </div>
                                </div>

                                {/* Button */}
                                <Button
                                    onClick={() => router.push(`/layanan/pelatihan/online/${materi.IdMateriPelatihan}`)}
                                    className="w-full rounded-full bg-blue-500 text-white hover:bg-blue-500/90 transition-all duration-200"
                                >
                                    Lihat Detail
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        Prev
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Button
                            key={i}
                            variant={currentPage === i + 1 ? "default" : "outline"}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
