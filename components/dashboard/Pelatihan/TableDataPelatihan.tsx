import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import FormPelatihan from "../admin/FormPelatihan";

import Image from "next/image";
import Cookies from "js-cookie";

import { Input } from "@/components/ui/input";
import { generateTanggalPelatihan } from "@/utils/text";
import { Button } from "@/components/ui/button";
import {
  PROGRAM_AKP,
  PROGRAM_KELAUTAN,
  PROGRAM_PERIKANAN,
} from "@/constants/pelatihan";
import { MdBusiness, MdClear, MdPeople, MdSchool, MdSearch } from "react-icons/md";

import { encryptValue } from "@/lib/utils";
import { HashLoader } from "react-spinners";
import { UPT } from "@/constants/nomenclatures";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchDataPelatihanMasyarakat } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakat";
import TabStatusPelatihanMasyarakat from "./TabStatusPelatihanMasyarakat";
import TableDataPelatihanMasyarakat from "./Table/TableDataPelatihanMasyrakat";
import { isPendingSigning, isSigned, isVerifyDiklat } from "@/utils/status";

const TableDataPelatihan: React.FC = () => {
  const {
    data,
    isFetching,
    setIsFetching,
    countDone,
    countDiklatSPV,
    countPublished,
    countVerifying,
    countPendingSigning,
    countSigned,
    refetch,
  } = useFetchDataPelatihanMasyarakat();
  const isOperatorBalaiPelatihan = Cookies.get('Eselon') !== 'Operator Pusat'
  console.log({ data })
  const [selectedStatusFilter, setSelectedStatusFilter] =
    React.useState<string>("All");
  // STATUS FILTER
  const [filterCategory, setFilterCategory] = React.useState<string>("");
  const [filterCategoryPenyelenggara, setFilterCategoryPenyelenggara] = React.useState<string>("");
  const [filterCategorySasaran, setFilterCategorySasaran] = React.useState<string>("");

  // SEARCHING
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const statusMapping: Record<string, (p: typeof data[number]) => boolean> = {
    "Proses Pengajuan Sertifikat": p => p.StatusPenerbitan === "On Progress",
    "Pending SPV": p => p.StatusPenerbitan === "1",
    "Verifikasi Pelaksanaan": p => isVerifyDiklat(p.StatusPenerbitan),
    "Pending Signing": p => isPendingSigning(p.StatusPenerbitan) && (Cookies.get('Role')?.includes(p.TtdSertifikat)! || Cookies.get('Role') == p.TtdSertifikat),
    "Done": p => isSigned(p.StatusPenerbitan),
    "Signed": p => isSigned(p.StatusPenerbitan) && (Cookies.get('Role')?.includes(p.TtdSertifikat)! || Cookies.get('Role') == p.TtdSertifikat),
    "Published": p => p.Status === "Publish",
  };

  const searchQueryLower = searchQuery.toLowerCase();
  const filterCategoryLower = filterCategory?.toLowerCase();
  const filterPenyelenggaraLower = filterCategoryPenyelenggara?.toLowerCase();
  const filterSasaranLower = filterCategorySasaran?.toLowerCase();

  const filteredData = data.filter(p => {
    const program = p.Program.toLowerCase();
    const namaPelatihan = p.NamaPelatihan.toLowerCase();
    const penyelenggara = p.PenyelenggaraPelatihan.toLowerCase();
    const sasaran = p.AsalPelatihan.toLowerCase();

    return (
      (!filterCategoryLower || program === filterCategoryLower) &&
      (!filterPenyelenggaraLower || penyelenggara === filterPenyelenggaraLower) &&
      (!filterSasaranLower || sasaran === filterSasaranLower) &&
      namaPelatihan.includes(searchQueryLower) &&
      (
        selectedStatusFilter === "All" ||
        statusMapping[selectedStatusFilter]?.(p) ||
        p.Status === selectedStatusFilter
      )
    );
  });

  return (
    <div className="shadow-default -mt-10">
      <TabStatusPelatihanMasyarakat
        dataLength={data.length}
        countPublished={countPublished}
        countVerifying={countVerifying}
        countDone={countDone}
        countDiklatSPV={countDiklatSPV}
        countPendingSigning={countPendingSigning}
        countSigned={countSigned}
        selectedStatusFilter={selectedStatusFilter}
        setSelectedStatusFilter={setSelectedStatusFilter}
        isOperatorBalaiPelatihan={isOperatorBalaiPelatihan}
      />
      <section className="px-4 -mt-4 w-full">
        <Tabs defaultValue="account" className="w-full">
          {
            Cookies.get('Access')?.includes('createPelatihan') &&
            <TabsList className={`grid w-full grid-cols-2`}>
              <TabsTrigger
                value="account"
                onClick={() => refetch()}
              >
                Daftar Pelatihan
              </TabsTrigger>
              <TabsTrigger value="password">Buat Pelatihan Baru</TabsTrigger>
            </TabsList>
          }

          <TabsContent value="account">
            {
              isFetching ?
                <div className="py-32 w-full items-center flex justify-center">
                  <HashLoader color="#338CF5" size={50} />
                </div> :
                <div className="flex flex-col gap-1">
                  <div className="mb-4 flex flex-wrap items-center !text-sm w-full gap-3 p-3 bg-white rounded-2xl shadow-sm border border-neutral-200">
                    {/* Program Pelatihan */}
                    <Select
                      value={filterCategory}
                      onValueChange={(value: string) => setFilterCategory(value)}
                    >
                      <SelectTrigger className="w-fit md:w-1/4  bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 flex items-center gap-2">
                        <MdSchool className="text-neutral-500 w-5 h-5" />
                        <SelectValue placeholder="Program Pelatihan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>AKP</SelectLabel>
                          {PROGRAM_AKP.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Perikanan</SelectLabel>
                          {PROGRAM_PERIKANAN.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Kelautan</SelectLabel>
                          {PROGRAM_KELAUTAN.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {/* Sasaran */}
                    <Select
                      value={filterCategorySasaran}
                      onValueChange={(value: string) => setFilterCategorySasaran(value)}
                    >
                      <SelectTrigger className="w-fit md:w-1/4  bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 flex items-center gap-2">
                        <MdPeople className="text-neutral-500 w-5 h-5" />
                        <SelectValue placeholder="Pilih Sasaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masyarakat Umum">Masyarakat Umum</SelectItem>
                        <SelectItem value="Peserta Didik Sekolah Usaha Perikanan Menengah">
                          Peserta Didik Sekolah Usaha Perikanan Menengah
                        </SelectItem>
                        <SelectItem value="Peserta Didik Politeknik Kelautan dan Perikanan">
                          Peserta Didik Politeknik Kelautan dan Perikanan
                        </SelectItem>
                        <SelectItem value="Karyawan/Pegawai/Mining Agent">
                          Karyawan/Pegawai/Mining Agent
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Penyelenggara */}
                    <Select
                      value={filterCategoryPenyelenggara}
                      onValueChange={(value: string) => setFilterCategoryPenyelenggara(value)}
                    >
                      <SelectTrigger className="w-fit  bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 flex items-center gap-2">
                        <MdBusiness className="text-neutral-500 w-5 h-5" />
                        <SelectValue placeholder="Pilih Satker/Penyelenggara" />
                      </SelectTrigger>
                      <SelectContent>
                        {UPT.map((item: string, index: number) => (
                          <SelectItem key={index} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Search */}
                    <div className="flex items-center w-full md:flex-1 bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 gap-2">
                      <MdSearch className="text-neutral-500 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Cari berdasarkan Nama Pelatihan"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border-none bg-transparent text-sm focus:ring-0 focus:outline-none"
                      />
                    </div>

                    {/* Clear Filter */}
                    {(filterCategory || filterCategoryPenyelenggara || filterCategorySasaran) && (
                      <Button
                        onClick={() => {
                          setFilterCategory("");
                          setFilterCategoryPenyelenggara("");
                          setFilterCategorySasaran("");
                        }}
                        className="h-12 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl shadow-sm flex items-center gap-2"
                      >
                        <MdClear className="w-5 h-5" />
                        Bersihkan Filter
                      </Button>
                    )}
                  </div>

                  {data.length == 0 ? (
                    <div className="pt-12 md:pt-20 flex flex-col items-center">
                      <Image
                        src={"/illustrations/not-found.png"}
                        alt="Not Found"
                        width={0}
                        height={0}
                        className="w-[400px]"
                      />
                      <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
                        <h1 className="text-3xl font-calsans leading-[110%] text-black">
                          Belum Ada Pelatihan
                        </h1>
                        <div className="text-gray-600 text-sm text-center  max-w-md">
                          Buka kelas pelatihan segera untuk dapat melihat berbagai
                          macam pelatihan berdasarkan programnya!
                        </div>
                      </div>
                    </div>
                  ) : (
                    <TableDataPelatihanMasyarakat
                      data={filteredData}
                      generateTanggalPelatihan={generateTanggalPelatihan}
                      encryptValue={encryptValue}
                    />
                  )}
                </div>
            }

          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardContent>
                <FormPelatihan edit={false} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

    </div >
  )
};

export default TableDataPelatihan;
