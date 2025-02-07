import React, { useState } from "react";
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
    province: "Aceh",
    permesinan: 383,
    budidaya: 6,
    penangkapan: 0,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 389,
  },
  {
    id: 2,
    province: "Sumatera Utara",
    permesinan: 200,
    budidaya: 28,
    penangkapan: 103,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 331,
  },
  {
    id: 3,
    province: "Sumatera Barat",
    permesinan: 382,
    budidaya: 0,
    penangkapan: 8,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 390,
  },
  {
    id: 4,
    province: "Riau",
    permesinan: 41,
    budidaya: 0,
    penangkapan: 0,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 41,
  },
  {
    id: 5,
    province: "Kepulauan Riau",
    permesinan: 41,
    budidaya: 0,
    penangkapan: 0,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 41,
  },
  {
    id: 6,
    province: "Jambi",
    permesinan: 5,
    budidaya: 0,
    penangkapan: 1,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 6,
  },
  {
    id: 7,
    province: "Sumatera Selatan",
    permesinan: 282,
    budidaya: 0,
    penangkapan: 2,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 284,
  },
  {
    id: 8,
    province: "Bangka Belitung",
    permesinan: 1,
    budidaya: 0,
    penangkapan: 0,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 1,
  },
  {
    id: 9,
    province: "Bengkulu",
    permesinan: 0,
    budidaya: 0,
    penangkapan: 0,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 0,
  },
  {
    id: 10,
    province: "Lampung",
    permesinan: 382,
    budidaya: 383,
    penangkapan: 191,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 956,
  },
  {
    id: 11,
    province: "DKI Jakarta",
    permesinan: 31,
    budidaya: 2,
    penangkapan: 5,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 38,
  },
  {
    id: 12,
    province: "Jawa Barat",
    permesinan: 960,
    budidaya: 31,
    penangkapan: 1173,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 2164,
  },
  {
    id: 13,
    province: "Banten",
    permesinan: 482,
    budidaya: 100,
    penangkapan: 193,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 775,
  },
  {
    id: 14,
    province: "Jawa Tengah",
    permesinan: 382,
    budidaya: 100,
    penangkapan: 382,
    pengolahan: 0,
    konservasi: 382,
    sumberdaya: 0,
    total: 1246,
  },
  {
    id: 15,
    province: "DI Yogyakarta",
    permesinan: 0,
    budidaya: 0,
    penangkapan: 0,
    pengolahan: 0,
    konservasi: 0,
    sumberdaya: 0,
    total: 0,
  },
  {
    id: 16,
    province: "Jawa Timur",
    permesinan: 964,
    budidaya: 231,
    penangkapan: 784,
    pengolahan: 182,
    konservasi: 0,
    sumberdaya: 0,
    total: 2161,
  },
  {
    id: 17,
    province: "Papua",
    permesinan: 200,
    budidaya: 50,
    penangkapan: 100,
    pengolahan: 30,
    konservasi: 10,
    sumberdaya: 5,
    total: 395,
  },
  {
    id: 18,
    province: "Papua Barat",
    permesinan: 150,
    budidaya: 40,
    penangkapan: 80,
    pengolahan: 25,
    konservasi: 8,
    sumberdaya: 4,
    total: 307,
  },
];

const TableDataPelatihanMasyarakatByProvinsi = () => {
  const [quarter, setQuarter] = React.useState("TW I");
  const [year, setYear] = React.useState<string>("2023");

  return (
    <div className="col-span-12 rounded-xl  border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8 mb-3">
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={setYear} value={year}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Pilih Tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setQuarter} value={quarter}>
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
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Provinsi</TableHead>
              <TableHead>Permesinan Perikanan</TableHead>
              <TableHead>Perikanan Budidaya</TableHead>
              <TableHead>Penangkapan Ikan</TableHead>
              <TableHead>Pengolahan Hasil Perikanan</TableHead>
              <TableHead>Konservasi</TableHead>
              <TableHead>Sumberdaya Perikanan</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainingData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.province}</TableCell>
                <TableCell>{item.permesinan}</TableCell>
                <TableCell>{item.budidaya}</TableCell>
                <TableCell>{item.penangkapan}</TableCell>
                <TableCell>{item.pengolahan}</TableCell>
                <TableCell>{item.konservasi}</TableCell>
                <TableCell>{item.sumberdaya}</TableCell>
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
