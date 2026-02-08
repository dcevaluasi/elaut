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
        className={`relative flex flex-col items-start gap-1 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 min-w-[200px] group
      ${isSelected
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }
    `}
    >
        {isSelected && (
            <motion.div
                layoutId="activeSegment"
                className="absolute inset-0 bg-white dark:bg-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-none border border-gray-200/60 dark:border-white/10 rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}

        <div className="relative z-10 w-full flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between w-full">
                <div className={`flex items-center gap-2 transition-all duration-300 ${isSelected ? "scale-105 font-bold" : "opacity-70 group-hover:opacity-100"}`}>
                    <span className="shrink-0">{icon}</span>
                    <span className="tracking-tight line-clamp-1">{label}</span>
                </div>
                <span
                    className={`flex items-center justify-center min-w-[24px] h-5 px-1.5 text-[10px] font-bold rounded-lg transition-all duration-300 ${isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-gray-200 text-gray-500 dark:bg-white/5 dark:text-gray-500 group-hover:bg-gray-300 dark:group-hover:bg-white/10"
                        }`}
                >
                    {count}
                </span>
            </div>

            {subLabel && (
                <p className={`text-[10px] font-medium leading-tight transition-opacity duration-300 line-clamp-2 ${isSelected ? "opacity-90" : "opacity-40 group-hover:opacity-70"}`}>
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
        <div className="mt-10 space-y-4">
            {/* Informative Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-800">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                            Workflow Peran: <span className="text-blue-600 dark:text-blue-400 font-black">{getRoleContext()}</span>
                        </h2>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium italic">
                            Status operasional disesuaikan dengan otoritas akun Anda.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 px-3.5 py-2 bg-gray-100/80 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/5 shadow-inner">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                        Periode: {activeYear === "All" ? "Seluruh Waktu" : `TAHUN ${activeYear}`}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide pb-3">
                <nav className="inline-flex items-center gap-2 p-2 bg-gray-200/40 dark:bg-slate-950/40 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-[26px]">
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
