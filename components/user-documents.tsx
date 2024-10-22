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
import { RiVerifiedBadgeFill } from "react-icons/ri";
import {
  MdAlternateEmail,
  MdOutlineWoman,
  MdOutlineWorkOutline,
} from "react-icons/md";
import { PiHandsPrayingBold, PiTrainRegional } from "react-icons/pi";
import { TbGenderBigender, TbSchool } from "react-icons/tb";
import { BiDonateBlood } from "react-icons/bi";
import { createSlug, truncateText } from "@/utils";

import Cookies from "js-cookie";
import Toast from "./toast";

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
      <section className="relative h-fit pb-20 bg-white" id="explore">
        <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6">
          <div className="pt-12 md:pt-20 text-center ">
            <h1 className="text-3xl font-calsans leading-[110%] text-black">
              Biodata <br /> Peserta Pelatihan & Sertifikasi
            </h1>
            <p className="text-base text-gray-600 max-w-xl text-center mx-auto">
              Jelajahi layanan serta informasi yang ada pada Balai Pelatihan
              Kelautan dan Perikanan dan jadilah SDM kompeten bidang kelautan
              dan perikanan!
            </p>
          </div>

          <div className="mt-32 flex flex-col items-center text-center">
            <div className="flex flex-col items-center bg-white shadow-custom rounded-md py-6 px-12 max-w-4xl">
              <div className="relative -mt-28">
                <Image
                  src={"/dummies/profile.jpg"}
                  alt={"profile picture"}
                  width={0}
                  height={0}
                  className="w-32 h-32 rounded-full object-cover"
                />
                <Link
                  href={"/dashboard/edit-profile"}
                  className="w-fit bg-white rounded-full p-2 shadow-custom absolute right-0 cursor-pointer bottom-4"
                >
                  <Edit3Icon />
                </Link>
              </div>

              <div className="mt-4">
                <h2 className="text-2xl font-calsans text-black">
                  {user?.Nama}
                </h2>
                <p className="text-base text-gray-600">
                  {user?.Nik} • {user?.Kewarganegaraan} • {user?.NoTelpon} •{" "}
                  {user?.StatusMenikah}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 w-full mt-10">
              <UserInfoItem
                icon={MdAlternateEmail}
                title="Email"
                value={user!.Email}
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

          <div className="mt-12 text-center">
            <h2 className="text-3xl font-calsans text-black">
              Dokumen dan File Kelengkapan
            </h2>
            <p className="text-base text-gray-600">
              Jelajahi layanan serta informasi yang ada pada Balai Pelatihan
              Kelautan dan Perikanan dan jadilah SDM kompeten bidang kelautan
              dan perikanan!
            </p>
          </div>

          <div className="mt-12 flex gap-5">
            {!menuSelected ? (
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
            ) : (
              <div className="w-full">
                <div className="gap-4 w-full">
                  <div className="flex flex-col md:flex-row items-center justify-center md:justify-start bg-white shadow-custom rounded-md w-full h-fit md:h-28 p-6">
                    <Image
                      className="w-14 md:w-14"
                      width={0}
                      height={0}
                      src={tabMenus[indexMenuSelected].image}
                      alt="Document Icon"
                    />
                    <div className="md:ml-4 mt-4 md:mt-0 text-center md:text-start">
                      <p className="text-lg font-semibold">
                        {tabMenus[indexMenuSelected].name}
                      </p>
                      {tabMenus[indexMenuSelected]!.available ? (
                        <Link
                          href={tabMenus[indexMenuSelected].link!}
                          target="_blank"
                          className="text-sm text-gray-600"
                        >
                          {tabMenus[indexMenuSelected].link}
                        </Link>
                      ) : (
                        <Link
                          href={"#"}
                          target="_blank"
                          className="text-sm text-gray-600"
                        >
                          -
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 w-full mt-6 items-center justify-between">
                    <button
                      onClick={() => setMenuSelected(false)}
                      className="text-black rounded-md w-full border border-black h-10 md:w-[200px] flex items-center justify-center"
                    >
                      Kembali
                    </button>
                    <button
                      className="text-black rounded-md w-full border border-black h-10 md:w-[200px] flex items-center justify-center"
                      onClick={() =>
                        router.push(`${tabMenus[indexMenuSelected].name}`)
                      }
                    >
                      {tabMenus[indexMenuSelected].available
                        ? "Update File"
                        : "Unggah File"}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
  <div className="gap-4 w-full">
    <Slide direction="up">
      <div className="flex flex-col gap-1 w-full items-center duration-1000 text-center">
        <div className="flex items-center justify-start gap-2 bg-white shadow-custom rounded-md w-full h-fit md:h-24 px-3 py-1">
          <Icon className="text-lg" />
          <div className="flex flex-col gap-0">
            <p className="text-xs text-black text-left font-semibold">
              {title}
            </p>
            <p className="text-sm cursor-pointer hover:underline duration-800 text-gray-600 text-left font-normal leading-[105%]">
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
        className="w-14 md:w-14"
        width={0}
        height={0}
        src={tabMenu.image}
        alt="Document Icon"
      />
      <div className="ml-4">
        <p className="text-lg font-semibold">{tabMenu.name}</p>
        {tabMenu.available ? (
          <p className="text-xs text-gray-600">
            {truncateText(tabMenu.link, 50, "...")}
          </p>
        ) : (
          <p className="text-xs text-gray-600 leading-[115%]">
            Belum ada file yang diupload, klik untuk mengupload dokumen
          </p>
        )}
      </div>
    </div>
  </div>
);
