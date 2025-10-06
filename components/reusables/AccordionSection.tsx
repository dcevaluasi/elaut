"use client";

import React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

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
        className="border border-gray-200  rounded-xl mt-5 overflow-hidden shadow-sm bg-white"
    >
        <AccordionTrigger className="px-4 py-3 font-semibold flex  text-gray-800 hover:bg-gray-50 transition">
            <div className="flex flex-col">
                {title}
                <span className="font-medium mt-2">
                    {description}
                </span>
            </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 py-4 bg-gray-50">
            {children}
        </AccordionContent>
    </AccordionItem>
);

export default AccordionSection;
