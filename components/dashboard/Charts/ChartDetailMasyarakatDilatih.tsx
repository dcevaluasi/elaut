"use client";

import React, { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BlankoKeluar } from "@/types/blanko";
import { formatDateTime } from "@/utils";

import CountUp from "react-countup";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  Label,
  Pie,
  PieChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import TableDataSertifikatKeterampilan from "../Pelatihan/TableDataSertifikatKeterampilan";
import { PelatihanMasyarakat } from "@/types/product";
import { TrendingUp } from "lucide-react";
import TableDataPelatihanSummary from "../Pelatihan/TableDataPelatihanSummary";
import { UserPelatihan } from "@/types/user";
import TableDataPelatihanMasyarakat from "../Tables/TableDataPelatihanMasyarakat";
import TableDataPelatihanMasyarakatByProvinsi from "../Tables/TableDataPelatihanMasyarakatByProvinsi";
import TableDataPelatihanMasyrakatByProgramPrioritas from "../Tables/TableDataPelatihanMasyrakatByProgramPrioritas";
import TableDataPelatihanMasyrakatByGender from "../Tables/TableDataPelatihanMasyrakatByGender";
import TableDataPelatihanMasyrakatByPendidikan from "../Tables/TableDataPelatihanMasyrakatByPendidikan";
import TableDataPelatihanMasyarakatByWilker from "../Tables/TableDataPelatihanMasyarakatByWilker";

export const description = "A bar chart with an active bar";

const chartConfigJenisPelatihan = {
  visitors: {
    label: "Masyarakat Dilatih",
  },
  chrome: {
    label: "Aspirasi",
    color: "#5335E9",
  },
  safari: {
    label: "PNBP/BLU",
    color: "#41C8ED",
  },
  firefox: {
    label: "Reguler",
    color: "#09105E",
  },
} satisfies ChartConfig;

const chartConfigGender = {
  visitors: {
    label: "Masyarakat Dilatih",
  },
  chrome: {
    label: "Laki - Laki",
    color: "#5335E9",
  },
  firefox: {
    label: "Perempuan",
    color: "#09105E",
  },
} satisfies ChartConfig;

const chartConfigSertifikat = {
  visitors: {
    label: "Masyarakat Dilatih",
  },
  chrome: {
    label: "Tidak Bersertifikat",
    color: "#5335E9",
  },
  firefox: {
    label: "Bersertifikat",
    color: "#41C8ED",
  },
} satisfies ChartConfig;

const chartConfigProgramPelatihan = {
  visitors: {
    label: "Masyarakat Dilatih",
  },
  chrome: {
    label: "Perikanan",
    color: "#211951",
  },
  safari: {
    label: "Kelautan",
    color: "#836FFF",
  },
} satisfies ChartConfig;

const chartConfigProgramPrioritas = {
  visitors: {
    label: "Masyarakat Dilatih",
    color: "#1487af", // Dark Blue (RGB: 20, 135, 175)
  },
  other4: {
    label: "Non Terobosan",
    color: "#073f51", // Deep Navy (RGB: 7, 63, 81)
  },
  chrome: {
    label: "Konservasi",
    color: "#47bdda", // Light Blue (RGB: 71, 189, 218)
  },
  safari: {
    label: "PIT",
    color: "#97d7e2", // Soft Blue (RGB: 151, 215, 226)
  },
  firefox: {
    label: "Kalaju/Kalamo",
    color: "#f7fdfb", // Off-White (RGB: 247, 253, 251)
  },
  edge: {
    label: "KPB",
    color: "#1487af", // Dark Blue (RGB: 20, 135, 175)
  },
  other: {
    label: "Budidaya",
    color: "#47bdda", // Light Blue (RGB: 71, 189, 218)
  },
  other2: {
    label: "Pengawasan Pesisir",
    color: "#073f51", // Deep Navy (RGB: 7, 63, 81)
  },
  other3: {
    label: "BCL",
    color: "#97d7e2", // Soft Blue (RGB: 151, 215, 226)
  },
} satisfies ChartConfig;

const chartConfigBidangPelatihan = {
  visitors: {
    label: "Penangkapan",
    color: "#1487af", // Dark Blue (RGB: 20, 135, 175)
  },
  other4: {
    label: "Kepelautan",
    color: "#073f51", // Deep Navy (RGB: 7, 63, 81)
  },
  chrome: {
    label: "Pengolahan dan Pemasaran",
    color: "#47bdda", // Light Blue (RGB: 71, 189, 218)
  },
  safari: {
    label: "Mesin Perikanan",
    color: "#97d7e2", // Soft Blue (RGB: 151, 215, 226)
  },
  firefox: {
    label: "Konservasi",
    color: "#f7fdfb", // Off-White (RGB: 247, 253, 251)
  },
  edge: {
    label: "Wisata Bahari",
    color: "#1487af", // Dark Blue (RGB: 20, 135, 175)
  },
  other: {
    label: "Manajemen Perikanan",
    color: "#47bdda", // Light Blue (RGB: 71, 189, 218)
  },
  other2: {
    label: "Budidaya",
    color: "#073f51", // Deep Navy (RGB: 7, 63, 81)
  },
} satisfies ChartConfig;

