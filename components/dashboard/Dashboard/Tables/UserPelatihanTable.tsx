"use client";

import React from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    getPaginationRowModel,
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
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { ArrowUpDown, LucideInfo } from "lucide-react";
import { UserPelatihan } from "@/types/product";
import { AiOutlineFieldNumber } from "react-icons/ai";
import { FaRegIdCard } from "react-icons/fa6";
import Link from "next/link";
import { TbDatabaseEdit } from "react-icons/tb";
import { usePathname } from "next/navigation";
import { formatToRupiah } from "@/lib/utils";
import { User } from "@/types/user";
import axios from "axios";
import { elautBaseUrl } from "@/constants/urls";
import VerifikasiPesertaAction from "../Actions/VerifikasiPesertaAction";

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
                <div className="w-full flex items-center justify-center">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                className=" gap-2 h-10 px-5 text-sm font-medium rounded-lg border text-neutral-500 hover:text-white hover:bg-neutral-500 transition-colors "
                            >
                                <LucideInfo className="h-4 w-4" />
                                Detail
                            </Button>
                        </AlertDialogTrigger>
                        <DetailPesertaDialog
                            pesertaId={row.original.IdUsers}
                            userPelatihanId={row.original.IdUserPelatihan}
                        />
                    </AlertDialog>
                </div>

            ),
        },
        {
            accessorKey: "IdUserPelatihan",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className={`text-black font-semibold w-full p-0 flex justify-center items-center`}
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <p className="leading-[105%]">No Registrasi</p>

                        <AiOutlineFieldNumber className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className={`${"ml-0"} text-center capitalize `}>
                    <p className="text-base font-semibold tracking-tight leading-none">
                        {row.original.IdUserPelatihan}
                    </p>
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
        getPaginationRowModel: getPaginationRowModel(),

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

                <div className="flex items-center justify-between border-t px-4 py-3">
                    <div className="text-sm text-gray-600">
                        Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailPesertaDialog = ({ pesertaId, userPelatihanId }: { pesertaId: number; userPelatihanId: number }) => {
    const [peserta, setPeserta] = React.useState<User | null>(null);
    const [pesertaPelatihan, setPesertaPelatihan] = React.useState<UserPelatihan | null>(null);

    const handleFetchDetailPeserta = async () => {
        try {
            const response = await axios.get(`${elautBaseUrl}/users/getUsersByIdNoJwt?id=${pesertaId}`, {
                headers: {
                    "x-api-key": "EL@uTs3rv3R",
                },
            });
            setPeserta(response.data);
            const filteredPelatihan = response.data.Pelatihan.filter(
                (item: UserPelatihan) => item.IdUserPelatihan.toString() === userPelatihanId.toString()
            );
            setPesertaPelatihan(filteredPelatihan[0]);
        } catch (error) {
            console.error("LEMDIK INFO: ", error);
        }
    };

    React.useEffect(() => {
        handleFetchDetailPeserta();
    }, []);

    return (
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl">
            <AlertDialogHeader>
                <AlertDialogTitle>Detail Peserta</AlertDialogTitle>
                <AlertDialogDescription>
                    Verifikasi, Monitoring, dan Lihat Data Peserta
                </AlertDialogDescription>
            </AlertDialogHeader>

            {peserta ? (
                <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                        <h2 className="font-semibold text-lg mb-2">Informasi Peserta</h2>
                        <p><strong>Nama:</strong> {peserta.Nama}</p>
                        <p><strong>NIK:</strong> {peserta.Nik}</p>
                        <p><strong>No Telepon:</strong> {peserta.NoTelpon}</p>
                        <p><strong>Email:</strong> {peserta.Email}</p>
                        <p><strong>Alamat:</strong> {peserta.Alamat}</p>
                        <p><strong>Tempat dan Tanggal Lahir:</strong> <span className="uppercase">
                            {peserta!.TempatLahir || "-"}.{" "}
                            {peserta!.TanggalLahir}</span></p>
                        <p><strong>Jenis Kelamin:</strong> {peserta.JenisKelamin}</p>
                    </div>

                    {pesertaPelatihan && (
                        <div className="border rounded-lg p-4">
                            <h2 className="font-semibold text-lg mb-2">Status Verifikasi</h2>
                            <p><strong>Status:</strong> {pesertaPelatihan.Keterangan}</p>
                            <p><strong>Metode Pembayaran:</strong> {pesertaPelatihan.MetodoPembayaran}</p>
                            <p><strong>Total Bayar:</strong> {formatToRupiah(parseInt(pesertaPelatihan.TotalBayar))}</p>
                        </div>
                    )}

                    <div className="border rounded-lg p-4">
                        <h2 className="font-semibold text-lg mb-2">Dokumen Peserta</h2>
                        <p><strong>Pas Foto:</strong> {peserta.Foto != "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/" ? <Link target="_blank" className="text-blue-500 underline" href={peserta.Foto}>{peserta.Foto}</Link> : "-"}</p>
                        <p><strong>KTP:</strong> <Link target="_blank" className="text-blue-500 underline" href={peserta.Ktp}>{peserta.Ktp}</Link></p>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}

            {peserta != null && (
                <div className={`w-full flex items-center justify-center gap-1`}>
                    <VerifikasiPesertaAction
                        idUser={userPelatihanId.toString()}
                        peserta={pesertaPelatihan!}
                        handleFetchingData={handleFetchDetailPeserta}
                    />
                </div>
            )}

            <AlertDialogFooter>
                <AlertDialogCancel>Tutup</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}

export default UserPelatihanTable;
