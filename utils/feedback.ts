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
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getStorage,
} from 'firebase/storage'
import firebaseApp from '@/firebase/config'

const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

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

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

// Compress image before upload
const compressImage = async (file: File, maxSizeMB = 1): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions (max 1920px width)
        const maxWidth = 1920
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // Start with quality 0.8 and reduce if needed
        let quality = 0.8
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Compression failed'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

export const uploadMaklumatImage = async (
  file: File,
  onProgress?: (progress: number) => void
) => {
  // Compress image first
  const compressedFile = await compressImage(file)

  const timestamp = Date.now()
  const fileName = `maklumat-pelayanan/${timestamp}_${file.name}`
  const storageRef = ref(storage, fileName)

  await uploadBytes(storageRef, compressedFile)
  const downloadURL = await getDownloadURL(storageRef)

  return { url: downloadURL, path: fileName }
}

export const saveMaklumatPelayanan = async (data: any) => {
  return await addDoc(collection(db, 'maklumat-pelayanan'), {
    ...data,
    createdAt: new Date(),
  })
}

export const getAllMaklumatPelayanan = async () => {
  const maklumatRef = collection(db, 'maklumat-pelayanan')
  const q = query(maklumatRef, orderBy('createdAt', 'desc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

export const updateMaklumatPelayanan = async (id: string, data: any) => {
  const docRef = doc(db, 'maklumat-pelayanan', id)
  return await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  })
}

export const deleteMaklumatPelayanan = async (
  id: string,
  imagePath: string,
) => {
  // Delete from Firestore
  const docRef = doc(db, 'maklumat-pelayanan', id)
  await deleteDoc(docRef)

  // Delete image from Storage
  if (imagePath) {
    const imageRef = ref(storage, imagePath)
    await deleteObject(imageRef)
  }
}
