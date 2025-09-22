"use client";

import React from "react";
import ChartOne from "./ChartOne";

const Chart: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <ChartOne />
      </div>
    </>
  );
};

export default Chart;
