"use client";

import TableProgramPelatihan from "@/components/dashboard/Dashboard/Master/TableProgramPelatihan";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";

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
