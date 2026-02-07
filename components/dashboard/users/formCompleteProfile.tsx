"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { HashLoader } from "react-spinners";
import Toast from "@/commons/Toast";
import {
  FiUser,
  FiMapPin,
  FiFileText,
  FiBriefcase,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiUploadCloud,
  FiShield,
  FiCamera,
  FiPhone,
  FiMail
} from "react-icons/fi";
import { TbUserEdit, TbMapPinSearch, TbFileStack } from "react-icons/tb";
import { MdWorkOutline, MdCheckCircle } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { User } from "@/types/user";
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, MIN_FILE_SIZE } from "@/utils/file";
import { SATUAN_PENDIDIKAN_KEAHLIAN } from "@/constants/pelatihan";
import { KABUPATENS, PROVINCES } from "@/constants/regions";
import { truncateText } from "@/utils";
import { capitalize } from "@/utils/text";

export default function FormCompleteProfile() {
  const router = useRouter();
  const pathname = usePathname();
  const token = Cookies.get("XSRF081");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const [indexFormTab, setIndexFormTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDetail, setUserDetail] = useState<User | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [agama, setAgama] = useState("");
  const [pekerjaan, setPekerjaan] = useState("");
  const [golonganDarah, setGolonganDarah] = useState("");
  const [statusMenikah, setStatusMenikah] = useState("");
  const [pendidikanTerakhir, setPendidikanTerakhir] = useState("");
  const [kewarganegaraan, setKewarganegaraan] = useState("");
  const [ibuKandung, setIbuKandung] = useState("");
  const [negaraTujuanBekerja, setNegaraTujuanBekerja] = useState("");
  const [alamat, setAlamat] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [kabupaten, setKabupaten] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isEditingPekerjaan, setIsEditingPekerjaan] = useState(false);

  const [oldFiles, setOldFiles] = useState({
    pasFoto: "",
    ktp: "",
    kk: "",
    ijazah: "",
    suratKesehatan: "",
  });

  const [files, setFiles] = useState({
    suratKesehatan: null as File | null,
    pasFoto: null as File | null,
    ktp: null as File | null,
    kk: null as File | null,
    ijazah: null as File | null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response: AxiosResponse = await axios.get(`${baseUrl}/users/getUsersById`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setUserDetail(data);
        setName(data.Nama || "");
        setNik(data.Nik || "");
        setPhoneNumber(data.NoTelpon || "");
        setEmail(data.Email || "");
        setTanggalLahir(data.TanggalLahir || "");
        setTempatLahir(data.TempatLahir || "");
        setJenisKelamin(data.JenisKelamin || "");
        setAgama(data.Agama || "");
        setPekerjaan(data.Pekerjaan || "");
        setGolonganDarah(data.GolonganDarah || "");
        setStatusMenikah(data.StatusMenikah || "");
        setPendidikanTerakhir(data.PendidikanTerakhir || "");
        setKewarganegaraan(data.Kewarganegaraan || "");
        setIbuKandung(data.IbuKandung || "");
        setAlamat(data.Alamat || "");
        setProvinsi(data.Provinsi || "");
        setKabupaten(data.Kota || "");
        setNegaraTujuanBekerja(data.NegaraTujuanBekerja || "");
        setOldFiles({
          pasFoto: data.Foto || "",
          ktp: data.Ktp || "",
          kk: data.KK || "",
          ijazah: data.Ijazah || "",
          suratKesehatan: data.SuratKesehatan || "",
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user detail:", error);
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [token, baseUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        Toast.fire({ icon: 'error', title: 'Format file tidak didukung' });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        Toast.fire({ icon: 'error', title: 'Ukuran file terlalu besar (Max 100MB)' });
        return;
      }

      setFiles((prev) => ({ ...prev, [field]: file }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("Nama", name);
    formData.append("Nik", nik);
    formData.append("NoTelpon", phoneNumber);
    formData.append("Email", email);
    formData.append("Agama", agama);
    formData.append("TanggalLahir", tanggalLahir);
    formData.append("TempatLahir", tempatLahir);
    formData.append("JenisKelamin", jenisKelamin);
    formData.append("Pekerjaan", pekerjaan);
    formData.append("GolonganDarah", golonganDarah);
    formData.append("StatusMenikah", statusMenikah);
    formData.append("PendidikanTerakhir", pendidikanTerakhir);
    formData.append("Provinsi", provinsi);
    formData.append("Kota", kabupaten);
    formData.append("Kewarganegaraan", kewarganegaraan);
    formData.append("IbuKandung", ibuKandung);
    formData.append("Alamat", alamat);
    formData.append("NegaraTujuanBekerja", negaraTujuanBekerja);

    if (files.pasFoto) formData.append("Fotos", files.pasFoto);
    if (files.ktp) formData.append("Ktps", files.ktp);
    if (files.kk) formData.append("KKs", files.kk);
    if (files.ijazah) formData.append("Ijazahs", files.ijazah);
    if (files.suratKesehatan) formData.append("SuratKesehatans", files.suratKesehatan);

    try {
      await axios.put(`${baseUrl}/users/updateUsers`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Toast.fire({ icon: "success", title: 'Profil berhasil diperbarui!' });

      const isFirstTimer = Cookies.get('XSRF087');
      const redirectUrl = Cookies.get('XSRF088');

      if (isFirstTimer) {
        Cookies.remove('XSRF087');
        router.push(redirectUrl || '/');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: "error", title: 'Gagal memperbarui profil' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 0, name: "Info Pribadi", icon: FiUser },
    { id: 1, name: "Domisili", icon: FiMapPin },
    { id: 2, name: "Pekerjaan", icon: FiBriefcase },
    { id: 3, name: "Dokumen", icon: FiFileText },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <HashLoader color="#3b82f6" size={50} />
      </div>
    );
  }

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#020617] text-white py-12 px-4 md:py-24">
      {/* Background Effects */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest"
          >
            <FiShield size={14} /> Security Compliance
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-calsans tracking-tight leading-none"
          >
            Update <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Data Profil</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-400 max-w-xl mx-auto font-light leading-relaxed"
          >
            Pastikan informasi Anda valid untuk mempercepat proses verifikasi kepesertaan pelatihan di platform E-LAUT.
          </motion.p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">

          {/* Step Progress Bar */}
          <div className="bg-white/5 px-8 py-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                  {React.createElement(steps[indexFormTab].icon, { size: 20 })}
                </div>
                <div>
                  <h3 className="text-lg font-calsans text-white">{steps[indexFormTab].name}</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Step {indexFormTab + 1} of 4</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-calsans text-blue-400">{(indexFormTab + 1) * 25}%</span>
              </div>
            </div>
            <Progress value={(indexFormTab + 1) * 25} className="h-1.5 bg-white/5" />
          </div>

          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={indexFormTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* STEP 0: Info Pribadi */}
                {indexFormTab === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Nama Lengkap" value={name} readOnly icon={FiUser} required />
                    <InputField label="NIK" value={nik} readOnly icon={FiShield} required />
                    <InputField label="Nomor Telepon" value={phoneNumber} readOnly icon={FiPhone} required />
                    <InputField label="Alamat Email" type="email" value={email} onChange={setEmail} icon={FiMail} placeholder="email@aktif.com" />
                    <InputField label="Tanggal Lahir" type="date" value={tanggalLahir} onChange={setTanggalLahir} required />
                    <InputField label="Tempat Lahir" value={tempatLahir} onChange={setTempatLahir} placeholder="Kota Kelahiran" required />

                    <SelectField
                      label="Jenis Kelamin"
                      value={jenisKelamin}
                      onChange={setJenisKelamin}
                      options={[{ v: "L", l: "Laki-laki" }, { v: "P", l: "Perempuan" }]}
                      required
                    />

                    <SelectField
                      label="Agama"
                      value={agama}
                      onChange={setAgama}
                      options={["Islam", "Kristen Protestan", "Kristen Katolik", "Hindu", "Buddha", "Konghucu"].map(a => ({ v: a, l: a }))}
                      required
                    />

                    <SelectField
                      label="Pendidikan Terakhir"
                      value={pendidikanTerakhir}
                      onChange={setPendidikanTerakhir}
                      options={["SD", "SMP", "SMA/SMK", "DI/DII/DIII", "DIV/S1", "S2", "S3"].map(p => ({ v: p, l: p }))}
                      required
                    />

                    <SelectField
                      label="Status Menikah"
                      value={statusMenikah}
                      onChange={setStatusMenikah}
                      options={["Belum Menikah", "Sudah Menikah"].map(s => ({ v: s, l: s }))}
                      required
                    />

                    <InputField label="Nama Ibu Kandung" value={ibuKandung} onChange={setIbuKandung} placeholder="Nama Ibu" required />
                    <InputField label="Negara Tujuan Kerja" value={negaraTujuanBekerja} onChange={setNegaraTujuanBekerja} placeholder="Opsional (Misal: Korea Selatan)" />
                  </div>
                )}

                {/* STEP 1: Domisili */}
                {indexFormTab === 1 && (
                  <div className="space-y-6">
                    <SelectField
                      label="Provinsi"
                      value={provinsi}
                      onChange={setProvinsi}
                      options={PROVINCES.map(p => ({ v: p.provinsi, l: p.provinsi }))}
                      required
                    />
                    <SelectField
                      label="Kabupaten/Kota"
                      value={kabupaten}
                      onChange={setKabupaten}
                      options={KABUPATENS.map(k => ({ v: k.kabupaten, l: k.kabupaten }))}
                      required
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Alamat Lengkap</label>
                      <textarea
                        rows={4}
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                        placeholder="Masukkan alamat domisili saat ini..."
                        required
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Pekerjaan */}
                {indexFormTab === 2 && (
                  <div className="space-y-8">
                    <SelectField
                      label="Status Kepesertaan"
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                      options={[
                        { v: "Masyarakat/Pelaku Utama/Pelaku Usaha", l: "Umum / Pelaku Utama Perikanan" },
                        { v: "Taruna Satuan Pendidikan KP", l: "Taruna / Siswa KKP" }
                      ]}
                      required
                    />

                    {selectedStatus === "Masyarakat/Pelaku Utama/Pelaku Usaha" && (
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-300">Pilih Pekerjaan</label>
                        {pekerjaan && !isEditingPekerjaan ? (
                          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                            <div className="flex items-center gap-3">
                              <FiCheckCircle className="text-emerald-500" />
                              <span className="text-sm font-medium">{pekerjaan}</span>
                            </div>
                            <button onClick={() => setIsEditingPekerjaan(true)} className="text-xs font-bold text-blue-400 hover:underline">Ubah</button>
                          </div>
                        ) : (
                          <select
                            value={pekerjaan}
                            onChange={(e) => setPekerjaan(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none cursor-pointer"
                          >
                            <option value="" disabled className="bg-[#020617]">-- Pilih Pekerjaan --</option>
                            {["Nelayan", "Pembudidaya Ikan", "Pengolah Ikan", "Pemasar Ikan", "PNS", "Wiraswasta", "Pencari Kerja", "Other"].map(p => (
                              <option key={p} value={p} className="bg-[#020617]">{p}</option>
                            ))}
                          </select>
                        )}
                        {pekerjaan === "Other" && (
                          <input
                            type="text"
                            placeholder="Sebutkan pekerjaan Anda..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none"
                            onChange={(e) => setPekerjaan(e.target.value)}
                          />
                        )}
                      </div>
                    )}

                    {selectedStatus === "Taruna Satuan Pendidikan KP" && (
                      <SelectField
                        label="Asal Satuan Pendidikan"
                        value={pekerjaan}
                        onChange={setPekerjaan}
                        options={SATUAN_PENDIDIKAN_KEAHLIAN.map(s => ({ v: s.FullName, l: s.FullName }))}
                        required
                      />
                    )}
                  </div>
                )}

                {/* STEP 3: Dokumen */}
                {indexFormTab === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FileDropzone label="Pas Foto (Wajib)" field="pasFoto" current={oldFiles.pasFoto} file={files.pasFoto} onChange={handleFileChange} required />
                      <FileDropzone label="E-KTP (Wajib)" field="ktp" current={oldFiles.ktp} file={files.ktp} onChange={handleFileChange} required />
                      <FileDropzone label="Kartu Keluarga" field="kk" current={oldFiles.kk} file={files.kk} onChange={handleFileChange} />
                      <FileDropzone label="Ijazah Terakhir" field="ijazah" current={oldFiles.ijazah} file={files.ijazah} onChange={handleFileChange} />
                      <FileDropzone label="Suket Sehat" field="suratKesehatan" current={oldFiles.suratKesehatan} file={files.suratKesehatan} onChange={handleFileChange} />
                    </div>
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                      <p className="text-[11px] text-blue-300 leading-relaxed italic">
                        *Demi alasan keamanan, Anda wajib mengunggah Pas Foto dan Scan KTP yang valid untuk memvalidasi kepemilikan akun.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4 mt-12 pt-8 border-t border-white/5">
              {indexFormTab > 0 && (
                <button
                  onClick={() => setIndexFormTab(prev => prev - 1)}
                  className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 group"
                >
                  <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali
                </button>
              )}

              {indexFormTab < 3 ? (
                <button
                  onClick={() => { setIndexFormTab(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="flex-[2] h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                  Selanjutnya <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <HashLoader size={20} color="#fff" /> : <><FiCheckCircle /> Simpan & Perbarui</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const InputField = ({ label, icon: Icon, readOnly, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">{label} {props.required && <span className="text-rose-500">*</span>}</label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={16} />}
      <input
        {...props}
        className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 ${Icon ? 'pl-14' : ''} text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${readOnly ? 'opacity-60 cursor-not-allowed border-transparent' : 'hover:border-white/20'}`}
        readOnly={readOnly}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, required }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">{label} {required && <span className="text-rose-500">*</span>}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-2xl px-5 h-[54px] text-sm focus:ring-2 focus:ring-blue-500/50">
        <SelectValue placeholder={`Pilih ${label}`} />
      </SelectTrigger>
      <SelectContent className="bg-[#020617] border-white/10 text-white rounded-xl">
        {options.map((opt: any, i: number) => (
          <SelectItem key={i} value={opt.v} className="focus:bg-blue-500/20 focus:text-blue-400">{opt.l}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const FileDropzone = ({ label, field, current, file, onChange, required }: any) => {
  const isImage = current?.match(/\.(jpg|jpeg|png)$/i);

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">{label}</label>
      <div className="relative group">
        <label className="flex flex-col items-center justify-center w-full min-h-[120px] bg-white/5 border border-dashed border-white/10 hover:border-blue-500/50 rounded-3xl p-6 cursor-pointer transition-all duration-300">
          {file ? (
            <div className="flex flex-col items-center gap-2 text-blue-400">
              <FiCheckCircle size={28} />
              <span className="text-xs font-bold text-center line-clamp-1">{truncateText(file.name, 20, '...')}</span>
            </div>
          ) : current && current !== "" && !current.endsWith('/') ? (
            <div className="flex flex-col items-center gap-3">
              {isImage ? (
                <img src={current} className="w-16 h-16 rounded-xl object-cover border border-white/20" />
              ) : (
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><FiFileText size={24} /></div>
              )}
              <span className="text-[10px] font-bold text-blue-400/70">Klik untuk ganti file</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-500 group-hover:text-blue-400">
              <FiUploadCloud size={32} className="transition-transform group-hover:-translate-y-1" />
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider">Unggah Berkas</p>
                <p className="text-[9px] font-light">Max 100MB (PDF/JPG/PNG)</p>
              </div>
            </div>
          )}
          <input type="file" className="hidden" onChange={(e) => onChange(e, field)} required={required && (!current || current === "" || current.endsWith('/'))} />
        </label>
      </div>
    </div>
  );
};
