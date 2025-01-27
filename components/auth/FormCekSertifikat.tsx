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

  return (<>
    <section className="flex flex-col bg-[#EEEAEB] h-full">
      <div className="relative w-full h-full pb-10">


        <div className="max-w-6xl mx-auto">
          <div className="pt-32  md:pt-40 ">

            <Newsletter />

          </div>
        </div>
      </div>
    </section>
  </>

  );
}

export default FormCekSertifikat;
