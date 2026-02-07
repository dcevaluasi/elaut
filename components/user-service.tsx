"use client";

import React, { useState } from "react";
import { HiUserGroup } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/types/user";
import UserTrainingService from "./user-training-service";
import UserCertificateService from "./user-certificate-service";
import UserDocuments from "./user-documents";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaFilePen } from "react-icons/fa6";

export default function UserService({ user }: { user: User | null }) {
  const tabMenus = [
    {
      id: 1,
      name: "Pelatihan Diikuti",
      description: "Riwayat & status pelatihan yang kamu ambil.",
      icon: <FaFilePen className="text-3xl" />,
      color: "blue",
    },
    {
      id: 2,
      name: "Sertifikat",
      description: "Koleksi sertifikat resmi yang sudah diraih.",
      icon: <RiVerifiedBadgeFill className="text-3xl" />,
      color: "cyan",
    },
    {
      id: 3,
      name: "Profil & Dokumen",
      description: "Pengaturan profil data & unggah berkas.",
      icon: <HiUserGroup className="text-3xl" />,
      color: "teal",
    },
  ];

  const [indexMenuSelected, setIndexMenuSelected] = useState(0);

  return (
    <div className="w-full flex flex-col space-y-12">
      {/* Premium Tab Navigation */}
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
                  ${isActive ? 'bg-blue-500/30 opacity-100' : 'group-hover:opacity-20 bg-blue-400/20'}`}
                />

                <div className={`relative h-full flex flex-col items-center md:items-start p-6 md:p-8 rounded-3xl border transition-all duration-500 backdrop-blur-3xl overflow-hidden
                  ${isActive
                    ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
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
                        className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
                      />
                    )}
                  </AnimatePresence>

                  <div className={`p-4 rounded-2xl mb-6 transition-all duration-500
                    ${isActive
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                      : "bg-white/5 text-gray-400 group-hover:text-gray-200"
                    }`}
                  >
                    {tabMenu.icon}
                  </div>

                  <div className="space-y-2 text-center md:text-left">
                    <h3 className={`font-calsans text-xl transition-colors duration-300
                      ${isActive ? "text-blue-400" : "text-gray-200"}
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
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"
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
            {indexMenuSelected === 0 && <UserTrainingService user={user} />}
            {indexMenuSelected === 1 && <UserCertificateService user={user} />}
            {indexMenuSelected === 2 && <UserDocuments user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

