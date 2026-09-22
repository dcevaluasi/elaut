"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import LayoutAdminElaut from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { User, UserPelatihan } from "@/types/user";
import { elautBaseUrl } from "@/constants/urls";
import EditPesertaAction from "@/commons/actions/EditPesertaAction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TbArrowLeft,
  TbUser,
  TbId,
  TbMail,
  TbPhone,
  TbMapPin,
  TbSchool,
  TbBuilding,
  TbCalendar,
  TbGenderMale,
  TbGenderFemale,
  TbFileText,
  TbDownload,
  TbCertificate,
  TbRefresh,
  TbShieldCheck,
  TbCreditCard,
  TbHeart,
  TbExternalLink,
} from "react-icons/tb";
import { motion } from "framer-motion";
import Link from "next/link";
import Toast from "@/commons/Toast";

export default function DetailPesertaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetailPeserta = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch detail user by ID
      const response = await axios.get(
        `${elautBaseUrl}/users/getUsersByIdNoJwt?id=${id}`,
        {
          headers: {
            "x-api-key": "EL@uTs3rv3R",
            Authorization: `Bearer ${Cookies.get("XSRF091") || Cookies.get("XSRF081")}`,
          },
        }
      );

      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching detail user:", error);
      Toast.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: "Tidak dapat mengambil rincian data peserta.",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetailPeserta();
  }, [fetchDetailPeserta]);

  const handleBack = () => {
    router.back();
  };

  const InfoCard = ({
    icon: Icon,
    label,
    value,
    color = "blue",
  }: {
    icon: any;
    label: string;
    value?: string | number | null;
    color?: string;
  }) => {
    const colorStyles: Record<string, string> = {
      blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      indigo: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
      rose: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
      amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    };

    return (
      <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-start gap-4 shadow-sm">
        <div className={`p-3 rounded-xl ${colorStyles[color] || colorStyles.blue} shrink-0 text-xl`}>
          <Icon />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {value !== undefined && value !== null && value !== "" ? value.toString() : "-"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <LayoutAdminElaut>
      <div className="space-y-8 pb-20">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-12 w-12 rounded-2xl border-slate-200 dark:border-slate-800 p-0 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm"
              title="Kembali ke Master Peserta"
            >
              <TbArrowLeft className="text-xl" />
            </Button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Rincian Profil Peserta
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Detail lengkap data pribadi, dokumen digital, dan riwayat pelatihan peserta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchDetailPeserta}
              className="h-12 px-4 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-600 hover:text-blue-600 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <TbRefresh className={`text-lg ${loading ? "animate-spin text-blue-600" : ""}`} />
              <span>Refresh</span>
            </Button>

            {user && (
              <EditPesertaAction
                idPeserta={user.IdUsers.toString()}
                onSuccess={fetchDetailPeserta}
              />
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-28 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Detail Peserta...</p>
          </div>
        ) : !user ? (
          <div className="py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl text-center space-y-4">
            <TbUser className="text-5xl text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">Data peserta tidak ditemukan.</p>
            <Button onClick={handleBack} className="rounded-2xl bg-blue-600 text-white font-bold text-xs px-6">
              Kembali ke Master Peserta
            </Button>
          </div>
        ) : (
          <>
            {/* Top Profile Card */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                {/* Photo Avatar */}
                <div className="relative group">
                  {user.Foto && user.Foto !== "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/" ? (
                    <img
                      src={user.Foto}
                      alt={user.Nama}
                      className="w-28 h-28 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-xl"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  {(!user.Foto || user.Foto === "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/") && (
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-blue-500/20">
                      {user.Nama ? user.Nama.charAt(0).toUpperCase() : "P"}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-3">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      {user.Nama || "Nama Tidak Terdaftar"}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      {user.Status || user.Instansi || "Masyarakat Umum"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                    <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-none font-bold text-xs px-3 py-1 flex items-center gap-1.5">
                      <TbId className="text-sm" />
                      <span>NIK: {user.Nik || "-"}</span>
                    </Badge>

                    <Badge
                      className={`border-none font-bold text-xs px-3 py-1 flex items-center gap-1.5 ${
                        user.JenisKelamin === "L" || user.JenisKelamin === "Laki-Laki"
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {user.JenisKelamin === "L" || user.JenisKelamin === "Laki-Laki" ? (
                        <>
                          <TbGenderMale className="text-sm" />
                          <span>Laki-Laki</span>
                        </>
                      ) : (
                        <>
                          <TbGenderFemale className="text-sm" />
                          <span>Perempuan</span>
                        </>
                      )}
                    </Badge>

                    <Badge className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-none font-bold text-xs px-3 py-1 flex items-center gap-1.5">
                      <TbSchool className="text-sm" />
                      <span>{user.PendidikanTerakhir || "Pendidikan -"}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="profil" className="w-full space-y-6">
              <TabsList className="h-14 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md grid grid-cols-2 md:grid-cols-4 gap-1">
                <TabsTrigger
                  value="profil"
                  className="rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                >
                  Profil & Kontak
                </TabsTrigger>
                <TabsTrigger
                  value="pendidikan"
                  className="rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                >
                  Pendidikan & Status
                </TabsTrigger>
                <TabsTrigger
                  value="dokumen"
                  className="rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                >
                  Dokumen Digital
                </TabsTrigger>
                <TabsTrigger
                  value="pelatihan"
                  className="rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                >
                  Riwayat Pelatihan ({user.Pelatihan?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: PROFIL & KONTAK */}
              <TabsContent value="profil" className="space-y-6 outline-none">
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Informasi Identitas & Kontak
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InfoCard icon={TbUser} label="Nama Lengkap" value={user.Nama} color="blue" />
                    <InfoCard icon={TbId} label="NIK" value={user.Nik} color="blue" />
                    <InfoCard
                      icon={user.JenisKelamin === "L" || user.JenisKelamin === "Laki-Laki" ? TbGenderMale : TbGenderFemale}
                      label="Jenis Kelamin"
                      value={user.JenisKelamin === "L" || user.JenisKelamin === "Laki-Laki" ? "Laki-Laki" : user.JenisKelamin === "P" || user.JenisKelamin === "Perempuan" ? "Perempuan" : user.JenisKelamin}
                      color="indigo"
                    />
                    <InfoCard icon={TbCalendar} label="Tempat Lahir" value={user.TempatLahir} color="indigo" />
                    <InfoCard icon={TbCalendar} label="Tanggal Lahir" value={user.TanggalLahir} color="indigo" />
                    <InfoCard icon={TbHeart} label="Agama" value={user.Agama} color="amber" />
                    <InfoCard icon={TbUser} label="Status Pernikahan" value={user.StatusMenikah} color="amber" />
                    <InfoCard icon={TbUser} label="Golongan Darah" value={user.GolonganDarah} color="amber" />
                    <InfoCard icon={TbUser} label="Kewarganegaraan" value={user.Kewarganegaraan} color="amber" />
                    <InfoCard icon={TbUser} label="Ibu Kandung" value={user.IbuKandung} color="rose" />
                    <InfoCard icon={TbMail} label="Email" value={user.Email} color="emerald" />
                    <InfoCard icon={TbPhone} label="Nomor Telepon/WA" value={user.NoTelpon} color="emerald" />
                    <InfoCard icon={TbMapPin} label="Provinsi" value={user.Provinsi} color="emerald" />
                    <InfoCard icon={TbMapPin} label="Kota / Kabupaten" value={user.Kota} color="emerald" />
                    <InfoCard icon={TbMapPin} label="Alamat Lengkap" value={user.Alamat} color="emerald" />
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: PENDIDIKAN & STATUS */}
              <TabsContent value="pendidikan" className="space-y-6 outline-none">
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    Pendidikan & Latar Belakang
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InfoCard icon={TbSchool} label="Pendidikan Terakhir" value={user.PendidikanTerakhir} color="blue" />
                    <InfoCard icon={TbBuilding} label="Instansi / Institusi / Status" value={user.Status || user.Instansi} color="indigo" />
                    <InfoCard icon={TbBuilding} label="Pekerjaan Utama" value={user.Pekerjaan} color="indigo" />
                    <InfoCard icon={TbBuilding} label="Negara Tujuan Bekerja" value={user.NegaraTujuanBekerja} color="emerald" />
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: DOKUMEN DIGITAL */}
              <TabsContent value="dokumen" className="space-y-6 outline-none">
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    Vault Dokumen Digital Peserta
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pas Foto */}
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-2xl">
                          <TbFileText />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">Pas Foto Resmi</p>
                          <p className="text-xs text-slate-400 font-medium">Format Gambar Profile</p>
                        </div>
                      </div>
                      {user.Foto && user.Foto !== "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/" ? (
                        <Link target="_blank" href={user.Foto}>
                          <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2">
                            <TbDownload />
                            <span>Lihat</span>
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Belum Ada</span>
                      )}
                    </div>

                    {/* Scan KTP */}
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center text-2xl">
                          <TbId />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">Scan Kartu Identitas (KTP)</p>
                          <p className="text-xs text-slate-400 font-medium">Berkas KTP Terverifikasi</p>
                        </div>
                      </div>
                      {user.Ktp ? (
                        <Link target="_blank" href={user.Ktp}>
                          <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2">
                            <TbDownload />
                            <span>Lihat</span>
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Belum Ada</span>
                      )}
                    </div>

                    {/* Kartu Keluarga */}
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center text-2xl">
                          <TbFileText />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">Kartu Keluarga (KK)</p>
                          <p className="text-xs text-slate-400 font-medium">Berkas KK Peserta</p>
                        </div>
                      </div>
                      {user.KK ? (
                        <Link target="_blank" href={user.KK}>
                          <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2">
                            <TbDownload />
                            <span>Lihat</span>
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Belum Ada</span>
                      )}
                    </div>

                    {/* Surat Kesehatan */}
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center text-2xl">
                          <TbHeart />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">Surat Kesehatan</p>
                          <p className="text-xs text-slate-400 font-medium">Keterangan Sehat Dokter</p>
                        </div>
                      </div>
                      {user.SuratKesehatan ? (
                        <Link target="_blank" href={user.SuratKesehatan}>
                          <Button size="sm" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2">
                            <TbDownload />
                            <span>Lihat</span>
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Belum Ada</span>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: RIWAYAT PELATIHAN */}
              <TabsContent value="pelatihan" className="space-y-6 outline-none">
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    Riwayat Pelatihan Terdaftar ({user.Pelatihan?.length || 0})
                  </h3>

                  {!user.Pelatihan || user.Pelatihan.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <TbCertificate className="text-4xl mx-auto text-slate-300" />
                      <p className="text-sm font-bold">Peserta belum memiliki riwayat pelatihan terdaftar.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="py-3 px-4">Nama Pelatihan</th>
                            <th className="py-3 px-4">Penyelenggara</th>
                            <th className="py-3 px-4">No Registrasi</th>
                            <th className="py-3 px-4">No Sertifikat</th>
                            <th className="py-3 px-4 text-center">Status Aproval</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {user.Pelatihan.map((p, idx) => (
                            <tr key={p.IdUserPelatihan || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{p.NamaPelatihan || "-"}</td>
                              <td className="py-4 px-4 text-slate-600 dark:text-slate-300">{p.PenyelenggaraPelatihan || "-"}</td>
                              <td className="py-4 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{p.NoRegistrasi || "-"}</td>
                              <td className="py-4 px-4 font-mono text-blue-600 font-bold">{p.NoSertifikat || "-"}</td>
                              <td className="py-4 px-4 text-center">
                                <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] uppercase">
                                  {p.StatusAproval || "Terdaftar"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </LayoutAdminElaut>
  );
}
