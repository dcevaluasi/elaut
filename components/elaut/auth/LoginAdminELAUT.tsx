"use client";

import Toast from "@/commons/Toast";
import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { HiOutlineEye, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUserGroup } from "react-icons/hi2";
import ReCAPTCHA from "react-google-recaptcha";
import { generateRandomId, setSecureCookie } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HiOutlineEyeOff } from "react-icons/hi";
import { HashLoader } from "react-spinners";

export const LoginAdminELAUT = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  // SHOWING PASSWORD
  const [isShowPassword, setIsShowPassword] = React.useState<boolean>(false);

  // CAPTCHA VALIDATION
  const [captcha, setCaptcha] = React.useState<string | null>();

  const [isRedirecting, setIsRedirecting] = React.useState<boolean>(false);

  /*
      state variables for login
      */
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("");

  const resetAllStateToEmptyString = () => {
    setEmail("");
    setPassword("");
  };

  // HANDLING RESET STATE
  const handleClearStateLogin = () => {
    setEmail("");
    setPassword("");
    setRole("");
  };

  // HANDLING LOGIN ADMIN
  const [isLoadingLogin, setIsLoadingLogin] = React.useState<boolean>(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoadingLogin(true);

    if (!email || !password) {
      Toast.fire({
        icon: "error",
        title: "Gagal mencoba login.",
        text: "Harap lengkapi email dan password terlebih dahulu sebelum login!",
      });
      handleClearStateLogin();
      setIsLoadingLogin(false);
      return;
    }

    if (!captcha) {
      Toast.fire({
        icon: "error",
        title: "Gagal mencoba login.",
        text: "Untuk membuktikan kamu bukan robot, harap melakukan captcha terlebih dahulu!",
      });
      setIsLoadingLogin(false);
      return;
    }

    try {
      const response: AxiosResponse = await axios.post(
        `${baseUrl}/${role == "upt" ? "lemdik" : "adminPusat"}/login`,
        JSON.stringify({ email, password }),
        { headers: { "Content-Type": "application/json" } }
      );

      Toast.fire({
        icon: "success",
        title: "Yeayyy!",
        text: "Berhasil login ke admin E-LAUT, silahkan manajemen pelatihan dan sertifikat-mu!",
      });

      setSecureCookie("XSRF091", response.data.t);
      setSecureCookie("XSRF092", "true");
      setSecureCookie("XSRF093", role == "upt" ? "balai" : "adminPusat");

      resetAllStateToEmptyString();
      setIsLoadingLogin(false);

      const dashboardPath =
        role == "upt"
          ? `/${generateRandomId()}/lemdiklat/dashboard`
          : "/admin/pusat/dashboard";
      setIsRedirecting(true);
      router.push(dashboardPath);
    } catch (error) {
      // console.error({ error });
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.status === 401
            ? "Email atau password yang dimasukkan salah atau role yang kamu pilih tidak sesuai, harap periksa kembali!"
            : error.response?.status === 500
              ? "Proses login gagal dikarenakan terjadi gangguan pada server, hubungi admin pusat melalui call center!"
              : "Periksa jaringan internetmu, sistem tidak terhubung ke internet!";

        Toast.fire({
          icon: "error",
          title: "Oops.",
          text: errorMessage,
        });

        setIsLoadingLogin(false);
        setIsRedirecting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] font-jakarta overflow-hidden scrollbar-hide">
      <main className="h-full w-full relative bg-slate-950 text-white flex items-center justify-center p-4 scrollbar-hide">
        {/* Animated Background Image */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.25 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={"/images/hero-img6.jpg"}
            className="w-full h-full object-cover"
            alt="Background"
            fill={true}
            priority
          />
        </motion.div>

        {/* Gradient Blobs with Animation */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/30 blur-[100px] z-1"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px] z-1"
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-indigo-500/10 blur-[80px]"
        />

        <section className="relative z-10 w-full max-w-lg flex flex-col items-center max-h-full overflow-y-auto scrollbar-hide py-6">
          <AnimatePresence mode="wait">
            {isRedirecting ? (
              <motion.div
                key="redirecting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4"
              >
                <HashLoader color="#3b82f6" size={60} />
                <p className="text-blue-400 font-medium animate-pulse text-lg text-center">Redirecting to Dashboard...</p>
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full flex flex-col items-center"
              >
                {/* Header Section */}
                <div className="text-center mb-5">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Portal Admin
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl leading-none font-bold tracking-tight text-white font-calsans">
                    Login Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">E-LAUT</span>
                  </h1>
                  <p className="text-gray-400 mx-auto text-xs md:text-sm leading-relaxed">
                    Selamat datang kembali. Silakan masuk untuk mengelola portal E-LAUT.
                  </p>
                </div>

                {/* Glassmorphism Form Card */}
                <div className="w-full relative group px-2 md:px-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>

                  <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <form className="space-y-4 md:space-y-5" onSubmit={handleLogin}>
                      {/* Email Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                          <HiOutlineEnvelope className="text-blue-400" /> Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base placeholder:text-gray-500 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                          placeholder="admin@elaut.id"
                          autoComplete="off"
                        />
                      </div>

                      {/* Password Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                          <HiOutlineLockClosed className="text-blue-400" /> Password
                        </label>
                        <div className="relative">
                          <input
                            type={isShowPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base placeholder:text-gray-500 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-inter"
                            placeholder="••••••••"
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            onClick={() => setIsShowPassword(!isShowPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {isShowPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Role Selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                          <HiOutlineUserGroup className="text-blue-400" /> Akses Sebagai
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer placeholder:text-gray-500 font-inter"
                        >
                          <option value="" disabled className="bg-slate-900">Pilih akses</option>
                          <option value="upt" className="bg-slate-900">Pengelola UPT</option>
                          <option value="pusat" className="bg-slate-900">Pengelola Pusat</option>
                          <option value="pimpinan" className="bg-slate-900 text-white">Pimpinan</option>
                        </select>
                      </div>

                      {/* reCAPTCHA Animation */}
                      <AnimatePresence>
                        {email && password && role && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2">
                              <label className="text-[10px] md:text-xs font-medium text-gray-400 mb-2 block">
                                Verification <span className="text-red-500">*</span>
                              </label>
                              <div className="bg-white/5 rounded-xl p-1.5 flex justify-center border border-white/5 scale-[0.85] md:scale-100 origin-top">
                                <ReCAPTCHA
                                  theme="dark"
                                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                  onChange={setCaptcha}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Login Button */}
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Button
                          disabled={isLoadingLogin || !captcha}
                          type="submit"
                          className="w-full h-11 md:h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-base md:text-lg shadow-lg shadow-blue-500/25 transition-all border-none"
                        >
                          {isLoadingLogin ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Logging in...
                            </div>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </motion.div>
                    </form>

                    <div className="mt-6 pt-5 border-t border-white/10">
                      <p className="text-[10px] md:text-xs text-center text-gray-500 leading-relaxed">
                        Dengan login, Anda menyetujui <span className="text-blue-400 underline cursor-pointer hover:neon-glow">Ketentuan Layanan</span> dan <span className="text-blue-400 underline cursor-pointer">Kebijakan Keamanan</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};
