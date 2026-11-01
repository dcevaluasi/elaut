"use client";

import TableRumpunPelatihan from "@/components/dashboard/Dashboard/Master/TableRumpunPelatihan";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { Sparkles } from "lucide-react";
import { HiOutlineInbox } from "react-icons/hi2";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut title="Klaster/Rumpun Pelatihan" description="Kelola struktur kurikulum, rumpun pelatihan, dan deskripsi sertifikasi digital." icon={<Sparkles className="text-3xl" />} />

                <article className="w-full h-full mt-5">
                    <TableRumpunPelatihan />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
