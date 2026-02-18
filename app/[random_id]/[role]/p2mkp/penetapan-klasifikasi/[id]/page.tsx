"use client";

import React, { useRef } from "react";
import SertifikatP2MKP from "@/components/sertifikat/dialogSertifikatP2MKP";
import { P2MKP } from "@/types/p2mkp";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { TbPrinter, TbArrowLeft } from "react-icons/tb";
import Link from "next/link";
import { useParams } from "next/navigation";

// Reuse dummy data for now
const DUMMY_DATA_P2MKP: Partial<P2MKP>[] = [
    {
        IdPpmkp: 1,
        nama_Ppmkp: "Mattiro Deceng",
        alamat: "Jalan Sipakatuo",
        kelurahan: "Desa Pitusung",
        kecamatan: "Kecamatan Ma'rang",
        kota: "Kabupaten Pangkajene dan Kepulauan",
        provinsi: "Sulawesi Selatan",
        bidang_pelatihan: "Budidaya rumput laut : Teknis budidaya rumput laut",
        nama_penanggung_jawab: "Abd Rakib Dg Gama",
        no_telp: "0401-2317117 / 0815255906599",
        nib: "9120301931231",
        tahun_penetapan: "2025",
        klasiikasi: "MADYA"
    },
    {
        IdPpmkp: 2,
        nama_Ppmkp: "Sipatuwo Sipatokkong",
        alamat: "Jalan Lommo Kasse",
        kelurahan: "Desa Pitusunggu",
        kecamatan: "Kecamatan Ma'rang",
        kota: "Kabupaten Pangkajene dan Kepulauan",
        provinsi: "Sulawesi Selatan",
        bidang_pelatihan: "Pengolahan hasil perikanan",
        nama_penanggung_jawab: "Nurhidayah, S.Pd",
        no_telp: "085394566187",
        nib: "9120385731232",
        tahun_penetapan: "2025",
        klasiikasi: "PEMULA"
    },
    {
        IdPpmkp: 3,
        nama_Ppmkp: "CV Mizumi Koi Farm",
        alamat: "Jalan Pasir Datar, Dusun Cisitu RT/RW 16/06",
        kelurahan: "Desa Sukamulya",
        kecamatan: "Kecamatan caringin",
        kota: "Sukabumi",
        provinsi: "Jawa Barat",
        kode_pos: "45154",
        bidang_pelatihan: "Budidaya ikan hias koi",
        nama_penanggung_jawab: "Asep Syamsul Munawar",
        no_telp: "081563368448",
        nib: "8120394751233",
        tahun_penetapan: "2025",
        klasiikasi: "MANDIRI"
    },
    {
        IdPpmkp: 4,
        nama_Ppmkp: "Flamboyan",
        alamat: "Jalan Taman Pendidikan, RT/RW 002/001",
        kelurahan: "Desa Moodu",
        kecamatan: "Kecamatan Kota Timur",
        kota: "Gorontalo",
        provinsi: "Gorontalo",
        kode_pos: "96113",
        bidang_pelatihan: "Pengolahan hasil perikanan dan pertanian : abon ikan, acar ikan, bandeng presto ,nugget, bakso ikan, nike crispy, aneka sambal roa, udang,teri",
        nama_penanggung_jawab: "Sonya Yahya, S.Pd",
        no_telp: "085342831080",
        nib: "9120312341234",
        tahun_penetapan: "2025",
        klasiikasi: "PEMULA"
    },
    {
        IdPpmkp: 5,
        nama_Ppmkp: "Dapur Chef@home",
        alamat: "Jalan AMD Perum Cendana Rasaindo Blok C4",
        kelurahan: "Kelurahan Liluwo",
        kecamatan: "Kecamatan Kota Tengah",
        kota: "Gorontalo",
        provinsi: "Gorontalo",
        bidang_pelatihan: "Pengolahan hasil perikanan : Cakalang Rica, Tuna Suwir, Cumi Goreng Pedas manis, nike goreng renyah, sambal roa, sambal ikan asin",
        nama_penanggung_jawab: "Nila Amak",
        no_telp: "08124526665",
        nib: "9120356781235",
        tahun_penetapan: "2025",
        klasiikasi: "MADYA"
    },
    {
        IdPpmkp: 6,
        nama_Ppmkp: "Usaha Kreatif Mandiri",
        alamat: "Jalan Sumberboto Dusun Japanan RT/RW 08/08",
        kelurahan: "Desa Japanan",
        kecamatan: "Kec. Mojowarno",
        kota: "Jombang",
        provinsi: "Jawa Timur",
        bidang_pelatihan: "Produksi Abon Ikan Lele, Kerupuk Kulit Lele dan Frozen",
        nama_penanggung_jawab: "Muhamad Yajid",
        no_telp: "081252855203",
        nib: "9120378901236",
        tahun_penetapan: "2025",
        klasiikasi: "PEMULA"
    },
    {
        IdPpmkp: 7,
        nama_Ppmkp: "Kawungsari",
        alamat: "Jalan Cibanten, Dusun Bantarkawung RT/RW 02/07",
        kelurahan: "Desa Kertayasa",
        kecamatan: "Kecamatan Cijulang",
        kota: "Pangandaran",
        provinsi: "Jawa Barat",
        kode_pos: "46394",
        bidang_pelatihan: "Budiaya Ikan Gurame : Seleksi Induk, Pemeliharaan Larva, Pendederan, Pemijahan, Pembesaran",
        nama_penanggung_jawab: "Cholil Rahman, S,Pi",
        no_telp: "0852881543044",
        nib: "9120310291237",
        tahun_penetapan: "2025",
        klasiikasi: "PEMULA"
    },
    {
        IdPpmkp: 8,
        nama_Ppmkp: "Olivia Fish Farm",
        alamat: "Jalan Mawar II RT/RW 013/004",
        kelurahan: "Desa Manjung",
        kecamatan: "Kecamatan Barat",
        kota: "Magetan",
        provinsi: "Jawa Timur",
        kode_pos: "63395",
        bidang_pelatihan: "Pembesaran dan Pengolahan Ikan Sidat",
        nama_penanggung_jawab: "MCH. Agung Ayu Bintang",
        no_telp: "081288850129",
        nib: "9120334561238",
        tahun_penetapan: "2025",
        klasiikasi: "MADYA"
    },
    {
        IdPpmkp: 9,
        nama_Ppmkp: "Syukur Makmur",
        alamat: "Jalan Kaligondang No. 179 Duusn Kaligondang RT/RW 001/002",
        kelurahan: "Kaligondang",
        kecamatan: "Kaligondang",
        kota: "Purbalingga",
        provinsi: "Jawa Tengah",
        kode_pos: "53391",
        bidang_pelatihan: "Pembuatan Pakan Ikan",
        nama_penanggung_jawab: "Ghofur Wahyudiono",
        no_telp: "087737077402",
        nib: "9120367891239",
        tahun_penetapan: "2025",
        klasiikasi: "PEMULA"
    },
    {
        IdPpmkp: 10,
        nama_Ppmkp: "Satria Mina Daya",
        alamat: "Jalan Pangebonan RT/RW 001/009",
        kelurahan: "Desa Ciapku",
        kecamatan: "Kecamatan Mrebet",
        kota: "Purbalingga",
        provinsi: "Jawa Tengah",
        kode_pos: "53352",
        bidang_pelatihan: "Budidaya Ikan Nila sistem Bioflok; Intensif, Sistem Kocor",
        nama_penanggung_jawab: "Dewa Ayu Nabila Sarastri",
        no_telp: "085647770203 (Priya)",
        nib: "9120301231240",
        tahun_penetapan: "2025",
        klasiikasi: "MANDIRI"
    },
    {
        IdPpmkp: 11,
        nama_Ppmkp: "Koperasi Agar Makmur Sentosa",
        alamat: "Dusun Tlocor RT/RW 15/05",
        kelurahan: "Desa Kedungpandan",
        kecamatan: "Kec. Jabon",
        kota: "Kab Sidoarjo",
        provinsi: "Jawa Timur",
        kode_pos: "61276",
        bidang_pelatihan: "Budidaya rumput laut glasilaria, Pengolahan, Pelatihan Penyusunan dokumen penerbitan SKP rumput laut, penyusunan dokumen HACCP dan penerapannya",
        nama_penanggung_jawab: "Ir. Adi Suseno, M.Si",
        no_telp: "081231115587",
        nib: "9120345671241",
        tahun_penetapan: "2025",
        klasiikasi: "MADYA"
    },
    {
        IdPpmkp: 12,
        nama_Ppmkp: "Yayasan Pelita Insan Al-Musthafawiyah",
        alamat: "I. Raya Pengasinan RT/005 RW/003",
        kelurahan: "Kel. Pengasinan",
        kecamatan: "Kec. Sawangan",
        kota: "Kota Depok",
        provinsi: "Jawa Barat",
        bidang_pelatihan: "Budidaya Ikan Air Tawar (Ikan Konsumsi)",
        nama_penanggung_jawab: "Randy Louiz Loren S.Pd., M.Tr.Pi",
        no_telp: "089630051005",
        nib: "9120389011242",
        tahun_penetapan: "2025",
        klasiikasi: "PEMULA"
    },
    {
        IdPpmkp: 13,
        nama_Ppmkp: "Yayasan Wangsa Syahitu Dewantara",
        alamat: "l. Kulur - Cieurih Dusun Beledug Girang RT/RW05/02",
        kelurahan: "Desa Kulur",
        kecamatan: "Kec. Majalengka",
        kota: "Kab. Majalengka",
        provinsi: "Jawa Barat",
        kode_pos: "45411",
        bidang_pelatihan: "Budidaya Ikan Air Tawar (Pembenihan)",
        nama_penanggung_jawab: "Megnam Mara",
        no_telp: "0878 4644 5515",
        nib: "9120323451243",
        tahun_penetapan: "2025",
        klasiikasi: "PEMULA"
    },
    {
        IdPpmkp: 14,
        nama_Ppmkp: "Raja Nila",
        alamat: "Jalan Kiwi no.68",
        kelurahan: "Kel. Sei Sikambing",
        kecamatan: "Kec. Medan Sunggal",
        kota: "Kota Medan",
        provinsi: "Sumatera Utara",
        kode_pos: "20122",
        bidang_pelatihan: "Budidaya Ikan Air Tawar (pembesaran)",
        nama_penanggung_jawab: "Berlin Amto Gulo, SH",
        no_telp: "08196044449",
        nib: "9120367891244",
        tahun_penetapan: "2025",
        klasiikasi: "MADYA"
    },
    {
        IdPpmkp: 15,
        nama_Ppmkp: "Rancage Mina Montekar",
        alamat: "Jl. Raya Wado - Krisik Dusun Cipari RT/RW 02/06",
        kelurahan: "Desa Pasirpadang",
        kecamatan: "Kec. Jatinunggal",
        kota: "Kab. Sumedang",
        provinsi: "Jawa Barat",
        kode_pos: "45376",
        bidang_pelatihan: "Pembenihan, Budidaya, Pembuatan Pakan, dan Pengolahan Hasil Perikanan",
        nama_penanggung_jawab: "D. Dasman Maiman",
        no_telp: "082118019731",
        nib: "9120301231245",
        tahun_penetapan: "2025",
        klasiikasi: "PEMULA"
    },
    {
        IdPpmkp: 16,
        nama_Ppmkp: "Mina B Agribisnis",
        alamat: "l. Kapten Yusuf, Komplek Mina Bhakti RT.006 RW.003",
        kelurahan: "Kelurahan Cikaret",
        kecamatan: "Kecamatan Bogor Selatan",
        kota: "Kota Bogor",
        provinsi: "Jawa Barat",
        kode_pos: "16132",
        bidang_pelatihan: "Pelatihan Budidaya Ikan Air Tawar",
        nama_penanggung_jawab: "Widia Muhtar",
        no_telp: "0856 7081 991",
        nib: "9120345671246",
        tahun_penetapan: "2025",
        klasiikasi: "PEMULA"
    },
    {
        IdPpmkp: 17,
        nama_Ppmkp: "Kebun Nila Organik",
        alamat: "Dukuh Karangnongko Rt/Rw 012",
        kelurahan: "Desa Pungsari",
        kecamatan: "Kecamatan Plupuh",
        kota: "Kabupaten Sragen",
        provinsi: "Jawa Tengah",
        kode_pos: "57283",
        bidang_pelatihan: "Budidaya Ikan Nila Sistem Bioflok, RAS, aquaponik and Biorasponik",
        nama_penanggung_jawab: "Rony Budiono",
        no_telp: "081130002777",
        nib: "9120389011247",
        tahun_penetapan: "2025",
        klasiikasi: "MADYA"
    },
    {
        IdPpmkp: 18,
        nama_Ppmkp: "KWT NGUDI MULYO",
        alamat: "Jalan Jongkangan , Dusun Jongkangan",
        kelurahan: "Desa Tanjungsari",
        kecamatan: "Kecamatan Ban5rudono",
        kota: "Kabupaten Boyolali",
        provinsi: "Jawa Tenlah",
        kode_pos: "57373",
        bidang_pelatihan: "Pengolatran dan Pemasaran Hasil Perikanan (Lele)",
        nama_penanggung_jawab: "Eka Supriyatin S.M",
        no_telp: "62 822-2313-4370",
        nib: "9120323451248",
        tahun_penetapan: "2025",
        klasiikasi: "PEMULA"
    },
];

