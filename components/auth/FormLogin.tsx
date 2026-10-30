"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ClipboardPaste,
  Copy,
  Eye,
  EyeOff,
  Fingerprint,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { cn, encryptValue, setSecureCookie } from "@/lib/utils";
import { sanitizedDangerousChars, validateIsDangerousChars } from "@/utils/input";
import { User } from "@/types/user";
import { IdCardIcon } from "@radix-ui/react-icons";

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                 */
/* ------------------------------------------------------------------ */
const TOKEN_COOKIE = "XSRF081";
const NIK_COOKIE = "XSRF_NK";
const NIK_LENGTH = 16;
const DASHBOARD_ROUTE = "/dashboard";

/** "3201234567890123" → "3201 2345 6789 0123" (display only). */
const formatNik = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, "$1 ");

const ghostBtn =
  "inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-blue-100/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

const getErrorMessage = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    const data = err.response.data as Record<string, string> | undefined;
    return data?.message || data?.pesan || "NIK tidak ditemukan atau terjadi kesalahan.";
  }
  return "Terjadi kesalahan. Silakan coba lagi.";
};

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function FormLogin() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const [nik, setNik] = React.useState("");
  const [showNik, setShowNik] = React.useState(false);
  const [canPaste, setCanPaste] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"checking" | "idle" | "loading" | "success">("checking");

  const complete = nik.length === NIK_LENGTH;
  const busy = status === "loading" || status === "success";
  const progress = (nik.length / NIK_LENGTH) * 100;

  /* Already logged in → go straight to the dashboard (no extra API calls). */
  React.useEffect(() => {
    if (Cookies.get(TOKEN_COOKIE)) router.replace(DASHBOARD_ROUTE);
    else setStatus("idle");
  }, [router]);

  React.useEffect(() => {
    if (status === "idle") inputRef.current?.focus();
  }, [status]);

  /* The "Tempel" button only shows where the browser allows reading the clipboard. */
  React.useEffect(() => {
    setCanPaste(typeof navigator.clipboard?.readText === "function");
  }, []);

  /* Pointer parallax for background + glow (spring-smoothed). */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bgX = useSpring(useTransform(mx, (v) => v * -20), { stiffness: 50, damping: 20 });
  const bgY = useSpring(useTransform(my, (v) => v * -20), { stiffness: 50, damping: 20 });
  const glowX = useSpring(useTransform(mx, (v) => v * 60), { stiffness: 50, damping: 20 });
  const glowY = useSpring(useTransform(my, (v) => v * 60), { stiffness: 50, damping: 20 });

  const handlePointerMove = (e: React.PointerEvent) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const shake = () => {
    if (reduceMotion) return;
    cardRef.current?.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-8px)" },
        { transform: "translateX(8px)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 350, easing: "ease-out" }
    );
  };

  const fail = (message: string) => {
    setError(message);
    setStatus("idle");
    shake();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  /* ------------------------------ Actions ------------------------------ */
  /** Single entry point for typing and pasting: digits only, max 16. */
  const handleChange = (raw: string) => {
    setNik(raw.replace(/\D/g, "").slice(0, NIK_LENGTH)); // accepts pasted "3201 2345…" or "3201.2345…"
    if (error) setError(null);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!/\d/.test(text)) {
        setError("Clipboard tidak berisi angka NIK.");
      } else {
        handleChange(text);
      }
    } catch {
      setError("Tidak bisa menempel otomatis. Tekan Ctrl+V di kolom NIK, atau tahan lalu pilih Tempel.");
    }
    inputRef.current?.focus();
  };

  /** Copies the raw 16 digits (also works while the NIK is hidden). */
  const copyNik = async () => {
    try {
      await navigator.clipboard.writeText(nik);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const clearNik = () => {
    handleChange("");
    inputRef.current?.focus();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!complete) return fail(`NIK harus ${NIK_LENGTH} digit. Kurang ${NIK_LENGTH - nik.length} digit lagi.`);
    if (validateIsDangerousChars(nik)) return fail("NIK mengandung karakter tidak valid.");

    setStatus("loading");
    setError(null);
    try {
      const res = await axios.post<{ data: string; message: string }>(
        `${elautBaseUrl}/users/loginByNik`,
        { nik: sanitizedDangerousChars(nik) },
        { headers: { "Content-Type": "application/json" } }
      );
      const token = res.data.data;
      setSecureCookie(TOKEN_COOKIE, token, 1);
      setSecureCookie(NIK_COOKIE, encryptValue(nik), 1);

      // Only used for the welcome message; a failure here must not block login.
      const nama = await axios
        .get<User>(`${elautBaseUrl}/users/getUsersById`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.data?.Nama)
        .catch(() => undefined);

      setStatus("success");
      Toast.fire({
        icon: "success",
        title: "Login berhasil!",
        text: nama ? `Selamat datang, ${nama}!` : "Selamat datang di E-LAUT!",
      });
      router.replace(DASHBOARD_ROUTE);
    } catch (err) {
      const msg = getErrorMessage(err);
      fail(msg);
      Toast.fire({ icon: "error", title: "Login gagal", text: msg });
    }
  };

  /* ------------------------------ Render ------------------------------- */
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden font-jakarta" onPointerMove={handlePointerMove}>
      <main className="relative flex h-full w-full items-center justify-center overflow-y-auto bg-[#020617] text-white scrollbar-hide">
        {/* Background: photo + grid + glow, all with pointer parallax */}
        <motion.div
          style={{ x: bgX, y: bgY }}
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.08, opacity: 0.2 }}
          transition={{ duration: 2.5 }}
          className="pointer-events-none fixed inset-0"
          aria-hidden="true"
        >
          <Image src="/images/hero-img6.jpg" fill priority sizes="100vw" className="object-cover" alt="" />
        </motion.div>
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/60 to-[#020617]" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 opacity-[0.06] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        <motion.div style={{ x: glowX, y: glowY }} className="pointer-events-none fixed inset-0" aria-hidden="true">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[130px]" />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-500/15 blur-[140px]" />
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[100px]" />
        </motion.div>

        {status === "checking" ? (
          <div className="relative z-10 flex items-center gap-3 text-sm text-gray-400" role="status">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" aria-hidden="true" />
            Memeriksa sesi…
          </div>
        ) : (
          <section className="relative z-10 flex w-full max-w-md flex-col items-center px-4 py-10">
            {/* Header */}
            <motion.div {...fadeUp(0)} className="mb-7 flex flex-col items-center gap-3 text-center">
              <div className="group relative h-20 w-20">
                <div className="absolute inset-0 rounded-full bg-blue-500/40 blur-3xl transition-colors duration-500 group-hover:bg-cyan-400/50" />
                <Image
                  src="/logo-kkp-white.png"
                  alt="E-LAUT"
                  fill
                  className="relative object-contain drop-shadow-2xl transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105"
                />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
                </span>
                Portal Masyarakat E-LAUT
              </span>
              <h1 className="font-calsans text-3xl leading-none md:text-4xl">
                Masuk ke{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  E-LAUT
                </span>
              </h1>
              <p className="max-w-xs text-xs leading-relaxed text-gray-400 md:text-sm">
                Gunakan NIK pada KTP Anda untuk mengakses portal pelatihan &amp; sertifikasi kelautan.
              </p>
            </motion.div>

            {/* Card */}
            <motion.div {...fadeUp(0.15)} className="relative w-full">
              <div
                aria-hidden="true"
                className={cn(
                  "absolute -inset-[2px] rounded-[28px] blur-sm transition-opacity duration-500",
                  status === "success"
                    ? "bg-gradient-to-br from-emerald-500/70 to-teal-500/60 opacity-50"
                    : error
                      ? "bg-gradient-to-br from-rose-500/60 to-orange-500/40 opacity-40"
                      : "bg-gradient-to-br from-blue-600/60 via-cyan-600/40 to-indigo-600/60 opacity-30"
                )}
              />
              <div
                ref={cardRef}
                className="relative rounded-3xl border border-white/[0.08] bg-[#0a1628]/90 p-6 shadow-2xl backdrop-blur-3xl sm:p-8"
              >
                <div className="mb-6 flex justify-center">
                  <motion.div
                    animate={status === "loading" && !reduceMotion ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ duration: 1.2, repeat: status === "loading" ? Infinity : 0 }}
                    className={cn(
                      "relative flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg transition-colors duration-500",
                      status === "success"
                        ? "border-emerald-400/40 bg-emerald-500/15 shadow-emerald-500/20"
                        : "border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 shadow-blue-500/10"
                    )}
                  >
                    {status === "success" ? (
                      <Check className="h-8 w-8 text-emerald-300" aria-hidden="true" />
                    ) : (
                      <Fingerprint className="h-8 w-8 text-blue-400" aria-hidden="true" />
                    )}
                  </motion.div>
                </div>

                <form onSubmit={handleLogin} noValidate autoComplete="off" className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="nik_input" className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                        <IdCardIcon className="h-4 w-4 text-blue-400" aria-hidden="true" />
                        Nomor Induk Kependudukan (NIK)
                      </label>
                    </div>

                    {/* Quick actions: paste / copy / clear / show-hide (same pattern as the exam access page) */}
                    <div className="-ml-2 flex flex-wrap items-center gap-0.5">
                      {!busy && !nik && canPaste && (
                        <button type="button" onClick={pasteFromClipboard} className={ghostBtn}>
                          <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
                          Tempel
                        </button>
                      )}
                      {!busy && nik && (
                        <>
                          <button type="button" onClick={copyNik} className={ghostBtn}>
                            {copied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            {copied ? "Disalin" : "Salin"}
                          </button>
                          <button type="button" onClick={clearNik} className={ghostBtn}>
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                            Hapus
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowNik((s) => !s)}
                        aria-pressed={showNik}
                        className={cn(ghostBtn, "ml-auto")}
                      >
                        {showNik ? (
                          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {showNik ? "Sembunyikan" : "Tampilkan"}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        ref={inputRef}
                        id="nik_input"
                        // Hidden mode uses a native password field (raw digits) so editing stays reliable.
                        type={showNik ? "text" : "password"}
                        inputMode="numeric"
                        autoComplete="off"
                        value={showNik ? formatNik(nik) : nik}
                        // 16 digits, plus the 3 spaces shown when the NIK is visible.
                        maxLength={showNik ? NIK_LENGTH + 3 : NIK_LENGTH}
                        readOnly={busy}
                        onChange={(e) => handleChange(e.target.value)}
                        onPaste={(e) => {
                          e.preventDefault();
                          handleChange(e.clipboardData.getData("text"));
                        }}
                        placeholder="3201 xxxx xxxx xxxx"
                        aria-invalid={error ? true : undefined}
                        aria-describedby="nik-help"
                        className={cn(
                          "h-14 w-full rounded-2xl border-2 bg-white/[0.04] px-4 pr-16 font-mono text-lg tracking-[0.12em] text-white outline-none transition-all placeholder:text-gray-600 focus:ring-4",
                          error
                            ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : complete
                              ? "border-emerald-500/40 focus:border-emerald-400 focus:ring-emerald-500/10"
                              : "border-white/[0.08] focus:border-blue-500/60 focus:ring-blue-500/10"
                        )}
                      />
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        <span
                          className={cn(
                            "text-[11px] font-black tabular-nums",
                            complete ? "text-emerald-400" : "text-gray-500"
                          )}
                        >
                          {nik.length}/{NIK_LENGTH}
                        </span>
                      </div>
                    </div>

                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.04]" aria-hidden="true">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          complete ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-blue-500 to-cyan-400"
                        )}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />
                    </div>

                    <div id="nik-help" aria-live="polite" className="min-h-5">
                      <AnimatePresence mode="wait" initial={false}>
                        {error ? (
                          <motion.p
                            key="error"
                            role="alert"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[11px] font-medium text-rose-300"
                          >
                            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {error}
                          </motion.p>
                        ) : (
                          <motion.p
                            key="hint"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={cn("text-[11px]", complete ? "text-emerald-400" : "text-gray-500")}
                          >
                            {complete
                              ? "NIK lengkap. Tekan Enter atau tombol di bawah untuk masuk."
                              : nik.length
                                ? `${NIK_LENGTH - nik.length} digit lagi`
                                : "16 digit angka sesuai KTP. Bisa ditempel langsung."}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className={cn(
                      "group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30",
                      status === "success"
                        ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/30"
                        : complete
                          ? "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-600/30 hover:-translate-y-0.5 hover:shadow-cyan-400/40"
                          : "border border-white/[0.08] bg-white/[0.05] text-white/50 hover:bg-white/[0.08]"
                    )}
                  >
                    {complete && status === "idle" && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 blur-md transition-all duration-700 group-hover:left-[120%]"
                      />
                    )}
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Memverifikasi NIK…
                      </>
                    ) : status === "success" ? (
                      <>
                        <Check className="h-5 w-5" aria-hidden="true" /> Berhasil, membuka dashboard…
                      </>
                    ) : (
                      <>
                        Masuk dengan NIK
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 border-t border-white/[0.06] pt-5 text-center text-sm text-gray-400">
                  Belum terdaftar?{" "}
                  <Link
                    href="/registrasi"
                    className="font-bold text-blue-400 underline-offset-4 transition-colors hover:text-blue-300 hover:underline"
                  >
                    Daftar sekarang
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp(0.3)}
              className="mt-5 flex items-center gap-2.5 rounded-2xl border border-white/[0.05] bg-white/[0.03] px-4 py-3"
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <p className="text-[11px] text-gray-500">NIK dienkripsi AES-256. Data tidak disimpan di pihak ketiga.</p>
            </motion.div>
          </section>
        )}
      </main>
    </div>
  );
}
