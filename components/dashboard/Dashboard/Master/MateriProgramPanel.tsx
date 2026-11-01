"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";
import { X, Plus, Pencil, Trash2, Check, Loader2, BookOpen, Layers, Clock, AlertTriangle, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
import firebaseApp from "@/firebase/config";
import addData from "@/firebase/firestore/addData";
import Toast from "@/commons/Toast";

/* ============================ TYPES ============================ */

export type Material = {
    group_ind?: string;
    group_eng?: string;
    name_ind: string;
    name_eng: string;
    theory: number;
    practice: number;
};

export type Categories = Record<string, Material[]>;

export type MateriSummary = {
    kategori: number;
    materi: number;
    theory: number;
    practice: number;
};

const COLLECTION = "documents";
const db = getFirestore(firebaseApp);

export const isAKPProgram = (name = "") => name.includes("Keahlian") || name.includes("Ahli");

export const summarize = (categories: Categories = {}): MateriSummary => {
    let materi = 0, theory = 0, practice = 0;
    const keys = Object.keys(categories);
    for (const k of keys) {
        for (const m of categories[k] || []) {
            materi++;
            theory += Number(m.theory) || 0;
            practice += Number(m.practice) || 0;
        }
    }
    return { kategori: keys.length, materi, theory, practice };
};

/* ============================ INDEX HOOK ============================ */

/**
 * Ambil SEMUA dokumen materi sekali → ringkasan per program (key = nama program).
 * Dipakai untuk badge status "ada materi / belum" di daftar program.
 */
export function useMateriIndex() {
    const [index, setIndex] = useState<Map<string, MateriSummary>>(new Map());
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, COLLECTION));
            const map = new Map<string, MateriSummary>();
            snap.forEach((d) => map.set(d.id, summarize((d.data()?.categories as Categories) || {})));
            setIndex(map);
        } catch (e) {
            console.error("Gagal memuat indeks materi:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    /** Update satu entri tanpa fetch ulang seluruh koleksi */
    const setEntry = useCallback((id: string, categories: Categories) => {
        setIndex((prev) => new Map(prev).set(id, summarize(categories)));
    }, []);

    return { index, loading, reload, setEntry };
}

/* ============================ PANEL (DRAWER) ============================ */

type PanelProps = {
    programName: string | null;
    subtitle?: string;
    onClose: () => void;
    onSaved?: (programName: string, categories: Categories) => void;
    /** true = tampil sebagai halaman (tanpa overlay) */
    standalone?: boolean;
};

export default function MateriProgramPanel({ programName, subtitle, onClose, onSaved, standalone }: PanelProps) {
    const open = !!programName;
    const isAKP = isAKPProgram(programName || "");

    const [categories, setCategories] = useState<Categories>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [adding, setAdding] = useState<string | null>(null); // kategori yang sedang tambah materi
    const [editing, setEditing] = useState<{ cat: string; index: number } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [confirmMat, setConfirmMat] = useState<{ cat: string; index: number } | null>(null);
    const [renaming, setRenaming] = useState<{ from: string; value: string } | null>(null);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const isBusyForm = !!adding || !!editing || !!renaming;

    /** Tutup dengan konfirmasi bila ada isian yang belum disimpan */
    const requestClose = useCallback(() => {
        if (isBusyForm && !window.confirm("Ada isian yang belum disimpan. Tutup panel?")) return;
        onClose();
    }, [isBusyForm, onClose]);

    /* ---------- Load dokumen (tanpa auto-membuat dokumen kosong) ---------- */
    useEffect(() => {
        if (!programName) return;
        let cancelled = false;
        setLoading(true);
        setAdding(null);
        setEditing(null);
        setConfirmDelete(null);
        setCollapsed(new Set());
        setRenaming(null);
        setConfirmMat(null);

        // async/await — callback .catch/.then tidak boleh mengembalikan boolean (error TS sebelumnya)
        (async () => {
            try {
                const snap = await getDoc(doc(db, COLLECTION, programName));
                if (cancelled) return;
                setCategories(snap.exists() ? ((snap.data()?.categories as Categories) || {}) : {});
            } catch {
                if (!cancelled) Toast.fire({ icon: "error", title: "Gagal memuat materi" });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [programName]);

    // Esc untuk menutup
    useEffect(() => {
        if (!open || standalone) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            // Esc pertama membatalkan form yang sedang dibuka, Esc berikutnya menutup panel
            if (adding || editing || renaming || confirmDelete || confirmMat) {
                setAdding(null);
                setEditing(null);
                setRenaming(null);
                setConfirmDelete(null);
                setConfirmMat(null);
                return;
            }
            onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, standalone, onClose, adding, editing, renaming, confirmDelete, confirmMat]);

    /* ---------- Simpan (optimistic, immutable) ---------- */
    const persist = async (next: Categories, successMsg: string) => {
        if (!programName) return;
        const prev = categories;
        setCategories(next);
        setSaving(true);
        try {
            const res: any = await addData(COLLECTION, programName, { categories: next });
            if (res?.error) throw res.error;
            onSaved?.(programName, next);
            Toast.fire({ icon: "success", title: successMsg });
        } catch (e) {
            console.error(e);
            setCategories(prev); // rollback
            Toast.fire({ icon: "error", title: "Gagal menyimpan perubahan" });
        } finally {
            setSaving(false);
        }
    };

    const addCategory = () => {
        const name = newCategory.trim().toUpperCase();
        if (!name) return;
        if (categories[name]) {
            Toast.fire({ icon: "warning", title: `Kategori "${name}" sudah ada` });
            return;
        }
        setNewCategory("");
        persist({ ...categories, [name]: [] }, `Kategori ${name} ditambahkan`);
    };

    const deleteCategory = (cat: string) => {
        const { [cat]: _removed, ...rest } = categories;
        setConfirmDelete(null);
        persist(rest, `Kategori ${cat} dihapus`);
    };

    const addMaterial = (cat: string, mat: Material) => {
        setAdding(null);
        persist({ ...categories, [cat]: [...(categories[cat] || []), mat] }, "Materi ditambahkan");
    };

    const updateMaterial = (cat: string, index: number, mat: Material) => {
        setEditing(null);
        persist({ ...categories, [cat]: categories[cat].map((m, i) => (i === index ? mat : m)) }, "Materi diperbarui");
    };

    const deleteMaterial = (cat: string, index: number) => {
        setConfirmMat(null);
        persist({ ...categories, [cat]: categories[cat].filter((_, i) => i !== index) }, "Materi dihapus");
    };

    const moveMaterial = (cat: string, index: number, dir: -1 | 1) => {
        const list = [...(categories[cat] || [])];
        const j = index + dir;
        if (j < 0 || j >= list.length) return;
        [list[index], list[j]] = [list[j], list[index]];
        persist({ ...categories, [cat]: list }, "Urutan materi diperbarui");
    };

    const renameCategory = () => {
        if (!renaming) return;
        const to = renaming.value.trim().toUpperCase();
        const from = renaming.from;
        setRenaming(null);
        if (!to || to === from) return;
        if (categories[to]) {
            Toast.fire({ icon: "warning", title: `Kategori "${to}" sudah ada` });
            return;
        }
        // pertahankan urutan kategori
        const next: Categories = {};
        Object.keys(categories).forEach((k) => (next[k === from ? to : k] = categories[k]));
        persist(next, `Kategori diganti menjadi ${to}`);
    };

    const toggleCollapse = (cat: string) =>
        setCollapsed((prev) => {
            const n = new Set(prev);
            n.has(cat) ? n.delete(cat) : n.add(cat);
            return n;
        });

    const total = useMemo(() => summarize(categories), [categories]);
    const catNames = Object.keys(categories);

    if (!open) return null;

    /* ============================ RENDER ============================ */

    const body = (
        <div className={`flex h-full flex-col bg-slate-50 dark:bg-slate-950 ${standalone ? "rounded-[2rem] ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden" : ""}`}>
            {/* Header bergaya hero */}
            <div className="relative isolate overflow-hidden bg-[#0B1B3F] text-white px-5 md:px-6 py-5 shrink-0">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-90" />
                <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:20px_20px]" />

                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" /> Materi Program {isAKP && "· Format AKP"}
                        </p>
                        <h2 className="mt-1 text-lg md:text-xl font-black tracking-tight leading-snug">{programName}</h2>
                        {subtitle && <p className="text-xs text-blue-100/60 font-medium mt-0.5">{subtitle}</p>}
                    </div>
                    {!standalone && (
                        <button onClick={requestClose} className="shrink-0 rounded-xl p-2 text-blue-100/70 hover:bg-white/10 hover:text-white" aria-label="Tutup">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                        { label: "Kategori", value: total.kategori, icon: <Layers className="w-3.5 h-3.5" /> },
                        { label: "Materi", value: total.materi, icon: <BookOpen className="w-3.5 h-3.5" /> },
                        { label: "Total JP", value: total.theory + total.practice, icon: <Clock className="w-3.5 h-3.5" />, sub: `T ${total.theory} · P ${total.practice}` },
                    ].map((k) => (
                        <div key={k.label} className="rounded-2xl bg-white/10 ring-1 ring-white/15 px-3 py-2 backdrop-blur-md">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-100/70 flex items-center gap-1">{k.icon}{k.label}</p>
                            <p className="text-xl font-black tabular-nums leading-tight">{k.value}</p>
                            {k.sub && <p className="text-[10px] text-blue-100/50 font-semibold">{k.sub}</p>}
                        </div>
                    ))}
                </div>
                {saving && (
                    <p className="absolute right-5 bottom-2 text-[10px] font-bold text-sky-200 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Menyimpan…
                    </p>
                )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
                {/* Tambah kategori */}
                <div className="flex gap-2">
                    <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") addCategory();
                        }}
                        placeholder="Kategori baru, contoh: UMUM, INTI, PENUNJANG"
                        className="flex-1 h-11 px-4 rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:font-normal placeholder:text-slate-400"
                    />
                    <button
                        type="button"
                        onClick={addCategory}
                        disabled={!newCategory.trim() || saving}
                        className="h-11 px-4 rounded-2xl bg-[#0B1B3F] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 disabled:opacity-40 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Kategori
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>
                ) : catNames.length === 0 ? (
                    <div className="py-12 flex flex-col items-center text-center gap-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">Program ini belum memiliki materi</p>
                        <p className="text-xs text-slate-400 max-w-xs">Mulai dengan menambahkan kategori (misalnya UMUM dan INTI), lalu isi materinya.</p>
                    </div>
                ) : (
                    catNames.map((cat) => {
                        const list = categories[cat] || [];
                        const s = summarize({ [cat]: list });
                        const isCollapsed = collapsed.has(cat);
                        return (
                            <section key={cat} className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 overflow-hidden">
                                <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleCollapse(cat)}
                                            title={isCollapsed ? "Tampilkan materi" : "Sembunyikan materi"}
                                            className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0 hover:bg-blue-100"
                                        >
                                            <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                                        </button>
                                        <div className="min-w-0 flex-1">
                                            {renaming?.from === cat ? (
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        autoFocus
                                                        value={renaming.value}
                                                        onChange={(e) => setRenaming({ from: cat, value: e.target.value })}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") renameCategory();
                                                        }}
                                                        className="h-8 flex-1 min-w-0 px-2.5 rounded-lg ring-1 ring-blue-300 text-sm font-black uppercase outline-none focus:ring-2 focus:ring-blue-500/40"
                                                    />
                                                    <button type="button" onClick={renameCategory} className="h-8 w-8 rounded-lg bg-[#0B1B3F] text-white flex items-center justify-center" title="Simpan nama">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button type="button" onClick={() => setRenaming(null)} className="h-8 w-8 rounded-lg ring-1 ring-slate-200 text-slate-500 flex items-center justify-center" title="Batal">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setRenaming({ from: cat, value: cat })}
                                                    title="Klik untuk mengganti nama kategori"
                                                    className="group/name flex items-center gap-1.5 max-w-full text-left"
                                                >
                                                    <h3 className="text-sm font-black text-slate-800 dark:text-white truncate">{cat}</h3>
                                                    <Pencil className="w-3 h-3 text-slate-300 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
                                                </button>
                                            )}
                                            <p className="text-[10px] font-semibold text-slate-400">
                                                {s.materi} materi · {s.theory + s.practice} JP (T {s.theory} / P {s.practice})
                                            </p>
                                        </div>
                                    </div>
                                    {confirmDelete === cat ? (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-[11px] font-bold text-rose-600 hidden sm:inline">Hapus kategori & {list.length} materi?</span>
                                            <button onClick={() => deleteCategory(cat)} className="h-8 px-3 rounded-lg bg-rose-600 text-white text-[11px] font-bold">Hapus</button>
                                            <button onClick={() => setConfirmDelete(null)} className="h-8 px-3 rounded-lg ring-1 ring-slate-200 text-[11px] font-bold text-slate-600">Batal</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDelete(cat)}
                                            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center shrink-0"
                                            title="Hapus kategori"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </header>

                                {!isCollapsed && (
                                    <>
                                        {list.length === 0 && adding !== cat && (
                                            <p className="px-4 py-5 text-center text-xs text-slate-400">Belum ada materi di kategori ini.</p>
                                        )}
                                        <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {list.map((mat, i) =>
                                                editing?.cat === cat && editing.index === i ? (
                                                    <li key={i} className="p-3 bg-blue-50/40 dark:bg-blue-950/20">
                                                        <MaterialForm
                                                            isAKP={isAKP}
                                                            initial={mat}
                                                            submitLabel="Simpan"
                                                            onSubmit={(m) => updateMaterial(cat, i, m)}
                                                            onCancel={() => setEditing(null)}
                                                        />
                                                    </li>
                                                ) : (
                                                    <li key={i} className="group flex items-start gap-3 px-4 py-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                                        <span className="mt-0.5 w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 flex items-center justify-center shrink-0 tabular-nums">
                                                            {i + 1}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            {mat.group_ind && (
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{mat.group_ind}</p>
                                                            )}
                                                            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug">{mat.name_ind}</p>
                                                            {mat.name_eng && <p className="text-xs italic text-slate-400">{mat.name_eng}</p>}
                                                        </div>
                                                        {confirmMat?.cat === cat && confirmMat.index === i ? (
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <span className="text-[11px] font-bold text-rose-600 hidden sm:inline">Hapus materi ini?</span>
                                                                <button onClick={() => deleteMaterial(cat, i)} className="h-7 px-2.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold">Hapus</button>
                                                                <button onClick={() => setConfirmMat(null)} className="h-7 px-2.5 rounded-lg ring-1 ring-slate-200 text-[11px] font-bold text-slate-600">Batal</button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md px-1.5 py-0.5 tabular-nums">T {mat.theory}</span>
                                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md px-1.5 py-0.5 tabular-nums">P {mat.practice}</span>
                                                                {/* Aksi muncul saat hover (selalu tampil di layar sentuh) */}
                                                                <div className="flex items-center gap-0.5 ml-1 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity">
                                                                    <button onClick={() => moveMaterial(cat, i, -1)} disabled={i === 0 || saving} className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center disabled:opacity-30" title="Naikkan">
                                                                        <ArrowUp className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button onClick={() => moveMaterial(cat, i, 1)} disabled={i === list.length - 1 || saving} className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center disabled:opacity-30" title="Turunkan">
                                                                        <ArrowDown className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button onClick={() => { setAdding(null); setEditing({ cat, index: i }); }} className="h-7 w-7 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center" title="Edit">
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button onClick={() => setConfirmMat({ cat, index: i })} className="h-7 w-7 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center" title="Hapus">
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </li>
                                                )
                                            )}
                                        </ol>

                                        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                                            {adding === cat ? (
                                                <MaterialForm
                                                    isAKP={isAKP}
                                                    submitLabel="Tambah"
                                                    onSubmit={(m) => addMaterial(cat, m)}
                                                    onCancel={() => setAdding(null)}
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditing(null);
                                                        setAdding(cat);
                                                    }}
                                                    className="w-full h-9 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 flex items-center justify-center gap-1.5 transition-colors"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Tambah materi ke {cat}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </section>
                        );
                    })
                )}
            </div>
        </div>
    );

    if (standalone) return body;

    return (
        <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in-0" onClick={requestClose} />
            <div className="absolute inset-y-0 right-0 w-full max-w-2xl shadow-2xl animate-in slide-in-from-right duration-300">{body}</div>
        </div>
    );
}

/* ============================ FORM MATERI ============================ */

const EMPTY: Material = { group_ind: "", group_eng: "", name_ind: "", name_eng: "", theory: 0, practice: 0 };

function MaterialForm({
    isAKP,
    initial,
    submitLabel,
    onSubmit,
    onCancel,
}: {
    isAKP: boolean;
    initial?: Material;
    submitLabel: string;
    onSubmit: (m: Material) => void;
    onCancel: () => void;
}) {
    const [m, setM] = useState<Material>({ ...EMPTY, ...initial });
    const set = (k: keyof Material, v: string | number) => setM((p) => ({ ...p, [k]: v }));
    const valid = m.name_ind.trim() !== "" && m.theory >= 0 && m.practice >= 0;

    const submit = () => {
        if (!valid) return;
        const clean: Material = {
            name_ind: m.name_ind.trim(),
            name_eng: m.name_eng.trim(),
            theory: Number(m.theory) || 0,
            practice: Number(m.practice) || 0,
            ...(isAKP ? { group_ind: (m.group_ind || "").trim(), group_eng: (m.group_eng || "").trim() } : {}),
        };
        onSubmit(clean);
    };

    const input =
        "w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400";

    return (
        <div
            className="space-y-2"
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    submit();
                }
            }}
        >
            {isAKP && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input className={input} placeholder="Kelompok materi (Indonesia)" value={m.group_ind} onChange={(e) => set("group_ind", e.target.value)} />
                    <input className={input} placeholder="Kelompok materi (English)" value={m.group_eng} onChange={(e) => set("group_eng", e.target.value)} />
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input autoFocus className={input} placeholder="Nama materi (Indonesia) *" value={m.name_ind} onChange={(e) => set("name_ind", e.target.value)} />
                <input className={input} placeholder="Nama materi (English)" value={m.name_eng} onChange={(e) => set("name_eng", e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    Teori
                    <input type="number" min={0} className={`${input} w-20`} value={m.theory} onChange={(e) => set("theory", Math.max(0, Number(e.target.value)))} />
                </label>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    Praktik
                    <input type="number" min={0} className={`${input} w-20`} value={m.practice} onChange={(e) => set("practice", Math.max(0, Number(e.target.value)))} />
                </label>
                <span className="text-[11px] font-bold text-slate-400 tabular-nums">= {(Number(m.theory) || 0) + (Number(m.practice) || 0)} JP</span>
                <span className="hidden sm:inline text-[10px] text-slate-400">Enter untuk simpan · Esc untuk batal</span>
                <div className="ml-auto flex gap-1.5">
                    <button type="button" onClick={onCancel} className="h-9 px-3 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={!valid}
                        className="h-9 px-4 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 disabled:opacity-40"
                    >
                        <Check className="w-3.5 h-3.5" /> {submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
