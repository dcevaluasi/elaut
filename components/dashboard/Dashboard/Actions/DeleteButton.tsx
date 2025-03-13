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

interface DeleteButtonProps {
  idPelatihan: string;
  pelatihan: PelatihanMasyarakat | null;
  handleFetchingData: any;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
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
    } else if (sertifikat != "") {
      Toast.fire({
        icon: "error",
        title:
          "Ups, pelatihan sudah terbit nomor sertifikatnya, tidak dapat dihapus!",
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
        route.push('/admin/lemdik/pelatihan')
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

      <Button
        onClick={() => setIsOpenFormDelete(!isOpenFormDelete)}
        variant="outline"
        title="Hapus Pelatihan"
        className="ml-auto text-neutral-100  bg-rose-600 hover:bg-rose-600 hover:text-neutral-100 duration-700 w-full"
      >
        <Trash className="h-5 w-5" /> Hapus Pelatihan
      </Button>
    </>
  );
};

export default DeleteButton;
