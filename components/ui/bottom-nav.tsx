'use client'

import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiHome,
    FiCreditCard,
    FiSearch,
    FiSettings,
    FiUser,
} from "react-icons/fi";

const BottomNavigation = () => {
    const pathname = usePathname();
    const isLoggedIn = Cookies.get("XSRF081");

    const navItems = [
        { href: "/", icon: FiHome, label: "Home" },
        { href: "/layanan/cek-sertifikat", icon: FiCreditCard, label: "Cek Sertifikat" },
        { href: "/layanan/pelatihan/program/perikanan", icon: FiSearch, label: "Cari Pelatihan", center: true },
        { href: isLoggedIn ? "/dashboard/edit-profile" : "/login", icon: FiSettings, label: "Settings" },
        { href: isLoggedIn ? "/dashboard" : "/login", icon: FiUser, label: "Profile" },
    ];

    return (
        <div
            className={`fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 
      bottom-4 left-1/2 rounded-full 
      bg-white/10 backdrop-blur-xl border border-white/20 
      shadow-[0_8px_32px_rgba(0,0,0,0.25)] 
      transition md:hidden`}
        >
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
                {navItems.map(({ href, icon: Icon, label, center }, idx) => (
                    <div key={idx} className="flex items-center justify-center">
                        <Link
                            href={href}
                            className={`inline-flex flex-col items-center justify-center px-5 
                ${center ? "w-16 h-16 -mt-4 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-full shadow-lg hover:scale-105" : ""}
                ${pathname === href && !center ? "text-blue-500" : "text-gray-300"} 
                hover:text-blue-400 transition-all`}
                        >
                            <Icon className={` ${center ? "w-8 h-8" : "mb-1 w-6 h-6"}`} />
                            <span className="sr-only">{label}</span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BottomNavigation;
