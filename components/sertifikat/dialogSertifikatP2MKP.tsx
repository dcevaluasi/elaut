"use client";

import React, { forwardRef, useRef, useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import './styles/certificate.css';
import { P2MKP } from "@/types/p2mkp";
import { ESELON_1 } from "@/constants/nomenclatures";

function QRCodeImage({ value }: { value: string }) {
    const [imgUrl, setImgUrl] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wrapperRef.current) {
            const svg = wrapperRef.current.querySelector("svg");
            if (svg) {
                const serialized = new XMLSerializer().serializeToString(svg);
                const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
                const url = URL.createObjectURL(svgBlob);

                const img = document.createElement("img");
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 300;
                    canvas.height = 300;
                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0);
                    setImgUrl(canvas.toDataURL("image/png"));
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            }
        }
    }, [value]);

    return (
        <div className="w-[8cqw] h-[8cqw] min-w-[60px] min-h-[60px]">
            <div ref={wrapperRef} style={{ display: "none" }}>
                <QRCode value={value || "P2MKP-DEMO"} size={300} />
            </div>
            {imgUrl && (
                <img
                    src={imgUrl}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                />
            )}
        </div>
    );
}

/**
 * SertifikatP2MKP component renders a professional certificate for P2MKP establishment.
 * Designed to be highly responsive while maintaining A4 Landscape ratio.
 * It uses container queries (via cqw) or viewport units to ensure it "fits to window" nicely.
 */
