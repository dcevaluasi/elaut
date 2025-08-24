
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { verifyPDFBSrEUrl } from "@/constants/urls";
import { FaRegCircleQuestion } from "react-icons/fa6";
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
import { UserPelatihan } from "@/types/user";
import {
    sanitizedDangerousChars,
    validateIsDangerousChars,
} from "@/utils/input";
import Toast from "../toast";
import axios, { isAxiosError } from "axios";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { addFiveYears } from "@/utils/pelatihan";
import { DIALOG_TEXTS } from "@/constants/texts";
import { generateTanggalPelatihan } from "@/utils/text";

const CertificateCheckFeature = () => {
    const [captcha, setCaptcha] = React.useState<string | null>();
    const certificates: Record<string, any>[] = [
        {
            title: "Cek Sertifikat di E-LAUT",
            description:
                "Melihat Validitas Sertifikat-mu dan Keikutsertaanmu di Aplikasi E-LAUT",
            imageSrc: "/icons/icvalidity.png",
            link: null,
            steps: [
                "Klik layanan cek sertifikat di E-LAUT",
                "Masukkan nomor STTPL sobat E-LAUT jika mengikuti pelatihan",
                "Apabila kamu lulus pelatihan, maka nomor registrasi yang kamu masukkan dan sudah terbit sertifikatnya akan muncul data validitas keikutsertaan-mu dan validitas sertifikat-mu",
            ],
        },
        {
            title: "Cek Sertifikat di BSrE",
            description:
                "Melihat Validitas Sertifikat dan Penandatanganan Secara Elektronik",
            imageSrc: "/icons/icbsre.png",
            link: verifyPDFBSrEUrl,
            steps: [
                "Klik layanan cek sertifikat di BSrE",
                "Kamu akan diarahkan ke halaman website PSrE",
                "Unggah dokumen atau file sertifikat bagi sobat E-LAUT yang lulus pelatihan",
                "Tunggu proses validasi",
                "Kamu akan diberitahu dokumen atau file sertifikat valid dan sudah ditandatangani secara elektronik atau belum",
            ],
        },
    ];

    const [selectedCertificatesFeature, setSelectedCertificateFeature] =
        React.useState<number>(0);
    const [openPopUpInfoCheckCertificateFeature, setOpenPopUpInfoCheckCertificateFeature] =
        React.useState<boolean>(false);
    const [openPopUpVerifyCertificateFeature, setOpenPopUpVerifyCertificateFeature] =
        React.useState<boolean>(false);
    const [noRegistrasi, setNoRegistrasi] = React.useState<string>("");
    const [validSertifikat, setValidSertifikat] =
        React.useState<UserPelatihan | null>(null);
    const [isShowValidForm, setIsShowValidForm] =
        React.useState<boolean>(false);

    const handleCekValiditasSertifikat = async () => {
        if (validateIsDangerousChars(noRegistrasi)) {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: `Kamu memasukkan karakter berbahaya pada input nomor registrasi, cek akun tidak dapat diproses!`,
            });
            setNoRegistrasi("");
            setOpenPopUpVerifyCertificateFeature(true);
        } else {
            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/cekSertifikat`,
                    {
                        no_registrasi: sanitizedDangerousChars(noRegistrasi),
                    }
                );
                setValidSertifikat(response.data.data);
                setIsShowValidForm(true);
                setNoRegistrasi("");
                setOpenPopUpVerifyCertificateFeature(false);
            } catch (error) {
                if (isAxiosError(error)) {
                    Toast.fire({
                        icon: "error",
                        title: "Oopsss!",
                        text: error.response?.data?.Pesan || "An error occurred",
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Oopsss!",
                        text: "An unknown error occurred",
                    });
                }
                setNoRegistrasi("");
                setOpenPopUpVerifyCertificateFeature(false);
                setIsShowValidForm(false);
            }
        }
    };

    return (
        <section className="flex flex-col h-full md:h-[80vh] w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white items-center justify-center pt-20 md:pt-0">
            <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="flex items-center justify-center w-full h-full">
                <div className="max-w-6xl mx-auto">
                    <div className="">
                        <section
                            id="cek-sertifikat"
                            className="scroll-smooth w-full h-full max-w-6xl mx-auto"
                        >
                            <div className="flex flex-col md:flex-row gap-6 w-full items-center justify-center p-5 md:p-0 text-white h-full">
                                {/* Title & Description */}
                                <div className="flex flex-col space-y-3 text-center md:text-left">
                                    <h1 className="text-3xl md:text-[3.6rem] font-calsans leading-none drop-shadow-lg">
                                        Cek    <span className="font-calsans bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 -mt-5">
                                            E-Validitas
                                        </span> Sertifikat
                                    </h1>
                                    <p className="text-gray-200 text-sm md:text-base">
                                        Ayo cek dan lihat kevalidan sertifikat-mu dan keikutsertaanmu dalam
                                        pelatihan yang diselenggarakan oleh Balai Pelatihan KP atau Pusat
                                        Pelatihan KP di layanan ini!
                                    </p>

                                    <p className="text-xs text-gray-400 mt-5">
                                        *Untuk sertifikat Awak Kapal Perikanan atau Kepelatuan dapat dicek
                                        melalui website{" "}
                                        <Link
                                            target="_blank"
                                            title={"Aplikasi Awak Kapal Perikanan"}
                                            href="https://akapi.kkp.go.id"
                                            className="underline hover:text-blue-400"
                                        >
                                            akapi.kkp.go.id
                                        </Link>
                                    </p>
                                </div>

                                {/* Certificate Cards */}
                                <div className="flex md:space-x-4 space-y-4 md:space-y-0 flex-col md:flex-row">
                                    {certificates.map(({ title, description, imageSrc, link }, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className="flex flex-col gap-3 items-center justify-center w-80 
                bg-white/10 backdrop-blur-xl border border-white/20 
                rounded-3xl p-8 relative shadow-lg transition-all duration-500 
                hover:scale-105 "
                                            >
                                                {/* Info Button */}
                                                <span
                                                    onClick={() => {
                                                        setSelectedCertificateFeature(index);
                                                        setOpenPopUpInfoCheckCertificateFeature(true);
                                                    }}
                                                    className="absolute top-5 right-5 rounded-full w-7 h-7 p-1 text-gray-300 border border-gray-400 
                  flex items-center justify-center text-lg z-[999999] hover:text-blue-400 hover:border-blue-400 cursor-pointer"
                                                    title={"Info " + title}
                                                >
                                                    <FaRegCircleQuestion />
                                                </span>

                                                <Image
                                                    src={imageSrc}
                                                    width={90}
                                                    height={90}
                                                    alt={title}
                                                    className="mb-2"
                                                />

                                                <div className="flex flex-col space-y-1 items-center text-center">
                                                    <h2 className="text-lg font-semibold text-blue-400">{title}</h2>
                                                    <p className="text-sm text-gray-200">{description}</p>
                                                </div>

                                                {
                                                    link ? <Link className='text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500 rounded-2xl font-medium mt-2 flex items-center justify-center duration-700 w-full px-4 py-2 text-sm' href={link} target="_blank" title={title}>
                                                        Selengkapnya
                                                    </Link> : <span onClick={() => setOpenPopUpVerifyCertificateFeature(true)} className='text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500 rounded-2xl font-medium mt-2 flex items-center justify-center duration-700 w-full px-4 py-2 text-sm'>Selengkapnya</span>
                                                }
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Info Modal */}
                                <AlertDialog
                                    open={openPopUpInfoCheckCertificateFeature}
                                    onOpenChange={setOpenPopUpInfoCheckCertificateFeature}
                                >
                                    <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-blue-400">
                                                {certificates[selectedCertificatesFeature].title}
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="space-y-2 text-gray-200">
                                                {certificates[selectedCertificatesFeature].steps.map(
                                                    (step: string, index: number) => (
                                                        <p key={index}>
                                                            {index + 1}. {step}
                                                        </p>
                                                    )
                                                )}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="text-gray-200 bg-gray-700">
                                                Close
                                            </AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                {validSertifikat != null && (
                                    <AlertDialog open={isShowValidForm}>
                                        <AlertDialogContent className="flex flex-col items-center justify-center !w-[420px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-white">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="w-full flex gap-2 items-center justify-center flex-col">
                                                    {/* Verified Badge Glow */}
                                                    <div className="w-24 h-24 rounded-full bg-gradient-to-b from-blue-400/50 via-blue-300/20 to-transparent flex items-center justify-center animate-pulse shadow-lg">
                                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                                            <RiVerifiedBadgeFill className="h-12 w-12 text-neutral-200 drop-shadow-[0_0_10px_#3b82f6]" />
                                                        </div>
                                                    </div>

                                                    {/* Certificate Info */}
                                                    <div className="flex flex-col gap-1 w-full justify-center items-center mt-4">
                                                        <h1 className="font-bold text-2xl text-blue-400">
                                                            {validSertifikat?.NoRegistrasi!}
                                                        </h1>
                                                        <AlertDialogDescription className="w-full text-center font-normal text-sm text-gray-200">
                                                            Sertifikat valid dan dinyatakan telah mengikuti pelatihan{" "}
                                                            <span className="font-semibold text-white">
                                                                {validSertifikat?.NamaPelatihan}
                                                            </span>{" "}
                                                            bidang{" "}
                                                            <span className="font-semibold text-white">
                                                                {validSertifikat?.BidangPelatihan}
                                                            </span>{" "}
                                                            dan memiliki sertifikat kelulusan dengan detail sebagai berikut :
                                                        </AlertDialogDescription>
                                                    </div>
                                                </AlertDialogTitle>
                                            </AlertDialogHeader>

                                            <AlertDialogFooter className="w-full">
                                                <div className="flex-col flex w-full">
                                                    {/* Nama Lengkap */}
                                                    <div className="flex flex-wrap border-b border-white/20 py-2 w-full">
                                                        <div className="w-full">
                                                            <label className="block text-sm text-gray-300 font-medium mb-1">
                                                                Nama Lengkap
                                                            </label>
                                                            <p className="text-white text-base">{validSertifikat?.Nama}</p>
                                                        </div>
                                                    </div>

                                                    {/* Nama Pelatihan */}
                                                    <div className="flex flex-wrap border-b border-white/20 py-2 w-full">
                                                        <div className="w-full">
                                                            <label className="block text-sm text-gray-300 font-medium mb-1">
                                                                Nama Pelatihan
                                                            </label>
                                                            <p className="text-white text-base">{validSertifikat?.NamaPelatihan}</p>
                                                        </div>
                                                    </div>

                                                    {/* Tanggal Pelaksanaan */}
                                                    <div className="flex flex-wrap border-b border-white/20 py-2 w-full">
                                                        <div className="w-full">
                                                            <label className="block text-sm text-gray-300 font-medium mb-1">
                                                                Tanggal Pelaksanaan
                                                            </label>
                                                            <p className="text-white text-base">
                                                                {generateTanggalPelatihan(validSertifikat?.TanggalMulai)} -{" "}
                                                                {generateTanggalPelatihan(validSertifikat?.TanggalBerakhir)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Tanggal Sertifikat */}
                                                    <div className="flex flex-wrap py-2 mb-6 w-full">
                                                        <div className="w-full">
                                                            <label className="block text-sm text-gray-300 font-medium mb-1">
                                                                Diterbitkan Pada
                                                            </label>
                                                            <p className="text-white text-base">
                                                                {validSertifikat?.TanggalSertifikat}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Close Button */}
                                                    <AlertDialogAction
                                                        className="py-3 rounded-2xl bg-blue-500/80 text-white hover:bg-blue-500 transition shadow-md"
                                                        onClick={() => setIsShowValidForm(!isShowValidForm)}
                                                    >
                                                        Close
                                                    </AlertDialogAction>

                                                    {/* Disclaimer */}
                                                    <p className="italic text-xs leading-[100%] mt-3 text-gray-300">
                                                        * This information is <span className="font-semibold text-white">valid</span> and comes from the
                                                        Ministry of Maritime Affairs and Fisheries of the Republic of
                                                        Indonesia and <span className="font-semibold text-white">
                                                            is valid until {addFiveYears(validSertifikat?.TanggalSertifikat!)}
                                                        </span>
                                                    </p>
                                                </div>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}

                                {/* Cek Sertifikat Pop-up */}
                                <AlertDialog open={openPopUpVerifyCertificateFeature} onOpenChange={setOpenPopUpVerifyCertificateFeature}>
                                    <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-blue-500">
                                                {DIALOG_TEXTS["Cek Sertifikat"].title}
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-200">
                                                {DIALOG_TEXTS["Cek Sertifikat"].desc}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>

                                        <div className="flex flex-col gap-3 w-full mt-3">
                                            <div className="w-full">
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    No STTPL <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    id="noPeserta"
                                                    type="text"
                                                    value={noRegistrasi}
                                                    onChange={(e) => setNoRegistrasi(e.target.value)}
                                                    className="form-input w-full rounded-lg border border-white/30 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    placeholder="Masukkan nomor STTPL..."
                                                />
                                            </div>
                                        </div>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="text-gray-200  bg-white/20 rounded-xl transition">
                                                Close
                                            </AlertDialogCancel>
                                            {noRegistrasi !== "" && (
                                                <AlertDialogAction
                                                    onClick={() => handleCekValiditasSertifikat()}
                                                    className="bg-blue-500/80 border border-blue-400 text-white rounded-xl hover:bg-blue-500 transition shadow-md"
                                                >
                                                    Cek
                                                </AlertDialogAction>
                                            )}
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </section>

    );
};

export default CertificateCheckFeature;
