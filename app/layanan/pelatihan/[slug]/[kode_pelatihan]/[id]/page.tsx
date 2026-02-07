"use client";

import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

import {
  DetailPelatihanMasyarakat,
  PelatihanMasyarakat,
} from "@/types/product";
import {
  extractLastSegment,
} from "@/utils";
import Toast from "@/commons/Toast";
import { decryptValue } from "@/lib/utils";
import { elautBaseUrl } from "@/constants/urls";
import DetailPelatihan from "@/components/elaut/DetailPelatihan";
import { HashLoader } from "react-spinners";
import Footer from "@/components/ui/footer";

function Page() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const pathname = usePathname();
  const id = decryptValue(extractLastSegment(pathname));

  const [data, setData] = React.useState<DetailPelatihanMasyarakat | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const [isRegistrasi, setIsRegistrasi] = React.useState(false);
  const [isOpenRegistrationCommand, setIsOpenRegistrationCommand] =
    React.useState(false);

  const jenisProgram = Cookies.get("JenisProgram");
  const [dataRelated, setDataRelated] = React.useState<PelatihanMasyarakat[]>([]);

  const handleFetchingPublicTrainingDataById = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/getPelatihanUser?idPelatihan=${id}`
      );
      setLoading(false);
      setData(response.data);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching detail:", error);
    }
  };

  const handleFetchingPublicTrainingData = async () => {
    setLoading(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihan?${jenisProgram}`
      );
      setLoading(false);

      if (response.data!.data != null) {
        const filteredAndSortedData = response.data!.data
          .filter((item: PelatihanMasyarakat) => item.JenisProgram === jenisProgram)
          .sort((a: PelatihanMasyarakat, b: PelatihanMasyarakat) => {
            const dateA = new Date(a.TanggalMulaiPelatihan);
            const dateB = new Date(b.TanggalMulaiPelatihan);
            if (a.StatusApproval === "Selesai" && b.StatusApproval !== "Selesai")
              return 1;
            if (a.StatusApproval !== "Selesai" && b.StatusApproval === "Selesai")
              return -1;
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 2);
        setDataRelated(filteredAndSortedData);
      } else {
        setDataRelated([]);
      }
    } catch (error) {
      console.error("Error fetching related:", error);
      setLoading(false);
    }
  };

  const handleRegistration = () => {
    if (data?.StatusApproval === "Selesai") {
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: "Yah pelatihan ini sudah berakhir, cari pelatihan lainnya sobat ELAUT!",
      });
      return;
    }
    if (Cookies.get("XSRF081")) {
      setIsRegistrasi(true);
    } else {
      setIsOpenRegistrationCommand(true);
    }
  };

  React.useEffect(() => {
    handleFetchingPublicTrainingDataById();

    const timer = setTimeout(() => {
      handleFetchingPublicTrainingData();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-jakarta">
      {/* Background with Ambient Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/hero-img4-preview.jpg')] opacity-10 bg-cover bg-center" />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/40 to-[#020617]" />
      </div>

      {/* Modern Animated Gradient Blobs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -top-24 -left-24 h-[40rem] w-[40rem] rounded-full bg-blue-600/20 blur-[120px] z-1"
      />
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-48 -right-48 h-[45rem] w-[45rem] rounded-full bg-cyan-500/15 blur-[150px] z-1"
      />

      {/* Main Content Area */}
      <section className="relative z-10 flex min-h-screen flex-col items-center px-6 md:px-12 py-20 md:py-32">
        <div className="w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-32"
              >
                <HashLoader color="#38bdf8" size={60} />
              </motion.div>
            ) : data ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="mb-8">
                  <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-semibold tracking-widest uppercase mb-6 inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Detail Pelatihan Masyarakat
                  </div>
                </div>
                <DetailPelatihan
                  data={data}
                  handleRegistration={handleRegistration}
                  isRegistrasi={isRegistrasi}
                />
              </motion.div>
            ) : (
              <motion.div
                key="not-found"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="relative w-72 h-72 mx-auto mb-8">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                  <Image
                    src="/illustrations/not-found.png"
                    alt="Not Found"
                    fill
                    className="object-contain relative z-10"
                  />
                </div>
                <h3 className="text-3xl font-calsans text-white mb-4">Pelatihan Tidak Ditemukan</h3>
                <p className="text-gray-400 text-lg font-light">Maaf, kami tidak dapat menemukan informasi pelatihan yang Anda cari.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Page;

