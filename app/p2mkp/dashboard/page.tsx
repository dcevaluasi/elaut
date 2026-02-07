'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBox,
    FiUser,
    FiBookOpen,
    FiAward,
    FiLogOut,
    FiMenu,
    FiX,
    FiBell,
    FiSearch,
    FiTrendingUp,
    FiUsers,
    FiCalendar,
    FiActivity,
    FiLayout,
    FiCheckCircle,
    FiInfo,
    FiFileText,
    FiDatabase
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const dataPelatihan = [
    { name: 'Jan', peserta: 40 },
    { name: 'Feb', peserta: 30 },
    { name: 'Mar', peserta: 20 },
    { name: 'Apr', peserta: 27 },
    { name: 'May', peserta: 18 },
    { name: 'Jun', peserta: 23 },
    { name: 'Jul', peserta: 34 },
];

export default function P2MKPDashboardPage() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        Cookies.remove('XSRF091');
        Cookies.remove('Access');
        router.push('/p2mkp/login');
    };

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
                <HashLoader color="#3b82f6" size={50} />
                <p className="mt-6 text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Crypted System Initializing...</p>
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
                    {/* Sidebar Logo */}
                    <div className="px-8 pb-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <FiBox className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="font-calsans text-2xl leading-none">P2MKP</h1>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Management</p>
                            </div>
                        </div>
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
                                <FiX size={24} />
                            </button>
                        )}
                    </div>

                    {/* Nav Sections */}
                    <div className="flex-1 px-4 space-y-8">
                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Core Menu</p>
                            <SidebarItem href="/p2mkp/dashboard" icon={<FiActivity />} label="Overview" active />
                            <SidebarItem href="/p2mkp/dashboard/penetapan" icon={<FiAward />} label="Penetapan P2MKP" />
                        </div>

                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Reports</p>
                            <SidebarItem href="/p2mkp/laporan-kegiatan" icon={<FiFileText />} label="Create Report" />
                            <SidebarItem href="/p2mkp/laporan-kegiatan/report" icon={<FiDatabase />} label="Report History" />
                        </div>

                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Account</p>
                            <SidebarItem href="/p2mkp/dashboard/complete-profile" icon={<FiUser />} label="Profile Lembaga" />
                        </div>
                    </div>

                    {/* Sidebar Footer */}
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
                {/* Custom Header */}
                <header className="h-24 bg-transparent flex items-center justify-between px-8 lg:px-12 relative z-20">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl lg:hidden text-blue-400 transition-all border border-white/5">
                            <FiMenu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-gray-500">Dashboard</span>
                            <span className="text-gray-700">/</span>
                            <span className="text-blue-400">Main Overview</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-400">
                            <FiCalendar className="text-blue-400" /> Standar Pelayanan {new Date().getFullYear()}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-4 hover:bg-white/5 p-1.5 rounded-2xl transition-all border border-transparent hover:border-white/10">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-white leading-none">Admin P2MKP</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">Institutional Lead</p>
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
                                <DropdownMenuItem className="p-3 rounded-xl hover:bg-white/10 cursor-pointer text-xs font-bold tracking-wide">
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

                {/* Main Scroll Area */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-12 pt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-7xl mx-auto space-y-12 pb-20"
                    >
                        {/* Elite Welcome Hero */}
                        <div className="relative group rounded-[3rem] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                            <div className="absolute top-0 right-0 p-24 bg-white/20 rounded-full blur-[120px] -mr-32 -mt-32" />

                            <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row justify-between items-center gap-10">
                                <div className="space-y-6 flex-1 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                        <FiActivity size={14} /> System Verified
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-calsans text-white leading-tight">
                                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-indigo-200">Admin P2MKP!</span> 👋
                                    </h2>
                                    <p className="text-blue-100/80 text-base md:text-lg font-light leading-relaxed max-w-xl">
                                        Pantau progress operasional dan manage standarisasi pelatihan mandiri Anda secara real-time.
                                    </p>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                                            <Button className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 rounded-2xl font-black tracking-widest shadow-xl shadow-black/20 text-xs">
                                                AJUKAN PENETAPAN <FiAward className="ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="hidden lg:block relative shrink-0">
                                    <div className="w-64 h-64 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-2xl flex items-center justify-center p-8 active:scale-95 transition-transform duration-500">
                                        <FiActivity className="text-9xl text-white/20" />
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/40 px-4 py-2 rounded-xl flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-400 tracking-tighter uppercase">Live Status</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grid Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <StatCard title="Pelatihan Aktif" value="12" icon={<FiBookOpen />} trend="+2.5%" color="blue" />
                            <StatCard title="Peserta Terdaftar" value="1,234" icon={<FiUsers />} trend="+12.0%" color="indigo" />
                            <StatCard title="Sertifikat Resertifikasi" value="892" icon={<FiAward />} trend="+5.4%" color="cyan" />
                            <StatCard title="Masa Berlaku SK" value="3 Thn" icon={<FiCalendar />} trend="Locked" color="emerald" />
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            {/* Analytics View */}
                            <div className="lg:col-span-2 group">
                                <div className="p-8 rounded-[2.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 shadow-2xl relative overflow-hidden group-hover:border-blue-500/20 transition-all duration-700">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-calsans">Metrics Analytics</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Growth Performance Insight</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">Monthly</div>
                                        </div>
                                    </div>

                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={dataPelatihan}>
                                                <defs>
                                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} dx={-10} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900 }}
                                                    labelStyle={{ color: '#3b82f6', marginBottom: '4px', fontWeight: 900, fontSize: '12px' }}
                                                />
                                                <Area type="monotone" dataKey="peserta" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Section */}
                            <div className="space-y-8">
                                <div className="p-8 rounded-[2.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 shadow-2xl relative group-hover:border-indigo-500/20 transition-all">
                                    <div className="space-y-1 mb-8">
                                        <h3 className="text-xl font-calsans">Aktivitas Laporan</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Real-time Operasional</p>
                                    </div>

                                    <div className="space-y-6">
                                        {[
                                            { title: 'Budidaya Lele', status: 'Approved', color: 'emerald', time: '2m ago' },
                                            { title: 'Pengolahan Ikan', status: 'Pending', color: 'amber', time: '1h ago' },
                                            { title: 'Pemasaran Mandiri', status: 'Updated', color: 'blue', time: '4h ago' },
                                            { title: 'Sertifikasi Keahlian', status: 'Finalized', color: 'indigo', time: '1d ago' },
                                        ].map((act, i) => (
                                            <div key={i} className="flex gap-4 items-center group/act py-1">
                                                <div className={`w-2.5 h-2.5 rounded-full bg-${act.color}-500 shadow-lg shadow-${act.color}-500/20`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-white truncate">{act.title}</p>
                                                    <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-tighter font-black">ST: <span className={`text-${act.color}-400`}>{act.status}</span></p>
                                                </div>
                                                <span className="text-[9px] text-gray-700 font-bold whitespace-nowrap">{act.time}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button variant="ghost" className="w-full mt-10 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest bg-white/5 hover:bg-white/10 rounded-2xl h-12">
                                        LIHAT SEMUA LOG <FiChevronRight className="ml-2" />
                                    </Button>
                                </div>

                                <div className="p-6 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 backdrop-blur-xl relative group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20">
                                            <FiInfo size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Pembaruan Sistem</h4>
                                            <p className="text-[10px] text-indigo-200/60 mt-1 font-medium italic">Integrasi Sertifikat v4.2 Aktif.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

// Visual Sidebar Item
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

// Cyber Stat Card
function StatCard({ title, value, icon, trend, color }: any) {
    const colors: any = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="p-8 rounded-[2.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 shadow-2xl space-y-4 relative group overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <div className="text-6xl">{icon}</div>
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${colors[color]}`}>
                    {icon}
                </div>
                <div className={`text-[10px] font-black tracking-tighter px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 ${color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {trend}
                </div>
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="text-4xl font-calsans tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
                    {value}
                </h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
                    {title}
                </p>
            </div>
        </motion.div>
    );
}

import { FiChevronRight } from 'react-icons/fi';
