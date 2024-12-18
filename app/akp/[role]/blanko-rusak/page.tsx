import BlankoRusak from "@/components/dashboard/Dashboard/BlankoRusak";
import DefaultLayoutAKP from "@/components/dashboard/Layouts/DefaultLayoutAKP";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Database Pelatihan - Elektronik Layanan Pelatihan KP Utama Terpadu",
};

export default function Home() {
  return (
    <>
      <DefaultLayoutAKP>
        <BlankoRusak />
      </DefaultLayoutAKP>
    </>
  );
}
