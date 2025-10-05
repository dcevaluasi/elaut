"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { UserPelatihan } from "@/types/user";
import { formatDateTime, getMonthFromDateString } from "@/utils";

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
    const fetchData = async () => {
      try {
        const { data: res } = await axios.get(`${elautBaseUrl}/lemdik/getPelatihanAdmin`, {
          headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
        });

        let pelatihanData: PelatihanMasyarakat[] = res.data.filter((p: PelatihanMasyarakat) => {
          const statusValid = ["7D", "11", "15"].includes(p?.StatusPenerbitan);

          let tahunValid = true;
          if (tahun && p?.TanggalMulaiPelatihan) {
            const dateObj = new Date(p.TanggalMulaiPelatihan);
            if (!isNaN(dateObj.getTime())) {
              tahunValid = dateObj.getFullYear().toString() === tahun;
            }
          }
          return statusValid && tahunValid;
        });

        let userData: UserPelatihan[] = dataUser.filter((u: UserPelatihan) => u.FileSertifikat?.includes('signed') && u?.TanggalMulai?.includes(tahun));

        if (isAdmin) {
          pelatihanData = pelatihanData.filter((p) => p.PenyelenggaraPelatihan === namaBalai);
          userData = userData.filter((u) => u.PenyelenggaraPelatihan === namaBalai);
        }

        setPelatihan(pelatihanData);
        setUserPelatihan(userData);
        setTotalMasyarakat(userData.length);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [dataUser, isAdmin, namaBalai, tahun, triwulan]);


  // ================== Data Processing ==================
  const monthlyPelatihan = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return pelatihan.filter((p) => getMonthFromDateString(p.TanggalMulaiPelatihan!) === month).length;
  });

  const monthlyUser = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");

    return userPelatihan.filter((u) => {
      if (!u.TanggalBerakhir) return false;

      const dateObj = new Date(u.TanggalBerakhir);
      if (isNaN(dateObj.getTime())) return false;

      const endMonth = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      return endMonth === month;
    }).length;
  });

  // ================== Render ==================
  return (
    <div className="col-span-12 xl:col-span-8 mb-4 rounded-xl border border-stroke bg-white shadow-default px-5 pt-7.5 pb-5 sm:px-7.5">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 sm:flex-nowrap">
        <div className="flex flex-col w-full gap-4">
          <div>
            <h5 className="text-xl font-semibold text-black">Tren Pelatihan dan Masyarakat Dilatih</h5>
            <p className="text-sm italic">{formatDateTime()}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-5">
            <StatItem color="primary" label="Total Pelatihan Selesai" value={`${pelatihan.length} Pelatihan`} />
            <StatItem color="secondary" label="Total Masyarakat Dilatih" value={`${totalMasyarakat} Orang`} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div id="chartOne" className="-ml-5">
        <ReactApexChart
          options={chartOptions}
          series={[
            { name: "Total Pelatihan", data: monthlyPelatihan },
            { name: "Total Masyarakat Dilatih", data: monthlyUser },
          ]}
          type="area"
          height={350}
          width="100%"
        />
      </div>
    </div>
  );
}

// ================== Sub Components ==================
function StatItem({ color, label, value }: { color: "primary" | "secondary"; label: string; value: string }) {
  const colorMap = {
    primary: "text-primary border-primary bg-primary",
    secondary: "text-secondary border-secondary bg-secondary",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Icon Bullet */}
      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${colorMap[color].split(" ")[1]}`}>
        <span className={`block h-2.5 w-2.5 rounded-full ${colorMap[color].split(" ")[2]}`} />
      </span>
      {/* Label + Value */}
      <div>
        <p className={`font-semibold ${colorMap[color].split(" ")[0]}`}>{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
