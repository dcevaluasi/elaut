"use client";

import React, { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Dialog ringan via portal (tanpa DialogContent shadcn).
 * Tinggi mengikuti isi, DIBATASI layar: wrapper `fixed inset-0 p-3` + panel `max-h-full`.
 * Isi: header & footer `shrink-0`, tengah `flex-1 min-h-0 overflow-y-auto`.
 */
export default function AppDialog({
    open,
    onClose,
    title,
    maxWidth = "sm:max-w-lg",
    locked = false,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    maxWidth?: string;
    /** true = tidak bisa ditutup (mis. sedang menyimpan) */
    locked?: boolean;
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);
    const id = useId();
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && !locked && onClose();
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, locked, onClose]);

    if (!open || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in-0 duration-150" onClick={() => !locked && onClose()} />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                id={id}
                // inline style = batas tinggi pasti, tidak bergantung kelas apa pun
                style={{ maxHeight: "100%" }}
                className={`relative flex flex-col w-full max-w-lg ${maxWidth} min-h-0 min-w-0 overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-950 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150`}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}
