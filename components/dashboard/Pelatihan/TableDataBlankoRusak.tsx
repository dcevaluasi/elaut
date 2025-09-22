import React, { useState } from "react";
import TableData from "@/commons/TableData";

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
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HiUserGroup } from "react-icons/hi2";
import { TbChartBubble } from "react-icons/tb";

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
} from "@/components/ui/alert-dialog";
import Toast from "@/commons/Toast";
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
import Cookies from "js-cookie";
import Link from "next/link";
import { BlankoKeluar, BlankoRusak } from "@/types/blanko";
import { generateTanggalPelatihan } from "@/utils/text";
import useFetchBlankoRusak from "@/hooks/blanko/useFetchBlankoRusak";

const TableDataBlankoRusak: React.FC = () => {
  const [keywordSuggestion, setKeywordSuggestion] = React.useState<string>("");
  const [suggestionsBlankoKeluar, setSuggestionsBlankoKeluar] = React.useState<
    BlankoKeluar[]
  >([]);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<
    BlankoKeluar[]
  >([]);
  React.useEffect(() => {
    if (keywordSuggestion.trim() === "") {
      setFilteredSuggestions([]);
    } else {
      const filtered = suggestionsBlankoKeluar.filter((item: BlankoKeluar) =>
        item.NamaPelaksana.toLowerCase().includes(
          keywordSuggestion.toLowerCase()
        )
      );
      setFilteredSuggestions(filtered);
    }
  }, [keywordSuggestion, suggestionsBlankoKeluar]);

  const { data, isFetching, refetch } = useFetchBlankoRusak();

  const handleFetchingBlankoKeluar = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL}/adminpusat/getBlankoKeluar`
      );
      setSuggestionsBlankoKeluar(response.data.data);
      console.log({ response });
    } catch (error) {
      throw error;
    }
  };

  const [isOpenFormMateri, setIsOpenFormMateri] =
    React.useState<boolean>(false);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns: ColumnDef<BlankoRusak>[] = [
    {
      accessorKey: "IdBlankoRusak",
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
      accessorKey: "Tipe",
      meta: {
        filterVariant: "select",
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tipe Blanko
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-dark leading-[100%]">
            {" "}
            {row.original.Tipe}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "NoSeri",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No Serial Blanko
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-dark leading-[100%]">
            {" "}
            {row.original.NoSeri}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "Keterangan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[300px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Keterangan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-dark leading-[100%]">
            {" "}
            {row.original.Keterangan}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "TanggalRusak",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal Rusak
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-dark leading-[100%]">
            {" "}
            {row.original.TanggalRusak}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "FotoDokumen",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Foto Blanko
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col lowercase`}
        >
          <Link
            href={row.original.FotoDokumen}
            target="_blank"
            className="text-sm text-blue-500 underline leading-[100%]"
          >
            {" "}
            {row.original.FotoDokumen}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "CreatedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[250px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Diupload pada
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-dark leading-[100%]">
            {" "}
            {generateTanggalPelatihan(row.original.CreatedAt)}
          </p>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    filterFns: {},
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  React.useEffect(() => {
    handleFetchingBlankoKeluar();
  }, []);

  const [selectedTipeBlanko, setSelectedTipeBlanko] =
    React.useState<string>("");

  const [idBlankoKeluar, setIdBlankoKeluar] = React.useState<number>(0);
  const [tanggalBlankoRusak, setTanggalBlankoRusak] =
    React.useState<string>("");
  const [noSerialBlanko, setNoSerialBlanko] = React.useState<string>("");
  const [tipeBlanko, setTipeBlanko] = React.useState<string>("");
  const [keterangan, setKeterangan] = React.useState<string>("");
  const [fotoBlankoRusak, setFotoBlankoRusak] = React.useState<File | null>(
    null
  );

  const handleClearFormBlankoRusak = () => {
    setIdBlankoKeluar(0);
    setTanggalBlankoRusak("");
    setNoSerialBlanko("");
    setTipeBlanko("");
    setKeterangan("");
    setFotoBlankoRusak(null);
  };

  const handleFotoBlankoRusakChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setFotoBlankoRusak(file);

        // Generate a preview URL
        const reader = new FileReader();

        reader.readAsDataURL(file);

        console.log("Selected file:", file);
      } else {
        alert("Please select a valid image file.");
      }
    }
  };

  const handlePostBlankoRusak = async (e: any) => {
    e.preventDefault();

    const data = new FormData();
    data.append("IdBlankoKeluar", idBlankoKeluar.toString());
    data.append("NoSeri", noSerialBlanko);
    data.append("Tipe", tipeBlanko);
    data.append("Keterangan", keterangan);
    data.append("TanggalRusak", tanggalBlankoRusak);

    if (fotoBlankoRusak != null) data.append("foto_blanko", fotoBlankoRusak);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL}/adminPusat/addBlankoRusak`,
        data,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      handleFetchingBlankoKeluar();
      handleClearFormBlankoRusak();
      refetch();
      console.log("RESPONSE POST BLANKO RUSAK : ", response);
      Toast.fire({
        icon: "success",
        title: `Berhasil mengupload riwayat blanko rusak di Pusat Pelatihan KP!`,
      });
      setIsOpenFormMateri(!isOpenFormMateri);
    } catch (error) {
      console.error("ERROR POST BLANKO : ", error);
      Toast.fire({
        icon: "error",
        title: `Gagal mengupload riwayat blanko rusak di Pusat Pelatihan KP!`,
      });
      handleFetchingBlankoKeluar();
      handleClearFormBlankoRusak();
      setIsOpenFormMateri(!isOpenFormMateri);
    }
  };

  React.useEffect(() => {
    if (selectedTipeBlanko) {
      setColumnFilters([
        {
          id: "Tipe",
          value: selectedTipeBlanko,
        },
      ]);
    } else {
      setColumnFilters([]); // Clear filters when no selection
    }
  }, [selectedTipeBlanko]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8">
      <AlertDialog open={isOpenFormMateri}>
        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-left">
              {" "}
              <FaBookOpen className="h-4 w-4 hidden md:block" />
              Tambah Informasi Blanko Rusak
            </AlertDialogTitle>
            <AlertDialogDescription className="-mt-2 text-left">
              Untuk ketelusuran penggunaan blanko, dapat diinventaris terkait
              blanko rusak/tidak berlaku!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <fieldset>
            <form autoComplete="off">
              <div className="flex flex-wrap -mx-3 !text-sm">
                <div className="grid grid-cols-1 px-3 gap-2 mb-2 w-full">
                  <div className="w-full relative">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      Penerbitan Sertifikat{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="name"
                      className="form-input w-full text-black border-gray-300 rounded-md leading-[120%] text-sm h-fit"
                      placeholder="Cari berdasarakan nama pelaksana"
                      required
                      value={keywordSuggestion}
                      onChange={(e) => setKeywordSuggestion(e.target.value)}
                    ></textarea>
                    {/* Render suggestions dropdown */}
                    {filteredSuggestions.length > 0 && (
                      <ul className="absolute bg-white border border-gray-300 rounded-md w-full max-h-40 overflow-y-auto mt-1 z-10">
                        {filteredSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="p-2 cursor-pointer hover:bg-gray-200"
                            onClick={() => {
                              setKeywordSuggestion(
                                `${suggestion.NamaPelaksana} - ${suggestion.NamaProgram} - ${suggestion.TanggalPelaksanaan} - ${suggestion.NamaLemdiklat}`
                              );
                              setFilteredSuggestions([]);
                              setIdBlankoKeluar(suggestion.IdBlankoKeluar);
                            }}
                          >
                            {suggestion.NamaPelaksana} -{" "}
                            {suggestion.NamaProgram} -{" "}
                            {suggestion.TanggalPelaksanaan} -{" "}
                            {suggestion.NamaLemdiklat}
                          </li>
                        ))}
                      </ul>
                    )}
                    {isFetching && (
                      <p className="text-sm text-gray-500 mt-1">
                        Fetching suggestions...
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full px-3 mb-2">
                  <label
                    className="block text-gray-800 text-sm font-medium mb-1"
                    htmlFor="name"
                  >
                    Tanggal Kerusakan <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    type="date"
                    className="form-input w-full text-black border-gray-300 rounded-md"
                    placeholder="Tanggal Pelaksanaan"
                    required
                    value={tanggalBlankoRusak}
                    onChange={(e) => setTanggalBlankoRusak(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 px-3 gap-2 mb-2 w-full">
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      Tipe Blanko <span className="text-red-600">*</span>
                    </label>
                    <Select onValueChange={setTipeBlanko}>
                      <SelectTrigger className="w-full border-gray-300 rounded-md h-fit py-[0.65rem]">
                        <SelectValue placeholder="Tipe Blanko" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999999]">
                        <SelectItem value="Certificate of Competence (CoC)">
                          Certificate of Competence (CoC)
                        </SelectItem>
                        <SelectItem value="Certificate of Proficiency (CoP)">
                          Certificate of Proficiency (CoP)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="noSerialBlanko"
                    >
                      No Serial Blanko <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="noSerialBlanko"
                      type="text"
                      className="form-input w-full text-black border-gray-300 rounded-md"
                      placeholder="No Serial Blanko"
                      required
                      value={noSerialBlanko}
                      onChange={(e) => setNoSerialBlanko(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 px-3 gap-2  w-full">
                  <div className="w-full relative">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="keterangan"
                    >
                      Keterangan <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="keterangan"
                      className="form-input w-full text-black border-gray-300 rounded-md"
                      placeholder="Keterangan"
                      required
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 px-3 gap-2 mb-2 w-full">
                  <div className="w-full relative">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="fotoBlankoRusak"
                    >
                      Foto Blanko Rusak <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="file"
                      className="w-full border border-gray-300 rounded-md"
                      accept="image/*"
                      onChange={handleFotoBlankoRusakChange}
                    />
                  </div>
                </div>
              </div>

              <AlertDialogFooter className="mt-3">
                <AlertDialogCancel
                  onClick={(e) => setIsOpenFormMateri(!isOpenFormMateri)}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={(e) => handlePostBlankoRusak(e)}>
                  Upload
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </fieldset>
        </AlertDialogContent>
      </AlertDialog>

      <>
        <div className="flex flex-wrap items-center mb-3 justify-between gap-3 sm:flex-nowrap">
          <div className="flex w-full flex-wrap gap-3 sm:gap-5">
            <div className="flex min-w-47.5">
              <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
              </span>
              <div className="w-full">
                <p className="font-semibold text-primary">Total Blanko</p>
                <p className="text-sm font-medium">{data.length} blanko</p>
              </div>
            </div>
            <div className="flex min-w-47.5">
              <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
              </span>
              <div className="w-full">
                <p className="font-semibold text-secondary">Total Blanko CoP</p>
                <p className="text-sm font-medium">
                  {
                    data.filter(
                      (item: BlankoRusak) =>
                        item.Tipe === "Certificate of Proficiency (CoP)"
                    ).length
                  }{" "}
                  blanko
                </p>
              </div>
            </div>
            <div className="flex min-w-47.5">
              <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-green-400"></span>
              </span>
              <div className="w-full">
                <p className="font-semibold text-green-400">Total Blanko CoC</p>
                <p className="text-sm font-medium">
                  {
                    data.filter(
                      (item: BlankoRusak) =>
                        item.Tipe === "Certificate of Competence (CoC)"
                    ).length
                  }{" "}
                  blanko
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div id="chartOne" className="-ml-5"></div>
          <div className="flex w-full items-center mb-2">
            <div className="flex w-full gap-1 items-start">
              <Select
                value={selectedTipeBlanko}
                onValueChange={(value) => setSelectedTipeBlanko(value)}
              >
                <SelectTrigger className="w-fit border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                  <div className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer">
                    <TbChartBubble />{" "}
                    {selectedTipeBlanko == " "
                      ? "All"
                      : selectedTipeBlanko != ""
                        ? selectedTipeBlanko
                        : "Tipe Blanko"}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tipe Blanko</SelectLabel>
                    <SelectItem value=" ">All</SelectItem>
                    <SelectItem value="Certificate of Competence (CoC)">
                      Certificate of Competence (CoC)
                    </SelectItem>
                    <SelectItem value="Certificate of Proficiency (CoP)">
                      Certificate of Proficiency (CoP)
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full flex justify-end gap-2">
              <Input
                placeholder="Cari berdasarkan nomor serial blanko..."
                value={
                  (table.getColumn("NoSeri")?.getFilterValue() as string) ?? ""
                }
                onChange={(event: any) =>
                  table.getColumn("NoSeri")?.setFilterValue(event.target.value)
                }
                className="max-w-sm text-sm justify-end"
              />
              <div
                onClick={(e) => setIsOpenFormMateri(!isOpenFormMateri)}
                className="flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer w-fit"
              >
                <FiUploadCloud />
                Tambah Data Blanko
              </div>
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
    </div>
  );
};

export default TableDataBlankoRusak;
