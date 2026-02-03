"use client";

import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TableDataP2MKP from "@/components/dashboard/P2MKP/Table/TableDataP2MKP";
import { HiUserGroup } from "react-icons/hi2";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut title="Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)" description="Monitoring dan Kelola Data Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)" icon={<HiUserGroup className="text-3xl" />} />
                <article className="w-full h-full">
                    <TableDataP2MKP />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
