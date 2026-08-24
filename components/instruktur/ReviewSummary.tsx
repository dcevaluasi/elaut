"use client";

import React from "react";
import { TbPencil, TbExternalLink } from "react-icons/tb";
import { ACCENTS } from "./accents";
import { STEPS, InstrukturFormValues } from "./steps";
import { labelStatusKeaktifan } from "@/constants/instruktur";

const LABEL: Record<keyof InstrukturFormValues, string> = {
    nama: "Nama lengkap",
    nip: "NIP",
    email: "Email",
    no_telpon: "Nomor WhatsApp",
    pendidikkan_terakhir: "Pendidikan terakhir",
    Golongan: "Pangkat / golongan",
    eselon_1: "Unit kerja eselon I",
    eselon_2: "Unit kerja eselon II",
    id_lemdik: "Satuan pendidikan",
    unit_kerja: "Satuan pendidikan",
    status: "Status keaktifan",
    jenis_pelatih: "Jenis pelatih",
    jenjang_jabatan: "Jenjang jabatan",
    bidang_keahlian: "Bidang keahlian",
    jenis_sisjamu: "Program SISJAMU yang diampu",
    label: "Label",
    jenis_label: "Jenis label",
    metodologi_pelatihan: "Metodologi pelatihan",
    pelatihan_pelatih: "Training of Trainer (ToT)",
    kompetensi_teknis: "Kompetensi teknis",
    management_of_training: "Management of Training (MoT)",
    training_officer_course: "Training Officer Course (ToC)",
    link_data_dukung_sertifikat: "Data dukung lainnya",
};

/**
 * Field yang ditampilkan di ringkasan tapi tidak ada di `STEPS[n].fields`
 * karena ditetapkan admin dan tidak bisa diubah instruktur. Tetap ditampilkan
 * supaya instruktur bisa memverifikasi penempatannya sebelum menyimpan.
 */
const FIELD_TERKUNCI_PER_LANGKAH: Record<number, (keyof InstrukturFormValues)[]> = {
    1: ["unit_kerja", "status"],
};

const FIELD_TAUTAN: (keyof InstrukturFormValues)[] = [
    "metodologi_pelatihan",
    "pelatihan_pelatih",
    "kompetensi_teknis",
    "management_of_training",
    "training_officer_course",
    "link_data_dukung_sertifikat",
];

function tampilkanNilai(
    field: keyof InstrukturFormValues,
    nilai: string,
): string {
    if (!nilai) return "";
    if (field === "status") return labelStatusKeaktifan(nilai);
    return nilai;
}

export default function ReviewSummary({
    values,
    onUbah,
}: {
    values: InstrukturFormValues;
    onUbah: (langkah: number) => void;
}) {
    const step = STEPS[4];

    return (
        <div>
            <div className="flex items-start gap-3 mb-7">
                <span
                    className={`mt-1 h-10 w-1 rounded-full shrink-0 ${ACCENTS[step.accent].bar}`}
                />
                <div>
                    <h2 className="font-calsans text-xl md:text-2xl text-slate-800 dark:text-white leading-tight">
                        {step.judul}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xl">
                        {step.deskripsi}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {STEPS.slice(0, 4).map((bagian) => {
                    const accent = ACCENTS[bagian.accent];

                    return (
                        <section
                            key={bagian.id}
                            className="rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden"
                        >
                            <header className="flex items-center justify-between gap-3 px-5 py-4 bg-gray-50/70 dark:bg-white/[0.02]">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span
                                        className={`h-6 w-1 rounded-full shrink-0 ${accent.bar}`}
                                    />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 truncate">
                                        {bagian.label}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onUbah(bagian.id)}
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-white dark:hover:bg-white/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${accent.teks}`}
                                >
                                    <TbPencil size={14} />
                                    Ubah
                                </button>
                            </header>

                            <dl className="divide-y divide-gray-50 dark:divide-white/5">
                                {[
                                    ...bagian.fields,
                                    ...(FIELD_TERKUNCI_PER_LANGKAH[bagian.id] ?? []),
                                ].map((field) => {
                                    const nilai = tampilkanNilai(
                                        field,
                                        String(values[field] ?? ""),
                                    );
                                    const tautan = FIELD_TAUTAN.includes(field);

                                    return (
                                        <div
                                            key={field}
                                            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-5 py-3.5"
                                        >
                                            <dt className="w-full sm:w-56 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                {LABEL[field]}
                                            </dt>
                                            <dd className="min-w-0 flex-1 text-sm font-bold text-slate-700 dark:text-white break-words">
                                                {!nilai ? (
                                                    <span className="font-semibold text-slate-300">
                                                        Belum diisi
                                                    </span>
                                                ) : tautan ? (
                                                    <a
                                                        href={nilai}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-primary hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded"
                                                    >
                                                        <span className="truncate max-w-[22rem]">{nilai}</span>
                                                        <TbExternalLink size={14} className="shrink-0" />
                                                    </a>
                                                ) : (
                                                    nilai
                                                )}
                                            </dd>
                                        </div>
                                    );
                                })}
                            </dl>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
