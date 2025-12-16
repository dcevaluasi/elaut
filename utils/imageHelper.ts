/**
 * Converts various Google Drive URL formats to a direct viewable link
 * Handles:
 * - drive.usercontent.google.com URLs
 * - drive.google.com/file/d/ URLs
 * - drive.google.com/open URLs
 */
export function getDirectImageUrl(url: string): string {
  if (!url) return url

  // Extract file ID from any Google Drive URL format
  let fileId = ''

  // Format: https://drive.usercontent.google.com/download?id=FILE_ID&...
  if (url.includes('drive.usercontent.google.com')) {
    const userContentMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (userContentMatch) {
      fileId = userContentMatch[1]
    }
  }

  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) {
    fileId = fileMatch[1]
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (openMatch && !fileId) {
    fileId = openMatch[1]
  }

  // If we found a file ID, convert to the most reliable format
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }

  // Return original URL if no conversion needed
  return url
}
