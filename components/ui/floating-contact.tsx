"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoCall,
  IoMail,
  IoClose,
  IoChatbubbleEllipses,
  IoLogoInstagram,
  IoLogoWhatsapp,
  IoMegaphone,
  IoDocumentText,
} from "react-icons/io5";

const FloatingContact = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Visibility logic: hide on /auth, /lemdiklat, /pusat
  const hidePaths = ["/auth", "/lemdiklat", "/pusat"];
  const shouldHide = hidePaths.some((path) => pathname.includes(path));

  if (shouldHide) return null;

  const contactInfo = {
    phone: "0811-8808-8767",
    email: "layanan.puslatkp@kkp.go.id",
    instagram: "@bppsdm_puslatkp",
    pengaduanUrl: "https://rumah-aspirasi-digital-smoky.vercel.app/",
    standarPelayananUrl: "/files/Standar Pelayanan P2MKP.pdf",
    whatsappUrl: "https://wa.me/6281188088767",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999999] flex flex-col items-end gap-3 font-jakarta text-white">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="bg-[#0f172a]/95 backdrop-blur-3xl border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-6 w-[350px] sm:w-[370px] flex flex-col gap-4 mb-2 overflow-hidden relative max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            {/* Animated background glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-600/30 blur-[60px] pointer-events-none"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-pink-500/10 blur-[60px] pointer-events-none"
            />

            {/* Header */}
            <div className="flex justify-between items-start relative z-10">
              <div>
                <h3 className="font-bold text-white text-xl tracking-tight leading-none mb-1.5">
                  Layanan & Bantuan
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Pusat Pelatihan KP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white border border-white/10 transition-all group"
              >
                <IoClose size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Service Buttons List */}
            <div className="flex flex-col gap-2.5 relative z-10">
              {/* WhatsApp Call Center */}
              <a
                href={contactInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/40 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <IoLogoWhatsapp size={22} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-black mb-0.5">
                    WhatsApp Call Center
                  </span>
                  <span className="text-white font-bold text-sm tracking-tight group-hover:text-emerald-300 transition-colors">
                    {contactInfo.phone}
                  </span>
                </div>
              </a>

              {/* Pengaduan & Aspirasi */}
              <a
                href={contactInfo.pengaduanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/40 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-900/20 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <IoMegaphone size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-amber-400 font-black mb-0.5">
                    Portal Pengaduan
                  </span>
                  <span className="text-white font-bold text-sm tracking-tight truncate group-hover:text-amber-300 transition-colors">
                    Rumah Aspirasi Digital
                  </span>
                </div>
              </a>

              {/* Standar Pelayanan PDF */}
              <a
                href={contactInfo.standarPelayananUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <IoDocumentText size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-blue-400 font-black mb-0.5">
                    Standar Pelayanan
                  </span>
                  <span className="text-white font-bold text-sm tracking-tight truncate group-hover:text-blue-300 transition-colors">
                    Dokumen Pelayanan (PDF)
                  </span>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${contactInfo.email}`}
                className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/20 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <IoMail size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-black mb-0.5">
                    Email
                  </span>
                  <span className="text-white font-bold text-xs tracking-tight truncate group-hover:text-cyan-300 transition-colors">
                    {contactInfo.email}
                  </span>
                </div>
              </a>

              {/* Instagram */}
              <a
                href={`https://www.instagram.com/${contactInfo.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/40 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-lg shadow-purple-900/20 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <IoLogoInstagram size={22} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-pink-400 font-black mb-0.5">
                    Instagram
                  </span>
                  <span className="text-white font-bold text-sm tracking-tight group-hover:text-pink-300 transition-colors">
                    {contactInfo.instagram}
                  </span>
                </div>
              </a>
            </div>

            <div className="pt-3 border-t border-white/5 text-center relative z-10">
              <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                Pusat Pelatihan Kelautan dan Perikanan
                <br />
                <span className="text-gray-500">Kementerian Kelautan dan Perikanan RI</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-2xl transition-all duration-500 z-50 border border-white/10 ${
          isOpen
            ? "bg-white text-black"
            : "bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white shadow-blue-500/40"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            >
              <IoClose size={32} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              className="relative"
            >
              <IoChatbubbleEllipses size={32} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-4 border-white rounded-full animate-bounce" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default FloatingContact;
