"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { Lock, FileText, Calendar, Users, Clock, ArrowLeft, BookOpen, CheckSquare, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
import Cookies from "js-cookie";

export default function MateriDetailPage() {
    const { id } = useParams();
    const { data, loading, error } = useFetchDataMateriPelatihanMasyarakat();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    const materi = data.find((m) => m.IdMateriPelatihan === Number(id));
    if (!materi) {
        return <p className="text-center text-gray-500">Materi tidak ditemukan.</p>;
    }

    const jumlahPengajar = Math.floor(Math.random() * 5) + 1; // dummy
    const jumlahModul = materi.ModulPelatihan.length;
    const jamPelajaran = jumlahModul * 2; // dummy JP

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 mt-36">
            {/* Back button */}
            <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
                onClick={() => router.push("/layanan/pelatihan/online")}
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali
            </Button>



            {/* Header */}
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        {materi.NamaMateriPelatihan.replace(/-/g, " ")}
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {materi.CreateAt}
                    </div>
                    {materi.BidangMateriPelatihan && (
                        <Badge variant="secondary">{materi.BidangMateriPelatihan}</Badge>
                    )}
                </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-3 gap-6 text-center">
                <div className="bg-white rounded-xl p-4 border shadow-sm">
                    <Users className="w-5 h-5 mx-auto text-blue-500" />
                    <p className="text-xs text-gray-500 mt-1">Pengajar</p>
                    <p className="text-lg font-semibold">{jumlahPengajar}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border shadow-sm">
                    <FileText className="w-5 h-5 mx-auto text-blue-500" />
                    <p className="text-xs text-gray-500 mt-1">Modul</p>
                    <p className="text-lg font-semibold">{jumlahModul}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border shadow-sm">
                    <Clock className="w-5 h-5 mx-auto text-blue-500" />
                    <p className="text-xs text-gray-500 mt-1">JP</p>
                    <p className="text-lg font-semibold">{jamPelajaran}</p>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 border shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Deskripsi</h2>
                <p className="text-gray-600 leading-relaxed">
                    {materi.DeskripsiMateriPelatihan ||
                        "Pelatihan ini dirancang untuk memberikan pemahaman mendalam terkait perikanan dan akuakultur. Materi mencakup teori dan studi kasus untuk meningkatkan kompetensi peserta."}
                </p>
            </div>

            {/* Welcome & Rules */}
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">
                    Selamat datang para peserta {materi.NamaMateriPelatihan.replace(/-/g, " ")}
                </h2>
                <p className="text-gray-600 text-sm">
                    Sebelum memulai pembelajaran, harap perhatikan ketentuan berikut:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>Mengikuti seluruh kegiatan sesuai jadwal yang telah ditetapkan, baik daring maupun klasikal.</li>
                    <li>Wajib melakukan presensi pada setiap materi sesuai waktu yang ditentukan.</li>
                    <li>Materi harus diikuti secara berurutan.</li>
                    <li>Satu Jam Pelajaran (JP) setara dengan 45 menit.</li>
                    <li>Setelah setiap sesi, peserta wajib mengisi evaluasi pengajar.</li>
                    <li>Pada akhir pembelajaran, lakukan evaluasi penyelenggaraan pelatihan.</li>
                    <li>Sertifikat dapat dicetak mandiri jika seluruh tahapan diikuti dan nilai minimal 80.</li>
                </ul>

                <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold text-gray-800">Petunjuk Materi Selanjutnya</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                        <li>Kotak checklist di sebelah kanan materi akan tercentang jika aktifitas pembelajaran terpenuhi.</li>
                        <li>Checklist bergaris putus-putus akan otomatis terisi jika syarat aktifitas terpenuhi.</li>
                        <li>Checklist bergaris solid dapat diisi manual dengan mengklik kotak setelah aktifitas selesai.</li>
                        <li>Jika checklist sudah tercentang, materi berikutnya dapat dibuka.</li>
                    </ul>
                </div>

                <div className="pt-2">
                    <p className="text-sm text-blue-500 font-medium">Selamat mengikuti pembelajaran!</p>
                </div>
            </div>

            {/* Module List */}
            <div className="bg-white rounded-xl p-6 border shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Daftar Modul</h2>
                <div className="space-y-3">
                    {materi.ModulPelatihan.map((modul) => (
                        <div
                            key={modul.IdModulPelatihan}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <p className="text-sm font-medium text-gray-800">
                                    {modul.NamaModulPelatihan.replace(/-/g, " ")}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs">Terkunci</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        className="w-full rounded-full bg-blue-500 text-white px-8 py-4 text-base hover:bg-blue-600 transition flex items-center justify-center gap-2"

                    >
                        <PlayCircle className="w-5 h-5" />
                        Ikuti Pelatihan Online
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ikuti Pelatihan Online</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin mengikuti pelatihan ini?
                            Pastikan Anda telah membaca dan memahami seluruh ketentuan yang berlaku sebelum memulai.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (!Cookies.get('XSRF081')) {
                                    router.push('/login')
                                }
                                // Aksi ketika user setuju
                                console.log("User mengikuti pelatihan");
                            }}
                        >
                            Lanjutkan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </div>
    );
}
