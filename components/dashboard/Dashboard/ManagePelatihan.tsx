"use client";

import React from "react";
import { TbDatabase, TbSchool } from "react-icons/tb";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { urlFileBeritaAcara } from "@/constants/urls";
import {
    decryptValue,
    encryptValue,
} from "@/lib/utils";
import ShowingBadge from "@/components/elaut/dashboard/ShowingBadge";
import HistoryButton from "./Actions/HistoryButton";
import { MateriButton } from "./Actions";
import { useFetchDataPelatihanMasyarakatDetail } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarkatDetail";
import { HashLoader } from "react-spinners";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PelatihanDetail from "./PelatihanDetail";
import Cookies from "js-cookie";
import { MdLock } from "react-icons/md";
import STTPLDetail from "./STTPLDetail";
const ManagePelatihan = () => {
    const paths = usePathname().split("/");
    const idPelatihan = decryptValue(paths[paths.length - 1]);
    const { data: dataPelatihan, loading: loadingDataPelatihan, error, refetch: refetchDetailPelatihan } = useFetchDataPelatihanMasyarakatDetail(idPelatihan);
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
                        </header>

                        <Tabs defaultValue={!dataPelatihan?.TtdSertifikat?.includes("Kepala Balai") ? (parseInt(dataPelatihan?.StatusPenerbitan) >= 5) ? '2' : '1' : (parseFloat(dataPelatihan?.StatusPenerbitan) >= 1.25) ? '2' : '1'} className="w-full rounded-none">
                            <TabsList className="grid w-full grid-cols-2 !bg-gray-100 rounded-none">
                                <TabsTrigger
                                    value="1"
                                    onClick={() => setActiveTab("1")}
                                >
                                    1. Penyelenggaraan Pelatihan
                                </TabsTrigger>
                                <TabsTrigger
                                    value="2"
                                    onClick={() => setActiveTab("2")}
                                    disabled={!dataPelatihan?.TtdSertifikat?.includes("Kepala Balai") ? parseInt(dataPelatihan?.StatusPenerbitan) < 5 || dataPelatihan?.StatusPenerbitan == "" : parseFloat(dataPelatihan?.StatusPenerbitan) < 1.25 || dataPelatihan?.StatusPenerbitan == ""}
                                >
                                    2. Penerbitan STTPL
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="1">
                                <PelatihanDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                            </TabsContent>
                            <TabsContent value="2">
                                {
                                    !dataPelatihan?.TtdSertifikat.includes('Kepala Balai') ? <>
                                        {
                                            parseInt(dataPelatihan?.StatusPenerbitan) < 5 ? <div className="py-32 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-3">
                                                <MdLock className='w-14 h-14 text-gray-600 animate-pulse' />
                                                <p className="text-gray-500 font-normal text-center">
                                                    Oopsss, Penyelenggara pelatihan belum mengajukan penerbitan STTPL dan mengupload dokumen Berita Acara, Laporan Pelaksanaan serta Kelengkapan Lainnya. Segera ajukan, jangan sampai pengajuan penerbitan STTPL berlangsung lama!
                                                </p>
                                            </div> : <STTPLDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                                        }</> :
                                        <>
                                            {
                                                parseFloat(dataPelatihan?.StatusPenerbitan) > 1.1 && parseFloat(dataPelatihan?.StatusPenerbitan) < 1.25 ? <div className="py-32 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-3">
                                                    <MdLock className='w-14 h-14 text-gray-600 animate-pulse' />
                                                    <p className="text-gray-500 font-normal text-center">
                                                        Oopsss, Penyelenggara pelatihan belum mengajukan penerbitan STTPL dan mengupload dokumen Berita Acara, Laporan Pelaksanaan serta Kelengkapan Lainnya. Segera ajukan, jangan sampai pengajuan penerbitan STTPL berlangsung lama!
                                                    </p>
                                                </div> : <STTPLDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                                            }</>
                                }

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

