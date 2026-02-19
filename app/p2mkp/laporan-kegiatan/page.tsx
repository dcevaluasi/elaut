'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus,
    FiTrash2,
    FiDownload,
    FiSave,
    FiBox,
    FiActivity,
    FiAward,
    FiUser,
    FiLogOut,
    FiMenu,
    FiX,
    FiChevronRight,
    FiChevronLeft,
    FiFileText,
    FiZap,
    FiTarget,
    FiLink,
    FiLayout,
    FiStar,
    FiDatabase
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
import { saveReport } from '@/utils/p2mkp';

// Types
interface Pelatih {
    nama: string;
    keahlian: string;
    sertifikasi: string;
}

interface Penghargaan {
    nama: string;
    instansi: string;
    tahun: string;
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

interface Mitra {
    nama: string;
    alamat: string;
    jenisKemitraan: string;
}

interface ReportData {
    namaP2MKP: string;
    tanggalBerdiri: string;
    alamatP2MKP: string;
    namaKetua: string;
    latarBelakang: string;
    bidangUsaha: string;
    pelatih: Pelatih[];
    penghargaan: Penghargaan[];
    pelatihan: Pelatihan[];
    tantangan: string[];
    tantanganCustom: string[];
    upaya: string[];
    upayaCustom: string[];
    dampak: string[];
    dampakCustom: string[];
    mitra: Mitra[];
    harapanUsaha: string[];
    harapanPelatihan: string[];
}

const TANTANGAN_OPTIONS = [
    'Keterbatasan modal usaha',
    'Sulitnya pemasaran produk',
    'Kurangnya minat masyarakat',
    'Akses bahan baku terbatas',
    'Peralatan pelatihan tidak memadai',
    'Dukungan pemerintah minim',
    'Tenaga pelatih terbatas',
    'Cuaca ekstrem / bencana',
    'Manajemen keuangan belum baik'
];

const UPAYA_OPTIONS = [
    'Menjalin kemitraan',
    'Pelatihan lanjutan bagi alumni',
    'Promosi produk di pameran/media',
    'Membentuk koperasi/kelompok usaha',
    'Pelatihan inovasi produk',
    'Peningkatan kapasitas instruktur',
    'Penggunaan teknologi tepat guna',
    'Pendampingan berkelanjutan'
];

const DAMPAK_OPTIONS = [
    'Meningkatnya keterampilan masyarakat',
    'Terciptanya lapangan kerja baru',
    'Peningkatan pendapatan keluarga',
    'Terbentuknya KUB produktif',
    'Kesadaran pengelolaan sumber daya',
    'Diversifikasi produk bernilai tambah',
    'Pengurangan pengangguran',
    'Peningkatan peran perempuan',
    'Tumbuhnya jiwa kewirausahaan'
];

export default function P2MKPReportApp() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

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
                    }
                }
            } catch (error) {
                console.error('Profile check error:', error);
            }
        };

        if (!loading) {
            checkProfileCompletion();
        }
    }, [loading, router]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

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

    const [data, setData] = useState<ReportData>({
        namaP2MKP: '',
        tanggalBerdiri: '',
        alamatP2MKP: '',
        namaKetua: '',
        latarBelakang: '',
        bidangUsaha: '',
        pelatih: [{ nama: '', keahlian: '', sertifikasi: '' }],
        penghargaan: [{ nama: '', instansi: '', tahun: '' }],
        pelatihan: [{ jenis: '', waktu: '', lokasi: '', jumlahPeserta: 0, instansiPeserta: '', materi: [''], sumberAnggaran: '' }],
        tantangan: [],
        tantanganCustom: [],
        upaya: [],
        upayaCustom: [],
        dampak: [],
        dampakCustom: [],
        mitra: [{ nama: '', alamat: '', jenisKemitraan: '' }],
        harapanUsaha: [''],
        harapanPelatihan: ['']
    });

    const addItem = (field: keyof ReportData, defaultValue: any) => {
        setData({ ...data, [field]: [...(data[field] as any[]), defaultValue] });
    };

    const removeItem = (field: keyof ReportData, index: number) => {
        const items = [...(data[field] as any[])];
        items.splice(index, 1);
        setData({ ...data, [field]: items });
    };

    const updateItem = (field: keyof ReportData, index: number, value: any) => {
        const items = [...(data[field] as any[])];
        items[index] = value;
        setData({ ...data, [field]: items });
    };

    const toggleCheckbox = (field: 'tantangan' | 'upaya' | 'dampak', value: string) => {
        const current = data[field];
        if (current.includes(value)) {
            setData({ ...data, [field]: current.filter(item => item !== value) });
        } else {
            setData({ ...data, [field]: [...current, value] });
        }
    };

    const saveReportUI = async () => {
        setSaving(true);
        try {
            await saveReport(data);
            await new Promise(resolve => setTimeout(resolve, 1500));
            Toast.fire({
                icon: 'success',
                title: 'Data Archetyped',
                text: 'Laporan kerja berhasil disinkronisasi ke server pusat.'
            });
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: 'Connection Lost',
                text: 'Gagal mengamankan data laporan.'
            });
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const generatePDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const allTantangan = [...data.tantangan, ...data.tantanganCustom].filter(Boolean);
        const allUpaya = [...data.upaya, ...data.upayaCustom].filter(Boolean);
        const allDampak = [...data.dampak, ...data.dampakCustom].filter(Boolean);

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan P2MKP</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          h1 { text-align: center; font-size: 18px; margin-bottom: 30px; }
          h2 { font-size: 16px; margin-top: 30px; }
          h3 { font-size: 14px; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
          .page-break { page-break-after: always; }
          p { text-align: justify; }
          ul { margin-left: 20px; }
          .info-table { margin: 20px 0; }
          .info-table td { border: 1px solid #000; padding: 8px; }
          .info-label { font-weight: bold; width: 30%; background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h1>LAPORAN KEGIATAN<br/>PUSAT PELATIHAN MANDIRI KELAUTAN DAN PERIKANAN (P2MKP)</h1>
        
        <h2>BAB I - PENDAHULUAN</h2>
        <table class="info-table">
          <tr><td class="info-label">Nama P2MKP</td><td>${data.namaP2MKP || '-'}</td></tr>
        </table>
        
        <h3>1.1 BIDANG USAHA DAN PELATIHAN</h3>
        <p>${data.bidangUsaha || '-'}</p>
        
        <h3>1.2 DAFTAR PELATIH</h3>
        <table>
          <tr><th>No</th><th>Nama</th><th>Keahlian</th><th>Sertifikasi</th></tr>
          ${data.pelatih.map((p, i) => `<tr><td>${i + 1}</td><td>${p.nama}</td><td>${p.keahlian}</td><td>${p.sertifikasi}</td></tr>`).join('')}
        </table>
        
        <div class="page-break"></div>
        <h2>BAB II - PELAKSANAAN PELATIHAN</h2>
        <table>
          <tr><th>No</th><th>Jenis</th><th>Waktu</th><th>Lokasi</th><th>Peserta</th><th>Anggaran</th></tr>
          ${data.pelatihan.map((p, i) => `<tr><td>${i + 1}</td><td>${p.jenis}</td><td>${p.waktu}</td><td>${p.lokasi}</td><td>${p.jumlahPeserta}</td><td>${p.sumberAnggaran}</td></tr>`).join('')}
        </table>
      </body>
      </html>
    `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
                <HashLoader color="#3b82f6" size={50} />
                <p className="mt-6 text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Compiling Activity Logs...</p>
            </div>
        );
    }

    const steps = [
        { label: 'BAB I', sub: 'Pendahuluan', icon: <FiFileText /> },
        { label: 'BAB II', sub: 'Pelaksanaan', icon: <FiZap /> },
        { label: 'BAB III', sub: 'Dampak', icon: <FiTarget /> },
        { label: 'BAB IV', sub: 'Jejaring', icon: <FiLink /> },
        { label: 'BAB V', sub: 'Penutup', icon: <FiAward /> }
    ];

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
                            <SidebarItem href="/p2mkp/dashboard/penetapan" icon={<FiAward />} label="Penetapan P2MKP" />
                        </div>

                        <div className="space-y-1">
                            <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Reports</p>
                            <SidebarItem href="/p2mkp/laporan-kegiatan" icon={<FiFileText />} label="Create Report" active />
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
                            <span className="text-blue-400">Activity Report</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex gap-3">
                            <button
                                onClick={saveReportUI}
                                disabled={saving}
                                className="h-12 px-6 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <FiSave /> {saving ? 'SYNCING...' : 'PERSIST'}
                            </button>
                            <button
                                onClick={generatePDF}
                                className="h-12 px-6 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all flex items-center gap-2"
                            >
                                <FiDownload /> EXPORT PDF
                            </button>
                        </div>

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
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-6xl mx-auto space-y-12 pb-24"
                    >
                        {/* Title Section */}
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-calsans">Activity <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Archiver</span></h1>
                            <p className="text-gray-500 text-sm font-light italic leading-relaxed max-w-2xl">Digitalisasi laporan periodik untuk monitoring efektivitas pelatihan P2MKP Terpadu.</p>
                        </div>

                        {/* Step Navigator */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {steps.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setStep(i + 1)}
                                    className={`relative p-5 rounded-2xl border transition-all duration-300 group overflow-hidden ${step === i + 1
                                        ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                >
                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                        <div className={`text-xl transition-transform group-hover:scale-110 ${step === i + 1 ? 'text-white' : 'text-gray-600 group-hover:text-blue-400'}`}>
                                            {s.icon}
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-[10px] font-black tracking-widest ${step === i + 1 ? 'text-blue-100' : 'text-gray-600'}`}>STEP 0{i + 1}</p>
                                            <p className={`text-xs font-bold ${step === i + 1 ? 'text-white' : 'text-gray-400'}`}>{s.sub}</p>
                                        </div>
                                    </div>
                                    {step === i + 1 && (
                                        <motion.div layoutId="stepGlow" className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-none" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Form Container */}
                        <div className="p-8 md:p-12 rounded-[3.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 shadow-2xl relative overflow-hidden transition-all duration-700 hover:border-white/10 min-h-[500px]">

                            <AnimatePresence mode="wait">
                                {/* BAB I */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-12"
                                    >
                                        <SectionHeader icon={<FiFileText />} title="Pendahuluan" subtitle="Metadata fundamental lembaga P2MKP" />

                                        <div className="space-y-10">
                                            <div className="space-y-4">
                                                <Label text="Nama Lengkap P2MKP" />
                                                <CustomInput
                                                    value={data.namaP2MKP}
                                                    onChange={(v: any) => setData({ ...data, namaP2MKP: v })}
                                                    placeholder="Nama resmi lembaga..."
                                                    icon={<FiBox />}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <Label text="1.1 Bidang Usaha & Deskripsi Pelatihan" />
                                                <CustomTextArea
                                                    value={data.bidangUsaha}
                                                    onChange={(v: any) => setData({ ...data, bidangUsaha: v })}
                                                    placeholder="Deskripsikan fokus utama usaha dan core pelatihan anda..."
                                                    rows={4}
                                                />
                                            </div>

                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <Label text="1.2 Daftar Pelatih" />
                                                    <button onClick={() => addItem('pelatih', { nama: '', keahlian: '', sertifikasi: '' })} className="flex items-center gap-2 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors tracking-widest uppercase">
                                                        <FiPlus /> ADD EXPERT
                                                    </button>
                                                </div>
                                                {data.pelatih.map((p, i) => (
                                                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl relative group">
                                                        <CustomInput value={p.nama} onChange={(v: any) => updateItem('pelatih', i, { ...p, nama: v })} placeholder="Full Name" />
                                                        <CustomInput value={p.keahlian} onChange={(v: any) => updateItem('pelatih', i, { ...p, keahlian: v })} placeholder="Core Expertise" />
                                                        <div className="flex gap-2">
                                                            <CustomInput value={p.sertifikasi} onChange={(v: any) => updateItem('pelatih', i, { ...p, sertifikasi: v })} placeholder="Certification" className="flex-1" />
                                                            <button onClick={() => removeItem('pelatih', i)} className="p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all">
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <Label text="1.3 Penghargaan & Pencapaian" />
                                                    <button onClick={() => addItem('penghargaan', { nama: '', instansi: '', tahun: '' })} className="flex items-center gap-2 text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors tracking-widest uppercase">
                                                        <FiPlus /> ADD AWARD
                                                    </button>
                                                </div>
                                                {data.penghargaan.map((p, i) => (
                                                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl relative group">
                                                        <CustomInput value={p.nama} onChange={(v: any) => updateItem('penghargaan', i, { ...p, nama: v })} placeholder="Award Name" />
                                                        <CustomInput value={p.instansi} onChange={(v: any) => updateItem('penghargaan', i, { ...p, instansi: v })} placeholder="Issuing Authority" />
                                                        <div className="flex gap-2">
                                                            <CustomInput value={p.tahun} onChange={(v: any) => updateItem('penghargaan', i, { ...p, tahun: v })} placeholder="Year" />
                                                            <button onClick={() => removeItem('penghargaan', i)} className="p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all">
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* BAB II */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-12"
                                    >
                                        <SectionHeader icon={<FiZap />} title="Pelaksanaan" subtitle="Log operasional kegiatan pelatihan" />

                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between">
                                                <Label text="Daftar Pelatihan Terlaksana" />
                                                <button onClick={() => addItem('pelatihan', { jenis: '', waktu: '', lokasi: '', jumlahPeserta: 0, instansiPeserta: '', materi: [''], sumberAnggaran: '' })} className="flex items-center gap-2 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors tracking-widest uppercase">
                                                    <FiPlus /> NEW ACTIVITY
                                                </button>
                                            </div>

                                            {data.pelatihan.map((p, i) => (
                                                <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] relative group space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <CustomInput value={p.jenis} onChange={(v: any) => updateItem('pelatihan', i, { ...p, jenis: v })} label="Tipe Pelatihan" placeholder="Ex: Budidaya..." />
                                                        <CustomInput value={p.waktu} onChange={(v: any) => updateItem('pelatihan', i, { ...p, waktu: v })} label="Timeline" placeholder="DD-MM-YYYY" />
                                                        <CustomInput value={p.lokasi} onChange={(v: any) => updateItem('pelatihan', i, { ...p, lokasi: v })} label="Lokasi Strategis" placeholder="City / Facility..." />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <CustomInput type="number" value={p.jumlahPeserta} onChange={(v: any) => updateItem('pelatihan', i, { ...p, jumlahPeserta: parseInt(v) })} label="Volume Peserta" placeholder="0" />
                                                            <CustomInput value={p.sumberAnggaran} onChange={(v: any) => updateItem('pelatihan', i, { ...p, sumberAnggaran: v })} label="Sumber Dana" placeholder="APBN/Self..." />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Silabus / Materi</p>
                                                            <button onClick={() => updateItem('pelatihan', i, { ...p, materi: [...p.materi, ''] })} className="text-[9px] font-bold text-blue-400 uppercase">Add Row</button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {p.materi.map((m, j) => (
                                                                <div key={j} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl group/materi border border-white/5 hover:border-blue-500/30 transition-all">
                                                                    <input value={m} onChange={(e) => {
                                                                        const nM = [...p.materi]; nM[j] = e.target.value; updateItem('pelatihan', i, { ...p, materi: nM });
                                                                    }} className="bg-transparent border-none outline-none text-xs text-white placeholder:text-gray-700 w-32" placeholder="Subject..." />
                                                                    <button onClick={() => {
                                                                        const nM = p.materi.filter((_, x) => x !== j); updateItem('pelatihan', i, { ...p, materi: nM });
                                                                    }} className="text-gray-700 hover:text-rose-500"><FiX /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <button onClick={() => removeItem('pelatihan', i)} className="absolute top-6 right-6 p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all">
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* BAB III */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-12"
                                    >
                                        <SectionHeader icon={<FiTarget />} title="Tantangan & Dampak" subtitle="Analisa problematik dan impact sosial" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-8">
                                                <Label text="Tantangan Lapangan" />
                                                <div className="space-y-3">
                                                    {TANTANGAN_OPTIONS.map(opt => (
                                                        <Checkbox key={opt} label={opt} checked={data.tantangan.includes(opt)} onChange={() => toggleCheckbox('tantangan', opt)} />
                                                    ))}
                                                </div>
                                                <CustomPillInput values={data.tantanganCustom} onChange={(v: any) => setData({ ...data, tantanganCustom: v })} placeholder="Custom challenge..." />
                                            </div>

                                            <div className="space-y-8">
                                                <Label text="Upaya Mitigasi" />
                                                <div className="space-y-3">
                                                    {UPAYA_OPTIONS.map(opt => (
                                                        <Checkbox key={opt} label={opt} checked={data.upaya.includes(opt)} onChange={() => toggleCheckbox('upaya', opt)} color="indigo" />
                                                    ))}
                                                </div>
                                                <CustomPillInput values={data.upayaCustom} onChange={(v: any) => setData({ ...data, upayaCustom: v })} placeholder="Custom solution..." color="indigo" />
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-white/5 space-y-8">
                                            <Label text="Dampak Terhadap Masyarakat" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                                                {DAMPAK_OPTIONS.map(opt => (
                                                    <Checkbox key={opt} label={opt} checked={data.dampak.includes(opt)} onChange={() => toggleCheckbox('dampak', opt)} color="emerald" />
                                                ))}
                                            </div>
                                            <CustomPillInput values={data.dampakCustom} onChange={(v: any) => setData({ ...data, dampakCustom: v })} placeholder="Additional impact..." color="emerald" />
                                        </div>
                                    </motion.div>
                                )}

                                {/* BAB IV */}
                                {step === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-12"
                                    >
                                        <SectionHeader icon={<FiLink />} title="Jejaring Usaha" subtitle="Ekosistem kemitraan strategis lembaga" />

                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between">
                                                <Label text="Daftar Mitra Aktif" />
                                                <button onClick={() => addItem('mitra', { nama: '', alamat: '', jenisKemitraan: '' })} className="flex items-center gap-2 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors tracking-widest uppercase">
                                                    <FiPlus /> ADD PARTNER
                                                </button>
                                            </div>

                                            {data.mitra.map((m, i) => (
                                                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-white/5 border border-white/5 rounded-[2rem] relative group">
                                                    <CustomInput value={m.nama} onChange={(v: any) => updateItem('mitra', i, { ...m, nama: v })} label="Nama Entitas" placeholder="Company / Group..." />
                                                    <CustomInput value={m.alamat} onChange={(v: any) => updateItem('mitra', i, { ...m, alamat: v })} label="Domisili" placeholder="Location..." />
                                                    <div className="flex gap-4">
                                                        <CustomInput value={m.jenisKemitraan} onChange={(v: any) => updateItem('mitra', i, { ...m, jenisKemitraan: v })} label="Tipe Kerjasama" placeholder="Pemasaran/Modal..." className="flex-1" />
                                                        <button onClick={() => removeItem('mitra', i)} className="mt-8 p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all">
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* BAB V */}
                                {step === 5 && (
                                    <motion.div
                                        key="step5"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-12"
                                    >
                                        <SectionHeader icon={<FiStar />} title="Penutup" subtitle="Visi dan harapan kedepan" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <Label text="Harapan Bidang Usaha" />
                                                    <button onClick={() => addItem('harapanUsaha', '')} className="text-[9px] font-black text-blue-400 uppercase tracking-widest">ADD TARGET</button>
                                                </div>
                                                <div className="space-y-4">
                                                    {data.harapanUsaha.map((h, i) => (
                                                        <div key={i} className="relative group">
                                                            <CustomTextArea value={h} onChange={(v: any) => updateItem('harapanUsaha', i, v)} placeholder="Ekspektasi pertumbuhan unit bisnis..." rows={2} />
                                                            <button onClick={() => removeItem('harapanUsaha', i)} className="absolute top-2 right-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><FiX /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <Label text="Harapan Bidang Pelatihan" />
                                                    <button onClick={() => addItem('harapanPelatihan', '')} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">ADD TARGET</button>
                                                </div>
                                                <div className="space-y-4">
                                                    {data.harapanPelatihan.map((h, i) => (
                                                        <div key={i} className="relative group">
                                                            <CustomTextArea value={h} onChange={(v: any) => updateItem('harapanPelatihan', i, v)} placeholder="Ekspektasi standar kompetensi..." rows={2} />
                                                            <button onClick={() => removeItem('harapanPelatihan', i)} className="absolute top-2 right-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><FiX /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-12 flex flex-col items-center justify-center text-center space-y-8 bg-blue-500/5 rounded-[3rem] p-12 border border-blue-500/10">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20">
                                                <FiSave />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-calsans uppercase tracking-tighter">Ready for Archiving</h3>
                                                <p className="text-gray-500 text-sm max-w-sm">Pastikan seluruh data yang dimasukkan telah akurat dan sesuai dengan fakta di lapangan.</p>
                                            </div>
                                            <button
                                                onClick={saveReportUI}
                                                disabled={saving}
                                                className="group relative h-16 px-12 bg-white text-black rounded-2xl font-black tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3"
                                            >
                                                {saving ? <HashLoader size={20} /> : <><FiSave /> PERSIST & SYNC</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Footer Navigation Buttons Layered Inside for Style */}
                            <div className="mt-12 pt-12 flex justify-between border-t border-white/5 relative z-10">
                                <button
                                    onClick={() => setStep(Math.max(1, step - 1))}
                                    disabled={step === 1}
                                    className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-2xl transition-all font-bold text-[10px] tracking-widest uppercase disabled:opacity-20 disabled:pointer-events-none"
                                >
                                    <FiChevronLeft /> BACKPLANE
                                </button>
                                {step < 5 && (
                                    <button
                                        onClick={() => setStep(Math.min(5, step + 1))}
                                        className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all font-bold text-[10px] tracking-widest uppercase shadow-xl shadow-blue-600/20"
                                    >
                                        NEXT CORE <FiChevronRight />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Internal Components
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

function SectionHeader({ icon, title, subtitle }: any) {
    return (
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-3xl text-blue-400">
                {icon}
            </div>
            <div className="space-y-1">
                <h2 className="text-3xl font-calsans text-white">{title}</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{subtitle}</p>
            </div>
        </div>
    );
}

function Label({ text }: any) {
    return <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">{text}</p>;
}

function CustomInput({ value, onChange, placeholder, icon, label, className = "", ...props }: any) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">{label}</p>}
            <div className="relative group/input">
                {icon && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-blue-400 transition-colors">{icon}</span>}
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full ${icon ? 'pl-12' : 'pl-5'} pr-5 py-6 bg-white/5 border-white/10 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700 text-white h-14`}
                    {...props}
                />
            </div>
        </div>
    );
}

function CustomTextArea({ value, onChange, placeholder, rows = 3 }: any) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-5 py-4 bg-white/5 border-white/10 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700 text-white resize-none"
        />
    );
}

