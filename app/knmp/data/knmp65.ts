import { CoordinatePoint } from './coordinates';
import { UptKkpPoint } from './upt_kkp';

// ─── 9 Balai Pelatihan KP (BPMKP) – dari tabel user ───────────────────────
// Koordinat dari kolom 'koordinat' pada tabel (format lat, lng)
export const BPMKP_9: UptKkpPoint[] = [
  {
    id: 201,
    no: 1,
    name: 'BPMKP Medan',
    lat: 3.751101,
    lng: 98.694000,
    region: 'Sumatera',
    type: 'BPMKP',
    direction: 'top',
  },
  {
    id: 202,
    no: 2,
    name: 'BPMKP Depok',
    lat: -6.401067,
    lng: 106.814607,
    region: 'Jawa & Banten',
    type: 'BPMKP',
    direction: 'top',
  },
  {
    id: 203,
    no: 3,
    name: 'BPMKP Subang',
    lat: -6.368244,
    lng: 107.623489,
    region: 'Jawa & Banten',
    type: 'BPMKP',
    direction: 'bottom',
  },
  {
    id: 204,
    no: 4,
    name: 'BBPPPKP Tegal',
    lat: -6.854895,
    lng: 109.152341,
    region: 'Jawa & Banten',
    type: 'BPMKP',
    direction: 'top',
  },
  {
    id: 205,
    no: 5,
    name: 'BPMKP Banyuwangi',
    lat: -8.071694,
    lng: 114.421138,
    region: 'Jawa & Banten',
    type: 'BPMKP',
    direction: 'top',
  },
  {
    id: 206,
    no: 6,
    name: 'BPMKP Buleleng',
    lat: -8.154500,
    lng: 115.089326,
    region: 'Bali & Nusa Tenggara',
    type: 'BPMKP',
    direction: 'bottom',
  },
  {
    id: 207,
    no: 7,
    name: 'BPMKP Maros',
    lat: -5.003063,
    lng: 119.589326,
    region: 'Sulawesi & Gorontalo',
    type: 'BPMKP',
    direction: 'top',
  },
  {
    id: 208,
    no: 8,
    name: 'BPMKP Bitung',
    lat: 1.458344,
    lng: 125.212771,
    region: 'Sulawesi & Gorontalo',
    type: 'BPMKP',
    direction: 'right',
  },
  {
    id: 209,
    no: 9,
    name: 'BPMKP Ambon',
    lat: -3.657900,
    lng: 128.198300,
    region: 'Maluku & Papua',
    type: 'BPMKP',
    direction: 'bottom',
  },
];

