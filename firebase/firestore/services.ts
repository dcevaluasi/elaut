import { getFirestore, doc, getDoc } from 'firebase/firestore'
import Cookies from 'js-cookie'
import firebaseApp from '../config'
import { PelatihanMasyarakat } from '@/types/product'
import { generateTimestamp } from '@/utils/time'
import addData from './addData'

const db = getFirestore(firebaseApp)

export const handleAddHistoryTrainingInExisting = async (
  pelatihan: PelatihanMasyarakat,
  msg: string,
) => {
  if (!pelatihan?.KodePelatihan) {
    console.error('Pelatihan data is missing!')
    return
  }

  const docRef = doc(db, 'historical-training-notes', pelatihan.KodePelatihan)

  try {
    const docSnap = await getDoc(docRef)
    let existingHistory = []

    if (docSnap.exists()) {
      const data = docSnap.data()
      existingHistory = data.historical || []
    }

    const newEntryData = {
      created_at: generateTimestamp(),
      id: pelatihan.KodePelatihan,
      notes: `${msg} ${pelatihan.NamaPelatihan}`,
      role: Cookies.get('Eselon'),
      upt: Cookies.get('SATKER_BPPP'),
    }

    existingHistory.push(newEntryData)

    const { result, error } = await addData(
      'historical-training-notes',
      pelatihan.KodePelatihan,
      {
        historical: existingHistory,
        status: 'On Progress',
      },
    )

    console.log({ result })
  } catch (error) {
    console.error('Error adding history:', error)
  }
}
