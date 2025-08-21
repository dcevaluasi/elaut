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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import Toast from "@/components/toast";
import Cookies from "js-cookie";
import { HiLockClosed } from "react-icons/hi2";
import { HistoryItem, HistoryTraining, PelatihanMasyarakat } from "@/types/product";
import { doc, DocumentData, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "@/firebase/config";
import { generateTimestamp } from "@/utils/time";
import addData from "@/firebase/firestore/addData";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { MdOutlineHistory } from "react-icons/md";
import getDocument from "@/firebase/firestore/getData";
import { DIALOG_TEXTS } from "@/constants/texts";

interface HistoryButtonProps {
  statusPelatihan: string;
  idPelatihan: string;
  pelatihan: PelatihanMasyarakat;
  handleFetchingData: any;
}

const HistoryButton: React.FC<HistoryButtonProps> = ({
  statusPelatihan,
  idPelatihan,
  pelatihan,
  handleFetchingData,
}) => {
  const [openFormTutupPelatihan, setOpenFormTutupPelatihan] =
    React.useState(false);
  const [selectedStatus, setSelectedStatus] =
    React.useState<string>(statusPelatihan);

  const [dataHistoryTraining, setDataHistoryTraining] = React.useState<HistoryTraining | null>(null)

  const handleFetchDataHistoryTraining = async () => {
    const doc = await getDocument('historical-training-notes', pelatihan!.KodePelatihan)
    setDataHistoryTraining(doc.data as HistoryTraining)
  }


  console.log({ dataHistoryTraining })

  React.useEffect(() => { handleFetchDataHistoryTraining() }, [])

  return (
    <>
      <Sheet open={openFormTutupPelatihan} onOpenChange={setOpenFormTutupPelatihan}>
        <SheetContent className="!max-w-3xl z-[999999999]">
          <SheetHeader>
            <SheetTitle>{DIALOG_TEXTS['History Pelatihan'].title}</SheetTitle>
            <SheetDescription>{DIALOG_TEXTS['History Pelatihan'].desc}</SheetDescription>
          </SheetHeader>

          {dataHistoryTraining && (
            <div className="h-[700px] w-full  overflow-y-scroll rounded-lg mt-4 mb-10">
              <table className="w-full   text-sm">
                <thead className="bg-gray-100 font-bold">
                  <tr>
                    <th className="border p-2 text-center">No</th>
                    <th className="border p-2">Riwayat</th>
                    <th className="border p-2 text-center">Role</th>
                    <th className="border p-2 text-center">Satuan Kerja</th>
                    <th className="border p-2 text-center">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {dataHistoryTraining.historical
                    .slice()
                    .reverse()
                    .map((item: HistoryItem, index: number, arr) => (
                      <tr key={index} className="odd:bg-white even:bg-gray-50">
                        <td className="border p-2 text-center">{index + 1}</td>
                        <td className="border p-2">{item.notes}</td>
                        <td className="border p-2 text-center">{item.role}</td>
                        <td className="border p-2 text-center">{item.upt}</td>
                        <td className="border p-2 text-center">{item.created_at}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          <SheetFooter>
            <Button variant="outline" onClick={() => setOpenFormTutupPelatihan(false)}>Tutup</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Button
        title="History Administrasi Pelatihan"
        onClick={() => {
          setSelectedStatus(statusPelatihan);
          setOpenFormTutupPelatihan(!openFormTutupPelatihan);
        }}
        variant="outline"
        className="inline-flex items-center justify-center gap-2 
        h-10 px-5 text-sm font-medium rounded-full 
        border border-neutral-500 bg-neutral-500 text-white 
        hover:bg-neutral-600 hover:text-white transition-colors shadow-sm"
      >
        <MdOutlineHistory className="h-5 w-5" /> History Pelatihan
      </Button>
    </>
  );
};

export default HistoryButton;
