"use client";

import React from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { HiUserGroup } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { P2MKP } from "@/types/p2mkp";
import { TbCertificate, TbLayoutGrid, TbUsers, TbBuildingSkyscraper, TbPrinter, TbChartBar } from "react-icons/tb";
import { Accordion } from "@/components/ui/accordion";
import AccordionSection from "@/components/reusables/AccordionSection";
import { motion } from "framer-motion";
import Link from "next/link";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useParams } from "next/navigation";

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
        bidang_pelatihan: "Budidaya Ikan Nila Sistem Bioflok, RAS, aquaponik dan Biorasponik",
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

const MetricCard = ({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) => {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/10",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10",
        amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/10",
        slate: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:border-slate-700",
        rose: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/10",
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`flex flex-col p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group overflow-hidden relative`}
        >
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-slate-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1 leading-none">{label}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center text-2xl border group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
};

export default function Page() {
    const totalP2MKP = DUMMY_DATA_P2MKP.length;
    const totalProvinces = new Set(DUMMY_DATA_P2MKP.map(p => p.provinsi)).size;
    const totalVerified = DUMMY_DATA_P2MKP.length; // Assuming all dummy data are verified for now

    const params = useParams();
    const random_id = params.random_id;
    const role = params.role;

    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut
                    title="Penetapan dan Klasifikasi P2MKP"
                    description="Monitoring dan Kelola Pengajuan Penetapan dan Klasifikasi Calon Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)"
                    icon={<HiUserGroup className="text-3xl" />}
                />

                <article className="w-full h-full p-4 overflow-auto pb-20 space-y-10">
                    <Accordion
                        type="multiple"
                        className="w-full space-y-10"
                        defaultValue={["statistik", "daftar_p2mkp"]}
                    >
                        {/* Statistics Section */}
                        <AccordionSection
                            value="statistik"
                            title="Statistik & Sebaran P2MKP"
                            icon={<TbChartBar className="text-blue-600" />}
                            description="Ringkasan data sebaran P2MKP, P2MKP terget, dan total provinsi se-Indonesia"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <MetricCard label="Total P2MKP" value={totalP2MKP.toString()} color="blue" icon={<TbBuildingSkyscraper />} />
                                <MetricCard label="Provinsi" value={totalProvinces.toString()} color="slate" icon={<TbLayoutGrid />} />
                                <MetricCard label="Terverifikasi" value={totalVerified.toString()} color="emerald" icon={<RiVerifiedBadgeFill />} />
                                <MetricCard label="Target Tahunan" value="50" color="amber" icon={<TbUsers />} />
                            </div>
                        </AccordionSection>

                        {/* List Data Section */}
                        <AccordionSection
                            value="daftar_p2mkp"
                            title="Daftar P2MKP Terdaftar & Penerbitan Sertifikat"
                            icon={<TbCertificate className="text-rose-600" />}
                            description="Kelola data P2MKP, pantau klasifikasi, dan cetak sertifikat penetapan digital."
                        >
                            <div className="flex flex-col w-full gap-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600">
                                            <TbLayoutGrid className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Data Tabel P2MKP</h4>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            className="h-10 flex items-center gap-2 rounded-xl px-4 shadow-sm transition-all border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <TbPrinter className="h-4 w-4" />
                                            <span>Export Data</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="relative group/table bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-blue-500/5 p-2">
                                    <div className="grid gap-4 p-4">
                                        {DUMMY_DATA_P2MKP.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-all shadow-sm group hover:bg-slate-50/50"
                                            >
                                                <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 text-xs shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight truncate">{item.nama_Ppmkp}</p>
                                                            {item.klasiikasi && (
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.klasiikasi === "MANDIRI" ? "bg-emerald-100 text-emerald-700" :
                                                                    item.klasiikasi === "MADYA" ? "bg-blue-100 text-blue-700" :
                                                                        "bg-slate-100 text-slate-700"
                                                                    }`}>
                                                                    {item.klasiikasi}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 font-medium tracking-wide truncate max-w-md">
                                                            {item.alamat}, {item.kota}, {item.provinsi}
                                                        </p>
                                                        <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                            <span className="flex items-center gap-1">
                                                                <TbUsers className="h-3 w-3" />
                                                                {item.nama_penanggung_jawab}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                            <span>{item.no_telp?.split('/')[0]}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 md:mt-0 flex items-center gap-3 w-full md:w-auto justify-end">
                                                    <Link href={`/${random_id}/${role}/p2mkp/penetapan-klasifikasi/${item.IdPpmkp}`}>
                                                        <Button
                                                            size="sm"
                                                            className="h-9 gap-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100 shadow-none font-bold uppercase tracking-wider text-[10px]"
                                                        >
                                                            <TbCertificate className="text-sm" />
                                                            Lihat Sertifikat
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </AccordionSection>
                    </Accordion>
                </article>
            </section>
        </LayoutAdminElaut>
    );
}
