'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Plus,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    LayoutDashboard,
    Award,
    X,
    Menu,
    Search,
    Bell,
    LogOut,
    User
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function PenetapanP2MKPPage() {
    const router = useRouter();

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Initial Resize Check
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

    // 

    // Mock data for existing submissions
    const submissions: any[] = [
        // {
        //     id: 1,
        //     title: 'Pengajuan Penetapan P2MKP 2024',
        //     date: '2024-01-20',
        //     status: 'Dalam Proses',
        //     statusColor: 'bg-yellow-100 text-yellow-700'
        // }
    ];

    return (
        <div className="min-h-screen bg-neutral-50 flex font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Header Sidebar */}
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
                        <NavItem href="/p2mkp/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
                        <NavItem href="/p2mkp/dashboard/penetapan" icon={<Award />} label="Penetapan P2MKP" active />
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden h-screen">
                {/* Header Top */}
                <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-6 lg:px-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-neutral-100 rounded-lg lg:hidden">
                            <Menu className="w-6 h-6 text-neutral-600" />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-neutral-400 text-sm">
                            <Link href="/p2mkp/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                            <span>/</span>
                            <span className="text-neutral-900 font-medium">Penetapan P2MKP</span>
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

                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-7xl mx-auto space-y-8"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-900">Penetapan P2MKP</h1>
                                <p className="text-neutral-500">Kelola dan pantau status pengajuan penetapan P2MKP Anda.</p>
                            </div>
                            <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Buat Pengajuan Baru
                                </Button>
                            </Link>
                        </div>

                        {/* Submissions List */}
                        {submissions.length > 0 ? (
                            <div className="grid gap-4">
                                {submissions.map((item: any) => (
                                    <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer border-neutral-200">
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-neutral-900">{item.title}</h3>
                                                    <p className="text-sm text-neutral-500">Diajukan pada {item.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge className={`${item.statusColor} hover:${item.statusColor} border-none`}>
                                                    {item.status}
                                                </Badge>
                                                <Button variant="ghost" size="sm">Detail</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed border-2 border-neutral-200 bg-neutral-50/50">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900">Belum ada pengajuan</h3>
                                    <p className="text-neutral-500 max-w-sm mt-2 mb-6">
                                        Anda belum membuat pengajuan penetapan P2MKP. Mulai dengan membuat pengajuan baru.
                                    </p>
                                    <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Buat Pengajuan
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

// Components
function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                {React.cloneElement(icon as React.ReactElement, { size: 20 })}
                <span className="font-medium text-sm">{label}</span>
            </div>
        </Link>
    );
}
