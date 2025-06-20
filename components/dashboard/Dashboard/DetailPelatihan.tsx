"use client";

import React from "react";

import { HiLockClosed, HiMiniUserGroup, HiUserGroup } from "react-icons/hi2";
import { TbDatabase, TbSchool } from "react-icons/tb";
import { FiEdit2, FiUploadCloud } from "react-icons/fi";

import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { elautBaseUrl, urlFileSilabus, urlFileSuratPemberitahuan } from "@/constants/urls";

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
  const isOperatorBalaiPelatihan = Cookies.get('SATKER_BPPP')?.includes('BPPP') || false
  const isOperatorPusatPelatihan = Cookies.get('Status')?.includes('Operator Pusat') || false
  const isLemdiklat = Cookies.get('Status') === 'Lemdiklat'
  const paths = usePathname().split("/");

  const isEselonI = Cookies.get('Jabatan')?.includes(ESELON_1.fullName)
  const isEselonII = Cookies.get('Jabatan')?.includes(ESELON_2.fullName)

  const idPelatihan = decryptValue(paths[paths.length - 1]);
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

      {pelatihan != null && <div className="space-y-6 p-4">
        {/* Informasi Pelatihan & Sertifikat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informasi Pelatihan */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-x-scroll">
            <div className="bg-gray-100 p-4 w-full">
              <h2 className="font-calsans text-xl text-gray-800">Informasi Pelatihan</h2>
            </div>
            <table className="w-full text-sm text-gray-700">
              <tbody>
                <InfoRow label="Nama Pelatihan" value={pelatihan?.NamaPelatihan} />
                <InfoRow label="Kode Pelatihan" value={pelatihan?.KodePelatihan} />
                <InfoRow label="Penyelenggara" value={pelatihan?.PenyelenggaraPelatihan} />
                <InfoRow label="Lokasi" value={pelatihan?.LokasiPelatihan} />
                <InfoRow label="Waktu Pelaksanaan" value={
                  pelatihan?.TanggalMulaiPelatihan && pelatihan?.TanggalBerakhirPelatihan ?
                    `${generateTanggalPelatihan(pelatihan.TanggalMulaiPelatihan)} s.d. ${generateTanggalPelatihan(pelatihan.TanggalBerakhirPelatihan)}` : "-"
                } />
                <InfoRow label="Metode" value={pelatihan?.PelaksanaanPelatihan} />
                <InfoRow label="Dukungan Program" value={pelatihan?.DukunganProgramTerobosan} />
                <InfoRow label="Program & Jenis" value={`${pelatihan?.JenisProgram || "-"} & ${pelatihan?.Program || "-"}`} />
                <InfoRow label="Jenis Pelatihan" value={pelatihan?.JenisPelatihan} />
                <InfoRow label="Bidang" value={pelatihan?.BidangPelatihan} />
                <InfoRow
                  label="Surat Pemberitahuan Diklat"
                  value={
                    <a href={`${urlFileSilabus}/${pelatihan?.SilabusPelatihan}`}
                      target="_blank"
                      className="text-blue-600 underline break-words">
                      {`${urlFileSilabus}/${pelatihan?.SilabusPelatihan}`}
                    </a>
                  }
                />
              </tbody>
            </table>
          </div>

          {/* Informasi Sertifikat */}
          <div className="bg-white rounded-2xl h-fit shadow-md border border-gray-200 overflow-x-scroll">
            <div className="bg-gray-100 p-4 w-full">
              <h2 className="font-calsans text-xl text-gray-800">Informasi Penerbitan Sertifikat</h2>
            </div>
            <table className="w-full text-sm text-gray-700">
              <tbody>
                {
                  pelatihan!.KeteranganTandaTangan == '' && <tr className="border-t border-gray-200">
                    <td className="p-4 font-semibold text-gray-600 w-[35%]">Status</td>
                    <td className="p-4">
                      <ShowingBadge data={pelatihan!} isFlying={false} />
                    </td>
                  </tr>
                }

                <InfoRow label="Penandatangan" value={pelatihan?.TtdSertifikat || "-"} />
                <InfoRow
                  label="Dokumen Permohonan"
                  value={
                    <a href={`${urlFileSuratPemberitahuan}/${pelatihan?.SuratPemberitahuan}`}
                      target="_blank"
                      className="text-blue-600 underline break-words">
                      {`${urlFileSuratPemberitahuan}/${pelatihan?.SuratPemberitahuan}`}
                    </a>
                  }
                />
                <InfoRow label="Format Sertifikat" value={pelatihan?.JenisSertifikat} />


              </tbody>
            </table>
          </div>
        </div>

        {/* Informasi Pendaftaran */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 p-4">
            <h2 className="font-calsans text-xl text-gray-800">Informasi Pendaftaran</h2>
          </div>
          <table className="w-full text-sm text-gray-700">
            <tbody>
              {pelatihan?.TanggalMulaiPendaftaran && (
                <InfoRow
                  label="Tanggal Pendaftaran"
                  value={`${generateTanggalPelatihan(pelatihan.TanggalMulaiPendaftaran)} s.d. ${generateTanggalPelatihan(pelatihan.TanggalBerakhirPendaftaran)}`}
                />
              )}
              {isLemdiklat && (
                <>
                  <InfoRow label="Tarif Pelatihan" value={formatToRupiah(pelatihan?.HargaPelatihan!)} />
                  <InfoRow label="Kuota Peserta" value={`${pelatihan?.KoutaPelatihan} Peserta`} />
                </>
              )}
              <InfoRow label="Asal Peserta" value={pelatihan?.AsalPelatihan} />
              <InfoRow label="Jumlah Terdaftar" value={`${pelatihan?.UserPelatihan.length} Peserta`} />
            </tbody>
          </table>
        </div>
      </div>}
    </section>
  );
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <tr className="border-t border-gray-200 text-base">
    <td className="p-4 font-semibold text-gray-600 w-[35%]">{label}</td>
    <td className="p-4 break-words">{value || "-"}</td>
  </tr>
);


export default DetailPelatihan;
