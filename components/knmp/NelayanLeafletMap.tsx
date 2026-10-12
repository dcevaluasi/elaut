'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BPPP_5, NELAYAN_65, getBpppByName } from '@/app/knmp/data/knmp_nelayan';
import indonesiaBoundary from '@/app/knmp/data/indonesia-boundary.json';
import { Maximize2, RefreshCw } from 'lucide-react';

interface NelayanLeafletMapProps {
  showClustering?: boolean;
  showLabels?: boolean;
  showNelayanCount?: boolean;
  selectedBpppId?: number | null;
  onSelectBppp?: (id: number | null) => void;
  mapContainerForExport?: React.RefObject<HTMLDivElement | null>;
}

export default function NelayanLeafletMap({
  showClustering = true,
  showLabels = true,
  showNelayanCount = true,
  selectedBpppId = null,
  onSelectBppp = () => {},
  mapContainerForExport,
}: NelayanLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [mapStyle, setMapStyle] = useState<'vector' | 'osm' | 'satellite'>('vector');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Forward ref so parent can capture the map div for html2canvas
  useEffect(() => {
    if (mapContainerForExport && mapContainerRef.current) {
      (mapContainerForExport as React.MutableRefObject<HTMLDivElement | null>).current = mapContainerRef.current;
    }
  }, [mapContainerForExport]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      preferCanvas: true,
    });
    mapRef.current = map;
    const lg = L.layerGroup().addTo(map);
    layerRef.current = lg;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update base layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.eachLayer(layer => {
      if (!(layer instanceof L.LayerGroup)) map.removeLayer(layer);
    });
    if (mapStyle === 'vector') {
      L.rectangle([[-90, -180], [90, 180]], {
        color: 'transparent', fillColor: '#dbeafe', fillOpacity: 1, interactive: false,
      }).addTo(map);
      if (indonesiaBoundary?.features) {
        L.geoJSON(indonesiaBoundary as any, {
          style: { fillColor: '#1d4ed8', fillOpacity: 0.9, color: '#ffffff', weight: 1.0, opacity: 1 },
        }).addTo(map);
      }
    } else if (mapStyle === 'osm') {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    } else {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri' }
      ).addTo(map);
    }
  }, [mapStyle]);

  // Render markers + labels
  useEffect(() => {
    const lg = layerRef.current;
    if (!lg) return;
    lg.clearLayers();

    // Find max nelayan for size scaling
    const maxAnggota = Math.max(...NELAYAN_65.map(n => n.jumlahAnggota));

    // 1. Cluster lines
    if (showClustering) {
      NELAYAN_65.forEach(n => {
        const bppp = getBpppByName(n.upt);
        if (!bppp) return;
        const isSelected = selectedBpppId === bppp.id;
        const color = bppp.color;
        // glow layer
        L.polyline([[n.lat, n.lng], [bppp.lat, bppp.lng]], {
          color, weight: isSelected ? 12 : 7,
          dashArray: '8,5', opacity: isSelected ? 0.38 : 0.15, interactive: false,
        }).addTo(lg);
        // core line
        L.polyline([[n.lat, n.lng], [bppp.lat, bppp.lng]], {
          color, weight: isSelected ? 2.8 : 1.6,
          dashArray: '8,5', opacity: isSelected ? 1 : 0.7,
        }).addTo(lg);
      });
    }

    // 2. KNMP markers — circle size proportional to jumlahAnggota, colored by UPT
    NELAYAN_65.forEach(n => {
      const bppp = getBpppByName(n.upt);
      const color = bppp?.color ?? '#64748b';
      const colorDark = bppp?.colorDark ?? '#334155';
      const isSelected = selectedBpppId === bppp?.id;

      // Scale radius between 5 and 13 based on nelayan count
      const baseRadius = 5 + ((n.jumlahAnggota / maxAnggota) * 8);
      const radius = isSelected ? baseRadius + 3 : baseRadius;

      const m = L.circleMarker([n.lat, n.lng], {
        radius,
        fillColor: color,
        color: isSelected ? '#ffffff' : colorDark,
        fillOpacity: isSelected ? 1 : 0.88,
        weight: isSelected ? 2.5 : 1.5,
      });

      // Permanent label showing jumlah anggota
      if (showNelayanCount) {
        m.bindTooltip(`${n.jumlahAnggota}`, {
          permanent: true,
          direction: 'top',
          offset: [0, -(radius + 2)],
          className: 'nelayan-count-label',
        });
      }

      m.bindPopup(`
        <div style="font-family:system-ui,sans-serif;padding:6px;min-width:230px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="width:12px;height:12px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;border:1.5px solid ${colorDark};"></span>
            <span style="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;">${n.upt}</span>
          </div>
          <h4 style="margin:0 0 2px;font-size:14px;font-weight:700;color:#0f172a;">${n.desaKota}</h4>
          <p style="margin:0 0 8px;font-size:11px;color:#64748b;">${n.kecamatan}, ${n.kabupaten}, ${n.provinsi}</p>
          <div style="background:#f1f5f9;border-radius:10px;padding:10px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;">
            <div>
              <div style="font-size:22px;font-weight:900;color:${color};">${n.jumlahAnggota}</div>
              <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Anggota</div>
            </div>
            <div>
              <div style="font-size:22px;font-weight:900;color:${color};">${n.jumlahOrgPdLaut}</div>
              <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Org Laut</div>
            </div>
            <div>
              <div style="font-size:22px;font-weight:900;color:${color};">${n.jumlahRTN}</div>
              <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;">RTN</div>
            </div>
          </div>
          <div style="margin-top:6px;font-size:10px;color:#94a3b8;font-family:monospace;">${n.lat.toFixed(4)}, ${n.lng.toFixed(4)}</div>
        </div>
      `, { closeButton: true, maxWidth: 260 });

      m.addTo(lg);
    });

    // 3. BPPP markers (larger, white-outlined)
    BPPP_5.forEach(bppp => {
      const assigned = NELAYAN_65.filter(n => n.upt === bppp.name);
      const totalAnggota = assigned.reduce((s, p) => s + p.jumlahAnggota, 0);
      const isSelected = selectedBpppId === bppp.id;

      const m = L.circleMarker([bppp.lat, bppp.lng], {
        radius: isSelected ? 17 : 14,
        fillColor: bppp.color,
        color: '#ffffff',
        fillOpacity: 1,
        weight: isSelected ? 4 : 3,
      });

      if (showLabels) {
        const labelText = showClustering
          ? `${bppp.name}\n${assigned.length} KNMP · ${totalAnggota} nelayan`
          : bppp.name;
        m.bindTooltip(labelText, {
          permanent: true,
          direction: 'top',
          offset: [0, -20],
          className: 'bppp-label',
        });
      }

      m.bindPopup(`
        <div style="font-family:system-ui,sans-serif;padding:6px;min-width:240px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="width:14px;height:14px;border-radius:50%;background:${bppp.color};display:inline-block;border:2px solid #fff;box-shadow:0 0 0 2px ${bppp.color};flex-shrink:0;"></span>
            <span style="font-size:10px;font-weight:700;color:${bppp.color};text-transform:uppercase;">Balai Pelatihan Perikanan</span>
          </div>
          <h4 style="margin:0 0 10px;font-size:16px;font-weight:800;color:#0f172a;">${bppp.name}</h4>
          <div style="background:#f1f5f9;border-radius:10px;padding:10px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;">
            <div>
              <div style="font-size:24px;font-weight:900;color:${bppp.color};">${assigned.length}</div>
              <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Titik KNMP</div>
            </div>
            <div>
              <div style="font-size:24px;font-weight:900;color:${bppp.color};">${totalAnggota}</div>
              <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Total Nelayan</div>
            </div>
            <div>
              <div style="font-size:24px;font-weight:900;color:${bppp.color};">${assigned.length > 0 ? Math.round(totalAnggota / assigned.length) : 0}</div>
              <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Avg/Titik</div>
            </div>
          </div>
          <div style="margin-top:6px;font-size:10px;color:#94a3b8;font-family:monospace;">${bppp.lat.toFixed(4)}, ${bppp.lng.toFixed(4)}</div>
        </div>
      `, { closeButton: true, maxWidth: 280 });

      m.on('click', () => onSelectBppp(selectedBpppId === bppp.id ? null : bppp.id));
      m.addTo(lg);
    });

  }, [showClustering, showLabels, showNelayanCount, selectedBpppId, onSelectBppp]);

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-white ${isFullscreen ? 'fixed inset-0 z-[1000] rounded-none' : ''}`}>
      <style>{`
        .nelayan-count-label {
          background: rgba(15,23,42,0.85) !important;
          border: none !important;
          border-radius: 5px !important;
          color: #f8fafc !important;
          font-size: 9.5px !important;
          font-weight: 800 !important;
          padding: 1px 5px !important;
          white-space: nowrap !important;
          box-shadow: 0 1px 6px rgba(0,0,0,0.3) !important;
        }
        .nelayan-count-label::before { display: none !important; }
        .bppp-label {
          background: rgba(15,23,42,0.93) !important;
          border: none !important;
          border-radius: 7px !important;
          color: #f1f5f9 !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          padding: 4px 9px !important;
          white-space: pre !important;
          box-shadow: 0 2px 14px rgba(0,0,0,0.35) !important;
          line-height: 1.5 !important;
        }
        .bppp-label::before { display: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 14px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important; }
        .leaflet-popup-content { margin: 10px 12px !important; }
      `}</style>

      <div ref={mapContainerRef} className="w-full h-full" id="nelayan-map-canvas" />

      {/* Map style switcher */}
      <div className="absolute top-3 left-3 z-[500]">
        <div className="bg-slate-900/92 backdrop-blur-md border border-slate-700 rounded-xl p-1 flex gap-1">
          {(['vector', 'osm', 'satellite'] as const).map(s => (
            <button key={s} onClick={() => setMapStyle(s)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${mapStyle === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {s === 'vector' ? '🗺 Vektor' : s === 'osm' ? '🌍 OSM' : '🛰 Sat'}
            </button>
          ))}
        </div>
      </div>

      {/* Top right controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[500]">
        <button onClick={() => setIsFullscreen(v => !v)}
          title={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
          className="bg-slate-900/92 backdrop-blur-md border border-slate-700 p-2 rounded-xl text-slate-300 hover:text-white transition-all">
          <Maximize2 className="w-4 h-4" />
        </button>
        <button onClick={() => mapRef.current?.setView([-2.5, 118.0], 5)}
          title="Reset view"
          className="bg-slate-900/92 backdrop-blur-md border border-slate-700 p-2 rounded-xl text-slate-300 hover:text-white transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Fullscreen close button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition-all">
          ✕ Tutup Fullscreen
        </button>
      )}
    </div>
  );
}
