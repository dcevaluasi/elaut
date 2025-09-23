
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import QRCode from "react-qr-code";
import { MateriPelatihan, PelatihanMasyarakat } from "@/types/product";
import axios from "axios";
import { elautBaseUrl } from "@/constants/urls";
import Cookies from "js-cookie";
import Image from "next/image";
import { User, UserPelatihan } from "@/types/user";
import {
  formatName,
  generateTanggalPelatihan,
} from "@/utils/text";
import Toast from "../toast";
import { capitalizeWords, CURRICULLUM_CERTIFICATE } from "@/constants/texts";
import { formatDateRange, formatDateRangeEnglish } from "@/utils/time";
import { ESELON_1, ESELON_2, EselonKey, ESELONS } from "@/constants/nomenclatures";
import { generatedCurriculumCertificate, generatedDescriptionCertificate, generatedSignedCertificate, generatedStatusCertificate, isEnglishFormat } from "@/utils/certificates";
import CertificateHeader from "../certificates/CertificateHeader";
import CertificateDescription from "../certificates/CertificateDescription";

const SertifikatNonKepelautan = React.forwardRef(
  (
    {
      pelatihan,
      userPelatihan,
      refPage
    }: {
      pelatihan: PelatihanMasyarakat;
      userPelatihan: UserPelatihan;
      refPage: any
    },
    ref: any,
  ) => {
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

    const calculateTotalHoursWithMateri = (data: MateriPelatihan[]) => {
      let totalTheory = 0;
      let totalPractice = 0;

      data.forEach((course) => {
        // Convert string hours to numbers
        const theory = parseFloat(course.JamTeory) || 0;
        const practice = parseFloat(course.JamPraktek) || 0;

        totalTheory += theory;
        totalPractice += practice;
      });

      return { totalTheory, totalPractice };
    };

    const totalHoursCertificateLvl = calculateTotalHoursWithMateri(pelatihan?.MateriPelatihan || []);

    React.useEffect(() => {
      handleFetchDetailPeserta();
    }, []);

    const pimpinanLemdiklat = Cookies.get('PimpinanLemdiklat') || ""

    return (
      <div className=" flex-col gap-8 font-bos">
        <div
          ref={ref}
          className={`w-full h-full scale-95 flex flex-col gap-4 items-center justify-center  px-10  rounded-md font-bos leading-[120%] ${userPelatihan!.IsActice.includes("SEBAGAI") ? "pb-[100px] " : "pb-0"}`}
        >
          <div ref={refPage} className={`pdf-page w-full flex flex-col  gap-4 relative  items-center justify-center ${userPelatihan!.IsActice.includes("SEBAGAI") ? "h-[55rem] " : "h-[49.63rem]"}`}>
            <div className="flex flex-row  absolute top-0 right-0">
              <p className="text-lg font-bosNormal">
                No. STTPL : {userPelatihan?.NoRegistrasi}
              </p>
            </div>

            <div className={`mx-auto w-20 absolute ${isEnglishFormat(pelatihan?.DeskripsiSertifikat) ? 'bottom-0' : 'bottom-20'} left-28`}>
              <QRCode
                size={280}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={`https://elaut-bppsdm.kkp.go.id/layanan/cek-sertifikat/${userPelatihan!.NoRegistrasi}`}
                viewBox={`0 0 280 280`}
              />
            </div>

            <div className="w-full flex flex-col space-y-0 px-10 mt-10 ">
              <Image
                alt="Logo KKP"
                className="mx-auto w-28"
                width={0}
                height={0}
                src="/logo-kkp-2.png"
              />

              <CertificateHeader deskripsi={pelatihan?.DeskripsiSertifikat} />

              <div className="flex flex-col space-y-0 w-full h-fit -mt-1">
                <table className="w-full h-fit" cellPadding={0} cellSpacing={0}>
                  <tr className="w-full">
                    <td className={`font-bos w-full flex flex-col ${isEnglishFormat(pelatihan?.DeskripsiSertifikat) ? 'space-y-0' : 'space-y-2 mb-2'}`}>
                      <span className="font-bosNormal text-base">Nama</span>
                      {
                        isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <span className="font-bos italic text-[0.85rem] -mt-2">Name</span>
                      }

                    </td>
                    <td className=" w-2/3 text-base font-bosNormal ">: {formatName(userPelatihan!.Nama)}</td>
                  </tr>
                  <tr className="w-full">
                    <td className={`font-bos w-full flex flex-col ${isEnglishFormat(pelatihan?.DeskripsiSertifikat) ? 'space-y-0' : 'space-y-2 mb-2'}`}>
                      <span className="text-base font-bosNormal">
                        NIK/NIP/PASPOR
                      </span>
                      {
                        isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <span className="font-bos italic text-[0.85rem] -mt-2">
                          {" "}
                          Identification Number
                        </span>
                      }

                    </td>
                    <td className=" w-2/3 text-base font-bosNormal">
                      : {peserta != null ? peserta!.Nik : "-"}
                    </td>
                  </tr>
                  <tr className="w-full">
                    <td className={`font-bos w-full flex flex-col ${isEnglishFormat(pelatihan?.DeskripsiSertifikat) ? 'space-y-0' : 'space-y-2 mb-2'}`}>
                      <span className="text-base font-bosNormal">Tempat Tanggal Lahir</span>
                      {
                        isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <span className="font-bos italic text-[0.85rem] -mt-2">
                          {" "}
                          Place and date of birth
                        </span>
                      }

                    </td>
                    <td className=" w-2/3 text-base font-bosNormal capitalize">
                      : {peserta != null ? capitalizeWords(peserta?.TempatLahir) : "-"}
                      {", "}
                      {peserta?.TanggalLahir}{" "}
                    </td>
                  </tr>
                  <tr className="w-full">
                    <td className={`font-bos w-full flex flex-col ${isEnglishFormat(pelatihan?.DeskripsiSertifikat) ? 'space-y-0' : 'space-y-2 mb-2'}`}>
                      <span className="text-base font-bosNormal">Institusi/Organisasi</span>
                      {
                        isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <span className="font-bos italic text-[0.85rem] -mt-2">
                          {" "}
                          Institution/Organization
                        </span>
                      }

                    </td>
                    <td className=" w-2/3 text-base font-bosNormal uppercase">
                      : {peserta != null ? capitalizeWords(peserta?.Status) : "-"}
                    </td>
                  </tr>
                </table>
              </div>

              <div className="flex flex-col space-y-0 w-full h-fit items-center justify-center -mt-1 mb-2">
                <h1 className="font-bosBold font-black text-2xl leading-none">
                  {
                    userPelatihan?.IsActice == "" ? "-" : generatedStatusCertificate(userPelatihan?.IsActice).status_indo
                  }
                </h1>
                {
                  isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <h3 className="font-bosNormal font-bold text-lg italic">
                    {
                      userPelatihan?.IsActice == "" ? "-" : generatedStatusCertificate(userPelatihan?.IsActice).status_eng
                    }
                  </h3>
                }
              </div>

              <>
                <CertificateDescription pelatihan={pelatihan!} />

                <div className="flex gap-2 items-center justify-center mt-2">
                  <div className="flex flex-col  space-y-0 font-bos text-center items-center justify-center">
                    <div className="flex w-full flex-col  space-y-0 items-center mt-2 text-center justify-center">
                      <span className="font-bosNormal text-base leading-[105%] w-full flex items-center gap-1">
                        {
                          !pelatihan?.TtdSertifikat.includes('Kepala Balai') ? 'Jakarta' : generatedSignedCertificate(pimpinanLemdiklat).location},{" "}{userPelatihan?.TanggalSertifikat}
                        <br />   {
                          !pelatihan?.TtdSertifikat.includes('Kepala Balai') ? pelatihan?.TtdSertifikat : generatedSignedCertificate(pimpinanLemdiklat).status_indo
                        }
                      </span>
                      {
                        isEnglishFormat(pelatihan?.DeskripsiSertifikat) && <span className="leading-none font-bosItalic text-[0.85rem]">
                          {
                            !pelatihan?.TtdSertifikat.includes('Kepala Balai') ? ESELONS[pelatihan?.TtdSertifikat as EselonKey].fullNameEng : generatedSignedCertificate(pimpinanLemdiklat).status_eng
                          }
                        </span>
                      }

                      {userPelatihan?.StatusPenandatangan == 'Spesimen' || userPelatihan?.StatusPenandatangan == 'Revisi' ? (
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

                      <span className=" font-bosNormal font-bold text-lg -mt-3">
                        {
                          !pelatihan?.TtdSertifikat.includes('Kepala Balai') ? ESELONS[pelatihan?.TtdSertifikat as EselonKey].currentPerson : generatedSignedCertificate(pimpinanLemdiklat).name
                        }
                      </span>
                    </div>

                  </div>
                </div>
              </>
            </div>

            {
              peserta?.Foto == 'https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/' ? <></> : <div
                style={{
                  width: "135px",
                  height: "195px",
                  position: "absolute",
                  bottom: "-75px",
                  right: "100px",
                  border: "1px solid #9f9f9f",
                  borderRadius: "15px",
                  overflow: "hidden",   // <- This is the key!
                  padding: "3px",
                  zIndex: -10,
                }}
              >
                <img
                  src={peserta?.Foto || ""}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

            }
          </div>
          {
            pelatihan?.MateriPelatihan?.length != 0 && <>
              {
                !userPelatihan?.IsActice.includes('SEBAGAI') && <div className={`pdf-page w-full flex flex-col  gap-4  h-full items-center justify-center ${pelatihan?.MateriPelatihan.length < 7 ? 'mt-72' : 'mt-48'} break-before-auto relative`}>
                  <div className="flex flex-row justify-center items-center mb-6">
                    <div className="flex flex-row gap-2 items-center h-fit">
                      <div className="flex flex-col text-center space-y-0 h-fit items-center justify-center w-full gap-0">
                        <p className="font-bosBold text-2xl max-w-4xl w-full uppercase leading-none">
                          Materi {pelatihan?.NamaPelatihan}, tanggal {formatDateRange(generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan))}
                        </p>
                        {
                          (pelatihan?.NamaPelathanInggris != "") && <p className="font-bos text-xl max-w-4xl leading-none -mt-3">{pelatihan?.NamaPelathanInggris}, {formatDateRangeEnglish(generateTanggalPelatihan(pelatihan!.TanggalMulaiPelatihan), generateTanggalPelatihan(pelatihan!.TanggalBerakhirPelatihan))}</p>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="w-full border border-gray-400 rounded-md overflow-hidden">
                    {/* Header Baris 1 */}
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
                </div >
              }
            </>
          }
        </div>
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
          <div ref={refPage} className="w-full flex flex-col  gap-4 relative h-full items-center justify-center4">
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
                  <h1 className="text-sm font-bosNormal font-bold">REPUBLIK INDONESIA</h1>
                  <p className="text-sm font-bosItalic">
                    Republic of Indonesia
                  </p>
                </div>
                <div className="flex flex-col items-center h-fit  justify-center leading-[.9rem] space-y-0">
                  <h1 className="text-sm font-bosNormal font-bold">
                    KEMENTERIAN KELAUTAN DAN PERIKANAN
                  </h1>
                  <p className="text-sm font-bosItalic">
                    Ministry of Marine Affairs and Fisheries
                  </p>
                </div>
                <div className="flex flex-col items-center h-fit  justify-center leading-[.9rem] space-y-0">
                  <h1 className="text-sm font-bosNormal font-bold">
                    BADAN PENYULUHAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA
                  </h1>
                  <p className="text-sm font-bosItalic">
                    The Agency for Marine and Fisheries Extension and Human
                    Resources Development
                  </p>
                </div>
                <div className="flex flex-col items-center h-fit  justify-center leading-[.9rem] space-y-0">
                  <h1 className="text-sm font-bosNormal font-bold">
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
                  <h1 className="text-[12pt] font-bosNormal font-bold">
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
                      <p className="font-bosNormal font-bold text-sm">NAMA</p>
                      <p className="font-bos text-sm -mt-1">Name</p>
                    </td>
                    <td className=" w-2/3 text-sm uppercase">
                      :{" "}
                      <span className="font-bosNormal font-bold text-[12pt] ml-5">
                        {userPelatihan!.Nama}
                      </span>
                    </td>
                  </tr>
                  <tr className="w-full">
                    <td className="font-bos w-full flex flex-col space-y-0">
                      <p className="font-bosNormal font-bold text-sm">
                        TEMPAT DAN TANGGAL LAHIR
                      </p>
                      <p className="font-bos text-sm -mt-1">
                        Place and Date of Birth{" "}
                      </p>
                    </td>
                    <td className=" w-2/3  uppercase text-[12pt]">
                      :{" "}
                      <span className="font-bosNormal font-bold ml-5 uppercase">
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
                    <p className="font-bosNormal font-bold text-[12pt] leading-none">
                      a.n. KEPALA BADAN PENYULUHAN DAN
                      <br />
                      PENGEMBANGAN SUMBER DAYA MANUSIA
                    </p>
                    <p className="font-bosItalic text-sm leading-none">
                      o.b. {ESELON_1.fullNameEng}
                    </p>
                    <p className="font-bosNormal font-bold mt-2 text-[12pt] leading-none">
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


export type DialogSertifikatHandle = {
  uploadPdf: () => Promise<void>;
};

type Props = {
  userPelatihan: UserPelatihan;
  pelatihan: PelatihanMasyarakat;
  handleFetchingData?: () => void;
};

const DialogSertifikatPelatihan = forwardRef<DialogSertifikatHandle, Props>(
  ({ userPelatihan, pelatihan }, ref) => {
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

    useImperativeHandle(ref, () => ({ uploadPdf }), []);

    return (
      <div className="max-h-[700px] scale-95 bg-white flex flex-col gap-2 overflow-y-auto scroll-smooth">
        <SertifikatNonKepelautan
          ref={componentRef}
          refPage={componentRefPage}
          pelatihan={pelatihan}
          userPelatihan={userPelatihan}
        />
      </div>
    );
  }
);

DialogSertifikatPelatihan.displayName = "DialogSertifikatPelatihan";
export default DialogSertifikatPelatihan;
