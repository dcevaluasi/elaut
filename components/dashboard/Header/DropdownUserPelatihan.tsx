"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { User } from "@/types/user";
import axios, { AxiosResponse } from "axios";
import { HiChevronDown } from "react-icons/hi2";
import { ManningAgent } from "@/types/product";
import { elautBaseUrl } from "@/constants/urls";
import { FiGrid, FiLogOut, FiSettings } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const DropdownUserPelatihan = ({ top }: { top: boolean }) => {
  const token = Cookies.get("XSRF081");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const isManningAgent = Cookies.get("isManningAgent");

  const [userDetail, setUserDetail] = React.useState<User | null>(null);
  const [manningAgentDetail, setManningAgentDetail] =
    React.useState<ManningAgent | null>(null);

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
      Cookies.set('status', response.data!.Pekerjaan)
      setUserDetail(response.data);
    } catch (error) {
      console.error("Error fetching user detail:", error);
    }
  };

  const handleFetchingManningAgentDetail = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/manningAgent/getManningAgentById`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Cookies.set("IdManningAgent", response.data.data.IdManingAgent);
      setManningAgentDetail(response.data.data);
    } catch (error) {
      console.error("Error fetching manning agent detail:", error);
    }
  };

  React.useEffect(() => {
    if (isManningAgent == "true") {
      handleFetchingManningAgentDetail();
    } else {
      handleFetchingUserDetail();
    }
  }, []);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  const handleLogOut = async () => {
    Cookies.remove("XSRF081");
    Cookies.remove("XSRF083");
    Cookies.remove("status");
    Cookies.remove("isManningAgent");
    Toast.fire({
      icon: "success",
      title: "Berhasil Logout",
      text: `Sampai jumpa kembali!`,
    });
    router.push("/");
  };

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [dropdownOpen]);

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [dropdownOpen]);

  const profileImageUrl = userDetail?.Foto && userDetail.Foto !== "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/"
    ? userDetail.Foto
    : "/dummies/profile.jpg";

  return (
    <div className="relative">
      <button
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="group flex items-center gap-3 p-1 rounded-full transition-all duration-300 hover:bg-white/5"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity" />
          <Image
            src={profileImageUrl}
            alt="profile"
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-white/10 relative z-10"
          />
        </div>
        <HiChevronDown
          className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180 text-blue-400" : "text-gray-400 group-hover:text-white"}`}
        />
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            ref={dropdown}
            className="absolute right-0 mt-4 w-72 rounded-[2rem] bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 overflow-hidden"
          >
            <div className="p-6 text-center border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
              <div className="w-16 h-16 mx-auto mb-3 relative">
                <Image
                  src={profileImageUrl}
                  alt="profile large"
                  fill
                  className="rounded-full object-cover ring-4 ring-blue-500/20 shadow-xl"
                />
              </div>
              <p className="font-bold text-white tracking-tight leading-tight">
                {isManningAgent === "true"
                  ? manningAgentDetail?.NamaManingAgent
                  : userDetail?.Nama}
              </p>
              {isManningAgent === "true" && (
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-medium">
                  {manningAgentDetail?.Alamat}
                </p>
              )}
            </div>

            <div className="p-2 space-y-1">
              <DropdownLink
                href="/dashboard"
                label="Dashboard Utama"
                icon={<FiGrid />}
              />
              <DropdownLink
                href="/dashboard/edit-profile"
                label="Pengaturan Profil"
                icon={<FiSettings />}
              />

              <button
                onClick={handleLogOut}
                className="w-full flex items-center gap-4 px-4 py-3 text-rose-400 hover:bg-rose-500/10 transition-all duration-300 rounded-2xl group/logout"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 group-hover/logout:bg-rose-500 group-hover/logout:text-white transition-all duration-300">
                  <FiLogOut className="text-lg" />
                </div>
                <span className="text-sm font-semibold tracking-wide">Logout Session</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function DropdownLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 hover:bg-white/10 group/item"
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all duration-300">
        <span className="text-lg">{icon}</span>
      </div>
      <span className="text-sm font-semibold text-white group-hover/item:text-blue-400 transition-colors tracking-wide">
        {label}
      </span>
    </Link>
  );
}

export default DropdownUserPelatihan;
