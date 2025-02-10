"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  Pie,
  PieChart,
  Label,
  Cell,
  Text,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DataSertifikasiSummary,
  SummarySertifikatByLemdiklat,
  SummarySertifikatByProgram,
  SummarySertifikatItem,
} from "@/types/akapi";
import { FaBuilding, FaGraduationCap, FaShip } from "react-icons/fa6";
import { TrendingUp } from "lucide-react";
export default function ChartSertifikatKeahlianByLemdiklat({
  dataLembaga,
  dataProgram,
}: {
  dataLembaga: SummarySertifikatByLemdiklat;
  dataProgram: SummarySertifikatByProgram;
}) {
  const data = dataLembaga.data.data_unit_kerja;

  // Define color palette
  const colors = [
    "#C4B5FD", // Purple
    "#312E81",
    "#4338CA",
    "#6366F1",
    "#818CF8",
    "#A5B4FC", // Dark shades
  ];

  // Function to format data
  const formatData = (filter: string) =>
    data
      .filter((item) => item.UnitKerja.includes(filter))
      .map((item, index) => ({
        name: item.UnitKerja.toUpperCase(),
        total: item.sertifikat?.reduce((sum, s) => sum + s.total, 0) || 0,
        fill: colors[index % colors.length],
        diklatDetails: item.sertifikat || [], // Attach the complete sertifikat details
      }));

  // Filtered datasets
  const balaiPelatihanData = formatData("BALAI PELATIHAN DAN PENYULUHAN");
  const politeknikData = formatData("Politeknik");

  const CustomTooltip = ({ payload, label }: any) => {
    if (payload && payload.length) {
      const { diklatDetails } = payload[0].payload; // Extract the diklat details from the hovered bar
      return (
        <div className="p-2 bg-white border rounded shadow-md text-xs w-full z-[99999]">
          <strong>{label}</strong>
          <div>Total Sertifikat: {payload[0].value}</div>
          {diklatDetails.map((detail: any, index: number) => (
            <div key={index}>
              <strong>{detail["Jenis Sertifikasi"] || "Unknown"}</strong>:{" "}
              {detail.total} sertifikat
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render chart function
  const renderChart = (title: string, chartData: any) => {
    const totalSertifikat = chartData.reduce(
      (acc: number, entry: any) => acc + entry.total,
      0
    );
    return (
      <Card className="p-4 mb-6 ">
        <CardHeader>
          <div className={`flex flex-row items-center justify-between`}>
            <div className="flex flex-row items-center gap-2">
              <div>
                {(title.includes("Balai Pelatihan") ||
                  title.includes("Satuan Pendidikan")) && <FaGraduationCap />}
                {title.includes("Pelabuhan") && <FaShip />}
                {title.includes("Swasta") && <FaBuilding />}
              </div>
              <div className="flex flex-col gap-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>27 May 2024 - Now 2025</CardDescription>
              </div>
            </div>
            <p className="font-semibold text-sm">
              Total Sertifikat : {totalSertifikat}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer
            width="100%"
            height={title.includes("Satuan") ? 400 : 300}
          >
            {title.includes("Pelatihan") ? (
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 0, right: 30 }}
              >
                <XAxis type="number" style={{ fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fontSize: 12 }}
                  interval={0}
                  style={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />

                <Bar dataKey="total" radius={4}>
                  <LabelList
                    dataKey="total"
                    position="right"
                    offset={10}
                    style={{ fill: "#000", fontSize: 12 }}
                  />
                  {chartData.map((entry: any, index: number) => (
                    <Bar key={index} dataKey="total" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 10, right: 30 }}
              >
                <XAxis type="number" style={{ fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fontSize: 12 }}
                  interval={0}
                  style={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />

                <Bar dataKey="total" radius={4}>
                  <LabelList
                    dataKey="total"
                    position="right"
                    offset={10}
                    style={{ fill: "#000", fontSize: 12 }}
                  />
                  {chartData.map((entry: any, index: number) => (
                    <Bar key={index} dataKey="total" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
          <CardFooter className="flex-col items-start gap-1 text-sm mb-0 p-0">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total sertifikat for the since 27 May 2024
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="w-full gap-2 grid grid-cols-2">
        {/* <PieChartPercentage dataLembaga={dataLembaga} />{" "} */}
        <PieChartPercentage dataLembaga={dataLembaga} />
        <PieChartPercentageProgram dataProgram={dataProgram} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {balaiPelatihanData.length > 0 &&
          renderChart("Sertifikat per Balai Pelatihan", balaiPelatihanData)}

        {politeknikData.length > 0 &&
          renderChart("Sertifikat per Satuan Pendidikan", politeknikData)}
      </div>
    </>
  );
}

function PieChartPercentage({
  dataLembaga,
}: {
  dataLembaga: SummarySertifikatByLemdiklat;
}) {
  const data = dataLembaga.data.data_unit_kerja;

  // Define color palette
  const colors = [
    "#C4B5FD", // Purple
    "#312E81",
    "#4338CA",
    "#6366F1",
    "#312E81",
    "#818CF8",
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      return (
        <div className="p-2 bg-white border rounded shadow-md text-xs w-44 z-[99999]">
          <strong className="text-sm text-gray-900">{name}</strong>
          <div className="text-gray-700">Total Sertifikat: {value}</div>
        </div>
      );
    }
    return null;
  };

  // Function to format data for each category
  const formatData = (filter: string) =>
    data
      .filter((item) => item.UnitKerja.includes(filter))
      .map((item) => ({
        total: item.sertifikat?.reduce((sum, s) => sum + s.total, 0) || 0,
      }));

  // Filtered datasets
  const balaiPelatihanData = formatData("BALAI PELATIHAN DAN PENYULUHAN");
  const politeknikData = formatData("Politeknik");

  // Calculate the total certificates for each category
  const totalBalaiPelatihan = balaiPelatihanData.reduce(
    (acc, item) => acc + item.total,
    0
  );

  const totalPoliteknik = politeknikData.reduce(
    (acc, item) => acc + item.total,
    0
  );

  // Total certificates for all categories
  const totalCertificates = totalBalaiPelatihan + totalPoliteknik;

  // Data for the donut chart
  const chartData = [
    { name: "Balai Pelatihan", value: totalBalaiPelatihan, fill: colors[0] },
    { name: "Politeknik", value: totalPoliteknik, fill: colors[3] },
  ];

  // Function to render the donut chart
  const renderDonutChart = () => {
    return (
      <Card className="p-4 mb-6 ">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <FaGraduationCap />
              <div className="flex flex-col gap-0">
                <CardTitle>
                  Persentase Sertifikat Berdasarkan Balai Pelatihan dan Satuan
                  Pendidikan
                </CardTitle>
                <CardDescription>27 May 2024 - Now 2025</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart width={400} height={300}>
              {" "}
              {/* Increase the width here */}
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                strokeWidth={2}
                outerRadius={80}
                innerRadius={60} // Make it a donut chart
                labelLine={true}
                label={({ name, value }: any) =>
                  `${name}: ${((value / totalCertificates) * 100).toFixed(2)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}

                <Label
                  value={totalCertificates!.toString()!}
                  position="center"
                  style={{
                    fontSize: "25px",
                    fontWeight: "bold",
                    textAnchor: "middle",
                    fill: "#333",
                  }}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <CardFooter className="flex-col items-start gap-1 text-sm mb-0 p-0">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total sertifikat for the since 27 May 2024
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    );
  };

  return <div className="flex flex-col">{renderDonutChart()}</div>;
}

function PieChartPercentageProgram({
  dataProgram,
}: {
  dataProgram: SummarySertifikatByProgram;
}) {
  const data = dataProgram.data.data;

  // Define color palette
  const colors = [
    "#C4B5FD", // Purple
    "#312E81",
    "#4338CA",
    "#6366F1",
    "#312E81",
    "#818CF8",
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      return (
        <div className="p-2 bg-white border rounded shadow-md text-xs w-44 z-[99999]">
          <strong className="text-sm text-gray-900">{name}</strong>
          <div className="text-gray-700">Total Sertifikat: {value}</div>
        </div>
      );
    }
    return null;
  };

  // Function to format data for each certificate type
  const formatData = (certificate: any) => {
    // Sum all totals for each certificate type, ignore institutions
    const totalForCertificate = certificate.Lembaga.reduce(
      (acc: number, item: any) => acc + item.total,
      0
    );
    return {
      name: certificate.setifikat, // Set the name as the certificate type
      value: totalForCertificate,
    };
  };

  // Flatten all the data into chartData by summing the totals for each certificate type
  const chartData = data.reduce((acc: any[], certificate: any) => {
    const formattedData = formatData(certificate);
    return [...acc, formattedData];
  }, []);

  // Calculate total certificates for the chart
  const totalCertificates = chartData.reduce(
    (acc: number, item: any) => acc + item.value,
    0
  );

  // Assign colors to the chart data
  chartData.forEach((entry, index) => {
    entry.fill = colors[index % colors.length]; // Ensure color wraps around if more than the available colors
  });

  // Render Donut Chart
  const renderDonutChart = () => {
    return (
      <Card className="p-4 mb-6 w-full">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <FaGraduationCap />
              <div className="flex flex-col gap-0">
                <CardTitle>Persentase Sertifikat Berdasarkan Program</CardTitle>
                <CardDescription>27 May 2024 - Now 2025</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart width={1000} height={300}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                style={{ fontSize: 10 }}
                cy="50%"
                strokeWidth={2}
                outerRadius={80}
                innerRadius={60} // Make it a donut chart
                labelLine={true}
                width={150}
                label={({ name, value }: any) =>
                  `${name}: ${((value / totalCertificates) * 100).toFixed(2)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  value={totalCertificates.toString()}
                  position="center"
                  style={{
                    fontSize: "25px",
                    fontWeight: "bold",
                    textAnchor: "middle",
                    fill: "#333",
                  }}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <CardFooter className="flex-col items-start gap-1 text-sm mb-0 p-0">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total sertifikat for the since 27 May 2024
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    );
  };

  return <div className="flex flex-col">{renderDonutChart()}</div>;
}
