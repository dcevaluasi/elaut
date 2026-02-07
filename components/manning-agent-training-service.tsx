"use client";

import React, { useRef, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "./ui/button";
import { FiMaximize, FiMinimize, FiSearch, FiCalendar, FiMapPin, FiAward, FiInfo } from "react-icons/fi";
import { Input } from "./ui/input";
import { usePathname } from "next/navigation";
import {
  extractPathAfterBppp,
  getPenyeleggara,
} from "@/utils/pelatihan";
import {
  ManningAgent,
  ManningAgentPelatihan,
  PelatihanMasyarakat,
} from "@/types/product";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { truncateText } from "@/utils";
import { generateTanggalPelatihan } from "@/utils/text";
import { elautBaseUrl } from "@/constants/urls";
import Image from "next/image";
import { TimelineProgressManningAgent } from "./dashboard/Dashboard/TimelineProgressManningAgent";
import { motion, AnimatePresence } from "framer-motion";
import { HashLoader } from "react-spinners";

function ManningAgentTrainingService({
  manningAgent,
}: {
  manningAgent: ManningAgent | null;
}) {
  const [indexPelatihanSelected, setIndexPelatihanSelected] = useState<number>(100000000);
  const [data, setData] = useState<PelatihanMasyarakat[]>([]);
  const [isExpand, setIsExpand] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPelatihan, setSelectedPelatihan] = useState<ManningAgentPelatihan | null>(null);
  const [selectedDetailPelatihan, setSelectedDetailPelatihan] = useState<PelatihanMasyarakat | null>(null);
  const [keywordSearch, setKeywordSearch] = useState<string>("");
  const [seeMore, setSeeMore] = useState<boolean>(false);

  const token = Cookies.get("XSRF081");
  const pathname = usePathname();
  const location = extractPathAfterBppp(pathname);
  const penyelenggara = getPenyeleggara(location!);

  const icons = (bidangPelatihan: string) => {
    switch (bidangPelatihan) {
      case "Pengolahan dan Pemasaran": return "/images/bidangPelatihan/pengolahan-pemasaran.png";
      case "Budidaya": return "/images/bidangPelatihan/budidaya.png";
      case "Penangkapan": return "/images/bidangPelatihan/penangkapan.png";
      case "Konservasi": return "/images/bidangPelatihan/konservasi.png";
      case "Mesin Perikanan": return "/images/bidangPelatihan/mesin-perikanan.png";
      case "Kepelautan": return "/images/bidangPelatihan/kepelautan.png";
      case "Manajemen Perikanan": return "/images/bidangPelatihan/sd-perikanan.png";
      default: return "/images/bidangPelatihan/sd-perikanan.png";
    }
  };

  const handleFetchingPublicTrainingDataByPenyelenggara = async () => {
    try {
      const response: AxiosResponse = await axios.get(`${elautBaseUrl}/lemdik/getPelatihan?penyelenggara_pelatihan=${penyelenggara}`);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching training data:", error);
    }
  };

  const handleFetchingDetailPelatihan = async (id: number, idPelatihan: number) => {
    try {
      const response: AxiosResponse = await axios.get(`${elautBaseUrl}/manningAgent/getDataManingAgentPelatihan?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const responseDetail: AxiosResponse = await axios.get(`${elautBaseUrl}/getPelatihanUser?idPelatihan=${idPelatihan}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedDetailPelatihan(responseDetail.data);
      setSelectedPelatihan(response.data.data[0]);
    } catch (error) {
      console.error("Error fetching detail pelatihan:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      handleFetchingPublicTrainingDataByPenyelenggara();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredPelatihan = manningAgent?.ManingAgentPelatihan?.slice()?.reverse()?.filter((p) =>
    keywordSearch.toLowerCase().split(" ").every((k) => p.NamaPelatihan.toLowerCase().includes(k))
  ) || [];

  if (loading) return (
    <div className="flex justify-center py-20">
      <HashLoader color="#6366f1" size={40} />
    </div>
  );

  return (
    <div className="w-full text-white pb-20">
      {manningAgent?.ManingAgentPelatihan!.length != 0 ? (
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Header Title Component */}
          {!isExpand && (
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest"
              >
                <FiBriefcase size={14} /> Training Operations
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-calsans tracking-tight leading-none text-white">
                Manajemen <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Pelatihan Kru</span>
              </h1>
              <p className="text-sm text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                Kelola pendaftaran, pantau progres validasi berkas, dan monitor hasil pelatihan para awak kapal di bawah naungan Manning Agent Anda.
              </p>
            </div>
          )}

          <div className={`flex flex-col lg:flex-row gap-8 ${isExpand ? 'items-center' : ''}`}>

            {/* LEFT: Training List */}
            <div className={`${indexPelatihanSelected !== 100000000 && !isExpand ? 'lg:w-1/3 w-full' : 'w-full'} space-y-6 ${isExpand ? 'hidden' : ''}`}>
              {/* Search Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Cari pelatihan yang diikuti..."
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-[#020617]/40 backdrop-blur-xl border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                {filteredPelatihan.map((pelatihan, revIdx) => {
                  const actualIdx = manningAgent?.ManingAgentPelatihan.length! - 1 - revIdx;
                  const isActive = indexPelatihanSelected === actualIdx;
                  return (
                    <motion.div
                      key={pelatihan.IdMiningAgentPelatihan}
                      whileHover={{ x: 5 }}
                      onClick={() => {
                        setIndexPelatihanSelected(actualIdx);
                        handleFetchingDetailPelatihan(pelatihan.IdMiningAgentPelatihan, parseInt(pelatihan.IdPelatihan));
                      }}
                      className={`group relative p-6 rounded-3xl border transition-all cursor-pointer overflow-hidden ${isActive
                          ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg'
                          : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                    >
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-white/5 p-2 shrink-0">
                          <Image src={icons(pelatihan.BidangPelatihan)} alt="" width={48} height={48} className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-1">
                          <h4 className={`text-sm font-bold font-calsans line-clamp-2 transition-colors ${isActive ? 'text-indigo-400' : 'text-white'}`}>
                            {pelatihan.NamaPelatihan}
                          </h4>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{pelatihan.BidangPelatihan}</p>
                        </div>
                      </div>
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Training Details & Progress */}
            {indexPelatihanSelected !== 100000000 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex-1 space-y-8 ${isExpand ? 'max-w-5xl mx-auto w-full' : ''}`}
              >
                <div className="bg-[#0f172a]/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-colors" />

                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">Operation Details</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-calsans leading-none text-white">
                        {manningAgent?.ManingAgentPelatihan[indexPelatihanSelected]?.NamaPelatihan}
                      </h2>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-indigo-400" />
                          <span>{selectedDetailPelatihan ? `${generateTanggalPelatihan(selectedDetailPelatihan.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(selectedDetailPelatihan.TanggalBerakhirPelatihan)}` : '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-indigo-400" />
                          <span>{selectedDetailPelatihan?.PenyelenggaraPelatihan || '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsExpand(!isExpand)}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-400 transition-all active:scale-95"
                      >
                        {isExpand ? <FiMinimize /> : <FiMaximize />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                        <FiInfo className="text-indigo-500" /> Ringkasan Pelatihan
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none text-gray-400 leading-relaxed text-justify">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: !seeMore && !isExpand
                              ? truncateText(manningAgent?.ManingAgentPelatihan[indexPelatihanSelected]?.DetailPelatihan!, 300, "...")
                              : manningAgent?.ManingAgentPelatihan[indexPelatihanSelected]?.DetailPelatihan!
                          }}
                        />
                        {(!isExpand) && (
                          <button
                            onClick={() => setSeeMore(!seeMore)}
                            className="text-indigo-400 font-bold mt-2 hover:underline focus:outline-none"
                          >
                            {seeMore ? 'Baca Lebih Sedikit' : 'Baca Selengkapnya'}
                          </button>
                        )}
                      </div>
                    </div>

                    {selectedPelatihan && selectedDetailPelatihan && (
                      <div className="mt-8 border-t border-white/5 pt-12">
                        <TimelineProgressManningAgent
                          manningAgent={manningAgent?.ManingAgentPelatihan[indexPelatihanSelected]!}
                          pelatihan={selectedPelatihan}
                          detailPelatihan={selectedDetailPelatihan}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto text-center py-24 space-y-6">
          <div className="w-32 h-32 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400 mb-8 border border-indigo-500/20">
            <FiBriefcase size={48} />
          </div>
          <h2 className="text-3xl font-calsans">Belum Ada Pelatihan</h2>
          <p className="text-gray-400 max-w-md mx-auto">Manning Agent Anda belum mendaftarkan pelatihan apapun. Mulai daftarkan awak kapal Anda untuk pelatihan resmi KKP.</p>
          <Link href="/">
            <div className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl tracking-widest transition-all shadow-lg active:scale-95">
              CARI PELATIHAN SEKARANG
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default ManningAgentTrainingService;
