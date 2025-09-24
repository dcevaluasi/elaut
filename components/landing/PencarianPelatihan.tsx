"use client";

import Image from "next/image";
import React from "react";
import {
  BALAI_PELATIHAN,
  JENIS_PELAKSANAAN,
} from "@/constants/pelatihan";
import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { createSlug } from "@/utils";
import axios, { AxiosResponse } from "axios";
import Link from "next/link";
import { MdClear } from "react-icons/md";
import { HiViewGrid } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { RiSchoolLine } from "react-icons/ri";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { HashLoader } from "react-spinners";
import {
  encryptValue,
  formatToRupiah,
  getMonthName,
} from "@/lib/utils";
import { FiCalendar, FiSearch } from "react-icons/fi";
import { formatDateRange } from "@/utils/time";
import { HiClock } from "react-icons/hi2";

function PencarianPelatihan() {
  const [data, setData] = React.useState<PelatihanMasyarakat[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const jenisProgram =
    usePathname() == "/layanan/pelatihan/program/akp"
      ? "Awak Kapal Perikanan"
      : usePathname() == "/layanan/pelatihan/program/perikanan"
        ? "Perikanan"
        : "Kelautan";

  const handleFetchingPublicTrainingData = async () => {
    setLoading(true);
    let bulanMulaiPelatihan = "";
    if (selectedBulanPelatihan != "") {
      bulanMulaiPelatihan = `${new Date().getFullYear()}-${selectedBulanPelatihan}`;
    }
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihan?${jenisProgram}&penyelenggara_pelatihan=${selectedBalaiPelatihan}&bidang_pelatihan=${selectedBidangPelatihan}&&tanggal_mulai_pelatihan=${bulanMulaiPelatihan}&program=${selectedProgramPelatihan}`
      );
      setLoading(false);
      setShowResult(true);

      if (response.data.data != null) {
        const filteredAndSortedData = response.data.data
          .filter(
            (item: PelatihanMasyarakat) =>
              item.JenisProgram === jenisProgram && item.Status == "Publish" || item.JenisPelatihan === jenisPembayaran || item.PelaksanaanPelatihan === jenisPelaksanaan
          )
          .sort((a: PelatihanMasyarakat, b: PelatihanMasyarakat) => {
            const dateA = new Date(a.TanggalMulaiPelatihan);
            const dateB = new Date(b.TanggalMulaiPelatihan);

            // First, check the StatusApproval condition
            if (
              a.StatusApproval === "Selesai" &&
              b.StatusApproval !== "Selesai"
            ) {
              return 1; // 'Selesai' should be placed later
            }
            if (
              a.StatusApproval !== "Selesai" &&
              b.StatusApproval === "Selesai"
            ) {
              return -1; // 'Selesai' should be placed later
            }

            // Otherwise, sort by date in ascending order
            return dateA.getTime() - dateB.getTime(); // Ascending order
          });

        setData(filteredAndSortedData);
      } else {
        setData(null);
      }
    } catch (error) {
      setLoading(false);
      setShowResult(false);
      throw error;
    }
  };

  const [jenisPembayaran, setJenisPembayaran] =
    React.useState<string>("");
  const [jenisPelaksanaan, setJenisPelaksanaan] =
    React.useState<string>("");
  const [selectedProgramPelatihan, setSelectedProgramPelatihan] =
    React.useState<string>("");
  const [selectedBidangPelatihan, setSelectedBidangPelatihan] =
    React.useState<string>("");
  const [selectedBalaiPelatihan, setSelectedBalaiPelatihan] =
    React.useState<string>("");
  const [selectedBiayaPelatihan, setSelectedBiayaPelatihan] =
    React.useState<string>("");
  const [selectedBulanPelatihan, setSelectedBulanPelatihan] =
    React.useState<string>("");

  const [showResult, setShowResult] = React.useState<boolean>(false);

  const handleClearFilter = () => {
    setSelectedProgramPelatihan("");
    setSelectedBidangPelatihan("");
    setJenisPembayaran("");
    setSelectedBalaiPelatihan("");
    setSelectedBiayaPelatihan("");
    setSelectedBulanPelatihan("");

    handleFetchingPublicTrainingData();
  };

  React.useEffect(() => {
    setLoading(true);

    // Function to start fetching every 20 seconds
    const intervalId = setInterval(() => {
      handleFetchingPublicTrainingData();
    }, 600000); // 1 minutes in milliseconds

    // Fetch data immediately on component mount
    handleFetchingPublicTrainingData().finally(() => setLoading(false));

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="-mt-20 w-full">
      {loading ? (
        <></>
      ) : (
        <div className=" mx-auto max-w-7xl py-5 flex flex-col gap-4 -mt-20 md:mt-0  px-3 md:px-0">
          <div className="col-span-2 sm:col-span-1 md:col-span-2 bg-white h-auto w-fit mx-auto items-center justify-center flex flex-col relative shadow-custom rounded-3xl overflow-hidden">
            <div className="group relative flex flex-col overflow-hidden justify-center rounded-3xl px-6  flex-grow group">
              <div className="flex flex-col gap-1  ">
                <h3 className="text-lg font-calsans mt-5 -mb-3 ">
                  Filter dan Cari Pelatihan
                </h3>
                <div className="grid grid-cols-2 md:flex w-fit gap-2 py-5 items-center justify-center">
                  {/* Jenis Pembayaran */}
                  <Select
                    value={jenisPembayaran}
                    onValueChange={(value) => setJenisPembayaran(value)}
                  >
                    <SelectTrigger className="w-[180px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                      <div className="inline-flex gap-2 px-3 w-full text-sm items-center rounded-md bg-white p-1.5  cursor-pointer border border-gray-300">
                        <HiViewGrid />
                        {jenisPembayaran == ""
                          ? "Jenis Pelatihan"
                          : jenisPembayaran}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectGroup>
                        <SelectLabel>Pilih Jenis Pelatihan</SelectLabel>
                        <SelectItem value="Gratis">Gratis</SelectItem>
                        <SelectItem value="Berbayar">Berbayar</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {/* Lembaga Pelatihan */}
                  <Select
                    value={selectedBalaiPelatihan}
                    onValueChange={(value) => setSelectedBalaiPelatihan(value)}
                  >
                    <SelectTrigger className="w-[180px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                      <div className="inline-flex gap-2 w-full px-3 text-sm items-center rounded-md bg-white p-1.5  cursor-pointer border border-gray-300">
                        <RiSchoolLine />
                        {selectedBalaiPelatihan == ""
                          ? "Lemdiklat KP"
                          : selectedBalaiPelatihan}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectGroup>
                        <SelectLabel>Balai Pelatihan KP</SelectLabel>
                        {BALAI_PELATIHAN.map((balaiPelatihan, index) => (
                          <SelectItem key={index} value={balaiPelatihan.Name}>
                            {balaiPelatihan.Name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {/* Jenis Pelaksanaan */}
                  <Select
                    value={jenisPembayaran}
                    onValueChange={(value) => setJenisPembayaran(value)}
                  >
                    <SelectTrigger className="w-[180px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                      <div className="inline-flex gap-2 px-3 w-full text-sm items-center rounded-md bg-white p-1.5  cursor-pointer border border-gray-300">
                        <HiClock />
                        {jenisPembayaran == ""
                          ? "Jenis Pelaksanaan"
                          : jenisPembayaran}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectGroup>
                        <SelectLabel>Pilih Jenis Pelaksanaan</SelectLabel>
                        {
                          JENIS_PELAKSANAAN.map((item) => (
                            <SelectItem value={item}>{item}</SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {(jenisPembayaran !== "" ||
                    selectedBalaiPelatihan !== "" ||
                    selectedBiayaPelatihan !== "" ||
                    selectedBidangPelatihan !== "" ||
                    selectedProgramPelatihan !== ""
                  ) && (
                      <div
                        onClick={() => handleClearFilter()}
                        className="inline-flex gap-2 w-full px-3 text-sm items-center rounded-md bg-white p-1.5 cursor-pointer border border-gray-300"
                      >
                        <MdClear />
                        Bersihkan Filter
                      </div>
                    )}

                  <div className="hidden md:flex w-full">
                    <Button
                      onClick={(e) => handleFetchingPublicTrainingData()}
                      className="btn-sm text-sm w-full text-white bg-blue-500 cursor-pointer"
                    >
                      <span className="mr-2">Cari</span>
                      <FiSearch />
                    </Button>
                  </div>
                </div>
                <div className="flex md:hidden w-full md:w-fit mb-5 -mt-2">
                  <Button
                    onClick={(e) => handleFetchingPublicTrainingData()}
                    className="btn-sm text-sm w-full md:w-fit px-3 text-white bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  >
                    <span className="mr-2">Cari</span>
                    <FiSearch />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="w-full flex h-[50vh] items-center justify-center">
              <HashLoader color="#338CF5" size={50} />
            </div>
          ) : (
            showResult && (
              <div className="w-full max-w-7xl mx-auto pb-4">
                {/* Header */}
                {selectedBulanPelatihan != "" && (
                  <div className="bg-white shadow-custom rounded-xl p-3 text-xl  text-center font-calsans">
                    <span className="font-bold">
                      {getMonthName(selectedBulanPelatihan)}{" "}
                      {new Date().getFullYear()}
                    </span>
                  </div>
                )}

                {/* Table */}
                <div className="bg-white shadow-custom text-black text-center hidden md:grid grid-cols-5 gap-2 p-4 rounded-xl font-calsans text-lg mt-4">
                  <div>Pelatihan</div>
                  <div>Penyelenggara</div>
                  <div></div>
                  <div>Waktu Pelaksanaan</div>
                  <div>Biaya</div>
                </div>

                <div className=" gap-4 flex w-full mt-4">
                  {data == null || data.length === 0 ? (
                    <div className="flex flex-col w-full items-center justify-center h-fit">
                      <Image
                        src={"/illustrations/not-found.png"}
                        alt="Not Found"
                        width={0}
                        height={0}
                        className="w-[400px]"
                      />
                      <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
                        <h1 className="text-3xl font-calsans leading-[110%] text-black">
                          Belum Ada Pelatihan
                        </h1>
                        <div className="text-gray-600 text-center  max-w-md">
                          Belum ada pelatihan yang tersedia saat ini, harap
                          terus cek berkala ya websitenya Sobat E-LAUT!
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full grid grid-cols-1 gap-3  justify-center  ">
                      {data.map((pelatihan, index) => (
                        <CardPelatihan key={index} pelatihan={pelatihan} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

const CardPelatihan = ({ pelatihan }: { pelatihan: PelatihanMasyarakat }) => {
  return (
    <div className="bg-white shadow-custom text-black p-4 rounded-xl grid grid-cols-1 md:grid-cols-5 mb-4 items-center">
      <div className="max-w-xs leading-[115%]">
        <h3 className="text-xl font-bold">{pelatihan.NamaPelatihan}</h3>
        <p className="text-sm">{pelatihan.BidangPelatihan}</p>
        <p className="text-sm">
          {pelatihan!.TanggalMulaiPendaftaran != "" && (
            <span className="text-sm leading-[100%] block">
              Waktu Pendaftaran :<br />
              {formatDateRange(pelatihan!.TanggalMulaiPendaftaran, pelatihan!.TanggalBerakhirPendaftaran)}
            </span>
          )}
        </p>
      </div>

      <div className="text-left md:text-center">
        <p className="font-bold leading-none">{pelatihan.PenyelenggaraPelatihan}</p>
        <p className="text-sm leading-[100%]">{pelatihan.LokasiPelatihan}</p>
      </div>

      <div className="hidden md:flex flex-col items-start md:items-center">
        <div className="bg-blue-500 p-2 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="#000"
            className="w-6 h-6 text-white stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 5l7 7-7 7M5 12h14"
              className="text-white"
            />
          </svg>
        </div>
      </div>

      <div className="text-left md:text-center">
        <p className="font-bold">{pelatihan.PelaksanaanPelatihan}</p>
        {pelatihan!.TanggalMulaiPelatihan != "" && (
          <span className="text-sm leading-[100%] block">
            {formatDateRange(pelatihan.TanggalMulaiPelatihan, pelatihan.TanggalBerakhirPelatihan)}
          </span>
        )}
      </div>

      <div className="text-center flex md:items-center md:justify-center flex-col">
        {pelatihan?.StatusApproval != "Selesai" && (
          <p className="text-blue-500 text-left text-xl leading-none font-bold">
            {formatToRupiah(pelatihan.HargaPelatihan)}
          </p>
        )}

        <Link
          onClick={(e) => Cookies.set("JenisProgram", pelatihan?.JenisProgram)}
          href={`/layanan/pelatihan/${createSlug(pelatihan.NamaPelatihan)}/${pelatihan?.KodePelatihan
            }/${encryptValue(pelatihan?.IdPelatihan)}`}
          className={`${pelatihan?.StatusApproval == "Selesai"
            ? "bg-gray-500"
            : "bg-blue-500"
            } text-white px-4 py-2 text-sm rounded-full mb-1 mt-2 w-full md:w-fit block`}
        >
          {pelatihan.StatusApproval == "Selesai"
            ? "Sudah Selesai"
            : "Lihat Detail"}
        </Link>
      </div>
    </div>
  );
};

export default PencarianPelatihan;
