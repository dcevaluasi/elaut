# Portal Instruktur — Masuk dengan NIP & Lengkapi Profil

**Tanggal:** 12 Agustus 2026
**Status:** Terintegrasi dengan backend api-elaut (24 Agustus 2026)

## Masalah

Data instruktur di E-LAUT saat ini hanya bisa diisi dan diperbarui oleh admin lemdik lewat
`commons/actions/instruktur/UpdateInstrukturAction.tsx`. Akibatnya data kepakaran dan sertifikasi
instruktur sering tidak lengkap dan tidak mutakhir, karena admin tidak memegang informasi itu.

Solusinya: beri instruktur jalur masuk sendiri memakai NIP, lalu arahkan langsung ke form
pengisian profil miliknya.

## Ruang lingkup

Tahap awal UI saja dengan data dummy. Sejak 24 Agustus 2026 portal sudah memakai data
sungguhan dari `api-elaut`; `constants/instruktur-dummy.ts` dihapus dan daftar pilihannya
pindah ke `constants/instruktur.ts` yang kini dipakai bersama form admin.

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

Field dari `types/instruktur.ts` dibagi ke empat langkah:

1. **Data Diri** — `nama`, `nip` (readonly, terkunci dari login), `email`, `no_telpon`, `pendidikkan_terakhir`, `Golongan`
2. **Unit Kerja** — `eselon_1`, `eselon_2` (opsi bergantung pada eselon 1, sumber `UK_ESELON_2`); `id_lemdik` dan `status` ditampilkan terkunci
3. **Kepakaran** — `jenis_pelatih`, `jenjang_jabatan`, `bidang_keahlian`, `jenis_sisjamu` (opsional), `label`, `jenis_label`
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
  Step.tsx
  StepSertifikasi.tsx
  ReviewSummary.tsx
  FieldText.tsx          input teks berlabel + ikon
  FieldSelect.tsx        select berlabel + ikon
  FieldTerkunci.tsx      tampilan data yang ditetapkan admin
constants/instruktur.ts             daftar pilihan bersama portal & admin
hooks/elaut/instruktur/usePortalInstruktur.ts
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

**Daftar pilihan dipakai bersama.** `constants/instruktur.ts` menjadi satu-satunya sumber untuk
pendidikan, golongan, jenjang jabatan, bidang keahlian, label, jenis label, dan program SISJAMU —
dipakai wizard portal maupun form admin, supaya keduanya tidak pernah menyimpan ejaan yang berbeda
untuk hal yang sama.

**Persentase kelengkapan** dihitung dari 22 field pada `TRACKED_FIELDS` — naik dari 18 setelah
`Golongan`, `jenis_sisjamu`, `label`, dan `jenis_label` ikut diisi — ditampilkan di progress bar
header wizard dan diperbarui saat pengguna mengetik.

## Integrasi backend

Dua endpoint publik ditambahkan di `api-elaut` (`app/controllers/instrukturPortal.go`), keduanya
di luar `JwtProtect` dan dibatasi 10 permintaan per IP per menit lewat `limiterPortalInstruktur()`
di `app/routes/routes.go`:

| Endpoint | Guna |
|---|---|
| `GET /instruktur/nip/:nip` | Pencarian profil saat masuk. Respons dipangkas — `IdInstruktur` dan `create_at` tidak dibuka, dan nama unit kerja ikut dikirim sebagai `unit_kerja` supaya portal tidak perlu memanggil endpoint unit kerja yang menuntut token admin. |
| `PUT /instruktur/self/:nip` | Instruktur menyimpan profilnya sendiri. Hanya kolom pada `permintaanProfilInstruktur` yang bisa berubah. |

**`nip`, `id_lemdik`, dan `status` tidak bisa diubah instruktur.** Ketiganya ditetapkan admin
lemdik. Di wizard, satuan pendidikan dan status keaktifan ditampilkan terkunci lewat
`FieldTerkunci` — ditampilkan, bukan disembunyikan, supaya instruktur bisa memverifikasi
penempatannya dan tahu harus menghubungi admin bila keliru.

Akses dari frontend lewat `hooks/elaut/instruktur/usePortalInstruktur.ts`, yang memetakan 404 dan
429 ke keadaan tersendiri agar halaman bisa membedakan "NIP belum terdaftar" dari "terlalu banyak
percobaan".

## Batasan yang disadari

Masuk hanya dengan NIP berarti siapa pun yang mengetahui NIP seseorang bisa membuka dan mengubah
profil orang itu. NIP bukan rahasia — formatnya bisa ditebak dan sering tercantum di dokumen publik.
Ini keputusan sadar demi kemudahan pada tahap ini; kalau nanti data yang disimpan bertambah sensitif,
faktor kedua (OTP ke email terdaftar) perlu ditambahkan.

Yang sudah dipasang untuk menekan risikonya: pembatas 10 permintaan per IP per menit di kedua
endpoint publik, respons 404 bernada generik supaya tidak bisa dipakai membedakan NIP yang salah
format dari NIP yang belum terdaftar, dan daftar kolom yang diizinkan pada `UpdateInstrukturSelf`
sehingga penempatan serta status kepegawaian tetap hanya bisa diubah admin.
