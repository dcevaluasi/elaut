import * as React from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { PelatihanMasyarakat } from "@/types/product";
import { UserCheck, XCircle } from "lucide-react";
import { useCreateNotePelatihan } from "@/hooks/elaut/note/useCreateNotePelatihan";
import Cookies from "js-cookie";
import { useUpdateStatus } from "@/hooks/elaut/useUpdateStatus";
import Toast from "@/components/toast";

export function ApprovePelaksanaanVerifikator({
    pelatihan,
    refetchDetail,
}: {
    pelatihan: PelatihanMasyarakat;
    refetchDetail: () => void;
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [catatan, setCatatan] = React.useState("");

    const { createNotePelatihan, loading } = useCreateNotePelatihan();
    const { updateStatus, loading: loadingUpdateStatus } = useUpdateStatus();

    const handleReject = async () => {
        try {
            await createNotePelatihan({
                id_pelatihan: pelatihan.IdPelatihan.toString(),
                email: Cookies.get("Email") || "", // <- replace with correct source
                role: Cookies.get("Role") || "",
                catatan: catatan || "Permohonan ditolak",
            });

            await updateStatus({
                idPelatihan: pelatihan.IdPelatihan.toString(),
                statusPenerbitan: "3", // reject verifikator
            });

            refetchDetail();
            setIsOpen(false);
            Toast.fire({
                icon: "success",
                title: "Yeayyy!",
                text: "Berhasil mereject permohonan pelaksanaan!",
            });
        } catch (error) {
            console.error("Reject error:", error);
        }
    };

    const handleApprove = async () => {
        try {
            await createNotePelatihan({
                id_pelatihan: pelatihan.IdPelatihan.toString(),
                email: pelatihan.PenerbitanSertifikatDiterima, // verifikator email
                role: Cookies.get("Role") || "",
                catatan: catatan || "Permohonan disetujui",
            });

            await updateStatus({
                idPelatihan: pelatihan.IdPelatihan.toString(),
                statusPenerbitan: "4", // approve
            });

            refetchDetail();
            setIsOpen(false);
            Toast.fire({
                icon: "success",
                title: "Yeayyy!",
                text: "Berhasil menyetujuai permohonan pelaksanaan!",
            });
        } catch (error) {
            console.error("Approve error:", error);
        }
    };

    return (
        <>
            <Button
                size="sm"
                className="inline-flex items-center justify-center gap-2 
          h-10 px-5 text-sm font-medium rounded-full 
          border border-amber-500 bg-amber-500 text-white 
          hover:bg-amber-600 transition-colors shadow-sm"
                onClick={() => setIsOpen(true)}
            >
                <RiCheckboxCircleFill className="w-4 h-4" /> Verifikasi Pelaksanaan
            </Button>

            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent className="rounded-2xl shadow-xl max-w-lg p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-gray-800">
                            Verifikasi Pelaksanaan Diklat
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-500">
                            Berikan catatan persetujuan atau penolakan terkait pelaksanaan
                            diklat ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Text Area */}
                    <div className="mt-2">
                        <textarea
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            rows={4}
                            placeholder="Tulis catatan anda di sini..."
                            className="w-full p-3 text-sm border rounded-xl shadow-sm 
                focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>

                    <AlertDialogFooter className="mt-2 flex justify-between gap-2">
                        <AlertDialogCancel className="rounded-md px-6">
                            Batal
                        </AlertDialogCancel>

                        <div className="flex gap-2">
                            {/* Reject Button */}
                            <Button
                                variant="destructive"
                                className="rounded-md bg-rose-500 hover:bg-rose-600 text-white inline-flex gap-2 items-center px-6"
                                disabled={loading}
                                onClick={handleReject}
                            >
                                <XCircle className="w-4 h-4" />
                                Tolak
                            </Button>

                            {/* Approve Button */}
                            <AlertDialogAction
                                disabled={loading}
                                className="rounded-md bg-green-500 hover:bg-green-600 px-6 text-white inline-flex gap-2 items-center"
                                onClick={handleApprove}
                            >
                                <UserCheck className="w-4 h-4" />
                                Setujui
                            </AlertDialogAction>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
