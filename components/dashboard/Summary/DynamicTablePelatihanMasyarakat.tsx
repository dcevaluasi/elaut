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

    return (
        <Card className="w-full shadow-md mt-5">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <HiUserGroup className="text-blue-600" />
                    {title}
                </CardTitle>
                <div className="flex gap-2">
                    <Button size="sm" onClick={exportToExcel}>
                        Export Excel
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="text-center">
                                <TableHead className="text-center">No</TableHead>
                                <TableHead className="text-center">{rowKey}</TableHead>
                                {columns.map((col) => (
                                    <TableHead key={col}>{col}</TableHead>
                                ))}
                                <TableHead className="text-center">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupedData.map((row, index) => (
                                <TableRow key={row.row}>
                                    <TableCell className="font-medium">{index + 1}.</TableCell>
                                    <TableCell className="font-medium">{row.row}</TableCell>
                                    {columns.map((col) => (
                                        <TableCell key={col}>{row[col]}</TableCell>
                                    ))}
                                    <TableCell className="font-bold">{row.total}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell className="font-bold"></TableCell>
                                <TableCell className="font-bold">TOTAL</TableCell>
                                {columns.map((col) => (
                                    <TableCell key={col} className="font-bold">
                                        {totals[col]}
                                    </TableCell>
                                ))}
                                <TableCell className="font-bold">{totals.total}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
