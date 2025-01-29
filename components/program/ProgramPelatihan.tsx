"use client";
import HeroProgramPelatihan from "@/components/hero/HeroProgramPelatihan";
import { getLastValuePath } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

import Footer from "@/components/ui/footer";
import PencarianPelatihan from "@/components/landing/PencarianPelatihan";

function ProgramPelatihan() {
  const programPelatihanPath = getLastValuePath(usePathname());
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="h-full flex flex-col gap-0 bg-white">
      <HeroProgramPelatihan program={programPelatihanPath!} />
      <PencarianPelatihan />
    </section>
  );
}

export default ProgramPelatihan;
