"use client";

import { BlankoKeluar } from "@/types/blanko";
import { formatDateTime } from "@/utils";
import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CountUp from "react-countup";

import TableDataBlankoKeluarPublic from "../Pelatihan/TableDataBlankoKeluarPublic";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
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
import {
  BALAI_PELATIHAN,
  SATUAN_PENDIDIKAN_KEAHLIAN,
} from "@/constants/pelatihan";
import { PILIHAN_SUMMARY_KEAHLIAN_AKP } from "@/constants/akp";
export const description = "A bar chart with an active bar";

const chartConfigLemdiklat = {
  visitors: {
    label: "Sertifikat",
  },
  chrome: {
    label: "BPPP Tegal",
    color: "#211951",
  },
  safari: {
    label: "BPPP Medan",
    color: "#836FFF",
  },
  firefox: {
    label: "BPPP Banyuwangi",
    color: "#15F5BA",
  },
  edge: {
    label: "BPPP Bitung",
    color: "#EB8317",
  },
  other: {
    label: "BPPP Ambon",
    color: "#10375C",
  },
} satisfies ChartConfig;

const chartConfigUPTPendidikan = {
  visitors: {
    label: "Sertifikat",
  },
  politeknikAUP: {
    label: "Poltek AUP",
    color: "#211951",
  },
  politeknikKPSidoarjo: {
    label: "Poltek KP Sidoarjo",
    color: "#836FFF",
  },
  politeknikKPBitung: {
    label: "Poltek KP Bitung",
    color: "#15F5BA",
  },
  politeknikKPSorong: {
    label: "Poltek KP Sorong",
    color: "#EB8317",
  },
  politeknikKPKarawang: {
    label: "Poltek KP Karawang",
    color: "#10375C",
  },
  politeknikKPBone: {
    label: "Poltek KP Bone",
    color: "#2C9F80",
  },
  politeknikKPKupang: {
    label: "Poltek KP Kupang",
    color: "#FFA500",
  },
  politeknikKPDumai: {
    label: "Poltek KP Dumai",
    color: "#8A2BE2",
  },
  politeknikKPPangandaran: {
    label: "Poltek KP Pangandaran",
    color: "#5F9EA0",
  },
  politeknikKPJembrana: {
    label: "Poltek KP Jembrana",
    color: "#FF6347",
  },
} satisfies ChartConfig;

const chartConfig = {
  visitors: {
    label: "Sertifikat",
  },
  chrome: {
    label: "ANKAPIN I",
    color: "#2662D9",
  },
  safari: {
    label: "ATKAPIN I",
    color: "#2EB88A",
  },
  firefox: {
    label: "ANKAPIN II",
    color: "#e88c30",
  },
  edge: {
    label: "ATKAPIN II",
    color: "#AF57DB",
  },
  other: {
    label: "ANKAPIN III",
    color: "#E0366F",
  },
  other2: {
    label: "ATKAPIN III",
    color: "#60432F",
  },
  other3: {
    label: "Rating",
    color: "#274754",
  },
} satisfies ChartConfig;

const chartConfigPNBP = {
  visitors: {
    label: "Sertifikat",
  },
  chrome: {
    label: "ANKAPIN I",
    color: "#2662D9",
  },
  safari: {
    label: "ATKAPIN I",
    color: "#2EB88A",
  },
  firefox: {
    label: "ANKAPIN II",
    color: "#e88c30",
  },
  edge: {
    label: "ATKAPIN II",
    color: "#AF57DB",
  },
  other: {
    label: "ANKAPIN III",
    color: "#E0366F",
  },
  other2: {
    label: "ATKAPIN III",
    color: "#60432F",
  },
  other3: {
    label: "Rating",
    color: "#274754",
  },
} satisfies ChartConfig;

interface ChartThreeState {
  series: number[];
}

