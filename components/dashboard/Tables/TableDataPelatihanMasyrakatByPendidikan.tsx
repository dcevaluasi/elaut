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

const provinsiIndonesia = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bengkulu",
  "Lampung",
  "Kepulauan Bangka Belitung",
  "Kepulauan Riau",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Barat Daya",
];

// Props untuk komponen
type TableDataPelatihanMasyarakatProps = {
  dataPelatihan: PelatihanMasyarakat[];
};

// Define a type for grouped data
type GroupedData = {
  program: string;
  tidakTamatSD: number;
  sd: number;
  smp: number;
  smuSmk: number;
  diDii: number;
  diii: number;
  div: number;
  s1: number;
  s2: number;
  s3: number;
  total: number;
};

const TableDataPelatihanMasyarakatByProvinsi = ({
  dataPelatihan,
}: TableDataPelatihanMasyarakatProps) => {
  const [year, setYear] = useState("2024");
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

  // Group data by program and pendidikan
  const groupedData = useMemo(() => {
    const map = new Map<string, GroupedData>();

    filteredData.forEach((item) => {
      const program = item.PenyelenggaraPelatihan;
      const pendidikan = item.DukunganProgramTerobosan; // Assuming this field exists
      const userCount = item.UserPelatihan?.length || 0;

      if (!map.has(program)) {
        // Initialize the map entry with all pendidikan fields and total
        map.set(program, {
          program,
          tidakTamatSD: 0,
          sd: 0,
          smp: 0,
          smuSmk: 0,
          diDii: 0,
          diii: 0,
          div: 0,
          s1: 0,
          s2: 0,
          s3: 0,
          total: 0,
        });
      }

      const entry = map.get(program)!;
      switch (pendidikan) {
        case "Tidak Tamat SD":
          entry.tidakTamatSD += userCount;
          break;
        case "SD":
          entry.sd += userCount;
          break;
        case "SMP":
          entry.smp += userCount;
          break;
        case "SMU/SMK":
          entry.smuSmk += userCount;
          break;
        case "DI/DII":
          entry.diDii += userCount;
          break;
        case "DIII":
          entry.diii += userCount;
          break;
        case "DIV":
          entry.div += userCount;
          break;
        case "S1":
          entry.s1 += userCount;
          break;
        case "S2":
          entry.s2 += userCount;
          break;
        case "S3":
          entry.s3 += userCount;
          break;
        default:
          break;
      }
      entry.total += userCount;
    });

    return Array.from(map.values());
  }, [filteredData]);

  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(
      groupedData.map((item, index) => ({
        No: index + 1,
        "Unit Kerja": item.program,
        "Tidak Tamat SD": item.tidakTamatSD,
        SD: item.sd,
        SMP: item.smp,
        "SMU/SMK": item.smuSmk,
        "DI/DII": item.diDii,
        DIII: item.diii,
        DIV: item.div,
        S1: item.s1,
        S2: item.s2,
        S3: item.s3,
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
            Lulusan Pelatihan Masyarakat Menurut Pendidikan dan Unit Kerja{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total masyarakat dilatih per pendidikan dan unit kerja
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
              <TableHead>Tidak Tamat SD</TableHead>
              <TableHead>SD</TableHead>
              <TableHead>SMP</TableHead>
              <TableHead>SMU/SMK</TableHead>
              <TableHead>DI/DII</TableHead>
              <TableHead>DIII</TableHead>
              <TableHead>DIV</TableHead>
              <TableHead>S1</TableHead>
              <TableHead>S2</TableHead>
              <TableHead>S3</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.program}</TableCell>
                <TableCell>{item.tidakTamatSD}</TableCell>
                <TableCell>{item.sd}</TableCell>
                <TableCell>{item.smp}</TableCell>
                <TableCell>{item.smuSmk}</TableCell>
                <TableCell>{item.diDii}</TableCell>
                <TableCell>{item.diii}</TableCell>
                <TableCell>{item.div}</TableCell>
                <TableCell>{item.s1}</TableCell>
                <TableCell>{item.s2}</TableCell>
                <TableCell>{item.s3}</TableCell>
                <TableCell>{item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableDataPelatihanMasyarakatByProvinsi;