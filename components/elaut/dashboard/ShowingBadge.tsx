'use client'

import { Badge } from "@/components/ui/badge"
import { PelatihanMasyarakat } from "@/types/product"
import { usePathname } from "next/navigation"
import { PiRecordFill } from "react-icons/pi"

const ShowingBadge = ({ data, isFlying, isSupervisor }: { data: PelatihanMasyarakat, isFlying?: boolean, isSupervisor?: boolean }) => {
    const isAdminBalaiPelatihan: boolean = usePathname().includes('lemdiklat')
    return <>
        {
            isSupervisor ? <Badge
                variant="outline"
                className={`${isFlying && 'top-4 right-4 absolute'} cursor-pointer  bg-gray-300 text-neutral-800 hover:bg-gray-400 animate-pulse duration-700`}
            >
                <PiRecordFill />
                {
                    data!.PemberitahuanDiterima == 'Pengajuan Telah Dikirim ke SPV' && 'Perlu Di Approve'
                }
                {
                    data!.PemberitahuanDiterima == 'Pengajuan Telah Dikirim ke Kapuslat KP' && 'Sudah Dikirim ke Kapuslat KP'
                }
            </Badge> : <Badge
                variant="outline"
                className={`${isFlying && 'top-4 right-4 absolute'} cursor-pointer  bg-gray-300 text-neutral-800 hover:bg-gray-400 animate-pulse duration-700`}
            >
                <PiRecordFill />
                {
                    data!.PemberitahuanDiterima == 'Pengajuan Telah Dikirim ke SPV' ? 'Sudah Dikirim ke SPV' : ''
                }
            </Badge>
        }

    </>

}

export default ShowingBadge