export function generatedDescriptionCertificate(input: string) {
  const matches = [...input.matchAll(/\{([^}]*)\}/g)].map((m) => m[1].trim())

  const desc_indo = matches[0] || ''
  const desc_eng = matches.length > 1 ? matches[1] : ''

  return { desc_indo, desc_eng }
}

export function generatedDescriptionCertificateFull(input: string) {
  const matches = [...input.matchAll(/\{([^}]*)\}/g)].map((m) => m[1].trim())

  const desc_indo = matches[0] || ''
  const desc_eng = matches[1] || ''
  const body_indo = matches[2] || ''
  const body_eng = matches.length > 3 ? matches[3] : ''

  return { desc_indo, desc_eng, body_indo, body_eng }
}

export function generatedCurriculumCertificate(input: string) {
  const matches = [...input.matchAll(/\{([^}]*)\}/g)].map((m) => m[1].trim())

  const curr_indo = matches[0] || ''
  const curr_eng = matches.length > 1 ? matches[1] : ''

  return { curr_indo, curr_eng }
}

export function generatedStatusCertificate(input: string) {
  const matches = [...input.matchAll(/\{([^}]*)\}/g)].map((m) => m[1].trim())

  const position = matches[0] || ''
  const status_indo = matches[1] || ''
  const status_eng = matches.length > 2 ? matches[2] : ''

  return { position, status_indo, status_eng }
}

export function generatedSignedCertificate(input: string) {
  const matches = [...input.matchAll(/\{([^}]*)\}/g)].map((m) => m[1].trim())

  const name = matches[0] || ''
  const status_indo = matches[1] || ''
  const status_eng = matches[2] || ''
  const location = matches.length > 3 ? matches[3] : ''

  return { name, status_indo, status_eng, location }
}

export function isEnglishFormat(input: string) {
  return generatedDescriptionCertificate(input).desc_eng !== ''
}
