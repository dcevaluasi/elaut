'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import html2canvas from 'html2canvas';
import { KNMP_PELAKU, BPPP_COLORS, type KnmpPelakuUsaha } from '@/app/knmp/data/knmp_pelaku_usaha';
import indonesiaBoundary from '@/app/knmp/data/indonesia-boundary.json';
import {
  RefreshCw, Download, Sun, Moon,
  Loader2, Sparkles,
  Presentation, X, Image as ImageIcon
} from 'lucide-react';

export interface PelakuUsahaMapProps {
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
}

// ─── Indonesia Full Bounds (Sabang - Merauke) ─────────────────────────────────
const INDONESIA_BOUNDS: L.LatLngBoundsExpression = [[-10.8, 94.5], [6.2, 141.2]];

// ─── UPT Coverage & Hub Coordinate Mappings ──────────────────────────────────
const UPT_COVERAGE: Record<string, string> = {
  'BPPP Medan': 'Aceh, Sumut, Riau, Sumbar, Bengkulu, Jambi',
  'BPPP Tegal': 'Sumsel, Lampung, Banten, Jabar, Jateng, DIY',
  'BPPP Banyuwangi': 'Jatim, Bali, NTB, NTT, Kalsel',
  'BPPP Bitung': 'Kaltim, Kaltara, Sulawesi, Maluku Utara',
  'BPPP Ambon': 'Maluku dan Papua',
};

export const BPPP_CENTERS: Record<string, { name: string; label: string; lat: number; lng: number; color: string; blueColor: string }> = {
  'Medan': { name: 'BPPP Medan', label: 'BPPP MEDAN', lat: 3.751116, lng: 98.694687, color: '#f59e0b', blueColor: '#2563eb' },
  'Tegal': { name: 'BPPP Tegal', label: 'BPPP TEGAL', lat: -6.855119, lng: 109.152341, color: '#3b82f6', blueColor: '#0284c7' },
  'Banyuwangi': { name: 'BPPP Banyuwangi', label: 'BPPP BANYUWANGI', lat: -8.071861, lng: 114.421138, color: '#10b981', blueColor: '#0891b2' },
  'Bitung': { name: 'BPPP Bitung', label: 'BPPP BITUNG', lat: 1.458208, lng: 125.212771, color: '#8b5cf6', blueColor: '#1d4ed8' },
  'Ambon': { name: 'BPPP Ambon', label: 'BPPP AMBON', lat: -3.657816, lng: 128.198279, color: '#f43f5e', blueColor: '#4338ca' },
};

// ─── 2D Convex Hull for Leaflet UPT Clusters ──────────────────────────────────
function getConvexHull(points: [number, number][]): [number, number][] {
  if (points.length <= 2) return points;
  const uniqueStr = Array.from(new Set(points.map(p => `${p[0]},${p[1]}`)));
  const unique = uniqueStr.map(s => s.split(',').map(Number) as [number, number]);
  if (unique.length <= 2) return unique;

  const sorted = unique.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));

  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

// ─── DivIcon Label Khusus Top 10 Nelayan Terbanyak ───────────────────────────
function buildTop10NelayanLabelIcon(p: KnmpPelakuUsaha, rank: number, color: string, isLight: boolean): L.DivIcon {
  const pelakuStr = p.pelakuUsaha !== null ? p.pelakuUsaha.toLocaleString('id-ID') : '0';
  const themeClass = isLight ? 'top10-label--light' : 'top10-label--dark';

  const html = `
    <div class="top10-label ${themeClass}" style="--accent:${color}">
      <span class="top10-label__rank">#${rank}</span>
      <span class="top10-label__name">${p.nama}</span>
      <span class="top10-label__count">${pelakuStr} nelayan</span>
    </div>`;

  return L.divIcon({ html, className: '', iconAnchor: [64, 14], iconSize: [160, 28] });
}

// ─── BPPP UPT Hub Icon ───────────────────────────────────────────────────────
function buildUptHubIcon(center: { label: string; color: string }, isSelected: boolean, isLight: boolean): L.DivIcon {
  const color = center.color;
  const hlClass = isSelected ? 'upt-hub--hl' : '';
  const themeClass = isLight ? 'upt-hub--light' : 'upt-hub--dark';

  const html = `
    <div class="upt-hub ${hlClass} ${themeClass}" style="--accent:${color}">
      <div class="upt-hub__pulse"></div>
      <div class="upt-hub__badge">
        <span class="upt-hub__icon">🏢</span>
        <span class="upt-hub__title">${center.label}</span>
      </div>
    </div>`;

  return L.divIcon({ html, className: '', iconAnchor: [56, 18], iconSize: [112, 36] });
}

const fmt = (v: number) => v.toLocaleString('id-ID');

