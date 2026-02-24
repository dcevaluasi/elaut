import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Registrasi P2MKP - Bergabung Menjadi Pusat Pelatihan Mandiri",
    description: "Daftarkan lembaga atau usaha Anda menjadi P2MKP (Pusat Pelatihan Mandiri Kelautan dan Perikanan). Lengkapi formulir pendaftaran untuk bergabung dalam ekosistem BPPSDM KP.",
    keywords: ["Pendaftaran P2MKP", "Registrasi P2MKP", "Daftar Pusat Pelatihan Mandiri", "KKP", "BPPSDM KP"],
    openGraph: {
        title: "Registrasi P2MKP - Bergabung Menjadi Pusat Pelatihan Mandiri",
        description: "Langkah awal menjadi lembaga pelatihan mandiri perikanan resmi di bawah naungan KKP RI.",
        url: "https://elaut-bppsdm.kkp.go.id/p2mkp/registrasi",
    },
};

export default function RegistrasiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
