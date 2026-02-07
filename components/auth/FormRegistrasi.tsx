"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FormEvent, MouseEventHandler } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
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
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineUser, HiOutlineIdentification, HiOutlineDeviceMobile, HiOutlineLockClosed, HiOutlineMail, HiOutlineClipboardList, HiOutlineLocationMarker, HiOutlineMap, HiOutlineOfficeBuilding } from "react-icons/hi";

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
    <div className="fixed inset-0 z-[999999] font-jakarta overflow-hidden scrollbar-hide">
      <main className="h-full w-full relative bg-slate-950 text-white flex items-center justify-center p-4 scrollbar-hide">
        {/* Animated Background Image */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.25 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={"/images/hero-img6.jpg"}
            className="w-full h-full object-cover"
            alt="Background"
            fill={true}
            priority
          />
        </motion.div>

        {/* Gradient Blobs with Animation */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/30 blur-[100px] z-1"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px] z-1"
        />

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

        <section className="relative z-10 w-full max-w-6xl flex flex-col items-center max-h-full overflow-y-auto scrollbar-hide py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full mx-auto text-center mb-8"
          >
            <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-semibold tracking-widest uppercase mb-6 inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Portal Masyarakat
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-calsans text-white tracking-tight leading-none drop-shadow-2xl mb-6">
              Mulai Perjalanan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                Maritim Anda
              </span>
            </h1>
            <p className="mt-6 text-gray-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
              Daftar sekarang untuk mengakses berbagai pelatihan maritim berkualitas. Pilih tipe akun yang sesuai dengan profil anda.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`${role == "Perseorangan" || role == "" || role == "Portfolio" ? "max-w-xl" : "max-w-4xl"} w-full relative group px-2 md:px-0`}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[2rem] blur opacity-15 group-hover:opacity-25 transition duration-1000" />
            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-12 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-400" />
              <div className="flex flex-col gap-4 mb-8">
                <label
                  className="block text-blue-200/80 text-xs font-semibold uppercase tracking-wider ml-1"
                  htmlFor="role"
                >
                  Daftar Sebagai <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={role}
                  onValueChange={(value: string) => { setRole(value); setIsShowPassword(false); setIsShowConfirmPassword(false); setConfirmPassword('') }}
                >
                  <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 text-white transition-all hover:bg-white/10">
                    <div className="flex items-center gap-3">
                      <HiMiniUserGroup className="text-blue-400 text-xl" />
                      <span className="text-sm font-medium">
                        {role || "Pilih Tipe Pendaftaran"}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 rounded-2xl p-2 text-white">
                    <SelectGroup>
                      <SelectLabel className="text-blue-300/60 text-[10px] uppercase font-bold px-3 py-2">Tipe Akun</SelectLabel>
                      <SelectItem className="rounded-xl focus:bg-blue-500/20 focus:text-blue-100 cursor-pointer py-3 transition-colors" value="Perseorangan">Perseorangan</SelectItem>
                      <SelectItem className="rounded-xl focus:bg-blue-500/20 focus:text-blue-100 cursor-pointer py-3 transition-colors" value="Corporate/Manning Agent">Corporate / Manning Agent</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {useKUSUKA && (
                <form
                  onSubmit={(e) => handleCheckingNoKusuka(e)}
                  className="w-full flex flex-col gap-4 mb-8 p-6 bg-white/5 rounded-2xl border border-white/10"
                >
                  <div className="w-full">
                    <label
                      className="block text-blue-200/80 text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                    >
                      No KUSUKA <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="no_kusuka"
                      type="text"
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                      placeholder="Masukkan nomor KUSUKA"
                      value={noKusuka}
                      onChange={(e) => setNoKusuka(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isHandlingCekKUSUKA}
                    className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-8 py-4 rounded-2xl hover:shadow-lg transition-all font-bold disabled:opacity-50"
                  >
                    {isHandlingCekKUSUKA ? 'Memproses...' : 'Cek Nomor KUSUKA'}
                  </button>
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
                    <div className="mb-6">
                      <label
                        className="block text-blue-200/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                        htmlFor="name"
                      >
                        Nama Lengkap <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                          <HiOutlineUser className="text-xl" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                          placeholder="Contoh: BUDI SETIAWAN"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-white/40 text-[10px] font-medium mt-2 ml-1">
                        * Sesuai KTP, tanpa gelar akademik atau sejenisnya
                      </p>
                    </div>
                    <div className="mb-6">
                      <label
                        className="block text-blue-200/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                        htmlFor="nik"
                      >
                        NIK / NIP / NIM / Paspor <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                          <HiOutlineIdentification className="text-xl" />
                        </div>
                        <input
                          id="nik"
                          type="text"
                          className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-white/10 ${isInputErrorNIK ? "border-rose-500/50" : "border-white/10"}`}
                          placeholder="32xxxxxxxxxxxxxx"
                          value={nik}
                          maxLength={20}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNik(value);
                            setIsInputErrorNIK(value.length > 20);
                          }}
                          required
                        />
                      </div>
                      <p className="text-white/40 text-[10px] font-medium mt-2 ml-1">
                        * Digunakan untuk verifikasi data sertifikat anda
                      </p>
                    </div>

                    <div className="mb-6">
                      <label
                        className="block text-blue-200/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                        htmlFor="phone"
                      >
                        No Telepon / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                          <HiOutlineDeviceMobile className="text-xl" />
                        </div>
                        <input
                          id="phone"
                          type="text"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                          placeholder="628xxxxxxxxxx"
                          value={phoneNumber}
                          minLength={12}
                          maxLength={14}
                          onChange={handleChangePhoneNumber}
                          required
                        />
                      </div>
                      {isInputErrorNoTelpon && phoneNumber != '' && (
                        <p className="text-rose-400 text-[10px] font-medium mt-2 ml-1">
                          * No Telpon minimal 12 digit
                        </p>
                      )}
                    </div>
                    <div className="mb-6">
                      <label
                        className="block text-blue-200/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                        htmlFor="password"
                      >
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                          <HiOutlineLockClosed className="text-xl" />
                        </div>
                        <input
                          id="password"
                          type={isShowPassword ? 'text' : 'password'}
                          className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                          placeholder="••••••••••••"
                          required
                          value={password}
                          onChange={(e) => handlePasswordChange(e)}
                        />
                        <button
                          type="button"
                          onClick={() => setIsShowPassword(!isShowPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                        >
                          {isShowPassword ? (
                            <HiOutlineEyeOff className="text-xl" />
                          ) : (
                            <HiOutlineEye className="text-xl" />
                          )}
                        </button>
                      </div>
                      <p className="text-white/40 text-[10px] font-medium mt-2 ml-1 leading-relaxed">
                        * Min. 8 karakter, kombinasi huruf besar, kecil, angka, dan simbol
                      </p>
                    </div>
                    <div className="mb-8">
                      <label
                        className="block text-blue-200/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                        htmlFor="confirmPassword"
                      >
                        Konfirmasi Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                          <HiOutlineLockClosed className="text-xl" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={isShowConfirmPassword ? 'text' : 'password'}
                          className={`w-full pl-12 pr-12 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all hover:bg-white/10 ${!isMatch && confirmPassword != '' ? "border-rose-500/50 focus:ring-rose-500/50" : "border-white/10 focus:ring-blue-500/50 focus:border-blue-400/50"}`}
                          placeholder="••••••••••••"
                          required
                          value={confirmPassword}
                          onChange={(e) => handleConfirmPasswordChange(e)}
                        />
                        <button
                          type="button"
                          onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                        >
                          {isShowConfirmPassword ? (
                            <HiOutlineEyeOff className="text-xl" />
                          ) : (
                            <HiOutlineEye className="text-xl" />
                          )}
                        </button>
                      </div>
                      {!isMatch && confirmPassword != '' && (
                        <p className="text-rose-400 text-[10px] font-medium mt-2 ml-1">
                          * Password tidak cocok
                        </p>
                      )}
                    </div>
                    {confirmPassword != "" && nik != "" && password != "" && phoneNumber != '' && name != '' && isMatch && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10"
                      >
                        <label className="block text-white/40 text-[10px] uppercase font-bold mb-4 tracking-[0.2em] text-center">
                          Verifikasi Keamanan
                        </label>
                        <div className="flex justify-center scale-90 sm:scale-100 items-center overflow-hidden">
                          <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                            theme="dark"
                            onChange={setCaptcha}
                          />
                        </div>
                      </motion.div>
                    )}
                    <div className="flex flex-col gap-4 mt-8">
                      <motion.button
                        whileHover={captcha ? { scale: 1.01 } : {}}
                        whileTap={captcha ? { scale: 0.98 } : {}}
                        type="submit"
                        disabled={!captcha}
                        className={`w-full py-4 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 group ${captcha
                          ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.6)]"
                          : "bg-white/10 text-white/30 cursor-not-allowed border border-white/5"
                          }`}
                      >
                        <span>Selesaikan Registrasi</span>
                      </motion.button>

                      {!useKUSUKA && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => {
                            setUseKUSUKA(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full py-4 rounded-2xl font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex justify-center items-center gap-3"
                        >
                          <Image
                            src="/logo-kkp-full-white.png"
                            className="w-6"
                            alt="KKP"
                            width={24}
                            height={24}
                          />
                          <span>Daftar Dengan KUSUKA</span>
                        </motion.button>
                      )}
                    </div>

                    <div className="text-[11px] text-white/40 text-center mt-8 font-medium leading-relaxed max-w-[280px] mx-auto">
                      Dengan mendaftar, anda menyetujui {" "}
                      <a className="text-white/60 hover:text-white underline decoration-white/20 transition-colors" href="#0">
                        syarat & ketentuan
                      </a>{" "}
                      serta {" "}
                      <a className="text-white/60 hover:text-white underline decoration-white/20 transition-colors" href="#0">
                        kebijakan privasi
                      </a>{" "}
                      kami.
                    </div>
                  </form>
                </>
              )}

              {role == "Corporate/Manning Agent" && (
                <div className="mt-6">
                  <form
                    onSubmit={(e) => handleRegistrasiAkunManningAgent(e)}
                    autoComplete="off"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="mb-2">
                        <label className="block text-blue-200/80 text-[10px] font-semibold uppercase tracking-wider ml-1 mb-2">
                          Nama Manning Agent <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                            <HiOutlineOfficeBuilding className="text-xl" />
                          </div>
                          <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                            placeholder="Nama Perusahaan"
                            value={namaManningAgent}
                            onChange={(e) => setNamaManningAgent(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="block text-blue-200/80 text-[10px] font-semibold uppercase tracking-wider ml-1 mb-2">
                          No Telepon / WA <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                            <HiOutlineDeviceMobile className="text-xl" />
                          </div>
                          <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                            placeholder="62xxxxxxxxxxx"
                            value={noTelponManingAgent}
                            onChange={(e) => setNoTelponManningAgent(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="block text-blue-200/80 text-[10px] font-semibold uppercase tracking-wider ml-1 mb-2">
                          Email Corporate <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                            <HiOutlineMail className="text-xl" />
                          </div>
                          <input
                            type="email"
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                            placeholder="corp@example.com"
                            value={emailManningAgent}
                            onChange={(e) => setEmailManningAgent(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="block text-blue-200/80 text-[10px] font-semibold uppercase tracking-wider ml-1 mb-2">
                          Penanggung Jawab <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                            <HiOutlineUser className="text-xl" />
                          </div>
                          <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                            placeholder="Nama Lengkap"
                            value={namaPenanggungJawabManningAgent}
                            onChange={(e) => setNamaPenanggungJawabManningAgent(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 mb-2">
                        <label className="block text-blue-200/80 text-[10px] font-semibold uppercase tracking-wider ml-1 mb-2">
                          Alamat Kantor <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                            <HiOutlineLocationMarker className="text-xl" />
                          </div>
                          <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                            placeholder="Alamat Lengkap Perusahaan"
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="block text-blue-200/80 text-[10px] font-semibold uppercase tracking-wider ml-1 mb-2">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                            <HiOutlineLockClosed className="text-xl" />
                          </div>
                          <input
                            type={isShowPassword ? 'text' : 'password'}
                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                            placeholder="••••••••••••"
                            value={passwordManningAgent}
                            onChange={(e) => handlePasswordManningChange(e)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setIsShowPassword(!isShowPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                          >
                            {isShowPassword ? <HiOutlineEyeOff className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                          </button>
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="block text-blue-200/80 text-[10px] font-semibold uppercase tracking-wider ml-1 mb-2">
                          Konfirmasi Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                            <HiOutlineLockClosed className="text-xl" />
                          </div>
                          <input
                            type={isShowConfirmPassword ? 'text' : 'password'}
                            className={`w-full pl-12 pr-12 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all hover:bg-white/10 ${!isMatchManning && confirmPassword != '' ? "border-rose-500/50 focus:ring-rose-500/50" : "border-white/10 focus:ring-blue-500/50 focus:border-blue-400/50"}`}
                            placeholder="••••••••••••"
                            value={confirmPassword}
                            onChange={(e) => handleConfirmPasswordManningChange(e)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                          >
                            {isShowConfirmPassword ? <HiOutlineEyeOff className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {passwordManningAgent != "" && confirmPassword != '' && isMatchManning && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10"
                      >
                        <label className="block text-white/40 text-[10px] uppercase font-bold mb-4 tracking-[0.2em] text-center">
                          Verifikasi Keamanan
                        </label>
                        <div className="flex justify-center scale-75 sm:scale-90 items-center overflow-hidden">
                          <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                            theme="dark"
                            onChange={setCaptcha}
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="mt-8">
                      <motion.button
                        whileHover={captcha ? { scale: 1.01 } : {}}
                        whileTap={captcha ? { scale: 0.98 } : {}}
                        type="submit"
                        disabled={!captcha}
                        className={`w-full py-4 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 group ${captcha
                          ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.6)]"
                          : "bg-white/10 text-white/30 cursor-not-allowed border border-white/5"
                          }`}
                      >
                        <span>Registrasi Corporate</span>
                      </motion.button>
                    </div>

                    <div className="text-[11px] text-white/40 text-center mt-8 font-medium leading-relaxed max-w-[280px] mx-auto">
                      Dengan mendaftar, anda menyetujui {" "}
                      <a className="text-white/60 hover:text-white underline decoration-white/20 transition-colors" href="#0">
                        syarat & ketentuan
                      </a>{" "}
                      serta {" "}
                      <a className="text-white/60 hover:text-white underline decoration-white/20 transition-colors" href="#0">
                        kebijakan privasi
                      </a>{" "}
                      kami.
                    </div>
                  </form>
                </div>
              )}

              <div className="flex items-center my-10">
                <div className="border-t border-white/10 grow" aria-hidden="true" />
                <div className="mx-4 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">Atau</div>
                <div className="border-t border-white/10 grow" aria-hidden="true" />
              </div>

              <div className="text-center pb-4">
                <p className="text-white/50 text-sm">
                  Sudah punya akun sebelumnya?{" "}
                  <Link
                    href="/login"
                    className="text-white font-bold hover:text-blue-400 transition-colors underline decoration-blue-500/30 underline-offset-4 ml-1"
                  >
                    Login Sekarang
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

export default FormRegistrasi;
