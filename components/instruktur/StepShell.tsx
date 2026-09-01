"use client";

import React from "react";
import { Accent } from "./accents";

type StepShellProps = {
    judul: string;
    deskripsi: string;
    accent: Accent;
    children: React.ReactNode;
};

/** Kerangka satu langkah: batang warna, judul, deskripsi, lalu grid isian. */
export default function StepShell({
    judul,
    deskripsi,
    accent,
    children,
}: StepShellProps) {
    return (
        <div>
            <div className="flex items-start gap-3 mb-7">
                <span className={`mt-1 h-10 w-1 rounded-full shrink-0 ${accent.bar}`} />
                <div>
                    <h2 className="font-calsans text-xl md:text-2xl text-slate-800 dark:text-white leading-tight">
                        {judul}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xl">
                        {deskripsi}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                {children}
            </div>
        </div>
    );
}
