"use client";

import React, { useEffect } from "react";
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
    JENIS_SISJAMU,
    LABEL_INSTRUKTUR,
    aturanKepakaran,
} from "@/constants/instruktur";

const step = STEPS[2];
const accent = ACCENTS[step.accent];

const keOpsi = (daftar: string[]) => daftar.map((nilai) => ({ value: nilai, label: nilai }));

export default function StepKepakaran({
    form,
}: {
    form: UseFormReturn<InstrukturFormValues>;
}) {
    const label = form.watch("label");
    const aturan = aturanKepakaran(label);
    const punyaJf = aturan.jenisPelatih !== "";

    // Label memimpin: jenis pelatih mengikuti label, dan jenjang/jenis label
    // yang tidak cocok dengan label dikosongkan agar dipilih ulang. Jabatan
    // asal Pelatih non Instruktur (mis. guru) tidak disentuh.
    useEffect(() => {
        const { jenisPelatih, jenjang, jenisLabel } = aturanKepakaran(label);
        const opsi = { shouldDirty: true };
        if (form.getValues("jenis_pelatih") !== jenisPelatih) form.setValue("jenis_pelatih", jenisPelatih, opsi);
        if (jenisPelatih && !jenjang.includes(form.getValues("jenjang_jabatan"))) form.setValue("jenjang_jabatan", "", opsi);
        if (!jenisLabel.includes(form.getValues("jenis_label"))) form.setValue("jenis_label", "", opsi);
    }, [label, form]);

    return (
        <StepShell judul={step.judul} deskripsi={step.deskripsi} accent={accent}>
            <FieldSelect
                form={form}
                name="label"
                label="Label"
                placeholder="Pilih label"
                icon={TbTag}
                accent={accent}
                options={keOpsi(LABEL_INSTRUKTUR)}
                hint="Pilih ini dulu. Jenis pelatih, jenjang, dan jenis label menyesuaikan."
            />

            <FieldSelect
                form={form}
                name="jenis_pelatih"
                label="Jenis pelatih"
                placeholder={label ? "Tidak berlaku untuk label ini" : "Mengikuti label"}
                icon={TbChalkboard}
                accent={accent}
                options={keOpsi(punyaJf ? [aturan.jenisPelatih] : [])}
                disabled
            />

            {punyaJf && (
                <>
                    <FieldSelect
                        form={form}
                        name="jenjang_jabatan"
                        label="Jenjang jabatan"
                        placeholder="Pilih jenjang jabatan"
                        icon={TbBriefcase}
                        accent={accent}
                        options={keOpsi(aturan.jenjang)}
                    />

                    <FieldSelect
                        form={form}
                        name="jenis_label"
                        label="Jenis label"
                        placeholder="Pilih jenis label"
                        icon={TbTags}
                        accent={accent}
                        options={keOpsi(aturan.jenisLabel)}
                        hint="Menandai apakah Anda bertugas di UPT atau di Pusat."
                    />
                </>
            )}

            <div className="md:col-span-2">
                <FieldSelect
                    form={form}
                    name="bidang_keahlian"
                    label="Bidang keahlian"
                    placeholder="Pilih bidang keahlian"
                    icon={TbCertificate}
                    accent={accent}
                    options={keOpsi(BIDANG_KEAHLIAN)}
                    hint="Sistem memakai bidang ini untuk mencocokkan Anda dengan pelatihan yang dibuka."
                />
            </div>

            <div className="md:col-span-2">
                <FieldSelect
                    form={form}
                    name="jenis_sisjamu"
                    label="Program SISJAMU yang diampu"
                    placeholder="Pilih program SISJAMU"
                    icon={TbClipboardList}
                    accent={accent}
                    options={keOpsi(JENIS_SISJAMU)}
                    hint="Opsional. Kosongkan bila Anda tidak mengampu program sertifikasi SISJAMU."
                />
            </div>
        </StepShell>
    );
}
