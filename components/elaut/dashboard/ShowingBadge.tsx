'use client'

import { Badge } from "@/components/ui/badge"
import { PelatihanMasyarakat } from "@/types/product"
import { PiRecordFill } from "react-icons/pi"

const ShowingBadge = ({ data, isFlying }: { data: PelatihanMasyarakat, isFlying?: boolean }) => {
    const colorBadge = (text: string): string => {
        if (text == 'Telah Ditandatangani Ka BPPSDM KP') {
            return 'bg-green-200 text-green-500'
        } else {
            return 'bg-gray-300 text-neutral-500'
        }
    }
    return <>
        <Badge
            variant="outline"
            className={`${isFlying && 'top-4 right-4 absolute'} cursor-pointer  
        ${colorBadge(data!.PemberitahuanDiterima)} animate-pulse duration-700`}
        >
            <PiRecordFill />
            {data!.PemberitahuanDiterima}
        </Badge>
    </>

}

export default ShowingBadge