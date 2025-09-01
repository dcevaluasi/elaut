"use client";

import SummaryELAUT from "@/components/dashboard/Dashboard/Summary/SummaryELAUT";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";

export default function Page() {
  return (
    <LayoutAdminElaut>
      <section className="p-10 w-full mt-1">
        <SummaryELAUT />
      </section>
    </LayoutAdminElaut>
  );
}
