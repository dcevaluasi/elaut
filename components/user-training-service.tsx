"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "./ui/button";
import { FiMaximize, FiMinimize, FiSearch } from "react-icons/fi";
import { Input } from "./ui/input";
import { usePathname } from "next/navigation";
import {
  extractPathAfterBppp,
  getPenyeleggara,
} from "@/utils/pelatihan";
import { PelatihanMasyarakat } from "@/types/product";
import axios, { AxiosResponse } from "axios";
import { User } from "@/types/user";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Cookies from "js-cookie";
import { truncateText } from "@/utils";
import { generateTanggalPelatihan } from "@/utils/text";
import { elautBaseUrl } from "@/constants/urls";
import Image from "next/image";
import { TimelineProgressPesertaPelatihan } from "./dashboard/Dashboard/TimelineProgressPesertaPelatihan";
import { motion, AnimatePresence } from "framer-motion";

function UserTrainingService({ user }: { user: User | null }) {
  const [indexPelatihanSelected, setIndexPelatihanSelected] =
    React.useState<number>(100000000);

  const icons = (bidangPelatihan: string) => {
    switch (bidangPelatihan) {
      case "Pengolahan dan Pemasaran":
        return "/images/bidangPelatihan/pengolahan-pemasaran.png";
      case "Budidaya":
        return "/images/bidangPelatihan/budidaya.png";
      case "Penangkapan":
        return "/images/bidangPelatihan/penangkapan.png";
      case "Konservasi":
        return "/images/bidangPelatihan/konservasi.png";
      case "Mesin Perikanan":
        return "/images/bidangPelatihan/mesin-perikanan.png";
      case "Kepelautan":
        return "/images/bidangPelatihan/kepelautan.png";
      case "Manajemen Perikanan":
        return "/images/bidangPelatihan/sd-perikanan.png";
      default:
        return "/images/bidangPelatihan/sd-perikanan.png";
    }
  };

  const pathname = usePathname();
  const location = extractPathAfterBppp(pathname);
  const penyelenggara = getPenyeleggara(location!);

  const [data, setData] = React.useState<PelatihanMasyarakat[]>([]);
  const [isExpand, setIsExpand] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const token = Cookies.get("XSRF081");
  const [userDetail, setUserDetail] = React.useState<User | null>(null);
  const [selectedPelatihan, setSelectedPelatihan] =
    React.useState<PelatihanMasyarakat | null>(null);

  const handleFetchingPublicTrainingDataByPenyelenggara = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihan?penyelenggara_pelatihan=${penyelenggara}`
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching training data:", error);
    }
  };

  const handleFetchingUserDetail = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/users/getUsersById`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserDetail(response.data);
    } catch (error) {
      console.error("Error fetching user detail:", error);
    }
  };

  const handleFetchingDetailPelatihan = async (id: number) => {
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/getPelatihanUser?idPelatihan=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedPelatihan(response.data);
    } catch (error) {
      console.error("Error fetching detail pelatihan:", error);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        handleFetchingUserDetail(),
        handleFetchingPublicTrainingDataByPenyelenggara()
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const [keywordSearch, setKeywordSearch] = React.useState<string>("");
  const [seeMore, setSeeMore] = React.useState<boolean>(false);
  const isManningAgent = Cookies.get("isManningAgent");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative w-full py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20"
            >
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </motion.div>
          ) : userDetail?.Pelatihan?.length !== 0 ? (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-12"
            >
              {!isExpand && (
                <div className="text-center space-y-4">
                  <motion.h2
                    variants={itemVariants}
                    className="text-3xl md:text-5xl font-calsans text-white"
                  >
                    Pelatihan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Masyarakat</span>
                  </motion.h2>
                  <motion.p
                    variants={itemVariants}
                    className="text-gray-400 max-w-2xl mx-auto font-light"
                  >
                    Pantau progress, akses materi, dan unduh sertifikat dari pelatihan yang Anda ikuti untuk menjadi SDM unggul.
                  </motion.p>
                </div>
              )}

              <div className={`flex flex-col lg:flex-row gap-8 ${isExpand ? "items-center" : "items-start"}`}>
                {/* List Section */}
                <motion.div
                  layout
                  className={`space-y-6 transition-all duration-500 ${indexPelatihanSelected !== 100000000 ? (isExpand ? "hidden" : "w-full lg:w-1/3") : "w-full"
                    }`}
                >
                  {/* Search bar */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
                    <div className="relative flex items-center bg-[#1e293b]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
                      <FiSearch className="ml-4 text-gray-400" />
                      <Input
                        value={keywordSearch}
                        onChange={(e) => setKeywordSearch(e.target.value)}
                        className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-gray-500 h-10"
                        placeholder="Cari pelatihan Anda..."
                      />
                    </div>
                  </div>

                  <Tabs defaultValue="Klasikal" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-[#1e293b]/40 backdrop-blur-xl border border-white/10 p-1">
                      <TabsTrigger value="Klasikal" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 transition-all duration-300">Klasikal</TabsTrigger>
                      <TabsTrigger value="Online" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 transition-all duration-300">Online</TabsTrigger>
                    </TabsList>

                    <TabsContent value="Klasikal" className="mt-6 space-y-4">
                      {userDetail?.Pelatihan.slice()
                        .reverse()
                        .filter((pelatihan) =>
                          pelatihan?.NamaPelatihan.toLowerCase().includes(keywordSearch.toLowerCase())
                        )
                        .map((pelatihan, reverseIndex) => {
                          const actualIndex = userDetail.Pelatihan.length - 1 - reverseIndex;
                          const isActive = indexPelatihanSelected === actualIndex;

                          return (
                            <motion.div
                              key={pelatihan.IdPelatihan}
                              variants={itemVariants}
                              whileHover={{ x: 5 }}
                              onClick={() => {
                                setIndexPelatihanSelected(actualIndex);
                                handleFetchingDetailPelatihan(pelatihan?.IdPelatihan);
                              }}
                              className={`relative group cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${isActive
                                  ? "bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                  : "bg-[#1e293b]/40 border-white/5 hover:border-white/20"
                                }`}
                            >
                              <div className="flex gap-4 items-center">
                                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                                  <Image
                                    width={40}
                                    height={40}
                                    alt="icon"
                                    src={icons(pelatihan?.BidangPelatihan)}
                                    className="w-10 h-10 object-contain"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className={`font-calsans leading-tight transition-colors ${isActive ? "text-blue-400" : "text-white"}`}>
                                    {pelatihan.NamaPelatihan}
                                  </h3>
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{pelatihan.BidangPelatihan}</p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </TabsContent>

                    <TabsContent value="Online" className="mt-6">
                      <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl text-gray-500 font-light italic">
                        Belum ada pelatihan online yang aktif.
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>

                {/* Detail Section */}
                <AnimatePresence>
                  {indexPelatihanSelected !== 100000000 && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`transition-all duration-500 ${isExpand ? "w-full" : "w-full lg:w-2/3"}`}
                    >
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000" />
                        <div className="relative bg-[#1e293b]/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8">

                          {/* Header Detail */}
                          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8">
                            <div className="space-y-4 flex-1">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase">
                                Detail Pelatihan
                              </div>
                              <h3 className="text-3xl md:text-4xl font-calsans text-white leading-tight">
                                {userDetail?.Pelatihan[indexPelatihanSelected]?.NamaPelatihan}
                              </h3>
                              <p className="text-sm text-gray-400 flex items-center gap-2">
                                <span className="text-blue-400">Penyelenggara:</span>
                                {selectedPelatihan?.PenyelenggaraPelatihan || "-"}
                              </p>
                              <div className="text-xs text-gray-500 bg-white/5 px-4 py-2 rounded-lg inline-block">
                                📅 {selectedPelatihan ? `${generateTanggalPelatihan(selectedPelatihan?.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(selectedPelatihan?.TanggalBerakhirPelatihan)}` : "-"}
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <button
                                onClick={() => setIsExpand(!isExpand)}
                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                              >
                                {isExpand ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
                              </button>
                              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <Image
                                  width={48}
                                  height={48}
                                  alt="icon"
                                  src={icons(userDetail?.Pelatihan[indexPelatihanSelected]?.BidangPelatihan!)}
                                  className="w-12 h-12 object-contain"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Bidang</p>
                              <p className="text-sm text-white font-medium">{userDetail?.Pelatihan[indexPelatihanSelected]?.BidangPelatihan || "-"}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">No STTPL</p>
                              <p className="text-sm text-white font-medium">{userDetail?.Pelatihan[indexPelatihanSelected]?.NoRegistrasi || "-"}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Status</p>
                              <p className="text-sm text-blue-400 font-bold">{userDetail?.Pelatihan[indexPelatihanSelected]?.Keterangan || "-"}</p>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                              <h4 className="text-xl font-calsans text-white">Deskripsi Pelatihan</h4>
                            </div>
                            <div className="prose prose-invert prose-blue max-w-none">
                              <p
                                dangerouslySetInnerHTML={{
                                  __html: seeMore
                                    ? userDetail?.Pelatihan[indexPelatihanSelected]?.DetailPelatihan!
                                    : truncateText(userDetail?.Pelatihan[indexPelatihanSelected]?.DetailPelatihan!, 400, "...")
                                }}
                                className="text-sm text-gray-300 leading-relaxed text-justify"
                              />
                              <button
                                onClick={() => setSeeMore(!seeMore)}
                                className="text-blue-400 text-sm font-semibold hover:underline mt-2"
                              >
                                {seeMore ? "Baca sedikit" : "Baca selengkapnya"}
                              </button>
                            </div>
                          </div>

                          {/* Timeline/Progress */}
                          {selectedPelatihan && selectedPelatihan.UjiKompotensi !== "Portfolio" && (
                            <div className="pt-6 border-t border-white/5">
                              <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                                <h4 className="text-xl font-calsans text-white">Progress Pelatihan</h4>
                              </div>
                              <div className="bg-white/5 rounded-3xl p-6 md:p-10 border border-white/5">
                                <TimelineProgressPesertaPelatihan
                                  userDetail={userDetail?.Pelatihan[indexPelatihanSelected]!}
                                  pelatihan={selectedPelatihan}
                                />
                              </div>
                            </div>
                          )}

                          {/* Score & Certificate Table */}
                          {userDetail?.Pelatihan[indexPelatihanSelected]?.PostTest !== 0 && (
                            <div className="space-y-6 pt-6 border-t border-white/5">
                              <h4 className="text-xl font-calsans text-white">Penilaian & Sertifikat</h4>
                              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1e293b]/20">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-widest font-bold">
                                    <tr>
                                      <th className="px-6 py-4">Aspek Penilaian</th>
                                      <th className="px-6 py-4 text-center">Nilai</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5 text-gray-300">
                                    <tr>
                                      <td className="px-6 py-4 italic">Pre-test</td>
                                      <td className="px-6 py-4 text-center font-bold text-white">{userDetail?.Pelatihan[indexPelatihanSelected]?.PreTest}</td>
                                    </tr>
                                    <tr>
                                      <td className="px-6 py-4 italic">Post-test</td>
                                      <td className="px-6 py-4 text-center font-bold text-white">{userDetail?.Pelatihan[indexPelatihanSelected]?.PostTest}</td>
                                    </tr>
                                    <tr className="bg-blue-600/10">
                                      <td className="px-6 py-4 font-bold text-blue-400">Total Rata-rata</td>
                                      <td className="px-6 py-4 text-center font-extrabold text-blue-400">
                                        {((userDetail?.Pelatihan[indexPelatihanSelected]?.PreTest! + userDetail?.Pelatihan[indexPelatihanSelected]?.PostTest!) / 2).toFixed(1)}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* Certificate Download */}
                              {userDetail?.Pelatihan[indexPelatihanSelected]?.StatusPenandatangan === "Done" && (
                                <Link
                                  target="_blank"
                                  href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${userDetail?.Pelatihan[indexPelatihanSelected].FileSertifikat}`}
                                  className="group/btn relative w-full h-14 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                                >
                                  <div className="absolute inset-0 w-8 bg-white/20 -skew-x-12 translate-x-[-150%] group-hover/btn:translate-x-[600%] transition-transform duration-1000" />
                                  <RiVerifiedBadgeFill className="text-xl group-hover/btn:scale-110 transition-transform" />
                                  UNDUH SERTIFIKAT RESMI
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative w-80 h-80 mb-8">
                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                <Image
                  src="/illustrations/not-found.png"
                  alt="Empty"
                  fill
                  className="object-contain relative z-10"
                />
              </div>
              <h1 className="text-3xl md:text-5xl font-calsans text-white mb-4">Belum Ada Pelatihan</h1>
              <p className="text-gray-400 max-w-md mx-auto font-light mb-8">
                Anda belum mengikuti pelatihan kelautan atau perikanan. Mulai perjalanan Anda sekarang!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Cari Pelatihan <FiSearch />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default UserTrainingService;

