"use client";

import TableProgramPelatihan from "@/components/dashboard/Dashboard/Master/TableProgramPelatihan";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { Sparkles } from "lucide-react";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut title="Program Pelatihan" description="Kelola struktur kurikulum, rumpun pelatihan, dan deskripsi sertifikasi digital." icon={<Sparkles className="text-3xl" />} />

                <article className="w-full h-full mt-5">
                    <TableProgramPelatihan />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
