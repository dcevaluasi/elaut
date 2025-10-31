import React, { useState } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';

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
    latarBelakang: string;
    bidangUsaha: string;
    pelatih: Pelatih[];
    penghargaan: Penghargaan[];
    pelatihan: Pelatihan[];
    tantangan: string[];
    upaya: string[];
    dampak: string[];
    mitra: Mitra[];
    harapanUsaha: string[];
    harapanPelatihan: string[];
}

export default function P2MKPReportApp() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<ReportData>({
        latarBelakang: '',
        bidangUsaha: '',
        pelatih: [{ nama: '', keahlian: '', sertifikasi: '' }],
        penghargaan: [{ nama: '', instansi: '', tahun: '' }],
        pelatihan: [{ jenis: '', waktu: '', lokasi: '', jumlahPeserta: 0, instansiPeserta: '', materi: [''], sumberAnggaran: '' }],
        tantangan: [''],
        upaya: [''],
        dampak: [''],
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
        </style>
      </head>
      <body>
        <h1>LAPORAN KEGIATAN<br/>PUSAT PELATIHAN MANDIRI KELAUTAN DAN PERIKANAN (P2MKP)</h1>
        
        <h2>BAB I - PENDAHULUAN</h2>
        
        <h3>1.1 LATAR BELAKANG</h3>
        <p>${data.latarBelakang || '-'}</p>
        
        <h3>1.2 BIDANG USAHA DAN PELATIHAN</h3>
        <p>${data.bidangUsaha || '-'}</p>
        
        <h3>1.3 DAFTAR PELATIH</h3>
        <table>
          <tr><th>No</th><th>Nama</th><th>Keahlian</th><th>Sertifikasi</th></tr>
          ${data.pelatih.map((p, i) => `
            <tr><td>${i + 1}</td><td>${p.nama}</td><td>${p.keahlian}</td><td>${p.sertifikasi}</td></tr>
          `).join('')}
        </table>
        
        <h3>1.4 DAFTAR PENGHARGAAN</h3>
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
        <ul>${data.tantangan.map(t => `<li>${t}</li>`).join('')}</ul>
        
        <h3>Upaya yang Dilakukan</h3>
        <ul>${data.upaya.map(u => `<li>${u}</li>`).join('')}</ul>
        
        <h3>Dampak terhadap Masyarakat</h3>
        <ul>${data.dampak.map(d => `<li>${d}</li>`).join('')}</ul>
        
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
        <ul>${data.harapanUsaha.map(h => `<li>${h}</li>`).join('')}</ul>
        
        <h3>Harapan Bidang Pelatihan</h3>
        <ul>${data.harapanPelatihan.map(h => `<li>${h}</li>`).join('')}</ul>
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
                            Sistem Laporan P2MKP
                        </h1>
                        <button
                            onClick={generatePDF}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-lg transition-all w-full sm:w-auto justify-center"
                        >
                            <Download size={20} />
                            <span className="font-semibold">Export PDF</span>
                        </button>
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

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">1.1 Latar Belakang</label>
                                    <textarea
                                        value={data.latarBelakang}
                                        onChange={(e) => setData({ ...data, latarBelakang: e.target.value })}
                                        className="w-full p-2 sm:p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                                        rows={4}
                                        placeholder="Deskripsi latar belakang pendirian P2MKP..."
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">1.2 Bidang Usaha dan Pelatihan</label>
                                    <textarea
                                        value={data.bidangUsaha}
                                        onChange={(e) => setData({ ...data, bidangUsaha: e.target.value })}
                                        className="w-full p-2 sm:p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                                        rows={4}
                                        placeholder="Bidang usaha P2MKP dan pelatihan yang telah dilakukan..."
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">1.3 Daftar Pelatih</label>
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
                                            <button onClick={() => removeItem('pelatih', i)} className="text-red-400 hover:text-red-300 p-2">
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
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">1.4 Daftar Penghargaan</label>
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
                                            <button onClick={() => removeItem('penghargaan', i)} className="text-red-400 hover:text-red-300 p-2">
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
                                                    className="text-red-400 hover:text-red-300"
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
                                            className="text-red-400 hover:text-red-300 float-right"
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

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">Tantangan yang Dihadapi</label>
                                    {data.tantangan.map((t, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <textarea
                                                value={t}
                                                onChange={(e) => updateItem('tantangan', i, e.target.value)}
                                                className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                                rows={2}
                                            />
                                            <button onClick={() => removeItem('tantangan', i)} className="text-red-400 hover:text-red-300">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addItem('tantangan', '')}
                                        className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm sm:text-base"
                                    >
                                        <Plus size={20} /> Tambah
                                    </button>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">Upaya yang Dilakukan</label>
                                    {data.upaya.map((u, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <textarea
                                                value={u}
                                                onChange={(e) => updateItem('upaya', i, e.target.value)}
                                                className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                                rows={2}
                                            />
                                            <button onClick={() => removeItem('upaya', i)} className="text-red-400 hover:text-red-300">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addItem('upaya', '')}
                                        className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm sm:text-base"
                                    >
                                        <Plus size={20} /> Tambah
                                    </button>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2 text-white text-sm sm:text-base">Dampak terhadap Masyarakat</label>
                                    {data.dampak.map((d, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <textarea
                                                value={d}
                                                onChange={(e) => updateItem('dampak', i, e.target.value)}
                                                className="flex-1 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                                rows={2}
                                            />
                                            <button onClick={() => removeItem('dampak', i)} className="text-red-400 hover:text-red-300">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addItem('dampak', '')}
                                        className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm sm:text-base"
                                    >
                                        <Plus size={20} /> Tambah
                                    </button>
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
                                        <button onClick={() => removeItem('mitra', i)} className="text-red-400 hover:text-red-300 p-2">
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
                                            <button onClick={() => removeItem('harapanUsaha', i)} className="text-red-400 hover:text-red-300">
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
                                            <button onClick={() => removeItem('harapanPelatihan', i)} className="text-red-400 hover:text-red-300">
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