const options2: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
  },
  colors: [
    "#3C50E0", // blue
    "#6577F3", // light blue
    "#026bec", // blue
    "#991dce", // purple
    "#0FADCF", // cyan
    "#25ca46", // green
    "#12e7d2", // light cyan
    "#2D42FF", // blue
    "#4C5EFF", // light blue
    "#0033CC", // dark blue
    "#8A2BE2", // blue-violet
    "#4682B4", // steel blue
    "#5F9EA0", // cadet blue
    "#00CED1", // dark turquoise
    "#20B2AA", // light sea green
    "#3CB371", // medium sea green
    "#7FFFD4", // aquamarine
  ],

  labels: [
    "PUKAKP I (Aceh)",
    "PUKAKP II (Medan)",
    "PUKAKP III (Lampung)",
    "PUKAKP IV (Jakarta)",
    "PUKAKP V (Tegal)",
    "PUKAKP VI (Tegal)",
    "PUKAKP VII (Banyuwangi)",
    "PUKAKP VIII (Kupang)",
    "PUKAKP IX (Pontianak)",
    "PUKAKP X (Bitung)",
    "PUKAKP XI (Bitung)",
    "PUKAKP XII (Bone)",
    "PUKAKP XIII (Ambon)",
    "PUKAKP XIV (Ambon)",
    "PUKAKP XV (Sorong)",
    "PUKAKP XVI (Sorong)",
    "PUKAKP XVII (Dumai)",
  ],
  legend: {
    show: true,
    position: "bottom",
  },
  plotOptions: {
    pie: {
      donut: {
        size: "55%",
        background: "transparent",
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 570,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 300,
        },
      },
    },
  ],
};

const options1: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "pie",
  },
  colors: [
    "#3C50E0",
    "#6577F3",
    "#026bec",
    "#991dce",
    "#0FADCF",
    "#25ca46",
    "#12e7d2",
  ],
  labels: [
    "Ahli Nautika Kapal Penangkap Ikan Tingkat I",
    "Ahli Teknika Kapal Penangkap Ikan Tingkat I",
    "Ahli Nautika Kapal Penangkap Ikan Tingkat II",
    "Ahli Teknika Kapal Penangkap Ikan Tingkat II",
    "Ahli Nautika Kapal Penangkap Ikan Tingkat III",
    "Ahli Teknika Kapal Penangkap Ikan Tingkat III",
    "Rating Keahlian",
  ],
  legend: {
    show: true,
    position: "bottom",
  },

  plotOptions: {
    pie: {
      donut: {
        size: "55%",
        background: "transparent",
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 480,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 300,
        },
      },
    },
  ],
};

