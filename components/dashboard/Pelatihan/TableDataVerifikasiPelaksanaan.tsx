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
import { MdBusiness, MdClear, MdPeople, MdSchool, MdSearch } from "react-icons/md";
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

import VerifikasiButton from "../Dashboard/Actions/VerifikasiButton";
import { encryptValue } from "@/lib/utils";
import { AiOutlineFieldNumber } from "react-icons/ai";
import { IoRefreshSharp } from "react-icons/io5";
import { HashLoader } from "react-spinners";
import { DIALOG_TEXTS } from "@/constants/texts";
import ShowingBadge from "@/components/elaut/dashboard/ShowingBadge";
import Toast from "@/components/toast";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { ESELON_1, ESELON_2, UPT } from "@/constants/nomenclatures";
import { BiPaperPlane } from "react-icons/bi";
import TabStatusPelatihanMasyarakat from "./TabStatusPelatihanMasyarakat";
import { BookOpen, Calendar, Users } from "lucide-react";
import { generateTanggalPelatihan } from "@/utils/text";
import { PROGRAM_AKP, PROGRAM_KELAUTAN, PROGRAM_PERIKANAN } from "@/constants/pelatihan";
import TableDataPelatihanMasyarakat from "./Table/TableDataPelatihanMasyrakat";
import { countUserWithDrafCertificate } from "@/utils/counter";
import { useFetchDataPelatihanMasyarakatForApproval } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakatForApproval";

