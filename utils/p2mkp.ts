import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getFirestore,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage'
import firebaseApp from '@/firebase/config'

const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

export const saveReport = async (data: any) => {
  return await addDoc(collection(db, 'reports'), {
    ...data,
    createdAt: new Date(),
  })
}

export const uploadImage = async (file: File, path: string) => {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return await getDownloadURL(storageRef)
}
