export const sanitizedDangerousChars = (input: string): string => {
  const dangerousChars = /[&;`'"\|*?~<>\^\(\)\[\]\{\}\$\n\r]/g
  return input.replace(dangerousChars, (match) => `\\${match}`)
}

export const validateIsDangerousChars = (input: string): boolean => {
  const dangerousChars = /[&;`'"\|*?~<>\^\(\)\[\]\{\}\$\n\r]/g
  return dangerousChars.test(input)
}

export const arrayToString = (arr: number[]): string => {
  return arr.join(',')
}

// Convert comma-separated string back to array of numbers
export const stringToArray = (str: string): number[] => {
  if (!str) return []
  return str.split(',').map((n) => Number(n.trim()))
}
