"use client";

import Cookies from "js-cookie";
import LogoFooter from "./logo-footer";

const COOKIE_FIRST_TIMER = "XSRF087";
const LINK_CLASS = "text-gray-200 hover:text-gray-400 transition duration-150 ease-in-out";
const SOCIAL_ICON_CLASS = "flex justify-center items-center text-gray-900 hover:text-gray-400 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li className="mb-2">
      <a href={href} className={LINK_CLASS}>
        {children}
      </a>
    </li>
  );
}

interface SocialIconProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

function SocialIcon({ href, label, children }: SocialIconProps) {
  return (
    <li className="ml-4 first:ml-0">
      <a href={href} className={SOCIAL_ICON_CLASS} aria-label={label}>
        {children}
      </a>
    </li>
  );
}

export default function Footer() {
  const isFirstTimerUser = Cookies.get(COOKIE_FIRST_TIMER);

  if (isFirstTimerUser) {
    return null;
  }

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 shadow-custom px-10 md:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12 border-t border-t-gray-400">
          <div className="sm:col-span-12 lg:col-span-3">
            <div className="mb-4">
              <LogoFooter />
            </div>
            <p className="text-gray-200 text-sm leading-normal transition duration-150 ease-in-out">
              Aplikasi Pelatihan serta sertifikasi KP yang dikembangkan oleh
              BPPSDMKP untuk menjaring masyarakat KP, aparatur KP, dll untuk
              meningkatkan kompetensi di bidang KP.
            </p>
          </div>

          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-gray-300 font-bold mb-2">Layanan & Pengaduan</h6>
            <ul className="text-sm space-y-2">
              <FooterLink href="/layanan/maklumat-pelayanan">Maklumat Pelayanan</FooterLink>
              <FooterLink href="/layanan/standar-pelayanan">Standar Pelayanan</FooterLink>
              <FooterLink href="https://span.lapor.go.id">SPAN Lapor</FooterLink>
              <FooterLink href="/layanan/survey-kepuasan">Survey Kepuasan Masyarakat</FooterLink>
              <FooterLink href="/layanan/hasil-survey">Hasil Survei Kepuasan</FooterLink>
              <FooterLink href="/layanan/masukan-saran">Masukan & Saran</FooterLink>
            </ul>
          </div>

          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-gray-300 font-bold mb-2">Program Pelatihan</h6>
            <ul className="text-sm">
              <FooterLink href="/layanan/program/perikanan">Perikanan</FooterLink>
              <FooterLink href="/layanan/program/akp">Awak Kapal Perikanan</FooterLink>
              <FooterLink href="/layanan/program/kelautan">Kelautan</FooterLink>
            </ul>
          </div>

          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-gray-300 font-bold mb-2">Balai Pelatihan dan Sertifikasi</h6>
            <ul className="text-sm">
              <FooterLink href="https://ppid.sipelatihaksi.com/">BPPP Medan</FooterLink>
              <FooterLink href="https://sites.google.com/view/ppidbppakkp">BDA Sukamandi</FooterLink>
              <FooterLink href="https://bppptegal.id/tentang-kami">BPPP Tegal</FooterLink>
              <FooterLink href="https://www.bpppbanyuwangi.com/">BPPP Banyuwangi</FooterLink>
              <FooterLink href="https://bp3ambon.kkp.go.id/">BPPP Ambon</FooterLink>
              <FooterLink href="https://bpppbitung.id/#">BPPP Bitung</FooterLink>
            </ul>
          </div>

          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-gray-300 font-bold mb-2">Lembaga</h6>
            <ul className="text-sm">
              <FooterLink href="https://kkp.go.id/unit-kerja/bppsdmkp.html">BPPSDM KP</FooterLink>
              <FooterLink href="https://kkp.go.id/tentang-kkp/profil-penjabat-list/unker/bppsdmkp/0808000000.html">Pusat Pelatihan KP</FooterLink>
            </ul>
          </div>
        </div>

        <div className="md:flex md:items-center md:justify-between py-4 md:py-8 border-t border-gray-200">
          <ul className="flex mb-4 md:order-1 md:ml-4 md:mb-0">
            <SocialIcon href="#0" label="Twitter">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Zm-.74 1.347h-1.457l8.875 11.232h1.36l-8.778-11.232Z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="#0" label="Github">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="#0" label="Facebook">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.023 24L14 17h-3v-3h3v-2c0-2.7 1.672-4 4.08-4 1.153 0 2.144.086 2.433.124v2.821h-1.67c-1.31 0-1.563.623-1.563 1.536V14H21l-1 3h-2.72v7h-3.257z" />
              </svg>
            </SocialIcon>
          </ul>

          <div className="text-sm text-gray-200 mr-4">
            &copy; BPPSDM KP. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
