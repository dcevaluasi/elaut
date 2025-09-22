"use client";

import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TableDataUnitKerja from "@/components/dashboard/Pelatihan/Table/TableDataUnitKerja";
import React from "react";
import { TbBuildingSkyscraper } from "react-icons/tb";

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <div className="flex flex-col w-full">
                    <div className="flex flex-row gap-2 items-center">
                        <header
                            aria-label="page caption"
                            className="flex-row w-full flex h-20 items-center gap-2 bg-gray-100 border-t px-4"
                        >
                            <TbBuildingSkyscraper className="text-3xl" />
                            <div className="flex flex-col">
                                <h1 id="page-caption" className="font-semibold text-lg">
                                    Unit Kerja
                                </h1>
                                <p className="font-medium text-gray-400 text-base">
                                    Monitoring dan kelola data Unit Kerja lingkup KKP, Eksternal KKP, maupun P2MKP!
                                </p>
                            </div>
                        </header>
                    </div>
                </div>
                <main className="w-full h-full">
                    <div className="mt-4 md:mt-6 2xl:mt-7.5">
                        <TableDataUnitKerja />
                    </div>
                </main>
            </section>
        </LayoutAdminElaut>
    );
}
