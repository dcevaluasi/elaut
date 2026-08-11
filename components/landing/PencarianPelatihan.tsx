"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  BALAI_PELATIHAN,
  JENIS_PELAKSANAAN,
} from "@/constants/pelatihan";
import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { createSlug } from "@/utils";
import axios, { AxiosResponse } from "axios";
import Link from "next/link";
import { MdClear } from "react-icons/md";
import { HiViewGrid } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { RiSchoolLine } from "react-icons/ri";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import {
  encryptValue,
  formatToRupiah,
  getMonthName,
} from "@/lib/utils";
import {
  FiCalendar,
  FiSearch,
  FiX,
  FiMapPin,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
  FiEye,
  FiArrowRight
} from "react-icons/fi";
import { formatDateRange } from "@/utils/time";
import { HiClock } from "react-icons/hi2";
import { motion } from "framer-motion";

/**
 * Checks if a training is finished either by StatusApproval === 'Selesai'
 * OR if the current date is after TanggalBerakhirPelatihan.
 * NOTE: TanggalBerakhirPendaftaran (registration deadline) is intentionally
 * NOT used here — a closed registration does not mean the training is over.
 */
export const checkIsTrainingFinished = (pelatihan: PelatihanMasyarakat): boolean => {
  if (pelatihan?.StatusApproval === "Selesai") {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (pelatihan?.TanggalBerakhirPelatihan) {
    const endDate = new Date(pelatihan.TanggalBerakhirPelatihan);
    if (!isNaN(endDate.getTime())) {
      endDate.setHours(23, 59, 59, 999);
      if (today > endDate) return true;
    }
  }

  return false;
};

function PencarianPelatihan() {
  const pathname = usePathname();
  const [data, setData] = useState<PelatihanMasyarakat[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [jenisPembayaran, setJenisPembayaran] = useState<string>("");
  const [jenisPelaksanaan, setJenisPelaksanaan] = useState<string>("");
  const [selectedBalaiPelatihan, setSelectedBalaiPelatihan] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showResult, setShowResult] = useState<boolean>(false);

  const jenisProgram =
    pathname === "/layanan/pelatihan/program/akp"
      ? "Awak Kapal Perikanan"
      : pathname === "/layanan/pelatihan/program/perikanan"
        ? "Perikanan"
        : "Kelautan";

  const handleFetchingPublicTrainingData = async () => {
    setLoading(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihan?program=${encodeURIComponent(jenisProgram)}`
      );
      setLoading(false);
      setShowResult(true);

      console.log("[PencarianPelatihan] API response:", response.data);
      console.log("[PencarianPelatihan] jenisProgram:", jenisProgram);

      // Support both response.data.data and response.data as array
      const rawItems: PelatihanMasyarakat[] | null =
        Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : null;

      console.log("[PencarianPelatihan] rawItems count:", rawItems?.length ?? 0);

      if (rawItems && rawItems.length > 0) {
        let items: PelatihanMasyarakat[] = rawItems;

        // Filter for JenisProgram & Publish status (lenient: allow missing fields)
        const beforeProgram = items.length;
        items = items.filter(
          (item: PelatihanMasyarakat) =>
            (!item.JenisProgram || item.JenisProgram === jenisProgram) &&
            (!item.Status || item.Status === "Publish")
        );
        console.log(`[PencarianPelatihan] after program+status filter: ${items.length} / ${beforeProgram}`);

        // Apply Pembayaran Filter
        if (jenisPembayaran) {
          items = items.filter((item) => item.JenisPelatihan === jenisPembayaran);
        }

        // Apply Balai Filter
        if (selectedBalaiPelatihan) {
          items = items.filter((item) =>
            item.PenyelenggaraPelatihan?.toLowerCase().includes(selectedBalaiPelatihan.toLowerCase())
          );
        }

        // Apply Pelaksanaan Filter
        if (jenisPelaksanaan) {
          items = items.filter((item) => item.PelaksanaanPelatihan === jenisPelaksanaan);
        }

        // Apply Status Filter (Active vs Selesai based on Date & StatusApproval)
        if (selectedStatus === "Buka") {
          items = items.filter((item) => !checkIsTrainingFinished(item));
        } else if (selectedStatus === "Selesai") {
          items = items.filter((item) => checkIsTrainingFinished(item));
        }

        // Apply Search Keyword Filter
        if (searchKeyword.trim()) {
          const q = searchKeyword.toLowerCase();
          items = items.filter(
            (item) =>
              item.NamaPelatihan?.toLowerCase().includes(q) ||
              item.BidangPelatihan?.toLowerCase().includes(q) ||
              item.PenyelenggaraPelatihan?.toLowerCase().includes(q)
          );
        }

        console.log("[PencarianPelatihan] final items to display:", items.length);

        // Sort data: Active trainings first, then by date
        items.sort((a: PelatihanMasyarakat, b: PelatihanMasyarakat) => {
          const isAFinished = checkIsTrainingFinished(a);
          const isBFinished = checkIsTrainingFinished(b);
          if (isAFinished && !isBFinished) return 1;
          if (!isAFinished && isBFinished) return -1;

          const dateA = new Date(a.TanggalMulaiPelatihan).getTime();
          const dateB = new Date(b.TanggalMulaiPelatihan).getTime();
          return dateA - dateB;
        });

        setData(items.length > 0 ? items : null);
      } else {
        console.warn("[PencarianPelatihan] No raw items from API or empty array.");
        setData(null);
      }
    } catch (error) {
      console.error("[PencarianPelatihan] fetch error:", error);
      setLoading(false);
      setShowResult(true);
      setData(null);
    }
  };

  const handleClearFilter = () => {
    setSearchKeyword("");
    setJenisPembayaran("");
    setSelectedBalaiPelatihan("");
    setJenisPelaksanaan("");
    setSelectedStatus("");
    handleFetchingPublicTrainingData();
  };

  useEffect(() => {
    handleFetchingPublicTrainingData();
  }, [pathname]);

  const hasActiveFilters = Boolean(
    searchKeyword || jenisPembayaran || selectedBalaiPelatihan || jenisPelaksanaan || selectedStatus
  );

  return (
    <section id="cari-pelatihan" className="relative w-full py-16 sm:py-20 bg-[#020617] font-jakarta scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Search & Filter Header Console */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 bg-[#0b1120]/80 backdrop-blur-3xl border border-white/[0.08] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-calsans text-white tracking-tight flex items-center gap-2">
                <FiFilter className="w-5 h-5 text-blue-400" />
                Cari & Filter Pelatihan
              </h2>
              <p className="text-xs text-gray-400 font-light mt-1">
                Telusuri jadwal pelatihan {jenisProgram} resmi yang tersedia di seluruh Lemdiklat KP.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-all self-start sm:self-center"
              >
                <MdClear className="w-4 h-4" />
                Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            
            {/* Search Input Keyword */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Kata Kunci / Nama Pelatihan
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Ketik nama atau bidang pelatihan..."
                  className="w-full h-12 pl-10 pr-9 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Pelatihan (Buka / Selesai) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Status Pelatihan
              </label>
              <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val)}>
                <SelectTrigger className="w-full h-12 bg-white/[0.04] border-white/10 text-gray-300 rounded-xl text-xs focus:ring-blue-500/30 hover:bg-white/[0.08] transition-all">
                  <div className="flex gap-2 items-center truncate">
                    <FiCheckCircle className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">
                      {selectedStatus === "" ? "Semua Status" : selectedStatus === "Buka" ? "Pendaftaran Dibuka" : "Pelatihan Selesai"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-white z-[9999]">
                  <SelectGroup>
                    <SelectItem value="Buka">Pendaftaran Dibuka</SelectItem>
                    <SelectItem value="Selesai">Pelatihan Selesai</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Jenis Layanan (Gratis / Berbayar) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Jenis Layanan
              </label>
              <Select value={jenisPembayaran} onValueChange={(val) => setJenisPembayaran(val)}>
                <SelectTrigger className="w-full h-12 bg-white/[0.04] border-white/10 text-gray-300 rounded-xl text-xs focus:ring-blue-500/30 hover:bg-white/[0.08] transition-all">
                  <div className="flex gap-2 items-center truncate">
                    <HiViewGrid className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">{jenisPembayaran === "" ? "Semua Layanan" : jenisPembayaran}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-white z-[9999]">
                  <SelectGroup>
                    <SelectItem value="Gratis">Gratis</SelectItem>
                    <SelectItem value="Berbayar">Berbayar</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Lemdiklat KP */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Lemdiklat KP
              </label>
              <Select value={selectedBalaiPelatihan} onValueChange={(val) => setSelectedBalaiPelatihan(val)}>
                <SelectTrigger className="w-full h-12 bg-white/[0.04] border-white/10 text-gray-300 rounded-xl text-xs focus:ring-blue-500/30 hover:bg-white/[0.08] transition-all">
                  <div className="flex gap-2 items-center truncate">
                    <RiSchoolLine className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">{selectedBalaiPelatihan === "" ? "Semua Lemdiklat" : selectedBalaiPelatihan}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-white z-[9999] max-h-60 overflow-y-auto">
                  <SelectGroup>
                    {BALAI_PELATIHAN.map((balai, idx) => (
                      <SelectItem key={idx} value={balai.Name}>{balai.Name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Pelaksanaan (Metode) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Metode Pelaksanaan
              </label>
              <Select value={jenisPelaksanaan} onValueChange={(val) => setJenisPelaksanaan(val)}>
                <SelectTrigger className="w-full h-12 bg-white/[0.04] border-white/10 text-gray-300 rounded-xl text-xs focus:ring-blue-500/30 hover:bg-white/[0.08] transition-all">
                  <div className="flex gap-2 items-center truncate">
                    <HiClock className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">{jenisPelaksanaan === "" ? "Semua Metode" : jenisPelaksanaan}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-white z-[9999]">
                  <SelectGroup>
                    {JENIS_PELAKSANAAN.map((item, idx) => (
                      <SelectItem key={idx} value={item}>{item}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-400">
              {data && (
                <span>Menampilkan <strong className="text-white font-bold">{data.length}</strong> jadwal pelatihan</span>
              )}
            </div>

            <Button
              onClick={handleFetchingPublicTrainingData}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <FiSearch className="w-4 h-4" />
              <span>Cari Pelatihan</span>
            </Button>
          </div>
        </motion.div>

        {/* Training List Results */}
        {loading ? (
          /* Skeleton Loading Cards */
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 rounded-3xl bg-[#0b1120]/50 border border-white/[0.05] p-6 animate-pulse" />
            ))}
          </div>
        ) : (
          showResult && (
            <div className="space-y-4">
              {data === null || data.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl bg-[#0b1120]/40 border border-white/[0.06] text-center"
                >
                  <Image src="/illustrations/not-found.png" alt="Not Found" width={200} height={200} className="opacity-30 grayscale mb-4" />
                  <h3 className="text-xl font-bold text-white font-calsans mb-1">Pelatihan Tidak Ditemukan</h3>
                  <p className="text-gray-400 text-xs max-w-sm mb-6 font-light">
                    Belum ada jadwal pelatihan yang sesuai dengan kriteria filter Anda. Silakan ganti kata kunci atau reset filter.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilter}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all"
                    >
                      <FiRefreshCw className="w-3.5 h-3.5" />
                      Reset Filter Pelatihan
                    </button>
                  )}
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {data.map((pelatihan, index) => (
                    <CardPelatihan key={pelatihan.IdPelatihan || index} pelatihan={pelatihan} index={index} />
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}

const CardPelatihan = ({ pelatihan, index }: { pelatihan: PelatihanMasyarakat; index: number }) => {
  const isFinished = checkIsTrainingFinished(pelatihan);
  const isFree = pelatihan?.HargaPelatihan === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      className={`group relative bg-[#0b1120]/75 backdrop-blur-2xl border ${
        isFinished ? "border-white/[0.05] opacity-90 hover:opacity-100 hover:border-amber-500/30" : "border-white/[0.08] hover:border-blue-500/30"
      } p-6 rounded-3xl transition-all duration-300 shadow-xl group-hover:shadow-2xl`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Info Pelatihan (5 col) */}
        <div className="lg:col-span-5 space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">
              {pelatihan.BidangPelatihan || "Pelatihan KP"}
            </span>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${
              isFree ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
            }`}>
              {isFree ? "GRATIS" : "BERBAYAR"}
            </span>
            
            {/* Status Pill */}
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest inline-flex items-center gap-1 ${
              isFinished
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
            }`}>
              {isFinished ? (
                <>
                  <FiCheckCircle className="w-3 h-3 text-amber-400" />
                  Pelatihan Selesai
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Pendaftaran Dibuka
                </>
              )}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug break-words">
            {pelatihan.NamaPelatihan}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-0.5">
            <FiCalendar className="text-blue-400 flex-shrink-0" />
            <span className="truncate">Pendaftaran: {formatDateRange(pelatihan.TanggalMulaiPendaftaran, pelatihan.TanggalBerakhirPendaftaran)}</span>
          </div>
        </div>

        {/* Penyelenggara & Lokasi (3 col) */}
        <div className="lg:col-span-3 space-y-1">
          <p className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
            <RiSchoolLine className="text-blue-400 flex-shrink-0" />
            <span className="truncate">{pelatihan.PenyelenggaraPelatihan}</span>
          </p>
          <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 truncate">
            <FiMapPin className="text-gray-500 flex-shrink-0" />
            <span className="truncate">{pelatihan.LokasiPelatihan || "-"}</span>
          </p>
        </div>

        {/* Metode & Waktu (2 col) */}
        <div className="lg:col-span-2 space-y-1 lg:text-center">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-300 text-[11px] font-semibold">
            <HiClock className="text-blue-400" />
            <span>{pelatihan.PelaksanaanPelatihan || "Offline"}</span>
          </div>
          <p className="text-[11px] text-gray-400">
            {pelatihan.TanggalMulaiPelatihan ? getMonthName(pelatihan.TanggalMulaiPelatihan) : "-"}
          </p>
        </div>

        {/* Harga & CTA Button (2 col) */}
        <div className="lg:col-span-2 flex flex-col items-start lg:items-end justify-center gap-3 border-t lg:border-t-0 border-white/[0.06] pt-4 lg:pt-0">
          <div>
            <p className="text-base sm:text-lg font-extrabold text-white">
              {isFree ? (
                <span className="text-emerald-400">GRATIS</span>
              ) : (
                formatToRupiah(pelatihan.HargaPelatihan)
              )}
            </p>
          </div>

          <Link
            onClick={() => Cookies.set("JenisProgram", pelatihan?.JenisProgram)}
            href={`/layanan/pelatihan/${createSlug(pelatihan.NamaPelatihan)}/${pelatihan?.KodePelatihan}/${encryptValue(pelatihan?.IdPelatihan)}`}
            className={`w-full lg:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 text-center inline-flex items-center justify-center gap-1.5 ${
              isFinished
                ? "bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-amber-500/50 shadow-md"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-600/25"
            }`}
          >
            {isFinished ? (
              <>
                <FiEye className="w-3.5 h-3.5 text-amber-400" />
                <span>Detail (Selesai)</span>
              </>
            ) : (
              <>
                <span>Lihat Detail</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Link>
        </div>

      </div>
    </motion.div>
  );
};

export default PencarianPelatihan;


