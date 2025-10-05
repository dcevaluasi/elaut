"use client";
import React from "react";
import { HashLoader } from "react-spinners";
import Image from "next/image";
import { DynamicTablePelatihanMasyarakat } from "./Summary/DynamicTablePelatihanMasyarakat";
import useFetchDataDukung from "@/hooks/elaut/useFetchDataDukung";
import DataDukungPelatihanTable from "./Dashboard/Tables/DataDukungPelatihanTable";

const SummaryKinerja: React.FC = () => {
    const { data: dataDukung, isFetching: isFetchingDataDukung, refetch } = useFetchDataDukung()

    return (
        <div className="w-full">
            {isFetchingDataDukung ? (
                <div className="w-full h-[60vh] flex items-center justify-center">
                    <HashLoader color="#338CF5" size={60} />
                </div>
            ) : dataDukung.length != 0 ? (
                <>
                    <DataDukungPelatihanTable data={dataDukung} />
                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataDukung}
                        rowKey="PenyelenggaraPelatihan"
                        colKey="Triwulan"
                        title="Masyarakat Dilatih berdasarkan Penyelenggara & Triwulan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataDukung}
                        rowKey="PenyelenggaraPelatihan"
                        colKey="JenisKelamin"
                        title="Masyarakat Dilatih berdasarkan Penyelenggara & Jenis Kelamin"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataDukung}
                        rowKey="PenyelenggaraPelatihan"
                        colKey="PendidikanTerakhir"
                        title="Masyarakat Dilatih berdasarkan Penyelenggara & Pendidikan Terakhir"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataDukung}
                        rowKey="Provinsi"
                        colKey="BidangPelatihan"
                        title="Masyarakat Dilatih berdasarkan Provinsi & Bidang/Klaster Pelatihan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataDukung}
                        rowKey="Provinsi"
                        colKey="PenyelenggaraPelatihan"
                        title="Masyarakat Dilatih berdasarkan Provinsi & Penyelenggara Pelatihan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataDukung}
                        rowKey="JenisProgram"
                        colKey="PenyelenggaraPelatihan"
                        title="Masyarakat Dilatih berdasarkan Sektor Pelatihan & Penyelenggara Pelatihan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataDukung}
                        rowKey="BidangPelatihan"
                        colKey="PenyelenggaraPelatihan"
                        title="Masyarakat Dilatih berdasarkan Klaster Pelatihan & Penyelenggara Pelatihan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataDukung}
                        rowKey="Program"
                        colKey="PenyelenggaraPelatihan"
                        title="Masyarakat Dilatih berdasarkan Program Pelatihan & Penyelenggara Pelatihan"
                    />

                    <DynamicTablePelatihanMasyarakat
                        dataUser={dataDukung}
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