interface ChartThreeState {
  series: number[];
}

const ChartDetailMasyarakatDilatih: React.FC<{
  data: PelatihanMasyarakat[];
  dataUser: UserPelatihan[];
}> = ({ data, dataUser }) => {
  const [selectedLemdiklat, setSelectedLemdiklat] =
    React.useState<string>("All");

  const [
    stateMasyarakatDilatihByBidangPelatihan,
    setStateMasyarakatDilatihByBidangPelatihan,
  ] = useState<ChartThreeState>({
    series: [],
  });

  const [
    stateMasyarakatDilatihByJenisPelatihan,
    setStateMasyarakatDilatihByJenisPelatihan,
  ] = useState<ChartThreeState>({
    series: [],
  });

  const [
    stateMasyarakatDilatihByProgramPelatihan,
    setStateMasyarakatDilatihByProgramPelatihan,
  ] = useState<ChartThreeState>({
    series: [],
  });

  const [
    stateMasyarakatDilatihByProgramPrioritas,
    setStateMasyarakatDilatihByProgramPrioritas,
  ] = useState<ChartThreeState>({
    series: [],
  });

  const [stateMasyarakatByGender, setStateMasyarakatByGender] =
    useState<ChartThreeState>({
      series: [],
    });

  const [stateMasyarakatBySertifikat, setStateMasyarakatBySertifikat] =
    useState<ChartThreeState>({
      series: [],
    });

  React.useEffect(() => {
    const dataMasyarakatByGender = [
      dataUser.filter((item) => (item.JenisKelamin == "Laki - Laki" || item.JenisKelamin == 'L') && item.FileSertifikat != '').length,
      dataUser.filter((item) => (item.JenisKelamin == "Perempuan" || item.JenisKelamin == 'P') && item.FileSertifikat != '').length,
    ];

    const dataMasyarakatBySertifikat = [
      dataUser.filter((item) => item.NoSertifikat == "").length,
      dataUser.filter((item) => item.NoSertifikat != "").length,
    ];

    const dataMasyarakatDilatihByBidangPelatihan = [
      dataUser
        .filter((item) => item.BidangPelatihan === "Budidaya" && item.FileSertifikat != '')
        .length,
      dataUser
        .filter((item) => item.BidangPelatihan === "Penangkapan" && item.FileSertifikat != '')
        .length,
      dataUser
        .filter((item) => item.BidangPelatihan === "Kepelautan" && item.FileSertifikat != '')
        .length,
      dataUser
        .filter((item) => item.BidangPelatihan === "Pengolahan dan Pemasaran" && item.FileSertifikat != '')
        .length,
      dataUser
        .filter((item) => item.BidangPelatihan === "Mesin Perikanan" && item.FileSertifikat != '')
        .length,
      dataUser
        .filter((item) => item.BidangPelatihan === "Konservasi" && item.FileSertifikat != '')
        .length,
      dataUser
        .filter((item) => item.BidangPelatihan === "Wisata Bahari" && item.FileSertifikat != '')
        .length,
      dataUser
        .filter((item) => item.BidangPelatihan === "Manajemen Perikanan" && item.FileSertifikat != '')
        .length,
    ];

    const dataMasyarakatDilatihByJenisPelatihan = [
      data
        .filter((item) => item.JenisPelatihan === "Aspirasi")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
      data
        .filter((item) => item.JenisPelatihan === "PNBP/BLU")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
      data
        .filter((item) => item.JenisPelatihan === "Reguler")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
    ];

    const dataMasyarakatDilatihByProgramPelatihan = [
      data
        .filter((item) => item.JenisProgram === "Perikanan")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
      data
        .filter((item) => item.JenisProgram === "Kelautan")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
    ];

    const dataMasyarakatDilatihByProgramPrioritas = [
      data
        .filter((item) => item.DukunganProgramTerobosan === "Non Terobosan")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
      data
        .filter((item) => item.DukunganProgramTerobosan === "Konservasi")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
      data
        .filter((item) => item.DukunganProgramTerobosan === "PIT")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
      data
        .filter((item) => item.DukunganProgramTerobosan === "Kalaju/Kalamo")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
      data
        .filter((item) => item.DukunganProgramTerobosan === "KPB")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
      data
        .filter((item) => item.DukunganProgramTerobosan === "Budidaya")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
      data
        .filter(
          (item) => item.DukunganProgramTerobosan === "Pengawasan Pesisir"
        )
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
      data
        .filter((item) => item.DukunganProgramTerobosan === "BCL")
        .reduce((total, item) => total + item.JumlahPeserta!, 0),
    ];

    setStateMasyarakatDilatihByBidangPelatihan({
      series: dataMasyarakatDilatihByBidangPelatihan,
    });

    setStateMasyarakatDilatihByJenisPelatihan({
      series: dataMasyarakatDilatihByJenisPelatihan,
    });

    setStateMasyarakatDilatihByProgramPelatihan({
      series: dataMasyarakatDilatihByProgramPelatihan,
    });

    setStateMasyarakatDilatihByProgramPrioritas({
      series: dataMasyarakatDilatihByProgramPrioritas,
    });

    setStateMasyarakatByGender({
      series: dataMasyarakatByGender,
    });

    setStateMasyarakatBySertifikat({
      series: dataMasyarakatBySertifikat,
    });
  }, [selectedLemdiklat, data, dataUser]);

  const chartDataMasyarakatDilatihByBidangPelatihan = [
    {
      browser: "chrome",
      name: "Pengolahan dan Pemasaran",
      visitors: stateMasyarakatDilatihByBidangPelatihan.series[1],
      fill: "#1487af",
    },
    {
      browser: "safari",
      name: "Mesin Perikanan",
      visitors: stateMasyarakatDilatihByBidangPelatihan.series[2],
      fill: "#073f51",
    },
    {
      browser: "firefox",
      name: "Konservasi",
      visitors: stateMasyarakatDilatihByBidangPelatihan.series[3],
      fill: "#47bdda",
    },
    {
      browser: "edge",
      name: "Wisata Bahari",
      visitors: stateMasyarakatDilatihByBidangPelatihan.series[4],
      fill: "#97d7e2",
    },
    {
      browser: "other",
      name: "Manajemen Perikanan",
      visitors: stateMasyarakatDilatihByBidangPelatihan.series[5],
      fill: "#f7fdfb",
    },
    {
      browser: "other2",
      name: "Budidaya",
      visitors: stateMasyarakatDilatihByBidangPelatihan.series[6],
      fill: "#1487af",
    },
    {
      browser: "other3",
      name: "Penangkapan",
      visitors: stateMasyarakatDilatihByBidangPelatihan.series[7],
      fill: "#47bdda",
    },
    {
      browser: "other4",
      name: "Kepelautan",
      visitors: stateMasyarakatDilatihByBidangPelatihan.series[0],
      fill: "#073f51",
    },
  ];

  const chartDataMasyarakatByGender = [
    {
      browser: "chrome",
      name: "Laki - Laki",
      visitors: stateMasyarakatByGender.series[0],
      fill: "#5335E9",
    },
    {
      browser: "firefox",
      name: "Perempuan",
      visitors: stateMasyarakatByGender.series[1],
      fill: "#09105E",
    },
  ];

  const chartDataMasyarakatBySertifikat = [
    {
      browser: "chrome",
      name: "Tidak Bersertifikat",
      visitors: stateMasyarakatBySertifikat.series[0],
      fill: "#5335E9",
    },
    {
      browser: "firefox",
      name: "Bersertifikat",
      visitors: stateMasyarakatBySertifikat.series[1],
      fill: "#41C8ED",
    },
  ];

  const chartDataMasyarakatDilatihByJenisPelatihan = [
    {
      browser: "chrome",
      name: "Aspirasi",
      visitors: stateMasyarakatDilatihByJenisPelatihan.series[0],
      fill: "#5335E9",
    },
    {
      browser: "safari",
      name: "PNBP/BLU",
      visitors: stateMasyarakatDilatihByJenisPelatihan.series[1],
      fill: "#41C8ED",
    },
    {
      browser: "firefox",
      name: "Reguler",
      visitors: stateMasyarakatDilatihByJenisPelatihan.series[2],
      fill: "#09105E",
    },
  ];

  const chartDataMasyarakatDilatihByProgramPelatihan = [
    {
      browser: "chrome",
      name: "Perikanan",
      visitors: stateMasyarakatDilatihByProgramPelatihan.series[0],
      fill: "#211951",
    },
    {
      browser: "safari",
      name: "Kelautan",
      visitors: stateMasyarakatDilatihByProgramPelatihan.series[1],
      fill: "#836FFF",
    },
  ];

  const chartDataMasyarakatDilatihByProgramPrioritas = [
    {
      browser: "chrome",
      name: "Konservasi",
      visitors: stateMasyarakatDilatihByProgramPrioritas.series[1],
      fill: "#b5b8c4",
    },
    {
      browser: "safari",
      name: "PIT",
      visitors: stateMasyarakatDilatihByProgramPrioritas.series[2],
      fill: "#47bdda",
    },
    {
      browser: "firefox",
      name: "Kalaju/Kalamo",
      visitors: stateMasyarakatDilatihByProgramPrioritas.series[3],
      fill: "#5335E9",
    },
    {
      browser: "edge",
      name: "KPB",
      visitors: stateMasyarakatDilatihByProgramPrioritas.series[4],
      fill: "#09105E",
    },
    {
      browser: "other",
      name: "Budidaya",
      visitors: stateMasyarakatDilatihByProgramPrioritas.series[5],
      fill: "#47bdda",
    },
    {
      browser: "other2",
      name: "Pengawasan Pesisir",
      visitors: stateMasyarakatDilatihByProgramPrioritas.series[6],
      fill: "#073f51",
    },
    {
      browser: "other3",
      name: "BCL",
      visitors: stateMasyarakatDilatihByProgramPrioritas.series[7],
      fill: "#0092ff",
    },
    {
      browser: "other4",
      name: "Non Terobosan",
      visitors: stateMasyarakatDilatihByProgramPrioritas.series[0],
      fill: "#41C8ED",
    },
  ];

  const TrainingChartCard = ({
    title,
    chartConfig,
    chartData,
  }: {
    title: string;
    chartConfig: any;
    chartData: any;
  }) => {
    return (
      <Card className="flex flex-col w-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={60}
                strokeWidth={0}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-black text-3xl font-bold"
                          >
                            {chartData
                              .reduce(
                                (sum: any, item: any) => sum + item.visitors,
                                0
                              )
                              .toLocaleString("ID")}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-gray-400"
                          >
                            Masyarakat Dilatih
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-1 text-sm items-center flex text-center">
          <div className="flex items-center gap-2 font-medium leading-none">
            Updated last minute <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total visitors for the last 6 months
          </div>
          <div className="mt-4 flex gap-2 flex-wrap items-center justify-center">
            {chartData.map((entry: any) => (
              <div key={entry.name} className="flex gap-2 items-center">
                <div
                  className="w-4 h-4"
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <span className="text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>
    );
  };

  const TrainingDashboard = () => {
    return (
      <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-5 w-full">
        <div className="mb-3 justify-between gap-4 sm:flex w-full">
          <div>
            <h5 className="text-xl font-semibold text-black">
              Total Masyarakat Dilatih
            </h5>
            <p className="italic text-sm">{formatDateTime()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full">
          <TrainingChartCard
            title="Program Pelatihan"
            chartConfig={chartConfigProgramPelatihan}
            chartData={chartDataMasyarakatDilatihByProgramPelatihan}
          />
          <TrainingChartCard
            title="Bidang Pelatihan"
            chartConfig={chartConfigBidangPelatihan}
            chartData={chartDataMasyarakatDilatihByBidangPelatihan}
          />
          <TrainingChartCard
            title="Jenis Pelatihan"
            chartConfig={chartConfigJenisPelatihan}
            chartData={chartDataMasyarakatDilatihByJenisPelatihan}
          />
          <TrainingChartCard
            title="Jenis Kelamin"
            chartConfig={chartConfigGender}
            chartData={chartDataMasyarakatByGender}
          />
          <TrainingChartCard
            title="Program Prioritas"
            chartConfig={chartConfigProgramPrioritas}
            chartData={chartDataMasyarakatDilatihByProgramPrioritas}
          />
          <TrainingChartCard
            title="Lulus Pelatihan"
            chartConfig={chartConfigSertifikat}
            chartData={chartDataMasyarakatBySertifikat}
          />
        </div>

        <TableDataPelatihanMasyarakat dataUserPelatihan={dataUser} />
        <TableDataPelatihanMasyarakatByProvinsi dataPelatihan={data} />
        <TableDataPelatihanMasyrakatByProgramPrioritas dataPelatihan={data} />
        <TableDataPelatihanMasyarakatByWilker dataUserPelatihan={dataUser} />
        <TableDataPelatihanMasyrakatByGender dataUserPelatihan={dataUser} />
        <TableDataPelatihanMasyrakatByPendidikan dataUserPelatihan={dataUser} />
      </div>
    );
  };

  return <TrainingDashboard />;
};

export default ChartDetailMasyarakatDilatih;
