'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBox,
    FiUser,
    FiAward,
    FiLogOut,
    FiMenu,
    FiX,
    FiActivity,
    FiFileText,
    FiDatabase,
    FiLayout,
    FiStar,
    FiPhone,
    FiMail
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { elautBaseUrl } from '@/constants/urls';
import Toast from '@/commons/Toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { HashLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const checkAuthAndProfile = async () => {
            try {
                const token = Cookies.get('XSRF091');
                if (!token) {
                    router.push('/p2mkp/login');
                    return;
                }

                const response = await axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_jwt`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    const data = response.data.data || response.data;
                    setUserData(data);

                    // Skip profile completion check if already on the complete-profile page
                    if (pathname !== '/p2mkp/dashboard/complete-profile') {
                        const essentialFields = [
                            'nama_ppmkp', 'Nib', 'alamat', 'provinsi', 'kota',
                            'kecamatan', 'kelurahan', 'no_telp',
                            'nama_penanggung_jawab', 'no_telp_penanggung_jawab'
                        ];

                        const isComplete = essentialFields.every(field => {
                            const pascalField = field.charAt(0).toUpperCase() + field.slice(1);
                            const snakeField = field.toLowerCase();
                            const value = data[pascalField] || data[field] || data[snakeField];
                            return value !== null && value !== undefined && value !== "" && value !== "null";
                        });

                        if (!isComplete) {
                            Toast.fire({
                                icon: 'info',
                                title: 'Lengkapi Profil',
                                text: 'Silakan lengkapi data profil lembaga Anda terlebih dahulu.'
                            });
                            router.push('/p2mkp/dashboard/complete-profile');
                        }
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    Cookies.remove('XSRF091');
                    router.push('/p2mkp/login');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndProfile();
    }, [router, pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsMobile(true);
                setIsSidebarOpen(false);
            } else {
                setIsMobile(false);
                setIsSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        Cookies.remove('XSRF091');
        Cookies.remove('Access');
        router.push('/p2mkp/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <HashLoader color="#3b82f6" size={50} />
                <p className="mt-6 text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Loading Portal...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside
                className={`flex-none flex flex-col bg-[#0f172a] text-slate-300 transition-all duration-300 ease-in-out z-50 shadow-2xl ${isSidebarOpen ? "w-72" : "w-20"
                    }`}
            >
                {/* Logo + Toggle */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/50 bg-[#0f172a]">
                    {isSidebarOpen ? (
                        <div className="flex gap-3 items-center overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                <FiBox className="text-white text-lg" />
                            </div>
                            <span className="leading-tight text-xs font-semibold text-white tracking-wide">
                                P2MKP <br /> <span className="text-slate-400 font-normal">Portal Mandiri</span>
                            </span>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <FiBox className="text-white text-lg" />
                            </div>
                        </div>
                    )}

                    {isSidebarOpen && <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <FiMenu size={20} />
                    </button>}
                </div>
                {!isSidebarOpen && <div className="flex justify-center py-4 border-b border-slate-800/50">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <FiMenu size={20} />
                    </button>
                </div>}

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {/* Dashboard */}
                    <li className="list-none">
                        <Link
                            href="/p2mkp/dashboard"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${pathname === '/p2mkp/dashboard'
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                                : "hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <FiActivity className={`w-5 h-5 flex-shrink-0 ${pathname === '/p2mkp/dashboard' ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                            {isSidebarOpen && <span className="text-sm font-medium tracking-wide">Overview</span>}
                        </Link>
                    </li>

                    <li className="list-none">
                        <Link
                            href="/p2mkp/dashboard/penetapan"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${pathname.startsWith('/p2mkp/dashboard/penetapan')
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                                : "hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <FiAward className={`w-5 h-5 flex-shrink-0 ${pathname.startsWith('/p2mkp/dashboard/penetapan') ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                            {isSidebarOpen && <span className="text-sm font-medium tracking-wide">Penetapan P2MKP</span>}
                        </Link>
                    </li>

                    <li className="list-none">
                        <Link
                            href="/p2mkp/dashboard/klasifikasi"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${pathname.startsWith('/p2mkp/dashboard/klasifikasi')
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                                : "hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <FiStar className={`w-5 h-5 flex-shrink-0 ${pathname.startsWith('/p2mkp/dashboard/klasifikasi') ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                            {isSidebarOpen && <span className="text-sm font-medium tracking-wide">Klasifikasi P2MKP</span>}
                        </Link>
                    </li>

                    <li className="list-none">
                        <Link
                            href="/p2mkp/laporan-kegiatan"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${pathname.startsWith('/p2mkp/laporan-kegiatan')
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                                : "hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <FiFileText className={`w-5 h-5 flex-shrink-0 ${pathname.startsWith('/p2mkp/laporan-kegiatan') ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                            {isSidebarOpen && <span className="text-sm font-medium tracking-wide">Laporan Kegiatan</span>}
                        </Link>
                    </li>


                    <li className="list-none pt-4">
                        <div className="px-3 mb-2">
                            <hr className="border-slate-800/50" />
                        </div>
                    </li>

                </div>

                {isSidebarOpen && (
                    <div className="px-4 mb-6 relative group">
                        {/* Background Aura Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative p-6 rounded-[2rem] bg-[#1e293b]/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden group"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40 transform group-hover:rotate-12 transition-transform duration-500">
                                        <FiStar size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest leading-none">Pusat Bantuan</h4>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1">Layanan Official P2MKP</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <a href="tel:081188088767" className="flex items-center gap-4 group/item">
                                        <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover/item:bg-blue-600 group-hover/item:text-white group-hover/item:border-transparent transition-all duration-300">
                                            <FiPhone size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">WhatsApp / Call</span>
                                            <span className="text-sm text-white font-bold tracking-tight">0811-8808-8767</span>
                                        </div>
                                    </a>

                                    <a href="mailto:layanan.puslatkp@kkp.go.id" className="flex items-center gap-4 group/item">
                                        <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover/item:bg-indigo-600 group-hover/item:text-white group-hover/item:border-transparent transition-all duration-300">
                                            <FiMail size={18} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Official Email</span>
                                            <span className="text-[11px] text-white font-bold truncate tracking-tight">layanan.puslatkp@kkp.go.id</span>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* Bottom Accent */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    </div>
                )}

                {/* Logout */}
                <div className="p-4 border-t border-slate-800/50 bg-[#0f172a]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-all duration-200 group"
                    >
                        <FiLogOut className="w-5 h-5 group-hover:text-rose-500" />
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            <div className="flex-grow flex flex-col overflow-y-auto">
                <header className="flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-40 h-20 px-8 border-b border-slate-200/60 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors">
                            <FiMenu size={24} />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            <Link href="/p2mkp/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                            {pathname !== '/p2mkp/dashboard' && (
                                <>
                                    <span className="text-slate-300">/</span>
                                    <span className="text-blue-600">{pathname.split('/').pop()?.replace(/-/g, ' ')}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-xl transition-all">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-slate-800 leading-none">{userData?.NamaPpmkp || userData?.nama_ppmkp || 'Admin P2MKP'}</p>
                                        <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">{userData?.alamat ? userData.alamat.substring(0, 20) + '...' : ""}</p>
                                    </div>
                                    <Avatar className="h-10 w-10 border border-slate-200 shadow-sm rounded-full overflow-hidden">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 text-slate-800 p-2 rounded-2xl mt-2 shadow-xl">
                                <DropdownMenuLabel className="px-4 py-3 font-semibold text-slate-900">Portal Akses</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem onClick={() => router.push('/p2mkp/dashboard/complete-profile')} className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer text-sm font-medium">
                                    <FiUser className="mr-3 text-slate-500" size={16} /> Edit Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem onClick={handleLogout} className="p-3 rounded-lg hover:bg-rose-50 cursor-pointer text-rose-600 text-sm font-semibold">
                                    <FiLogOut className="mr-3" size={16} /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex-grow p-6 bg-slate-50">{children}</main>
            </div>
        </div>
    );
}
