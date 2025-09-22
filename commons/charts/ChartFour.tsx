import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { IoMdArrowDropdown } from "react-icons/io";

interface ChartFourState {
  series: number[];
}

const options: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
  },
  colors: ["#6577F3", "#80CAEE"],
  labels: [
    "ANKAPIN/ATKAPIN I",
    "ANKAPIN/ATKAPIN II",
    "ANKAPIN/ATKAPIN III (Upgrading)",
    "Rating",
  ],
  legend: {
    show: false,
    position: "bottom",
  },

  plotOptions: {
    pie: {
      donut: {
        size: "65%",
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
          width: 380,
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

const ChartFour: React.FC = () => {
  const [state, setState] = useState<ChartFourState>({
    series: [65, 35],
  });

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      series: [65, 34, 12, 56],
    }));
  };
  handleReset;

  return (
    <div className="w-full rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 col-span-7">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black ">
            Jumlah PNBP Yang Dihasilkan
          </h5>
        </div>
        <div>
          <div className="relative z-20 inline-block">
            <select
              name=""
              id=""
              className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
            >
              <option value="" className="">
                2024
              </option>
              <option value="" className="">
                2023
              </option>
              <option value="" className="">
                2022
              </option>
            </select>
            <span className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
              <IoMdArrowDropdown />
            </span>
          </div>
        </div>
      </div>

      <div className="mb-2 mt-12">
        <div id="ChartFour" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={state.series} type="pie" />
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#6577F3]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black ">
              <span>ATKAPIN II</span>
              <span> Rp </span>
            </p>
          </div>
        </div>
        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#80CAEE]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black ">
              <span> ANKAPIN II </span>
              <span> Rp {44} </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartFour;
