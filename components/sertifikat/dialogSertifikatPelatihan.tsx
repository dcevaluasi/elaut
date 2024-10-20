import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { ReactElement, useRef } from "react";
import { MdVerified } from "react-icons/md";
import { Button } from "../ui/button";
import { TbCloudDownload, TbCloudUpload, TbLink } from "react-icons/tb";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import { useReactToPrint } from "react-to-print";

import { getCurrentDate } from "@/utils/sertifikat";

import axios from "axios";
import { elautBaseUrl } from "@/constants/urls";
import Cookies from "js-cookie";
import Image from "next/image";
import dynamic from "next/dynamic";
import { User } from "@/types/user";
import {
  generateTanggalPelatihan,
  generateTanggalPelatihanWithoutDay,
} from "@/utils/text";
import jsPDF from "jspdf";
import { BsFillPrinterFill } from "react-icons/bs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "../toast";

const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });

const SertifikatPage1 = React.forwardRef(
  (
    {
      pelatihan,
      userPelatihan,
      isPrinting,
    }: {
      pelatihan: PelatihanMasyarakat;
      userPelatihan: UserPelatihan;
      isPrinting?: boolean;
    },
    ref: any
  ) => {
    const totalJamTeory = pelatihan?.MateriPelatihan?.reduce(
      (total, materi) => {
        return total + parseInt(materi.JamTeory);
      },
      0
    );

    const totalJamPraktek = pelatihan?.MateriPelatihan?.reduce(
      (total, materi) => {
        return total + parseInt(materi.JamPraktek);
      },
      0
    );

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

    React.useEffect(() => {
      handleFetchDetailPeserta();
      // document.addEventListener("contextmenu", function (e) {
      //   e.preventDefault();
      // });
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
                  Nomor : B.{userPelatihan?.NoSertifikat}
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
                <p className=" leading-none font-bosItalic text-[0.65rem]">
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
                      <p className="font-bos text-[0.65rem] -mt-2">Name</p>
                    </td>
                    <td className=" w-2/3 text-sm">: {userPelatihan!.Nama}</td>
                  </tr>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col">
                      <p className="font-bos text-sm">
                        Nomor Induk Kependudukan (NIK)
                      </p>
                      <p className="font-bos text-[0.65rem] -mt-2">
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
                      <p className="font-bos text-[0.65rem] -mt-2">
                        {" "}
                        Place and date of birth
                      </p>
                    </td>
                    <td className=" w-2/3 text-sm">
                      : {peserta != null ? peserta?.TempatLahir : "-"}
                      {", "}{" "}
                      {peserta != null
                        ? generateTanggalPelatihanWithoutDay(
                            peserta?.TanggalLahir
                          )
                        : "-"}{" "}
                    </td>
                  </tr>
                </table>
              </div>

              <div className="flex flex-col w-full items-center justify-center -mt-3">
                <h1 className="font-bosBold text-xl">
                  {userPelatihan!.PostTest < 65
                    ? "TELAH MENGIKUTI"
                    : "TELAH LULUS"}
                </h1>
                <h3 className="font-bosBold text-base italic">
                  {userPelatihan!.PostTest < 65 ? "HAS FOLLOWED" : "HAS PASSED"}
                </h3>
              </div>

              <div className="flex w-full flex-col items-start -mt-2 text-center">
                <p className="text-sm leading-[115%]">
                  {pelatihan?.DeskripsiSertifikat}
                </p>
                <p className=" leading-none font-bosItalic text-[0.65rem]">
                  In the Training on Good Aquaculture Practices held in
                  collaboration between the Marine and Fisheries Training Center
                  – the Agency for Marine and Fisheries Extension and Human
                  Resources Development on 19 - 21 February 2024.
                </p>
              </div>

              <div className="flex gap-2 items-center justify-center -mt-2">
                <div className="flex flex-col font-bos text-center items-center justify-center">
                  <div className="flex w-full flex-col items-cennter mt-2 text-center">
                    <p className="font-bos text-sm leading-[105%]">
                      Jakarta, {getCurrentDate()} <br />{" "}
                      {pelatihan?.TtdSertifikat}
                    </p>

                    <p className=" leading-none font-bosItalic text-[0.65rem]">
                      {pelatihan?.TtdSertifikat ==
                      "Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan"
                        ? "Chairman of the Agency for Marine and Fisheries Extension and Human Resources Development"
                        : "Director for Marine And Fisheries Training Center"}
                    </p>
                  </div>
                  {!isPrinting && (
                    <Image
                      alt=""
                      width={0}
                      height={0}
                      src={"/ttd-elektronik.png"}
                      className="w-fit h-[80px] relative -z-10 mt-2"
                    />
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

            {/* <div className="w-full  flex flex-col gap-4  px-10 py-10 rounded-md font-cambria leading-[120%] !h-[120vh]">
              <div className="flex flex-row justify-center items-center">
                <div className="flex flex-row gap-2 items-center">
                  <div className="flex flex-col font-cambria text-center">
                    <p className="font-extrabold max-w-md w-full italic">
                      {pelatihan?.NamaPelatihan}
                    </p>
                    <p className="font-extrabold max-w-3xl">
                      19 – 21 February 2024
                    </p>
                  </div>
                </div>
              </div>

              <table
                border={1}
                className="text-center border border-black-2 p-2 rounded-md"
              >
                <tr>
                  <td
                    rowSpan={2}
                    className="border border-black-2 p-2 font-extrabold text-lg"
                  >
                    NO.
                  </td>
                  <td
                    rowSpan={2}
                    className="border border-black-2 p-2 font-extrabold text-lg"
                  >
                    COURSES
                  </td>
                  <td
                    colSpan={3}
                    className="border border-black-2 p-2 font-extrabold text-lg"
                  >
                    JAM PELATIHAN
                  </td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2 font-extrabold text-lg">
                    T
                  </td>
                  <td className="border border-black-2 p-2 font-extrabold text-lg">
                    P
                  </td>
                </tr>
                {pelatihan?.MateriPelatihan?.map((materi, index) => (
                  <tr key={index}>
                    <td className="border border-black-2 p-2">{index + 1}.</td>
                    <td className="border border-black-2 p-2 text-left">
                      {materi.NamaMateri}
                    </td>
                    <td className="border border-black-2 p-2">
                      {materi.JamTeory}
                    </td>
                    <td className="border border-black-2 p-2">
                      {materi.JamPraktek}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td
                    colSpan={2}
                    className="font-extrabold text-lg border border-black-2 p-2"
                  >
                    JUMLAH TOTAL
                  </td>
                  <td className="border border-black-2 p-2 font-extrabold">
                    {totalJamTeory}
                  </td>
                  <td className="border border-black-2 p-2 font-extrabold">
                    {totalJamPraktek}
                  </td>
                </tr>
              </table>
            </div>

            <div className="flex flex-row  absolute -bottom-12">
              <p className="text-[0.65rem] leading-[100%] text-center max-w-2xl">
                Dokumen ini telah ditandatangani secara elektronik menggunakan
                sertifikat elektronik yang telah diterbitkan oleh Balai
                Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara
              </p>
            </div> */}

            {!isPrinting && (
              <div className="flex flex-row  absolute -bottom-12">
                <p className="text-[0.65rem] leading-[100%] text-center max-w-2xl">
                  Dokumen ini telah ditandatangani secara elektronik menggunakan
                  sertifikat elektronik yang telah diterbitkan oleh Balai
                  Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara
                </p>
              </div>
            )}
          </div>

          {/* <div className="w-full flex flex-col  gap-4 relative h-full items-center justify-center">
            <div className="w-full flex flex-col gap-4 px-10 pt-8 ">
              <div className="flex flex-col gap-0 w-full items-center text-center justify-center mt-12">
                <h1 className="text-base max-w-xl font-bosBold">
                  Materi Pelatihan Cara Pembuatan Pakan Ikan yang Baik (CPPIB)
                  bagi Peserta Didik di Satuan Pendidikan Kelautan dan
                  Perikanan, tanggal 27 – 31 Mei 2024
                </h1>
                <p className=" leading-none font-bosItalic text-[0.65rem] max-w-xl">
                  Good Aquculture Feed Manufacturing Practices (GfMP) Training
                  For Students in the Marine and Fisheries Education Units 27 –
                  31 May 2024
                </p>
              </div>

              <table
                border={1}
                className="text-center border border-black-2 p-2 rounded-md"
              >
                <tr>
                  <td
                    rowSpan={2}
                    className="border border-black-2 font-extrabold text-base font-bosBold"
                  >
                    NO
                  </td>
                  <td
                    rowSpan={2}
                    className="border border-black-2 font-extrabold text-base w-2/3"
                  >
                    <h2 className="font-bosBold text-base">MATA PELATIHAN</h2>
                    <p className="font-bosItalic text-xs">COURSE</p>
                  </td>
                  <td
                    colSpan={3}
                    className="border border-black-2 font-extrabold text-lg"
                  >
                    <h2 className="font-bosBold text-base">
                      ALOKASI WAKTU
                      <br />
                      (@ 45 menit)
                    </h2>
                    <p className="font-bosItalic text-xs">Duration @45 Menit</p>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black-2 w-[100px] font-extrabold text-lg">
                    <h2 className="font-bosBold text-base">TEORI</h2>
                    <p className="font-bosItalic text-xs">Theory</p>
                  </td>
                  <td className="border border-black-2 w-[100px] font-extrabold text-lg">
                    <h2 className="font-bosBold text-base">PRAKTEK</h2>
                    <p className="font-bosItalic text-xs">Practice</p>
                  </td>
                </tr>
                {pelatihan?.MateriPelatihan?.map((materi, index) => (
                  <tr key={index}>
                    <td className="border border-black-2 p-2">{index + 1}.</td>
                    <td className="border border-black-2 p-2 text-left">
                      {materi.NamaMateri}
                    </td>
                    <td className="border border-black-2 p-2">
                      {materi.JamTeory}
                    </td>
                    <td className="border border-black-2 p-2">
                      {materi.JamPraktek}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td
                    colSpan={2}
                    className="font-extrabold text-lg border border-black-2 p-2"
                  >
                    JUMLAH TOTAL
                  </td>
                  <td className="border border-black-2 p-2 font-extrabold">
                    {totalJamTeory}
                  </td>
                  <td className="border border-black-2 p-2 font-extrabold">
                    {totalJamPraktek}
                  </td>
                </tr>
              </table>
            </div>

            <div className="flex flex-row  absolute -bottom-12">
              <p className="text-[0.65rem] leading-[100%] text-center max-w-2xl">
                Dokumen ini telah ditandatangani secara elektronik menggunakan
                sertifikat elektronik yang telah diterbitkan oleh Balai
                Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara
              </p>
            </div>
          </div> */}
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
                <DialogTitle>B.{pelatihan?.NoSertifikat}</DialogTitle>
                <DialogDescription>
                  Sertifikat Pelatihan {pelatihan?.NamaPelatihan}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="max-h-[500px] scale-95 flex flex-col gap-2 overflow-y-auto scroll-smooth">
            <SertifikatPage1
              ref={componentRef}
              pelatihan={pelatihan}
              userPelatihan={userPelatihan}
              isPrinting={isPrinting}
            />
          </div>
          {userPelatihan != null && (
            <DialogFooter>
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
                href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${
                  userPelatihan!.FileSertifikat
                }`}
                target="_blank"
                type="submit"
                className="bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-900/90 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50"
              >
                <TbCloudDownload />
                Download
              </Link>
              {usePathname().includes("lemdiklat") &&
                userPelatihan!.FileSertifikat == "" && (
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
                        Upload
                      </>
                    )}
                  </Button>
                )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* {show ? (
        <SertifikatPage1
          ref={componentRef}
          pelatihan={pelatihan}
          userPelatihan={userPelatihan}
        />
      ) : (
        <></>
      )} */}
    </div>
  );
}
