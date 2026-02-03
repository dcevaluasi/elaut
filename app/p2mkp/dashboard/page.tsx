'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    User,
    BookOpen,
    Award,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    TrendingUp,
    Users,
    Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

    // Handle Logout
    const handleLogout = () => {
        Cookies.remove('XSRF091');
        Cookies.remove('Access');
        router.push('/p2mkp/login');
    };

    // Responsive Sidebar
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

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 flex font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="h-20 flex items-center px-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="font-bold text-xl">P</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg leading-none">P2MKP</h1>
                                <p className="text-xs text-slate-400">Dashboard Area</p>
                            </div>
                        </div>
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-white/70 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        <NavItem href="/p2mkp/dashboard" icon={<LayoutDashboard />} label="Dashboard" active />
                        <NavItem href="/p2mkp/dashboard/penetapan" icon={<Award />} label="Penetapan P2MKP" />
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-white/10">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="font-bold text-sm mb-1">Butuh Bantuan?</h4>
                                <p className="text-xs text-blue-100 mb-3">Hubungi call center kami.</p>
                                <Button size="sm" variant="secondary" className="w-full text-xs h-8 bg-white text-blue-600 hover:bg-blue-50">Hubungi Kami</Button>
                            </div>
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-neutral-100 rounded-lg lg:hidden">
                            <Menu className="w-6 h-6 text-neutral-600" />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-neutral-400 text-sm">
                            <span>Dashboard</span>
                            <span>/</span>
                            <span className="text-neutral-900 font-medium">Overview</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">

                        <div className="h-8 w-px bg-neutral-200 mx-1"></div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 hover:bg-neutral-50 p-1.5 rounded-full pl-3 transition-colors border border-transparent hover:border-neutral-200">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-semibold text-neutral-900 leading-none">Admin P2MKP</p>
                                        <p className="text-xs text-neutral-500 mt-1">Pengelola</p>
                                    </div>
                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">Profil</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">Pengaturan</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-7xl mx-auto space-y-8"
                    >
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
                            <div className="relative z-10 max-w-2xl">
                                <h2 className="text-3xl font-bold mb-3">Selamat Datang kembali, Admin P2MKP! 👋</h2>
                                <p className="text-blue-100 mb-6 text-lg">Kelola pelatihan dan sertifikasi Anda dengan mudah melalui dashboard ini.</p>
                                <div className="flex gap-3">
                                    <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                                        <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-none shadow-md">
                                            Ajukan Penetapan
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {/* Decor */}
                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                                <LayoutDashboard className="w-64 h-64 -mb-12 -mr-12" />
                            </div>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Pelatihan" value="12" change="+2.5%" icon={<BookOpen className="text-blue-600" />} />
                            <StatCard title="Total Peserta" value="1,234" change="+12%" icon={<Users className="text-violet-600" />} />
                            <StatCard title="Sertifikat Terbit" value="892" change="+5.4%" icon={<Award className="text-amber-500" />} />
                            <StatCard title="Jadwal Mendatang" value="3" change="Minggu ini" icon={<Calendar className="text-emerald-500" />} />
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Chart */}
                            <Card className="lg:col-span-2 shadow-sm border-neutral-200">
                                <CardHeader>
                                    <CardTitle>Statistik Peserta Pelatihan</CardTitle>
                                    <CardDescription>Gambaran jumlah peserta dalam 6 bulan terakhir</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={dataPelatihan}>
                                                <defs>
                                                    <linearGradient id="colorPeserta" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737373' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373' }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />
                                                <Area type="monotone" dataKey="peserta" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPeserta)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="shadow-sm border-neutral-200">
                                <CardHeader>
                                    <CardTitle>Aktivitas Terbaru</CardTitle>
                                    <CardDescription>Update status pelatihan terkini</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {[1, 2, 3, 4].map((_, i) => (
                                            <div key={i} className="flex gap-4 items-start">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-900">Pelatihan Budidaya Lele</p>
                                                    <p className="text-xs text-neutral-500 mt-1">Status diubah menjadi <span className="text-green-600 font-medium">Selesai</span></p>
                                                    <span className="text-[10px] text-neutral-400 mt-2 block">2 jam yang lalu</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="ghost" className="w-full mt-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50">Lihat Semua Aktivitas</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

// Helper Components
function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                {React.cloneElement(icon as React.ReactElement, { size: 20 })}
                <span className="font-medium text-sm">{label}</span>
            </div>
        </Link>
    )
}

function StatCard({ title, value, change, icon }: any) {
    return (
        <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-neutral-50 rounded-xl">
                        {React.cloneElement(icon, { size: 24 })}
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                        {change}
                    </Badge>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-neutral-900">{value}</h3>
                    <p className="text-sm text-neutral-500 font-medium mt-1">{title}</p>
                </div>
            </CardContent>
        </Card>
    )
}