const TableDataVerifikasiPelaksanaan: React.FC = () => {
  // APPROVAL PENERBITAN SUPERVISOR
  const [approvalNotes, setApprovalNotes] = React.useState<string>('')

  const {
    data,
    isLemdiklatLevel,
    isSupervisor,
    isPejabat,
    isEselonI,
    isEselonII,
    isFetching,
    setIsFetching,
    countVerifying,
    countApproval,
    countApproved,
    countSigning,
    countSigningEselon1,
    countSigningByKaBPPSDMKP,
    countSignedEselon1,
    countSignedEselon2,
    refetch
  } = useFetchDataPelatihanMasyarakatForApproval();




  const statusPejabat = Cookies.get('Status')

  // const handleSendToKapuslatAboutCertificateIssueance = async (idPelatihan: string) => {
  //   const updateData = new FormData()
  //   if (statusPejabat === ESELON_1.fullName) {
  //     updateData.append('PenerbitanSertifikatDiterima', 'Pengajuan Telah Dikirim Dari SPV')
  //     updateData.append('IsMengajukanPenerbitan', 'Pengajuan Telah Diapprove Ka BPPSDM KP')
  //     updateData.append('PemberitahuanDiterima', 'Pengajuan Telah Diterima Ka BPPSDM KP')
  //   } else if (statusPejabat === ESELON_2.fullName) {
  //     updateData.append('PenerbitanSertifikatDiterima', 'Pengajuan Telah Dikirim Dari SPV')
  //     updateData.append('IsMengajukanPenerbitan', 'Pengajuan Telah Diapprove Kapuslat KP')
  //     updateData.append('PemberitahuanDiterima', 'Pengajuan Telah Dikirim ke Ka BPPSDM KP')
  //   } else {
  //     updateData.append('PenerbitanSertifikatDiterima', 'Pengajuan Telah Dikirim Dari SPV')
  //     updateData.append('IsMengajukanPenerbitan', 'Pengajuan Telah Diapprove SPV')
  //     updateData.append('PemberitahuanDiterima', 'Pengajuan Telah Dikirim ke Kapuslat KP')
  //   }


  //   try {
  //     const uploadBeritaAcaraResponse = await axios.put(
  //       `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
  //       updateData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${Cookies.get("XSRF091")}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     Toast.fire({
  //       icon: "success",
  //       title: "Yeayyy!",
  //       text: "Berhasil mengapprove pengajuan penerbitan sttpl/sertifikat pelatihan!",
  //     });

  //     if (isSupervisor) {
  //       if (pelatihan!.TtdSertifikat === ESELON_1.fullName) {
  //         handleAddHistoryTrainingInExisting(pelatihan!, 'Telah menyetujui permohonan penerbitan dan mengirimkan ke Kepala Pusat Pelatihan KP untuk', 'Supervisor', 'Pusat Pelatihan Kelautan dan Perikanan')
  //       } else {
  //         handleGenerateSertifikat()
  //         handleAddHistoryTrainingInExisting(pelatihan!, 'Telah menyetujui permohonan penerbitan dan mengupload memo permohonan penandatanganan ke Kepala Pusat Pelatihan KP untuk', 'Supervisor', 'Pusat Pelatihan Kelautan dan Perikanan')
  //       }
  //     } else {
  //       if (pelatihan!.TtdSertifikat === ESELON_1.fullName) {
  //         handleAddHistoryTrainingInExisting(pelatihan!, 'Telah menyetujui permohonan penerbitan dan mengirimkan ke Kepala BPPSDM KP untuk', 'Kepala Pusat Pelatihan Kelautan dan Perikanan', 'Pusat Pelatihan Kelautan dan Perikanan')
  //       } else {
  //         handleGenerateSertifikat()
  //         handleAddHistoryTrainingInExisting(pelatihan!, 'Telah menyetujui permohonan penerbitan dan mengupload memo permohonan penandatanganan ke Kepala BPPSDM KP untuk', 'Kepala Pusat Pelatihan Kelautan dan Perikanan', 'Pusat Pelatihan Kelautan dan Perikanan')
  //       }
  //     }


  //     console.log({ uploadBeritaAcaraResponse })
  //     handleFetchingPublicTrainingData();
  //   } catch (error) {
  //     console.error("ERROR GENERATE SERTIFIKAT: ", error);
  //     Toast.fire({
  //       icon: "error",
  //       title: "Oopsss!",
  //       text: "Gagal mengapprove pengajuan penerbitan sttpl/sertifikat pelatihan!",
  //     });
  //     handleFetchingPublicTrainingData();
  //   }
  // }

  const [beritaAcara, setBeritaAcara] = React.useState<File | null>(null);


  // const handleFileChange = (e: any) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setBeritaAcara(file); // Simpan file tanpa validasi
  //   }
  // };

  // const handleGenerateSertifikat = async () => {
  //   if (beritaAcara) {
  //     const fileExtension = beritaAcara.name.split(".").pop()?.toLowerCase();
  //     if (fileExtension !== "pdf") {
  //       Toast.fire({
  //         icon: "error",
  //         title: "Oopsss!",
  //         text: "Gagal mengupload dokumen, harus mengupload dengan format PDF!",
  //       });
  //       return; // Hentikan proses jika file bukan PDF
  //     }
  //   }


  //   const updateData = new FormData();

  //   if (beritaAcara) {
  //     updateData.append('BeritaAcara', beritaAcara);
  //   }


  //   try {
  //     const uploadBeritaAcaraResponse = await axios.put(
  //       `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${pelatihan!.IdPelatihan}`,
  //       updateData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${Cookies.get("XSRF091")}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //     console.log("UPLOAD BERITA ACARA: ", uploadBeritaAcaraResponse);
  //   } catch (error) {
  //     console.error("ERROR GENERATE SERTIFIKAT: ", error);
  //   }
  // };


  /** 
   * Filtering Utilitess
   */
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>("All");
  const [filterCategory, setFilterCategory] = React.useState<string>(""); // Program
  const [filterCategoryPenyelenggara, setFilterCategoryPenyelenggara] = React.useState<string>(""); // Penyelenggara
  const [filterCategorySasaran, setFilterCategorySasaran] = React.useState<string>(""); // Sasaran / AsalPelatihan

  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const statusMapping: Record<string, (p: typeof data[number]) => boolean> = {
    "All": p => p.KodePelatihan !== '',
    "Proses Pengajuan Sertifikat": p => p.StatusPenerbitan === "On Progress",
    "Belum Dipublish": p => p.Status !== "Publish",
    "Approval": p => p.PemberitahuanDiterima === 'Pengajuan Telah Dikirim ke SPV',
    "Approved": p => p.IsMengajukanPenerbitan === 'Pengajuan Telah Diapprove SPV',
    "Sudah Di TTD": p => p.StatusPenerbitan === "Done",
    "Verifikasi Pelaksanaan": p => p.StatusPenerbitan === "Verifikasi Pelaksanaan",
    "Signing": p => isEselonI
      ? p.PemberitahuanDiterima === "Pengajuan Telah Dikirim ke Ka BPPSDM KP" && p.TtdSertifikat === ESELON_1.fullName
      : p.PemberitahuanDiterima === "Pengajuan Telah Dikirim ke Kapuslat KP" && p.TtdSertifikat === ESELON_2.fullName,
    "Signed": p => isEselonI
      ? p.PemberitahuanDiterima === "Telah Ditandatangani Ka BPPSDM KP" && p.TtdSertifikat === ESELON_1.fullName
      : p.PemberitahuanDiterima === "Telah Ditandatangani Ka Puslat KP" && p.TtdSertifikat === ESELON_2.fullName,
    "Signing by Ka BPPSDM KP": p => p.PemberitahuanDiterima === "Pengajuan Telah Dikirim ke Kapuslat KP" && p.TtdSertifikat === ESELON_1.fullName,
  };

  const searchLower = searchQuery.toLowerCase();
  const filterProgramLower = filterCategory?.toLowerCase();
  const filterPenyelenggaraLower = filterCategoryPenyelenggara?.toLowerCase();
  const filterSasaranLower = filterCategorySasaran?.toLowerCase();

  const filteredData = data.filter(p => {
    const program = p.Program.toLowerCase();
    const namaPelatihan = p.NamaPelatihan.toLowerCase();
    const bidangPelatihan = p.BidangPelatihan.toLowerCase();
    const penyelenggara = p.PenyelenggaraPelatihan.toLowerCase();
    const sasaran = p.AsalPelatihan.toLowerCase();

    return (
      (!filterProgramLower || program === filterProgramLower) &&
      (!filterPenyelenggaraLower || penyelenggara === filterPenyelenggaraLower) &&
      (!filterSasaranLower || sasaran === filterSasaranLower) &&
      [namaPelatihan, bidangPelatihan, penyelenggara].some(field =>
        field.includes(searchLower)
      ) &&
      (
        selectedStatusFilter === "All" ||
        statusMapping[selectedStatusFilter]?.(p) ||
        p.Status === selectedStatusFilter
      )
    );
  });



  return (
    <div className="shadow-default -mt-10">
      <TabStatusPelatihanMasyarakat
        dataLength={data.length}
        selectedStatusFilter={selectedStatusFilter}
        setSelectedStatusFilter={setSelectedStatusFilter}

        data={data} // array of pelatihan data
        isSupervisor={isSupervisor}
        isPejabat={isPejabat}
        isEselonI={isEselonI}
        ESELON_2={{ fullName: ESELON_2.fullName }}
        setIsFetching={setIsFetching}

        countApproval={countApproval}
        countSigningByKaBPPSDMKP={countSigningByKaBPPSDMKP}
        countSigning={countSigning}
        countSigningEselon1={countSigningEselon1}
        countSignedEselon1={countSignedEselon1}
        countSignedEselon2={countSignedEselon2}
        countApproved={countApproved}
      />

      <section className="px-4 -mt-10 w-full">
        <div className="mb-4 flex flex-wrap items-center !text-sm w-full gap-3 p-3 bg-white rounded-2xl shadow-sm border border-neutral-200">
          {/* Program Pelatihan */}
          <Select
            value={filterCategory}
            onValueChange={(value: string) => setFilterCategory(value)}
          >
            <SelectTrigger className="w-fit md:w-1/4  bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 flex items-center gap-2">
              <MdSchool className="text-neutral-500 w-5 h-5" />
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

          {/* Sasaran */}
          <Select
            value={filterCategorySasaran}
            onValueChange={(value: string) => setFilterCategorySasaran(value)}
          >
            <SelectTrigger className="w-fit md:w-1/4  bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 flex items-center gap-2">
              <MdPeople className="text-neutral-500 w-5 h-5" />
              <SelectValue placeholder="Pilih Sasaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masyarakat Umum">Masyarakat Umum</SelectItem>
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

          {/* Penyelenggara */}
          <Select
            value={filterCategoryPenyelenggara}
            onValueChange={(value: string) => setFilterCategoryPenyelenggara(value)}
          >
            <SelectTrigger className="w-fit  bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 flex items-center gap-2">
              <MdBusiness className="text-neutral-500 w-5 h-5" />
              <SelectValue placeholder="Pilih Satker/Penyelenggara" />
            </SelectTrigger>
            <SelectContent>
              {UPT.map((item: string, index: number) => (
                <SelectItem key={index} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="flex items-center w-full md:flex-1 bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 gap-2">
            <MdSearch className="text-neutral-500 w-5 h-5" />
            <Input
              type="text"
              placeholder="Cari berdasarkan Nama Pelatihan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-none bg-transparent text-sm focus:ring-0 focus:outline-none"
            />
          </div>

          {/* Clear Filter */}
          {(filterCategory || filterCategoryPenyelenggara || filterCategorySasaran) && (
            <Button
              onClick={() => {
                setFilterCategory("");
                setFilterCategoryPenyelenggara("");
                setFilterCategorySasaran("");
              }}
              className="h-12 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl shadow-sm flex items-center gap-2"
            >
              <MdClear className="w-5 h-5" />
              Bersihkan Filter
            </Button>
          )}
        </div>
        <TableDataPelatihanMasyarakat
          data={filteredData}

          generateTanggalPelatihan={generateTanggalPelatihan}
          encryptValue={encryptValue}
          countUserWithDrafCertificate={countUserWithDrafCertificate}
          handleSendToSPVAboutCertificateIssueance={() => { }}
          fetchDataPelatihanMasyarakat={refetch}
        />

        {isFetching ? (
          <div className="py-32 w-full flex items-center justify-center">
            <HashLoader color="#338CF5" size={50} />
          </div>
        ) : data.length === 0 ? (
          <></>
        ) : (
          <></>
        )}
      </section>

    </div >
  );
};




export default TableDataVerifikasiPelaksanaan;
