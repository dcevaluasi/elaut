"use client";

import React from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TableMasterPeserta from "@/components/dashboard/Dashboard/Master/TableMasterPeserta";
import { HiUserGroup } from "react-icons/hi2";

export default function Page() {
  return (
    <LayoutAdminElaut>
      <section className="flex-1 flex flex-col space-y-6">
        <HeaderPageLayoutAdminElaut
          title="Master Data Peserta"
          description="Monitoring, kelola, dan perbarui data seluruh peserta pelatihan yang terdaftar di E-LAUT!"
          icon={<HiUserGroup className="text-3xl text-blue-600" />}
        />
        <article className="w-full h-full">
          <TableMasterPeserta />
        </article>
      </section>
    </LayoutAdminElaut>
  );
}