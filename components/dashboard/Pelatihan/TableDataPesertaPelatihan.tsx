import React, { useState } from "react";
import TableData from "../Tables/TableData";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Edit3Icon, LucideListChecks, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TbBroadcast,
  TbChartBubble,
  TbChartDonut,
  TbDatabaseEdit,
  TbFileCertificate,
  TbFileStack,
  TbRubberStamp,
  TbSchool,
  TbTargetArrow,
} from "react-icons/tb";
import { IoIosInformationCircle, IoMdCloseCircle } from "react-icons/io";
import { FiUploadCloud } from "react-icons/fi";

import { usePathname, useRouter } from "next/navigation";
import {
  MdInfo,
  MdOutlineNumbers,
  MdOutlinePaid,
  MdOutlinePayment,
  MdSchool,
} from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox";
import { Pelatihan, PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import axios, { AxiosResponse } from "axios";
import { extractLastSegment } from "@/utils";
import {
  HiMiniNewspaper,
  HiMiniUserGroup,
  HiOutlineDocument,
  HiUserGroup,
} from "react-icons/hi2";
import { RiShipLine, RiVerifiedBadgeFill } from "react-icons/ri";
import Link from "next/link";
import { FaRupiahSign } from "react-icons/fa6";
import Toast from "@/components/toast";
import { GiTakeMyMoney } from "react-icons/gi";
import { DialogSertifikatPelatihan } from "@/components/sertifikat/dialogSertifikatPelatihan";
import Cookies from "js-cookie";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { User } from "@/types/user";

const TableDataPesertaPelatihan = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const pathname = usePathname();
  const id = extractLastSegment(pathname);
  const [noSertifikatTerbitkan, setNoSertifikatTerbitkan] = React.useState("");

  const [dataPelatihan, setDataPelatihan] =
    React.useState<PelatihanMasyarakat | null>(null);

  const [data, setData] = React.useState<UserPelatihan[] | []>([]);
  const handleFetchingPublicTrainingDataById = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/getPelatihanUser?idPelatihan=${id}`
      );
      console.log("PELATIHAN : ", response.data);
      console.log("USER PELATIHAN: ", response.data.UserPelatihan);
      setDataPelatihan(response.data);
      setData(response.data.UserPelatihan);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  const [dataPesertaPelatihan, setDataPesertaPelatihan] =
    React.useState<User | null>(null);
  const handleFetchingPesertaPelatihanDataById = async (id: number) => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getAllUsers?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      console.log("PESERTA PELATIHAN : ", response.data);
      setDataPesertaPelatihan(response.data);
    } catch (error) {
      console.error("Error posting participants training data:", error);
      throw error;
    }
  };

  React.useEffect(() => {
    handleFetchingPublicTrainingDataById();
  }, []);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const router = useRouter();

  const handleUpdatePublishPelatihanToELAUT = async (
    id: number,
    status: string
  ) => {
    const formData = new FormData();
    formData.append("NoSertifikat", status);
    console.log({ status });
    try {
      const response = await axios.put(
        `${baseUrl}/lemdik/updatePelatihanUsers?id=${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      Toast.fire({
        icon: "success",
        title: `Berhasil menyisipkan no sertifikat ke akun pesereta pelatihan!`,
      });
      console.log("UPDATE PELATIHAN: ", response);
      handleFetchingPublicTrainingDataById();
    } catch (error) {
      console.error("ERROR UPDATE PELATIHAN: ", error);
      Toast.fire({
        icon: "success",
        title: `Gagal menyisipkan no sertifikat ke akun pesereta pelatihan!`,
      });
      handleFetchingPublicTrainingDataById();
    }
  };

  const handleValidDataPesertaPelatihan = async (
    id: number,
    status: string
  ) => {
    const formData = new FormData();
    formData.append("Keterangan", status);
    console.log({ status });
    console.log({ selectedIdPeserta });
    try {
      const response = await axios.put(
        `${baseUrl}/lemdik/updatePelatihanUsers?id=${selectedIdPeserta}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      Toast.fire({
        icon: "success",
        title: `Berhasil memvalidasi data pesereta pelatihan!`,
      });
      console.log("VALIDASI PESERTA PELATIHAN: ", response);
      handleFetchingPublicTrainingDataById();
      setOpenFormValidasiDataPesertaPelatihan(
        !openFormValidasiDataPesertaPelatihan
      );
    } catch (error) {
      console.error("ERROR UPDATE PELATIHAN: ", error);
      Toast.fire({
        icon: "success",
        title: `Gagal menyisipkan no sertifikat ke akun pesereta pelatihan!`,
      });
      handleFetchingPublicTrainingDataById();
    }
  };

  const [
    openFormValidasiDataPesertaPelatihan,
    setOpenFormValidasiDataPesertaPelatihan,
  ] = React.useState<boolean>(false);

  const [validitasDataPeserta, setValiditasDataPeserta] =
    React.useState<string>("");
  const [dataPesertaSelected, setDataPesertaSelected] =
    React.useState<UserPelatihan | null>(null);

  console.log({ dataPesertaPelatihan });

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns: ColumnDef<UserPelatihan>[] = [
    {
      accessorKey: "KodePelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-gray-900 font-semibold w-fit`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`w-full text-center uppercase`}>{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "IdPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`flex items-center justify-center leading-[105%] p-0 w-full text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Validasi <br /> Data & Berkas
            <TbDatabaseEdit className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={` flex items-center justify-center w-full gap-1`}>
          {row.original.Keterangan == "Valid" ? (
            <Button
              onClick={(e) => {
                setOpenFormValidasiDataPesertaPelatihan(
                  !openFormValidasiDataPesertaPelatihan
                );
                setDataPesertaSelected(row.original!);
                setSelectedIdPeserta(row.original!.IdUserPelatihan);
              }}
              variant="outline"
              className=" border border-green-500"
            >
              <RiVerifiedBadgeFill className="h-4 w-4 text-green-500" />
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                setOpenFormValidasiDataPesertaPelatihan(
                  !openFormValidasiDataPesertaPelatihan
                );
                handleFetchingPesertaPelatihanDataById(row.original!.IdUsers);
                setSelectedIdPeserta(row.original!.IdUserPelatihan);
              }}
              variant="outline"
              className=" border border-rose-500"
            >
              <IoMdCloseCircle className="h-4 w-4 text-rose-500" />
            </Button>
          )}
        </div>
      ),
    },
    {
      accessorKey: "NoRegistrasi",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold w-fit p-0 flex justify-start items-centee`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> No Peserta</p>

            <HiMiniUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-xs text-gray-400"> No registrasi</p>{" "}
          <p className="text-base font-semibold tracking-tight leading-none">
            {row.original.NoRegistrasi}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "IdUsers",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold w-fit p-0 flex justify-start items-centee`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> Pembayaran</p>

            <GiTakeMyMoney className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-xs text-gray-400">
            {" "}
            <span
              className={`${
                row.original.StatusPembayaran == "pending"
                  ? "text-yellow-500"
                  : row.original.StatusPembayaran == "paid" ||
                    row.original.StatusPembayaran == "Done"
                  ? "text-green-500"
                  : "text-rose-500"
              } capitalize`}
            >
              {row.original.StatusPembayaran}
            </span>{" "}
            • BTPN
          </p>{" "}
          <p className="text-base font-semibold tracking-tight leading-none">
            Rp. {row.original?.TotalBayar}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "NoSertifikat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold text-center w-full  items-center justify-center p-0 flex`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No Sertifikat
            <RiVerifiedBadgeFill className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) =>
        row.original.Keterangan == "" ? (
          <Button
            variant="outline"
            className="w-full border flex gap-2 border-rose-600 text-left capitalize items-center justify-center"
          >
            <IoMdCloseCircle className="h-4 w-4 text-rose-600" /> Data Belum
            Divalidasi
            <span className="text-xs"> {row.original?.NoSertifikat}</span>
          </Button>
        ) : row.original.NoSertifikat == "" ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border flex gap-2 w-full items-center justify-center border-gray-600"
              >
                <TbRubberStamp className="h-4 w-4 text-gray-600" />{" "}
                <span className="text-sm"> Terbitkan Sertifikat</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sebarkan No Sertifikat</AlertDialogTitle>
                <AlertDialogDescription className="-mt-2">
                  Agar no sertifikat dapat diakses dan diunduh sertifikatnya
                  oleh peserta pelatihan, harap memverifikasi!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form autoComplete="off">
                {row.original.NoSertifikat == "" ? (
                  <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-gray-300">
                    <div>
                      {dataPelatihan!.NoSertifikat != "" && (
                        <Checkbox
                          id="publish"
                          onCheckedChange={(e) =>
                            setNoSertifikatTerbitkan(
                              dataPelatihan!.NoSertifikat
                            )
                          }
                        />
                      )}
                    </div>
                    <div className="space-y-1 leading-none">
                      <label>
                        {dataPelatihan!.NoSertifikat == ""
                          ? "Generate Terlebih Dahulu"
                          : "B" + dataPelatihan!.NoSertifikat}
                      </label>
                      <p className="text-xs leading-[110%] text-gray-600">
                        Generate nomor sertifikat terlebih dahulu dan sebarkan
                        nomor ke sertifikat peserta
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 border-gray-300">
                    <RiVerifiedBadgeFill className="h-7 w-7 text-green-500 text-lg" />
                    <div className="space-y-1 leading-none">
                      <label>{row.original?.NoSertifikat}</label>
                      <p className="text-xs leading-[110%] text-gray-600">
                        Nomor sertifikat telah diterbitkan, sertifikat telah
                        muncul di bagian dashboard user!
                      </p>
                    </div>
                  </div>
                )}
              </form>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) =>
                    dataPelatihan!.NoSertifikat != ""
                      ? handleUpdatePublishPelatihanToELAUT(
                          row.original.IdUserPelatihan,
                          dataPelatihan!.NoSertifikat
                        )
                      : null
                  }
                >
                  {dataPelatihan!.NoSertifikat != "" ? "Sematkan" : "Ok"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <DialogSertifikatPelatihan
            pelatihan={dataPelatihan!}
            userPelatihan={data[row.index]}
          >
            <Button
              variant="outline"
              className="w-full border flex gap-2 border-blue-600 text-left capitalize items-center justify-center"
            >
              <RiVerifiedBadgeFill className="h-4 w-4 text-blue-600" />{" "}
              <span className="text-xs"> {row.original?.NoSertifikat}</span>
            </Button>
          </DialogSertifikatPelatihan>
        ),
    },
    {
      accessorKey: "IdUserPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`flex items-center justify-center p-0 leading-[105%] w-full text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Input <br />
            Penilaian
            <TbDatabaseEdit className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={` flex items-center justify-center w-full gap-1`}>
          <Button
            onClick={(e) => {
              setIsOpenFormInputNilai(!isOpenFormInputNilai);
              setSelectedIdPeserta(row.original?.IdUserPelatihan);
            }}
            variant="outline"
            className=" border border-purple-600"
          >
            <LucideListChecks className="h-4 w-4 text-purple-600" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "PreTest",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`flex items-center justify-center p-0 leading-[105%] w-full text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pre Test
            <MdOutlineNumbers className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={` flex items-center justify-center w-full gap-1 font-semibold ${
            row.original.PreTest > 70
              ? "text-green-500"
              : row.original.PreTest > 50
              ? "text-yellow-500"
              : "text-rose-500"
          }`}
        >
          {row.original.PreTest}
        </div>
      ),
    },
    {
      accessorKey: "PostTest",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`flex items-center justify-center p-0 leading-[105%] w-full text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Post Test
            <MdOutlineNumbers className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={` flex items-center justify-center w-full gap-1 font-semibold ${
            row.original.PostTest > 70
              ? "text-green-500"
              : row.original.PostTest > 50
              ? "text-yellow-500"
              : "text-rose-500"
          }`}
        >
          {row.original.PostTest}
        </div>
      ),
    },
    {
      accessorKey: "Keterangan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Keterangan
            <MdSchool className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`text-center uppercase text-base font-semibold ${
            row.original.PostTest > 65 ? "text-green-500" : "text-rose-500"
          }`}
        >
          {row.original.PostTest >= 65 ? "LULUS" : "TIDAK LULUS"}
        </div>
      ),
    },
  ];

  const [showFormAjukanPelatihan, setShowFormAjukanPelatihan] =
    React.useState<boolean>(false);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const [isOpenFormInputNilai, setIsOpenFormInputNilai] = React.useState(false);
  const [nilaiPretest, setNilaiPretest] = React.useState("");
  const [nilaiPosttest, setNilaiPosttest] = React.useState("");

  const [selectedIdPeserta, setSelectedIdPeserta] = React.useState(0);

  const handleUploadNilaiPeserta = async (id: number) => {
    const formData = new FormData();
    formData.append("PreTest", nilaiPretest);
    formData.append("PostTest", nilaiPosttest);

    try {
      const response = await axios.put(
        `${baseUrl}/lemdik/updatePelatihanUsers?id=${selectedIdPeserta}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      Toast.fire({
        icon: "success",
        title: `Berhasil mempublish informasi pelatihan masyarakat ke laman E-LAUT!`,
      });
      console.log("UPDATE PELATIHAN: ", response);
      handleFetchingPublicTrainingDataById();
      setIsOpenFormInputNilai(!isOpenFormInputNilai);
    } catch (error) {
      console.error("ERROR UPDATE PELATIHAN: ", error);
      Toast.fire({
        icon: "success",
        title: `Gagal mempublish informasi pelatihan masyarakat ke laman E-LAUT!`,
      });
      handleFetchingPublicTrainingDataById();
      setIsOpenFormInputNilai(!isOpenFormInputNilai);
    }
  };

  const [isOpenFormPeserta, setIsOpenFormPeserta] =
    React.useState<boolean>(false);
  const [fileExcelPesertaPelatihan, setFileExcelPesertaPelatihan] =
    React.useState<File | null>(null);
  const handleFileChange = (e: any) => {
    setFileExcelPesertaPelatihan(e.target.files[0]);
  };
  const handleUploadImportPesertaPelatihan = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("IdPelatihan", id);
    if (fileExcelPesertaPelatihan != null) {
      formData.append("file", fileExcelPesertaPelatihan);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/exportPesertaPelatihan`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      console.log("FILE UPLOADED PESERTA : ", response);
      Toast.fire({
        icon: "success",
        title: `Selamat anda berhasil mengupload peserta pelatihan!`,
      });
      setIsOpenFormPeserta(!isOpenFormPeserta);
      handleFetchingPublicTrainingDataById();
    } catch (error) {
      console.log("FILE IMPORT PESERTA PELATIHAN : ", error);
      Toast.fire({
        icon: "error",
        title: `Gagal mengupload peserta pelatihan!`,
      });
      handleFetchingPublicTrainingDataById();
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default  sm:px-7.5 xl:col-span-8">
      <AlertDialog open={isOpenFormInputNilai}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {" "}
              <HiMiniUserGroup className="h-4 w-4" />
              Upload Nilai Peserta
            </AlertDialogTitle>
            <AlertDialogDescription className="-mt-2">
              Upload nilai peserta pelatihan yang diselenggarakan yang nantinya
              akan tercantum pada sertifikat peserta pelatihan!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <fieldset>
            <form autoComplete="off">
              <div className="flex gap-2 w-full">
                <div className="flex gap-2 mb-1 w-full">
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      Nilai Pre Test <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="form-input w-full text-black border-gray-300 rounded-md"
                      required
                      value={nilaiPretest}
                      onChange={(e) => setNilaiPretest(e.target.value)}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="name"
                    >
                      Nilai Post Test <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="form-input w-full text-black border-gray-300 rounded-md"
                      required
                      value={nilaiPosttest}
                      onChange={(e) => setNilaiPosttest(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <AlertDialogFooter className="mt-3">
                <AlertDialogCancel
                  onClick={(e) =>
                    setIsOpenFormInputNilai(!isOpenFormInputNilai)
                  }
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => handleUploadNilaiPeserta(selectedIdPeserta)}
                >
                  Upload
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </fieldset>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isOpenFormPeserta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {" "}
              <HiMiniUserGroup className="h-4 w-4" />
              Import Peserta Pelatihan
            </AlertDialogTitle>
            <AlertDialogDescription className="-mt-2">
              Import peserta yang akan mengikuti pelatihan ini!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <fieldset>
            <form autoComplete="off">
              <div className="flex flex-wrap -mx-3 mb-1">
                <div className="w-full px-3">
                  <label
                    className="block text-gray-800 text-sm font-medium mb-1"
                    htmlFor="email"
                  >
                    Data By Name By Address <span>*</span>
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="file"
                      className=" text-black h-10 text-base flex items-center cursor-pointer w-full border border-neutral-200 rounded-md"
                      required
                      onChange={handleFileChange}
                    />
                    <Link
                      target="_blank"
                      href={
                        "https://docs.google.com/spreadsheets/d/1KlEBRcgXLZK6NCL0r4nglKa6XazHgUH7fqvHlrIHmNI/edit?usp=sharing"
                      }
                      className="btn text-white bg-green-600 hover:bg-green-700 py-0 w-[250px] px-0 text-sm"
                    >
                      <PiMicrosoftExcelLogoFill />
                      Unduh Template
                    </Link>
                  </div>
                  <p className="text-gray-700 text-xs mt-1">
                    *Download terlebih dahulu template lalu isi file excel dan
                    upload
                  </p>
                </div>
              </div>

              <AlertDialogFooter className="mt-3 pt-3 border-t border-t-gray-300">
                <AlertDialogCancel
                  onClick={(e) => setIsOpenFormPeserta(!isOpenFormPeserta)}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => handleUploadImportPesertaPelatihan(e)}
                >
                  Upload
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </fieldset>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openFormValidasiDataPesertaPelatihan}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {" "}
              <HiMiniUserGroup className="h-4 w-4" />
              Validasi Data Peserta Pelatihan
            </AlertDialogTitle>
            <AlertDialogDescription className="-mt-2">
              Validasi data peserta pelatihan, sebelum mereka mengikuti
              pelatihan!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <fieldset>
            <form autoComplete="off">
              <AlertDialogFooter className="mt-3">
                <AlertDialogCancel
                  onClick={(e) =>
                    setOpenFormValidasiDataPesertaPelatihan(
                      !openFormValidasiDataPesertaPelatihan
                    )
                  }
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-green-500 hover:bg-green-600"
                  onClick={(e) =>
                    handleValidDataPesertaPelatihan(selectedIdPeserta, "Valid")
                  }
                >
                  Validasi
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </fieldset>
        </AlertDialogContent>
      </AlertDialog>

      {showFormAjukanPelatihan ? (
        <h1>TEST</h1>
      ) : (
        <>
          {/* Header Tabel Data Pelatihan */}
          <div className="flex items-center mb-3 justify-between gap-3 ">
            {/* Statistik Pelatihan */}
            <div className="flex w-full gap-3 sm:gap-5">
              <div className="flex min-w-47.5">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-primary">Total Pendaftar</p>
                  <p className="text-sm font-medium">
                    {dataPelatihan?.UserPelatihan.length} orang
                  </p>
                </div>
              </div>
              <div className="flex min-w-47.5">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-secondary">
                    Total Telah Bayar
                  </p>
                  <p className="text-sm font-medium">
                    {" "}
                    {dataPelatihan?.UserPelatihan.length} orang / Rp.{" "}
                    {dataPelatihan?.UserPelatihan?.reduce(
                      (total: number, jumlahBayar: UserPelatihan) => {
                        return total + parseInt(jumlahBayar.TotalBayar);
                      },
                      0
                    )}
                  </p>
                </div>
              </div>
              <div className="flex min-w-47.5">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-green-400">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-green-500"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-green-500">
                    Total Verifikasi
                  </p>
                  <p className="text-sm font-medium">
                    {" "}
                    {dataPelatihan?.UserPelatihan.length} orang
                  </p>
                </div>
              </div>
              <div className="flex min-w-47.5">
                <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-yellow-400">
                  <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-yellow-500"></span>
                </span>
                <div className="w-full">
                  <p className="font-semibold text-yellow-500">
                    Total Terbit Sertifikat
                  </p>
                  <p className="text-sm font-medium">
                    {" "}
                    {dataPelatihan?.UserPelatihan?.reduce(
                      (total: number, user: UserPelatihan) => {
                        if (user.NoSertifikat !== "") {
                          return total + 1;
                        }
                        return total;
                      },
                      0
                    ) || 0}{" "}
                    orang
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center mb-2">
            <div className="flex w-full gap-1 items-start">
              <Select>
                <SelectTrigger className="w-[200px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                  <div className="inline-flex gap-2 px-3 mr-2 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer">
                    <MdOutlinePayment />
                    Status Pembayaran
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status Pembayaran</SelectLabel>
                    <SelectItem value="pendaftaran">Paid</SelectItem>
                    <SelectItem value="pelaksanaan">Pending</SelectItem>
                    <SelectItem value="selesai">Not Paid</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[130px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                  <div className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer">
                    <TbSchool />
                    Kelulusan
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kelulusan</SelectLabel>
                    <SelectItem value="pendaftaran">Lulus</SelectItem>
                    <SelectItem value="pelaksanaan">Tidak Lulus</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[140px] border-none shadow-none bg-none p-0 active:ring-0 focus:ring-0">
                  <div className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer">
                    <HiOutlineDocument />
                    Sertifikat
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sertifikat</SelectLabel>
                    <SelectItem value="apple">Sudah Diterbitkan</SelectItem>
                    <SelectItem value="banana">Belum Diterbitkan</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full flex justify-end gap-2">
              <div className="flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer w-fit">
                <TbChartDonut />
                Statistik
              </div>
              <div
                onClick={(e) => {
                  if (dataPelatihan?.StatusApproval == "Selesai") {
                    Toast.fire({
                      icon: "error",
                      title: `Ups, pelatihan sudah ditutup dan no sertifikat telah terbit, tidak dapat menambahkan lagi!`,
                    });
                  } else {
                    setIsOpenFormPeserta(!isOpenFormPeserta);
                  }
                }}
                className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer"
              >
                <FiUploadCloud />
                Tambah Peserta Pelatihan
              </div>
            </div>
          </div>

          {/* List Data Pelatihan */}
          <div>
            <div id="chartOne" className="-ml-5"></div>
            <TableData
              isLoading={false}
              columns={columns}
              table={table}
              type={"short"}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TableDataPesertaPelatihan;
