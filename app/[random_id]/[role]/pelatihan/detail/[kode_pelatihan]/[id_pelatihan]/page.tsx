"use client";

import DetailPelatihan from "@/components/dashboard/Dashboard/DetailPelatihan";
import ManagePelatihan from "@/components/dashboard/Dashboard/ManagePelatihan";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import Cookies from "js-cookie";
import React from "react";

function page() {
  return (
    <>
      <LayoutAdminElaut>
        <section className="flex-1 flex flex-col">
          <main className="w-full h-full">
            {
              Cookies.get('Access')?.includes('createPelatihan') ? <ManagePelatihan /> : <DetailPelatihan />
            }
          </main>
        </section>
      </LayoutAdminElaut>
    </>
  );
}

export default page;
