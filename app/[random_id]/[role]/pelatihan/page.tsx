"use client";

import ECommerce from "@/components/dashboard/Dashboard/E-commerce";
import Pelatihan from "@/components/dashboard/Dashboard/Pelatihan";
import DropdownUser from "@/components/dashboard/Header/DropdownUser";
import DefaultLayout from "@/components/dashboard/Layouts/DefaultLayout";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { elautBaseUrl } from "@/constants/urls";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import axios from "axios";
import Cookies from "js-cookie";
import React from "react";

import { TbSchool } from "react-icons/tb";

export default function Home() {
  const [lemdikData, setLemdikData] =
    React.useState<LemdiklatDetailInfo | null>(null);

  const fetchInformationLemdiklat = async () => {
    try {
      const response = await axios.get(`${elautBaseUrl}/lemdik/getLemdik`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("XSRF091")}`,
        },
      });
      setLemdikData(response.data);
      Cookies.set("IDLemdik", response.data.data.IdLemdik);
      console.log("LEMDIK INFO: ", response);
    } catch (error) {
      console.error("LEMDIK INFO: ", error);
    }
  };

  React.useEffect(() => {
    fetchInformationLemdiklat();
  }, []);
  return (
    <>
      <LayoutAdminElaut>
        <section className="flex-1 flex flex-col">
          <div className="flex flex-col w-full">
            <div className="flex flex-row gap-2 items-center">
              <header
                aria-label="page caption"
                className="flex-row w-full flex h-20 items-center gap-2 bg-gray-100 border-t px-4"
              >
                <TbSchool className="text-3xl" />
                <div className="flex flex-col">
                  <h1 id="page-caption" className="font-semibold text-lg">
                    Database Pelatihan
                  </h1>
                  <p className="font-medium text-gray-400 text-base">
                    Tambahkan data pelatihan yang ada di lembaga diklat mu!
                  </p>
                </div>
              </header>
            </div>
          </div>
          <main className="w-full h-full">
            <Pelatihan />
          </main>
        </section>
      </LayoutAdminElaut>
    </>
  );
}
