
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import QRCode from "react-qr-code";
import { PelatihanMasyarakat } from "@/types/product";
import axios from "axios";
import { elautBaseUrl } from "@/constants/urls";
import Cookies from "js-cookie";
import Image from "next/image";
import { User, UserPelatihan } from "@/types/user";
import {
    generateTanggalPelatihan,
} from "@/utils/text";
import Toast from "../toast";
import { formatDateRange, formatDateRangeEnglish } from "@/utils/time";
import { generatedDescriptionCertificateFull, generatedSignedCertificate, generatedStatusCertificate } from "@/utils/certificates";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "@/firebase/config";
import { useFetchDataProgramPelatihan } from "@/hooks/elaut/master/useFetchDataProgramPelatihan";
import './styles/certificate.css'
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { findDataUnitKerjaById } from "@/utils/unitkerja";


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
        <div className="w-30">
            {/* Wrap QRCode with a ref-able div */}
            <div ref={wrapperRef} style={{ display: "none" }}>
                <QRCode value={`https://elaut-bppsdm.kkp.go.id/layanan/cek-sertifikat/${value}`} size={300} />
            </div>

            {imgUrl && (
                <img
                    src={imgUrl}
                    alt="QR Code"
                    style={{ width: "300px", marginLeft: "8rem" }}
                />
            )}
        </div>
    );

}


