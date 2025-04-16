import React, { ChangeEvent } from "react";
import {
    RiInformationFill,
    RiProgress3Line,
    RiVerifiedBadgeFill,
} from "react-icons/ri";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const invoices = [
    {
        invoice: "INV001",
        paymentStatus: "Paid",
        totalAmount: "$250.00",
        paymentMethod: "Credit Card",
    },
    {
        invoice: "INV002",
        paymentStatus: "Pending",
        totalAmount: "$150.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INV003",
        paymentStatus: "Unpaid",
        totalAmount: "$350.00",
        paymentMethod: "Bank Transfer",
    },
    {
        invoice: "INV004",
        paymentStatus: "Paid",
        totalAmount: "$450.00",
        paymentMethod: "Credit Card",
    },
    {
        invoice: "INV005",
        paymentStatus: "Paid",
        totalAmount: "$550.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INV006",
        paymentStatus: "Pending",
        totalAmount: "$200.00",
        paymentMethod: "Bank Transfer",
    },
    {
        invoice: "INV007",
        paymentStatus: "Unpaid",
        totalAmount: "$300.00",
        paymentMethod: "Credit Card",
    },
]

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { HiUserGroup } from "react-icons/hi2";
import { TbCalendarCheck, TbDatabase, TbEditCircle, TbSignature, TbTargetArrow } from "react-icons/tb";


import Image from "next/image";
import axios, { AxiosResponse } from "axios";
import { DataInformationSISJAMUTraining, InformationSISJAMUTraining, PelatihanMasyarakat } from "@/types/product";

import Cookies from "js-cookie";

import Link from "next/link";
import { elautBaseUrl } from "@/constants/urls";

import { Input } from "@/components/ui/input";
import { generateTanggalPelatihan } from "@/utils/text";
import { Button } from "@/components/ui/button";
import { MdClear } from "react-icons/md";
import { GrSend } from "react-icons/gr";
import { FiEdit2, FiSettings } from "react-icons/fi";
import { usePathname } from "next/navigation";
import Toast from "@/components/toast";
import { encryptValue } from "@/lib/utils";
import ShowingBadge from "@/components/elaut/dashboard/ShowingBadge";
import { IoRefreshSharp } from "react-icons/io5";
import { HashLoader } from "react-spinners";
import { AiOutlineFieldNumber } from "react-icons/ai";
import { ESELON_2, ESELON_3, UPT } from "@/constants/nomenclatures";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import getDocument from "@/firebase/firestore/getData";
import getAllDocuments from "@/firebase/firestore/getAllData";

