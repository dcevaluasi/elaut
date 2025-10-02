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
  role?: string,
  upt?: string,
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
      notes: `${msg}`,
      role: role,
      upt: upt ? upt : `${Cookies.get('Nama')} - ${Cookies.get('Satker')}`,
    }

    existingHistory.push(newEntryData)

    const { result, error } = await addData(
      'historical-training-notes',
      pelatihan.KodePelatihan,
      {
        historical: existingHistory,
        status: role ? 'Done' : 'On Progress',
      },
    )

    console.log({
      historical: existingHistory,
      status: role ? 'Done' : 'On Progress',
    })
    console.log({ result })
    console.log({ error })
  } catch (error) {
    console.error('Error adding history:', error)
  }
}

export const parseCustomDate = (dateStr: string): Date => {
  try {
    if (!dateStr) throw new Error('Empty date string')

    const parts = dateStr.split(', ')
    const datePart = parts[0]
    const timePart = parts[1] || '00.00.00'

    const [day, month, year] = datePart.split('/').map(Number)
    const [hours, minutes, seconds] = timePart.split('.').map(Number)

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error(`Invalid date part: ${dateStr}`)
    }

    return new Date(
      year,
      month - 1,
      day,
      hours || 0,
      minutes || 0,
      seconds || 0,
    )
  } catch (err) {
    console.error('parseCustomDate error:', err, 'input:', dateStr)
    return new Date(0)
  }
}
