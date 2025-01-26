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
      <div className="w-full mx-auto">
        <div className="pb-12 md:pb-20">
          {/* CTA box */}
          <div className="relative bg-transparent border border-b-gray-100 rounded-3xl py-10 px-8 md:py-10 md:px-12 shadow-2xl overflow-hidden">
            {/* Background illustration */}
            <div
              className="absolute right-0 bottom-0 pointer-events-none hidden lg:block"
              aria-hidden="true"
            >
              <svg width="428" height="328" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient
                    cx="35.542%"
                    cy="34.553%"
                    fx="35.542%"
                    fy="34.553%"
                    r="96.031%"
                    id="ni-a"
                  >
                    <stop stopColor="#DFDFDF" offset="0%" />
                    <stop stopColor="#4C4C4C" offset="44.317%" />
                    <stop stopColor="#333" offset="100%" />
                  </radialGradient>
                </defs>
                <g fill="none" fillRule="evenodd">
                  <g fill="#FFF">
                    <ellipse
                      fillOpacity=".04"
                      cx="185"
                      cy="15.576"
                      rx="16"
                      ry="15.576"
                    />
                    <ellipse
                      fillOpacity=".24"
                      cx="100"
                      cy="68.402"
                      rx="24"
                      ry="23.364"
                    />
                    <ellipse
                      fillOpacity=".12"
                      cx="29"
                      cy="251.231"
                      rx="29"
                      ry="28.231"
                    />
                    <ellipse
                      fillOpacity=".64"
                      cx="29"
                      cy="251.231"
                      rx="8"
                      ry="7.788"
                    />
                    <ellipse
                      fillOpacity=".12"
                      cx="342"
                      cy="31.303"
                      rx="8"
                      ry="7.788"
                    />
                    <ellipse
                      fillOpacity=".48"
                      cx="62"
                      cy="126.811"
                      rx="2"
                      ry="1.947"
                    />
                    <ellipse
                      fillOpacity=".12"
                      cx="78"
                      cy="7.072"
                      rx="2"
                      ry="1.947"
                    />
                    <ellipse
                      fillOpacity=".64"
                      cx="185"
                      cy="15.576"
                      rx="6"
                      ry="5.841"
                    />
                  </g>
                  <circle fill="url(#ni-a)" cx="276" cy="237" r="200" />
                </g>
              </svg>
            </div>

            <div className="relative flex flex-col lg:flex-row justify-between items-center">
              {/* CTA content */}
              <div className="text-center lg:text-left lg:max-w-xl">
                <h3 className="h3 text-white mb-2 leading-none md:leading-normal">
                  Cek validitas sertifikatmu sekarang
                </h3>
                <p className="text-gray-300 text-lg mb-6">
                  Pastikan sertifikat pelatihan dan uji kompetensi yang kamu
                  ikuti valid dan terbukti ya!
                </p>

                {/* CTA form */}
                <form className="w-full lg:w-auto" autoComplete="off">
                  <div className="flex flex-col sm:flex-row justify-center max-w-xs mx-auto sm:max-w-md lg:mx-0">
                    <input
                      type="text"
                      className="form-input w-full appearance-none bg-transparent border border-gray-200 focus:border-gray-600 rounded-sm px-4 py-3 mb-2 sm:mb-0 sm:mr-2 text-white placeholder:text-gray-200"
                      placeholder="No Registrasi"
                      aria-label="No Register"
                      maxLength={18}
                      required
                      value={noRegistrasi}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNoRegistrasi(value);
                        setIsInputErrorNoRegistrasi(value.length > 0 && value.length < 18);
                      }}
                    />
                    <button type="button"
                      onClick={(e) => handleCekValiditasSertifikat()}
                      disabled={noRegistrasi.length < 18}
                      className="btn text-white bg-blue-600 hover:bg-blue-700 shadow cursor-pointer"
                    >
                      Cek
                    </button>
                  </div>
                  {isInputErrorNoRegistrasi && noRegistrasi != '' ? (
                    <p className="text-rose-500 font-medium text-sm mt-3">
                      *No Registrasi tidak sesuai format, harus terdiri dari 18 digit
                    </p>
                  ) : <p className="text-sm text-gray-300 mt-3">
                    *Masukkan nomor registrasi kamu
                  </p>}

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
