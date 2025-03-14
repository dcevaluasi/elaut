"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { HiUserGroup } from "react-icons/hi2";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import "./../app/css/additional-styles/features-slider.css";

// import required modules
import "swiper/css/navigation";
import { Slide } from "react-awesome-reveal";
import { usePathname } from "next/navigation";
import { extractPathAfterBppp, getPenyeleggara } from "@/utils/pelatihan";
import { User } from "@/types/user";
import UserTrainingService from "./user-training-service";
import UserCertificateService from "./user-certificate-service";
import UserDocuments from "./user-documents";

export default function UserService({ user }: { user: User | null }) {
  const tabMenus = [
    {
      id: 1,
      name: "Pelatihan Yang Diikuti",
      description:
        "Pelatihan yang diselenggaran BPPSDM KP untuk menjaring masyarakat kelautan perikanan yang ingin mengasah skill nya dibidang kelautan dan perikanan",
      image: "/illustrations/bppp-training.png",
      icon: (
        <HiUserGroup className="absolute right-5 bottom-5 text-5xl text-gray-200 duration-1000" />
      ),
    },
    {
      id: 1,
      name: "Sertifikat Pelatihan",
      description:
        "Pelatihan yang diselenggaran BPPSDM KP untuk menjaring masyarakat kelautan perikanan yang ingin mengasah skill nya dibidang kelautan dan perikanan",
      image: "/illustrations/bppp-certificate.png",
      icon: (
        <HiUserGroup className="absolute right-5 bottom-5 text-5xl text-gray-200 duration-1000" />
      ),
    },
    // {
    //   id: 2,
    //   name: "Uji Kompetensi",
    //   description:
    //     "Pelatihan yang diselenggaran BPPSDM KP untuk menjaring masyarakat kelautan perikanan yang ingin mengasah skill nya dibidang kelautan dan perikanan",
    //   image: "/illustrations/bppp-certificate.png",
    //   icon: (
    //     <HiUserGroup className="absolute right-5 bottom-5 text-5xl text-gray-200 duration-1000" />
    //   ),
    // },
    {
      id: 4,
      name: "Profile Pengguna",
      description:
        "Pelatihan yang diselenggaran BPPSDM KP untuk menjaring masyarakat kelautan perikanan yang ingin mengasah skill nya dibidang kelautan dan perikanan",
      image: "/illustrations/user-profile.png",
      icon: (
        <HiUserGroup className="absolute right-5 bottom-5 text-5xl text-gray-200 duration-1000" />
      ),
    },
  ];

  const pathname = usePathname();
  const location = extractPathAfterBppp(pathname);
  const penyelenggara = getPenyeleggara(location!);

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
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

  return (
    <div className="w-full text-left flex flex-col space-y-5">
      <div className="relative w-full" id="explore">
        <div className={`grid grid-cols-${tabMenus.length} md:flex md:flex-row  md:flex-nowrap md:items-center justify-center gap-5 w-full`}>
          {tabMenus.map((tabMenu, index) => (
            <div key={index} className="gap-2 w-full">
              <Slide direction="up" duration={500 * index}>
                <div
                  key={index}
                  onClick={(e) => handleSelectedMenu(index)}
                  className="flex flex-col gap-2 cursor-pointer items-center duration-1000 hover:scale-105 text-center w-full"
                >
                  <div className="flex items-center justify-center !py-8 bg-white shadow-custom rounded-xl flex-col space-y-2  w-full px-6">
                    <Image
                      className="w-16 md:w-16"
                      width={0}
                      height={0}
                      src={tabMenu.image}
                      alt="Kementrian Kelautan dan Perikanan RI Logo"
                    />
                    <div className="space-y-1 hidden md:flex flex-col leading-none">
                      <p className="text-blue-500 font-semibold">
                        {tabMenu.name}
                      </p>

                      <p className="text-xs text-gray-400 ">
                        {tabMenu.description}
                      </p>
                    </div>
                  </div>

                </div>
              </Slide>
            </div>
          ))}
        </div>
      </div>

      {indexMenuSelected == 0 && <UserTrainingService user={user} />}
      {/* {indexMenuSelected == 1 && <UserCertificateService user={user} />} */}
      {indexMenuSelected == 2 && <UserDocuments user={user} />}
    </div>
  );
}
