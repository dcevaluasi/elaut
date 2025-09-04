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

import { ArrowUpDown, Check, LucideInfo } from "lucide-react";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
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
import { FaEdit } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Checkbox } from "@radix-ui/react-checkbox";
import Cookies from "js-cookie";
import Toast from "@/components/toast";
import { generatedStatusCertificate } from "@/utils/certificates";
import { FiUploadCloud } from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";

interface UserPelatihanTableProps {
    pelatihan: PelatihanMasyarakat
    data: UserPelatihan[];
    onSuccess: any
}

const UserPelatihanTable: React.FC<UserPelatihanTableProps> = ({
    pelatihan,
    data,
    onSuccess
}) => {
    const pathName = usePathname();
    const paths = pathName.split("/");

    const handleLulusDataPeserta = async (user: UserPelatihan) => {
        try {
            const formData = new FormData();
            formData.append("IsActice", user.IsActice == '{PESERTA}{TELAH LULUS}{Has Passed}' ? '{PESERTA}{TELAH MENGIKUTI}{Has Attended}' : '{PESERTA}{TELAH LULUS}{Has Passed}');

            await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );

            Toast.fire({
                icon: "success",
                title: 'Yeayyy!',
                text: `Berhasil meluluskan peserta pelatihan!`,
            });
            onSuccess()
        } catch (error) {
            console.error("ERROR UPDATE PELATIHAN:", error);
            Toast.fire({
                icon: "error",
                title: 'Oopsss!',
                text: `Gagal meluluskan  peserta pelatihan!`,
            });
            onSuccess()
        }
    };

    const handleLulusValidPeserta = async (user: UserPelatihan) => {
        try {
            const formData = new FormData();
            formData.append("Keterangan", user.Keterangan === 'Valid' ? 'Tidak Valid' : 'Valid');

            await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );

            Toast.fire({
                icon: "success",
                title: 'Yeayyy!',
                text: `Berhasil memvalidasi peserta pelatihan!`,
            });
            onSuccess()
        } catch (error) {
            console.error("ERROR UPDATE PELATIHAN:", error);
            Toast.fire({
                icon: "error",
                title: 'Oopsss!',
                text: `Gagal memvalidasi  peserta pelatihan!`,
            });
            onSuccess()
        }
    };

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
        ...(parseInt(pelatihan.StatusPenerbitan) == 0
            ? [
                {
                    accessorKey: "IsActice",
                    header: ({ column }) => {
                        return (
                            <Button
                                variant="ghost"
                                className={`text-black font-semibold w-full p-0  text-center justify-center items-center flex`}
                                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            >
                                <p className="leading-[105%]">Status <br /> Valid</p>
                                <IoMdCheckmarkCircleOutline className="ml-2 h-4 w-4" />
                            </Button>
                        );
                    },
                    cell: ({ row }) => (
                        <div className="capitalize w-full flex items-center justify-center">
                            {
                                row.original.Keterangan != "" && <label className="flex items-center gap-2 text-base font-semibold tracking-tight leading-none">
                                    <label
                                        htmlFor="keterangan"
                                        className="flex items-center gap-2 cursor-pointer font-semibold  disabled:cursor-not-allowed justify-center"
                                    >
                                        <Checkbox
                                            disabled={row.original.StatusPenandatangan === "Done"}
                                            id="keterangan"
                                            onCheckedChange={() => handleLulusValidPeserta(row.original)}
                                            checked={
                                                row.original.Keterangan === "Valid"
                                            }
                                            className="h-7 w-8 rounded-md border border-gray-300 bg-white shadow-sm
             data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 
             transition-all duration-200 ease-in-out
             hover:border-green-400 hover:shadow-md
             focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 
             disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                        >
                                            <Check className="h-4 w-4 text-white" />
                                        </Checkbox>

                                        {row.original.Keterangan}
                                    </label>

                                </label>
                            }

                        </div>

                    ),
                } as ColumnDef<UserPelatihan>,
            ]
            : []),
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
            accessorKey: "NoRegistrasi",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className={`text-black font-semibold w-full p-0 flex justify-center items-center`}
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <p className="leading-[105%]">No STTPL</p>

                        <AiOutlineFieldNumber className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className={`${"ml-0"} text-center capitalize `}>
                    <p className="text-base font-semibold tracking-tight leading-none">
                        {row.original.NoRegistrasi}
                    </p>
                </div>
            ),
        },

        ...(parseInt(pelatihan.StatusPenerbitan) <= 5
            ? [
                {
                    accessorKey: "IdUsers",
                    header: ({ column }) => (
                        <Button
                            variant="ghost"
                            className="text-black font-semibold w-full p-0 flex justify-center items-center"
                            onClick={() =>
                                column.toggleSorting(column.getIsSorted() === "asc")
                            }
                        >
                            <p className="leading-[105%]">ID Peserta</p>
                            <AiOutlineFieldNumber className="ml-2 h-4 w-4" />
                        </Button>
                    ),
                    cell: ({ row }) => (
                        <div className="ml-0 text-center capitalize">
                            <p className="text-base font-semibold tracking-tight leading-none">
                                {row.original.IdUsers}
                            </p>
                        </div>
                    ),
                } as ColumnDef<UserPelatihan>,
            ]
            : []),
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
        ...(parseInt(pelatihan.StatusPenerbitan) >= 4 ? [
            {
                accessorKey: "PreTest",
                header: ({ column }: { column: any }) => {
                    return (
                        <Button
                            variant="ghost"
                            className={`text-black font-semibold w-full p-0 flex justify-center items-center`}
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            <p className="leading-[105%]"> PreTest</p>

                            <FaEdit className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }: { row: any }) => (
                    <div className={`${"ml-0"} text-center capitalize w-full`}>
                        <p className="text-base font-semibold tracking-tight leading-none">
                            {row.original.PreTest}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "PostTest",
                header: ({ column }: { column: any }) => {
                    return (
                        <Button
                            variant="ghost"
                            className={`text-black font-semibold w-full p-0 flex justify-center items-center`}
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            <p className="leading-[105%]"> PostTest</p>

                            <FaEdit className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }: { row: any }) => (
                    <div className={`${"ml-0"} text-center capitalize w-full`}>
                        <p className="text-base font-semibold tracking-tight leading-none">
                            {row.original.PostTest}
                        </p>
                    </div>
                ),
            },
        ] : []),
        ...(parseInt(pelatihan.StatusPenerbitan) >= 5
            ? [
                {
                    accessorKey: "IsActice",
                    header: ({ column }) => {
                        return (
                            <Button
                                variant="ghost"
                                className={`text-black font-semibold w-full p-0  text-center justify-center items-center flex`}
                                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            >
                                <p className="leading-[105%]">Status <br /> Kelulusan</p>
                                <IoMdCheckmarkCircleOutline className="ml-2 h-4 w-4" />
                            </Button>
                        );
                    },
                    cell: ({ row }) => (
                        <div className="capitalize w-full flex items-center justify-center">
                            {
                                row.original.IsActice != "" && <label className="flex items-center gap-2 text-base font-semibold tracking-tight leading-none">
                                    <label
                                        htmlFor="isActice"
                                        className="flex items-center gap-2 cursor-pointer font-semibold  disabled:cursor-not-allowed justify-center"
                                    >
                                        <Checkbox
                                            disabled={row.original.StatusPenandatangan === "Done"}
                                            id="isActice"
                                            onCheckedChange={() => handleLulusDataPeserta(row.original)}
                                            checked={
                                                row.original.IsActice !== "{PESERTA}{TELAH MENGIKUTI}{Has Attended}"
                                            }
                                            className="h-6 w-8 rounded-md border border-gray-300 bg-white shadow-sm
             data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 
             transition-all duration-200 ease-in-out
             hover:border-blue-400 hover:shadow-md
             focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 
             disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                        >
                                            <Check className="h-4 w-4 text-white" />
                                        </Checkbox>

                                        {generatedStatusCertificate(row.original.IsActice).status_indo}
                                    </label>

                                </label>
                            }

                        </div>

                    ),
                } as ColumnDef<UserPelatihan>,
            ]
            : []),
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
