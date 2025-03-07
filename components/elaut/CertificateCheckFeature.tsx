import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { verifyPDFBSrEUrl } from '@/constants/urls';
import { FaRegCircleQuestion } from 'react-icons/fa6';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserPelatihan } from '@/types/user';
import { sanitizedDangerousChars, validateIsDangerousChars } from '@/utils/input';
import Toast from '../toast';
import axios, { isAxiosError } from 'axios';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { addFiveYears } from '@/utils/pelatihan';
import { DIALOG_TEXTS } from '@/constants/texts';

const CertificateCheckFeature = () => {
    const certificates: Record<string, any>[] = [
        {
            title: 'Cek Sertifikat di E-LAUT',
            description: 'Melihat Validitas Sertifikat-mu dan Keikutsertaanmu di Aplikasi E-LAUT',
            imageSrc: '/icons/icvalidity.png',
            link: null,
            steps: [
                'Klik layanan cek sertifikat di E-LAUT',
                'Masukkan nomor registrasi sobat E-LAUT jika mengikuti pelatihan',
                'Apabila kamu lulus pelatihan, maka nomor registrasi yang kamu masukkan dan sudah terbit sertifikatnya akan muncul data validitas keikutsertaan-mu dan validitas sertifikat-mu',
            ]
        },
        {
            title: 'Cek Sertifikat di BSrE',
            description: 'Melihat Validitas Sertifikat dan Penandatanganan Secara Elektronik',
            imageSrc: '/icons/icbsre.png',
            link: verifyPDFBSrEUrl,
            steps: [
                'Klik layanan cek sertifikat di BSrE',
                'Kamu akan diarahkan ke halaman website PSrE',
                'Unggah dokumen atau file sertifikat bagi sobat E-LAUT yang lulus pelatihan',
                'Tunggu proses validasi',
                'Kamu akan diberitahu dokumen atau file sertifikat valid dan sudah ditandatangani secara elektronik atau belum'
            ]
        },
    ];

    const [selectedCertificatesFeature, setSelectedCertificateFeature] = React.useState<number>(0)
    const [openPopUpInfoCheckCertificateFeature, setOpenPopUpInfoCheckCertificateFeature] = React.useState<boolean>(false)

    const [openPopUpVerifyCertificateFeature, setOpenPopUpVerifyCertificateFeature] = React.useState<boolean>(false)

    const [noRegistrasi, setNoRegistrasi] = React.useState<string>("");
    const [isInputErrorNoRegistrasi, setIsInputErrorNoRegistrasi] = React.useState<boolean>(true)
    const [validSertifikat, setValidSertifikat] =
        React.useState<UserPelatihan | null>(null);
    const [isShowValidForm, setIsShowValidForm] = React.useState<boolean>(false);
    const handleCekValiditasSertifikat = async () => {
        if (validateIsDangerousChars(noRegistrasi)) {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: `Kamu memasukkan karakter berbahaya pada input NIK-mu, cek akun tidak dapat diproses!`,
            });
            setOpenPopUpVerifyCertificateFeature(false)
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
                setOpenPopUpVerifyCertificateFeature(false)
            } catch (error) {
                if (isAxiosError(error)) {
                    Toast.fire({
                        icon: "error",
                        title: 'Oopsss!',
                        text: error.response?.data?.Pesan || "An error occurred",
                    });
                    setOpenPopUpVerifyCertificateFeature(false)
                    setIsShowValidForm(false);
                } else {
                    Toast.fire({
                        icon: "error",
                        title: 'Oopsss!',
                        text: "An unknown error occurred",
                    });
                }
                setNoRegistrasi("");
                setOpenPopUpVerifyCertificateFeature(false)
                setIsShowValidForm(false);
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-2 w-full items-center justify-center p-5 md:p-0">
            <div className="flex flex-col space-y-1 text-center md:text-left">
                <h1 className="text-blue-500 text-[3rem] md:text-[3.6rem] font-calsans leading-none">
                    Cek Validitas Sertifikat
                </h1>
                <p className="text-blue-500">
                    Ayo cek dan lihat kevalidan sertifikat-mu dan keikutsertaanmu dalam pelatihan yang diselenggarakan oleh Balai Pelatihan KP atau Pusat Pelatihan KP di layanan ini!
                </p>

                <p className="text-xs text-gray-600 mt-5">
                    *Untuk sertifikat Awak Kapal Perikanan atau Kepelatuan dapat dicek melalui website <Link target="_blank" title={'Aplikasi Awak Kapal Perikanan'} href='https://akapi.kkp.go.id' className='underline'>akapi.kkp.go.id</Link>
                </p>
            </div>
            <div className="flex md:space-x-2 space-y-2 md:space-y-0 flex-col md:flex-row">
                {certificates.map(({ title, description, imageSrc, link }, index) => {
                    const CardContent = (
                        <div className="flex flex-col gap-2 hover:cursor-pointer duration-700 items-center justify-center w-80 bg-white rounded-3xl p-10 relative">
                            <span onClick={() => { setSelectedCertificateFeature(index); setOpenPopUpInfoCheckCertificateFeature(true) }} className='hover:cursor-pointer hover:scale-105 hover:border-blue-500 hover:text-blue-500 duration-700 absolute top-5 right-5 rounded-full w-7 h-7 p-1 text-grayUsual border border-grayUsual flex items-center justify-center text-lg z-[999999]' title={'Info ' + title}>
                                <FaRegCircleQuestion />
                            </span>
                            <Image src={imageSrc} width={0} height={0} alt={title} className="w-50 h-50" />
                            <div className="flex flex-col space-y-0 items-center justify-center text-center w-full">
                                <h2 className="text-blue-500 font-semibold text-lg">{title}</h2>
                                <p className="text-grayUsual leading-none text-sm">{description}</p>
                            </div>
                            {
                                link ? <Link className='text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500 rounded-2xl font-medium mt-2 flex items-center justify-center duration-700 w-full px-4 py-2 text-sm' href={link} target="_blank" title={title}>
                                    Selengkapnya
                                </Link> : <span onClick={() => setOpenPopUpVerifyCertificateFeature(true)} className='text-blue-500 hover:text-white hover:bg-blue-500 border border-blue-500 rounded-2xl font-medium mt-2 flex items-center justify-center duration-700 w-full px-4 py-2 text-sm'>Selengkapnya</span>
                            }

                        </div>
                    );

                    return <div key={index} title={title}>{CardContent}</div>

                })}
            </div>

            <AlertDialog open={openPopUpInfoCheckCertificateFeature} onOpenChange={setOpenPopUpInfoCheckCertificateFeature}>
                <AlertDialogContent className='z-[999999]'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{certificates[selectedCertificatesFeature].title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {
                                certificates[selectedCertificatesFeature].steps.map((step: string, index: number) => (
                                    <p>
                                        {index + 1}. {step}
                                    </p>
                                ))
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpenPopUpInfoCheckCertificateFeature(false)}>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {validSertifikat != null && <AlertDialog open={isShowValidForm}>
                <AlertDialogContent className="flex flex-col items-center justify-center !w-[420px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="w-full flex gap-2 items-center justify-center flex-col">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-200 via-whiter to-white flex items-center justify-center animate-pulse">
                                <div className="w-16 h-16 rounded-full  bg-gradient-to-b from-gray-300 via-whiter to-white flex items-center justify-center animate-pulse">
                                    <RiVerifiedBadgeFill className="h-12 w-12 text-blue-500" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 w-full justify-center items-center">
                                <h1 className="font-bold text-2xl">
                                    {validSertifikat?.NoRegistrasi!}
                                </h1>
                                <AlertDialogDescription className="w-full text-center font-normal text-sm -mt-1">
                                    No Registrasi valid dan dinyatakan telah mengikuti pelatihan{" "}
                                    <span className="font-semibold">
                                        {validSertifikat?.NamaPelatihan}
                                    </span>{" "}
                                    bidang{" "}
                                    <span className="font-semibold">
                                        {validSertifikat?.BidangPelatihan}
                                    </span>{" "}
                                    dan memiliki sertifikat kelulusan dengan detail sebagai
                                    berikut :
                                </AlertDialogDescription>
                            </div>
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="w-full">
                        <div className="flex-col flex w-full">
                            <div className="flex flex-wrap  border-b py-2 border-b-gray-300 w-full">
                                <div className="w-full">
                                    <label
                                        className="block text-sm text-gray-800  font-medium mb-1"
                                        htmlFor="name"
                                    >
                                        No Sertifikat{" "}
                                    </label>
                                    <p className="text-gray-600 text-base -mt-1">
                                        {validSertifikat?.NoSertifikat}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap border-b py-2 border-b-gray-300 w-full">
                                <div className="w-full">
                                    <label
                                        className="block text-sm text-gray-800 font-medium mb-1"
                                        htmlFor="name"
                                    >
                                        Nama Lengkap{" "}
                                    </label>
                                    <p className="text-gray-600 text-base -mt-1">
                                        {validSertifikat?.Nama}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap border-b py-2 border-b-gray-300 w-full">
                                <div className="w-full">
                                    <label
                                        className="block text-sm text-gray-800 font-medium mb-1"
                                        htmlFor="name"
                                    >
                                        Nama Pelatihan{" "}
                                    </label>
                                    <p className="text-gray-600 text-base -mt-1">
                                        {validSertifikat?.NamaPelatihan}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap border-b py-2 border-b-gray-300 w-full">
                                <div className="w-full">
                                    <label
                                        className="block text-sm text-gray-800 font-medium mb-1"
                                        htmlFor="name"
                                    >
                                        Tanggal Pelaksanaan{" "}
                                    </label>
                                    <p className="text-gray-600 text-base -mt-1">
                                        {"10 Juni 2024 - 19 Juni 2024"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap  py-2  mb-6 w-full">
                                <div className="w-full">
                                    <label
                                        className="block text-sm text-gray-800 font-medium mb-1"
                                        htmlFor="name"
                                    >
                                        Diterbitkan Pada{" "}
                                    </label>
                                    <p className="text-gray-600 text-base -mt-1">
                                        {validSertifikat?.TanggalSertifikat}
                                    </p>
                                </div>
                            </div>
                            <AlertDialogAction
                                className="py-5"
                                onClick={(e) => setIsShowValidForm(!isShowValidForm)}
                            >
                                Close
                            </AlertDialogAction>
                            <p className="italic text-xs leading-[100%] mt-2">
                                * This information is{" "}
                                <span className="font-semibold ">valid</span> and comes from the
                                Ministry of Maritime Affairs and Fisheries of the Republic of
                                Indonesia and{" "}
                                <span className="font-semibold">
                                    is valid until {addFiveYears(validSertifikat?.TanggalSertifikat!)}
                                </span>
                            </p>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>}


            <AlertDialog open={openPopUpVerifyCertificateFeature} onOpenChange={setOpenPopUpVerifyCertificateFeature}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {DIALOG_TEXTS['Cek Sertifikat'].title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {DIALOG_TEXTS['Cek Sertifikat'].desc}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-1 w-full">
                        <div className="w-full">
                            <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="noPeserta">
                                No Peserta <span className="text-red-600">*</span>
                            </label>
                            <input
                                id="noPeserta"
                                type="text"
                                value={noRegistrasi}
                                onChange={(e) => setNoRegistrasi(e.target.value)}
                                className="form-input w-full text-black border-gray-300 rounded-md"
                                placeholder="Masukkan nomor peserta..."
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpenPopUpVerifyCertificateFeature(false)}>Tutup</AlertDialogCancel>
                        {noRegistrasi !== '' && (
                            <AlertDialogAction onClick={(e) => handleCekValiditasSertifikat()} className="bg-blue-500 border-blue-500 hover:bg-blue-500">
                                Cek
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CertificateCheckFeature;
