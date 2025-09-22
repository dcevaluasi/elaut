export function generateJPMateri(input: string) {
  const matches = [...input.matchAll(/\{([^}]*)\}/g)].map((m) => m[1].trim())

  const theory = matches[0] || ''
  const practice = matches.length > 1 ? matches[1] : ''

  return { theory, practice }
}
