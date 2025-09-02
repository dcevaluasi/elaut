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

import { HiOutlineEye, HiUserGroup } from "react-icons/hi2";
import Cookies from "js-cookie";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { HiOutlineEyeOff } from "react-icons/hi";

const TTDSertifikat = ({ dataPelatihan, handleFetchData }: { dataPelatihan: PelatihanMasyarakat, handleFetchData: any }) => {
  const router = useRouter();
  const isPejabat = Cookies.get('Jabatan')?.includes('Kepala')
  const isEselonI = Cookies.get('Jabatan')?.includes('Badan')
  const isEselonII = Cookies.get('Jabatan')?.includes('Pusat')

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
            idPelatihan: dataPelatihan?.IdPelatihan.toString(),
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
          handleAddHistoryTrainingInExisting(dataPelatihan!, 'Telah menyetujui permohonan penerbitan dan menandatangani sertifikat secara elektronik', Cookies.get('Jabatan'), Cookies.get('Jabatan') === 'Kepala Pusat Pelatihan Kelautan dan Perikanan' ? 'Pusat Pelatihan Kelatuan dan Perikanan' : 'BPPSDM KP')

          handleUpdateStatusPenerbitan(passphrase);
          setPassphrase("");
        } else {
          console.error("Failed to upload the file");
          setPassphrase("");
          setIsSigning(false);
        }
        handleFetchData()
      } catch (error) {
        console.error("Error uploading the file:", error);
        setPassphrase("");
        handleFetchData()
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

  const [isShowPassphrase, setIsShowPassphrase] = React.useState<boolean>(false);

  const handleUpdateStatusPenerbitan = async (passphrase: string) => {
    const formData = new FormData();
    formData.append("StatusPenerbitan", "Done");
    formData.append("AsalSertifikat", passphrase);
    formData.append("PenerbitanSertifikatDiterima", generateDate());
    if (isEselonI) {
      formData.append('PemberitahuanDiterima', 'Telah Ditandatangani Ka BPPSDM KP')
    } else if (isEselonII) {
      formData.append('PemberitahuanDiterima', 'Telah Ditandatangani Ka Puslat KP')
    } else {
      formData.append('PemberitahuanDiterima', 'Telah Ditandatangani Ka Balai Pelatihan')
    }


    try {
      const response = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${dataPelatihan.IdPelatihan}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log({ response });
      handleFetchData();
      setIsSigning(false);
    } catch (error) {
      console.error({ error });
      Toast.fire({
        icon: "error",
        title: `Gagal mengupload file berita acara dan penandatangan!`,
      });
      handleFetchData();
      setIsSigning(false);
    }
  };

  return (
    <>
      {dataPelatihan != null ? (
        dataPelatihan!.StatusPenerbitan != "Done" && isPejabat && Cookies.get('Jabatan') === dataPelatihan!.TtdSertifikat ? (
          <AlertDialog>
            <AlertDialogTrigger className="w-full">
              {" "}
              <Button
                disabled={isSigning}
                className={`inline-flex items-center justify-center gap-1 text-sm w-full rounded-lg 
              bg-blue-500 text-white  font-medium px-3 py-4 shadow-sm 
              hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <TbSignature className="h-4 w-4" />
                {isSigning ? "...Proses Penandatanganan" : "TTD-e"}
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
                        <span className="relative w-full h-fit">
                          <input
                            type={isShowPassphrase ? 'text' : 'password'}
                            className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                            required
                            autoComplete="off"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                          />
                          <span onClick={(e) => setIsShowPassphrase(!isShowPassphrase)}>
                            {isShowPassphrase ? (
                              <HiOutlineEyeOff className="text-gray-500 my-auto top-3 mr-5 absolute right-0 text-xl cursor-pointer" />
                            ) : (
                              <HiOutlineEye className="text-gray-500 my-auto top-3 mr-5 absolute right-0 text-xl cursor-pointer" />
                            )}
                          </span>
                        </span>

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
    </>
  );
};

export default TTDSertifikat;
