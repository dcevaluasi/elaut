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
import {
  ArrowUpDown,
  Edit3Icon,
  LucideInfo,
  LucideListChecks,
  Trash,
} from "lucide-react";
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
import {
  RiProgress3Line,
  RiShipLine,
  RiVerifiedBadgeFill,
} from "react-icons/ri";
import Link from "next/link";
import { FaRupiahSign } from "react-icons/fa6";
import Toast from "@/components/toast";
import { GiTakeMyMoney } from "react-icons/gi";
import { DialogSertifikatPelatihan } from "@/components/sertifikat/dialogSertifikatPelatihan";
import Cookies from "js-cookie";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { User } from "@/types/user";
import { decryptValue, encryptValue, formatToRupiah } from "@/lib/utils";
import { elautBaseUrl } from "@/constants/urls";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generateTanggalPelatihan } from "@/utils/text";
import ShowingBadge from "@/components/elaut/dashboard/ShowingBadge";

const TableDataPesertaPelatihan = () => {
  const isOperatorBalaiPelatihan = Cookies.get('Eselon') !== 'Operator Pusat'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const pathname = usePathname();
  const id = decryptValue(extractLastSegment(pathname));
  const paths = pathname.split("/");
  const [noSertifikatTerbitkan, setNoSertifikatTerbitkan] = React.useState("");
  const typeRole = Cookies.get("XSRF093");

  const [dataPelatihan, setDataPelatihan] =
    React.useState<PelatihanMasyarakat | null>(null);
  const [emptyFileSertifikatCount, setEmptyFileSertifikatCount] =
    React.useState<number>(0);

  const [data, setData] = React.useState<UserPelatihan[] | []>([]);
  const handleFetchingPublicTrainingDataById = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/getPelatihanUser?idPelatihan=${id}`
      );
      console.log("PELATIHAN: ", response.data);
      console.log("USER PELATIHAN: ", response.data.UserPelatihan);

      // Set data to state
      setDataPelatihan(response.data);
      setData(response.data.UserPelatihan);

      // Count entries with `FileSertifikat` as an empty string
      const count = response.data.UserPelatihan.filter(
        (item: UserPelatihan) => item.FileSertifikat !== ""
      ).length;

      // Update count in state
      setEmptyFileSertifikatCount(count);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  console.log({ emptyFileSertifikatCount });

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
    handleFetchingPesertaPelatihanDataById(parseInt(id))
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
    console.log({ id });
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
            {!isOperatorBalaiPelatihan ? (
              <span>Detail Peserta</span>
            ) : (
              <span>
                Validasi <br /> Data & Berkas
              </span>
            )}

            <TbDatabaseEdit className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={` flex items-center justify-center w-full gap-1`}>
          {isOperatorBalaiPelatihan ? (
            row.original.Keterangan == "Valid" ? (
              <Link
                href={`/admin/${usePathname().includes("lemdiklat") ? "lemdiklat" : "pusat"
                  }/pelatihan/${paths[paths.length - 3]}/peserta-pelatihan/${row.original.IdPelatihan
                  }/${encryptValue(row.original.IdUserPelatihan)}/${encryptValue(
                    row.original.IdUsers
                  )}`}
                className=" border border-green-500  text-white shadow-sm hover:bg-green-500 bg-green-500 hover:text-white h-9 px-4 py-2 mx-0 rounded-md  flex text-base items-center gap-2"
              >
                <RiVerifiedBadgeFill className="h-4 w-4 " />{" "}
                <span className="text-sm">Validasi</span>
              </Link>
            ) : (
              <Link
                href={`/admin/${usePathname().includes("lemdiklat") ? "lemdiklat" : "pusat"
                  }/pelatihan/${paths[paths.length - 3]}/peserta-pelatihan/${row.original.IdPelatihan
                  }/${encryptValue(row.original.IdUserPelatihan)}/${encryptValue(
                    row.original.IdUsers
                  )}`}
                className=" border border-rose-500  text-white   shadow-sm hover:bg-rose-500 bg-rose-500 hover:text-white h-9 px-4 py-2 mx-0 rounded-md  flex text-base items-center gap-2"
              >
                <RiVerifiedBadgeFill className="h-4 w-4 " />{" "}
                <span className="text-sm">Tidak Valid</span>
              </Link>
            )
          ) : (
            <>
              <Link
                href={`/admin/${usePathname().includes("lemdiklat") ? "lemdiklat" : "pusat"
                  }/pelatihan/${paths[paths.length - 3]}/peserta-pelatihan/${row.original.IdPelatihan
                  }/${encryptValue(row.original.IdUserPelatihan)}/${encryptValue(
                    row.original.IdUsers
                  )}`}
                className=" border border-neutral-800  text-white  shadow-sm hover:bg-neutral-800 bg-neutral-800 hover:text-white h-9 px-4 py-2 mx-0 rounded-md flex text-sm items-center gap-2"
              >
                <LucideInfo className="h-4 w-4 " />{" "}
                <span className="text-sm">Lihat Detail Peserta</span>
              </Link>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: "NoSertifikat",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold text-center w-full  items-center justify-center p-0 flex `}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sertifikat
            <RiVerifiedBadgeFill className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const pathname = usePathname();

        return (
          <>
            {dataPelatihan != null ? (
              <div className="flex">
                {row.original.Keterangan === "" ? (
                  <span>-</span>
                ) : row.original.NoSertifikat === "" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border flex gap-2 w-full items-center justify-center border-gray-600"
                      >
                        <TbRubberStamp className="h-4 w-4 text-gray-600" />
                        <span className="text-sm"> Terbitkan Sertifikat</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Sebarkan No Sertifikat
                        </AlertDialogTitle>
                        <AlertDialogDescription className="-mt-2">
                          Agar no sertifikat dapat diakses dan diunduh
                          sertifikatnya oleh peserta pelatihan, harap
                          memverifikasi!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <form autoComplete="off">
                        {row.original.NoSertifikat === "" ? (
                          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-gray-300">
                            <div>
                              {dataPelatihan?.NoSertifikat !== "" && (
                                <Checkbox
                                  id="publish"
                                  onCheckedChange={(e) =>
                                    setNoSertifikatTerbitkan(
                                      dataPelatihan?.NoSertifikat!
                                    )
                                  }
                                />
                              )}
                            </div>
                            <div className="space-y-1 leading-none">
                              <label>
                                {dataPelatihan?.NoSertifikat === ""
                                  ? "Generate Terlebih Dahulu"
                                  : "B" + dataPelatihan?.NoSertifikat}
                              </label>
                              <p className="text-xs leading-[110%] text-gray-600">
                                Generate nomor sertifikat terlebih dahulu dan
                                sebarkan nomor ke sertifikat peserta
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 border-gray-300">
                            <RiVerifiedBadgeFill className="h-7 w-7 text-green-500 text-lg" />
                            <div className="space-y-1 leading-none">
                              <label>{row.original?.NoSertifikat}</label>
                              <p className="text-xs leading-[110%] text-gray-600">
                                Nomor sertifikat telah diterbitkan, sertifikat
                                telah muncul di bagian dashboard user!
                              </p>
                            </div>
                          </div>
                        )}
                      </form>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) =>
                            dataPelatihan?.NoSertifikat !== ""
                              ? handleUpdatePublishPelatihanToELAUT(
                                row.original.IdUserPelatihan,
                                dataPelatihan?.NoSertifikat!
                              )
                              : null
                          }
                        >
                          {dataPelatihan?.NoSertifikat !== ""
                            ? "Sematkan"
                            : "Ok"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : row.original.FileSertifikat === "" ? (
                  <DialogSertifikatPelatihan
                    pelatihan={dataPelatihan!}
                    userPelatihan={data[row.index]}
                  >
                    <Button
                      variant="outline"
                      className="w-full border flex gap-2 border-blue-600 text-left capitalize items-center justify-center"
                    >
                      <RiVerifiedBadgeFill className="h-4 w-4 text-blue-600" />
                      <span className="text-xs">
                        {row.original?.NoSertifikat}
                      </span>
                    </Button>
                  </DialogSertifikatPelatihan>
                ) : dataPelatihan!.StatusPenerbitan == "On Progress" ||
                  dataPelatihan!.StatusPenerbitan == "" ? (
                  <Link
                    href={
                      "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-raw/" +
                      row.original.FileSertifikat
                    }
                    target="_blank"
                  >
                    <Button
                      variant="outline"
                      className="w-full border flex gap-2 bg-yellow-300 text-neutral-800 text-left capitalize items-center justify-center"
                    >
                      <RiProgress3Line className="h-4 w-4" />
                      <span className="text-sm">Draft Sertifikat</span>
                    </Button>
                  </Link>
                ) : (
                  <Link
                    target="_blank"
                    href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${row.original.FileSertifikat}`}
                    className="w-full border flex gap-2 bg-blue-600 text-left capitalize items-center justify-center h-9 px-4 py-3 border-blue-600  whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 hover:bg-blue-600 text-white"
                  >
                    <RiVerifiedBadgeFill className="h-4 w-4  " />
                    <span className="text-sm">Lihat Sertifikat</span>
                  </Link>
                )}
              </div>
            ) : (
              <></>
            )}
          </>
        );
      },
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
            <p className="leading-[105%]"> No Registrasi</p>

            <HiMiniUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize`}>
          <p className="text-base font-semibold tracking-tight leading-none">
            {row.original.NoRegistrasi}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "Nama",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold w-full p-0 flex justify-start items-centee`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> Nama Peserta</p>

            <HiMiniUserGroup className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize w-full`}>
          <p className="text-base font-semibold tracking-tight leading-none">
            {row.original.Nama}
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
            className={`text-black font-semibold w-fit p-0 ${isOperatorBalaiPelatihan ? "flex" : "hidden"
              } justify-start items-center`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> Pembayaran</p>

            <GiTakeMyMoney className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={`${"ml-0"} text-left capitalize ${isOperatorBalaiPelatihan ? "block" : "hidden"
            }`}
        >
          <p className="text-base font-semibold tracking-tight leading-none">
            {formatToRupiah(parseInt(row.original.TotalBayar))}
          </p>
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
            {dataPelatihan != null
              ? dataPelatihan!.UjiKompotensi == "Portfolio"
                ? "Portfolio"
                : "Pre Test"
              : ""}

            <MdOutlineNumbers className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={` flex items-center justify-center w-full gap-1 font-semibold ${row.original.PreTest > 70
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
            className={`${dataPelatihan != null
              ? dataPelatihan!.UjiKompotensi == "Portfolio"
                ? "hidden"
                : "flex items-center justify-center"
              : ""
              }  p-0 leading-[105%] w-full text-gray-900 font-semibold`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Post Test
            <MdOutlineNumbers className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className={` ${dataPelatihan != null
            ? dataPelatihan!.UjiKompotensi == "Portfolio"
              ? "hidden"
              : "flex items-center justify-center"
            : ""
            }  w-full gap-1 font-semibold ${row.original.PostTest > 70
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
        title: `Berhasil mengupdate data penilaian!`,
      });
      console.log("UPDATE PELATIHAN: ", response);
      handleFetchingPublicTrainingDataById();
      setIsOpenFormInputNilai(!isOpenFormInputNilai);
    } catch (error) {
      console.error("ERROR UPDATE PELATIHAN: ", error);
      Toast.fire({
        icon: "success",
        title: `Gagal mengupdate data penilaian!`,
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

  // HANDLING PENGAJUAN PERMOHONAN SERTIFIKAT
  const handleSendingPermohonanPenerbitan = async () => {
    const formData = new FormData();
    formData.append("StatusPenerbitan", "On Progress");

    try {
      const response = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${dataPelatihan!.IdPelatihan
        }`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log({ response });
      Toast.fire({
        icon: "success",
        title: `Berhasil mengirimkan pengajuan permohonan sertifikat!`,
      });
      handleFetchingPublicTrainingDataById();
    } catch (error) {
      console.error("ERROR GENERATE SERTIFIKAT: ", error);
      Toast.fire({
        icon: "error",
        title: `Gagal mengirimkan pangajuan permohonan sertifikat!`,
      });
      handleFetchingPublicTrainingDataById();
    }
  };

  return (
    <div className="">
      <div className="flex flex-col w-full">
        <div className="flex flex-row gap-2 items-center">
          <header
            aria-label="page caption"
            className="flex-row w-full flex h-20 items-center gap-2 bg-gray-100 border-t px-4"
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex gap-2">
                <HiUserGroup className="text-3xl" />
                <div className="flex flex-col">
                  <h1 id="page-caption" className="font-semibold text-lg">
                    Peserta{" "}
                    {dataPelatihan != null ? dataPelatihan!.NamaPelatihan : ""}
                  </h1>
                  <p className="font-medium text-gray-400 text-base">
                    {" "}
                    {dataPelatihan != null
                      ? dataPelatihan!.KodePelatihan
                      : ""}{" "}
                    •{" "}{dataPelatihan != null
                      ? dataPelatihan!.Program
                      : ""}{" "}
                    •
                    {dataPelatihan != null
                      ? dataPelatihan!.BidangPelatihan
                      : ""}{" "}
                    • Mendukung Program Terobosan{" "}
                    {dataPelatihan != null
                      ? dataPelatihan!.DukunganProgramTerobosan
                      : ""}
                  </p>
                </div>
              </div>
              <div className=" flex">
                {dataPelatihan != null ? (
                  <ShowingBadge data={dataPelatihan} />
                ) : (
                  <></>
                )}
              </div>
            </div>
          </header>
        </div>
      </div>

      <AlertDialog open={isOpenFormInputNilai}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {" "}
              <HiMiniUserGroup className="h-4 w-4" />
              Upload Nilai Peserta
            </AlertDialogTitle>
            <AlertDialogDescription className="-mt-2">
              Upload nilai peserta pelatihan dari dokumen portfolio yang
              dikirimkan sebagai bahan penilaian!
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
                      Nilai Portfolio <span className="text-red-600">*</span>
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
                        "https://docs.google.com/spreadsheets/d/12t7l4bBjPBcxXpCPPOqYeTDoZxBi5aS7/export?format=xlsx"
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
      <Card className="mx-4 py-5">
        <CardContent>
          <div className="flex items-center mb-3 justify-between gap-3 ">
            {/* Statistik Pelatihan */}
            {
              dataPesertaPelatihan != null && <div className="flex w-full gap-3 sm:gap-5">
                <div className="flex min-w-47.5">
                  <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                    <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
                  </span>
                  <div className="w-full">
                    <p className="font-semibold text-primary">
                      Total Pendaftar
                    </p>
                    <p className="text-sm font-medium">
                      {dataPelatihan?.UserPelatihan.length} orang
                    </p>
                  </div>
                </div>
                {isOperatorBalaiPelatihan && (
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
                )}

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
              </div>
            }

          </div>

          <div className="flex w-full items-center mb-2">
            <div className="flex w-full gap-1 items-start">
              {isOperatorBalaiPelatihan && (
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
              )}

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

            {usePathname().includes("lemdiklat") &&
              dataPelatihan?.StatusApproval != "Selesai" && (
                <div className="w-full flex justify-end gap-2">
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
              )}
          </div>

          <div>
            <div id="chartOne" className="-ml-5"></div>
            <TableData
              isLoading={false}
              columns={columns}
              table={table}
              type={"short"}
            />

            {data != null && dataPelatihan != null ? (
              emptyFileSertifikatCount > 0 &&
              dataPelatihan.StatusPenerbitan == "" && (
                <Button
                  variant="default"
                  onClick={() => handleSendingPermohonanPenerbitan()}
                  className="w-full  flex gap-2 text-left capitalize items-center justify-center mt-5"
                >
                  <FiUploadCloud className="h-4 w-4" />
                  <span className="text-sm">
                    Kirim Pengajuan Permohonan Sertifikat
                  </span>
                </Button>
              )
            ) : (
              <></>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableDataPesertaPelatihan;
