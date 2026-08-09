import { LayananItem } from "@/types/layanan";

import {
    HiOutlineClipboardDocumentCheck,
    HiOutlineDocumentText,
    HiOutlineChatBubbleLeftRight,
    HiOutlineChartBar,
    HiOutlineChatBubbleBottomCenterText,
} from "react-icons/hi2";

export const LAYANAN_LANDING_MENU_ITEMS: LayananItem[] = [
    {
        href: "/layanan/regulasi",
        label: "Regulasi Pelatihan",
        icon: HiOutlineDocumentText,
    },
    {
        href: "/layanan/publik/maklumat-pelayanan",
        label: "Maklumat Pelayanan",
        icon: HiOutlineClipboardDocumentCheck,
    },
    {
        href: "/layanan/standar-pelayanan",
        label: "Standar Pelayanan",
        icon: HiOutlineDocumentText,
    },
    {
        href: "https://span.lapor.go.id",
        label: "SPAN Lapor",
        icon: HiOutlineChatBubbleLeftRight,
    },
    {
        href: "/layanan/survey-kepuasan",
        label: "Susan KKP",
        icon: HiOutlineChartBar,
    },
    {
        href: "/layanan/hasil-survey",
        label: "Hasil Survei",
        icon: HiOutlineChartBar,
    },
    {
        href: "/layanan/publik/masukan-saran",
        label: "Masukan & Saran",
        icon: HiOutlineChatBubbleBottomCenterText,
    },
    {
        href: "https://www.lapor.go.id",
        label: "e-Lapor",
        icon: HiOutlineChatBubbleBottomCenterText,
    },
    {
        href: "https://gol.kpk.go.id/login",
        label: "GOL KPK",
        icon: HiOutlineChatBubbleBottomCenterText,
    },
    {
        href: "https://wbs.kkp.go.id/register",
        label: "WBS",
        icon: HiOutlineChatBubbleBottomCenterText,
    },
]