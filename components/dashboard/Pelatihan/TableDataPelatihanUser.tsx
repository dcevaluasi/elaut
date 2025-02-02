import React, { ReactElement, useRef, useState } from "react";
import TableData from "../Tables/TableData";
import { RiShipLine, RiVerifiedBadgeFill } from "react-icons/ri";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Edit3Icon, LucidePrinter, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HiMiniUserGroup, HiUserGroup } from "react-icons/hi2";
import {
  TbBroadcast,
  TbBuildingCommunity,
  TbCalendarCheck,
  TbCalendarExclamation,
  TbCalendarSearch,
  TbCalendarStats,
  TbChartBubble,
  TbChartDonut,
  TbCloudDownload,
  TbDatabaseEdit,
  TbFileCertificate,
  TbFishChristianity,
  TbLink,
  TbMoneybag,
  TbQrcode,
  TbSchool,
  TbTargetArrow,
} from "react-icons/tb";
import { IoIosInformationCircle } from "react-icons/io";
import { FiUploadCloud } from "react-icons/fi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { MdOutlineSaveAlt, MdVerified } from "react-icons/md";
import FormPelatihan from "../admin/formPelatihan";
import Toast from "@/components/toast";
import SertifikatSettingPage1 from "@/components/sertifikat/sertifikatSettingPage1";
import SertifikatSettingPage2 from "@/components/sertifikat/sertifikatSettingPage2";
import { PiStampLight } from "react-icons/pi";
import Image from "next/image";
import axios, { AxiosResponse } from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { PelatihanMasyarakat } from "@/types/product";
import { FaRupiahSign } from "react-icons/fa6";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { convertDate } from "@/utils";
import SertifikatPage1 from "@/components/sertifikat/sertifikatPage1";
import SertifikatPage2 from "@/components/sertifikat/sertifikatPage2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TableDataPelatihanUser: React.FC = () => {
  const [showFormAjukanPelatihan, setShowFormAjukanPelatihan] =
    React.useState<boolean>(false);
  const [showCertificateSetting, setShowCertificateSetting] =
    React.useState<boolean>(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  type Pelatihan = {
    IdPelatihan: number;
    IdLemdik: string;
    KodePelatihan: string;
    NamaPelatihan: string;
    PenyelenggaraPelatihan: string;
    DetailPelatihan: string;
    JenisPelatihan: string;
    BidangPelatihan: string;
    DukunganProgramTerobosan: string;
    TanggalMulaiPelatihan: string;
    TanggalBerakhirPelatihan: string;
    HargaPelatihan: string;
    Instruktur: string;
    FotoPelatihan: string;
    Status: string;
    MemoPusat: string;
    SilabusPelatihan: string;
    LokasiPelatihan: string;
    PelaksanaanPelatihan: string;
    UjiKompetensi: string;
    KoutaPelatihan: string; // type from be, should be KuotaPelatihan
    AsalPelatihan: string;
    JenisSertifikat: string;
    TtdSertifikat: string;
    NoSertifikat: string;
    IdSaranaPrasarana: string;
    IdKonsumsi: string;
    CreatedAt: string;
    UpdatedAt: string;
  };

  const [data, setData] = React.useState<Pelatihan[]>([]);

  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  const handleFetchingPublicTrainingData = async () => {
    setIsFetching(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getPelatihan`
      );
      console.log({ response });
      setData(response.data.data);
      setIsFetching(false);
    } catch (error) {
      console.error("Error posting training data:", error);
      setIsFetching(false);
      throw error;
    }
  };

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const router = useRouter();
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns: ColumnDef<Pelatihan>[] = [
    {
      accessorKey: "KodePelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`text-center uppercase`}>{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "IdPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`${"flex"} w-full text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Action
            <TbDatabaseEdit className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"flex"} flex items-center justify-center gap-1`}>
          <DialogSertifikat>
            <Button
              variant="outline"
              className="w-full border border-purple-600"
            >
              <RiVerifiedBadgeFill className="h-4 w-4 text-purple-600" /> Lihat
              Sertifikat
            </Button>
          </DialogSertifikat>
        </div>
      ),
    },
    {
      accessorKey: "NamaPelatihan",

      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`p-0 !text-left w-[270px] flex items-center justify-start text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pelatihan
            <TbSchool className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-xs text-gray-400">
            {" "}
            {row.getValue("KodePelatihan")} • {row.original.BidangPelatihan}
          </p>
          <p className="text-base font-semibold tracking-tight leading-none">
            {row.getValue("NamaPelatihan")}
          </p>
          <div className={`${"ml-0"} text-left capitalize`}></div>
        </div>
      ),
    },
    {
      accessorKey: "TanggalMulaiPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`p-0 !text-left w-fit flex items-center justify-start text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal Pelaksanaan
            <TbCalendarCheck className="ml-2 h-4 w-4 text-xl" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-xs text-gray-400 capitalize"> Dilaksanakan pada</p>
          <p className="text-base font-semibold tracking-tight leading-none">
            {convertDate(row.getValue("TanggalMulaiPelatihan"))}{" "}
            <span className="lowercase">s.d</span>{" "}
            {convertDate(row.original.TanggalBerakhirPelatihan)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "AsalPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[150px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Peserta
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-xs text-gray-400 capitalize">
            {" "}
            Asal dan Kuota Peserta
          </p>
          <p className="text-base font-semibold tracking-tight leading-none">
            {row.getValue("AsalPelatihan")} • {row.original.KoutaPelatihan}{" "}
            Orang
          </p>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  React.useEffect(() => {
    handleFetchingPublicTrainingData();
  }, []);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8">
      {showFormAjukanPelatihan ? (
        <>
          {/* Header Tabel Data Pelatihan */}
          <div className="flex flex-wrap items-center mb-3 justify-between gap-3 sm:flex-nowrap">
            {/* Button Ajukan Permohonan Buka Pelatihan */}
          </div>

          {/* List Data Pelatihan */}
          <div>
            <FormPelatihan edit={false} />
          </div>
        </>
      ) : showCertificateSetting ? (
        <>
          {/* Header Tabel Data Pelatihan */}
          <div className="flex flex-wrap items-center mb-3 justify-between gap-3 sm:flex-nowrap">
            {/* Statistik Pelatihan */}
            <div className="hidden w-full flex-wrap gap-3 sm:gap-5">
              <div className="flex min-w-47.5">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-primary">
                    Total Pelatihan Yang Diikuti
                  </p>
                  <p className="text-sm font-medium">{data.length} pelatihan</p>
                </div>
              </div>
            </div>

            {/* Button Ajukan Permohonan Buka Pelatihan */}
            <div className="flex w-full gap-2 justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <div className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer">
                    <PiStampLight />
                    Add Stempel
                  </div>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <div className="flex flex-row items-center gap-2">
                      {/* <Image
                        src={"/logo-kkp.png"}
                        width={0}
                        height={0}
                        alt="KKP Logo"
                        className="w-12 h-12"
                      /> */}
                      <div className="flex flex-col gap-1">
                        <SheetTitle>Pilih Stempel</SheetTitle>
                        <SheetDescription>
                          Pilih stempel tanda tangan elektronik yang ingin anda
                          taukan ke file sertifikat yang akan digenerate!
                        </SheetDescription>
                      </div>
                    </div>
                  </SheetHeader>
                  <div className="w-full mt-5 mb-10">
                    <div className="w-full border-2 rounded-md hover:cursor-pointer hover:border-blue-500 duration-700 flex items-center flex-col px-3 py-5 text-center justify-center border-dashed">
                      <p className="-mt-1 text-sm">
                        Kepala Balai Pelatihan dan Penyuluhan Perikanan
                        Banyuwangi
                      </p>
                      <Image
                        className="w-[200px] my-3"
                        width={0}
                        height={0}
                        alt="Logo Kementrian Kelautan dan Perikanan RI"
                        src={"/ttd-elektronik.png"}
                      />
                      <p className="-mt-1 font-extrabold text-sm">
                        MOCH. MUCHLISIN, A.Pi, M.P
                      </p>
                      <p className="font-extrabold text-sm -mt-1">
                        NIP. 197509161999031003
                      </p>
                    </div>
                  </div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button type="submit">Sematkan Stempel</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <div
                onClick={(e) => setShowFormAjukanPelatihan(true)}
                className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer"
              >
                <TbFileCertificate />
                Generate Sertifikat Peserta
              </div>
            </div>
          </div>

          <div className="max-h-[500px] flex flex-col gap-2 overflow-y-auto scroll-smooth">
            <SertifikatSettingPage1 />
            <SertifikatSettingPage2 />
          </div>
        </>
      ) : (
        <>
          {/* Header Tabel Data Pelatihan */}
          <div className="flex flex-wrap items-center mb-3 justify-between gap-3 sm:flex-nowrap">
            {/* Statistik Pelatihan */}
            <div className="flex w-full flex-wrap gap-3 sm:gap-5">
              <div className="flex min-w-47.5">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-primary">
                    Total Pelatihan Diikuti
                  </p>
                  <p className="text-sm font-medium">{data.length} pelatihan</p>
                </div>
              </div>
            </div>
          </div>

          {/* List Data Pelatihan */}
          <div>
            <div id="chartOne" className="-ml-5"></div>
            <div className="flex w-full items-center mb-2">
              {/* <Input
                placeholder="Cari Nama Pelatihan..."
                value={
                  (table
                    .getColumn("NamaPelatihan")
                    ?.getFilterValue() as string) ?? ""
                }
                onChange={(event: any) =>
                  table
                    .getColumn("NamaPelatihan")
                    ?.setFilterValue(event.target.value)
                }
                className="max-w-xs py-1 px-4 h-9 text-sm"
              /> */}
              <div className="flex w-full gap-1 items-start">
                <Select>
                  <SelectTrigger className="w-[160px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                    <div
                      onClick={(e) => {
                        router.push(
                          "/admin/lemdiklat/pelatihan/tambah-pelatihan"
                        );
                      }}
                      className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer"
                    >
                      <FaRupiahSign />
                      Jenis Pelatihan
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Jenis</SelectLabel>
                      <SelectItem value="pendaftaran">Reguler</SelectItem>
                      <SelectItem value="pelaksanaan">Aspirasi</SelectItem>
                      <SelectItem value="selesai">PNBP/BLU</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-[170px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                    <div
                      onClick={(e) => {
                        router.push(
                          "/admin/lemdiklat/pelatihan/tambah-pelatihan"
                        );
                      }}
                      className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer"
                    >
                      <TbChartBubble />
                      Status Pelatihan
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="pendaftaran">Pendaftaran</SelectItem>
                      <SelectItem value="pelaksanaan">Pelaksanaan</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-[180px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                    <div
                      onClick={(e) => {
                        router.push(
                          "/admin/lemdiklat/pelatihan/tambah-pelatihan"
                        );
                      }}
                      className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer"
                    >
                      <RiShipLine />
                      Bidang Pelatihan
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Bidang</SelectLabel>
                      <SelectItem value="apple">Kepelautan</SelectItem>
                      <SelectItem value="banana">Non-Kepelautan</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TableData
              isLoading={isFetching}
              columns={columns}
              table={table}
              type={"short"}
            />
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-inter"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-inter"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SheetInfoPelatihan = ({
  children,
  pelatihan,
}: {
  children: ReactElement;
  pelatihan?: any;
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[500px]">
        <SheetHeader>
          <SheetTitle className="leading-[110%]">
            Pelatihan Diversifikasi Usaha Produk Perikanan/Rumput Laut Bagi
            Masyarakat Kabupaten Alor
          </SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="flex w-full mt-4">
          <table>
            <tr>
              <td>
                <SheetDescription className="flex items-center gap-1 text-black font-medium">
                  <TbQrcode /> Kode Pelatihan
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>PDUP923</SheetDescription>
              </td>
            </tr>
            <tr>
              <td>
                <SheetDescription className="flex items-center gap-1 text-black font-medium">
                  <TbBuildingCommunity className="text-lg" /> Penyelenggara
                  Pelatihan
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>BPPP Tegal</SheetDescription>
              </td>
            </tr>
            <tr>
              <td>
                <SheetDescription className="flex items-center gap-1 text-black font-medium">
                  <TbMoneybag className="text-sm" /> Jenis Pelatihan
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>Aspirasi</SheetDescription>
              </td>
            </tr>
            <tr>
              <td>
                <SheetDescription className="flex items-center gap-1 text-black font-medium">
                  <TbFishChristianity className="text-sm" /> Bidang Pelatihan
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>Pengolahan/Pemasaran</SheetDescription>
              </td>
            </tr>
            <tr>
              <td>
                <SheetDescription className="flex items-center gap-1 text-black font-medium">
                  <TbTargetArrow className="text-2xl" /> Dukungan Program
                  Terobosan
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>Kalamu/Kalaju</SheetDescription>
              </td>
            </tr>
            <tr>
              <td>
                <SheetDescription className="flex items-center gap-1 text-black font-medium">
                  <TbCalendarStats className="text-sm" /> Tanggal Pelatihan
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>18 Mei 2024 - 20 Mei 2024</SheetDescription>
              </td>
            </tr>
            <tr>
              <td>
                <SheetDescription className="flex items-center gap-1 text-black font-medium">
                  <FaRupiahSign className="text-xs" /> Harga Pelatihan
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>Rp. 0</SheetDescription>
              </td>
            </tr>
            <tr>
              <td>
                <SheetDescription className="flex items-center gap-1 text-black font-medium">
                  <FaRupiahSign className="text-xs" /> Harga Pelatihan
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>Published to E-LAUT</SheetDescription>
              </td>
            </tr>
            <tr>
              <td>
                <SheetDescription className="text-black font-medium">
                  Lokasi Pelatihan
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>
                  Desan Karang Anyar Sambo, Jawa Timur - Klasikal
                </SheetDescription>
              </td>
            </tr>
            <tr>
              <td>
                <SheetDescription className="text-black font-medium">
                  Kuota Peserta
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>250 Orang</SheetDescription>
              </td>
            </tr>
            <tr>
              <td>
                <SheetDescription className="text-black font-medium">
                  Asal Peserta
                </SheetDescription>
              </td>
              <td className="mx-5">:</td>
              <td>
                <SheetDescription>Dinas Kota Anyar</SheetDescription>
              </td>
            </tr>
          </table>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TableDataPelatihanUser;

function DialogSertifikat({ children }: { children: ReactElement }) {
  const sertifikatRef = useRef<HTMLDivElement | null>(null); // Correctly type the ref

  const downloadSertifikat = () => {
    const sertifikat = sertifikatRef.current;
    if (!sertifikat) {
      console.error('Element with ID "invoice-container" not found in the DOM');
      return;
    }

    html2canvas(sertifikat).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("CBIB.II.2024.0034.pdf");
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[1225px]">
        <DialogHeader>
          <div className="flex gap-2 items-center">
            <MdVerified className="text-3xl text-blue-500" />
            <div className="flex flex-col">
              <DialogTitle>Nomor : 319/BPPSDM.5/RSDM.510/II/2024</DialogTitle>
              <DialogDescription>
                No. Sertifikasi terdaftar dan dinyatakan valid telah mengikuti
                pelatihan!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="max-h-[500px] flex flex-col gap-2 overflow-y-auto scroll-smooth">
          <div className="flex flex-col gap-4" ref={sertifikatRef}>
            <div className="w-full border flex flex-col gap-4 border-gray-300 px-10 py-6 rounded-md font-cambria leading-[120%] h-[120vh]">
              <div className="flex flex-row justify-end items-start">
                <p
                  className="text
                -base"
                >
                  No. Reg. : C.03.01.001147
                </p>
              </div>

              <div className="flex flex-col gap-0 w-full items-center justify-center mt-6">
                <h1 className="font-black text-3xl">SERTIFIKAT</h1>
                <p className="text-base mt-1 italic">CERTIFICATE</p>

                <p className="text-xl mt-1 font-black">
                  Nomor : 319/BPPSDM.5/RSDM.510/II/2024
                </p>
              </div>

              <div className="flex w-full flex-col items-start -mt-2 text-center">
                <p>
                  Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan
                  dan Perikanan berdasarkan Peraturan Pemerintah Nomor.62 Tahun
                  2014 tentang Penyelenggaraan Pendidikan, Pelatihan dan
                  Penyuluhan Perikanan, serta ketentuan pelaksanaannya
                  menyatakan bahwa :
                </p>
                <p className="text-xs italic">
                  The Agency for Marine and Fisheries Extension and Human
                  Resources Development based on Government Regulation Number 62
                  of 2014 concerning the Implementation of Fisheries Education,
                  Training and Extension as well as its implementing provisions
                  States that :
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full items-center text-center justify-center mt-3">
                <div className="w-fit border-b-black border-b pb-3">
                  <h1 className="font-black text-3xl">FARHAN AUGUSTIANSYAH</h1>
                </div>
                <div className="text-center">
                  <p>Lahir di Bekasi 01 Oktober 2001 </p>
                  <p className="text-xs italic">
                    Born in Bekasi, 01 October 2001
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full items-center justify-center mt-3">
                <h1 className="font-black text-3xl">TELAH LULUS</h1>
                <h3 className="font-black text-xl italic">HAS PASSED</h3>
              </div>

              <div className="flex w-full flex-col items-start mt-2 text-center">
                <p>
                  Dalam Pelatihan Ahli Pembudidaya Ikan Cara Budidaya Ikan yang
                  Baik (APH - CBIB) yang diselenggarakan atas kerjasama Pusat
                  Pelatihan Kelautan dan Perikanan – Badan Penyuluhan dan
                  Pengembangan Sumber Daya Manusia Kelautan dan Perikanan dengan
                  Direktorat Produksi dan Usaha Budidaya – Direktorat Jenderal
                  Perikanan Budidaya pada tanggal 19 - 21 Februari 2024.
                </p>
                <p className="text-xs italic">
                  In the Training on Good Aquaculture Practices held in
                  collaboration between the Marine and Fisheries Training Center
                  – the Agency for Marine and Fisheries Extension and Human
                  Resources Development and the Directorate of Aquaculture
                  Production and Business - Directorate General of Aquaculture
                  on 19 - 21 February 2024.
                </p>
              </div>

              <div className="flex gap-2 items-center justify-center mt-5">
                <div className="flex flex-col font-cambria text-center items-center justify-center">
                  <div className="flex w-full flex-col items-cennter mt-2 text-center">
                    <p>Jakarta, 21 Februari 2024</p>
                    <p>
                      Kepala Badan Penyuluhan dan Pengembangan Sumber Daya
                      Manusia Kelautan dan Perikanan
                    </p>
                    <p className="text-xs italic">
                      Chairman of the Agency for Marine and Fisheries Extension
                      and Human Resources Development
                    </p>
                  </div>
                  <Image
                    className="w-[200px] my-3"
                    width={0}
                    height={0}
                    alt="Logo Kementrian Kelautan dan Perikanan RI"
                    src={"/ttd-elektronik.png"}
                  />
                  <p className="-mt-1 font-extrabold">
                    Dr. I Nyoman Radiarta, S.Pi, M.Sc
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full border flex flex-col gap-4 border-gray-300 px-10 py-6 rounded-md font-cambria leading-[120%] !h-[120vh]">
              <div className="flex flex-row justify-center items-center">
                <div className="flex flex-row gap-2 items-center">
                  <div className="flex flex-col font-cambria text-center">
                    <p className="font-extrabold max-w-md w-full italic">
                      Good Aquaculture Practices (GAqP) Training For Students in
                      the Marine and Fisheries Education Units
                    </p>
                    <p className="font-extrabold max-w-3xl">
                      19 – 21 February 2024
                    </p>
                  </div>
                </div>
              </div>

              <table
                border={1}
                className="text-center border border-black-2 p-2 rounded-md"
              >
                <tr>
                  <td
                    rowSpan={2}
                    className="border border-black-2 p-2 font-extrabold text-lg"
                  >
                    NO.
                  </td>
                  <td
                    rowSpan={2}
                    className="border border-black-2 p-2 font-extrabold text-lg"
                  >
                    COURSES
                  </td>
                  <td
                    colSpan={3}
                    className="border border-black-2 p-2 font-extrabold text-lg"
                  >
                    JAM PELATIHAN
                  </td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2 font-extrabold text-lg">
                    T
                  </td>
                  <td className="border border-black-2 p-2 font-extrabold text-lg">
                    P
                  </td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2 font-black">I</td>
                  <td className="border border-black-2 font-black p-2 text-left">
                    GENERAL COMPETENCY
                  </td>
                  <td className="border border-black-2 p-2"></td>
                  <td className="border border-black-2 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2">1.</td>
                  <td className="border border-black-2 p-2 text-left">
                    GAqP Certification Policy
                  </td>
                  <td className="border border-black-2 p-2">1</td>
                  <td className="border border-black-2 p-2">3</td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2 font-black">II</td>
                  <td className="border border-black-2 font-black p-2 text-left">
                    CORE COMPETENCIES
                  </td>
                  <td className="border border-black-2 p-2"></td>
                  <td className="border border-black-2 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2">2.</td>
                  <td className="border border-black-2 p-2 text-left">
                    Food Hazards, International and National Requirements
                  </td>
                  <td className="border border-black-2 p-2">1</td>
                  <td className="border border-black-2 p-2">3</td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2">3.</td>
                  <td className="border border-black-2 p-2 text-left">
                    Indonesian National GAqP Food Safety Standard Requirements
                  </td>
                  <td className="border border-black-2 p-2">1</td>
                  <td className="border border-black-2 p-2">3</td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2">4.</td>
                  <td className="border border-black-2 p-2 text-left">
                    Aquaculture Quality and Safety Guarantee System Mechanism
                    for Fishery Products
                  </td>
                  <td className="border border-black-2 p-2">1</td>
                  <td className="border border-black-2 p-2">3</td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2">4.</td>
                  <td className="border border-black-2 p-2 text-left">
                    Aquaculture Unit Risk Management
                  </td>
                  <td className="border border-black-2 p-2">1</td>
                  <td className="border border-black-2 p-2">3</td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2">4.</td>
                  <td className="border border-black-2 p-2 text-left">
                    Fish Health Management and Biosecurity
                  </td>
                  <td className="border border-black-2 p-2">1</td>
                  <td className="border border-black-2 p-2">3</td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2">4.</td>
                  <td className="border border-black-2 p-2 text-left">
                    Traceability in the Fish Aquaculture Unit
                  </td>
                  <td className="border border-black-2 p-2">1</td>
                  <td className="border border-black-2 p-2">3</td>
                </tr>
                <tr>
                  <td className="border border-black-2 p-2">4.</td>
                  <td className="border border-black-2 p-2 text-left">
                    Aquaculture Process Control Procedures
                  </td>
                  <td className="border border-black-2 p-2">1</td>
                  <td className="border border-black-2 p-2">3</td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    className="font-extrabold text-lg border border-black-2 p-2"
                  >
                    JUMLAH TOTAL
                  </td>
                  <td className="border border-black-2 p-2 font-extrabold">
                    4
                  </td>
                  <td className="border border-black-2 p-2 font-extrabold">
                    12
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-500"
          >
            <TbLink />
            Salin Tautan
          </Button>
          <Button
            onClick={downloadSertifikat}
            type="submit"
            className="flex items-center gap-1"
          >
            <TbCloudDownload />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
