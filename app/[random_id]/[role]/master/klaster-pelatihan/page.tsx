"use client";

import TableRumpunPelatihan from "@/components/dashboard/Dashboard/Master/TableRumpunPelatihan";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { HiOutlineInbox } from "react-icons/hi2";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut title="Klaster Pelatihan" description="Monitoring pengelolaan data klaster pelatihan!" icon={<HiOutlineInbox className="text-3xl" />} />
                <article className="w-full h-full">
                    <TableRumpunPelatihan />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