const SertifikatP2MKP = forwardRef(
    (
        {
            p2mkp,
            isPrint,
            refPage,
        }: {
            p2mkp: P2MKP;
            isPrint?: boolean;
            refPage?: any;
        },
        ref: any
    ) => {
        // Construct full address from P2MKP data fields
        const alamatFull = `${p2mkp?.alamat}, ${p2mkp?.kelurahan}, ${p2mkp?.kecamatan}, ${p2mkp?.kota}, ${p2mkp?.provinsi} ${p2mkp?.kode_pos}`;

        return (
            <div
                ref={ref}
                className="w-full min-h-screen flex flex-col items-center justify-start md:justify-center bg-gray-50 dark:bg-slate-950 p-4 md:p-8 lg:p-12 py-10 print:p-0 print:bg-white overflow-y-auto scrollbar-hide"
            >
                {/* 
                    The container below uses 'aspect-[297/210]' to maintain A4 Landscape.
                    We set a max-width to not exceed real A4 resolution at 100% scale,
                    but 'w-full' lets it shrink for smaller windows.
                */}
                <div
                    ref={refPage}
                    className="relative bg-white shadow-2xl text-black flex flex-col items-center justify-start overflow-visible print:shadow-none w-full max-w-[1122px] mx-auto certificate-container print:w-[1122px] print:h-[793px]"
                    style={{
                        aspectRatio: "297 / 210",
                        containerType: "size"
                    }}
                >
                    {/* Background Decoration Elements */}


                    {/* Certificate Content - All sizes are relative to the container width (cqw) */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center pt-[5cqh] box-border px-[8cqw]">

                        {/* Top Right Certificate Number */}
                        <div className="absolute top-[2cqh] right-[3cqw] flex flex-col items-end z-20">
                            <p className="text-sm font-bosNormal text-gray-800">
                                No. Penetapan : {String(p2mkp?.IdPpmkp || 0).padStart(3, '0')}.P2MKP.01.{["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][new Date().getMonth()]}.{p2mkp?.tahun_penetapan || new Date().getFullYear()}
                            </p>
                        </div>

                        {/* Header Group */}
                        <div className="w-full flex flex-col items-center mb-2">
                            {/* Logo */}
                            <div className="mb-[1.5cqh] flex justify-center">
                                <div className="w-[6.5cqw] h-[6.5cqw] min-w-[45px] min-h-[45px] rounded-full border-[0.1cqw] border-[#004391]/20 flex items-center justify-center bg-white shadow-sm overflow-hidden p-[0.8cqw] relative z-10">
                                    <Image
                                        alt="Logo KKP"
                                        src="/logo-kkp-2.png"
                                        width={100}
                                        height={100}
                                        className="object-contain w-full h-full"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Institutional Header Text */}
                            <div className="text-center space-y-[0.2cqh]">
                                <h2 className="text-md font-bosBold uppercase leading-none text-gray-900">KEMENTERIAN KELAUTAN DAN PERIKANAN</h2>
                                <h2 className="text-md font-bosBold uppercase leading-none text-gray-900">BADAN PENYULUHAN DAN PENGEMBANGAN</h2>
                                <h2 className="text-md font-bosBold uppercase leading-none text-gray-900">SUMBER DAYA MANUSIA KELAUTAN DAN PERIKANAN</h2>
                            </div>
                        </div>

                        {/* Certificate Title */}
                        <div className="relative w-full text-center mb-2">
                            <h1 className="text-3xl font-bosBold text-[#004391] uppercase  drop-shadow-sm leading-none relative z-10 inline-block pb-[0.6cqh] border-b-[0.25cqh] border-[#E9C46A]">
                                SERTIFIKAT PENETAPAN
                            </h1>
                        </div>

                        {/* Regulatory Basis & Description */}
                        <div className="text-center mb-[2cqh] w-[85%] mx-auto">
                            <p className="text-[11px] font-bosNormal leading-[1.6] tracking-none text-gray-800 text-center">
                                Berdasarkan Peraaturan Menteri Kelautan dan Perikanan Nomor 18 Tahun 2024 tentang Pusat Pelatihan Mandiri Kelautan dan Perikanan dan
                                Keputusan Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan Nomor 393 Tahun 2025 tentang Penetapan Pusat Pelatihan Mandiri Kelautan dan Perikanan, dengan ini Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan menetapkan:
                            </p>
                        </div>

                        {/* P2MKP Detail Information Table */}
                        <div className="w-full flex justify-center mb-[2cqh]">
                            <div className="w-full flex flex-col gap-[0.8cqh] p-[2cqw] rounded-[1cqw] bg-white/60 border border-gray-100 shadow-sm backdrop-blur-sm">
                                <div className="flex items-start">
                                    <span className="w-[30%] font-bosBold text-[1.1cqw] text-[#003566]">NAMA LEMBAGA</span>
                                    <span className="w-[4%] font-bosBold text-[1.1cqw] text-gray-500 text-center">:</span>
                                    <span className="flex-1 font-bosBold text-[1.4cqw] uppercase tracking-wide text-black leading-none pt-[0.2cqh]">
                                        {p2mkp?.nama_Ppmkp || "KWT NGUDI MULYO"}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-[30%] font-bosBold text-[1.1cqw] text-[#003566]">PELATIHAN YANG DISELENGGARAKAN</span>
                                    <span className="w-[4%] font-bosBold text-[1.1cqw] text-gray-500 text-center">:</span>
                                    <span className="flex-1 font-bosNormal text-[1.1cqw] text-gray-800 leading-tight pt-[0.2cqh]">
                                        {p2mkp?.bidang_pelatihan || "Pengolahan dan Pemasaran Hasil Perikanan (Lele)"}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-[30%] font-bosBold text-[1.1cqw] text-[#003566]">ALAMAT</span>
                                    <span className="w-[4%] font-bosBold text-[1.1cqw] text-gray-500 text-center">:</span>
                                    <span className="flex-1 font-bosNormal text-[1.1cqw] leading-[1.4] text-gray-800 text-justify pt-[0.2cqh]">
                                        {alamatFull.includes('undefined') ? "Jalan Jongkangan, Dusun Jongkangan, RT/RW 01/01, Desa Tanjungsari, Kecamatan Banyudono, Kabupaten Boyolali, Provinsi Jawa Tengah 57373" : alamatFull}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Designation Status Area */}
                        <div className="text-center flex flex-col items-center relative z-10 w-full">
                            <p className="text-[1cqw] font-bosNormal italic text-gray-500">Sebagai</p>
                            <h3 className="text-[1.8cqw] font-bosBold text-[#003566] mb-[0.5cqh] tracking-tight uppercase drop-shadow-sm">
                                Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)
                            </h3>


                            <p className="text-[0.95cqw] font-bosNormal italic text-gray-500 bg-white/80 px-[1cqw] py-[0.3cqh] rounded-full border border-gray-100 shadow-sm">
                                Berlaku selama 2 (dua) tahun sejak tanggal ditetapkan
                            </p>
                        </div>

                        {/* Bottom Decoration & QR Section */}
                        <div className="absolute bottom-[18cqh] left-[8cqw] z-20">
                            <QRCodeImage value={`https://elaut-bppsdm.kkp.go.id/layanan/cek-p2mkp/${p2mkp?.IdPpmkp}`} />

                        </div>

                        {/* Signature Area */}
                        <div className="absolute bottom-[8cqh] right-0 left-0 flex flex-col items-center z-20 min-w-[20cqw]">
                            <p className="text-[1.1cqw] font-bosNormal">Jakarta, {p2mkp?.tahun_penetapan || "6 November 2025"}</p>
                            <p className="text-[1.1cqw] font-bosBold mb-[7cqh] uppercase  text-center tracking-wide text-gray-900 leading-tight">Kepala Badan Penyuluhan dan Pengembangan<br /> Sumber Daya Manusia Kelautan dan Perikanan,</p>

                            <div className="flex flex-col items-center relative w-full">
                                <div className="font-bosBold text-[1.4cqw] leading-tight mb-[0.4cqh] text-black border-b-[0.15cqw] border-black pb-[0.4cqh] px-[2cqw] whitespace-nowrap">
                                    {ESELON_1.currentPerson}
                                </div>
                                <p className="text-[1.1cqw] font-bosNormal mt-[0.8cqh] text-gray-800">NIP. {ESELON_1.nip}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

SertifikatP2MKP.displayName = "SertifikatP2MKP";

export default SertifikatP2MKP;
