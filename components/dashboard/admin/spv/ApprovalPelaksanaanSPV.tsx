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
import { UserCheck } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"


const verifikators = [
    { id: "ver1", name: "Verifikator A" },
    { id: "ver2", name: "Verifikator B" },
    { id: "ver3", name: "Verifikator C" },
];

export function ApprovePelaksanaanSPV({
    pelatihan,
    handleApprovedPelaksanaanBySPV,
}: {
    pelatihan: PelatihanMasyarakat;
    handleApprovedPelaksanaanBySPV: (id: string, pelatihan: PelatihanMasyarakat, verifikatorSelected: string) => void;
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [verifikatorSelected, setSelectedVerifikator] = React.useState("");

    return (
        <>
            <Button
                size="sm"
                className="inline-flex items-center justify-center gap-2 
        h-10 px-5 text-sm font-medium rounded-full 
        border border-teal-500 bg-teal-500 text-white 
        hover:bg-teal-600 transition-colors shadow-sm"
                onClick={() => setIsOpen(true)}
            >
                <RiCheckboxCircleFill className="w-4 h-4" /> Pilih Verifikator
            </Button>

            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogContent className="rounded-2xl shadow-xl max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-gray-800">
                            Pilih Verifikator
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-500">
                            Silakan pilih nama verifikator yang akan menerima persetujuan pelaksanaan diklat ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Select Verifikator */}
                    <div className="mt-4">
                        <Select
                            value={verifikatorSelected}
                            onValueChange={(val) => setSelectedVerifikator(val)}
                        >
                            <SelectTrigger className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-teal-500">
                                <SelectValue placeholder="-- Pilih Verifikator --" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[999999999]">
                                {verifikators.map((v) => (
                                    <SelectItem key={v.id} value={v.id}>
                                        {v.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>


                    </div>

                    <AlertDialogFooter className="mt-6 flex justify-end gap-1">
                        <AlertDialogCancel className="rounded-full px-6">
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={!verifikatorSelected}
                            className="rounded-full bg-teal-500 hover:bg-teal-600 px-6 text-white inline-flex gap-2 items-center"
                            onClick={() => {
                                setIsOpen(false)
                                handleApprovedPelaksanaanBySPV(String(pelatihan.IdPelatihan), pelatihan, verifikatorSelected)
                            }}
                        >
                            <UserCheck className="w-4 h-4" />
                            Kirim
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
