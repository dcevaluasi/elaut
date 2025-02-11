"use client";

import { elautBaseUrl } from "@/constants/urls";
import { encryptValue, formatToRupiah, replaceUrl } from "@/lib/utils";
import { PelatihanMasyarakat } from "@/types/product";
import { createSlug, truncateText } from "@/utils";
import axios, { AxiosResponse } from "axios";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function page() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<PelatihanMasyarakat[] | null>(null);
  const handleFetchingPublicTrainingData = async () => {
    setIsLoading(true);

    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihan?penyelenggara_pelatihan=BPPP Tegal`
      );
      setIsLoading(false);

      if (response.data.data != null) {
        const filteredAndSortedData = response.data.data
          .filter((item: PelatihanMasyarakat) => item.Status == "Publish")
          .sort((a: PelatihanMasyarakat, b: PelatihanMasyarakat) => {
            const dateA = new Date(a.TanggalMulaiPelatihan);
            const dateB = new Date(b.TanggalMulaiPelatihan);

            // First, check the StatusApproval condition
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

            // Otherwise, sort by date in ascending order
            return dateA.getTime() - dateB.getTime(); // Ascending order
          });

        console.log(response);
        setData(filteredAndSortedData);
      } else {
        setData(null);
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  React.useEffect(() => {
    handleFetchingPublicTrainingData();
  }, []);

  return (
    <main className="bg-white relative flex w-full p-20 md:h-full">
      <Image
        src={"/images/logo/logo-elaut-color.png"}
        alt={
          "Elektronik Layanan Pelatihan Kelautan dan Perikanan Utama Terpadu"
        }
        width={0}
        height={0}
        title="Logo Elektronik Layanan Pelatihan Kelautan dan Perikanan Utama Terpadu (E-LAUT)"
        className="w-24 h-fit z-20 absolute left-14 top-14"
      />

      <div className="relative w-[40%] h-screen bg-white">
        <Image
          src={"/images/e-katalog/hand-mock-up.png"}
          alt={"Hand Mock Up"}
          width={0}
          height={0}
          title="Hand Mock Up"
          className="w-80 h-fit ml-20 absolute left-10 top-0"
        />

        <h1 className="absolute bottom-30 text-blue-500 w-fit  left-0 font-calsans leading-none text-[5rem]">
          e-Katalog <br />
          Pelatihan KP
        </h1>
      </div>

      <section className="grid gap-y-8 gap-x-2 items-center flex-3 justify-center w-full ml-20 relative z-20">
        <div className="grid grid-cols-3 gap-6">
          {data?.slice(0, 3).map((pelatihan, index) => (
            <CardPelatihan pelatihan={pelatihan} key={index} />
          ))}
        </div>
        <div className="flex items-center gap-4 justify-center w-full mt-3s">
          {data?.slice(3, 5).map((pelatihan, index) => (
            <CardPelatihan pelatihan={pelatihan} key={index + 3} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default page;
const CardPelatihan = ({ pelatihan }: { pelatihan: PelatihanMasyarakat }) => {
  return (
    <div className="coverflow flex flex-col shadow-custom bg-blue-500 relative w-[260px] h-fit rounded-3xl hover:scale-105 durationn-700">
      <div className="w-full relative h-[200px] items-center flex justify-center -mt-8">
        {/* <div className="flex w-full absolute h-[240px] bg-gradient-to-r opacity-40 from-blue-500 to-teal-400 bg-opacity-20 rounded-tl-3xl rounded-tr-3xl"></div> */}
        <Image
          className=" rounded-xl h-full object-cover w-60 border-8 border-opacity-100 border-white"
          alt=""
          src={`${replaceUrl(pelatihan.FotoPelatihan)}`}
          width={0}
          height={0}
        />
      </div>

      <div className=" pt-3 relative ">
        <div className="w-full pb-4 px-6">
          <div className="w-full items-center justify-center text-center">
            <h2 className="font-calsans text-2xl duration-1000 text-white mt-2 leading-[110%]">
              {truncateText(pelatihan?.NamaPelatihan, 50, "...")}
            </h2>
            <p className="text-neutral-100">
              {pelatihan.HargaPelatihan == 0
                ? "Gratis"
                : formatToRupiah(pelatihan.HargaPelatihan)}
            </p>
          </div>

          <Link
            href={`/layanan/pelatihan/${createSlug(pelatihan.NamaPelatihan)}/${
              pelatihan?.KodePelatihan
            }/${encryptValue(pelatihan?.IdPelatihan)}`}
            className="w-full mt-4 block text-sm text-center font-medium px-6 py-2 bg-[#6559f9] rounded-3xl text-white"
          >
            IKUTI
          </Link>
        </div>
      </div>
    </div>
  );
};