// ─── 65 Titik KNMP – dari tabel user ─────────────────────────────────────
// Koordinat diperoleh berdasarkan nama desa/kecamatan/kota/provinsi
export const KNMP_65: CoordinatePoint[] = [
  // 1. Gebang Mekar, Gebang, Cirebon, Jawa Barat
  { id: 3001, no: 1,  name: 'Gebang Mekar', region: 'Jawa & Banten', location: 'Gebang, Cirebon, Jawa Barat', lat: -6.7358, lng: 108.4920 },
  // 2. Analwoi, Tanggetada, Kolaka, Sulawesi Tenggara
  { id: 3002, no: 2,  name: 'Analwoi', region: 'Sulawesi & Gorontalo', location: 'Tanggetada, Kolaka, Sulawesi Tenggara', lat: -4.0583, lng: 121.7225 },
  // 3. Poncosari, Srandakan, Bantul, DI Yogyakarta
  { id: 3003, no: 3,  name: 'Poncosari', region: 'Jawa & Banten', location: 'Srandakan, Bantul, DI Yogyakarta', lat: -7.9825, lng: 110.2456 },
  // 4. Karangduwur, Ayah, Kebumen, Jawa Tengah
  { id: 3004, no: 4,  name: 'Karangduwur', region: 'Jawa & Banten', location: 'Ayah, Kebumen, Jawa Tengah', lat: -7.7328, lng: 109.3781 },
  // 5. Ekas Buana, Jerowaru, Lombok Timur, NTB
  { id: 3005, no: 5,  name: 'Ekas Buana', region: 'Bali & Nusa Tenggara', location: 'Jerowaru, Lombok Timur, NTB', lat: -8.8231, lng: 116.5102 },
  // 6. Bentenge, Ujung Bulu, Bulukumba, Sulawesi Selatan
  { id: 3006, no: 6,  name: 'Bentenge', region: 'Sulawesi & Gorontalo', location: 'Ujung Bulu, Bulukumba, Sulawesi Selatan', lat: -5.5606, lng: 120.1908 },
  // 7. Bandar Agung, Sragi, Lampung Selatan, Lampung
  { id: 3007, no: 7,  name: 'Bandar Agung', region: 'Sumatera', location: 'Sragi, Lampung Selatan, Lampung', lat: -5.6172, lng: 105.8014 },
  // 8. Wanasari, Agrabinta, Cianjur, Jawa Barat
  { id: 3008, no: 8,  name: 'Wanasari', region: 'Jawa & Banten', location: 'Agrabinta, Cianjur, Jawa Barat', lat: -7.4136, lng: 107.0914 },
  // 9. Seraya Timur, Karangasem, Karangasem, Bali
  { id: 3009, no: 9,  name: 'Seraya Timur', region: 'Bali & Nusa Tenggara', location: 'Karangasem, Karangasem, Bali', lat: -8.4511, lng: 115.6072 },
  // 10. Tongke-Tongke, Sinjai Timur, Sinjai, Sulawesi Selatan
  { id: 3010, no: 10, name: 'Tongke-Tongke', region: 'Sulawesi & Gorontalo', location: 'Sinjai Timur, Sinjai, Sulawesi Selatan', lat: -5.1222, lng: 120.3500 },
  // 11. Sungai Nyirih, Selakau, Sambas, Kalimantan Barat
  { id: 3011, no: 11, name: 'Sungai Nyirih', region: 'Kalimantan', location: 'Selakau, Sambas, Kalimantan Barat', lat: 1.1325, lng: 108.9811 },
  // 12. Jatimalang, Purwodadi, Purworejo, Jawa Tengah
  { id: 3012, no: 12, name: 'Jatimalang', region: 'Jawa & Banten', location: 'Purwodadi, Purworejo, Jawa Tengah', lat: -7.8361, lng: 110.0417 },
  // 13. Bilelando, Praya Timur, Lombok Tengah, NTB
  { id: 3013, no: 13, name: 'Bilelando', region: 'Bali & Nusa Tenggara', location: 'Praya Timur, Lombok Tengah, NTB', lat: -8.8006, lng: 116.3589 },
  // 14. Pujharjo, Tirtoyudo, Malang, Jawa Timur
  { id: 3014, no: 14, name: 'Pujharjo', region: 'Jawa & Banten', location: 'Tirtoyudo, Malang, Jawa Timur', lat: -8.3533, lng: 112.7819 },
  // 15. Ketapang, Ketapang, Lampung Selatan, Lampung
  { id: 3015, no: 15, name: 'Ketapang', region: 'Sumatera', location: 'Ketapang, Lampung Selatan, Lampung', lat: -5.5108, lng: 105.5750 },
  // 16. Kertojayan, Grabag, Purworejo, Jawa Tengah
  { id: 3016, no: 16, name: 'Kertojayan', region: 'Jawa & Banten', location: 'Grabag, Purworejo, Jawa Tengah', lat: -7.7833, lng: 110.0756 },
  // 17. Kuala Raja, Kuala, Bireuen, Aceh
  { id: 3017, no: 17, name: 'Kuala Raja', region: 'Sumatera', location: 'Kuala, Bireuen, Aceh', lat: 5.1644, lng: 96.8756 },
  // 18. Sungsang IV, Banyuasin II, Banyuasin, Sumatera Selatan
  { id: 3018, no: 18, name: 'Sungsang IV', region: 'Sumatera', location: 'Banyuasin II, Banyuasin, Sumatera Selatan', lat: -2.3683, lng: 104.8494 },
  // 19. Leato Selatan, Dumbo Raya, Kota Gorontalo, Gorontalo
  { id: 3019, no: 19, name: 'Leato Selatan', region: 'Sulawesi & Gorontalo', location: 'Dumbo Raya, Kota Gorontalo, Gorontalo', lat: 0.5361, lng: 123.0642 },
  // 20. Kelurahan Sulamu, Sulamu, Kupang, NTT
  { id: 3020, no: 20, name: 'Kelurahan Sulamu', region: 'Bali & Nusa Tenggara', location: 'Sulamu, Kupang, NTT', lat: -10.3811, lng: 123.7750 },
  // 21. Bumi Harjo, Keling, Jepara, Jawa Tengah
  { id: 3021, no: 21, name: 'Bumi Harjo', region: 'Jawa & Banten', location: 'Keling, Jepara, Jawa Tengah', lat: -6.5494, lng: 110.7428 },
  // 22. Kelurahan Mudakeputu, Ile Mandiri, Flores Timur, NTT
  { id: 3022, no: 22, name: 'Kelurahan Mudakeputu', region: 'Bali & Nusa Tenggara', location: 'Ile Mandiri, Flores Timur, NTT', lat: -8.3789, lng: 122.9978 },
  // 23. Kelurahan Adang, Alor Barat Laut, Alor, NTT
  { id: 3023, no: 23, name: 'Kelurahan Adang', region: 'Bali & Nusa Tenggara', location: 'Alor Barat Laut, Alor, NTT', lat: -8.2150, lng: 124.5167 },
  // 24. Warloka Pesisir, Komodo, Manggarai Barat, NTT
  { id: 3024, no: 24, name: 'Warloka Pesisir', region: 'Bali & Nusa Tenggara', location: 'Komodo, Manggarai Barat, NTT', lat: -8.5044, lng: 119.7967 },
  // 25. Banagan, Dampal Utara, Toli Toli, Sulawesi Tengah
  { id: 3025, no: 25, name: 'Banagan', region: 'Sulawesi & Gorontalo', location: 'Dampal Utara, Toli Toli, Sulawesi Tengah', lat: 0.9056, lng: 120.8625 },
  // 26. Cikiruh Wetan, Cikeusik, Pandeglang, Banten
  { id: 3026, no: 26, name: 'Cikiruh Wetan', region: 'Jawa & Banten', location: 'Cikeusik, Pandeglang, Banten', lat: -7.1325, lng: 105.9233 },
  // 27. Sorue Jaya, Soropia, Konawe, Sulawesi Tenggara
  { id: 3027, no: 27, name: 'Sorue Jaya', region: 'Sulawesi & Gorontalo', location: 'Soropia, Konawe, Sulawesi Tenggara', lat: -3.8917, lng: 122.5411 },
  // 28. Banyutowo, Dukuh Seti, Pati, Jawa Tengah
  { id: 3028, no: 28, name: 'Banyutowo', region: 'Jawa & Banten', location: 'Dukuh Seti, Pati, Jawa Tengah', lat: -6.5508, lng: 111.0939 },
  // 29. Warmasen, Kota Waisai, Raja Ampat, Papua Barat Daya
  { id: 3029, no: 29, name: 'Warmasen', region: 'Maluku & Papua', location: 'Kota Waisai, Raja Ampat, Papua Barat Daya', lat: -0.4322, lng: 130.8436 },
  // 30. Pulau Bungin, Alas, Sumbawa, NTB
  { id: 3030, no: 30, name: 'Pulau Bungin', region: 'Bali & Nusa Tenggara', location: 'Alas, Sumbawa, NTB', lat: -8.5211, lng: 117.2100 },
  // 31. Karangjaladri, Parigi, Pangandaran, Jawa Barat
  { id: 3031, no: 31, name: 'Karangjaladri', region: 'Jawa & Banten', location: 'Parigi, Pangandaran, Jawa Barat', lat: -7.5714, lng: 108.4956 },
  // 32. Untia, Biringkanaya, Kota Makassar, Sulawesi Selatan
  { id: 3032, no: 32, name: 'Untia', region: 'Sulawesi & Gorontalo', location: 'Biringkanaya, Kota Makassar, Sulawesi Selatan', lat: -5.0733, lng: 119.4486 },
  // 33. Balangloe Tarowang, Tarowang, Jeneponto, Sulawesi Selatan
  { id: 3033, no: 33, name: 'Balangloe Tarowang', region: 'Sulawesi & Gorontalo', location: 'Tarowang, Jeneponto, Sulawesi Selatan', lat: -5.6717, lng: 119.8281 },
  // 34. Lancok, Syamtalira Bayu, Aceh Utara, Aceh
  { id: 3034, no: 34, name: 'Lancok', region: 'Sumatera', location: 'Syamtalira Bayu, Aceh Utara, Aceh', lat: 5.1017, lng: 97.0083 },
  // 35. Penago I, Ilir Talo, Seluma, Bengkulu
  { id: 3035, no: 35, name: 'Penago I', region: 'Sumatera', location: 'Ilir Talo, Seluma, Bengkulu', lat: -4.2756, lng: 102.7989 },
  // 36. Bulu Meduro, Bancar, Tuban, Jawa Timur
  { id: 3036, no: 36, name: 'Bulu Meduro', region: 'Jawa & Banten', location: 'Bancar, Tuban, Jawa Timur', lat: -6.8597, lng: 111.6231 },
  // 37. Lateng, Banyuwangi, Banyuwangi, Jawa Timur
  { id: 3037, no: 37, name: 'Lateng', region: 'Jawa & Banten', location: 'Banyuwangi, Banyuwangi, Jawa Timur', lat: -8.2192, lng: 114.3722 },
  // 38. Terapung, Poleang Tenggara, Bombana, Sulawesi Tenggara
  { id: 3038, no: 38, name: 'Terapung', region: 'Sulawesi & Gorontalo', location: 'Poleang Tenggara, Bombana, Sulawesi Tenggara', lat: -4.5700, lng: 121.9567 },
  // 39. Sembulang, Galang, Kota Batam, Kepulauan Riau
  { id: 3039, no: 39, name: 'Sembulang', region: 'Sumatera', location: 'Galang, Kota Batam, Kepulauan Riau', lat: 0.6394, lng: 104.1928 },
  // 40. Karansari, Pakenjeng, Garut, Jawa Barat
  { id: 3040, no: 40, name: 'Karansari', region: 'Jawa & Banten', location: 'Pakenjeng, Garut, Jawa Barat', lat: -7.4028, lng: 107.8594 },
  // 41. Lhok Pawoh, Manggeng, Aceh Barat Daya, Aceh
  { id: 3041, no: 41, name: 'Lhok Pawoh', region: 'Sumatera', location: 'Manggeng, Aceh Barat Daya, Aceh', lat: 3.6967, lng: 96.9317 },
  // 42. Sukorahayu, Labuhan Maringgai, Lampung Timur, Lampung
  { id: 3042, no: 42, name: 'Sukorahayu', region: 'Sumatera', location: 'Labuhan Maringgai, Lampung Timur, Lampung', lat: -5.6022, lng: 105.8461 },
  // 43. Babana, Budong-Budong, Mamuju Tengah, Sulawesi Barat
  { id: 3043, no: 43, name: 'Babana', region: 'Sulawesi & Gorontalo', location: 'Budong-Budong, Mamuju Tengah, Sulawesi Barat', lat: -1.9867, lng: 119.6578 },
  // 44. Ciwaru, Ciemas, Sukabumi, Jawa Barat
  { id: 3044, no: 44, name: 'Ciwaru', region: 'Jawa & Banten', location: 'Ciemas, Sukabumi, Jawa Barat', lat: -7.2211, lng: 106.4625 },
  // 45. Margasari, Labuhan Maringgai, Lampung Timur, Lampung
  { id: 3045, no: 45, name: 'Margasari', region: 'Sumatera', location: 'Labuhan Maringgai, Lampung Timur, Lampung', lat: -5.6158, lng: 105.8683 },
  // 46. Malalanda, Kulisusu, Buton Utara, Sulawesi Tenggara
  { id: 3046, no: 46, name: 'Malalanda', region: 'Sulawesi & Gorontalo', location: 'Kulisusu, Buton Utara, Sulawesi Tenggara', lat: -4.6431, lng: 122.9583 },
  // 47. Dapenda, Batang-Batang, Sumenep, Jawa Timur
  { id: 3047, no: 47, name: 'Dapenda', region: 'Jawa & Banten', location: 'Batang-Batang, Sumenep, Jawa Timur', lat: -6.9817, lng: 114.2175 },
  // 48. Sangowo Timur, Morotai Timur, Pulau Morotai, Maluku Utara
  { id: 3048, no: 48, name: 'Sangowo Timur', region: 'Maluku & Papua', location: 'Morotai Timur, Pulau Morotai, Maluku Utara', lat: 2.2683, lng: 128.4789 },
  // 49. Tanjung Putri, Arut Selatan, Kotawaringin Barat, Kalimantan Tengah
  { id: 3049, no: 49, name: 'Tanjung Putri', region: 'Kalimantan', location: 'Arut Selatan, Kotawaringin Barat, Kalimantan Tengah', lat: -2.7228, lng: 111.6789 },
  // 50. Sumare, Simboro, Mamuju, Sulawesi Barat
  { id: 3050, no: 50, name: 'Sumare', region: 'Sulawesi & Gorontalo', location: 'Simboro, Mamuju, Sulawesi Barat', lat: -2.6761, lng: 118.8622 },
  // 51. Wasileo, Maba Utara, Halmahera Timur, Maluku Utara
  { id: 3051, no: 51, name: 'Wasileo', region: 'Maluku & Papua', location: 'Maba Utara, Halmahera Timur, Maluku Utara', lat: 0.8708, lng: 128.2583 },
  // 52. Katapiang, Batang Anai, Padang Pariaman, Sumatera Barat
  { id: 3052, no: 52, name: 'Katapiang', region: 'Sumatera', location: 'Batang Anai, Padang Pariaman, Sumatera Barat', lat: -0.8433, lng: 100.2178 },
  // 53. Padang Sarai, Koto Tangah, Kota Padang, Sumatera Barat
  { id: 3053, no: 53, name: 'Padang Sarai', region: 'Sumatera', location: 'Koto Tangah, Kota Padang, Sumatera Barat', lat: -0.8789, lng: 100.3411 },
  // 54. Supu, Loloda Utara, Halmahera Utara, Maluku Utara
  { id: 3054, no: 54, name: 'Supu', region: 'Maluku & Papua', location: 'Loloda Utara, Halmahera Utara, Maluku Utara', lat: 1.8894, lng: 127.8211 },
  // 55. Merpas, Nasal, Kaur, Bengkulu
  { id: 3055, no: 55, name: 'Merpas', region: 'Sumatera', location: 'Nasal, Kaur, Bengkulu', lat: -4.9306, lng: 103.3294 },
  // 56. Sekanak Raya, Belakang Padang, Kota Batam, Kepulauan Riau
  { id: 3056, no: 56, name: 'Sekanak Raya', region: 'Sumatera', location: 'Belakang Padang, Kota Batam, Kepulauan Riau', lat: 1.1556, lng: 103.9467 },
  // 57. Aeng Batu-Batu, Galesong Utara, Takalar, Sulawesi Selatan
  { id: 3057, no: 57, name: 'Aeng Batu-Batu', region: 'Sulawesi & Gorontalo', location: 'Galesong Utara, Takalar, Sulawesi Selatan', lat: -5.3083, lng: 119.3978 },
  // 58. Waeilhang, Waplau, Buru, Maluku
  { id: 3058, no: 58, name: 'Waeilhang', region: 'Maluku & Papua', location: 'Waplau, Buru, Maluku', lat: -3.4481, lng: 127.0089 },
  // 59. Kelurahan Kasu, Belakang Padang, Kota Batam, Kepulauan Riau
  { id: 3059, no: 59, name: 'Kelurahan Kasu', region: 'Sumatera', location: 'Belakang Padang, Kota Batam, Kepulauan Riau', lat: 1.1383, lng: 103.9289 },
  // 60. Samkai, Merauke, Merauke, Papua Selatan
  { id: 3060, no: 60, name: 'Samkai', region: 'Maluku & Papua', location: 'Merauke, Merauke, Papua Selatan', lat: -8.4908, lng: 140.4019 },
  // 61. Birem Puntong, Langsa Baro, Kota Langsa, Aceh
  { id: 3061, no: 61, name: 'Birem Puntong', region: 'Sumatera', location: 'Langsa Baro, Kota Langsa, Aceh', lat: 4.4672, lng: 97.9733 },
  // 62. Ujung Said, Jongkong, Kapuas Hulu, Kalimantan Barat
  { id: 3062, no: 62, name: 'Ujung Said', region: 'Kalimantan', location: 'Jongkong, Kapuas Hulu, Kalimantan Barat', lat: 0.5731, lng: 112.1683 },
  // 63. Angkue, Kajuara, Bone, Sulawesi Selatan
  { id: 3063, no: 63, name: 'Angkue', region: 'Sulawesi & Gorontalo', location: 'Kajuara, Bone, Sulawesi Selatan', lat: -4.3050, lng: 120.5561 },
  // 64. Labetawi, Pulau Dullah Utara, Kota Tual, Maluku
  { id: 3064, no: 64, name: 'Labetawi', region: 'Maluku & Papua', location: 'Pulau Dullah Utara, Kota Tual, Maluku', lat: -5.6378, lng: 132.7511 },
  // 65. Gerak Makmur, Sampolawa, Buton Selatan, Sulawesi Tenggara
  { id: 3065, no: 65, name: 'Gerak Makmur', region: 'Sulawesi & Gorontalo', location: 'Sampolawa, Buton Selatan, Sulawesi Tenggara', lat: -5.2256, lng: 122.6833 },
];
