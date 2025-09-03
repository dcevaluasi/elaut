"use client";

import React, { useRef } from "react";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import Cookies from "js-cookie";
import { TbCalendar, TbPencilCheck } from "react-icons/tb";
import TTDAction from "./Actions/Lemdiklat/TTDAction";
import { Button } from "@/components/ui/button";
import DialogSertifikatPelatihan, { DialogSertifikatHandle } from "@/components/sertifikat/dialogSertifikatPelatihan";
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import { getDateInIndonesianFormat } from "@/utils/time";
import Toast from "@/components/toast";
import { HiOutlineEyeOff } from "react-icons/hi";
import { HiOutlineEye } from "react-icons/hi2";
import { countUserWithDrafCertificate, countUserWithTanggalSertifikat } from "@/utils/counter";

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import Link from "next/link";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { MdLock } from "react-icons/md";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: any
}

const TTDeDetail: React.FC<Props> = ({ data, fetchData }) => {
    const [open, setOpen] = React.useState(false);
    const [tanggalSertifikat, setTanggalSertifikat] = React.useState("");
    const [loadingTanggal, setLoadingTanggal] = React.useState(false);
    const [passphrase, setPassphrase] = React.useState("");
    const [isShowPassphrase, setIsShowPassphrase] = React.useState(false);
    const [isSigning, setIsSigning] = React.useState(false);
    const [statusTanggalSertifikat, setStatusTanggalSertifikat] = React.useState(false)



    const [progress, setProgress] = React.useState<number>(0);
    const [counter, setCounter] = React.useState<number>(0);
    const [isUploading, setIsUploading] = React.useState<boolean>(false);

    const refs = useRef<React.RefObject<DialogSertifikatHandle>[]>([]);

    if (refs.current.length !== data.UserPelatihan.length) {
        refs.current = data.UserPelatihan.map((_, i) => refs.current[i] ?? React.createRef<DialogSertifikatHandle>());
    }

    const handleUploadAll = async () => {
        setIsUploading(true);
        setProgress(0);

        for (let i = 0; i < refs.current.length; i++) {
            await refs.current[i].current?.uploadPdf?.();
            setProgress(((i + 1) / refs.current.length) * 100);
            setCounter(i + 1)
        }

        setIsUploading(false);
    };

    // Save tanggal penandatangan
    const handleTanggalSertifikat = async () => {
        const dataUserPelatihan = data?.UserPelatihan ?? [];
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
            fetchData()
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
                    idPelatihan: data?.IdPelatihan.toString(),
                    kodeParafrase: passphrase,
                    nik: Cookies.get("NIK"),
                },
                { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
            );

            await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihan?id=${data?.IdPelatihan}`,
                {
                    StatusPenerbitan: "11"
                },
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            await handleAddHistoryTrainingInExisting(
                data,
                "Telah menandatangani STTPL",
                Cookies.get("Role"),
                Cookies.get("Satker")
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Sertifikat berhasil ditandatangani secara elektronik.",
            });

            setPassphrase("");
            setIsSigning(false);
            fetchData();
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
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition">
                🖋 Penandatanganan
            </div>
            <div className="px-6 py-4 bg-gray-50">
                <div className="flex flex-col w-full gap-4">
                    <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                        <p className="font-medium text-gray-600 text-sm">
                            Action :
                        </p>



                        <AlertDialog open={open} onOpenChange={setOpen}>
                            {/* Content */}
                            <AlertDialogContent className="max-w-lg rounded-xl z-[999999999999]">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>TTD Sertifikat</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Lakukan penandatanganan secara elektronik (TTDe) STTPL
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="space-y-4">
                                    {countUserWithTanggalSertifikat(data.UserPelatihan) === 0 ?
                                        <div className="py-10 w-full mx-auto h-full flex items-center flex-col justify-center gap-1">
                                            <MdLock className='w-14 h-14 text-gray-600' />
                                            <p className="text-gray-500 font-normal text-center text-sm">
                                                Harap untuk mengatur tanggal penerbitan terlebih dahulu, dan proses penandatanganan harus menyesuaikan tanggal yang telah ditentukan jika sesuai maka anda dapat mengklik tombol TTDe
                                            </p>
                                        </div>
                                        : <>
                                            {(isUploading) && (
                                                <div className="w-full">
                                                    Memuat File STTPL
                                                    <Progress value={progress} className="w-full h-3 rounded-lg" />
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {Math.round(progress)}% ({counter}/{data.UserPelatihan.length}) STTPL selesai
                                                    </p>
                                                </div>
                                            )}

                                            {countUserWithDrafCertificate(data?.UserPelatihan) > 0 && (
                                                <fieldset>
                                                    <form autoComplete="off">
                                                        <div className="flex flex-col space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">
                                                                Passphrase
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    disabled={isUploading}
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
                                            )}</>}

                                </div>

                                <AlertDialogCancel onClick={() => setOpen(!open)} className={`mt-4 ${(isSigning || isUploading) && 'hidden'}`}>Tutup</AlertDialogCancel>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog >
                            <AlertDialogTrigger asChild>
                                {countUserWithTanggalSertifikat(data.UserPelatihan) === 0 && <Button
                                    variant="outline"
                                    className={`flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-neutral-600 text-neutral-600 hover:text-white hover:bg-neutral-600`}
                                >
                                    <TbCalendar className="h-5 w-5" />
                                    <span>Tanggal TTDe</span>
                                </Button>}


                            </AlertDialogTrigger>
                            {/* Content */}
                            <AlertDialogContent className="max-w-lg rounded-xl z-[999999999999]">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tanggal TTDe</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Setting tanggal penandatanganan, dan harap pengaturan tanggal menyesuaikan hari anda melakukan TTDe
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="space-y-4">
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
                                </div>

                                <AlertDialogCancel className="mt-4">Tutup</AlertDialogCancel>
                            </AlertDialogContent>
                        </AlertDialog>

                        {
                            data?.StatusPenerbitan == "10" && <Button
                                onClick={() => {
                                    setOpen(!open);
                                    if (countUserWithDrafCertificate(data?.UserPelatihan) == 0) {
                                        handleUploadAll()
                                    }
                                }
                                }
                                variant="outline"
                                className={`flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500`}
                            >
                                <TbPencilCheck className="h-5 w-5" />
                                <span>TTDe STTPL</span>
                            </Button>
                        }

                    </div>

                    <div className="w-full ">
                        <p className="font-medium text-gray-600 mb-2 text-sm">
                            Detail  :
                        </p>

                        <div className={`flex flex-col gap-3`}>
                            {data.UserPelatihan.map((item, i) => (
                                <>
                                    <div className="flex gap-2 items-center justify-between">
                                        <p className="font-semibold text-sm text-gray-600">{i + 1}. {item.Nama} - {item.NoRegistrasi}</p>  {
                                            item.FileSertifikat?.includes('signed') && <Link
                                                target="_blank"
                                                href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${item.FileSertifikat}`}
                                                className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 border "
                                            >
                                                <RiVerifiedBadgeFill className="h-4 w-4  " />
                                                <span className="text-sm">Download Sertifikat</span>
                                            </Link>}
                                    </div>

                                    {
                                        !item.FileSertifikat?.includes('signed') && <DialogSertifikatPelatihan
                                            key={item.IdUserPelatihan ?? i}
                                            ref={refs.current[i]}                 // ✅ pass the ref object directly
                                            pelatihan={data}
                                            userPelatihan={item}
                                            handleFetchingData={fetchData}
                                        />
                                    }
                                </>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TTDeDetail;
