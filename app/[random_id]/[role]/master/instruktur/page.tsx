"use client";

import Pelatihan from "@/components/dashboard/Dashboard/Pelatihan";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TableDataPelatih from "@/components/dashboard/Pelatihan/Table/TableDataPelatih";
import React from "react";
import { HiUserGroup } from "react-icons/hi2";

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
                            <HiUserGroup className="text-3xl" />
                            <div className="flex flex-col">
                                <h1 id="page-caption" className="font-semibold text-lg">
                                    Manajemen Data Instruktur/Pelatih
                                </h1>
                                <p className="font-medium text-gray-400 text-base">
                                    Monitoring dan kelola data Instruktur/Pelatih pada Lembaga Diklat!
                                </p>
                            </div>
                        </header>
                    </div>
                </div>
                <main className="w-full h-full">
                    <div className="mt-4 md:mt-6 2xl:mt-7.5">
                        {/* <TableDataPelatih /> */}
                    </div>
                </main>
            </section>
        </LayoutAdminElaut>
    );
}
