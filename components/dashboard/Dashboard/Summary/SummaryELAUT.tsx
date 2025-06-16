"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios, { AxiosResponse } from "axios";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import { PelatihanMasyarakat } from "@/types/product";
import ChartMasyarakatDilatihMonthly from "../../Charts/ChartMasyarakatDilatihMonthly";
import ChartDetailMasyarakatDilatih from "../../Charts/ChartDetailMasyarakatDilatih";
import { HashLoader } from "react-spinners";
import Image from "next/image";
import { User, UserPelatihan } from "@/types/user";
import useFetchDataDukung from "@/hooks/elaut/useFetchDataDukung";
import { exportDataDukungToExcel } from "@/lib/exportToExcel";
import { Button } from "@/components/ui/button";

const SummaryELAUT: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("XSRF091");

  const [lemdikData, setLemdikData] = useState<LemdiklatDetailInfo | null>(
    null
  );
  const [data, setData] = useState<PelatihanMasyarakat[]>([]);

  const fetchInformationLemdiklat = async () => {
    try {
      const response = await axios.get(`${baseUrl}/lemdik/getLemdik`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLemdikData(response.data);
      Cookies.set("IDLemdik", response.data.data.IdLemdik);
      console.log("LEMDIK INFO: ", response);
    } catch (error) {
      console.error("LEMDIK INFO: ", error);
    }
  };

  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  const [dataUser, setDataUser] = React.useState<UserPelatihan[]>([]);

  const handleFetchingUserPelatihan = async () => {
    setIsFetching(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/getUsersPelatihan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDataUser(response.data.data);
      console.log("User Pelatihan Data Response:", response);
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching training data:", error);
      setIsFetching(false);
    }
  };

  const handleFetchingPublicTrainingData = async (
    selectedBalaiPelatihan: string
  ) => {
    setIsFetching(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getPelatihan?penyelenggara_pelatihan=${selectedBalaiPelatihan === "All" ? "" : selectedBalaiPelatihan
        }`
      );
      setData(response.data.data);
      console.log("Training Data Response:", response);
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching training data:", error);
      setIsFetching(false);
    }
  };

  const {
    data: dataDukung,
    isFetching: isFetchingDataDukung,
    refetch: refetchDataDukung,
  } = useFetchDataDukung();

  const handleDownloadExcel = () => {
    if (dataDukung.length > 0) {
      exportDataDukungToExcel(dataDukung)
    } else {
      alert('Tidak ada data untuk diunduh.')
    }
  }

  React.useEffect(() => {
    const fetchAllData = () => {
      fetchInformationLemdiklat();
      handleFetchingUserPelatihan();
      handleFetchingPublicTrainingData("All");
    };

    fetchAllData();
  }, []);

  console.log({ dataDukung })

  return (
    <div className="w-full">
      {isFetching ? (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <HashLoader color="#338CF5" size={60} />
        </div>
      ) : data != null ? (
        <>
          <Button onClick={handleDownloadExcel} className="bg-blue-500 text-white mb-2 hover:bg-blue-600">

            {isFetchingDataDukung ? 'Mengunduh...' : 'Download Data Dukung'}
          </Button>


          <ChartMasyarakatDilatihMonthly data={data} dataUser={dataUser} />
          <ChartDetailMasyarakatDilatih data={data} dataUser={dataUser} />
        </>
      ) : (
        <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6 mt-20">
          <div className="pt-7 md:pt-0 flex flex-col items-center">
            <Image
              src={"/illustrations/not-found.png"}
              alt="Not Found"
              width={0}
              height={0}
              className="w-[350px] md:w-[400px]"
            />
            <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
              <h1 className="text-2xl md:text-3xl font-calsans leading-[110%] text-black">
                Belum Ada Pelatihan
              </h1>
              <div className="text-gray-600 text-center leading-[125%]  max-w-md">
                Capaian ataupun summary dari pelaksanaan pelatihan belum dapat
                dilihat, karena Balai Pelatihan belum memiliki peneyelenggaraan
                pelatihan!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryELAUT;
