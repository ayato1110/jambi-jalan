export interface RingkasanUjiCoba2025 {
  periode: string;
  totalPenumpang: number;
  totalTrip: number;
  rataRataPenumpangPerTrip: number;
  penurunanEmisiPersen: number;
  sumber: string;
  catatan: string;
  catatanEmisi: string;
}

export const UJI_COBA_2025: RingkasanUjiCoba2025 = {
  periode: "Mei sampai September 2025",
  totalPenumpang: 36040,
  totalTrip: 3066,
  rataRataPenumpangPerTrip: 12,
  penurunanEmisiPersen: 30,
  sumber: "Goodcar, 2025; Kalista, 2025",
  catatan:
    "Angka agregat publik. Rincian penumpang per halte dan per jam tidak dipublikasikan.",
  catatanEmisi:
    "Klaim penurunan emisi 30 persen berasal dari materi Kalista dan belum diaudit ulang oleh tim.",
};

export const RATA_RATA_HITUNG_ULANG =
  UJI_COBA_2025.totalPenumpang / UJI_COBA_2025.totalTrip;

export const PENUMPANG_PER_HARI_UJI_COBA = 288;
export const TRIP_PER_HARI_SELURUH_KORIDOR = 24;
