"use client";

import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TableDataUnitKerja from "@/components/dashboard/Pelatihan/Table/TableDataUnitKerja";
import React from "react";
import { TbBuildingSkyscraper } from "react-icons/tb";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <main className="w-full h-full">
                    <TableDataUnitKerja />
                </main>
            </section>
        </LayoutAdminElaut>
    );
}
