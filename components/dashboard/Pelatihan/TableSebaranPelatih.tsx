"use client";

import React, { useMemo } from "react";
import { Instruktur } from "@/types/instruktur";
import { UnitKerja } from "@/types/master";
import { kategoriPelatih } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";

/** Urutan baris mengikuti format laporan; unit lain ditaruh di akhir. */
const URUTAN_SATKER = ["Puslat", "Medan", "Tegal", "Banyuwangi", "Bitung", "Ambon", "Sukamandi"];

/** Kolom jenjang: salah satu `kunci` dicocokkan ke isi `jenjang_jabatan`, mis. "Instruktur Ahli Muda". */
const JENJANG_WIDYAISWARA = [
    { kunci: ["pertama"], label: "Pertama" },
    { kunci: ["muda"], label: "Muda" },
    { kunci: ["madya"], label: "Madya" },
    { kunci: ["utama"], label: "Utama" },
];
const JENJANG_INSTRUKTUR = [
    // "Pelaksana" adalah sebutan lama untuk jenjang terampil.
    { kunci: ["pelaksana", "terampil"], label: "Pelaksana / Terampil" },
    { kunci: ["mahir"], label: "Mahir" },
    { kunci: ["penyelia"], label: "Penyelia" },
    { kunci: ["pertama"], label: "Pertama" },
    { kunci: ["muda"], label: "Muda" },
    { kunci: ["madya"], label: "Madya" },
];

type Props = {
    data: Instruktur[];
    unitKerjas: UnitKerja[];
};

type Kolom = { kunci: string[]; label: string };
type Baris = { nama: string; nilai: number[] };

function urutan(nama: string) {
    const i = URUTAN_SATKER.findIndex((k) => nama.toLowerCase().includes(k.toLowerCase()));
    return i === -1 ? URUTAN_SATKER.length : i;
}

/**
 * Menghitung satu baris per satuan kerja. `kolomDari` mengembalikan indeks
 * kolom (atau beberapa) untuk satu pelatih; -1 atau [] berarti tidak dihitung.
 */
