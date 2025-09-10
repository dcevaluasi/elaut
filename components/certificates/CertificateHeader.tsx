import { isEnglishFormat } from "@/utils/certificates";
import React from "react";

interface CertificateHeaderProps {
    deskripsi?: string;
}

const CertificateHeader: React.FC<CertificateHeaderProps> = ({
    deskripsi,
}) => {
    const english = isEnglishFormat(deskripsi!);

    return (
        <>
            <div className="flex flex-col space-y-0 w-full h-fit items-center justify-center -mt-3">
                {/* Kementerian */}
                <div className="flex flex-col h-fit items-center justify-center space-y-0">
                    <h1
                        className={`${english ? "text-base" : "text-lg"
                            } font-bosBold font-bold`}
                    >
                        KEMENTERIAN KELAUTAN DAN PERIKANAN
                    </h1>
                    {english && (
                        <p className="text-base font-bosItalic">
                            MINISTRY OF MARINE AFFAIRS AND FISHERIES
                        </p>
                    )}
                </div>

                {/* Badan */}
                <div className="flex flex-col h-fit items-center text-center justify-center space-y-0">
                    <h1
                        className={`${english ? "text-lg" : "text-xl"
                            } font-bosBold font-bold`}
                    >
                        BADAN PENYULUHAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA KELAUTAN DAN
                        PERIKANAN
                    </h1>
                    {english && (
                        <p className="text-sm font-bosItalic">
                            THE AGENCY FOR MARINE AND FISHERIES EXTENSION AND HUMAN RESOURCES
                            DEVELOPMENT
                        </p>
                    )}
                </div>

                {/* Sertifikat */}
                <div className="flex flex-col h-fit items-center justify-center space-y-1">
                    <h1
                        className={`${english ? "text-3xl" : "text-4xl"
                            } font-bosBold font-black leading-none`}
                    >
                        SERTIFIKAT
                    </h1>
                    {english && (
                        <p className="text-lg font-bosItalic">CERTIFICATE</p>
                    )}
                </div>
            </div>

            {/* Preambule */}
            <div className={`flex w-full flex-col space-y-0 max-w-5xl mx-auto items-start ${english ? "text-base" : "text-lg"
                } text-center font-bos h-fit mt-2`}>
                <span className="text-base leading-none font-bosNormal">
                    Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan berdasarkan Peraturan Pemerintah Nomor.62 Tahun 2014 tentang Penyelenggaraan Pendidikan, Pelatihan dan Penyuluhan Perikanan, serta ketentuan pelaksanaannya menyatakan bahwa :
                </span>
                {
                    isEnglishFormat(deskripsi!) && <span className="max-w-4xl leading-none font-bosItalic text-[0.85rem] mx-auto">
                        The Agency for Marine and Fisheries Extension and Human
                        Resources Development based on Government Regulation Number 62
                        of 2014 concerning the Implementation of Fisheries Education,
                        Training and Extension as well as its implementing provisions
                        States that :
                    </span>
                }
            </div></>

    );
};

export default CertificateHeader;
