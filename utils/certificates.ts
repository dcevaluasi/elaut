export function generatedDescriptionCertificate(input: string) {
  const matches = [...input.matchAll(/\{([^}]*)\}/g)].map((m) => m[1].trim())

  const desc_indo = matches[0] || ''
  const desc_eng = matches.length > 1 ? matches[1] : ''

  return { desc_indo, desc_eng }
}

export function generatedCurriculumCertificate(input: string) {
  const matches = [...input.matchAll(/\{([^}]*)\}/g)].map((m) => m[1].trim())

  const curr_indo = matches[0] || ''
  const curr_eng = matches.length > 1 ? matches[1] : ''

  return { curr_indo, curr_eng }
}
