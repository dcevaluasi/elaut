"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  HiGlobeAmericas,
  HiMiniUserGroup,
  HiOutlineCake,
  HiUserGroup,
} from "react-icons/hi2";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import Link from "next/link";
import { Slide } from "react-awesome-reveal";
import { GrFormEdit, GrFormTrash, GrLocation } from "react-icons/gr";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import BPPPCertificates from "./bppp-certificates";
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
      name: "KTP",
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
      <section className="relative h-fit pb-20 bg-white rounded-xl" id="explore">
        <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6 flex flex-col space-y-2">
          <div className="pt-12 md:pt-20 pb-6 md:pb-10 text-center flex flex-col space-y-2 border-b border-b-grayUsual mb-5">
            <h1 className="text-2xl md:text-3xl font-calsans text-blue-500 leading-none">
              Biodata Pribadi <br /> Pengguna E-LAUT
            </h1>
            <p className="text-base text-gray-600 max-w-xl text-center mx-auto leading-none">
              Lihat profile-mu dan edit data agar validitas data dirimu dapat mempercepat proses keikutsertaan pelatihan di E-LAUT, lengkapi juga dokumen serta file yang diperlukan!
            </p>
          </div>

          <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-4 md:items-start text-center">
            <div className="flex flex-col items-center bg-white shadow-custom rounded-md py-6 px-12 max-w-4xl">
              <div className="relative">
                <Image
                  src={user?.Foto! != 'https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/' ? user?.Foto! : "/dummies/profile.jpg"}
                  alt={"profile picture"}
                  width={0}
                  height={0}
                  className="w-32 h-32 rounded-full object-cover"
                />
                <Link
                  href={"/dashboard/edit-profile"}
                  className="w-fit bg-white rounded-full p-2 shadow-custom absolute right-0 cursor-pointer bottom-4"
                >
                  <Edit3Icon className="text-blue-500" />
                </Link>
              </div>

              <div className="flex flex-col space-y-1 items-center justify-center">
                <h2 className="text-2xl font-calsans text-blue-500 leading-none">
                  {capitalize(user?.Nama!.toLocaleLowerCase()!)}
                </h2>
                {
                  user!.KusukaUsers == 'yes' && <p className="text-sm text-gray-600 bg-gray-200 px-3 py-1 my-2 rounded-full w-full text-center leading-none">
                    Anggota/Anak Pelaku Utama
                  </p>
                }

              </div>
            </div>

            <div className="flex flex-col space-y-5">
              <div className="flex flex-col space-y-5">
                <div className="text-left flex flex-col space-y-2">
                  <h3 className="text-lg md:text-xl font-calsans text-blue-500 leading-none">
                    Data Pribadi
                  </h3>
                  <p className="text-base text-gray-600 max-w-xl text-left  leading-none">
                    Kumpulan data dasar yang wajib untuk diisi, karena kelengkapan data ini sebagai bahan validasi keikutsertaanmu dalam pelatihan
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-md md:gap-5 w-full ">
                  <UserInfoItem
                    icon={TbNumber}
                    title="NIK"
                    value={user!.Nik.toString()}
                  />
                  <UserInfoItem
                    icon={TbFlag}
                    title="Kewarganegaraan"
                    value={user!.Kewarganegaraan}
                  />
                  <UserInfoItem
                    icon={MdAlternateEmail}
                    title="Email"
                    value={user!.Email}
                  />
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
                  {/* Add other UserInfoItem components here */}
                </div>
              </div>
              <div className="flex flex-col space-y-5">
                <div className="text-left flex flex-col space-y-2">
                  <h3 className="text-lg md:text-xl font-calsans text-blue-500 leading-none">
                    Dokumen dan Persyaratan
                  </h3>
                  <p className="text-base text-gray-600 max-w-xl text-left  leading-none">
                    Kumpulan dokumen yang menjadi kelengkapan dan validitas dari data pribadimu, ayo lengkapi sekarang!
                  </p>
                </div>
                <div className="grid grid-cols-1  gap-2 rounded-md md:gap-5 w-full ">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
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
          </div>
        </div>
      </section >
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
      <div className="flex flex-col gap-1 w-full items-center duration-1000 text-center">
        <div className="flex items-center justify-start gap-2 bg-white shadow-custom rounded-md w-full h-fit md:h-24 px-3 py-3 md:py-1">
          <Icon className="text-lg text-blue-500" />
          <div className="flex flex-col gap-0">

            <p className="text-xs text-blue-500 text-left font-semibold">
              {
                value.includes('Politeknik') ? 'Satuan Pendidikan' : title
              }
            </p>
            <p className="text-sm cursor-pointer hover:underline duration-800 text-grayUsual text-left font-normal leading-[105%]">
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
}) => (
  <div className="gap-4 w-full">
    <div
      onClick={() => handleSelectedMenu(index)}
      className="flex items-center justify-start bg-white shadow-custom rounded-md w-full h-fit md:h-28 p-6 cursor-pointer"
    >
      <Image
        className="w-12"
        width={0}
        height={0}
        src={tabMenu.image}
        alt="Document Icon"
      />
      <div className="ml-2 text-left flex space-y-1 flex-col">
        <p className="text-blue-500 text-base leading-none font-semibold">{tabMenu.name}</p>
        {tabMenu.available ? (
          <p className="text-xs text-grayUsual">
            {truncateText(tabMenu.link, 50, "...")}
          </p>
        ) : (
          <p className="text-xs text-grayUsual leading-[115%]">
            Belum ada file yang diupload, ke menu pengaturan akun untuk mengunggah
          </p>
        )}
      </div>
    </div>
  </div>
);
