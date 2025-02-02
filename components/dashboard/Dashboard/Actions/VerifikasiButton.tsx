import React from "react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TbBroadcast, TbEditCircle, TbWorldCancel } from "react-icons/tb";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import Toast from "@/components/toast";
import Cookies from "js-cookie";

interface VerifikasiButtonProps {
    title: string;
    statusPelatihan: string;
    idPelatihan: string;
    handleFetchingData: any;
}

const VerifikasiButton: React.FC<VerifikasiButtonProps> = ({
    title,
    statusPelatihan,
    idPelatihan,
    handleFetchingData,
}) => {
    const [isOpenFormPublishedPelatihan, setIsOpenFormPublishedPelatihan] =
        React.useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] =
        React.useState<string>(statusPelatihan);

    const handlePublish = async (id: string, status: string) => {
        const formData = new FormData();
        formData.append("StatusPenerbitan", status);
        try {
            const response = await axios.put(
                `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );
            Toast.fire({
                icon: "success",
                title: `Yeayyy!`,
                text: 'Berhasil memverifikasi pelaksanaan pelatihan masyarakat ke laman E-LAUT!',
            });
            console.log("UPDATE PELATIHAN: ", response);
            handleFetchingData();
            setIsOpenFormPublishedPelatihan(!isOpenFormPublishedPelatihan);
        } catch (error) {
            setIsOpenFormPublishedPelatihan(!isOpenFormPublishedPelatihan);
            console.error("ERROR UPDATE PELATIHAN: ", error);
            Toast.fire({
                icon: "error",
                title: `Oopsss!`,
                text: 'Gagal memverifikasi pelaksanaan pelatihan masyarakat ke laman E-LAUT!'
            });
            handleFetchingData();
        }
    };

    return (
        <>
            <AlertDialog
                open={isOpenFormPublishedPelatihan}
                onOpenChange={setIsOpenFormPublishedPelatihan}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Verifikasi Pelaksanaan Pelatihan</AlertDialogTitle>
                        <AlertDialogDescription className="-mt-2">
                            Pelasaksanaan Pelatihan perlu diverifikasi agar dapat memberikan akses kepada lembaga diklat penyelenggara kegiatan pelatihan agar dapat mengelola kegiatan!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <fieldset>
                        <form autoComplete="off">
                            {statusPelatihan == "Verifikasi Pelaksanaan" ? (
                                <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-gray-300">
                                    <div>
                                        <Checkbox
                                            id="publish"
                                            onCheckedChange={(e) => setSelectedStatus("Sudah Diverifikasi Pelaksanaan")}
                                        />
                                    </div>
                                    <div className="space-y-1 leading-none">
                                        <label>Verifikasi Pelaksanaan Pelatihan</label>
                                        <p className="text-xs leading-[110%] text-gray-600">
                                            Dengan ini sebagai verifikator pusat saya memverifikasi
                                            pelaksanaan pelatihan!
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 border-gray-300">
                                    <RiVerifiedBadgeFill className="h-7 w-7 text-green-500 text-lg" />
                                    <div className="space-y-1 leading-none">
                                        <label>Pelaksanaan Pelatihan Telah Diverifikasi</label>
                                        <p className="text-xs leading-[110%] text-gray-600">
                                            Pelaksanaan pelatihan telah diverifikasi dan lembaga diklat dapat memiliki akses ke aplikasi E-LAUT!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </fieldset>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) =>
                                statusPelatihan == "Verifikasi Pelaksanaan"
                                    ? handlePublish(idPelatihan, selectedStatus)
                                    : handlePublish(idPelatihan, "Verifikasi Pelaksanaan")
                            }
                        >
                            {statusPelatihan == "Verifikasi Pelaksanaan" ? "Verifikasi" : "Unverifikasi"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Button
                title={title}
                onClick={() => {
                    setSelectedStatus(statusPelatihan);
                    setIsOpenFormPublishedPelatihan(!isOpenFormPublishedPelatihan);
                }}
                variant="outline"
                className={`ml-auto hover:text-neutral-100  text-neutral-100  duration-700 ${title == "Verifikasi"
                    ? "bg-yellow-300 hover:bg-yellow-300 text-gray-800"
                    : "bg-rose-500 hover:bg-rose-500"
                    }`}
            >
                {title == "Verifikasi" ? (
                    <>
                        <TbEditCircle className="h-5 w-5" /> <span>Verifikasi</span></>
                ) : (
                    <>
                        <TbEditCircle className="h-5 w-5" />Unverifikasi</>
                )}
            </Button>
        </>
    );
};

export default VerifikasiButton;
