import AKP from "@/components/dashboard/Dashboard/AKP";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard AKAPI - Aplikasi Awak Kapal Perikanan",
};

export default function Home() {
  return (
    <>
      <div className="w-full md:p-24 p-10 bg-darkAKP">
        <div className="flex flex-col gap-5">
          <h1 className="md:text-4xl text-3xl text-[#e1e7ef] font-semibold leading-[110%] tracking-tighter">
            Dashboard Sertifikasi AKAPI
          </h1>
          <AKP />
        </div>
      </div>
    </>
  );
}
