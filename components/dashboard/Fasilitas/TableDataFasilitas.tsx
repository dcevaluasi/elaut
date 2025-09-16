import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import TableData from "../Tables/TableData";
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
import { ArrowUpDown, Edit3Icon, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

import { usePathname, useRouter } from "next/navigation";
import { MdBed, MdOutlineSaveAlt } from "react-icons/md";
import Toast from "@/components/toast";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { TbClockPlus, TbClockUp, TbDatabaseEdit } from "react-icons/tb";
import { FaRupiahSign } from "react-icons/fa6";
import Image from "next/image";

const TableDataFasilitas: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("XSRF091");
  const [showFormAjukanPelatihan, setShowFormAjukanPelatihan] =
    React.useState<boolean>(false);

  type Sarpras = {
    IdSarpras: number;
    IdLemdik: number;
    NamaSarpras: string;
    Harga: number;
    Deskripsi: string;
    Jenis: string;
    CreatedAt: string;
    FotoSarpras: string;
    UpdatedAt: string;
  };

  const [namaSarpras, setNamaSarpras] = React.useState("");
  const [harga, setHarga] = React.useState("");
  const [deskripsi, setDeskripsi] = React.useState("");
  const [jenis, setJenis] = React.useState("");
  const [fotoFasilitas, setFotoFasilitas] = React.useState(null);

  const handleFileChange = (e: any) => {
    setFotoFasilitas(e.target.files[0]);
  };

  const resetAllStateToEmptyString = () => {
    setNamaSarpras("");
    setHarga("");
    setDeskripsi("");
    setJenis("");
    setFotoFasilitas(null);
  };

  const handlePostingSarprasData = async (e: any) => {
    e.preventDefault();

    const data = new FormData();

    data.append("NamaSarpras", namaSarpras);
    data.append("Harga", harga);
    data.append("Jenis", "Penginapan");
    if (fotoFasilitas !== null) {
      data.append("FotoSarpras", fotoFasilitas);
    }
    data.append("Deskripsi", deskripsi);

    try {
      const response: AxiosResponse = await axios.post(
        `${baseUrl}/lemdik/createSarpras`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(
        "Berhasil mengupload data fasilitas penginapan:",
        response.data
      );
      Toast.fire({
        icon: "success",
        title: `Berhasil menambahkan data fasilitas penginapan baru!`,
      });
      setShowFormAjukanPelatihan(false);
      handleFetchingSarprasData();
      resetAllStateToEmptyString();
    } catch (error) {
      console.error("Error posting training data:", error);
      Toast.fire({
        icon: "error",
        title: `Gagal menambahkan data fasilitas penginapan baru!`,
      });
      throw error;
    }
  };

  type Fasilitas = {
    No: number;
    KodeFasilitas: string;
    NamaFasilitas: string;
    Harga: number;
    Kapasitas: number;
    Deskripsi: string;
  };

  const [data, setData] = React.useState<Sarpras[]>([]);
  const pathname = usePathname();

  const handleFetchingSarprasData = async () => {
    try {
      var response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getSarpras?jenis_sarpras=Penginapan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log({ response });
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data sarpras:", error);
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
  const columns: ColumnDef<Sarpras>[] = [
    {
      accessorKey: "No",
      header: ({ column }) => {
        return (
          <Button variant="ghost" className={`text-gray-900 font-semibold`}>
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
      accessorKey: "KodeFasilitas",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`${"flex"} w-full text-gray-900 font-semibold`}
          >
            Action
            <TbDatabaseEdit className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex flex-col gap-2 items-center justify-center">
          <div className=" w-72 relative">
            <div className="w-full h-40 relative">
              <Image
                alt={row.original.NamaSarpras}
                src={row.original.FotoSarpras}
                width={0}
                height={0}
                className="w-full h-40 object-cover rounded-xl"
              />

              <div className="w-full h-40 absolute bg-blue-500 bg-opacity-10 top-0 rounded-xl"></div>
            </div>
            <div
              className={`flex items-center justify-center w-fit gap-1 absolute top-2 right-2`}
            >
              <Button
                variant="outline"
                className="ml-auto bg-transparent hover:bg-transparent px-3 py-0 h-7"
              >
                <IoIosInformationCircle className="h-3 w-3" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="ml-auto bg-transparent hover:bg-transparent px-3 py-0 h-7 border border-rose-600"
                  >
                    <Trash className="h-3 w-3 text-rose-600" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                className="ml-auto bg-transparent hover:bg-transparent px-3 py-0 h-7 border border-yellow-500"
              >
                <Edit3Icon className="h-3 w-3 text-yellow-500" />
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "NamaSarpras",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`p-0 !text-left w-[270px] flex items-center justify-start text-gray-900 font-semibold`}
          >
            Detail Fasilitas
            <MdBed className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-xs text-gray-400 mt-2 leading-[100%] mb-1">
            {" "}
            Jenis Fasiltas • {row.original.Jenis} • Rp. {row.original.Harga}
          </p>
          <p className="text-base font-semibold tracking-tight leading-none">
            {row.getValue("NamaSarpras")}
          </p>
          <div className={`${"ml-0"} text-left capitalize mt-1`}>
            <p className="text-xs  font-medium capitalize ">
              {row.original.Deskripsi}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "CreateAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center text-gray-900 font-semibold"
          >
            Ditambahkan pada
            <TbClockPlus className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-center capitalize">{row.getValue("CreateAt")}</div>
      ),
    },
    {
      accessorKey: "UpdateAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center text-gray-900 font-semibold"
          >
            Diupdate pada
            <TbClockUp className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-center capitalize">{row.getValue("UpdateAt")}</div>
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
    handleFetchingSarprasData();
  }, []);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8">
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
                <p className="font-semibold text-primary">Total Fasilitas</p>
                <p className="text-sm font-medium">{data.length} fasilitas</p>
              </div>
            </div>
          </div>

          {/* Button Ajukan Permohonan Buka Pelatihan */}
          <div className="flex w-full gap-2 justify-end">
            <AlertDialog open={showFormAjukanPelatihan}>
              <AlertDialogTrigger asChild>
                <div
                  onClick={(e) => setShowFormAjukanPelatihan(true)}
                  className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5 cursor-pointer"
                >
                  <FiUploadCloud />
                  Tambah Database Fasilitas
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tambah data fasilitas</AlertDialogTitle>
                  <AlertDialogDescription className="-mt-2">
                    Daftarkan data fasilitas di lemdiklat/balai mu sebagai
                    penunjang kegiatan pelatihan dan sertifikasi!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <form autoComplete="off">
                  <div className="flex flex-wrap mb-1 w-full">
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="name"
                      >
                        Nama Fasilitas <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="form-input w-full text-black border-gray-300 rounded-md"
                        placeholder="Masukkan nama fasilitas"
                        required
                        value={namaSarpras}
                        onChange={(e) => setNamaSarpras(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <div className="flex flex-wrap mb-1 w-full">
                      <div className="w-full">
                        <label
                          className="block text-gray-800 text-sm font-medium mb-1"
                          htmlFor="name"
                        >
                          Harga Fasilitas{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <input
                          id="name"
                          type="text"
                          className="form-input w-full text-black border-gray-300 rounded-md"
                          placeholder="Rp"
                          required
                          value={harga}
                          onChange={(e) => setHarga(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-full mb-1 flex">
                    <div className="w-full">
                      {" "}
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="name"
                      >
                        Foto Fasilitas <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="file"
                        className="cursor-pointer w-full border border-neutral-200 rounded-md text-black h-10 text-base flex items-center"
                        required
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap mb-1 w-full">
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium mb-1"
                        htmlFor="name"
                      >
                        Deskripsi Fasilitas{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        id="name"
                        className="form-input w-full text-black border-gray-300 rounded-md"
                        placeholder="Deskripsi fasilitas"
                        rows={4}
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                      />
                    </div>
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={(e) => setShowFormAjukanPelatihan(false)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => handlePostingSarprasData(e)}
                      type="submit"
                    >
                      Upload
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* List Data Pelatihan */}
        <div>
          <div id="chartOne" className="-ml-5"></div>
          <TableData
            isLoading={false}
            columns={columns}
            table={table}
            type={"short"}
          />
        </div>
      </>
    </div>
  );
};

export default TableDataFasilitas;
