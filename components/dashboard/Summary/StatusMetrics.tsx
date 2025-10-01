import { Card, CardContent } from "@/components/ui/card"
import { PelatihanMasyarakat } from "@/types/product"
import { getStatusInfo } from "@/utils/text"

type Props = {
    data: PelatihanMasyarakat[]
}

function groupPelatihanByStatus(data: PelatihanMasyarakat[]) {
    // hitung jumlah per status
    const grouped = data.reduce<Record<string, number>>((acc, item) => {
        const status = item.StatusPenerbitan ?? ""
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    // convert jadi array {status, count, label, color, icon}
    return Object.entries(grouped).map(([status, count]) => {
        const info = getStatusInfo(status)
        return { status, count, ...info }
    })
}

export function StatusMetrics({ data }: Props) {
    const metrics = groupPelatihanByStatus(data)

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
                <Card key={i} className="shadow-md rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <div
                            className={`w-12 h-12 flex items-center justify-center rounded-full mb-3 ${m.color}`}
                        >
                            {m.icon}
                        </div>
                        <span className="text-lg font-semibold">{m.count}</span>
                        <span className="text-sm text-muted-foreground">{m.label}</span>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
