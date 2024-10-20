"use client";

// NEXT JS COMPONENTS
import Image from "next/image";
import Link from "next/link";

import React, { FormEvent } from "react";
import Toast from "../toast";
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
import { elautBaseUrl } from "@/constants/urls";

function FormLogin() {
  /* state variable to store basic user information to register */
  const [noNumber, setNoNumber] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const recaptchaRef = React.createRef();
  const [countWrongPassword, setCountPassword] = React.useState<number>(0);

  const [captcha, setCaptcha] = React.useState<string | null>();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  const handleLoginAkun = async (e: FormEvent) => {
    e.preventDefault();
    if (countWrongPassword <= 3) {
      if (noNumber == "" || password == "") {
        Toast.fire({
          icon: "error",
          title: "Gagal mencoba login.",
          text: `Tolong lengkapi data login untuk login kedalam ELAUT`,
        });
      } else {
        if (captcha) {
          try {
            const response: AxiosResponse = await axios.post(
              `${baseUrl}/users/loginNotelpon`,
              JSON.stringify({
                no_number: noNumber,
                password: password,
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            console.log({ response });

            Cookies.set("XSRF081", response.data.t, { expires: 1 });
            Cookies.set("XSRF082", "true", { expires: 1 });

            if (Cookies.get("XSRF085")) {
              Toast.fire({
                icon: "success",
                title: "Berhasil login.",
                text: `Berhasil melakukan login, ayo segera daftarkan dirimu!`,
              });
              router.push(Cookies.get("XSRF085")!);
            } else {
              Toast.fire({
                icon: "success",
                title: "Berhasil login.",
                text: `Berhasil melakukan login kedalam ELAUT!`,
              });
              if (Cookies.get("XSRF083")) {
                // router.push("/dashboard/complete-profile");
                if (Cookies.get("LastPath")) {
                  const path = Cookies.get("LastPath");
                  router.push(path!);
                }
              } else {
                if (Cookies.get("LastPath")) {
                  const path = Cookies.get("LastPath");
                  router.push(path!);
                } else {
                  router.push("layanan/program/akp");
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
        if (captcha) {
          try {
            const response: AxiosResponse = await axios.post(
              `${baseUrl}/manningAgent/loginManningAgent`,
              JSON.stringify({
                email: email,
                password: passwordManningAgent,
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            console.log({ response });

            Cookies.set("XSRF081", response.data.t, { expires: 1 });
            Cookies.set("XSRF082", "true", { expires: 1 });
            Cookies.set("isManningAgent", "true", { expires: 1 });

            if (Cookies.get("XSRF085")) {
              Toast.fire({
                icon: "success",
                title: "Berhasil login.",
                text: `Berhasil melakukan login, ayo segera daftarkan dirimu!`,
              });
              router.push(Cookies.get("XSRF085")!);
            } else {
              Toast.fire({
                icon: "success",
                title: "Berhasil login.",
                text: `Berhasil melakukan login kedalam ELAUT!`,
              });
              if (Cookies.get("XSRF083")) {
                // router.push("/dashboard/complete-profile");
                if (Cookies.get("LastPath")) {
                  const path = Cookies.get("LastPath");
                  router.push(path!);
                }
              } else {
                if (Cookies.get("LastPath")) {
                  const path = Cookies.get("LastPath");
                  router.push(path!);
                } else {
                  router.push("layanan/program/akp");
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
    } else {
      Toast.fire({
        icon: "error",
        title: "Gagal mencoba login.",
        text: `Ups, terlihat kamu sudah mencoba berulang kali dengan password gagal, coba lagi nanti!`,
      });
    }
  };

  const [role, setRole] = React.useState<string>("");

  const [imageIndex, setImageIndex] = React.useState(0);
  const images = ["/images/hero-img3.jpg"];

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
    try {
      const response = await axios.post(
        `${elautBaseUrl}/users/getTokenPassword`,
        {
          nik: nik,
        }
      );

      console.log({ response });

      if (isForgetPhoneNumber) {
        Toast.fire({
          icon: "success",
          title: "No Telpon ditemukan.",
          text: `Berhasil, silahkan mendapatkan nomormu yang terdaftar, silahkan login!`,
        });
        setIsForgetPassword(false);
        setPhoneNumberInformation(response.data.no_telpon);
        setNoNumber(response.data.no_telpon);
        setIsForgetPhoneNumber(false);
      } else {
        Toast.fire({
          icon: "success",
          title: "Akun ditemukan.",
          text: `Berhasil, silahkan reset ulang password mu!`,
        });
        setTokenResetPassword(response.data.token);
        setPassword("");
      }
    } catch (error: any) {
      console.log({ error });
      const errorMsg = error.response.data.Pesan;
      Toast.fire({
        icon: "error",
        title: "Akun tidak ditemukan.",
        text: `Gagal. ${errorMsg}!`,
      });
      setNoNumber("");
      setPassword("");
    }
  };
  const handleResetPassword = async (e: any) => {
    try {
      const response = await axios.post(
        `${elautBaseUrl}/users/resetPassword`,
        { password: passwordReset },
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
      setNoNumber("");
      setPassword("");
      setIsForgetPassword(false);
      setTokenResetPassword("");
      setRole("Mandiri");
      console.log({ response });
    } catch (error: any) {
      console.log({ error });
      setNik("");
      setPasswordReset("");
      setIsForgetPassword(false);
      setTokenResetPassword("");
      setNoNumber("");
      setPassword("");
      Toast.fire({
        icon: "error",
        title: "Gagal mereset.",
        text: `Password mu gagal untuk direset, nampaknya terdapat gangguan`,
      });
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-screen md:h-full">
      <Dialog open={isForgetPassword} onOpenChange={setIsForgetPassword}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isForgetPhoneNumber ? "Cek No Telpon/WA" : "Reset Password"}
            </DialogTitle>
            <DialogDescription>
              {isForgetPhoneNumber
                ? "Harap masukkan NIK kamu sebelum melihat no telpon/WA mu yang terdaftar pada ELAUT"
                : "Harap masukkan NIK kamu sebelum melakukan reset, untuk mengetahui NIK tersebut terdaftar atau tidak"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                NIK
              </Label>
              <Input
                id="nik"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="Masukkan NIK kamu"
                className="col-span-3"
                readOnly={tokenResetPassword != ""}
                autoComplete="off"
              />
            </div>
            {tokenResetPassword != "" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Password Baru
                </Label>
                <Input
                  id="passwordReset"
                  value={passwordReset}
                  type="password"
                  onChange={(e) => setPasswordReset(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="col-span-3"
                  autoComplete="off"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex gap-2 -mt-4">
              {tokenResetPassword == "" ? (
                <Button
                  type="button"
                  onClick={(e) => handleGetTokenResetPassword(e)}
                  disabled={nik == ""}
                  className=" bg-blue-500 hover:bg-blue-600"
                >
                  Cek Akunmu
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={(e) => handleResetPassword(e)}
                  className=" bg-blue-500 hover:bg-blue-600"
                >
                  Reset Password
                </Button>
              )}
              <Button
                type="button"
                onClick={(e) => {
                  setNik("");
                  setPasswordReset("");
                  setIsForgetPassword(false);
                }}
                className=" bg-gray-500 hover:bg-gray-600"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Image
        src={images[imageIndex]}
        className="absolute w-full h-full object-cover duration-1000 -z-40"
        alt=""
        layout={"fill"}
        priority
      />

      <div className="absolute w-full h-full bg-black bg-opacity-70 -z-30"></div>

      <div className="max-w-6xl h-full mx-auto px-4 sm:px-6 md:-mt-8">
        <div className="pt-32  md:pt-40 md:pb-20">
          <div className="w-full mx-auto text-center pb-0 md:pb-0">
            <h1 className="font-semibold text-4xl leading-[110%] md:text-4xl text-gray-200">
              <span className="font-calsans text-[3.4rem] md:text-[3.7rem]">
                Login dan Ikuti
              </span>{" "}
              <br />
              <span className="z-0 bg-clip-text text-[4.2rem] w-[600px] md:text-[3.7rem] leading-[110%]  text-transparent bg-gradient-to-r font-calsans from-blue-500  to-teal-400">
                Pelatihan dan Sertifikasi
              </span>{" "}
            </h1>
          </div>

          {/* Form */}

          <div className="max-w-sm  mx-5 md:mx-auto mt-5">
            <div className="flex flex-col gap-1 mb-2">
              <label
                className="block text-gray-200 text-sm font-medium mb-1"
                htmlFor="name"
              >
                Daftar Sebagai <span className="text-red-600">*</span>
              </label>
              <Select
                value={role}
                onValueChange={(value: string) => setRole(value)}
              >
                <SelectTrigger className="form-input w-full py-6 bg-transparent placeholder:text-gray-200 border-gray-400 focus:border-gray-200  active:border-gray-200 text-gray-200">
                  <p className="mr-3 flex items-center gap-1 text-base text-gray-300">
                    <HiMiniUserGroup />
                    {role != "" ? role : "Pilih Mendaftar Sebagai"}
                  </p>
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectGroup>
                    <SelectLabel>Mendaftar Sebagai</SelectLabel>
                    <SelectItem value="Mandiri">Mandiri</SelectItem>
                    <SelectItem value="Corporate/Manning Agent">
                      Corporate/Manning Agent
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {role == "Mandiri" ? (
              <form onSubmit={(e) => handleLoginAkun(e)} autoComplete="off">
                <div className="flex flex-wrap -mx-3 mb-2">
                  <div className="w-full px-3">
                    <label
                      className="block text-gray-200 text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      No Telepon/WA <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="form-input w-full bg-transparent placeholder:text-gray-200 border-gray-400 focus:border-gray-200  active:border-gray-200 text-gray-200"
                      placeholder="Masukkan No Telepon/WA"
                      value={noNumber}
                      onChange={(e) => setNoNumber(e.target.value)}
                      required
                    />
                    <span className="block text-gray-200 text-xs font-medium">
                      Lupa no telpon/WA? klik{" "}
                      <span
                        onClick={(e) => {
                          setIsForgetPhoneNumber(true);
                          setIsForgetPassword(true);
                        }}
                        className="text-blue-500 cursor-pointer"
                      >
                        disini
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-2">
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
                        type={isShowPassword ? "text" : "password"}
                        className="form-input w-full bg-transparent placeholder:text-gray-200 border-gray-400 focus:border-gray-200  active:border-gray-200 text-gray-200"
                        placeholder="Masukkan password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span onClick={(e) => setIsShowPassword(!isShowPassword)}>
                        {isShowPassword ? (
                          <HiOutlineEyeOff className="text-gray-200 my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer" />
                        ) : (
                          <HiOutlineEye className="text-gray-200 my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer" />
                        )}
                      </span>
                    </span>
                    <span className="block text-gray-200 text-xs font-medium">
                      Lupa password? klik{" "}
                      <span
                        onClick={(e) => setIsForgetPassword(true)}
                        className="text-blue-500 cursor-pointer"
                      >
                        disini
                      </span>
                    </span>
                  </div>
                </div>
                {password != "" && (
                  <div
                    className="flex flex-wrap w-full -mx-3 mb-2"
                    style={{ width: "100% !important" }}
                  >
                    <div
                      className="w-full px-3"
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
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        className="mx-auto w-full font-inter text-sm"
                        onChange={setCaptcha}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap -mx-3 mt-3">
                  <div className="w-full px-3">
                    <button
                      type="submit"
                      className={`btn text-white ${
                        captcha
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-500 hover:bg-gray-600"
                      } w-full`}
                      disabled={captcha ? false : true}
                    >
                      Login
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-200 text-center mt-3">
                  By creating an account, you agree to the{" "}
                  <a className="underline" href="#0">
                    terms & conditions
                  </a>
                  , and our{" "}
                  <a className="underline" href="#0">
                    privacy policy
                  </a>
                  .
                </div>
              </form>
            ) : (
              <form
                onSubmit={(e) => handleLoginAkunManningAgent(e)}
                autoComplete="off"
              >
                <div className="flex flex-wrap -mx-3 mb-2">
                  <div className="w-full px-3">
                    <label
                      className="block text-gray-200 text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="name"
                      type="email"
                      className="form-input w-full bg-transparent placeholder:text-gray-200 border-gray-400 focus:border-gray-200  active:border-gray-200 text-gray-200"
                      placeholder="Masukkan Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-2">
                  <div className="w-full px-3">
                    <label
                      className="block text-gray-200 text-sm font-medium mb-1"
                      htmlFor="password"
                    >
                      Password <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-input w-full bg-transparent placeholder:text-gray-200 border-gray-400 focus:border-gray-200  active:border-gray-200 text-gray-200"
                      placeholder="Masukkan password"
                      required
                      value={passwordManningAgent}
                      onChange={(e) => setPasswordManningAgent(e.target.value)}
                    />
                  </div>
                </div>
                {passwordManningAgent != "" && (
                  <div
                    className="flex flex-wrap w-full -mx-3 mb-2"
                    style={{ width: "100% !important" }}
                  >
                    <div
                      className="w-full px-3"
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
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        className="mx-auto w-full font-inter text-sm"
                        onChange={setCaptcha}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap -mx-3 mt-3">
                  <div className="w-full px-3">
                    <button
                      type="submit"
                      className={`btn text-white ${
                        captcha
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-500 hover:bg-gray-600"
                      } w-full`}
                      disabled={captcha ? false : true}
                    >
                      Login
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-200 text-center mt-3">
                  By creating an account, you agree to the{" "}
                  <a className="underline" href="#0">
                    terms & conditions
                  </a>
                  , and our{" "}
                  <a className="underline" href="#0">
                    privacy policy
                  </a>
                  .
                </div>
              </form>
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
              Belum punya akun sebelumnya?{" "}
              <Link
                href="/registrasi"
                className="text-blue-500 hover:underline transition duration-150 ease-in-out"
              >
                Registrasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FormLogin;
