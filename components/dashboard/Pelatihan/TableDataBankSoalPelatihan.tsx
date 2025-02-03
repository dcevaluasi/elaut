import React, { useState } from "react";
import TableData from "../Tables/TableData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
import { ArrowUpDown, Edit3Icon, LucideListChecks, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TbCircleNumber1,
  TbCircleNumber2,
  TbCircleNumber3,
  TbCircleNumber4,
  TbDatabase,
} from "react-icons/tb";
import { FiUploadCloud } from "react-icons/fi";

import { usePathname, useRouter } from "next/navigation";

import { DetailPelatihanMasyarakat, PelatihanMasyarakat, SoalPelatihan, UserPelatihan } from "@/types/product";
import axios, { AxiosResponse } from "axios";
import { extractLastSegment } from "@/utils";

import { RiFilePaper2Line, RiVerifiedBadgeFill } from "react-icons/ri";
import Link from "next/link";
import { FaRegPaperPlane, FaRupiahSign } from "react-icons/fa6";
import Toast from "@/components/toast";
import Cookies from "js-cookie";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { elautBaseUrl } from "@/constants/urls";
import { Badge } from "@/components/ui/badge";

const TableDataBankSoalPelatihan = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const pathname = usePathname();
  const id = extractLastSegment(pathname);

  const [dataPelatihan, setDataPelatihan] = React.useState<DetailPelatihanMasyarakat | null>(null)

  const handleFetchingPublicTrainingData = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/getPelatihanUser?idPelatihan=${id}`
      );
      console.log({ response });
      setDataPelatihan(response.data);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };


  const [data, setData] = React.useState<SoalPelatihan[] | []>([]);
  const handleFetchingPublicTrainingDataById = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/GetSoalPelatihanById?idPelatihan=${id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      setData(response.data.data);
      console.log({ response })
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  const handlingAddSoalUsers = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("IsSematkan", 'yes');
    try {
      const response = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      console.log("UPDATE PELATIHAN: ", response);
      try {
        const response = await axios.post(
          `${elautBaseUrl}/lemdik/AddSoalUsers`,
          {
            id_pelatihan: id,
          },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            },
          }
        );
        Toast.fire({
          icon: "success",
          title: `Berhasil menyematkan soal ke peserta pelatihan!`,
        });
        console.log("SOAL PELATIHAN: ", response);
      } catch (error) {
        console.error("ERROR SOAL PELATIHAN: ", error);
        Toast.fire({
          icon: "success",
          title: `Ups, belum ada bank soal yang kamu upload sobat lemdik!`,
        });
      }
    } catch (error) {
      console.error("ERROR UPDATE PELATIHAN: ", error);
    }

  };

  const [isOpenFormPeserta, setIsOpenFormPeserta] =
    React.useState<boolean>(false);
  const [fileExcelBankSoalPelatihan, setFileExcelBankPelatihan] =
    React.useState<File | null>(null);
  const handleFileChange = (e: any) => {
    setFileExcelBankPelatihan(e.target.files[0]);
  };
  const handleUploadImportBankSoalPelatihan = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("IdPelatihan", id);
    if (fileExcelBankSoalPelatihan != null) {
      formData.append("file", fileExcelBankSoalPelatihan);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/lemdik/ImportSoalPelatihan`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      console.log("FILE UPLOADED BANK SOAL : ", response);
      Toast.fire({
        icon: "success",
        title: `Selamat anda berhasil mengupload bank soal pelatihan!`,
      });
      setIsOpenFormPeserta(!isOpenFormPeserta);
      handleFetchingPublicTrainingDataById();
    } catch (error) {
      console.log("FILE IMPORT BANK SOAL PELATIHAN : ", error);
      Toast.fire({
        icon: "error",
        title: `Gagal mengupload bank soal pelatihan!`,
      });
      handleFetchingPublicTrainingDataById();
    }
  };

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns: ColumnDef<SoalPelatihan>[] = [
    {
      accessorKey: "IdLemdik",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-gray-900 font-semibold w-fit`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`w-full text-center uppercase`}>{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "IdPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold w-fit p-0 flex justify-start items-centee`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> Soal</p>

            <RiFilePaper2Line className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-base font-semibold tracking-tight leading-none">
            {row.original.Soal}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "JawabanBenar",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold w-fit p-0 flex justify-start items-centee`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> Jawaban Benar</p>

            <RiVerifiedBadgeFill className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-sm text-gray-400 font-normal tracking-tight leading-none">
            {row.original?.JawabanBenar}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "IdSOalUjian",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold w-fit p-0 flex justify-start items-centee`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> Pilihan 1</p>

            <TbCircleNumber1 className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize w-1/3`}>
          <p className="text-sm text-gray-400 font-normal tracking-tight leading-none">
            {row.original?.Jawaban[1]?.NameJawaban}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "Soal",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold w-fit p-0 flex justify-start items-centee`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> Pilihan 2</p>

            <TbCircleNumber2 className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-sm text-gray-400 font-normal tracking-tight leading-none">
            {row.original?.Jawaban[2]?.NameJawaban}
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
            className={`text-black font-semibold w-fit p-0 flex justify-start items-centee`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> Pilihan 3</p>

            <TbCircleNumber3 className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-sm text-gray-400 font-normal tracking-tight leading-none">
            {row.original?.Jawaban[3]?.NameJawaban}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "CreateAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold w-fit p-0 flex justify-start items-centee`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> Pilihan 4</p>

            <TbCircleNumber4 className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-sm text-gray-400 font-normal tracking-tight leading-none">
            {row.original?.Jawaban[4]?.NameJawaban}
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
    handleFetchingPublicTrainingDataById();
    handleFetchingPublicTrainingData()
  }, []);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8">
      <AlertDialog open={isOpenFormPeserta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {" "}
              <TbDatabase className="h-4 w-4" />
              Import Bank Soal Pelatihan
            </AlertDialogTitle>
            <AlertDialogDescription className="-mt-2">
              Import soal yang akan digunakan pada pelaksanaan test pelatihan
              ini!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <fieldset>
            <form autoComplete="off">
              <div className="flex flex-wrap -mx-3 mb-1">
                <div className="w-full px-3">
                  <label
                    className="block text-gray-800 text-sm font-medium mb-1"
                    htmlFor="email"
                  >
                    Data Soal <span>*</span>
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="file"
                      className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                      required
                      onChange={handleFileChange}
                    />
                    <Link
                      target="_blank"
                      href={
                        "https://docs.google.com/spreadsheets/d/1MzQ9l-ICw1rDc3K6VpOciLvgqo9SFLdT/export?format=xlsx"
                      }
                      className="btn text-white bg-green-600 hover:bg-green-700 py-0 w-[250px] px-0 text-sm"
                    >
                      <PiMicrosoftExcelLogoFill />
                      Unduh Template
                    </Link>
                  </div>
                  <p className="text-gray-700 text-xs mt-1">
                    *Download terlebih dahulu template lalu isi file excel dan
                    upload
                  </p>
                </div>
              </div>

              <AlertDialogFooter className="mt-3 pt-3 border-t border-t-gray-300">
                <AlertDialogCancel
                  onClick={(e) => setIsOpenFormPeserta(!isOpenFormPeserta)}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => handleUploadImportBankSoalPelatihan(e)}
                >
                  Upload
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </fieldset>
        </AlertDialogContent>
      </AlertDialog>

      <>
        {/* Header Tabel Data Pelatihan */}
        <div className="flex items-center mb-3 justify-between gap-3 ">
          {/* Statistik Pelatihan */}
          <div className="flex w-full items-center justify-between gap-3 sm:gap-5">
            <div className="flex min-w-47.5">
              <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
              </span>
              <div className="w-full">
                <p className="font-semibold text-primary">Total Soal</p>
                <p className="text-sm font-medium">{data?.length} soal</p>
              </div>
            </div>
            <div className="flex gap-2 absolute top-24 right-5">
              {
                data.length == 0 && <Badge
                  variant="outline"
                  className={`  cursor-pointer bg-rose-600 text-white hover:bg-rose-600`}
                >
                  Bank Soal Belum Diupload
                </Badge>
              }
              {
                dataPelatihan != null && <Badge
                  variant="outline"
                  className={`  cursor-pointer ${dataPelatihan!.IsSematkan != "yes"
                    ? " bg-yellow-300 text-neutral-800 hover:bg-yellow-400"
                    : " bg-green-500 text-white hover:bg-green-600"
                    }`}
                >
                  {
                    dataPelatihan!.IsSematkan != "yes" ? 'Soal Belum Disematkan ke Peserta' : 'Soal Sudah Disematkan'
                  }
                </Badge>
              }
            </div>


          </div>
        </div>

        <div className="flex w-full items-center mb-2 -mt-3">
          <div className="w-full flex justify-end gap-2">
            {
              (data?.length > 0 && dataPelatihan!.IsSematkan != 'yes') && <div
                onClick={(e) => handlingAddSoalUsers(e)}
                className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer"
              >
                <FaRegPaperPlane />
                Sematkan Soal
              </div>
            }


            {data.length == 0 && (
              <div
                onClick={(e) => setIsOpenFormPeserta(!isOpenFormPeserta)}
                className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer"
              >
                <FiUploadCloud />
                Import Bank Soal
              </div>
            )}
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

export default TableDataBankSoalPelatihan;
