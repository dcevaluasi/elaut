import SummaryELAUT from "@/components/dashboard/Dashboard/Summary/SummaryELAUT";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Elektronik Layanan Pelatihan Utama Terpadu",
};

export default function Page() {
  return (
    <LayoutAdminElaut>
      <section className="p-10 w-full mt-1">
        <SummaryELAUT />
      </section>
    </LayoutAdminElaut>
  );
}
