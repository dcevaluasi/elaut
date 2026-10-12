'use client';

import React, { useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  BPPP_5,
  NELAYAN_65,
  getBpppClusterSummaries,
} from '../data/knmp_nelayan';
import {
  MapPin, Building2, Users, Search, Table as TableIcon,
  Map as MapIcon, ChevronDown, ChevronUp, Info,
  FileSpreadsheet, Loader2, Anchor, Ship, Home,
  Filter, Trophy, TrendingUp, Presentation, Eye, EyeOff,
} from 'lucide-react';

// ─── Dynamic Leaflet Map ─────────────────────────────────────────────────────
const NelayanLeafletMap = dynamic(
  () => import('@/components/knmp/NelayanLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Memuat Peta…</span>
        </div>
      </div>
    ),
  }
);

// ─── Pre-compute ─────────────────────────────────────────────────────────────
const SUMMARIES = getBpppClusterSummaries();
const TOTAL_ANGGOTA = NELAYAN_65.reduce((s, p) => s + p.jumlahAnggota, 0);
const TOTAL_ORG    = NELAYAN_65.reduce((s, p) => s + p.jumlahOrgPdLaut, 0);
const TOTAL_RTN    = NELAYAN_65.reduce((s, p) => s + p.jumlahRTN, 0);

const TOP3 = [...NELAYAN_65].sort((a, b) => b.jumlahAnggota - a.jumlahAnggota).slice(0, 3);
const HIGHEST = TOP3[0];

