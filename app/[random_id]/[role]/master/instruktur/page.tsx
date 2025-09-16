"use client";

import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TableDataPelatih from "@/components/dashboard/Pelatihan/Table/TableDataPelatih";
import { HiUserGroup } from "react-icons/hi2";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut title="Instruktur/Pelatih" description="Monitoring dan kelola data Instruktur/Pelatih pada Lembaga Diklat, Internal Pusat, atau Lintas Eselon!" icon={<HiUserGroup className="text-3xl" />} />
                <article className="w-full h-full">
                    <TableDataPelatih />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
