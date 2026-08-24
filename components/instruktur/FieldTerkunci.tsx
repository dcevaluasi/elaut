"use client";

import React from "react";
import { IconType } from "react-icons";
import { TbLock } from "react-icons/tb";

type FieldTerkunciProps = {
    label: string;
    nilai: string;
    icon: IconType;
    /** Alasan field ini tidak bisa diubah instruktur. */
    alasan: string;
    /** Ditampilkan saat nilai masih kosong di basis data. */
    kosongLabel?: string;
};

/**
 * Menampilkan data yang ditetapkan admin lemdik dan tidak boleh diubah
 * instruktur sendiri — satuan pendidikan dan status keaktifan.
 *
 * Ditampilkan alih-alih disembunyikan supaya instruktur bisa memverifikasi
 * penempatannya dan tahu harus menghubungi admin bila keliru. Nilainya tidak
 * ikut dikirim saat menyimpan; backend pun menolaknya lewat daftar kolom yang
 * diizinkan di `UpdateInstrukturSelf`.
 */
export default function FieldTerkunci({
    label,
    nilai,
    icon: Icon,
    alasan,
    kosongLabel = "Belum ditetapkan admin",
}: FieldTerkunciProps) {
    const terisi = nilai.trim() !== "";

    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                {label}
            </label>

            <div className="w-full min-h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.03] px-4 py-3.5 flex items-center gap-3">
                <Icon aria-hidden size={20} className="text-slate-400 shrink-0" />
                <span
                    className={`font-bold text-sm leading-snug ${terisi
                        ? "text-slate-500 dark:text-slate-300"
                        : "text-slate-400 italic font-semibold"
                        }`}
                >
                    {terisi ? nilai : kosongLabel}
                </span>
                <TbLock
                    aria-hidden
                    size={16}
                    className="text-slate-400 shrink-0 ml-auto"
                />
            </div>

            <p className="pl-1 text-[11px] font-medium text-slate-400 flex items-start gap-1.5">
                <TbLock aria-hidden size={13} className="mt-0.5 shrink-0" />
                {alasan}
            </p>
        </div>
    );
}
