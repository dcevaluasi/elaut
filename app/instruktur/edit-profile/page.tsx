"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
    TbArrowLeft,
    TbArrowRight,
    TbCircleCheck,
    TbDeviceFloppy,
    TbLogout,
} from "react-icons/tb";
import { HashLoader } from "react-spinners";

import { Form } from "@/components/ui/form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import StepIndicator from "@/components/instruktur/StepIndicator";
import StepDataDiri from "@/components/instruktur/StepDataDiri";
import StepUnitKerja from "@/components/instruktur/StepUnitKerja";
import StepKepakaran from "@/components/instruktur/StepKepakaran";
import StepSertifikasi from "@/components/instruktur/StepSertifikasi";
import ReviewSummary from "@/components/instruktur/ReviewSummary";
import {
    instrukturSchema,
    InstrukturFormValues,
    STEPS,
    LANGKAH_TINJAU,
} from "@/components/instruktur/steps";
import {
    bacaSesiInstruktur,
    hapusSesiInstruktur,
} from "@/components/instruktur/session";
import { hitungKelengkapan } from "@/constants/instruktur-dummy";

const NILAI_KOSONG: InstrukturFormValues = {
    nama: "",
    nip: "",
    email: "",
    no_telpon: "",
    pendidikkan_terakhir: "",
    eselon_1: "",
    eselon_2: "",
    id_lemdik: "",
    status: "",
    jenis_pelatih: "",
    jenjang_jabatan: "",
    bidang_keahlian: "",
    metodologi_pelatihan: "",
    pelatihan_pelatih: "",
    kompetensi_teknis: "",
    management_of_training: "",
    training_officer_course: "",
    link_data_dukung_sertifikat: "",
};

export default function EditProfileInstrukturPage() {
    const router = useRouter();
    const [siapDitampilkan, setSiapDitampilkan] = useState(false);
    const [langkah, setLangkah] = useState(0);
    const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
    const [dialogSukses, setDialogSukses] = useState(false);

    const form = useForm<InstrukturFormValues>({
        resolver: zodResolver(instrukturSchema),
        defaultValues: NILAI_KOSONG,
        mode: "onTouched",
    });

    // Sesi dibaca setelah render pertama karena sessionStorage tidak ada di server.
    useEffect(() => {
        const sesi = bacaSesiInstruktur();

        if (!sesi) {
            router.replace("/instruktur/login");
            return;
        }

        form.reset({
            nama: sesi.nama ?? "",
            nip: sesi.nip ?? "",
            email: sesi.email ?? "",
            no_telpon: sesi.no_telpon ?? "",
            pendidikkan_terakhir: sesi.pendidikkan_terakhir ?? "",
            eselon_1: sesi.eselon_1 ?? "",
            eselon_2: sesi.eselon_2 ?? "",
            id_lemdik: sesi.id_lemdik ? String(sesi.id_lemdik) : "",
            status: sesi.status ?? "",
            jenis_pelatih: sesi.jenis_pelatih ?? "",
            jenjang_jabatan: sesi.jenjang_jabatan ?? "",
            bidang_keahlian: sesi.bidang_keahlian ?? "",
            metodologi_pelatihan: sesi.metodologi_pelatihan ?? "",
            pelatihan_pelatih: sesi.pelatihan_pelatih ?? "",
            kompetensi_teknis: sesi.kompetensi_teknis ?? "",
            management_of_training: sesi.management_of_training ?? "",
            training_officer_course: sesi.training_officer_course ?? "",
            link_data_dukung_sertifikat: sesi.link_data_dukung_sertifikat ?? "",
        });

        setSiapDitampilkan(true);
        // form.reset stabil; sengaja hanya dijalankan sekali saat halaman dibuka.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const nilaiSaatIni = form.watch();
    const kelengkapan = useMemo(
        () => hitungKelengkapan(nilaiSaatIni),
        [nilaiSaatIni],
    );

    function keAtas() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function keLangkahBerikutnya() {
        // Hanya field pada langkah ini yang divalidasi, supaya langkah yang
        // belum dibuka tidak ikut memunculkan error.
        const sah = await form.trigger(STEPS[langkah].fields);
        if (!sah) return;

        setLangkah((sebelumnya) => Math.min(sebelumnya + 1, LANGKAH_TINJAU));
        keAtas();
    }

    function keLangkahSebelumnya() {
        setLangkah((sebelumnya) => Math.max(sebelumnya - 1, 0));
        keAtas();
    }

    function pilihLangkah(tujuan: number) {
        setLangkah(tujuan);
        keAtas();
    }

    async function simpanProfil() {
        const sah = await form.trigger();
        if (!sah) {
            // Lompat ke langkah pertama yang bermasalah agar pengguna tahu ke mana pergi.
            const bermasalah = STEPS.findIndex((step) =>
                step.fields.some((field) => form.getFieldState(field).invalid),
            );
            if (bermasalah >= 0) pilihLangkah(bermasalah);
            return;
        }

        setSedangMenyimpan(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSedangMenyimpan(false);
        setDialogSukses(true);
    }

    function keluar() {
        hapusSesiInstruktur();
        router.replace("/instruktur/login");
    }

    if (!siapDitampilkan) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
                <HashLoader color="#3C50E0" size={40} />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Menyiapkan profil Anda
                </p>
            </main>
        );
    }

    const diLangkahTinjau = langkah === LANGKAH_TINJAU;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Identitas pemilik profil */}
                <div className="flex items-center justify-between gap-4 mb-6 px-1">
                    <div className="flex items-center gap-3 min-w-0">
                        <Image
                            src="/logo-kkp.png"
                            alt=""
                            aria-hidden
                            width={36}
                            height={36}
                            className="h-9 w-auto shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Portal Instruktur
                            </p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white truncate">
                                {form.getValues("nama") || "Instruktur"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={keluar}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-white/5 transition-colors shrink-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20"
                    >
                        <TbLogout size={16} />
                        <span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden">
                    <StepIndicator
                        langkahAktif={langkah}
                        kelengkapan={kelengkapan}
                        onPilihLangkah={pilihLangkah}
                    />

                    <Form {...form}>
                        <form onSubmit={(event) => event.preventDefault()}>
                            <div className="px-6 md:px-10 py-9">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={langkah}
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -12 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                    >
                                        {langkah === 0 && <StepDataDiri form={form} />}
                                        {langkah === 1 && <StepUnitKerja form={form} />}
                                        {langkah === 2 && <StepKepakaran form={form} />}
                                        {langkah === 3 && <StepSertifikasi form={form} />}
                                        {diLangkahTinjau && (
                                            <ReviewSummary
                                                values={nilaiSaatIni}
                                                onUbah={pilihLangkah}
                                            />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Navigasi */}
                            <div className="flex items-center justify-between gap-3 px-6 md:px-10 py-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-white/[0.02]">
                                <button
                                    type="button"
                                    onClick={keLangkahSebelumnya}
                                    disabled={langkah === 0}
                                    className="flex items-center gap-2 h-12 px-5 rounded-2xl text-sm font-bold text-slate-500 transition-colors hover:bg-white dark:hover:bg-white/5 disabled:opacity-0 disabled:pointer-events-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                                >
                                    <TbArrowLeft size={18} />
                                    Kembali
                                </button>

                                {diLangkahTinjau ? (
                                    <button
                                        type="button"
                                        onClick={simpanProfil}
                                        disabled={sedangMenyimpan}
                                        className="flex items-center gap-2 h-12 px-7 rounded-2xl bg-primary text-white text-sm font-bold transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                                    >
                                        {sedangMenyimpan ? (
                                            <>
                                                <HashLoader color="#ffffff" size={16} />
                                                Menyimpan
                                            </>
                                        ) : (
                                            <>
                                                <TbDeviceFloppy size={18} />
                                                Simpan profil
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={keLangkahBerikutnya}
                                        className="flex items-center gap-2 h-12 px-7 rounded-2xl bg-primary text-white text-sm font-bold transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                                    >
                                        Lanjut
                                        <TbArrowRight size={18} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </Form>
                </div>

                <p className="mt-6 text-center text-[11px] font-semibold text-slate-400">
                    Perubahan baru tersimpan setelah Anda menekan Simpan profil di langkah
                    terakhir.
                </p>
            </div>

            <AlertDialog open={dialogSukses} onOpenChange={setDialogSukses}>
                <AlertDialogContent className="rounded-3xl max-w-md">
                    <AlertDialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
                            <TbCircleCheck size={26} />
                        </div>
                        <AlertDialogTitle className="font-calsans text-xl text-slate-800">
                            Profil tersimpan
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium leading-relaxed text-slate-500">
                            Data Anda kini terisi {kelengkapan}%. Admin satuan pendidikan akan
                            melihat pembaruan ini pada daftar instruktur.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="rounded-xl bg-primary hover:bg-primary/90 font-bold">
                            Selesai
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}
