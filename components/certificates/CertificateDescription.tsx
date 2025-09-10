import { PelatihanMasyarakat } from "@/types/product";
import { generatedDescriptionCertificate } from "@/utils/certificates";
import { generateTanggalPelatihan } from "@/utils/text";
import { formatDateRange, formatDateRangeEnglish } from "@/utils/time";
import React from "react";

interface CertificateDescriptionProps {
    pelatihan: PelatihanMasyarakat
}

const CertificateDescription: React.FC<CertificateDescriptionProps> = ({
    pelatihan
}) => {
    const { desc_indo, desc_eng } = generatedDescriptionCertificate(pelatihan?.DeskripsiSertifikat!);

    const tglMulai = generateTanggalPelatihan(pelatihan?.TanggalMulaiPelatihan!);
    const tglAkhir = generateTanggalPelatihan(pelatihan?.TanggalBerakhirPelatihan!);

    return (
        <div className="flex w-full flex-col space-y-0 max-w-7xl mx-auto items-start text-sm -mt-2 text-center font-bos h-fit">
            {/* Indonesian description */}
            <span className="text-base leading-[115%] font-bosNormal max-w-6xl">
                {desc_indo}, pada tanggal {formatDateRange(tglMulai, tglAkhir)}
            </span>

            {/* English description (if exists) */}
            {desc_eng !== "" && (
                <span className="max-w-5xl mt-1 leading-none font-bos italic text-[0.85rem] mx-auto">
                    {desc_eng} on {formatDateRangeEnglish(tglMulai, tglAkhir)}
                </span>
            )}
        </div>
    );
};

export default CertificateDescription;
