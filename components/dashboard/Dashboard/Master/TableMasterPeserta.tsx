"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  TbSearch,
  TbUsers,
  TbGenderMale,
  TbGenderFemale,
  TbIdBadge2,
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
  TbCopy,
  TbCheck,
  TbX,
  TbAlertTriangle,
  TbBrandWhatsapp,
} from "react-icons/tb";

import { useFetchAllUsers } from "@/hooks/elaut/user/useFetchAllUsers";
import { User } from "@/types/user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EditPesertaAction from "@/commons/actions/EditPesertaAction";
import { exportUsersToExcel } from "@/lib/exportToExcel";

/* ============================ HELPERS ============================ */

type Gender = "L" | "P" | "";
type NikFilter = "" | "valid" | "invalid";
type SortKey = "nama" | "terbaru";

const genderOf = (jk?: string): Gender => {
  const v = (jk || "").toLowerCase().replace(/\s/g, "");
  if (v === "l" || v === "laki-laki" || v === "laki") return "L";
  if (v === "p" || v === "perempuan") return "P";
  return "";
};

const isNikValid = (nik?: string | number) => /^\d{16}$/.test(String(nik ?? "").trim());
const fmt = (n: number) => n.toLocaleString("id-ID");
const pct = (n: number, t: number) => (t > 0 ? Math.round((n / t) * 100) : 0);
const waLink = (phone?: string | number) => {
  const d = String(phone ?? "").replace(/\D/g, "");
  if (!d) return null;
  return `https://wa.me/${d.startsWith("0") ? "62" + d.slice(1) : d}`;
};

type Row = {
  u: User;
  gender: Gender;
  nikValid: boolean;
  pendidikan: string;
  provinsi: string;
  domisili: string;
  haystack: string;
};

const PAGE_SIZES = [10, 25, 50, 100];

/* ============================ PAGE ============================ */

