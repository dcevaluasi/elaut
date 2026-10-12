// ─── Data Nelayan KNMP + 5 BPPP ──────────────────────────────────────────

export interface NelayanPoint {
  id: number;
  no: number;
  desa: string;
  upt: string;
  wilayah: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  desaKota: string;
  jumlahAnggota: number;
  jumlahOrgPdLaut: number;
  jumlahRTN: number;
  lat: number;
  lng: number;
}

export interface BpppPoint {
  id: number;
  no: number;
  name: string;
  lat: number;
  lng: number;
  color: string;
  colorLight: string;
  colorDark: string;
}

export const BPPP_5: BpppPoint[] = [
  { id: 1, no: 1, name: 'BPPP Medan',       lat: 3.751101,  lng: 98.694000,  color: '#f59e0b', colorLight: '#fde68a', colorDark: '#b45309' },
  { id: 2, no: 2, name: 'BPPP Tegal',       lat: -6.854895, lng: 109.152341, color: '#3b82f6', colorLight: '#93c5fd', colorDark: '#1d4ed8' },
  { id: 3, no: 3, name: 'BPPP Banyuwangi',  lat: -8.071691, lng: 114.421138, color: '#10b981', colorLight: '#6ee7b7', colorDark: '#065f46' },
  { id: 4, no: 4, name: 'BPPP Bitung',      lat: 1.458345,  lng: 125.212771, color: '#8b5cf6', colorLight: '#c4b5fd', colorDark: '#5b21b6' },
  { id: 5, no: 5, name: 'BPPP Ambon',       lat: -3.657591, lng: 128.198300, color: '#f43f5e', colorLight: '#fda4af', colorDark: '#be123c' },
];

