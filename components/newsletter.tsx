"use client";

import axios, { isAxiosError } from "axios";
import React from "react";
import Toast from "./toast";
import { UserPelatihan } from "@/types/product";

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
import { Button } from "./ui/button";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { addFiveYears } from "@/utils/pelatihan";
import { sanitizedDangerousChars, validateIsDangerousChars } from "@/utils/input";

export default function Newsletter() {
  const [noRegistrasi, setNoRegistrasi] = React.useState<string>("");
  const [isInputErrorNoRegistrasi, setIsInputErrorNoRegistrasi] = React.useState<boolean>(true)
  const [validSertifikat, setValidSertifikat] =
    React.useState<UserPelatihan | null>(null);
  const [isShowValidForm, setIsShowValidForm] = React.useState<boolean>(false);
  const handleCekValiditasSertifikat = async () => {
    if (validateIsDangerousChars(noRegistrasi)) {
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: `Kamu memasukkan karakter berbahaya pada input NIK-mu, cek akun tidak dapat diproses!`,
      });
    } else {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/cekSertifikat`,
          {
            no_registrasi: sanitizedDangerousChars(noRegistrasi),
          }
        );
        setValidSertifikat(response.data.data);
        setIsShowValidForm(!isShowValidForm);
        setNoRegistrasi("");
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: error.response?.data?.Pesan || "An error occurred",
          });
        } else {
          Toast.fire({
            icon: "error",
            title: "An unknown error occurred",
          });
        }
        setNoRegistrasi("");
      }
    }
  };
  return (
    <>
      <section
        id="cek-sertifikat"
        className="scroll-smooth w-full max-w-7xl mx-auto mt-6"
      >
        <AlertDialog open={isShowValidForm}>
          <AlertDialogContent className="flex flex-col items-center justify-center !w-[420px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="w-full flex gap-2 items-center justify-center flex-col">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-200 via-whiter to-white flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full  bg-gradient-to-b from-gray-300 via-whiter to-white flex items-center justify-center animate-pulse">
                    <RiVerifiedBadgeFill className="h-12 w-12 text-blue-500" />
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-full justify-center items-center">
                  <h1 className="font-bold text-2xl">
                    {validSertifikat?.NoRegistrasi!}
                  </h1>
                  <AlertDialogDescription className="w-full text-center font-normal text-sm -mt-1">
                    No Registrasi valid dan dinyatakan telah mengikuti pelatihan{" "}
                    <span className="font-semibold">
                      {validSertifikat?.NamaPelatihan}
                    </span>{" "}
                    bidang{" "}
                    <span className="font-semibold">
                      {validSertifikat?.BidangPelatihan}
                    </span>{" "}
                    dan memiliki sertifikat kelulusan dengan detail sebagai
                    berikut :
                  </AlertDialogDescription>
                </div>
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter className="w-full">
              <div className="flex-col flex w-full">
                <div className="flex flex-wrap  border-b py-2 border-b-gray-300 w-full">
                  <div className="w-full">
                    <label
                      className="block text-sm text-gray-800  font-medium mb-1"
                      htmlFor="name"
                    >
                      No Sertifikat{" "}
                    </label>
                    <p className="text-gray-600 text-base -mt-1">
                      {validSertifikat?.NoSertifikat}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap border-b py-2 border-b-gray-300 w-full">
                  <div className="w-full">
                    <label
                      className="block text-sm text-gray-800 font-medium mb-1"
                      htmlFor="name"
                    >
                      Nama Lengkap{" "}
                    </label>
                    <p className="text-gray-600 text-base -mt-1">
                      {validSertifikat?.Nama}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap border-b py-2 border-b-gray-300 w-full">
                  <div className="w-full">
                    <label
                      className="block text-sm text-gray-800 font-medium mb-1"
                      htmlFor="name"
                    >
                      Nama Pelatihan{" "}
                    </label>
                    <p className="text-gray-600 text-base -mt-1">
                      {validSertifikat?.NamaPelatihan}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap border-b py-2 border-b-gray-300 w-full">
                  <div className="w-full">
                    <label
                      className="block text-sm text-gray-800 font-medium mb-1"
                      htmlFor="name"
                    >
                      Tanggal Pelaksanaan{" "}
                    </label>
                    <p className="text-gray-600 text-base -mt-1">
                      {"10 Juni 2024 - 19 Juni 2024"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap  py-2  mb-6 w-full">
                  <div className="w-full">
                    <label
                      className="block text-sm text-gray-800 font-medium mb-1"
                      htmlFor="name"
                    >
                      Diterbitkan Pada{" "}
                    </label>
                    <p className="text-gray-600 text-base -mt-1">
                      {validSertifikat?.IsActice!}
                    </p>
                  </div>
                </div>
                <AlertDialogAction
                  className="py-5"
                  onClick={(e) => setIsShowValidForm(!isShowValidForm)}
                >
                  Close
                </AlertDialogAction>
                <p className="italic text-xs leading-[100%] mt-2">
                  * This information is{" "}
                  <span className="font-semibold ">valid</span> and comes from the
                  Ministry of Maritime Affairs and Fisheries of the Republic of
                  Indonesia and{" "}
                  <span className="font-semibold">
                    is valid until {addFiveYears(validSertifikat?.IsActice!)}
                  </span>
                </p>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2 items-start md:items-end w-full md:text-left bg-white rounded-3xl p-10 ">
          <h2 className="text-blue-500 text-[3.6rem]  font-calsans leading-none">
            Cek Sertifikat
          </h2>
          <div className="flex flex-col items-start md:items-end">
            <p className="text-blue-500">*Hanya menampilkan <span className="font-bold">detail pelatihan</span> yang diikuti bukan <span className="font-bold">sertifikat</span></p>
            <p className="text-blue-500">*Masukkan<span className="font-bold"> nomor registrasi</span> untuk mengecek validitas</p>
          </div>




          {/* <Button className='bg-[#625BF9] text-white font-bold w-fit rounded-full text-xl px-7 py-7'>
                {generateTanggalPelatihan(
                  data!.TanggalMulaiPelatihan
                )} - {generateTanggalPelatihan(
                  data!.TanggalBerakhirPelatihan
                )}

              </Button> */}
          <div className="flex items-end">
            <p
              className="text-base font-normal text-[#979797] group-hover:duration-1000  md:text-right max-w-xl"
            >Pastikan validitas sertifikatmu dengan mengecek berdasarkan <span className="font-semibold">nomor registrasi</span> terkait keikutsertaan serta kelulusan-mu mengikuti pelatihan dan sertifikasi kompetensi di ELAUT</p>
          </div>

          <div className="w-full lg:w-auto">
            <div className="flex flex-col  justify-center ">
              <input
                type="text"
                className="form-input w-full appearance-none bg-transparent border border-[#979797] focus:border-gray-600 px-4 py-3 mb-2 sm:mb-0 sm:mr-2 text-[#979797] placeholder:text-[#979797] rounded-full"
                placeholder="No Registrasi"
                aria-label="No Register"
                maxLength={18}
                required
                value={noRegistrasi}
                autoComplete="off"
                onChange={(e) => {
                  const value = e.target.value;
                  setNoRegistrasi(value);
                  setIsInputErrorNoRegistrasi(value.length > 0 && value.length < 18);
                }}
              />
              {isInputErrorNoRegistrasi && noRegistrasi != '' ? (
                <p className="text-rose-500 font-medium text-sm ">
                  *No Registrasi tidak sesuai format, harus terdiri dari 18 digit
                </p>
              ) : <p className="text-sm text-[#979797] ">
                *Masukkan nomor registrasi kamu
              </p>}
              <Button onClick={() => handleCekValiditasSertifikat()} type="button" className='bg-[#625BF9] text-white font-calsans w-full md:w-fit rounded-full text-2xl md:px-24 py-7  mt-2'>
                CEK SERTIFIKAT

              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end w-full text-left bg-white rounded-3xl p-10 ">
          <h2 className="text-blue-500 text-[3.6rem]  font-calsans leading-none">
            Validitas Sertifikat
          </h2>
          <div className="flex flex-col items-end">
            <p className="text-blue-500">*Hanya menampilkan <span className="font-bold">detail pelatihan</span> yang diikuti bukan <span className="font-bold">sertifikat</span></p>
            <p className="text-blue-500">*Masukkan<span className="font-bold"> nomor registrasi</span> untuk mengecek validitas</p>
          </div>




        </div>

      </div></>

  );
}
