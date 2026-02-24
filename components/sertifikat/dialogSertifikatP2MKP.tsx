"use client";

import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect, useMemo } from "react";
import QRCode from "react-qr-code";
import './styles/certificate.css';
import { P2MKP, PengajuanPenetapanP2MKP } from "@/types/p2mkp";
import { ESELON_1 } from "@/constants/nomenclatures";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";

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
                    canvas.width = 200;
                    canvas.height = 200;
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
        <div className="w-[6cqw] h-[6cqw] min-w-[40px] min-h-[40px]">
            <div ref={wrapperRef} style={{ display: "none" }}>
                <QRCode value={`https://elaut-bppsdm.kkp.go.id/layanan/cek-sertifikat/p2mkp/penetapan/${value}`} size={200} />
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

const FormatSertifikatP2MKP = forwardRef(
    ({ p2mkp, penetapan, idPenetapan, refPage }: { p2mkp: P2MKP; penetapan?: PengajuanPenetapanP2MKP; idPenetapan: string; refPage?: any }, ref: any) => {
        const { data: rumpunList } = useFetchDataRumpunPelatihan();

        const bidangPelatihanComputed = useMemo(() => {
            const val = p2mkp?.bidang_pelatihan || p2mkp?.jenis_bidang_pelatihan;
            if (!val) return "-";

            const matched = rumpunList.find(r =>
                String(r.id_rumpun_pelatihan) === String(val) ||
                r.name === val ||
                r.nama_rumpun_pelatihan === val
            );

            return matched?.nama_rumpun_pelatihan || matched?.name || val;
        }, [rumpunList, p2mkp]);

        const alamatParts = [
            p2mkp?.alamat,
            p2mkp?.kelurahan,
            p2mkp?.kecamatan,
            p2mkp?.kota,
            p2mkp?.provinsi,
            p2mkp?.kode_pos
        ].filter(part => part && String(part).trim() !== "" && String(part).toLowerCase() !== "undefined");

        const alamatFull = alamatParts.join(", ").toUpperCase();

        return (
            <div
                ref={ref}
                className="w-full h-full flex flex-col items-center justify-center font-bos leading-[115%]"
            >
                <div
                    ref={refPage}
                    style={{ width: '297mm', height: '210mm', minWidth: '297mm', minHeight: '210mm' }}
                    className="pdf-page bg-white  flex flex-col relative items-center justify-center mx-auto overflow-hidden p-[15mm]"
                >
                    {/* Top Right Reference Number */}
                    <div className="absolute top-[5mm] right-[15mm] text-right">
                        <p className="text-[13px] font-bosBold uppercase tracking-tight">
                            No. Penetapan : {penetapan?.nomor_sertifikat || "-"}
                        </p>
                    </div>

                    <div className="w-full scale-[1.03] -mt-7 flex-0 gap-0 flex flex-col justify-between py-2 space-y-0">
                        {/* Header Section */}
                        <div className="space-y-0 leading-none py-0 gap-0">
                            <div className="flex flex-col items-center justify-center">
                                <h1 className="text-sm font-bosBold  leading-none text-center tracking-tight">
                                    KEMENTERIAN KELAUTAN DAN PERIKANAN
                                </h1>
                                <p className="text-xs text-gray-700 font-bosItalic text-center">
                                    MINISTRY OF MARINE AFFAIRS AND FISHERIES
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center space-y-0 leading-none -mt-6">
                                <h1 className="text-sm font-bosBold text-center px-10 leading-none">
                                    BADAN PENYULUHAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA KELAUTAN
                                    DAN PERIKANAN
                                </h1>
                                <p className="text-xs text-gray-700 font-bosItalic text-center px-20 ">
                                    THE AGENCY FOR MARINE AND FISHERIES EXTENSION AND HUMAN
                                    RESOURCES DEVELOPMENT
                                </p>
                            </div>
                        </div>

                        {/* Certificate Title */}
                        <div className="flex flex-col pb-5 items-center justify-center space-y-0">
                            <h1 className="text-2xl font-bosBold  leading-none text-[#001d3d]">
                                SERTIFIKAT PENETAPAN
                            </h1>
                            <p className="text-sm font-bosItalic text-gray-700">Certificate of Designation</p>
                        </div>

                        {/* Statement Paragraph */}
                        <div className="flex w-full py-0 flex-col mt-10 space-y-1 max-w-[240mm] h-[20mm]  mx-auto items-center text-center font-bos">
                            <span className="text-sm -mt-5 leading-none font-bosNormal">
                                Berdasarkan Peraturan Menteri Kelautan dan Perikanan Nomor 18 Tahun 2024 tentang Pusat Pelatihan Mandiri Kelautan dan Perikanan dan Keputusan Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan Nomor 393 Tahun 2025 tentang Penetapan Pusat Pelatihan Mandiri Kelautan dan Perikanan, menyatakan bahwa:
                            </span>
                            <span className="text-xs text-gray-700 font-bosItalic leading-none">
                                Based on Regulation of the Minister of Marine Affairs and Fisheries Number 18 of 2024 concerning Independent Marine and Fisheries Training Centers and Decree of the Head of the Agency for Extension and Human Resource Development in Marine Affairs and Fisheries Number 393 of 2025 concerning the Establishment of Independent Marine and Fisheries Training Centers, it is stated that:                            </span>
                        </div>

                        {/* Institutional Details Table */}
                        <div className="w-full px-24 py-0  -mb-20">
                            <table className="w-full border-collapse" cellPadding={0} cellSpacing={0}>
                                <tbody>
                                    <tr className="mb-4">
                                        <td className="w-[28%] align-top py-1">
                                            <span className="font-bosBold text-sm uppercase block">Nama Lembaga</span>
                                            <span className="font-bos italic text-[10px] text-gray-700 block -mt-1 leading-tight">Institution Name</span>
                                        </td>
                                        <td className="w-[3%] align-top py-1 text-md font-bosBold text-blue-900">:</td>
                                        <td className="w-[69%] align-top py-1 text-md font-bosBold uppercase text-blue-900 leading-tight">
                                            {p2mkp?.nama_Ppmkp || p2mkp?.nama_ppmkp || "-"}
                                        </td>
                                    </tr>
                                    <tr className="mb-4">
                                        <td className="w-[28%] align-top py-1">
                                            <span className="font-bosBold text-sm uppercase block">Jenis Pelatihan</span>
                                            <span className="font-bos italic text-[10px] text-gray-700 block -mt-1 leading-tight">Training Category</span>
                                        </td>
                                        <td className="w-[3%] align-top py-1 text-md font-bosBold">:</td>
                                        <td className="w-[69%] align-top py-1 text-md font-bosBold uppercase leading-tight">
                                            {p2mkp?.jenis_pelatihan}
                                        </td>
                                    </tr>
                                    <tr className="mb-4">
                                        <td className="w-[28%] align-top py-1">
                                            <span className="font-bosBold text-sm uppercase block">Alamat</span>
                                            <span className="font-bos italic text-[10px] text-gray-700 block -mt-1 leading-tight">Address</span>
                                        </td>
                                        <td className="w-[3%] align-top py-1 text-md font-bosBold">:</td>
                                        <td className="w-[69%] align-top py-1 text-md font-bosBold uppercase leading-tight">
                                            {alamatFull || "-"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Validity Footer Text */}
                        <div className="text-center leading-none flex flex-col items-center space-y-2 -mt-20">
                            <p className="text-sm font-bosNormal leading-none italic text-gray-700">Sebagai / <span className="italic">As</span></p>
                            <h3 className="text-2xl font-bosBold leading-none text-[#003566]  uppercase">
                                Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)
                            </h3>
                            <p className="text-sm font-bosNormal leading-none text-gray-700 max-w-[200mm]">
                                Penetapan ini berlaku selama 2 (dua) tahun terhitung sejak ditetapkan.
                                <br />
                                <span className="text-xs opacity-70 text-gray-700 font-bosItalic">This assignment is valid for 2 (two) years from the date of establishment.</span>
                            </p>
                        </div>

                        {/* Signature & QR Section */}
                        <div className="flex flex-row items-end justify-center px-20 -mt-20 w-full h-[50mm] relative">
                            <div className="shrink-0 absolute left-20 bottom-5 mb-6 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <QRCodeImage value={String(idPenetapan || "")} />
                            </div>

                            <div className="flex flex-col items-center text-center  max-w-[450px]">
                                <p className="text-sm font-bosNormal">Jakarta, {penetapan?.tanggal_sertifikat}</p>
                                <div className="space-y-1">
                                    <p className="text-sm font-bosBold uppercase leading-none text-slate-900">
                                        Kepala Badan Penyuluhan dan Pengembangan
                                    </p>
                                    <p className="text-sm font-bosBold uppercase leading-none text-slate-900">
                                        Sumber Daya Manusia Kelautan dan Perikanan,
                                    </p>
                                    <p className="text-xs font-bosItalic text-gray-700 italic mt-1 leading-none px-4">
                                        Director General of The Agency for Marine and Fisheries Extension <br />
                                        and Human Resources Development
                                    </p>
                                </div>

                                <div className="flex flex-col items-center mt-16">
                                    <p className="text-sm font-bosBold px-8 mb-2  tracking-tight">
                                        Dr. I NYOMAN RADIARTA, S.Pi., M.Sc.
                                    </p>
                                    <p className="text-sm font-bosNormal -mt-3">NIP. {ESELON_1.nip}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

FormatSertifikatP2MKP.displayName = "FormatSertifikatP2MKP";

export type DialogSertifikatP2MKPHandle = {
    uploadPdf: () => Promise<void>;
    downloadPdf: () => Promise<void>;
};

const DialogSertifikatP2MKP = forwardRef<DialogSertifikatP2MKPHandle, { p2mkp: P2MKP; penetapan?: PengajuanPenetapanP2MKP; idPenetapan: string }>(
    ({ p2mkp, penetapan, idPenetapan }, ref) => {
        const certificateRef = useRef<HTMLDivElement>(null);
        const certificatePageRef = useRef<HTMLDivElement>(null);
        let html2pdfInstance: any = null;

        const downloadPdf = async () => {
            if (!p2mkp) return;
            try {
                if (!html2pdfInstance) {
                    html2pdfInstance = (await import("html2pdf.js")).default;
                }

                const element = certificatePageRef.current; // Target the exact mm-sized container
                if (!element) return;

                const name = p2mkp.nama_Ppmkp || p2mkp.nama_ppmkp || "Sertifikat";
                const opt = {
                    margin: 0,
                    filename: `Sertifikat_P2MKP_${name.replace(/\s+/g, '_')}.pdf`,
                    image: { type: 'jpeg', quality: 1.0 },
                    html2canvas: {
                        scale: 4, // Higher scale for better quality
                        useCORS: true,
                        logging: false,
                        letterRendering: true,
                        backgroundColor: "#ffffff",
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'landscape',
                        compress: true
                    }
                };
                await html2pdfInstance().from(element).set(opt).save();
            } catch (err) {
                console.error("Failed to download PDF:", err);
            }
        };

        const uploadPdf = async () => {
            console.log("Upload logic not implemented.");
        };

        useImperativeHandle(ref, () => ({ downloadPdf, uploadPdf }), [p2mkp, idPenetapan]);

        return (
            <div className="max-h-[800px] scale-95 bg-white flex flex-col gap-2 overflow-y-auto scroll-smooth no-scrollbar py-10">
                <FormatSertifikatP2MKP
                    p2mkp={p2mkp}
                    penetapan={penetapan}
                    idPenetapan={idPenetapan}
                    ref={certificateRef}
                    refPage={certificatePageRef}
                />
            </div>
        );
    }
);

DialogSertifikatP2MKP.displayName = "DialogSertifikatP2MKP";

export default DialogSertifikatP2MKP;
