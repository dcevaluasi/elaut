"use client";

import Image from "next/image";
import Link from "next/link";
import React, { FormEvent, useState, useEffect, useCallback } from "react";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { elautBaseUrl } from "@/constants/urls";
import { setSecureCookie, removeSecureCookie, encryptValue } from "@/lib/utils";
import { validateIsDangerousChars, sanitizedDangerousChars } from "@/utils/input";
import Toast from "@/commons/Toast";
import { User, UserPelatihan } from "@/types/user";
import {
  HiOutlineIdentification,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineLogout,
  HiOutlineChevronRight,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
} from "react-icons/hi";
import {
  FiShield, FiLoader, FiUser, FiAward, FiEdit3, FiCheck, FiX, FiAlertCircle,
  FiRefreshCw, FiBookOpen, FiMapPin,
} from "react-icons/fi";
import { RiFingerprint2Line, RiVerifiedBadgeFill } from "react-icons/ri";
import { MdOutlineSchool } from "react-icons/md";

// ─── Constants ────────────────────────────────────────────────────────────────
const TOKEN_COOKIE = "XSRF081";
const NIK_COOKIE = "XSRF_NK";

type ProfileField = { key: keyof User; label: string; type?: string; readonly?: boolean };
const PROFILE_FIELDS: ProfileField[] = [
  { key: "Nama",               label: "Nama Lengkap" },
  { key: "Email",              label: "Email",               type: "email" },
  { key: "NoTelpon",           label: "No. Telepon",         type: "tel" },
  { key: "Kota",               label: "Kota" },
  { key: "Provinsi",           label: "Provinsi" },
  { key: "Alamat",             label: "Alamat" },
  { key: "Pekerjaan",          label: "Pekerjaan" },
  { key: "PendidikanTerakhir", label: "Pendidikan Terakhir" },
  { key: "Agama",              label: "Agama" },
  { key: "StatusMenikah",      label: "Status Menikah" },
  { key: "JenisKelamin",       label: "Jenis Kelamin",       readonly: true },
  { key: "GolonganDarah",      label: "Golongan Darah" },
  { key: "Kewarganegaraan",    label: "Kewarganegaraan" },
  { key: "IbuKandung",         label: "Nama Ibu Kandung" },
  { key: "NegaraTujuanBekerja",label: "Negara Tujuan Bekerja" },
  { key: "TempatLahir",        label: "Tempat Lahir",        readonly: true },
  { key: "TanggalLahir",       label: "Tanggal Lahir",       type: "date", readonly: true },
];

