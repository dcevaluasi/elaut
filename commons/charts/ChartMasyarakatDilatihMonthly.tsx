"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { PelatihanMasyarakat } from "@/types/product";
import { UserPelatihan } from "@/types/user";
import { getMonthFromDateString } from "@/utils";

// ================== Chart Config ==================
const chartOptions: ApexOptions = {
  chart: {
    type: "area",
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
  colors: ["#3C50E0", "#80CAEE"],
  stroke: { width: 2, curve: "straight" },
  grid: {
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } },
  },
  markers: {
    size: 4,
    colors: "#fff",
    strokeColors: ["#3056D3", "#80CAEE"],
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
  yaxis: { title: { style: { fontSize: "0px" } } },
};

// ================== Component ==================
type Props = {
  data: PelatihanMasyarakat[];
  dataUser: UserPelatihan[];
  tahun: string;
  triwulan: string
};

export default function ChartMasyarakatDilatihMonthly({ data, dataUser, tahun, triwulan }: Props) {
  const [pelatihan, setPelatihan] = useState<PelatihanMasyarakat[]>([]);
  const [userPelatihan, setUserPelatihan] = useState<UserPelatihan[]>([]);
  const [totalMasyarakat, setTotalMasyarakat] = useState(0);

  const isAdmin = Cookies.get("Role") === "Pengelola UPT";
  const namaBalai = Cookies.get("Satker");

  // ================== Fetching ==================
  useEffect(() => {
    // We already receive filteredDataPelatihan and filteredDataDukung from SummaryPelatihan
    // which are correctly filtered by Year and Triwulan.
    // We only need to check UPT specific filtering and set the state.

    let filteredPelatihan = [...data];
    let filteredUser = [...dataUser];

    if (isAdmin) {
      filteredPelatihan = filteredPelatihan.filter((p) => p.PenyelenggaraPelatihan === namaBalai);
      filteredUser = filteredUser.filter((u) => u.PenyelenggaraPelatihan === namaBalai);
    }

    setPelatihan(filteredPelatihan);
    setUserPelatihan(filteredUser);
    setTotalMasyarakat(filteredUser.length);
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

  const getYearFromAnyDate = (dateStr: string | undefined): number | null => {
    if (!dateStr) return null;
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      return parts[0].length === 4 ? parseInt(parts[0]) : parseInt(parts[2]);
    }
    return parseIndonesianDate(dateStr)?.getFullYear() || null;
  };

  const parseIndonesianDate = (dateStr: string): Date | null => {
    const months: Record<string, number> = {
      januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
      juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
    };
    const parts = dateStr.toLowerCase().split(' ');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    const monthIndex = months[month];
    if (monthIndex === undefined) return null;
    return new Date(parseInt(year), monthIndex, parseInt(day));
  };


  // ================== Data Processing ==================
  const monthlyPelatihan = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return pelatihan.filter((p) => getMonthFromAnyDate(p.TanggalMulaiPelatihan!) === month).length;
  });

  const monthlyUser = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return userPelatihan.filter((u) => getMonthFromAnyDate(u.TanggalMulai) === month).length;
  });

  // ================== Render ==================
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Stats */}
      <div className="flex gap-5 px-5 pt-2">
        <StatItem color="primary" label="Total Pelatihan Selesai" value={`${pelatihan.length} Pelatihan`} />
        <StatItem color="secondary" label="Total Masyarakat Dilatih" value={`${totalMasyarakat} Orang`} />
      </div>

      {/* Chart */}
      <div id="chartOne" className="-ml-5 flex-1 min-h-[300px]">
        <ReactApexChart
          options={chartOptions}
          series={[
            { name: "Total Pelatihan", data: monthlyPelatihan },
            { name: "Total Masyarakat Dilatih", data: monthlyUser },
          ]}
          type="area"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}

// ================== Sub Components ==================
function StatItem({ color, label, value }: { color: "primary" | "secondary"; label: string; value: string }) {
  const isPrimary = color === "primary";
  const ringColor = isPrimary ? "ring-blue-500/20" : "ring-sky-500/20";
  const bgColor = isPrimary ? "bg-blue-500" : "bg-sky-500";
  const textColor = "text-slate-800 dark:text-white";
  const subTextColor = "text-slate-500 dark:text-slate-400";

  return (
    <div className="flex items-center gap-3">
      {/* Icon Bullet */}
      <span className={`flex h-3 w-3 items-center justify-center rounded-full ${bgColor} ring-4 ${ringColor}`} />
      {/* Label + Value */}
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider ${subTextColor} mb-0.5`}>{label}</p>
        <p className={`text-lg font-bold ${textColor} leading-none`}>{value}</p>
      </div>
    </div>
  );
}
