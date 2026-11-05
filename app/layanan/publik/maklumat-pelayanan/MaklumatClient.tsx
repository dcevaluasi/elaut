"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Calendar, Download, ExternalLink, FileText, Maximize2, RotateCcw, X } from "lucide-react";
import { getAllMaklumatPelayanan } from "@/utils/feedback";
import { getDirectImageUrl } from "@/utils/imageHelper";

interface Maklumat {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt?: { seconds: number; nanoseconds: number };
}

const card = "rounded-2xl bg-white/[0.04] ring-1 ring-white/10";
const fmtDate = (s?: number) => (s ? new Date(s * 1000).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "");

export default function MaklumatClient() {
    const [data, setData] = useState<Maklumat | null>(null);
    const [state, setState] = useState<"loading" | "ok" | "empty" | "error">("loading");
    const [tries, setTries] = useState(0);
    const [zoom, setZoom] = useState(false);

    useEffect(() => {
        let alive = true;
        setState("loading");
        getAllMaklumatPelayanan()
            .then((list) => {
                if (!alive) return;
                const m = (list?.[0] as Maklumat) ?? null;
                setData(m);
                setState(m ? "ok" : "empty");
            })
            .catch((e) => {
                console.error(e);
                if (alive) setState("error");
            });
        return () => {
            alive = false;
        };
    }, [tries]);

    useEffect(() => {
        if (!zoom) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [zoom]);

    if (state === "loading")
        return (
            <div className={`${card} p-4 md:p-6`} aria-busy="true" aria-label="Memuat maklumat">
                <div className="mx-auto aspect-[3/4] max-h-[720px] w-full max-w-xl rounded-xl bg-white/[0.06] animate-pulse" />
            </div>
        );

    if (state !== "ok" || !data)
        return (
            <div className={`${card} flex flex-col items-center px-4 py-16 text-center`}>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] text-slate-400"><FileText className="h-6 w-6" /></span>
                <h2 className="mt-3 font-calsans text-lg">{state === "error" ? "Gagal memuat maklumat" : "Maklumat belum dipublikasikan"}</h2>
                <p className="mt-1 max-w-sm text-sm text-slate-400">{state === "error" ? "Periksa koneksi internet lalu coba lagi." : "Dokumen maklumat resmi akan segera tersedia di halaman ini."}</p>
                {state === "error" && (
                    <button type="button" onClick={() => setTries((t) => t + 1)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold hover:bg-blue-500">
                        <RotateCcw className="h-4 w-4" /> Coba lagi
                    </button>
                )}
            </div>
        );

    const src = getDirectImageUrl(data.imageUrl);
    const updated = fmtDate(data.createdAt?.seconds);

    return (
        <>
            <figure className={`${card} overflow-hidden`}>
                <button type="button" onClick={() => setZoom(true)} className="group relative block w-full bg-white/[0.02] p-3 md:p-6 cursor-zoom-in" aria-label="Perbesar maklumat pelayanan">
                    <Image src={src} alt={data.title || "Maklumat pelayanan E-LAUT"} width={1200} height={1600} sizes="(max-width: 768px) 100vw, 720px" priority className="mx-auto h-auto max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl" />
                    <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-lg bg-[#0B1B3F]/85 px-2.5 py-1.5 text-[11px] font-bold opacity-0 ring-1 ring-white/15 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <Maximize2 className="h-3.5 w-3.5" /> Perbesar
                    </span>
                </button>
                <figcaption className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{data.title || "Maklumat Pelayanan"}</p>
                        {updated && <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400"><Calendar className="h-3.5 w-3.5" /> Diperbarui {updated}</p>}
                    </div>
                    <div className="flex gap-2">
                        <a href={src} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold hover:bg-blue-500">
                            <ExternalLink className="h-4 w-4" /> Buka penuh
                        </a>
                        <a href={src} download className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-4 text-xs font-bold ring-1 ring-white/15 hover:bg-white/[0.12]">
                            <Download className="h-4 w-4" /> Unduh
                        </a>
                    </div>
                </figcaption>
                {data.description && <p className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-slate-400">{data.description}</p>}
            </figure>

            {zoom && (
                <div role="dialog" aria-modal="true" aria-label="Maklumat pelayanan ukuran penuh" className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#020617]/90 p-3 backdrop-blur-sm" onClick={() => setZoom(false)}>
                    <button type="button" onClick={() => setZoom(false)} aria-label="Tutup" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 hover:bg-white/20">
                        <X className="h-5 w-5" />
                    </button>
                    <Image src={src} alt="" width={1600} height={2133} sizes="100vw" className="h-auto max-h-full w-auto max-w-full rounded-lg object-contain" />
                </div>
            )}
        </>
    );
}
