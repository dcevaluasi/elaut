"use client";

import React, { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlankoKeluar } from "@/types/blanko";
import { formatDateTime } from "@/utils";

import CountUp from "react-countup";

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
import TableDataSertifikatKeterampilan from "../Pelatihan/TableDataSertifikatKeterampilan";
import { BALAI_PELATIHAN, SATUAN_PENDIDIKAN } from "@/constants/pelatihan";
import { PELABUHAN_PERIKANAN, PILIHAN_SUMMARY_AKP } from "@/constants/akp";
import { MapProvider } from "@/components/MapProvider";
import { MapComponent } from "@/components/MapComponent";

export const description = "A bar chart with an active bar";

const chartConfig = {
  visitors: {
    label: "Sertifikat",
  },
  chrome: {
    label: "BSTF I",
    color: "#211951",
  },
  safari: {
    label: "BSTF II",
    color: "#836FFF",
  },
  firefox: {
    label: "SKN",
    color: "#15F5BA",
  },
  edge: {
    label: "SKPI",
    color: "#EB8317",
  },
} satisfies ChartConfig;

const chartConfigPNBP = {
  visitors: {
    label: "Sertifikat",
  },
  chrome: {
    label: "BSTF I",
    color: "#211951",
  },
  safari: {
    label: "BSTF II",
    color: "#836FFF",
  },
  firefox: {
    label: "SKN",
    color: "#15F5BA",
  },
  edge: {
    label: "SKPI",
    color: "#EB8317",
  },
  other: {
    label: "Rating Keahlian",
    color: "#10375C",
  },
  other2: {
    label: "Fisihing Master",
    color: "#1E0342",
  },
} satisfies ChartConfig;

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

const satuanPendidikanKPConfig = {
  visitors: {
    label: "Sertifikat",
  },
  chrome: {
    label: "Politeknik AUP Jakarta",
    color: "#211951",
  },
} satisfies ChartConfig;

const pelabuhanKPConfig = {
  visitors: {
    label: "Sertifikat",
  },
  bbpi: {
    label: "BBPI Semarang",
    color: "#211951",
  },
  ppsNizamZachmanJakarta: {
    label: "PPS Kepala PPS Nizam Zachman Jakarta ",
    color: "#211951",
  },
  ppsKendari: {
    label: "PPS Kendari",
    color: "#211951",
  },
  ppsCilacap: {
    label: "PPS Cilacap",
    color: "#211951",
  },
  ppsBungus: {
    label: "PPS Bungus",
    color: "#211951",
  },
  ppsBelawan: {
    label: "PPS Belawan",
    color: "#211951",
  },
  ppsBitung: {
    label: "PPS Bitung",
    color: "#211951",
  },
  ppnAmbon: {
    label: "PPN Ambon",
    color: "#211951",
  },
  ppnPelabuhanRatu: {
    label: "PPN Pelabuhan Ratu",
    color: "#211951",
  },
  ppnTernate: {
    label: "PPN Ternate",
    color: "#211951",
  },
  ppnPrigi: {
    label: "PPN Prigi",
    color: "#211951",
  },
  ppnPemangkat: {
    label: "PPN Pemangkat",
    color: "#211951",
  },
  ppnSibolga: {
    label: "PPN Sibolga",
    color: "#211951",
  },
  ppnTual: {
    label: "PPN Tual",
    color: "#211951",
  },
  ppnKejawanan: {
    label: "PPN Kejawanan",
    color: "#211951",
  },
  ppnPekalongan: {
    label: "PPN Pekalongan",
    color: "#211951",
  },
  ppnBrondong: {
    label: "PPN Brondong",
    color: "#211951",
  },
  ppnTanjungPandan: {
    label: "PPN Tanjung Pandan",
    color: "#211951",
  },
  ppnSungailiat: {
    label: "PPN Sungailiat",
    color: "#211951",
  },
  ppnPengambengan: {
    label: "PPN Pengambengan",
    color: "#211951",
  },
  ppnKarangantu: {
    label: "PPN Karangantu",
    color: "#211951",
  },
  ppnKwandang: {
    label: "PPN Kwandang",
    color: "#211951",
  },
  pppSebatik: {
    label: "PPP Sebatik",
    color: "#211951",
  },
  pppUntia: {
    label: "PPP Untia",
    color: "#211951",
  },
} satisfies ChartConfig;

