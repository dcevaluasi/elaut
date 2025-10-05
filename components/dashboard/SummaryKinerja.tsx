"use client";
import React, { useState } from "react";
import Cookies from "js-cookie";
import axios, { AxiosResponse } from "axios";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import { HashLoader } from "react-spinners";
import Image from "next/image";
import { DynamicTablePelatihanMasyarakat } from "./Summary/DynamicTablePelatihanMasyarakat";
import useFetchDataDukung from "@/hooks/elaut/useFetchDataDukung";
import DataDukungPelatihanTable from "./Dashboard/Tables/DataDukungPelatihanTable";

const SummaryKinerja: React.FC = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const token = Cookies.get("XSRF091");

    const [data, setData] = useState<PelatihanMasyarakat[]>([]);

    const [isFetching, setIsFetching] = React.useState<boolean>(false);

    const [dataUser, setDataUser] = React.useState<UserPelatihan[]>([]);

    const handleFetchingUserPelatihan = async () => {
        setIsFetching(true);
        try {
            const response: AxiosResponse = await axios.get(
                `${baseUrl}/getUsersPelatihan`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const filteredData = response.data.data.filter((item: UserPelatihan) => item.FileSertifikat?.includes('signed'))
            setDataUser(filteredData);
            setIsFetching(false);
        } catch (error) {
            setIsFetching(false);
        }
    };

    const handleFetchingPublicTrainingData = async (
        selectedBalaiPelatihan: string
    ) => {
        setIsFetching(true);
        try {
            const response: AxiosResponse = await axios.get(
                `${baseUrl}/lemdik/getPelatihanAdmin?penyelenggara_pelatihan=${selectedBalaiPelatihan === "All" ? "" : selectedBalaiPelatihan
                }`, {
                headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
            }
            );
            setData(response.data.data);
            setIsFetching(false);
        } catch (error) {
            setIsFetching(false);
        }
    };

    const { data: dataDukung, isFetching: isFetchingDataDukung, refetch } = useFetchDataDukung()


    React.useEffect(() => {
        const fetchAllData = () => {
            handleFetchingUserPelatihan();
            handleFetchingPublicTrainingData("All");
        };

        fetchAllData();
    }, []);

    if (isFetching || isFetchingDataDukung) {
        return <div className="w-full h-[60vh] flex items-center justify-center">
            <HashLoader color="#338CF5" size={60} />
        </div>
    }


    return (
        <div className="w-full">
            {isFetching ? (
                <div className="w-full h-[60vh] flex items-center justify-center">
                    <HashLoader color="#338CF5" size={60} />
                </div>
            ) : data != null ? (
                <>
                    <DataDukungPelatihanTable data={dataDukung} />
                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataUser}
                        rowKey="PenyelenggaraPelatihan"
                        colKey="Triwulan"
                        title="Masyarakat Dilatih berdasarkan Penyelenggara & Triwulan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataUser}
                        rowKey="PenyelenggaraPelatihan"
                        colKey="JenisKelamin"
                        title="Masyarakat Dilatih berdasarkan Penyelenggara & Jenis Kelamin"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataUser}
                        rowKey="PenyelenggaraPelatihan"
                        colKey="PendidikanTerakhir"
                        title="Masyarakat Dilatih berdasarkan Penyelenggara & Pendidikan Terakhir"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataUser}
                        rowKey="Provinsi"
                        colKey="BidangPelatihan"
                        title="Masyarakat Dilatih berdasarkan Provinsi & Bidang/Klaster Pelatihan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataUser}
                        rowKey="Provinsi"
                        colKey="PenyelenggaraPelatihan"
                        title="Masyarakat Dilatih berdasarkan Provinsi & Penyelenggara Pelatihan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataUser}
                        rowKey="JenisProgram"
                        colKey="PenyelenggaraPelatihan"
                        title="Masyarakat Dilatih berdasarkan Sektor Pelatihan & Penyelenggara Pelatihan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataUser}
                        rowKey="BidangPelatihan"
                        colKey="PenyelenggaraPelatihan"
                        title="Masyarakat Dilatih berdasarkan Klaster Pelatihan & Penyelenggara Pelatihan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataUser}
                        rowKey="Program"
                        colKey="PenyelenggaraPelatihan"
                        title="Masyarakat Dilatih berdasarkan Program Pelatihan & Penyelenggara Pelatihan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataUser}
                        rowKey="DukunganProgramPrioritas"
                        colKey="PenyelenggaraPelatihan"
                        title="Masyarakat Dilatih berdasarkan Dukungan Program Prioritas & Penyelenggara Pelatihan"
                    />
                </>
            ) : (
                <div className="relative max-w-7xl w-full mx-auto mt-20">
                    <div className="pt-7 md:pt-0 flex flex-col items-center">
                        <Image
                            src={"/illustrations/not-found.png"}
                            alt="Not Found"
                            width={0}
                            height={0}
                            className="w-[350px] md:w-[400px]"
                        />
                        <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
                            <h1 className="text-2xl md:text-3xl font-calsans leading-[110%] text-black">
                                Belum Ada Pelatihan
                            </h1>
                            <div className="text-gray-600 text-center leading-[125%]  max-w-md">
                                Capaian ataupun summary dari pelaksanaan pelatihan belum dapat
                                dilihat, karena Balai Pelatihan belum memiliki peneyelenggaraan
                                pelatihan!
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



export default SummaryKinerja;
