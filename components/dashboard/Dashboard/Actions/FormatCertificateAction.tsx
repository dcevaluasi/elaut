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
import { FaBookOpen, FaGear } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { elautBaseUrl, urlPetunjukUploadMateriPelatihan } from "@/constants/urls";
import Cookies from "js-cookie";
import Toast from "@/components/toast";
import Link from "next/link";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { urlTemplateMateriPelatihan } from "@/constants/templates";
import { MateriPelatihan, PelatihanMasyarakat } from "@/types/product";
import { truncateText } from "@/utils";

const DualLangInput: React.FC<{
    value?: string;
    onChange: (val: string) => void;
}> = ({ value, onChange }) => {
    const [indo, setIndo] = useState("");
    const [english, setEnglish] = useState("");

    const handleUpdate = (i: string, e: string) => {
        onChange(`{${i}}{${e}}`);
    };

    return (
        <div className="space-y-2 my-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Sertifikat Bahasa Indonesia
                </label>
                <textarea
                    value={indo}
                    onChange={(e) => {
                        setIndo(e.target.value);
                        handleUpdate(e.target.value, english);
                    }}
                    placeholder="Tulis teks dalam Bahasa Indonesia..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-navy-400 focus:ring-2 focus:ring-navy-300"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Sertifikat English
                </label>
                <textarea
                    value={english}
                    onChange={(e) => {
                        setEnglish(e.target.value);
                        handleUpdate(indo, e.target.value);
                    }}
                    placeholder="Write text in English..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-navy-400 focus:ring-2 focus:ring-navy-300"
                    rows={3}
                />
                <div className="flex flex-col gap-0">
                    <p className="text-xs text-gray-500">
                        *Apabila sertifikat yang akan dikeluarkan menggunakan format inggris, harap isi dan terjemahkan Deskripsi Indonesia menggunakan <Link target="_blank" className="!text-blue-500 underline" href="https://www.deepl.com/en/translator">https://www.deepl.com/en/translator</Link>. Apabila tidak, maka kosongkan
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- Materi Pelatihan Button ---
interface FormatCertificateActionProps {
    idPelatihan: string;
    handleFetchingData: () => void;
    data: PelatihanMasyarakat;
}

const FormatCertificateAction: React.FC<FormatCertificateActionProps> = ({
    idPelatihan,
    handleFetchingData,
    data,
}) => {
    const [isOpenFormMateri, setIsOpenFormMateri] =
        useState<boolean>(false);
    const [materiPelatihan, setMateriPelatihan] = useState<File | null>(null);
    const [dualLangText, setDualLangText] = useState("");
    const [asalSertifikat, setAsalSertifikat] = useState("Not Specific");
    const [loading, setLoading] = useState(false);

    const handleFileMateriChange = (e: any) => {
        setMateriPelatihan(e.target.files[0]);
    };

    const handleUploadMateriPelatihan = async (id: string) => {
        const form = new FormData();
        form.append("IdPelatihan", id);
        if (materiPelatihan) {
            form.append("file", materiPelatihan);
        }

        try {
            // STEP 1: Upload Materi Pelatihan
            const response = await axios.post(
                `${elautBaseUrl}/lemdik/exportModulePelatihan`,
                form,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );

            // Success Toast
            Toast.fire({
                icon: "success",
                title: `Berhasil menambahkan materi pelatihan!`,
            });

            // STEP 2: Update Pelatihan with BeritaAcara, TtdSertifikat, dll
            const updateForm = new FormData();
            if (dualLangText) updateForm.append("DeskripsiSertifikat", dualLangText);
            if (asalSertifikat) updateForm.append("AsalSertifikat", asalSertifikat);

            setLoading(true);
            await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihan?id=${idPelatihan}`,
                updateForm,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            Toast.fire({
                icon: "success",
                title: "Pelatihan berhasil diperbarui!",
            });

            handleFetchingData();
            setIsOpenFormMateri(false);
            setLoading(false);
        } catch (error) {
            console.error("ERROR: ", error);
            Toast.fire({
                icon: "error",
                title: "Gagal memproses materi pelatihan!",
            });
            setLoading(false);
            setIsOpenFormMateri(false);
        }
    };

    return (
        <>
            <AlertDialog open={isOpenFormMateri}>
                <AlertDialogContent
                    className={`max-w-xl`}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <FaBookOpen className="h-4 w-4" />
                            Tambah Materi Pelatihan
                        </AlertDialogTitle>
                        <AlertDialogDescription className="-mt-2">
                            Daftarkan materi pelatihan dan deskripsi yang diselenggarakan yang nantinya akan
                            tercantum pada sertifikat peserta pelatihan!
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <fieldset>
                        <form autoComplete="off">
                            <div className="flex flex-col gap-4">
                                {/* Specific / Not Specific Checkbox */}
                                <div className="flex items-center gap-2">
                                    <input
                                        id="isSpecific"
                                        type="checkbox"
                                        checked={asalSertifikat === "Specific"}
                                        onChange={(e) =>
                                            setAsalSertifikat(e.target.checked ? "Specific" : "Not Specific")
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                                    />
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="isSpecific"
                                            className="text-sm text-gray-800 font-medium cursor-pointer"
                                        >
                                            {asalSertifikat}
                                        </label>
                                        <p className="text-sm text-gray-400">
                                            Apabila materi yang akan tampil pada sertifikat terdiri dari Inti dan Umum maka ceklist jika tidak spesifik maka biarkan tidak terceklist
                                        </p>
                                    </div>

                                </div>


                                {/* Upload File */}
                                <div className="space-y-2">
                                    <label className="block text-gray-800 text-sm font-medium">
                                        Upload File Excel Materi
                                    </label>

                                    <div className="flex gap-3 items-center">
                                        {/* File Input */}
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileMateriChange}
                                            required
                                            className="flex-1 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition focus:border-navy-400 focus:ring-2 focus:ring-navy-300 file:mr-4 file:rounded-md file:border-0 file:bg-navy-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-navy-600"
                                        />

                                        {/* Template Download Button */}
                                        <Link
                                            target="_blank"
                                            href={urlTemplateMateriPelatihan}
                                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                                        >
                                            <PiMicrosoftExcelLogoFill className="h-4 w-4 flex-shrink-0" />
                                            Unduh Template
                                        </Link>
                                    </div>

                                    <div className="flex flex-col gap-0">
                                        <p className="text-xs text-gray-500">
                                            *Download template, isi sesuai format lalu upload kembali.
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            *Petunjuk pengisian format <Link href={urlPetunjukUploadMateriPelatihan} target="_blank" className='!text-blue-500 underline'>{truncateText(urlPetunjukUploadMateriPelatihan, 50, '...')}</Link>
                                        </p>
                                    </div>
                                </div>

                                {/* Dual Language Input */}
                                <DualLangInput
                                    value={dualLangText}
                                    onChange={(val) => setDualLangText(val)}
                                />
                            </div>

                            <AlertDialogFooter className="mt-3">
                                <AlertDialogCancel
                                    onClick={() => setIsOpenFormMateri(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </AlertDialogCancel>
                                {data!.MateriPelatihan.length === 0 && (
                                    <AlertDialogAction
                                        onClick={() =>
                                            handleUploadMateriPelatihan(idPelatihan)
                                        }
                                        disabled={loading}
                                    >
                                        {loading ? "Memproses..." : "Upload"}
                                    </AlertDialogAction>
                                )}
                            </AlertDialogFooter>
                        </form>
                    </fieldset>

                </AlertDialogContent>
            </AlertDialog>

            <Button
                onClick={() => setIsOpenFormMateri(true)}
                variant="outline"
                title="Setting Format Sertifikat"
                className="flex items-center w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-gray-500 text-gray-500 hover:text-white hover:bg-gray-500"
            >
                <FaGear className="h-4 w-4 mr-1" /> Setting Format Sertifikat
            </Button>
        </>
    );
};


export default FormatCertificateAction;
