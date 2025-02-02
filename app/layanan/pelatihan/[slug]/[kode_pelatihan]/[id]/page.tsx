"use client";

import Image from "next/image";
import React from "react";
import {
  TbBroadcast,
  TbBuildingBank,
  TbCalendarUser,
  TbClockHour2,
  TbCloudDownload,
  TbLink,
  TbLocation,
  TbMap2,
  TbPin,
} from "react-icons/tb";

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
import Features from "@/components/features";
import { formatToRupiah, replaceUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { elautBaseUrl } from "@/constants/urls";
import { generateTanggalPelatihan } from "@/utils/text";
import DetailPelatihan from "@/components/elaut/DetailPelatihan";

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
      setData(response.data);
    } catch (error) {
      setLoading(false);
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  const [isOpenRegistrationCommand, setIsOpenRegistrationCommand] =
    React.useState(false);

  const handleRegistration = () => {
    if (Cookies.get('status')?.includes('Politeknik')) {
      if (data!.PenyelenggaraPelatihan.includes('Politeknik') && Cookies.get('status') != data!.PenyelenggaraPelatihan) {
        Toast.fire({
          icon: "error",
          title: 'Oopsss!',
          text: `Sobat E-LAUT tidak dapat mendaftar pelatihan ini karena bukan dari ${data!.PenyelenggaraPelatihan}`,
        });
      } else {
        if (data!.StatusApproval == "Selesai") {
          Toast.fire({
            icon: "error",
            title: 'Oopsss!',
            text: `Yah pelatihan ini sudah berakhir, cari pelatihan lainnya sobat ELAUT!`,
          });
        } else {
          if (Cookies.get("XSRF081")) {
            setIsRegistrasi(true);
          } else {
            setIsOpenRegistrationCommand(true);
          }
        }
      }
    } else {
      if (data!.StatusApproval == "Selesai") {
        Toast.fire({
          icon: "error",
          title: 'Oopsss!',
          text: `Yah pelatihan ini sudah berakhir, cari pelatihan lainnya sobat ELAUT!`,
        });
      } else {
        if (Cookies.get("XSRF081")) {
          setIsRegistrasi(true);
        } else {
          setIsOpenRegistrationCommand(true);
        }
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

  const router = useRouter();

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
    <section className="relative w-full">
      {loading ? (
        <div className="bg-[#EEEAEB] h-full p-20 pt-56 w-full">
          <div className="w-full flex items-end">
            <div className="bg-white rounded-3xl flex justify-end p-10 relative w-full ml-20 animate-pulse">
              <div className="bg-blue-500 shadow-custom w-fit rounded-3xl absolute pb-14 -left-5">
                <div className="flex flex-col gap-2">
                  <div className="w-[400px] h-[400px] bg-gray-300 rounded-3xl shadow-custom m-2 -mt-24"></div>

                  <div className="flex flex-col px-5 py-2">
                    <div className="h-8 bg-gray-300 rounded-lg w-3/4"></div>
                    <div className="h-6 bg-gray-300 rounded-lg w-2/3 mt-2"></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 items-end text-left">
                <div className="h-12 bg-gray-300 rounded-lg w-1/2"></div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-5 bg-gray-300 rounded-lg w-3/4"></div>
                  <div className="h-5 bg-gray-300 rounded-lg w-2/3"></div>
                </div>

                <div className="h-12 bg-gray-300 rounded-full w-2/3 px-7 py-7"></div>

                <div className="flex flex-col items-end w-full">
                  <div className="h-5 bg-gray-300 rounded-md w-full max-w-6xl"></div>
                  <div className="h-5 bg-gray-300 rounded-md w-full max-w-6xl"></div>
                  <div className="h-5 bg-gray-300 rounded-md w-full max-w-6xl"></div>
                  <div className="h-5 bg-gray-300 rounded-md w-full max-w-6xl"></div>
                  <div className="h-5 bg-gray-300 rounded-md w-full max-w-6xl"></div>
                </div>

                <div className="h-16 bg-gray-300 rounded-full w-2/3 mt-8 px-24 py-7"></div>
              </div>
            </div>
          </div>
        </div>
      ) : data != null ? (
        <DetailPelatihan data={data} handleRegistration={handleRegistration} isRegistrasi={isRegistrasi} />
        // <div className='bg-[#EEEAEB] h-full p-20 pt-56 w-full'>
        //   <div className="w-full flex items-end flex-col">
        //     <div className=" flex justify-end  relative w-full max-w-6xl">
        //       <div className="bg-blue-500 shadow-custom w-fit rounded-3xl absolute pb-14 -left-10">
        //         <div className="flex flex-col gap-2 ">
        //           <Image
        //             className="w-[400px] h-[400px] rounded-3xl object-cover shadow-custom m-2 -mt-16"
        //             alt=""
        //             src={replaceUrl(data?.FotoPelatihan!)}
        //             width={0}
        //             height={0}
        //           />

        //           <div className="flex flex-col px-5 py-2 gap-3 w-[350px]">
        //             <h1 className="text-3xl text-white  font-calsans leading-[100%]">
        //               {data!.NamaPelatihan}
        //             </h1>
        //             <p className="text-lg text-white flex gap-1 w-[450px] leading-none items-center">
        //               <TbLocation className="text-lg w-6" />
        //               {data!.LokasiPelatihan}
        //             </p>
        //           </div>

        //         </div>
        //       </div>

        //       <div className="flex flex-col gap-4 w-full">
        //         <div className="flex flex-col gap-2 items-end w-full text-left bg-white rounded-3xl p-10 ">
        //           <h2 className="text-blue-500 text-[3.6rem]  font-calsans leading-none">
        //             {formatToRupiah(data!.HargaPelatihan)}
        //           </h2>
        //           <div className="flex flex-col items-end">
        //             <p className="text-blue-500">*Tidak termasuk <span className="font-bold">akomodasi</span> & <span className="font-bold">konsumsi</span></p>
        //             <p className="text-blue-500">*Kuota kelas pelatihan <span className="font-bold">{data!.KoutaPelatihan} orang</span></p>
        //           </div>



        //           <Button className='bg-[#625BF9] text-white font-bold w-fit rounded-full text-xl px-7 py-7'>
        //             {generateTanggalPelatihan(
        //               data!.TanggalMulaiPelatihan
        //             )} - {generateTanggalPelatihan(
        //               data!.TanggalBerakhirPelatihan
        //             )}

        //           </Button>
        //           <div className="flex items-end">
        //             <p
        //               dangerouslySetInnerHTML={{
        //                 __html:
        //                   data.DetailPelatihan
        //               }}
        //               className="text-base font-normal text-[#979797] group-hover:duration-1000 prose-p:!text-right text-right max-w-xl"
        //             />
        //           </div>

        //           {data!.StatusApproval != "Selesai" && !isRegistrasi &&
        //             (!Cookies.get("XSRF081") ? (
        //               <Button onClick={(e) => router.replace('/registrasi')} className='bg-[#625BF9] text-white font-extrabold w-fit rounded-full text-2xl px-24 py-7 -mt-8'>
        //                 DAFTAR

        //               </Button>
        //             ) : (
        //               <Button onClick={(e) => handleRegistration()} className='bg-[#625BF9] text-white font-extrabold w-fit rounded-full text-2xl px-24 py-7 -mt-8'>
        //                 DAFTAR

        //               </Button>
        //             ))}



        //         </div>

        //         {isRegistrasi && <div className="flex flex-col gap-2 items-end w-full text-left bg-white rounded-3xl p-10 ">
        //           <h2 className="text-blue-500 text-[3.6rem]  font-calsans leading-none">
        //             Detail Pendaftaran
        //           </h2>
        //           <div className="flex flex-col items-end">
        //             <p className="text-blue-500">*Tidak termasuk <span className="font-bold">akomodasi</span> & <span className="font-bold">konsumsi</span></p>
        //             <p className="text-blue-500">*Kuota kelas pelatihan <span className="font-bold">{data!.KoutaPelatihan} orang</span></p>
        //           </div>

        //           <FormRegistrationTraining
        //             id={data!.IdPelatihan}
        //             harga={data!.HargaPelatihan!.toString()}
        //             pelatihan={data!}
        //           />

        //         </div>}

        //       </div>

        //     </div>
        //   </div>

        //   {
        //     !isRegistrasi && <Features />
        //   }

        // </div>
      ) : (
        <></>
      )
      }
    </section >
  );
}


export default page;
