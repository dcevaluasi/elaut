"use client";

import React from "react";

import { HiLockClosed, HiMiniUserGroup, HiUserGroup } from "react-icons/hi2";
import { TbDatabase, TbSchool } from "react-icons/tb";
import { FiEdit2, FiUploadCloud } from "react-icons/fi";

import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { elautBaseUrl, urlFileBeritaAcara, urlFileSilabus, urlFileSuratPemberitahuan } from "@/constants/urls";

import axios from "axios";
import { HistoryTraining, PelatihanMasyarakat } from "@/types/product";
import { generateFullNameBalai, generateTanggalPelatihan } from "@/utils/text";
import {
    decryptValue,
    encryptValue,
    formatToRupiah,
    generateInstrukturName,
} from "@/lib/utils";
import CloseButton from "./Actions/CloseButton";
import GenerateNoSertifikatButton from "./Actions/GenerateNoSertifikatButton";

import ShowingBadge from "@/components/elaut/dashboard/ShowingBadge";
import NoSertifikatButton from "./Actions/NoSertifikatButton";
import HistoryButton from "./Actions/HistoryButton";
import { Button } from "@/components/ui/button";
import { MateriButton, PublishButton } from "./Actions";
import { ApprovePelaksanaanSPV } from "../admin/spv/ApprovalPelaksanaanSPV";
import Toast from "@/components/toast";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { ApprovePelaksanaanVerifikator } from "../admin/verifikator/ApprovalPelaksanaanVerifikator";
import { useFetchDataPelatihanMasyarakatDetail } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarkatDetail";
import { HashLoader } from "react-spinners";

// shadcn ui components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PelatihanDetail from "./PelatihanDetail";

