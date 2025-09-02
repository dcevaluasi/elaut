import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { HistoryItem, HistoryTraining, PelatihanMasyarakat } from "@/types/product";
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
                    <th className="border p-2">Catatan</th>
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
        className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-neutral-800 text-neutral-800 hover:text-white hover:bg-neutral-800"
      >
        <MdOutlineHistory className="h-5 w-5" /> History Pelatihan
      </Button >
    </>
  );
};

export default HistoryButton;
