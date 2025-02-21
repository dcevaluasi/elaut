"use client";

import React from "react";
import { BsSendArrowUp } from "react-icons/bs";
import {
  TbBroadcast,
  TbFileCertificate,
  TbListDetails,
  TbSignature,
} from "react-icons/tb";
import TableDataPemberitahuanPelatihan from "../../Pelatihan/TableDataPemberitahuanPelatihan";
import { getNumberFromURLDetailPelatihanAdmin } from "@/utils/pelatihan";
import { usePathname, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { elautBaseUrl, fileBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import Link from "next/link";
import Image from "next/image";
import { generateFullNameBalai, generateTanggalPelatihan } from "@/utils/text";

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
import Toast from "@/components/toast";
import { Button } from "@/components/ui/button";

import { HiUserGroup } from "react-icons/hi2";
import Cookies from "js-cookie";
import { AiFillSignature } from "react-icons/ai";
import { MdOutlinePodcasts } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { decryptValue } from "@/lib/utils";

const DetailPelatihan: React.FC = () => {
  const [dataPelatihan, setDataPelatihan] =
    React.useState<PelatihanMasyarakat | null>(null);

  const idPelatihan = decryptValue(getNumberFromURLDetailPelatihanAdmin(usePathname())!.toString());
  const handleFetchPelatihanById = async () => {
    try {
      const response = await axios.get(
        `${elautBaseUrl}/getPelatihanUser?idPelatihan=${idPelatihan}`
      );
      setDataPelatihan(response.data);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const router = useRouter();

  function generateDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, add 1 and pad with 0 if needed
    const day = String(today.getDate()).padStart(2, "0"); // Pad day with 0 if needed

    return `${year}-${month}-${day}`;
  }

  const [passphrase, setPassphrase] = React.useState<string>("");
  const [isSigning, setIsSigning] = React.useState<boolean>(false);
  const handleTTDElektronik = async () => {
    setIsSigning(true);
    if (passphrase === "") {
      Toast.fire({
        icon: "error",
        text: "Harap memasukkan passphrase untuk dapat melakukan penandatanganan file sertifikat!",
        title: `Tidak ada passphrase`,
      });
      setPassphrase("");
      setIsSigning(false);
    } else {
      try {
        const response = await axios.post(
          elautBaseUrl + "/lemdik/sendSertifikatTtde",
          {
            idPelatihan: idPelatihan?.toString(),
            kodeParafrase: passphrase,
            nik: Cookies.get('NIK'),
          },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            },
          }
        );

        if (response.status === 200) {
          console.log("TTDE", response);
          console.log("File uploaded successfully");
          Toast.fire({
            icon: "success",
            text: "Berhasil melakuukan penandatangan sertifikat secara elektronik!",
            title: `Berhasil TTDe`,
          });
          router.push("/admin/puslat/pelatihan/penerbitan-sertifikat");
          handleUpdateStatusPenerbitan();
          setPassphrase("");
        } else {
          console.error("Failed to upload the file");
          setPassphrase("");
          setIsSigning(false);
        }
      } catch (error) {
        console.error("Error uploading the file:", error);
        setPassphrase("");
        setIsSigning(false);
        if (error instanceof AxiosError)
          Toast.fire({
            icon: "error",
            text: "Internal server error",
            title: `Gagal TTDe`,
          });
      }
    }
  };

  const [isShowPassphrase, setIsShowPassphrase] = React.useState<string>("");

  React.useEffect(() => {
    handleFetchPelatihanById();
  }, [idPelatihan]);

  const handleUpdateStatusPenerbitan = async () => {
    const formData = new FormData();
    formData.append("StatusPenerbitan", "Done");
    formData.append("PenerbitanSertifikatDiterima", generateDate());

    try {
      const response = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log({ response });
      handleFetchPelatihanById();
      setIsSigning(false);
    } catch (error) {
      console.error({ error });
      Toast.fire({
        icon: "error",
        title: `Gagal mengupload file berita acara dan penandatangan!`,
      });
      handleFetchPelatihanById();
      setIsSigning(false);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex flex-row gap-2 items-center w-full justify-between">
          <header
            aria-label="page caption"
            className="flex-row  w-full flex h-20 items-center gap-2 bg-gray-100 border-t px-4 justify-between"
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <TbListDetails className="text-3xl" />
                <div className="flex flex-col">
                  <h1 id="page-caption" className="font-semibold text-lg">
                    Pelatihan{" "}
                    {dataPelatihan != null ? dataPelatihan!.NamaPelatihan : "-"}
                  </h1>
                  <p className="text-sm text-gray-400 mb-1 mt-1 leading-[110%]">
                    {" "}
                    {dataPelatihan != null
                      ? dataPelatihan!.KodePelatihan
                      : ""}{" "}
                    •{" "}
                    {dataPelatihan != null
                      ? dataPelatihan!.BidangPelatihan
                      : ""}{" "}
                    • Mendukung Program Terobosan{" "}
                    {dataPelatihan != null
                      ? dataPelatihan!.DukunganProgramTerobosan
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-end">
              {dataPelatihan != null
                ? dataPelatihan!.StatusPenerbitan != "" && (
                  <Badge
                    variant="outline"
                    className={`w-fit flex items-center justify-center ${dataPelatihan!.StatusPenerbitan == "On Progress"
                      ? " bg-yellow-300 text-neutral-800"
                      : " bg-green-500 text-white text-base"
                      }`}
                  >
                    {dataPelatihan!.StatusPenerbitan!}{" "}
                    {usePathname().includes("lemdiklat")
                      ? "Pengajuan Sertifikat"
                      : "Penerbitan"}
                  </Badge>
                )
                : null}
            </div>
          </header>
        </div>
      </div>
      <div className="flex flex-col w-full px-4">
        <div className="w-full flex items-center justify-between">
          {dataPelatihan != null && <></>}
        </div>

        <div className="flex w-full flex-col gap-2 items-center mt-3">
          {/* Nama Pelatihan */}
          <div className="w-full">
            <label
              className="block text-gray-800 text-sm font-medium mb-1"
              htmlFor="kodePelatihan"
            >
              Nama Pelatihan <span className="text-red-600">*</span>
            </label>
            <input
              id="tanggalMulaiPelatihan"
              type="text"
              className="form-input w-full text-black border-gray-300 rounded-md"
              required
              readOnly
              min={new Date().toISOString().split("T")[0]}
              placeholder={
                dataPelatihan != null ? dataPelatihan!.NamaPelatihan : "-"
              }
            />
          </div>

          <div className="flex gap-2 w-full">
            <div className="w-full">
              <label
                className="block text-gray-800 text-sm font-medium mb-1"
                htmlFor="kodePelatihan"
              >
                Kode Pelatihan <span className="text-red-600">*</span>
              </label>
              <input
                id="tanggalMulaiPelatihan"
                type="text"
                className="form-input w-full text-black border-gray-300 rounded-md"
                required
                readOnly
                min={new Date().toISOString().split("T")[0]}
                placeholder={
                  dataPelatihan != null ? dataPelatihan!.KodePelatihan : "-"
                }
              />
            </div>

            <div className="w-full">
              <label
                className="block text-gray-800 text-sm font-medium mb-1"
                htmlFor="kodePelatihan"
              >
                No Sertifikat <span className="text-red-600">*</span>
              </label>
              <input
                id="tanggalMulaiPelatihan"
                type="text"
                className="form-input w-full text-black border-gray-300 rounded-md"
                required
                readOnly
                min={new Date().toISOString().split("T")[0]}
                placeholder={
                  dataPelatihan != null ? dataPelatihan!.NoSertifikat : "-"
                }
              />
            </div>
          </div>

          {/* Bidang dan Jenis Pelatihan */}
          <div className="flex gap-2 w-full">
            <div className="w-full">
              <label
                className="block text-gray-800 text-sm font-medium mb-1"
                htmlFor="kodePelatihan"
              >
                Bidang Pelatihan <span className="text-red-600">*</span>
              </label>
              <input
                id="tanggalMulaiPelatihan"
                type="text"
                className="form-input w-full text-black border-gray-300 rounded-md"
                required
                readOnly
                min={new Date().toISOString().split("T")[0]}
                placeholder={
                  dataPelatihan != null ? dataPelatihan!.BidangPelatihan : "-"
                }
              />
            </div>

            <div className="w-full">
              <label
                className="block text-gray-800 text-sm font-medium mb-1"
                htmlFor="kodePelatihan"
              >
                Jenis Pelatihan <span className="text-red-600">*</span>
              </label>
              <input
                id="tanggalMulaiPelatihan"
                type="text"
                className="form-input w-full text-black border-gray-300 rounded-md"
                required
                readOnly
                min={new Date().toISOString().split("T")[0]}
                placeholder={
                  dataPelatihan != null ? dataPelatihan!.JenisPelatihan : "-"
                }
              />
            </div>
          </div>

          {/* Waktu dan Lokasi Pelatihan */}
          <div className="flex gap-2 w-full">
            <div className="w-full">
              <label
                className="block text-gray-800 text-sm font-medium mb-1"
                htmlFor="kodePelatihan"
              >
                Lokasi Pelatihan <span className="text-red-600">*</span>
              </label>
              <input
                id="tanggalMulaiPelatihan"
                type="text"
                className="form-input w-full text-black border-gray-300 rounded-md"
                required
                readOnly
                min={new Date().toISOString().split("T")[0]}
                placeholder={
                  dataPelatihan != null ? dataPelatihan!.LokasiPelatihan : "-"
                }
              />
            </div>

            <div className="w-full">
              <label
                className="block text-gray-800 text-sm font-medium mb-1"
                htmlFor="waktuPelatihan"
              >
                Waktu Pelatihan <span className="text-red-600">*</span>
              </label>
              <input
                id="waktuPelatihan"
                type="text"
                className="form-input w-full text-black border-gray-300 rounded-md"
                required
                readOnly
                min={new Date().toISOString().split("T")[0]}
                placeholder={
                  dataPelatihan != null
                    ? generateTanggalPelatihan(
                      dataPelatihan!.TanggalMulaiPelatihan
                    ) +
                    " - " +
                    generateTanggalPelatihan(
                      dataPelatihan!.TanggalBerakhirPelatihan
                    )
                    : "-"
                }
              />
            </div>
          </div>

          {/* Penyelenggara Pelatihan */}
          <div className="flex gap-2 w-full">
            <div className="w-full">
              <label
                className="block text-gray-800 text-sm font-medium mb-1"
                htmlFor="penyelenggaraPelatihan"
              >
                Penyelenggara Pelatihan <span className="text-red-600">*</span>
              </label>
              <input
                id="penyelenggaraPelatihan"
                type="text"
                className="form-input w-full text-black border-gray-300 rounded-md"
                required
                readOnly
                min={new Date().toISOString().split("T")[0]}
                placeholder={
                  dataPelatihan != null
                    ? dataPelatihan!.PenyelenggaraPelatihan +
                    " - " +
                    generateFullNameBalai(
                      dataPelatihan!.PenyelenggaraPelatihan
                    )
                    : "-"
                }
              />
            </div>

            <div className="w-full">
              <label
                className="block text-gray-800 text-sm font-medium mb-1"
                htmlFor="asalPesertaPelatihan"
              >
                Asal Peserta Pelatihan <span className="text-red-600">*</span>
              </label>
              <input
                id="asalPesertaPelatihan"
                type="text"
                className="form-input w-full text-black border-gray-300 rounded-md"
                required
                readOnly
                min={new Date().toISOString().split("T")[0]}
                placeholder={
                  dataPelatihan != null ? dataPelatihan!.AsalPelatihan : "-"
                }
              />
            </div>
          </div>

          {/* Penyelenggara Pelatihan */}
          <div className="w-full">
            <label
              className="block text-gray-800 text-sm font-medium mb-1"
              htmlFor="dukunganProgramTerobosan"
            >
              Dukungan Program Terobosan <span className="text-red-600">*</span>
            </label>
            <input
              id="dukunganProgramTerobosan"
              type="text"
              className="form-input w-full text-black border-gray-300 rounded-md"
              required
              readOnly
              min={new Date().toISOString().split("T")[0]}
              placeholder={
                dataPelatihan != null
                  ? dataPelatihan!.DukunganProgramTerobosan
                  : "-"
              }
            />
          </div>

          {/* Penyelenggara Pelatihan */}
          <div className="w-full">
            <label
              className="block text-gray-800 text-sm font-medium mb-1"
              htmlFor="dukunganProgramTerobosan"
            >
              TTD Sertifikat <span className="text-red-600">*</span>
            </label>
            <input
              id="dukunganProgramTerobosan"
              type="text"
              className="form-input w-full text-black border-gray-300 rounded-md"
              required
              readOnly
              min={new Date().toISOString().split("T")[0]}
              placeholder={
                dataPelatihan != null ? dataPelatihan!.TtdSertifikat : "-"
              }
            />
          </div>

          {/* Surat Pemberitahuan Pelatihan */}
          <div className="w-full">
            <label
              className="block text-gray-800 text-sm font-medium mb-1"
              htmlFor="suratPemberitahuan"
            >
              Surat Pemberitahuan Pelaksanaan Pelatihan
              <span className="text-red-600">*</span>
            </label>
            <Link
              href={
                dataPelatihan != null
                  ? dataPelatihan!.SuratPemberitahuan != ""
                    ? fileBaseUrl +
                    "/suratPemberitahuan/" +
                    dataPelatihan!.SuratPemberitahuan
                    : "-"
                  : "-"
              }
              target="_blank"
              className="text-blue-500 underline"
            >
              {dataPelatihan != null
                ? dataPelatihan!.SuratPemberitahuan != ""
                  ? fileBaseUrl +
                  "/suratPemberitahuan/" +
                  dataPelatihan!.SuratPemberitahuan
                  : "File tidak tersedia"
                : "File tidak Tersesdia"}
            </Link>
          </div>

          {/* Surat Pemberitahuan Pelatihan */}
          <div className="w-full">
            <label
              className="block text-gray-800 text-sm font-medium mb-1"
              htmlFor="suratPemberitahuan"
            >
              Berita Acara Pelaksanaan Pelatihan
              <span className="text-red-600">*</span>
            </label>
            <Link
              href={
                dataPelatihan != null
                  ? dataPelatihan!.BeritaAcara != ""
                    ? fileBaseUrl + "/beritaAcara/" + dataPelatihan!.BeritaAcara
                    : "-"
                  : "-"
              }
              className="text-blue-500 underline"
              target="_blank"
            >
              {dataPelatihan != null
                ? dataPelatihan!.BeritaAcara != ""
                  ? fileBaseUrl + "/beritaAcara/" + dataPelatihan!.BeritaAcara
                  : "File tidak tersedia"
                : "File tidak Tersesdia"}
            </Link>
          </div>

          {/* Catatan Pemberitahuann Pelatihan */}
          <div className="w-full">
            <label
              className="block text-gray-800 text-sm font-medium mb-1"
              htmlFor="catatan"
            >
              Catatan <span className="text-red-600">*</span>
            </label>
            <textarea
              id="catatan"
              className="form-input w-full text-black border-gray-300 rounded-md"
              required
              readOnly={
                dataPelatihan != null
                  ? dataPelatihan!.StatusPenerbitan == "Done"
                  : false
              }
              rows={6}
              placeholder={"Masukkan catatan dari pusat"}
            ></textarea>
          </div>

          {dataPelatihan != null ? (
            dataPelatihan!.StatusPenerbitan != "Done" ? (
              <AlertDialog>
                <AlertDialogTrigger className="w-full pb-10">
                  {" "}
                  <Button
                    disabled={isSigning}
                    className={`btn text-white bg-blue-500 hover:bg-blue-500 w-full max-w-full text-base`}
                  >
                    <AiFillSignature className="text-lg" />
                    {isSigning ? "...Signing" : "Tanda Tangan"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="flex flex-col gap-1">
                      <AlertDialogTitle className="flex items-center gap-2">
                        {" "}
                        <TbSignature className="text-3xl" />
                        Passphrase
                      </AlertDialogTitle>
                      <p className="-mt-1 text-gray-500 text-sm leading-[110%] w-full">
                        Masukkan passphrase anda untuk melanjutkan proses
                        penandatanganan pada sertifikat yang akan diterbitkan
                      </p>
                    </div>
                  </AlertDialogHeader>
                  <fieldset>
                    <form autoComplete="off">
                      <div className="flex flex-wrap -mx-3 mb-1 -mt-2">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="email"
                          >
                            Passphrase
                          </label>
                          <div className="flex gap-1">
                            <input
                              type="password"
                              className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                              required
                              autoComplete="off"
                              value={passphrase}
                              onChange={(e) => setPassphrase(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <AlertDialogFooter className="mt-3">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => handleTTDElektronik()}
                        >
                          Tanda Tangan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </form>
                  </fieldset>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <></>
            )
          ) : null}
        </div>
      </div>
    </>
  );
};

export default DetailPelatihan;
