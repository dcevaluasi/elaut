'use client'

import ScrollDown from "@/components/scroll-down";
import Footer from "@/components/ui/footer";
import { devBaseUrl } from "@/constants/urls";
import useFetchAllPublication from "@/hooks/elaut/publication/useFetchAllPublication";
import { Publication } from "@/types/elaut";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaArrowRight } from "react-icons/fa6";
import { FiInfo } from "react-icons/fi";
import { MdOutlineCheckCircleOutline } from "react-icons/md";

function PublicationPage() {
    return (
        <>
            <HeroPublication />
            <ItemPublication />
            <Footer />
        </>
    );
}

function HeroPublication() {
    const [imageIndex, setImageIndex] = React.useState(0);
    const images = [
        "/images/hero-img6.jpg",
        "/images/hero-img6.jpg",
        "/images/hero-img6.jpg",
        "/images/hero-img6.jpg",
    ];

    React.useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative h-[70vh] m-4 rounded-3xl flex items-center justify-center">
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
                    <div className="text-center pb-12 md:pb-16 flex flex-col items-center justify-center ">
                        <h1
                            className="text-4xl md:text-[3.9rem] font-normal leading-tighter tracking-tighter mb-3 -mt-2 text-white font-calsans"
                        >
                            Publikasi dan Regulasi<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                                Pelatihan Kelautan dan Perikanan
                            </span>
                        </h1>
                        <div className="max-w-3xl mx-auto">
                            <p
                                className="text-lg text-gray-200 mb-8"
                            >
                                Menyajikan dokumen pendukung, peraturan teknis, serta publikasi resmi terkait pelatihan kelautan dan perikanan. Dirancang untuk membantu peserta, penyelenggara, dan pemangku kepentingan dalam memahami regulasi yang berlaku.
                            </p>
                            <div className="flex items-center justify-center w-full">
                                <ScrollDown />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ItemPublication() {
    const publications = [
        {
            icon: "/images/balai-pelatihan/keunggulan/ramah.png",
            heading: "Akses Dokumen Resmi",
            subheading:
                "Menyediakan kumpulan regulasi, pedoman teknis, dan dokumen pendukung pelatihan KP untuk dijadikan acuan oleh lembaga dan pelaksana pelatihan.",
        },
        {
            icon: "/images/balai-pelatihan/keunggulan/bersih.png",
            heading: "Transparansi dan Kepatuhan Regulasi",
            subheading:
                "Mendorong pelaksanaan pelatihan yang akuntabel dan sesuai dengan ketentuan perundangan melalui keterbukaan informasi peraturan yang berlaku.",
        },
        {
            icon: "/images/balai-pelatihan/keunggulan/komitmen.png",
            heading: "Sinergi Lembaga dan Mitra Pelatihan",
            subheading:
                "Membangun keselarasan antar lembaga penyelenggara pelatihan melalui referensi publikasi dan aturan yang seragam dan terstandarisasi.",
        },
        {
            icon: "/images/balai-pelatihan/keunggulan/terbaik.png",
            heading: "Peningkatan Kualitas Pelatihan",
            subheading:
                "Mendukung peningkatan mutu pelatihan melalui distribusi informasi dan pembaruan regulasi yang berkelanjutan serta berbasis kebutuhan lapangan.",
        },
    ];

    const { data: dataPublication, isFetching: isLoadingPublication } = useFetchAllPublication({
        search: '',
        doc_type: ''
    });

    console.log({ dataPublication })

    return (
        <section className="relative h-fit pb-10 mt-10" id="explore">
            <div className="max-w-3xl w-full mx-auto text-center pflex flex-col items-center justify-center pb-5 md:pb-8">
                <h1 className="text-4xl font-calsans leading-[100%]">
                    Explore Publikasi dan Regulasi
                    <br />
                    Dalam Pelatihan Kelautan dan Perikanan
                </h1>
                <p className="text-base text-gray-60">
                    Publikasi dan aturan menjadi landasan penting dalam mendukung efektivitas pelatihan di sektor kelautan dan perikanan. Melalui akses informasi yang jelas dan terstandarisasi, proses pelatihan dapat berlangsung lebih terarah, akuntabel, dan berkelanjutan bagi semua pihak yang terlibat.
                </p>
            </div>
            {
                isLoadingPublication ? <></> : <div className="grid grid-cols-3 gap-3 max-w-7xl mx-auto ">

                    {
                        dataPublication.map((publication: Publication, index: number) => (
                            <div className="bg-white shadow-custom flex items-center flex-col flex-1 rounded-md" key={index}>
                                <div className="flex flex-col items-center justify-center text-ceneter p-6 gap-5">
                                    <div className="flex flex-col gap-1 items-center justify-center text-center gap-3">
                                        <div className="flex flex-row items-center justify-center gap-1">
                                            <div className="bg-blue-500 text-white rounded-full py-1 px-3 flex items-center justify-center text-sm">
                                                <MdOutlineCheckCircleOutline /> {publication.doc_type}
                                            </div>
                                            <div className="bg-gray-300 text-black rounded-full py-1 px-3 flex items-center justify-center text-sm">
                                                <FiInfo /> Diakses 15,052
                                            </div>
                                        </div>
                                        <Link href={`/layanan/publikasi/${index}`} className='text-lg font-semibold leading-none'>
                                            {publication.pub_short_name}
                                        </Link>
                                        <p className="text-gray-600 font-normal text-base text-center">
                                            Dipublish pada {publication.created_at}
                                        </p>
                                    </div>
                                    <p className="text-gray-600 font-normal text-base text-center">
                                        {publication.description}
                                    </p>

                                </div>
                                <Link href={`/layanan/publikasi/${publication.slug}`} className="flex items-center justify-center font-semibold text-base border-t border-t-gray-500 w-full py-5">
                                    <span>Detail</span><FaArrowRight />
                                </Link>
                            </div>
                        ))
                    }
                </div>
            }

        </section>

    )
}

export default PublicationPage;
