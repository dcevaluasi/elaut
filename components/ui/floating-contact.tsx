"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IoCall, IoMail, IoClose, IoChatbubbleEllipses, IoLogoInstagram } from "react-icons/io5";

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
            className="bg-[#0f172a]/90 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-7 w-[340px] flex flex-col gap-5 mb-2 overflow-hidden relative"
          >
            {/* Animated background glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-600/30 blur-[60px] pointer-events-none"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-pink-500/10 blur-[60px] pointer-events-none"
            />

            <div className="flex justify-between items-start relative z-10">
              <div>
                <h3 className="font-bold text-white text-2xl tracking-tight leading-none mb-2">Hubungi Kami</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Layanan Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white border border-white/10 transition-all group"
              >
                <IoClose size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              {/* Phone */}
              <a
                href={`tel:${contactInfo.phone.replace(/-/g, "")}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-xl shadow-blue-900/20 group-hover:scale-110 transition-transform duration-500">
                  <IoCall size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-blue-400 font-black mb-0.5">Telepon</span>
                  <span className="text-white font-bold text-base tracking-tight group-hover:text-blue-300 transition-colors">{contactInfo.phone}</span>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${contactInfo.email}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white shadow-xl shadow-cyan-900/20 group-hover:scale-110 transition-transform duration-500">
                  <IoMail size={22} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-black mb-0.5">Email</span>
                  <span className="text-white font-bold text-sm tracking-tight truncate group-hover:text-cyan-300 transition-colors">{contactInfo.email}</span>
                </div>
              </a>

              {/* Instagram */}
              <a
                href={`https://www.instagram.com/${contactInfo.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-xl shadow-purple-900/20 group-hover:scale-110 transition-transform duration-500">
                  <IoLogoInstagram size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-pink-400 font-black mb-0.5">Instagram</span>
                  <span className="text-white font-bold text-base tracking-tight group-hover:text-pink-300 transition-colors">{contactInfo.instagram}</span>
                </div>
              </a>
            </div>

            <div className="pt-4 border-t border-white/5 text-center relative z-10">
              <p className="text-[9px] text-gray-500 font-medium leading-relaxed">
                Pusat Pelatihan Kelautan dan Perikanan<br />
                <span className="text-gray-600">Kementerian Kelautan dan Perikanan RI</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-2xl transition-all duration-500 z-50 border border-white/10 ${isOpen
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
