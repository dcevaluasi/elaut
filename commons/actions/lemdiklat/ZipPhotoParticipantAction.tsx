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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HiMiniArrowUpTray } from "react-icons/hi2";
import { FaImages } from "react-icons/fa";
import JSZip from "jszip";
import axios from "axios";
import Toast from "@/commons/Toast";
import Cookies from "js-cookie";

type UserPelatihan = {
    IdUsers: number;
    [key: string]: any;
};

type Props = {
    users: UserPelatihan[];
    onSuccess: any;
};

export default function ZipPhotoParticipantAction({ users, onSuccess }: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedCount, setUploadedCount] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);

    const handleZipUpload = async (zipFile: File, users: UserPelatihan[]) => {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile, { checkCRC32: true });


        const fileNames = Object.keys(zipContent.files);
        const imageFiles = fileNames.filter((f) => {
            const ext = f.split(".").pop()?.toLowerCase();
            return ext && ["jpg", "jpeg", "png"].includes(ext);
        });

        setTotalFiles(imageFiles.length / 2);
        setUploadedCount(0);

        for (const fileName of imageFiles) {
            const file = zipContent.files[fileName];
            if (!file || file.dir) continue;

            const baseName = fileName.split("/").pop();
            if (!baseName) continue;

            const id = parseInt(baseName.replace(/\.[^/.]+$/, ""), 10);
            if (isNaN(id)) continue;

            const matchedUser = users.find((user) => user.IdUsers === id);
            if (!matchedUser) {
                console.warn(`⚠️ No user matched for file: ${fileName}`);
                continue;
            }

            try {
                const fileBlob = await file.async("blob");

                const formData = new FormData();
                formData.append("Fotos", fileBlob, baseName);
                formData.append("Ktps", "");
                formData.append("KKs", "");
                formData.append("Ijazahs", "");
                formData.append("SuratKesehatans", "");

                await axios.put(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/users/updateUsersNoJwt?id=${id}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                setUploadedCount((prev) => prev + 1);
            } catch (err) {
                console.error(`❌ Failed uploading ${fileName}`, err);
                Toast.fire({
                    icon: "error",
                    title: `Gagal upload foto ${baseName}`,
                });
            }
        }
    };

    const handleSubmitZipUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        try {
            await handleZipUpload(selectedFile, users);
            Toast.fire({
                icon: "success",
                title: `Berhasil mengupload ${uploadedCount} dari ${totalFiles} foto peserta!`,
            });
            onSuccess();
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
        }
    };

    const progress = totalFiles > 0 ? (uploadedCount / totalFiles) * 100 : 0;

    return (
        <AlertDialog>
            {(Cookies.get("Access")?.includes("createPelatihan") &&
                users.length > 0) && (
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            title="Upload Foto Peserta"
                            className="flex items-center w-fit rounded-lg px-4 py-2 shadow-sm 
                       bg-transparent border-gray-400 text-gray-600 
                       hover:text-white hover:bg-gray-600 transition-all"
                        >
                            <FaImages className="h-4 w-4 mr-1" /> Upload Zip Foto
                        </Button>
                    </AlertDialogTrigger>
                )}

            <AlertDialogContent className="max-w-md rounded-xl shadow-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-semibold text-gray-800">
                        Upload Folder Foto Peserta
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-gray-500">
                        Pilih file <span className="font-medium">.zip</span> berisi foto
                        peserta dengan format <code>IDPeserta.formatfile</code>.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* File Upload Box */}
                <label
                    htmlFor="zip-upload"
                    className="mt-4 flex flex-col items-center justify-center w-full h-28 
                     border-2 border-dashed border-gray-300 rounded-lg cursor-pointer 
                     hover:border-blue-500 transition-colors bg-gray-50"
                >
                    <HiMiniArrowUpTray className="w-7 h-7 text-gray-400 mb-2 group-hover:text-blue-500" />
                    <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : "Klik untuk pilih file ZIP"}
                    </span>
                    <span className="text-xs text-gray-400">atau drag & drop di sini</span>
                    <input
                        id="zip-upload"
                        type="file"
                        accept=".zip"
                        className="hidden"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0];
                            if (file) setSelectedFile(file);
                        }}
                    />
                </label>

                {/* Progress bar */}
                {isUploading && (
                    <div className="mt-4 space-y-1">
                        <Progress value={progress} />
                        <p className="text-xs text-gray-500 text-center">
                            {uploadedCount} / {totalFiles} files uploaded
                        </p>
                    </div>
                )}

                <AlertDialogFooter className="mt-6 flex justify-between">
                    <AlertDialogCancel className="rounded-lg px-4 py-2 text-sm border">
                        Batal
                    </AlertDialogCancel>
                    <Button
                        onClick={handleSubmitZipUpload}
                        disabled={!selectedFile || isUploading}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 shadow-sm"
                    >
                        {isUploading ? "Mengupload..." : "Simpan"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
