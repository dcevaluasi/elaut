"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    FiHome,
    FiCreditCard,
    FiSearch,
    FiSettings,
    FiUser,
    FiGrid,
    FiLogOut,
} from "react-icons/fi";
import { useRef, useState, useEffect } from "react";
import { useFetchUser } from "@/hooks/elaut/user/useFetchUser";
import Toast from "../toast";

const BottomNavigation = () => {
    const pathname = usePathname();
    const isLoggedIn = Cookies.get("XSRF081");
    const router = useRouter()

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { userDetail, isLoading, fetchUser } = useFetchUser();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);


    // Close dropdown if click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogOut = () => {
        Cookies.remove("XSRF081");
        Cookies.remove("XSRF083");
        Cookies.remove("status");
        Cookies.remove("isManningAgent");
        Toast.fire({
            icon: "success",
            title: 'Yeayyy!',
            text: `Berhasil logout dari dashboard!`,
        });
        window.location.href = "/login";
    };

    const navItems = [
        { href: "/", icon: FiHome, label: "Home" },
        {
            href: "/layanan/cek-sertifikat",
            icon: FiCreditCard,
            label: "Cek Sertifikat",
        },
        {
            href: "/layanan/pelatihan/program/perikanan",
            icon: FiSearch,
            label: "Cari Pelatihan",
            center: true,
        },
        {
            href: isLoggedIn ? "/dashboard/edit-profile" : "/login",
            icon: FiSettings,
            label: "Settings",
        },
    ];

    return (
        <div
            className={`fixed z-[199999999999999] w-full h-16 max-w-lg -translate-x-1/2 
      bottom-4 left-1/2 rounded-full 
      bg-white/10 backdrop-blur-xl border border-white/20 
      shadow-[0_8px_32px_rgba(0,0,0,0.25)] 
      transition md:hidden `}
        >
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
                {navItems.map(({ href, icon: Icon, label, center }, idx) => (
                    <div key={idx} className="flex items-center justify-center">
                        <Link
                            href={href}
                            className={`inline-flex flex-col items-center justify-center px-5 
                ${center
                                    ? "w-16 h-16 -mt-4 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-full shadow-lg hover:scale-105"
                                    : ""
                                }
                ${pathname === href && !center ? "text-blue-500" : "text-gray-300"} 
                hover:text-blue-400 transition-all`}
                        >
                            <Icon
                                className={` ${center ? "w-8 h-8" : "mb-1 w-6 h-6"}`}
                            />
                            <span className="sr-only">{label}</span>
                        </Link>
                    </div>
                ))}

                {/* Profile dropdown trigger */}
                <div className="flex items-center justify-center relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`inline-flex flex-col items-center justify-center px-5 
              ${pathname === "/dashboard" ? "text-blue-500" : "text-gray-300"} 
              hover:text-blue-400 transition-all`}
                    >
                        <FiUser className="mb-1 w-6 h-6" />
                        <span className="sr-only">Profile</span>
                    </button>

                    {/* Dropdown menu */}
                    <div
                        ref={dropdownRef}
                        className={`absolute bottom-16 right-0 min-w-[240px] rounded-2xl 
              bg-white/10 backdrop-blur-2xl shadow-lg border border-white/20  
              transition-all duration-300 ${dropdownOpen
                                ? "opacity-100 visible translate-y-0"
                                : "opacity-0 invisible translate-y-2"
                            }`}
                    >
                        <ul className="flex flex-col divide-y divide-white/10">
                            <li className="p-5 text-center">
                                <p className="font-semibold text-white leading-none text-sm">
                                    {isLoggedIn ? "Selamat Datang!" : "Haloo Sobat E-LAUT!"}
                                </p>
                                {isLoggedIn && (
                                    <span className="text-sm font-bold text-gray-300 leading-none">{userDetail?.Nama}</span>
                                )}
                            </li>

                            {isLoggedIn && <>  <li>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center font-semibold gap-3 px-5 py-3 text-white/80 hover:text-white hover:bg-white/10 transition rounded-xl"
                                >
                                    <FiGrid className="text-lg" />
                                    Dashboard
                                </Link>
                            </li>
                                <li>
                                    <Link
                                        href="/dashboard/edit-profile"
                                        className="flex items-center gap-3 px-5 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/10 transition rounded-xl"
                                    >
                                        <FiSettings className="text-lg" />
                                        Edit Profile
                                    </Link>
                                </li></>}

                        </ul>

                        {isLoggedIn ?
                            <button
                                onClick={handleLogOut}
                                className="w-full flex items-center gap-3 font-semibold px-5 py-4 text-white hover:text-red-400 hover:bg-red-500/10 transition rounded-b-2xl"
                            >
                                <FiLogOut className="text-lg" />
                                Log Out
                            </button> : <button
                                onClick={() => router.push('/login')}
                                className="w-full flex items-center gap-3 px-5 py-4 font-semibold text-white hover:text-red-400 hover:bg-red-500/10 transition rounded-b-2xl"
                            >
                                <FiLogOut className="text-lg" />
                                Log In
                            </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BottomNavigation;
