'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiFileText,
    FiDownload,
    FiEye,
    FiSearch,
    FiCalendar,
    FiUser,
    FiRefreshCw,
    FiBox,
    FiActivity,
    FiAward,
    FiLogOut,
    FiMenu,
    FiX,
    FiMapPin,
    FiBriefcase,
    FiLayout,
    FiClock,
    FiCheckCircle,
    FiDatabase,
    FiUsers
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
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
import Toast from '@/commons/Toast';
import { collection, getDocs, query, orderBy, getFirestore } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';

const db = getFirestore(firebaseApp);

interface Pelatih {
    nama: string;
    keahlian: string;
    sertifikasi: string;
}

interface Pelatihan {
    jenis: string;
    waktu: string;
    lokasi: string;
    jumlahPeserta: number;
    instansiPeserta: string;
    materi: string[];
    sumberAnggaran: string;
}

interface ReportData {
    id?: string;
    namaP2MKP: string;
    tanggalBerdiri: string;
    alamatP2MKP: string;
    namaKetua: string;
    latarBelakang: string;
    bidangUsaha: string;
    pelatih: Pelatih[];
    penghargaan: any[];
    pelatihan: Pelatihan[];
    tantangan: string[];
    tantanganCustom: string[];
    upaya: string[];
    upayaCustom: string[];
    dampak: string[];
    dampakCustom: string[];
    mitra: any[];
    harapanUsaha: string[];
    harapanPelatihan: string[];
    createdAt?: any;
}

