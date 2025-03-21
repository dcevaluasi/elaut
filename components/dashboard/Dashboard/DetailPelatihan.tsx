"use client";

import React from "react";

import { HiLockClosed, HiMiniUserGroup, HiUserGroup } from "react-icons/hi2";
import { TbDatabase, TbSchool } from "react-icons/tb";
import { FiEdit2, FiUploadCloud } from "react-icons/fi";

import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { elautBaseUrl } from "@/constants/urls";

import { FaBookOpen } from "react-icons/fa6";
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
import TTDSertifikat from "./pelatihan/TTDSertifikat";
import { Button } from "@/components/ui/button";
import DeleteButton from "./Actions/DeleteButton";
import { MateriButton, PublishButton } from "./Actions";
import { ESELON_1, ESELON_2 } from "@/constants/nomenclatures";

function DetailPelatihan() {
  const isAdminBalaiPelatihan: boolean = usePathname().includes('lemdiklat')
  const isOperatorBalaiPelatihan = Cookies.get('SATKER_BPPP')?.includes('BPPP') || false
  const isOperatorPusatPelatihan = Cookies.get('Status')?.includes('Operator Pusat') || false
  const isLemdiklat = Cookies.get('Status') === 'Lemdiklat'
  const isSupervisor = Cookies.get('Status') === 'Supervisor'
  const paths = usePathname().split("/");

  const isEselonI = Cookies.get('Jabatan')?.includes(ESELON_1.fullName)
  const isEselonII = Cookies.get('Jabatan')?.includes(ESELON_2.fullName)

  const idPelatihan = decryptValue(paths[paths.length - 1]);
  const kodePelatihan = paths[paths.length - 2];
  const [pelatihan, setPelatihan] = React.useState<PelatihanMasyarakat | null>(
    null
  );

  const handleFetchDetailPelatihan = async () => {
    try {
      const response = await axios.get(
        `${elautBaseUrl}/getPelatihanUser?idPelatihan=${idPelatihan}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      setPelatihan(response.data);
      console.log({ response });
    } catch (error) {
      console.error("LEMDIK INFO: ", error);
    }
  };

  React.useEffect(() => {
    handleFetchDetailPelatihan();

  }, []);

  const typeRole = Cookies.get("XSRF093");

  return (
    <section className="pb-20">
      <div className="flex flex-col w-full">
        <div className="flex flex-row gap-2 items-center">
          <header
            aria-label="page caption"
            className="flex-row w-full flex h-20 items-center gap-2 bg-gray-100 border-t px-4"
          >
            <TbSchool className="text-3xl" />
            <div className="flex flex-col">
              <h1 id="page-caption" className="font-semibold text-lg">
                {pelatihan != null ? pelatihan.NamaPelatihan : ""}
              </h1>
              {pelatihan != null ? (
                <p className="font-medium text-gray-400 text-sm">
                  {" "}
                  {pelatihan != null ? pelatihan!.KodePelatihan : ""} •{" "}
                  {pelatihan != null ? pelatihan!.BidangPelatihan : ""} •
                  Mendukung Program Terobosan{" "}
                  {pelatihan != null ? pelatihan!.DukunganProgramTerobosan : ""}
                </p>
              ) : (
                <p></p>
              )}
            </div>
          </header>
        </div>
      </div>

      {pelatihan != null && (
        <div className=' mt-5 w-full gap-0'>
          <div className="px-4 w-full mb-4">
            <div className="w-full border border-gray-200 rounded-xl">
              <div className="bg-gray-100 p-4 w-full ">
                <h2 className="font-calsans text-xl">
                  Actions
                </h2>
              </div>
              <table className="w-full">
                <tr className="border-b border-b-gray-200 w-full">

                  <td className="p-4 w-fit gap-1 flex justify-start ">

                    <><Link
                      title={pelatihan!.UserPelatihan.length != 0 ? 'Peserta Pelatihan' : 'Upload Data Peserta'}
                      href={`/admin/${usePathname().includes('lemdiklat')
                        ? "lemdiklat"
                        : "pusat"
                        }/pelatihan/${pelatihan.KodePelatihan
                        }/peserta-pelatihan/${encryptValue(
                          pelatihan.IdPelatihan
                        )}`}
                      target="_blank"
                      className="  shadow-sm bg-green-500 hover:bg-green-500 text-neutral-100  hover:text-neutral-100 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2"
                    >
                      <HiUserGroup className="h-5 w-5 " /> Data Peserta Pelatihan
                    </Link>

                      {
                        isOperatorPusatPelatihan || isOperatorBalaiPelatihan ? <>
                          <GenerateNoSertifikatButton
                            idPelatihan={pelatihan!.IdPelatihan.toString()}
                            pelatihan={pelatihan!}
                            handleFetchingData={
                              handleFetchDetailPelatihan
                            }
                          />
                          <NoSertifikatButton
                            idPelatihan={pelatihan!.IdPelatihan.toString()}
                            pelatihan={pelatihan!}
                            handleFetchingData={
                              handleFetchDetailPelatihan
                            }
                          />
                          {new Date() >= new Date(pelatihan!.TanggalMulaiPelatihan) && (
                            <CloseButton
                              pelatihan={pelatihan!}
                              statusPelatihan={pelatihan?.Status ?? ""}
                              idPelatihan={pelatihan!.IdPelatihan.toString()}
                              handleFetchingData={handleFetchDetailPelatihan}
                            />
                          )}</> : <></>
                      }

                      <HistoryButton
                        pelatihan={pelatihan!}
                        statusPelatihan={pelatihan?.Status ?? ""}
                        idPelatihan={pelatihan!.IdPelatihan.toString()}
                        handleFetchingData={
                          handleFetchDetailPelatihan
                        }
                      />

                      {
                        isOperatorBalaiPelatihan && <>
                          {(pelatihan!.TanggalMulaiPelatihan == "" && pelatihan!.StatusApproval != 'Selesai') && (
                            <Button
                              onClick={() => {

                              }}
                              title="Edit Pelatihan"
                              variant="outline"
                              className="ml-auto w-full hover:bg-yellow-300 bg-yellow-300 hover:text-neutral-700 text-neutral-700 duration-700"
                            >
                              <FiEdit2 className="h-5 w-5" /> Edit Pelatihan
                            </Button>
                          )}

                          {new Date() <= new Date(pelatihan!.TanggalMulaiPelatihan) &&
                            (pelatihan!.Status == "Publish" ? (
                              pelatihan!.UserPelatihan.length == 0 ? (
                                <PublishButton
                                  title="Take Down"
                                  statusPelatihan={pelatihan?.Status ?? ""}
                                  idPelatihan={pelatihan!.IdPelatihan.toString()}
                                  handleFetchingData={
                                    handleFetchDetailPelatihan
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
                                  handleFetchDetailPelatihan
                                }
                              />
                            ))
                          }

                          {pelatihan!.UserPelatihan.length == 0 && pelatihan!.MateriPelatihan.length == 0 && pelatihan!.SarprasPelatihan == null && pelatihan!.Status != "Publish" && (
                            <>
                              <DeleteButton
                                idPelatihan={pelatihan!.IdPelatihan.toString()}
                                pelatihan={pelatihan}
                                handleFetchingData={
                                  handleFetchDetailPelatihan
                                }
                              />
                            </>
                          )}

                          <GenerateNoSertifikatButton
                            idPelatihan={pelatihan!.IdPelatihan.toString()}
                            pelatihan={pelatihan!}
                            handleFetchingData={
                              handleFetchDetailPelatihan
                            }
                          />
                        </>
                      }

                      {
                        pelatihan!.PemberitahuanDiterima === 'Pengajuan Telah Dikirim ke Ka BPPSDM KP' && isEselonI && <TTDSertifikat dataPelatihan={pelatihan!} handleFetchData={handleFetchDetailPelatihan} />
                      }

                      {
                        pelatihan!.PemberitahuanDiterima === 'Pengajuan Telah Dikirim ke Kapuslat KP' && isEselonII && <TTDSertifikat dataPelatihan={pelatihan!} handleFetchData={handleFetchDetailPelatihan} />
                      }

                    </>
                  </td>
                </tr>
              </table>
            </div>
          </div>
          <div className=" w-full mb-4"></div>
        </div>

      )}

      {pelatihan != null && (isOperatorBalaiPelatihan || isOperatorPusatPelatihan) && (
        <div className=' mt-5 w-full gap-0'>
          <div className="px-4 w-full mb-4">
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
                      {
                        isOperatorPusatPelatihan || isOperatorBalaiPelatihan ? <>
                          <MateriButton
                            idPelatihan={pelatihan!.IdPelatihan.toString()}
                            handleFetchingData={
                              handleFetchDetailPelatihan
                            }
                            data={pelatihan!}
                          />
                          <Link
                            title="Bank Soal"
                            href={`/admin/lemdiklat/pelatihan/${pelatihan!.KodePelatihan
                              }/bank-soal/${encryptValue(pelatihan!.IdPelatihan)}`}
                            className="border border-blue-900  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-900 hover:bg-blue-900 hover:text-white text-white rounded-md"
                          >
                            <TbDatabase className="h-5 w-5" /> Bank Soal Pre-Test & Post-Test
                          </Link></> : <></>
                      }
                    </>
                  </td>
                </tr>
              </table>
            </div>
          </div>
          <div className=" w-full mb-4"></div>
        </div>

      )}
      <div className="grid grid-cols-2 w-full gap-0">

        {pelatihan != null && (
          <div className="px-4 w-full">
            <div className="w-full border border-gray-200 rounded-xl">
              <div className="bg-gray-100 p-4 w-full ">
                <h2 className="font-calsans text-xl">
                  Informasi Pelatihan
                </h2>
              </div>
              <table className="w-full">
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">Nama Pelatihan</td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.NamaPelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">Kode Pelatihan</td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.KodePelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Penyelenggara Pelatihan
                  </td>
                  <td className="p-4 w-[80%] ">
                    {pelatihan!.PenyelenggaraPelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Lokasi Pelatihan
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.LokasiPelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Waktu Pelaksanaan
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan.TanggalMulaiPelatihan !== "" &&
                      pelatihan.TanggalBerakhirPelatihan !== "" ? (
                      <>
                        {generateTanggalPelatihan(
                          pelatihan.TanggalMulaiPelatihan
                        )}{" "}
                        s.d.{" "}
                        {generateTanggalPelatihan(
                          pelatihan.TanggalBerakhirPelatihan
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Metode Pelaksanaan
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.PelaksanaanPelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Dukungan Program Terobosan
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.DukunganProgramTerobosan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Program dan Jenis Program
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.JenisProgram || ""} &  {pelatihan!.Program || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">Jenis Pelatihan</td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.JenisPelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Bidang Pelatihan
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.BidangPelatihan || ""}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Surat Pemberitahuan
                  </td>
                  <td className="p-4 w-2/3">
                    <Link
                      target="_blank"
                      className="text-blue-500 underline w-2/3"
                      href={`${isLemdiklat ? pelatihan!.SuratPemberitahuan || "" : pelatihan!.SilabusPelatihan || ""}`}
                    >
                      {isLemdiklat ? pelatihan!.SuratPemberitahuan || "" : pelatihan!.SilabusPelatihan || ""}
                    </Link>

                  </td>
                </tr>
              </table>
            </div>
          </div>
        )}
        {pelatihan != null && (
          <div className="px-4 w-full">
            <div className=" w-full border border-gray-200 rounded-xl">
              <div className="bg-gray-100 p-4 w-full ">
                <h2 className="font-calsans text-xl">
                  Informasi Penerbitan Sertifikat
                </h2>
              </div>
              <table className="w-full">
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Jenis Sertifikat
                  </td>
                  <td className="p-4 w-2/3">{pelatihan!.JenisSertifikat}</td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Penandatangan Sertifikat
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.TtdSertifikat == ""
                      ? "-"
                      : pelatihan!.TtdSertifikat}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">No Sertifikat</td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.NoSertifikat == ""
                      ? "-"
                      : pelatihan!.NoSertifikat}
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">Dokumen Permohonan Penerbitan</td>
                  <td className="p-4 w-2/3">
                    <Link
                      target="_blank"
                      className="text-blue-500 underline"
                      href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/beritaAcara/pelatihan/${pelatihan!.BeritaAcara
                        }`}
                    >
                      {pelatihan!.BeritaAcara}
                    </Link>
                  </td>
                </tr>
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Status Penerbitan
                  </td>
                  <td className="py-7 px-5 flex items-center">
                    <ShowingBadge data={pelatihan} isFlying={false} isSupervisor={isSupervisor} />
                  </td>
                </tr>
              </table>
            </div>
          </div>
        )}
      </div>

      {pelatihan != null && (
        <div className="px-4 w-full mt-5">
          <div className="w-full border border-gray-200 rounded-xl">
            <div className="bg-gray-100 p-4 w-full ">
              <h2 className="font-calsans text-xl">
                Informasi Pendaftaran
              </h2>
            </div>
            <table className="w-full">
              {pelatihan.TanggalMulaiPendaftaran != "" && (
                <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Tanggal Pendaftaran
                  </td>
                  <td className="p-4 w-2/3">
                    {generateTanggalPelatihan(
                      pelatihan.TanggalMulaiPendaftaran
                    )}{" "}
                    s.d.{" "}
                    {generateTanggalPelatihan(
                      pelatihan!.TanggalBerakhirPendaftaran
                    )}
                  </td>
                </tr>
              )}

              {
                isLemdiklat && <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">Tarif Pelatihan</td>
                  <td className="p-4 w-2/3">
                    {formatToRupiah(pelatihan!.HargaPelatihan) || ""}
                  </td>
                </tr>
              }

              <tr className="border-b border-b-gray-200 w-full">
                <td className="font-semibold p-4 w-[20%]">Asal Peserta</td>
                <td className="p-4 w-2/3">{pelatihan!.AsalPelatihan}</td>
              </tr>

              {
                isLemdiklat && <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">Kuota Peserta</td>
                  <td className="p-4 w-2/3">
                    {pelatihan!.KoutaPelatihan} Peserta
                  </td>
                </tr>
              }

              <tr className="border-b border-b-gray-200 w-full">
                <td className="font-semibold p-4 w-[20%]">Jumlah Terdaftar</td>
                <td className="p-4 w-2/3">
                  {pelatihan!.UserPelatihan.length} Peserta
                </td>
              </tr>
            </table>
          </div>
        </div>
      )}

      {pelatihan != null && (
        <div className="px-4 w-full mt-5">
          <div className="w-full border border-gray-200 rounded-xl">
            <div className="bg-gray-100 p-4 w-full ">
              <h2 className="font-calsans text-xl">
                Informasi Teknis Pelatihan
              </h2>
            </div>
            <table className="w-full">
              {
                isLemdiklat && <tr className="border-b border-b-gray-200 w-full ">
                  <td className="font-semibold p-4 w-[20%] h-fit flex">
                    Instruktur
                  </td>
                  <td className="p-4 w-2/3">
                    {pelatihan.Instruktur != "" ? (
                      <div className="flex flex-col gap-1">
                        {generateInstrukturName(pelatihan.Instruktur).map(
                          (instruktur, index) => (
                            <span key={index}>
                              {index + 1}. {instruktur}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <>-</>
                    )}
                  </td>
                </tr>
              }
              {
                isLemdiklat && <tr className="border-b border-b-gray-200 w-full">
                  <td className="font-semibold p-4 w-[20%]">
                    Silabus/Modul/Bahan Ajar Pelatihan
                  </td>
                  <td className="p-4 w-2/3">
                    <Link
                      target="_blank"
                      className="text-blue-500 underline"
                      href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/silabus/pelatihan/${pelatihan!.SilabusPelatihan
                        }`}
                    >
                      {pelatihan!.SilabusPelatihan}
                    </Link>
                  </td>
                </tr>
              }

            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default DetailPelatihan;
