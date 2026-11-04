"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { IconType } from "react-icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Toast from "@/commons/Toast";
import { elautBaseUrl, urlFileBeritaAcara } from "@/constants/urls";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { PelatihanMasyarakat } from "@/types/product";
import { useFetchDataPusat } from "@/hooks/elaut/pusat/useFetchDataPusat";
import { breakdownStatus } from "@/lib/utils";
import { generatePelatihanMessage } from "@/utils/messages";
import { TbCheck, TbChevronDown, TbExternalLink, TbFileText, TbLoader2, TbMessage2, TbSend, TbShieldCheck, TbTrash, TbUpload, TbX } from "react-icons/tb";

interface SendNoteActionProps {
    idPelatihan: string;
    title: string;
    description: string;
    buttonLabel: string;
    icon: IconType;
    buttonColor?: string;
    onSuccess: () => void;
    status: string;
    pelatihan: PelatihanMasyarakat;
}

const TONE: Record<string, { accent: string; icon: string; btn: string }> = {
    blue: { accent: "#3B82F6", icon: "text-blue-600", btn: "bg-[#0B1B3F] hover:bg-blue-700" },
    teal: { accent: "#10B981", icon: "text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700" },
    rose: { accent: "#F43F5E", icon: "text-rose-600", btn: "bg-rose-600 hover:bg-rose-700" },
    amber: { accent: "#F59E0B", icon: "text-amber-600", btn: "bg-amber-600 hover:bg-amber-700" },
    neutral: { accent: "#64748B", icon: "text-slate-600", btn: "bg-slate-700 hover:bg-slate-800" },
};
const UPLOAD_STATUS = ["1.25", "1.5", "5", "7", "9"];
const WA_DELAY_MS = 60_000; // jeda antar penerima (bukan setelah pesan terakhir)

