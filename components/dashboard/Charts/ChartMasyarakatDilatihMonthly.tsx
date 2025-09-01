"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { UserPelatihan } from "@/types/user";
import { formatDateTime, getMonthFromDateString } from "@/utils";

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
  grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: true } } },
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
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { title: { style: { fontSize: "0px" } } },
};

type Props = {
  data: PelatihanMasyarakat[];
  dataUser: UserPelatihan[];
};

export default function ChartMasyarakatDilatihMonthly({ data, dataUser }: Props) {
  const [dataPelatihan, setDataPelatihan] = useState<PelatihanMasyarakat[]>([]);
  const [dataUserPelatihan, setDataUserPelatihan] = useState<UserPelatihan[]>([]);
  const [totalMasyarakat, setTotalMasyarakat] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const isAdmin = Cookies.get("XSRF093") === "balai";
  const namaBalai = Cookies.get("SATKER_BPPP");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await axios.get(`${elautBaseUrl}/lemdik/getPelatihan`);
        const pelatihan = res.data;
        let userFiltered = dataUser.filter((u) => u.FileSertifikat !== "");
        let pelatihanFiltered = pelatihan;
        let userPelatihanFiltered = userFiltered;

        if (isAdmin && namaBalai) {
          userFiltered = userFiltered.filter((u) => u.PenyelenggaraPelatihan === namaBalai);
          pelatihanFiltered = pelatihan.filter((p: PelatihanMasyarakat) => p.PenyelenggaraPelatihan === namaBalai);
          userPelatihanFiltered = userFiltered;
        }

        setDataPelatihan(pelatihanFiltered);
        setDataUserPelatihan(userPelatihanFiltered);
        setTotalMasyarakat(userFiltered.length);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [dataUser, isAdmin, namaBalai]);

  const monthlyPelatihan = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return dataPelatihan.filter((p) => getMonthFromDateString(p.TanggalMulaiPelatihan!) === month).length;
  });

  const monthlyUser = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return dataUserPelatihan.filter((u) => getMonthFromDateString(u.CreteAt!) === month).length;
  });

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="col-span-12 xl:col-span-8 rounded-xl border border-stroke bg-white shadow-default mb-4 px-5 pt-7.5 pb-5 sm:px-7.5">
      <div className="flex flex-wrap justify-between gap-3 sm:flex-nowrap">
        {/* Title */}
        <div className="flex flex-col w-full gap-4">
          <div>
            <h5 className="text-xl font-semibold text-black">Total Masyarakat Dilatih</h5>
            <p className="italic text-sm">{formatDateTime()}</p>
          </div>
          {/* Stats */}
          <div className="flex gap-5">
            <StatItem color="primary" label="Total Pelatihan" value={`${dataPelatihan.length} Pelatihan`} />
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

function StatItem({ color, label, value }: { color: "primary" | "secondary"; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-4 w-4 items-center justify-center rounded-full border border-${color}`}>
        <span className={`block h-2.5 w-2.5 rounded-full bg-${color}`} />
      </span>
      <div>
        <p className={`font-semibold text-${color}`}>{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
