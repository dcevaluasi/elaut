"use client";

import Toast from "@/components/toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import React, { FormEvent } from "react";

import { TbFileStack, TbMapPinSearch, TbUserEdit } from "react-icons/tb";

import { Progress } from "@/components/ui/progress";
import { MdWorkOutline } from "react-icons/md";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { User } from "@/types/user";
import { HashLoader } from "react-spinners";
import Image from "next/image";
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, MIN_FILE_SIZE } from "@/utils/file";
import { SATUAN_PENDIDIKAN, SATUAN_PENDIDIKAN_KEAHLIAN } from "@/constants/pelatihan";

function FormCompleteProfile() {
  const router = useRouter();

  const pathname = usePathname();
  const isEditProfile = pathname.includes("edit-profile");

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

  const [foto, setFoto] = React.useState<any>(null);
  const [ktp, setKtp] = React.useState<any>(null);
  const [kk, setKk] = React.useState<any>(null);
  const [ijazah, setIjazah] = React.useState<any>(null);
  const [suratKesehatan, setSuratKesehatan] = React.useState<any>(null);

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

  const handleFileChange = (setter: any, event: any) => {
    const file = event.target.files[0];
    if (file && validateFile(file)) {
      setter(file);
    } else {
      event.target.value = ''; // Reset input file
    }
  };

  const handleFotoChange = (event: any) => handleFileChange(setFoto, event);
  const handleKtpChange = (event: any) => handleFileChange(setKtp, event);
  const handleKkChange = (event: any) => handleFileChange(setKk, event);
  const handleIjazahChange = (event: any) => handleFileChange(setIjazah, event);
  const handleSuratKesehatanChange = (event: any) => handleFileChange(setSuratKesehatan, event);

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
      console.log({ response });
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
      setPhoneNumber(response.data?.NoTelpon);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      handleFetchingUserDetail();
    }, 1000);
  }, []);

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
    console.log({ suratKesehatan });
    console.log({ foto });
    console.log({ ktp });
    console.log({ kk });
    console.log({ ijazah });

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
    formData.append("Kewarganegaraan", kewarganegaraan);
    formData.append("IbuKandung", ibuKandung);
    formData.append("Alamat", alamat);
    formData.append("NegaraTujuanBekerja", negaraTujuanBekerja);
    formData.append("Fotos", foto);
    formData.append("Ktps", ktp);
    formData.append("KKs", kk);
    formData.append("Ijazahs", ijazah);
    formData.append("SuratKesehatans", suratKesehatan);

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
      router.push("/dashboard");
    } catch (error) {
      console.error({ error });
      Toast.fire({
        icon: "error",
        title: `Gagal mengupdate data profile-mu!`,
      });
      setIsLoadingCompleteProfile(false);
    }
  };

  const [formTab, setFormTab] = React.useState("FormDataUtamaUser");
  const [indexFormTab, setIndexFormTab] = React.useState(0);

  const [selectedStatus, setSelectedStatus] = React.useState<string>('')

  console.log({ indexFormTab });
  console.log({ formTab });

  return (
    <section className="relative w-full">
      <Image
        src={"/illustrations/success.jpg"}
        alt={"Form Complete Profile"}
        width={0}
        height={0}
        className="fixed -z-10 w-[450px] hidden md:block -bottom-10 left-10 animate-float"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <form className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Page header */}
          <div className="max-w-3xl mx-auto text-center pb-0 md:pb-0">
            <h1 className=" text-4xl leading-[100%] md:text-4xl text-black font-calsans">
              Update dan Lengkapi Data <br />  <span className="bg-clip-text text-transparent bg-gradient-to-r leading-none pt-0 from-blue-500 to-teal-400">
                Akun Pengguna E-LAUT
              </span>
            </h1>
            <p className="text-base text-gray-600 max-w-4x mt-4">
              Hanya isi sekali bisa digunakan untuk setiap proses pendaftaran,
              segera lengkapi data-mu!
            </p>
          </div>

          {/* Form */}
          {userDetail != null && (
            <div className="max-w-md mx-auto mt-5">
              <div className="flex items-center justify-between">
                {indexFormTab == 0 ? (
                  <h2 className=" text-2xl leading-[100%] my-6 md:text-2xl text-black font-calsans flex items-center gap-1">
                    <TbUserEdit />
                    <span className="mt-2">Data Pribadi</span>
                  </h2>
                ) : indexFormTab == 1 ? (
                  <h2 className=" text-2xl leading-[100%] my-6 md:text-2xl text-black font-calsans flex items-center gap-1">
                    <TbMapPinSearch />
                    <span className="mt-2">Alamat Domisili</span>
                  </h2>
                ) : indexFormTab == 2 ? (
                  <h2 className=" text-2xl leading-[100%] my-6 md:text-2xl text-black font-calsans flex items-center gap-1">
                    <MdWorkOutline />
                    <span className="mt-1">Riwayat Pendidikan/Pekerjaan</span>
                  </h2>
                ) : (
                  <h2 className=" text-2xl leading-[100%] my-6 md:text-2xl text-black font-calsans flex items-center gap-1">
                    <TbFileStack />
                    <span className="mt-2">Berkas dan Dokumen</span>
                  </h2>
                )}

                <p className="text-base">
                  {indexFormTab == 0 ? (
                    <span className="font-bold  leading-[100%] my-6 text-blue-500 ">
                      1
                    </span>
                  ) : indexFormTab == 1 ? (
                    <span className="font-bold  leading-[100%] my-6 text-blue-500 ">
                      2
                    </span>
                  ) : indexFormTab == 2 ? (
                    <span className="font-bold  leading-[100%] my-6 text-blue-500 ">
                      3
                    </span>
                  ) : (
                    <span className="font-bold  leading-[100%] my-6 text-blue-500 ">
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
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="name"
                      >
                        Nama Lengkap <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="form-input w-full text-black"
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
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="nik"
                      >
                        NIK <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="nik"
                        type="text"
                        className="form-input w-full text-black"
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
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        No Telpon <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="phone_number"
                        type="text"
                        className="form-input w-full text-black"
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
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Email <span className="text-red-600"></span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="form-input w-full text-black"
                        placeholder="Masukkan alamat email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Tanggal Lahir <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="phone number"
                        type="date"
                        className="form-input w-full text-black"
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
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Tempat Lahir <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="tempat_lahir"
                        type="text"
                        className="form-input w-full text-black"
                        placeholder="Masukkan tempat lahir"
                        required
                        value={tempatLahir}
                        onChange={(e) => setTempatLahir(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="jenisKelamin">
                        Jenis Kelamin <span className="text-red-600">*</span>
                      </label>
                      <Select
                        value={jenisKelamin || undefined} // Ensure it's undefined if empty
                        onValueChange={(value) => setJenisKelamin(value)}
                      >
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki - Laki">Laki - Laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="agama">
                        Agama <span className="text-red-600">*</span>
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
                      <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="golonganDarah">
                        Golongan Darah <span className="text-red-600">*</span>
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
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Status Menikah <span className="text-red-600">*</span>
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
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Pendidikan Terakhir{" "}
                        <span className="text-red-600">*</span>
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
                          <SelectItem value="SD/Sederajat">
                            SD/Sederajat
                          </SelectItem>
                          <SelectItem value="SMP/Sederajat">
                            SMP/Sederajat
                          </SelectItem>
                          <SelectItem value="SMA/Sederajat">
                            SMA/Sederajat
                          </SelectItem>
                          <SelectItem value="DI/DII/DIII/Sederajat">
                            DI/DII/DIII/Sederajat
                          </SelectItem>
                          <SelectItem value="S1/DIV/Sederajat">
                            S1/DIV/Sederajat
                          </SelectItem>
                          <SelectItem value="S2/Sederajat">
                            S2/Sederajat
                          </SelectItem>
                          <SelectItem value="S3/Sederajat">
                            S3/Sederajat
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Kewarganegaraan <span className="text-red-600">*</span>
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
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Ibu Kandung <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="ibu_kandung"
                        type="text"
                        className="form-input w-full text-black"
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
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Negara Tujuan Bekerja{" "}
                      </label>
                      <input
                        id="negara_tujuan"
                        type="text"
                        className="form-input w-full text-black"
                        placeholder="Masukkan negara tujuan"
                        value={negaraTujuanBekerja}
                        onChange={(e) => setNegaraTujuanBekerja(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className={`${indexFormTab == 1 ? "block" : "hidden"}`}>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Provinsi <span className="text-red-600">*</span>
                      </label>
                      <Select>
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih provinsi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Jakarta">DKI Jakarta</SelectItem>
                          <SelectItem value="Jawa Tengah">
                            Jawa Tengah
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Kabupaten/Kota <span className="text-red-600">*</span>
                      </label>
                      <Select>
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih kabupaten/kota" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Jakarta Utara">
                            Jakarta Utara
                          </SelectItem>
                          <SelectItem value="Jakarta Timur">
                            Jakarta Timur
                          </SelectItem>
                          <SelectItem value="Jakarta Selatan">
                            Jakarta Selatan
                          </SelectItem>
                          <SelectItem value="Jakarta Barat">
                            Jakarta Barat
                          </SelectItem>
                          <SelectItem value="Jakarta Pusat">
                            Jakarta Pusat
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Kecamatan <span className="text-red-600">*</span>
                      </label>
                      <Select>
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder="Pilih kecamatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Menteng">Menteng</SelectItem>
                          <SelectItem value="Gambir">Gambir</SelectItem>
                          <SelectItem value="Glodok">Glodok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Alamat Domisili <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        id="phone number"
                        rows={4}
                        placeholder={alamat}
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        className="form-input w-full text-black"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className={`${indexFormTab == 2 ? "block" : "hidden"}`}>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Status <span className="text-red-600">*</span>
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
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="email"
                          >
                            Pekerjaan
                            <span className="text-red-600">*</span> <br />
                            <span className="text-gray-500">
                              Jika tidak ada isi (-)
                            </span>
                          </label>
                          <input
                            id="phone number"
                            type="text"
                            value={pekerjaan}
                            onChange={(e) => setPekerjaan(e.target.value)}
                            className="form-input w-full text-black"
                            placeholder="Masukkan Nama Perusahaan/Tempat Kerja"
                            required
                          />
                        </div>
                      </div>
                      {/* <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="email"
                          >
                            Nama Perusahaan Tempat Kerja/Kelompok{" "}
                            <span className="text-red-600">*</span> <br />
                            <span className="text-gray-500">
                              Jika tidak ada isi (-)
                            </span>
                          </label>
                          <input
                            id="phone number"
                            type="text"

                            className="form-input w-full text-black"
                            placeholder="Masukkan Nama Perusahaan/Tempat Kerja"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="email"
                          >
                            Lokasi Perusahaan Tempat Kerja/Kelompok{" "}
                            <span className="text-red-600">*</span> <br />
                            <span className="text-gray-500">
                              Jika tidak ada isi (-)
                            </span>
                          </label>
                          <input
                            id="phone number"
                            type="text"

                            className="form-input w-full text-black"
                            placeholder="Masukkan Lokasi Perusahaan/Tempat Kerja"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="email"
                          >
                            Gaji <span className="text-red-600">*</span> <br />
                            <span className="text-gray-500">
                              Jika tidak ada isi (-)
                            </span>
                          </label>
                          <input
                            id="phone number"
                            type="number"
                           
                            className="form-input w-full text-black"
                            placeholder="Masukkan gaji"
                            required
                          />
                        </div>
                      </div> */}
                    </> : selectedStatus == 'Taruna Satuan Pendidikan KP' ? <>
                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="email"
                          >
                            Asal Satuan Pendidikan
                            <span className="text-red-600">*</span> <br />
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
                      {/* <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="email"
                          >
                            Jurusan/Program Studi{" "}
                            <span className="text-red-600">*</span> <br />
                            <span className="text-gray-500">
                              Jika tidak ada isi (-)
                            </span>
                          </label>
                          <input
                            id="phone number"
                            type="text"
                            className="form-input w-full text-black"
                            placeholder="Masukkan Nama Perusahaan/Tempat Kerja"
                            required
                          />
                        </div>
                      </div> */}

                    </> : <></>
                  }

                </div>
                <div className={`${indexFormTab == 3 ? "block" : "hidden"}`}>
                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3 ">
                      <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">
                        File Surat Kesehatan
                        <br />
                        <span className="text-gray-600">
                          Anda wajib mengisi dokumen ini karena mempunya surat kesehatan
                        </span>
                      </label>
                      <input
                        type="file"
                        className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                        required
                        onChange={handleSuratKesehatanChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3 ">
                      <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">
                        Pas Foto
                      </label>
                      <input
                        type="file"
                        className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                        required
                        onChange={handleFotoChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3 ">
                      <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">
                        File KTP
                      </label>
                      <input
                        type="file"
                        className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                        required
                        onChange={handleKtpChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3">
                      <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">
                        File Kartu Keluarga
                      </label>
                      <input
                        type="file"
                        className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                        required
                        onChange={handleKkChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap -mx-3 mb-1">
                    <div className="w-full px-3 ">
                      <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">
                        Ijazah
                      </label>
                      <input
                        type="file"
                        className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                        required
                        onChange={handleIjazahChange}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-800 text-left mt-3">
                    Demi alasan keamanan maka Anda wajib mengisi foto/file
                    <span className="underline text-blue-500 font-medium"> KTP, KK, Akta, Ijazah</span> untuk memvalidasi kepemilikan KTP.
                  </div>


                </div>
                <div className="flex -mx-3 mt-5 gap-2 px-3">
                  <div className={`w-full ${indexFormTab == 0 && "hidden"}`}>
                    <button
                      type="submit"
                      className="btn text-white bg-blue-600 hover:bg-blue-700 w-full"
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
                      onClick={(e) => setIndexFormTab(indexFormTab + 1)}
                      className="btn text-white bg-blue-600 hover:bg-blue-700 w-full"
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
                      className="btn text-white flex items-center justify-center bg-blue-600 hover:bg-blue-700 w-full"
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
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default FormCompleteProfile;
