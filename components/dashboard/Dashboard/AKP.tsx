"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GiBattery75, GiPapers } from "react-icons/gi";
import {
  MdSchool,
  MdCalendarToday,
  MdRefresh,
  MdInfoOutline,
  MdChevronRight,
} from "react-icons/md";
import Cookies from "js-cookie";
import axios, { AxiosResponse } from "axios";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";

import {
  RiFileCloseFill,
  RiLogoutCircleRFill,
  RiShipFill,
  RiEqualizerFill,
} from "react-icons/ri";
import { Blanko, BlankoKeluar, BlankoRusak } from "@/types/blanko";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { formatDateTime } from "@/utils";
import useFetchSertifikatByTypeBlanko from "@/hooks/blanko/useFetchSertifikatByTypeBlanko";
import useFetchSertifikatByLemdiklat from "@/hooks/blanko/useFetchSertifikatByLemdiklat";
import useFetchSertifikatByProgram from "@/hooks/blanko/useFetchSertifikatByProgram";

import dynamic from "next/dynamic";
import { HashLoader } from "react-spinners";
import CardDataStats from "@/commons/cards/CardDataStats";

const ChartBlankoAwal = dynamic(
  () => import("@/commons/charts/ChartBlankoAwal"),
  { ssr: false }
);
const ChartPopover = dynamic(
  () => import("@/commons/charts/ChartPopover"),
  { ssr: false }
);
const ChartSertifikatKeahlianByLemdiklat = dynamic(
  () => import("@/commons/charts/ChartSertifikatKeahlianByLemdiklat"),
  { ssr: false }
);
const ChartSertifikatKeterampilanByLemdiklat = dynamic(
  () => import("@/commons/charts/ChartSertifikatKeterampilanByLemdiklat"),
  { ssr: false }
);

