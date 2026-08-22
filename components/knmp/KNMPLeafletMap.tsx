'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CoordinatePoint } from '@/app/knmp/data/coordinates';
import { UPT_KKP_38, BALAI_PELATIHAN_UPT, UptKkpPoint } from '@/app/knmp/data/upt_kkp';
import { getNearestUpt, ClusteredCoordinatePoint, getUptClusterSummaries } from '@/app/knmp/data/clustering';
import indonesiaBoundary from '@/app/knmp/data/indonesia-boundary.json';
import { Maximize2, RefreshCw, Tag, Download, Network, GraduationCap } from 'lucide-react';

interface KNMPLeafletMapProps {
  knmpPoints: CoordinatePoint[];
  uptPoints: UptKkpPoint[];
  selectedPoint?: CoordinatePoint | UptKkpPoint | null;
  onSelectPoint?: (point: CoordinatePoint | UptKkpPoint) => void;
  activeDataset?: 'all' | 'knmp' | 'upt';
  showUptLabels?: boolean;
  onToggleUptLabels?: () => void;
  showClustering?: boolean;
  onToggleClustering?: () => void;
  targetClusterType?: 'all' | 'bppp' | 'bppp_only';
  onToggleClusterType?: () => void;
}

const PIN_RED_COLOR = '#ef4444';
const PIN_RED_STROKE = '#991b1b';
const CLUSTER_LINE_COLOR = '#0284c7';
const CLUSTER_LINE_HIGHLIGHT = '#f59e0b';

