"use client";

import Toast from "@/components/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { TbFileStack, TbMapPinSearch, TbUserEdit } from "react-icons/tb";

import { Progress } from "@/components/ui/progress";
import { MdCheckCircle, MdWorkOutline } from "react-icons/md";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { User } from "@/types/user";
import { HashLoader } from "react-spinners";
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, MIN_FILE_SIZE } from "@/utils/file";
import { SATUAN_PENDIDIKAN_KEAHLIAN } from "@/constants/pelatihan";
import { KABUPATENS, PROVINCES } from "@/constants/regions";
import { FaFileUpload } from "react-icons/fa";
import { truncateText } from "@/utils";

function FormCompleteProfile() {
  const router = useRouter();

  const pathname = usePathname();

  /* token user */
  const token = Cookies.get("XSRF081");

  /* state variable to store basic user information to register */
  const [name, setName] = React.useState<string>("");
  const [nik, setNik] = React.useState<string>("");
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [tanggalLahir, setTanggalLahir] = React.useState<string>("");
  const [tempatLahir, setTempatLahir] = React.useState("");
  const [jenisKelamin, setJenisKelamin] = React.useState("");
  const [agama, setAgama] = React.useState("");
  const [pekerjaan, setPekerjaan] = React.useState("");
  const [golonganDarah, setGolonganDarah] = React.useState("");
  const [statusMenikah, setStatusMenikah] = React.useState("");
  const [pendidikanTerakhir, setPendidikanTerakhir] = React.useState("");
  const [kewarganegaraan, setKewarganegaraan] = React.useState("");
  const [ibuKandung, setIbuKandung] = React.useState("");
  const [negaraTujuanBekerja, setNegaraTujuanBekerja] = React.useState("");
  const [alamat, setAlamat] = React.useState<string>("");
  const [oldFiles, setOldFiles] = React.useState({
    pasFoto: "",
    ktp: "",
    kk: "",
    ijazah: "",
    suratKesehatan: "",
  });

  const [kabupaten, setKabupaten] = React.useState<string>("");
  const [provinsi, setProvinsi] = React.useState<string>("");

  const validateFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      Toast.fire({
        icon: 'error',
        title: 'File tidak valid',
        text: 'Hanya file dengan ekstensi PDF, PNG, JPEG, JPG, dan CSV yang diperbolehkan.',
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      Toast.fire({
        icon: 'error',
        title: 'File terlalu besar',
        text: 'Ukuran file tidak boleh melebihi 100MB.',
      });
      return false;
    }

    if (file.size < MIN_FILE_SIZE) {
      Toast.fire({
        icon: 'error',
        title: 'File terlalu kecil',
        text: 'Ukuran file tidak boleh kurang dari 1 byte.',
      });
      return false;
    }

    return true;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This smooth scrolling is optional, you can remove it if you want instant scrolling
    });
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const [isLoadingCompleteProfile, setIsLoadingCompleteProfile] =
    React.useState<boolean>(false);

  const [userDetail, setUserDetail] = React.useState<User | null>(null);


  const handleFetchingUserDetail = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/users/getUsersById`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserDetail(response.data);
      setName(response.data?.Nama);
      setEmail(response.data?.Email);
      setTanggalLahir(response.data?.TanggalLahir);
      setAlamat(response.data?.Alamat)
      setJenisKelamin(response.data?.JenisKelamin)
      setGolonganDarah(response.data?.GolonganDarah)
      setIbuKandung(response.data?.IbuKandung);
      setAgama(response.data?.Agama);
      setPekerjaan(response.data?.Pekerjaan);
      setStatusMenikah(response.data?.StatusMenikah);
      setKewarganegaraan(response.data?.Kewarganegaraan);
      setPendidikanTerakhir(response.data?.PendidikanTerakhir);
      setNegaraTujuanBekerja(response.data?.NegaraTujuanBekerja);
      setTempatLahir(response.data?.TempatLahir);
      setNik(response.data?.Nik);
      setProvinsi(response.data?.Provinsi);
      setKabupaten(response.data?.Kota);
      setPhoneNumber(response.data?.NoTelpon);
      setOldFiles({
        pasFoto: response.data?.Foto || "",
        ktp: response.data?.Ktp || "",
        kk: response.data?.KK || "",
        ijazah: response.data?.Ijazah || "",
        suratKesehatan: response.data?.SuratKesehatan || "",
      });
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };


  const [files, setFiles] = React.useState({
    suratKesehatan: null as File | null,
    pasFoto: null as File | null,
    ktp: null as File | null,
    kk: null as File | null,
    ijazah: null as File | null,
  });

  const hasExtension = (url: string) => {
    return /\.[0-9a-z]+$/i.test(url);
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const renderInput = (
    label: string,
    field: keyof typeof files,
    required = false
  ) => {
    const oldFileUrl = oldFiles[field];
    const hasOld = hasExtension(oldFileUrl);

    return (
      <div className="w-full px-3 mb-3">
        <label className="text-sm font-medium text-gray-200">{label}</label>

        {hasOld ? (
          <div className="mt-2 flex flex-col gap-2 bg-white/10 backdrop-blur-md border border-white/20 shadow-md rounded-xl p-3">
            {oldFileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img
                src={oldFileUrl}
                alt={field}
                className="w-40 h-40 object-cover rounded-lg border border-white/30"
              />
            ) : (
              <a
                href={oldFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline text-sm"
              >
                Lihat File Lama
              </a>
            )}
            <label
              className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl 
            bg-white/10 backdrop-blur-md border border-white/20 shadow-md cursor-pointer 
            hover:bg-white/20 transition"
            >
              <div className="flex items-center gap-3 text-gray-100">
                <FaFileUpload className="text-lg text-blue-300" />
                <span className="text-sm">
                  {files[field] ? truncateText(files[field]!.name, 30, "...") : "Ganti file..."}
                </span>
              </div>
              {files[field] && <MdCheckCircle className="text-green-400 text-xl" />}
              <input
                type="file"
                className="hidden"
                required={required}
                onChange={(e) => handleFileChange(e, field)}
              />
            </label>
          </div>
        ) : (
          <div className="mt-2 relative flex items-center">
            <label
              className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl 
            bg-white/10 backdrop-blur-md border border-white/20 shadow-md cursor-pointer 
            hover:bg-white/20 transition"
            >
              <div className="flex items-center gap-3 text-gray-100">
                <FaFileUpload className="text-lg text-blue-300" />
                <span className="text-sm">
                  {files[field] ? truncateText(files[field]!.name, 30, "...") : "Pilih file..."}
                </span>
              </div>
              {files[field] && <MdCheckCircle className="text-green-400 text-xl" />}
              <input
                type="file"
                className="hidden"
                required={required}
                onChange={(e) => handleFileChange(e, field)}
              />
            </label>
          </div>
        )}
      </div>
    );
  };

  const isFirstTimerUser = Cookies.get('XSRF087')

  const handleCompleteProfileUser = async () => {
    setIsLoadingCompleteProfile(true);
    console.log(
      name,
      nik,
      phoneNumber,
      email,
      tanggalLahir,
      tempatLahir,
      jenisKelamin,
      pekerjaan,
      golonganDarah,
      statusMenikah,
      pendidikanTerakhir,
      kewarganegaraan,
      ibuKandung,
      negaraTujuanBekerja
    );

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
    if (files.pasFoto) {
      formData.append("Fotos", files.pasFoto);
    }

    if (files.ktp) {
      formData.append("Ktps", files.ktp);
    }

    if (files.kk) {
      formData.append("KKs", files.kk);
    }

    if (files.ijazah) {
      formData.append("Ijazahs", files.ijazah);
    }

    if (files.suratKesehatan) {
      formData.append("SuratKesehatans", files.suratKesehatan);
    }
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/updateUsers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log({ response });
      Toast.fire({
        icon: "success",
        title: 'Yeayyy!',
        text: `Berhasil mengupdate data profile-mu!`,
      });
      setIsLoadingCompleteProfile(false);

      if (Cookies.get('XSRF087')) {
        if (Cookies.get('XSRF088')) {
          Cookies.remove('XSRF087')
          router.push(Cookies.get('XSRF088')!);
        } else {
          Cookies.remove('XSRF087')
          router.push('/');
        }
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error({ error });
      Toast.fire({
        icon: "error",
        title: `Gagal mengupdate data profile-mu!`,
      });
      setIsLoadingCompleteProfile(false);
    }
  };

  const [indexFormTab, setIndexFormTab] = React.useState(0);

  const [selectedStatus, setSelectedStatus] = React.useState<string>('')
  const [isEditingPekerjaan, setIsEditingPekerjaan] = React.useState(false)

  React.useEffect(() => {
    setTimeout(() => {
      handleFetchingUserDetail();
    }, 1000);
  }, []);


  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white shadow-custom mx-auto" id="explore">
      {/* gradient blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <section className="relative h-fit pb-20  mt-5 md:mt-36 max-w-6xl w-full rounded-xl shadow-custom mx-auto" id="explore">
        <div className="relative max-w-6xl w-full mx-auto px-8 flex pb-20 flex-col space-y-2 border border-white/15 bg-white/10 backdrop-blur-xl 
                    shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-all duration-500 
                     hover:border-blue-400/40 rounded-3xl">
          <div className="pt-12 md:pt-20 pb-6 md:pb-10 text-center flex flex-col space-y-2 border-b border-b-grayUsual mb-5 ">
            <h1 className="text-2xl md:text-3xl font-calsans text-blue-400 leading-none">
              Update dan Lengkapi <br /> Data Pengguna E-LAUT
            </h1>
            <p className="text-base text-gray-200 max-w-xl text-center mx-auto leading-none">
              Update dan lengkap data agar validitas data dirimu dapat mempercepat proses keikutsertaan pelatihan di E-LAUT, lengkapi juga dokumen serta file yang diperlukan!
            </p>
          </div>

          {userDetail != null && (
            <form className="max-w-6xl w-full mx-auto">
              <div className="flex items-center justify-between">
                {indexFormTab == 0 ? (
                  <h2 className=" text-2xl leading-[100%] my-6 md:text-2xl text-blue-400 font-calsans flex items-center gap-1">
                    <TbUserEdit />
                    <span className="mt-2">Data Pribadi</span>
                  </h2>
                ) : indexFormTab == 1 ? (
                  <h2 className=" text-2xl leading-[100%] my-6 md:text-2xl text-blue-400 font-calsans flex items-center gap-1">
                    <TbMapPinSearch />
                    <span className="mt-2">Alamat Domisili</span>
                  </h2>
                ) : indexFormTab == 2 ? (
                  <h2 className=" text-2xl leading-[100%] my-6 md:text-2xl text-blue-400 font-calsans flex items-center gap-1">
                    <MdWorkOutline />
                    <span className="mt-1">Riwayat Pendidikan/Pekerjaan</span>
                  </h2>
                ) : (
                  <h2 className=" text-2xl leading-[100%] my-6 md:text-2xl text-blue-400 font-calsans flex items-center gap-1">
                    <TbFileStack />
                    <span className="mt-2">Berkas dan Dokumen</span>
                  </h2>
                )}

                <p className="text-base text-gray-200">
                  {indexFormTab == 0 ? (
                    <span className="font-bold  leading-[100%] my-6 text-blue-400 ">
                      1
                    </span>
                  ) : indexFormTab == 1 ? (
                    <span className="font-bold  leading-[100%] my-6 text-blue-400 ">
                      2
                    </span>
                  ) : indexFormTab == 2 ? (
                    <span className="font-bold  leading-[100%] my-6 text-blue-400 ">
                      3
                    </span>
                  ) : (
                    <span className="font-bold  leading-[100%] my-6 text-blue-400 ">
                      4
                    </span>
                  )}{" "}
                  of 4
                </p>
              </div>
              <div className="flex w-full -mt-2 mb-4">
                <Progress
                  value={(indexFormTab + 1) * 25}
                  className="text-blue-500"
                  max={4}
                />
              </div>
              <div>
                <div className={`${indexFormTab == 0 ? "block" : "hidden"}`}>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="name"
                      >
                        Nama Lengkap <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Masukkan nama lengkap"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="nik"
                      >
                        NIK <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="nik"
                        type="text"
                        className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Masukkan NIK"
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        required
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        No Telpon <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="phone_number"
                        type="text"
                        className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Masukkan no telpon"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Email <span className="text-rose-600"></span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Masukkan alamat email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <p className="text-xs">*Email yang anda masukan BENAR dan masih AKTIF</p>

                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Tanggal Lahir <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="phone number"
                        type="date"
                        className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Masukkan tanggal lahir"
                        required
                        value={tanggalLahir}
                        onChange={(e) => setTanggalLahir(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Tempat Lahir <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="tempat_lahir"
                        type="text"
                        className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Masukkan tempat lahir"
                        required
                        value={tempatLahir}
                        onChange={(e) => setTempatLahir(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label className=" text-sm font-medium text-gray-200" htmlFor="jenisKelamin">
                        Jenis Kelamin <span className="text-rose-600">*</span>
                      </label>
                      <Select
                        value={jenisKelamin || undefined} // Ensure it's undefined if empty
                        onValueChange={(value) => setJenisKelamin(value)}
                      >
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Laki - Laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label className=" text-sm font-medium text-gray-200" htmlFor="agama">
                        Agama <span className="text-rose-600">*</span>
                      </label>
                      <Select
                        value={agama || undefined} // Ensure it's undefined if empty
                        onValueChange={(value) => setAgama(value)}
                      >
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih agama" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Islam">Islam</SelectItem>
                          <SelectItem value="Kriten Protestan">Kristen Protestan</SelectItem>
                          <SelectItem value="Kriten Katolik">Kristen Katolik</SelectItem>
                          <SelectItem value="Hindu">Hindu</SelectItem>
                          <SelectItem value="Buddha">Buddha</SelectItem>
                          <SelectItem value="Konghucu">Konghucu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label className=" text-sm font-medium text-gray-200" htmlFor="golonganDarah">
                        Golongan Darah (Opsional)
                      </label>
                      <Select
                        value={golonganDarah || undefined} // Ensure it's undefined if empty
                        onValueChange={(value) => setGolonganDarah(value)}
                      >
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih golongan darah" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="O">O</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="AB">AB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Status Menikah <span className="text-rose-600">*</span>
                      </label>
                      <Select
                        value={statusMenikah}
                        onValueChange={(value) => setStatusMenikah(value)}
                      >
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Belum Menikah">
                            Belum Menikah
                          </SelectItem>
                          <SelectItem value="Sudah Menikah">
                            Sudah Menikah
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Pendidikan Terakhir{" "}
                        <span className="text-rose-600">*</span>
                      </label>
                      <Select
                        value={pendidikanTerakhir}
                        onValueChange={(value) => setPendidikanTerakhir(value)}
                      >
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih pendidikan terakhir" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tidak/Belum Sekolah">
                            Tidak/Belum Sekolah
                          </SelectItem>
                          <SelectItem value="SD">
                            SD
                          </SelectItem>
                          <SelectItem value="SMP">
                            SMP
                          </SelectItem>
                          <SelectItem value="SMA">
                            SMA/SMK
                          </SelectItem>
                          <SelectItem value="DI/DII/DIII">
                            DI/DII/DIII
                          </SelectItem>
                          <SelectItem value="DIV">
                            DIV
                          </SelectItem>
                          <SelectItem value="S1">
                            S1
                          </SelectItem>
                          <SelectItem value="S2">
                            S2
                          </SelectItem>
                          <SelectItem value="S3">
                            S3
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Kewarganegaraan <span className="text-rose-600">*</span>
                      </label>
                      <Select
                        value={kewarganegaraan}
                        onValueChange={(value) => setKewarganegaraan(value)}
                      >
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih kewarganegaraan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WNI">
                            WNI (Warga Negara Indonesia)
                          </SelectItem>
                          <SelectItem value="WNA">
                            WNA (Warga Negara Asing)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Ibu Kandung <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="ibu_kandung"
                        type="text"
                        className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Masukkan ibu kandung"
                        required
                        value={ibuKandung}
                        onChange={(e) => setIbuKandung(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Negara Tujuan Bekerja{" "}
                      </label>
                      <input
                        id="negara_tujuan"
                        type="text"
                        className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Masukkan negara tujuan"
                        value={negaraTujuanBekerja}
                        onChange={(e) => setNegaraTujuanBekerja(e.target.value)}
                      />
                      <p className="text-xs">*Diisi apabila tidak/setelah mengikuti pelatihan akan berencana bekerja di luar negeri</p>
                    </div>
                  </div>
                </div>
                <div className={`${indexFormTab == 1 ? "block" : "hidden"}`}>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Provinsi <span className="text-rose-600">*</span>
                      </label>
                      {
                        PROVINCES.length != 0 && <Select value={provinsi} onValueChange={(value) => setProvinsi(value)}>
                          <SelectTrigger className="w-full text-base py-6">
                            <SelectValue placeholder="Pilih provinsi" />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              PROVINCES.map((province, i) => (
                                <SelectItem key={i} value={province.provinsi} >{province.provinsi}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      }

                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Kabupaten/Kota <span className="text-rose-600">*</span>
                      </label>
                      {
                        KABUPATENS.length != 0 && <Select value={kabupaten} onValueChange={(value) => setKabupaten(value)}>
                          <SelectTrigger className="w-full text-base py-6">
                            <SelectValue placeholder="Pilih kabupaten/kota" />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              KABUPATENS.map((regency, i) => (
                                <SelectItem key={i} value={regency.kabupaten} >{regency.kabupaten}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      }
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Alamat Domisili <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        id="phone number"
                        rows={4}
                        placeholder={alamat}
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className={`${indexFormTab == 2 ? "block" : "hidden"}`}>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className=" text-sm font-medium text-gray-200"
                        htmlFor="email"
                      >
                        Status <span className="text-rose-600">*</span>
                      </label>
                      <Select onValueChange={(value) => setSelectedStatus(value)}>
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masyarakat/Pelaku Utama/Pelaku Usaha">Masyarakat/Pelaku Utama/Pelaku Usaha</SelectItem>
                          <SelectItem value="Taruna Satuan Pendidikan KP">
                            Taruna Satuan Pendidikan KP
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {
                    selectedStatus == 'Masyarakat/Pelaku Utama/Pelaku Usaha' ? <>
                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="text-sm font-medium text-gray-200"
                            htmlFor="pekerjaan"
                          >
                            Pekerjaan
                            <span className="text-rose-600">*</span> <br />
                            <span className="text-gray-200">
                              Jika tidak ada pilih <strong>Other</strong> lalu isi dengan tanda (-)
                            </span>
                          </label>

                          {/* Kondisi: kalau sudah ada pekerjaan dan belum klik edit → tampilkan readonly */}
                          {pekerjaan && !isEditingPekerjaan ? (
                            <div className="mt-2 flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-gray-200">
                              <span>{pekerjaan}</span>
                              <button
                                type="button"
                                onClick={() => setIsEditingPekerjaan(true)}
                                className="text-blue-400 hover:underline text-sm"
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Kalau pekerjaan kosong atau user klik edit → tampilkan select */}
                              <select
                                id="pekerjaan"
                                value={pekerjaan}
                                onChange={(e) => setPekerjaan(e.target.value)}
                                className="w-full mt-2 rounded-xl px-4 py-2 bg-white/10 
                     backdrop-blur-md border border-white/20 
                     text-gray-200 focus:outline-none focus:ring-2 
                     focus:ring-blue-400 cursor-pointer"
                                required
                              >
                                <option value="">-- Pilih Pekerjaan --</option>
                                <option value="Pengolah Ikan">Pengolah Ikan</option>
                                <option value="Pemasar Ikan">Pemasar Ikan</option>
                                <option value="Nelayan">Nelayan</option>
                                <option value="Pembudidaya Ikan">Pembudidaya Ikan</option>
                                <option value="Petambak Garam">Petambak Garam</option>
                                <option value="Kelompok Masyarakat Pengawas (POKMASWAS)">
                                  Kelompok Masyarakat Pengawas (POKMASWAS)
                                </option>
                                <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                                <option value="Wiraswasta/Wirausaha">Wiraswasta/Wirausaha</option>
                                <option value="Pencari Kerja / Belum Bekerja">
                                  Pencari Kerja / Belum Bekerja
                                </option>
                                <option value="Penyuluh Perikanan PNS">Penyuluh Perikanan PNS</option>
                                <option value="Penyuluh Perikanan Bantu">Penyuluh Perikanan Bantu</option>
                                <option value="ASN">ASN</option>
                                <option value="TNI/Polri">TNI/Polri</option>
                                <option value="Mahasiswa/Pelajar">Mahasiswa/Pelajar</option>
                                <option value="Karyawan Swasta">Karyawan Swasta</option>
                                <option value="Pegawai Honorer/Karyawan Kontrak">
                                  Pegawai Honorer/Karyawan Kontrak
                                </option>
                                <option value="Tenaga Pendidik (Guru/Dosen)">
                                  Tenaga Pendidik (Guru/Dosen)
                                </option>
                                <option value="Tenaga Medis (Dokter/Perawat/Bidan)">
                                  Tenaga Medis (Dokter/Perawat/Bidan)
                                </option>
                                <option value="Buruh (Buruh lepas)">Buruh (Buruh lepas)</option>
                                <option value="P3K">P3K</option>
                                <option value="Other">Other</option>
                              </select>

                              {/* Kalau pilih "Other" → input manual */}
                              {pekerjaan === "Other" && (
                                <input
                                  type="text"
                                  value={pekerjaan}
                                  placeholder="Masukkan pekerjaan lain..."
                                  className="mt-2 w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  onChange={(e) => setPekerjaan(e.target.value)}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>


                    </> : selectedStatus == 'Taruna Satuan Pendidikan KP' ? <>
                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className=" text-sm font-medium text-gray-200"
                            htmlFor="email"
                          >
                            Asal Satuan Pendidikan
                            <span className="text-rose-600">*</span> <br />
                            <span className="text-gray-500">
                              Jika tidak ada isi (-)
                            </span>
                          </label>
                          <Select
                            value={pekerjaan || undefined} // Ensure it's undefined if empty
                            onValueChange={(value) => setPekerjaan(value)}
                          >
                            <SelectTrigger className="w-full text-base py-6">
                              <SelectValue placeholder="Pilih satuan pendidikan" />
                            </SelectTrigger>
                            <SelectContent>
                              {
                                SATUAN_PENDIDIKAN_KEAHLIAN.map((satdik, index) => (
                                  <SelectItem value={satdik.FullName} key={index}>{satdik.FullName}</SelectItem>
                                ))
                              }

                            </SelectContent>
                          </Select>
                        </div>
                      </div>


                    </> : <></>
                  }

                </div>
                <div className={`${indexFormTab == 3 ? "block" : "hidden"}`}>
                  <div className="flex flex-wrap -mx-3">
                    {renderInput("File Surat Kesehatan (Opsional)", "suratKesehatan")}
                    {renderInput("Pas Foto (Wajib)", "pasFoto", true)}
                    {renderInput("File KTP (Wajib)", "ktp", true)}
                    {renderInput("File Kartu Keluarga (Opsional)", "kk")}
                    {renderInput("Ijazah (Opsional)", "ijazah")}
                  </div>

                  <div className="text-sm text-gray-200 text-left mt-3">
                    Demi alasan keamanan maka Anda wajib mengisi foto/file
                    <span className="underline text-blue-500 font-medium"> dan KTP</span> untuk memvalidasi kepemilikan data peserta.
                  </div>


                </div>
                <div className="flex -mx-3 mt-5 gap-2 px-3">
                  <div className={`w-full ${indexFormTab == 0 && "hidden"}`}>
                    <button
                      type="submit"
                      className="btn text-white bg-blue-500 hover:bg-blue-600 w-full"
                      onClick={(e) => {
                        setIndexFormTab(indexFormTab - 1);
                        scrollToTop();
                      }}
                    >
                      Sebelumnya
                    </button>
                  </div>
                  <div
                    className={`w-full ${indexFormTab == 3 ? "hidden" : "block"
                      }`}
                  >
                    <button
                      type="submit"
                      onClick={(e) => { setIndexFormTab(indexFormTab + 1); scrollToTop() }}
                      className="btn text-white bg-blue-500 hover:bg-blue-600 w-full"
                    >
                      Selanjutnya
                    </button>
                  </div>
                  <div
                    className={`w-full ${indexFormTab == 3 ? "block" : "hidden"
                      }`}
                  >
                    <button
                      onClick={(e) => {
                        handleCompleteProfileUser();
                      }}
                      type="submit"
                      className="btn text-white flex items-center justify-center bg-blue-500 hover:bg-blue-600 w-full"
                    >
                      {isLoadingCompleteProfile ? (
                        <HashLoader color="#FFFFFF" size={20} />
                      ) : (
                        <span>Upload</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </section >
    </section>

  );
}

export default FormCompleteProfile;
