import React, { ChangeEvent, useState } from "react";
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
  TbEditCircle,
  TbFileCertificate,
  TbFileExcel,
  TbFileStack,
  TbRubberStamp,
  TbSchool,
  TbSignature,
  TbTargetArrow,
} from "react-icons/tb";
import { IoIosInformationCircle, IoMdCheckmarkCircleOutline, IoMdCloseCircle } from "react-icons/io";
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
import { extractLastSegment, truncateText } from "@/utils";
import {
  HiMiniArrowUpTray,
  HiMiniNewspaper,
  HiMiniUserGroup,
  HiOutlineDocument,
  HiOutlineEye,
  HiOutlineUserGroup,
  HiTrash,
  HiUserGroup,
} from "react-icons/hi2";
import {
  RiFileExcelLine,
  RiProgress3Line,
  RiShipLine,
  RiVerifiedBadgeFill,
} from "react-icons/ri";
import Link from "next/link";
import { FaRegFolderOpen, FaRegIdCard, FaRupiahSign, FaTrash } from "react-icons/fa6";
import Toast from "@/components/toast";
import { GiTakeMyMoney } from "react-icons/gi";
import { DialogSertifikatPelatihan } from "@/components/sertifikat/dialogSertifikatPelatihan";
import Cookies from "js-cookie";
import { PiMicrosoftExcelLogoFill, PiSignature } from "react-icons/pi";
import { User } from "@/types/user";
import { decryptValue, encryptValue, formatToRupiah } from "@/lib/utils";
import { elautBaseUrl } from "@/constants/urls";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generateTanggalPelatihan } from "@/utils/text";
import ShowingBadge from "@/components/elaut/dashboard/ShowingBadge";
import { DIALOG_TEXTS } from "@/constants/texts";
import { countUserWithCertificate, countUserWithDraftCertificate, countUserWithNonELAUTCertificate, countUserWithNoSertifikat, countUserWithPassed, countUserWithSpesimenTTD, countUserWithTanggalSertifikat, countValidKeterangan } from "@/utils/counter";
import { generateTimestamp, getDateInIndonesianFormat, getTodayInIndonesianFormat } from "@/utils/time";
import { BiSolidCalendarAlt } from "react-icons/bi";
import addData from "@/firebase/firestore/addData";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "@/firebase/config";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { isSigned, isUnsigned } from "@/lib/sign";
import { downloadAndZipPDFs } from "@/utils/file";
import { AiOutlineFieldNumber } from "react-icons/ai";
import JSZip from "jszip";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { generatedStatusCertificate } from "@/utils/certificates";
import { BsFileExcel } from "react-icons/bs";
import { IoReload } from "react-icons/io5";
import { Input } from "@/components/ui/input";
import { HiOutlineEyeOff } from "react-icons/hi";

