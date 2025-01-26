"use client";

import Logo from "./logo";
import LogoFooter from "./logo-footer";

export default function Footer() {
  return (
    <footer className="bg-white shadow-custom px-10 md:px-0">
      <div className="max-w-7xl mx-auto ">
        {/* Top area: Blocks */}
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12 border-t border-t-[#979797]">
          {/* 1st block */}
          <div className="sm:col-span-12 lg:col-span-3">
            <div className="mb-4">
              <LogoFooter />
            </div>
            <p className="text-[#979797] text-sm leading-normal transition duration-150 ease-in-out">
              Aplikasi Pelatihan serta sertifikasi KP yang dikembangkan oleh
              BPPSDMKP untuk menjaring masyarakat KP, aparatur KP, dll untuk
              meningkatkan kompetensi di bidang KP.
            </p>
          </div>

          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-blue-500 font-bold mb-2">Layanan</h6>
            <ul className="text-sm">
              <li className="mb-2">
                <a
                  href="#0"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  Pelatihan Masyarakat
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#0"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  Pelatihan Aparatur
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#0"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  Sertifikasi atau Uji Kompetensi
                </a>
              </li>
            </ul>
          </div>

          {/* 3rd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-blue-500 font-bold mb-2">Program Pelatihan</h6>
            <ul className="text-sm">
              <li className="mb-2">
                <a
                  href="/layanan/program/perikanan"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  Perikanan
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/layanan/program/akp"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  Awak Kapal Perikanan
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/layanan/program/kelautan"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  Kelautan
                </a>
              </li>
            </ul>
          </div>

          {/* 2nd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-blue-500 font-bold mb-2">
              Balai Pelatihan dan Sertifikasi
            </h6>
            <ul className="text-sm">
              <li className="mb-2">
                <a
                  href="https://ppid.sipelatihaksi.com/"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  BPPP Medan
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://sites.google.com/view/ppidbppakkp"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  BDA Sukamandi
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://bppptegal.id/tentang-kami"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  BPPP Tegal
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://www.bpppbanyuwangi.com/"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  BPPP Banyuwangi
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://bp3ambon.kkp.go.id/"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  BPPP Ambon
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://bpppbitung.id/#"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  BPPP Bitung
                </a>
              </li>
            </ul>
          </div>

          {/* 4th block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-blue-500 font-bold mb-2">Lembaga/Instansi</h6>
            <ul className="text-sm">
              <li className="mb-2">
                <a
                  href="/"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  BPPSDM KP
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  Pusat Pelatihan KP
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/lembaga/dpkakp"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  DPKAKP
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/lembaga/komite-approval"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  Komite Approval
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/lembaga/p2mkp"
                  className="text-[#979797] hover:text-gray-400 transition duration-150 ease-in-out"
                >
                  P2MKP
                </a>
              </li>
            </ul>
          </div>

          {/* 5th block */}
        </div>

        {/* Bottom area */}
        <div className="md:flex md:items-center md:justify-between py-4 md:py-8 border-t border-[#979797]">
          {/* Social as */}
          <ul className="flex mb-4 md:order-1 md:ml-4 md:mb-0">
            <li>
              <a
                href="#0"
                className="flex justify-center items-center text-gray-900 hover:text-gray-400 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out"
                aria-label="Twitter"
              >
                <svg
                  className="w-8 h-8 fill-current"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Zm-.74 1.347h-1.457l8.875 11.232h1.36l-8.778-11.232Z" />
                </svg>
              </a>
            </li>
            <li className="ml-4">
              <a
                href="#0"
                className="flex justify-center items-center text-gray-900 hover:text-gray-400 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out"
                aria-label="Github"
              >
                <svg
                  className="w-8 h-8 fill-current"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z" />
                </svg>
              </a>
            </li>
            <li className="ml-4">
              <a
                href="#0"
                className="flex justify-center items-center text-gray-900 hover:text-gray-400 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out"
                aria-label="Facebook"
              >
                <svg
                  className="w-8 h-8 fill-current"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14.023 24L14 17h-3v-3h3v-2c0-2.7 1.672-4 4.08-4 1.153 0 2.144.086 2.433.124v2.821h-1.67c-1.31 0-1.563.623-1.563 1.536V14H21l-1 3h-2.72v7h-3.257z" />
                </svg>
              </a>
            </li>
          </ul>

          {/* Copyrights note */}
          <div className="text-sm text-[#979797] mr-4">
            &copy; BPPSDM KP. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
