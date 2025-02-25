
import DetailPelatihan from "@/components/dashboard/Dashboard/DetailPelatihan";
import DefaultLayout from "@/components/dashboard/Layouts/DefaultLayout";
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
