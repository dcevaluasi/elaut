"use client";

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { LogIn, UserPlus, Info } from "lucide-react";
import { setSecureCookie } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function AuthenticationDialog({ open, setOpen }: Props) {
    const pathUrl = usePathname()
    React.useEffect(() => {
        setSecureCookie('XSRF088', pathUrl)
    }, [])

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white shadow-2xl  flex-shrink-0">
                <AlertDialogHeader className="space-y-2 text-center">
                    <div className="flex justify-center items-center">
                        <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                            <Info className="h-8 w-8" />
                        </div>
                    </div>
                    <AlertDialogTitle className="text-2xl font-bold text-blue-400 text-center">
                        Welcome to E-LAUT 🌊
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-200 text-center">
                        Hai sobat E-LAUT! Kamu baru pertama kali berkunjung dan ingin ikut pelatihan? Ayo pastikan dahulu kamu :
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex flex-col gap-2">
                    {/* Login Option */}
                    <Link href="/login">
                        <Button
                            variant="outline"
                            className="w-full flex items-center gap-2 bg-gray-800 text-gray-100 hover:bg-gray-700 rounded-xl border border-gray-600 hover:text-gray-200"
                        >
                            <LogIn className="h-5 w-5 text-blue-400" />
                            <span>Sudah punya akun? <span className="font-semibold text-blue-400">Login</span></span>
                        </Button>
                    </Link>

                    {/* Register Option */}
                    <Link href="/registrasi">
                        <Button
                            onClick={() => setSecureCookie('XSRF087', '1')}
                            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
                        >
                            <UserPlus className="h-5 w-5" />
                            <span>Belum punya? <span className="font-semibold">Register</span></span>
                        </Button>
                    </Link>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel className="text-gray-200 bg-gray-700 hover:bg-gray-600 hover:text-gray-300 rounded-xl">
                        Tutup
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
