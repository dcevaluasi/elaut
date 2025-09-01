"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { TbBroadcast, TbWorldCancel } from "react-icons/tb";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import Toast from "@/components/toast";
import Cookies from "js-cookie";
import { FiUploadCloud } from "react-icons/fi";

interface PublishButtonProps {
  title: string;
  statusPelatihan: string;
  idPelatihan: string;
  handleFetchingData: any;
}

const PublishButton: React.FC<PublishButtonProps> = ({
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
    formData.append("Status", status);
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
        text: "Berhasil mempublish informasi pelatihan masyarakat ke laman E-LAUT!",
      });
      handleFetchingData();
      setIsOpenFormPublishedPelatihan(false);
    } catch (error) {
      console.error("ERROR UPDATE PELATIHAN: ", error);
      Toast.fire({
        icon: "error",
        title: `Oopsss!`,
        text: "Gagal mempublish informasi pelatihan masyarakat ke laman E-LAUT!",
      });
      handleFetchingData();
      setIsOpenFormPublishedPelatihan(false);
    }
  };

  return (
    <>
      <AlertDialog
        open={isOpenFormPublishedPelatihan}
        onOpenChange={setIsOpenFormPublishedPelatihan}
      >
        <AlertDialogContent className="rounded-2xl shadow-lg border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-800">
              Publikasi ke Web E-LAUT
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-1">
              Agar pelatihan di balai/lemdiklat-mu dapat dilihat oleh masyarakat
              umum lakukan checklist agar tampil di website E-LAUT!
            </AlertDialogDescription>
          </AlertDialogHeader>

          <fieldset className="mt-4">
            <form autoComplete="off">
              {statusPelatihan === "Belum Publish" ? (
                <div className="space-y-4">
                  {/* Checkbox publish */}
                  <div className="flex flex-row items-center space-x-3 rounded-xl border border-gray-200 p-4 bg-gray-50">
                    <Checkbox
                      id="publish"
                      onCheckedChange={() => setSelectedStatus("Publish")}
                    />
                    <div className="space-y-1">
                      <label className="font-medium text-gray-800">
                        Publish Website E-LAUT
                      </label>
                      <p className="text-xs text-gray-600 leading-snug">
                        Dengan ini sebagai pihak lemdiklat saya mempublish informasi
                        pelatihan terbuka untuk masyarakat umum!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row items-center space-x-3 rounded-xl border border-gray-200 p-4 bg-green-50">
                  <RiVerifiedBadgeFill className="h-7 w-7 text-green-500" />
                  <div className="space-y-1">
                    <label className="font-medium text-gray-800">
                      Published Website E-LAUT
                    </label>
                    <p className="text-xs text-gray-600 leading-snug">
                      Informasi Kelas Pelatihanmu telah dipublikasikan melalui laman
                      Website E-LAUT balai mu!
                    </p>
                  </div>
                </div>
              )}

            </form>
          </fieldset>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-lg border-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={`rounded-lg shadow-sm transition-all ${statusPelatihan === "Publish"
                ? "bg-gray-600 hover:bg-gray-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              onClick={() =>
                statusPelatihan === "Belum Publish"
                  ? handlePublish(idPelatihan, selectedStatus)
                  : handlePublish(idPelatihan, "Belum Publish")
              }
            >
              {statusPelatihan === "Publish" ? "Take Down" : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        title={title}
        onClick={() => {
          setSelectedStatus(statusPelatihan);
          setIsOpenFormPublishedPelatihan(true);
        }}
        variant="outline"
        className={`flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all ${title === "Publish"
          ? "bg-transparent border-purple-500 text-purple-500 hover:text-white hover:bg-purple-500"
          : "bg-transparent border-gray-500 text-gray-500 hover:text-white hover:bg-gray-500"
          }`}
      >
        {title === "Publish" ? (
          <>
            <TbBroadcast className="h-5 w-5" /> <span>Publish</span>
          </>
        ) : (
          <>
            <TbWorldCancel className="h-5 w-5" /> <span>Takedown</span>
          </>
        )}
      </Button>
    </>
  );
};

export default PublishButton;
