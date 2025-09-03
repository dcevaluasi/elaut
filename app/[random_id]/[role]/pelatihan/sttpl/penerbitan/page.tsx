import React from "react";
import { LucideFileSignature } from "lucide-react";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { TbSchool } from "react-icons/tb";

function page() {
  return (
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
                  Penyelenggaraan Pelatihan
                </h1>
                <p className="font-medium text-gray-400 text-base">
                  Monitoring pelaksanaan pelatihan kelautan dan perikanan!
                </p>
              </div>
            </header>
          </div>
        </div>
        <main className="w-full h-full">
        </main>
      </section>

    </LayoutAdminElaut>
  );
}

export default page;
