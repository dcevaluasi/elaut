import React from "react";

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
import { DataBlankoByNameByAddress, DataLembaga, DataProfilLembaga } from "@/types/akapi";
import { HashLoader } from "react-spinners";
import useFetchProfilLembaga from "@/hooks/akapi/useFetchProfilLembaga";
import TableData from "../../tables/TableData";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FaInfo } from "react-icons/fa6";
import Link from "next/link";

const TableDataProfilLembaga: React.FC = () => {
    const {
        data: data,
        dataFull: dataFull,
        isFetching: isFetching,
        refetch: refetchDataProfilLembaga,
    } = useFetchProfilLembaga();

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const columns: ColumnDef<DataProfilLembaga>[] = [
        {
            accessorKey: "pl_id",
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
            accessorKey: "created_on",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className={`text-gray-900 font-semibold`}
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Pengesahan Program
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button

                            variant="outline"
                            title="Pengesahan Program"
                            className="border border-neutral-600 shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-neutral-600 hover:bg-neutral-600  hover:text-white text-white rounded-md"
                        >
                            <FaInfo className="h-4 w-4 mr-1" /> Program Pengesahan
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className='max-w-4xl'>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                {" "}
                                Program Pengesahan di {row.original.pl_nama_lembaga}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="-mt-2">
                                Daftarkan materi pelatihan yang diselenggarakan yang nantinya akan
                                tercantum pada sertifikat peserta pelatihan!
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <ProgramPengesahanAKP data={row.original} />
                        <AlertDialogFooter>
                            <AlertDialogCancel className='w-full'>
                                Close
                            </AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>

                </AlertDialog>
            ),
        },
        {
            accessorKey: "pl_nama_lembaga",
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
                        Nama Lembaga
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
                        {row.original.pl_nama_lembaga}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "pl_nama_pimpinan",
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
                        Nama Pimpinan Lembaga
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
                        <span className="font-semibold">{row.original.pl_nama_pimpinan}</span>  <span>{row.original.pl_nama_pimpinan}, {row.original.pl_jabatan_pimpinan}</span>
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "pl_alamat_lembaga",
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
                        Alamat Lembaga
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
                        {row.original.pl_alamat_lembaga}
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

    return (
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-8">
            <>
                {/* List Data Pelatihan */}
                <div>
                    <div className="flex w-full items-end mb-2">
                        <div className="w-fit flex flex-col items-end justify-end gap-2">
                            <p className="font-medium text-dark text-sm">
                                Cari Lembaga dan Program Pengesahannya
                            </p>
                            <Input
                                placeholder="Cari berdasarkan nama lembaga..."
                                value={
                                    (table
                                        .getColumn("pl_nama_lembaga")
                                        ?.getFilterValue() as string) ?? ""
                                }
                                onChange={(event: any) =>
                                    table
                                        .getColumn("pl_nama_lembaga")
                                        ?.setFilterValue(event.target.value)
                                }
                                className="max-w-sm text-sm"
                            />
                        </div>
                    </div>

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
        </div>
    );
};

const ProgramPengesahanAKP = ({ data }: { data: DataProfilLembaga }) => {
    return (
        <div className="overflow-x-auto !text-sm h-[400px] overflow-y-scroll">
            <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-1">No</th>
                        <th className="border p-1">Nama Program</th>
                        <th className="border p-1">Surat Pengesahan</th>
                        <th className="border p-1">Jenis Program</th>
                        <th className="border p-1">Jenis Pendidikan</th>
                        <th className="border p-1">Sub Pendidikan</th>
                        <th className="border p-1">Kategori Lembaga</th>
                    </tr>
                </thead>
                <tbody>
                    {data.program_pengesahan!.map((item: DataLembaga, index: number) => (
                        <tr key={item.l_id} className="odd:bg-white even:bg-gray-50">
                            <td className="border p-1 text-center">{index + 1}</td>
                            <td className="border p-1">{item.l_nama_program}</td>
                            <td className="border p-1 lowercase"><Link className="cursor-pointer text-blue-500 underline" target="_blank" href={`https://akapi.kkp.go.id/uploads/lembaga/${item.l_surat_pengesahan}`}>{item.l_surat_pengesahan}</Link></td>
                            <td className="border p-1 text-center">{item.l_jenis_program}</td>
                            <td className="border p-1 text-center">{item.l_jenis_pendidikan}</td>
                            <td className="border p-1 text-center">{item.l_sub_jenis_pendidikan}</td>
                            <td className="border p-1 text-center">{item.l_kategori_lembaga}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableDataProfilLembaga;
