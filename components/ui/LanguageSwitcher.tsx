"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { HiGlobeAlt } from "react-icons/hi2";
import { FiCheck } from "react-icons/fi";

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = React.useState(false);

    const languages = [
        { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
        { code: "en", name: "English", flag: "🇺🇸" },
    ];

    const currentLang = languages.find((lang) => lang.code === language);

    return (
        <div className="relative z-[100]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white/50 backdrop-blur-md hover:bg-white transition-all shadow-sm hover:shadow-md group"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-blue-600"
                >
                    <HiGlobeAlt className="text-xl" />
                </motion.div>
                <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                    {language}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-10"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-100 shadow-2xl p-2 z-20 overflow-hidden"
                        >
                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                                Select Language
                            </div>
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code as "id" | "en");
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${language === lang.code
                                            ? "bg-blue-50 text-blue-600 font-semibold"
                                            : "hover:bg-gray-50 text-gray-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className="text-sm">{lang.name}</span>
                                    </div>
                                    {language === lang.code && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-blue-600"
                                        >
                                            <FiCheck />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher;
