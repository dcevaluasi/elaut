"use client";

import React from "react";

import { usePathname } from "next/navigation";

import Link from "next/link";
import { elautBaseUrl, fileBaseUrl } from "@/constants/urls";

import axios from "axios";
import { UserPelatihan } from "@/types/product";
import { generateTanggalPelatihan } from "@/utils/text";
import { decryptValue, formatToRupiah } from "@/lib/utils";
import DefaultLayout from "@/components/dashboard/Layouts/DefaultLayout";
import { User } from "@/types/user";
import ValidasiPesertaButton from "@/components/dashboard/Dashboard/Actions/ValidasiPesertaButton";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { HiUserGroup } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { MdOutlineClose } from "react-icons/md";

function DetailPeserta() {
  const paths = usePathname().split("/");
  const idPeserta = decryptValue(paths[paths.length - 1]);
  const idPesertaPelatihan = decryptValue(paths[paths.length - 2]);
  const [peserta, setPeserta] = React.useState<User | null>(null);
  const [pesertaPelatihan, setPesertaPelatihan] =
    React.useState<UserPelatihan | null>(null);
  const handleFetchDetailPeserta = async () => {
    try {
      const response = await axios.get(
        `${elautBaseUrl}/users/getUsersByIdNoJwt?id=${idPeserta}`
      );
      setPeserta(response.data);
      const filteredPelatihan = response.data.Pelatihan.filter(
        (item: UserPelatihan) =>
          item.IdUserPelatihan.toString() === idPesertaPelatihan
      );
      setPesertaPelatihan(filteredPelatihan[0]);
      console.log({ response });
    } catch (error) {
      console.error("LEMDIK INFO: ", error);
    }
  };

  React.useEffect(() => {
    handleFetchDetailPeserta();
  }, []);

  console.log({ peserta });
  console.log({ pesertaPelatihan });
  console.log({ idPesertaPelatihan });
  console.log({ idPeserta });

  return (
    <LayoutAdminElaut>
      <section className="flex-1 flex flex-col">
        <div className="flex flex-col w-full">
          <div className="flex flex-row gap-2 items-center">
            <header
              aria-label="page caption"
              className="flex-row w-full flex h-20 items-center gap-2 bg-gray-100 border-t px-4"
            >
              <HiUserGroup className="text-3xl" />
              <div className="flex flex-col">
                <h1 id="page-caption" className="font-semibold text-lg">
                  Detail Peserta Pelatihan
                </h1>
                <p className="font-medium text-gray-400 text-base">
                  Verifikasi, Monitoring, dan Lihat Data Peserta peserta!
                </p>
              </div>
            </header>
          </div>
        </div>
        <main className="w-full h-full">
          <section className="mx-3">
            <div className="w-full flex gap-5">
              {peserta != null && (
                <div className="mt-4 md:mt-6 2xl:mt-7.5 w-full">
                  <div className="w-full border border-gray-200 rounded-xl">
                    <div className="bg-gray-100 p-4 w-full ">
                      <h2 className="font-bold font-calsans text-xl">
                        Informasi Peserta
                      </h2>
                    </div>
                    <table className="w-full">
                      <tr className="border-b border-b-gray-200 w-full">
                        <td className="font-semibold p-4 w-[20%]">
                          Nama Lengkap
                        </td>
                        <td className="p-4 w-2/3">{peserta!.Nama || ""}</td>
                      </tr>
                      <tr className="border-b border-b-gray-200 w-full">
                        <td className="font-semibold p-4 w-[20%]">NIK</td>
                        <td className="p-4 w-2/3">{peserta!.Nik || ""}</td>
                      </tr>
                      <tr className="border-b border-b-gray-200 w-full">
                        <td className="font-semibold p-4 w-[20%]">
                          No Telepon/WA
                        </td>
                        <td className="p-4 w-2/3">
                          {" "}
                          <Link
                            target="_blank"
                            className="text-blue-500"
                            href={`https://wa.me/62${peserta!.NoTelpon}`}
                          >
                            62{peserta!.NoTelpon || ""}
                          </Link>{" "}
                        </td>
                      </tr>
                      <tr className="border-b border-b-gray-200 w-full">
                        <td className="font-semibold p-4 w-[20%]">Alamat</td>
                        <td className="p-4 w-2/3">{peserta!.Alamat || ""}</td>
                      </tr>
                      <tr className="border-b border-b-gray-200 w-full">
                        <td className="font-semibold p-4 w-[20%]">Email</td>
                        <td className="p-4 w-2/3">{peserta!.Email || "-"}</td>
                      </tr>
                      <tr className="border-b border-b-gray-200 w-full">
                        <td className="font-semibold p-4 w-[20%]">
                          Tempat dan Tanggal Lahir
                        </td>
                        <td className="p-4 w-2/3">
                          {peserta!.TempatLahir || "-"}.{" "}
                          {generateTanggalPelatihan(peserta!.TanggalLahir) ||
                            "-"}
                        </td>
                      </tr>
                      <tr className="border-b border-b-gray-200 w-full">
                        <td className="font-semibold p-4 w-[20%]">
                          Jenis Kelamin
                        </td>
                        <td className="p-4 w-2/3">
                          {peserta!.JenisKelamin || "-"}
                        </td>
                      </tr>
                      <tr className="border-b border-b-gray-200 w-full">
                        <td className="font-semibold p-4 w-[20%]">Agama</td>
                        <td className="p-4 w-2/3">{peserta!.Agama || "-"}</td>
                      </tr>
                      <tr className="border-b border-b-gray-200 w-full">
                        <td className="font-semibold p-4 w-[20%]">
                          Status Menikah
                        </td>
                        <td className="p-4 w-2/3">
                          {peserta!.StatusMenikah || "-"}
                        </td>
                      </tr>
                      <tr className="border-b border-b-gray-200 w-full">
                        <td className="font-semibold p-4 w-[20%]">
                          Golongan Darah
                        </td>
                        <td className="p-4 w-2/3">
                          {peserta!.GolonganDarah || "-"}
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-5">
                {peserta != null && (
                  <div className="mt-4 md:mt-6 2xl:mt-7.5 w-full">
                    <div className="w-full border border-gray-200 rounded-xl">
                      <div className="bg-gray-100 p-4 w-full ">
                        <h2 className="font-bold font-calsans text-xl leading-none">
                          Status Verifikasi
                        </h2>
                      </div>
                      <table className="w-full">
                        <tr className="border-b border-b-gray-200 w-full flex items-center">
                          <td className="font-semibold p-4">Status</td>
                          {pesertaPelatihan?.Keterangan == "Valid" ? (
                            <Button
                              variant="outline"
                              className="bg-blue-600 hover:bg-blue-600 duration-700 hover:text-white text-neutral-100"
                            >
                              <RiVerifiedBadgeFill className="h-4 w-4 " /> Valid
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="bg-rose-600 hover:bg-rose-600 duration-700 hover:text-white text-neutral-100"
                              >
                                <MdOutlineClose className="h-4 w-4 " />
                                Tidak Valid
                              </Button>
                            </>
                          )}
                        </tr>
                      </table>
                    </div>
                  </div>
                )}
                {peserta != null && (
                  <div className=" w-full">
                    <div className="w-full border border-gray-200 rounded-xl">
                      <div className="bg-gray-100 p-4 w-full ">
                        <h2 className="font-bold font-calsans text-xl leading-none">
                          Pembayaran Pelatihan
                        </h2>
                      </div>
                      <table className="w-full">
                        <tr className="border-b border-b-gray-200 w-full">
                          <td className="font-semibold p-4 w-[20%]">
                            Metode Pembayaran
                          </td>
                          <td className="p-4 w-2/3">
                            {" "}
                            {pesertaPelatihan!.MetodoPembayaran}
                          </td>
                        </tr>
                        <tr className="border-b border-b-gray-200 w-full">
                          <td className="font-semibold p-4 w-[20%]">
                            Jumlah Pembayaran
                          </td>
                          <td className="p-4 w-2/3">
                            {formatToRupiah(
                              parseInt(pesertaPelatihan!.TotalBayar)
                            )}
                          </td>
                        </tr>
                        <tr className="border-b border-b-gray-200 w-full">
                          <td className="font-semibold p-4 w-[20%]">
                            Bukti Pembayaran
                          </td>
                          <td className="p-4 w-2/3">
                            {" "}
                            <Link
                              target="_blank"
                              className="text-blue-500"
                              href={
                                fileBaseUrl +
                                "/bukti-bayar/" +
                                pesertaPelatihan!.BuktiBayar
                              }
                            >
                              {fileBaseUrl +
                                "/bukti-bayar/" +
                                pesertaPelatihan!.BuktiBayar}
                            </Link>{" "}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {peserta != null && (
              <div className="mt-4 md:mt-6 2xl:mt-7.5 w-full">
                <div className="w-full border border-gray-200 rounded-xl">
                  <div className="bg-gray-100 p-4 w-full ">
                    <h2 className="font-bold font-calsans text-xl leading-none">
                      Dokumen Kelengkapan atau <br /> Persyaratan Peserta
                    </h2>
                  </div>
                  <table className="w-full">
                    <tr className="border-b border-b-gray-200 w-full">
                      <td className="font-semibold p-4 w-[20%]">KTP</td>
                      <td className="p-4 w-2/3">
                        {" "}
                        <Link
                          target="_blank"
                          className="text-blue-500"
                          href={peserta!.Ktp}
                        >
                          {peserta!.Ktp || "-"}
                        </Link>{" "}
                      </td>
                    </tr>
                    <tr className="border-b border-b-gray-200 w-full">
                      <td className="font-semibold p-4 w-[20%]">
                        Kartu Keluarga
                      </td>
                      <td className="p-4 w-2/3">
                        {" "}
                        <Link
                          target="_blank"
                          className="text-blue-500"
                          href={peserta!.KK}
                        >
                          {peserta!.KK || "-"}
                        </Link>{" "}
                      </td>
                    </tr>
                    <tr className="border-b border-b-gray-200 w-full">
                      <td className="font-semibold p-4 w-[20%]">Ijazah</td>
                      <td className="p-4 w-2/3">
                        {" "}
                        <Link
                          target="_blank"
                          className="text-blue-500"
                          href={peserta!.Ijazah}
                        >
                          {peserta!.Ijazah || "-"}
                        </Link>{" "}
                      </td>
                    </tr>
                    <tr className="border-b border-b-gray-200 w-full">
                      <td className="font-semibold p-4 w-[20%]">
                        Surat Kesehatan
                      </td>
                      <td className="p-4 w-2/3">
                        {" "}
                        <Link
                          target="_blank"
                          className="text-blue-500"
                          href={peserta!.SuratKesehatan}
                        >
                          {peserta!.SuratKesehatan || "-"}
                        </Link>{" "}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            )}

            {peserta != null && (
              <div className={`w-full flex items-center justify-center gap-1`}>
                <ValidasiPesertaButton
                  idUser={idPesertaPelatihan}
                  peserta={pesertaPelatihan!}
                  handleFetchingData={handleFetchDetailPeserta}
                />
              </div>
            )}
          </section>
        </main>
      </section>
    </LayoutAdminElaut>
  );
}

export default DetailPeserta;
