"use client";

import TableModulPelatihan from "@/components/dashboard/Dashboard/Modul/TableModulPelatihan";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import React from "react";

import { TbSchool } from "react-icons/tb";

export default function Home() {
    return (
        <>
            <LayoutAdminElaut>
                <section className="flex-1 flex flex-col">
                    <div className="flex flex-col w-full">
                        <div className="flex flex-row gap-2 items-center">
                            <header
                                aria-label="page caption"
                                className="flex-row w-full flex h-20 items-center gap-2 bg-gray-100 border-t px-4"
                            >
                                <TbSchool className="text-3xl" />
                                <div className="flex flex-col">
                                    <h1 id="page-caption" className="font-semibold text-lg">
                                        Modul Pelatihan
                                    </h1>
                                    <p className="font-medium text-gray-400 text-base">
                                        Monitoring pengelolaan perangkat, modul, serta kurikulum pelatihan kelautan dan perikanan!
                                    </p>
                                </div>
                            </header>
                        </div>
                    </div>
                    <main className="w-full h-full">
                        <div className="mt-4 md:mt-6 2xl:mt-7.5">
                            <TableModulPelatihan />
                        </div>
                    </main>
                </section>
            </LayoutAdminElaut>
        </>
    );
}
