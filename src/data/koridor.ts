import type { Koridor } from "@/lib/types";

export const KORIDOR: Koridor[] = [
  {
    id: "K1",
    kode: "Koridor 1",
    nama: "Rawasari ke Alam Barajo",
    asal: "Terminal Rawasari",
    tujuan: "Terminal Alam Barajo",
    via: "Sipin",
    jumlahTitik: 31,
    warnaHex: "#0F766E",
    durasiTempuhMenit: 45,
    jarakKmPerkiraan: 13,
    sumberUrutan: "Tribun Jambi, 16 Juli 2025",
  },
  {
    id: "K2",
    kode: "Koridor 2",
    nama: "Alam Barajo ke Rawasari",
    asal: "Terminal Alam Barajo",
    tujuan: "Terminal Rawasari",
    via: "Simpang Kawat",
    jumlahTitik: 34,
    warnaHex: "#1D4ED8",
    durasiTempuhMenit: 45,
    jarakKmPerkiraan: 13,
    sumberUrutan: "Jentik, 29 April 2026",
  },
  {
    id: "K3",
    kode: "Koridor 3",
    nama: "Rawasari ke Paal X",
    asal: "Terminal Rawasari",
    tujuan: "Paal X",
    via: "Jelutung, Kebun Handil, Asrama Haji",
    jumlahTitik: 34,
    warnaHex: "#9333EA",
    durasiTempuhMenit: 45,
    jarakKmPerkiraan: 13,
    sumberUrutan: "Metro Jambi, 24 Juli 2025",
  },
];

export const KORIDOR_MAP = Object.fromEntries(
  KORIDOR.map((koridor) => [koridor.id, koridor]),
) as Record<Koridor["id"], Koridor>;

export function ambilKoridor(id: Koridor["id"]): Koridor {
  return KORIDOR_MAP[id];
}
