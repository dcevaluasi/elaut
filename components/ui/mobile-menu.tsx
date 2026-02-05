"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  }, [mobileNavOpen]);

  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!mobileNavOpen || keyCode !== 27) return;
      setMobileNavOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [mobileNavOpen]);

  return (
    <div className={`${pathname.includes('instruktur/form') ? 'hidden' : 'flex lg:hidden'} items-center`}>
      {/* Hamburger button */}
      <button
        ref={trigger}
        className="relative z-[9999999] p-2 text-white transition-colors"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <div className="flex flex-col gap-1.5 w-6">
          <motion.span
            animate={mobileNavOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="h-0.5 w-full bg-white rounded-full transition-transform origin-center"
          />
          <motion.span
            animate={mobileNavOpen ? { opacity: 0 } : { opacity: 1 }}
            className="h-0.5 w-full bg-white rounded-full transition-opacity"
          />
          <motion.span
            animate={mobileNavOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="h-0.5 w-full bg-white rounded-full transition-transform origin-center"
          />
        </div>
      </button>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999998] bg-[#020617]/95 backdrop-blur-2xl"
          >
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              ref={mobileNav}
              className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-[#0f172a] shadow-2xl border-l border-white/10 overflow-y-auto"
            >
              <div className="flex flex-col h-full p-8 pt-24">
                <ul className="space-y-4 flex-grow">
                  <MobileNavItem
                    href="/"
                    label="Beranda"
                    icon={<HiHome />}
                    active={pathname === "/"}
                    onClick={() => setMobileNavOpen(false)}
                  />
                  <MobileNavItem
                    href="/layanan/cek-sertifikat"
                    label="Cek Sertifikat"
                    icon={<HiIdentification />}
                    active={pathname === "/layanan/cek-sertifikat"}
                    onClick={() => setMobileNavOpen(false)}
                  />

                  <li>
                    <button
                      onClick={() => setOpenLayanan(!openLayanan)}
                      className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300 ${pathname.startsWith("/layanan") ? "bg-blue-500/10 text-blue-400" : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${pathname.startsWith("/layanan") ? "bg-blue-500/20" : "bg-white/5"}`}>
                          <HiNewspaper className="text-xl" />
                        </div>
                        <span className="font-semibold tracking-wide">Layanan</span>
                      </div>
                      <HiMiniChevronDown
                        className={`text-xl transition-transform duration-300 ${openLayanan ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {openLayanan && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 ml-4 border-l border-white/10 space-y-1 overflow-hidden"
                        >
                          <MobileDropdownSubItem
                            href="/layanan/publik/maklumat-pelayanan"
                            label="Maklumat Pelayanan"
                            icon={<HiOutlineClipboardDocumentCheck />}
                            onClick={() => setMobileNavOpen(false)}
                          />
                          <MobileDropdownSubItem
                            href="/layanan/standar-pelayanan"
                            label="Standar Pelayanan"
                            icon={<HiOutlineDocumentText />}
                            onClick={() => setMobileNavOpen(false)}
                          />
                          <MobileDropdownSubItem
                            href="https://span.lapor.go.id"
                            label="SPAN Lapor"
                            icon={<HiOutlineChatBubbleLeftRight />}
                            onClick={() => setMobileNavOpen(false)}
                          />
                          <MobileDropdownSubItem
                            href="/layanan/survey-kepuasan"
                            label="Susan KKP"
                            icon={<HiOutlineChartBar />}
                            onClick={() => setMobileNavOpen(false)}
                          />
                          <MobileDropdownSubItem
                            href="/layanan/hasil-survey"
                            label="Hasil Survei"
                            icon={<HiOutlineChartBar />}
                            onClick={() => setMobileNavOpen(false)}
                          />
                          <MobileDropdownSubItem
                            href="/layanan/publik/masukan-saran"
                            label="Masukan & Saran"
                            icon={<HiOutlineChatBubbleBottomCenterText />}
                            onClick={() => setMobileNavOpen(false)}
                          />
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                </ul>

                <div className="pt-8 mt-8 border-t border-white/10">
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        setMobileNavOpen(false);
                        router.push("/dashboard");
                      }}
                      className="w-full p-4 rounded-2xl bg-blue-600 text-white font-bold tracking-wide shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      DASHBOARD
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileNavOpen(false);
                        router.push("/login");
                      }}
                      className="w-full p-4 rounded-2xl bg-blue-600 text-white font-bold tracking-wide shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      LOGIN
                    </button>
                  )}
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavItem({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${active ? "bg-blue-500/10 text-blue-400" : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
      >
        <div className={`p-2 rounded-xl ${active ? "bg-blue-500/20" : "bg-white/5"}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <span className="font-semibold tracking-wide">{label}</span>
      </Link>
    </li>
  );
}

function MobileDropdownSubItem({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 text-sm hover:text-white hover:bg-white/5 transition-all duration-300"
      >
        <span className="text-lg opacity-60">{icon}</span>
        <span className="font-medium tracking-wide">{label}</span>
      </Link>
    </li>
  );
}