export default function KNMPLeafletMap({
  knmpPoints,
  uptPoints,
  selectedPoint,
  onSelectPoint = () => {},
  activeDataset = 'all',
  showUptLabels = true,
  onToggleUptLabels = () => {},
  showClustering = false,
  onToggleClustering = () => {},
  targetClusterType = 'all',
  onToggleClusterType = () => {},
}: KNMPLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker | L.CircleMarker | L.Polyline>>(new Map());

  const [mapStyle, setMapStyle] = useState<'blueVector' | 'osm' | 'satellite'>('blueVector');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);

  // Active target UPTs for clustering
  const activeClusterUpts = useMemo(() => {
    return targetClusterType === 'bppp' ? BALAI_PELATIHAN_UPT : uptPoints;
  }, [targetClusterType, uptPoints]);

  // Compute clustered points based on active target UPTs
  const clusteredKnmpPoints = useMemo(() => {
    return knmpPoints.map((point) => {
      const { nearestUpt, distanceKm } = getNearestUpt(point, activeClusterUpts);
      return {
        ...point,
        nearestUpt,
        distanceKm,
      } as ClusteredCoordinatePoint;
    });
  }, [knmpPoints, activeClusterUpts]);

  // Compute cluster summaries per UPT
  const clusterSummaries = useMemo(() => {
    return getUptClusterSummaries(clusteredKnmpPoints, uptPoints);
  }, [clusteredKnmpPoints, uptPoints]);

  // Active UPT ID if selected
  const selectedUptId = useMemo(() => {
    if (!selectedPoint) return null;
    if ('nearestUpt' in selectedPoint && selectedPoint.nearestUpt) {
      return (selectedPoint.nearestUpt as UptKkpPoint).id;
    }
    if ('type' in selectedPoint) return selectedPoint.id;
    return null;
  }, [selectedPoint]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      preferCanvas: true,
    });

    mapInstanceRef.current = map;
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Map Style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (!(layer instanceof L.LayerGroup)) {
        map.removeLayer(layer);
      }
    });

    if (mapStyle === 'blueVector') {
      const oceanBackground = L.rectangle(
        [
          [-90, -180],
          [90, 180],
        ],
        {
          color: 'transparent',
          fillColor: '#ffffff',
          fillOpacity: 1,
          interactive: false,
        }
      ).addTo(map);
      oceanBackground.getElement()?.setAttribute('style', 'pointer-events: none;');

      if (indonesiaBoundary && indonesiaBoundary.features) {
        L.geoJSON(indonesiaBoundary as any, {
          style: {
            fillColor: '#0077ff',
            fillOpacity: 1,
            color: '#ffffff',
            weight: 1.2,
            opacity: 1,
          },
        }).addTo(map);
      }
    } else if (mapStyle === 'osm') {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
    } else if (mapStyle === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
        }
      ).addTo(map);
    }
  }, [mapStyle]);

  // Render Map Markers & Cluster Polyline Connections
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();
    markersMapRef.current.clear();

    // 1. Render Cluster Lines if Clustering is ON
    if (showClustering && (activeDataset === 'all' || activeDataset === 'knmp')) {
      clusteredKnmpPoints.forEach((point) => {
        const isClusterSelected = selectedUptId === point.nearestUpt.id;

        // Draw glow layer (thick, low opacity)
        const glowLine = L.polyline(
          [
            [point.lat, point.lng],
            [point.nearestUpt.lat, point.nearestUpt.lng],
          ],
          {
            color: isClusterSelected ? '#fbbf24' : '#38bdf8',
            weight: isClusterSelected ? 10 : 7,
            dashArray: isClusterSelected ? '10, 5' : '8, 5',
            opacity: isClusterSelected ? 0.3 : 0.18,
            interactive: false,
          }
        );
        glowLine.addTo(layerGroupRef.current!);

        // Draw core layer (thin, sharp)
        const polyline = L.polyline(
          [
            [point.lat, point.lng],
            [point.nearestUpt.lat, point.nearestUpt.lng],
          ],
          {
            color: isClusterSelected ? CLUSTER_LINE_HIGHLIGHT : '#0ea5e9',
            weight: isClusterSelected ? 3.5 : 2.2,
            dashArray: isClusterSelected ? '10, 5' : '8, 5',
            opacity: isClusterSelected ? 1 : 0.9,
          }
        );

        polyline.bindTooltip(
          `🎓 Kluster ${targetClusterType === 'bppp' ? 'Balai Pelatihan' : 'UPT KKP'}: ${point.distanceKm} km → ${point.nearestUpt.name}`,
          { sticky: true, className: 'cluster-tooltip' }
        );

        polyline.addTo(layerGroupRef.current!);
      });
    }

    // 2. Render KNMP Red Pins
    if (activeDataset === 'all' || activeDataset === 'knmp') {
      clusteredKnmpPoints.forEach((point) => {
        const isSelected = selectedPoint?.id === point.id;
        const isClusterSelected = selectedUptId === point.nearestUpt.id;

        const marker = L.circleMarker([point.lat, point.lng], {
          radius: isSelected ? 12 : isClusterSelected ? 9 : knmpPoints.length > 500 ? 5.5 : 7.5,
          color: isSelected ? '#ffffff' : isClusterSelected ? '#f59e0b' : PIN_RED_STROKE,
          fillColor: isClusterSelected ? '#f59e0b' : PIN_RED_COLOR,
          fillOpacity: isSelected ? 1 : 0.95,
          weight: isSelected ? 3.5 : isClusterSelected ? 2.5 : 1.8,
        });

        const clusterHtml = `
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <div style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
              🎓 ${targetClusterType === 'bppp' ? 'Balai Pelatihan (BPPP)' : 'UPT KKP'} Terdekat (${point.distanceKm} km)
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #0f172a;">
              🏢 ${point.nearestUpt.name}
            </div>
          </div>
        `;

        const popupHtml = `
          <div style="font-family: 'Poppins', system-ui, sans-serif; padding: 6px; min-width: 210px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 700; background: #ef444420; color: #ef4444; border: 1px solid #ef444440; padding: 2px 8px; border-radius: 9999px;">
                🔴 KNMP Red Pin #${point.no}
              </span>
              <span style="font-size: 11px; font-weight: 600; color: #64748b;">${point.region}</span>
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${point.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569;">📍 ${point.location}</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; font-size: 11px; font-family: monospace; color: #334155;">
              <div><strong>Lat:</strong> ${point.lat}</div>
              <div><strong>Lng:</strong> ${point.lng}</div>
            </div>
            ${clusterHtml}
          </div>
        `;

        marker.bindPopup(popupHtml, { closeButton: true });
        marker.on('click', () => onSelectPoint(point));

        marker.addTo(layerGroupRef.current!);
        markersMapRef.current.set(`knmp-${point.id}`, marker);
      });
    }

    // 3. Render UPT KKP Blue Pins & Spaced Poppins Labels
    if (activeDataset === 'all' || activeDataset === 'upt') {
      uptPoints.forEach((upt) => {
        const isSelected = selectedPoint?.id === upt.id || selectedUptId === upt.id;
        const isBalaiPelatihan = upt.type === 'BPPP' || upt.type === 'Balai Diklat' || upt.name.includes('BPPP') || upt.name.includes('Balai Diklat');
        const summary = clusterSummaries.find((s) => s.upt.id === upt.id);
        const assignedCount = summary ? summary.assignedPointsCount : 0;

        const marker = L.circleMarker([upt.lat, upt.lng], {
          radius: isSelected ? 13 : isBalaiPelatihan ? 11 : 9.5,
          color: isSelected ? '#f59e0b' : isBalaiPelatihan ? '#38bdf8' : '#ffffff',
          fillColor: isBalaiPelatihan ? '#0284c7' : '#2563eb',
          fillOpacity: 1,
          weight: isSelected ? 3.8 : 2.5,
        });

        if (showUptLabels) {
          const dir = upt.direction || 'top';
          const baseOffset: [number, number] = upt.offset || [0, -12];
          const spacedOffset: [number, number] = [
            baseOffset[0],
            dir === 'top' ? baseOffset[1] - 4 : dir === 'bottom' ? baseOffset[1] + 4 : baseOffset[1],
          ];

          const labelText = showClustering ? `${upt.name} (${assignedCount} KNMP)` : upt.name;

          marker.bindTooltip(labelText, {
            permanent: true,
            direction: dir,
            offset: spacedOffset,
            className: isSelected
              ? 'upt-label-tooltip-selected'
              : isBalaiPelatihan
              ? 'upt-label-tooltip-bppp'
              : 'upt-label-tooltip',
          });
        }

        const popupHtml = `
          <div style="font-family: 'Poppins', system-ui, sans-serif; padding: 6px; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 700; background: ${isBalaiPelatihan ? '#0284c720' : '#3b82f620'}; color: ${isBalaiPelatihan ? '#0284c7' : '#2563eb'}; border: 1px solid ${isBalaiPelatihan ? '#0284c740' : '#3b82f640'}; padding: 2px 8px; border-radius: 9999px;">
                ${isBalaiPelatihan ? '🎓 Balai Pelatihan (BPPP)' : '🔵 UPT KKP'} #${upt.no}
              </span>
              <span style="font-size: 11px; font-weight: 600; color: #64748b;">${upt.region}</span>
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${upt.name}</h4>
            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #0284c7;">Jenis: ${upt.type}</p>

            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 11px;">
              <div style="font-weight: 700; color: #0284c7; margin-bottom: 2px;">
                📊 Ringkasan Kluster Pembinaan:
              </div>
              <div style="color: #334155;">Total KNMP : <strong>${assignedCount} Titik</strong></div>
              ${summary && summary.assignedPointsCount > 0 ? `
                <div style="color: #475569;">Jarak Rata-rata: <strong>${summary.avgDistanceKm} km</strong></div>
                <div style="color: #475569;">Rentang Jarak: <strong>${summary.minDistanceKm} - ${summary.maxDistanceKm} km</strong></div>
              ` : ''}
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; font-size: 11px; font-family: monospace; color: #334155; margin-top: 6px;">
              <div><strong>Lat:</strong> ${upt.lat}</div>
              <div><strong>Lng:</strong> ${upt.lng}</div>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, { closeButton: true });
        marker.on('click', () => onSelectPoint(upt));

        marker.addTo(layerGroupRef.current!);
        markersMapRef.current.set(`upt-${upt.id}`, marker);
      });
    }
  }, [knmpPoints, uptPoints, activeDataset, showUptLabels, showClustering, targetClusterType, selectedPoint, selectedUptId, onSelectPoint, clusteredKnmpPoints, clusterSummaries, activeClusterUpts]);

  // Fly to Selected Point
  useEffect(() => {
    if (!selectedPoint || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedPoint.lat, selectedPoint.lng], 9, {
      duration: 1.2,
    });
  }, [selectedPoint]);

  // Download High Resolution Styled Map WITH EMBEDDED GRAPHIC TABLE
  const downloadStyledMapPNG = (exportMode: 'all' | 'upt' | 'knmp') => {
    setIsExportingPNG(true);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      const width = 2500;
      const mapHeight = 1250;
      const tableHeight = 1050;
      const totalHeight = mapHeight + tableHeight;

      canvas.width = width;
      canvas.height = totalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsExportingPNG(false);
        return;
      }

      // Pure white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, totalHeight);

      const minLng = 94.0;
      const maxLng = 142.5;
      const minLat = -11.5;
      const maxLat = 6.5;
      const padding = 120;

      const project = (lng: number, lat: number) => {
        const x = padding + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
        const y = padding + ((maxLat - lat) / (maxLat - minLat)) * (mapHeight - 2 * padding);
        return { x, y };
      };

      const drawPolygonCoordinates = (coords: number[][]) => {
        if (coords.length === 0) return;
        ctx.beginPath();
        coords.forEach((coord, idx) => {
          const { x, y } = project(coord[0], coord[1]);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = '#1d6ef5';
        ctx.fill();
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.stroke();
      };

      // 1. Draw Land Mass Polygons
      if (indonesiaBoundary && indonesiaBoundary.features) {
        indonesiaBoundary.features.forEach((feature: any) => {
          const geom = feature.geometry;
          if (geom.type === 'Polygon') {
            geom.coordinates.forEach((ring: number[][]) => drawPolygonCoordinates(ring));
          } else if (geom.type === 'MultiPolygon') {
            geom.coordinates.forEach((poly: number[][][]) => {
              poly.forEach((ring: number[][]) => drawPolygonCoordinates(ring));
            });
          }
        });
      }

      // 2. Draw Cluster Lines
      if (showClustering && (exportMode === 'all' || exportMode === 'knmp')) {
        clusteredKnmpPoints.forEach((point) => {
          const start = project(point.lng, point.lat);
          const end = project(point.nearestUpt.lng, point.nearestUpt.lat);

          ctx.save();
          // Glow pass
          ctx.beginPath();
          ctx.setLineDash([10, 5]);
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = 'rgba(14, 165, 233, 0.22)';
          ctx.lineWidth = 8;
          ctx.stroke();
          // Core pass
          ctx.beginPath();
          ctx.setLineDash([10, 5]);
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = '#0ea5e9';
          ctx.lineWidth = 2.4;
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        });
      }

      // 3. Draw ALL KNMP Red Pins
      if (exportMode === 'all' || exportMode === 'knmp') {
        clusteredKnmpPoints.forEach((point) => {
          const { x, y } = project(point.lng, point.lat);
          const radius = knmpPoints.length > 500 ? 5.5 : 7.5;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetY = 2;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = PIN_RED_COLOR;
          ctx.fill();

          ctx.lineWidth = knmpPoints.length > 500 ? 1 : 1.5;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.shadowColor = 'transparent';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
      }

      // 4. Draw UPT KKP Blue Pins & Name Labels (big font + collision-free placement)
      if (exportMode === 'all' || exportMode === 'upt') {
        const LPAD = 10;
        const LFONT = 15;
        const LBOX_H = LFONT + 12;
        const LMARGIN = 6;
        const placed: { x: number; y: number; w: number; h: number }[] = [];

        const hitTest = (bx: number, by: number, bw: number, bh: number) =>
          placed.some(
            (b) =>
              bx < b.x + b.w + LMARGIN &&
              bx + bw + LMARGIN > b.x &&
              by < b.y + b.h + LMARGIN &&
              by + bh + LMARGIN > b.y
          );

        const calcPos = (px: number, py: number, tw: number, dir: string, dist: number) => {
          const bw = tw + LPAD * 2;
          switch (dir) {
            case 'bottom': return { bx: px - bw / 2, by: py + dist, lx: px - tw / 2, ly: py + dist + LBOX_H - 5 };
            case 'left':   return { bx: px - bw - dist, by: py - LBOX_H / 2, lx: px - bw - dist + LPAD, ly: py + 6 };
            case 'right':  return { bx: px + dist, by: py - LBOX_H / 2, lx: px + dist + LPAD, ly: py + 6 };
            default:       return { bx: px - bw / 2, by: py - dist - LBOX_H, lx: px - tw / 2, ly: py - dist - 5 };
          }
        };

        // Sort by assigned count desc so the most important UPTs get preferred slots
        const sortedUpts = [...uptPoints].sort((a, b) => {
          const sa = clusterSummaries.find((s) => s.upt.id === a.id)?.assignedPointsCount ?? 0;
          const sb = clusterSummaries.find((s) => s.upt.id === b.id)?.assignedPointsCount ?? 0;
          return sb - sa;
        });

        // Pass 1 – draw all pins first
        sortedUpts.forEach((upt) => {
          const { x, y } = project(upt.lng, upt.lat);

          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 4;

          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#2563eb';
          ctx.fill();

          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.shadowColor = 'transparent';
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });

        // Pass 2 – smart label placement
        sortedUpts.forEach((upt) => {
          const { x, y } = project(upt.lng, upt.lat);
          const summary = clusterSummaries.find((s) => s.upt.id === upt.id);
          const assignedCount = summary ? summary.assignedPointsCount : 0;

          ctx.font = `bold ${LFONT}px 'Poppins', system-ui, sans-serif`;
          const labelText = showClustering ? `${upt.name} (${assignedCount} Titik)` : upt.name;
          const tw = ctx.measureText(labelText).width;
          const bw = tw + LPAD * 2;

          const dirs = [upt.direction || 'top', 'top', 'bottom', 'right', 'left'];
          const offsets = [14, 22, 32, 44, 58];
          let finalPos: { bx: number; by: number; lx: number; ly: number } | null = null;

          outer: for (const off of offsets) {
            for (const dir of dirs) {
              const pos = calcPos(x, y, tw, dir, off);
              if (!hitTest(pos.bx, pos.by, bw, LBOX_H)) {
                finalPos = pos;
                break outer;
              }
            }
          }
          if (!finalPos) finalPos = calcPos(x, y, tw, upt.direction || 'top', 14);

          // Thin connector from pin to label box
          const boxCx = finalPos.bx + bw / 2;
          const boxCy = finalPos.by + LBOX_H / 2;
          const dx = boxCx - x;
          const dy = boxCy - y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const sx = x + (dx / d) * 12;
          const sy = y + (dy / d) * 12;

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(boxCx, finalPos.by > y ? finalPos.by : finalPos.by + LBOX_H);
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.setLineDash([]);

          // Label box
          ctx.shadowColor = 'rgba(0, 119, 255, 0.12)';
          ctx.shadowBlur = 5;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
          ctx.beginPath();
          ctx.roundRect(finalPos.bx, finalPos.by, bw, LBOX_H, 7);
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#0ea5e9';
          ctx.stroke();

          // Label text
          ctx.fillStyle = '#0c4a6e';
          ctx.font = `bold ${LFONT}px 'Poppins', system-ui, sans-serif`;
          ctx.fillText(labelText, finalPos.lx, finalPos.ly);

          placed.push({ x: finalPos.bx, y: finalPos.by, w: bw, h: LBOX_H });
        });
      }

      // 5. Draw Full Embedded Graphic Data Table at Bottom
      const tableStartY = mapHeight + 30;
      ctx.shadowColor = 'rgba(0, 119, 255, 0.15)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.roundRect(40, tableStartY, width - 80, 70, 16);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      ctx.font = "bold 20px 'Poppins', system-ui, sans-serif";
      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        `TABEL KETERANGAN CLUSTERING PEMBINAAN (${targetClusterType === 'bppp' ? 'KHUSUS BALAI PELATIHAN BPPP' : '38 UPT KKP'}) - ${knmpPoints.length} TITIK KNMP`,
        70,
        tableStartY + 42
      );

      ctx.font = "bold 13px 'Poppins', system-ui, sans-serif";
      ctx.fillStyle = '#7dd3fc';
      ctx.fillText(`TARGET: ${targetClusterType === 'bppp' ? 'BALAI PELATIHAN (BPPP)' : 'SEMUA 38 UPT'}  |  MODE: ${knmpPoints.length} TITIK KNMP`, width - 680, tableStartY + 42);

      const colWidth = (width - 110) / 2;
      const rowHeight = 44;
      const subTableStartY = tableStartY + 90;

      const drawSubTable = (startIndex: number, endIndex: number, startX: number) => {
        // Column header row
        ctx.fillStyle = '#1e3a5f';
        ctx.beginPath();
        ctx.roundRect(startX, subTableStartY, colWidth, 38, 10);
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();

        ctx.font = "bold 12px 'Poppins', sans-serif";
        ctx.fillStyle = '#7dd3fc';
        ctx.fillText('NO', startX + 15, subTableStartY + 24);
        ctx.fillText('NAMA UPT KKP', startX + 60, subTableStartY + 24);
        ctx.fillText('JENIS UPT', startX + colWidth - 360, subTableStartY + 24);
        ctx.fillText('WILAYAH', startX + colWidth - 230, subTableStartY + 24);
        ctx.fillText('KNMP', startX + colWidth - 115, subTableStartY + 24);

        clusterSummaries.slice(startIndex, endIndex).forEach((s, idx) => {
          const rowY = subTableStartY + 48 + idx * rowHeight;
          const hasPoints = s.assignedPointsCount > 0;

          // Row background — white-based for readability
          ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#eef5ff';
          ctx.beginPath();
          ctx.roundRect(startX, rowY, colWidth, 38, 8);
          ctx.fill();

          // Row separator
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(startX, rowY + 38);
          ctx.lineTo(startX + colWidth, rowY + 38);
          ctx.stroke();

          ctx.font = "bold 12px 'Poppins', sans-serif";
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`#${s.upt.no}`, startX + 15, rowY + 24);

          ctx.fillStyle = '#0f172a';
          ctx.fillText(s.upt.name.length > 32 ? s.upt.name.substring(0, 30) + '...' : s.upt.name, startX + 60, rowY + 24);

          ctx.fillStyle = '#2563eb';
          ctx.font = "11px 'Poppins', sans-serif";
          ctx.fillText(s.upt.type, startX + colWidth - 360, rowY + 24);

          ctx.fillStyle = '#475569';
          ctx.fillText(s.upt.region.length > 15 ? s.upt.region.substring(0, 13) + '..' : s.upt.region, startX + colWidth - 230, rowY + 24);

          // KNMP count badge
          ctx.fillStyle = hasPoints ? '#0369a1' : '#94a3b8';
          ctx.beginPath();
          ctx.roundRect(startX + colWidth - 120, rowY + 6, 105, 26, 8);
          ctx.fill();

          ctx.font = "bold 12px 'Poppins', sans-serif";
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`${s.assignedPointsCount} Titik`, startX + colWidth - 105, rowY + 24);
        });
      };

      drawSubTable(0, 19, 40);
      drawSubTable(19, 38, 40 + colWidth + 30);

      const clusterSuffix = showClustering ? `_clustering_${targetClusterType}` : '';
      const filename = `peta_dan_tabel_lengkap_${knmpPoints.length}_knmp_${targetClusterType}${clusterSuffix}.png`;

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      setIsExportingPNG(false);
    }, 100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-2.5, 118.0], 5);
    }
  };

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden bg-white ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Map Control Bar Top Left */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-xl">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMapStyle('blueVector')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              mapStyle === 'blueVector'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vektor Biru
          </button>
          <button
            onClick={() => setMapStyle('osm')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              mapStyle === 'osm'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            OSM Map
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              mapStyle === 'satellite'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satelit
          </button>
        </div>

        {/* Clustering Target Switcher (Semua UPT vs Balai Pelatihan BPPP) */}
        <button
          onClick={onToggleClusterType}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
            targetClusterType === 'bppp'
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-md shadow-amber-500/20'
              : 'bg-blue-500/20 text-blue-300 border-blue-400/50 shadow-md'
          }`}
          title="Ganti Target Clustering (Semua UPT vs Khusus Balai Pelatihan BPPP)"
        >
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>{targetClusterType === 'bppp' ? '🎓 Kluster Balai Pelatihan' : '🏢 Kluster Semua UPT'}</span>
        </button>

        {/* Clustering UPT Lines Toggle */}
        <button
          onClick={onToggleClustering}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
            showClustering
              ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 shadow-md shadow-sky-500/20'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
          }`}
          title="Tampilkan Garis Penghubung Clustering UPT KKP Terdekat"
        >
          <Network className="w-3.5 h-3.5" />
          <span>Garis ({showClustering ? 'ON' : 'OFF'})</span>
        </button>

        <button
          onClick={onToggleUptLabels}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
            showUptLabels
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
              : 'bg-slate-950 text-slate-400 border-slate-800'
          }`}
          title="Tampilkan / Sembunyikan Label UPT"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Label</span>
        </button>

        <button
          onClick={resetView}
          className="p-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800 transition-all"
          title="Reset Zoom / Tampilan Peta"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800 transition-all"
          title="Layar Penuh"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Download PNG Overlay Control Bar Top Right */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-xl">
        <button
          onClick={() => downloadStyledMapPNG('all')}
          disabled={isExportingPNG}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExportingPNG ? 'Mengunduh...' : `Download PNG Peta + Tabel`}</span>
        </button>
      </div>

      {/* Global CSS Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        .upt-label-tooltip {
          font-family: 'Poppins', sans-serif !important;
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1.5px solid #38bdf8 !important;
          color: #f0f9ff !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          padding: 4px 10px !important;
          border-radius: 8px !important;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5) !important;
          white-space: nowrap !important;
          letter-spacing: 0.01em !important;
        }

        .upt-label-tooltip-bppp {
          font-family: 'Poppins', sans-serif !important;
          background: rgba(12, 74, 110, 0.95) !important;
          border: 2px solid #0284c7 !important;
          color: #e0f2fe !important;
          font-weight: 800 !important;
          font-size: 11px !important;
          padding: 4px 10px !important;
          border-radius: 8px !important;
          box-shadow: 0 6px 18px rgba(2, 132, 199, 0.4) !important;
          white-space: nowrap !important;
        }

        .upt-label-tooltip-selected {
          font-family: 'Poppins', sans-serif !important;
          background: rgba(120, 53, 15, 0.95) !important;
          border: 2px solid #f59e0b !important;
          color: #fef3c7 !important;
          font-weight: 800 !important;
          font-size: 12px !important;
          padding: 5px 12px !important;
          border-radius: 8px !important;
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5) !important;
          white-space: nowrap !important;
        }

        .cluster-tooltip {
          font-family: 'Poppins', sans-serif !important;
          background: rgba(12, 74, 110, 0.95) !important;
          border: 1.5px solid #38bdf8 !important;
          color: #e0f2fe !important;
          font-weight: 700 !important;
          font-size: 10px !important;
          padding: 3px 8px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
        }
      `}</style>

      {/* Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}
