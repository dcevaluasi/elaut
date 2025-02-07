import { useState } from "react";
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

const trainingData = [
  {
    id: 1,
    program: "Bulan Cinta Laut",
    medan: 0,
    tegal: 0,
    banyuwangi: 80,
    bitung: 200,
    ambon: 100,
    total: 380,
  },
  {
    id: 2,
    program: "Kampung Nelayan Maju",
    medan: 0,
    tegal: 0,
    banyuwangi: 100,
    bitung: 1146,
    ambon: 0,
    total: 1246,
  },
  {
    id: 3,
    program: "Kampung Perikanan Budidaya",
    medan: 0,
    tegal: 75,
    banyuwangi: 0,
    bitung: 1146,
    ambon: 60,
    total: 1281,
  },
  {
    id: 4,
    program: "Audit Bantuan",
    medan: 0,
    tegal: 0,
    banyuwangi: 0,
    bitung: 0,
    ambon: 0,
    total: 0,
  },
  {
    id: 5,
    program: "Penangkapan Ikan Terukur",
    medan: 189,
    tegal: 272,
    banyuwangi: 24,
    bitung: 1114,
    ambon: 0,
    total: 1599,
  },
];

const TableDataPelatihanMasyrakatByProgramPrioritas = () => {
  const [year, setYear] = useState("2024");
  const [quarter, setQuarter] = useState("TW II");

  return (
    <div className="col-span-12 rounded-xl  border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8 mb-3">
      {" "}
      <div className="p-4">
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
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Program Prioritas</TableHead>
              <TableHead>BP3 Medan</TableHead>
              <TableHead>BP3 Tegal</TableHead>
              <TableHead>BP3 Banyuwangi</TableHead>
              <TableHead>BP3 Bitung</TableHead>
              <TableHead>BP3 Ambon</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainingData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.program}</TableCell>
                <TableCell>{item.medan}</TableCell>
                <TableCell>{item.tegal}</TableCell>
                <TableCell>{item.banyuwangi}</TableCell>
                <TableCell>{item.bitung}</TableCell>
                <TableCell>{item.ambon}</TableCell>
                <TableCell>{item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableDataPelatihanMasyrakatByProgramPrioritas;
