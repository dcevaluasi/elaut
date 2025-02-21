'use client'

import { Badge } from "@/components/ui/badge"
import { PelatihanMasyarakat } from "@/types/product"
import { usePathname } from "next/navigation"

const ShowingBadge = ({ data, isFlying }: { data: PelatihanMasyarakat, isFlying?: boolean }) => {
    const isAdminBalaiPelatihan: boolean = usePathname().includes('lemdiklat')
    return <>
        {/* Kondisi terpenuhi ketika balai pelatihan telah berhasil mengajukan permohonan serta menginput no sertifikat */}
        {
            (data!.TtdSertifikat != '' && data!.NoSertifikat != '') && (
                <Badge
                    variant="outline"
                    className={`${isFlying && 'top-4 right-4 absolute'} cursor-pointer text-neutral-800 bg-yellow-300 hover:bg-yellow-400`}
                >
                    {isAdminBalaiPelatihan ? 'Sedang Diverifikasi Pengajuan Penerbitan' : 'Segera Verifikasi Pengajuan Penerbitan'}
                </Badge>
            )
        }


        {data!.TtdSertifikat !=
            "" && (
                <Badge
                    variant="outline"
                    className={`${isFlying && 'top-4 right-4 absolute'} cursor-pointer  bg-yellow-300 text-neutral-800 hover:bg-yellow-400`}
                >
                    Pengajuan Penerbitan Sedang Diverifikasi
                </Badge>
            )}

        {data!.StatusPenerbitan ==
            "" && (
                <Badge
                    variant="outline"
                    className={`${isFlying && 'top-4 right-4 absolute'} cursor-pointer  bg-gray-300 text-neutral-800 hover:bg-gray-400`}
                >
                    Segera Upload Surat Pemberitahuan
                </Badge>
            )}

        {
            data!.TtdSertifikat != '' && data!.StatusPenerbitan == 'Sudah Diverifikasi Penerbitan' && <Badge
                variant="outline"
                className={`${isFlying && 'top-4 right-4 absolute'} cursor-pointer  bg-blue-500 text-white hover:bg-blue-600`}
            >
                Generate File Sertifikat
            </Badge>
        }

        {(data!.StatusPenerbitan ==
            "Sudah Diverifikasi Pelaksanaan" && data!.TtdSertifikat == '') && (
                <Badge
                    variant="outline"
                    className={`${isFlying && 'top-4 right-4 absolute'} cursor-pointer  bg-green-500 text-white hover:bg-green-600`}
                >
                    Pelaksanaan Telah Diverifikasi
                </Badge>
            )}

        {(data!.StatusPenerbitan ==
            "Verifikasi Pelaksanaan" && data!.TtdSertifikat == '') && (
                <Badge
                    variant="outline"
                    className={`${isFlying && 'top-4 right-4 absolute'} cursor-pointer bg-yellow-300 text-neutral-800 hover:bg-yellow-400`}
                >
                    {
                        usePathname().includes('pusat') ? 'Segera Verifikasi' : 'Menunggu Verifikasi'
                    }
                </Badge>
            )}

    </>

}

export default ShowingBadge