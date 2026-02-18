"use client";

import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TablePenetapanP2MKP from "@/components/dashboard/P2MKP/Table/TablePenetapanP2MKP";
import { TbCertificate } from "react-icons/tb";

/**
 * Page component for P2MKP Penetapan (Certificate Establishment).
 * Displays a list of P2MKP institutions with options to view/download certificates.
 */
export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col gap-6">
                {/* Page Header */}
                <HeaderPageLayoutAdminElaut
                    title="Sertifikat Penetapan P2MKP"
                    description="Kelola dan cetak sertifikat penetapan Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP) yang telah diverifikasi."
                    icon={<TbCertificate className="text-3xl text-blue-600" />}
                />

                {/* Data Table Area */}
                <article className="w-full h-full pb-10">
                    <TablePenetapanP2MKP />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
