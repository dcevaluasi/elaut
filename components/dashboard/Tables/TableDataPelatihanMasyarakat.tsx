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
  { id: 1, name: "Pusat Pelatihan", 2017: 0, 2018: 1000, 2019: 0 },
  { id: 2, name: "BPPP Medan", 2017: 1080, 2018: 2010, 2019: 3680 },
  { id: 3, name: "BPPP Tegal", 2017: 1790, 2018: 6349, 2019: 8014 },
  { id: 4, name: "BPPP Banyuwangi", 2017: 1590, 2018: 3630, 2019: 4120 },
  { id: 5, name: "BPPP Bitung", 2017: 990, 2018: 1920, 2019: 3420 },
  { id: 6, name: "BPPP Ambon", 2017: 840, 2018: 1592, 2019: 3436 },
];

const TableDataPelatihanMasyarakat = () => {
  const [year, setYear] = React.useState<"2017" | "2018" | "2019">("2018");

  const [quarter, setQuarter] = React.useState<string>("Q1");

  return (
    <div className="col-span-12 rounded-xl  border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8 mb-3">
      <div className="p-4">
        <div className="flex gap-4 mb-4">
          <Select
            onValueChange={(value) =>
              setYear(value as "2017" | "2018" | "2019")
            }
            defaultValue={year}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2017">2017</SelectItem>
              <SelectItem value="2018">2018</SelectItem>
              <SelectItem value="2019">2019</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setQuarter} defaultValue={quarter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Quarter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1">Q1</SelectItem>
              <SelectItem value="Q2">Q2</SelectItem>
              <SelectItem value="Q3">Q3</SelectItem>
              <SelectItem value="Q4">Q4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nama Balai</TableHead>
              <TableHead>Jumlah Pelatihan Masyarakat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainingData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item[year]!}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableDataPelatihanMasyarakat;
