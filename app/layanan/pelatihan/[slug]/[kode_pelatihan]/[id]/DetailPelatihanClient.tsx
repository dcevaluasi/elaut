'use client'

import React from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { LogIn, RotateCcw, UserPlus, X } from "lucide-react";
import Toast from "@/commons/Toast";
import DetailPelatihan from "@/components/elaut/DetailPelatihan";
import { DetailPelatihanMasyarakat } from "@/types/product";

const LOGIN_ROUTE = "/login";
const REGISTER_ROUTE = "/registrasi"; // ⚠️ sesuaikan bila rute buat akun berbeda

export default function DetailPelatihanClient({ id, initialData }: { id: string; initialData: DetailPelatihanMasyarakat | null }) {
    const [data, setData] = React.useState(initialData);
    const [state, setState] = React.useState<"ok" | "loading" | "error" | "empty">(initialData ? "ok" : "loading");
    const [isRegistrasi, setIsRegistrasi] = React.useState(false);
    const [askLogin, setAskLogin] = React.useState(false);
    const [tries, setTries] = React.useState(0);

    // Fallback: hanya jalan bila server tidak membawa data
    React.useEffect(() => {
        if (initialData && tries === 0) return;
        const ctrl = new AbortController();
        setState("loading");
        axios
            .get(`${process.env.NEXT_PUBLIC_BASE_URL}/getPelatihanUser?idPelatihan=${id}`, { signal: ctrl.signal })
            .then((res) => {
                const d = res.data?.data ?? res.data;
                setData(d?.IdPelatihan ? d : null);
                setState(d?.IdPelatihan ? "ok" : "empty");
            })
            .catch((e) => !axios.isCancel(e) && setState("error"));
        return () => ctrl.abort();
    }, [id, initialData, tries]);

    React.useEffect(() => {
        if (!askLogin) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAskLogin(false);
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [askLogin]);

    const handleRegistration = () => {
        if (data?.StatusApproval === "Selesai") {
            Toast.fire({ icon: "error", title: "Pelatihan sudah berakhir", text: "Cari jadwal pelatihan lain yang masih dibuka, sobat E-LAUT!" });
            return;
        }
        if (Cookies.get("XSRF081")) setIsRegistrasi(true);
        else {
            Cookies.set("redirectAfterLogin", window.location.pathname, { expires: 1 });
            setAskLogin(true);
        }
    };

    if (state === "loading")
        return (
            <div className="space-y-4" aria-busy="true" aria-label="Memuat detail pelatihan">
                <div className="h-10 w-2/3 rounded-xl bg-white/[0.06] animate-pulse" />
                <div className="h-72 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 animate-pulse" />
                <div className="h-40 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 animate-pulse" />
            </div>
        );

    if (state !== "ok" || !data)
        return (
            <div className="flex flex-col items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10 px-4 py-16 text-center">
                <Image src="/illustrations/not-found.png" alt="" width={160} height={160} className="mb-5 opacity-40 grayscale" />
                <h1 className="font-calsans text-2xl">{state === "error" ? "Gagal memuat pelatihan" : "Pelatihan tidak ditemukan"}</h1>
                <p className="mt-2 mb-6 max-w-md text-sm text-slate-400">
                    {state === "error" ? "Periksa koneksi internet Anda lalu coba lagi." : "Pelatihan yang Anda cari tidak tersedia atau sudah dihapus."}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {state === "error" && (
                        <button type="button" onClick={() => setTries((t) => t + 1)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold hover:bg-blue-500">
                            <RotateCcw className="w-4 h-4" aria-hidden /> Coba lagi
                        </button>
                    )}
                    <Link href="/#program-pelatihan" className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-bold text-[#0B1B3F] hover:bg-sky-100">Lihat program pelatihan</Link>
                </div>
            </div>
        );

    return (
        <>
            <DetailPelatihan data={data} handleRegistration={handleRegistration} isRegistrasi={isRegistrasi} />

            {askLogin && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 font-jakarta" role="dialog" aria-modal="true" aria-labelledby="ask-login-title">
                    <button type="button" aria-label="Tutup" onClick={() => setAskLogin(false)} className="absolute inset-0 bg-[#020617]/70 backdrop-blur-sm animate-in fade-in-0" />
                    <div className="relative isolate w-full max-w-sm overflow-hidden rounded-3xl bg-[#0B1B3F] p-6 text-white ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.6)] animate-in fade-in-0 zoom-in-95">
                        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_50%_at_0%_0%,#2563EB66_0%,transparent_60%)]" />
                        <LogIn aria-hidden className="absolute -right-6 -top-6 -z-10 h-32 w-32 rotate-12 text-white/[0.05]" />
                        <button type="button" onClick={() => setAskLogin(false)} aria-label="Tutup" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 hover:bg-white/20">
                            <X className="w-4 h-4" />
                        </button>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80">Satu langkah lagi</p>
                        <h2 id="ask-login-title" className="mt-1 font-calsans text-xl leading-snug pr-8">Masuk untuk mendaftar pelatihan</h2>
                        <p className="mt-2 text-sm text-blue-100/70">Akun E-LAUT dipakai untuk pendaftaran, ujian, dan mengunduh sertifikat Anda.</p>
                        <div className="mt-5 grid gap-2">
                            <Link href={LOGIN_ROUTE} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500">
                                <LogIn className="w-4 h-4" aria-hidden /> Masuk
                            </Link>
                            <Link href={REGISTER_ROUTE} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-sm font-bold ring-1 ring-white/15 hover:bg-white/[0.12]">
                                <UserPlus className="w-4 h-4" aria-hidden /> Buat akun baru
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
