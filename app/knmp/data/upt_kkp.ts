export interface UptKkpPoint {
  id: number;
  no: number;
  name: string;
  lat: number;
  lng: number;
  region: 'Sumatera' | 'Jawa & Banten' | 'Bali & Nusa Tenggara' | 'Kalimantan' | 'Sulawesi & Gorontalo' | 'Maluku & Papua';
  type: string;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  offset?: [number, number];
}

export const UPT_KKP_38: UptKkpPoint[] = [
  { id: 101, no: 1, name: "Poltek KP Karawang", lat: -6.283934, lng: 107.303435, region: "Jawa & Banten", type: "Politeknik KP", direction: 'top', offset: [0, -8] },
  { id: 102, no: 2, name: "AKKP Wakatobi (Kampus Matahora)", lat: -5.333994, lng: 123.623282, region: "Sulawesi & Gorontalo", type: "Akademi KP", direction: 'top', offset: [0, -8] },
  { id: 103, no: 3, name: "Poltek KP Jembrana", lat: -8.390660, lng: 114.578306, region: "Bali & Nusa Tenggara", type: "Politeknik KP", direction: 'left', offset: [-10, 0] },
  { id: 104, no: 4, name: "Poltek KP Pangandaran", lat: -7.679219, lng: 108.682396, region: "Jawa & Banten", type: "Politeknik KP", direction: 'bottom', offset: [0, 8] },
  { id: 105, no: 5, name: "Poltek KP Dumai", lat: 1.693551, lng: 101.414304, region: "Sumatera", type: "Politeknik KP", direction: 'top', offset: [0, -8] },
  { id: 106, no: 6, name: "Politeknik AUP Jakarta", lat: -6.293804, lng: 106.836334, region: "Jawa & Banten", type: "Politeknik AUP", direction: 'right', offset: [10, 0] },
  { id: 107, no: 7, name: "Poltek KP Sidoarjo", lat: -7.397492, lng: 112.789928, region: "Jawa & Banten", type: "Politeknik KP", direction: 'top', offset: [0, -8] },
  { id: 108, no: 8, name: "BPPP Tegal", lat: -6.855119, lng: 109.152341, region: "Jawa & Banten", type: "BPPP", direction: 'top', offset: [-12, -8] },
  { id: 109, no: 9, name: "BPPP Medan", lat: 3.751116, lng: 98.694687, region: "Sumatera", type: "BPPP", direction: 'top', offset: [0, -8] },
  { id: 110, no: 10, name: "BPPP Bitung", lat: 1.458208, lng: 125.212771, region: "Sulawesi & Gorontalo", type: "BPPP", direction: 'top', offset: [-14, -10] },
  { id: 111, no: 11, name: "Poltek KP Bitung", lat: 1.459220, lng: 125.213289, region: "Sulawesi & Gorontalo", type: "Politeknik KP", direction: 'bottom', offset: [14, 10] },
  { id: 112, no: 12, name: "BR Pemulihan SDI Jatiluhur", lat: -6.532134, lng: 107.392431, region: "Jawa & Banten", type: "Balai Riset", direction: 'left', offset: [-10, 0] },
  { id: 113, no: 13, name: "BR Pemuliaan Ikan Sukamandi", lat: -6.368383, lng: 107.623489, region: "Jawa & Banten", type: "Balai Riset", direction: 'top', offset: [-10, -8] },
  { id: 114, no: 14, name: "BBR Budidaya Laut & PP Gondol", lat: -8.155960, lng: 114.714275, region: "Bali & Nusa Tenggara", type: "Balai Besar Riset", direction: 'right', offset: [10, 0] },
  { id: 115, no: 15, name: "Poltek KP Kupang", lat: -10.222280, lng: 123.512505, region: "Bali & Nusa Tenggara", type: "Politeknik KP", direction: 'top', offset: [-12, -8] },
  { id: 116, no: 16, name: "BRPBAP & PP Maros", lat: -5.003510, lng: 119.589339, region: "Sulawesi & Gorontalo", type: "Balai Riset", direction: 'top', offset: [0, -8] },
  { id: 117, no: 17, name: "Poltek KP Sorong", lat: -0.828993, lng: 131.235254, region: "Maluku & Papua", type: "Politeknik KP", direction: 'top', offset: [-10, -8] },
  { id: 118, no: 18, name: "Poltek KP Bone", lat: -4.478597, lng: 120.380338, region: "Sulawesi & Gorontalo", type: "Politeknik KP", direction: 'top', offset: [0, -8] },
  { id: 119, no: 19, name: "BPPP Banyuwangi", lat: -8.071861, lng: 114.421138, region: "Jawa & Banten", type: "BPPP", direction: 'top', offset: [0, -8] },
  { id: 120, no: 20, name: "BRPPU & PP Palembang", lat: -3.015685, lng: 104.782921, region: "Sumatera", type: "Balai Riset", direction: 'top', offset: [0, -8] },
  { id: 121, no: 21, name: "Balai Diklat Aparatur Sukamandi", lat: -6.369780, lng: 107.622896, region: "Jawa & Banten", type: "Balai Diklat", direction: 'bottom', offset: [10, 8] },
  { id: 122, no: 22, name: "BR Budidaya Ikan Hias Depok", lat: -6.401280, lng: 106.814607, region: "Jawa & Banten", type: "Balai Riset", direction: 'left', offset: [-10, 0] },
  { id: 123, no: 23, name: "BR Perikanan Laut Jakarta (Muara Baru)", lat: -6.110436, lng: 106.801689, region: "Jawa & Banten", type: "Balai Riset", direction: 'top', offset: [0, -8] },
  { id: 124, no: 24, name: "BPPP Ambon", lat: -3.657816, lng: 128.198279, region: "Maluku & Papua", type: "BPPP", direction: 'top', offset: [-10, -8] },
  { id: 125, no: 25, name: "BRPBAT & PP Bogor", lat: -6.590979, lng: 106.800970, region: "Jawa & Banten", type: "Balai Riset", direction: 'bottom', offset: [0, 8] },
  { id: 126, no: 26, name: "SUPMN Waiheru Ambon", lat: -3.631671, lng: 128.220573, region: "Maluku & Papua", type: "SUPMN", direction: 'bottom', offset: [10, 8] },
  { id: 127, no: 27, name: "SUPMN Sorong", lat: -0.878224, lng: 131.262116, region: "Maluku & Papua", type: "SUPMN", direction: 'bottom', offset: [10, 8] },
  { id: 129, no: 29, name: "SUPMN Pariaman", lat: -0.564854, lng: 100.092715, region: "Sumatera", type: "SUPMN", direction: 'top', offset: [0, -8] },
  { id: 130, no: 30, name: "Loka Riset Mekanisasi PHP (Bantul)", lat: -7.890437, lng: 110.373895, region: "Jawa & Banten", type: "Loka Riset", direction: 'bottom', offset: [0, 8] },
  { id: 131, no: 31, name: "SUPMN Pontianak", lat: -0.008589, lng: 109.286741, region: "Kalimantan", type: "SUPMN", direction: 'top', offset: [0, -8] },
  { id: 132, no: 32, name: "SUPMN Ladong Aceh", lat: 5.608946, lng: 95.487379, region: "Sumatera", type: "SUPMN", direction: 'top', offset: [0, -8] },
  { id: 133, no: 33, name: "Loka Perekayasaan Tek. Kelautan Wakatobi", lat: -5.255065, lng: 123.597276, region: "Sulawesi & Gorontalo", type: "Loka Riset", direction: 'bottom', offset: [0, 8] },
  { id: 134, no: 34, name: "Loka Riset Rumput Laut Boalemo", lat: 0.485718, lng: 122.141431, region: "Sulawesi & Gorontalo", type: "Loka Riset", direction: 'top', offset: [0, -8] },
  { id: 135, no: 35, name: "SUPMN Kota Agung", lat: -5.498681, lng: 104.591275, region: "Sumatera", type: "SUPMN", direction: 'bottom', offset: [0, 8] },
  { id: 136, no: 36, name: "Loka Riset SD & Kerentanan Pesisir Padang", lat: -1.027948, lng: 100.398406, region: "Sumatera", type: "Loka Riset", direction: 'bottom', offset: [0, 8] },
  { id: 137, no: 37, name: "SUPMN Tegal", lat: -6.855344, lng: 109.151816, region: "Jawa & Banten", type: "SUPMN", direction: 'bottom', offset: [12, 8] },
  { id: 138, no: 38, name: "Loka Riset Perikanan Tuna Benoa", lat: -8.705274, lng: 115.233410, region: "Bali & Nusa Tenggara", type: "Loka Riset", direction: 'bottom', offset: [0, 8] },
];


// UPT Pendidikan & Pelatihan KP:
// Mencakup BPPP, Balai Diklat, Politeknik KP, Politeknik AUP, Akademi KP, SUPMN
// (tidak termasuk Balai Riset dan Loka Riset)
export const BALAI_PENDIDIKAN_UPT: UptKkpPoint[] = UPT_KKP_38.filter((u) =>
  ['BPPP', 'Balai Diklat', 'Politeknik KP', 'Politeknik AUP', 'Akademi KP', 'SUPMN'].includes(u.type)
);

// Backward-compat alias
export const BALAI_PELATIHAN_UPT = BALAI_PENDIDIKAN_UPT;

// Filter khusus BPPP saja (tidak termasuk Poltek dan SUPMN)
export const BPPP_ONLY_UPT: UptKkpPoint[] = UPT_KKP_38.filter((u) =>
  u.type === 'BPPP' || u.type === 'Balai Diklat'
);

