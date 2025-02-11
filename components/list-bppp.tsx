import React from "react";

import Image from "next/image";
import { TbClockHour2 } from "react-icons/tb";
import Link from "next/link";
import { createSlug, truncateText } from "@/utils";
import { PelatihanMasyarakat } from "@/types/product";
import { Bounce, Slide } from "react-awesome-reveal";
import { encryptValue, formatToRupiah, replaceUrl } from "@/lib/utils";

function ListBPPP({
  pelatihan,
  type,
}: {
  pelatihan: PelatihanMasyarakat[];
  type: string;
}) {
  return (
    <div className="w-full items-center justify-center flex">
      <div className="w-fit grid grid-cols-3 gap-y-6 gap-x-5 items-center">
        {pelatihan &&
          pelatihan!.map((pelatihan: PelatihanMasyarakat, index: number) => (
            <Slide
              direction="up"
              key={index}
              duration={500 * (index + 1)}
              className={`${pelatihan?.Status == "Belum Publish" && "hidden"}`}
            >
              <CardPelatihan pelatihan={pelatihan} />
            </Slide>
          ))}
      </div>
    </div>
  );
}

const CardPelatihan = ({ pelatihan }: { pelatihan: PelatihanMasyarakat }) => {
  return (
    <div className="coverflow flex flex-col shadow-custom relative w-[350px] h-fit rounded-3xl">
      <div className="w-fit absolute top-4 right-4 flex gap-1 z-[60]">
        <div className="text-xs font-medium px-4 py-2 bg-blue-500 rounded-3xl text-white">
          {pelatihan.HargaPelatihan == 0
            ? "Gratis"
            : "Rp. " + formatToRupiah(pelatihan.HargaPelatihan)}
        </div>
        <div className="text-xs font-medium px-4 py-2 bg-blue-500 rounded-3xl text-white">
          {pelatihan.BidangPelatihan}
        </div>
      </div>
      <div className="w-full relative h-[240px]">
        <div className="flex w-full absolute h-[240px] bg-gradient-to-r opacity-40 from-blue-500 to-teal-400 bg-opacity-20 rounded-tl-3xl rounded-tr-3xl"></div>
        <Image
          className="w-full rounded-tl-3xl rounded-tr-3xl h-full object-cover"
          alt=""
          src={`${replaceUrl(pelatihan.FotoPelatihan)}`}
          width={0}
          height={0}
        />
      </div>

      <div className=" py-3 relative ">
        <div className="w-full pb-4 px-6">
          <h2 className="font-calsans text-xl duration-1000 text-black mt-2 leading-[110%]">
            {truncateText(pelatihan?.NamaPelatihan, 50, "...")}
          </h2>
          <div className="flex gap-1 my-1 text-gray-600 text-sm items-center">
            <TbClockHour2 />
            Mulai Pelatihan :<p>{pelatihan.TanggalMulaiPelatihan}</p>
          </div>
          <p
            dangerouslySetInnerHTML={{
              __html:
                pelatihan &&
                truncateText(pelatihan?.DetailPelatihan, 150, "..."),
            }}
            className="text-sm font-normal group-hover:text-xs text-gray-600 group-hover:duration-1000"
          />

          <Link
            href={`/layanan/pelatihan/${createSlug(pelatihan.NamaPelatihan)}/${
              pelatihan?.KodePelatihan
            }/${encryptValue(pelatihan?.IdPelatihan)}`}
            className="w-full mt-4 block text-sm text-center font-medium px-6 py-2 bg-blue-500 rounded-3xl text-white"
          >
            Registrasi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListBPPP;