const ManajemenInformasiSISJAMU: React.FC = () => {
    // PROCESSING DOCUMENTS OF INFORMATION SISJAMU TRAINING
    const [dataInformationSISJAMUTraining, setDataInformationSISJAMUTraining] = React.useState<DataInformationSISJAMUTraining[]>([])

    const handleFetchInformationSISJAMUTraining = async () => {
        const doc = await getAllDocuments('training-curricullums')
        setDataInformationSISJAMUTraining(doc.data as DataInformationSISJAMUTraining[])
        console.log({ doc })
    }

    React.useEffect(() => {
        handleFetchInformationSISJAMUTraining()
    }, [])

    // PROCESSING UPDATING DOCUMENTS OF INFORMATION SISJAMU TRAINING
    const [showEditForm, setShowEditForm] = React.useState<boolean>(false)
    const [dataInformationSISJAMUTrainingByIDDoc, setDataInformationSISJAMUTrainingByIDDoc] = React.useState<DataInformationSISJAMUTraining | null>(null)
    const handleFetchInformationSISJAMUTrainingByIDDoc = async (idDoc: string) => {
        const doc = await getDocument('training-curricullums', idDoc)
        setDataInformationSISJAMUTrainingByIDDoc(doc.data as DataInformationSISJAMUTraining)
        console.log({ doc })
    }

    const handleShowingEditForm = (idDoc: string) => {
        console.log({ idDoc })
        handleFetchInformationSISJAMUTrainingByIDDoc(idDoc)
        setShowEditForm(true)
    }


    console.log({ dataInformationSISJAMUTrainingByIDDoc })

    return (
        <div className="shadow-default -mt-10">

            <section className="px-4 mt-10 w-full">
                {
                    dataInformationSISJAMUTraining?.length == 0 ? <div className="py-32 w-full items-center flex justify-center">
                        <HashLoader color="#338CF5" size={50} />
                    </div> :
                        <div className="flex flex-col gap-1">

                            {dataInformationSISJAMUTraining?.length == 0 ? (
                                <div className="pt-12 md:pt-20 flex flex-col items-center">
                                    <Image
                                        src={"/illustrations/not-found.png"}
                                        alt="Not Found"
                                        width={0}
                                        height={0}
                                        className="w-[400px]"
                                    />
                                    <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
                                        <h1 className="text-3xl font-calsans leading-[110%] text-black">
                                            Belum Ada Pelatihan
                                        </h1>
                                        <div className="text-gray-600 text-sm text-center  max-w-md">
                                            Buka kelas pelatihan segera untuk dapat melihat berbagai
                                            macam pelatihan berdasarkan programnya!
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {dataInformationSISJAMUTraining.map((info, index) => (
                                        <Card key={index} className="relative">
                                            <CardHeader>
                                                <CardTitle>{info.id}</CardTitle>
                                                <CardDescription>
                                                    {info.naming.name_eng} • {info.naming.name_ind}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <Accordion type="single" collapsible className="w-full">
                                                    <TrainingSection
                                                        title="SUPM"
                                                        data={info.supm}
                                                        onEdit={() => handleShowingEditForm(info.id)}
                                                    />
                                                    <TrainingSection
                                                        title="Politeknik KP"
                                                        data={info.poltek}
                                                        onEdit={() => handleShowingEditForm(info.id)}
                                                    />
                                                </Accordion>
                                            </CardContent>
                                            <CardFooter />
                                        </Card>
                                    ))}


                                </>
                            )}
                        </div>
                }
            </section>
        </div>
    );
};

type TrainingSectionProps = {
    title: string
    data: InformationSISJAMUTraining
    onEdit: () => void
}

