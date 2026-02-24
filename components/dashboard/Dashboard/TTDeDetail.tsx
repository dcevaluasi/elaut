"use client";

import React, { useRef } from "react";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import Cookies from "js-cookie";
import { TbCalendar, TbPencilCheck, TbExternalLink } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import DialogSertifikatPelatihan, { DialogSertifikatHandle } from "@/components/sertifikat/dialogSertifikatPelatihan";
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import { getDateInIndonesianFormat } from "@/utils/time";
import Toast from "@/commons/Toast";
import { HiOutlineEyeOff } from "react-icons/hi";
import { HiOutlineEye } from "react-icons/hi2";
import { countUserWithCertificate, countUserWithDrafCertificate, countUserWithDraftCertificate, countUserWithTanggalSertifikat } from "@/utils/counter";

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import Link from "next/link";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { MdLock, MdOutlineHistoryEdu } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, Key, ShieldCheck, FileCheck, CheckCircle2, AlertCircle, ChevronRight, Hash, User as UserIcon, FileText } from "lucide-react";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: () => void
}

const TTDeDetail: React.FC<Props> = ({ data, fetchData }) => {
    const [open, setOpen] = React.useState(false);
    const [tanggalSertifikat, setTanggalSertifikat] = React.useState("");
    const [loadingTanggal, setLoadingTanggal] = React.useState(false);
    const [passphrase, setPassphrase] = React.useState("");
    const [isShowPassphrase, setIsShowPassphrase] = React.useState(false);
    const [isSigning, setIsSigning] = React.useState(false);
    const [statusTanggalSertifikat, setStatusTanggalSertifikat] = React.useState(false)

    const [progress, setProgress] = React.useState<number>(0);
    const [counter, setCounter] = React.useState<number>(0);
    const [isUploading, setIsUploading] = React.useState<boolean>(false);

    const [drafCount, setDrafCount] = React.useState<number>(0);
    const [certifiedCount, setCertifiedCount] = React.useState<number>(0);
    const [tanggalCount, setTanggalCount] = React.useState<number>(0);

    const [searchTerm, setSearchTerm] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 100;

    React.useEffect(() => {
        setDrafCount(countUserWithDrafCertificate(data.UserPelatihan));
        setCertifiedCount(countUserWithCertificate(data.UserPelatihan));
        setTanggalCount(countUserWithTanggalSertifikat(data.UserPelatihan));
    }, [data.UserPelatihan]);

    const filteredUsers = React.useMemo(() => {
        return data.UserPelatihan.filter(user =>
            user.Nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.NoRegistrasi.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data.UserPelatihan, searchTerm]);

    const paginatedUsers = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Reset page when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const isCurrentPageReady = React.useMemo(() => {
        return paginatedUsers.every(user => user.FileSertifikat && user.FileSertifikat !== "");
    }, [paginatedUsers]);

    const drafCountInPage = React.useMemo(() => countUserWithDrafCertificate(paginatedUsers), [paginatedUsers]);
    const certifiedCountInPage = React.useMemo(() => countUserWithCertificate(paginatedUsers), [paginatedUsers]);

    const refs = useRef<React.RefObject<DialogSertifikatHandle>[]>([]);

    if (refs.current.length !== data.UserPelatihan.length) {
        refs.current = data.UserPelatihan.map((_, i) => refs.current[i] ?? React.createRef<DialogSertifikatHandle>());
    }

    const handleUploadAll = async () => {
        setIsUploading(true);
        setProgress(0);
        setCounter(0);

        const toUpload = paginatedUsers
            .map(user => {
                const originalIndex = data.UserPelatihan.findIndex(u => u.IdUserPelatihan === user.IdUserPelatihan);
                return { ref: refs.current[originalIndex], index: originalIndex, userPel: user };
            })
            .filter(({ userPel }) => !userPel.FileSertifikat || userPel.FileSertifikat === "");

        if (toUpload.length === 0) {
            setOpen(true);
            setIsUploading(false);
            return;
        }

        let completed = 0;
        const total = toUpload.length;
        const MAX_CONCURRENCY = 6; // Nilai optimal untuk html2canvas agar tidak mencekik main thread
        const pool = [...toUpload];

        let lastUpdate = Date.now();
        const executeWorker = async (workerIndex: number) => {
            // Stagger awal worker agar tidak memproses barengan di milidetik yang sama
            await new Promise(resolve => setTimeout(resolve, workerIndex * 300));

            while (pool.length > 0) {
                const item = pool.shift();
                if (!item) break;

                try {
                    await item.ref.current?.uploadPdf?.();
                } catch (err) {
                    console.error("Upload failed for index", item.index, err);
                } finally {
                    completed++;
                    // Throttle ganti ke 50ms agar progress bar lebih smooth
                    const now = Date.now();
                    if (now - lastUpdate > 50 || completed === total) {
                        setProgress((completed / total) * 100);
                        setCounter(completed);
                        lastUpdate = now;
                    }
                }
            }
        };

        const workers = Array(Math.min(MAX_CONCURRENCY, total))
            .fill(null)
            .map((_, i) => executeWorker(i));

        await Promise.all(workers);

        fetchData();
        setOpen(true);
        setIsUploading(false);
    };

    const handleTanggalSertifikat = async () => {
        const dataUserPelatihan = data?.UserPelatihan ?? [];
        setLoadingTanggal(true);

        try {
            const BATCH_SIZE = 25;
            for (let i = 0; i < dataUserPelatihan.length; i += BATCH_SIZE) {
                const batch = dataUserPelatihan.slice(i, i + BATCH_SIZE);
                await Promise.all(
                    batch.map(async (user) => {
                        const formData = new FormData();
                        formData.append(
                            "TanggalSertifikat",
                            getDateInIndonesianFormat(tanggalSertifikat)
                        );

                        await axios.put(
                            `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
                            formData,
                            { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
                        );
                    })
                );
            }

            Toast.fire({
                icon: "success",
                title: "Yeayyy!",
                text: `Tanggal penandatanganan berhasil ditentukan untuk STTPL.`,
            });
            setTanggalSertifikat("");
            setLoadingTanggal(false);
            setStatusTanggalSertifikat(true)
            setOpen(true)
            fetchData()
        } catch {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: "Gagal menyematkan tanggal penandatanganan.",
            });
            setLoadingTanggal(false);
        }
    };

    const handleTTDe = async () => {
        setIsSigning(true);
        const status = data?.StatusPenerbitan == "7B" ? "7D" : data?.StatusPenerbitan == "10" ? "11" : "15"

        if (!passphrase) {
            Toast.fire({
                icon: "error",
                title: "Tidak ada passphrase",
                text: "Harap masukkan passphrase!",
            });
            setIsSigning(false);
            return;
        }

        try {
            await axios.post(
                `${elautBaseUrl}/lemdik/sendSertifikatTtde`,
                {
                    idPelatihan: data?.IdPelatihan.toString(),
                    kodeParafrase: passphrase,
                    nik: Cookies.get("NIK"),
                },
                { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
            );

            await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihan?id=${data?.IdPelatihan}`,
                {
                    StatusPenerbitan: status
                },
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            await handleAddHistoryTrainingInExisting(
                data,
                "Telah menandatangani STTPL",
                Cookies.get("Role"),
                `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Sertifikat berhasil ditandatangani secara elektronik.",
            });

            setPassphrase("");
            setIsSigning(false);
            fetchData();
            setOpen(false);
        } catch {
            Toast.fire({
                icon: "error",
                title: "Gagal TTDe",
                text: "Terjadi kesalahan saat melakukan TTDe.",
            });
            setIsSigning(false);
        }
    };

    interface MetricCardProps {
        icon: React.ElementType;
        label: string;
        value: string;
        current?: number;
        total?: number;
        color?: "blue" | "emerald" | "amber";
    }

    const MetricCard = ({ icon: Icon, label, value, current, total, color = "blue" }: MetricCardProps) => {
        const colors: any = {
            blue: "from-blue-600 to-indigo-700 shadow-blue-500/20 text-white",
            emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/20 text-white",
            amber: "from-amber-500 to-orange-600 shadow-amber-500/20 text-white",
        };
        return (
            <div className="relative group">
                <div className={`p-6 rounded-[2rem] bg-gradient-to-br ${colors[color]} shadow-xl flex flex-col gap-4 overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        {total && (
                            <Badge className="bg-white/20 border-none text-white font-black text-[10px] tracking-widest px-2 py-0.5 rounded-full">
                                {Math.round((current! / total) * 100)}%
                            </Badge>
                        )}
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none">{label}</p>
                        <p className="text-2xl font-black tracking-tight">{value}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10">
            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center text-xl shadow-inner">
                        <MdOutlineHistoryEdu />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">KONTROL PENANDATANGAN</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Kelola Validasi & Tanda Tangan Digital</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            {tanggalCount === 0 && (
                                <Button
                                    variant="outline"
                                    className="h-12 flex items-center gap-2 rounded-2xl px-6 border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-sm group"
                                >
                                    <TbCalendar className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    <span>TETAPKAN TANGGAL TTDe</span>
                                </Button>
                            )}
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-white dark:border-slate-800 rounded-[3rem] p-10 max-w-md shadow-2xl">
                            <AlertDialogHeader className="space-y-4">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/5">
                                    <TbCalendar />
                                </div>
                                <AlertDialogTitle className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">Setting Jadwal Penandatanganan</AlertDialogTitle>
                                <AlertDialogDescription className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-widest">
                                    Pastikan tanggal yang dipilih sesuai dengan hari pelaksanaan tanda tangan digital untuk menjaga integritas waktu dokumen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="space-y-6 my-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Tanggal Sertifikat</label>
                                    <input
                                        type="date"
                                        className="w-full h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        value={tanggalSertifikat}
                                        onChange={(e) => setTanggalSertifikat(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleTanggalSertifikat}
                                    disabled={loadingTanggal || !tanggalSertifikat}
                                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {loadingTanggal ? "Memproses Data..." : "Simpan & Terapkan Tanggal"}
                                </Button>
                            </div>
                            <AlertDialogCancel className="w-full h-12 rounded-2xl border-none bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px]">Tutup Jendela</AlertDialogCancel>
                        </AlertDialogContent>
                    </AlertDialog>

                    {(Cookies.get('Role')?.includes(data?.TtdSertifikat) && (data?.StatusPenerbitan == "7B" || data?.StatusPenerbitan == "10" || data?.StatusPenerbitan == "14") || data?.IsRevisi == "Active") && (
                        <Button
                            onClick={() => {
                                setOpen(true);
                                if (!isCurrentPageReady) {
                                    handleUploadAll();
                                }
                            }}
                            className="h-12 flex items-center gap-2 rounded-2xl px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all group"
                        >
                            <TbPencilCheck className="h-5 w-5 group-hover:-rotate-12 transition-transform" />
                            <span>MULAI TANDA TANGAN (TTDe)</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard icon={Hash} label="Target Penandatanganan" value={`${data?.UserPelatihan.length} Peserta`} />
                <MetricCard
                    icon={FileCheck}
                    label="Draft Sertifikat Siap"
                    value={`${drafCount}/${data?.UserPelatihan.length}`}
                    current={drafCount}
                    total={data?.UserPelatihan.length}
                    color="amber"
                />
                <MetricCard
                    icon={ShieldCheck}
                    label="Tuntas Di-TTDe"
                    value={`${certifiedCount}/${data?.UserPelatihan.length}`}
                    current={certifiedCount}
                    total={data?.UserPelatihan.length}
                    color="emerald"
                />
            </div>

            {/* Participant List */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 w-fit">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em]">DAFTAR VERIFIKASI SERTIFIKAT</h4>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sertifikat Siap:</span>
                            <span className="text-[10px] font-black text-amber-600">{drafCountInPage}/{paginatedUsers.length}</span>
                            <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-700 mx-1" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tuntas TTDe:</span>
                            <span className="text-[10px] font-black text-emerald-600">{certifiedCountInPage}/{paginatedUsers.length}</span>
                        </div>

                        <div className="relative group max-w-xs w-full">
                            <input
                                type="text"
                                placeholder="CARI NAMA..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 pl-10 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
                        <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">
                            Menampilkan <span className="text-blue-600">{paginatedUsers.length}</span> dari <span className="text-blue-600">{filteredUsers.length}</span> Peserta
                        </p>
                        <div className="flex items-center gap-2 relative z-50">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1 || isUploading || isSigning}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="h-8 px-3 rounded-lg border-slate-200 text-[9px] font-black uppercase tracking-widest disabled:opacity-50 cursor-pointer bg-white"
                            >
                                SBLM
                            </Button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    if (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        Math.abs(pageNum - currentPage) <= 1
                                    ) {
                                        return (
                                            <button
                                                key={idx}
                                                disabled={isUploading || isSigning}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all cursor-pointer ${currentPage === pageNum
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                    : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 disabled:opacity-50"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        Math.abs(pageNum - currentPage) === 2
                                    ) {
                                        return <span key={idx} className="text-slate-300 text-[10px]">..</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages || isUploading || isSigning}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="h-8 px-3 rounded-lg border-slate-200 text-[9px] font-black uppercase tracking-widest disabled:opacity-50 cursor-pointer bg-white"
                            >
                                BRKT
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                    {paginatedUsers.length > 0 ? paginatedUsers.map((item, i) => {
                        const originalIndex = data.UserPelatihan.findIndex(u => u.IdUserPelatihan === item.IdUserPelatihan);
                        return (
                            <div key={item.IdUserPelatihan ?? i} className="group p-5 rounded-[1.5rem] bg-white border border-slate-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-md flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
                                            {originalIndex !== -1 ? originalIndex + 1 : i + 1}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-black text-slate-900 truncate uppercase leading-none mb-1">{item.Nama}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.NoRegistrasi}</p>
                                        </div>
                                    </div>
                                    {item.FileSertifikat?.includes('signed') ? (
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                {item.FileSertifikat?.includes('signed') && (
                                    <Link
                                        target="_blank"
                                        href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${item.FileSertifikat}`}
                                        className="flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-50/50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group/btn"
                                    >
                                        <RiVerifiedBadgeFill className="h-4 w-4" />
                                        <span>LIHAT e-STTPL</span>
                                        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                )}

                                {item.FileSertifikat && item.StatusPenandatangan == "Spesimen" ? (
                                    <Link
                                        target="_blank"
                                        href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-raw/${item.FileSertifikat}`}
                                        className="flex items-center justify-center gap-2 h-10 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all group/preview border border-slate-100"
                                    >
                                        <FileText className="h-4 w-4 text-slate-400 group-hover/preview:text-white" />
                                        <span>Pratinjau Dokumen</span>
                                        <TbExternalLink className="w-3.5 h-3.5 opacity-50" />
                                    </Link>
                                ) : (
                                    <DialogSertifikatPelatihan
                                        ref={refs.current[originalIndex]}
                                        pelatihan={data}
                                        userPelatihan={item}
                                        handleFetchingData={fetchData}
                                        isPrint={false}
                                    />
                                )}
                            </div>
                        );
                    }) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tidak Ada Peserta Ditemukan</p>
                        </div>
                    )}
                </div>

            </div>

            {/* signing Modal */}
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-white dark:border-slate-800 rounded-[3rem] p-0 max-w-lg shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-10 pb-6 space-y-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/5 transition-transform hover:rotate-6">
                            <TbPencilCheck />
                        </div>
                        <AlertDialogTitle className="font-black text-3xl text-slate-900 dark:text-white tracking-tight leading-tight">Otentikasi Tanda Tangan Digital</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-widest">
                            {tanggalCount === 0 ? "Prasyarat Belum Terpenuhi" : "Penyematan Segel Elektronik Bersertifikat"}
                        </AlertDialogDescription>
                    </div>

                    <div className="p-10 pt-0 flex-1 overflow-y-auto min-h-[200px] flex flex-col justify-center">
                        {tanggalCount === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-amber-50 rounded-[2rem] border border-amber-100 text-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-amber-500 text-2xl shadow-sm">
                                    <AlertCircle />
                                </div>
                                <p className="text-xs font-bold text-amber-800 uppercase tracking-widest leading-relaxed">
                                    Harap untuk mengatur tanggal penerbitan terlebih dahulu sebelum memulai proses TTDe.
                                </p>
                                <Button onClick={() => setOpen(false)} className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] tracking-widest h-10 px-6 rounded-xl uppercase">DIPAHAMI</Button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {(isUploading || !isCurrentPageReady) ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-blue-600">Generating Blast...</span>
                                            <span className="text-slate-400">{Math.round(progress)}% ({counter}/{paginatedUsers.length})</span>
                                        </div>
                                        <Progress value={progress} className="h-2 rounded-full bg-slate-100 fill-blue-600" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center italic">Memproses {paginatedUsers.length} data pada halaman ini...</p>
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Key className="w-3 h-3" /> Masukkan Passphrase Anda
                                            </label>
                                            <div className="relative">
                                                <input
                                                    disabled={isSigning}
                                                    type={isShowPassphrase ? "text" : "password"}
                                                    className="w-full h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                    required
                                                    autoComplete="new-password"
                                                    value={passphrase}
                                                    onChange={(e) => setPassphrase(e.target.value)}
                                                    placeholder="••••••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setIsShowPassphrase(!isShowPassphrase)}
                                                    className="absolute right-4 top-4 text-slate-400 hover:text-blue-600 transition-colors"
                                                >
                                                    {isShowPassphrase ? <HiOutlineEyeOff className="h-6 w-6" /> : <HiOutlineEye className="h-6 w-6" />}
                                                </button>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleTTDe}
                                            disabled={isSigning || !passphrase}
                                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 disabled:opacity-50"
                                        >
                                            {isSigning ? "Memproses Tanda Tangan Digital..." : "OTENTIKASI & TANDA TANGAN (TTDe)"}
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-10 pt-0 shrink-0">
                        <AlertDialogCancel
                            disabled={isSigning || isUploading}
                            className="w-full h-12 rounded-2xl border-none bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
                        >
                            BATALKAN PROSES
                        </AlertDialogCancel>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};

export default TTDeDetail;
