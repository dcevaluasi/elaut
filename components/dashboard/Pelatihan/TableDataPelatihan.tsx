import React, { ChangeEvent } from "react";
import {
  RiInformationFill,
  RiProgress3Line,
  RiVerifiedBadgeFill,
} from "react-icons/ri";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
import { TbCalendarCheck, TbDatabase, TbSignature, TbTargetArrow } from "react-icons/tb";

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
import { MateriButton, PublishButton } from "../Dashboard/Actions";
import {
  PROGRAM_AKP,
  PROGRAM_KELAUTAN,
  PROGRAM_PERIKANAN,
} from "@/constants/pelatihan";
import { MdClear } from "react-icons/md";
import UploadSuratButton from "../Dashboard/Actions/UploadSuratButton";
import { GrSend } from "react-icons/gr";
import { FiEdit2, FiSettings } from "react-icons/fi";
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
import { encryptValue } from "@/lib/utils";
import ShowingBadge from "@/components/elaut/dashboard/ShowingBadge";
import { IoRefreshSharp } from "react-icons/io5";
import { HashLoader } from "react-spinners";
import NoSertifikatButton from "../Dashboard/Actions/NoSertifikatButton";
import { AiOutlineFieldNumber } from "react-icons/ai";
import { BiPaperPlane } from "react-icons/bi";
import { countUserWithDrafCertificate } from "@/utils/counter";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import HistoryButton from "../Dashboard/Actions/HistoryButton";
import { ESELON_2, ESELON_3, UPT } from "@/constants/nomenclatures";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

