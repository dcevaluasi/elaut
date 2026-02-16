"use client";

import React from "react";
import Cookies from "js-cookie";
import {
    LayoutGrid,
    Info,
    Calendar,
    FileSignature,
} from "lucide-react";
import { motion } from "framer-motion";
import { getStatusInfo } from "@/utils/text";

interface StatusButtonProps {
    label: string;
    subLabel?: string;
    count: number;
    icon?: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
}

const StatusButton = ({
    label,
    subLabel,
    count,
    icon,
    isSelected,
    onClick,
}: StatusButtonProps) => (
    <button
        onClick={onClick}
        className={`relative flex flex-col items-start gap-1 px-4 py-2.5 rounded-2xl text-[11px] font-bold transition-all duration-500 min-w-[180px] group overflow-hidden
      ${isSelected
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }
    `}
    >
        {isSelected && (
            <>
                <motion.div
                    layoutId="activeSegment"
                    className="absolute inset-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            </>
        )}

        <div className="relative z-10 w-full flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between w-full">
                <div className={`flex items-center gap-2.5 transition-all duration-500 ${isSelected ? "scale-[1.01]" : "opacity-60 group-hover:opacity-100"}`}>
                    <div className={`p-1.5 rounded-lg transition-all duration-500 ${isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "bg-slate-50 text-slate-400"}`}>
                        {React.cloneElement(icon as React.ReactElement, { size: 14 })}
                    </div>
                    <span className="tracking-tight font-bold uppercase text-[10px] leading-none">{label}</span>
                </div>
                <div className="relative">
                    <span
                        className={`flex items-center justify-center min-w-[28px] h-5 px-1.5 text-[10px] font-black rounded-lg transition-all duration-500 ${isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-500"
                            }`}
                    >
                        {count}
                    </span>
                </div>
            </div>

            {subLabel && (
                <p className={`text-[9px] font-medium leading-none truncate w-full pl-0.5 ${isSelected ? "text-slate-400" : "text-slate-300 group-hover:text-slate-400"}`}>
                    {subLabel}
                </p>
            )}
        </div>
    </button>
);

interface TabStatusPelatihanMasyarakatProps {
    dataLength: number;
    countPublished?: number;
    countVerifying?: number;
    countDone?: number;
    selectedStatusFilter: string;
    setSelectedStatusFilter: (status: string) => void;
    countDiklatSPV?: number;
    countSigned: number;
    countPendingSigning: number;
    isSupervisor?: boolean;
    countApproved?: number;
    activeYear?: string;
}

