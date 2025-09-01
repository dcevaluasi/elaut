"use client";

import React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan } from "@/utils/text";
import { PublishButton } from "./Actions";
import { TbEditCircle, TbLock } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { replaceUrl } from "@/lib/utils";
import EditPublishAction from "./Actions/EditPublishAction";
import { MdLock } from "react-icons/md";
import ImportPesertaAction from "./Actions/ImportPesertaAction";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import Cookies from "js-cookie";
import UserPelatihanTable from "./Tables/UserPelatihanTable";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: any
}

const PelatihanDetail: React.FC<Props> = ({ data, fetchData }) => {
    return (
        <div className="w-full space-y-6 py-5">
            {/* Accordion Sections */}
            <Accordion
                type="single"
                collapsible
                className="w-full space-y-3"
                defaultValue="📌 Informasi Umum"
            >
                <AccordionSection title="📌 Informasi Umum">
                    <SectionGrid>
                        <InfoItem label="Kode Pelatihan" value={data.KodePelatihan} />
                        <InfoItem label="Bidang" value={data.JenisProgram} />
                        <InfoItem label="Program" value={data.Program} />
                        <InfoItem label="Jenis Pelatihan" value={data.JenisPelatihan} />
                        <InfoItem label="Dukungan Program Terobosan" value={data.DukunganProgramTerobosan} />
                        <InfoItem label="Penyelenggara" value={data.PenyelenggaraPelatihan} />
                        <InfoItem label="Mulai Pelatihan" value={generateTanggalPelatihan(data.TanggalMulaiPelatihan)} />
                        <InfoItem label="Selesai Pelatihan" value={generateTanggalPelatihan(data.TanggalBerakhirPelatihan)} />
                        <InfoItem label="Lokasi" value={data.LokasiPelatihan} />
                        <InfoItem label="Instruktur" value={data.Instruktur} />
                        <InfoItem label="Harga" value={`Rp ${data.HargaPelatihan.toLocaleString()}`} />
                        <InfoItem label="Pelaksanaan" value={data.PelaksanaanPelatihan} />
                    </SectionGrid>
                </AccordionSection>

                <AccordionSection title="🌐 Publish Informasi">
                    <div className="flex flex-col w-full gap-4">
                        <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                            <p className="font-medium text-gray-600">
                                Action :
                            </p>
                            <EditPublishAction
                                idPelatihan={data.IdPelatihan.toString()}
                                currentDetail={data.DetailPelatihan}
                                currentFoto={data.FotoPelatihan}
                                tanggalPendaftaran={[data.TanggalMulaiPendaftaran, data.TanggalAkhirPendaftaran!]}
                                onSuccess={fetchData} />
                            {
                                data?.FotoPelatihan != "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" && <>
                                    {new Date() <= new Date(data!.TanggalMulaiPelatihan) &&
                                        (data!.Status == "Publish" ? (
                                            data!.UserPelatihan.length == 0 ? (
                                                <PublishButton
                                                    title="Take Down"
                                                    statusPelatihan={data?.Status ?? ""}
                                                    idPelatihan={data!.IdPelatihan.toString()}
                                                    handleFetchingData={
                                                        fetchData
                                                    }
                                                />
                                            ) : (
                                                <></>
                                            )
                                        ) : (
                                            <PublishButton
                                                title="Publish"
                                                statusPelatihan={data?.Status ?? ""}
                                                idPelatihan={data!.IdPelatihan.toString()}
                                                handleFetchingData={
                                                    fetchData
                                                }
                                            />
                                        ))
                                    }</>
                            }

                        </div>

                        <div className="w-full ">
                            <p className="font-medium text-gray-600 mb-2">
                                Detail  :
                            </p>
                            {
                                data?.FotoPelatihan != "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ?
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <InfoItem label="Pendaftaran Dibuka" value={generateTanggalPelatihan(data.TanggalMulaiPendaftaran)} />
                                        <InfoItem label="Pendaftaran Ditutup" value={generateTanggalPelatihan(data.TanggalAkhirPendaftaran!)} />
                                        <div className="flex flex-shrink-0 flex-col p-3 bg-white rounded-lg shadow-sm border border-gray-100 h-fit">
                                            <span className="text-xs font-medium text-gray-500">Flyer/Poster</span>
                                            <span className="text-sm font-semibold text-gray-800 mt-1">
                                                {
                                                    data.FotoPelatihan == "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? <></> : <Image
                                                        className="w-[400px] h-full object-cover mx-auto flex-shrink-0"
                                                        alt={data.NamaPelatihan}
                                                        src={replaceUrl(data.FotoPelatihan)}
                                                        width={400}
                                                        height={400}
                                                    />
                                                }
                                            </span>
                                        </div>
                                        <InfoItem label="Deskripsi" value={data.DetailPelatihan} />
                                    </div> : <div className="py-10 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-1">
                                        <MdLock className='w-14 h-14 text-gray-600' />
                                        <p className="text-gray-500 font-normal text-center">
                                            Harap Mengedit Informasi Publish Terlebih Dahulu Untuk Menampilkan Informasi Pelatihan Pada Halaman Pencarian E-LAUT Untuk Masyarakat
                                        </p>
                                    </div>
                            }

                        </div>
                    </div>

                </AccordionSection>

                <AccordionSection title="👥 Peserta Pelatihan">
                    <div className="flex flex-col w-full gap-4">
                        <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                            <p className="font-medium text-gray-600">
                                Action :
                            </p>
                            <ImportPesertaAction
                                idPelatihan={data?.IdPelatihan.toString()}
                                statusApproval={data?.StatusApproval}
                                onSuccess={fetchData}
                                onAddHistory={(msg) =>
                                    handleAddHistoryTrainingInExisting(
                                        data!,
                                        msg,
                                        Cookies.get("Eselon"),
                                        Cookies.get("SATKER_BPPP")
                                    )
                                }
                            />
                        </div>

                        <div className="w-full ">
                            <p className="font-medium text-gray-600 mb-2">
                                Detail  :
                            </p>
                            {
                                data?.FotoPelatihan != "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ?
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <InfoItem label="Kuota Peserta" value={data.KoutaPelatihan} />
                                            <InfoItem label="Jumlah Peserta" value={data.UserPelatihan.length.toString()} />
                                        </div>
                                        <UserPelatihanTable data={data.UserPelatihan} />
                                    </div>
                                    : <div className="py-10 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-1">
                                        <MdLock className='w-14 h-14 text-gray-600' />
                                        <p className="text-gray-500 font-normal text-center">
                                            Harap Mengedit Informasi Publish Terlebih Dahulu Untuk Menampilkan Informasi Pelatihan Pada Halaman Pencarian E-LAUT Untuk Masyarakat
                                        </p>
                                    </div>
                            }

                        </div>
                    </div>

                </AccordionSection>


                <AccordionSection title="📂 Dokumentasi & Administrasi">
                    <SectionGrid>
                        <InfoItem label="Deskripsi" value={data.DetailPelatihan} />
                    </SectionGrid>
                </AccordionSection>

                {/* <AccordionSection title="⚙️ Metadata">
                    <SectionGrid>
                        <InfoItem label="ID Pelatihan" value={data.IdPelatihan.toString()} />
                        <InfoItem label="ID Lemdik" value={data.IdLemdik} />
                        <InfoItem label="ID Sarana Prasarana" value={data.IdSaranaPrasarana} />
                        <InfoItem label="ID Konsumsi" value={data.IdKonsumsi} />
                        <InfoItem label="Created At" value={data.CreateAt} />
                        <InfoItem label="Updated At" value={data.UpdateAt} />
                        <InfoItem label="Status Approval" value={data.StatusApproval} />
                        <InfoItem label="Status Penerbitan" value={data.StatusPenerbitan} />
                        <InfoItem label="Pemberitahuan Diterima" value={data.PemberitahuanDiterima} />
                        <InfoItem label="Is Revisi" value={data.IsRevisi} />
                        <InfoItem label="Is Sematkan" value={data.IsSematkan} />
                    </SectionGrid>
                </AccordionSection> */}
            </Accordion>
        </div>
    );
};

const AccordionSection = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <AccordionItem
        value={title}
        className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white"
    >
        <AccordionTrigger className="px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition">
            {title}
        </AccordionTrigger>
        <AccordionContent className="px-6 py-4 bg-gray-50">
            {children}
        </AccordionContent>
    </AccordionItem>
);

const SectionGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">{children}</div>
);

const InfoItem = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm border border-gray-100">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {
            value?.includes('<p>') ?
                <div
                    className="prose  text-gray-800 text-sm leading-relaxed max-w-none"
                >
                    <div dangerouslySetInnerHTML={{ __html: value }} />
                </div> : <span className="text-sm font-semibold text-gray-800 mt-1">
                    {value || "-"}
                </span>
        }
    </div>
);

export default PelatihanDetail;
