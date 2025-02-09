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
  Cell,
  Label,
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
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function ChartSertifikatKeterampilanByLemdiklat({
  dataLembaga,
  dataProgram,
}: {
  dataLembaga: SummarySertifikatByLemdiklat;
  dataProgram: SummarySertifikatByProgram;
}) {
  const data = dataLembaga.data.data_lembaga;

  // Define color palette
  const colors = [
    "#2563EB",
    "#1E40AF",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD", // Blue
    "#0D9488",
    "#0F766E",
    "#14B8A6",
    "#2DD4BF",
    "#5EEAD4", // Tosca
    "#7C3AED",
    "#6D28D9",
    "#8B5CF6",
    "#A78BFA",
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
      .filter((item) => item.Lembaga.includes(filter))
      .map((item, index) => ({
        name: item.Lembaga.toUpperCase(),
        total: item.sertifikat?.reduce((sum, s) => sum + s.total, 0) || 0,
        fill: colors[index % colors.length],
        diklatDetails: item.sertifikat || [], // Attach the complete sertifikat details
      }));

  // Filtered datasets
  const balaiPelatihanData = formatData("BALAI PELATIHAN DAN PENYULUHAN");
  const pelabuhanData = formatData("Pelabuhan");
  const liamTrainingData = formatData("LIAN");
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
              <strong>{detail["Nama Diklat"] || "Unknown"}</strong>:{" "}
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
      <Card className="p-4 mb-6">
        <CardHeader>
          <div
            className={`flex ${
              title.includes("Satuan Pendidikan") || title.includes("Swasta")
                ? "flex-col"
                : "flex-row items-center justify-between"
            } `}
          >
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
            height={
              title.includes("Pelabuhan")
                ? 700
                : title.includes("Swasta") || title.includes("Satuan")
                ? 150
                : 300
            }
          >
            {!title.includes("Pelabuhan") ? (
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
        <div className="flex flex-col">
          {balaiPelatihanData.length > 0 &&
            renderChart("Sertifikat per Balai Pelatihan", balaiPelatihanData)}
          <div className="flex gap-2">
            {politeknikData.length > 0 &&
              renderChart("Sertifikat per Satuan Pendidikan", politeknikData)}
            {liamTrainingData.length > 0 &&
              renderChart("Sertifikat per Lembaga Swasta", liamTrainingData)}
          </div>
        </div>

        {pelabuhanData.length > 0 &&
          renderChart("Sertifikat per Pelabuhan Perikanan", pelabuhanData)}
      </div>
    </>
  );
}

function PieChartPercentage({
  dataLembaga,
}: {
  dataLembaga: SummarySertifikatByLemdiklat;
}) {
  const data = dataLembaga.data.data_lembaga;

  // Define color palette
  const colors = [
    "#2563EB",
    "#1E40AF",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD", // Blue
    "#0D9488",
    "#0F766E",
    "#14B8A6",
    "#2DD4BF",
    "#5EEAD4", // Tosca
    "#7C3AED",
    "#6D28D9",
    "#8B5CF6",
    "#A78BFA",
    "#C4B5FD", // Purple
    "#312E81",
    "#4338CA",
    "#6366F1",
    "#818CF8",
    "#A5B4FC", // Dark shades
  ];

  // Function to format data for each category
  const formatData = (filter: string) =>
    data
      .filter((item) => item.Lembaga.includes(filter))
      .map((item) => ({
        total: item.sertifikat?.reduce((sum, s) => sum + s.total, 0) || 0,
      }));

  // Filtered datasets
  const balaiPelatihanData = formatData("BALAI PELATIHAN DAN PENYULUHAN");
  const pelabuhanData = formatData("Pelabuhan");
  const liamTrainingData = formatData("LIAN");
  const politeknikData = formatData("Politeknik");

  // Calculate the total certificates for each category
  const totalBalaiPelatihan = balaiPelatihanData.reduce(
    (acc, item) => acc + item.total,
    0
  );
  const totalPelabuhan = pelabuhanData.reduce(
    (acc, item) => acc + item.total,
    0
  );
  const totalLiamTraining = liamTrainingData.reduce(
    (acc, item) => acc + item.total,
    0
  );
  const totalPoliteknik = politeknikData.reduce(
    (acc, item) => acc + item.total,
    0
  );

  // Total certificates for all categories
  const totalCertificates =
    totalBalaiPelatihan + totalPelabuhan + totalLiamTraining + totalPoliteknik;

  // Data for the donut chart
  const chartData = [
    { name: "Balai Pelatihan", value: totalBalaiPelatihan, fill: colors[0] },
    { name: "Pelabuhan", value: totalPelabuhan, fill: colors[1] },
    { name: "Liam Training", value: totalLiamTraining, fill: colors[2] },
    { name: "Politeknik", value: totalPoliteknik, fill: colors[3] },
  ];

  // Function to render the donut chart
  const renderDonutChart = () => {
    return (
      <Card className="p-4 mb-6 w-full">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <FaGraduationCap />
              <div className="flex flex-col gap-0">
                <CardTitle>
                  Persentase Sertifikat Berdasarkan Lembaga Diklat, Pelabuhan,
                  dan Swasta
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
                style={{ fontSize: 10 }}
                outerRadius={80}
                innerRadius={60} // Make it a donut chart
                labelLine={true}
                label={({ name, value }: any) =>
                  `${name}: ${((value / totalCertificates) * 100).toFixed(2)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}{" "}
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
              <Tooltip />
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
  const data = dataProgram.data.DataCOC;

  // Define color palette
  const colors = [
    "#2563EB",
    "#1E40AF",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD", // Blue
    "#0D9488",
    "#0F766E",
    "#14B8A6",
    "#2DD4BF",
    "#5EEAD4", // Tosca
    "#7C3AED",
    "#6D28D9",
    "#8B5CF6",
    "#A78BFA",
    "#C4B5FD", // Purple
    "#312E81",
    "#4338CA",
    "#6366F1",
    "#818CF8",
    "#A5B4FC", // Dark shades
  ];

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
              <Tooltip />
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
