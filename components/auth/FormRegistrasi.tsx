"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FormEvent, MouseEventHandler } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { error } from "console";
import Cookies from "js-cookie";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";

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

import { Button } from "@/components/ui/button";
import { TbNumber } from "react-icons/tb";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { IoMdCloseCircle } from "react-icons/io";

// RECAPTCHA
import ReCAPTCHA from "react-google-recaptcha";

import { HiMiniUserGroup, HiOutlineEye } from "react-icons/hi2";
import { elautBaseUrl, manningAgentDevUrl } from "@/constants/urls";
import { sanitizedDangerousChars, validateIsDangerousChars } from "@/utils/input";
import { HiOutlineEyeOff } from "react-icons/hi";
import { handlePasswordCriteria } from "@/utils/security";
import Toast from "@/commons/Toast";

function FormRegistrasi() {
  const router = useRouter();

  const recaptchaRef = React.createRef();
  const [role, setRole] = React.useState<string>("Perseorangan");

  const [captcha, setCaptcha] = React.useState<string | null>();

  const [noKusuka, setNoKusuka] = React.useState("");

  const [isHandlingCekKUSUKA, setIsHandlingCekKUSUKA] = React.useState<boolean>(false)
  const handleCheckingNoKusuka = async (e: any) => {
    e.preventDefault();
    setIsHandlingCekKUSUKA(true)
    if (validateIsDangerousChars(noKusuka)) {
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: `Kamu memasukkan karakter berbahaya pada input no kusuka, pencarian no kusuka tidak dapat diproses!`,
      });
    } else {
      try {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/getDataKusuka?nomor_kusuka=${sanitizedDangerousChars(noKusuka)}`;
        const response = await axios.get(url);
        setOpenInfoKusuka(false);
        if (response.data.data == "Anda tidak memiliki akses") {
          Toast.fire({
            icon: "error",
            title: 'Oopsss!',
            text: `Internal server error, token tidak memiliki akses!`,
          });
          setOpenInfoKusuka(false);
          setIsHandlingCekKUSUKA(false)
        }

        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          const data = response.data.data[0];
          console.log({ response });
          setIsKusukaUser(true);
          setName(data.NamaPelakuUtama?.toUpperCase());
          setEmail("");
          setNik(data.NomorKUSUKA);
          setPhoneNumber("");
          setOpenInfoKusuka(true);
          setIsHandlingCekKUSUKA(false)
        } else {
          console.log({ response });
          setOpenInfoKusuka(true);
          setIsKusukaUser(false);
          setIsHandlingCekKUSUKA(false)
        }
      } catch (error: any) {
        setOpenInfoKusuka(false);
        setIsHandlingCekKUSUKA(false)
        setIsKusukaUser(false);
        Toast.fire({
          icon: "error",
          title: 'Oopsss!',
          text: `Internal server error, hubungi helpdesk!`,
        });
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        } else if (error.request) {
          console.error("Request data:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
        console.error("Error config:", error.config);

      }
    }

  };

  /* state variable to store basic user information to register */
  const [name, setName] = React.useState<string>("");
  const [nik, setNik] = React.useState<string>("");

  const [phoneNumber, setPhoneNumber] = React.useState<string>("62");
  const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Always force prefix "62"
    if (!value.startsWith("62")) {
      value = "62" + value.replace(/^0?/, ""); // remove leading 0 if user types it
    }

    setPhoneNumber(value);

    // Error if length (after 62) is too short
    setIsInputErrorNoTelpon(value.length > 0 && value.length <= 14);
  };

  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [confirmPassword, setConfirmPassword] = React.useState<string>("");

  const clearForm = () => {
    setName("");
    setNik("");
    setPhoneNumber("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [isInputError, setIsInputError] = React.useState(false);
  const [isInputErrorNIK, setIsInputErrorNIK] = React.useState(false);
  const [isKUSUKA, setIsKUSUKA] = React.useState("");

  const handleRegistrasiAkun = async (e: FormEvent) => {
    e.preventDefault();
    if (handlePasswordCriteria(password)) {
      if (name == "" || nik == "" || phoneNumber == "" || password == "") {
        Toast.fire({
          icon: "error",
          title: 'Oopsss!',
          text: `Tolong lengkapi data registrasi!`,
        });
        setIsInputError(true);
      } else {
        if (validateIsDangerousChars(name) || validateIsDangerousChars(nik) || validateIsDangerousChars(phoneNumber) || validateIsDangerousChars(password)) {
          Toast.fire({
            icon: "error",
            title: "Oopsss!",
            text: `Kamu memasukkan karakter berbahaya pada form registrasi, registrasi akun tidak dapat diproses!`,
          });
        } else {
          if ((nik.length > 0 && nik.length < 16) || (phoneNumber.length > 0 && phoneNumber.length < 12)) {
            Toast.fire({
              icon: "error",
              title: "Oopsss!",
              text: `NIK atau no telpon-mu tidak sesuai digit yang diharuskan!`,
            });
          } else {
            if (captcha) {
              try {
                const response: AxiosResponse = await axios.post(
                  `${baseUrl}/users/registerUser`,
                  JSON.stringify({
                    nik: sanitizedDangerousChars(nik),
                    nama: sanitizedDangerousChars(name.toUpperCase()),
                    password: sanitizedDangerousChars(password),
                    no_number: sanitizedDangerousChars(phoneNumber.toString()),
                    kusuka_users: sanitizedDangerousChars(isKUSUKA),
                  }),
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                Cookies.set("XSRF083", "true");

                Toast.fire({
                  icon: "success",
                  title: 'Yeayyy!',
                  text: `Berhasil melakukan registrasi akun, silahkan untuk login terlebih dahulu!`,
                });
                router.push("/login");
              } catch (error: any) {
                console.error({ error });
                if (
                  error.response &&
                  error.response.data &&
                  error.response.data.Message
                ) {
                  const errorMsg = error.response.data.Message;
                  Toast.fire({
                    icon: "error",
                    title: 'Oopsss!',
                    text: `Gagal melakukan registrasi akun, ${errorMsg}!`,
                  });
                } else {
                  Toast.fire({
                    icon: "error",
                    title: 'Oopsss!',
                    text: `Gagal melakukan registrasi akun. Terjadi kesalahan tidak diketahui.`,
                  });
                }
              }
            }
          }

        }

      }
    }
  };

  const [emailManningAgent, setEmailManningAgent] = React.useState<string>("");
  const [passwordManningAgent, setPasswordManningAgent] =
    React.useState<string>("");
  const [namaManningAgent, setNamaManningAgent] = React.useState<string>("");
  const [noTelponManingAgent, setNoTelponManningAgent] =
    React.useState<string>("");
  const [namaPenanggungJawabManningAgent, setNamaPenanggungJawabManningAgent] =
    React.useState<string>("");
  const [alamat, setAlamat] = React.useState<string>("");

  const clearFormManningAgent = () => {
    setEmailManningAgent("");
    setPasswordManningAgent("");
    setNamaManningAgent("");
    setNoTelponManningAgent("");
    setNamaPenanggungJawabManningAgent("");
    setAlamat("");
  };

  const handleRegistrasiAkunManningAgent = async (e: FormEvent) => {
    e.preventDefault();
    if (handlePasswordCriteria(passwordManningAgent)) {
      if (
        emailManningAgent == "" ||
        passwordManningAgent == "" ||
        namaManningAgent == "" ||
        noTelponManingAgent == "" ||
        namaPenanggungJawabManningAgent == "" ||
        alamat == ""
      ) {
        Toast.fire({
          icon: "error",
          title: 'Oopsss!',
          text: `Tolong lengkapi data registrasi!`,
        });
        setIsInputError(true);
      } else {
        if (validateIsDangerousChars(emailManningAgent) || validateIsDangerousChars(passwordManningAgent) || validateIsDangerousChars(namaManningAgent) || validateIsDangerousChars(noTelponManingAgent) || validateIsDangerousChars(namaPenanggungJawabManningAgent) || validateIsDangerousChars(alamat)) {
          Toast.fire({
            icon: "error",
            title: "Oopsss!",
            text: `Kamu memasukkan karakter berbahaya pada form registrasi, registrasi akun tidak dapat diproses!`,
          });
        } else {
          if ((passwordManningAgent.length > 0 && passwordManningAgent.length < 16) || (noTelponManingAgent.length > 0 && noTelponManingAgent.length < 12)) {
            Toast.fire({
              icon: "error",
              title: "Oopsss!",
              text: `NIK atau no telpon-mu tidak sesuai digit yang diharuskan!`,
            });
          } else {
            if (captcha) {
              try {
                const response: AxiosResponse = await axios.post(
                  `${elautBaseUrl}/manningAgent/registerManningAgent`,
                  JSON.stringify({
                    email: sanitizedDangerousChars(emailManningAgent),
                    password: sanitizedDangerousChars(passwordManningAgent),
                    nama_maning_agent: sanitizedDangerousChars(namaManningAgent),
                    no_telpon: sanitizedDangerousChars(noTelponManingAgent),
                    nama_penanggung_jawab: sanitizedDangerousChars(namaPenanggungJawabManningAgent),
                    alamat: sanitizedDangerousChars(alamat),
                  }),
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
                Cookies.set("XSRF083", "true");

                Toast.fire({
                  icon: "success",
                  title: 'Yeayyy!',
                  text: `Berhasil melakukan registrasi akun, silahkan untuk login terlebih dahulu!`,
                });
                router.push("/login");
                clearFormManningAgent();
              } catch (error: any) {
                console.error({ error });
                if (
                  error.response &&
                  error.response.data &&
                  error.response.data.Message
                ) {
                  const errorMsg = error.response.data.Message;
                  Toast.fire({
                    icon: "error",
                    title: 'Oopsss!',
                    text: `Gagal melakukan registrasi akun, ${errorMsg}!`,
                  });
                  clearFormManningAgent();
                } else {
                  Toast.fire({
                    icon: "error",
                    title: 'Oopsss!',
                    text: `Gagal melakukan registrasi akun. Terjadi kesalahan tidak diketahui.`,
                  });
                  clearFormManningAgent();
                }
              }
            }
          }

        }

      }
    }

  };

  const [openInfoKusuka, setOpenInfoKusuka] = React.useState(false);
  const [isKusukaUser, setIsKusukaUser] = React.useState(false);

  const [imageIndex, setImageIndex] = React.useState(0);
  const images = ["/images/hero-img6.jpg"];

  const [imageMobIndex, setImageMobIndex] = React.useState(0);
  const imagesMob = ["/diklat/bstf-1.jpg"];

  const [useKUSUKA, setUseKUSUKA] = React.useState<boolean>(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      setImageMobIndex((prevIndex) => (prevIndex + 1) % imagesMob.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const [isInputErrorNoTelpon, setIsInputErrorNoTelpon] = React.useState<boolean>(true)

  const [isMatch, setIsMatch] = React.useState<boolean>(true);
  const [isMatchManning, setIsMatchManning] = React.useState<boolean>(true);

  const handlePasswordChange = (e: any) => {
    const value = e.target.value;
    setPassword(value);

    // Cek kesesuaian dengan confirmPassword
    setIsMatch(value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e: any) => {
    const value = e.target.value;
    setConfirmPassword(value);

    // Cek kesesuaian dengan password
    setIsMatch(password === value);
  };

  const handlePasswordManningChange = (e: any) => {
    const value = e.target.value;
    setPasswordManningAgent(value);

    // Cek kesesuaian dengan confirmPassword
    setIsMatchManning(value === confirmPassword);
  };

  const handleConfirmPasswordManningChange = (e: any) => {
    const value = e.target.value;
    setConfirmPassword(value);

    // Cek kesesuaian dengan password
    setIsMatchManning(passwordManningAgent === value);
  };

  const [isShowPassword, setIsShowPassword] = React.useState<boolean>(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = React.useState<boolean>(false);


  return (
    <section className="flex flex-col">
      <div className=" h-full pb-10 w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white">
        {/* gradient blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <AlertDialog open={openInfoKusuka}>
          <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl text-white">
            <AlertDialogHeader>
              <div className="flex flex-col gap-0">
                <AlertDialogTitle className="text-xl font-bold text-white drop-shadow-md">
                  {isKusukaUser
                    ? "No KUSUKA Tersedia!"
                    : "No KUSUKA Tidak Tersedia!"}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-200">
                  {isKusukaUser
                    ? "Selamat karena anda merupakan pelaku utama dan memiliki nomor KUSUKA, klik lanjutkan untuk mengisi data secara otomatis"
                    : "Maaf nomor KUSUKA tidak tersedia, kamu dapat registrasi manual kedalam ELAUT!"}
                </AlertDialogDescription>
              </div>

              <AlertDialogTitle>
                <div className="flex w-full items-center justify-center gap-1 text-xl md:text-3xl border border-white/20 bg-white/5 rounded-xl py-3">
                  {isKusukaUser ? (
                    <RiVerifiedBadgeFill className="text-green-400 text-3xl" />
                  ) : (
                    <IoMdCloseCircle className="text-rose-500 text-3xl" />
                  )}

                  <span className="font-semibold text-white">{noKusuka}</span>
                </div>
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={(e) => {
                  setOpenInfoKusuka(false);
                  clearForm();
                }}
                className={`bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 shadow-lg transition-all ${!isKusukaUser && "-mt-2"}`}
              >
                {isKusukaUser ? "Batal" : "Oke"}
              </AlertDialogCancel>
              {isKusukaUser && (
                <AlertDialogAction
                  onClick={(e) => {
                    setOpenInfoKusuka(false);
                    setIsKUSUKA("yes");
                    Cookies.set("IsUsedKusuka", "yes");
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all h-10"
                >
                  Lanjutkan
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Image
          src={images[imageIndex]}
          className="absolute w-full h-full hidden md:block object-cover duration-1000 opacity-15 z-0"
          alt=""
          layout="fill"
          priority
        />

        <Image
          src={imagesMob[imageMobIndex]}
          className="absolute w-full h-full block md:hidden object-cover duration-1000 opacity-15 z-0"
          alt=""
          layout="fill"
          priority

        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6  relative">
          <div className="pt-48 ">
            <div className="w-full mx-auto text-center pb-0 md:pb-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl leading-[110%] text-white drop-shadow-lg font-calsans mb-4">
                <span className="">
                  Registrasi Akun
                </span>{" "}
                <span className="z-0 bg-clip-text  w-[600px] leading-[110%]  text-transparent bg-gradient-to-r  from-blue-400  to-teal-400">
                  E-LAUT
                </span>{" "}
              </h1>
              <p className="text-sm sm:text-base text-center mx-auto text-white/80 mt-2 max-w-3xl">
                Registrasi tersedia dalam tiga opsi: Perseorangan untuk individu,
                Corporate untuk grup, dan Portofolio untuk yang punya rekam
                jejak atau sertifikasi. Fleksibel sesuai kebutuhan!
              </p>
            </div>

            <div
              className={`${role == "Perseorangan" || role == "" || role == "Portfolio"
                ? "max-w-2xl"
                : "max-w-4xl"
                }  mx-5 md:mx-auto mt-5`}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8">
                {/* <div className="flex flex-col gap-1">
                <label
                  className="block text-gray-200 text-sm font-medium mb-1"
                  htmlFor="name"
                >
                  Daftar Sebagai <span className="text-red-600"></span>
                </label>
                <Select
                  value={role}
                  onValueChange={(value: string) => { setRole(value); setIsShowPassword(false); setIsShowConfirmPassword(false); setConfirmPassword('') }}
                >
                  <SelectTrigger className="form-input w-full py-6 bg-transparent placeholder:text-gray-200 border-gray-400 focus:border-gray-200  active:border-gray-200 text-gray-200">
                    <p className="mr-3 flex items-center gap-1 text-base text-gray-300">
                      <HiMiniUserGroup />
                      {role != "" ? role : "Pilih Mendaftar Sebagai"}
                    </p>
                  </SelectTrigger>
                  <SelectContent side="bottom" className=" flex flex-col gap-1 mt-2 
              bg-white/10 backdrop-blur-xl border border-white/20 
              rounded-2xl shadow-xl p-3 text-white">
                    <SelectGroup>
                      <SelectLabel>Mendaftar Sebagai</SelectLabel>
                      <SelectItem className="flex gap-2 items-center px-3 py-2 rounded-lg hover:bg-white/5 text-white" value="Perseorangan">Perseorangan</SelectItem>
                      <SelectItem className="flex gap-2 items-center px-3 py-2 rounded-lg hover:bg-white/5 text-white" value="Corporate/Manning Agent" >
                        Corporate/Manning Agent
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div> */}
                {useKUSUKA && (
                  <form
                    onSubmit={(e) => handleCheckingNoKusuka(e)}
                    className="w-full flex gap-1 mt-2"
                  >
                    <div className="w-full">
                      <label
                        className="block text-gray-200 text-sm font-medium mb-1"
                        htmlFor="name"
                      >
                        No KUSUKA <span className="text-red-600"></span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Masukkan nomor KUSUKA"
                        value={noKusuka}
                        onChange={(e) => setNoKusuka(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-wrap -mx-3 mt-6">
                      <div className="w-full px-3">
                        <button
                          type="submit"
                          disabled={isHandlingCekKUSUKA ? true : false}
                          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isHandlingCekKUSUKA ? 'Loading...' : 'Cek'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {role == "Perseorangan" && (
                  <>
                    <div className="flex items-center my-6">
                      <div
                        className="border-t border-white/20 grow mr-3"
                        aria-hidden="true"
                      ></div>
                      <div
                        className="border-t border-white/20 grow ml-3"
                        aria-hidden="true"
                      ></div>
                    </div>
                    <form
                      onSubmit={(e) => handleRegistrasiAkun(e)}
                      autoComplete="off"
                    >
                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-200 text-sm font-medium mb-1"
                            htmlFor="name"
                          >
                            Nama Lengkap <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="name"
                            type="text"
                            className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Masukkan nama lengkap tanpa gelar"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                          {isInputError ? (
                            <span className="text-rose-500 font-medium">
                              *Masukkan nama lengkap!
                            </span>
                          ) : <p className="text-white/60 leading-[100%] text-xs font-medium mt-2">
                            * Tanpa gelar apapun, hanya nama lengkap
                          </p>}
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-200 text-sm font-medium mb-1"
                            htmlFor="nik"
                          >
                            NIK/NIP/NIM/PASPOR <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="nik"
                            type="text"
                            className={`form-input w-full p-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isInputError ? "border-red-500" : "border-white/20"
                              }`}
                            placeholder="Masukkan NIK/NIP/NIM/PASPOR"
                            value={nik}
                            maxLength={20}
                            onChange={(e) => {
                              const value = e.target.value;
                              setNik(value);
                              setIsInputErrorNIK(value.length > 20);
                            }}
                            required
                          />
                          {isInputErrorNIK ? (
                            <span className="text-rose-500 font-medium text-xs">
                              *NIK/NIP/NIM/PASPOR maksimal 20 karakter!
                            </span>
                          ) : <p className="text-white/60 leading-[100%] text-xs font-medium mt-2">
                            * NIK/NIP/NIM/PASPOR harus valid karena untuk kebutuhan sertifikat
                          </p>}
                        </div>
                      </div>

                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-200 text-sm font-medium mb-1"
                            htmlFor="email"
                          >
                            No Telpon <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="phone number"
                            type="text"
                            className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Masukkan no telpon/WA"
                            value={phoneNumber}
                            minLength={12}
                            maxLength={14}
                            onChange={handleChangePhoneNumber}
                            required
                          />
                          {isInputErrorNoTelpon && phoneNumber != '' && (
                            <span className="text-rose-500 font-medium text-xs">
                              *No Telpon minimal 12 digit!
                            </span>
                          )}
                          {isInputError && (
                            <span className="text-rose-500 font-medium">
                              *Masukkan no telpon!
                            </span>
                          )}
                          {(!isInputError && !isInputErrorNoTelpon) && <p className="text-gray-400 leading-[100%] text-xs font-medium mt-2">
                            * Masukkan nomor yang dapat dihubungi penyelenggara
                          </p>}
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-200 text-sm font-medium mb-1"
                            htmlFor="password"
                          >
                            Password <span className="text-red-600">*</span>
                          </label>
                          <span className="relative w-full h-fit">
                            <input
                              id="password"
                              type={isShowPassword ? 'text' : 'password'}
                              className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Buat password"
                              required
                              value={password}
                              onChange={(e) => handlePasswordChange(e)}
                            />
                            <span onClick={(e) => setIsShowPassword(!isShowPassword)}>
                              {isShowPassword ? (
                                <HiOutlineEyeOff className="text-white/70 hover:text-white my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer transition-colors" />
                              ) : (
                                <HiOutlineEye className="text-white/70 hover:text-white my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer transition-colors" />
                              )}
                            </span>
                          </span>

                          {isInputError ? (
                            <span className="text-rose-500 font-medium">
                              *Masukkan password!
                            </span>
                          ) : (
                            <p className="text-gray-400 leading-[100%] text-xs font-medium mt-2">
                              *Password minimal 8 karakter, harus terdiri dari
                              satu angka, huruf kapital dan kecil, serta karakter
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-200 text-sm font-medium mb-1"
                            htmlFor="password"
                          >
                            Konfirmasi Password <span className="text-red-600">*</span>
                          </label>
                          <span className="relative w-full h-fit">
                            <input
                              id="confirmPassword"
                              type={isShowConfirmPassword ? 'text' : 'password'}
                              className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Konfirmasi password"
                              required
                              value={confirmPassword}
                              onChange={(e) => handleConfirmPasswordChange(e)}
                            />
                            <span onClick={(e) => setIsShowConfirmPassword(!isShowConfirmPassword)}>
                              {isShowConfirmPassword ? (
                                <HiOutlineEyeOff className="text-white/70 hover:text-white my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer transition-colors" />
                              ) : (
                                <HiOutlineEye className="text-white/70 hover:text-white my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer transition-colors" />
                              )}
                            </span>
                          </span>

                          {(!isMatch && confirmPassword != '') && (
                            <span className="text-rose-500 text-xs font-medium">
                              *Password dan konfirmasi password tidak sesuai!
                            </span>
                          )}
                          {isInputError && (
                            <span className="text-rose-500 font-medium">
                              *Masukkan konfirmasi password!
                            </span>
                          )}
                        </div>
                      </div>
                      {(confirmPassword != "" && nik != "" && password != "" && phoneNumber != '' && name != '') && isMatch && (
                        <div
                          className="flex flex-wrap w-full mb-1"
                          style={{ width: "100% !important" }}
                        >
                          <div
                            className="w-full"
                            style={{ width: "100% !important" }}
                          >
                            <label
                              className="block text-gray-200 text-sm font-medium mb-1"
                              htmlFor="password"
                            >
                              Verify if you are not a robot{" "}
                              <span className="text-red-600">*</span>
                            </label>
                            <ReCAPTCHA
                              style={{ width: "100% !important" }}
                              sitekey={
                                process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!
                              }
                              className=" w-[600px] font-inter text-sm"
                              onChange={setCaptcha}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap -mx-3 mt-3">
                        <div className="w-full px-3 flex flex-col gap-2">
                          <Button
                            type="submit"
                            disabled={captcha == null}
                            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Registrasi
                          </Button>

                          {!useKUSUKA && role == "Perseorangan" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                setUseKUSUKA(!useKUSUKA);
                                window.scrollTo(0, 0);
                              }}
                              className="w-full flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg border border-white/20 shadow-lg transition-all font-semibold text-sm sm:text-base"
                            >
                              <Image
                                src={"/logo-kkp-full-white.png"}
                                className="w-6"
                                alt=""
                                width={0}
                                height={0}
                              />
                              <span>Daftar Dengan KUSUKA</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-200 text-center mt-3">
                        Dengan membuat akun, anda menyetujui{" "}
                        <a className="underline" href="#0">
                          Ketentuan & Kondisi
                        </a>
                        , serta{" "}
                        <a className="underline" href="#0">
                          Keamanan Privasi
                        </a>{" "}
                        kami .
                      </div>
                    </form>
                  </>
                )}

                {role == "Corporate/Manning Agent" && (
                  <div className="">
                    <div className="flex items-center my-6">
                      <div
                        className="border-t border-white/20 grow mr-3"
                        aria-hidden="true"
                      ></div>
                      <div
                        className="border-t border-white/20 grow ml-3"
                        aria-hidden="true"
                      ></div>
                    </div>
                    <form
                      onSubmit={(e) => handleRegistrasiAkunManningAgent(e)}
                      autoComplete="off"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-wrap -mx-3 mb-1">
                          <div className="w-full px-3">
                            <label
                              className="block text-gray-200 text-sm font-medium mb-1"
                              htmlFor="namaManningAgent"
                            >
                              Nama Manning Agent{" "}
                              <span className="text-red-600">*</span>
                            </label>
                            <input
                              id="namaManningAgent"
                              type="text"
                              className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Masukkan nama lengkap"
                              value={namaManningAgent}
                              onChange={(e) =>
                                setNamaManningAgent(e.target.value)
                              }
                              required
                            />
                            {isInputError && (
                              <span className="text-rose-500 font-medium">
                                *Masukkan nama lengkap!
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-1">
                          <div className="w-full px-3">
                            <label
                              className="block text-gray-200 text-sm font-medium mb-1"
                              htmlFor="noTelponManingAgent"
                            >
                              No Telpon <span className="text-red-600">*</span>
                            </label>
                            <input
                              id="noTelponManingAgent"
                              type="text"
                              className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Masukkan No Telpon"
                              value={noTelponManingAgent}
                              minLength={12}
                              maxLength={13}
                              onChange={(e) => {
                                const value = e.target.value;
                                setNoTelponManningAgent(value);
                                setIsInputErrorNoTelpon(value.length > 0 && value.length < 12);
                              }}
                              required
                            />
                            {isInputErrorNoTelpon && phoneNumber != '' && (
                              <span className="text-rose-500 font-medium text-xs">
                                *No Telpon minimal 12 digit!
                              </span>
                            )}
                            {isInputError && (
                              <span className="text-rose-500 font-medium">
                                *Masukkan No Telpon!
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-1">
                          <div className="w-full px-3">
                            <label
                              className="block text-gray-200 text-sm font-medium mb-1"
                              htmlFor="emailManningAgent"
                            >
                              Email <span className="text-red-600">*</span>
                            </label>
                            <input
                              id="emailManningAgent"
                              type="email"
                              className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Masukkan email"
                              value={emailManningAgent}
                              onChange={(e) =>
                                setEmailManningAgent(e.target.value)
                              }
                              required
                            />
                            {isInputError && (
                              <span className="text-rose-500 font-medium">
                                *Masukkan email!
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-1">
                          <div className="w-full px-3">
                            <label
                              className="block text-gray-200 text-sm font-medium mb-1"
                              htmlFor="namaPenanggungJawabManningAgent"
                            >
                              Nama Penanggung Jawab{" "}
                              <span className="text-red-600">*</span>
                            </label>
                            <input
                              id="namaPenanggungJawabManningAgent"
                              type="text"
                              className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Masukkan nama penanggung jawab"
                              value={namaPenanggungJawabManningAgent}
                              onChange={(e) =>
                                setNamaPenanggungJawabManningAgent(e.target.value)
                              }
                              required
                            />
                            {isInputError && (
                              <span className="text-rose-500 font-medium">
                                *Masukkan nama penanggung jawab!
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-1">
                          <div className="w-full px-3">
                            <label
                              className="block text-gray-200 text-sm font-medium mb-1"
                              htmlFor="alamat"
                            >
                              Alamat <span className="text-red-600">*</span>
                            </label>
                            <input
                              id="alamat"
                              type="text"
                              className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Masukkan alamat"
                              value={alamat}
                              onChange={(e) => setAlamat(e.target.value)}
                              required
                            />
                            {isInputError && (
                              <span className="text-rose-500 font-medium">
                                *Masukkan alamat!
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-1">
                          <div className="w-full px-3">
                            <label
                              className="block text-gray-200 text-sm font-medium mb-1"
                              htmlFor="password"
                            >
                              Password <span className="text-red-600">*</span>
                            </label>
                            <span className="relative w-full h-fit">
                              <input
                                id="password"
                                type={isShowPassword ? 'text' : 'password'}
                                className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Masukkan password"
                                required
                                value={passwordManningAgent}
                                onChange={(e) => handlePasswordManningChange(e)}
                              />
                              <span onClick={(e) => setIsShowPassword(!isShowPassword)}>
                                {isShowPassword ? (
                                  <HiOutlineEyeOff className="text-gray-200 my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer" />
                                ) : (
                                  <HiOutlineEye className="text-gray-200 my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer" />
                                )}
                              </span>
                            </span>

                            {isInputError ? (
                              <span className="text-rose-500 font-medium">
                                *Masukkan password!
                              </span>
                            ) : (
                              <p className="text-white/60 leading-[100%] text-xs font-medium mt-2">
                                *Password minimal 8 karakter, harus terdiri dari
                                satu angka, huruf kapital dan kecil, serta
                                karakter
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-200 text-sm font-medium mb-1"
                            htmlFor="password"
                          >
                            Konfirmasi Password <span className="text-red-600">*</span>
                          </label>
                          <span className="relative w-full h-fit">
                            <input
                              id="confirmPassword"
                              type={isShowConfirmPassword ? 'text' : 'password'}
                              className="form-input w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Konfirmasi password"
                              required
                              value={confirmPassword}
                              onChange={(e) => handleConfirmPasswordManningChange(e)}
                            />
                            <span onClick={(e) => setIsShowConfirmPassword(!isShowConfirmPassword)}>
                              {isShowConfirmPassword ? (
                                <HiOutlineEyeOff className="text-white/70 hover:text-white my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer transition-colors" />
                              ) : (
                                <HiOutlineEye className="text-white/70 hover:text-white my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer transition-colors" />
                              )}
                            </span>
                          </span>

                          {(!isMatchManning && confirmPassword != '') && (
                            <span className="text-rose-500 text-xs font-medium">
                              *Password dan konfirmasi password tidak sesuai!
                            </span>
                          )}
                          {isInputError && (
                            <span className="text-rose-500 font-medium">
                              *Masukkan konfirmasi password!
                            </span>
                          )}
                        </div>
                      </div>

                      {(passwordManningAgent != "" && confirmPassword != '' && namaPenanggungJawabManningAgent != '' && noTelponManingAgent != '' && emailManningAgent != '' && namaManningAgent != '' && alamat != '') && isMatchManning && (
                        <div
                          className="flex flex-wrap w-full mb-1"
                          style={{ width: "100% !important" }}
                        >
                          <div
                            className="w-full"
                            style={{ width: "100% !important" }}
                          >
                            <label
                              className="block text-gray-200 text-sm font-medium mb-1"
                              htmlFor="password"
                            >
                              Verify if you are not a robot{" "}
                              <span className="text-red-600">*</span>
                            </label>
                            <ReCAPTCHA
                              style={{ width: "100% !important" }}
                              sitekey={
                                process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!
                              }
                              className=" w-[600px] font-inter text-sm"
                              onChange={setCaptcha}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap -mx-3 mt-3">
                        <div className="w-full px-3 flex flex-col gap-2">
                          <Button
                            type="submit"
                            disabled={captcha == null}
                            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Registrasi
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-200 text-center mt-3">
                        Dengan membuat akun, anda menyetujui{" "}
                        <a className="underline" href="#0">
                          Ketentuan & Kondisi
                        </a>
                        , serta{" "}
                        <a className="underline" href="#0">
                          Keamanan Privasi
                        </a>{" "}
                        kami .
                      </div>
                    </form>
                  </div>
                )}

                <div className="flex items-center my-6">
                  <div
                    className="border-t border-gray-300 grow mr-3"
                    aria-hidden="true"
                  ></div>
                  <div
                    className="border-t border-gray-300 grow ml-3"
                    aria-hidden="true"
                  ></div>
                </div>
                <div className="text-gray-200 text-center mt-6">
                  Sudah punya akun sebelumnya?{" "}
                  <Link
                    href={"/login"}
                    className="text-blue-400 hover:text-blue-300 hover:underline transition duration-150 ease-in-out font-semibold"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FormRegistrasi;
