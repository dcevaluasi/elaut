"use client";
import React from "react";
import CardDataStats from "../CardDataStats";
import { HiCheckBadge } from "react-icons/hi2";
import { GiBattery75, GiPapers } from "react-icons/gi";
import { MdSchool } from "react-icons/md";
import Cookies from "js-cookie";
import axios, { AxiosResponse } from "axios";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import { RiFileCloseFill, RiLogoutCircleRFill, RiShipFill } from "react-icons/ri";
import { Blanko, BlankoKeluar, BlankoRusak } from "@/types/blanko";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import ChartBlankoAwal from "../Charts/ChartBlankoAwal";
import ChartPopoverKeterampilan from "../Charts/ChartPopoverKeterampilan";
import ChartCertificatesMonthly from "../Charts/ChartCertificatesMonthly";
import useFetchSertifikatByTypeBlanko from "@/hooks/blanko/useFetchSertifikatByTypeBlanko";
import useFetchSertifikatByLemdiklat from "@/hooks/blanko/useFetchSertifikatByLemdiklat";

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

  const [startDate, setStartDate] = React.useState('2024-05-31');
  const [endDate, setEndDate] = React.useState('2025-12-31');

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


  console.log({ dataSertifikatByLemdiklat })

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
      <div className="flex flex-col mb-8">
        <div className="flex flex-row gap-2 items-center">
          <RiShipFill className="text-4xl" />
          <div className="flex flex-col">
            <h1 className="text-4xl text-gray-900 font-medium leading-[100%] font-calsans capitalize">
              Dashboard Sertifikasi
              <br />
              Awak Kapal Perikanan
            </h1>
            <p className="font-normal italic leading-[110%] text-gray-400 text-base max-w-4xl">
              The data presented is obtained through the AKAPI application and
              processed by the Maritime and Fisheries Training Center operator,
              and is valid to {formatDateTime()}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 h-fit max-h-fit w-full md:grid-cols-3 md:gap-3 xl:grid-cols-3 2xl:gap-3">
        {
          isFetchingSertifikatByTypeBlankoCoC && isFetchingSertifikatByTypeBlankoCoP ? <></> : dataSertifikatByTypeBlankoCoC != null && dataSertifikatByTypeBlankoCoP != null ? dataSertifikatByTypeBlankoCoC.data != null && dataSertifikatByTypeBlankoCoP.data != null ?
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <span onClick={(e) => setSelectedId(0)}>
                    <CardDataStats
                      title="Total Pengadaan"
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

              <span onClick={(e) => setSelectedId(0)}>
                <CardDataStats
                  title="Total Blanko Terpakai"
                  total={(
                    (dataSertifikatByTypeBlankoCoC!.data.reduce((total, item) => total + item.jumlah_sertifikat, 0) + dataSertifikatByTypeBlankoCoP?.data.reduce((total, item) => total + item.jumlah_sertifikat, 0) + blankoRusak.length).toString()
                  ).toString()}
                  rate="0%"
                  levelUp
                >
                  <RiLogoutCircleRFill className="text-primary text-3xl" />
                </CardDataStats>
              </span>

              <Popover>
                <PopoverTrigger asChild>
                  <span onClick={(e) => setSelectedId(0)}>
                    <CardDataStats
                      title="Sisa Persediaan"
                      total={
                        (dataBlanko.reduce(
                          (total, item) => total + item.JumlahPengadaan,
                          0
                        ) - (dataSertifikatByTypeBlankoCoC!.data.reduce((total, item) => total + item.jumlah_sertifikat, 0) + dataSertifikatByTypeBlankoCoP?.data
                          .filter((item) => item.jenis_sertifikat === 'Rating Awak Kapal Perikanan')
                          .reduce((total, item) => total + item.jumlah_sertifikat, 0)) - dataSertifikatByTypeBlankoCoP?.data
                            .filter((item) => item.jenis_sertifikat !== 'Rating Awak Kapal Perikanan')
                            .reduce((total, item) => total + item.jumlah_sertifikat, 0) - blankoRusak.length).toString()}
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
                      CoC: dataSertifikatByTypeBlankoCoC!.data.reduce((total, item) => total + item.jumlah_sertifikat, 0) + dataSertifikatByTypeBlankoCoP?.data
                        .filter((item) => item.jenis_sertifikat === 'Rating Awak Kapal Perikanan')
                        .reduce((total, item) => total + item.jumlah_sertifikat, 0), CoP: dataSertifikatByTypeBlankoCoP?.data
                          .filter((item) => item.jenis_sertifikat !== 'Rating Awak Kapal Perikanan')
                          .reduce((total, item) => total + item.jumlah_sertifikat, 0)
                    }}
                    dataBlankoRusak={blankoRusak}
                  />
                </PopoverContent>
              </Popover>

              <CardDataStats
                title="Total Sertifikat CoC"
                total={
                  (dataSertifikatByTypeBlankoCoC!.data.reduce((total, item) => total + item.jumlah_sertifikat, 0) + dataSertifikatByTypeBlankoCoP?.data
                    .filter((item) => item.jenis_sertifikat === 'Rating Awak Kapal Perikanan')
                    .reduce((total, item) => total + item.jumlah_sertifikat, 0))
                    .toString()
                }
                rate=""
                levelDown
              >
                <MdSchool className="text-primary text-3xl" />
              </CardDataStats>

              <CardDataStats
                title="Total Sertifikat CoP"
                total={
                  (dataSertifikatByTypeBlankoCoP?.data
                    .filter((item) => item.jenis_sertifikat !== 'Rating Awak Kapal Perikanan')
                    .reduce((total, item) => total + item.jumlah_sertifikat, 0))
                    .toString()
                }
                rate=""
                levelDown
              >
                <RiShipFill className="text-primary text-3xl" />
              </CardDataStats>

              <CardDataStats
                title="Total Blanko Rusak"
                total={blankoRusak
                  .length
                  .toString()}
                rate="0%"
                levelUp
              >
                <RiFileCloseFill className="text-primary text-3xl group-hover:scale-110" />
              </CardDataStats>
            </>
            : <></>
            : <></>
        }

      </div>

      {
        isFetchingSertifikatByTypeBlankoCoC && isFetchingSertifikatByTypeBlankoCoP ? <></> : dataSertifikatByTypeBlankoCoC != null && dataSertifikatByTypeBlankoCoP != null ? dataSertifikatByTypeBlankoCoC.data != null && dataSertifikatByTypeBlankoCoP.data != null ?
          <div className="w-full mt-8">
            {/* <ChartCertificatesMonthly data={data!} dataSertifikat={{
              CoC: dataSertifikatByTypeBlankoCoC!.data.reduce((total, item) => total + item.jumlah_sertifikat, 0), CoP: dataSertifikatByTypeBlankoCoP?.data.reduce((total, item) => total + item.jumlah_sertifikat, 0)
            }} /> */}

            <Tabs defaultValue={"CoP"} className="w-full mb-3 -mt-4">
              <TabsList className="flex gap-2 w-full">
                <TabsTrigger value="CoC" className="w-full">
                  Keahlian Awak Kapal Perikanan
                </TabsTrigger>
                <TabsTrigger value="CoP" className="w-full">
                  Keterampilan Awak Kapal Perikanan
                </TabsTrigger>
              </TabsList>
              <TabsContent value="CoC">
                <ChartPopoverKeahlian data={data!} dataSertifikat={{
                  CoC: dataSertifikatByTypeBlankoCoC?.data,
                  CoP: dataSertifikatByTypeBlankoCoP?.data
                }} />
              </TabsContent>
              <TabsContent value="CoP">
                <ChartPopoverKeterampilan data={data!} dataSertifikat={{
                  CoP: dataSertifikatByTypeBlankoCoP?.data
                }} />
              </TabsContent>
            </Tabs>
          </div>
          : <></>
          : <></>
      }

    </>
  );
};

export default AKP;
