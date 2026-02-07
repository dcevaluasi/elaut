"use client";

import React from "react";
import { UserPelatihan } from "@/types/user";
import { IoMdCloseCircle } from "react-icons/io";
import { PiMicrosoftExcelLogoFill, PiQuestionFill } from "react-icons/pi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Link from "next/link";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import {
  ManningAgent,
  ManningAgentPelatihan,
  PelatihanMasyarakat,
} from "@/types/product";
import { HiMiniUserGroup, HiUserGroup } from "react-icons/hi2";
import Toast from "@/commons/Toast";
import axios, { AxiosError } from "axios";
import TableDataPesertaPelatihan from "../Pelatihan/TableDataPesertaPelatihan";
import TablelDataPesertaPelatihanManningAgent from "../Pelatihan/TablelDataPesertaPelatihanManningAgent";
import { TbDatabaseExport } from "react-icons/tb";
import { generateTanggalPelatihan } from "@/utils/text";
import { FiArrowRight, FiCheckCircle, FiClock, FiXCircle, FiInfo, FiUploadCloud, FiUsers } from "react-icons/fi";

export const TimelineProgressManningAgent = ({
  manningAgent,
  pelatihan,
  detailPelatihan,
}: {
  manningAgent: ManningAgentPelatihan;
  pelatihan: ManningAgentPelatihan;
  detailPelatihan: PelatihanMasyarakat;
}) => {
  const router = useRouter();

  const [isOpenFormPeserta, setIsOpenFormPeserta] = React.useState<boolean>(false);
  const [fileExcelPesertaPelatihan, setFileExcelPesertaPelatihan] = React.useState<File | null>(null);

  const handleFileChange = (e: any) => {
    setFileExcelPesertaPelatihan(e.target.files[0]);
  };

  const handleUploadImportPesertaPelatihan = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("IdMiningAgentPelatihan", manningAgent!.IdMiningAgentPelatihan.toString());

    if (fileExcelPesertaPelatihan != null) {
      formData.append("file", fileExcelPesertaPelatihan);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/manningAgent/exportDataUsersManingAgent`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF081")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const formDataSendUser = new FormData();
        formDataSendUser.append("IdMiningAgentPelatihan", manningAgent!.IdMiningAgentPelatihan.toString());

        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/manningAgent/sendUsersManingAgentToUsersPelatihan`,
          formDataSendUser,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("XSRF081")}`,
            },
          }
        );
      }

      Toast.fire({ icon: "success", title: `Berhasil mengupload peserta pelatihan!` });
      setIsOpenFormPeserta(false);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        Toast.fire({ icon: "error", title: `Data NIK atau Nomor Telepon sudah ada!` });
      } else {
        Toast.fire({ icon: "error", title: `Gagal mengupload peserta pelatihan!` });
      }
      setIsOpenFormPeserta(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (!manningAgent) return null;

  return (
    <section className="text-white">
      <div className="max-w-5xl py-12 mx-auto px-4 md:px-0">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Header Section */}
          <div className="md:w-1/4">
            <div className="sticky top-24 space-y-6">
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
              <h3 className="text-4xl font-calsans leading-tight tracking-tight">
                Progress <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Keagenan</span>
              </h3>
              <p className="text-sm font-light text-gray-400 leading-relaxed max-w-[200px]">
                Pantau status pelatihan kelompok dan kelola data peserta keagenan Anda.
              </p>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 space-y-10 relative"
          >
            {/* Vertical Line */}
            <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-blue-500/80 via-blue-500/20 to-transparent hidden sm:block" />

            {/* 1. Import Peserta */}
            <motion.div variants={itemVariants} className="relative sm:pl-16">
              <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center z-10 backdrop-blur-xl transition-all duration-500 hidden sm:flex ${pelatihan?.ManningAgentUsers.length > 0
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : "bg-white/5 border-white/10 text-gray-500"
                }`}>
                {pelatihan?.ManningAgentUsers.length > 0 ? <FiUsers size={24} /> : <FiClock size={24} />}
              </div>

              <div className="group bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-4 mb-3 sm:hidden">
                  <div className={`${pelatihan?.ManningAgentUsers.length > 0 ? "text-emerald-400" : "text-gray-500"}`}>
                    <FiUsers size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Step 01</span>
                </div>
                <h4 className="text-xl font-calsans mb-2 text-white">Manajemen Peserta</h4>
                <div className="text-sm text-gray-400 leading-relaxed">
                  {pelatihan?.ManningAgentUsers.length === 0 ? (
                    <div className="space-y-4">
                      <p>Harap unggah data peserta menggunakan template yang tersedia untuk memproses pendaftaran massal.</p>
                      <AlertDialog open={isOpenFormPeserta} onOpenChange={setIsOpenFormPeserta}>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl px-6 h-12 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2">
                            <FiUploadCloud /> Import via Excel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#020617]/95 backdrop-blur-2xl border border-white/10 text-white rounded-[2.5rem] p-8 max-w-lg shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                          <AlertDialogHeader className="space-y-4">
                            <AlertDialogTitle className="text-2xl font-calsans flex items-center gap-3">
                              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><PiMicrosoftExcelLogoFill size={24} /></div>
                              Import Data Peserta
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Pastikan file Excel Anda sudah sesuai dengan format template platform E-LAUT.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-6 space-y-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">File Excel (.xlsx)</label>
                              <div className="flex flex-col gap-3">
                                <Input
                                  type="file"
                                  onChange={handleFileChange}
                                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-emerald-500"
                                />
                                <Link
                                  target="_blank"
                                  href="https://docs.google.com/spreadsheets/d/12t7l4bBjPBcxXpCPPOqYeTDoZxBi5aS7/export?format=xlsx"
                                  className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 transition-all"
                                >
                                  <FiInfo /> Unduh Template Standar
                                </Link>
                              </div>
                            </div>
                          </div>
                          <AlertDialogFooter className="gap-3">
                            <AlertDialogCancel className="bg-white/5 border-white/10 text-gray-400 rounded-xl h-12">Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleUploadImportPesertaPelatihan} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-12 font-bold px-8">Mulai Import</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/5 p-4 rounded-xl border border-emerald-400/10">
                        <FiCheckCircle />
                        <span>{pelatihan?.ManningAgentUsers.length} Peserta telah terdaftar dalam sistem.</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-blue-400 font-bold rounded-xl h-12 px-6 flex items-center gap-2 w-full md:w-fit">
                            <FiUsers /> Detail Daftar Peserta
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl bg-[#020617]/98 backdrop-blur-2xl border-white/10 text-white rounded-[2rem] p-10 max-h-[90vh] overflow-y-auto">
                          <DialogHeader className="mb-8">
                            <div className="flex items-center gap-4">
                              <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400"><FiUsers size={32} /></div>
                              <div>
                                <DialogTitle className="text-3xl font-calsans">Daftar Peserta Pelatihan</DialogTitle>
                                <DialogDescription className="text-gray-500 mt-1">{detailPelatihan?.NamaPelatihan}</DialogDescription>
                              </div>
                            </div>
                          </DialogHeader>
                          <div className="space-y-6">
                            <TablelDataPesertaPelatihanManningAgent data={pelatihan!.ManningAgentUsers!} />
                            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl space-y-2">
                              <p className="text-xs font-bold text-blue-400 uppercase">Informasi Akses Peserta:</p>
                              <p className="text-xs text-gray-400 leading-relaxed italic">*Informasikan peserta untuk mereset password menggunakan NIK jika mereka baru pertama kali terdaftar. Login menggunakan Nomor Telepon yang telah didaftarkan.</p>
                            </div>
                          </div>
                          <DialogFooter className="mt-8">
                            <Button className="bg-blue-600 hover:bg-blue-500 font-bold h-12 rounded-xl flex items-center gap-2">
                              <TbDatabaseExport /> Export Spreadsheet
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 2. Validasi Akun */}
            <motion.div variants={itemVariants} className="relative sm:pl-16">
              <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center z-10 backdrop-blur-xl transition-all duration-500 hidden sm:flex ${pelatihan?.ManningAgentUsers.length > 0
                  ? "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "bg-white/5 border-white/10 text-gray-500"
                }`}>
                <FiCheckCircle size={24} />
              </div>

              <div className="group bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
                <h4 className="text-xl font-calsans mb-2">Verifikasi Berkala</h4>
                <div className="text-sm text-gray-400 leading-relaxed font-light">
                  {manningAgent?.Keterangan === "Valid" ? (
                    <p className="text-emerald-400 font-medium flex items-center gap-2">
                      <FiCheckCircle /> Seluruh data keagenan telah diverifikasi oleh Balai Pelatihan.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <p>Proses verifikasi dilakukan oleh operator Balai secara kolektif untuk memastikan seluruh persyaratan terpenuhi.</p>
                      <div className="bg-amber-400/5 border border-amber-400/10 p-4 rounded-xl text-amber-400/80 flex items-center gap-3">
                        <FiClock className="shrink-0" />
                        <span className="text-xs">Estimasi verifikasi data baru: 1x24 jam operasional.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 3. Masa Pelaksanaan */}
            <motion.div variants={itemVariants} className="relative sm:pl-16">
              <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center z-10 backdrop-blur-xl transition-all duration-500 hidden sm:flex ${detailPelatihan!.StatusApproval === "Selesai"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : "bg-blue-500/10 border-blue-500/50 text-blue-400"
                }`}>
                {detailPelatihan!.StatusApproval === "Selesai" ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
              </div>

              <div className="group bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h4 className="text-xl font-calsans">Jadwal Pelaksanaan</h4>
                  <span className="text-[10px] px-4 py-1.5 bg-white/5 border border-white/10 rounded-full font-bold tracking-[0.2em] uppercase text-blue-400 shrink-0 text-center">
                    {detailPelatihan!.PelaksanaanPelatihan}
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <FiClock size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Rentang Waktu</div>
                    <div className="text-sm font-medium text-white">
                      {generateTanggalPelatihan(detailPelatihan!.TanggalMulaiPelatihan)} — {generateTanggalPelatihan(detailPelatihan!.TanggalBerakhirPelatihan)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {["Ujian Pre-Test", "Sesi Teori/Praktek", "Ujian Post-Test"].map((step, i) => (
                    <div key={i} className="px-3 py-2 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-gray-500 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {step}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 4. Sertifikat Peserta */}
            <motion.div variants={itemVariants} className="relative sm:pl-16">
              <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center z-10 backdrop-blur-xl transition-all duration-500 hidden sm:flex ${detailPelatihan!.StatusApproval === "Selesai" && detailPelatihan.NoSertifikat !== ""
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : "bg-white/5 border-white/10 text-gray-500"
                }`}>
                {detailPelatihan!.StatusApproval === "Selesai" && detailPelatihan.NoSertifikat !== "" ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
              </div>

              <div className="group bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
                <h4 className="text-xl font-calsans mb-4">Output Kelulusan</h4>
                <p className="text-sm text-gray-400 leading-relaxed font-light mb-6">
                  {detailPelatihan!.StatusApproval === "Selesai" && detailPelatihan.NoSertifikat !== ""
                    ? "Seluruh peserta keagenan Anda telah menyelesaikan rangkaian pelatihan. Sertifikat kini tersedia di masing-masing dashboard peserta."
                    : "Sertifikat digital akan diterbitkan untuk setiap peserta yang dinyatakan kompeten pada akhir sesi paska uji."}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400/80 uppercase tracking-widest">
                  <FiInfo /> Pantau status lewat detail peserta
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
