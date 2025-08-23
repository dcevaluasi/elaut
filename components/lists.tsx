import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

// Import Swiper modules
import { Navigation, FreeMode } from "swiper/modules";
import Image from "next/image";
import { TbBuilding, TbCalendar, TbClock, TbMapPin, TbMoneybag } from "react-icons/tb";
import Link from "next/link";
import { createSlug, truncateText } from "@/utils";
import { PelatihanMasyarakat } from "@/types/product";
import { encryptValue, formatToRupiah, replaceUrl } from "@/lib/utils";
import "../app/css/navigation.css";
import { generateTanggalPelatihan } from "@/utils/text";
import { HiOutlineUserGroup, HiUserGroup } from "react-icons/hi2";
import { RiInformationFill, RiTimeZoneLine } from "react-icons/ri";

function ListProgram({
  pelatihan,
  type,
}: {
  pelatihan: PelatihanMasyarakat[];
  type: string;
}) {
  const filteredPelatihan = pelatihan.filter(
    (item) => item.Status == "Publish"
  );

  return (
    <div>
      {filteredPelatihan.length > 0 ? (
        <Swiper
          slidesPerView={1}
          spaceBetween={15}
          freeMode={true}
          navigation={true}
          modules={[FreeMode, Navigation]}
          className="mySwiper w-full md:max-w-7xl"
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 5 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
        >
          {filteredPelatihan.map(
            (pelatihan: PelatihanMasyarakat, index: number) => (
              <SwiperSlide key={index}>
                <CardPelatihan pelatihan={pelatihan} />
              </SwiperSlide>
            )
          )}
        </Swiper>
      ) : (
        <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6">
          <div className="pt-7 md:pt-0 flex flex-col items-center">
            <Image
              src={"/illustrations/not-found.png"}
              alt="Not Found"
              width={0}
              height={0}
              className="w-[350px] md:w-[400px]"
            />
            <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
              <h1 className="text-2xl md:text-3xl font-calsans leading-[110%] text-gray-200">
                Belum Ada Pelatihan
              </h1>
              <div className="text-gray-400 text-center max-w-md">
                Balai Pelatihan belum mengupload pelatihan yang dapat kamu ikut,
                stay tune terus sobat elaut!{" "}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CardPelatihan = ({ pelatihan }: { pelatihan: PelatihanMasyarakat }) => {
  return (
    <div className="relative w-full md:w-[380px] h-fit rounded-3xl p-6 
      bg-white/10 backdrop-blur-xl border border-white/20 
      shadow-xl text-gray-200 flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center gap-3 mt-3">
        <h2 className="text-xl font-calsans text-white leading-none drop-shadow-md">
          {truncateText(pelatihan?.NamaPelatihan, 100, "...")}
        </h2>
      </div>

      {/* Location */}
      <div className="flex flex-col py-5">
        <div className="flex items-center gap-2 text-gray-300">
          <TbMoneybag size={18} className="text-blue-400 flex-shrink-0" />
          <p className="text-sm">Biaya - {pelatihan.HargaPelatihan === 0
            ? "Gratis"
            : `${formatToRupiah(pelatihan.HargaPelatihan)}`}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <TbCalendar size={18} className="text-blue-400 flex-shrink-0" />
          <p className="text-sm">Pendaftaran : {pelatihan!.TanggalMulaiPendaftaran != '' ? <>{generateTanggalPelatihan(pelatihan.TanggalMulaiPendaftaran)} - {generateTanggalPelatihan(pelatihan.TanggalBerakhirPendaftaran!)}</> : <>-</>}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <TbClock size={18} className="text-blue-400 flex-shrink-0" />
          <p className="text-sm">Pelaksanaan : {generateTanggalPelatihan(pelatihan.TanggalMulaiPelatihan)} - {generateTanggalPelatihan(pelatihan.TanggalBerakhirPelatihan)}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <TbMapPin size={18} className="text-blue-400 flex-shrink-0" />
          <p className="text-sm">{pelatihan.LokasiPelatihan}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <TbBuilding size={18} className="text-blue-400 flex-shrink-0" />
          <p className="text-sm">Penyelenggara - {pelatihan!.PenyelenggaraPelatihan}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <HiOutlineUserGroup size={17} className="text-blue-400 flex-shrink-0" />
          <p className="text-sm">Pendaftar - {pelatihan?.JumlahPeserta}/{pelatihan.KoutaPelatihan} Peserta</p>
        </div>
      </div>


      {/* Description */}
      <p
        dangerouslySetInnerHTML={{
          __html: pelatihan && truncateText(pelatihan?.DetailPelatihan, 100, "..."),
        }}
        className="text-gray-300 prose-invert text-sm leading-relaxed mb-4"
      />

      {/* Button */}
      <div className="flex flex-col md:flex-row gap-1 w-full">
        {
          pelatihan?.StatusApproval == "Selesai" && <Link
            href={`#`}
            className="w-full flex items-center justify-center text-center font-semibold px-6 py-3 
          bg-gray-500/90 hover:bg-gray-600/90 
          backdrop-blur-md border border-white/20 
          rounded-3xl text-white shadow-md transition text-sm"
          >
            <RiTimeZoneLine className="w-5 h-5" />
            Telah Berakhir
          </Link>
        }

        <Link
          href={`/layanan/pelatihan/${createSlug(
            pelatihan.NamaPelatihan
          )}/${pelatihan?.KodePelatihan}/${encryptValue(pelatihan?.IdPelatihan)}`}
          className="w-full flex items-center justify-center text-center font-semibold px-6 py-3 
          bg-blue-500/90 hover:bg-blue-600/90 
          backdrop-blur-md border border-white/20 
          rounded-3xl text-white shadow-md transition text-sm"
        >
          <RiInformationFill className="w-5 h-5" /> Lihat Detail
        </Link>
      </div>

    </div>
  );
};

export default ListProgram;
