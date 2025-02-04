import { NextResponse } from 'next/server'
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const randomId = Math.random().toString(36).substring(2, 10)
  res.redirect(307, `/${randomId}/auth/login`)
}

export function middleware(request: any) {
  if (request.headers.get("x-forwarded-proto") === "http") {
    return NextResponse.redirect(`https://${request.headers.get("host")}${request.nextUrl.pathname}`, 301);
  }

  const XSRF091 = request.cookies.get('XSRF091')
  const XSRF081 = request.cookies.get('XSRF081')
  const XSRF095 = request.cookies.get('XSRF095') // DPKAKP ADMIN
  const XSRF096 = request.cookies.get('XSRF096') // DPKAKP USERS
  const XSRF097 = request.cookies.get('XSRF097') // DPKAKP USERS

  const path = request.nextUrl.pathname

  // Role-based access control
  if (!XSRF081) {
    const protectedPaths = ['/dashboard/complete-profile', '/dashboard']

    if (protectedPaths.includes(path)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } else {
    const protectedPaths = ['/registrasi', '/login']

    if (protectedPaths.includes(path)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (!XSRF095) {
    const protectedPaths = [
      '/lembaga/dpkakp/admin/dashboard',
      '/lembaga/dpkakp/admin/dashboard/bank-soal',
      '/lembaga/dpkakp/admin/dashboard/master',
      '/lembaga/dpkakp/admin/dashboard/ujian',
      '/lembaga/pukakp/admin/dashboard/ujian',
    ]

    if (protectedPaths.includes(path)) {
      return NextResponse.redirect(
        new URL('/lembaga/dpkakp/admin/auth/login', request.url),
      )
    }
  }

  if (!XSRF091) {
    const adminProtectedPaths = [
      '/admin/lemdiklat/dashboard',
      '/admin/pusat/dashboard',
      '/admin/pusat/pelatihan/penerbitan-sertifikat',
      '/admin/lemdiklat/pelatihan',
      '/admin/lemdiklat/pelatihan/penerbitan-sttpl',
      '/admin/lemdiklat/pelatihan/[kode-pelatihan]/peserta-pelatihan/[id]',
      '/admin/lemdiklat/pelatihan/[kode-pelatihan]/bank-soal/[id]',
      '/admin/lemdiklat/pelatihan/[kode-pelatihan]/peserta-pelatihan/[id]/[id_user_pelatihan]/[id_user]',
      '/admin/lemdiklat/pelatihan/detail-pelatihan/[kode_pelatihan]/[id_pelatihan]',
      '/admin/lemdiklat/pelatihan/detail/[kode_pelatihan]/[id_pelatihan]',
      '/admin/lemdiklat/pelatihan/edit-pelatihan/[id]',
      '/admin/lemdiklat/pelatihan/pemberitahuan-pelatihan',
      '/admin/lemdiklat/pelatihan/penerbitan-sertifikat',
      '/admin/lemdiklat/pelatihan/penerbitan-sertifikat/detail-pelatihan/[kode_pelatihan]/[id_pelatihan]',
      '/admin/lemdiklat/pelatihan/pengajuan-sttpl',
      '/admin/lemdiklat/uji-kompetensi',
      '/admin/lemdiklat/uji-kompetensi/[kode_pelatihan]/bank-soal/[id]',
      '/admin/lemdiklat/uji-kompetensi/[kode_pelatihan]/peserta-pelatihan/[id]',
      '/admin/lemdiklat/uji-kompetensi/[kode_pelatihan]/peserta-pelatihan/[id]/[id_user]',
      '/admin/lemdiklat/uji-kompetensi/edit-pelatihan/[id]',
      '/admin/lemdiklat/uji-kompetensi/pemberitahuan-pelatihan',
      '/admin/lemdiklat/uji-kompetensi/pengajuan-sttpl',
      '/admin/lemdiklat/uji-kompetensi/tambah-ujikom',
    ]

    const isAdminProtectedPath = adminProtectedPaths.some((protectedPath) => {
      const regex = new RegExp(
        `^${protectedPath.replace(/\[.*?\]/g, '[^/]+')}$`,
      )
      return regex.test(path)
    })

    if (isAdminProtectedPath) {
      return NextResponse.redirect(new URL('/admin/auth/login', request.url))
    }
  } else {
    const protectedPaths = ['/admin/auth/login']

    if (protectedPaths.includes(path)) {
      return NextResponse.redirect(
        new URL('/admin/lemdiklat/pelatihan', request.url),
      )
    }
  }

  // Additional role-based checks can be added here

  return NextResponse.next()
}
