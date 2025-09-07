import { NextResponse } from 'next/server'
import { NextApiRequest, NextApiResponse } from 'next'
import { decryptValue } from './lib/utils'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const randomId = Math.random().toString(36).substring(2, 10)
  res.redirect(307, `/${randomId}/auth/login`)
}

export function middleware(request: any) {
  // if (request.headers.get("x-forwarded-proto") === "http") {
  //   return NextResponse.redirect(`https://${request.headers.get("host")}${request.nextUrl.pathname}`, 301);
  // }

  const XSRF091 = request.cookies.get('XSRF091')
  const XSRF081 = request.cookies.get('XSRF081')
  const XSRF087 = request.cookies.get('XSRF087')

  const path = request.nextUrl.pathname

  // Role-based access control
  if (!XSRF081) {
    const protectedPaths = ['/dashboard/edit-profile', '/dashboard']
    if (protectedPaths.includes(path)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } else {
    const protectedPaths = ['/registrasi', '/login']
    if (protectedPaths.includes(path)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (XSRF081 && XSRF087) {
    const protectedPaths = [
      '/',
      '/layanan/pelatihan/akp',
      '/layanan/pelatihan/perikanan',
      '/layanan/pelatihan/kelautan',
      '/layanan/cek-sertifikat',
    ]
    if (protectedPaths.includes(path)) {
      return NextResponse.redirect(
        new URL('/dashboard/edit-profile', request.url),
      )
    }
  }

  // if (!XSRF091) {
  //   const adminProtectedPaths = [
  //     '/admin/lemdiklat/dashboard',
  //     '/admin/pusat/dashboard',
  //     '/admin/[random_id]/pelaksanaan',
  //     '/admin/pusat/pelatihan/penerbitan-sertifikat',
  //     '/admin/lemdiklat/pelatihan',
  //     '/admin/lemdiklat/pelatihan/penerbitan-sttpl',
  //     '/admin/lemdiklat/pelatihan/[kode-pelatihan]/peserta-pelatihan/[id]',
  //     '/admin/lemdiklat/pelatihan/[kode-pelatihan]/bank-soal/[id]',
  //     '/admin/lemdiklat/pelatihan/[kode-pelatihan]/peserta-pelatihan/[id]/[id_user_pelatihan]/[id_user]',
  //     '/admin/lemdiklat/pelatihan/detail-pelatihan/[kode_pelatihan]/[id_pelatihan]',
  //     '/admin/lemdiklat/pelatihan/detail/[kode_pelatihan]/[id_pelatihan]',
  //     '/admin/lemdiklat/pelatihan/edit-pelatihan/[id]',
  //     '/admin/lemdiklat/pelatihan/pemberitahuan-pelatihan',
  //     '/admin/lemdiklat/pelatihan/penerbitan-sertifikat',
  //     '/admin/lemdiklat/pelatihan/penerbitan-sertifikat/detail-pelatihan/[kode_pelatihan]/[id_pelatihan]',
  //     '/admin/lemdiklat/pelatihan/pengajuan-sttpl',
  //     '/admin/lemdiklat/uji-kompetensi',
  //     '/admin/lemdiklat/uji-kompetensi/[kode_pelatihan]/bank-soal/[id]',
  //     '/admin/lemdiklat/uji-kompetensi/[kode_pelatihan]/peserta-pelatihan/[id]',
  //     '/admin/lemdiklat/uji-kompetensi/[kode_pelatihan]/peserta-pelatihan/[id]/[id_user]',
  //     '/admin/lemdiklat/uji-kompetensi/edit-pelatihan/[id]',
  //     '/admin/lemdiklat/uji-kompetensi/pemberitahuan-pelatihan',
  //     '/admin/lemdiklat/uji-kompetensi/pengajuan-sttpl',
  //     '/admin/lemdiklat/uji-kompetensi/tambah-ujikom',
  //   ]

  //   const isAdminProtectedPath = adminProtectedPaths.some((protectedPath) => {
  //     const regex = new RegExp(
  //       `^${protectedPath.replace(/\[.*?\]/g, '[^/]+')}$`,
  //     )
  //     return regex.test(path)
  //   })

  //   // Special case for /admin/[random_id]/pelaksanaan
  //   const match = path.match(/^\/admin\/([^/]+)\/pelaksanaan$/)
  //   if (match) {
  //     const randomId = match[1]
  //     const decryptedId = decryptValue(randomId) // Implement your decrypt function

  //     if (decryptedId !== 'pusat') {
  //       return NextResponse.redirect(new URL('/admin/auth/login', request.url))
  //     }
  //   }

  //   if (isAdminProtectedPath) {
  //     return NextResponse.redirect(new URL('/admin/auth/login', request.url))
  //   }
  // } else {
  //   const protectedPaths = ['/admin/auth/login']

  //   if (protectedPaths.includes(path)) {
  //     return NextResponse.redirect(
  //       new URL('/admin/lemdiklat/pelatihan', request.url),
  //     )
  //   }
  // }

  // Additional role-based checks can be added here

  return NextResponse.next()
}
