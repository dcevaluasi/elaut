"use client";

import React, { useRef } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Link from "next/link";
import { Button } from "./ui/button";
import { FiMaximize, FiMinimize, FiSearch } from "react-icons/fi";
import { Input } from "./ui/input";
import { usePathname } from "next/navigation";
import {
  extractPathAfterBppp,
  getPenyeleggara,
} from "@/utils/pelatihan";
import {
  ManningAgent,
  ManningAgentPelatihan,
  PelatihanMasyarakat,
} from "@/types/product";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { truncateText } from "@/utils";
import { generateTanggalPelatihan } from "@/utils/text";
import { elautBaseUrl } from "@/constants/urls";
import Image from "next/image";
import { TimelineProgressManningAgent } from "./dashboard/Dashboard/TimelineProgressManningAgent";

function ManningAgentTrainingService({
  manningAgent,
}: {
  manningAgent: ManningAgent | null;
}) {
  const [indexPelatihanSelected, setIndexPelatihanSelected] =
    React.useState<number>(100000000);

  const icons = (bidangPelatihan: string) => {
    switch (bidangPelatihan) {
      case "Pengolahan dan Pemasaran":
        return "/images/bidangPelatihan/pengolahan-pemasaran.png";
      case "Budidaya":
        return "/images/bidangPelatihan/budidaya.png";
      case "Penangkapan":
        return "/images/bidangPelatihan/penangkapan.png";
      case "Konservasi":
        return "/images/bidangPelatihan/konservasi.png";
      case "Mesin Perikanan":
        return "/images/bidangPelatihan/mesin-perikanan.png";
      case "Kepelautan":
        return "/images/bidangPelatihan/kepelautan.png";
      case "Manajemen Perikanan":
        return "/images/bidangPelatihan/sd-perikanan.png";
      default:
        return "/images/bidangPelatihian/sd-perikanan.png";
    }
  };

  const pathname = usePathname();
  const location = extractPathAfterBppp(pathname);
  const penyelenggara = getPenyeleggara(location!);

  const [data, setData] = React.useState<PelatihanMasyarakat[]>([]);

  const handleFetchingPublicTrainingDataByPenyelenggara = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihan?penyelenggara_pelatihan=${penyelenggara}`
      );
      console.log({ response });
      setData(response.data.data);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  const [isExpand, setIsExpand] = React.useState<boolean>(false);

  const [loading, setLoading] = React.useState<boolean>(true);

  const token = Cookies.get("XSRF081");

  const [selectedPelatihan, setSelectedPelatihan] =
    React.useState<ManningAgentPelatihan | null>(null);
  const [selectedDetailPelatihan, setSelectedDetailPelatihan] =
    React.useState<PelatihanMasyarakat | null>(null);

  const handleFetchingDetailPelatihan = async (
    id: number,
    idPelatihan: number
  ) => {
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/manningAgent/getDataManingAgentPelatihan?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const responseDetail: AxiosResponse = await axios.get(
        `${elautBaseUrl}/getPelatihanUser?idPelatihan=${idPelatihan}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log({ responseDetail });
      setSelectedDetailPelatihan(responseDetail.data);
      setSelectedPelatihan(response.data.data[0]);
      console.log("SELECTED PELATIHAN : ", response);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      handleFetchingPublicTrainingDataByPenyelenggara();
    }, 1000);
  }, []);

  const tabs = useRef<HTMLDivElement>(null);

  const [menuSelected, setMenuSelected] = React.useState(false);
  const [indexMenuSelected, setIndexMenuSelected] = React.useState(0);

  const [typePelatihanSelected, setTypePelatihanSelected] =
    React.useState<string>("");

  const [isOpenGuideline, setIsOpenGuideline] = React.useState<boolean>(true);
  const isManningAgent = Cookies.get("isManningAgent");

  const [seeMore, setSeeMore] = React.useState<boolean>(false);
  const [keywordSearch, setKeywordSearch] = React.useState<string>("");

  return (
    <>
      <section className="relative h-fit pb-20 bg-white" id="explore">
        <div
          className="absolute inset-0 pointer-events-none mb-16 pb-10 h-full"
          aria-hidden="true"
        ></div>
        <div className="absolute left-0 right-0 m-auto w-px p-px h-28 bg-gray-200 transform -translate-y-1/2"></div>

        <div className="relative w-full mx-auto px-4 sm:px-6">
          <div className="pt-12 md:pt-20">
            {/* Section header */}
            {manningAgent?.ManingAgentPelatihan!.length != 0 ? (
              <>
                {!isExpand && (
                  <div className="max-w-3xl mx-auto text-center flex items-center justify-center flex-col pb-5 md:pb-8">
                    <h1 className="text-3xl font-calsans leading-[110%] text-black">
                      Pelatihan Masyarakat, Teknis, <br /> dan Kepelautan yang
                      Diikuti
                    </h1>
                    <p className="text-base text-gray-600">
                      Jelajahi layanan serta informasi yang ada pada Balai
                      Pelatihan Kelautan dan Perikanan dan jadilah SDM kompeten
                      bidang kelautan dan perikanan!
                    </p>
                    <div className="rounded-full bg-gray-300 h-1 w-20 mt-3"></div>
                  </div>
                )}

                <div
                  className={`w-full ${isExpand ? "w-full" : "max-w-7xl"
                    } mx-auto flex gap-5 mt-8`}
                >
                  <div
                    className={`gap-2  ${indexPelatihanSelected != 100000000
                      ? isExpand
                        ? "hidden"
                        : "w-5/12 flex flex-col "
                      : "w-full flex flex-col "
                      }`}
                  >
                    <div className="relative w-full flex items-center border-gray-300 border px-2 rounded-xl">
                      <Button
                        type="button"
                        variant={"outline"}
                        className="flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-700 w-fit h-fit absolute right-1"
                      >
                        {" "}
                        <FiSearch className="text-white text-base" />
                      </Button>
                      <Input
                        value={keywordSearch}
                        onChange={(e) => setKeywordSearch(e.target.value)}
                        className="text-sm border-none -ml-1 focus:border-none active:outline-none active:border-none focus:outline-none focus-visible:ring-0"
                        placeholder="Cari Pelatihan Yang Kamu Ikuti"
                      />
                    </div>
                    <Tabs defaultValue="Klasikal" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                          value="Klasikal"
                          onClick={() => setTypePelatihanSelected("Klasikal")}
                        >
                          Klasikal
                        </TabsTrigger>
                        <TabsTrigger
                          value="Online"
                          onClick={() => setTypePelatihanSelected("Online")}
                        >
                          Online
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="Klasikal">
                        {indexPelatihanSelected != 100000000 ? (
                          manningAgent?.ManingAgentPelatihan.slice()
                            .reverse()
                            .filter((pelatihan) => {
                              // Split the keywordSearch into words and check if all are present in NamaPelatihan
                              return keywordSearch
                                .toLowerCase()
                                .split(" ")
                                .every((keyword) =>
                                  pelatihan?.NamaPelatihan.toLowerCase().includes(
                                    keyword
                                  )
                                );
                            })
                            .map((pelatihan, reverseIndex) => {
                              const actualIndex =
                                manningAgent?.ManingAgentPelatihan.length! -
                                1 -
                                reverseIndex;

                              return (
                                <div
                                  onClick={() => {
                                    setIndexPelatihanSelected(actualIndex);
                                    handleFetchingDetailPelatihan(
                                      pelatihan?.IdMiningAgentPelatihan,
                                      parseInt(pelatihan?.IdPelatihan)
                                    );
                                  }}
                                  className="relative block overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-custom hover:scale-105 duration-700 cursor-pointer"
                                >
                                  <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-blue-500 via-blue-500 to-teal-400"></span>

                                  <div className="flex w-full gap-3">
                                    <div className="hidden sm:block sm:shrink-0">
                                      <Image
                                        width={0}
                                        height={0}
                                        alt=""
                                        src={icons(pelatihan?.BidangPelatihan)}
                                        className="w-14 rounded-lg object-cover shadow-sm"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <div className="sm:flex sm:justify-between sm:gap-4">
                                        <div>
                                          <h3 className="text-lg hover:cursor-pointer font-bold text-gray-900 sm:text-xl leading-[100%]">
                                            {pelatihan?.NamaPelatihan}
                                          </h3>
                                        </div>
                                      </div>

                                      <div className="mt-1 mb-2">
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: truncateText(
                                              pelatihan?.DetailPelatihan,
                                              150,
                                              "..."
                                            ),
                                          }}
                                          className="text-sm font-normal group-hover:text-xs text-gray-500 group-hover:duration-1000 leading-[140%]"
                                        />
                                      </div>

                                      <dl className="mt2 flex gap-4 sm:gap-6">
                                        <div className="flex flex-col-reverse">
                                          <dt className="text-sm font-medium text-gray-600">
                                            {pelatihan?.BidangPelatihan!}
                                          </dt>
                                          <dd className="text-xs text-gray-500">
                                            Bidang
                                          </dd>
                                        </div>
                                      </dl>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        ) : (
                          <div className="grid grid-cols-3 w-full gap-4">
                            {manningAgent
                              ?.ManingAgentPelatihan!.slice()
                              .reverse()
                              .filter((pelatihan) => {
                                // Split the keywordSearch into words and check if all are present in NamaPelatihan
                                return keywordSearch
                                  .toLowerCase()
                                  .split(" ")
                                  .every((keyword) =>
                                    pelatihan?.NamaPelatihan.toLowerCase().includes(
                                      keyword
                                    )
                                  );
                              })
                              .map((pelatihan, reverseIndex) => {
                                const actualIndex =
                                  manningAgent?.ManingAgentPelatihan.length! -
                                  1 -
                                  reverseIndex;

                                return (
                                  <div
                                    onClick={() => {
                                      setIndexPelatihanSelected(actualIndex);
                                      handleFetchingDetailPelatihan(
                                        pelatihan?.IdMiningAgentPelatihan,
                                        parseInt(pelatihan?.IdPelatihan)
                                      );
                                    }}
                                    className="relative block overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-custom hover:scale-105 duration-700 cursor-pointer"
                                  >
                                    <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-blue-500 via-blue-500 to-teal-400"></span>

                                    <div className="flex w-full gap-3">
                                      <div className="hidden sm:block sm:shrink-0">
                                        <Image
                                          width={0}
                                          height={0}
                                          alt=""
                                          src={icons(
                                            pelatihan?.BidangPelatihan
                                          )}
                                          className="w-14 rounded-lg object-cover shadow-sm"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <div className="sm:flex sm:justify-between sm:gap-4">
                                          <div>
                                            <h3 className="text-lg hover:cursor-pointer font-bold text-gray-900 sm:text-xl leading-[100%]">
                                              {pelatihan?.NamaPelatihan}
                                            </h3>
                                          </div>
                                        </div>

                                        <div className="mt-1 mb-2">
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: truncateText(
                                                pelatihan?.DetailPelatihan,
                                                150,
                                                "..."
                                              ),
                                            }}
                                            className="text-sm font-normal group-hover:text-xs text-gray-500 group-hover:duration-1000 leading-[140%]"
                                          />
                                        </div>

                                        <dl className="mt2 flex gap-4 sm:gap-6">
                                          <div className="flex flex-col-reverse">
                                            <dt className="text-sm font-medium text-gray-600">
                                              {pelatihan?.BidangPelatihan!}
                                            </dt>
                                            <dd className="text-xs text-gray-500">
                                              Bidang
                                            </dd>
                                          </div>
                                        </dl>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="Online"></TabsContent>
                    </Tabs>
                  </div>

                  {indexPelatihanSelected != 100000000 && !isExpand && (
                    <div
                      className={` items-start justify-center ${isExpand ? "w-12/12" : "w-7/12 flex"
                        }`}
                    >
                      <div className="relative block overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:px-6 lg:py-0">
                        <div className="sm:flex justify-between sm:gap-4 items-center border-b-2 border-b-gray-200 pb-4">
                          <div className="">
                            <h3 className="text-3xl font-bold text-gray-900 font-calsans sm:text-3xl leading-[105%]">
                              {
                                manningAgent?.ManingAgentPelatihan[
                                  indexPelatihanSelected
                                ]?.NamaPelatihan!
                              }
                            </h3>

                            <div className="flex items-center gap-3">
                              <p className=" text-sm font-medium text-gray-600">
                                By{" "}
                                {selectedDetailPelatihan != null
                                  ? selectedDetailPelatihan.PenyelenggaraPelatihan
                                  : "-"}{" "}
                                ·{" "}
                                {selectedDetailPelatihan != null
                                  ? generateTanggalPelatihan(
                                    selectedDetailPelatihan?.TanggalMulaiPelatihan
                                  )
                                  : "-"}{" "}
                                s.d.{" "}
                                {selectedDetailPelatihan != null
                                  ? generateTanggalPelatihan(
                                    selectedDetailPelatihan?.TanggalBerakhirPelatihan
                                  )
                                  : "-"}
                              </p>
                              <div
                                className="cursor-pointer"
                                onClick={(e) => setIsExpand(!isExpand)}
                              >
                                {isExpand ? (
                                  <FiMinimize className="text-base" />
                                ) : (
                                  <FiMaximize className="text-base" />
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="hidden sm:block sm:shrink-0">
                            <Image
                              width={0}
                              height={0}
                              alt=""
                              src={icons(
                                manningAgent?.ManingAgentPelatihan[
                                  indexPelatihanSelected
                                ]?.BidangPelatihan!
                              )}
                              className="w-16 rounded-lg object-cover shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-6 flex gap-4 sm:gap-6">
                          <div className="flex flex-col-reverse">
                            <div className="text-sm font-medium text-gray-600">
                              {
                                manningAgent?.ManingAgentPelatihan[
                                  indexPelatihanSelected
                                ]?.BidangPelatihan!
                              }
                            </div>
                            <div className="text-xs text-gray-500">Bidang</div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex gap-1 flex-col">
                            <p
                              dangerouslySetInnerHTML={{
                                __html:
                                  manningAgent?.ManingAgentPelatihan[
                                    indexPelatihanSelected
                                  ]! && !seeMore
                                    ? truncateText(
                                      manningAgent?.ManingAgentPelatihan[
                                        indexPelatihanSelected
                                      ]?.DetailPelatihan!,
                                      300,
                                      "..."
                                    )
                                    : manningAgent?.ManingAgentPelatihan[
                                      indexPelatihanSelected
                                    ]?.DetailPelatihan!,
                              }}
                              className="text-sm prose   text-justify group-hover:text-xs text-gray-500 prose-strong:text-gray-500 prose-p:leading-[140%] prose-strong:font-bold group-hover:duration-1000"
                            />{" "}
                            <p
                              onClick={(e) => setSeeMore(!seeMore)}
                              className="text-blue-500 text-sm cursor-pointer"
                            >
                              {seeMore
                                ? "Baca lebih sedikit"
                                : "Baca lebih lengkap"}
                            </p>
                          </div>
                        </div>

                        {selectedPelatihan != null && (
                          <TimelineProgressManningAgent
                            manningAgent={
                              manningAgent?.ManingAgentPelatihan[
                              indexPelatihanSelected
                              ]!
                            }
                            pelatihan={selectedPelatihan!}
                            detailPelatihan={selectedDetailPelatihan!}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {indexPelatihanSelected != 100000000 && isExpand && (
                    <div
                      className={` items-start justify-center w-full max-w-7xl mx-auto`}
                    >
                      <div className="relative block overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:px-6 lg:py-0">
                        <div className="sm:flex justify-between sm:gap-4 items-center border-b-2 border-b-gray-200 pb-4">
                          <div className="">
                            <h3 className="text-3xl font-bold text-gray-900 font-calsans sm:text-3xl leading-[105%]">
                              {
                                manningAgent?.ManingAgentPelatihan[
                                  indexPelatihanSelected
                                ]?.NamaPelatihan!
                              }
                            </h3>

                            <div className="flex items-center gap-3">
                              <p className=" text-sm font-medium text-gray-600">
                                By{" "}
                                {selectedDetailPelatihan != null
                                  ? selectedDetailPelatihan.PenyelenggaraPelatihan
                                  : "-"}{" "}
                                ·{" "}
                                {selectedDetailPelatihan != null
                                  ? generateTanggalPelatihan(
                                    selectedDetailPelatihan?.TanggalMulaiPelatihan
                                  )
                                  : "-"}{" "}
                                s.d.{" "}
                                {selectedDetailPelatihan != null
                                  ? generateTanggalPelatihan(
                                    selectedDetailPelatihan?.TanggalBerakhirPelatihan
                                  )
                                  : "-"}
                              </p>
                              <div
                                className="cursor-pointer"
                                onClick={(e) => setIsExpand(!isExpand)}
                              >
                                {isExpand ? (
                                  <FiMinimize className="text-base" />
                                ) : (
                                  <FiMaximize className="text-base" />
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="hidden sm:block sm:shrink-0">
                            <Image
                              width={0}
                              height={0}
                              alt=""
                              src={icons(
                                manningAgent!.ManingAgentPelatihan[
                                  indexPelatihanSelected
                                ]?.BidangPelatihan!
                              )}
                              className="w-16 rounded-lg object-cover shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-6 flex gap-4 sm:gap-6">
                          <div className="flex flex-col-reverse">
                            <div className="text-sm font-medium text-gray-600">
                              {
                                manningAgent!.ManingAgentPelatihan[
                                  indexPelatihanSelected
                                ]?.BidangPelatihan!
                              }
                            </div>
                            <div className="text-xs text-gray-500">Bidang</div>
                          </div>
                        </div>

                        <div className="flex gap-6 w-full">
                          <div className="mt-4 w-full">
                            <div className="flex gap-1 flex-col">
                              <p
                                dangerouslySetInnerHTML={{
                                  __html:
                                    manningAgent!.ManingAgentPelatihan[
                                    indexPelatihanSelected
                                    ]! &&
                                    manningAgent!.ManingAgentPelatihan[
                                      indexPelatihanSelected
                                    ]?.DetailPelatihan!,
                                }}
                                className="text-sm prose   text-justify group-hover:text-xs text-gray-500 prose-strong:text-gray-500 prose-p:leading-[140%] prose-strong:font-bold group-hover:duration-1000"
                              />{" "}
                            </div>
                          </div>

                          <div className="-mt-6 w-[90%]">
                            {selectedPelatihan != null && (
                              <TimelineProgressManningAgent
                                manningAgent={
                                  manningAgent?.ManingAgentPelatihan[
                                  indexPelatihanSelected
                                  ]!
                                }
                                pelatihan={selectedPelatihan!}
                                detailPelatihan={selectedDetailPelatihan!}
                              />
                            )}
                          </div>
                        </div>

                        {typePelatihanSelected == "Online" && (
                          <div className="mt-3">
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-500">
                                Materi Pelatihan
                              </div>

                              <div className="grid grid-cols-2 w-full gap-2 mt-2">
                                {[1, 2, 3, 4, 5, 6].map((pelatihan, index) => (
                                  <Link
                                    href={`/dashboard/pelatihan/online/${manningAgent!.ManingAgentPelatihan[
                                      indexPelatihanSelected
                                    ]!.IdPelatihan
                                      }`}
                                    className="flex shadow-custom w-full rounded-md p-5 cursor-pointer flex-col gap-1 hover:scale-105 duration-700 hover:bg-blue-500 hover:text-white group"
                                  >
                                    <h3 className="font-bold font-calsans leading-[105%]">
                                      Materi {pelatihan}. <br />
                                      Kebijakan Pelatihan Sosial Kultural II
                                    </h3>
                                    <p
                                      dangerouslySetInnerHTML={{
                                        __html: truncateText(
                                          manningAgent!.ManingAgentPelatihan[
                                            indexPelatihanSelected
                                          ]?.DetailPelatihan!,
                                          100,
                                          "..."
                                        ),
                                      }}
                                      className="text-sm prose group-hover:text-white  text-justify  text-gray-500 prose-strong:text-gray-500 prose-p:leading-[140%] prose-strong:font-bold group-hover:duration-1000 prose-p:font-normal"
                                    />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="relative max-w-6xl w-full mx-auto px-4 sm:px-6">
                <div className="pt-12 md:pt-20 flex flex-col items-center">
                  <Image
                    src={"/illustrations/not-found.png"}
                    alt="Not Found"
                    width={0}
                    height={0}
                    className="w-[400px]"
                  />
                  <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
                    <h1 className="text-3xl font-calsans leading-[110%] text-black">
                      Belum Ada Pelatihan
                    </h1>
                    <div className="text-gray-600 text-center  max-w-md">
                      Kamu belum mengikuti pelatihan apapun, ayo cari pelatihan
                      menarik di E-LAUT dan jadilah SDM unggul untuk Indonesia!{" "}
                      <Link
                        href="/"
                        className="text-blue-600 hover:underline transition duration-150 ease-in-out"
                      >
                        Cari Pelatihan
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default ManningAgentTrainingService;
