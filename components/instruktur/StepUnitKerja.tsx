"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
    TbBuildingBank,
    TbBuildingSkyscraper,
    TbSchool,
    TbUserCheck,
} from "react-icons/tb";
import FieldSelect from "./FieldSelect";
import StepShell from "./StepShell";
import { ACCENTS } from "./accents";
import { STEPS, InstrukturFormValues } from "./steps";
import { UK_ESELON_1, UK_ESELON_2 } from "@/constants/unitkerja";
import { DUMMY_LEMDIK, STATUS_KEAKTIFAN } from "@/constants/instruktur-dummy";

const step = STEPS[1];
const accent = ACCENTS[step.accent];

export default function StepUnitKerja({
    form,
}: {
    form: UseFormReturn<InstrukturFormValues>;
}) {
    const eselon1 = form.watch("eselon_1");
    const sebelumnya = React.useRef(eselon1);

    // Eselon II hanya sah di bawah eselon I-nya, jadi pilihan lama dibuang
    // saat eselon I berganti. Nilai awal dari basis data dibiarkan utuh.
    React.useEffect(() => {
        if (sebelumnya.current !== eselon1) {
            sebelumnya.current = eselon1;
            form.setValue("eselon_2", "", { shouldValidate: false });
        }
    }, [eselon1, form]);

    const opsiEselon2 = (eselon1 && UK_ESELON_2[eselon1]) || [];

    return (
        <StepShell judul={step.judul} deskripsi={step.deskripsi} accent={accent}>
            <div className="md:col-span-2">
                <FieldSelect
                    form={form}
                    name="eselon_1"
                    label="Unit kerja eselon I"
                    placeholder="Pilih unit kerja eselon I"
                    icon={TbBuildingBank}
                    accent={accent}
                    options={UK_ESELON_1.map((unit) => ({
                        value: unit.name,
                        label: unit.name,
                    }))}
                />
            </div>

            <div className="md:col-span-2">
                <FieldSelect
                    form={form}
                    name="eselon_2"
                    label="Unit kerja eselon II"
                    placeholder={
                        eselon1 ? "Pilih unit kerja eselon II" : "Pilih eselon I dahulu"
                    }
                    icon={TbBuildingSkyscraper}
                    accent={accent}
                    options={opsiEselon2.map((nama) => ({ value: nama, label: nama }))}
                    disabled={!eselon1}
                    emptyLabel="Belum ada eselon II terdaftar untuk unit kerja ini"
                />
            </div>

            <FieldSelect
                form={form}
                name="id_lemdik"
                label="Satuan pendidikan"
                placeholder="Pilih satuan pendidikan"
                icon={TbSchool}
                accent={accent}
                options={DUMMY_LEMDIK.map((lemdik) => ({
                    value: String(lemdik.id),
                    label: lemdik.nama,
                }))}
                hint="Tempat Anda ditugaskan mengajar."
            />

            <FieldSelect
                form={form}
                name="status"
                label="Status keaktifan"
                placeholder="Pilih status"
                icon={TbUserCheck}
                accent={accent}
                options={STATUS_KEAKTIFAN}
            />
        </StepShell>
    );
}
