"use client";

import React from "react";
import CardDataStats from "../CardDataStats";
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ChartPopover from "../Charts/ChartPopover";
import { formatDateTime } from "@/utils";
import ChartBlankoAwal from "../Charts/ChartBlankoAwal";
import useFetchSertifikatByTypeBlanko from "@/hooks/blanko/useFetchSertifikatByTypeBlanko";
import useFetchSertifikatByLemdiklat from "@/hooks/blanko/useFetchSertifikatByLemdiklat";

import ChartSertifikatKeterampilanByLemdiklat from "../akp/sertifikat/ChartSertifikatKeterampilanByLemdiklat";
import ChartSertifikatKeahlianByLemdiklat from "../akp/sertifikat/ChartSertifikatKeahlianByLemdiklat";
import useFetchSertifikatByProgram from "@/hooks/blanko/useFetchSertifikatByProgram";

import { HashLoader } from "react-spinners";

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

  const [startDate, setStartDate] = React.useState("2024-01-01");
  const [endDate, setEndDate] = React.useState("2024-12-31");

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
      {dataSertifikatByLemdiklat != null && dataSertifikatByProgram != null ? (
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
            <div className="flex flex-row items-center justify-between mb-3">
              <div className="flex flex-row items-center gap-2">
                <GiPapers />
                <div className="flex flex-col gap-0">
                  <CardTitle>Data Pengadaan dan Penggunaan Blanko</CardTitle>
                  <CardDescription>27 May 2024 - Now 2025</CardDescription>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 h-fit max-h-fit w-full md:grid-cols-3 md:gap-3 xl:grid-cols-3 2xl:gap-3 mb-10">
              {isFetchingSertifikatByTypeBlankoCoC &&
                isFetchingSertifikatByTypeBlankoCoP ? (
                <></>
              ) : dataSertifikatByTypeBlankoCoC != null &&
                dataSertifikatByTypeBlankoCoP != null ? (
                dataSertifikatByTypeBlankoCoC.data != null &&
                  dataSertifikatByTypeBlankoCoP.data != null ? (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <span onClick={(e) => setSelectedId(0)}>
                          <CardDataStats
                            title="Total Pengadaan"
                            total={dataBlanko
                              .reduce(
                                (total, item) => total + item.JumlahPengadaan,
                                0
                              )
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

                    <Popover>
                      <PopoverTrigger asChild>
                        <span onClick={(e) => setSelectedId(0)}>
                          <CardDataStats
                            title="Total Blanko Terpakai"
                            total={(
                              dataSertifikatByLemdiklat.data.data_lembaga
                                .flatMap((item: any) => item.sertifikat || []) // Extract all sertifikat arrays
                                .reduce(
                                  (sum: number, s: any) => sum + s.total,
                                  0
                                ) +
                              dataSertifikatByLemdiklat.data.data_unit_kerja
                                .flatMap((item: any) => item.sertifikat || []) // Extract all sertifikat arrays
                                .reduce(
                                  (sum: number, s: any) => sum + s.total,
                                  0
                                ) +
                              blankoRusak.length
                            )
                              .toString()
                              .toString()}
                            rate="0%"
                            levelUp
                          >
                            <RiLogoutCircleRFill className="text-primary text-3xl" />
                          </CardDataStats>
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="w-full flex gap-2">
                        <CardDataStats
                          title="Total Sertifikat CoC"
                          total={
                            dataSertifikatByLemdiklat.data.data_unit_kerja
                              .flatMap((item: any) => item.sertifikat || []) // Extract all sertifikat arrays
                              .reduce((sum: number, s: any) => sum + s.total, 0) // Sum up all total values
                          }
                          rate=""
                          levelDown
                        >
                          <MdSchool className="text-primary text-3xl" />
                        </CardDataStats>

                        <CardDataStats
                          title="Total Sertifikat CoP"
                          total={
                            dataSertifikatByLemdiklat.data.data_lembaga
                              .flatMap((item: any) => item.sertifikat || []) // Extract all sertifikat arrays
                              .reduce((sum: number, s: any) => sum + s.total, 0) // Sum up all total values
                          }
                          rate=""
                          levelDown
                        >
                          <RiShipFill className="text-primary text-3xl" />
                        </CardDataStats>

                        <Popover>
                          <PopoverTrigger asChild>
                            <span onClick={(e) => setSelectedId(0)}>
                              <CardDataStats
                                title="Total Blanko Rusak"
                                total={blankoRusak.length.toString()}
                                rate="0%"
                                levelUp
                              >
                                <RiFileCloseFill className="text-primary text-3xl group-hover:scale-110" />
                              </CardDataStats>
                            </span>
                          </PopoverTrigger>
                          <PopoverContent
                            side="bottom"
                            className="w-fit flex gap-2 mt-4"
                          >
                            <CardDataStats
                              title="Blanko CoC Rusak"
                              total={blankoRusak!
                                .filter(
                                  (item) =>
                                    item.Tipe ==
                                    "Certificate of Competence (CoC)"
                                )
                                .length.toString()}
                              rate=""
                              levelDown
                            >
                              <MdSchool className="text-primary text-3xl" />
                            </CardDataStats>

                            <CardDataStats
                              title="Blanko CoP Rusak"
                              total={blankoRusak!
                                .filter(
                                  (item) =>
                                    item.Tipe ==
                                    "Certificate of Proficiency (CoP)"
                                )
                                .length.toString()}
                              rate=""
                              levelDown
                            >
                              <RiShipFill className="text-primary text-3xl" />
                            </CardDataStats>
                          </PopoverContent>
                        </Popover>
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <span onClick={(e) => setSelectedId(0)}>
                          <CardDataStats
                            title="Sisa Persediaan"
                            total={(
                              dataBlanko.reduce(
                                (total, item) => total + item.JumlahPengadaan,
                                0
                              ) -
                              dataSertifikatByLemdiklat.data.data_lembaga
                                .flatMap((item: any) => item.sertifikat || []) // Extract all sertifikat arrays
                                .reduce(
                                  (sum: number, s: any) => sum + s.total,
                                  0
                                ) -
                              dataSertifikatByLemdiklat.data.data_unit_kerja
                                .flatMap((item: any) => item.sertifikat || []) // Extract all sertifikat arrays
                                .reduce(
                                  (sum: number, s: any) => sum + s.total,
                                  0
                                ) -
                              blankoRusak.length
                            ).toString()}
                            rate=""
                            levelDown
                          >
                            <GiBattery75 className="text-primary text-3xl" />
                          </CardDataStats>
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="w-150">
                        <ChartPopover
                          data={dataBlanko}
                          dataSertifikat={{
                            CoC:
                              dataSertifikatByTypeBlankoCoC!.data.reduce(
                                (total, item) => total + item.jumlah_sertifikat,
                                0
                              ) +
                              dataSertifikatByTypeBlankoCoP?.data
                                .filter(
                                  (item) =>
                                    item.jenis_sertifikat ===
                                    "Rating Awak Kapal Perikanan"
                                )
                                .reduce(
                                  (total, item) =>
                                    total + item.jumlah_sertifikat,
                                  0
                                ),
                            CoP: dataSertifikatByTypeBlankoCoP?.data
                              .filter(
                                (item) =>
                                  item.jenis_sertifikat !==
                                  "Rating Awak Kapal Perikanan"
                              )
                              .reduce(
                                (total, item) => total + item.jumlah_sertifikat,
                                0
                              ),
                          }}
                          dataBlankoRusak={blankoRusak}
                        />
                      </PopoverContent>
                    </Popover>
                  </>
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
            </div>
            {isFetchingSertifikatByTypeBlankoCoC &&
              isFetchingSertifikatByTypeBlankoCoP ? (
              <></>
            ) : dataSertifikatByTypeBlankoCoC != null &&
              dataSertifikatByTypeBlankoCoP != null ? (
              dataSertifikatByTypeBlankoCoC.data != null &&
                dataSertifikatByTypeBlankoCoP.data != null ? (
                <Tabs defaultValue={"CoC"} className="w-full mb-3 -mt-4">
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
      ) : (
        <div className="w-full flex h-[50vh] items-center justify-center">
          <HashLoader color="#338CF5" size={50} />
        </div>
      )}
    </>
  );
};

export default AKP;
