"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { HiOutlineEye, HiOutlineEnvelope, HiOutlineLockClosed } from "react-icons/hi2";
import { HiOutlineEyeOff } from "react-icons/hi";
import { Building2, Landmark, Crown, ShieldCheck, ArrowRight, Loader2, AlertTriangle, Check, GraduationCap, BadgeCheck, BarChart3 } from "lucide-react";

import Toast from "@/commons/Toast";
import { generateRandomId, setSecureCookie } from "@/lib/utils";

/* ============================ KONFIGURASI ============================ */

type Role = "upt" | "pusat" | "pimpinan";

const ROLES: { value: Role; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "upt", label: "UPT", desc: "Balai / Lemdiklat", icon: Building2 },
  { value: "pusat", label: "Pusat", desc: "Admin pusat", icon: Landmark },
  { value: "pimpinan", label: "Pimpinan", desc: "Penandatangan", icon: Crown },
];

const ROLE_KEY = "admin:lastRole"; // hanya role & email yang diingat, BUKAN password
const EMAIL_KEY = "admin:lastEmail";

const FEATURES = [
  { icon: GraduationCap, text: "Penyelenggaraan & peserta" },
  { icon: BadgeCheck, text: "e-STTPL digital (BSrE)" },
  { icon: BarChart3, text: "Realisasi, PNBP & kinerja" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ============================ KOMPONEN ============================ */

export const FormLoginAdminELAUT = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const captchaRef = React.useRef<ReCAPTCHA>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passRef = React.useRef<HTMLInputElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const shake = useAnimationControls();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<Role | "">("");
  const [remember, setRemember] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [capsLock, setCapsLock] = React.useState(false);
  const [captcha, setCaptcha] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [redirecting, setRedirecting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [emailTouched, setEmailTouched] = React.useState(false);

  // Pulihkan role & email terakhir → langsung fokus ke password
  React.useEffect(() => {
    try {
      const r = localStorage.getItem(ROLE_KEY) as Role | null;
      const e = localStorage.getItem(EMAIL_KEY);
      if (r && ROLES.some((x) => x.value === r)) setRole(r);
      if (e) {
        setEmail(e);
        requestAnimationFrame(() => passRef.current?.focus());
      } else requestAnimationFrame(() => emailRef.current?.focus());
    } catch {
      /* abaikan */
    }
  }, []);

  const pickRole = (r: Role) => {
    setRole(r);
    setErrorMsg(null);
    try {
      localStorage.setItem(ROLE_KEY, r);
    } catch {
      /* abaikan */
    }
    if (!email) emailRef.current?.focus();
    else if (!password) passRef.current?.focus();
  };

  // Navigasi role dengan panah kiri/kanan
  const onRoleKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = Math.max(0, ROLES.findIndex((r) => r.value === role));
    const next = ROLES[(i + (e.key === "ArrowRight" ? 1 : ROLES.length - 1)) % ROLES.length];
    pickRole(next.value);
    (document.getElementById(`role-${next.value}`) as HTMLButtonElement | null)?.focus();
  };

  const resetCaptcha = () => {
    captchaRef.current?.reset();
    setCaptcha(null);
  };

  const emailValid = EMAIL_RE.test(email.trim());
  const formReady = !!role && emailValid && !!password;
  const canSubmit = formReady && !!captcha && !loading;

  // Label tombol menyebut langkah yang kurang → langsung to the point
  const nextHint = !role ? "Pilih akses dulu" : !email.trim() ? "Isi email" : !emailValid ? "Periksa format email" : !password ? "Isi password" : !captcha ? "Centang verifikasi" : null;
  const progress = [!!role, emailValid, !!password, !!captcha].filter(Boolean).length;

  const fail = (msg: string) => {
    setErrorMsg(msg);
    shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (nextHint) {
      setEmailTouched(true);
      fail(nextHint === "Centang verifikasi" ? "Selesaikan verifikasi captcha terlebih dahulu." : `${nextHint}.`);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/${role === "upt" ? "lemdik" : "adminPusat"}/login`,
        JSON.stringify({ email: email.trim(), password }),
        { headers: { "Content-Type": "application/json" } }
      );

      setSecureCookie("XSRF091", response.data.t);
      setSecureCookie("XSRF092", "true");
      setSecureCookie("XSRF093", role === "upt" ? "balai" : "adminPusat");
      try {
        if (remember) localStorage.setItem(EMAIL_KEY, email.trim());
        else localStorage.removeItem(EMAIL_KEY);
      } catch {
        /* abaikan */
      }

      Toast.fire({ icon: "success", title: "Berhasil masuk", text: "Selamat datang di E-LAUT." });
      setPassword("");
      setRedirecting(true);
      router.push(role === "upt" ? `/${generateRandomId()}/lemdiklat/dashboard` : "/admin/pusat/dashboard");
    } catch (error) {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      const msg =
        status === 401 || status === 400
          ? "Email/password salah, atau akses yang dipilih tidak sesuai akun Anda."
          : status === 500
            ? "Server sedang gangguan. Coba lagi sebentar lagi."
            : error instanceof AxiosError && !error.response
              ? "Tidak dapat terhubung ke server. Periksa koneksi internet."
              : "Terjadi kesalahan saat login. Silakan coba lagi.";
      fail(msg);
      resetCaptcha(); // token captcha hanya berlaku sekali
      setPassword("");
      passRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const onPasswordKey = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  // Sorotan cahaya mengikuti kursor di kartu
  const onCardMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const activeRole = ROLES.find((r) => r.value === role);

  /* ============================ RENDER ============================ */

  return (
    <div className="fixed inset-0 z-[999999] font-jakarta overflow-hidden bg-[#0B1B3F] text-white">
      {/* Latar */}
      <Image src="/images/hero-img6.jpg" alt="" fill priority className="object-cover opacity-[0.16] mix-blend-luminosity" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_60%_at_100%_0%,#0EA5E9_0%,transparent_55%),radial-gradient(60%_60%_at_80%_100%,#1D4ED8_0%,transparent_60%)] opacity-80" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-10 h-80 w-80 rounded-full bg-sky-400/25 blur-[110px]"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-blue-600/30 blur-[120px]"
        animate={{ x: [0, 50, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <main className="relative z-10 h-full w-full overflow-y-auto scrollbar-hide">
        <div className="min-h-full w-full max-w-6xl mx-auto grid lg:grid-cols-[1fr_440px] gap-10 items-center px-4 py-8 md:px-8">
          {/* Kiri: brand ringkas */}
          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="hidden lg:flex flex-col gap-7">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
                <Image src="/logo-kkp-white.png" alt="Logo KKP" fill sizes="48px" className="object-contain p-2" />
              </div>
              <div className="leading-tight">
                <p className="text-lg font-black tracking-tight">E-LAUT</p>
                <p className="text-xs text-blue-100/60">Kementerian Kelautan dan Perikanan</p>
              </div>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black tracking-[-0.03em] leading-[1.04]">
              Satu portal untuk{" "}
              <span className="bg-gradient-to-r from-sky-200 via-white to-blue-200 bg-clip-text text-transparent">pelatihan KP</span>.
            </h1>

            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f, i) => (
                <motion.span
                  key={f.text}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="inline-flex items-center gap-2 h-9 pl-1.5 pr-3.5 rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-md text-xs font-semibold text-blue-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                    <f.icon className="h-3.5 w-3.5 text-sky-200" />
                  </span>
                  {f.text}
                </motion.span>
              ))}
            </div>
          </motion.section>

          {/* Kanan: form */}
          <section className="w-full max-w-md mx-auto lg:mx-0">
            <AnimatePresence mode="wait">
              {redirecting ? (
                <motion.div
                  key="redirect"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[2rem] bg-white/[0.07] ring-1 ring-white/15 backdrop-blur-2xl p-10 flex flex-col items-center gap-4 text-center"
                >
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.6)]">
                    <Check className="h-7 w-7" />
                  </motion.span>
                  <div>
                    <p className="text-lg font-black">Berhasil masuk</p>
                    <p className="text-sm text-blue-100/60 inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Membuka dashboard…
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <motion.div animate={shake}>
                    <div
                      ref={cardRef}
                      onMouseMove={onCardMove}
                      className="group/card relative overflow-hidden rounded-[2rem] bg-[#0B1B3F]/70 ring-1 ring-white/15 backdrop-blur-2xl p-6 md:p-7 shadow-[0_30px_80px_-20px_rgba(2,6,23,0.8)]"
                    >
                      {/* sorotan kursor */}
                      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 [background:radial-gradient(380px_circle_at_var(--mx)_var(--my),rgba(56,189,248,0.14),transparent_60%)]" />
                      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />

                      {/* Header */}
                      <div className="relative mb-5">
                        <div className="lg:hidden flex items-center gap-2.5 mb-4">
                          <div className="relative h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/20">
                            <Image src="/logo-kkp-white.png" alt="Logo KKP" fill sizes="36px" className="object-contain p-1.5" />
                          </div>
                          <p className="text-sm font-black">E-LAUT · Admin</p>
                        </div>
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <h2 className="text-2xl font-black tracking-tight">Masuk</h2>
                            <p className="text-sm text-blue-100/60">{activeRole ? `sebagai ${activeRole.label} · ${activeRole.desc}` : "Pilih akses Anda"}</p>
                          </div>
                          {/* progres isian */}
                          <div className="flex gap-1" aria-label={`${progress} dari 4 langkah`}>
                            {[0, 1, 2, 3].map((i) => (
                              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < progress ? "w-5 bg-sky-300" : "w-1.5 bg-white/15"}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <form className="relative space-y-4" onSubmit={handleLogin} noValidate>
                        {/* Akses */}
                        <div role="radiogroup" aria-label="Masuk sebagai" onKeyDown={onRoleKey} className="relative grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                          {ROLES.map((r) => {
                            const active = role === r.value;
                            const Icon = r.icon;
                            return (
                              <button
                                key={r.value}
                                id={`role-${r.value}`}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                tabIndex={active || (!role && r.value === "upt") ? 0 : -1}
                                onClick={() => pickRole(r.value)}
                                className="relative flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70"
                              >
                                {active && (
                                  <motion.span
                                    layoutId="role-pill"
                                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                    className="absolute inset-0 rounded-xl bg-white shadow-[0_10px_30px_-10px_rgba(255,255,255,0.6)]"
                                  />
                                )}
                                <Icon className={`relative h-[18px] w-[18px] transition-colors ${active ? "text-blue-600" : "text-sky-200"}`} />
                                <span className={`relative text-[12px] font-black leading-none transition-colors ${active ? "text-[#0B1B3F]" : "text-blue-100/80"}`}>{r.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Email */}
                        <div className="relative">
                          <HiOutlineEnvelope className={`absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-colors ${emailValid ? "text-sky-300" : "text-blue-100/40"}`} />
                          <input
                            ref={emailRef}
                            id="email"
                            type="email"
                            inputMode="email"
                            autoComplete="username"
                            aria-label="Email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setErrorMsg(null);
                            }}
                            onBlur={() => setEmailTouched(true)}
                            placeholder="Email · nama@kkp.go.id"
                            className={`${inputCls} ${emailTouched && email && !emailValid ? "ring-rose-400/60" : ""} pr-11`}
                          />
                          <AnimatePresence>
                            {emailValid && (
                              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                                <Check className="h-3 w-3" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        {emailTouched && email && !emailValid && <p className="-mt-2 text-[11px] font-semibold text-rose-300">Format email belum benar.</p>}

                        {/* Password */}
                        <div className="relative">
                          <HiOutlineLockClosed className={`absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-colors ${password ? "text-sky-300" : "text-blue-100/40"}`} />
                          <input
                            ref={passRef}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            aria-label="Password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setErrorMsg(null);
                            }}
                            onKeyUp={onPasswordKey}
                            onKeyDown={onPasswordKey}
                            placeholder="Password"
                            className={`${inputCls} pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-blue-100/50 hover:bg-white/10 hover:text-white"
                          >
                            {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between -mt-1">
                          <label className="inline-flex items-center gap-2 text-[11px] text-blue-100/70 cursor-pointer select-none">
                            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer sr-only" />
                            <span className="flex h-4 w-4 items-center justify-center rounded-md ring-1 ring-white/25 bg-white/5 peer-checked:bg-sky-400 peer-checked:ring-sky-400 transition-colors">
                              {remember && <Check className="h-3 w-3 text-[#0B1B3F]" />}
                            </span>
                            Ingat email
                          </label>
                          <AnimatePresence>
                            {capsLock && (
                              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                                <AlertTriangle className="h-3.5 w-3.5" /> Caps Lock aktif
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Captcha muncul setelah isian lengkap */}
                        <AnimatePresence initial={false}>
                          {formReady && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className={`rounded-2xl p-2 ring-1 transition-colors ${captcha ? "bg-emerald-500/10 ring-emerald-400/30" : "bg-white/[0.05] ring-white/10"}`}>
                                <p className="flex items-center gap-1.5 px-1 pb-1.5 text-[11px] font-semibold text-sky-100/70">
                                  <ShieldCheck className="h-3.5 w-3.5" /> {captcha ? <span className="text-emerald-300">Terverifikasi</span> : "Verifikasi keamanan"}
                                </p>
                                <div className="flex justify-center origin-top scale-[0.92] sm:scale-100">
                                  <ReCAPTCHA
                                    ref={captchaRef}
                                    theme="dark"
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                    onChange={(v) => {
                                      setCaptcha(v);
                                      setErrorMsg(null);
                                    }}
                                    onExpired={() => setCaptcha(null)}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Error */}
                        <AnimatePresence>
                          {errorMsg && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              role="alert"
                              className="flex items-start gap-2 rounded-xl bg-rose-500/10 ring-1 ring-rose-400/30 px-3 py-2.5 text-xs font-semibold text-rose-200"
                            >
                              <AlertTriangle className="h-4 w-4 shrink-0 mt-px" /> {errorMsg}
                            </motion.p>
                          )}
                        </AnimatePresence>

                        {/* Tombol: label menyebut langkah berikutnya */}
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileTap={{ scale: 0.98 }}
                          className={`group relative w-full h-12 overflow-hidden rounded-2xl font-black text-sm transition-all ${canSubmit ? "bg-white text-[#0B1B3F] shadow-[0_12px_30px_-10px_rgba(255,255,255,0.55)] hover:-translate-y-0.5" : "bg-white/10 text-blue-100/70 ring-1 ring-white/15"}`}
                        >
                          {canSubmit && <span className="absolute inset-0 bg-gradient-to-r from-sky-200 via-white to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity" />}
                          <span className="relative flex items-center justify-center gap-2">
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Memeriksa akun…
                              </>
                            ) : canSubmit ? (
                              <>
                                Masuk <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                              </>
                            ) : (
                              nextHint
                            )}
                          </span>
                        </motion.button>
                      </form>
                    </div>
                  </motion.div>

                  <p className="mt-4 text-center text-[11px] text-blue-100/45">
                    Masalah akun? Hubungi admin pusat · © {new Date().getFullYear()} KKP
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
};

/* ============================ UI ============================ */

const inputCls =
  "w-full h-12 rounded-2xl border-none bg-white/[0.06] ring-1 ring-white/10 pl-11 pr-4 text-sm font-semibold text-white placeholder:text-blue-100/35 placeholder:font-normal outline-none transition-all focus:bg-white/[0.1] focus:ring-2 focus:ring-sky-300/50";
