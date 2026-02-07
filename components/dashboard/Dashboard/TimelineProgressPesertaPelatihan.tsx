"use client";

import React from "react";
import { UserPelatihan } from "@/types/user";
import { IoMdCloseCircle } from "react-icons/io";
import { PiQuestionFill } from "react-icons/pi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Link from "next/link";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

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
import Toast from "@/commons/Toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createSlug } from "@/utils";
import { PelatihanMasyarakat } from "@/types/product";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { generateTanggalPelatihan } from "@/utils/text";
import { IoReloadCircle } from "react-icons/io5";
import { isDatePassedOrToday } from "@/lib/times";
import { FiArrowRight, FiCheckCircle, FiClock, FiXCircle, FiInfo } from "react-icons/fi";

export const TimelineProgressPesertaPelatihan = ({
  userDetail,
  pelatihan,
}: {
  userDetail: UserPelatihan;
  pelatihan: PelatihanMasyarakat;
}) => {
  const router = useRouter();
  const [codeAccess, setCodeAccess] = React.useState<string>("");
  const [isOpenGuideline, setIsOpenGuideline] = React.useState<boolean>(true);

  const handleDirectToExam = async (e: any) => {
    if (codeAccess !== "") {
      if (codeAccess !== userDetail!.CodeAksess) {
        Toast.fire({ icon: "error", title: `Kode akses tidak terdaftar!` });
        setCodeAccess("");
      } else {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/lemdik/AuthExam`,
            { code_akses: codeAccess, type_exam: "PreTest" }
          );

          if (response.status === 200) {
            Cookies.set("XSRF089999", response.data.t);
            Toast.fire({ icon: "success", title: `Selamat mengerjakan pre-test!` });
            setCodeAccess("");
            router.replace(
              `/layanan/pelatihan/${createSlug(pelatihan!.NamaPelatihan)}/${pelatihan!.KodePelatihan!}/${pelatihan!.IdPelatihan!}/pre-test/${userDetail!.CodeAksess}`
            );
          }
        } catch (error) {
          Toast.fire({ icon: "error", title: `Kendala pada server!` });
        }
      }
    } else {
      Toast.fire({ icon: "error", title: `Harap masukkan kode akses!` });
    }
  };

  const handleDirectToExamPostTest = async (e: any) => {
    if (codeAccess !== "") {
      if (codeAccess !== userDetail!.CodeAksess) {
        Toast.fire({ icon: "error", title: `Kode akses tidak terdaftar!` });
        setCodeAccess("");
      } else {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/lemdik/AuthExam`,
            { code_akses: codeAccess, type_exam: "PostTest" }
          );

          if (response.status === 200) {
            Cookies.set("XSRF089999", response.data.t);
            Toast.fire({ icon: "success", title: `Selamat mengerjakan post-test!` });
            setCodeAccess("");
            router.replace(
              `/layanan/pelatihan/${createSlug(pelatihan!.NamaPelatihan)}/${pelatihan!.KodePelatihan!}/${pelatihan!.IdPelatihan!}/post-test/${userDetail!.CodeAksess}`
            );
          }
        } catch (error) {
          Toast.fire({ icon: "error", title: `Kendala pada server!` });
        }
      }
    } else {
      Toast.fire({ icon: "error", title: `Harap masukkan kode akses!` });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Belajar</span>
              </h3>
              <p className="text-sm font-light text-gray-400 leading-relaxed max-w-[200px]">
                Pantau pencapaian dan aktivitas Anda secara real-time di platform E-LAUT.
              </p>
            </div>
          </div>

          {/* Timeline Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 space-y-10 relative"
          >
            {/* Vertical Line */}
            <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-blue-500/80 via-blue-500/20 to-transparent hidden sm:block" />

            {/* 1. Validasi */}
            <motion.div variants={itemVariants} className="relative sm:pl-16">
              <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center z-10 backdrop-blur-xl transition-all duration-500 hidden sm:flex ${userDetail!.Keterangan === "Valid"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : userDetail!.Keterangan === "Tidak Valid"
                    ? "bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                    : "bg-white/5 border-white/10 text-gray-500"
                }`}>
                {userDetail!.Keterangan === "Valid" ? <FiCheckCircle size={24} /> : userDetail!.Keterangan === "Tidak Valid" ? <FiXCircle size={24} /> : <FiClock size={24} />}
              </div>

              <div className="group bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-4 mb-3 sm:hidden">
                  <div className={`${userDetail!.Keterangan === "Valid" ? "text-emerald-400" : userDetail!.Keterangan === "Tidak Valid" ? "text-rose-400" : "text-gray-500"}`}>
                    {userDetail!.Keterangan === "Valid" ? <FiCheckCircle size={24} /> : userDetail!.Keterangan === "Tidak Valid" ? <FiXCircle size={24} /> : <FiClock size={24} />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Step 01</span>
                </div>
                <h4 className="text-xl font-calsans mb-2 text-white">Verifikasi Dokumen</h4>
                <div className="text-sm text-gray-400 leading-relaxed">
                  {userDetail?.Keterangan === "Valid" ? (
                    <p>Dokumen pendaftaran Anda telah diverifikasi oleh tim operator. Anda siap untuk lanjut ke tahap berikutnya.</p>
                  ) : userDetail?.Keterangan === "Tidak Valid" ? (
                    <div className="space-y-4">
                      <p className="text-rose-400 font-medium">Dokumen memerlukan perbaikan:</p>
                      <div dangerouslySetInnerHTML={{ __html: userDetail?.StatusPembayaran! }} className="text-xs bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl italic leading-relaxed" />
                      <Link
                        onClick={() => Cookies.set("isEditValiditas", "true")}
                        href="/dashboard/edit-profile"
                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 group/link"
                      >
                        Lengkapi Ulang Dokumen <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400/80 bg-amber-400/5 p-4 rounded-xl border border-amber-400/10">
                      <FiInfo size={18} />
                      <span>Tim kami sedang memverifikasi data Anda. Harap tunggu dalam 24 jam.</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 2. Pre-Test */}
            {pelatihan!.UjiKompotensi !== "Tidak Ada Penilaian Teknis" && (
              <motion.div variants={itemVariants} className="relative sm:pl-16">
                <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center z-10 backdrop-blur-xl transition-all duration-500 hidden sm:flex ${userDetail.PreTest > 0
                    ? "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    : "bg-white/5 border-white/10 text-gray-500"
                  }`}>
                  {userDetail.PreTest > 0 ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
                </div>

                <div className="group bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-3 sm:hidden">
                    <div className={`${userDetail.PreTest > 0 ? "text-blue-400" : "text-gray-500"}`}>
                      {userDetail.PreTest > 0 ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Step 02</span>
                  </div>
                  <h4 className="text-xl font-calsans mb-4">Evaluasi Awal (Pre-Test)</h4>
                  {userDetail.PreTest === 0 ? (
                    <div className="space-y-5">
                      <p className="text-sm text-gray-400 leading-relaxed font-light">
                        Tahap ini bertujuan untuk mengukur pemahaman awal Anda terhadap materi pelatihan yang akan diberikan.
                      </p>
                      {userDetail.Keterangan === "Valid" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              onClick={() => setCodeAccess(userDetail.CodeAksess!)}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl px-8 h-12 shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                              Mulai Ujian <FiArrowRight />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#020617]/95 backdrop-blur-2xl border border-white/10 text-white rounded-[2.5rem] p-10 max-w-lg shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                            <AlertDialogHeader className="items-center text-center space-y-6">
                              <div className="w-24 h-24 rounded-3xl bg-blue-500/20 flex items-center justify-center overflow-hidden border border-blue-500/30">
                                <Logo />
                              </div>
                              <div className="space-y-2">
                                <AlertDialogTitle className="text-3xl font-calsans tracking-tight">Pre-Test Pelatihan</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400 text-sm leading-relaxed">
                                  {isOpenGuideline ? "Pastikan Anda memahami tata tertib pengerjaan ujian berikut." : "Konfirmasi kode akses untuk memulai sinkronisasi."}
                                </AlertDialogDescription>
                              </div>
                            </AlertDialogHeader>
                            <div className="py-8">
                              {isOpenGuideline ? (
                                <div className="grid grid-cols-1 gap-3">
                                  {[
                                    "Gunakan perangkat dengan koneksi stabil.",
                                    "Waktu maksimal pengerjaan adalah 15 menit.",
                                    "Pilih satu jawaban yang paling tepat.",
                                    "Dilarang berpindah tab browser saat ujian."
                                  ].map((text, i) => (
                                    <div key={i} className="flex gap-3 text-sm text-gray-300 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
                                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold">{i + 1}</div>
                                      <p>{text}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-10 space-y-4">
                                  <div className="text-xl font-calsans text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sinkronisasi Siap</div>
                                  <p className="text-xs text-gray-500 max-w-[250px] mx-auto italic">Klik tombol di bawah untuk membuka lembar jawaban digital Anda.</p>
                                </div>
                              )}
                            </div>
                            <AlertDialogFooter className="flex-col sm:flex-col gap-3">
                              {isOpenGuideline ? (
                                <Button onClick={() => setIsOpenGuideline(false)} className="w-full bg-blue-600 hover:bg-blue-500 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all">Lanjut Pengerjaan</Button>
                              ) : (
                                <AlertDialogAction
                                  onClick={handleDirectToExam}
                                  className="w-full bg-emerald-600 hover:bg-emerald-500 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20 transition-all"
                                >
                                  Mulai Sekarang
                                </AlertDialogAction>
                              )}
                              <AlertDialogCancel className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 h-14 rounded-2xl transition-all">Nanti Saja</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <p className="text-xs italic text-gray-500">Tombol ujian akan terbuka secara otomatis setelah dokumen Anda valid.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <TablePenilaian userDetail={userDetail} type="Pre-Test" />
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider ${userDetail.PreTest >= 65 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"}`}>
                        {userDetail.PreTest >= 65 ? "Hasil Memuaskan" : "Membutuhkan Peningkatan"}
                      </div>
                      <p className="text-xs text-gray-500 font-light leading-relaxed">
                        {userDetail.PreTest >= 65
                          ? "Skor Anda berada di atas rata-rata. Pertahankan fokus Anda pada materi teknis."
                          : "Jangan berkecil hati. Manfaatkan materi pelatihan untuk memperdalam pemahaman sebelum Post-Test."}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. Masa Pelaksanaan */}
            <motion.div variants={itemVariants} className="relative sm:pl-16">
              <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center z-10 backdrop-blur-xl transition-all duration-500 hidden sm:flex ${isDatePassedOrToday(pelatihan!.TanggalBerakhirPelatihan)
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : "bg-blue-500/10 border-blue-500/50 text-blue-400"
                }`}>
                {isDatePassedOrToday(pelatihan!.TanggalBerakhirPelatihan) ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
              </div>

              <div className="group bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-4 mb-3 sm:hidden">
                  <div className={`${isDatePassedOrToday(pelatihan!.TanggalBerakhirPelatihan) ? "text-emerald-400" : "text-blue-400"}`}>
                    {isDatePassedOrToday(pelatihan!.TanggalBerakhirPelatihan) ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Step 03</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h4 className="text-xl font-calsans">Sesi Pelatihan</h4>
                  <span className="text-[10px] px-4 py-1.5 bg-white/5 border border-white/10 rounded-full font-bold tracking-[0.2em] uppercase text-blue-400 shrink-0 text-center">
                    {pelatihan!.PelaksanaanPelatihan}
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <FiClock size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Durasi Pelatihan</div>
                    <div className="text-sm font-medium text-white">
                      {generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan)} — {generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan)}
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-sm text-gray-400 leading-relaxed font-light">
                  {isDatePassedOrToday(pelatihan!.TanggalBerakhirPelatihan)
                    ? "Rangkaian materi pelatihan telah selesai disampaikan seluruhnya."
                    : "Pastikan Anda hadir di setiap sesi untuk mendapatkan pemahaman materi yang komprehensif."}
                </p>
              </div>
            </motion.div>

            {/* 4. Post-Test */}
            {pelatihan!.UjiKompotensi !== "Tidak Ada Penilaian Teknis" && (
              <motion.div variants={itemVariants} className="relative sm:pl-16">
                <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center z-10 backdrop-blur-xl transition-all duration-500 hidden sm:flex ${userDetail.PostTest > 0
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "bg-white/5 border-white/10 text-gray-500"
                  }`}>
                  {userDetail.PostTest > 0 ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
                </div>

                <div className="group bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-3 sm:hidden">
                    <div className={`${userDetail.PostTest > 0 ? "text-emerald-400" : "text-gray-500"}`}>
                      {userDetail.PostTest > 0 ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Step 04</span>
                  </div>
                  <h4 className="text-xl font-calsans mb-4">Ujian Akhir (Post-Test)</h4>
                  {userDetail.PostTest === 0 ? (
                    <div className="space-y-5">
                      <p className="text-sm text-gray-400 leading-relaxed font-light">
                        Evaluasi ini menentukan tingkat penguasaan kompetensi Anda setelah mengikuti pelatihan.
                      </p>
                      {userDetail.Keterangan === "Valid" && userDetail.PreTest > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              onClick={() => setCodeAccess(userDetail.CodeAksess!)}
                              disabled={pelatihan.StatusApproval !== "Selesai"}
                              className={`font-bold rounded-2xl px-8 h-12 shadow-lg transition-all active:scale-95 flex items-center gap-2 ${pelatihan.StatusApproval === "Selesai"
                                  ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                                  : "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
                                }`}
                            >
                              {pelatihan.StatusApproval === "Selesai" ? "Mulai Post-Test" : "Menunggu Sesi Dibuka"} <FiArrowRight />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#020617]/95 backdrop-blur-2xl border border-white/10 text-white rounded-[2.5rem] p-10 max-w-lg shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                            <AlertDialogHeader className="items-center text-center space-y-6">
                              <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 flex items-center justify-center overflow-hidden border border-emerald-500/30 text-emerald-400">
                                <Logo />
                              </div>
                              <div className="space-y-2">
                                <AlertDialogTitle className="text-3xl font-calsans tracking-tight">Post-Test Final</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400 text-sm leading-relaxed">
                                  Lakukan verifikasi terakhir sebelum memulai evaluasi akhir.
                                </AlertDialogDescription>
                              </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-col gap-3 py-6">
                              <AlertDialogAction
                                onClick={handleDirectToExamPostTest}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20 transition-all"
                              >
                                Konfirmasi & Mulai Ujian
                              </AlertDialogAction>
                              <AlertDialogCancel className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 h-14 rounded-2xl transition-all">Kembali</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <TablePenilaian userDetail={userDetail} type="Post-Test" />
                      <div className="flex flex-col gap-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider w-fit ${userDetail.PostTest >= 65 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
                          {userDetail.PostTest >= 65 ? "Status: Kompeten" : "Status: Belum Kompeten"}
                        </div>
                        {userDetail.PostTest < 65 && !userDetail.FileSertifikat.includes('Signed') && (
                          <motion.div whileHover={{ scale: 1.02 }}>
                            <Button
                              variant="outline"
                              className="bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-all rounded-2xl w-full md:w-fit h-12 px-6 flex items-center gap-2 font-bold"
                              onClick={() => {
                                Toast.fire({ icon: 'info', title: 'Silahkan hubungi tim pengajar untuk sinkronisasi jadwal remedial.' });
                              }}
                            >
                              <IoReloadCircle size={20} /> Jadwalkan Remedial
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 5. Sertifikat */}
            <motion.div variants={itemVariants} className="relative sm:pl-16">
              <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center z-10 backdrop-blur-xl transition-all duration-500 hidden sm:flex ${pelatihan?.StatusPenerbitan === "Done"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : "bg-white/5 border-white/10 text-gray-500"
                }`}>
                {pelatihan?.StatusPenerbitan === "Done" ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
              </div>

              <div className="group bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-4 mb-3 sm:hidden">
                  <div className={`${pelatihan?.StatusPenerbitan === "Done" ? "text-emerald-400" : "text-gray-500"}`}>
                    {pelatihan?.StatusPenerbitan === "Done" ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Step 05</span>
                </div>
                <h4 className="text-xl font-calsans mb-4 items-center flex gap-2">
                  Sertifikat Digital
                  {pelatihan?.StatusPenerbitan === 'Done' && <RiVerifiedBadgeFill className="text-emerald-400" />}
                </h4>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl mb-6">
                  <p className="text-sm text-gray-400 leading-relaxed font-light">
                    {pelatihan!.StatusPenerbitan !== "Done"
                      ? "Penerbitan sertifikat elektronik dilakukan secara kolektif setelah rangkaian verifikasi administrasi selesai."
                      : userDetail?.FileSertifikat.includes('signed')
                        ? "Sertifikat peninggalan kompetensi Anda telah siap. Dokumen ini asli dan telah ditandatangani secara elektronik (BSrE)."
                        : "Dokumen Anda sedang dalam antrean proses tanda tangan elektronik (TTE). Mohon tunggu maksimal 3x24 jam."}
                  </p>
                </div>

                <AnimatePresence>
                  {userDetail!.FileSertifikat.includes('signed') && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${userDetail!.FileSertifikat}`}
                        target="_blank"
                        className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-700 text-white font-bold text-base shadow-xl shadow-emerald-900/40 hover:shadow-emerald-900/60 transition-all ring-1 ring-white/20"
                      >
                        <RiVerifiedBadgeFill size={20} /> Unduh Sertifikat Resmi
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TablePenilaian = ({
  userDetail,
  type,
}: {
  userDetail: UserPelatihan;
  type: string;
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <table className="w-full text-center text-sm border-collapse">
        <thead className="bg-white/5 text-[10px] uppercase tracking-[0.2em] font-extrabold text-blue-400">
          <tr>
            <th className="px-6 py-4 border-r border-white/10 text-left">Komponen</th>
            <th className="px-6 py-4">Skor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white">
          <tr className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4 border-r border-white/10 text-left text-gray-400 font-light">{type}</td>
            <td className="px-6 py-4">
              <span className="text-xl font-calsans text-white tracking-wider">
                {type === "Pre-Test" ? userDetail!.PreTest : userDetail!.PostTest}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
