export const sanitizedDangerousChars = (input: string): string => {
  const dangerousChars = /[&;`'"\|*?~<>\^\(\)\[\]\{\}\$\n\r]/g
  return input.replace(dangerousChars, (match) => `\\${match}`)
}

export const validateIsDangerousChars = (input: string): boolean => {
  const dangerousChars = /[&;`'"\|*?~<>\^\(\)\[\]\{\}\$\n\r]/g
  return dangerousChars.test(input)
}
