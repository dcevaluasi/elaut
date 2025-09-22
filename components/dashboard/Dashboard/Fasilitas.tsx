"use client";
import React from "react";
import TableDataFasilitas from "../Fasilitas/TableDataFasilitas";
import { BiBed } from "react-icons/bi";

const Fasilitas: React.FC = () => {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row gap-2 items-center">
          <BiBed className="text-4xl" />
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium leading-[100%] font-calsans">
              Database Fasilitas Penginapan
            </h1>
            <p className="font-medium text-gray-400 text-base">
              Tambahkan data fasilitas penginapan untuk penyelenggaran pelatihan
              di lemdiklat mu!
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6 2xl:mt-7.5">
        <TableDataFasilitas />
      </div>
    </>
  );
};

export default Fasilitas;
