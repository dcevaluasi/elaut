'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
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
    'Muda': '#f59e0b',      // Amber-500
    'Pemula': '#6366f1',   // Indigo-500
    'Belum Klasifikasi': '#94a3b8'   // Slate-400
};

function MapContent({ pins, getColor }: { pins: P2MKPPin[], getColor: (s: string) => string }) {
    return (
        <>
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />

            {pins.map((pin, index) => {
                const markerColor = getColor(pin.klasifikasi || '');
                return (
                    <CircleMarker
                        key={`${pin.id}-${index}`}
                        center={[pin.lat, pin.lng]}
                        radius={7}
                        pathOptions={{
                            color: markerColor,
                            fillColor: markerColor,
                            fillOpacity: 0.85,
                            weight: 2,
                        }}
                    >
                        <Popup className="p2mkp-popup custom-popup">
                            <div style={{
                                background: 'linear-gradient(145deg, #0f172a, #020617)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '16px',
                                padding: '16px',
                                minWidth: '260px',
                                maxWidth: '300px',
                                color: '#fff',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            }}>
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                                    <span style={{
                                        fontSize: '9px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        color: markerColor,
                                        backgroundColor: `${markerColor}20`,
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        border: `1px solid ${markerColor}40`,
                                        display: 'inline-block'
                                    }}>
                                        ⭐ {pin.klasifikasi || 'Belum Klasifikasi'}
                                    </span>
                                    {pin.tahunPenetapan && pin.tahunPenetapan !== '-' && (
                                        <span style={{
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            color: '#cbd5e1',
                                            backgroundColor: '#33415550',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            border: '1px solid #47556950',
                                            display: 'inline-block'
                                        }}>
                                            📅 Thn. {pin.tahunPenetapan}
                                        </span>
                                    )}
                                </div>

                                <p style={{
                                    fontSize: '14px',
                                    fontWeight: 800,
                                    marginBottom: '12px',
                                    color: '#f8fafc',
                                    lineHeight: '1.4'
                                }}>
                                    {pin.nama}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {pin.pj && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <span style={{ fontSize: '12px' }}>👤</span>
                                            <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0, fontWeight: 500 }}>
                                                {pin.pj} {pin.noTelp ? `(${pin.noTelp})` : ''}
                                            </p>
                                        </div>
                                    )}

                                    {pin.jenisPelatihan && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <span style={{ fontSize: '12px' }}>🎯</span>
                                            <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0, fontWeight: 500 }}>
                                                {pin.jenisPelatihan}
                                            </p>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <span style={{ fontSize: '12px' }}>📍</span>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                                            {pin.alamat ? `${pin.alamat}, ` : ''}{pin.kota}, {pin.provinsi}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                )
            })}
        </>
    );
}

export default function P2MKPLeafletMap({ pins }: { pins: P2MKPPin[] }) {
    const getColor = (klasifikasi: string) => {
        const k = (klasifikasi || '').toLowerCase();
        if (k.includes('utama')) return STATUS_COLOR['Utama'];
        if (k.includes('madya')) return STATUS_COLOR['Madya'];
        if (k.includes('muda')) return STATUS_COLOR['Muda'];
        if (k.includes('pemula')) return STATUS_COLOR['Pemula'];
        return STATUS_COLOR['Belum Klasifikasi'];
    };

    return (
        <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', background: '#020617' }}
            className="rounded-[2rem] z-0"
        >
            <MapContent pins={pins} getColor={getColor} />
        </MapContainer>
    );
}
