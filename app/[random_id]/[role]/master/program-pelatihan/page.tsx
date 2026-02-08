"use client";

import TableProgramPelatihan from "@/components/dashboard/Dashboard/Master/TableProgramPelatihan";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { RiQuillPenAiLine } from "react-icons/ri";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <article className="w-full h-full">
                    <TableProgramPelatihan />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