function getBadgeStyle(status: string) {
  const s = (status || "").toLowerCase();
  if (["lulus", "selesai", "approved"].includes(s))
    return { cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" };
  if (["gagal", "belum lulus", "ditolak"].includes(s))
    return { cls: "bg-rose-500/15 text-rose-300 border-rose-500/30", dot: "bg-rose-400" };
  if (s === "menunggu" || s === "proses")
    return { cls: "bg-amber-500/15 text-amber-300 border-amber-500/30", dot: "bg-amber-400 animate-pulse" };
  return { cls: "bg-blue-500/15 text-blue-300 border-blue-500/30", dot: "bg-blue-400 animate-pulse" };
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function FormLogin() {
  const [view, setView] = useState<"login" | "dashboard">("login");
  const [nik, setNik] = useState("");
  const [nikError, setNikError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [pelatihan, setPelatihan] = useState<UserPelatihan[] | null>(null);
  const [loadingPelatihan, setLoadingPelatihan] = useState(false);

  const [activeTab, setActiveTab] = useState<"profile" | "pelatihan">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [loadingSave, setLoadingSave] = useState(false);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchUser = useCallback(async (token: string): Promise<User | null> => {
    setLoadingUser(true);
    try {
      const res: AxiosResponse<User> = await axios.get(`${elautBaseUrl}/users/getUsersById`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setEditData(res.data);
      return res.data;
    } catch (err) {
      console.error("fetchUser error:", err);
      return null;
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const fetchPelatihan = useCallback(async (nikValue: string) => {
    if (!nikValue) return;
    setLoadingPelatihan(true);
    try {
      const res = await axios.post(
        `${elautBaseUrl}/getPelatihanByNik`,
        { nik: String(nikValue) },
        { headers: { "Content-Type": "application/json" } }
      );
      // API returns { Pesan: "...", data: [...] } or null
      const raw = res.data?.data;
      if (Array.isArray(raw)) {
        setPelatihan(raw);
      } else if (Array.isArray(res.data)) {
        setPelatihan(res.data);
      } else {
        setPelatihan([]);
      }
    } catch (err) {
      console.error("fetchPelatihan error:", err);
      setPelatihan([]);
    } finally {
      setLoadingPelatihan(false);
    }
  }, []);

  // ── Session restore on mount ───────────────────────────────────────────────
  useEffect(() => {
    const token = Cookies.get(TOKEN_COOKIE);
    const storedNik = Cookies.get(NIK_COOKIE); // encrypted, we use user.Nik after fetch
    if (token) {
      setView("dashboard");
      fetchUser(token).then((userData) => {
        // Use Nik from user data (from JWT/API) as the source of truth
        if (userData?.Nik) {
          fetchPelatihan(String(userData.Nik));
        }
      });
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedNik = nik.trim();
    if (!trimmedNik || trimmedNik.length !== 16) { setNikError("NIK harus tepat 16 digit."); return; }
    if (validateIsDangerousChars(trimmedNik)) { setNikError("NIK mengandung karakter tidak valid."); return; }

    setLoadingLogin(true);
    setNikError(null);
    try {
      const res: AxiosResponse<{ data: string; message: string }> = await axios.post(
        `${elautBaseUrl}/users/loginByNik`,
        { nik: sanitizedDangerousChars(trimmedNik) },
        { headers: { "Content-Type": "application/json" } }
      );
      const token = res.data.data;
      setSecureCookie(TOKEN_COOKIE, token, 1);
      setSecureCookie(NIK_COOKIE, encryptValue(trimmedNik), 1);

      // Fetch user, then use returned NIK (canonical) for pelatihan
      const userData = await fetchUser(token);
      const canonicalNik = userData?.Nik ? String(userData.Nik) : trimmedNik;
      fetchPelatihan(canonicalNik);

      setView("dashboard");
      Toast.fire({ icon: "success", title: "Login berhasil!", text: `Selamat datang, ${userData?.Nama || ""}!` });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.pesan || "NIK tidak ditemukan atau terjadi kesalahan.";
      setNikError(msg);
      Toast.fire({ icon: "error", title: "Login Gagal", text: msg });
    } finally {
      setLoadingLogin(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    removeSecureCookie(TOKEN_COOKIE);
    removeSecureCookie(NIK_COOKIE);
    Cookies.remove(TOKEN_COOKIE);
    Cookies.remove(NIK_COOKIE);
    setUser(null); setPelatihan(null); setView("login"); setNik(""); setIsEditing(false);
    Toast.fire({ icon: "success", title: "Logout berhasil." });
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    const token = Cookies.get(TOKEN_COOKIE);
    if (!token) return;
    setLoadingSave(true);
    try {
      const fd = new FormData();
      Object.entries(editData).forEach(([k, v]) => {
        if (v !== undefined && v !== null && typeof v === "string") fd.append(k, v);
      });
      await axios.put(`${elautBaseUrl}/users/updateUsersByToken`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      await fetchUser(token);
      setIsEditing(false);
      Toast.fire({ icon: "success", title: "Profil diperbarui!", text: "Data berhasil disimpan." });
    } catch (err: any) {
      Toast.fire({ icon: "error", title: "Gagal menyimpan", text: err?.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setLoadingSave(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[999999] font-jakarta overflow-hidden">
      <main className="h-full w-full relative bg-[#020617] text-white flex items-center justify-center overflow-y-auto scrollbar-hide">
        {/* Ambient background */}
        <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 0.18 }} transition={{ duration: 3 }} className="fixed inset-0 z-0 pointer-events-none">
          <Image src="/images/hero-img6.jpg" fill priority className="object-cover" alt="" />
        </motion.div>
        <motion.div animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none fixed -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[130px] z-0" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none fixed -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-500/15 blur-[140px] z-0" />
        <motion.div animate={{ x: [0, 30, 0], y: [0, 30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px] z-0" />

        <AnimatePresence mode="wait">
          {view === "login" ? (
            <LoginView key="login" nik={nik} setNik={setNik} nikError={nikError} setNikError={setNikError} loadingLogin={loadingLogin} handleLogin={handleLogin} />
          ) : (
            <DashboardView
              key="dashboard"
              user={user} loadingUser={loadingUser}
              pelatihan={pelatihan} loadingPelatihan={loadingPelatihan}
              activeTab={activeTab} setActiveTab={setActiveTab}
              isEditing={isEditing} setIsEditing={setIsEditing}
              editData={editData} setEditData={setEditData}
              loadingSave={loadingSave}
              handleSaveProfile={handleSaveProfile}
              handleLogout={handleLogout}
              onRefreshPelatihan={() => user?.Nik && fetchPelatihan(String(user.Nik))}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function LoginView({ nik, setNik, nikError, setNikError, loadingLogin, handleLogin }: {
  nik: string; setNik: (v: string) => void; nikError: string | null;
  setNikError: (v: string | null) => void; loadingLogin: boolean; handleLogin: (e: FormEvent) => void;
}) {
  const progress = (nik.length / 16) * 100;
  return (
    <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}
      className="relative z-10 w-full max-w-md px-4 py-10 flex flex-col items-center">

      {/* Logo */}
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-7 flex flex-col items-center gap-3">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 bg-blue-500/40 blur-3xl rounded-full" />
          <Image src="/logo-kkp-white.png" alt="E-LAUT" fill className="object-contain relative z-10 drop-shadow-2xl" />
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Portal Masyarakat E-LAUT
        </span>
        <h1 className="text-3xl md:text-4xl font-bold font-calsans text-white leading-none text-center">
          Masuk ke <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">E-LAUT</span>
        </h1>
        <p className="text-gray-400 text-xs text-center max-w-xs leading-relaxed">
          Gunakan NIK pada KTP Anda untuk mengakses portal pelatihan &amp; sertifikasi kelautan.
        </p>
      </motion.div>

      {/* Card */}
      <div className="w-full relative">
        <div className="absolute -inset-[2px] bg-gradient-to-br from-blue-600/60 via-cyan-600/40 to-indigo-600/60 rounded-[28px] blur-sm opacity-30" />
        <div className="relative bg-[#0a1628]/90 backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
          {/* Fingerprint Icon */}
          <div className="flex justify-center mb-7">
            <motion.div whileHover={{ scale: 1.05 }} className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <div className="absolute inset-0 bg-blue-400/10 rounded-2xl blur-md" />
              <RiFingerprint2Line className="text-blue-400 text-3xl relative z-10" />
            </motion.div>
          </div>

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="nik_input" className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                <HiOutlineIdentification className="text-blue-400 text-base" />
                Nomor Induk Kependudukan (NIK)
              </label>
              <div className="relative">
                <input
                  id="nik_input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={16}
                  value={nik}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setNik(v); if (nikError) setNikError(null); }}
                  placeholder="3 2 x x  x x x x  x x x x  x x x x"
                  className={`w-full h-13 bg-white/[0.04] border-2 ${nikError ? "border-rose-500/50 focus:border-rose-500" : nik.length === 16 ? "border-emerald-500/40 focus:border-emerald-400" : "border-white/[0.08] focus:border-blue-500/60"} rounded-2xl px-4 pr-14 text-white text-base placeholder:text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono tracking-[0.15em] py-3`}
                  required
                />
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black tabular-nums ${nik.length === 16 ? "text-emerald-400" : "text-gray-600"}`}>
                  {nik.length}/16
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${nik.length === 16 ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-blue-500 to-cyan-400"}`}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>

              <AnimatePresence>
                {nikError && (
                  <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <FiAlertCircle className="text-rose-400 shrink-0 mt-0.5 text-sm" />
                    <p className="text-rose-400 text-[11px] font-medium">{nikError}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={nik.length === 16 && !loadingLogin ? { scale: 1.01, y: -1 } : {}}
              whileTap={nik.length === 16 && !loadingLogin ? { scale: 0.99 } : {}}
              type="submit" disabled={loadingLogin || nik.length !== 16}
              className={`w-full h-12 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${nik.length === 16 && !loadingLogin
                ? "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40"
                : "bg-white/[0.04] text-white/20 cursor-not-allowed border border-white/[0.05]"}`}
            >
              {loadingLogin
                ? <><FiLoader className="animate-spin text-lg" /> Memverifikasi NIK...</>
                : <><RiFingerprint2Line className="text-lg" /> Masuk dengan NIK</>}
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-gray-500 text-sm">
              Belum terdaftar?{" "}
              <Link href="/registrasi" className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline-offset-4 hover:underline">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Security badge */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-5 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
        <FiShield className="text-emerald-400 shrink-0" size={14} />
        <p className="text-[10px] text-gray-600">NIK dienkripsi AES-256. Data tidak disimpan di pihak ketiga.</p>
      </motion.div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardView({ user, loadingUser, pelatihan, loadingPelatihan, activeTab, setActiveTab, isEditing, setIsEditing, editData, setEditData, loadingSave, handleSaveProfile, handleLogout, onRefreshPelatihan }: {
  user: User | null; loadingUser: boolean; pelatihan: UserPelatihan[] | null; loadingPelatihan: boolean;
  activeTab: "profile" | "pelatihan"; setActiveTab: (t: "profile" | "pelatihan") => void;
  isEditing: boolean; setIsEditing: (v: boolean) => void; editData: Partial<User>; setEditData: (v: Partial<User>) => void;
  loadingSave: boolean; handleSaveProfile: () => void; handleLogout: () => void; onRefreshPelatihan: () => void;
}) {
  const pelatihanCount = pelatihan?.length ?? 0;

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}
      className="relative z-10 w-full max-w-3xl px-4 py-8 flex flex-col gap-5">

      {/* ── Hero Profile Card ───────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-indigo-500/20 rounded-[28px] blur-[2px]" />
        <div className="relative bg-[#0a1628]/95 backdrop-blur-3xl border border-white/[0.07] rounded-3xl overflow-hidden shadow-2xl">
          {/* Decorative top banner */}
          <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400" />

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border border-white/10 overflow-hidden flex items-center justify-center">
                  {loadingUser ? (
                    <Skeleton className="w-full h-full" />
                  ) : (
                    <img
                      src={user?.Foto || "/dummies/profile.png"}
                      alt={user?.Nama || "Foto Profil"}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/dummies/profile.png"; }}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-[#0a1628] flex items-center justify-center shadow-lg">
                  <FiCheck className="text-[#0a1628] text-[10px] font-black" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                {loadingUser ? (
                  <div className="space-y-2.5">
                    <Skeleton className="h-6 w-48 mx-auto sm:mx-0" />
                    <Skeleton className="h-4 w-36 mx-auto sm:mx-0" />
                    <Skeleton className="h-3 w-52 mx-auto sm:mx-0" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <h2 className="text-xl font-bold text-white font-calsans">{user?.Nama || "—"}</h2>
                      <RiVerifiedBadgeFill className="text-blue-400 text-lg shrink-0" title="Terverifikasi" />
                    </div>
                    <p className="inline-flex items-center gap-1.5 text-[11px] text-blue-400/90 font-mono bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20 mb-2">
                      <HiOutlineIdentification className="text-sm" />
                      NIK: {user?.Nik || "—"}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 mt-1.5">
                      {user?.Email && <span className="flex items-center gap-1 text-[11px] text-gray-400"><HiOutlineMail className="text-blue-400/70 text-sm" />{user.Email}</span>}
                      {user?.NoTelpon && <span className="flex items-center gap-1 text-[11px] text-gray-400"><HiOutlinePhone className="text-blue-400/70 text-sm" />{user.NoTelpon}</span>}
                      {user?.Kota && <span className="flex items-center gap-1 text-[11px] text-gray-400"><FiMapPin className="text-blue-400/70 text-sm" />{user.Kota}{user?.Provinsi ? `, ${user.Provinsi}` : ""}</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Logout */}
              <button onClick={handleLogout} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/[0.08] text-gray-400 text-xs font-semibold hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all duration-200">
                <HiOutlineLogout className="text-base" /> Keluar
              </button>
            </div>

            {/* Stats row */}
            {!loadingUser && (
              <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-3">
                {[
                  { label: "Pelatihan Diikuti", value: loadingPelatihan ? "..." : String(pelatihanCount), icon: <FiBookOpen className="text-blue-400" /> },
                  { label: "Status Akun", value: user?.Status || "Aktif", icon: <RiVerifiedBadgeFill className="text-emerald-400" /> },
                  { label: "Pekerjaan", value: user?.Pekerjaan || "—", icon: <MdOutlineSchool className="text-cyan-400" /> },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="text-lg mb-1">{s.icon}</div>
                    <p className="text-base font-extrabold text-white leading-none">{s.value}</p>
                    <p className="text-[10px] text-gray-500 mt-1 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl backdrop-blur-md">
        {([
          { id: "profile",   icon: <FiUser />,    label: "Profil Saya" },
          { id: "pelatihan", icon: <FiAward />,   label: "Riwayat Pelatihan", badge: pelatihanCount },
        ] as const).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${activeTab === tab.id
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20"
              : "text-gray-500 hover:text-gray-200 hover:bg-white/5"}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.id === "pelatihan" && pelatihanCount > 0 && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-blue-500/20 text-blue-400"}`}>
                {pelatihanCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "profile" ? (
          <ProfileTab key="profile" user={user} loadingUser={loadingUser} isEditing={isEditing} setIsEditing={setIsEditing} editData={editData} setEditData={setEditData} loadingSave={loadingSave} handleSaveProfile={handleSaveProfile} />
        ) : (
          <PelatihanTab key="pelatihan" pelatihan={pelatihan} loadingPelatihan={loadingPelatihan} onRefresh={onRefreshPelatihan} />
        )}
      </AnimatePresence>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileTab({ user, loadingUser, isEditing, setIsEditing, editData, setEditData, loadingSave, handleSaveProfile }: {
  user: User | null; loadingUser: boolean; isEditing: boolean; setIsEditing: (v: boolean) => void;
  editData: Partial<User>; setEditData: (v: Partial<User>) => void; loadingSave: boolean; handleSaveProfile: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="relative">
        <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-500/20 to-indigo-500/10 rounded-[28px] blur-[2px]" />
        <div className="relative bg-[#0a1628]/90 backdrop-blur-3xl border border-white/[0.07] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white font-calsans">Data Profil</h3>
              <p className="text-gray-500 text-xs mt-0.5">Informasi pribadi yang terdaftar di E-LAUT</p>
            </div>
            {!isEditing ? (
              <button onClick={() => { setEditData(user || {}); setIsEditing(true); }} disabled={loadingUser}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all disabled:opacity-30">
                <FiEdit3 className="text-sm" /> Edit Profil
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold hover:bg-white/10 transition-all">
                  <FiX className="text-sm" /> Batal
                </button>
                <button onClick={handleSaveProfile} disabled={loadingSave} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-all disabled:opacity-50">
                  {loadingSave ? <FiLoader className="animate-spin text-sm" /> : <FiCheck className="text-sm" />}
                  {loadingSave ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            )}
          </div>

          {loadingUser ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(10)].map((_, i) => (<div key={i} className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-10 w-full" /></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROFILE_FIELDS.map(({ key, label, type, readonly }) => {
                const isRO = readonly || !isEditing;
                const value = isEditing ? ((editData[key] as string) ?? "") : ((user?.[key] as string) ?? "");
                return (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1">
                      {label}
                      {readonly && isEditing && <span className="text-amber-500/60 normal-case text-[9px] font-medium">(tidak dapat diubah)</span>}
                    </label>
                    <input type={type || "text"} readOnly={isRO} value={value}
                      onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                      className={`w-full h-10 px-3 rounded-xl text-sm border transition-all ${isRO
                        ? "bg-white/[0.02] border-white/[0.04] text-gray-500 cursor-default select-none"
                        : "bg-white/[0.05] border-white/[0.08] text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 focus:bg-white/[0.07] outline-none"
                      } ${readonly && isEditing ? "opacity-40" : ""}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PELATIHAN TAB
// ═══════════════════════════════════════════════════════════════════════════════
function PelatihanTab({ pelatihan, loadingPelatihan, onRefresh }: {
  pelatihan: UserPelatihan[] | null; loadingPelatihan: boolean; onRefresh: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="relative">
        <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-[28px] blur-[2px]" />
        <div className="relative bg-[#0a1628]/90 backdrop-blur-3xl border border-white/[0.07] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white font-calsans">Riwayat Pelatihan</h3>
              <p className="text-gray-500 text-xs mt-0.5">Semua pelatihan yang pernah Anda ikuti</p>
            </div>
            <button onClick={onRefresh} disabled={loadingPelatihan} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/[0.08] text-gray-400 text-xs font-semibold hover:bg-white/10 transition-all disabled:opacity-40">
              <FiRefreshCw className={`text-sm ${loadingPelatihan ? "animate-spin" : ""}`} /> Muat Ulang
            </button>
          </div>

          {loadingPelatihan ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                  <div className="flex gap-3"><Skeleton className="w-10 h-10 rounded-xl shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div>
                </div>
              ))}
            </div>
          ) : !pelatihan || pelatihan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative w-20 h-20 mb-5">
                <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
                <div className="relative w-full h-full rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
                  <HiOutlineAcademicCap className="text-3xl text-gray-600" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white mb-2">Belum Ada Riwayat Pelatihan</h4>
              <p className="text-gray-500 text-xs max-w-xs leading-relaxed mb-6">
                Anda belum pernah mengikuti pelatihan di E-LAUT. Mulai eksplorasi dan tingkatkan kompetensi Anda!
              </p>
              <Link href="/layanan/pelatihan" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-600/20">
                Jelajahi Pelatihan <HiOutlineChevronRight className="text-sm" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pelatihan.map((item, idx) => {
                const badge = getBadgeStyle(item.StatusAproval || "");
                const hasNilai = item.NilaiTeory !== undefined || item.NilaiPraktek !== undefined;
                return (
                  <motion.div key={item.IdUserPelatihan || idx}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-blue-500/20 rounded-2xl p-4 transition-all duration-200 overflow-hidden">

                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${badge.cls.includes("emerald") ? "bg-emerald-400" : badge.cls.includes("rose") ? "bg-rose-400" : badge.cls.includes("amber") ? "bg-amber-400" : "bg-blue-400"}`} />

                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Icon */}
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/15 flex items-center justify-center">
                        <HiOutlineAcademicCap className="text-blue-400 text-xl" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <h4 className="text-sm font-bold text-white leading-snug flex-1">{item.NamaPelatihan || "—"}</h4>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border whitespace-nowrap ${badge.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                            {item.StatusAproval || "Proses"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                          {item.PenyelenggaraPelatihan && (
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                              <HiOutlineOfficeBuilding className="text-blue-400/70 shrink-0" />
                              {item.PenyelenggaraPelatihan}
                            </span>
                          )}
                          {item.TanggalMulai && (
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                              <HiOutlineCalendar className="text-blue-400/70 shrink-0" />
                              {item.TanggalMulai}{item.TanggalBerakhir ? ` – ${item.TanggalBerakhir}` : ""}
                            </span>
                          )}
                          {item.JenisPelatihan && (
                            <span className="text-[10px] text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
                              {item.JenisPelatihan}
                            </span>
                          )}
                        </div>

                        {/* Bottom row: Sertifikat + Nilai */}
                        {(item.NoSertifikat || hasNilai) && (
                          <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between flex-wrap gap-3">
                            {item.NoSertifikat && (
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-gray-500">Sertifikat:</span>
                                <span className="text-emerald-400 font-mono font-semibold">{item.NoSertifikat}</span>
                              </div>
                            )}
                            {hasNilai && (
                              <div className="flex items-center gap-4">
                                {item.NilaiTeory !== undefined && item.NilaiTeory > 0 && (
                                  <div className="text-center">
                                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Teori</p>
                                    <p className={`text-lg font-extrabold ${item.NilaiTeory >= 75 ? "text-emerald-400" : "text-rose-400"}`}>{item.NilaiTeory}</p>
                                  </div>
                                )}
                                {item.NilaiPraktek !== undefined && item.NilaiPraktek > 0 && (
                                  <div className="text-center">
                                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Praktik</p>
                                    <p className={`text-lg font-extrabold ${item.NilaiPraktek >= 75 ? "text-emerald-400" : "text-rose-400"}`}>{item.NilaiPraktek}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
