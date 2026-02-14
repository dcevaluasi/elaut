// "use client";

// import React from "react";
// import dynamic from "next/dynamic";
// import { ApexOptions } from "apexcharts";
// import { TbCertificate, TbChartBar } from "react-icons/tb";

// const ReactApexChart = dynamic(() => import("react-apexcharts"), {
//     ssr: false,
// });

// const ChartPage = () => {
//     // Data Definition
//     const chartData = [
//         { name: "ANKAPIN I", total: 478, penghargaan: 0 },
//         { name: "ANKAPIN II", total: 671, penghargaan: 299 },
//         { name: "ANKAPIN III", total: 1630, penghargaan: 0 },
//         { name: "ATKAPIN I", total: 235, penghargaan: 0 },
//         { name: "ATKAPIN II", total: 303, penghargaan: 82 },
//         { name: "ATKAPIN III", total: 966, penghargaan: 0 },
//         { name: "BSTF I", total: 949, penghargaan: 0 },
//         { name: "BSTF II", total: 9567, penghargaan: 0 },
//         { name: "SKN", total: 5524, penghargaan: 0 },
//         { name: "SKN NAUTIKA", total: 24, penghargaan: 0 },
//         { name: "SKPI", total: 605, penghargaan: 0 },
//         { name: "SOPI", total: 60, penghargaan: 0 },
//         { name: "RATING", total: 1552, penghargaan: 0 },
//     ];

//     // Calculate Series
//     const categories = chartData.map((item) => item.name);
//     const regulerSeries = chartData.map((item) => item.total - item.penghargaan);
//     const penghargaanSeries = chartData.map((item) => item.penghargaan);

//     const series = [
//         {
//             name: "Reguler",
//             data: regulerSeries,
//         },
//         {
//             name: "Penghargaan",
//             data: penghargaanSeries,
//         },
//     ];

//     const options: ApexOptions = {
//         chart: {
//             type: "bar",
//             height: 550,
//             stacked: true,
//             fontFamily: "'Plus Jakarta Sans', sans-serif",
//             toolbar: {
//                 show: false,
//             },
//             animations: {
//                 enabled: true,
//                 easing: "easeinout",
//                 speed: 800,
//             },
//             dropShadow: {
//                 enabled: true,
//                 top: 0,
//                 left: 0,
//                 blur: 3,
//                 opacity: 0.1
//             }
//         },
//         colors: ["#3b82f6", "#f59e0b"], // Modern Blue & Amber
//         plotOptions: {
//             bar: {
//                 horizontal: false,
//                 borderRadius: 4,
//                 borderRadiusApplication: "end", // Only round the end
//                 columnWidth: "55%",
//                 dataLabels: {
//                     total: {
//                         enabled: true,
//                         style: {
//                             fontSize: "13px",
//                             fontWeight: 800,
//                             color: "#334155", // Slate-700
//                             fontFamily: "'Plus Jakarta Sans', sans-serif",
//                         },
//                         offsetY: -10,
//                         formatter: function (val) {
//                             return Number(val).toLocaleString('id-ID');
//                         }
//                     },
//                 },
//             },
//         },
//         dataLabels: {
//             enabled: true,
//             offsetY: 0,
//             style: {
//                 fontSize: '11px',
//                 colors: ["#fff"],
//                 fontWeight: 700,
//                 fontFamily: "'Plus Jakarta Sans', sans-serif",
//             },
//             formatter: function (val, opts) {
//                 if (Number(val) > 0) return Number(val).toLocaleString('id-ID');
//                 return "";
//             }
//         },
//         fill: {
//             type: "gradient",
//             gradient: {
//                 shade: "light",
//                 type: "vertical",
//                 shadeIntensity: 0.1,
//                 inverseColors: false,
//                 opacityFrom: 1,
//                 opacityTo: 0.9,
//                 stops: [0, 100]
//             }
//         },
//         stroke: {
//             width: 1,
//             colors: ["#fff"],
//         },
//         xaxis: {
//             categories: categories,
//             labels: {
//                 style: {
//                     colors: "#64748B",
//                     fontSize: "12px",
//                     fontWeight: 600,
//                     fontFamily: "'Plus Jakarta Sans', sans-serif",
//                 },
//                 rotate: -45,
//                 trim: false,
//             },
//             axisBorder: {
//                 show: false,
//             },
//             axisTicks: {
//                 show: false,
//             },
//         },
//         yaxis: {
//             labels: {
//                 style: {
//                     colors: "#64748B",
//                     fontSize: "12px",
//                     fontWeight: 500,
//                     fontFamily: "'Plus Jakarta Sans', sans-serif",
//                 },
//                 formatter: (val) => val.toLocaleString('id-ID'),
//             },
//             title: {
//                 text: "Jumlah Peserta",
//                 style: {
//                     color: "#64748B",
//                     fontWeight: 600,
//                     fontFamily: "'Plus Jakarta Sans', sans-serif",
//                 },
//             },
//         },
//         legend: {
//             position: "top",
//             horizontalAlign: "right",
//             offsetY: 10,
//             fontFamily: "'Plus Jakarta Sans', sans-serif",
//             fontWeight: 600,
//             markers: {
//                 radius: 12,
//             },
//             itemMargin: {
//                 horizontal: 10,
//                 vertical: 0,
//             },
//         },
//         tooltip: {
//             y: {
//                 formatter: function (val) {
//                     return val.toLocaleString('id-ID') + " Peserta";
//                 },
//             },
//             theme: "light",
//             style: {
//                 fontSize: "14px",
//                 fontFamily: "'Plus Jakarta Sans', sans-serif",
//             },
//         },
//         grid: {
//             borderColor: "#F1F5F9",
//             strokeDashArray: 4,
//             xaxis: {
//                 lines: {
//                     show: false,
//                 },
//             },
//             yaxis: {
//                 lines: {
//                     show: true,
//                 },
//             },
//         },
//     };

