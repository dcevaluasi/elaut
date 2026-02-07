"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBriefcase,
  FiAward,
  FiUser,
} from "react-icons/fi";
import { ManningAgent } from "@/types/product";
import ManningAgentTrainingService from "./manning-agent-training-service";

export default function ManningAgentService({
  manningAgent,
}: {
  manningAgent: ManningAgent | null;
}) {
  const [indexMenuSelected, setIndexMenuSelected] = useState(0);

  const tabMenus = [
    {
      id: 1,
      name: "Manajemen Pelatihan",
      description: "Kelola pendaftaran & progres pelatihan awak kapal.",
      icon: <FiBriefcase className="text-3xl" />,
    },
    {
      id: 2,
      name: "Uji Kompetensi",
      description: "Sertifikasi & validasi keahlian kru manning agent.",
      icon: <FiAward className="text-3xl" />,
    },
    {
      id: 3,
      name: "Informasi Profil",
      description: "Data legalitas & pengaturan manning agent.",
      icon: <FiUser className="text-3xl" />,
    },
  ];

  return (
    <div className="w-full flex flex-col space-y-12">
      {/* Premium Tab Navigation for Manning Agent */}
      <div className="w-full" id="explore">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {tabMenus.map((tabMenu, index) => {
            const isActive = indexMenuSelected === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative cursor-pointer group"
                onClick={() => setIndexMenuSelected(index)}
              >
                {/* Active/Hover Glow Backdrop */}
                <div className={`absolute -inset-0.5 rounded-3xl blur transition-all duration-500 opacity-0 
                  ${isActive ? 'bg-indigo-500/30 opacity-100' : 'group-hover:opacity-20 bg-indigo-400/20'}`}
                />

                <div className={`relative h-full flex flex-col items-center md:items-start p-6 md:p-8 rounded-3xl border transition-all duration-500 backdrop-blur-3xl overflow-hidden
                  ${isActive
                    ? "bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
                    : "bg-[#1e293b]/20 border-white/5 hover:bg-[#1e293b]/40 hover:border-white/10"
                  }`}
                >
                  {/* Decorative Gradient Background (visible only when active) */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
                      />
                    )}
                  </AnimatePresence>

                  <div className={`p-4 rounded-2xl mb-6 transition-all duration-500
                    ${isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-white/5 text-gray-400 group-hover:text-gray-200"
                    }`}
                  >
                    {tabMenu.icon}
                  </div>

                  <div className="space-y-2 text-center md:text-left">
                    <h3 className={`font-calsans text-xl transition-colors duration-300
                      ${isActive ? "text-indigo-400" : "text-gray-200"}
                    `}>
                      {tabMenu.name}
                    </h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      {tabMenu.description}
                    </p>
                  </div>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabManning"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Content Section with Animation */}
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={indexMenuSelected}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            {indexMenuSelected === 0 && <ManningAgentTrainingService manningAgent={manningAgent} />}
            {indexMenuSelected === 1 && (
              <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-white/5">
                <h3 className="text-xl font-calsans text-white">Uji Kompetensi</h3>
                <p className="text-sm text-gray-400">Layanan ini akan segera tersedia untuk Manning Agent.</p>
              </div>
            )}
            {indexMenuSelected === 2 && (
              <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-white/5">
                <h3 className="text-xl font-calsans text-white">Informasi Profil</h3>
                <p className="text-sm text-gray-400">Pengaturan profil lembaga Manning Agent.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
