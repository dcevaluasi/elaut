import { SummaryPelatihan } from "@/components/dashboard";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { LucideLayoutDashboard } from "lucide-react";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Elektronik Layanan Pelatihan Utama Terpadu",
};

export default function Page() {
  return (
    <LayoutAdminElaut>
      <HeaderPageLayoutAdminElaut title="Dashboard" description="Monitoring capaian/Realisasi penyelenggaraan pelatihan dan status pelaksanaan!" icon={<LucideLayoutDashboard className="text-3xl" />} />
      <SummaryPelatihan />
    </LayoutAdminElaut>
  );
}
