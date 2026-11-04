"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import axios from "axios";
import Cookies from "js-cookie";
import {
  TbSchool, TbClock, TbFileText, TbArrowRight, TbArrowLeft, TbCheck, TbLayoutGrid,
  TbCurrencyDollar, TbMapPin, TbPlus, TbAlertCircle, TbCalendar, TbBuildingCommunity,
  TbAward, TbListCheck, TbLoader2, TbPencil, TbRefresh, TbDeviceLaptop, TbBook2, TbExternalLink, TbBooks,
} from "react-icons/tb";
import { RiVerifiedBadgeLine } from "react-icons/ri";

import Toast from "@/commons/Toast";
import { generateRandomString } from "@/utils";
import { generateTimestamp } from "@/utils/time";
import { UPT } from "@/constants/nomenclatures";
import {
  DUKUNGAN_PROGRAM_TEROBOSAN, JENIS_PELAKSANAAN, JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN,
  JENIS_PENILAIAN_PELATIHAN, PENANDATANGAN_SERTIFIKAT, SEKTOR_PELATIHAN,
} from "@/constants/pelatihan";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import addData from "@/firebase/firestore/addData";
import firebaseApp from "@/firebase/config";

/* ============================ KONFIG ============================ */

/**
 * Pemetaan Sektor → Klaster/Rumpun.
 * Data rumpun dari API belum punya field sektor, jadi dipetakan di sini (cocok sebagian, tidak peka huruf besar).
 * Sektor yang tidak ada di peta → semua klaster ditampilkan.
 * TODO: lengkapi sesuai nomenklatur resmi / pindahkan ke API bila rumpun sudah punya field sektor.
 */
const KLASTER_BY_SEKTOR: { sektor: string; klaster: string[] }[] = [
  {
    sektor: "Perikanan",
    klaster: [
      "Sistem Jaminan Mutu",
      "Budi Daya",
      "Pengolahan dan Pemasaran",
      "Kampung Nelayan Merah Putih (KNMP)",
      "Teknis Lainnya (Rekayasa, Enumerator, Koperasi, Dll)",
      "Satuan Pendidikan KP",
    ],
  },
  {
    sektor: "Kelautan",
    klaster: ["Konservasi dan Kemitigasian", "Kelautan dan Kemaritiman (Garam, Oseanografi, Biologi, Iklim, Marine Debris)"],
  },
  {
    sektor: "Awak Kapal Perikanan",
    klaster: [
      "Penangkapan dan Alat Tangkap Ikan",
      "Permesinan dan Mekanisasi",
      "Pengawasan dan Kepelabuhanan Perikanan",
      "Pembentukan Keahlian Awak Kapal Perikanan (AKP)",
      "Peningkatan Keahlian Awak Kapal Perikanan (AKP)",
      "Updating Keahlian Awak Kapal Perikanan (AKP)",
    ],
  },
];

