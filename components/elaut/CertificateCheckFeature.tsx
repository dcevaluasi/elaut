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

    return (
        <div className="flex flex-col md:flex-row gap-2 w-full items-center justify-center p-5 md:p-0">
            <div className="flex flex-col space-y-1 text-center md:text-left">
                <h1 className="text-blue-500 text-[3rem] md:text-[3.6rem] font-calsans leading-none">
                    Cek Validitas Sertifikat
                </h1>
                <p className="text-blue-500">
                    Ayo cek dan lihat kevalidan sertifikat-mu dan keikutsertaanmu dalam pelatihan yang diselenggarakan oleh Balai Pelatihan KP atau Pusat Pelatihan KP di layanan ini!
                </p>
            </div>
            <div className="flex md:space-x-2 space-y-2 md:space-y-0 flex-col md:flex-row">
                {certificates.map(({ title, description, imageSrc, link }, index) => {
                    const CardContent = (
                        <div className="flex flex-col gap-2 hover:cursor-pointer hover:animate-pulse duration-700 items-center justify-center w-80 bg-white rounded-3xl p-10 relative">
                            <span onClick={() => { setSelectedCertificateFeature(index); setOpenPopUpInfoCheckCertificateFeature(true) }} className='hover:cursor-pointer hover:scale-105 hover:border-blue-500 hover:text-blue-500 duration-700 absolute top-5 right-5 rounded-full w-7 h-7 p-1 text-grayUsual border border-grayUsual flex items-center justify-center text-lg z-[999999]' title={'Info ' + title}>
                                <FaRegCircleQuestion />
                            </span>
                            <Image src={imageSrc} width={0} height={0} alt={title} className="w-50 h-50" />
                            <div className="flex flex-col space-y-0 items-center justify-center text-center w-full">
                                <h2 className="text-blue-500 font-semibold text-lg">{title}</h2>
                                <p className="text-grayUsual leading-none text-sm">{description}</p>
                            </div>
                        </div>
                    );

                    return link ? (
                        <Link key={index} href={link} target="_blank" title={title}>
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={index} title={title}>{CardContent}</div>
                    );
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
                        <AlertDialogCancel onClick={() => setOpenPopUpInfoCheckCertificateFeature(false)}>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CertificateCheckFeature;
