import React, { useState } from "react";
import TableData from "@/commons/TableData";
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
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  LucideInfo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TbDatabaseEdit,
  TbEditCircle,
  TbSignature,
} from "react-icons/tb";

import { usePathname, useRouter } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import axios, { AxiosResponse } from "axios";
import { extractLastSegment } from "@/utils";
import {
  HiMiniUserGroup,
  HiOutlineEye,
  HiUserGroup,
} from "react-icons/hi2";
import Link from "next/link";
import { FaRegIdCard, } from "react-icons/fa6";
import Toast from "@/commons/Toast";
import Cookies from "js-cookie";
import { PiSignature } from "react-icons/pi";
import { User } from "@/types/user";
import { decryptValue, encryptValue, formatToRupiah } from "@/lib/utils";
import { elautBaseUrl } from "@/constants/urls";
import { DIALOG_TEXTS } from "@/constants/texts";
import { countUserWithCertificate, countUserWithNoSertifikat, countUserWithPassed, countUserWithSpesimenTTD, countUserWithTanggalSertifikat, countValidKeterangan } from "@/utils/counter";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { AiOutlineFieldNumber } from "react-icons/ai";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { generatedStatusCertificate } from "@/utils/certificates";
import { IoReload } from "react-icons/io5";
import { Input } from "@/components/ui/input";
import { HiOutlineEyeOff } from "react-icons/hi";

const TableDataPesertaPelatihan = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const pathname = usePathname();
  const id = decryptValue(extractLastSegment(pathname));
  const paths = pathname.split("/");

  const [dataPelatihan, setDataPelatihan] =
    React.useState<PelatihanMasyarakat | null>(null);
  const [emptyFileSertifikatCount, setEmptyFileSertifikatCount] =
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

  const [openFormSematkanTanggalSertifikat, setOpenFormSematkanTanggalSertifikat] = React.useState<boolean>(false)
  const [openFormSematkanSpesimenSertifikat, setOpenFormSematkanSpesimenSertifikat] = React.useState<boolean>(false)

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
        </>
      }

      <div className="w-full pb-8">

        <div className='w-full gap-0'>
          <div className=" w-full">
            <div className="w-full border border-gray-200 rounded-xl">
              <div className="bg-gray-100 p-4 w-full ">
                <h2 className="font-calsans text-xl">
                  Action/Information
                </h2>
              </div>
              <table className="w-full">
                <tr className="flex w-fit items-center justify-start p-2 gap-2">
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

export default TableDataPesertaPelatihan;
