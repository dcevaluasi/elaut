import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { UserPelatihan } from '@/types/product'
import { fileBaseUrl } from '@/constants/urls'

export async function downloadAndZipPDFs(
  pdfUrls: UserPelatihan[],
  zipFilename = 'default',
) {
  const zip = new JSZip()
  const folder = zip.folder(zipFilename)

  for (let i = 0; i < pdfUrls.length; i++) {
    const url = pdfUrls[i]
    const filename = `${i + 1}. ${url.FileSertifikat}`

    try {
      const response = await fetch(
        fileBaseUrl + '/sertifikat-ttde/' + url.FileSertifikat,
      )
      if (!response.ok)
        throw new Error(`Failed to fetch: ${url.FileSertifikat}`)

      const blob = await response.blob()
      folder?.file(filename, blob)
    } catch (err) {
      console.error(`Error downloading ${url.FileSertifikat}`)
    }
  }
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, zipFilename + '.zip')
}

export const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpeg', 'jpg', 'csv']
export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
export const MIN_FILE_SIZE = 1 // 1 byte
