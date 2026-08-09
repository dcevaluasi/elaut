'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface P2MKPPin {
    id: string | number;
    lat: number;
    lng: number;
    nama: string;
    kota: string;
    provinsi: string;
    status: string;
    pj?: string;
    alamat?: string;
    noTelp?: string;
    jenisPelatihan?: string;
    klasifikasi?: string;
    tahunPenetapan?: string;
}

const STATUS_COLOR: Record<string, string> = {
    'Utama': '#10b981',    // Emerald-500
    'Madya': '#3b82f6',    // Blue-500
    'Pemula': '#6366f1',   // Indigo-500
    'Tidak Terklasifikasi': '#94a3b8'   // Slate-400
};

export default function P2MKPLeafletMap({ pins }: { pins: P2MKPPin[] }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const layerGroupRef = useRef<L.LayerGroup | null>(null);

    const getColor = (klasifikasi: string) => {
        const k = (klasifikasi || '').toLowerCase();
        if (k.includes('utama')) return STATUS_COLOR['Utama'];
        if (k.includes('madya')) return STATUS_COLOR['Madya'];
        if (k.includes('pemula')) return STATUS_COLOR['Pemula'];
        return STATUS_COLOR['Tidak Terklasifikasi'];
    };

    // Initialize Map Instance Once
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Reset any leftover _leaflet_id on the DOM container
        if ((mapContainerRef.current as any)._leaflet_id) {
            delete (mapContainerRef.current as any)._leaflet_id;
        }

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [-2.5, 118],
                zoom: 5,
                scrollWheelZoom: false,
            });

            L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                {
                    attribution:
                        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                }
            ).addTo(map);

            const layerGroup = L.layerGroup().addTo(map);
            layerGroupRef.current = layerGroup;
            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                layerGroupRef.current = null;
            }
            if (mapContainerRef.current) {
                delete (mapContainerRef.current as any)._leaflet_id;
            }
        };
    }, []);

    // Update Pins dynamically on the existing map
    useEffect(() => {
        if (!layerGroupRef.current) return;

        layerGroupRef.current.clearLayers();

        pins.forEach((pin) => {
            const markerColor = getColor(pin.klasifikasi || '');
            const circle = L.circleMarker([pin.lat, pin.lng], {
                radius: 7,
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.85,
                weight: 2,
            });

            const popupContent = `
                <div class="custom-popup" style="
                    background: linear-gradient(145deg, #0f172a, #020617);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 16px;
                    padding: 16px;
                    min-width: 260px;
                    max-width: 300px;
                    color: #fff;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    font-family: inherit;
                ">
                    <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                        <span style="
                            font-size: 9px;
                            font-weight: 900;
                            text-transform: uppercase;
                            color: ${markerColor};
                            background-color: ${markerColor}20;
                            padding: 4px 8px;
                            border-radius: 12px;
                            border: 1px solid ${markerColor}40;
                            display: inline-block;
                        ">
                            ⭐ ${pin.klasifikasi || 'Tidak Terklasifikasi'}
                        </span>
                        ${
                            pin.tahunPenetapan && pin.tahunPenetapan !== '-'
                                ? `<span style="
                                font-size: 9px;
                                font-weight: 900;
                                text-transform: uppercase;
                                color: #cbd5e1;
                                background-color: #33415550;
                                padding: 4px 8px;
                                border-radius: 12px;
                                border: 1px solid #47556950;
                                display: inline-block;
                            ">
                                📅 Thn. ${pin.tahunPenetapan}
                            </span>`
                                : ''
                        }
                    </div>

                    <p style="
                        font-size: 14px;
                        font-weight: 800;
                        margin-bottom: 12px;
                        color: #f8fafc;
                        line-height: 1.4;
                    ">
                        ${pin.nama}
                    </p>

                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${
                            pin.pj
                                ? `<div style="display: flex; align-items: flex-start; gap: 8px;">
                                <span style="font-size: 12px;">👤</span>
                                <p style="font-size: 11px; color: #cbd5e1; margin: 0; font-weight: 500;">
                                    ${pin.pj} ${pin.noTelp ? `(${pin.noTelp})` : ''}
                                </p>
                            </div>`
                                : ''
                        }

                        ${
                            pin.jenisPelatihan
                                ? `<div style="display: flex; align-items: flex-start; gap: 8px;">
                                <span style="font-size: 12px;">🎯</span>
                                <p style="font-size: 11px; color: #cbd5e1; margin: 0; font-weight: 500;">
                                    ${pin.jenisPelatihan}
                                </p>
                            </div>`
                                : ''
                        }

                        <div style="display: flex; align-items: flex-start; gap: 8px;">
                            <span style="font-size: 12px;">📍</span>
                            <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4;">
                                ${pin.alamat ? `${pin.alamat}, ` : ''}${pin.kota}, ${pin.provinsi}
                            </p>
                        </div>
                    </div>
                </div>
            `;

            circle.bindPopup(popupContent, { className: 'p2mkp-popup' });
            circle.addTo(layerGroupRef.current!);
        });
    }, [pins]);

    return (
        <div
            ref={mapContainerRef}
            style={{ height: '100%', width: '100%', background: '#020617' }}
            className="rounded-[2rem] z-0"
        />
    );
}
