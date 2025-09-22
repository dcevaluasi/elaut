import { useState } from "react";
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
} from "@/components/ui/alert-dialog";
import axios from "axios";
import Cookies from "js-cookie";
import { elautBaseUrl } from "@/constants/urls";
import Toast from "@/commons/Toast";
import { DIALOG_TEXTS } from "@/constants/texts";
import { Button } from "@/components/ui/button";
import { HiUserGroup } from "react-icons/hi2";
import { UserPelatihan } from "@/types/product";
import { FaUserCheck } from "react-icons/fa6";

interface PassedParticipantActionProps {
    data: UserPelatihan[];
    onSuccess?: () => void;
}

export function PassedParticipantAction({
    data,
    onSuccess,
}: PassedParticipantActionProps) {
    const [open, setOpen] = useState(false);
    const [isIteratingProcess, setIsIteratingProcess] = useState(false);

    const handleLulusAllDataPeserta = async () => {
        setIsIteratingProcess(true);
        try {
            for (const user of data) {
                const formData = new FormData();
                formData.append("IsActice", "{PESERTA}{TELAH LULUS}{Has Passed}");
                formData.append("StatusPenandatangan", "Spesimen")
                formData.append("NoSertifikat", user.NoRegistrasi)

                console.log(
                    `Updating user: ${user.IdUserPelatihan}, LULUS/TIDAK LULUS: LULUS`
                );

                await axios.put(
                    `${elautBaseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        },
                    }
                );
            }

            Toast.fire({
                icon: "success",
                title: "Yeayyy!",
                text: `Berhasil meluluskan ${data.length} peserta pelatihan!`,
            });

            setIsIteratingProcess(false);
            onSuccess?.();
            setOpen(false);
        } catch (error) {
            console.error("ERROR UPDATE PELATIHAN:", error);

            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: `Gagal meluluskan ${data.length} peserta pelatihan!`,
            });

            setIsIteratingProcess(false);
            onSuccess?.();
            setOpen(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-gray-500 text-gray-500 hover:text-white hover:bg-gray-500">
                    <FaUserCheck className="h-5 w-5" />
                    Kelulusan Peserta
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        {DIALOG_TEXTS["Kelulusan Grouping Peserta"].title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="-mt-2">
                        {DIALOG_TEXTS["Kelulusan Grouping Peserta"].desc}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <fieldset>
                    <form autoComplete="off">
                        <AlertDialogFooter className="mt-3">
                            {isIteratingProcess ? (
                                <AlertDialogAction
                                    className="bg-green-500 hover:bg-green-600"
                                    disabled
                                >
                                    Sedang diproses...
                                </AlertDialogAction>
                            ) : (
                                <>
                                    <AlertDialogCancel onClick={() => setOpen(false)}>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-green-500 hover:bg-green-600"
                                        onClick={handleLulusAllDataPeserta}
                                    >
                                        Lulus
                                    </AlertDialogAction>
                                </>
                            )}
                        </AlertDialogFooter>
                    </form>
                </fieldset>
            </AlertDialogContent>
        </AlertDialog>
    );
}
