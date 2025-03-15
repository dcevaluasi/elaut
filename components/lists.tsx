import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/free-mode";

// Import Swiper modules
import { Pagination, Navigation, FreeMode } from "swiper/modules";
import Image from "next/image";
import { TbClockHour2, TbMapPin } from "react-icons/tb";
import Link from "next/link";
import { createSlug, truncateText } from "@/utils";
import { PelatihanMasyarakat } from "@/types/product";
import { encryptValue, formatToRupiah, replaceUrl } from "@/lib/utils";
import { generateTanggalPelatihan } from "@/utils/text";
import '../app/css/navigation.css'

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
          slidesPerView={1} // Adjust this to control how many slides are shown on mobile view
          spaceBetween={15}
          freeMode={true}
          pagination={{
            clickable: true,
          }}
          navigation={true} // Enable navigation arrows
          modules={[FreeMode, Navigation]} // Add Pagination and Navigation modules
          className="mySwiper w-full md:max-w-7xl"
          breakpoints={{
            640: {
              slidesPerView: 1,
              spaceBetween: 5,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }} // Add breakpoints for responsive design
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
              <h1 className="text-2xl md:text-3xl font-calsans leading-[110%] text-black">
                Belum Ada Pelatihan
              </h1>
              <div className="text-gray-600 text-center  max-w-md">
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
    <div className="shadow-custom flex flex-col relative w-full md:w-[380px] h-fit rounded-3xl bg-white p-6">
      <div className="w-full h-[200px] relative">
        <Image
          className="w-full !h-[200px] rounded-2xl object-cover shadow-custom mb-2"
          alt=""
          src={replaceUrl(pelatihan?.FotoPelatihan!)}
          width={0}
          height={0}
        />
        {
          pelatihan.PenyelenggaraPelatihan.includes('Politeknik') && <span
            className="w-fit block text-center font-semibold px-4 py-2 bg-blue-500 rounded-3xl text-white absolute text-xs top-3 z-50 right-3"
          >
            Khusus Taruna KP
          </span>
        }

      </div>

      {/* Header */}
      <div className="flex justify-between items-center gap-3 mt-3">
        <h2 className="text-2xl font-calsans text-blue-500 leading-none">
          {truncateText(pelatihan?.NamaPelatihan, 50, "...")}
        </h2>
        {/* <div className="text-sm font-medium w-fit px-4 py-2 bg-[#625BF9] rounded-3xl text-white leading-none">
          {generateTanggalPelatihan(pelatihan.TanggalMulaiPelatihan)}
        </div> */}
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-blue-500 mb-4">
        <TbMapPin size={18} />
        <p className="text-sm font-medium">{pelatihan.LokasiPelatihan}</p>
      </div>

      {/* Description */}
      <p
        dangerouslySetInnerHTML={{
          __html: pelatihan && truncateText(pelatihan?.DetailPelatihan, 150, "..."),
        }}
        className="text-gray-600 text-sm leading-relaxed mb-4"
      />

      {/* Contact Info */}
      {
        pelatihan!.PenyelenggaraPelatihan.includes('Politeknik') ? <></> : <div className="flex justify-between text-sm text-blue-500 mb-4">
          <div>
            <p className="font-semibold">Layanan {pelatihan.PenyelenggaraPelatihan}</p>
            <p>62887972983</p>
          </div>
          <div>
            <p className="font-semibold">PTSP BLU</p>
            <p>62889812833</p>
          </div>
        </div>
      }


      {/* Pricing */}
      <div className=" mb-4">
        <p className="text-blue-500 text-3xl font-calsans">
          {pelatihan.HargaPelatihan === 0
            ? "Gratis"
            : `${formatToRupiah(pelatihan.HargaPelatihan)}`}
        </p>
        <p className="text-sm font-normal text-blue-500">
          * {pelatihan!.PenyelenggaraPelatihan.includes('Politeknik') ? 'Diperuntukkan untuk taruna Poltek KP dan SUPM' : 'Tidak termasuk akomodasi & konsumsi'} <br />* Kuota Kelas {pelatihan!.KoutaPelatihan} Peserta
        </p>
      </div>

      {/* Button */}
      <Link
        href={`/layanan/pelatihan/${createSlug(pelatihan.NamaPelatihan)}/${pelatihan?.KodePelatihan
          }/${encryptValue(pelatihan?.IdPelatihan)}`}
        className="w-full block text-center font-semibold px-6 py-3 bg-blue-500 rounded-3xl text-white"
      >
        Lihat Detail
      </Link>
    </div>
  );
};


export default ListProgram;
