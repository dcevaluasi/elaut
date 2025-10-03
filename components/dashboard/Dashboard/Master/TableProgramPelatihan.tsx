"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import { useFetchDataProgramPelatihan } from "@/hooks/elaut/master/useFetchDataProgramPelatihan";
import ManageProgramPelatihanAction from "@/commons/actions/master/program-pelatihan/ManageProgramPelatihanAction";
import { FiBookOpen, FiTrash2, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { elautBaseUrl } from "@/constants/urls";
import { findNameRumpunPelatihanById } from "@/utils/programs";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaShieldAlt,
    FaShip,
    FaTools,
    FaFish,
    FaLeaf,
    FaGlobeAmericas,
    FaWater,
    FaAnchor,
    FaIndustry,
    FaHandsHelping,
    FaBook,
} from "react-icons/fa";
import { ProgramPelatihan } from "@/types/program";
import { generatedDescriptionCertificateFull } from "@/utils/certificates";
import { canManageProgram, canManageProgramUPT } from "@/utils/permissions";
const rumpunIcons: Record<string, JSX.Element> = {
    "Sistem Jaminan Mutu": <FaShieldAlt className="text-blue-500" />,
    "Pembentukan Keahlian Awak Kapal Perikanan (AKP)": <FaShip className="text-indigo-500" />,
    "Peningkatan Keahlian Awak Kapal Perikanan (AKP)": <FaTools className="text-emerald-500" />,
    "Budi Daya": <FaFish className="text-cyan-500" />,
    "Pengolahan dan Pemasaran": <FaIndustry className="text-rose-500" />,
    "Konservasi dan Kemitigasian": <FaLeaf className="text-green-600" />,
    "Kelautan dan Kemaritiman (Garam, Oceanografi,Biologi, Iklim, Marine Debris)":
        <FaGlobeAmericas className="text-teal-500" />,
    "Pengawasan dan Kepelabuhan Perikanan": <FaAnchor className="text-sky-600" />,
    "Teknis Lainnya (Rekayasa Sosial, Enumerator, Koperasi, Dll)":
        <FaHandsHelping className="text-orange-500" />,
    "Permesinan dan Mekanisasi": <FaWater className="text-violet-500" />,
    default: <FaBook className="text-gray-500" />,
};

