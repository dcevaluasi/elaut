import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TbBroadcast } from "react-icons/tb";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import Toast from "@/components/toast";
import Cookies from "js-cookie";
import { LucideFileCheck2 } from "lucide-react";
import Link from "next/link";
import { FiUploadCloud } from "react-icons/fi";
import { PelatihanMasyarakat } from "@/types/product";
import Image from "next/image";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";

interface GenerateNoSertifikatButtonProps {
  idPelatihan: string;
  pelatihan: PelatihanMasyarakat;
  handleFetchingData: any;
}

const GenerateNoSertifikatButton: React.FC<GenerateNoSertifikatButtonProps> = ({
  idPelatihan,
  pelatihan,
  handleFetchingData,
}) => {
  const [openFormSertifikat, setOpenFormSertifikat] =
    React.useState<boolean>(false);
  const [ttdSertifikat, setTtdSertifikat] = React.useState<string>("");
  const [beritaAcara, setBeritaAcara] = React.useState<File | null>(null);


  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setBeritaAcara(file); // Simpan file tanpa validasi
    }
  };

  const handleGenerateSertifikat = async () => {
    if (beritaAcara) {
      const fileExtension = beritaAcara.name.split(".").pop()?.toLowerCase();
      if (fileExtension !== "pdf") {
        Toast.fire({
          icon: "error",
          title: "Oopsss!",
          text: "Gagal mengupload dokumen, harus mengupload dengan format PDF!",
        });
        return; // Hentikan proses jika file bukan PDF
      }
    }

    setIsUploading(true);
    console.log({ ttdSertifikat });

    const formData = new FormData();

    formData.append("TtdSertifikat", ttdSertifikat);

    const updateData = new FormData();

    updateData.append("PemberitahuanDiterima", "Input no sertifikat");

    if (beritaAcara) {
      updateData.append(isOperatorBalaiPelatihan ? 'BeritaAcara' : 'SuratPemberitahuan', beritaAcara);
    }


    try {
      const response = await axios.post(
        `${elautBaseUrl}/lemdik/PublishSertifikat?id=${idPelatihan}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadBeritaAcaraResponse = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Toast.fire({
        icon: "success",
        title: "Yeayyy!",
        text: "Berhasil mengupload file berita acara dan penandatangan, tunggu proses approval dari pusat!",
      });

      handleAddHistoryTrainingInExisting(pelatihan!, 'Dalam proses mengajukan penerbitan sertfikat kelas pelatihan')

      setIsUploading(false);
      handleFetchingData();
      setOpenFormSertifikat(false);
      console.log("UPLOAD BERITA ACARA: ", uploadBeritaAcaraResponse);
    } catch (error) {
      console.error("ERROR GENERATE SERTIFIKAT: ", error);
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: "Gagal mengupload file berita acara dan penandatangan!",
      });

      setIsUploading(false);
      setOpenFormSertifikat(false);
      handleFetchingData();
    }
  };

  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const typeRole = Cookies.get("XSRF093");
  const isOperatorBalaiPelatihan = Cookies.get('Eselon') !== 'Operator Pusat'

  return (
    <>
      <AlertDialog
        open={openFormSertifikat}
        onOpenChange={setOpenFormSertifikat}
      >
        <AlertDialogContent>
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Permohonan Penerbitan Sertifikat
              </AlertDialogTitle>
              <AlertDialogDescription className="-mt-2">
                Lampirkan Berita acara sebagai bukti pelaksanaan pelatihan yang
                telah selesai, tunggu proses approval dari pusat, dan dapatkan
                nomor sertifikat Pelatihanmu!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <fieldset>
              <div className="flex flex-wrap  mb-1 w-full">
                <div className="w-full">
                  <label
                    className="block text-gray-800 text-sm font-medium mb-1"
                    htmlFor="noSertifikat"
                  >
                    Sertifikat untuk Pelatihan{" "}
                    <span className="text-red-600">*</span>
                  </label>

                  <input
                    id="noSertifikat"
                    type="text"
                    className="form-input w-full text-black border-gray-300 rounded-md"
                    placeholder={
                      pelatihan.NamaPelatihan + " - " + pelatihan.KodePelatihan
                    }
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <div className="flex flex-wrap  mb-1 w-full">
                <div className="w-full">
                  <label
                    className="block text-gray-800 text-sm font-medium mb-1"
                    htmlFor="noSertifikat"
                  >
                    TTD Sertifikat <span className="text-red-600">*</span>
                  </label>
                  <select
                    name=""
                    id=""
                    onChange={(e) => setTtdSertifikat(e.target.value)}
                    className="w-full overflow-hidden rounded-lg border border-gray-300"
                  >
                    <option value={""}>Pilih Penandatangan</option>
                    <option
                      onClick={(e) =>
                        setTtdSertifikat(
                          "Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan"
                        )
                      }
                      value={
                        "Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan"
                      }
                    >
                      Kepala BPPSDM KP
                    </option>
                    <option
                      onClick={(e) =>
                        setTtdSertifikat(
                          "Kepala Pusat Pelatihan Kelautan dan Perikanan"
                        )
                      }
                      value={
                        "Kepala Pusat Pelatihan Kelautan dan Perikanan"
                      }
                    >
                      Kepala Pusat Pelatihan KP
                    </option>
                    {isOperatorBalaiPelatihan && (
                      <>

                        <option
                          onClick={(e) =>
                            setTtdSertifikat(
                              "Kepala Balai Pelatihan dan Penyuluhan Perikanan"
                            )
                          }
                          value={
                            "Kepala Balai Pelatihan dan Penyuluhan Perikanan"
                          }
                        >
                          Kepala Balai Pelatihan
                        </option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 space-y-2">
                <label
                  className="block text-gray-800 text-sm font-medium mb-1"
                  htmlFor="name"
                >
                  File Berita Acara, Memo, Laporan Pelaksanaan
                  <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col rounded-lg border-2 border-dashed w-full h-40 p-10 group text-center">
                    <div className="h-full w-full text-center flex flex-col items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10 text-blue-400 group-hover:text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      {beritaAcara == null ? (
                        <p className="pointer-none text-gray-500 text-sm">
                          <span className="text-sm">Drag and drop</span> files
                          here <br /> or{" "}
                          <a
                            href=""
                            id=""
                            className="text-blue-600 hover:underline"
                          >
                            select a file
                          </a>{" "}
                          from your computer
                        </p>
                      ) : (
                        <p className="pointer-none text-gray-500 text-sm">
                          {beritaAcara.name}
                        </p>
                      )}{" "}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-800">
                <span>Tipe file: doc,pdf, tipe gambar</span>
              </p>
            </fieldset>

            <p className="text-gray-700 text-xs mt-1">
              *File berita acara yang diupload dapat dilampirkan dengan contoh
              sebagai
              <Link
                href={
                  "https://drive.google.com/file/d/1_LXUE02cNIIuMeg6ejMcENVAA3JJH7TC/view?usp=sharing"
                }
                target="_blank"
                className="ml-1 text-blue-500 underline"
              >
                berikut
              </Link>
              , hal ini dilakukan untuk proses approval penerbitan sertifikat
              baik yang ditanda tangan oleh Kepala BPPSDM KP, Kepala Puslat KP,
              maupun Kepala Balai
            </p>
          </>
          <AlertDialogFooter>
            {!isUploading && (
              <AlertDialogCancel
                onClick={(e) => setOpenFormSertifikat(!openFormSertifikat)}
              >
                Cancel
              </AlertDialogCancel>
            )}
            {beritaAcara != null && ttdSertifikat != "" ? (
              <AlertDialogAction
                onClick={(e) => handleGenerateSertifikat()}
                disabled={isUploading}
                className={`${isUploading && "px-6"}`}
              >
                {isUploading ? <span>Uploading...</span> : <span>Upload</span>}
              </AlertDialogAction>
            ) : (
              <></>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isOperatorBalaiPelatihan ? pelatihan.StatusApproval == "Selesai" &&
        (pelatihan.NoSertifikat == "" ? (
          <Button
            onClick={(e) => {
              setOpenFormSertifikat(true);
            }}
            variant="outline"
            title="Pengajuan Penerbitan"
            className="ml-auto w-full bg-blue-600 hover:bg-blue-600 duration-700 text-neutral-100 hover:text-neutral-100"
          >
            <RiVerifiedBadgeFill className="h-5 w-5" /> Pengajuan Penerbitan
          </Button>
        ) : (
          <></>
        )) :
        (pelatihan.StatusApproval == "Selesai" && pelatihan!.SuratPemberitahuan == '' ? (
          <Button
            onClick={(e) => {
              setOpenFormSertifikat(true);
            }}
            variant="outline"
            title="Ajukan Penerbitan Sertifikat"
            className="ml-auto w-fit bg-blue-600 border-blue-600 hover:bg-blue-600 duration-700 text-neutral-100 hover:text-neutral-100"
          >
            <RiVerifiedBadgeFill className="h-5 w-5" /> Ajukan Penerbitan Sertifikat
          </Button>
        ) : (
          <></>
        ))}
    </>
  );
};

export default GenerateNoSertifikatButton;
