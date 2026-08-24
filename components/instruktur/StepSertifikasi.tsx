"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { TbLink, TbInfoCircle } from "react-icons/tb";
import FieldText from "./FieldText";
import StepShell from "./StepShell";
import { ACCENTS } from "./accents";
import { STEPS, InstrukturFormValues } from "./steps";

const step = STEPS[3];
const accent = ACCENTS[step.accent];

const SERTIFIKAT: { name: keyof InstrukturFormValues; label: string }[] = [
    { name: "metodologi_pelatihan", label: "Metodologi pelatihan" },
    { name: "pelatihan_pelatih", label: "Training of Trainer (ToT)" },
    { name: "kompetensi_teknis", label: "Kompetensi teknis" },
    { name: "management_of_training", label: "Management of Training (MoT)" },
    { name: "training_officer_course", label: "Training Officer Course (ToC)" },
    { name: "link_data_dukung_sertifikat", label: "Data dukung lainnya" },
];

export default function StepSertifikasi({
    form,
}: {
    form: UseFormReturn<InstrukturFormValues>;
}) {
    return (
        <StepShell judul={step.judul} deskripsi={step.deskripsi} accent={accent}>
            <div className="md:col-span-2 flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-500/5 px-5 py-4">
                <TbInfoCircle
                    aria-hidden
                    size={20}
                    className="text-amber-500 shrink-0 mt-0.5"
                />
                <p className="text-xs font-semibold leading-relaxed text-amber-900 dark:text-amber-200">
                    Unggah berkas sertifikat ke Google Drive, atur aksesnya menjadi
                    &ldquo;siapa saja yang memiliki tautan&rdquo;, lalu tempelkan tautannya
                    di bawah. Kosongkan yang belum Anda miliki.
                </p>
            </div>

            {SERTIFIKAT.map((sertifikat) => (
                <FieldText
                    key={sertifikat.name}
                    form={form}
                    name={sertifikat.name}
                    label={sertifikat.label}
                    type="url"
                    inputMode="url"
                    placeholder="https://drive.google.com/..."
                    icon={TbLink}
                    accent={accent}
                />
            ))}
        </StepShell>
    );
}
