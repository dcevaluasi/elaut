import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, CalendarDays, BookOpen } from "lucide-react"

const metrics = [
    {
        title: "Total Trainings",
        value: 24,
        icon: BookOpen,
    },
    {
        title: "Participants",
        value: 320,
        icon: Users,
    },
    {
        title: "Ongoing",
        value: 6,
        icon: CalendarDays,
    },
]

const ongoingTrainings = [
    {
        id: 1,
        title: "Basic Safety Training Fisheries (BSTF)",
        batch: "Angkatan 3/2025",
        progress: 65,
        participants: 40,
        status: "In Progress",
    },
    {
        id: 2,
        title: "Pelatihan HACCP",
        batch: "Surabaya 2025",
        progress: 80,
        participants: 25,
        status: "In Progress",
    },
    {
        id: 3,
        title: "Kecakapan Nelayan",
        batch: "Manggarai Barat",
        progress: 45,
        participants: 60,
        status: "In Progress",
    },
]

export default function MetricsSummaryPelatihan() {
    return (
        <div className="gap-5 flex">
            {/* Metrics */}
            <div className="flex flex-col gap-5">
                {metrics.map((item) => (
                    <Card key={item.title} className="shadow-sm border rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Ongoing Training List */}
            <Card className="shadow-sm border rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Ongoing Trainings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {ongoingTrainings.map((training) => (
                        <div
                            key={training.id}
                            className="space-y-2 border-b last:border-0 pb-4 last:pb-0"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">{training.title}</h3>
                                <Badge variant="secondary">{training.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{training.batch}</p>
                            <Progress value={training.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                {training.participants} participants • {training.progress}% complete
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