export default function P2MKPReportDashboard() {
    const router = useRouter();
    const [reports, setReports] = useState<ReportData[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        loadReports();
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

    const loadReports = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const loadedReports: ReportData[] = [];
            querySnapshot.forEach((doc) => {
                loadedReports.push({ id: doc.id, ...doc.data() } as ReportData);
            });
            setReports(loadedReports);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Cookies.remove('XSRF091');
        Cookies.remove('Access');
        router.push('/p2mkp/login');
    };

    const filteredReports = reports.filter(report => {
        const s = searchQuery.toLowerCase();
        return (report.namaP2MKP?.toLowerCase() || '').includes(s) ||
            (report.namaKetua?.toLowerCase() || '').includes(s) ||
            (report.alamatP2MKP?.toLowerCase() || '').includes(s);
    });

    const formatDate = (date: any) => {
        if (!date) return '-';
        if (date.toDate) return date.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex font-jakarta overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Shared Sidebar */}
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
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Registry</p>
                            </div>
                        </div>
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
                                <FiX size={24} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 px-4 space-y-8">
                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Core Menu</p>
                            <SidebarItem href="/p2mkp/dashboard" icon={<FiActivity />} label="Overview" />
                            <SidebarItem href="/p2mkp/dashboard/penetapan" icon={<FiAward />} label="Penetapan P2MKP" />
                        </div>

                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Reports</p>
                            <SidebarItem href="/p2mkp/laporan-kegiatan" icon={<FiFileText />} label="Create Report" />
                            <SidebarItem href="/p2mkp/laporan-kegiatan/report" icon={<FiDatabase />} label="Report History" active />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header Top */}
                <header className="h-24 bg-transparent flex items-center justify-between px-8 lg:px-12 shrink-0 z-20">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl lg:hidden text-blue-400 border border-white/5">
                            <FiMenu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                            <Link href="/p2mkp/dashboard" className="text-gray-500 hover:text-white transition-colors">Portal</Link>
                            <span className="text-gray-700">/</span>
                            <span className="text-blue-400">Report Registry</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={loadReports}
                            className={`p-4 rounded-xl bg-white/5 border border-white/5 text-blue-400 hover:bg-white/10 transition-all ${loading ? 'animate-pulse' : ''}`}
                        >
                            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-4 hover:bg-white/5 p-1.5 rounded-2xl transition-all border border-transparent hover:border-white/10">
                                    <Avatar className="h-10 w-10 border-2 border-white/10 shadow-xl rounded-2xl overflow-hidden">
                                        <AvatarImage src="https://github.com/shadcn.png" className="rounded-2xl" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 bg-[#0f172a]/95 backdrop-blur-3xl border-white/10 text-white p-2 rounded-[2rem] mt-2 shadow-2xl">
                                <DropdownMenuItem onClick={handleLogout} className="p-3 rounded-xl hover:bg-rose-500/10 cursor-pointer text-rose-400 text-xs font-black tracking-widest">
                                    <FiLogOut className="mr-3" size={16} /> LOGOUT SESSION
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden p-8 lg:p-12 pt-0 flex flex-col gap-10">
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-calsans">Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Database</span></h1>
                                <p className="text-gray-500 text-sm font-light italic leading-relaxed">Arsip digital seluruh laporan operasional P2MKP yang telah tersinkronisasi.</p>
                            </div>

                            <div className="relative group w-full md:w-[400px]">
                                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by Institution, Head, or City..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-white/5 border-white/10 rounded-[1.5rem] text-xs focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-8">
                        {/* List Sidebar */}
                        <div className="lg:w-[380px] flex flex-col gap-4 overflow-hidden">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-2">Sync Results ({filteredReports.length})</p>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {loading && reports.length === 0 ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />
                                    ))
                                ) : filteredReports.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 text-center p-8">
                                        <FiDatabase className="text-gray-700 mb-4" size={40} />
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No matching logs found</p>
                                    </div>
                                ) : (
                                    filteredReports.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => setSelectedReport(r)}
                                            className={`w-full p-6 rounded-[2rem] border transition-all relative group text-left ${selectedReport?.id === r.id ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedReport?.id === r.id ? 'bg-white/10' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    <FiFileText />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`text-xs font-bold truncate ${selectedReport?.id === r.id ? 'text-white' : 'text-gray-300'}`}>{r.namaP2MKP}</h3>
                                                    <p className={`text-[10px] font-medium mt-1 ${selectedReport?.id === r.id ? 'text-blue-100' : 'text-gray-500'}`}>{r.namaKetua}</p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter opacity-70">
                                                            <FiClock /> {formatDate(r.createdAt)}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${selectedReport?.id === r.id ? 'bg-white/10 border-white/10' : 'bg-blue-500/10 border-blue-500/10 text-blue-400'} border`}>
                                                            ID: {r.id?.slice(-4)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Detail Area */}
                        <div className="flex-1 overflow-hidden min-h-0 bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] relative">
                            <AnimatePresence mode="wait">
                                {selectedReport ? (
                                    <motion.div
                                        key={selectedReport.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full flex flex-col p-10 overflow-hidden"
                                    >
                                        <div className="pb-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-3xl text-blue-400">
                                                    <FiLayout />
                                                </div>
                                                <div className="space-y-1">
                                                    <h2 className="text-3xl font-calsans">{selectedReport.namaP2MKP}</h2>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{selectedReport.namaKetua} • Registry Instance</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => Toast.fire({ icon: 'info', title: 'PDF Core Triggered', text: 'Generating high-fidelity document blueprint.' })}
                                                    className="h-14 px-8 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center gap-3"
                                                >
                                                    <FiDownload /> DOWNLOAD ARCHIVE
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pt-10 space-y-12 pr-4 custom-scrollbar">
                                            {/* Summary Section */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4">
                                                    <div className="flex items-center gap-3 text-blue-400">
                                                        <FiBriefcase />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Business Domain</p>
                                                    </div>
                                                    <p className="text-xs text-gray-400 leading-relaxed italic">{selectedReport.bidangUsaha || 'No domain description provided.'}</p>
                                                </div>
                                                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4">
                                                    <div className="flex items-center gap-3 text-indigo-400">
                                                        <FiMapPin />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">HQ Location</p>
                                                    </div>
                                                    <p className="text-xs text-gray-400 leading-relaxed truncate">{selectedReport.alamatP2MKP || 'No location data.'}</p>
                                                </div>
                                            </div>

                                            {/* Pelatihan Section */}
                                            <div className="space-y-6">
                                                <SectionSubHeader icon={<FiZap />} title="Training Deliverables" count={selectedReport.pelatihan?.length} />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {selectedReport.pelatihan?.map((p, i) => (
                                                        <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{p.jenis}</h4>
                                                                <span className="flex items-center gap-1 text-[8px] font-black text-gray-500 uppercase"><FiClock /> {p.waktu}</span>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <DataPoint label="Attendees" value={`${p.jumlahPeserta} Practitioners`} />
                                                                <DataPoint label="Location" value={p.lokasi} />
                                                                <div className="flex flex-wrap gap-2 mt-4">
                                                                    {p.materi?.map((m, j) => (
                                                                        <span key={j} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] text-gray-500 font-bold uppercase">{m}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Expertise Section */}
                                            <div className="space-y-6">
                                                <SectionSubHeader icon={<FiUsers />} title="Expert Panel" count={selectedReport.pelatih?.length} />
                                                <div className="flex flex-wrap gap-4">
                                                    {selectedReport.pelatih?.map((p, i) => (
                                                        <div key={i} className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs">0{i + 1}</div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-300">{p.nama}</p>
                                                                <p className="text-[8px] text-gray-600 font-black uppercase mt-0.5">{p.keahlian} • {p.sertifikasi}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Intelligence Mapping */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <IntelligenceCard title="Field Challenges" items={selectedReport.tantangan} custom={selectedReport.tantanganCustom} color="rose" />
                                                <IntelligenceCard title="Strategic Upaya" items={selectedReport.upaya} custom={selectedReport.upayaCustom} color="indigo" />
                                                <IntelligenceCard title="Social Impact" items={selectedReport.dampak} custom={selectedReport.dampakCustom} color="emerald" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-30">
                                        <div className="w-40 h-40 rounded-[3rem] border border-dashed border-gray-600 flex items-center justify-center mb-8">
                                            <FiDatabase size={80} className="text-gray-700" />
                                        </div>
                                        <h3 className="text-2xl font-calsans uppercase tracking-widest text-gray-600">Select Access Node</h3>
                                        <p className="text-xs text-gray-700 font-bold uppercase tracking-widest mt-2">Pilih laporan di sidebar untuk eksposisi data terperinci</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Subcomponents
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

function SectionSubHeader({ icon, title, count }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10">{icon}</div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">{title} <span className="text-blue-400 ml-2">[{count || 0}]</span></h3>
            <div className="flex-1 h-px bg-white/5 ml-4" />
        </div>
    );
}

function DataPoint({ label, value }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
            <p className="text-[11px] font-bold text-gray-400">{value || '-'}</p>
        </div>
    );
}

function IntelligenceCard({ title, items, custom, color }: any) {
    const colors: any = {
        rose: "text-rose-400 border-rose-500/20 bg-rose-500/5",
        indigo: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
        emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
    };

    const all = [...(items || []), ...(custom || [])].filter(Boolean);

    return (
        <div className={`p-8 rounded-[2.5rem] border space-y-6 ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <FiCheckCircle /> {title}
            </p>
            <div className="space-y-3">
                {all.length === 0 ? (
                    <p className="text-[10px] text-gray-600 italic font-medium">No recorded data nodes.</p>
                ) : (
                    all.map((item, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-1 h-1 rounded-full bg-white/20 mt-1.5 shrink-0" />
                            <p className="text-[11px] font-medium text-gray-400 leading-relaxed">{item}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

import { Building2 as FiZap2 } from 'lucide-react';
function FiZap(props: any) { return <span {...props}><FiActivity /></span>; }