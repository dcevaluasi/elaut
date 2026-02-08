"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { UnitKerja } from "@/types/master";
import Cookies from "js-cookie";
import ManageUnitKerjaAction from "@/commons/actions/unit-kerja/ManageUnitKerjaAction";
import { elautBaseUrl } from "@/constants/urls";
import { motion, AnimatePresence } from "framer-motion";
import { HashLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import {
    TbBuildingSkyscraper,
    TbSearch,
    TbMapPin,
    TbPhone,
    TbUser,
    TbTrash,
    TbBuildingCommunity,
    TbBuildingCottage,
    TbActivity,
    TbArrowLeft,
    TbArrowRight,
    TbBriefcase
} from "react-icons/tb";

const TableDataUnitKerja = () => {
    const { unitKerjas, loading, error, fetchUnitKerjaData } = useFetchDataUnitKerja();

    useEffect(() => {
        fetchUnitKerjaData();
    }, [fetchUnitKerjaData]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <HashLoader color="#3b82f6" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Units...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3">
                <TbActivity className="animate-pulse" />
            </div>
            <button onClick={() => fetchUnitKerjaData()} className="mt-4 px-6 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold shadow-sm hover:bg-gray-50">Retry Connection</button>
        </div>
    );

    return (
        <UnitKerjaList data={unitKerjas} fetchData={fetchUnitKerjaData} />
    );
};

type Props = {
    data: UnitKerja[];
    fetchData: any;
};

function UnitKerjaList({ data, fetchData }: Props) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // Grid layout usually fits 3x3 nicely

    const filteredData = useMemo(() => {
        const cookieIdUnitKerja = Cookies.get("IDUnitKerja");

        return data.filter((row) => {
            const matchesSearch =
                !search ||
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(search.toLowerCase())
                );

            const matchesUnitKerja =
                cookieIdUnitKerja && cookieIdUnitKerja.toString() !== "0" && cookieIdUnitKerja.toString() !== "8"
                    ? String(row.id_unit_kerja ?? "") === cookieIdUnitKerja
                    : true;

            return matchesSearch && matchesUnitKerja;
        });
    }, [data, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page if search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("⚠️ Remove this operational unit? This action usually cannot be undone.");
        if (!confirmDelete) return;

        try {
            const res = await fetch(
                `${elautBaseUrl}/unit-kerja/deleteUnitKerja?id=${id}`,
                {
                    method: "DELETE", headers: {
                        "Authorization": `Bearer ${Cookies.get("XSRF091")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!res.ok) throw new Error("Deletion failed");

            fetchData();
        } catch (error) {
            console.error(error);
            alert("❌ Failed to delete unit.");
        }
    };

    const getTypeIcon = (tipe: string) => {
        if (tipe === 'UPT KKP') return <TbBuildingSkyscraper className="text-blue-500" />;
        if (tipe === 'UPT NON KKP') return <TbBuildingCommunity className="text-indigo-500" />;
        return <TbBuildingCottage className="text-emerald-500" />;
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Action Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm mt-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <TbBuildingSkyscraper size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">Satuan Kerja</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Unit Registry</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            type="text"
                            placeholder="Cari Unit Kerja..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 h-12 rounded-2xl border-gray-100 bg-gray-50/50 dark:bg-white/5 font-bold text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                        />
                    </div>
                    {Cookies.get('Access')?.includes('superAdmin') && (
                        <ManageUnitKerjaAction onSuccess={fetchData} />
                    )}
                </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {paginatedData.map((row, idx) => (
                        <motion.div
                            key={row.id_unit_kerja}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            className="group relative bg-white dark:bg-slate-900 rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col overflow-hidden"
                        >
                            {/* Card Header / Status Strip */}
                            <div className={`h-1.5 w-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                            <div className="p-6 flex-1 flex flex-col gap-6">
                                {/* Title & Type */}
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/5 w-fit">
                                            {getTypeIcon(row.tipe)}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{row.tipe}</span>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ManageUnitKerjaAction onSuccess={fetchData} unitKerja={row} />
                                            {Cookies.get('Access')?.includes('superAdmin') && (
                                                <button
                                                    onClick={() => handleDelete(row.id_unit_kerja)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                                >
                                                    <TbTrash size={14} />
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight line-clamp-2" title={row.nama}>
                                        {row.nama}
                                    </h3>
                                </div>

                                {/* Information Grid */}
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="mt-0.5"><TbMapPin className="text-slate-400 shrink-0" size={16} /></div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{row.alamat || "Alamat tidak tersedia"}</p>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <TbPhone className="text-slate-400 shrink-0" size={16} />
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{row.call_center || "-"}</p>
                                    </div>
                                </div>

                                {/* Leadership Section */}
                                <div className="mt-auto pt-6 border-t border-dashed border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                            <TbUser size={18} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Pimpinan</p>
                                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate" title={parseLeadership(row.pimpinan).name}>
                                                {parseLeadership(row.pimpinan).name}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-500 truncate italic">
                                                {parseLeadership(row.pimpinan).job}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {paginatedData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                    <TbSearch size={48} className="text-gray-300" />
                    <div className="text-center">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Units Found</p>
                        <p className="text-xs font-medium text-slate-300 mt-1">Adjust search filters or add a new operational unit.</p>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-white hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-slate-600 transition-all"
                        >
                            <TbArrowLeft size={14} /> Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-white hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-slate-600 transition-all"
                        >
                            Next <TbArrowRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper to parse the composite string
const parseLeadership = (rawStr: string) => {
    if (!rawStr) return { name: "-", job: "-" };
    // Format: {Name}{JobIndo}{JobEng}{Location}
    const parts = rawStr.match(/\{([^}]+)\}/g)?.map((p) => p.replace(/[{}]/g, ""));
    if (parts && parts.length >= 2) {
        return { name: parts[0], job: parts[1] };
    }
    return { name: rawStr, job: "-" };
};

export default TableDataUnitKerja;
