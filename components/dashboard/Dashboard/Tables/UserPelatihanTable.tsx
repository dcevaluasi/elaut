"use client";

import React from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { ArrowUpDown, LucideInfo } from "lucide-react";
import { UserPelatihan } from "@/types/product";
import { AiOutlineFieldNumber } from "react-icons/ai";
import { FaRegIdCard } from "react-icons/fa6";
import Link from "next/link";
import { TbDatabaseEdit } from "react-icons/tb";
import { usePathname } from "next/navigation";
import { decryptValue, encryptValue } from "@/lib/utils";

interface UserPelatihanTableProps {
    data: UserPelatihan[];
}

const UserPelatihanTable: React.FC<UserPelatihanTableProps> = ({
    data,
}) => {
    const pathName = usePathname();
    const paths = pathName.split("/");
    const columns: ColumnDef<UserPelatihan>[] = [
        {
            accessorKey: "KodePelatihan",
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
                        className={`flex items-center justify-center leading-[105%] p-0 w-full text-gray-900 font-semibold`}
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >

                        <span>Detail Peserta</span>

                        <TbDatabaseEdit className="ml-1 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className={`flex items-center justify-center w-full gap-1`}>
                    <Link
                        target="_blank"
                        href={`/admin/${usePathname().includes("lemdiklat") ? "lemdiklat" : "pusat"
                            }/pelatihan/${paths[paths.length - 2]}/peserta-pelatihan/${paths[paths.length - 1]}/${encryptValue(
                                row.original.IdUserPelatihan
                            )}/${encryptValue(
                                row.original.IdUsers
                            )}`}
                        className=" border border-neutral-800  text-white  shadow-sm hover:bg-neutral-800 bg-neutral-800 hover:text-white h-9 px-4 py-2 mx-0 rounded-md flex text-sm items-center gap-2"
                    >
                        <LucideInfo className="h-4 w-4 " />{" "}
                        <span className="text-sm">Detail</span>
                    </Link>
                </div>
            ),
        },
        {
            accessorKey: "IdUsers",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className={`text-black font-semibold w-full p-0 flex justify-center items-center`}
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <p className="leading-[105%]"> ID Peserta</p>

                        <AiOutlineFieldNumber className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className={`${"ml-0"} text-center capitalize `}>
                    <p className="text-base font-semibold tracking-tight leading-none">
                        {row.original.IdUsers}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "Nama",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className={`text-black font-semibold w-full p-0 flex justify-center items-center`}
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <p className="leading-[105%]"> Nama Peserta</p>

                        <FaRegIdCard className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className={`${"ml-0"} text-center capitalize w-full`}>
                    <p className="text-base font-semibold tracking-tight leading-none">
                        {row.original.Nama}
                    </p>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-sm font-semibold text-gray-700 px-4 py-3"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-4 py-3 text-sm text-gray-900"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-gray-500"
                                >
                                    Tidak ada data peserta.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default UserPelatihanTable;
