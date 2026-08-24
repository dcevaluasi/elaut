"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TbId, TbArrowRight, TbArrowLeft, TbAlertTriangle } from "react-icons/tb";
import { HashLoader } from "react-spinners";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePortalInstruktur } from "@/hooks/elaut/instruktur/usePortalInstruktur";
import { simpanSesiInstruktur } from "@/components/instruktur/session";

const PANJANG_NIP = 18;

export default function LoginInstrukturPage() {
    const router = useRouter();
    const { cariBerdasarkanNip, sedangMemuat } = usePortalInstruktur();
    const [nip, setNip] = useState("");
    const [galat, setGalat] = useState<string | null>(null);
    const [dialogTerbuka, setDialogTerbuka] = useState(false);

    const nipLengkap = nip.length === PANJANG_NIP;

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setGalat(null);

        if (!nipLengkap) {
            setGalat(`NIP harus ${PANJANG_NIP} digit. Saat ini ${nip.length} digit.`);
            return;
        }

        const hasil = await cariBerdasarkanNip(nip);

        if (hasil.status === "tidak-ditemukan") {
            setDialogTerbuka(true);
            return;
        }

        if (hasil.status === "terlalu-sering") {
            // Endpoint pencarian NIP dibatasi laju permintaannya di backend
            // supaya NIP tidak bisa disapu satu per satu.
            setGalat(
                "Terlalu banyak percobaan. Tunggu sekitar satu menit sebelum mencoba lagi.",
            );
            return;
        }

        if (hasil.status === "galat") {
            setGalat(hasil.pesan);
            return;
        }

        simpanSesiInstruktur(hasil.data);
        router.push("/instruktur/edit-profile");
    }

    return (
        <main className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950">
            {/* Kolom kiri — masuk */}
            <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-md mx-auto"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded mb-10"
                    >
                        <TbArrowLeft size={16} />
                        Beranda E-LAUT
                    </Link>

                    <Image
                        src="/logo-kkp.png"
                        alt="Kementerian Kelautan dan Perikanan"
                        width={56}
                        height={56}
                        className="h-14 w-auto mb-7"
                    />

                    <h1 className="font-calsans text-3xl sm:text-4xl text-slate-800 dark:text-white leading-tight">
                        Portal Instruktur
                    </h1>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                        Masukkan NIP Anda untuk membuka dan melengkapi data instruktur.
                        Tidak perlu kata sandi.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-9 space-y-5" noValidate>
                        <div className="space-y-2">
                            <label
                                htmlFor="nip"
                                className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1"
                            >
                                Nomor Induk Pegawai
                            </label>

                            <div className="relative group">
                                <TbId
                                    aria-hidden
                                    size={20}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                                />
                                <input
                                    id="nip"
                                    name="nip"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    autoFocus
                                    maxLength={PANJANG_NIP}
                                    placeholder="000000000000000000"
                                    aria-invalid={galat ? true : undefined}
                                    aria-describedby="nip-bantuan"
                                    value={nip}
                                    onChange={(event) => {
                                        setNip(event.target.value.replace(/\D/g, ""));
                                        setGalat(null);
                                    }}
                                    className="w-full h-16 pl-12 pr-20 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-lg tracking-[0.12em] tabular-nums text-slate-700 dark:text-white transition-all placeholder:tracking-normal placeholder:text-base placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/10"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black tabular-nums text-slate-300">
                                    {nip.length}/{PANJANG_NIP}
                                </span>
                            </div>

                            <p
                                id="nip-bantuan"
                                className={`pl-1 text-[11px] font-semibold ${galat ? "text-rose-500" : "text-slate-400"
                                    }`}
                            >
                                {galat ?? "18 digit, tanpa spasi atau tanda baca."}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={sedangMemuat}
                            className="w-full h-14 rounded-2xl bg-primary text-white font-bold tracking-wide flex items-center justify-center gap-2 transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                        >
                            {sedangMemuat ? (
                                <>
                                    <HashLoader color="#ffffff" size={18} />
                                    Mencari data Anda
                                </>
                            ) : (
                                <>
                                    Cek dan masuk
                                    <TbArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 rounded-2xl bg-gray-50 dark:bg-white/5 px-5 py-4">
                        <p className="text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
                            NIP Anda belum terdaftar? Hubungi admin satuan pendidikan tempat
                            Anda bertugas untuk didaftarkan lebih dulu.
                        </p>
                    </div>

                </motion.div>
            </div>

            {/* Kolom kanan — identitas */}
            <aside className="hidden lg:flex relative flex-col justify-end overflow-hidden bg-primary p-16">
                <Image
                    src="/images/hero-img4.jpg"
                    alt=""
                    fill
                    aria-hidden
                    className="object-cover opacity-20"
                />
                <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-blue-900"
                    style={{ mixBlendMode: "multiply" }}
                />

                <div className="relative">
                    <Image
                        src="/images/logo-bppsdm-white.png"
                        alt="BPPSDM Kelautan dan Perikanan"
                        width={64}
                        height={64}
                        className="h-14 w-auto mb-10"
                    />

                    <h2 className="font-calsans text-4xl xl:text-5xl text-white leading-[1.1] max-w-lg">
                        Data Anda menentukan pelatihan yang Anda ampu.
                    </h2>

                    <p className="mt-5 text-sm font-medium leading-relaxed text-white/70 max-w-md">
                        E-LAUT mencocokkan instruktur dengan pelatihan berdasarkan bidang
                        keahlian, jenjang jabatan, dan sertifikasi yang tercatat. Profil yang
                        lengkap membuat Anda terlihat saat penugasan disusun.
                    </p>

                    <dl className="mt-12 flex gap-12">
                        <div>
                            <dt className="text-[10px] font-black uppercase tracking-widest text-white/50">
                                Satuan pendidikan
                            </dt>
                            <dd className="font-calsans text-3xl text-white mt-1">18</dd>
                        </div>
                        <div>
                            <dt className="text-[10px] font-black uppercase tracking-widest text-white/50">
                                Bidang keahlian
                            </dt>
                            <dd className="font-calsans text-3xl text-white mt-1">8</dd>
                        </div>
                    </dl>
                </div>
            </aside>

            <AlertDialog open={dialogTerbuka} onOpenChange={setDialogTerbuka}>
                <AlertDialogContent className="rounded-3xl max-w-md">
                    <AlertDialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2">
                            <TbAlertTriangle size={24} />
                        </div>
                        <AlertDialogTitle className="font-calsans text-xl text-slate-800">
                            NIP belum terdaftar
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium leading-relaxed text-slate-500">
                            NIP <span className="font-bold tabular-nums">{nip}</span> tidak
                            ditemukan pada data instruktur E-LAUT. Periksa kembali angkanya,
                            atau hubungi admin satuan pendidikan tempat Anda bertugas untuk
                            didaftarkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="rounded-xl bg-primary hover:bg-primary/90 font-bold">
                            Coba lagi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}
