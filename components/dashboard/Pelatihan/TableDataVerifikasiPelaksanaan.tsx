import React, { ChangeEvent } from "react";
import {
  RiInformationFill,
  RiProgress3Line,
  RiVerifiedBadgeFill,
} from "react-icons/ri";

import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { HiUserGroup } from "react-icons/hi2";
import { TbCalendarCheck, TbDatabase, TbTargetArrow } from "react-icons/tb";

import FormPelatihan from "../admin/formPelatihan";

import Image from "next/image";
import axios, { AxiosResponse } from "axios";
import { PelatihanMasyarakat } from "@/types/product";

import Cookies from "js-cookie";

import Link from "next/link";
import { elautBaseUrl } from "@/constants/urls";

import { Input } from "@/components/ui/input";
import { generateTanggalPelatihan } from "@/utils/text";
import DeleteButton from "../Dashboard/Actions/DeleteButton";
import { Button } from "@/components/ui/button";
import { FaEdit } from "react-icons/fa";
import { BiEditAlt, BiFilter, BiFilterAlt } from "react-icons/bi";
import { PublishButton } from "../Dashboard/Actions";
import {
  PROGRAM_AKP,
  PROGRAM_KELAUTAN,
  PROGRAM_PERIKANAN,
} from "@/constants/pelatihan";
import { MdClear } from "react-icons/md";
import UploadSuratButton from "../Dashboard/Actions/UploadSuratButton";
import { GrSend } from "react-icons/gr";
import { FiEdit2 } from "react-icons/fi";
import GenerateNoSertifikatButton from "../Dashboard/Actions/GenerateNoSertifikatButton";
import CloseButton from "../Dashboard/Actions/CloseButton";
import { usePathname } from "next/navigation";
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
import Toast from "@/components/toast";
import VerifikasiButton from "../Dashboard/Actions/VerifikasiButton";
import { encryptValue } from "@/lib/utils";
import ShowingBadge from "@/components/elaut/dashboard/ShowingBadge";

