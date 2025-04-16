import {
  collection,
  getDocs,
  getFirestore,
  DocumentData,
} from 'firebase/firestore'
import firebaseApp from '../config'

const db = getFirestore(firebaseApp)

export default async function getAllDocuments(
  collectionName: string,
): Promise<{ data: DocumentData[]; error: unknown }> {
  const colRef = collection(db, collectionName)

  let data: DocumentData[] = []
  let error: unknown = null

  try {
    const querySnapshot = await getDocs(colRef)
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() }) // include document ID
    })
  } catch (e) {
    error = e
  }

  return { data, error }
}
