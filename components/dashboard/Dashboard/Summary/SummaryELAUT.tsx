"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios, { AxiosResponse } from "axios";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import { PelatihanMasyarakat } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartMasyarakatDilatihMonthly from "../../Charts/ChartMasyarakatDilatihMonthly";
import ChartDetailMasyarakatDilatih from "../../Charts/ChartDetailMasyarakatDilatih";
import ChartSertifikasiKompetensiMonthly from "../../Charts/ChartSertifikasiKompetensiMonthly";
import { BALAI_PELATIHAN } from "@/constants/pelatihan";
import { HashLoader } from "react-spinners";

const SummaryELAUT: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("XSRF091");

  const [lemdikData, setLemdikData] = useState<LemdiklatDetailInfo | null>(
    null
  );
  const [data, setData] = useState<PelatihanMasyarakat[]>([]);
  const [selectedBalaiPelatihan, setSelectedBalaiPelatihan] =
    useState<string>("All");

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

  const handleFetchingPublicTrainingData = async (
    selectedBalaiPelatihan: string
  ) => {
    setIsFetching(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getPelatihan?penyelenggara_pelatihan=${
          selectedBalaiPelatihan === "All" ? "" : selectedBalaiPelatihan
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

  useEffect(() => {
    const fetchAllData = () => {
      fetchInformationLemdiklat();
      handleFetchingPublicTrainingData("All");
    };

    fetchAllData();

    const intervalId = setInterval(fetchAllData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full">
      <Tabs defaultValue="CoC" className="w-full mb-3">
        <TabsList className="flex gap-2 w-full">
          <TabsTrigger value="CoC" className="w-full">
            Masyarakat Dilatih
          </TabsTrigger>
          <TabsTrigger value="CoP" className="w-full">
            SDM KP Berkompetensi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="CoC">
          <Tabs defaultValue={selectedBalaiPelatihan} className="w-full mb-3">
            <TabsList className="w-full">
              <TabsTrigger
                onClick={() => setSelectedBalaiPelatihan("All")}
                value="All"
              >
                All
              </TabsTrigger>
              {BALAI_PELATIHAN.map((balaiPelatihan) => (
                <TabsTrigger
                  key={balaiPelatihan.Name}
                  onClick={() => {
                    setSelectedBalaiPelatihan(balaiPelatihan.Name);
                    handleFetchingPublicTrainingData(balaiPelatihan.Name);
                  }}
                  value={balaiPelatihan.Name}
                >
                  {balaiPelatihan.Name}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedBalaiPelatihan}>
              {isFetching ? (
                <div className="w-full h-[60vh] flex items-center justify-center">
                  <HashLoader color="#338CF5" size={60} />
                </div>
              ) : data != null ? (
                <>
                  <ChartMasyarakatDilatihMonthly data={data} />
                  <ChartDetailMasyarakatDilatih data={data} />
                </>
              ) : (
                <></>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="CoP">
          {/* <ChartSertifikasiKompetensiMonthly data={data} /> */}
          {/* <ChartDetailMasyarakatDilatih data={data} /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SummaryELAUT;
