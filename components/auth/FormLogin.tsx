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
import { elautBaseUrl, manningAgentDevUrl } from "@/constants/urls";
import { sanitizedDangerousChars, validateIsDangerousChars } from "@/utils/input";

function FormLogin() {
  const [formData, setFormData] = React.useState<{ [key: string]: string }>({
    no_number: '',
    password: '',
  });

  const [errors, setErrors] = React.useState<{ [key: string]: string | null }>({
    no_number: null,
    password: null
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
    if (validateIsDangerousChars(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "You are using dangerous characters!"
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null
      }))
    }
  }

  /* state variable to store basic user information to register */
  // const [noNumber, setNoNumber] = React.useState<string>("");
  // const [password, setPassword] = React.useState<string>("");
  const recaptchaRef = React.createRef();
  const [countWrongPassword, setCountPassword] = React.useState<number>(0);

  const [captcha, setCaptcha] = React.useState<string | null>();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  const handlePasswordCriteria = (password: string) => {
    const criteria = [
      {
        regex: /.{8,}/,
        message: `Password must be at least 8 characters long.`,
      },
      {
        regex: /[A-Z]/,
        message: "Password must contain at least one uppercase letter.",
      },
      {
        regex: /[a-z]/,
        message: "Password must contain at least one lowercase letter.",
      },
      { regex: /[0-9]/, message: "Password must contain at least one number." },
      {
        regex: /[!@#$%^&*(),.?":{}|<>]/,
        message:
          "Password must contain at least one special character (symbol).",
      },
    ];

    for (const { regex, message } of criteria) {
      if (!regex.test(password)) {
        Toast.fire({
          icon: "error",
          title: message,
        });
        return false;
      }
    }

    return true;
  };

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
        if (validateIsDangerousChars(formData!.no_number) || validateIsDangerousChars(formData!.password)) {
          Toast.fire({
            icon: "error",
            title: "Oopsss!",
            text: `Kamu memasukkan karakter berbahaya pada no telpon atau password, login tidak dapat diproses!`,
          });
        } else {
          if (captcha) {
            try {
              const response: AxiosResponse = await axios.post(
                `${baseUrl}/users/loginNotelpon`,
                JSON.stringify({
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

              Cookies.set("XSRF081", response.data.t, { expires: 1 });
              Cookies.set("XSRF082", "true", { expires: 1 });

              if (Cookies.get("XSRF085")) {
                Toast.fire({
                  icon: "success",
                  title: "Berhasil login.",
                  text: `Berhasil melakukan login, ayo segera daftarkan dirimu!`,
                });
                router.replace(Cookies.get("XSRF085")!);
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
                    router.replace("layanan/program/akp");
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
        if (validateIsDangerousChars(email) || validateIsDangerousChars(passwordManningAgent)) {
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
              Cookies.set("XSRF082", "true", { expires: 1 });
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
          setFormData({ no_number: response.data.no_telpon, password: '' });
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

  const [isInputErrorNoTelpon, setIsInputErrorNoTelpon] = React.useState<boolean>(false)
  const [isInputErrorNIK, setIsInputErrorNIK] = React.useState<boolean>(true)
  const [isInputErrorPassword, setIsInputErrorPassword] = React.useState<boolean>(true)

  return (
    <section className="relative w-full h-full md:h-full bg-none">
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
          <div className="grid gap-4 py-2">
            <div className="flex flex-col items-start gap-1">

              <Label htmlFor="name" className="text-right">
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
                  className=" w-full"
                  readOnly={tokenResetPassword != ""}
                  autoComplete="off"
                />
                {isInputErrorNIK && nik != '' && (
                  <span className="text-rose-500 font-medium text-xs">
                    *NIK harus 16 digit!
                  </span>
                )}
              </div>

            </div>
            {tokenResetPassword != "" && (
              <div className="flex flex-col gap-1">
                <div className="flex flex-col items-start gap-2">
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
                <p className="text-gray-500 leading-[100%] text-xs font-medium mt-2">
                  *Password minimal 8 karakter, harus terdiri dari satu angka,
                  huruf kapital dan kecil, serta karakter
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex gap-2 -mt-4">
              {tokenResetPassword == "" ? (
                <Button
                  type="button"
                  onClick={(e) => handleGetTokenResetPassword(e)}
                  disabled={isInputErrorNIK ? true : false}
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
                  setTokenResetPassword("");
                  setIsInputErrorNIK(true)
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
        width={0}
        height={0}
        priority
      />

      <div className="absolute w-full h-full bg-black bg-opacity-70 -z-30"></div>

      <div className="max-w-6xl h-full mx-auto px-4 sm:px-6 md:-mt-8">
        <div className="pt-44 md:pb-20">
          <div className="w-full mx-auto text-center pb-0 md:pb-0">
            <h1 className="font-bold text-4xl leading-[110%] text-gray-200 font-calsans">
              <span className="">
                Login dan Ikuti
              </span>{" "}<br />
              <span className="z-0 bg-clip-text  w-[600px] leading-[110%]  text-transparent bg-gradient-to-r  from-blue-500  to-teal-400">
                Pelatihan di E-LAUT
              </span>{" "}
            </h1>
            <p className="text-base text-center mx-auto text-gray-200 mt-2  max-w-3xl">
              login tersedia dalam dua opsi: Perseorangan untuk individu,
              Corporate untuk grup untuk yang punya rekam
              jejak atau sertifikasi. Fleksibel sesuai kebutuhan!
            </p>
          </div>

          {/* Form */}

          <div className="max-w-sm  mx-5 md:mx-auto mt-5">
            <div className="flex flex-col gap-1 mb-2">
              <label
                className="block text-gray-200 text-sm font-medium mb-1"
                htmlFor="name"
              >
                Masuk Sebagai <span className="text-red-600">*</span>
              </label>
              <Select
                value={role}
                onValueChange={(value: string) => setRole(value)}
              >
                <SelectTrigger className="form-input w-full py-6 bg-transparent placeholder:text-gray-200 border-gray-400 focus:border-gray-200  active:border-gray-200 text-gray-200">
                  <p className="mr-3 flex items-center gap-1 text-base text-gray-300">
                    <HiMiniUserGroup />
                    {role != "" ? role : "Pilih Masuk Sebagai"}
                  </p>
                </SelectTrigger>
                <SelectContent side="bottom">
                  <SelectGroup>
                    <SelectLabel>Masuk Sebagai</SelectLabel>
                    <SelectItem value="Perseorangan">Perseorangan</SelectItem>
                    <SelectItem value="Corporate/Manning Agent">
                      Corporate/Manning Agent
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {role == "" ? (
              <></>
            ) : role == "Perseorangan" ? (
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
                      value={formData.no_number}
                      name="no_number"
                      maxLength={13}
                      minLength={12}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange(e);
                        setIsInputErrorNoTelpon(value.length > 0 && value.length < 12);
                      }}
                      required
                    />

                    {isInputErrorNoTelpon && formData.no_telpon != '' && (
                      <span className="text-rose-500 font-medium text-xs">
                        *No Telpon minimal 12 digit!
                      </span>
                    )}

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
                        name="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange(e)}
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
                {formData!.password != "" && (
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
                      className={`btn text-white ${captcha
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
                    <span className="relative w-full h-fit">
                      <input
                        id="password"
                        type={isShowPassword ? "text" : "password"}
                        className="form-input w-full bg-transparent placeholder:text-gray-200 border-gray-400 focus:border-gray-200  active:border-gray-200 text-gray-200"
                        placeholder="Masukkan password"
                        required
                        value={passwordManningAgent}
                        onChange={(e) =>
                          setPasswordManningAgent(e.target.value)
                        }
                      />
                      <span onClick={(e) => setIsShowPassword(!isShowPassword)}>
                        {isShowPassword ? (
                          <HiOutlineEyeOff className="text-gray-200 my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer" />
                        ) : (
                          <HiOutlineEye className="text-gray-200 my-auto top-0 mr-5 absolute right-0 text-xl cursor-pointer" />
                        )}
                      </span>
                    </span>
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
                      className={`btn text-white ${captcha
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
