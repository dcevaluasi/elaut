"use client"

import { useParams, usePathname } from "next/navigation"
import { Loader2, BookOpen, Plus, CheckCircle, XCircle, Calendar } from "lucide-react"
import { useFetchDataMateriPelatihanMasyarakatById } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat"
import React, { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fileModuleBaseUrl, moduleBaseUrl } from "@/constants/urls"
import { FiEdit2, FiFolder, FiTrash2 } from "react-icons/fi"
import { BahanTayang, ModulPelatihan } from "@/types/module"
import { FaRegFileLines, FaRegFolderOpen } from "react-icons/fa6"
import JSZip from "jszip"
import { saveAs } from 'file-saver'
import { TbArrowLeft } from "react-icons/tb"
import { truncateText } from "@/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Cookies from "js-cookie"
import { generateJPMateri } from "@/utils/module"
import { findNameUnitKerjaById } from "@/utils/unitkerja"
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja"
import { Badge } from "@/components/ui/badge"

export default function DetailModulPelatihan() {
    const pathname = usePathname();
    const isBahanAjar = pathname.includes("bahan-ajar");
    const label = isBahanAjar ? "Bahan Ajar" : "Modul";

    const params = useParams();
    const id = Number(params?.id);
    const { data, loading, error, refetch } =
        useFetchDataMateriPelatihanMasyarakatById(id);
    const { unitKerjas, loading: loadingUnitKerja, error: errorUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja()
    useEffect(() => {
        fetchUnitKerjaData()
    }, [fetchUnitKerjaData])


    const [jenis, setJenis] = useState("")

    const [open, setOpen] = useState(false);
    const [openBahanAjar, setOpenBahanAjar] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [idModul, setIdModul] = useState("")
    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [jamPelajaran, setJamPelajaran] = useState("");
    const [jamTeori, setJamTeori] = useState("");
    const [jamPraktek, setJamPraktek] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [produsen, setProdusen] = useState("")
    const [linkVideo, setLinkVideo] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editModul, setEditModul] = useState<ModulPelatihan | null>(null);
    const [editNama, setEditNama] = useState("");
    const [editJamPelajaran, setEditJamPelajaran] = useState("");
    const [editDeskripsi, setEditDeskripsi] = useState("");
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editFileOld, setEditFileOld] = useState<string | null>(null)

    const [downloading, setDownloading] = useState(false);
    useEffect(() => {
        setJamPelajaran(`{${jamTeori}}{${jamPraktek}}`);
        setEditJamPelajaran(`{${jamTeori}}{${jamPraktek}}`);
    }, [jamTeori, jamPraktek]);

    const materi = data;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const totalPages = materi
        ? Math.ceil(materi.ModulPelatihan.length / itemsPerPage)
        : 1;

    const sortedAndPaginatedData = useMemo(() => {
        if (!materi?.ModulPelatihan) return [];
        return [...materi.ModulPelatihan]
            .sort((a, b) => {
                const numA = parseInt(a.NamaModulPelatihan.split(".")[0], 10) || 0;
                const numB = parseInt(b.NamaModulPelatihan.split(".")[0], 10) || 0;
                return numA - numB;
            })
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [materi, currentPage]);

    /**
     * Add new module features
     */
    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nama) return

        const formData = new FormData()
        if (file) formData.append("file_bahan_tayang", file)
        formData.append("NamaModulPelatihan", nama)
        formData.append("DeskripsiModulPelatihan", deskripsi)
        formData.append("IdMateriPelatihan", id.toString())
        formData.append("JamPelajaran", jamPelajaran)

        try {
            setSubmitting(true)
            await axios.post(`${moduleBaseUrl}/modul-pelatihan/createModulPelatihan`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            alert("✅ materi berhasil ditambahkan!")
            setOpen(false)
            setFile(null)
            setNama("")
            setDeskripsi("")
            setJamPelajaran("")
            setJamTeori("")
            setJamPraktek("")
            refetch()
        } catch (err) {
            console.error(err)
            alert("❌ Gagal menambahkan modul, harap ulangi kembali!")
        } finally {
            setSubmitting(false)
        }
    }

    /**
     * Update module features
     */
    // Edit modul states

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editNama) return

        const formData = new FormData()
        if (editFile) {
            formData.append("file_bahan_tayang", editFile)
        }
        formData.append("NamaModulPelatihan", editNama)
        formData.append("DeskripsiModulPelatihan", editDeskripsi)
        formData.append("IdMateriPelatihan", id.toString())
        formData.append("JamPelajaran", editJamPelajaran)

        try {
            setEditSubmitting(true)
            await axios.put(`${moduleBaseUrl}/modul-pelatihan/updateModulPelatihan?id=${editModul?.IdModulPelatihan}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            alert("✅ Modul berhasil diperbarui!")
            setEditOpen(false)
            setEditFile(null)
            setEditModul(null)
            setJamTeori("")
            setJamPraktek("")
            setEditJamPelajaran("")
            refetch()
        } catch (err) {
            console.error(err)
            alert("❌ Gagal memperbarui modul")
        } finally {
            setEditSubmitting(false)
        }
    }

    /**
     * Download modules as zip features
     */
    const handleDownloadAll = async () => {
        if (!materi || !materi.ModulPelatihan) return;

        setDownloading(true);

        const zip = new JSZip();

        for (const modul of materi.ModulPelatihan) {
            if (modul.FileModule) {
                const fileUrl = `${fileModuleBaseUrl}/${modul.FileModule}`;

                try {
                    const response = await fetch(fileUrl);
                    if (!response.ok) throw new Error(`Gagal download ${modul.FileModule}`);
                    const arrayBuffer = await response.arrayBuffer();

                    zip.file(modul.FileModule, arrayBuffer);
                } catch (error) {
                    console.error(`Gagal download ${modul.FileModule}`, error);
                }
            }
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${materi.NamaMateriPelatihan}.zip`);

        setDownloading(false);
    };

    const handleCreateBahanAjar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nama) return

        const formData = new FormData()
        if (file) formData.append("file_bahan_tayang", file)
        if (linkVideo != "") formData.append("LinkVideo", linkVideo)
        formData.append("NamaBahanTayang", nama)
        formData.append("DeskripsiBahanTayang", deskripsi)
        formData.append("IdModulPelatihan", idModul)
        formData.append("creator", produsen)

        try {
            setSubmitting(true)
            const response = await axios.post(`${moduleBaseUrl}/bahan-tayang/createBahanTayang`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            alert("✅ bahan lainnya berhasil ditambahkan!")
            setOpenBahanAjar(false)
            setFile(null)
            setNama("")
            setDeskripsi("")
            setIdModul("")
            setProdusen("")
            setLinkVideo("")
            setJenis("")
            refetch()
            console.log({ response })
        } catch (err) {
            console.error(err)
            alert("❌ Gagal menambahkan bahan lainnya")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
            </div>
        )
    }

    if (error) {
        return <div className="text-center text-red-500 py-10 font-medium">{error}</div>
    }

    if (!data) {
        return <div className="text-center text-gray-500 py-10 font-medium">Materi tidak ditemukan.</div>
    }



    return (
        <section className="flex-1 flex flex-col gap-6 pb-12">
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 shadow-sm group">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20 transform group-hover:scale-105 transition-all duration-500">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                                {materi?.NamaMateriPelatihan}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                {materi?.BidangMateriPelatihan && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Rumpun: <span className="text-slate-600">{materi?.BidangMateriPelatihan}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Produsen: <span className="text-slate-600">{findNameUnitKerjaById(unitKerjas, materi?.DeskripsiMateriPelatihan).name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Unggah: <span className="text-slate-600">{materi?.CreateAt}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                        <Button
                            variant="outline"
                            onClick={() =>
                                (window.location.href = isBahanAjar ? `/admin/lemdiklat/master/bahan-ajar` : `/admin/lemdiklat/master/modul`)
                            }
                            className="h-10 px-4 gap-2 border-slate-200 bg-white text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <TbArrowLeft className="w-4 h-4" />
                            KEMBALI
                        </Button>

                        {(
                            (materi?.BerlakuSampai === "2" && !Cookies.get("Access")?.includes("superAdmin")) ||
                            ((materi?.BerlakuSampai === "1" || materi?.BerlakuSampai === "2") && Cookies.get("Access")?.includes("superAdmin"))
                        ) && (
                                <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="h-10 px-5 gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all">
                                            <Plus className="w-4 h-4" /> TAMBAH MATERI {label.toUpperCase()}
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Tambah Materi {label} Pelatihan</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Nama Materi {label}</Label>
                                                <Input
                                                    value={nama}
                                                    onChange={(e) => setNama(e.target.value)}
                                                    placeholder={`Masukkan nama materi ${label}`}
                                                    required
                                                />
                                                <p className="text-xs text-gray-600">* Format : 1. Pengenalan Tugas Pokok dan Fungsi JFT</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Deskripsi {label}</Label>
                                                <Textarea
                                                    value={deskripsi}
                                                    onChange={(e) => setDeskripsi(e.target.value)}
                                                    placeholder={`Masukkan deskripsi ${label}`}
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <div className="space-y-2">
                                                    <Label>Jam Teori</Label>
                                                    <Input
                                                        type="text"
                                                        value={jamTeori}
                                                        onChange={(e) => setJamTeori(e.target.value)}
                                                        placeholder="Masukkan jam teori"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Jam Praktek</Label>
                                                    <Input
                                                        type="text"
                                                        value={jamPraktek}
                                                        onChange={(e) => setJamPraktek(e.target.value)}
                                                        placeholder="Masukkan jam praktek"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="font-semibold text-gray-700">Upload File {label}</Label>
                                                {!file && <div className="flex items-center justify-center w-full">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md text-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="w-10 h-10 text-blue-500 mb-2"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M12 4v16m8-8H4"
                                                            />
                                                        </svg>
                                                        <span className="text-sm text-gray-600">
                                                            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                                                        </span>
                                                        <span className="text-xs text-gray-400 mt-1">PDF, PPT, DOC (max. 10MB)</span>
                                                        <Input
                                                            id="file-upload"
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => setFile(e.target.files?.[0]!)}
                                                            required
                                                        />
                                                    </label>
                                                </div>}


                                                {/* ✅ File selected indicator */}
                                                {file && (
                                                    <div className="flex items-center gap-2 mt-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                                                        <CheckCircle className="w-5 h-5" />
                                                        <span>{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFile(null)}
                                                            className="ml-auto text-red-500 hover:text-red-600"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full rounded-md py-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                ) : (
                                                    "Submit"
                                                )}
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        {materi?.ModulPelatihan.length !== 0 && (
                            <Button
                                onClick={handleDownloadAll}
                                className="h-10 px-5 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
                                disabled={downloading}
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" /> SEDANG MENGUNDUH...
                                    </>
                                ) : (
                                    <>
                                        <FaRegFolderOpen className="w-4 h-4" /> UNDUH SEMUA {label.toUpperCase()}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Edit Modul Dialog */}
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Edit {label} Pelatihan</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nama {label}</Label>
                                    <Input
                                        value={editNama}
                                        onChange={(e) => setEditNama(e.target.value)}
                                        placeholder={`Masukkan nama ${label}`}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Deskripsi {label}</Label>
                                    <Textarea
                                        value={editDeskripsi}
                                        onChange={(e) => setEditDeskripsi(e.target.value)}
                                        placeholder={`Masukkan deskripsi ${label}`}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="space-y-2">
                                        <Label>Jam Teori</Label>
                                        <Input
                                            type="text"
                                            value={jamTeori}
                                            onChange={(e) => setJamTeori(e.target.value)}
                                            placeholder="Masukkan jam teori"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Jam Praktek</Label>
                                        <Input
                                            type="text"
                                            value={jamPraktek}
                                            onChange={(e) => setJamPraktek(e.target.value)}
                                            placeholder="Masukkan jam praktek"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-gray-700">Upload File {label}</Label>

                                    {/* Show old file if no new file is selected */}
                                    {editFileOld && editModul?.FileModule ? (
                                        <div className="flex items-center gap-2 mt-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                                            <FiFolder className="w-5 h-5" />
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${editModul?.FileModule}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline truncate max-w-[200px]"  // prevent overflow long file names
                                            >
                                                {editModul?.FileModule}
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => setEditFileOld(null)}
                                                className="ml-auto text-red-500 hover:text-red-600"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Custom upload zone */}
                                            {!editFile && (
                                                <div className="flex items-center justify-center w-full">
                                                    <label
                                                        htmlFor="edit-file-upload"
                                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md text-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="w-10 h-10 text-amber-500 mb-2"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        <span className="text-sm text-gray-600">
                                                            <span className="font-medium text-amber-600">Click to upload</span> or drag & drop
                                                        </span>
                                                        <span className="text-xs text-gray-400 mt-1">PDF, PPT, DOC (max. 10MB)</span>
                                                        <Input
                                                            id="edit-file-upload"
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                                                        />
                                                    </label>
                                                </div>
                                            )}

                                            {/* ✅ Show new file selected */}
                                            {editFile && (
                                                <div className="flex items-center gap-2 mt-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span className="truncate max-w-[280px]">{editFile.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditFile(null)}
                                                        className="ml-auto text-red-500 hover:text-red-600"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>


                                <Button
                                    type="submit"
                                    className="w-full rounded-md py-2 bg-amber-500 hover:bg-amber-600 text-white"
                                    disabled={editSubmitting}
                                >
                                    {editSubmitting ? (
                                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                    ) : (
                                        "Update"
                                    )}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>


            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="w-16 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">No</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Materi</th>
                                <th className="w-32 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">JP Teori</th>
                                <th className="w-32 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">JP Praktek</th>
                                <th className="w-48 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unggah Pada</th>
                                <th className="w-80 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedAndPaginatedData.map((row: ModulPelatihan, index: number) => {
                                const theory_jp = generateJPMateri(row.JamPelajaran || "").theory
                                const practice_jp = generateJPMateri(row.JamPelajaran || "").practice
                                return (
                                    <React.Fragment key={row.IdModulPelatihan}>
                                        <tr className="hover:bg-slate-50/50 transition-colors group/row">
                                            <td className="px-6 py-5 text-center text-xs font-bold text-slate-400">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[12px] font-black text-slate-700 leading-tight group-hover/row:text-blue-600 transition-colors">
                                                        {row.NamaModulPelatihan}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-400 line-clamp-1 italic">
                                                        {row.DeskripsiModulPelatihan ? truncateText(row.DeskripsiModulPelatihan, 60, "...") : 'Tidak ada deskripsi'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-black px-2 py-0.5 rounded-lg">
                                                    {theory_jp}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 text-[10px] font-black px-2 py-0.5 rounded-lg">
                                                    {practice_jp}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                                    <Calendar className="w-3 h-3 text-slate-300" />
                                                    {row.CreateAt}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {row.FileModule && (
                                                        <>
                                                            <a
                                                                href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row.FileModule}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="h-8 w-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                                title="Lihat Berkas"
                                                            >
                                                                <FaRegFileLines className="w-3.5 h-3.5" />
                                                            </a>
                                                            <button
                                                                onClick={() =>
                                                                    setExpandedRow(expandedRow === row.IdModulPelatihan ? null : row.IdModulPelatihan)
                                                                }
                                                                className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all shadow-sm ${expandedRow === row.IdModulPelatihan ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white"}`}
                                                                title="Bahan Lainnya"
                                                            >
                                                                <FiFolder className="w-3.5 h-3.5" />
                                                            </button>

                                                            {(
                                                                (materi?.BerlakuSampai === "2" && !Cookies.get("Access")?.includes("superAdmin")) ||
                                                                ((materi?.BerlakuSampai === "1" || materi?.BerlakuSampai === "2") && Cookies.get("Access")?.includes("superAdmin"))
                                                            ) && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditModul(row);
                                                                                setEditNama(row.NamaModulPelatihan);
                                                                                setEditDeskripsi(row.DeskripsiModulPelatihan || "");
                                                                                const jp = generateJPMateri(row.JamPelajaran || "");
                                                                                setJamTeori(jp.theory);
                                                                                setJamPraktek(jp.practice);
                                                                                setEditFile(null);
                                                                                setEditFileOld(row.FileModule);
                                                                                setEditOpen(true);
                                                                            }}
                                                                            className="h-8 w-8 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-600 hover:text-white transition-all shadow-sm"
                                                                            title="Edit"
                                                                        >
                                                                            <FiEdit2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                const confirmDelete = window.confirm("⚠️ Apakah Anda yakin ingin menghapus materi ini?");
                                                                                if (!confirmDelete) return;

                                                                                try {
                                                                                    const res = await fetch(
                                                                                        `${moduleBaseUrl}/modul-pelatihan/deleteModulPelatihan?id=${row.IdModulPelatihan}`,
                                                                                        { method: "DELETE" }
                                                                                    );
                                                                                    if (!res.ok) throw new Error("Gagal menghapus modul");

                                                                                    refetch();
                                                                                    alert("✅ Modul berhasil dihapus");
                                                                                } catch (error) {
                                                                                    console.error(error);
                                                                                    alert("❌ Gagal menghapus modul");
                                                                                }
                                                                            }}
                                                                            className="h-8 w-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                                            title="Hapus"
                                                                        >
                                                                            <FiTrash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Collapsible row */}
                                        {
                                            expandedRow === row.IdModulPelatihan && (
                                                <tr>
                                                    <td colSpan={6} className="p-4 bg-gray-50 border">
                                                        <div className="flex w-full items-center justify-between mb-3">
                                                            <h2 id="page-caption" className="font-semibold text-base leading-none max-w-xl">
                                                                Bahan Lainnya  <br />Materi {row?.NamaModulPelatihan}
                                                            </h2>
                                                            <Dialog open={openBahanAjar} onOpenChange={setOpenBahanAjar}>
                                                                <DialogTrigger asChild>
                                                                    <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                                                                        <Plus className="w-4 h-4" /> Tambah  Bahan Lainnya
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="sm:max-w-lg">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Tambah Bahan Ajar/Tayang</DialogTitle>
                                                                    </DialogHeader>

                                                                    <form onSubmit={handleCreateBahanAjar} className="space-y-4">
                                                                        {/* Nama */}
                                                                        <div className="space-y-2">
                                                                            <Label>Nama Bahan Ajar/Tayang</Label>
                                                                            <Input
                                                                                value={nama}
                                                                                onChange={(e) => {
                                                                                    setNama(e.target.value);
                                                                                    setIdModul(row.IdModulPelatihan.toString());
                                                                                }}
                                                                                placeholder="Masukkan nama bahan tayang"
                                                                                required
                                                                            />
                                                                        </div>

                                                                        {/* Deskripsi */}
                                                                        <div className="space-y-2">
                                                                            <Label>Deskripsi Bahan Tayang</Label>
                                                                            <Textarea
                                                                                value={deskripsi}
                                                                                onChange={(e) => setDeskripsi(e.target.value)}
                                                                                placeholder="Masukkan deskripsi bahan tayang"
                                                                            />
                                                                        </div>

                                                                        {/* Produsen */}
                                                                        {!isBahanAjar && <div className="space-y-2">
                                                                            <Label>Produsen</Label>
                                                                            <Input
                                                                                value={produsen}
                                                                                onChange={(e) => setProdusen(e.target.value)}
                                                                                placeholder="Masukkan produsen"
                                                                                required
                                                                            />
                                                                        </div>}


                                                                        {/* Jenis Bahan Ajar */}
                                                                        <div className="space-y-2">
                                                                            <Label>Jenis Bahan</Label>
                                                                            <Select value={jenis} onValueChange={setJenis}>
                                                                                <SelectTrigger className="w-full">
                                                                                    <SelectValue placeholder="Pilih jenis bahan ajar" />
                                                                                </SelectTrigger>
                                                                                <SelectContent className="z-[9999999]" position="popper" side="top">
                                                                                    <SelectItem value="file">File</SelectItem>
                                                                                    <SelectItem value="video">Video/Link Referensi</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>

                                                                        {/* Kondisi jika File */}
                                                                        {jenis === "file" && (
                                                                            <div className="space-y-2">
                                                                                <Label className="font-semibold text-gray-700">
                                                                                    Upload File
                                                                                </Label>
                                                                                {!file && (
                                                                                    <div className="flex items-center justify-center w-full">
                                                                                        <label
                                                                                            htmlFor="file-upload"
                                                                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md text-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                                                                                        >
                                                                                            <svg
                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                className="w-10 h-10 text-blue-500 mb-2"
                                                                                                fill="none"
                                                                                                viewBox="0 0 24 24"
                                                                                                stroke="currentColor"
                                                                                            >
                                                                                                <path
                                                                                                    strokeLinecap="round"
                                                                                                    strokeLinejoin="round"
                                                                                                    strokeWidth="2"
                                                                                                    d="M12 4v16m8-8H4"
                                                                                                />
                                                                                            </svg>
                                                                                            <span className="text-sm text-gray-600">
                                                                                                <span className="font-medium text-blue-600">Click to upload</span>{" "}
                                                                                                or drag and drop
                                                                                            </span>
                                                                                            <span className="text-xs text-gray-400 mt-1">
                                                                                                PDF, PPT, DOC, JPG, PNG (max. 10MB)
                                                                                            </span>
                                                                                            <Input
                                                                                                id="file-upload"
                                                                                                type="file"
                                                                                                className="hidden"
                                                                                                onChange={(e) => setFile(e.target.files?.[0]!)}
                                                                                                required
                                                                                            />
                                                                                        </label>
                                                                                    </div>
                                                                                )}

                                                                                {file && (
                                                                                    <div className="flex items-center gap-2 mt-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                                                                                        <CheckCircle className="w-5 h-5" />
                                                                                        <span>{file.name}</span>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setFile(null)}
                                                                                            className="ml-auto text-red-500 hover:text-red-600"
                                                                                        >
                                                                                            <XCircle className="w-5 h-5" />
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {/* Kondisi jika Video */}
                                                                        {jenis === "video" && (
                                                                            <div className="space-y-2">
                                                                                <Label>Link Video/Referensi</Label>
                                                                                <Input
                                                                                    type="url"
                                                                                    value={linkVideo}
                                                                                    onChange={(e) => setLinkVideo(e.target.value)}
                                                                                    placeholder="Masukkan link  (contoh: https://youtube.com/...)"
                                                                                    required
                                                                                    className='text-sm'
                                                                                />
                                                                            </div>
                                                                        )}

                                                                        {/* Submit */}
                                                                        <Button
                                                                            type="submit"
                                                                            className="w-full rounded-md py-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                                            disabled={submitting}
                                                                        >
                                                                            {submitting ? (
                                                                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                                            ) : (
                                                                                "Submit"
                                                                            )}
                                                                        </Button>
                                                                    </form>
                                                                </DialogContent>

                                                            </Dialog>

                                                        </div>
                                                        <table className="w-full text-sm text-left border">
                                                            <thead className="bg-gray-100 text-gray-700 uppercase">
                                                                <tr className="text-xs text-center">
                                                                    <th className="px-3 py-2 border">No</th>
                                                                    <th className="px-3 py-2 border">Action</th>
                                                                    <th className="px-3 py-2 border">Nama</th>
                                                                    <th className="px-3 py-2 border">Deskripsi</th>
                                                                    <th className="px-3 py-2 border">File/Link</th>
                                                                    {!isBahanAjar && <th className="px-3 py-2 border">Produsen</th>}
                                                                    <th className="px-3 py-2 border">Tanggal Upload</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    row.BahanTayang.length == 0 ? <tr>
                                                                        <td colSpan={18} className="text-center py-6 text-gray-500 italic">
                                                                            Tidak ada data ditemukan
                                                                        </td>
                                                                    </tr> : <>
                                                                        {row.BahanTayang.map((row_bt: BahanTayang, index: number) => (
                                                                            <tr key={row_bt.IdBahanTayang}>
                                                                                <td className="px-3 py-2 border">{index + 1}</td>
                                                                                <td className="px-3 py-2 border">
                                                                                    <div className="w-full flex items-center justify-center">
                                                                                        <button
                                                                                            onClick={async () => {
                                                                                                const confirmDelete = window.confirm("⚠️ Apakah Anda yakin ingin menghapus bahan tayang ini?");
                                                                                                if (!confirmDelete) return;

                                                                                                try {
                                                                                                    const res = await fetch(
                                                                                                        `${moduleBaseUrl}/bahan-tayang/deleteBahanTayang?id=${row_bt.IdBahanTayang}`,
                                                                                                        { method: "DELETE" }
                                                                                                    );
                                                                                                    if (!res.ok) throw new Error("Gagal menghapus bahan tayang");

                                                                                                    refetch();
                                                                                                    alert("✅ Bahan tayang berhasil dihapus");
                                                                                                } catch (error) {
                                                                                                    console.error(error);
                                                                                                    alert("❌ Gagal menghapus bahan tayang");
                                                                                                }
                                                                                            }}
                                                                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500 border group"
                                                                                        >
                                                                                            <FiTrash2 className="h-5 w-5 text-rose-500 group-hover:text-white" />
                                                                                            Hapus
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-3 py-2 border">{row_bt.NamaBahanTayang}</td>
                                                                                <td className="px-3 py-2 border">{row_bt.DeskripsiBahanTayang}</td>
                                                                                <td className="px-3 py-2 border">
                                                                                    <div className="w-full flex items-center justify-center">
                                                                                        <a
                                                                                            href={
                                                                                                row_bt.BahanTayang
                                                                                                    ? `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row_bt.BahanTayang}`
                                                                                                    : row_bt.LinkVideo
                                                                                            }
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 border group"
                                                                                        >
                                                                                            <FaRegFileLines className="h-5 w-5 text-blue-500 group-hover:text-white" /> File
                                                                                        </a>
                                                                                    </div>
                                                                                </td>
                                                                                {!isBahanAjar && <td className="px-3 py-2 border">{row_bt.Creator || "-"}</td>}
                                                                                <td className="px-3 py-2 border">{row_bt.CreateAt}</td>
                                                                            </tr>))}
                                                                    </>

                                                                }
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    </React.Fragment>
                                )
                            })}

                            {sortedAndPaginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={18} className="text-center py-6 text-gray-500 italic">
                                        Tidak ada data ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-6 px-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Halaman <span className="text-blue-600">{currentPage}</span> Dari <span className="text-slate-600">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="h-8 px-4 text-[10px] font-black uppercase tracking-wider rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="h-8 px-4 text-[10px] font-black uppercase tracking-wider rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div >
        </section >
    )
}
