"use client";

import React, { useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { formatDateTime } from "@/utils";
import {
  getFilteredDataByBalai,
  getFilteredDataPelatihanByBalai,
} from "@/lib/training";
import { isSigned, isUnsigned } from "@/lib/sign";
import { PelatihanMasyarakat } from "@/types/product";
import { UserPelatihan } from "@/types/user";

// ========================================================
// Color Palette
// ========================================================
const barColors = [
  "#09105E",
  "#5335E9",
  "#41C8ED",
  "#00BFA6",
  "#2DC6FF",
  "#24388A",
  "#1B254B",
  "#111C44",
  "#0B1437",
];

// ========================================================
// Chart Configurations
// ========================================================
const chartConfigs = {
  jenisPelatihan: { visitors: { label: "Masyarakat Dilatih" } },
  gender: { visitors: { label: "Masyarakat Dilatih" } },
  sertifikat: { visitors: { label: "Masyarakat Dilatih" } },
  programPelatihan: { visitors: { label: "Masyarakat Dilatih" } },
  programPrioritas: { visitors: { label: "Masyarakat Dilatih" } },
};

// ========================================================
// Reusable Chart Card
// ========================================================
interface ChartCardProps {
  title: string;
  chartConfig: any;
  chartData: any[];
  barHeight?: number
  chartType?: "vertical" | "horizontal" | "pie"; // ✅ new prop
}

const TrainingChartCard: React.FC<ChartCardProps> = ({
  title,
  chartConfig,
  chartData,
  barHeight = 32,
  chartType: initialChartType = "horizontal", // default
}) => {
  const [chartType, setChartType] = useState<"vertical" | "horizontal" | "pie">(initialChartType);

  const chartHeight = Math.max(240, chartData.length * barHeight);

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="flex justify-between items-center pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto w-full">
          <ResponsiveContainer width="100%" height={chartHeight}>
            {chartType === "pie" ? (
              <PieChart>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="visitors"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart
                data={chartData}
                layout={chartType === "horizontal" ? "vertical" : "horizontal"}
                margin={{ top: 20, right: 0, left: chartType === "vertical" ? 0 : -18, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  type={chartType === "horizontal" ? "number" : "category"}
                  dataKey={chartType === "vertical" ? "name" : undefined}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type={chartType === "horizontal" ? "category" : "number"}
                  dataKey={chartType === "horizontal" ? "name" : undefined}
                  width={chartType === "horizontal" ? 150 : 0}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="visitors"
                  radius={[6, 6, 0, 0]}
                  label={{
                    position: chartType === "horizontal" ? "right" : "top",
                    fill: "#1B254B",
                    fontSize: 12,
                  }}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-1 text-sm items-center text-left">
        <div className="mt-4 flex gap-2 flex-wrap">
          {chartData.map((entry, index) => (
            <div key={entry.name} className="flex gap-2 items-center">
              <div
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor: barColors[index % barColors.length],
                }}
              ></div>
              <span className="text-sm">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};


// ========================================================
// Main Component
// ========================================================
interface ChartDetailMasyarakatDilatihProps {
  data: PelatihanMasyarakat[];
  dataUser: UserPelatihan[];
}

const ChartDetailMasyarakatDilatih: React.FC<
  ChartDetailMasyarakatDilatihProps
> = ({ data, dataUser }) => {
  const isAdminBalaiPelatihan = Cookies.get("Role") === "Pengelola UPT";
  const nameBalaiPelatihan = Cookies.get("Satker");

  const filteredDataByBalai = useMemo(
    () => getFilteredDataByBalai(dataUser, nameBalaiPelatihan!),
    [dataUser, nameBalaiPelatihan]
  );

  const filteredPelatihanByBalai = useMemo(
    () =>
      getFilteredDataPelatihanByBalai(
        data,
        isAdminBalaiPelatihan,
        nameBalaiPelatihan!
      ),
    [data, isAdminBalaiPelatihan, nameBalaiPelatihan]
  );

  const countWith = (cond: (item: any) => boolean) =>
    filteredDataByBalai.filter(cond).length;

  const chartData = useMemo(() => {
    const uniqueJenisPelatihan = [
      ...new Set(filteredPelatihanByBalai.map((i) => i.JenisPelatihan).filter(Boolean)),
    ];
    const byJenisPelatihan = uniqueJenisPelatihan.map((jenis) => ({
      name: jenis,
      visitors: filteredPelatihanByBalai
        .filter((item) => item.JenisPelatihan === jenis)
        .reduce((sum, item) => sum + (item.JumlahPeserta || 0), 0),
    })).filter((item) => item.visitors > 0);

    const uniquePenyelenggaraPelatihan = [
      ...new Set(filteredPelatihanByBalai.map((i) => i.PenyelenggaraPelatihan).filter(Boolean)),
    ];
    const byPenyelenggaraPelatihan = uniquePenyelenggaraPelatihan.map((penyelenggara) => ({
      name: penyelenggara,
      visitors: filteredPelatihanByBalai
        .filter((item) => item.PenyelenggaraPelatihan === penyelenggara)
        .reduce((sum, item) => sum + (item.JumlahPeserta || 0), 0),
    })).filter((item) => item.visitors > 0);

    const uniqueSektor = [
      ...new Set(filteredDataByBalai.map((i) => i.JenisProgram).filter(Boolean)),
    ];
    const bySektorPelatihan = uniqueSektor.map((program) => ({
      name: program,
      visitors: countWith((i) => i.JenisProgram === program && i.FileSertifikat.includes("signed")),
    })).filter((item) => item.visitors > 0);

    const uniqueProgram = [
      ...new Set(filteredDataByBalai.map((i) => i.Program).filter(Boolean)),
    ];
    const byProgramPelatihan = uniqueProgram.map((program) => ({
      name: program,
      visitors: countWith((i) => i.Program === program && i.FileSertifikat.includes("signed")),
    })).filter((item) => item.visitors > 0);


    const uniqueKlaster = [
      ...new Set(filteredDataByBalai.map((i) => i.BidangPelatihan).filter(Boolean)),
    ];
    const byKlasterPelatihan = uniqueKlaster.map((bidang) => ({
      name: bidang,
      visitors: countWith((i) => i.BidangPelatihan === bidang && i.FileSertifikat.includes("signed")),
    })).filter((item) => item.visitors > 0);

    const uniquePrioritas = [
      ...new Set(filteredDataByBalai.map((i) => i.DukunganProgramPrioritas).filter(Boolean)),
    ];
    const byProgramPrioritas = uniquePrioritas.map((kategori) => ({
      name: kategori,
      visitors: countWith(
        (i) => i.DukunganProgramPrioritas === kategori && i.FileSertifikat.includes("signed")
      ),
    })).filter((item) => item.visitors > 0);

    const byGender = [
      {
        name: "Laki - Laki",
        visitors: countWith(
          (i) => ["L", "Laki - Laki"].includes(i.JenisKelamin) && i.FileSertifikat.includes("signed")
        ),
      },
      {
        name: "Perempuan",
        visitors: countWith(
          (i) => ["P", "Perempuan"].includes(i.JenisKelamin) && i.FileSertifikat.includes("signed")
        ),
      },
    ];

    const bySertifikat = [
      {
        name: "Tidak Bersertifikat",
        visitors: countWith((i) => isUnsigned(i.FileSertifikat)),
      },
      {
        name: "Bersertifikat",
        visitors: countWith((i) => isSigned(i.FileSertifikat)),
      },
    ];

    return {
      byGender,
      byJenisPelatihan,
      bySektorPelatihan,
      byKlasterPelatihan,
      byProgramPrioritas,
      byProgramPelatihan,
      bySertifikat,
      byPenyelenggaraPelatihan
    };
  }, [filteredDataByBalai, filteredPelatihanByBalai]);

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-6 shadow-md sm:px-7 w-full overflow-x-hidden">
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h5 className="text-xl font-semibold text-black">Total Masyarakat Dilatih</h5>
          <p className="italic text-sm">{formatDateTime()}</p>
        </div>
      </div>

      <div className="flex h-full gap-4 flex-col">
        <div className="w-full grid grid-cols-2 gap-4 items-stretch">
          <TrainingChartCard
            title="Sektor Pelatihan"
            chartConfig={chartConfigs.programPelatihan}
            chartData={chartData.bySektorPelatihan}
            chartType="horizontal"
          />
          <TrainingChartCard
            title="Sumber Pembiayaan atau Pemenuhan IKU"
            chartConfig={chartConfigs.jenisPelatihan}
            chartData={chartData.byJenisPelatihan}
            chartType="horizontal"
          />
        </div>

        <div className="w-full min-h-180 flex gap-4">
          <TrainingChartCard
            title="Penyelenggara Pelatihan"
            chartConfig={chartConfigs.programPelatihan}
            chartData={chartData.byPenyelenggaraPelatihan}
            chartType="horizontal"
          />

          <TrainingChartCard
            title="Klaster atau Bidang Pelatihan"
            chartConfig={chartConfigs.programPelatihan}
            chartData={chartData.byKlasterPelatihan}
            chartType="horizontal"
          />
        </div>

        <TrainingChartCard
          title="Program Pelatihan"
          chartConfig={chartConfigs.programPelatihan}
          chartData={chartData.byProgramPelatihan}
          chartType="vertical"
        />

        <TrainingChartCard
          title="Dukungan Program Prioritas"
          chartConfig={chartConfigs.programPrioritas}
          chartData={chartData.byProgramPrioritas}
          chartType="vertical"
        />
      </div>
      {/* <TrainingChartCard
        title="Jenis Kelamin"
        chartConfig={chartConfigs.gender}
        chartData={chartData.byGender}
        chartType="pie"
      /> */}
    </div>
  );
};

export default ChartDetailMasyarakatDilatih;
