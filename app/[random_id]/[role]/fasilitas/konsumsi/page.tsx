import Konsumsi from "@/components/dashboard/Dashboard/Konsumsi";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Database Paket Konsumsi - Elektronik Layanan Pelatihan Kelautan dan Perikanan Umum Terpadu",
};

export default function Home() {
  return (
    <>
      {/* TESTING */}
      <Konsumsi />
    </>
  );
}
