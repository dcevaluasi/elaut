"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { HashLoader } from "react-spinners";
import {
  TbSchool, TbClock, TbFileText, TbArrowRight, TbArrowLeft, TbCheck,
  TbInfoCircle, TbLayoutGrid, TbCurrencyDollar, TbMapPin, TbPlus,
  TbAlertCircle, TbCalendar, TbBuildingCommunity, TbAward, TbListCheck,
} from "react-icons/tb";
import { RiVerifiedBadgeLine } from "react-icons/ri";
import { FiCheckCircle, FiCircle } from "react-icons/fi";

import Toast from "@/commons/Toast";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { generateRandomString } from "@/utils";
import { generateTimestamp } from "@/utils/time";
import { UPT } from "@/constants/nomenclatures";
import {
  DUKUNGAN_PROGRAM_TEROBOSAN, JENIS_PELAKSANAAN,
  JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN, JENIS_PENILAIAN_PELATIHAN,
  PENANDATANGAN_SERTIFIKAT, SEKTOR_PELATIHAN,
} from "@/constants/pelatihan";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { RumpunPelatihan } from "@/types/program";
import addData from "@/firebase/firestore/addData";

// ─── Step Config ──────────────────────────────────────────────────────────────
const STEPS = [
  { title: "Identitas", icon: TbSchool, desc: "Nama & lokasi kegiatan" },
  { title: "Klasifikasi", icon: TbLayoutGrid, desc: "Sektor, klaster & program" },
  { title: "Strategis", icon: RiVerifiedBadgeLine, desc: "Biaya, mode & penilaian" },
  { title: "Jadwal", icon: TbCalendar, desc: "Waktu pelaksanaan" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRupiah(v: number) {
  if (!v) return "";
  return new Intl.NumberFormat("id-ID").format(v);
}

// ─── Main Component ───────────────────────────────────────────────────────────
function FormPelatihan({ edit = false, onSuccess }: { edit: boolean; onSuccess?: () => void }) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("XSRF091");
  const penyelenggara = Cookies.get("Satker");

  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [kodePelatihan] = useState(generateRandomString());
  const [namaPelatihan, setNamaPelatihan] = useState("");
  const [namaPelatihanInggris, setNamaPelatihanInggris] = useState("");
  const [penyelenggaraPelatihan, setPenyelenggaraPelatihan] = useState(penyelenggara || "");
  const [jenisPelatihan, setJenisPelatihan] = useState("");
  const [bidangPelatihan, setBidangPelatihan] = useState("");
  const [dukunganProgramTerobosan, setDukunganProgramTerobosan] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalBerakhir, setTanggalBerakhir] = useState("");
  const [hargaPelatihan, setHargaPelatihan] = useState<number>(0);
  const [lokasiPelatihan, setLokasiPelatihan] = useState("");
  const [pelaksanaanPelatihan, setPelaksanaanPelatihan] = useState("");
  const [ujiKompetensi, setUjiKompetensi] = useState("");
  const [jenisSertifikat] = useState("");
  const [program, setProgram] = useState("");
  const [jenisProgram, setJenisProgram] = useState("");

  const { data: dataRumpunPelatihan } = useFetchDataRumpunPelatihan();
  const [selectedRumpun, setSelectedRumpun] = useState<RumpunPelatihan | null>(null);

  // ── Validation per step ────────────────────────────────────────────────────
  const step0Valid = !!(namaPelatihan && lokasiPelatihan && penyelenggaraPelatihan);
  const step1Valid = !!(jenisProgram && bidangPelatihan && program);
  const step2Valid = !!(jenisPelatihan && dukunganProgramTerobosan && pelaksanaanPelatihan && ujiKompetensi && (jenisPelatihan !== "PNBP/BLU - Berbayar" || hargaPelatihan > 0));
  const step3Valid = !!(tanggalMulai && tanggalBerakhir);

  const stepValid = [step0Valid, step1Valid, step2Valid, step3Valid];
  const canContinue = stepValid[currentStep];

  // Missing fields hints per step
  const step0Missing = [
    !namaPelatihan && "Nama Kegiatan",
    !lokasiPelatihan && "Lokasi Pelatihan",
    !penyelenggaraPelatihan && "Penyelenggara",
  ].filter(Boolean) as string[];

  const step1Missing = [
    !jenisProgram && "Sektor Pelatihan",
    !bidangPelatihan && "Klaster / Rumpun",
    !program && "Program Pelatihan",
  ].filter(Boolean) as string[];

  const step2Missing = [
    !jenisPelatihan && "Sumber Pembiayaan",
    !dukunganProgramTerobosan && "Program Prioritas",
    !pelaksanaanPelatihan && "Mode Pelaksanaan",
    !ujiKompetensi && "Jenis Penilaian",
    jenisPelatihan === "PNBP/BLU - Berbayar" && !hargaPelatihan && "Biaya Pelatihan",
  ].filter(Boolean) as string[];

  const step3Missing = [
    !tanggalMulai && "Tanggal Mulai",
    !tanggalBerakhir && "Tanggal Berakhir",
  ].filter(Boolean) as string[];

  const allMissing = [step0Missing, step1Missing, step2Missing, step3Missing];

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step3Valid) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append("KodePelatihan", kodePelatihan);
    fd.append("NamaPelatihan", namaPelatihan);
    fd.append("NamaPelathanInggris", namaPelatihanInggris);
    fd.append("PenyelenggaraPelatihan", penyelenggaraPelatihan);
    fd.append("JenisPelatihan", jenisPelatihan);
    fd.append("BidangPelatihan", bidangPelatihan);
    fd.append("DukunganProgramTerobosan", dukunganProgramTerobosan);
    fd.append("TanggalMulaiPelatihan", tanggalMulai);
    fd.append("TanggalBerakhirPelatihan", tanggalBerakhir);
    fd.append("HargaPelatihan", hargaPelatihan.toString());
    fd.append("Program", program);
    fd.append("JenisProgram", jenisProgram);
    fd.append("Status", "Proses Buka Kelas");
    fd.append("UjiKompetensi", ujiKompetensi);
    fd.append("LokasiPelatihan", lokasiPelatihan);
    fd.append("PelaksanaanPelatihan", pelaksanaanPelatihan);
    fd.append("StatusPenerbitan", "0");
    fd.append("PemberitahuanDiterima", "Proses Buka Kelas");
    fd.append("AsalPelatihan", "Masyarakat");
    fd.append("JenisSertifikat", jenisSertifikat);
    fd.append("TtdSertifikat", PENANDATANGAN_SERTIFIKAT[1]);
    try {
      await axios.post(`${baseUrl}/lemdik/createPelatihan`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      await addData("historical-training-notes", kodePelatihan, {
        historical: [{ created_at: generateTimestamp(), id: kodePelatihan, notes: `Membuka kelas pelatihan ${namaPelatihan}`, role: Cookies.get("Role"), upt: `${Cookies.get("Nama")} - ${Cookies.get("Satker")}` }],
        status: "On Progress",
      });
      Toast.fire({ icon: "success", title: "Kelas berhasil dibuka!", text: `Pelatihan "${namaPelatihan}" telah ditambahkan.` });
      if (onSuccess) onSuccess(); else router.push("/admin/lemdiklat/pelatihan");
    } catch {
      Toast.fire({ icon: "error", title: "Gagal menyimpan", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setIsUploading(false);
    }
  };

  const nextStep = () => canContinue && currentStep < STEPS.length - 1 && setCurrentStep(p => p + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(p => p - 1);

  // ── Loading overlay ────────────────────────────────────────────────────────
  if (isUploading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-5">
        <HashLoader color="#3b82f6" size={56} />
        <div className="text-center space-y-1">
          <p className="text-blue-500 font-bold text-sm">Membuka kelas pelatihan...</p>
          <p className="text-slate-400 text-xs">Mohon tunggu, data sedang disimpan</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full font-jakarta">
      <div className="w-full mx-auto">
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[32px] border border-gray-100 dark:border-white/[0.06] shadow-2xl overflow-hidden">

          {/* ── Top Banner ────────────────────────────────────────────── */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400" />

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/[0.05]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/15">
                  <ActivityIcon size={11} className="text-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Buka Kelas Baru</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Buka Kelas <span className="text-blue-600 dark:text-blue-400">Pelatihan</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Lengkapi 4 langkah berikut untuk menginisialisasi program pelatihan baru.
                </p>
              </div>
              {/* Step counter badge */}
              <div className="flex items-center gap-3 shrink-0 bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-2xl border border-slate-100 dark:border-white/[0.05]">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                  <span className="text-base font-black">0{currentStep + 1}</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Langkah</p>
                  <p className="text-sm font-black text-slate-800 dark:text-white">{STEPS[currentStep].title}</p>
                  <p className="text-[10px] text-slate-400">{STEPS[currentStep].desc}</p>
                </div>
              </div>
            </div>

            {/* ── Step Progress Bar ─────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-3">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const done = idx < currentStep;
                const active = idx === currentStep;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="relative h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                        animate={{ width: done ? "100%" : active ? "60%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${done ? "bg-emerald-500" : active ? "bg-blue-600" : "bg-slate-200 dark:bg-white/10"}`}>
                        {done ? <TbCheck size={11} className="text-white" /> : <Icon size={11} className={active ? "text-white" : "text-slate-400"} />}
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-wider leading-none ${done ? "text-emerald-500" : active ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>{step.title}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-none hidden md:block">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Form Body ──────────────────────────────────────────────── */}
          <div className="p-6 md:p-10">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className=" flex flex-col"
                >
                  {/* ── STEP 0: Identitas ─────────────────────────────── */}
                  {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                      <Field label="Nama Kegiatan Pelatihan" required icon={<TbSchool className="text-blue-500" />}
                        hint="Gunakan penamaan formal. Nama ini akan tercetak di sertifikat peserta.">
                        <input
                          type="text"
                          placeholder="Contoh: Pelatihan Teknis Budidaya Laut"
                          value={namaPelatihan}
                          onChange={(e) => setNamaPelatihan(e.target.value.toUpperCase())}
                          className={inputCls(!!namaPelatihan)}
                        />
                        <ValidationMsg show={!namaPelatihan} msg="Nama kegiatan wajib diisi" />
                      </Field>

                      <Field label="Lokasi Pelaksanaan" required icon={<TbMapPin className="text-emerald-500" />}
                        hint="Tulis kota atau nama unit pelaksana. Contoh: BPPP Medan, Online (Zoom).">
                        <input
                          type="text"
                          placeholder="Contoh: BPPP Medan / Online"
                          value={lokasiPelatihan}
                          onChange={(e) => setLokasiPelatihan(e.target.value)}
                          className={inputCls(!!lokasiPelatihan)}
                        />
                        <ValidationMsg show={!lokasiPelatihan} msg="Lokasi wajib diisi" />
                      </Field>

                      <Field label="Unit Penyelenggara" required className="md:col-span-2"
                        icon={<TbBuildingCommunity className="text-indigo-500" />}
                        hint="Pilih unit kerja yang bertanggung jawab atas pelaksanaan pelatihan ini.">
                        <Select value={penyelenggaraPelatihan} onValueChange={setPenyelenggaraPelatihan}>
                          <SelectTrigger className={selectCls(!!penyelenggaraPelatihan)}>
                            <SelectValue placeholder="Pilih unit penyelenggara..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                            <SelectGroup>
                              <SelectLabel className="text-[10px] text-slate-400 uppercase tracking-widest px-3 py-2">Unit Pelaksana Teknis (UPT)</SelectLabel>
                              {UPT.map((item, i) => <SelectItem key={i} value={item} className="text-xs font-semibold py-2.5">{item}</SelectItem>)}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <ValidationMsg show={!penyelenggaraPelatihan} msg="Pilih unit penyelenggara" />
                      </Field>

                    </div>
                  )}

                  {/* ── STEP 1: Klasifikasi ───────────────────────────── */}
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      <Field label="Sektor / Jenis Program" required icon={<TbLayoutGrid className="text-blue-500" />}
                        hint="Kelompok besar bidang pelatihan berdasarkan sektor KP.">
                        <Select value={jenisProgram} onValueChange={setJenisProgram}>
                          <SelectTrigger className={selectCls(!!jenisProgram)}>
                            <SelectValue placeholder="Pilih sektor program..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {SEKTOR_PELATIHAN.map((item, i) => <SelectItem key={i} value={item} className="font-semibold text-xs py-2.5 uppercase">{item}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <ValidationMsg show={!jenisProgram} msg="Sektor wajib dipilih" />
                      </Field>

                      <Field label="Klaster / Rumpun Pelatihan" required icon={<TbLayoutGrid className="text-indigo-500" />}
                        hint="Rumpun ilmu yang menjadi fokus teknis kegiatan pelatihan.">
                        <Select
                          value={String(selectedRumpun?.id_rumpun_pelatihan || "")}
                          onValueChange={(v) => {
                            const found = dataRumpunPelatihan?.find(r => String(r.id_rumpun_pelatihan) === String(v));
                            if (found) { setSelectedRumpun(found); setBidangPelatihan(found.name || found.nama_rumpun_pelatihan || ""); setProgram(""); }
                          }}>
                          <SelectTrigger className={selectCls(!!bidangPelatihan)}>
                            <SelectValue placeholder="Pilih klaster / rumpun..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl max-h-72">
                            {dataRumpunPelatihan?.map(item => (
                              <SelectItem key={item.id_rumpun_pelatihan} value={String(item.id_rumpun_pelatihan)} className="font-semibold text-xs py-2.5 uppercase">
                                {item.nama_rumpun_pelatihan || item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <ValidationMsg show={!bidangPelatihan} msg="Rumpun / klaster wajib dipilih" />
                      </Field>

                      <Field label="Program Pelatihan" required className="md:col-span-2"
                        icon={<TbFileText className="text-emerald-500" />}
                        hint="Nama program yang sesuai dengan rumpun dipilih. Akan tampil di sertifikat.">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Select value={program} onValueChange={(v) => v !== "__new__" && setProgram(v)}>
                            <SelectTrigger className={`${selectCls(!!program)} flex-1`}>
                              <SelectValue placeholder={bidangPelatihan ? `Pilih program ${bidangPelatihan}...` : "Pilih klaster terlebih dahulu"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl max-h-72">
                              {!selectedRumpun?.programs?.length && (
                                <p className="text-[11px] text-slate-400 text-center py-4 px-3">Pilih klaster terlebih dahulu</p>
                              )}
                              {selectedRumpun?.programs?.map(p => (
                                <SelectItem key={p.id_program_pelatihan} value={p.name_indo || String(p.id_program_pelatihan)} className="font-semibold text-xs py-2.5 uppercase">
                                  {p.name_indo}
                                </SelectItem>
                              ))}
                              <div className="border-t border-slate-100 dark:border-white/5 mt-1 pt-1">
                                <SelectItem value="__new__" className="text-blue-500 font-extrabold text-xs py-2.5">
                                  + Inisiasi Program Baru
                                </SelectItem>
                              </div>
                            </SelectContent>
                          </Select>
                          <button type="button"
                            onClick={() => Toast.fire({ icon: "info", title: "Info", text: "Tambah program baru melalui menu Program Pelatihan terlebih dahulu." })}
                            className="inline-flex shrink-0 items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wide shadow-lg shadow-blue-500/25 hover:bg-blue-500 hover:-translate-y-0.5 transition-all active:scale-95">
                            <TbPlus size={16} strokeWidth={3} /> Program Baru
                          </button>
                        </div>
                        <ValidationMsg show={!program} msg="Program pelatihan wajib dipilih" />
                      </Field>
                    </div>
                  )}

                  {/* ── STEP 2: Strategis ─────────────────────────────── */}
                  {currentStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      <Field label="Sumber Pembiayaan" required icon={<TbCurrencyDollar className="text-blue-500" />}
                        hint="Mekanisme anggaran untuk operasional pelatihan ini.">
                        <Select value={jenisPelatihan} onValueChange={setJenisPelatihan}>
                          <SelectTrigger className={selectCls(!!jenisPelatihan)}>
                            <SelectValue placeholder="Pilih sumber pembiayaan..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN.map((item, i) => <SelectItem key={i} value={item} className="text-xs font-semibold py-2.5 uppercase">{item}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <ValidationMsg show={!jenisPelatihan} msg="Sumber pembiayaan wajib dipilih" />
                      </Field>

                      <Field label="Dukungan Program Prioritas" required icon={<RiVerifiedBadgeLine className="text-indigo-500" />}
                        hint="Keterkaitan kegiatan dengan program strategis nasional KKP.">
                        <Select value={dukunganProgramTerobosan} onValueChange={setDukunganProgramTerobosan}>
                          <SelectTrigger className={selectCls(!!dukunganProgramTerobosan)}>
                            <SelectValue placeholder="Pilih dukungan program..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {DUKUNGAN_PROGRAM_TEROBOSAN.map((item, i) => <SelectItem key={i} value={item} className="text-xs font-semibold py-2.5">{item}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <ValidationMsg show={!dukunganProgramTerobosan} msg="Dukungan program wajib dipilih" />
                      </Field>

                      <Field label="Mode Pelaksanaan" required icon={<TbLayoutGrid className="text-slate-500" />}
                        hint="Metode penyampaian materi kepada peserta.">
                        <Select value={pelaksanaanPelatihan} onValueChange={setPelaksanaanPelatihan}>
                          <SelectTrigger className={selectCls(!!pelaksanaanPelatihan)}>
                            <SelectValue placeholder="Pilih mode pelaksanaan..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {JENIS_PELAKSANAAN.map((item, i) => <SelectItem key={i} value={item} className="text-xs font-semibold py-2.5 uppercase">{item}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <ValidationMsg show={!pelaksanaanPelatihan} msg="Mode pelaksanaan wajib dipilih" />
                      </Field>

                      <Field label="Standar Penilaian" required icon={<TbAward className="text-emerald-500" />}
                        hint="Metode evaluasi kompetensi peserta pelatihan.">
                        <Select value={ujiKompetensi} onValueChange={setUjiKompetensi}>
                          <SelectTrigger className={selectCls(!!ujiKompetensi)}>
                            <SelectValue placeholder="Pilih standar penilaian..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {JENIS_PENILAIAN_PELATIHAN.map((item, i) => <SelectItem key={i} value={item} className="text-xs font-semibold py-2.5 uppercase">{item}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <ValidationMsg show={!ujiKompetensi} msg="Jenis penilaian wajib dipilih" />
                      </Field>

                      <AnimatePresence>
                        {jenisPelatihan === "PNBP/BLU - Berbayar" && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:col-span-2 overflow-hidden">
                            <Field label="Biaya Pelatihan per Peserta" required icon={<TbCurrencyDollar className="text-emerald-500" />}
                              hint="Tarif PNBP/BLU per peserta. Belum termasuk akomodasi.">
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                                <input type="number" placeholder="0"
                                  value={hargaPelatihan || ""}
                                  onChange={(e) => setHargaPelatihan(parseInt(e.target.value) || 0)}
                                  className="w-full bg-blue-500/5 border-2 border-blue-500/20 focus:border-blue-500 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-black text-blue-600 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                                {hargaPelatihan > 0 && <p className="text-[10px] text-emerald-600 font-bold mt-1 px-1">= Rp {formatRupiah(hargaPelatihan)}</p>}
                              </div>
                              <ValidationMsg show={jenisPelatihan === "PNBP/BLU - Berbayar" && !hargaPelatihan} msg="Masukkan biaya pelatihan" />
                            </Field>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* ── STEP 3: Jadwal + Ringkasan ────────────────────── */}
                  {currentStep === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      <Field label="Tanggal Mulai Pelatihan" required icon={<TbClock className="text-blue-500" />}
                        hint="Tanggal resmi dimulainya kurikulum pelatihan.">
                        <input type="date" value={tanggalMulai}
                          onChange={(e) => { setTanggalMulai(e.target.value); if (tanggalBerakhir < e.target.value) setTanggalBerakhir(""); }}
                          className={inputCls(!!tanggalMulai)} />
                        <ValidationMsg show={!tanggalMulai} msg="Tanggal mulai wajib diisi" />
                      </Field>

                      <Field label="Tanggal Berakhir Pelatihan" required icon={<TbClock className="text-rose-500" />}
                        hint="Estimasi penyelesaian seluruh modul pelatihan.">
                        <input type="date" min={tanggalMulai}
                          value={tanggalBerakhir}
                          onChange={(e) => setTanggalBerakhir(e.target.value)}
                          disabled={!tanggalMulai}
                          className={`${inputCls(!!tanggalBerakhir)} disabled:opacity-40 disabled:cursor-not-allowed`} />
                        {!tanggalMulai && <p className="text-[10px] text-slate-400 mt-1 px-1">Isi tanggal mulai terlebih dahulu</p>}
                        <ValidationMsg show={!!tanggalMulai && !tanggalBerakhir} msg="Tanggal berakhir wajib diisi" />
                      </Field>

                      {/* Summary review card */}
                      <div className="md:col-span-2">
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/[0.05]">
                            <TbListCheck className="text-blue-500" size={18} />
                            <h4 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-tight">Ringkasan Data Pelatihan</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                            {[
                              { label: "Nama Kegiatan", val: namaPelatihan },
                              { label: "Lokasi", val: lokasiPelatihan },
                              { label: "Penyelenggara", val: penyelenggaraPelatihan },
                              { label: "Sektor", val: jenisProgram },
                              { label: "Klaster", val: bidangPelatihan },
                              { label: "Program", val: program },
                              { label: "Pembiayaan", val: jenisPelatihan },
                              { label: "Program Prioritas", val: dukunganProgramTerobosan },
                              { label: "Mode Pelaksanaan", val: pelaksanaanPelatihan },
                              { label: "Standar Penilaian", val: ujiKompetensi },
                              jenisPelatihan === "PNBP/BLU - Berbayar" ? { label: "Biaya/Peserta", val: `Rp ${formatRupiah(hargaPelatihan)}` } : null,
                            ].filter(Boolean).map((row, i) => (
                              <div key={i} className="flex items-start gap-2 py-1.5">
                                <FiCheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={12} />
                                <div className="min-w-0">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">{row!.label}</p>
                                  <p className="text-slate-700 dark:text-slate-200 font-semibold mt-0.5 truncate">{row!.val || "—"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-start gap-3 pt-3 border-t border-slate-200 dark:border-white/[0.05] mt-1">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                              <TbAlertCircle className="text-amber-500" size={16} />
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              Data yang dikirimkan akan masuk ke alur kerja Pusat untuk disetujui. Pastikan seluruh informasi di atas sudah benar sebelum menekan <strong className="text-slate-700 dark:text-white">Buka Kelas</strong>.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* ── Validation hint bar ────────────────────────────────── */}
              <AnimatePresence>
                {!canContinue && allMissing[currentStep].length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20">
                    <TbAlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Lengkapi data berikut untuk melanjutkan:</p>
                      <div className="flex flex-wrap gap-2">
                        {allMissing[currentStep].map((m, i) => (
                          <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400">{m}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Footer Navigation ─────────────────────────────────── */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
                <button type="button" onClick={prevStep} disabled={currentStep === 0}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-0 transition-all rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                  <TbArrowLeft size={17} /> Sebelumnya
                </button>

                <div className="flex items-center gap-3">
                  {/* Dot indicators */}
                  <div className="flex items-center gap-1.5 mr-2">
                    {STEPS.map((_, i) => (
                      <div key={i} className={`rounded-full transition-all duration-300 ${i === currentStep ? "w-5 h-1.5 bg-blue-600" : stepValid[i] ? "w-1.5 h-1.5 bg-emerald-400" : "w-1.5 h-1.5 bg-slate-200 dark:bg-white/10"}`} />
                    ))}
                  </div>

                  {currentStep < STEPS.length - 1 ? (
                    <button type="button" onClick={nextStep} disabled={!canContinue}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${canContinue
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
                        : "bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed"}`}>
                      Lanjutkan <TbArrowRight size={17} className={canContinue ? "group-hover:translate-x-1 transition-transform" : ""} />
                    </button>
                  ) : (
                    <button type="submit" onClick={handleSubmit} disabled={!step3Valid}
                      className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold transition-all ${step3Valid
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-blue-500/40"
                        : "bg-slate-100 dark:bg-white/5 text-slate-300 cursor-not-allowed"}`}>
                      <TbCheck size={17} /> Buka Kelas
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────
function inputCls(filled: boolean, optional = false) {
  return `w-full bg-slate-50 dark:bg-white/[0.04] border-2 ${filled ? "border-emerald-400/40 dark:border-emerald-500/30" : optional ? "border-slate-200 dark:border-white/[0.06]" : "border-slate-200 dark:border-white/[0.06] focus:border-blue-500"
    } rounded-2xl px-4 py-3.5 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all`;
}

function selectCls(filled: boolean) {
  return `w-full bg-slate-50 dark:bg-white/[0.04] border-2 ${filled ? "border-emerald-400/40 dark:border-emerald-500/30" : "border-slate-200 dark:border-white/[0.06]"
    } h-[52px] rounded-2xl px-4 font-semibold focus:ring-4 focus:ring-blue-500/10 transition-all`;
}

function ValidationMsg({ show, msg }: { show: boolean; msg: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1 px-1 overflow-hidden">
          <TbAlertCircle size={11} className="shrink-0" /> {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children, required, icon, className = "", hint }: {
  label: string; children: React.ReactNode; required?: boolean;
  icon?: React.ReactNode; className?: string; hint?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between px-0.5">
        <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {icon && <span className="text-base">{icon}</span>}
          {label}
          {required && <span className="text-rose-500 font-black">*</span>}
        </label>
        {hint && (
          <div className="group/tip relative">
            <TbInfoCircle className="text-slate-300 hover:text-blue-500 transition-colors cursor-help" size={14} />
            <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-slate-900 text-[10px] text-slate-200 rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed">
              {hint}
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function ActivityIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default FormPelatihan;
