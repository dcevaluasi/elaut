"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { TbUser, TbId, TbMail, TbPhone, TbSchool } from "react-icons/tb";
import FieldText from "./FieldText";
import FieldSelect from "./FieldSelect";
import StepShell from "./StepShell";
import { ACCENTS } from "./accents";
import { STEPS, InstrukturFormValues } from "./steps";
import { PENDIDIKAN_TERAKHIR } from "@/constants/instruktur-dummy";

const step = STEPS[0];
const accent = ACCENTS[step.accent];

export default function StepDataDiri({
    form,
}: {
    form: UseFormReturn<InstrukturFormValues>;
}) {
    return (
        <StepShell judul={step.judul} deskripsi={step.deskripsi} accent={accent}>
            <FieldText
                form={form}
                name="nama"
                label="Nama lengkap"
                placeholder="Termasuk gelar, contoh: Siti Rahmawati, S.Pi., M.Si."
                icon={TbUser}
                accent={accent}
            />

            <FieldText
                form={form}
                name="nip"
                label="NIP"
                icon={TbId}
                accent={accent}
                readOnly
                hint="Terkunci dari NIP yang Anda gunakan untuk masuk."
            />

            <FieldText
                form={form}
                name="email"
                label="Email"
                type="email"
                inputMode="email"
                placeholder="nama@kkp.go.id"
                icon={TbMail}
                accent={accent}
            />

            <FieldText
                form={form}
                name="no_telpon"
                label="Nomor WhatsApp"
                inputMode="tel"
                maxLength={15}
                placeholder="08xxxxxxxxxx"
                icon={TbPhone}
                accent={accent}
                hint="Dipakai panitia untuk konfirmasi jadwal mengajar."
            />

            <div className="md:col-span-2">
                <FieldSelect
                    form={form}
                    name="pendidikkan_terakhir"
                    label="Pendidikan terakhir"
                    placeholder="Pilih jenjang pendidikan"
                    icon={TbSchool}
                    accent={accent}
                    options={PENDIDIKAN_TERAKHIR.map((level) => ({
                        value: level,
                        label: level,
                    }))}
                />
            </div>
        </StepShell>
    );
}
