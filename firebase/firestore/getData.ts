import { doc, getDoc, getFirestore, DocumentData } from 'firebase/firestore'
import firebaseApp from '../config'

const db = getFirestore(firebaseApp)

export default async function getDocument(
  collection: string,
  id: string,
): Promise<{ data: DocumentData | null; error: unknown }> {
  let docRef = doc(db, collection, id)

  let data: DocumentData | null = null
  let error: unknown = null

  try {
    const result = await getDoc(docRef)
    if (result.exists()) {
      data = result.data()
    }
  } catch (e) {
    error = e
  }

  return { data, error }
}
