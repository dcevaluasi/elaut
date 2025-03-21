"use client";

import DefaultLayoutAKP from "@/components/dashboard/Layouts/DefaultLayoutAKP";
import { BlankoComponent } from "@/components/dashboard/Dashboard/AKP/BlankoComponent";
import { HiOutlineDownload } from "react-icons/hi";
import TableDataBlankoKeluar from "@/components/dashboard/Pelatihan/TableDataBlankoKeluar";
import TableDataProfilLembaga from "@/components/dashboard/akp/tables/TableDataProfilLembaga";
import { MdApproval } from "react-icons/md";

export default function Home() {
  return (
    <DefaultLayoutAKP>
      <BlankoComponent
        icon={<MdApproval className="text-4xl" />}
        title="Pengesahan Program Diklat AKP"
        description="Manajemen Data Lembaga Diklat dan Pengesahan Untuk Setiap Program Awak Kapal Perikanannya!"
        table={<TableDataProfilLembaga />}
      />
    </DefaultLayoutAKP>
  );
}
