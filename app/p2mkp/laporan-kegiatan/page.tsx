'use client'

import React, { useState } from 'react';
import { Plus, Trash2, Download, Save } from 'lucide-react';
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
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
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
            // Panggil fungsi saveReport dari props atau import
            const result = await saveReport(data);

            // Simulasi save untuk demo
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Laporan berhasil disimpan!');
        } catch (error) {
            alert('Gagal menyimpan laporan!');
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
          <tr>
            <td class="info-label">Nama P2MKP</td>
            <td>${data.namaP2MKP || '-'}</td>
          </tr>
        </table>
        
        
        <h3>1.1 BIDANG USAHA DAN PELATIHAN</h3>
        <p>${data.bidangUsaha || '-'}</p>
        
        <h3>1.2 DAFTAR PELATIH</h3>
        <table>
          <tr><th>No</th><th>Nama</th><th>Keahlian</th><th>Sertifikasi</th></tr>
          ${data.pelatih.map((p, i) => `
            <tr><td>${i + 1}</td><td>${p.nama}</td><td>${p.keahlian}</td><td>${p.sertifikasi}</td></tr>
          `).join('')}
        </table>
        
        <h3>1.3 DAFTAR PENGHARGAAN</h3>
        <table>
          <tr><th>No</th><th>Nama Penghargaan</th><th>Instansi Pemberi</th><th>Tahun</th></tr>
          ${data.penghargaan.map((p, i) => `
            <tr><td>${i + 1}</td><td>${p.nama}</td><td>${p.instansi}</td><td>${p.tahun}</td></tr>
          `).join('')}
        </table>
        
        <div class="page-break"></div>
        
        <h2>BAB II - PELAKSANAAN PELATIHAN</h2>
        <table>
          <tr>
            <th>No</th><th>Jenis Pelatihan</th><th>Waktu</th><th>Lokasi</th>
            <th>Jumlah Peserta</th><th>Instansi Peserta</th>
            <th>Materi</th><th>Sumber Anggaran</th>
          </tr>
          ${data.pelatihan.map((p, i) => `
            <tr>
              <td>${i + 1}</td><td>${p.jenis}</td><td>${p.waktu}</td><td>${p.lokasi}</td>
              <td>${p.jumlahPeserta}</td><td>${p.instansiPeserta}</td>
              <td>${p.materi.join(', ')}</td><td>${p.sumberAnggaran}</td>
            </tr>
          `).join('')}
        </table>
        
        <div class="page-break"></div>
        
        <h2>BAB III - TANTANGAN & DAMPAK TERHADAP MASYARAKAT</h2>
        
        <h3>Tantangan yang Dihadapi</h3>
        <ul>${allTantangan.map(t => `<li>${t}</li>`).join('')}</ul>
        
        <h3>Upaya yang Dilakukan</h3>
        <ul>${allUpaya.map(u => `<li>${u}</li>`).join('')}</ul>
        
        <h3>Dampak terhadap Masyarakat</h3>
        <ul>${allDampak.map(d => `<li>${d}</li>`).join('')}</ul>
        
        <div class="page-break"></div>
        
        <h2>BAB IV - JEJARING USAHA</h2>
        <table>
          <tr><th>No</th><th>Nama Mitra</th><th>Alamat</th><th>Jenis Kemitraan</th></tr>
          ${data.mitra.map((m, i) => `
            <tr><td>${i + 1}</td><td>${m.nama}</td><td>${m.alamat}</td><td>${m.jenisKemitraan}</td></tr>
          `).join('')}
        </table>
        
        <h2>BAB V - PENUTUP</h2>
        <p>Demikian laporan kegiatan Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP) ini kami susun sebagai bentuk pertanggungjawaban atas pelaksanaan kegiatan usaha dan pelatihan yang telah dilakukan.</p>
        
        <h3>Harapan Bidang Usaha</h3>
        <ul>${data.harapanUsaha.filter(Boolean).map(h => `<li>${h}</li>`).join('')}</ul>
        
        <h3>Harapan Bidang Pelatihan</h3>
        <ul>${data.harapanPelatihan.filter(Boolean).map(h => `<li>${h}</li>`).join('')}</ul>
      </body>
      </html>
    `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-2 sm:p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Glass Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-3 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                            Laporan Kegiatan Pelatihan P2MKP
                        </h1>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={saveReportUI}
                                disabled={saving}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all flex-1 sm:flex-none justify-center disabled:opacity-50"
                            >
                                <Save size={20} />
                                <span className="font-semibold">{saving ? 'Menyimpan...' : 'Save'}</span>
                            </button>
                            <button
                                onClick={generatePDF}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-lg transition-all flex-1 sm:flex-none justify-center"
                            >
                                <Download size={20} />
                                <span className="font-semibold">PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-4 sm:mb-6">
                        {['BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V'].map((label, i) => (
                            <button
                                key={i}
                                onClick={() => setStep(i + 1)}
                                className={`py-2 sm:py-3 px-1 rounded-lg text-xs sm:text-sm font-semibold transition-all ${step === i + 1
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                                    : 'bg-white/20 text-white/70 hover:bg-white/30 backdrop-blur-sm'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Content Container */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-white/10 min-h-[400px]">

                        {/* BAB I */}
                        {step === 1 && (
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">BAB I - Pendahuluan</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block font-semibold mb-2 text-white text-sm sm:text-base">Nama P2MKP</label>
                                        <input
                                            value={data.namaP2MKP}
                                            onChange={(e) => setData({ ...data, namaP2MKP: e.target.value })}
                                            className="w-full p-2 sm:p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                                            placeholder="Nama lengkap P2MKP..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">1.1 Bidang Usaha dan Pelatihan</label>
                                    <textarea
                                        value={data.bidangUsaha}
                                        onChange={(e) => setData({ ...data, bidangUsaha: e.target.value })}
                                        className="w-full p-2 sm:p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                                        rows={4}
                                        placeholder="Bidang usaha P2MKP dan pelatihan yang telah dilakukan..."
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">1.2 Daftar Pelatih</label>
                                    {data.pelatih.map((p, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row gap-2 mb-2 bg-white/5 p-2 sm:p-3 rounded-lg">
                                            <input
                                                placeholder="Nama"
                                                value={p.nama}
                                                onChange={(e) => updateItem('pelatih', i, { ...p, nama: e.target.value })}
                                                className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                            />
                                            <input
                                                placeholder="Keahlian"
                                                value={p.keahlian}
                                                onChange={(e) => updateItem('pelatih', i, { ...p, keahlian: e.target.value })}
                                                className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                            />
                                            <input
                                                placeholder="Sertifikasi"
                                                value={p.sertifikasi}
                                                onChange={(e) => updateItem('pelatih', i, { ...p, sertifikasi: e.target.value })}
                                                className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                            />
                                            <button onClick={() => removeItem('pelatih', i)} className="text-rose-400 hover:text-rose-300 p-2">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addItem('pelatih', { nama: '', keahlian: '', sertifikasi: '' })}
                                        className="flex items-center gap-2 text-blue-300 hover:text-blue-200 mt-2 text-sm sm:text-base"
                                    >
                                        <Plus size={20} /> Tambah Pelatih
                                    </button>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">1.3 Daftar Penghargaan</label>
                                    {data.penghargaan.map((p, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row gap-2 mb-2 bg-white/5 p-2 sm:p-3 rounded-lg">
                                            <input
                                                placeholder="Nama Penghargaan"
                                                value={p.nama}
                                                onChange={(e) => updateItem('penghargaan', i, { ...p, nama: e.target.value })}
                                                className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                            />
                                            <input
                                                placeholder="Instansi Pemberi"
                                                value={p.instansi}
                                                onChange={(e) => updateItem('penghargaan', i, { ...p, instansi: e.target.value })}
                                                className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                            />
                                            <input
                                                placeholder="Tahun"
                                                value={p.tahun}
                                                onChange={(e) => updateItem('penghargaan', i, { ...p, tahun: e.target.value })}
                                                className="w-full sm:w-24 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                            />
                                            <button onClick={() => removeItem('penghargaan', i)} className="text-rose-400 hover:text-rose-300 p-2">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addItem('penghargaan', { nama: '', instansi: '', tahun: '' })}
                                        className="flex items-center gap-2 text-blue-300 hover:text-blue-200 mt-2 text-sm sm:text-base"
                                    >
                                        <Plus size={20} /> Tambah Penghargaan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* BAB II */}
                        {step === 2 && (
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">BAB II - Pelaksanaan Pelatihan</h2>
                                {data.pelatihan.map((p, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 sm:p-4 rounded-lg">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
                                            <input
                                                placeholder="Jenis Pelatihan"
                                                value={p.jenis}
                                                onChange={(e) => updateItem('pelatihan', i, { ...p, jenis: e.target.value })}
                                                className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                            />
                                            <input
                                                placeholder="Waktu (ex: 1-10 Jan 2025)"
                                                value={p.waktu}
                                                onChange={(e) => updateItem('pelatihan', i, { ...p, waktu: e.target.value })}
                                                className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                            />
                                            <input
                                                placeholder="Lokasi"
                                                value={p.lokasi}
                                                onChange={(e) => updateItem('pelatihan', i, { ...p, lokasi: e.target.value })}
                                                className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:col-span-2"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Jumlah Peserta"
                                                value={p.jumlahPeserta}
                                                onChange={(e) => updateItem('pelatihan', i, { ...p, jumlahPeserta: parseInt(e.target.value) || 0 })}
                                                className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                            />
                                            <input
                                                placeholder="Instansi Peserta"
                                                value={p.instansiPeserta}
                                                onChange={(e) => updateItem('pelatihan', i, { ...p, instansiPeserta: e.target.value })}
                                                className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                            />
                                            <input
                                                placeholder="Sumber Anggaran"
                                                value={p.sumberAnggaran}
                                                onChange={(e) => updateItem('pelatihan', i, { ...p, sumberAnggaran: e.target.value })}
                                                className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:col-span-2"
                                            />
                                        </div>
                                        <label className="block text-sm font-semibold mb-1 text-white">Materi:</label>
                                        {p.materi.map((m, j) => (
                                            <div key={j} className="flex gap-2 mb-1">
                                                <input
                                                    placeholder="Nama Materi"
                                                    value={m}
                                                    onChange={(e) => {
                                                        const newMateri = [...p.materi];
                                                        newMateri[j] = e.target.value;
                                                        updateItem('pelatihan', i, { ...p, materi: newMateri });
                                                    }}
                                                    className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newMateri = p.materi.filter((_, idx) => idx !== j);
                                                        updateItem('pelatihan', i, { ...p, materi: newMateri });
                                                    }}
                                                    className="text-rose-400 hover:text-rose-300"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => updateItem('pelatihan', i, { ...p, materi: [...p.materi, ''] })}
                                            className="text-blue-300 hover:text-blue-200 text-sm mt-1"
                                        >
                                            + Tambah Materi
                                        </button>
                                        <button
                                            onClick={() => removeItem('pelatihan', i)}
                                            className="text-rose-400 hover:text-rose-300 float-right"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addItem('pelatihan', { jenis: '', waktu: '', lokasi: '', jumlahPeserta: 0, instansiPeserta: '', materi: [''], sumberAnggaran: '' })}
                                    className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm sm:text-base"
                                >
                                    <Plus size={20} /> Tambah Pelatihan
                                </button>
                            </div>
                        )}

                        {/* BAB III */}
                        {step === 3 && (
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">BAB III - Tantangan & Dampak</h2>

                                {/* Tantangan */}
                                <div>
                                    <label className="block font-semibold mb-3 text-white text-sm sm:text-base">Tantangan yang Dihadapi</label>
                                    <div className="space-y-2 mb-3">
                                        {TANTANGAN_OPTIONS.map((option) => (
                                            <label key={option} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.tantangan.includes(option)}
                                                    onChange={() => toggleCheckbox('tantangan', option)}
                                                    className="w-4 h-4 rounded border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-400"
                                                />
                                                <span className="text-white text-sm">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-sm font-semibold mb-2 text-white">Tambah Pilihan Lain:</label>
                                        {data.tantanganCustom.map((item, i) => (
                                            <div key={i} className="flex gap-2 mb-2">
                                                <input
                                                    value={item}
                                                    onChange={(e) => updateItem('tantanganCustom', i, e.target.value)}
                                                    className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                                    placeholder="Tantangan lainnya..."
                                                />
                                                <button onClick={() => removeItem('tantanganCustom', i)} className="text-rose-400 hover:text-rose-300">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addItem('tantanganCustom', '')}
                                            className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm"
                                        >
                                            <Plus size={18} /> Tambah
                                        </button>
                                    </div>
                                </div>

                                {/* Upaya */}
                                <div>
                                    <label className="block font-semibold mb-3 text-white text-sm sm:text-base">Upaya yang Dilakukan</label>
                                    <div className="space-y-2 mb-3">
                                        {UPAYA_OPTIONS.map((option) => (
                                            <label key={option} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.upaya.includes(option)}
                                                    onChange={() => toggleCheckbox('upaya', option)}
                                                    className="w-4 h-4 rounded border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-400"
                                                />
                                                <span className="text-white text-sm">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-sm font-semibold mb-2 text-white">Tambah Pilihan Lain:</label>
                                        {data.upayaCustom.map((item, i) => (
                                            <div key={i} className="flex gap-2 mb-2">
                                                <input
                                                    value={item}
                                                    onChange={(e) => updateItem('upayaCustom', i, e.target.value)}
                                                    className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                                    placeholder="Upaya lainnya..."
                                                />
                                                <button onClick={() => removeItem('upayaCustom', i)} className="text-rose-400 hover:text-rose-300">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addItem('upayaCustom', '')}
                                            className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm"
                                        >
                                            <Plus size={18} /> Tambah
                                        </button>
                                    </div>
                                </div>

                                {/* Dampak */}
                                <div>
                                    <label className="block font-semibold mb-3 text-white text-sm sm:text-base">Dampak terhadap Masyarakat</label>
                                    <div className="space-y-2 mb-3">
                                        {DAMPAK_OPTIONS.map((option) => (
                                            <label key={option} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.dampak.includes(option)}
                                                    onChange={() => toggleCheckbox('dampak', option)}
                                                    className="w-4 h-4 rounded border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-400"
                                                />
                                                <span className="text-white text-sm">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-sm font-semibold mb-2 text-white">Tambah Pilihan Lain:</label>
                                        {data.dampakCustom.map((item, i) => (
                                            <div key={i} className="flex gap-2 mb-2">
                                                <input
                                                    value={item}
                                                    onChange={(e) => updateItem('dampakCustom', i, e.target.value)}
                                                    className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                                    placeholder="Dampak lainnya..."
                                                />
                                                <button onClick={() => removeItem('dampakCustom', i)} className="text-rose-400 hover:text-rose-300">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addItem('dampakCustom', '')}
                                            className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm"
                                        >
                                            <Plus size={18} /> Tambah
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BAB IV */}
                        {step === 4 && (
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">BAB IV - Jejaring Usaha</h2>
                                {data.mitra.map((m, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row gap-2 mb-2 bg-white/5 p-2 sm:p-3 rounded-lg">
                                        <input
                                            placeholder="Nama Mitra"
                                            value={m.nama}
                                            onChange={(e) => updateItem('mitra', i, { ...m, nama: e.target.value })}
                                            className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                        />
                                        <input
                                            placeholder="Alamat"
                                            value={m.alamat}
                                            onChange={(e) => updateItem('mitra', i, { ...m, alamat: e.target.value })}
                                            className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                        />
                                        <input
                                            placeholder="Jenis Kemitraan"
                                            value={m.jenisKemitraan}
                                            onChange={(e) => updateItem('mitra', i, { ...m, jenisKemitraan: e.target.value })}
                                            className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                        />
                                        <button onClick={() => removeItem('mitra', i)} className="text-rose-400 hover:text-rose-300 p-2">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addItem('mitra', { nama: '', alamat: '', jenisKemitraan: '' })}
                                    className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm sm:text-base"
                                >
                                    <Plus size={20} /> Tambah Mitra
                                </button>
                            </div>
                        )}

                        {/* BAB V */}
                        {step === 5 && (
                            <div className="space-y-4 sm:space-y-6">
                                <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">BAB V - Penutup</h2>

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">Harapan Bidang Usaha</label>
                                    {data.harapanUsaha.map((h, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <textarea
                                                value={h}
                                                onChange={(e) => updateItem('harapanUsaha', i, e.target.value)}
                                                className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                                rows={2}
                                            />
                                            <button onClick={() => removeItem('harapanUsaha', i)} className="text-rose-400 hover:text-rose-300">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addItem('harapanUsaha', '')}
                                        className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm sm:text-base"
                                    >
                                        <Plus size={20} /> Tambah
                                    </button>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">Harapan Bidang Pelatihan</label>
                                    {data.harapanPelatihan.map((h, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <textarea
                                                value={h}
                                                onChange={(e) => updateItem('harapanPelatihan', i, e.target.value)}
                                                className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                                rows={2}
                                            />
                                            <button onClick={() => removeItem('harapanPelatihan', i)} className="text-rose-400 hover:text-rose-300">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addItem('harapanPelatihan', '')}
                                        className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm sm:text-base"
                                    >
                                        <Plus size={20} /> Tambah
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
                        <button
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1}
                            className="px-4 sm:px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg disabled:opacity-30 hover:bg-white/30 transition-all text-sm sm:text-base font-semibold"
                        >
                            Sebelumnya
                        </button>
                        <button
                            onClick={() => setStep(Math.min(5, step + 1))}
                            disabled={step === 5}
                            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-30 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg text-sm sm:text-base font-semibold"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}