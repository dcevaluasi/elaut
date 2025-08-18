"use client";

import DetailModulPelatihan from "@/components/dashboard/Dashboard/Modul/DetailModulPelatihan";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import React from "react";


export default function Home() {
    return (
        <>
            <LayoutAdminElaut>
                <DetailModulPelatihan />
            </LayoutAdminElaut>
        </>
    );
}
