"use client";

import React from "react";
import { MdOutlineFastfood } from "react-icons/md";
import TableDataKonsumsi from "../Fasilitas/TableDataKonsumsi";

const Konsumsi: React.FC = () => {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row gap-2 items-center">
          <MdOutlineFastfood className="text-4xl" />
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium leading-[100%] font-calsans">
              Database Konsumsi
            </h1>
            <p className="font-medium text-gray-400 text-base">
              Tambahkan data konsumsi untuk penyelenggaran pelatihan di
              lemdiklat mu!
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6 2xl:mt-7.5">
        <TableDataKonsumsi />
      </div>
    </>
  );
};

export default Konsumsi;
