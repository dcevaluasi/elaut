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
import { capitalizeWords, DESC_CERTIFICATE } from "@/constants/texts";
import { formatDateRange, formatDateRangeEnglish } from "@/utils/time";

const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });

const SertifikatNonKepelautan = React.forwardRef(
  (
    {
      pelatihan,
      userPelatihan,
      isPrinting,
      isSpesimen,
    }: {
      pelatihan: PelatihanMasyarakat;
      userPelatihan: UserPelatihan;
      isPrinting?: boolean;
      isSpesimen?: boolean;
    },
    ref: any
  ) => {
    const [peserta, setPeserta] = React.useState<User | null>(null);

    const [tanggalSertifikat, setTanggalSertifikat] = React.useState<string>('')

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

    React.useEffect(() => {
      handleFetchDetailPeserta();
    }, []);

    return (
      <div className=" flex-col gap-8 font-bos">
        <div
          ref={ref}
          className="w-full h-full  flex flex-col gap-4 items-center justify-center  px-10 py-14 rounded-md font-bos leading-[120%]"
        >
          <div className="w-full flex flex-col  gap-4 relative h-full items-center justify-center">
            <div className="flex flex-row  absolute top-0 right-0">
              <p className="text-base">
                No. Reg : {userPelatihan?.NoRegistrasi}
              </p>
            </div>

            <Image
              alt="Logo KKP"
              className="mx-auto w-20 absolute bottom-6 left-28"
              width={0}
              height={0}
              src="/qr-code/Cek_Sertifikat_ELAUT.png"
            />

            <div className="w-full flex flex-col gap-4 px-10 -mt-7 ">
              {!isPrinting && (
                <Image
                  alt="Logo KKP"
                  className="mx-auto w-28"
                  width={0}
                  height={0}
                  src="/logo-kkp-2.png"
                />
              )}

              <div className="flex flex-col gap-0 w-full items-center justify-center -mt-6">
                <h1 className="text-sm font-bosBold">
                  KEMENTERIAN KELAUTAN DAN PERIKANAN
                </h1>
                <p className="text-xs font-bosItalic">
                  MINISTRY OF MARINE AFFAIRS AND FISHERIES
                </p>
                <h1 className="text-base font-bosBold">
                  BADAN PENYULUHAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA KELAUTAN
                  DAN PERIKANAN
                </h1>
                <p className="text-xs font-bosItalic">
                  THE AGENCY FOR MARINE AND FISHERIES EXTENSION AND HUMAN
                  RESOURCES DEVELOPMENT
                </p>
                <h1 className="text-2xl font-black font-bosBold mt-1">
                  SERTIFIKAT
                </h1>
                <p className="text-base font-bosItalic">CERTIFICATE</p>

                <p className="text-lg font-bosBold">
                  Nomor : {userPelatihan?.NoSertifikat}
                </p>
              </div>

              <div className="flex w-full flex-col leading-[115%] items-start text-sm -mt-3 text-center font-bos">
                <p>
                  Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan
                  dan Perikanan berdasarkan Peraturan Pemerintah Nomor.62 Tahun
                  2014 tentang Penyelenggaraan Pendidikan, Pelatihan dan
                  Penyuluhan Perikanan, serta ketentuan pelaksanaannya
                  menyatakan bahwa :
                </p>
                <p className=" leading-none font-bosItalic text-[0.75rem]">
                  The Agency for Marine and Fisheries Extension and Human
                  Resources Development based on Government Regulation Number 62
                  of 2014 concerning the Implementation of Fisheries Education,
                  Training and Extension as well as its implementing provisions
                  States that :
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full  -mt-2">
                <table className="w-full h-fit" cellPadding={0} cellSpacing={0}>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col">
                      <p className="font-bos text-sm">Nama</p>
                      <p className="font-bos text-[0.75rem] -mt-2">Name</p>
                    </td>
                    <td className=" w-2/3 text-sm capitalize">: {capitalizeWords(userPelatihan!.Nama)}</td>
                  </tr>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col">
                      <p className="font-bos text-sm">
                        Nomor Induk Kependudukan (NIK)
                      </p>
                      <p className="font-bos text-[0.75rem] -mt-2">
                        {" "}
                        Population Identification Number (PIN)
                      </p>
                    </td>
                    <td className=" w-2/3 text-sm font-bos">
                      : {peserta != null ? peserta!.Nik : "-"}
                    </td>
                  </tr>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col">
                      <p className="font-bos text-sm">Tempat Tanggal Lahir</p>
                      <p className="font-bos text-[0.75rem] -mt-2">
                        {" "}
                        Place and date of birth
                      </p>
                    </td>
                    <td className=" w-2/3 text-sm capitalize">
                      : {peserta != null ? capitalizeWords(peserta?.TempatLahir) : "-"}
                      {", "}{" "}
                      {peserta?.TanggalLahir}{" "}
                    </td>
                  </tr>
                </table>
              </div>

              <div className="flex flex-col w-full items-center justify-center -mt-3">
                <h1 className="font-bosBold text-xl">
                  TELAH LULUS
                </h1>
                <h3 className="font-bosBold text-base italic">
                  Has Passed
                </h3>
              </div>

              <div className="flex w-full flex-col items-start -mt-2 text-center">
                <p className="text-sm leading-[115%]">
                  {DESC_CERTIFICATE[pelatihan!.Program].desc_ind} {formatDateRange(generateTanggalPelatihan(pelatihan?.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan?.TanggalBerakhirPelatihan))}
                </p>
                <p className="max-w-4xl leading-none font-bosItalic text-[0.75rem] mx-auto">
                  {DESC_CERTIFICATE[pelatihan!.Program].desc_eng} {formatDateRangeEnglish(generateTanggalPelatihan(pelatihan?.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan?.TanggalBerakhirPelatihan))}
                </p>
              </div>

              <div className="flex gap-2 items-center justify-center -mt-2">
                <div className="flex flex-col font-bos text-center items-center justify-center">
                  <div className="flex w-full flex-col items-cennter mt-2 text-center">
                    <p className="font-bos text-sm leading-[105%] w-full flex items-center gap-1">
                      Jakarta,{" "}{userPelatihan?.TanggalSertifikat}

                      <br /> {pelatihan?.TtdSertifikat}
                    </p>

                    <p className=" leading-none font-bosItalic text-[0.75rem]">
                      {pelatihan?.TtdSertifikat ==
                        "Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan"
                        ? "Chairman of the Agency for Marine and Fisheries Extension and Human Resources Development"
                        : "Director for Marine And Fisheries Training Center"}
                    </p>
                  </div>
                  {isSpesimen ? (
                    <Image
                      alt=""
                      width={0}
                      height={0}
                      src={"/ttd-elektronik.png"}
                      className="w-[200px] h-[80px] relative -z-10"
                    />
                  ) : (
                    <div className="h-[80px]"></div>
                  )}

                  <p className=" font-bosBold text-base">
                    {pelatihan?.TtdSertifikat ==
                      "Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan"
                      ? "Dr. I Nyoman Radiarta, S.Pi, M.Sc"
                      : "Dr. Lilly Aprilya Pregiwati, S.Pi., M.Si"}
                  </p>
                </div>
              </div>
            </div>

            {!isPrinting && (
              <div className="flex flex-row  absolute -bottom-12">
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

const SertifikatKepelautan = React.forwardRef(
  (
    {
      pelatihan,
      userPelatihan,
      isPrinting,
      isSpesimen,
    }: {
      pelatihan: PelatihanMasyarakat;
      userPelatihan: UserPelatihan;
      isPrinting?: boolean;
      isSpesimen?: boolean;
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
          className="w-full h-full  flex flex-col gap-4 items-center justify-center  px-10 py-14 rounded-md font-bos leading-[120%]"
        >
          <div className="w-full flex flex-col  gap-4 relative h-full items-center justify-center">
            <div className="flex flex-row  absolute top-0 right-0">
              <p className="text-sm leading-none not-italic">
                CERTIFICATE NO:
                <br /> 3319070001B2D024
              </p>
            </div>

            <div className="w-full flex flex-col gap-4 px-10 -mt-7 ">
              <div className="h-28 w-28"></div>

              <div className="flex flex-col gap-0 w-full items-center justify-center -mt-6">
                <div className="flex flex-col items-center justify-center leading-[.9rem] mb-1">
                  <h1 className="text-sm font-bosBold">REPUBLIK INDONESIA</h1>
                  <p className="text-sm font-bosItalic">
                    Republic of Indonesia
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center leading-[.9rem] mb-1">
                  <h1 className="text-sm font-bosBold">
                    KEMENTERIAN KELAUTAN DAN PERIKANAN
                  </h1>
                  <p className="text-sm font-bosItalic">
                    Ministry of Marine Affairs and Fisheries
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center leading-[.9rem] mb-1">
                  <h1 className="text-sm font-bosBold">
                    BADAN PENYULUHAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA
                  </h1>
                  <p className="text-sm font-bosItalic">
                    The Agency for Marine and Fisheries Extension and Human
                    Resources Development
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center leading-[.9rem] mb-1">
                  <h1 className="text-sm font-bosBold">
                    MENURUT PERATURAN MENTERI KELAUTAN DAN PERIKANAN REPUBLIK
                    INDONESIA NOMOR 33 TAHUN 2021
                  </h1>
                  <p className="text-sm font-bosItalic">
                    Under the provisions of Ministerial Regulation of Marine
                    Affairs and Fisheries, Republic of Indonesia Number 33 Year
                    2021
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center text-center leading-[.9rem] mt-1">
                  <h1 className="text-[12pt] font-bosBold">
                    SERTIFIKAT BASIC SAFETY TRAINING FISHERIES (BST-F) TINGKAT
                    II
                  </h1>
                  <p className="text-sm font-bosItalic">
                    Certificate of Proficiency <br /> Basic Safety Training
                    Fisheries Class II
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col leading-[115%] items-start text-sm -mt-3 text-left font-bos">
                <p>DENGAN INI MENERANGKAN BAHWA:</p>
                <p className=" leading-none font-bosItalic text-sm">
                  This is to certify that:
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full  -mt-2">
                <table className="w-full h-fit" cellPadding={0} cellSpacing={0}>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col">
                      <p className="font-bosBold text-sm">NAMA</p>
                      <p className="font-bos text-sm -mt-1">Name</p>
                    </td>
                    <td className=" w-2/3 text-sm uppercase">
                      :{" "}
                      <span className="font-bosBold text-[12pt] ml-5">
                        {userPelatihan!.Nama}
                      </span>
                    </td>
                  </tr>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col">
                      <p className="font-bosBold text-sm">
                        TEMPAT DAN TANGGAL LAHIR
                      </p>
                      <p className="font-bos text-sm -mt-1">
                        Place and Date of Birth{" "}
                      </p>
                    </td>
                    <td className=" w-2/3  uppercase text-[12pt]">
                      :{" "}
                      <span className="font-bosBold ml-5">
                        Jakarta, 04-08-2002
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <div className="flex w-full flex-col gap-3 leading-[115%] items-start text-sm -mt-3 text-left font-bos">
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
                    <p className='w-full flex gap-1 items-center'>
                      Jakarta,{" "}
                      {
                        pelatihan?.IsMengajukanPenerbitan != '' ? <>{
                          generateTanggalPelatihan('')}</> : <input
                          id="tanggalMulaiPelatihan"
                          type="date"
                          className="form-input w-full text-black border-gray-300 rounded-md"
                          required
                          min={new Date().toISOString().split("T")[0]}
                          value={tanggalSertifikat}
                          onChange={(
                            e: ChangeEvent<HTMLInputElement>
                          ) =>
                            setTanggalSertifikat(e.target.value)
                          }
                        />
                      }

                    </p>
                  </div>

                  <div className="col-span-5 flex flex-col items-center justify-center  px-4 text-center -mt-12">
                    <p className="font-bosBold text-[12pt] leading-none">
                      a.n. KEPALA BADAN PENYULUHAN DAN
                      <br />
                      PENGEMBANGAN SUMBER DAYA MANUSIA
                    </p>
                    <p className="font-bosItalic text-sm leading-none">
                      o.b. Chairman of The Agency for Marine and Fisheries
                      Extension and Human Resources Development
                    </p>
                    <p className="font-bosBold mt-2 text-[12pt] leading-none">
                      KEPALA PUSAT PELATIHAN KELAUTAN DAN PERIKANAN
                    </p>
                    <p className="font-bosItalic text-sm leading-nonee">
                      Director for Marine And Fisheries Training Center
                    </p>
                  </div>

                  <div className="col-span-5 flex flex-col items-center justify-end  px-4 -mt-5">
                    {isSpesimen ? (
                      <Image
                        alt=""
                        width={0}
                        height={0}
                        src={"/ttd-elektronik.png"}
                        className="w-fit h-[80px] relative -z-10"
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
              <div className="flex flex-row  absolute -bottom-5">
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
}: {
  children: ReactElement;
  userPelatihan: UserPelatihan;
  pelatihan: PelatihanMasyarakat;
}) {
  const componentRef = useRef(null);
  const [show, setShow] = React.useState<boolean>(false);
  const router = useRouter();
  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  const uploadPdf = async () => {
    setIsUploading(true);
    const html2pdf = (await import("html2pdf.js")).default;

    const element = componentRef.current;

    const opt = {
      margin: 0,
      filename: `${userPelatihan?.Nama}_${userPelatihan?.NoRegistrasi}.pdf`,
      image: { type: "png", quality: 10 },
      html2canvas: { scale: 1.9 },
      jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .outputPdf("blob")
      .then(async (pdfBlob: Blob) => {
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

        console.log("PDF Blob", pdfBlob);

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
            console.log("File uploaded successfully");
            Toast.fire({
              icon: "success",
              title: `Sertifikat sudah diupload ke server!`,
            });
            router.refresh();
          } else {
            Toast.fire({
              icon: "error",
              title: `Sertifikat gagal diupload ke server!`,
            });
            console.error("Failed to upload the file");
          }
          setIsUploading(false);
        } catch (error) {
          Toast.fire({
            icon: "error",
            title: `Sertifikat gagal diupload ke server! Terdapat masalah di server!`,
          });
          console.error("Error uploading the file:", error);
          setIsUploading(false);
        }
      });
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleUploadPDF = () => {
    uploadPdf();
  };

  React.useEffect(() => {
    if (typeof window !== "undefined" && show && componentRef.current) {
      const generatePDF = async () => {
        const html2pdf = (await import("html2pdf.js")).default;

        const element = componentRef.current;

        const opt = {
          margin: 0,
          filename: `${userPelatihan?.Nama}_${userPelatihan?.NoRegistrasi}_${userPelatihan?.NoSertifikat}.pdf`,
          image: { type: "jpg", quality: 10 }, // Lower quality for smaller size
          html2canvas: { scale: 0.9 }, // Reduce scale for smaller file size
          jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "landscape",
            compression: true, // Compress PDF for smaller size
          },
        };

        html2pdf()
          .from(element)
          .set(opt)
          .outputPdf("blob")
          .then(async (pdfBlob: Blob) => {
            // Optional: Check size of the PDF blob
            const fileSize = pdfBlob.size / 1024 / 1024; // Convert to MB
            console.log("PDF Blob Size:", fileSize, "MB");

            if (fileSize > 1) {
              // If file size is too large, you can notify the user or adjust settings further
              console.warn(
                "The file size exceeds 1MB. Consider further optimizations."
              );
            }
          });
      };

      generatePDF();
    }
  }, [show, userPelatihan]);

  const [isPrinting, setIsPrinting] = React.useState<boolean>(false);
  const [isSpesimen, setIsSpesimen] = React.useState<boolean>(false);

  return (
    <div>
      <Dialog>
        {userPelatihan!.NoSertifikat == "" ? (
          <DialogTrigger onClick={() => handleUploadPDF()}>
            {children}
          </DialogTrigger>
        ) : (
          <DialogTrigger asChild>{children}</DialogTrigger>
        )}

        <DialogContent className="sm:max-w-[1225px]">
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
                pelatihan={pelatihan}
                isSpesimen={isSpesimen}
                userPelatihan={userPelatihan}
                isPrinting={isPrinting}
              />
            ) : (
              <SertifikatNonKepelautan
                ref={componentRef}
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
                    {!isUploading && (
                      <Button
                        onClick={(e) => setIsSpesimen(!isSpesimen)}
                        className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white hover:text-white"
                      >
                        <>
                          <TbWritingSign />
                          {isSpesimen
                            ? "Undo Tambahkan Spesimen TTD"
                            : "Tambahkan Spesimen TTD"}
                        </>
                      </Button>
                    )}

                    {isSpesimen && (
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