/** Cocokkan nama klaster konfigurasi dengan nama rumpun di API (abaikan huruf besar, spasi, isi kurung, "budidaya"/"budi daya"). */
const keyOf = (s = "") => norm(s).replace(/\s*\(.*$/, "").replace(/budidaya/g, "budi daya").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const sameKlaster = (a: string, b: string) => {
  const x = keyOf(a), y = keyOf(b);
  return !!x && !!y && (x === y || x.startsWith(y) || y.startsWith(x));
};

const norm = (s = "") => s.toLowerCase().replace(/\s+/g, " ").trim();
const rumpunName = (r: { name?: string; nama_rumpun_pelatihan?: string }) => r.name || r.nama_rumpun_pelatihan || "";

/* ---------- Materi program (Firestore: documents/<nama program>) ---------- */
type Materi = { group_ind?: string; name_ind: string; name_eng?: string; theory: number; practice: number };
type MateriCategories = Record<string, Materi[]>;
const materiDb = getFirestore(firebaseApp);
const materiCache = new Map<string, MateriCategories | null>();

function useMateriProgram(programName: string) {
  const [state, setState] = useState<{ loading: boolean; data: MateriCategories | null; error: boolean }>({ loading: false, data: null, error: false });
  const [nonce, setNonce] = useState(0);
  const reload = React.useCallback(() => {
    materiCache.delete(programName);
    setNonce((n) => n + 1);
  }, [programName]);

  // Kembali dari tab "Lengkapi materi" → cek ulang otomatis bila materi masih kosong
  useEffect(() => {
    const onFocus = () => programName && materiCache.get(programName) === null && reload();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [programName, reload]);

  useEffect(() => {
    if (!programName) return setState({ loading: false, data: null, error: false });
    if (materiCache.has(programName)) return setState({ loading: false, data: materiCache.get(programName)!, error: false });
    let cancelled = false;
    setState({ loading: true, data: null, error: false });
    (async () => {
      try {
        const snap = await getDoc(doc(materiDb, "documents", programName));
        const cats = snap.exists() ? ((snap.data()?.categories as MateriCategories) || {}) : {};
        const val = Object.values(cats).some((l) => l?.length) ? cats : null;
        materiCache.set(programName, val);
        if (!cancelled) setState({ loading: false, data: val, error: false });
      } catch (e) {
        console.error("Gagal memuat materi program:", e);
        if (!cancelled) setState({ loading: false, data: null, error: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [programName, nonce]);
  return { ...state, reload };
}

type IconType = React.ComponentType<{ className?: string; size?: number }>;

const STEPS: { title: string; desc: string; icon: IconType; accent: string }[] = [
  { title: "Identitas", desc: "Nama, lokasi & penyelenggara", icon: TbSchool, accent: "#3B82F6" },
  { title: "Klasifikasi", desc: "Sektor, klaster & program", icon: TbLayoutGrid, accent: "#8B5CF6" },
  { title: "Strategis", desc: "Biaya, mode & penilaian", icon: RiVerifiedBadgeLine, accent: "#10B981" },
  { title: "Jadwal & Tinjau", desc: "Waktu pelaksanaan & ringkasan", icon: TbCalendar, accent: "#F59E0B" },
];

const BERBAYAR = "PNBP/BLU - Berbayar";
const DRAFT_KEY = "draft:formPelatihan";

interface FormState {
  namaPelatihan: string;
  lokasiPelatihan: string;
  penyelenggaraPelatihan: string;
  jenisProgram: string;
  bidangPelatihan: string;
  program: string;
  jenisPelatihan: string;
  dukunganProgramTerobosan: string;
  pelaksanaanPelatihan: string;
  ujiKompetensi: string;
  hargaPelatihan: number;
  tanggalMulai: string;
  tanggalBerakhir: string;
}

const emptyForm = (penyelenggara = ""): FormState => ({
  namaPelatihan: "",
  lokasiPelatihan: "",
  penyelenggaraPelatihan: penyelenggara,
  jenisProgram: "",
  bidangPelatihan: "",
  program: "",
  jenisPelatihan: "",
  dukunganProgramTerobosan: "",
  pelaksanaanPelatihan: "",
  ujiKompetensi: "",
  hargaPelatihan: 0,
  tanggalMulai: "",
  tanggalBerakhir: "",
});

const rupiah = (v: number) => (v ? `Rp ${new Intl.NumberFormat("id-ID").format(v)}` : "");
const DATE_FMT = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" });
const fmtDate = (s: string) => (s ? DATE_FMT.format(new Date(s)) : "");
const durasiHari = (a: string, b: string) => (a && b ? Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000) + 1 : 0);

/** Field wajib per langkah → label (dipakai validasi & petunjuk) */
const missingOf = (f: FormState): string[][] => [
  [!f.namaPelatihan.trim() && "Nama kegiatan", !f.lokasiPelatihan.trim() && "Lokasi", !f.penyelenggaraPelatihan && "Penyelenggara"],
  [!f.jenisProgram && "Sektor", !f.bidangPelatihan && "Klaster", !f.program && "Program"],
  [
    !f.jenisPelatihan && "Sumber pembiayaan",
    !f.dukunganProgramTerobosan && "Program prioritas",
    !f.pelaksanaanPelatihan && "Mode pelaksanaan",
    !f.ujiKompetensi && "Standar penilaian",
    f.jenisPelatihan === BERBAYAR && !(f.hargaPelatihan > 0) && "Biaya pelatihan",
  ],
  [!f.tanggalMulai && "Tanggal mulai", !f.tanggalBerakhir && "Tanggal berakhir"],
].map((arr) => arr.filter(Boolean) as string[]);

/* ============================ KOMPONEN ============================ */

function FormPelatihan({ edit = false, onSuccess }: { edit: boolean; onSuccess?: () => void }) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const satker = Cookies.get("Satker") || "";

  const [kodePelatihan] = useState(generateRandomString);
  const [form, setForm] = useState<FormState>(() => emptyForm(satker));
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState<Set<number>>(new Set()); // langkah yang sudah dicoba dilanjutkan → tampilkan error
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const { data: dataRumpun } = useFetchDataRumpunPelatihan();
  const selectedRumpun = useMemo(
    () => dataRumpun?.find((r) => rumpunName(r) === form.bidangPelatihan) || null,
    [dataRumpun, form.bidangPelatihan]
  );

  /**
   * Opsi klaster untuk sektor terpilih, sesuai KLASTER_BY_SEKTOR (urutan & nama mengikuti konfigurasi).
   * Tiap opsi dipasangkan dengan rumpun API (untuk daftar program); nilai yang disimpan = nama rumpun API bila cocok.
   */
  const klasterOptions = useMemo(() => {
    const sektor = norm(form.jenisProgram);
    if (!sektor) return [];
    const all = dataRumpun ?? [];
    const rule =
      KLASTER_BY_SEKTOR.find((m) => norm(m.sektor) === sektor) ||
      KLASTER_BY_SEKTOR.find((m) => sektor.includes(norm(m.sektor)) || norm(m.sektor).includes(sektor));
    if (!rule) return all.map((r) => ({ label: rumpunName(r), value: rumpunName(r), programs: Array.isArray(r.programs) ? r.programs.length : 0 }));
    return rule.klaster.map((label) => {
      const r = all.find((x) => sameKlaster(rumpunName(x), label));
      return { label, value: r ? rumpunName(r) : label, programs: r && Array.isArray(r.programs) ? r.programs.length : 0 };
    });
  }, [dataRumpun, form.jenisProgram]);

  const materi = useMateriProgram(form.program);
  const pathname = usePathname();
  const programPageHref = `${pathname?.match(/^\/admin\/[^/]+/)?.[0] ?? "/admin/lemdiklat"}/master/program-pelatihan`;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  /* ---------- Draf otomatis (tidak hilang bila halaman tertutup) ---------- */
  useEffect(() => {
    if (edit) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Partial<FormState>;
        if (d && Object.values(d).some((v) => v && v !== satker)) {
          setForm((f) => ({ ...f, ...d }));
          setDraftRestored(true);
        }
      }
    } catch { /* abaikan */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (edit) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* abaikan */ }
    }, 400);
    return () => clearTimeout(t);
  }, [form, edit]);

  const resetDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* abaikan */ }
    setForm(emptyForm(satker));
    setStep(0);
    setTried(new Set());
    setDraftRestored(false);
  };

  /* ---------- Validasi ---------- */
  const missing = useMemo(() => {
    const m = missingOf(form);
    // Program wajib sudah punya materi → tidak bisa lanjut / simpan selama materi belum ada atau masih dimuat
    if (form.program && !materi.data) m[1] = [...m[1], materi.loading ? "Materi (sedang dimuat)" : "Materi program"];
    return m;
  }, [form, materi.data, materi.loading]);
  const valid = missing.map((m) => m.length === 0);
  const showErr = tried.has(step);
  const err = (label: string) => showErr && missing[step].includes(label);
  const completed = valid.filter(Boolean).length;
  const progress = Math.round((completed / STEPS.length) * 100);
  const isLast = step === STEPS.length - 1;

  // Langkah boleh dibuka bila semua langkah sebelumnya valid
  const reachable = (i: number) => valid.slice(0, i).every(Boolean);

  const goTo = (i: number) => {
    if (i <= step || reachable(i)) setStep(i);
    else {
      const firstInvalid = valid.findIndex((v) => !v);
      setTried((t) => new Set(t).add(firstInvalid));
      setStep(firstInvalid);
    }
  };

  const next = () => {
    if (!valid[step]) {
      setTried((t) => new Set(t).add(step));
      Toast.fire({ icon: "warning", title: "Lengkapi data", text: missing[step].join(", ") });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  /* ---------- Submit ---------- */
  const submit = async () => {
    const firstInvalid = valid.findIndex((v) => !v);
    if (firstInvalid !== -1) {
      setTried((t) => new Set(t).add(firstInvalid));
      setStep(firstInvalid);
      return;
    }
    setSubmitting(true);
    const f = form;
    const fd = new FormData();
    const fields: Record<string, string> = {
      KodePelatihan: kodePelatihan,
      NamaPelatihan: f.namaPelatihan.trim(),
      NamaPelathanInggris: "",
      PenyelenggaraPelatihan: f.penyelenggaraPelatihan,
      JenisPelatihan: f.jenisPelatihan,
      BidangPelatihan: f.bidangPelatihan,
      DukunganProgramTerobosan: f.dukunganProgramTerobosan,
      TanggalMulaiPelatihan: f.tanggalMulai,
      TanggalBerakhirPelatihan: f.tanggalBerakhir,
      HargaPelatihan: String(f.jenisPelatihan === BERBAYAR ? f.hargaPelatihan : 0),
      Program: f.program,
      JenisProgram: f.jenisProgram,
      Status: "Proses Buka Kelas",
      UjiKompetensi: f.ujiKompetensi,
      LokasiPelatihan: f.lokasiPelatihan.trim(),
      PelaksanaanPelatihan: f.pelaksanaanPelatihan,
      StatusPenerbitan: "0",
      PemberitahuanDiterima: "Proses Buka Kelas",
      AsalPelatihan: "Masyarakat",
      JenisSertifikat: "",
      TtdSertifikat: PENANDATANGAN_SERTIFIKAT[1],
    };
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));

    try {
      await axios.post(`${baseUrl}/lemdik/createPelatihan`, fd, {
        headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}`, "Content-Type": "multipart/form-data" },
      });
      await addData("historical-training-notes", kodePelatihan, {
        historical: [
          {
            created_at: generateTimestamp(),
            id: kodePelatihan,
            notes: `Membuka kelas pelatihan ${f.namaPelatihan}`,
            role: Cookies.get("Role"),
            upt: `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`,
          },
        ],
        status: "On Progress",
      });
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* abaikan */ }
      Toast.fire({ icon: "success", title: "Kelas berhasil dibuka!", text: `Pelatihan "${f.namaPelatihan}" telah ditambahkan.` });
      if (onSuccess) onSuccess();
      else router.push("/admin/lemdiklat/pelatihan");
    } catch (e: any) {
      Toast.fire({ icon: "error", title: "Gagal menyimpan", text: e?.response?.data?.message || "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  };

  // Ringkasan per langkah (tampil di timeline saat selesai)
  const stepSummary = [
    form.namaPelatihan,
    [form.bidangPelatihan, form.program].filter(Boolean).join(" · "),
    [form.jenisPelatihan, form.pelaksanaanPelatihan].filter(Boolean).join(" · "),
    form.tanggalMulai && form.tanggalBerakhir ? `${fmtDate(form.tanggalMulai)} – ${fmtDate(form.tanggalBerakhir)}` : "",
  ];

  const Cur = STEPS[step];

  /* ============================ RENDER ============================ */

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 lg:gap-5">
        {/* ---------- Timeline vertikal (hero navy) ---------- */}
        <aside className="relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 text-white ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)] lg:sticky lg:top-24 lg:self-start">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(70%_50%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
          <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
          <TbSchool aria-hidden className="pointer-events-none absolute -right-6 -bottom-8 -z-10 w-40 h-40 -rotate-12 text-sky-300 opacity-10" />

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Buka Kelas Baru</p>
          <h2 className="mt-1 text-xl font-black tracking-tight">Kelas Pelatihan</h2>
          <p className="text-xs text-blue-100/60">Kode <span className="font-mono text-sky-200">{kodePelatihan}</span></p>

          {/* Progres keseluruhan */}
          <div className="mt-4">
            <div className="flex items-baseline justify-between text-[11px]">
              <span className="text-blue-100/70">{completed} dari {STEPS.length} langkah lengkap</span>
              <span className="font-black tabular-nums">{progress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#38BDF8,#fff)" }} />
            </div>
          </div>

          {/* Langkah */}
          <ol className="mt-5 space-y-1 flex lg:block overflow-x-auto lg:overflow-visible gap-2 -mx-1 px-1 pb-1 lg:pb-0 scrollbar-hide">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = valid[i] && !active;
              const locked = !reachable(i) && i > step;
              const hasErr = tried.has(i) && !valid[i];
              const last = i === STEPS.length - 1;
              return (
                <li key={s.title} className="relative shrink-0 min-w-[200px] lg:min-w-0">
                  {/* Garis penghubung vertikal */}
                  {!last && (
                    <span className="hidden lg:block absolute left-[25px] top-[50px] bottom-[-6px] w-[2px] rounded-full bg-white/10 overflow-hidden">
                      <span className="block w-full bg-gradient-to-b from-emerald-400 to-sky-400 transition-all duration-500" style={{ height: valid[i] ? "100%" : "0%" }} />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active ? "step" : undefined}
                    className={`group relative isolate w-full flex items-start gap-3 rounded-2xl p-2.5 text-left transition-all duration-300 overflow-hidden ${active
                      ? "bg-white/[0.12] backdrop-blur-xl ring-1 ring-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                      : "hover:bg-white/[0.06]"
                      } ${locked ? "opacity-60" : ""}`}
                  >
                    {active && <span aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: `linear-gradient(to left, ${s.accent}59 0%, ${s.accent}1f 45%, transparent 85%)` }} />}
                    <span
                      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-300 ${done
                        ? "bg-emerald-500 ring-emerald-300/40 text-white"
                        : active
                          ? "text-white ring-white/30"
                          : hasErr
                            ? "bg-rose-500/20 ring-rose-300/40 text-rose-200"
                            : "bg-white/10 ring-white/10 text-sky-100/70"
                        }`}
                      style={active ? { background: s.accent, boxShadow: `0 6px 18px -4px ${s.accent}` } : undefined}
                    >
                      {done ? <TbCheck size={18} /> : hasErr ? <TbAlertCircle size={18} /> : <Icon size={18} />}
                    </span>
                    <span className="min-w-0 flex-1 pt-0.5">
                      <span className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-100/45">Langkah {i + 1}</span>
                        {done && <span className="text-[9px] font-bold text-emerald-300">Selesai</span>}
                        {hasErr && <span className="text-[9px] font-bold text-rose-300">{missing[i].length} kurang</span>}
                      </span>
                      <span className={`block text-sm font-bold ${active ? "text-white" : "text-blue-50/90"}`}>{s.title}</span>
                      <span className="block text-[11px] text-blue-100/55 truncate">{done && stepSummary[i] ? stepSummary[i] : s.desc}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {draftRestored && (
            <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-3 py-2">
              <span className="text-[11px] text-blue-100/70">Draf sebelumnya dipulihkan</span>
              <button type="button" onClick={resetDraft} className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-200 hover:text-white">
                <TbRefresh size={13} /> Mulai baru
              </button>
            </div>
          )}
        </aside>

        {/* ---------- Panel form ---------- */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            isLast ? submit() : next(); // Enter = lanjut, bukan submit dini
          }}
          className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden flex flex-col"
        >
          {/* Header langkah */}
          <div className="flex items-center gap-3.5 px-5 md:px-7 py-5 border-b border-slate-100 dark:border-slate-800">
            <span className="relative isolate flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0B1B3F] text-white shadow-md">
              <span className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${Cur.accent} 0%, transparent 75%)` }} />
              <Cur.icon size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Langkah {step + 1} dari {STEPS.length}</p>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{Cur.title}</h3>
              <p className="text-xs text-slate-500">{Cur.desc}</p>
            </div>
          </div>

          <div key={step} className="flex-1 p-5 md:p-7 animate-in fade-in slide-in-from-right-2 duration-300">
            {/* STEP 0 */}
            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Nama kegiatan pelatihan" required icon={TbSchool} className="md:col-span-2" hint="Gunakan penamaan formal — tercetak di sertifikat peserta." error={err("Nama kegiatan")}>
                  <input
                    autoFocus
                    value={form.namaPelatihan}
                    onChange={(e) => set("namaPelatihan", e.target.value.toUpperCase())}
                    placeholder="CONTOH: PELATIHAN TEKNIS BUDIDAYA LAUT"
                    className={inputCls(err("Nama kegiatan"))}
                  />
                </Field>
                <Field label="Lokasi pelaksanaan" required icon={TbMapPin} hint="Kota / unit pelaksana, mis. BPPP Medan atau Online (Zoom)." error={err("Lokasi")}>
                  <input value={form.lokasiPelatihan} onChange={(e) => set("lokasiPelatihan", e.target.value)} placeholder="BPPP Medan / Online" className={inputCls(err("Lokasi"))} />
                </Field>
                <Field label="Unit penyelenggara" required icon={TbBuildingCommunity} hint="Unit kerja penanggung jawab pelatihan." error={err("Penyelenggara")}>
                  <select value={form.penyelenggaraPelatihan} onChange={(e) => set("penyelenggaraPelatihan", e.target.value)} className={inputCls(err("Penyelenggara"))}>
                    <option value="">Pilih unit penyelenggara</option>
                    {UPT.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Sektor / jenis program" required icon={TbLayoutGrid} hint="Kelompok besar bidang pelatihan sektor KP." error={err("Sektor")}>
                  <select
                    value={form.jenisProgram}
                    onChange={(e) => setForm((f) => ({ ...f, jenisProgram: e.target.value, bidangPelatihan: "", program: "" }))}
                    className={inputCls(err("Sektor"))}
                  >
                    <option value="">Pilih sektor</option>
                    {SEKTOR_PELATIHAN.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field
                  label="Klaster / rumpun"
                  required
                  icon={TbLayoutGrid}
                  hint={form.jenisProgram ? `${klasterOptions.length} klaster untuk sektor ${form.jenisProgram}` : "Pilih sektor dulu."}
                  error={err("Klaster")}
                >
                  <select
                    value={form.bidangPelatihan}
                    onChange={(e) => setForm((f) => ({ ...f, bidangPelatihan: e.target.value, program: "" }))}
                    className={inputCls(err("Klaster"))}
                    disabled={!dataRumpun || !form.jenisProgram}
                  >
                    <option value="">{!dataRumpun ? "Memuat klaster…" : !form.jenisProgram ? "Pilih sektor dulu" : "Pilih klaster"}</option>
                    {klasterOptions.map((k) => (
                      <option key={k.label} value={k.value}>
                        {k.label}
                        {k.programs ? ` (${k.programs} program)` : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Program pelatihan"
                  required
                  icon={TbFileText}
                  className="md:col-span-2"
                  hint="Sesuai klaster dipilih — tampil di sertifikat."
                  error={err("Program")}
                >
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select value={form.program} onChange={(e) => set("program", e.target.value)} disabled={!selectedRumpun} className={`${inputCls(err("Program"))} flex-1 disabled:opacity-50`}>
                      <option value="">{selectedRumpun ? (selectedRumpun.programs?.length ? "Pilih program" : "Belum ada program di klaster ini") : form.bidangPelatihan ? "Klaster belum terdaftar di master Rumpun" : "Pilih klaster dulu"}</option>
                      {selectedRumpun?.programs?.map((p) => (
                        <option key={p.id_program_pelatihan} value={p.name_indo || String(p.id_program_pelatihan)}>{p.name_indo}</option>
                      ))}
                    </select>
                    <Link
                      href={programPageHref}
                      target="_blank"
                      title="Tambah program di Master › Program Pelatihan (tab baru, draf form tetap tersimpan)"
                      className="h-11 shrink-0 px-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 inline-flex items-center justify-center gap-1.5"
                    >
                      <TbPlus size={15} /> Program baru
                    </Link>
                  </div>
                </Field>

                {form.program && <MateriPreview program={form.program} state={materi} href={`${programPageHref}?materi=${encodeURIComponent(form.program)}`} />}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Sumber pembiayaan" required icon={TbCurrencyDollar} hint="Mekanisme anggaran operasional pelatihan." error={err("Sumber pembiayaan")}>
                  <ChoiceGroup options={JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN} value={form.jenisPelatihan} onChange={(v) => set("jenisPelatihan", v)} error={err("Sumber pembiayaan")} />
                </Field>
                <Field label="Mode pelaksanaan" required icon={TbDeviceLaptop} hint="Metode penyampaian materi." error={err("Mode pelaksanaan")}>
                  <ChoiceGroup options={JENIS_PELAKSANAAN} value={form.pelaksanaanPelatihan} onChange={(v) => set("pelaksanaanPelatihan", v)} error={err("Mode pelaksanaan")} />
                </Field>
                {form.jenisPelatihan === BERBAYAR && (
                  <Field label="Biaya per peserta" required icon={TbCurrencyDollar} className="md:col-span-2 animate-in fade-in slide-in-from-top-1" hint="Tarif PNBP/BLU, belum termasuk akomodasi." error={err("Biaya pelatihan")}>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                      <input
                        inputMode="numeric"
                        value={form.hargaPelatihan ? new Intl.NumberFormat("id-ID").format(form.hargaPelatihan) : ""}
                        onChange={(e) => set("hargaPelatihan", Number(e.target.value.replace(/\D/g, "")) || 0)}
                        placeholder="0"
                        className={`${inputCls(err("Biaya pelatihan"))} pl-10 font-bold tabular-nums`}
                      />
                    </div>
                  </Field>
                )}
                <Field label="Dukungan program prioritas" required icon={RiVerifiedBadgeLine} hint="Keterkaitan dengan program strategis KKP." error={err("Program prioritas")}>
                  <select value={form.dukunganProgramTerobosan} onChange={(e) => set("dukunganProgramTerobosan", e.target.value)} className={inputCls(err("Program prioritas"))}>
                    <option value="">Pilih dukungan program</option>
                    {DUKUNGAN_PROGRAM_TEROBOSAN.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Standar penilaian" required icon={TbAward} hint="Metode evaluasi kompetensi peserta." error={err("Standar penilaian")}>
                  <select value={form.ujiKompetensi} onChange={(e) => set("ujiKompetensi", e.target.value)} className={inputCls(err("Standar penilaian"))}>
                    <option value="">Pilih standar penilaian</option>
                    {JENIS_PENILAIAN_PELATIHAN.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Tanggal mulai" required icon={TbClock} error={err("Tanggal mulai")}>
                    <input
                      type="date"
                      value={form.tanggalMulai}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((f) => ({ ...f, tanggalMulai: v, tanggalBerakhir: f.tanggalBerakhir && f.tanggalBerakhir < v ? "" : f.tanggalBerakhir }));
                      }}
                      className={inputCls(err("Tanggal mulai"))}
                    />
                  </Field>
                  <Field label="Tanggal berakhir" required icon={TbClock} hint={!form.tanggalMulai ? "Isi tanggal mulai dulu" : undefined} error={err("Tanggal berakhir")}>
                    <input
                      type="date"
                      min={form.tanggalMulai}
                      value={form.tanggalBerakhir}
                      disabled={!form.tanggalMulai}
                      onChange={(e) => set("tanggalBerakhir", e.target.value)}
                      className={`${inputCls(err("Tanggal berakhir"))} disabled:opacity-50`}
                    />
                  </Field>
                  {durasiHari(form.tanggalMulai, form.tanggalBerakhir) > 0 && (
                    <p className="md:col-span-2 -mt-2 text-xs text-slate-500">
                      Durasi <b className="text-slate-800 dark:text-white">{durasiHari(form.tanggalMulai, form.tanggalBerakhir)} hari</b> · {fmtDate(form.tanggalMulai)} – {fmtDate(form.tanggalBerakhir)}
                    </p>
                  )}
                </div>

                {/* Ringkasan */}
                <div className="rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <TbListCheck className="text-blue-600" size={18} />
                    <h4 className="text-sm font-black text-slate-800 dark:text-white">Tinjau sebelum membuka kelas</h4>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { step: 0, rows: [["Nama kegiatan", form.namaPelatihan], ["Lokasi", form.lokasiPelatihan], ["Penyelenggara", form.penyelenggaraPelatihan]] },
                      { step: 1, rows: [["Sektor", form.jenisProgram], ["Klaster", form.bidangPelatihan], ["Program", form.program]] },
                      {
                        step: 2,
                        rows: [
                          ["Pembiayaan", form.jenisPelatihan],
                          ...(form.jenisPelatihan === BERBAYAR ? [["Biaya / peserta", rupiah(form.hargaPelatihan)]] : []),
                          ["Mode", form.pelaksanaanPelatihan],
                          ["Program prioritas", form.dukunganProgramTerobosan],
                          ["Penilaian", form.ujiKompetensi],
                        ],
                      },
                    ].map((g) => (
                      <div key={g.step} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{STEPS[g.step].title}</p>
                          <button type="button" onClick={() => setStep(g.step)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline">
                            <TbPencil size={12} /> Ubah
                          </button>
                        </div>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                          {g.rows.map(([k, v]) => (
                            <div key={k} className="min-w-0">
                              <dt className="text-[10px] text-slate-400">{k}</dt>
                              <dd className={`text-[13px] font-semibold truncate ${v ? "text-slate-800 dark:text-slate-200" : "text-rose-500"}`}>{v || "Belum diisi"}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50/60 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900/40">
                    <TbAlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Data akan masuk ke alur persetujuan Pusat. Pastikan semuanya benar sebelum menekan <b>Buka Kelas</b>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Petunjuk field kurang (hanya setelah mencoba lanjut) */}
            {showErr && missing[step].length > 0 && (
              <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 ring-1 ring-rose-100 dark:ring-rose-900/40 px-4 py-3">
                <TbAlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300">Lengkapi untuk melanjutkan:</p>
                  <p className="mt-0.5 text-[11px] text-rose-600/90 dark:text-rose-300/80">{missing[step].join(" · ")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigasi */}
          <div className="flex items-center justify-between gap-3 px-5 md:px-7 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
              className="h-11 px-4 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 disabled:invisible"
            >
              <TbArrowLeft size={17} /> Sebelumnya
            </button>

            <div className="flex items-center gap-1.5" aria-hidden>
              {STEPS.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-[#0B1B3F] dark:bg-sky-400" : valid[i] ? "w-1.5 bg-emerald-400" : "w-1.5 bg-slate-200 dark:bg-slate-700"}`} />
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center gap-2 shadow-md shadow-blue-900/20 transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <TbLoader2 size={17} className="animate-spin" /> Menyimpan…
                </>
              ) : isLast ? (
                <>
                  <TbCheck size={17} /> Buka Kelas
                </>
              ) : (
                <>
                  Lanjutkan <TbArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ============================ UI ============================ */

/** Isi materi program terpilih. Kosong → info + tautan ke halaman Program Pelatihan untuk melengkapi. */
function MateriPreview({ program, state, href }: { program: string; state: { loading: boolean; data: MateriCategories | null; error: boolean; reload: () => void }; href: string }) {
  const cats = state.data ? Object.entries(state.data).filter(([, l]) => l?.length) : [];
  const total = cats.reduce(
    (a, [, l]) => {
      l.forEach((m) => {
        a.n++;
        a.t += Number(m.theory) || 0;
        a.p += Number(m.practice) || 0;
      });
      return a;
    },
    { n: 0, t: 0, p: 0 }
  );

  return (
    <div className="md:col-span-2 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0B1B3F] text-white">
        <p className="flex items-center gap-2 text-sm font-bold min-w-0">
          <TbBooks size={16} className="text-sky-300 shrink-0" /> <span className="truncate">Materi: {program}</span>
        </p>
        {state.data && (
          <span className="text-[11px] text-sky-100/80 tabular-nums">
            {total.n} materi · {total.t} JP teori · {total.p} JP praktik · <b className="text-white">{total.t + total.p} JP</b>
          </span>
        )}
      </div>

      {state.loading ? (
        <div className="p-4 space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : state.data ? (
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {cats.map(([cat, list]) => (
            <div key={cat} className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-1.5">{cat}</p>
              <ol className="space-y-1">
                {list.map((m, i) => (
                  <li key={`${cat}-${i}`} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-slate-700 dark:text-slate-200">
                      <span className="text-slate-400 tabular-nums mr-1.5">{i + 1}.</span>
                      {m.name_ind}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400 tabular-nums">T {Number(m.theory) || 0} · P {Number(m.practice) || 0}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
          <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <TbAlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <span>
              {state.error ? "Materi gagal dimuat." : <><b>Belum ada materi</b> untuk program ini.</>} Lengkapi materi di halaman Program Pelatihan dulu — langkah berikutnya terkunci sampai materi tersedia.
            </span>
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={state.reload}
              className="h-10 px-3.5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <TbRefresh size={15} /> Cek ulang
            </button>
            <Link
              href={href}
              target="_blank"
              className="shrink-0 h-10 px-4 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <TbBook2 size={15} /> Lengkapi materi <TbExternalLink size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = (error?: boolean) =>
  `w-full h-11 px-3.5 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ${error ? "ring-rose-300 bg-rose-50/40" : "ring-slate-200 dark:ring-slate-700"} text-sm font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 placeholder:font-normal transition`;

function Field({
  label,
  required,
  icon: Icon,
  hint,
  error,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  icon?: IconType;
  hint?: string;
  error?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
        {Icon && <Icon size={14} className="text-slate-400" />}
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500">
          <TbAlertCircle size={12} /> Wajib diisi
        </p>
      ) : (
        hint && <p className="text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  );
}

/** Pilihan sedikit → tombol segmen (lebih cepat dari dropdown) */
function ChoiceGroup({ options, value, onChange, error }: { options: readonly string[]; value: string; onChange: (v: string) => void; error?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-1.5 rounded-xl p-1 bg-slate-50 dark:bg-slate-800 ring-1 ${error ? "ring-rose-300" : "ring-slate-200 dark:ring-slate-700"}`}>
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={active}
            className={`flex-1 min-w-[110px] h-9 px-3 rounded-lg text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 ${active ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500 hover:text-slate-800 hover:bg-white dark:hover:bg-slate-700"}`}
          >
            {active && <TbCheck size={13} />} {o}
          </button>
        );
      })}
    </div>
  );
}

export default FormPelatihan;
