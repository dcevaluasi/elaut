"use client";

import { Progress } from "@/components/ui/progress";

import Image from "next/image";
import Link from "next/link";
import React, { FormEvent, ReactElement } from "react";
import { FiSearch, FiSlack } from "react-icons/fi";
import {
  TbBroadcast,
  TbBuildingBank,
  TbCalendarUser,
  TbClockHour2,
  TbCloudDownload,
  TbLink,
  TbMap2,
} from "react-icons/tb";

import {
  FaChevronRight,
  FaFilePdf,
  FaPlaceOfWorship,
  FaRupiahSign,
} from "react-icons/fa6";

import Footer from "@/components/ui/footer";
import { MdOutlineAppRegistration, MdVerified } from "react-icons/md";
import FormRegistrationTraining from "@/components/dashboard/users/formRegistrationTraining";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DetailPelatihanMasyarakat,
  PelatihanMasyarakat,
} from "@/types/product";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import {
  convertDate,
  createSlug,
  extractLastSegment,
  truncateText,
} from "@/utils";
import Toast from "@/components/toast";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { HashLoader } from "react-spinners";
import LogoIntegrated from "@/components/logoIntegrated";
import Features from "@/components/features";
import FeaturesDiklatKepelautan from "@/components/features-diklat-kepelautan";
import { formatToRupiah, replaceUrl } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { elautBaseUrl } from "@/constants/urls";
import { hitungHariPelatihan } from "@/utils/pelatihan";
import { PiQuestion, PiQuestionBold } from "react-icons/pi";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProgressBarPesertaPelatihan } from "@/components/micro-components";
import { generateTanggalPelatihan } from "@/utils/text";

