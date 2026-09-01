"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText,
  ExternalLink,
  Download,
  Megaphone,
  PhoneCall,
  X,
  ShieldCheck,
  ChevronRight,
  Info,
  Sparkles,
} from "lucide-react";
import { IoLogoWhatsapp, IoLogoInstagram } from "react-icons/io5";

export default function AnnouncementPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
      else setIsOpen(open);
    }}>
      <DialogContent className="w-[94%] max-w-lg sm:max-w-xl p-0 overflow-hidden rounded-3xl border border-white/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] bg-slate-950/80 backdrop-blur-2xl text-white max-h-[92vh] flex flex-col">
        {/* Header with Glassmorphism & Ambient Glow */}
        <div className="relative bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-indigo-950/80 backdrop-blur-xl border-b border-white/10 p-5 sm:p-6 pb-6 overflow-hidden flex-shrink-0">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* Top Bar Badge & Close Button */}
          <div className="flex items-center justify-between gap-3 mb-3.5 relative z-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-cyan-300 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Layanan Resmi Pusat Pelatihan KP</span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50 hover:scale-105"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <DialogHeader className="text-left space-y-1 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/10">
                <Image
                  src="/logo-kkp.png"
                  alt="Logo KKP"
                  width={36}
                  height={36}
                  className="object-contain drop-shadow"
                />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-snug">
                  Informasi & Layanan Publik
                </DialogTitle>
                <p className="text-xs sm:text-sm text-cyan-200/90 font-medium">
                  Pusat Pelatihan Kelautan dan Perikanan
                </p>
              </div>
            </div>
            <DialogDescription className="sr-only">
              Popup Layanan Publik Pusat Pelatihan KP mencakup Standar Pelayanan, Portal Pengaduan, dan Call Center Resmi.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content Body (Frosted Glass Cards) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1 custom-scrollbar">
          
          {/* Card 1: Standar Pelayanan */}
          <div className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/15 hover:border-cyan-400/50 rounded-2xl p-4 sm:p-4.5 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform border border-white/20">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm sm:text-base text-white leading-snug">
                    Standar Pelayanan Pusat Pelatihan KP
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full flex-shrink-0">
                    PDF
                  </span>
                </div>
                <p className="text-xs text-slate-300/90 mb-3 leading-relaxed">
                  Dokumen pedoman resmi Standar Pelayanan Pusat Pelatihan Kelautan dan Perikanan.
                </p>
                <Link
                  href="/files/Standar Pelayanan P2MKP.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white text-xs font-semibold border border-white/20 shadow-lg shadow-blue-600/25 transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh / Lihat Standar Pelayanan</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Portal Pengaduan */}
          <div className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/15 hover:border-amber-400/50 rounded-2xl p-4 sm:p-4.5 transition-all duration-300 shadow-lg hover:shadow-amber-500/10">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform border border-white/20">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm sm:text-base text-white leading-snug">
                    Portal Pengaduan Pusat Pelatihan KP
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full flex-shrink-0">
                    Aspirasi
                  </span>
                </div>
                <p className="text-xs text-slate-300/90 mb-3 leading-relaxed">
                  Layanan Rumah Aspirasi Digital untuk menyampaikan saran, masukan, dan pengaduan Anda.
                </p>
                <Link
                  href="https://rumah-aspirasi-digital-smoky.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-semibold border border-white/20 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Kunjungi Portal Pengaduan</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Call Center WhatsApp & Instagram */}
          <div className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/15 hover:border-emerald-400/50 rounded-2xl p-4 sm:p-4.5 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform border border-white/20">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm sm:text-base text-white leading-snug">
                    Call Center & Media Sosial Official
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex-shrink-0">
                    Kontak
                  </span>
                </div>
                <p className="text-xs text-slate-300/90 mb-3 leading-relaxed">
                  Hubungi Call Center resmi via WhatsApp atau ikuti update berita pelatihan di Instagram.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* WhatsApp Button */}
                  <Link
                    href="https://wa.me/6281188088767"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold border border-white/20 shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <IoLogoWhatsapp className="w-4 h-4 text-emerald-200" />
                    <span>081188088767</span>
                  </Link>

                  {/* Instagram Button */}
                  <Link
                    href="https://www.instagram.com/bppsdm_puslatkp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-90 text-white text-xs font-semibold border border-white/20 shadow-lg shadow-pink-600/20 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <IoLogoInstagram className="w-4 h-4 text-pink-200" />
                    <span>@bppsdm_puslatkp</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 sm:py-4 bg-white/5 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="hidden sm:inline">Dapat diakses kembali melalui menu bantuan.</span>
            <span className="sm:hidden">Klik untuk melihat detail.</span>
          </div>
          <button
            onClick={handleClose}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-xs font-semibold rounded-xl transition-all shadow-md hover:scale-[1.02] flex items-center gap-1.5 ml-auto"
          >
            <span>Tutup Modal</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-300" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
