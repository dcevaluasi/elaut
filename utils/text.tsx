import { MdPodcasts } from 'react-icons/md'
import {
  RiCheckboxCircleFill,
  RiTimeLine,
  RiCloseCircleFill,
  RiQuestionFill,
  RiLockFill,
} from 'react-icons/ri'

export function capitalize(text: string): string {
  return text.replace(/\b\w/g, (match) => match.toUpperCase())
}

export function generateFullNameBalai(bppp: string): string {
  switch (bppp) {
    case 'BPPP Medan':
      return 'Balai Pelatihan dan Penyuluhan Perikanan Medan'
    case 'BPPP Tegal':
      return 'Balai Pelatihan dan Penyuluhan Perikanan Tegal'
    case 'BPPP Banyuwangi':
      return 'Balai Pelatihan dan Penyuluhan Perikanan Banyuwangi'
    case 'BPPP Ambon':
      return 'Balai Pelatihan dan Penyuluhan Perikanan Ambon'
    case 'BPPP Bitung':
      return 'Balai Pelatihan dan Penyuluhan Perikanan Bitung'
    case 'BDA Sukamandi':
      return 'Balai Diklat Aparatur Sukamandi'
    default:
      return 'Balai Pelatihan dan Penyuluhan Perikanan Testing'
  }
}

export function generateTanggalPelatihan(tanggal: string): string {
  if (tanggal != "") {
    const date = new Date(tanggal)

    const weekdays = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ]

    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]

    const dayOfWeek = weekdays[date.getUTCDay()]
    const day = date.getUTCDate()
    const month = months[date.getUTCMonth()]
    const year = date.getUTCFullYear()

    return `${day} ${month} ${year}`
  } else {
    return `-`
  }

}

export function generateTanggalPelatihanWithoutDay(tanggal: string): string {
  const date = new Date(tanggal)

  // Array nama-nama bulan
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  // Mengambil nama hari, tanggal, bulan, dan tahun
  const day = date.getUTCDate()
  const month = months[date.getUTCMonth()]
  const year = date.getUTCFullYear()

  // Mengembalikan string tanggal yang telah diformat
  return `${day} ${month} ${year}`
}

export function getStatusInfo(
  status: string,
): { label: string; color: string; icon: JSX.Element } {
  switch (status) {
    case "0":
    case "":
      return {
        label: "Draft",
        color: "bg-gray-500 text-white",
        icon: <RiTimeLine className="w-4 h-4" />,
      };
    case "0.1":
      return {
        label: "Publish",
        color: "bg-indigo-500 text-white",
        icon: <MdPodcasts className="w-4 h-4" />,
      };
    case "1":
      return {
        label: "Pending SPV",
        color: "bg-amber-500 text-white",
        icon: <RiTimeLine className="w-4 h-4" />,
      };
    case "1.1":
      return {
        label: "Approved Pelaksanaan",
        color: "bg-green-500 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };
    case "1.2":
      return {
        label: "Perbaikan SPV",
        color: "bg-rose-600 text-white",
        icon: <RiCloseCircleFill className="w-4 h-4" />,
      };
    case "7A":
      return {
        label: "Pending Kabalai",
        color: "bg-blue-500 text-white",
        icon: <RiTimeLine className="w-4 h-4" />,
      };
    case "7B":
      return {
        label: "Approved Kabalai",
        color: "bg-amber-500 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };
    case "7C":
      return {
        label: "Perbaikan Kabalai",
        color: "bg-rose-600 text-white",
        icon: <RiCloseCircleFill className="w-4 h-4" />,
      };
    case "7D":
      return {
        label: "Signed",
        color: "bg-green-500 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };

    case "2":
      return {
        label: "Pending Verifikator",
        color: "bg-amber-500 text-white",
        icon: <RiTimeLine className="w-4 h-4" />,
      };
    case "3":
      return {
        label: "Perbaikan Verifikator",
        color: "bg-rose-600 text-white",
        icon: <RiCloseCircleFill className="w-4 h-4" />,
      };
    case "4":
      return {
        label: "Approved Pelaksanaan",
        color: "bg-teal-500 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };
    case "1.25":
    case "5":
      return {
        label: "Closed",
        color: "bg-primary text-white",
        icon: <RiLockFill className="w-4 h-4" />,
      };
    case "6":
      return {
        label: "Pending STTPL Verifikator",
        color: "bg-primary text-white",
        icon: <RiTimeLine className="w-4 h-4" />,
      };
    case "7":
      return {
        label: "Perbaikan STTPL Verifikator",
        color: "bg-rose-600 text-white",
        icon: <RiCloseCircleFill className="w-4 h-4" />,
      };
    case "8":
      return {
        label: "Pending Kapus",
        color: "bg-blue-500 text-white",
        icon: <RiLockFill className="w-4 h-4" />,
      };
    case "9":
      return {
        label: "Perbaikan Kapus",
        color: "bg-rose-600 text-white",
        icon: <RiCloseCircleFill className="w-4 h-4" />,
      };
    case "10":
      return {
        label: "Approved Kapus",
        color: "bg-amber-500 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };
    case "11":
      return {
        label: "Signed",
        color: "bg-green-500 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };
    case "12":
      return {
        label: "Pending Kabadan",
        color: "bg-amber-500 text-white",
        icon: <RiTimeLine className="w-4 h-4" />,
      };
    case "13":
      return {
        label: "Perbaikan Kabadan",
        color: "bg-rose-600 text-white",
        icon: <RiCloseCircleFill className="w-4 h-4" />,
      };
    case "14":
      return {
        label: "Approved Kabadan",
        color: "bg-blue-500 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };
    case "15":
      return {
        label: "Signed",
        color: "bg-green-500 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };
    default:
      return {
        label: "Tidak Diketahui",
        color: "bg-neutral-400 text-white",
        icon: <RiQuestionFill className="w-4 h-4" />,
      };
  }
}

export function formatName(name: string): string {
  const [beforeComma, ...afterComma] = name.split(",");

  if (afterComma.length > 0) {
    const after = afterComma.join(",").trim();

    const formattedAfter = after
      .split(" ")
      .map(word =>
        word
          .split(".")
          .map(
            part =>
              part.charAt(0).toUpperCase() +
              part.slice(1).toLowerCase()
          )
          .join(".")
      )
      .join(" ");

    return beforeComma.toUpperCase() + ", " + formattedAfter;
  } else {
    return name.toUpperCase();
  }
}


export const parseDateFirebase = (dateStr: string): Date => {
  // format: "2/9/2025 10.31.59"
  const [datePart, timePart] = dateStr.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute, second] = timePart.split(".").map(Number);

  // JS Date uses month index starting at 0
  return new Date(year, month - 1, day, hour, minute, second);
};

export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
