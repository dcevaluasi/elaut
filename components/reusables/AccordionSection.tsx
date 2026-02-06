"use client";

import React from "react";
import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const AccordionSection = ({
    title,
    description,
    children,
}: {
    title: string;
    description?: any;
    children: React.ReactNode;
}) => (
    <AccordionItem
        value={title}
        className="border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm bg-white transition-all hover:shadow-md mb-4"
    >
        <AccordionTrigger className="px-6 py-5 font-bold flex text-slate-800 hover:bg-slate-50/50 transition-all group decoration-transparent">
            <div className="flex flex-col items-start gap-1">
                <span className="text-base tracking-tight group-hover:text-blue-600 transition-colors uppercase font-bold text-sm">{title}</span>
                {description && (
                    <div className="text-xs font-normal text-slate-500 mt-1 max-w-3xl text-left leading-relaxed">
                        {description}
                    </div>
                )}
            </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 bg-white/50 border-t border-slate-50">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.div>
        </AccordionContent>
    </AccordionItem>
);

export default AccordionSection;

