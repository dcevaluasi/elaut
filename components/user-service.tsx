"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { HiUserGroup } from "react-icons/hi2";
import "swiper/css";
import "swiper/css/pagination";
import "./../app/css/additional-styles/features-slider.css";
import { Slide } from "react-awesome-reveal";
import { usePathname } from "next/navigation";
import { extractPathAfterBppp, getPenyeleggara } from "@/utils/pelatihan";
import { User } from "@/types/user";
import UserTrainingService from "./user-training-service";
import UserCertificateService from "./user-certificate-service";
import UserDocuments from "./user-documents";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaFilePen } from "react-icons/fa6";

export default function UserService({ user }: { user: User | null }) {
  const tabMenus = [
    {
      id: 1,
      name: "Pelatihan Yang Diikuti",
      description: "Lihat daftar pelatihan yang kamu ikuti.",
      image: "/illustrations/bppp-training.png",
      icon: <FaFilePen className="text-5xl text-gray-200 duration-1000" />,
    },
    {
      id: 2,
      name: "Sertifikat Pelatihan",
      description: "Koleksi sertifikat pelatihan yang sudah kamu peroleh.",
      image: "/illustrations/bppp-certificate.png",
      icon: <RiVerifiedBadgeFill className="text-5xl text-gray-200 duration-1000" />,
    },
    {
      id: 3,
      name: "Profile Pengguna",
      description: "Informasi pribadi & dokumen pentingmu.",
      image: "/illustrations/user-profile.png",
      icon: <HiUserGroup className="text-5xl text-gray-200 duration-1000" />,
    },
  ];

  const pathname = usePathname();
  const location = extractPathAfterBppp(pathname);
  const penyelenggara = getPenyeleggara(location!);

  const [loading, setLoading] = React.useState<boolean>(true);
  const [indexMenuSelected, setIndexMenuSelected] = useState(0);

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectedMenu = (index: number) => {
    setIndexMenuSelected(index);
  };

  return (
    <div className="w-full text-left flex flex-col space-y-5">
      {/* Tabs */}
      <div className="relative w-full" id="explore">
        <div className={`grid grid-cols-${tabMenus.length} md:flex md:flex-row md:flex-nowrap md:items-center justify-center gap-5 w-full`}>
          {tabMenus.map((tabMenu, index) => {
            const isActive = indexMenuSelected === index;
            return (
              <div key={index} className="gap-2 w-full">
                <Slide direction="up" duration={500 * index}>
                  <div
                    onClick={() => handleSelectedMenu(index)}
                    className={`flex flex-col gap-2 cursor-pointer items-center text-center w-full transition-all duration-500 ${isActive ? "scale-105" : "hover:scale-105"
                      }`}
                  >
                    <div
                      className={`flex items-center justify-center !py-8 px-6 rounded-2xl flex-col space-y-2 w-full border backdrop-blur-lg transition-all duration-500
                        ${isActive
                          ? "bg-blue-500/10 border-blue-500/90 "
                          : "bg-white/10 border-white/20 shadow-lg hover:shadow-xl"
                        }`}
                    >
                      {tabMenu.icon}
                      <div className="space-y-1 hidden md:flex flex-col leading-none">
                        <p
                          className={`font-semibold ${isActive ? "text-blue-400" : "text-blue-500"
                            }`}
                        >
                          {tabMenu.name}
                        </p>
                        <p
                          className={`text-xs ${isActive ? "text-gray-100" : "text-gray-300"
                            }`}
                        >
                          {tabMenu.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Slide>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="w-full transition-all duration-500">
        {indexMenuSelected === 0 && <UserTrainingService user={user} />}
        {indexMenuSelected === 1 && <UserCertificateService user={user} />}
        {indexMenuSelected === 2 && <UserDocuments user={user} />}
      </div>
    </div>
  );
}
