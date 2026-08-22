'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { COORDINATES_100, COORDINATES_1100, CoordinatePoint } from './data/coordinates';
import { UPT_KKP_38, BALAI_PENDIDIKAN_UPT, BPPP_ONLY_UPT, UptKkpPoint } from './data/upt_kkp';
import {
  getNearestUpt,
  ClusteredCoordinatePoint,
  getUptClusterSummaries,
  getCapacityAwareClustering,
  MIN_KNMP_PER_UPT,
  PERSONS_PER_KNMP,
  MIN_PERSONS_PER_UPT,
} from './data/clustering';
import indonesiaBoundary from './data/indonesia-boundary.json';
import {
  MapPin,
  Search,
  Download,
  Copy,
  Check,
  Globe,
  ListFilter,
  Navigation,
  FileSpreadsheet,
  Table as TableIcon,
  ChevronRight,
  Info,
  FileCode,
  Image,
  Loader2,
  Tag,
  Building2,
  Layers,
  Network,
  BarChart3,
  ExternalLink,
  FileImage,
  GraduationCap
} from 'lucide-react';

const KNMPLeafletMap = dynamic(
  () => import('@/components/knmp/KNMPLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Memuat Peta Vektor Biru & Tabel Clustering...</span>
        </div>
      </div>
    ),
  }
);

const REGIONS = [
  'Semua',
  'Sumatera',
  'Jawa & Banten',
  'Bali & Nusa Tenggara',
  'Kalimantan',
  'Sulawesi & Gorontalo',
  'Maluku & Papua',
] as const;

