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
import { capitalizeWords, DIALOG_TEXTS } from '@/constants/texts';
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
                userDetail != null && !isLoading ? <section className="flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white">
                    {/* gradient blobs */}
                    <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
                    <div className="pointer-events-none absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

                    <div className="relative w-full h-full pb-10">
                        <div className="max-w-6xl mx-auto">
                            <div className="pt-32  md:pt-32 ">
                                <section
                                    id="cek-sertifikat"
                                    className="scroll-smooth w-full  -mt-16 md:mt-6"
                                >
                                    <div className="flex flex-col  space-y-5 w-full items-center justify-center  text-center">
                                        <div className="flex flex-col space-y-2 text-center rounded-2xl 
  bg-white/10 backdrop-blur-md border border-white/20 
  shadow-lg w-full py-16 px-5 md:px-0 text-gray-200">

                                            <h1 className="text-[3rem] md:text-[3.6rem] font-calsans leading-none capitalize drop-shadow-sm">
                                                Dashboard <br />  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-blue-400 to-blue-500">
                                                    {userDetail!.Nama.toLowerCase()}
                                                </span>
                                            </h1>

                                            <div className="space-y-1 flex flex-col leading-none">
                                                <p className="drop-shadow-sm">
                                                    Ayo jelajahi aplikasi E-LAUT dan temukan pelatihan unggul di sektor Kelautan dan Perikanan menarik!
                                                </p>

                                                <p className="text-xs opacity-80 drop-shadow-sm">
                                                    *Ini merupakan laman dashboard pengguna E-LAUT, telusuri pelatihan yang kamu ikuti dan nikmati layanan tersedi lainnya!
                                                </p>
                                            </div>
                                        </div>


                                        {isManningAgent == "true" ? (
                                            <ManningAgentService manningAgent={manningAgentDetail} />
                                        ) : (
                                            <UserService user={userDetail} />
                                        )}
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
