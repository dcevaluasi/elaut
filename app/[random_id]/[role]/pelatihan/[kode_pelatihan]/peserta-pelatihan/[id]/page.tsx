import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peserta Pelatihan",
};

export default function Home() {
  return (
    <>
      <LayoutAdminElaut>
        <main className="w-full h-full">
        </main>
      </LayoutAdminElaut>
    </>
  );
}
