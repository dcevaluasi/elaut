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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import Toast from "@/components/toast";
import Cookies from "js-cookie";
import { PelatihanMasyarakat } from "@/types/product";
import { TbEditCircle } from "react-icons/tb";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";

interface NoSertifikatButtonProps {
    idPelatihan: string;
    pelatihan: PelatihanMasyarakat;
    handleFetchingData: any;
}

const NoSertifikatButton: React.FC<NoSertifikatButtonProps> = ({
    idPelatihan,
    pelatihan,
    handleFetchingData,
}) => {
    const [openFormSertifikat, setOpenFormSertifikat] =
        React.useState<boolean>(false);

    const [noSertifikat, setNoSertifikat] = React.useState<string>('')

    const handleInputNoSertifikat = async () => {
        setIsUploading(true);
        const updateData = new FormData();
        updateData.append("NoSertifikat", noSertifikat);
        updateData.append("PemberitahuanDiterima", "Kirim ke SPV");
        try {
            const uploadBeritaAcaraResponse = await axios.put(
                `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            Toast.fire({
                icon: "success",
                title: "Yeayyy!",
                text: "Berhasil menginput nomor sertifikat!",
            });

            handleAddHistoryTrainingInExisting(pelatihan!, 'Telah mengupload nomor sertfikat kelas pelatihan', Cookies.get('Status'), Cookies.get('SATKER_BPPP'))

            setIsUploading(false);
            handleFetchingData();
            setOpenFormSertifikat(false);
            console.log("UPLOAD BERITA ACARA: ", uploadBeritaAcaraResponse);
        } catch (error) {
            console.error("ERROR GENERATE SERTIFIKAT: ", error);
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: "Gagal menginput nomor sertifikat!",
            });

            setIsUploading(false);
            setOpenFormSertifikat(false);
            handleFetchingData();
        }
    };

    const [isUploading, setIsUploading] = React.useState<boolean>(false);

    return (
        <>
            <AlertDialog
                open={openFormSertifikat}
                onOpenChange={setOpenFormSertifikat}
            >
                <AlertDialogContent>
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Input No Sertifikat
                            </AlertDialogTitle>
                            <AlertDialogDescription className="-mt-2">
                                Masukkan nomor sertifikat sesuai dengan nomor yang telah digenerate dari portal KKP!
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <fieldset>
                            <div className="flex flex-wrap  mb-1 w-full">
                                <div className="w-full">
                                    <label
                                        className="block text-gray-800 text-sm font-medium mb-1"
                                        htmlFor="noSertifikat"
                                    >
                                        No Sertifikat{" "}
                                        <span className="text-red-600">*</span>
                                    </label>

                                    <input
                                        id="noSertifikat"
                                        type="text"
                                        className="form-input w-full text-black border-gray-300 rounded-md"
                                        placeholder={
                                            'Masukkan nomor sertifikat'
                                        }
                                        value={noSertifikat}
                                        onChange={(e) => setNoSertifikat(e.target.value)}
                                    />
                                </div>
                            </div>
                        </fieldset>
                    </>
                    <AlertDialogFooter>
                        {!isUploading && (
                            <AlertDialogCancel
                                onClick={(e) => setOpenFormSertifikat(!openFormSertifikat)}
                            >
                                Cancel
                            </AlertDialogCancel>
                        )}
                        {noSertifikat != "" ? (
                            <AlertDialogAction
                                onClick={(e) => handleInputNoSertifikat()}
                                disabled={isUploading}
                                className={`${isUploading && "px-6"}`}
                            >
                                {isUploading ? <span>Uploading...</span> : <span>Upload</span>}
                            </AlertDialogAction>
                        ) : (
                            <></>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {
                pelatihan!.PemberitahuanDiterima == 'Input no sertifikat' && <Button
                    onClick={(e) => {
                        setOpenFormSertifikat(true);
                    }}
                    variant="outline"
                    title="Pengajuan Penerbitan"
                    className="ml-auto w-full bg-blue-600 hover:bg-blue-600 duration-700 text-neutral-100 hover:text-neutral-100"
                >
                    <TbEditCircle className="h-5 w-5" /> No Sertifikat
                </Button>}

        </>
    );
};

export default NoSertifikatButton;
