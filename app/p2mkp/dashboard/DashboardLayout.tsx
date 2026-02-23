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
    FiLayout
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
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
                <HashLoader color="#3b82f6" size={50} />
                <p className="mt-6 text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Loading Portal...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex font-jakarta overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a]/60 backdrop-blur-3xl border-r border-white/5 transition-transform duration-500 ease-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="h-full flex flex-col pt-8">
                    <div className="px-8 pb-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <FiBox className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="font-calsans text-2xl leading-none">P2MKP</h1>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Portal</p>
                            </div>
                        </div>
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white transition-colors">
                                <FiX size={24} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 px-4 space-y-8">
                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Core Menu</p>
                            <SidebarItem href="/p2mkp/dashboard" icon={<FiActivity />} label="Overview" active={pathname === '/p2mkp/dashboard'} />
                            <SidebarItem href="/p2mkp/dashboard/penetapan" icon={<FiAward />} label="Penetapan P2MKP" active={pathname.startsWith('/p2mkp/dashboard/penetapan')} />
                        </div>
                        {/* 
                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Reports</p>
                            <SidebarItem href="/p2mkp/laporan-kegiatan" icon={<FiFileText />} label="Create Report" active={pathname === '/p2mkp/laporan-kegiatan'} />
                            <SidebarItem href="/p2mkp/laporan-kegiatan/report" icon={<FiDatabase />} label="Report History" active={pathname === '/p2mkp/laporan-kegiatan/report'} />
                        </div> */}

                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Account</p>
                            <SidebarItem href="/p2mkp/dashboard/complete-profile" icon={<FiUser />} label="Profile Lembaga" active={pathname === '/p2mkp/dashboard/complete-profile'} />
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="bg-white/5 rounded-[2rem] border border-white/5 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors" />
                            <div className="relative z-10 space-y-3">
                                <h4 className="font-bold text-sm">Butuh Bantuan?</h4>
                                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">Bantuan teknis pengelolaan P2MKP aktif 24/7.</p>
                                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-[10px] font-black h-10 rounded-xl">HUBUNGI SUPPORT</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-24 bg-transparent flex items-center justify-between px-8 lg:px-12 relative z-20">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl lg:hidden text-blue-400 transition-all border border-white/5">
                            <FiMenu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                            <Link href="/p2mkp/dashboard" className="text-gray-500 hover:text-white transition-colors">Dashboard</Link>
                            {pathname !== '/p2mkp/dashboard' && (
                                <>
                                    <span className="text-gray-700">/</span>
                                    <span className="text-blue-400">{pathname.split('/').pop()?.replace(/-/g, ' ')}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-4 hover:bg-white/5 p-1.5 rounded-2xl transition-all border border-transparent hover:border-white/10">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-white leading-none">{userData?.NamaPpmkp || userData?.nama_ppmkp || 'Admin P2MKP'}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">{userData?.alamat || ""}</p>
                                    </div>
                                    <Avatar className="h-10 w-10 border-2 border-white/10 shadow-xl rounded-2xl overflow-hidden">
                                        <AvatarImage src="https://github.com/shadcn.png" className="rounded-2xl" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 bg-[#0f172a]/95 backdrop-blur-3xl border-white/10 text-white p-2 rounded-[2rem] mt-2 shadow-2xl">
                                <DropdownMenuLabel className="px-4 py-4 font-calsans text-lg text-blue-400">Portal Akses</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem onClick={() => router.push('/p2mkp/dashboard/complete-profile')} className="p-3 rounded-xl hover:bg-white/10 cursor-pointer text-xs font-bold tracking-wide">
                                    <FiUser className="mr-3 text-blue-400" size={16} /> Edit Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="p-3 rounded-xl hover:bg-white/10 cursor-pointer text-xs font-bold tracking-wide">
                                    <FiLayout className="mr-3 text-indigo-400" size={16} /> Preferences
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem onClick={handleLogout} className="p-3 rounded-xl hover:bg-rose-500/10 cursor-pointer text-rose-400 text-xs font-black tracking-widest">
                                    <FiLogOut className="mr-3" size={16} /> LOGOUT SESSION
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 lg:p-12 pt-4">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SidebarItem({ href, icon, label, active }: any) {
    return (
        <Link href={href} className="block px-4">
            <motion.div
                whileHover={{ x: 5 }}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative group ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'}`}
            >
                <span className={`text-xl transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-gray-600 group-hover:text-blue-400'}`}>
                    {icon}
                </span>
                <span className={`text-xs font-bold tracking-wide ${active ? 'font-black' : ''}`}>{label}</span>
                {active && (
                    <motion.div layoutId="navBar" className="absolute left-0 w-1 h-6 bg-white rounded-full ml-1" />
                )}
            </motion.div>
        </Link>
    );
}