export default function TableMasterPeserta() {
  const router = useRouter();
  const pathname = usePathname();
  const { users, loading, error, fetchUsers, progress } = useFetchAllUsers();

  // Selalu minta data saat mount.
  // - Hook baru: pakai cache bila masih fresh (tidak request ulang).
  // - Hook lama: argumen diabaikan, tetap fetch seperti biasa.
  useEffect(() => {
    (fetchUsers as (force?: boolean) => unknown)(false);
  }, [fetchUsers]);

  const [search, setSearch] = useState("");
  const q = useDeferredValue(search.trim().toLowerCase());
  const [gender, setGender] = useState<Gender>("");
  const [pendidikan, setPendidikan] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [nikFilter, setNikFilter] = useState<NikFilter>("");
  const [sortKey, setSortKey] = useState<SortKey>("nama");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Normalisasi SEKALI per data ---------- */
  const rows = useMemo<Row[]>(
    () =>
      users.map((u) => {
        const kota = (u.Kota || "").trim();
        const prov = (u.Provinsi || "").trim();
        return {
          u,
          gender: genderOf(u.JenisKelamin),
          nikValid: isNikValid(u.Nik),
          pendidikan: (u.PendidikanTerakhir || "").trim(),
          provinsi: prov,
          domisili: [kota, prov].filter(Boolean).join(", "),
          haystack: [u.Nama, u.Nik, u.Email, u.NoTelpon, kota, prov, u.Instansi].filter(Boolean).join(" ").toLowerCase(),
        };
      }),
    [users]
  );

  /* ---------- Statistik + opsi filter (1 loop) ---------- */
  const { stats, pendidikanOpts, provinsiOpts } = useMemo(() => {
    let male = 0, female = 0, nikValid = 0;
    const pend = new Map<string, number>();
    const prov = new Map<string, number>();
    for (const r of rows) {
      if (r.gender === "L") male++;
      else if (r.gender === "P") female++;
      if (r.nikValid) nikValid++;
      if (r.pendidikan) pend.set(r.pendidikan, (pend.get(r.pendidikan) || 0) + 1);
      if (r.provinsi) prov.set(r.provinsi, (prov.get(r.provinsi) || 0) + 1);
    }
    const toOpts = (m: Map<string, number>) => Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return {
      stats: { total: rows.length, male, female, nikValid, nikInvalid: rows.length - nikValid },
      pendidikanOpts: toOpts(pend),
      provinsiOpts: toOpts(prov),
    };
  }, [rows]);

  /* ---------- Filter + sort ---------- */
  const filtered = useMemo(() => {
    const out = rows.filter(
      (r) =>
        (!gender || r.gender === gender) &&
        (!pendidikan || r.pendidikan === pendidikan) &&
        (!provinsi || r.provinsi === provinsi) &&
        (!nikFilter || (nikFilter === "valid" ? r.nikValid : !r.nikValid)) &&
        (!q || r.haystack.includes(q))
    );
    return sortKey === "nama"
      ? out.sort((a, b) => (a.u.Nama || "").localeCompare(b.u.Nama || ""))
      : out.sort((a, b) => Number(b.u.IdUsers) - Number(a.u.IdUsers));
  }, [rows, gender, pendidikan, provinsi, nikFilter, q, sortKey]);

  useEffect(() => setPage(1), [q, gender, pendidikan, provinsi, nikFilter, sortKey, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const fromIdx = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const toIdx = Math.min(safePage * pageSize, filtered.length);

  const chips = [
    gender && { key: "g", label: gender === "L" ? "Laki-laki" : "Perempuan", clear: () => setGender("") },
    pendidikan && { key: "pd", label: pendidikan, clear: () => setPendidikan("") },
    provinsi && { key: "pv", label: provinsi, clear: () => setProvinsi("") },
    nikFilter && { key: "nik", label: nikFilter === "valid" ? "NIK valid" : "NIK tidak valid", clear: () => setNikFilter("") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const hasFilter = chips.length > 0 || !!search;
  const clearAll = () => {
    setSearch("");
    setGender("");
    setPendidikan("");
    setProvinsi("");
    setNikFilter("");
  };

  const initialLoading = loading && users.length === 0;
  const goDetail = (id: number | string) => router.push(`${pathname}/${id}`);

  /* ============================ RENDER ============================ */

  return (
    <div className="space-y-5 pb-16">
      {/* ─── Statistik (navy hero + aksen warna) ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <HeroStat
          label="Total Peserta"
          value={stats.total}
          sub="terdaftar di E-LAUT"
          icon={<TbUsers />}
          accent="#3B82F6"
          tile="from-blue-500 to-indigo-600"
          active={!gender && !nikFilter}
          onClick={() => {
            setGender("");
            setNikFilter("");
          }}
          loading={initialLoading}
        />
        <HeroStat
          label="Laki-laki"
          value={stats.male}
          sub={`${pct(stats.male, stats.total)}% dari total`}
          icon={<TbGenderMale />}
          accent="#0EA5E9"
          tile="from-sky-400 to-cyan-500"
          progress={pct(stats.male, stats.total)}
          active={gender === "L"}
          onClick={() => setGender(gender === "L" ? "" : "L")}
          loading={initialLoading}
        />
        <HeroStat
          label="Perempuan"
          value={stats.female}
          sub={`${pct(stats.female, stats.total)}% dari total`}
          icon={<TbGenderFemale />}
          accent="#EC4899"
          tile="from-pink-500 to-rose-500"
          progress={pct(stats.female, stats.total)}
          active={gender === "P"}
          onClick={() => setGender(gender === "P" ? "" : "P")}
          loading={initialLoading}
        />
        <HeroStat
          label="NIK Valid (16 digit)"
          value={stats.nikValid}
          sub={stats.nikInvalid ? `${fmt(stats.nikInvalid)} perlu diperbaiki — klik` : "semua NIK valid"}
          icon={<TbIdBadge2 />}
          accent="#10B981"
          tile="from-emerald-400 to-teal-500"
          progress={pct(stats.nikValid, stats.total)}
          active={nikFilter === "invalid"}
          onClick={() => setNikFilter(nikFilter === "invalid" ? "" : "invalid")}
          loading={initialLoading}
        />
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-2.5 xl:items-center rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm">
        <div className="relative flex-1 group">
          <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Cari nama, NIK, email, telepon, instansi, atau domisili..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-12 w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
          {search ? (
            <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200" aria-label="Hapus pencarian">
              <TbX className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 px-2 items-center rounded-md border border-slate-200 bg-white text-[10px] font-bold text-slate-400">/</kbd>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect value={pendidikan} onChange={setPendidikan} allLabel="Semua Pendidikan" options={pendidikanOpts} icon={<TbSchool className="w-4 h-4 text-slate-400" />} />
          <FilterSelect value={provinsi} onChange={setProvinsi} allLabel="Semua Provinsi" options={provinsiOpts} icon={<TbMapPin className="w-4 h-4 text-slate-400" />} />

          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="h-11 w-[130px] rounded-2xl border-0 bg-slate-50 dark:bg-slate-800 text-xs font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-[999]">
              <SelectItem value="nama" className="text-xs">Nama A–Z</SelectItem>
              <SelectItem value="terbaru" className="text-xs">Terbaru</SelectItem>
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => fetchUsers()}
            disabled={loading}
            title="Muat ulang data"
            className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:ring-1 hover:ring-slate-200 disabled:opacity-50"
          >
            <TbRefresh className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => exportUsersToExcel(filtered.map((r) => r.u))}
            disabled={filtered.length === 0}
            title={`Unduh ${fmt(filtered.length)} peserta`}
            className="h-11 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <TbFileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* ─── Chips filter aktif ──────────────────────────────────────── */}
      {hasFilter && (
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          <span className="text-xs text-slate-500 mr-1">
            <b className="text-slate-800 dark:text-white tabular-nums">{fmt(filtered.length)}</b> dari {fmt(stats.total)} peserta
          </span>
          {chips.map((c) => (
            <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold max-w-[220px]">
              <span className="truncate">{c.label}</span>
              <button type="button" onClick={c.clear} className="p-0.5 rounded-full hover:bg-blue-100" aria-label={`Hapus filter ${c.label}`}>
                <TbX className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button type="button" onClick={clearAll} className="text-[11px] font-bold text-rose-500 hover:text-rose-600 ml-1">
            Reset semua
          </button>
        </div>
      )}

      {/* ─── Tabel ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-3.5 px-5 text-center w-14">No</th>
                <th className="py-3.5 px-5">Peserta</th>
                <th className="py-3.5 px-5">Kontak</th>
                <th className="py-3.5 px-5">Domisili</th>
                <th className="py-3.5 px-5">Pendidikan & Instansi</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialLoading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <LoadingPanel progress={progress} />
                  </td>
                </tr>
              ) : error && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
                        <TbAlertTriangle className="w-6 h-6 text-rose-500" />
                      </div>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">Gagal memuat data peserta</p>
                      <p className="text-xs text-slate-400 max-w-sm">{String((error as any)?.message || error)}</p>
                      <button type="button" onClick={() => fetchUsers()} className="mt-2 h-9 px-4 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold flex items-center gap-1.5">
                        <TbRefresh className="w-4 h-4" /> Coba lagi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <TbUsers className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">{hasFilter ? "Tidak ada peserta yang cocok" : "Belum ada data peserta"}</p>
                      <p className="text-xs text-slate-400">{hasFilter ? "Coba ubah kata kunci atau filter." : "Data peserta akan muncul setelah pendaftaran."}</p>
                      {hasFilter && (
                        <button type="button" onClick={clearAll} className="mt-2 h-9 px-4 rounded-xl ring-1 ring-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                          Hapus semua filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((r, i) => (
                  <PesertaRow key={r.u.IdUsers ?? i} no={fromIdx + i} row={r} onDetail={() => goDetail(r.u.IdUsers)} onSuccess={() => fetchUsers()} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>
                Menampilkan <b className="text-slate-800 dark:text-white tabular-nums">{fmt(fromIdx)}–{fmt(toIdx)}</b> dari <b className="tabular-nums">{fmt(filtered.length)}</b>
              </span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="h-8 w-[92px] rounded-lg text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl z-[999]">
                  {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)} className="text-xs">{s} / hal</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ ROW ============================ */

function PesertaRow({ no, row, onDetail, onSuccess }: { no: number; row: Row; onDetail: () => void; onSuccess: () => void }) {
  const { u, gender, nikValid, domisili, pendidikan } = row;
  const [copied, setCopied] = useState(false);
  const wa = waLink(u.NoTelpon);

  const avatar =
    gender === "L" ? "from-sky-400 to-blue-600" : gender === "P" ? "from-pink-400 to-rose-500" : "from-slate-400 to-slate-500";

  const copyNik = async () => {
    if (!u.Nik) return;
    try {
      await navigator.clipboard.writeText(String(u.Nik));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* abaikan */
    }
  };

  return (
    <tr className="group hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
      <td className="py-3.5 px-5 text-center text-xs font-bold text-slate-400 tabular-nums">{fmt(no)}</td>

      {/* Peserta */}
      <td className="py-3.5 px-5 min-w-[260px]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatar} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}>
            {(u.Nama || "P").trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <button type="button" onClick={onDetail} className="block text-left text-[13px] font-black text-slate-800 dark:text-white leading-tight truncate max-w-[240px] hover:text-blue-600 transition-colors">
              {u.Nama || "Nama tidak terdaftar"}
            </button>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`font-mono text-[11px] font-semibold ${nikValid ? "text-slate-500" : "text-amber-600"}`}>{u.Nik || "NIK kosong"}</span>
              {u.Nik && (
                <button type="button" onClick={copyNik} title="Salin NIK" className="p-0.5 rounded text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {copied ? <TbCheck className="w-3.5 h-3.5 text-emerald-500" /> : <TbCopy className="w-3.5 h-3.5" />}
                </button>
              )}
              {!nikValid && (
                <span title="NIK harus 16 digit angka" className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-1.5 text-[9px] font-black">
                  <TbAlertTriangle className="w-3 h-3" /> cek
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate max-w-[240px]">
              {gender === "L" ? "Laki-laki" : gender === "P" ? "Perempuan" : "Gender -"}
              {u.TempatLahir ? ` · ${u.TempatLahir}${u.TanggalLahir ? `, ${u.TanggalLahir}` : ""}` : ""}
            </p>
          </div>
        </div>
      </td>

      {/* Kontak */}
      <td className="py-3.5 px-5">
        <div className="space-y-1 text-xs">
          {u.Email ? (
            <a href={`mailto:${u.Email}`} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 max-w-[200px]">
              <TbMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{u.Email}</span>
            </a>
          ) : (
            <p className="flex items-center gap-1.5 text-slate-300"><TbMail className="w-3.5 h-3.5" /> -</p>
          )}
          {u.NoTelpon ? (
            <div className="flex items-center gap-1.5">
              <a href={`tel:${u.NoTelpon}`} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600">
                <TbPhone className="w-3.5 h-3.5 text-slate-400" /> {u.NoTelpon}
              </a>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" title="Chat WhatsApp" className="p-0.5 rounded text-emerald-500 hover:bg-emerald-50">
                  <TbBrandWhatsapp className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-slate-300"><TbPhone className="w-3.5 h-3.5" /> -</p>
          )}
        </div>
      </td>

      {/* Domisili */}
      <td className="py-3.5 px-5">
        <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 max-w-[200px]">
          <TbMapPin className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{domisili || "-"}</span>
        </div>
      </td>

      {/* Pendidikan & instansi */}
      <td className="py-3.5 px-5">
        <div className="space-y-1">
          {pendidikan ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 text-[10px] font-black">
              <TbSchool className="w-3 h-3" /> {pendidikan}
            </span>
          ) : (
            <span className="text-xs text-slate-300">-</span>
          )}
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400 max-w-[180px]">
            <TbBuilding className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{u.Status || u.Instansi || "Masyarakat Umum"}</span>
          </p>
        </div>
      </td>

      {/* Aksi */}
      <td className="py-3.5 px-5">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onDetail}
            className="h-9 px-3 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <TbEye className="w-4 h-4" /> Detail
          </button>
          <EditPesertaAction idPeserta={String(u.IdUsers)} onSuccess={onSuccess} />
        </div>
      </td>
    </tr>
  );
}

/* ============================ UI KECIL ============================ */

/** Panel loading dengan waktu berjalan & data terunduh (endpoint berat) */
function LoadingPanel({ progress }: { progress: { startedAt: number; loadedBytes: number; totalBytes: number | null } | null }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const secs = progress ? Math.floor((Date.now() - progress.startedAt) / 1000) : 0;
  const mb = progress ? progress.loadedBytes / 1_048_576 : 0;
  const pctDl = progress?.totalBytes ? Math.round((progress.loadedBytes / progress.totalBytes) * 100) : null;
  const downloading = (progress?.loadedBytes ?? 0) > 0;

  return (
    <div className="py-14 px-6 flex flex-col items-center text-center gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-slate-800" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-black text-slate-800 dark:text-white">
          {downloading ? "Mengunduh data peserta…" : "Menunggu respons server…"}
        </p>
        <p className="text-xs text-slate-500 tabular-nums">
          {secs} detik{downloading ? ` · ${mb.toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB diterima` : ""}
          {pctDl !== null ? ` · ${pctDl}%` : ""}
        </p>
      </div>
      {pctDl !== null && (
        <div className="w-64 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all" style={{ width: `${pctDl}%` }} />
        </div>
      )}
      {secs >= 20 && (
        <p className="max-w-md text-[11px] text-amber-600 bg-amber-50 ring-1 ring-amber-200 rounded-xl px-3 py-2">
          Data peserta sangat besar sehingga server butuh waktu lama. Halaman tetap bisa dipakai; data akan muncul otomatis setelah selesai.
          Kunjungan berikutnya dalam 5 menit akan langsung tampil.
        </p>
      )}
    </div>
  );
}

/** Kartu statistik bergaya hero (navy mesh) dengan warna aksen berbeda */
function HeroStat({
  label,
  value,
  sub,
  icon,
  accent,
  progress,
  active,
  onClick,
  loading,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  accent: string;
  /** tidak dipakai lagi (dibiarkan agar pemanggil lama tetap valid) */
  tile?: string;
  progress?: number;
  active?: boolean;
  onClick?: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 text-left text-white ring-1 transition-all duration-300 hover:-translate-y-0.5 ${active ? "ring-2 ring-white/50 shadow-xl" : "ring-white/10 shadow-lg"}`}
      style={{ boxShadow: active ? `0 18px 40px -16px ${accent}` : undefined }}
    >
      {/* mesh aksen */}
      <div className="absolute inset-0 -z-10 opacity-90" style={{ background: `radial-gradient(70% 90% at 100% 0%, ${accent}66 0%, transparent 60%), radial-gradient(60% 80% at 0% 100%, #2563EB55 0%, transparent 60%)` }} />
      <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />

      {/* Cahaya lembut dari kanan ke kiri saat hover / aktif */}
      <div
        className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ease-out ${active ? "opacity-70" : "opacity-0 group-hover:opacity-100"}`}
        style={{ background: `linear-gradient(to left, ${accent}59 0%, ${accent}26 35%, transparent 75%)` }}
      />

      {/* Ikon besar sebagai background di kanan */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-4 -bottom-6 -z-10 text-[120px] leading-none -rotate-12 transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 ${active ? "opacity-40" : "opacity-20 group-hover:opacity-40"}`}
        style={{ color: accent, filter: `drop-shadow(0 0 24px ${accent}66)` }}
      >
        {icon}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/75 pr-10">{label}</p>

      {loading ? (
        <div className="mt-2 h-9 w-24 rounded-lg bg-white/15 animate-pulse" />
      ) : (
        <p className="mt-1 text-3xl md:text-4xl font-black tracking-[-0.03em] tabular-nums">{fmt(value)}</p>
      )}

      {progress !== undefined && (
        <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #fff)` }} />
        </div>
      )}
      <p className="mt-2 text-[11px] font-medium text-blue-100/60 truncate">{sub}</p>
    </button>
  );
}

function FilterSelect({
  value,
  onChange,
  allLabel,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  allLabel: string;
  options: [string, number][];
  icon: React.ReactNode;
}) {
  return (
    <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
      <SelectTrigger className={`h-11 w-[170px] rounded-2xl border-0 text-xs font-bold ${value ? "bg-[#0B1B3F] text-white" : "bg-slate-50 dark:bg-slate-800"}`}>
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="truncate"><SelectValue /></span>
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl z-[999] max-h-72">
        <SelectItem value="all" className="text-xs font-bold">{allLabel}</SelectItem>
        {options.map(([name, count]) => (
          <SelectItem key={name} value={name} className="text-xs">
            {name} <span className="text-slate-400">({fmt(count)})</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const pages = useMemo(() => {
    const set = Array.from(new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))).sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    set.forEach((p, i) => {
      if (i > 0 && p - set[i - 1] > 1) out.push("…");
      out.push(p);
    });
    return out;
  }, [page, totalPages]);

  const btn = "h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all";
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className={`${btn} text-slate-500 hover:bg-slate-100 disabled:opacity-30`} aria-label="Sebelumnya">
        <TbChevronLeft className="w-4 h-4 mx-auto" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-xs text-slate-400">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} tabular-nums ${p === page ? "bg-[#0B1B3F] text-white shadow-md shadow-blue-900/20" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {p}
          </button>
        )
      )}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={`${btn} text-slate-500 hover:bg-slate-100 disabled:opacity-30`} aria-label="Berikutnya">
        <TbChevronRight className="w-4 h-4 mx-auto" />
      </button>
    </div>
  );
}
