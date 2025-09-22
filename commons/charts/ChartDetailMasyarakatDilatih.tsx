"use client";

import React, { useState } from "react";
import { formatDateTime } from "@/utils";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
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
import { PelatihanMasyarakat } from "@/types/product";
import { UserPelatihan } from "@/types/user";

import Cookies from "js-cookie";
import { getFilteredDataByBalai, getFilteredDataPelatihanByBalai } from "@/lib/training";
import { isSigned, isUnsigned } from "@/lib/sign";
import TableDataPelatihanMasyrakatByGender from "@/components/dashboard/Tables/TableDataPelatihanMasyrakatByGender";
import TableDataPelatihanMasyarakatByWilker from "@/components/dashboard/Tables/TableDataPelatihanMasyarakatByWilker";
import TableDataPelatihanMasyarakatByProgramPrioritas from "@/components/dashboard/Tables/TableDataPelatihanMasyrakatByProgramPrioritas";
import TableDataPelatihanMasyarakatByProvinsi from "@/components/dashboard/Tables/TableDataPelatihanMasyarakatByProvinsi";
import TableDataPelatihanMasyarakat from "@/components/dashboard/Tables/TableDataPelatihanMasyarakat";
import TableDataPelatihanMasyarakatByPendidikan from "@/components/dashboard/Tables/TableDataPelatihanMasyrakatByPendidikan";

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
  firefox: {
    label: "Awak Kapal Perikanan",
    color: "#41C8ED",
  },
} satisfies ChartConfig;

const chartConfigProgramPrioritas = {
  visitors: {
    label: "Masyarakat Dilatih",
    color: "#1487af",
  },
  other4: {
    label: "Non Terobosan",
    color: "#073f51",
  },
  chrome: {
    label: "Konservasi",
    color: "#47bdda",
  },
  safari: {
    label: "PIT",
    color: "#97d7e2",
  },
  firefox: {
    label: "Kalaju/Kalamo",
    color: "#f7fdfb",
  },
  edge: {
    label: "KPB",
    color: "#1487af",
  },
  other: {
    label: "Budidaya",
    color: "#47bdda",
  },
  other2: {
    label: "Pengawasan Pesisir",
    color: "#073f51",
  },
  other3: {
    label: "BCL",
    color: "#97d7e2",
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
    color: "#073f51",
  },
} satisfies ChartConfig;

interface ChartThreeState {
  series: number[];
}

