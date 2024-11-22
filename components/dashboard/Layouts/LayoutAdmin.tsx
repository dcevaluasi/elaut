"use client";

import Toast from "@/components/toast";
import { dpkakpBaseUrl } from "@/constants/urls";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPUKAKP, setIsPUKAKP] = useState(false);
  const router = useRouter();

  const handleLogOut = async () => {
    Cookies.remove("XSRF095");
    Cookies.remove("IsPUKAKP");
    Toast.fire({
      icon: "success",
      title: `Berhasil logout dari admin DPKAKP!`,
    });
    router.replace("/lembaga/dpkakp/admin/auth/login");
  };

  const fetchAdminData = async () => {
    try {
      const { data } = await axios.get(
        `${dpkakpBaseUrl}/adminPusat/getAdminPusat`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF095")}`,
          },
        }
      );
      Cookies.set("PUKAKP", data.data.Nama);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    }
  };

  useEffect(() => {
    fetchAdminData();
    setIsPUKAKP(Boolean(Cookies.get("IsPUKAKP")));
  }, []);

  const navItems = isPUKAKP
    ? [
        {
          title: "Pelaksanaan Ujian AKP",
          href: "/lembaga/pukakp/admin/dashboard/ujian",
          iconPath:
            "M12 6.453l9 8.375v9.172h-6v-6h-6v6h-6v-9.172l9-8.375zm12 5.695l-12-11.148-12 11.133 1.361 1.465 10.639-9.868 10.639 9.883 1.361-1.465z",
          active: true,
        },
      ]
    : [
        {
          title: "Pelaksanaan Ujian AKP",
          href: "/lembaga/dpkakp/admin/dashboard/ujian",
          iconPath:
            "M12 6.453l9 8.375v9.172h-6v-6h-6v6h-6v-9.172l9-8.375zm12 5.695l-12-11.148-12 11.133 1.361 1.465 10.639-9.868 10.639 9.883 1.361-1.465z",
          active: true,
        },

        {
          title: "Customer Lists",
          href: "#customer-lists",
          iconPath:
            "M19 7.001c0 3.865-3.134 7-7 7s-7-3.135-7-7c0-3.867 3.134-7.001 7-7.001s7 3.134 7 7.001zm-1.598 7.18c-1.506 1.137-3.374 1.82-5.402 1.82-2.03 0-3.899-.685-5.407-1.822-4.072 1.793-6.593 7.376-6.593 9.821h24c0-2.423-2.6-8.006-6.598-9.819z",
        },
        {
          title: "Reporting",
          href: "#reporting",
          iconPath:
            "M5 19h-4v-4h4v4zm6 0h-4v-8h4v8zm6 0h-4v-13h4v13zm6 0h-4v-19h4v19zm1 2h-24v2h24v-2z",
        },
        {
          title: "Admin",
          href: "#admin",
          iconPath:
            "M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z",
        },
      ];

  return (
    <div className="h-screen w-full flex text-gray-800 bg-white">
      {/* Sidebar */}
      <nav className="flex-none flex flex-col items-center bg-blue-950 text-gray-400 border-r h-screen">
        <div className="h-16 flex items-center w-full">
          <Image
            src="/lembaga/logo/logo-sertifikasi-akp.png"
            alt="Logo"
            width={40}
            height={40}
            className="mx-auto"
          />
        </div>
        <ul className="w-full">
          {navItems.map(({ title, href, iconPath, active }) => (
            <li key={title}>
              <a
                href={href}
                title={title}
                className={`h-16 px-6 flex items-center w-full ${
                  active
                    ? "text-white bg-blue-500"
                    : "hover:text-white hover:bg-blue-500"
                } group`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mx-auto fill-gray-300 duration-700 group-hover:fill-white"
                  viewBox="0 0 24 24"
                  fill=""
                >
                  <path d={iconPath} />
                </svg>
              </a>
            </li>
          ))}
        </ul>
        <div
          className="mt-auto h-16 flex items-center w-full cursor-pointer"
          onClick={() => handleLogOut()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 mx-auto text-gray-200 hover:text-blue-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 17v-4H7v-2h9V7l5 5-5 5zm-2 3H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h9v2H5v12h9v2z"
            />
          </svg>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow overflow-y-scroll scrollbar-hide">
        {children}
      </main>
    </div>
  );
}
