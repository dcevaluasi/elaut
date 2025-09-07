/**
 * STATUS LEGEND
 *0 > diklat telah dibuat
 *1 > pending spv
 *1.1 > approved spv
 *1.2 > reject spv
 *1.25 closed
 *1.3 > pending kabalai
 *1.4 > approved kabalai
 *1.5 reject kabalai
 *1.6 > signed kabalai
 *2 > pending verifikator
 *3 > reject verifikator
 *4 > approved pelaksanaan
 *5 > telah selesai
 *6 > pending verifikator
 *7 > reject verifikator
 *8 > pending kapus
 *9 > reject kapus
 *10 > approved kapus
 *11 > signed kapus
 *12 > pending kabadan
 *13 > reject kabadan
 *14 > approved kabadan
 *15 > signed kabadan
 **/

// Ka UPT, Ka Puslat KP, and Ka BPPSDM KP
const PENDING_SIGNING_BY_ESELONS = ['1.4', '10', '14']
export function isPendingSigning(status: string): boolean {
  return PENDING_SIGNING_BY_ESELONS.includes(status)
}

const SIGNED_BY_ESELONS = ['1.6', '11', '15']
export function isSigned(status: string): boolean {
  return SIGNED_BY_ESELONS.includes(status)
}

// Verifikasi Pelaksanaan
const VERIFY_DIKLAT_BY_VERIFICATOR = ['2', '3']
export function isVerifyDiklat(status: string): boolean {
  return VERIFY_DIKLAT_BY_VERIFICATOR.includes(status)
}
