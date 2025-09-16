"use client";

import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TableDataPelatihan from "@/components/dashboard/Pelatihan/TableDataPelatihan";
import { TbSchool } from "react-icons/tb";

export default function Page() {
  return (
    <LayoutAdminElaut>
      <section className="flex-1 flex flex-col">
        <HeaderPageLayoutAdminElaut title="Penyelenggaraan Pelatihan" description=" Monitoring dan kelola penyelenggaran pelatihan kelautan dan perikanan mulai buka kelas hingga penerbitan STTPL!" icon={<TbSchool className="text-3xl" />} />
        <article className="w-full h-full">
          <TableDataPelatihan />
        </article>
      </section>
    </LayoutAdminElaut>
  );
}
