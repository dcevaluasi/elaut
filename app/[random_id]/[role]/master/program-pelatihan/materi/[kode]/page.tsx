"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { RiQuillPenAiLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
} from "firebase/firestore";
import firebaseApp from "@/firebase/config";
import addData from "@/firebase/firestore/addData";
import { HashLoader } from "react-spinners";
import { FiTrash2 } from "react-icons/fi";
import { TbEditCircle } from "react-icons/tb";

const db = getFirestore(firebaseApp);

function Page() {
    const { kode } = useParams();
    const docId = Array.isArray(kode) ? kode[0] : kode;
    const isAwakKapalPerikanan = docId.includes('Keahlian')
    const decodedDocId = decodeURIComponent(docId || "");
    const [showForm, setShowForm] = useState<{ [key: string]: boolean }>({});
    const toggleForm = (cat: string) => {
        setShowForm((prev) => ({ ...prev, [cat]: !prev[cat] }));
    };

    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(false); // indikator progress
    const [newMaterial, setNewMaterial] = useState({
        name_ind: "",
        name_eng: "",
        theory: 0,
        practice: 0,
    });
    const [newMaterialAKP, setNewMaterialAKP] = useState({
        group_ind: "",
        group_eng: "",
        name_ind: "",
        name_eng: "",
        theory: 0,
        practice: 0,
    });

    // Fetch all documents + cek apakah dokumen sesuai URL ada
    const fetchDocuments = async () => {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "documents"));
        const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setDocuments(data);

        // cek apakah dokumen sudah ada
        const docRef = doc(db, "documents", decodedDocId as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            setSelectedDoc({ id: docSnap.id, categories: data.categories || {} }); // ✅ always categories
        } else {
            await addData("documents", decodedDocId as string, { categories: {} });
            setSelectedDoc({ id: decodedDocId, categories: {} });
        }


        setLoading(false);
    };

    useEffect(() => {
        if (decodedDocId) fetchDocuments();
    }, [decodedDocId]);

    const [editIndex, setEditIndex] = useState<{ [key: string]: number | null }>({});
    const handleUpdateMaterial = async (cat: string, index: number, updatedMat: any) => {
        if (!selectedDoc) return;
        setLoading(true);

        const updatedCategories = { ...selectedDoc.categories };
        updatedCategories[cat][index] = updatedMat;

        await addData("documents", selectedDoc.id, { categories: updatedCategories });
        setEditIndex((prev) => ({ ...prev, [cat]: null })); // close edit mode
        await fetchDocuments();
    };

    // Add category
    const handleAddCategory = async () => {
        if (!selectedDoc || !categoryName) return;
        setLoading(true);
        const updatedCategories = {
            ...selectedDoc.categories,
            [categoryName]: [],
        };
        await addData("documents", selectedDoc.id, { categories: updatedCategories });
        setCategoryName("");
        await fetchDocuments();
    };

    // Delete category
    const handleDeleteCategory = async (cat: string) => {
        if (!selectedDoc) return;
        setLoading(true);
        const updatedCategories = { ...selectedDoc.categories };
        delete updatedCategories[cat];
        await addData("documents", selectedDoc.id, { categories: updatedCategories });
        await fetchDocuments();
    };

    // Add material
    const handleAddMaterial = async (cat: string) => {
        if (!selectedDoc) return;
        setLoading(true);
        const updatedCategories = { ...selectedDoc.categories };
        if (isAwakKapalPerikanan) {
            updatedCategories[cat] = [...(updatedCategories[cat] || []), newMaterialAKP];
        } else {
            updatedCategories[cat] = [...(updatedCategories[cat] || []), newMaterial];
        }

        await addData("documents", selectedDoc.id, { categories: updatedCategories });
        if (isAwakKapalPerikanan) {
            setNewMaterialAKP({ group_ind: "", group_eng: "", name_ind: "", name_eng: "", theory: 0, practice: 0 });
        } else {
            setNewMaterial({ name_ind: "", name_eng: "", theory: 0, practice: 0 });
        }
        await fetchDocuments();
    };

    // Delete material
    const handleDeleteMaterial = async (cat: string, index: number) => {
        if (!selectedDoc) return;
        setLoading(true);
        const updatedCategories = { ...selectedDoc.categories };
        updatedCategories[cat].splice(index, 1);
        await addData("documents", selectedDoc.id, { categories: updatedCategories });
        await fetchDocuments();
    };

    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut
                    title={`Materi: ${decodedDocId}`}
                    description="Kelola kategori & materi pelatihan berdasarkan dokumen"
                    icon={<RiQuillPenAiLine className="text-3xl" />}
                />
                <article className="w-full h-full mt-10">
                    {loading && (
                        <div className="py-32 w-full items-center flex justify-center">
                            <HashLoader color="#338CF5" size={50} />
                        </div>
                    )}

                    {!loading && selectedDoc && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Kelola Materi Program : {selectedDoc.id}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Add category */}
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Jenis Kategori Materi (contoh: UMUM atau INTI)"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                    />
                                    <Button onClick={handleAddCategory}>Tambah Kategori</Button>
                                </div>

                                {/* List categories */}
                                {Object.keys(selectedDoc.categories || {}).map((cat, index) => {
                                    return (
                                        <div key={cat} className="mb-6 border p-3 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold">{cat}</h3>
                                                <Button
                                                    variant="outline"
                                                    title="Hapus Pelatihan"
                                                    className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500"
                                                    onClick={() => handleDeleteCategory(cat)}
                                                >
                                                    Hapus Kategori
                                                </Button>
                                            </div>

                                            {/* Materials */}
                                            <ul className="space-y-2 mb-3">
                                                {selectedDoc.categories[cat]?.map(
                                                    (mat: any, index: number) => {
                                                        const isEditing = editIndex[cat] === index;

                                                        return (
                                                            <li
                                                                key={index}
                                                                className="p-2 border rounded flex flex-col gap-2"
                                                            >
                                                                {!isEditing ? (
                                                                    // ---- Normal View ----
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="max-w-4xl">
                                                                            <p className="font-medium">
                                                                                {mat?.group_ind ? `${mat.group_ind} - ` : ''}{mat.name_ind}
                                                                            </p>
                                                                            <p className="text-sm text-gray-500">{mat.name_eng}</p>
                                                                            <p className="text-xs">
                                                                                Theory: {mat.theory} | Practice: {mat.practice}
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500"
                                                                                onClick={() =>
                                                                                    setEditIndex((prev) => ({ ...prev, [cat]: index }))
                                                                                }
                                                                            >
                                                                                <TbEditCircle />
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500"
                                                                                onClick={() => handleDeleteMaterial(cat, index)}
                                                                            >
                                                                                <FiTrash2 />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    // ---- Edit Mode ----
                                                                    <div className="space-y-2">
                                                                        {isAwakKapalPerikanan && (
                                                                            <>
                                                                                <Input
                                                                                    placeholder="Kelompok Materi (Indo)"
                                                                                    value={mat.group_ind}
                                                                                    onChange={(e) => {
                                                                                        const newMat = { ...mat, group_ind: e.target.value };
                                                                                        const newCategories = { ...selectedDoc.categories };
                                                                                        newCategories[cat][index] = newMat;
                                                                                        setSelectedDoc({ ...selectedDoc, categories: newCategories });
                                                                                    }}
                                                                                />
                                                                                <Input
                                                                                    placeholder="Kelompok Materi (Eng)"
                                                                                    value={mat.group_eng}
                                                                                    onChange={(e) => {
                                                                                        const newMat = { ...mat, group_eng: e.target.value };
                                                                                        const newCategories = { ...selectedDoc.categories };
                                                                                        newCategories[cat][index] = newMat;
                                                                                        setSelectedDoc({ ...selectedDoc, categories: newCategories });
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Input
                                                                            placeholder="Nama Materi (Indo)"
                                                                            value={mat.name_ind}
                                                                            onChange={(e) => {
                                                                                const newMat = { ...mat, name_ind: e.target.value };
                                                                                const newCategories = { ...selectedDoc.categories };
                                                                                newCategories[cat][index] = newMat;
                                                                                setSelectedDoc({ ...selectedDoc, categories: newCategories });
                                                                            }}
                                                                        />
                                                                        <Input
                                                                            placeholder="Nama Materi (Eng)"
                                                                            value={mat.name_eng}
                                                                            onChange={(e) => {
                                                                                const newMat = { ...mat, name_eng: e.target.value };
                                                                                const newCategories = { ...selectedDoc.categories };
                                                                                newCategories[cat][index] = newMat;
                                                                                setSelectedDoc({ ...selectedDoc, categories: newCategories });
                                                                            }}
                                                                        />
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Theory"
                                                                            value={mat.theory}
                                                                            onChange={(e) => {
                                                                                const newMat = { ...mat, theory: Number(e.target.value) };
                                                                                const newCategories = { ...selectedDoc.categories };
                                                                                newCategories[cat][index] = newMat;
                                                                                setSelectedDoc({ ...selectedDoc, categories: newCategories });
                                                                            }}
                                                                        />
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Practice"
                                                                            value={mat.practice}
                                                                            onChange={(e) => {
                                                                                const newMat = { ...mat, practice: Number(e.target.value) };
                                                                                const newCategories = { ...selectedDoc.categories };
                                                                                newCategories[cat][index] = newMat;
                                                                                setSelectedDoc({ ...selectedDoc, categories: newCategories });
                                                                            }}
                                                                        />

                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                onClick={() => handleUpdateMaterial(cat, index, mat)}
                                                                            >
                                                                                Simpan
                                                                            </Button>
                                                                            <Button
                                                                                variant="secondary"
                                                                                onClick={() =>
                                                                                    setEditIndex((prev) => ({ ...prev, [cat]: null }))
                                                                                }
                                                                            >
                                                                                Batal
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </li>
                                                        )
                                                    }
                                                )}
                                            </ul>

                                            {/* Add Material */}
                                            <div className="mt-3">
                                                {!showForm[cat] ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleForm(cat)}
                                                    >
                                                        + Tambah Materi
                                                    </Button>
                                                ) : (

                                                    <div className="mt-2 space-y-2">
                                                        {
                                                            isAwakKapalPerikanan ? <>
                                                                <Input
                                                                    placeholder="Kelompok Materi (Indo)"
                                                                    value={newMaterialAKP.group_ind}
                                                                    onChange={(e) =>
                                                                        setNewMaterialAKP({
                                                                            ...newMaterialAKP,
                                                                            group_ind: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                                <Input
                                                                    placeholder="Kelompok Materi (Eng)"
                                                                    value={newMaterialAKP.group_eng}
                                                                    onChange={(e) =>
                                                                        setNewMaterialAKP({
                                                                            ...newMaterialAKP,
                                                                            group_eng: e.target.value,
                                                                        })
                                                                    }
                                                                />

                                                                <Input
                                                                    placeholder="Nama Materi (Indo)"
                                                                    value={newMaterialAKP.name_ind}
                                                                    onChange={(e) =>
                                                                        setNewMaterialAKP({
                                                                            ...newMaterialAKP,
                                                                            name_ind: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                                <Input
                                                                    placeholder="Nama Materi (Eng)"
                                                                    value={newMaterialAKP.name_eng}
                                                                    onChange={(e) =>
                                                                        setNewMaterialAKP({
                                                                            ...newMaterialAKP,
                                                                            name_eng: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Theory"
                                                                    value={newMaterialAKP.theory}
                                                                    onChange={(e) =>
                                                                        setNewMaterialAKP({
                                                                            ...newMaterialAKP,
                                                                            theory: Number(e.target.value),
                                                                        })
                                                                    }
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Practice"
                                                                    value={newMaterialAKP.practice}
                                                                    onChange={(e) =>
                                                                        setNewMaterialAKP({
                                                                            ...newMaterialAKP,
                                                                            practice: Number(e.target.value),
                                                                        })
                                                                    }
                                                                />

                                                            </> : <>
                                                                <Input
                                                                    placeholder="Nama Materi (Indo)"
                                                                    value={newMaterial.name_ind}
                                                                    onChange={(e) =>
                                                                        setNewMaterial({
                                                                            ...newMaterial,
                                                                            name_ind: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                                <Input
                                                                    placeholder="Nama Materi (Eng)"
                                                                    value={newMaterial.name_eng}
                                                                    onChange={(e) =>
                                                                        setNewMaterial({
                                                                            ...newMaterial,
                                                                            name_eng: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Theory"
                                                                    value={newMaterial.theory}
                                                                    onChange={(e) =>
                                                                        setNewMaterial({
                                                                            ...newMaterial,
                                                                            theory: Number(e.target.value),
                                                                        })
                                                                    }
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Practice"
                                                                    value={newMaterial.practice}
                                                                    onChange={(e) =>
                                                                        setNewMaterial({
                                                                            ...newMaterial,
                                                                            practice: Number(e.target.value),
                                                                        })
                                                                    }
                                                                />

                                                            </>
                                                        }

                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => handleAddMaterial(cat)}
                                                            >
                                                                Simpan
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                onClick={() => toggleForm(cat)}
                                                            >
                                                                Batal
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>


                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    )}
                </article>
            </section>
        </LayoutAdminElaut>
    );
}

export default Page;
