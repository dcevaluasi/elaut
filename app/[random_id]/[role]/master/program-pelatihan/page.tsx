"use client";

import TableProgramPelatihan from "@/components/dashboard/Dashboard/Master/TableProgramPelatihan";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { RiQuillPenAiLine } from "react-icons/ri";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut title="Program Pelatihan" description="Monitoring pengelolaan data program pelatihan!" icon={<RiQuillPenAiLine className="text-3xl" />} />
                <article className="w-full h-full">
                    <TableProgramPelatihan />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
