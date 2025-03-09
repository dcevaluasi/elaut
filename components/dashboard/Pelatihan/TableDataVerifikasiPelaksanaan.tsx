import React, { useEffect, useState } from "react";
import {
  RiInformationFill,
} from "react-icons/ri";

import { TbEditCircle } from "react-icons/tb";

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

import Image from "next/image";
import axios, { AxiosResponse } from "axios";
import { PelatihanMasyarakat } from "@/types/product";

import Cookies from "js-cookie";

import Link from "next/link";
import { elautBaseUrl } from "@/constants/urls";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MdClear } from "react-icons/md";
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
import VerifikasiButton from "../Dashboard/Actions/VerifikasiButton";
import { encryptValue } from "@/lib/utils";
import { AiOutlineFieldNumber } from "react-icons/ai";
import { IoRefreshSharp } from "react-icons/io5";
import { HashLoader } from "react-spinners";
import { DIALOG_TEXTS } from "@/constants/texts";
import ShowingBadge from "@/components/elaut/dashboard/ShowingBadge";
import Toast from "@/components/toast";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { ESELON_1, ESELON_2 } from "@/constants/nomenclatures";
import { BiPaperPlane } from "react-icons/bi";

const TableDataVerifikasiPelaksanaan: React.FC = () => {
  // APPROVAL PENERBITAN SUPERVISOR
  const [approvalNotes, setApprovalNotes] = React.useState<string>('')

  const [data, setData] = React.useState<PelatihanMasyarakat[]>([]);
  const isLemdiklatLevel = usePathname().includes('lemdiklat')
  const isSupervisor = Cookies.get('Status') === 'Supervisor'
  const isPejabat = Cookies.get('Jabatan')?.includes('Kepala')
  const isEselonI = Cookies.get('Jabatan')?.includes('Badan')

  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  // COUNTER
  const [countVerifying, setCountVerifying] = React.useState<number>(0);
  const [countApproval, setCountApproval] = React.useState<number>(0);
  const [countApproved, setCountApproved] = React.useState<number>(0);
  const [countSigning, setCountSigning] = React.useState<number>(0);
  const [countSigningEselon1, setCountSigningEselon1] = React.useState<number>(0);
  const [countSigningByKaBPPSDMKP, setCountSigningByKaBPPSDMKP] = React.useState<number>(0);

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

      const allData = response?.data?.data || [];
      let filteredData: any[] = allData;

      // Count different statuses
      const countStatuses = (statusKey: keyof typeof filteredData[0], value: any) =>
        filteredData.filter((item) => item[statusKey] === value).length;

      setCountVerifying(countStatuses("PemberitahuanDiterima", "Pengajuan Telah Dikirim ke SPV"));
      setCountApproval(countStatuses("PemberitahuanDiterima", "Pengajuan Telah Dikirim ke SPV"));
      setCountApproved(countStatuses("IsMengajukanPenerbitan", "Pengajuan Telah Diapprove SPV"));

      // KAPUSLAT POV
      setCountSigning(filteredData.filter((item) => item.PemberitahuanDiterima === "Pengajuan Telah Dikirim ke Kapuslat KP" && item.TtdSertifikat === ESELON_2.fullName).length);
      setCountSigningEselon1(filteredData.filter((item) => item.PemberitahuanDiterima === "Pengajuan Telah Dikirim ke Ka BPPSDM KP" && item.TtdSertifikat === ESELON_1.fullName).length);
      setCountSigningByKaBPPSDMKP(filteredData.filter((item) => item.PemberitahuanDiterima === "Pengajuan Telah Dikirim ke Kapuslat KP" && item.TtdSertifikat === ESELON_1.fullName).length)

      // Reverse the order of filtered data
      setData([...filteredData].reverse());

      console.log("PELATIHAN BY LEMDIK:", response);
    } catch (error) {
      console.error("Error fetching training data:", error);
      throw error;
    } finally {
      setIsFetching(false);
    }
  };


  React.useEffect(() => {
    handleFetchingPublicTrainingData();
  }, []);

  // STATUS FILTER
  const [selectedStatusFilter, setSelectedStatusFilter] =
    React.useState<string>("All");
  const [filterCategory, setFilterCategory] = React.useState<string>("");

  // SEARCHING
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const filteredData = data.filter((pelatihan) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const lowerCaseCategory = filterCategory.toLowerCase();

    // Check category filter
    const matchesCategory =
      !filterCategory || pelatihan.Program.toLowerCase() === lowerCaseCategory;

    // Check search query filter
    const matchesSearchQuery = [pelatihan.NamaPelatihan, pelatihan.BidangPelatihan, pelatihan.PenyelenggaraPelatihan]
      .some((field) => field.toLowerCase().includes(lowerCaseQuery));

    // Define a mapping for status filters
    const statusMapping: Record<string, boolean> = {
      "All": pelatihan.KodePelatihan != '',
      "Proses Pengajuan Sertifikat": pelatihan.StatusPenerbitan === "On Progress",
      "Belum Dipublish": pelatihan.Status !== "Publish",
      "Approval": pelatihan.PemberitahuanDiterima == 'Pengajuan Telah Dikirim ke SPV',
      "Approved": pelatihan.IsMengajukanPenerbitan == 'Pengajuan Telah Diapprove SPV',
      "Sudah Di TTD": pelatihan.StatusPenerbitan === "Done",
      "Verifikasi Pelaksanaan": pelatihan.StatusPenerbitan === "Verifikasi Pelaksanaan",
      "Signing": isEselonI ? pelatihan.PemberitahuanDiterima === "Pengajuan Telah Dikirim ke Ka BPPSDM KP" && pelatihan.TtdSertifikat === ESELON_1.fullName : pelatihan.PemberitahuanDiterima === "Pengajuan Telah Dikirim ke Kapuslat KP" && pelatihan.TtdSertifikat === ESELON_2.fullName,
      "Signing by Ka BPPSDM KP": pelatihan.PemberitahuanDiterima === "Pengajuan Telah Dikirim ke Kapuslat KP" && pelatihan.TtdSertifikat === ESELON_1.fullName,
    };

    // Check status filter
    const matchesStatus =
      selectedStatusFilter === "All" ||
      statusMapping[selectedStatusFilter] ||
      pelatihan.Status === selectedStatusFilter;

    return matchesCategory && matchesSearchQuery && matchesStatus;
  });


  return (
    <div className="shadow-default -mt-10">
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
              onClick={() => {
                setIsFetching(true);
                setTimeout(() => {
                  setSelectedStatusFilter("All");
                  setIsFetching(false);
                }, 800);
              }}
            />

            {isSupervisor && !isPejabat && (
              <StatusButton
                label="Perlu DiApprove"
                count={countApproval}
                isSelected={selectedStatusFilter === "Approval"}
                onClick={() => {
                  setIsFetching(true);
                  setTimeout(() => {
                    setSelectedStatusFilter("Approval");
                    setIsFetching(false);
                  }, 800);
                }}
              />
            )}

            {Cookies.get('Jabatan') === ESELON_2.fullName && (
              <StatusButton
                label="Perlu DiApprove"
                count={countSigningByKaBPPSDMKP}
                isSelected={selectedStatusFilter === "Signing by Ka BPPSDM KP"}
                onClick={() => {
                  setIsFetching(true);
                  setTimeout(() => {
                    setSelectedStatusFilter("Signing by Ka BPPSDM KP");
                    setIsFetching(false);
                  }, 800);
                }}
              />
            )}

            {isPejabat && (
              <StatusButton
                label="Perlu Ditandatangani"
                count={isEselonI ? countSigningEselon1 : countSigning}
                isSelected={selectedStatusFilter === "Signing"}
                onClick={() => {
                  setIsFetching(true);
                  setTimeout(() => {
                    setSelectedStatusFilter("Signing");
                    setIsFetching(false);
                  }, 800);
                }}
              />
            )}

            {isSupervisor && (
              <StatusButton
                label="Sudah Diapprove"
                count={countApproved}
                isSelected={selectedStatusFilter === "Approved"}
                onClick={() => {
                  setIsFetching(true);
                  setTimeout(() => {
                    setSelectedStatusFilter("Approved");
                    setIsFetching(false);
                  }, 800);
                }}
              />
            )}
          </ul>
        </section>
      </nav>

      <TrainingList filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleFetchingPublicTrainingData={handleFetchingPublicTrainingData} isFetching={isFetching} filteredData={filteredData} approvalNotes={approvalNotes} setApprovalNotes={setApprovalNotes} isSupervisor={isSupervisor} />

    </div >
  );
};

