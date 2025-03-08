"use client";

import React from "react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import Cookies from "js-cookie";
import { User, UserPelatihan } from "@/types/user";
import UserService from "@/components/user-service";
import Footer from "@/components/ui/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ManningAgent } from "@/types/product";
import ManningAgentService from "@/components/manning-agent-service";
import Image from 'next/image';
import Link from 'next/link';
import { verifyPDFBSrEUrl } from '@/constants/urls';
import { FaRegCircleQuestion } from 'react-icons/fa6';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { sanitizedDangerousChars, validateIsDangerousChars } from '@/utils/input';
import Toast from '../toast';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { addFiveYears } from '@/utils/pelatihan';
import { DIALOG_TEXTS } from '@/constants/texts';
import { HashLoader } from "react-spinners";

export default function DashboardUser() {
    const token = Cookies.get("XSRF081");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const isManningAgent = Cookies.get("isManningAgent");
    const idManningAgent = Cookies.get("IdManningAgent");

    const [userDetail, setUserDetail] = React.useState<User | null>(null);
    const [manningAgentDetail, setManningAgentDetail] =
        React.useState<ManningAgent | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleFetchingUserDetail = async () => {
        setIsLoading(true);
        try {
            const response: AxiosResponse = await axios.get(
                `${baseUrl}/users/getUsersById`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log({ response });
            setUserDetail(response.data);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error("Error posting training data:", error);
            throw error;
        }
    };

    const handleFetchingManningAgentDetail = async () => {
        setIsLoading(true);

        try {
            const response: AxiosResponse = await axios.get(
                `${baseUrl}/manningAgent/getManningAgent?id=${idManningAgent}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log({ response });
            setManningAgentDetail(response.data.data[0]);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error("Error posting training data:", error);
            throw error;
        }
    };

    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        setTimeout(() => {
            setLoading(false);
            if (isManningAgent == "true") {
                handleFetchingManningAgentDetail();
            } else {
                handleFetchingUserDetail();
            }
        }, 1000);
    }, []);

    return (
        <>
            {
                userDetail != null && !isLoading ? <section className="flex flex-col bg-[#EEEAEB] h-full">
                    <div className="relative w-full h-full pb-10">
                        <div className="max-w-6xl mx-auto">
                            <div className="pt-32  md:pt-32 ">
                                <section
                                    id="cek-sertifikat"
                                    className="scroll-smooth w-full  -mt-16 md:mt-6"
                                >
                                    <div className="flex flex-col  gap-2 w-full items-center justify-center p-5 md:p-0 text-center">
                                        <div className="flex flex-col space-y-1 text-center rounded-2xl bg-white shadow-custom w-full py-16">
                                            <h1 className="text-blue-500 text-[3rem] md:text-[3.6rem] font-calsans leading-none">
                                                Dashboard <br /> {userDetail!.Nama}
                                            </h1>
                                            <p className="text-blue-500 leading-none">
                                                Ayo jelajahi aplikasi E-LAUT dan temukan pelatihan unggul di sektor Kelautan dan Perikanan menarik!
                                            </p>

                                            <p className="text-xs text-gray-400 mt-5 mb-16">
                                                *Ini merupakan laman dashboard pengguna E-LAUT, telusuri pelatihan yang kamu ikuti dan nikmati layanan tersedi lainnya!
                                            </p>

                                            {isManningAgent == "true" ? (
                                                <ManningAgentService manningAgent={manningAgentDetail} />
                                            ) : (
                                                <UserService user={userDetail} />
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>


                    </div>
                </section> : <section className="flex items-center justify-center w-full h-screen">
                    <HashLoader color="#338CF5" size={50} />
                </section>
            }
        </>
    );
}