export default function KNMPTESTMAP() {
  const [knmpCountMode, setKnmpCountMode] = useState<'100' | '1100'>('100');
  const [targetClusterType, setTargetClusterType] = useState<'all' | 'bppp' | 'bppp_only'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('Semua');
  const [activeDataset, setActiveDataset] = useState<'all' | 'knmp' | 'upt'>('all');
  const [showUptLabels, setShowUptLabels] = useState<boolean>(true);
  const [showClustering, setShowClustering] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPoint, setSelectedPoint] = useState<CoordinatePoint | UptKkpPoint | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  // Active KNMP Points based on selected mode (100 or 1,100 points)
  const activeKnmpList = useMemo(() => {
    return knmpCountMode === '100' ? COORDINATES_100 : COORDINATES_1100;
  }, [knmpCountMode]);

  // Active target UPT list for clustering
  const activeClusterUpts = useMemo(() => {
    if (targetClusterType === 'bppp') return BALAI_PENDIDIKAN_UPT;
    if (targetClusterType === 'bppp_only') return BPPP_ONLY_UPT;
    return UPT_KKP_38;
  }, [targetClusterType]);

  // Compute clustered points — semua mode pakai capacity-aware clustering
  // Kriteria: min 100 peserta per UPT (= 13 titik KNMP), berlaku untuk semua filter
  const clusteredKnmpList = useMemo(() => {
    return getCapacityAwareClustering(activeKnmpList, activeClusterUpts);
  }, [activeKnmpList, activeClusterUpts]);

  // Compute UPT Cluster Summaries for displayed UPTs
  const uptClusterSummaries = useMemo(() => {
    return getUptClusterSummaries(clusteredKnmpList, activeClusterUpts);
  }, [clusteredKnmpList, activeClusterUpts]);

  // Redistribution stats — selalu ditampilkan di semua mode
  const redistributionStats = useMemo(() => {
    const redistributed = clusteredKnmpList.filter((p) => p.isRedistributed).length;
    const meetsMin = uptClusterSummaries.filter((s) => s.meetsMinimum && s.assignedPointsCount > 0).length;
    const active = uptClusterSummaries.filter((s) => s.assignedPointsCount > 0).length;
    return { redistributed, meetsMin, active, total: activeClusterUpts.length };
  }, [clusteredKnmpList, uptClusterSummaries, activeClusterUpts]);

  // Combined Points List for Map display
  const combinedPoints = useMemo(() => {
    const list: Array<((ClusteredCoordinatePoint | UptKkpPoint) & { pointType: 'knmp' | 'upt' })> = [];

    if (activeDataset === 'all' || activeDataset === 'knmp') {
      clusteredKnmpList.forEach((p) => list.push({ ...p, pointType: 'knmp' }));
    }
    if (activeDataset === 'all' || activeDataset === 'upt') {
      activeClusterUpts.forEach((p) => list.push({ ...p, pointType: 'upt' }));
    }

    return list;
  }, [activeDataset, clusteredKnmpList, targetClusterType]);

  // Filtered Points
  const filteredPoints = useMemo(() => {
    return combinedPoints.filter((point) => {
      const matchesRegion = selectedRegion === 'Semua' || point.region === selectedRegion;
      const q = searchQuery.toLowerCase();
      const loc = 'location' in point ? point.location : point.region;
      const nearestName = 'nearestUpt' in point ? point.nearestUpt.name.toLowerCase() : '';

      const matchesSearch =
        q === '' ||
        point.name.toLowerCase().includes(q) ||
        point.no.toString().includes(q) ||
        loc.toLowerCase().includes(q) ||
        nearestName.includes(q) ||
        point.lat.toString().includes(q) ||
        point.lng.toString().includes(q);

      return matchesRegion && matchesSearch;
    });
  }, [combinedPoints, selectedRegion, searchQuery]);

  // Filtered Cluster Summaries
  const filteredClusterSummaries = useMemo(() => {
    return uptClusterSummaries.filter((summary) => {
      const matchesRegion = selectedRegion === 'Semua' || summary.upt.region === selectedRegion;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        summary.upt.name.toLowerCase().includes(q) ||
        summary.upt.type.toLowerCase().includes(q) ||
        summary.upt.region.toLowerCase().includes(q);
      return matchesRegion && matchesSearch;
    });
  }, [uptClusterSummaries, selectedRegion, searchQuery]);

  // Regional Stats
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: combinedPoints.length };
    combinedPoints.forEach((p) => {
      counts[p.region] = (counts[p.region] || 0) + 1;
    });
    return counts;
  }, [combinedPoints]);

  // ─── SHARED: Draw Indonesia map onto a canvas context ──────────────────────
  const drawMapToCanvas = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const minLng = 94.0;
    const maxLng = 142.5;
    const minLat = -11.5;
    const maxLat = 6.5;
    const padding = 120;

    const project = (lng: number, lat: number) => {
      const x = padding + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
      const y = padding + ((maxLat - lat) / (maxLat - minLat)) * (height - 2 * padding);
      return { x, y };
    };

    const drawPolygon = (coords: number[][]) => {
      if (!coords.length) return;
      ctx.beginPath();
      coords.forEach((c, i) => {
        const { x, y } = project(c[0], c[1]);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#bfdbfe';
      ctx.stroke();
    };

    if (indonesiaBoundary?.features) {
      indonesiaBoundary.features.forEach((feature: any) => {
        const geom = feature.geometry;
        if (geom.type === 'Polygon') {
          geom.coordinates.forEach((ring: number[][]) => drawPolygon(ring));
        } else if (geom.type === 'MultiPolygon') {
          geom.coordinates.forEach((poly: number[][][]) =>
            poly.forEach((ring) => drawPolygon(ring))
          );
        }
      });
    }

    return project;
  };

  // ─── DOWNLOAD: Peta Saja (Map Only PNG, white background) ───────────────────
  const handleDownloadMapOnlyPNG = () => {
    const canvas = document.createElement('canvas');
    const width = 2500;
    const height = 1300;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pure white background (ocean = white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const project = drawMapToCanvas(ctx, width, height);

    // Draw cluster lines
    if (showClustering) {
      clusteredKnmpList.forEach((point) => {
        const start = project(point.lng, point.lat);
        const end = project(point.nearestUpt.lng, point.nearestUpt.lat);

        // Draw gradient cluster line using a subtle glow effect
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([10, 5]);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        // Outer glow
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 6;
        ctx.stroke();
        // Main line
        ctx.beginPath();
        ctx.setLineDash([10, 5]);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });
    }

    // Draw KNMP red pins
    clusteredKnmpList.forEach((point) => {
      const { x, y } = project(point.lng, point.lat);
      const radius = knmpCountMode === '1100' ? 5.5 : 7.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

    // ─── Draw UPT blue pins & labels (big font + collision-free placement) ──────
    const LPAD = 9;        // horizontal padding inside label box
    const LFONT = 14;      // label font size (px)
    const LBOX_H = LFONT + 10; // label box height
    const LMARGIN = 6;     // minimum gap between adjacent labels
    const placed: { x: number; y: number; w: number; h: number }[] = [];

    /** True if the candidate box overlaps any already-placed box */
    const hitTest = (bx: number, by: number, bw: number, bh: number) =>
      placed.some(
        (b) =>
          bx < b.x + b.w + LMARGIN &&
          bx + bw + LMARGIN > b.x &&
          by < b.y + b.h + LMARGIN &&
          by + bh + LMARGIN > b.y
      );

    /**
     * Compute label + box position given pin centre, text width, direction and
     * distance from pin to box edge.
     */
    const calcLabelPos = (
      px: number, py: number, tw: number, dir: string, dist: number
    ) => {
      const bw = tw + LPAD * 2;
      switch (dir) {
        case 'bottom': return {
          bx: px - bw / 2, by: py + dist,
          lx: px - tw / 2, ly: py + dist + LBOX_H - 4,
        };
        case 'left': return {
          bx: px - bw - dist, by: py - LBOX_H / 2,
          lx: px - tw - dist - LPAD, ly: py + 5,
        };
        case 'right': return {
          bx: px + dist, by: py - LBOX_H / 2,
          lx: px + dist + LPAD, ly: py + 5,
        };
        default: /* top */ return {
          bx: px - bw / 2, by: py - dist - LBOX_H,
          lx: px - tw / 2, ly: py - dist - 4,
        };
      }
    };

    const displayUpts = activeClusterUpts;

    // Sort so UPTs with more assigned KNMP draw first (get preferred positions)
    const sortedUpts = [...displayUpts].sort((a, b) => {
      const sa = uptClusterSummaries.find((s) => s.upt.id === a.id)?.assignedPointsCount ?? 0;
      const sb = uptClusterSummaries.find((s) => s.upt.id === b.id)?.assignedPointsCount ?? 0;
      return sb - sa;
    });

    // Pass 1 – draw all pins first so labels render on top
    sortedUpts.forEach((upt) => {
      const { x, y } = project(upt.lng, upt.lat);
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#1d4ed8';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

    // Pass 2 – smart label placement
    sortedUpts.forEach((upt) => {
      const { x, y } = project(upt.lng, upt.lat);
      const summary = uptClusterSummaries.find((s) => s.upt.id === upt.id);
      const assignedCount = summary ? summary.assignedPointsCount : 0;

      ctx.font = `bold ${LFONT}px 'Arial', sans-serif`;
      const labelText = showClustering ? `${upt.name} (${assignedCount})` : upt.name;
      const tw = ctx.measureText(labelText).width;
      const bw = tw + LPAD * 2;

      // Try preferred direction, then rotate through alternatives, with
      // increasing offset distances to escape dense clusters
      const dirs = [upt.direction || 'top', 'top', 'bottom', 'right', 'left'];
      const offsets = [14, 20, 28, 38, 50];
      let finalPos: { bx: number; by: number; lx: number; ly: number } | null = null;

      outer: for (const off of offsets) {
        for (const dir of dirs) {
          const pos = calcLabelPos(x, y, tw, dir, off);
          if (!hitTest(pos.bx, pos.by, bw, LBOX_H)) {
            finalPos = pos;
            break outer;
          }
        }
      }
      // Absolute fallback – use preferred direction at base offset (still show label)
      if (!finalPos) {
        finalPos = calcLabelPos(x, y, tw, upt.direction || 'top', 14);
      }

      // Thin connector line from pin edge to label box centre
      const boxCx = finalPos.bx + bw / 2;
      const boxCy = finalPos.by + LBOX_H / 2;
      const pinDx = boxCx - x;
      const pinDy = boxCy - y;
      const dist = Math.sqrt(pinDx * pinDx + pinDy * pinDy) || 1;
      const startX = x + (pinDx / dist) * 11;
      const startY = y + (pinDy / dist) * 11;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(boxCx, finalPos.by > y ? finalPos.by : finalPos.by + LBOX_H);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(29, 78, 216, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Label box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.beginPath();
      ctx.roundRect(finalPos.bx, finalPos.by, bw, LBOX_H, 6);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#1d4ed8';
      ctx.stroke();

      // Label text
      ctx.fillStyle = '#1e3a5f';
      ctx.font = `bold ${LFONT}px 'Arial', sans-serif`;
      ctx.fillText(labelText, finalPos.lx, finalPos.ly);

      placed.push({ x: finalPos.bx, y: finalPos.by, w: bw, h: LBOX_H });
    });

    // Title strip at top
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, 0, width, 64);
    ctx.font = "bold 22px 'Arial', sans-serif";
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      `PETA SEBARAN KNMP – ${targetClusterType === 'bppp' ? 'CLUSTERING BALAI PELATIHAN BPPP' : 'CLUSTERING 38 UPT KKP'} (${activeKnmpList.length} TITIK)`,
      40, 42
    );

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `peta_knmp_${knmpCountMode}_${targetClusterType}.png`;
    a.click();
  };

  // ─── DOWNLOAD: Tabel Saja (Table Only PNG, white background) ───────────────
  const handleDownloadSummaryTablePNG = () => {
    const rowH = 42;
    const headerH = 110;
    const colHeaderH = 44;
    const isBpppMode = targetClusterType !== 'all';
    const rows = uptClusterSummaries; // ALL rows — no filter, full download
    const width = 2800;
    const height = headerH + colHeaderH + rows.length * rowH + 60;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── White background ──
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // ── Header strip ──
    const modeLabel =
      targetClusterType === 'bppp'
        ? 'BALAI PENDIDIKAN KP (BPPP + POLTEK + SUPMN)'
        : targetClusterType === 'bppp_only'
        ? 'BPPP SAJA'
        : '38 UPT KKP';

    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, 0, width, headerH);

    ctx.font = "bold 24px 'Arial', sans-serif";
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      `TABEL LENGKAP CLUSTERING ${modeLabel} — ${activeKnmpList.length} TITIK KNMP`,
      40, 52
    );
    ctx.font = "14px 'Arial', sans-serif";
    ctx.fillStyle = '#93c5fd';
    ctx.fillText(
      `Mode: ${knmpCountMode} Titik  |  Total UPT: ${rows.length}  |  Asumsi: 1 KNMP = ${PERSONS_PER_KNMP} peserta  |  Min. kuota: ${MIN_PERSONS_PER_UPT} peserta / UPT (${MIN_KNMP_PER_UPT} titik)`,
      40, 80
    );
    ctx.font = "12px 'Arial', sans-serif";
    ctx.fillStyle = '#60a5fa';
    ctx.fillText(
      `✅ Memenuhi kuota (≥${MIN_PERSONS_PER_UPT} org)   ⚠️ Di bawah kuota   ⭕ Tidak ada peserta   ↔ Titik direlokasi dari UPT terdekat`,
      40, 102
    );

    // ── Column definitions ──
    // NO | NAMA | JENIS | WILAYAH | TITIK | PESERTA | STATUS | JARAK AVG | MIN–MAX
    const PAD = 40;
    const colX = {
      no:     PAD,
      nama:   PAD + 60,
      jenis:  PAD + 680,
      wilayah:PAD + 870,
      titik:  PAD + 1060,
      peserta:PAD + 1200,
      status: PAD + 1370,
      avg:    PAD + 1520,
      range:  PAD + 1680,
    };
    const tableW = width - 2 * PAD;
    const tableStartY = headerH;

    // Column header bg
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(PAD, tableStartY, tableW, colHeaderH);

    ctx.font = "bold 12px 'Arial', sans-serif";
    ctx.fillStyle = '#ffffff';
    const drawColHeader = (text: string, x: number) => ctx.fillText(text, x, tableStartY + 28);
    drawColHeader('NO', colX.no);
    drawColHeader('NAMA UPT / BALAI PENDIDIKAN', colX.nama);
    drawColHeader('JENIS', colX.jenis);
    drawColHeader('WILAYAH', colX.wilayah);
    drawColHeader('TITIK KNMP', colX.titik);
    drawColHeader('PESERTA', colX.peserta);
    drawColHeader('STATUS KUOTA', colX.status);
    drawColHeader('JARAK AVG', colX.avg);
    drawColHeader('MIN – MAX', colX.range);

    // ── Data rows ──
    rows.forEach((s, idx) => {
      const rowY = tableStartY + colHeaderH + idx * rowH;
      const hasPoints = s.assignedPointsCount > 0;
      const meetsMin = s.meetsMinimum;
      const redistributed = (s.redistributedCount ?? 0) > 0;

      // Row background
      if (!hasPoints) {
        ctx.fillStyle = '#f8fafc';
      } else if (meetsMin) {
        ctx.fillStyle = idx % 2 === 0 ? '#f0fdf4' : '#dcfce7';
      } else {
        ctx.fillStyle = idx % 2 === 0 ? '#fff7ed' : '#ffedd5';
      }
      ctx.fillRect(PAD, rowY, tableW, rowH);

      // Row separator
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, rowY + rowH);
      ctx.lineTo(PAD + tableW, rowY + rowH);
      ctx.stroke();

      const textY = rowY + rowH / 2 + 5;

      // NO
      ctx.font = "bold 11px 'Arial', sans-serif";
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`#${s.upt.no}`, colX.no, textY);

      // NAMA (+ relokasi tag)
      ctx.fillStyle = '#1e293b';
      ctx.font = "bold 12px 'Arial', sans-serif";
      const shortName = s.upt.name.length > 36 ? s.upt.name.substring(0, 34) + '…' : s.upt.name;
      ctx.fillText(shortName, colX.nama, textY);
      if (redistributed) {
        ctx.font = "bold 9px 'Arial', sans-serif";
        ctx.fillStyle = '#ea580c';
        ctx.fillText('[↔ relokasi]', colX.nama + ctx.measureText(shortName).width + 8, textY);
      }

      // JENIS
      ctx.fillStyle = '#2563eb';
      ctx.font = "11px 'Arial', sans-serif";
      ctx.fillText(s.upt.type, colX.jenis, textY);

      // WILAYAH
      ctx.fillStyle = '#475569';
      const shortRegion = s.upt.region.length > 16 ? s.upt.region.substring(0, 14) + '..' : s.upt.region;
      ctx.fillText(shortRegion, colX.wilayah, textY);

      // TITIK badge
      const titikLabel = `${s.assignedPointsCount} Titik`;
      const titikBadgeW = 80;
      ctx.fillStyle = hasPoints ? '#0369a1' : '#94a3b8';
      ctx.beginPath();
      ctx.roundRect(colX.titik, rowY + 8, titikBadgeW, 26, 6);
      ctx.fill();
      ctx.font = "bold 12px 'Arial', sans-serif";
      ctx.fillStyle = '#ffffff';
      ctx.fillText(titikLabel, colX.titik + 8, textY);

      // PESERTA
      if (isBpppMode) {
        const persons = s.totalPersons ?? s.assignedPointsCount * PERSONS_PER_KNMP;
        const personsBadgeW = 100;
        ctx.fillStyle = meetsMin ? '#059669' : hasPoints ? '#dc2626' : '#94a3b8';
        ctx.beginPath();
        ctx.roundRect(colX.peserta, rowY + 8, personsBadgeW, 26, 6);
        ctx.fill();
        ctx.font = "bold 12px 'Arial', sans-serif";
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${persons} orang`, colX.peserta + 8, textY);
      }

      // STATUS
      if (isBpppMode) {
        ctx.font = "bold 13px 'Arial', sans-serif";
        ctx.fillStyle = !hasPoints ? '#94a3b8' : meetsMin ? '#15803d' : '#dc2626';
        ctx.fillText(!hasPoints ? '⭕ Tidak Ada' : meetsMin ? '✅ Memenuhi' : '⚠️ Kurang', colX.status, textY);
      }

      // JARAK AVG
      ctx.fillStyle = '#059669';
      ctx.font = "bold 12px 'Arial', sans-serif";
      ctx.fillText(hasPoints ? `${s.avgDistanceKm} km` : '–', colX.avg, textY);

      // MIN-MAX
      ctx.fillStyle = '#475569';
      ctx.font = "11px 'Arial', sans-serif";
      ctx.fillText(hasPoints ? `${s.minDistanceKm} – ${s.maxDistanceKm} km` : '–', colX.range, textY);
    });

    // Outer border
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.strokeRect(PAD, tableStartY, tableW, colHeaderH + rows.length * rowH);

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = "11px 'Arial', sans-serif";
    ctx.fillText(
      `Kementerian Kelautan dan Perikanan – Peta Digital KKP  |  ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      40, height - 18
    );

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabel_lengkap_clustering_${targetClusterType}_knmp_${knmpCountMode}.png`;
    a.click();
  };

  // Export Clustering Summary CSV
  const handleExportClusterSummaryCSV = () => {
    const headers = ['No,Nama UPT KKP,Jenis UPT,Wilayah,Jumlah KNMP Terbina,Jarak Rata-Rata (km),Jarak Min (km),Jarak Max (km),Latitude,Longitude'];
    const rows = uptClusterSummaries.map(
      (s) => `${s.upt.no},"${s.upt.name}","${s.upt.type}","${s.upt.region}",${s.assignedPointsCount},${s.avgDistanceKm},${s.minDistanceKm},${s.maxDistanceKm},${s.upt.lat},${s.upt.lng}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ringkasan_clustering_${targetClusterType}_knmp_${knmpCountMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export GeoJSON
  const handleExportGeoJSON = () => {
    const geojson = {
      type: "FeatureCollection",
      features: filteredPoints.map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.lng, p.lat]
        },
        properties: {
          no: p.no,
          name: p.name,
          region: p.region,
          pointType: p.pointType === 'knmp' ? 'KNMP Red Pin' : 'UPT KKP Blue Pin',
          nearestUptName: 'nearestUpt' in p ? p.nearestUpt.name : 'N/A',
          nearestUptDistanceKm: 'distanceKm' in p ? p.distanceKm : 0,
          latitude: p.lat,
          longitude: p.lng
        }
      }))
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `koordinat_knmp_${knmpCountMode}_upt_clustering.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export KML
  const handleExportKML = () => {
    const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Koordinat KNMP & Clustering UPT KKP (${filteredPoints.length} Points)</name>`;
    const kmlPlacemarks = filteredPoints.map((p) => {
      const nearestInfo = 'nearestUpt' in p ? `<br>UPT Terdekat: ${p.nearestUpt.name} (${p.distanceKm} km)` : '';
      return `
    <Placemark>
      <name>#${p.no} - ${p.name} [${p.pointType.toUpperCase()}]</name>
      <description><![CDATA[Wilayah: ${p.region}<br>Lat: ${p.lat}<br>Lng: ${p.lng}${nearestInfo}]]></description>
      <Point>
        <coordinates>${p.lng},${p.lat},0</coordinates>
      </Point>
    </Placemark>`;
    }).join("");
    const kmlFooter = `
  </Document>
</kml>`;
    const blob = new Blob([kmlHeader + kmlPlacemarks + kmlFooter], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `koordinat_knmp_${knmpCountMode}_upt_clustering.kml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No,Tipe,Nama Titik / UPT,Wilayah,UPT KKP Terdekat,Jarak UPT (km),Latitude,Longitude'];
    const rows = filteredPoints.map((p) => {
      const nearestName = 'nearestUpt' in p ? `"${p.nearestUpt.name}"` : '"-"';
      const distance = 'distanceKm' in p ? p.distanceKm : '-';
      return `${p.no},"${p.pointType.toUpperCase()}","${p.name}","${p.region}",${nearestName},${distance},${p.lat},${p.lng}`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `koordinat_knmp_${knmpCountMode}_upt_clustering.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy All Coordinates
  const handleCopyAll = () => {
    const text = filteredPoints.map((p) => `${p.lat}\t${p.lng}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 selection:bg-blue-500 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <header className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                PETA DIGITAL KKP
              </span>
              <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                🔴 {knmpCountMode === '100' ? '100 Titik KNMP' : '1.100 Titik KNMP'}
              </span>
              <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                🔵 38 UPT KKP
              </span>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                {targetClusterType === 'bppp' ? '🎓 Kluster Balai Pendidikan KP' : targetClusterType === 'bppp_only' ? '🏫 Kluster BPPP Saja' : '🏢 Kluster Semua UPT'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Peta Sebaran KNMP & Clustering UPT KKP
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Pemetaan lokasi pelatihan KNMP terhubung dengan UPT KKP / Balai Pelatihan terdekat beserta kalkulasi jarak presisi (km) & unduh gambar peta bertaut clustering.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleDownloadMapOnlyPNG}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
              title="Unduh PNG Peta saja (latar putih)"
            >
              <Image className="w-4 h-4" />
              <span>⬇ Peta (PNG)</span>
            </button>

            <button
              onClick={handleDownloadSummaryTablePNG}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white border border-cyan-400/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
              title="Unduh PNG Tabel Ringkasan saja (latar putih)"
            >
              <FileImage className="w-4 h-4" />
              <span>⬇ Tabel (PNG)</span>
            </button>

            <button
              onClick={handleExportGeoJSON}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4 text-red-400" />
              <span>GeoJSON</span>
            </button>

            <button
              onClick={handleExportKML}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>KML</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleCopyAll}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Salin All</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Mode Selector & Clustering Controls */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          {/* TOP BAR: 100 vs 1.100 TITIK MODE & CLUSTERING TARGET SELECTOR */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                Mode Titik KNMP:
              </span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setKnmpCountMode('100')}
                  className={`px-4 py-2 rounded-lg font-extrabold transition-all flex items-center gap-2 ${
                    knmpCountMode === '100'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>🔴 100 Titik KNMP</span>
                </button>

                <button
                  onClick={() => setKnmpCountMode('1100')}
                  className={`px-4 py-2 rounded-lg font-extrabold transition-all flex items-center gap-2 ${
                    knmpCountMode === '1100'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>🔴 1.100 Titik KNMP</span>
                </button>
              </div>

              {/* TARGET CLUSTERING SWITCHER (BALAI PELATIHAN VS ALL UPTS) */}
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 ml-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                Target Clustering:
              </span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setTargetClusterType('all')}
                  className={`px-3.5 py-2 rounded-lg font-extrabold transition-all flex items-center gap-2 ${
                    targetClusterType === 'all'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>🏢 Semua 38 UPT</span>
                </button>

                <button
                  onClick={() => setTargetClusterType('bppp')}
                  className={`px-3.5 py-2 rounded-lg font-extrabold transition-all flex items-center gap-2 ${
                    targetClusterType === 'bppp'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Clustering berdasarkan Balai Pendidikan & Pelatihan KP (BPPP, Politeknik KP, Politeknik AUP, Akademi KP, SUPMN, Balai Diklat) — dengan constraint minimum 100 peserta per UPT"
                >
                  <span>🎓 Balai Pendidikan KP (BPPP+Poltek+SUPMN)</span>
                </button>

                <button
                  onClick={() => setTargetClusterType('bppp_only')}
                  className={`px-3.5 py-2 rounded-lg font-extrabold transition-all flex items-center gap-2 ${
                    targetClusterType === 'bppp_only'
                      ? 'bg-rose-700 text-white shadow-lg shadow-rose-700/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Clustering khusus BPPP dan Balai Diklat saja — dengan constraint minimum 100 peserta per UPT"
                >
                  <span>🏫 BPPP Saja</span>
                </button>
              </div>
            </div>

            {/* Feature Toggle Buttons (Clustering Lines & Label UPT) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowClustering(!showClustering)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  showClustering
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Tampilkan Garis Penghubung Clustering Terdekat"
              >
                <Network className="w-4 h-4 text-cyan-400" />
                <span>🔗 Garis Kluster ({showClustering ? 'ON' : 'OFF'})</span>
              </button>

              <button
                onClick={() => setShowUptLabels(!showUptLabels)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  showUptLabels
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Label ({showUptLabels ? 'ON' : 'OFF'})</span>
              </button>
            </div>
          </div>

          {/* BOTTOM BAR: DATASET FILTER (Semua vs KNMP vs UPT) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Tampilan:</span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveDataset('all')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
                    activeDataset === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Semua ({combinedPoints.length})</span>
                </button>

                <button
                  onClick={() => setActiveDataset('knmp')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
                    activeDataset === 'knmp'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>KNMP ({activeKnmpList.length})</span>
                </button>

                <button
                  onClick={() => setActiveDataset('upt')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
                    activeDataset === 'upt'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{
                    targetClusterType === 'bppp' ? `Balai Pendidikan KP (${activeClusterUpts.length})` :
                    targetClusterType === 'bppp_only' ? `BPPP (${activeClusterUpts.length})` :
                    `UPT KKP (${activeClusterUpts.length})`
                  }</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Menampilkan <strong className="text-white">{filteredPoints.length}</strong> dari total <strong className="text-white">{combinedPoints.length}</strong> titik
            </div>
          </div>
        </div>

        {/* Capacity Info Banner — berlaku di semua mode (capacity-aware clustering aktif) */}
        {redistributionStats && (
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-start gap-4 shadow-lg">
            <div className="flex items-start gap-2 flex-1 min-w-[200px]">
              <GraduationCap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-300 mb-1">Algoritma Capacity-Constrained Clustering</div>
                <div className="text-[11px] text-amber-200/80 leading-relaxed">
                  Setiap KNMP = <strong className="text-amber-300">{PERSONS_PER_KNMP} peserta</strong>. Minimum per UPT = <strong className="text-amber-300">{MIN_PERSONS_PER_UPT} peserta ({MIN_KNMP_PER_UPT} titik KNMP)</strong>.
                  UPT yang mendapat &lt; {MIN_KNMP_PER_UPT} titik dikonsolidasi — titiknya dialihkan ke UPT terdekat yang memenuhi kuota,
                  sehingga sesi pelatihan lebih layak diselenggarakan.
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-center">
                <div className="text-2xl font-black text-emerald-400">{redistributionStats.meetsMin}</div>
                <div className="text-[10px] text-emerald-300 font-semibold">✅ Memenuhi Kuota</div>
                <div className="text-[9px] text-slate-400">(≥{MIN_KNMP_PER_UPT} titik / ≥{MIN_PERSONS_PER_UPT} org)</div>
              </div>
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-center">
                <div className="text-2xl font-black text-slate-300">{redistributionStats.active}</div>
                <div className="text-[10px] text-slate-400 font-semibold">UPT Aktif</div>
                <div className="text-[9px] text-slate-500">dari {redistributionStats.total} total UPT</div>
              </div>
              <div className="bg-orange-950/50 border border-orange-500/30 rounded-xl px-4 py-2.5 text-center">
                <div className="text-2xl font-black text-orange-400">{redistributionStats.redistributed}</div>
                <div className="text-[10px] text-orange-300 font-semibold">↔ Direlokasi</div>
                <div className="text-[9px] text-slate-400">dari UPT terdekat</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <div className="text-slate-400 text-xs font-medium mb-1">Total Displayed</div>
            <div className="text-2xl font-black text-white">{filteredPoints.length}</div>
            <div className="text-[10px] text-slate-500 mt-1">Mode {knmpCountMode} Titik</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <div className="text-slate-400 text-xs font-medium mb-1">Sumatera</div>
            <div className="text-2xl font-black text-blue-400">{regionCounts['Sumatera'] || 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Titik</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <div className="text-slate-400 text-xs font-medium mb-1">Jawa & Banten</div>
            <div className="text-2xl font-black text-emerald-400">{regionCounts['Jawa & Banten'] || 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Titik</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <div className="text-slate-400 text-xs font-medium mb-1">Bali & Nusa Tenggara</div>
            <div className="text-2xl font-black text-amber-400">{regionCounts['Bali & Nusa Tenggara'] || 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Titik</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <div className="text-slate-400 text-xs font-medium mb-1">Sulawesi & Gorontalo</div>
            <div className="text-2xl font-black text-pink-400">{regionCounts['Sulawesi & Gorontalo'] || 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Titik</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <div className="text-slate-400 text-xs font-medium mb-1">Maluku & Papua</div>
            <div className="text-2xl font-black text-rose-400">{regionCounts['Maluku & Papua'] || 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Titik</div>
          </div>
        </div>

        {/* Filter Controls & View Switcher */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`whitespace-nowrap text-xs font-medium px-3 py-2 rounded-xl transition-all ${
                  selectedRegion === region
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                {region} ({regionCounts[region] || 0})
              </button>
            ))}
          </div>

          {/* Search Input & View Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari UPT terdekat / titik / wilayah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'map'
                    ? 'bg-slate-800 text-blue-400 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Peta</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-slate-800 text-blue-400 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabel Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content View */}
        {viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar List of Coordinates */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col h-[650px] shadow-xl">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-sm text-white">Daftar Titik & UPT Clustering ({filteredPoints.length})</span>
                </div>
                {selectedPoint && (
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Reset Pilihan
                  </button>
                )}
              </div>

              {/* Scrollable Points List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {filteredPoints.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                    <Info className="w-8 h-8 mb-2 opacity-50" />
                    <span>Tidak ada titik yang sesuai pencarian.</span>
                  </div>
                ) : (
                  filteredPoints.slice(0, 300).map((point) => {
                    const isSelected = selectedPoint?.id === point.id;
                    const isUpt = point.pointType === 'upt';
                    const loc = 'location' in point ? point.location : point.region;
                    const hasCluster = 'nearestUpt' in point;

                    return (
                      <div
                        key={`${point.pointType}-${point.id}`}
                        onClick={() => setSelectedPoint(point)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? isUpt
                              ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                              : 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-500/10'
                            : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${isUpt ? 'text-blue-400' : 'text-red-400'}`}>
                            <MapPin className={`w-3.5 h-3.5 ${isUpt ? 'text-blue-400 fill-blue-400' : 'text-red-500 fill-red-500'}`} />
                            {point.name} (#{point.no})
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isUpt
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {isUpt ? 'UPT KKP' : 'KNMP'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 mb-1.5 truncate">
                          📍 {loc}
                        </div>

                        {/* Cluster Info Box */}
                        {hasCluster && (
                          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 mb-2 text-[11px] space-y-0.5">
                            <div className="text-cyan-400 font-bold flex items-center gap-1">
                              <Network className="w-3 h-3 text-cyan-400" />
                              <span>{targetClusterType === 'bppp' ? 'Balai Pelatihan Terdekat' : 'UPT Terdekat'} ({point.distanceKm} km):</span>
                            </div>
                            <div className="text-slate-200 font-medium truncate">
                              🏢 {point.nearestUpt.name}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                          <div>
                            <span className="text-slate-500 mr-1">LAT:</span>
                            {point.lat.toFixed(6)}
                          </div>
                          <div>
                            <span className="text-slate-500 mr-1">LNG:</span>
                            {point.lng.toFixed(6)}
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 ${isUpt ? 'text-blue-400' : 'text-red-400'} transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
                        </div>
                      </div>
                    );
                  })
                )}
                {filteredPoints.length > 300 && (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                    Menampilkan 300 dari {filteredPoints.length} titik di daftar sidebar. Gunakan pencarian untuk hasil spesifik.
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Leaflet Map Component */}
            <div className="relative lg:col-span-8 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" style={{ height: '650px' }}>
              <KNMPLeafletMap
                knmpPoints={activeKnmpList}
                uptPoints={activeClusterUpts}
                selectedPoint={selectedPoint}
                onSelectPoint={setSelectedPoint}
                activeDataset={activeDataset}
                showUptLabels={showUptLabels}
                onToggleUptLabels={() => setShowUptLabels(!showUptLabels)}
                showClustering={showClustering}
                onToggleClustering={() => setShowClustering(!showClustering)}
                targetClusterType={targetClusterType}
                onToggleClusterType={() => setTargetClusterType(targetClusterType === 'all' ? 'bppp' : targetClusterType === 'bppp' ? 'bppp_only' : 'all')}
              />
            </div>
          </div>
        ) : (
          /* Full Table View */
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-semibold">
                    <th className="py-3 px-4 w-16 text-center">No</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Nama Titik / UPT</th>
                    <th className="py-3 px-4">Wilayah</th>
                    <th className="py-3 px-4">{targetClusterType === 'bppp' ? 'Balai Pelatihan Terdekat' : 'UPT Terdekat'} (Clustering)</th>
                    <th className="py-3 px-4 font-mono text-center">Jarak (km)</th>
                    <th className="py-3 px-4 font-mono">Latitude</th>
                    <th className="py-3 px-4 font-mono">Longitude</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPoints.slice(0, 500).map((point) => {
                    const isUpt = point.pointType === 'upt';
                    const nearestName = 'nearestUpt' in point ? point.nearestUpt.name : '-';
                    const distance = 'distanceKm' in point ? `${point.distanceKm} km` : '-';

                    return (
                      <tr
                        key={`${point.pointType}-${point.id}`}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-center font-bold text-slate-400">
                          #{point.no}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isUpt
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}>
                            {isUpt ? '🔵 UPT KKP' : '🔴 KNMP'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${isUpt ? 'text-blue-400 fill-blue-400' : 'text-red-500 fill-red-500'}`} />
                          {point.name}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{point.region}</td>
                        <td className="py-3 px-4 font-semibold text-cyan-300">
                          {nearestName}
                        </td>
                        <td className="py-3 px-4 font-mono text-center text-cyan-400 font-bold">
                          {distance}
                        </td>
                        <td className="py-3 px-4 font-mono text-blue-400">{point.lat}</td>
                        <td className="py-3 px-4 font-mono text-blue-400">{point.lng}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedPoint(point);
                              setViewMode('map');
                            }}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg transition-colors text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Lihat Peta</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABEL DEDIKASI KETERANGAN CLUSTERING UPT & TITIK KNMP YANG DAPAT DIUNDUH BERSAMA MAP / MANDIRI */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Tabel Ringkasan Kluster Pembinaan ({targetClusterType === 'bppp' ? 'Khusus Balai Pelatihan BPPP' : '38 UPT KKP'} & Sebaran Titik KNMP)
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Keterangan rinci berapa titik KNMP yang terbina di bawah {targetClusterType === 'bppp' ? 'Balai Pelatihan & Diklat (BPPP)' : '38 UPT KKP'} beserta kalkulasi jaraknya.
              </p>
            </div>

            {/* DOWNLOAD BUTTONS FOR THE SUMMARY TABLE */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadSummaryTablePNG}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                title="Unduh Gambar PNG Spesifik Tabel Ringkasan"
              >
                <FileImage className="w-4 h-4 text-cyan-300" />
                <span>Unduh Gambar Tabel (PNG)</span>
              </button>

              <button
                onClick={handleExportClusterSummaryCSV}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                title="Unduh Berkas Spreadsheet CSV Data Tabel Ringkasan"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>Unduh Tabel (CSV)</span>
              </button>

              <button
                onClick={handleDownloadMapOnlyPNG}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                title="Unduh PNG Peta saja (latar putih)"
              >
                <Image className="w-4 h-4" />
                <span>Unduh Peta (PNG)</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/80 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama {targetClusterType === 'bppp' ? 'Balai Pendidikan KP' : 'UPT KKP'}</th>
                  <th className="py-3 px-4">Jenis UPT</th>
                  <th className="py-3 px-4">Wilayah</th>
                  <th className="py-3 px-4 text-center bg-cyan-950/30 text-cyan-300 border-x border-cyan-900/50">
                    Titik KNMP
                  </th>
                  {targetClusterType === 'bppp' && (
                    <th className="py-3 px-4 text-center bg-amber-950/30 text-amber-300 border-r border-amber-900/50">
                      Peserta (×{PERSONS_PER_KNMP})
                    </th>
                  )}
                  {targetClusterType === 'bppp' && (
                    <th className="py-3 px-4 text-center bg-emerald-950/20 text-emerald-300 border-r border-emerald-900/30">
                      Status Kuota
                    </th>
                  )}
                  <th className="py-3 px-4 font-mono text-center">Jarak Rata-Rata</th>
                  <th className="py-3 px-4 font-mono text-center">Rentang Jarak</th>
                  <th className="py-3 px-4 text-center">Aksi / Sorot Peta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClusterSummaries.map((summary) => {
                  const isSelected = selectedPoint?.id === summary.upt.id;
                  const meetsMin = summary.meetsMinimum;
                  const hasPoints = summary.assignedPointsCount > 0;
                  const isRedistributedTarget = (summary.redistributedCount ?? 0) > 0;

                  return (
                    <tr
                      key={summary.upt.id}
                      className={`transition-colors ${
                        !hasPoints && targetClusterType === 'bppp'
                          ? 'opacity-40'
                          : isSelected
                          ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-bold text-slate-500">
                        #{summary.upt.no}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{summary.upt.name}</span>
                          {isRedistributedTarget && (
                            <span className="text-[9px] bg-orange-500/20 text-orange-300 border border-orange-400/30 px-1.5 py-0.5 rounded-full font-bold">
                              ↔ relokasi
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                          {summary.upt.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{summary.upt.region}</td>
                      <td className="py-3 px-4 text-center bg-cyan-950/20 border-x border-cyan-900/30">
                        <span className={`px-3 py-1 rounded-xl font-black text-xs inline-block min-w-[70px] ${
                          hasPoints
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                            : 'bg-slate-800/60 text-slate-500 border border-slate-700'
                        }`}>
                          {summary.assignedPointsCount} Titik
                        </span>
                      </td>
                      {targetClusterType === 'bppp' && (
                        <td className="py-3 px-4 text-center bg-amber-950/10 border-r border-amber-900/20">
                          <span className={`px-3 py-1 rounded-xl font-black text-xs inline-block min-w-[70px] ${
                            meetsMin
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                              : hasPoints
                              ? 'bg-red-500/20 text-red-300 border border-red-400/40'
                              : 'bg-slate-800/60 text-slate-500 border border-slate-700'
                          }`}>
                            {summary.totalPersons ?? summary.assignedPointsCount * PERSONS_PER_KNMP} orang
                          </span>
                        </td>
                      )}
                      {targetClusterType === 'bppp' && (
                        <td className="py-3 px-4 text-center bg-emerald-950/10 border-r border-emerald-900/20">
                          {!hasPoints ? (
                            <span className="text-[11px] text-slate-500 font-semibold">⭕ Tidak Ada</span>
                          ) : meetsMin ? (
                            <span className="text-[11px] text-emerald-400 font-bold">✅ Memenuhi</span>
                          ) : (
                            <span className="text-[11px] text-red-400 font-bold">⚠️ Kurang</span>
                          )}
                        </td>
                      )}
                      <td className="py-3 px-4 font-mono text-center font-bold text-emerald-400">
                        {summary.assignedPointsCount > 0 ? `${summary.avgDistanceKm} km` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-center text-slate-400">
                        {summary.assignedPointsCount > 0 ? `${summary.minDistanceKm} - ${summary.maxDistanceKm} km` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedPoint(summary.upt);
                            setShowClustering(true);
                            setViewMode('map');
                          }}
                          disabled={!hasPoints}
                          className="bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-lg transition-all text-[11px] font-semibold inline-flex items-center gap-1.5 active:scale-95"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Sorot Kluster</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}