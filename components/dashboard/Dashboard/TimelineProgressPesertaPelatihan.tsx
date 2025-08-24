"use client";

import React from "react";
import { UserPelatihan } from "@/types/user";
import { IoMdCloseCircle } from "react-icons/io";
import { PiQuestionFill } from "react-icons/pi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Link from "next/link";
import Cookies from "js-cookie";

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
import axios from "axios";
import { useRouter } from "next/navigation";
import { createSlug } from "@/utils";
import { PelatihanMasyarakat } from "@/types/product";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { generateTanggalPelatihan } from "@/utils/text";
import { IoReloadCircle } from "react-icons/io5";
import { isDatePassedOrToday } from "@/lib/times";

export const TimelineProgressPesertaPelatihan = ({
  userDetail,
  pelatihan,
}: {
  userDetail: UserPelatihan;
  pelatihan: PelatihanMasyarakat;
}) => {
  console.log({ pelatihan });
  const router = useRouter();
  const [codeAccess, setCodeAccess] = React.useState<string>("");
  const [isOpenGuideline, setIsOpenGuideline] = React.useState<boolean>(true);
  const handleDirectToExam = async (e: any) => {
    if (codeAccess != "") {
      if (codeAccess != userDetail!.CodeAksess) {
        Toast.fire({
          icon: "error",
          title: `Kode akses yang dimasukkan tidak terdaftar!`,
        });
        setCodeAccess("");
      } else {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/lemdik/AuthExam`,
            {
              code_akses: codeAccess,
              type_exam: "PreTest",
            }
          );

          if (response.status == 200) {
            if (Cookies.set("XSRF089999", response.data.t)) {
              Toast.fire({
                icon: "success",
                title: `Selamat mengerjakan pre-test mu dengan baik sobat ELAUT!`,
              });
              setCodeAccess("");
              router.replace(
                `layanan/pelatihan/${createSlug(
                  pelatihan!.NamaPelatihan
                )}/${pelatihan!.KodePelatihan!}/${pelatihan!
                  .IdPelatihan!}/pre-test/${userDetail!.CodeAksess}`
              );
            }
          }
        } catch (error) {
          Toast.fire({
            icon: "error",
            title: `Nampaknya terdapat kendala pada server, hubungi Call Center!`,
          });
          setCodeAccess("");
          console.log({ error });
        }
      }
    } else {
      Toast.fire({
        icon: "error",
        title: `Harap masukkan kode akses terlebih dahulu!`,
      });
      setCodeAccess("");
    }
  };
  const handleDirectToExamPostTest = async (e: any) => {
    if (codeAccess != "") {
      if (codeAccess != userDetail!.CodeAksess) {
        Toast.fire({
          icon: "error",
          title: `Kode akses yang dimasukkan tidak terdaftar!`,
        });
        setCodeAccess("");
      } else {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/lemdik/AuthExam`,
            {
              code_akses: codeAccess,
              type_exam: "PostTest",
            }
          );

          if (response.status == 200) {
            if (Cookies.set("XSRF089999", response.data.t)) {
              Toast.fire({
                icon: "success",
                title: `Selamat mengerjakan post-test mu dengan baik sobat ELAUT!`,
              });
              setCodeAccess("");
              router.replace(
                `layanan/pelatihan/${createSlug(
                  pelatihan!.NamaPelatihan
                )}/${pelatihan!.KodePelatihan!}/${pelatihan!
                  .IdPelatihan!}/post-test/${userDetail!.CodeAksess}`
              );
            }
          }
        } catch (error) {
          Toast.fire({
            icon: "error",
            title: `Nampaknya terdapat kendala pada server, hubungi Call Center!`,
          });
          setCodeAccess("");
        }
      }
    } else {
      Toast.fire({
        icon: "error",
        title: `Harap masukkan kode akses terlebih dahulu!`,
      });
      setCodeAccess("");
    }
  };
  const handleDirectToExamRemedial = async (e: any) => {
    if (codeAccess != "") {
      if (codeAccess != userDetail.CodeAksess) {
        Toast.fire({
          icon: "error",
          title: `Kode akses yang dimasukkan tidak terdaftar!`,
        });
        setCodeAccess("");
      } else {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/lemdik/AuthExam`,
            {
              code_akses: codeAccess,
              type_exam: "PostTest",
            }
          );

          if (response.status == 200) {
            if (Cookies.set("XSRF089999", response.data.t)) {
              Toast.fire({
                icon: "success",
                title: `Selamat mengerjakan post-test mu dengan baik sobat ELAUT!`,
              });
              setCodeAccess("");
              router.replace(
                `layanan/pelatihan/${createSlug(
                  pelatihan!.NamaPelatihan
                )}/${pelatihan!.KodePelatihan!}/${pelatihan!
                  .IdPelatihan!}/remedial/${userDetail!.CodeAksess}`
              );
            }
          }
        } catch (error) {
          Toast.fire({
            icon: "error",
            title: `Nampaknya terdapat kendala pada server, hubungi Call Center!`,
          });
          setCodeAccess("");
        }
      }
    } else {
      Toast.fire({
        icon: "error",
        title: `Harap masukkan kode akses terlebih dahulu!`,
      });
      setCodeAccess("");
    }
  };

  console.log({ codeAccess });

  return (
    <section className=" text-blue-500">
      <div className=" max-w-5xl py-12 mx-auto">
        <div className="grid md:gap-4 sm:grid-cols-12">
          <div className="col-span-12 sm:col-span-3">
            <div className="text-center sm:text-left mb-5 before:block before:w-24 before:h-3 before:mb-2 before:rounded-md before:mx-auto sm:before:mx-0 before:bg-blue-500">
              <h3 className="text-2xl font-calsans leading-none">
                Progress Pelatihan
              </h3>
              <p className="text-sm font-normal leading-[115%] text-gray-200">
                Lihat progress kamu sebagai peserta pelatihan
              </p>
            </div>
          </div>
          <div className="relative col-span-12 space-y-6 sm:col-span-9">
            <div className="col-span-12 space-y-5 md:space-y-12 relative px-4 sm:col-span-8 sm:space-y-8 sm:before:absolute sm:before:top-2 sm:before:bottom-0 sm:before:w-0.5 sm:before:-left-3 before:bg-gray-300">
              <div
                className={`flex flex-col sm:relative sm:before:absolute sm:before:top-2 sm:before:w-4 sm:before:h-4 sm:before:rounded-full sm:before:left-[-35px] sm:before:z-[1] ${userDetail!.Keterangan == "Valid"
                  ? "before:bg-green-400"
                  : userDetail!.Keterangan == "Tidak Valid"
                    ? "before:bg-rose-500"
                    : "before:bg-gray-300"
                  } bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] 
               transition-all duration-500 border-white/20  p-4 rounded-xl  cursor-pointer`}
              >
                <h3 className="text-blue-400 text-lg font-semibold leading-none">Validasi Peserta </h3>

                <time
                  className={`text-sm font-medium text-gray-300 ${userDetail?.Keterangan! == "Tidak Valid"
                    ? "text-rose-500"
                    : userDetail?.Keterangan! == "Valid"
                      ? "text-green-400"
                      : "text-gray-300"
                    }`}
                >
                  {userDetail?.Keterangan! == "Tidak Valid" ? (
                    <span className="flex items-start gap-1">
                      <IoMdCloseCircle className="mt-[0.134rem]" />
                      <span className="flex flex-col">
                        <span>Kelengkapan data tidak valid</span>
                      </span>
                    </span>
                  ) : userDetail?.Keterangan! == "Valid" ? (
                    <span className="flex items-center">
                      <RiVerifiedBadgeFill className="text" />
                      Data pendaftaran anda valid
                    </span>
                  ) : (
                    <span className="flex items-start gap-1">
                      <PiQuestionFill className="mt-[0.134rem]" />
                      <span className="flex flex-col">
                        <span> Data belum divalidasi operator</span>
                      </span>
                    </span>
                  )}
                </time>
                <p className="text-gray-300 leading-none">
                  {userDetail?.Keterangan! == "Tidak Valid" ? (
                    <span className="flex items-start gap-1">
                      <span className="flex flex-col">
                        <span className="font-normal">
                          <span
                            dangerouslySetInnerHTML={{
                              __html: userDetail?.StatusPembayaran!,
                            }}
                            className="text-xs  prose  text-justify group-hover:text-xs text-gray-300 prose-strong:text-gray-500 prose-p:leading-[140%] prose-strong:font-bold group-hover:duration-1000 w-full"
                          />{" "}
                          <span className="flex gap-1 w-full">
                            <span className="text-xs text-gray-300">
                              Lakukan perbaikan pada link
                            </span>{" "}
                            <Link
                              onClick={(e) =>
                                Cookies.set("isEditValiditas", "true")
                              }
                              className="text-blue-500 text-xs"
                              href={"/dashboard/edit-profile"}
                            >
                              {" "}
                              berikut.
                            </Link>
                          </span>
                        </span>
                      </span>
                    </span>
                  ) : userDetail?.Keterangan! == "Valid" ? (
                    <span className="flex items-center text-xs ">
                      Data dan kelengkapanmu sudah sesuai untuk mengikuti
                      pelatihan silahkan lanjut ke proses berikutnya!
                    </span>
                  ) : (
                    <span className="flex items-start gap-1 ">
                      <span className="flex flex-col">
                        <span className="text-xs">
                          Proses ini dilakukan oleh balai pelatihan, untuk
                          memastikan kelengkapan data dan dokumen yang
                          diperlukan sudah memenuhi persyaratan atau belum,
                          harap menunggu dalam 1x24 jam.
                        </span>
                      </span>
                    </span>
                  )}
                </p>
              </div>

              <>
                {pelatihan!.UjiKompotensi == "Tidak Ada Penilaian Teknis" ? (
                  <></>
                ) : (
                  <div
                    className={`flex flex-col sm:relative sm:before:absolute sm:before:top-2 sm:before:w-4 sm:before:h-4 sm:before:rounded-full sm:before:left-[-35px] sm:before:z-[1] ${userDetail.PreTest < 65 && userDetail.PreTest > 0
                      ? "before:bg-rose-500"
                      : userDetail.PreTest > 65
                        ? "before:bg-green-400"
                        : "before:bg-gray-300"
                      } bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] 
               transition-all duration-500 border-white/20 p-4 rounded-xl  cursor-pointer`}
                  >
                    <h3 className="text-blue-400 text-lg font-semibold leading-none">
                      Pelaksanaan Pre-Test
                    </h3>
                    <time
                      className={`text-sm font-medium text-gray-300 ${userDetail?.PreTest! == 0 &&
                        userDetail?.PostTest == 0 &&
                        pelatihan!.StatusApproval != "Selesai"
                        ? "text-gray-300"
                        : userDetail?.PreTest >= 65
                          ? "text-green-400"
                          : "text-rose-500"
                        }`}
                    >
                      {userDetail?.PreTest! == 0 ? (
                        <span className="flex items-start gap-1">
                          <PiQuestionFill className="mt-[0.134rem]" />
                          <span className="flex flex-col">
                            <span>Belum Melaksanakan Pre-Test</span>
                          </span>
                        </span>
                      ) : userDetail?.PreTest >= 65 ? (
                        <span className="flex items-center">
                          <RiVerifiedBadgeFill className="text-xs" />
                          Nilai kamu memuaskan pada pre-test!
                        </span>
                      ) : (
                        <span className="flex items-start gap-1">
                          <IoMdCloseCircle className="mt-[0.134rem]" />
                          <span className="flex flex-col">
                            <span>
                              Nilai kamu tidak memuaskan pada pre-test!
                            </span>
                          </span>
                        </span>
                      )}
                    </time>
                    <p className="text-gray-300 leading-none">
                      {userDetail?.PreTest! == 0 ? (
                        <div className="flex flex-col items-start justify-start text-xs">
                          <p className="text-gray-300 leading-none">
                            Lakukan pelaksanaan pre-test sebagai syarat
                            mengikuti pelatihan {userDetail?.NamaPelatihan}{" "}
                            untuk melihat kemampuan/pengetahuan awal mu terkait
                            diklat ini pada link berikut{" "}
                          </p>
                          {userDetail?.Keterangan === "Valid" ? (
                            <AlertDialog>
                              <AlertDialogTrigger>
                                <div
                                  onClick={() =>
                                    setCodeAccess(userDetail.CodeAksess!)
                                  }
                                  className="text-blue-500 block text-left"
                                >
                                  Link Ujian Pre-Test {pelatihan!.NamaPelatihan}
                                </div>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="flex flex-col items-center justify-center !w-[420px]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="w-full flex gap-2 items-center justify-center flex-col">
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-b from-gray-200 via-whiter to-white flex items-center justify-center">
                                      <div className="w-20 h-20 rounded-full  bg-gradient-to-b from-gray-300 via-whiter to-white flex items-center justify-center ">
                                        <Logo />
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-1 w-full justify-center items-center">
                                      {userDetail.PreTest == 0 && (
                                        <h1 className="font-bold text-2xl text-center leading-[100%]">
                                          {pelatihan! &&
                                            pelatihan!.NamaPelatihan}
                                        </h1>
                                      )}

                                      {userDetail.PreTest == 0 && (
                                        <>
                                          {" "}
                                          {codeAccess != "" && (
                                            <AlertDialogDescription className="w-full text-center font-normal text-sm mt-2 border-b border-b-gray-300 pb-3">
                                              Sebagai bagian dari pelaksanaan
                                              pelatihan agar dapat mengetahui
                                              kemampuan peserta diawal harap
                                              untuk mengikuti{" "}
                                              <span className="italic">
                                                pre-test
                                              </span>{" "}
                                              dan{" "}
                                              {isOpenGuideline
                                                ? "membaca petunjuk pengerjaan"
                                                : "memasukkan kode akses"}{" "}
                                              terlebih dahulu
                                            </AlertDialogDescription>
                                          )}
                                          {codeAccess == "" ? (
                                            <div className="mt-2">
                                              <p className="font-normal text-neutral-500 text-sm text-center ">
                                                Pelaksanaan pre-test dilaksanaan
                                                secara serentak, tunggu arahan
                                                dari instruktur dan panitia
                                                pelaksana untuk memulai dan
                                                mengerjakan ujian pre-test pada
                                                waktu yang ditentukan!
                                              </p>
                                            </div>
                                          ) : isOpenGuideline ? (
                                            <AlertDialogDescription className="w-full text-left font-normal text-sm mt-2">
                                              <span className="font-semibold text-[#000]">
                                                Petunjuk Pengerjaan :{" "}
                                              </span>
                                              <br />
                                              <span>
                                                {" "}
                                                1.Pilih salah satu jawaban yang
                                                Saudara anggap paling
                                                tepat/benar!
                                              </span>{" "}
                                              <br />
                                              <span>
                                                {" "}
                                                2. Dalam menjawab soal, gunakan
                                                gadget yang mumpuni!
                                              </span>{" "}
                                              <br />
                                              <span>
                                                {" "}
                                                3. Waktu yang disediakan untuk
                                                mengerjakan soal adalah 15
                                                menit!
                                              </span>{" "}
                                              <br />
                                              <span>
                                                {" "}
                                                4. Tidak diperbolehkan membuka
                                                buku, handphone dll!
                                              </span>
                                            </AlertDialogDescription>
                                          ) : (
                                            <fieldset className="w-full"></fieldset>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="w-full">
                                  {codeAccess == "" ? (
                                    <AlertDialogCancel
                                      onClick={() => setIsOpenGuideline(true)}
                                      className="py-5 w-full"
                                    >
                                      Close
                                    </AlertDialogCancel>
                                  ) : userDetail!.PreTest == 0 ? (
                                    <div className="flex-col flex w-full gap-2">
                                      {isOpenGuideline ? (
                                        <Button
                                          className="py-5 bg-blue-500 hover:bg-blue-500"
                                          onClick={(e) =>
                                            setIsOpenGuideline(!isOpenGuideline)
                                          }
                                        >
                                          Lanjut
                                        </Button>
                                      ) : (
                                        <AlertDialogAction
                                          className="py-5"
                                          disabled={
                                            codeAccess == "" ? true : false
                                          }
                                          onClick={(e) => handleDirectToExam(e)}
                                        >
                                          Mulai Pre Test
                                        </AlertDialogAction>
                                      )}

                                      <AlertDialogCancel
                                        onClick={() => setIsOpenGuideline(true)}
                                        className="py-5"
                                      >
                                        Close
                                      </AlertDialogCancel>
                                    </div>
                                  ) : (
                                    <div className="flex-col flex w-full gap-2">
                                      <p className=" text-center font-normal text-gray-500 -mt-2">
                                        Maaf kamu telah mengikuti ujian ini,
                                        kamu tidak memiliki akses lagi terkait
                                        ujian ini
                                      </p>
                                      <AlertDialogCancel className="py-5">
                                        Close
                                      </AlertDialogCancel>
                                    </div>
                                  )}
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <></>
                          )}
                        </div>
                      ) : userDetail?.PreTest > 65 ? (
                        <div className="flex flex-col items-start gap-1 ">
                          <TablePenilaian
                            userDetail={userDetail}
                            type="Pre-Test"
                          />
                          <span className="text-xs text-gray-300 leading-none">
                            Selamat, nilai pre-testmu cukup baik, ikuti
                            pelatihan dengan semangat dan dapatkan pengetahuan
                            serta wawasan baru dari pelatihan ini!
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1 ">
                          <TablePenilaian
                            userDetail={userDetail}
                            type="Pre-Test"
                          />
                          <span className="text-xs text-gray-300 leading-none">
                            Nilai pre-testmu kurang bagus, jangan menyerah,
                            ikuti pelatihan dengan cermat dan semangat untuk
                            bisa meningkatkan pengetahuan mu pada post-test
                            nanti!
                          </span>
                        </div>
                      )}
                    </p>
                  </div>
                )}

                <div
                  className={`flex flex-col sm:relative sm:before:absolute sm:before:top-2 sm:before:w-4 sm:before:h-4 sm:before:rounded-full sm:before:left-[-35px] sm:before:z-[1] ${pelatihan!.StatusApproval == "Selesai"
                    ? "before:bg-green-400"
                    : "before:bg-gray-300"
                    } bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] 
               transition-all duration-500 border-white/20 p-4 rounded-xl  cursor-pointer `}
                >
                  <h3 className="text-blue-400 text-lg font-semibold leading-none">
                    Pelaksanaan Pelatihan {pelatihan!.NamaPelatihan}
                  </h3>
                  {
                    isDatePassedOrToday(pelatihan!.TanggalBerakhirPelatihan) ? <time className="text-sm text-green-400 flex items-start gap-1">
                      <RiVerifiedBadgeFill className="mt-[0.134rem]" />
                      Pelatihan telah selesai
                    </time> : <time className="text-sm text-gray-300 flex items-start gap-1">
                      <PiQuestionFill className="mt-[0.134rem]" />
                      {generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan)}{" "}
                      -{" "}
                      {generateTanggalPelatihan(
                        pelatihan!.TanggalBerakhirPelatihan
                      )}
                    </time>
                  }

                  {isDatePassedOrToday(pelatihan!.TanggalBerakhirPelatihan) ? (
                    <span className="text-xs text-gray-300 leading-none">
                      Pelatihan{" "}
                      <span className="font-bold">
                        {pelatihan!.NamaPelatihan}
                      </span>{" "}
                      sudah selesai dilaksanakan, harap mengikuti arahan
                      selanjutnya oleh panitia atau instruktur pelatihan!
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300 leading-none">
                      Pelatihan{" "}
                      <span className="font-bold">
                        {pelatihan!.NamaPelatihan}
                      </span>{" "}
                      ini dilaksanakan secara{" "}
                      <span className="font-bold">
                        {" "}
                        {pelatihan!.PelaksanaanPelatihan}
                      </span>{" "}
                      harap dapat mengikuti pelatihan dengan seksama dan
                      semangat sobat E-LAUT!
                    </span>
                  )}
                </div>
                {pelatihan!.UjiKompotensi == "Tidak Ada Penilaian Teknis" ? (
                  <></>
                ) : (
                  <div
                    className={`flex flex-col sm:relative sm:before:absolute sm:before:top-2 sm:before:w-4 sm:before:h-4 sm:before:rounded-full sm:before:left-[-35px] sm:before:z-[1]  ${pelatihan!.StatusApproval != "Selesai" &&
                      userDetail?.PostTest == 0
                      ? "before:bg-gray-300"
                      : userDetail?.PostTest >= 65
                        ? "before:bg-green-400"
                        : "before:bg-rose-500"
                      } bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] 
               transition-all duration-500 border-white/20 p-4 rounded-xl  cursor-pointer `}
                  >
                    <h3 className="text-blue-400 text-lg font-semibold leading-none">
                      Pelaksanaan Post-Test
                    </h3>
                    <time
                      className={`text-sm font-medium text-gray-300  ${pelatihan!.StatusApproval != "Selesai" &&
                        userDetail?.PostTest == 0
                        ? "text-gray-300"
                        : userDetail?.PostTest >= 65
                          ? "text-green-400"
                          : "text-rose-500"
                        }`}
                    >
                      {userDetail?.PostTest == 0 ? (
                        <span className="flex items-start gap-1">
                          <PiQuestionFill className="mt-[0.134rem]" />
                          <span className="flex flex-col">
                            <span>Belum Melaksanakan Post-Test</span>
                          </span>
                        </span>
                      ) : userDetail?.PostTest >= 65 ? (
                        <span className="flex items-center">
                          <RiVerifiedBadgeFill className="text-xs" />
                          Nilai kamu memuaskan pada post-test!
                        </span>
                      ) : (
                        <span className="flex items-start gap-1">
                          <IoMdCloseCircle className="mt-[0.134rem]" />
                          <span className="flex flex-col">
                            <span>
                              Nilai kamu tidak memuaskan pada post-test!
                            </span>
                          </span>
                        </span>
                      )}
                    </time>
                    <p className="text-gray-300 leading-none">
                      {userDetail?.PostTest == 0 ? (
                        <div className="flex flex-col items-start justify-start text-xs">
                          <p className="">
                            Lakukan pelaksanaan post-test sebagai syarat
                            mengikuti pelatihan {userDetail?.NamaPelatihan} pada
                            link berikut{" "}
                          </p>
                          {userDetail!.Keterangan == "Valid" &&
                            userDetail!.PreTest > 0 ? (
                            <AlertDialog>
                              <AlertDialogTrigger>
                                <div
                                  onClick={() =>
                                    setCodeAccess(userDetail!.CodeAksess!)
                                  }
                                  className="underline text-blue-500"
                                >
                                  Link Ujian Post-Test{" "}
                                  {pelatihan!.NamaPelatihan}
                                </div>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="flex flex-col items-center justify-center !w-[420px]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="w-full flex gap-2 items-center justify-center flex-col">
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-b from-gray-200 via-whiter to-white flex items-center justify-center">
                                      <div className="w-20 h-20 rounded-full  bg-gradient-to-b from-gray-300 via-whiter to-white flex items-center justify-center ">
                                        <Logo />
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-1 w-full justify-center items-center">
                                      {userDetail!.PostTest == 0 && (
                                        <h1 className="font-bold text-2xl text-center leading-[100%]">
                                          {pelatihan! &&
                                            pelatihan!.NamaPelatihan}
                                        </h1>
                                      )}

                                      {userDetail!.PostTest == 0 && (
                                        <>
                                          {" "}
                                          {pelatihan.StatusApproval ==
                                            "Selesai" && (
                                              <AlertDialogDescription className="w-full text-center font-normal text-sm mt-2 border-b border-b-gray-300 pb-3">
                                                Sebagai bagian dari pelaksanaan
                                                pelatihan agar dapat mengetahui
                                                kemampuan peserta diawal harap
                                                untuk mengikuti{" "}
                                                <span className="italic">
                                                  post-test
                                                </span>{" "}
                                                dan{" "}
                                                {isOpenGuideline
                                                  ? "membaca petunjuk pengerjaan"
                                                  : "memasukkan kode akses"}{" "}
                                                terlebih dahulu
                                              </AlertDialogDescription>
                                            )}
                                          {pelatihan.StatusApproval !=
                                            "Selesai" ? (
                                            <div className="mt-2">
                                              <p className="font-normal text-neutral-500 text-sm text-center ">
                                                Pelaksanaan post-test
                                                dilaksanaan secara serentak,
                                                tunggu arahan dari instruktur
                                                dan panitia pelaksana untuk
                                                memulai dan mengerjakan ujian
                                                post-test pada waktu yang
                                                ditentukan!
                                              </p>
                                            </div>
                                          ) : isOpenGuideline ? (
                                            <AlertDialogDescription className="w-full text-left font-normal text-sm mt-2">
                                              <span className="font-semibold text-[#000]">
                                                Petunjuk Pengerjaan :{" "}
                                              </span>
                                              <br />
                                              <span>
                                                {" "}
                                                1.Pilih salah satu jawaban yang
                                                Saudara anggap paling
                                                tepat/benar!
                                              </span>{" "}
                                              <br />
                                              <span>
                                                {" "}
                                                2. Dalam menjawab soal, gunakan
                                                gadget yang mumpuni!
                                              </span>{" "}
                                              <br />
                                              <span>
                                                {" "}
                                                3. Waktu yang disediakan untuk
                                                mengerjakan soal adalah 15
                                                menit!
                                              </span>{" "}
                                              <br />
                                              <span>
                                                {" "}
                                                4. Tidak diperbolehkan membuka
                                                buku, handphone dll!
                                              </span>
                                            </AlertDialogDescription>
                                          ) : (
                                            <fieldset className="w-full"></fieldset>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="w-full">
                                  {pelatihan!.StatusApproval != "Selesai" ? (
                                    <AlertDialogCancel
                                      onClick={() => setIsOpenGuideline(true)}
                                      className="py-5 w-full"
                                    >
                                      Close
                                    </AlertDialogCancel>
                                  ) : userDetail!.PostTest == 0 ? (
                                    <div className="flex-col flex w-full gap-2">
                                      {isOpenGuideline ? (
                                        <Button
                                          className="py-5 bg-blue-500 hover:bg-blue-500"
                                          onClick={(e) =>
                                            setIsOpenGuideline(!isOpenGuideline)
                                          }
                                        >
                                          Lanjut
                                        </Button>
                                      ) : (
                                        <AlertDialogAction
                                          className="py-5"
                                          disabled={
                                            pelatihan!.StatusApproval !=
                                              "Selesai"
                                              ? true
                                              : false
                                          }
                                          onClick={(e) =>
                                            handleDirectToExamPostTest(e)
                                          }
                                        >
                                          Mulai Post Test
                                        </AlertDialogAction>
                                      )}

                                      <AlertDialogCancel
                                        onClick={() => setIsOpenGuideline(true)}
                                        className="py-5"
                                      >
                                        Close
                                      </AlertDialogCancel>
                                    </div>
                                  ) : (
                                    <div className="flex-col flex w-full gap-2">
                                      <p className=" text-center font-normal text-gray-500 -mt-2">
                                        Maaf kamu telah mengikuti ujian ini,
                                        kamu tidak memiliki akses lagi terkait
                                        ujian ini
                                      </p>
                                      <AlertDialogCancel className="py-5">
                                        Close
                                      </AlertDialogCancel>
                                    </div>
                                  )}
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <></>
                          )}
                        </div>
                      ) : userDetail?.PostTest > 65 ? (
                        <div className="flex flex-col items-start gap-1 ">
                          <TablePenilaian
                            userDetail={userDetail}
                            type="Post-Test"
                          />
                          <span className="text-xs">
                            Selamat, nilai pre-testmu cukup baik, ikuti
                            pelatihan dengan semangat dan dapatkan pengetahuan
                            serta wawasan baru dari pelatihan ini!
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1 ">
                          <TablePenilaian
                            userDetail={userDetail}
                            type="Post-Test"
                          />
                          <span className="text-xs">
                            Nilai post-testmu kurang bagus, jangan menyerah,
                            ikuti pelatihan dengan cermat dan semangat untuk
                            bisa meningkatkan pengetahuan mu pada post-test
                            nanti!
                          </span>
                          {!userDetail.FileSertifikat.includes('Signed') && (
                            <AlertDialog>
                              <AlertDialogTrigger className="w-full">
                                <Button
                                  type="button"
                                  onClick={() =>
                                    setCodeAccess(userDetail!.CodeAksess!)
                                  }
                                  variant="outline"
                                  className="w-full border mt-3 flex gap-2 border-gray-600 text-left capitalize items-center justify-center"
                                >
                                  <IoReloadCircle className="h-4 w-4 text-gray-300" />{" "}
                                  <span className="text-sm">
                                    {" "}
                                    Lakukan Remedial
                                  </span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="flex flex-col items-center justify-center !w-[420px]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="w-full flex gap-2 items-center justify-center flex-col">
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-b from-gray-200 via-whiter to-white flex items-center justify-center">
                                      <div className="w-20 h-20 rounded-full  bg-gradient-to-b from-gray-300 via-whiter to-white flex items-center justify-center ">
                                        <Logo />
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-1 w-full justify-center items-center">
                                      {userDetail!.PostTest < 65 && (
                                        <h1 className="font-bold text-2xl text-center leading-[100%]">
                                          {pelatihan! &&
                                            pelatihan!.NamaPelatihan}
                                        </h1>
                                      )}

                                      {userDetail!.PostTest < 65 && (
                                        <>
                                          {" "}
                                          {pelatihan.StatusApproval ==
                                            "Selesai" && (
                                              <AlertDialogDescription className="w-full text-center font-normal text-sm mt-2 border-b border-b-gray-300 pb-3">
                                                Sebagai bagian dari pelaksanaan
                                                pelatihan agar dapat memperbaiki
                                                nilai remedial silahkan lakukan{" "}
                                                <span className="italic">
                                                  remedial
                                                </span>{" "}
                                                dan{" "}
                                                {isOpenGuideline
                                                  ? "membaca petunjuk pengerjaan"
                                                  : "memasukkan kode akses"}{" "}
                                                terlebih dahulu
                                              </AlertDialogDescription>
                                            )}
                                          {pelatihan.StatusApproval !=
                                            "Selesai" ? (
                                            <div className="mt-2">
                                              <p className="font-normal text-neutral-500 text-sm text-center ">
                                                Pelaksanaan remedial dilaksanaan
                                                secara serentak, tunggu arahan
                                                dari instruktur dan panitia
                                                pelaksana untuk memulai dan
                                                mengerjakan ujian remedial pada
                                                waktu yang ditentukan!
                                              </p>
                                            </div>
                                          ) : isOpenGuideline ? (
                                            <AlertDialogDescription className="w-full text-left font-normal text-sm mt-2">
                                              <span className="font-semibold text-[#000]">
                                                Petunjuk Pengerjaan :{" "}
                                              </span>
                                              <br />
                                              <span>
                                                {" "}
                                                1.Pilih salah satu jawaban yang
                                                Saudara anggap paling
                                                tepat/benar!
                                              </span>{" "}
                                              <br />
                                              <span>
                                                {" "}
                                                2. Dalam menjawab soal, gunakan
                                                gadget yang mumpuni!
                                              </span>{" "}
                                              <br />
                                              <span>
                                                {" "}
                                                3. Waktu yang disediakan untuk
                                                mengerjakan soal adalah 15
                                                menit!
                                              </span>{" "}
                                              <br />
                                              <span>
                                                {" "}
                                                4. Tidak diperbolehkan membuka
                                                buku, handphone dll!
                                              </span>
                                            </AlertDialogDescription>
                                          ) : (
                                            <fieldset className="w-full"></fieldset>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="w-full">
                                  {pelatihan!.StatusApproval != "Selesai" ? (
                                    <AlertDialogCancel
                                      onClick={() => setIsOpenGuideline(true)}
                                      className="py-5 w-full"
                                    >
                                      Close
                                    </AlertDialogCancel>
                                  ) : userDetail!.PostTest < 65 ? (
                                    <div className="flex-col flex w-full gap-2">
                                      {isOpenGuideline ? (
                                        <Button
                                          className="py-5 bg-blue-500 hover:bg-blue-500"
                                          onClick={(e) =>
                                            setIsOpenGuideline(!isOpenGuideline)
                                          }
                                        >
                                          Lanjut
                                        </Button>
                                      ) : (
                                        <AlertDialogAction
                                          className="py-5"
                                          disabled={
                                            pelatihan!.StatusApproval !=
                                              "Selesai"
                                              ? true
                                              : false
                                          }
                                          onClick={(e) =>
                                            handleDirectToExamPostTest(e)
                                          }
                                        >
                                          Mulai Remedial
                                        </AlertDialogAction>
                                      )}

                                      <AlertDialogCancel
                                        onClick={() => setIsOpenGuideline(true)}
                                        className="py-5"
                                      >
                                        Close
                                      </AlertDialogCancel>
                                    </div>
                                  ) : (
                                    <div className="flex-col flex w-full gap-2">
                                      <p className=" text-center font-normal text-gray-500 -mt-2">
                                        Maaf kamu telah mengikuti ujian ini,
                                        kamu tidak memiliki akses lagi terkait
                                        ujian ini
                                      </p>
                                      <AlertDialogCancel className="py-5">
                                        Close
                                      </AlertDialogCancel>
                                    </div>
                                  )}
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      )}
                    </p>
                  </div>
                )}

                <div
                  className={`flex flex-col sm:relative sm:before:absolute sm:before:top-2 sm:before:w-4 sm:before:h-4 sm:before:rounded-full sm:before:left-[-35px] sm:before:z-[1] ${pelatihan?.StatusPenerbitan == "Done"
                    ? "before:bg-green-400"
                    : "before:bg-gray-300"
                    } bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] 
               transition-all duration-500 border-white/20 p-4 rounded-xl  cursor-pointer `}
                >
                  <h3 className="text-blue-400 text-lg font-semibold leading-none">
                    Sertifikat Pelatihan {pelatihan!.NamaPelatihan}
                  </h3>
                  {
                    pelatihan?.StatusPenerbitan == 'Done' ? <time className="text-sm text-green-400 flex items-start gap-1">
                      <RiVerifiedBadgeFill className="mt-[0.134rem]" />
                      Sertifikat telah terbit
                    </time> : <time className="text-sm text-gray-300 flex items-start gap-1">
                      <PiQuestionFill className="mt-[0.134rem]" />
                      Sertifikat belum terbit
                    </time>
                  }


                  <span className="text-xs text-gray-300 leading-none">
                    {pelatihan!.StatusPenerbitan != "Done"
                      ? "Harap mengikuti rangkaian pelaksanaan pelatihan untuk mendapatkan sertifikat."
                      :
                      userDetail?.FileSertifikat.includes('signed')
                        ? "Selamat, anda telah mengikuti dan menyelesaikan rangkaian pelatihan. Berikut sertifikat yang dapat kamu akses"
                        : "Oops. Sertifikat kamu masih dalam proses penerbitan, harap ditunggu ya paling lambat 3x24 jam. Pantau terus dashboard-mu ya sobat E-LAUT!"}
                  </span>
                  {userDetail!.FileSertifikat.includes('signed') && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border mt-3 flex gap-2 border-blue-600 text-left capitalize items-center justify-center"
                    >
                      <Link
                        href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${userDetail!.FileSertifikat
                          }`}
                        target="_blank"
                        className="flex w-full items-center justify-center"
                      >
                        <RiVerifiedBadgeFill className="h-4 w-4 text-blue-600" />{" "}
                        <span className="text-sm"> Download Sertifikat</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TablePenilaian = ({
  userDetail,
  type,
}: {
  userDetail: UserPelatihan;
  type: string;
}) => {
  return (
    <table className="min-w-full border border-neutral-200 rounded-md text-center text-sm font-light text-surface mb-2 mt-2">
      <thead className="border-b border-neutral-200 font-medium ">
        <tr>
          <th scope="col" className="border-e border-neutral-200 px-4 py-3 ">
            #
          </th>
          {type == "Pre-Test" && (
            <th scope="col" className="border-e border-neutral-200 px-4 py-3 ">
              Pre-test
            </th>
          )}

          {type == "Post-Test" && (
            <th scope="col" className="border-e border-neutral-200 px-4 py-3 ">
              Post-test
            </th>
          )}

          {type == "Remedial" && userDetail.PostTest < 65 && (
            <th scope="col" className="border-e border-neutral-200 px-4 py-3 ">
              Remedial
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-neutral-200 ">
          <td className="whitespace-nowrap border-e border-neutral-200 px-4 py-3 font-medium ">
            1
          </td>
          {type == "Pre-Test" && (
            <td className="whitespace-nowrap border-e border-neutral-200 px-4 py-3 ">
              {userDetail!.PreTest!}
            </td>
          )}

          {type == "Post-Test" && (
            <td className="whitespace-nowrap border-e border-neutral-200 px-4 py-3 ">
              {userDetail!.PostTest!}
            </td>
          )}

          {type == "Remedial" && userDetail.PostTest < 65 && (
            <td className="whitespace-nowrap border-e border-neutral-200 px-4 py-3 "></td>
          )}
        </tr>
      </tbody>
    </table>
  );
};
