"use client";

import React from "react";
import Image from "next/image";
import { TbBook, TbBuilding, TbCalendar, TbCalendarEvent, TbClock, TbEdit, TbInfoCircle, TbLocation, TbMoneybag, TbPin, TbSchool } from "react-icons/tb";
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineHome, HiOutlineIdentification, HiOutlineCalendar } from "react-icons/hi";
import { RiTimeZoneLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { FaRegFileImage } from "react-icons/fa";

import { usePathname, useRouter } from "next/navigation";
import {
    DetailPelatihanMasyarakat,
} from "@/types/product";
import FormRegistrationTraining from "../dashboard/users/formRegistrationTraining";
import Features from "../features";
import { generateTanggalPelatihan } from "@/utils/text";
import { formatToRupiah, replaceUrl } from "@/lib/utils";
import { HiBookOpen, HiOutlineBuildingOffice, HiOutlineBuildingOffice2, HiOutlineHeart, HiOutlineHomeModern, HiOutlineMapPin, HiOutlineUserGroup } from "react-icons/hi2";
import { FiUploadCloud } from "react-icons/fi";
import Link from "next/link";
import { useFetchUser } from "@/hooks/elaut/user/useFetchUser";
import { MdWork } from "react-icons/md";
import { Checkbox } from "../ui/checkbox";
import { User } from "@/types/user";
import { FaLock } from "react-icons/fa6";

interface DetailRegistrasiPelatihanProps {
    data: DetailPelatihanMasyarakat;
    isRegistrasi: boolean;
    handleRegistration: () => void;
}

const DetailRegistrasiPelatihan: React.FC<DetailRegistrasiPelatihanProps> = ({
    data,
    isRegistrasi,
    handleRegistration,
}) => {
    const router = useRouter();
    const detailPelatihanUrl = usePathname()
    const [isAgreeWithAggreement, setIsAgreeWithAgreement] =
        React.useState<boolean>(false);

    const { userDetail, isLoading, fetchUser } = useFetchUser();

    React.useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (!userDetail) return null;

    const requiredFields: (keyof User)[] = [
        "Nama",
        "Nik",
        "NoTelpon",
        "JenisKelamin",
        "TempatLahir",
        "TanggalLahir",
        "Provinsi",
        "Kota",
        "Alamat",
        "Pekerjaan",
        "Ktp",
    ];

    const isProfileComplete = requiredFields.every(
        (field) => userDetail?.[field] && userDetail?.[field] !== ""
    );


    return (
        <div className="relative w-full md:mt-28">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-10 items-start">

                <div className="flex-1 flex flex-col gap-6 relative">
                    <div className="flex gap-2 absolute top-4 right-4 z-[99999]">

                        {data.StatusApproval === "Selesai" && (
                            <span className=" flex items-center gap-2 bg-red-500/90 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                                <RiTimeZoneLine className="w-5 h-5" />
                                Telah Berakhir
                            </span>
                        )}
                    </div>

                    {/* Price + Info */}
                    <div className="border border-white/15 bg-white/10 backdrop-blur-xl 
                    shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-all duration-500 
                     hover:border-blue-400/40 rounded-3xl p-5 md:p-8 flex flex-col gap-3">

                        <div className="relative w-full flex md:flex-row flex-col gap-2 items-start">
                            <div className={`${data.FotoPelatihan == "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? "" : ""}  rounded-3xl p-7 bg-gradient-to-br from-blue-500/70 to-sky-600/20 text-gray-200  backdrop-blur-xl 
                    shadow-[0_8px_40px_rgba(0,0,0,0.35)] border-white/20 border w-full h-fit`}>
                                <h1 className="text-2xl md:text-3xl  font-calsans leading-none mb-6 max-w-3xl">
                                    <HiBookOpen className="w-8 h-8 flex-shrink-0 inline" />
                                    {data.NamaPelatihan}
                                </h1>
                                <p className="mt-2 flex items-center gap-2 text-sm">
                                    <HiOutlineUserGroup className="w-5 h-5 flex-shrink-0 text-blue-300" />
                                    Pendaftar :  {data?.UserPelatihan.length}/{data?.KoutaPelatihan} Pendaftar
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-sm">
                                    <TbBook className="w-5 h-5 flex-shrink-0 text-blue-300" />
                                    Bidang : {data.JenisProgram}
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-sm">
                                    <TbSchool className="w-5 h-5 flex-shrink-0 text-blue-300" />
                                    Program : {data.Program}
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-sm">
                                    <TbMoneybag className="w-5 h-5 flex-shrink-0 text-blue-300" />
                                    Biaya : {data.HargaPelatihan === 0
                                        ? "Gratis"
                                        : `${formatToRupiah(data.HargaPelatihan)}`}
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-sm">
                                    <TbBuilding className="w-5 h-5 flex-shrink-0 text-blue-300" />
                                    Penyelenggara : {data.PenyelenggaraPelatihan}
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-sm">
                                    <TbCalendarEvent className="w-5 h-5 flex-shrink-0 text-blue-300" />
                                    Pendaftaran : {data!.TanggalMulaiPendaftaran != '' ? <>{generateTanggalPelatihan(data.TanggalMulaiPendaftaran)} - {generateTanggalPelatihan(data.TanggalAkhirPendaftaran)}</> : <>-</>}
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-sm">
                                    <TbClock className="w-5 h-5 flex-shrink-0 text-blue-300" />
                                    Pelaksanaan : {generateTanggalPelatihan(data.TanggalMulaiPelatihan)} - {generateTanggalPelatihan(data.TanggalBerakhirPelatihan)}
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-sm">
                                    <TbLocation className="w-5 h-5 flex-shrink-0 text-blue-300" />
                                    Lokasi : {data.LokasiPelatihan}
                                </p>
                            </div>


                        </div>

                        {
                            isProfileComplete ? <div className="relative w-full flex md:flex-row flex-col gap-2 items-start">
                                <div className={`${data.FotoPelatihan == "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? "" : ""}  rounded-3xl p-7  text-gray-200  backdrop-blur-xl 
                    shadow-[0_8px_40px_rgba(0,0,0,0.35)] border-white/20 border w-full h-fit`}>
                                    <h1 className="text-2xl md:text-3xl   font-calsans leading-none mb-6 ">
                                        <TbEdit className="w-8 h-8 flex-shrink-0 inline" />
                                        Form Pendaftaran Pelatihan
                                    </h1>
                                    <p
                                        className="text-sm peer-disabled:cursor-not-allowed text-gray-200 peer-disabled:opacity-70 mb-5"
                                    >
                                        Harap pastikan data Sobat E-LAUT dibawah ini merupakan data valid dan sudah benar, apabila terdapat perubahan data silahkan edit di <Link className="text-white font-medium underline" href="/dashboard/edit-profile">Halaman Edit Profile</Link>. Karena akan digunakan untuk kebutuhan sertifikat (STTPL).
                                    </p>


                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Nama */}
                                        <div className="flex flex-col space-y-1">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                                <HiOutlineUser className="text-lg" />
                                                Nama
                                            </label>
                                            <input
                                                type="text"
                                                value={userDetail.Nama}
                                                readOnly
                                                className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        {/* NIK */}
                                        <div className="flex flex-col space-y-1">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                                <HiOutlineIdentification className="text-lg" />
                                                NIK
                                            </label>
                                            <input
                                                type="text"
                                                value={userDetail.Nik}
                                                readOnly
                                                className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        {/* Telepon */}
                                        <div className="flex flex-col space-y-1">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                                <HiOutlinePhone className="text-lg" />
                                                No. Telepon/Whatsapp
                                            </label>
                                            <input
                                                type="text"
                                                value={userDetail.NoTelpon}
                                                readOnly
                                                className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        {/* Jenis Kelamin */}
                                        <div className="flex flex-col space-y-1">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                                <HiOutlineHeart className="text-lg" />
                                                Jenis Kelamin
                                            </label>
                                            <input
                                                type="text"
                                                value={userDetail.JenisKelamin}
                                                readOnly
                                                className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        {/* Tempat Lahir */}
                                        <div className="flex flex-col space-y-1">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                                <HiOutlineMapPin className="text-lg" />
                                                Tempat Lahir
                                            </label>
                                            <input
                                                type="text"
                                                value={userDetail.TempatLahir}
                                                readOnly
                                                className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        {/* Tanggal Lahir */}
                                        <div className="flex flex-col space-y-1">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                                <HiOutlineCalendar className="text-lg" />
                                                Tanggal Lahir
                                            </label>
                                            <input
                                                type="text"
                                                value={userDetail.TanggalLahir}
                                                readOnly
                                                className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        {/* Provinsi */}
                                        <div className="flex flex-col space-y-1">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                                <HiOutlineBuildingOffice className="text-lg" />
                                                Provinsi (Domisili)
                                            </label>
                                            <input
                                                type="text"
                                                value={userDetail.Provinsi}
                                                readOnly
                                                className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        {/* Kab/Kota */}
                                        <div className="flex flex-col space-y-1">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                                <HiOutlineBuildingOffice2 className="text-lg" />
                                                Kab/Kota (Domisili)
                                            </label>
                                            <input
                                                type="text"
                                                value={userDetail.Kota}
                                                readOnly
                                                className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        {/* Alamat */}
                                        <div className="flex flex-col space-y-1">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                                <HiOutlineHomeModern className="text-lg" />
                                                Alamat
                                            </label>
                                            <input
                                                type="text"
                                                value={userDetail.Alamat}
                                                readOnly
                                                className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        {/* Pekerjaan */}
                                        <div className="flex flex-col space-y-1">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                                <MdWork className="text-lg" />
                                                Pekerjaan
                                            </label>
                                            <input
                                                type="text"
                                                value={userDetail.Pekerjaan}
                                                readOnly
                                                className="w-full rounded-xl px-4 py-2 bg-white/10 border border-white/20 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>


                                    </div>

                                    <button
                                        onClick={() => window.open(userDetail.Ktp, "_blank")}
                                        className="relative w-full h-40 rounded-2xl border border-white/20
                                    bg-white/10 backdrop-blur-lg shadow-lg
                                    flex flex-col justify-center items-center gap-0
                                    transition hover:bg-white/20 mt-4"
                                    >
                                        <FaRegFileImage className="text-4xl text-white drop-shadow mb-3" />
                                        <span className="text-white text-lg font-semibold leading-none">
                                            Lihat File KTP/Identitas
                                        </span>
                                        <span className="text-xs text-white/70">Klik untuk membuka file</span>
                                    </button>

                                    <div className="w-full flex items-end justify-end max-w-7xl">
                                        <div className="flex items-center space-x-2 py-3 mt-5">
                                            <Checkbox
                                                id="terms"
                                                checked={isAgreeWithAggreement}
                                                onCheckedChange={(e) =>
                                                    setIsAgreeWithAgreement(!isAgreeWithAggreement)
                                                }
                                            />
                                            <label
                                                htmlFor="terms"
                                                className="text-sm  peer-disabled:cursor-not-allowed text-gray-200 peer-disabled:opacity-70"
                                            >
                                                Dengan melakukan pendaftaran, saya setuju dengan Kebijakan{" "}
                                                <span className="text-blue-500 font-bold">Privasi</span> dan{" "}
                                                <span className="text-blue-500 font-bold">
                                                    Syarat & Ketentuan
                                                </span>{" "}
                                                Kementrian Kelautan dan Perikanan Republik Indonesia serta sanggup mengikuti kegiatan pelatihan secara penuh
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => router.replace("/registrasi")}
                                        className="bg-gradient-to-r w-full from-blue-600 to-sky-600 flex gap-2 items-center hover:from-blue-700 hover:to-sky-700 text-white font-bold px-10 py-6 rounded-full text-lg transition"
                                    >
                                        <FiUploadCloud />DAFTAR PELATIHAN
                                    </Button>
                                </div>


                            </div>
                                : <div className="flex justify-center items-center w-full">
                                    <div
                                        className="rounded-3xl p-10 text-gray-200 backdrop-blur-xl
          shadow-[0_8px_40px_rgba(0,0,0,0.35)] border-white/20 border 
          w-full flex flex-col items-center justify-center space-y-2"
                                    >
                                        <FaLock className="text-5xl text-red-400" />
                                        <h2 className="text-xl font-bold text-center leading-none">
                                            Maaf, kamu tidak bisa melanjutkan pendaftaran
                                        </h2>
                                        <p className="text-center text-sm text-gray-300">
                                            Harap untuk melengkapi data profil kamu terlebih dahulu  pada <Link className="text-white font-medium underline" href="/dashboard/edit-profile">Halaman Edit Profile</Link>
                                        </p>
                                    </div>
                                </div>
                        }



                    </div>
                </div>
            </div>
        </div >
    );
};



export default DetailRegistrasiPelatihan;
