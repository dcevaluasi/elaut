import { collection, addDoc, getFirestore, getDocs, query, orderBy } from 'firebase/firestore'
import firebaseApp from '@/firebase/config'

const db = getFirestore(firebaseApp)

export const saveFeedback = async (data: any) => {
  return await addDoc(collection(db, 'feedbacks'), {
    ...data,
    createdAt: new Date(),
  })
}

export const getAllFeedbacks = async () => {
  const feedbacksRef = collection(db, 'feedbacks')
  const q = query(feedbacksRef, orderBy('createdAt', 'desc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}
