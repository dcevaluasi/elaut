"use client";
import React, { useState, ReactNode } from "react";
import Sidebar from "../Sidebar";
import axios from "axios";
import Cookies from "js-cookie";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import Header from "../Header";

export default function DefaultLayoutAKP({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("XSRF091");

  const [lemdikData, setLemdikData] =
    React.useState<LemdiklatDetailInfo | null>(null);

  const fetchInformationLemdiklat = async () => {
    try {
      const response = await axios.get(`${baseUrl}/lemdik/getLemdik`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-x-hidden">
          {/* <!-- ===== Header Start ===== --> */}
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            lemdikInfo={lemdikData!}
          />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main className="scrollbar-hide">
            <div className="mx-auto max-w-screen-2xl scrollbar-hide p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
}
