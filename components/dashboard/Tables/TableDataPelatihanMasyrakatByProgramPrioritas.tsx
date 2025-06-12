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

// Props untuk komponen
type TableDataPelatihanMasyarakatProps = {
  dataPelatihan: PelatihanMasyarakat[];
};

const TableDataPelatihanMasyarakatByProgramPrioritas = ({
  dataPelatihan,
}: TableDataPelatihanMasyarakatProps) => {
  const [year, setYear] = useState("2025");
  const [quarter, setQuarter] = useState("TW II");

  // Fungsi untuk menentukan triwulan berdasarkan tanggal
  const getTriwulan = (dateString: string) => {
    const month = new Date(dateString).getMonth() + 1;
    if (month >= 1 && month <= 3) return "TW I";
    if (month >= 1 && month <= 6) return "TW II";
    if (month >= 1 && month <= 9) return "TW III";
    if (month >= 1 && month <= 12) return "TW IV";
    return "Unknown";
  };

  // Filter data berdasarkan tahun dan triwulan
  const filteredData = useMemo(() => {
    return dataPelatihan.filter((item) => {
      const itemYear = new Date(item.TanggalMulaiPelatihan)
        .getFullYear()
        .toString();
      const itemQuarter = getTriwulan(item.TanggalMulaiPelatihan);
      return itemYear === year && itemQuarter === quarter;
    });
  }, [dataPelatihan, year, quarter]);

  // Group data by program dan penyelenggara (BPPP)
  const groupedData = useMemo(() => {
    const map = new Map<
      string,
      {
        bppp1: number;
        bppp2: number;
        bppp3: number;
        bppp4: number;
        bppp5: number;
        total: number;
      }
    >();

    filteredData.forEach((item) => {
      if (!map.has(item.DukunganProgramTerobosan)) {
        map.set(item.DukunganProgramTerobosan, {
          bppp1: 0,
          bppp2: 0,
          bppp3: 0,
          bppp4: 0,
          bppp5: 0,
          total: 0,
        });
      }
      const entry = map.get(item.DukunganProgramTerobosan)!;
      const userCount =
        item.JumlahPeserta != null ? item.JumlahPeserta : 0;

      // Sesuaikan dengan nama BPPP yang sesuai
      switch (item.PenyelenggaraPelatihan) {
        case "BPPP Medan":
          entry.bppp1 += userCount;
          break;
        case "BPPP Tegal":
          entry.bppp2 += userCount;
          break;
        case "BPPP Banyuwangi":
          entry.bppp3 += userCount;
          break;
        case "BPPP Bitung":
          entry.bppp4 += userCount;
          break;
        case "BPPP Ambon":
          entry.bppp5 += userCount;
          break;
        default:
          break;
      }
      entry.total += userCount;
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
        "Program Prioritas": item.program,
        "BPPP Medan": item.bppp1,
        "BPPP Tegal": item.bppp2,
        "BPPP Banyuwangi": item.bppp3,
        "BPPP Bitung": item.bppp4,
        "BPPP Ambon": item.bppp5,
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
            Jumlah Pelatihan dan Lulusan Pelatihan Menurut Sasaran Program {" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total masyarakat dilatih per sasaran
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
              <TableHead>Program Prioritas</TableHead>
              <TableHead>BPPP Medan</TableHead>
              <TableHead>BPPP Tegal</TableHead>
              <TableHead>BPPP Banyuwangi</TableHead>
              <TableHead>BPPP Bitung</TableHead>
              <TableHead>BPPP Ambon</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.program}</TableCell>
                <TableCell>{item.bppp1}</TableCell>
                <TableCell>{item.bppp2}</TableCell>
                <TableCell>{item.bppp3}</TableCell>
                <TableCell>{item.bppp4}</TableCell>
                <TableCell>{item.bppp5}</TableCell>
                <TableCell>{item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableDataPelatihanMasyarakatByProgramPrioritas;
