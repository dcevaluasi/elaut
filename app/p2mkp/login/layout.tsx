import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login P2MKP - Portal Pusat Pelatihan Mandiri Kelautan & Perikanan",
    description: "Masuk ke portal P2MKP untuk mengelola profil, mengajukan penetapan, dan melaporkan kegiatan pelatihan mandiri Anda.",
    keywords: ["Login P2MKP", "Portal P2MKP", "Akses P2MKP", "BPPSDM KP"],
    openGraph: {
        title: "Login P2MKP - Portal Pusat Pelatihan Mandiri Kelautan & Perikanan",
        description: "Akses portal manajemen P2MKP resmi Kementerian Kelautan dan Perikanan.",
        url: "https://elaut-bppsdm.kkp.go.id/p2mkp/login",
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
