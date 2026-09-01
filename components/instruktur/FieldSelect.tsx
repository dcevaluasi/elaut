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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Accent } from "./accents";

export type SelectOption = { value: string; label: string };

type FieldSelectProps = {
    form: UseFormReturn<any>;
    name: string;
    label: string;
    placeholder: string;
    icon: IconType;
    accent: Accent;
    options: SelectOption[];
    hint?: string;
    disabled?: boolean;
    /** Ditampilkan menggantikan daftar saat `options` kosong. */
    emptyLabel?: string;
};

export default function FieldSelect({
    form,
    name,
    label,
    placeholder,
    icon: Icon,
    accent,
    options,
    hint,
    disabled = false,
    emptyLabel = "Tidak ada pilihan",
}: FieldSelectProps) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        {label}
                    </label>

                    <Select
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={field.onChange}
                        disabled={disabled}
                    >
                        <FormControl>
                            <SelectTrigger
                                className={`w-full h-14 rounded-2xl border-transparent px-4 font-bold text-slate-700 dark:text-white text-left transition-all focus:outline-none focus:ring-4 ${accent.cincinFokus
                                    } ${disabled
                                        ? "bg-slate-100 dark:bg-white/[0.03] text-slate-400 cursor-not-allowed"
                                        : "bg-gray-50 dark:bg-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Icon
                                        aria-hidden
                                        size={20}
                                        className="text-slate-400 shrink-0"
                                    />
                                    <SelectValue placeholder={placeholder} />
                                </div>
                            </SelectTrigger>
                        </FormControl>

                        <SelectContent className="max-h-80 rounded-2xl z-[9999999]">
                            {options.length === 0 ? (
                                <div className="px-3 py-6 text-center text-xs font-semibold text-slate-400">
                                    {emptyLabel}
                                </div>
                            ) : (
                                options.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="font-semibold text-xs py-3 rounded-xl"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>

                    {hint && (
                        <p className="pl-1 text-[11px] font-medium text-slate-400">{hint}</p>
                    )}
                    <FormMessage className="pl-1 text-[11px] font-semibold" />
                </FormItem>
            )}
        />
    );
}
