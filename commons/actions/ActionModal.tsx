"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Modal sendiri (portal ke <body>) — tidak bergantung pada kelas bawaan DialogContent
 * (top-50%/translate, grid, max-w-lg) yang membuat dialog besar meluber di layar.
 * Panel selalu muat di viewport: tinggi = layar − padding, isi tengah yang di-scroll.
 */
export default function ActionModal({ open, onClose, labelledBy, children, maxWidth = "max-w-4xl" }: { open: boolean; onClose: () => void; labelledBy: string; children: React.ReactNode; maxWidth?: string }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open || !mounted) return null;
    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in-0 duration-200" onClick={onClose} />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                className={`relative flex flex-col w-full ${maxWidth} h-full max-h-[860px] min-h-0 min-w-0 overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-950 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200`}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}
