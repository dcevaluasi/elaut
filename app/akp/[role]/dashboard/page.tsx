import AKP from "@/components/dashboard/Dashboard/AKP";
import DefaultLayoutAKP from "@/components/dashboard/Layouts/DefaultLayoutAKP";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard AKAPI - Aplikasi Awak Kapal Perikanan",
};

export default function page() {
  return (
    <>
      <DefaultLayoutAKP>
        <AKP />
      </DefaultLayoutAKP>
    </>
  );
}
