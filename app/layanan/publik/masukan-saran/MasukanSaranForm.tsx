"use client";

/** Form masukan & saran — ringan (tanpa framer-motion), validasi inline, rating bintang aksesibel. */
import React, { useState } from "react";
import { Briefcase, CheckCircle2, Cpu, Info, Layers, LayoutTemplate, Loader2, MessageSquareText, RotateCcw, Send, Smartphone, Star, User, Zap } from "lucide-react";
import { saveFeedback } from "@/utils/feedback";
import Toast from "@/commons/Toast";

type RatingKey = "kemudahanAkses" | "kemudahanPenggunaan" | "kecepatan" | "desainTampilan" | "kelengkapanFitur" | "kejelasanInformasi" | "responsifMobile" | "kepuasanKeseluruhan";
interface FeedbackData { nama: string; asalInstansi: string; masukanSaran: string; ratings: Record<RatingKey, number> }

const QUESTIONS: { key: RatingKey; label: string; icon: React.ElementType }[] = [
    { key: "kemudahanAkses", label: "Kemudahan akses ke E-LAUT", icon: Layers },
    { key: "kemudahanPenggunaan", label: "Kemudahan penggunaan", icon: Zap },
    { key: "kecepatan", label: "Kecepatan & performa", icon: Cpu },
    { key: "desainTampilan", label: "Desain & tampilan", icon: LayoutTemplate },
    { key: "kelengkapanFitur", label: "Kelengkapan fitur", icon: Info },
    { key: "kejelasanInformasi", label: "Kejelasan informasi & panduan", icon: MessageSquareText },
    { key: "responsifMobile", label: "Tampilan di perangkat mobile", icon: Smartphone },
    { key: "kepuasanKeseluruhan", label: "Kepuasan keseluruhan", icon: Star },
];
const LABEL = ["", "Sangat kurang", "Kurang", "Cukup", "Baik", "Sangat baik"];
const MAX_PESAN = 1000;
const MIN_PESAN = 10;

const EMPTY: FeedbackData = {
    nama: "",
    asalInstansi: "",
    masukanSaran: "",
    ratings: QUESTIONS.reduce((o, q) => ({ ...o, [q.key]: 0 }), {} as Record<RatingKey, number>),
};

const card = "rounded-2xl bg-white/[0.04] ring-1 ring-white/10";
const input = "w-full rounded-xl bg-[#020617]/50 text-sm text-white ring-1 border-none outline-none placeholder:text-blue-100/35 focus:ring-2 focus:ring-sky-400/60 transition";