interface TrainingListProps {
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleFetchingPublicTrainingData: () => void;
  isFetching: boolean;
  filteredData: PelatihanMasyarakat[];
  approvalNotes: string;
  setApprovalNotes: (notes: string) => void;
  isSupervisor: boolean;
}

const TrainingList: React.FC<TrainingListProps> = ({
  filterCategory,
  setFilterCategory,
  searchQuery,
  setSearchQuery,
  handleFetchingPublicTrainingData,
  isFetching,
  filteredData,
  approvalNotes,
  setApprovalNotes,
  isSupervisor,
}) => {
  return (
    <section className="px-4 -mt-4 w-full">
      <div className="flex flex-col gap-1">
        <div className="mb-1 flex items-center w-full gap-2">
          <select
            className="text-sm p-2 border border-neutral-200 bg-white rounded-md w-1/4"
            onChange={(e) => setFilterCategory(e.target.value)}
            value={filterCategory}
          >
            <option value="">Program Pelatihan</option>
          </select>

          <Button variant="outline" className="py-5" onClick={handleFetchingPublicTrainingData}>
            <IoRefreshSharp /> Refresh
          </Button>

          {filterCategory && (
            <Button
              onClick={() => setFilterCategory("")}
              className="border border-neutral-200 shadow-sm text-sm font-medium bg-neutral-800 hover:bg-neutral-800 text-white rounded-md h-10 px-4 py-3 flex items-center"
            >
              <MdClear className="h-5 w-5 mr-1" /> Bersihkan Filter
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

        {isFetching ? (
          <div className="py-32 w-full flex items-center justify-center">
            <HashLoader color="#338CF5" size={50} />
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState />
        ) : (
          filteredData.map((pelatihan, index) => (
            <TrainingCard
              key={index}
              pelatihan={pelatihan}
              isSupervisor={isSupervisor}
              approvalNotes={approvalNotes}
              setApprovalNotes={setApprovalNotes}
              handleFetchingPublicTrainingData={handleFetchingPublicTrainingData}
            />
          ))
        )}
      </div>
    </section>
  );
};

const EmptyState: React.FC = () => (
  <div className="pt-12 md:pt-20 flex flex-col items-center">
    <Image src="/illustrations/not-found.png" alt="Not Found" width={400} height={400} />
    <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
      <h1 className="text-3xl font-calsans text-black">Belum Ada Pelatihan</h1>
      <p className="text-gray-600 text-sm max-w-md">
        Buka kelas pelatihan segera untuk dapat melihat berbagai macam pelatihan berdasarkan programnya!
      </p>
    </div>
  </div>
);

const TrainingCard: React.FC<{
  pelatihan: PelatihanMasyarakat;
  isSupervisor: boolean;
  approvalNotes: string;
  setApprovalNotes: (notes: string) => void;
  handleFetchingPublicTrainingData: () => void;
}> = ({ pelatihan, isSupervisor, approvalNotes, setApprovalNotes, handleFetchingPublicTrainingData }) => {
  const statusPejabat = Cookies.get('Status')

  const handleSendToKapuslatAboutCertificateIssueance = async (idPelatihan: string) => {
    const updateData = new FormData()
    if (statusPejabat === ESELON_1.fullName) {
      updateData.append('PenerbitanSertifikatDiterima', 'Pengajuan Telah Dikirim Dari SPV')
      updateData.append('IsMengajukanPenerbitan', 'Pengajuan Telah Diapprove Ka BPPSDM KP')
      updateData.append('PemberitahuanDiterima', 'Pengajuan Telah Diterima Ka BPPSDM KP')
    } else if (statusPejabat === ESELON_2.fullName) {
      updateData.append('PenerbitanSertifikatDiterima', 'Pengajuan Telah Dikirim Dari SPV')
      updateData.append('IsMengajukanPenerbitan', 'Pengajuan Telah Diapprove Kapuslat KP')
      updateData.append('PemberitahuanDiterima', 'Pengajuan Telah Dikirim ke Ka BPPSDM KP')
    } else {
      updateData.append('PenerbitanSertifikatDiterima', 'Pengajuan Telah Dikirim Dari SPV')
      updateData.append('IsMengajukanPenerbitan', 'Pengajuan Telah Diapprove SPV')
      updateData.append('PemberitahuanDiterima', 'Pengajuan Telah Dikirim ke Kapuslat KP')
    }


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
        text: "Berhasil mengapprove pengajuan penerbitan sttpl/sertifikat pelatihan!",
      });

      if (isSupervisor) {
        if (pelatihan!.TtdSertifikat === ESELON_1.fullName) {
          handleAddHistoryTrainingInExisting(pelatihan!, 'Telah menyetujui permohonan penerbitan dan mengirimkan ke Kepala Pusat Pelatihan KP untuk', 'Supervisor', 'Pusat Pelatihan Kelautan dan Perikanan')
        } else {
          handleGenerateSertifikat()
          handleAddHistoryTrainingInExisting(pelatihan!, 'Telah menyetujui permohonan penerbitan dan mengupload memo permohonan penandatanganan ke Kepala Pusat Pelatihan KP untuk', 'Supervisor', 'Pusat Pelatihan Kelautan dan Perikanan')
        }
      } else {
        if (pelatihan!.TtdSertifikat === ESELON_1.fullName) {
          handleAddHistoryTrainingInExisting(pelatihan!, 'Telah menyetujui permohonan penerbitan dan mengirimkan ke Kepala BPPSDM KP untuk', 'Kepala Pusat Pelatihan Kelautan dan Perikanan', 'Pusat Pelatihan Kelautan dan Perikanan')
        } else {
          handleGenerateSertifikat()
          handleAddHistoryTrainingInExisting(pelatihan!, 'Telah menyetujui permohonan penerbitan dan mengupload memo permohonan penandatanganan ke Kepala BPPSDM KP untuk', 'Kepala Pusat Pelatihan Kelautan dan Perikanan', 'Pusat Pelatihan Kelautan dan Perikanan')
        }
      }


      console.log({ uploadBeritaAcaraResponse })
      handleFetchingPublicTrainingData();
    } catch (error) {
      console.error("ERROR GENERATE SERTIFIKAT: ", error);
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: "Gagal mengapprove pengajuan penerbitan sttpl/sertifikat pelatihan!",
      });
      handleFetchingPublicTrainingData();
    }
  }

  const [beritaAcara, setBeritaAcara] = React.useState<File | null>(null);


  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setBeritaAcara(file); // Simpan file tanpa validasi
    }
  };

  const handleGenerateSertifikat = async () => {
    if (beritaAcara) {
      const fileExtension = beritaAcara.name.split(".").pop()?.toLowerCase();
      if (fileExtension !== "pdf") {
        Toast.fire({
          icon: "error",
          title: "Oopsss!",
          text: "Gagal mengupload dokumen, harus mengupload dengan format PDF!",
        });
        return; // Hentikan proses jika file bukan PDF
      }
    }


    const updateData = new FormData();

    if (beritaAcara) {
      updateData.append('BeritaAcara', beritaAcara);
    }


    try {
      const uploadBeritaAcaraResponse = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${pelatihan!.IdPelatihan}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("UPLOAD BERITA ACARA: ", uploadBeritaAcaraResponse);
    } catch (error) {
      console.error("ERROR GENERATE SERTIFIKAT: ", error);
    }
  };

  return (
    <Card className="relative">
      {pelatihan != null && (
        <ShowingBadge isSupervisor={isSupervisor} data={pelatihan} isFlying={true} />
      )}
      <CardHeader>
        <CardTitle>{pelatihan.NamaPelatihan}</CardTitle>
        <CardDescription>{pelatihan.Program} • {pelatihan.PenyelenggaraPelatihan}</CardDescription>
      </CardHeader>
      <CardContent>
        <TrainingDetails pelatihan={pelatihan} />
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col justify-between gap-2">
          <div className="flex items-center w-fit gap-2 -mt-2">
            <Link
              title="Detail Pelatihan"
              href={`/admin/pusat/pelatihan/detail/${pelatihan.KodePelatihan}/${encryptValue(pelatihan.IdPelatihan)}`}
              className="border border-neutral-900 shadow-sm inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-neutral-900 hover:bg-neutral-900 hover:text-white text-white rounded-md"
            >
              <RiInformationFill className="h-5 w-5" /> Detail
            </Link>

            {pelatihan?.PemberitahuanDiterima === "Pengajuan Telah Dikirim ke Kapuslat KP" && pelatihan?.TtdSertifikat === ESELON_1.fullName &&
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border border-blue-500 shadow-sm inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-500 hover:bg-border-blue-500 hover:text-white text-white rounded-md"
                  >
                    <TbEditCircle className="h-5 w-5" /> Approve Pengajuan Penerbitan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {DIALOG_TEXTS['Approval Penerbitan Supervisor'].title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {DIALOG_TEXTS['Approval Penerbitan Supervisor'].desc}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex flex-col gap-1 w-full">

                    {
                      pelatihan!.TtdSertifikat === ESELON_1.fullName && <>
                        <div className="grid grid-cols-1 space-y-2">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="name"
                          >
                            Memo Permohonan Penandatangan Sertifikat
                            <span className="text-red-600">*</span>
                          </label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col rounded-lg border-2 border-dashed w-full h-40 p-10 group text-center">
                              <div className="h-full w-full text-center flex flex-col items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-10 h-10 text-blue-400 group-hover:text-blue-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  />
                                </svg>
                                {beritaAcara == null ? (
                                  <p className="pointer-none text-gray-500 text-sm">
                                    <span className="text-sm">Drag and drop</span> files
                                    here <br /> or{" "}

                                    select a file
                                    from your computer
                                  </p>
                                ) : (
                                  <p className="pointer-none text-gray-500 text-sm">
                                    {beritaAcara.name}
                                  </p>
                                )}{" "}
                              </div>
                              <input
                                type="file"
                                className="hidden h-20 w-full"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                        </div>
                      </>
                    }
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <div className="flex w-fit gap-2">

                      <AlertDialogAction onClick={(e) => handleSendToKapuslatAboutCertificateIssueance(pelatihan?.IdPelatihan.toString())} className="bg-green-500 border-green-500 hover:bg-green-500">
                        Approve dan Kirim ke Ka BPPSDM KP
                      </AlertDialogAction>
                    </div>

                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            }

            {isSupervisor && pelatihan.PemberitahuanDiterima == 'Pengajuan Telah Dikirim ke SPV' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border border-blue-500 shadow-sm inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-500 hover:bg-border-blue-500 hover:text-white text-white rounded-md"
                  >
                    <TbEditCircle className="h-5 w-5" /> Approve Pengajuan Penerbitan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {DIALOG_TEXTS['Approval Penerbitan Supervisor'].title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {DIALOG_TEXTS['Approval Penerbitan Supervisor'].desc}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex flex-col gap-1 w-full">

                    {
                      pelatihan!.TtdSertifikat === ESELON_2.fullName && <>
                        <div className="grid grid-cols-1 space-y-2">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="name"
                          >
                            Memo Permohonan Penandatangan Sertifikat
                            <span className="text-red-600">*</span>
                          </label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col rounded-lg border-2 border-dashed w-full h-40 p-10 group text-center">
                              <div className="h-full w-full text-center flex flex-col items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-10 h-10 text-blue-400 group-hover:text-blue-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  />
                                </svg>
                                {beritaAcara == null ? (
                                  <p className="pointer-none text-gray-500 text-sm">
                                    <span className="text-sm">Drag and drop</span> files
                                    here <br /> or{" "}

                                    select a file
                                    from your computer
                                  </p>
                                ) : (
                                  <p className="pointer-none text-gray-500 text-sm">
                                    {beritaAcara.name}
                                  </p>
                                )}{" "}
                              </div>
                              <input
                                type="file"
                                className="hidden h-20 w-full"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                        </div>
                      </>
                    }
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <div className="flex w-fit gap-2">

                      <AlertDialogAction onClick={(e) => handleSendToKapuslatAboutCertificateIssueance(pelatihan?.IdPelatihan.toString())} className="bg-green-500 border-green-500 hover:bg-green-500">
                        Approve dan Kirim ke Kapuslat KP
                      </AlertDialogAction>
                    </div>

                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {pelatihan?.UjiKompotensi === "Ujian Pre-test dan Post-test" &&
              pelatihan?.StatusApproval !== 'Selesai' &&
              pelatihan?.StatusPenerbitan === 'Sudah Diverifikasi Pelaksanaan' &&
              pelatihan?.PenyelenggaraPelatihan === 'Pusat Pelatihan KP' && (
                <Link
                  title="Bank Soal"
                  href={`/admin/pusat/pelatihan/${pelatihan.KodePelatihan}/bank-soal/${encryptValue(pelatihan.IdPelatihan)}`}
                  className="border border-blue-900 shadow-sm inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-900 hover:bg-blue-900 hover:text-white text-white rounded-md"
                >
                  <TbDatabase className="h-5 w-5" /> Bank Soal
                </Link>
              )}

            {pelatihan?.StatusPenerbitan === "Verifikasi Pelaksanaan" && (
              <VerifikasiButton
                title="Verifikasi"
                statusPelatihan={pelatihan?.StatusPenerbitan ?? ""}
                idPelatihan={pelatihan?.IdPelatihan.toString()}
                handleFetchingData={handleFetchingPublicTrainingData}
              />
            )}
          </div>

          <p className="italic text-neutral-400 text-[0.6rem]">
            Created at {pelatihan?.CreateAt} | Updated at {pelatihan?.UpdateAt}
          </p>
        </div>
      </CardFooter>

    </Card >
  )
};

const TrainingDetails: React.FC<{ pelatihan: PelatihanMasyarakat }> = ({ pelatihan }) => (
  <div className="ml-0 text-left capitalize -mt-6 w-full">
    <div className="ml-0 text-left mt-1 text-neutral-500">
      {pelatihan.PemberitahuanDiterima === "No sertifikat telah diinput" && (
        <DetailItem icon={AiOutlineFieldNumber} text={`No Sertifikat: ${pelatihan.NoSertifikat}`} />
      )}
      {pelatihan.TtdSertifikat && (
        <DetailItem icon={TbSignature} text={`Penandatangan Sertifikat: ${pelatihan.TtdSertifikat}`} />
      )}
      <DetailItem icon={TbTargetArrow} text={`Lokasi Pelatihan: ${pelatihan.LokasiPelatihan}`} />
      <DetailItem icon={TbCalendarCheck} text={`Waktu Pelaksanaan: ${pelatihan.TanggalMulaiPelatihan} s.d ${pelatihan.TanggalBerakhirPelatihan}`} />
      <DetailItem icon={HiUserGroup} text={`Jumlah peserta: ${pelatihan.UserPelatihan.length} Peserta`} />
    </div>
  </div>
);

const DetailItem: React.FC<{ icon: React.ElementType; text: string }> = ({ icon: Icon, text }) => (
  <span className="flex items-center gap-1 leading-[105%]">
    <Icon className="text-lg" /> <span>{text}</span>
  </span>
);

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
