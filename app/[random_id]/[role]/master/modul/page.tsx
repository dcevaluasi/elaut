"use client";

import TableModulPelatihan from "@/components/dashboard/Dashboard/Modul/TableModulPelatihan";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { BookOpen } from "lucide-react";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut title="Modul Pelatihan" description=" Monitoring pengelolaan modul/perangkat pelatihan kelautan dan perikanan!" icon={<BookOpen className="text-3xl" />} />
                <article className="w-full h-full">
                    <TableModulPelatihan />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
