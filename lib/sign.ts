// THIS FILE COLLECTS ALL UTILITY TO HANDLE ELECTRONIC SIGN RELATED BEHAVIOR

export const isUnsigned = (file: string) =>
  file === '' || !(file.includes('signed') || file.includes('Signed'))

export const isSigned = (file: string) =>
  file.includes('signed') || file.includes('Signed') || file.includes('drive')
