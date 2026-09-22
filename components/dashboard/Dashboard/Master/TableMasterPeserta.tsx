"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFetchAllUsers } from "@/hooks/elaut/user/useFetchAllUsers";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TbSearch,
  TbUser,
  TbUserCheck,
  TbGenderMale,
  TbGenderFemale,
  TbFileSpreadsheet,
  TbRefresh,
  TbEye,
  TbMapPin,
  TbMail,
  TbPhone,
  TbSchool,
  TbChevronLeft,
  TbChevronRight,
  TbBuilding,
  TbId,
} from "react-icons/tb";
import EditPesertaAction from "@/commons/actions/EditPesertaAction";
import { exportUsersToExcel } from "@/lib/exportToExcel";
import { motion } from "framer-motion";

export default function TableMasterPeserta() {
  const router = useRouter();
  const pathname = usePathname();
  const { users, loading, fetchUsers } = useFetchAllUsers();

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [educationFilter, setEducationFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const male = users.filter((u) => u.JenisKelamin === "L" || u.JenisKelamin === "Laki-Laki").length;
    const female = users.filter((u) => u.JenisKelamin === "P" || u.JenisKelamin === "Perempuan").length;
    const nikValid = users.filter((u) => u.Nik && u.Nik.toString().length >= 15).length;
    return { total, male, female, nikValid };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        search.trim() === "" ||
        (u.Nama && u.Nama.toLowerCase().includes(search.toLowerCase())) ||
        (u.Nik && u.Nik.toString().includes(search)) ||
        (u.Email && u.Email.toLowerCase().includes(search.toLowerCase())) ||
        (u.NoTelpon && u.NoTelpon.toString().includes(search)) ||
        (u.Kota && u.Kota.toLowerCase().includes(search.toLowerCase())) ||
        (u.Provinsi && u.Provinsi.toLowerCase().includes(search.toLowerCase()));

      const matchesGender =
        genderFilter === "ALL" ||
        (genderFilter === "L" && (u.JenisKelamin === "L" || u.JenisKelamin === "Laki-Laki")) ||
        (genderFilter === "P" && (u.JenisKelamin === "P" || u.JenisKelamin === "Perempuan"));

      const matchesEducation =
        educationFilter === "ALL" ||
        (u.PendidikanTerakhir && u.PendidikanTerakhir.toLowerCase() === educationFilter.toLowerCase());

      return matchesSearch && matchesGender && matchesEducation;
    });
  }, [users, search, genderFilter, educationFilter]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, genderFilter, educationFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleNavigateDetail = (userId: number) => {
    // Direct to detail user page e.g. /[random_id]/[role]/master/peserta/[id]
    router.push(`${pathname}/${userId}`);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Total Peserta</p>
            <h3 className="text-3xl font-black mt-1 tracking-tight">{loading ? "..." : stats.total}</h3>
            <p className="text-xs text-blue-100/80 mt-1 font-medium">Terdaftar di E-LAUT</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl">
            <TbUser />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peserta Laki-Laki</p>
            <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{loading ? "..." : stats.male}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{stats.total ? Math.round((stats.male / stats.total) * 100) : 0}% Dari total</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-2xl">
            <TbGenderMale />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peserta Perempuan</p>
            <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{loading ? "..." : stats.female}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{stats.total ? Math.round((stats.female / stats.total) * 100) : 0}% Dari total</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center text-2xl">
            <TbGenderFemale />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">NIK Terverifikasi</p>
            <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{loading ? "..." : stats.nikValid}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">Terstruktur Valid</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-2xl">
            <TbUserCheck />
          </div>
        </div>
      </div>

      {/* Table Action Bar: Search, Filters, Refresh, Export */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <Input
              type="text"
              placeholder="Cari nama, NIK, email, no telepon, atau domisili..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[150px] h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold">
                <SelectValue placeholder="Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl z-[999]">
                <SelectItem value="ALL">Semua Gender</SelectItem>
                <SelectItem value="L">Laki-Laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={educationFilter} onValueChange={setEducationFilter}>
              <SelectTrigger className="w-[170px] h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold">
                <SelectValue placeholder="Pendidikan" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl z-[999]">
                <SelectItem value="ALL">Semua Pendidikan</SelectItem>
                <SelectItem value="SD">SD</SelectItem>
                <SelectItem value="SMP">SMP</SelectItem>
                <SelectItem value="SMA/SMK">SMA / SMK</SelectItem>
                <SelectItem value="DI/DII/DIII">D1 / D2 / D3</SelectItem>
                <SelectItem value="S1">D4 / S1</SelectItem>
                <SelectItem value="S2">S2</SelectItem>
                <SelectItem value="S3">S3</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => fetchUsers()}
              className="h-12 w-12 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-600 hover:text-blue-600 p-0 flex items-center justify-center transition-all"
              title="Refresh Data"
            >
              <TbRefresh className={`text-xl ${loading ? "animate-spin text-blue-600" : ""}`} />
            </Button>

            <Button
              onClick={() => exportUsersToExcel(filteredUsers)}
              className="h-12 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <TbFileSpreadsheet className="text-lg" />
              <span>Export Excel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6 text-center w-16">No</th>
                <th className="py-4 px-6">Peserta & NIK</th>
                <th className="py-4 px-6">Kontak</th>
                <th className="py-4 px-6">Gender & Bio</th>
                <th className="py-4 px-6">Domisili</th>
                <th className="py-4 px-6">Pendidikan & Status</th>
                <th className="py-4 px-6 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Master Data Peserta...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <TbUser className="text-4xl text-slate-300" />
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Tidak ada data peserta yang ditemukan.</p>
                      <p className="text-xs text-slate-400">Coba ubah filter atau kata kunci pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => {
                  const itemNo = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <motion.tr
                      key={user.IdUsers || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6 text-center font-bold text-slate-400 text-xs">{itemNo}</td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                            {user.Nama ? user.Nama.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {user.Nama || "Nama Tidak Terdaftar"}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <TbId className="text-blue-500 shrink-0" />
                              <span className="font-mono text-[11px] font-semibold">{user.Nik || "-"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <TbMail className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{user.Email || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <TbPhone className="text-slate-400 shrink-0" />
                            <span>{user.NoTelpon || "-"}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1 text-xs">
                          <Badge
                            className={`border-none text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 ${
                              user.JenisKelamin === "L" || user.JenisKelamin === "Laki-Laki"
                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : user.JenisKelamin === "P" || user.JenisKelamin === "Perempuan"
                                ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {user.JenisKelamin === "L" || user.JenisKelamin === "Laki-Laki"
                              ? "Laki-Laki"
                              : user.JenisKelamin === "P" || user.JenisKelamin === "Perempuan"
                              ? "Perempuan"
                              : "-"}
                          </Badge>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]">
                            {user.TempatLahir ? `${user.TempatLahir}${user.TanggalLahir ? `, ${user.TanggalLahir}` : ""}` : "-"}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <TbMapPin className="text-slate-400 text-sm mt-0.5 shrink-0" />
                          <span className="line-clamp-2 max-w-[180px]">
                            {user.Kota || user.Provinsi ? `${user.Kota || ""}${user.Kota && user.Provinsi ? ", " : ""}${user.Provinsi || ""}` : "-"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                            <TbSchool className="text-blue-500" />
                            <span>{user.PendidikanTerakhir || "-"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <TbBuilding className="text-slate-400" />
                            <span className="truncate max-w-[140px]">{user.Status || user.Instansi || "Masyarakat Umum"}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavigateDetail(user.IdUsers)}
                            className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:border-blue-500 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                            title="Lihat Detail Peserta"
                          >
                            <TbEye className="text-base text-blue-600" />
                            <span>Detail</span>
                          </Button>

                          <EditPesertaAction
                            idPeserta={user.IdUsers.toString()}
                            onSuccess={fetchUsers}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tampilkan</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(val) => {
                setItemsPerPage(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 h-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-[999]">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              data dari total <span className="font-bold text-slate-900 dark:text-white">{filteredUsers.length}</span> peserta
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"
            >
              <TbChevronLeft className="text-base mr-1" />
              <span>Prev</span>
            </Button>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-3">
              Halaman {currentPage} dari {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"
            >
              <span>Next</span>
              <TbChevronRight className="text-base ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
