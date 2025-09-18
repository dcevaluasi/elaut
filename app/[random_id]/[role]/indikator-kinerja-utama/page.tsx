import { SummaryPelatihan } from "@/components/dashboard";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import SummaryIKUPelatihan from "@/components/dashboard/SummaryIKUPelatihan";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Indikator Kinerja Utama (IKU) - Elektronik Layanan Pelatihan Utama Terpadu",
};

export default function Page() {
    return (
        <LayoutAdminElaut>
            <section className="p-10 w-full mt-1">
                <SummaryIKUPelatihan />
            </section>
        </LayoutAdminElaut>
    );
}
