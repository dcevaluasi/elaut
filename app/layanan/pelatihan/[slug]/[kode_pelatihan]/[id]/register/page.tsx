"use client";

import Image from "next/image";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";

import {
    DetailPelatihanMasyarakat,
    PelatihanMasyarakat,
} from "@/types/product";
import {
    convertDate,
    extractLastSegment,
    extractSecondLastSegment,
} from "@/utils";
import Toast from "@/components/toast";
import { decryptValue } from "@/lib/utils";
import { elautBaseUrl } from "@/constants/urls";
import { HashLoader } from "react-spinners";
import Footer from "@/components/ui/footer";
import DetailRegistrasiPelatihan from "@/components/elaut/DetailRegistrasiPelatihan";

function Page() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const pathname = usePathname();
    const id = decryptValue(extractSecondLastSegment(pathname));

    const [data, setData] = React.useState<DetailPelatihanMasyarakat | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);

    const [isRegistrasi, setIsRegistrasi] = React.useState(false);
    const [isOpenRegistrationCommand, setIsOpenRegistrationCommand] =
        React.useState(false);

    const jenisProgram = Cookies.get("JenisProgram");
    const [dataRelated, setDataRelated] = React.useState<PelatihanMasyarakat[]>([]);

    const handleFetchingPublicTrainingDataById = async () => {
        try {
            const response: AxiosResponse = await axios.get(
                `${baseUrl}/getPelatihanUser?idPelatihan=${id}`
            );
            setLoading(false);
            setData(response.data);
        } catch (error) {
            setLoading(false);
            console.error("Error fetching detail:", error);
        }
    };

    const handleFetchingPublicTrainingData = async () => {
        setLoading(true);
        try {
            const response: AxiosResponse = await axios.get(
                `${elautBaseUrl}/lemdik/getPelatihan?${jenisProgram}`
            );
            setLoading(false);

            if (response.data!.data != null) {
                const filteredAndSortedData = response.data!.data
                    .filter((item: PelatihanMasyarakat) => item.JenisProgram === jenisProgram)
                    .sort((a: PelatihanMasyarakat, b: PelatihanMasyarakat) => {
                        const dateA = new Date(a.TanggalMulaiPelatihan);
                        const dateB = new Date(b.TanggalMulaiPelatihan);
                        if (a.StatusApproval === "Selesai" && b.StatusApproval !== "Selesai")
                            return 1;
                        if (a.StatusApproval !== "Selesai" && b.StatusApproval === "Selesai")
                            return -1;
                        return dateA.getTime() - dateB.getTime();
                    })
                    .slice(0, 2);
                setDataRelated(filteredAndSortedData);
            } else {
                setDataRelated([]);
            }
        } catch (error) {
            console.error("Error fetching related:", error);
            setLoading(false);
        }
    };

    const handleRegistration = () => {
        if (data?.StatusApproval === "Selesai") {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: "Yah pelatihan ini sudah berakhir, cari pelatihan lainnya sobat ELAUT!",
            });
            return;
        }
        if (Cookies.get("XSRF081")) {
            setIsRegistrasi(true);
        } else {
            setIsOpenRegistrationCommand(true);
        }
    };

    React.useEffect(() => {
        handleFetchingPublicTrainingDataById();

        const timer = setTimeout(() => {
            handleFetchingPublicTrainingData();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <section className="relative min-h-screen w-full bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white overflow-hidden">
                {/* Gradient blobs */}
                <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/40 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="pointer-events-none absolute top-1/4 left-1/2 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

                <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
                    {loading ? (
                        <div className="flex justify-center items-center py-32">
                            <HashLoader color="#38bdf8" size={60} />
                        </div>
                    ) : data ? (
                        <DetailRegistrasiPelatihan
                            data={data}
                            handleRegistration={handleRegistration}
                            isRegistrasi={isRegistrasi}
                        />
                    ) : (
                        <div className="text-center py-20">
                            <Image
                                src="/illustrations/not-found.png"
                                alt="Not Found"
                                width={300}
                                height={300}
                                className="mx-auto"
                            />
                            <p className="mt-6 text-lg text-gray-300">Pelatihan tidak ditemukan.</p>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>

    );
}

export default Page;
