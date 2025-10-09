'use client'

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import axios, { isAxiosError } from 'axios';
import { UserPelatihan } from '@/types/user';
import { addFiveYears } from '@/utils/pelatihan';
import { generateTanggalPelatihan } from '@/utils/text';
import { RiQuillPenAiLine, RiVerifiedBadgeFill } from 'react-icons/ri';
import { FiUser, FiBookOpen, FiCalendar, FiFileText, FiEdit3, FiMapPin } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import Footer from '@/components/ui/footer';
import { HashLoader } from 'react-spinners';
import { PelatihanMasyarakat } from '@/types/product';
import { HiOutlineInbox } from 'react-icons/hi2';
import { FaRegBuilding } from 'react-icons/fa';

const CertificateResultPage = () => {
    const params = useParams();
    const no_sertifikat = params?.no_sertifikat;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<UserPelatihan | null>(null);
    const [dataPelatihan, setDataPelatihan] = useState<PelatihanMasyarakat | null>(null)
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!no_sertifikat || typeof no_sertifikat !== 'string') return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/cekSertifikat`, {
                    no_registrasi: no_sertifikat,
                });
                setData(res.data.data);
                setDataPelatihan(res.data.pelatihan)
                setError(null);
            } catch (err) {
                if (isAxiosError(err)) {
                    setError(err.response?.data?.Pesan || 'Terjadi kesalahan');
                } else {
                    setError('Terjadi kesalahan tidak diketahui');
                }
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [no_sertifikat]);

    return (
        <>
            <Head>
                <title>Cek Sertifikat: {no_sertifikat}</title>
            </Head>

            <main className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 p-6 flex items-center justify-center relative">
                <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="pointer-events-none absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 max-w-xl w-full text-white mt-10">
                    {loading ? (
                        <div className="py-32 w-full items-center flex justify-center">
                            <HashLoader color="#e5e5e5" size={50} />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400">
                            <p className="font-semibold">⚠ Oops! {error}</p>
                        </div>
                    ) : data ? (
                        <div className="text-center">
                            {/* Verified Badge */}
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-b from-blue-400/60 via-blue-300/20 to-transparent flex items-center justify-center animate-pulse mb-6 shadow-lg">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                    <RiVerifiedBadgeFill className="h-12 w-12 text-neutral-200 drop-shadow-[0_0_15px_#3b82f6]" />
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl leading-none max-w-md font-bold text-blue-400 mb-3">
                                {data.NoRegistrasi}
                            </h1>
                            <p className="text-gray-200 mb-6 leading-relaxed">
                                Sertifikat valid dan dinyatakan telah mengikuti pelatihan{" "}
                                <span className="font-semibold text-white">
                                    {data?.NamaPelatihan}
                                </span>{" "}
                                bidang{" "}
                                <span className="font-semibold text-white">
                                    {data?.BidangPelatihan}
                                </span>{" "}
                                dan memiliki sertifikat kelulusan dengan detail sebagai berikut :
                            </p>

                            {/* Certificate Details with Icons */}
                            <div className="text-left space-y-3 text-sm">
                                <p className="flex items-center gap-2">
                                    <FiUser className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                    <span><strong className="text-blue-300">Nama Peserta:</strong> {data.Nama}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <FiBookOpen className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                    <span><strong className="text-blue-300">Nama Pelatihan:</strong> {data.NamaPelatihan}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <FaRegBuilding className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                    <span><strong className="text-blue-300">Penyelenggara:</strong> {dataPelatihan?.PenyelenggaraPelatihan}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <HiOutlineInbox className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                    <span><strong className="text-blue-300">Bidang atau Klaster Pelatihan:</strong> {dataPelatihan?.BidangPelatihan}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <RiQuillPenAiLine className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                    <span><strong className="text-blue-300">Program Pelatihan:</strong> {dataPelatihan?.Program}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <FiCalendar className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                    <span><strong className="text-blue-300">Tanggal Pelaksanaan:</strong> {generateTanggalPelatihan(data.TanggalMulai)} - {generateTanggalPelatihan(data.TanggalBerakhir)}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <FiMapPin className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                    <span><strong className="text-blue-300">Lokasi Pelaksanaan:</strong> {dataPelatihan?.LokasiPelatihan}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <FiFileText className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                    <span><strong className="text-blue-300">Diterbitkan Pada:</strong> {data.TanggalSertifikat}</span>
                                </p>

                                <p className="flex items-center gap-2">
                                    <FiEdit3 className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                    <span><strong className="text-blue-300">Ditandatangani Oleh:</strong> {dataPelatihan?.TtdSertifikat}</span>
                                </p>
                                <p className="italic text-xs text-gray-400 mt-4">
                                    * Sertifikat berlaku hingga{" "}
                                    <span className="font-semibold text-gray-200">{addFiveYears(data.TanggalSertifikat)}</span> dan telah ditandatangani secara elektronik menggunakan
                                    sertifikat elektronik yang telah diterbitkan oleh Balai
                                    Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara
                                </p>
                            </div>

                        </div>
                    ) : null}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default CertificateResultPage;
