import React, { ReactElement, useState } from "react";
import TableData from "../Tables/TableData";
import {
  RiInfoI,
  RiRadioButtonLine,
  RiShipLine,
  RiVerifiedBadgeFill,
} from "react-icons/ri";

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
import {
  ArrowUpDown,
  Edit3Icon,
  Fullscreen,
  LucideClipboardEdit,
  LucideNewspaper,
  LucidePrinter,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HiMiniUserGroup,
  HiOutlineUserGroup,
  HiUserGroup,
} from "react-icons/hi2";
import {
  TbBook,
  TbBookFilled,
  TbBroadcast,
  TbBuildingCommunity,
  TbCalendarCheck,
  TbCalendarDot,
  TbCalendarExclamation,
  TbCalendarPin,
  TbCalendarSearch,
  TbCalendarStats,
  TbChartBubble,
  TbChartDonut,
  TbDatabase,
  TbDatabaseEdit,
  TbFileCertificate,
  TbFileDigit,
  TbFishChristianity,
  TbInfoCircle,
  TbMoneybag,
  TbQrcode,
  TbSchool,
  TbTargetArrow,
} from "react-icons/tb";
import {
  IoIosBook,
  IoIosInformationCircle,
  IoMdBook,
  IoMdGlobe,
} from "react-icons/io";
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
import { MdOutlineSaveAlt } from "react-icons/md";
import FormPelatihan from "../admin/formPelatihan";
import Toast from "@/components/toast";
import SertifikatSettingPage1 from "@/components/sertifikat/sertifikatSettingPage1";
import SertifikatSettingPage2 from "@/components/sertifikat/sertifikatSettingPage2";
import { PiMicrosoftExcelLogoFill, PiStampLight } from "react-icons/pi";
import Image from "next/image";
import axios, { AxiosResponse } from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { PelatihanMasyarakat } from "@/types/product";
import { FaBookOpen, FaRupiahSign } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertDate } from "@/utils";
import Cookies from "js-cookie";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import { Progress } from "@/components/ui/progress";
import { GiBookmarklet } from "react-icons/gi";
import { DialogSertifikatPelatihan } from "@/components/sertifikat/dialogSertifikatPelatihan";
import { DialogTemplateSertifikatPelatihan } from "@/components/sertifikat/dialogTemplateSertifikatPelatihan";
import Link from "next/link";
import { generateFullNameBalai, generateTanggalPelatihan } from "@/utils/text";
import { GrLocation } from "react-icons/gr";

const TableDataPemberitahuanPelatihan: React.FC = () => {
  const [showFormAjukanPelatihan, setShowFormAjukanPelatihan] =
    React.useState<boolean>(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [data, setData] = React.useState<PelatihanMasyarakat[]>([]);

  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  const handleFetchingPublicTrainingData = async () => {
    setIsFetching(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getPelatihanAdmin`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      console.log("PELATIHAN BY LEMDIK: ", response);

      // Filter data where SuratPemberitahuan is not an empty string
      const filteredData = response.data.data.filter(
        (item: any) => item.SuratPemberitahuan !== ""
      );

      setData(filteredData);
      setIsFetching(false);
    } catch (error) {
      console.error("Error posting training data:", error);
      setIsFetching(false);
      throw error;
    }
  };

  const publishedData = data.filter(
    (item: PelatihanMasyarakat) => item.Status === "Publish"
  ).length;

  /* ================================= HANDLING PENERBITAN SERTIFIKAT ====================================== */
  const [beritaAcara, setBeritaAcara] = React.useState<File | null>(null);
  const handleFileChange = (e: any) => {
    setBeritaAcara(e.target.files[0]);
  };
  console.log({ beritaAcara });

  const [isOpenFormMateri, setIsOpenFormMateri] =
    React.useState<boolean>(false);
  const [selectedId, setSelectedId] = React.useState<number>(0);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [sertifikatUntukPelatihan, setSertifikatUntukPelatihan] =
    React.useState("");
  const [ttdSertifikat, setTtdSertifikat] = React.useState("");

  const router = useRouter();
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns: ColumnDef<PelatihanMasyarakat>[] = [
    {
      accessorKey: "KodePelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-gray-900 w-fit mx-0  font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`text-center uppercase w-full items-center justify-center mx-0`}
        >
          {row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "IdPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`flex w-full mx-0 px-0 items-center justify-center text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Action
            <TbDatabaseEdit className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="w-full mx-0 px-0 flex flex-col items-center justify-center gap-2">
          <div className={`flex items-center justify-center gap-1  mt-2`}>
            <Link
              href={`/admin/puslat/pelatihan/detail-pelatihan/${row.getValue(
                "KodePelatihan"
              )}/${row.getValue("IdPelatihan")}`}
              onClick={(e) =>
                router.push(
                  `/admin/puslat/pelatihan/detail-pelatihan${row.getValue(
                    "IdPelatihan"
                  )}/${row.getValue("KodePelatihan")}`
                )
              }
              className="border border-gray-900 hover:bg-gray-900 group duration-700 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2"
            >
              <RiInfoI className="h-4 w-4 text-gray-900 group-hover:text-white duration-700" />
            </Link>

            {/* <Button
              onClick={(e) =>
                router.push(
                  `/admin/lemdiklat/pelatihan/${row.getValue(
                    "KodePelatihan"
                  )}/peserta-pelatihan/${row.getValue("IdPelatihan")}`
                )
              }
              variant="outline"
              className="border border-green-500"
            >
              <HiUserGroup className="h-4 w-4 text-green-500" />
            </Button>

            {row.original.StatusApproval == "Selesai" ? (
              row.original.NoSertifikat == "" ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      onClick={(e) => setOpenFormSertifikat(true)}
                      variant="outline"
                      className="border border-blue-600"
                    >
                      <RiVerifiedBadgeFill className="h-4 w-4 text-blue-600" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Penerbitan Sertifikat Pelatihan
                        </AlertDialogTitle>
                        <AlertDialogDescription className="-mt-2">
                          Lampirkan Berita acara sebagai bukti pelaksanaan
                          pelatihan yang telah selesai, tunggu proses approval
                          dari pusat, dan dapatkan nomor sertifikat Pelatihanmu!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <fieldset>
                        <div className="flex flex-wrap  mb-1 w-full">
                          <div className="w-full">
                            <label
                              className="block text-gray-800 text-sm font-medium mb-1"
                              htmlFor="noSertifikat"
                            >
                              Sertifikat untuk Pelatihan{" "}
                              <span className="text-red-600">*</span>
                            </label>
                            <input
                              id="noSertifikat"
                              type="hidden"
                              className="form-input w-full text-black border-gray-300 rounded-md"
                              placeholder=""
                              value={row.original.IdPelatihan}
                              onChange={(e) =>
                                setSertifikatUntukPelatihan(
                                  row.original.IdPelatihan.toString()
                                )
                              }
                              disabled
                              readOnly
                            />
                            <input
                              id="noSertifikat"
                              type="text"
                              className="form-input w-full text-black border-gray-300 rounded-md"
                              placeholder={
                                row.original.NamaPelatihan +
                                " - " +
                                row.original.KodePelatihan
                              }
                              disabled
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap  mb-1 w-full">
                          <div className="w-full">
                            <label
                              className="block text-gray-800 text-sm font-medium mb-1"
                              htmlFor="noSertifikat"
                            >
                              TTD Sertifikat{" "}
                              <span className="text-red-600">*</span>
                            </label>
                            <select
                              name=""
                              id=""
                              onChange={(e) => setTtdSertifikat(e.target.value)}
                              className="w-full rounded-lg border border-gray-300"
                            >
                              <option value={""}>Pilih Penandatangan</option>
                              <option
                                onClick={(e) =>
                                  setTtdSertifikat("Kepala BPPSDM")
                                }
                                value={"Kepala BPPSDM"}
                              >
                                Kepala BPPSDM
                              </option>
                              <option
                                onClick={(e) =>
                                  setTtdSertifikat(
                                    "Kepala Balai Pelatihan dan Penyuluhan KP"
                                  )
                                }
                                value={
                                  "Kepala Balai Pelatihan dan Penyuluhan KP"
                                }
                              >
                                Kepala Balai Pelatihan dan Penyuluhan KP
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 space-y-2">
                          <label
                            className="block text-gray-800 text-sm font-medium mb-1"
                            htmlFor="name"
                          >
                            Berita Acara <span className="text-red-600">*</span>
                          </label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col rounded-lg border-2 border-dashed w-full h-40 p-10 group text-center">
                              <div className="h-full w-full text-center flex flex-col items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-10 h-10 text-blue-400 group-hover:text-blue-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  />
                                </svg>
                                {beritaAcara == null ? (
                                  <p className="pointer-none text-gray-500 text-sm">
                                    <span className="text-sm">
                                      Drag and drop
                                    </span>{" "}
                                    files here <br /> or{" "}
                                    <a
                                      href=""
                                      id=""
                                      className="text-blue-600 hover:underline"
                                    >
                                      select a file
                                    </a>{" "}
                                    from your computer
                                  </p>
                                ) : (
                                  <p className="pointer-none text-gray-500 text-sm">
                                    {beritaAcara.name}
                                  </p>
                                )}{" "}
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">
                          <span>File type: doc,pdf,types of images</span>
                        </p>
                      </fieldset>
                    </>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) =>
                          handleGenerateSertifikat(row.original.IdPelatihan)
                        }
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      onClick={(e) => setOpenFormSertifikat(true)}
                      variant="outline"
                      className=" border border-blue-600"
                    >
                      <RiVerifiedBadgeFill className="h-4 w-4 text-blue-600" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <div className="flex flex-col items-center justify-center w-full">
                      <Image
                        src={"/illustrations/web_13.jpg"}
                        alt="Not Found"
                        width={0}
                        height={0}
                        className="w-[400px]"
                      />
                      <AlertDialogHeader className="flex flex-col items-center justify-center text-center">
                        <AlertDialogTitle>
                          Penerbitan Sertifikat Pelatihan
                        </AlertDialogTitle>
                        <AlertDialogDescription className="-mt-2 text-center">
                          Nomor sertifikat kamu telah digenerate, kamu tidak
                          dapat mengatur ulang no sertifikatmu!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    onClick={(e) => setOpenFormSertifikat(true)}
                    variant="outline"
                    className=" border border-blue-600"
                  >
                    <RiVerifiedBadgeFill className="h-4 w-4 text-blue-600" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <div className="flex flex-col items-center justify-center w-full">
                    <Image
                      src={"/illustrations/web_13.jpg"}
                      alt="Not Found"
                      width={0}
                      height={0}
                      className="w-[400px]"
                    />
                    <AlertDialogHeader className="flex flex-col items-center justify-center text-center">
                      <AlertDialogTitle>
                        Penerbitan Sertifikat Pelatihan
                      </AlertDialogTitle>
                      <AlertDialogDescription className="-mt-2 text-center">
                        Dalam penerbitan sertifikat, diharapkan proses pelatihan
                        sudah selesai dan mengirimkan bukti berupa berita acara
                        ke pusat untuk didapatkan approval melakukan generate
                        nomor sertifikat dan pengajuan penerbitan!
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )} */}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "NamaPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`p-0 !text-left w-fit flex items-center justify-start text-gray-900 font-semibold mx-0 px-0`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pelatihan
            <TbInfoCircle className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`mx-0 px-0 w-fit text-left capitalize`}>
          <p className="text-sm font-semibold tracking-tight leading-none">
            {row.getValue("NamaPelatihan")}
          </p>
          <p className="text-xs text-gray-400 mb-1 mt-1 leading-[110%]">
            {" "}
            {row.getValue("KodePelatihan")} • {row.original.BidangPelatihan} •
            Mendukung Program Terobosan {row.original.DukunganProgramTerobosan}
          </p>
          <div className={`${"ml-0"} text-left capitalize mt-1`}>
            <p className="text-xs  font-medium capitalize "> </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "PenyelenggaraPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`p-0 !text-left w-fit flex items-center justify-start text-gray-900 font-semibold mx-0 px-0`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Penyelenggara Pelatihan
            <TbSchool className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`mx-0 px-0 w-fit text-left capitalize`}>
          <p className="text-sm font-semibold tracking-tight leading-none">
            {row.getValue("PenyelenggaraPelatihan")}
          </p>
          <p className="text-xs text-gray-400 leading-[110%] mt-1 mb-1">
            {generateFullNameBalai(row.getValue("PenyelenggaraPelatihan"))}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "TanggalMulaiPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`p-0 !text-left w-fit flex items-center justify-start text-gray-900 font-semibold mx-0 px-0`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Waktu Pelaksanaan
            <TbCalendarPin className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`mx-0 px-0 w-fit text-left capitalize`}>
          <p className="text-sm font-semibold tracking-tight leading-none">
            Dilaksanakan pada tanggal
          </p>
          <p className="text-xs text-gray-400 leading-[110%] mt-1 mb-1">
            {generateTanggalPelatihan(row.getValue("TanggalMulaiPelatihan"))} -{" "}
            {generateTanggalPelatihan(row.original.TanggalBerakhirPelatihan)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "LokasiPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`p-0 !text-left w-fit flex items-center justify-start text-gray-900 font-semibold mx-0 px-0`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Lokasi Pelaksanaan
            <GrLocation className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`mx-0 px-0 w-fit text-left capitalize`}>
          {/* <p className="text-sm font-semibold tracking-tight leading-none">
            Dilaksanakan di
          </p> */}
          <p className="text-xs text-gray-400 leading-[110%] mt-1 mb-1">
            {row.getValue("LokasiPelatihan")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "KoutaPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={` !text-left w-fit flex items-center justify-start text-gray-900 font-semibold mx-0 px-0`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Peserta
            <HiOutlineUserGroup className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`mx-0  w-full items-center justify-center flex text-left capitalize`}
        >
          {/* <p className="text-sm font-semibold tracking-tight leading-none">
            Dilaksanakan di
          </p> */}
          <p className="text-xs text-gray-400 leading-[110%] mt-1 mb-1">
            {row.original.UserPelatihan.length} /
            <span className="text-gray-900">
              {" "}
              {row.getValue("KoutaPelatihan")}
            </span>
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

  /**
   * FILTERING PELATIHAN
   * >> concists of filtering feature functions and states to handle
   *    fetching and filtering data pelatihan by user lemdiklat
   */
  const [filterSelectedJenisPelatihan, setFilterSelectedJenisPelatihan] =
    React.useState("");

  const filteredData = React.useMemo(() => {
    return data.filter((item) =>
      item.JenisPelatihan.includes(filterSelectedJenisPelatihan)
    );
  }, [filterSelectedJenisPelatihan, data]);

  React.useEffect(() => {
    handleFetchingPublicTrainingData();
  }, []);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8">
      {showFormAjukanPelatihan ? (
        <></>
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
                  <p className="font-semibold text-primary">Total Pelatihan</p>
                  <p className="text-sm font-medium">{data.length} pelatihan</p>
                </div>
              </div>
              <div className="flex min-w-47.5">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-secondary">
                    Total Publish Umum
                  </p>
                  <p className="text-sm font-medium">
                    {publishedData} pelatihan
                  </p>
                </div>
              </div>
              <div className="flex min-w-47.5">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-green-400"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-green-400">Total Selesai</p>
                  <p className="text-sm font-medium">
                    {data?.reduce(
                      (total: number, item: PelatihanMasyarakat) => {
                        // Check if StatusApprovala is "Selesai"
                        if (item.StatusApproval === "Selesai") {
                          return total + 1;
                        }
                        return total;
                      },
                      0
                    ) || 0}{" "}
                    pelatihan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* List Data Pelatihan */}
          <div>
            <div id="chartOne" className="-ml-5"></div>
            <div className="flex w-full items-center mb-2"></div>

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

export default TableDataPemberitahuanPelatihan;
