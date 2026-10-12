'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { BPMKP_9, KNMP_65 } from '../data/knmp65';
import { calculateDistanceKm } from '../data/clustering';
import { CoordinatePoint } from '../data/coordinates';
import { UptKkpPoint } from '../data/upt_kkp';
import {
  MapPin,
  Building2,
  Search,
  Download,
  Table as TableIcon,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
  Navigation,
  Info,
  FileSpreadsheet,
  ExternalLink,
  Loader2,
  Check,
  Copy,
} from 'lucide-react';
import { IoLogoWhatsapp } from 'react-icons/io5';

// ─── Leaflet Map (SSR disabled) ───────────────────────────────────────────
const KNMPLeafletMap = dynamic(
  () => import('@/components/knmp/KNMPLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Memuat Peta Sebaran 65 KNMP & 9 Balai Pelatihan...</span>
        </div>
      </div>
    ),
  }
);

// ─── Region color mapping ──────────────────────────────────────────────────
const REGION_COLORS: Record<string, string> = {
  'Sumatera': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Jawa & Banten': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Bali & Nusa Tenggara': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'Kalimantan': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Sulawesi & Gorontalo': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Maluku & Papua': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const BPMKP_DOT_COLORS: Record<string, string> = {
  'Sumatera': '#f59e0b',
  'Jawa & Banten': '#3b82f6',
  'Bali & Nusa Tenggara': '#8b5cf6',
  'Kalimantan': '#10b981',
  'Sulawesi & Gorontalo': '#06b6d4',
  'Maluku & Papua': '#f43f5e',
};

// ─── Nearest BPMKP calculation ───────────────────────────────────────────
function getNearestBpmkp(knmp: CoordinatePoint): { bpmkp: UptKkpPoint; distKm: number } {
  let min = Infinity;
  let nearest = BPMKP_9[0];
  for (const b of BPMKP_9) {
    const d = calculateDistanceKm(knmp.lat, knmp.lng, b.lat, b.lng);
    if (d < min) { min = d; nearest = b; }
  }
  return { bpmkp: nearest, distKm: Number(min.toFixed(1)) };
}

// Pre-compute clustering
const KNMP_WITH_NEAREST = KNMP_65.map(k => {
  const { bpmkp, distKm } = getNearestBpmkp(k);
  return { ...k, nearestBpmkp: bpmkp, distKm };
});

// Cluster summaries per BPMKP
const BPMKP_SUMMARIES = BPMKP_9.map(b => {
  const assigned = KNMP_WITH_NEAREST.filter(k => k.nearestBpmkp.id === b.id);
  const dists = assigned.map(k => k.distKm);
  return {
    bpmkp: b,
    count: assigned.length,
    points: assigned,
    avgDist: dists.length ? Number((dists.reduce((a, c) => a + c, 0) / dists.length).toFixed(1)) : 0,
    minDist: dists.length ? Math.min(...dists) : 0,
    maxDist: dists.length ? Math.max(...dists) : 0,
  };
});

const REGIONS = ['Semua', 'Sumatera', 'Jawa & Banten', 'Bali & Nusa Tenggara', 'Kalimantan', 'Sulawesi & Gorontalo', 'Maluku & Papua'] as const;

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Knmp65Map() {
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [selectedRegion, setSelectedRegion] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBpmkp, setExpandedBpmkp] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showClustering, setShowClustering] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const filteredKnmp = useMemo(() => {
    return KNMP_WITH_NEAREST.filter(k => {
      const matchRegion = selectedRegion === 'Semua' || k.region === selectedRegion;
      const q = searchQuery.toLowerCase();
      const matchSearch = q === '' ||
        k.name.toLowerCase().includes(q) ||
        k.location.toLowerCase().includes(q) ||
        k.nearestBpmkp.name.toLowerCase().includes(q) ||
        k.region.toLowerCase().includes(q);
      return matchRegion && matchSearch;
    });
  }, [selectedRegion, searchQuery]);

  const handleExportCSV = () => {
    const headers = 'No,Nama Desa/Kelurahan,Lokasi,Wilayah,Balai Pelatihan Terdekat,Jarak (km),Lat,Lng';
    const rows = KNMP_WITH_NEAREST.map(k =>
      `${k.no},"${k.name}","${k.location}","${k.region}","${k.nearestBpmkp.name}",${k.distKm},${k.lat},${k.lng}`
    );
    const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = 'sebaran_65knmp_9balai_pelatihan.csv';
    a.click();
  };

  const handleCopyAll = () => {
    const text = KNMP_WITH_NEAREST.map(k => `${k.name}\t${k.lat}\t${k.lng}\t${k.nearestBpmkp.name}\t${k.distKm}km`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-teal-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                SEBARAN KNMP
              </span>
              <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                🔴 65 Titik KNMP
              </span>
              <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
                🔵 9 Balai Pelatihan KP
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Peta Sebaran 65 KNMP terhadap 9 Balai Pelatihan KP
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Visualisasi 65 titik Kelompok Nelayan Mandiri Perikanan (KNMP) dengan clustering ke 9 Balai Pelatihan Masyarakat KP (BPMKP) terdekat. Garis putus-putus menunjukkan keterikatan ke balai terdekat.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'table' : 'map')}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              {viewMode === 'map' ? <TableIcon className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
              {viewMode === 'map' ? 'Tampilan Tabel' : 'Tampilan Peta'}
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Unduh CSV
            </button>
            <button
              onClick={handleCopyAll}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedAll ? 'Tersalin!' : 'Salin Koordinat'}
            </button>
          </div>
        </header>

        {/* ── Stat Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {BPMKP_SUMMARIES.map(s => (
            <div
              key={s.bpmkp.id}
              className="bg-slate-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-600 rounded-2xl p-4 transition-all cursor-pointer group"
              onClick={() => setExpandedBpmkp(expandedBpmkp === s.bpmkp.id ? null : s.bpmkp.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: BPMKP_DOT_COLORS[s.bpmkp.region] ?? '#64748b' }}
                />
                <span className="text-[10px] text-slate-500 font-bold">{s.bpmkp.no}</span>
              </div>
              <p className="text-xs font-bold text-white leading-snug mt-1 truncate group-hover:text-emerald-300 transition-colors">
                {s.bpmkp.name.replace('BPMKP ', '').replace('BBPPPKP ', '')}
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-black text-white">{s.count}</span>
                <span className="text-[10px] text-slate-500 font-semibold">KNMP</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">avg {s.avgDist} km</p>
            </div>
          ))}
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────────── */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari desa, balai, wilayah..."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedRegion === r
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setShowClustering(v => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showClustering ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' : 'bg-slate-800/60 text-slate-500 border-slate-700'
              }`}
            >
              Garis Kluster
            </button>
            <button
              onClick={() => setShowLabels(v => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showLabels ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800/60 text-slate-500 border-slate-700'
              }`}
            >
              Label UPT
            </button>
          </div>
        </div>

        {/* ── Map View ───────────────────────────────────────────────── */}
        {viewMode === 'map' && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[580px] sm:h-[650px]">
            <KNMPLeafletMap
              knmpPoints={filteredKnmp}
              uptPoints={BPMKP_9}
              showClustering={showClustering}
              showUptLabels={showLabels}
              activeDataset="all"
            />
          </div>
        )}

        {/* ── Table View ─────────────────────────────────────────────── */}
        {viewMode === 'table' && (
          <div className="space-y-4">
            {/* Per-BPMKP cluster accordion */}
            {BPMKP_SUMMARIES.filter(s =>
              selectedRegion === 'Semua' || s.bpmkp.region === selectedRegion
            ).map(s => (
              <div key={s.bpmkp.id} className="bg-slate-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden transition-all">
                <button
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-all"
                  onClick={() => setExpandedBpmkp(expandedBpmkp === s.bpmkp.id ? null : s.bpmkp.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-lg"
                      style={{ background: BPMKP_DOT_COLORS[s.bpmkp.region] ?? '#64748b' }}
                    />
                    <div className="text-left">
                      <p className="font-bold text-white text-sm">{s.bpmkp.name}</p>
                      <p className="text-xs text-slate-400">{s.bpmkp.region}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${REGION_COLORS[s.bpmkp.region] ?? 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {s.count} KNMP
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Avg {s.avgDist} km | Min {s.minDist} km | Max {s.maxDist} km
                    </span>
                  </div>
                  {expandedBpmkp === s.bpmkp.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {expandedBpmkp === s.bpmkp.id && (
                  <div className="border-t border-slate-800 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-800/60">
                        <tr>
                          {['No', 'Desa/Kelurahan', 'Lokasi (Kecamatan, Kab/Kota, Provinsi)', 'Wilayah', 'Jarak ke Balai (km)', 'Koordinat'].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.points.filter(k => {
                          const q = searchQuery.toLowerCase();
                          return q === '' || k.name.toLowerCase().includes(q) || k.location.toLowerCase().includes(q);
                        }).map((k, idx) => (
                          <tr key={k.id} className={`border-t border-slate-800/50 ${idx % 2 === 0 ? '' : 'bg-slate-800/20'} hover:bg-slate-700/30 transition-colors`}>
                            <td className="px-4 py-2.5 font-bold text-slate-400">{k.no}</td>
                            <td className="px-4 py-2.5 font-semibold text-white whitespace-nowrap">{k.name}</td>
                            <td className="px-4 py-2.5 text-slate-300">{k.location}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${REGION_COLORS[k.region] ?? ''}`}>
                                {k.region}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="font-bold text-emerald-400">{k.distKm} km</span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                              {k.lat.toFixed(4)}, {k.lng.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            {/* Full KNMP Table */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-white">Daftar Lengkap 65 Titik KNMP</h3>
                <span className="text-xs text-slate-400">{filteredKnmp.length} dari 65 titik</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-800/60">
                    <tr>
                      {['No', 'Desa / Kelurahan', 'Kecamatan / Kab / Provinsi', 'Wilayah', 'Balai Pelatihan Terdekat', 'Jarak (km)', 'Lat', 'Lng'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKnmp.map((k, idx) => (
                      <tr key={k.id} className={`border-t border-slate-800/50 ${idx % 2 === 0 ? '' : 'bg-slate-800/20'} hover:bg-slate-700/30 transition-colors`}>
                        <td className="px-4 py-2.5 font-bold text-slate-400">{k.no}</td>
                        <td className="px-4 py-2.5 font-semibold text-white whitespace-nowrap">{k.name}</td>
                        <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{k.location}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${REGION_COLORS[k.region] ?? ''}`}>
                            {k.region}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: BPMKP_DOT_COLORS[k.nearestBpmkp.region] ?? '#64748b' }}
                            />
                            <span className="text-slate-200 font-medium">{k.nearestBpmkp.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-bold text-emerald-400">{k.distKm}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 font-mono">{k.lat.toFixed(4)}</td>
                        <td className="px-4 py-2.5 text-slate-400 font-mono">{k.lng.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Legend & Info ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Legend */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              Legenda Peta
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="w-4 h-4 rounded-full bg-red-500 border-2 border-white flex-shrink-0" />
                <span>Titik KNMP (65 desa)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white flex-shrink-0" />
                <span>Balai Pelatihan KP / BPMKP (9 UPT)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="w-10 h-px border-t-2 border-dashed border-sky-400 flex-shrink-0" />
                <span>Garis kluster – KNMP ke Balai Pelatihan terdekat</span>
              </div>
            </div>
          </div>

          {/* 9 Balai Pelatihan list */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              9 Balai Pelatihan KP (BPMKP)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {BPMKP_9.map(b => (
                <div key={b.id} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: BPMKP_DOT_COLORS[b.region] ?? '#64748b' }}
                  />
                  <span className="text-slate-300 font-medium">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
