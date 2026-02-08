export const sanitizedDangerousChars = (input: string): string => {
  if (!input) return ''
  // More comprehensive list of dangerous characters for shell/command injection
  const dangerousChars = /[&;`'"\|*?~<>\^\(\)\[\]\{\}\$\n\r]/g
  return input.replace(dangerousChars, (match) => `\\${match}`)
}

export const validateIsDangerousChars = (input: string): boolean => {
  if (!input) return false
  const dangerousChars = /[&;`'"\|*?~<>\^\(\)\[\]\{\}\$\n\r]/g
  return dangerousChars.test(input)
}

/**
 * Strips HTML tags and suspicious Javascript from strings to prevent XSS
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return ''
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: pseudo-protocol
    .replace(/on\w+=\s*".*?"/gi, '') // Remove inline event handlers
    .trim()
}

/**
 * Validates if an input is simple text without dangerous symbols
 */
export const isSecureInput = (input: string): boolean => {
  if (!input) return true
  // Alphanumeric + basic punctuation only
  const secureRegex = /^[a-zA-Z0-9\s.,@_\-\/]*$/
  return secureRegex.test(input)
}

export const arrayToString = (arr: number[]): string => {
  return arr.join(',')
}

// Convert comma-separated string back to array of numbers
export const stringToArray = (str: string): number[] => {
  if (!str) return []
  return str.split(',').map((n) => Number(n.trim()))
}
