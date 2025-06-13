import React from "react";
import { LucideFileSignature } from "lucide-react";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import PemberitahuanPelatihan from "@/components/dashboard/Dashboard/PemberitahuanPelatihan";

function page() {
  return (
    <LayoutAdminElaut>
      <PemberitahuanPelatihan />
    </LayoutAdminElaut>
  );
}

export default page;
