import {
  collection,
  addDoc,
  getFirestore,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore'
import firebaseApp from '@/firebase/config'

const db = getFirestore(firebaseApp)

// Collection Name: video-pelatihans
export const saveVideoPelatihan = async (data: any) => {
  return await addDoc(collection(db, 'video-pelatihans'), {
    ...data,
    videoClicked: 0,
    responses: [],
    createdAt: new Date(),
  })
}

export const getAllVideoPelatihans = async () => {
  const collectionRef = collection(db, 'video-pelatihans')
  const querySnapshot = await getDocs(collectionRef)

  const docs = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  // Urutkan secara lokal untuk menghindari error Missing Index dari Firebase
  docs.sort((a: any, b: any) => {
    // Ambil timestamp dengan fallback 0 jika data createdAt lama tidak ada
    const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt?.toMillis?.() || 0);
    const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt?.toMillis?.() || 0);
    return timeB - timeA;
  });

  return docs;
}

export const updateVideoPelatihan = async (id: string, data: any) => {
  const docRef = doc(db, 'video-pelatihans', id)
  return await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  })
}

export const deleteVideoPelatihan = async (id: string) => {
  const docRef = doc(db, 'video-pelatihans', id)
  await deleteDoc(docRef)
}

export const incrementVideoClick = async (id: string) => {
  const docRef = doc(db, 'video-pelatihans', id)
  return await updateDoc(docRef, {
    videoClicked: increment(1)
  })
}
