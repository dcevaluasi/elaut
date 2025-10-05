"use client";
import React from "react";
import { HashLoader } from "react-spinners";
import Image from "next/image";
import ChartMasyarakatDilatihMonthly from "@/commons/charts/ChartMasyarakatDilatihMonthly";
import ChartDetailMasyarakatDilatih from "@/commons/charts/ChartDetailMasyarakatDilatih";
import useFetchDataDukung from "@/hooks/elaut/useFetchDataDukung";
import { useFetchAllDataPelatihanMasyarakat } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakat";
import dayjs from "dayjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiFilter } from "react-icons/fi";
import { tahunList } from "@/utils/time";

const SummaryPelatihan: React.FC = () => {
  const { data: dataDukung, isFetching: isFetchingDataDukung, refetch } = useFetchDataDukung()
  const { data, isFetching, refetch: refechDataPelatihan } = useFetchAllDataPelatihanMasyarakat()

  const [tahun, setTahun] = React.useState(() => dayjs().year());
  const [triwulan, setTriwulan] = React.useState(() => {
    const month = dayjs().month() + 1;
    if (month <= 3) return "TW I";
    if (month <= 6) return "TW II";
    if (month <= 9) return "TW III";
    return "TW IV";
  });

  return (
    <div className="w-full mt-5">
      {isFetching || isFetchingDataDukung ? (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <HashLoader color="#338CF5" size={60} />
        </div>
      ) : data != null ? (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-base font-semibold">
              <FiFilter className="text-blue-600" />
              Filter by Tahun dan Triwulan
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Select value={String(tahun)} onValueChange={(val) => setTahun(Number(val))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {tahunList.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={triwulan} onValueChange={setTriwulan}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Pilih Triwulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TW I">TW I</SelectItem>
                  <SelectItem value="TW II">TW II</SelectItem>
                  <SelectItem value="TW III">TW III</SelectItem>
                  <SelectItem value="TW IV">TW IV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ChartMasyarakatDilatihMonthly data={data} dataUser={dataDukung} tahun={tahun.toString()} triwulan={triwulan} />
          <ChartDetailMasyarakatDilatih data={data} dataUser={dataDukung} tahun={tahun.toString()} triwulan={triwulan} />
        </>
      ) : (
        <div className="relative max-w-7xl w-full mx-auto mt-20">
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

export default SummaryPelatihan;
