"use client";

import React from "react";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { User, UserPelatihan } from "@/types/user";
import UserService from "@/components/user-service";
import { ManningAgent } from "@/types/product";
import ManningAgentService from "@/components/manning-agent-service";
import { motion, AnimatePresence } from "framer-motion";
import { HashLoader } from "react-spinners";

export default function DashboardUser() {
    const token = Cookies.get("XSRF081");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const isManningAgent = Cookies.get("isManningAgent");
    const idManningAgent = Cookies.get("IdManningAgent");

    const [userDetail, setUserDetail] = React.useState<User | null>(null);
    const [manningAgentDetail, setManningAgentDetail] =
        React.useState<ManningAgent | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const handleFetchingUserDetail = async () => {
        try {
            const response: AxiosResponse = await axios.get(
                `${baseUrl}/users/getUsersById`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUserDetail(response.data);
        } catch (error) {
            console.error("Error fetching user detail:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchingManningAgentDetail = async () => {
        try {
            const response: AxiosResponse = await axios.get(
                `${baseUrl}/manningAgent/getManningAgent?id=${idManningAgent}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setManningAgentDetail(response.data.data[0]);
        } catch (error) {
            console.error("Error fetching manning agent detail:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (isManningAgent === "true") {
                handleFetchingManningAgentDetail();
            } else {
                handleFetchingUserDetail();
            }
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-jakarta">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('/images/hero-img.jpg')] opacity-5 bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617]" />
            </div>

            {/* Modern Animated Gradient Blobs */}
            <motion.div
                animate={{
                    x: [0, 40, 0],
                    y: [0, -20, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -top-24 -left-24 h-[35rem] w-[35rem] rounded-full bg-blue-600/15 blur-[120px] z-1"
            />
            <motion.div
                animate={{
                    x: [0, -50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-[150px] z-1"
            />

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center w-full h-screen relative z-10"
                    >
                        <HashLoader color="#338CF5" size={60} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10 w-full h-full pt-28 md:pt-36 pb-20 px-4"
                    >
                        <div className="max-w-7xl mx-auto flex flex-col items-center">
                            {/* Dashboard Header Card */}
                            <div className="w-full mb-12">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#1e293b]/30 backdrop-blur-2xl p-8 md:p-16 text-center shadow-2xl"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition duration-1000" />

                                    <div className="relative z-10 space-y-6">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-widest uppercase">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            User Portal Access
                                        </div>

                                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-calsans leading-[1.1] text-white">
                                            Dashboard <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                                                {isManningAgent === "true" ? manningAgentDetail?.NamaManingAgent : userDetail?.Nama.toLowerCase()}
                                            </span>
                                        </h1>

                                        <div className="max-w-2xl mx-auto space-y-4">
                                            <p className="text-gray-400 text-lg font-light leading-relaxed">
                                                Ayo jelajahi aplikasi <span className="text-blue-400 font-semibold">E-LAUT</span> dan temukan pelatihan unggul di sektor Kelautan dan Perikanan yang menarik untuk peningkatan kompetensi Anda.
                                            </p>
                                            <p className="text-gray-500 text-sm italic font-light">
                                                *Laman dashboard terpadu untuk menelusuri pelatihan, status pendaftaran, dan akses layanan digital kelautan.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Service Components */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="w-full"
                            >
                                {isManningAgent === "true" ? (
                                    <ManningAgentService manningAgent={manningAgentDetail} />
                                ) : (
                                    <UserService user={userDetail} />
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