const ManagePelatihan = () => {
    const paths = usePathname().split("/");

    const idPelatihan = decryptValue(paths[paths.length - 1]);

    const { data: dataPelatihan, loading: loadingDataPelatihan, error, refetch: refetchDetailPelatihan } = useFetchDataPelatihanMasyarakatDetail(idPelatihan);

    const handleApprovedPelaksanaanBySPV = async (idPelatihan: string, pelatihan: PelatihanMasyarakat, verifikatorSelected: string) => {
        const updateData = new FormData()
        updateData.append('StatusPenerbitan', '2')
        updateData.append('PenerbitanSertifikatDiterima', verifikatorSelected)

        try {
            await axios.put(
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
                text: "Berhasil Memilih Verifikator Permohonan Pelaksanaan Diklat",
            });
            handleAddHistoryTrainingInExisting(pelatihan!, 'Telah Memilih Verifikator Permohonan Pelaksanaan Diklat!', Cookies.get('Eselon'), Cookies.get('SATKER_BPPP'))

            refetchDetailPelatihan();
        } catch (error) {
            console.error("ERROR GENERATE SERTIFIKAT: ", error);
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: "Gagal Memilih Verifikator Permohonan Pelaksanaan Diklat",
            });
            refetchDetailPelatihan();
        }
    }

    const [activeTab, setActiveTab] = React.useState('1')

    return (
        <section className="pb-20">
            {
                dataPelatihan != null && !loadingDataPelatihan ?
                    <>
                        <header
                            aria-label="page caption"
                            className="flex-row w-full flex h-24 items-center justify-between gap-2 bg-gray-100 border-t p-5"
                        >
                            <div className="flex flex-row gap-3 items-center">
                                <TbSchool className="text-3xl" />
                                <div className="flex flex-col">
                                    <h1 id="page-caption" className="font-semibold text-lg max-w-3xl">
                                        {dataPelatihan != null ? dataPelatihan.NamaPelatihan : ""}
                                    </h1>

                                </div>
                            </div>
                            <HistoryButton
                                pelatihan={dataPelatihan!}
                                statusPelatihan={dataPelatihan?.Status ?? ""}
                                idPelatihan={dataPelatihan!.IdPelatihan.toString()}
                                handleFetchingData={
                                    refetchDetailPelatihan
                                }
                            />
                        </header>

                        <Tabs defaultValue={activeTab} className="w-full rounded-none">
                            <TabsList className={`grid w-full grid-cols-3 !bg-gray-100 rounded-none`}>
                                <TabsTrigger value="1" onClick={() => setActiveTab("1")}
                                > 1. Persiapan Pelatihan </TabsTrigger>
                                <TabsTrigger value="2" onClick={() => setActiveTab("2")}>2. Pelaksanaan Pelatihan</TabsTrigger>
                                <TabsTrigger value="3" onClick={() => setActiveTab("3")}>3. Penerbitan STTPL</TabsTrigger>
                            </TabsList>

                            <TabsContent value="1">
                                <PelatihanDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                            </TabsContent>
                            <TabsContent value="2">
                                <>
                                    <section className="mt-5 my-5  w-full ">
                                        <div className="w-full border border-gray-200 rounded-xl">
                                            <div className="bg-gray-100 p-4 w-full ">
                                                <h2 className="font-calsans text-xl">
                                                    Materi, Kurikulum, dan Bank Soal Pre-Test & Post-Test
                                                </h2>
                                            </div>
                                            <table className="w-full">
                                                <tr className="border-b border-b-gray-200 w-full">
                                                    <td className="p-4 w-fit gap-1 flex justify-start ">
                                                        <>
                                                            <MateriButton
                                                                idPelatihan={dataPelatihan!.IdPelatihan.toString()}
                                                                handleFetchingData={
                                                                    refetchDetailPelatihan
                                                                }
                                                                data={dataPelatihan!}
                                                            />
                                                            <Link
                                                                title="Bank Soal"
                                                                href={`/admin/lemdiklat/pelatihan/${dataPelatihan!.KodePelatihan
                                                                    }/bank-soal/${encryptValue(dataPelatihan!.IdPelatihan)}`}
                                                                className="border border-blue-900  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-900 hover:bg-blue-900 hover:text-white text-white rounded-md"
                                                            >
                                                                <TbDatabase className="h-5 w-5" /> Bank Soal Pre-Test & Post-Test
                                                            </Link></>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </section></>
                            </TabsContent>
                            <TabsContent value="3">
                                <section className="space-y-6 py-4">
                                    {/* Informasi Pelatihan & Sertifikat */}
                                    <div className="grid grid-cols-1 gap-6">


                                        {/* Informasi Sertifikat */}
                                        <div className="bg-white rounded-2xl h-fit shadow-md border border-gray-200 overflow-x-scroll">
                                            <div className="bg-gray-100 p-4 w-full">
                                                <h2 className="font-calsans text-xl text-gray-800">Informasi Penerbitan Sertifikat</h2>
                                            </div>
                                            <table className="w-full text-sm text-gray-700">
                                                <tbody>
                                                    {
                                                        dataPelatihan!.KeteranganTandaTangan == '' && <tr className="border-t border-gray-200">
                                                            <td className="p-4 font-semibold text-gray-600 w-[35%]">Status</td>
                                                            <td className="p-4">
                                                                <ShowingBadge data={dataPelatihan!} isFlying={false} />
                                                            </td>
                                                        </tr>
                                                    }

                                                    <InfoRow label="Penandatangan" value={dataPelatihan?.TtdSertifikat || "-"} />
                                                    <InfoRow
                                                        label="Dokumen Permohonan"
                                                        value={
                                                            <a href={`${urlFileBeritaAcara}/${dataPelatihan?.BeritaAcara}`}
                                                                target="_blank"
                                                                className="text-blue-600 underline break-words">
                                                                {`${urlFileBeritaAcara}/${dataPelatihan?.BeritaAcara}`}
                                                            </a>
                                                        }
                                                    />
                                                    <InfoRow label="Format Sertifikat" value={dataPelatihan?.JenisSertifikat} />


                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </section>
                            </TabsContent>
                        </Tabs>


                    </>
                    :
                    <section className="py-32 w-full items-center flex justify-center">
                        <HashLoader color="#338CF5" size={50} />
                    </section>
            }
        </section>
    );
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <tr className="border-t border-gray-200 text-base">
        <td className="p-4 font-semibold text-gray-600 w-[35%]">{label}</td>
        <td className="p-4 break-words">{value || "-"}</td>
    </tr>
);

export default ManagePelatihan

