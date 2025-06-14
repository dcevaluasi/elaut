'use client'

import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiCreditCard, FiPlus, FiSettings, FiUser, FiSearch } from "react-icons/fi";

const BottomNavigation = () => {
    const pathname = usePathname()
    return (
        <div className={`fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 shadow-custom bg-white rounded-full bottom-4 left-1/2  ${pathname === '/' ? 'block' : 'block'} md:hidden`}>
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
                {/* Home */}
                <Link href={'/'} className="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-50 dark:hover:bg-gray-800 group">
                    <FiHome className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
                    <span className="sr-only">Home</span>
                </Link>

                {/* Wallet */}
                <Link href={'/layanan/cek-sertifikat'} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                    <FiCreditCard className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
                    <span className="sr-only">Cek Sertifikat</span>
                </Link>

                {/* New Item */}
                <div className="flex items-center justify-center">
                    <Link href='/layanan/program/perikanan' className="inline-flex items-center justify-center w-10 h-10 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800">
                        <FiSearch className="w-6 h-6 text-white" />
                        <span className="sr-only">Cari Pelatihan</span>
                    </Link>
                </div>

                {/* Settings */}
                <Link href={Cookies.get('XSRF081') ? '/dashboard/edit-profile' : '/login'} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                    <FiSettings className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
                    <span className="sr-only">Settings</span>
                </Link>

                {/* Profile */}
                <Link href={Cookies.get('XSRF081') ? '/dashboard' : '/login'} className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group">
                    <FiUser className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
                    <span className="sr-only">Profile</span>
                </Link>
            </div>
        </div>
    );
};

export default BottomNavigation;
