import firebaseApp from '../config'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const db = getFirestore(firebaseApp)
export default async function addData(
  collection: string,
  id: string,
  data: Record<string, any>,
): Promise<{ result: void | null; error: unknown }> {
  let result: void | null = null
  let error: unknown = null

  try {
    result = await setDoc(doc(db, collection, id), data, {
      merge: true,
    })
  } catch (e) {
    error = e
  }

  return { result, error }
}
