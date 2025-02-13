"use client";

import Image from "next/image";
import React, { FormEvent } from "react";
import Hero from "@/components/hero";
import ListBPPP from "@/components/list-bppp";
import Footer from "@/components/ui/footer";
import {
  BALAI_PELATIHAN,
  BIDANG_PELATIHAN,
  SATUAN_PENDIDIKAN_KEAHLIAN,
} from "@/constants/pelatihan";
import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { convertDate, createSlug, truncateText } from "@/utils";
import axios, { AxiosResponse } from "axios";
import Link from "next/link";
import { Bounce, Slide } from "react-awesome-reveal";
import { MdClear, MdKeyboardArrowRight } from "react-icons/md";
import {
  TbCalendarCheck,
  TbClockHour2,
  TbLayoutGrid,
  TbMapPin,
  TbTargetArrow,
} from "react-icons/tb";

import { HiViewGrid } from "react-icons/hi";

import { Button } from "@/components/ui/button";

import { RiSchoolLine, RiShipLine } from "react-icons/ri";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { HashLoader } from "react-spinners";
import {
  encryptValue,
  formatToRupiah,
  getMonthName,
  replaceUrl,
} from "@/lib/utils";
import { FiCalendar, FiSearch } from "react-icons/fi";
import { generateTanggalPelatihan } from "@/utils/text";
import { GrSend } from "react-icons/gr";

