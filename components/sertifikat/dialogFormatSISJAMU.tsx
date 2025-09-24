import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import React, { ReactElement, useRef } from "react";
import QRCode from "react-qr-code";
import { MdVerified } from "react-icons/md";
import { MateriPelatihan, PelatihanMasyarakat } from "@/types/product";
import Image from "next/image";
import {
    generateTanggalPelatihan,
} from "@/utils/text";
import { formatDateRange, formatDateRangeEnglish } from "@/utils/time";
import { generatedCurriculumCertificate, generatedDescriptionCertificate, generatedSignedCertificate, isEnglishFormat } from "@/utils/certificates";
import Cookies from "js-cookie";

const FormatSTTPL = React.forwardRef(
    (
        {
            pelatihan,
            refPage
        }: {
            pelatihan: PelatihanMasyarakat;
            refPage: any
        },
        ref: any,

    ) => {
        const calculateTotalHoursWithMateri = (data: MateriPelatihan[]) => {
            let totalTheory = 0;
            let totalPractice = 0;

            data.forEach((course) => {
                const theory = parseFloat(course.JamTeory) || 0;
                const practice = parseFloat(course.JamPraktek) || 0;

                totalTheory += theory;
                totalPractice += practice;
            });

            return { totalTheory, totalPractice };
        };

        const totalHoursCertificateLvl = calculateTotalHoursWithMateri(pelatihan?.MateriPelatihan || []);
        const pimpinanLemdiklat = Cookies.get('PimpinanLemdiklat') || ""

        return (
            <div className=" flex-col gap-8 font-bos ">
                <div
                    ref={ref}
                    className={`w-full h-full scale-95 flex flex-col gap-4 items-center justify-center  px-10  rounded-md font-bos leading-[120%] $pb-0`}
                >
                    <>
                        <div ref={refPage} className={`pdf-page w-full flex flex-col  gap-4 relative  items-center justify-center h-[49.63rem]`}>
                            <div className="flex flex-row  absolute top-0 right-0">
                                <p className="text-lg font-bosNormal">
                                    No. STTPL : -
                                </p>
                            </div>



                            <div className="w-full flex flex-col space-y-0 px-10 mt-10 ">
                                <Image
                                    alt="Logo KKP"
                                    className="mx-auto w-28"
                                    width={0}
                                    height={0}
                                    src="/logo-kkp-2.png"
                                />

                                <div className="flex flex-col space-y-0 w-full h-fit items-center justify-center -mt-3">

                                    <div className="flex flex-col h-fit items-center justify-center space-y-0">
                                        <h1 className="text-base font-bosBold font-bold">
                                            KEMENTERIAN KELAUTAN DAN PERIKANAN
                                        </h1>
                                        {isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <p className="text-base font-bosItalic">
                                            MINISTRY OF MARINE AFFAIRS AND FISHERIES
                                        </p>}
                                    </div>
                                    <div className="flex flex-col h-fit items-center justify-center space-y-0">
                                        <h1 className="text-lg font-bosBold font-bold">
                                            BADAN PENYULUHAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA KELAUTAN
                                            DAN PERIKANAN
                                        </h1>
                                        {isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <p className="text-sm font-bosItalic">
                                            THE AGENCY FOR MARINE AND FISHERIES EXTENSION AND HUMAN
                                            RESOURCES DEVELOPMENT
                                        </p>}

                                    </div>

                                    <div className="flex flex-col h-fit items-center justify-center space-y-1">
                                        <h1 className="text-2xl font-bosBold font-black leading-none">
                                            SERTIFIKAT
                                        </h1>
                                        {isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <p className="text-lg font-bosItalic">CERTIFICATE</p>}

                                    </div>

                                </div>

                                <div className="flex w-full flex-col space-y-0 max-w-5xl mx-auto items-start text-base  text-center font-bos h-fit mt-2">
                                    <span className="text-base leading-none font-bosNormal">
                                        Berdasarkan Peraturan Pemerintah Nomor.62 Tahun 2014 tentang Penyelenggaraan Pendidikan, Pelatihan dan Penyuluhan Perikanan, serta ketentuan pelaksanaannya menyatakan bahwa :
                                    </span>
                                    {isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <span className="max-w-4xl leading-none font-bosItalic text-[0.85rem] mx-auto">
                                        Based on Government Regulation Number 62
                                        of 2014 concerning the Implementation of Fisheries Education,
                                        Training and Extension as well as its implementing provisions
                                        States that :
                                    </span>}

                                </div>

                                <div className="flex flex-col space-y-0 w-full  h-fit -mt-1 py-3">
                                    <table className="w-full h-fit" cellPadding={0} cellSpacing={0}>
                                        <tr className="w-full">
                                            <td className="font-bos w-full flex flex-col space-y-0">
                                                <span className="font-bosBold text-lg uppercase">Nama</span>
                                                {isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <span className="font-bos italic text-[0.85rem] -mt-2">Name</span>}

                                            </td>
                                            <td className=" w-2/3 text-xl font-bosBold uppercase">: NI KADEK ISWANA</td>
                                        </tr>
                                        <tr className="w-full mt-3">
                                            <td className="font-bos w-full flex flex-col space-y-0">
                                                <span className="text-lg font-bosBold uppercase">Tempat Tanggal Lahir</span>
                                                {isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <span className="font-bos italic text-[0.85rem] -mt-2">
                                                    {" "}
                                                    Place and Date of Birth
                                                </span>
                                                }
                                            </td>
                                            <td className=" w-2/3 text-xl font-bosBold capitalize">
                                                : BALI, 17 AGUSTUS 1998
                                            </td>
                                        </tr>
                                    </table>
                                </div>

                                <div className="flex flex-col space-y-0 w-full h-fit items-center justify-center -mt-1 mb-2">
                                    <h1 className="font-bosBold font-black text-xl leading-none">
                                        TELAH LULUS
                                    </h1>
                                    {isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <h3 className="font-bosNormal font-bold text-lg italic">
                                        HAS PASSED
                                    </h3>}
                                </div>

                                <>
                                    <div className="flex w-full flex-col space-y-0 max-w-7xl mx-auto items-start text-sm -mt-2 text-center font-bos h-fit">
                                        <span className="text-base leading-[115%] font-bosNormal max-w-6xl">
                                            Pelatihan <span className="font-bosItalic">{pelatihan?.Program}</span>  dalam mendukung Sistem Jaminan Mutu berdasarkan Peraturan Menteri Kelautan dan Perikanan Republik Indonesia Nomor 8 Tahun 2024 tentang Pengendalian Pelaksanaan Sistem Jaminan Mutu dan Keamanan Hasil Kelautan dan Perikanan yang  pada tanggal {formatDateRange(generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan))}
                                        </span>

                                        {
                                            (generatedDescriptionCertificate(pelatihan!.DeskripsiSertifikat).desc_eng) != "" && <span className="max-w-5xl mt-1 leading-none font-bos italic text-[0.85rem] mx-auto">
                                                {pelatihan?.Program} training in support of the Quality Assurance System based on Regulation of the Minister of Marine Affairs and Fisheries of the Republic of Indonesia Number 8 of 2024 concerning Control of the Implementation of the Quality Assurance and Safety System for Marine and Fishery Product on {formatDateRangeEnglish(generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan))}
                                            </span>
                                        }

                                    </div>

                                    <div className="flex gap-2 items-center justify-center pt-6">
                                        <div className="grid grid-cols-3 items-center">
                                            {/* Kolom 1 - QR Code */}
                                            <div className="w-30 ">
                                                <QRCode
                                                    size={300}
                                                    style={{ height: "auto", maxWidth: "100%", width: "100%", marginLeft: "8rem", }}
                                                    value={`https://elaut-bppsdm.kkp.go.id/layanan/cek-sertifikat/-`}
                                                    viewBox={`0 0 300 300`}
                                                />
                                            </div>

                                            {/* Kolom 2 - Foto */}
                                            <div
                                                className=""
                                                style={{
                                                    width: "135px",
                                                    height: "195px",
                                                    border: "1px solid #9f9f9f",
                                                    borderRadius: "15px",
                                                    marginLeft: "8rem",
                                                    overflow: "hidden", // penting supaya foto nggak keluar frame
                                                    padding: "3px",
                                                }}
                                            >
                                                <img
                                                    src="/testing.jpeg"
                                                    alt="Foto"
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </div>

                                            {/* Kolom 3 - Tanda Tangan & Pejabat */}
                                            <div className="flex flex-col items-center justify-center text-center w-[120%] mt-2 space-y-1">
                                                <div className="flex flex-col items-center gap-0.5 font-bosNormal text-sm leading-tight">
                                                    <span>Jakarta, 24 September 2025</span>
                                                    <span className="w-full font-bosBold text-base">
                                                        a.n. KEPALA BADAN PENYULUHAN DAN PENGEMBANGAN <br />
                                                        SUMBER DAYA MANUSIA KELAUTAN DAN PERIKANAN
                                                    </span>

                                                    {isEnglishFormat(pelatihan?.DeskripsiSertifikat) && (
                                                        <span className="leading-tight font-bosItalic text-sm">
                                                            o.b. Director General of The Agency for Marine and Fisheries Extension
                                                            and Human Resources Development
                                                        </span>
                                                    )}

                                                    <span className="w-full font-bosBold  text-base">
                                                        KEPALA PUSAT PELATIHAN KELAUTAN DAN PERIKANAN
                                                    </span>

                                                    {isEnglishFormat(pelatihan?.DeskripsiSertifikat) && (
                                                        <span className="leading-tight font-bosItalic text-sm">
                                                            Director for Marine and Fisheries Training Center
                                                        </span>
                                                    )}
                                                </div>

                                                <Image
                                                    alt="Tanda Tangan Elektronik"
                                                    width={180}
                                                    height={80}
                                                    src="/ttd-elektronik.png"
                                                    className="block pt-2"
                                                />

                                                <span className="font-bosNormal font-bold text-base -mt-2">
                                                    Dr. Lilly Aprilya Pregiwati, S.Pi., M.Si
                                                </span>
                                            </div>

                                        </div>

                                    </div>
                                </>
                            </div>



                        </div>

                        <div className={`pdf-page w-full flex flex-col  gap-4  h-full items-center justify-center ${pelatihan?.MateriPelatihan.length < 7 ? 'mt-72' : 'mt-48'} break-before-auto relative`}>
                            <div className="flex flex-row justify-center items-center mb-6">
                                <div className="flex flex-row gap-2 items-center h-fit">
                                    <div className="flex flex-col text-center space-y-0 h-fit items-center justify-center w-full gap-0">
                                        <p className="font-bosBold text-2xl max-w-4xl w-full uppercase leading-none">
                                            Materi {pelatihan?.Program}, tanggal {formatDateRange(generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan))}
                                        </p>
                                        {
                                            (pelatihan?.NamaPelathanInggris != "") && <p className="font-bos text-xl max-w-4xl leading-none -mt-3">{pelatihan?.Program}, {formatDateRangeEnglish(generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan))}</p>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="w-full border border-gray-400 rounded-md overflow-hidden">
                                <div className="flex text-center font-bosNormal font-bold bg-gray-100 ">
                                    <div className="w-1/12 px-1 flex items-center justify-center border-r border-gray-400 leading-none relative"><span className='absolute mt-10 right-0 left-0 !font-bosBold text-lg'>NO</span></div>
                                    <div className="w-7/12 px-1 flex flex-col justify-center items-center border-r border-gray-400 relative">
                                        <div className="flex flex-row items-center justify-center absolute mt-10">
                                            <span className="text-lg leading-none !font-bosBold">MATERI</span>/
                                            <span className="italic font-bos leading-none">COURSE</span>
                                        </div>
                                    </div>
                                    <div className="w-4/12 px-1 flex items-center justify-center border-b border-gray-400">
                                        <div className="flex flex-col mb-3">
                                            <div className="flex flex-row  items-center justify-center">
                                                <span className="text-lg leading-none !font-bosBold">ALOKASI WAKTU </span>/
                                                <span className="italic font-bos leading-none">ALLOCATION TIME</span>
                                            </div>
                                            <div className="flex flex-row  items-center justify-center -mt-1">
                                                <span className="text-lg leading-none !font-bosBold">@45 MENIT</span>/
                                                <span className="italic font-bos leading-none">@45 MINS</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Header Baris 2 */}
                                <div className="flex text-center font-bosNormal font-bold bg-gray-100 border-b border-gray-400">
                                    <div className="w-1/12 px-1 border-r border-gray-400"></div>
                                    <div className="w-7/12 px-1 border-r border-gray-400"></div>
                                    <div className="w-2/12 px-1 border-r border-gray-400">
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

                                {
                                    pelatihan?.AsalSertifikat == 'Specific' ? <>
                                        {/* Kompetensi Umum Title */}
                                        <div className="flex border-b border-gray-400 bg-white">
                                            <div className="w-1/12 px-1 !font-bosBold  text-center border-r border-gray-400">I</div>
                                            <div className="w-9/12 px-1 font-bosNormal font-bold ">
                                                <div className="flex flex-row items-center mb-3">
                                                    <span className="text-base leading-none !font-bosBold">KOMPETENSI UMUM</span>/
                                                    <span className="italic font-bos leading-none mb-1">General Competency</span>

                                                </div>
                                            </div>
                                            <div className="w-1/12 px-1 "></div>
                                            <div className="w-1/12 px-1 py-1"></div>
                                        </div>

                                        {/* Kompetensi Umum Items */}
                                        {pelatihan.MateriPelatihan.filter((item) => item.Deskripsi == 'Umum').map((materi, index) => (
                                            <div
                                                key={index}
                                                className="flex text-sm border-b border-gray-300"
                                            >
                                                <div className="w-1/12 px-1 text-center border-r border-gray-300">{index + 1}.</div>
                                                <div className="w-7/12 px-1 border-r border-gray-300">
                                                    <div className="flex flex-col justify-center mb-4">
                                                        <span className="text-lg !font-bosNormal not-italic font-normal leading-none">{generatedCurriculumCertificate(materi.NamaMateri).curr_indo}</span>
                                                        {
                                                            generatedCurriculumCertificate(materi.NamaMateri).curr_eng != "" && <span className="italic font-bosItalic leading-none">{generatedCurriculumCertificate(materi.NamaMateri).curr_eng}</span>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="w-2/12 px-1 text-center font-bosNormal text-lg border-r border-gray-300">{materi.JamTeory}</div>
                                                <div className="w-2/12 px-1 text-center font-bosNormal text-lg">{materi.JamPraktek}</div>
                                            </div>
                                        ))}

                                        {/* Kompetensi Inti Title */}
                                        <div className="flex border-b border-gray-400 bg-white">
                                            <div className="w-1/12 px-1 !font-bosBold text-center border-r border-gray-400">II</div>
                                            <div className="w-9/12 px-1 font-bosNormal font-bold ">
                                                <div className="flex flex-row items-center mb-3">
                                                    <span className="text-base leading-none !font-bosBold">KOMPETENSI INTI</span>/
                                                    <span className="italic font-bos leading-none mb-1">Core Competency</span>

                                                </div>
                                            </div>
                                            <div className="w-1/12 px-1 "></div>
                                            <div className="w-1/12 px-1 py-1"></div>
                                        </div>

                                        {/* Kompetensi Inti Items */}
                                        {pelatihan.MateriPelatihan.filter((item) => item.Deskripsi == 'Inti').map((materi, index) => (
                                            <div
                                                key={index}
                                                className="flex text-sm border-b border-gray-300"
                                            >
                                                <div className="w-1/12 px-1 text-center border-r border-gray-300">{index + 1}.</div>
                                                <div className="w-7/12 px-1 border-r border-gray-300">
                                                    <div className="flex flex-col justify-center mb-4">
                                                        <span className="text-lg !font-bosNormal not-italic font-normal leading-none">{generatedCurriculumCertificate(materi.NamaMateri).curr_indo}</span>
                                                        {
                                                            generatedCurriculumCertificate(materi.NamaMateri).curr_eng != "" && <span className="italic text-base font-bosItalic leading-none">{generatedCurriculumCertificate(materi.NamaMateri).curr_eng}</span>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="w-2/12 px-1 mb-3 text-center text-lg font-bosNormal border-r border-gray-300">{materi.JamTeory}</div>
                                                <div className="w-2/12 px-1 mb-3 text-center text-lg font-bosNormal">{materi.JamPraktek}</div>
                                            </div>
                                        ))}</> : <>  {/* Kompetensi Inti Title */}


                                        {/* Kompetensi Inti Items */}
                                        {pelatihan.MateriPelatihan.filter((item) => item.Deskripsi == '-').map((materi, index) => (
                                            <div
                                                key={index}
                                                className="flex text-sm border-b border-gray-300"
                                            >
                                                <div className="w-1/12 px-1 text-lg text-center border-r border-gray-300">{index + 1}.</div>
                                                <div className="w-7/12 px-1 border-r border-gray-300">
                                                    <div className="flex flex-col justify-center mb-4">
                                                        <span className="text-lg !font-bosNormal not-italic font-normal leading-none">{generatedCurriculumCertificate(materi.NamaMateri).curr_indo}</span>
                                                        {
                                                            generatedCurriculumCertificate(materi.NamaMateri).curr_eng != "" && <span className="italic text-base font-bosItalic leading-none">{generatedCurriculumCertificate(materi.NamaMateri).curr_eng}</span>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="w-2/12 px-1 mb-3 text-lg text-center font-bosNormal border-r border-gray-300">{materi.JamTeory}</div>
                                                <div className="w-2/12 px-1 mb-3 text-lg text-center font-bosNormal">{materi.JamPraktek}</div>
                                            </div>
                                        ))}</>
                                }


                                {/* Jumlah Jam */}
                                <div className="flex font-bosNormal font-bold border-b border-gray-300">
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
                                <div className="flex font-bosNormal font-bold">
                                    <div className="w-1/12 px-1 flex items-center justify-center border-r border-gray-300"></div>
                                    <div className="w-7/12 px-1 border-r border-gray-300">
                                        <div className="flex flex-row items-center mb-4">
                                            <span className="text-lg leading-none !font-bosBold">TOTAL JAM PELAJARAN</span>/
                                            <span className="italic font-bos leading-none">Total Hours</span>
                                        </div>
                                    </div>
                                    <div className="w-4/12 px-1 text-lg mb-3 text-center flex items-center justify-center">{totalHoursCertificateLvl.totalTheory + totalHoursCertificateLvl.totalPractice}</div>
                                </div>
                            </div>

                            {
                                pelatihan?.JenisProgram === "Sistem Jaminan Mutu" && <div className="flex gap-2 items-center w-full justify-end mt-2">
                                    <div className="flex flex-col  space-y-0 font-bos text-center items-center justify-center">
                                        <div className="flex w-full flex-col  space-y-0 items-center mt-2 text-center justify-center">
                                            <span className="font-bosNormal text-base leading-[105%] w-full flex items-center gap-1 text-center flex-col mt-5">
                                                <span>{generatedSignedCertificate(pimpinanLemdiklat).location}, 24 September 2025</span>
                                                <span className="w-full font-bosBold uppercase">{generatedSignedCertificate(pimpinanLemdiklat).status_indo}</span>
                                            </span>
                                            {isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <span className="leading-none font-bosItalic text-[0.85rem]">
                                                {generatedSignedCertificate(pimpinanLemdiklat).status_eng}
                                            </span>}

                                            <Image
                                                alt=""
                                                width={0}
                                                height={0}
                                                src={"/ttd-elektronik.png"}
                                                className="w-[230px] h-[100px] relative -z-10 pt-3 block"
                                            />

                                            <span className=" font-bosNormal font-bold text-lg -mt-3">
                                                {generatedSignedCertificate(pimpinanLemdiklat).name}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            }
                        </div >
                    </>
                </div>
            </div >
        );
    }
);

export function DialogFormatSISJAMU({
    children,
    pelatihan,
}: {
    children: ReactElement;
    pelatihan: PelatihanMasyarakat;
}) {
    const componentRef = useRef<HTMLDivElement | null>(null);
    const componentRefPage = useRef<HTMLDivElement | null>(null);

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="sm:max-w-[1425px]">
                    <DialogHeader>
                        <div className="flex gap-2 items-center">
                            <MdVerified className="text-3xl text-blue-500" />
                            <div className="flex flex-col">
                                <DialogDescription>
                                    Sertifikat Pelatihan
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="max-h-[700px] scale-95 flex flex-col gap-2 overflow-y-auto scroll-smooth">
                        <FormatSTTPL
                            ref={componentRef}
                            refPage={componentRefPage}
                            pelatihan={pelatihan}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
