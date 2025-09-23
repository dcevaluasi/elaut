"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { elautBaseUrl, urlFileSuratPemberitahuan } from "@/constants/urls";
import axios from "axios";
import Toast from "@/commons/Toast";
import Cookies from "js-cookie";
import { FiUploadCloud } from "react-icons/fi";
import Link from "next/link";
import { PelatihanMasyarakat } from "@/types/product";
import { truncateText } from "@/utils";

interface UploadSuratButtonProps {
  idPelatihan: string;
  pelatihan: PelatihanMasyarakat;
  handleFetchingData?: () => void;
}

const UploadSuratButton: React.FC<UploadSuratButtonProps> = ({
  idPelatihan,
  pelatihan,
  handleFetchingData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "pdf") {
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: "File harus berformat PDF!",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("SuratPemberitahuan", file);

    try {
      await axios.put(`${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Toast.fire({
        icon: "success",
        title: "Yeayyy!",
        text: "Berhasil mengupload surat pemberitahuan pelatihan!",
      });

      handleFetchingData?.();
      setIsOpen(false);
    } catch {
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: "Gagal mengupload surat pemberitahuan!",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FiUploadCloud className="h-4 w-4" />
              Pemberitahuan Pelaksanaan Pelatihan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Upload surat pemberitahuan dan dipastikan terdapat data dan detail informasi pelatihan terlampir pada surat!
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Beautified File Input */}
          <div className="mt-3">
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full h-12 px-4 
                   border-2 border-dashed border-gray-300 rounded-lg 
                   cursor-pointer hover:border-blue-500 transition-colors"
            >
              {file ? (
                <span className="text-sm text-gray-800 truncate">{truncateText(file.name, 50, '...')}</span>
              ) : (
                <span className="text-sm text-gray-500">Klik untuk pilih file (PDF)</span>
              )}
            </label>
            <input
              id="file-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {pelatihan?.SuratPemberitahuan != "" && (
              <p className="text-xs text-gray-500 mt-1">
                File saat ini:{" "}
                <Link
                  href={`${urlFileSuratPemberitahuan}/${pelatihan?.SuratPemberitahuan}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Lihat Surat
                </Link>
              </p>
            )}
          </div>

          <AlertDialogFooter className="mt-4">
            {!isUploading && <AlertDialogCancel>Cancel</AlertDialogCancel>}
            <AlertDialogAction onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Mengirim..." : "Upload"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {Cookies.get("Access")?.includes("createPelatihan") &&
        (pelatihan.StatusPenerbitan === "0" || pelatihan.StatusPenerbitan === "3" || pelatihan.StatusPenerbitan === "1.2") && (
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-neutral-500 text-neutral-500 hover:text-white hover:bg-neutral-500"
          >
            <FiUploadCloud className="h-5 w-5" /> {pelatihan?.SuratPemberitahuan != "" ? 'Edit' : 'Upload'} Surat Pemberitahuan
          </Button>
        )}
    </>
  );
};

export default UploadSuratButton;
