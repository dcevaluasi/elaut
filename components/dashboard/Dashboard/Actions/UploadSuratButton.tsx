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
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import Toast from "@/components/toast";
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
    formData.append("StatusPenerbitan", "1");
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
        text: "Berhasil mengirim pemberitahuan pelatihan, silahkan menunggu approval SPV!",
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
      {/* Dialog */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FiUploadCloud className="h-4 w-4" />
              Pemberitahuan Pelaksanaan Pelatihan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Upload surat pemberitahuan dan kirim ke SPV Pusat, dipastikan terdapat data dan detail informasi pelatihan terlampir pada surat!
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
          </div>

          <AlertDialogFooter className="mt-4">
            {!isUploading && <AlertDialogCancel>Cancel</AlertDialogCancel>}
            <AlertDialogAction onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Mengirim..." : "Kirim SPV"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Trigger Button */}
      {Cookies.get("Access")?.includes("createPelatihan") &&
        pelatihan.StatusPenerbitan === "0" && (
          <Button
            onClick={() => setIsOpen(true)}
            size="sm"
            className="w-full inline-flex items-center justify-center gap-2 
                       h-10 px-5 text-sm font-medium rounded-full 
                       border border-indigo-500 bg-indigo-500 text-white 
                       hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <FiUploadCloud className="h-5 w-5" /> Kirim SPV
          </Button>
        )}
    </>
  );
};

export default UploadSuratButton;
