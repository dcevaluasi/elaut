import {
  RiCheckboxCircleFill,
  RiTimeLine,
  RiCloseCircleFill,
  RiQuestionFill,
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
  const date = new Date(tanggal)

  // Array nama-nama hari
  const weekdays = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
  ]

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
  const dayOfWeek = weekdays[date.getUTCDay()]
  const day = date.getUTCDate()
  const month = months[date.getUTCMonth()]
  const year = date.getUTCFullYear()

  // Mengembalikan string tanggal yang telah diformat
  return `${day} ${month} ${year}`
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
      return {
        label: "Dibuat",
        color: "bg-neutral-500 text-white",
        icon: <RiTimeLine className="w-4 h-4" />,
      };
    case "1":
    case "6":
    case "10":
    case "12":
    case "15":
      return {
        label: "Pending SPV",
        color: "bg-amber-500 text-white",
        icon: <RiTimeLine className="w-4 h-4" />,
      };
    case "2":
    case "8":
      return {
        label: "Pending Verifikator",
        color: "bg-amber-500 text-white",
        icon: <RiTimeLine className="w-4 h-4" />,
      };
    case "3":
    case "9":
      return {
        label: "Reject Verifikator",
        color: "bg-rose-500 text-white",
        icon: <RiCloseCircleFill className="w-4 h-4" />,
      };
    case "4":
    case "17":
      return {
        label: "Approved",
        color: "bg-green-500 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };
    case "5":
      return {
        label: "Telah Selesai",
        color: "bg-green-600 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };
    case "7":
    case "11":
      return {
        label: "Reject SPV",
        color: "bg-rose-500 text-white",
        icon: <RiCloseCircleFill className="w-4 h-4" />,
      };
    case "13":
      return {
        label: "Reject Kapus",
        color: "bg-rose-500 text-white",
        icon: <RiCloseCircleFill className="w-4 h-4" />,
      };
    case "14":
      return {
        label: "Approve Kapus",
        color: "bg-green-500 text-white",
        icon: <RiCheckboxCircleFill className="w-4 h-4" />,
      };
    case "16":
      return {
        label: "Reject Kabadan",
        color: "bg-rose-500 text-white",
        icon: <RiCloseCircleFill className="w-4 h-4" />,
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
    return beforeComma.toUpperCase() + ", " + afterComma.join(",").trim();
  } else {
    return name.toUpperCase();
  }
}
