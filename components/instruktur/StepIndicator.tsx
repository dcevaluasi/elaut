"use client";

import React from "react";
import { TbCheck } from "react-icons/tb";
import { ACCENTS } from "./accents";
import { STEPS } from "./steps";

type StepIndicatorProps = {
    langkahAktif: number;
    /** Persentase field profil yang sudah terisi, 0–100. */
    kelengkapan: number;
    /** Melompat ke langkah yang sudah dilewati. */
    onPilihLangkah: (langkah: number) => void;
};

export default function StepIndicator({
    langkahAktif,
    kelengkapan,
    onPilihLangkah,
}: StepIndicatorProps) {
    const accentAktif = ACCENTS[STEPS[langkahAktif].accent];

    return (
        <div className="px-6 md:px-10 pt-8 pb-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-b from-gray-50/60 to-transparent dark:from-white/[0.02]">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-6">
                <h1 className="font-calsans text-2xl md:text-3xl text-slate-800 dark:text-white leading-none">
                    Lengkapi profil instruktur
                </h1>
                <p className="text-xs font-semibold text-slate-400">
                    Langkah {langkahAktif + 1} dari {STEPS.length}
                </p>
            </div>

            {/* Stepper — daftar bernomor karena urutannya memang berurut */}
            <ol className="flex items-start gap-1 md:gap-2 mb-6">
                {STEPS.map((step, index) => {
                    const accent = ACCENTS[step.accent];
                    const selesai = index < langkahAktif;
                    const aktif = index === langkahAktif;
                    const bisaDiklik = index <= langkahAktif;

                    return (
                        <li key={step.id} className="flex-1 min-w-0">
                            <button
                                type="button"
                                disabled={!bisaDiklik}
                                onClick={() => onPilihLangkah(index)}
                                aria-current={aktif ? "step" : undefined}
                                className={`w-full flex flex-col items-center gap-2 rounded-2xl py-2 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${bisaDiklik
                                    ? "cursor-pointer hover:bg-white dark:hover:bg-white/5"
                                    : "cursor-not-allowed"
                                    }`}
                            >
                                <span
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${aktif
                                        ? accent.chipAktif
                                        : selesai
                                            ? accent.chipSelesai
                                            : "bg-gray-100 dark:bg-white/5 text-slate-300"
                                        }`}
                                >
                                    {selesai ? <TbCheck size={16} strokeWidth={3} /> : index + 1}
                                </span>

                                <span
                                    className={`text-[10px] md:text-[11px] font-bold uppercase tracking-wider truncate max-w-full ${aktif
                                        ? "text-slate-700 dark:text-white"
                                        : selesai
                                            ? "text-slate-500"
                                            : "text-slate-300"
                                        }`}
                                >
                                    <span className="hidden sm:inline">{step.label}</span>
                                    <span className="sm:hidden">{step.labelPendek}</span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>

            {/* Kelengkapan data — angka yang benar-benar berubah saat mengetik */}
            <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${accentAktif.progress}`}
                        style={{ width: `${kelengkapan}%` }}
                    />
                </div>
                <span className="text-[11px] font-black text-slate-500 tabular-nums shrink-0">
                    {kelengkapan}% lengkap
                </span>
            </div>
        </div>
    );
}
