"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FormEvent, MouseEventHandler } from "react";
import Toast from "../toast";
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
import { Slide } from "react-awesome-reveal";
import Footer from "../ui/footer";
import { HiMiniUserGroup } from "react-icons/hi2";
import Newsletter from "../newsletter";

function FormCekSertifikat() {
  const router = useRouter();

  const recaptchaRef = React.createRef();
  const [role, setRole] = React.useState<string>("");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [isInputError, setIsInputError] = React.useState(false);
  const [isKUSUKA, setIsKUSUKA] = React.useState("");

  const [imageIndex, setImageIndex] = React.useState(0);
  const images = ["/images/hero-img7.jpg"];

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

  return (
    <section className="flex flex-col">
      <div className="relative w-full h-full pb-10">
        <Image
          src={images[imageIndex]}
          className="absolute w-full h-full hidden md:block object-cover duration-1000 -z-40"
          alt=""
          layout="fill"
          priority
        />

        <Image
          src={imagesMob[imageMobIndex]}
          className="absolute w-full h-full block md:hidden object-cover duration-1000 -z-40"
          alt=""
          layout="fill"
          priority
        />

        <div className="absolute w-full h-full bg-black bg-opacity-70 -z-30"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-32  md:pt-40 ">
            <div className="w-full mx-auto text-center pb-0 md:pb-0">
              <h1 className="font-semibold text-4xl leading-[110%]  text-gray-200">
                <span className="font-calsans">
                  Cek Validitas
                </span>{" "}
                <br />
                <span className="z-0 bg-clip-text  w-[600px] leading-[110%]  text-transparent bg-gradient-to-r font-calsans from-blue-500  to-teal-400">
                  Sertifikat Pelatihan
                </span>{" "}
              </h1>
            </div>

            <Newsletter />

            <div
              className={`${role == "Mandiri" || role == "" ? "max-w-sm" : "max-w-4xl"
                }  mx-5 md:mx-auto -mt-12`}
            >
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
                Belum punya sertifikat pelatihan?{" "}
                <Link
                  href={"/layanan/program/akp"}
                  className="text-blue-500 hover:underline transition duration-150 ease-in-out"
                >
                  Cari Pelatihan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}

export default FormCekSertifikat;
