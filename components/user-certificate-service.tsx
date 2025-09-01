"use client";

import React, { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import FeaturesBg from "@/public/images/features-bg.png";
import FeaturesElement from "@/public/images/features-element.png";
import { GiLuckyFisherman, GiWaterSplash } from "react-icons/gi";
import { HiGlobeAmericas, HiOutlineCake, HiUserGroup } from "react-icons/hi2";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import "./../app/css/additional-styles/features-slider.css";

// import required modules
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import Link from "next/link";
import { Slide } from "react-awesome-reveal";
import { FaPlaceOfWorship } from "react-icons/fa6";
import { GrFormEdit, GrFormTrash, GrLocation } from "react-icons/gr";
import { Button } from "./ui/button";
import { FiSearch, FiSlack } from "react-icons/fi";
import { Input } from "./ui/input";
import BPPPTrainings from "./bppp-trainings";
import { usePathname } from "next/navigation";
import { extractPathAfterBppp, getPenyeleggara } from "@/utils/pelatihan";
import { PelatihanMasyarakat } from "@/types/product";
import axios, { AxiosResponse } from "axios";
import { IoIosInformationCircle, IoMdCloseCircle } from "react-icons/io";
import { Edit3Icon, LucideDot, Trash } from "lucide-react";
import { User } from "@/types/user";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import {
  MdAlternateEmail,
  MdOutlineWoman,
  MdOutlineWorkOutline,
} from "react-icons/md";
import { PiHandsPrayingBold, PiTrainRegional } from "react-icons/pi";
import { TbGenderBigender, TbSchool } from "react-icons/tb";
import { BiDonateBlood } from "react-icons/bi";
import Cookies from "js-cookie";
import TableDataPelatihan from "./dashboard/Pelatihan/TableDataPelatihan";
import TableDataPelatihanUser from "./dashboard/Pelatihan/TableDataPelatihanUser";

export default function UserCertificateService({
  user,
}: {
  user: User | null;
}) {
  const tabMenus = [
    {
      id: 1,
      name: "Pas Foto",
      description:
        "Pelatihan yang diselenggaran BPPSDM KP untuk menjaring masyarakat kelautan perikanan yang ingin mengasah skill nya dibidang kelautan dan perikanan",
      image: "/illustrations/pas-foto.png",
      icon: (
        <HiUserGroup className="absolute right-5 bottom-5 text-5xl text-gray-200 duration-1000" />
      ),
      available: true,
    },
    {
      id: 2,
      name: "Kartu Keluarga",
      description:
        "Pelatihan yang diselenggaran BPPSDM KP untuk menjaring masyarakat kelautan perikanan yang ingin mengasah skill nya dibidang kelautan dan perikanan",
      image: "/illustrations/kartu-keluarga.png",
      icon: (
        <HiUserGroup className="absolute right-5 bottom-5 text-5xl text-gray-200 duration-1000" />
      ),
      available: true,
    },

    {
      id: 3,
      name: "KTP",
      description:
        "Pelatihan yang diselenggaran BPPSDM KP untuk menjaring masyarakat kelautan perikanan yang ingin mengasah skill nya dibidang kelautan dan perikanan",
      image: "/illustrations/ktp.png",
      icon: (
        <HiUserGroup className="absolute right-5 bottom-5 text-5xl text-gray-200 duration-1000" />
      ),
      available: false,
    },
    {
      id: 4,
      name: "Ijazah",
      description:
        "Pelatihan yang diselenggaran BPPSDM KP untuk menjaring masyarakat kelautan perikanan yang ingin mengasah skill nya dibidang kelautan dan perikanan",
      image: "/illustrations/ijazah.png",
      icon: (
        <HiUserGroup className="absolute right-5 bottom-5 text-5xl text-gray-200 duration-1000" />
      ),
      available: true,
    },
    {
      id: 4,
      name: "Surat Keterangan Sehat",
      description:
        "Pelatihan yang diselenggaran BPPSDM KP untuk menjaring masyarakat kelautan perikanan yang ingin mengasah skill nya dibidang kelautan dan perikanan",
      image: "/illustrations/surat-keterangan-sehat.png",
      icon: (
        <HiUserGroup className="absolute right-5 bottom-5 text-5xl text-gray-200 duration-1000" />
      ),
      available: false,
    },
  ];

  const pathname = usePathname();
  const location = extractPathAfterBppp(pathname);
  const penyelenggara = getPenyeleggara(location!);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const [data, setData] = React.useState<PelatihanMasyarakat[]>([]);

  const handleFetchingPublicTrainingDataByPenyelenggara = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getPelatihan?penyelenggara_pelatihan=${penyelenggara}`
      );
      console.log({ response });
      setData(response.data.data);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  const token = Cookies.get("XSRF081");

  const [userDetail, setUserDetail] = React.useState<User | null>(null);

  const handleFetchingUserDetail = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/users/getUsersById`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log({ response });
      setUserDetail(response.data);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      handleFetchingUserDetail();
      handleFetchingPublicTrainingDataByPenyelenggara();
    }, 1000);
  }, []);

  const [tab, setTab] = useState<number>(1);

  const tabs = useRef<HTMLDivElement>(null);

  const heightFix = () => {
    if (tabs.current && tabs.current.parentElement)
      tabs.current.parentElement.style.height = `${tabs.current.clientHeight}px`;
  };

  useEffect(() => {
    heightFix();
  }, []);

  const [menuSelected, setMenuSelected] = React.useState(false);
  const [indexMenuSelected, setIndexMenuSelected] = React.useState(0);
  const handleSelectedMenu = (index: number) => {
    setMenuSelected(!menuSelected);
    setIndexMenuSelected(index);
  };

  console.log(user?.Pelatihan);

  return (
    <>
      <section className="relative h-fit pb-20 bg-white" id="explore">
        <div
          className="absolute inset-0 pointer-events-none mb-16 pb-10 h-full"
          aria-hidden="true"
        ></div>
        <div className="absolute left-0 right-0 m-auto w-px p-px h-28 bg-gray-200 transform -translate-y-1/2"></div>



      </section>
    </>
  );
}
