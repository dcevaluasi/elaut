"use client";

import React from "react";
import Cookies from "js-cookie";
import {
    ListChecks,
    EyeOff,
    ClipboardCheck,
    FileCheck2,
    CheckCircle2,
    Eye,
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
    countPublished?: number;
    countVerifying?: number;
    countDone?: number;
    selectedStatusFilter: string;
    setSelectedStatusFilter: (status: string) => void;
    isOperatorBalaiPelatihan?: boolean;

    countDiklatSPV?: number

    // for eselons
    countSigned: number;
    countPendingSigning: number;

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
    countPublished,
    countVerifying,
    countDone,
    selectedStatusFilter,
    setSelectedStatusFilter,
    isOperatorBalaiPelatihan,

    countDiklatSPV,

    // for eselons
    countSigned,
    countPendingSigning,

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
        setSelectedStatusFilter(status);
    };

    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 mb-3">
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

                    {/* accessed by UPT and Operator Pusat */}
                    {Cookies.get('Access')?.includes('createPelatihan') && <>
                        <StatusButton
                            label="Verifikasi Pelaksanaan"
                            count={countVerifying || 0}
                            icon={<ClipboardCheck size={16} />}
                            isSelected={selectedStatusFilter === "Verifikasi Pelaksanaan"}
                            onClick={() => setSelectedStatusFilter("Verifikasi Pelaksanaan")}
                        />

                        <StatusButton
                            label="Done"
                            count={countDone || 0}
                            icon={<CheckCircle2 size={16} />}
                            isSelected={selectedStatusFilter === "Done"}
                            onClick={() => setSelectedStatusFilter("Done")}
                        />

                        <StatusButton
                            label="Published"
                            count={countPublished || 0}
                            icon={<Eye size={16} />}
                            isSelected={selectedStatusFilter === "Published"}
                            onClick={() => setSelectedStatusFilter("Published")}
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


                    {/* for eselons 1,2,3 */}
                    {Cookies.get('Access')?.includes('isSigning') &&
                        <>
                            <StatusButton
                                label="Pending Signing"
                                count={countPendingSigning}
                                isSelected={selectedStatusFilter === "Pending Signing"}
                                onClick={() => handleClickWithDelay("Pending Signing")}
                            />
                            <StatusButton
                                label="Signed"
                                count={countSigned || 0}
                                isSelected={selectedStatusFilter === "Signed"}
                                onClick={() => handleClickWithDelay("Signed")}
                            />
                        </>}

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