const ChartDetailMasyarakatDilatih: React.FC<{
  data: PelatihanMasyarakat[];
  dataUser: UserPelatihan[];
}> = ({ data, dataUser }) => {

  const isAdminBalaiPelatihan = Cookies.get('XSRF093') == 'balai'
  const nameBalaiPelatihan = Cookies.get('Satker')


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
    const filteredDataByBalai = getFilteredDataByBalai(dataUser, isAdminBalaiPelatihan, nameBalaiPelatihan!);
    const filteredDataPelatihanByBalai = getFilteredDataPelatihanByBalai(data, isAdminBalaiPelatihan, nameBalaiPelatihan!);

    // Data Masyarakat Dilatih by Gender
    const dataMasyarakatByGender = [
      filteredDataByBalai.filter(
        (item) =>
          (item.JenisKelamin === "Laki - Laki" || item.JenisKelamin === "L") &&
          item.FileSertifikat !== ""
      ).length,
      filteredDataByBalai.filter(
        (item) =>
          (item.JenisKelamin === "Perempuan" || item.JenisKelamin === "P") &&
          item.FileSertifikat !== ""
      ).length,
    ];
    setStateMasyarakatByGender({
      series: dataMasyarakatByGender,
    });

    // Data Masyarakat Dilatih by Program Pelatihan
    const bidangPelatihanList = [
      "Budidaya",
      "Penangkapan",
      "Kepelautan",
      "Pengolahan dan Pemasaran",
      "Mesin Perikanan",
      "Konservasi",
      "Wisata Bahari",
      "Manajemen Perikanan",
    ];
    const dataMasyarakatDilatihByBidangPelatihan = bidangPelatihanList.map(
      (bidang) =>
        filteredDataByBalai.filter(
          (item) => item.BidangPelatihan === bidang && item.FileSertifikat !== ""
        ).length
    );
    setStateMasyarakatDilatihByBidangPelatihan({
      series: dataMasyarakatDilatihByBidangPelatihan,
    });

    // Data Masyarakat Dilatih by Program Pelatihan
    const jenisProgramList = [
      "Perikanan",
      "Kelautan",
      "Awak Kapal Perikanan",
    ];
    const dataMasyarakatDilatihByProgramPelatihan = jenisProgramList.map(
      (program) =>
        filteredDataByBalai.filter(
          (item) =>
            item.JenisProgram === program &&
            item.FileSertifikat !== ""
        ).length
    );
    setStateMasyarakatDilatihByProgramPelatihan({
      series: dataMasyarakatDilatihByProgramPelatihan,
    });

    // Data Masyarakat Dilatih by Jenis Pelatihan
    const jenisPelatihanList = ["Aspirasi", "PNBP/BLU", "Reguler", "Satuan Pendidikan"];
    const dataMasyarakatDilatihByJenisPelatihan = jenisPelatihanList.map((jenis) =>
      filteredDataPelatihanByBalai
        .filter((item) => item.JenisPelatihan === jenis)
        .reduce((total, item) => total + (item.JumlahPeserta || 0), 0)
    );
    setStateMasyarakatDilatihByJenisPelatihan({
      series: dataMasyarakatDilatihByJenisPelatihan,
    });

    // Data Masyarakat Dilatih by Dukungan Program Prioritas
    const kategoriPrioritas = [
      "Non Terobosan",
      "Konservasi",
      "PIT",
      "Kalaju/Kalamo",
      "KPB",
      "Budidaya",
      "Pengawasan Pesisir",
      "BCL",
    ];
    const dataMasyarakatDilatihByProgramPrioritas = kategoriPrioritas.map((kategori) =>
      filteredDataByBalai.filter(
        (item) => item.FileSertifikat !== '' && item.DukunganProgramPrioritas === kategori
      ).length
    );
    setStateMasyarakatDilatihByProgramPrioritas({
      series: dataMasyarakatDilatihByProgramPrioritas,
    });

    // Data Masyarakat Dilatih by Sertifikat
    const dataMasyarakatBySertifikat = [
      filteredDataByBalai.filter((item: UserPelatihan) => isUnsigned(item.FileSertifikat)).length,
      filteredDataByBalai.filter((item: UserPelatihan) => isSigned(item.FileSertifikat)).length,
    ];

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
    {
      browser: "firefox",
      name: "Satuan Pendidikan",
      visitors: stateMasyarakatDilatihByJenisPelatihan.series[3],
      fill: "#1487af",
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
    {
      browser: "firefox",
      name: "Awak Kapal Perikanan",
      visitors: stateMasyarakatDilatihByProgramPelatihan.series[2],
      fill: "#47bdda",
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
    const barHeight = 40;
    const chartHeight = chartData.length * barHeight;

    return (
      <Card className="flex flex-col w-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto w-full max-w-md"

          >
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" axisLine={false} hide tickLine={false} />
              <YAxis dataKey="name" type="category" />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar
                style={{ height: chartHeight }}
                dataKey="visitors"
                fill="#EA8F02"
                radius={[0, 4, 4, 0]}
                label={{ position: 'right', fill: '#000', fontSize: 12 }}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-1 text-sm items-start flex text-start">
          <div className="mt-4 flex gap-2 flex-wrap items-start justify-start">
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

        <div className="grid grid-cols-2 gap-2 w-full">
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

        <TableDataPelatihanMasyarakat dataUserPelatihan={isAdminBalaiPelatihan ? dataUser.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : dataUser} />
        <TableDataPelatihanMasyarakatByProvinsi dataUserPelatihan={isAdminBalaiPelatihan ? dataUser.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : dataUser} />
        <TableDataPelatihanMasyarakatByProgramPrioritas dataPelatihan={isAdminBalaiPelatihan ? data.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : data} />
        <TableDataPelatihanMasyarakatByWilker dataUserPelatihan={isAdminBalaiPelatihan ? dataUser.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : dataUser} />
        <TableDataPelatihanMasyrakatByGender dataUserPelatihan={isAdminBalaiPelatihan ? dataUser.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : dataUser} />
        <TableDataPelatihanMasyarakatByPendidikan dataUserPelatihan={isAdminBalaiPelatihan ? dataUser.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : dataUser} />
      </div>
    );
  };

  return <TrainingDashboard />;
};

export default ChartDetailMasyarakatDilatih;