function PencarianPelatihan() {
  const [data, setData] = React.useState<PelatihanMasyarakat[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const jenisProgram =
    usePathname() == "/layanan/program/akp"
      ? "Awak Kapal Perikanan"
      : usePathname() == "/layanan/program/perikanan"
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
        `${elautBaseUrl}/lemdik/getPelatihan?${jenisProgram}&penyelenggara_pelatihan=${selectedBalaiPelatihan}&bidang_pelatihan=${selectedBidangPelatihan}&jenis_pelatihan=${selectedJenisPelatihan}&tanggal_mulai_pelatihan=${bulanMulaiPelatihan}&program=${selectedProgramPelatihan}`
      );
      setLoading(false);
      setShowResult(true);

      if (response.data.data != null) {
        const filteredAndSortedData = response.data.data
          .filter(
            (item: PelatihanMasyarakat) =>
              item.JenisProgram === jenisProgram && item.Status == "Publish"
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

        console.log(response);
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

  const akpSelections = [
    "ANKAPIN Tingkat I",
    "ATKAPIN Tingkat I",
    "ANKAPIN Tingkat II",
    "ATKAPIN Tingkat II",
    "ANKAPIN Tingkat III",
    "ATKAPIN Tingkat III",
    "BSTF I",
    "BSTF II",
    "Rating",
    "SKN",
    "SKPI",
    "SOPI",
    "Fishing Master",
  ];

  const perikananSelection = [
    "CPIB",
    "CBIB",
    "CPPIB",
    "HACCP",
    "SPI",
    "API",
    "Budidaya",
    "Pengolahan dan Pemasaran",
    "Mesin Perikanan",
    "Penangkapan",
    "SD Perikanan",
    "Wisata Bahari",
  ];

  const kelautanSection = [
    "BCL",
    "Pengelolaan Sampah",
    "Mitigasi Bencana",
    "Konservasi",
  ];

  const [selectedJenisPelatihan, setSelectedJenisPelatihan] =
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

  const [showOnlyPelatihan, setShowOnlyPelatihan] =
    React.useState<boolean>(false);

  const [showResult, setShowResult] = React.useState<boolean>(false);

  const handleClearFilter = () => {
    setSelectedProgramPelatihan("");
    setSelectedBidangPelatihan("");
    setSelectedJenisPelatihan("");
    setSelectedBalaiPelatihan("");
    setSelectedBiayaPelatihan("");
    setSelectedBulanPelatihan("");

    handleFetchingPublicTrainingData();
  };

  const [selectedDate, setSelectedDate] = React.useState("15 September 2024");

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
                  <Select
                    value={selectedJenisPelatihan}
                    onValueChange={(value) => setSelectedJenisPelatihan(value)}
                  >
                    <SelectTrigger className="w-[180px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                      <div className="inline-flex gap-2 px-3 w-full text-sm items-center rounded-md bg-white p-1.5  cursor-pointer border border-gray-300">
                        <HiViewGrid />
                        {selectedJenisPelatihan == ""
                          ? "Jenis Pelatihan"
                          : selectedJenisPelatihan}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectGroup>
                        <SelectLabel>Pilih Jenis Pelatihan</SelectLabel>
                        <SelectItem value={"Aspirasi"}>Aspirasi</SelectItem>
                        <SelectItem value={"PNBP/BLU"}>PNBP/BLU</SelectItem>
                        <SelectItem value={"Reguler"}>Reguler</SelectItem>
                        <SelectItem value={"Satuan Pendidikan"}>
                          Satuan Pendidikan
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
                      {selectedJenisPelatihan == "Satuan Pendidikan" ? (
                        <SelectGroup>
                          <SelectLabel>Satuan Pendidikan KP</SelectLabel>
                          {SATUAN_PENDIDIKAN_KEAHLIAN.map(
                            (balaiPelatihan, index) => (
                              <SelectItem
                                key={index}
                                value={balaiPelatihan.FullName}
                              >
                                {balaiPelatihan.FullName}
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                      ) : (
                        <SelectGroup>
                          <SelectLabel>Balai Pelatihan KP</SelectLabel>
                          {BALAI_PELATIHAN.map((balaiPelatihan, index) => (
                            <SelectItem key={index} value={balaiPelatihan.Name}>
                              {balaiPelatihan.Name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedProgramPelatihan}
                    onValueChange={(value) =>
                      setSelectedProgramPelatihan(value)
                    }
                  >
                    <SelectTrigger className="w-[180px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                      <div className="inline-flex gap-2 px-3 w-full text-sm items-center rounded-md bg-white p-1.5  cursor-pointer border border-gray-300">
                        <RiShipLine />
                        {selectedProgramPelatihan == ""
                          ? "Program Pelatihan"
                          : selectedProgramPelatihan}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectGroup>
                        <SelectLabel>Pilih Program Pelatihan</SelectLabel>
                        {usePathname().includes("akp") && (
                          <>
                            {akpSelections.map((akp, index) => (
                              <SelectItem key={index} value={akp}>
                                {akp}
                              </SelectItem>
                            ))}
                          </>
                        )}

                        {usePathname().includes("perikanan") && (
                          <>
                            {perikananSelection.map((akp, index) => (
                              <SelectItem key={index} value={akp}>
                                {akp}
                              </SelectItem>
                            ))}
                          </>
                        )}

                        {usePathname().includes("kelautan") && (
                          <>
                            {kelautanSection.map((akp, index) => (
                              <SelectItem key={index} value={akp}>
                                {akp}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedBulanPelatihan}
                    onValueChange={(value) => setSelectedBulanPelatihan(value)}
                  >
                    <SelectTrigger className="w-[180px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                      <div className="inline-flex gap-2 w-full px-3 text-sm items-center rounded-md bg-white p-1.5  cursor-pointer border border-gray-300">
                        <FiCalendar />
                        {selectedBulanPelatihan == ""
                          ? "Pilih Waktu"
                          : getMonthName(selectedBulanPelatihan)}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectGroup>
                        <SelectLabel>Bulan Pelatihan</SelectLabel>
                        <SelectItem value={"01"}>Januari</SelectItem>
                        <SelectItem value={"02"}>Februari</SelectItem>
                        <SelectItem value={"03"}>Maret</SelectItem>
                        <SelectItem value={"04"}>April</SelectItem>
                        <SelectItem value={"05"}>Mei</SelectItem>
                        <SelectItem value={"06"}>Juni</SelectItem>
                        <SelectItem value={"07"}>Juli</SelectItem>
                        <SelectItem value={"08"}>Agustus</SelectItem>
                        <SelectItem value={"09"}>September</SelectItem>
                        <SelectItem value={"10"}>Oktober</SelectItem>
                        <SelectItem value={"11"}>November</SelectItem>
                        <SelectItem value={"12"}>Desember</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {(selectedJenisPelatihan !== "" ||
                    selectedBalaiPelatihan !== "" ||
                    selectedBiayaPelatihan !== "" ||
                    selectedBidangPelatihan !== "" ||
                    selectedProgramPelatihan !== "" ||
                    selectedBulanPelatihan != "") && (
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
                      className="btn-sm text-sm w-full text-white bg-blue-600 cursor-pointer"
                    >
                      <span className="mr-2">Cari</span>
                      <FiSearch />
                    </Button>
                  </div>
                </div>
                <div className="flex md:hidden w-fit mb-5 -mt-2">
                  <Button
                    onClick={(e) => handleFetchingPublicTrainingData()}
                    className="btn-sm text-sm w-fit px-3 text-white bg-blue-500 hover:bg-blue-600 cursor-pointer"
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
                  <div>Pelaksanaan</div>
                  <div>Harga</div>
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
      {/* Train Info */}
      <div className="max-w-xs leading-[115%]">
        <h3 className="text-xl font-bold">{pelatihan.NamaPelatihan}</h3>
        <p className="text-sm">{pelatihan.BidangPelatihan} (S)</p>
      </div>

      {/* Departure Info */}
      <div className="text-left md:text-center">
        <p className="font-bold">{pelatihan.PenyelenggaraPelatihan}</p>
        <p className="text-sm leading-[100%]">{pelatihan.LokasiPelatihan}</p>
      </div>

      {/* Arrow and Duration */}
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

      {/* Arrival Info */}
      <div className="text-left md:text-center">
        <p className="font-bold">{pelatihan.PelaksanaanPelatihan}</p>
        {pelatihan!.TanggalMulaiPelatihan != "" ? (
          <span className="text-sm leading-[100%] block">
            {generateTanggalPelatihan(pelatihan.TanggalMulaiPelatihan)} -{" "}
            {generateTanggalPelatihan(pelatihan.TanggalBerakhirPelatihan)}
          </span>
        ) : (
          <span className="text-sm leading-[100%] block">
            Waktu Pendaftaran <br />
            {generateTanggalPelatihan(pelatihan.TanggalMulaiPendaftaran)} -{" "}
            {generateTanggalPelatihan(pelatihan!.TanggalBerakhirPendaftaran)}
          </span>
        )}
      </div>

      {/* Price and Button */}
      <div className="text-center flex md:items-center md:justify-center flex-col">
        {pelatihan?.StatusApproval != "Selesai" && (
          <p className="text-blue-500 text-left text-xl font-bold">
            {formatToRupiah(pelatihan.HargaPelatihan)}
          </p>
        )}

        <Link
          onClick={(e) => Cookies.set("JenisProgram", pelatihan?.JenisProgram)}
          href={`/layanan/pelatihan/${createSlug(pelatihan.NamaPelatihan)}/${
            pelatihan?.KodePelatihan
          }/${pelatihan?.IdPelatihan}`}
          className={`${
            pelatihan?.StatusApproval == "Selesai"
              ? "bg-gray-500"
              : "bg-blue-500"
          } text-white px-4 py-2 text-base rounded-md mb-1 mt-2 w-full md:w-fit block`}
        >
          {pelatihan.StatusApproval == "Selesai"
            ? "Sudah Selesai"
            : "Lihat Detail"}
        </Link>
      </div>
    </div>
  );
};

// const CardPelatihan = ({ pelatihan }: { pelatihan: PelatihanMasyarakat }) => {
//   return (
//     <div className="shadow-custom flex flex-col relative w-[380px] h-fit rounded-3xl bg-white p-6">
//       <div className="w-full h-[200px] relative">
//         <Image
//           className="w-full !h-[200px] rounded-2xl object-cover shadow-custom mb-2"
//           alt=""
//           src={replaceUrl(pelatihan?.FotoPelatihan!)}
//           width={0}
//           height={0}
//         />
//         {pelatihan.PenyelenggaraPelatihan.includes("Politeknik") && (
//           <span className="w-fit block text-center font-semibold px-4 py-2 bg-blue-600 rounded-3xl text-white absolute text-xs top-3 z-50 right-3">
//             Khusus Taruna KP
//           </span>
//         )}
//       </div>

//       {/* Header */}
//       <div className="flex justify-between items-center gap-3 mt-3">
//         <h2 className="text-2xl font-calsans text-blue-500 leading-none">
//           {truncateText(pelatihan?.NamaPelatihan, 50, "...")}
//         </h2>
//         {/* <div className="text-sm font-medium w-fit px-4 py-2 bg-[#625BF9] rounded-3xl text-white leading-none">
//           {generateTanggalPelatihan(pelatihan.TanggalMulaiPelatihan)}
//         </div> */}
//       </div>

//       {/* Location */}
//       <div className="flex items-center gap-2 text-blue-500 mb-4">
//         <TbMapPin size={18} />
//         <p className="text-sm font-medium">{pelatihan.LokasiPelatihan}</p>
//       </div>

//       {/* Description */}
//       <p
//         dangerouslySetInnerHTML={{
//           __html:
//             pelatihan && truncateText(pelatihan?.DetailPelatihan, 150, "..."),
//         }}
//         className="text-gray-600 text-sm leading-relaxed mb-4"
//       />

//       {/* Contact Info */}
//       {pelatihan!.PenyelenggaraPelatihan.includes("Politeknik") ? (
//         <></>
//       ) : (
//         <div className="flex justify-between text-sm text-blue-500 mb-4">
//           <div>
//             <p className="font-semibold">
//               Layanan {pelatihan.PenyelenggaraPelatihan}
//             </p>
//             <p>62887972983</p>
//           </div>
//           <div>
//             <p className="font-semibold">
//               PTSP {pelatihan.PenyelenggaraPelatihan}
//             </p>
//             <p>62889812833</p>
//           </div>
//         </div>
//       )}

//       {/* Pricing */}
//       <div className=" mb-4">
//         <p className="text-blue-500 text-3xl font-calsans">
//           {pelatihan.HargaPelatihan === 0
//             ? "Gratis"
//             : `${formatToRupiah(pelatihan.HargaPelatihan)}`}
//         </p>
//         <p className="text-sm font-normal text-blue-500">
//           *{" "}
//           {pelatihan!.PenyelenggaraPelatihan.includes("Politeknik")
//             ? "Diperuntukkan untuk taruna Poltek KP dan SUPM"
//             : "Tidak termasuk akomodasi & konsumsi"}{" "}
//           <br />* Kuota Kelas {pelatihan!.KoutaPelatihan} Peserta
//         </p>
//       </div>

//       {/* Button */}
//       <Link
//         href={`/layanan/pelatihan/${createSlug(pelatihan.NamaPelatihan)}/${
//           pelatihan?.KodePelatihan
//         }/${encryptValue(pelatihan?.IdPelatihan)}`}
//         className="w-full block text-center font-semibold px-6 py-3 bg-blue-600 rounded-3xl text-white"
//       >
//         Lihat Detail
//       </Link>
//     </div>
//   );
// };

export default PencarianPelatihan;
