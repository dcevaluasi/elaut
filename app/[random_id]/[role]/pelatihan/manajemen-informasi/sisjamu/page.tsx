"use client";

import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { elautBaseUrl } from "@/constants/urls";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import axios from "axios";
import Cookies from "js-cookie";
import React from "react";

import { TbSchool } from "react-icons/tb";
import ManajemenInformasiSISJAMU from "../components/ManajemenInformasiSISJAMU";

export default function page() {
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
                                        Materi/Kurikulum dan Deskripsi Pelatihan SISJAMU
                                    </h1>
                                    <p className="font-medium text-gray-400 text-base">
                                        Manajemen informasi detail pelatihan SISJAMU, hal ini bertujuan untuk menampilkan informasi pada sertifikat dan layanan pada aplikasi E-LAUT
                                    </p>
                                </div>
                            </header>
                        </div>
                    </div>
                    <main className="w-full h-full">
                        <div className="mt-4 md:mt-6 2xl:mt-7.5">
                            <ManajemenInformasiSISJAMU />
                        </div>
                    </main>
                </section>
            </LayoutAdminElaut>
        </>
    );
}
