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
export function StatsMetricStatus({ data, tahun }: Props) {
    const metrics = groupPelatihanByStatus(data, tahun)

    return (
        <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-6 shadow-md sm:px-7 w-full overflow-x-hidden">
            <div className="mb-3 flex justify-between items-center">
                <div>
                    <h5 className="text-xl font-semibold text-black">Status Permohonan Pelaksanaan - Penerbitan STTPL</h5>
                    <p className="italic text-sm">{formatDateTime()}</p>
                </div>
            </div>
            <div className="w-full overflow-x-auto pb-2">
                <div className="flex gap-3 min-w-max px-1">
                    {metrics.map(({ status, color, icon, label, count }) => (
                        <Card
                            key={status}
                            className="rounded-xl shadow-sm min-w-[160px] flex-shrink-0 hover:shadow-md transition-all"
                        >
                            <CardContent className="flex flex-col items-center p-4">
                                <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 ${color}`}>
                                    {icon}
                                </div>
                                <span className="text-lg font-semibold">{count}</span>
                                <span className="text-xs text-muted-foreground text-center">{label}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div >
    )
}
