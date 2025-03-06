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
import { PelatihanMasyarakat } from "@/types/product";
import { UserPelatihan } from "@/types/user";

type TableDataPelatihanMasyarakatProps = {
  dataUserPelatihan: UserPelatihan[];
};

const getTriwulan = (dateString: string) => {
  const month = new Date(dateString).getMonth() + 1;
  if (month >= 1 && month <= 3) return "Triwulan I";
  if (month >= 1 && month <= 6) return "Triwulan II";
  if (month >= 1 && month <= 9) return "Triwulan III";
  if (month >= 1 && month <= 12) return "Triwulan IV";
  return "Unknown";
};

const TableDataPelatihanMasyarakat: React.FC<TableDataPelatihanMasyarakatProps> = ({ dataUserPelatihan }) => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const filteredData = useMemo(() => {
    return dataUserPelatihan.filter(({ CreteAt }) =>
      new Date(CreteAt!).getFullYear().toString() === selectedYear
    );
  }, [dataUserPelatihan, selectedYear]);

  const groupedData = useMemo(() => {
    const map = new Map<string, { total: number; triwulan: Record<string, number> }>();

    filteredData.filter((item) => item.FileSertifikat && item.FileSertifikat.trim() !== "").forEach(({ PenyelenggaraPelatihan, CreteAt }) => {
      const triwulan = getTriwulan(CreteAt!);
      if (!map.has(PenyelenggaraPelatihan!)) {
        map.set(PenyelenggaraPelatihan!, {
          total: 0,
          triwulan: {
            "Triwulan I": 0,
            "Triwulan II": 0,
            "Triwulan III": 0,
            "Triwulan IV": 0,
          },
        });
      }
      const entry = map.get(PenyelenggaraPelatihan!)!;
      entry.total += 1;
      entry.triwulan[triwulan] += 1;
    });

    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }));
  }, [filteredData]);

  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(
      groupedData.map((item, index) => ({
        No: index + 1,
        "Nama Balai": item.name,
        "Triwulan I": item.triwulan["Triwulan I"],
        "Triwulan II": item.triwulan["Triwulan II"],
        "Triwulan III": item.triwulan["Triwulan III"],
        "Triwulan IV": item.triwulan["Triwulan IV"],
        Total: item.total,
      }))
    );
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Data Pelatihan");
    writeFile(workbook, `DataPelatihan_${selectedYear}.xlsx`);
  };

  return (
    <div className="col-span-12 rounded-xl border mt-6 border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-8 mb-3">
      <div className="flex justify-between items-center p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-medium leading-none">
            Total Masyarakat Dilatih per Balai Pelatihan <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">Showing total masyarakat dilatih</div>
        </div>

        <div className="flex gap-4">
          <Select onValueChange={setSelectedYear} defaultValue={selectedYear}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(new Set(dataUserPelatihan.map(({ CreteAt }) =>
                new Date(CreteAt!).getFullYear().toString()
              ))).sort().map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
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
                <TableCell>{item.triwulan["Triwulan I"]}</TableCell>
                <TableCell>{item.triwulan["Triwulan II"]}</TableCell>
                <TableCell>{item.triwulan["Triwulan III"]}</TableCell>
                <TableCell>{item.triwulan["Triwulan IV"]}</TableCell>
                <TableCell>{item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableDataPelatihanMasyarakat;