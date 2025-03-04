"use client";
import React from "react";
import CardDataStats from "../CardDataStats";
import { HiCheckBadge, HiMiniUserGroup } from "react-icons/hi2";
import { GiReceiveMoney } from "react-icons/gi";
import { MdSchool } from "react-icons/md";
import ChartFour from "../Charts/ChartFour";
import Cookies from "js-cookie";
import axios from "axios";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
// import MapOne from "../Maps/MapOne";

const ECommerce: React.FC = () => {
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Total Masyarakat Dilatih"
          total="0"
          rate="0%"
          levelUp
        >
          <HiMiniUserGroup className="text-primary text-xl" />
        </CardDataStats>
        <CardDataStats
          title="Total Bersertifikat Kompetensi"
          total="0"
          rate="0%"
          levelUp
        >
          <HiCheckBadge className="text-primary text-xl" />
        </CardDataStats>
        <CardDataStats title="Total PNBP" total="Rp 0 M" rate="0%" levelUp>
          <GiReceiveMoney className="text-primary text-xl" />
        </CardDataStats>
        <CardDataStats
          title="Total Pelatihan"
          total={
            lemdikData != null
              ? lemdikData!.data!.Pelatihan!.length.toString()
              : "0"
          }
          rate=""
          levelDown
        >
          <MdSchool className="text-primary text-xl" />
        </CardDataStats>
      </div>
    </>
  );
};

export default ECommerce;
