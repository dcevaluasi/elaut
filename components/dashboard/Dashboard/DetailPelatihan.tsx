"use client";

import React from "react";
import {
  RiProgress3Line,
  RiRadioButtonLine,
  RiShipLine,
  RiVerifiedBadgeFill,
} from "react-icons/ri";

import { LucideFileCheck2, TrendingUp } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  ArrowUpDown,
  Edit3Icon,
  Fullscreen,
  LucideClipboardEdit,
  LucideNewspaper,
  LucidePrinter,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HiLockClosed, HiMiniUserGroup, HiUserGroup } from "react-icons/hi2";
import { TbSchool } from "react-icons/tb";
import {
  IoIosBook,
  IoIosInformationCircle,
  IoMdBook,
  IoMdClose,
  IoMdGlobe,
  IoMdInformationCircleOutline,
} from "react-icons/io";
import { FiUploadCloud } from "react-icons/fi";

import { usePathname, useRouter } from "next/navigation";
import { MdOutlineSaveAlt } from "react-icons/md";
import FormPelatihan from "../admin/formPelatihan";

import { convertDate } from "@/utils";
import Cookies from "js-cookie";
import { Progress } from "@/components/ui/progress";
import { DialogTemplateSertifikatPelatihan } from "@/components/sertifikat/dialogTemplateSertifikatPelatihan";
import Link from "next/link";
import { elautBaseUrl } from "@/constants/urls";

