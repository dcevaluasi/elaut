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
import { Trash } from "lucide-react";
import Toast from "@/components/toast";
import Cookies from "js-cookie";
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import { PelatihanMasyarakat } from "@/types/product";
import { useRouter } from "next/navigation";

interface DeletePelatihanActionProps {
  idPelatihan: string;
  pelatihan: PelatihanMasyarakat | null;
  handleFetchingData: any;
}

const DeletePelatihanAction: React.FC<DeletePelatihanActionProps> = ({
  idPelatihan,
  pelatihan,
  handleFetchingData,
}) => {
  const [isOpenFormDelete, setIsOpenFormDelete] =
    React.useState<boolean>(false);
  const route = useRouter()
  const handleDelete = async (pesertaPelatihan: number, sertifikat: string) => {
    if (pesertaPelatihan > 0) {
      Toast.fire({
        icon: "error",
        title:
          "Ups, pelatihan tidak dapat dihapus karena sudah ada yang mendaftar!",
      });

    } else {
      try {
        const response = await axios.delete(
          `${elautBaseUrl}/lemdik/deletePelatihan?id=${idPelatihan}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            },
          }
        );
        console.log(response);
        Toast.fire({
          icon: "success",
          title: "Berhasil menghapus pelatihan dari database, sobat elaut!",
        });
        route.push('/admin/lemdiklat/pelatihan')
        setIsOpenFormDelete(!isOpenFormDelete);
      } catch (error) {
        setIsOpenFormDelete(!isOpenFormDelete);
        console.error({ error });
        Toast.fire({
          icon: "error",
          title: "Ups, pelatihan tidak dapat dihapus karena kesalahan server!",
        });
        handleFetchingData();
      }
    }
  };

  return (
    <>
      <AlertDialog open={isOpenFormDelete} onOpenChange={setIsOpenFormDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apakah kamu yakin menghapus pelatihan ini?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Penghapusan data ini akan dilakukan secara permanen, sehingga anda
              tidak dapat kembali melakukan undo terkait tindakan ini!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsOpenFormDelete(!isOpenFormDelete)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete(
                  pelatihan?.UserPelatihan.length!,
                  pelatihan?.NoSertifikat!
                );
              }}
              className="bg-rose-600 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {pelatihan!.UserPelatihan.length == 0 && pelatihan!.MateriPelatihan.length == 0 && pelatihan!.Status != "Publish" && Cookies.get('Access')?.includes('createPelatihan') && pelatihan!.StatusPenerbitan == "0" && <Button
        onClick={() => setIsOpenFormDelete(!isOpenFormDelete)}
        variant="outline"
        title="Hapus Pelatihan"
        className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500"
      >
        <Trash className="h-5 w-5" /> Hapus Pelatihan
      </Button>}


    </>
  );
};

export default DeletePelatihanAction;
