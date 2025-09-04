
import DetailPelatihan from "@/components/dashboard/Dashboard/DetailPelatihan";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import React from "react";

function page() {
  return (
    <>
      <LayoutAdminElaut>
        <DetailPelatihan />
      </LayoutAdminElaut>
    </>
  );
}

export default page;
