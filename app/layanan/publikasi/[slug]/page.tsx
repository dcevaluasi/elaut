'use client'

import ScrollDown from "@/components/scroll-down";
import Footer from "@/components/ui/footer";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaArrowRight } from "react-icons/fa6";
import { FiInfo } from "react-icons/fi";
import { MdOutlineCheckCircleOutline } from "react-icons/md";
import { TbDownload } from "react-icons/tb";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

function DetailPublicationPage() {
    return (
        <>
            <HeroDetailPublication />
            <DetailPublication />
            <Footer />
        </>
    );
}

function HeroDetailPublication() {
    const [imageIndex, setImageIndex] = React.useState(0);
    const images = [
        "/images/hero-img7.jpg",
        "/images/hero-img7.jpg",
        "/images/hero-img7.jpg",
        "/images/hero-img7.jpg",
    ];

    React.useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative h-[45vh] m-4 rounded-3xl flex items-center justify-center">
            <Image
                src={images[imageIndex]}
                className="absolute w-full h-full object-cover rounded-3xl duration-1000  "
                alt=""
                layout="fill"
                priority
            />

            <div className="absolute w-full h-full rounded-3xl bg-black bg-opacity-70  "></div>

            <div
                className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none -z-1"
                aria-hidden="true"
            >
                <svg
                    width="1360"
                    height="578"
                    viewBox="0 0 1360 578"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient
                            x1="50%"
                            y1="0%"
                            x2="50%"
                            y2="100%"
                            id="illustration-01"
                        >
                            <stop stopColor="#FFF" offset="0%" />
                            <stop stopColor="#EAEAEA" offset="77.402%" />
                            <stop stopColor="#DFDFDF" offset="100%" />
                        </linearGradient>
                    </defs>
                    <g fill="url(#illustration-01)" fillRule="evenodd">
                        <circle cx="1232" cy="128" r="128" />
                        <circle cx="155" cy="443" r="64" />
                    </g>
                </svg>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 z-[40]">
                <div className="pt-32 pb-12 md:pt-40 md:pb-20">
                    <div className="text-center pb-12 md:pb-16 flex flex-col items-center justify-center gap-5 ">
                        <h1
                            className="text-4xl md:text-[2.4rem] font-normal leading-none tracking-tighter mb-3 -mt-2 text-white font-calsans text-left"
                        >
                            Keputusan Menteri Perdagangan Republik Indonesia Nomor 1438 Tahun 2025 tentang Harga Patokan Ekspor Atas Produk Pertambangan Yang Dikenakan Bea Keluar
                        </h1>

                        <div className="flex flex-row items-start w-full justify-start gap-1">
                            <div className="bg-blue-500 text-white rounded-full p-3 px-10 flex items-center justify-center text-base">
                                <TbDownload />
                                Unduh [ID]
                            </div>
                            <div className="bg-gray-300 text-black rounded-full py-3 px-10 flex items-center justify-center text-base">
                                <FiInfo /> Diakses 15,052
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function DetailPublication() {
    return (
        <section className="relative h-fit pb-10 mt-5" id="explore">
            <div className="max-w-7xl flex gap-5 mx-auto z-[40] ">
                <div className="bg-white shadow-custom flex items-center flex-col w-[30%] flex-1 rounded-md">
                    <div className="max-w-xl mx-auto p-6 rounded-md overflow-hidden">
                        <table className="w-full text-left text-base">
                            <thead className="bg-neutral-900 text-white">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Meta</th>
                                    <th className="px-4 py-2 font-medium">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-2 font-semibold">Tipe Dokumen</td>
                                    <td className="px-4 py-2">Peraturan Perundang-undangan</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-semibold">Judul</td>
                                    <td className="px-4 py-2">
                                        Keputusan Menteri Perdagangan Republik Indonesia Nomor 1438 Tahun
                                        2025 tentang Harga Patokan Ekspor Atas Produk Pertambangan Yang
                                        Dikenakan Bea Keluar
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-semibold">Sumber</td>
                                    <td className="px-4 py-2">
                                        -
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-semibold">Subjek</td>
                                    <td className="px-4 py-2">
                                        HPE, Ekspor, Produk Pertambangan
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-semibold">Bahasa</td>
                                    <td className="px-4 py-2">
                                        Indonesia
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white shadow-custom flex items-center flex-col flex-1 w-[70%] rounded-md">
                    <div className="flex flex-col items-center justify-center text-ceneter p-6 gap-5">
                        <div className="flex flex-col gap-1 items-center justify-center text-center gap-3">
                            <div className="flex flex-row items-center justify-center gap-1">
                                <div className="bg-blue-500 text-white rounded-full p-1 flex items-center justify-center text-sm">
                                    <MdOutlineCheckCircleOutline /> Peraturan
                                </div>
                                <div className="bg-gray-300 text-black rounded-full py-1 px-3 flex items-center justify-center text-sm">
                                    <MdOutlineCheckCircleOutline /> Diakses 15,052
                                </div>
                            </div>
                            <Link href={`/layanan/publikasi`} className='text-lg font-semibold leading-none'>
                                Keputusan Menteri Nomor 591 Tahun 2025
                            </Link>
                            <p className="text-gray-600 font-normal text-base text-center">
                                Dipublish pada Mei 2025
                            </p>
                        </div>
                        <PDFViewerPublication />

                    </div>

                </div>
            </div>
        </section>

    )
}

function PDFViewerPublication() {

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-4">
            {/* Top actions */}
            <div className="flex items-center justify-between mb-4">
                <a
                    href="https://eskripsi.usm.ac.id/files/skripsi/B11A/2020/B.111.20.0056/B.111.20.0056-15-File-Komplit-20240229022709.pdf"
                    download
                    className="inline-flex items-center border-2 border-blue-500 text-blue-500 px-4 py-1.5 rounded hover:bg-blue-50 transition"
                >
                    📄 Unduh Peraturan [ID]
                </a>
                <div className="flex gap-4 text-sm items-center text-gray-600">
                    <div className="flex items-center gap-1">
                        ⬇️ <span>36</span>
                    </div>
                    <div className="flex items-center gap-1">
                        👁️ <span>2,283</span>
                    </div>
                </div>
            </div>

            {/* PDF viewer */}
            <div className="border border-gray-200 rounded overflow-hidden">
                <PdfViewer url={"https://eskripsi.usm.ac.id/files/skripsi/B11A/2020/B.111.20.0056/B.111.20.0056-15-File-Komplit-20240229022709.pdf"} />
            </div>
        </div>
    );
};

const PdfViewer = ({ url }: { url: string }) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    return (
        <div className="h-screen w-screen">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                    fileUrl={url}
                    plugins={[defaultLayoutPluginInstance]}
                />
            </Worker>
        </div>
    );
};

export default DetailPublicationPage;
