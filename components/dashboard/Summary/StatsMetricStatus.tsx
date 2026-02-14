import { Card, CardContent } from "@/components/ui/card"
import { PelatihanMasyarakat } from "@/types/product"
import { formatDateTime } from "@/utils"
import { getStatusInfo } from "@/utils/text"
import { parseIndonesianDate } from "@/utils/time"

type Props = {
    data: PelatihanMasyarakat[]
    tahun: string
}

const ALL_STATUS_CODES = [
    "0", "1", "1.2",
    "2", "3", "4", "5", "6", "7",
    "8", "9", "11", "12", "13", "15",
]

export function groupPelatihanByStatus(
    data: PelatihanMasyarakat[],
    tahun?: string
) {
    // --- Filter by year ---
    const filtered = data.filter((item) => {
        if (!item.TanggalMulaiPelatihan) return false

        let d = new Date(item.TanggalMulaiPelatihan)
        if (isNaN(d.getTime())) {
            d = parseIndonesianDate(item.TanggalMulaiPelatihan) as Date
        }
        if (!d || isNaN(d.getTime())) return false

        const itemTahun = String(d.getFullYear())
        if (tahun && itemTahun !== tahun) return false

        return true
    })

    // --- Count per status ---
    const counts = filtered.reduce<Record<string, number>>((acc, item) => {
        const status = item.StatusPenerbitan ?? ""
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    // --- Map all known statuses (with 0 fallback) ---
    return ALL_STATUS_CODES.map((status) => ({
        status,
        count: counts[status] || 0,
        ...getStatusInfo(status),
    }))
}
const STATUS_THEMES: Record<string, { bg: string; text: string; border: string; iconBg: string; shadow: string }> = {
    "default": { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", iconBg: "bg-slate-200", shadow: "shadow-slate-100" },
    "0": { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", iconBg: "bg-gray-100", shadow: "shadow-gray-100" }, // Draft
    "0.1": { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", iconBg: "bg-indigo-100", shadow: "shadow-indigo-100" }, // Publish
    "1": { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", iconBg: "bg-amber-100", shadow: "shadow-amber-100" }, // Pending SPV
    "1.1": { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", iconBg: "bg-emerald-100", shadow: "shadow-emerald-100" }, // Approved Pelaksanaan
    "1.2": { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", iconBg: "bg-rose-100", shadow: "shadow-rose-100" }, // Perbaikan SPV
    "2": { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", iconBg: "bg-orange-100", shadow: "shadow-orange-100" }, // Pending Verifikator
    "3": { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", iconBg: "bg-red-100", shadow: "shadow-red-100" }, // Perbaikan Verifikator
    "4": { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200", iconBg: "bg-teal-100", shadow: "shadow-teal-100" }, // Approved Pelaksanaan
    "5": { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", iconBg: "bg-blue-100", shadow: "shadow-blue-100" }, // Closed
    "7A": { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200", iconBg: "bg-cyan-100", shadow: "shadow-cyan-100" }, // Pending Kabalai
    "7B": { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", iconBg: "bg-emerald-100", shadow: "shadow-emerald-100" }, // Approved Kabalai
    "7C": { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", iconBg: "bg-rose-100", shadow: "shadow-rose-100" }, // Perbaikan Kabalai
    "7D": { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", iconBg: "bg-green-100", shadow: "shadow-green-100" }, // Signed
    "8": { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", iconBg: "bg-violet-100", shadow: "shadow-violet-100" }, // Pending Kapus
    "9": { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200", iconBg: "bg-pink-100", shadow: "shadow-pink-100" }, // Perbaikan Kapus
    "10": { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200", iconBg: "bg-yellow-100", shadow: "shadow-yellow-100" }, // Approved Kapus
    "11": { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", iconBg: "bg-green-100", shadow: "shadow-green-100" }, // Signed
    "12": { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", iconBg: "bg-orange-100", shadow: "shadow-orange-100" }, // Pending Kabadan
    "13": { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", iconBg: "bg-red-100", shadow: "shadow-red-100" }, // Perbaikan Kabadan
    "14": { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", iconBg: "bg-blue-100", shadow: "shadow-blue-100" }, // Approved Kabadan
    "15": { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", iconBg: "bg-green-100", shadow: "shadow-green-100" }, // Signed
};

export function StatsMetricStatus({ data, tahun }: Props) {
    const metrics = groupPelatihanByStatus(data, tahun)

    return (
        <div className="w-full overflow-x-auto pb-4 pt-2 -mx-1 px-1 custom-scrollbar">
            <div className="flex gap-5 min-w-max px-2">
                {metrics.map(({ status, icon, label, count }) => {
                    const theme = STATUS_THEMES[status] || STATUS_THEMES["default"];

                    return (
                        <div
                            key={status}
                            className={`
                                relative flex flex-col items-start justify-between
                                min-w-[200px] h-[110px] p-5
                                bg-white dark:bg-slate-900 
                                rounded-3xl border border-slate-100 dark:border-slate-800
                                shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]
                                transition-all duration-300 ease-out
                                group cursor-default overflow-hidden
                            `}
                        >
                            {/* Decorative Background Gradient/Glow */}
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${theme.bg.replace('bg-', 'from-')} to-transparent opacity-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                            {/* Header: Label & Icon */}
                            <div className="flex justify-between items-start w-full relative z-10">
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.text} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-lg border ${theme.border}`}>
                                    {label}
                                </span>
                                <div className={`p-2.5 rounded-xl ${theme.iconBg} ${theme.text} bg-opacity-30`}>
                                    <div className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                                        {icon}
                                    </div>
                                </div>
                            </div>

                            {/* Count */}
                            <div className="relative z-10 mt-auto">
                                <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none group-hover:scale-105 origin-left transition-transform duration-300 block">
                                    {count}
                                </span>
                            </div>

                            {/* Bottom Border Accent */}
                            <div className={`absolute bottom-0 left-0 w-full h-1 ${theme.bg.replace('-50', '-500')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
