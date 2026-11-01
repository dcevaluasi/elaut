"use client";

import React, { useMemo, useState } from "react";
import { Table2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Instruktur } from "@/types/instruktur";
import { UnitKerja } from "@/types/master";
import { kategoriPelatih } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";

/** Urutan baris mengikuti format laporan; unit lain ditaruh di akhir. */
const URUTAN_SATKER = ["Puslat", "Medan", "Tegal", "Banyuwangi", "Bitung", "Ambon", "Sukamandi"];

/** Kolom jenjang: salah satu `kunci` dicocokkan ke isi `jenjang_jabatan`. */
const JENJANG_WIDYAISWARA = [
    { kunci: ["pertama"], label: "Pertama" },
    { kunci: ["muda"], label: "Muda" },
    { kunci: ["madya"], label: "Madya" },
    { kunci: ["utama"], label: "Utama" },
];
const JENJANG_INSTRUKTUR = [
    { kunci: ["pelaksana", "terampil"], label: "Pelaksana / Terampil" }, // "Pelaksana" = sebutan lama jenjang terampil
    { kunci: ["mahir"], label: "Mahir" },
    { kunci: ["penyelia"], label: "Penyelia" },
    { kunci: ["pertama"], label: "Pertama" },
    { kunci: ["muda"], label: "Muda" },
    { kunci: ["madya"], label: "Madya" },
];

type Props = { data: Instruktur[]; unitKerjas: UnitKerja[] };
type Kolom = { kunci: string[]; label: string };
type Baris = { nama: string; nilai: number[] };
type Rekap = { judul: string; labelBaris?: string; kolom: string[]; grup?: { label: string; span: number }[]; rows: Baris[]; total: Baris; denganJumlah?: boolean; catatan?: string };

const urutan = (nama: string) => {
    const i = URUTAN_SATKER.findIndex((k) => nama.toLowerCase().includes(k.toLowerCase()));
    return i === -1 ? URUTAN_SATKER.length : i;
};

/** "Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Ambon" → "BPPP Ambon" */
const singkatSatker = (nama: string) => (/^pusat pelatihan kelautan dan perikanan$/i.test(nama.trim()) ? "Puslat KP" : nama.replace(/^.*\((\w+)\)\s*/, "$1 ").trim());

/** Satu baris per satuan kerja; `kolomDari` → indeks kolom (−1 / [] = tidak dihitung). */
function rekapSatker({ data, unitKerjas }: Props, jumlahKolom: number, kolomDari: (d: Instruktur) => number | number[]) {
    const namaUnit = new Map(unitKerjas.map((uk) => [String(uk.id_unit_kerja), uk.nama]));
    const perUnit = new Map<string, Baris>();
    const total: Baris = { nama: "Jumlah", nilai: Array(jumlahKolom).fill(0) };
    for (const d of data) {
        const id = String(d.id_lemdik ?? "");
        let baris = perUnit.get(id);
        if (!baris) {
            baris = { nama: namaUnit.get(id) || `Unit ${id || "-"}`, nilai: Array(jumlahKolom).fill(0) };
            perUnit.set(id, baris);
        }
        for (const k of ([] as number[]).concat(kolomDari(d))) {
            if (k < 0) continue;
            baris.nilai[k]++;
            total.nilai[k]++;
        }
    }
    const rows = Array.from(perUnit.values()).sort((a, b) => urutan(a.nama) - urutan(b.nama) || a.nama.localeCompare(b.nama));
    return { rows, total };
}

const indeksJenjang = (d: Instruktur, kolom: Kolom[]) => {
    const j = (d.jenjang_jabatan || "").toLowerCase();
    return kolom.findIndex((k) => k.kunci.some((x) => j.includes(x)));
};

/** Pelatih dengan jenjang kosong/di luar daftar → kolom "Lainnya" agar Jumlah tetap sama. */
function rekapJenjang(props: Props, judul: string, kategori: "widyaiswara" | "instruktur", kolom: Kolom[]): Rekap {
    const { rows, total } = rekapSatker(props, kolom.length + 1, (d) => {
        if (kategoriPelatih(d) !== kategori) return -1;
        const i = indeksJenjang(d, kolom);
        return i === -1 ? kolom.length : i;
    });
    const adaLainnya = total.nilai[kolom.length] > 0;
    const potong = (b: Baris) => (adaLainnya ? b : { ...b, nilai: b.nilai.slice(0, kolom.length) });
    return {
        judul,
        grup: [{ label: `Jenjang Jabatan Fungsional ${kategori === "widyaiswara" ? "Widyaiswara" : "Instruktur"}`, span: kolom.length + (adaLainnya ? 1 : 0) }],
        kolom: [...kolom.map((k) => k.label), ...(adaLainnya ? ["Lainnya"] : [])],
        rows: rows.map(potong),
        total: potong(total),
        denganJumlah: true,
    };
}

