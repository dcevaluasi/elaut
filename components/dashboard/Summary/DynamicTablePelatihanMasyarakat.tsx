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
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import * as XLSX from "xlsx"
import { parseIndonesianDate, getQuarterForFiltering } from "@/utils/time"
import { UserPelatihan } from "@/types/product"
import { toTitleCase } from "@/utils/text"
import { PROVINCES } from "@/utils/regions"


type Props = {
    dataUser: UserPelatihan[]
    rowKey: string // e.g. "Wilker", "Provinsi"
    colKey: string // e.g. "JenisKelamin", "PendidikanTerakhir", "Triwulan"
    title: string
}

export function DynamicTablePelatihanMasyarakat({
    dataUser,
    rowKey,
    colKey,
    title,
}: Props) {
    const [tahun, setTahun] = React.useState<string>("")
    const [triwulan, setTriwulan] = React.useState<string>("")

    // Derive tahun options dynamically
    const tahunOptions = React.useMemo(() => {
        const years = new Set<string>()
        dataUser.forEach((item) => {
            const d = parseIndonesianDate(item.TanggalSertifikat!)
            if (d) years.add(String(d.getFullYear()))
        })
        return Array.from(years).sort()
    }, [dataUser])

    // Filtered data based on tahun & triwulan
    const filteredData = React.useMemo(() => {
        return dataUser.filter((item: UserPelatihan) => {
            if (!item.FileSertifikat || item.FileSertifikat === "" || item.StatusPenandatangan != "Done") return false

            const d = parseIndonesianDate(item.TanggalSertifikat!)
            if (!d) return false

            const itemTahun = String(d.getFullYear())
            const itemTriwulan = getQuarterForFiltering(item.TanggalSertifikat!)

            if (tahun && itemTahun !== tahun) return false
            if (triwulan && itemTriwulan !== triwulan) return false
            return true
        })
    }, [dataUser, tahun, triwulan])

    const columns = React.useMemo(() => {
        if (colKey === "Triwulan") {
            return ["TW I", "TW II", "TW III", "TW IV"]
        }
        return Array.from(
            new Set(filteredData.map((item) => item[colKey] || "Tidak Diketahui"))
        )
    }, [filteredData, colKey])

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
                    const normalized = PROVINCES.find(
                        (p) => p.toLowerCase() === strVal
                    )
                    rowVal = normalized ?? "Tidak Diketahui"
                }
            }

            // derive column value
            let colVal: string
            if (colKey === "Triwulan") {
                colVal = getQuarterForFiltering(item.TanggalSertifikat!) || "Tidak Diketahui"
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

        return Array.from(map.values())
    }, [filteredData, rowKey, colKey, columns, rows])


    // Totals row
    const totals = React.useMemo(() => {
        const base: any = { row: "TOTAL", total: 0 }
        columns.forEach((col) => (base[col] = 0))

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
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
        XLSX.writeFile(wb, `${title}.xlsx`)
    }

    // Clear filters
    const clearFilters = () => {
        setTahun("")
        setTriwulan("")
    }

    return (
        <Card className="w-full shadow-md mt-5">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>{title}</CardTitle>
                <div className="flex gap-2">
                    <Select value={tahun} onValueChange={setTahun}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {tahunOptions.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={triwulan} onValueChange={setTriwulan}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Pilih Triwulan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TW I">TW I</SelectItem>
                            <SelectItem value="TW II">TW II</SelectItem>
                            <SelectItem value="TW III">TW III</SelectItem>
                            <SelectItem value="TW IV">TW IV</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={clearFilters}>
                        Clear
                    </Button>

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
