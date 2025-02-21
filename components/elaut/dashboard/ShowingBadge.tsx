'use client'

import { Badge } from "@/components/ui/badge"
import { PelatihanMasyarakat } from "@/types/product"
import { usePathname } from "next/navigation"
import { PiRecordFill } from "react-icons/pi"

const ShowingBadge = ({ data, isFlying }: { data: PelatihanMasyarakat, isFlying?: boolean }) => {
    const isAdminBalaiPelatihan: boolean = usePathname().includes('lemdiklat')
    return <>
        <Badge
            variant="outline"
            className={`${isFlying && 'top-4 right-4 absolute'} cursor-pointer  bg-gray-300 text-neutral-800 hover:bg-gray-400 animate-pulse duration-700`}
        >
            <PiRecordFill />
            {data!.PemberitahuanDiterima}
        </Badge>
    </>

}

export default ShowingBadge