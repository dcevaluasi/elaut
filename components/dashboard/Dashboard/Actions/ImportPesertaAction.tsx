"use client";

import React, { useState } from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FiUploadCloud } from "react-icons/fi";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiMiniUserGroup } from "react-icons/hi2";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import Toast from "@/components/toast";
import { downloadFormatPesertaPelatihan, urlPetunjukUploadPesertaPelatihan } from "@/constants/urls";

interface ImportPesertaActionProps {
    idPelatihan: string;
    statusApproval: string;
    onSuccess?: () => void;
    onAddHistory?: (message: string) => void;
}

const ImportPesertaAction: React.FC<ImportPesertaActionProps> = ({
    idPelatihan,
    statusApproval,
    onSuccess,
    onAddHistory,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fileExcel, setFileExcel] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileExcel(e.target.files[0]);
        }
    };

    const truncateText = (text: string, maxLength = 25, suffix = "...") =>
        text.length > maxLength ? text.substring(0, maxLength) + suffix : text;

    const handleUpload = async () => {
        if (!fileExcel) return;

        const formData = new FormData();
        formData.append("IdPelatihan", idPelatihan);
        formData.append("file", fileExcel);

        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/exportPesertaPelatihan`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );

            if (onAddHistory) {
                onAddHistory("Telah mengupload data peserta kelas");
            }

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Peserta pelatihan berhasil diimport.",
            });

            console.log("FILE UPLOADED PESERTA:", response);
            setIsOpen(false);
            setFileExcel(null);
            if (onSuccess) onSuccess();
        } catch (error) {

            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat upload file.",
            });
            if (onSuccess) onSuccess();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            {/* Trigger Button */}
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    onClick={() => {
                        if (statusApproval === "Selesai") {
                            Toast.fire({
                                icon: "error",
                                title: "Ups!!!",
                                text: "Pelatihan sudah ditutup, tidak dapat menambahkan lagi!",
                            });
                        } else {
                            setIsOpen(true);
                        }
                    }}
                    className="flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium rounded-lg border   
            bg-transparent border-green-600 text-green-600 hover:text-white hover:bg-green-600 transition-colors w-fit shadow-sm"
                >
                    <PiMicrosoftExcelLogoFill className="h-5 w-5" />
                    Import Data Peserta
                </Button>
            </AlertDialogTrigger>

            {/* Dialog Content */}
            <AlertDialogContent className="max-w-lg rounded-xl shadow-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <HiMiniUserGroup className="h-5 w-5 text-blue-600" />
                        Import Peserta Pelatihan
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-gray-600">
                        Import peserta yang akan mengikuti pelatihan ini menggunakan template Excel.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <form autoComplete="off" className="space-y-5 mt-3">
                    {/* Upload File */}
                    <div>
                        <label className="block text-gray-800 text-sm font-medium mb-2">
                            Data By Name By Address <span className="text-red-500">*</span>
                        </label>

                        <div className="flex gap-3">
                            {/* Upload Box */}
                            <label
                                htmlFor="file-upload"
                                className="flex-1 flex flex-col items-center justify-center h-28 px-4 border-2 border-dashed rounded-lg cursor-pointer 
                  bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-blue-500 
                  transition group"
                            >
                                <FiUploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-1" />
                                <span className="text-sm text-center text-gray-600 group-hover:text-blue-600">
                                    {fileExcel
                                        ? truncateText(fileExcel.name)
                                        : "Klik atau drag file untuk upload"}
                                </span>
                                <span className="text-xs text-gray-400">Format: .xlsx</span>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx"
                                    required
                                    onChange={handleFileChange}
                                />
                            </label>

                            {/* Download Template */}
                            <Link
                                target="_blank"
                                href={downloadFormatPesertaPelatihan}
                                className="flex flex-col items-center justify-center w-36 h-28 rounded-lg bg-green-600 text-white text-sm font-medium shadow hover:bg-green-700 transition gap-2"
                            >
                                <PiMicrosoftExcelLogoFill className="h-6 w-6" />
                                <span>Unduh Template</span>
                            </Link>
                        </div>

                        <div className="flex flex-col gap-0">
                            <p className="text-xs text-gray-500 mt-2 leading-snug">
                                *Download template terlebih dahulu, isi file Excel, lalu upload.
                                Perlu diingat, input data melalui skema import hanya dapat dilakukan{" "}
                                <span className="font-semibold">sekali</span>.
                            </p>
                            <p className="text-xs text-gray-500">
                                *Petunjuk pengisian format <Link href={urlPetunjukUploadPesertaPelatihan} target="_blank" className='!text-blue-500 underline'>{truncateText(urlPetunjukUploadPesertaPelatihan, 50, '...')}</Link>
                            </p>
                        </div>


                    </div>

                    {/* Footer */}
                    <AlertDialogFooter className="pt-4 border-t border-gray-200">
                        <AlertDialogCancel className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100">
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={!fileExcel || loading}
                            onClick={handleUpload}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                        >
                            {loading ? "Mengunggah..." : "Upload"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ImportPesertaAction;
