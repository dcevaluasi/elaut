"use client";

import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TableDataPelatih from "@/components/dashboard/Pelatihan/Table/TableDataPelatih";
import { HiUserGroup } from "react-icons/hi2";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut title="Penetapan dan Klasifikasi P2MKP" description="Monitoring dan Kelola Pengajuan Penetapan dan Klasifikasi Calon Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)" icon={<HiUserGroup className="text-3xl" />} />
                <article className="w-full h-full">
                    <TableDataPelatih />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
