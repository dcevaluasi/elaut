"use client";

import Toast from "@/commons/Toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import React, { ChangeEvent } from "react";
import { BiInfoCircle } from "react-icons/bi";
import { TbClock, TbSchool } from "react-icons/tb";
import axios, { AxiosResponse } from "axios";
import { generateRandomString } from "@/utils";
import Cookies from "js-cookie";
import { RiVerifiedBadgeLine } from "react-icons/ri";
import { HashLoader } from "react-spinners";
import addData from "@/firebase/firestore/addData";
import { generateTimestamp } from "@/utils/time";
import { UPT } from "@/constants/nomenclatures";
import { DUKUNGAN_PROGRAM_TEROBOSAN, JENIS_PELAKSANAAN, JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN, JENIS_PENILAIAN_PELATIHAN, PENANDATANGAN_SERTIFIKAT, PROGRAM_SISJAMU, RUMPUN_PELATIHAN, SEKTOR_PELATIHAN } from "@/constants/pelatihan";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { ProgramPelatihan, RumpunPelatihan } from "@/types/program";
import ManageProgramPelatihanAction from "@/commons/actions/master/program-pelatihan/ManageProgramPelatihanAction";

function FormPelatihan({ edit = false }: { edit: boolean }) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const [selectedRumpunPelatihan, setSelectedRumpunPelatihan] = React.useState<RumpunPelatihan | null>(null)
  const { data: dataRumpunPelatihan, loading: loadingRumpunPelatihan, error: errorRumpunPelatihan, fetchRumpunPelatihan } = useFetchDataRumpunPelatihan();

  const token = Cookies.get("XSRF091");

  const penyelenggara = Cookies.get('Satker')
  const idUnitKerja = Cookies.get('IDUnitKerja')!
  const [kodePelatihan, setKodePelatihan] = React.useState(
    generateRandomString()
  );
  const [namaPelatihan, setNamaPelatihan] = React.useState("Pelatihan");
  const [namaPelatihanInggris, setNamaPelatihanInggris] = React.useState("");
  const [penyelenggaraPelatihan, setPenyelenggaraPelatihan] = React.useState(
    penyelenggara
  );
  const [jenisPelatihan, setJenisPelatihan] = React.useState("");
  const [bidangPelatihan, setBidangPelatihan] = React.useState("");
  const [dukunganProgramTerobosan, setDukunganProgramTerobosan] =
    React.useState("");
  const [tanggalMulaiPelatihan, setTanggalMulaiPelatihan] = React.useState("");
  const [tanggalBerakhirPelatihan, setTanggalBerakhirPelatihan] =
    React.useState("");
  const [hargaPelatihan, setHargaPelatihan] = React.useState<number>(0);
  const [status, setStatus] = React.useState("");
  const [lokasiPelatihan, setLokasiPelatihan] = React.useState("");
  const [pelaksanaanPelatihan, setPelaksanaanPelatihan] = React.useState("");
  const [ujiKompetensi, setUjiKompetensi] = React.useState("");
  const [asalPelatihan, setAsalPelatihan] = React.useState("");
  const [jenisSertifikat, setJenisSertifikat] = React.useState("");
  const [ttdSertifikat, setTtdSertifikat] = React.useState("");
  const [program, setProgram] = React.useState<string>("");
  const [jenisProgram, setJenisProgram] = React.useState<string>("");

  const isFormValid =
    kodePelatihan &&
    namaPelatihan &&
    penyelenggaraPelatihan &&
    jenisPelatihan &&
    bidangPelatihan &&
    dukunganProgramTerobosan &&
    tanggalMulaiPelatihan &&
    tanggalBerakhirPelatihan &&
    program &&
    jenisProgram &&
    lokasiPelatihan &&
    pelaksanaanPelatihan

  const resetAllStateToEmptyString = () => {
    setKodePelatihan("");
    setNamaPelatihan("");
    setNamaPelatihanInggris("");
    setPenyelenggaraPelatihan("");
    setJenisPelatihan("");
    setBidangPelatihan("");
    setDukunganProgramTerobosan("");
    setTanggalMulaiPelatihan("");
    setTanggalBerakhirPelatihan("");
    setHargaPelatihan(0);
    setStatus("");
    setProgram("");
    setJenisProgram("");
    setLokasiPelatihan("");
    setPelaksanaanPelatihan("");
    setAsalPelatihan("");
    setTtdSertifikat("");
    setJenisSertifikat("");
  };

  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  const handleAddHistoryPelatihan = async () => {
    try {
      const { result, error } = await addData('historical-training-notes', kodePelatihan, {
        historical: [
          {
            'created_at': generateTimestamp(),
            id: kodePelatihan,
            notes: `Telah membuka kelas pelatihan ${namaPelatihan}`,
            role: Cookies.get('Role'),
            upt: `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`
          }
        ],
        status: 'On Progress'
      })
    } catch (error) {
      console.log({ error })
    }
  }

  const handlePostingPublicTrainingData = async (e: any) => {
    e.preventDefault();
    setIsUploading(true);

    if (!isFormValid) {
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: "Gagal menambahkan pelatihan baru! Pastikan semua data sudah diisi."
      });
      setIsUploading(false);
      return;
    }
    const data = new FormData();
    data.append("KodePelatihan", kodePelatihan);
    data.append("NamaPelatihan", namaPelatihan);
    data.append("NamaPelathanInggris", namaPelatihanInggris);
    data.append("PenyelenggaraPelatihan", penyelenggaraPelatihan!);
    data.append("JenisPelatihan", jenisPelatihan);
    data.append("BidangPelatihan", bidangPelatihan);
    data.append("DukunganProgramTerobosan", dukunganProgramTerobosan);
    data.append("TanggalMulaiPelatihan", tanggalMulaiPelatihan);
    data.append("TanggalBerakhirPelatihan", tanggalBerakhirPelatihan);
    data.append("HargaPelatihan", hargaPelatihan.toString());
    data.append("Program", program);
    data.append("JenisProgram", jenisProgram);
    data.append("Status", status);
    data.append("UjiKompetensi", ujiKompetensi);
    data.append("LokasiPelatihan", lokasiPelatihan);
    data.append("PelaksanaanPelatihan", pelaksanaanPelatihan);
    data.append("StatusPenerbitan", '0');
    data.append("PemberitahuanDiterima", 'Proses Buka Kelas');
    data.append("AsalPelatihan", asalPelatihan);
    data.append("JenisSertifikat", jenisSertifikat);
    data.append("TtdSertifikat", PENANDATANGAN_SERTIFIKAT[1]);

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
      Toast.fire({
        icon: "success",
        title: `Yeayyy!`,
        text: 'Berhasil menambahkan pelatihan baru, silahkan membuka tab Daftar Pelatihan!'
      });
      handleAddHistoryPelatihan()
      setIsUploading(false);
      resetAllStateToEmptyString();
      router.push("/admin/lemdiklat/pelatihan");
    } catch (error) {
      console.error("Error posting training data:", error);
      Toast.fire({
        icon: "error",
        title: `Oopsss!`,
        text: 'Gagal menambahkan pelatihan baru!'
      });
      setIsUploading(false);
      throw error;
    }
  };

  return (
    <section className="relative w-full py-10">
      <div className="mx-auto px-4 sm:px-6 md:-mt-8">
        {/* Form */}
        {isUploading ? (
          <div className="my-32 w-full flex items-center justify-center">
            <HashLoader color="#338CF5" size={50} />
          </div>
        ) : (
          <form className="mt-5 w-full">
            <fieldset>
              {/* Headers */}
              <div className="flex flex-col gap-1 my-4">
                <h2 className="text-2xl leading-[100%] md:text-2xl text-black font-calsans flex items-center gap-1">
                  <TbSchool />
                  <span>
                    Buka Kelas Pelatihan
                  </span>
                </h2>
                <p className="text-sm text-gray-600">
                  Lengkapi form pembukaan kelas pelatihan berdasarkan isian yang tersedia dan cermati pengisian data!
                </p>
              </div>

              {/* Forms */}
              <div>
                {" "}
                <div
                >
                  <p className="text-base flex gap-2 border-b border-b-gray-300 pb-2 mb-2 items-center text-gray-900 font-semibold max-w-md">
                    <BiInfoCircle /> <span>Informasi Umum Pelatihan</span>
                  </p>

                  {/* Nama dan Lokasi Pelatihan */}
                  <div className="flex gap-2 w-full">
                    <div className="flex flex-wrap -mx-3 mb-1 w-full">
                      <div className="w-full px-3">
                        <label
                          className="block text-gray-600 text-sm font-medium mb-1"
                          htmlFor="namaKegiatan"
                        >
                          Nama Kegiatan{" "}
                          <span className="text-rose-600">*</span>
                        </label>
                        <input
                          id="namaKegiatan"
                          type="text"
                          className="form-input w-full text-black border-gray-300 rounded-md"
                          placeholder="Masukkan nama kegiatan"
                          required
                          value={namaPelatihan}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setNamaPelatihan(e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-1 w-full">
                      <div className="w-full px-3">
                        <label
                          className="block text-gray-600 text-sm font-medium mb-1"
                          htmlFor="lokasiPelatihan"
                        >
                          Lokasi Pelatihan{" "}
                          <span className="text-rose-600">*</span>
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
                  </div>

                  {/* Sektor dan Rumpun */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-wrap mb-1 w-full">
                      <div className="w-full">
                        <label
                          className="block text-gray-600 text-sm font-medium mb-1"
                          htmlFor="jensiPelatihan"
                        >
                          Sektor Pelatihan{" "}
                          <span className="text-rose-600">*</span>
                        </label>
                        <Select
                          value={jenisProgram}
                          onValueChange={(value: string) =>
                            setJenisProgram(value)
                          }
                        >
                          <SelectTrigger className="w-full text-base py-5">
                            <SelectValue placeholder="Pilih sektor" />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              SEKTOR_PELATIHAN.map((item) => <SelectItem value={item}>
                                {item}
                              </SelectItem>)
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-wrap mb-1 w-full">
                      <div className="w-full">
                        <label
                          className="block text-gray-600 text-sm font-medium mb-1"
                          htmlFor="jensiPelatihan"
                        >
                          Klaster Pelatihan{" "}
                          <span className="text-rose-600">*</span>
                        </label>
                        <Select
                          value={bidangPelatihan}
                          onValueChange={(value) => {
                            setBidangPelatihan(value)
                            const selected = dataRumpunPelatihan.find((item) => item.name === value)
                            setSelectedRumpunPelatihan(selected ?? null)
                          }}
                        >
                          <SelectTrigger className="w-full text-base py-5">
                            <SelectValue placeholder="Pilih klaster" />
                          </SelectTrigger>
                          <SelectContent className="z-[10000]">
                            <SelectGroup>
                              <SelectLabel>Pilih Klaster Pelatihan</SelectLabel>
                              {dataRumpunPelatihan.map((item) => (
                                <SelectItem key={item.id_rumpun_pelatihan} value={item.name}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>


                  </div>

                  {/* Program Pelatihan SISJAMU */}
                  {
                    selectedRumpunPelatihan !== null &&
                    <div className="flex w-full flex-wrap  mb-1">
                      <div className="w-full">
                        <label
                          className="block text-gray-600 text-sm font-medium mb-1"
                          htmlFor="asalPesertaPelatihan"
                        >
                          Judul/Program Pelatihan (Klaster {bidangPelatihan}){" "}
                          <span className="text-rose-600">*</span>
                        </label>
                        <div className="flex flex-row gap-2">
                          <Select
                            value={program}
                            onValueChange={(value: string) => {
                              if (value === "__add_new__") {
                                // open your modal instead of setting program
                                document.getElementById("trigger-add-program")?.click();
                              } else {
                                setProgram(value);
                              }
                            }}
                          >
                            <SelectTrigger className="w-full text-base py-5">
                              <SelectValue placeholder={`Pilih program klaster ${bidangPelatihan}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedRumpunPelatihan.programs.map((item: ProgramPelatihan) => (
                                <SelectItem
                                  key={item.id_program_pelatihan}
                                  value={item.name_indo}
                                >
                                  {item.name_indo}
                                </SelectItem>
                              ))}
                              {/* Divider */}
                              <div className="border-t my-2"></div>
                              {/* Tambah Program as SelectItem */}
                              <SelectItem value="__add_new__" className="text-gray-500">
                                ➕ Tambah Program Pelatihan (* Apabila tidak ditemukan program pelatihan yang sesuai)
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <ManageProgramPelatihanAction
                            onSuccess={() => {
                              fetchRumpunPelatihan();
                              alert("✅ Program pelatihan berhasil ditambahkan");
                            }}
                          />
                        </div>

                      </div>
                    </div>
                  }

                  {/* Harga dan Jenis Pelaksanan Pelatihan */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-wrap mb-1 w-full">
                      <div className="w-full">
                        <label
                          className="block text-gray-600 text-sm font-medium mb-1"
                          htmlFor="pelaksanaanPelatihan"
                        >
                          Pelaksanaan Pelatihan{" "}
                          <span className="text-rose-600">*</span>
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
                            {
                              JENIS_PELAKSANAAN.map((item) => (
                                <SelectItem value={item}>{item} </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-wrap  mb-1 w-full">
                      <div className="w-full ">
                        <label
                          className="block text-gray-600 text-sm font-medium mb-1"
                          htmlFor="penyelenggaraPelatihan"
                        >
                          Penyelenggara Pelatihan{" "}
                          <span className="text-rose-600">*</span>
                        </label>
                        <Select
                          value={penyelenggaraPelatihan}
                          onValueChange={(value: string) =>
                            setPenyelenggaraPelatihan(value)
                          }
                        >
                          <SelectTrigger className="w-full text-base py-5">
                            <SelectValue placeholder="Pilih penyelenggara" />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              UPT.map((item: string, index: number) => (
                                <SelectItem key={index} value={item}>
                                  {item}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jenis Pelatihan dan Dukungan Program Terobosan */}
                <div className="flex flex-col gap-2 w-full mb-1">
                  <div className="flex flex-wrap w-full">
                    <div className="w-full">
                      <label
                        className="block text-gray-600 text-sm font-medium mb-1"
                        htmlFor="jensiPelatihan"
                      >
                        Sumber Pembiayaan/Pemenuhan IKU{" "}
                        <span className="text-rose-600">*</span>
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
                          {
                            JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN.map((item) => (
                              <SelectItem value={item}>
                                {item}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap   w-full">
                    <div className="w-full">
                      <label
                        className="block text-gray-600 text-sm font-medium mb-1"
                        htmlFor="dukunganProgramTerobosan"
                      >
                        Dukungan Program Prioritas{" "}
                        <span className="text-rose-600">*</span>
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
                          {
                            DUKUNGAN_PROGRAM_TEROBOSAN.map((item) => (
                              <SelectItem value={item}>
                                {item}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Biaya Pelatihan */}
                {
                  jenisPelatihan == "PNBP/BLU - Berbayar" &&
                  <div className="w-full mb-1">
                    <label
                      className="block text-gray-600 text-sm font-medium mb-1"
                      htmlFor="hargaPelatihan"
                    >
                      Biaya Pelatihan{" "} (Perorang Hanya Biaya Pelatihan)
                      <span className="text-rose-600">*</span>
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
                }

                {/* Waktu Pelaksanaan */}
                <p className="text-base flex gap-2 border-b border-b-gray-300 pb-2 mb-2 items-center text-gray-900 font-semibold max-w-md mt-5">
                  <TbClock /> <span>Waktu Pelaksanaan</span>
                </p>

                <div className="flex flex-col gap-2 w-full mt-2 mb-1">
                  <div className="flex gap-2 w-full">
                    <div className="flex flex-wrap -mx-3 mb-1 w-full">
                      <div className="w-full px-3">
                        <label
                          className="block text-gray-600 text-sm font-medium mb-1"
                          htmlFor="kodePelatihan"
                        >
                          Tanggal Mulai Pelatihan <span className="text-rose-600">*</span>
                        </label>
                        <input
                          id="tanggalMulaiPelatihan"
                          type="date"
                          className="form-input w-full text-black border-gray-300 rounded-md"
                          required
                          // min={new Date().toISOString().split("T")[0]}
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
                          className="block text-gray-600 text-sm font-medium mb-1"
                          htmlFor="tanggalBerakhirPelatihan"
                        >
                          Tanggal Berakhir Pelatihan <span className="text-rose-600">*</span>
                        </label>
                        <input
                          id="tanggalBerakhirPelatihan"
                          type="date"
                          className="form-input w-full text-black border-gray-300 rounded-md"
                          required
                          // min={tanggalMulaiPelatihan || new Date().toISOString().split("T")[0]}
                          value={tanggalBerakhirPelatihan}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setTanggalBerakhirPelatihan(e.target.value)
                          }
                          disabled={!tanggalMulaiPelatihan}
                        />
                      </div>

                    </div>
                  </div>
                </div>

                {/* Penilaian */}
                {
                  bidangPelatihan != "Sistem Jaminan Mutu" && <>
                    <p className="text-base flex gap-2 border-b border-b-gray-300 pb-2 mb-2 items-center text-gray-900 font-semibold max-w-md mt-5">
                      <RiVerifiedBadgeLine /> <span>Penilaian Pelatihan</span>
                    </p>

                    <div className="flex flex-wrap mb-1 w-full">
                      <div className="w-full">
                        <label
                          className="block text-gray-600 text-sm font-medium mb-1"
                          htmlFor="jensiPelatihan"
                        >
                          Jenis Penilaian{" "}
                          <span className="text-rose-600">*</span>
                        </label>
                        <Select
                          value={ujiKompetensi}
                          onValueChange={(value: string) =>
                            setUjiKompetensi(value)
                          }
                        >
                          <SelectTrigger className="w-full text-base py-5">
                            <SelectValue placeholder="Pilih jenis penilaian" />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              JENIS_PENILAIAN_PELATIHAN.map((item) => (
                                <SelectItem value={item}>
                                  {item}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                }
              </div>

              {/* Controllers */}
              <div className="flex -mx-3 mt-5 gap-2 px-3">
                <div
                  className={`w-full `}
                >
                  <button
                    type="submit"
                    onClick={(e: any) => handlePostingPublicTrainingData(e)}
                    className={`btn text-white ${edit
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-blue-500 hover:bg-blue-600"
                      } w-full`}
                  >
                    Buka Kelas Pelatihan
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        )}
      </div >
    </section >
  );
}

export default FormPelatihan;
