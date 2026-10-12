'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  KNMP_PELAKU, BPPP_COLORS, getPelakuSummaryByBppp,
  TOTAL_PELAKU, TOTAL_KUSUKA, SUDAH_ADA_COUNT,
  HIGHEST_PELAKU, HIGHEST_KUSUKA,
} from '../data/knmp_pelaku_usaha';
import {
  MapPin, Users, ChevronDown, ChevronUp, Search,
  Building2, Store, BookOpen, Trophy, Loader2,
  Eye, EyeOff, Filter, CheckCircle2, XCircle,
  Map as MapIcon, Table as TableIcon, FileSpreadsheet,
} from 'lucide-react';

const PelakuUsahaMap = dynamic(() => import('@/components/knmp/PelakuUsahaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Memuat Peta Pelaku Usaha…</span>
      </div>
    </div>
  ),
}) as React.ComponentType<{
  selectedBppp?: string | null;
  filterTahap?: 'all' | 'I' | 'II';
  showLabels?: boolean;
  showClusterLines?: boolean;
  showClusterHulls?: boolean;
  mapStyle?: 'vector' | 'osm' | 'satellite';
  themeMode?: 'light' | 'dark';
  useBlueScheme?: boolean;
  onStyleChange?: (s: 'vector' | 'osm' | 'satellite') => void;
  onThemeChange?: (t: 'light' | 'dark') => void;
}>;

const SUMMARIES = getPelakuSummaryByBppp();
const TOTAL_BELUM = KNMP_PELAKU.filter(p => p.statusData === 'belum_ada').length;

