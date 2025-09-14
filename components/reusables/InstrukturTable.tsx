"use client";

import React from "react";
import { Instruktur } from "@/types/instruktur";
import { truncateText } from "@/utils";

type Props = {
    data: Instruktur[]
    fetchData: any
}

export default function InstrukturTable({ data, fetchData }: Props) {
    return (
        <div className="space-y-4">
            <div className="overflow-x-scroll border border-gray-200 rounded-xl shadow-sm">
                <table className=" table-fixed text-sm border-collapse">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className=" bg-gray-100 w-12 px-3 py-3 text-center border">
                                No
                            </th>

                            <th className=" bg-gray-100 w-40 px-3 py-3 text-center border">
                                Informasi
                            </th>

                            <th className=" bg-gray-100 w-40 px-3 py-3 text-center border">
                                Management of Training
                            </th>
                            <th className=" bg-gray-100 w-40 px-3 py-3 text-center border">
                                Trainer of Training
                            </th>
                            <th className=" bg-gray-100 w-28 px-3 py-3 text-center border">
                                Sertifikat
                            </th>
                            <th className=" bg-gray-100 w-24 px-3 py-3 text-center border">
                                Status
                            </th>
                            <th className=" bg-gray-100 w-28 px-3 py-3 text-center border">
                                Pendidikan Terakhir
                            </th>
                            <th className=" bg-gray-100 w-40 px-3 py-3 text-center border">
                                Eselon I
                            </th>
                            <th className=" bg-gray-100 w-40 px-3 py-3 text-center border">
                                Eselon II
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {data.map((row, index) => (
                            <tr
                                key={row.IdInstruktur}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                {/* Sticky Columns */}
                                <td className="  px-3 py-2 border text-center text-gray-500">
                                    {index + 1}
                                </td>

                                <td
                                    className="  px-3 py-2 border w-full"
                                    title={row.nama}
                                >
                                    <span className="font-se">{row.nama}</span>
                                    <div>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            NIP :  {row.nip}
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            Email :  {row.email}
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            No Telpon :  {row.no_telpon}
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            Bidang Keahlian :  {row.bidang_keahlian}
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            Jabatan dan Pangkat/Golongan :  {row.jenjang_jabatan} - {row.pelatihan_pelatih}
                                        </p>
                                    </div>
                                </td>

                                <td
                                    className="px-3 py-2 border max-w-[200px] text-blue-600 underline truncate"
                                    title={row.management_of_training}
                                >
                                    <a
                                        href={row.management_of_training}
                                        target="_blank"
                                        rel="noopener noreferrer "
                                        className="truncate"
                                    >
                                        {row.management_of_training}
                                    </a>
                                </td>
                                <td
                                    className="px-3 py-2 border max-w-[200px] text-blue-600 underline truncate"
                                    title={row.training_officer_course}
                                >
                                    <a
                                        href={row.link_data_dukung_sertifikat}
                                        target="_blank"
                                        rel="noopener noreferrer "
                                        className="truncate"
                                    >
                                        {row.training_officer_course}
                                    </a>
                                </td>
                                <td className="px-3 py-2 border text-blue-600 underline text-center truncate">
                                    <a
                                        href={row.link_data_dukung_sertifikat}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="truncate"
                                    >
                                        {truncateText(row.link_data_dukung_sertifikat, 20, "...")}
                                    </a>
                                </td>
                                <td className="px-3 py-2 border text-center">{row.status}</td>
                                <td className="px-3 py-2 border text-center">{row.pendidikkan_terakhir}</td>
                                <td className="px-3 py-2 border max-w-[200px] truncate" title={row.eselon_1}>
                                    {row.eselon_1}
                                </td>
                                <td className="px-3 py-2 border max-w-[200px] truncate" title={row.eselon_2}>
                                    {row.eselon_2}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={18} className="text-center py-6 text-gray-500 italic">
                                    Tidak ada data ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

