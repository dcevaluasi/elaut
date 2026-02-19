'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus,
    FiFileText,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiBox,
    FiActivity,
    FiAward,
    FiUser,
    FiLogOut,
    FiMenu,
    FiX,
    FiSearch,
    FiBell,
    FiChevronRight,
    FiEdit,
    FiLayout,
    FiCalendar,
    FiDatabase,
    FiEye,
    FiShield
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
import axios from 'axios';
import { elautBaseUrl } from '@/constants/urls';
import Toast from '@/commons/Toast';

export default function PenetapanP2MKPPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [p2mkpData, setP2mkpData] = useState<any>(null);
    const [penetapanData, setPenetapanData] = useState<any[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const checkProfileCompletion = async () => {
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
                    const essentialFields = [
                        'nama_ppmkp', 'Nib', 'alamat', 'provinsi', 'kota',
                        'kecamatan', 'kelurahan', 'no_telp',
                        'nama_penanggung_jawab', 'no_telp_penanggung_jawab'
                    ];

                    const isComplete = essentialFields.every(field => {
                        const value = data[field];
                        return value !== null && value !== undefined && value !== "" && value !== "null";
                    });

                    if (!isComplete) {
                        Toast.fire({
                            icon: 'info',
                            title: 'Lengkapi Profil',
                            text: 'Silakan lengkapi data profil lembaga Anda terlebih dahulu.'
                        });
                        router.push('/p2mkp/dashboard/complete-profile');
                    } else {
                        setP2mkpData(data);
                        // Fetch Penetapan Data
                        const id_p2mkp = data.IdPpmkp || data.id_p2mkp || data.id;
                        if (id_p2mkp) {
                            fetchPenetapanData(id_p2mkp, token);
                        }
                    }
                }
            } catch (error) {
                console.error('Profile check error:', error);
            }
        };

        const fetchPenetapanData = async (id: string, token: string) => {
            setIsDataLoading(true);
            try {
                const response = await axios.get(`${elautBaseUrl}/p2mkp/get_pengjuan_penetapan_p2mkp?id_p2mkp=${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.status === 200) {
                    const data = response.data.data || (Array.isArray(response.data) ? response.data : []);
                    setPenetapanData(data);
                }
            } catch (error) {
                console.error('Error fetching penetapan data:', error);
            } finally {
                setIsDataLoading(false);
            }
        };

        if (!loading) {
            checkProfileCompletion();
        }
    }, [loading, router]);

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

    // Format data for display
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'dikirim':
            case 'diajukan':
                return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'diverifikasi':
            case 'proses':
                return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'disetujui':
            case 'aktif':
            case 'selesai':
                return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'ditolak':
                return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'perbaikan':
                return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default:
                return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const hasPending = penetapanData.some(item => {
        const s = (item.status || item.Status || 'diajukan').toLowerCase();
        return ['diajukan', 'dikirim', 'proses', 'diverifikasi', 'pending', 'menunggu', 'perbaikan'].includes(s);
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
                <HashLoader color="#3b82f6" size={50} />
                <p className="mt-6 text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Auditing Compliance Status...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex font-jakarta overflow-hidden">
            {/* Ambient Ambient */}
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
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Portal</p>
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
                            <SidebarItem href="/p2mkp/dashboard/penetapan" icon={<FiAward />} label="Penetapan P2MKP" active />
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
                            <Link href="/p2mkp/dashboard" className="text-gray-500 hover:text-white transition-colors">Dashboard</Link>
                            <span className="text-gray-700">/</span>
                            <span className="text-blue-400">Penetapan Management</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
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
                                <DropdownMenuItem onClick={handleLogout} className="p-3 rounded-xl hover:bg-rose-500/10 cursor-pointer text-rose-400 text-xs font-black tracking-widest">
                                    <FiLogOut className="mr-3" size={16} /> LOGOUT SESSION
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12 pt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-6xl mx-auto space-y-12 pb-24"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="space-y-0">
                                <h1 className="text-4xl md:text-5xl leading-none font-calsans">Penetapan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">P2MKP</span></h1>
                                <p className="text-gray-500 text-sm font-light italic leading-relaxed">Kelola legalitas dan status sertifikasi lembaga Anda dalam satu pusat kontrol.</p>
                            </div>
                            {!isDataLoading && !hasPending && (
                                <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                                    <button className="group relative h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center gap-3 overflow-hidden active:scale-95">
                                        <FiPlus size={20} className="group-hover:rotate-90 transition-transform" />
                                        NEW SUBMISSION
                                        <div className="absolute inset-0 w-12 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[600%] transition-transform duration-1000" />
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* Submissions List */}
                        {penetapanData.length > 0 ? (
                            <div className="grid gap-6">
                                {penetapanData.map((item: any, index: number) => (
                                    <motion.div
                                        key={item.IdPengajuan || index}
                                        whileHover={{ y: -5 }}
                                        onClick={() => {
                                            setSelectedSubmission(item);
                                            setIsDetailOpen(true);
                                        }}
                                        className="group p-6 rounded-[2rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 hover:border-white/10 transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                <FiFileText />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-calsans text-xl text-white">Pengajuan Penetapan P2MKP {item.tahun_penetapan || new Date().getFullYear()}</h3>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                                                    <FiCalendar /> {item.create_at ? new Date(item.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            {item.status?.toLowerCase() === 'perbaikan' && (
                                                <Link href="/p2mkp/dashboard/complete-profile" onClick={(e) => e.stopPropagation()}>
                                                    <button className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2 group/edit">
                                                        <FiEdit size={18} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Edit Data</span>
                                                    </button>
                                                </Link>
                                            )}
                                            <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] ${getStatusStyle(item.status || 'Diajukan')}`}>
                                                {item.status || 'Diajukan'}
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                                                <FiChevronRight size={20} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-16 rounded-[3.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-8"
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-600">
                                    <FiFileText size={48} className="animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-calsans">Registry Empty</h3>
                                    <p className="text-gray-500 text-sm max-w-xl font-light leading-relaxed">
                                        Anda belum memiliki record pengajuan penetapan. Inisialisasi pengajuan pertama Anda untuk memulai verifikasi lembaga.
                                    </p>
                                </div>
                                {!isDataLoading && !hasPending && (
                                    <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                                        <button className="h-14 px-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black tracking-widest transition-all flex items-center gap-3">
                                            <FiPlus size={20} /> INITIALIZE SUBMISSION
                                        </button>
                                    </Link>
                                )}
                            </motion.div>
                        )}

                        {/* Informational Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoCard
                                icon={<FiClock />}
                                title="Timeline Verifikasi"
                                description="Proses peninjauan dokumen dan verifikasi lapangan biasanya memakan waktu 14-21 hari kerja setelah pengajuan dinyatakan lengkap."
                                color="amber"
                            />
                            <InfoCard
                                icon={<FiCheckCircle />}
                                title="Kriteria Kelulusan"
                                description="Pastikan seluruh dokumen legalitas dan kelayakan teknis telah sesuai dengan standar P2MKP untuk mempercepat proses penetapan."
                                color="emerald"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Detail Modal Overlay */}
                <AnimatePresence>
                    {isDetailOpen && selectedSubmission && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-white">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDetailOpen(false)}
                                className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
                            >
                                {/* Modal Header */}
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                            <FiFileText size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-calsans">Detail <span className="text-blue-400 font-bold">Pengajuan</span></h2>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mt-1">Submission Information Matrix</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsDetailOpen(false)}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <DetailMetaCard
                                            label="Status Verifikasi"
                                            value={selectedSubmission.status || 'Diajukan'}
                                            highlight
                                            status={selectedSubmission.status}
                                        />
                                        <DetailMetaCard
                                            label="Tahun Penetapan"
                                            value={selectedSubmission.tahun_penetapan || '2024'}
                                        />
                                        <DetailMetaCard
                                            label="Klasifikasi LPK"
                                            value={selectedSubmission.is_lpk === 'Ya' ? 'LPK Terverifikasi' : 'Non-LPK'}
                                        />
                                        <DetailMetaCard
                                            label="Tanggal Diajukan"
                                            value={selectedSubmission.create_at ? new Date(selectedSubmission.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-3 pl-1">
                                            <FiShield className="text-blue-400" size={14} />
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Digital Assets Portfolio</h4>
                                        </div>
                                        <div className="grid gap-3">
                                            <DocumentLink label="Identifikasi Pemilik" url={selectedSubmission.DokumenIdentifikasiPemilik} />
                                            <DocumentLink label="Asesmen Mandiri" url={selectedSubmission.DokumenAsesmentMandiri} />
                                            <DocumentLink label="Surat Pernyataan Mutu" url={selectedSubmission.DokumentSuratPernyataan} />
                                            <DocumentLink label="Legalitas Usaha" url={selectedSubmission.DokumenKeteranganUsaha} />
                                            <DocumentLink label="Afiliasi Politik" url={selectedSubmission.DokumenAfiliasiParpol} />
                                            <DocumentLink label="Rekomendasi Satker" url={selectedSubmission.DokumenRekomendasiDinas} />
                                            <DocumentLink label="Permohonan Pembentukan" url={selectedSubmission.DokumenPermohonanPembentukan} />
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-8 bg-[#020617]/50 border-t border-white/5 flex justify-end">
                                    <button
                                        onClick={() => setIsDetailOpen(false)}
                                        className="group px-8 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                    >
                                        CLOSE VIEWPORT
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function DetailMetaCard({ label, value, highlight, status }: any) {
    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'dikirim':
            case 'diajukan': return 'text-blue-400';
            case 'diverifikasi':
            case 'proses': return 'text-amber-400';
            case 'disetujui':
            case 'aktif': return 'text-emerald-400';
            case 'ditolak': return 'text-rose-400';
            default: return 'text-white';
        }
    };

    return (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-1 hover:bg-white/[0.07] transition-colors">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-tighter">{label}</p>
            <p className={`text-sm font-bold ${highlight ? getStatusStyle(status) : 'text-white'} uppercase tracking-wider`}>
                {value}
            </p>
        </div>
    );
}

function DocumentLink({ label, url }: { label: string, url: string }) {
    if (!url) return null;
    const fullUrl = url.startsWith('http') ? url : `${elautBaseUrl}/storage/${url}`;

    return (
        <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 transition-all active:scale-[0.98]"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg shadow-blue-500/5">
                    <FiEye size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Document Type</span>
                    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{label}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">PREVIEW</span>
                <FiChevronRight className="text-gray-700 group-hover:text-blue-400 transition-colors" />
            </div>
        </a>
    );
}

// Visual Sidebar Item
function SidebarItem({ href, icon, label, active }: any) {
    return (
        <Link href={href} className="block px-4 text-white">
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

// Info Card Component
function InfoCard({ icon, title, description, color }: any) {
    const colors: any = {
        amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    };

    return (
        <div className="p-8 rounded-[2.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 space-y-4 text-white">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${colors[color]}`}>
                {icon}
            </div>
            <h4 className="text-xl font-calsans">{title}</h4>
            <p className="text-xs text-gray-500 font-light leading-relaxed">{description}</p>
        </div>
    );
}