function page() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const pathname = usePathname();
  const id = extractLastSegment(pathname);
  const token = Cookies.get("XSRF081");

  const getJenisProgram = (program: string) => {
    if (program === "Awak Kapal Perikanan") {
      return "akp";
    } else if (program === "Perikanan") {
      return "perikanan";
    } else {
      return "kelautan";
    }
  };

  const [progress, setProgress] = React.useState(13);

  const [data, setData] = React.useState<DetailPelatihanMasyarakat | null>(
    null
  );
  const [loading, setLoading] = React.useState<boolean>(true);

  const handleFetchingPublicTrainingDataById = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/getPelatihanUser?idPelatihan=${id}`
      );
      console.log({ response });
      setLoading(false);
      setData(response.data!);
    } catch (error) {
      setLoading(false);
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  const [isOpenRegistrationCommand, setIsOpenRegistrationCommand] =
    React.useState(false);

  const handleRegistration = () => {
    if (data!.StatusApproval == "Selesai") {
      Toast.fire({
        icon: "error",
        title: `Yah pelatihan ini sudah berakhir, cari pelatihan lainnya sobat ELAUT!`,
      });
    } else {
      if (Cookies.get("XSRF081")) {
        setIsRegistrasi(true);
      } else {
        setIsOpenRegistrationCommand(true);
      }
    }
  };

  const jenisProgram = Cookies.get("JenisProgram");
  const [dataRelated, setDataRelated] = React.useState<PelatihanMasyarakat[]>(
    []
  );

  const handleFetchingPublicTrainingData = async () => {
    setLoading(true);

    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihan?${jenisProgram}`
      );
      setLoading(false);
      console.log({ response });

      if (response.data!.data != null) {
        const filteredAndSortedData = response
          .data!.data.filter(
            (item: PelatihanMasyarakat) => item.JenisProgram === jenisProgram
          )
          .sort((a: PelatihanMasyarakat, b: PelatihanMasyarakat) => {
            const dateA = new Date(a.TanggalMulaiPelatihan);
            const dateB = new Date(b.TanggalMulaiPelatihan);

            // Check the StatusApproval condition
            if (
              a.StatusApproval === "Selesai" &&
              b.StatusApproval !== "Selesai"
            ) {
              return 1; // 'Selesai' should be placed later
            }
            if (
              a.StatusApproval !== "Selesai" &&
              b.StatusApproval === "Selesai"
            ) {
              return -1; // 'Selesai' should be placed later
            }

            // Sort by date in ascending order
            return dateA.getTime() - dateB.getTime(); // Ascending order
          })
          .slice(0, 2); // Limit to the first 3 items (or change to 4 if needed)

        setDataRelated(filteredAndSortedData);
      } else {
        setDataRelated([]);
      }
    } catch (error) {
      console.error("Error posting training data:", error);
      setLoading(false);
      throw error;
    }
  };

  const [nik, setNik] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [captcha, setCaptcha] = React.useState<string | null>();
  const recaptchaRef = React.createRef();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = React.useState<string>("");

  const nowPath = usePathname();

  React.useEffect(() => {
    handleFetchingPublicTrainingDataById();
    if (!Cookies.get("XSRF081")) {
      Cookies.set("LastPath", nowPath);
    }
    const timer = setTimeout(() => {
      handleFetchingPublicTrainingData();

      setLoading(false);
      setProgress(66);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const [isRegistrasi, setIsRegistrasi] = React.useState(false);

  return (
    <section className="relative w-full mt-36">
      {loading ? (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <HashLoader color="#338CF5" size={60} />
        </div>
      ) : data != null ? (
        <div className="flex gap-2 w-full md:max-w-7xl mx-auto px-3 md:px-0">
          <div className="w-full pb-5 md:pb-8 flex flex-col ">
            <h1 className="h2 text-4xl md:text-[3rem] mb-2 font-calsans leading-[100%] max-w-3xl">
              {data!.NamaPelatihan}
            </h1>

            <div className="w-full flex gap-10 flex-col md:flex-row">
              <div
                className={`flex flex-col w-full md:w-[60%] ${
                  isRegistrasi && "md:w-[100%]"
                }`}
              >
                <div className="relative w-full">
                  <div className="w-full h-fit relative">
                    <Image
                      className="w-full rounded-3xl h-[250px] md:h-[350px] object-cover"
                      alt=""
                      src={replaceUrl(data?.FotoPelatihan!)}
                      width={0}
                      height={0}
                    />
                    <div className="flex w-full top-0 absolute h-[250px] md:h-[350px] bg-gradient-to-r opacity-40 from-blue-500 to-teal-400 bg-opacity-20 rounded-3xl"></div>
                  </div>

                  <div className="w-fit absolute top-4 right-4 flex gap-1">
                    <div className="text-sm font-medium px-4 py-3 bg-blue-500 rounded-3xl text-white">
                      {data!.PenyelenggaraPelatihan}
                    </div>
                    <div className="text-sm font-medium px-4 py-3 bg-blue-500 rounded-3xl text-white">
                      {data!.HargaPelatihan == 0
                        ? "Gratis"
                        : formatToRupiah(data!.HargaPelatihan)}
                    </div>
                    <div className="text-sm font-medium px-4 py-3 bg-blue-500 rounded-3xl text-white">
                      {data!.BidangPelatihan}
                    </div>
                    {data!.StatusApproval == "Selesai" && (
                      <div className="text-sm font-medium px-4 py-3 bg-blue-500 rounded-3xl text-white">
                        {data!.StatusApproval}
                      </div>
                    )}
                  </div>
                </div>

                {isRegistrasi ? (
                  <></>
                ) : (
                  <>
                    <div className="flex md:hidden flex-col gap-3 w-full my-3">
                      <div className="flex flex-col gap-1 ">
                        <table>
                          <tr>
                            <td className="text-gray-600">
                              <HiOutlineUserGroup className="text-lg w-6" />
                            </td>
                            <td>
                              <p className="text-base text-gray-600">
                                <span className="font-normal">
                                  Kuota Peserta :{" "}
                                </span>
                                {data!.KoutaPelatihan}{" "}
                                <Progress
                                  value={progress}
                                  className="w-[60%]"
                                />
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-gray-600">
                              <TbCalendarUser className="text-lg w-6" />
                            </td>
                            <td>
                              <p className="text-base text-gray-600 flex w-full items-center gap-1">
                                Tanggal Pelaksanaan :{" "}
                                {data!.TanggalMulaiPelatihan}
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-gray-600">
                              <TbMap2 className="text-lg w-6" />
                            </td>
                            <td>
                              <p className="text-base text-gray-600 flex w-full items-center gap-1">
                                Lokasi Pelatihan : {data!.LokasiPelatihan}
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-gray-600">
                              <TbBroadcast className="text-lg w-6" />
                            </td>
                            <td>
                              <p className="text-base text-gray-600 flex w-full items-center gap-1">
                                Pelaksanaan Pelatihan :{" "}
                                {data!.PelaksanaanPelatihan}
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <div className="flex flex-col gap-2">
                        {data!.StatusApproval != "Selesai" &&
                          (!Cookies.get("XSRF081") ? (
                            <Link
                              href={"/registrasi"}
                              className="text-base font-medium px-4 py-3 hover:cursor-pointer items-center justify-center text-center flex gap-1 bg-blue-500 rounded-3xl text-white"
                            >
                              <MdOutlineAppRegistration /> Daftar Pelatihan
                            </Link>
                          ) : (
                            <button
                              onClick={(e) => handleRegistration()}
                              className="text-base font-medium px-4 py-3 hover:cursor-pointer items-center justify-center text-center flex gap-1 bg-blue-500 rounded-3xl text-white"
                            >
                              <MdOutlineAppRegistration /> Daftar Pelatihan
                            </button>
                          ))}

                        <Link
                          target="_blank"
                          href={data!.SilabusPelatihan!}
                          title={`Silabus ${data!.NamaPelatihan!}`}
                          className="text-base font-medium px-4 py-3 hover:cursor-pointer items-center justify-center text-center flex gap-1 bg-teal-400 rounded-3xl text-white"
                        >
                          <FaFilePdf /> Unduh Silabus Pelatihan
                        </Link>
                        {data!.StatusApproval == "Selesai" && (
                          <p className="italic text-xs">
                            Pelatihan telah selesai diselenggarakan
                          </p>
                        )}
                      </div>
                    </div>

                    {/* <Tab /> */}

                    <div
                      dangerouslySetInnerHTML={{
                        __html: data!.DetailPelatihan || "",
                      }}
                      className="prose prose-gray prose-p:text-justify prose-list-decimal w-full mt-2 md:mt-9 mx-0 px-0"
                    ></div>
                  </>
                )}
              </div>

              {/* {isRegistrasi && ( */}
              {
                <div className="flex flex-col gap-2 w-[30%]">
                  <div className="md:flex hidden flex-col gap-6 ">
                    <div className="flex flex-col gap-2 -mt-1">
                      <h1 className="text-black font-bold text-3xl font-calsans leading-[110%]">
                        Ikuti Pelatihan
                      </h1>
                      <p className="text-base text-gray-600 max-w-4xl -mt-3">
                        Segera daftarkan dirimu dan jadilah SDM Kelautan dan
                        Perikanan Unggul!
                      </p>
                      <div className="w-[100px] h-1 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <table>
                          <tr>
                            <td className="text-gray-600">
                              <TbCalendarUser className="text-lg w-6" />
                            </td>
                            <td>
                              <p className="text-base text-gray-600">
                                <span className="font-semibold">
                                  Tanggal Pendaftaran :{" "}
                                </span>
                                {generateTanggalPelatihan(
                                  data!.TanggalMulaiPendaftaran
                                )}{" "}
                                <span className="lowercase">s.d</span>{" "}
                                {generateTanggalPelatihan(
                                  data!.TanggalAkhirPendaftaran
                                )}
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-gray-600">
                              <TbCalendarUser className="text-lg w-6" />
                            </td>
                            <td>
                              <div className="text-base flex gap-1 items-center text-gray-600">
                                <span className="flex">
                                  {" "}
                                  <span className="font-semibold">
                                    Lama Pelaksanaan :{" "}
                                  </span>
                                  <span>
                                    {" "}
                                    {hitungHariPelatihan(
                                      data!.TanggalMulaiPelatihan,
                                      data!.TanggalBerakhirPelatihan
                                    )}{" "}
                                    Hari{" "}
                                  </span>
                                </span>

                                <Popover>
                                  <PopoverTrigger asChild>
                                    <span className="cursor-pointer">
                                      <PiQuestionBold />
                                    </span>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <p>
                                      Tanggal pelaksaan pelatihan akan diinfokan
                                      lebih lanjut melalui informasi pada
                                      dashboard/no handpone/manning agent kamu
                                      atau hub{" "}
                                      <Link
                                        href={"#"}
                                        className="text-blue-500 underline"
                                      >
                                        helpdesk {data!.PenyelenggaraPelatihan}
                                      </Link>
                                    </p>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-gray-600">
                              <TbMap2 className="text-lg w-6" />
                            </td>
                            <td>
                              <p className="text-base text-gray-600 ">
                                <span className="font-semibold">
                                  Lokasi Pelatihan :
                                </span>{" "}
                                {data!.LokasiPelatihan}
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-gray-600">
                              <TbBroadcast className="text-lg w-6" />
                            </td>
                            <td>
                              <p className="text-base text-gray-600 ">
                                <span className="font-semibold">
                                  Pelaksanaan Pelatihan :{" "}
                                </span>
                                {data!.PelaksanaanPelatihan}
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-gray-600">
                              <HiOutlineUserGroup className="text-lg w-6" />
                            </td>
                            <td>
                              <p className="text-base text-gray-600">
                                <span className="font-semibold">
                                  Kuota Peserta :{" "}
                                </span>
                                {data!.KoutaPelatihan} Orang
                              </p>
                              <ProgressBarPesertaPelatihan pelatihan={data!} />
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>

                    {data!.StatusApproval != "Selesai" &&
                      (!Cookies.get("XSRF081") ? (
                        <Link
                          href={"/registrasi"}
                          className="text-base font-medium px-4 py-3 hover:cursor-pointer items-center justify-center text-center flex gap-1 bg-blue-500 rounded-3xl text-white"
                        >
                          <MdOutlineAppRegistration /> Daftar Pelatihan
                        </Link>
                      ) : (
                        <button
                          onClick={(e) => handleRegistration()}
                          className="text-base font-medium px-4 py-3 hover:cursor-pointer items-center justify-center text-center flex gap-1 hover:bg-blue-700 duration-700 bg-blue-500 rounded-3xl text-white -mt-2"
                        >
                          <MdOutlineAppRegistration /> Daftar Pelatihan
                        </button>
                      ))}

                    <Link
                      target="_blank"
                      href={data!.SilabusPelatihan!}
                      title={`Silabus ${data!.NamaPelatihan!}`}
                      className="text-base font-medium px-4 py-3 hover:cursor-pointer items-center justify-center text-center flex gap-1 bg-teal-400 hover:bg-teal-600 duration-700 rounded-3xl text-white -mt-4"
                    >
                      <FaFilePdf /> Unduh Silabus Pelatihan
                    </Link>
                    {data!.StatusApproval == "Selesai" && (
                      <p className="italic text-xs -mt-5">
                        *Pelatihan telah selesai diselenggarakan
                      </p>
                    )}
                  </div>

                  {!isRegistrasi && (
                    <div className="md:flex hidden flex-col mt-6 gap-6 ">
                      <div className="flex flex-col gap-2 -mt-1">
                        <h1 className="text-black font-bold text-3xl font-calsans leading-[110%]">
                          Pelatihan Lainnya
                        </h1>
                        <p className="text-base text-gray-600 max-w-4xl -mt-3">
                          Daftar dan ikuti pelatihan serupa lainnya agar
                          menambah keterampilanmu!
                        </p>
                        <div className="w-[100px] h-1 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="flex flex-col gap-3 border-b border-b-gray-300 pb-3">
                        {dataRelated.map((pelatihan, index) => (
                          <CardPelatihan key={index} pelatihan={pelatihan} />
                        ))}
                      </div>
                      <Link
                        href={`/layanan/program/${getJenisProgram(
                          data!.JenisProgram
                        )}`}
                        className="w-full flex gap-2  items-center justify-center text-sm text-center font-medium px-6 py-2 bg-transparent hover:bg-blue-500 border border-blue-500 rounded-lg text-blue-500 hover:text-white duration-700"
                      >
                        <span>Lihat Pelatihan Lainnya</span> <FaChevronRight />
                      </Link>
                    </div>
                  )}
                </div>
              }
            </div>

            {isRegistrasi && (
              <FormRegistrationTraining
                id={data!.IdPelatihan}
                harga={data!.HargaPelatihan!.toString()}
                pelatihan={data!}
              />
            )}
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* <LogoIntegrated /> */}

      <Footer />
    </section>
  );
}

const CardPelatihan = ({ pelatihan }: { pelatihan: PelatihanMasyarakat }) => {
  return (
    <div className="coverflow flex flex-col shadow-custom relative w-full h-fit rounded-3xl">
      <div className="w-fit absolute top-4 right-4 flex gap-1 z-[60]">
        <div className="text-xs font-medium px-4 py-2 bg-blue-500 rounded-3xl text-white">
          {pelatihan!.HargaPelatihan == 0
            ? "Gratis"
            : formatToRupiah(pelatihan!.HargaPelatihan)}
        </div>
        <div className="text-xs font-medium px-4 py-2 bg-blue-500 rounded-3xl text-white">
          {pelatihan!.BidangPelatihan}
        </div>
      </div>
      <div className="w-full relative h-[160px]">
        <div className="flex w-full absolute h-[160px] bg-gradient-to-r opacity-40 from-blue-500 to-teal-400 bg-opacity-20 rounded-tl-3xl rounded-tr-3xl"></div>
        <Image
          className="w-full rounded-tl-3xl rounded-tr-3xl h-full object-cover"
          alt=""
          src={`${replaceUrl(pelatihan!.FotoPelatihan)}`}
          width={0}
          height={0}
        />
      </div>

      <div className=" py-3 relative ">
        <div className="w-full pb-4 px-6">
          <h2 className="font-calsans text-xl duration-1000 text-black mt-2 leading-[110%]">
            {truncateText(pelatihan!.NamaPelatihan, 50, "...")}
          </h2>
          <div className="flex gap-1 my-1 text-gray-600 text-sm items-center">
            <TbClockHour2 />
            Mulai Pendaftaran :
            <p>
              {generateTanggalPelatihan(pelatihan!.TanggalMulaiPendaftaran)}
            </p>
          </div>
          <p
            dangerouslySetInnerHTML={{
              __html:
                pelatihan &&
                truncateText(pelatihan!.DetailPelatihan, 100, "..."),
            }}
            className="text-sm font-normal group-hover:text-xs text-gray-600 group-hover:duration-1000"
          />

          <Link
            href={`/layanan/pelatihan/${createSlug(pelatihan!.NamaPelatihan)}/${
              pelatihan!.KodePelatihan
            }/${pelatihan!.IdPelatihan}`}
            className="w-full mt-4 block text-sm text-center font-medium px-6 py-2 bg-blue-500 rounded-3xl text-white"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;