export default function TableProgramPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data, loading, error, fetchProgramPelatihan } = useFetchDataProgramPelatihan();
    const { data: dataRumpunPelatihan } = useFetchDataRumpunPelatihan();

    const [openRumpun, setOpenRumpun] = useState<string | null>(null);

    const groupedData = useMemo(() => {
        if (!Array.isArray(data)) return {};

        const query = (searchQuery ?? "").toLowerCase();
        const filtered = data.filter((row) =>
            !query ||
            Object.values(row).some((val) => {
                if (val == null) return false;
                if (typeof val === "object") return false;
                return String(val).toLowerCase().includes(query);
            })
        );

        return filtered.reduce((acc, row) => {
            const rumpunName = findNameRumpunPelatihanById(
                dataRumpunPelatihan,
                row.id_rumpun_pelatihan.toString()
            )?.name || "Lainnya";

            if (!acc[rumpunName]) acc[rumpunName] = [];
            acc[rumpunName].push(row);
            return acc;
        }, {} as Record<string, any[]>);
    }, [data, dataRumpunPelatihan, searchQuery]);

    const [openRowId, setOpenRowId] = useState<number | null>(null);

    if (loading) return <p className="text-center py-10 text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mt-10">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Program Pelatihan</h2>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <Input
                        type="text"
                        placeholder="Cari program..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-48 py-1 text-sm"
                    />

                    <ManageProgramPelatihanAction onSuccess={fetchProgramPelatihan} />

                </div>
            </div>

            {/* Grouped Rumpun */}
            <div className="space-y-4">
                {Object.entries(groupedData).map(([rumpunName, programs]) => (
                    <div
                        key={rumpunName}
                        className="border rounded-xl shadow-sm bg-white"
                    >
                        {/* Rumpun Header */}
                        <button
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                            onClick={() =>
                                setOpenRumpun(openRumpun === rumpunName ? null : rumpunName)
                            }
                        >
                            <div className="flex items-center gap-3">
                                {rumpunIcons[rumpunName] || rumpunIcons.default}
                                <span className="font-semibold text-gray-800">{rumpunName}</span>
                                <span className="text-sm text-gray-500">({programs.length} program) </span>
                            </div>
                            {openRumpun === rumpunName ? (
                                <FiChevronDown className="text-gray-500" />
                            ) : (
                                <FiChevronRight className="text-gray-500" />
                            )}
                        </button>

                        {/* Program List */}
                        <AnimatePresence initial={false}>
                            {openRumpun === rumpunName && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <table className="w-full text-sm border-t">
                                        <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                                            <tr>
                                                <th className="px-3 py-2 text-center w-12">No</th>
                                                <th className="px-3 py-2 text-center w-32">Action</th>
                                                <th className="px-3 py-2 text-center">Nama Jenis/Program Pelatihan</th>
                                                <th className="px-3 py-2 text-center">Description</th>
                                                <th className="px-3 py-2 text-center">Singkatan</th>
                                                <th className="px-3 py-2 text-center">Materi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {programs.map((row: ProgramPelatihan, idx) => (
                                                <React.Fragment key={row.id_program_pelatihan}>
                                                    {/* Main Row */}
                                                    <tr className="hover:bg-gray-50">
                                                        <td className="text-center text-gray-500 px-3 py-2">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            {canManageProgram(rumpunName) && <div className="flex justify-center gap-2">
                                                                <ManageProgramPelatihanAction
                                                                    onSuccess={fetchProgramPelatihan}
                                                                    initialData={row}
                                                                />
                                                                <button
                                                                    onClick={async () => {
                                                                        const confirmDelete = window.confirm("⚠️ Hapus program ini?");
                                                                        if (!confirmDelete) return;
                                                                        try {
                                                                            const res = await fetch(
                                                                                `${elautBaseUrl}/program_pelatihan/delete_program_pelatihan?id=${row.id_program_pelatihan}`,
                                                                                { method: "DELETE" }
                                                                            );
                                                                            if (!res.ok) throw new Error("Gagal menghapus program");
                                                                            fetchProgramPelatihan();
                                                                            alert("✅ Berhasil dihapus");
                                                                        } catch (error) {
                                                                            console.error(error);
                                                                            alert("❌ Gagal menghapus");
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-2 w-fit rounded-lg px-3 py-1 shadow-sm transition bg-transparent border border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500"
                                                                >
                                                                    <FiTrash2 />
                                                                </button>
                                                            </div>}

                                                            {
                                                                canManageProgramUPT(rumpunName) && <div className="flex justify-center gap-2">
                                                                    <ManageProgramPelatihanAction
                                                                        onSuccess={fetchProgramPelatihan}
                                                                        initialData={row}
                                                                    />
                                                                    <button
                                                                        onClick={async () => {
                                                                            const confirmDelete = window.confirm("⚠️ Hapus program ini?");
                                                                            if (!confirmDelete) return;
                                                                            try {
                                                                                const res = await fetch(
                                                                                    `${elautBaseUrl}/program_pelatihan/delete_program_pelatihan?id=${row.id_program_pelatihan}`,
                                                                                    { method: "DELETE" }
                                                                                );
                                                                                if (!res.ok) throw new Error("Gagal menghapus program");
                                                                                fetchProgramPelatihan();
                                                                                alert("✅ Berhasil dihapus");
                                                                            } catch (error) {
                                                                                console.error(error);
                                                                                alert("❌ Gagal menghapus");
                                                                            }
                                                                        }}
                                                                        className="flex items-center gap-2 w-fit rounded-lg px-3 py-1 shadow-sm transition bg-transparent border border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500"
                                                                    >
                                                                        <FiTrash2 />
                                                                    </button>
                                                                </div>
                                                            }

                                                        </td>
                                                        <td className="text-left px-3 py-2">
                                                            <div className="flex flex-col !font-normal">
                                                                <p className="text-base font-semibold leading-tight">{row.name_indo}</p>
                                                                <span className="text-sm text-gray-400 leading-tight">{row.name_english}</span>
                                                            </div>
                                                        </td>

                                                        {/* Description Toggle */}
                                                        <td className="text-center px-3 py-2">
                                                            <button
                                                                onClick={() => setOpenRowId(openRowId === row.id_program_pelatihan ? null : row.id_program_pelatihan)}
                                                                className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600"
                                                            >
                                                                <span>Deskripsi</span>
                                                                {openRowId === row.id_program_pelatihan ? (
                                                                    <FiChevronDown className="text-gray-500" />
                                                                ) : (
                                                                    <FiChevronRight className="text-gray-500" />
                                                                )}
                                                            </button>
                                                        </td>

                                                        <td className="text-center px-3 py-2">{row.abbrv_name}</td>
                                                        <td className="text-center px-3 py-2">

                                                            <Link
                                                                href={`/admin/lemdiklat/master/program-pelatihan/materi/${row.name_indo}`}
                                                                target="_blank"
                                                                className="flex items-center gap-2 w-fit mx-auto rounded-lg px-3 py-1 shadow-sm transition bg-transparent border border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                                                            >
                                                                <FiBookOpen />
                                                                Materi
                                                            </Link>



                                                        </td>
                                                    </tr>

                                                    {/* Expanded Row */}
                                                    <tr>
                                                        <td colSpan={6} className="p-0">
                                                            <AnimatePresence>
                                                                {openRowId === row.id_program_pelatihan && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.25 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="px-6 py-4 bg-gray-50 border-t text-left space-y-1">
                                                                            <p className="text-sm text-gray-700">
                                                                                <span className="font-semibold">Header STTPL Indo:</span>{" "}
                                                                                {generatedDescriptionCertificateFull(row.description).desc_indo}
                                                                            </p>
                                                                            <p className="text-sm text-gray-700">
                                                                                <span className="font-semibold">Header STTPL Inggris:</span>{" "}
                                                                                {generatedDescriptionCertificateFull(row.description).desc_eng}
                                                                            </p>
                                                                            {
                                                                                generatedDescriptionCertificateFull(row.description).body_indo != "" && <p className="text-sm text-gray-700">
                                                                                    <span className="font-semibold">Deskripsi STTPL Indo:</span>{" "}
                                                                                    {generatedDescriptionCertificateFull(row.description).body_indo}
                                                                                </p>
                                                                            }
                                                                            {
                                                                                generatedDescriptionCertificateFull(row.description).body_eng != "" && <p className="text-sm text-gray-700">
                                                                                    <span className="font-semibold">Deskripsi STTPL Inggris:</span>{" "}
                                                                                    {generatedDescriptionCertificateFull(row.description).body_eng}
                                                                                </p>
                                                                            }
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </tbody>

                                    </table>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}


