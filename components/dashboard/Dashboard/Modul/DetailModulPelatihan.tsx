"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, FileText, Calendar, BookOpen, Plus, CheckCircle, XCircle } from "lucide-react"
import { useFetchDataMateriPelatihanMasyarakatById } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat"
import { useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fileModuleBaseUrl, moduleBaseUrl } from "@/constants/urls"
import { FiEdit, FiEdit2, FiFolder, FiTrash2 } from "react-icons/fi"
import { ModulPelatihan } from "@/types/module"
import { FaRegFolderOpen } from "react-icons/fa6"
import JSZip from "jszip"
import { saveAs } from 'file-saver'

export default function DetailModulPelatihan() {
    const params = useParams()
    const id = Number(params?.id)
    const { data, loading, error, refetch } = useFetchDataMateriPelatihanMasyarakatById(id)

    /**
     * Add new module features
     */
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [nama, setNama] = useState("")
    const [deskripsi, setDeskripsi] = useState("")
    const [submitting, setSubmitting] = useState(false)

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


        // console.log({ formData })
        // console.log({ id })
        // console.log({ nama })
        // console.log({ deskripsi })
        // console.log({ file })

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
    const [editOpen, setEditOpen] = useState(false)
    const [editModul, setEditModul] = useState<ModulPelatihan | null>(null)
    const [editFile, setEditFile] = useState<File | null>(null)
    const [editFileOld, setEditFileOld] = useState<string | null>(null)
    const [editNama, setEditNama] = useState("")
    const [editDeskripsi, setEditDeskripsi] = useState("")
    const [editSubmitting, setEditSubmitting] = useState(false)

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
    const [downloading, setDownloading] = useState(false);

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

    const materi = data[0]

    return (
        <section className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex flex-col w-full">
                <div className="flex flex-row gap-2 items-center">
                    <header
                        aria-label="page caption"
                        className="flex-row w-full justify-between flex h-24 items-center gap-2 bg-gray-100 border-t px-4"
                    >
                        <div className="flex gap-1 items-center"> <BookOpen className="text-3xl" />
                            <div className="flex flex-col">
                                <h1 id="page-caption" className="font-semibold text-lg">
                                    {materi.NamaMateriPelatihan}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span>Diupload: {materi.CreateAt}</span>
                                    </div>
                                    {materi.BerlakuSampai && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Berlaku sampai: {materi.BerlakuSampai}</span>
                                        </div>
                                    )}
                                </div>
                            </div></div>

                        {/* Add Modul Button + Dialog */}
                        <div className="flex justify-end mb-4 gap-2">
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full">
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
                                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
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
                                            className="w-full rounded-full py-2 bg-blue-600 hover:bg-blue-700 text-white"
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
                            <Button
                                onClick={handleDownloadAll}
                                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white rounded-full"
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
                                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
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
                                        className="w-full rounded-full py-2 bg-amber-500 hover:bg-amber-600 text-white"
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

            <main className="w-full h-full">
                <div className="mt-4 md:mt-6 2xl:mt-7.5">
                    <div className="container mx-auto p-6 space-y-6">



                        {/* Modul Pelatihan List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {materi.ModulPelatihan.map((modul) => (
                                <Card
                                    key={modul.IdModulPelatihan}
                                    className="shadow-sm hover:shadow-lg transition rounded-2xl border border-gray-200"
                                >
                                    <CardHeader className="mb-0 pb-2">
                                        <CardTitle className="text-lg font-semibold flex items-center gap-2 uppercase">
                                            <span className="w-6 h-6 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-blue-500" />
                                            </span>
                                            <span className="leading-tight">{modul.NamaModulPelatihan}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-1">
                                        <p className="text-sm text-gray-600">
                                            {modul.DeskripsiModulPelatihan || "Tidak ada deskripsi modul"}
                                        </p>
                                        <p className="text-xs text-gray-400 mb-2">Diupload: {modul.CreateAt}</p>
                                        {modul.FileModule && (
                                            <div className="flex gap-2">
                                                <a
                                                    href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${modul.FileModule}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-medium border text-neutral-700  border-blue-500 px-4 py-2 rounded-full hover:border-blue-500 transition group  hover:bg-blue-500 hover:text-white"
                                                >
                                                    <FiFolder className="h-5 w-5 text-blue-500 group-hover:text-white" /> Lihat File Modul
                                                </a>

                                                <button
                                                    onClick={() => {
                                                        setEditModul(modul)
                                                        setEditNama(modul.NamaModulPelatihan)
                                                        setEditDeskripsi(modul.DeskripsiModulPelatihan || "")
                                                        setEditFile(null)
                                                        setEditFileOld(modul.FileModule)
                                                        setEditOpen(true)
                                                    }}
                                                    className="inline-flex items-center gap-2 text-sm font-medium border text-neutral-700 border-amber-500 px-4 py-2 rounded-full hover:border-amber-500 transition group hover:bg-amber-500 hover:text-white"
                                                >
                                                    <FiEdit2 className="h-5 w-5 text-amber-500 group-hover:text-white" /> Edit
                                                </button>


                                                <button
                                                    onClick={async () => {
                                                        const confirmDelete = window.confirm("⚠️ Apakah Anda yakin ingin menghapus modul ini?");
                                                        if (!confirmDelete) return; // stop if user cancels

                                                        try {
                                                            const res = await fetch(
                                                                `${moduleBaseUrl}/modul-pelatihan/deleteModulPelatihan?id=${modul.IdModulPelatihan}`,
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
                                                    className="inline-flex items-center gap-2 text-sm font-medium border text-neutral-700 border-rose-500 px-4 py-2 rounded-full hover:border-rose-500 transition group hover:bg-rose-500 hover:text-white"
                                                >
                                                    <FiTrash2 className="h-5 w-5 text-rose-500 group-hover:text-white" />
                                                    Hapus
                                                </button>

                                            </div>
                                        )}

                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </section>
    )
}
