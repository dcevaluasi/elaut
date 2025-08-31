import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Toast from "@/components/toast";
import { User } from "@/types/user";
import axios, { AxiosResponse } from "axios";
import { HiChevronDown, HiMiniChevronDown } from "react-icons/hi2";
import { ManningAgent } from "@/types/product";
import { elautBaseUrl } from "@/constants/urls";
import { FiGrid, FiLogOut, FiSettings, FiUser } from "react-icons/fi";

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
      console.log({ response });
      Cookies.set('status', response.data!.Pekerjaan)
      setUserDetail(response.data);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
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
      console.log({ response });
      Cookies.set("IdManningAgent", response.data.data.IdManingAgent);
      setManningAgentDetail(response.data.data);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      if (isManningAgent == "true") {
        handleFetchingManningAgentDetail();
      } else {
        handleFetchingUserDetail();
      }
    }, 1000);
  }, []);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
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
      title: 'Yeayyy!',
      text: `Berhasil logout dari dashboard!`,
    });
    router.push("/");
  };

  // close on click outside
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
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });


  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3"
      >
        <Image
          src={
            userDetail?.Foto &&
              userDetail.Foto !==
              "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/"
              ? userDetail.Foto
              : "/dummies/profile.jpg"
          }
          alt="profile picture"
          width={56}
          height={56}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-white/20"
        />
        <HiChevronDown
          className={`transition ${dropdownOpen ? "rotate-180 text-white" : "text-gray-300"
            }`}
        />
      </button>

      {/* Dropdown */}
      <div
        ref={dropdown}
        onMouseLeave={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4 min-w-[250px] rounded-2xl 
          bg-white/10 backdrop-blur-xl shadow-lg border border-white/20 
          transition-all duration-300 ${dropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
      >
        <ul className="flex flex-col divide-y divide-white/10">
          {/* Profile Header */}
          <li className="p-5 text-center">
            <p className="font-semibold text-white">
              {isManningAgent === "true"
                ? manningAgentDetail?.NamaManingAgent
                : userDetail?.Nama}
            </p>
            {isManningAgent === "true" && (
              <span className="text-sm text-gray-300">
                {manningAgentDetail?.Alamat}
              </span>
            )}
          </li>

          {/* Links */}
          <li>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-5 py-3 text-white/80 hover:text-white hover:bg-white/10 transition rounded-xl"
            >
              <FiGrid className="text-lg" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/edit-profile"
              className="flex items-center gap-3 px-5 py-3 text-white/80 hover:text-white hover:bg-white/10 transition rounded-xl"
            >
              <FiSettings className="text-lg" />
              Edit Profile
            </Link>
          </li>
        </ul>

        {/* handling logout user */}
        <button
          onClick={handleLogOut}
          className="w-full flex items-center gap-3 px-5 py-4 text-blue-300 hover:text-red-400 hover:bg-red-500/10 transition rounded-b-2xl"
        >
          <FiLogOut className="text-lg" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default DropdownUserPelatihan;
