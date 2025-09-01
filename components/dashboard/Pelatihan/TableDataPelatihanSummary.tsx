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
import { PelatihanMasyarakat } from "@/types/product";

const TableDataPelatihanSummary: React.FC<{
  data: PelatihanMasyarakat[];
}> = ({ data }) => {
  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  const [isOpenFormMateri, setIsOpenFormMateri] =
    React.useState<boolean>(false);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const pathPublic = usePathname();

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns: ColumnDef<PelatihanMasyarakat>[] = [
    {
      accessorKey: "IdPelatihan",
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
      accessorKey: "NamaPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`p-0 !text-center max-w-full  ${pathPublic == "/akp" ? "hidden" : "flex"
              } items-center justify-start text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Pelatihan
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
            {row.original.NamaPelatihan}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "BidangPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bidang Pelatihan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`text-left flex flex-wrapflex-col capitalize`}>
          <p className="text-sm text-black leading-[100%]">
            {" "}
            {row.original.BidangPelatihan}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "DukunganProgramTerobosan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Dukungan Program Terobosan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`text-left flex flex-wrapflex-col capitalize`}>
          <p className="text-sm text-black leading-[100%]">
            {" "}
            {row.original.DukunganProgramTerobosan}
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
            {generateTanggalPelatihan(
              row.original.TanggalMulaiPelatihan
            )} -{" "}
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
            className="p-0 max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Lokasi Pelatihan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`text-left flex flex-wrapflex-col capitalize`}>
          <p className="text-sm text-black leading-[100%]">
            {" "}
            {row.original.LokasiPelatihan}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "JumlahPeserta",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-center max-w-full flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Jumlah Peserta
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
            {row.original.JumlahPeserta}/{row.original.KoutaPelatihan}
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
                <p className="font-semibold text-primary">Total Pelatihan</p>
                <p className="text-sm font-medium">{data.length} pelatihan</p>
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

export default TableDataPelatihanSummary;
