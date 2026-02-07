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
import { HiMiniUserGroup, HiOutlineEye, HiOutlineUserGroup } from "react-icons/hi2";
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
import { FiShield } from "react-icons/fi";

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

        <Dialog open={isForgetPassword} onOpenChange={setIsForgetPassword}>
          <DialogContent
            className="sm:max-w-[425px] bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl text-white"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white font-calsans tracking-tight">
                {isForgetPhoneNumber ? "Cek No Telpon/WA" : "Reset Password"}
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">
                {isForgetPhoneNumber
                  ? "Harap masukkan NIK kamu sebelum melihat no telpon/WA mu yang terdaftar pada ELAUT"
                  : "Harap masukkan NIK kamu sebelum melakukan reset, untuk mengetahui NIK tersebut terdaftar atau tidak"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="nik" className="text-xs font-medium text-gray-300">
                  NIK
                </Label>
                <div className="flex flex-col gap-1 w-full">
                  <input
                    id="nik"
                    value={nik}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNik(value);
                      setIsInputErrorNIK(value.length > 0 && value.length < 16);
                    }}
                    maxLength={16}
                    placeholder="Masukkan 16 digit NIK"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    readOnly={tokenResetPassword != ""}
                    autoComplete="off"
                  />
                  {isInputErrorNIK && nik != "" && (
                    <span className="text-rose-400 font-medium text-[10px]">
                      *NIK harus 16 digit!
                    </span>
                  )}
                </div>
              </div>

              {tokenResetPassword != "" && (
                <div className="space-y-1.5">
                  <Label htmlFor="passwordReset" className="text-xs font-medium text-gray-300">
                    Password Baru
                  </Label>
                  <input
                    id="passwordReset"
                    value={passwordReset}
                    type="password"
                    onChange={(e) => setPasswordReset(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                    autoComplete="off"
                  />
                  <p className="text-gray-500 text-[10px] leading-relaxed mt-2 italic">
                    *Password minimal 8 karakter, harus terdiri dari satu angka, huruf kapital dan kecil, serta karakter khusus.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="sm:justify-start gap-2">
              <div className="flex w-full gap-2">
                {tokenResetPassword == "" ? (
                  <Button
                    type="button"
                    onClick={(e) => handleGetTokenResetPassword(e)}
                    disabled={isInputErrorNIK}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                  >
                    Cek Akunmu
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => handleResetPassword(e)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
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
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl"
                >
                  Tutup
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <section className="relative z-10 w-full max-w-lg flex flex-col items-center max-h-full overflow-y-auto scrollbar-hide py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full flex flex-col items-center"
          >
            {/* Header Section */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Portal Masyarakat
              </motion.div>
              <h1 className="text-3xl md:text-4xl leading-none font-bold tracking-tight text-white font-calsans mb-2">
                Selamat Datang di <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">E-LAUT</span>
              </h1>
              <p className="text-gray-400 mx-auto text-xs md:text-sm leading-relaxed max-w-sm">
                Akses portal pelatihan dan sertifikasi kelautan terpadu. Pilih peran anda untuk melanjutkan.
              </p>
            </div>

            {/* Role Switcher Tab */}
            <div className="w-full max-w-[340px] mb-6 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex">
              <button
                onClick={() => setRole("Perseorangan")}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${role === "Perseorangan" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                  }`}
              >
                PERSEORANGAN
              </button>
              <button
                onClick={() => setRole("Corporate")}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${role === "Corporate" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                  }`}
              >
                CORPORATE
              </button>
            </div>

            {/* Glassmorphism Form Card */}
            <div className="w-full relative group px-2 md:px-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000" />
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
                {role == "Perseorangan" ? (
                  <form onSubmit={(e) => handleLoginAkun(e)} autoComplete="off" className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-300 flex items-center gap-2">
                        Login Menggunakan
                      </label>
                      <Select
                        value={selectedMethodLogin}
                        onValueChange={(value: string) => setSelectedMethodLogin(value)}
                      >
                        <SelectTrigger className="w-full h-11 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all appearance-none cursor-pointer placeholder:text-gray-500 font-inter">
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

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-300 flex items-center gap-2" htmlFor="no_number">
                        {selectedMethodLogin == 'NIK' ? <HiOutlineIdentification className="text-blue-400" /> : <HiOutlineDeviceMobile className="text-blue-400" />}
                        {selectedMethodLogin == 'NIK' ? 'Nomor Induk Kependudukan (NIK)' : 'No Telepon / WhatsApp'}
                      </label>
                      <input
                        id="no_number"
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
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
                      <div className="flex justify-between items-center px-1">
                        {isInputErrorNoTelpon && formData.no_number != "" ? (
                          <span className="text-rose-400 font-medium text-[10px]">
                            * Minimal {selectedMethodLogin === 'NIK' ? '16' : '12'} digit!
                          </span>
                        ) : (
                          <span className="text-white/30 text-[9px] font-medium uppercase tracking-tight">Lupa data anda? klik <button type="button" onClick={() => { setIsForgetPhoneNumber(true); setIsForgetPassword(true); }} className="text-blue-400 font-bold hover:underline">disini</button></span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-300 flex items-center gap-2" htmlFor="password">
                        <HiOutlineLockClosed className="text-blue-400" /> Security Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={isShowPassword ? "text" : "password"}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                          placeholder="••••••••"
                          required
                          name="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange(e)}
                        />
                        <button
                          type="button"
                          onClick={() => setIsShowPassword(!isShowPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                          {isShowPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                        </button>
                      </div>
                      <div className="flex justify-end pr-1">
                        <button
                          type="button"
                          onClick={() => setIsForgetPassword(true)}
                          className="text-blue-400 hover:text-blue-300 text-[10px] font-bold transition-colors"
                        >
                          Lupa password?
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
                      >
                        SIGN IN PERSEORANGAN
                        <HiOutlineMail className="group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => handleLoginAkunManningAgent(e)}
                    autoComplete="off"
                    className="space-y-5"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-300 flex items-center gap-2" htmlFor="email_agent">
                        <HiOutlineMail className="text-blue-400" /> Corporate Email
                      </label>
                      <input
                        id="email_agent"
                        type="email"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                        placeholder="corporate@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-300 flex items-center gap-2" htmlFor="password_corporate">
                        <HiOutlineLockClosed className="text-blue-400" /> Office Password
                      </label>
                      <div className="relative">
                        <input
                          id="password_corporate"
                          type={isShowPassword ? "text" : "password"}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                          placeholder="••••••••"
                          required
                          value={passwordManningAgent}
                          onChange={(e) => setPasswordManningAgent(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setIsShowPassword(!isShowPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                          {isShowPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                        </button>
                      </div>
                    </div>

                    {passwordManningAgent != "" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-white/5 rounded-xl border border-white/5 p-3 overflow-hidden"
                      >
                        <p className="text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-wider text-center">Safety Check</p>
                        <div className="flex justify-center scale-90 sm:scale-100">
                          <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                            theme="dark"
                            onChange={setCaptcha}
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="pt-2">
                      <motion.button
                        disabled={!captcha && passwordManningAgent != ""}
                        whileHover={captcha || passwordManningAgent == "" ? { scale: 1.01 } : {}}
                        whileTap={captcha || passwordManningAgent == "" ? { scale: 0.99 } : {}}
                        type="submit"
                        className={`w-full h-12 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 group ${captcha || passwordManningAgent == ""
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-500/20"
                          : "bg-white/10 text-white/30 cursor-not-allowed"
                          }`}
                      >
                        SIGN IN CORPORATE
                        <HiOutlineUserGroup className="group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </form>
                )}

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-gray-400 text-center text-sm">
                    Belum memiliki akun?{" "}
                    <Link
                      href="/registrasi"
                      onClick={() => Cookies.set("XSRF087", "1")}
                      className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
                    >
                      Daftar Sekarang
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Security Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl"
            >
              <FiShield className="text-emerald-500 shrink-0" size={16} />
              <p className="text-[10px] text-gray-500 leading-tight">KKP Protected: Secure data encryption active. Authorized access only.</p>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default FormLogin;
