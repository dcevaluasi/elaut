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
    <div className="relative w-full">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1 flex flex-col gap-8 relative">
          <div className="flex gap-2 absolute top-6 right-6 z-20">
            {data.StatusApproval === "Selesai" && (
              <span className="flex items-center gap-2 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                <RiTimeZoneLine className="w-5 h-5" />
                Telah Berakhir
              </span>
            )}
          </div>

          {/* Main Info Card */}
          <div className="relative group">
            {/* Glow Effect Backdrop */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-500" />

            <div className="relative border border-white/10 bg-[#1e293b]/40 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] p-6 md:p-10 transition-all duration-500">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Training Image */}
                <div className="relative w-full lg:w-1/3 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group/img">
                  {data.FotoPelatihan !== "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? (
                    <>
                      <Image
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                        alt={data.NamaPelatihan}
                        src={replaceUrl(data.FotoPelatihan)}
                        fill
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <TbSchool className="w-20 h-20 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-calsans text-white leading-[1.1] tracking-tight">
                      {data.NamaPelatihan}
                    </h1>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                        <TbSchool className="w-4 h-4" />
                        {data.JenisProgram}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                        <TbBuilding className="w-4 h-4" />
                        {data.PenyelenggaraPelatihan}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={HiOutlineUserGroup} label="Pendaftar" value={`${data?.UserPelatihan.length}/${data?.KoutaPelatihan} Pendaftar`} />
                    <InfoItem icon={TbMoneybag} label="Biaya" value={data.HargaPelatihan === 0 ? "Gratis" : formatToRupiah(data.HargaPelatihan)} />
                    <InfoItem icon={TbCalendarEvent} label="Pendaftaran" value={data.TanggalMulaiPendaftaran !== '' ? `${generateTanggalPelatihan(data.TanggalMulaiPendaftaran)} - ${generateTanggalPelatihan(data.TanggalAkhirPendaftaran)}` : "-"} />
                    <InfoItem icon={TbClock} label="Pelaksanaan" value={`${generateTanggalPelatihan(data.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(data.TanggalBerakhirPelatihan)}`} />
                    <InfoItem icon={TbLocation} label="Lokasi" value={data.LokasiPelatihan} className="md:col-span-2" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-12 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  <h2 className="text-2xl font-calsans text-white">Detail Pelatihan</h2>
                </div>
                <div className="prose prose-invert prose-blue max-w-none text-gray-300/90 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: data.DetailPelatihan }} />
                </div>
              </div>

              {/* Action Button */}
              {(!isRegistrasi && !isMoreThanToday(data?.TanggalAkhirPendaftaran)) && data?.AsalPelatihan == "Mandiri" && (
                <div className="mt-12">
                  {!Cookies.get("XSRF081") ? (
                    <>
                      <button
                        onClick={() => setOpenDialogAuth(true)}
                        className="group/btn relative w-full h-16 flex items-center justify-center gap-3 rounded-2xl bg-blue-600 font-bold text-white text-lg overflow-hidden transition-all duration-300 hover:bg-blue-500 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                      >
                        <div className="absolute inset-0 w-8 bg-white/20 -skew-x-12 translate-x-[-150%] group-hover/btn:translate-x-[600%] transition-transform duration-1000" />
                        <FiUploadCloud className="w-6 h-6 transition-transform group-hover/btn:translate-y-[-2px] group-hover/btn:scale-110" />
                        DAFTAR PELATIHAN SEKARANG
                      </button>
                      <AuthenticationDialog open={openDialogAuth} setOpen={setOpenDialogAuth} />
                    </>
                  ) : (
                    <Link
                      href={`https://elaut-bppsdm.kkp.go.id${detailPelatihanUrl}/register`}
                      className="group/btn relative w-full h-16 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white text-lg overflow-hidden transition-all duration-300 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                    >
                      <div className="absolute inset-0 w-8 bg-white/20 -skew-x-12 translate-x-[-150%] group-hover/btn:translate-x-[600%] transition-transform duration-1000" />
                      <FiUploadCloud className="w-6 h-6 transition-transform group-hover/btn:translate-y-[-2px] group-hover/btn:scale-110" />
                      DAFTAR PELATIHAN SEKARANG
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          {isRegistrasi && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] p-8 md:p-12"
            >
              <div className="mb-8">
                <h2 className="text-white text-4xl font-calsans mb-2">Formulir Pendaftaran</h2>
                <p className="text-blue-400 font-medium">
                  Pastikan data yang kamu masukkan sudah benar dan sesuai dengan identitas resmi.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <FormRegistrationTraining
                  id={data.IdPelatihan}
                  harga={data.HargaPelatihan.toString()}
                  pelatihan={data}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for layout cleaner
const InfoItem = ({ icon: Icon, label, value, className = "" }: { icon: any, label: string, value: string, className?: string }) => (
  <div className={`flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors ${className}`}>
    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-sm font-medium leading-tight">{value}</p>
    </div>
  </div>
);

export default DetailPelatihan;