const AKP: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("XSRF091");

  // Date Range state
  const [startDate, setStartDate] = useState<string>("2024-06-01");
  const [endDate, setEndDate] = useState<string>("2025-12-31");

  // Modal detail for Terpakai statistics
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);

  // Raw API state
  const [lemdikData, setLemdikData] = useState<LemdiklatDetailInfo | null>(null);
  const [dataBlankoKeluar, setDataBlankoKeluar] = useState<BlankoKeluar[]>([]);
  const [blankoRusak, setBlankoRusak] = useState<BlankoRusak[]>([]);
  const [dataBlanko, setDataBlanko] = useState<Blanko[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Handler for manual date input change
  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setDate: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = event.target.value;
    if (value) {
      const formattedDate = new Date(value).toISOString().split("T")[0];
      setDate(formattedDate);
    }
  };

  // Preset date quick selection
  const setPresetRange = (preset: "thisYear" | "2024-2025" | "last6Months" | "last1Year") => {
    const today = new Date();
    const endStr = today.toISOString().split("T")[0];

    if (preset === "thisYear") {
      setStartDate("2025-01-01");
      setEndDate("2025-12-31");
    } else if (preset === "2024-2025") {
      setStartDate("2024-06-01");
      setEndDate("2025-12-31");
    } else if (preset === "last6Months") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      setStartDate(sixMonthsAgo.toISOString().split("T")[0]);
      setEndDate(endStr);
    } else if (preset === "last1Year") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      setStartDate(oneYearAgo.toISOString().split("T")[0]);
      setEndDate(endStr);
    }
  };

  // Consolidated initial master data fetcher
  const fetchMasterData = useCallback(async () => {
    setIsInitialLoading(true);
    setFetchError(null);
    try {
      const akapiBaseUrl = process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL;

      const [lemdikRes, blankoKeluarRes, blankoRusakRes, blankoMasterRes] =
        await Promise.allSettled([
          axios.get(`${baseUrl}/lemdik/getLemdik`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${akapiBaseUrl}/adminpusat/getBlankoKeluar`),
          axios.get(`${akapiBaseUrl}/adminpusat/getBlankoRusak`),
          axios.get(`${akapiBaseUrl}/adminpusat/getBlanko`),
        ]);

      if (lemdikRes.status === "fulfilled") {
        setLemdikData(lemdikRes.value.data);
        if (lemdikRes.value.data?.data?.IdLemdik) {
          Cookies.set("IDLemdik", lemdikRes.value.data.data.IdLemdik);
        }
      }

      if (blankoKeluarRes.status === "fulfilled") {
        setDataBlankoKeluar(blankoKeluarRes.value.data.data || []);
      }

      if (blankoRusakRes.status === "fulfilled") {
        setBlankoRusak(blankoRusakRes.value.data.data || []);
      }

      if (blankoMasterRes.status === "fulfilled") {
        setDataBlanko(blankoMasterRes.value.data.data || []);
      }
    } catch (err: any) {
      setFetchError("Terjadi kesalahan saat memuat data master blanko.");
    } finally {
      setIsInitialLoading(false);
    }
  }, [baseUrl, token]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  // Custom data queries with memoized refetch hooks
  const {
    data: dataSertifikatByTypeBlankoCoP,
    isFetching: isFetchingCoP,
    refetch: refetchCoP,
  } = useFetchSertifikatByTypeBlanko({
    type_blanko: "COP",
    start_date: startDate,
    end_date: endDate,
  });

  const {
    data: dataSertifikatByLemdiklat,
    isFetching: isFetchingLemdiklat,
    refetch: refetchLemdiklat,
  } = useFetchSertifikatByLemdiklat({
    waktu_awal: startDate,
    waktu_berakhir: endDate,
  });

  const {
    data: dataSertifikatByProgram,
    isFetching: isFetchingProgram,
    refetch: refetchProgram,
  } = useFetchSertifikatByProgram({
    waktu_awal: startDate,
    waktu_berakhir: endDate,
  });

  const {
    data: dataSertifikatByTypeBlankoCoC,
    isFetching: isFetchingCoC,
    refetch: refetchCoC,
  } = useFetchSertifikatByTypeBlanko({
    type_blanko: "COC",
    start_date: startDate,
    end_date: endDate,
  });

  // Sync dates when date state changes
  useEffect(() => {
    refetchCoP({ type_blanko: "COP", start_date: startDate, end_date: endDate });
    refetchCoC({ type_blanko: "COC", start_date: startDate, end_date: endDate });
    refetchLemdiklat({ waktu_awal: startDate, waktu_berakhir: endDate });
    refetchProgram({ waktu_awal: startDate, waktu_berakhir: endDate });
  }, [startDate, endDate]);

  const isDataFetching =
    isFetchingCoP || isFetchingCoC || isFetchingLemdiklat || isFetchingProgram;

  // Memoized aggregations to prevent unnecessary recalculations on re-renders
  const totalPengadaan = useMemo(() => {
    return dataBlanko.reduce(
      (total, item) => total + (item.JumlahPengadaan || 0),
      0
    );
  }, [dataBlanko]);

  const totalCoC = useMemo(() => {
    if (!dataSertifikatByLemdiklat?.data?.data_unit_kerja) return 0;
    return dataSertifikatByLemdiklat.data.data_unit_kerja
      .flatMap((item: any) => item.sertifikat || [])
      .reduce((sum: number, s: any) => sum + (s.total || 0), 0);
  }, [dataSertifikatByLemdiklat]);

  const totalCoP = useMemo(() => {
    if (!dataSertifikatByLemdiklat?.data?.data_lembaga) return 0;
    return dataSertifikatByLemdiklat.data.data_lembaga
      .flatMap((item: any) => item.sertifikat || [])
      .reduce((sum: number, s: any) => sum + (s.total || 0), 0);
  }, [dataSertifikatByLemdiklat]);

  const blankoRusakCoC = useMemo(() => {
    return blankoRusak.filter(
      (item) => item.Tipe === "Certificate of Competence (CoC)"
    ).length;
  }, [blankoRusak]);

  const blankoRusakCoP = useMemo(() => {
    return blankoRusak.filter(
      (item) => item.Tipe === "Certificate of Proficiency (CoP)"
    ).length;
  }, [blankoRusak]);

  const totalBlankoRusak = useMemo(() => blankoRusak.length, [blankoRusak]);

  const totalTerpakai = useMemo(() => {
    return totalCoC + totalCoP + totalBlankoRusak;
  }, [totalCoC, totalCoP, totalBlankoRusak]);

  const sisaPersediaan = useMemo(() => {
    return Math.max(0, totalPengadaan - totalTerpakai);
  }, [totalPengadaan, totalTerpakai]);

  const chartSertifikatData = useMemo(() => {
    const cocVal =
      (dataSertifikatByTypeBlankoCoC?.data || []).reduce(
        (total, item) => total + (item.jumlah_sertifikat || 0),
        0
      ) +
      (dataSertifikatByTypeBlankoCoP?.data || [])
        .filter((item) => item.jenis_sertifikat === "Rating Awak Kapal Perikanan")
        .reduce((total, item) => total + (item.jumlah_sertifikat || 0), 0);

    const copVal = (dataSertifikatByTypeBlankoCoP?.data || [])
      .filter((item) => item.jenis_sertifikat !== "Rating Awak Kapal Perikanan")
      .reduce((total, item) => total + (item.jumlah_sertifikat || 0), 0);

    return { CoC: cocVal, CoP: copVal };
  }, [dataSertifikatByTypeBlankoCoC, dataSertifikatByTypeBlankoCoP]);

  const usagePercentage = useMemo(() => {
    if (!totalPengadaan) return "0%";
    return `${Math.round((totalTerpakai / totalPengadaan) * 100)}%`;
  }, [totalTerpakai, totalPengadaan]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Hero Header & Filter Panel */}
      <Card className="border border-slate-200 shadow-sm bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="relative z-10 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Title & Badge */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <RiShipFill className="w-3.5 h-3.5" /> Dashboard Resmi AKP
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Realtime Sync
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-calsans">
                Dashboard Sertifikasi Awak Kapal Perikanan
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Data terintegrasi secara langsung melalui sistem AKAPI dan diolah oleh Pusat Pelatihan Kelautan & Perikanan. Valid per{" "}
                <span className="font-semibold text-blue-200">{formatDateTime()}</span>.
              </p>
            </div>

            {/* Date Filters & Action Controls */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl space-y-3 shrink-0">
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-200">
                <div className="flex items-center gap-1.5">
                  <MdCalendarToday className="text-blue-400" />
                  <span>Filter Rentang Waktu</span>
                </div>
                {isDataFetching && (
                  <span className="text-[10px] text-blue-300 flex items-center gap-1">
                    <MdRefresh className="animate-spin" /> Memuat...
                  </span>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setPresetRange("2024-2025")}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                    startDate === "2024-06-01" && endDate === "2025-12-31"
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-white/10 text-slate-200 hover:bg-white/20"
                  }`}
                >
                  2024 - 2025
                </button>
                <button
                  type="button"
                  onClick={() => setPresetRange("thisYear")}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                    startDate === "2025-01-01" && endDate === "2025-12-31"
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-white/10 text-slate-200 hover:bg-white/20"
                  }`}
                >
                  Tahun 2025
                </button>
                <button
                  type="button"
                  onClick={() => setPresetRange("last6Months")}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-white/10 text-slate-200 hover:bg-white/20 transition-colors"
                >
                  6 Bulan
                </button>
              </div>

              {/* Date Inputs */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange(e, setStartDate)}
                  className="h-8 px-2.5 rounded-md text-xs bg-slate-950/60 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <span className="text-xs text-slate-400">s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange(e, setEndDate)}
                  className="h-8 px-2.5 rounded-md text-xs bg-slate-950/60 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Body */}
      {isInitialLoading ? (
        <div className="w-full flex flex-col h-64 items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <HashLoader color="#2563eb" size={44} />
          <p className="text-xs text-slate-500 font-medium">Memuat statistik AKP...</p>
        </div>
      ) : fetchError ? (
        <div className="w-full p-6 text-center bg-red-50 border border-red-200 rounded-xl text-red-700 space-y-2">
          <p className="text-sm font-semibold">{fetchError}</p>
          <button
            onClick={() => fetchMasterData()}
            className="text-xs font-medium underline hover:text-red-900"
          >
            Coba muat ulang
          </button>
        </div>
      ) : (
        <Card className="border border-slate-200 shadow-sm bg-white p-5 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <GiPapers className="text-xl" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Ringkasan Pengadaan & Penggunaan Blanko Sertifikat
                </h2>
                <p className="text-xs text-slate-500">
                  Periode Aktif: <span className="font-semibold text-slate-700">{startDate}</span> s/d <span className="font-semibold text-slate-700">{endDate}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                Tingkat Penggunaan: <span className="text-blue-600 font-bold">{usagePercentage}</span>
              </span>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Total Pengadaan */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="group cursor-pointer transition-transform hover:-translate-y-0.5">
                  <CardDataStats
                    title="Total Pengadaan Blanko"
                    total={totalPengadaan.toString()}
                    rate="100%"
                    levelUp
                  >
                    <GiPapers className="text-blue-600 text-3xl group-hover:scale-110 transition-transform" />
                  </CardDataStats>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 sm:w-96 p-0 border-slate-200 shadow-lg">
                <ChartBlankoAwal data={dataBlanko} />
              </PopoverContent>
            </Popover>

            {/* Card 2: Total Blanko Terpakai (Triggers Detail Dialog) */}
            <div
              onClick={() => setIsDetailDialogOpen(true)}
              className="group cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <CardDataStats
                title="Total Blanko Terpakai"
                total={totalTerpakai.toString()}
                rate={usagePercentage}
                levelUp
              >
                <RiLogoutCircleRFill className="text-blue-600 text-3xl group-hover:scale-110 transition-transform" />
              </CardDataStats>
            </div>

            {/* Card 3: Sisa Persediaan */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="group cursor-pointer transition-transform hover:-translate-y-0.5">
                  <CardDataStats
                    title="Sisa Persediaan Blanko"
                    total={sisaPersediaan.toString()}
                    rate=""
                    levelDown
                  >
                    <GiBattery75 className="text-emerald-600 text-3xl group-hover:scale-110 transition-transform" />
                  </CardDataStats>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 sm:w-96 p-0 border-slate-200 shadow-lg">
                <ChartPopover
                  data={dataBlanko}
                  dataSertifikat={chartSertifikatData}
                  dataBlankoRusak={blankoRusak}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Detailed Modal/Dialog for "Total Blanko Terpakai" Breakdown */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-md sm:max-w-lg p-6 bg-white rounded-xl shadow-xl">
              <DialogHeader className="pb-3 border-b border-slate-100">
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <RiLogoutCircleRFill className="text-blue-600 text-xl" />
                  Rincian Penggunaan Blanko
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Breakdown total blanko terpakai untuk sertifikasi CoC, CoP, dan blanko rusak.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                {/* Metric Item: CoC */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                    <MdSchool className="text-2xl" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">
                      Sertifikat CoC
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {totalCoC.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Certificate of Competence
                    </span>
                  </div>
                </div>

                {/* Metric Item: CoP */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyan-100 text-cyan-700">
                    <RiShipFill className="text-2xl" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">
                      Sertifikat CoP
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {totalCoP.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Certificate of Proficiency
                    </span>
                  </div>
                </div>
              </div>

              {/* Damaged Blanko Summary Section */}
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                    <RiFileCloseFill className="text-red-600 text-lg" />
                    Total Blanko Rusak
                  </span>
                  <span className="text-base font-extrabold text-red-700 bg-white px-2.5 py-0.5 rounded-md border border-red-200">
                    {totalBlankoRusak.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-red-200/60">
                  <div className="flex items-center justify-between bg-white/80 p-2 rounded-lg border border-red-100">
                    <span className="text-slate-600 text-[11px]">CoC Rusak</span>
                    <span className="font-bold text-red-800">{blankoRusakCoC}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/80 p-2 rounded-lg border border-red-100">
                    <span className="text-slate-600 text-[11px]">CoP Rusak</span>
                    <span className="font-bold text-red-800">{blankoRusakCoP}</span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Charts Section with Tabs */}
          <div className="pt-4 border-t border-slate-100">
            {dataSertifikatByLemdiklat != null && dataSertifikatByProgram != null ? (
              <Tabs defaultValue="CoC" className="w-full space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <RiEqualizerFill className="text-blue-600 text-lg" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Grafik Sertifikasi Berdasarkan Lembaga Diklat
                    </h3>
                  </div>
                  <TabsList className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
                    <TabsTrigger
                      value="CoC"
                      className="text-xs font-semibold px-4 py-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                    >
                      CoC (Competence)
                    </TabsTrigger>
                    <TabsTrigger
                      value="CoP"
                      className="text-xs font-semibold px-4 py-1.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                    >
                      CoP (Proficiency)
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="CoC" className="mt-0 focus-visible:outline-none">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <ChartSertifikatKeahlianByLemdiklat
                      dataLembaga={dataSertifikatByLemdiklat}
                      dataProgram={dataSertifikatByProgram!}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="CoP" className="mt-0 focus-visible:outline-none">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <ChartSertifikatKeterampilanByLemdiklat
                      dataLembaga={dataSertifikatByLemdiklat}
                      dataProgram={dataSertifikatByProgram!}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="w-full flex h-48 items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <HashLoader color="#2563eb" size={36} />
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AKP;
