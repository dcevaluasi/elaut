import React from "react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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

interface UploadSuratButtonProps {
  suratPemberitahuan: string;
  idPelatihan: string;
  handleFetchingData: any;
}

const UploadSuratButton: React.FC<UploadSuratButtonProps> = ({
  suratPemberitahuan,
  idPelatihan,
  handleFetchingData,
}) => {
  const [isOpenFormSuratPemberitahuan, setIsOpenFormSuratPemberitahuan] =
    React.useState<boolean>(false);
  const [suratPemberitahuanFile, setSuratPemberitahuanFile] =
    React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  const handleSuratPemberitahuanChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSuratPemberitahuanFile(file); // Simpan file tanpa validasi ekstensi
    }
  };

  const handleUploadSuratPemberitahuan = async (id: string) => {
    if (suratPemberitahuanFile) {
      const fileExtension = suratPemberitahuanFile.name
        .split(".")
        .pop()
        ?.toLowerCase();
      if (fileExtension !== "pdf") {
        Toast.fire({
          icon: "error",
          title: "Oopsss!",
          text: "Gagal mengupload surat pemberitahuan, harus mengupload dengan format PDF!",
        });
        return; // Hentikan proses jika file bukan PDF
      }
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("StatusPenerbitan", "Verifikasi Pelaksanaan");

    if (suratPemberitahuanFile) {
      formData.append("SuratPemberitahuan", suratPemberitahuanFile);
    }

    console.log("SURAT PEMBERITAHUAN", suratPemberitahuanFile);

    try {
      const response = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${id}`,
        formData,
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
        text: "Berhasil mengupload surat pemberitahuan ke Pusat Pelatihan Kelautan dan Perikanan!",
      });

      console.log("UPDATE PELATIHAN: ", response);
      handleFetchingData();
      setIsUploading(false);
      setIsOpenFormSuratPemberitahuan(false);
    } catch (error) {
      console.error("ERROR UPDATE PELATIHAN: ", error);
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: "Gagal mengupload surat pemberitahuan ke Pusat Pelatihan Kelautan dan Perikanan!",
      });

      setIsOpenFormSuratPemberitahuan(false);
      setIsUploading(false);
      handleFetchingData();
    }
  };

  return (
    <>
      <AlertDialog open={isOpenFormSuratPemberitahuan}>
        <AlertDialogContent>
          <AlertDialogHeader className="flex gap-0 flex-col">
            <AlertDialogTitle className="flex items-center gap-2">
              {" "}
              <FiUploadCloud className="h-4 w-4" />
              Upload Surat Pemberitahuan
            </AlertDialogTitle>
            <AlertDialogDescription className="-mt-2">
              Dalam pelaksanaan pelatihan Pusat Pelatihan Kelautan dan Perikanan
              perlu tahu untuk pemberitahuan!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <fieldset>
            <form autoComplete="off">
              <div className="flex flex-wrap -mx-3 mb-1">
                <div className="w-full px-3">
                  <label
                    className="block text-gray-800 text-sm font-medium mb-1"
                    htmlFor="email"
                  >
                    Upload Surat Pemberitahuan{" "}
                  </label>

                  <div className="flex gap-1">
                    <input
                      type="file"
                      className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                      required
                      onChange={handleSuratPemberitahuanChange}
                    />
                  </div>

                  <p className="text-gray-700 text-xs mt-1">
                    *Surat pemberitahuan yang diupload merupakan surat yang
                    sudah ditandatangani melalui portal dengan contoh seperti
                    <Link
                      href={
                        "https://drive.google.com/file/d/1Zzu6DRuaj_SwJ5Sk0XQfShtghA-HYT5F/view?usp=sharing"
                      }
                      target="_blank"
                      className="ml-1 text-blue-500 underline"
                    >
                      berikut
                    </Link>
                    , hal ini dilakukan untuk pengarsipan dan bahan bukti
                    penerbitan sertifikat nantinya!
                  </p>
                </div>
              </div>

              <AlertDialogFooter className="mt-3">
                <>
                  {" "}
                  {!isUploading && (
                    <AlertDialogCancel
                      onClick={(e) =>
                        setIsOpenFormSuratPemberitahuan(
                          !isOpenFormSuratPemberitahuan
                        )
                      }
                    >
                      Cancel
                    </AlertDialogCancel>
                  )}
                  <AlertDialogAction
                    onClick={(e) => handleUploadSuratPemberitahuan(idPelatihan)}
                    disabled={isUploading}
                    className={`${isUploading && "px-6"}`}
                  >
                    {isUploading ? (
                      <span>Uploading...</span>
                    ) : (
                      <span>Upload</span>
                    )}
                  </AlertDialogAction>
                </>
              </AlertDialogFooter>
            </form>
          </fieldset>
        </AlertDialogContent>
      </AlertDialog>

      {suratPemberitahuan !=
      "https://elaut-bppsdm.kkp.go.id/api-elaut//public/static/suratPemberitahuan/" ? (
        <Link
          href={suratPemberitahuan}
          title="Surat Pemberitahuan"
          target="_blank"
          className="border border-neutral-200  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-gray-800 hover:bg-gray-800 hover:text-white text-white rounded-md"
        >
          <LucideFileCheck2 className="h-5 w-5" /> Surat Pemberitahuan
        </Link>
      ) : (
        <Button
          onClick={() => {
            setIsOpenFormSuratPemberitahuan(!isOpenFormSuratPemberitahuan);
          }}
          variant="outline"
          title="Upload Surat Pemberitahuan"
          className="border border-neutral-200  shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-gray-800 hover:bg-gray-800 hover:text-white text-white rounded-md"
        >
          <FiUploadCloud className="h-5 w-5" /> Upload Surat Pemberitahuan
        </Button>
      )}
    </>
  );
};

export default UploadSuratButton;