import { FaBookOpen } from "react-icons/fa6";
import axios from "axios";
import { PelatihanMasyarakat } from "@/types/product";
import { generateFullNameBalai, generateTanggalPelatihan } from "@/utils/text";
import { formatToRupiah, generateInstrukturName } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import Toast from "@/components/toast";
import { MateriButton, PublishButton } from "./Actions";
import DeleteButton from "./Actions/DeleteButton";
import CloseButton from "./Actions/CloseButton";
import UploadSuratButton from "./Actions/UploadSuratButton";
import GenerateNoSertifikatButton from "./Actions/GenerateNoSertifikatButton";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function DetailPelatihan() {
  const paths = usePathname().split("/");
  const idPelatihan = paths[paths.length - 1];
  const kodePelatihan = paths[paths.length - 2];
  const [pelatihan, setPelatihan] = React.useState<PelatihanMasyarakat | null>(
    null
  );
  const handleFetchDetailPelatihan = async () => {
    try {
      const response = await axios.get(
        `${elautBaseUrl}/getPelatihanUser?idPelatihan=${idPelatihan}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      setPelatihan(response.data);
      console.log({ response });
    } catch (error) {
      console.error("LEMDIK INFO: ", error);
    }
  };

  React.useEffect(() => {
    handleFetchDetailPelatihan();
  }, []);

  const typeRole = Cookies.get('XSRF093')

  return (
    <section className="">
      <div className="flex flex-col w-full">
        <div className="flex flex-row gap-2 items-center">
          <header
            aria-label="page caption"
            className="flex-row w-full flex h-20 items-center gap-2 bg-gray-100 border-t px-4"
          >
            <TbSchool className="text-3xl" />
            <div className="flex flex-col">
              <h1 id="page-caption" className="font-semibold text-lg">
                {pelatihan != null ? pelatihan.NamaPelatihan : ""}
              </h1>
              {pelatihan != null ? (
                <p className="font-medium text-gray-400 text-sm">
                  {" "}
                  {pelatihan != null ? pelatihan!.KodePelatihan : ""} •{" "}
                  {pelatihan != null ? pelatihan!.BidangPelatihan : ""} •
                  Mendukung Program Terobosan{" "}
                  {pelatihan != null ? pelatihan!.DukunganProgramTerobosan : ""}
                </p>
              ) : (
                <p></p>
              )}
            </div>
          </header>
        </div>
      </div>

      <div className="flex w-full gap-0">
        {pelatihan != null && (
          <div className="px-4 w-full">
            <div className="w-full border border-gray-200 rounded-xl">
              <div className="bg-gray-100 p-4 w-full ">
                <h2 className="font-bold font-calsans text-xl">
                  Informasi Pelatihan
                </h2>
              </div>
              <table className="w-full">
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">Judul</td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.NamaPelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">Kode Pelatihan</td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.KodePelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Penyelenggara Pelatihan
                  </td>
                  <td className="p-4 w-2/3">
                    {generateFullNameBalai(pelatihan!.PenyelenggaraPelatihan) ||
                      ""}{" "}
                    ({pelatihan!.PenyelenggaraPelatihan || ""})
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Lokasi Pelatihan
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.LokasiPelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Waktu Pelaksanaan
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan.TanggalMulaiPelatihan !== "" &&
                      pelatihan.TanggalBerakhirPelatihan !== "" ? (
                      <>
                        {generateTanggalPelatihan(
                          pelatihan.TanggalMulaiPelatihan
                        )}{" "}
                        s.d.{" "}
                        {generateTanggalPelatihan(
                          pelatihan.TanggalBerakhirPelatihan
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Metode Pelaksanaan
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.PelaksanaanPelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Dukungan Program Terobosan
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.DukunganProgramTerobosan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">Jenis Pelatihan</td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.JenisPelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Bidang Pelatihan
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.BidangPelatihan || ""}
                  </td>
                </tr>
              </table>
            </div>
          </div>
        )}
        {pelatihan != null && (
          <div className="px-4 w-full">
            <div className=" w-full border border-gray-200 rounded-xl">
              <div className="bg-gray-100 p-4 w-full ">
                <h2 className="font-bold font-calsans text-xl">
                  Informasi Penerbitan Sertifikat
                </h2>
              </div>
              <table className="w-full">
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Jenis Sertifikat
                  </td>
                  <td className="p-4 w-2/3">{pelatihan!.JenisSertifikat}</td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Penandatangan Sertifikat
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.TtdSertifikat == ""
                      ? "-"
                      : pelatihan!.TtdSertifikat}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">No Sertifikat</td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.NoSertifikat == ""
                      ? "-"
                      : pelatihan!.NoSertifikat}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Status Penerbitan
                  </td>
                  <td className="p-4 w-2/3 flex items-center">
                    {pelatihan != null ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          {pelatihan != null
                            ? pelatihan!.StatusPenerbitan != "" && (
                              <Badge
                                variant="outline"
                                className={`w-fit flex items-center cursor-pointer justify-center ${pelatihan!.StatusPenerbitan == "On Progress"
                                  ? " bg-yellow-300 text-neutral-800"
                                  : " bg-green-500 text-white"
                                  }`}
                              >
                                {pelatihan!.StatusPenerbitan!}{" "}
                                {usePathname().includes("lemdiklat")
                                  ? "Pengajuan Sertifikat"
                                  : "Penerbitan"}
                              </Badge>
                            )
                            : null}
                        </AlertDialogTrigger>
                        <AlertDialogContent className="flex flex-col items-center justify-center !w-[420px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="w-full flex gap-2 items-center justify-center flex-col">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-200 via-whiter to-white flex items-center justify-center animate-pulse">
                                <div className="w-16 h-16 rounded-full  bg-gradient-to-b from-gray-300 via-whiter to-white flex items-center justify-center animate-pulse">
                                  {pelatihan!.StatusPenerbitan ==
                                    "On Progress" ? (
                                    <RiProgress3Line className="h-12 w-12 text-yellow-400" />
                                  ) : (
                                    <RiVerifiedBadgeFill className="h-12 w-12 text-green-500" />
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-1 w-full justify-center items-center">
                                <h1 className="font-bold text-xl">
                                  {pelatihan!.StatusPenerbitan}
                                </h1>
                                <AlertDialogDescription className="w-full text-center font-normal text-sm -mt-1">
                                  {pelatihan!.StatusPenerbitan == "On Progress"
                                    ? "Pengajuan penerbitan sertifikat telah masuk untuk diproses penandatanganan, harap tindak lanjut pengajuan berikut dalam kurun waktu 1x24 jam!"
                                    : "Pengajuan penerbitan telah berhasil dan sertifikat telah terbit dengan ditandatangani anda sebagai" +
                                    pelatihan!.TtdSertifikat}
                                </AlertDialogDescription>
                              </div>
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="w-full">
                            <div className="flex-col flex w-full">
                              <div className="flex flex-wrap  border-b py-2 border-b-gray-300 w-full">
                                <div className="w-full">
                                  <label
                                    className="block text-sm text-gray-800  font-medium mb-1"
                                    htmlFor="name"
                                  >
                                    No Sertifikat{" "}
                                  </label>
                                  <p className="text-gray-600 text-sm -mt-1">
                                    {pelatihan?.NoSertifikat}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap border-b py-2 border-b-gray-300 w-full">
                                <div className="w-full">
                                  <label
                                    className="block text-sm text-gray-800 font-medium mb-1"
                                    htmlFor="name"
                                  >
                                    Pelatihan{" "}
                                  </label>
                                  <p className="text-gray-600 text-sm -mt-1">
                                    {pelatihan?.NamaPelatihan}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap border-b py-2 border-b-gray-300 w-full">
                                <div className="w-full">
                                  <label
                                    className="block text-sm text-gray-800 font-medium mb-1"
                                    htmlFor="name"
                                  >
                                    Bidang Pelatihan{" "}
                                  </label>
                                  <p className="text-gray-600 text-sm -mt-1">
                                    {pelatihan?.BidangPelatihan}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap border-b py-2 border-b-gray-300 w-full">
                                <div className="w-full">
                                  <label
                                    className="block text-sm text-gray-800 font-medium mb-1"
                                    htmlFor="name"
                                  >
                                    Tanggal Penandatangan{" "}
                                  </label>
                                  <p className="text-gray-600 text-sm -mt-1">
                                    {generateTanggalPelatihan(
                                      pelatihan?.PenerbitanSertifikatDiterima!
                                    )}
                                  </p>
                                </div>
                              </div>

                              <AlertDialogAction className="py-5 mt-4">
                                Close
                              </AlertDialogAction>
                            </div>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <></>
                    )}
                  </td>
                </tr>
              </table>
            </div>
          </div>
        )}
      </div>

      {pelatihan != null && (
        <div className="px-4 w-full mt-5">
          <div className="w-full border border-gray-200 rounded-xl">
            <div className="bg-gray-100 p-4 w-full ">
              <h2 className="font-bold font-calsans text-xl">
                Informasi Pendaftaran
              </h2>
            </div>
            <table className="w-full">
              {
                pelatihan.TanggalMulaiPendaftaran != '' && <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Tanggal Pendaftaran
                  </td>
                  <td className="p-4 w-2/3">
                    {generateTanggalPelatihan(pelatihan.TanggalMulaiPendaftaran)}{" "}
                    s.d.{" "}
                    {generateTanggalPelatihan(
                      pelatihan!.TanggalBerakhirPendaftaran
                    )}
                  </td>
                </tr>
              }

              <tr className="border-b border-b-gray-200 w-full">
                <td className="font-semibold p-4 w-[20%]">Tarif Pelatihan</td>
                <td className="p-4 w-2/3">
                  {formatToRupiah(pelatihan!.HargaPelatihan) || ""}
                </td>
              </tr>
              <tr className="border-b border-b-gray-200 w-full">
                <td className="font-semibold p-4 w-[20%]">Asal Peserta</td>
                <td className="p-4 w-2/3">{pelatihan!.AsalPelatihan}</td>
              </tr>
              <tr className="border-b border-b-gray-200 w-full">
                <td className="font-semibold p-4 w-[20%]">Kuota Peserta</td>
                <td className="p-4 w-2/3">
                  {pelatihan!.KoutaPelatihan} Peserta
                </td>
              </tr>
              <tr className="border-b border-b-gray-200 w-full">
                <td className="font-semibold p-4 w-[20%]">Jumlah Terdaftar</td>
                <td className="p-4 w-2/3">
                  {pelatihan!.UserPelatihan.length} Peserta
                </td>
              </tr>
            </table>
          </div>
        </div>
      )}

      {pelatihan != null && (
        <div className="px-4 w-full mt-5">
          <div className="w-full border border-gray-200 rounded-xl">
            <div className="bg-gray-100 p-4 w-full ">
              <h2 className="font-bold font-calsans text-xl">
                Informasi Teknis Pelatihan
              </h2>
            </div>
            <table className="w-full">
              <tr className="border-b border-b-gray-200 w-full ">
                <td className="font-semibold p-4 w-[20%] h-fit flex">
                  Instruktur
                </td>
                <td className="p-4 w-2/3">
                  {pelatihan.Instruktur != "" ? (
                    <div className="flex flex-col gap-1">
                      {generateInstrukturName(pelatihan.Instruktur).map(
                        (instruktur, index) => (
                          <span key={index}>
                            {index + 1}. {instruktur}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <>-</>
                  )}
                </td>
              </tr>
              <tr className="border-b border-b-gray-200 w-full">
                <td className="font-semibold p-4 w-[20%] flex">
                  Materi Pelatihan
                </td>
                <td className="p-4 w-2/3">
                  {pelatihan!.MateriPelatihan.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {pelatihan!.MateriPelatihan.map((materi, index) => (
                        <span key={index}>
                          {index + 1}. {materi.NamaMateri}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <>-</>
                  )}
                </td>
              </tr>
              <tr className="border-b border-b-gray-200 w-full">
                <td className="font-semibold p-4 w-[20%]">
                  Silabus/Modul/Bahan Ajar Pelatihan
                </td>
                <td className="p-4 w-2/3">
                  <Link
                    target="_blank"
                    className="text-blue-500 underline"
                    href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/silabus/pelatihan/${pelatihan!.SilabusPelatihan
                      }`}
                  >
                    {pelatihan!.SilabusPelatihan}
                  </Link>
                </td>
              </tr>
              {typeRole != 'satdik' ? pelatihan?.UjiKompotensi != "Ujian Pre-test dan Post-test" ? (
                <></>
              ) : (
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Bank Soal Pelatihan
                  </td>
                  <td className="p-4 w-2/3">
                    <Link
                      target="_blank"
                      className="text-blue-500 underline flex gap-2 items-center"
                      href={`/admin/${Cookies.get('XSRF093') == 'satdik' || Cookies.get('XSRF093') == 'balai' ? 'lemdiklat' : 'pusat'}/pelatihan/${pelatihan!.KodePelatihan
                        }/bank-soal/${pelatihan!.IdPelatihan}`}
                    >
                      <FiUploadCloud />
                      Upload Bank Soal
                    </Link>
                  </td>
                </tr>
              ) : <></>}
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default DetailPelatihan;
