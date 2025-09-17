"use client";

import React, { useState, useRef, useEffect } from "react";
import { HiUserGroup } from "react-icons/hi2";
import { TbFileCertificate } from "react-icons/tb";
import { FaBuildingColumns } from "react-icons/fa6";
import { FaUserGraduate } from "react-icons/fa";

import FeaturesBg from "@/public/images/features-bg.png";
import FeaturesElement from "@/public/images/features-element.png";
import { GiLuckyFisherman, GiWaterSplash } from "react-icons/gi";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSearch, FiSlack } from "react-icons/fi";
import { FaPlaceOfWorship } from "react-icons/fa6";
import { GrLocation } from "react-icons/gr";

import { FaUserTie } from "react-icons/fa6";

import axios, { AxiosResponse } from "axios";
import { PelatihanMasyarakat } from "@/types/product";
import ListBPPP from "./list-bppp";
import { useSearchParams } from "next/navigation";
import { getPenyeleggara } from "@/utils/pelatihan";
import { IoMdPricetag } from "react-icons/io";
import FeaturesPelatihanBbalai from "./features-pelatihan-balai";
import FeaturesPelatihanBalai from "./features-pelatihan-balai";
import { Slide } from "react-awesome-reveal";
import Image from "next/image";

export default function BPPPTrainings({
  data,
}: {
  data: PelatihanMasyarakat[];
}) {
  return (
    <section className="relative h-fit pb-10" id="explore">
      {/* Section background (needs .relative class on parent and next sibling elements) */}
      <div
        className="absolute inset-0 bg-gray-100 pointer-events-none mb-16 pb-10 h-full"
        aria-hidden="true"
      ></div>
      <div className="absolute left-0 right-0 m-auto w-px p-px h-28 bg-gray-200 transform -translate-y-1/2"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="pt-12 md:pt-20">
          {/* Section header */}
          {/* 
          <div className="max-w-2xl mx-auto text-center pb-5 md:pb-8">
            <h1 className="text-3xl font-calsans leading-[110%]">
              Pelatihan Masyarakat Umum KP
            </h1>
            <p className="text-base text-gray-600">
              Optimalkan potensi sumber daya laut. Bergabunglah dalam pelatihan
              masyarakat kelautan dan perikanan untuk masa depan yang
              berkelanjutan dan produktif.
            </p>
          </div> */}
          {/* <Tab /> */}

          <FeaturesPelatihanBalai pelatihan={data} />
        </div>
      </div>
    </section>
  );
}

const Tab = () => {
  return (
    <section className="grid grid-cols-4 gap-3 w-full items-center max-w-5xl mb-5 px-6 md:px-3 mx-auto">
      <Select>
        <SelectTrigger className="w-full rounded-3xl py-5 md:py-2">
          <p className="mr-3 flex items-center gap-1 text-sm">
            <FiSlack />
            Pilih Bidang Pelatihan
          </p>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Bidang Pelatihan</SelectLabel>
            <SelectItem value="Budidaya">Budidaya</SelectItem>
            <SelectItem value="Penangkapan">Penangkapan</SelectItem>
            <SelectItem value="Kepelautan">Kepelautan</SelectItem>
            <SelectItem value="Pengolahan dan Pemasaran">
              Pengolahan dan Pemasaran
            </SelectItem>
            <SelectItem value="Mesin Perikanan">Mesin Perikanan</SelectItem>
            <SelectItem value="Konservasi">Konservasi</SelectItem>
            <SelectItem value="SD Perikanan">SD Perikanan</SelectItem>
            <SelectItem value="Wisata Bahari">Wisata Bahari</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-full rounded-3xl py-5 md:py-2">
          <p className="mr-3 flex items-center gap-1 text-sm">
            <IoMdPricetag />
            Pilih Tarif Pelatihan
          </p>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tarif Pelatihan</SelectLabel>
            <SelectItem value="apple">Gratis</SelectItem>
            <SelectItem value="banana">Berbayar</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-full rounded-3xl py-5 md:py-2">
          <p className="mr-3 flex items-center gap-1 text-sm">
            <GrLocation />
            Pilih Pelaksanaan Pelatihan
          </p>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Pelaksanaan Pelatihan</SelectLabel>
            <SelectItem value="apple">Blended (Onsite + Online)</SelectItem>
            <SelectItem value="banana">On Site</SelectItem>
            <SelectItem value="blueberry">Online</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="relative w-full flex items-center border-neutral-200 border px-2 rounded-3xl">
        <Button
          type="button"
          variant={"outline"}
          className="flex items-center justify-center rounded-full bg-black w-fit h-fit absolute right-1"
        >
          {" "}
          <FiSearch className="text-gray-200 text-base" />
        </Button>
        <Input
          className="text-sm border-none -ml-1 focus:border-none border- active:outline-none active:border-none focus:outline-none focus-visible:ring-0"
          placeholder="Cari Pelatihan"
        />
      </div>
    </section>
  );
};
