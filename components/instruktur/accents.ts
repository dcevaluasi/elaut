/**
 * Warna penanda langkah wizard. Tiap langkah punya satu warna yang ikut ke
 * stepper, batang judul bagian, dan cincin fokus input — supaya instruktur
 * tahu posisinya tanpa membaca teks.
 *
 * Kelas ditulis utuh, bukan disusun dari potongan string, karena Tailwind
 * memindai berkas secara statis dan akan membuang kelas yang dirakit runtime.
 */
export type AccentName = 'biru' | 'emerald' | 'violet' | 'ambar'

export type Accent = {
  bar: string
  chipAktif: string
  chipSelesai: string
  ikonFokus: string
  cincinFokus: string
  progress: string
  teks: string
}

export const ACCENTS: Record<AccentName, Accent> = {
  biru: {
    bar: 'bg-primary',
    chipAktif: 'bg-primary text-white ring-4 ring-primary/15',
    chipSelesai: 'bg-primary/10 text-primary',
    ikonFokus: 'group-focus-within:text-primary',
    cincinFokus: 'focus:ring-primary/10 focus-within:ring-primary/10',
    progress: 'bg-primary',
    teks: 'text-primary',
  },
  emerald: {
    bar: 'bg-emerald-500',
    chipAktif: 'bg-emerald-500 text-white ring-4 ring-emerald-500/15',
    chipSelesai: 'bg-emerald-500/10 text-emerald-600',
    ikonFokus: 'group-focus-within:text-emerald-500',
    cincinFokus: 'focus:ring-emerald-500/10 focus-within:ring-emerald-500/10',
    progress: 'bg-emerald-500',
    teks: 'text-emerald-600',
  },
  violet: {
    bar: 'bg-violet-500',
    chipAktif: 'bg-violet-500 text-white ring-4 ring-violet-500/15',
    chipSelesai: 'bg-violet-500/10 text-violet-600',
    ikonFokus: 'group-focus-within:text-violet-500',
    cincinFokus: 'focus:ring-violet-500/10 focus-within:ring-violet-500/10',
    progress: 'bg-violet-500',
    teks: 'text-violet-600',
  },
  ambar: {
    bar: 'bg-amber-500',
    chipAktif: 'bg-amber-500 text-white ring-4 ring-amber-500/15',
    chipSelesai: 'bg-amber-500/10 text-amber-600',
    ikonFokus: 'group-focus-within:text-amber-500',
    cincinFokus: 'focus:ring-amber-500/10 focus-within:ring-amber-500/10',
    progress: 'bg-amber-500',
    teks: 'text-amber-600',
  },
}
