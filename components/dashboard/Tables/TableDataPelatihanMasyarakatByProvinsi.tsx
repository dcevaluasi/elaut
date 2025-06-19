import React, { useMemo } from "react";
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
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { utils, writeFile } from "xlsx";
import { UserPelatihan } from "@/types/user";
import { getCurrentQuarter, getCurrentYear, getQuarterForFiltering, parseIndonesianDate } from "@/utils/time";
import { PROVINCES } from "@/utils/regions";

type TableDataPelatihanMasyarakatProps = {
  dataUserPelatihan: UserPelatihan[]
};

const TableDataPelatihanMasyarakatByProvinsi = ({
  dataUserPelatihan,
}: TableDataPelatihanMasyarakatProps) => {
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

  const bidangPelatihan = useMemo(() => {
    const bidangSet = new Set<string>();
    filteredData.forEach((item) => {
      bidangSet.add(item.BidangPelatihan!);
    });
    return Array.from(bidangSet);
  }, [filteredData]);

  const groupedData = useMemo(() => {
    const map = new Map<string, any>();

    PROVINCES.forEach((provinsi) => {
      const initialData = bidangPelatihan.reduce((acc, bidang) => {
        acc[bidang] = 0;
        return acc;
      }, {} as { [key: string]: number });
      initialData.total = 0;
      map.set(provinsi, { provinsi, ...initialData });
    });

    filteredData.filter((item) => item.FileSertifikat && (item.FileSertifikat.includes("signed") || item.FileSertifikat.includes('drive'))).forEach((item) => {
      const provinsi = item.Provinsi!;
      const BidangPelatihan = item.BidangPelatihan!;

      if (map.has(provinsi)) {
        const entry = map.get(provinsi)!;
        entry[BidangPelatihan] += 1;
        entry.total += 1;
      }
    });

    return Array.from(map.values());
  }, [filteredData, bidangPelatihan]);

  const totalRow = useMemo(() => {
    const totals: { [key: string]: number } = {};

    bidangPelatihan.forEach((bidang) => {
      totals[bidang] = groupedData.reduce((sum, row) => sum + (row[bidang] || 0), 0);
    });

    totals["total"] = groupedData.reduce((sum, row) => sum + row.total, 0);

    return totals;
  }, [groupedData, bidangPelatihan]);


  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(
      groupedData.map((item, index) => ({
        No: index + 1,
        Provinsi: item.provinsi,
        ...bidangPelatihan.reduce((acc, bidang) => {
          acc[bidang] = item[bidang] || 0;
          return acc;
        }, {} as { [key: string]: number }),
        Total: item.total,
      }))
    );

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Data Pelatihan");
    writeFile(workbook, `(BY PROVINSI BY SATKER) CAPAIAN PELATIHAN ${quarter} TA ${year}.xlsx`);
  };

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-8 mb-3">
      <div className="flex justify-between items-center p-4">
        <div className="">
          <div className="flex items-center gap-2 font-medium leading-none">
            Jumlah Lulusan Pelatihan Masyarakat Menurut <br />Provinsi dan Bidang Pelatihan {quarter} TA {year} <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total masyarakat dilatih per provinsi dan satuan kerja
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-4 mb-4">
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
              <TableHead>Provinsi</TableHead>
              {bidangPelatihan.map((bidang, index) => (
                <TableHead key={index}>{bidang}</TableHead>
              ))}
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.provinsi}</TableCell>
                {bidangPelatihan.map((bidang, idx) => (
                  <TableCell key={idx}>{item[bidang] || 0}</TableCell>
                ))}
                <TableCell>{item.total}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-gray-100">
              <TableCell colSpan={2}>Total</TableCell>
              {bidangPelatihan.map((bidang, idx) => (
                <TableCell key={idx}>{totalRow[bidang]}</TableCell>
              ))}
              <TableCell>{totalRow.total}</TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableDataPelatihanMasyarakatByProvinsi;
