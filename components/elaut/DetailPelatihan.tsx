"use client";

import React from "react";
import Image from "next/image";
import { TbBook, TbBuilding, TbCalendar, TbCalendarEvent, TbClock, TbInfoCircle, TbLocation, TbMoneybag, TbPin, TbSchool } from "react-icons/tb";
import { RiTimeZoneLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import {
  DetailPelatihanMasyarakat,
} from "@/types/product";
import FormRegistrationTraining from "../dashboard/users/formRegistrationTraining";
import Features from "../features";
import { generateTanggalPelatihan } from "@/utils/text";
import { formatToRupiah, replaceUrl } from "@/lib/utils";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { FiUploadCloud } from "react-icons/fi";
import Link from "next/link";
import AuthenticationDialog from "./reusable/AuthenticationDialog";
import { isMoreThanToday } from "@/utils/time";

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
  const detailPelatihanUrl = usePathname()

  const [openDialogAuth, setOpenDialogAuth] = React.useState(false)

  return (
    <div className="relative w-full md:mt-28">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-10 items-start">

        <div className="flex-1 flex flex-col gap-6 relative">
          <div className="flex gap-2 absolute top-4 right-4 z-[99999]">

            {data.StatusApproval === "Selesai" && (
              <span className=" flex items-center gap-2 bg-red-500/90 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                <RiTimeZoneLine className="w-5 h-5" />
                Telah Berakhir
              </span>
            )}
          </div>

          {/* Price + Info */}
          <div className="border border-white/15 bg-white/10 backdrop-blur-xl 
                    shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-all duration-500 
                     hover:border-blue-400/40 rounded-3xl p-5 md:p-8">

            <div className="relative w-full flex md:flex-row flex-col gap-2 items-start">
              <div className="relative rounded-3xl overflow-hidden shadow-xl">
                {
                  data.FotoPelatihan == "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? <></> : <Image
                    className="w-[400px] h-full object-cover flex-shrink-0"
                    alt={data.NamaPelatihan}
                    src={replaceUrl(data.FotoPelatihan)}
                    width={400}
                    height={400}
                  />
                }
              </div>

              <div className={`${data.FotoPelatihan == "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? "" : ""}  rounded-3xl p-7 bg-gradient-to-br from-blue-500/70 to-sky-600/20 text-gray-200  backdrop-blur-xl 
                    shadow-[0_8px_40px_rgba(0,0,0,0.35)] border-white/20 border w-full h-fit`}>
                <h1 className="text-3xl font-calsans leading-none mb-6 max-w-3xl">
                  {data.NamaPelatihan}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <HiOutlineUserGroup className="w-5 h-5 flex-shrink-0 text-blue-300" />
                  Pendaftar :  {data?.UserPelatihan.length}/{data?.KoutaPelatihan} Pendaftar
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <TbBook className="w-5 h-5 flex-shrink-0 text-blue-300" />
                  Bidang : {data.JenisProgram}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <TbSchool className="w-5 h-5 flex-shrink-0 text-blue-300" />
                  Program : {data.Program}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <TbMoneybag className="w-5 h-5 flex-shrink-0 text-blue-300" />
                  Biaya : {data.HargaPelatihan === 0
                    ? "Gratis"
                    : `${formatToRupiah(data.HargaPelatihan)}`}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <TbBuilding className="w-5 h-5 flex-shrink-0 text-blue-300" />
                  Penyelenggara : {data.PenyelenggaraPelatihan}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <TbCalendarEvent className="w-5 h-5 flex-shrink-0 text-blue-300" />
                  Pendaftaran : {data!.TanggalMulaiPendaftaran != '' ? <>{generateTanggalPelatihan(data.TanggalMulaiPendaftaran)} - {generateTanggalPelatihan(data.TanggalAkhirPendaftaran)}</> : <>-</>}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <TbClock className="w-5 h-5 flex-shrink-0 text-blue-300" />
                  Pelaksanaan : {generateTanggalPelatihan(data.TanggalMulaiPelatihan)} - {generateTanggalPelatihan(data.TanggalBerakhirPelatihan)}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <TbLocation className="w-5 h-5 flex-shrink-0 text-blue-300" />
                  Lokasi : {data.LokasiPelatihan}
                </p>
              </div>
            </div>

            {/* Description */}
            <div
              className="mt-10 prose prose-invert text-gray-200 text-sm md:text-base leading-relaxed max-w-none"
            >
              <div dangerouslySetInnerHTML={{ __html: data.DetailPelatihan }} />
            </div>

            {/* Register Button */}
            {(!isRegistrasi && !isMoreThanToday(data?.TanggalAkhirPendaftaran)) && (
              <div className="mt-8">
                {!Cookies.get("XSRF081") ? (
                  <>
                    <Button
                      onClick={() => setOpenDialogAuth(true)}
                      className="bg-gradient-to-r w-full from-blue-600 to-sky-600 flex gap-2 items-center hover:from-blue-700 hover:to-sky-700 text-white font-bold px-10 py-6 rounded-full text-lg transition"
                    >
                      <FiUploadCloud />DAFTAR PELATIHAN
                    </Button>
                    <AuthenticationDialog open={openDialogAuth} setOpen={setOpenDialogAuth} />
                  </>
                ) : (
                  <Link
                    href={`https://elaut-bppsdm.kkp.go.id${detailPelatihanUrl}/register`}
                    className="bg-gradient-to-r w-full from-blue-600 to-sky-600 flex gap-2 items-center justify-center text-center hover:from-blue-700 hover:to-sky-700 text-white font-bold px-10 py-3 rounded-full text-lg transition"
                  >
                    <FiUploadCloud />DAFTAR PELATIHAN
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Registration Form */}
          {isRegistrasi && (
            <div className="bg-white/90 backdrop-blur-lg shadow-xl rounded-3xl p-8">
              <h2 className="text-blue-600 text-3xl font-bold">
                Detail Pendaftaran
              </h2>
              <p className="mt-2 text-gray-200 text-sm">
                *Pastikan data yang kamu masukkan benar ya 👍
              </p>

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
  );
};

export default DetailPelatihan;
