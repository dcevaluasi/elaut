import React from "react";
import { LucideFileSignature } from "lucide-react";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TableDataPenerbitanSertifikat from "@/components/dashboard/Pelatihan/TableDataPenerbitanSertifikat";
import PenerbitanSertifikat from "@/components/dashboard/Dashboard/PenerbitanSertifikat";
import PemberitahuanPelatihan from "@/components/dashboard/Dashboard/PemberitahuanPelatihan";

function page() {
  return (
    <>
      <LayoutAdminElaut>
        <section className="flex-1 flex flex-col">
          <div className="flex flex-col w-full">
            <div className="flex flex-row gap-2 items-center">
              <header
                aria-label="page caption"
                className="flex-row w-full flex h-36 items-center gap-2 bg-gray-100 border-t px-4"
              >
                <LucideFileSignature className="text-3xl" />
                <div className="flex flex-col">
                  <h1 id="page-caption" className="font-semibold text-lg">
                    Pelaksanaan Pelatihan
                  </h1>
                  <p className="font-medium text-gray-400 text-base">
                    Verifikasi pelaksanaan pelatihan untuk memberikan akses ke aplikasi E-LAUT kepada lembaga diklat penyelenggara kegiatan pelatihan!
                  </p>
                </div>
              </header>
            </div>
          </div>
          <main className="w-full h-full">
            <PemberitahuanPelatihan />
          </main>
        </section>
      </LayoutAdminElaut>
    </>
  );
}

export default page;
