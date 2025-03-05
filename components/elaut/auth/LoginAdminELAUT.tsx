"use client";

import Toast from "@/components/toast";
import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectLabel,
} from "@/components/ui/select";
import { HiMiniUserGroup, HiOutlineEye } from "react-icons/hi2";
import ReCAPTCHA from "react-google-recaptcha";
import { generateRandomId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HiOutlineEyeOff } from "react-icons/hi";
import { sanitizedDangerousChars } from "@/utils/input";
import { HashLoader } from "react-spinners";

export const LoginAdminELAUT = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  // SHOWING PASSWORD
  const [isShowPassword, setIsShowPassword] = React.useState<boolean>(false);

  // CAPTCHA VALIDATION
  const [captcha, setCaptcha] = React.useState<string | null>();

  const [isRedirecting, setIsRedirecting] = React.useState<boolean>(false)

  /*
      state variables for login
      */
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("");

  const resetAllStateToEmptyString = () => {
    setEmail("");
    setPassword("");
  };

  // HANDLING RESET STATE
  const handleClearStateLogin = () => {
    setEmail("");
    setPassword("");
    setRole("");
  };

  // HANDLING LOGIN ADMIN
  const [isLoadingLogin, setIsLoadingLogin] = React.useState<boolean>(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoadingLogin(true);


    if (!email || !password) {
      Toast.fire({
        icon: "error",
        title: "Gagal mencoba login.",
        text: "Harap lengkapi email dan password terlebih dahulu sebelum login!",
      });
      handleClearStateLogin();
      setIsLoadingLogin(false);
      return;
    }

    if (!captcha) {
      Toast.fire({
        icon: "error",
        title: "Gagal mencoba login.",
        text: "Untuk membuktikan kamu bukan robot, harap melakukan captcha terlebih dahulu!",
      });
      setIsLoadingLogin(false);
      return;
    }

    try {
      const response: AxiosResponse = await axios.post(
        `${baseUrl}/${email.includes('bppp') || email.includes('balai') || email.includes('puslatkp') ? "lemdik" : "adminPusat"
        }/login`,
        JSON.stringify({ email, password }),
        { headers: { "Content-Type": "application/json" } }
      );

      Toast.fire({
        icon: "success",
        title: "Yeayyy!",
        text: "Berhasil login ke admin E-LAUT, silahkan manajemen pelatihan dan sertifikat-mu!",
      });

      Cookies.set("XSRF091", response.data.t, { expires: 1 });
      Cookies.set("XSRF092", "true", { expires: 1 });
      Cookies.set(
        "XSRF093",
        email.includes('bppp') || email.includes('balai') || email.includes('puslatkp')
          ? "balai"
          : "adminPusat",
        { expires: 1 }
      );

      resetAllStateToEmptyString();
      setIsLoadingLogin(false);

      const dashboardPath =
        email.includes('bppp') || email.includes('balai') || email.includes('puslatkp')
          ? `/${generateRandomId()}/lemdiklat/dashboard`
          : "/admin/pusat/dashboard";
      setIsRedirecting(true)
      router.push(dashboardPath);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.status === 401
            ? "Email atau password yang dimasukkan salah, harap periksa kembali!"
            : error.response?.status === 500
              ? "Proses login gagal dikarenakan terjadi gangguan pada server, hubungi admin pusat melalui call center!"
              : "Periksa jaringan internetmu, sistem tidak terhubung ke internet!";

        Toast.fire({
          icon: "error",
          title: "Oops.",
          text: errorMessage,
        });

        setIsLoadingLogin(false);
        setIsRedirecting(false)
      }
    }
  };

  return (
    <section className="w-full">
      <main className="bg-darkDPKAKP w-full  h-screen  relative">
        <Image
          src={"/images/hero-img3.jpg"}
          className="absolute w-full h-screen  z-10 object-cover duration-1000"
          alt=""
          fill={true}
          priority
        />
        <div className="absolute w-full h-screen  bg-black opacity-70 inset-0 z-20"></div>

        <section className=" z-50 relative h-fit space-y-6 pb-8 pt-36 md:h-screen md:pb-12 md:pt-20 lg:py-44 w-full flex items-center justify-center flex-col">
          {
            isRedirecting ? <div className="mt-32">
              <HashLoader color="#338CF5" size={50} />
            </div> : <> <div className="container relative flex max-w-[64rem] flex-col items-center gap-2 text-center">
              <div className="rounded-2xl bg-blue-500 px-4 py-1.5 text-sm text-gray-200 font-medium">
                E-LAUT
              </div>

              <h1 className="font-bold font-calsans text-gray-200 text-4xl -mt-2">
                Login Admin{" "}
                <span className=" bg-clip-text text-transparent bg-gradient-to-r leading-none pt-0 from-blue-500 to-teal-400">
                  E-LAUT
                </span>
              </h1>
              <p className="font-jakarta max-w-[42rem] leading-[115%] text-gray-300  sm:text-base -mt-3">
                Selamat datang kembali, silahkan login untuk mengakses dashboard
                admin Elektronik Layanan Pelatihan Kelautan dan Perikanan Utama
                Terpadu!
              </p>
            </div>
              <div className="flex flex-col gap-2 w-full max-w-md mx-auto z-50">
                <div className="flex flex-col gap-1">
                  <p className="font-jakarta  leading-[100%] text-gray-300  sm:text-sm sm:leading-8 -mt-4">
                    Email Address
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded-xl text-white border-blue-500 bg-transparent w-full placeholder:text-gray-300"
                    placeholder="Enter your email address"
                    autoComplete="off"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-jakarta  leading-[100%] text-gray-300  sm:text-sm sm:leading-8 ">
                    Password
                  </p>
                  <span className="w-full relative h-fit">
                    <input
                      type={isShowPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border rounded-xl text-white border-blue-500 bg-transparent w-full placeholder:text-gray-300"
                      placeholder="Enter your password"
                      autoComplete="off"
                    />
                    <span onClick={(e) => setIsShowPassword(!isShowPassword)}>
                      {isShowPassword ? (
                        <HiOutlineEyeOff className="text-gray-200 my-auto top-3 mr-5 absolute right-0 text-xl cursor-pointer" />
                      ) : (
                        <HiOutlineEye className="text-gray-200 my-auto top-3 mr-5 absolute right-0 text-xl cursor-pointer" />
                      )}
                    </span>
                  </span>
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

                {isLoadingLogin ? (
                  <Button
                    type="button"
                    className="text-white w-full text-base bg-blue-500 bg-opacity-50 rounded-xl hover:bg-blue-600  py-3"
                  >
                    Loading...
                  </Button>
                ) : (
                  <Button
                    disabled={captcha ? false : true}
                    onClick={(e) => handleLogin(e)}
                    className="text-white w-full text-base bg-blue-500 rounded-xl hover:bg-blue-600  py-3"
                  >
                    Login
                  </Button>
                )}
                <div className="text-sm text-gray-200 text-center mt-2">
                  By logging to the system, you agree to the{" "}
                  <span className="underline">terms & conditions</span>, and our{" "}
                  <span className="underline">privacy policy</span>.
                </div>
              </div></>
          }
        </section>
      </main>
    </section>
  );
};
