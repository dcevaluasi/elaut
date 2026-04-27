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
    FiDatabase,
    FiEye
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
import { collection, getDocs, query, orderBy, getFirestore, where } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import DashboardLayout from '../dashboard/DashboardLayout';
import Toast from '@/commons/Toast';
import axios from 'axios';
import { elautBaseUrl } from '@/constants/urls';
import { saveReport } from '@/utils/p2mkp';

const db = getFirestore(firebaseApp);

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
    const [activeView, setActiveView] = useState<'form' | 'history'>('form');
    const [reports, setReports] = useState<ReportData[]>([]);
    const [userData, setUserData] = useState<any>(null);

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
                    const profileData = response.data.data || response.data;
                    setUserData(profileData);

                    // Autofill name
                    setData(prev => ({
                        ...prev,
                        namaP2MKP: profileData.nama_ppmkp || profileData.NamaPpmkp || ''
                    }));

                    const essentialFields = [
                        'nama_ppmkp', 'Nib', 'alamat', 'provinsi', 'kota',
                        'kecamatan', 'kelurahan', 'no_telp',
                        'nama_penanggung_jawab', 'no_telp_penanggung_jawab'
                    ];

                    const isComplete = essentialFields.every(field => {
                        const value = profileData[field];
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

                    // Fetch Reports
                    try {
                        const userName = profileData.nama_ppmkp || profileData.NamaPpmkp;
                        if (userName) {
                            const q = query(
                                collection(db, 'reports'),
                                where('namaP2MKP', '==', userName),
                                orderBy('createdAt', 'desc')
                            );
                            const querySnapshot = await getDocs(q);
                            const loadedReports: any[] = [];
                            querySnapshot.forEach((doc) => {
                                loadedReports.push({ id: doc.id, ...doc.data() });
                            });
                            setReports(loadedReports);
                        }
                    } catch (reportError: any) {
                        console.error('Failed to fetch reports (likely missing index):', reportError);
                    }
                }
            } catch (error: any) {
                console.error('Profile check error:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    Cookies.remove('XSRF091');
                    router.push('/p2mkp/login');
                }
            }
        };

        if (!loading) {
            checkProfileCompletion();
        }
    }, [loading, router]);


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
            // 1. Sanitize data: remove 'id' if it exists to avoid Firestore document conflicts
            const { id, ...cleanData } = data as any;
            
            // 2. Save to Firestore
            await saveReport(cleanData);
            
            // 3. Success Feedback immediately after save succeeds
            Toast.fire({
                icon: 'success',
                title: 'Laporan Tersimpan',
                text: 'Data Anda telah berhasil diamankan di server.'
            });
            
            // 4. Try to refresh history list (silently handle index errors)
            try {
                if (userData?.nama_ppmkp || userData?.NamaPpmkp) {
                    const userName = userData.nama_ppmkp || userData.NamaPpmkp;
                    const q = query(
                        collection(db, 'reports'),
                        where('namaP2MKP', '==', userName),
                        orderBy('createdAt', 'desc')
                    );
                    const querySnapshot = await getDocs(q);
                    const loadedReports: any[] = [];
                    querySnapshot.forEach((doc) => {
                        loadedReports.push({ id: doc.id, ...doc.data() });
                    });
                    setReports(loadedReports);
                }
            } catch (indexError: any) {
                console.warn("Index not ready yet, history will update soon:", indexError);
                // We don't show an error toast here to keep the user experience smooth,
                // as the primary save operation was already successful.
            }
            
            setActiveView('history');

        } catch (error: any) {
            console.error("Save Error:", error);
            Toast.fire({
                icon: 'error',
                title: 'Gagal Menyimpan',
                text: error.message.includes('index') 
                    ? 'Firestore memerlukan index baru. Silakan klik link di console browser Anda.' 
                    : 'Gagal mengamankan data laporan. Periksa koneksi Anda.'
            });
        } finally {
            setSaving(false);
        }
    };

    const generatePDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

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
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <HashLoader color="#3b82f6" size={50} />
                <p className="mt-6 text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Compiling Activity Logs...</p>
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
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-12 pb-24"
            >
                {/* Header Top Replacement */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-calsans text-slate-900">Activity <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Archiver</span></h1>
                        <p className="text-slate-500 text-sm font-light italic leading-relaxed max-w-2xl">Digitalisasi laporan periodik untuk monitoring efektivitas pelatihan P2MKP Terpadu.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mr-4">
                            <button
                                onClick={() => setActiveView('form')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeView === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                NEW REPORT
                            </button>
                            <button
                                onClick={() => setActiveView('history')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeView === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                HISTORY ({reports.length})
                            </button>
                        </div>

                        {activeView === 'form' && (
                            <>
                                <button
                                    onClick={saveReportUI}
                                    disabled={saving}
                                    className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                                >
                                    <FiSave /> {saving ? 'SYNCING...' : 'PERSIST'}
                                </button>
                                <button
                                    onClick={generatePDF}
                                    className="h-12 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <FiDownload /> EXPORT PDF
                                </button>
                            </>
                        )}
                    </div>
                </div>




                {/* Step Navigator */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {steps.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => setStep(i + 1)}
                            className={`relative p-5 rounded-2xl border transition-all duration-300 group overflow-hidden ${step === i + 1
                                ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20'
                                : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                        >
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`text-xl transition-transform group-hover:scale-110 ${step === i + 1 ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`}>
                                    {s.icon}
                                </div>
                                <div className="text-center">
                                    <p className={`text-[10px] font-black tracking-widest ${step === i + 1 ? 'text-blue-100' : 'text-slate-400'}`}>STEP 0{i + 1}</p>
                                    <p className={`text-xs font-bold ${step === i + 1 ? 'text-white' : 'text-slate-500'}`}>{s.sub}</p>
                                </div>
                            </div>
                            {step === i + 1 && (
                                <motion.div layoutId="stepGlow" className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-none" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Form Container */}
                <div className="p-8 md:p-12 rounded-[3.5rem] bg-white border border-slate-200 shadow-2xl relative overflow-hidden transition-all duration-700 hover:border-slate-300 min-h-[500px]">

                    <AnimatePresence mode="wait">
                        {activeView === 'history' ? (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <SectionHeader icon={<FiDatabase />} title="Report History" subtitle="Arsip laporan yang telah anda sinkronisasi" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reports.length === 0 ? (
                                        <div className="col-span-2 py-20 flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                                <FiDatabase size={32} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No reports archived yet.</p>
                                        </div>
                                    ) : (
                                        reports.map((r: any) => (
                                            <div key={r.id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all group flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                                        <FiFileText size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-800">{r.namaP2MKP}</h4>
                                                        <p className="text-[10px] text-slate-500 font-medium">{new Date(r.createdAt?.toDate ? r.createdAt.toDate() : r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        // Populate form with this data if needed, or just download
                                                        setData(r);
                                                        setActiveView('form');
                                                        Toast.fire({ icon: 'success', title: 'Data Loaded', text: 'Detail laporan telah dimuat ke form.' });
                                                    }}
                                                    className="p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl text-blue-600 transition-all border border-slate-100 shadow-sm"
                                                >
                                                    <FiEye />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <>
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
                                                    readOnly
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
                                                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50 border border-slate-200 rounded-3xl relative group">
                                                        <CustomInput value={p.nama} onChange={(v: any) => updateItem('pelatih', i, { ...p, nama: v })} placeholder="Full Name" />
                                                        <CustomInput value={p.keahlian} onChange={(v: any) => updateItem('pelatih', i, { ...p, keahlian: v })} placeholder="Core Expertise" />
                                                        <div className="flex gap-2">
                                                            <CustomInput value={p.sertifikasi} onChange={(v: any) => updateItem('pelatih', i, { ...p, sertifikasi: v })} placeholder="Certification" className="flex-1" />
                                                            <button onClick={() => removeItem('pelatih', i)} className="p-4 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-100">
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
                                                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50 border border-slate-200 rounded-3xl relative group">
                                                        <CustomInput value={p.nama} onChange={(v: any) => updateItem('penghargaan', i, { ...p, nama: v })} placeholder="Award Name" />
                                                        <CustomInput value={p.instansi} onChange={(v: any) => updateItem('penghargaan', i, { ...p, instansi: v })} placeholder="Issuing Authority" />
                                                        <div className="flex gap-2">
                                                            <CustomInput value={p.tahun} onChange={(v: any) => updateItem('penghargaan', i, { ...p, tahun: v })} placeholder="Year" />
                                                            <button onClick={() => removeItem('penghargaan', i)} className="p-4 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-100">
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
                                                <div key={i} className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] relative group space-y-8">
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
                                                                <div key={j} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl group/materi border border-slate-200 hover:border-blue-500/30 transition-all shadow-sm">
                                                                    <input value={m} onChange={(e) => {
                                                                        const nM = [...p.materi]; nM[j] = e.target.value; updateItem('pelatihan', i, { ...p, materi: nM });
                                                                    }} className="bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400 w-32" placeholder="Subject..." />
                                                                    <button onClick={() => {
                                                                        const nM = p.materi.filter((_, x) => x !== j); updateItem('pelatihan', i, { ...p, materi: nM });
                                                                    }} className="text-slate-400 hover:text-rose-500"><FiX /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <button onClick={() => removeItem('pelatihan', i)} className="absolute top-6 right-6 p-3 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-100 shadow-sm">
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

                                        <div className="pt-8 border-t border-slate-100 space-y-8">
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
                                                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-50 border border-slate-200 rounded-[2rem] relative group">
                                                    <CustomInput value={m.nama} onChange={(v: any) => updateItem('mitra', i, { ...m, nama: v })} label="Nama Entitas" placeholder="Company / Group..." />
                                                    <CustomInput value={m.alamat} onChange={(v: any) => updateItem('mitra', i, { ...m, alamat: v })} label="Domisili" placeholder="Location..." />
                                                    <div className="flex gap-4">
                                                        <CustomInput value={m.jenisKemitraan} onChange={(v: any) => updateItem('mitra', i, { ...m, jenisKemitraan: v })} label="Tipe Kerjasama" placeholder="Pemasaran/Modal..." className="flex-1" />
                                                        <button onClick={() => removeItem('mitra', i)} className="mt-8 p-4 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-100 shadow-sm">
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

                                        <div className="pt-12 flex flex-col items-center justify-center text-center space-y-8 bg-blue-50 rounded-[3rem] p-12 border border-blue-100">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20">
                                                <FiSave />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-calsans text-slate-900 uppercase tracking-tighter">Ready for Archiving</h3>
                                                <p className="text-slate-500 text-sm max-w-sm">Pastikan seluruh data yang dimasukkan telah akurat dan sesuai dengan fakta di lapangan.</p>
                                            </div>
                                            <button
                                                onClick={saveReportUI}
                                                disabled={saving}
                                                className="group relative h-16 px-12 bg-blue-600 text-white rounded-2xl font-black tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-blue-500/20"
                                            >
                                                {saving ? <HashLoader size={20} color="#fff" /> : <><FiSave /> PERSIST & SYNC</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </AnimatePresence>

                    {/* Footer Navigation Buttons Layered Inside for Style */}
                    <div className="mt-12 pt-12 flex justify-between border-t border-slate-100 relative z-10">
                        <button
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1 || activeView === 'history'}
                            className="flex items-center gap-3 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-2xl transition-all font-bold text-[10px] tracking-widest uppercase disabled:opacity-20 disabled:pointer-events-none"
                        >
                            <FiChevronLeft /> BACKPLANE
                        </button>
                        {step < 5 && activeView === 'form' && (
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
        </DashboardLayout>
    );
}

// Internal Components

function SectionHeader({ icon, title, subtitle }: any) {
    return (
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl text-blue-600 shadow-sm">
                {icon}
            </div>
            <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-calsans text-slate-900">{title}</h2>
                    <FiEye className="text-slate-200" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{subtitle}</p>
            </div>
        </div>
    );
}

function Label({ text }: any) {
    return <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{text}</p>;
}

function CustomInput({ value, onChange, placeholder, icon, label, className = "", ...props }: any) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</p>}
            <div className="relative group/input">
                {icon && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors">{icon}</span>}
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full ${icon ? 'pl-12' : 'pl-5'} pr-5 py-6 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 text-slate-800 h-14 shadow-sm`}
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
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 text-slate-800 resize-none shadow-sm"
        />
    );
}

function Checkbox({ label, checked, onChange, color = "blue" }: any) {
    const colors: any = {
        blue: "text-blue-600 focus:ring-blue-500 bg-blue-50",
        indigo: "text-indigo-600 focus:ring-indigo-500 bg-indigo-50",
        emerald: "text-emerald-600 focus:ring-emerald-500 bg-emerald-50"
    };

    return (
        <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer group shadow-sm">
            <div className="relative flex items-center justify-center mt-1">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="appearance-none w-5 h-5 rounded-lg border border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                />
                {checked && <FiX className="absolute text-white pointer-events-none scale-75 rotate-45" />}
            </div>
            <span className={`text-xs font-medium transition-colors ${checked ? 'text-slate-900 font-bold' : 'text-slate-500 group-hover:text-slate-700'}`}>{label}</span>
        </label>
    );
}

function CustomPillInput({ values, onChange, placeholder, color = "blue" }: any) {
    const [temp, setTemp] = useState('');

    const colors: any = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {values.map((v: string, i: number) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold ${colors[color]} shadow-sm`}>
                        {v}
                        <button onClick={() => onChange(values.filter((_: any, idx: number) => idx !== i))} className="hover:text-rose-500 transition-colors"><FiX /></button>
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
                    className="w-full pl-5 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-[10px] focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 text-slate-800 shadow-sm"
                />
                <button
                    onClick={() => { if (temp.trim()) { onChange([...values, temp.trim()]); setTemp(''); } }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                    <FiPlus />
                </button>
            </div>
        </div>
    );
}