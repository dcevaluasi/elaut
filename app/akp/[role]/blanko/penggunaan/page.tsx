"use client";

import DefaultLayoutAKP from "@/components/dashboard/Layouts/DefaultLayoutAKP";
import { BlankoComponent } from "@/components/dashboard/Dashboard/AKP/BlankoComponent";
import { HiOutlineDownload } from "react-icons/hi";
import TableDataBlankoKeluar from "@/components/dashboard/Pelatihan/TableDataBlankoKeluar";

export default function Home() {
  return (
    <DefaultLayoutAKP>
      <BlankoComponent
        icon={<HiOutlineDownload className="text-4xl" />}
        title="Penggunaan Blanko"
        description="Tracking dan monitoring blanko yang telah digunakan untuk penerbitan
              sertifikat AKP di Pusat Pelatihan KP!"
        table={<TableDataBlankoKeluar />}
      />
    </DefaultLayoutAKP>
  );
}
