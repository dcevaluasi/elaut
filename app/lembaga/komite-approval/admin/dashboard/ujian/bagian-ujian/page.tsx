import BagianUjianKeahlian from "@/components/dashboard/Dashboard/DPKAKP/BagianUjianKeahlian";
import FungsiUjianKeahlian from "@/components/dashboard/Dashboard/DPKAKP/FungsiUjianKeahlian";
import TipeUjianKeahlian from "@/components/dashboard/Dashboard/DPKAKP/TipeUjianKeahlian";
import ECommerce from "@/components/dashboard/Dashboard/E-commerce";
import Pelatihan from "@/components/dashboard/Dashboard/Pelatihan";
import UjianKeahlianAKP from "@/components/dashboard/Dashboard/UjianKeahlianAKP";
import DefaultLayout from "@/components/dashboard/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bagian Ujian Keahlian - Dewan Penguji Keahlian Awak Kapal Perikanan",
};

export default function Page() {
  return (
    <>
      <DefaultLayout>
        <BagianUjianKeahlian />
      </DefaultLayout>
    </>
  );
}
