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
import axios from "axios";
import { elautBaseUrl } from "@/constants/urls";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { PelatihanMasyarakat } from "@/types/product";
import { IoReload } from "react-icons/io5";


interface ReviseCertificateActionProps {
    idPelatihan: string;
    handleFetchingData: () => void;
    data: PelatihanMasyarakat;
}

const ReviseCertificateAction: React.FC<ReviseCertificateActionProps> = ({
    idPelatihan,
    handleFetchingData,
    data,
}) => {
    const [isOpenFormMateri, setIsOpenFormMateri] =
        useState<boolean>(false);
    const [statusRevisi, setStatusRevisi] = useState(data?.IsRevisi || "No Active");
    const [loading, setLoading] = useState(false);

    const handleUpdateStatusRevisi = async (id: string) => {
        try {
            const updateForm = new FormData();
            if (statusRevisi) updateForm.append("IsRevisi", statusRevisi);

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
                            <IoReload className="h-4 w-4" />
                            Revisi Sertifikat
                        </AlertDialogTitle>
                        <AlertDialogDescription className="-mt-2">
                            Dalam melakukan proses revisi, anda harus menetapkan status kelas pelatihan ini dalam status Revisi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <fieldset>
                        <form autoComplete="off">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        id="isSpecific"
                                        type="checkbox"
                                        checked={statusRevisi === "Active"}
                                        onChange={(e) =>
                                            setStatusRevisi(statusRevisi == "Active" ? "No Active" : "Active")
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                                    />
                                    <div className="flex flex-col">
                                        <p className="text-sm text-gray-400">
                                            Apabila anda yakin melakukan revisi maka silahkan ceklist untuk melanjutkan proses berikutnya
                                        </p>
                                    </div>
                                </div>
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
                                            handleUpdateStatusRevisi(idPelatihan)
                                        }
                                        disabled={loading}
                                    >
                                        {loading ? "Memproses..." : "Update Status"}
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
                <IoReload className="h-4 w-4 mr-1" /> {data?.IsRevisi == "No Active" || data?.IsRevisi == "" ? "Revisi Sertifikat" : "Tutup Proses Revisi Sertifikat"}
            </Button>
        </>
    );
};


export default ReviseCertificateAction