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

// type GroupedData = {
//   provinsi: string; // Explicitly define `provinsi` as a string
//   [key: string]: number; // Dynamic keys for bidang pelatihan and total
//   total: number; // Explicitly define `total` as a number
// };

const TableDataPelatihanMasyarakatByProvinsi = ({
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

  // Extract unique bidang pelatihan
  const bidangPelatihan = useMemo(() => {
    const bidangSet = new Set<string>();
    filteredData.forEach((item) => {
      bidangSet.add(item.BidangPelatihan);
    });
    return Array.from(bidangSet);
  }, [filteredData]);

  // Group data by provinsi and bidang pelatihan
  const groupedData = useMemo(() => {
    const map = new Map<string, any>();

    // Initialize the map with all provinsi from provinsiIndonesia
    provinsiIndonesia.forEach((provinsi) => {
      const initialData = bidangPelatihan.reduce((acc, bidang) => {
        acc[bidang] = 0; // Initialize each bidang count to 0
        return acc;
      }, {} as { [key: string]: number });
      initialData.total = 0; // Initialize total count to 0
      map.set(provinsi, { provinsi, ...initialData });
    });

    // Populate the map with data from filteredData
    filteredData.forEach((item) => {
      const provinsi = item.PenyelenggaraPelatihan!;
      const bidang = item.BidangPelatihan;
      const userCount = item.JumlahPeserta || 0;

      if (map.has(provinsi)) {
        const entry = map.get(provinsi)!;
        entry[bidang] += userCount;
        entry.total += userCount;
      }
    });

    return Array.from(map.values());
  }, [filteredData, bidangPelatihan]);

  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(
      groupedData.map((item, index) => ({
        No: index + 1,
        Provinsi: item.provinsi,
        ...bidangPelatihan.reduce((acc, bidang) => {
          acc[bidang] = item[bidang] || 0; // Add each bidang count
          return acc;
        }, {} as { [key: string]: number }),
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
            Lulusan Pelatihan Masyarakat Menurut Provinsi dan Bidang Kompetensi{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total masyarakat dilatih per provinsi per bidang kompetensi
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableDataPelatihanMasyarakatByProvinsi;
