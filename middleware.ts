import { NextResponse } from 'next/server'
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const randomId = Math.random().toString(36).substring(2, 10)
  res.redirect(307, `/${randomId}/auth/login`)
}

export function middleware(request: any) {
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
      '/admin/balai/dashboard',
      '/admin/pusat/dashboard',
      '/admin/pusat/pelatihan/penerbitan-sertifikat',
      '/admin/balai/pelatihan',
      '/admin/balai/pelatihan/penerbitan-sttpl',
      '/admin/balai/pelatihan/[kode-pelatihan]/peserta-pelatihan/[id]',
      '/admin/balai/pelatihan/[kode-pelatihan]/bank-soal/[id]',
      '/admin/balai/pelatihan/[kode-pelatihan]/peserta-pelatihan/[id]/[id_user_pelatihan]/[id_user]',
      '/admin/balai/pelatihan/detail-pelatihan/[kode_pelatihan]/[id_pelatihan]',
      '/admin/balai/pelatihan/detail/[kode_pelatihan]/[id_pelatihan]',
      '/admin/balai/pelatihan/edit-pelatihan/[id]',
      '/admin/balai/pelatihan/pemberitahuan-pelatihan',
      '/admin/balai/pelatihan/penerbitan-sertifikat',
      '/admin/balai/pelatihan/penerbitan-sertifikat/detail-pelatihan/[kode_pelatihan]/[id_pelatihan]',
      '/admin/balai/pelatihan/pengajuan-sttpl',
      '/admin/balai/uji-kompetensi',
      '/admin/balai/uji-kompetensi/[kode_pelatihan]/bank-soal/[id]',
      '/admin/balai/uji-kompetensi/[kode_pelatihan]/peserta-pelatihan/[id]',
      '/admin/balai/uji-kompetensi/[kode_pelatihan]/peserta-pelatihan/[id]/[id_user]',
      '/admin/balai/uji-kompetensi/edit-pelatihan/[id]',
      '/admin/balai/uji-kompetensi/pemberitahuan-pelatihan',
      '/admin/balai/uji-kompetensi/pengajuan-sttpl',
      '/admin/balai/uji-kompetensi/tambah-ujikom',
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
        new URL('/admin/balai/pelatihan', request.url),
      )
    }
  }

  // Additional role-based checks can be added here

  return NextResponse.next()
}