const TableDataVerifikasiPelaksanaan: React.FC = () => {
  const [data, setData] = React.useState<PelatihanMasyarakat[]>([]);

  const typeRole = Cookies.get("XSRF093");

  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  // COUNTER
  const [countOnProgress, setCountOnProgress] = React.useState<number>(0);
  const [countDone, setCountDone] = React.useState<number>(0);
  const [countNotPublished, setCountNotPublished] = React.useState<number>(0);
  const [countVerifying, setCountVerifying] = React.useState<number>(0);
  const [countIsSematkan, setCountIsSematkan] = React.useState<number>(0);

  const handleFetchingPublicTrainingData = async () => {
    setIsFetching(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihanAdmin`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );

      // Count statuses
      const onProgressCount = response?.data!.data!.filter(
        (item: any) => item.StatusPenerbitan === "On Progress"
      ).length;
      const doneCount = response?.data!.data!.filter(
        (item: any) => item.StatusPenerbitan === "Done"
      ).length;
      const notPublished = response?.data!.data!.filter(
        (item: any) => item.Status !== "Publish"
      ).length;
      const verifyingCount = response?.data!.data!.filter(
        (item: any) => item.StatusPenerbitan == "Verifikasi Pelaksanaan"
      ).length;
      const sematkanCount = response?.data!.data!.filter(
        (item: any) => item.IsSematkan == "yes"
      ).length;

      // Update state with counts
      setCountOnProgress(onProgressCount);
      setCountDone(doneCount);
      setCountNotPublished(notPublished);
      setCountVerifying(verifyingCount);
      setCountIsSematkan(sematkanCount);

      // Sort data in descending order by its index
      const sortedData = [...response.data.data].reverse();

      console.log("PELATIHAN BY LEMDIK: ", response);
      setData(sortedData);

      setIsFetching(false);
    } catch (error) {
      console.error("Error posting training data:", error);
      setIsFetching(false);
      throw error;
    }
  };

  React.useEffect(() => {
    handleFetchingPublicTrainingData();
  }, []);

  // HANDLING UPDATING DATA PELATIHAN
  const [openFormEditPelatihan, setOpenFormEditPelatihan] =
    React.useState<boolean>(false);

  const [selectedPelatihan, setSelectedPelatihan] =
    React.useState<PelatihanMasyarakat | null>(null);

  const [tanggalMulaiPelatihan, setTanggalMulaiPelatihan] =
    React.useState<string>("");
  const [tanggalBerakhirPelatihan, setTanggalBerakhirPelatihan] =
    React.useState<string>("");

  const handleUpdatingDataPelatihan = async () => {
    const formData = new FormData();
    formData.append("TanggalMulaiPelatihan", tanggalMulaiPelatihan);
    formData.append("TanggalBerakhirPelatihan", tanggalBerakhirPelatihan);

    try {
      const response = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${selectedPelatihan!.IdPelatihan
        }`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log({ response });
      Toast.fire({
        icon: "success",
        title: `Berhasil setting waktu pelaksanaan!`,
      });
      setTanggalMulaiPelatihan("");
      setOpenFormEditPelatihan(false);
      setTanggalBerakhirPelatihan("");
      handleFetchingPublicTrainingData();
    } catch (error) {
      console.error({ error });
      Toast.fire({
        icon: "error",
        title: `Gagal setting waktu pelaksanaan!`,
      });
      setTanggalMulaiPelatihan("");
      setTanggalBerakhirPelatihan("");
      setOpenFormEditPelatihan(false);
      handleFetchingPublicTrainingData();
    }
  };

  // STATUS FILTER
  const [selectedStatusFilter, setSelectedStatusFilter] =
    React.useState<string>("All");
  const [filterCategory, setFilterCategory] = React.useState<string>("");

  // SEARCHING
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const filteredData = data.filter((pelatihan) => {
    // Check if it matches the category filter
    const matchesCategory =
      !filterCategory ||
      pelatihan.Program.toLowerCase() === filterCategory.toLowerCase();

    // Check if it matches the search query
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

    // Check if it matches the status filter
    let matchesStatus = true;
    if (selectedStatusFilter === "Proses Pengajuan Sertifikat") {
      matchesStatus = pelatihan.StatusPenerbitan === "On Progress";
    } else if (selectedStatusFilter === "Belum Dipublish") {
      matchesStatus = pelatihan.Status !== "Publish";
    } else if (selectedStatusFilter === "Sudah Di TTD") {
      matchesStatus = pelatihan.StatusPenerbitan === "Done";
    } else if (selectedStatusFilter === "Verifikasi Pelaksanaan") {
      matchesStatus = pelatihan.StatusPenerbitan === "Verifikasi Pelaksanaan";
    } else if (selectedStatusFilter === "Bank Soal Disematkan") {
      matchesStatus = pelatihan.IsSematkan != "yes";
    } else if (selectedStatusFilter !== "All") {
      matchesStatus = pelatihan.Status === selectedStatusFilter;
    }

    // Apply filters in order: category -> search -> status
    return matchesCategory && matchesSearchQuery && matchesStatus;
  });

  return (
    <div className="shadow-default -mt-10">
      <AlertDialog
        open={openFormEditPelatihan}
        onOpenChange={setOpenFormEditPelatihan}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Data Pelatihan</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPelatihan != null ? (
                <div className="flex gap-2 w-full">
                  <div className="flex flex-wrap -mx-3 mb-1 w-full">
                    <div className="w-full px-3">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="kodePelatihan"
                      >
                        Tanggal Mulai Pelatihan{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="tanggalMulaiPelatihan"
                        type="date"
                        className="form-input w-full text-black border-gray-300 rounded-md"
                        required
                        min={
                          selectedPelatihan.TanggalAkhirPendaftaran ||
                          new Date().toISOString().split("T")[0]
                        }
                        value={tanggalMulaiPelatihan}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setTanggalMulaiPelatihan(e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1 w-full">
                    <div className="w-full px-3">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="namaPelatihan"
                      >
                        Tanggal Berakhir Pelatihan{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="tanggalBerakhirPelatihan"
                        type="date"
                        className="form-input w-full text-black border-gray-300 rounded-md"
                        required
                        min={
                          tanggalMulaiPelatihan ||
                          new Date().toISOString().split("T")[0]
                        }
                        value={tanggalBerakhirPelatihan}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setTanggalBerakhirPelatihan(e.target.value)
                        }
                        disabled={!tanggalMulaiPelatihan}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpenFormEditPelatihan(false);
                setTanggalMulaiPelatihan("");
                setTanggalBerakhirPelatihan("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={(e) => handleUpdatingDataPelatihan()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <nav className="bg-gray-100 flex p-4">
        <section
          aria-labelledby="ticket-statistics-tabs-label "
          className="pb-2"
        >
          <ul className="flex">
            <StatusButton
              label="Total Pelatihan"
              count={data.length}
              isSelected={selectedStatusFilter === "All"}
              onClick={() => setSelectedStatusFilter("All")}
            />

            <StatusButton
              label="Proses Verifikasi Pelaksanaan"
              count={countVerifying}
              isSelected={selectedStatusFilter === "Verifikasi Pelaksanaan"}
              onClick={() => setSelectedStatusFilter("Verifikasi Pelaksanaan")}
            />

            <StatusButton
              label="Bank Soal Perlu Disematkan"
              count={countVerifying}
              isSelected={selectedStatusFilter === "Bank Soal Perlu Disematkan"}
              onClick={() =>
                setSelectedStatusFilter("Bank Soal Perlu Disematkan")
              }
            />

            <StatusButton
              label="Proses Pengajuan Sertifikat"
              count={countOnProgress}
              isSelected={
                selectedStatusFilter === "Proses Pengajuan Sertifikat"
              }
              onClick={() =>
                setSelectedStatusFilter("Proses Pengajuan Sertifikat")
              }
            />
          </ul>
        </section>
      </nav>
      <section className="px-4 -mt-4 w-full">
        <div className="flex flex-col gap-1">
          <div className="mb-1 flex items-center w-full gap-2">
            <select
              className="text-sm p-2 border border-neutral-200 bg-transparent rounded-md bg-white  w-1/4"
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="" selected={filterCategory == ""}>
                Program Pelatihan
              </option>
              <optgroup label="AKP">
                {PROGRAM_AKP.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Perikanan">
                {PROGRAM_PERIKANAN.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Kelautan">
                {PROGRAM_KELAUTAN.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
            </select>
            {filterCategory != "" && (
              <Button
                onClick={(e) => setFilterCategory("")}
                className="border border-neutral-200  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-3 bg-neutral-800 hover:bg-neutral-800 hover:text-white text-white rounded-md"
              >
                <MdClear className="h-5 w-5 mr-1" />
                Bersihkan Filter
              </Button>
            )}

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
                  Belum Ada Pelatihan
                </h1>
                <div className="text-gray-600 text-sm text-center  max-w-md">
                  Buka kelas pelatihan segera untuk dapat melihat berbagai macam
                  pelatihan berdasarkan programnya!
                </div>
              </div>
            </div>
          ) : (
            filteredData.map((pelatihan: PelatihanMasyarakat, index: number) => (
              <Card key={index} className="relative">
                <ShowingBadge data={pelatihan} isFlying={true} />

                <CardHeader>
                  <CardTitle>{pelatihan!.NamaPelatihan}</CardTitle>
                  <CardDescription>
                    {" "}
                    {pelatihan!.Program} • {pelatihan!.PenyelenggaraPelatihan}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="ml-0 text-left capitalize -mt-6 w-full ">
                    <div className="ml-0 text-left mt-1 text-neutral-500 ">
                      <p className="text-sm ">
                        <span className="flex items-center gap-1 leading-[105%]">
                          <TbTargetArrow className="text-lg" />
                          <span>
                            Lokasi Pelatihan : {pelatihan!.LokasiPelatihan}
                          </span>
                        </span>
                        {pelatihan!.TanggalMulaiPendaftaran == "" ||
                          pelatihan!.TanggalBerakhirPendaftaran == "" ? (
                          <></>
                        ) : (
                          <span className="flex items-center gap-1 leading-[105%]">
                            <GrSend className="text-lg" />
                            <span>
                              Waktu Pendaftaran :{" "}
                              {generateTanggalPelatihan(
                                pelatihan!.TanggalMulaiPendaftaran
                              )}{" "}
                              <span className="lowercase">s.d</span>{" "}
                              {generateTanggalPelatihan(
                                pelatihan!.TanggalAkhirPendaftaran!
                              )}
                            </span>
                          </span>
                        )}

                        <span className="flex items-center gap-1 leading-[105%]">
                          <TbCalendarCheck className="text-lg" />
                          {pelatihan!.TanggalMulaiPelatihan != "" ? (
                            <span>
                              Waktu Pelaksanaan :{" "}
                              {generateTanggalPelatihan(
                                pelatihan!.TanggalMulaiPelatihan
                              )}{" "}
                              <span className="lowercase">s.d</span>{" "}
                              {generateTanggalPelatihan(
                                pelatihan!.TanggalBerakhirPelatihan
                              )}
                            </span>
                          ) : (
                            <>-</>
                          )}
                        </span>

                        <span className="flex items-center gap-1 leading-[105%]">
                          <HiUserGroup className="text-base" />
                          <span>
                            Jumlah peserta pelatihan :{" "}
                            {pelatihan!.UserPelatihan.length}/
                            {pelatihan!.KoutaPelatihan}
                          </span>
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex-col flex center justify-between gap-2">
                    <div className="flex items-center w-fit  gap-1   -mt-2">
                      <Link
                        title="Detail Pelatihan"
                        href={`/admin/pusat/pelatihan/detail/${pelatihan.KodePelatihan}/${encryptValue(pelatihan.IdPelatihan)}`}
                        className="border border-neutral-900  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-neutral-900 hover:bg-neutral-900 hover:text-white text-white rounded-md"
                      >
                        <RiInformationFill className="h-5 w-5" /> Detail
                      </Link>

                      <UploadSuratButton
                        idPelatihan={pelatihan!.IdPelatihan.toString()}
                        handleFetchingData={handleFetchingPublicTrainingData}
                        suratPemberitahuan={pelatihan?.SuratPemberitahuan}
                      />

                      {
                        (pelatihan!.UjiKompotensi == "Ujian Pre-test dan Post-test" && pelatihan!.StatusApproval != 'Selesai' && pelatihan!.StatusPenerbitan == 'Sudah Diverifikasi Pelaksanaan' && pelatihan!.PenyelenggaraPelatihan == 'Pusat Pelatihan KP') && <Link
                          title="Bank Soal"
                          href={`/admin/pusat/pelatihan/${pelatihan!.KodePelatihan
                            }/bank-soal/${encryptValue(pelatihan!.IdPelatihan)}`}
                          className="border border-blue-900  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-900 hover:bg-blue-900 hover:text-white text-white rounded-md"
                        >
                          <TbDatabase className="h-5 w-5" /> Bank Soal
                        </Link>}


                      {pelatihan!.StatusPenerbitan ==
                        "Verifikasi Pelaksanaan" && (
                          <VerifikasiButton
                            title="Verifikasi"
                            statusPelatihan={pelatihan?.StatusPenerbitan ?? ""}
                            idPelatihan={pelatihan!.IdPelatihan.toString()}
                            handleFetchingData={handleFetchingPublicTrainingData}
                          />
                        )}

                    </div>
                    <p className="italic text-neutral-400 text-[0.6rem]">
                      Created at {pelatihan!.CreateAt} | Updated at{" "}
                      {pelatihan!.UpdateAt}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const StatusButton = ({
  label,
  count,
  isSelected,
  onClick,
}: {
  label: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`focus:outline-none p-2 border ${isSelected ? "bg-blue-500 text-white" : "bg-white text-black"
      }`}
  >
    <p className="font-semibold text-lg">{count}</p>
    <p
      className={`uppercase text-sm ${isSelected ? "font-bold" : "text-gray-600"
        }`}
    >
      {label}
    </p>
  </button>
);


export default TableDataVerifikasiPelaksanaan;
