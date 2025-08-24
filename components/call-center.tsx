"use client";

import Image from "next/image";
import React from "react";
import { Bounce, Slide } from "react-awesome-reveal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { IoLogoWhatsapp } from "react-icons/io";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DIALOG_TEXTS } from "@/constants/texts";
import { CALL_CENTER_CONTACTS } from "@/constants/services";

function CallCenter() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={`${usePathname().includes('lemdiklat') || usePathname().includes('pusat') || usePathname().includes('instruktur/form') ? 'hidden' : 'flex'} flex-col gap-3 w-fit fixed right-3 md:right-10 bottom-24 md:bottom-10 z-[9999999]`}>
      <Link href={''} title='Manual Book User E-LAUT' className="gap-4 ">
        <Bounce duration={1000}>
          <div className="flex flex-col gap-2 cursor-pointer items-center duration-1000 hover:scale-105 text-center">
            <div className="flex flex-col items-center justify-center  bg-white shadow-custom rounded-full w-16 h-16 p-2">
              <Image
                className="w-10"
                width={0}
                height={0}
                src={"/icons/icbsre.png"}
                alt="Kementrian Kelautan dan Perikanan RI Logo"
              />
            </div>
          </div>
        </Bounce>
      </Link>
      <AlertDialog open={open}>
        <AlertDialogTrigger>
          <div onClick={(e) => setOpen(true)} title='Call Center E-LAUT' className="gap-4 ">
            <Bounce duration={1000}>
              <div className="flex flex-col gap-2 cursor-pointer items-center duration-1000 hover:scale-105 text-center">
                <div className="flex flex-col items-center justify-center  bg-white shadow-custom rounded-full w-16 h-16 p-2">
                  <Image
                    className="w-10"
                    width={0}
                    height={0}
                    src={"/illustrations/call-center.png"}
                    alt="Kementrian Kelautan dan Perikanan RI Logo"
                  />
                </div>
              </div>
            </Bounce>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle >
              {DIALOG_TEXTS['Layanan Call Center'].title}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {DIALOG_TEXTS['Layanan Call Center'].desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col space-y-1">
            <div className="flex flex-col space-y-2">
              <h4 className="text-sm font-semibold">Layanan Pengaduan dan Informasi Pusat Pelatihan KP</h4>
              <div className="">
                <AlertDialogAction className="hover:bg-blue-500 text-grayUsual border border-grayUsual hover:text-white hover:border-blue-500 bg-transparent flex gap-2 items-center group duration-700">
                  <Link
                    href={
                      `https://wa.me/`
                    }
                    target="_blank"
                    title={'Call Center Pusat Pelatihan KP'}
                    className="bg-transparent flex gap-2 items-center group-hover:bg-transparent"
                  >
                    <IoLogoWhatsapp />
                    Call Center Pusat Pelatihan KP
                  </Link>
                </AlertDialogAction>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <h4 className="text-sm font-semibold">Layanan PTSP Balai Pelatihan dan Penyuluhan Perikanan (BPPP)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {
                  CALL_CENTER_CONTACTS.map((item: Record<string, string>, index: number) => (
                    <AlertDialogAction className="hover:bg-blue-500 text-grayUsual border border-grayUsual hover:text-white hover:border-blue-500 bg-transparent flex gap-2 items-center group duration-700">
                      <Link
                        href={
                          `https://api.whatsapp.com/send/?phone=${item.callcenter}&text=Hallo%2C+saya+adalah+masyarakat+yang+mengunjungi+website+E-LAUT.+Saya+mohon+informasi+terkait+pelatihan+di+${item.name}.&type=phone_number&app_absent=0`
                        }
                        target="_blank"
                        title={item.fullName}
                        className="bg-transparent flex gap-2 items-center group-hover:bg-transparent"
                      >
                        <IoLogoWhatsapp />
                        PTSP {item.name}
                      </Link>
                    </AlertDialogAction>

                  ))
                }
              </div>
            </div>
          </div>
          <AlertDialogFooter className="w-full flex flex-col">
            <AlertDialogCancel onClick={(e) => setOpen(false)}>
              Tutup
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}

export default CallCenter;
