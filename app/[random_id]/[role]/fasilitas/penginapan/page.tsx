import Fasilitas from "@/components/dashboard/Dashboard/Fasilitas";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Database Fasilitas Penginapan - Elektronik Layanan Pelatihan Kelautan dan Perikanan Umum Terpadu",
};

export default function Home() {
  return (
    <>
      <Fasilitas />
    </>
  );
}
