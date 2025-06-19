import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPelatihan } from "@/types/user";
import { Button } from "@/components/ui/button";
import { utils, writeFile } from "xlsx";
import { getCurrentQuarter, getCurrentYear, getQuarterForFiltering, parseIndonesianDate } from "@/utils/time";

type TableDataProps = {
  dataUserPelatihan: UserPelatihan[];
};

const TableDataPelatihanMasyarakatByPendidikan = ({ dataUserPelatihan }: TableDataProps) => {
  const [year, setYear] = React.useState(getCurrentYear);
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    dataUserPelatihan.forEach((item) => {
      const date = parseIndonesianDate(item.TanggalSertifikat!);
      if (date) {
        years.add(date.getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [dataUserPelatihan]);

  const [quarter, setQuarter] = React.useState(() => getCurrentQuarter());
  const filteredData = useMemo(() => {
    return dataUserPelatihan.filter((item) => {
      const date = parseIndonesianDate(item.TanggalSertifikat!);
      if (!date) return false;

      const itemYear = date.getFullYear().toString();
      const itemQuarter = getQuarterForFiltering(item.TanggalSertifikat!);

      return itemYear === year && itemQuarter === quarter;
    });
  }, [dataUserPelatihan, year, quarter]);

  // Ambil daftar unik PenyelenggaraPelatihan sebagai baris
  const penyelenggaraList = useMemo(() => {
    return Array.from(new Set(dataUserPelatihan.map((item) => item.PenyelenggaraPelatihan!)));
  }, [dataUserPelatihan]);

  // Ambil daftar unik PendidikanTerakhir sebagai kolom
  const pendidikanList = useMemo(() => {
    return Array.from(new Set(dataUserPelatihan.map((item) => item.PendidikanTerakhir)));
  }, [dataUserPelatihan]);

  const groupedData = useMemo(() => {
    const map = new Map<string, Record<string, number>>();

    penyelenggaraList.forEach((penyelenggara) => {
      map.set(
        penyelenggara,
        Object.fromEntries(pendidikanList.map((p) => [p, 0]))
      );
    });

    filteredData
      .filter((item) => item.FileSertifikat && (item.FileSertifikat.includes("signed") || item.FileSertifikat.includes('drive')))
      .forEach((item) => {
        const penyelenggara = item.PenyelenggaraPelatihan!;
        const pendidikan = item.PendidikanTerakhir!;
        if (map.has(penyelenggara)) {
          const row = map.get(penyelenggara)!;
          row[pendidikan] = (row[pendidikan] || 0) + 1;
        }
      });

    return Array.from(map.entries()).map(([penyelenggara, data]) => {
      const total = Object.values(data).reduce((sum, val) => sum + val, 0);
      return {
        penyelenggara,
        ...data,
        total,
      } as {
        penyelenggara: string;
        total: number;
        [key: string]: number | string;
      };
    });
  }, [filteredData, penyelenggaraList, pendidikanList]);

  const totalRow: { [key: string]: number } = useMemo(() => {
    const totals: { [key: string]: number } = {};
    pendidikanList.forEach((p) => (totals[p] = 0));
    let grandTotal = 0;

    groupedData.forEach((row) => {
      pendidikanList.forEach((p) => {
        totals[p] += Number(row[p] || 0);
      });
      grandTotal += Number(row.total || 0);
    });

    return { ...totals, grandTotal };
  }, [groupedData, pendidikanList]);

  // Fungsi untuk export ke Excel
  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(groupedData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Penyelenggara_Pendidikan");
    writeFile(workbook, `(BY PENDIDIKAN) CAPAIAN PELATIHAN ${quarter} TA ${year}.xlsx`);
  };

  return (
    <div className="rounded-xl border border-stroke bg-white p-5 shadow-default">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Lulusan Berdasarkan Penyelenggara & Pendidikan  {quarter} TA {year} </h3>
        <div className="flex gap-3">
          <Select onValueChange={setYear} defaultValue={year}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={quarter} onValueChange={(value: string) => setQuarter(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TW I">TW I</SelectItem>
              <SelectItem value="TW II">TW II</SelectItem>
              <SelectItem value="TW III">TW III</SelectItem>
              <SelectItem value="TW IV">TW IV</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Export to Excel
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Penyelenggara</TableHead>
            {pendidikanList.map((pendidikan, index) => (
              <TableHead key={index}>{pendidikan}</TableHead>
            ))}
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedData.map((row: any, index: any) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{row.penyelenggara}</TableCell>
              {pendidikanList.map((pendidikan: any, pIndex: any) => (
                <TableCell key={pIndex}>{row[pendidikan] || 0}</TableCell>
              ))}
              <TableCell>{totalRow.grandTotal}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold bg-gray-100">
            <TableCell colSpan={2}>Total</TableCell>
            {pendidikanList.map((pendidikan, index) => (
              <TableCell key={index}>{totalRow[pendidikan]}</TableCell>
            ))}
            <TableCell>{totalRow.grandTotal}</TableCell>
          </TableRow>

        </TableBody>
      </Table>
    </div>
  );
};

export default TableDataPelatihanMasyarakatByPendidikan;
