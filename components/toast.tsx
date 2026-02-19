import Swal from "sweetalert2";
import { Plus_Jakarta_Sans } from "next/font/google";

const plus_jakarta_sans = Plus_Jakarta_Sans({ subsets: ["latin"] });

/**
 * Premium Toast Configuration
 * Features: Dark mode, glassmorphism, refined typography, and sleek progress bar.
 */
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
  background: "#0f172a",
  color: "#ffffff",
  iconColor: "#3b82f6",
  customClass: {
    container: `${plus_jakarta_sans.className} z-[9999999999999]`,
    popup: "rounded-[1.5rem] border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4",
    title: "text-sm md:text-base font-bold tracking-tight text-white mb-0.5",
    htmlContainer: "text-[10px] md:text-xs text-gray-400 font-medium leading-relaxed",
    timerProgressBar: "bg-gradient-to-r from-blue-500 to-cyan-400 h-[2px]",
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export default Toast;
