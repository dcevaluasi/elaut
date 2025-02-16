import { useState, useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PelatihanMasyarakat } from "@/types/product";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { utils, writeFile } from "xlsx";
import { UserPelatihan } from "@/types/user";

// Props untuk komponen
type TableDataPelatihanMasyarakatProps = {
  dataUserPelatihan: UserPelatihan[]
};

const TableDataPelatihanMasyrakatByGender = ({
  dataUserPelatihan
}: TableDataPelatihanMasyarakatProps) => {
  const [year, setYear] = useState("2024");
  const [quarter, setQuarter] = useState("TW I");

  const getTriwulan = (dateString: string) => {
    const month = new Date(dateString).getMonth() + 1;
    if (month >= 1 && month <= 3) return "TW I";
    if (month >= 1 && month <= 6) return "TW II";
    if (month >= 1 && month <= 9) return "TW III";
    if (month >= 1 && month <= 12) return "TW IV";
    return "Unknown";
  };

  const filteredData = useMemo(() => {
    return dataUserPelatihan.filter((item) => {
      const itemYear = new Date(item.CreteAt!)
        .getFullYear()
        .toString();
      const itemQuarter = getTriwulan(item.CreteAt!);
      return itemYear === year && itemQuarter === quarter;
    });
  }, [dataUserPelatihan, year, quarter])

  const groupedData = useMemo(() => {
    const map = new Map<
      string,
      {
        l: number;
        p: number;
        total: number;
      }
    >();

    filteredData.filter((item) => item.FileSertifikat && item.FileSertifikat.trim() !== "").forEach((item) => {
      if (!map.has(item.PenyelenggaraPelatihan)) {
        map.set(item.PenyelenggaraPelatihan, {
          l: 0,
          p: 0,
          total: 0,
        });
      }
      const entry = map.get(item.PenyelenggaraPelatihan)!;

      if (item.JenisKelamin === 'Laki - Laki' || item.JenisKelamin === 'L') {
        entry.l += 1
      } else if (item.JenisKelamin === 'Perempuan' || item.JenisKelamin === 'P') {
        entry.p += 1
      }

      entry.total += 1;
    });

    return Array.from(map.entries()).map(([program, data]) => ({
      program,
      ...data,
    }));
  }, [filteredData]);

  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(
      groupedData.map((item, index) => ({
        No: index + 1,
        "Unit Kerja": item.program,
        "L": item.l,
        "P": item.p,
        Total: item.total,
      }))
    );
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Data Pelatihan");
    writeFile(workbook, "DataPelatihan.xlsx");
  };

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-8 mb-3">
      <div className="flex justify-between items-center p-4">
        <div className="">
          <div className="flex items-center gap-2 font-medium leading-none">
            Jumlah Lulusan Pelatihan  Masyarakat Menurut Jenis Kelamin {" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total masyarakat dilatih per gender
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-4 mb-4">
            <Select onValueChange={setYear} defaultValue={year}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setQuarter} defaultValue={quarter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Pilih Triwulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TW I">TW I</SelectItem>
                <SelectItem value="TW II">TW II</SelectItem>
                <SelectItem value="TW III">TW III</SelectItem>
                <SelectItem value="TW IV">TW IV</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={exportToExcel}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Export to Excel
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Unit Kerja</TableHead>
              <TableHead>L</TableHead>
              <TableHead>P</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.program}</TableCell>
                <TableCell>{item.l}</TableCell>
                <TableCell>{item.p}</TableCell>
                <TableCell>{item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableDataPelatihanMasyrakatByGender;
