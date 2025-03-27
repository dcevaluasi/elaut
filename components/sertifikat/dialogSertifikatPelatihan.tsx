import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { ChangeEvent, ReactElement, useRef } from "react";
import { MdVerified } from "react-icons/md";
import { Button } from "../ui/button";
import {
  TbCloudDownload,
  TbCloudUpload,
  TbLink,
  TbWritingSign,
} from "react-icons/tb";
import { PelatihanMasyarakat } from "@/types/product";
import { useReactToPrint } from "react-to-print";

import { getCurrentDate } from "@/utils/sertifikat";

import axios from "axios";
import { elautBaseUrl } from "@/constants/urls";
import Cookies from "js-cookie";
import Image from "next/image";
import dynamic from "next/dynamic";
import { User, UserPelatihan } from "@/types/user";
import {
  generateTanggalPelatihan,
  generateTanggalPelatihanWithoutDay,
} from "@/utils/text";
import jsPDF from "jspdf";
import { BsFillPrinterFill } from "react-icons/bs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "../toast";
import { capitalizeWords, CURRICULLUM_CERTIFICATE } from "@/constants/texts";
import { formatDateRange, formatDateRangeEnglish } from "@/utils/time";
import { DESC_CERTIFICATE_COMPETENCE_FISHERIES } from "@/constants/serkom";
import { ESELON_1, ESELON_2, KA_BPPSDM, KA_PUSLAT_KP } from "@/constants/nomenclatures";
import html2canvas from "html2canvas";

const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });

const SertifikatNonKepelautan = React.forwardRef(
  (
    {
      pelatihan,
      userPelatihan,
      isPrinting,
      isSpesimen,
      refPage
    }: {
      pelatihan: PelatihanMasyarakat;
      userPelatihan: UserPelatihan;
      isPrinting?: boolean;
      isSpesimen?: boolean;
      refPage: any
    },
    ref: any,

  ) => {
    const [peserta, setPeserta] = React.useState<User | null>(null);

    const handleFetchDetailPeserta = async () => {
      try {
        const response = await axios.get(
          `${elautBaseUrl}/users/getUsersByIdNoJwt?id=${userPelatihan!.IdUsers}`
        );
        setPeserta(response.data);
        console.log({ response });
      } catch (error) {
        console.error("LEMDIK INFO: ", error);
      }
    };

    const calculateTotalHours = (data: any) => {
      let totalTheory = 0;
      let totalPractice = 0;

      Object.values(data).forEach((courses: any) => {
        courses.forEach(({ theory, practice }: { theory: number, practice: number }) => {
          totalTheory += theory;
          totalPractice += practice;
        });
      });

      return { totalTheory, totalPractice };
    };

    const totalHours = calculateTotalHours(CURRICULLUM_CERTIFICATE[pelatihan!.Program]);

    React.useEffect(() => {
      handleFetchDetailPeserta();
    }, []);

    return (
      <div className=" flex-col gap-8 font-bos">
        <div
          ref={ref}
          className="w-full h-full scale-95 flex flex-col gap-4 items-center justify-center  px-10  rounded-md font-bos leading-[120%]"
        >
          {/* Page 1 */}
          <div ref={refPage} className="pdf-page w-full flex flex-col  gap-4 relative h-[49.63rem] items-center justify-center">
            <div className="flex flex-row  absolute top-0 right-0">
              <p className="text-lg font-plusSansJakarta">
                No. Reg : {userPelatihan?.NoRegistrasi}
              </p>
            </div>

            <Image
              alt="Logo KKP"
              className="mx-auto w-20 absolute bottom-10 left-28"
              width={0}
              height={0}
              src="/qr-code/Cek_Sertifikat_ELAUT.png"
            />

            <div className="w-full flex flex-col space-y-0 px-10 -mt-16 ">
              {!isPrinting && (
                <Image
                  alt="Logo KKP"
                  className="mx-auto w-28"
                  width={0}
                  height={0}
                  src="/logo-kkp-2.png"
                />
              )}

              <div className="flex flex-col space-y-0 w-full h-fit items-center justify-center -mt-6">

                <div className="flex flex-col h-fit items-center justify-center space-y-0">
                  <h1 className="text-base font-plusSansJakarta font-bold">
                    KEMENTERIAN KELAUTAN DAN PERIKANAN
                  </h1>
                  <p className="text-base font-bosItalic">
                    MINISTRY OF MARINE AFFAIRS AND FISHERIES
                  </p>
                </div>
                <div className="flex flex-col h-fit items-center justify-center space-y-0">
                  <h1 className="text-lg font-plusSansJakarta font-bold">
                    BADAN PENYULUHAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA KELAUTAN
                    DAN PERIKANAN
                  </h1>
                  <p className="text-sm font-bosItalic">
                    THE AGENCY FOR MARINE AND FISHERIES EXTENSION AND HUMAN
                    RESOURCES DEVELOPMENT
                  </p>
                </div>

                <div className="flex flex-col h-fit items-center justify-center space-y-1">
                  <h1 className="text-3xl font-plusSansJakarta font-black leading-none">
                    SERTIFIKAT
                  </h1>
                  <p className="text-lg font-bosItalic">CERTIFICATE</p>
                </div>

                <p className="text-xl font-plusSansJakarta font-bold">
                  Nomor : {userPelatihan?.NoSertifikat}
                </p>
              </div>

              <div className="flex w-full flex-col space-y-0 max-w-7xl mx-auto items-start text-base  text-center font-bos h-fit mt-2">
                <span className="text-base leading-[115%] font-plusSansJakarta">
                  Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan
                  dan Perikanan berdasarkan Peraturan Pemerintah Nomor.62 Tahun
                  2014 tentang Penyelenggaraan Pendidikan, Pelatihan dan
                  Penyuluhan Perikanan, serta ketentuan pelaksanaannya
                  menyatakan bahwa :
                </span>
                <span className="max-w-4xl leading-none font-bosItalic text-[0.85rem] mx-auto">
                  The Agency for Marine and Fisheries Extension and Human
                  Resources Development based on Government Regulation Number 62
                  of 2014 concerning the Implementation of Fisheries Education,
                  Training and Extension as well as its implementing provisions
                  States that :
                </span>
              </div>

              <div className="flex flex-col space-y-0 w-full h-fit -mt-2">
                <table className="w-full h-fit" cellPadding={0} cellSpacing={0}>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col space-y-0">
                      <span className="font-plusSansJakarta text-base">Nama</span>
                      <span className="font-bos italic text-[0.85rem] -mt-2">Name</span>
                    </td>
                    <td className=" w-2/3 text-base font-plusSansJakarta uppercase">: {capitalizeWords(userPelatihan!.Nama)}</td>
                  </tr>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col  space-y-0">
                      <span className="text-base font-plusSansJakarta">
                        Nomor Induk Kependudukan (NIK)
                      </span>
                      <span className="font-bos italic text-[0.85rem] -mt-2">
                        {" "}
                        Population Identification Number (PIN)
                      </span>
                    </td>
                    <td className=" w-2/3 text-base font-plusSansJakarta">
                      : {peserta != null ? peserta!.Nik : "-"}
                    </td>
                  </tr>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col space-y-0">
                      <span className="text-base font-plusSansJakarta">Tempat Tanggal Lahir</span>
                      <span className="font-bos italic text-[0.85rem] -mt-2">
                        {" "}
                        Place and date of birth
                      </span>
                    </td>
                    <td className=" w-2/3 text-base font-plusSansJakarta capitalize">
                      : {peserta != null ? capitalizeWords(peserta?.TempatLahir) : "-"}
                      {", "}{" "}
                      {peserta?.TanggalLahir}{" "}
                    </td>
                  </tr>
                </table>
              </div>

              <div className="flex flex-col space-y-0 w-full h-fit items-center justify-center -mt-1 mb-2">
                <h1 className="font-plusSansJakarta font-black text-2xl leading-none">
                  {
                    userPelatihan?.IsActice === 'LULUS' ? ' TELAH LULUS' : 'TELAH MENGIKUTI'
                  }
                </h1>
                <h3 className="font-plusSansJakarta font-bold text-lg italic">
                  {
                    userPelatihan?.IsActice === 'LULUS' ? ' Has Passed' : 'Has Attended'
                  }
                </h3>
              </div>

              <div className="flex w-full flex-col space-y-0 max-w-7xl mx-auto items-start text-sm -mt-3 text-center font-bos h-fit">
                <span className="text-base leading-[115%] font-plusSansJakarta">
                  {DESC_CERTIFICATE_COMPETENCE_FISHERIES[pelatihan!.Program].desc_ind} {formatDateRange(generateTanggalPelatihan(pelatihan?.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan?.TanggalBerakhirPelatihan))}
                </span>
                <span className="max-w-6xl leading-none font-bos italic text-[0.85rem] mx-auto">
                  {DESC_CERTIFICATE_COMPETENCE_FISHERIES[pelatihan!.Program].desc_eng} {formatDateRangeEnglish(generateTanggalPelatihan(pelatihan?.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan?.TanggalBerakhirPelatihan))}
                </span>
              </div>

              <div className="flex gap-2 items-center justify-center -mt-2">
                <div className="flex flex-col  space-y-0 font-bos text-center items-center justify-center">
                  <div className="flex w-full flex-col  space-y-0 items-center mt-2 text-center justify-center">
                    <span className="font-plusSansJakarta text-base leading-[105%] w-full flex items-center gap-1">
                      Jakarta,{" "}{userPelatihan?.TanggalSertifikat}

                      <br /> {pelatihan?.TtdSertifikat}
                    </span>

                    <span className="leading-none font-bosItalic text-[0.85rem]">
                      {pelatihan?.TtdSertifikat ==
                        ESELON_1.fullName
                        ? ESELON_1.fullNameEng
                        : ESELON_2.fullNameEng}
                    </span>

                    {userPelatihan?.StatusPenandatangan == 'Spesimen' ? (
                      <Image
                        alt=""
                        width={0}
                        height={0}
                        src={"/ttd-elektronik.png"}
                        className="w-[230px] h-[100px] relative -z-10 pt-4 block"
                      />
                    ) : (
                      <div className="h-[80px]"></div>
                    )}

                    <span className=" font-plusSansJakarta font-bold text-lg -mt-3">
                      {pelatihan?.TtdSertifikat ==
                        ESELON_1.fullName
                        ? KA_BPPSDM
                        : KA_PUSLAT_KP}
                    </span>
                  </div>

                </div>
              </div>
            </div>


          </div>

          {/* Page 2 */}

          <div className="pdf-page w-full flex flex-col  gap-4  h-full items-center justify-center mt-36 break-before-auto relative">
            <div className="flex flex-row justify-center items-center">
              <div className="flex flex-row gap-2 items-center h-fit">
                <div className="flex flex-col text-center space-y-0 h-fit items-center justify-center w-full">
                  <p className="font-plusSansJakarta font-bold text-lg max-w-2xl w-full uppercase leading-none">
                    Materi {pelatihan?.NamaPelatihan} tanggal {formatDateRange(generateTanggalPelatihan(pelatihan?.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan?.TanggalBerakhirPelatihan))}
                  </p>
                  <p className="font-bos text-base max-w-2xl leading-none -mt-2">{pelatihan?.NamaPelathanInggris} {formatDateRangeEnglish(generateTanggalPelatihan(pelatihan?.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan?.TanggalBerakhirPelatihan))}</p>

                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="flex border border-black  text-center font-plusSansJakarta font-bold">
                <div className="w-1/12 p-2 border-black border">NO</div>
                <div className="w-5/12 p-2 border-black border"><div className="flex flex-col justify-center">
                  <span className="text-base ">MATERI</span>
                  <span className="italic font-bos">COURSE</span>
                </div></div>
                <div className="w-6/12 p-2 border-black border"><div className="flex flex-col justify-center">
                  <span className="text-base">ALOKASI WAKTU (@45 Menit)</span>
                  <span className="italic font-bos">Time Allocation (@45 Minutes)</span>
                </div></div>
              </div>
              <div className="flex border border-black  text-center font-plusSansJakarta font-bold">
                <div className="w-6/12 border border-black"></div>
                <div className="w-3/12 p-2 border-black border">
                  <div className="flex flex-col justify-center">
                    <span className="text-base">TEORI</span>
                    <span className="italic font-bos">Theory</span>
                  </div>
                </div>
                <div className="w-3/12 p-2 border-black border"><div className="flex flex-col justify-center">
                  <span className="text-base">PRAKTEK</span>
                  <span className="italic font-bos">Practice</span>
                </div></div>
              </div>
              <div className="flex border border-black ">
                <div className="w-1/12 p-2 font-plusSansJakarta font-bold text-center border-black border">I</div>
                <div className="w-5/12 p-2 font-plusSansJakarta font-bold border-black border">
                  <div className="flex flex-col justify-start">
                    <span className="text-base">KOMPETENSI UMUM</span>
                    <span className="italic font-bos">General Competency</span>
                  </div>
                </div>
                <div className="w-3/12 p-2 border-black border"></div>
                <div className="w-3/12 p-2 border-black border"></div>
              </div>
              {CURRICULLUM_CERTIFICATE[pelatihan.Program].UMUM.map((materi, index) => (
                <div key={index} className="flex border border-black  text-sm">
                  <div className="w-1/12 p-2 text-center border-black border">{index + 1}.</div>
                  <div className="w-5/12 p-2 border-black border">
                    <div className="flex flex-col justify-center">
                      <span className="text-base !font-plusSansJakarta not-italic font-normal">{materi.name_ind}</span>
                      <span className="italic font-bosItalic">{materi.name_eng}</span>
                    </div>
                  </div>
                  <div className="w-3/12 p-2 text-center border-black border font-plusSansJakarta">{materi.theory}</div>
                  <div className="w-3/12 p-2 text-center border-black border font-plusSansJakarta">{materi.practice}</div>
                </div>
              ))}
              <div className="flex border border-black ">
                <div className="w-1/12 p-2 font-plusSansJakarta font-bold text-center border-black border">II</div>
                <div className="w-5/12 p-2 font-plusSansJakarta font-bold border-black border">
                  <div className="flex flex-col justify-start">
                    <span className="text-base">KOMPETENSI INTI</span>
                    <span className="italic font-bos">Core Competency</span>
                  </div>
                </div>
                <div className="w-3/12 p-2 border-black border"></div>
                <div className="w-3/12 p-2 border-black border"></div>
              </div>
              {CURRICULLUM_CERTIFICATE[pelatihan.Program].INTI.slice(0, 5).map((materi, index) => (
                <div key={index} className={`flex border-black border text-sm`}>
                  <div className="w-1/12 p-2 text-center border-black border">{index + 1}.</div>
                  <div className="w-5/12 p-2 border-black border">
                    <div className="flex flex-col justify-center">
                      <span className="text-base !font-plusSansJakarta not-italic font-normal">{materi.name_ind}</span>
                      <span className="italic font-bosItalic">{materi.name_eng}</span>
                    </div>
                  </div>
                  <div className="w-3/12 p-2 text-center border-black border font-plusSansJakarta">{materi.theory}</div>
                  <div className="w-3/12 p-2 text-center border-black border font-plusSansJakarta">{materi.practice}</div>
                </div>
              ))}
              {
                CURRICULLUM_CERTIFICATE[pelatihan.Program].INTI.length <= 4 && <>
                  <div className="flex  border-black border font-plusSansJakarta font-bold">
                    <div className="w-6/12 p-2 text-center border-black border">
                      <div className="flex flex-col ">
                        <span className="text-base">JUMLAH JAM PELAJARAN</span>
                        <span className="italic font-bos">Training Hours</span>
                      </div>
                    </div>
                    <div className="w-3/12 p-2 text-center border-black border font-plusSansJakarta">{totalHours.totalTheory}</div>
                    <div className="w-3/12 p-2 text-center border-black border font-plusSansJakarta">{totalHours.totalPractice}</div>
                  </div>
                  <div className="flex  border-black border font-plusSansJakarta font-bold">
                    <div className="w-6/12 p-2 text-center border-black border">
                      <div className="flex flex-col ">
                        <span className="text-base ">TOTAL JAM PELAJARAN</span>
                        <span className="italic font-bos">Total Hours</span>
                      </div>
                    </div>
                    <div className="w-6/12 p-2 text-center border-black border">{totalHours.totalTheory + totalHours.totalPractice}</div>
                  </div></>
              }

            </div>
          </div >

          {/* Page 3 */}

          {
            CURRICULLUM_CERTIFICATE[pelatihan.Program].INTI.length >= 5 && <div className="pdf-page w-full flex flex-col  gap-4  h-full items-center justify-center mt-36 break-before-auto relative">
              <div className="w-full">

                {CURRICULLUM_CERTIFICATE[pelatihan.Program].INTI.slice(5, CURRICULLUM_CERTIFICATE[pelatihan.Program].INTI.length).map((materi, index) => (
                  <div key={index} className={`flex border-black border text-sm`}>
                    <div className="w-1/12 p-2 text-center border-black border">{6 + index}.</div>
                    <div className="w-5/12 p-2 border-black border">
                      <div className="flex flex-col justify-center">
                        <span className="text-base !font-plusSansJakarta not-italic font-normal">{materi.name_ind}</span>
                        <span className="italic font-bosItalic">{materi.name_eng}</span>
                      </div>
                    </div>
                    <div className="w-3/12 p-2 text-center border-black border">{materi.theory}</div>
                    <div className="w-3/12 p-2 text-center border-black border">{materi.practice}</div>
                  </div>
                ))}
                <div className="flex  border-black border font-plusSansJakarta font-bold">
                  <div className="w-6/12 p-2 text-center border-black border">
                    <div className="flex flex-col ">
                      <span className="text-base">JUMLAH JAM PELAJARAN</span>
                      <span className="italic font-bos">Training Hours</span>
                    </div>
                  </div>
                  <div className="w-3/12 p-2 text-center border-black border">{totalHours.totalTheory}</div>
                  <div className="w-3/12 p-2 text-center border-black border">{totalHours.totalPractice}</div>
                </div>
                <div className="flex  border-black border font-plusSansJakarta font-bold">
                  <div className="w-6/12 p-2 text-center border-black border">
                    <div className="flex flex-col ">
                      <span className="text-base">TOTAL JAM PELAJARAN</span>
                      <span className="italic font-bos">Total Hours</span>
                    </div>
                  </div>
                  <div className="w-6/12 p-2 text-center border-black border">{totalHours.totalTheory + totalHours.totalPractice}</div>
                </div>

              </div>
            </div >
          }

        </div >
      </div >
    );
  }
);

const SertifikatKepelautan = React.forwardRef(
  (
    {
      pelatihan,
      userPelatihan,
      isPrinting,
      isSpesimen,
      refPage
    }: {
      pelatihan: PelatihanMasyarakat;
      userPelatihan: UserPelatihan;
      isPrinting?: boolean;
      isSpesimen?: boolean;
      refPage: any
    },
    ref: any
  ) => {
    const [peserta, setPeserta] = React.useState<User | null>(null);

    const handleFetchDetailPeserta = async () => {
      try {
        const response = await axios.get(
          `${elautBaseUrl}/users/getUsersByIdNoJwt?id=${userPelatihan!.IdUsers}`
        );
        setPeserta(response.data);
        console.log({ response });
      } catch (error) {
        console.error("LEMDIK INFO: ", error);
      }
    };


    const [tanggalSertifikat, setTanggalSertifikat] = React.useState<string>('')
    React.useEffect(() => {
      handleFetchDetailPeserta();
    }, []);

    return (
      <div className=" flex-col gap-8 font-bos">
        <div
          ref={ref}
          className="w-full h-full  flex flex-col gap-4 items-center justify-center  px-10  rounded-md font-bos leading-[120%]"
        >
          <div ref={refPage} className="w-full flex flex-col  gap-4 relative h-full items-center justify-center py-14">
            <div className="flex flex-row  absolute top-0 right-0">
              <p className="text-sm leading-none not-italic">
                CERTIFICATE NO:
                <br /> 3319070001B2D024
              </p>
            </div>

            <div className="w-full flex flex-col h-fit space-y-0 px-10 -mt-7 ">
              <div className="h-28 w-28"></div>

              <div className="flex flex-col space-y-0 h-fit  w-full items-center justify-center -mt-6">
                <div className="flex flex-col items-center h-fit   justify-center leading-[.9rem] space-y-0">
                  <h1 className="text-sm font-plusSansJakarta font-bold">REPUBLIK INDONESIA</h1>
                  <p className="text-sm font-bosItalic">
                    Republic of Indonesia
                  </p>
                </div>
                <div className="flex flex-col items-center h-fit  justify-center leading-[.9rem] space-y-0">
                  <h1 className="text-sm font-plusSansJakarta font-bold">
                    KEMENTERIAN KELAUTAN DAN PERIKANAN
                  </h1>
                  <p className="text-sm font-bosItalic">
                    Ministry of Marine Affairs and Fisheries
                  </p>
                </div>
                <div className="flex flex-col items-center h-fit  justify-center leading-[.9rem] space-y-0">
                  <h1 className="text-sm font-plusSansJakarta font-bold">
                    BADAN PENYULUHAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA
                  </h1>
                  <p className="text-sm font-bosItalic">
                    The Agency for Marine and Fisheries Extension and Human
                    Resources Development
                  </p>
                </div>
                <div className="flex flex-col items-center h-fit  justify-center leading-[.9rem] space-y-0">
                  <h1 className="text-sm font-plusSansJakarta font-bold">
                    MENURUT PERATURAN MENTERI KELAUTAN DAN PERIKANAN REPUBLIK
                    INDONESIA NOMOR 33 TAHUN 2021
                  </h1>
                  <p className="text-sm font-bosItalic">
                    Under the provisions of Ministerial Regulation of Marine
                    Affairs and Fisheries, Republic of Indonesia Number 33 Year
                    2021
                  </p>
                </div>

                <div className="flex flex-col items-center h-fit  justify-center text-center leading-[.9rem] space-y-0">
                  <h1 className="text-[12pt] font-plusSansJakarta font-bold">
                    SERTIFIKAT BASIC SAFETY TRAINING FISHERIES (BST-F) TINGKAT
                    II
                  </h1>
                  <p className="text-sm font-bosItalic">
                    Certificate of Proficiency <br /> Basic Safety Training
                    Fisheries Class II
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col space-y-0 leading-[115%] items-start text-sm -mt-3 text-left font-bos">
                <p>DENGAN INI MENERANGKAN BAHWA:</p>
                <p className=" leading-none font-bosItalic text-sm">
                  This is to certify that:
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full space-y-0  -mt-2">
                <table className="w-full h-fit" cellPadding={0} cellSpacing={0}>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col space-y-0">
                      <p className="font-plusSansJakarta font-bold text-sm">NAMA</p>
                      <p className="font-bos text-sm -mt-1">Name</p>
                    </td>
                    <td className=" w-2/3 text-sm uppercase">
                      :{" "}
                      <span className="font-plusSansJakarta font-bold text-[12pt] ml-5">
                        {userPelatihan!.Nama}
                      </span>
                    </td>
                  </tr>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col space-y-0">
                      <p className="font-plusSansJakarta font-bold text-sm">
                        TEMPAT DAN TANGGAL LAHIR
                      </p>
                      <p className="font-bos text-sm -mt-1">
                        Place and Date of Birth{" "}
                      </p>
                    </td>
                    <td className=" w-2/3  uppercase text-[12pt]">
                      :{" "}
                      <span className="font-plusSansJakarta font-bold ml-5 uppercase">
                        {peserta != null ? peserta?.TempatLahir.toUpperCase() : "-"}
                        {", "}{" "}
                        {peserta?.TanggalLahir}{" "}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <div className="flex w-full flex-col leading-[115%] items-start text-sm -mt-3 text-left font-bos space-y-1 h-fit">
                <p className="text-xs leading-none font-bos">
                  telah menyelesaikan pendidikan dan/atau pelatihan dan/atau
                  bimbingan teknis, dan lulus evaluasi berdasarkan Peraturan
                  Menteri Kelautan dan Perikanan Republik Indonesia Nomor 33
                  Tahun 2021, Bab V Tata Kelola Pengawakan Kapal Perikanan
                </p>
                <p className=" leading-none font-bosItalic text-xs ">
                  has completed the approved education and/or approved training
                  and/or approved technical guidance, and has passed the
                  evaluation under the provisions of Ministerial Regulation of
                  Marine Affairs and Fisheries, Republic of Indonesia Number 33
                  Year 2021, Chapter V on Fishery Vessel Crews Arrangements
                </p>

                <p className=" leading-none font-bosItalic text-xs ">
                  untuk memiliki Sertifikat Basic Safety Training Fisheries
                  Class II <br />
                  holding the Certificate of Proficiency for Basic Safety
                  Training Fisheries Class II
                </p>
              </div>

              <div className="w-full min-h-[175px] -mt-5">
                <div className="grid grid-cols-12 gap-4 ">
                  <div className="col-span-3 flex flex-col items-center justify-center row-span-3  p-4">
                    <p className="text-sm leading-none not-italic">
                      Tanda Tangan Pemilik
                      <br /> Signature of the holder:
                    </p>
                    <div className="mt-4">&nbsp;</div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center row-span-4  p-4">
                    <img
                      src="https://akapi.kkp.go.id/uploads/sertifikat/202411301797486997.png"
                      alt="Sertifikat"
                      className="w-24 h-24"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-center row-span-4  p-4">
                    <div className="border border-gray-400 w-[90px] h-[120px] flex items-center justify-center">
                      <span>FOTO</span>
                    </div>
                  </div>

                  <div className="col-span-5 flex items-center text-sm justify-center  p-4 mb-4 -mt-5">
                    <p className='w-full flex gap-1 justify-center text-center items-center'>
                      Jakarta,{" "}{userPelatihan?.TanggalSertifikat}

                    </p>
                  </div>

                  <div className="col-span-5 flex flex-col items-center justify-center  px-4 text-center -mt-12 space-y-0">
                    <p className="font-plusSansJakarta font-bold text-[12pt] leading-none">
                      a.n. KEPALA BADAN PENYULUHAN DAN
                      <br />
                      PENGEMBANGAN SUMBER DAYA MANUSIA
                    </p>
                    <p className="font-bosItalic text-sm leading-none">
                      o.b. {ESELON_1.fullNameEng}
                    </p>
                    <p className="font-plusSansJakarta font-bold mt-2 text-[12pt] leading-none">
                      KEPALA PUSAT PELATIHAN KELAUTAN DAN PERIKANAN
                    </p>
                    <p className="font-bosItalic text-sm leading-nonee">
                      {ESELON_2.fullName}
                    </p>
                  </div>

                  <div className="col-span-5 flex flex-col space-y-0 items-center justify-end  px-4 -mt-5">
                    {userPelatihan?.StatusPenandatangan == 'Spesimen' ? (
                      <Image
                        alt=""
                        width={0}
                        height={0}
                        src={"/ttd-elektronik.png"}
                        className="w-[230px] h-[80px] relative -z-10"
                      />
                    ) : (
                      <div className="h-[80px]"></div>
                    )}
                    <p className=" font-bos text-sm -mt-1">
                      Dr. Lilly Aprilya Pregiwati, S.Pi., M.Si
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {!isPrinting && (
              <div className="flex flex-row  absolute bottom-5">
                <p className="text-[0.75rem] leading-[100%] text-center max-w-2xl">
                  Dokumen ini telah ditandatangani secara elektronik menggunakan
                  sertifikat elektronik yang telah diterbitkan oleh Balai
                  Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export function DialogSertifikatPelatihan({
  children,
  userPelatihan,
  pelatihan,
  handleFetchingData
}: {
  children: ReactElement;
  userPelatihan: UserPelatihan;
  pelatihan: PelatihanMasyarakat;
  handleFetchingData?: any
}) {
  const componentRef = useRef<HTMLDivElement | null>(null);
  const componentRefPage = useRef<HTMLDivElement | null>(null);

  const [show, setShow] = React.useState<boolean>(false);
  const router = useRouter();
  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  const uploadPdf = async () => {
    setIsUploading(true);
    const html2pdf = (await import("html2pdf.js")).default;

    if (!componentRef.current || !componentRefPage.current) {
      console.error("Component reference is null");
      setIsUploading(false);
      return;
    }

    const element = componentRef.current;
    const elementPage = componentRefPage.current;

    // Calculate height dynamically
    const firstPageHeight = elementPage.offsetHeight + 180; // Fixed first page height
    const contentHeight = element.scrollHeight; // Total content height
    const remainingHeight = contentHeight - firstPageHeight;

    // If there's more content, dynamically adjust second page height
    const dynamicPageHeight = remainingHeight > 0 ? remainingHeight + 50 : firstPageHeight;

    const opt = {
      margin: [0, 10, 10, 10],
      filename: `${userPelatihan?.Nama}_${userPelatihan?.NoRegistrasi}.pdf`,
      pagebreak: { mode: ["avoid-all", "css"] }, // Ensure proper page breaks
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#fff",
      },
      jsPDF: {
        unit: "px",
        format: [element.offsetWidth, firstPageHeight], // First page height fixed
        orientation: "landscape",
      },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .toPdf()
      .outputPdf("blob")
      .then(async (pdfBlob: Blob) => {
        const MAX_SIZE_MB = 3;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

        if (pdfBlob.size > MAX_SIZE_BYTES) {
          Toast.fire({
            icon: "error",
            title: `Ukuran file terlalu besar! Maksimum ${MAX_SIZE_MB} MB.`,
          });
          setIsUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append(
          "IdUserPelatihan",
          String(userPelatihan?.IdUserPelatihan ?? "")
        );
        formData.append(
          "fileSertifikat",
          pdfBlob,
          `${userPelatihan?.Nama}_${userPelatihan?.NoRegistrasi}.pdf`
        );

        try {
          const response = await axios.post(
            elautBaseUrl + "/lemdik/saveSertifikat",
            formData,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.status === 200) {
            Toast.fire({
              icon: "success",
              title: `Sertifikat sudah diupload ke server!`,
            });
            handleFetchingData();
            router.refresh();
          } else {
            Toast.fire({
              icon: "error",
              title: `Sertifikat gagal diupload ke server!`,
            });
            console.error("Failed to upload the file");
          }
        } catch (error) {
          Toast.fire({
            icon: "error",
            title: `Sertifikat gagal diupload ke server! Terdapat masalah di server!`,
          });
          console.error("Error uploading the file:", error);
        }
        setIsUploading(false);
      });
  };




  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleUploadPDF = () => {
    uploadPdf();
  };

  // React.useEffect(() => {
  //   if (typeof window !== "undefined" && show && componentRef.current) {
  //     const generatePDF = async () => {
  //       const html2pdf = (await import("html2pdf.js")).default;

  //       const element = componentRef.current;

  //       const opt = {
  //         margin: [10, 10, 10, 10], // Small margins for better fit
  //         filename: `${userPelatihan?.Nama}_${userPelatihan?.NoRegistrasi}.pdf`,
  //         // pagebreak: { mode: "avoid-all" }, // Prevent splitting important elements
  //         html2canvas: {
  //           scale: 2, // Higher scale for better quality
  //           useCORS: true, // Load external styles correctly
  //           logging: false,
  //           backgroundColor: "#fff",
  //         },
  //         jsPDF: {
  //           unit: "px",
  //           format: [element.offsetWidth, element.offsetHeight], // Dynamically adjust to content
  //           orientation: "landscape",
  //         },
  //       };

  //       html2pdf()
  //         .from(element)
  //         .set(opt)
  //         .outputPdf("blob")
  //         .then(async (pdfBlob: Blob) => {
  //           // Optional: Check size of the PDF blob
  //           const fileSize = pdfBlob.size / 1024 / 1024; // Convert to MB
  //           console.log("PDF Blob Size:", fileSize, "MB");

  //           if (fileSize > 1) {
  //             // If file size is too large, you can notify the user or adjust settings further
  //             console.warn(
  //               "The file size exceeds 1MB. Consider further optimizations."
  //             );
  //           }
  //         });
  //     };

  //     generatePDF();
  //   }
  // }, [show, userPelatihan]);

  const [isPrinting, setIsPrinting] = React.useState<boolean>(false);
  const [isSpesimen, setIsSpesimen] = React.useState<boolean>(false);

  return (
    <div>
      <Dialog>
        {userPelatihan!.NoSertifikat == "" ? (
          <DialogTrigger className="w-full" onClick={() => handleUploadPDF()}>
            {children}
          </DialogTrigger>
        ) : (
          <DialogTrigger asChild>{children}</DialogTrigger>
        )}

        <DialogContent className="sm:max-w-[1425px]">
          <DialogHeader>
            <div className="flex gap-2 items-center">
              <MdVerified className="text-3xl text-blue-500" />
              <div className="flex flex-col">
                <DialogTitle>{pelatihan?.NoSertifikat}</DialogTitle>
                <DialogDescription>
                  Sertifikat Pelatihan {pelatihan?.NamaPelatihan}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="max-h-[700px] scale-95 flex flex-col gap-2 overflow-y-auto scroll-smooth">
            {pelatihan?.JenisSertifikat == "Kepelautan" ? (
              <SertifikatKepelautan
                ref={componentRef}
                refPage={componentRefPage}
                pelatihan={pelatihan}
                isSpesimen={isSpesimen}
                userPelatihan={userPelatihan}
                isPrinting={isPrinting}
              />
            ) : (
              <SertifikatNonKepelautan
                ref={componentRef}
                refPage={componentRefPage}
                pelatihan={pelatihan}
                isSpesimen={isSpesimen}
                userPelatihan={userPelatihan}
                isPrinting={isPrinting}
              />
            )}
          </div>
          {userPelatihan != null && (
            <DialogFooter>
              {pelatihan!.StatusPenerbitan == "Done" && (
                <>
                  {" "}
                  <Button
                    type="submit"
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-500"
                  >
                    <TbLink />
                    Salin Tautan
                  </Button>
                  <Button
                    type="submit"
                    onClick={(e) => handlePrint()}
                    className="flex items-center gap-1 bg-gray-700 hover:bg-gray-700"
                  >
                    <BsFillPrinterFill />
                    Print Sertifikat
                  </Button>
                  <Link
                    href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${userPelatihan!.FileSertifikat
                      }`}
                    target="_blank"
                    type="submit"
                    className="bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-900/90 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <TbCloudDownload />
                    Download
                  </Link>
                </>
              )}

              {usePathname().includes("lemdiklat") &&
                userPelatihan!.FileSertifikat == "" && (
                  <>


                    {userPelatihan.StatusPenandatangan == 'Spesimen' && (
                      <Button
                        onClick={(e) => handleUploadPDF()}
                        type="submit"
                        disabled={isUploading}
                        className="flex items-center gap-1"
                      >
                        {isUploading ? (
                          <>Uploading...</>
                        ) : (
                          <>
                            <TbCloudUpload />
                            Generate PDF dan Ajukan Penerbitan
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
