"use client";

import SummaryELAUT from "@/components/dashboard/Dashboard/Summary/SummaryELAUT";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";

export default function Home() {
  return (
    <>
      <LayoutAdminElaut>
        <section className="p-10">
          <div className="w-full mt-1">
            <SummaryELAUT />
          </div>
        </section>
      </LayoutAdminElaut>
    </>
  );
}
