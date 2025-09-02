"use client";

import React, { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/components/toast";
import { elautBaseUrl } from "@/constants/urls";
import { IconType } from "react-icons";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { PelatihanMasyarakat } from "@/types/product";
import { useFetchDataPusat } from "@/hooks/elaut/pusat/useFetchDataPusat";
import { breakdownStatus } from "@/lib/utils";

interface SendNoteActionProps {
    idPelatihan: string;
    title: string;
    description: string;
    buttonLabel: string;
    icon: IconType;
    buttonColor?: string;
    onSuccess: () => void;
    status: string;
    pelatihan: PelatihanMasyarakat;
}

const SendNoteAction: React.FC<SendNoteActionProps> = ({
    idPelatihan,
    title,
    description,
    buttonLabel,
    icon: Icon,
    buttonColor = "blue",
    onSuccess,
    status,
    pelatihan,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [verifikatorPelaksanaan, setVerifikatorPelaksanaan] = useState("");

    const { adminPusatData, loading: loadingPusat, error, fetchAdminPusatData } =
        useFetchDataPusat();

    useEffect(() => {
        if (isOpen) {
            fetchAdminPusatData();
        }
    }, [isOpen, fetchAdminPusatData]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const response = await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihan?id=${idPelatihan}`,
                {
                    StatusPenerbitan: status,
                    VerifikatorPelatihan: verifikatorPelaksanaan,
                },
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );

            await handleAddHistoryTrainingInExisting(
                pelatihan,
                message,
                Cookies.get("Role"),
                Cookies.get("Satker")
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: `${title} berhasil diproses.`,
            });

            setMessage("");
            setVerifikatorPelaksanaan("");
            setIsOpen(false);
            setLoading(false);
            onSuccess();
            console.log("SEND ACTION RESPONSE: ", response);
        } catch (error) {
            console.error("ERROR SEND ACTION: ", error);
            setLoading(false);
            setMessage("");
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memproses tindakan.",
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className={`flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-${buttonColor}-500 text-${buttonColor}-500 hover:text-white hover:bg-${buttonColor}-500`}
                >
                    <Icon className="h-5 w-5" />
                    <span>{buttonLabel}</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                {/* Input Pesan */}
                {
                    (Cookies.get('Access')?.includes('supervisePelaksanaan') && (pelatihan?.StatusPenerbitan == "1" || pelatihan?.StatusPenerbitan == "6")) && <div>
                        <Select
                            value={verifikatorPelaksanaan}
                            onValueChange={setVerifikatorPelaksanaan}
                            disabled={loading || loadingPusat}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Verifikator" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[9999999]">
                                {adminPusatData.filter((item) => breakdownStatus(item.Status)[0] == "Verifikator").map((admin) => (
                                    <SelectItem
                                        key={admin.IdAdminPusat}
                                        value={admin.IdAdminPusat.toString()}
                                    >
                                        {admin.Nama}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                }

                <div className="mb-4">
                    <Textarea
                        placeholder="Tulis catatan atau pesan Anda di sini..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        className={`bg-${buttonColor}-600 hover:bg-${buttonColor}-700 text-white`}
                        disabled={loading}
                    >
                        {loading ? "Memproses..." : "Kirim"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default SendNoteAction;
