"use client";

import React from "react";
import { BsSendArrowUp } from "react-icons/bs";
const PengajuanPelatihan: React.FC = () => {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row gap-2 items-center">
          <BsSendArrowUp className="text-4xl" />
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium leading-[100%] font-calsans">
              Pemberitahuan ke Pusat
            </h1>
            <p className="font-medium text-gray-400 text-base">
              Sudah ingin menyelenggarakan pelatihan? beri tahu ke pusat
              sekarang!
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6 2xl:mt-7.5">
      </div>
    </>
  );
};

export default PengajuanPelatihan;
