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

const TableDataVerifikasiPelaksanaan: React.FC = () => {
  // APPROVAL PENERBITAN SUPERVISOR
  const [approvalNotes, setApprovalNotes] = React.useState<string>('')

  const [data, setData] = React.useState<PelatihanMasyarakat[]>([]);
  const isLemdiklatLevel = usePathname().includes('lemdiklat')
  const isSupervisor = Cookies.get('Status') === 'Supervisor'

  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  // COUNTER
  const [countVerifying, setCountVerifying] = React.useState<number>(0);
  const [countApproval, setCountApproval] = React.useState<number>(0);
  const [countApproved, setCountApproved] = React.useState<number>(0);

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
      "Bank Soal Disematkan": pelatihan.IsSematkan !== "yes",
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

            {isSupervisor && (
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



            {
              !isSupervisor && <>
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
              </>
            }
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
  const trainingDetailUrl = `/admin/pusat/pelatihan/detail/${pelatihan.KodePelatihan}/${encryptValue(pelatihan.IdPelatihan)}`;
  const bankSoalUrl = `/admin/pusat/pelatihan/${pelatihan.KodePelatihan}/bank-soal/${encryptValue(pelatihan.IdPelatihan)}`;

  const isEligibleForBankSoal =
    pelatihan.UjiKompotensi === "Ujian Pre-test dan Post-test" &&
    pelatihan.StatusApproval !== "Selesai" &&
    pelatihan.StatusPenerbitan === "Sudah Diverifikasi Pelaksanaan" &&
    pelatihan.PenyelenggaraPelatihan === "Pusat Pelatihan KP";

  const handleSendToKapuslatAboutCertificateIssueance = async (idPelatihan: string) => {
    const updateData = new FormData()
    updateData.append('PenerbitanSertifikatDiterima', 'Pengajuan Telah Dikirim Dari SPV')
    updateData.append('IsMengajukanPenerbitan', 'Pengajuan Telah Diapprove SPV')
    updateData.append('PemberitahuanDiterima', 'Pengajuan Telah Dikirim ke Kapuslat KP')

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
                    <div className="w-full">
                      <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="approvalNotes">
                        Catatan Approval <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="approvalNotes"
                        type="text"
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        className="form-input w-full text-black border-gray-300 rounded-md"
                        placeholder="Masukkan catatan..."
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {approvalNotes !== '' && (
                      <div className="flex w-fit gap-2">
                        <AlertDialogAction className="bg-rose-500 border-rose-500 hover:bg-rose-500">
                          Reject
                        </AlertDialogAction>
                        <AlertDialogAction onClick={(e) => handleSendToKapuslatAboutCertificateIssueance(pelatihan?.IdPelatihan.toString())} className="bg-green-500 border-green-500 hover:bg-green-500">
                          Approve
                        </AlertDialogAction>
                      </div>
                    )}
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

    </Card>
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
