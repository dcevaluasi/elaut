// import { BlankoKeluar } from "@/types/blanko";
// import { PelatihanMasyarakat } from "@/types/product";
// import { formatDateTime, getMonthFromDateString } from "@/utils";
// import { ApexOptions } from "apexcharts";
// import React, { useState } from "react";
// import ReactApexChart from "react-apexcharts";

// const options: ApexOptions = {
//   legend: {
//     show: false,
//     position: "top",
//     horizontalAlign: "left",
//   },
//   colors: ["#3C50E0", "#80CAEE"],
//   chart: {
//     fontFamily: "Satoshi, sans-serif",
//     height: 335,
//     type: "area",
//     dropShadow: {
//       enabled: true,
//       color: "#623CEA14",
//       top: 10,
//       blur: 4,
//       left: 0,
//       opacity: 0.1,
//     },

//     toolbar: {
//       show: false,
//     },
//   },
//   responsive: [
//     {
//       breakpoint: 1024,
//       options: {
//         chart: {
//           height: 300,
//         },
//       },
//     },
//     {
//       breakpoint: 1366,
//       options: {
//         chart: {
//           height: 350,
//         },
//       },
//     },
//   ],
//   stroke: {
//     width: [2, 2],
//     curve: "straight",
//   },
//   // labels: {
//   //   show: false,
//   //   position: "top",
//   // },
//   grid: {
//     xaxis: {
//       lines: {
//         show: true,
//       },
//     },
//     yaxis: {
//       lines: {
//         show: true,
//       },
//     },
//   },
//   dataLabels: {
//     enabled: false,
//   },
//   markers: {
//     size: 4,
//     colors: "#fff",
//     strokeColors: ["#3056D3", "#80CAEE"],
//     strokeWidth: 3,
//     strokeOpacity: 0.9,
//     strokeDashArray: 0,
//     fillOpacity: 1,
//     discrete: [],
//     hover: {
//       size: undefined,
//       sizeOffset: 5,
//     },
//   },
//   xaxis: {
//     type: "category",
//     categories: [
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jul",
//       "Aug",
//       "Sep",
//       "Oct",
//       "Nov",
//       "Dec",
//     ],
//     axisBorder: {
//       show: false,
//     },
//     axisTicks: {
//       show: false,
//     },
//   },
//   yaxis: {
//     title: {
//       style: {
//         fontSize: "0px",
//       },
//     },
//     min: 0,
//     max: 4000,
//   },
// };

// interface ChartOneState {
//   series: {
//     name: string;
//     data: number[];
//   }[];
// }

// const ChartSertifikasiKompetensiMonthly: React.FC<{
//   data: PelatihanMasyarakat[];
// }> = ({ data }) => {
//   const [state, setState] = useState<ChartOneState>({
//     series: [
//       {
//         name: "Keahlian",
//         data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
//       },

//       {
//         name: "Keterampilan",
//         data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
//       },
//     ],
//   });

//   const handleReset = () => {
//     setState((prevState) => ({
//       ...prevState,
//     }));
//   };
//   handleReset;

//   return (
//     <div className="col-span-12 rounded-xl border mb-4 border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8">
//       <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
//         <div className="mb-3 justify-between gap-4 sm:flex flex-col w-full">
//           <div>
//             <h5 className="text-xl font-semibold text-black">
//               Total SDM KP Bersertifikat Kompetensi
//             </h5>
//             <p className="italic text-sm">{formatDateTime()}</p>
//           </div>
//           <div className="flex w-fit">
//             <div className="flex w-full">
//               <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
//                 <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
//               </span>
//               <div className="w-full">
//                 <p className="font-semibold text-primary">
//                   Total Pelaksanaan Ujikom
//                 </p>
//                 <p className="text-sm font-medium">
//                   {data
//                     .filter(
//                       (item: BlankoKeluar) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)"
//                     )
//                     .reduce(
//                       (total: number, item: BlankoKeluar) =>
//                         total + item.JumlahBlankoDisetujui,
//                       0
//                     )}{" "}
//                   Uji Kompetensi
//                 </p>
//               </div>
//             </div>
//             <div className="flex w-full">
//               <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
//                 <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
//               </span>
//               <div className="w-full">
//                 <p className="font-semibold text-secondary">
//                   Total SDM Bersertifikasi Kompetensi
//                 </p>
//                 <p className="text-sm font-medium">
//                   {data
//                     .filter(
//                       (item: BlankoKeluar) =>
//                         item.TipeBlanko === "Certificate of Proficiency (CoP)"
//                     )
//                     .reduce(
//                       (total: number, item: BlankoKeluar) =>
//                         total + item.JumlahBlankoDisetujui,
//                       0
//                     )}{" "}
//                   Orang
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="flex w-full max-w-45 justify-end">
//           <div className="inline-flex items-center rounded-md bg-whiter p-1.5 ">
//             <button className="rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card  ">
//               2024
//             </button>
//           </div>
//         </div>
//       </div>

//       <div>
//         <div id="chartOne" className="-ml-5">
//           <ReactApexChart
//             options={options}
//             series={[
//               {
//                 name: "Keahlian",
//                 data: [
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "01"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "02"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "03"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "04"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "05"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "06"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "07"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "08"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "09"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "10"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "11"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko === "Certificate of Competence (CoC)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "12"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                 ],
//               },

//               {
//                 name: "Keterampilan",
//                 data: [
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "01"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "02"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "03"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "04"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "05"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "06"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "07"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "08"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "09"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "10"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "11"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                   data
//                     .filter(
//                       (item) =>
//                         item.TipeBlanko ===
//                           "Certificate of Proficiency (CoP)" &&
//                         getMonthFromDateString(item.TanggalKeluar) === "12"
//                     )
//                     .reduce(
//                       (total, item) => total + item.JumlahBlankoDisetujui,
//                       0
//                     ),
//                 ],
//               },
//             ]}
//             type="area"
//             height={350}
//             width={"100%"}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChartSertifikasiKompetensiMonthly;

import React from "react";

function ChartSertifikasiKompetensiMonthly() {
  return <div>ChartSertifikasiKompetensiMonthly</div>;
}

export default ChartSertifikasiKompetensiMonthly;
