"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { PelatihanMasyarakat } from "@/types/product";
import { UserPelatihan } from "@/types/user";

// ================== Chart Config ==================
const chartOptions: ApexOptions = {
  chart: {
    type: "line",
    height: 335,
    fontFamily: "Satoshi, sans-serif",
    toolbar: { show: false },
    dropShadow: {
      enabled: true,
      color: "#623CEA14",
      top: 10,
      blur: 4,
      opacity: 0.1,
    },
  },
  colors: ["#3B82F6", "#10B981"],
  stroke: {
    width: [0, 3],
    curve: "smooth",
  },
  plotOptions: {
    bar: {
      columnWidth: "55%",
      borderRadius: 4,
    },
  },
  fill: {
    opacity: [0.85, 1],
  },
  grid: {
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } },
  },
  markers: {
    size: [0, 5],
    colors: ["#fff", "#fff"],
    strokeColors: ["#3C50E0", "#10B981"],
    strokeWidth: 3,
    hover: { sizeOffset: 5 },
  },
  legend: { show: false },
  dataLabels: { enabled: false },
  responsive: [
    { breakpoint: 1366, options: { chart: { height: 350 } } },
    { breakpoint: 1024, options: { chart: { height: 300 } } },
  ],
  xaxis: {
    type: "category",
    categories: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: [
    {
      seriesName: "Jumlah Peserta",
      title: {
        text: "Peserta",
        style: { fontSize: "11px", color: "#3B82F6", fontWeight: 600 },
      },
      min: 0,
      labels: { style: { colors: "#3B82F6" } },
    },
    {
      seriesName: "PNBP",
      opposite: true,
      title: {
        text: "PNBP (Rp)",
        style: { fontSize: "11px", color: "#10B981", fontWeight: 600 },
      },
      min: 0,
      labels: {
        style: { colors: "#10B981" },
        formatter: (val: number) => {
          if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
          if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}Jt`;
          if (val >= 1_000) return `${(val / 1_000).toFixed(0)}Rb`;
          return `${val}`;
        },
      },
    },
  ],
  tooltip: {
    shared: true,
    intersect: false,
    y: [
      { formatter: (val: number) => `${val} orang` },
      {
        formatter: (val: number) =>
          new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val),
      },
    ],
  },
};

// ================== Component ==================
type Props = {
  data: PelatihanMasyarakat[];
  dataUser: UserPelatihan[];
  tahun: string;
  triwulan: string;
};

export default function ChartMasyarakatDilatihMonthly({ data, dataUser, tahun, triwulan }: Props) {
  const [pelatihan, setPelatihan] = useState<PelatihanMasyarakat[]>([]);
  const [userPelatihan, setUserPelatihan] = useState<UserPelatihan[]>([]);
  const [totalMasyarakat, setTotalMasyarakat] = useState(0);
  const [totalPNBP, setTotalPNBP] = useState(0);

  const isAdmin = Cookies.get("Role") === "Pengelola UPT";
  const namaBalai = Cookies.get("Satker");

  // ================== Fetching ==================
  useEffect(() => {
    let filteredPelatihan = [...data];
    let filteredUser = [...dataUser];

    if (isAdmin) {
      filteredPelatihan = filteredPelatihan.filter((p) => p.PenyelenggaraPelatihan === namaBalai);
      filteredUser = filteredUser.filter((u) => u.PenyelenggaraPelatihan === namaBalai);
    }

    const pnbpTotal = filteredPelatihan.reduce((sum, item) => {
      const price = Number(item.HargaPelatihan || 0);
      const signedParticipants =
        item.UserPelatihan?.filter((u) => u.FileSertifikat?.includes("signed")).length || 0;
      return sum + price * signedParticipants;
    }, 0);

    setPelatihan(filteredPelatihan);
    setUserPelatihan(filteredUser);
    setTotalMasyarakat(filteredUser.length);
    setTotalPNBP(pnbpTotal);
  }, [data, dataUser, isAdmin, namaBalai, tahun, triwulan]);


  // ================== Data Processing Helper ==================
  const getMonthFromAnyDate = (dateStr: string | undefined): string | null => {
    if (!dateStr) return null;
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      // Handle both YYYY-MM-DD and DD-MM-YYYY
      return (parts[0].length === 4 ? parts[1] : parts[1]).padStart(2, "0");
    }
    const d = parseIndonesianDate(dateStr);
    return d ? (d.getMonth() + 1).toString().padStart(2, "0") : null;
  };

  const parseIndonesianDate = (dateStr: string): Date | null => {
    const months: Record<string, number> = {
      januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
      juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
    };
    const parts = dateStr.toLowerCase().split(" ");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    const monthIndex = months[month];
    if (monthIndex === undefined) return null;
    return new Date(parseInt(year), monthIndex, parseInt(day));
  };


  // ================== Data Processing ==================
  const monthlyUser = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return userPelatihan.filter((u) => getMonthFromAnyDate(u.TanggalMulai) === month).length;
  });

  const monthlyPNBP = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return pelatihan
      .filter((p) => getMonthFromAnyDate(p.TanggalMulaiPelatihan!) === month)
      .reduce((sum, item) => {
        const price = Number(item.HargaPelatihan || 0);
        const signed =
          item.UserPelatihan?.filter((u) => u.FileSertifikat?.includes("signed")).length || 0;
        return sum + price * signed;
      }, 0);
  });

  // ================== Render ==================
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Stats */}
      <div className="flex flex-wrap gap-5 px-5 pt-2">
        <StatItem color="primary" label="Total Masyarakat Dilatih" value={`${totalMasyarakat} Orang`} />
        <StatItem
          color="emerald"
          label="Total PNBP"
          value={new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(totalPNBP)}
        />
      </div>

      {/* Chart */}
      <div id="chartOne" className="-ml-5 flex-1 min-h-[300px]">
        <ReactApexChart
          options={chartOptions}
          series={[
            { name: "Jumlah Peserta", data: monthlyUser, type: "bar" },
            { name: "PNBP", data: monthlyPNBP, type: "line" },
          ]}
          type="line"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}

// ================== Sub Components ==================
function StatItem({
  color,
  label,
  value,
}: {
  color: "primary" | "secondary" | "emerald";
  label: string;
  value: string;
}) {
  const colorMap: Record<string, { ring: string; bg: string }> = {
    primary: { ring: "ring-blue-500/20", bg: "bg-blue-500" },
    secondary: { ring: "ring-sky-500/20", bg: "bg-sky-500" },
    emerald: { ring: "ring-emerald-500/20", bg: "bg-emerald-500" },
  };
  const { ring, bg } = colorMap[color];

  return (
    <div className="flex items-center gap-3">
      {/* Icon Bullet */}
      <span className={`flex h-3 w-3 items-center justify-center rounded-full ${bg} ring-4 ${ring}`} />
      {/* Label + Value */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
          {label}
        </p>
        <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">{value}</p>
      </div>
    </div>
  );
}
