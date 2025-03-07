import Image from 'next/image';
import Link from 'next/link';
import { verifyPDFBSrEUrl } from '@/constants/urls';
import { FaRegCircleQuestion } from 'react-icons/fa6';
import React from 'react';

const CertificateCheckFeature = () => {
    const certificates: Record<string, any>[] = [
        {
            title: 'Cek Sertifikat di E-LAUT',
            description: 'Melihat Validitas Sertifikat-mu dan Keikutsertaanmu di Aplikasi E-LAUT',
            imageSrc: '/icons/icvalidity.png',
            link: null,
        },
        {
            title: 'Cek Sertifikat di BSrE',
            description: 'Melihat Validitas Sertifikat dan Penandatanganan Secara Elektronik',
            imageSrc: '/icons/icbsre.png',
            link: verifyPDFBSrEUrl,
        },
    ];

    const [selectedCertificatesFeature, setSelectedCertificateFeature] = React.useState<string>('')

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
                        <div className="flex flex-col gap-2 hover:cursor-pointer hover:scale-95 duration-700 items-center justify-center w-80 bg-white rounded-3xl p-10 relative">
                            <span onClick={() => setSelectedCertificateFeature(title)} className='absolute top-5 right-5 rounded-full w-7 h-7 p-1 text-grayUsual border border-grayUsual flex items-center justify-center text-lg z-[999999]' title={'Info ' + title}>
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
        </div>
    );
};

export default CertificateCheckFeature;