const TableDataPesertaPelatihan = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const pathname = usePathname();
  const id = decryptValue(extractLastSegment(pathname));
  const paths = pathname.split("/");
  const [noSertifikatTerbitkan, setNoSertifikatTerbitkan] = React.useState("");

  const [searchQuery, setSearchQuery] = React.useState<string>("");


  const [dataPelatihan, setDataPelatihan] =
    React.useState<PelatihanMasyarakat | null>(null);
  const [emptyFileSertifikatCount, setEmptyFileSertifikatCount] =
    React.useState<number>(0);

  const [signedSertifikat, setSignedSertifikat] =
    React.useState<number>(0);

  const [data, setData] = React.useState<UserPelatihan[] | []>([]);

  const [countValid, setCountValid] = React.useState<number>(0)
  const [countPinnedCertificateNumber, setCountPinnedCertificateNumber] = React.useState<number>(0)
  const [countPinnedCertificateDate, setCountPinnedCertificateDate] = React.useState<number>(0)
  const [countPinnedCertificateSpesimen, setCountPinnedCertificateSpesimen] = React.useState<number>(0)
  const [countPassed, setCountPassed] = React.useState<number>(0)

  const handleFetchingPublicTrainingDataById = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/getPelatihanUser?idPelatihan=${id}`
      );
      console.log("PELATIHAN: ", response.data);
      console.log("USER PELATIHAN: ", response.data.UserPelatihan);

      // Set data to state
      setDataPelatihan(response.data);
      setCountValid(countValidKeterangan(response.data.UserPelatihan))
      setCountPinnedCertificateNumber(countUserWithNoSertifikat(response.data.UserPelatihan))
      setData(response.data.UserPelatihan);
      setCountPinnedCertificateDate(countUserWithTanggalSertifikat(response.data.UserPelatihan))
      setCountPinnedCertificateSpesimen(countUserWithSpesimenTTD(response.data.UserPelatihan))
      setCountPassed(countUserWithPassed(response.data.UserPelatihan))

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

  const [openFormDeleteFileSertifikat, setOpenFormDeleteFileSertifikat] = React.useState<boolean>(false)
  const [isDeletingFileSertifikat, setIsDeletingFileSertifikat] = React.useState<boolean>(false)
  const handleDeleteFileSertifikat = async () => {
    setIsDeletingFileSertifikat(true)
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/deleteSertifikatFiles?id_pelatihan?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      setOpenFormDeleteFileSertifikat(false)
      setIsDeletingFileSertifikat(false)
      Toast.fire({
        icon: "success",
        title: `Berhasil menghapuskan draft file sertifikat!`,
      });
    } catch (error) {
      console.error("Error posting participants training data:", error);
      Toast.fire({
        icon: "error",
        title: `Gagal menghapuskan draft file sertifikat!`,
      });
      setOpenFormDeleteFileSertifikat(false)
      setIsDeletingFileSertifikat(false)
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
        icon: "error",
        title: `Gagal menyisipkan no sertifikat ke akun pesereta pelatihan!`,
      });
      handleFetchingPublicTrainingDataById();
    }
  };

  const [isIteratingProcess, setIsIteratingProcess] = React.useState<boolean>(false)
  const handleValidDataPesertaPelatihan = async () => {
    setIsIteratingProcess(true)
    try {
      // Iterate through each user and update their status
      for (const user of data) {
        const formData = new FormData();
        formData.append("Keterangan", 'Valid');

        console.log(`Updating user: ${user.IdUserPelatihan}, Status: Valid`);

        await axios.put(
          `${baseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("XSRF091")}`,
            },
          }
        );
      }

      Toast.fire({
        icon: "success",
        title: 'Yeayyy!',
        text: `Berhasil memvalidasi ${data.length} peserta pelatihan!`,
      });
      handleAddHistoryTrainingInExisting(dataPelatihan!, 'Telah memvalidasi data peserta kelas', Cookies.get('Eselon'), Cookies.get('Satker'))
      setIsIteratingProcess(false)
      handleFetchingPublicTrainingDataById();
      setOpenFormValidasiDataPesertaPelatihan(false);
    } catch (error) {
      console.error("ERROR UPDATE PELATIHAN:", error);
      Toast.fire({
        icon: "error",
        title: 'Oopsss!',
        text: `Gagal memvalidasi peserta, harap coba lagi!`,
      });

      setOpenFormValidasiDataPesertaPelatihan(false);
      setIsIteratingProcess(false)
      handleFetchingPublicTrainingDataById();
    }
  };

  const handleRevisiSertifikatPeserta = async (user: UserPelatihan) => {
    try {
      const formData = new FormData();
      formData.append("StatusPenandatangan", user.StatusPenandatangan == 'Done' ? 'Revisi' : '');

      const response = await axios.put(
        `${baseUrl}/lemdik/updatePelatihanUsers?id=${user.IdUserPelatihan}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );

      console.log({ response })

      Toast.fire({
        icon: "success",
        title: 'Yeayyy!',
        text: `Oke, silahkan lanjut lakukan revisi sertifikat peserta pelatihan!`,
      });

      handleFetchingPublicTrainingDataById();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: 'Oopsss!',
        text: `Gagal lanjut lakukan revisi sertifikat peserta pelatihan!`,
      });

      handleFetchingPublicTrainingDataById();
    }
  };

  const [
    openFormValidasiDataPesertaPelatihan,
    setOpenFormValidasiDataPesertaPelatihan,
  ] = React.useState<boolean>(false);

  const [
    openFormKelulusanDataPesertaPelatihan,
    setOpenFormKelulusanDataPesertaPelatihan,
  ] = React.useState<boolean>(false);

  const [openFormSematkanNoSertifikat, setOpenFormSematkanNoSertifikat] = React.useState<boolean>(false)
  const [openFormSematkanTanggalSertifikat, setOpenFormSematkanTanggalSertifikat] = React.useState<boolean>(false)
  const [openFormSematkanSpesimenSertifikat, setOpenFormSematkanSpesimenSertifikat] = React.useState<boolean>(false)

  const handleTTDeById = async (idUserPelatihan: string, passphrase: string) => {
    if (!passphrase) {
      Toast.fire({
        icon: "error",
        text: "Harap memasukkan passphrase!",
        title: `Tidak ada passphrase`,
      });
      return;
    }

    try {
      const response = await axios.post(
        elautBaseUrl + "/lemdik/sendSertifikatTtdeById",
        {
          id_user_pelatihan: idUserPelatihan.toString(),
          kodeParafrase: passphrase,
          nik: Cookies.get("NIK"),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );

      console.log({ response })

      Toast.fire({
        icon: "success",
        text: "Berhasil melakukan penandatangan sertifikat revisi!",
        title: `Berhasil TTDe`,
      });

      handleFetchingPublicTrainingDataById();
    } catch (error) {
      console.log({ error })
      handleFetchingPublicTrainingDataById();
    }
  };


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

            <span>Detail Peserta</span>


            <TbDatabaseEdit className="ml-1 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`flex items-center justify-center w-full gap-1`}>
          <Link
            href={`/admin/${usePathname().includes("lemdiklat") ? "lemdiklat" : "pusat"
              }/pelatihan/${paths[paths.length - 3]}/peserta-pelatihan/${row.original.IdPelatihan
              }/${encryptValue(row.original.IdUserPelatihan)}/${encryptValue(
                row.original.IdUsers
              )}`}
            className=" border border-neutral-800  text-white  shadow-sm hover:bg-neutral-800 bg-neutral-800 hover:text-white h-9 px-4 py-2 mx-0 rounded-md flex text-sm items-center gap-2"
          >
            <LucideInfo className="h-4 w-4 " />{" "}
            <span className="text-sm">Detail</span>
          </Link>
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
                          Sematkan No Sertifikat
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
                    userPelatihan={row.original}
                    handleFetchingData={handleFetchingPublicTrainingDataById}
                  >
                    <Button
                      variant="outline"
                      className="w-full border flex gap-2 border-gray-700 bg-neutral-600 text-neutral-200 text-left capitalize items-center justify-center hover:bg-neutral-700 hover:text-neutral-200"
                    >
                      <FiUploadCloud className="h-4 w-4 text-neutral-200" />
                      Generate Sertifikat
                    </Button>
                  </DialogSertifikatPelatihan>
                ) : countUserWithCertificate(data) > 1 ? (
                  <div className='flex gap-1'>
                    <Link
                      target="_blank"
                      href={`${row.original.FileSertifikat.includes('drive') ? row.original.FileSertifikat : `https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${row.original.FileSertifikat}`}`}
                      className="w-full border flex gap-2 bg-blue-600 text-left capitalize items-center justify-center h-9 px-4 py-3 border-blue-600  whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 hover:bg-blue-600 text-white"
                    >
                      <RiVerifiedBadgeFill className="h-4 w-4  " />
                      <span className="text-sm">Download Sertifikat</span>
                    </Link>
                    {
                      (dataPelatihan?.IsRevisi == "1" && row.original.StatusPenandatangan == 'Revisi' && Cookies.get("Access")?.includes("createCertificates")) && <Button
                        onClick={() => handleDeleteCertificateById(row.original.IdUserPelatihan)}
                        className="w-full border flex gap-2 bg-rose-600 text-left capitalize items-center justify-center h-9 px-4 py-3 border-rose-600  whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 hover:bg-rose-600 text-white"
                      >
                        <HiTrash className="h-4 w-4 " />
                        <span className="text-sm">Hapus Sertifikat</span>
                      </Button>
                    }


                    {
                      (dataPelatihan?.IsRevisi == "1" &&
                        row.original.StatusPenandatangan == "Revisi" &&
                        Cookies.get("Access")?.includes("isSigning")) && (
                        <TTDRevisiButton
                          row={row}
                          handleTTDeSertifikat={handleTTDeById}
                        />
                      )
                    }

                  </div>

                ) : (
                  <Link
                    href={
                      "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-raw/" +
                      row.original.FileSertifikat
                    }
                    className='w-full'
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
      accessorKey: "IdUsers",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold w-fit p-0 flex justify-start items-centee`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> ID Peserta</p>

            <AiOutlineFieldNumber className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-center capitalize `}>
          <p className="text-base font-semibold tracking-tight leading-none">
            {row.original.IdUsers}
          </p>
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
            <p className="leading-[105%]"> No STTPL</p>

            <AiOutlineFieldNumber className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`${"ml-0"} text-left capitalize `}>
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
            className={`text-black font-semibold w-full p-0 flex justify-start items-center`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]"> Nama Peserta</p>

            <FaRegIdCard className="ml-2 h-4 w-4" />
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
      accessorKey: "IdUserPelatihan",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`text-black font-semibold w-full p-0 ${dataPelatihan?.IsRevisi == "" ? "hidden" : "justify-center items-center flex"}`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <p className="leading-[105%]">Revisi <br /> Sertifikat</p>
            <IoReload className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className={`text-left capitalize w-full ${dataPelatihan?.IsRevisi == "" ? "hidden" : "justify-center items-center flex -ml-2"}  `}>
          <div className='text-black font-semibold w-full p-0 justify-center flex gap-1'><Checkbox id="isActice" onCheckedChange={() => {
            handleRevisiSertifikatPeserta(row.original)
          }} checked={row.original.StatusPenandatangan == 'Revisi' ? true : false} /></div>
        </div>
      ),
    },
  ];

  const [selectedRole, setSelectedRole] = useState("PESERTA")

  const filteredData = React.useMemo(() => {
    return data.filter(
      (row: UserPelatihan) =>
        generatedStatusCertificate(row?.IsActice).position?.toUpperCase() ===
        selectedRole.toUpperCase()
    )
  }, [data, selectedRole])

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),

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

  const [tanggalSertifikat, setTanggalSertifikat] = React.useState<string>('')

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
      handleAddHistoryTrainingInExisting(dataPelatihan!, 'Telah mengupload data peserta kelas', Cookies.get('Eselon'), Cookies.get('Satker'))
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

  /**
    * Zip Download Processing
    */
  const [isZipping, setIsZipping] = React.useState(false)
  const handleDownloadZip = async () => {
    setIsZipping(true)
    try {
      await downloadAndZipPDFs(
        data,
        `(${dataPelatihan!.Program}) ${dataPelatihan!.PenyelenggaraPelatihan} - ${generateTanggalPelatihan(dataPelatihan!.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(dataPelatihan!.TanggalBerakhirPelatihan)}`,
      )
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsZipping(false)
    }
  }

  /**
   * Zip Uploading Processing
   */
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const handleZipUpload = async (zipFile: File, users: UserPelatihan[]) => {
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(zipFile)

    for (const fileName of Object.keys(zipContent.files)) {
      const baseName = fileName.split("/").pop()
      if (!baseName) continue

      const ext = baseName.split(".").pop()?.toLowerCase()
      if (!["jpg", "jpeg", "png"].includes(ext || "")) continue

      const id = parseInt(baseName.replace(/\.[^/.]+$/, ""), 10)
      if (isNaN(id)) continue

      const matchedUser = users.find((user) => user.IdUsers === id)
      if (!matchedUser) {
        console.warn(`⚠️ No user matched for file: ${fileName}`)
        continue
      }

      const fileBlob = await zipContent.files[fileName].async("blob")

      const formData = new FormData()
      formData.append("Fotos", fileBlob, baseName)
      formData.append("Ktps", "")
      formData.append("KKs", "")
      formData.append("Ijazahs", "")
      formData.append("SuratKesehatans", "")

      try {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/updateUsersNoJwt?id=${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
        console.log(`✅ Uploaded for user ID ${id}`, response.data)
      } catch (error) {
        console.error(`❌ Failed for user ID ${id}`, error)
      }
    }
  }
  const handleSubmitZipUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    try {
      await handleZipUpload(selectedFile, data)
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
    }
  }

  /**
  * Delete Draft Certificates
  */
  const handleDeleteDraftCertificate = async (id_pelatihan: number) => {
    try {
      const token = Cookies.get("XSRF091")
      const response = await axios.put(
        `${elautBaseUrl}/deleteSertifikatFiles`,
        {},
        {
          params: { id_pelatihan },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )


      Toast.fire({
        icon: "success",
        title: "Yeayyy!!",
        text: `Berhasil menghapus draft sertifikat!`,
      });
      handleFetchingPublicTrainingDataById()
    } catch (error: any) {
      console.error({ error })
      console.error("Error deleting draft certificate:", error.response?.data || error.message)
      Toast.fire({
        icon: "error",
        title: "Upsss!!",
        text: `Gagal menghapus draft sertifikat!`,
      });
      handleFetchingPublicTrainingDataById()
    }
  }

  /**
  * Handling Revisi Sertifikat
  */
  const handleReviseCertificate = async (id_pelatihan: number) => {
    try {
      const token = Cookies.get("XSRF091")
      const updateData = new FormData()
      updateData.append('IsRevisi', '1')

      const response = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${id_pelatihan}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )

      Toast.fire({
        icon: "success",
        title: "Yeayyy!!",
        text: `Silahkan melakukan revisi sertifikat, notifikasi sudah dikirimkan ke pihak pusat/penandatangan!`,
      });
      handleFetchingPublicTrainingDataById()
    } catch (error: any) {
      Toast.fire({
        icon: "error",
        title: "Upssss!!",
        text: `Gagal menghapus draft sertifikat!`,
      });
      handleFetchingPublicTrainingDataById()
    }
  }

  /**
 * Handling Delete Sertifikat
 */
  const handleDeleteCertificateById = async (id: number) => {
    try {
      const token = Cookies.get("XSRF091")
      const updateData = new FormData()
      updateData.append('IsRevisi', '1')

      const response = await axios.delete(
        `${elautBaseUrl}/deleteSertifikatTTde?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      Toast.fire({
        icon: "success",
        title: "Yeayyy!!",
        text: `Berhasil menghapus file sertifikat yang telah terbit, silahkan perbaiki kesalahan dan ajukan kembali draft sertifikat!`,
      });
      handleFetchingPublicTrainingDataById()
    } catch (error: any) {
      Toast.fire({
        icon: "error",
        title: "Upssss!!",
        text: `Gagal menghapus file sertifikat yang telah terbit, silahkan perbaiki kesalahan dan ajukan kembali draft sertifikat!`,
      });
      handleFetchingPublicTrainingDataById()
    }
  }



  return (
    <div className="">
      <div className="flex flex-col w-full">
        <div className="flex flex-row gap-2 items-center">
          {(dataPelatihan !== null && data !== null) && <header
            aria-label="page caption"
            className="flex-row w-full py-5 flex items-center gap-2 bg-gray-100 border-t px-4"
          >
            <div className="w-full flex items-center justify-between gap-8">
              <div className="flex gap-2 ">
                <HiUserGroup className="text-3xl" />
                <div className="flex flex-col ">
                  <h1 id="page-caption" className="font-semibold text-lg">

                    {dataPelatihan != null ? dataPelatihan!.NamaPelatihan : ""} ({dataPelatihan != null ? dataPelatihan!.PenyelenggaraPelatihan : ""})  ({dataPelatihan?.UserPelatihan.length} Orang)
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

                  </p>
                </div>
              </div>
              {dataPelatihan != null && <ShowingBadge data={dataPelatihan} />}
            </div>
          </header>}
        </div>
      </div>

      {dataPelatihan !== null &&
        <>
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


          <AlertDialog open={openFormValidasiDataPesertaPelatihan}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  {DIALOG_TEXTS['Validasi Grouping Peserta'].title}
                </AlertDialogTitle>
                <AlertDialogDescription className="-mt-2">
                  {DIALOG_TEXTS['Validasi Grouping Peserta'].desc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <fieldset>
                <form autoComplete="off">
                  <AlertDialogFooter className="mt-3">
                    {
                      isIteratingProcess ? <AlertDialogAction
                        className="bg-green-500 hover:bg-green-600"
                        disabled
                      >
                        Sedang diproses...
                      </AlertDialogAction> : <>
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
                            handleValidDataPesertaPelatihan()
                          }
                        >
                          Validasi
                        </AlertDialogAction></>
                    }
                  </AlertDialogFooter>
                </form>
              </fieldset>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={openFormDeleteFileSertifikat}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  {DIALOG_TEXTS['Hapus File Sertifikat'].title}
                </AlertDialogTitle>
                <AlertDialogDescription className="-mt-2">
                  {DIALOG_TEXTS['Hapus File Sertifikat'].desc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <fieldset>
                <form autoComplete="off">
                  <AlertDialogFooter className="mt-3">
                    {
                      isDeletingFileSertifikat ? <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        disabled
                      >
                        Sedang diproses...
                      </AlertDialogAction> : <>
                        <AlertDialogCancel
                          onClick={(e) =>
                            setOpenFormDeleteFileSertifikat(
                              false
                            )
                          }
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={(e) =>
                            handleDeleteFileSertifikat()
                          }
                        >
                          Hapus Draft File Sertifikat
                        </AlertDialogAction></>
                    }
                  </AlertDialogFooter>
                </form>
              </fieldset>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }

      <div className="w-full pb-8">
        {(dataPelatihan !== null && data !== null) && <div className="flex w-full items-center mb-2">

          {
            usePathname().includes('lemdiklat') && data!.length > 0 && countValid != data!.length && <div className="w-full flex justify-end gap-2">
              <div
                onClick={(e) => {
                  setOpenFormValidasiDataPesertaPelatihan(true)
                }}
                className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer"
              >
                <TbEditCircle />

                Validasi Data Peserta
              </div>
            </div>
          }

          {
            usePathname().includes('lemdiklat') && countPinnedCertificateDate != data!.length && dataPelatihan!.NoSertifikat != '' && countPinnedCertificateNumber == data!.length && <div className="w-full flex justify-end gap-2">
              <div
                onClick={(e) => {
                  setOpenFormSematkanTanggalSertifikat(true)
                }}
                className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer"
              >
                <TbEditCircle />

                Sematkan Tanggal Sertifikat Peserta
              </div>
            </div>
          }

          {
            usePathname().includes('lemdiklat') && countPinnedCertificateSpesimen != data!.length && dataPelatihan!.NoSertifikat != '' && countPinnedCertificateDate == data!.length && <div className="w-full flex justify-end gap-2">
              <div
                onClick={(e) => {
                  setOpenFormSematkanSpesimenSertifikat(true)
                }}
                className="inline-flex gap-2 px-3 text-sm items-center rounded-md bg-whiter p-1.5  cursor-pointer"
              >
                <PiSignature />
                Sematkan Spesimen TTD
              </div>
            </div>
          }
        </div>
        }
        {
          !Cookies.get('XSRF094') && <div className='w-full gap-0'>
            <div className=" w-full">
              <div className="w-full border border-gray-200 rounded-xl">
                <div className="bg-gray-100 p-4 w-full ">
                  <h2 className="font-calsans text-xl">
                    Action/Information
                  </h2>
                </div>
                <table className="w-full">
                  <tr className="flex w-fit items-center justify-start p-2 gap-2">
                    {/* Import Peserta Pelatihan */}
                    {(Cookies.get('Access')?.includes('createCertificates') &&
                      dataPelatihan?.StatusApproval != "Selesai" && dataPelatihan?.UserPelatihan.length == 0) && (
                        <Button
                          type="button"
                          onClick={(e) => {
                            if (dataPelatihan?.StatusApproval != "Selesai") {
                              Toast.fire({
                                icon: "error",
                                title: 'Ups!!!',
                                text: `Pelatihan sudah ditutup dan no sertifikat telah terbit, tidak dapat menambahkan lagi!`,
                              });
                            } else {
                              setIsOpenFormPeserta(!isOpenFormPeserta);
                            }
                          }}
                          className="flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium rounded-lg border bg-indigo-500 text-white 
                     hover:bg-indigo-600 transition-colors w-fit shadow-sm flex-shrink-0"
                        >
                          <PiMicrosoftExcelLogoFill />
                          Import Data Peserta
                        </Button>
                      )}

                    <AlertDialog open={isOpenFormPeserta}>
                      <AlertDialogContent className="max-w-lg rounded-xl shadow-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <HiMiniUserGroup className="h-5 w-5 text-blue-600" />
                            Import Peserta Pelatihan
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm text-gray-600">
                            Import peserta yang akan mengikuti pelatihan ini menggunakan template Excel.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <form autoComplete="off" className="space-y-5 mt-3">
                          {/* Upload Box */}
                          <div>
                            <label className="block text-gray-800 text-sm font-medium mb-2">
                              Data By Name By Address <span className="text-red-500">*</span>
                            </label>

                            <div className="flex gap-3">
                              {/* Modern File Upload */}
                              <label
                                htmlFor="file-upload"
                                className="flex-1 flex flex-col items-center justify-center h-28 px-4 border-2 border-dashed rounded-lg cursor-pointer 
                     bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-blue-500 
                     transition group"
                              >
                                <FiUploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-1" />

                                <span className="text-sm text-center text-gray-600 group-hover:text-blue-600">
                                  {
                                    fileExcelPesertaPelatihan ? truncateText(fileExcelPesertaPelatihan.name, 25, '...') : 'Klik atau drag file untuk upload'
                                  }
                                </span>
                                <span className="text-xs text-gray-400">Format: .xlsx</span>
                                <input
                                  id="file-upload"
                                  type="file"
                                  className="hidden"
                                  required
                                  onChange={handleFileChange}
                                />
                              </label>

                              {/* Download Template */}
                              <Link
                                target="_blank"
                                href="https://docs.google.com/spreadsheets/d/12t7l4bBjPBcxXpCPPOqYeTDoZxBi5aS7/export?format=xlsx"
                                className="flex flex-col items-center justify-center w-36 h-28 rounded-lg bg-green-600 text-white text-sm font-medium shadow hover:bg-green-700 transition gap-2"
                              >
                                <PiMicrosoftExcelLogoFill className="h-6 w-6" />
                                <span>Unduh Template</span>
                              </Link>
                            </div>

                            <p className="text-xs text-gray-500 mt-2 leading-snug">
                              *Download template terlebih dahulu, isi file Excel, lalu upload.
                              Perlu diingat, import data hanya dapat dilakukan{" "}
                              <span className="font-semibold">sekali</span>.
                            </p>
                          </div>

                          {/* Footer */}
                          <AlertDialogFooter className="pt-4 border-t border-gray-200">
                            <AlertDialogCancel
                              onClick={() => setIsOpenFormPeserta(false)}
                              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100"
                            >
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              disabled={fileExcelPesertaPelatihan == null}
                              onClick={handleUploadImportPesertaPelatihan}
                              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                            >
                              Upload
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </form>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Upload Zip Foto Participants And Before Draft All Certificates */}
                    {(Cookies.get('Access')?.includes('createCertificates') && countUserWithCertificate(data) != data.length) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium rounded-lg border bg-blue-500 text-white 
                     hover:bg-blue-600 transition-colors shadow-sm w-fit flex-shrink-0"
                          >
                            <HiMiniArrowUpTray className="w-4 h-4 inline" />
                            <span>Upload Zip Foto</span>
                          </button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="max-w-md rounded-2xl shadow-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-semibold text-gray-800">
                              Upload Folder Foto Peserta
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-500">
                              Silakan pilih file <span className="font-medium">.zip</span> berisi foto peserta dengan format{" "}
                              <code>IDPeserta.formatfile</code>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          {/* File Upload Box */}
                          <label
                            htmlFor="zip-upload"
                            className="mt-4 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed 
                     border-gray-300 rounded-xl cursor-pointer hover:border-green-500 
                     transition-colors bg-gray-50"
                          >
                            <HiMiniArrowUpTray className="w-8 h-8 text-gray-400 mb-2 group-hover:text-green-500" />
                            <span className="text-sm text-gray-600">
                              {selectedFile ? selectedFile.name : "Klik untuk memilih file ZIP"}
                            </span>
                            <span className="text-xs text-gray-400">atau drag & drop di sini</span>
                            <input
                              id="zip-upload"
                              type="file"
                              accept=".zip"
                              className="hidden"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0]
                                if (file) setSelectedFile(file)
                              }}
                            />
                          </label>

                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="rounded-lg">Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleSubmitZipUpload}
                              disabled={!selectedFile || isUploading}
                              className="bg-green-500 hover:bg-green-600 text-white rounded-lg inline-flex items-center gap-2"
                            >
                              {isUploading ? (
                                <span className="flex items-center gap-2">
                                  <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                  </svg>
                                  Mengupload...
                                </span>
                              ) : (
                                "Simpan"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {/* Delete Draft Certificates */}
                    {(Cookies.get('Access')?.includes('deleteCertificates') &&
                      (countUserWithDraftCertificate(data) > 0 && countUserWithDraftCertificate(data) <= data.length)) && (
                        <div className="w-full flex justify-end gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                className="flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium rounded-lg border bg-rose-500 text-white 
              hover:bg-rose-600 transition-colors shadow-sm w-fit flex-shrink-0"
                              >
                                <HiTrash />
                                Hapus Draft
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Yakin ingin menghapus?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tindakan ini akan menghapus semua draft sertifikat pada pelatihan ini. Proses ini tidak bisa dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-rose-500 text-white hover:bg-rose-600"
                                  onClick={() => handleDeleteDraftCertificate(parseInt(id))}
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}

                    {/* Download Zip Certificates After Signed */}
                    {countUserWithCertificate(data) == data.length && <Button
                      onClick={handleDownloadZip}
                      disabled={isZipping}
                      className={`flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium rounded-lg border bg-teal-500 text-white 
                     hover:bg-teal-600 transition-colors w-fit shadow-sm flex-shrink-0`}
                    >
                      <FaRegFolderOpen className="h-4 w-4" />
                      <span className="text-sm">
                        {isZipping ? 'Zipping & Downloading...' : 'Download Zip Sertifikat'}
                      </span>
                    </Button>
                    }

                    {/* Update Certificates */}
                    {(Cookies.get('Access')?.includes('updateCertificates') && countUserWithCertificate(data) == data.length && dataPelatihan?.IsRevisi != "1") && (
                      <div className="w-full flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              type="button"
                              className="flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium rounded-lg border bg-gray-500 text-white 
              hover:bg-gray-600 transition-colors shadow-sm w-fit flex-shrink-0"
                            >
                              <IoReload />
                              Revisi Sertifikat
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ada sertifikat yang perlu direvisi?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Langkah melakukan revisi,
                                <div className="flex flex-col">
                                  <span>1. Identifikasi Sertifikat Yang Dianggap Perlu Direvisi/Ditambahkan;</span>
                                  <span>2. Lakukan Penambahan/Pengupdatean Data Sesuai Kebutuhan dan Pastikan Tersampaikan Secara Formal;</span>
                                  <span>3. Hapus Terlebih Dahulu Sertifikat Yang Telah Terbit Sebelumnya</span>
                                  <span>4. Ajukan Sertifikat Kembali;</span>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-gray-500 text-white hover:bg-gray-600"
                                onClick={() => handleReviseCertificate(parseInt(id))}
                              >
                                Lakukan Revisi
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </tr>
                </table>
              </div>
            </div>
            <div className=" w-full mb-4"></div>
          </div>
        }
        <Tabs
          defaultValue="PESERTA"
          className="w-full"
          onValueChange={(val) => setSelectedRole(val)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="PESERTA">Peserta Diklat</TabsTrigger>
            <TabsTrigger value="INSTRUKTUR">Pelatih/Trainer</TabsTrigger>
            <TabsTrigger value="FASILITATOR">Fasilitator</TabsTrigger>
            <TabsTrigger value="SUPERVISOR">Supervisor</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedRole}>
            {/* 🔍 Search input */}
            <Input
              placeholder="Cari data peserta..."
              value={(table.getColumn("Nama")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("Nama")?.setFilterValue(event.target.value)
              }
              className="w-full text-sm py-2 px-4 rounded-lg border border-gray-300 
             bg-gray-50 text-gray-800 placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             transition mb-3"
            />



            {/* Pass filtered data */}
            <TableData
              isLoading={false}
              columns={columns}
              table={{ ...table, rows: filteredData }}
              type="short"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const TTDRevisiButton = ({ row, handleTTDeSertifikat }: { row: any, handleTTDeSertifikat: any }) => {
  const [passphrase, setPassphrase] = React.useState("")
  const [isShowPassphrase, setIsShowPassphrase] = React.useState(false)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full flex gap-2 items-center justify-center h-9 px-4 py-3 rounded-md text-sm font-medium transition-colors bg-teal-600 text-white border border-teal-600 shadow-sm hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500">
          <TbSignature className="h-4 w-4" />
          <span className="text-sm">TTDe Sertifikat</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex flex-col gap-1">
            <AlertDialogTitle className="flex items-center gap-2">
              <TbSignature className="text-3xl" />
              Passphrase
            </AlertDialogTitle>
            <p className="-mt-1 text-gray-500 text-sm leading-[110%]">
              Masukkan passphrase anda untuk melanjutkan proses
              penandatanganan sertifikat revisi.
            </p>
          </div>
        </AlertDialogHeader>

        <fieldset>
          <form autoComplete="off">
            <div className="flex flex-wrap -mx-3 mb-1 -mt-2">
              <div className="w-full px-3">
                <label className="block text-gray-800 text-sm font-medium mb-1">
                  Passphrase
                </label>
                <div className="flex gap-1">
                  <span className="relative w-full h-fit">
                    <input
                      type={isShowPassphrase ? "text" : "password"}
                      className="text-black h-10 text-base flex items-center w-full border border-neutral-200 rounded-md px-3"
                      required
                      autoComplete="off"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                    />
                    <span
                      onClick={() => setIsShowPassphrase(!isShowPassphrase)}
                    >
                      {isShowPassphrase ? (
                        <HiOutlineEyeOff className="absolute right-3 top-2.5 text-gray-500 text-xl cursor-pointer" />
                      ) : (
                        <HiOutlineEye className="absolute right-3 top-2.5 text-gray-500 text-xl cursor-pointer" />
                      )}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <AlertDialogFooter className="mt-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleTTDeSertifikat(row.original.IdUserPelatihan, passphrase)
                }
              >
                Tanda Tangan
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </fieldset>
      </AlertDialogContent>
    </AlertDialog>
  )
}


export default TableDataPesertaPelatihan;
