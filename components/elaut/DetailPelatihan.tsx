"use client";

import React from "react";
import Image from "next/image";
import { TbLocation } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  DetailPelatihanMasyarakat,
  PelatihanMasyarakat,
} from "@/types/product";
import FormRegistrationTraining from "../dashboard/users/formRegistrationTraining";
import Features from "../features";
import { generateTanggalPelatihan } from "@/utils/text";
import { formatToRupiah, replaceUrl } from "@/lib/utils";
import { PiStudent } from "react-icons/pi";
import { RiTimeZoneLine } from "react-icons/ri";

interface DetailPelatihanProps {
  data: DetailPelatihanMasyarakat;
  isRegistrasi: boolean;
  handleRegistration: () => void;
}

const DetailPelatihan: React.FC<DetailPelatihanProps> = ({
  data,
  isRegistrasi,
  handleRegistration,
}) => {
  const router = useRouter();

  return (
    <div className="bg-[#EEEAEB] h-full p-5 md:p-20 pt-24 md:pt-56 w-full">
      <div className="w-full flex md:items-end flex-col ">
        <div className="flex flex-col md:flex-row md:justify-end relative w-full md:max-w-6xl">
          <div className="bg-blue-500 shadow-custom w-full md:w-fit rounded-3xl md:absolute pb-14 md:-left-10">
            <div className="flex flex-col gap-2 w-full">
              <div className="m-2 -mt-16 relative md:w-[400px] md:h-[400px]">
                <Image
                  className="md:w-[400px] w-full h-[400px] rounded-3xl object-cover shadow-custom "
                  alt=""
                  src={replaceUrl(data.FotoPelatihan)}
                  width={0}
                  height={0}
                />
                <div className="flex flex-row gap-2 absolute text-sm top-3 z-50 right-3">
                  {data!.StatusApproval == "Selesai" && (
                    <span className="w-fit flex items-center text-center font-semibold px-4 py-2 bg-blue-500 rounded-3xl text-white ">
                      <RiTimeZoneLine /> Telah Berakhir
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col px-5 py-2 gap-3 md:w-[350px]">
                <h1 className="text-3xl text-white font-calsans leading-[100%]">
                  {data.NamaPelatihan}
                </h1>
                <p className="text-lg text-white flex gap-1 md:w-[450px] leading-none items-center">
                  <TbLocation className="text-lg w-6" />
                  {data.LokasiPelatihan}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2 md:items-end w-full text-left bg-white rounded-3xl p-10">
              <h2 className="text-blue-500 text-[2rem] md:text-[3.6rem] font-calsans leading-none">
                {formatToRupiah(data.HargaPelatihan)}
              </h2>
              <div className="flex flex-col md:items-end text-sm md:text-base">
                <p className="text-blue-500">
                  *Tidak termasuk <span className="font-bold">akomodasi</span>{" "}
                  & <span className="font-bold">konsumsi</span>
                </p>

                <p className="text-blue-500">
                  *Kuota kelas pelatihan{" "}
                  <span className="font-bold">{data.KoutaPelatihan} orang</span>
                </p>
              </div>

              <Button className="bg-blue-500 text-white font-bold w-full md:w-fit rounded-2xl md:rounded-full text-base md:text-xl p-4 md:p-7">
                {generateTanggalPelatihan(data.TanggalMulaiPelatihan)} -{" "}
                {generateTanggalPelatihan(data.TanggalBerakhirPelatihan)}
              </Button>

              <div className="flex md:items-end">
                <p
                  dangerouslySetInnerHTML={{ __html: data.DetailPelatihan }}
                  className="text-sm md:text-base font-normal text-[#979797] group-hover:duration-1000 prose-p:text-justify prose-p:md-!text-right md:text-right max-w-xl"
                />
              </div>

              {data.StatusApproval !== "Selesai" &&
                !isRegistrasi &&
                (!Cookies.get("XSRF081") ? (
                  <Button
                    onClick={() => router.replace("/registrasi")}
                    className="bg-blue-500 text-white font-extrabold w-fit rounded-2xl md:rounded-full text-lg md:text-2xl px-24 py-4 md:py-7 "
                  >
                    DAFTAR
                  </Button>
                ) : (
                  <Button
                    onClick={handleRegistration}
                    className="bg-blue-500 text-white font-extrabold w-fit rounded-2xl md:rounded-full text-lg md:text-2xl px-24 py-4 md:py-7 "
                  >
                    DAFTAR
                  </Button>
                ))}
            </div>

            {isRegistrasi && (
              <div className="flex flex-col gap-2 items-end w-full text-left bg-white rounded-3xl p-10">
                <h2 className="text-blue-500 text-[2rem] md:text-[3.6rem] font-calsans leading-none">
                  Detail Pendaftaran
                </h2>
                <div className="flex flex-col md:items-end text-sm md:text-base">
                  <p className="text-blue-500">
                    *Tidak termasuk <span className="font-bold">akomodasi</span>{" "}
                    & <span className="font-bold">konsumsi</span>
                  </p>

                  <p className="text-blue-500">
                    *Kuota kelas pelatihan{" "}
                    <span className="font-bold">{data.KoutaPelatihan} orang</span>
                  </p>
                </div>


                <FormRegistrationTraining
                  id={data.IdPelatihan}
                  harga={data.HargaPelatihan.toString()}
                  pelatihan={data}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {!isRegistrasi && <Features />}
    </div>
  );
};

export default DetailPelatihan;
