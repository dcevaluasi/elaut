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

const db = getFirestore(firebaseApp);

function Page() {
    const { kode } = useParams();
    const docId = Array.isArray(kode) ? kode[0] : kode;
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
        updatedCategories[cat] = [...(updatedCategories[cat] || []), newMaterial];
        await addData("documents", selectedDoc.id, { categories: updatedCategories });
        setNewMaterial({ name_ind: "", name_eng: "", theory: 0, practice: 0 });
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
                <article className="w-full h-full">
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
                                {Object.keys(selectedDoc.categories || {}).map((cat) => (
                                    <div key={cat} className="mb-6 border p-3 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold">{cat}</h3>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteCategory(cat)}
                                            >
                                                Hapus
                                            </Button>
                                        </div>

                                        {/* Materials */}
                                        <ul className="space-y-2 mb-3">
                                            {selectedDoc.categories[cat]?.map(
                                                (mat: any, index: number) => (
                                                    <li
                                                        key={index}
                                                        className="p-2 border rounded flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <p className="font-medium">{mat.name_ind}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {mat.name_eng}
                                                            </p>
                                                            <p className="text-xs">
                                                                Theory: {mat.theory} | Practice: {mat.practice}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteMaterial(cat, index)}
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </li>
                                                )
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
                                                    <Input
                                                        placeholder="Nama (Indo)"
                                                        value={newMaterial.name_ind}
                                                        onChange={(e) =>
                                                            setNewMaterial({
                                                                ...newMaterial,
                                                                name_ind: e.target.value,
                                                            })
                                                        }
                                                    />
                                                    <Input
                                                        placeholder="Nama (Eng)"
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
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </article>
            </section>
        </LayoutAdminElaut>
    );
}

export default Page;
