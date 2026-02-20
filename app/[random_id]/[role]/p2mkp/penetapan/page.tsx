"use client";

import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TablePenetapanP2MKP from "@/components/dashboard/P2MKP/Table/TablePenetapanP2MKP";
import { TbGavel } from "react-icons/tb";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut
                    title="Penetapan P2MKP"
                    description="Kelola dan cetak sertifikat penetapan Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP) yang telah diverifikasi."
                    icon={<TbGavel className="text-3xl" />}
                />
                <article className="w-full h-full">
                    <TablePenetapanP2MKP />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