function TrainingSection({ title, data, onEdit }: TrainingSectionProps) {
    return (
        <AccordionItem value={title}>
            <AccordionTrigger>{title}</AccordionTrigger>
            <AccordionContent>
                <>
                    {/* Header */}
                    <div className="flex text-center font-plusSansJakarta font-bold">
                        <div className="w-1/12 px-2 flex items-center justify-center leading-none">NO</div>
                        <div className="w-7/12 px-2 flex flex-col justify-center items-start">
                            <div className="flex flex-row items-center justify-center">
                                <span className="text-base leading-none">MATERI</span>/
                                <span className="font-bos leading-none">COURSE</span>
                            </div>
                        </div>
                        <div className="w-4/12 px-2 flex items-center justify-center">
                            <div className="flex flex-row items-center justify-center">
                                <span className="text-base leading-none">ALOKASI WAKTU</span>/
                                <span className="font-bos leading-none">TIME ALLOCATION</span>
                            </div>
                        </div>
                    </div>

                    {/* Subheader */}
                    <div className="flex text-center font-plusSansJakarta font-bold">
                        <div className="w-8/12"></div>
                        <div className="w-2/12">
                            <div className="flex flex-row items-center justify-center">
                                <span className="text-base leading-none">TEORI</span>/
                                <span className="font-bos leading-none">THEORY</span>
                            </div>
                        </div>
                        <div className="w-2/12">
                            <div className="flex flex-row items-center justify-center">
                                <span className="text-base leading-none">PRAKTEK</span>/
                                <span className="font-bos leading-none">PRACTICE</span>
                            </div>
                        </div>
                    </div>

                    {/* General Competency */}
                    <div className="flex">
                        <div className="w-1/12 px-2 font-plusSansJakarta font-bold text-center">I</div>
                        <div className="w-9/12 px-2 font-plusSansJakarta font-bold">
                            <div className="flex flex-row items-center">
                                <span className="text-base leading-none">KOMPETENSI UMUM</span>/
                                <span className="font-bos leading-none">General Competency</span>
                            </div>
                        </div>
                    </div>

                    {data.general_competence.map((materi, index) => (
                        <div key={index} className={`flex text-sm ${index === data.general_competence.length - 1 && 'mb-3'}`}>
                            <div className="w-1/12 px-2 text-center">{index + 1}.</div>
                            <div className="w-7/12 px-2">
                                <div className="flex flex-col justify-center">
                                    <span className="text-base !font-plusSansJakarta not-italic font-normal leading-none">{materi.name}</span>
                                    <span className="italic font-bosItalic leading-none">{materi.english_name}</span>
                                </div>
                            </div>
                            <div className="w-2/12 px-2 text-center font-plusSansJakarta">{materi.theory_time}</div>
                            <div className="w-2/12 px-2 text-center font-plusSansJakarta">{materi.practice_time}</div>
                        </div>
                    ))}

                    {/* Core Competency */}
                    <div className="flex">
                        <div className="w-1/12 px-2 font-plusSansJakarta font-bold text-center">II</div>
                        <div className="w-9/12 px-2 font-plusSansJakarta font-bold">
                            <div className="flex flex-row items-center">
                                <span className="text-base leading-none">KOMPETENSI INTI</span>/
                                <span className="font-bos leading-none">Core Competency</span>
                            </div>
                        </div>
                    </div>

                    {data.main_competence.map((materi, index) => (
                        <div key={index} className={`flex text-sm ${index === data.main_competence.length - 1 && 'mb-3'}`}>
                            <div className="w-1/12 px-2 text-center">{index + 1}.</div>
                            <div className="w-7/12 px-2">
                                <div className="flex flex-col justify-center">
                                    <span className="text-base !font-plusSansJakarta not-italic font-normal leading-none">{materi.name}</span>
                                    <span className="italic font-bosItalic leading-none">{materi.english_name}</span>
                                </div>
                            </div>
                            <div className="w-2/12 px-2 text-center font-plusSansJakarta">{materi.theory_time}</div>
                            <div className="w-2/12 px-2 text-center font-plusSansJakarta">{materi.practice_time}</div>
                        </div>
                    ))}

                    {/* Description */}
                    <div className="flex">
                        <div className="w-1/12 px-2 font-plusSansJakarta font-bold text-center"></div>
                        <div className="w-11/12 px-2 font-plusSansJakarta font-bold">
                            <div className="flex flex-row items-center">
                                <span className="text-base leading-none">DESKRIPSI SERTIFIKAT</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex text-sm mb-5">
                        <div className="w-1/12 px-2 text-center"></div>
                        <div className="w-11/12 px-2">
                            <div className="flex flex-col justify-center">
                                <span className="text-base !font-plusSansJakarta not-italic font-normal leading-none">{data.desc.desc_ind}</span>
                                <span className="font-bos text-sm leading-none">{data.desc.desc_eng}</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <div className="flex">
                        <div className="w-1/12 px-2 font-plusSansJakarta font-bold text-center"></div>
                        <div className="w-11/12 px-2 font-plusSansJakarta font-bold">
                            <Button
                                title="Edit Informasi"
                                onClick={onEdit}
                                className="border border-blue-500 shadow-sm inline-flex items-center justify-center text-sm font-medium transition-colors h-9 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md w-full"
                            >
                                <TbEditCircle className="h-5 w-5" /> Edit Informasi
                            </Button>
                        </div>
                    </div>
                </>
            </AccordionContent>
        </AccordionItem>
    )
}


export default ManajemenInformasiSISJAMU;
