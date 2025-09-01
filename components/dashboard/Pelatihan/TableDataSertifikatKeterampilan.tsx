import React, { ReactElement, useState } from "react";
import TableData from "../Tables/TableData";

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
import { HiMiniUserGroup, HiUserGroup } from "react-icons/hi2";
import {
  TbBook,
  TbBookFilled,
  TbBroadcast,
  TbChartBubble,
  TbChartDonut,
  TbDatabase,
  TbDatabaseEdit,
  TbFileCertificate,
  TbFileDigit,
  TbFishChristianity,
  TbMoneybag,
  TbQrcode,
  TbSchool,
  TbTargetArrow,
} from "react-icons/tb";

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
import { usePathname, useRouter } from "next/navigation";
import { MdOutlineSaveAlt } from "react-icons/md";
import FormPelatihan from "../admin/formPelatihan";
import Toast from "@/components/toast";
import { PiMicrosoftExcelLogoFill, PiStampLight } from "react-icons/pi";
import Image from "next/image";
import axios, { AxiosResponse } from "axios";
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
import Link from "next/link";
import { Blanko, BlankoKeluar } from "@/types/blanko";
import { generateTanggalPelatihan } from "@/utils/text";

const TableDataSertifikatKeterampilan: React.FC = () => {
  const [showFormAjukanPelatihan, setShowFormAjukanPelatihan] =
    React.useState<boolean>(false);
  const [showCertificateSetting, setShowCertificateSetting] =
    React.useState<boolean>(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [data, setData] = React.useState<BlankoKeluar[]>([]);

  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  const handleFetchingBlanko = async () => {
    setIsFetching(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL}/adminpusat/getBlankoKeluar?tipe_blanko=Certificate of Proficiency (CoP)`
      );
      console.log("RESPONSE BLANKO KELUAR : ", response);
      setData(response.data.data);

      setIsFetching(false);
    } catch (error) {
      console.error("ERROR BLANKO KELUAR : ", error);
      setIsFetching(false);
      throw error;
    }
  };

  const [isOpenFormMateri, setIsOpenFormMateri] =
    React.useState<boolean>(false);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [sertifikatUntukPelatihan, setSertifikatUntukPelatihan] =
    React.useState("");
  const [ttdSertifikat, setTtdSertifikat] = React.useState("");
  const [openFormSertifikat, setOpenFormSertifikat] = React.useState(false);

  const [isOpenFormPublishedPelatihan, setIsOpenFormPublishedPelatihan] =
    React.useState<boolean>(false);

  const pathPublic = usePathname();

  const router = useRouter();
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns: ColumnDef<BlankoKeluar>[] = [
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
      accessorKey: "NoSertifikat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`p-0 !text-center max-w-full  ${pathPublic == "/akp" ? "hidden" : "flex"
              } items-center justify-start text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tipe Blanko
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`text-left  capitalize ${pathPublic == "/akp" ? "hidden" : "flex flex-wrap flex-col"
            }`}
        >
          <p className="text-sm text-black leading-[100%]">
            {row.original.TipeBlanko}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "NamaLemdiklat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-center max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Lemdiklat
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-black leading-[100%]">
            {" "}
            {row.original.NamaLemdiklat}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "TanggalKeluar",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-center max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal Penerbitan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`text-left flex flex-wrap items-center flex-col capitalize`}
        >
          <p className="text-sm text-black leading-[100%]">
            {" "}
            {generateTanggalPelatihan(row.original.TanggalKeluar)}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "NamaPelaksana",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-center max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Pelaksana
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={` text-left flex flex-wrap items-center justify-center flex-col capitalize`}
        >
          <p className="text-sm text-black leading-[100%]">
            {row.original.NamaPelaksana}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "TanggalPermohonan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-center max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal Permohonan <br />
            Blanko Kosong/Pencetakan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`text-left flex flex-wrap items-center justify-center flex-col capitalize`}
        >
          <p className="text-sm text-black leading-[100%]">
            {generateTanggalPelatihan(row.original.TanggalPermohonan)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "LinkPermohonan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={` ${pathPublic == "/akp"
                ? "hidden"
                : "flex items-center justify-start"
              } p-0 !text-center max-w-full  text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Link Permohonan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={` ${pathPublic == "/akp" ? "hidden" : "flex flex-wrap flex-col"
            }   text-left`}
        >
          <p className="text-sm text-blue-500 underline leading-[100%] ">
            {" "}
            {row.original.LinkPermohonan}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "NamaProgram",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-center max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Program
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-black leading-[100%]">
            {" "}
            {row.original.NamaProgram}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "TanggalPelaksanaan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-center max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal Pelaksanaan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-black leading-[100%]">
            {" "}
            {row.original.TanggalPelaksanaan}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "JumlahPesertaLulus",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-center max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Jumlah Peserta Lulus
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`text-center flex flex-wrap flex-col capitalize`}>
          <p className="text-sm text-black leading-[100%]">
            {" "}
            {row.original.JumlahPesertaLulus}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "NoSeriBlanko",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-center max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No Seri Blanko
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-black leading-[100%]">
            {" "}
            {row.original.NoSeriBlanko}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "Status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-center max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-black leading-[100%]">
            {" "}
            {row.original.Status}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "LinkDataDukung",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`${pathPublic == "/akp"
                ? "hidden"
                : "flex items-center justify-start"
              } p-0 !text-center max-w-full  text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sertifikat Digital <br /> Sudah Diterbitkan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${pathPublic == "/akp" ? "hidden" : "flex flex-wrap flex-col"
            }  text-left  text-blue-500`}
        >
          <Link
            href={row.original.LinkDataDukung}
            className="text-sm text-blue-500 underline leading-[100%]"
          >
            {" "}
            {row.original.LinkDataDukung}
          </Link>
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
    handleFetchingBlanko();
    handleFetchingBlankoMaster();
  }, []);

  const handleFetchingBlankoMaster = async () => {
    setIsFetching(true);
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL}/adminpusat/getBlanko`
      );
      console.log("RESPONSE BLANKO : ", response);
      setDataBlanko(response.data.data);

      setIsFetching(false);
    } catch (error) {
      console.error("ERROR BLANKO : ", error);
      setIsFetching(false);
      throw error;
    }
  };

  const [dataBlanko, setDataBlanko] = React.useState<Blanko[]>([]);

  const [tipeBlanko, setTipeBlanko] = React.useState<string>("");
  const [idBlanko, setIdBlanko] = React.useState<string>("");
  const [namaLemdiklat, setNamaLemdiklat] = React.useState<string>("");
  const [namaPelaksana, setNamaPelaksana] = React.useState<string>("");
  const [tanggalPermohonan, setTanggalPermohonan] = React.useState<string>("");
  const [linkPermohonan, setLinkPermohonan] = React.useState<string>("");
  const [namaProgram, setNamaProgram] = React.useState<string>("");
  const [tanggalPelaksanaan, setTanggalPelaksanaan] =
    React.useState<string>("");
  const [jumlahPesertaLulus, setJumlahPesertaLulus] =
    React.useState<string>("");
  const [jumlahBlankoDiajukan, setJumlahBlankoDiajukan] =
    React.useState<string>("");
  const [jumlahBlankoDisetujui, setJumlahBlankoDisetujui] =
    React.useState<string>("");
  const [noSeriBlanko, setNoSeriBlanko] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("");
  const [isSd, setIsSd] = React.useState<string>("");
  const [isCetak, setIsCetak] = React.useState<string>("");
  const [tipePengambilan, setTipePengambilan] = React.useState<string>("");
  const [petugasYangMenerima, setPetugasYangMenerima] =
    React.useState<string>("");
  const [petugasYangMemberi, setPetugasYangMemberi] =
    React.useState<string>("");
  const [linkDataDukung, setLinkDataDukung] = React.useState<string>("");
  const [keterangan, setKeterangan] = React.useState<string>("");

  const handlePostBlanko = async (e: any) => {
    e.preventDefault();

    const data = new FormData();
    data.append("TipeBlanko", tipeBlanko);
    data.append("IdBlanko", idBlanko);
    data.append("NamaLemdiklat", namaLemdiklat);
    data.append("NamaPelaksana", namaPelaksana);
    data.append("TipeBlanko", tipeBlanko);
    data.append("TanggalPermohonan", tanggalPermohonan);
    data.append("LinkPermohonan", linkPermohonan);
    data.append("NamaProgram", namaProgram);
    data.append("TanggalPelaksanaan", tanggalPelaksanaan);
    data.append("JumlahPesertaLulus", jumlahPesertaLulus);
    data.append("JumlahBlankoDiajukan", jumlahBlankoDiajukan);
    data.append("JumlahBlankoDisetujui", jumlahBlankoDisetujui);
    data.append("NoSeriBlanko", noSeriBlanko);
    data.append("Status", status);
    data.append("IsSd", isSd);
    data.append("IsCetak", isCetak);
    data.append("TipePengambilan", tipePengambilan);
    data.append("PetugasYangMenerima", petugasYangMenerima);
    data.append("PetugasYangMemberi", petugasYangMemberi);
    data.append("LinkDataDukung", linkDataDukung);
    data.append("Keterangan", keterangan);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL}/adminPusat/addBlankoKeluar`,
        data,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      handleFetchingBlanko();
      console.log("RESPONSE POST BLANKO : ", response);
      Toast.fire({
        icon: "success",
        title: `Berhasil mengupload riwayat blanko keluar di Pusat Pelatihan KP!`,
      });
      setIsOpenFormMateri(!isOpenFormMateri);
    } catch (error) {
      console.error("ERROR POST BLANKO : ", error);
      Toast.fire({
        icon: "error",
        title: `Gagal mengupload riwayat blanko keluar di Pusat Pelatihan KP!`,
      });
      handleFetchingBlanko();
      setIsOpenFormMateri(!isOpenFormMateri);
    }
  };

  return (
    <div className="col-span-12 rounded-xl  border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8">
      <>
        {/* Header Tabel Data Pelatihan */}
        <div className="flex flex-wrap items-center mb-3 justify-between gap-3 sm:flex-nowrap">
          {/* Statistik Pelatihan */}
          <div className="flex w-full flex-wrap gap-3 sm:gap-5">
            <div className="flex min-w-47.5">
              <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
              </span>
              <div className="w-full">
                <p className="font-semibold text-primary">
                  Total Sertifikat CoP
                </p>
                <p className="text-sm font-medium">
                  {data
                    .filter(
                      (item: BlankoKeluar) =>
                        item.TipeBlanko === "Certificate of Proficiency (CoP)"
                    )
                    .reduce(
                      (total: number, item: BlankoKeluar) =>
                        total + item.JumlahBlankoDisetujui,
                      0
                    )}{" "}
                  blanko
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* List Data Pelatihan */}
        <div>
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
    </div>
  );
};

export default TableDataSertifikatKeterampilan;