const SendNoteAction: React.FC<SendNoteActionProps> = ({ idPelatihan, title, description, buttonLabel, icon: Icon, buttonColor = "blue", onSuccess, status, pelatihan }) => {
    const tone = TONE[buttonColor] || TONE.blue;
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [verifikatorId, setVerifikatorId] = useState(String(pelatihan?.VerifikatorPelatihan ?? ""));
    const [file, setFile] = useState<File | null>(null);

    const { adminPusatData, loading: loadingPusat, fetchAdminPusatData } = useFetchDataPusat(status);
    useEffect(() => {
        if (isOpen && !adminPusatData?.length) fetchAdminPusatData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const pickVerifikator = !!Cookies.get("Access")?.includes("supervisePelaksanaan") && pelatihan?.StatusPenerbitan === "1" && title === "Pilih Verifikator";
    const showUpload = UPLOAD_STATUS.includes(String(pelatihan?.StatusPenerbitan ?? ""));
    const needFile = title === "Ajukan Penerbitan STTPL";
    const oldFile = pelatihan?.BeritaAcara;
    const verifikators = (adminPusatData ?? []).filter((a) => breakdownStatus(a.Status)[0] === "Verifikator");
    const selected = verifikators.find((a) => String(a.IdAdminPusat) === verifikatorId) || null;

    const missing = [!message.trim() && "catatan", pickVerifikator && !selected && "verifikator", needFile && !file && "dokumen"].filter(Boolean) as string[];

    const close = (o = false) => {
        if (saving) return;
        setIsOpen(o);
        if (!o) {
            setMessage("");
            setFile(null);
        }
    };

    // Kirim WA di latar belakang (tidak menahan dialog)
    const notifyWhatsapp = async () => {
        const phones =
            status === "1" ? (adminPusatData ?? []).map((a) => a.NoTelpon) : status === "2" ? [selected?.NoTelpon] : status === "6" ? [pelatihan?.VerifikatorSertifikat] : [];
        const list = phones.filter((p): p is string => !!p && p.trim() !== "");
        const text = generatePelatihanMessage(pelatihan, status);
        for (let i = 0; i < list.length; i++) {
            const to = list[i].includes("@s.whatsapp.net") ? list[i] : `${list[i]}@s.whatsapp.net`;
            try {
                await axios.post("/api/sendWhatsapp", { to, text });
            } catch (e) {
                console.error("WA gagal:", to, e);
            }
            if (i < list.length - 1) await new Promise((r) => setTimeout(r, WA_DELAY_MS));
        }
    };

    const handleSubmit = async () => {
        if (missing.length) return;
        setSaving(true);
        const fd = new FormData();
        fd.append("StatusPenerbitan", status);
        fd.append("VerifikatorPelatihan", verifikatorId);
        // dulu selalu dikirim → tertimpa "undefined" bila tidak memilih verifikator
        if (selected?.NoTelpon) fd.append("VerifikatorSertifikat", selected.NoTelpon);
        if (file) fd.append("BeritaAcara", file);
        if (status === "4") fd.append("PemberitahuanDiterima", "Active");

        try {
            await axios.put(`${elautBaseUrl}/lemdik/updatePelatihan?id=${idPelatihan}`, fd, {
                headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}`, "Content-Type": "multipart/form-data" },
            });
            await handleAddHistoryTrainingInExisting(pelatihan, message.trim(), Cookies.get("Role"), `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`);
            notifyWhatsapp();
            Toast.fire({ icon: "success", title: "Berhasil", text: `${title} berhasil diproses.` });
            setSaving(false);
            close(false);
            onSuccess();
        } catch (e) {
            console.error(e);
            setSaving(false);
            Toast.fire({ icon: "error", title: "Gagal", text: "Terjadi kesalahan saat memproses tindakan." }); // catatan tidak dihapus
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="group h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm hover:bg-slate-50 hover:ring-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
                <Icon className={`w-4 h-4 ${tone.icon} transition-transform duration-300 group-hover:-rotate-6`} />
                {buttonLabel}
            </button>

            <Dialog open={isOpen} onOpenChange={close}>
                <DialogContent
                    onInteractOutside={(e) => saving && e.preventDefault()}
                    onEscapeKeyDown={(e) => saving && e.preventDefault()}
                    className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg sm:max-w-lg max-h-[calc(100dvh-2rem)] p-0 gap-0 flex flex-col overflow-hidden rounded-3xl sm:rounded-3xl border-0 bg-slate-50 dark:bg-slate-950 shadow-2xl [&>button]:hidden"
                >
                    {/* Header */}
                    <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 py-5">
                        <div className="absolute inset-0 -z-10 opacity-80" style={{ background: `radial-gradient(70% 120% at 0% 0%, #2563EB 0%, transparent 60%), radial-gradient(50% 120% at 100% 100%, ${tone.accent} 0%, transparent 60%)` }} />
                        <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                        <Icon aria-hidden className="pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 opacity-20" style={{ color: tone.accent }} />
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/90 font-mono">{pelatihan?.KodePelatihan}</p>
                                <DialogTitle className="mt-1 text-base md:text-lg font-black text-white leading-snug">{title}</DialogTitle>
                                <DialogDescription className="text-xs text-blue-100/70">{description}</DialogDescription>
                            </div>
                            <button type="button" onClick={() => close(false)} disabled={saving} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20 disabled:opacity-40">
                                <TbX className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="mt-3 text-[11px] text-blue-100/70 truncate">{pelatihan?.NamaPelatihan}</p>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3">
                        {pickVerifikator && (
                            <Section icon={TbShieldCheck} title="Verifikator pelaksanaan" required>
                                <div className="relative">
                                    <select
                                        value={verifikatorId}
                                        onChange={(e) => setVerifikatorId(e.target.value)}
                                        disabled={saving || loadingPusat}
                                        className="w-full h-11 pl-3.5 pr-9 border-none rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold outline-none appearance-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
                                    >
                                        <option value="">{loadingPusat ? "Memuat verifikator…" : "Pilih verifikator"}</option>
                                        {verifikators.map((a) => (
                                            <option key={a.IdAdminPusat} value={String(a.IdAdminPusat)}>{a.Nama}</option>
                                        ))}
                                    </select>
                                    <TbChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                                {selected?.NoTelpon && <p className="mt-1.5 text-[11px] text-slate-500">Notifikasi WhatsApp dikirim ke {selected.Nama}.</p>}
                            </Section>
                        )}

                        {showUpload && (
                            <Section icon={TbFileText} title="Dokumen penerbitan STTPL" required={needFile}>
                                {file ? (
                                    <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 ring-1 ring-emerald-200 dark:ring-emerald-900/40 px-3 py-2.5">
                                        <span className="flex items-center gap-2 min-w-0">
                                            <TbCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span className="text-xs font-semibold truncate" title={file.name}>{file.name}</span>
                                        </span>
                                        <button type="button" onClick={() => setFile(null)} disabled={saving} aria-label="Hapus file" className="h-7 w-7 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center">
                                            <TbTrash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor={`doc-${idPelatihan}-${status}`} className="flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 px-3 py-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40">
                                        <span className="w-9 h-9 shrink-0 rounded-xl bg-[#0B1B3F] text-sky-200 flex items-center justify-center"><TbUpload className="w-4 h-4" /></span>
                                        <span className="min-w-0">
                                            <span className="block text-xs font-bold">{oldFile ? "Ganti dokumen" : "Pilih dokumen"}</span>
                                            <span className="block text-[10px] text-slate-400">PDF, DOC, atau DOCX</span>
                                        </span>
                                        <input id={`doc-${idPelatihan}-${status}`} type="file" accept=".pdf,.doc,.docx" className="sr-only" disabled={saving} onChange={(e) => { setFile(e.target.files?.[0] || null); e.target.value = ""; }} />
                                    </label>
                                )}
                                {oldFile && !file && (
                                    <a href={`${urlFileBeritaAcara}/${oldFile}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline">
                                        <TbExternalLink className="w-3.5 h-3.5" /> Lihat dokumen saat ini
                                    </a>
                                )}
                            </Section>
                        )}

                        <Section icon={TbMessage2} title="Catatan" required hint={`${message.length} karakter`}>
                            <textarea
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={saving}
                                placeholder="Tulis alasan pengajuan atau catatan perbaikan…"
                                className="w-full px-3.5 py-2.5 border-none rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400"
                            />
                        </Section>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <p className={`text-[11px] ${missing.length ? "text-amber-600" : "text-slate-400"}`}>{missing.length ? `Lengkapi: ${missing.join(", ")}` : "Siap dikirim"}</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => close(false)} disabled={saving} className="flex-1 sm:flex-none h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40">
                                Batal
                            </button>
                            <button type="button" onClick={handleSubmit} disabled={saving || missing.length > 0} className={`flex-1 sm:flex-none h-11 px-6 rounded-xl text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md disabled:opacity-40 ${tone.btn}`}>
                                {saving ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbSend className="w-4 h-4" />}
                                {saving ? "Memproses…" : "Kirim"}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

function Section({ icon: Icon, title, required, hint, children }: { icon: React.ComponentType<{ className?: string }>; title: string; required?: boolean; hint?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                    <Icon className="w-4 h-4 text-slate-400" /> {title} {required && <span className="text-rose-500">*</span>}
                </span>
                {hint && <span className="text-[10px] text-slate-400 tabular-nums">{hint}</span>}
            </div>
            {children}
        </section>
    );
}

export default SendNoteAction;
