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
import HistoryButton from "./Actions/HistoryButton";
import { useFetchDataPelatihanMasyarakatDetail } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarkatDetail";
import { HashLoader } from "react-spinners";

import PelatihanDetail from "./PelatihanDetail";
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

                        <div className="w-full rounded-none">
                            <PelatihanDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                        </div>
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

