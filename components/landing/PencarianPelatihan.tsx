"use client";

import Image from "next/image";
import React from "react";
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
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { HashLoader } from "react-spinners";
import {
  encryptValue,
  formatToRupiah,
  getMonthName,
} from "@/lib/utils";
import { FiCalendar, FiSearch } from "react-icons/fi";
import { formatDateRange } from "@/utils/time";
import { HiClock } from "react-icons/hi2";
import { motion } from "framer-motion";

function PencarianPelatihan() {
  const [data, setData] = React.useState<PelatihanMasyarakat[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const jenisProgram =
    usePathname() == "/layanan/pelatihan/program/akp"
      ? "Awak Kapal Perikanan"
      : usePathname() == "/layanan/pelatihan/program/perikanan"
        ? "Perikanan"
        : "Kelautan";

  const handleFetchingPublicTrainingData = async () => {
    setLoading(true);
    let bulanMulaiPelatihan = "";
    if (selectedBulanPelatihan != "") {
      bulanMulaiPelatihan = `${new Date().getFullYear()}-${selectedBulanPelatihan}`;
    }
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihan?${jenisProgram}&penyelenggara_pelatihan=${selectedBalaiPelatihan}&bidang_pelatihan=${selectedBidangPelatihan}&&tanggal_mulai_pelatihan=${bulanMulaiPelatihan}&program=${selectedProgramPelatihan}`
      );
      setLoading(false);
      setShowResult(true);

      if (response.data.data != null) {
        const filteredAndSortedData = response.data.data
          .filter(
            (item: PelatihanMasyarakat) =>
              item.JenisProgram === jenisProgram && item.Status == "Publish" || item.JenisPelatihan === jenisPembayaran || item.PelaksanaanPelatihan === jenisPelaksanaan
          )
          .sort((a: PelatihanMasyarakat, b: PelatihanMasyarakat) => {
            const dateA = new Date(a.TanggalMulaiPelatihan);
            const dateB = new Date(b.TanggalMulaiPelatihan);

            // First, check the StatusApproval condition
            if (
              a.StatusApproval === "Selesai" &&
              b.StatusApproval !== "Selesai"
            ) {
              return 1; // 'Selesai' should be placed later
            }
            if (
              a.StatusApproval !== "Selesai" &&
              b.StatusApproval === "Selesai"
            ) {
              return -1; // 'Selesai' should be placed later
            }

            // Otherwise, sort by date in ascending order
            return dateA.getTime() - dateB.getTime(); // Ascending order
          });

        setData(filteredAndSortedData);
      } else {
        setData(null);
      }
    } catch (error) {
      setLoading(false);
      setShowResult(false);
      throw error;
    }
  };

  const [jenisPembayaran, setJenisPembayaran] =
    React.useState<string>("");
  const [jenisPelaksanaan, setJenisPelaksanaan] =
    React.useState<string>("");
  const [selectedProgramPelatihan, setSelectedProgramPelatihan] =
    React.useState<string>("");
  const [selectedBidangPelatihan, setSelectedBidangPelatihan] =
    React.useState<string>("");
  const [selectedBalaiPelatihan, setSelectedBalaiPelatihan] =
    React.useState<string>("");
  const [selectedBiayaPelatihan, setSelectedBiayaPelatihan] =
    React.useState<string>("");
  const [selectedBulanPelatihan, setSelectedBulanPelatihan] =
    React.useState<string>("");

  const [showResult, setShowResult] = React.useState<boolean>(false);

  const handleClearFilter = () => {
    setSelectedProgramPelatihan("");
    setSelectedBidangPelatihan("");
    setJenisPembayaran("");
    setSelectedBalaiPelatihan("");
    setSelectedBiayaPelatihan("");
    setSelectedBulanPelatihan("");
    setJenisPelaksanaan("");

    handleFetchingPublicTrainingData();
  };

  React.useEffect(() => {
    setLoading(true);

    // Function to start fetching every 20 seconds
    const intervalId = setInterval(() => {
      handleFetchingPublicTrainingData();
    }, 600000); // 1 minutes in milliseconds

    // Fetch data immediately on component mount
    handleFetchingPublicTrainingData().finally(() => setLoading(false));

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="relative w-full py-20 bg-[#020617] font-jakarta">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Search & Filter Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 bg-[#1e293b]/40 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden p-8 mb-16"
        >
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold font-calsans text-white tracking-tight">
              Filter dan Cari Pelatihan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Jenis Pembayaran */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Jenis Layanan</label>
                <Select
                  value={jenisPembayaran}
                  onValueChange={(value) => setJenisPembayaran(value)}
                >
                  <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 text-gray-300 rounded-xl focus:ring-blue-500/50 hover:bg-white/10 transition-all">
                    <div className="flex gap-2 items-center">
                      <HiViewGrid className="text-blue-400" />
                      <span className="text-sm">
                        {jenisPembayaran == "" ? "Pilih Jenis" : jenisPembayaran}
                      </span>
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

              {/* Lembaga Pelatihan */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Lemdiklat KP</label>
                <Select
                  value={selectedBalaiPelatihan}
                  onValueChange={(value) => setSelectedBalaiPelatihan(value)}
                >
                  <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 text-gray-300 rounded-xl focus:ring-blue-500/50 hover:bg-white/10 transition-all">
                    <div className="flex gap-2 items-center">
                      <RiSchoolLine className="text-blue-400" />
                      <span className="text-sm truncate">
                        {selectedBalaiPelatihan == "" ? "Pilih Balai" : selectedBalaiPelatihan}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-white z-[9999]">
                    <SelectGroup>
                      {BALAI_PELATIHAN.map((balai, idx) => (
                        <SelectItem key={idx} value={balai.Name}>{balai.Name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Jenis Pelaksanaan */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Pelaksanaan</label>
                <Select
                  value={jenisPelaksanaan}
                  onValueChange={(value) => setJenisPelaksanaan(value)}
                >
                  <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 text-gray-300 rounded-xl focus:ring-blue-500/50 hover:bg-white/10 transition-all">
                    <div className="flex gap-2 items-center">
                      <HiClock className="text-blue-400" />
                      <span className="text-sm">
                        {jenisPelaksanaan == "" ? "Pilih Metode" : jenisPelaksanaan}
                      </span>
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

              <div className="flex gap-2">
                {(jenisPembayaran !== "" || selectedBalaiPelatihan !== "" || jenisPelaksanaan !== "") && (
                  <Button
                    onClick={handleClearFilter}
                    variant="outline"
                    className="h-12 w-12 rounded-xl border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center p-0"
                  >
                    <MdClear size={20} />
                  </Button>
                )}
                <Button
                  onClick={handleFetchingPublicTrainingData}
                  className="h-12 flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Cari Pelatihan</span>
                  <FiSearch />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="w-full flex h-[40vh] items-center justify-center">
            <HashLoader color="#3b82f6" size={50} />
          </div>
        ) : (
          showResult && (
            <div className="space-y-6">
              {/* Results Table Header */}
              <div className="hidden md:grid grid-cols-5 gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                <div className="col-span-1">Informasi Pelatihan</div>
                <div className="text-center">Penyelenggara</div>
                <div className="text-center">Pelaksanaan</div>
                <div className="text-center">Waktu</div>
                <div className="text-center">Biaya & Action</div>
              </div>

              {data == null || data.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Image src="/illustrations/not-found.png" alt="Not Found" width={300} height={300} className="opacity-20 grayscale" />
                  <h3 className="text-2xl font-bold text-white mt-6 font-calsans">Belum Ada Pelatihan</h3>
                  <p className="text-gray-500 mt-2 text-center max-w-sm font-light">
                    Belum ada pelatihan yang tersedia untuk kriteria ini. Harap cek secara berkala!
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {data.map((pelatihan, index) => (
                    <CardPelatihan key={index} pelatihan={pelatihan} index={index} />
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative bg-[#1e293b]/20 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 p-6 rounded-[2.5rem] transition-all duration-300"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        {/* Info Pelatihan */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{pelatihan.BidangPelatihan}</span>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">{pelatihan.NamaPelatihan}</h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <FiCalendar className="text-blue-500" />
            <span className="truncate">Pendaftaran: {formatDateRange(pelatihan.TanggalMulaiPendaftaran, pelatihan.TanggalBerakhirPendaftaran)}</span>
          </div>
        </div>

        {/* Penyelenggara */}
        <div className="flex flex-col md:text-center gap-1">
          <span className="text-sm font-bold text-gray-200">{pelatihan.PenyelenggaraPelatihan}</span>
          <span className="text-xs text-gray-500 font-medium truncate">{pelatihan.LokasiPelatihan}</span>
        </div>

        {/* Metode */}
        <div className="flex flex-col items-start md:items-center gap-2">
          <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
            {pelatihan.PelaksanaanPelatihan}
          </div>
        </div>

        {/* Waktu Pelaksanaan */}
        <div className="flex flex-col md:text-center gap-1">
          <div className="flex flex-col items-start md:items-center gap-1">
            <span className="text-xs text-gray-400 font-medium">Mulai Pelatihan:</span>
            <span className="text-sm font-bold text-white">{pelatihan.TanggalMulaiPelatihan ? getMonthName(pelatihan.TanggalMulaiPelatihan) : "-"}</span>
            <span className="text-[10px] text-gray-500 tracking-tighter">{formatDateRange(pelatihan.TanggalMulaiPelatihan, pelatihan.TanggalBerakhirPelatihan)}</span>
          </div>
        </div>

        {/* Harga & Action */}
        <div className="flex flex-col md:items-center gap-4">
          <div className="text-left md:text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Investasi</span>
            <p className="text-xl font-bold text-white">
              {pelatihan.HargaPelatihan === 0 ? (
                <span className="text-teal-400">GRATIS</span>
              ) : (
                formatToRupiah(pelatihan.HargaPelatihan)
              )}
            </p>
          </div>

          <Link
            onClick={() => Cookies.set("JenisProgram", pelatihan?.JenisProgram)}
            href={`/layanan/pelatihan/${createSlug(pelatihan.NamaPelatihan)}/${pelatihan?.KodePelatihan}/${encryptValue(pelatihan?.IdPelatihan)}`}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex justify-center items-center gap-2 ${pelatihan?.StatusApproval == "Selesai"
                ? "bg-white/5 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
              }`}
          >
            {pelatihan.StatusApproval == "Selesai" ? "Sudah Selesai" : "Lihat Detail"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PencarianPelatihan;
