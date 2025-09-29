"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl, urlFileBeritaAcara, urlFileLapwas } from "@/constants/urls";
import { IconType } from "react-icons";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { PelatihanMasyarakat } from "@/types/product";
import { useFetchDataPusat } from "@/hooks/elaut/pusat/useFetchDataPusat";
import { breakdownStatus } from "@/lib/utils";

interface SendNoteActionProps {
    idPelatihan: string;
    title: string;
    description: string;
    buttonLabel: string;
    icon: IconType;
    buttonColor?: string;
    onSuccess: () => void;
    status: string;
    pelatihan: PelatihanMasyarakat;
}

const SendNoteAction: React.FC<SendNoteActionProps> = ({
    idPelatihan,
    title,
    description,
    buttonLabel,
    icon: Icon,
    buttonColor = "blue",
    onSuccess,
    status,
    pelatihan,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [verifikatorPelaksanaan, setVerifikatorPelaksanaan] = useState(pelatihan!.VerifikatorPelatihan)
    const [beritaAcaraFile, setBeritaAcaraFile] = useState<File | null>(null);
    const [lapPengawasan, setLapPengawasan] = useState<File | null>(null);
    const [isPengawas, setIsPengawas] = useState(false)
    const oldFileUrl = pelatihan!.BeritaAcara
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setBeritaAcaraFile(e.target.files[0]);
        }
    };
    const [isSubmitting, setIsSubmitting] = useState(false)

    const oldFileLapwasUrl = pelatihan!.MemoPusat
    const handleFileChangeLapwas = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setLapPengawasan(e.target.files[0]);
        }
    };

    const { adminPusatData, loading: loadingPusat, error, fetchAdminPusatData } =
        useFetchDataPusat();

    useEffect(() => {
        fetchAdminPusatData()
    }, [fetchAdminPusatData])

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setLoading(true);
        setIsOpen(true)
        setLoading(true)
        const formData = new FormData();
        formData.append("StatusPenerbitan", status);
        formData.append("VerifikatorPelatihan", verifikatorPelaksanaan);
        formData.append("VerifikatorSertifikat", verifikatorPelaksanaan);
        if (beritaAcaraFile) formData.append("BeritaAcara", beritaAcaraFile);
        if (lapPengawasan) formData.append("MemoPusat", lapPengawasan);
        if (status == "4") formData.append("PemberitahuanDiterima", "Active")

        try {

            const response = await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihan?id=${idPelatihan}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            await handleAddHistoryTrainingInExisting(
                pelatihan,
                message,
                Cookies.get("Role"),
                `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: `${title} berhasil diproses.`,
            });

            setMessage("");
            setVerifikatorPelaksanaan("");

            setBeritaAcaraFile(null);

            onSuccess();
        } catch (error) {
            setMessage("");
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memproses tindakan.",
            });

        } finally {
            setLoading(false);
            setIsSubmitting(false)
            setIsOpen(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button

                    className={`flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all border bg-transparent border-${buttonColor}-500 text-${buttonColor}-500 hover:text-white hover:bg-${buttonColor}-500`}
                >
                    <Icon className="h-5 w-5" />
                    <span>{buttonLabel}</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                {/* Input Pesan */}
                {
                    (Cookies.get('Access')?.includes('supervisePelaksanaan') && (pelatihan?.StatusPenerbitan == "1") && title == "Pilih Verifikator") && <div>
                        <Select
                            value={verifikatorPelaksanaan}
                            onValueChange={setVerifikatorPelaksanaan}
                            disabled={loading || loadingPusat}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Verifikator" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[9999999]">
                                {loadingPusat ? <></> : <> {adminPusatData.filter((item) => breakdownStatus(item.Status)[0] == "Verifikator").map((admin) => (
                                    <SelectItem
                                        key={admin.IdAdminPusat}
                                        value={admin.IdAdminPusat.toString()}
                                    >
                                        {admin.Nama}
                                    </SelectItem>
                                ))}</>}

                            </SelectContent>
                        </Select>
                    </div>
                }

                {
                    (pelatihan?.StatusPenerbitan == "1.25" || pelatihan?.StatusPenerbitan == "1.5" || pelatihan?.StatusPenerbitan == "5" || pelatihan?.StatusPenerbitan == "7" || pelatihan?.StatusPenerbitan == "9") && <>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Upload Dokumen Penerbitan STTPL
                            </label>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                    className="peer block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition 
                 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 
                 file:bg-navy-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white 
                 hover:file:bg-navy-600 
                 focus:border-navy-400 focus:ring-2 focus:ring-navy-300 
                 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Format file: <span className="font-medium">PDF, DOC, DOCX</span>
                            </p>

                            {/* Old file preview */}
                            {oldFileUrl && (
                                <div className="mt-3 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        📄
                                        <span className="truncate max-w-[200px]">Dokumen Penerbitan STTPL</span>
                                    </div>
                                    <a
                                        href={`${urlFileBeritaAcara}/${oldFileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-navy-600 hover:text-navy-800 font-medium transition"
                                    >
                                        Lihat
                                    </a>
                                </div>
                            )}
                        </div>
                    </>
                }

                <div className="mb-2">
                    <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="email"
                    >
                        Catatan
                    </label>
                    <Textarea
                        placeholder="Tulis catatan atau pesan Anda di sini..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    {
                        title == "Ajukan Penerbitan STTPL" ? <Button
                            onClick={handleSubmit}
                            className={`bg-${buttonColor}-500 hover:bg-${buttonColor}-700 text-white`}
                            disabled={loading || !message || !beritaAcaraFile}
                        >
                            {loading ? "Memproses..." : "Kirim"}
                        </Button> : <Button
                            onClick={handleSubmit}
                            className={`bg-${buttonColor}-500 hover:bg-${buttonColor}-700 text-white`}
                            disabled={loading || !message}
                        >
                            {loading ? "Memproses..." : "Kirim"}
                        </Button>
                    }


                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog >
    );
};

export default SendNoteAction;
