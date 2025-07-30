'use client'

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import axios, { isAxiosError } from 'axios';
import { UserPelatihan } from '@/types/user';
import { addFiveYears } from '@/utils/pelatihan';
import { generateTanggalPelatihan } from '@/utils/text';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { useParams, useRouter } from 'next/navigation';

const CertificateResultPage = () => {
    const params = useParams();
    const no_sertifikat = params?.no_sertifikat;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<UserPelatihan | null>(null);
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

            <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-md p-6 max-w-xl w-full">
                    {loading ? (
                        <p className="text-center text-gray-500">Memuat data sertifikat...</p>
                    ) : error ? (
                        <div className="text-center text-red-500">
                            <p className="font-semibold">Oops! {error}</p>
                        </div>
                    ) : data ? (
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-b from-gray-200 via-whiter to-white flex items-center justify-center animate-pulse mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-gray-300 via-whiter to-white flex items-center justify-center animate-pulse">
                                    <RiVerifiedBadgeFill className="h-12 w-12 text-blue-500" />
                                </div>
                            </div>

                            <h1 className="text-xl font-bold text-blue-600 mb-2">{data.NoRegistrasi}</h1>
                            <p className="text-gray-600 mb-4">
                                Sertifikat atas nama <span className="font-semibold">{data.Nama}</span> telah lulus pelatihan <span className="font-semibold">{data.NamaPelatihan}</span> bidang <span className="font-semibold">{data.BidangPelatihan}</span>.
                            </p>

                            <div className="text-left space-y-2 text-sm text-gray-700">
                                <p><strong>Nama:</strong> {data.Nama}</p>
                                <p><strong>Nama Pelatihan:</strong> {data.NamaPelatihan}</p>


                                <p><strong>Tanggal Pelaksanaan:</strong> {generateTanggalPelatihan(data.TanggalMulai)} - {generateTanggalPelatihan(data.TanggalBerakhir)}</p>
                                <p><strong>Diterbitkan Pada:</strong> {data.TanggalSertifikat}</p>
                                <p><strong>Ditandatangani Oleh:</strong> Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan</p>
                                <p className="italic text-xs text-gray-400">
                                    * Sertifikat berlaku hingga {addFiveYears(data.TanggalSertifikat)}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>
        </>
    );
};

export default CertificateResultPage;
