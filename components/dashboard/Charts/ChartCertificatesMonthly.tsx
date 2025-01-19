import { BlankoKeluar } from "@/types/blanko";
import { formatDateTime, getMonthFromDateString } from "@/utils";
import React, { useState } from "react";
import { AreaCharts } from "./AreaCharts";

const ChartCertificatesMonthly: React.FC<{ data: BlankoKeluar[], dataSertifikat: any }> = ({
  data, dataSertifikat
}) => {
  return (
    <div className="col-span-12 rounded-xl border mb-10 border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default   sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="mb-3 justify-between gap-4 sm:flex flex-col w-full">
          <div>
            <h5 className="text-xl font-semibold text-black">
              Grafik Penerbitan Sertifikat per Bulan
            </h5>
            <p className="italic text-sm">{formatDateTime()}</p>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <AreaCharts data={data} dataSertifikat={dataSertifikat} />
        </div>
      </div>
    </div>
  );
};

export default ChartCertificatesMonthly;
