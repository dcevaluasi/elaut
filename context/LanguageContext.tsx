"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

type Language = "id" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    id: {
        "nav.home": "Beranda",
        "nav.about": "Tentang",
        "nav.services": "Layanan",
        "nav.contact": "Kontak",
        "login.title": "Masuk ke Akun Anda",
        "login.email": "Alamat Email",
        "login.password": "Kata Sandi",
        "login.button": "Masuk",
        "login.forgot": "Lupa Kata Sandi?",
        "register.title": "Daftar Akun Baru",
        "register.name": "Nama Lengkap",
        "common.welcome": "Selamat Datang di E-LAUT",
        "common.logout": "Keluar",
        "common.profile": "Profil Saya",
        "header.tagline": "Elektronik Layanan Pelatihan Kelautan dan Perikanan Utama Terpadu",
    },
    en: {
        "nav.home": "Home",
        "nav.about": "About",
        "nav.services": "Services",
        "nav.contact": "Contact",
        "login.title": "Login to Your Account",
        "login.email": "Email Address",
        "login.password": "Password",
        "login.button": "Login",
        "login.forgot": "Forgot Password?",
        "register.title": "Register New Account",
        "register.name": "Full Name",
        "common.welcome": "Welcome to E-LAUT",
        "common.logout": "Logout",
        "common.profile": "My Profile",
        "header.tagline": "Integrated Electronic Marine and Fisheries Training Service",
    },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>("id");

    useEffect(() => {
        const savedLang = Cookies.get("NEXT_LOCALE") as Language;
        if (savedLang && (savedLang === "id" || savedLang === "en")) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        Cookies.set("NEXT_LOCALE", lang, { expires: 365 });
        // Optional: Refresh or handle routing if using URL-based locales
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
