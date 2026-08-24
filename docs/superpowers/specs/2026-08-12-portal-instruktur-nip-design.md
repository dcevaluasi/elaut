# Portal Instruktur — Masuk dengan NIP & Lengkapi Profil

**Tanggal:** 12 Agustus 2026
**Status:** Disetujui — tahap UI (data dummy)

## Masalah

Data instruktur di E-LAUT saat ini hanya bisa diisi dan diperbarui oleh admin lemdik lewat
`commons/actions/instruktur/UpdateInstrukturAction.tsx`. Akibatnya data kepakaran dan sertifikasi
instruktur sering tidak lengkap dan tidak mutakhir, karena admin tidak memegang informasi itu.

Solusinya: beri instruktur jalur masuk sendiri memakai NIP, lalu arahkan langsung ke form
pengisian profil miliknya.

## Ruang lingkup

Tahap ini **UI saja, dengan data dummy**. Integrasi API menyusul setelah UI disetujui.

## Alur

```
/instruktur/login
   │  input NIP (18 digit)
   ├─ NIP ketemu ──► simpan profil ke sessionStorage ──► /instruktur/edit-profile
   └─ NIP tidak ketemu ──► dialog "NIP belum terdaftar, hubungi admin lemdik Anda"
```

Keputusan yang sudah diambil:

- **Tanpa password.** Instruktur cukup memasukkan NIP.
- **Tanpa daftar mandiri.** NIP yang tidak ada di basis data ditolak dan diarahkan menghubungi admin.
- Instruktur yang membuka `/instruktur/edit-profile` tanpa sesi dilempar balik ke `/instruktur/login`.

## Route

| Route | Isi |
|---|---|
| `app/instruktur/layout.tsx` | Metadata + pembungkus segmen instruktur |
| `app/instruktur/login/page.tsx` | Split screen: form NIP di kiri, panel identitas E-LAUT di kanan |
| `app/instruktur/edit-profile/page.tsx` | Wizard 5 langkah (4 isian + 1 ringkasan) |

## Pembagian field

20 field dari `types/instruktur.ts` dibagi ke empat langkah:

1. **Data Diri** — `nama`, `nip` (readonly, terkunci dari login), `email`, `no_telpon`, `pendidikkan_terakhir`
2. **Unit Kerja** — `eselon_1`, `eselon_2` (opsi bergantung pada eselon 1, sumber `UK_ESELON_2`), `id_lemdik`, `status`
3. **Kepakaran** — `jenis_pelatih`, `jenjang_jabatan`, `bidang_keahlian`
4. **Sertifikasi** — `metodologi_pelatihan`, `pelatihan_pelatih`, `kompetensi_teknis`, `management_of_training`, `training_officer_course`, `link_data_dukung_sertifikat`

Langkah kelima adalah ringkasan: semua isian ditampilkan per bagian dengan tombol "Ubah" yang
melompat balik ke langkah terkait, lalu tombol "Simpan profil".

Field `IdInstruktur`, `create_at`, dan `update_at` tidak pernah ditampilkan — itu milik sistem.

## Berkas yang dibuat

```
app/instruktur/
  layout.tsx
  login/page.tsx
  edit-profile/page.tsx
components/instruktur/
  StepIndicator.tsx      stepper + progress kelengkapan
  StepDataDiri.tsx
  StepUnitKerja.tsx
  StepKepakaran.tsx
  StepSertifikasi.tsx
  ReviewSummary.tsx
  FieldText.tsx          input teks berlabel + ikon
  FieldSelect.tsx        select berlabel + ikon
constants/instruktur-dummy.ts
```

## Keputusan teknis

**Stack mengikuti pola `app/p2mkp`** yang sudah ada di repo: `react-hook-form` + `zod`,
komponen shadcn (`Form`, `Input`, `Select`, `AlertDialog`), `framer-motion` untuk transisi
antar langkah, `HashLoader` untuk keadaan memuat. Tidak ada library baru.

**Bahasa visual mengikuti E-LAUT**, bukan identitas baru. Ini portal pemerintah yang sudah punya
sistem desain sendiri; instruktur yang berpindah dari halaman lain harus merasa berada di produk
yang sama. Yang dipakai: font `calsans` untuk judul dan `inter` (Plus Jakarta Sans) untuk teks,
biru `#3C50E0` sebagai warna utama, input `h-14 rounded-2xl bg-gray-50` dengan ikon di kiri,
label mikro `text-[10px] uppercase tracking-widest`, dan batang warna sebagai penanda bagian —
semuanya sudah dipakai di `UpdateInstrukturAction.tsx`.

**Satu warna per langkah** dipakai sebagai penanda posisi: biru untuk Data Diri, emerald untuk
Unit Kerja, violet untuk Kepakaran, ambar untuk Sertifikasi. Warna itu ikut ke stepper, batang
bagian, dan cincin fokus input, sehingga instruktur tahu di mana dirinya tanpa membaca teks.

**Validasi per langkah.** Tombol "Lanjut" hanya memvalidasi field pada langkah yang sedang dibuka,
jadi instruktur tidak dihadang error dari langkah yang belum disentuh. Skema zod dipecah per
langkah lalu digabung.

**State wizard dipegang `edit-profile/page.tsx`.** Tiap komponen langkah menerima objek `form`
dari react-hook-form dan bersifat presentational — tidak menyimpan state sendiri, tidak memanggil
API. Ini menjaga tiap berkas tetap kecil dan bisa diuji sendiri.

**Persentase kelengkapan** dihitung dari jumlah field terisi dibagi 20, ditampilkan di progress bar
header wizard dan diperbarui saat pengguna mengetik.

**Data dummy** ada di `constants/instruktur-dummy.ts`: tiga profil dengan tingkat kelengkapan
berbeda (lengkap, separuh, hampir kosong) supaya progress bar dan penanda "belum lengkap" bisa
diuji. Daftar lemdik juga dihardcode di sana, karena `useFetchDataUnitKerja` menuntut token admin
yang tidak dimiliki instruktur.

**Menyimpan masih dummy.** Tombol "Simpan profil" menampilkan dialog sukses tanpa memanggil API.

## Dependensi yang belum ada

Backend belum punya endpoint pencarian NIP tanpa autentikasi. `GET /getInstrukturs` menuntut token
admin dan mengembalikan seluruh instruktur — tidak layak dipanggil dari halaman publik. Integrasi
nanti membutuhkan endpoint baru, misalnya `GET /instruktur/by-nip/{nip}`, yang publik namun
dibatasi laju permintaannya agar NIP tidak bisa disapu satu per satu.

## Batasan yang disadari

Masuk hanya dengan NIP berarti siapa pun yang mengetahui NIP seseorang bisa membuka dan mengubah
profil orang itu. NIP bukan rahasia — formatnya bisa ditebak dan sering tercantum di dokumen publik.
Ini keputusan sadar demi kemudahan pada tahap ini; kalau nanti data yang disimpan bertambah sensitif,
faktor kedua (OTP ke email terdaftar) perlu ditambahkan.