export default function CertificatePage() {
    const params = useParams();
    const id = params.id as string;
    const random_id = params.random_id as string;
    const role = params.role as string;

    const p2mkp = DUMMY_DATA_P2MKP.find((item) => item.IdPpmkp === parseInt(id));

    const componentRef = useRef<any>(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Sertifikat-P2MKP-${p2mkp?.nama_Ppmkp}`,
    });

    if (!p2mkp) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white italic">
                P2MKP not found...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 flex flex-col items-center">
            {/* Header Controls */}
            <header className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 print:hidden">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href={`/${random_id}/${role}/p2mkp/penetapan-klasifikasi`}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
                    >
                        <TbArrowLeft className="text-xl" />
                        Back to List
                    </Link>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handlePrint}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <TbPrinter className="text-lg" />
                            Print Certificate
                        </Button>
                    </div>
                </div>
            </header>

            {/* Certificate Container */}
            <div className="w-full flex flex-col items-center">
                <div className="w-full">
                    <SertifikatP2MKP
                        ref={componentRef}
                        p2mkp={p2mkp as P2MKP}
                    />
                </div>
            </div>

            {/* Footer / Helper Text */}
            <footer className="w-full text-center p-10 text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] print:hidden">
                E-LAUT Certification System &copy; 2025BPPSDM KP
            </footer>
        </main>
    );
}
