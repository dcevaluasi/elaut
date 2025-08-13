import React from "react";
import {
    ListChecks,
    EyeOff,
    ClipboardCheck,
    FileCheck2,
    CheckCircle2,
} from "lucide-react";

interface TabStatusPelatihanMasyarakatProps {
    dataLength: number;
    countNotPublished: number;
    countVerifying: number;
    countOnProgress: number;
    countDone: number;
    selectedStatusFilter: string;
    setSelectedStatusFilter: (status: string) => void;
    isOperatorBalaiPelatihan: boolean;
}

const StatusButton = ({
    label,
    count,
    icon,
    isSelected,
    onClick,
}: {
    label: string;
    count: number;
    icon: JSX.Element;
    isSelected: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200
      ${isSelected
                ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }
    `}
    >
        <span className="flex items-center justify-center">{icon}</span>
        <span className="font-medium">{label}</span>
        <span
            className={`px-2 py-0.5 text-xs rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                }`}
        >
            {count}
        </span>
    </button>
);

export default function TabStatusPelatihanMasyarakat({
    dataLength,
    countNotPublished,
    countVerifying,
    countOnProgress,
    countDone,
    selectedStatusFilter,
    setSelectedStatusFilter,
    isOperatorBalaiPelatihan,
}: TabStatusPelatihanMasyarakatProps) {
    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 mb-10">
            <section
                aria-labelledby="ticket-statistics-tabs-label"
                className="overflow-x-auto"
            >
                <ul className="flex gap-2 min-w-max">
                    <StatusButton
                        label="Total"
                        count={dataLength}
                        icon={<ListChecks size={16} />}
                        isSelected={selectedStatusFilter === "All"}
                        onClick={() => setSelectedStatusFilter("All")}
                    />

                    {isOperatorBalaiPelatihan && (
                        <StatusButton
                            label="Belum Dipublish"
                            count={countNotPublished}
                            icon={<EyeOff size={16} />}
                            isSelected={selectedStatusFilter === "Belum Dipublish"}
                            onClick={() => setSelectedStatusFilter("Belum Dipublish")}
                        />
                    )}

                    <StatusButton
                        label="Verifikasi"
                        count={countVerifying}
                        icon={<ClipboardCheck size={16} />}
                        isSelected={selectedStatusFilter === "Verifikasi Pelaksanaan"}
                        onClick={() => setSelectedStatusFilter("Verifikasi Pelaksanaan")}
                    />

                    <StatusButton
                        label="Pengajuan Sertifikat"
                        count={countOnProgress}
                        icon={<FileCheck2 size={16} />}
                        isSelected={
                            selectedStatusFilter === "Proses Pengajuan Sertifikat"
                        }
                        onClick={() =>
                            setSelectedStatusFilter("Proses Pengajuan Sertifikat")
                        }
                    />

                    <StatusButton
                        label="Sudah Terbit"
                        count={countDone}
                        icon={<CheckCircle2 size={16} />}
                        isSelected={selectedStatusFilter === "Sudah Di TTD"}
                        onClick={() => setSelectedStatusFilter("Sudah Di TTD")}
                    />
                </ul>
            </section>
        </nav>
    );
}
