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
import { TbBroadcast, TbEditCircle } from "react-icons/tb";
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import Toast from "@/components/toast";
import Cookies from "js-cookie";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import { Editor } from "@tinymce/tinymce-react";

interface VerifikasiPesertaActionProps {
  idUser: string;
  peserta: UserPelatihan;
  handleFetchingData: any;
}

const VerifikasiPesertaAction: React.FC<VerifikasiPesertaActionProps> = ({
  idUser,
  peserta,
  handleFetchingData,
}) => {
  const [openFormSertifikat, setOpenFormSertifikat] =
    React.useState<boolean>(false);
  const [status, setStatus] = React.useState<string>("");
  const [catatan, setCatatan] = React.useState<string>("");

  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  const handleValidDataPesertaPelatihan = async (type: string) => {
    const formData = new FormData();
    formData.append("Keterangan", status);
    formData.append("StatusPembayaran", catatan);
    try {
      const response = await axios.put(
        `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${idUser}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      if (type == "Validasi") {
        Toast.fire({
          icon: "success",
          title: `Berhasil memvalidasi data pesereta pelatihan!`,
        });
        setOpenFormSertifikat(false);
      } else {
        Toast.fire({
          icon: "success",
          title: `Berhasil unvalidasi data pesereta pelatihan!`,
        });
        setOpenFormUnvalidasi(false);
      }

      console.log("VALIDASI PESERTA PELATIHAN: ", response);
      handleFetchingData();

      setCatatan("");
      setStatus("");
    } catch (error) {
      console.error("ERROR UPDATE PELATIHAN: ", error);
      if (type == "Validasi") {
        Toast.fire({
          icon: "success",
          title: `Gagal memvalidasi data peserta, harap tunggu beberapa saat!`,
        });
      } else {
        Toast.fire({
          icon: "success",
          title: `Gagal unvalidasi data peserta, harap tunggu beberapa saat!`,
        });
      }

      handleFetchingData();
      setCatatan("");
      setStatus("");
    }
  };

  const [openFormUnvalidasi, setOpenFormUnvalidasi] =
    React.useState<boolean>(false);

  return (
    <>
      <AlertDialog
        open={openFormUnvalidasi}
        onOpenChange={setOpenFormUnvalidasi}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apakah kamu yakin unvalidasi data peserta ini?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Unvalidasi data ini akan dilakukan jika memang terdapat
              kelengkapan dari peserta pendaftar ataupun data diri yang belum
              lengkap!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpenFormUnvalidasi(!openFormUnvalidasi)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleValidDataPesertaPelatihan("Unvalidasi");
              }}
              className="bg-neutral-950 text-white"
            >
              Unvalidasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={openFormSertifikat}
        onOpenChange={setOpenFormSertifikat}
      >
        <AlertDialogContent className="max-w-5xl">
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Validasi Data Peserta</AlertDialogTitle>
              <AlertDialogDescription className="-mt-2">
                Proses validasi diperlukan untuk melihat kelengkapan atau
                persyaratan pendaftar sudah terpenuhi atau belum untuk dapat
                mengikuti rangkaian pelatihan
              </AlertDialogDescription>
            </AlertDialogHeader>
            <fieldset>
              <div className="flex flex-wrap  mb-1 w-full">
                <div className="w-full">
                  <label
                    className="block text-gray-800 text-sm font-medium mb-1"
                    htmlFor="noSertifikat"
                  >
                    Status Pendaftaran <span className="text-red-600">*</span>
                  </label>
                  <select
                    name=""
                    id=""
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full overflow-hidden rounded-lg border border-gray-300"
                  >
                    <option value={""}>Pilih Status</option>
                    <option onClick={(e) => setStatus("Valid")} value={"Valid"}>
                      Valid
                    </option>
                    <option
                      onClick={(e) => setStatus("Tidak Valid")}
                      value={"Tidak Valid"}
                    >
                      Tidak Valid
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label
                  className="block text-gray-800 text-sm font-medium"
                  htmlFor="name"
                >
                  Catatan <span className="text-red-600">*</span>
                </label>

                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINY_MCE_KEY}
                  value={catatan}
                  onEditorChange={(content: string, editor: any) =>
                    setCatatan(content)
                  }
                  init={{
                    height: 250,
                    menubar: false,
                    plugins:
                      "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker",
                    toolbar:
                      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
                    content_style:
                      "body { font-family:Plus Jakarta Sans,Arial,sans-serif; font-size:14px }",
                  }}
                />
              </div>
            </fieldset>

            <p className="text-gray-700 text-xs mt-1">
              *Catatan perlu diberikan untuk memberitahu kepada calon peserta
              terkait kesalahan pada kelengkapan data maupun dokumen
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
            <AlertDialogAction
              onClick={(e) => handleValidDataPesertaPelatihan("Validasi")}
              disabled={isUploading}
              className={`${isUploading && "px-6"}`}
            >
              {isUploading ? <span>Validating...</span> : <span>Validasi</span>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {peserta.Keterangan == "Valid" ? (
        <Button
          onClick={(e) => {
            setStatus("Tidak Valid");
            setOpenFormUnvalidasi(true);
          }}
          variant="outline"
          className="w-full hover:bg-teal-600 duration-700 hover:text-white text-white bg-teal-600  mt-3 text-base"
        >
          <TbEditCircle className="h-4 w-4 " />
          Unvalidasi
        </Button>
      ) : (
        <>
          <Button
            onClick={(e) => {
              setOpenFormSertifikat(true);
            }}
            variant="outline"
            className="w-full bg-gray-600 text-base py-3 hover:bg-gray-600 duration-700 hover:text-white text-white mt-3"
          >
            <TbEditCircle className="h-4 w-4 " />
            Validasi
          </Button>
        </>
      )}
    </>
  );
};

export default VerifikasiPesertaAction;
