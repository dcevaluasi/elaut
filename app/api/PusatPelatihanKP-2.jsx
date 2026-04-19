"use client";
import { useState, useEffect, useRef } from "react";

/* ── Full IKU data with rich descriptions ─────────────────────────── */
const UNITS = [
  {
    id: 1,
    icon: "🏛️",
    name: "Subbag Tata Usaha",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.25)",
    iku: [
      { full: "Persentase layanan dukungan manajemen internal Pusat Pelatihan KP (%)", value: "100%" },
      { full: "Indeks Profesionalitas ASN Pusat Pelatihan KP (indeks)", value: "83%" },
      { full: "Persentase Rekomendasi Hasil Pengawasan yang Dimanfaatkan untuk Perbaikan Kinerja Pusat Pelatihan KP (%)", value: "86%" },
      { full: "Persentase rencana umum pengadaan PBJ yang diumumkan pada SIRUP Pusat Pelatihan KP (%)", value: "80%" },
      { full: "Nilai Pengawasan Kearsipan Internal Pusat Pelatihan KP (Nilai)", value: "81%" },
      { full: "Unit Kerja lingkup Pusat Pelatihan KP yang dibangun untuk diusulkan menuju Wilayah Bebas dari Korupsi (WBK) (Satker)", value: "1 Satker" },
    ],
  },
  {
    id: 2,
    icon: "🤝",
    name: "Tim Kerja Serapan Lulusan DUDIKA dan PNBP",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.25)",
    iku: [
      { full: "Serapan Lulusan Pelatihan (DUDIKA): Target keterserapan lulusan di Dunia Usaha, Dunia Industri, dan Dunia Kerja", value: "76%" },
      { full: "Realisasi PNBP: Target realisasi Penerimaan Negara Bukan Pajak (PNBP) di lingkup Pusat Pelatihan KP", value: "80%" },
      { full: "Penilaian SAKIP: Skor Penilaian Mandiri SAKIP Pusat Pelatihan KP", value: "81" },
    ],
  },
  {
    id: 3,
    icon: "🌊",
    name: "Tim Kerja Pelatihan Masyarakat",
    color: "#34d399",
    glow: "rgba(52,211,153,0.25)",
    iku: [
      { full: "Persentase Peserta yang Menerapkan Kompetensi Hasil Pelatihan", value: "75%" },
      { full: "Perangkat Pelatihan KP yang Ditetapkan", value: "5 modul" },
      { full: "Persentase Perangkat Pelatihan yang Diterapkan dalam Penyelenggaraan", value: "75%" },
    ],
  },
  {
    id: 4,
    icon: "⚓",
    name: "Tim Kerja Pelatihan Aparatur",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.25)",
    iku: [
      { full: "Persentase Perangkat Pelatihan Kelautan dan Perikanan yang diterapkan dalam Penyelenggaraan Pelatihan (%)", value: "75%" },
      { full: "Perangkat Pelatihan Kelautan dan Perikanan yang ditetapkan (paket modul)", value: "2 Paket" },
      { full: "Persentase aparatur KKP yang menerapkan kompetensi hasil pelatihan (%)", value: "75%" },
      { full: "Persentase Tenaga Pelatihan yang Mengikuti Pengembangan Kompetensi Sesuai Standar Pelatih (%)", value: "20%" },
    ],
  },
  {
    id: 5,
    icon: "📋",
    name: "Tim Kerja Penjaminan Mutu dan Tata Kelola Pelatihan",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.25)",
    iku: [
      { full: "Peraturan Pelatihan KP: Target penyusunan dokumen usulan peraturan", value: "5 dokumen" },
      { full: "Sertifikasi Kelembagaan: Target perolehan sertifikat kesesuaian standar lembaga pelatihan", value: "7 sertifikat" },
      { full: "Pengesahan Program Diklat: Target usulan program diklat masyarakat bidang Kelautan dan Perikanan disahkan sesuai peraturan", value: "75%" },
      { full: "Sarana Prasarana (Sarpras): Target peningkatan kapasitas pada sarana prasarana pelatihan KP", value: "3 Sarpras" },
    ],
  },
  {
    id: 6,
    icon: "🌐",
    name: "Tim Kerja Kemitraan",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.25)",
    iku: [
      { full: "Layanan Gerai Awak Kapal Perikanan Indonesia di Luar Negeri", value: "2 laporan" },
      { full: "Persentase pelaksanaan Kerja sama lingkup Pusat Pelatihan KP yang telah disepakati", value: "50%" },
    ],
  },
];

