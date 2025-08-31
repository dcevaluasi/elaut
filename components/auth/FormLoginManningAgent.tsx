"use client";

// NEXT JS COMPONENTS
import Image from "next/image";
import Link from "next/link";

import React, { FormEvent } from "react";
import Toast from "../toast";
import { useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";

// RECAPTCHA
import ReCAPTCHA from "react-google-recaptcha";

function FormLoginManningAgent() {
  /* state variable to store basic user information to register */
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const recaptchaRef = React.createRef();
  const [countWrongPassword, setCountPassword] = React.useState<number>(0);

  const [captcha, setCaptcha] = React.useState<string | null>();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  const handleLoginAkun = async (e: FormEvent) => {
    e.preventDefault();
    if (countWrongPassword <= 3) {
      if (email == "" || password == "") {
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

  const [imageIndex, setImageIndex] = React.useState(0);
  const images = ["/images/hero-img3.jpg"];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-screen md:h-full">
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
                Login dan Daftarkan
              </span>{" "}
              <br />
              <span className="z-0 bg-clip-text text-[4.2rem] w-[600px] md:text-[3.7rem] leading-[110%]  text-transparent bg-gradient-to-r font-calsans from-blue-500  to-teal-400">
                Pesertamu pada Pelatihan dan Sertifikasi
              </span>{" "}
            </h1>
          </div>

          {/* Form */}
          <div className="max-w-sm  mx-5 md:mx-auto mt-5">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
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

export default FormLoginManningAgent;
