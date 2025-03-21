import React from "react";
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
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HiUserGroup } from "react-icons/hi2";
import { TbChartBubble } from "react-icons/tb";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import useFetchBlankoByNameByAddress from "@/hooks/blanko/useFetchBlankoByNameByAddress";
import { DataBlankoByNameByAddress } from "@/types/akapi";
import { HashLoader } from "react-spinners";

const TableDataBlankoKeluar: React.FC = () => {
  const [showFormAjukanPelatihan, setShowFormAjukanPelatihan] =
    React.useState<boolean>(false);
  const [showCertificateSetting, setShowCertificateSetting] =
    React.useState<boolean>(false);

  const [typeBlanko, setTypeBlanko] = React.useState<string>('')
  const [isPembaruan, setIsPembaruan] = React.useState<string>(' ')
  const [startDate, setStartDate] = React.useState<string>('2024-06-01')
  const [endDate, setEndDate] = React.useState<string>('2025-12-31')

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>, setDate: React.Dispatch<React.SetStateAction<string>>) => {
    const value = event.target.value;
    const formattedDate = new Date(value).toISOString().split("T")[0]; // Converts to YYYY-MM-DD
    setDate(formattedDate);
  };

  const {
    data: data,
    dataFull: dataFull,
    isFetching: isFetching,
    refetch: refetchBlankoByNameByAddress,
  } = useFetchBlankoByNameByAddress({
    waktu_awal: startDate,
    waktu_berakhir: endDate,
    type_sertifikat: typeBlanko,
    is_pembaruan: isPembaruan
  });

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns: ColumnDef<DataBlankoByNameByAddress>[] = [
    {
      accessorKey: "s_id",
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
      accessorKey: "s_serial_no",
      meta: {
        filterVariant: "select",
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-fit flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No Blanko
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
            {row.original.s_serial_no}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "s_nomor_sertifikat",
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
            Nomor Sertifikat
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
            {row.original.s_nomor_sertifikat}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "s_nama",
      meta: {
        filterVariant: "select",
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-fit flex items-center justify-start text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data Pemegang Sertifikat
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize`}
        >
          <p className="text-sm text-dark leading-[100%] flex flex-col">
            {" "}
            <span className="font-semibold">{row.original.s_nama}</span>  <span>{row.original.s_tempat_lahir}, {row.original.s_tanggal_lahir}</span>
          </p>
        </div>
      ),
    },
    {
      accessorKey: "created_on",
      meta: {
        filterVariant: "select",
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="p-0 !text-left w-[200px] flex items-center justify-center text-gray-900 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal Penerbitan
            <HiUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"}  text-left flex flex-wrap flex-col capitalize items-center justify-center`}
        >
          <p className="text-sm text-dark leading-[100%]">
            {" "}
            {row.original.created_on}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "is_pembaruan",
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
            Is Pembaruan Sertifikat
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
            {row.original.is_pembaruan}
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

  React.useEffect(() => {
    refetchBlankoByNameByAddress({
      waktu_awal: startDate,
      waktu_berakhir: endDate,
      type_sertifikat: typeBlanko,
      is_pembaruan: isPembaruan
    });
  }, [typeBlanko, isPembaruan, startDate, endDate]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-8">
      {showFormAjukanPelatihan ? (
        <></>
      ) : showCertificateSetting ? (
        <></>
      ) : (
        <>
          {/* Header Tabel Data Pelatihan */}
          <div className="flex flex-wrap items-center mb-3 justify-between gap-3 sm:flex-nowrap">
            {/* Statistik Pelatihan */}
            {/* <div className="flex w-full gap-3 sm:gap-5">
              <div className="flex min-w-47.5">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-primary">Total Penggunaan</p>
                  <p className="text-sm font-medium">
                    {data.reduce(
                      (total, item) => total + item.JumlahBlankoDisetujui,
                      0
                    )}{" "}
                    blanko
                  </p>
                </div>
              </div>
              <div className="flex w-full">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-secondary">
                    Total Penggunaan Blanko CoP
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
              <div className="flex w-full -ml-56">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-green-400"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-green-400">
                    Total Penggunaan Blanko CoC
                  </p>
                  <p className="text-sm font-medium">
                    {data
                      .filter(
                        (item: BlankoKeluar) =>
                          item.TipeBlanko === "Certificate of Competence (CoC)"
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
            </div> */}
          </div>

          {/* List Data Pelatihan */}
          <div>
            <div id="chartOne" className="-ml-5"></div>
            {
              isFetching && dataFull == null ? <></> :
                <div className="flex w-full items-end mb-2">

                  <div className="flex flex-col gap-1 w-full">
                    <p className="font-medium text-dark text-sm">
                      Filter Data Blanko
                    </p>
                    <div className="flex w-full gap-1 items-start">

                      <Select
                        value={typeBlanko}
                        onValueChange={(value) => {
                          setTypeBlanko(value); if (value != 'CoC') {
                            setIsPembaruan(' ')
                          }
                        }}
                      >
                        <SelectTrigger className="w-fit border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                          <div className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer">
                            <TbChartBubble />{" "}
                            {typeBlanko == " "
                              ? "All"
                              : typeBlanko != ""
                                ? typeBlanko
                                : "Tipe Blanko"}
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Tipe Blanko</SelectLabel>
                            <SelectItem value=" ">All</SelectItem>
                            <SelectItem value="CoC">
                              CoC
                            </SelectItem>
                            <SelectItem value="CoP">
                              CoP
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {
                        typeBlanko == 'CoC' && <Select
                          value={isPembaruan}
                          onValueChange={(value) => {
                            setIsPembaruan(value);
                          }}
                        >
                          <SelectTrigger className="w-fit border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                            <div className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer">
                              <TbChartBubble />{" "}
                              {isPembaruan == " "
                                ? "All"
                                : isPembaruan != " "
                                  ? isPembaruan == '0' ? 'Biasa' : 'Pembaruan'
                                  : "Jenis Sertifikat"}
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Jenis Sertifikat</SelectLabel>
                              <SelectItem value=" ">All</SelectItem>
                              <SelectItem value="0">
                                Biasa
                              </SelectItem>
                              <SelectItem value="1">
                                Pembaruan
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      }
                      {
                        dataFull != null ? <Select

                        >
                          <SelectTrigger className="w-fit border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                            <div className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer">
                              <TbChartBubble />{" "}
                              Jumlah Sertifikat : {dataFull!.total_data}
                            </div>
                          </SelectTrigger>

                        </Select> : <></>
                      }

                    </div>
                  </div>


                  <div className="w-fit flex flex-col items-end justify-end gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-dark text-sm">
                        Pilih Range Waktu & Cari No Serial
                      </p>
                      <div className="flex flex-row gap-1 w-fit justify-end">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => handleDateChange(e, setStartDate)}
                          className="flex h-9 w-fit items-center justify-between whitespace-nowrap rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 "
                        />

                        {/* End Date Input */}
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => handleDateChange(e, setEndDate)}
                          className="flex h-9 w-fit items-center justify-between whitespace-nowrap rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 "
                        />
                      </div>
                    </div>
                    <Input
                      placeholder="Cari berdasarkan no serial blanko..."
                      value={
                        (table
                          .getColumn("s_serial_no")
                          ?.getFilterValue() as string) ?? ""
                      }
                      onChange={(event: any) =>
                        table
                          .getColumn("s_serial_no")
                          ?.setFilterValue(event.target.value)
                      }
                      className="max-w-sm text-sm"
                    />

                  </div>
                </div>
            }
            {isFetching ? <div className="my-32 w-full flex items-center justify-center">
              <HashLoader color="#338CF5" size={50} />
            </div> : <TableData
              isLoading={isFetching}
              columns={columns}
              table={table}
              type={"short"}
            />}


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

export default TableDataBlankoKeluar;
