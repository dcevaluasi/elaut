import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPelatihan } from "@/types/user";
import { Button } from "@/components/ui/button";
import { utils, writeFile } from "xlsx";

type TableDataProps = {
  dataUserPelatihan: UserPelatihan[];
};

const TableDataPelatihanMasyarakatByPendidikan = ({ dataUserPelatihan }: TableDataProps) => {
  const [year, setYear] = useState("2024");
  const [quarter, setQuarter] = useState("TW II");

  // Fungsi untuk mendapatkan triwulan dari tanggal
  // const getTriwulan = (dateString: string) => {
  //   const month = new Date(dateString).getMonth() + 1;
  //   if (month <= 3) return "TW I";
  //   if (month <= 6) return "TW II";
  //   if (month <= 9) return "TW III";
  //   return "TW IV";
  // };

  // // Filter data berdasarkan tahun dan triwulan
  // const filteredData = useMemo(() => {
  //   return dataUserPelatihan.filter((item) => {
  //     const itemYear = new Date(item.CreatedAt).getFullYear().toString();
  //     const itemQuarter = getTriwulan(item.CreatedAt);
  //     return itemYear === year && itemQuarter === quarter;
  //   });
  // }, [dataUserPelatihan, year, quarter]);

  // Ambil daftar unik PenyelenggaraPelatihan sebagai baris
  const penyelenggaraList = useMemo(() => {
    return Array.from(new Set(dataUserPelatihan.map((item) => item.PenyelenggaraPelatihan)));
  }, [dataUserPelatihan]);

  // Ambil daftar unik PendidikanTerakhir sebagai kolom
  const pendidikanList = useMemo(() => {
    return Array.from(new Set(dataUserPelatihan.map((item) => item.PendidikanTerakhir)));
  }, [dataUserPelatihan]);

  // Buat matrix data berdasarkan penyelenggara (baris) dan pendidikan (kolom)
  const groupedData = useMemo(() => {
    const map = new Map<string, Record<string, number>>();

    penyelenggaraList.forEach((penyelenggara) => {
      map.set(penyelenggara, Object.fromEntries(pendidikanList.map((p) => [p, 0])));
    });

    dataUserPelatihan.forEach((item) => {
      const penyelenggara = item.PenyelenggaraPelatihan;
      const pendidikan = item.PendidikanTerakhir;
      if (map.has(penyelenggara)) {
        map.get(penyelenggara)![pendidikan] = (map.get(penyelenggara)![pendidikan] || 0) + 1;
      }
    });

    return Array.from(map.entries()).map(([penyelenggara, data]) => ({
      penyelenggara,
      ...data,
    }));
  }, [dataUserPelatihan, penyelenggaraList, pendidikanList]);

  // Fungsi untuk export ke Excel
  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(groupedData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Penyelenggara_Pendidikan");
    writeFile(workbook, "Penyelenggara_Pendidikan.xlsx");
    
  };

  return (
    <div className="rounded-xl border border-stroke bg-white p-5 shadow-default">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Lulusan Berdasarkan Penyelenggara & Pendidikan</h3>
        <div className="flex gap-3">
          <Select onValueChange={setYear} defaultValue={year}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setQuarter} defaultValue={quarter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Pilih Triwulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TW I">TW I</SelectItem>
              <SelectItem value="TW II">TW II</SelectItem>
              <SelectItem value="TW III">TW III</SelectItem>
              <SelectItem value="TW IV">TW IV</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Export to Excel
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Penyelenggara</TableHead>
            {pendidikanList.map((pendidikan, index) => (
              <TableHead key={index}>{pendidikan}</TableHead>
            ))}
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedData.map((row: any, index: any) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{row.penyelenggara}</TableCell>
              {pendidikanList.map((pendidikan: any, pIndex: any) => (
                <TableCell key={pIndex}>{row[pendidikan] || 0}</TableCell>
              ))}

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableDataPelatihanMasyarakatByPendidikan;
