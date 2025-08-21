"use client";

import React from "react";
import Cookies from "js-cookie";
import {
    ListChecks,
    EyeOff,
    ClipboardCheck,
    FileCheck2,
    CheckCircle2,
} from "lucide-react";

interface StatusButtonProps {
    label: string;
    count: number;
    icon?: JSX.Element;
    isSelected: boolean;
    onClick: () => void;
}

const StatusButton = ({
    label,
    count,
    icon,
    isSelected,
    onClick,
}: StatusButtonProps) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200
      ${isSelected
                ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }
    `}
    >
        {icon && <span className="flex items-center justify-center">{icon}</span>}
        <span className="font-medium">{label}</span>
        <span
            className={`px-2 py-0.5 text-xs rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                }`}
        >
            {count}
        </span>
    </button>
);

interface TabStatusPelatihanMasyarakatProps {
    // Common
    dataLength: number;
    countNotPublished?: number;
    countVerifying?: number;
    countOnProgress?: number;
    countDone?: number;
    selectedStatusFilter: string;
    setSelectedStatusFilter: (status: string) => void;
    isOperatorBalaiPelatihan?: boolean;

    countDiklatSPV?: number

    // Extra
    data?: any[];
    isSupervisor?: boolean;
    isPejabat?: boolean;
    isEselonI?: boolean;
    ESELON_2?: { fullName: string };
    setIsFetching?: (value: boolean) => void;

    countApproval?: number;
    countSigningByKaBPPSDMKP?: number;
    countSigning?: number;
    countSigningEselon1?: number;
    countSignedEselon1?: number;
    countSignedEselon2?: number;
    countApproved?: number;
}

export default function TabStatusPelatihanMasyarakat({
    dataLength,
    countNotPublished,
    countVerifying,
    countOnProgress,
    countDone,
    selectedStatusFilter,
    setSelectedStatusFilter,
    isOperatorBalaiPelatihan,

    countDiklatSPV,

    // Extra props
    data = [],
    isSupervisor = false,
    isPejabat = false,
    isEselonI = false,
    ESELON_2 = { fullName: "" },
    setIsFetching = () => { },

    countApproval = 0,
    countSigningByKaBPPSDMKP = 0,
    countSigning = 0,
    countSigningEselon1 = 0,
    countSignedEselon1 = 0,
    countSignedEselon2 = 0,
    countApproved = 0,
}: TabStatusPelatihanMasyarakatProps) {

    const handleClickWithDelay = (status: string) => {
        setIsFetching(true);
        setTimeout(() => {
            setSelectedStatusFilter(status);
            setIsFetching(false);
        }, 800);
    };

    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 mb-10">
            {/* Original Buttons */}
            <section aria-labelledby="ticket-statistics-tabs-label" className="overflow-x-auto">
                <ul className="flex gap-2 min-w-max">

                    <StatusButton
                        label="Total"
                        count={dataLength}
                        icon={<ListChecks size={16} />}
                        isSelected={selectedStatusFilter === "All"}
                        onClick={() => setSelectedStatusFilter("All")}
                    />
                    {Cookies.get('Access')?.includes('createPelatihan') && <>

                        <StatusButton
                            label="Belum Dipublish"
                            count={countNotPublished || 0}
                            icon={<EyeOff size={16} />}
                            isSelected={selectedStatusFilter === "Belum Dipublish"}
                            onClick={() => setSelectedStatusFilter("Belum Dipublish")}
                        />


                        {/* <StatusButton
                            label="Verifikasi"
                            count={countVerifying || 0}
                            icon={<ClipboardCheck size={16} />}
                            isSelected={selectedStatusFilter === "Verifikasi Pelaksanaan"}
                            onClick={() => setSelectedStatusFilter("Verifikasi Pelaksanaan")}
                        /> */}

                        <StatusButton
                            label="On Progress"
                            count={countOnProgress || 0}
                            icon={<FileCheck2 size={16} />}
                            isSelected={selectedStatusFilter === "On Progress"}
                            onClick={() => setSelectedStatusFilter("On Progress")}
                        />

                        <StatusButton
                            label="Sudah Terbit"
                            count={countDone || 0}
                            icon={<CheckCircle2 size={16} />}
                            isSelected={selectedStatusFilter === "Sudah Di TTD"}
                            onClick={() => setSelectedStatusFilter("Sudah Di TTD")}
                        />
                    </>}

                    {Cookies.get('Access')?.includes('approvePelaksanaanSPV') && (
                        <StatusButton
                            label="Pending SPV"
                            count={countDiklatSPV || 0}
                            isSelected={selectedStatusFilter === "Pending SPV"}
                            onClick={() => handleClickWithDelay("Pending SPV")}
                        />
                    )}



                    {isPejabat && (
                        <StatusButton
                            label="Perlu Ditandatangani"
                            count={isEselonI ? countSigningEselon1 : countSigning}
                            isSelected={selectedStatusFilter === "Signing"}
                            onClick={() => handleClickWithDelay("Signing")}
                        />
                    )}

                    {isPejabat && (
                        <StatusButton
                            label="Sudah Ditandatangani"
                            count={isEselonI ? countSignedEselon1 : countSignedEselon2}
                            isSelected={selectedStatusFilter === "Signed"}
                            onClick={() => handleClickWithDelay("Signed")}
                        />
                    )}

                    {isSupervisor && (
                        <StatusButton
                            label="Sudah Diapprove"
                            count={countApproved}
                            isSelected={selectedStatusFilter === "Approved"}
                            onClick={() => handleClickWithDelay("Approved")}
                        />
                    )}

                </ul>
            </section>


        </nav >
    );
}