function useRekap(
    { data, unitKerjas }: Props,
    jumlahKolom: number,
    kolomDari: (d: Instruktur) => number | number[],
) {
    return useMemo(() => {
        const namaUnit = new Map(unitKerjas.map((uk) => [String(uk.id_unit_kerja), uk.nama]));
        const perUnit = new Map<string, Baris>();
        const total: Baris = { nama: "Jumlah", nilai: Array(jumlahKolom).fill(0) };

        data.forEach((d) => {
            const id = String(d.id_lemdik ?? "");
            let baris = perUnit.get(id);
            if (!baris) {
                baris = { nama: namaUnit.get(id) || `Unit ${id || "-"}`, nilai: Array(jumlahKolom).fill(0) };
                perUnit.set(id, baris);
            }
            ([] as number[]).concat(kolomDari(d)).forEach((k) => {
                if (k < 0) return;
                baris.nilai[k]++;
                total.nilai[k]++;
            });
        });

        const rows = Array.from(perUnit.values()).sort(
            (a, b) => urutan(a.nama) - urutan(b.nama) || a.nama.localeCompare(b.nama),
        );
        return { rows, total };
        // `kolomDari` dibuat ulang tiap render namun hanya bergantung pada `jumlahKolom`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, unitKerjas, jumlahKolom]);
}

const th = "px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200";
const td = "px-4 py-2.5 text-sm text-slate-700 border border-slate-200";

function TabelRekap({
    judul,
    labelBaris = "Satuan Kerja",
    kolom,
    grup,
    rows,
    total,
    denganJumlah,
    catatan,
}: {
    judul: string;
    labelBaris?: string;
    kolom: string[];
    /** Judul di atas kolom; `span` = banyak kolom yang dinaunginya, berurutan. */
    grup?: { label: string; span: number }[];
    rows: Baris[];
    total: Baris;
    denganJumlah?: boolean;
    catatan?: string;
}) {
    const jumlah = (b: Baris) => b.nilai.reduce((s, n) => s + n, 0);
    const lebar = 2 + kolom.length + (denganJumlah ? 1 : 0);

    return (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                    {judul}
                </h3>
            </div>
            <div className="overflow-x-auto p-6">
                <table className="w-full border-collapse text-center">
                    <thead className="bg-slate-50">
                        {grup ? (
                            <>
                                <tr>
                                    <th rowSpan={2} className={th}>No</th>
                                    <th rowSpan={2} className={`${th} text-left`}>{labelBaris}</th>
                                    {grup.map((g) => <th key={g.label} colSpan={g.span} className={th}>{g.label}</th>)}
                                    {denganJumlah && <th rowSpan={2} className={th}>Jumlah</th>}
                                </tr>
                                <tr>
                                    {kolom.map((k, i) => <th key={i} className={th}>{k}</th>)}
                                </tr>
                            </>
                        ) : (
                            <tr>
                                <th className={th}>No</th>
                                <th className={`${th} text-left`}>{labelBaris}</th>
                                {kolom.map((k) => <th key={k} className={th}>{k}</th>)}
                                {denganJumlah && <th className={th}>Jumlah</th>}
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={lebar} className={`${td} text-slate-400`}>Belum ada data pelatih</td>
                            </tr>
                        )}
                        {rows.map((r, i) => (
                            <tr key={r.nama} className="hover:bg-slate-50/60">
                                <td className={td}>{i + 1}</td>
                                <td className={`${td} text-left font-medium`}>{r.nama}</td>
                                {r.nilai.map((n, j) => <td key={j} className={td}>{n}</td>)}
                                {denganJumlah && <td className={`${td} font-semibold`}>{jumlah(r)}</td>}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-50">
                        <tr>
                            <td colSpan={2} className={`${td} text-left font-bold`}>Jumlah</td>
                            {total.nilai.map((n, j) => <td key={j} className={`${td} font-bold`}>{n}</td>)}
                            {denganJumlah && <td className={`${td} font-bold`}>{jumlah(total)}</td>}
                        </tr>
                    </tfoot>
                </table>
                {catatan && <p className="mt-3 text-xs text-slate-500">{catatan}</p>}
            </div>
        </div>
    );
}

function indeksJenjang(d: Instruktur, kolom: Kolom[]) {
    const jenjang = (d.jenjang_jabatan || "").toLowerCase();
    return kolom.findIndex((k) => k.kunci.some((kunci) => jenjang.includes(kunci)));
}

/**
 * Pelatih yang jenjangnya kosong atau di luar daftar masuk kolom "Lainnya",
 * agar kolom Jumlah tetap sama dengan tabel sebaran di atasnya.
 */
function TabelJenjang({ judul, kategori, kolom, ...props }: Props & {
    judul: string;
    kategori: "widyaiswara" | "instruktur";
    kolom: Kolom[];
}) {
    const { rows, total } = useRekap(props, kolom.length + 1, (d) => {
        if (kategoriPelatih(d) !== kategori) return -1;
        const i = indeksJenjang(d, kolom);
        return i === -1 ? kolom.length : i;
    });
    const adaLainnya = total.nilai[kolom.length] > 0;
    const potong = (b: Baris) => (adaLainnya ? b : { ...b, nilai: b.nilai.slice(0, kolom.length) });

    return (
        <TabelRekap
            judul={judul}
            grup={[{
                label: `Jenjang Jabatan Fungsional ${kategori === "widyaiswara" ? "Widyaiswara" : "Instruktur"}`,
                span: kolom.length + (adaLainnya ? 1 : 0),
            }]}
            kolom={[...kolom.map((k) => k.label), ...(adaLainnya ? ["Lainnya"] : [])]}
            rows={rows.map(potong)}
            total={potong(total)}
            denganJumlah
        />
    );
}

/** "Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Ambon" -> "BPPP Ambon". */
function singkatSatker(nama: string) {
    if (/^pusat pelatihan kelautan dan perikanan$/i.test(nama.trim())) return "Puslat KP";
    return nama.replace(/^.*\((\w+)\)\s*/, "$1 ").trim();
}

/**
 * Baris per bidang keahlian, kolom per satuan kerja. Isian bidang keahlian
 * diketik bebas, jadi baris diambil apa adanya dari data (hanya dirapikan
 * spasi dan huruf besar-kecilnya), bukan dari daftar tetap.
 */
function TabelBidangKeahlian({ data, unitKerjas }: Props) {
    const { satker, perKategori } = useMemo(() => {
        const namaUnit = new Map(unitKerjas.map((uk) => [String(uk.id_unit_kerja), uk.nama]));
        const ids = Array.from(new Set(data.map((d) => String(d.id_lemdik ?? ""))));
        const satker = ids
            .map((id) => ({ id, nama: namaUnit.get(id) || `Unit ${id || "-"}` }))
            .sort((a, b) => urutan(a.nama) - urutan(b.nama) || a.nama.localeCompare(b.nama));
        const kolomUnit = new Map(satker.map((s, i) => [s.id, i]));

        const rekap = (kategori: "widyaiswara" | "instruktur") => {
            const perBidang = new Map<string, Baris>();
            const total: Baris = { nama: "Jumlah", nilai: Array(satker.length).fill(0) };
            data.forEach((d) => {
                if (kategoriPelatih(d) !== kategori) return;
                const nama = (d.bidang_keahlian || "").trim().replace(/\s+/g, " ") || "Belum diisi";
                const kunci = nama.toLowerCase();
                let baris = perBidang.get(kunci);
                if (!baris) {
                    baris = { nama, nilai: Array(satker.length).fill(0) };
                    perBidang.set(kunci, baris);
                }
                const k = kolomUnit.get(String(d.id_lemdik ?? ""))!;
                baris.nilai[k]++;
                total.nilai[k]++;
            });
            const rows = Array.from(perBidang.values()).sort(
                (a, b) =>
                    Number(a.nama === "Belum diisi") - Number(b.nama === "Belum diisi") ||
                    a.nama.localeCompare(b.nama),
            );
            return { rows, total };
        };

        return {
            satker: satker.map((s) => singkatSatker(s.nama)),
            perKategori: { widyaiswara: rekap("widyaiswara"), instruktur: rekap("instruktur") },
        };
    }, [data, unitKerjas]);

    return (
        <>
            <TabelRekap
                judul="A. Widyaiswara Menurut Bidang Keahlian"
                labelBaris="Bidang Keahlian"
                grup={[{ label: "Satuan Kerja", span: satker.length }]}
                kolom={satker}
                {...perKategori.widyaiswara}
                denganJumlah
            />
            <TabelRekap
                judul="B. Instruktur Menurut Bidang Keahlian"
                labelBaris="Bidang Keahlian"
                grup={[{ label: "Satuan Kerja", span: satker.length }]}
                kolom={satker}
                {...perKategori.instruktur}
                denganJumlah
            />
        </>
    );
}

const JENIS_KELAMIN_KOLOM = ["laki-laki", "perempuan"];

/**
 * Per kategori: L, P, lalu Jumlah seluruh pelatih kategori itu. Jenis kelamin
 * yang belum diisi tetap ikut Jumlah agar sama dengan tabel sebaran, sehingga
 * L + P bisa lebih kecil dari Jumlah.
 */
function TabelJenisKelamin(props: Props) {
    const { rows, total } = useRekap(props, 6, (d) => {
        const k = kategoriPelatih(d);
        if (k !== "widyaiswara" && k !== "instruktur") return [];
        const awal = k === "widyaiswara" ? 0 : 3;
        const jk = JENIS_KELAMIN_KOLOM.indexOf((d.jenis_kelamin || "").trim().toLowerCase());
        return jk === -1 ? [awal + 2] : [awal + jk, awal + 2];
    });
    const [wL, wP, wJ, iL, iP, iJ] = total.nilai;
    const adaKosong = wL + wP < wJ || iL + iP < iJ;

    return (
        <TabelRekap
            judul="Widyaiswara dan Instruktur Menurut Jenis Kelamin"
            grup={[
                { label: "Widyaiswara", span: 3 },
                { label: "Instruktur", span: 3 },
            ]}
            kolom={["L", "P", "Jumlah", "L", "P", "Jumlah"]}
            rows={rows}
            total={total}
            catatan={adaKosong ? "Sebagian pelatih belum mengisi jenis kelamin, sehingga L + P lebih kecil dari Jumlah." : undefined}
        />
    );
}

export default function TableSebaranPelatih(props: Props) {
    const { rows, total } = useRekap(props, 2, (d) => {
        const k = kategoriPelatih(d);
        return k === "widyaiswara" ? 0 : k === "instruktur" ? 1 : -1;
    });

    return (
        <div className="flex flex-col gap-6">
            <TabelRekap
                judul="Sebaran Widyaiswara dan Instruktur per Satuan Kerja"
                kolom={["Widyaiswara", "Instruktur"]}
                rows={rows}
                total={total}
            />
            <TabelJenjang
                {...props}
                judul="A. Widyaiswara per Jenjang Jabatan"
                kategori="widyaiswara"
                kolom={JENJANG_WIDYAISWARA}
            />
            <TabelJenjang
                {...props}
                judul="B. Instruktur per Jenjang Jabatan"
                kategori="instruktur"
                kolom={JENJANG_INSTRUKTUR}
            />
            <TabelBidangKeahlian {...props} />
            <TabelJenisKelamin {...props} />
        </div>
    );
}