/** Baris per bidang keahlian (isian bebas, dirapikan), kolom per satuan kerja. */
function rekapBidang({ data, unitKerjas }: Props) {
    const namaUnit = new Map(unitKerjas.map((uk) => [String(uk.id_unit_kerja), uk.nama]));
    const satker = Array.from(new Set(data.map((d) => String(d.id_lemdik ?? ""))))
        .map((id) => ({ id, nama: namaUnit.get(id) || `Unit ${id || "-"}` }))
        .sort((a, b) => urutan(a.nama) - urutan(b.nama) || a.nama.localeCompare(b.nama));
    const kolomUnit = new Map(satker.map((s, i) => [s.id, i]));

    const rekap = (kategori: "widyaiswara" | "instruktur") => {
        const perBidang = new Map<string, Baris>();
        const total: Baris = { nama: "Jumlah", nilai: Array(satker.length).fill(0) };
        for (const d of data) {
            if (kategoriPelatih(d) !== kategori) continue;
            const nama = (d.bidang_keahlian || "").trim().replace(/\s+/g, " ") || "Belum diisi";
            let baris = perBidang.get(nama.toLowerCase());
            if (!baris) {
                baris = { nama, nilai: Array(satker.length).fill(0) };
                perBidang.set(nama.toLowerCase(), baris);
            }
            const k = kolomUnit.get(String(d.id_lemdik ?? ""))!;
            baris.nilai[k]++;
            total.nilai[k]++;
        }
        const rows = Array.from(perBidang.values()).sort((a, b) => Number(a.nama === "Belum diisi") - Number(b.nama === "Belum diisi") || a.nama.localeCompare(b.nama));
        return { rows, total };
    };
    const kolom = satker.map((s) => singkatSatker(s.nama));
    const grup = [{ label: "Satuan Kerja", span: kolom.length }];
    return {
        wi: { judul: "Widyaiswara menurut bidang keahlian", labelBaris: "Bidang Keahlian", grup, kolom, ...rekap("widyaiswara"), denganJumlah: true } as Rekap,
        ins: { judul: "Instruktur menurut bidang keahlian", labelBaris: "Bidang Keahlian", grup, kolom, ...rekap("instruktur"), denganJumlah: true } as Rekap,
    };
}

const JK = ["laki-laki", "perempuan"];
/** Per kategori: L, P, Jumlah. JK kosong tetap ikut Jumlah (L + P bisa < Jumlah). */
function rekapJK(props: Props): Rekap {
    const { rows, total } = rekapSatker(props, 6, (d) => {
        const k = kategoriPelatih(d);
        if (k !== "widyaiswara" && k !== "instruktur") return [];
        const awal = k === "widyaiswara" ? 0 : 3;
        const jk = JK.indexOf((d.jenis_kelamin || "").trim().toLowerCase());
        return jk === -1 ? [awal + 2] : [awal + jk, awal + 2];
    });
    const [wL, wP, wJ, iL, iP, iJ] = total.nilai;
    return {
        judul: "Widyaiswara dan instruktur menurut jenis kelamin",
        grup: [{ label: "Widyaiswara", span: 3 }, { label: "Instruktur", span: 3 }],
        kolom: ["L", "P", "Jumlah", "L", "P", "Jumlah"],
        rows,
        total,
        catatan: wL + wP < wJ || iL + iP < iJ ? "Sebagian pelatih belum mengisi jenis kelamin, sehingga L + P lebih kecil dari Jumlah." : undefined,
    };
}

/* ============================ TABEL ============================ */

const th = "px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap";
const td = "px-3 py-2.5 text-[13px] text-slate-700 dark:text-slate-200 tabular-nums";

