"use client";

import React, { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { HiSparkles, HiXMark } from "react-icons/hi2";
import Cookies from "js-cookie";
import CallCenter from "./call-center";

const TOUR_COOKIE = "ELAUT_TOUR_COMPLETED";

export default function TourGuide() {
  const [showStartButton, setShowStartButton] = useState(false);

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = Cookies.get(TOUR_COOKIE);

    if (!tourCompleted) {
      // Show start button after a short delay
      const timer = setTimeout(() => {
        setShowStartButton(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    setShowStartButton(false);

    // Determine which steps to show based on current page
    const isHomePage = document.querySelector(".hero-logo") !== null;
    const isCertificatePage = document.querySelector(".certificate-title") !== null;

    let steps: any[] = [
      {
        element: "body",
        popover: {
          title: "Selamat Datang di E-LAUT! 👋",
          description:
            "Platform Elektronik Layanan Pelatihan Utama Terpadu untuk Kelautan & Perikanan. Mari kami tunjukkan fitur-fitur utama!",
          side: "top" as const,
          align: "center" as const,
        },
      },
      {
        element: "header",
        popover: {
          title: "Navigasi Header 🧭",
          description:
            "Menu navigasi utama untuk mengakses berbagai halaman seperti Beranda, Tentang, Lembaga, Layanan & Pengaduan. Klik pada menu untuk menjelajah.",
          side: "bottom" as const,
          align: "center" as const,
        },
      },
    ];

    // Add homepage-specific steps
    if (isHomePage) {
      steps.push(
        {
          element: ".hero-logo",
          popover: {
            title: "Logo E-LAUT",
            description:
              "Logo resmi E-LAUT - Sistem terintegrasi untuk seluruh kebutuhan pelatihan kelautan dan perikanan Anda.",
            side: "bottom" as const,
            align: "center" as const,
          },
        },
        {
          element: ".program-cards",
          popover: {
            title: "Program Pelatihan 📚",
            description:
              "Klik pada setiap kartu untuk melihat detail program pelatihan yang tersedia. Kami menyediakan pelatihan Perikanan, Awak Kapal Perikanan, dan Kelautan.",
            side: "top" as const,
            align: "center" as const,
          },
        }
      );
    }

    // Add certificate page-specific steps
    if (isCertificatePage) {
      steps.push(
        {
          element: ".certificate-title",
          popover: {
            title: "Cek E-Validitas Sertifikat 🎓",
            description:
              "Di halaman ini, Anda dapat memverifikasi keabsahan sertifikat pelatihan yang telah Anda terima dari Balai Pelatihan KP atau Pusat Pelatihan KP.",
            side: "bottom" as const,
            align: "center" as const,
          },
        },
        {
          element: ".certificate-cards",
          popover: {
            title: "Metode Pengecekan 🔍",
            description:
              "Terdapat 3 cara untuk mengecek: (1) Cek sertifikat melalui E-LAUT dengan nomor STTPL, (2) Cek riwayat pelatihan berdasarkan NIK, atau (3) Cek validasi tanda tangan elektronik melalui BSrE. Klik tombol info (?) untuk panduan lengkap.",
            side: "top" as const,
            align: "center" as const,
          },
        }
      );
    }

    // Add closing step
    steps.push({
      element: "body",
      popover: {
        title: "Siap Memulai? 🚀",
        description:
          "Anda dapat memulai tur kapan saja dengan mengklik tombol 'Mulai Tur' di pojok kanan bawah. Selamat menjelajahi E-LAUT!",
        side: "top" as const,
        align: "center" as const,
      },
    });

    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: steps,
      nextBtnText: "Lanjut →",
      prevBtnText: "← Kembali",
      doneBtnText: "Selesai ✓",
      progressText: "{{current}} dari {{total}}",
      onDestroyStarted: () => {
        // Mark tour as completed
        Cookies.set(TOUR_COOKIE, "true", { expires: 365 });
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  const dismissWelcome = () => {
    setShowStartButton(false);
    Cookies.set(TOUR_COOKIE, "true", { expires: 365 });
  };

  return (
    <>
      {/* Call Center Component */}


      {/* Welcome Popup */}
      {showStartButton && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismissWelcome}
          />

          {/* Welcome Card */}
          <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-10 animate-in zoom-in-95 duration-500">
            {/* <CallCenter /> */}

            {/* Close Button */}
            <button
              onClick={dismissWelcome}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <HiXMark className="text-white text-xl" />
            </button>

            {/* Content */}
            <div className="text-center text-white">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <HiSparkles className="text-4xl text-white animate-pulse" />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Selamat Datang di E-LAUT! 👋
              </h2>

              <p className="text-lg text-blue-50 mb-8 leading-relaxed">
                Pertama kali di sini? Mari kami tunjukkan fitur-fitur utama
                platform E-LAUT untuk memudahkan Anda!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={startTour}
                  className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Mulai Tur Panduan
                </button>
                <button
                  onClick={dismissWelcome}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                >
                  Lewati
                </button>
              </div>

              <p className="text-sm text-blue-100 mt-6">
                Anda dapat memulai tur kapan saja dengan tombol di pojok kanan
                bawah
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
          </div>
        </div>
      )}

      {/* Floating Tour Button */}
      <button
        onClick={startTour}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Mulai tur panduan"
        title="Mulai Tur Panduan"
      >
        <HiSparkles className="text-2xl group-hover:rotate-12 transition-transform" />

        {/* Tooltip */}
        <div className="absolute right-full mr-3 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Mulai Tur Panduan
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
            <div className="border-8 border-transparent border-l-slate-900" />
          </div>
        </div>
      </button>
    </>
  );
}