const FormatSTTPL = React.forwardRef(
    (
        {
            pelatihan,
            userPelatihan,
            refPage,
            isPrint,
        }: {
            pelatihan: PelatihanMasyarakat;
            userPelatihan: UserPelatihan;
            refPage: any;
            isPrint?: any
        },
        ref: any,
    ) => {
        const { data: dataProgramPelatihan, loading: loadingProgramPelatihan, error: errorProgramPelatihan, fetchProgramPelatihan } = useFetchDataProgramPelatihan(pelatihan?.Program);

        const { unitKerjas, loading: loadingUnitKerja, error: errorUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja()
        const unitKerja = findDataUnitKerjaById(unitKerjas, Cookies.get('IDUnitKerja'))
        console.log({ unitKerja })

        React.useEffect(() => {
            fetchUnitKerjaData()
        }, [fetchUnitKerjaData])

        const [peserta, setPeserta] = React.useState<User | null>(null);

        const handleFetchDetailPeserta = async () => {
            try {
                const response = await axios.get(
                    `${elautBaseUrl}/users/getUsersByIdNoJwt?id=${userPelatihan!.IdUsers}`,
                    {
                        headers: {
                            "x-api-key": "EL@uTs3rv3R",
                        },
                    }
                );

                setPeserta(response.data);
                console.log({ response });
            } catch (error) {
                console.error("LEMDIK INFO: ", error);
            }
        };

        const db = getFirestore(firebaseApp);

        const [selectedDoc, setSelectedDoc] = React.useState<any | null>(null);
        const [loading, setLoading] = React.useState(false);

        const fetchDocuments = async () => {
            setLoading(true);

            // Ambil dokumen Firestore
            const docRef = doc(db, "documents", pelatihan?.Program as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Parse jika datanya stringified JSON
                let data = docSnap.data();
                if (typeof data === "string") {
                    data = JSON.parse(data);
                }

                console.log("DOC DATA:", data);

                setSelectedDoc({
                    id: docSnap.id,
                    categories: data.categories || {},
                });
            }

            setLoading(false);
        };


        const materiFromDoc = React.useMemo(() => {
            if (!selectedDoc?.categories) return [];

            return Object.values(selectedDoc.categories).flatMap((cat: any) => {
                // if cat is array, return directly
                if (Array.isArray(cat)) return cat;
                // if cat has materi key, return that
                if (cat?.materi) return cat.materi;
                // fallback empty
                return [];
            });
        }, [selectedDoc]);


        const allMateri = [
            ...(pelatihan?.MateriPelatihan || []),
            ...materiFromDoc,
        ];

        React.useEffect(() => {
            if (pelatihan?.Program) fetchDocuments();
        }, [pelatihan?.Program]);

        const calculateTotalHoursFromFirestore = (categories: Record<string, any[]>) => {
            let totalTheory = 0;
            let totalPractice = 0;

            Object.values(categories).forEach((materiList) => {
                materiList.forEach((materi: any) => {
                    totalTheory += Number(materi.theory) || 0;
                    totalPractice += Number(materi.practice) || 0;
                });
            });

            return { totalTheory, totalPractice };
        };


        const totalHoursCertificateLvl = calculateTotalHoursFromFirestore(
            selectedDoc?.categories || {}
        );

        // ✅ Count materi INTI once
        const materiIntiCount =
            (selectedDoc?.categories?.["INTI"]?.length || 0);

        // ✅ Choose a scaling class
        const scaleClass = materiIntiCount >= 10 ? "scale-[.8] w-[120%] text-lg -mt-16" : "scale-100";


        React.useEffect(() => {
            handleFetchDetailPeserta();
        }, []);



        if (loadingProgramPelatihan || loadingUnitKerja)
            return <p className="text-center py-10 text-gray-500">Loading...</p>;
        if (errorProgramPelatihan || errorUnitKerja)
            return <p className="text-center text-red-500 py-10">{errorProgramPelatihan}</p>;


        return (

            <div
                ref={ref}
                className={`w-full h-full scale-95 flex flex-col gap-4 items-center justify-center  px-10  rounded-md font-bos leading-[120%] pb-0`}
            >

                <div ref={refPage} className={`pdf-page w-full flex flex-col  gap-4 relative  items-center justify-center h-[49.63rem]`}>
                    <div className="flex flex-row  absolute top-0 right-0">
                        <p className="text-lg font-bosNormal">
                            NO. SERTIFIKAT : {userPelatihan?.NoRegistrasi}
                        </p>
                    </div>

                    <div className="w-full flex flex-col space-y-0 px-10 mt-10 ">
                        {isPrint && pelatihan?.BidangPelatihan?.includes('Awak Kapal Perikanan') ? <div className="mx-auto w-30 h-64"></div> : <Image
                            alt="Logo KKP"
                            className="mx-auto w-30"
                            width={0}
                            height={0}
                            src="/logo-kkp-2.png"
                        />}


                        <div className="flex flex-col space-y-0 w-full h-fit items-center justify-center -mt-3">

                            <div className="flex flex-col h-fit items-center justify-center space-y-1">
                                <h1 className="text-lg font-bosBold">
                                    KEMENTERIAN KELAUTAN DAN PERIKANAN
                                </h1>
                                <p className="text-lg font-bosItalic">
                                    MINISTRY OF MARINE AFFAIRS AND FISHERIES
                                </p>
                            </div>
                            <div className="flex flex-col h-fit items-center justify-center space-y-1 mb-4">
                                <h1 className="text-xl font-bosBold">
                                    BADAN PENYULUHAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA KELAUTAN
                                    DAN PERIKANAN
                                </h1>
                                <p className="text-lg font-bosItalic">
                                    THE AGENCY FOR MARINE AND FISHERIES EXTENSION AND HUMAN
                                    RESOURCES DEVELOPMENT
                                </p>
                            </div>

                            <div className="flex flex-col h-fit items-center justify-center space-y-1">
                                <h1 className="text-2xl font-bosBold leading-none">
                                    SERTIFIKAT TANDA TAMAT PELATIHAN
                                </h1>
                                <p className="text-xl font-bosItalic">Certificate of Training Completion</p>

                            </div>



                        </div>

                        <div className="flex w-full flex-col space-y-1 max-w-7xl mx-auto items-start text-base  text-center font-bos h-fit mt-2">
                            <span className="text-lg leading-none font-bosNormal">
                                {
                                    dataProgramPelatihan[0]?.description == "" ? " Berdasarkan Peraturan Pemerintah Nomor.62 Tahun 2014 tentang Penyelenggaraan Pendidikan, Pelatihan dan Penyuluhan Perikanan, serta ketentuan pelaksanaannya menyatakan bahwa :" : generatedDescriptionCertificateFull(dataProgramPelatihan[0]?.description).desc_indo + " menyatakan bahwa :"
                                }

                            </span>
                            <span className="max-w-6xl leading-none font-bosItalic text-[0.9rem] mx-auto">
                                {
                                    dataProgramPelatihan[0]?.description == "" ? "  Based on Government Regulation Number 62 of 2014 concerning the Implementation of Fisheries Education, Training and Extension as well as its implementing provisions States that :" : generatedDescriptionCertificateFull(dataProgramPelatihan[0]?.description).desc_eng + " States that :"
                                }

                            </span>
                        </div>

                        <div className="flex flex-col space-y-0 w-full  h-fit -mt-1 py-3">
                            <table className="w-full h-fit" cellPadding={0} cellSpacing={0}>
                                <tr className="w-full">
                                    <td className="font-bos w-full flex flex-col space-y-0">
                                        <span className="font-bosBold text-lg uppercase">Nama</span>
                                        <span className="font-bos italic text-[0.85rem] -mt-2">Name</span>
                                    </td>
                                    <td className=" w-2/3 text-xl font-bosBold uppercase">: {peserta?.Nama}</td>
                                </tr>
                                <tr className="w-full mt-3">
                                    <td className="font-bos w-full flex flex-col space-y-0">
                                        <span className="text-lg font-bosBold uppercase">Tempat Tanggal Lahir</span>
                                        <span className="font-bos italic text-[0.85rem] -mt-2">
                                            {" "}
                                            Place and Date of Birth
                                        </span>
                                    </td>
                                    <td className=" w-2/3 text-xl font-bosBold uppercase">
                                        : {peserta?.TempatLahir}, {peserta?.TanggalLahir}
                                    </td>

                                </tr>
                            </table>
                        </div>

                        <div className="flex flex-col space-y-0 w-full h-fit items-center justify-center -mt-1 mb-4">
                            <h1 className="font-bosBold text-2xl leading-none">
                                {
                                    userPelatihan?.IsActice == "" ? "-" : generatedStatusCertificate(userPelatihan?.IsActice).status_indo
                                }
                            </h1>
                            <h3 className="font-bosNormal text-xl italic">
                                {
                                    userPelatihan?.IsActice == "" ? "-" : generatedStatusCertificate(userPelatihan?.IsActice).status_eng
                                }
                            </h3>
                        </div>

                        <>
                            <div className="flex w-full flex-col space-y-1 max-w-7xl mx-auto items-start text-sm -mt-2 text-center font-bos h-fit">
                                <span className="text-lg leading-[115%] font-bosNormal max-w-7xl">
                                    Pelatihan <span className={`${pelatihan?.Program.includes('HACCP') ? 'font-bosItalic' : 'font-bosNormal'}`}>{dataProgramPelatihan[0]?.name_indo}</span> pada tanggal {formatDateRange(generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan))} {generatedDescriptionCertificateFull(dataProgramPelatihan[0]?.description).body_indo == "" ? `yang diselenggarakan oleh ${pelatihan?.PenyelenggaraPelatihan} di ${pelatihan?.LokasiPelatihan}. Yang merupakan bagian dari upaya peningkatan kapasitas dan kompetensi sumber daya manusia di sektor kelautan dan perikanan, sesuai dengan standar mutu atau ketentuan yang berlaku, sehingga peserta memperoleh pengetahuan, keterampilan, dan pemahaman yang relevan sesuai program pelatihan.` : generatedDescriptionCertificateFull(dataProgramPelatihan[0]?.description).body_indo}
                                </span>
                                {
                                    generatedDescriptionCertificateFull(dataProgramPelatihan[0]?.description).body_eng != "" && <span className="max-w-6xl mt-1 leading-none font-bosItalic text-[0.9rem] mx-auto">
                                        {dataProgramPelatihan[0]?.name_english} training on {formatDateRangeEnglish(generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan))} {dataProgramPelatihan[0]?.description == "" ? "in support of the Quality Assurance System based on Regulation of the Minister of Marine Affairs and Fisheries of the Republic of Indonesia Number 8 of 2024 concerning Control of the Implementation of the Quality Assurance and Safety System for Marine and Fishery Product" : generatedDescriptionCertificateFull(dataProgramPelatihan[0]?.description).body_eng}
                                    </span>
                                }

                            </div>

                            <div className="flex gap-2 items-center justify-center pt-4">
                                <div className="grid grid-cols-3 items-center">
                                    {/* Kolom 1 - QR Code */}
                                    <QRCodeImage value={userPelatihan?.NoRegistrasi} />

                                    {/* Kolom 2 - Foto */}
                                    {
                                        peserta?.Foto == 'https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/' ? <></> : <div
                                            className=""
                                            style={{
                                                width: "135px",
                                                height: "195px",
                                                border: "1px solid #9f9f9f",
                                                borderRadius: "15px",
                                                marginLeft: "8rem",
                                                overflow: "hidden",
                                                padding: "3px",
                                            }}
                                        >
                                            <img
                                                src={peserta?.Foto || ""}
                                                alt="Foto"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>
                                    }


                                    {/* Kolom 3 - Tanda Tangan & Pejabat */}
                                    <div className={`flex flex-col items-center justify-center text-center ${peserta?.Foto == "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/" ? "w-[120%]" : "w-[120%]"} mt-2 space-y-1 -ml-20`}>
                                        <div className="flex flex-col items-center gap-0.5 font-bosNormal text-sm leading-tight">
                                            <span className='text-base'>Jakarta, {generateTanggalPelatihan(pelatihan?.TanggalBerakhirPelatihan)}</span>
                                            <span className="w-full font-bosBold text-base">
                                                a.n. KEPALA BADAN PENYULUHAN DAN PENGEMBANGAN <br />
                                                SUMBER DAYA MANUSIA KELAUTAN DAN PERIKANAN
                                            </span>

                                            <span className="leading-tight font-bosItalic text-sm">
                                                o.b. Director General of The Agency for Marine and Fisheries Extension
                                                and Human Resources Development
                                            </span>

                                            <span className="w-full font-bosBold  text-base">
                                                KEPALA PUSAT PELATIHAN KELAUTAN DAN PERIKANAN
                                            </span>

                                            <span className="leading-tight font-bosItalic text-sm">
                                                Director for Marine and Fisheries Training Center
                                            </span>
                                        </div>

                                        <Image
                                            alt="Tanda Tangan Elektronik"
                                            width={200}
                                            height={100}
                                            src="/ttd-elektronik.png"
                                            className="block pt-2"
                                        />

                                        <span className="font-bosBold text-base -mt-2">
                                            Dr. Lilly Aprilya Pregiwati, S.Pi., M.Si
                                        </span>
                                    </div>

                                </div>

                            </div>
                        </>
                    </div>
                </div>

                <div
                    className={`pdf-page w-full flex flex-col gap-2 h-[53.74rem] items-center justify-center ${materiIntiCount >= 10 ? "mt-56" : "mt-36"} break-before-auto relative  mb-0 pb-0`}
                >
                    <div className="w-full mb-0 pb-0">
                        {/* Title */}
                        <div className={`flex flex-row justify-center items-center ${materiIntiCount >= 10 ? "-mb-20" : "mb-5"}`}>
                            <div className="flex flex-col text-center space-y-0 h-fit items-center justify-center w-full gap-0">
                                <p className={`font-bosBold ${materiIntiCount >= 10 ? "text-xl" : "text-2xl max-w-6xl"} w-full uppercase leading-none mb-0`}>
                                    Materi Pelatihan {dataProgramPelatihan[0]?.name_indo}, Diselenggarakan oleh {pelatihan?.PenyelenggaraPelatihan} pada tanggal{" "}
                                    {formatDateRange(
                                        generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan),
                                        generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan)
                                    )}
                                </p>
                                {
                                    generatedDescriptionCertificateFull(dataProgramPelatihan[0]?.description).body_eng != "" && <span className={`font-bos ${materiIntiCount >= 10 ? "text-lg" : "text-xl"} leading-none w-full -mt-5 pt-0`}>
                                        Curriculum of {dataProgramPelatihan[0]?.name_english} Training,{" "}
                                        held by {pelatihan?.PenyelenggaraPelatihan} on {formatDateRangeEnglish(
                                            generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan),
                                            generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan)
                                        )}
                                    </span>
                                }

                            </div>
                        </div>

                        {/* Table */}
                        <div className={`${scaleClass} ${(pelatihan?.BidangPelatihan?.includes('Awak Kapal Perikanan')) ? '-mb-28' : 'mb-0'} pb-0 w-full border border-gray-400 rounded-md overflow-hidden `}>
                            {/* Header Baris 1 */}
                            <div className="flex text-center font-bosNormal bg-gray-100 ">
                                <div className="w-1/12 px-1 flex items-center justify-center border-r border-gray-400 leading-none relative">
                                    <span className="absolute mt-10 right-0 left-0 !font-bosBold text-lg">NO</span>
                                </div>
                                <div className="w-7/12 px-1 flex flex-col justify-center items-center border-r border-gray-400 relative">
                                    <div className="flex flex-row items-center justify-center absolute mt-10">
                                        <span className="text-lg leading-none !font-bosBold">MATERI</span>/
                                        <span className="italic font-bos leading-none">COURSE</span>
                                    </div>
                                </div>
                                <div className="w-4/12 px-1 flex items-center justify-center border-b border-gray-400">
                                    <div className="flex flex-col mb-3">
                                        <div className="flex flex-row items-center justify-center">
                                            <span className="text-lg leading-none !font-bosBold">ALOKASI WAKTU </span>/
                                            <span className="italic font-bos leading-none">ALLOCATION TIME</span>
                                        </div>
                                        <div className="flex flex-row items-center justify-center -mt-1">
                                            <span className="text-lg leading-none !font-bosBold">@45 MENIT</span>/
                                            <span className="italic font-bos leading-none">@45 MINS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Header Baris 2 */}
                            <div className="flex text-center font-bosNormal bg-gray-100 border-b border-gray-400">
                                <div className="w-1/12 px-1 border-r border-gray-400"></div>
                                <div className="w-7/12 px-1 border-r border-gray-400"></div>
                                <div className="w-2/12 px-1 py-1 border-r border-gray-400">
                                    <div className="flex flex-row items-center justify-center mb-4">
                                        <span className="text-lg leading-none !font-bosBold">TEORI</span>/
                                        <span className="italic font-bos leading-none ">THEORY</span>
                                    </div>
                                </div>
                                <div className="w-2/12 px-1 py-1">
                                    <div className="flex flex-row items-center justify-center mb-4">
                                        <span className="text-lg leading-none !font-bosBold">PRAKTEK</span>/
                                        <span className="italic font-bos leading-none ">PRACTICE</span>
                                    </div>
                                </div>
                            </div>

                            {Object.entries(selectedDoc?.categories || {})
                                // sort so that UMUM is always first
                                .sort(([a], [b]) => {
                                    if (a === "UMUM") return -1;
                                    if (b === "UMUM") return 1;
                                    return a.localeCompare(b);
                                })
                                .map(([kategori, materiList], i) => {
                                    const groupedMateri = (materiList as any[]).reduce((acc, materi) => {
                                        const groupKey = materi.group_ind || "_no_group";
                                        if (!acc[groupKey]) acc[groupKey] = [];
                                        acc[groupKey].push(materi);
                                        return acc;
                                    }, {} as Record<string, any[]>);

                                    // 👉 check if category is INTI and how many materi inside
                                    const materiCount = (materiList as any[])?.length || 0;

                                    // dynamic font size classes
                                    let materiFontClass = "text-lg";
                                    let engFontClass = "text-sm italic";

                                    if ((kategori === "INTI" || kategori === "UMUM") && materiCount > 10) {
                                        materiFontClass = "text-lg"; // shrink more if > 10
                                        engFontClass = "text-xs italic";
                                    } else if (materiCount > 7) {
                                        materiFontClass = "text-lg"; // slightly smaller if > 7
                                        engFontClass = "text-xs italic";
                                    }

                                    return (
                                        <React.Fragment key={i}>
                                            {/* Header kategori */}
                                            <div className="flex border-b border-gray-400 bg-white">
                                                <div className="w-1/12 px-1 text-center border-r border-gray-400">
                                                    {i + 1}.
                                                </div>
                                                <div className="w-9/12 px-1">
                                                    <div className="flex flex-row mb-3">
                                                        <span className="text-base font-bosBold">KOMPETENSI {kategori}</span>/
                                                        <span className="font-bosItalic text-sm">
                                                            {kategori === "UMUM" ? "General Competency" : "Core Competency"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-1/12"></div>
                                                <div className="w-1/12"></div>
                                            </div>

                                            {/* Loop group_ind sections */}
                                            {Object.entries(groupedMateri as Record<string, any[]>).map(
                                                ([groupKey, materiGroup], gi) => (
                                                    <React.Fragment key={gi}>
                                                        {groupKey !== "_no_group" && (
                                                            <div className="flex bg-gray-100 border-b border-gray-300">
                                                                <div className="w-1/12 px-1 text-center border-r border-gray-300"></div>
                                                                <div
                                                                    className={`w-11/12 px-2 py-1 text-lg font-bosBold uppercase mb-3 ${materiFontClass}`}
                                                                >
                                                                    {groupKey}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {materiGroup.map((materi, idx) => (
                                                            <div key={idx} className="flex border-b border-gray-300">
                                                                <div className="w-1/12 px-1 text-center border-r border-gray-300 mb-3">
                                                                    {idx + 1}.
                                                                </div>
                                                                <div className="w-7/12 px-1 border-r border-gray-300">
                                                                    <div className="flex flex-col mb-3">
                                                                        <span className={`${materiFontClass} font-normal`}>
                                                                            {materi.name_ind}
                                                                        </span>
                                                                        {materi.name_eng && (
                                                                            <span className={engFontClass}>{materi.name_eng}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="w-2/12 px-1 text-center border-r border-gray-300 mb-3">
                                                                    {materi.theory}
                                                                </div>
                                                                <div className="w-2/12 px-1 text-center mb-3">{materi.practice}</div>
                                                            </div>
                                                        ))}
                                                    </React.Fragment>
                                                )
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                            {/* Jumlah Jam */}
                            <div className="flex font-bosNormal border-b border-gray-300">
                                <div className="w-1/12 px-1 flex items-center justify-center border-r border-gray-300"></div>
                                <div className="w-7/12 px-1 border-r border-gray-300">
                                    <div className="flex flex-row items-center mb-4">
                                        <span className="text-lg leading-none !font-bosBold">JUMLAH JAM PELAJARAN</span>/
                                        <span className="italic font-bos leading-none">Training Hours</span>
                                    </div>
                                </div>
                                <div className="w-2/12 text-lg px-1 mb-3 text-center">{totalHoursCertificateLvl.totalTheory}</div>
                                <div className="w-2/12 text-lg px-1 mb-3 text-center">{totalHoursCertificateLvl.totalPractice}</div>
                            </div>

                            {/* Total Jam */}
                            <div className="flex font-bosNormal">
                                <div className="w-1/12 px-1 flex items-center justify-center border-r border-gray-300"></div>
                                <div className="w-7/12 px-1 border-r border-gray-300">
                                    <div className="flex flex-row items-center mb-4">
                                        <span className="text-lg leading-none !font-bosBold">TOTAL JAM PELAJARAN</span>/
                                        <span className="italic font-bos leading-none">Total Hours</span>
                                    </div>
                                </div>
                                <div className="w-4/12 px-1 text-lg mb-3 text-center flex items-center justify-center">
                                    {totalHoursCertificateLvl.totalTheory + totalHoursCertificateLvl.totalPractice}
                                </div>
                            </div>
                        </div>

                        {
                            (pelatihan?.BidangPelatihan?.includes('Sistem Jaminan Mutu') || pelatihan?.BidangPelatihan?.includes('Awak Kapal Perikanan')) ? <div className="w-full flex justify-center items-center">
                                {/* <p className="max-w-3xl text-center font-bosItalic leading-none">
                                    Lampiran materi/kurikulum pelatihan disahkan sesuai dengan standar mutu yang berlaku dan diselenggarakan oleh <span className="font-bosBold uppercase">
                                        {pelatihan?.PenyelenggaraPelatihan}
                                    </span>
                                </p> */}
                            </div> :
                                unitKerja != null ? <div className={`flex flex-col items-start justify-start text-left w-full mt-2 space-y-1 max-w-7xl`}>
                                    <div className="flex flex-col items-start gap-0.5 font-bosNormal text-sm leading-tight">
                                        <span className='text-base'> {generatedSignedCertificate(unitKerja?.pimpinan).location}, {generateTanggalPelatihan(pelatihan?.TanggalBerakhirPelatihan)}</span>
                                        <span className='text-base'> Disahkan oleh,</span>

                                        <span className="w-full font-bosBold uppercase text-base">
                                            {generatedSignedCertificate(unitKerja?.pimpinan).status_indo}
                                        </span>

                                        <span className="leading-tight font-bosItalic text-sm">
                                            {generatedSignedCertificate(unitKerja?.pimpinan).status_eng}
                                        </span>
                                    </div>

                                    <span className="w-full font-bosNormal uppercase text-base py-3 my-3">
                                        TTD
                                    </span>

                                    <span className="font-bosBold text-base -mt-2">
                                        {generatedSignedCertificate(unitKerja?.pimpinan).name}
                                    </span>
                                </div> : <></>
                        }

                    </div>
                </div>

            </div>

        );
    }
);

export type DialogSertifikatHandle = {
    uploadPdf: () => Promise<void>;
    downloadPdf?: () => Promise<void>;
};

type Props = {
    userPelatihan: UserPelatihan;
    pelatihan: PelatihanMasyarakat;
    handleFetchingData?: () => void;
    isPrint?: boolean
};

const DialogSertifikatPelatihan = forwardRef<DialogSertifikatHandle, Props>(
    ({ userPelatihan, pelatihan, isPrint }, ref) => {
        const componentRef = useRef<HTMLDivElement>(null);
        const componentRefPage = useRef<HTMLDivElement>(null);
        let html2pdfInstance: any = null;

        const uploadPdf = async () => {
            if (!userPelatihan) return;
            console.log("⬆️ Uploading PDF for:", userPelatihan.Nama);

            try {
                if (!html2pdfInstance) {
                    html2pdfInstance = (await import("html2pdf.js")).default;
                }

                if (!componentRef.current || !componentRefPage.current) {
                    console.error("❌ Component reference is null");
                    return;
                }

                const element = componentRef.current;
                const elementPage = componentRefPage.current;

                const { offsetWidth, scrollHeight } = element;
                const firstPageHeight = elementPage.offsetHeight + 180;
                const remainingHeight = scrollHeight - firstPageHeight;

                const opt = {
                    margin: [0, 10, 10, 10],
                    filename: `${userPelatihan.Nama}_${userPelatihan.NoRegistrasi}.pdf`,
                    pagebreak: { mode: ["avoid-all", "css"] },
                    html2canvas: {
                        scale: 1.5,
                        useCORS: true,
                        allowTaint: true,
                        logging: false,
                        backgroundColor: "#fff",
                    },
                    jsPDF: {
                        unit: "px",
                        format: [offsetWidth, firstPageHeight],
                        orientation: "landscape",
                    },
                };

                const pdfBlob: Blob = await html2pdfInstance()
                    .from(element)
                    .set(opt)
                    .toPdf()
                    .outputPdf("blob");

                const MAX_SIZE_MB = 3;
                if (pdfBlob.size > MAX_SIZE_MB * 1024 * 1024) {
                    Toast.fire({
                        icon: "error",
                        title: `Ukuran file terlalu besar! Maksimum ${MAX_SIZE_MB} MB.`,
                    });
                    return;
                }

                const formData = new FormData();
                formData.append("IdUserPelatihan", String(userPelatihan.IdUserPelatihan ?? ""));
                formData.append(
                    "fileSertifikat",
                    pdfBlob,
                    `${userPelatihan.Nama}_${userPelatihan.NoRegistrasi}.pdf`
                );

                await axios.post(elautBaseUrl + "/lemdik/saveSertifikat", formData, {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                });

                console.log("✅ Upload selesai:", userPelatihan.Nama);
            } catch (error) {
                console.error("❌ Error uploading PDF:", error);
            }
        };
        const downloadPdf = async () => {
            if (!userPelatihan) return;
            console.log("⬇️ Downloading PDF for:", userPelatihan.Nama);

            try {
                if (!html2pdfInstance) {
                    html2pdfInstance = (await import("html2pdf.js")).default;
                }

                if (!componentRef.current || !componentRefPage.current) {
                    console.error("❌ Component reference is null");
                    return;
                }

                const element = componentRef.current;
                const elementPage = componentRefPage.current;

                const { offsetWidth, scrollHeight } = element;
                const firstPageHeight = elementPage.offsetHeight + 180;
                const remainingHeight = scrollHeight - firstPageHeight;


                const opt = {
                    margin: [0, 10, 10, 10],
                    filename: `${userPelatihan.Nama}_${userPelatihan.NoRegistrasi}.pdf`,
                    pagebreak: { mode: ["css", "legacy"] }, // allow CSS page-breaks
                    html2canvas: {
                        scale: 1.5,
                        useCORS: true,
                        logging: false,
                        allowTaint: true,
                        backgroundColor: "#fff",
                    },
                    jsPDF: {
                        unit: "px",
                        format: [offsetWidth, firstPageHeight], // each page = half of total height
                        orientation: "landscape", // use portrait so it looks natural
                    },
                };

                // ✅ Render and save
                await html2pdfInstance().from(element).set(opt).save();

                console.log("✅ PDF downloaded locally:", userPelatihan.Nama);
            } catch (error) {
                console.error("❌ Error downloading PDF:", error);
            }
        };

        useImperativeHandle(ref, () => ({ uploadPdf, downloadPdf }), []);

        return (
            <div className="max-h-[700px] scale-95 bg-white flex flex-col gap-2 overflow-y-auto scroll-smooth">
                <button onClick={() => downloadPdf()}>Download</button>
                <FormatSTTPL
                    ref={componentRef}
                    refPage={componentRefPage}
                    pelatihan={pelatihan}
                    userPelatihan={userPelatihan}
                    isPrint={isPrint}
                />
            </div>
        );
    }
);

DialogSertifikatPelatihan.displayName = "DialogSertifikatPelatihan";
export default DialogSertifikatPelatihan;