function Stars({ q, value, onChange }: { q: (typeof QUESTIONS)[number]; value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);
    const shown = hover || value;
    const name = `rate-${q.key}`;
    return (
        <fieldset className={`${card} p-4 transition-colors hover:bg-white/[0.06]`}>
            <legend className="sr-only">{q.label}</legend>
            <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <q.icon className="h-4 w-4 text-sky-300" aria-hidden /> {q.label}
                </span>
                <span className={`text-[11px] font-bold ${shown ? "text-amber-300" : "text-slate-500"}`}>{shown ? LABEL[shown] : "Belum dinilai"}</span>
            </div>
            <div className="mt-3 flex gap-1" role="radiogroup" aria-label={q.label} onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
                        <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" aria-label={`${n} — ${LABEL[n]}`} />
                        <Star className={`h-8 w-8 transition-transform peer-focus-visible:scale-110 peer-focus-visible:drop-shadow-[0_0_6px_rgba(56,189,248,0.8)] hover:scale-110 ${n <= shown ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

export default function MasukanSaranForm() {
    const [data, setData] = useState<FeedbackData>(EMPTY);
    const [touched, setTouched] = useState(false);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    const rated = Object.values(data.ratings).filter((v) => v > 0).length;
    const avg = rated ? Object.values(data.ratings).reduce((a, b) => a + b, 0) / rated : 0;
    const errors = {
        nama: !data.nama.trim() ? "Nama wajib diisi." : "",
        asalInstansi: !data.asalInstansi.trim() ? "Instansi wajib diisi." : "",
        masukanSaran: data.masukanSaran.trim().length < MIN_PESAN ? `Tulis minimal ${MIN_PESAN} karakter.` : "",
        ratings: rated === 0 ? "Beri minimal satu penilaian." : "",
    };
    const err = (k: keyof typeof errors) => (touched ? errors[k] : "");
    const valid = !Object.values(errors).some(Boolean);

    const set = <K extends keyof FeedbackData>(k: K, v: FeedbackData[K]) => setData((d) => ({ ...d, [k]: v }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        if (!valid) {
            const first = (["nama", "asalInstansi", "masukanSaran"] as const).find((k) => errors[k]);
            if (first) document.getElementById(`f-${first}`)?.focus();
            else document.getElementById("penilaian")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setSaving(true);
        try {
            await saveFeedback({ ...data, nama: data.nama.trim(), asalInstansi: data.asalInstansi.trim(), masukanSaran: data.masukanSaran.trim() });
            setDone(true);
            window.scrollTo({ top: document.getElementById("form-masukan")!.offsetTop - 100, behavior: "smooth" });
        } catch (e) {
            console.error(e);
            Toast.fire({ icon: "error", title: "Gagal mengirim", text: "Periksa koneksi lalu coba lagi." });
        } finally {
            setSaving(false);
        }
    };

    const again = () => {
        setData(EMPTY);
        setTouched(false);
        setDone(false);
    };

    if (done)
        return (
            <div id="form-masukan" className={`${card} relative isolate overflow-hidden px-6 py-14 text-center`} role="status">
                <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_0%,#10B98133_0%,transparent_70%)]" />
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"><CheckCircle2 className="h-8 w-8" /></span>
                <h2 className="mt-4 font-calsans text-2xl">Terima kasih, {data.nama.split(" ")[0]}!</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-blue-100/70">Masukan Anda sudah kami terima dan akan ditinjau tim pengembang E-LAUT untuk perbaikan layanan.</p>
                <button type="button" onClick={again} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white/[0.06] px-5 text-sm font-bold ring-1 ring-white/15 hover:bg-white/[0.12]">
                    <RotateCcw className="h-4 w-4" /> Kirim masukan lain
                </button>
            </div>
        );

    return (
        <form id="form-masukan" onSubmit={submit} noValidate className="space-y-6" aria-describedby="form-hint">
            <p id="form-hint" className="text-xs text-slate-400">Kolom bertanda <span className="text-rose-400">*</span> wajib diisi. Data Anda hanya dipakai untuk evaluasi layanan.</p>

            {/* Langkah 1: identitas & pesan */}
            <section aria-labelledby="s1" className={`${card} p-5 md:p-6 space-y-4`}>
                <h2 id="s1" className="flex items-center gap-2 font-calsans text-lg">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-xs font-black">1</span> Identitas &amp; pesan
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <label htmlFor="f-nama" className="text-xs font-semibold text-slate-300">Nama lengkap <span className="text-rose-400">*</span></label>
                        <div className="relative">
                            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
                            <input id="f-nama" autoComplete="name" value={data.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Nama Anda" aria-invalid={!!err("nama")} aria-describedby="e-nama" className={`${input} h-12 pl-10 pr-3 ${err("nama") ? "ring-rose-400/60" : "ring-white/10"}`} />
                        </div>
                        <p id="e-nama" className="text-[11px] text-rose-300">{err("nama")}</p>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="f-asalInstansi" className="text-xs font-semibold text-slate-300">Instansi / lembaga <span className="text-rose-400">*</span></label>
                        <div className="relative">
                            <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
                            <input id="f-asalInstansi" autoComplete="organization" value={data.asalInstansi} onChange={(e) => set("asalInstansi", e.target.value)} placeholder="Mis. Kelompok Pembudidaya, Dinas KP, Umum" aria-invalid={!!err("asalInstansi")} aria-describedby="e-instansi" className={`${input} h-12 pl-10 pr-3 ${err("asalInstansi") ? "ring-rose-400/60" : "ring-white/10"}`} />
                        </div>
                        <p id="e-instansi" className="text-[11px] text-rose-300">{err("asalInstansi")}</p>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="f-masukanSaran" className="text-xs font-semibold text-slate-300">Masukan &amp; saran <span className="text-rose-400">*</span></label>
                            <span className={`text-[11px] tabular-nums ${data.masukanSaran.length > MAX_PESAN * 0.9 ? "text-amber-300" : "text-slate-500"}`}>{data.masukanSaran.length}/{MAX_PESAN}</span>
                        </div>
                        <textarea id="f-masukanSaran" rows={5} maxLength={MAX_PESAN} value={data.masukanSaran} onChange={(e) => set("masukanSaran", e.target.value)} placeholder="Ceritakan kendala, fitur yang Anda butuhkan, atau saran perbaikan…" aria-invalid={!!err("masukanSaran")} aria-describedby="e-pesan" className={`${input} resize-y px-4 py-3 leading-relaxed ${err("masukanSaran") ? "ring-rose-400/60" : "ring-white/10"}`} />
                        <p id="e-pesan" className="text-[11px] text-rose-300">{err("masukanSaran")}</p>
                    </div>
                </div>
            </section>

            {/* Langkah 2: penilaian */}
            <section id="penilaian" aria-labelledby="s2" className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <h2 id="s2" className="flex items-center gap-2 font-calsans text-lg">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-xs font-black">2</span> Penilaian aplikasi
                    </h2>
                    <p className="text-xs text-slate-400">
                        <b className="text-white">{rated}</b>/{QUESTIONS.length} dinilai{rated > 0 && <> · rata-rata <b className="text-amber-300">{avg.toFixed(1)}</b> ★</>}
                    </p>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-amber-400 transition-all" style={{ width: `${(rated / QUESTIONS.length) * 100}%` }} /></div>
                {err("ratings") && <p className="text-[11px] text-rose-300" role="alert">{err("ratings")}</p>}
                <div className="grid gap-2.5 md:grid-cols-2">
                    {QUESTIONS.map((q) => (
                        <Stars key={q.key} q={q} value={data.ratings[q.key]} onChange={(v) => set("ratings", { ...data.ratings, [q.key]: v })} />
                    ))}
                </div>
            </section>

            <div className="sticky bottom-4 z-20">
                <button type="submit" disabled={saving} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-bold shadow-xl shadow-blue-600/30 transition-colors hover:bg-blue-500 disabled:opacity-60">
                    {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Mengirim…</> : <><Send className="h-4 w-4" /> Kirim masukan</>}
                </button>
            </div>
        </form>
    );
}
