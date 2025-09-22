import Swal from "sweetalert2";
import "./styles/utils.css";

import { Plus_Jakarta_Sans } from "next/font/google";
const plus_jakarta_sans = Plus_Jakarta_Sans({ subsets: ["latin"] });

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showCloseButton: true,
  timer: 5000,
  customClass: {
    container: `${plus_jakarta_sans.className} text-sm  font-plusJakartaSans z-[9999999999999]`,
  },
  timerProgressBar: true,

  heightAuto: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export default Toast;