export default function TabStatusPelatihanMasyarakat({
    dataLength,
    countPublished,
    countVerifying,
    countDone,
    selectedStatusFilter,
    setSelectedStatusFilter,
    countDiklatSPV,
    countSigned,
    countPendingSigning,
    isSupervisor = false,
    countApproved = 0,
    activeYear = "All",
}: TabStatusPelatihanMasyarakatProps) {
    const access = Cookies.get('Access');

    // Role detection
    const isSignatory = access?.includes('isSigning');
    const isSPV = access?.includes('approvePelaksanaanSPV');
    const isAdmin = access?.includes('createPelatihan');

    const getRoleContext = () => {
        if (isSignatory) return "Otoritas TTE";
        if (isSPV) return "Supervisor Validasi";
        if (isAdmin) return "Admin Pelatihan";
        return "Pengamat Sistem";
    }

    // Role-specific sub-labels mapping based on system status info
    const getTabMetadata = (tab: string) => {
        switch (tab) {
            case "All":
                return {
                    label: "Semua",
                    subLabel: "Ikhtisar seluruh data periode ini.",
                    icon: <LayoutGrid size={18} />
                };
            case "Verifikasi Pelaksanaan":
                return {
                    label: "Verifikasi",
                    subLabel: isAdmin ? "Validasi mandiri data pelaksanaan." : "Tinjau data penyelenggaraan.",
                    icon: getStatusInfo("2").icon
                };
            case "Done":
                const doneInfo = getStatusInfo("11");
                return {
                    label: "Selesai",
                    subLabel: "Pelatihan rampung & bersertifikat.",
                    icon: doneInfo.icon
                };
            case "Published":
                const pubInfo = getStatusInfo("0.1");
                return {
                    label: pubInfo.label,
                    subLabel: "Informasi tayang di portal publik.",
                    icon: pubInfo.icon
                };
            case "Pending SPV":
                const spvInfo = getStatusInfo("1");
                return {
                    label: spvInfo.label,
                    subLabel: isSPV ? "Aksi persetujuan Anda diperlukan." : "Menunggu validasi supervisor.",
                    icon: spvInfo.icon
                };
            case "Pending Signing":
                return {
                    label: isSignatory ? "Perlu TTE" : "Proses TTE",
                    subLabel: isSignatory ? "Daftar siap Anda tanda tangani." : "Menunggu TTE Pejabat berwenang.",
                    icon: <FileSignature size={18} />
                };
            case "Signed":
                const signedInfo = getStatusInfo("11");
                return {
                    label: isSignatory ? "Sudah TTE" : "Berhasil TTE",
                    subLabel: isSignatory ? "Sertifikat yang telah Anda proses." : "Sertifikat telah ditandatangani.",
                    icon: signedInfo.icon
                };
            case "Approved":
                const appInfo = getStatusInfo("1.1");
                return {
                    label: appInfo.label,
                    subLabel: "Penyelenggaraan disetujui SPV.",
                    icon: appInfo.icon
                };
            default:
                return { label: tab, subLabel: "", icon: <Info size={18} /> };
        }
    }

    return (
        <div className="mt-8 space-y-4">
            {/* Informative Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                    <div className="relative group/info">
                        <div className="relative p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Informasi Peran</span>
                            <div className="w-6 h-px bg-blue-500/20" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                            Workflow Peran: <span className="text-blue-600">{getRoleContext()}</span>
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            Status operasional aktif sesuai otoritas akun
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                        <Calendar size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Periode Aktif</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">
                            {activeYear === "All" ? "Seluruh Data" : `Tahun ${activeYear}`}
                        </span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide pb-2">
                <nav className="inline-flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm">
                    <StatusButton
                        {...getTabMetadata("All")}
                        count={dataLength}
                        isSelected={selectedStatusFilter === "All"}
                        onClick={() => setSelectedStatusFilter("All")}
                    />

                    {isAdmin && (
                        <>
                            <StatusButton
                                {...getTabMetadata("Verifikasi Pelaksanaan")}
                                count={countVerifying || 0}
                                isSelected={selectedStatusFilter === "Verifikasi Pelaksanaan"}
                                onClick={() => setSelectedStatusFilter("Verifikasi Pelaksanaan")}
                            />
                            <StatusButton
                                {...getTabMetadata("Done")}
                                count={countDone || 0}
                                isSelected={selectedStatusFilter === "Done"}
                                onClick={() => setSelectedStatusFilter("Done")}
                            />
                            <StatusButton
                                {...getTabMetadata("Published")}
                                count={countPublished || 0}
                                isSelected={selectedStatusFilter === "Published"}
                                onClick={() => setSelectedStatusFilter("Published")}
                            />
                        </>
                    )}

                    {isSPV && (
                        <StatusButton
                            {...getTabMetadata("Pending SPV")}
                            count={countDiklatSPV || 0}
                            isSelected={selectedStatusFilter === "Pending SPV"}
                            onClick={() => setSelectedStatusFilter("Pending SPV")}
                        />
                    )}

                    {isSignatory && (
                        <>
                            <StatusButton
                                {...getTabMetadata("Pending Signing")}
                                count={countPendingSigning}
                                isSelected={selectedStatusFilter === "Pending Signing"}
                                onClick={() => setSelectedStatusFilter("Pending Signing")}
                            />
                            <StatusButton
                                {...getTabMetadata("Signed")}
                                count={countSigned || 0}
                                isSelected={selectedStatusFilter === "Signed"}
                                onClick={() => setSelectedStatusFilter("Signed")}
                            />
                        </>
                    )}

                    {isSupervisor && (
                        <StatusButton
                            {...getTabMetadata("Approved")}
                            count={countApproved}
                            isSelected={selectedStatusFilter === "Approved"}
                            onClick={() => setSelectedStatusFilter("Approved")}
                        />
                    )}
                </nav>
            </div>
        </div>
    );
}
