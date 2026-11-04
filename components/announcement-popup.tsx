"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, FileText, Megaphone, X } from "lucide-react";
import { IoLogoInstagram, IoLogoWhatsapp } from "react-icons/io5";


const KEY_HIDE_UNTIL = "elaut:announce-hide-until";
const KEY_SESSION = "elaut:announce-seen";
const HIDE_DAYS = 30;
const DELAY_MS = 3000;

const ITEMS = [
  { href: "/files/Standar Pelayanan P2MKP.pdf", label: "Standar Pelayanan", sub: "Dokumen resmi (PDF)", icon: FileText, accent: "#3B82F6" },
  { href: "https://rumah-aspirasi-digital-smoky.vercel.app/", label: "Rumah Aspirasi Digital", sub: "Saran, masukan & pengaduan", icon: Megaphone, accent: "#F59E0B" },
  { href: "https://wa.me/6281188088767", label: "Call Center WhatsApp", sub: "0811-8808-8767", icon: IoLogoWhatsapp, accent: "#10B981" },
  { href: "https://www.instagram.com/bppsdm_puslatkp", label: "Instagram resmi", sub: "@bppsdm_puslatkp", icon: IoLogoInstagram, accent: "#EC4899" },
];

const safe = <T,>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export default function AnnouncementPopup() {
  const [show, setShow] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const hideUntil = Number(safe(() => localStorage.getItem(KEY_HIDE_UNTIL), null) || 0);
    const seen = safe(() => sessionStorage.getItem(KEY_SESSION), null);
    if (hideUntil > Date.now() || seen) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setShow(true);
      safe(() => sessionStorage.setItem(KEY_SESSION, "1"), undefined);
      window.removeEventListener("scroll", reveal);
    };
    const t = setTimeout(reveal, DELAY_MS);
    window.addEventListener("scroll", reveal, { passive: true, once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", reveal);
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, dontShow]);

  const close = () => {
    if (dontShow) safe(() => localStorage.setItem(KEY_HIDE_UNTIL, String(Date.now() + HIDE_DAYS * 864e5)), undefined);
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      role="complementary"
      aria-label="Informasi layanan publik Pusat Pelatihan KP"
      className="fixed bottom-5 left-5 z-[99998] w-[calc(100vw-7.5rem)] max-w-[340px] font-jakarta text-white animate-in fade-in-0 slide-in-from-bottom-3 duration-300"
    >
      <div className="relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.6)]">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_50%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(60%_50%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-70" />
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />

        {/* Header */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/15 p-1.5">
            <Image src="/logo-kkp.png" alt="" width={28} height={28} className="object-contain" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80">Layanan publik</p>
            <p className="text-sm font-black leading-snug">Pusat Pelatihan Kelautan dan Perikanan</p>
          </div>
          <button type="button" onClick={close} aria-label="Tutup informasi" className="h-8 w-8 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 grid place-items-center hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Daftar layanan */}
        <ul className="px-2.5 pb-2.5 space-y-1">
          {ITEMS.map((it) => (
            <li key={it.href}>
              <a
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative isolate overflow-hidden flex items-center gap-2.5 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-2.5 py-2 transition-all hover:bg-white/[0.12] hover:ring-white/25"
              >
                <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(to left, ${it.accent}40 0%, transparent 75%)` }} />
                <span className="grid place-items-center w-8 h-8 shrink-0 rounded-lg text-white" style={{ background: it.accent }}>
                  <it.icon className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold leading-snug truncate">{it.label}</span>
                  <span className="block text-[10px] text-blue-100/60 truncate">{it.sub}</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-blue-100/40 group-hover:text-white" />
              </a>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-2.5">
          <label className="inline-flex items-center gap-1.5 text-[11px] text-blue-100/70 cursor-pointer select-none">
            <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} className="accent-sky-400 w-3.5 h-3.5" />
            Jangan tampilkan lagi
          </label>
          <button type="button" onClick={close} className="h-8 px-3 rounded-lg bg-white text-[#0B1B3F] text-[11px] font-bold hover:bg-sky-100">
            Mengerti
          </button>
        </div>
      </div>
    </aside>
  );
}
