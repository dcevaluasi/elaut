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
import { TbEditCircle } from "react-icons/tb";
import { FiUploadCloud } from "react-icons/fi";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { Editor } from "@tinymce/tinymce-react";

interface EditPublishActionProps {
    idPelatihan: string;
    currentDetail?: string;
    currentFoto?: string;
    tanggalPendaftaran?: string[];
    onSuccess?: () => void;
}

const EditPublishAction: React.FC<EditPublishActionProps> = ({
    idPelatihan,
    currentDetail,
    currentFoto,
    tanggalPendaftaran,
    onSuccess,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tanggalMulai, setTanggalMulai] = useState(tanggalPendaftaran![0] || "");
    const [tanggalAkhir, setTanggalAkhir] = useState(tanggalPendaftaran![1] || "");
    const [detailPelatihan, setDetailPelatihan] = useState(currentDetail || "");
    const [fotoPelatihan, setFotoPelatihan] = useState<File | null>(null);
    const [kuotaPelatihan, setKuotaPelatihan] = useState("")
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!detailPelatihan && !fotoPelatihan) {
            Toast.fire({
                icon: "warning",
                title: "Form Kosong",
                text: "Harap isi detail atau unggah foto pelatihan terlebih dahulu.",
            });
            return;
        }

        const formData = new FormData();
        if (tanggalMulai) formData.append("TanggalMulaiPendaftaran", tanggalMulai);
        if (tanggalAkhir) formData.append("TanggalAkhirPendaftaran", tanggalAkhir);
        if (detailPelatihan) formData.append("DetailPelatihan", detailPelatihan);
        if (fotoPelatihan) formData.append("photo_pelatihan", fotoPelatihan);
        formData.append("KoutaPelatihan", kuotaPelatihan)

        try {
            setLoading(true);
            const response = await axios.put(
                `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );
            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Informasi pelatihan berhasil diperbarui.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            console.log("UPDATE PELATIHAN: ", response);
        } catch (error) {
            console.error("ERROR UPDATE PELATIHAN: ", error);
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memperbarui pelatihan.",
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-teal-500 text-teal-500 hover:text-white hover:bg-teal-500"
                >
                    <TbEditCircle className="h-5 w-5" />
                    <span>Edit Informasi Publish</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Informasi Publish dan Promosi Pelatihan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Perbarui detail deskripsi atau unggah foto baru untuk pelatihan ini.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-2">
                    <div className="flex gap-2 w-full">
                        <div className="space-y-2 w-full">
                            <label className="text-sm font-medium text-gray-700">
                                Tanggal Mulai Pendaftaran
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                value={tanggalMulai}
                                onChange={(e) => setTanggalMulai(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 w-full">
                            <label className="text-sm font-medium text-gray-700">
                                Tanggal Akhir Pendaftaran
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                value={tanggalAkhir}
                                onChange={(e) => setTanggalAkhir(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full">
                        <div className="space-y-2 w-full">
                            <label className="text-sm font-medium text-gray-700">
                                Informasi Kuota Pelatihan
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                value={kuotaPelatihan}
                                onChange={(e) => setKuotaPelatihan(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Detail Pelatihan */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Detail Pelatihan
                        </label>

                        <Editor
                            apiKey={process.env.NEXT_PUBLIC_TINY_MCE_KEY}
                            value={detailPelatihan}
                            onEditorChange={(content: string, editor: any) =>
                                setDetailPelatihan(content)
                            }
                            init={{
                                height: 300,
                                menubar: true,
                                plugins:
                                    "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker",
                                toolbar:
                                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
                                content_style:
                                    "body { font-family:Plus Jakarta Sans,Arial,sans-serif; font-size:14px }",
                            }}
                        />
                    </div>

                    {/* Upload Foto */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Foto Pelatihan
                        </label>
                        <label
                            htmlFor="fileUpload"
                            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer bg-gray-50 hover:border-teal-500 hover:bg-teal-50 transition"
                        >
                            <FiUploadCloud className="h-10 w-10 text-teal-500 mb-2" />
                            <span className="text-sm text-gray-700">
                                {fotoPelatihan
                                    ? fotoPelatihan.name
                                    : "Klik untuk unggah foto pelatihan"}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                JPG, PNG, atau PDF (maks 5MB)
                            </span>
                        </label>
                        <input
                            id="fileUpload"
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) =>
                                setFotoPelatihan(e.target.files ? e.target.files[0] : null)
                            }
                        />
                        {currentFoto && (
                            <p className="text-xs text-gray-500 mt-1">
                                Foto saat ini:{" "}
                                <a
                                    href={currentFoto}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-teal-600 underline"
                                >
                                    Lihat Foto
                                </a>
                            </p>
                        )}
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EditPublishAction;
