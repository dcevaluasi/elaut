"use client";

import ManagePelatihan from "@/components/dashboard/Dashboard/ManagePelatihan";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import React from "react";

function page() {
  return (
    <>
      <LayoutAdminElaut>
        <section className="flex-1 flex flex-col">
          <main className="w-full h-full">
            <ManagePelatihan />
          </main>
        </section>
      </LayoutAdminElaut>
    </>
  );
}

export default page;
