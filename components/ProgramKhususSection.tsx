"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function ProgramKhususSection() {
  return (
    <div className="w-full pt-12 border-t border-white/10 mt-12 relative z-10">
      <div className="text-center md:text-left space-y-2 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-bold uppercase tracking-widest"
        >
          Program Unggulan
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl lg:text-4xl font-calsans leading-tight text-white mb-2"
        >
          Program Khusus SDM Kelautan dan Perikanan
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-gray-400 text-xs md:text-sm max-w-2xl md:mx-0 mx-auto leading-relaxed"
        >
          Inisiatif strategis untuk mencetak SDM unggul melalui pelatihan dan sertifikasi kompetensi khusus.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
        >
          <Link href="https://elaut-bppsdm.kkp.go.id/waingapu" target="_blank" className="block h-full group">
            <div className="relative flex flex-col h-full min-h-[370px] md:min-h-[400px] rounded-3xl border border-white/10 bg-[#1e293b]/20 backdrop-blur-2xl transition-all duration-500 hover:border-blue-500/30 overflow-hidden group/card">
              <div className="absolute inset-0 z-0">
                <Image src="/images/hero-img6.jpg" alt="Waingapu" fill className="object-cover transition-transform duration-700 group-hover/card:scale-110 opacity-70 group-hover/card:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
              </div>

              <div className="relative z-10 flex flex-col h-full p-8 md:p-10">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Image src="/icons/icperikanan.png" alt="Icon" width={60} height={60} />
                </div>
                <div className="mt-auto">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)] backdrop-blur-md">
                      Budi Daya Udang
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-calsans text-white mb-3 group-hover:text-blue-300 transition-colors drop-shadow-md">
                    Program Diklat Khusus Budi Daya Udang Terintegrasi Waingapu
                  </h3>
                  <p className="text-gray-300 text-sm group-hover:text-white transition-colors drop-shadow">
                    Pelatihan komprehensif untuk mendukung pengembangan tambak udang terintegrasi.
                  </p>
                  <div className="mt-6 flex items-center text-blue-400 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                    Kunjungi Portal <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5 }}
        >
          <Link href="https://elaut-bppsdm.kkp.go.id/akp" target="_blank" className="block h-full group">
            <div className="relative flex flex-col h-full min-h-[370px] md:min-h-[400px] rounded-3xl border border-white/10 bg-[#1e293b]/20 backdrop-blur-2xl transition-all duration-500 hover:border-cyan-500/30 overflow-hidden group/card">
              <div className="absolute inset-0 z-0">
                <Image src="/images/hero-img2.jpg" alt="Awak Kapal Perikanan" fill className="object-cover transition-transform duration-700 group-hover/card:scale-110 opacity-70 group-hover/card:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
              </div>

              <div className="relative z-10 flex flex-col h-full p-8 md:p-10">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Image src="/icons/icawak.png" alt="Icon" width={60} height={60} />
                </div>
                <div className="mt-auto">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-md">
                      Awak Kapal Perikanan
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-calsans text-white mb-3 group-hover:text-cyan-300 transition-colors drop-shadow-md">
                    Program Diklat dan Sertifikasi Awak Kapal Perikanan untuk Modernisasi Kapal Perikanan
                  </h3>
                  <p className="text-gray-300 text-sm group-hover:text-white transition-colors drop-shadow">
                    Diklat dan Sertifikasi kompetensi untuk mendukung modernisasi kapal perikanan nasional.
                  </p>
                  <div className="mt-6 flex items-center text-cyan-400 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                    Kunjungi Portal <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