// ─── PPTX generator (client-side, using pptxgenjs) ───────────────────────────
async function generatePptx() {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const prs = new PptxGenJS();

  prs.layout   = 'LAYOUT_WIDE';
  prs.author   = 'ELAUT – BPPSDMKP';
  prs.company  = 'Kementerian Kelautan dan Perikanan';
  prs.subject  = 'Sebaran Nelayan KNMP – 5 BPPP';
  prs.title    = 'Peta Sebaran Nelayan KNMP terhadap 5 BPPP';

  // Color palette per BPPP (hex without #)
  const COLORS: Record<string, string> = {
    'BPPP Medan':      'f59e0b',
    'BPPP Tegal':      '3b82f6',
    'BPPP Banyuwangi': '10b981',
    'BPPP Bitung':     '8b5cf6',
    'BPPP Ambon':      'f43f5e',
  };

  const BG   = '0f172a';
  const CARD = '1e293b';
  const TEXT = 'f1f5f9';
  const SUB  = '94a3b8';

  // ── Slide 1: Cover ─────────────────────────────────────────────────────────
  {
    const s = prs.addSlide();
    s.background = { color: BG };

    // Top accent bar
    s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: '3b82f6' } });

    // Flag / anchor icon area
    s.addShape(prs.ShapeType.ellipse, { x: 0.5, y: 0.6, w: 1.4, h: 1.4, fill: { color: '1d4ed8' }, line: { color: '93c5fd', width: 2 } });
    s.addText('⚓', { x: 0.55, y: 0.7, w: 1.3, h: 1.2, fontSize: 36, align: 'center', valign: 'middle' });

    s.addText('PETA SEBARAN NELAYAN', {
      x: 2.1, y: 0.7, w: 10, h: 0.7,
      fontSize: 32, bold: true, color: TEXT, fontFace: 'Calibri',
    });
    s.addText('Kelompok Nelayan Mandiri Perikanan (KNMP)', {
      x: 2.1, y: 1.4, w: 10, h: 0.5,
      fontSize: 18, color: '93c5fd', fontFace: 'Calibri',
    });
    s.addText('terhadap 5 Balai Pelatihan Perikanan (BPPP)', {
      x: 2.1, y: 1.85, w: 10, h: 0.45,
      fontSize: 18, color: '93c5fd', fontFace: 'Calibri',
    });

    // Divider
    s.addShape(prs.ShapeType.rect, { x: 2.1, y: 2.4, w: 7, h: 0.03, fill: { color: '334155' } });

    // 4 KPI cards
    const kpis = [
      { label: 'Titik KNMP',     value: '65',                      color: '3b82f6' },
      { label: 'Total Nelayan',  value: TOTAL_ANGGOTA.toLocaleString('id-ID'), color: 'f59e0b' },
      { label: 'Org di Laut',   value: TOTAL_ORG.toLocaleString('id-ID'),    color: '06b6d4' },
      { label: 'RTN',           value: TOTAL_RTN.toLocaleString('id-ID'),    color: '8b5cf6' },
    ];
    kpis.forEach((k, i) => {
      const x = 0.5 + i * 3.15;
      s.addShape(prs.ShapeType.roundRect, { x, y: 2.6, w: 2.9, h: 1.3, fill: { color: CARD }, line: { color: k.color, width: 1.5 }, rectRadius: 0.12 });
      s.addText(k.value, { x, y: 2.65, w: 2.9, h: 0.72, fontSize: 28, bold: true, color: k.color, align: 'center', valign: 'bottom', fontFace: 'Calibri' });
      s.addText(k.label, { x, y: 3.32, w: 2.9, h: 0.35, fontSize: 11, color: SUB, align: 'center', fontFace: 'Calibri' });
    });

    // 5 BPPP dots row
    s.addText('5 Balai Pelatihan Perikanan (BPPP):', {
      x: 0.5, y: 4.1, w: 12, h: 0.35, fontSize: 12, bold: true, color: SUB, fontFace: 'Calibri',
    });
    BPPP_5.forEach((b, i) => {
      const x = 0.5 + i * 2.55;
      const col = COLORS[b.name] ?? '64748b';
      s.addShape(prs.ShapeType.ellipse, { x, y: 4.5, w: 0.22, h: 0.22, fill: { color: col } });
      s.addText(b.name.replace('BPPP ', ''), { x: x + 0.28, y: 4.47, w: 2.2, h: 0.28, fontSize: 12, color: TEXT, bold: true, fontFace: 'Calibri' });
      const sum = SUMMARIES.find(s => s.bppp.name === b.name);
      s.addText(`${sum?.points.length ?? 0} KNMP · ${sum?.totalAnggota ?? 0} nelayan`, {
        x: x + 0.28, y: 4.73, w: 2.2, h: 0.22, fontSize: 9, color: SUB, fontFace: 'Calibri',
      });
    });

    s.addText('BPPSDMKP – Kementerian Kelautan dan Perikanan  |  Data Tahun 2025', {
      x: 0, y: 6.85, w: '100%', h: 0.28, fontSize: 9, color: '475569', align: 'center', fontFace: 'Calibri',
    });
    s.addShape(prs.ShapeType.rect, { x: 0, y: 7.1, w: '100%', h: 0.05, fill: { color: '3b82f6' } });
  }

  // ── Slide 2: Ringkasan per BPPP (bar chart visual) ─────────────────────────
  {
    const s = prs.addSlide();
    s.background = { color: BG };
    s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: '3b82f6' } });

    s.addText('Ringkasan Klusterisasi per BPPP', {
      x: 0.5, y: 0.2, w: 12, h: 0.6, fontSize: 24, bold: true, color: TEXT, fontFace: 'Calibri',
    });
    s.addText('Distribusi 65 Titik KNMP dan Jumlah Nelayan ke 5 Balai Pelatihan Perikanan', {
      x: 0.5, y: 0.8, w: 12, h: 0.35, fontSize: 13, color: SUB, fontFace: 'Calibri',
    });

    const maxPts = Math.max(...SUMMARIES.map(s => s.points.length));
    const maxNel = Math.max(...SUMMARIES.map(s => s.totalAnggota));

    SUMMARIES.forEach((sm, i) => {
      const col = COLORS[sm.bppp.name] ?? '64748b';
      const y = 1.35 + i * 1.05;

      // Row bg
      s.addShape(prs.ShapeType.roundRect, {
        x: 0.4, y, w: 12.5, h: 0.9, fill: { color: CARD }, line: { color: col, width: 1 }, rectRadius: 0.08,
      });

      // Color dot
      s.addShape(prs.ShapeType.ellipse, { x: 0.6, y: y + 0.32, w: 0.28, h: 0.28, fill: { color: col } });

      // BPPP name + region
      s.addText(sm.bppp.name, { x: 1.0, y: y + 0.05, w: 2.5, h: 0.42, fontSize: 14, bold: true, color: TEXT, fontFace: 'Calibri', valign: 'bottom' });
      s.addText(`No. ${sm.bppp.no}`, { x: 1.0, y: y + 0.5, w: 2.5, h: 0.32, fontSize: 10, color: SUB, fontFace: 'Calibri' });

      // KNMP bar
      const knmpW = (sm.points.length / maxPts) * 3.5;
      s.addShape(prs.ShapeType.rect, { x: 3.6, y: y + 0.15, w: 3.5, h: 0.26, fill: { color: '1e3a5f' } });
      s.addShape(prs.ShapeType.rect, { x: 3.6, y: y + 0.15, w: Math.max(knmpW, 0.05), h: 0.26, fill: { color: col } });
      s.addText(`${sm.points.length} KNMP`, { x: 7.2, y: y + 0.1, w: 1.5, h: 0.38, fontSize: 13, bold: true, color: col, fontFace: 'Calibri' });

      // Nelayan bar
      const nelW = (sm.totalAnggota / maxNel) * 3.5;
      s.addShape(prs.ShapeType.rect, { x: 3.6, y: y + 0.52, w: 3.5, h: 0.26, fill: { color: '1e3a5f' } });
      s.addShape(prs.ShapeType.rect, { x: 3.6, y: y + 0.52, w: Math.max(nelW, 0.05), h: 0.26, fill: { color: col } });
      s.addText(`${sm.totalAnggota} Nelayan`, { x: 7.2, y: y + 0.47, w: 2.2, h: 0.38, fontSize: 13, bold: true, color: TEXT, fontFace: 'Calibri' });

      // Extra stats
      s.addText(`Org Laut: ${sm.totalOrgPdLaut}  |  RTN: ${sm.totalRTN}  |  Avg/titik: ${sm.avgAnggota}`, {
        x: 9.5, y: y + 0.25, w: 3.2, h: 0.42, fontSize: 10, color: SUB, fontFace: 'Calibri', align: 'right',
      });
    });

    // Totals footer
    s.addShape(prs.ShapeType.rect, { x: 0.4, y: 6.65, w: 12.5, h: 0.03, fill: { color: '334155' } });
    s.addText(`Total: 65 KNMP  |  ${TOTAL_ANGGOTA} Nelayan  |  ${TOTAL_ORG} Org Laut  |  ${TOTAL_RTN} RTN`, {
      x: 0.4, y: 6.72, w: 12.5, h: 0.35, fontSize: 12, bold: true, color: TEXT, align: 'center', fontFace: 'Calibri',
    });
  }

  // ── Slide 3: Top 10 Titik Tertinggi ────────────────────────────────────────
  {
    const s = prs.addSlide();
    s.background = { color: BG };
    s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: 'f59e0b' } });

    s.addText('Top 10 Titik KNMP – Jumlah Nelayan Tertinggi', {
      x: 0.5, y: 0.2, w: 12.5, h: 0.6, fontSize: 22, bold: true, color: TEXT, fontFace: 'Calibri',
    });

    const top10 = [...NELAYAN_65].sort((a, b) => b.jumlahAnggota - a.jumlahAnggota).slice(0, 10);
    const maxVal = top10[0].jumlahAnggota;

    top10.forEach((p, i) => {
      const col = COLORS[p.upt] ?? '64748b';
      const y = 0.95 + i * 0.595;
      const barW = (p.jumlahAnggota / maxVal) * 6.5;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

      s.addText(medal, { x: 0.3, y: y + 0.05, w: 0.6, h: 0.45, fontSize: i < 3 ? 18 : 13, align: 'center', color: TEXT, fontFace: 'Calibri' });

      s.addShape(prs.ShapeType.ellipse, { x: 0.95, y: y + 0.12, w: 0.22, h: 0.22, fill: { color: col } });
      s.addText(p.desaKota, { x: 1.22, y: y + 0.02, w: 3.0, h: 0.32, fontSize: 12, bold: true, color: TEXT, fontFace: 'Calibri', valign: 'bottom' });
      s.addText(`${p.kabupaten}, ${p.provinsi}  ·  ${p.upt}`, { x: 1.22, y: y + 0.32, w: 3.5, h: 0.25, fontSize: 9, color: SUB, fontFace: 'Calibri' });

      s.addShape(prs.ShapeType.rect, { x: 4.7, y: y + 0.15, w: 6.5, h: 0.25, fill: { color: '1e3a5f' } });
      s.addShape(prs.ShapeType.rect, { x: 4.7, y: y + 0.15, w: Math.max(barW, 0.1), h: 0.25, fill: { color: col } });
      s.addText(`${p.jumlahAnggota}`, { x: 11.3, y: y + 0.1, w: 1.0, h: 0.35, fontSize: 13, bold: true, color: col, fontFace: 'Calibri', align: 'right' });
    });
  }

  // ── Slide 4–8: Detail per BPPP ─────────────────────────────────────────────
  for (const sm of SUMMARIES) {
    const s = prs.addSlide();
    const col = COLORS[sm.bppp.name] ?? '64748b';
    s.background = { color: BG };
    s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: col } });

    // Header
    s.addShape(prs.ShapeType.ellipse, { x: 0.4, y: 0.2, w: 0.7, h: 0.7, fill: { color: col } });
    s.addText(sm.bppp.no.toString(), { x: 0.4, y: 0.2, w: 0.7, h: 0.7, fontSize: 22, bold: true, color: '000000', align: 'center', valign: 'middle', fontFace: 'Calibri' });
    s.addText(sm.bppp.name, { x: 1.25, y: 0.22, w: 8, h: 0.45, fontSize: 22, bold: true, color: TEXT, fontFace: 'Calibri' });
    s.addText(`Balai Pelatihan Perikanan – ${sm.points.length} Titik KNMP`, { x: 1.25, y: 0.65, w: 8, h: 0.3, fontSize: 12, color: SUB, fontFace: 'Calibri' });

    // 3 KPIs
    [
      { label: 'Total Anggota', v: sm.totalAnggota },
      { label: 'Org di Laut',  v: sm.totalOrgPdLaut },
      { label: 'RTN',          v: sm.totalRTN },
    ].forEach((k, i) => {
      const x = 9.5 + i * 1.55;
      s.addShape(prs.ShapeType.roundRect, { x, y: 0.2, w: 1.4, h: 0.82, fill: { color: CARD }, line: { color: col, width: 1 }, rectRadius: 0.08 });
      s.addText(k.v.toString(), { x, y: 0.22, w: 1.4, h: 0.5, fontSize: 18, bold: true, color: col, align: 'center', fontFace: 'Calibri' });
      s.addText(k.label, { x, y: 0.7, w: 1.4, h: 0.25, fontSize: 8, color: SUB, align: 'center', fontFace: 'Calibri' });
    });

    // Table header
    const colX = [0.3, 3.0, 5.4, 7.6, 9.4, 10.8, 12.0];
    const colLabels = ['Desa/Kelurahan', 'Kabupaten', 'Provinsi', 'Anggota', 'Org Laut', 'RTN'];
    s.addShape(prs.ShapeType.rect, { x: 0.3, y: 1.1, w: 13, h: 0.38, fill: { color: col } });
    colLabels.forEach((lbl, ci) => {
      s.addText(lbl, { x: colX[ci], y: 1.1, w: colX[ci + 1] - colX[ci] - 0.05, h: 0.38, fontSize: 9, bold: true, color: '0f172a', fontFace: 'Calibri', valign: 'middle' });
    });

    const maxRows = Math.min(sm.points.length, 18);
    sm.points.slice(0, maxRows).forEach((p, ri) => {
      const ry = 1.52 + ri * 0.3;
      s.addShape(prs.ShapeType.rect, {
        x: 0.3, y: ry, w: 13, h: 0.29,
        fill: { color: ri % 2 === 0 ? CARD : '162032' },
      });
      const vals = [p.desaKota, p.kabupaten, p.provinsi, p.jumlahAnggota.toString(), p.jumlahOrgPdLaut.toString(), p.jumlahRTN.toString()];
      vals.forEach((v, ci) => {
        const isNum = ci >= 3;
        s.addText(v, {
          x: colX[ci] + 0.05, y: ry + 0.02, w: colX[ci + 1] - colX[ci] - 0.1, h: 0.26,
          fontSize: isNum ? 10 : 9,
          bold: isNum,
          color: isNum ? col : TEXT,
          fontFace: 'Calibri',
          align: isNum ? 'center' : 'left',
          valign: 'middle',
        });
      });
    });

    if (sm.points.length > maxRows) {
      s.addText(`... dan ${sm.points.length - maxRows} titik lainnya`, {
        x: 0.3, y: 6.95, w: 13, h: 0.2, fontSize: 9, color: SUB, align: 'center', fontFace: 'Calibri',
      });
    }

    s.addShape(prs.ShapeType.rect, { x: 0, y: 7.1, w: '100%', h: 0.05, fill: { color: col } });
  }

  // ── Slide 9: Penutup ────────────────────────────────────────────────────────
  {
    const s = prs.addSlide();
    s.background = { color: BG };
    s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: '3b82f6' } });

    s.addShape(prs.ShapeType.ellipse, { x: 5.5, y: 1.0, w: 2.5, h: 2.5, fill: { color: '1d4ed8' }, line: { color: '93c5fd', width: 2 } });
    s.addText('⚓', { x: 5.5, y: 1.0, w: 2.5, h: 2.5, fontSize: 58, align: 'center', valign: 'middle' });

    s.addText('Terima Kasih', { x: 1, y: 3.7, w: 11.5, h: 0.8, fontSize: 36, bold: true, color: TEXT, align: 'center', fontFace: 'Calibri' });
    s.addText('Data Sebaran Nelayan KNMP – 5 BPPP', { x: 1, y: 4.5, w: 11.5, h: 0.5, fontSize: 16, color: '93c5fd', align: 'center', fontFace: 'Calibri' });
    s.addText(`Total: ${TOTAL_ANGGOTA} Nelayan  ·  65 Titik KNMP  ·  5 Balai Pelatihan`, {
      x: 1, y: 5.1, w: 11.5, h: 0.4, fontSize: 13, color: SUB, align: 'center', fontFace: 'Calibri',
    });

    s.addShape(prs.ShapeType.rect, { x: 3, y: 5.7, w: 7.5, h: 0.03, fill: { color: '334155' } });
    s.addText('BPPSDMKP – Kementerian Kelautan dan Perikanan', {
      x: 1, y: 5.82, w: 11.5, h: 0.35, fontSize: 12, color: '475569', align: 'center', fontFace: 'Calibri',
    });
    s.addShape(prs.ShapeType.rect, { x: 0, y: 7.1, w: '100%', h: 0.05, fill: { color: '3b82f6' } });
  }

  await prs.writeFile({ fileName: 'sebaran_nelayan_65knmp_5bppp.pptx' });
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SebaranNelayanPage() {
  const [viewMode, setViewMode]     = useState<'map' | 'table'>('map');
  const [selectedBpppId, setSelectedBpppId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showClustering, setShowClustering] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showNelayanCount, setShowNelayanCount] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPptxLoading, setIsPptxLoading] = useState(false);

  const selectedBppp    = BPPP_5.find(b => b.id === selectedBpppId);
  const selectedSummary = SUMMARIES.find(s => s.bppp.id === selectedBpppId);

  const filteredPoints = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return NELAYAN_65.filter(n => {
      const matchBppp   = !selectedBpppId || n.upt === (selectedBppp?.name ?? '');
      const matchSearch = q === '' ||
        n.desaKota.toLowerCase().includes(q)   ||
        n.kecamatan.toLowerCase().includes(q)  ||
        n.kabupaten.toLowerCase().includes(q)  ||
        n.provinsi.toLowerCase().includes(q)   ||
        n.upt.toLowerCase().includes(q);
      return matchBppp && matchSearch;
    });
  }, [selectedBpppId, selectedBppp, searchQuery]);

  const handleExportCSV = () => {
    const headers = 'No,Desa/Kelurahan,Kecamatan,Kabupaten,Provinsi,UPT BPPP,Jml Anggota,Jml Org di Laut,Jml RTN,Lat,Lng';
    const rows = NELAYAN_65.map(n =>
      `${n.no},"${n.desaKota}","${n.kecamatan}","${n.kabupaten}","${n.provinsi}","${n.upt}",${n.jumlahAnggota},${n.jumlahOrgPdLaut},${n.jumlahRTN},${n.lat},${n.lng}`
    );
    const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const a = document.createElement('a'); a.href = encodeURI(csv);
    a.download = 'sebaran_nelayan_65knmp_5bppp.csv'; a.click();
  };

  const handleExportPptx = async () => {
    setIsPptxLoading(true);
    try { await generatePptx(); }
    finally { setIsPptxLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* decorative bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-sky-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-5">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5" /> PETA SEBARAN NELAYAN KNMP
              </span>
              <span className="bg-slate-700/60 border border-slate-600/50 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">65 Titik KNMP</span>
              <span className="bg-slate-700/60 border border-slate-600/50 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">5 BPPP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Peta Sebaran Nelayan &amp; Klusterisasi 5 BPPP
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Jumlah nelayan (anggota, org di laut, RTN) di 65 titik KNMP dipetakan ke 5 Balai Pelatihan
              Perikanan. Ukuran titik proporsional dengan jumlah anggota.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setViewMode(v => v === 'map' ? 'table' : 'map')}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
              {viewMode === 'map' ? <TableIcon className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
              {viewMode === 'map' ? 'Tampilan Tabel' : 'Tampilan Peta'}
            </button>
            <button onClick={handleExportCSV}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95">
              <FileSpreadsheet className="w-4 h-4" /> Unduh CSV
            </button>
            <button onClick={handleExportPptx} disabled={isPptxLoading}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-60 text-white border border-orange-400/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95">
              {isPptxLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat PPTX…</>
                : <><Presentation className="w-4 h-4" /> Unduh PPTX</>}
            </button>
          </div>
        </header>

        {/* ── Global Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Titik KNMP',     value: '65',                               icon: MapPin,  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Total Anggota Nelayan', value: TOTAL_ANGGOTA.toLocaleString('id-ID'), icon: Users,   color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Total Org di Laut',     value: TOTAL_ORG.toLocaleString('id-ID'),    icon: Ship,    color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20' },
            { label: 'Total RTN',             value: TOTAL_RTN.toLocaleString('id-ID'),    icon: Home,    color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
          ].map(stat => (
            <div key={stat.label} className={`bg-slate-900/70 backdrop-blur-md border rounded-2xl p-4 ${stat.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Top 3 Tertinggi Banner ───────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-amber-900/40 via-yellow-900/30 to-amber-900/40 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Jumlah Nelayan Tertinggi</p>
              <h2 className="text-xl font-extrabold text-white">{HIGHEST.desaKota}</h2>
              <p className="text-xs text-amber-300/80">{HIGHEST.kecamatan}, {HIGHEST.kabupaten} · {HIGHEST.upt}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 sm:ml-4">
            {[
              { label: 'Anggota', val: HIGHEST.jumlahAnggota, color: '#f59e0b' },
              { label: 'Org Laut', val: HIGHEST.jumlahOrgPdLaut, color: '#06b6d4' },
              { label: 'RTN', val: HIGHEST.jumlahRTN, color: '#8b5cf6' },
            ].map(k => (
              <div key={k.label} className="text-center">
                <p className="text-2xl font-black" style={{ color: k.color }}>{k.val}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Top 3 podium mini */}
          <div className="ml-auto hidden lg:flex gap-3">
            {TOP3.map((p, i) => {
              const bppp = BPPP_5.find(b => b.name === p.upt);
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={p.id} className="text-center bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-700/60 min-w-[130px]">
                  <p className="text-lg mb-0.5">{medals[i]}</p>
                  <p className="text-[11px] font-bold text-white leading-tight">{p.desaKota}</p>
                  <p className="text-[9px] text-slate-500">{p.kabupaten}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: bppp?.color }} />
                    <p className="text-[9px]" style={{ color: bppp?.color }}>{p.upt.replace('BPPP ', '')}</p>
                  </div>
                  <p className="text-lg font-black mt-1" style={{ color: bppp?.color }}>{p.jumlahAnggota}</p>
                  <p className="text-[9px] text-slate-500">anggota</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BPPP Cluster Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUMMARIES.map(sm => {
            const isActive = selectedBpppId === sm.bppp.id;
            return (
              <button
                key={sm.bppp.id}
                onClick={() => setSelectedBpppId(isActive ? null : sm.bppp.id)}
                className={`group text-left bg-slate-900/70 backdrop-blur-md border rounded-2xl p-4 transition-all hover:scale-[1.02] ${isActive ? 'border-2 scale-[1.02]' : 'border-slate-800 hover:border-slate-600'}`}
                style={isActive ? { borderColor: sm.bppp.color, boxShadow: `0 0 22px ${sm.bppp.color}33` } : {}}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20" style={{ background: sm.bppp.color }} />
                  <span className="text-[10px] text-slate-500 font-bold">#{sm.bppp.no}</span>
                </div>
                <p className="text-xs font-extrabold text-white mb-2">{sm.bppp.name.replace('BPPP ', '')}</p>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">KNMP</span>
                    <span className="font-black" style={{ color: sm.bppp.color }}>{sm.points.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nelayan</span>
                    <span className="font-bold text-white">{sm.totalAnggota}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Org Laut</span>
                    <span className="font-semibold text-cyan-300">{sm.totalOrgPdLaut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">RTN</span>
                    <span className="font-semibold text-violet-300">{sm.totalRTN}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.round((sm.points.length / 65) * 100)}%`, background: sm.bppp.color }} />
                </div>
                <p className="text-[9px] text-slate-600 mt-0.5">{Math.round((sm.points.length / 65) * 100)}% dari total</p>
              </button>
            );
          })}
        </div>

        {/* ── Filter & Toggle bar ──────────────────────────────────────────── */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari desa, kabupaten, provinsi…"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>

          {selectedBpppId && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border"
              style={{ borderColor: selectedBppp?.color + '60', color: selectedBppp?.color, background: selectedBppp?.color + '15' }}>
              <Filter className="w-3.5 h-3.5" /> Filter: {selectedBppp?.name}
              <button onClick={() => setSelectedBpppId(null)} className="ml-1 hover:opacity-70">✕</button>
            </div>
          )}

          <div className="flex gap-2 ml-auto flex-wrap">
            <button onClick={() => setShowClustering(v => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${showClustering ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' : 'bg-slate-800/60 text-slate-500 border-slate-700'}`}>
              Garis Kluster
            </button>
            <button onClick={() => setShowLabels(v => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${showLabels ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800/60 text-slate-500 border-slate-700'}`}>
              Label BPPP
            </button>
            <button onClick={() => setShowNelayanCount(v => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${showNelayanCount ? 'bg-amber-600/20 text-amber-300 border-amber-500/40' : 'bg-slate-800/60 text-slate-500 border-slate-700'}`}>
              {showNelayanCount ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Jml Nelayan
            </button>
          </div>
        </div>

        {/* ── Map View ────────────────────────────────────────────────────── */}
        {viewMode === 'map' && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[600px] sm:h-[680px]">
            <NelayanLeafletMap
              showClustering={showClustering}
              showLabels={showLabels}
              showNelayanCount={showNelayanCount}
              selectedBpppId={selectedBpppId}
              onSelectBppp={setSelectedBpppId}
            />
          </div>
        )}

        {/* ── Table View ──────────────────────────────────────────────────── */}
        {viewMode === 'table' && (
          <div className="space-y-3">
            {SUMMARIES.map(sm => {
              const isExpanded = expandedId === sm.bppp.id;
              const pts = sm.points.filter(p => {
                const q = searchQuery.toLowerCase();
                return q === '' || p.desaKota.toLowerCase().includes(q) || p.kabupaten.toLowerCase().includes(q) || p.provinsi.toLowerCase().includes(q);
              });
              return (
                <div key={sm.bppp.id} className="bg-slate-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden transition-all">
                  <button className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-all"
                    onClick={() => setExpandedId(isExpanded ? null : sm.bppp.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full ring-2 ring-white/20" style={{ background: sm.bppp.color }} />
                      <div className="text-left">
                        <p className="font-bold text-white text-sm">{sm.bppp.name}</p>
                        <p className="text-xs text-slate-400">{sm.points.length} titik KNMP</p>
                      </div>
                      <div className="hidden sm:flex gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                          style={{ background: sm.bppp.color + '20', color: sm.bppp.color, borderColor: sm.bppp.color + '40' }}>
                          👥 {sm.totalAnggota} nelayan
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">🚢 {sm.totalOrgPdLaut}</span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-violet-300 border border-slate-700">🏠 {sm.totalRTN}</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-800 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-800/60">
                          <tr>
                            {['No', 'Desa/Kelurahan', 'Kecamatan', 'Kab/Kota', 'Provinsi', 'Anggota', 'Org Laut', 'RTN', 'Koordinat'].map(h => (
                              <th key={h} className="text-left px-4 py-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pts.map((p, idx) => (
                            <tr key={p.id} className={`border-t border-slate-800/50 ${idx % 2 === 0 ? '' : 'bg-slate-800/20'} hover:bg-slate-700/30 transition-colors`}>
                              <td className="px-4 py-2.5 font-bold text-slate-400">{p.no}</td>
                              <td className="px-4 py-2.5 font-semibold text-white whitespace-nowrap">{p.desaKota}</td>
                              <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{p.kecamatan}</td>
                              <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{p.kabupaten}</td>
                              <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{p.provinsi}</td>
                              <td className="px-4 py-2.5 text-center"><span className="font-black text-base" style={{ color: sm.bppp.color }}>{p.jumlahAnggota}</span></td>
                              <td className="px-4 py-2.5 text-center font-bold text-cyan-400">{p.jumlahOrgPdLaut}</td>
                              <td className="px-4 py-2.5 text-center font-bold text-violet-400">{p.jumlahRTN}</td>
                              <td className="px-4 py-2.5 text-slate-500 font-mono text-[10px] whitespace-nowrap">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-800/80">
                          <tr>
                            <td colSpan={5} className="px-4 py-2.5 font-extrabold text-white text-xs">TOTAL {sm.bppp.name}</td>
                            <td className="px-4 py-2.5 text-center font-black text-base" style={{ color: sm.bppp.color }}>{sm.totalAnggota}</td>
                            <td className="px-4 py-2.5 text-center font-black text-cyan-400">{sm.totalOrgPdLaut}</td>
                            <td className="px-4 py-2.5 text-center font-black text-violet-400">{sm.totalRTN}</td>
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

        {/* ── Legend + Summary ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" /> Legenda Peta
            </h3>
            <div className="space-y-2">
              {BPPP_5.map(b => (
                <div key={b.id} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <span className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white/30" style={{ background: b.color }} />
                  <span>Kluster <strong>{b.name}</strong></span>
                </div>
              ))}
              <div className="pt-1 border-t border-slate-800 flex items-center gap-2.5 text-xs text-slate-300">
                <span className="w-8 border-t-2 border-dashed border-slate-400" />
                <span>Garis kluster ke BPPP</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">72</span>
                <span>Label = jumlah anggota nelayan</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="text-xs">⬤ kecil → sedikit · ⬤ besar → banyak</span>
                <span>Ukuran titik ∝ jumlah nelayan</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" /> Ringkasan 5 BPPP
            </h3>
            <div className="space-y-2">
              {SUMMARIES.map(sm => (
                <div key={sm.bppp.id} className="flex items-center gap-3 text-xs">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: sm.bppp.color }} />
                  <span className="font-semibold text-slate-200 w-36 flex-shrink-0">{sm.bppp.name}</span>
                  <div className="flex gap-2 text-slate-400">
                    <span><span className="font-bold" style={{ color: sm.bppp.color }}>{sm.points.length}</span> KNMP</span>
                    <span>·</span>
                    <span><span className="font-bold text-white">{sm.totalAnggota}</span> nelayan</span>
                    <span>·</span>
                    <span><span className="font-bold text-cyan-400">{sm.totalOrgPdLaut}</span> laut</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 text-xs pt-2 border-t border-slate-800">
                <span className="w-3 h-3 rounded-full bg-slate-600 flex-shrink-0" />
                <span className="font-extrabold text-white w-36 flex-shrink-0">TOTAL</span>
                <div className="flex gap-2">
                  <span><span className="font-black text-white">65</span> KNMP</span>
                  <span>·</span>
                  <span><span className="font-black text-amber-400">{TOTAL_ANGGOTA}</span> nelayan</span>
                  <span>·</span>
                  <span><span className="font-black text-cyan-400">{TOTAL_ORG}</span> laut</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
