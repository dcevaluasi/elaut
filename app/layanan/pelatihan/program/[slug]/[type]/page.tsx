"use client";

import FeaturesDiklatKepelautan from "@/components/features-diklat-kepelautan";
import Hero from "@/components/hero";
import HeroProgramPelatihan from "@/components/hero/HeroProgramPelatihan";
import { getLastValuePath } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

import {
  FaShip,
  FaCertificate,
  FaAnchor,
  FaRegFileAlt,
  FaMedal,
  FaScrewdriver,
  FaTachometerAlt,
  FaStar,
  FaShoppingCart,
  FaTint,
  FaSwimmer,
  FaExclamationTriangle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Image from "next/image";
import {
  FaCapsules,
  FaClipboardCheck,
  FaFish,
  FaIndustry,
  FaLandmark,
  FaLeaf,
  FaRecycle,
  FaSnowflake,
  FaUsers,
  FaWater,
} from "react-icons/fa6";
import Footer from "@/components/ui/footer";

function page() {
  const programPelatihanPath = getLastValuePath(usePathname());
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <HeroProgramPelatihan program={programPelatihanPath!} />
      <Footer />
    </>
  );
}

function RagamBidangPelatihan() {
  const programPelatihanPath = getLastValuePath(usePathname());

  const akp = [
    {
      id: 1,
      name: "BSTF",
      longname: "Basic Safety Training Fisheries",
      description:
        "Pelatihan dasar keselamatan untuk awak kapal perikanan yang mencakup penanganan situasi darurat di laut.",
      component: (
        <FaShip className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/akp/akp-6.jpg",
    },
    {
      id: 2,
      name: "ANKAPIN",
      longname: "Ahli Nautika Kapal Penangkap Ikan",
      description:
        "Pelatihan untuk ahli nautika dalam mengoperasikan dan menavigasi kapal penangkap ikan dengan keselamatan dan efisiensi.",
      component: (
        <FaCertificate className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/akp/akp-2.jpg",
    },
    {
      id: 3,
      name: "ATKAPIN",
      longname: "Ahli Teknika Kapal Penangkap Ikan",
      description:
        "Pelatihan teknis untuk ahli teknika dalam pengoperasian mesin kapal penangkap ikan dan perawatan teknis di laut.",
      component: (
        <FaAnchor className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/akp/akp-7.jpg",
    },
    {
      id: 4,
      name: "SKN",
      longname: "Sertifikasi Kecakapan Nelayan",
      description:
        "Sertifikasi resmi untuk memastikan kecakapan nelayan dalam penangkapan ikan dengan standar kompetensi yang berlaku.",
      component: (
        <FaRegFileAlt className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-3xl" />
      ),
      img: "/images/program-pelatihan/dummies/akp/akp-8.jpg",
    },
    {
      id: 5,
      name: "SKPI",
      longname: "Sertifikasi Keterampilan Penangkapan Ikan",
      description:
        "Sertifikasi keterampilan praktis bagi nelayan dalam metode penangkapan ikan yang efisien dan berkelanjutan.",
      component: (
        <FaMedal className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/akp/akp-9.jpg",
    },
    {
      id: 6,
      name: "SOPI",
      longname: "Sertifikat Operasi Perikanan Indonesia",
      description:
        "Sertifikasi yang menunjukkan kemampuan dan keterampilan dalam operasi perikanan secara efisien dan aman.",
      component: (
        <FaScrewdriver className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/akp/akp-10.jpg",
    },
    {
      id: 7,
      name: "FM",
      longname: "Fishing Master",
      description:
        "Sertifikasi untuk menjadi master dalam industri perikanan dengan keterampilan manajerial dan operasional tingkat lanjut.",
      component: (
        <FaTachometerAlt className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-3xl" />
      ),
      img: "/images/program-pelatihan/dummies/akp/akp-6.jpg",
    },
    {
      id: 8,
      name: "Rating",
      longname: "Rating Keahlian",
      description:
        "Penilaian keahlian untuk menentukan tingkat keterampilan dan kompetensi dalam berbagai aspek operasional perikanan.",
      component: (
        <FaStar className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-3xl" />
      ),
      img: "/images/program-pelatihan/dummies/akp/akp-3.jpg",
    },
  ];

  const perikanan = [
    {
      id: 1,
      name: "Penangkapan Ikan",
      longname: "Teknik Penangkapan Ikan",
      description:
        "Pelatihan teknik dan keterampilan dalam menangkap ikan secara efisien dan ramah lingkungan.",
      component: (
        <FaFish className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/perikanan/perikanan-4.jpg",
    },
    {
      id: 2,
      name: "Budidaya Ikan",
      longname: "Teknik Budidaya Ikan",
      description:
        "Pelatihan untuk mengembangkan keterampilan budidaya ikan dengan teknik modern dan berkelanjutan.",
      component: (
        <FaWater className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/perikanan/perikanan.jpg",
    },
    {
      id: 3,
      name: "Pengolahan Hasil Perikanan",
      longname: "Teknik Pengolahan Hasil Perikanan",
      description:
        "Pelatihan dalam mengolah hasil perikanan untuk meningkatkan nilai tambah dan kualitas produk.",
      component: (
        <FaIndustry className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/perikanan/perikanan-3.jpg",
    },
    {
      id: 4,
      name: "Pemasaran & Distribusi",
      longname: "Strategi Pemasaran dan Distribusi Perikanan",
      description:
        "Pelatihan strategi pemasaran dan distribusi hasil perikanan yang efektif dan berkelanjutan.",
      component: (
        <FaShoppingCart className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/perikanan/perikanan-7.jpg",
    },
    {
      id: 5,
      name: "Pengawasan dan Penataan",
      longname: "Pengawasan dan Penataan Perikanan",
      description:
        "Pelatihan dalam pengawasan operasional perikanan untuk memastikan praktik yang sesuai dengan regulasi.",
      component: (
        <FaClipboardCheck className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/perikanan/perikanan-8.jpg",
    },
  ];

  const kelautan = [
    {
      id: 1,
      name: "Reklamasi",
      longname: "Teknik Reklamasi Pesisir",
      description:
        "Pelatihan dalam merancang dan melaksanakan reklamasi pesisir untuk kepentingan pengembangan wilayah.",
      component: (
        <FaLandmark className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/kelautan/kelautan.jpg",
    },
    {
      id: 2,
      name: "Produksi Garam",
      longname: "Teknik Produksi Garam",
      description:
        "Pelatihan metode modern dalam produksi garam dari air laut, untuk meningkatkan efisiensi dan kualitas.",
      component: (
        <FaSnowflake className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/kelautan/kelautan-2.jpg",
    },
    {
      id: 3,
      name: "Pemanfaatan Air Laut",
      longname: "Pemanfaatan Sumber Daya Air Laut",
      description:
        "Pelatihan dalam memanfaatkan air laut untuk berbagai keperluan industri dan kehidupan sehari-hari.",
      component: (
        <FaTint className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/kelautan/kelautan-3.jpg",
    },
    {
      id: 4,
      name: "Penyelaman Ilmiah",
      longname: "Teknik Penyelaman Ilmiah",
      description:
        "Pelatihan penyelaman untuk kegiatan riset ilmiah di laut, termasuk pengambilan sampel dan observasi bawah air.",
      component: (
        <FaSwimmer className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/kelautan/kelautan-4.jpeg",
    },
    {
      id: 5,
      name: "Pemanfaatan Biofarmakologi",
      longname: "Pemanfaatan Biofarmakologi Laut",
      description:
        "Pelatihan dalam memanfaatkan sumber daya laut untuk keperluan biofarmakologi dan pengembangan produk medis.",
      component: (
        <FaCapsules className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/kelautan/kelautan-5.jpg",
    },
    {
      id: 6,
      name: "Pengelolaan BMKT",
      longname: "Pengelolaan Benda Berharga Muatan Kapal Tenggelam",
      description:
        "Pelatihan dalam pengelolaan dan pelestarian benda berharga dari kapal tenggelam yang ditemukan di dasar laut.",
      component: (
        <FaShip className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/kelautan/kelautan-6.jpg",
    },
    {
      id: 7,
      name: "Pengelolaan Kawasan Konservasi",
      longname: "Pengelolaan Kawasan Konservasi Laut",
      description:
        "Pelatihan dalam pengelolaan kawasan konservasi laut untuk melindungi keanekaragaman hayati dan ekosistem laut.",
      component: (
        <FaLeaf className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/kelautan/kelautan-7.jpg",
    },
    {
      id: 8,
      name: "Mitigasi Bencana",
      longname: "Mitigasi Bencana Pesisir",
      description:
        "Pelatihan strategi mitigasi bencana untuk menghadapi ancaman seperti tsunami, banjir rob, dan abrasi di wilayah pesisir.",
      component: (
        <FaExclamationTriangle className="group-hover:scale-125 text-gray-300 group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
      ),
      img: "/images/program-pelatihan/dummies/kelautan/kelautan-8.jpg",
    },
  ];

  return (
    <div className="w-full flex gap-2 mb-10 px-4 mt-4">
      {/* <Swiper
        slidesPerView={3} // Adjust this to control how many slides are shown on mobile view
        spaceBetween={10}
        freeMode={true}
        pagination={{
          clickable: true,
        }}
        navigation={true} // Enable navigation arrows
        modules={[FreeMode, Navigation]} // Add Pagination and Navigation modules
        className="mySwiper w-full  !h-[200px]"
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
        {programPelatihanPath == "akp" &&
          akp.map((item, index) => (
            <SwiperSlide>
              <div className="flex w-full h-[160px] relative shadow-custom  rounded-3xl duration-700 hover:scale-110   flex- items-center gap-2 group cursor-pointer">
                <Image
                  src={item.img}
                  className="absolute w-full rounded-3xl h-full object-cover duration-1000  "
                  alt=""
                  layout="fill"
                  priority
                />
                <div className="absolute w-full h-full rounded-3xl bg-darkDPKAKP bg-opacity-50 group-hover:bg-opacity-30"></div>
                <div className="flex relative z-20 px-5 gap-2">
                  {item.component}{" "}
                  <div className="flex flex-col z-10 relative group-hover:ml-1">
                    <h1 className="font-calsans font-semibold text-4xl text-gray-200 group-hover:text-gray-100 duration-700 group-hover:text-3xl group-hover:mt-0 mt-2 leading-[105%]">
                      {item.name}
                    </h1>
                    <p className="text-xs -mt-[0.5rem] hidden group-hover:block text-gray-300 group-hover:text-gray-100 duration-700">
                      {item.longname}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

        {programPelatihanPath == "perikanan" &&
          perikanan.map((item, index) => (
            <SwiperSlide>
              <div className="flex w-full h-[160px] relative shadow-custom  rounded-3xl duration-700 hover:scale-110   flex- items-center gap-2 group cursor-pointer">
                <Image
                  src={item.img}
                  className="absolute w-full rounded-3xl h-full object-cover duration-1000  "
                  alt=""
                  layout="fill"
                  priority
                />
                <div className="absolute w-full h-full rounded-3xl bg-darkDPKAKP bg-opacity-50 group-hover:bg-opacity-30"></div>
                <div className="flex relative z-20 px-5 gap-2">
                  {item.component}{" "}
                  <div className="flex flex-col z-10 relative group-hover:ml-1">
                    <h1 className="font-calsans font-semibold text-4xl text-gray-200 group-hover:text-gray-100 duration-700 group-hover:text-3xl group-hover:mt-0 mt-2 leading-[105%]">
                      {item.name}
                    </h1>
                    <p className="text-xs -mt-[0.5rem] hidden group-hover:block text-gray-300 group-hover:text-gray-100 duration-700">
                      {item.longname}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

        {programPelatihanPath == "kelautan" &&
          kelautan.map((item, index) => (
            <SwiperSlide>
              <div className="flex w-full h-[160px] relative shadow-custom  rounded-3xl duration-700 hover:scale-110   flex- items-center gap-2 group cursor-pointer">
                <Image
                  src={item.img}
                  className="absolute w-full rounded-3xl h-full object-cover duration-1000  "
                  alt=""
                  layout="fill"
                  priority
                />
                <div className="absolute w-full h-full rounded-3xl bg-darkDPKAKP bg-opacity-50 group-hover:bg-opacity-30"></div>
                <div className="flex relative z-20 px-5 gap-2">
                  {item.component}{" "}
                  <div className="flex flex-col z-10 relative group-hover:ml-1">
                    <h1 className="font-calsans font-semibold text-4xl text-gray-200 group-hover:text-gray-100 duration-700 group-hover:text-3xl group-hover:mt-0 mt-2 leading-[105%]">
                      {item.name}
                    </h1>
                    <p className="text-xs -mt-[0.5rem] hidden group-hover:block text-gray-300 group-hover:text-gray-100 duration-700">
                      {item.longname}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
      </Swiper> */}
    </div>
  );
}

export default page;
