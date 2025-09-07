export function convertToBPPP(city: string): string {
  const cityMap: { [key: string]: string } = {
    medan: 'BPPP Medan',
    banyuwangi: 'BPPP Banyuwangi',
    tegal: 'BPPP Tegal',
    bitung: 'BPPP Bitung',
    ambon: 'BPPP Ambon',
  }

  return cityMap[city.toLowerCase()] || 'Unknown City'
}

export function generatedDetailInfoLemdiklat(input: string) {
  const matches = [...input.matchAll(/\{([^}]*)\}/g)].map((m) => m[1].trim())

  const name = matches[0] || ''
  const lemdiklat = matches.length > 1 ? matches[1] : ''

  return { name, lemdiklat }
}
