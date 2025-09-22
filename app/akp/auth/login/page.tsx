"use client";

import Toast from "@/commons/Toast";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

function page() {
  const baseUrl = process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL;
  const router = useRouter();
  /*
    state variables for login
    */
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  /*
    method for resting all state data login (LOG)
*/
  const logAllStates = () => {
    console.log("username:", username);
    console.log("password:", password);
  };

  const resetAllStateToEmptyString = () => {
    setUsername("");
    setPassword("");
  };

  /*
        method for processing login (POST)
      */
  const handleLogin = async (e: any) => {
    e.preventDefault();

    const data = new FormData();
    data.append("username", username);
    data.append("password", password);

    logAllStates();

    try {
      const response: AxiosResponse = await axios.post(
        `${baseUrl}/adminpusat/login`,
        JSON.stringify({
          username: username,
          password: password,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log({ response });
      console.log("Successfully logged in");
      Toast.fire({
        icon: "success",
        title: `Berhasil login ke admin AKAPI Puslat!`,
      });

      Cookies.set("XSRF091", response.data.t);
      Cookies.set("XSRF092", "true");

      resetAllStateToEmptyString();
      router.push(`/akp/puslat/dashboard`);
    } catch (error) {
      console.error("Error saat melakukan login", error);
      Toast.fire({
        icon: "error",
        title: `Gagal melakukan login, harap coba lagi nanti!`,
      });
      throw error;
    }
  };
  return (
    <section className="w-full">
      <main className="bg-darkDPKAKP w-full  h-screen  relative">
        <Image
          src={"/akp/akp.jpg"}
          className="absolute w-full h-screen  z-10 object-cover duration-1000"
          alt=""
          fill={true}
          priority
        />
        <div className="absolute w-full h-screen  bg-black opacity-70 inset-0 z-20"></div>

        <section className=" z-50 relative h-fit space-y-6 pb-8 pt-36 md:h-screen  md:pb-12 md:pt-20 lg:py-44 w-full flex items-center justify-center flex-col">
          <div className="container relative flex max-w-[64rem] flex-col items-center gap-2 text-center">
            <div className="rounded-2xl bg-blue-950 px-4 py-1.5 text-sm text-gray-200 font-medium">
              Sertifikasi AKP
            </div>
            <div className="flex w-fit gap-2 items-center">
              <Image
                className=" w-[90px] my-1 z-10"
                src={"/dpkakp/logo.png"}
                width={0}
                height={0}
                alt="DPKAKP Logo"
              />{" "}
              {/* <Image
                className=" w-[100px] my-1 z-10"
                src={"/dpkakp/logo-komite.png"}
                width={0}
                height={0}
                alt="DPKAKP Logo"
              /> */}
            </div>
            <h1 className="font-bold  text-gray-200 text-4xl -mt-2">
              Dashboard Sertifikasi AKP
            </h1>
            <p className="font-jakarta max-w-[42rem] leading-[115%] text-gray-300  sm:text-base -mt-2">
              Selamat datang kembali, silahkan login untuk mengakses dashboard
              admin Elektronik Layanan Pelatihan Kelautan dan Perikanan Utama
              Terpadu!
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-md mx-auto z-50">
            <div className="flex flex-col gap-1">
              <p className="font-jakarta  leading-[100%] text-gray-300  sm:text-sm sm:leading-8 -mt-4">
                Username
              </p>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border rounded-xl text-white border-blue-950 bg-transparent w-full placeholder:text-gray-300"
                placeholder="Enter your email address"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-jakarta  leading-[100%] text-gray-300  sm:text-sm sm:leading-8 ">
                Password
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded-xl text-white border-blue-950 bg-transparent w-full placeholder:text-gray-300"
                placeholder="Enter your password"
              />
            </div>

            <button
              onClick={(e) => handleLogin(e)}
              className="text-white w-full bg-blue-950 rounded-xl bg-opacity-100 py-2"
            >
              Login
            </button>
          </div>
        </section>
      </main>
    </section>
  );
}

export default page;
