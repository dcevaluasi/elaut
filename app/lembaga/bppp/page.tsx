"use client";

import HeroBPPP from "@/components/bppp/HeroBPPP";
import Footer from "@/components/ui/footer";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function page() {
  return (
    <>
      <HeroBPPP />
      <section className="bg-white w-full pb-10 px-4">
        <div className="py-4 mx-auto w-full sm:py-4  flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 h-full">
            <div className="col-span-2 sm:col-span-1 md:col-span-2 bg-gray-50 h-auto md:h-full flex flex-col">
              <Link
                href="/lembaga/bppp/ambon"
                className="group relative flex flex-col overflow-hidden rounded-3xl px-4 pb-4 pt-40 flex-grow"
              >
                <Image
                  fill={true}
                  src="/images/balai-pelatihan/ambon.jpg"
                  alt=""
                  className="absolute inset-0  object-cover group-hover:scale-105 group transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60  group-hover:bg-opacity-10 duration-700"></div>

                <div className="flex flex-col gap-1  absolute top-0 left-0 mt-3 p-4 ">
                  <h3 className="z-10 text-2xl font-medium text-white xs:text-xl md:text-3xl font-calsans leading-none ">
                    BPPP Ambon
                  </h3>
                  <p className="text-gray-300 text-sm leading-none">
                    Balai Pelatihan dan Penyuluhan Perikanan Ambon
                  </p>
                </div>
              </Link>
            </div>
            <div className="col-span-2 sm:col-span-1 md:col-span-2 bg-stone-50">
              <Link
                href="/lembaga/bppp/banyuwangi"
                className="group relative flex flex-col overflow-hidden rounded-3xl px-4 pb-4 pt-40 mb-4"
              >
                <Image
                  fill={true}
                  src="/images/balai-pelatihan/banyuwangi.jpg"
                  alt=""
                  className="absolute inset-0  object-cover group-hover:scale-105 group transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60  group-hover:bg-opacity-10 duration-700"></div>
                <div className="flex flex-col gap-1  absolute top-0 left-0 mt-3 p-4 ">
                  <h3 className="z-10 text-2xl font-medium text-white xs:text-xl md:text-3xl font-calsans leading-none ">
                    BPPP Banyuwangi
                  </h3>
                  <p className="text-gray-300 text-sm leading-none">
                    Balai Pelatihan dan Penyuluhan Perikanan Banyuwangi
                  </p>
                </div>
              </Link>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
                <Link
                  href="/lembaga/bppp/bitung"
                  className="group relative flex flex-col overflow-hidden rounded-3xl px-4 pb-4 pt-40"
                >
                  <Image
                    fill={true}
                    src="/images/balai-pelatihan/bitung.jpg"
                    alt=""
                    className="absolute inset-0  object-cover group group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-60  group-hover:bg-opacity-10 duration-700"></div>
                  <div className="flex flex-col gap-1  absolute top-0 left-0 mt-3 p-4 ">
                    <h3 className="z-10 text-2xl font-medium text-white xs:text-xl md:text-3xl font-calsans leading-none ">
                      BPPP Bitung
                    </h3>
                    <p className="text-gray-300 text-sm leading-none">
                      Balai Pelatihan dan Penyuluhan Perikanan Bitung
                    </p>
                  </div>
                </Link>
                <Link
                  href="/lembaga/bppp/sukamandi"
                  className="group relative flex flex-col overflow-hidden rounded-3xl px-4 pb-4 pt-40"
                >
                  <Image
                    fill={true}
                    src="/images/balai-pelatihan/sukamandi.jpg"
                    alt=""
                    className="absolute inset-0  object-cover group-hover:scale-105 group transition-transform duration-500 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-60  group-hover:bg-opacity-10 duration-700"></div>
                  <div className="flex flex-col gap-1  absolute top-0 left-0 mt-3 p-4 ">
                    <h3 className="z-10 text-2xl font-medium text-white xs:text-xl md:text-3xl font-calsans leading-none ">
                      BDA Sukamandi
                    </h3>
                    <p className="text-gray-300 text-sm leading-none">
                      Balai Pendidikan dan Pelatihan Aparatur Sukamandi
                    </p>
                  </div>
                </Link>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 md:col-span-1 bg-sky-50 h-auto md:h-full flex flex-col">
              <Link
                href="/lembaga/bppp/medan"
                className="group relative flex flex-col overflow-hidden rounded-3xl px-4 pb-4 pt-40 flex-grow"
              >
                <Image
                  fill={true}
                  src="/images/balai-pelatihan/medan.jpg"
                  alt=""
                  className="absolute inset-0 h-full group w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60  group-hover:bg-opacity-10 duration-700"></div>
                <div className="flex flex-col gap-1  absolute top-0 left-0 mt-3 p-4 ">
                  <h3 className="z-10 text-2xl font-medium text-white xs:text-xl md:text-3xl font-calsans leading-none ">
                    BPPP Medan
                  </h3>
                  <p className="text-gray-300 text-sm leading-none">
                    Balai Pelatihan dan Penyuluhan Perikanan Medan
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 md:col-span-2 bg-gray-50 h-auto md:h-[50vh] flex flex-col relative">
            <Link
              href="/lembaga/bppp/tegal"
              className="group relative flex flex-col overflow-hidden rounded-3xl px-4 pb-4 pt-40 flex-grow group"
            >
              <Image
                fill={true}
                src="/images/balai-pelatihan/tegal.jpg"
                alt=""
                className="absolute inset-0  object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
              />
              <div className="absolute inset-0 bg-black bg-opacity-60  group-hover:bg-opacity-10 duration-700"></div>
              <div className="flex flex-col gap-1  absolute top-0 left-0 mt-3 p-4 ">
                <h3 className="z-10 text-2xl font-medium text-white xs:text-xl md:text-3xl font-calsans leading-none ">
                  BLU BPPP Tegal
                </h3>
                <p className="text-gray-300 text-sm leading-none">
                  Badan Layanan Usaha Balai Pelatihan dan Penyuluhan Perikanan
                  Tegal
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default page;
