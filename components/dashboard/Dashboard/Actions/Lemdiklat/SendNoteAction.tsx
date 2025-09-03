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
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Toast from "@/components/toast";
import { elautBaseUrl, urlFileBeritaAcara } from "@/constants/urls";
import { IconType } from "react-icons";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { PelatihanMasyarakat } from "@/types/product";
import { useFetchDataPusat } from "@/hooks/elaut/pusat/useFetchDataPusat";
import { breakdownStatus } from "@/lib/utils";
import { ESELON_1, ESELON_2, ESELON_3 } from "@/constants/nomenclatures";
import { truncateText } from "@/utils";
import { UK_ESELON_2 } from "@/constants/unitkerja";
import { HiOutlineEyeOff } from "react-icons/hi";
import { HiOutlineEye } from "react-icons/hi2";
import { getDateInIndonesianFormat } from "@/utils/time";
import { countUserWithTanggalSertifikat } from "@/utils/counter";

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
    const [ttdSertifikat, setTtdSertifikat] = useState(pelatihan!.TtdSertifikat);
    const oldFileUrl = pelatihan!.BeritaAcara
    const [tanggalSertifikat, setTanggalSertifikat] = useState('')
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setBeritaAcaraFile(e.target.files[0]);
        }
    };


    const { adminPusatData, loading: loadingPusat, error, fetchAdminPusatData } =
        useFetchDataPusat();

    useEffect(() => {
        if (isOpen) {
            fetchAdminPusatData();
        }
    }, [isOpen, fetchAdminPusatData]);

    const [loadingTanggalSertifikat, setLoadingTanggalSertifikat] = useState(false)
    const handleTanggalSertifikatDataPesertaPelatihan = async () => {
        const dataUserPelatihan = pelatihan?.UserPelatihan ?? []
        setLoadingTanggalSertifikat(true)
        try {

            for (const user of dataUserPelatihan) {
                const formData = new FormData()
                formData.append("TanggalSertifikat", getDateInIndonesianFormat(tanggalSertifikat))

                await axios.put(
                    `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        },
                    }
                )
            }

            Toast.fire({
                icon: "success",
                title: "Yeayyy!",
                text: `Berhasil menyematkan tanggal penandatanganan untuk ${dataUserPelatihan.length} sertifikat!`,
            })

            setLoadingTanggalSertifikat(false)
            setTanggalSertifikat("")
        } catch (error) {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: `Gagal menyematkan tanggal penandatanganan untuk ${dataUserPelatihan.length} sertifikat!`,
            })
            setLoadingTanggalSertifikat(false)
        }
    }

    const [passphrase, setPassphrase] = React.useState<string>("");
    const [isSigning, setIsSigning] = React.useState<boolean>(false);
    const handleTTDElektronik = async () => {
        setIsSigning(true);
        if (passphrase === "") {
            Toast.fire({
                icon: "error",
                text: "Harap memasukkan passphrase untuk dapat melakukan penandatanganan file sertifikat!",
                title: `Tidak ada passphrase`,
            });
            setPassphrase("");
            setIsSigning(false);
        } else {
            try {
                const response = await axios.post(
                    elautBaseUrl + "/lemdik/sendSertifikatTtde",
                    {
                        idPelatihan: pelatihan?.IdPelatihan.toString(),
                        kodeParafrase: passphrase,
                        nik: Cookies.get('NIK'),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        },
                    }
                );


                console.log("TTDE", response);
                console.log("File uploaded successfully");
                Toast.fire({
                    icon: "success",
                    text: "Berhasil melakuukan penandatangan sertifikat secara elektronik!",
                    title: `Berhasil TTDe`,
                });
                await handleSubmit()
                setPassphrase("");

                onSuccess()
            } catch (error) {
                console.error("Error uploading the file:", error);
                setPassphrase("");
                onSuccess()
                setIsSigning(false);
                if (error instanceof AxiosError)
                    Toast.fire({
                        icon: "error",
                        text: "Internal server error",
                        title: `Gagal TTDe`,
                    });
            }
        }
    };

    const [isShowPassphrase, setIsShowPassphrase] = React.useState<boolean>(false);


    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("StatusPenerbitan", status);
        formData.append("VerifikatorPelatihan", verifikatorPelaksanaan);
        formData.append("VerifikatorSertifikat", verifikatorPelaksanaan);
        if (beritaAcaraFile) formData.append("BeritaAcara", beritaAcaraFile);
        if (ttdSertifikat) formData.append("TtdSertifikat", ttdSertifikat);

        try {
            setLoading(true);
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
                Cookies.get("Satker")
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: `${title} berhasil diproses.`,
            });

            setMessage("");
            setVerifikatorPelaksanaan("");

            setBeritaAcaraFile(null);
            setTtdSertifikat("");
            setLoading(false);
            onSuccess();
            console.log("SEND ACTION RESPONSE: ", response);
            setIsOpen(false);
        } catch (error) {
            console.error("ERROR SEND ACTION: ", error);
            setLoading(false);
            setMessage("");
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memproses tindakan.",
            });
            setIsOpen(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className={`flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-${buttonColor}-500 text-${buttonColor}-500 hover:text-white hover:bg-${buttonColor}-500`}
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
                    (Cookies.get('Access')?.includes('supervisePelaksanaan') && (pelatihan?.StatusPenerbitan == "1" || pelatihan?.StatusPenerbitan == "6")) && <div>
                        <Select
                            value={verifikatorPelaksanaan}
                            onValueChange={setVerifikatorPelaksanaan}
                            disabled={loading || loadingPusat}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Verifikator" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[9999999]">
                                {adminPusatData.filter((item) => breakdownStatus(item.Status)[0] == "Verifikator").map((admin) => (
                                    <SelectItem
                                        key={admin.IdAdminPusat}
                                        value={admin.IdAdminPusat.toString()}
                                    >
                                        {admin.Nama}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                }

                {
                    (pelatihan?.StatusPenerbitan == "5" || pelatihan?.StatusPenerbitan == "7" || pelatihan?.StatusPenerbitan == "9") && <>
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

                        {/* Select Ttd Sertifikat */}
                        <div className="">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Penandatangan Sertifikat
                            </label>
                            <Select
                                value={ttdSertifikat}
                                onValueChange={setTtdSertifikat}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Penandatangan" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[9999999]">
                                    <SelectItem value={ESELON_1.fullName}>{ESELON_1.abbrv}</SelectItem>
                                    <SelectItem value={ESELON_2.fullName}>{ESELON_2.abbrv}</SelectItem>
                                    <SelectItem value={ESELON_3.fullName}>{ESELON_3.abbrv}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                }

                {!Cookies.get('Access')?.includes('approveKapus') && <div className="mb-2">
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
                </div>}

                {(Cookies.get('Access')?.includes('approveKapus') && pelatihan.StatusPenerbitan == "10" && pelatihan.TtdSertifikat == Cookies.get("Role")) &&
                    <div className="space-y-4">
                        {/* Step 1: Pilih Tanggal */}
                        {(countUserWithTanggalSertifikat(pelatihan!.UserPelatihan) == 0) ? (
                            <div className="space-x-1 flex flex-col w-full">
                                <div className="
                                ">
                                    <label className="text-sm font-medium text-gray-700">Tanggal Penandatangan</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                                        value={tanggalSertifikat}
                                        onChange={(e) => {
                                            setTanggalSertifikat(e.target.value)
                                            setMessage("Telah ditandatangani")
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleTanggalSertifikatDataPesertaPelatihan}
                                    className="mt-2 px-4 py-2 h-fit bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                >
                                    {loadingTanggalSertifikat ? "Loading..." : "Simpan"}
                                </button>
                            </div>
                        ) : <fieldset>
                            <form autoComplete="off">
                                <div className="flex flex-wrap -mx-3 mb-1 -mt-2">
                                    <div className="w-full px-3">
                                        <label className="block text-gray-800 text-sm font-medium mb-1">Passphrase</label>
                                        <div className="flex gap-1">
                                            <span className="relative w-full h-fit">
                                                <input
                                                    type={isShowPassphrase ? "text" : "password"}
                                                    className="text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md px-2"
                                                    required
                                                    autoComplete="off"
                                                    value={passphrase}
                                                    onChange={(e) => setPassphrase(e.target.value)}
                                                />
                                                <span
                                                    onClick={() => setIsShowPassphrase(!isShowPassphrase)}
                                                    className="absolute right-2 top-2 cursor-pointer"
                                                >
                                                    {isShowPassphrase ? (
                                                        <HiOutlineEyeOff className="text-gray-500 text-xl" />
                                                    ) : (
                                                        <HiOutlineEye className="text-gray-500 text-xl" />
                                                    )}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </fieldset>}
                    </div>

                }

                {(Cookies.get('Access')?.includes('approveKapus') && pelatihan.StatusPenerbitan == "10" && pelatihan.TtdSertifikat == Cookies.get("Role")) ? <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleTTDElektronik}
                        className={`bg-${buttonColor}-600 hover:bg-${buttonColor}-700 text-white`}
                        disabled={isSigning || !message || !passphrase}
                    >
                        {isSigning ? "Menandatangan..." : "TTDe"}
                    </AlertDialogAction>
                </AlertDialogFooter> : <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        className={`bg-${buttonColor}-600 hover:bg-${buttonColor}-700 text-white`}
                        disabled={loading || !message}
                    >
                        {loading ? "Memproses..." : "Kirim"}
                    </AlertDialogAction>
                </AlertDialogFooter>}

            </AlertDialogContent>
        </AlertDialog >
    );
};

export default SendNoteAction;
