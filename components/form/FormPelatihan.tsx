"use client";

import React, { ChangeEvent, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { HashLoader } from "react-spinners";
import {
  TbSchool,
  TbClock,
  TbFileText,
  TbArrowRight,
  TbArrowLeft,
  TbCheck,
  TbInfoCircle,
  TbLayoutGrid,
  TbUsers,
  TbCurrencyDollar,
  TbMapPin,
  TbPlus,
} from "react-icons/tb";
import { RiVerifiedBadgeLine } from "react-icons/ri";

import Toast from "@/commons/Toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateRandomString } from "@/utils";
import { generateTimestamp } from "@/utils/time";
import { UPT } from "@/constants/nomenclatures";
import {
  DUKUNGAN_PROGRAM_TEROBOSAN,
  JENIS_PELAKSANAAN,
  JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN,
  JENIS_PENILAIAN_PELATIHAN,
  PENANDATANGAN_SERTIFIKAT,
  SEKTOR_PELATIHAN,
} from "@/constants/pelatihan";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { ProgramPelatihan, RumpunPelatihan } from "@/types/program";

import addData from "@/firebase/firestore/addData";

const STEPS = [
  { title: "Identitas", icon: <TbSchool size={20} />, description: "Nama & Lokasi" },
  { title: "Klasifikasi", icon: <TbLayoutGrid size={20} />, description: "Sektor & Rumpun" },
  { title: "Strategis", icon: <RiVerifiedBadgeLine size={20} />, description: "Biaya & Prioritas" },
  { title: "Jadwal", icon: <TbClock size={20} />, description: "Waktu Pelaksanaan" },
];

function FormPelatihan({ edit = false, onSuccess }: { edit: boolean, onSuccess?: () => void }) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("XSRF091");
  const penyelenggara = Cookies.get('Satker');

  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form States
  const [kodePelatihan, setKodePelatihan] = useState(generateRandomString());
  const [namaPelatihan, setNamaPelatihan] = useState("");
  const [namaPelatihanInggris, setNamaPelatihanInggris] = useState("");
  const [penyelenggaraPelatihan, setPenyelenggaraPelatihan] = useState(penyelenggara || "");
  const [jenisPelatihan, setJenisPelatihan] = useState("");
  const [bidangPelatihan, setBidangPelatihan] = useState("");
  const [dukunganProgramTerobosan, setDukunganProgramTerobosan] = useState("");
  const [tanggalMulaiPelatihan, setTanggalMulaiPelatihan] = useState("");
  const [tanggalBerakhirPelatihan, setTanggalBerakhirPelatihan] = useState("");
  const [hargaPelatihan, setHargaPelatihan] = useState<number>(0);
  const [lokasiPelatihan, setLokasiPelatihan] = useState("");
  const [pelaksanaanPelatihan, setPelaksanaanPelatihan] = useState("");
  const [ujiKompetensi, setUjiKompetensi] = useState("");
  const [asalPelatihan, setAsalPelatihan] = useState("Masyarakat");
  const [jenisSertifikat, setJenisSertifikat] = useState("");
  const [program, setProgram] = useState<string>("");
  const [jenisProgram, setJenisProgram] = useState<string>("");

  const { data: dataRumpunPelatihan, fetchRumpunPelatihan } = useFetchDataRumpunPelatihan();
  const [selectedRumpunPelatihan, setSelectedRumpunPelatihan] = useState<RumpunPelatihan | null>(null);

  const isStep0Valid = !!(namaPelatihan && lokasiPelatihan && penyelenggaraPelatihan);
  const isStep1Valid = !!(jenisProgram && bidangPelatihan && program);
  const isStep2Valid = !!(jenisPelatihan && dukunganProgramTerobosan && (jenisPelatihan !== "PNBP/BLU - Berbayar" || hargaPelatihan > 0));
  const isStep3Valid = !!(tanggalMulaiPelatihan && tanggalBerakhirPelatihan);

  const canContinue = useMemo(() => {
    if (currentStep === 0) return isStep0Valid;
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2) return isStep2Valid;
    if (currentStep === 3) return isStep3Valid;
    return false;
  }, [currentStep, isStep0Valid, isStep1Valid, isStep2Valid, isStep3Valid]);

  const handleAddHistoryPelatihan = async () => {
    try {
      await addData('historical-training-notes', kodePelatihan, {
        historical: [
          {
            'created_at': generateTimestamp(),
            id: kodePelatihan,
            notes: `Telah membuka kelas pelatihan ${namaPelatihan}`,
            role: Cookies.get('Role'),
            upt: `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`
          }
        ],
        status: 'On Progress'
      });
    } catch (error) {
      console.error("History log error:", error);
    }
  };

  const handlePostingPublicTrainingData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep3Valid) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("KodePelatihan", kodePelatihan);
    data.append("NamaPelatihan", namaPelatihan);
    data.append("NamaPelathanInggris", namaPelatihanInggris);
    data.append("PenyelenggaraPelatihan", penyelenggaraPelatihan);
    data.append("JenisPelatihan", jenisPelatihan);
    data.append("BidangPelatihan", bidangPelatihan);
    data.append("DukunganProgramTerobosan", dukunganProgramTerobosan);
    data.append("TanggalMulaiPelatihan", tanggalMulaiPelatihan);
    data.append("TanggalBerakhirPelatihan", tanggalBerakhirPelatihan);
    data.append("HargaPelatihan", hargaPelatihan.toString());
    data.append("Program", program);
    data.append("JenisProgram", jenisProgram);
    data.append("Status", "Proses Buka Kelas");
    data.append("UjiKompetensi", ujiKompetensi);
    data.append("LokasiPelatihan", lokasiPelatihan);
    data.append("PelaksanaanPelatihan", pelaksanaanPelatihan);
    data.append("StatusPenerbitan", '0');
    data.append("PemberitahuanDiterima", 'Proses Buka Kelas');
    data.append("AsalPelatihan", asalPelatihan);
    data.append("JenisSertifikat", jenisSertifikat);
    data.append("TtdSertifikat", PENANDATANGAN_SERTIFIKAT[1]);

    try {
      await axios.post(`${baseUrl}/lemdik/createPelatihan`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Toast.fire({ icon: "success", title: "Berhasil!", text: 'Pelatihan baru telah ditambahkan.' });
      handleAddHistoryPelatihan();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/lemdiklat/pelatihan");
      }
    } catch (error) {
      console.error("Submission error:", error);
      Toast.fire({ icon: "error", title: "Gagal!", text: 'Terjadi kesalahan saat menyimpan data.' });
    } finally {
      setIsUploading(false);
    }
  };

  const nextStep = () => currentStep < STEPS.length - 1 && canContinue && setCurrentStep(prev => prev + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(prev => prev - 1);

  return (
    <section className="relative w-full py-4">
      <div className="w-full mx-auto px-4">
        {isUploading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <HashLoader color="#3b82f6" size={60} />
            <p className="text-blue-500 font-bold animate-pulse tracking-widest uppercase text-xs">Processing Vault...</p>
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[40px] border border-gray-200/50 dark:border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden">

            {/* Header & Progress */}
            <div className="relative p-4 md:p-8 border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-500/5">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/10">
                    <ActivityIcon size={12} className="text-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">New Training Class</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                    Buka Kelas <span className="text-blue-600">Pelatihan</span>
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Lengkapi parameter operasional untuk menginisialisasi program pelatihan baru.</p>
                </div>

                <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <span className="text-xl font-black">0{currentStep + 1}</span>
                  </div>
                  <div className="pr-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white leading-none mt-1 uppercase tracking-tight">{STEPS[currentStep].title}</p>
                  </div>
                </div>
              </div>

              {/* Stepper Visualization */}
              <div className="grid grid-cols-4 gap-4 relative">
                {STEPS.map((step, idx) => (
                  <div key={idx} className="relative group/step">
                    <div className={`h-1.5 rounded-full transition-all duration-700 ${idx <= currentStep ? "bg-blue-600" : "bg-gray-200 dark:bg-white/5"}`} />
                    <div className="mt-4 hidden md:flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${idx <= currentStep ? "text-blue-600" : "text-gray-400"}`}>{step.title}</span>
                      <span className="text-[9px] font-medium text-gray-400 mt-0.5">{step.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 md:p-12 min-h-[400px]">
              <form onSubmit={handlePostingPublicTrainingData}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="space-y-8"
                  >
                    {/* Step 0: General Info */}
                    {currentStep === 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                          label="Nama Kegiatan"
                          required
                          icon={<TbSchool className="text-blue-500" />}
                          description="Gunakan penamaan yang formal and deskriptif.">
                          <input
                            type="text"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase"
                            placeholder="Contoh: PELATIHAN TEKNIS BUDIDAYA LAUT"
                            value={namaPelatihan}
                            onChange={(e) => setNamaPelatihan(e.target.value)}
                          />
                        </FormField>

                        <FormField
                          label="Lokasi Pelatihan"
                          required
                          icon={<TbMapPin className="text-emerald-500" />}
                          description="Tuliskan kota atau detail lokasi spesifik.">
                          <input
                            type="text"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="Contoh: BPPP MEDAN / ONLINE"
                            value={lokasiPelatihan}
                            onChange={(e) => setLokasiPelatihan(e.target.value)}
                          />
                        </FormField>

                        <FormField
                          label="Penyelenggara"
                          required
                          className="md:col-span-2"
                          icon={<TbLayoutGrid className="text-indigo-500" />}
                          description="Unit kerja yang bertanggung jawab penuh atas pelaksanaan.">
                          <Select value={penyelenggaraPelatihan} onValueChange={setPenyelenggaraPelatihan}>
                            <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 h-[58px] rounded-2xl px-5 font-bold">
                              <SelectValue placeholder="Pilih penyelenggara" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/10 shadow-2xl backdrop-blur-xl">
                              {UPT.map((item, i) => <SelectItem key={i} value={item} className="uppercase font-bold text-xs py-3">{item}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormField>
                      </div>
                    )}

                    {/* Step 1: Scopes */}
                    {currentStep === 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField label="Sektor Pelatihan" required icon={<TbLayoutGrid className="text-blue-500" />} description="Grup utama klasifikasi industri.">
                          <Select value={jenisProgram} onValueChange={setJenisProgram}>
                            <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 h-[58px] rounded-2xl px-5 font-bold uppercase tracking-tight">
                              <SelectValue placeholder="Pilih Sektor" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {SEKTOR_PELATIHAN.map((item, i) => <SelectItem key={i} value={item} className="font-bold py-3 uppercase text-xs">{item}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormField>

                        <FormField label="Klaster Pelatihan" required icon={<TbLayoutGrid className="text-indigo-500" />} description="Kategori spesifik rumpun ilmu.">
                          <Select value={bidangPelatihan} onValueChange={(v) => {
                            setBidangPelatihan(v);
                            const found = dataRumpunPelatihan.find(r => r.name === v);
                            setSelectedRumpunPelatihan(found || null);
                            setProgram(""); // Reset program on cluster change
                          }}>
                            <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 h-[58px] rounded-2xl px-5 font-bold uppercase tracking-tight">
                              <SelectValue placeholder="Pilih Klaster" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl max-h-[300px]">
                              {dataRumpunPelatihan.map((item) => (
                                <SelectItem key={item.id_rumpun_pelatihan} value={item.name} className="font-bold py-3 uppercase text-xs">{item.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormField>

                        <FormField label="Program Pelatihan" required className="md:col-span-2" icon={<TbFileText className="text-emerald-500" />} description="Judul program yang akan muncul di sertifikat.">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Select value={program} onValueChange={(v) => {
                              if (v === "__add_new__") {
                                document.getElementById("trigger-add-program")?.click();
                              } else {
                                setProgram(v);
                              }
                            }}>
                              <SelectTrigger className="flex-1 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 h-[58px] rounded-2xl px-5 font-bold uppercase">
                                <SelectValue placeholder={bidangPelatihan ? `Pilih Program ${bidangPelatihan}` : "Pilih Klaster Terlebih Dahulu"} />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl max-h-[300px]">
                                {selectedRumpunPelatihan?.programs.map((p) => (
                                  <SelectItem key={p.id_program_pelatihan} value={p.name_indo} className="font-bold py-3 uppercase text-xs">{p.name_indo}</SelectItem>
                                ))}
                                <div className="border-t border-gray-100 dark:border-white/5 my-2" />
                                <SelectItem value="__add_new__" className="text-blue-500 font-extrabold py-3 text-xs">
                                  + INTIASI PROGRAM BARU
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <button
                              type="button"
                              id="trigger-add-program"
                              onClick={() => Toast.fire({ icon: "info", title: "Info", text: "Anda bisa menambahkan terlebih dahulu di menu program pelatihan" })}
                              className="flex items-center gap-3 px-6 h-12 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all active:scale-95"
                            >
                              <TbPlus size={20} strokeWidth={3} />
                              New Program
                            </button>
                          </div>
                        </FormField>
                      </div>
                    )}

                    {/* Step 2: Strategic */}
                    {currentStep === 2 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField label="Sumber Pembiayaan" required icon={<TbCurrencyDollar className="text-blue-500" />} description="Model anggaran untuk operasional.">
                          <Select value={jenisPelatihan} onValueChange={setJenisPelatihan}>
                            <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 h-[58px] rounded-2xl px-5 font-bold">
                              <SelectValue placeholder="Pilih Sumber" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl font-bold">
                              {JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN.map((item, i) => <SelectItem key={i} value={item} className="text-xs uppercase font-extrabold py-3">{item}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormField>

                        <FormField label="Program Prioritas" required icon={<RiVerifiedBadgeLine className="text-indigo-500" />} description="Integrasi dengan program strategis nasional.">
                          <Select value={dukunganProgramTerobosan} onValueChange={setDukunganProgramTerobosan}>
                            <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 h-[58px] rounded-2xl px-5 font-bold">
                              <SelectValue placeholder="Pilih Dukungan" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl font-bold">
                              {DUKUNGAN_PROGRAM_TEROBOSAN.map((item, i) => <SelectItem key={i} value={item} className="text-xs uppercase font-extrabold py-3">{item}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormField>

                        {jenisPelatihan === "PNBP/BLU - Berbayar" && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="md:col-span-2">
                            <FormField label="Biaya Pelatihan (IDR)" required icon={<TbCurrencyDollar className="text-emerald-500" />} description="Biaya per orang untuk komponen pelatihan saja.">
                              <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                                <input
                                  type="number"
                                  className="w-full bg-blue-500/5 border border-blue-500/20 rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-blue-600 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-blue-500/30"
                                  placeholder="0"
                                  value={hargaPelatihan || ""}
                                  onChange={(e) => setHargaPelatihan(parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </FormField>
                          </motion.div>
                        )}

                        <FormField label="Mode Pelaksanaan" required icon={<TbLayoutGrid className="text-slate-400" />} description="Metode delivery materi pelatihan.">
                          <Select value={pelaksanaanPelatihan} onValueChange={setPelaksanaanPelatihan}>
                            <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 h-[58px] rounded-2xl px-5 font-bold">
                              <SelectValue placeholder="Pilih Mode" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl font-bold uppercase">
                              {JENIS_PELAKSANAAN.map((item, i) => <SelectItem key={i} value={item} className="text-xs font-black py-3">{item}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormField>

                        <FormField label="Jenis Penilaian" required icon={<TbCheck className="text-emerald-500" />} description="Standar evaluasi kompetensi peserta.">
                          <Select value={ujiKompetensi} onValueChange={setUjiKompetensi}>
                            <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 h-[58px] rounded-2xl px-5 font-bold">
                              <SelectValue placeholder="Pilih Penilaian" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl font-bold">
                              {JENIS_PENILAIAN_PELATIHAN.map((item, i) => <SelectItem key={i} value={item} className="text-xs font-black py-3 uppercase">{item}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormField>
                      </div>
                    )}

                    {/* Step 3: Schedule */}
                    {currentStep === 3 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField label="Mulai Pelatihan" required icon={<TbClock className="text-blue-500" />} description="Tanggal resmi dimulainya kurikulum.">
                          <input
                            type="date"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:color-scheme-dark"
                            value={tanggalMulaiPelatihan}
                            onChange={(e) => setTanggalMulaiPelatihan(e.target.value)}
                          />
                        </FormField>

                        <FormField label="Berakhir Pelatihan" required icon={<TbClock className="text-rose-500" />} description="Estimasi penyelesaian seluruh modul.">
                          <input
                            type="date"
                            min={tanggalMulaiPelatihan}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-30 dark:color-scheme-dark"
                            value={tanggalBerakhirPelatihan}
                            onChange={(e) => setTanggalBerakhirPelatihan(e.target.value)}
                            disabled={!tanggalMulaiPelatihan}
                          />
                        </FormField>

                        <div className="md:col-span-2 p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                              <TbCheck className="text-blue-500" size={24} />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Final Konfirmasi</h4>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Data yang telah dibuat akan masuk ke alur Kerja (Workflow) Pusat. Pastikan seluruh informasi telah tervalidasi dengan benar.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Footer Controllers */}
                <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-8 py-4 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-all"
                  >
                    <TbArrowLeft size={18} />
                    Back
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-4 hidden md:flex">
                      {[...Array(STEPS.length)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "bg-blue-600 scale-150 shadow-[0_0_8px_rgba(37,99,235,0.4)]" : "bg-slate-200 dark:bg-white/10"}`} />
                      ))}
                    </div>

                    {currentStep === STEPS.length - 1 ? (
                      <button
                        type="submit"
                        onClick={handlePostingPublicTrainingData}
                        className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all"
                      >
                        <span className="relative z-10 flex items-center gap-2">Buka Kelas <TbCheck size={18} /></span>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!canContinue}
                        className={`
                                                    group flex items-center gap-3 px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all
                                                    ${canContinue
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:-translate-y-1"
                            : "bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-700 cursor-not-allowed"}
                                                `}
                      >
                        Continue
                        <TbArrowRight size={18} className={`${canContinue ? "group-hover:translate-x-1" : ""} transition-transform`} />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Sub-component for form fields
const FormField = ({ label, children, required, icon, className = "", description }: { label: string; children: React.ReactNode; required?: boolean; icon?: React.ReactNode; className?: string; description?: string }) => (
  <div className={`space-y-2.5 ${className}`}>
    <div className="flex items-center justify-between px-1">
      <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 flex items-center gap-2">
        {icon}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {description && (
        <div className="group/info relative">
          <TbInfoCircle className="text-slate-300 hover:text-blue-500 transition-colors cursor-help" size={14} />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 text-[10px] text-white rounded-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl font-medium leading-relaxed uppercase tracking-tighter shadow-blue-500/20">
            {description}
          </div>
        </div>
      )}
    </div>
    {children}
  </div>
);

const ActivityIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default FormPelatihan;
