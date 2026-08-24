import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Portal Instruktur - E-LAUT KKP",
    description:
        "Masuk dengan NIP untuk melengkapi data instruktur: unit kerja, bidang keahlian, jenjang jabatan, dan sertifikasi pelatihan.",
    keywords: [
        "Portal Instruktur",
        "Instruktur E-LAUT",
        "NIP Instruktur",
        "Widyaiswara KKP",
        "BPPSDM KP",
    ],
    robots: { index: false, follow: false },
    openGraph: {
        title: "Portal Instruktur - E-LAUT KKP",
        description:
            "Portal instruktur E-LAUT untuk melengkapi data kepakaran dan sertifikasi.",
        url: "https://elaut-bppsdm.kkp.go.id/instruktur/login",
    },
};

export default function InstrukturLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