const TableDataPelatihan: React.FC = () => {
  const [data, setData] = React.useState<PelatihanMasyarakat[]>([]);

  const typeRole = Cookies.get("XSRF093");

  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  const [countCertificateDone, setCountCertificateDone] = React.useState<number>(0)


  // COUNTER
  const [countOnProgress, setCountOnProgress] = React.useState<number>(0);
  const [countDone, setCountDone] = React.useState<number>(0);
  const [countNotPublished, setCountNotPublished] = React.useState<number>(0);
  const [countVerifying, setCountVerifying] = React.useState<number>(0);

  const handleFetchingPublicTrainingData = async () => {
    setIsFetching(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihanAdmin?id_lemdik=${Cookies.get(
          "IDLemdik"
        )}`,
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


      // Update state with counts
      setCountOnProgress(onProgressCount);
      setCountDone(doneCount);
      setCountNotPublished(notPublished);
      setCountVerifying(verifyingCount);

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
  const [filterCategoryPenyelenggara, setFilterCategoryPenyelenggara] = React.useState<string>("");
  const [filterCategorySasaran, setFilterCategorySasaran] = React.useState<string>("");

  // SEARCHING
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const filteredData = data.filter((pelatihan) => {
    const program = pelatihan.Program.toLowerCase();
    const namaPelatihan = pelatihan.NamaPelatihan.toLowerCase();
    const bidangPelatihan = pelatihan.BidangPelatihan.toLowerCase();
    const penyelenggaraPelatihan = pelatihan.PenyelenggaraPelatihan.toLowerCase();
    const sasaranPelatihan = pelatihan.AsalPelatihan.toLowerCase();
    const statusPenerbitan = pelatihan.StatusPenerbitan;
    const status = pelatihan.Status;

    // Apply category filter
    const matchesCategory =
      !filterCategory || program === filterCategory.toLowerCase();

    const matchesPenyelenggara =
      !filterCategoryPenyelenggara || penyelenggaraPelatihan === filterCategoryPenyelenggara.toLowerCase();

    const matchesSasaran =
      !filterCategorySasaran || sasaranPelatihan === filterCategorySasaran.toLowerCase();


    // Apply search filter
    const searchQueryLower = searchQuery.toLowerCase();
    const matchesSearchQuery =
      namaPelatihan.includes(searchQueryLower)

    // Apply status filter
    const statusMapping: Record<string, boolean> = {
      "Proses Pengajuan Sertifikat": statusPenerbitan === "On Progress",
      "Belum Dipublish": status !== "Publish",
      "Sudah Di TTD": statusPenerbitan === "Done",
      "Verifikasi Pelaksanaan": statusPenerbitan === "Verifikasi Pelaksanaan",
    };
    const matchesStatus =
      selectedStatusFilter === "All" || statusMapping[selectedStatusFilter] || status === selectedStatusFilter;

    // Return filtered data based on all conditions
    return matchesCategory && matchesSearchQuery && matchesStatus && matchesPenyelenggara && matchesSasaran;
  });

  const isOperatorBalaiPelatihan = Cookies.get('Eselon') !== 'Operator Pusat'

  // Handling Send to SPV from Operator Pusat
  const handleSendToSPVAboutCertificateIssueance = async (idPelatihan: string, pelatihan: PelatihanMasyarakat) => {
    const updateData = new FormData()
    updateData.append('PenerbitanSertifikatDiterima', 'Pengajuan Telah Dikirim Dari Operator Pusat')
    updateData.append('PemberitahuanDiterima', 'Pengajuan Telah Dikirim ke SPV')

    try {
      const uploadBeritaAcaraResponse = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Toast.fire({
        icon: "success",
        title: "Yeayyy!",
        text: "Berhasil mengirimkan informasi pengajuan kepada SPV Pusat!",
      });
      handleAddHistoryTrainingInExisting(pelatihan!, 'Telah menyelesaikan drafting sttpl/sertifikat peserta dan mengirimkan ke SPV untuk', Cookies.get('Status'), Cookies.get('SATKER_BPPP'))

      handleFetchingPublicTrainingData();
    } catch (error) {
      console.error("ERROR GENERATE SERTIFIKAT: ", error);
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: "Gagal mengirimkan informasi pengajuan kepada SPV Pusat!",
      });
      handleFetchingPublicTrainingData();
    }
  }

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

            {
              isOperatorBalaiPelatihan && <StatusButton
                label="Belum Dipublish"
                count={countNotPublished}
                isSelected={selectedStatusFilter === "Belum Dipublish"}
                onClick={() => setSelectedStatusFilter("Belum Dipublish")}
              />
            }


            <StatusButton
              label="Proses Verifikasi Pelaksanaan"
              count={countVerifying}
              isSelected={selectedStatusFilter === "Verifikasi Pelaksanaan"}
              onClick={() => setSelectedStatusFilter("Verifikasi Pelaksanaan")}
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
            <StatusButton
              label="Sudah Terbit"
              count={countDone}
              isSelected={selectedStatusFilter === "Sudah Di TTD"}
              onClick={() => setSelectedStatusFilter("Sudah Di TTD")}
            />
          </ul>
        </section>
      </nav>
      <section className="px-4 -mt-4 w-full">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className={`grid w-full grid-cols-2`}>
            <TabsTrigger
              value="account"
              onClick={() => handleFetchingPublicTrainingData()}
            >
              Daftar Pelatihan
            </TabsTrigger>
            <TabsTrigger value="password">Buat Pelatihan Baru</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            {
              isFetching ? <div className="py-32 w-full items-center flex justify-center">
                <HashLoader color="#338CF5" size={50} />
              </div> :
                <div className="flex flex-col gap-1">
                  <div className="mb-1 flex items-center w-full gap-2">
                    <Select
                      value={filterCategory}
                      onValueChange={(value: string) => setFilterCategory(value)}
                    >
                      <SelectTrigger className="w-2/4 text-base bg-white border border-neutral-200 rounded-md">
                        <SelectValue placeholder="Program Pelatihan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>AKP</SelectLabel>
                          {PROGRAM_AKP.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Perikanan</SelectLabel>
                          {PROGRAM_PERIKANAN.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Kelautan</SelectLabel>
                          {PROGRAM_KELAUTAN.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filterCategorySasaran}
                      onValueChange={(value: string) =>
                        setFilterCategorySasaran(value)
                      }
                    >
                      <SelectTrigger className="w-2/4 text-base py-4">
                        <SelectValue placeholder="Pilih Sasaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masyarakat Umum">
                          Masyarakat Umum
                        </SelectItem>
                        <SelectItem value="Peserta Didik Sekolah Usaha Perikanan Menengah">
                          Peserta Didik Sekolah Usaha Perikanan Menengah
                        </SelectItem>
                        <SelectItem value="Peserta Didik Politeknik Kelautan dan Perikanan">
                          Peserta Didik Politeknik Kelautan dan Perikanan
                        </SelectItem>
                        <SelectItem value="Karyawan/Pegawai/Mining Agent">
                          Karyawan/Pegawai/Mining Agent
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filterCategoryPenyelenggara}
                      onValueChange={(value: string) =>
                        setFilterCategoryPenyelenggara(value)
                      }
                    >
                      <SelectTrigger className="w-2/4 text-base py-4">
                        <SelectValue placeholder="Pilih Satker/Penyelenggara" />
                      </SelectTrigger>
                      <SelectContent>
                        {
                          UPT.map((item: string, index: number) => (
                            <SelectItem key={index} value={item}>
                              {item}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      placeholder="Cari berdasarkan Nama Pelatihan"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-base"
                    />
                    {(filterCategory != "" || filterCategoryPenyelenggara != "") && (
                      <Button
                        onClick={(e) => { setFilterCategory(""); setFilterCategoryPenyelenggara(""); setFilterCategorySasaran("") }}
                        className="border border-neutral-200 text-base  shadow-sm  inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-3 bg-neutral-800 hover:bg-neutral-800 hover:text-white text-white rounded-md"
                      >
                        <MdClear className="h-5 w-5 mr-1" />
                        Bersihkan Filter
                      </Button>
                    )}
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
                          Buka kelas pelatihan segera untuk dapat melihat berbagai
                          macam pelatihan berdasarkan programnya!
                        </div>
                      </div>
                    </div>
                  ) : (
                    filteredData.map((pelatihan, index) => (
                      <Card key={index} className="relative">
                        {pelatihan != null && pelatihan!.KeteranganTandaTangan == '' ? (
                          <ShowingBadge data={pelatihan} isFlying={true} />
                        ) : (
                          <></>
                        )}

                        <CardHeader>
                          <CardTitle>{pelatihan!.NamaPelatihan}{!isOperatorBalaiPelatihan && ` (${pelatihan!.PenyelenggaraPelatihan})`}</CardTitle>
                          <CardDescription>
                            {" "}
                            {pelatihan!.Program} •{" "}
                            {pelatihan!.PenyelenggaraPelatihan}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="ml-0 text-left capitalize -mt-6 w-full ">
                            <div className="ml-0 text-left mt-1 text-neutral-500 ">
                              <p className="text-sm ">
                                {
                                  pelatihan!.PemberitahuanDiterima == 'No sertifikat telah diinput' && <span className="flex items-center gap-1 leading-[105%]">
                                    <AiOutlineFieldNumber className="text-lg" />
                                    <span>
                                      No Sertifikat : {pelatihan!.NoSertifikat}
                                    </span>
                                  </span>
                                }


                                {
                                  pelatihan!.TtdSertifikat != '' && <span className="flex items-center gap-1 leading-[105%]">
                                    <TbSignature className="text-lg" />
                                    <span>
                                      Penandatangan Sertifikat : {pelatihan!.TtdSertifikat}
                                    </span>
                                  </span>
                                }

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

                                  {pelatihan!.TanggalMulaiPelatihan != "" ? (
                                    <span className="flex items-center gap-1 leading-[105%]">
                                      <TbCalendarCheck className="text-lg" />
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
                                    </span>

                                  ) : (
                                    <></>
                                  )}
                                </span>

                                <span className="flex items-center gap-1 leading-[105%]">
                                  <HiUserGroup className="text-base" />
                                  <span>
                                    Jumlah peserta pelatihan :{" "}
                                    {pelatihan!.UserPelatihan.length} Peserta
                                  </span>
                                </span>
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="w-full flex-col flex center justify-between gap-2">
                            <div className="flex items-center w-fit  gap-1   -mt-2">
                              {/* FOR ADMIN BALAI WHO TTD IS NOT KABALAI */}
                              {
                                isOperatorBalaiPelatihan && pelatihan!.SuratPemberitahuan != 'https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/suratPemberitahuan/' && pelatihan!.TtdSertifikat !== ESELON_3.fullName && <Link
                                  title="Detail Pelatihan"
                                  href={`/admin/lemdiklat/pelatihan/detail-pelatihan/${pelatihan.KodePelatihan
                                    }/${encryptValue(pelatihan.IdPelatihan)}`}
                                  className="border border-neutral-900  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-neutral-900 hover:bg-neutral-900 hover:text-white text-white rounded-md"
                                >
                                  <RiInformationFill className="h-5 w-5" /> Detail
                                </Link>
                              }

                              {/* FOR ADMIN BALAI WHO TTD IS KABALAI */}
                              {
                                isOperatorBalaiPelatihan && pelatihan!.TtdSertifikat === ESELON_3.fullName && <Link
                                  title="Detail Pelatihan"
                                  href={`/admin/lemdiklat/pelatihan/detail-pelatihan/${pelatihan.KodePelatihan
                                    }/${encryptValue(pelatihan.IdPelatihan)}`}
                                  className="border border-neutral-900  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-neutral-900 hover:bg-neutral-900 hover:text-white text-white rounded-md"
                                >
                                  <RiInformationFill className="h-5 w-5" /> Detail
                                </Link>
                              }

                              {/* FOR ADMIN PUSAT */}
                              {
                                !isOperatorBalaiPelatihan && <Link
                                  title="Detail Pelatihan"
                                  href={`/admin/lemdiklat/pelatihan/detail-pelatihan/${pelatihan.KodePelatihan
                                    }/${encryptValue(pelatihan.IdPelatihan)}`}
                                  className="border border-neutral-900  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-neutral-900 hover:bg-neutral-900 hover:text-white text-white rounded-md"
                                >
                                  <RiInformationFill className="h-5 w-5" /> Detail
                                </Link>
                              }

                              {
                                isOperatorBalaiPelatihan && pelatihan!.TtdSertifikat != 'Kepala Balai Pelatihan dan Penyuluhan Perikanan' && <UploadSuratButton
                                  idPelatihan={pelatihan!.IdPelatihan.toString()}
                                  pelatihan={pelatihan!}
                                  handleFetchingData={
                                    handleFetchingPublicTrainingData
                                  }
                                  suratPemberitahuan={pelatihan?.SuratPemberitahuan}
                                />
                              }

                              {
                                (!isOperatorBalaiPelatihan && pelatihan!.PemberitahuanDiterima == 'Kirim ke SPV') && <Button
                                  onClick={() => { countUserWithDrafCertificate(pelatihan!.UserPelatihan) == pelatihan.UserPelatihan.length ? handleSendToSPVAboutCertificateIssueance(pelatihan!.IdPelatihan.toString(), pelatihan) : alert('Oopsss, penyiapan draft sttpl/sertifikat peserta pelatihan belum selesai!') }}
                                  variant="outline"
                                  className="bg-indigo-600 text-neutral-100 hover:text-neutral-100 hover:bg-indigo-600"
                                >
                                  <BiPaperPlane className="h-4 w-4 text-neutral-100" />{" "}
                                  Kirim ke SPV
                                </Button>
                              }

                              {
                                isOperatorBalaiPelatihan && <Popover>

                                  <PopoverContent className="w-80 flex flex-col gap-1">


                                    {
                                      isOperatorBalaiPelatihan ? pelatihan?.StatusPenerbitan !=
                                        "Sudah Diverifikasi Pelaksanaan" ? (
                                        <></>
                                      ) : (
                                        <>
                                          <Link
                                            title="Peserta Pelatihan"
                                            href={`/admin/${usePathname().includes("lemdiklat")
                                              ? "lemdiklat"
                                              : "pusat"
                                              }/pelatihan/${pelatihan.KodePelatihan
                                              }/peserta-pelatihan/${encryptValue(
                                                pelatihan.IdPelatihan
                                              )}`}
                                            target="_blank"
                                            className="  shadow-sm bg-green-500 hover:bg-green-500 text-neutral-100  hover:text-neutral-100 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2"
                                          >
                                            <HiUserGroup className="h-5 w-5 " /> Peserta
                                            Pelatihan
                                          </Link>
                                          {(pelatihan!.TanggalMulaiPelatihan == "" && pelatihan!.StatusApproval != 'Selesai') && (
                                            <Button
                                              onClick={() => {
                                                setOpenFormEditPelatihan(true);
                                                setSelectedPelatihan(pelatihan);
                                              }}
                                              title="Edit Pelatihan"
                                              variant="outline"
                                              className="ml-auto w-full hover:bg-yellow-300 bg-yellow-300 hover:text-neutral-700 text-neutral-700 duration-700"
                                            >
                                              <FiEdit2 className="h-5 w-5" /> Edit Pelatihan
                                            </Button>
                                          )}

                                          {pelatihan!.Status != "Publish" && (
                                            <>
                                              <DeleteButton
                                                idPelatihan={pelatihan!.IdPelatihan.toString()}
                                                pelatihan={pelatihan}
                                                handleFetchingData={
                                                  handleFetchingPublicTrainingData
                                                }
                                              />
                                            </>
                                          )}
                                          {pelatihan!.Status == "Publish" ? (
                                            pelatihan!.UserPelatihan.length == 0 ? (
                                              <PublishButton
                                                title="Take Down"
                                                statusPelatihan={pelatihan?.Status ?? ""}
                                                idPelatihan={pelatihan!.IdPelatihan.toString()}
                                                handleFetchingData={
                                                  handleFetchingPublicTrainingData
                                                }
                                              />
                                            ) : (
                                              <></>
                                            )
                                          ) : (
                                            <PublishButton
                                              title="Publish"
                                              statusPelatihan={pelatihan?.Status ?? ""}
                                              idPelatihan={pelatihan!.IdPelatihan.toString()}
                                              handleFetchingData={
                                                handleFetchingPublicTrainingData
                                              }
                                            />
                                          )}

                                          <GenerateNoSertifikatButton
                                            idPelatihan={pelatihan!.IdPelatihan.toString()}
                                            pelatihan={pelatihan!}
                                            handleFetchingData={
                                              handleFetchingPublicTrainingData
                                            }
                                          />

                                          <CloseButton
                                            pelatihan={pelatihan!}
                                            statusPelatihan={pelatihan?.Status ?? ""}
                                            idPelatihan={pelatihan!.IdPelatihan.toString()}
                                            handleFetchingData={
                                              handleFetchingPublicTrainingData
                                            }
                                          />
                                        </>
                                      ) : <Link
                                        title="Bank Soal"
                                        href={`/admin/lemdiklat/pelatihan/${pelatihan!.KodePelatihan
                                          }/bank-soal/${encryptValue(pelatihan!.IdPelatihan)}`}
                                        className="border border-blue-900  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-900 hover:bg-blue-900 hover:text-white text-white rounded-md"
                                      >
                                        <TbDatabase className="h-5 w-5" /> Bank Soal Pre-Test & Post-Test
                                      </Link>
                                    }



                                    {
                                      (pelatihan!.UjiKompotensi == "Ujian Pre-test dan Post-test" && pelatihan!.StatusApproval != 'Selesai' && pelatihan!.StatusPenerbitan == 'Sudah Diverifikasi Pelaksanaan') && <Link
                                        title="Bank Soal"
                                        href={`/admin/lemdiklat/pelatihan/${pelatihan!.KodePelatihan
                                          }/bank-soal/${encryptValue(pelatihan!.IdPelatihan)}`}
                                        className="border border-blue-900  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-900 hover:bg-blue-900 hover:text-white text-white rounded-md"
                                      >
                                        <TbDatabase className="h-5 w-5" /> Bank Soal
                                      </Link>
                                    }




                                  </PopoverContent>
                                </Popover>
                              }
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
            }

          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardContent>
                <FormPelatihan edit={false} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div >
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

export default TableDataPelatihan;
