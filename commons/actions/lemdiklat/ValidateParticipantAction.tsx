"use client";

import React, { useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { elautBaseUrl } from "@/constants/urls";
import Toast from "@/commons/Toast";
import { DIALOG_TEXTS } from "@/constants/texts";
import { UserPelatihan } from "@/types/product";
import { TbAlertTriangle, TbCheck, TbCircleCheck, TbLoader2, TbRefresh, TbUserCheck, TbX } from "react-icons/tb";

interface ValidateParticipantActionProps {
    data: UserPelatihan[];
    onSuccess?: () => void;
}

const CONCURRENCY = 4;
const fmt = (n: number) => n.toLocaleString("id-ID");

export function ValidateParticipantAction({ data, onSuccess }: ValidateParticipantActionProps) {
    const [open, setOpen] = useState(false);
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(0);
    const [failed, setFailed] = useState<UserPelatihan[]>([]);
    const [finished, setFinished] = useState(false);

    // Hanya peserta yang belum valid yang perlu diproses (dulu semua dikirim ulang)
    const pending = useMemo(() => data.filter((u) => u.Keterangan !== "Valid"), [data]);
    const alreadyValid = data.length - pending.length;
    const target = failed.length ? failed : pending;
    const progress = target.length ? Math.round((done / target.length) * 100) : 0;

    const dialogData = DIALOG_TEXTS["Validasi Grouping Peserta"];

    const reset = () => {
        setDone(0);
        setFailed([]);
        setFinished(false);
    };

    const close = (o = false) => {
        if (running) return;
        setOpen(o);
        if (!o) {
            if (finished) onSuccess?.();
            reset();
        }
    };

    const run = async () => {
        const queue = [...target];
        if (!queue.length) return;
        setRunning(true);
        setDone(0);
        const fails: UserPelatihan[] = [];

        const worker = async () => {
            while (queue.length) {
                const u = queue.shift()!;
                try {
                    const fd = new FormData();
                    fd.append("Keterangan", "Valid");
                    await axios.put(`${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${u.IdUserPelatihan}`, fd, {
                        headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
                    });
                } catch (e) {
                    console.error("Gagal validasi", u.IdUserPelatihan, e);
                    fails.push(u);
                } finally {
                    setDone((d) => d + 1);
                }
            }
        };
        const total = queue.length;
        await Promise.all(Array.from({ length: Math.min(CONCURRENCY, total) }, worker));

        setRunning(false);
        setFinished(true);
        setFailed(fails);
        const ok = total - fails.length;
        Toast.fire({
            icon: fails.length ? (ok ? "warning" : "error") : "success",
            title: fails.length ? `${fmt(ok)} valid, ${fmt(fails.length)} gagal` : "Validasi selesai",
            text: fails.length ? "Klik “Ulangi yang gagal” untuk mencoba lagi." : `${fmt(ok)} peserta berhasil divalidasi.`,
        });
        if (!fails.length) {
            setOpen(false);
            reset();
            onSuccess?.();
        }
    };

    return (
        <>
            {/* Tombol putih — sama dengan aksi lain */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="group h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm hover:bg-slate-50 hover:ring-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
                <TbUserCheck className="w-4 h-4 text-emerald-600 transition-transform duration-300 group-hover:-rotate-6" />
                Validasi Peserta
                {pending.length > 0 ? (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-black inline-flex items-center justify-center tabular-nums" title="Belum valid">
                        {pending.length}
                    </span>
                ) : (
                    data.length > 0 && <TbCircleCheck className="w-4 h-4 text-emerald-500" title="Semua valid" />
                )}
            </button>

            <Dialog open={open} onOpenChange={close}>
                <DialogContent
                    onInteractOutside={(e) => running && e.preventDefault()}
                    onEscapeKeyDown={(e) => running && e.preventDefault()}
                    className="w-[calc(100vw-1.5rem)] sm:w-full max-w-md sm:max-w-md max-h-[calc(100dvh-2rem)] p-0 gap-0 flex flex-col overflow-hidden rounded-3xl sm:rounded-3xl border-0 bg-slate-50 dark:bg-slate-950 shadow-2xl [&>button]:hidden"
                >
                    {/* Header hero */}
                    <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 py-5">
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#10B981_0%,transparent_60%)] opacity-80" />
                        <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                        <TbUserCheck aria-hidden className="pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 text-emerald-300 opacity-20" />
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">Validasi Massal</p>
                                <DialogTitle className="mt-1 text-base md:text-lg font-black text-white leading-snug">Validasi data peserta</DialogTitle>
                                <DialogDescription className="text-xs text-blue-100/70">Tandai peserta sebagai “Valid” sekaligus.</DialogDescription>
                            </div>
                            <button type="button" onClick={() => close(false)} disabled={running} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20 disabled:opacity-40">
                                <TbX className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <Stat label="Total peserta" value={data.length} tone="slate" />
                            <Stat label="Sudah valid" value={alreadyValid} tone="emerald" />
                            <Stat label="Akan divalidasi" value={pending.length} tone={pending.length ? "amber" : "slate"} />
                        </div>

                        {pending.length === 0 && !failed.length ? (
                            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 ring-1 ring-emerald-200 dark:ring-emerald-900/40 px-3.5 py-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                <TbCircleCheck className="w-4 h-4 shrink-0" /> Semua peserta sudah valid. Tidak ada yang perlu diproses.
                            </p>
                        ) : (
                            <p className="rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 px-3.5 py-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{dialogData?.desc}</p>
                        )}

                        {(running || finished) && (
                            <div className="rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-3.5">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-600 dark:text-slate-300">{running ? "Memvalidasi…" : failed.length ? "Selesai dengan kendala" : "Selesai"}</span>
                                    <span className="tabular-nums text-slate-500">
                                        {fmt(done)}/{fmt(running ? target.length : done)} · {running ? progress : 100}%
                                    </span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${failed.length && !running ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${running ? progress : 100}%` }} />
                                </div>
                            </div>
                        )}

                        {failed.length > 0 && !running && (
                            <div className="rounded-xl ring-1 ring-rose-200 dark:ring-rose-900/40 overflow-hidden">
                                <p className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50/70 dark:bg-rose-950/20 text-xs font-bold text-rose-700 dark:text-rose-300">
                                    <TbAlertTriangle className="w-4 h-4" /> {fmt(failed.length)} peserta gagal divalidasi
                                </p>
                                <ul className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                    {failed.map((u) => (
                                        <li key={u.IdUserPelatihan} className="flex items-center justify-between gap-2 px-3.5 py-2 text-xs">
                                            <span className="min-w-0 truncate font-semibold text-slate-700 dark:text-slate-200">{u.Nama}</span>
                                            <span className="shrink-0 text-[11px] text-slate-400 tabular-nums">Reg {u.IdUserPelatihan}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={() => close(false)} disabled={running} className="h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40">
                            {finished ? "Tutup" : "Batal"}
                        </button>
                        <button
                            type="button"
                            onClick={run}
                            disabled={running || target.length === 0}
                            className="h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-40"
                        >
                            {running ? <TbLoader2 className="w-4 h-4 animate-spin" /> : failed.length ? <TbRefresh className="w-4 h-4" /> : <TbCheck className="w-4 h-4" />}
                            {running ? `Memproses ${fmt(done)}/${fmt(target.length)}…` : failed.length ? `Ulangi ${fmt(failed.length)} yang gagal` : `Validasikan ${fmt(pending.length)} peserta`}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

const TONE = {
    slate: "bg-white dark:bg-slate-900 text-slate-800 dark:text-white ring-slate-200 dark:ring-slate-700",
    emerald: "bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 ring-emerald-100 dark:ring-emerald-900/40",
    amber: "bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 ring-amber-100 dark:ring-amber-900/40",
} as const;

function Stat({ label, value, tone }: { label: string; value: number; tone: keyof typeof TONE }) {
    return (
        <div className={`rounded-xl ring-1 px-3 py-2 ${TONE[tone]}`}>
            <p className="text-[10px] font-semibold opacity-70 truncate">{label}</p>
            <p className="text-xl font-black tabular-nums">{fmt(value)}</p>
        </div>
    );
}