function TabelRekap({ rekap }: { rekap: Rekap }) {
    const { labelBaris = "Satuan Kerja", kolom, grup, rows, total, denganJumlah, catatan } = rekap;
    const jumlah = (b: Baris) => b.nilai.reduce((s, n) => s + n, 0);
    const max = Math.max(1, ...rows.flatMap((r) => r.nilai));
    const lebar = 2 + kolom.length + (denganJumlah ? 1 : 0);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-center">
                <thead>
                    {grup ? (
                        <>
                            <tr>
                                <th rowSpan={2} className={`${th} w-10`}>No</th>
                                <th rowSpan={2} className={`${th} text-left`}>{labelBaris}</th>
                                {grup.map((g) => (
                                    <th key={g.label} colSpan={g.span} className={`${th} border-b-0 text-[#0B1B3F] dark:text-sky-200`}>{g.label}</th>
                                ))}
                                {denganJumlah && <th rowSpan={2} className={th}>Jumlah</th>}
                            </tr>
                            <tr>
                                {kolom.map((k, i) => <th key={i} className={th}>{k}</th>)}
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <th className={`${th} w-10`}>No</th>
                            <th className={`${th} text-left`}>{labelBaris}</th>
                            {kolom.map((k) => <th key={k} className={th}>{k}</th>)}
                            {denganJumlah && <th className={th}>Jumlah</th>}
                        </tr>
                    )}
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={lebar} className="py-10 text-sm text-slate-400">Belum ada data pelatih</td>
                        </tr>
                    )}
                    {rows.map((r, i) => (
                        <tr key={r.nama} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                            <td className={`${td} text-slate-400`}>{i + 1}</td>
                            <td className={`${td} text-left font-semibold ${r.nama === "Belum diisi" ? "text-slate-400 italic" : ""}`}>{r.nama}</td>
                            {r.nilai.map((n, j) => (
                                <td key={j} className={td}>
                                    {/* heat cell: intensitas sesuai nilai */}
                                    <span
                                        className={`inline-flex min-w-[28px] justify-center rounded-md px-1.5 py-0.5 ${n ? "font-bold text-[#0B1B3F] dark:text-white" : "text-slate-300"}`}
                                        style={n ? { background: `rgba(59,130,246,${0.08 + (n / max) * 0.32})` } : undefined}
                                    >
                                        {n}
                                    </span>
                                </td>
                            ))}
                            {denganJumlah && <td className={`${td} font-black text-slate-900 dark:text-white`}>{jumlah(r)}</td>}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-[#0B1B3F] text-white">
                        <td colSpan={2} className="px-3 py-2.5 text-left text-xs font-black uppercase tracking-wider">Jumlah</td>
                        {total.nilai.map((n, j) => <td key={j} className="px-3 py-2.5 text-[13px] font-black tabular-nums">{n}</td>)}
                        {denganJumlah && <td className="px-3 py-2.5 text-[13px] font-black tabular-nums text-sky-200">{jumlah(total)}</td>}
                    </tr>
                </tfoot>
            </table>
            {catatan && <p className="mt-3 px-1 text-[11px] text-slate-500">{catatan}</p>}
        </div>
    );
}

/* ============================ KOMPONEN ============================ */

type TabKey = "sebaran" | "jenjangWI" | "jenjangIns" | "bidangWI" | "bidangIns" | "jk";

export default function TableSebaranPelatih(props: Props) {
    const [tab, setTab] = useState<TabKey>("sebaran");

    // Semua rekap dihitung sekali per perubahan data
    const rekap = useMemo(() => {
        const sebaran = rekapSatker(props, 2, (d) => {
            const k = kategoriPelatih(d);
            return k === "widyaiswara" ? 0 : k === "instruktur" ? 1 : -1;
        });
        const bidang = rekapBidang(props);
        return {
            sebaran: { judul: "Sebaran widyaiswara dan instruktur per satuan kerja", kolom: ["Widyaiswara", "Instruktur"], ...sebaran, denganJumlah: true } as Rekap,
            jenjangWI: rekapJenjang(props, "Widyaiswara per jenjang jabatan", "widyaiswara", JENJANG_WIDYAISWARA),
            jenjangIns: rekapJenjang(props, "Instruktur per jenjang jabatan", "instruktur", JENJANG_INSTRUKTUR),
            bidangWI: bidang.wi,
            bidangIns: bidang.ins,
            jk: rekapJK(props),
        } as Record<TabKey, Rekap>;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.data, props.unitKerjas]);

    const TABS: { key: TabKey; label: string }[] = [
        { key: "sebaran", label: "Sebaran" },
        { key: "jenjangWI", label: "Jenjang WI" },
        { key: "jenjangIns", label: "Jenjang Instruktur" },
        { key: "bidangWI", label: "Keahlian WI" },
        { key: "bidangIns", label: "Keahlian Instruktur" },
        { key: "jk", label: "Jenis Kelamin" },
    ];
    const cur = rekap[tab];

    /** Unduh tabel aktif ke Excel (format laporan) */
    const exportExcel = () => {
        const jumlah = (b: Baris) => b.nilai.reduce((s, n) => s + n, 0);
        const header = ["No", cur.labelBaris || "Satuan Kerja", ...cur.kolom, ...(cur.denganJumlah ? ["Jumlah"] : [])];
        const body = cur.rows.map((r, i) => [i + 1, r.nama, ...r.nilai, ...(cur.denganJumlah ? [jumlah(r)] : [])]);
        const foot = ["", "Jumlah", ...cur.total.nilai, ...(cur.denganJumlah ? [jumlah(cur.total)] : [])];
        const ws = XLSX.utils.aoa_to_sheet([[cur.judul], [], header, ...body, foot]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rekap");
        XLSX.writeFile(wb, `${cur.judul.replace(/[^\w\s-]/g, "").slice(0, 60)}.xlsx`);
    };

    return (
        <section className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-white shadow-md">
                        <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#3B82F6_0%,transparent_75%)]" />
                        <Table2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{cur.judul}</h4>
                        <p className="text-[11px] text-slate-500">Format tabel laporan · warna sel menunjukkan besaran</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center p-1 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 overflow-x-auto scrollbar-hide">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setTab(t.key)}
                                className={`h-8 px-3 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${tab === t.key ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button type="button" onClick={exportExcel} title="Unduh Excel" className="h-9 w-9 shrink-0 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 flex items-center justify-center">
                        <Download className="h-4 w-4" />
                    </button>
                </div>
            </header>
            <div key={tab} className="p-4 md:p-5 animate-in fade-in duration-200">
                <TabelRekap rekap={cur} />
            </div>
        </section>
    );
}
