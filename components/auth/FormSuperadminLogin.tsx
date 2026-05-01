"use client";

import Image from "next/image";
import React, { FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";

import { HiOutlineEye, HiOutlineMail } from "react-icons/hi";
import { HiOutlineEyeOff, HiOutlineLockClosed } from "react-icons/hi";

import Toast from "@/commons/Toast";
import { motion } from "framer-motion";
import { elautBaseUrl } from "@/constants/urls";

export default function FormSuperadminLogin() {
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
  });

  const [isShowPassword, setIsShowPassword] = React.useState<boolean>(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.username === "" || formData.password === "") {
      Toast.fire({
        icon: "error",
        title: "Gagal login",
        text: "Mohon lengkapi email dan password.",
      });
      return;
    }

    try {
      const response: AxiosResponse = await axios.post(
        `${elautBaseUrl}/superadmin/login`,
        JSON.stringify(formData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Extract details or generate generic if not present
      const random_id = response.data?.id || Math.random().toString(36).substring(2, 15);
      const role = response.data?.role || "superadmin";

      if (response.data?.token) {
        Cookies.set("XSRF081", response.data.token, { expires: 1 });
      }

      Toast.fire({
        icon: "success",
        title: "Berhasil login",
        text: "Selamat datang, Superadmin!",
      });

      router.replace(`/${random_id}/${role}/dashboard`);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || error.response?.data?.pesan || "Terjadi kesalahan. Silahkan periksa kredensial anda.";
      Toast.fire({
        icon: "error",
        title: "Gagal login",
        text: errorMsg,
      });
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
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/30 blur-[100px] z-1"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px] z-1"
        />

        <section className="relative z-10 w-full max-w-lg flex flex-col items-center max-h-full overflow-y-auto scrollbar-hide py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full flex flex-col items-center"
          >
            {/* Header Section */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Superadmin Portal
              </motion.div>
              <h1 className="text-3xl md:text-4xl text-center leading-none font-bold tracking-tight text-white font-calsans mb-2">
                Login <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-300">Superadmin</span>
              </h1>
              <p className="text-gray-400 mx-auto text-xs md:text-sm leading-relaxed max-w-sm">
                Akses khusus pengelola sistem E-LAUT. Silakan login untuk melanjutkan.
              </p>
            </div>

            {/* Glassmorphism Form Card */}
            <div className="w-full relative group px-2 md:px-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000" />
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
                <form onSubmit={handleLogin} autoComplete="off" className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-2" htmlFor="email">
                      <HiOutlineMail className="text-red-400" /> Email / Username
                    </label>
                    <input
                      id="email"
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-inter"
                      placeholder="admin@example.com"
                      value={formData.username}
                      name="email"
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-300 flex items-center gap-2" htmlFor="password">
                      <HiOutlineLockClosed className="text-red-400" /> Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={isShowPassword ? "text" : "password"}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm md:text-base placeholder:text-gray-600 outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-inter"
                        placeholder="••••••••"
                        required
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setIsShowPassword(!isShowPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {isShowPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      className="w-full h-12 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 group"
                    >
                      SIGN IN
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
