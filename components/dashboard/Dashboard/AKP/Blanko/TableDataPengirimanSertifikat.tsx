import React, { useState } from "react";

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
import axios from "axios";

import Cookies from "js-cookie";
import { BlankoKeluar, PengirimanSertifikat } from "@/types/blanko";
import { generateTanggalPelatihan } from "@/utils/text";
import TableData from "@/components/dashboard/tables/TableData";
import { GrSend } from "react-icons/gr";
import { blankoAkapiBaseUrl } from "@/constants/urls";
import { formatToRupiah } from "@/lib/utils";
import Image from "next/image";
import useFetchPengirimanSertifikat from "@/hooks/blanko/useFetchPengirimanSertifikat";
import useFetchBlankoKeluar from "@/hooks/blanko/useFetchBlankoKeluar";

export const TableDataPengirimanSertifikat: React.FC = () => {
  const { data, isFetching, refetch } = useFetchPengirimanSertifikat();
  const {
    data: dataBlankoKeluar,
    isFetching: isFetchingBlankoKeluar,
    refetch: refetchBlankoKeluar,
  } = useFetchBlankoKeluar();

  const [isPosting, setIsPosting] = React.useState<boolean>(false);

  const [namaPenerima, setNamaPenerima] = React.useState<string>("");
  const [nomorTelpon, setNomorTelpon] = React.useState<string>("");
  const [alamat, setAlamat] = React.useState<string>("");
  const [noResi, setNoResi] = React.useState<string>("");
  const [nominalPengiriman, setNominalPengiriman] = React.useState<string>("");
  const [buktiResi, setBuktiResi] = React.useState<File | null>(null);
  const [buktiPengiriman, setBuktiPengiriman] = React.useState<File | null>(
    null
  );

  const handleBuktiResiFileChange = (e: any) => {
    setBuktiResi(e.target.files[0]);
  };

  const handleBuktiPengirimanFileChange = (e: any) => {
    setBuktiPengiriman(e.target.files[0]);
  };

  const [keywordSuggestion, setKeywordSuggestion] = React.useState<string>("");

  const [filteredSuggestions, setFilteredSuggestions] = React.useState<
    BlankoKeluar[]
  >([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelectSuggestion = (suggestion: any) => {
    const selectedText = `${suggestion.IdBlankoKeluar}) ${suggestion.NamaPelaksana}; ${suggestion.NamaProgram}; ${suggestion.TanggalPelaksanaan}; ${suggestion.NoSeriBlanko}`;

    // Avoid duplicate selections
    if (!selectedItems.includes(selectedText)) {
      setSelectedItems([...selectedItems, selectedText]);
    }

    // Clear the input and suggestions
    setKeywordSuggestion("");
    setFilteredSuggestions([]);
  };

  const handleRemoveItem = (item: string) => {
    setSelectedItems(selectedItems.filter((selected) => selected !== item));
  };

  React.useEffect(() => {
    if (keywordSuggestion.trim() === "") {
      setFilteredSuggestions([]);
    } else {
      const filtered = dataBlankoKeluar.filter((item: BlankoKeluar) =>
        item.NamaPelaksana.toLowerCase().includes(
          keywordSuggestion.toLowerCase()
        )
      );
      setFilteredSuggestions(filtered);
    }
  }, [keywordSuggestion, dataBlankoKeluar]);

  const handleClearPengirimanSertifikat = () => {
    setNamaPenerima("");
    setNomorTelpon("");
    setAlamat("");
    setNoResi("");
    setNominalPengiriman("");
    setSelectedItems([]);
    setBuktiPengiriman(null);
    setBuktiPengiriman(null);
  };

  const handlePostPengirimanSertifikat = async (e: any) => {
    setIsPosting(true);

    const formData = new FormData();

    formData.append("NamaPenerima", namaPenerima);
    formData.append("NomorTelpon", nomorTelpon);
    formData.append("Alamat", alamat);
    formData.append("NoResi", noResi);
    formData.append("NominalPengiriman", nominalPengiriman);
    formData.append("ListSertifikatDikirimkan", selectedItems.join(" // "));

    if (buktiResi != null) {
      formData.append("bukti_resi", buktiResi!);
      formData.append("ttd_terima", buktiResi!);
    }

    if (buktiPengiriman != null) {
      formData.append("bukti_pengiriman", buktiResi!);
    }

    try {
      const response = await axios.post(
        `${blankoAkapiBaseUrl}/adminPusat/createPengiriman`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Toast.fire({
        icon: "success",
        title: "Berhasil",
        text: `Berhasil menambahkan data pengiriman sertifikat`,
      });
      setIsOpenFormMateri(false);
      handleClearPengirimanSertifikat();
      refetch();
      setIsPosting(false);
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: "Gagal",
        text: `Gagal menambahkan data pengiriman sertifikat!`,
      });
      setIsPosting(true);
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
  const columns: ColumnDef<PengirimanSertifikat>[] = [
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
      accessorKey: "NoResi",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No Resi
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
            {row.original.NoResi}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "NamaPenerima",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Penerima
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
            {row.original.NamaPenerima}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "NomorTelpon",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[300px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nomor Telpon
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
            {row.original.NomorTelpon}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "Alamat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Alamat
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
            {row.original.Alamat}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "ListSertifikatDikirimkan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sertifikat Yang Dikirimkan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1">
            {row.original.ListSertifikatDikirimkan}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "NominalPengiriman",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Harga Pengiriman (Rp)
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
            {formatToRupiah(parseInt(row.original.NominalPengiriman))}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "BuktiResi",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bukti Resi
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <Image
            src={row.original.BuktiResi}
            className="w-20 object-cover"
            width={0}
            height={0}
            alt={row.original.NoResi}
          />
        </div>
      ),
    },
    {
      accessorKey: "BuktiPengirimanSertifikat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bukti Pengiriman
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <Image
            src={row.original.BuktiPengirimanSertifikat}
            className="w-20 object-cover"
            width={0}
            height={0}
            alt={row.original.NoResi}
          />
        </div>
      ),
    },
    {
      accessorKey: "CreateAt",
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
            {generateTanggalPelatihan(row.original.CreateAt)}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "UpdateAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[250px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Diupdate pada
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
            {generateTanggalPelatihan(row.original.UpdateAt)}
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
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8">
      <AlertDialog open={isOpenFormMateri}>
        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <div className="flex flex-col">
              <AlertDialogTitle className="flex items-center gap-2 text-left">
                <GrSend className="h-4 w-4 hidden md:block" />
                Tambahkan Informasi Pengiriman Sertifikat
              </AlertDialogTitle>
              <AlertDialogDescription className=" text-left">
                Untuk ketelusuran penggunaan blanko, dapat diinventaris terkait
                blanko rusak/tidak berlaku!
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          {isPosting ? (
            <div className="w-full flex flex-col items-center justify-center">
              <Image
                src={"/illustrations/development.png"}
                alt="Illustration Loading"
                width={0}
                height={0}
                className="w-100"
              />
              <AlertDialogFooter className="mt-3 w-full">
                <AlertDialogAction className="w-full" disabled>
                  Uploading....
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          ) : (
            <fieldset>
              <form autoComplete="off" className="flex flex-col gap-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="namaPenerima"
                    >
                      Nama Penerima <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="namaPenerima"
                      type="text"
                      className="form-input w-full text-black text-sm border-gray-300 rounded-md"
                      placeholder="Masukkan nama lengkap penerima"
                      required
                      value={namaPenerima}
                      onChange={(e) => setNamaPenerima(e.target.value)}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="noTelpon"
                    >
                      Nomor Telpon <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="noTelpon"
                      type="text"
                      className="form-input w-full text-black text-sm border-gray-300 rounded-md"
                      placeholder="Masukkan nomor telpon"
                      required
                      value={nomorTelpon}
                      onChange={(e) => setNomorTelpon(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 w-full">
                  <div className="w-full relative">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="alamat"
                    >
                      Alamat <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="alamat"
                      className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                      placeholder="Masukkan alamat lengkap penerima sertifikat"
                      required
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="noResi"
                    >
                      No Resi Pengiriman <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="noResi"
                      type="text"
                      className="form-input w-full text-black text-sm border-gray-300 rounded-md"
                      placeholder="Masukkan nomor resi pengiriman"
                      required
                      value={noResi}
                      onChange={(e) => setNoResi(e.target.value)}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="nominalPengiriman"
                    >
                      Harga Pengiriman (Rp)
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="nominalPengiriman"
                      type="text"
                      className="form-input w-full text-black text-sm border-gray-300 rounded-md"
                      placeholder="Masukkan harga pengiriman"
                      required
                      value={nominalPengiriman}
                      onChange={(e) => setNominalPengiriman(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap -mx-3 !text-sm">
                  <div className="grid grid-cols-1 px-3 gap-2 mb-2 w-full">
                    <div className="w-full relative">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="name"
                      >
                        List Sertifikat <span className="text-red-600">*</span>
                      </label>

                      {/* Selected Items */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedItems.map((item, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1"
                          >
                            {item}
                            <button
                              type="button"
                              className="text-red-500"
                              onClick={() => handleRemoveItem(item)}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Input for Suggestions */}
                      <input
                        id="name"
                        className="form-input w-full text-black border-gray-300 rounded-md leading-[120%] text-sm h-fit"
                        placeholder="Cari berdasarkan nama pelaksana"
                        required
                        value={keywordSuggestion}
                        onChange={(e) => {
                          setKeywordSuggestion(e.target.value);

                          // Fetch suggestions logic here...
                          // Example:
                          // setIsFetching(true);
                          // Simulate async fetch
                          // setTimeout(() => {
                          //   setIsFetching(false);
                          // }, 500);
                        }}
                      />

                      {/* Render suggestions dropdown */}
                      {filteredSuggestions.length > 0 && (
                        <ul className="absolute bg-white border border-gray-300 rounded-md w-full max-h-40 overflow-y-auto mt-1 z-10">
                          {filteredSuggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              className="p-2 cursor-pointer hover:bg-gray-200"
                              onClick={() => handleSelectSuggestion(suggestion)}
                            >
                              {suggestion.IdBlankoKeluar}
                              {") "}
                              {suggestion.NamaPelaksana};{" "}
                              {suggestion.NamaProgram};{" "}
                              {suggestion.TanggalPelaksanaan};
                              {suggestion.NoSeriBlanko}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Loading indicator */}
                      {isFetching && (
                        <p className="text-sm text-gray-500 mt-1">
                          Fetching suggestions...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex mb-1 gap-3">
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      Bukti Resi <span>*</span>
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="file"
                        className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                        required
                        onChange={handleBuktiResiFileChange}
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      Bukti Pengiriman <span>*</span>
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="file"
                        className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                        required
                        onChange={handleBuktiPengirimanFileChange}
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
                  <AlertDialogAction
                    onClick={(e) => handlePostPengirimanSertifikat(e)}
                  >
                    Upload
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </fieldset>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <>
        <div>
          <div id="chartOne" className="-ml-5"></div>
          <div className="flex w-full items-center mb-2">
            <div className="w-full flex justify-end gap-2">
              <div
                onClick={(e) => setIsOpenFormMateri(!isOpenFormMateri)}
                className="flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer w-fit"
              >
                <FiUploadCloud />
                Tambah Data Pengiriman Sertifikat
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
