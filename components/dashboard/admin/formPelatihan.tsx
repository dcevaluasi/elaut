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
import React, { ChangeEvent, FormEvent, useRef } from "react";

import { BiBed } from "react-icons/bi";

import { TbFileStack, TbSchool } from "react-icons/tb";

import { Progress } from "@/components/ui/progress";
import { MdOutlineFastfood } from "react-icons/md";
import { Editor } from "@tinymce/tinymce-react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { HiUserGroup } from "react-icons/hi2";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import axios, { AxiosResponse } from "axios";
import { CheckedState } from "@radix-ui/react-checkbox";
import { refresh } from "aos";
import { extractLastSegment, generateRandomString } from "@/utils";
import Cookies from "js-cookie";
import { PelatihanMasyarakat } from "@/types/product";
import Image from "next/image";
import { convertIdSarpras } from "@/utils/pelatihan";

type Checked = DropdownMenuCheckboxItemProps["checked"];

function FormPelatihan({ edit = false }: { edit: boolean }) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const pathname = usePathname();
  const id = extractLastSegment(pathname);

  /* state variable to store basic user information to register */
  const [name, setName] = React.useState<string>("");
  const [nik, setNik] = React.useState<string>("");
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");

  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This smooth scrolling is optional, you can remove it if you want instant scrolling
    });
  };

  const [isInputError, setIsInputError] = React.useState(false);

  const editorRef = useRef(null);

  /*
    state variables for posting & updating public training data
  */
  const [idLemdik, setIdLemdik] = React.useState("");
  const [kodePelatihan, setKodePelatihan] = React.useState(
    generateRandomString()
  );
  const [namaPelatihan, setNamaPelatihan] = React.useState("");
  const [penyelenggaraPelatihan, setPenyelenggaraPelatihan] =
    React.useState("BPPP Tegal");
  const [detailPelatihan, setDetailPelatihan] = React.useState("");
  const [jenisPelatihan, setJenisPelatihan] = React.useState("");
  const [bidangPelatihan, setBidangPelatihan] = React.useState("");
  const [dukunganProgramTerobosan, setDukunganProgramTerobosan] =
    React.useState("");
  const [tanggalMulaiPelatihan, setTanggalMulaiPelatihan] = React.useState("");
  const [tanggalBerakhirPelatihan, setTanggalBerakhirPelatihan] =
    React.useState("");
  const [hargaPelatihan, setHargaPelatihan] = React.useState<number>(0);
  const [instruktur, setInstruktur] = React.useState("");
  const [fotoPelatihan, setFotoPelatihan] = React.useState(null);
  const [status, setStatus] = React.useState("");
  const [memoPusat, setMemoPusat] = React.useState("");
  const [silabusPelatihan, setSilabusPelatihan] = React.useState(null);
  const [lokasiPelatihan, setLokasiPelatihan] = React.useState("");
  const [pelaksanaanPelatihan, setPelaksanaanPelatihan] = React.useState("");
  const [ujiKompetensi, setUjiKompetensi] = React.useState("");
  const [kuotaPelatihan, setKuotaPelatihan] = React.useState("");
  const [asalPelatihan, setAsalPelatihan] = React.useState("");
  const [jenisSertifikat, setJenisSertifikat] = React.useState("");
  const [ttdSertifikat, setTtdSertifikat] = React.useState("");
  const [noSertifikat, setNoSertifikat] = React.useState("");
  const [idSaranaPrasarana, setIdSaranaPrasarana] = React.useState("");
  const [idKonsumsi, setIdKonsumsi] = React.useState("");

  /*
    method for resting all state data public traning (RESET)
  */
  const logAllStates = () => {
    console.log("idLemdik:", idLemdik);
    console.log("kodePelatihan:", kodePelatihan);
    console.log("namaPelatihan:", namaPelatihan);
    console.log("penyelenggaraPelatihan:", penyelenggaraPelatihan);
    console.log("detailPelatihan:", detailPelatihan);
    console.log("jenisPelatihan:", jenisPelatihan);
    console.log("bidangPelatihan:", bidangPelatihan);
    console.log("dukunganProgramTerobosan:", dukunganProgramTerobosan);
    console.log("tanggalMulaiPelatihan:", tanggalMulaiPelatihan);
    console.log("tanggalBerakhirPelatihan:", tanggalBerakhirPelatihan);
    console.log("hargaPelatihan:", hargaPelatihan);
    console.log("instruktur:", instruktur);
    console.log("fotoPelatihan:", fotoPelatihan);
    console.log("status:", status);
    console.log("memoPusat:", memoPusat);
    console.log("silabusPelatihan:", silabusPelatihan);
    console.log("lokasiPelatihan:", lokasiPelatihan);
    console.log("pelaksanaanPelatihan:", pelaksanaanPelatihan);
    console.log("ujiKompetensi:", ujiKompetensi);
    console.log("kuotaPelatihan:", kuotaPelatihan);
    console.log("asalPelatihan:", asalPelatihan);
    console.log("jenisSertifikat:", jenisSertifikat);
    console.log("ttdSertifikat:", ttdSertifikat);
    console.log("noSertifikat:", noSertifikat);
    console.log("idSaranaPrasarana:", idSaranaPrasarana);
    console.log("idKonsumsi:", idKonsumsi);
  };

  const resetAllStateToEmptyString = () => {
    setIdLemdik("");
    setKodePelatihan("");
    setNamaPelatihan("");
    setPenyelenggaraPelatihan("");
    setDetailPelatihan("");
    setJenisPelatihan("");
    setBidangPelatihan("");
    setDukunganProgramTerobosan("");
    setTanggalMulaiPelatihan("");
    setTanggalBerakhirPelatihan("");
    setHargaPelatihan(0);
    setInstruktur("");
    setFotoPelatihan(null);
    setStatus("");
    setMemoPusat("");
    setSilabusPelatihan(null);
    setLokasiPelatihan("");
    setPelaksanaanPelatihan("");
    setUjiKompetensi("");
    setKuotaPelatihan("");
    setAsalPelatihan("");
    setJenisSertifikat("");
    setTtdSertifikat("");
    setNoSertifikat("");
    setIdSaranaPrasarana("");
    setIdKonsumsi("");
  };

  const [detailPelatihanById, setDetailPelatihanById] =
    React.useState<PelatihanMasyarakat | null>(null);
  const [fotoPelatihanOld, setFotoPelatihanOld] = React.useState<string>("");
  const handleFetchingPelatihanById = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/getPelatihanUser?idPelatihan=${id}`
      );
      setDetailPelatihanById(response.data);
      setNamaPelatihan(response.data.NamaPelatihan);
      setTanggalMulaiPelatihan(response.data.TanggalMulaiPelatihan);
      setTanggalBerakhirPelatihan(response.data.TanggalBerakhirPelatihan);
      setPenyelenggaraPelatihan(response.data.PenyelenggaraPelatihan);
      setJenisPelatihan(response.data.JenisPelatihan);
      setLokasiPelatihan(response.data.LokasiPelatihan);
      setPelaksanaanPelatihan(response.data.PelaksanaanPelatihan);
      setBidangPelatihan(response.data.BidangPelatihan);
      setDukunganProgramTerobosan(response.data.DukunganProgramTerobosan);
      setHargaPelatihan(response.data.HargaPelatihan);
      setDetailPelatihan(response.data.DetailPelatihan);
      setFotoPelatihanOld(response.data.FotoPelatihan);
      setAsalPelatihan(response.data.AsalPelatihan);
      setKuotaPelatihan(response.data.KoutaPelatihan);
      console.log("PELATIHANN BY ID: ", response);
    } catch (error) {
      console.error("ERROR PELATIHAN BY ID: ", error);
    }
  };

  console.log("PELATIHAN DETAI BY ID STATE: ", detailPelatihanById);

  /*
    method for processing posting data public traning (POST)
  */
  const handlePostingPublicTrainingData = async (e: any) => {
    e.preventDefault();
    console.log({ fotoPelatihan });

    logAllStates();

    const data = new FormData();

    data.append("IdLemdik", idLemdik);
    data.append("KodePelatihan", kodePelatihan);
    data.append("NamaPelatihan", namaPelatihan);
    data.append("PenyelenggaraPelatihan", penyelenggaraPelatihan);
    data.append("DetailPelatihan", detailPelatihan);
    data.append("JenisPelatihan", jenisPelatihan);
    data.append("BidangPelatihan", bidangPelatihan);
    data.append("DukunganProgramTerobosan", dukunganProgramTerobosan);
    data.append("TanggalMulaiPelatihan", tanggalMulaiPelatihan);
    data.append("TanggalBerakhirPelatihan", tanggalBerakhirPelatihan);
    data.append("HargaPelatihan", hargaPelatihan.toString());
    data.append("Instruktur", instruktur);
    if (fotoPelatihan !== null) {
      data.append("photo_pelatihan", fotoPelatihan);
    }
    data.append("Status", status);
    data.append("MemoPusat", memoPusat);
    if (silabusPelatihan !== null) {
      data.append("SilabusPelatihan", silabusPelatihan);
    }
    data.append("LokasiPelatihan", lokasiPelatihan);
    data.append("PelaksanaanPelatihan", pelaksanaanPelatihan);
    data.append("UjiKompetensi", ujiKompetensi);
    data.append("KoutaPelatihan", kuotaPelatihan);
    data.append("AsalPelatihan", asalPelatihan);
    data.append("JenisSertifikat", jenisSertifikat);
    data.append("TtdSertifikat", ttdSertifikat);
    data.append("NoSertifikat", noSertifikat);
    data.append("IdSaranaPrasarana", convertIdSarpras(selectedSarpras));
    data.append("IdKonsumsi", idKonsumsi);

    try {
      const response: AxiosResponse = await axios.post(
        `${baseUrl}/lemdik/createPelatihan`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log({ data });
      console.log("Training data posted successfully:", response.data);
      Toast.fire({
        icon: "success",
        title: `Berhasil menambahkan pelatihan baru!`,
      });
      resetAllStateToEmptyString();
      router.push("/admin/lemdiklat/pelatihan");
    } catch (error) {
      console.error("Error posting training data:", error);
      Toast.fire({
        icon: "error",
        title: `Gagal menambahkan pelatihan baru!`,
      });
      throw error;
    }
  };

  const handleFileChange = (e: any) => {
    setFotoPelatihan(e.target.files[0]);
  };

  const handleSilabusChange = (e: any) => {
    setSilabusPelatihan(e.target.files[0]);
  };

  const [formTab, setFormTab] = React.useState("FormDataPelatihan");
  const [indexFormTab, setIndexFormTab] = React.useState(0);

  console.log({ indexFormTab });
  console.log({ formTab });

  type Sarpras = {
    IdSarpras: number;
    IdLemdik: number;
    NamaSarpras: string;
    Harga: number;
    Deskripsi: string;
    Jenis: string;
    CreatedAt: string;
    UpdatedAt: string;
  };

  const [isFacility, setIsFacility] = React.useState("Tidak");
  const [isConsume, setIsConsume] = React.useState("Tidak");

  const [sarpras, setSarpras] = React.useState<Sarpras[]>([]);
  const [konsumsi, setKonsumsi] = React.useState<Sarpras[]>([]);

  const token = Cookies.get("XSRF091");

  const [selectedSarpras, setSelectedSarpras] = React.useState<number[]>([]);
  console.log({ selectedSarpras });

  const handleFetchingSarprasData = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getSarpras?jenis_sarpras=Penginapan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log({ response });
      setSarpras(response.data.data);
    } catch (error) {
      console.error("Error fetching data sarpras:", error);
      throw error;
    }
  };

  const handleFetchingKonsumsiData = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getSarpras?jenis_sarpras=Konsumsi`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log({ response });
      setKonsumsi(response.data.data);
    } catch (error) {
      console.error("Error fetching data konsumsi:", error);
      throw error;
    }
  };

  console.log({ konsumsi });

  React.useEffect(() => {
    handleFetchingSarprasData();
    handleFetchingKonsumsiData();
    if (edit) {
      handleFetchingPelatihanById();
    }
  }, []);

  return (
    <section className="relative w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:-mt-8">
        <div className="pb-12 md:pb-20">
          {/* Form */}
          <form className="mt-5">
            <fieldset>
              <div className="flex items-center justify-between">
                {indexFormTab == 0 ? (
                  <div className="flex flex-col gap-1 my-4">
                    <h2 className="font-bold text-2xl leading-[100%] md:text-2xl text-black font-calsans flex items-center gap-1">
                      <TbSchool />
                      <span className="mt-2">
                        {edit && "Edit"} Data Pelatihan
                      </span>
                    </h2>
                    <p className="text-sm text-gray-600 max-w-md">
                      Lengkapi data pelatihan yang akan disimpan dalam database
                      dengan detail!
                    </p>
                  </div>
                ) : indexFormTab == 1 ? (
                  <h2 className="font-bold text-2xl leading-[100%] my-6 md:text-2xl text-black font-calsans flex items-center gap-1">
                    <HiUserGroup />
                    <span className="mt-2">Peserta Pelatihan</span>
                  </h2>
                ) : indexFormTab == 2 ? (
                  <h2 className="font-bold text-2xl leading-[100%] my-6 md:text-2xl text-black font-calsans flex items-center gap-1">
                    <BiBed />
                    <span className="mt-1">Fasilitas Penginapan</span>
                  </h2>
                ) : (
                  <h2 className="font-bold text-2xl leading-[100%] my-6 md:text-2xl text-black font-calsans flex items-center gap-1">
                    <MdOutlineFastfood />
                    <span className="mt-2">Paket Konsumsi</span>
                  </h2>
                )}

                <p className="text-base">
                  {indexFormTab == 0 ? (
                    <span
                      className={`font-bold  leading-[100%] my-6 ${
                        edit ? "text-yellow-500" : "text-blue-500"
                      } `}
                    >
                      1
                    </span>
                  ) : indexFormTab == 1 ? (
                    <span
                      className={`font-bold  leading-[100%] my-6 ${
                        edit ? "text-yellow-500" : "text-blue-500"
                      } `}
                    >
                      2
                    </span>
                  ) : indexFormTab == 2 ? (
                    <span
                      className={`font-bold  leading-[100%] my-6 ${
                        edit ? "text-yellow-500" : "text-blue-500"
                      } `}
                    >
                      3
                    </span>
                  ) : (
                    <span
                      className={`font-bold  leading-[100%] my-6 ${
                        edit ? "text-yellow-500" : "text-blue-500"
                      } `}
                    >
                      4
                    </span>
                  )}{" "}
                  of 4
                </p>
              </div>
              <div className="flex w-full -mt-2 mb-4">
                <Progress value={(indexFormTab + 1) * 25} max={100} />
              </div>
              {indexFormTab == 0 && (
                <>
                  {" "}
                  <div className={`${indexFormTab == 0 ? "block" : "hidden"}`}>
                    <div className="flex gap-2 w-full">
                      <div className="flex flex-wrap -mx-3 mb-1 w-full">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="kodePelatihan"
                          >
                            Kode Pelatihan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="kodePelatihan"
                            type="text"
                            className="form-input w-full text-black border-gray-300 rounded-md"
                            placeholder="Masukkan kode pelatihan"
                            required
                            value={kodePelatihan}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-1 w-full">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="namaPelatihan"
                          >
                            Nama Pelatihan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="namaPelatihan"
                            type="text"
                            className="form-input w-full text-black border-gray-300 rounded-md"
                            placeholder="Masukkan nama pelatihan"
                            required
                            value={namaPelatihan}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setNamaPelatihan(e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <div className="flex flex-wrap -mx-3 mb-1 w-full">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="kodePelatihan"
                          >
                            Tanggal Mulai Pelatihan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="kodePelatihan"
                            type="date"
                            className="form-input w-full text-black border-gray-300 rounded-md"
                            placeholder="Masukkan kode pelatihan"
                            required
                            value={tanggalMulaiPelatihan}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setTanggalMulaiPelatihan(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-1 w-full">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="namaPelatihan"
                          >
                            Tanggal Berakhir Pelatihan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="namaPelatihan"
                            type="date"
                            className="form-input w-full text-black border-gray-300 rounded-md"
                            placeholder="Masukkan nama pelatihan"
                            required
                            value={tanggalBerakhirPelatihan}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setTanggalBerakhirPelatihan(e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap  mb-1 w-full">
                      <div className="w-full">
                        <label
                          className="block text-gray-800 text-sm font-medium mb-1"
                          htmlFor="penyelenggaraPelatihan"
                        >
                          Cover Pelatihan{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        {edit && (
                          <Image
                            src={
                              "https://api-elaut.ikulatluh.cloud/public/static/pelatihan/" +
                              fotoPelatihanOld
                            }
                            alt={namaPelatihan}
                            width={0}
                            height={0}
                            className="w-full h-80 mb-5 rounded-2xl object-cover"
                          />
                        )}

                        <input
                          id="file_excel"
                          type="file"
                          className=" cursor-pointer w-full border border-neutral-200 rounded-md"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <div className="flex flex-wrap -mx-3 mb-1 w-full">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="penyelenggaraPelatihan"
                          >
                            Penyelenggara Pelatihan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="penyelenggaraPelatihan"
                            type="text"
                            className="form-input w-full text-black border-gray-300 rounded-md"
                            placeholder="BPPP Tegal"
                            required
                            value={penyelenggaraPelatihan}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setPenyelenggaraPelatihan(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-1 w-full">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="jensiPelatihan"
                          >
                            Jenis Pelatihan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <Select
                            value={jenisPelatihan}
                            onValueChange={(value: string) =>
                              setJenisPelatihan(value)
                            }
                          >
                            <SelectTrigger className="w-full text-base py-5">
                              <SelectValue placeholder="Pilih jenis pelatihan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Aspirasi">Aspirasi</SelectItem>
                              <SelectItem value="PNBP/BLU">PNBP/BLU</SelectItem>
                              <SelectItem value="Reguler">Reguler</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <div className="flex flex-wrap -mx-3 mb-1 w-full">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="lokasiPelatihan"
                          >
                            Lokasi Pelatihan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="lokasiPelatihan"
                            type="text"
                            className="form-input w-full text-black border-gray-300 rounded-md"
                            placeholder="Masukkan lokasi pelatihan"
                            required
                            value={lokasiPelatihan}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setLokasiPelatihan(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-1 w-full">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="pelaksanaanPelatihan"
                          >
                            Pelaksanaan Pelatihan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <Select
                            value={pelaksanaanPelatihan}
                            onValueChange={(value: string) =>
                              setPelaksanaanPelatihan(value)
                            }
                          >
                            <SelectTrigger className="w-full text-base py-5">
                              <SelectValue placeholder="Pilih pelaksanaan pelatihan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Online">Online</SelectItem>
                              <SelectItem value="Offline/Klasikal">
                                Klasikal
                              </SelectItem>
                              <SelectItem value="Online+Offline/Blended">
                                Blended
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <div className="flex flex-wrap -mx-3 mb-1 w-full">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="bidangPelatihan"
                          >
                            Bidang Pelatihan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <Select
                            value={bidangPelatihan}
                            onValueChange={(value: string) =>
                              setBidangPelatihan(value)
                            }
                          >
                            <SelectTrigger className="w-full text-base py-5">
                              <SelectValue placeholder="Pilih bidang pelatihan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Budidaya">Budidaya</SelectItem>
                              <SelectItem value="Penangkapan">
                                Penangkapan
                              </SelectItem>
                              <SelectItem value="Kepelautan">
                                Kepelautan
                              </SelectItem>
                              <SelectItem value="Pengolahan dan Pemasaran">
                                Pengolahan dan Pemasaran
                              </SelectItem>
                              <SelectItem value="Mesin Perikanan">
                                Mesin Perikanan
                              </SelectItem>
                              <SelectItem value="Konservasi">
                                Konservasi
                              </SelectItem>
                              <SelectItem value="Wisata Bahari">
                                Wisata Bahari
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-1 w-full">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="dukunganProgramTerobosan"
                          >
                            Dukungan Program Prioritas{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <Select
                            value={dukunganProgramTerobosan}
                            onValueChange={(value: string) =>
                              setDukunganProgramTerobosan(value)
                            }
                          >
                            <SelectTrigger className="w-full text-base py-5">
                              <SelectValue placeholder="Pilih dukungan program" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Non Terobosan">
                                Non Terobosan
                              </SelectItem>
                              <SelectItem value="Konservasi">
                                Konservasi
                              </SelectItem>
                              <SelectItem value="PIT">PIT</SelectItem>
                              <SelectItem value="Kalaju/Kalamo">
                                Kalaju/Kalamo
                              </SelectItem>
                              <SelectItem value="Budidaya">Budidaya</SelectItem>
                              <SelectItem value="Pengawasan Pesisir">
                                Pengawasan Pesisir
                              </SelectItem>
                              <SelectItem value="BCL">BCL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap  mb-1 w-full">
                      <div className="w-full">
                        <label
                          className="block text-gray-800 text-sm font-medium mb-1"
                          htmlFor="penyelenggaraPelatihan"
                        >
                          Silabus Pelatihan{" "}
                          <span className="text-red-600">*</span>
                        </label>

                        <input
                          id="file_excel"
                          type="file"
                          className=" cursor-pointer w-full border border-neutral-200 rounded-md"
                          onChange={handleSilabusChange}
                        />
                      </div>
                    </div>

                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="ujiKompetensi"
                      >
                        Dengan Uji Kompetensi{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <div>
                          <Checkbox
                            onCheckedChange={(checked: CheckedState) =>
                              setUjiKompetensi(checked.toString())
                            }
                          />
                        </div>
                        <div className="space-y-1 leading-none">
                          <label>Uji Kompetensi Pelatihan</label>
                          <p className="text-xs text-gray-600">
                            You can manage your mobile notifications in the
                            page.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap mb-1 w-full">
                      <div className="w-full">
                        <label
                          className="block text-gray-800 text-sm font-medium mb-1"
                          htmlFor="hargaPelatihan"
                        >
                          Harga Pelatihan{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <input
                          id="name"
                          type="number"
                          className="form-input w-full text-black border-gray-300 rounded-md"
                          placeholder="Rp"
                          required
                          value={hargaPelatihan}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setHargaPelatihan(parseInt(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-1">
                      <div className="w-full px-3">
                        <label
                          className="block text-gray-800 text-sm font-medium mb-1"
                          htmlFor="detailPelatithan"
                        >
                          Deksripsi dan Detail Pelatihan{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <Editor
                          apiKey="3iks15ku1opgl6rw13vgbcijulz9ajw2muuon534xraretcy"
                          value={detailPelatihan}
                          onEditorChange={(content: string, editor: any) =>
                            setDetailPelatihan(content)
                          }
                          init={{
                            height: 500,
                            menubar: false,
                            plugins: [
                              "advlist autolink lists link image charmap print preview anchor",
                              "searchreplace visualblocks code fullscreen",
                              "insertdatetime media table paste code help wordcount",
                            ],
                            toolbar:
                              "undo redo | formatselect | " +
                              "bold italic backcolor | alignleft aligncenter " +
                              "alignright alignjustify | bullist numlist outdent indent | " +
                              "removeformat | help",

                            content_style:
                              "body { font-family:Plus Jakarta Sans,Arial,sans-serif; font-size:14px }",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {indexFormTab == 1 && (
                <>
                  <div className={`${indexFormTab == 1 ? "block" : "hidden"}`}>
                    <div className="flex gap-1 w-full">
                      <div className="flex w-full flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="asalPesertaPelatihan"
                          >
                            Asal Peserta Pelatihan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <Select
                            value={asalPelatihan}
                            onValueChange={(value: string) =>
                              setAsalPelatihan(value)
                            }
                          >
                            <SelectTrigger className="w-full text-base py-6">
                              <SelectValue placeholder="Pilih asal peserta" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Masyarakat Umum">
                                Masyarakat Umum
                              </SelectItem>
                              <SelectItem
                                value="Karyawan/Pegawai dari
                    PT/Mitra/Kelompok/Instansi/Sekolah/Universitas"
                              >
                                Karyawan/Pegawai dari
                                PT/Mitra/Kelompok/Instansi/Sekolah/Universitas
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flexw w-full flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="kuotaPeserta"
                          >
                            Kuota Peserta{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <input
                            id="kuotaPeserta"
                            value={kuotaPelatihan}
                            onChange={(e: any) =>
                              setKuotaPelatihan(e.target.value)
                            }
                            type="number"
                            className="form-input w-full text-black border-gray-300 rounded-md py-3"
                            placeholder="(Orang)"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-1">
                      <div className="w-full px-3">
                        <label
                          className="block text-gray-800 text-sm font-medium mb-1"
                          htmlFor="email"
                        >
                          Data by Name by Address Peserta Pelatihan{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="file"
                            className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                            required
                          />
                          <button
                            type="submit"
                            className="btn text-white bg-green-600 hover:bg-green-700 py-0 w-[250px] px-0 text-sm"
                            onClick={(e) => {
                              setIndexFormTab(indexFormTab + 1);
                              scrollToTop();
                            }}
                          >
                            <PiMicrosoftExcelLogoFill />
                            Unduh Template
                          </button>
                        </div>
                        <p className="text-gray-700 text-xs mt-1">
                          *Jika asal peserta merupakan Karyawan/Pegawai dari
                          PT/Mitra/Kelompok/Instansi/Sekolah/Universitas
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {indexFormTab == 2 && (
                <>
                  <div className={`${indexFormTab == 2 ? "block" : "hidden"}`}>
                    <div className="flex flex-wrap -mx-3 mb-1">
                      <div className="w-full px-3">
                        <label
                          className="block text-gray-800 text-sm font-medium mb-1"
                          htmlFor="email"
                        >
                          Sediakan Fasilitas Penginapan{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <Select onValueChange={(value) => setIsFacility(value)}>
                          <SelectTrigger className="w-full text-base py-6">
                            <SelectValue placeholder="Sediakan fasilitas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ya">Ya</SelectItem>
                            <SelectItem value="Tidak">Tidak</SelectItem>
                            <SelectItem value="Gratis">Gratis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {isFacility != "Tidak" && (
                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="email"
                          >
                            Pilih Paket Fasilitas Penginapan{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <div className="flex flex-col gap-2">
                            {sarpras.map((item, index) => (
                              <div
                                key={index}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow"
                              >
                                <div>
                                  <Checkbox
                                    onCheckedChange={(e) =>
                                      selectedSarpras.push(item.IdSarpras)
                                    }
                                  />
                                </div>
                                <div className="space-y-1 leading-none">
                                  <label>
                                    {item.NamaSarpras} Rp. {item.Harga}
                                  </label>
                                  <p className="text-xs text-gray-600">
                                    {item.Deskripsi}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {indexFormTab == 3 && (
                <>
                  <div className={`${indexFormTab == 3 ? "block" : "hidden"}`}>
                    <div className="flex flex-wrap -mx-3 mb-1">
                      <div className="w-full px-3">
                        <label
                          className="block text-gray-800 text-sm font-medium mb-1"
                          htmlFor="email"
                        >
                          Sediakan Paket Konsumsi{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <Select onValueChange={(value) => setIsConsume(value)}>
                          <SelectTrigger className="w-full text-base py-6">
                            <SelectValue placeholder="Sediakan paket konsumsi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ya">Ya</SelectItem>
                            <SelectItem value="Tidak">Tidak</SelectItem>
                            <SelectItem value="Gratis">Gratis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {isConsume !== "Tidak" && (
                      <div className="flex flex-wrap -mx-3 mb-1">
                        <div className="w-full px-3">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="email"
                          >
                            Pilih Paket Konsumsi{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <div className="flex flex-col gap-2">
                            {konsumsi.map((item, index) => (
                              <div
                                key={index}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow"
                              >
                                <div>
                                  <Checkbox
                                    onCheckedChange={(e) =>
                                      selectedSarpras.push(item.IdSarpras)
                                    }
                                  />
                                </div>
                                <div className="space-y-1 leading-none">
                                  <label>
                                    {item.NamaSarpras} Rp. {item.Harga}
                                  </label>
                                  <p className="text-xs text-gray-600">
                                    {item.Deskripsi}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              <div className="flex -mx-3 mt-5 gap-2 px-3">
                <div
                  className={`w-full ${
                    indexFormTab == 0 || indexFormTab == 3 ? "hidden" : "block"
                  }`}
                >
                  <button
                    type="button"
                    className={`btn text-white ${
                      edit
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-blue-500 hover:bg-blue-600"
                    }  w-full`}
                    onClick={(e) => {
                      setIndexFormTab(indexFormTab - 1);
                      scrollToTop();
                    }}
                  >
                    Sebelumnya
                  </button>
                </div>
                <div
                  className={`w-full ${indexFormTab == 3 ? "block" : "hidden"}`}
                >
                  <button
                    type="submit"
                    onClick={(e: any) => handlePostingPublicTrainingData(e)}
                    className={`btn text-white ${
                      edit
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-blue-500 hover:bg-blue-600"
                    } w-full`}
                  >
                    Upload Pelatihan
                  </button>
                </div>
                <div
                  className={`w-full ${indexFormTab == 3 ? "hidden" : "block"}`}
                >
                  <button
                    type="button"
                    className={`btn text-white ${
                      edit
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-blue-500 hover:bg-blue-600"
                    } w-full`}
                    onClick={(e) => {
                      setIndexFormTab(indexFormTab + 1);
                      scrollToTop();
                    }}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </section>
  );
}

export default FormPelatihan;
