"use client"

import { useParams } from "next/navigation"
import { Loader2, FileText, Calendar, BookOpen, Plus, CheckCircle, XCircle } from "lucide-react"
import { useFetchDataMateriPelatihanMasyarakatById } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat"
import React, { useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fileModuleBaseUrl, moduleBaseUrl } from "@/constants/urls"
import { FiEdit, FiEdit2, FiFolder, FiTrash2 } from "react-icons/fi"
import { ModulPelatihan } from "@/types/module"
import { FaRegFileLines, FaRegFolderOpen } from "react-icons/fa6"
import JSZip from "jszip"
import { saveAs } from 'file-saver'
import { TbArrowLeft } from "react-icons/tb"
import { truncateText } from "@/utils"


export default function DetailModulPelatihan() {
    const params = useParams();
    const id = Number(params?.id);
    const { data, loading, error, refetch } =
        useFetchDataMateriPelatihanMasyarakatById(id);

    const [open, setOpen] = useState(false);
    const [openBahanAjar, setOpenBahanAjar] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [idModul, setIdModul] = useState("")
    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [produsen, setProdusen] = useState("")
    const [submitting, setSubmitting] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editModul, setEditModul] = useState<ModulPelatihan | null>(null);
    const [editNama, setEditNama] = useState("");
    const [editDeskripsi, setEditDeskripsi] = useState("");
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editFileOld, setEditFileOld] = useState<string | null>(null)

    const [downloading, setDownloading] = useState(false);

    const materi = data?.[0];
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const totalPages = materi
        ? Math.ceil(materi.ModulPelatihan.length / itemsPerPage)
        : 1;

    const paginatedData =
        materi?.ModulPelatihan.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        ) || [];

    /**
     * Add new module features
     */
    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !nama) return

        const formData = new FormData()
        formData.append("file_bahan_tayang", file)
        formData.append("NamaModulPelatihan", nama)
        formData.append("DeskripsiModulPelatihan", deskripsi)
        formData.append("IdMateriPelatihan", id.toString())
        formData.append("IdModulPelatihan", id.toString())

        try {
            setSubmitting(true)
            await axios.post(`${moduleBaseUrl}/modul-pelatihan/createModulPelatihan`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            alert("✅ Modul berhasil ditambahkan!")
            setOpen(false)
            setFile(null)
            setNama("")
            setDeskripsi("")
            refetch()
        } catch (err) {
            console.error(err)
            alert("❌ Gagal menambahkan modul")
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

        try {
            setEditSubmitting(true)
            await axios.put(`${moduleBaseUrl}/modul-pelatihan/updateModulPelatihan?id=${editModul?.IdModulPelatihan}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            alert("✅ Modul berhasil diperbarui!")
            setEditOpen(false)
            setEditFile(null)
            setEditModul(null)
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
        if (!file || !nama) return
        console.log({ idModul })

        const formData = new FormData()
        formData.append("file_bahan_tayang", file)
        formData.append("NamaBahanTayang", nama)
        formData.append("DeskripsiBahanTayang", deskripsi)
        formData.append("IdModulPelatihan", idModul)
        formData.append("creator", produsen)

        try {
            setSubmitting(true)
            const response = await axios.post(`${moduleBaseUrl}/bahan-tayang/createBahanTayang`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            alert("✅ bahan tayang berhasil ditambahkan!")
            setOpenBahanAjar(false)
            setFile(null)
            setNama("")
            setDeskripsi("")
            setIdModul("")
            setProdusen("")
            refetch()
            console.log({ response })
        } catch (err) {
            console.error(err)
            alert("❌ Gagal menambahkan bahan tayang")
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

    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 py-10 font-medium">Materi tidak ditemukan.</div>
    }



    return (
        <section className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex flex-col w-full">
                <div className="flex flex-row gap-2 items-center">
                    <header
                        aria-label="page caption"
                        className="flex-row w-full justify-between flex h-36 items-center gap-2 bg-gray-100 border-t px-4"
                    >
                        <div className="flex gap-3 items-center">
                            <BookOpen className="text-3xl" />
                            <div className="flex flex-col gap-2">
                                <h1 id="page-caption" className="font-semibold text-lg leading-none">
                                    {materi?.NamaMateriPelatihan}
                                </h1>
                                <div className="flex flex-col leading-none text-sm text-gray-400">
                                    {materi?.BidangMateriPelatihan != "" && (
                                        <span>Bidang: {materi?.BidangMateriPelatihan}</span>
                                    )}
                                    <span>Produsen: {materi?.DeskripsiMateriPelatihan}</span>
                                    <span>Diupload: {materi?.CreateAt}</span>
                                </div>
                            </div>
                        </div>

                        {/* Add Modul Button + Dialog */}
                        <div className="flex justify-end mb-4 gap-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    (window.location.href = `/admin/lemdiklat/master/modul`)
                                }
                                className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-gray-500 text-gray-500 hover:text-white hover:bg-gray-500"
                            >
                                <TbArrowLeft className="h-4 w-4" />
                                Kembali
                            </Button>
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                                        <Plus className="w-4 h-4" /> Tambah Modul
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Tambah Modul Pelatihan</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nama Modul</Label>
                                            <Input
                                                value={nama}
                                                onChange={(e) => setNama(e.target.value)}
                                                placeholder="Masukkan nama modul"
                                                required
                                            />
                                            <p className="text-xs text-gray-600">* Format : 01.-PENGENALAN-TUGAS-POKOK-DAN-FUNGSI-JFT-ANALIS-AKUAKULTUR-OKE</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Deskripsi Modul</Label>
                                            <Textarea
                                                value={deskripsi}
                                                onChange={(e) => setDeskripsi(e.target.value)}
                                                placeholder="Masukkan deskripsi modul"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-semibold text-gray-700">Upload File Modul</Label>
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
                            {
                                materi?.ModulPelatihan.length != 0 && <Button
                                    onClick={handleDownloadAll}
                                    className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md"
                                    disabled={downloading}
                                >
                                    {downloading ? (
                                        <>
                                            <Loader2 className="animate-spin w-4 h-4" /> Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <FaRegFolderOpen className="w-4 h-4" /> Download Modul
                                        </>
                                    )}
                                </Button>
                            }
                        </div>

                        {/* Edit Modul Dialog */}
                        <Dialog open={editOpen} onOpenChange={setEditOpen}>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Edit Modul Pelatihan</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nama Modul</Label>
                                        <Input
                                            value={editNama}
                                            onChange={(e) => setEditNama(e.target.value)}
                                            placeholder="Masukkan nama modul"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deskripsi Modul</Label>
                                        <Textarea
                                            value={editDeskripsi}
                                            onChange={(e) => setEditDeskripsi(e.target.value)}
                                            placeholder="Masukkan deskripsi modul"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-gray-700">Upload File Modul</Label>

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

                    </header>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-md text-sm mt-5 shadow-sm">
                <table className="min-w-full table-fixed text-sm">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="w-12 px-3 py-3 text-center">No</th>
                            <th className="w-12 px-3 py-3 text-center">Action</th>
                            <th className="w-40 px-3 py-3 text-center">Nama Materi Modul Pelatihan</th>
                            <th className="w-28 px-3 py-3 text-center">Diupload pada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {materi?.ModulPelatihan?.slice()
                            .sort((a, b) => {
                                const numA = parseInt(a.NamaModulPelatihan.split(".")[0], 10) || 0;
                                const numB = parseInt(b.NamaModulPelatihan.split(".")[0], 10) || 0;
                                return numA - numB;
                            })
                            .map((row, index) => (
                                <React.Fragment key={row.IdModulPelatihan}>
                                    <tr className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-3 py-2 border text-center text-gray-500">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-3 py-4 border">
                                            <div className="flex flex-row gap-2 h-full items-center justify-center py-2">
                                                {row.FileModule && (
                                                    <>
                                                        <a
                                                            href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row.FileModule}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 border group"
                                                        >
                                                            <FaRegFileLines className="h-5 w-5 text-blue-500 group-hover:text-white" /> File
                                                        </a>
                                                        <button
                                                            onClick={() =>
                                                                setExpandedRow(expandedRow === row.IdModulPelatihan ? null : row.IdModulPelatihan)
                                                            }
                                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-teal-500 text-teal-500 hover:text-white hover:bg-teal-500 border group"
                                                        >
                                                            <FiFolder className="h-5 w-5 text-teal-500 group-hover:text-white" />{" "}
                                                            {expandedRow === row.IdModulPelatihan ? "Tutup Bahan" : "Lihat Bahan"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditModul(row);
                                                                setEditNama(row.NamaModulPelatihan);
                                                                setEditDeskripsi(row.DeskripsiModulPelatihan || "");
                                                                setEditFile(null);
                                                                setEditFileOld(row.FileModule);
                                                                setEditOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-amber-500 text-amber-500 hover:text-white hover:bg-amber-500 border group"
                                                        >
                                                            <FiEdit2 className="h-5 w-5 text-amber-500 group-hover:text-white" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const confirmDelete = window.confirm("⚠️ Apakah Anda yakin ingin menghapus modul ini?");
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
                                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500 border group"
                                                        >
                                                            <FiTrash2 className="h-5 w-5 text-rose-500 group-hover:text-white" />
                                                            Hapus
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 border max-w-full" title={row.NamaModulPelatihan}>
                                            {row.NamaModulPelatihan}
                                        </td>
                                        <td className="px-3 py-2 border max-w-[200px]" title={row.CreateAt}>
                                            {row.CreateAt}
                                        </td>
                                    </tr>

                                    {/* Collapsible row */}
                                    {expandedRow === row.IdModulPelatihan && (
                                        <tr>
                                            <td colSpan={4} className="p-4 bg-gray-50 border">
                                                <div className="flex w-full items-center justify-between mb-3">
                                                    <h2 id="page-caption" className="font-semibold text-base leading-none max-w-xl">
                                                        Bahan Ajar/Tayang <br />{row?.NamaModulPelatihan}
                                                    </h2>
                                                    <Dialog open={openBahanAjar} onOpenChange={setOpenBahanAjar}>
                                                        <DialogTrigger asChild>
                                                            <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                                                                <Plus className="w-4 h-4" /> Tambah Bahan Ajar/Tayang
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-lg">
                                                            <DialogHeader>
                                                                <DialogTitle>Tambah Bahan Ajar/Tayang</DialogTitle>
                                                            </DialogHeader>
                                                            <form onSubmit={handleCreateBahanAjar} className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label>Nama Bahan Ajar/Tayang</Label>

                                                                    <Input
                                                                        value={nama}
                                                                        onChange={(e) => { setNama(e.target.value); setIdModul(row.IdModulPelatihan.toString()) }}
                                                                        placeholder="Masukkan nama modul"
                                                                        required
                                                                    />
                                                                    <p className="text-xs text-gray-600">* Format : 1. (Video) Pengenalan Tugas Pokok dan Fungsi JFT</p>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Deskripsi Bahan Tayang</Label>
                                                                    <Textarea
                                                                        value={deskripsi}
                                                                        onChange={(e) => setDeskripsi(e.target.value)}
                                                                        placeholder="Masukkan deskripsi modul"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Produsen</Label>
                                                                    <Input
                                                                        value={produsen}
                                                                        onChange={(e) => setProdusen(e.target.value)}
                                                                        placeholder="Masukkan produsen"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="font-semibold text-gray-700">Upload File Bahan Ajar/Tayang</Label>
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
                                                                            <span className="text-xs text-gray-400 mt-1">PDF, PPT, DOC, JPG, PNG, MP4 (max. 10MB)</span>
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

                                                </div>
                                                <table className="w-full text-sm text-left border">
                                                    <thead className="bg-gray-100 text-gray-700 uppercase">
                                                        <tr className="text-xs text-center">
                                                            <th className="px-3 py-2 border">No</th>
                                                            <th className="px-3 py-2 border">Action</th>
                                                            <th className="px-3 py-2 border">Nama</th>
                                                            <th className="px-3 py-2 border">File</th>
                                                            <th className="px-3 py-2 border">Produsen</th>
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
                                                                {row.BahanTayang.map((row_bt, index) => (
                                                                    <tr key={row_bt.IdBahanTayang}>
                                                                        <td className="px-3 py-2 border">{index + 1}</td>
                                                                        <td className="px-3 py-2 border"> <button
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
                                                                        </button></td>
                                                                        <td className="px-3 py-2 border">{row_bt.NamaBahanTayang}</td>
                                                                        <td className="px-3 py-2 border"> <a
                                                                            href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row_bt.BahanTayang}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="  text-blue-500  underline "
                                                                        >
                                                                            {truncateText(row_bt.BahanTayang, 50, '...')}
                                                                        </a></td>
                                                                        <td className="px-3 py-2 border">{row_bt.Creator || "-"}</td>
                                                                        <td className="px-3 py-2 border">{row_bt.CreateAt}</td>
                                                                    </tr>))}
                                                            </>

                                                        }
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}

                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={18} className="text-center py-6 text-gray-500 italic">
                                    Tidak ada data ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-neutral-600">
                    Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

        </section>
    )
}
