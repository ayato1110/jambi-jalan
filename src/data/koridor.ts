import type { Koridor } from "@/lib/types";

const K1: Koridor = {
  id: "K1",
  kode: "Koridor 1",
  nama: "Rawasari ke Alam Barajo",
  asal: "Terminal Rawasari",
  tujuan: "Terminal Alam Barajo",
  via: "Sipin",
  jumlahTitik: 30,
  warnaHex: "#0F766E",
  durasiTempuhMenit: 45,
  jarakKmPerkiraan: 13,
  sumberUrutan: "KALISTA, Rute Uji Coba via Sipin",
};

const K1R: Koridor = {
  id: "K1R",
  kode: "Koridor 1 Balik",
  nama: "Alam Barajo ke Rawasari",
  asal: "Terminal Alam Barajo",
  tujuan: "Terminal Rawasari",
  via: "Sipin",
  jumlahTitik: 37,
  warnaHex: "#0F766E",
  durasiTempuhMenit: 45,
  jarakKmPerkiraan: 13,
  sumberUrutan: "KALISTA, Rute Uji Coba via Sipin",
};

const K2: Koridor = {
  id: "K2",
  kode: "Koridor 2",
  nama: "Rawasari ke Alam Barajo",
  asal: "Terminal Rawasari",
  tujuan: "Terminal Alam Barajo",
  via: "Simpang Kawat",
  jumlahTitik: 31,
  warnaHex: "#1D4ED8",
  durasiTempuhMenit: 45,
  jarakKmPerkiraan: 13,
  sumberUrutan: "KALISTA, Rute Uji Coba via Simpang Kawat",
};

const K2R: Koridor = {
  id: "K2R",
  kode: "Koridor 2 Balik",
  nama: "Alam Barajo ke Rawasari",
  asal: "Terminal Alam Barajo",
  tujuan: "Terminal Rawasari",
  via: "Simpang Kawat",
  jumlahTitik: 34,
  warnaHex: "#1D4ED8",
  durasiTempuhMenit: 45,
  jarakKmPerkiraan: 13,
  sumberUrutan: "KALISTA, Rute Uji Coba via Simpang Kawat",
};

const K3: Koridor = {
  id: "K3",
  kode: "Koridor 3",
  nama: "Rawasari ke Paal X",
  asal: "Terminal Rawasari",
  tujuan: "Paal X",
  via: "Jelutung, Kebun Handil, Asrama Haji",
  jumlahTitik: 33,
  warnaHex: "#9333EA",
  durasiTempuhMenit: 45,
  jarakKmPerkiraan: 13,
  sumberUrutan: "KALISTA, Rute Uji Coba Rawasari ke Paal X",
};

const K3R: Koridor = {
  id: "K3R",
  kode: "Koridor 3 Balik",
  nama: "Paal X ke Rawasari",
  asal: "Paal X",
  tujuan: "Terminal Rawasari",
  via: "Asrama Haji, Kebun Handil, Jelutung",
  jumlahTitik: 33,
  warnaHex: "#9333EA",
  durasiTempuhMenit: 45,
  jarakKmPerkiraan: 13,
  sumberUrutan: "KALISTA, Rute Uji Coba Paal X ke Rawasari",
};

export const KORIDOR: Koridor[] = [K1, K2, K3];
export const KORIDOR_SEMUA: Koridor[] = [K1, K1R, K2, K2R, K3, K3R];

export const KORIDOR_MAP = Object.fromEntries(
  KORIDOR_SEMUA.map((koridor) => [koridor.id, koridor]),
) as Record<Koridor["id"], Koridor>;

export function ambilKoridor(id: Koridor["id"]): Koridor {
  return KORIDOR_MAP[id];
}
