"use client";

import React from "react";
import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";

interface AccordionSectionProps {
    value: string;
    title: string;
    icon?: React.ReactNode;
    description?: string;
    children: React.ReactNode;
}

const AccordionSection = ({
    value,
    title,
    icon,
    description,
    children,
}: AccordionSectionProps) => (
    <AccordionItem
        value={value}
        className="border-none group/item"
    >
        <div className="overflow-hidden bg-white/40 dark:bg-slate-950/20 backdrop-blur-xl border border-white dark:border-slate-800 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 hover:shadow-blue-500/5 mb-6">
            <AccordionTrigger className="px-8 py-6 hover:no-underline transition-all group-data-[state=open]/item:bg-slate-50/50 dark:group-data-[state=open]/item:bg-slate-800/20">
                <div className="flex items-center gap-6 text-left">
                    {icon && (
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center text-2xl group-data-[state=open]/item:rotate-6 transition-all border border-slate-50 dark:border-slate-800">
                            {icon}
                        </div>
                    )}
                    <div className="space-y-1">
                        <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight leading-none uppercase">{title}</h3>
                        {description && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-10 py-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </AccordionContent>
        </div>
    </AccordionItem>
);

export default AccordionSection;
