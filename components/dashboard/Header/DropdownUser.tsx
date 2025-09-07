import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Toast from "@/components/toast";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import axios from "axios";
import { AiFillBank } from "react-icons/ai";

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
import { MdAlternateEmail, MdModeEdit } from "react-icons/md";
import { BiSolidPhone } from "react-icons/bi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { HiMiniUserGroup } from "react-icons/hi2";
import { elautBaseUrl } from "@/constants/urls";
import { PusatDetailInfo } from "@/types/pusat";
import { breakdownStatus } from "@/lib/utils";
import { generatedDetailInfoLemdiklat } from "@/utils/lemdiklat";
const DropdownUser = ({
  lemdiklatLoggedInInfo,
  pusatLoggedInInfo
}: {
  lemdiklatLoggedInInfo: LemdiklatDetailInfo | null;
  pusatLoggedInInfo?: PusatDetailInfo | null
}) => {
  const pathname = usePathname();
  const isLemdik = pathname.includes("lemdiklat");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("XSRF091");

  const isPusat = Cookies.get('XSRF093') === 'adminPusat'

  const typeRole = Cookies.get("XSRF093");

  type AdminPusat = {
    IdAdminPusat: number;
    Nama: string;
    Email: string;
    Password: string;
    NoTelpon: string;
    Nip: string;
    Status: string;
  };

  const [dataAdminPusat, setDataAdminPusat] = React.useState<AdminPusat | null>(
    null
  );

  const handleGetAdminPusat = async () => {
    try {
      const response = await axios.get(
        `${elautBaseUrl}/adminPusat/getAdminPusat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Cookies.set("Eselon", response.data.data.Nip);

      setDataAdminPusat(response.data.data);
    } catch (error) {
      console.error({ error });
    }
  };

  /*
    EDIT PROFILE HANDLING
  */
  const [openDialogEditProfile, setOpenDialogEditProfile] =
    React.useState<boolean>(false);
  const [openFormEditProfile, setOpenFormEditProfile] =
    React.useState<boolean>(false);

  const [isUpdating, setIsUpdating] = React.useState<boolean>(false)

  const [email, setEmail] = React.useState<string>("");
  const [namaLemdiklat, setNamaLemdiklat] = React.useState<string>("");
  const [noTelpon, setNoTelpon] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [deskripsi, setDeskripsi] = React.useState<string>("");
  const [LastNosertif, setLastNosertif] = React.useState<string>("");
  const [alamat, setAlamat] = React.useState<string>("");

  // VARIABLES UPDATE ADMIN PUSAT
  const [namaPusat, setNamaPusat] = React.useState<string>('')
  const [emailPusat, setEmailPusat] = React.useState<string>('')
  const [passwordPusat, setPasswordPusat] = React.useState<string>('')
  const [jabatanPusat, setJabatanPusat] = React.useState<string>('')
  const [nikPusat, setNikPusat] = React.useState<string>('')
  const [statusPusat, setStatusPusat] = React.useState<string>('')

  const setClearStatePusat = () => {
    setNamaPusat(''); setEmailPusat(''); setPasswordPusat(''); setJabatanPusat(''); setNikPusat(''); setStatusPusat('');
  }

  const handleUpdatePusat = async () => {
    setIsUpdating(true)

    const formData = new FormData()
    formData.append('Nama', namaPusat)
    formData.append('Email', emailPusat)
    formData.append('Password', passwordPusat)
    formData.append('NoTelpon', jabatanPusat)
    formData.append('Nip', nikPusat)
    formData.append('Status', statusPusat)

    try {
      const response = await axios.put(
        `${baseUrl}/adminPusat/updateAdminPusat`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );

      Toast.fire({
        icon: `success`,
        title: `Yeayyy!`,
        text: `Data profile mu telah berhasil diupdate!`,
      });

      console.log("SUCCESSFULLY UPDATE PROFILE: ", response)

      setOpenDialogEditProfile(!openFormEditProfile);
      setOpenFormEditProfile(!openFormEditProfile);
      setClearStatePusat()

      router.replace(`/admin/${isPusat ? 'pusat' : 'lemdiklat'}/pelatihan`);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: `Yeayyy!`,
        text: `Data profile mu gagal diupdate!`,
      });

      console.error("ERROR UPDATE PROFILE: ", error);
    }
  };

  const handleEditProfileUpdate = async () => {

    try {
      const response = await axios.put(
        `${baseUrl}/${isLemdik ? "lemdik" : "pusat"}/update`,
        {
          email: email,
          nama_lemdik: namaLemdiklat,
          no_telpon: noTelpon,
          deskripsi: deskripsi,
          alamat: alamat,
          no_last_sertifikat: LastNosertif,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Toast.fire({
        icon: "success",
        title: `Data profile lemdiklat mu telah diupdate!`,
      });
      // console.log("RESPONSE UPDATE PROFILE: ", response);
      setOpenDialogEditProfile(!openFormEditProfile);
      setOpenFormEditProfile(!openFormEditProfile);
      setNamaLemdiklat("");
      setEmail("");
      setNoTelpon("");
      setAlamat("");
      setLastNosertif("");
      setDeskripsi("");
      router.replace("/admin/lemdiklat/pelatihan");
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: `Data profile lemdiklat mu gagal diupdate!`,
      });
      console.error("ERROR UPDATE PROFILE: ", error);
      setOpenFormEditProfile(!openFormEditProfile);
    }
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  const handleLogout = async () => {
    [
      "XSRF091",
      "XSRF092",
      "XSRF093",
      "Satker",
      "IDLemdik",
      "Eselon",
      "Status",
      "Jabatan",
      "Access",
      "NIK",
      "Nama",
      "Role",
      "PimpinanLemdiklat"
    ].forEach((key) => Cookies.remove(key));
    Toast.fire({
      icon: "success",
      title: `Yeayyy!`,
      text: "Berhasil logout dari dashboard Admin E-LAUT!",
    });
    router.replace("/admin/auth/login");
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [dropdownOpen]);

  useEffect(() => {
    if (pathname.includes("pusat")) {
      handleGetAdminPusat();
    }
  }, [pathname]);


  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, []);


  return (
    <div className="relative z-[999999]">
      <AlertDialog open={openDialogEditProfile}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex justify-between items-center">
                <div className="flex w-fit gap-1 items-center font-semibold tracking-tighter">
                  <AiFillBank className="text-2xl text-blue-500" />
                  {openFormEditProfile ? "Edit" : "Detail"} Profile{" "}
                  {lemdiklatLoggedInInfo != null &&
                    lemdiklatLoggedInInfo!.data!.NamaLemdik}
                </div>
                {!openFormEditProfile && (
                  <div
                    onClick={(e) =>
                      setOpenFormEditProfile(!openFormEditProfile)
                    }
                    className="flex items-center animate-pulse duration-1000 hover:bg-blue-600 hover:animate-none hover:duration-0 cursor-pointer justify-center text-lg bg-blue-500 text-white rounded-full p-2"
                  >
                    <MdModeEdit />
                  </div>
                )}
              </div>
            </AlertDialogTitle>
            <div className="w-full h-[2px] bg-gray-300 rounded-full"></div>
            {openFormEditProfile ? (
              <form autoComplete="off">
                <AlertDialogDescription className=" mb-2 mt-1 text-justify text-gray-500">
                  {isPusat ? 'Edit profile-mu sekarang, isi format inputan sesuai  dengan datamu!' : 'Edit profile lemdiklatmu sekarang, isi format inputan sesuai dengan datamu!'}

                </AlertDialogDescription>
                {
                  isPusat ? <> <div className="grid grid-cols-2 gap-x-3 gap-y-2  mb-1 w-full">
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="nama"
                      >
                        Nama  <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="nama"
                        type="text"
                        className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                        required
                        placeholder={pusatLoggedInInfo != null
                          ? pusatLoggedInInfo!.data!.Nama!.toString()
                          : ""}
                        onChange={(e) => setNamaPusat(e.target.value)}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="email"
                      >
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                        required
                        placeholder={pusatLoggedInInfo != null
                          ? pusatLoggedInInfo!.data!.Email!.toString()
                          : ""}
                        onChange={(e) => setEmailPusat(e.target.value)}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="jabatanPusat"
                      >
                        Jabatan <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="jabatanPusat"
                        type="text"
                        className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                        required
                        value={jabatanPusat!}
                        placeholder={pusatLoggedInInfo != null
                          ? pusatLoggedInInfo!.data!.NoTelpon!.toString()
                          : ""}
                        onChange={(e) => setJabatanPusat(e.target.value)}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="nik"
                      >
                        NIK <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="nik"
                        type="text"
                        className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                        required
                        value={nikPusat!}
                        placeholder={pusatLoggedInInfo != null
                          ? pusatLoggedInInfo!.data!.Nip!.toString()
                          : ""}
                        onChange={(e) => setNikPusat(e.target.value)}
                      />
                    </div>
                  </div>
                  </> : <> <div className="grid grid-cols-2 gap-x-3 gap-y-2  mb-1 w-full">
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="namaLemdiklat"
                      >
                        Nama Lemdiklat <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="namaLemdiklat"
                        type="text"
                        className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                        required
                        placeholder={
                          lemdiklatLoggedInInfo != null
                            ? lemdiklatLoggedInInfo!.data!.NamaLemdik!
                            : ""
                        }
                        value={namaLemdiklat!}
                        onChange={(e) => setNamaLemdiklat(e.target.value)}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="email"
                      >
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                        required
                        placeholder={
                          lemdiklatLoggedInInfo != null
                            ? lemdiklatLoggedInInfo!.data!.Email!
                            : ""
                        }
                        value={email!}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="noTelpon"
                      >
                        No Telpon <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="noTelpon"
                        type="text"
                        className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                        required
                        value={noTelpon!}
                        placeholder={
                          lemdiklatLoggedInInfo != null
                            ? lemdiklatLoggedInInfo!.data!.NoTelpon!.toString()
                            : ""
                        }
                        onChange={(e) => setNoTelpon(e.target.value)}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="alamat"
                      >
                        Alamat <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="alamat"
                        type="text"
                        className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                        required
                        value={alamat!}
                        placeholder={
                          lemdiklatLoggedInInfo != null
                            ? lemdiklatLoggedInInfo!.data!.Alamat!
                            : ""
                        }
                        onChange={(e) => setAlamat(e.target.value)}
                      />
                    </div>
                  </div>
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="alamat"
                      >
                        No Terakhir Sertifikat{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="alamat"
                        type="text"
                        className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                        required
                        value={LastNosertif!}
                        placeholder={
                          lemdiklatLoggedInInfo != null
                            ? lemdiklatLoggedInInfo!.data!.LastNosertif!
                            : ""
                        }
                        onChange={(e) => setLastNosertif(e.target.value)}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        className="block text-gray-800 text-sm font-medium"
                        htmlFor="deskripsi"
                      >
                        Deskripsi <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        id="deskripsi"
                        className="form-input w-full text-sm text-black border-gray-300 rounded-md"
                        required
                        value={deskripsi!}
                        rows={7}
                        placeholder={
                          lemdiklatLoggedInInfo != null
                            ? lemdiklatLoggedInInfo!.data!.Deskripsi!
                            : ""
                        }
                        onChange={(e) => setDeskripsi(e.target.value)}
                      ></textarea>
                    </div></>
                }
                <AlertDialogFooter>
                  <div className="w-full flex flex-col gap-1 mt-3">
                    <AlertDialogAction
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={(e) => { isPusat ? handleUpdatePusat() : handleEditProfileUpdate() }}
                    >
                      Edit
                    </AlertDialogAction>
                    <AlertDialogCancel
                      onClick={(e) =>
                        setOpenFormEditProfile(!openFormEditProfile)
                      }
                    >
                      Cancel
                    </AlertDialogCancel>
                  </div>
                </AlertDialogFooter>
              </form>
            ) : (
              <>
                {" "}
                <div className="w-full flex flex-col gap-2 items-start justify-between">
                  <div className="flex gap-2 w-full items-center justify-between mt-4">
                    <div className="flex w-fit gap-1 items-center">
                      <AiFillBank className="text-lg text-blue-500" />
                      <span className="font-semibold text-sm tracking-tighter">
                        {" "}
                        {lemdiklatLoggedInInfo != null &&
                          lemdiklatLoggedInInfo!.data!.NamaLemdik}
                      </span>
                    </div>
                    <div className="flex w-fit gap-1 items-center">
                      <MdAlternateEmail className="text-lg text-blue-500" />
                      <span className="font-semibold text-sm tracking-tighter">
                        {" "}
                        {lemdiklatLoggedInInfo != null &&
                          lemdiklatLoggedInInfo!.data!.Email}
                      </span>
                    </div>
                    <div className="flex w-fit gap-1 items-center">
                      <BiSolidPhone className="text-lg text-blue-500" />
                      <span className="font-semibold text-sm tracking-tighter">
                        {" "}
                        {lemdiklatLoggedInInfo != null &&
                          lemdiklatLoggedInInfo!.data!.NoTelpon}
                      </span>
                    </div>
                  </div>

                  <div className="flex w-fit gap-1 items-center">
                    <RiVerifiedBadgeFill className="text-lg text-blue-500" />
                    <span className="font-semibold text-sm tracking-tighter">
                      {" "}
                      {/* {lemdiklatLoggedInInfo != null && lemdiklatLoggedInInfo!.data!.Email} */}
                      {lemdiklatLoggedInInfo != null &&
                        lemdiklatLoggedInInfo!.data!.LastNosertif}{" "}
                    </span>
                  </div>
                  <div className="flex w-fit gap-1 items-center">
                    <HiMiniUserGroup className="text-lg text-blue-500" />
                    <span className="font-semibold text-sm tracking-tighter">
                      {" "}
                      {pathname.includes("lemdik") &&
                        lemdiklatLoggedInInfo != null &&
                        lemdiklatLoggedInInfo!.data!.Pelatihan.length}
                      Pelatihan
                    </span>
                  </div>
                </div>
                <AlertDialogDescription className="-mt-2 text-justify text-gray-600">
                  {lemdiklatLoggedInInfo != null &&
                    lemdiklatLoggedInInfo!.data!.Deskripsi}
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={(e) =>
                      setOpenDialogEditProfile(!openDialogEditProfile)
                    }
                  >
                    Close
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </>
            )}
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <Link
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        href="#"
      >
        <span className="hidden md:flex md:justify-end md:flex-col">
          <span className="block text-sm font-medium text-black text-right">
            {pathname.includes("lemdiklat")
              ? generatedDetailInfoLemdiklat(lemdiklatLoggedInInfo?.data?.NamaLemdik! || "").lemdiklat
              : dataAdminPusat && pathname.includes("pusat")
                ? dataAdminPusat!.Nama
                : ""}
          </span>
          <span className=" gap-1 text-xs text-right">

            {pathname.includes("lemdiklat")
              ? `${generatedDetailInfoLemdiklat(lemdiklatLoggedInInfo?.data?.NamaLemdik! || "").name} - ${Cookies.get('Eselon')}`
              : dataAdminPusat && pathname.includes("pusat")
                ? `${breakdownStatus(Cookies.get('Status')!)[0]}`
                : ""}
          </span>
        </span>

        <span className="h-12 w-12 rounded-full">
          <Image
            width={112}
            height={112}
            src={"/dummies/profile.jpg"}
            style={{
              width: "auto",
              height: "auto",
            }}
            alt="User"
            className="rounded-full"
          />
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </Link>

      {/* <!-- Dropdown Start --> */}
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4 flex w-62.5 flex-col z-[9999999] rounded-sm border border-stroke bg-white shadow-default  ${dropdownOpen === true ? "block" : "hidden"
          }`}
      >
        <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 ">
          <li>
            <div
              onClick={(e) => setOpenDialogEditProfile(!openDialogEditProfile)}
              className="flex items-center gap-3.5 cursor-pointer text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
            >
              <svg
                className="fill-current"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 9.62499C8.42188 9.62499 6.35938 7.59687 6.35938 5.12187C6.35938 2.64687 8.42188 0.618744 11 0.618744C13.5781 0.618744 15.6406 2.64687 15.6406 5.12187C15.6406 7.59687 13.5781 9.62499 11 9.62499ZM11 2.16562C9.28125 2.16562 7.90625 3.50624 7.90625 5.12187C7.90625 6.73749 9.28125 8.07812 11 8.07812C12.7188 8.07812 14.0938 6.73749 14.0938 5.12187C14.0938 3.50624 12.7188 2.16562 11 2.16562Z"
                  fill=""
                />
                <path
                  d="M17.7719 21.4156H4.2281C3.5406 21.4156 2.9906 20.8656 2.9906 20.1781V17.0844C2.9906 13.7156 5.7406 10.9656 9.10935 10.9656H12.925C16.2937 10.9656 19.0437 13.7156 19.0437 17.0844V20.1781C19.0094 20.8312 18.4594 21.4156 17.7719 21.4156ZM4.53748 19.8687H17.4969V17.0844C17.4969 14.575 15.4344 12.5125 12.925 12.5125H9.07498C6.5656 12.5125 4.5031 14.575 4.5031 17.0844V19.8687H4.53748Z"
                  fill=""
                />
              </svg>
              My Profile
            </div>
          </li>
        </ul>
        <button
          onClick={(e) => handleLogout()}
          className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
        >
          <svg
            className="fill-current"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.5375 0.618744H11.6531C10.7594 0.618744 10.0031 1.37499 10.0031 2.26874V4.64062C10.0031 5.05312 10.3469 5.39687 10.7594 5.39687C11.1719 5.39687 11.55 5.05312 11.55 4.64062V2.23437C11.55 2.16562 11.5844 2.13124 11.6531 2.13124H15.5375C16.3625 2.13124 17.0156 2.78437 17.0156 3.60937V18.3562C17.0156 19.1812 16.3625 19.8344 15.5375 19.8344H11.6531C11.5844 19.8344 11.55 19.8 11.55 19.7312V17.3594C11.55 16.9469 11.2062 16.6031 10.7594 16.6031C10.3125 16.6031 10.0031 16.9469 10.0031 17.3594V19.7312C10.0031 20.625 10.7594 21.3812 11.6531 21.3812H15.5375C17.2219 21.3812 18.5625 20.0062 18.5625 18.3562V3.64374C18.5625 1.95937 17.1875 0.618744 15.5375 0.618744Z"
              fill=""
            />
            <path
              d="M6.05001 11.7563H12.2031C12.6156 11.7563 12.9594 11.4125 12.9594 11C12.9594 10.5875 12.6156 10.2438 12.2031 10.2438H6.08439L8.21564 8.07813C8.52501 7.76875 8.52501 7.2875 8.21564 6.97812C7.90626 6.66875 7.42501 6.66875 7.11564 6.97812L3.67814 10.4844C3.36876 10.7938 3.36876 11.275 3.67814 11.5844L7.11564 15.0906C7.25314 15.2281 7.45939 15.3312 7.66564 15.3312C7.87189 15.3312 8.04376 15.2625 8.21564 15.125C8.52501 14.8156 8.52501 14.3344 8.21564 14.025L6.05001 11.7563Z"
              fill=""
            />
          </svg>
          Log Out
        </button>
      </div>
      {/* <!-- Dropdown End --> */}
    </div>
  );
};

export default DropdownUser;