export const NELAYAN_65: NelayanPoint[] = [
  { id: 1,  no: 1,  desa: 'KNMP 3001', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Barat',          kabupaten: 'Cirebon',            kecamatan: 'Gebang',            desaKota: 'Gebang Mekar',         jumlahAnggota: 30,  jumlahOrgPdLaut: 25,  jumlahRTN: 22,  lat: -6.7358,  lng: 108.4920 },
  { id: 2,  no: 2,  desa: 'KNMP 3002', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Tenggara',   kabupaten: 'Kolaka',             kecamatan: 'Tanggetada',        desaKota: 'Analwoi',              jumlahAnggota: 32,  jumlahOrgPdLaut: 28,  jumlahRTN: 20,  lat: -4.0583,  lng: 121.7225 },
  { id: 3,  no: 3,  desa: 'KNMP 3003', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'DI Yogyakarta',       kabupaten: 'Bantul',             kecamatan: 'Srandakan',         desaKota: 'Poncosari',            jumlahAnggota: 40,  jumlahOrgPdLaut: 35,  jumlahRTN: 28,  lat: -7.9825,  lng: 110.2456 },
  { id: 4,  no: 4,  desa: 'KNMP 3004', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Tengah',         kabupaten: 'Kebumen',            kecamatan: 'Ayah',              desaKota: 'Karangduwur',          jumlahAnggota: 35,  jumlahOrgPdLaut: 30,  jumlahRTN: 24,  lat: -7.7328,  lng: 109.3781 },
  { id: 5,  no: 5,  desa: 'KNMP 3005', upt: 'BPPP Banyuwangi',  wilayah: 'Bali & Nusa Tenggara', provinsi: 'Nusa Tenggara Barat', kabupaten: 'Lombok Timur',       kecamatan: 'Jerowaru',          desaKota: 'Ekas Buana',           jumlahAnggota: 45,  jumlahOrgPdLaut: 40,  jumlahRTN: 32,  lat: -8.8231,  lng: 116.5102 },
  { id: 6,  no: 6,  desa: 'KNMP 3006', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Selatan',    kabupaten: 'Bulukumba',          kecamatan: 'Ujung Bulu',        desaKota: 'Bentenge',             jumlahAnggota: 38,  jumlahOrgPdLaut: 33,  jumlahRTN: 26,  lat: -5.5606,  lng: 120.1908 },
  { id: 7,  no: 7,  desa: 'KNMP 3007', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Lampung',             kabupaten: 'Lampung Selatan',    kecamatan: 'Sragi',             desaKota: 'Bandar Agung',         jumlahAnggota: 50,  jumlahOrgPdLaut: 44,  jumlahRTN: 36,  lat: -5.6172,  lng: 105.8014 },
  { id: 8,  no: 8,  desa: 'KNMP 3008', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Barat',          kabupaten: 'Cianjur',            kecamatan: 'Agrabinta',         desaKota: 'Wanasari',             jumlahAnggota: 28,  jumlahOrgPdLaut: 23,  jumlahRTN: 18,  lat: -7.4136,  lng: 107.0914 },
  { id: 9,  no: 9,  desa: 'KNMP 3009', upt: 'BPPP Banyuwangi',  wilayah: 'Bali & Nusa Tenggara', provinsi: 'Bali',                kabupaten: 'Karangasem',         kecamatan: 'Karangasem',        desaKota: 'Seraya Timur',         jumlahAnggota: 42,  jumlahOrgPdLaut: 37,  jumlahRTN: 30,  lat: -8.4511,  lng: 115.6072 },
  { id: 10, no: 10, desa: 'KNMP 3010', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Selatan',    kabupaten: 'Sinjai',             kecamatan: 'Sinjai Timur',      desaKota: 'Tongke-Tongke',        jumlahAnggota: 55,  jumlahOrgPdLaut: 48,  jumlahRTN: 40,  lat: -5.1222,  lng: 120.3500 },
  { id: 11, no: 11, desa: 'KNMP 3011', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Kalimantan Barat',    kabupaten: 'Sambas',             kecamatan: 'Selakau',           desaKota: 'Sungai Nyirih',        jumlahAnggota: 33,  jumlahOrgPdLaut: 28,  jumlahRTN: 22,  lat: 1.1325,   lng: 108.9811 },
  { id: 12, no: 12, desa: 'KNMP 3012', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Tengah',         kabupaten: 'Purworejo',          kecamatan: 'Purwodadi',         desaKota: 'Jatimalang',           jumlahAnggota: 36,  jumlahOrgPdLaut: 31,  jumlahRTN: 25,  lat: -7.8361,  lng: 110.0417 },
  { id: 13, no: 13, desa: 'KNMP 3013', upt: 'BPPP Banyuwangi',  wilayah: 'Bali & Nusa Tenggara', provinsi: 'Nusa Tenggara Barat', kabupaten: 'Lombok Tengah',      kecamatan: 'Praya Timur',       desaKota: 'Bilelando',            jumlahAnggota: 40,  jumlahOrgPdLaut: 35,  jumlahRTN: 28,  lat: -8.8006,  lng: 116.3589 },
  { id: 14, no: 14, desa: 'KNMP 3014', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Timur',          kabupaten: 'Malang',             kecamatan: 'Tirtoyudo',         desaKota: 'Pujharjo',             jumlahAnggota: 44,  jumlahOrgPdLaut: 39,  jumlahRTN: 31,  lat: -8.3533,  lng: 112.7819 },
  { id: 15, no: 15, desa: 'KNMP 3015', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Lampung',             kabupaten: 'Lampung Selatan',    kecamatan: 'Ketapang',          desaKota: 'Ketapang',             jumlahAnggota: 60,  jumlahOrgPdLaut: 53,  jumlahRTN: 44,  lat: -5.5108,  lng: 105.5750 },
  { id: 16, no: 16, desa: 'KNMP 3016', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Tengah',         kabupaten: 'Purworejo',          kecamatan: 'Grabag',            desaKota: 'Kertojayan',           jumlahAnggota: 30,  jumlahOrgPdLaut: 25,  jumlahRTN: 20,  lat: -7.7833,  lng: 110.0756 },
  { id: 17, no: 17, desa: 'KNMP 3017', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Aceh',                kabupaten: 'Bireuen',            kecamatan: 'Kuala',             desaKota: 'Kuala Raja',           jumlahAnggota: 48,  jumlahOrgPdLaut: 42,  jumlahRTN: 35,  lat: 5.1644,   lng: 96.8756 },
  { id: 18, no: 18, desa: 'KNMP 3018', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Sumatera Selatan',    kabupaten: 'Banyuasin',          kecamatan: 'Banyuasin II',      desaKota: 'Sungsang IV',          jumlahAnggota: 52,  jumlahOrgPdLaut: 46,  jumlahRTN: 38,  lat: -2.3683,  lng: 104.8494 },
  { id: 19, no: 19, desa: 'KNMP 3019', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Gorontalo',           kabupaten: 'Kota Gorontalo',     kecamatan: 'Dumbo Raya',        desaKota: 'Leato Selatan',        jumlahAnggota: 35,  jumlahOrgPdLaut: 30,  jumlahRTN: 24,  lat: 0.5361,   lng: 123.0642 },
  { id: 20, no: 20, desa: 'KNMP 3020', upt: 'BPPP Banyuwangi',  wilayah: 'Bali & Nusa Tenggara', provinsi: 'Nusa Tenggara Timur', kabupaten: 'Kupang',             kecamatan: 'Sulamu',            desaKota: 'Kelurahan Sulamu',     jumlahAnggota: 38,  jumlahOrgPdLaut: 33,  jumlahRTN: 27,  lat: -10.3811, lng: 123.7750 },
  { id: 21, no: 21, desa: 'KNMP 3021', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Tengah',         kabupaten: 'Jepara',             kecamatan: 'Keling',            desaKota: 'Bumi Harjo',           jumlahAnggota: 42,  jumlahOrgPdLaut: 37,  jumlahRTN: 30,  lat: -6.5494,  lng: 110.7428 },
  { id: 22, no: 22, desa: 'KNMP 3022', upt: 'BPPP Banyuwangi',  wilayah: 'Bali & Nusa Tenggara', provinsi: 'Nusa Tenggara Timur', kabupaten: 'Flores Timur',       kecamatan: 'Ile Mandiri',       desaKota: 'Kelurahan Mudakeputu', jumlahAnggota: 46,  jumlahOrgPdLaut: 40,  jumlahRTN: 33,  lat: -8.3789,  lng: 122.9978 },
  { id: 23, no: 23, desa: 'KNMP 3023', upt: 'BPPP Banyuwangi',  wilayah: 'Bali & Nusa Tenggara', provinsi: 'Nusa Tenggara Timur', kabupaten: 'Alor',               kecamatan: 'Alor Barat Laut',   desaKota: 'Kelurahan Adang',      jumlahAnggota: 34,  jumlahOrgPdLaut: 29,  jumlahRTN: 23,  lat: -8.2150,  lng: 124.5167 },
  { id: 24, no: 24, desa: 'KNMP 3024', upt: 'BPPP Banyuwangi',  wilayah: 'Bali & Nusa Tenggara', provinsi: 'Nusa Tenggara Timur', kabupaten: 'Manggarai Barat',    kecamatan: 'Komodo',            desaKota: 'Warloka Pesisir',      jumlahAnggota: 50,  jumlahOrgPdLaut: 44,  jumlahRTN: 36,  lat: -8.5044,  lng: 119.7967 },
  { id: 25, no: 25, desa: 'KNMP 3025', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Tengah',     kabupaten: 'Toli Toli',          kecamatan: 'Dampal Utara',      desaKota: 'Banagan',              jumlahAnggota: 41,  jumlahOrgPdLaut: 36,  jumlahRTN: 29,  lat: 0.9056,   lng: 120.8625 },
  { id: 26, no: 26, desa: 'KNMP 3026', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Banten',              kabupaten: 'Pandeglang',         kecamatan: 'Cikeusik',          desaKota: 'Cikiruh Wetan',        jumlahAnggota: 29,  jumlahOrgPdLaut: 25,  jumlahRTN: 20,  lat: -7.1325,  lng: 105.9233 },
  { id: 27, no: 27, desa: 'KNMP 3027', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Tenggara',   kabupaten: 'Konawe',             kecamatan: 'Soropia',           desaKota: 'Sorue Jaya',           jumlahAnggota: 37,  jumlahOrgPdLaut: 32,  jumlahRTN: 26,  lat: -3.8917,  lng: 122.5411 },
  { id: 28, no: 28, desa: 'KNMP 3028', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Tengah',         kabupaten: 'Pati',               kecamatan: 'Dukuh Seti',        desaKota: 'Banyutowo',            jumlahAnggota: 55,  jumlahOrgPdLaut: 49,  jumlahRTN: 40,  lat: -6.5508,  lng: 111.0939 },
  { id: 29, no: 29, desa: 'KNMP 3029', upt: 'BPPP Ambon',       wilayah: 'Maluku & Papua',       provinsi: 'Papua Barat Daya',    kabupaten: 'Raja Ampat',         kecamatan: 'Kota Waisai',       desaKota: 'Warmasen',             jumlahAnggota: 43,  jumlahOrgPdLaut: 38,  jumlahRTN: 31,  lat: -0.4322,  lng: 130.8436 },
  { id: 30, no: 30, desa: 'KNMP 3030', upt: 'BPPP Banyuwangi',  wilayah: 'Bali & Nusa Tenggara', provinsi: 'Nusa Tenggara Barat', kabupaten: 'Sumbawa',            kecamatan: 'Alas',              desaKota: 'Pulau Bungin',         jumlahAnggota: 70,  jumlahOrgPdLaut: 62,  jumlahRTN: 52,  lat: -8.5211,  lng: 117.2100 },
  { id: 31, no: 31, desa: 'KNMP 3031', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Barat',          kabupaten: 'Pangandaran',        kecamatan: 'Parigi',            desaKota: 'Karangjaladri',        jumlahAnggota: 32,  jumlahOrgPdLaut: 27,  jumlahRTN: 22,  lat: -7.5714,  lng: 108.4956 },
  { id: 32, no: 32, desa: 'KNMP 3032', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Selatan',    kabupaten: 'Kota Makassar',      kecamatan: 'Biringkanaya',      desaKota: 'Untia',                jumlahAnggota: 63,  jumlahOrgPdLaut: 56,  jumlahRTN: 46,  lat: -5.0733,  lng: 119.4486 },
  { id: 33, no: 33, desa: 'KNMP 3033', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Selatan',    kabupaten: 'Jeneponto',          kecamatan: 'Tarowang',          desaKota: 'Balangloe Tarowang',   jumlahAnggota: 47,  jumlahOrgPdLaut: 41,  jumlahRTN: 34,  lat: -5.6717,  lng: 119.8281 },
  { id: 34, no: 34, desa: 'KNMP 3034', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Aceh',                kabupaten: 'Aceh Utara',         kecamatan: 'Syamtalira Bayu',   desaKota: 'Lancok',               jumlahAnggota: 44,  jumlahOrgPdLaut: 38,  jumlahRTN: 31,  lat: 5.1017,   lng: 97.0083 },
  { id: 35, no: 35, desa: 'KNMP 3035', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Bengkulu',            kabupaten: 'Seluma',             kecamatan: 'Ilir Talo',         desaKota: 'Penago I',             jumlahAnggota: 39,  jumlahOrgPdLaut: 34,  jumlahRTN: 28,  lat: -4.2756,  lng: 102.7989 },
  { id: 36, no: 36, desa: 'KNMP 3036', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Timur',          kabupaten: 'Tuban',              kecamatan: 'Bancar',            desaKota: 'Bulu Meduro',          jumlahAnggota: 49,  jumlahOrgPdLaut: 43,  jumlahRTN: 36,  lat: -6.8597,  lng: 111.6231 },
  { id: 37, no: 37, desa: 'KNMP 3037', upt: 'BPPP Banyuwangi',  wilayah: 'Jawa & Banten',        provinsi: 'Jawa Timur',          kabupaten: 'Banyuwangi',         kecamatan: 'Banyuwangi',        desaKota: 'Lateng',               jumlahAnggota: 58,  jumlahOrgPdLaut: 51,  jumlahRTN: 43,  lat: -8.2192,  lng: 114.3722 },
  { id: 38, no: 38, desa: 'KNMP 3038', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Tenggara',   kabupaten: 'Bombana',            kecamatan: 'Poleang Tenggara',  desaKota: 'Terapung',             jumlahAnggota: 41,  jumlahOrgPdLaut: 36,  jumlahRTN: 29,  lat: -4.5700,  lng: 121.9567 },
  { id: 39, no: 39, desa: 'KNMP 3039', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Kepulauan Riau',      kabupaten: 'Kota Batam',         kecamatan: 'Galang',            desaKota: 'Sembulang',            jumlahAnggota: 56,  jumlahOrgPdLaut: 49,  jumlahRTN: 41,  lat: 0.6394,   lng: 104.1928 },
  { id: 40, no: 40, desa: 'KNMP 3040', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Barat',          kabupaten: 'Garut',              kecamatan: 'Pakenjeng',         desaKota: 'Karansari',            jumlahAnggota: 27,  jumlahOrgPdLaut: 23,  jumlahRTN: 18,  lat: -7.4028,  lng: 107.8594 },
  { id: 41, no: 41, desa: 'KNMP 3041', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Aceh',                kabupaten: 'Aceh Barat Daya',    kecamatan: 'Manggeng',          desaKota: 'Lhok Pawoh',           jumlahAnggota: 38,  jumlahOrgPdLaut: 33,  jumlahRTN: 27,  lat: 3.6967,   lng: 96.9317 },
  { id: 42, no: 42, desa: 'KNMP 3042', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Lampung',             kabupaten: 'Lampung Timur',      kecamatan: 'Labuhan Maringgai', desaKota: 'Sukorahayu',           jumlahAnggota: 64,  jumlahOrgPdLaut: 56,  jumlahRTN: 47,  lat: -5.6022,  lng: 105.8461 },
  { id: 43, no: 43, desa: 'KNMP 3043', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Barat',      kabupaten: 'Mamuju Tengah',      kecamatan: 'Budong-Budong',     desaKota: 'Babana',               jumlahAnggota: 36,  jumlahOrgPdLaut: 31,  jumlahRTN: 25,  lat: -1.9867,  lng: 119.6578 },
  { id: 44, no: 44, desa: 'KNMP 3044', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Barat',          kabupaten: 'Sukabumi',           kecamatan: 'Ciemas',            desaKota: 'Ciwaru',               jumlahAnggota: 33,  jumlahOrgPdLaut: 28,  jumlahRTN: 23,  lat: -7.2211,  lng: 106.4625 },
  { id: 45, no: 45, desa: 'KNMP 3045', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Lampung',             kabupaten: 'Lampung Timur',      kecamatan: 'Labuhan Maringgai', desaKota: 'Margasari',            jumlahAnggota: 61,  jumlahOrgPdLaut: 54,  jumlahRTN: 45,  lat: -5.6158,  lng: 105.8683 },
  { id: 46, no: 46, desa: 'KNMP 3046', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Tenggara',   kabupaten: 'Buton Utara',        kecamatan: 'Kulisusu',          desaKota: 'Malalanda',            jumlahAnggota: 44,  jumlahOrgPdLaut: 38,  jumlahRTN: 31,  lat: -4.6431,  lng: 122.9583 },
  { id: 47, no: 47, desa: 'KNMP 3047', upt: 'BPPP Tegal',       wilayah: 'Jawa & Banten',        provinsi: 'Jawa Timur',          kabupaten: 'Sumenep',            kecamatan: 'Batang-Batang',     desaKota: 'Dapenda',              jumlahAnggota: 35,  jumlahOrgPdLaut: 30,  jumlahRTN: 24,  lat: -6.9817,  lng: 114.2175 },
  { id: 48, no: 48, desa: 'KNMP 3048', upt: 'BPPP Ambon',       wilayah: 'Maluku & Papua',       provinsi: 'Maluku Utara',        kabupaten: 'Pulau Morotai',      kecamatan: 'Morotai Timur',     desaKota: 'Sangowo Timur',        jumlahAnggota: 53,  jumlahOrgPdLaut: 47,  jumlahRTN: 39,  lat: 2.2683,   lng: 128.4789 },
  { id: 49, no: 49, desa: 'KNMP 3049', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Kalimantan Tengah',   kabupaten: 'Kotawaringin Barat', kecamatan: 'Arut Selatan',      desaKota: 'Tanjung Putri',        jumlahAnggota: 46,  jumlahOrgPdLaut: 40,  jumlahRTN: 33,  lat: -2.7228,  lng: 111.6789 },
  { id: 50, no: 50, desa: 'KNMP 3050', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Barat',      kabupaten: 'Mamuju',             kecamatan: 'Simboro',           desaKota: 'Sumare',               jumlahAnggota: 39,  jumlahOrgPdLaut: 34,  jumlahRTN: 28,  lat: -2.6761,  lng: 118.8622 },
  { id: 51, no: 51, desa: 'KNMP 3051', upt: 'BPPP Ambon',       wilayah: 'Maluku & Papua',       provinsi: 'Maluku Utara',        kabupaten: 'Halmahera Timur',    kecamatan: 'Maba Utara',        desaKota: 'Wasileo',              jumlahAnggota: 41,  jumlahOrgPdLaut: 36,  jumlahRTN: 29,  lat: 0.8708,   lng: 128.2583 },
  { id: 52, no: 52, desa: 'KNMP 3052', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Sumatera Barat',      kabupaten: 'Padang Pariaman',    kecamatan: 'Batang Anai',       desaKota: 'Katapiang',            jumlahAnggota: 57,  jumlahOrgPdLaut: 50,  jumlahRTN: 42,  lat: -0.8433,  lng: 100.2178 },
  { id: 53, no: 53, desa: 'KNMP 3053', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Sumatera Barat',      kabupaten: 'Kota Padang',        kecamatan: 'Koto Tangah',       desaKota: 'Padang Sarai',         jumlahAnggota: 62,  jumlahOrgPdLaut: 55,  jumlahRTN: 46,  lat: -0.8789,  lng: 100.3411 },
  { id: 54, no: 54, desa: 'KNMP 3054', upt: 'BPPP Ambon',       wilayah: 'Maluku & Papua',       provinsi: 'Maluku Utara',        kabupaten: 'Halmahera Utara',    kecamatan: 'Loloda Utara',      desaKota: 'Supu',                 jumlahAnggota: 35,  jumlahOrgPdLaut: 30,  jumlahRTN: 24,  lat: 1.8894,   lng: 127.8211 },
  { id: 55, no: 55, desa: 'KNMP 3055', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Bengkulu',            kabupaten: 'Kaur',               kecamatan: 'Nasal',             desaKota: 'Merpas',               jumlahAnggota: 43,  jumlahOrgPdLaut: 37,  jumlahRTN: 31,  lat: -4.9306,  lng: 103.3294 },
  { id: 56, no: 56, desa: 'KNMP 3056', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Kepulauan Riau',      kabupaten: 'Kota Batam',         kecamatan: 'Belakang Padang',   desaKota: 'Sekanak Raya',         jumlahAnggota: 68,  jumlahOrgPdLaut: 60,  jumlahRTN: 50,  lat: 1.1556,   lng: 103.9467 },
  { id: 57, no: 57, desa: 'KNMP 3057', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Selatan',    kabupaten: 'Takalar',            kecamatan: 'Galesong Utara',    desaKota: 'Aeng Batu-Batu',       jumlahAnggota: 48,  jumlahOrgPdLaut: 42,  jumlahRTN: 35,  lat: -5.3083,  lng: 119.3978 },
  { id: 58, no: 58, desa: 'KNMP 3058', upt: 'BPPP Ambon',       wilayah: 'Maluku & Papua',       provinsi: 'Maluku',              kabupaten: 'Buru',               kecamatan: 'Waplau',            desaKota: 'Waeilhang',            jumlahAnggota: 37,  jumlahOrgPdLaut: 32,  jumlahRTN: 26,  lat: -3.4481,  lng: 127.0089 },
  { id: 59, no: 59, desa: 'KNMP 3059', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Kepulauan Riau',      kabupaten: 'Kota Batam',         kecamatan: 'Belakang Padang',   desaKota: 'Kelurahan Kasu',       jumlahAnggota: 72,  jumlahOrgPdLaut: 64,  jumlahRTN: 53,  lat: 1.1383,   lng: 103.9289 },
  { id: 60, no: 60, desa: 'KNMP 3060', upt: 'BPPP Ambon',       wilayah: 'Maluku & Papua',       provinsi: 'Papua Selatan',       kabupaten: 'Merauke',            kecamatan: 'Merauke',           desaKota: 'Samkai',               jumlahAnggota: 45,  jumlahOrgPdLaut: 39,  jumlahRTN: 32,  lat: -8.4908,  lng: 140.4019 },
  { id: 61, no: 61, desa: 'KNMP 3061', upt: 'BPPP Medan',       wilayah: 'Sumatera',             provinsi: 'Aceh',                kabupaten: 'Kota Langsa',        kecamatan: 'Langsa Baro',       desaKota: 'Birem Puntong',        jumlahAnggota: 53,  jumlahOrgPdLaut: 47,  jumlahRTN: 39,  lat: 4.4672,   lng: 97.9733 },
  { id: 62, no: 62, desa: 'KNMP 3062', upt: 'BPPP Medan',       wilayah: 'Kalimantan',           provinsi: 'Kalimantan Barat',    kabupaten: 'Kapuas Hulu',        kecamatan: 'Jongkong',          desaKota: 'Ujung Said',           jumlahAnggota: 30,  jumlahOrgPdLaut: 26,  jumlahRTN: 21,  lat: 0.5731,   lng: 112.1683 },
  { id: 63, no: 63, desa: 'KNMP 3063', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Selatan',    kabupaten: 'Bone',               kecamatan: 'Kajuara',           desaKota: 'Angkue',               jumlahAnggota: 42,  jumlahOrgPdLaut: 37,  jumlahRTN: 30,  lat: -4.3050,  lng: 120.5561 },
  { id: 64, no: 64, desa: 'KNMP 3064', upt: 'BPPP Ambon',       wilayah: 'Maluku & Papua',       provinsi: 'Maluku',              kabupaten: 'Kota Tual',          kecamatan: 'Pulau Dullah Utara', desaKota: 'Labetawi',            jumlahAnggota: 48,  jumlahOrgPdLaut: 42,  jumlahRTN: 35,  lat: -5.6378,  lng: 132.7511 },
  { id: 65, no: 65, desa: 'KNMP 3065', upt: 'BPPP Bitung',      wilayah: 'Sulawesi & Gorontalo', provinsi: 'Sulawesi Tenggara',   kabupaten: 'Buton Selatan',      kecamatan: 'Sampolawa',         desaKota: 'Gerak Makmur',         jumlahAnggota: 36,  jumlahOrgPdLaut: 31,  jumlahRTN: 25,  lat: -5.2256,  lng: 122.6833 },
];

export function getBpppByName(name: string): BpppPoint | undefined {
  return BPPP_5.find(b => b.name === name);
}

export interface BpppClusterSummary {
  bppp: BpppPoint;
  points: NelayanPoint[];
  totalAnggota: number;
  totalOrgPdLaut: number;
  totalRTN: number;
  avgAnggota: number;
}

export function getBpppClusterSummaries(): BpppClusterSummary[] {
  return BPPP_5.map(bppp => {
    const points = NELAYAN_65.filter(n => n.upt === bppp.name);
    const totalAnggota = points.reduce((s, p) => s + p.jumlahAnggota, 0);
    const totalOrgPdLaut = points.reduce((s, p) => s + p.jumlahOrgPdLaut, 0);
    const totalRTN = points.reduce((s, p) => s + p.jumlahRTN, 0);
    return {
      bppp,
      points,
      totalAnggota,
      totalOrgPdLaut,
      totalRTN,
      avgAnggota: points.length > 0 ? Math.round(totalAnggota / points.length) : 0,
    };
  });
}
