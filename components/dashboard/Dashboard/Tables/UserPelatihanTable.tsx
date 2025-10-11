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
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpDown, Check, LucideInfo } from "lucide-react";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import { AiOutlineFieldNumber } from "react-icons/ai";
import { FaRegIdCard } from "react-icons/fa6";
import Link from "next/link";
import { TbDatabaseEdit } from "react-icons/tb";
import { formatToRupiah } from "@/lib/utils";
import { User } from "@/types/user";
import axios from "axios";
import { elautBaseUrl } from "@/constants/urls";
import { FaEdit } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Checkbox } from "@radix-ui/react-checkbox";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { countUserWithNoSertifikat } from "@/utils/counter";
import { IoCalendarClear, IoReload } from "react-icons/io5";
import { getDateInIndonesianFormat } from "@/utils/time";
import EditPesertaAction from "@/commons/actions/EditPesertaAction";
import { FiTrash2 } from "react-icons/fi";

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
    const [users, setUsers] = React.useState<UserPelatihan[]>(data);

    const handleDeleteCertificateById = async (id: number) => {
        try {
            const token = Cookies.get("XSRF091")
            const response = await axios.delete(
                `${elautBaseUrl}/deleteSertifikatTTde?id=${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
        } catch (error: any) {
        }
    }

    const handleUploadNilaiPeserta = async (
        id: number,
        nilaiPretest: string,
        nilaiPosttest: string
    ) => {
        const formData = new FormData();
        formData.append("PreTest", nilaiPretest);
        formData.append("PostTest", nilaiPosttest);

        try {
            await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${id}`,
                formData,
                { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
            );

            Toast.fire({
                icon: "success",
                title: "Yeayyy!",
                text: `Berhasil mengupdate data penilaian!`,
            });

            setUsers((prev: any[]) =>
                prev.map((u: any) =>
                    u.IdUserPelatihan === id
                        ? { ...u, PreTest: nilaiPretest, PostTest: nilaiPosttest }
                        : u
                )
            );
        } catch (error) {
            console.error("ERROR UPDATE PELATIHAN: ", error);
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: `Gagal mengupdate data penilaian!`,
            });
        }
    };


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
            setUsers((prev: any[]) =>
                prev.map((u: any) =>
                    u.IdUserPelatihan === user.IdUserPelatihan
                        ? { ...u, IsActice: user.IsActice == '{PESERTA}{TELAH LULUS}{Has Passed}' ? '{PESERTA}{TELAH MENGIKUTI}{Has Attended}' : '{PESERTA}{TELAH LULUS}{Has Passed}' }
                        : u
                )
            );
        } catch (error) {
            Toast.fire({
                icon: "error",
                title: 'Oopsss!',
                text: `Gagal meluluskan  peserta pelatihan!`,
            });

        }
    };

    const handleRevisiDataPeserta = async (user: UserPelatihan) => {
        try {
            const formData = new FormData();
            formData.append("StatusPenandatangan", user.StatusPenandatangan == 'No Revisi' || user.StatusPenandatangan == 'Done' ? 'Revisi' : 'No Revisi');
            formData.append("TanggalSertifikat", '-')

            await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );

            handleDeleteCertificateById(user.IdUserPelatihan)

            Toast.fire({
                icon: "success",
                title: 'Yeayyy!',
                text: `Silahkan melakukan revisi!`,
            });
            onSuccess()
        } catch (error) {
            Toast.fire({
                icon: "error",
                title: 'Oopsss!',
                text: `Gagal melakukan revisi!`,
            });
            onSuccess()
        }
    };

    const [selectedRow, setSelectedRow] = React.useState<UserPelatihan | null>(null);
    const [openDialog, setOpenDialog] = React.useState(false);
    const handleConfirmRevisi = () => {
        if (selectedRow) {
            handleRevisiDataPeserta(selectedRow);
            setOpenDialog(false);
            setSelectedRow(null);
        }
    };

    const [openDialogTanggalSertifikatRevisi, setOpenDialogTanggalSertifikatRevisi] = React.useState(false);
    const [tanggalSertifikatRevisi, setTanggalSertifikatRevisi] = React.useState('')
    const [loadingTanggalSertifikatRevisi, setLoadingTanggalSertifikatRevisi] = React.useState(false)
    const handleTanggalSertifikat = async (user: UserPelatihan) => {
        setLoadingTanggalSertifikatRevisi(true);

        try {
            const formData = new FormData();
            formData.append(
                "TanggalSertifikat",
                getDateInIndonesianFormat(tanggalSertifikatRevisi)
            );

            await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
                formData,
                { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
            );

            Toast.fire({
                icon: "success",
                title: "Yeayyy!",
                text: `Revisi Tanggal penandatanganan berhasil ditentukan untuk STTPL.`,
            });
            setTanggalSertifikatRevisi("");
            setLoadingTanggalSertifikatRevisi(false);
            onSuccess()
        } catch {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: "Gagal merevisi tanggal penandatanganan.",
            });
            setLoadingTanggalSertifikatRevisi(false);
        }
    };

    const handleSetTanggalRevisi = () => {
        if (selectedRow) {
            handleTanggalSertifikat(selectedRow);
            setOpenDialog(false);
            setSelectedRow(null);
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

            setUsers((prev) =>
                prev.map((item) =>
                    item.IdUserPelatihan === user.IdUserPelatihan
                        ? { ...item, Keterangan: item.Keterangan === "Valid" ? "Tidak Valid" : "Valid" }
                        : item
                )
            );
        } catch (error) {
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
                            <label className="flex items-center gap-2 text-base font-semibold tracking-tight leading-none">
                                <label
                                    htmlFor="isLulus"
                                    className="flex items-center gap-2 cursor-pointer font-semibold  disabled:cursor-not-allowed justify-center"
                                >
                                    <Checkbox
                                        disabled={row.original.StatusPenandatangan === "Done" || !Cookies.get('Access')?.includes('createPelatihan')}
                                        id="isLulus"
                                        onCheckedChange={() => handleLulusDataPeserta(row.original)}
                                        checked={
                                            row.original.IsActice === "{PESERTA}{TELAH LULUS}{Has Passed}"
                                        }
                                        className="h-6 w-9 rounded-md border border-gray-300 bg-white shadow-sm
             data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 
             transition-all duration-200 ease-in-out
             hover:border-blue-400 hover:shadow-md
             focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 
             disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        <Check className="h-4 w-4 text-white" />
                                    </Checkbox>

                                    TELAH LULUS
                                </label>

                                <label
                                    htmlFor="isMengikuti"
                                    className="flex items-center gap-2 cursor-pointer font-semibold  disabled:cursor-not-allowed justify-center"
                                >
                                    <Checkbox
                                        disabled={row.original.StatusPenandatangan === "Done" || !Cookies.get('Access')?.includes('createPelatihan')}
                                        id="isMengikuti"
                                        onCheckedChange={() => handleLulusDataPeserta(row.original)}
                                        checked={
                                            row.original.IsActice === "{PESERTA}{TELAH MENGIKUTI}{Has Attended}"
                                        }
                                        className="h-6 w-8 rounded-md border border-gray-300 bg-white shadow-sm
             data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 
             transition-all duration-200 ease-in-out
             hover:border-teal-400 hover:shadow-md
             focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 
             disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        <Check className="h-4 w-4 text-white" />
                                    </Checkbox>

                                    TELAH MENGIKUTI
                                </label>

                            </label>
                        </div>

                    ),
                } as ColumnDef<UserPelatihan>,
            ]
            : []),
        ...(pelatihan?.IsRevisi == "Active"
            ? [
                {
                    accessorKey: "StatusPenandatangan",
                    header: ({ column }) => {
                        return (
                            <Button
                                variant="ghost"
                                className={`text-black font-semibold w-full p-0  text-center justify-center items-center flex`}
                                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            >
                                <p className="leading-[105%]">Revisi</p>
                                <IoReload className="ml-2 h-4 w-4" />
                            </Button>
                        );
                    },
                    cell: ({ row }) => (
                        <div className="capitalize w-full flex items-center justify-center">
                            <label className="flex items-center gap-2 text-base font-semibold tracking-tight leading-none">
                                <label
                                    htmlFor="isActice"
                                    className="flex items-center gap-2 cursor-pointer font-semibold  disabled:cursor-not-allowed justify-center"
                                >
                                    <Checkbox
                                        disabled={!Cookies.get("Access")?.includes("createPelatihan") || row.original.StatusPenandatangan === "Revisi"}
                                        id="StatusPenandatangan"
                                        onCheckedChange={() => {
                                            setSelectedRow(row.original);
                                            setOpenDialog(true);
                                        }}
                                        checked={row.original.StatusPenandatangan === "Revisi"}
                                        className="h-6 w-6 rounded-md border border-gray-300 bg-white shadow-sm
    data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 
    transition-all duration-200 ease-in-out
    hover:border-amber-400 hover:shadow-md
    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 
    disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        <Check className="h-4 w-4 text-white" />
                                    </Checkbox>
                                    REVISI
                                </label>
                            </label>
                        </div>

                    ),
                } as ColumnDef<UserPelatihan>,
            ]
            : []),
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
                            <label className="flex items-center gap-2 text-base font-semibold tracking-tight leading-none">
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
             data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 
             transition-all duration-200 ease-in-out
             hover:border-green-400 hover:shadow-md
             focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 
             disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        <Check className="h-4 w-4 text-white" />
                                    </Checkbox>

                                    {row.original.Keterangan == "" ? "Tidak Valid" : row.original.Keterangan}
                                </label>

                            </label>

                        </div>

                    ),
                } as ColumnDef<UserPelatihan>,
            ]
            : []),
        ...(pelatihan.StatusPenerbitan == "7D" || pelatihan.StatusPenerbitan == "11" || pelatihan.StatusPenerbitan == "15"
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
                                <p className="leading-[105%]">STTPL</p>
                                <IoMdCheckmarkCircleOutline className="ml-2 h-4 w-4" />
                            </Button>
                        );
                    },
                    cell: ({ row }) => (
                        <div className="w-full flex gap-3">
                            {
                                row.original.StatusPenandatangan == "Revisi" && row.original.FileSertifikat == "" ? row.original?.TanggalSertifikat == "-" ?
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedRow(row.original)
                                            setOpenDialogTanggalSertifikatRevisi(true)
                                        }}
                                        className={`flex items-center gap-2 w-full rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-neutral-600 text-neutral-600 hover:text-white hover:bg-neutral-600`}
                                    >
                                        <IoCalendarClear className="h-4 w-4" />
                                        <span>Tanggal Revisi</span>
                                    </Button> : <> </> : <Link
                                        target="_blank"
                                        href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${row.original.FileSertifikat}`}
                                        className="flex items-center flex-shrink-0 justify-center gap-2 w-full rounded-lg px-4 text-center py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 border "
                                    >
                                    <RiVerifiedBadgeFill className="h-4 w-4  " />
                                    <span className="text-sm">e-STTPL</span>
                                </Link>
                            }
                        </div >
                    ),
                } as ColumnDef<UserPelatihan>,
            ]
            : []),
        ...((pelatihan?.StatusPenerbitan != "7D" && pelatihan.StatusPenerbitan != "11" && pelatihan.StatusPenerbitan != "15") || pelatihan.IsRevisi == "Active" ? [
            {
                accessorKey: "IdPelatihan",
                header: ({ column }: { column: any }) => {
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
                cell: ({ row }: { row: any }) => (
                    <div className="w-full flex items-center gap-3 justify-center">
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
                        {
                            Cookies.get('Access')?.includes('createPelatihan') && (parseInt(pelatihan?.StatusPenerbitan) < 6 || pelatihan?.StatusPenerbitan == "7" || pelatihan?.StatusPenerbitan == "9") && <EditPesertaAction idPelatihan={row.original.IdPelatihan.toString()} onSuccess={onSuccess} idPeserta={row.original.IdUsers.toString()} />
                        }
                        {
                            Cookies.get('Access')?.includes('createPelatihan') && (pelatihan?.StatusPenerbitan == "0" || pelatihan?.StatusPenerbitan == "1.2" || pelatihan?.StatusPenerbitan == "3" || pelatihan?.StatusPenerbitan == "7" || pelatihan?.StatusPenerbitan == "9") && <Button
                                variant="outline"
                                onClick={async () => {
                                    const confirmDelete = window.confirm(`⚠️ Apakah Anda yakin ingin menghapus ${row.original.Nama} ini?`);
                                    if (!confirmDelete) return;

                                    try {
                                        const res = await fetch(
                                            `${elautBaseUrl}/deleteUserPelatihanById?id=${row.original.IdUserPelatihan}`,
                                            {
                                                method: "DELETE",
                                                headers: {
                                                    "Authorization": `Bearer ${Cookies.get('XSRF091')}`,
                                                    "Content-Type": "application/json",
                                                },
                                            }
                                        );
                                        if (!res.ok) throw new Error("Gagal menghapus data peserta");

                                        // alert("✅ Data peserta berhasil dihapus");

                                        setUsers((prevData) =>
                                            prevData.filter((item) => item.IdUserPelatihan !== row.original.IdUserPelatihan)
                                        );

                                    } catch (error) {
                                        console.error(error);
                                        alert("❌ Gagal menghapus data peserta");
                                    }
                                }}
                                className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500 border group"
                            >
                                <FiTrash2 className="h-5 w-5 text-rose-500 group-hover:text-white" />
                                Hapus
                            </Button>
                        }

                    </div>

                ),
            }, {
                accessorKey: "IdUserPelatihan",
                header: ({ column }: { column: any }) => {
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
                cell: ({ row }: { row: any }) => (
                    <div className={`${"ml-0"} text-center capitalize `}>
                        <p className="text-base font-semibold tracking-tight leading-none">
                            {row.original.IdUserPelatihan}
                        </p>
                    </div>
                ),
            },] : []),

        ...(countUserWithNoSertifikat(pelatihan?.UserPelatihan) != 0
            ? [{
                accessorKey: "NoRegistrasi",
                header: ({ column }: { column: any }) => {
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
                cell: ({ row }: { row: any }) => (
                    <div className={`${"ml-0"} text-center capitalize `}>
                        <p className="text-base font-semibold tracking-tight leading-none">
                            {row.original.NoRegistrasi}
                        </p>
                    </div>
                ),
            },] : []),
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
                header: ({ column }: { column: any }) => (
                    <Button
                        variant="ghost"
                        className="text-black font-semibold w-full p-0 flex justify-center items-center"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        <p className="leading-[105%]">PreTest</p>
                    </Button>
                ),
                cell: ({ row }: { row: any }) => {
                    const user = row.original;

                    return (
                        <div className="flex justify-center items-center gap-2">
                            <p className="text-base font-semibold tracking-tight leading-none">
                                {user.PreTest}
                            </p>

                            {/* Dialog untuk edit nilai Pre/Post */}
                            <UploadNilaiDialog
                                user={user}
                                defaultPre={user.PreTest || ""}
                                defaultPost={user.PostTest || ""}
                                onSubmit={handleUploadNilaiPeserta}
                                trigger={
                                    <Button size="icon" variant="ghost" className="h-6 w-6">
                                        <FaEdit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                }
                            />

                        </div>
                    );
                },
            },
            {
                accessorKey: "PostTest",
                header: ({ column }: { column: any }) => (
                    <Button
                        variant="ghost"
                        className="text-black font-semibold w-full p-0 flex justify-center items-center"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        <p className="leading-[105%]">PostTest</p>
                    </Button>
                ),
                cell: ({ row }: { row: any }) => {
                    const user = row.original;

                    return (
                        <div className="flex justify-center items-center gap-2">
                            <p className="text-base font-semibold tracking-tight leading-none">
                                {user.PostTest}
                            </p>

                            <UploadNilaiDialog
                                user={user}
                                defaultPre={user.PreTest || ""}
                                defaultPost={user.PostTest || ""}
                                onSubmit={handleUploadNilaiPeserta}
                                trigger={
                                    <Button size="icon" variant="ghost" className="h-6 w-6">
                                        <FaEdit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                }
                            />


                        </div>
                    );
                },
            },

        ] : []),

    ];

    const table = useReactTable({
        data: users,
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

            {/* Dialog : Revisi Sertifikat */}
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Revisi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menandai peserta ini sebagai <b>Revisi</b>?
                            <br /><br />
                            ⚠️ Sertifikat asli yang sudah ditandatangani secara elektronik akan <b>dihapus</b>.
                            <br /><br />
                            Pengaturan status ini hanya bisa dilakukan <b>sekali</b>.
                            Harap pastikan peserta yang dipilih memang benar dan perlu perbaikan data pada STTPL sebelum melanjutkan.
                        </AlertDialogDescription>

                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpenDialog(false)}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRevisi}>Ya, Revisi</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog : Tanggal Revisi Sertifikat */}
            <AlertDialog open={openDialogTanggalSertifikatRevisi} onOpenChange={setOpenDialogTanggalSertifikatRevisi}>
                <AlertDialogContent className="max-w-lg rounded-xl z-[999999999999]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tanggal Revisi TTDe</AlertDialogTitle>
                        <AlertDialogDescription>
                            Setting tanggal revisi penandatanganan, dan harap pengaturan tanggal menyesuaikan hari dilakukan revisi
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4">
                        <div className="flex flex-col w-full space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Tanggal Revisi
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                                value={tanggalSertifikatRevisi}
                                onChange={(e) => setTanggalSertifikatRevisi(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => handleSetTanggalRevisi()}
                                className="mt-2 px-4 py-2 h-fit bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                                disabled={loadingTanggalSertifikatRevisi || tanggalSertifikatRevisi == ""}
                            >
                                {loadingTanggalSertifikatRevisi ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>

                    <AlertDialogCancel
                        className="mt-4"
                        onClick={() => {
                            setOpenDialogTanggalSertifikatRevisi(false)
                            setSelectedRow(null)
                        }}>Tutup</AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialog>
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

            <AlertDialogFooter>
                <AlertDialogCancel className="w-full">Tutup</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}

type UploadNilaiDialogProps = {
    user: UserPelatihan;
    defaultPre?: string;
    defaultPost?: string;
    onSubmit: (id: number, pre: string, post: string) => Promise<void>;
    trigger: React.ReactNode;
};

const UploadNilaiDialog: React.FC<UploadNilaiDialogProps> = ({
    user,
    defaultPre = "",
    defaultPost = "",
    onSubmit,
    trigger
}) => {
    const [pre, setPre] = React.useState(defaultPre);
    const [post, setPost] = React.useState(defaultPost);
    const [loading, setLoading] = React.useState(false);

    const handleSave = async () => {
        setLoading(true);
        await onSubmit(user?.IdUserPelatihan, pre, post);
        setLoading(false);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Input Nilai {user?.Nama}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <div>
                        <label className="text-sm font-medium">Pre Test</label>
                        <input
                            type="number"
                            value={pre}
                            onChange={(e) => setPre(e.target.value)}
                            className="w-full rounded-md border p-2 text-sm"
                            placeholder="Nilai PreTest"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Post Test</label>
                        <input
                            type="number"
                            value={post}
                            onChange={(e) => setPost(e.target.value)}
                            className="w-full rounded-md border p-2 text-sm"
                            placeholder="Nilai PostTest"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {loading ? "Menyimpan..." : "Simpan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserPelatihanTable;
