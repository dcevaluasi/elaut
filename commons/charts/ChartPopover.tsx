import { Blanko, BlankoKeluar, BlankoRusak } from "@/types/blanko";
import { formatDateTime } from "@/utils";
import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

interface ChartThreeState {
  series: number[];
}

const options: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
  },
  colors: ["#3C50E0", "#6577F3"],
  labels: ["CoC (Certificate of Competence)", "CoP (Certificate of Profecy)"],
  legend: {
    show: false,
    position: "bottom",
  },

  plotOptions: {
    pie: {
      donut: {
        size: "55%",
        background: "transparent",
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 340,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
};

const ChartPopover: React.FC<{
  data: Blanko[];
  dataSertifikat: any;
  dataBlankoRusak: BlankoRusak[];
}> = ({ data, dataSertifikat, dataBlankoRusak }) => {
  const [state, setState] = useState<ChartThreeState>({
    series: [
      data
        .filter((item) => item.TipeBlanko === "Certificate of Competence (CoC)")
        .reduce((total, item) => total + item.JumlahPengadaan, 0) -
      dataSertifikat.CoC -
      dataBlankoRusak.filter(
        (item) => item.Tipe === "Certificate of Competence (CoC)"
      ).length,
      data
        .filter(
          (item) => item.TipeBlanko === "Certificate of Proficiency (CoP)"
        )
        .reduce((total, item) => total + item.JumlahPengadaan, 0) -
      dataSertifikat.CoP -
      dataBlankoRusak.filter(
        (item) => item.Tipe === "Certificate of Proficiency (CoP)"
      ).length,
    ],
  });

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      series: [65, 34, 12, 56],
    }));
  };
  handleReset;

  return (
    <div
      className={`col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-5 w-full`}
    >
      <div className="mb-3 justify-between gap-4 sm:flex w-full">
        <div>
          <h5 className="text-xl font-semibold text-black ">
            Sisa Persediaan Blanko
          </h5>
          <p className="italic text-sm">{formatDateTime()}</p>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart
            options={options}
            series={state.series}
            type="donut"
          />
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-primary"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black ">
              <span>CoC (Certificate of Competence)</span>
            </p>
            <span>
              {" "}
              {data
                .filter(
                  (item) =>
                    item.TipeBlanko === "Certificate of Competence (CoC)"
                )
                .reduce((total, item) => total + item.JumlahPengadaan, 0) -
                dataSertifikat.CoC -
                dataBlankoRusak.filter(
                  (item) => item.Tipe === "Certificate of Competence (CoC)"
                ).length}
            </span>
          </div>
        </div>

        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#8FD0EF]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black ">
              <span>CoP (Certificate of Profecy)</span>
            </p>
            <span className="ml-3">
              {" "}
              {data
                .filter(
                  (item) =>
                    item.TipeBlanko === "Certificate of Proficiency (CoP)"
                )
                .reduce((total, item) => total + item.JumlahPengadaan, 0) -
                dataSertifikat.CoP -
                dataBlankoRusak.filter(
                  (item) => item.Tipe === "Certificate of Proficiency (CoP)"
                ).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPopover;