export default function PelakuUsahaPage() {
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [selectedBppp, setSelectedBppp] = useState<string | null>(null);
  const [filterTahap, setFilterTahap] = useState<'all' | 'I' | 'II'>('all');
  const [showLabels, setShowLabels] = useState(true);
  const [mapStyle, setMapStyle] = useState<'vector' | 'osm' | 'satellite'>('vector');
  const [searchQ, setSearchQ] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const q = searchQ.toLowerCase();
    return KNMP_PELAKU.filter(p => {
      if (selectedBppp && p.bppp !== selectedBppp) return false;
      if (filterTahap !== 'all' && p.tahap !== filterTahap) return false;
      if (q && !p.nama.toLowerCase().includes(q) && !p.kabupaten.toLowerCase().includes(q) &&
        !p.provinsi.toLowerCase().includes(q) && !p.desa.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [selectedBppp, filterTahap, searchQ]);

  const handleExportCSV = () => {
    const h = 'No,Kode,Nama KNMP,Desa,Kecamatan,Kabupaten,Provinsi,Status Data,Pelaku Usaha,Punya Kusuka,BPPP,Tahap';
    const rows = KNMP_PELAKU.map(p =>
      `${p.no},"${p.kode}","${p.nama}","${p.desa}","${p.kecamatan}","${p.kabupaten}","${p.provinsi}","${p.statusData ?? ''}",${p.pelakuUsaha ?? ''},${p.kusuka ?? ''},"${p.bppp}","${p.tahap}"`
    );
    const a = document.createElement('a');
    a.href = encodeURI('data:text/csv;charset=utf-8,' + [h, ...rows].join('\n'));
    a.download = 'knmp_pelaku_usaha_2025.csv'; a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* bg blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1700px] mx-auto p-4 sm:p-6 lg:p-8 space-y-5">

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <header className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" /> DATA PELAKU USAHA KNMP 2025
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700/60 border border-slate-600/50 text-slate-300">{KNMP_PELAKU.length} Titik KNMP</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">Tahap I + II</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Peta Pelaku Usaha &amp; Kepemilikan KUSUKA
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Data pelaku usaha perikanan dan kepemilikan Kartu KUSUKA (Kartu Pelaku Usaha Kelautan dan Perikanan)
                di {KNMP_PELAKU.length} titik KNMP – dipetakan ke 5 Balai Pelatihan Perikanan (BPPP).
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={() => setViewMode(v => v === 'map' ? 'table' : 'map')}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                {viewMode === 'map' ? <TableIcon className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
                {viewMode === 'map' ? 'Tabel' : 'Peta'}
              </button>
              <button onClick={handleExportCSV}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg">
                <FileSpreadsheet className="w-4 h-4" /> Unduh CSV
              </button>
            </div>
          </div>
        </header>

        {/* ── KPI CARDS ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Titik KNMP', val: KNMP_PELAKU.length, icon: MapPin, col: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Total Pelaku Usaha', val: TOTAL_PELAKU.toLocaleString('id-ID'), icon: Store, col: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Punya Kusuka', val: TOTAL_KUSUKA.toLocaleString('id-ID'), icon: BookOpen, col: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
            { label: 'Data Tersedia', val: `${SUDAH_ADA_COUNT}/${KNMP_PELAKU.length}`, icon: CheckCircle2, col: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
          ].map(k => (
            <div key={k.label} className={`bg-slate-900/70 backdrop-blur-md border rounded-2xl p-4 ${k.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <k.icon className={`w-4 h-4 ${k.col}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k.label}</span>
              </div>
              <p className={`text-3xl font-black ${k.col}`}>{k.val}</p>
            </div>
          ))}
        </div>

        {/* ── HIGHLIGHT BANNERS ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tertinggi Pelaku Usaha */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-emerald-900/40 border border-emerald-500/30 rounded-2xl p-5">
            <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 80% 50%, #10b981 0%, transparent 70%)' }} />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide mb-0.5">Pelaku Usaha Tertinggi</p>
                <h2 className="text-lg font-extrabold text-white truncate">{HIGHEST_PELAKU.nama}</h2>
                <p className="text-xs text-emerald-300/70">{HIGHEST_PELAKU.kabupaten} · {HIGHEST_PELAKU.provinsi}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-3xl font-black text-emerald-400">{HIGHEST_PELAKU.pelakuUsaha?.toLocaleString('id-ID')}</p>
                <p className="text-[10px] text-slate-500 font-bold">orang</p>
                <p className="text-xs text-slate-400 mt-1">{HIGHEST_PELAKU.bppp.replace('BPPP ', '')}</p>
              </div>
            </div>
          </div>

          {/* Tertinggi Kusuka */}
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-900/40 via-sky-900/30 to-cyan-900/40 border border-cyan-500/30 rounded-2xl p-5">
            <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 80% 50%, #06b6d4 0%, transparent 70%)' }} />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide mb-0.5">Punya KUSUKA Tertinggi</p>
                <h2 className="text-lg font-extrabold text-white truncate">{HIGHEST_KUSUKA.nama}</h2>
                <p className="text-xs text-cyan-300/70">{HIGHEST_KUSUKA.kabupaten} · {HIGHEST_KUSUKA.provinsi}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-3xl font-black text-cyan-400">{HIGHEST_KUSUKA.kusuka?.toLocaleString('id-ID')}</p>
                <p className="text-[10px] text-slate-500 font-bold">orang</p>
                <p className="text-xs text-slate-400 mt-1">{HIGHEST_KUSUKA.bppp.replace('BPPP ', '')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BPPP CLUSTER CARDS ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUMMARIES.map(sm => {
            const isActive = selectedBppp === sm.bppp;
            const pctSudah = sm.total > 0 ? Math.round((sm.sudahAda / sm.total) * 100) : 0;
            return (
              <button key={sm.bppp}
                onClick={() => setSelectedBppp(isActive ? null : sm.bppp)}
                className={`text-left bg-slate-900/70 backdrop-blur-md border rounded-2xl p-4 transition-all hover:scale-[1.02] ${isActive ? 'border-2 scale-[1.02]' : 'border-slate-800 hover:border-slate-600'}`}
                style={isActive ? { borderColor: sm.color, boxShadow: `0 0 24px ${sm.color}33` } : {}}>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20" style={{ background: sm.color }} />
                  <span className="text-[10px] text-slate-500 font-bold">{sm.total} KNMP</span>
                </div>
                <p className="text-[11px] font-extrabold text-white mb-2">{sm.bppp.replace('BPPP ', '')}</p>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pelaku Usaha</span>
                    <span className="font-black" style={{ color: sm.color }}>{sm.totalPelaku.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Punya Kusuka</span>
                    <span className="font-bold text-cyan-300">{sm.totalKusuka.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Data Tersedia</span>
                    <span className="font-bold text-emerald-400">{sm.sudahAda}/{sm.total}</span>
                  </div>
                </div>
                {/* Status bar */}
                <div className="mt-3 flex gap-1">
                  <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${pctSudah}%` }} />
                  <div className="h-1.5 rounded-full bg-slate-700 flex-1" />
                </div>
                <p className="text-[9px] text-slate-600 mt-0.5">{pctSudah}% data ada</p>
              </button>
            );
          })}
        </div>

        {/* ── FILTER BAR ────────────────────────────────────────────────────── */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Cari nama KNMP, kabupaten, provinsi…"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors" />
          </div>

          {/* Tahap filter */}
          <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1">
            {(['all', 'I', 'II'] as const).map(t => (
              <button key={t} onClick={() => setFilterTahap(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterTahap === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {t === 'all' ? 'Semua Tahap' : `Tahap ${t}`}
              </button>
            ))}
          </div>

          {selectedBppp && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border"
              style={{ borderColor: BPPP_COLORS[selectedBppp] + '60', color: BPPP_COLORS[selectedBppp], background: BPPP_COLORS[selectedBppp] + '15' }}>
              <Filter className="w-3.5 h-3.5" /> {selectedBppp}
              <button onClick={() => setSelectedBppp(null)} className="ml-1 hover:opacity-70">✕</button>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <button onClick={() => setShowLabels(v => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${showLabels ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800/60 text-slate-500 border-slate-700'}`}>
              {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} Label Total (Nelayan/Kusuka)
            </button>
          </div>
          <span className="text-xs text-slate-500 ml-auto">{filteredRows.length} titik ditampilkan</span>
        </div>

        {/* ── MAP ───────────────────────────────────────────────────────────── */}
        {viewMode === 'map' && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[840px] sm:h-[920px]">
            <PelakuUsahaMap
              selectedBppp={selectedBppp}
              filterTahap={filterTahap}
              showLabels={showLabels}
              mapStyle={mapStyle}
              themeMode="light"
              useBlueScheme={true}
              onStyleChange={setMapStyle}
            />
          </div>
        )}

        {/* ── TABLE ─────────────────────────────────────────────────────────── */}
        {viewMode === 'table' && (
          <div className="space-y-3">
            {SUMMARIES.filter(sm => !selectedBppp || sm.bppp === selectedBppp).map(sm => {
              const isExp = expanded === sm.bppp;
              const pts = sm.points.filter(p => {
                if (filterTahap !== 'all' && p.tahap !== filterTahap) return false;
                const q = searchQ.toLowerCase();
                return !q || p.nama.toLowerCase().includes(q) || p.kabupaten.toLowerCase().includes(q) || p.provinsi.toLowerCase().includes(q);
              });
              return (
                <div key={sm.bppp} className="bg-slate-900/70 border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden transition-all">
                  <button className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-all"
                    onClick={() => setExpanded(isExp ? null : sm.bppp)}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-4 h-4 rounded-full ring-2 ring-white/20 flex-shrink-0" style={{ background: sm.color }} />
                      <div className="text-left">
                        <p className="font-bold text-white text-sm">{sm.bppp}</p>
                        <p className="text-xs text-slate-400">{sm.total} KNMP · Tahap I & II</p>
                      </div>
                      <div className="hidden sm:flex gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                          style={{ background: sm.color + '20', color: sm.color, borderColor: sm.color + '40' }}>
                          🏪 {sm.totalPelaku.toLocaleString('id-ID')} Pelaku
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                          📋 {sm.totalKusuka.toLocaleString('id-ID')} Kusuka
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          ✓ {sm.sudahAda} Ada
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          ✕ {sm.belumAda} Belum
                        </span>
                      </div>
                    </div>
                    {isExp ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isExp && (
                    <div className="border-t border-slate-800 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-800/60">
                          <tr>
                            {['No', 'Kode', 'Nama KNMP', 'Desa/Kelurahan', 'Kecamatan', 'Kab/Kota', 'Provinsi', 'Status', 'Pelaku Usaha', 'Punya Kusuka', 'Tahap'].map(h => (
                              <th key={h} className="text-left px-4 py-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pts.map((p, idx) => (
                            <tr key={p.kode} className={`border-t border-slate-800/50 ${idx % 2 === 0 ? '' : 'bg-slate-800/20'} hover:bg-slate-700/30 transition-colors`}>
                              <td className="px-4 py-2.5 font-bold text-slate-400">{p.no}</td>
                              <td className="px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap text-[10px]">{p.kode}</td>
                              <td className="px-4 py-2.5 font-bold text-white whitespace-nowrap">{p.nama}</td>
                              <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{p.desa}</td>
                              <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{p.kecamatan}</td>
                              <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{p.kabupaten}</td>
                              <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{p.provinsi}</td>
                              <td className="px-4 py-2.5 whitespace-nowrap">
                                {p.statusData === 'sudah_ada'
                                  ? <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Ada</span>
                                  : p.statusData === 'belum_ada'
                                    ? <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Belum</span>
                                    : <span className="text-slate-600 text-[10px]">—</span>}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span className="font-black text-base" style={{ color: sm.color }}>{p.pelakuUsaha?.toLocaleString('id-ID') ?? '—'}</span>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span className="font-black text-base text-cyan-400">{p.kusuka?.toLocaleString('id-ID') ?? '—'}</span>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.tahap === 'I' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30' : 'bg-violet-500/10 text-violet-300 border border-violet-500/30'}`}>
                                  {p.tahap}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-800/80">
                          <tr>
                            <td colSpan={8} className="px-4 py-2.5 font-extrabold text-white text-xs">TOTAL {sm.bppp}</td>
                            <td className="px-4 py-2.5 text-center font-black text-base" style={{ color: sm.color }}>{sm.totalPelaku.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-2.5 text-center font-black text-base text-cyan-400">{sm.totalKusuka.toLocaleString('id-ID')}</td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── LEGEND + STATUS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Summary */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Status Data Pelaku Usaha
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300 font-medium">Sudah Ada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-emerald-400">{SUDAH_ADA_COUNT}</span>
                  <span className="text-xs text-slate-500">titik</span>
                </div>
              </div>
              {/* progress bar */}
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round(SUDAH_ADA_COUNT / KNMP_PELAKU.length * 100)}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300 font-medium">Belum Ada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-rose-400">{TOTAL_BELUM}</span>
                  <span className="text-xs text-slate-500">titik</span>
                </div>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.round(TOTAL_BELUM / KNMP_PELAKU.length * 100)}%` }} />
              </div>
              <div className="pt-1 border-t border-slate-800 flex justify-between text-xs">
                <span className="text-slate-500">Belum terdata</span>
                <span className="text-slate-400 font-bold">{KNMP_PELAKU.filter(p => !p.statusData).length} titik</span>
              </div>
            </div>
          </div>

          {/* Legenda Peta */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" /> Legenda Peta
            </h3>
            <div className="space-y-2.5">
              {Object.entries(BPPP_COLORS).map(([bppp, color]) => (
                <div key={bppp} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <span className="w-4 h-4 rounded-full flex-shrink-0 border border-white/20" style={{ background: color }} />
                  <span>{bppp}</span>
                </div>
              ))}
              <div className="pt-1 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 flex-shrink-0">✓ Data Ada</span>
                  <span>Data pelaku usaha tersedia</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <span className="bg-rose-500/20 text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30 flex-shrink-0">✕ Belum Ada</span>
                  <span>Data belum tersedia</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <span className="text-xs">⬤ besar = banyak pelaku usaha</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" /> Ringkasan per BPPP
            </h3>
            <div className="space-y-2">
              {SUMMARIES.map(sm => (
                <div key={sm.bppp} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: sm.color }} />
                  <span className="text-slate-300 font-medium w-28 flex-shrink-0">{sm.bppp.replace('BPPP ', '')}</span>
                  <span className="font-black" style={{ color: sm.color }}>{sm.totalPelaku.toLocaleString()}</span>
                  <span className="text-slate-600">·</span>
                  <span className="font-bold text-cyan-400">{sm.totalKusuka.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs pt-2 border-t border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 flex-shrink-0" />
                <span className="font-extrabold text-white w-28 flex-shrink-0">TOTAL</span>
                <span className="font-black text-emerald-400">{TOTAL_PELAKU.toLocaleString()}</span>
                <span className="text-slate-600">·</span>
                <span className="font-black text-cyan-400">{TOTAL_KUSUKA.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