const ChartPopoverKeahlian: React.FC<{ data: BlankoKeluar[] }> = ({ data }) => {
  const [selectedLemdiklat, setSelectedLemdiklat] =
    React.useState<string>("BPPP Tegal");
  const [state, setState] = useState<ChartThreeState>({
    series: [],
  });

  const [statePNBP, setStatePNBP] = useState<ChartThreeState>({
    series: [],
  });

  const [
    stateAllKeahlianByJenisPendidikan,
    setStateAllKeahlianByJenisPendidikan,
  ] = useState<ChartThreeState>({
    series: [],
  });

  const [stateAllKeahlianByUPTPelatihan, setStateAllKeahlianByUPTPelatihan] =
    useState<ChartThreeState>({
      series: [],
    });

  const [stateAllKeahlianByUPTPendidikan, setStateAllKeahlianByUPTPendidikan] =
    useState<ChartThreeState>({
      series: [],
    });

  React.useEffect(() => {
    // Helper function to filter data based on selectedSummaryAKP
    const filterBySummaryAKP = (item: any, selectedSummaryAKP: any) => {
      const isBPPP = item.NamaPelaksana?.includes("BPPP");
      const isPoltek = item.NamaPelaksana?.includes("Poltek");
      if (selectedSummaryAKP === "All") return true;
      if (selectedSummaryAKP === "Balai Pelatihan KP") return isBPPP;
      if (selectedSummaryAKP === "Satuan Pendidikan KP") return isPoltek;
      return false;
    };

    // Array of program names
    const programNames = [
      "Ahli Nautika Kapal Penangkap Ikan Tingkat I",
      "Ahli Teknika Kapal Penangkap Ikan Tingkat I",
      "Ahli Nautika Kapal Penangkap Ikan Tingkat II",
      "Ahli Teknika Kapal Penangkap Ikan Tingkat II",
      "Ahli Nautika Kapal Penangkap Ikan Tingkat III",
      "Ahli Teknika Kapal Penangkap Ikan Tingkat III",
      "Rating Keahlian",
    ];

    // Generate series data dynamically
    const updatedStateAllKeahlianByJenisPendidikanSeries = programNames.map((programName) =>
      data
        .filter((item) => filterBySummaryAKP(item, selectedSummaryAKP)) // Apply summary filter first
        .filter((item) => item.NamaProgram === programName) // Then filter by program
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) // Sum up values
    );


    const updatedStateAllKeahlianByUPTPelatihan = [
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "BPPP Tegal" &&
            item.TipeBlanko == "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "BPPP Medan" &&
            item.TipeBlanko == "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "BPPP Banyuwangi" &&
            item.TipeBlanko == "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "BPPP Bitung" &&
            item.TipeBlanko == "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "BPPP Ambon" &&
            item.TipeBlanko == "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
    ];

    const updatedStateAllKeahlianByUPTPendidikan = [
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Poltek AUP" &&
            item.TipeBlanko === "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Poltek KP Sidoarjo" &&
            item.TipeBlanko === "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Poltek KP Bitung" &&
            item.TipeBlanko === "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Poltek KP Sorong" &&
            item.TipeBlanko === "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Poltek KP Karawang" &&
            item.TipeBlanko === "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Poltek KP Bone" &&
            item.TipeBlanko === "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Poltek KP Kupang" &&
            item.TipeBlanko === "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Poltek KP Dumai" &&
            item.TipeBlanko === "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Poltek KP Pangandaran" &&
            item.TipeBlanko === "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Poltek KP Jembrana" &&
            item.TipeBlanko === "Certificate of Competence (CoC)"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
    ];

    const programs = [
      "Ahli Nautika Kapal Penangkap Ikan Tingkat I",
      "Ahli Teknika Kapal Penangkap Ikan Tingkat I",
      "Ahli Nautika Kapal Penangkap Ikan Tingkat II",
      "Ahli Teknika Kapal Penangkap Ikan Tingkat II",
      "Ahli Nautika Kapal Penangkap Ikan Tingkat III",
      "Ahli Teknika Kapal Penangkap Ikan Tingkat III",
      "Rating Keahlian",
    ];

    const calculateSeries = (asalPendapatan: string) =>
      programs.map((program) =>
        data
          .filter(
            (item) =>
              item.NamaProgram === program &&
              item.AsalPendapatan === asalPendapatan &&
              item.NamaPelaksana === selectedLemdiklat
          )
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0)
      );

    const updatedSeries = calculateSeries("APBN");
    const updatedSeriesPNBP = calculateSeries("PNBP");

    setState({ series: updatedSeries });
    setStateAllKeahlianByJenisPendidikan({
      series: updatedStateAllKeahlianByJenisPendidikanSeries,
    });
    setStateAllKeahlianByUPTPendidikan({
      series: updatedStateAllKeahlianByUPTPendidikan,
    });
    setStateAllKeahlianByUPTPelatihan({
      series: updatedStateAllKeahlianByUPTPelatihan,
    });

    setStatePNBP({ series: updatedSeriesPNBP });
  }, [selectedLemdiklat, data,]);

  const totalSum = [
    {
      label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat I",
      color: "bg-primary",
      multiplier: 565000,
    },
    {
      label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat I",
      color: "bg-[#8FD0EF]",
      multiplier: 565000,
    },
    {
      label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat II",
      color: "bg-[#026bec]",
      multiplier: 540000,
    },
    {
      label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat II",
      color: "bg-[#991dce]",
      multiplier: 540000,
    },
    {
      label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat III",
      color: "bg-[#0FADCF]",
      multiplier: 693000,
    },
    {
      label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat III",
      color: "bg-[#25ca46]",
      multiplier: 693000,
    },
    {
      label: "Ujian Rating Keahlian",
      color: "bg-[#12e7d2]",
      multiplier: 2031000,
    },
  ].reduce(
    (acc, item) => {
      const totalBlanko = data
        .filter((d) => "Ujian " + d.NamaProgram === item.label)
        .reduce((total, d) => total + d.JumlahBlankoDisetujui, 0);

      const totalAmount = totalBlanko * item.multiplier;

      acc.totalAmount += totalAmount;
      acc.totalBlanko += totalBlanko;

      return acc;
    },
    { totalAmount: 0, totalBlanko: 0 }
  );

  // Log state to debug
  useEffect(() => {
    console.log("Chart state:", state);
  }, [state]);

  const chartData = [
    {
      browser: "chrome",
      visitors: stateAllKeahlianByJenisPendidikan.series[0],
      fill: "var(--color-chrome)",
    },
    {
      browser: "safari",
      visitors: stateAllKeahlianByJenisPendidikan.series[1],
      fill: "var(--color-safari)",
    },
    {
      browser: "firefox",
      visitors: stateAllKeahlianByJenisPendidikan.series[2],
      fill: "var(--color-firefox)",
    },
    {
      browser: "edge",
      visitors: stateAllKeahlianByJenisPendidikan.series[3],
      fill: "var(--color-edge)",
    },
    {
      browser: "other",
      visitors: stateAllKeahlianByJenisPendidikan.series[4],
      fill: "var(--color-other)",
    },
    {
      browser: "other2",
      visitors: stateAllKeahlianByJenisPendidikan.series[5],
      fill: "var(--color-other2)",
    },
    {
      browser: "other3",
      visitors: stateAllKeahlianByJenisPendidikan.series[6],
      fill: "var(--color-other3)",
    },
  ];

  const chartDataUPTPelatihan = [
    {
      browser: "chrome",
      visitors: stateAllKeahlianByUPTPelatihan.series[0],
      fill: "var(--color-chrome)",
    },
    {
      browser: "safari",
      visitors: stateAllKeahlianByUPTPelatihan.series[1],
      fill: "var(--color-safari)",
    },
    {
      browser: "firefox",
      visitors: stateAllKeahlianByUPTPelatihan.series[2],
      fill: "var(--color-firefox)",
    },
    {
      browser: "edge",
      visitors: stateAllKeahlianByUPTPelatihan.series[3],
      fill: "var(--color-edge)",
    },
    {
      browser: "other",
      visitors: stateAllKeahlianByUPTPelatihan.series[4],
      fill: "var(--color-other)",
    },
  ];

  const chartDataUPTPendidikan = [
    {
      browser: "politeknikAUP",
      visitors: stateAllKeahlianByUPTPendidikan.series[0],
      fill: "var(--color-politeknikAUP)",
    },
    {
      browser: "politeknikKPSidoarjo",
      visitors: stateAllKeahlianByUPTPendidikan.series[1],
      fill: "var(--color-politeknikKPSidoarjo)",
    },
    {
      browser: "politeknikKPBitung",
      visitors: stateAllKeahlianByUPTPendidikan.series[2],
      fill: "var(--color-politeknikKPBitung)",
    },
    {
      browser: "politeknikKPSorong",
      visitors: stateAllKeahlianByUPTPendidikan.series[3],
      fill: "var(--color-politeknikKPSorong)",
    },
    {
      browser: "politeknikKPKarawang",
      visitors: stateAllKeahlianByUPTPendidikan.series[4],
      fill: "var(--color-politeknikKPKarawang)",
    },
    {
      browser: "politeknikKPBone",
      visitors: stateAllKeahlianByUPTPendidikan.series[5],
      fill: "var(--color-politeknikKPBone)",
    },
    {
      browser: "politeknikKPKupang",
      visitors: stateAllKeahlianByUPTPendidikan.series[6],
      fill: "var(--color-politeknikKPKupang)",
    },
    {
      browser: "politeknikKPDumai",
      visitors: stateAllKeahlianByUPTPendidikan.series[7],
      fill: "var(--color-politeknikKPDumai)",
    },
    {
      browser: "politeknikKPPangandaran",
      visitors: stateAllKeahlianByUPTPendidikan.series[8],
      fill: "var(--color-politeknikKPPangandaran)",
    },
    {
      browser: "politeknikKPJembrana",
      visitors: stateAllKeahlianByUPTPendidikan.series[9],
      fill: "var(--color-politeknikKPJembrana)",
    },
  ];

  const [selectedSummaryAKP, setSelectedSummaryAKP] =
    React.useState<string>("All");

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-5 w-full">
      <div className="mb-3 justify-between gap-4 sm:flex w-full">
        <div>
          <h5 className="text-xl font-semibold text-black">
            Sertifikat Keahlian Awak Kapal Perikanan
          </h5>
          <p className="italic text-sm">{formatDateTime()}</p>
        </div>
      </div>

      <Tabs defaultValue={selectedSummaryAKP} className="w-full mb-3">
        <TabsList className="w-full mb-3 flex flex-wrap">
          <TabsTrigger
            onClick={() => setSelectedSummaryAKP("All")}
            value={"All"}
          >
            All
          </TabsTrigger>
          {PILIHAN_SUMMARY_KEAHLIAN_AKP.map((summaryAKP, index) => (
            <TabsTrigger
              key={index}
              onClick={() => {
                setSelectedSummaryAKP(summaryAKP.name);
                setSelectedLemdiklat("All");
              }}
              value={summaryAKP!.name}
            >
              {summaryAKP!.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedSummaryAKP}>
          <Tabs defaultValue={selectedLemdiklat} className="w-full mb-3">


            <TabsContent value={selectedLemdiklat}>
              <div className="flex gap-2 w-full">
                <Card className="w-[50%] h-full">
                  <CardHeader>
                    <div className="w-full flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <CardTitle>Berdasarkan Jenis Pendidikan</CardTitle>
                        <CardDescription>
                          27 May 2024 - Now 2025
                        </CardDescription>
                      </div>
                      <div className="flex bg-gray-100 text-sm text-black px-3 py-2 rounded-full">
                        Total Sertifikat :{" "}
                        {chartData
                          .reduce((sum, item) => sum + item.visitors, 0)
                          .toLocaleString("ID")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="browser"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) =>
                            chartConfig[value as keyof typeof chartConfig]
                              ?.label
                          }
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                          dataKey="visitors"
                          strokeWidth={2}
                          radius={8}
                          max={20000}
                          activeIndex={2}
                        >
                          <LabelList
                            position="inside"
                            offset={12}
                            className="fill-white text-white"
                            fontSize={12}
                            fill="#000"
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="leading-none text-muted-foreground">
                      Showing total certificate issued since 27 May 2024
                    </div>
                  </CardFooter>
                </Card>

                {selectedSummaryAKP == "Balai Pelatihan KP" ? (
                  <Card className="w-[50%] h-full">
                    <CardHeader>
                      <div className="w-full flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <CardTitle>Berdasarkan UPT Pelatihan</CardTitle>
                          <CardDescription>
                            27 May 2024 - Now 2025
                          </CardDescription>
                        </div>
                        <div className="flex bg-gray-100 text-sm text-black px-3 py-2 rounded-full">
                          Total Sertifikat :{" "}
                          {chartDataUPTPelatihan
                            .reduce((sum, item) => sum + item.visitors, 0)
                            .toLocaleString("ID")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={chartConfigLemdiklat}
                        className=""
                      >
                        <BarChart
                          accessibilityLayer
                          data={chartDataUPTPelatihan}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="browser"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) =>
                              chartConfigLemdiklat[
                                value as keyof typeof chartConfigLemdiklat
                              ]?.label
                            }
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar
                            dataKey="visitors"
                            strokeWidth={2}
                            radius={8}
                            activeIndex={2}
                          >
                            <LabelList
                              position="inside"
                              offset={12}
                              className="fill-white text-white"
                              fontSize={12}
                              fill="#000"
                            />
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                      <div className="leading-none text-muted-foreground">
                        Showing total certificate issued since 27 May 2024
                      </div>
                    </CardFooter>
                  </Card>
                ) : selectedSummaryAKP == "Satuan Pendidikan KP" ? (
                  <Card className="w-[50%] h-full">
                    <CardHeader>
                      <div className="w-full flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <CardTitle>Berdasarkan UPT Pendidikan</CardTitle>
                          <CardDescription>
                            27 May 2024 - Now 2025
                          </CardDescription>
                        </div>
                        <div className="flex bg-gray-100 text-sm text-black px-3 py-2 rounded-full">
                          Total Sertifikat :{" "}
                          {chartDataUPTPendidikan
                            .reduce((sum, item) => sum + item.visitors, 0)
                            .toLocaleString("ID")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={chartConfigUPTPendidikan}
                        className=""
                      >
                        <BarChart
                          accessibilityLayer
                          data={chartDataUPTPendidikan}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="browser"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) =>
                              chartConfigUPTPendidikan[
                                value as keyof typeof chartConfigUPTPendidikan
                              ]?.label
                            }
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar
                            dataKey="visitors"
                            strokeWidth={2}
                            radius={8}
                            activeIndex={2}
                          >
                            <LabelList
                              position="inside"
                              offset={12}
                              className="fill-white text-white"
                              fontSize={12}
                              fill="#000"
                            />
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                      <div className="leading-none text-muted-foreground">
                        Showing total certificate issued since 27 May 2024
                      </div>
                    </CardFooter>
                  </Card>
                ) : <></>}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 flex-col mt-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Total Perkiraan Penerimaan PNBP</CardTitle>
            <CardDescription>
              {" "}
              The unit prices used in this data were obtained from{" "}
              <span className="font-semibold">BPPP Tegal</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 flex flex-wrap items-center justify-center gap-y-3 mt-0 border-t border-t-gray-200">
              {[
                {
                  label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat I",
                  color: "bg-primary",
                  multiplier: 565000,
                },
                {
                  label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat I",
                  color: "bg-[#8FD0EF]",
                  multiplier: 565000,
                },
                {
                  label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat II",
                  color: "bg-[#026bec]",
                  multiplier: 540000,
                },
                {
                  label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat II",
                  color: "bg-[#991dce]",
                  multiplier: 540000,
                },
                {
                  label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat III",
                  color: "bg-[#0FADCF]",
                  multiplier: 693000,
                },
                {
                  label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat III",
                  color: "bg-[#25ca46]",
                  multiplier: 693000,
                },
                {
                  label: "Ujian Rating Keahlian",
                  color: "bg-[#12e7d2]",
                  multiplier: 2031000,
                },
              ].map((item, index) => (
                <div className="w-full px-8 " key={index}>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex gap-1 w-full items-center">
                      <span
                        className={`mr-2 block h-3 w-full max-w-3 rounded-full ${item.color}`}
                      ></span>
                      <p className="flex w-full justify-between text-sm font-medium text-black">
                        <span>
                          {item.label}{" "}
                          {item.label ==
                            "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat III" ||
                            item.label ==
                            "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat III"
                            ? "SKK 60 Mil"
                            : ""}{" "}
                          - Rp {item.multiplier.toLocaleString("id-ID")}
                        </span>
                      </p>
                    </div>

                    <span className="w-full flex items-end justify-end">
                      Rp.
                      {(
                        data
                          .filter(
                            (d) => "Ujian " + d.NamaProgram === item.label
                          )
                          .reduce(
                            (total, d) => total + d.JumlahBlankoDisetujui,
                            0
                          ) * item.multiplier
                      ).toLocaleString("id-ID")}{" "}
                      <span className="font-semibold text-xs ml-3">
                        (
                        {data
                          .filter(
                            (d) => "Ujian " + d.NamaProgram === item.label
                          )
                          .reduce(
                            (total, d) => total + d.JumlahBlankoDisetujui,
                            0
                          )
                          .toLocaleString("id-ID")}
                        Sertifikat )
                      </span>
                    </span>
                  </div>
                </div>
              ))}
              <div className="w-full flex justify-end items-center px-8">
                <div className="flex gap-1 items-end">
                  <h5 className="text-3xl font-bold text-black">
                    Rp{" "}
                    <CountUp
                      start={0}
                      duration={12.75}
                      end={totalSum.totalAmount}
                    />
                  </h5>
                  <span className="font-semibold text-xs ml-3">
                    ({totalSum.totalBlanko}
                    Sertifikat )
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total certificate issued since 27 May 2024
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="flex gap-2 flex-col mt-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Detail Data CoC</CardTitle>
            <CardDescription>
              {" "}
              The unit prices used in this data were obtained from{" "}
              <span className="font-semibold">BPPP Tegal</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableDataBlankoKeluarPublic />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total certificate issued since 27 May 2024
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ChartPopoverKeahlian;
