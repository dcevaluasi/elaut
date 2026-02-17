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
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpDown, Check, Info, Trash2, Edit3, User as UserIcon, Calendar, Hash, Award, ShieldCheck, RefreshCw, MoreVertical, Search, Download, Trash, Edit, X, CreditCard, MapPin, Phone, Mail, GraduationCap, Building, ChevronRight } from "lucide-react";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import { AiOutlineFieldNumber } from "react-icons/ai";

import Link from "next/link";
import { TbDatabaseEdit, TbTimeline, TbCertificate } from "react-icons/tb";
import axios from "axios";
import { elautBaseUrl } from "@/constants/urls";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Checkbox } from "@/components/ui/checkbox";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { countUserWithNoSertifikat } from "@/utils/counter";
import { IoCalendarClear, IoReload } from "react-icons/io5";
import { getDateInIndonesianFormat } from "@/utils/time";
import EditPesertaAction from "@/commons/actions/EditPesertaAction";
import { FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatToRupiah } from "@/lib/utils";
import { User } from "@/types/user";

interface UserPelatihanTableProps {
    pelatihan: PelatihanMasyarakat
    data: UserPelatihan[];
    onSuccess: () => void;
}

const UserPelatihanTable: React.FC<UserPelatihanTableProps> = ({
    pelatihan,
    data,
    onSuccess
}) => {
    const [users, setUsers] = React.useState<UserPelatihan[]>(data);
    const [selectedRow, setSelectedRow] = React.useState<UserPelatihan | null>(null);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [openDialogTanggalSertifikatRevisi, setOpenDialogTanggalSertifikatRevisi] = React.useState(false);
    const [tanggalSertifikatRevisi, setTanggalSertifikatRevisi] = React.useState('')
    const [loadingTanggalSertifikatRevisi, setLoadingTanggalSertifikatRevisi] = React.useState(false)

    const handleDeleteCertificateById = async (id: number) => {
        try {
            const token = Cookies.get("XSRF091")
            await axios.delete(
                `${elautBaseUrl}/deleteSertifikatTTde?id=${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
        } catch (error: any) {
            console.error(error)
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
                title: "Berhasil!",
                text: `Data penilaian berhasil diperbarui.`,
            });

            setUsers((prev: UserPelatihan[]) =>
                prev.map((u: UserPelatihan) =>
                    u.IdUserPelatihan === id
                        ? { ...u, PreTest: nilaiPretest, PostTest: nilaiPosttest }
                        : u
                )
            );
        } catch (error) {
            console.error("ERROR UPDATE PELATIHAN: ", error);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: `Terjadi kesalahan saat memperbarui penilaian.`,
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
                title: 'Berhasil!',
                text: `Status kelulusan peserta telah diupdate.`,
            });
            setUsers((prev: UserPelatihan[]) =>
                prev.map((u: UserPelatihan) =>
                    u.IdUserPelatihan === user.IdUserPelatihan
                        ? { ...u, IsActice: user.IsActice == '{PESERTA}{TELAH LULUS}{Has Passed}' ? '{PESERTA}{TELAH MENGIKUTI}{Has Attended}' : '{PESERTA}{TELAH LULUS}{Has Passed}' }
                        : u
                )
            );
        } catch (error) {
            Toast.fire({
                icon: "error",
                title: 'Gagal!',
                text: `Tidak dapat memproses status kelulusan.`,
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
                title: 'Berhasil!',
                text: `System siap untuk melakukan revisi data.`,
            });
            onSuccess()
        } catch (error) {
            Toast.fire({
                icon: "error",
                title: 'Gagal!',
                text: `Terjadi kendala saat inisiasi revisi.`,
            });
            onSuccess()
        }
    };

    const handleTanggalSertifikatResource = async (user: UserPelatihan) => {
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
                title: "Berhasil!",
                text: `Tanggal revisi sertifikat berhasil ditetapkan.`,
            });
            setTanggalSertifikatRevisi("");
            setLoadingTanggalSertifikatRevisi(false);
            onSuccess()
        } catch {
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Tidak dapat mengubah tanggal sertifikat.",
            });
            setLoadingTanggalSertifikatRevisi(false);
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
                title: 'Berhasil!',
                text: `Data peserta telah divalidasi oleh system.`,
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
                title: 'Gagal!',
                text: `Proses validasi gagal dilakukan.`,
            });
            onSuccess()
        }
    };

    const columns: ColumnDef<UserPelatihan>[] = [
        {
            accessorKey: "index",
            header: () => (
                <div className="flex items-center justify-center gap-2 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">
                    <Hash className="w-3 h-3" />
                    No
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <span className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 tabular-nums border border-slate-100 dark:border-slate-700">
                        {row.index + 1}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "Nama",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] hover:bg-transparent p-0"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <UserIcon className="w-3 h-3" />
                    Profil Peserta
                    <ArrowUpDown className="h-3 w-3 opacity-30" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5 min-w-[200px]">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{row.original.Nama}</span>
                    <span className="text-[10px] text-slate-400 font-bold tracking-widest">REG: {row.original.NoRegistrasi}</span>
                </div>
            ),
        },
        ...(parseInt(pelatihan.StatusPenerbitan) >= 5
            ? [
                {
                    accessorKey: "IsActice",
                    header: () => (
                        <div className="flex flex-col items-center gap-1 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">
                            <Award className="w-3 h-3 text-blue-600" />
                            Status Kelulusan
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group/check">
                                <Checkbox
                                    disabled={row.original.StatusPenandatangan === "Done" || !Cookies.get('Access')?.includes('createPelatihan')}
                                    id={`lulus-${row.id}`}
                                    onCheckedChange={() => handleLulusDataPeserta(row.original)}
                                    checked={row.original.IsActice === "{PESERTA}{TELAH LULUS}{Has Passed}"}
                                    className="w-5 h-5 rounded-md border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all shadow-sm"
                                />
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${row.original.IsActice === "{PESERTA}{TELAH LULUS}{Has Passed}" ? 'text-blue-600' : 'text-slate-400 group-hover/check:text-slate-600'}`}>Lulus</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer group/check">
                                <Checkbox
                                    disabled={row.original.StatusPenandatangan === "Done" || !Cookies.get('Access')?.includes('createPelatihan')}
                                    id={`ikut-${row.id}`}
                                    onCheckedChange={() => handleLulusDataPeserta(row.original)}
                                    checked={row.original.IsActice === "{PESERTA}{TELAH MENGIKUTI}{Has Attended}"}
                                    className="w-5 h-5 rounded-md border-slate-200 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 transition-all shadow-sm"
                                />
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${row.original.IsActice === "{PESERTA}{TELAH MENGIKUTI}{Has Attended}" ? 'text-teal-600' : 'text-slate-400 group-hover/check:text-slate-600'}`}>Hadir</span>
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
                    header: () => (
                        <div className="flex flex-col items-center gap-1 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">
                            <RefreshCw className="w-3 h-3 text-amber-600" />
                            Revisi
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className="flex items-center justify-center">
                            <label className="flex items-center gap-2 cursor-pointer group/check">
                                <Checkbox
                                    disabled={!Cookies.get("Access")?.includes("createPelatihan") || row.original.StatusPenandatangan === "Revisi"}
                                    id={`revisi-${row.id}`}
                                    onCheckedChange={() => {
                                        setSelectedRow(row.original);
                                        setOpenDialog(true);
                                    }}
                                    checked={row.original.StatusPenandatangan === "Revisi"}
                                    className="w-5 h-5 rounded-md border-slate-200 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 transition-all shadow-sm"
                                />
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${row.original.StatusPenandatangan === "Revisi" ? 'text-amber-600' : 'text-slate-400'}`}>Aktif</span>
                            </label>
                        </div>
                    ),
                } as ColumnDef<UserPelatihan>,
            ]
            : []),
        ...(parseInt(pelatihan.StatusPenerbitan) == 0
            ? [
                {
                    accessorKey: "Keterangan",
                    header: () => (
                        <div className="flex flex-col items-center gap-1 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Validitas Data
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className="flex items-center justify-center">
                            <label className="flex items-center gap-2 cursor-pointer group/check">
                                <Checkbox
                                    disabled={row.original.StatusPenandatangan === "Done"}
                                    id={`valid-${row.id}`}
                                    onCheckedChange={() => handleLulusValidPeserta(row.original)}
                                    checked={row.original.Keterangan === "Valid"}
                                    className="w-5 h-5 rounded-md border-slate-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 transition-all shadow-sm"
                                />
                                <Badge className={`text-[10px] font-black uppercase px-2 py-0 border-none bg-transparent ${row.original.Keterangan === "Valid" ? 'text-emerald-600' : 'text-slate-400 uppercase tracking-widest'}`}>
                                    {row.original.Keterangan === "Valid" ? "VALID" : "TIIDAK VALID"}
                                </Badge>
                            </label>
                        </div>
                    ),
                } as ColumnDef<UserPelatihan>,
            ]
            : []),
        ...(pelatihan.StatusPenerbitan == "7D" || pelatihan.StatusPenerbitan == "11" || pelatihan.StatusPenerbitan == "15"
            ? [
                {
                    accessorKey: "sttpl_render",
                    header: () => (
                        <div className="flex flex-col items-center gap-1 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">
                            <TbCertificate className="w-3.5 h-3.5 text-blue-600" />
                            e-STTPL
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className="flex items-center justify-center">
                            {
                                row.original.StatusPenandatangan == "Revisi" && row.original.FileSertifikat == "" ? row.original?.TanggalSertifikat == "-" ?
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedRow(row.original)
                                            setOpenDialogTanggalSertifikatRevisi(true)
                                        }}
                                        className="h-8 flex items-center gap-2 rounded-lg px-4 border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                                    >
                                        <Calendar className="h-3.5 w-3.5" />
                                        Tgl Revisi
                                    </Button> : <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic shrink-0 animate-pulse">Processing...</span> :
                                    row.original.FileSertifikat != "" && (
                                        <Link
                                            target="_blank"
                                            href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${row.original.FileSertifikat}`}
                                            className="group/link flex items-center gap-2 h-9 px-4 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-500/5"
                                        >
                                            <RiVerifiedBadgeFill className="h-4 w-4" />
                                            <span>Lihat e-STTPL</span>
                                        </Link>
                                    )
                            }
                        </div>
                    ),
                } as ColumnDef<UserPelatihan>,
            ]
            : []),
        ...(parseInt(pelatihan.StatusPenerbitan) >= 4 ? [
            {
                accessorKey: "PreTest",
                header: () => (
                    <div className="flex flex-col items-center gap-1 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">
                        Pre-Test
                    </div>
                ),
                cell: ({ row }: { row: any }) => {
                    const user = row.original;
                    return (
                        <div className="flex justify-center items-center gap-2">
                            <span className="text-xs font-black text-slate-700 tabular-nums">{user.PreTest || '0'}</span>
                            <UploadNilaiDialog
                                user={user}
                                defaultPre={user.PreTest || ""}
                                defaultPost={user.PostTest || ""}
                                onSubmit={handleUploadNilaiPeserta}
                                trigger={
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                }
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: "PostTest",
                header: () => (
                    <div className="flex flex-col items-center gap-1 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">
                        Post-Test
                    </div>
                ),
                cell: ({ row }: { row: any }) => {
                    const user = row.original;
                    return (
                        <div className="flex justify-center items-center gap-2">
                            <span className="text-xs font-black text-slate-700 tabular-nums">{user.PostTest || '0'}</span>
                            <UploadNilaiDialog
                                user={user}
                                defaultPre={user.PreTest || ""}
                                defaultPost={user.PostTest || ""}
                                onSubmit={handleUploadNilaiPeserta}
                                trigger={
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                }
                            />
                        </div>
                    );
                },
            },
        ] : []),
        {
            id: "actions",
            header: () => (
                <div className="flex items-center justify-center text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]">
                    Menu
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-9 h-9 rounded-xl border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50 transition-all shadow-sm"
                            >
                                <Info className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <DetailPesertaDialog
                            pesertaId={row.original.IdUsers}
                            userPelatihanId={row.original.IdUserPelatihan}
                        />
                    </AlertDialog>

                    {Cookies.get('Access')?.includes('createPelatihan') && (parseInt(pelatihan?.StatusPenerbitan) < 6 || pelatihan?.StatusPenerbitan == "7" || pelatihan?.StatusPenerbitan == "9") && (
                        <div className="flex items-center gap-2">
                            <EditPesertaAction
                                idPelatihan={row.original.IdPelatihan.toString()}
                                onSuccess={onSuccess}
                                idPeserta={row.original.IdUsers.toString()}
                            />

                            {(pelatihan?.StatusPenerbitan == "0" || pelatihan?.StatusPenerbitan == "1.2" || pelatihan?.StatusPenerbitan == "3" || pelatihan?.StatusPenerbitan == "7" || pelatihan?.StatusPenerbitan == "9") && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={async () => {
                                        const confirmDelete = window.confirm(`⚠️ Apakah Anda yakin ingin menghapus ${row.original.Nama}?`);
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

                                            setUsers((prevData) =>
                                                prevData.filter((item) => item.IdUserPelatihan !== row.original.IdUserPelatihan)
                                            );

                                        } catch (error) {
                                            console.error(error);
                                            Toast.fire({ icon: 'error', title: 'Gagal menghapus peserta' });
                                        }
                                    }}
                                    className="w-9 h-9 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="w-full">
            <div className="overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent px-6">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-16 px-6 align-middle">
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
                        <AnimatePresence mode="popLayout">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row, idx) => (
                                    <motion.tr
                                        key={row.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="group border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-300"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-6 py-4 align-middle">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </motion.tr>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-72 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 animate-pulse">
                                                <Search className="w-10 h-10" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Tidak Ada Data Peserta</p>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Lakukan import peserta melalui dashboard utama.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            {/* Dialogs */}
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-white dark:border-slate-800 rounded-[3rem] p-10 max-w-md shadow-2xl">
                    <AlertDialogHeader className="space-y-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/5">
                            <RefreshCw className="animate-spin-slow" />
                        </div>
                        <AlertDialogTitle className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">Inisiasi Revisi Data?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-slate-500 font-medium leading-relaxed">
                            Dengan mengaktifkan mode revisi pada <span className="text-slate-900 dark:text-white font-black underline decoration-amber-500/30 underline-offset-4">{selectedRow?.Nama}</span>, e-STTPL yang sudah terbit akan dibatalkan/dihapus secara otomatis dari system. Anda dapat mengupdate data peserta dan mengajukan penerbitan ulang.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
                        <AlertDialogCancel className="h-12 flex-1 rounded-2xl border-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50">Batalkan</AlertDialogCancel>
                        <Button
                            onClick={() => {
                                if (selectedRow) {
                                    handleRevisiDataPeserta(selectedRow);
                                    setOpenDialog(false);
                                }
                            }}
                            className="h-12 flex-1 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20"
                        >
                            Konfirmasi Revisi
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={openDialogTanggalSertifikatRevisi} onOpenChange={setOpenDialogTanggalSertifikatRevisi}>
                <DialogContent className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-white dark:border-slate-800 rounded-[3rem] p-10 max-w-md shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/5">
                            <Calendar />
                        </div>
                        <DialogTitle className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">Tetapkan Tanggal Revisi</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 my-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Baru Penandatanganan</label>
                            <input
                                type="date"
                                className="w-full h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                value={tanggalSertifikatRevisi}
                                onChange={(e) => setTanggalSertifikatRevisi(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={() => {
                                if (selectedRow) {
                                    handleTanggalSertifikatResource(selectedRow);
                                    setOpenDialogTanggalSertifikatRevisi(false);
                                }
                            }}
                            disabled={loadingTanggalSertifikatRevisi || tanggalSertifikatRevisi === ""}
                            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 disabled:opacity-50"
                        >
                            {loadingTanggalSertifikatRevisi ? "Menyimpan Perubahan..." : "Update Tanggal Sertifikat"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const DetailPesertaDialog = ({ pesertaId, userPelatihanId }: { pesertaId: number; userPelatihanId: number }) => {
    const [peserta, setPeserta] = React.useState<User | null>(null);
    const [pesertaPelatihan, setPesertaPelatihan] = React.useState<UserPelatihan | null>(null);
    const [loading, setLoading] = React.useState(true);

    const handleFetchDetailPeserta = async () => {
        setLoading(true);
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
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        handleFetchDetailPeserta();
    }, []);

    const InfoRow = ({ icon, label, value, theme = "slate" }: { icon: any; label: string; value?: string; theme?: string }) => {
        const themes: any = {
            slate: "bg-slate-50 dark:bg-slate-800/40 text-slate-500",
            blue: "bg-blue-50 dark:bg-blue-500/5 text-blue-600",
            emerald: "bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600",
        };
        return (
            <div className="flex items-start gap-4 group">
                <div className={`p-2.5 rounded-xl ${themes[theme]} border border-white dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{value || "-"}</p>
                </div>
            </div>
        );
    };

    return (
        <AlertDialogContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border-white dark:border-slate-800 rounded-[3rem] p-0 max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

            <div className="p-8 lg:p-12 border-b border-slate-100 dark:border-slate-800 bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm relative overflow-hidden shrink-0">
                <div className="flex items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/30 font-black">
                            {peserta?.Nama?.charAt(0) || 'P'}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{peserta?.Nama || 'Loading...'}</h2>
                            <div className="flex items-center gap-3">
                                <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none font-black text-[10px] tracking-widest px-3 py-1 uppercase">{peserta?.Nik || 'NIK TIDAK TERSEDIA'}</Badge>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{peserta?.Instansi || 'Masyarakat Umum'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sinkronisasi Data Profil...</p>
                    </div>
                ) : (
                    <>
                        {/* Information Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <div className="space-y-8">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] pb-3 border-b border-slate-100 dark:border-slate-800 w-fit">
                                    <div className="w-2 h-2 rounded-full bg-blue-600" /> Kontak & Domisili
                                </h4>
                                <div className="space-y-6">
                                    <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="No Telepon" value={peserta?.NoTelpon?.toString()} />
                                    <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Alamat" value={peserta?.Alamat} />
                                    <InfoRow icon={<Building className="w-3.5 h-3.5" />} label="Kota / Prov" value={`${peserta?.Kota}, ${peserta?.Provinsi}`} />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] pb-3 border-b border-slate-100 dark:border-slate-800 w-fit">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600" /> Pendidikan & Bio
                                </h4>
                                <div className="space-y-6">
                                    <InfoRow icon={<GraduationCap className="w-3.5 h-3.5" />} label="Pendidikan Terakhir" value={peserta?.PendidikanTerakhir} theme="blue" />
                                    <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Tempat, Tgl Lahir" value={`${peserta?.TempatLahir}, ${peserta?.TanggalLahir}`} />
                                    <InfoRow icon={<UserIcon className="w-3.5 h-3.5" />} label="Jenis Kelamin" value={peserta?.JenisKelamin} />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] pb-3 border-b border-slate-100 dark:border-slate-800 w-fit">
                                    <div className="w-2 h-2 rounded-full bg-emerald-600" /> Status Pelaksana
                                </h4>
                                <div className="space-y-6">
                                    <InfoRow icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Keterangan Verifikasi" value={pesertaPelatihan?.Keterangan} theme="emerald" />
                                    <InfoRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Metode Bayar" value={pesertaPelatihan?.MetodoPembayaran} />
                                    <InfoRow icon={<Award className="w-3.5 h-3.5" />} label="Total Tagihan" value={formatToRupiah(parseInt(pesertaPelatihan?.TotalBayar || '0'))} />
                                </div>
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="space-y-8 bg-slate-50 dark:bg-slate-950/30 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                            <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em]">Vault Dokumen Digital</h4>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {peserta?.Foto && peserta.Foto !== "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/profile/fotoProfile/" ? (
                                    <Link target="_blank" href={peserta.Foto} className="group/doc relative flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-all shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center text-xl">
                                                <Download />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Pas Foto Resmi</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Format Gambar / PDF</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover/doc:translate-x-1 group-hover/doc:text-blue-600 transition-all" />
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-4 p-6 bg-slate-100/50 dark:bg-slate-800/20 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <X />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto Tidak Tersedia</p>
                                    </div>
                                )}

                                <Link target="_blank" href={peserta?.Ktp || '#'} className="group/doc relative flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl">
                                            <Download />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Scan Kartu Identitas</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Identitas NIK Terverifikasi</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover/doc:translate-x-1 group-hover/doc:text-indigo-600 transition-all" />
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <AlertDialogFooter className="p-8 lg:p-10 shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <AlertDialogCancel className="w-full h-14 rounded-2xl border-none bg-slate-100 text-slate-600 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 transition-all">Tutup Jendela Informasi</AlertDialogCancel>
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
        try {
            await onSubmit(user?.IdUserPelatihan, pre, post);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-white dark:border-slate-800 rounded-[3rem] p-10 max-w-md shadow-2xl">
                <DialogHeader className="space-y-4">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/5 transition-transform hover:rotate-6">
                        <Edit3 />
                    </div>
                    <DialogTitle className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">Input Penilaian Academic</DialogTitle>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.Nama}</p>
                </DialogHeader>

                <div className="flex flex-col gap-6 my-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor Pre-Test (Awal)</label>
                        <input
                            type="number"
                            value={pre}
                            onChange={(e) => setPre(e.target.value)}
                            className="w-full h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="00.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor Post-Test (Akhir)</label>
                        <input
                            type="number"
                            value={post}
                            onChange={(e) => setPost(e.target.value)}
                            className="w-full h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="00.00"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 disabled:opacity-50"
                    >
                        {loading ? "Menyimpan Data..." : "Simpan Penilaian"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserPelatihanTable;
