"use client";

import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TableDataP2MKP from "@/components/dashboard/P2MKP/Table/TableDataP2MKP";
import { TbBuildingEstate } from "react-icons/tb";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut title="Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)" description="Monitoring dan Kelola Data Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)" icon={<TbBuildingEstate className="text-3xl" />} />
                <article className="w-full h-full">
                    <TableDataP2MKP />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
