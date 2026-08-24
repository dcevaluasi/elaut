"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { IconType } from "react-icons";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Accent } from "./accents";

type FieldTextProps = {
    form: UseFormReturn<any>;
    name: string;
    label: string;
    placeholder?: string;
    icon: IconType;
    accent: Accent;
    /** Ditampilkan di bawah input sebagai penjelas, bukan pengganti label. */
    hint?: string;
    readOnly?: boolean;
    type?: "text" | "email" | "url";
    inputMode?: "text" | "numeric" | "email" | "url" | "tel";
    maxLength?: number;
};

export default function FieldText({
    form,
    name,
    label,
    placeholder,
    icon: Icon,
    accent,
    hint,
    readOnly = false,
    type = "text",
    inputMode,
    maxLength,
}: FieldTextProps) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="space-y-2">
                    <label
                        htmlFor={name}
                        className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1"
                    >
                        {label}
                    </label>

                    <div className="relative group">
                        <Icon
                            aria-hidden
                            size={20}
                            className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors ${readOnly ? "" : accent.ikonFokus
                                }`}
                        />
                        <FormControl>
                            <input
                                {...field}
                                id={name}
                                type={type}
                                inputMode={inputMode}
                                maxLength={maxLength}
                                readOnly={readOnly}
                                placeholder={placeholder}
                                value={field.value ?? ""}
                                className={`w-full h-14 pl-12 pr-4 rounded-2xl border-transparent font-bold text-slate-700 dark:text-white transition-all placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 ${accent.cincinFokus
                                    } ${readOnly
                                        ? "bg-slate-100 dark:bg-white/[0.03] text-slate-500 cursor-not-allowed"
                                        : "bg-gray-50 dark:bg-white/5"
                                    }`}
                            />
                        </FormControl>
                    </div>

                    {hint && (
                        <p className="pl-1 text-[11px] font-medium text-slate-400">{hint}</p>
                    )}
                    <FormMessage className="pl-1 text-[11px] font-semibold" />
                </FormItem>
            )}
        />
    );
}
