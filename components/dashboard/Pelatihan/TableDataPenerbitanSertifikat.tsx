import React, { ReactElement, useState } from "react";
import {
  RiInformationFill,
  RiProgress3Line,
  RiVerifiedBadgeFill,
} from "react-icons/ri";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { HiUserGroup } from "react-icons/hi2";
import { TbCalendarCheck, TbTargetArrow } from "react-icons/tb";

import { usePathname, useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import { PelatihanMasyarakat } from "@/types/product";
import Cookies from "js-cookie";
import Link from "next/link";
import { generateTanggalPelatihan } from "@/utils/text";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { MdNumbers } from "react-icons/md";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import {
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { encryptValue } from "@/lib/utils";

const TableDataPenerbitanSertifikat: React.FC = () => {
  const [showFormAjukanPelatihan, setShowFormAjukanPelatihan] =
    React.useState<boolean>(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [data, setData] = React.useState<PelatihanMasyarakat[]>([]);

  // PENERBITAN SERTIFIKAT AWAK KAPAL PERIKANAN
  const [dataPenerbitanAKP, setDataPenerbitanAKP] = React.useState<
    PelatihanMasyarakat[]
  >([]);

  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  // COUNTER
  const [countOnProgress, setCountOnProgress] = React.useState<number>(0);
  const [countDone, setCountDone] = React.useState<number>(0);

  const handleFetchingPublicTrainingData = async () => {
    setIsFetching(true);

    try {
      const { data }: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getPelatihanAdmin`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );

      const eselon = Cookies.get("Eselon");
      const nonKepelautan = "Non-Kepelautan";
      const kepelautan = "Kepelautan";

      const filteredData = data.data.filter(
        (item: any) =>
          item.TtdSertifikat === eselon &&
          item.StatusPenerbitan !== "" &&
          item.JenisSertifikat === nonKepelautan
      );

      const filteredDataAKP = data.data.filter(
        (item: any) =>
          item.TtdSertifikat === eselon &&
          item.StatusPenerbitan !== "" &&
          item.JenisSertifikat === kepelautan
      );

      const statusCounts = filteredData.reduce(
        (counts: any, item: any) => {
          if (item.StatusPenerbitan === "On Progress") counts.onProgress += 1;
          if (item.StatusPenerbitan === "Done") counts.done += 1;
          return counts;
        },
        { onProgress: 0, done: 0 }
      );

      setCountOnProgress(statusCounts.onProgress);
      setCountDone(statusCounts.done);

      setData(filteredData);
      setDataPenerbitanAKP(filteredDataAKP);
    } catch (error) {
      console.error("Error fetching training data:", error);
      throw error;
    } finally {
      setIsFetching(false);
    }
  };

  console.log(Cookies.get("Eselon"));

  const publishedData = data.filter(
    (item: PelatihanMasyarakat) => item.Status === "Publish"
  ).length;

  /* ================================= HANDLING PENERBITAN SERTIFIKAT ====================================== */
  const [beritaAcara, setBeritaAcara] = React.useState<File | null>(null);
  const handleFileChange = (e: any) => {
    setBeritaAcara(e.target.files[0]);
  };
  console.log({ beritaAcara });

  const [isOpenFormMateri, setIsOpenFormMateri] =
    React.useState<boolean>(false);
  const [selectedId, setSelectedId] = React.useState<number>(0);

  const [sertifikatUntukPelatihan, setSertifikatUntukPelatihan] =
    React.useState("");
  const [ttdSertifikat, setTtdSertifikat] = React.useState("");

  const router = useRouter();

  React.useEffect(() => {
    handleFetchingPublicTrainingData();
  }, []);

  // STATUS FILTER
  const [selectedStatusFilter, setSelectedStatusFilter] =
    React.useState<string>("All");

  // SEARCHING
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const filteredData = data.filter((pelatihan) => {
    const matchesSearchQuery =
      pelatihan.NamaPelatihan.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||
      pelatihan.BidangPelatihan.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||
      pelatihan.PenyelenggaraPelatihan.toLowerCase().includes(
        searchQuery.toLowerCase()
      );

    var matchesStatus;

    if (selectedStatusFilter == "Proses Tandatangan") {
      matchesStatus = pelatihan!.StatusPenerbitan === "On Progress";
    } else if (selectedStatusFilter == "Sudah Ditandatangan") {
      matchesStatus = pelatihan!.StatusPenerbitan === "Done";
    } else {
      matchesStatus =
        selectedStatusFilter === "All" ||
        pelatihan!.StatusPenerbitan === selectedStatusFilter;
    }

    return matchesSearchQuery && matchesStatus;
  });

  return (
    <div className="w-full">
      <Tabs defaultValue="account" className="w-full px-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Pelatihan Masyarakat</TabsTrigger>
          <TabsTrigger value="password">
            Pelatihan dan Ujian Awak Kapal Perikanan
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <>
            <nav className="bg-gray-100 flex pb-2">
              <section
                aria-labelledby="ticket-statistics-tabs-label"
                className="pb-2"
              >
                <ul className="flex">
                  <li>
                    <button
                      onClick={() => setSelectedStatusFilter("All")}
                      className={`focus:outline-none p-2 rounded-l-md border border-r-0 flex flex-col items-center w-24 ${
                        selectedStatusFilter === "All"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      <p className="font-semibold text-lg">{data!.length}</p>
                      <p
                        className={`uppercase text-sm ${
                          selectedStatusFilter === "All"
                            ? "text-white font-bold"
                            : "text-gray-600"
                        }`}
                      >
                        All
                      </p>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setSelectedStatusFilter("Proses Tandatangan")
                      }
                      className={`focus:outline-none p-2 border border-r-0 flex flex-col items-center w-fit ${
                        selectedStatusFilter === "Proses Tandatangan"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      <p className="font-semibold text-lg">{countOnProgress}</p>
                      <p
                        className={`uppercase text-sm ${
                          selectedStatusFilter === "Proses Tandatangan"
                            ? "text-white font-bold"
                            : "text-gray-600"
                        }`}
                      >
                        Proses Tandatangan
                      </p>
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() =>
                        setSelectedStatusFilter("Sudah Ditandatangan")
                      }
                      className={`focus:outline-none p-2 rounded-r-md border border-r-1 flex flex-col items-center w-fit ${
                        selectedStatusFilter === "Sudah Ditandatangan"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      <p className="font-semibold text-lg">{countDone}</p>
                      <p
                        className={`uppercase text-sm ${
                          selectedStatusFilter === "Sudah Ditandatangan"
                            ? "text-white font-bold"
                            : "text-gray-600"
                        }`}
                      >
                        Sudah Ditandatangan
                      </p>
                    </button>
                  </li>
                </ul>
              </section>
            </nav>
            <section className=" -mt-4 w-full">
              <Tabs defaultValue="account" className="w-full">
                <TabsContent value="account">
                  <div className="flex flex-col gap-1">
                    <div className="mb-1">
                      <Input
                        type="text"
                        placeholder="Cari berdasarkan Nama, Bidang, dan Penyelenggara Pelatihan"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    {filteredData.length == 0 ? (
                      <div className="pt-12 md:pt-20 flex flex-col items-center">
                        <Image
                          src={"/illustrations/not-found.png"}
                          alt="Not Found"
                          width={0}
                          height={0}
                          className="w-[400px]"
                        />
                        <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
                          <h1 className="text-3xl font-calsans leading-[110%] text-black">
                            Belum Pengajuan Penerbitan
                          </h1>
                          <div className="text-gray-600 text-sm text-center  max-w-md">
                            Pengajuan penerbitan sertifikat pelatihan/bimbingan
                            teknis yang ditandatangani oleh Kepala Pusat
                            Pelatihan KP belum ada!
                          </div>
                        </div>
                      </div>
                    ) : (
                      filteredData.map(
                        (pengajuanPenerbitanSertifikat, index) => (
                          <Card key={index} className="relative">
                            {pengajuanPenerbitanSertifikat != null ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  {pengajuanPenerbitanSertifikat!
                                    .NoSertifikat != "" && (
                                    <Badge
                                      variant="outline"
                                      className={`top-4 right-4 absolute cursor-pointer ${
                                        pengajuanPenerbitanSertifikat!
                                          .StatusPenerbitan == "On Progress"
                                          ? " bg-yellow-300 text-neutral-800 hover:bg-yellow-400"
                                          : " bg-green-500 text-white hover:bg-green-600"
                                      }`}
                                    >
                                      {
                                        pengajuanPenerbitanSertifikat!
                                          .StatusPenerbitan!
                                      }{" "}
                                      {usePathname().includes("lemdiklat")
                                        ? "Pengajuan Sertifikat"
                                        : "Penerbitan"}
                                    </Badge>
                                  )}
                                </AlertDialogTrigger>
                                <AlertDialogContent className="flex flex-col items-center justify-center !w-[420px]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="w-full flex gap-2 items-center justify-center flex-col">
                                      <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-200 via-whiter to-white flex items-center justify-center animate-pulse">
                                        <div className="w-16 h-16 rounded-full  bg-gradient-to-b from-gray-300 via-whiter to-white flex items-center justify-center animate-pulse">
                                          {pengajuanPenerbitanSertifikat!
                                            .StatusPenerbitan ==
                                          "On Progress" ? (
                                            <RiProgress3Line className="h-12 w-12 text-yellow-400" />
                                          ) : (
                                            <RiVerifiedBadgeFill className="h-12 w-12 text-green-500" />
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-1 w-full justify-center items-center">
                                        <h1 className="font-bold text-xl">
                                          {
                                            pengajuanPenerbitanSertifikat!
                                              .StatusPenerbitan
                                          }
                                        </h1>
                                        <AlertDialogDescription className="w-full text-center font-normal text-sm -mt-1">
                                          {pengajuanPenerbitanSertifikat!
                                            .StatusPenerbitan == "On Progress"
                                            ? "Pengajuan penerbitan sertifikat telah masuk untuk diproses penandatanganan, harap tindak lanjut pengajuan berikut dalam kurun waktu 1x24 jam!"
                                            : "Pengajuan penerbitan telah berhasil dan sertifikat telah terbit dengan ditandatangani anda sebagai" +
                                              pengajuanPenerbitanSertifikat!
                                                .TtdSertifikat}
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
                                            {
                                              pengajuanPenerbitanSertifikat?.NoSertifikat
                                            }
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
                                            {
                                              pengajuanPenerbitanSertifikat?.NamaPelatihan
                                            }
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
                                            {
                                              pengajuanPenerbitanSertifikat?.BidangPelatihan
                                            }
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
                                            {pengajuanPenerbitanSertifikat?.PenerbitanSertifikatDiterima !=
                                            ""
                                              ? generateTanggalPelatihan(
                                                  pengajuanPenerbitanSertifikat?.PenerbitanSertifikatDiterima
                                                )
                                              : "-"}
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

                            <CardHeader>
                              <CardTitle>
                                {pengajuanPenerbitanSertifikat!.NamaPelatihan}
                              </CardTitle>
                              <CardDescription>
                                {" "}
                                {pengajuanPenerbitanSertifikat!.Program} •{" "}
                                {
                                  pengajuanPenerbitanSertifikat!
                                    .PenyelenggaraPelatihan
                                }
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="ml-0 text-left capitalize -mt-6">
                                <div className="ml-0 text-left mt-1 text-neutral-500 ">
                                  <p className="text-sm ">
                                    <span className="flex items-center gap-1 leading-[105%]">
                                      <MdNumbers className="text-lg" />
                                      <span>
                                        No Sertifikat :{" "}
                                        {
                                          pengajuanPenerbitanSertifikat!
                                            .NoSertifikat
                                        }
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-1 leading-[105%]">
                                      <TbTargetArrow className="text-lg" />
                                      <span>
                                        Lokasi Pelatihan :{" "}
                                        {
                                          pengajuanPenerbitanSertifikat!
                                            .LokasiPelatihan
                                        }
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-1 leading-[105%]">
                                      <TbCalendarCheck className="text-lg" />
                                      <span>
                                        Waktu Pelaksanaan :{" "}
                                        {generateTanggalPelatihan(
                                          pengajuanPenerbitanSertifikat!
                                            .TanggalMulaiPelatihan
                                        )}{" "}
                                        s.d{" "}
                                        {generateTanggalPelatihan(
                                          pengajuanPenerbitanSertifikat!
                                            .TanggalBerakhirPelatihan
                                        )}
                                      </span>
                                    </span>

                                    <span className="flex items-center gap-1 leading-[105%]">
                                      <HiUserGroup className="text-base" />
                                      <span>
                                        Jumlah peserta pelatihan :{" "}
                                        {
                                          pengajuanPenerbitanSertifikat!
                                            .UserPelatihan.length
                                        }
                                        /
                                        {
                                          pengajuanPenerbitanSertifikat!
                                            .KoutaPelatihan
                                        }
                                      </span>
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <div className="flex items-center justify-center gap-1 flex-wrap  -mt-2">
                                <Link
                                  title={
                                    pengajuanPenerbitanSertifikat!
                                      .StatusPenerbitan != "Done"
                                      ? "Review"
                                      : "Lihat Detail"
                                  }
                                  href={`/admin/pusat/pelatihan/penerbitan-sertifikat/detail-pelatihan/${pengajuanPenerbitanSertifikat.KodePelatihan}/${pengajuanPenerbitanSertifikat.IdPelatihan}`}
                                  className="border border-neutral-200  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-gray-400 hover:bg-gray-400 hover:text-white text-white rounded-md"
                                >
                                  <RiInformationFill className="h-5 w-5" />
                                </Link>

                                <Link
                                  href={`/admin/pusat/pelatihan/${
                                    pengajuanPenerbitanSertifikat.KodePelatihan
                                  }/peserta-pelatihan/${encryptValue(
                                    pengajuanPenerbitanSertifikat.IdPelatihan
                                  )}`}
                                  title="Data Peserta Pelatihan"
                                  className="border border-neutral-200  shadow-sm bg-teal-600 hover:bg-teal-600 text-neutral-100  hover:text-neutral-200 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2"
                                >
                                  <HiUserGroup className="h-5 w-5" />
                                </Link>
                              </div>
                            </CardFooter>
                          </Card>
                        )
                      )
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </>
        </TabsContent>
        <TabsContent value="password">
          <>
            <nav className="bg-gray-100 flex pb-2">
              <section
                aria-labelledby="ticket-statistics-tabs-label"
                className="pb-2"
              >
                <ul className="flex">
                  <li>
                    <button
                      onClick={() => setSelectedStatusFilter("All")}
                      className={`focus:outline-none p-2 rounded-l-md border border-r-0 flex flex-col items-center w-24 ${
                        selectedStatusFilter === "All"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      <p className="font-semibold text-lg">{data!.length}</p>
                      <p
                        className={`uppercase text-sm ${
                          selectedStatusFilter === "All"
                            ? "text-white font-bold"
                            : "text-gray-600"
                        }`}
                      >
                        All
                      </p>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setSelectedStatusFilter("Proses Tandatangan")
                      }
                      className={`focus:outline-none p-2 border border-r-0 flex flex-col items-center w-fit ${
                        selectedStatusFilter === "Proses Tandatangan"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      <p className="font-semibold text-lg">{countOnProgress}</p>
                      <p
                        className={`uppercase text-sm ${
                          selectedStatusFilter === "Proses Tandatangan"
                            ? "text-white font-bold"
                            : "text-gray-600"
                        }`}
                      >
                        Proses Tandatangan
                      </p>
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() =>
                        setSelectedStatusFilter("Sudah Ditandatangan")
                      }
                      className={`focus:outline-none p-2 rounded-r-md border border-r-1 flex flex-col items-center w-fit ${
                        selectedStatusFilter === "Sudah Ditandatangan"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      <p className="font-semibold text-lg">{countDone}</p>
                      <p
                        className={`uppercase text-sm ${
                          selectedStatusFilter === "Sudah Ditandatangan"
                            ? "text-white font-bold"
                            : "text-gray-600"
                        }`}
                      >
                        Sudah Ditandatangan
                      </p>
                    </button>
                  </li>
                </ul>
              </section>
            </nav>
            <section className=" -mt-4 w-full">
              <Tabs defaultValue="account" className="w-full">
                <TabsContent value="account">
                  <div className="flex flex-col gap-1">
                    <div className="mb-1">
                      <Input
                        type="text"
                        placeholder="Cari berdasarkan Nama, Bidang, dan Penyelenggara Pelatihan"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    {dataPenerbitanAKP.length == 0 ? (
                      <div className="pt-12 md:pt-20 flex flex-col items-center">
                        <Image
                          src={"/illustrations/not-found.png"}
                          alt="Not Found"
                          width={0}
                          height={0}
                          className="w-[400px]"
                        />
                        <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
                          <h1 className="text-3xl font-calsans leading-[110%] text-black">
                            Belum Pengajuan Penerbitan
                          </h1>
                          <div className="text-gray-600 text-sm text-center  max-w-md">
                            Pengajuan penerbitan sertifikat pelatihan/bimbingan
                            teknis yang ditandatangani oleh Kepala Pusat
                            Pelatihan KP belum ada!
                          </div>
                        </div>
                      </div>
                    ) : (
                      dataPenerbitanAKP.map(
                        (pengajuanPenerbitanSertifikat, index) => (
                          <Card key={index} className="relative">
                            {pengajuanPenerbitanSertifikat != null ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  {pengajuanPenerbitanSertifikat!
                                    .NoSertifikat != "" && (
                                    <Badge
                                      variant="outline"
                                      className={`top-4 right-4 absolute cursor-pointer ${
                                        pengajuanPenerbitanSertifikat!
                                          .StatusPenerbitan == "On Progress"
                                          ? " bg-yellow-300 text-neutral-800 hover:bg-yellow-400"
                                          : " bg-green-500 text-white hover:bg-green-600"
                                      }`}
                                    >
                                      {
                                        pengajuanPenerbitanSertifikat!
                                          .StatusPenerbitan!
                                      }{" "}
                                      {usePathname().includes("lemdiklat")
                                        ? "Pengajuan Sertifikat"
                                        : "Penerbitan"}
                                    </Badge>
                                  )}
                                </AlertDialogTrigger>
                                <AlertDialogContent className="flex flex-col items-center justify-center !w-[420px]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="w-full flex gap-2 items-center justify-center flex-col">
                                      <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-200 via-whiter to-white flex items-center justify-center animate-pulse">
                                        <div className="w-16 h-16 rounded-full  bg-gradient-to-b from-gray-300 via-whiter to-white flex items-center justify-center animate-pulse">
                                          {pengajuanPenerbitanSertifikat!
                                            .StatusPenerbitan ==
                                          "On Progress" ? (
                                            <RiProgress3Line className="h-12 w-12 text-yellow-400" />
                                          ) : (
                                            <RiVerifiedBadgeFill className="h-12 w-12 text-green-500" />
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-1 w-full justify-center items-center">
                                        <h1 className="font-bold text-xl">
                                          {
                                            pengajuanPenerbitanSertifikat!
                                              .StatusPenerbitan
                                          }
                                        </h1>
                                        <AlertDialogDescription className="w-full text-center font-normal text-sm -mt-1">
                                          {pengajuanPenerbitanSertifikat!
                                            .StatusPenerbitan == "On Progress"
                                            ? "Pengajuan penerbitan sertifikat telah masuk untuk diproses penandatanganan, harap tindak lanjut pengajuan berikut dalam kurun waktu 1x24 jam!"
                                            : "Pengajuan penerbitan telah berhasil dan sertifikat telah terbit dengan ditandatangani anda sebagai" +
                                              pengajuanPenerbitanSertifikat!
                                                .TtdSertifikat}
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
                                            {
                                              pengajuanPenerbitanSertifikat?.NoSertifikat
                                            }
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
                                            {
                                              pengajuanPenerbitanSertifikat?.NamaPelatihan
                                            }
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
                                            {
                                              pengajuanPenerbitanSertifikat?.BidangPelatihan
                                            }
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
                                            {pengajuanPenerbitanSertifikat?.PenerbitanSertifikatDiterima !=
                                            ""
                                              ? generateTanggalPelatihan(
                                                  pengajuanPenerbitanSertifikat?.PenerbitanSertifikatDiterima
                                                )
                                              : "-"}
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

                            <CardHeader>
                              <CardTitle>
                                {pengajuanPenerbitanSertifikat!.NamaPelatihan}
                              </CardTitle>
                              <CardDescription>
                                {" "}
                                {pengajuanPenerbitanSertifikat!.Program} •{" "}
                                {
                                  pengajuanPenerbitanSertifikat!
                                    .PenyelenggaraPelatihan
                                }
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="ml-0 text-left capitalize -mt-6">
                                <div className="ml-0 text-left mt-1 text-neutral-500 ">
                                  <p className="text-sm ">
                                    <span className="flex items-center gap-1 leading-[105%]">
                                      <MdNumbers className="text-lg" />
                                      <span>
                                        No Sertifikat :{" "}
                                        {
                                          pengajuanPenerbitanSertifikat!
                                            .NoSertifikat
                                        }
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-1 leading-[105%]">
                                      <TbTargetArrow className="text-lg" />
                                      <span>
                                        Lokasi Pelatihan :{" "}
                                        {
                                          pengajuanPenerbitanSertifikat!
                                            .LokasiPelatihan
                                        }
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-1 leading-[105%]">
                                      <TbCalendarCheck className="text-lg" />
                                      <span>
                                        Waktu Pelaksanaan :{" "}
                                        {generateTanggalPelatihan(
                                          pengajuanPenerbitanSertifikat!
                                            .TanggalMulaiPelatihan
                                        )}{" "}
                                        s.d{" "}
                                        {generateTanggalPelatihan(
                                          pengajuanPenerbitanSertifikat!
                                            .TanggalBerakhirPelatihan
                                        )}
                                      </span>
                                    </span>

                                    <span className="flex items-center gap-1 leading-[105%]">
                                      <HiUserGroup className="text-base" />
                                      <span>
                                        Jumlah peserta pelatihan :{" "}
                                        {
                                          pengajuanPenerbitanSertifikat!
                                            .UserPelatihan.length
                                        }
                                        /
                                        {
                                          pengajuanPenerbitanSertifikat!
                                            .KoutaPelatihan
                                        }
                                      </span>
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <div className="flex items-center justify-center gap-1 flex-wrap  -mt-2">
                                <Link
                                  title={
                                    pengajuanPenerbitanSertifikat!
                                      .StatusPenerbitan != "Done"
                                      ? "Review"
                                      : "Lihat Detail"
                                  }
                                  href={`/admin/pusat/pelatihan/penerbitan-sertifikat/detail-pelatihan/${pengajuanPenerbitanSertifikat.KodePelatihan}/${pengajuanPenerbitanSertifikat.IdPelatihan}`}
                                  className="border border-neutral-200  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-gray-400 hover:bg-gray-400 hover:text-white text-white rounded-md"
                                >
                                  <RiInformationFill className="h-5 w-5" />
                                </Link>

                                <Link
                                  href={`/admin/pusat/pelatihan/${
                                    pengajuanPenerbitanSertifikat.KodePelatihan
                                  }/peserta-pelatihan/${encryptValue(
                                    pengajuanPenerbitanSertifikat.IdPelatihan
                                  )}`}
                                  title="Data Peserta Pelatihan"
                                  className="border border-neutral-200  shadow-sm bg-teal-600 hover:bg-teal-600 text-neutral-100  hover:text-neutral-200 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2"
                                >
                                  <HiUserGroup className="h-5 w-5" />
                                </Link>
                              </div>
                            </CardFooter>
                          </Card>
                        )
                      )
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TableDataPenerbitanSertifikat;
