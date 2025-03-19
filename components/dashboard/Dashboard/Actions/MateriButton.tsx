import React from "react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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
import { FaBookOpen } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { elautBaseUrl } from "@/constants/urls";
import Cookies from "js-cookie";
import Toast from "@/components/toast";
import Link from "next/link";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { urlTemplateMateriPelatihan } from "@/constants/templates";
import { MateriPelatihan, PelatihanMasyarakat } from "@/types/product";

interface MateriButtonProps {
  idPelatihan: string;
  handleFetchingData: any;
  data: PelatihanMasyarakat
}

const MateriButton: React.FC<MateriButtonProps> = ({
  idPelatihan,
  handleFetchingData,
  data
}) => {
  const [isOpenFormMateri, setIsOpenFormMateri] =
    React.useState<boolean>(false);
  const [materiPelatihan, setMateriPelatihan] = React.useState<File | null>(
    null
  );
  const handleFileMateriChange = (e: any) => {
    setMateriPelatihan(e.target.files[0]);
  };


  const handleUploadMateriPelatihan = async (id: string) => {
    const data = new FormData();
    data.append("IdPelatihan", id);
    if (materiPelatihan != null) {
      data.append("file", materiPelatihan);
    }

    try {
      const response = await axios.post(
        `${elautBaseUrl}/lemdik/exportModulePelatihan`,
        data,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      Toast.fire({
        icon: "success",
        title: `Berhasil menambahkan materi pelatihan!`,
      });
      handleFetchingData();
      console.log("MATERI PELATIHAN: ", response);
      setIsOpenFormMateri(!isOpenFormMateri);
    } catch (error) {
      console.error("ERROR GENERATE SERTIFIKAT: ", error);
      Toast.fire({
        icon: "success",
        title: `Gagal menambahkan materi pelatihan!`,
      });
      handleFetchingData();
      setIsOpenFormMateri(!isOpenFormMateri);
    }
  };

  return (
    <>
      <AlertDialog open={isOpenFormMateri}>
        <AlertDialogContent className={`${data!.MateriPelatihan.length == 0 ? '' : 'max-w-3xl'}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {" "}
              <FaBookOpen className="h-4 w-4" />
              Tambah Materi Pelatihan
            </AlertDialogTitle>
            <AlertDialogDescription className="-mt-2">
              Daftarkan materi pelatihan yang diselenggarakan yang nantinya akan
              tercantum pada sertifikat peserta pelatihan!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <fieldset>
            <form autoComplete="off">
              {
                data!.MateriPelatihan.length == 0 ? <div className="flex flex-wrap -mx-3 mb-1">
                  <div className="w-full px-3">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      Upload File Excel Materi{" "}
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="file"
                        className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                        required
                        onChange={handleFileMateriChange}
                      />
                      <Link
                        target="_blank"
                        href={urlTemplateMateriPelatihan}
                        className="btn text-white bg-green-600 hover:bg-green-700 py-0 w-[250px] px-0 text-sm"
                      >
                        <PiMicrosoftExcelLogoFill />
                        Unduh Template
                      </Link>
                    </div>
                    <p className="text-gray-700 text-xs mt-1">
                      *Download template, input data sesuai format template lalu
                      upload
                    </p>
                  </div>
                </div> : <MateriPelatihanTable data={data} />
              }


              <AlertDialogFooter className="mt-3">
                <AlertDialogCancel
                  onClick={(e) => setIsOpenFormMateri(!isOpenFormMateri)}
                >
                  Cancel
                </AlertDialogCancel>
                {
                  data!.MateriPelatihan.length == 0 && <AlertDialogAction
                    onClick={(e) => handleUploadMateriPelatihan(idPelatihan)}
                  >
                    Upload
                  </AlertDialogAction>
                }

              </AlertDialogFooter>
            </form>
          </fieldset>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        onClick={(e) => {
          setIsOpenFormMateri(!isOpenFormMateri);
        }}
        variant="outline"
        title="Materi Pelatihan"
        className="border border-teal-600 shadow-sm  inline-flex items-center justify-center whitespace-nowrap  text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-teal-600 hover:bg-teal-600  hover:text-white text-white rounded-md"
      >
        <FaBookOpen className="h-4 w-4 mr-1" /> Materi Pelatihan
      </Button>


    </>
  );
};

const MateriPelatihanTable = ({ data }: { data: PelatihanMasyarakat }) => {
  return (
    <div className="overflow-x-auto !text-sm">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-1">No</th>
            <th className="border p-1">Nama Materi</th>
            <th className="border p-1">Deskripsi</th>
            <th className="border p-1">Jam Teori</th>
            <th className="border p-1">Jam Praktek</th>
          </tr>
        </thead>
        <tbody>
          {data.MateriPelatihan!.map((item: MateriPelatihan, index: number) => (
            <tr key={item.IdMateriPelatihan} className="odd:bg-white even:bg-gray-50">
              <td className="border p-1 text-center">{index + 1}</td>
              <td className="border p-1">{item.NamaMateri}</td>
              <td className="border p-1 capitalize">{item.Deskripsi}</td>
              <td className="border p-1 text-center">{item.JamTeory}</td>
              <td className="border p-1 text-center">{item.JamPraktek}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MateriButton;
