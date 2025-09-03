"use client";

import React, { useState } from "react";
import { HiOutlineEyeOff } from "react-icons/hi";
import { HiOutlineEye } from "react-icons/hi2";
import { getDateInIndonesianFormat } from "@/utils/time";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/components/toast";
import { elautBaseUrl } from "@/constants/urls";
import { countUserWithTanggalSertifikat } from "@/utils/counter";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IconType } from "react-icons";
import { FiUploadCloud } from "react-icons/fi";

interface TTDActionProps {
    pelatihan: PelatihanMasyarakat;
    onSuccess: () => void;
    buttonLabel: string;
    buttonColor: string; // e.g. "blue" | "yellow" | "red"
    icon: IconType;
    open: any
    setOpen: any
}

const TTDAction: React.FC<TTDActionProps> = ({
    pelatihan,
    onSuccess,
    buttonLabel,
    buttonColor,
    icon: Icon,
    open,
    setOpen
}) => {
    const [tanggalSertifikat, setTanggalSertifikat] = useState("");
    const [loadingTanggal, setLoadingTanggal] = useState(false);
    const [passphrase, setPassphrase] = useState("");
    const [isShowPassphrase, setIsShowPassphrase] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [statusTanggalSertifikat, setStatusTanggalSertifikat] = useState(false)

    const [activeUserIndex, setActiveUserIndex] = useState<number | null>(null);
    const [openIndexes, setOpenIndexes] = useState<number[]>([]);

    // Save tanggal penandatangan
    const handleTanggalSertifikat = async () => {
        const dataUserPelatihan = pelatihan?.UserPelatihan ?? [];
        setLoadingTanggal(true);

        try {
            for (const user of dataUserPelatihan) {
                const formData = new FormData();
                formData.append(
                    "TanggalSertifikat",
                    getDateInIndonesianFormat(tanggalSertifikat)
                );

                await axios.put(
                    `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
                    formData,
                    { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
                );
            }

            Toast.fire({
                icon: "success",
                title: "Yeayyy!",
                text: `Tanggal penandatanganan berhasil ditentukan untuk STTPL.`,
            });

            setTanggalSertifikat("");
            setLoadingTanggal(false);
            setStatusTanggalSertifikat(true)
            setOpen(true)
            // ⛔ don't close dialog here

            // automatically open first DialogSertifikatPelatihan
            setOpenIndexes(pelatihan?.UserPelatihan.map((_, i) => i) ?? []);
        } catch {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: "Gagal menyematkan tanggal penandatanganan.",
            });
            setLoadingTanggal(false);
        }
    };

    // TTDe Sertifikat
    const handleTTDe = async () => {
        setIsSigning(true);

        if (!passphrase) {
            Toast.fire({
                icon: "error",
                title: "Tidak ada passphrase",
                text: "Harap masukkan passphrase!",
            });
            setIsSigning(false);
            return;
        }

        try {
            await axios.post(
                `${elautBaseUrl}/lemdik/sendSertifikatTtde`,
                {
                    idPelatihan: pelatihan?.IdPelatihan.toString(),
                    kodeParafrase: passphrase,
                    nik: Cookies.get("NIK"),
                },
                { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Sertifikat berhasil ditandatangani secara elektronik.",
            });

            setPassphrase("");
            setIsSigning(false);
            onSuccess();
            setOpen(false); // ✅ close after TTDe success
        } catch {
            Toast.fire({
                icon: "error",
                title: "Gagal TTDe",
                text: "Terjadi kesalahan saat melakukan TTDe.",
            });
            setIsSigning(false);
        }
    };

    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                {/* Content */}
                <AlertDialogContent className="max-w-lg rounded-xl z-[999999999999]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>TTD Sertifikat</AlertDialogTitle>
                        <AlertDialogDescription>
                            Lakukan penyimpanan tanggal atau tandatangan elektronik (TTDe).
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4">
                        {countUserWithTanggalSertifikat(pelatihan.UserPelatihan) === 0 && !statusTanggalSertifikat ? (
                            <div className="flex flex-col w-full space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Tanggal Penandatangan
                                </label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                                    value={tanggalSertifikat}
                                    onChange={(e) => setTanggalSertifikat(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleTanggalSertifikat()}
                                    className="mt-2 px-4 py-2 h-fit bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                                    disabled={loadingTanggal}
                                >
                                    {loadingTanggal ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        ) : (
                            <fieldset>
                                <form autoComplete="off">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Passphrase
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={isShowPassphrase ? "text" : "password"}
                                                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-yellow-500 text-sm"
                                                required
                                                autoComplete="off"
                                                value={passphrase}
                                                onChange={(e) => setPassphrase(e.target.value)}
                                            />
                                            <span
                                                onClick={() => setIsShowPassphrase(!isShowPassphrase)}
                                                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                                            >
                                                {isShowPassphrase ? (
                                                    <HiOutlineEyeOff className="h-5 w-5" />
                                                ) : (
                                                    <HiOutlineEye className="h-5 w-5" />
                                                )}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleTTDe}
                                            disabled={isSigning || !passphrase}
                                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                                        >
                                            {isSigning ? "Menandatangan..." : "TTDe"}
                                        </button>
                                    </div>
                                </form>
                            </fieldset>
                        )}
                    </div>

                    <AlertDialogCancel onClick={() => setOpen(!open)} className="mt-4">Tutup</AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialog>
            <Button
                onClick={() => setOpen(!open)}
                variant="outline"
                className={`flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-${buttonColor}-500 text-${buttonColor}-500 hover:text-white hover:bg-${buttonColor}-500`}
            >
                <Icon className="h-5 w-5" />
                <span>{buttonLabel}</span>
            </Button></>

    );
};

export default React.memo(TTDAction);
