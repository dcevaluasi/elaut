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
            className="h-10 px-5 gap-2 border-primary-200 bg-primary-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
        >
            <TbCertificate className="w-4 h-4" />
            Sertifikat
        </Button>
    );
};
