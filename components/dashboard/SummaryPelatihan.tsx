"use client";
import React from "react";
import { HashLoader } from "react-spinners";
import Image from "next/image";
import ChartMasyarakatDilatihMonthly from "@/commons/charts/ChartMasyarakatDilatihMonthly";
import ChartDetailMasyarakatDilatih, { ChartSektorPembiayaanCard } from "@/commons/charts/ChartDetailMasyarakatDilatih";
import useFetchDataDukung from "@/hooks/elaut/useFetchDataDukung";
import { useFetchAllDataPelatihanMasyarakat } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakat";
import dayjs from "dayjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiFilter } from "react-icons/fi";
import { parseIndonesianDate, tahunList } from "@/utils/time";
import { Wallet, Users, BookOpen, TrendingUp } from "lucide-react";
import { formatToRupiah, formatToShorthandRupiah } from "@/lib/utils";
import MetricsSummaryPelatihan from "./MetricsSummaryPelatihan";
import { StatsMetricStatus } from "./Summary/StatsMetricStatus";
import CalendarSelesaiPelatihan from "./Summary/CalendarSelesaiPelatihan";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SummaryPelatihan: React.FC = () => {
  const { data: dataDukung, isFetching: isFetchingDataDukung, refetch } = useFetchDataDukung()
  const { data, isFetching, refetch: refechDataPelatihan } = useFetchAllDataPelatihanMasyarakat()

  const [tahun, setTahun] = React.useState(() => dayjs().year());
  const [triwulan, setTriwulan] = React.useState("TW I");

  // Automatically set triwulan to latest when year changes
  React.useEffect(() => {
    const currentYear = dayjs().year();
    if (tahun < currentYear) {
      setTahun(tahun);
      setTriwulan("TW IV");
    } else {
      const month = dayjs().month() + 1;
      if (month <= 3) setTriwulan("TW I");
      else if (month <= 6) setTriwulan("TW II");
      else if (month <= 9) setTriwulan("TW III");
      else setTriwulan("TW IV");
    }
  }, [tahun]);

  // ================== GLOBAL FILTERING ==================
  const getQuarter = (month: number) => {
    if (month <= 3) return "TW I";
    if (month <= 6) return "TW II";
    if (month <= 9) return "TW III";
    return "TW IV";
  };

  const filteredDataPelatihan = React.useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      const dateStr = item.TanggalMulaiPelatihan;
      if (!dateStr) return false;

      let itemTahun;
      let itemMonth;
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts[0].length === 4) {
          itemTahun = parseInt(parts[0]);
          itemMonth = parseInt(parts[1]);
        } else {
          itemTahun = parseInt(parts[2]);
          itemMonth = parseInt(parts[1]);
        }
      } else {
        const d = parseIndonesianDate(dateStr);
        itemTahun = d?.getFullYear();
        itemMonth = (d?.getMonth() || 0) + 1;
      }

      const matchYear = itemTahun === tahun;

      const quarters = ["TW I", "TW II", "TW III", "TW IV"];
      const selectedIdx = quarters.indexOf(triwulan);
      const itemIdx = quarters.indexOf(getQuarter(itemMonth || 0));
      const matchQuarter = !triwulan || itemIdx <= selectedIdx;

      return matchYear && matchQuarter;
    });
  }, [data, tahun, triwulan]);

  const filteredDataDukung = React.useMemo(() => {
    if (!dataDukung) return [];
    return dataDukung.filter((item) => {
      const dateStr = item.TanggalMulai;
      if (!dateStr) return false;

      let itemTahun;
      let itemMonth;
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts[0].length === 4) {
          itemTahun = parseInt(parts[0]);
          itemMonth = parseInt(parts[1]);
        } else {
          itemTahun = parseInt(parts[2]);
          itemMonth = parseInt(parts[1]);
        }
      } else {
        const d = parseIndonesianDate(dateStr);
        itemTahun = d?.getFullYear();
        itemMonth = (d?.getMonth() || 0) + 1;
      }

      const matchYear = itemTahun === tahun;

      const quarters = ["TW I", "TW II", "TW III", "TW IV"];
      const selectedIdx = quarters.indexOf(triwulan);
      const itemIdx = quarters.indexOf(getQuarter(itemMonth || 0));
      const matchQuarter = !triwulan || itemIdx <= selectedIdx;

      // Filter by signed certificate
      const isSigned = item.FileSertifikat?.includes("signed");
      const isPenyelenggara = !item.PenyelenggaraPelatihan?.includes("Pusat Pelatihan Kelautan dan Perikanan");

      return matchYear && matchQuarter && isSigned && isPenyelenggara;
    });
  }, [dataDukung, tahun, triwulan]);

  // Calculate key analytics
  const analytics = React.useMemo(() => {
    if (!filteredDataPelatihan || !filteredDataDukung) return null;

    const totalPelatihan = filteredDataPelatihan.length;
    const totalPeserta = filteredDataDukung.length;

    // Calculate average participants per training
    const avgPeserta = totalPelatihan > 0 ? Math.round(totalPeserta / totalPelatihan) : 0;

    // Calculate completion rate
    const completedTrainings = filteredDataPelatihan.filter(item => {
      const status = parseInt(item?.StatusPenerbitan);
      return status >= 5;
    }).length;
    const completionRate = totalPelatihan > 0 ? Math.round((completedTrainings / totalPelatihan) * 100) : 0;

    // Flatten participants from filtered trainings for consistent metrics
    const participantsFromFilteredTrainings = filteredDataDukung;

    // Calculate gender distribution
    const maleCount = participantsFromFilteredTrainings.filter(item => ["L", "Laki - Laki"].includes(item.JenisKelamin)).length;
    const femaleCount = participantsFromFilteredTrainings.filter(item => ["P", "Perempuan"].includes(item.JenisKelamin)).length;
    const malePercentage = totalPeserta > 0 ? Math.round((maleCount / totalPeserta) * 100) : 0;
    const femalePercentage = totalPeserta > 0 ? Math.round((femaleCount / totalPeserta) * 100) : 0;

    // Calculate certification rate (Now 100% since we filter by signed)
    const certifiedCount = totalPeserta;
    const certificationRate = 100;

    // Calculate monthly trend and growth
    const monthlyData: { [key: string]: number } = {};
    filteredDataDukung.forEach(item => {
      if (item.TanggalMulai) {
        const date = new Date(item.TanggalMulai);
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        }
      }
    });

    const months = Object.keys(monthlyData).sort();
    const lastMonth = months.length > 0 ? monthlyData[months[months.length - 1]] : 0;
    const prevMonth = months.length > 1 ? monthlyData[months[months.length - 2]] : 0;
    const growthRate = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;
    const isPositiveGrowth = growthRate >= 0;

    // Calculate training efficiency (avg participants per day)
    const totalDays = filteredDataPelatihan.reduce((sum, item) => {
      if (item.TanggalMulaiPelatihan && item.TanggalBerakhirPelatihan) {
        const start = new Date(item.TanggalMulaiPelatihan);
        const end = new Date(item.TanggalBerakhirPelatihan);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + (days > 0 ? days : 0);
      }
      return sum;
    }, 0);
    const avgParticipantsPerDay = totalDays > 0 ? Math.round(totalPeserta / totalDays) : 0;

    // Calculate performance score (weighted average)
    const performanceScore = Math.round(
      (completionRate * 0.4) +
      (certificationRate * 0.4) +
      ((totalPeserta / Math.max(totalPelatihan, 1)) / 50 * 100 * 0.2)
    );

    // Calculate total PNPB (HargaPelatihan * Signed Participants)
    const totalPNPB = filteredDataPelatihan.reduce((sum, item) => {
      const price = Number(item.HargaPelatihan || 0);
      const signedParticipants = item.UserPelatihan?.filter(u => u.FileSertifikat?.includes("signed")).length || 0;
      return sum + (price * signedParticipants);
    }, 0);

    return {
      totalPelatihan,
      totalPeserta,
      avgPeserta,
      completionRate,
      maleCount,
      femaleCount,
      malePercentage,
      femalePercentage,
      certifiedCount,
      certificationRate,
      growthRate,
      isPositiveGrowth,
      avgParticipantsPerDay,
      performanceScore,
      totalDays,
      totalPNPB
    };
  }, [filteredDataPelatihan, filteredDataDukung]);

  const genderRatio = analytics
    ? Math.round((analytics.maleCount / Math.max(analytics.totalPeserta, 1)) * 100)
    : 50;

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {isFetching || isFetchingDataDukung ? (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <HashLoader color="#3b82f6" size={50} />
            <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">Memuat data pelatihan…</p>
          </div>
        </div>
      ) : data != null ? (
        <div className="flex flex-col gap-8 max-w-[1920px] mx-auto pb-12">

          {/* ─── HERO ─────────────────────────────────────────────────────── */}
          <div className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 rounded-[2rem] p-8 md:p-10 text-white overflow-hidden shadow-2xl shadow-indigo-200/50">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top row: title + filter */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-5 mb-8">
              <div>
                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-[0.25em] mb-1.5">Realisasi Pelatihan Masyarakat</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Capaian {triwulan} · {tahun}</h2>
                <p className="text-blue-200/60 text-sm mt-1.5 font-medium">Data bersertifikat · diperbarui sesuai filter aktif</p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl border border-white/15">
                  <FiFilter className="w-3.5 h-3.5 text-blue-300" />
                  <span className="text-[11px] font-bold text-blue-200 uppercase tracking-widest">Filter</span>
                </div>
                <Select value={tahun.toString()} onValueChange={(val) => setTahun(parseInt(val))}>
                  <SelectTrigger className="w-[110px] h-10 rounded-xl border-white/20 bg-white/10 text-sm font-bold text-white hover:bg-white/20 transition-all focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl border-0">
                    {tahunList.sort((a, b) => b - a).map((t) => (
                      <SelectItem key={t} value={t.toString()} className="font-bold text-xs py-2.5">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={triwulan} onValueChange={setTriwulan}>
                  <SelectTrigger className="w-[100px] h-10 rounded-xl border-white/20 bg-white/10 text-sm font-bold text-white hover:bg-white/20 transition-all focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl border-0">
                    {["TW I", "TW II", "TW III", "TW IV"].map((tw) => (
                      <SelectItem key={tw} value={tw} className="font-bold text-xs py-2.5">{tw}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* KPI strip */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Pelatihan", value: analytics?.totalPelatihan?.toLocaleString() ?? "—", sub: "program" },
                { label: "Masyarakat Dilatih", value: analytics?.totalPeserta?.toLocaleString() ?? "—", sub: "peserta bersertifikat" },
                {
                  label: "Realisasi PNBP",
                  value: formatToShorthandRupiah(analytics?.totalPNPB || 0),
                  fullValue: formatToRupiah(analytics?.totalPNPB || 0),
                  sub: "penerimaan negara",
                  tooltip: true,
                },
                { label: "Tingkat Penyelesaian", value: `${analytics?.completionRate ?? 0}%`, sub: "program selesai" },
              ].map((k) => (
                <div key={k.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-4 hover:bg-white/15 transition-colors duration-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200/70 mb-2">{k.label}</p>
                  {k.tooltip ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-2xl font-black tracking-tight cursor-help">{k.value}</p>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-slate-800 px-4 py-2 rounded-xl font-bold shadow-xl text-sm">
                          {k.fullValue}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <p className="text-2xl font-black tracking-tight">{k.value}</p>
                  )}
                  <p className="text-[11px] text-blue-200/50 mt-0.5 font-medium">{k.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── SEKSI 1: PROFIL PESERTA ─────────────────────────────────── */}
          <SectionLabel color="blue" label="Profil Peserta" description="Komposisi demografis peserta pelatihan bersertifikat pada periode ini." />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Gender breakdown */}
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Distribusi Gender</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    <span className="text-sm font-semibold text-slate-700">Laki-laki</span>
                  </div>
                  <span className="text-sm font-black text-slate-800">{analytics?.maleCount?.toLocaleString() ?? 0} <span className="text-xs font-medium text-slate-400">({analytics?.malePercentage ?? 0}%)</span></span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${genderRatio}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                    <span className="text-sm font-semibold text-slate-700">Perempuan</span>
                  </div>
                  <span className="text-sm font-black text-slate-800">{analytics?.femaleCount?.toLocaleString() ?? 0} <span className="text-xs font-medium text-slate-400">({analytics?.femalePercentage ?? 0}%)</span></span>
                </div>
              </div>
            </div>

            {/* Avg per training */}
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Rata-rata Peserta per Pelatihan</p>
              <div>
                <p className="text-5xl font-black text-slate-800 tracking-tight">{analytics?.avgPeserta?.toLocaleString() ?? 0}</p>
                <p className="text-xs font-medium text-slate-400 mt-1.5">orang / kegiatan</p>
              </div>
              <div className="mt-4 h-px bg-slate-100" />
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">Dari {analytics?.totalPelatihan} pelatihan dengan total {analytics?.totalPeserta?.toLocaleString()} peserta.</p>
            </div>

            {/* Avg per day */}
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Rata-rata Peserta per Hari</p>
              <div>
                <p className="text-5xl font-black text-slate-800 tracking-tight">{analytics?.avgParticipantsPerDay?.toLocaleString() ?? 0}</p>
                <p className="text-xs font-medium text-slate-400 mt-1.5">orang / hari pelatihan</p>
              </div>
              <div className="mt-4 h-px bg-slate-100" />
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">Dihitung dari akumulasi {analytics?.totalDays?.toLocaleString() ?? 0} hari durasi kegiatan.</p>
            </div>
          </div>

          {/* ─── SEKSI 2: TREN REALISASI ─────────────────────────────────── */}
          <SectionLabel color="indigo" label="Tren Realisasi" description="Grafik bulanan peserta dilatih dan akumulasi PNBP sepanjang tahun anggaran." />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Trend Bulanan</h3>
                    <p className="text-xs text-slate-500 font-medium">Peserta &amp; PNBP per bulan</p>
                  </div>
                </div>
                {analytics && (
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${analytics.isPositiveGrowth ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                    <TrendingUp className={`w-3.5 h-3.5 ${analytics.isPositiveGrowth ? "" : "rotate-180"}`} />
                    {analytics.growthRate > 0 ? "+" : ""}{analytics.growthRate}% bulan ini
                  </span>
                )}
              </div>
              <div className="p-5 flex-1 max-h-[340px]">
                <ChartMasyarakatDilatihMonthly data={filteredDataPelatihan} dataUser={filteredDataDukung} tahun={tahun.toString()} triwulan={triwulan} />
              </div>
            </div>
            <div className="xl:col-span-1 overflow-hidden">
              <ChartSektorPembiayaanCard data={filteredDataPelatihan} dataUser={filteredDataDukung} />
            </div>
          </div>

          {/* ─── SEKSI 3: STATUS PENYELENGGARAAN ─────────────────────────── */}
          <SectionLabel color="emerald" label="Status Penyelenggaraan" description="Pipeline tahap administrasi pelatihan — dari pengajuan hingga penerbitan sertifikat." />

          <div className="flex gap-3">
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-white to-emerald-50/40">
                <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                <div>
                  <h3 className="text-sm font-black text-slate-800">Pipeline Administrasi</h3>
                  <p className="text-xs text-slate-500 font-medium">Distribusi status {filteredDataPelatihan.length} pelatihan aktif periode ini</p>
                </div>
              </div>
              <div className="p-6">
                <StatsMetricStatus data={filteredDataPelatihan} tahun={tahun.toString()} />
              </div>
            </div>
            <div className="xl:col-span-1">
              <MetricsSummaryPelatihan data={filteredDataPelatihan} tahun={tahun.toString()} />
            </div>
          </div>


          {/* ─── SEKSI 4: ANALISIS DISTRIBUSI ───────────────────────────── */}
          <SectionLabel color="violet" label="Analisis Distribusi" description="Breakdown multidimensi: sektor, sumber pembiayaan, klaster, gender, dan penyelenggara." />

          <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-white to-violet-50/40">
              <div className="w-1 h-6 bg-violet-500 rounded-full" />
              <div>
                <h3 className="text-sm font-black text-slate-800">Detail Realisasi</h3>
                <p className="text-xs text-slate-500 font-medium">Distribusi masyarakat dilatih per dimensi analitik</p>
              </div>
            </div>
            <div className="p-0">
              <ChartDetailMasyarakatDilatih data={filteredDataPelatihan} dataUser={filteredDataDukung} tahun={tahun.toString()} triwulan={triwulan} />
            </div>
          </div>

        </div>
      ) : (
        <div className="relative max-w-7xl w-full mx-auto mt-20 p-6">
          <div className="flex flex-col items-center bg-white rounded-[2rem] shadow-xl border border-slate-100 p-12">
            <Image src="/illustrations/not-found.png" alt="Belum ada data" width={0} height={0} className="w-[320px] md:w-[380px]" />
            <div className="text-center mt-4">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Belum Ada Data Pelatihan</h1>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                Data capaian pelatihan belum tersedia. Pastikan penyelenggaraan pelatihan telah tercatat di sistem.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Section label ───────────────────────────────────────────────────────────
const LABEL_COLORS = {
  blue: { bar: "bg-blue-500", dot: "bg-blue-100", text: "text-blue-600" },
  indigo: { bar: "bg-indigo-500", dot: "bg-indigo-100", text: "text-indigo-600" },
  emerald: { bar: "bg-emerald-500", dot: "bg-emerald-100", text: "text-emerald-600" },
  violet: { bar: "bg-violet-500", dot: "bg-violet-100", text: "text-violet-600" },
} as const;

function SectionLabel({
  label,
  description,
  color = "blue",
}: {
  label: string;
  description: string;
  color?: keyof typeof LABEL_COLORS;
}) {
  const c = LABEL_COLORS[color];
  return (
    <div className="flex items-center gap-4">
      <div className={`w-1 h-10 ${c.bar} rounded-full flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">{label}</h3>
        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default SummaryPelatihan;

