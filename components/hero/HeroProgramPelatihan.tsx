"use client";

import React from "react";
import ScrollDown from "../scroll-down";
import { Bounce, Slide } from "react-awesome-reveal";

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
import { getLastValuePath } from "@/lib/utils";
import { usePathname } from "next/navigation";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "./../../app/css/navigation.css";

// Import Swiper modules
import { Pagination, Navigation, FreeMode } from "swiper/modules";
import Link from "next/link";
import Logo from "../ui/logo";
import PencarianPelatihan from "../landing/PencarianPelatihan";
import Marquee from "react-fast-marquee";
import { AKP_CERTIFICATIONS, AQUACULTURE_CERTIFICATIONS, OCEAN_CERTIFICATIONS } from "@/constants/serkom";

export default function HeroProgramPelatihan({ program }: { program: string }) {
  const programPelatihan =
    program == "akp"
      ? "Awak Kapal Perikanan"
      : program == "perikanan"
        ? "Perikanan"
        : "Kelautan";

  const certifications =
    program == "akp"
      ? AKP_CERTIFICATIONS
      : program == "perikanan"
        ? AQUACULTURE_CERTIFICATIONS
        : OCEAN_CERTIFICATIONS;

  const detailProgramPelatihan: DetailProgramPelatihan = {
    akp: {
      description:
        "Program Pelatihan Awak Kapal Perikanan membekali peserta dengan keterampilan penangkapan ikan, navigasi, dan keselamatan di laut. Dapatkan sertifikasi resmi untuk meningkatkan karier di sektor perikanan dengan fokus pada praktik berkelanjutan dan keselamatan kerja.",
      images: [
        "/images/program-pelatihan/dummies/akp/akp-1.jpg",
        "/images/program-pelatihan/dummies/akp/akp-2.jpg",
        "/images/program-pelatihan/dummies/akp/akp-3.JPG",
        "/images/program-pelatihan/dummies/akp/akp-4.jpg",
        "/images/program-pelatihan/dummies/akp/akp-5.jpg",
        "/images/program-pelatihan/dummies/akp/akp-6.jpg",
      ],
    },
    perikanan: {
      description:
        "Program Pelatihan Perikanan mengajarkan keterampilan dan pengetahuan di bidang perikanan, termasuk teknik penangkapan, budidaya, dan pengelolaan sumber daya laut. Dengan pelatihan praktis dan teori, peserta mendapatkan sertifikasi yang mendukung pengembangan karier di industri ini.",
      images: [
        "/images/program-pelatihan/dummies/perikanan/perikanan.jpg",
        "/images/program-pelatihan/dummies/perikanan/perikanan-2.jpg",
        "/images/program-pelatihan/dummies/perikanan/perikanan-3.jpg",
        "/images/program-pelatihan/dummies/perikanan/perikanan-5.jpg",
        "/images/program-pelatihan/dummies/perikanan/perikanan-7.jpg",
        "/images/program-pelatihan/dummies/perikanan/perikanan-6.jpg",
      ],
    },

    kelautan: {
      description:
        "Program Pelatihan Awak Kapal Perikanan membekali peserta dengan keterampilan penangkapan ikan, navigasi, dan keselamatan di laut. Dapatkan sertifikasi resmi untuk meningkatkan karier di sektor perikanan dengan fokus pada praktik berkelanjutan dan keselamatan kerja.",
      images: [
        "/images/program-pelatihan/dummies/kelautan/kelautan.jpg",
        "/images/program-pelatihan/dummies/kelautan/kelautan-2.jpg",
        "/images/program-pelatihan/dummies/kelautan/kelautan-3.jpg",
        "/images/program-pelatihan/dummies/kelautan/kelautan-4.jpeg",
        "/images/program-pelatihan/dummies/kelautan/kelautan-5.jpg",
        "/images/program-pelatihan/dummies/kelautan/kelautan-6.jpg",
      ],
    },
  };

  const description =
    detailProgramPelatihan[program as keyof DetailProgramPelatihan]
      ?.description || "Program tidak tersedia saat ini.";

  const images =
    detailProgramPelatihan[program as keyof DetailProgramPelatihan]?.images ||
    [];

  const [imageIndex, setImageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const [selectedProgram, setSelectedProgram] = React.useState<number | null>(
    null
  );

  return (
    <div className="flex flex-col gap-2 w-full md:px-10 md:py-5">
      <section className="relative h-[70vh] md:rounded-3xl  flex items-center ">
        <Image
          src={images[imageIndex]}
          className="absolute w-full h-[70vh] md:rounded-3xl  object-cover duration-1000  "
          alt=""
          layout="fill"
          priority
          onClick={(e) => setSelectedProgram(null)}
        />

        <div
          className="absolute w-full h-[70vh] md:rounded-3xl bg-black bg-opacity-70  "
          onClick={(e) => setSelectedProgram(null)}
        ></div>

        {/* Illustration behind hero content */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none -z-1"
          aria-hidden="true"
          onClick={(e) => setSelectedProgram(null)}
        >
          <svg
            width="1360"
            height="578"
            viewBox="0 0 1360 578"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                x1="50%"
                y1="0%"
                x2="50%"
                y2="100%"
                id="illustration-01"
              >
                <stop stopColor="#FFF" offset="0%" />
                <stop stopColor="#EAEAEA" offset="77.402%" />
                <stop stopColor="#DFDFDF" offset="100%" />
              </linearGradient>
            </defs>
            <g fill="url(#illustration-01)" fillRule="evenodd">
              <circle cx="1232" cy="128" r="128" />
              <circle cx="155" cy="443" r="64" />
            </g>
          </svg>
        </div>

        <div className="max-w-7xl z-[40] w-full mx-auto relative flex flex-col items-start justify-center text-left">
          {/* Hero content */}
          <div className="flex w-full flex-col items-center justify-between">
            {/* Section header */}
            <div className=" flex flex-col -mt-10 h- justify-center w-full items-center px-6 md:px-0 md:mt-3 text-center relative">
              <h1 className="font-bold text-blue-500 text-5xl md:text-6xl font-calsans leading-none w-full text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-teal-500 to-gray-200">
                  {programPelatihan}{" "}
                </span>
              </h1>
              {program == "akp" ? (
                <p className="text-gray-200 leading-none text-center max-w-3xl w-full text-base md:text-lg mx-auto">
                  Pendidikan dan Pelatihan Awak Kapal Perikanan adalah
                  pendidikan dan/atau pelatihan untuk mencapai tingkat keahlian
                  dan/atau keterampilan tertentu sesuai dengan jenjang,
                  kompetensi, dan jabatan untuk awak Kapal Perikanan.
                </p>
              ) : program == "perikanan" ? (
                <p className="text-gray-200 leading-none text-center max-w-3xl w-full text-base md:text-lg mx-auto">
                  Pelatihan Perikanan adalah program pendidikan dan/atau
                  pelatihan yang bertujuan untuk meningkatkan keterampilan dan
                  pengetahuan dalam bidang perikanan, mencakup teknik
                  penangkapan ikan, pengelolaan sumber daya perikanan, hingga
                  pengolahan hasil tangkapan.
                </p>
              ) : (
                <p className="text-gray-200 leading-none text-center max-w-3xl w-full text-base md:text-lg mx-auto">
                  Pelatihan Kelautan adalah pendidikan dan/atau pelatihan yang
                  dirancang untuk meningkatkan kompetensi dan keterampilan dalam
                  bidang kelautan, meliputi pengelolaan sumber daya laut,
                  teknologi kelautan, serta keamanan dan keselamatan di laut.
                </p>
              )}
              <Marquee
                className='max-w-4xl mt-5'
              >
                {certifications.map((text: string, index: number) => (
                  <p key={index} className="text-base mx-2 text-white border border-white rounded-2xl px-4 py-2">
                    {text}&nbsp;&nbsp;&nbsp;
                  </p>
                ))}
              </Marquee>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type ProgramDetails = {
  description: string;
  images: string[];
};

type DetailProgramPelatihan = {
  akp: ProgramDetails;
  perikanan: ProgramDetails;
  kelautan: ProgramDetails;
};

function RagamBidangPelatihan() {
  const programPelatihanPath = getLastValuePath(usePathname());
  const [selectedJenisPelatihan, setSelectedJenisPelatihan] =
    React.useState<string>("");

  const akp = [
    {
      id: 1,
      name: "BSTF",
      longname: "Basic Safety Training Fisheries",
      description:
        "Pelatihan dasar keselamatan untuk awak kapal perikanan yang mencakup penanganan situasi darurat di laut.",
      component: (
        <FaShip className="group-hover:scale-125 text-black group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
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
        <FaCertificate className="group-hover:scale-125 text-black group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
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
        <FaAnchor className="group-hover:scale-125 text-black group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
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
        <FaRegFileAlt className="group-hover:scale-125 text-black group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-3xl" />
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
        <FaMedal className="group-hover:scale-125 text-black group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
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
        <FaScrewdriver className="group-hover:scale-125 text-black group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-4xl" />
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
        <FaTachometerAlt className="group-hover:scale-125 text-black group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-3xl" />
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
        <FaStar className="group-hover:scale-125 text-black group-hover:text-gray-100 relative z-20 group-hover:-rotate-[20deg] duration-700 text-3xl" />
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
    <div className="w-full   gap-5 mb-10 ">
      <div className="flex flex-col gap-6 w-full relative">
        <Image
          src={"/diklat/bstf-2.jpg"}
          className="absolute w-full h-full object-cover duration-1000  "
          alt=""
          layout="fill"
          priority
        />

        <div className="absolute w-full h-full bg-black bg-opacity-70  "></div>
        <div className="flex flex-col text-center max-w-xl mx-auto">
          <p className="text-blue-500 font-semibold mb-3">RAGAM SERTIFIKASI</p>
          <h2 className="font-bold font-calsans text-black text-4xl leading-none">
            Awak Kapal Perikanan
          </h2>
          <p className="text-gray-600 leading-normal text-center ">
            Ragam Sertifikasi: Tingkatkan kompetensi Anda dengan berbagai
            sertifikasi khusus awak kapal perikanan yang diakui secara nasional
            melalui program diklat ataupun ujian, untuk mendukung karir dan
            keberlanjutan laut.
          </p>
        </div>
        <div className="w-full h-fit">
          <Swiper
            slidesPerView={5}
            spaceBetween={10}
            freeMode={true}
            pagination={{
              clickable: true,
            }}
            initialSlide={4}
            navigation={true}
            modules={[FreeMode, Navigation]}
            className="mySwiper !w-full !px-4 md:!px-20" // Adjust padding for mobile
            breakpoints={{
              320: {
                // For smaller screens
                slidesPerView: 3,
                spaceBetween: 5,
              },
              640: {
                slidesPerView: 3,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 30,
              },
            }}
          >
            {programPelatihanPath == "akp" &&
              akp.map((item, index) => (
                <Bounce key={index}>
                  <SwiperSlide>
                    <div className="flex w-full h-[100px] relative border border-gray-400 rounded-3xl duration-700 items-center gap-2 group cursor-pointer hover:bg-blue-500 justify-center">
                      <Image
                        src={item.img}
                        className="absolute w-full rounded-3xl h-full object-cover duration-700 group-hover:block hidden"
                        alt=""
                        layout="fill"
                        priority
                      />
                      <div className="absolute w-full h-full rounded-3xl bg-darkDPKAKP bg-opacity-70 group-hover:bg-opacity-50 group-hover:block hidden duration-700"></div>
                      <div className="flex relative z-20 px-5 gap-2 items-center justify-center">
                        {item.component}
                        <div className="flex flex-col z-10 relative group-hover:ml-1">
                          <h1 className="font-calsans font-semibold text-2xl text-black group-hover:text-gray-100 duration-700 group-hover:text-2xl group-hover:mt-0 mt-2 leading-[105%]">
                            {item.name}
                          </h1>
                          <p className="text-xs leading-[100%] hidden group-hover:block text-gray-300 group-hover:text-gray-100 duration-700">
                            {item.longname}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                </Bounce>
              ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
