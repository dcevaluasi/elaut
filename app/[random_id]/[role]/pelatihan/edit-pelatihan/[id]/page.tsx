import FormPelatihan from "@/components/dashboard/admin/formPelatihan";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Edit Pelatihan - Elektronik Layanan Pelatihan Kelautan dan Perikanan Utama Terpadu",
};

export default function Home() {
  return (
    <>

      <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-8">
        <>
          {/* Header Tabel Data Pelatihan */}
          <div className="flex flex-wrap items-center mb-3 justify-between gap-3 sm:flex-nowrap">
            {/* Button Ajukan Permohonan Buka Pelatihan */}
          </div>

          {/* List Data Pelatihan */}
          <div>
            <FormPelatihan edit={true} />
          </div>
        </>
      </div>
    </>
  );
}
