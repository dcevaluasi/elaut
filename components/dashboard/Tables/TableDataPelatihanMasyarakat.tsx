import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import { utils, writeFile } from "xlsx";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPelatihan } from "@/types/user";
import { getCurrentQuarter, getCurrentYear, getQuarterForFiltering, parseIndonesianDate } from "@/utils/time";

type TableDataPelatihanMasyarakatProps = {
  dataUserPelatihan: UserPelatihan[];
};

const TableDataPelatihanMasyarakat: React.FC<TableDataPelatihanMasyarakatProps> = ({ dataUserPelatihan }) => {
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

      return itemYear === year;
    });
  }, [dataUserPelatihan, year]);

  const groupedData = useMemo(() => {
    const map = new Map<string, { total: number; triwulan: Record<string, number> }>();

    filteredData.filter((item) => item.FileSertifikat && (item.FileSertifikat.includes("signed") || item.FileSertifikat.includes('drive'))).forEach(({ PenyelenggaraPelatihan, TanggalSertifikat }) => {
      const triwulan = getQuarterForFiltering(TanggalSertifikat!);
      if (!map.has(PenyelenggaraPelatihan!)) {
        map.set(PenyelenggaraPelatihan!, {
          total: 0,
          triwulan: {
            "TW I": 0,
            "TW II": 0,
            "TW III": 0,
            "TW IV": 0,
          },
        });
      }

      const entry = map.get(PenyelenggaraPelatihan!)!;
      // Fix to avoid NaN:
      if (entry.triwulan[triwulan] == null) {
        entry.triwulan[triwulan] = 0;
      }

      entry.triwulan[triwulan] += 1;
      entry.total += 1;
    });


    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }));
  }, [filteredData]);

  const totalRow = useMemo(() => {
    return groupedData.reduce(
      (acc, item) => {
        acc["TW I"] += item.triwulan["TW I"];
        acc["TW II"] += item.triwulan["TW II"];
        acc["TW III"] += item.triwulan["TW III"];
        acc["TW IV"] += item.triwulan["TW IV"];
        acc.total += item.total;
        return acc;
      },
      {
        "TW I": 0,
        "TW II": 0,
        "TW III": 0,
        "TW IV": 0,
        total: 0,
      }
    );
  }, [groupedData]);

  const exportToExcel = () => {
    const dataToExport = groupedData.map((item, index) => ({
      No: index + 1,
      "Nama Balai": item.name,
      "TW I": item.triwulan["TW I"],
      "TW II": item.triwulan["TW II"],
      "TW III": item.triwulan["TW III"],
      "TW IV": item.triwulan["TW IV"],
      Total: item.total,
    }));

    dataToExport.push({
      No: 0,
      "Nama Balai": 'Total',
      "TW I": totalRow["TW I"],
      "TW II": totalRow["TW II"],
      "TW III": totalRow["TW III"],
      "TW IV": totalRow["TW IV"],
      Total: totalRow.total,
    });

    const worksheet = utils.json_to_sheet(dataToExport);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Data Pelatihan");
    writeFile(workbook, `(BY SATKER BY TW) CAPAIAN PELATIHAN ${quarter} TA ${year}.xlsx`);
  };

  return (
    <div className="col-span-12 rounded-xl border mt-6 border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-8 mb-3">
      <div className="flex justify-between items-center p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-medium leading-none">
            Total Masyarakat Dilatih per Balai Pelatihan TA {year}  <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">Showing total masyarakat dilatih</div>
        </div>

        <div className="flex gap-4">
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

          <Button onClick={exportToExcel} className="bg-blue-500 text-white hover:bg-blue-600">
            Export to Excel
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nama Balai</TableHead>
              <TableHead>Triwulan I</TableHead>
              <TableHead>Triwulan II</TableHead>
              <TableHead>Triwulan III</TableHead>
              <TableHead>Triwulan IV</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.triwulan["TW I"]}</TableCell>
                <TableCell>{item.triwulan["TW II"]}</TableCell>
                <TableCell>{item.triwulan["TW III"]}</TableCell>
                <TableCell>{item.triwulan["TW IV"]}</TableCell>
                <TableCell>{item.total}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-gray-100">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell>{totalRow["TW I"]}</TableCell>
              <TableCell>{totalRow["TW II"]}</TableCell>
              <TableCell>{totalRow["TW III"]}</TableCell>
              <TableCell>{totalRow["TW IV"]}</TableCell>
              <TableCell>{totalRow.total}</TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableDataPelatihanMasyarakat;