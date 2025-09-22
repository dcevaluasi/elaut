import React, { useState } from "react";
import TableData from "@/commons/TableData";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, LucideListChecks, Trash, Edit3Icon } from "lucide-react";
import { TbDatabaseEdit, TbSchool } from "react-icons/tb";
import { HiMiniUserGroup, HiOutlineDocument } from "react-icons/hi2";
import { MdOutlinePayment } from "react-icons/md";
import { IoMdInformationCircle } from "react-icons/io";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaCircleUser } from "react-icons/fa6";
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
import { ManningAgentUsers } from "@/types/product";
import Link from "next/link";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { formatIndonesianDateFromString } from "@/lib/utils";

const TablelDataPesertaPelatihanManningAgent = ({
  data,
}: {
  data: ManningAgentUsers[];
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [selectedDataPeserta, setSelectedDataPeserta] =
    React.useState<ManningAgentUsers | null>(null);
  console.log("SELECTED DATA PESERTA", selectedDataPeserta);

  const columns: ColumnDef<ManningAgentUsers>[] = [
    {
      accessorKey: "KodePelatihan",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-gray-900 font-semibold w-fit"
          onClick={() => column.toggleSorting()}
        >
          No <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="w-full text-center uppercase">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "IdPelatihan",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="flex items-center justify-center p-0 w-full text-gray-900 font-semibold"
          onClick={() => column.toggleSorting()}
        >
          Actions <TbDatabaseEdit className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            onClick={(e) => setSelectedDataPeserta(row.original)}
            className="border border-black hover:bg-black hover:text-white"
          >
            <IoMdInformationCircle className="h-4 w-4" />
          </Button>
          {/* <Button
            variant="outline"
            className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <RiVerifiedBadgeFill className="h-4 w-4" />
          </Button> */}
        </div>
      ),
    },
    {
      accessorKey: "NoRegistrasi",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-black font-semibold w-fit p-0 flex items-center"
        >
          Nama Peserta <HiMiniUserGroup className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left capitalize">
          <p className="text-base font-semibold">{row.original?.Nama}</p>
          <p className="text-xs text-gray-400">
            {row.original?.Nik} • {row.original?.Alamat} •{" "}
            {row.original.NoTelpon}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "IdUsers",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-black font-semibold w-fit p-0 flex items-center"
        >
          Detail Akun <FaCircleUser className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left">
          <p className="text-base font-semibold">{row.original?.Email}</p>
          <p className="text-xs text-gray-400">{row.original.Password}</p>
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
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <div className="col-span-12 rounded-md border bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-8 relative">
      {selectedDataPeserta != null && (
        <Button
          type="button"
          className="absolute top-5 right-5 bg-white border hover:bg-blue-500 duration-700 hover:text-white  border-blue-500 text-blue-500"
          onClick={() => setSelectedDataPeserta(null)}
        >
          <IoArrowBackCircleOutline className="mr-1 text-lg" />
          Kembali
        </Button>
      )}

      {selectedDataPeserta !== null ? (
        <>
          <div className="flex flex-col">
            <p className="text-lg font-bold">{selectedDataPeserta!.Nama}</p>
            <table className="flex flex-col w-full">
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">NIK</td>
                <td>: {selectedDataPeserta!.Nik}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">No Telpon/WA </td>
                <td>: {selectedDataPeserta!.NoTelpon}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">Email </td>
                <td>: {selectedDataPeserta!.Email}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">Password </td>
                <td>: {selectedDataPeserta!.Password}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">Tempat dan Tanggal Lahir </td>
                <td>
                  : {selectedDataPeserta!.TempatLahir},{" "}
                  {formatIndonesianDateFromString(
                    selectedDataPeserta!.TanggalLahir
                  )}
                </td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">Alamat </td>
                <td>: {selectedDataPeserta!.Alamat}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">Jenis Kelamin </td>
                <td>: {selectedDataPeserta!.JenisKelamin}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">Kewarganegaraan </td>
                <td>: {selectedDataPeserta!.Kewarganegaraan}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">Agama </td>
                <td>: {selectedDataPeserta!.Agama}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">Kewarganegaraan </td>
                <td>: {selectedDataPeserta!.Kewarganegaraan}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">Golongan Darah </td>
                <td>: {selectedDataPeserta!.GolonganDarah}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">Status </td>
                <td>: {selectedDataPeserta!.Status}</td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">File KTP </td>
                <td>
                  :{" "}
                  <Link href={selectedDataPeserta!.Ktp} target="_blank">
                    {selectedDataPeserta!.Ktp}
                  </Link>
                </td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">File KK </td>
                <td>
                  :{" "}
                  <Link href={selectedDataPeserta!.KK} target="_blank">
                    {selectedDataPeserta!.KK}
                  </Link>
                </td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">File Ijazah </td>
                <td>
                  :{" "}
                  <Link href={selectedDataPeserta!.Ijazah} target="_blank">
                    {selectedDataPeserta!.Ijazah}
                  </Link>
                </td>
              </tr>
              <tr className="text-sm text-gray-700 w-full">
                <td className="w-44">File Pendukung </td>
                <td>
                  :{" "}
                  <Link
                    href={selectedDataPeserta!.SuratKesehatan}
                    target="_blank"
                  >
                    {selectedDataPeserta!.SuratKesehatan}
                  </Link>
                </td>
              </tr>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="flex w-full items-center mb-2 gap-1">
            <Select>
              <SelectTrigger className="w-[200px] bg-none p-0">
                <div className="inline-flex gap-2 px-3 mr-2 text-sm items-center rounded-md p-1.5 cursor-pointer">
                  <MdOutlinePayment />
                  Status Pembayaran
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status Pembayaran</SelectLabel>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="not_paid">Not Paid</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[130px] bg-none p-0">
                <div className="inline-flex gap-2 px-3 text-sm items-center rounded-md p-1.5 cursor-pointer">
                  <TbSchool />
                  Kelulusan
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Kelulusan</SelectLabel>
                  <SelectItem value="lulus">Lulus</SelectItem>
                  <SelectItem value="tidak_lulus">Tidak Lulus</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px] bg-none p-0">
                <div className="inline-flex gap-2 px-3 text-sm items-center rounded-md p-1.5 cursor-pointer">
                  <HiOutlineDocument />
                  Sertifikat
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sertifikat</SelectLabel>
                  <SelectItem value="diterbitkan">Sudah Diterbitkan</SelectItem>
                  <SelectItem value="belum_diterbitkan">
                    Belum Diterbitkan
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <TableData
            isLoading={false}
            columns={columns}
            table={table}
            type="short"
          />
        </>
      )}
    </div>
  );
};

export default TablelDataPesertaPelatihanManningAgent;
