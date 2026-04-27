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
import DashboardLayout from '../../dashboard/DashboardLayout';

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

    if (loading && reports.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <HashLoader color="#3b82f6" size={50} />
                <p className="mt-6 text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Compiling Activity Logs...</p>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex-1 overflow-hidden flex flex-col gap-10">
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-calsans text-slate-900">Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Database</span></h1>
                            <p className="text-slate-500 text-sm font-light italic leading-relaxed">Arsip digital seluruh laporan operasional P2MKP yang telah tersinkronisasi.</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={loadReports}
                                className={`p-4 rounded-xl bg-white border border-slate-200 text-blue-600 hover:bg-slate-50 transition-all shadow-sm ${loading ? 'animate-pulse' : ''}`}
                            >
                                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                            </button>
                            <div className="relative group w-full md:w-[350px]">
                                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by Institution..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-xs focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 text-slate-800 shadow-sm h-14"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-8">
                    {/* List Sidebar */}
                    <div className="lg:w-[380px] flex flex-col gap-4 overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Sync Results ({filteredReports.length})</p>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {loading && reports.length === 0 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-100" />
                                ))
                            ) : filteredReports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center p-8">
                                    <FiDatabase className="text-slate-200 mb-4" size={40} />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching logs found</p>
                                </div>
                            ) : (
                                filteredReports.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedReport(r)}
                                        className={`w-full p-6 rounded-[2rem] border transition-all relative group text-left ${selectedReport?.id === r.id ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20' : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedReport?.id === r.id ? 'bg-white/10' : 'bg-blue-50 text-blue-600 shadow-sm'}`}>
                                                <FiFileText />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-xs font-bold truncate ${selectedReport?.id === r.id ? 'text-white' : 'text-slate-800'}`}>{r.namaP2MKP}</h3>
                                                <p className={`text-[10px] font-medium mt-1 ${selectedReport?.id === r.id ? 'text-blue-100' : 'text-slate-500'}`}>{r.namaKetua}</p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter opacity-70">
                                                        <FiClock /> {formatDate(r.createdAt)}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${selectedReport?.id === r.id ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-200 text-slate-500'} border`}>
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
                    <div className="flex-1 overflow-hidden min-h-0 bg-white border border-slate-200 rounded-[3.5rem] relative shadow-sm">
                        <AnimatePresence mode="wait">
                            {selectedReport ? (
                                <motion.div
                                    key={selectedReport.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col p-10 overflow-hidden"
                                >
                                    <div className="pb-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl text-blue-600 shadow-sm">
                                                <FiLayout />
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-3xl font-calsans text-slate-900">{selectedReport.namaP2MKP}</h2>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{selectedReport.namaKetua} • Registry Instance</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => Toast.fire({ icon: 'info', title: 'PDF Core Triggered', text: 'Generating high-fidelity document blueprint.' })}
                                                className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center gap-3 shadow-lg shadow-emerald-500/20"
                                            >
                                                <FiDownload /> DOWNLOAD ARCHIVE
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pt-10 space-y-12 pr-4 custom-scrollbar">
                                        {/* Summary Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 space-y-4">
                                                <div className="flex items-center gap-3 text-blue-600">
                                                    <FiBriefcase />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Business Domain</p>
                                                </div>
                                                <p className="text-xs text-slate-600 leading-relaxed italic">{selectedReport.bidangUsaha || 'No domain description provided.'}</p>
                                            </div>
                                            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 space-y-4">
                                                <div className="flex items-center gap-3 text-indigo-600">
                                                    <FiMapPin />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">HQ Location</p>
                                                </div>
                                                <p className="text-xs text-slate-600 leading-relaxed truncate">{selectedReport.alamatP2MKP || 'No location data.'}</p>
                                            </div>
                                        </div>

                                        {/* Pelatihan Section */}
                                        <div className="space-y-6">
                                            <SectionSubHeader icon={<FiZap />} title="Training Deliverables" count={selectedReport.pelatihan?.length} />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {selectedReport.pelatihan?.map((p, i) => (
                                                    <div key={i} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all group shadow-sm">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.jenis}</h4>
                                                            <span className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase"><FiClock /> {p.waktu}</span>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <DataPoint label="Attendees" value={`${p.jumlahPeserta} Practitioners`} />
                                                            <DataPoint label="Location" value={p.lokasi} />
                                                            <div className="flex flex-wrap gap-2 mt-4">
                                                                {p.materi?.map((m, j) => (
                                                                    <span key={j} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[8px] text-slate-500 font-bold uppercase shadow-sm">{m}</span>
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
                                                    <div key={i} className="flex items-center gap-4 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs shadow-sm">0{i + 1}</div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{p.nama}</p>
                                                            <p className="text-[8px] text-slate-400 font-black uppercase mt-0.5">{p.keahlian} • {p.sertifikasi}</p>
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
                                    <div className="w-40 h-40 rounded-[3rem] border border-dashed border-slate-400 flex items-center justify-center mb-8">
                                        <FiDatabase size={80} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-calsans uppercase tracking-widest text-slate-400">Select Access Node</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Pilih laporan di sidebar untuk eksposisi data terperinci</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Subcomponents
function SectionSubHeader({ icon, title, count }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">{icon}</div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{title} <span className="text-blue-600 ml-2">[{count || 0}]</span></h3>
            <div className="flex-1 h-px bg-slate-100 ml-4" />
        </div>
    );
}

function DataPoint({ label, value }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-[11px] font-bold text-slate-600">{value || '-'}</p>
        </div>
    );
}

function IntelligenceCard({ title, items, custom, color }: any) {
    const colors: any = {
        rose: "text-rose-600 border-rose-100 bg-rose-50",
        indigo: "text-indigo-600 border-indigo-100 bg-indigo-50",
        emerald: "text-emerald-600 border-emerald-100 bg-emerald-50"
    };

    const all = [...(items || []), ...(custom || [])].filter(Boolean);

    return (
        <div className={`p-8 rounded-[2.5rem] border space-y-6 ${colors[color]} shadow-sm`}>
            <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <FiCheckCircle /> {title}
            </p>
            <div className="space-y-3">
                {all.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic font-medium">No recorded data nodes.</p>
                ) : (
                    all.map((item, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0 opacity-20" />
                            <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{item}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

import { Building2 as FiZap2 } from 'lucide-react';
function FiZap(props: any) { return <span {...props}><FiActivity /></span>; }