interface ChartThreeState {
  series: number[];
}

const ChartPopoverKeterampilan: React.FC<{ data: BlankoKeluar[] }> = ({
  data,
}) => {
  const [selectedLemdiklat, setSelectedLemdiklat] =
    React.useState<string>("All");

  const [state, setState] = useState<ChartThreeState>({
    series: [],
  });

  const [statePNBP, setStatePNBP] = useState<ChartThreeState>({
    series: [],
  });

  const [stateAllKeterampilan, setStateAllKeterampilan] =
    useState<ChartThreeState>({
      series: [],
    });

  const [
    stateAllKeterampilanByLemdiklatek,
    setStateAllKeterampilanByLemdiklatek,
  ] = useState<ChartThreeState>({
    series: [],
  });

  const [
    stateAllKeterampilanByPelabuhan,
    setStateAllKeterampilanByPelabuhan,
  ] = useState<ChartThreeState>({
    series: [],
  });

  const [
    stateAllKeterampilanBySatuanPendidikanKP,
    setStateAllKeterampilanBySatuanPendidikanKP,
  ] = useState<ChartThreeState>({
    series: [],
  });

  React.useEffect(() => {
    const updatedSeries = [
      data
        .filter(
          (item) =>
            item.NamaProgram === "Basic Safety Training Fisheries I" &&
            item.AsalPendapatan == "APBN" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Basic Safety Training Fisheries II" &&
            item.AsalPendapatan == "APBN" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Sertifikat Kecakapan Nelayan" &&
            item.AsalPendapatan == "APBN" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Sertifikat Keterampilan Penanganan Ikan" &&
            item.AsalPendapatan == "APBN" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Rating Keahlian" &&
            item.AsalPendapatan == "APBN" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Fishing Master" &&
            item.AsalPendapatan == "APBN" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
    ];

    const updatedSeriesPNBP = [
      data
        .filter(
          (item) =>
            item.NamaProgram === "Basic Safety Training Fisheries I" &&
            item.AsalPendapatan == "PNBP" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Basic Safety Training Fisheries II" &&
            item.AsalPendapatan == "PNBP" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Sertifikat Kecakapan Nelayan" &&
            item.AsalPendapatan == "PNBP" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Sertifikat Keterampilan Penanganan Ikan" &&
            item.AsalPendapatan == "PNBP" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Rating Keahlian" &&
            item.AsalPendapatan == "PNBP" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Fishing Master" &&
            item.AsalPendapatan == "PNBP" &&
            item.NamaPelaksana == selectedLemdiklat
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
    ];

    const updatedAllKeterampilan = [
      data
        .filter(
          (item) => item.NamaProgram === "Basic Safety Training Fisheries I"
        )
        .filter((item) => {
          if (selectedSummaryAKP === "Satuan Pendidikan KP") {
            return item.NamaPelaksana.includes("Politeknik");
          } else {
            return item.NamaPelaksana.includes("BPPP");
          }
        }).filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),

      data
        .filter(
          (item) => item.NamaProgram === "Basic Safety Training Fisheries II"
        )
        .filter((item) => {
          if (selectedSummaryAKP === "Satuan Pendidikan KP") {
            return item.NamaPelaksana.includes("Politeknik");
          } else {
            return item.NamaPelaksana.includes("BPPP");
          }
        }).filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),

      data
        .filter((item) => item.NamaProgram === "Sertifikat Kecakapan Nelayan")
        .filter((item) => {
          if (selectedSummaryAKP === "Satuan Pendidikan KP") {
            return item.NamaPelaksana.includes("Politeknik");
          } else {
            return item.NamaPelaksana.includes("BPPP");
          }
        }).filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),

      data
        .filter(
          (item) =>
            item.NamaProgram === "Sertifikat Keterampilan Penanganan Ikan"
        )
        .filter((item) => {
          if (selectedSummaryAKP === "Satuan Pendidikan KP") {
            return item.NamaPelaksana.includes("Politeknik");
          } else {
            return item.NamaPelaksana.includes("BPPP");
          }
        }).filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),



    ];

    const updatedAllKeterampilanByLemdiklatek = [
      data
        .filter((item) => item.NamaPelaksana === "BPPP Tegal")
        .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter((item) => item.NamaPelaksana === "BPPP Medan")
        .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter((item) => item.NamaPelaksana === "BPPP Banyuwangi")
        .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter((item) => item.NamaPelaksana === "BPPP Bitung")
        .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter((item) => item.NamaPelaksana === "BPPP Ambon")
        .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
    ];

    const updatedAllKeterampilanByPelabuhan = [
      pelabuhanKPConfig.bbpi ?
        data
          .filter((item) => item.NamaPelaksana === "BBPI Semarang")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppsNizamZachmanJakarta ?
        data
          .filter((item) => item.NamaPelaksana === "PPS Kepala PPS Nizam Zachman Jakarta")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppsKendari ?
        data
          .filter((item) => item.NamaPelaksana === "PPS Kendari")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppsCilacap ?
        data
          .filter((item) => item.NamaPelaksana === "PPS Cilacap")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppsBungus ?
        data
          .filter((item) => item.NamaPelaksana === "PPS Bungus")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppsBelawan ?
        data
          .filter((item) => item.NamaPelaksana === "PPS Belawan")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppsBitung ?
        data
          .filter((item) => item.NamaPelaksana === "PPS Bitung")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnAmbon ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Ambon")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnPelabuhanRatu ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Pelabuhan Ratu")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnTernate ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Ternate")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnPrigi ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Prigi")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnPemangkat ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Pemangkat")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnSibolga ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Sibolga")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnTual ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Tual")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnKejawanan ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Kejawanan")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnPekalongan ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Pekalongan")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnBrondong ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Brondong")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnTanjungPandan ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Tanjung Pandan")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnSungailiat ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Sungailiat")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnPengambengan ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Pengambengan")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnKarangantu ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Karangantu")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.ppnKwandang ?
        data
          .filter((item) => item.NamaPelaksana === "PPN Kwandang")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.pppSebatik ?
        data
          .filter((item) => item.NamaPelaksana === "PPP Sebatik")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,

      pelabuhanKPConfig.pppUntia ?
        data
          .filter((item) => item.NamaPelaksana === "PPP Untia")
          .filter((item) => item.TipeBlanko === "Certificate of Proficiency (CoP)")
          .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0) : 0,
    ];


    const updatedAllKeterampilanBySatuanPendidikanKP = [
      data
        .filter((item) => item.NamaPelaksana === "Politeknik AUP Jakarta")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
    ];

    setState({ series: updatedSeries });
    setStateAllKeterampilan({ series: updatedAllKeterampilan });
    setStateAllKeterampilanByLemdiklatek({
      series: updatedAllKeterampilanByLemdiklatek,
    });
    setStateAllKeterampilanBySatuanPendidikanKP({
      series: updatedAllKeterampilanBySatuanPendidikanKP,
    });
    setStatePNBP({ series: updatedSeriesPNBP });
  }, [selectedLemdiklat, data]);


  const totalSum = [
    {
      label: "Basic Safety Training Fisheries I",
      color: "bg-primary",
      multiplier: selectedLemdiklat != "BPPP Tegal" ? 1350000 : 1050000,
    },
    {
      label: "Basic Safety Training Fisheries II",
      color: "bg-[#8FD0EF]",
      multiplier: selectedLemdiklat != "BPPP Tegal" ? 600000 : 620000,
    },
    {
      label: "Rating Keahlian",
      color: "bg-[#E0366F]",
      multiplier: selectedLemdiklat != "BPPP Tegal" ? 1350000 : 2050000,
    },
  ].reduce(
    (acc, item) => {
      const totalBlanko = data
        .filter(
          (d) =>
            d.NamaProgram === item.label &&
            d.NamaPelaksana == selectedLemdiklat &&
            d.AsalPendapatan == "PNBP"
        )
        .reduce((total, d) => total + d.JumlahBlankoDisetujui, 0);

      const totalAmount = totalBlanko * item.multiplier;

      acc.totalAmount += totalAmount;
      acc.totalBlanko += totalBlanko;

      return acc;
    },
    { totalAmount: 0, totalBlanko: 0 }
  );

  const chartData = [
    {
      browser: "chrome",
      visitors: state.series[0],
      fill: "var(--color-chrome)",
    },
    {
      browser: "safari",
      visitors: state.series[1],
      fill: "var(--color-safari)",
    },
    {
      browser: "firefox",
      visitors: state.series[2],
      fill: "var(--color-firefox)",
    },
    { browser: "edge", visitors: state.series[3], fill: "var(--color-edge)" },

  ];

  const chartDataAllKeterampilan = [
    {
      browser: "chrome",
      visitors: stateAllKeterampilan.series[0],
      fill: "var(--color-chrome)",
    },
    {
      browser: "safari",
      visitors: stateAllKeterampilan.series[1],
      fill: "var(--color-safari)",
    },
    {
      browser: "firefox",
      visitors: stateAllKeterampilan.series[2],
      fill: "var(--color-firefox)",
    },
    {
      browser: "edge",
      visitors: stateAllKeterampilan.series[3],
      fill: "var(--color-edge)",
    },
  ];

  const chartDataPNBP = [
    {
      browser: "chrome",
      visitors: statePNBP.series[0],
      fill: "var(--color-chrome)",
    },
    {
      browser: "safari",
      visitors: statePNBP.series[1],
      fill: "var(--color-safari)",
    },
    {
      browser: "firefox",
      visitors: statePNBP.series[2],
      fill: "var(--color-firefox)",
    },
    {
      browser: "edge",
      visitors: statePNBP.series[3],
      fill: "var(--color-edge)",
    },

  ];

  const chartDataSatuanPendidikanKP = [
    {
      browser: "chrome",
      visitors: stateAllKeterampilanBySatuanPendidikanKP.series[0],
      fill: "var(--color-chrome)",
    },
  ];



  const chartDataLemdiklat = [
    {
      browser: "chrome",
      visitors: stateAllKeterampilanByLemdiklatek.series[0],
      fill: "var(--color-chrome)",
    },
    {
      browser: "safari",
      visitors: stateAllKeterampilanByLemdiklatek.series[1],
      fill: "var(--color-safari)",
    },
    {
      browser: "firefox",
      visitors: stateAllKeterampilanByLemdiklatek.series[2],
      fill: "var(--color-firefox)",
    },
    {
      browser: "edge",
      visitors: stateAllKeterampilanByLemdiklatek.series[3],
      fill: "var(--color-edge)",
    },
    {
      browser: "other",
      visitors: stateAllKeterampilanByLemdiklatek.series[4],
      fill: "var(--color-other)",
    },
  ];

  const chartDataPelabuhanKP = [
    {
      browser: "Sertifikat",
      visitors: stateAllKeterampilanByLemdiklatek.series[0],
      fill: "var(--color-sertifikat)",
    },
    {
      browser: "BBPI Semarang",
      visitors: stateAllKeterampilanByLemdiklatek.series[1],
      fill: "#211951", // Corresponding color for BBPI Semarang
    },
    {
      browser: "PPS Kepala PPS Nizam Zachman Jakarta",
      visitors: stateAllKeterampilanByLemdiklatek.series[2],
      fill: "#211951",
    },
    {
      browser: "PPS Kendari",
      visitors: stateAllKeterampilanByLemdiklatek.series[3],
      fill: "#211951",
    },
    {
      browser: "PPS Cilacap",
      visitors: stateAllKeterampilanByLemdiklatek.series[4],
      fill: "#211951",
    },
    {
      browser: "PPS Bungus",
      visitors: stateAllKeterampilanByLemdiklatek.series[5],
      fill: "#211951",
    },
    {
      browser: "PPS Belawan",
      visitors: stateAllKeterampilanByLemdiklatek.series[6],
      fill: "#211951",
    },
    {
      browser: "PPS Bitung",
      visitors: stateAllKeterampilanByLemdiklatek.series[7],
      fill: "#211951",
    },
    {
      browser: "PPN Ambon",
      visitors: stateAllKeterampilanByLemdiklatek.series[8],
      fill: "#211951",
    },
    {
      browser: "PPN Pelabuhan Ratu",
      visitors: stateAllKeterampilanByLemdiklatek.series[9],
      fill: "#211951",
    },
    {
      browser: "PPN Ternate",
      visitors: stateAllKeterampilanByLemdiklatek.series[10],
      fill: "#211951",
    },
    {
      browser: "PPN Prigi",
      visitors: stateAllKeterampilanByLemdiklatek.series[11],
      fill: "#211951",
    },
    {
      browser: "PPN Pemangkat",
      visitors: stateAllKeterampilanByLemdiklatek.series[12],
      fill: "#211951",
    },
    {
      browser: "PPN Sibolga",
      visitors: stateAllKeterampilanByLemdiklatek.series[13],
      fill: "#211951",
    },
    {
      browser: "PPN Tual",
      visitors: stateAllKeterampilanByLemdiklatek.series[14],
      fill: "#211951",
    },
    {
      browser: "PPN Kejawanan",
      visitors: stateAllKeterampilanByLemdiklatek.series[15],
      fill: "#211951",
    },
    {
      browser: "PPN Pekalongan",
      visitors: stateAllKeterampilanByLemdiklatek.series[16],
      fill: "#211951",
    },
    {
      browser: "PPN Brondong",
      visitors: stateAllKeterampilanByLemdiklatek.series[17],
      fill: "#211951",
    },
    {
      browser: "PPN Tanjung Pandan",
      visitors: stateAllKeterampilanByLemdiklatek.series[18],
      fill: "#211951",
    },
    {
      browser: "PPN Sungailiat",
      visitors: stateAllKeterampilanByLemdiklatek.series[19],
      fill: "#211951",
    },
    {
      browser: "PPN Pengambengan",
      visitors: stateAllKeterampilanByLemdiklatek.series[20],
      fill: "#211951",
    },
    {
      browser: "PPN Karangantu",
      visitors: stateAllKeterampilanByLemdiklatek.series[21],
      fill: "#211951",
    },
    {
      browser: "PPN Kwandang",
      visitors: stateAllKeterampilanByLemdiklatek.series[22],
      fill: "#211951",
    },
    {
      browser: "PPP Sebatik",
      visitors: stateAllKeterampilanByLemdiklatek.series[23],
      fill: "#211951",
    },
    {
      browser: "PPP Untia",
      visitors: stateAllKeterampilanByLemdiklatek.series[24],
      fill: "#211951",
    },
  ];


  const [selectedSummaryAKP, setSelectedSummaryAKP] =
    React.useState<string>("All");

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-5 w-full">
      <div className="mb-3 justify-between gap-4 sm:flex w-full">
        <div>
          <h5 className="text-xl font-semibold text-black">
            Keterampilan Awak Kapal Perikanan
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
          {PILIHAN_SUMMARY_AKP.map((summaryAKP, index) => (
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
            {selectedSummaryAKP == "Balai Pelatihan KP" ? (
              <TabsList className="w-full mb-3 flex flex-wrap">
                <TabsTrigger
                  onClick={() => setSelectedLemdiklat("All")}
                  value={"All"}
                >
                  All
                </TabsTrigger>
                {BALAI_PELATIHAN.map((balaiPelatihan, index) => (
                  <TabsTrigger
                    onClick={() => setSelectedLemdiklat(balaiPelatihan.Name)}
                    value={balaiPelatihan!.Name}
                    key={index}
                  >
                    {balaiPelatihan!.Name}
                  </TabsTrigger>
                ))}
              </TabsList>
            ) : selectedSummaryAKP == "Satuan Pendidikan KP" ? (
              <TabsList className="w-full mb-3 flex flex-wrap">
                <TabsTrigger
                  onClick={() => setSelectedLemdiklat("All")}
                  value={"All"}
                >
                  All
                </TabsTrigger>
                {SATUAN_PENDIDIKAN.map((satuanPendidikan, index) => (
                  <TabsTrigger
                    onClick={() => setSelectedLemdiklat(satuanPendidikan.Name)}
                    value={satuanPendidikan!.Name}
                    key={index}
                  >
                    {satuanPendidikan!.Name}
                  </TabsTrigger>
                ))}
              </TabsList>
            ) : selectedSummaryAKP == "Pelabuhan Perikanan" ? (
              <TabsList className="w-full mb-3 flex flex-wrap h-full">
                <TabsTrigger
                  onClick={() => setSelectedLemdiklat("All")}
                  value={"All"}
                >
                  All
                </TabsTrigger>
                {PELABUHAN_PERIKANAN.map((pelabuhanPerikanan, index) => (
                  <TabsTrigger
                    onClick={() =>
                      setSelectedLemdiklat(pelabuhanPerikanan.Name)
                    }
                    value={pelabuhanPerikanan!.Name}
                  >
                    {pelabuhanPerikanan!.Name}
                  </TabsTrigger>
                ))}
              </TabsList>
            ) : (
              <></>
            )}

            <TabsContent value={selectedLemdiklat}>
              {selectedLemdiklat == "All" ? (
                <div className="flex gap-2 w-full h-full">
                  <div className="w-full ">
                    <Card className="">
                      <CardHeader>
                        <div className="w-full flex justify-between items-center">
                          <div className="flex flex-col gap-1">
                            <CardTitle>BERDASARKAN {selectedSummaryAKP == 'Balai Pelatihan' ? 'LEMBAGA PELATIHAN' : selectedSummaryAKP == 'Satuan Pendidikan KP' ? 'LEMBAGA PENDIDIKAN' : 'PELABUHAN PERIKANAN'}</CardTitle>
                            <CardDescription>
                              27 May 2024 - Now 2025
                            </CardDescription>
                          </div>
                          <div className="flex bg-gray-100 text-sm text-black px-3 py-2 rounded-full">
                            Total Sertifikat :{" "}
                            {selectedSummaryAKP == "Balai Pelatihan KP"
                              ? chartDataLemdiklat
                                .reduce((sum, item) => sum + item.visitors, 0)
                                .toLocaleString("ID")
                              : selectedSummaryAKP == "Satuan Pendidikan KP" ? chartDataSatuanPendidikanKP
                                .reduce((sum, item) => sum + item.visitors, 0)
                                .toLocaleString("ID") : chartDataPelabuhanKP
                                  .reduce((sum, item) => sum + item.visitors, 0)
                                  .toLocaleString("ID")}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={
                            selectedSummaryAKP == "Balai Pelatihan KP"
                              ? chartConfigLemdiklat
                              : satuanPendidikanKPConfig
                          }
                        >
                          <BarChart
                            accessibilityLayer
                            height={100}
                            data={
                              selectedSummaryAKP == "Balai Pelatihan KP"
                                ? chartDataLemdiklat
                                : chartDataSatuanPendidikanKP
                            }
                          >
                            <CartesianGrid vertical={false} />

                            <XAxis
                              dataKey="browser"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tickFormatter={(value) =>
                                selectedSummaryAKP == "Balai Pelatihan KP"
                                  ? chartConfigLemdiklat[
                                    value as keyof typeof chartConfigLemdiklat
                                  ]?.label
                                  : satuanPendidikanKPConfig[
                                    value as keyof typeof satuanPendidikanKPConfig
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
                              type="natural"
                              height={10}
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
                  </div>
                  <div className="w-full">
                    <Card className="">
                      <CardHeader>
                        <div className="w-full flex justify-between items-center">
                          <div className="flex flex-col gap-1">
                            <CardTitle>BERDASARKAN JENIS PROGRAM</CardTitle>
                            <CardDescription>
                              27 May 2024 - Now 2025
                            </CardDescription>
                          </div>
                          <div className="flex bg-gray-100 text-sm text-black px-3 py-2 rounded-full">
                            Total Sertifikat :{" "}
                            {chartDataAllKeterampilan
                              .reduce((sum, item) => sum + item.visitors, 0)
                              .toLocaleString("ID")}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig}>
                          <BarChart
                            accessibilityLayer
                            data={chartDataAllKeterampilan}
                          >
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
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 w-full">
                    <Card className="w-full h-full">
                      <CardHeader>
                        <div className="w-full flex justify-between items-center">
                          <div className="flex flex-col gap-1">
                            <CardTitle>DIKLAT dan BIMTEK NON-PNBP</CardTitle>
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

                    <Card className="w-full h-full">
                      <CardHeader>
                        <div className="w-full flex justify-between items-center">
                          <div className="flex flex-col gap-1">
                            <CardTitle>DIKLAT dan BIMTEK PNBP</CardTitle>
                            <CardDescription>
                              27 May 2024 - Now 2025
                            </CardDescription>
                          </div>
                          <div className="flex bg-gray-100 text-sm text-black px-3 py-2 rounded-full">
                            Total Sertifikat :{" "}
                            {chartDataPNBP
                              .reduce((sum, item) => sum + item.visitors, 0)
                              .toLocaleString("ID")}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfigPNBP} className="">
                          <BarChart accessibilityLayer data={chartDataPNBP}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="browser"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tickFormatter={(value) =>
                                chartConfigPNBP[
                                  value as keyof typeof chartConfigPNBP
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
                  </div>
                  {selectedSummaryAKP == "Pelabuhan Perikanan" ? (
                    <></>
                  ) : selectedSummaryAKP == "DJPT" ? (
                    <></>
                  ) : selectedSummaryAKP == "Balai Pelatihan KP" ? (
                    <div className="flex gap-2 flex-col mt-10">
                      <Card className="w-full">
                        <CardHeader>
                          <CardTitle>Total Perkiraan Penerimaan PNBP</CardTitle>
                          <CardDescription>
                            {" "}
                            The unit prices used in this data were obtained from{" "}
                            <span className="font-semibold">PP Tarif 85</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-8 flex flex-wrap items-center justify-center gap-y-3 mt-0 border-t border-t-gray-200">
                            {[
                              {
                                label: "Basic Safety Training Fisheries I",
                                color: "bg-primary",
                                multiplier:
                                  selectedLemdiklat != "BPPP Tegal"
                                    ? 1350000
                                    : 1050000,
                              },
                              {
                                label: "Basic Safety Training Fisheries II",
                                color: "bg-[#8FD0EF]",
                                multiplier:
                                  selectedLemdiklat != "BPPP Tegal"
                                    ? 600000
                                    : 620000,
                              },
                              {
                                label: "Rating Keahlian",
                                color: "bg-[#E0366F]",
                                multiplier:
                                  selectedLemdiklat != "BPPP Tegal"
                                    ? 1350000
                                    : 2050000,
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
                                        {item.label} - Rp{" "}
                                        {item.multiplier.toLocaleString(
                                          "id-ID"
                                        )}
                                      </span>
                                    </p>
                                  </div>

                                  <span className="w-full flex items-end justify-end">
                                    Rp.
                                    {(
                                      data
                                        .filter(
                                          (d) =>
                                            d.NamaProgram === item.label &&
                                            d.NamaPelaksana ===
                                            selectedLemdiklat &&
                                            d.AsalPendapatan == "PNBP"
                                        )
                                        .reduce(
                                          (total, d) =>
                                            total + d.JumlahBlankoDisetujui,
                                          0
                                        ) * item.multiplier
                                    ).toLocaleString("id-ID")}{" "}
                                    <span className="font-semibold text-xs ml-3">
                                      (
                                      {data
                                        .filter(
                                          (d) =>
                                            d.NamaProgram === item.label &&
                                            d.NamaPelaksana ===
                                            selectedLemdiklat &&
                                            d.AsalPendapatan == "PNBP"
                                        )
                                        .reduce(
                                          (total, d) =>
                                            total + d.JumlahBlankoDisetujui,
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
                          <div className="leading-none text-muted-foreground">
                            Showing total certificate issued since 27 May 2024
                          </div>
                        </CardFooter>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-col mt-10">
                      <Card className="w-full">
                        <CardHeader>
                          <CardTitle>Total Perkiraan Penerimaan PNBP</CardTitle>
                          <CardDescription>
                            {" "}
                            The unit prices used in this data were obtained from{" "}
                            <span className="font-semibold">PP Tarif 85</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-8 flex flex-wrap items-center justify-center gap-y-3 mt-0 border-t border-t-gray-200">
                            {[
                              {
                                label: "Basic Safety Training Fisheries I",
                                color: "bg-primary",
                                multiplier:
                                  selectedLemdiklat != "BPPP Tegal"
                                    ? 1350000
                                    : 1050000,
                              },
                              {
                                label: "Basic Safety Training Fisheries II",
                                color: "bg-[#8FD0EF]",
                                multiplier:
                                  selectedLemdiklat != "BPPP Tegal"
                                    ? 600000
                                    : 620000,
                              },
                              {
                                label: "Rating Keahlian",
                                color: "bg-[#E0366F]",
                                multiplier:
                                  selectedLemdiklat != "BPPP Tegal"
                                    ? 1350000
                                    : 2050000,
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
                                        {item.label} - Rp{" "}
                                        {item.multiplier.toLocaleString(
                                          "id-ID"
                                        )}
                                      </span>
                                    </p>
                                  </div>

                                  <span className="w-full flex items-end justify-end">
                                    Rp.
                                    {(
                                      data
                                        .filter(
                                          (d) =>
                                            d.NamaProgram === item.label &&
                                            d.NamaPelaksana ===
                                            selectedLemdiklat &&
                                            d.AsalPendapatan == "PNBP"
                                        )
                                        .reduce(
                                          (total, d) =>
                                            total + d.JumlahBlankoDisetujui,
                                          0
                                        ) * item.multiplier
                                    ).toLocaleString("id-ID")}{" "}
                                    <span className="font-semibold text-xs ml-3">
                                      (
                                      {data
                                        .filter(
                                          (d) =>
                                            d.NamaProgram === item.label &&
                                            d.NamaPelaksana ===
                                            selectedLemdiklat &&
                                            d.AsalPendapatan == "PNBP"
                                        )
                                        .reduce(
                                          (total, d) =>
                                            total + d.JumlahBlankoDisetujui,
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
                          <div className="leading-none text-muted-foreground">
                            Showing total certificate issued since 27 May 2024
                          </div>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 flex-col mt-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Detail Data CoP</CardTitle>
            <CardDescription>
              {" "}
              Yang telah diterbitkan pasca SE 933 Tahun 2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableDataSertifikatKeterampilan />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChartPopoverKeterampilan;
