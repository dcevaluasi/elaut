"use client";

import React, { forwardRef, useRef } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import './styles/certificate.css';
import { P2MKP } from "@/types/p2mkp";
import { ESELON_1 } from "@/constants/nomenclatures";

/**
 * QRCodeImage component that converts SVG QR Code to a PNG image for better print support.
 */
function QRCodeImage({ value }: { value: string }) {
    const [imgUrl, setImgUrl] = React.useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
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
        <div className="w-24 h-24 bg-white p-1">
            <div ref={wrapperRef} style={{ display: "none" }}>
                <QRCode value={value || "P2MKP-VALIDATION"} size={300} />
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
 * DialogSertifikatP2MKP component renders a professional certificate for P2MKP establishment.
 * It matches the design provided in the reference image and follows the styling conventions
 * of the training certificate (dialogSertifikatPelatihan.tsx).
 */
const DialogSertifikatP2MKP = forwardRef(
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
                className="w-full h-full flex items-center justify-center bg-gray-100 py-10 print:py-0 print:bg-white"
            >
                <div
                    ref={refPage}
                    className="pdf-page w-[1122.52px] h-[793.7px] bg-white relative overflow-hidden font-bos text-black p-0 m-0 box-border flex flex-col items-center justify-start scale-100 shadow-2xl print:shadow-none"
                >
                    {/* Background Decoration Elements (Waves as seen in the mockup) */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        {/* Top center faint glow for a premium feel */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl opacity-30"></div>

                        {/* Bottom Right Dynamic Waves */}
                        <div className="absolute bottom-0 right-0 w-[850px] h-[450px]">
                            {/* Accent Gold Stripe Wave */}
                            <svg className="absolute bottom-[-20px] right-[-20px] w-full h-[380px]" viewBox="0 0 800 380" preserveAspectRatio="none">
                                <path d="M800 380L0 380C250 360 550 250 800 0V380Z" fill="#E9C46A" />
                            </svg>
                            {/* Main Dark Blue Wave */}
                            <svg className="absolute bottom-[-20px] right-[-20px] w-full h-[350px]" viewBox="0 0 800 350" preserveAspectRatio="none">
                                <path d="M800 350L50 350C280 330 580 200 800 0V350Z" fill="#003566" />
                            </svg>
                            {/* Primary Blue Wave */}
                            <svg className="absolute bottom-[-20px] right-[-20px] w-full h-[320px]" viewBox="0 0 800 320" preserveAspectRatio="none">
                                <path d="M800 320L100 320C320 300 620 180 800 0V320Z" fill="#004391" />
                            </svg>
                        </div>

                        {/* Bottom Left Accent Shape */}
                        <div className="absolute bottom-0 left-0 w-[550px] h-[350px]">
                            <svg className="absolute bottom-[-20px] left-[-20px] w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="none">
                                <path d="M0 300H500C350 250 200 150 0 50V300Z" fill="#004391" />
                                <path d="M0 250H400C250 200 150 100 0 30V250Z" fill="#003566" opacity="0.3" />
                            </svg>
                        </div>
                    </div>

                    {/* Certificate Header Content */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center pt-12 box-border px-10">
                        {/* KKP Logo with Circular Frame */}
                        <div className="absolute top-12 left-16">
                            <div className="w-24 h-24 rounded-full border-[1.5px] border-[#004391] border-opacity-30 flex items-center justify-center bg-white shadow-sm overflow-hidden p-3 transition-transform hover:scale-105 duration-300">
                                <Image
                                    alt="Logo KKP"
                                    src="/logo-kkp-2.png"
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        {/* Institutional Header Text */}
                        <div className="text-center space-y-0.5 mt-2">
                            <h2 className="text-lg font-bosBold tracking-wide uppercase leading-tight">KEMENTERIAN KELAUTAN DAN PERIKANAN</h2>
                            <h2 className="text-lg font-bosBold tracking-wide uppercase leading-tight">BADAN PENYULUHAN DAN PENGEMBANGAN</h2>
                            <h2 className="text-lg font-bosBold tracking-wide uppercase leading-tight">SUMBER DAYA MANUSIA KELAUTAN DAN PERIKANAN</h2>
                        </div>

                        {/* Certificate Title */}
                        <div className="mt-16 mb-10">
                            <h1 className="text-[44px] font-bosBold text-[#004391] uppercase tracking-[0.1em] drop-shadow-sm leading-none">SERTIFIKAT PENETAPAN P2MKP</h1>
                        </div>

                        {/* Regulatory Basis & Description */}
                        <div className="px-36 text-center mb-10">
                            <p className="text-[17px] font-bosNormal leading-[150%] text-gray-800 text-center max-w-5xl mx-auto">
                                Berdasarkan Peraturan Peraturan Menteri Kelautan dan Perikanan Republik Indonesia Nomor 18 Tahun 2024 dan Keputusan Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan Nomor 393 Tahun 2025, Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan, menetapkan bahwa:
                            </p>
                        </div>

                        {/* P2MKP Detail Information Table */}
                        <div className="w-full px-40 flex flex-col gap-4 mb-12">
                            <div className="flex items-start">
                                <span className="w-[300px] font-bosBold text-[19px]">Nama Lembaga</span>
                                <span className="w-8 font-bosBold text-[19px]">:</span>
                                <span className="flex-1 font-bosBold text-[19px] uppercase tracking-tight text-[#222]">
                                    {p2mkp?.nama_Ppmkp || "KWT NGUDI MULYO"}
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[300px] font-bosBold text-[19px]">Pelatihan yang Diselenggarakan</span>
                                <span className="w-8 font-bosBold text-[19px]">:</span>
                                <span className="flex-1 font-bosNormal text-[19px] text-gray-800">
                                    {p2mkp?.bidang_pelatihan || "Pengolahan dan Pemasaran Hasil Perikanan (Lele)"}
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[300px] font-bosBold text-[19px]">Alamat</span>
                                <span className="w-8 font-bosBold text-[19px]">:</span>
                                <span className="flex-1 font-bosNormal text-[19px] leading-snug text-gray-800 text-justify">
                                    {alamatFull.includes('undefined') ? "Jalan Jongkangan, Dusun Jongkangan, RT/RW 01/01, Desa Tanjungsari, Kecamatan Banyudono, Kabupaten Boyolali, Provinsi Jawa Tengah 57373" : alamatFull}
                                </span>
                            </div>
                        </div>

                        {/* Designation Status Area */}
                        <div className="text-center flex flex-col items-center mt-4">
                            <p className="text-[18px] font-bosNormal italic mb-2 opacity-70">Sebagai</p>
                            <h3 className="text-[25px] font-bosBold text-[#333] mb-3 tracking-tight">Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)</h3>
                            <div className="bg-[#004391] bg-opacity-5 px-6 py-1 rounded-full">
                                <p className="text-[17px] font-bosNormal italic text-gray-700">
                                    Penetapan ini berlaku 2 (dua) tahun sejak tanggal ditetapkan
                                </p>
                            </div>
                        </div>

                        {/* Signature and Validation Footer Area */}
                        <div className="absolute bottom-16 left-0 w-full px-28 flex justify-between items-end">
                            {/* Validation QR Code */}
                            <div className="flex flex-col items-start translate-x-4">
                                <div className="bg-white p-2 shadow-lg border border-gray-100 rounded-sm">
                                    <QRCodeImage value={p2mkp?.nib || "P2MKP-VALIDATION"} />
                                </div>
                                <p className="text-[10px] font-bosNormal mt-2 opacity-40 uppercase tracking-widest text-[#004391]">P2MKP Validation System</p>
                            </div>

                            {/* Official Signatory Name and Title */}
                            <div className="text-center flex flex-col items-center mr-10">
                                <p className="text-[18px] font-bosNormal mb-1.5">Jakarta, {p2mkp?.tahun_penetapan || "6 November 2025"}</p>
                                <p className="text-[18px] font-bosBold mb-20 uppercase tracking-wide">Kepala Badan,</p>

                                <div className="flex flex-col items-center">
                                    <div className="font-bosBold text-[20px] leading-tight mb-0.5 text-[#111]">
                                        {ESELON_1.currentPerson}
                                    </div>
                                    <div className="w-[110%] h-[1.5px] bg-[#111] mt-1 shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

DialogSertifikatP2MKP.displayName = "DialogSertifikatP2MKP";

export default DialogSertifikatP2MKP;
