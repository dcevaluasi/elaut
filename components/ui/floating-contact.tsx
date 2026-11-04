"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { IoChatbubbleEllipses, IoClose, IoDocumentText, IoLogoInstagram, IoLogoWhatsapp, IoMail, IoMegaphone, IoArrowForward } from "react-icons/io5";

const HIDE_PATHS = ["/auth", "/lemdiklat", "/pusat"];

const CONTACT = {
  phone: "0811-8808-8767",
  email: "layanan.puslatkp@kkp.go.id",
  instagram: "@bppsdm_puslatkp",
};

const ITEMS = [
  { label: "WhatsApp Call Center", value: CONTACT.phone, href: "https://wa.me/6281188088767", icon: IoLogoWhatsapp, accent: "#10B981", external: true },
  { label: "Portal Pengaduan", value: "Rumah Aspirasi Digital", href: "https://rumah-aspirasi-digital-smoky.vercel.app/", icon: IoMegaphone, accent: "#F59E0B", external: true },
  { label: "Standar Pelayanan", value: "Dokumen pelayanan (PDF)", href: "/files/Standar Pelayanan P2MKP.pdf", icon: IoDocumentText, accent: "#3B82F6", external: true },
  { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}`, icon: IoMail, accent: "#06B6D4", external: false },
  { label: "Instagram", value: CONTACT.instagram, href: `https://www.instagram.com/${CONTACT.instagram.replace("@", "")}`, icon: IoLogoInstagram, accent: "#EC4899", external: true },
];

/** Tombol bantuan mengambang — gaya navy glass, tanpa framer-motion. */
const FloatingContact = () => {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Esc & klik di luar → tutup
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => rootRef.current && !rootRef.current.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  if (HIDE_PATHS.some((p) => pathname.includes(p))) return null;

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[999999] flex flex-col items-end gap-3 font-jakarta text-white">
      {open && (
        <div
          id="floating-contact-panel"
          role="dialog"
          aria-label="Layanan dan bantuan"
          className="relative isolate w-[calc(100vw-2.5rem)] max-w-[360px] max-h-[calc(100dvh-8rem)] overflow-y-auto overflow-x-hidden rounded-3xl bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.6)] animate-in fade-in-0 slide-in-from-bottom-2 zoom-in-95 duration-200"
        >
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_50%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(60%_50%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-70" />
          <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
          <IoChatbubbleEllipses aria-hidden className="pointer-events-none absolute -right-6 -top-6 -z-10 w-32 h-32 rotate-12 text-sky-300 opacity-10" />

          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Pusat Pelatihan KP</p>
              <h3 className="mt-0.5 text-lg font-black tracking-tight">Layanan & Bantuan</h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-blue-100/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Siap membantu Anda
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20">
              <IoClose className="w-4 h-4" />
            </button>
          </div>

          {/* Daftar layanan */}
          <ul className="px-3 pb-3 space-y-1.5">
            {ITEMS.map((it) => (
              <li key={it.label}>
                <a
                  href={it.href}
                  {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group relative isolate overflow-hidden flex items-center gap-3 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-3 py-2.5 transition-all hover:bg-white/[0.12] hover:ring-white/25"
                >
                  <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `linear-gradient(to left, ${it.accent}40 0%, transparent 75%)` }} />
                  <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl text-white shadow-md" style={{ background: it.accent, boxShadow: `0 6px 16px -6px ${it.accent}` }}>
                    <it.icon className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100/60">{it.label}</span>
                    <span className="block text-sm font-bold truncate">{it.value}</span>
                  </span>
                  <IoArrowForward className="w-4 h-4 shrink-0 text-blue-100/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                </a>
              </li>
            ))}
          </ul>

          <p className="border-t border-white/10 px-5 py-3 text-center text-[10px] text-blue-100/50 leading-relaxed">
            Pusat Pelatihan Kelautan dan Perikanan · Kementerian Kelautan dan Perikanan RI
          </p>
        </div>
      )}

      {/* Tombol utama */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="floating-contact-panel"
        aria-label={open ? "Tutup layanan bantuan" : "Buka layanan bantuan"}
        className={`relative isolate overflow-hidden grid place-items-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ring-1 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${open ? "bg-white text-[#0B1B3F] ring-white shadow-xl" : "bg-[#0B1B3F] text-white ring-white/15 shadow-[0_16px_40px_-12px_rgba(37,99,235,0.8)]"}`}
      >
        {!open && <span aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#2563EB_0%,transparent_70%),radial-gradient(80%_80%_at_100%_100%,#0EA5E9_0%,transparent_70%)]" />}
        <span className={`transition-transform duration-300 ${open ? "rotate-90" : ""}`}>{open ? <IoClose className="w-7 h-7" /> : <IoChatbubbleEllipses className="w-7 h-7" />}</span>
        {!open && (
          <span aria-hidden className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping motion-reduce:animate-none" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0B1B3F]" />
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingContact;