export default function PelakuUsahaMap({
  selectedBppp = null,
  filterTahap = 'all',
  showLabels = false,
  showClusterLines = true,
  showClusterHulls = true,
  mapStyle: initialMapStyle = 'vector',
  themeMode = 'light',
  useBlueScheme = true,
  onStyleChange,
  onThemeChange,
}: PelakuUsahaMapProps) {
  const [mapStyle, setMapStyle] = useState<'vector' | 'osm' | 'satellite'>(initialMapStyle);
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(themeMode);
  const [showLines, setShowLines] = useState(showClusterLines);
  const [showHulls, setShowHulls] = useState(showClusterHulls);
  const [isDownloadingSlide, setIsDownloadingSlide] = useState(false);
  const [isDownloadingMapOnly, setIsDownloadingMapOnly] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [selectedPointDetail, setSelectedPointDetail] = useState<KnmpPelakuUsaha | null>(null);
  const [highlightedBpppKey, setHighlightedBpppKey] = useState<string | null>(selectedBppp);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Sync props to state if props change
  useEffect(() => { setHighlightedBpppKey(selectedBppp); }, [selectedBppp]);
  useEffect(() => { setMapStyle(initialMapStyle); }, [initialMapStyle]);

  // Filter real KNMP points
  const filteredPoints = useMemo(() => {
    return KNMP_PELAKU.filter((p) => {
      if (highlightedBpppKey && p.bppp !== highlightedBpppKey) return false;
      if (filterTahap !== 'all' && p.tahap !== filterTahap) return false;
      return true;
    });
  }, [highlightedBpppKey, filterTahap]);

  // Top 10 locations array with highest fishermen counts for outside summary UI
  const top10List = useMemo(() => {
    return [...filteredPoints]
      .filter((p) => (p.pelakuUsaha || 0) > 0)
      .sort((a, b) => (b.pelakuUsaha || 0) - (a.pelakuUsaha || 0))
      .slice(0, 10);
  }, [filteredPoints]);

  // Overall metrics calculated from real dataset
  const overallMetrics = useMemo(() => {
    const totalPoints = filteredPoints.length;
    const totalPelaku = filteredPoints.reduce((s, p) => s + (p.pelakuUsaha || 0), 0);
    const totalKusuka = filteredPoints.reduce((s, p) => s + (p.kusuka || 0), 0);
    const pctKusuka = totalPelaku > 0 ? Math.round((totalKusuka / totalPelaku) * 100) : 0;
    const remPelaku = Math.max(0, totalPelaku - totalKusuka);
    return { totalPoints, totalPelaku, totalKusuka, pctKusuka, remPelaku };
  }, [filteredPoints]);

  // UPT Cluster Summaries calculated from real dataset
  const uptSummaries = useMemo(() => {
    const bpppKeys = ['BPPP Medan', 'BPPP Tegal', 'BPPP Banyuwangi', 'BPPP Bitung', 'BPPP Ambon'] as const;
    return bpppKeys.map((key) => {
      const points = KNMP_PELAKU.filter((p) => p.bppp === key && (filterTahap === 'all' || p.tahap === filterTahap));
      const totalP = points.reduce((s, p) => s + (p.pelakuUsaha || 0), 0);
      const totalK = points.reduce((s, p) => s + (p.kusuka || 0), 0);
      const pct = totalP > 0 ? Math.round((totalK / totalP) * 100) : 0;
      const hubCenter = BPPP_CENTERS[key.replace('BPPP ', '')];

      return {
        key,
        name: key,
        color: BPPP_COLORS[key] || '#2563eb',
        coverage: UPT_COVERAGE[key] || '',
        hubLngLat: [hubCenter.lng, hubCenter.lat] as [number, number],
        points,
        totalTitik: points.length,
        totalPelaku: totalP,
        totalKusuka: totalK,
        pctKusuka: pct,
      };
    });
  }, [filterTahap]);

  // Responsive scale handler for 1280x720 Presentation Slide
  useEffect(() => {
    const handleFit = () => {
      if (!wrapRef.current || !slideRef.current) return;
      const parent = wrapRef.current.parentElement;
      const availWidth = parent ? parent.clientWidth : window.innerWidth;
      const availHeight = parent ? parent.clientHeight : window.innerHeight;

      const scale = Math.min(availWidth / 1280, availHeight / 720);
      wrapRef.current.style.width = `${1280 * scale}px`;
      wrapRef.current.style.height = `${720 * scale}px`;
      slideRef.current.style.transform = `scale(${scale})`;

      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.invalidateSize();
          mapRef.current?.fitBounds(INDONESIA_BOUNDS, { padding: [10, 10] });
        }, 100);
      }
    };

    handleFit();
    window.addEventListener('resize', handleFit);
    return () => window.removeEventListener('resize', handleFit);
  }, []);

  // ── Leaflet Initialization (Full Indonesian Map Bounds) ────────────────────
  useEffect(() => {
    if (!leafletContainerRef.current || mapRef.current) return;

    const map = L.map(leafletContainerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      preferCanvas: true,
    });

    map.fitBounds(INDONESIA_BOUNDS, { padding: [10, 10] });

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Render Leaflet Map Layers & Real Markers ──────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const lg = layerRef.current;
    if (!map || !lg) return;

    lg.clearLayers();

    // 1. Tile / Boundary layer
    const isLight = activeTheme === 'light';

    if (mapStyle === 'vector') {
      L.rectangle([[-90, -180], [90, 180]], {
        color: 'transparent',
        fillColor: isLight ? '#e1edf2' : '#0f2a36',
        fillOpacity: 1,
        interactive: false,
      }).addTo(lg);

      if (indonesiaBoundary?.features) {
        L.geoJSON(indonesiaBoundary as any, {
          style: {
            fillColor: isLight ? '#c9d6d3' : '#254049',
            fillOpacity: 0.95,
            color: isLight ? '#b2c3bf' : '#31535e',
            weight: 1,
          },
        }).addTo(lg);
      }
    } else if (mapStyle === 'osm') {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        crossOrigin: true,
      }).addTo(lg);
    } else {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        crossOrigin: true,
      }).addTo(lg);
    }

    const maxPelaku = Math.max(1, ...filteredPoints.map((p) => p.pelakuUsaha ?? 0));

    // 2. Convex Hulls per UPT Cluster
    if (showHulls) {
      Object.entries(BPPP_CENTERS).forEach(([bpppKey, center]) => {
        const fullBpppName = `BPPP ${bpppKey}`;
        if (highlightedBpppKey && highlightedBpppKey !== fullBpppName) return;

        const clusterPoints = KNMP_PELAKU.filter(
          (p) => p.bppp === fullBpppName && (filterTahap === 'all' || p.tahap === filterTahap)
        );

        if (clusterPoints.length === 0) return;

        const mainColor = BPPP_COLORS[fullBpppName] || center.color;
        const coords: [number, number][] = [
          [center.lat, center.lng],
          ...clusterPoints.map((p) => [p.lat, p.lng] as [number, number]),
        ];

        const hull = getConvexHull(coords);
        if (hull.length >= 3) {
          L.polygon(hull, {
            color: mainColor,
            fillColor: mainColor,
            fillOpacity: isLight ? 0.08 : 0.06,
            weight: highlightedBpppKey === fullBpppName ? 2.5 : 1.2,
            dashArray: '6, 6',
            interactive: false,
          }).addTo(lg);
        }
      });
    }

    // 3. Spider Lines connecting KNMP Points to BPPP HQ Hubs
    if (showLines) {
      filteredPoints.forEach((p) => {
        const hubKey = p.bppp.replace('BPPP ', '');
        const center = BPPP_CENTERS[hubKey];
        if (!center) return;

        const color = BPPP_COLORS[p.bppp] || '#2563eb';
        const isHl = !highlightedBpppKey || highlightedBpppKey === p.bppp;

        L.polyline([[p.lat, p.lng], [center.lat, center.lng]], {
          color: color,
          weight: highlightedBpppKey === p.bppp ? 2.2 : 1.4,
          opacity: isHl ? 0.5 : 0.15,
          dashArray: '4, 4',
          interactive: false,
        }).addTo(lg);
      });
    }

    // 4. Render real KNMP point markers
    filteredPoints.forEach((p) => {
      const color = BPPP_COLORS[p.bppp] || '#2563eb';
      const isHl = !!highlightedBpppKey && p.bppp === highlightedBpppKey;
      const pelakuVal = p.pelakuUsaha || 0;
      const dotR = Math.max(5, 5 + Math.sqrt(pelakuVal / maxPelaku) * 10);

      const dot = L.circleMarker([p.lat, p.lng], {
        radius: isHl ? dotR + 2 : dotR,
        fillColor: color,
        color: isHl ? '#ffffff' : (isLight ? '#10303f' : '#0f172a'),
        fillOpacity: isHl ? 1 : 0.9,
        weight: isHl ? 2.5 : 1.5,
      });

      dot.on('click', () => {
        setSelectedPointDetail(p);
      });

      const statusHtml =
        p.statusData === 'sudah_ada'
          ? `<span style="color:#059669;font-weight:700;">✓ Data Ada</span>`
          : p.statusData === 'belum_ada'
            ? `<span style="color:#e11d48;font-weight:700;">✕ Belum Ada</span>`
            : `<span style="color:#94a3b8;">—</span>`;

      dot.bindPopup(
        `
        <div style="font-family:system-ui;padding:6px;min-width:240px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0;"></span>
            <span style="font-size:10px;font-weight:800;color:${color};">${p.bppp.toUpperCase()} &nbsp;·&nbsp; Tahap ${p.tahap}</span>
          </div>
          <h4 style="margin:0 0 2px;font-size:15px;font-weight:800;color:#0f172a;">${p.nama}</h4>
          <p style="margin:0 0 8px;font-size:11px;color:#64748b;">${p.kecamatan}, ${p.kabupaten} · ${p.provinsi}</p>
          <div style="background:#f8fafc;border-radius:10px;padding:10px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;border:1px solid #e2e8f0;">
            <div>
              <div style="font-size:18px;font-weight:900;color:${color};">${p.pelakuUsaha?.toLocaleString('id-ID') ?? '—'}</div>
              <div style="font-size:8.5px;color:#64748b;font-weight:700;text-transform:uppercase;">Pelaku Usaha</div>
            </div>
            <div>
              <div style="font-size:18px;font-weight:900;color:#0284c7;">${p.kusuka?.toLocaleString('id-ID') ?? '—'}</div>
              <div style="font-size:8.5px;color:#64748b;font-weight:700;text-transform:uppercase;">Punya Kusuka</div>
            </div>
            <div>
              <div style="font-size:12px;font-weight:700;margin-top:4px;">${statusHtml}</div>
              <div style="font-size:8.5px;color:#64748b;font-weight:700;text-transform:uppercase;">Status Data</div>
            </div>
          </div>
          <div style="margin-top:6px;font-size:9px;color:#94a3b8;font-family:monospace;">${p.kode} &nbsp; ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</div>
        </div>
      `,
        { maxWidth: 280, closeButton: true }
      );

      dot.addTo(lg);

      // (Top 10 labels are now shown outside the map in the ranking list below)
    });

    // 5. Render 5 BPPP UPT HQ Hub Markers
    Object.entries(BPPP_CENTERS).forEach(([bpppKey, center]) => {
      const fullBpppName = `BPPP ${bpppKey}`;
      if (highlightedBpppKey && highlightedBpppKey !== fullBpppName) return;

      const isHl = highlightedBpppKey === fullBpppName;
      const mainColor = BPPP_COLORS[fullBpppName] || center.color;
      const hubIcon = buildUptHubIcon({ label: center.label, color: mainColor }, isHl, isLight);
      const hubMarker = L.marker([center.lat, center.lng], {
        icon: hubIcon,
        zIndexOffset: 4000,
      });

      const bpppPoints = KNMP_PELAKU.filter((k) => k.bppp === fullBpppName);
      const bpppPelaku = bpppPoints.reduce((acc, k) => acc + (k.pelakuUsaha ?? 0), 0);
      const bpppKusuka = bpppPoints.reduce((acc, k) => acc + (k.kusuka ?? 0), 0);

      hubMarker.bindPopup(
        `
        <div style="font-family:system-ui;padding:6px;min-width:230px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="font-size:18px;">🏢</span>
            <div>
              <h4 style="margin:0;font-size:14px;font-weight:900;color:${mainColor};">BPPP ${bpppKey.toUpperCase()}</h4>
              <p style="margin:0;font-size:10px;color:#64748b;">Balai Pelatihan & Penyuluhan Perikanan</p>
            </div>
          </div>
          <div style="background:#f8fafc;border-radius:10px;padding:8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;text-align:center;margin-top:8px;border:1px solid #e2e8f0;">
            <div>
              <div style="font-size:16px;font-weight:900;color:${mainColor};">${bpppPoints.length}</div>
              <div style="font-size:8px;color:#64748b;font-weight:700;">TITIK KNMP</div>
            </div>
            <div>
              <div style="font-size:16px;font-weight:900;color:#0284c7;">${bpppPelaku.toLocaleString('id-ID')}</div>
              <div style="font-size:8px;color:#64748b;font-weight:700;">PELAKU USAHA</div>
            </div>
            <div>
              <div style="font-size:16px;font-weight:900;color:#059669;">${bpppKusuka.toLocaleString('id-ID')}</div>
              <div style="font-size:8px;color:#64748b;font-weight:700;">KUSUKA</div>
            </div>
          </div>
        </div>
      `,
        { maxWidth: 280 }
      );

      hubMarker.addTo(lg);
    });

    map.invalidateSize();
  }, [mapStyle, activeTheme, filteredPoints, highlightedBpppKey, showLines, showHulls, filterTahap]);

  // ── 1. High Quality MAP ONLY PNG Download Action ───────────────────────────
  const handleDownloadMapOnly = async () => {
    const mapBoxEl = document.getElementById('mb') || leafletContainerRef.current;
    if (!mapBoxEl) return;

    setIsDownloadingMapOnly(true);
    try {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        mapRef.current.fitBounds(INDONESIA_BOUNDS, { padding: [10, 10] });
      }
      await new Promise((r) => setTimeout(r, 250));

      const canvas = await html2canvas(mapBoxEl as HTMLElement, {
        useCORS: true,
        allowTaint: false,
        scale: 3, // High-definition 3x scale
        logging: false,
        backgroundColor: activeTheme === 'light' ? '#e1edf2' : '#0f2a36',
      });

      const link = document.createElement('a');
      link.download = `peta-knmp-indonesia-full-map-${activeTheme}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Download Map PNG failed:', err);
      alert('Gagal mengunduh peta. Disarankan menggunakan mode peta Vektor untuk hasil gambar kualitas terbaik.');
    } finally {
      setIsDownloadingMapOnly(false);
    }
  };

  // ── 2. High Quality FULL SLIDE PNG Download Action ─────────────────────────
  const handleExportPng = async () => {
    if (!slideRef.current) return;
    setIsDownloadingSlide(true);
    try {
      await new Promise((r) => setTimeout(r, 250));
      const canvas = await html2canvas(slideRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 3, // High-definition 3x scale
        logging: false,
        backgroundColor: activeTheme === 'light' ? '#f6f8f8' : '#122028',
      });

      const link = document.createElement('a');
      link.download = `peta-knmp-full-slide-hd-${activeTheme}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Export Slide PNG failed:', err);
      alert('Gagal mengunduh slide. Disarankan menggunakan mode peta Vektor untuk hasil gambar kualitas terbaik.');
    } finally {
      setIsDownloadingSlide(false);
    }
  };

  // ── 3. Export PowerPoint (.pptx) Generator ────────────────────────────────────
  const handleExportPptx = async () => {
    setIsExportingPptx(true);
    try {
      let canvasDataUrl = '';
      if (slideRef.current) {
        const canvas = await html2canvas(slideRef.current, {
          useCORS: true,
          allowTaint: false,
          scale: 3,
          logging: false,
          backgroundColor: activeTheme === 'light' ? '#f6f8f8' : '#122028',
        });
        canvasDataUrl = canvas.toDataURL('image/png', 1.0);
      }

      const PptxGenJS = (await import('pptxgenjs')).default;
      const prs = new PptxGenJS();

      prs.layout = 'LAYOUT_WIDE'; // 16:9 widescreen layout
      prs.author = 'E-LAUT – BPPSDMKP';
      prs.company = 'Kementerian Kelautan dan Perikanan';
      prs.title = 'Peta Sebaran Pelaku Usaha KNMP & 5 BPPP UPT Pelatihan';

      const BG = '0b1519';
      const CARD_BG = '122028';
      const TEXT_WHITE = 'f8fafc';
      const TEXT_MUTED = '94a3b8';

      // SLIDE 1: Cover
      const slide1 = prs.addSlide();
      slide1.background = { color: BG };
      slide1.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: '2563eb' } });

      slide1.addText('KEMENTERIAN KELAUTAN DAN PERIKANAN', {
        x: 0.8, y: 0.8, w: 10, h: 0.4, fontSize: 13, bold: true, color: '38bdf8'
      });
      slide1.addText('Peta Sebaran Pelaku Usaha KNMP\nterhadap 5 BPPP UPT Pelatihan', {
        x: 0.8, y: 1.3, w: 11, h: 1.5, fontSize: 32, bold: true, color: TEXT_WHITE
      });
      slide1.addText('Rencana Pelatihan Kecakapan Nelayan (SKN) Luring bagi Nelayan Kampung Nelayan Merah Putih', {
        x: 0.8, y: 2.9, w: 11, h: 0.6, fontSize: 14, color: TEXT_MUTED
      });

      // Cover KPI Cards
      slide1.addShape(prs.ShapeType.roundRect, { x: 0.8, y: 3.8, w: 3.6, h: 1.8, fill: { color: CARD_BG }, line: { color: '1e293b', width: 1 } });
      slide1.addText('TOTAL PELAKU USAHA', { x: 1.0, y: 4.0, w: 3.2, h: 0.3, fontSize: 11, bold: true, color: TEXT_MUTED });
      slide1.addText(overallMetrics.totalPelaku.toLocaleString('id-ID'), { x: 1.0, y: 4.4, w: 3.2, h: 0.8, fontSize: 30, bold: true, color: '38bdf8' });

      slide1.addShape(prs.ShapeType.roundRect, { x: 4.8, y: 3.8, w: 3.6, h: 1.8, fill: { color: CARD_BG }, line: { color: '1e293b', width: 1 } });
      slide1.addText('MEMILIKI KUSUKA', { x: 5.0, y: 4.0, w: 3.2, h: 0.3, fontSize: 11, bold: true, color: TEXT_MUTED });
      slide1.addText(`${overallMetrics.totalKusuka.toLocaleString('id-ID')} (${overallMetrics.pctKusuka}%)`, { x: 5.0, y: 4.4, w: 3.2, h: 0.8, fontSize: 26, bold: true, color: '4fd1a0' });

      slide1.addShape(prs.ShapeType.roundRect, { x: 8.8, y: 3.8, w: 3.6, h: 1.8, fill: { color: CARD_BG }, line: { color: '1e293b', width: 1 } });
      slide1.addText('TOTAL TITIK KNMP', { x: 9.0, y: 4.0, w: 3.2, h: 0.3, fontSize: 11, bold: true, color: TEXT_MUTED });
      slide1.addText(`${overallMetrics.totalPoints} Titik`, { x: 9.0, y: 4.4, w: 3.2, h: 0.8, fontSize: 30, bold: true, color: 'f59e0b' });

      // SLIDE 2: Map Canvas Image Slide
      if (canvasDataUrl) {
        const slide2 = prs.addSlide();
        slide2.background = { color: BG };
        slide2.addText('PETA SEBARAN NELAYAN KNMP LEAFLET INFOGRAFIS (FULL INDONESIA)', {
          x: 0.5, y: 0.3, w: 12.33, h: 0.4, fontSize: 15, bold: true, color: TEXT_WHITE
        });
        slide2.addImage({ data: canvasDataUrl, x: 0.5, y: 0.8, w: 12.33, h: 6.2 });
      }

      // SLIDE 3: Table Breakdown by 5 BPPP UPTs
      const slide3 = prs.addSlide();
      slide3.background = { color: BG };
      slide3.addText('DISTRIBUSI PELAKU USAHA KNMP PER BPPP UPT PELATIHAN', {
        x: 0.6, y: 0.4, w: 12, h: 0.5, fontSize: 20, bold: true, color: TEXT_WHITE
      });

      const tableRows: any[][] = [
        [
          { text: 'BPPP UPT', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
          { text: 'Jumlah Titik', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
          { text: 'Total Pelaku Usaha', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
          { text: 'Memiliki KUSUKA', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
          { text: '% KUSUKA', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
          { text: 'Cakupan Wilayah', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
        ]
      ];

      uptSummaries.forEach((u) => {
        tableRows.push([
          { text: u.name, options: { bold: true, color: '38bdf8' } },
          { text: u.totalTitik.toString(), options: { color: TEXT_WHITE } },
          { text: u.totalPelaku.toLocaleString('id-ID'), options: { color: TEXT_WHITE, bold: true } },
          { text: u.totalKusuka.toLocaleString('id-ID'), options: { color: TEXT_WHITE } },
          { text: `${u.pctKusuka}%`, options: { color: '4fd1a0', bold: true } },
          { text: u.coverage, options: { color: TEXT_MUTED, fontSize: 9 } },
        ]);
      });

      slide3.addTable(tableRows, { x: 0.6, y: 1.2, w: 12.1, h: 5.5, border: { pt: 1, color: '334155' }, align: 'left', fontSize: 11 });

      // SLIDE 4: Top 10 Locations Table
      const slide4 = prs.addSlide();
      slide4.background = { color: BG };
      slide4.addText('TOP 10 LOKASI KNMP DENGAN PELAKU USAHA TERBANYAK', {
        x: 0.6, y: 0.4, w: 12, h: 0.5, fontSize: 20, bold: true, color: TEXT_WHITE
      });

      const top10 = [...filteredPoints].sort((a, b) => (b.pelakuUsaha || 0) - (a.pelakuUsaha || 0)).slice(0, 10);
      const topRows: any[][] = [
        [
          { text: 'Rank', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
          { text: 'Nama KNMP', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
          { text: 'Kabupaten / Provinsi', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
          { text: 'BPPP UPT', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
          { text: 'Pelaku Usaha', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
          { text: 'KUSUKA', options: { bold: true, fill: { color: '1e293b' }, color: TEXT_WHITE } },
        ]
      ];

      top10.forEach((p, idx) => {
        topRows.push([
          { text: `#${idx + 1}`, options: { color: 'f59e0b', bold: true } },
          { text: p.nama, options: { color: TEXT_WHITE, bold: true } },
          { text: `${p.kabupaten}, ${p.provinsi}`, options: { color: TEXT_MUTED } },
          { text: p.bppp, options: { color: '38bdf8' } },
          { text: (p.pelakuUsaha || 0).toLocaleString('id-ID'), options: { color: TEXT_WHITE, bold: true } },
          { text: (p.kusuka || 0).toLocaleString('id-ID'), options: { color: '4fd1a0' } },
        ]);
      });

      slide4.addTable(topRows, { x: 0.6, y: 1.2, w: 12.1, h: 5.5, border: { pt: 1, color: '334155' }, align: 'left', fontSize: 10 });

      await prs.writeFile({ fileName: `Peta_KNMP_Pelaku_Usaha_Top10_Full_Indonesia_${new Date().toISOString().slice(0, 10)}.pptx` });
    } catch (err) {
      console.error('Export PPTX failed:', err);
      alert('Gagal mengekspor PowerPoint. Mencoba membuat berkas presentasi...');
    } finally {
      setIsExportingPptx(false);
    }
  };

  // ── CSV Data Export Action ────────────────────────────────────────────────
  const handleExportCsv = () => {
    const headers = 'No,Kode,Nama KNMP,Desa,Kecamatan,Kabupaten,Provinsi,Status Data,Pelaku Usaha,Punya Kusuka,BPPP,Tahap';
    const rows = filteredPoints.map((p) =>
      `${p.no},"${p.kode}","${p.nama}","${p.desa}","${p.kecamatan}","${p.kabupaten}","${p.provinsi}","${p.statusData ?? ''}",${p.pelakuUsaha ?? ''},${p.kusuka ?? ''},"${p.bppp}","${p.tahap}"`
    );
    const content = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `knmp_pelaku_usaha_real_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`relative w-full h-full min-h-[720px] flex items-center justify-center transition-colors ${activeTheme === 'light' ? 'bg-slate-200' : 'bg-slate-950'
        } ${isFullscreen ? 'fixed inset-0 z-[99999] bg-slate-950' : ''}`}
    >
      {/* ── Global Styles for Leaflet Markers, DivIcons & Popups ──────────────── */}
      <style>{`
        /* Top 10 Label Badge */
        .top10-label--dark {
          background: rgba(15, 23, 42, 0.95);
          border: 1.5px solid var(--accent);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 10px var(--accent)44;
        }
        .top10-label--dark .top10-label__rank { background: var(--accent); color: #ffffff; }
        .top10-label--dark .top10-label__name { color: #ffffff; font-weight: 800; }
        .top10-label--dark .top10-label__count { color: #38bdf8; font-weight: 800; }

        .top10-label--light {
          background: rgba(255, 255, 255, 0.98);
          border: 1.5px solid var(--accent);
          color: #0f172a;
          box-shadow: 0 4px 16px rgba(30, 58, 138, 0.2), 0 0 10px var(--accent)33;
        }
        .top10-label--light .top10-label__rank { background: var(--accent); color: #ffffff; }
        .top10-label--light .top10-label__name { color: #0f172a; font-weight: 800; }
        .top10-label--light .top10-label__count { color: #0284c7; font-weight: 800; }

        .top10-label {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 9999px;
          padding: 3px 10px 3px 4px;
          backdrop-filter: blur(8px);
          font-family: system-ui, -apple-system, sans-serif;
          white-space: nowrap;
          font-size: 10.5px;
          pointer-events: none;
          z-index: 2500 !important;
        }
        .top10-label__rank {
          font-size: 9.5px;
          font-weight: 900;
          padding: 1px 6px;
          border-radius: 9999px;
        }

        /* UPT Hub Dark */
        .upt-hub--dark .upt-hub__badge {
          background: #090d16;
          color: #ffffff;
          border: 2px solid var(--accent);
          box-shadow: 0 6px 20px rgba(0,0,0,0.7), 0 0 12px var(--accent)bb;
        }

        /* UPT Hub Light */
        .upt-hub--light .upt-hub__badge {
          background: #ffffff;
          color: #0f172a;
          border: 2px solid var(--accent);
          box-shadow: 0 6px 20px rgba(37,99,235,0.2), 0 0 12px var(--accent)66;
        }

        .upt-hub {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .upt-hub__pulse {
          position: absolute;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.35;
          animation: uptPulseRing 2s infinite ease-out;
        }
        @keyframes uptPulseRing {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .upt-hub__badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 20px;
          padding: 3px 9px;
          font-size: 9.5px;
          font-weight: 900;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }
        .upt-hub--hl .upt-hub__badge {
          transform: scale(1.15);
          border-width: 2.5px;
        }

        /* Leaflet Popup Styling */
        .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          box-shadow: 0 10px 36px rgba(0,0,0,0.25) !important;
        }
        .leaflet-popup-content {
          margin: 10px 12px !important;
        }
      `}</style>

      {/* ── Top Floating Toolbar & Action Bar ───────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-xl p-2.5 px-4 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-xl text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PETA KNMP FULL INDONESIA 2025</span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Basemap Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            {(['vector', 'osm', 'satellite'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setMapStyle(s);
                  onStyleChange?.(s);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${mapStyle === s
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                {s === 'vector' ? '🗺 Vektor' : s === 'osm' ? '🌍 OSM' : '🛰 Satellit'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls: Theme, Spider Lines, CSV, High-Res Map PNG, Slide PNG & PPTX */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => {
              const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
              setActiveTheme(nextTheme);
              onThemeChange?.(nextTheme);
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            {activeTheme === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
          </button>

          {/* 1. Download MAP ONLY HD PNG Button */}
          <button
            onClick={handleDownloadMapOnly}
            disabled={isDownloadingMapOnly}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-500 shadow-md transition-all flex items-center gap-1.5 ${isDownloadingMapOnly ? 'opacity-70 cursor-wait' : ''
              }`}
            title="Unduh HANYA Gambar Peta Leaflet Kualitas Tinggi (High-Res Map Only PNG)"
          >
            {isDownloadingMapOnly ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
            <span>{isDownloadingMapOnly ? 'Memproses...' : 'Map Only HD'}</span>
          </button>

          {/* 2. Download FULL SLIDE HD PNG Button */}
          <button
            onClick={handleExportPng}
            disabled={isDownloadingSlide}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all flex items-center gap-1.5 ${isDownloadingSlide ? 'opacity-70 cursor-wait' : ''
              }`}
            title="Unduh Seluruh Slide Infografis Kualitas Tinggi (High-Res Slide PNG)"
          >
            {isDownloadingSlide ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Slide HD</span>
          </button>

          {/* 3. Export PowerPoint (.pptx) Button */}
          <button
            onClick={handleExportPptx}
            disabled={isExportingPptx}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 ${isExportingPptx ? 'opacity-70 cursor-wait' : ''
              }`}
            title="Export ke Microsoft PowerPoint (.pptx)"
          >
            {isExportingPptx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Presentation className="w-3.5 h-3.5" />}
            <span>{isExportingPptx ? 'PPTX...' : 'PPTX'}</span>
          </button>
        </div>
      </div>

      {/* ── PRESENTATION SLIDE CONTAINER WITH FULL-WIDTH LEAFLET MAP & BOTTOM SECTIONS ── */}
      <div ref={wrapRef} id="wrap" className="relative transition-all">
        <div
          ref={slideRef}
          id="slide"
          data-theme={activeTheme}
          className="w-[1280px] min-h-[720px] absolute left-0 top-0 p-[24px_32px] flex flex-col gap-3.5 origin-top-left transition-colors"
          style={{
            background: activeTheme === 'light' ? '#f6f8f8' : '#122028',
            color: activeTheme === 'light' ? '#10303f' : '#e6eff2',
          }}
        >
          {/* Embedded CSS variables matching visual layout */}
          <style>{`
            #slide {
              --bg: ${activeTheme === 'light' ? '#dfe7ea' : '#0b1519'};
              --slide: ${activeTheme === 'light' ? '#f6f8f8' : '#122028'};
              --ink: ${activeTheme === 'light' ? '#10303f' : '#e6eff2'};
              --mute: ${activeTheme === 'light' ? '#5a7280' : '#8fa8b3'};
              --sea: ${activeTheme === 'light' ? '#e1edf2' : '#0f2a36'};
              --land: ${activeTheme === 'light' ? '#c9d6d3' : '#254049'};
              --landline: ${activeTheme === 'light' ? '#b2c3bf' : '#31535e'};
              --card: ${activeTheme === 'light' ? '#ffffff' : '#182b34'};
              --line: ${activeTheme === 'light' ? '#d3dde0' : '#2a424d'};
              --accent: ${activeTheme === 'light' ? '#0b5d7a' : '#5cc3e3'};
              box-sizing: border-box;
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            }
            .cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; width: 100%; }
            .c { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 9px 10px; border-top: 5px solid var(--col); display: flex; flex-direction: column; transition: all 0.2s; }
            .c:hover, .c.active { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
            .c b { font-size: 13.5px; font-weight: 800; }
            .c .w { font-size: 9.5px; color: var(--mute); line-height: 1.3; margin: 2px 0 5px; min-height: 25px; }
            .c .big { font-size: 22px; font-weight: 800; line-height: 1; color: var(--col); }
            .c .big small { font-size: 10.5px; font-weight: 600; color: var(--mute); margin-left: 3px; }
            .c .r { font-size: 10.5px; margin-top: 5px; color: var(--mute); font-weight: 500; }
            .c .r strong { color: var(--ink); font-weight: 700; }
            .bar { height: 5px; border-radius: 3px; background: var(--line); margin-top: auto; overflow: hidden; }
            .bar i { display: block; height: 100%; background: var(--col); transition: width 0.5s ease; }
            .kpi { background: var(--ink); color: var(--slide); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; justify-content: center; }
            .kpi .l { font-size: 11px; font-weight: 600; opacity: 0.75; }
            .kpi .v { font-size: 34px; font-weight: 800; letter-spacing: -1px; line-height: 1.05; margin: 1px 0 8px; }
            .kpi .row { display: flex; justify-content: space-between; align-items: baseline; font-size: 11.5px; font-weight: 600; opacity: 0.9; }
            .kpi .row b { font-size: 18px; font-weight: 800; opacity: 1; }
            .kb { height: 7px; border-radius: 4px; background: rgba(127,127,127,0.35); margin: 5px 0 3px; overflow: hidden; }
            .kb i { display: block; height: 100%; background: #4fd1a0; transition: width 0.6s ease; }
            .kpi .n { font-size: 10.5px; opacity: 0.7; }
            .box { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; }
            .box h2 { font-size: 13.5px; font-weight: 800; margin-bottom: 6px; }
            .pill { display: flex; gap: 6px; flex-wrap: wrap; }
            .pill span { font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 6px; background: var(--sea); color: var(--ink); }
            .ins { display: flex; flex-direction: column; gap: 6px; }
            .ins div { display: flex; gap: 8px; align-items: flex-start; font-size: 11px; line-height: 1.35; color: var(--mute); }
            .ins strong { display: block; color: var(--ink); font-size: 12px; font-weight: 700; }
            .ins i { flex: none; width: 7px; height: 7px; border-radius: 2px; background: var(--accent); margin-top: 4px; }
          `}</style>

          {/* HEADER */}
          <header className="flex justify-between items-start w-full shrink-0">
            <div>
              <h1 className="text-[25px] font-extrabold tracking-tight leading-[1.15]">
                Peta Sebaran {filteredPoints.length} titik KNMP dikelompokkan ke 5 UPT Pelatihan
              </h1>
              <p className="text-[12.5px] font-medium text-[var(--mute)] mt-0.5">
                Rencana pelatihan Kecakapan Nelayan (SKN) bagi nelayan di Kampung Nelayan Merah Putih
              </p>
            </div>

            <div className="flex gap-2">
              <span className="text-[11.5px] font-bold px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--slide)]">
                SKN
              </span>
              <span className="text-[11.5px] font-bold px-3 py-1 rounded-full bg-transparent text-[var(--accent)] border-[1.5px] border-[var(--accent)]">
                Luring
              </span>
            </div>
          </header>

          {/* FULL-WIDTH INTERACTIVE LEAFLET MAP CONTAINER */}
          <div
            id="mb"
            className="relative w-full h-[540px] bg-[var(--sea)] rounded-xl overflow-hidden border border-[var(--line)] shadow-inner shrink-0"
          >
            <div ref={leafletContainerRef} className="w-full h-full" />

            <div className="absolute bottom-2 left-3 z-[400] bg-slate-900/80 backdrop-blur-md text-[10.5px] text-slate-300 px-3 py-1 rounded-lg border border-slate-700 pointer-events-none">
              Peta Leaflet Indonesia Full · Label khusus Top 10 lokasi nelayan terbanyak
            </div>

            <button
              type="button"
              onClick={() => {
                mapRef.current?.fitBounds(INDONESIA_BOUNDS, { padding: [10, 10] });
              }}
              className="absolute bottom-2 right-3 z-[400] bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white hover:bg-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 shadow-md transition-all flex items-center gap-1"
              title="Fit Peta Ke Seluruh Indonesia"
            >
              <RefreshCw className="w-3 h-3" /> Full Indonesia
            </button>
          </div>

          {/* BOTTOM ROW: KPI Total Nelayan + Pelatihan + Instruktur */}
          <section className="grid grid-cols-12 gap-3 w-full shrink-0">
            {/* KPI BOX – Total Nelayan & KUSUKA */}
            <div className="kpi col-span-5">
              <div className="l">Total nelayan di {overallMetrics.totalPoints} titik KNMP</div>
              <div className="v">{fmt(overallMetrics.totalPelaku)}</div>
              <div className="row">
                <span>Memiliki kartu KUSUKA</span>
                <b>{fmt(overallMetrics.totalKusuka)}</b>
              </div>
              <div className="kb">
                <i style={{ width: `${overallMetrics.pctKusuka}%` }} />
              </div>
              <div className="n">
                {overallMetrics.pctKusuka}% dari total nelayan sudah memiliki kartu KUSUKA; {fmt(overallMetrics.remPelaku)} belum
              </div>
            </div>

            {/* PLANNED TRAININGS BOX */}
            <div className="box col-span-3">
              <h2>Pelatihan yang direncanakan</h2>
              <div className="pill">
                <span>SKN (Sertifikat Kecakapan Nelayan) </span>
              </div>
              <p className="text-[11.5px] text-[var(--mute)] mt-2 leading-[1.4]">
                Sistem pelaksanaan <strong className="text-[var(--ink)]">luring (tatap muka)</strong> 8 JP (1 Hari) (Bagi Pemilik KUSUKA atau Suket Pernah Berlayar), diselenggarakan UPT Pelatihan.
              </p>
            </div>

            {/* INSTRUCTORS BOX */}
            <div className="box col-span-4">
              <h2>Instruktur dan pelatih</h2>
              <div className="ins">
                <div>
                  <i />
                  <span>
                    <strong>BPPP</strong> Instruktur 5 UPT
                  </span>
                </div>
                <div>
                  <i />
                  <span>
                    <strong>Politeknik KP</strong> Dosen dan Ahli
                  </span>
                </div>
                <div>
                  <i />
                  <span>
                    <strong>Pelabuhan Perikanan</strong> Instruktur dan Tenaga Teknis
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* TOP 10 KNMP - JUMLAH NELAYAN TERBANYAK */}
          <section className="w-full shrink-0" id="top10-section">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-[var(--accent)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 15l7-7 7 7" /></svg>
                <span className="text-[13px] font-extrabold uppercase tracking-wide">Top 10 KNMP — Jumlah Nelayan Terbanyak</span>
              </div>
              <div className="flex-1 h-px bg-[var(--line)]" />
              <span className="text-[11px] text-[var(--mute)] font-semibold">{filteredPoints.length} titik KNMP total</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {top10List.slice(0, 5).map((p, idx) => {
                const color = BPPP_COLORS[p.bppp] || '#2563eb';
                return (
                  <div
                    key={p.no}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all hover:scale-[1.02]"
                    style={{ background: 'var(--card)', border: `1px solid var(--line)`, borderLeft: `4px solid ${color}` }}
                    onClick={() => setSelectedPointDetail(p)}
                    title={`Klik untuk detail ${p.nama}`}
                  >
                    <span className="text-[18px] font-black shrink-0" style={{ color }}>
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>{p.nama},                       <span className="text-[9.5px] truncate" style={{ color: 'var(--mute)' }}>{p.kabupaten}</span></div>
                      <div className="text-[10px] font-semibold" style={{ color }}>{fmt(p.pelakuUsaha || 0)} <span style={{ color: 'var(--mute)', fontWeight: 500 }}>nelayan</span></div>
                      <div className="text-[10px] font-semibold" style={{ color: '#14b8a6' }}>{fmt(p.kusuka || 0)} <span style={{ color: 'var(--mute)', fontWeight: 500 }}>KUSUKA</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {top10List.slice(5, 10).map((p, idx) => {
                const color = BPPP_COLORS[p.bppp] || '#2563eb';
                return (
                  <div
                    key={p.no}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all hover:scale-[1.02]"
                    style={{ background: 'var(--card)', border: `1px solid var(--line)`, borderLeft: `4px solid ${color}` }}
                    onClick={() => setSelectedPointDetail(p)}
                    title={`Klik untuk detail ${p.nama}`}
                  >
                    <span className="text-[18px] font-black shrink-0" style={{ color }}>
                      #{idx + 6}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>{p.nama}</div>
                      <div className="text-[10px] font-semibold" style={{ color }}>{fmt(p.pelakuUsaha || 0)} <span style={{ color: 'var(--mute)', fontWeight: 500 }}>nelayan</span></div>
                      <div className="text-[10px] font-semibold" style={{ color: '#14b8a6' }}>{fmt(p.kusuka || 0)} <span style={{ color: 'var(--mute)', fontWeight: 500 }}>KUSUKA</span></div>
                      <div className="text-[9.5px] truncate" style={{ color: 'var(--mute)' }}>{p.kabupaten}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>



          {/* FOOTER */}
          <footer className="col-span-2 text-[10px] text-[var(--mute)] shrink-0 flex justify-between items-center pt-1 border-t border-[var(--line)]">
            <span>Data resmi Pelaku Usaha KNMP 2025 – Kementerian Kelautan dan Perikanan (KKP).</span>
            <span className="font-semibold text-[var(--ink)]">E-LAUT BPPSDMKP</span>
          </footer>
        </div>
      </div >

      {/* ── POINT DETAIL DIALOG MODAL ────────────────────────────────────────── */}
      {
        selectedPointDetail && (
          <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white relative">
              <button
                onClick={() => setSelectedPointDetail(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {selectedPointDetail.kode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                  Tahap {selectedPointDetail.tahap}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">{selectedPointDetail.nama}</h3>
                <p className="text-xs text-slate-400">
                  {selectedPointDetail.desa}, {selectedPointDetail.kecamatan}, {selectedPointDetail.kabupaten}, {selectedPointDetail.provinsi}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Pelaku Usaha</span>
                  <span className="text-xl font-extrabold text-blue-400">
                    {selectedPointDetail.pelakuUsaha ? selectedPointDetail.pelakuUsaha.toLocaleString('id-ID') : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Kartu KUSUKA</span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    {selectedPointDetail.kusuka ? selectedPointDetail.kusuka.toLocaleString('id-ID') : '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                <span>Pengampu UPT: <strong className="text-white">{selectedPointDetail.bppp}</strong></span>
                <span>Koordinat: <strong className="text-slate-300">{selectedPointDetail.lat.toFixed(4)}, {selectedPointDetail.lng.toFixed(4)}</strong></span>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
