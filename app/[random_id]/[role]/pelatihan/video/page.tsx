"use client";

import React, { useEffect, useState } from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { getAllVideoPelatihans, saveVideoPelatihan, updateVideoPelatihan, deleteVideoPelatihan } from "@/utils/videoPelatihan";
import { HashLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UPT } from "@/constants/nomenclatures";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { RumpunPelatihan } from "@/types/program";
import Toast from "@/commons/Toast";
import { TbLayoutGrid, TbFileText, TbPlus } from "react-icons/tb";
import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MdEdit, MdDelete } from "react-icons/md";
import { Youtube, Search, X, Plus, Info, LayoutList, Calendar, PlaySquare, FileText, MousePointerClick, MessageSquare } from "lucide-react";

interface VideoPelatihanData {
    id: string;
    namaPelatihan: string;
    linkPelatihan: string;
    idPelatihan: string;
    programPelatihan: string;
    jenisProgramPelatihan: string;
    penyelenggara: string;
    videoClicked: number;
    responses: any[];
    descriptionVideo: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
}

export default function VideoPelatihanAdminPage() {
    const [videos, setVideos] = useState<VideoPelatihanData[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [savingVideo, setSavingVideo] = useState(false);
    const [editingVideo, setEditingVideo] = useState<VideoPelatihanData | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoPelatihanData | null>(null);

    const [videoForm, setVideoForm] = useState({
        namaPelatihan: "",
        linkPelatihan: "",
        idPelatihan: "",
        programPelatihan: "",
        jenisProgramPelatihan: "",
        penyelenggara: "",
        descriptionVideo: ""
    });

    const { data: dataRumpunPelatihan } = useFetchDataRumpunPelatihan();
    const [selectedRumpunPelatihan, setSelectedRumpunPelatihan] = useState<RumpunPelatihan | null>(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoadingVideos(true);
            const data = await getAllVideoPelatihans();
            setVideos(data as VideoPelatihanData[]);
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setLoadingVideos(false);
        }
    };

    const formatDate = (timestamp: { seconds: number }) => {
        if (!timestamp) return "-";
        const date = new Date(timestamp.seconds * 1000);
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(date);
    };

    const extractYoutubeId = (url: string) => {
        try {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : url; // return original if matching fails
        } catch (e) {
            return url;
        }
    }

    const filteredVideos = videos.filter((video) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            video.namaPelatihan?.toLowerCase().includes(searchLower) ||
            video.penyelenggara?.toLowerCase().includes(searchLower) ||
            video.programPelatihan?.toLowerCase().includes(searchLower)
        );
    });

    const handleSaveVideo = async () => {
        if (!videoForm.namaPelatihan || !videoForm.linkPelatihan) {
            alert("Harap lengkapi field wajib (Nama Pelatihan & Link Pelatihan)!");
            return;
        }

        try {
            setSavingVideo(true);
            if (editingVideo) {
                await updateVideoPelatihan(editingVideo.id, videoForm);
            } else {
                await saveVideoPelatihan(videoForm);
            }
            cancelVideoForm();
            fetchVideos();
        } catch (error) {
            console.error("Error saving video:", error);
        } finally {
            setSavingVideo(false);
        }
    };

    const handleEditVideo = (video: VideoPelatihanData) => {
        setEditingVideo(video);
        setVideoForm({
            namaPelatihan: video.namaPelatihan || "",
            linkPelatihan: video.linkPelatihan || "",
            idPelatihan: video.idPelatihan || "",
            programPelatihan: video.programPelatihan || "",
            jenisProgramPelatihan: video.jenisProgramPelatihan || "",
            penyelenggara: video.penyelenggara || "",
            descriptionVideo: video.descriptionVideo || ""
        });

        // Match Rumpun Pelatihan when editing
        if (dataRumpunPelatihan && video.jenisProgramPelatihan) {
            const found = dataRumpunPelatihan.find(r => (r.name || r.nama_rumpun_pelatihan) === video.jenisProgramPelatihan);
            setSelectedRumpunPelatihan(found || null);
        } else {
            setSelectedRumpunPelatihan(null);
        }

        setShowForm(true);
    };

    const handleDeleteVideo = async (video: VideoPelatihanData) => {
        if (!confirm("Hapus data video ini?")) return;
        try {
            await deleteVideoPelatihan(video.id);
            fetchVideos();
        } catch (error) {
            console.error("Error deleting video:", error);
        }
    };

    const cancelVideoForm = () => {
        setShowForm(false);
        setEditingVideo(null);
        setSelectedRumpunPelatihan(null);
        setVideoForm({
            namaPelatihan: "",
            linkPelatihan: "",
            idPelatihan: "",
            programPelatihan: "",
            jenisProgramPelatihan: "",
            penyelenggara: "",
            descriptionVideo: ""
        });
    };

    const totalViews = videos.reduce((acc, curr) => acc + (curr.videoClicked || 0), 0);

    return (
        <LayoutAdminElaut>
            <div className="flex flex-col w-full h-full gap-2">
                <HeaderPageLayoutAdminElaut
                    title="Management Video Pelatihan"
                    description="Pusat kelola data video pelatihan gratis!"
                    icon={<Youtube className="text-3xl" />}
                />

                <div className="space-y-10 py-6">
                    {/* Top Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none transition-all duration-500 hover:scale-[1.02] group">
                            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                            <div className="relative z-10 space-y-4">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
                                    <PlaySquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Total Video</p>
                                    <h4 className="text-3xl font-black tracking-tighter">{videos.length} <span className="text-sm font-medium tracking-normal text-blue-200">materi aktif</span></h4>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-rose-200 dark:shadow-none transition-all duration-500 hover:scale-[1.02] group">
                            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                            <div className="relative z-10 space-y-4">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
                                    <MousePointerClick className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Total Penayangan (Klik)</p>
                                    <h4 className="text-3xl font-black tracking-tighter">
                                        {totalViews} <span className="text-sm font-medium tracking-normal text-rose-200">interaksi pengguna</span>
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-emerald-200 dark:shadow-none transition-all duration-500 hover:scale-[1.02] group">
                            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                            <div className="relative z-10 space-y-4">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Respons Feedback</p>
                                    <h4 className="text-3xl font-black tracking-tighter">
                                        {videos.reduce((acc, curr) => acc + (curr.responses?.length || 0), 0)} <span className="text-sm font-medium tracking-normal text-emerald-200">total ulasan masuk</span>
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-sm rounded-[2rem] p-6 lg:p-8 gap-6">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0 border border-blue-600/20 shadow-sm">
                                <LayoutList className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Daftar Video Pelatihan</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Manage data, link integrasi, dan thumbnail konten!</p>
                            </div>
                        </div>
                        {!showForm && (
                            <Button
                                onClick={() => setShowForm(true)}
                                className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all w-full sm:w-auto"
                            >
                                <Plus className="w-5 h-5 mr-3" /> Upload Video Pelatihan
                            </Button>
                        )}
                    </div>

                    {/* Form Section */}
                    {showForm && (
                        <Card className="rounded-[2.5rem] border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                            <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                            {editingVideo ? "Modifikasi Video" : "Upoad Video Baru"}
                                        </CardTitle>
                                        <CardDescription className="text-slate-500 font-medium">Lengkapi video pelatihan gratis di bawah ini!</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={cancelVideoForm} className="rounded-full hover:bg-rose-50 hover:text-rose-500">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2.5">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Pelatihan <span className="text-rose-500">*</span></label>
                                            <Input
                                                value={videoForm.namaPelatihan}
                                                onChange={(e) => setVideoForm({ ...videoForm, namaPelatihan: e.target.value })}
                                                placeholder="Contoh: Teknik Pembenihan Lele..."
                                                className="h-12 rounded-xl bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Link Youtube Video <span className="text-rose-500">*</span></label>
                                            <Input
                                                value={videoForm.linkPelatihan}
                                                onChange={(e) => {
                                                    const url = e.target.value;
                                                    const vidId = extractYoutubeId(url);
                                                    setVideoForm({
                                                        ...videoForm,
                                                        linkPelatihan: url,
                                                        idPelatihan: vidId !== url ? vidId : videoForm.idPelatihan
                                                    });
                                                }}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                className="h-12 rounded-xl bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><TbLayoutGrid className="text-indigo-500" /> Klaster Pelatihan</label>
                                                <Select
                                                    value={String(selectedRumpunPelatihan?.id_rumpun_pelatihan || "")}
                                                    onValueChange={(v) => {
                                                        const found = dataRumpunPelatihan?.find(r => String(r.id_rumpun_pelatihan) === String(v));
                                                        if (found) {
                                                            setSelectedRumpunPelatihan(found);
                                                            setVideoForm({
                                                                ...videoForm,
                                                                jenisProgramPelatihan: found.name || found.nama_rumpun_pelatihan || "",
                                                                programPelatihan: "" // Reset program
                                                            });
                                                        }
                                                    }}>
                                                    <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl px-5 font-bold uppercase tracking-tight">
                                                        <SelectValue placeholder="Pilih Klaster" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl max-h-[300px]">
                                                        {dataRumpunPelatihan?.map((item) => (
                                                            <SelectItem key={item.id_rumpun_pelatihan} value={String(item.id_rumpun_pelatihan)} className="font-bold py-3 uppercase text-xs">
                                                                {item.nama_rumpun_pelatihan || item.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><TbFileText className="text-emerald-500" /> Program Pelatihan</label>
                                                <Select 
                                                    value={videoForm.programPelatihan} 
                                                    onValueChange={(v) => setVideoForm({ ...videoForm, programPelatihan: v })}
                                                >
                                                    <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl px-5 font-bold uppercase tracking-tight text-left truncate">
                                                        <SelectValue placeholder={videoForm.jenisProgramPelatihan ? `Pilih Program` : "Pilih Klaster Dulu"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl max-h-[300px]">
                                                        {selectedRumpunPelatihan?.programs?.map((p) => (
                                                            <SelectItem key={p.id_program_pelatihan} value={p.name_indo || String(p.id_program_pelatihan)} className="font-bold py-3 uppercase text-xs">
                                                                {p.name_indo}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><TbLayoutGrid className="text-indigo-500" /> Nama Penyelenggara</label>
                                                <Select value={videoForm.penyelenggara} onValueChange={(v) => setVideoForm({ ...videoForm, penyelenggara: v })}>
                                                    <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl px-5 font-bold uppercase truncate text-left">
                                                        <SelectValue placeholder="Pilih penyelenggara" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl max-h-[300px]">
                                                        {UPT.map((item, i) => <SelectItem key={i} value={item} className="uppercase font-bold text-xs py-3">{item}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">ID (Otomatis Terisi)</label>
                                                <Input
                                                    value={videoForm.idPelatihan}
                                                    disabled
                                                    onChange={(e) => setVideoForm({ ...videoForm, idPelatihan: e.target.value })}
                                                    placeholder="(Opsional) Hubungkan dg Pelatihan Sistem"
                                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Deskripsi Tambahan Video</label>
                                            <textarea
                                                value={videoForm.descriptionVideo}
                                                onChange={(e) => setVideoForm({ ...videoForm, descriptionVideo: e.target.value })}
                                                className="w-full p-4 text-sm font-medium bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[120px] transition-all"
                                                placeholder="Tuliskan deskripsi pembelajaran..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <Button onClick={cancelVideoForm} variant="outline" className="h-12 px-8 rounded-xl font-bold uppercase tracking-wider">
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleSaveVideo}
                                        disabled={savingVideo}
                                        className="h-12 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                                    >
                                        {savingVideo ? "Memproses..." : editingVideo ? "Simpan Perbaikan" : "Upload"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Bar (Search) */}
                    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-sm rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="text"
                                placeholder="Cari berdasarkan nama pelatihan, program, atau penyelenggara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-14 pr-6 bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
                            />
                        </div>
                        {searchQuery && (
                            <Button
                                variant="outline"
                                onClick={() => setSearchQuery("")}
                                className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all"
                            >
                                <X className="w-4 h-4 mr-2" /> Reset
                            </Button>
                        )}
                    </div>

                    {/* Data Table Wrapper */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden">
                        {loadingVideos ? (
                            <div className="py-32 w-full flex flex-col items-center justify-center gap-4">
                                <HashLoader color="#3b82f6" size={60} />
                                <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">Menarik metadata video...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                            <TableHead className="w-16 text-center font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">No</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5" /> Video Metadata
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">
                                                <div className="flex items-center gap-2">
                                                    <LayoutList className="w-3.5 h-3.5" /> Detail Operasional
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 text-center">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <MousePointerClick className="w-3.5 h-3.5" /> Traffic
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredVideos.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                                            <Youtube className="w-8 h-8" />
                                                        </div>
                                                        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                                                            {searchQuery ? "Data tidak ditemukan secara spesifik" : "Belum ada Video Pelatihan yang direkam"}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredVideos.map((video, index) => (
                                                <TableRow key={video.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-slate-100 dark:border-slate-800 transition-colors">
                                                    <TableCell className="text-center font-bold text-xs text-slate-400 px-6">{index + 1}</TableCell>
                                                    <TableCell className="py-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-24 h-16 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative flex items-center justify-center group-hover:border-blue-300 transition-colors">
                                                                <img
                                                                    src={`https://img.youtube.com/vi/${extractYoutubeId(video.linkPelatihan)}/hqdefault.jpg`}
                                                                    alt="Preview"
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Preview'; }}
                                                                />
                                                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Youtube className="w-6 h-6 text-white drop-shadow-md" fill="#ef4444" />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-1.5 flex-1 max-w-sm">
                                                                <span className="text-sm font-black text-slate-800 dark:text-white uppercase group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                                                                    {video.namaPelatihan}
                                                                </span>
                                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                                                                    {video.descriptionVideo || "Tidak ada deskripsi detail tambahan"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 uppercase text-[9px] font-bold tracking-wider rounded-lg">
                                                                    {video.programPelatihan || "Umum"}
                                                                </Badge>
                                                                <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 uppercase text-[9px] font-bold tracking-wider rounded-lg">
                                                                    {video.penyelenggara || "E-LAUT System"}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] tracking-wide">{formatDate(video.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                                                            <div className="flex items-center gap-1.5">
                                                                <MousePointerClick className="w-3.5 h-3.5 text-blue-500" />
                                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{video.videoClicked || 0}</span>
                                                            </div>
                                                            <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700" />
                                                            <div className="flex items-center gap-1.5">
                                                                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{video.responses?.length || 0}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button
                                                                onClick={() => setSelectedVideo(video)}
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-10 w-10 rounded-xl border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                                            >
                                                                <Info className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleEditVideo(video)}
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-10 w-10 rounded-xl border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm"
                                                            >
                                                                <MdEdit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleDeleteVideo(video)}
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-10 w-10 rounded-xl border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                                                            >
                                                                <MdDelete className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Details Modal Window */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-300"
                    onClick={() => setSelectedVideo(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/60 dark:border-slate-800 animate-in slide-in-from-bottom-5 duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 p-8 z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 border border-blue-600/20 shadow-sm">
                                    <Youtube className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Detail Video</h2>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedVideo.idPelatihan || "No ID"}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedVideo(null)} className="rounded-full h-12 w-12 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg relative">
                                <iframe
                                    src={`https://www.youtube.com/embed/${extractYoutubeId(selectedVideo.linkPelatihan)}`}
                                    className="w-full h-full absolute inset-0"
                                    allowFullScreen
                                />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white font-calsans leading-tight">
                                    {selectedVideo.namaPelatihan}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    {selectedVideo.descriptionVideo || "Belum ada penjabaran detail teknis yang disertakan pada objek video ini."}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Penyelenggara</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedVideo.penyelenggara || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Program</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedVideo.programPelatihan || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total View</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedVideo.videoClicked || 0} Clicked</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Response Data</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedVideo.responses?.length || 0} Feedback</p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={() => setSelectedVideo(null)}
                                    className="h-14 px-10 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20"
                                >
                                    Tutup Detail
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </LayoutAdminElaut>
    );
}

