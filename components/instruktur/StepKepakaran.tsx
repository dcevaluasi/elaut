"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
    TbBriefcase,
    TbChalkboard,
    TbCertificate,
    TbClipboardList,
    TbTag,
    TbTags,
} from "react-icons/tb";
import FieldSelect from "./FieldSelect";
import StepShell from "./StepShell";
import { ACCENTS } from "./accents";
import { STEPS, InstrukturFormValues } from "./steps";
import {
    BIDANG_KEAHLIAN,
    JENIS_LABEL_INSTRUKTUR,
    JENIS_PELATIH,
    JENIS_SISJAMU,
    JENJANG_JABATAN,
    LABEL_INSTRUKTUR,
} from "@/constants/instruktur";

const step = STEPS[2];
const accent = ACCENTS[step.accent];

export default function StepKepakaran({
    form,
}: {
    form: UseFormReturn<InstrukturFormValues>;
}) {
    return (
        <StepShell judul={step.judul} deskripsi={step.deskripsi} accent={accent}>
            <FieldSelect
                form={form}
                name="jenis_pelatih"
                label="Jenis pelatih"
                placeholder="Pilih jenis pelatih"
                icon={TbChalkboard}
                accent={accent}
                options={JENIS_PELATIH.map((jenis) => ({
                    value: jenis,
                    label: jenis,
                }))}
            />

            <FieldSelect
                form={form}
                name="jenjang_jabatan"
                label="Jenjang jabatan"
                placeholder="Pilih jenjang jabatan"
                icon={TbBriefcase}
                accent={accent}
                options={JENJANG_JABATAN.map((jenjang) => ({
                    value: jenjang,
                    label: jenjang,
                }))}
            />

            <div className="md:col-span-2">
                <FieldSelect
                    form={form}
                    name="bidang_keahlian"
                    label="Bidang keahlian"
                    placeholder="Pilih bidang keahlian"
                    icon={TbCertificate}
                    accent={accent}
                    options={BIDANG_KEAHLIAN.map((bidang) => ({
                        value: bidang,
                        label: bidang,
                    }))}
                    hint="Sistem memakai bidang ini untuk mencocokkan Anda dengan pelatihan yang dibuka."
                />
            </div>

            <FieldSelect
                form={form}
                name="label"
                label="Label"
                placeholder="Pilih label"
                icon={TbTag}
                accent={accent}
                options={LABEL_INSTRUKTUR.map((label) => ({
                    value: label,
                    label,
                }))}
            />

            <FieldSelect
                form={form}
                name="jenis_label"
                label="Jenis label"
                placeholder="Pilih jenis label"
                icon={TbTags}
                accent={accent}
                options={JENIS_LABEL_INSTRUKTUR.map((jenis) => ({
                    value: jenis,
                    label: jenis,
                }))}
                hint="Menandai apakah Anda bertugas di UPT atau di Pusat."
            />

            <div className="md:col-span-2">
                <FieldSelect
                    form={form}
                    name="jenis_sisjamu"
                    label="Program SISJAMU yang diampu"
                    placeholder="Pilih program SISJAMU"
                    icon={TbClipboardList}
                    accent={accent}
                    options={JENIS_SISJAMU.map((program) => ({
                        value: program,
                        label: program,
                    }))}
                    hint="Opsional. Kosongkan bila Anda tidak mengampu program sertifikasi SISJAMU."
                />
            </div>
        </StepShell>
    );
}
