"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import { parseIndonesianDate, getQuarterForFiltering } from "@/utils/time"
import { UserPelatihan } from "@/types/product"
import { PROVINCES } from "@/utils/regions"
import { HiUserGroup } from "react-icons/hi2"


type Props = {
    dataUser: UserPelatihan[]
    rowKey: string // e.g. "Wilker", "Provinsi"
    colKey: string // e.g. "JenisKelamin", "PendidikanTerakhir", "Triwulan"
    title: string
    tahun: string
    triwulan: string
}

export function DynamicTablePelatihanMasyarakat({
    dataUser,
    rowKey,
    colKey,
    title,
    tahun,
    triwulan
}: Props) {

    // Filtered by tahun & triwulan
    const filteredData = React.useMemo(() => {
        return dataUser.filter((item: UserPelatihan) => {
            if (!item.TanggalMulai) return false

            let d = new Date(item.TanggalMulai)
            if (isNaN(d.getTime())) {
                d = parseIndonesianDate(item.TanggalMulai) as Date
            }
            if (!d || isNaN(d.getTime())) return false

            const itemTahun = String(d.getFullYear())
            const itemTriwulan = getQuarterForFiltering(item.TanggalMulai!)

            // filter by tahun
            if (tahun && itemTahun !== tahun) return false
            // filter by triwulan (only include data up to the selected TW)
            if (triwulan) {
                const order = ["TW I", "TW II", "TW III", "TW IV"]
                const selectedIdx = order.indexOf(triwulan)
                const itemIdx = order.indexOf(itemTriwulan)
                if (itemIdx > selectedIdx) return false
            }

            return true
        })
    }, [dataUser, tahun, triwulan])



    const columns = React.useMemo(() => {
        if (colKey === "Triwulan") {
            const all = ["TW I", "TW II", "TW III", "TW IV"]
            if (!triwulan) return all
            const idx = all.indexOf(triwulan)
            return all.slice(0, idx + 1) // show cumulative up to selected triwulan
        }
        return Array.from(
            new Set(filteredData.map((item) => item[colKey] || "Tidak Diketahui"))
        )
    }, [filteredData, colKey, triwulan])


    const rows = React.useMemo(() => {
        if (rowKey === "Provinsi") {
            return PROVINCES // fixed list
        }
        return Array.from(
            new Set(
                filteredData.map(
                    (item) => String(item[rowKey as keyof UserPelatihan] ?? "Tidak Diketahui")
                )
            )
        )
    }, [filteredData, rowKey])

    const groupedData = React.useMemo(() => {
        const map = new Map<string, any>()

        // initialize map with all rows
        rows.forEach((row) => {
            map.set(row, { row, total: 0 })
            columns.forEach((col) => (map.get(row)[col] = 0))
        })

        filteredData.forEach((item: UserPelatihan) => {
            let rowVal = String(item[rowKey as keyof UserPelatihan] ?? "Tidak Diketahui")

            // normalize Provinsi
            if (rowKey === "Provinsi") {
                if (!rowVal || rowVal === "-" || rowVal === "") {
                    rowVal = "Tidak Diketahui"
                } else {
                    const strVal = String(rowVal).toLowerCase()
                    const normalized = PROVINCES.find((p) => p.toLowerCase() === strVal)
                    rowVal = normalized ?? "Tidak Diketahui"
                }
            }

            // derive column value
            let colVal: string
            if (colKey === "Triwulan") {
                colVal = getQuarterForFiltering(item.TanggalMulai!) || "Tidak Diketahui"
            } else {
                colVal = String(item[colKey as keyof UserPelatihan] ?? "Tidak Diketahui")
            }

            if (!map.has(rowVal)) {
                map.set(rowVal, { row: rowVal, total: 0 })
                columns.forEach((col) => (map.get(rowVal)[col] = 0))
            }

            const row = map.get(rowVal)
            row[colVal] = (row[colVal] || 0) + 1
            row.total++
        })

        // ✅ Make triwulan cumulative
        if (colKey === "Triwulan") {
            const order = ["TW I", "TW II", "TW III", "TW IV"]
            map.forEach((row) => {
                let running = 0
                order.forEach((tw) => {
                    running += row[tw] || 0
                    row[tw] = running
                })
            })
        }

        return Array.from(map.values())
    }, [filteredData, rowKey, colKey, columns, rows])


    const totals = React.useMemo(() => {
        const base: any = { row: "TOTAL", total: 0 }

        // initialize totals for each column
        columns.forEach((col) => (base[col] = 0))

        // accumulate values
        groupedData.forEach((row) => {
            columns.forEach((col) => {
                base[col] += row[col]
            })
            base.total += row.total
        })

        return base
    }, [groupedData, columns])


    // Export Excel
    const exportToExcel = () => {
        const wsData = [
            [rowKey, ...columns, "Total"],
            ...groupedData.map((row) => [row.row, ...columns.map((c) => row[c]), row.total]),
            ["TOTAL", ...columns.map((c) => totals[c]), totals.total],
        ]
        const ws = XLSX.utils.aoa_to_sheet(wsData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Capaian")
        XLSX.writeFile(wb, `${title} - ${triwulan} ${tahun}.xlsx`)
    }
    // 
    return (
        <Card className="w-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-none bg-white dark:bg-slate-900 rounded-[10px] overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="h-10 w-10 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center text-blue-600">
                        <HiUserGroup size={20} />
                    </div>
                    <div className="space-y-0.5">
                        <CardTitle className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider leading-none">
                            {title}
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rowKey} vs {colKey}</p>
                    </div>
                </div>
                <Button
                    size="sm"
                    onClick={exportToExcel}
                    variant="outline"
                    className="h-10 px-5 rounded-xl border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold text-xs uppercase tracking-wider transition-all w-full md:w-auto"
                >
                    Export Excel
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-full">
                <div className="overflow-auto custom-scrollbar max-h-[500px] border-b border-slate-100 dark:border-white/5">
                    <Table>
                        <TableHeader className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-900 shadow-sm">
                            <TableRow className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm hover:bg-slate-100/80 border-b border-slate-100 dark:border-white/5">
                                <TableHead className="w-16 text-center font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">No</TableHead>
                                <TableHead className="text-left font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 min-w-[200px]">{rowKey}</TableHead>
                                {columns.map((col) => (
                                    <TableHead key={col} className="text-center font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 min-w-[100px]">{col}</TableHead>
                                ))}
                                <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-slate-800 dark:text-white bg-slate-100/50 dark:bg-white/5 py-4 w-28">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupedData.map((row, index) => (
                                <TableRow key={row.row} className="hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-colors border-b border-slate-50 dark:border-white/5 last:border-0 group">
                                    <TableCell className="text-center font-bold text-xs text-slate-500">{index + 1}</TableCell>
                                    <TableCell className="font-bold text-xs text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors uppercase">{row.row}</TableCell>
                                    {columns.map((col) => (
                                        <TableCell key={col} className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                                            {row[col] > 0 ? (
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 group-hover:text-blue-700 transition-colors">
                                                    {row[col]}
                                                </span>
                                            ) : "-"}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-center font-black text-xs text-slate-800 dark:text-white bg-slate-50/30 dark:bg-white/5">{row.total}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 border-none">
                                <TableCell className="text-center font-black text-white" colSpan={2}>GRAND TOTAL</TableCell>
                                {columns.map((col) => (
                                    <TableCell key={col} className="text-center font-black text-white text-xs">
                                        {totals[col]}
                                    </TableCell>
                                ))}
                                <TableCell className="text-center font-black text-white text-sm bg-slate-800 dark:bg-slate-700 py-4">{totals.total}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
