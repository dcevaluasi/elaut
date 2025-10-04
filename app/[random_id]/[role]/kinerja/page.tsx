import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import SummaryKinerja from "@/components/dashboard/SummaryKinerja";

import { Metadata } from "next";
import { IoPieChartOutline } from "react-icons/io5";

export const metadata: Metadata = {
  title: "Indikator Kinerja - Elektronik Layanan Pelatihan Utama Terpadu",
};

export default function Page() {
  return (
    <LayoutAdminElaut>
      <HeaderPageLayoutAdminElaut title="Indikator Kinerja" description=" Monitoring realisasi/capaian indikator kinerja penyelenggaran pelatihan kelautan dan perikanan!" icon={<IoPieChartOutline className="text-3xl" />} />
      <section className="py-10 w-full mt-1">
        <SummaryKinerja />
      </section>
    </LayoutAdminElaut>
  );
}
