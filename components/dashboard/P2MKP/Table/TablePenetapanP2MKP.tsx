"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import { TbCertificate } from "react-icons/tb";
import { Loader2, Search } from "lucide-react";
import { P2MKPCertificateAction } from "./P2MKPCertificateAction";

/**
 * TablePenetapanP2MKP component provides a table view of P2MKP data
 * with the ability to view and download establishment certificates.
 */
const TablePenetapanP2MKP = () => {
    const { data: p2mkpData, loading, error } = useFetchDataP2MKP();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = useMemo(() => {
        if (!p2mkpData) return [];
        return p2mkpData.filter((row) => {
            const matchesSearch = !search || 
                row.nama_Ppmkp?.toLowerCase().includes(search.toLowerCase()) ||
                row.nama_penanggung_jawab?.toLowerCase().includes(search.toLowerCase()) ||
                row.kota?.toLowerCase().includes(search.toLowerCase());
            return matchesSearch;
        });
    }, [p2mkpData, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Memuat data penetapan P2MKP...</p>
        </div>
    );
    
    if (error) return (
        <div className="p-10 text-center bg-rose-50 border border-rose-100 rounded-[2.5rem]">
            <p className="text-rose-600 font-bold">Terjadi kesalahan: {error}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Table Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700" />
                
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Data Penetapan P2MKP</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Monitoring Sertifikat Penetapan Lembaga</p>
                </div>
                
                <div className="relative group/search z-10">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-500 transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Cari berdasarkan nama atau lokasi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-96 h-12 pl-12 pr-6 bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="w-20 px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">No</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Lembaga</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Penanggung Jawab</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahun Penetapan</th>
                                <th className="w-48 px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedData.map((row, index) => (
                                <tr key={row.IdPpmkp} className="hover:bg-slate-50/50 transition-colors group/row">
                                    <td className="px-8 py-6 text-center text-xs font-black text-slate-400/60">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[14px] font-black text-slate-700 leading-tight group-hover/row:text-blue-600 transition-colors uppercase tracking-tight">
                                                {row.nama_Ppmkp}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {row.kota}, {row.provinsi}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">
                                            {row.nama_penanggung_jawab}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="inline-flex items-center px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            {row.tahun_penetapan || "2025"}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center">
                                            <P2MKPCertificateAction p2mkp={row} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-24">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center shadow-inner">
                                                <TbCertificate className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-800 font-black uppercase tracking-widest text-sm">Tidak ada data ditemukan</p>
                                                <p className="text-slate-400 font-medium text-xs tracking-tight uppercase">Coba sesuaikan kata kunci pencarian Anda</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 translate-y-8 -translate-x-8 w-32 h-32 bg-slate-50/50 rounded-full blur-2xl transition-colors duration-700 pointer-events-none" />
                
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">
                    Menampilkan <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)}</span> Dari <span className="text-slate-800">{filteredData.length}</span> Data
                </p>
                <div className="flex gap-3 relative z-10">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-6 rounded-xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-6 rounded-xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Selanjutnya
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TablePenetapanP2MKP;
