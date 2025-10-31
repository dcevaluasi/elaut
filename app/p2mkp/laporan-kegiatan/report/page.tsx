'use client'

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, Calendar, MapPin, User } from 'lucide-react';

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
    id?: string;
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
    createdAt?: Date;
}

export default function P2MKPDashboard() {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Load reports from Firebase or demo data
    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            // Replace with actual Firebase query
            // const querySnapshot = await getDocs(collection(db, 'reports'));
            // const loadedReports = querySnapshot.docs.map(doc => ({
            //     id: doc.id,
            //     ...doc.data()
            // }));

            // Demo data
            const demoReports: ReportData[] = [
                {
                    id: '1',
                    namaP2MKP: 'P2MKP Mina Bahari',
                    tanggalBerdiri: '2020-05-15',
                    alamatP2MKP: 'Jl. Pantai Indah No. 123, Semarang',
                    namaKetua: 'Budi Santoso',
                    latarBelakang: 'P2MKP Mina Bahari didirikan untuk meningkatkan kualitas SDM nelayan.',
                    bidangUsaha: 'Pelatihan budidaya ikan, pengolahan hasil laut',
                    pelatih: [
                        { nama: 'Ir. Andi Wijaya', keahlian: 'Budidaya Ikan', sertifikasi: 'Sertifikat Pelatih Nasional' }
                    ],
                    penghargaan: [
                        { nama: 'P2MKP Terbaik', instansi: 'Kementerian KKP', tahun: '2023' }
                    ],
                    pelatihan: [
                        {
                            jenis: 'Budidaya Lele',
                            waktu: '1-10 Januari 2024',
                            lokasi: 'Balai Pelatihan Semarang',
                            jumlahPeserta: 25,
                            instansiPeserta: 'Kelompok Nelayan',
                            materi: ['Teknik Budidaya', 'Manajemen Pakan'],
                            sumberAnggaran: 'APBN'
                        }
                    ],
                    tantangan: ['Keterbatasan modal usaha', 'Sulitnya pemasaran produk'],
                    tantanganCustom: [],
                    upaya: ['Menjalin kemitraan', 'Promosi produk di pameran/media'],
                    upayaCustom: [],
                    dampak: ['Meningkatnya keterampilan masyarakat', 'Terciptanya lapangan kerja baru'],
                    dampakCustom: [],
                    mitra: [
                        { nama: 'PT Mina Jaya', alamat: 'Jakarta', jenisKemitraan: 'Pemasaran' }
                    ],
                    harapanUsaha: ['Meningkatkan omzet penjualan'],
                    harapanPelatihan: ['Menambah variasi pelatihan'],
                    createdAt: new Date('2024-01-15')
                },
                {
                    id: '2',
                    namaP2MKP: 'P2MKP Samudra Jaya',
                    tanggalBerdiri: '2019-08-20',
                    alamatP2MKP: 'Jl. Nelayan Sejahtera No. 45, Surabaya',
                    namaKetua: 'Siti Nurhaliza',
                    latarBelakang: 'Didirikan untuk memberdayakan masyarakat pesisir.',
                    bidangUsaha: 'Pelatihan pengolahan ikan, pemasaran digital',
                    pelatih: [
                        { nama: 'Dr. Made Sutama', keahlian: 'Teknologi Pengolahan', sertifikasi: 'PhD Teknologi Pangan' }
                    ],
                    penghargaan: [
                        { nama: 'Inovasi Terbaik', instansi: 'Pemda Jawa Timur', tahun: '2022' }
                    ],
                    pelatihan: [
                        {
                            jenis: 'Pengolahan Ikan Asap',
                            waktu: '5-15 Februari 2024',
                            lokasi: 'Workshop Surabaya',
                            jumlahPeserta: 30,
                            instansiPeserta: 'Masyarakat Umum',
                            materi: ['Teknik Pengasapan', 'Pengemasan Produk'],
                            sumberAnggaran: 'APBD'
                        }
                    ],
                    tantangan: ['Akses bahan baku terbatas', 'Peralatan pelatihan tidak memadai'],
                    tantanganCustom: ['Jaringan internet buruk'],
                    upaya: ['Pelatihan inovasi produk', 'Penggunaan teknologi tepat guna'],
                    upayaCustom: [],
                    dampak: ['Peningkatan pendapatan keluarga', 'Diversifikasi produk bernilai tambah'],
                    dampakCustom: ['Produk lokal lebih dikenal'],
                    mitra: [
                        { nama: 'Koperasi Nelayan', alamat: 'Surabaya', jenisKemitraan: 'Permodalan' }
                    ],
                    harapanUsaha: ['Ekspansi pasar ke luar pulau'],
                    harapanPelatihan: ['Pelatihan digital marketing'],
                    createdAt: new Date('2024-02-20')
                }
            ];

            setReports(demoReports);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = (report: ReportData) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const allTantangan = [...report.tantangan, ...report.tantanganCustom].filter(Boolean);
        const allUpaya = [...report.upaya, ...report.upayaCustom].filter(Boolean);
        const allDampak = [...report.dampak, ...report.dampakCustom].filter(Boolean);

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan P2MKP - ${report.namaP2MKP}</title>
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
        <h1>LAPORAN KEGIATAN<br/>PUSAT PELATIHAN MANDIRI KELAUTAN DAN PERIKANAN (P2MKP)<br/>${report.namaP2MKP}</h1>
        
        <h2>BAB I - PENDAHULUAN</h2>
        
        <table class="info-table">
          <tr>
            <td class="info-label">Nama P2MKP</td>
            <td>${report.namaP2MKP || '-'}</td>
          </tr>
          <tr>
            <td class="info-label">Alamat</td>
            <td>${report.alamatP2MKP || '-'}</td>
          </tr>
          <tr>
            <td class="info-label">Ketua/Penanggung Jawab</td>
            <td>${report.namaKetua || '-'}</td>
          </tr>
        </table>
        
        <h3>1.1 LATAR BELAKANG</h3>
        <p>${report.latarBelakang || '-'}</p>
        
        <h3>1.2 BIDANG USAHA DAN PELATIHAN</h3>
        <p>${report.bidangUsaha || '-'}</p>
        
        <h3>1.3 DAFTAR PELATIH</h3>
        <table>
          <tr><th>No</th><th>Nama</th><th>Keahlian</th><th>Sertifikasi</th></tr>
          ${report.pelatih.map((p, i) => `
            <tr><td>${i + 1}</td><td>${p.nama}</td><td>${p.keahlian}</td><td>${p.sertifikasi}</td></tr>
          `).join('')}
        </table>
        
        <h3>1.4 DAFTAR PENGHARGAAN</h3>
        <table>
          <tr><th>No</th><th>Nama Penghargaan</th><th>Instansi Pemberi</th><th>Tahun</th></tr>
          ${report.penghargaan.map((p, i) => `
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
          ${report.pelatihan.map((p, i) => `
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
          ${report.mitra.map((m, i) => `
            <tr><td>${i + 1}</td><td>${m.nama}</td><td>${m.alamat}</td><td>${m.jenisKemitraan}</td></tr>
          `).join('')}
        </table>
        
        <h2>BAB V - PENUTUP</h2>
        <p>Demikian laporan kegiatan Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP) ini kami susun sebagai bentuk pertanggungjawaban atas pelaksanaan kegiatan usaha dan pelatihan yang telah dilakukan.</p>
        
        <h3>Harapan Bidang Usaha</h3>
        <ul>${report.harapanUsaha.filter(Boolean).map(h => `<li>${h}</li>`).join('')}</ul>
        
        <h3>Harapan Bidang Pelatihan</h3>
        <ul>${report.harapanPelatihan.filter(Boolean).map(h => `<li>${h}</li>`).join('')}</ul>
      </body>
      </html>
    `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const filteredReports = reports.filter(report =>
        report.namaP2MKP.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.namaKetua.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.alamatP2MKP.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-2 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">Dashboard P2MKP</h1>
                            <p className="text-white/70 text-sm sm:text-base mt-1">Daftar Laporan Pusat Pelatihan Mandiri</p>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                            <input
                                type="text"
                                placeholder="Cari nama P2MKP, ketua, atau alamat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* List of Reports */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 p-4">
                            <h2 className="text-lg font-bold text-white mb-4">Daftar Laporan ({filteredReports.length})</h2>

                            {loading ? (
                                <div className="text-white/70 text-center py-8">Loading...</div>
                            ) : filteredReports.length === 0 ? (
                                <div className="text-white/70 text-center py-8">
                                    {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada laporan'}
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                    {filteredReports.map((report) => (
                                        <button
                                            key={report.id}
                                            onClick={() => setSelectedReport(report)}
                                            className={`w-full text-left p-3 rounded-lg transition-all ${selectedReport?.id === report.id
                                                ? 'bg-blue-500/30 border-2 border-blue-400'
                                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <FileText className="text-blue-300 mt-1" size={20} />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white text-sm truncate">{report.namaP2MKP}</h3>
                                                    <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                                                        <User size={12} />
                                                        {report.namaKetua}
                                                    </p>
                                                    <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {report.tanggalBerdiri}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Report */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 p-4 sm:p-6">
                            {!selectedReport ? (
                                <div className="text-center py-16">
                                    <FileText className="mx-auto text-white/30 mb-4" size={64} />
                                    <p className="text-white/70">Pilih laporan untuk melihat detail</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Header with Actions */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/20">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedReport.namaP2MKP}</h2>
                                            <p className="text-white/60 text-sm mt-1">
                                                {selectedReport.createdAt && new Date(selectedReport.createdAt).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => generatePDF(selectedReport)}
                                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-lg transition-all w-full sm:w-auto justify-center"
                                        >
                                            <Download size={20} />
                                            <span className="font-semibold">Download PDF</span>
                                        </button>
                                    </div>

                                    {/* Detail Content */}
                                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                                        {/* Informasi Umum */}
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                                <Eye size={18} />
                                                Informasi Umum
                                            </h3>
                                        </div>

                                        {/* Bidang Usaha */}
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <h3 className="font-bold text-white mb-2">Bidang Usaha dan Pelatihan</h3>
                                            <p className="text-white/80 text-sm text-justify">{selectedReport.bidangUsaha}</p>
                                        </div>

                                        {/* Pelatih */}
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <h3 className="font-bold text-white mb-3">Daftar Pelatih ({selectedReport.pelatih.length})</h3>
                                            <div className="space-y-2">
                                                {selectedReport.pelatih.map((p, i) => (
                                                    <div key={i} className="bg-white/5 p-3 rounded">
                                                        <p className="text-white font-semibold text-sm">{p.nama}</p>
                                                        <p className="text-white/60 text-xs">{p.keahlian} • {p.sertifikasi}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Penghargaan */}
                                        {selectedReport.penghargaan.length > 0 && (
                                            <div className="bg-white/5 rounded-lg p-4">
                                                <h3 className="font-bold text-white mb-3">Penghargaan ({selectedReport.penghargaan.length})</h3>
                                                <div className="space-y-2">
                                                    {selectedReport.penghargaan.map((p, i) => (
                                                        <div key={i} className="bg-white/5 p-3 rounded">
                                                            <p className="text-white font-semibold text-sm">{p.nama}</p>
                                                            <p className="text-white/60 text-xs">{p.instansi} • {p.tahun}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Pelatihan */}
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <h3 className="font-bold text-white mb-3">Pelaksanaan Pelatihan ({selectedReport.pelatihan.length})</h3>
                                            <div className="space-y-3">
                                                {selectedReport.pelatihan.map((p, i) => (
                                                    <div key={i} className="bg-white/5 p-3 rounded">
                                                        <p className="text-white font-semibold text-sm mb-2">{p.jenis}</p>
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div>
                                                                <p className="text-white/60">Waktu</p>
                                                                <p className="text-white">{p.waktu}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-white/60">Peserta</p>
                                                                <p className="text-white">{p.jumlahPeserta} orang</p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <p className="text-white/60">Lokasi</p>
                                                                <p className="text-white">{p.lokasi}</p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <p className="text-white/60">Materi</p>
                                                                <p className="text-white">{p.materi.join(', ')}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tantangan, Upaya, Dampak */}
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <h3 className="font-bold text-white mb-3">Tantangan & Dampak</h3>

                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-white/80 font-semibold text-sm mb-2">Tantangan:</p>
                                                    <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                                                        {[...selectedReport.tantangan, ...selectedReport.tantanganCustom].filter(Boolean).map((t, i) => (
                                                            <li key={i}>{t}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <p className="text-white/80 font-semibold text-sm mb-2">Upaya:</p>
                                                    <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                                                        {[...selectedReport.upaya, ...selectedReport.upayaCustom].filter(Boolean).map((u, i) => (
                                                            <li key={i}>{u}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <p className="text-white/80 font-semibold text-sm mb-2">Dampak:</p>
                                                    <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                                                        {[...selectedReport.dampak, ...selectedReport.dampakCustom].filter(Boolean).map((d, i) => (
                                                            <li key={i}>{d}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mitra */}
                                        {selectedReport.mitra.length > 0 && (
                                            <div className="bg-white/5 rounded-lg p-4">
                                                <h3 className="font-bold text-white mb-3">Jejaring Usaha ({selectedReport.mitra.length})</h3>
                                                <div className="space-y-2">
                                                    {selectedReport.mitra.map((m, i) => (
                                                        <div key={i} className="bg-white/5 p-3 rounded">
                                                            <p className="text-white font-semibold text-sm">{m.nama}</p>
                                                            <p className="text-white/60 text-xs">{m.alamat} • {m.jenisKemitraan}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}