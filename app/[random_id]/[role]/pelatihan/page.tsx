"use client";

import Pelatihan from "@/components/dashboard/Dashboard/Pelatihan";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { elautBaseUrl } from "@/constants/urls";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import axios from "axios";
import Cookies from "js-cookie";
import React from "react";

import { TbSchool } from "react-icons/tb";

export default function Home() {
  return (
    <>
      <LayoutAdminElaut>
        <section className="flex-1 flex flex-col">
          <HeaderPageLayoutAdminElaut title="Penyelenggaraan Pelatihan" description=" Monitoring dan kelola penyelenggaran pelatihan kelautan dan perikanan mulai buka kelas hingga penerbitan STTPL!" icon={<TbSchool className="text-3xl" />} />
          <main className="w-full h-full">
            <Pelatihan />
          </main>
        </section>
      </LayoutAdminElaut>
    </>
  );
}
