"use client";

import { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Link from "next/link";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import {
  HiMiniChevronDown,
  HiHome,
  HiIdentification,
  HiNewspaper,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBar,
  HiOutlineChatBubbleBottomCenterText,
} from "react-icons/hi2";

export default function MobileMenu({ isTop }: { isTop: boolean }) {
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [openLayanan, setOpenLayanan] = useState<boolean>(false);
  const isLoggedIn = Cookies.get("XSRF081");
  const router = useRouter();
  const pathname = usePathname();

  const trigger = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLDivElement>(null);

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (!mobileNav.current || !trigger.current) return;
      if (
        !mobileNavOpen ||
        mobileNav.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      setMobileNavOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!mobileNavOpen || keyCode !== 27) return;
      setMobileNavOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div className={`${usePathname().includes('instruktur/form') ? 'hidden' : 'flex md:hidden'} px-6 md:px-0 mt-0`}>
      {/* Hamburger button */}
      <button
        ref={trigger}
        className={`hamburger ${mobileNavOpen && "active"}`}
        aria-controls="mobile-nav"
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <span className="sr-only">Menu</span>
        <svg
          className="w-6 h-6 fill-current text-white"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect y="4" width="24" height="2" />
          <rect y="11" width="24" height="2" />
          <rect y="18" width="24" height="2" />
        </svg>
      </button>

      {/*Mobile navigation */}
      <div ref={mobileNav}>
        <Transition
          show={mobileNavOpen}
          as="nav"
          id="mobile-nav"
          className="absolute top-full h-screen pb-16 z-20 left-0 w-full overflow-scroll bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950"
          enter="transition ease-out duration-200 transform"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ul className="px-5 py-4 space-y-2">
            {/* Beranda */}
            <li>
              <Link
                href="/"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition duration-200 ${
                  pathname === "/" ? "bg-white/20 text-blue-400" : "text-white hover:bg-white/10"
                }`}
                onClick={() => setMobileNavOpen(false)}
              >
                <HiHome className="text-xl" />
                Beranda
              </Link>
            </li>

            {/* Cek Sertifikat */}
            <li>
              <Link
                href="/layanan/cek-sertifikat"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition duration-200 ${
                  pathname === "/layanan/cek-sertifikat" ? "bg-white/20 text-blue-400" : "text-white hover:bg-white/10"
                }`}
                onClick={() => setMobileNavOpen(false)}
              >
                <HiIdentification className="text-xl" />
                Cek Sertifikat
              </Link>
            </li>

            {/* Layanan & Pengaduan Dropdown */}
            <li>
              <button
                onClick={() => setOpenLayanan(!openLayanan)}
                className={`flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl font-semibold transition duration-200 ${
                  pathname.startsWith("/layanan") ? "bg-white/20 text-blue-400" : "text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <HiNewspaper className="text-xl" />
                  Layanan & Pengaduan
                </div>
                <HiMiniChevronDown
                  className={`text-lg transition-transform duration-200 ${
                    openLayanan ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Items */}
              {openLayanan && (
                <ul className="mt-2 ml-4 space-y-1 bg-white/5 rounded-xl p-2">
                  <li>
                    <Link
                      href="/layanan/publik/maklumat-pelayanan"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/90 text-sm hover:bg-white/10 hover:text-white transition"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <HiOutlineClipboardDocumentCheck className="text-lg" />
                      Maklumat Pelayanan
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/layanan/standar-pelayanan"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/90 text-sm hover:bg-white/10 hover:text-white transition"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <HiOutlineDocumentText className="text-lg" />
                      Standar Pelayanan
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://span.lapor.go.id"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/90 text-sm hover:bg-white/10 hover:text-white transition"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <HiOutlineChatBubbleLeftRight className="text-lg" />
                      SPAN Lapor
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/layanan/survey-kepuasan"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/90 text-sm hover:bg-white/10 hover:text-white transition"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <HiOutlineChartBar className="text-lg" />
                      Survey Kepuasan Masyarakat (Susan KKP)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/layanan/hasil-survey"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/90 text-sm hover:bg-white/10 hover:text-white transition"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <HiOutlineChartBar className="text-lg" />
                      Hasil Survei Kepuasan Masyarakat
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/layanan/publik/masukan-saran"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/90 text-sm hover:bg-white/10 hover:text-white transition"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <HiOutlineChatBubbleBottomCenterText className="text-lg" />
                      Masukan & Saran
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Login/Dashboard Button */}
            <li className="pt-4">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl border border-blue-400 bg-blue-500/20 text-white hover:bg-blue-500 hover:text-white font-semibold transition"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileNavOpen(false);
                    router.push("/login");
                  }}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl border border-blue-400 bg-blue-500/20 text-white hover:bg-blue-500 hover:text-white font-semibold transition"
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </Transition>
      </div>
    </div>
  );
}
