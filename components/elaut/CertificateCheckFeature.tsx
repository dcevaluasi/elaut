
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

interface PelatihanByNik {
    nama: string;
    nik: string;
    nama_pelatihan: string;
    bidang_pelatihan: string;
    no_sertifikat: string;
    no_registrasi: string;
}

const CertificateCheckFeature = () => {
    const certificates: Record<string, any>[] = [
        {
            title: "Cek Sertifikat di E-LAUT",
            description:
                "Melihat Validitas Sertifikat-mu dan Keikutsertaanmu di Aplikasi E-LAUT",
            imageSrc: "/icons/icvalidity.png",
            link: null,
            type: "sttpl",
            steps: [
                "Klik layanan cek sertifikat di E-LAUT",
                "Masukkan nomor STTPL sobat E-LAUT jika mengikuti pelatihan",
                "Apabila kamu lulus pelatihan, maka nomor STTPL yang kamu masukkan dan sudah terbit sertifikatnya akan muncul data validitas keikutsertaan-mu dan validitas sertifikat-mu",
            ],
        },
        {
            title: "Cek Pelatihan Berdasarkan NIK",
            description:
                "Melihat Riwayat Pelatihan yang Pernah Diikuti Berdasarkan NIK",
            imageSrc: "/icons/icsearch.png",
            link: null,
            type: "nik",
            steps: [
                "Klik layanan cek pelatihan berdasarkan NIK",
                "Masukkan NIK (Nomor Induk Kependudukan) kamu",
                "Sistem akan menampilkan seluruh riwayat pelatihan yang pernah kamu ikuti",
                "Kamu dapat melihat detail pelatihan termasuk nama pelatihan, bidang, dan nomor STTPL",
            ],
        },
        {
            title: "Cek Sertifikat di BSrE",
            description:
                "Melihat Validitas Sertifikat dan Penandatanganan Secara Elektronik",
            imageSrc: "/icons/icbsre.png",
            link: verifyPDFBSrEUrl,
            type: "bsre",
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
    const [openPopUpVerifyByNik, setOpenPopUpVerifyByNik] =
        React.useState<boolean>(false);
    const [noRegistrasi, setNoRegistrasi] = React.useState<string>("");
    const [nik, setNik] = React.useState<string>("");
    const [validSertifikat, setValidSertifikat] =
        React.useState<UserPelatihan | null>(null);
    const [pelatihanByNik, setPelatihanByNik] =
        React.useState<PelatihanByNik[] | null>(null);
    const [isShowValidForm, setIsShowValidForm] =
        React.useState<boolean>(false);
    const [isShowPelatihanByNikForm, setIsShowPelatihanByNikForm] =
        React.useState<boolean>(false);
    const [isLoadingSertifikat, setIsLoadingSertifikat] =
        React.useState<boolean>(false);
    const [isLoadingPelatihanByNik, setIsLoadingPelatihanByNik] =
        React.useState<boolean>(false);

    const handleCekValiditasSertifikat = async () => {
        if (validateIsDangerousChars(noRegistrasi)) {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: `Kamu memasukkan karakter berbahaya pada input nomor sttpl, cek akun tidak dapat diproses!`,
            });
            setNoRegistrasi("");
            return;
        }

        setIsLoadingSertifikat(true);
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
                const errorMessage = error.response?.data?.Pesan || "Data sertifikat tidak ditemukan";
                Toast.fire({
                    icon: "error",
                    title: "Data Tidak Ditemukan",
                    text: errorMessage,
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Oopsss!",
                    text: "Terjadi kesalahan yang tidak diketahui",
                });
            }
            setValidSertifikat(null);
            setIsShowValidForm(false);
        } finally {
            setIsLoadingSertifikat(false);
        }
    };

    const handleCekPelatihanByNik = async () => {
        if (validateIsDangerousChars(nik)) {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: `Kamu memasukkan karakter berbahaya pada input NIK, cek pelatihan tidak dapat diproses!`,
            });
            setNik("");
            return;
        }

        setIsLoadingPelatihanByNik(true);
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/getPelatihanByNik`,
                {
                    nik: sanitizedDangerousChars(nik),
                }
            );

            if (response.data.data && response.data.data.length > 0) {
                setPelatihanByNik(response.data.data);
                setIsShowPelatihanByNikForm(true);
                setNik("");
                setOpenPopUpVerifyByNik(false);
            } else {
                Toast.fire({
                    icon: "warning",
                    title: "Data Tidak Ditemukan",
                    text: "Tidak ada riwayat pelatihan ditemukan untuk NIK yang dimasukkan",
                });
                setPelatihanByNik(null);
                setIsShowPelatihanByNikForm(false);
            }
        } catch (error) {
            if (isAxiosError(error)) {
                const errorMessage = error.response?.data?.Pesan || "Data pelatihan tidak ditemukan untuk NIK yang dimasukkan";
                Toast.fire({
                    icon: "error",
                    title: "Data Tidak Ditemukan",
                    text: "Nomor STTPL tidak dapat ditemukan, kamu belum mengikuti pelatihan!",
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Oopsss!",
                    text: "Terjadi kesalahan yang tidak diketahui",
                });
            }
            setPelatihanByNik(null);
            setIsShowPelatihanByNikForm(false);
        } finally {
            setIsLoadingPelatihanByNik(false);
        }
    };

    return (
        <section className="flex flex-col min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white items-center justify-center py-20 md:py-24">

            <div className="flex items-center justify-center w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <section
                        id="cek-sertifikat"
                        className="scroll-smooth w-full"
                    >
                        <div className="flex flex-col gap-8 md:gap-12 w-full items-center text-white">
                            {/* Title & Description */}
                            <div className="certificate-title flex flex-col space-y-4 text-center w-full max-w-4xl">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-calsans leading-none drop-shadow-lg">
                                    Cek <span className="font-calsans bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                                        Validitas
                                    </span> e-Sertifikat
                                </h1>
                                <p className="text-gray-200 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                                    Ayo cek dan lihat kevalidan sertifikat-mu dan keikutsertaanmu dalam
                                    pelatihan yang diselenggarakan oleh Balai Pelatihan KP atau Pusat
                                    Pelatihan KP di layanan ini!
                                </p>

                                <p className="text-xs sm:text-sm text-gray-400 mt-2">
                                    *Untuk sertifikat Awak Kapal Perikanan atau Kepelatuan dapat dicek
                                    melalui website{" "}
                                    <Link
                                        target="_blank"
                                        title={"Aplikasi Awak Kapal Perikanan"}
                                        href="https://akapi.kkp.go.id"
                                        className="underline hover:text-blue-400 transition-colors"
                                    >
                                        akapi.kkp.go.id
                                    </Link>
                                </p>
                            </div>

                            {/* Certificate Cards */}
                            <div className="certificate-cards w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
                                {certificates.map(({ title, description, imageSrc, link, type }, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-3 items-center justify-center w-full
                                                bg-white/10 backdrop-blur-lg border border-white/20
                                                rounded-3xl p-6 sm:p-8 relative shadow-2xl transition-all duration-500
                                                hover:scale-105 hover:shadow-2xl"
                                        >
                                            {/* Info Button */}
                                            <span
                                                onClick={() => {
                                                    setSelectedCertificateFeature(index);
                                                    setOpenPopUpInfoCheckCertificateFeature(true);
                                                }}
                                                className="absolute top-4 right-4 rounded-full w-8 h-8 p-1 text-gray-300 border border-gray-400
                                                    flex items-center justify-center text-lg hover:text-blue-400 hover:border-blue-400 cursor-pointer transition-all"
                                                title={"Info " + title}
                                            >
                                                <FaRegCircleQuestion />
                                            </span>

                                            <Image
                                                src={imageSrc}
                                                width={90}
                                                height={90}
                                                alt={title}
                                                className="mb-2 w-20 h-20 sm:w-24 sm:h-24 object-contain"
                                            />

                                            <div className="flex flex-col space-y-2 items-center text-center">
                                                <h2 className="text-base sm:text-lg font-semibold text-blue-400">{title}</h2>
                                                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">{description}</p>
                                            </div>

                                            {
                                                link ? (
                                                    <Link
                                                        className='text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500
                                                            rounded-2xl font-medium mt-2 flex items-center justify-center transition-all duration-300
                                                            w-full px-4 py-2.5 text-sm cursor-pointer'
                                                        href={link}
                                                        target="_blank"
                                                        title={title}
                                                    >
                                                        Selengkapnya
                                                    </Link>
                                                ) : (
                                                    <span
                                                        onClick={() => {
                                                            if (type === "nik") {
                                                                setOpenPopUpVerifyByNik(true);
                                                            } else {
                                                                setOpenPopUpVerifyCertificateFeature(true);
                                                            }
                                                        }}
                                                        className='text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500
                                                            rounded-2xl font-medium mt-2 flex items-center justify-center transition-all duration-300
                                                            w-full px-4 py-2.5 text-sm cursor-pointer'
                                                    >
                                                        Selengkapnya
                                                    </span>
                                                )
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
                                <AlertDialogContent className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white shadow-2xl">
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
                                    <AlertDialogContent className="flex flex-col items-center justify-center !w-[420px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl text-white">
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
                                                    className="py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
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
                                <AlertDialogContent className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl text-white">
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
                                                className="form-input w-full p-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                                                disabled={isLoadingSertifikat}
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoadingSertifikat ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Memproses...
                                                    </span>
                                                ) : "Cek"}
                                            </AlertDialogAction>
                                        )}
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* Cek Pelatihan by NIK Pop-up */}
                            <AlertDialog open={openPopUpVerifyByNik} onOpenChange={setOpenPopUpVerifyByNik}>
                                <AlertDialogContent className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl text-white">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-blue-500">
                                            Cek Pelatihan Berdasarkan NIK
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-200">
                                            Masukkan Nomor Induk Kependudukan (NIK) untuk melihat riwayat pelatihan yang pernah diikuti
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="flex flex-col gap-3 w-full mt-3">
                                        <div className="w-full">
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                NIK <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                id="nik"
                                                type="text"
                                                value={nik}
                                                onChange={(e) => setNik(e.target.value)}
                                                className="form-input w-full p-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                placeholder="Masukkan NIK (16 digit)..."
                                                maxLength={16}
                                            />
                                        </div>
                                    </div>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="text-gray-200 bg-white/20 rounded-xl transition">
                                            Close
                                        </AlertDialogCancel>
                                        {nik !== "" && (
                                            <AlertDialogAction
                                                onClick={() => handleCekPelatihanByNik()}
                                                disabled={isLoadingPelatihanByNik}
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoadingPelatihanByNik ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Memproses...
                                                    </span>
                                                ) : "Cek Pelatihan"}
                                            </AlertDialogAction>
                                        )}
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* Pelatihan by NIK Result */}
                            {pelatihanByNik != null && (
                                <AlertDialog open={isShowPelatihanByNikForm}>
                                    <AlertDialogContent className="flex flex-col items-start justify-start max-w-4xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl text-white">
                                        <AlertDialogHeader className="w-full">
                                            <AlertDialogTitle className="w-full flex gap-3 items-center justify-start flex-row">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-blue-400/50 via-blue-300/20 to-transparent flex items-center justify-center shadow-lg">
                                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                                        <RiVerifiedBadgeFill className="h-8 w-8 text-neutral-200 drop-shadow-[0_0_10px_#3b82f6]" />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <h1 className="font-bold text-2xl text-blue-400">
                                                        Riwayat Pelatihan Ditemukan
                                                    </h1>
                                                    <AlertDialogDescription className="text-gray-200 text-sm">
                                                        Ditemukan <span className="font-semibold text-white">{pelatihanByNik.length}</span> riwayat pelatihan untuk NIK: <span className="font-semibold text-white">{pelatihanByNik[0]?.nik}</span>
                                                    </AlertDialogDescription>
                                                </div>
                                            </AlertDialogTitle>
                                        </AlertDialogHeader>

                                        <AlertDialogFooter className="w-full">
                                            <div className="flex-col flex w-full gap-4">
                                                {/* Training List */}
                                                <div className="w-full space-y-3">
                                                    {pelatihanByNik.map((pelatihan, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                                                        >
                                                            {/* Header */}
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                                        <span className="text-blue-400 font-bold text-lg">
                                                                            {index + 1}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-semibold text-white text-lg">
                                                                            {pelatihan.nama}
                                                                        </h3>
                                                                        <p className="text-gray-300 text-sm">
                                                                            NIK: {pelatihan.nik}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Details Grid */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <div>
                                                                        <label className="block text-xs text-gray-400 mb-1">
                                                                            Nama Pelatihan
                                                                        </label>
                                                                        <p className="text-white text-sm font-medium">
                                                                            {pelatihan.nama_pelatihan}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs text-gray-400 mb-1">
                                                                            Bidang Pelatihan
                                                                        </label>
                                                                        <p className="text-white text-sm">
                                                                            {pelatihan.bidang_pelatihan}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div>
                                                                        <label className="block text-xs text-gray-400 mb-1">
                                                                            Nomor STTPL
                                                                        </label>
                                                                        <p className="text-blue-300 text-sm font-mono">
                                                                            {pelatihan.no_registrasi}
                                                                        </p>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Close Button */}
                                                <AlertDialogAction
                                                    className="py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
                                                    onClick={() => setIsShowPelatihanByNikForm(!isShowPelatihanByNikForm)}
                                                >
                                                    Close
                                                </AlertDialogAction>

                                                {/* Disclaimer */}
                                                <p className="italic text-xs leading-[100%] text-gray-300 text-center">
                                                    * Informasi ini <span className="font-semibold text-white">valid</span> dan berasal dari Kementerian Kelautan dan Perikanan Republik Indonesia
                                                </p>
                                            </div>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
};

export default CertificateCheckFeature;
