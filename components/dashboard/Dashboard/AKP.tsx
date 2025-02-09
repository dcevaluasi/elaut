"use client";
import React from "react";
import CardDataStats from "../CardDataStats";
import { HiCheckBadge } from "react-icons/hi2";
import { GiBattery75, GiPapers } from "react-icons/gi";
import { MdSchool } from "react-icons/md";
import Cookies from "js-cookie";
import axios, { AxiosResponse } from "axios";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import {
  RiFileCloseFill,
  RiLogoutCircleRFill,
  RiShipFill,
} from "react-icons/ri";
import { Blanko, BlankoKeluar, BlankoRusak } from "@/types/blanko";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "flowbite-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ChartPopover from "../Charts/ChartPopover";
import ChartPopoverKeluar from "../Charts/ChartPopoverKeluar";
import { formatDateTime } from "@/utils";
import ChartPopoverKeahlian from "../Charts/ChartPopoverKeahlian";
import ChartBlankoAwal from "../Charts/ChartBlankoAwal";
import ChartPopoverKeterampilan from "../Charts/ChartPopoverKeterampilan";
import ChartCertificatesMonthly from "../Charts/ChartCertificatesMonthly";
import useFetchSertifikatByTypeBlanko from "@/hooks/blanko/useFetchSertifikatByTypeBlanko";
import useFetchSertifikatByLemdiklat from "@/hooks/blanko/useFetchSertifikatByLemdiklat";
import { ChartSertifikatByLemdiklat } from "../akp";
import ChartSertifikatKeterampilanByLemdiklat from "../akp/sertifikat/ChartSertifikatKeterampilanByLemdiklat";
import ChartSertifikatKeahlianByLemdiklat from "../akp/sertifikat/ChartSertifikatKeahlianByLemdiklat";
import useFetchSertifikatByProgram from "@/hooks/blanko/useFetchSertifikatByProgram";

const AKP: React.FC = () => {
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
      setData(response.data.data);
    } catch (error) {
      console.error("ERROR BLANKO KELUAR : ", error);
      throw error;
    }
  };

  const [blankoRusak, setBlankoRusak] = React.useState<BlankoRusak[]>([]);

  const handleFetchingBlankoRusak = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL}/adminpusat/getBlankoRusak`
      );
      setBlankoRusak(response.data.data);
    } catch (error) {
      console.error("ERROR BLANKO RUSAK : ", error);
      throw error;
    }
  };

  const [dataBlanko, setDataBlanko] = React.useState<Blanko[]>([]);
  const handleFetchingBlankoMaster = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL}/adminpusat/getBlanko`
      );
      setDataBlanko(response.data.data);
    } catch (error) {
      console.error("ERROR BLANKO : ", error);
      throw error;
    }
  };

  const [selectedId, setSelectedId] = React.useState<number>(0);

  React.useEffect(() => {
    // Fungsi untuk fetch data
    const fetchAllData = () => {
      fetchInformationLemdiklat();
      handleFetchingBlankoRusak();
      handleFetchingBlanko();
      handleFetchingBlankoMaster();
    };

    // Panggil pertama kali saat komponen di-mount
    fetchAllData();
  }, []);

  const [startDate, setStartDate] = React.useState("2024-05-31");
  const [endDate, setEndDate] = React.useState("2025-12-31");

  const {
    data: dataSertifikatByTypeBlankoCoP,
    isFetching: isFetchingSertifikatByTypeBlankoCoP,
    refetch: refetchSertifikatByTypeBlankoCoP,
  } = useFetchSertifikatByTypeBlanko({
    type_blanko: "COP",
    start_date: startDate,
    end_date: endDate,
  });

  const {
    data: dataSertifikatByLemdiklat,
    isFetching: isFetchingSertifikatByLemdiklat,
    refetch: refetchSertifikatByLemdiklat,
  } = useFetchSertifikatByLemdiklat();

  const {
    data: dataSertifikatByProgram,
    isFetching: isFetchingSertifikatByProgram,
    refetch: refetchSertifikatByProgram,
  } = useFetchSertifikatByProgram();

  console.log({ dataSertifikatByLemdiklat });
  console.log({ dataSertifikatByProgram });

  const {
    data: dataSertifikatByTypeBlankoCoC,
    isFetching: isFetchingSertifikatByTypeBlankoCoC,
    refetch: refetchSertifikatByTypeBlankoCoC,
  } = useFetchSertifikatByTypeBlanko({
    type_blanko: "COC",
    start_date: startDate,
    end_date: endDate,
  });

  return (
    <>
      {dataSertifikatByLemdiklat != null && dataSertifikatByProgram != null && (
        <Card className="p-4 mb-6">
          <CardHeader>
            <div className="flex flex-col">
              <div className="flex flex-row gap-2 items-center">
                <RiShipFill className="text-2xl" />
                <div className="flex flex-col">
                  <h1 className="text-2xl text-gray-900 font-medium leading-[100%] font-calsans capitalize">
                    Dashboard Sertifikasi Awak Kapal Perikanan
                  </h1>
                  <p className="font-normal italic leading-[110%] text-gray-400 text-sm max-w-4xl">
                    The data presented is obtained through the AKAPI application
                    and processed by the Maritime and Fisheries Training Center
                    operator, and is valid to {formatDateTime()}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isFetchingSertifikatByTypeBlankoCoC &&
            isFetchingSertifikatByTypeBlankoCoP ? (
              <></>
            ) : dataSertifikatByTypeBlankoCoC != null &&
              dataSertifikatByTypeBlankoCoP != null ? (
              dataSertifikatByTypeBlankoCoC.data != null &&
              dataSertifikatByTypeBlankoCoP.data != null ? (
                <Tabs defaultValue={"CoP"} className="w-full mb-3 -mt-4">
                  <TabsList className="flex gap-2 w-full">
                    <TabsTrigger value="CoC" className="w-full">
                      CoC (Certificate of Competence)
                    </TabsTrigger>
                    <TabsTrigger value="CoP" className="w-full">
                      CoP (Certificate of Proficiency)
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="CoC">
                    <>
                      <ChartSertifikatKeahlianByLemdiklat
                        dataLembaga={dataSertifikatByLemdiklat}
                        dataProgram={dataSertifikatByProgram!}
                      />
                    </>
                  </TabsContent>
                  <TabsContent value="CoP">
                    <>
                      <ChartSertifikatKeterampilanByLemdiklat
                        dataLembaga={dataSertifikatByLemdiklat}
                        dataProgram={dataSertifikatByProgram!}
                      />
                    </>
                  </TabsContent>
                </Tabs>
              ) : (
                <></>
              )
            ) : (
              <></>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AKP;