function Checkbox({ label, checked, onChange, color = "blue" }: any) {
    const colors: any = {
        blue: "text-blue-500 focus:ring-blue-500 bg-blue-500/10",
        indigo: "text-indigo-500 focus:ring-indigo-500 bg-indigo-500/10",
        emerald: "text-emerald-500 focus:ring-emerald-500 bg-emerald-500/10"
    };

    return (
        <label className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all cursor-pointer group">
            <div className="relative flex items-center justify-center mt-1">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="appearance-none w-5 h-5 rounded-lg border border-white/20 bg-white/5 checked:bg-blue-600 checked:border-blue-500 transition-all cursor-pointer"
                />
                {checked && <FiX className="absolute text-white pointer-events-none scale-75 rotate-45" />}
            </div>
            <span className={`text-xs font-medium transition-colors ${checked ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{label}</span>
        </label>
    );
}

function CustomPillInput({ values, onChange, placeholder, color = "blue" }: any) {
    const [temp, setTemp] = useState('');

    const colors: any = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {values.map((v: string, i: number) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold ${colors[color]}`}>
                        {v}
                        <button onClick={() => onChange(values.filter((_: any, idx: number) => idx !== i))} className="hover:text-white"><FiX /></button>
                    </div>
                ))}
            </div>
            <div className="relative group">
                <input
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && temp.trim()) {
                            onChange([...values, temp.trim()]);
                            setTemp('');
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full pl-5 pr-12 py-3 bg-white/5 border-white/10 rounded-xl text-[10px] focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700 text-white"
                />
                <button
                    onClick={() => { if (temp.trim()) { onChange([...values, temp.trim()]); setTemp(''); } }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-400"
                >
                    <FiPlus />
                </button>
            </div>
        </div>
    );
}