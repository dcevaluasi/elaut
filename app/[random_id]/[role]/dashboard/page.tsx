import React from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { LucideLayoutDashboard } from "lucide-react";
import { Metadata } from "next";
import DashboardMainView from "@/components/dashboard/DashboardMainView";

export const metadata: Metadata = {
  title: "Dashboard - Elektronik Layanan Pelatihan Utama Terpadu",
};

export default function Page() {
  return (
    <LayoutAdminElaut>
      <HeaderPageLayoutAdminElaut
        title="Dashboard"
        description="Monitoring capaian/Realisasi penyelenggaraan pelatihan dan status pelaksanaan!"
        icon={<LucideLayoutDashboard className="text-3xl" />}
      />

      <div className="space-y-10 py-4">
        <DashboardMainView />
      </div>
    </LayoutAdminElaut>
  );
}

