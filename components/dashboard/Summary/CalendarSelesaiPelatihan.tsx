"use client";

import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as XLSX from "xlsx";
import { PelatihanMasyarakat } from "@/types/product";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  List,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  BookOpen,
  Filter,
  Sparkles,
  Award,
  CalendarDays,
  FileSpreadsheet,
  Info,
  Layers,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseIndonesianDate } from "@/utils/time";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface CalendarSelesaiPelatihanProps {
  data: PelatihanMasyarakat[];
  tahunGlobal?: number;
}

// Helper to safely parse dates in various formats
const parseDate = (dateStr?: string): dayjs.Dayjs | null => {
  if (!dateStr) return null;

  // Format YYYY-MM-DD or DD-MM-YYYY
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts[0].length === 4) {
      const d = dayjs(dateStr);
      return d.isValid() ? d : null;
    } else if (parts[2] && parts[2].length === 4) {
      const d = dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`);
      return d.isValid() ? d : null;
    }
  }

  // Indonesian string e.g. "12 Januari 2026"
  const parsedIndo = parseIndonesianDate(dateStr);
  if (parsedIndo && !isNaN(parsedIndo.getTime())) {
    return dayjs(parsedIndo);
  }

  const d = dayjs(dateStr);
  return d.isValid() ? d : null;
};

const CalendarSelesaiPelatihan: React.FC<CalendarSelesaiPelatihanProps> = ({
  data,
  tahunGlobal,
}) => {
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [currentMonth, setCurrentMonth] = useState(() => dayjs());
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "11" | "15">("all");

  // Sync with global year filter if provided
  React.useEffect(() => {
    if (tahunGlobal && currentMonth.year() !== tahunGlobal) {
      setCurrentMonth(dayjs().year(tahunGlobal).month(0));
    }
  }, [tahunGlobal]);

  // Filter all pelatihan (no longer restricted to status 11 & 15)
  const filteredPelatihanData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      const statusStr = (item.StatusPenerbitan || "").toString();

      // Status sub-filter
      if (statusFilter !== "all" && statusStr !== statusFilter) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchNama = item.NamaPelatihan?.toLowerCase().includes(query);
        const matchProgram = item.Program?.toLowerCase().includes(query);
        const matchPenyelenggara = item.PenyelenggaraPelatihan?.toLowerCase().includes(query);
        return matchNama || matchProgram || matchPenyelenggara;
      }

      return true;
    });
  }, [data, statusFilter, searchTerm]);

  // Export to Excel Functionality (Only for selected month & year)
  const handleExportExcel = () => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");

    const monthData = filteredPelatihanData.filter((item) => {
      const start = parseDate(item.TanggalMulaiPelatihan);
      const end = parseDate(item.TanggalBerakhirPelatihan) || start;
      if (!start || !end) return false;

      return start.isSameOrBefore(endOfMonth, "day") && end.isSameOrAfter(startOfMonth, "day");
    });

    if (!monthData.length) {
      alert(`Tidak ada data pelatihan pada bulan ${currentMonth.format("MMMM YYYY")}`);
      return;
    }

    const exportRows = monthData.map((item, index) => ({
      No: index + 1,
      "Nama Pelatihan": item.NamaPelatihan || "-",
      Program: item.Program || "-",
      Penyelenggara: item.PenyelenggaraPelatihan || "-",
      "Tanggal Mulai": item.TanggalMulaiPelatihan || "-",
      "Tanggal Selesai": item.TanggalBerakhirPelatihan || "-",
      Status: item.StatusPenerbitan || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Auto fit column widths
    const colWidths = [
      { wch: 5 },
      { wch: 40 },
      { wch: 35 },
      { wch: 35 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
    ];
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Pelatihan ${currentMonth.format("MMM YYYY")}`);

    const stamp = currentMonth.format("MMMM_YYYY");
    XLSX.writeFile(
      workbook,
      `Data_Pelatihan_${stamp}.xlsx`
    );
  };

  // Calendar Grid Calculation
  const calendarGrid = useMemo(() => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const daysInMonth = currentMonth.daysInMonth();

    // Day of week for 1st day (0 = Sun, 1 = Mon, ..., 6 = Sat)
    // We adjust to Monday-first (0 = Mon, ..., 6 = Sun)
    let startDayIdx = startOfMonth.day() - 1;
    if (startDayIdx < 0) startDayIdx = 6;

    const days: Array<{
      date: dayjs.Dayjs;
      isCurrentMonth: boolean;
      events: PelatihanMasyarakat[];
    }> = [];

    // Previous month padding days
    const prevMonth = currentMonth.subtract(1, "month");
    const prevMonthDays = prevMonth.daysInMonth();
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const date = prevMonth.date(prevMonthDays - i);
      days.push({ date, isCurrentMonth: false, events: [] });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = currentMonth.date(day);

      // Find events occurring on this date
      const dayEvents = filteredPelatihanData.filter((item) => {
        const start = parseDate(item.TanggalMulaiPelatihan);
        const end = parseDate(item.TanggalBerakhirPelatihan) || start;

        if (!start) return false;
        return date.isSameOrAfter(start, "day") && date.isSameOrBefore(end, "day");
      });

      days.push({ date, isCurrentMonth: true, events: dayEvents });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = 35 - (days.length % 35);
    if (remaining < 35 && remaining > 0) {
      const nextMonth = currentMonth.add(1, "month");
      for (let day = 1; day <= remaining; day++) {
        const date = nextMonth.date(day);
        days.push({ date, isCurrentMonth: false, events: [] });
      }
    }

    return days;
  }, [currentMonth, filteredPelatihanData]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredPelatihanData.filter((item) => {
      const start = parseDate(item.TanggalMulaiPelatihan);
      const end = parseDate(item.TanggalBerakhirPelatihan) || start;
      if (!start) return false;
      return (
        selectedDate.isSameOrAfter(start, "day") &&
        selectedDate.isSameOrBefore(end, "day")
      );
    });
  }, [selectedDate, filteredPelatihanData]);

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50/50 to-indigo-50/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl ring-1 ring-indigo-100 text-indigo-600 shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                Jadwal Pelatihan
              </span>
              <span className="text-xs font-bold text-slate-400">
                • {filteredPelatihanData.length} Total Pelatihan
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
              Kalender & Jadwal Pelatihan
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">


          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === "calendar"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Kalender
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === "table"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <List className="w-4 h-4" />
              Tabel
            </button>
          </div>

          {/* Export Excel Button */}
          <Button
            onClick={handleExportExcel}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel ({currentMonth.format("MMM YYYY")})
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {viewMode === "calendar" ? (
          <div className="space-y-6">
            {/* Month Control Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-black text-slate-800 tracking-tight">
                  {currentMonth.format("MMMM YYYY")}
                </h4>
                <Badge
                  variant="outline"
                  className="rounded-lg bg-white border-slate-200 text-xs font-bold text-slate-600"
                >
                  {calendarGrid.reduce((acc, d) => acc + (d.isCurrentMonth ? d.events.length : 0), 0)} Event Bulan Ini
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
                  className="h-9 px-3 rounded-xl border-slate-200 hover:bg-white text-slate-700 font-bold"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Sebelumnya
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(dayjs())}
                  className="h-9 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs"
                >
                  Hari Ini
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
                  className="h-9 px-3 rounded-xl border-slate-200 hover:bg-white text-slate-700 font-bold"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(
                (day, idx) => (
                  <div
                    key={day}
                    className={`py-2 text-xs font-black uppercase tracking-wider ${idx >= 5 ? "text-rose-500" : "text-slate-400"
                      }`}
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            {/* Calendar Grid Matrix */}
            <div className="grid grid-cols-7 gap-2">
              {calendarGrid.map((cell, idx) => {
                const isSelected = selectedDate && cell.date.isSame(selectedDate, "day");
                const isToday = cell.date.isSame(dayjs(), "day");
                const hasEvents = cell.events.length > 0;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (hasEvents) {
                        setSelectedDate(isSelected ? null : cell.date);
                      }
                    }}
                    className={`min-h-[100px] p-2.5 rounded-2xl border transition-all flex flex-col justify-between group ${!cell.isCurrentMonth
                        ? "bg-slate-50/40 border-slate-100 opacity-40"
                        : isSelected
                          ? "bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                          : isToday
                            ? "bg-blue-50/60 border-blue-300 ring-1 ring-blue-300"
                            : hasEvents
                              ? "bg-white border-slate-200/80 hover:border-indigo-400 hover:shadow-md cursor-pointer"
                              : "bg-white border-slate-100"
                      }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black rounded-lg w-7 h-7 flex items-center justify-center ${isToday
                            ? "bg-blue-600 text-white shadow-sm"
                            : isSelected
                              ? "bg-indigo-600 text-white"
                              : cell.isCurrentMonth
                                ? "text-slate-700"
                                : "text-slate-300"
                          }`}
                      >
                        {cell.date.date()}
                      </span>

                      {hasEvents && (
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 text-[10px] font-black">
                          {cell.events.length} Pelatihan
                        </span>
                      )}
                    </div>

                    {/* Events List Badges inside Day Cell */}
                    <div className="space-y-1 mt-2">
                      {cell.events.slice(0, 2).map((evt) => {
                        const statusVal = parseInt(evt.StatusPenerbitan || "0");
                        const isSelesai = statusVal === 11 || statusVal === 15;
                        return (
                          <div
                            key={evt.IdPelatihan}
                            className={`p-1.5 rounded-xl text-[10px] font-bold border leading-tight truncate transition-transform group-hover:scale-[1.02] ${isSelesai
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 border-emerald-200/60"
                                : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 border-indigo-200/60"
                              }`}
                            title={`${evt.NamaPelatihan} (${evt.PenyelenggaraPelatihan})`}
                          >
                            <div className="truncate font-black">{evt.NamaPelatihan}</div>
                            <div className="text-[9px] opacity-75 truncate">
                              {evt.PenyelenggaraPelatihan}
                            </div>
                          </div>
                        );
                      })}

                      {cell.events.length > 2 && (
                        <div className="text-[9px] font-bold text-slate-400 text-center pt-0.5">
                          +{cell.events.length - 2} pelatihan lainnya
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Date Drawer / Details Card */}
            {selectedDate && (
              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase tracking-wider">
                        Pelatihan pada {selectedDate.format("DD MMMM YYYY")}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Terdeteksi {selectedDateEvents.length} kegiatan pelatihan
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                    className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl text-xs font-bold"
                  >
                    Tutup
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {selectedDateEvents.map((evt) => {
                    const statusVal = parseInt(evt.StatusPenerbitan || "0");
                    const is11 = statusVal === 11;
                    const is15 = statusVal === 15;
                    return (
                      <div
                        key={evt.IdPelatihan}
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all space-y-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <Badge
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-none ${is11
                                ? "bg-emerald-500 text-white"
                                : is15
                                  ? "bg-blue-500 text-white"
                                  : "bg-indigo-500 text-white"
                              }`}
                          >
                            Status {evt.StatusPenerbitan || "0"}
                          </Badge>
                          <span className="text-[11px] font-bold text-slate-400">
                            {evt.TanggalMulaiPelatihan} s/d {evt.TanggalBerakhirPelatihan}
                          </span>
                        </div>

                        <div>
                          <h5 className="font-black text-sm text-white mb-1 line-clamp-2 uppercase">
                            {evt.NamaPelatihan}
                          </h5>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            Program: <span className="text-slate-200 font-semibold">{evt.Program || "-"}</span>
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1.5 font-medium truncate">
                            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            {evt.PenyelenggaraPelatihan}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="space-y-4">
            {/* Table Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Cari nama pelatihan, program, penyelenggara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 pl-10 rounded-2xl bg-slate-50 border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="text-xs font-bold text-slate-500">
                Menampilkan <strong className="text-slate-800">{filteredPelatihanData.length}</strong> data pelatihan
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-black uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 text-center w-14">No</th>
                    <th className="px-5 py-4">Nama Pelatihan</th>
                    <th className="px-5 py-4">Program</th>
                    <th className="px-5 py-4">Penyelenggara</th>
                    <th className="px-5 py-4 text-center">Tanggal Mulai</th>
                    <th className="px-5 py-4 text-center">Tanggal Selesai</th>
                    <th className="px-5 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPelatihanData.length > 0 ? (
                    filteredPelatihanData.map((item, idx) => {
                      const statusVal = parseInt(item.StatusPenerbitan || "0");
                      const is11 = statusVal === 11;
                      const is15 = statusVal === 15;
                      return (
                        <tr
                          key={item.IdPelatihan || idx}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-5 py-4 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-800 max-w-xs uppercase leading-snug">
                            {item.NamaPelatihan}
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-600">
                            {item.Program || "-"}
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-600">
                            {item.PenyelenggaraPelatihan || "-"}
                          </td>
                          <td className="px-5 py-4 text-center font-semibold text-slate-600 whitespace-nowrap">
                            {item.TanggalMulaiPelatihan || "-"}
                          </td>
                          <td className="px-5 py-4 text-center font-semibold text-slate-600 whitespace-nowrap">
                            {item.TanggalBerakhirPelatihan || "-"}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <Badge
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-none ${is11
                                  ? "bg-emerald-100 text-emerald-800"
                                  : is15
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-indigo-100 text-indigo-800"
                                }`}
                            >
                              Status {item.StatusPenerbitan || "0"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-slate-400 font-semibold italic"
                      >
                        Tidak ada data pelatihan ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSelesaiPelatihan;