/* ── Ocean SVG Scene ─────────────────────── */
function OceanScene() {
  return (
    <svg viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020a16"/>
          <stop offset="70%" stopColor="#051e38"/>
          <stop offset="100%" stopColor="#072a4a"/>
        </linearGradient>
        <radialGradient id="gSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85"/>
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c4a6e"/>
          <stop offset="50%" stopColor="#063555"/>
          <stop offset="100%" stopColor="#020e1e"/>
        </linearGradient>
        <linearGradient id="gCoral1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c"/>
          <stop offset="100%" stopColor="#c2410c"/>
        </linearGradient>
        <linearGradient id="gCoral2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e879f9"/>
          <stop offset="100%" stopColor="#9333ea"/>
        </linearGradient>
        <linearGradient id="gShip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a"/>
          <stop offset="100%" stopColor="#1e3060"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="900" height="520" fill="url(#gSky)"/>
      {[[60,18],[130,42],[210,12],[330,30],[450,8],[560,25],[660,15],[780,38],[840,9],[890,52],[40,58],[170,68],[290,50],[420,62],[580,45],[720,28]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%3===0?1.8:1.1} fill="#fff" opacity={0.4+Math.cos(i)*0.35}/>
      ))}
      <ellipse cx="548" cy="237" rx="200" ry="90" fill="url(#gSun)" opacity="0.7"/>
      <circle cx="548" cy="230" r="30" fill="#fde68a" opacity="0.95" filter="url(#glow)"/>
      <circle cx="548" cy="230" r="22" fill="#fbbf24"/>
      {Array.from({length:12},(_,i)=>i).map(i=>{
        const a=i*30*Math.PI/180;
        return <line key={i} x1={548+36*Math.cos(a)} y1={230+36*Math.sin(a)} x2={548+56*Math.cos(a)} y2={230+56*Math.sin(a)} stroke="#fde68a" strokeWidth="2.5" opacity="0.45"/>;
      })}
      <path d="M0 195 Q90 155 185 188 Q270 168 380 182 Q460 150 558 182 Q650 162 755 178 Q825 168 900 172 L900 242 L0 242Z" fill="#030f1e" opacity="0.9"/>
      <path d="M0 210 Q75 192 155 202 Q235 182 340 198 Q418 188 502 202 Q605 190 705 205 Q800 193 900 208 L900 242 L0 242Z" fill="#020b17" opacity="0.65"/>
      {/* Lighthouse */}
      <ellipse cx="802" cy="229" rx="52" ry="15" fill="#0f1f35"/>
      <path d="M762 228 Q782 205 802 200 Q822 205 842 228Z" fill="#1e3a5f"/>
      <rect x="791" y="128" width="22" height="84" rx="3" fill="#dde4ec"/>
      <rect x="791" y="143" width="22" height="10" fill="#dc2626" opacity="0.65"/>
      <rect x="791" y="163" width="22" height="10" fill="#dc2626" opacity="0.65"/>
      <rect x="791" y="183" width="22" height="10" fill="#dc2626" opacity="0.65"/>
      <rect x="786" y="116" width="30" height="16" rx="4" fill="#0c2a4a" stroke="#7dd3fc" strokeWidth="1.5"/>
      <circle cx="802" cy="124" r="9" fill="#fde68a" opacity="0.95" filter="url(#glow)"/>
      <circle cx="802" cy="124" r="16" fill="#fde68a" opacity="0.2"/>
      {/* Ship */}
      <path d="M62 196 Q105 184 200 181 Q290 179 340 184 Q368 188 372 204 Q366 218 325 222 Q205 226 98 222 Q66 218 60 207Z" fill="url(#gShip)"/>
      <path d="M72 210 Q115 205 200 203 Q290 200 342 205 Q356 207 356 211 Q340 211 200 213 Q100 215 72 213Z" fill="#f1f5f9" opacity="0.85"/>
      <rect x="138" y="162" width="148" height="27" rx="3" fill="#1e3a8a"/>
      <rect x="158" y="145" width="108" height="22" rx="3" fill="#1d4ed8"/>
      <rect x="175" y="132" width="75" height="18" rx="3" fill="#2563eb"/>
      {[182,202,222,238].map((x,i)=><rect key={i} x={x} y="135" width="11" height="8" rx="2" fill="#bae6fd" opacity="0.9"/>)}
      {/* Sea */}
      <path d="M0 235 Q110 226 220 234 Q330 241 440 234 Q550 226 660 234 Q770 241 870 234 Q885 231 900 234 L900 520 L0 520Z" fill="url(#gSea)"/>
      <path d="M0 235 Q110 226 220 234 Q330 241 440 234 Q550 226 660 234 Q770 241 870 234 Q885 231 900 234" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5"/>
      {/* Sea bed */}
      <path d="M0 462 Q150 442 300 455 Q460 465 610 448 Q760 440 900 455 L900 520 L0 520Z" fill="#030c14"/>
      {/* Coral */}
      <path d="M32 462 Q37 422 42 402 Q47 390 52 400 Q57 385 62 394 Q67 378 72 388 Q77 392 79 462Z" fill="url(#gCoral1)" opacity="0.9"/>
      <circle cx="46" cy="367" r="8" fill="#f97316"/>
      <circle cx="60" cy="362" r="7" fill="#fb923c"/>
      <path d="M442 472 Q444 442 442 418" stroke="#0ea5e9" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M442 442 Q426 422 422 407" stroke="#0ea5e9" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M442 442 Q458 420 460 406" stroke="#38bdf8" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="422" cy="407" r="9" fill="#0ea5e9"/>
      <circle cx="460" cy="406" r="8" fill="#38bdf8"/>
      {/* Turtle */}
      <ellipse cx="222" cy="372" rx="54" ry="40" fill="#3d6b2a"/>
      <ellipse cx="222" cy="370" rx="44" ry="31" fill="#4a7a30"/>
      <ellipse cx="274" cy="363" rx="19" ry="15" fill="#4a7a30"/>
      <circle cx="282" cy="357" r="4.5" fill="#1a2e0a"/>
      <path d="M184 344 Q163 328 152 318 Q164 315 180 324 Q184 334 184 344Z" fill="#4a7a30"/>
      <path d="M184 394 Q162 408 155 418 Q167 422 183 410 Q184 401 184 394Z" fill="#4a7a30"/>
      {/* Clownfish */}
      <ellipse cx="362" cy="312" rx="23" ry="15" fill="#f97316"/>
      <line x1="349" y1="299" x2="349" y2="325" stroke="#fff" strokeWidth="4.5"/>
      <line x1="364" y1="298" x2="364" y2="326" stroke="#fff" strokeWidth="3.5"/>
      <path d="M385 312 Q396 305 399 312 Q396 319 385 312Z" fill="#f97316"/>
      <circle cx="344" cy="309" r="4.5" fill="#1a0a00"/>
      {/* Blue tang */}
      <ellipse cx="502" cy="347" rx="26" ry="17" fill="#1d4ed8"/>
      <path d="M528 347 Q542 338 545 347 Q542 356 528 347Z" fill="#1d4ed8"/>
      <circle cx="484" cy="343" r="4.5" fill="#050a20"/>
      {/* Bubbles */}
      {[[282,282],[298,262],[394,292],[554,277],[735,263],[168,297]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%2===0?4:2.5} fill="none" stroke="#7dd3fc" strokeWidth="1" opacity="0.25"/>
      ))}
      {/* Seagulls */}
      {[[178,94],[194,87],[402,74],[682,68],[698,77]].map(([x,y],i)=>(
        <path key={i} d={`M${x-8} ${y} Q${x} ${y-7} ${x+8} ${y}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.55"/>
      ))}
    </svg>
  );
}

/* ── Landing Page ─────────────────────────── */
function LandingPage({ onInformation }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const stats = [
    { label: "Unit Kerja", value: "6" },
    { label: "Total IKU", value: "21" },
    { label: "Target Rata-rata", value: "77%" },
    { label: "Modul Pelatihan", value: "7" },
    { label: "Sertifikat", value: "7" },
    { label: "Program", value: "7" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020d1a",
      color: "#e0f2fe",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes wave { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pulse-slow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rotate-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .stat-card:hover { transform: translateY(-4px) scale(1.04) !important; }
        .nav-btn:hover { background: rgba(56,189,248,0.15) !important; border-color: rgba(56,189,248,0.5) !important; }
        .unit-pill:hover { background: rgba(255,255,255,0.1) !important; transform: translateY(-2px) !important; }
      `}</style>

      {/* Ocean scene bg */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <OceanScene />
      </div>

      {/* Layered gradient overlays */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(2,13,26,0.3) 0%, rgba(2,13,26,0.05) 30%, rgba(2,13,26,0.6) 70%, rgba(2,13,26,0.98) 100%)"
      }}/>
      {/* Side vignettes */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 100% at 50% 50%, transparent 40%, rgba(2,13,26,0.5) 100%)"
      }}/>

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── Navbar ── */}
        <nav style={{
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(2,10,22,0.5)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(56,189,248,0.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: "linear-gradient(135deg,#0284c7,#0369a1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, boxShadow: "0 4px 16px rgba(2,132,199,0.4)"
            }}>🐬</div>
            <div>
              <div style={{ fontSize: 11, color: "#7dd3fc", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Segoe UI',sans-serif" }}>KKP</div>
              <div style={{ fontSize: 10.5, color: "rgba(186,230,253,0.55)", fontFamily: "'Segoe UI',sans-serif", letterSpacing: "0.04em" }}>Kementerian Kelautan & Perikanan</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 11, color: "#7dd3fc", fontFamily: "'Segoe UI',sans-serif",
              background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
              borderRadius: 99, padding: "4px 14px", letterSpacing: "0.06em"
            }}>Tahun 2026</span>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{
          flex: 1,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center",
          padding: "56px 24px 40px",
          textAlign: "center",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(32px)",
          transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)",
        }}>

          {/* Subtitle pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(56,189,248,0.1)",
            border: "1px solid rgba(56,189,248,0.28)",
            borderRadius: 99, padding: "6px 20px", marginBottom: 24,
            animation: mounted ? "fadeUp 0.6s ease forwards" : "none",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", animation: "pulse-slow 2s infinite", display: "inline-block" }}/>
            <span style={{
              fontSize: 11, color: "#7dd3fc", letterSpacing: "0.14em",
              fontWeight: 600, textTransform: "uppercase", fontFamily: "'Segoe UI',sans-serif"
            }}>Pusat Pelatihan Kelautan & Perikanan</span>
          </div>

          {/* Main title */}
          <h1 style={{
            margin: "0 0 6px",
            fontSize: "clamp(58px, 11vw, 108px)",
            fontWeight: 900,
            letterSpacing: "-4px",
            lineHeight: 0.9,
            background: "linear-gradient(160deg,#ffffff 15%,#bae6fd 48%,#38bdf8 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}>
            HIGHLIGHT
          </h1>

          <h2 style={{
            margin: "14px 0 2px",
            fontSize: "clamp(16px, 2.8vw, 22px)",
            fontWeight: 400,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.02em",
            fontFamily: "'Segoe UI', sans-serif",
          }}>
            Pusat Pelatihan KP
          </h2>
          <p style={{
            margin: "0 0 32px",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 900,
            color: "#38bdf8",
            letterSpacing: "-1.5px",
            fontFamily: "'Georgia', serif",
          }}>
            Tahun 2026
          </p>

          {/* Decorative divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, width: "100%", maxWidth: 360 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.45))" }}/>
            <span style={{ fontSize: 18, animation: "float 3s ease-in-out infinite" }}>🌊</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(56,189,248,0.45),transparent)" }}/>
          </div>

          <p style={{
            maxWidth: 460, margin: "0 0 40px",
            fontSize: 14, color: "rgba(186,230,253,0.65)",
            lineHeight: 1.9, fontFamily: "'Segoe UI',sans-serif"
          }}>
            Portal informasi kinerja, capaian program, dan indikator kinerja utama Pusat Pelatihan Kelautan dan Perikanan.
          </p>

          {/* CTA Button */}
          <div style={{ marginBottom: 52 }}>
            <button
              onClick={onInformation}
              className="nav-btn"
              style={{
                background: "linear-gradient(135deg, rgba(2,132,199,0.9), rgba(3,105,161,0.9))",
                border: "1px solid rgba(56,189,248,0.4)",
                color: "#fff",
                borderRadius: 16,
                padding: "16px 44px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Segoe UI', sans-serif",
                letterSpacing: "0.04em",
                boxShadow: "0 10px 40px rgba(2,132,199,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
                display: "inline-flex", alignItems: "center", gap: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>📄</span>
              Lihat Informasi IKU
            </button>
          </div>

          {/* Stats grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            maxWidth: 520,
            width: "100%",
          }}>
            {stats.map((s, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: "14px 12px",
                  backdropFilter: "blur(20px)",
                  textAlign: "center",
                  transition: "all 0.25s ease",
                  animationDelay: `${i * 0.08}s`,
                  cursor: "default",
                }}
              >
                <div style={{
                  fontSize: "clamp(20px, 4vw, 26px)",
                  fontWeight: 900,
                  color: "#38bdf8",
                  fontFamily: "'Georgia',serif",
                  lineHeight: 1,
                  marginBottom: 4,
                }}>{s.value}</div>
                <div style={{
                  fontSize: 9.5,
                  color: "rgba(186,230,253,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily: "'Segoe UI',sans-serif"
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom unit strip ── */}
        <div style={{
          padding: "18px 32px",
          borderTop: "1px solid rgba(56,189,248,0.08)",
          background: "rgba(2,13,26,0.7)",
          backdropFilter: "blur(16px)",
          display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap",
        }}>
          {UNITS.map((u) => (
            <div
              key={u.id}
              className="unit-pill"
              onClick={onInformation}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 99, padding: "6px 14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: 14 }}>{u.icon}</span>
              <span style={{ fontSize: 10.5, color: "rgba(186,230,253,0.55)", fontFamily: "'Segoe UI',sans-serif", letterSpacing: "0.03em" }}>{u.name.replace("Tim Kerja ","")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Information Page ─────────────────────── */
function InformationPage({ onBack }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020d1a",
      color: "#e0f2fe",
      fontFamily: "'Segoe UI', sans-serif",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
        .info-card { transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease; }
        .info-card:hover { transform: translateY(-2px) !important; }
        .back-btn:hover { background: rgba(56,189,248,0.15) !important; }
        .iku-row:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -160, left: -160, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(3,105,161,0.22) 0%,transparent 70%)" }}/>
        <div style={{ position: "absolute", top: "40%", right: -120, width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.1) 0%,transparent 70%)" }}/>
        <div style={{ position: "absolute", bottom: -100, left: "30%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(52,211,153,0.08) 0%,transparent 70%)" }}/>
      </div>

      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(2,10,20,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(56,189,248,0.12)",
        padding: "14px 28px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <button
          className="back-btn"
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#7dd3fc",
            borderRadius: 10,
            padding: "7px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "'Segoe UI',sans-serif",
            display: "flex", alignItems: "center", gap: 6,
            transition: "background 0.2s",
          }}
        >
          ← Kembali
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Georgia',serif", letterSpacing: "-0.3px" }}>Informasi IKU</div>
          <div style={{ fontSize: 12, color: "#7dd3fc", letterSpacing: "0.04em" }}>Pusat Pelatihan KP — Tahun 2026</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            fontSize: 11, color: "#38bdf8",
            background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: 99, padding: "3px 12px", letterSpacing: "0.06em"
          }}>6 Unit · 21 IKU</span>
        </div>
      </div>

      {/* Page intro */}
      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 860, margin: "0 auto",
        padding: "40px 24px 16px",
        opacity: mounted ? 1 : 0,
        animation: mounted ? "fadeSlideUp 0.7s ease forwards" : "none",
      }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(2,132,199,0.12), rgba(3,105,161,0.06))",
          border: "1px solid rgba(56,189,248,0.2)",
          borderRadius: 20,
          padding: "24px 28px",
          marginBottom: 36,
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{ fontSize: 44, lineHeight: 1 }}>🎯</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4, fontFamily: "'Georgia',serif" }}>
              Indikator Kinerja Utama (IKU)
            </div>
            <div style={{ fontSize: 13, color: "rgba(186,230,253,0.7)", lineHeight: 1.7 }}>
              Rekapitulasi target kinerja seluruh unit kerja lingkup Pusat Pelatihan Kelautan dan Perikanan Tahun 2026.
            </div>
          </div>
        </div>
      </div>

      {/* Units */}
      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 860, margin: "0 auto",
        padding: "0 24px 80px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {UNITS.map((unit, uIdx) => (
          <div
            key={unit.id}
            className="info-card"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 20,
              backdropFilter: "blur(24px)",
              overflow: "hidden",
              opacity: mounted ? 1 : 0,
              animation: mounted ? `fadeSlideUp 0.6s ease ${uIdx * 0.08}s forwards` : "none",
              boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
            }}
          >
            {/* Unit header */}
            <div style={{
              padding: "20px 24px 18px",
              borderBottom: `1px solid rgba(255,255,255,0.06)`,
              background: `linear-gradient(135deg, rgba(255,255,255,0.03), transparent)`,
              display: "flex", alignItems: "flex-start", gap: 16,
            }}>
              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg, ${unit.color}22, ${unit.color}0a)`,
                border: `1.5px solid ${unit.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24,
                boxShadow: `0 4px 16px ${unit.glow}`,
              }}>
                {unit.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 11, color: unit.color,
                  fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase", marginBottom: 4,
                }}>Unit {unit.id}</div>
                <div style={{
                  fontSize: 17, fontWeight: 700,
                  color: "#fff",
                  fontFamily: "'Georgia',serif",
                  lineHeight: 1.3,
                }}>{unit.name}</div>
              </div>

              <div style={{
                flexShrink: 0,
                background: `${unit.color}18`,
                border: `1px solid ${unit.color}33`,
                borderRadius: 99,
                padding: "4px 12px",
                fontSize: 12,
                color: unit.color,
                fontWeight: 600,
              }}>
                {unit.iku.length} IKU
              </div>
            </div>

            {/* IKU label */}
            <div style={{
              padding: "14px 24px 6px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 3, height: 14, borderRadius: 2,
                background: `linear-gradient(180deg, ${unit.color}, ${unit.color}44)`,
                flexShrink: 0,
              }}/>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: "rgba(186,230,253,0.5)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>IKU :</span>
            </div>

            {/* IKU list — plain numbered, no progress bar */}
            <div style={{ padding: "4px 24px 20px" }}>
              {unit.iku.map((item, i) => (
                <div
                  key={i}
                  className="iku-row"
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "11px 12px",
                    borderRadius: 12,
                    transition: "background 0.18s",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Number badge */}
                  <div style={{
                    flexShrink: 0,
                    width: 26, height: 26,
                    borderRadius: 8,
                    background: `${unit.color}18`,
                    border: `1px solid ${unit.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    color: unit.color,
                    marginTop: 1,
                  }}>
                    {i + 1}
                  </div>

                  {/* Label text */}
                  <div style={{ flex: 1, fontSize: 13.5, color: "rgba(186,230,253,0.88)", lineHeight: 1.65 }}>
                    {item.full}
                  </div>

                  {/* Value badge */}
                  <div style={{
                    flexShrink: 0,
                    background: `${unit.color}15`,
                    border: `1px solid ${unit.color}35`,
                    borderRadius: 8,
                    padding: "3px 11px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: unit.color,
                    whiteSpace: "nowrap",
                    alignSelf: "flex-start",
                    marginTop: 2,
                    fontFamily: "'Georgia',serif",
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer note */}
        <div style={{
          textAlign: "center", padding: "8px 0 0",
          fontSize: 12, color: "rgba(125,211,252,0.3)",
          letterSpacing: "0.05em",
        }}>
          Pusat Pelatihan Kelautan dan Perikanan · KKP · Tahun 2026
        </div>
      </div>
    </div>
  );
}

/* ── Root ─────────────────────────────────── */
export default function PusatPelatihanKP() {
  const [page, setPage] = useState("landing");
  if (page === "information") return <InformationPage onBack={() => setPage("landing")} />;
  return <LandingPage onInformation={() => setPage("information")} />;
}
