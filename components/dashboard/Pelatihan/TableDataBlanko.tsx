import React from "react";
import TableData from "../tables/TableData";

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
import Toast from "@/components/toast";
import axios from "axios";
import { FaBookOpen } from "react-icons/fa6";
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
import { Blanko } from "@/types/blanko";
import useFetchBlanko from "@/hooks/blanko/useFetchBlanko";

const TableDataBlanko: React.FC = () => {
  const { data, isFetching, refetch } = useFetchBlanko();

  const [isOpenFormMateri, setIsOpenFormMateri] =
    React.useState<boolean>(false);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns: ColumnDef<Blanko>[] = [
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
      accessorKey: "TipeBlanko",
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
          <p className="text-xs text-black leading-[100%]">
            {" "}
            {row.original.TipeBlanko}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "NoSertifikat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
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
          <p className="text-xs text-black leading-[100%]">
            {" "}
            {row.original.NoSeri}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "NoSertifikat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal Pengadaan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-xs text-black leading-[100%]">
            {" "}
            {convertDate(row.original.TanggalPengadaan)}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "NoSertifikat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Jumlah Pengadaan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-xs text-black leading-[100%]">
            {" "}
            {row.original.JumlahPengadaan}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "NoSertifikat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Penggunaan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-xs text-black leading-[100%]">
            {" "}
            {row.original.Jumlah}
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

  const [noSeri, setNoSeri] = React.useState<string>("");
  const [tipeBlanko, setTipeBlanko] = React.useState<string>("");
  const [tanggalPengadaan, setTanggalPengadaan] = React.useState<string>("");
  const [jumlahPengadaan, setJumlahPengadaan] = React.useState<string>("");

  const handlePostBlanko = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BLANKO_AKAPI_URL}/adminPusat/addBlanko`,
        {
          jumlah: jumlahPengadaan,
          no_seri: noSeri,
          tipe_blanko: tipeBlanko,
          jumlah_pengadaan: jumlahPengadaan,
          tanggal_pengadaan: tanggalPengadaan,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      refetch();
      console.log("RESPONSE POST BLANKO : ", response);
      Toast.fire({
        icon: "success",
        title: `Berhasil mengupload data blanko di Pusat Pelatihan KP!`,
      });
      setIsOpenFormMateri(!isOpenFormMateri);
    } catch (error) {
      console.error("ERROR POST BLANKO : ", error);
      Toast.fire({
        icon: "error",
        title: `Gagal mengupload data blanko di Pusat Pelatihan KP!`,
      });
      refetch();
      setIsOpenFormMateri(!isOpenFormMateri);
    }
  };

  const [selectedTipeBlanko, setSelectedTipeBlanko] =
    React.useState<string>("");

  React.useEffect(() => {
    if (selectedTipeBlanko) {
      setColumnFilters([
        {
          id: "TipeBlanko",
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
            <div className="flex flex-col gap-1">
              <AlertDialogTitle className="flex items-center gap-2">
                {" "}
                <FaBookOpen className="h-4 w-4" />
                Tambah Persedian Blanko
              </AlertDialogTitle>
              <AlertDialogDescription className="-mt-2">
                Input data pengadaan blanko agar dapat mendapatkan ketelusuran
                dari blanko yang ada di Puslat dan telah digunakan berapa!
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <fieldset>
            <form autoComplete="off">
              <div className="flex flex-wrap -mx-3 mb-1">
                <div className="flex px-3 gap-2 mb-2 w-full">
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      No Seri <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="form-input w-full text-black border-gray-300 rounded-md"
                      placeholder="No Seri"
                      required
                      value={noSeri}
                      onChange={(e) => setNoSeri(e.target.value)}
                    />
                  </div>
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
                </div>

                <div className="flex px-3 gap-2 mb-2 w-full">
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      Tanggal Pengadaan <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="name"
                      type="date"
                      className="form-input w-full text-black border-gray-300 rounded-md"
                      placeholder="Tanggal Pengadaan"
                      required
                      value={tanggalPengadaan}
                      onChange={(e) => setTanggalPengadaan(e.target.value)}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      Jumlah Pengadaan <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="form-input w-full text-black border-gray-300 rounded-md"
                      placeholder="Jumlah Pengadaan"
                      required
                      value={jumlahPengadaan}
                      onChange={(e) => setJumlahPengadaan(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <AlertDialogFooter className="mt-1 flex w-full">
                <div className="flex flex-col gap-2 w-full">
                  <AlertDialogAction
                    className="w-full"
                    onClick={(e) => handlePostBlanko(e)}
                  >
                    Upload
                  </AlertDialogAction>
                  <AlertDialogCancel
                    onClick={(e) => setIsOpenFormMateri(!isOpenFormMateri)}
                  >
                    Cancel
                  </AlertDialogCancel>
                </div>
              </AlertDialogFooter>
            </form>
          </fieldset>
        </AlertDialogContent>
      </AlertDialog>

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
                <p className="font-semibold text-primary">Total Blanko</p>
                <p className="text-sm font-medium">
                  {data.reduce(
                    (total, item) => total + item.JumlahPengadaan,
                    0
                  )}{" "}
                  blanko
                </p>
              </div>
            </div>
            <div className="flex min-w-47.5">
              <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
              </span>
              <div className="w-full">
                <p className="font-semibold text-secondary">Total Blanko CoP</p>
                <p className="text-sm font-medium">
                  {data
                    .filter(
                      (item) =>
                        item.TipeBlanko == "Certificate of Proficiency (CoP)"
                    )
                    .reduce(
                      (total, item) => total + item.JumlahPengadaan,
                      0
                    )}{" "}
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
                  {" "}
                  {data
                    .filter(
                      (item) =>
                        item.TipeBlanko == "Certificate of Competence (CoC)"
                    )
                    .reduce(
                      (total, item) => total + item.JumlahPengadaan,
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
export default TableDataBlanko;