//     const grandTotal = 22564;

//     return (
//         <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans">
//             <div className="max-w-7xl mx-auto space-y-8">

//                 {/* Header Section */}
//                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                     <div>
//                         <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
//                             Statistik Sertifikasi
//                         </h1>
//                         <p className="text-slate-500 mt-2 text-lg font-medium">
//                             Distribusi kepesertaan berdasarkan jenis sertifikat dan jalur perolehan.
//                         </p>
//                     </div>

//                     <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200/60 ring-1 ring-slate-100">
//                         <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 ring-4 ring-blue-50">
//                             <TbCertificate size={26} />
//                         </div>
//                         <div>
//                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sertifikasi</p>
//                             <p className="text-3xl font-black text-slate-800 tracking-tight">{grandTotal.toLocaleString('id-ID')}</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Main Chart Card */}
//                 <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden ring-1 ring-slate-100">
//                     {/* Card Header */}
//                     <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white">
//                         <div className="flex items-center gap-4">
//                             <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30">
//                                 <TbChartBar size={22} />
//                             </div>
//                             <div>
//                                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">Distribusi Sertifikasi</h2>
//                                 <p className="text-sm text-slate-500 font-medium">Breakdown per jenis sertifikat (Reguler & Penghargaan)</p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Chart Content */}
//                     <div className="p-6 md:p-8">
//                         <div className="w-full h-[550px]">
//                             <ReactApexChart
//                                 options={options}
//                                 series={series}
//                                 type="bar"
//                                 height="100%"
//                                 width="100%"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Detailed Breakdown Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
//                     <HighlightCard
//                         title="ANKAPIN II (Penghargaan)"
//                         count={299}
//                         color="bg-gradient-to-br from-amber-400 to-amber-500"
//                         shadow="shadow-amber-500/20"
//                         icon={<TbCertificate className="text-white" size={24} />}
//                     />
//                     <HighlightCard
//                         title="ATKAPIN II (Penghargaan)"
//                         count={82}
//                         color="bg-gradient-to-br from-amber-400 to-amber-500"
//                         shadow="shadow-amber-500/20"
//                         icon={<TbCertificate className="text-white" size={24} />}
//                     />



//                 </div>
//             </div>
//         </div>
//     );
// };

// const HighlightCard = ({ title, count, color, shadow, icon }: { title: string, count: number, color: string, shadow: string, icon: React.ReactNode }) => (
//     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-100/50 flex items-center gap-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
//         <div className={`h-14 w-14 rounded-2xl ${color} ${shadow} shadow-lg flex items-center justify-center group-hover:rotate-6 transition-transform duration-300`}>
//             {icon}
//         </div>
//         <div>
//             <p className="text-sm text-slate-500 font-semibold mb-0.5">{title}</p>
//             <p className="text-2xl font-black text-slate-800 tracking-tight">{count.toLocaleString('id-ID')}</p>
//         </div>
//     </div>
// );

// export default ChartPage;

function page() {
    return (<></>)
}