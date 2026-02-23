"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { P2MKP } from "@/types/p2mkp";
import { TbCertificate } from "react-icons/tb";
import { useParams, useRouter } from "next/navigation";

/**
 * P2MKPCertificateAction handles the navigation to the dedicated P2MKP certificate preview page.
 */
export const P2MKPCertificateAction = ({ p2mkp }: { p2mkp: P2MKP }) => {
    const router = useRouter();
    const params = useParams();
    const random_id = params.random_id;
    const role = params.role;

    const handleNavigate = () => {
        const idPenetapan = (p2mkp as any).IdPengajuanPenetapanPpmkp;
        const idPpmkp = p2mkp.IdPpmkp || (p2mkp as any).id_Ppmkp;
        router.push(`/${random_id}/${role}/p2mkp/penetapan/sertifikat/${idPenetapan}?id_ppmkp=${idPpmkp}`);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleNavigate}
            className="group/btn relative w-full text-center overflow-hidden flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-bold shadow-md hover:shadow-lg transition-all"
        >
            <TbCertificate className="w-4 h-4" />
            SERTIFIKAT PENETAPAN
        </Button>
    );
};
