"use client"

import React from "react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import getDocument from "@/firebase/firestore/getData"
import { DIALOG_TEXTS } from "@/constants/texts"
import { HistoryItem, HistoryTraining, PelatihanMasyarakat } from "@/types/product"

interface HistoryButtonProps {
  statusPelatihan: string
  idPelatihan: string
  pelatihan: PelatihanMasyarakat
  handleFetchingData: any
}

const HistoryButton: React.FC<HistoryButtonProps> = ({ pelatihan }) => {
  const [dataHistoryTraining, setDataHistoryTraining] =
    React.useState<HistoryTraining | null>(null)

  const handleFetchDataHistoryTraining = async () => {
    const doc = await getDocument("historical-training-notes", pelatihan!.KodePelatihan)
    setDataHistoryTraining(doc.data as HistoryTraining)
  }

  React.useEffect(() => {
    handleFetchDataHistoryTraining()
  }, [])

  return (
    <div className="w-full border-t border-t-gray-200 mt-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="info" className="border-none shadow-none">
          <AccordionTrigger className="text-lg text-gray-800 hover:no-underline ">
            <div className="flex flex-col">
              <p className=" text-gray-600 text-sm">
                {DIALOG_TEXTS["History Pelatihan"].title}  :
              </p>
              <p className="text-xs text-gray-500 mb-4 font-normal">
                {DIALOG_TEXTS["History Pelatihan"].desc}
              </p>
            </div>

          </AccordionTrigger>
          <AccordionContent>
            {/* Contents shown beautifully without accordion */}
            {dataHistoryTraining ? (
              <div className="space-y-2">
                {dataHistoryTraining.historical
                  .slice()
                  .sort((a: HistoryItem, b: HistoryItem) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  )
                  .map((item: HistoryItem, index: number) => (
                    <div
                      key={index}
                      className=" rounded-xl bg-white p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                        <span className="font-medium">Catatan {index + 1}</span>
                        <span className="text-xs">{item.created_at}</span>
                      </div>
                      <p>
                        <span className="font-semibold">Catatan:</span> {item.notes}
                      </p>
                      <p>
                        <span className="font-semibold">Role:</span> {item.role}
                      </p>
                      <p>
                        <span className="font-semibold">Satuan Kerja:</span> {item.upt}
                      </p>
                    </div>
                  ))}

              </div>
            ) : (
              <p className="text-gray-500 mt-4">Belum ada catatan history.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>


    </div>
  )
}

export default HistoryButton
