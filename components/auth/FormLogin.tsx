"use client";

import Image from "next/image";
import Link from "next/link";

import React, { FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
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

// RECAPTCHA
import ReCAPTCHA from "react-google-recaptcha";
import { HiMiniUserGroup, HiOutlineEye } from "react-icons/hi2";
import { HiOutlineEyeOff } from "react-icons/hi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { elautBaseUrl, manningAgentDevUrl } from "@/constants/urls";
import {
  sanitizedDangerousChars,
  validateIsDangerousChars,
} from "@/utils/input";
import { handlePasswordCriteria } from "@/utils/security";
import Toast from "@/commons/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineDeviceMobile, HiOutlineIdentification, HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";

function FormLogin() {
  const [formData, setFormData] = React.useState<{ [key: string]: string }>({
    no_number: "",
    password: "",
  });

  const [errors, setErrors] = React.useState<{ [key: string]: string | null }>({
    no_number: null,
    password: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    if (validateIsDangerousChars(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "You are using dangerous characters!",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };


  const [countWrongPassword, setCountPassword] = React.useState<number>(0);

  const [captcha, setCaptcha] = React.useState<string | null>();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();


  const handleLoginAkun = async (e: FormEvent) => {
    e.preventDefault();
    if (countWrongPassword <= 3) {
      if (formData!.no_number == "" || formData!.password == "") {
        Toast.fire({
          icon: "error",
          title: "Gagal mencoba login.",
          text: `Tolong lengkapi data login untuk login kedalam ELAUT`,
        });
      } else {
        if (
          validateIsDangerousChars(formData!.no_number) ||
          validateIsDangerousChars(formData!.password)
        ) {
          Toast.fire({
            icon: "error",
            title: "Oopsss!",
            text: `Kamu memasukkan karakter berbahaya pada no telpon atau password, login tidak dapat diproses!`,
          });
        } else {
          // if (captcha) {
          try {
            const response: AxiosResponse = await axios.post(
              selectedMethodLogin == 'NIK' ? `${baseUrl}/users/login` : `${baseUrl}/users/loginNotelpon`,
              selectedMethodLogin == 'NIK' ?
                JSON.stringify({
                  nik: sanitizedDangerousChars(formData!.no_number),
                  password: sanitizedDangerousChars(formData!.password),
                }) : JSON.stringify({
                  no_number: sanitizedDangerousChars(formData!.no_number),
                  password: sanitizedDangerousChars(formData!.password),
                }),
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            console.log({ response });

            // setting user's token
            Cookies.set("XSRF081", response.data.t, { expires: 1 });

            // user is first timer and has registered
            if (Cookies.get('XSRF087')) {
              Toast.fire({
                icon: "success",
                title: "Berhasil login.",
                text: `Silahkan melengkapi dahulu biodata mu sebelum menjelajah lebih jauh di E-LAUT!`,
              });
              router.replace('/dashboard/edit-profile')
            } else {
              // user before selected one of training's detail before
              if (Cookies.get("XSRF088")) {
                Toast.fire({
                  icon: "success",
                  title: "Berhasil login.",
                  text: `Berhasil melakukan login, ayo segera daftarkan dirimu dalam pelatihan!`,
                });
                router.replace(Cookies.get("XSRF088")!);
              } else {
                // instead will redirect to the main page
                router.replace('/')
              }
            }


          } catch (error: any) {
            console.error({ error });
            if (
              error.response &&
              error.response.data &&
              error.response.data.pesan
            ) {
              const errorMsg = error.response.data.pesan;
              if (errorMsg == "Incorrect password!") {
                setCountPassword(countWrongPassword + 1);
              }
              Toast.fire({
                icon: "error",
                title: "Gagal mencoba login.",
                text: `Gagal melakukan login, ${errorMsg}!`,
              });
            } else {
              const errorMsg = error.response.data.pesan;
              Toast.fire({
                icon: "error",
                title: "Gagal mencoba login.",
                text: `Gagal melakukan login. ${errorMsg}!`,
              });
            }
          }
          // }
        }
      }
    } else {
      Toast.fire({
        icon: "error",
        title: "Gagal mencoba login.",
        text: `Ups, terlihat kamu sudah mencoba berulang kali dengan password gagal, coba lagi nanti!`,
      });
    }
  };

  const [email, setEmail] = React.useState<string>("");
  const [passwordManningAgent, setPasswordManningAgent] =
    React.useState<string>("");

  const handleLoginAkunManningAgent = async (e: FormEvent) => {
    e.preventDefault();
    if (countWrongPassword <= 3) {
      if (email == "" || passwordManningAgent == "") {
        Toast.fire({
          icon: "error",
          title: "Gagal mencoba login.",
          text: `Tolong lengkapi data login untuk login kedalam ELAUT`,
        });
      } else {
        if (
          validateIsDangerousChars(email) ||
          validateIsDangerousChars(passwordManningAgent)
        ) {
          Toast.fire({
            icon: "error",
            title: "Oopsss!",
            text: `Kamu memasukkan karakter berbahaya pada no telpon atau password, login tidak dapat diproses!`,
          });
        } else {
          if (captcha) {
            try {
              const response: AxiosResponse = await axios.post(
                `${elautBaseUrl}/manningAgent/loginManningAgent`,
                JSON.stringify({
                  email: sanitizedDangerousChars(email),
                  password: sanitizedDangerousChars(passwordManningAgent),
                }),
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log({ response });

              Cookies.set("XSRF081", response.data.t, { expires: 1 });

              Cookies.set("isManningAgent", "true", { expires: 1 });

              if (Cookies.get("XSRF085")) {
                Toast.fire({
                  icon: "success",
                  title: "Berhasil login.",
                  text: `Berhasil melakukan login, ayo segera daftarkan dirimu!`,
                });
                router.replace("/dashboard");
              } else {
                Toast.fire({
                  icon: "success",
                  title: "Berhasil login.",
                  text: `Berhasil melakukan login kedalam ELAUT!`,
                });
                if (Cookies.get("XSRF083")) {
                  // router.replace("/dashboard/complete-profile");
                  if (Cookies.get("LastPath")) {
                    const path = Cookies.get("LastPath");
                    router.replace(path!);
                  }
                } else {
                  if (Cookies.get("LastPath")) {
                    const path = Cookies.get("LastPath");
                    router.replace(path!);
                  } else {
                    router.replace("/dashboard");
                  }
                }
              }
            } catch (error: any) {
              console.error({ error });
              if (
                error.response &&
                error.response.data &&
                error.response.data.pesan
              ) {
                const errorMsg = error.response.data.pesan;
                if (errorMsg == "Incorrect password!") {
                  setCountPassword(countWrongPassword + 1);
                }
                Toast.fire({
                  icon: "error",
                  title: "Gagal mencoba login.",
                  text: `Gagal melakukan login, ${errorMsg}!`,
                });
              } else {
                const errorMsg = error.response.data.pesan;
                Toast.fire({
                  icon: "error",
                  title: "Gagal mencoba login.",
                  text: `Gagal melakukan login. ${errorMsg}!`,
                });
              }
            }
          }
        }
      }
    } else {
      Toast.fire({
        icon: "error",
        title: "Gagal mencoba login.",
        text: `Ups, terlihat kamu sudah mencoba berulang kali dengan password gagal, coba lagi nanti!`,
      });
    }
  };

  const [role, setRole] = React.useState<string>("Perseorangan");

  const [imageIndex, setImageIndex] = React.useState(0);
  const images = ["/images/hero-img3.jpg", "/images/hero-img6.jpg"];
  const imagesMob = ["/diklat/bstf-1.jpg"];

  // Showing password state management
  const [isShowPassword, setIsShowPassword] = React.useState<boolean>(false);

  // Forget password state management
  const [isForgetPassword, setIsForgetPassword] =
    React.useState<boolean>(false);
  const [isForgetPhoneNumber, setIsForgetPhoneNumber] =
    React.useState<boolean>(false);
  const [nik, setNik] = React.useState<string>("");
  const [passwordReset, setPasswordReset] = React.useState<string>("");
  const [tokenResetPassword, setTokenResetPassword] =
    React.useState<string>("");
  const [phoneNumberInformation, setPhoneNumberInformation] =
    React.useState<string>("");
  const handleGetTokenResetPassword = async (e: any) => {
    if (validateIsDangerousChars(nik)) {
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: `Kamu memasukkan karakter berbahaya pada input NIK-mu, cek akun tidak dapat diproses!`,
      });
    } else {
      try {
        const response = await axios.post(
          `${elautBaseUrl}/users/getTokenPassword`,
          {
            nik: sanitizedDangerousChars(nik),
          }
        );

        console.log({ response });

        if (isForgetPhoneNumber) {
          Toast.fire({
            icon: "success",
            title: "Yeayyy!",
            text: `No telpon berhasil ditemukan, silahkan mendapatkan nomormu yang terdaftar, silahkan login!`,
          });
          setIsForgetPassword(false);
          setPhoneNumberInformation(response.data.no_telpon);
          setFormData({ no_number: response.data.no_telpon, password: "" });
          setIsForgetPhoneNumber(false);
          setNik("");
        } else {
          Toast.fire({
            icon: "success",
            title: "Yeayyy!",
            text: `Akun berhasil ditemukan, silahkan reset ulang password mu!`,
          });
          setTokenResetPassword(response.data.token);
          setFormData({
            no_number: "",
            password: "",
          });
        }
      } catch (error: any) {
        console.log({ error });
        const errorMsg = error.response.data.Pesan;
        Toast.fire({
          icon: "error",
          title: "Akun tidak ditemukan.",
          text: `Gagal. ${errorMsg}!`,
        });
        setFormData({
          no_number: "",
          password: "",
        });
      }
    }
  };
  const handleResetPassword = async (e: any) => {
    if (validateIsDangerousChars(passwordReset)) {
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: `Kamu memasukkan karakter berbahaya pada input password baru-mu, reset password tidak dapat diproses!`,
      });
    } else {
      if (handlePasswordCriteria(passwordReset)) {
        try {
          const response = await axios.post(
            `${elautBaseUrl}/users/resetPassword`,
            { password: sanitizedDangerousChars(passwordReset) },
            {
              headers: {
                Authorization: `Bearer ${tokenResetPassword}`,
              },
            }
          );
          Toast.fire({
            icon: "success",
            title: "Berhasil mereset.",
            text: `Silahkan menggunakan password yang sudah direset, jangan sampai lupa lagi!`,
          });
          setNik("");
          setPasswordReset("");
          setFormData({
            no_number: "",
            password: "",
          });
          setIsForgetPassword(false);
          setTokenResetPassword("");
          setRole("Perseorangan");
          console.log({ response });
        } catch (error: any) {
          console.log({ error });
          setNik("");
          setPasswordReset("");
          setIsForgetPassword(false);
          setTokenResetPassword("");
          setFormData({
            no_number: "",
            password: "",
          });
          Toast.fire({
            icon: "error",
            title: "Gagal mereset.",
            text: `Password mu gagal untuk direset, nampaknya terdapat gangguan`,
          });
        }
      }
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const [isInputErrorNoTelpon, setIsInputErrorNoTelpon] =
    React.useState<boolean>(false);
  const [isInputErrorNIK, setIsInputErrorNIK] = React.useState<boolean>(true);
  const [isInputErrorPassword, setIsInputErrorPassword] =
    React.useState<boolean>(true);

  const [selectedMethodLogin, setSelectedMethodLogin] = React.useState<string>('Whatsapp/No Telpon')

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-jakarta">
      <div className="absolute inset-0 z-0">
        <Image
          src={images[imageIndex]}
          className="absolute w-full h-full hidden md:block object-cover duration-1000 opacity-[0.15] z-0"
          alt=""
          layout="fill"
          priority
        />
        <Image
          src={imagesMob[0]}
          className="absolute w-full h-full block md:hidden object-cover duration-1000 opacity-[0.15] z-0"
          alt=""
          layout="fill"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/40 to-[#020617]" />
      </div>

      {/* Modern Animated Gradient Blobs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -top-24 -left-24 h-[40rem] w-[40rem] rounded-full bg-blue-600/20 blur-[120px] z-1"
      />
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-48 -right-48 h-[45rem] w-[45rem] rounded-full bg-cyan-500/15 blur-[150px] z-1"
      />

      <Dialog open={isForgetPassword} onOpenChange={setIsForgetPassword}>
        <DialogContent
          className="sm:max-w-[425px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl text-white"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white drop-shadow-md">
              {isForgetPhoneNumber ? "Cek No Telpon/WA" : "Reset Password"}
            </DialogTitle>
            <DialogDescription className="text-gray-200">
              {isForgetPhoneNumber
                ? "Harap masukkan NIK kamu sebelum melihat no telpon/WA mu yang terdaftar pada ELAUT"
                : "Harap masukkan NIK kamu sebelum melakukan reset, untuk mengetahui NIK tersebut terdaftar atau tidak"}
            </DialogDescription>
          </DialogHeader>

          {/* Input Fields */}
          <div className="grid gap-4 py-2">
            <div className="flex flex-col items-start gap-1">
              <Label htmlFor="nik" className="text-gray-200">
                NIK
              </Label>
              <div className="flex flex-col gap-1 w-full">
                <Input
                  id="nik"
                  value={nik}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNik(value);
                    setIsInputErrorNIK(value.length > 0 && value.length < 16);
                  }}
                  maxLength={16}
                  placeholder="Masukkan NIK kamu"
                  className="w-full bg-white/10 border border-white/20 placeholder-gray-400 text-white rounded-xl"
                  readOnly={tokenResetPassword != ""}
                  autoComplete="off"
                />
                {isInputErrorNIK && nik != "" && (
                  <span className="text-rose-400 font-medium text-xs">
                    *NIK harus 16 digit!
                  </span>
                )}
              </div>
            </div>

            {/* Password Reset Section */}
            {tokenResetPassword != "" && (
              <div className="flex flex-col gap-1">
                <div className="flex flex-col items-start gap-2">
                  <Label htmlFor="passwordReset" className="text-gray-200">
                    Password Baru
                  </Label>
                  <Input
                    id="passwordReset"
                    value={passwordReset}
                    type="password"
                    onChange={(e) => setPasswordReset(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="w-full bg-white/10 border border-white/20 placeholder-gray-400 text-white rounded-xl"
                    autoComplete="off"
                  />
                </div>
                <p className="text-gray-300 leading-[100%] text-xs font-medium mt-2">
                  *Password minimal 8 karakter, harus terdiri dari satu angka,
                  huruf kapital dan kecil, serta karakter
                </p>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <DialogFooter>
            <div className="flex gap-2 -mt-4">
              {tokenResetPassword == "" ? (
                <Button
                  type="button"
                  onClick={(e) => handleGetTokenResetPassword(e)}
                  disabled={isInputErrorNIK}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  Cek Akunmu
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={(e) => handleResetPassword(e)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  Reset Password
                </Button>
              )}
              <Button
                type="button"
                onClick={() => {
                  setNik("");
                  setPasswordReset("");
                  setIsForgetPassword(false);
                  setTokenResetPassword("");
                  setIsInputErrorNIK(true);
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 shadow-lg transition-all"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full mx-auto text-center mb-8"
          >
            <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-semibold tracking-widest uppercase mb-6 inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Selamat Datang Kembali
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-calsans text-white tracking-tight leading-none drop-shadow-2xl mb-6">
              Masuk ke Akun <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                E-LAUT Anda
              </span>
            </h1>
            <p className="mt-6 text-gray-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
              Akses akun anda untuk menjelajahi pelatihan maritim terbaik. Tersedia opsi login untuk <span className="text-blue-400 font-medium">Perseorangan</span> dan <span className="text-teal-400 font-medium">Corporate</span>.
            </p>
          </motion.div>

          {/* Form */}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-xl mx-auto relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-[#1e293b]/20 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 sm:p-12 overflow-hidden transition-all duration-500 hover:bg-[#1e293b]/30">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />

              {role == "" ? (
                <></>
              ) : role == "Perseorangan" ? (
                <form onSubmit={(e) => handleLoginAkun(e)} autoComplete="off">
                  <div className="flex flex-col gap-2 mb-6">
                    <label
                      className="block text-blue-200/80 text-xs font-semibold uppercase tracking-wider ml-1"
                      htmlFor="role"
                    >
                      Login Menggunakan <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      value={selectedMethodLogin}
                      onValueChange={(value: string) => setSelectedMethodLogin(value)}
                    >
                      <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 text-white transition-all hover:bg-white/10">
                        <div className="flex items-center gap-3">
                          <HiMiniUserGroup className="text-blue-400 text-xl" />
                          <span className="text-sm font-medium">
                            {selectedMethodLogin || "Pilih Metode Login"}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 rounded-2xl p-2">
                        <SelectGroup>
                          <SelectLabel className="text-blue-300/60 text-[10px] uppercase font-bold px-3 py-2">Metode Login</SelectLabel>
                          <SelectItem className="rounded-xl focus:bg-blue-500/20 focus:text-blue-100 cursor-pointer py-3 transition-colors text-slate-300" value="Whatsapp/No Telpon">
                            <div className="flex items-center gap-2">
                              <HiOutlineDeviceMobile className="text-lg" />
                              <span>Whatsapp / No Telpon</span>
                            </div>
                          </SelectItem>
                          <SelectItem className="rounded-xl focus:bg-blue-500/20 focus:text-blue-100 cursor-pointer py-3 transition-colors text-slate-300" value="NIK">
                            <div className="flex items-center gap-2">
                              <HiOutlineIdentification className="text-lg" />
                              <span>NIK</span>
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-6">
                    <label
                      className="block text-blue-200/80 text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                      htmlFor="no_number"
                    >
                      {selectedMethodLogin == 'NIK' ? 'Nomor Induk Kependudukan (NIK)' : 'No Telepon / WhatsApp'}
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                        {selectedMethodLogin === 'NIK' ? <HiOutlineIdentification className="text-xl" /> : <HiOutlineDeviceMobile className="text-xl" />}
                      </div>
                      <input
                        id="no_number"
                        type="text"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                        placeholder={selectedMethodLogin == 'NIK' ? '32xxxxxxxxxxxxxx' : '62xxxxxxxxxxx'}
                        value={formData.no_number}
                        name="no_number"
                        minLength={selectedMethodLogin == 'NIK' ? 16 : 12}
                        maxLength={selectedMethodLogin == 'NIK' ? 24 : 13}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleInputChange(e);
                          setIsInputErrorNoTelpon(
                            value.length > 0 && value.length < 12
                          );
                        }}
                        required
                      />
                    </div>

                    <div className="flex justify-between items-center mt-2 px-1">
                      <div className="flex flex-col">
                        {isInputErrorNoTelpon && formData.no_number != "" && (
                          <span className="text-rose-400 font-medium text-[10px]">
                            * Minimal {selectedMethodLogin === 'NIK' ? '16' : '12'} digit!
                          </span>
                        )}
                        <span className="text-white/40 text-[10px] font-medium">
                          Lupa data anda? klik{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgetPhoneNumber(true);
                              setIsForgetPassword(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 font-bold transition-colors underline decoration-blue-500/30 underline-offset-2"
                          >
                            disini
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-8">
                    <label
                      className="block text-blue-200/80 text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                      htmlFor="password"
                    >
                      Password <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                        <HiOutlineLockClosed className="text-xl" />
                      </div>
                      <input
                        id="password"
                        type={isShowPassword ? "text" : "password"}
                        className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                        placeholder="••••••••••••"
                        required
                        name="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange(e)}
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

                    <div className="flex justify-between items-center mt-2 px-1">
                      <span className="text-white/40 text-[10px] font-medium uppercase tracking-tight">
                        Harap jaga kerahasiaan password anda
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsForgetPassword(true)}
                        className="text-blue-400 hover:text-blue-300 text-[10px] font-bold transition-colors underline decoration-blue-500/30 underline-offset-2"
                      >
                        Lupa password?
                      </button>
                    </div>
                  </div>
                  <div className="mt-8">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white py-4 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.6)] transition-all flex justify-center items-center gap-2 group"
                    >
                      <span>Masuk ke Akun</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </motion.div>
                    </motion.button>
                  </div>

                  <div className="text-[11px] text-white/40 text-center mt-8 font-medium leading-relaxed max-w-[280px] mx-auto">
                    Dengan masuk, anda menyetujui {" "}
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
              ) : (
                <form
                  onSubmit={(e) => handleLoginAkunManningAgent(e)}
                  autoComplete="off"
                >
                  <div className="mb-6">
                    <label
                      className="block text-blue-200/80 text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                      htmlFor="email_agent"
                    >
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                        <HiOutlineMail className="text-xl" />
                      </div>
                      <input
                        id="email_agent"
                        type="email"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                        placeholder="corporate@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label
                      className="block text-blue-200/80 text-xs font-semibold uppercase tracking-wider ml-1 mb-2"
                      htmlFor="password_corporate"
                    >
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 group-focus-within:text-blue-300 transition-colors">
                        <HiOutlineLockClosed className="text-xl" />
                      </div>
                      <input
                        id="password_corporate"
                        type={isShowPassword ? "text" : "password"}
                        className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all hover:bg-white/10"
                        placeholder="••••••••••••"
                        required
                        value={passwordManningAgent}
                        onChange={(e) => setPasswordManningAgent(e.target.value)}
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
                  </div>

                  {passwordManningAgent != "" && (
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
                      <span>Masuk Corporate</span>
                    </motion.button>
                  </div>

                  <div className="text-[11px] text-white/40 text-center mt-8 font-medium leading-relaxed max-w-[280px] mx-auto">
                    Dengan masuk, anda menyetujui {" "}
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
              )}

              <div className="flex items-center my-10">
                <div className="border-t border-white/10 grow" aria-hidden="true" />
                <div className="mx-4 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">Atau</div>
                <div className="border-t border-white/10 grow" aria-hidden="true" />
              </div>

              <div className="text-center pb-4">
                <p className="text-white/50 text-sm">
                  Belum punya akun sebelumnya?{" "}
                  <Link
                    href="/registrasi"
                    onClick={() => Cookies.set("XSRF087", "1")}
                    className="text-white font-bold hover:text-blue-400 transition-colors underline decoration-blue-500/30 underline-offset-4 ml-1"
                  >
                    Mulai Registrasi
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default FormLogin;
