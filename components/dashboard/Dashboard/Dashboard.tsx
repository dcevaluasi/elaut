"use client";
import React from "react";
import CardDataStats from "../CardDataStats";
import { HiCheckBadge, HiMiniUserGroup, HiTrash } from "react-icons/hi2";
import { GiBattery75, GiPapers, GiReceiveMoney } from "react-icons/gi";
import { MdSchool } from "react-icons/md";
import ChartFour from "../Charts/ChartFour";
import Cookies from "js-cookie";
import axios, { AxiosResponse } from "axios";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import {
  RiLogoutCircleRFill,
  RiShipFill,
  RiVerifiedBadgeFill,
} from "react-icons/ri";
import { Blanko, BlankoKeluar } from "@/types/blanko";
import TableDataPublicBlanko from "../Pelatihan/TableDataPublicBlanko";
// import MapOne from "../Maps/MapOne";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "flowbite-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ChartPopover from "../Charts/ChartPopover";
import ChartPopoverKeluar from "../Charts/ChartPopoverKeluar";
import { formatDateTime } from "@/utils";
import ChartPopoverKeahlian from "../Charts/ChartPopoverKeahlian";
import TableDataBlankoKeluarPublic from "../Pelatihan/TableDataBlankoKeluarPublic";
import ChartBlankoAwal from "../Charts/ChartBlankoAwal";
import ChartPopoverKeterampilan from "../Charts/ChartPopoverKeterampilan";
import ChartCertificatesMonthly from "../Charts/ChartCertificatesMonthly";
import ChartPopoverPelatihan from "../Charts/ChartPopoverPelatihan";
import ChartPopoverSertifikasi from "../Charts/ChartPopoverSertifikasi";

const Dashboard: React.FC = () => {
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

  const [data, setData] = React.useState<BlankoKeluar[]>([]);
  const handleFetchingBlanko = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL}/adminpusat/getBlankoKeluar`
      );
      console.log("RESPONSE BLANKO KELUAR : ", response);
      setData(response.data.data);
    } catch (error) {
      console.error("ERROR BLANKO KELUAR : ", error);
      throw error;
    }
  };

  const [dataBlanko, setDataBlanko] = React.useState<Blanko[]>([]);
  const handleFetchingBlankoMaster = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL}/adminpusat/getBlanko`
      );
      console.log("RESPONSE BLANKO : ", response);
      setDataBlanko(response.data.data);
    } catch (error) {
      console.error("ERROR BLANKO : ", error);
      throw error;
    }
  };

  const [selectedId, setSelectedId] = React.useState<number>(0);

  React.useEffect(() => {
    fetchInformationLemdiklat();
    handleFetchingBlanko();
    handleFetchingBlankoMaster();
  }, []);

  return (
    <>
      <div className="flex flex-col mb-8">
        <div className="flex flex-row gap-2 items-center">
          <MdSchool className="text-4xl" />
          <div className="flex flex-col">
            <h1 className="text-4xl text-gray-900 font-medium leading-[100%] font-calsans">
              Dashboard Pelatihan
              <br />
            </h1>
            <p className="font-normal italic leading-[110%] text-gray-400 text-base max-w-4xl">
              The data collected comes from the implementation of training and
              competency tests held by training centers, and is valid to{" "}
              {formatDateTime()}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 h-fit max-h-fit md:grid-cols-3 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        <Popover>
          <PopoverTrigger asChild>
            <span onClick={(e) => setSelectedId(0)}>
              <CardDataStats
                title="Total Masyarakat Dilatih"
                total={dataBlanko
                  .reduce((total, item) => total + item.JumlahPengadaan, 0)
                  .toString()}
                rate="0%"
                levelUp
              >
                <GiPapers className="text-primary text-3xl group-hover:scale-110" />
              </CardDataStats>
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-150">
            <ChartBlankoAwal data={dataBlanko} />
          </PopoverContent>
        </Popover>

        <span onClick={(e) => setSelectedId(1)}>
          <CardDataStats
            title="Total Sertifikat Yang Keluar"
            total={data
              .filter(
                (item) => item.TipeBlanko === "Certificate of Competence (CoC)"
              )
              .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0)
              .toString()}
            rate=""
            levelDown
          >
            <HiCheckBadge className="text-primary text-3xl" />
          </CardDataStats>
        </span>

        <span onClick={(e) => setSelectedId(2)}>
          <CardDataStats
            title="Total Pelatihan"
            total={"187"}
            rate=""
            levelDown
          >
            <MdSchool className="text-primary text-3xl" />
          </CardDataStats>
        </span>
      </div>
      <div className="w-full mt-8">

        {selectedId == 0 && <ChartPopoverPelatihan data={data!} />}

        {selectedId == 1 && <ChartPopoverPelatihan data={data!} />}

        {selectedId == 2 && <ChartPopoverSertifikasi data={data!} />}
      </div>
    </>
  );
};

export default Dashboard;
