import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { IoMdArrowDropdown } from "react-icons/io";

interface ChartThreeState {
  series: number[];
}

const options: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
  },
  colors: ["#3C50E0", "#6577F3", "#8FD0EF", "#0FADCF", "#FFb703", "#fb8500"],
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

const ChartThree: React.FC = () => {
  const [state, setState] = useState<ChartThreeState>({
    series: [0, 44, 49, 0],
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
          <h5 className="text-xl font-semibold text-black ">Jenis Keahlian</h5>
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
              <span> ANKAPIN/ATKAPIN I</span>
            </p>
            <span> 0</span>
          </div>
        </div>

        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#8FD0EF]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black ">
              <span> ANKAPIN/ATKAPIN II </span>
            </p>
            <span className="ml-3"> 44</span>
          </div>
        </div>
        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#0FADCF]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black ">
              <span> ANKAPIN/ATKAPIN III (Upgrading) </span>
            </p>
            <span> 49</span>
          </div>
        </div>
        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#FFb703]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black ">
              <span> Rating </span>
            </p>
            <span> 0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartThree;
