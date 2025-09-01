"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  HiGlobeAmericas,
  HiMiniUserGroup,
  HiOutlineCake,
  HiUserGroup,
} from "react-icons/hi2";


import Link from "next/link";
import { Slide } from "react-awesome-reveal";
import { GrFormEdit, GrFormTrash, GrLocation } from "react-icons/gr";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import { IoIosInformationCircle, IoMdCloseCircle } from "react-icons/io";
import { Edit3Icon, LucideDot, Trash } from "lucide-react";
import { User } from "@/types/user";
import { RiHeart3Line, RiVerifiedBadgeFill } from "react-icons/ri";
import {
  MdAlternateEmail,
  MdOutlineWoman,
  MdOutlineWorkOutline,
} from "react-icons/md";
import { PiHandsPrayingBold, PiTrainRegional } from "react-icons/pi";
import { TbFlag, TbGenderBigender, TbNumber, TbPhone, TbSchool } from "react-icons/tb";
import { BiDonateBlood } from "react-icons/bi";
import { createSlug, truncateText } from "@/utils";

import Cookies from "js-cookie";
import Toast from "./toast";
import { capitalize } from "@/utils/text";

export default function UserDocuments({ user }: { user: User | null }) {
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
      link: user?.Foto,
      available: user?.Foto.endsWith("/") ? false : true,
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
      link: user?.KK,
      available: user?.KK.endsWith("/") ? false : true,
    },

    {
      id: 3,
      name: "KTP/Identitas",
      description:
        "Pelatihan yang diselenggaran BPPSDM KP untuk menjaring masyarakat kelautan perikanan yang ingin mengasah skill nya dibidang kelautan dan perikanan",
      image: "/illustrations/ktp.png",
      icon: (
        <HiUserGroup className="absolute right-5 bottom-5 text-5xl text-gray-200 duration-1000" />
      ),
      link: user?.Ktp,
      available: user?.Ktp.endsWith("/") ? false : true,
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
      link: user?.Ijazah,
      available: user?.Ijazah.endsWith("/") ? false : true,
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
      link: user?.SuratKesehatan,
      available: user?.SuratKesehatan.endsWith("/") ? false : true,
    },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [tab, setTab] = useState<number>(1);
  const [menuSelected, setMenuSelected] = useState(false);
  const [indexMenuSelected, setIndexMenuSelected] = useState(0);

  const tabsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (tabsRef.current?.parentElement) {
      tabsRef.current.parentElement.style.height = `${tabsRef.current.clientHeight}px`;
    }
  }, [tabsRef]);

  const handleSelectedMenu = (index: number) => {
    setMenuSelected(!menuSelected);
    setIndexMenuSelected(index);
  };

  return (
    <>

      <section
        className="relative h-fit pb-20 rounded-2xl 
  bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
        id="explore"
      >
        <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6 flex flex-col space-y-2 text-gray-200">
          {/* Header */}
          <div className="pt-12 md:pt-20 pb-6 md:pb-10 text-center flex flex-col space-y-2 border-b border-white/20 mb-5">
            <h1 className="text-2xl md:text-3xl font-calsans text-blue-400 leading-none drop-shadow-sm">
              Biodata Pribadi <br /> Pengguna E-LAUT
            </h1>
            <p className="text-base text-gray-300 max-w-xl text-center mx-auto leading-relaxed">
              Lihat profile-mu dan edit data agar validitas data dirimu dapat mempercepat
              proses keikutsertaan pelatihan di E-LAUT, lengkapi juga dokumen serta file
              yang diperlukan!
            </p>
          </div>

          <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-4 md:items-start text-center">
            {/* Profile Card */}
            <div
              className="flex flex-col items-center 
        bg-white/10 backdrop-blur-md border border-white/20 
        shadow-lg rounded-2xl py-6 px-12 max-w-4xl"
            >
              <div className="relative">
                <Image
                  src={
                    user?.Foto! !=
                      "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/"
                      ? user?.Foto!
                      : "/dummies/profile.jpg"
                  }
                  alt={"profile picture"}
                  width={0}
                  height={0}
                  className="w-32 h-32 rounded-full object-cover border border-white/30"
                />
                <Link
                  href={"/dashboard/edit-profile"}
                  className="w-fit bg-white/20 backdrop-blur-md border border-white/30 
            rounded-full p-2 shadow-md absolute right-0 cursor-pointer bottom-4"
                >
                  <Edit3Icon className="text-blue-400" />
                </Link>
              </div>

              <div className="flex flex-col space-y-1 items-center justify-center mt-3">
                <h2 className="text-2xl font-calsans text-blue-400 leading-none">
                  {capitalize(user?.Nama!.toLocaleLowerCase()!)}
                </h2>
                {user!.KusukaUsers == "yes" && (
                  <p className="text-sm text-gray-200 bg-white/20 px-3 py-1 my-2 rounded-full w-full text-center leading-none">
                    Anggota/Anak Pelaku Utama
                  </p>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="flex flex-col space-y-5 w-full">
              {/* UserInfoItem remains the same but updated with glass styles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                <UserInfoItem icon={TbNumber} title="NIK" value={user!.Nik.toString()} />
                <UserInfoItem icon={TbFlag} title="Kewarganegaraan" value={user!.Kewarganegaraan} />
                <UserInfoItem icon={MdAlternateEmail} title="Email" value={user!.Email} />
                <UserInfoItem
                  icon={RiHeart3Line}
                  title="Status Menikah"
                  value={user!.StatusMenikah}
                />
                <UserInfoItem
                  icon={TbPhone}
                  title="No Telpon/Whatsapp"
                  value={user!.NoTelpon.toString()}
                />
                <UserInfoItem
                  icon={GrLocation}
                  title="Alamat"
                  value={user!.Alamat}
                />
                <UserInfoItem
                  icon={PiTrainRegional}
                  title="Domisili"
                  value={`${user!.Kota}, ${user!.Provinsi}`}
                />
                <UserInfoItem
                  icon={TbGenderBigender}
                  title="Jenis Kelamin"
                  value={user!.JenisKelamin}
                />
                <UserInfoItem
                  icon={HiOutlineCake}
                  title="TTL"
                  value={`${user!.TempatLahir}, ${user!.TanggalLahir}`}
                />
                <UserInfoItem
                  icon={MdOutlineWorkOutline}
                  title="Pekerjaan"
                  value={user!.Pekerjaan}
                />
                <UserInfoItem
                  icon={TbSchool}
                  title="Pendidikan Terakhir"
                  value={user!.PendidikanTerakhir}
                />
                <UserInfoItem
                  icon={PiHandsPrayingBold}
                  title="Agama"
                  value={user!.Agama}
                />
                <UserInfoItem
                  icon={BiDonateBlood}
                  title="Golongan Darah"
                  value={user!.GolonganDarah}
                />
                <UserInfoItem
                  icon={MdOutlineWoman}
                  title="Ibu Kandung"
                  value={user!.IbuKandung}
                />
                <UserInfoItem
                  icon={HiGlobeAmericas}
                  title="Negara Tujuan Bekerja"
                  value={user!.NegaraTujuanBekerja}
                />
              </div>

              {/* Tab Menus */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tabMenus.map((tabMenu, index) => (
                  <TabMenuItem
                    key={tabMenu.id}
                    tabMenu={tabMenu}
                    handleSelectedMenu={handleSelectedMenu}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

const UserInfoItem = ({
  icon: Icon,
  title,
  value,
}: {
  icon: any;
  title: string;
  value: string;
}) => (
  <div className="gap-2 md:gap-4 w-full">
    <Slide direction="up">
      <div className="flex flex-col gap-1 w-full items-center text-center">
        <div
          className="flex items-center justify-start gap-2 
        bg-white/10 backdrop-blur-md border border-white/20 shadow-md 
        rounded-xl w-full h-fit md:h-24 px-3 py-3 md:py-1 text-gray-200"
        >
          <Icon className="text-lg text-blue-400" />
          <div className="flex flex-col gap-0">
            <p className="text-xs text-blue-400 text-left font-semibold">
              {value.includes("Politeknik") ? "Satuan Pendidikan" : title}
            </p>
            <p className="text-sm cursor-pointer hover:underline text-gray-300 text-left font-normal leading-[105%]">
              {value}
            </p>
          </div>
        </div>
      </div>
    </Slide>
  </div>

);



const TabMenuItem = ({
  tabMenu,
  handleSelectedMenu,
  index,
}: {
  tabMenu: any;
  handleSelectedMenu: (index: number) => void;
  index: number;
}) => {
  const hasExtension = (url: string) => {
    return /\.[0-9a-z]+$/i.test(url);
  };
  const hasFile = hasExtension(tabMenu.link);

  return (
    <div className="gap-4 w-full">
      <div
        onClick={() => handleSelectedMenu(index)}
        className="flex items-center justify-start 
        bg-white/10 backdrop-blur-md border border-white/20 
        shadow-md rounded-xl w-full h-fit md:h-28 p-6 cursor-pointer 
        hover:scale-[1.02] duration-300 text-gray-200"
      >
        <Image
          className="w-12"
          width={0}
          height={0}
          src={tabMenu.image}
          alt="Document Icon"
        />

        <div className="ml-2 text-left flex space-y-1 flex-col">
          <p className="text-blue-400 text-base leading-none font-semibold">
            {tabMenu.name}
          </p>

          {hasFile ? <a
            href={tabMenu.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-300 underline truncate max-w-[200px]"
          >
            {truncateText(tabMenu.link, 50, "...")}
          </a> : (
            <p className="text-xs text-gray-200 leading-[115%]">
              Belum ada file yang diupload, ke menu pengaturan akun untuk
              mengunggah
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
