"use client";

import React from "react";
import { TbBroadcast, TbFileCertificate } from "react-icons/tb";
import TableDataPenerbitanSertifikat from "../Pelatihan/TableDataPenerbitanSertifikat";
import { RiVerifiedBadgeFill } from "react-icons/ri";

const PenerbitanSertifikat: React.FC = () => {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row gap-2 items-center">
          <RiVerifiedBadgeFill className="text-4xl" />
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold font-calsans leading-[100%]">
              Penerbitan Sertifikat Pelatihan
            </h1>
            <p className="font-normal text-gray-400 text-base -mt-1 leading-none max-w-2xl">
              Lihat pemberitahuan pelaksanaan pelatihan di balai pelatihan dan
              lakukan approval pelaksanaan untuk melanjutkan proses pelaksanaan
              oleh balai!
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6 2xl:mt-7.5">
        <TableDataPenerbitanSertifikat />
      </div>
    </>
  );
};

export default PenerbitanSertifikat;
