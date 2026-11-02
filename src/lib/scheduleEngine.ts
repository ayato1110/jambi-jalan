import type { JadwalTrip, KoridorId } from "./types";

export const JAM_OPERASIONAL_MULAI_MENIT = 5 * 60 + 30;
export const JAM_OPERASIONAL_SELESAI_MENIT = 20 * 60 + 30;
export const DURASI_TEMPUH_DEFAULT_MENIT = 45;
const MENIT_PER_HARI = 24 * 60;

export interface TripBerikutnya {
  trip: JadwalTrip;
  menitMenuju: number;
  besok: boolean;
}

export interface StatusLayanan {
  aktif: boolean;
  pesan: string;
  tripBerikutnya: JadwalTrip | null;
  menitMenuju: number;
  besok: boolean;
}

export interface EtaHalte {
  indeksHalte: number;
  etaMenit: number;
  etaJam: string;
  sudahDilewati: boolean;
}

export interface TripDiHalte {
  trip: JadwalTrip;
  tibaMenit: number;
  menitMenuju: number;
  besok: boolean;
}

export function jamKeMenit(jam: string): number {
  const [bagianJam, bagianMenit] = jam.split(":").map(Number);
  return bagianJam * 60 + bagianMenit;
}

export function menitKeJam(menit: number): string {
  const total = ((Math.round(menit) % MENIT_PER_HARI) + MENIT_PER_HARI) % MENIT_PER_HARI;
  const jam = Math.floor(total / 60);
  const sisaMenit = total % 60;
  return `${String(jam).padStart(2, "0")}:${String(sisaMenit).padStart(2, "0")}`;
}

export function jadwalHalteMenit(
  trip: JadwalTrip,
  indeksHalte: number,
  jumlahHalte: number,
  durasiMenit = DURASI_TEMPUH_DEFAULT_MENIT,
): number {
  if (jumlahHalte <= 1) return jamKeMenit(trip.berangkat);

  const posisi = Math.min(Math.max(indeksHalte, 1), jumlahHalte);
  return (
    jamKeMenit(trip.berangkat) +
    Math.round(((posisi - 1) / (jumlahHalte - 1)) * durasiMenit)
  );
}

export function keterlambatanMenit(
  trip: JadwalTrip,
  posisiHalte: number,
  sekarangMenit: number,
  jumlahHalte: number,
  durasiMenit = DURASI_TEMPUH_DEFAULT_MENIT,
): number {
  if (jumlahHalte <= 1) return sekarangMenit - jamKeMenit(trip.berangkat);

  const jadwalPosisi =
    jamKeMenit(trip.berangkat) +
    ((posisiHalte - 1) / (jumlahHalte - 1)) * durasiMenit;

  return sekarangMenit - jadwalPosisi;
}

export function etaHalteMenit(
  trip: JadwalTrip,
  indeksHalte: number,
  posisiHalte: number,
  sekarangMenit: number,
  jumlahHalte: number,
  durasiMenit = DURASI_TEMPUH_DEFAULT_MENIT,
): number {
  const jadwal = jadwalHalteMenit(trip, indeksHalte, jumlahHalte, durasiMenit);
  const delta = keterlambatanMenit(
    trip,
    posisiHalte,
    sekarangMenit,
    jumlahHalte,
    durasiMenit,
  );
  return Math.round(jadwal + delta);
}

export function etaSemuaHalte(
  trip: JadwalTrip,
  posisiHalte: number,
  sekarangMenit: number,
  jumlahHalte: number,
  durasiMenit = DURASI_TEMPUH_DEFAULT_MENIT,
): EtaHalte[] {
  return Array.from({ length: jumlahHalte }, (_, i) => {
    const indeksHalte = i + 1;
    const etaMenit = etaHalteMenit(
      trip,
      indeksHalte,
      posisiHalte,
      sekarangMenit,
      jumlahHalte,
      durasiMenit,
    );

    return {
      indeksHalte,
      etaMenit,
      etaJam: menitKeJam(etaMenit),
      sudahDilewati: indeksHalte < posisiHalte,
    };
  });
}

export function cariTripBerikutnya(
  jadwal: readonly JadwalTrip[],
  koridorId: KoridorId,
  sekarangMenit: number,
): TripBerikutnya | null {
  const daftar = jadwal
    .filter((trip) => trip.koridorId === koridorId)
    .sort((a, b) => jamKeMenit(a.berangkat) - jamKeMenit(b.berangkat));

  if (daftar.length === 0) return null;

  const hariIni = daftar.find((trip) => jamKeMenit(trip.berangkat) >= sekarangMenit);
  if (hariIni) {
    return {
      trip: hariIni,
      menitMenuju: jamKeMenit(hariIni.berangkat) - sekarangMenit,
      besok: false,
    };
  }

  const pertama = daftar[0];
  return {
    trip: pertama,
    menitMenuju: MENIT_PER_HARI - sekarangMenit + jamKeMenit(pertama.berangkat),
    besok: true,
  };
}

export function cariTripBerikutnyaDiHalte(
  jadwal: readonly JadwalTrip[],
  koridorId: KoridorId,
  urutanHalte: number,
  jumlahHalte: number,
  sekarangMenit: number,
  durasiMenit = DURASI_TEMPUH_DEFAULT_MENIT,
  setelahTripId?: string,
): TripDiHalte | null {
  const daftar = jadwal
    .filter((trip) => trip.koridorId === koridorId)
    .sort((a, b) => jamKeMenit(a.berangkat) - jamKeMenit(b.berangkat));

  if (daftar.length === 0) return null;

  const indeksAwal = setelahTripId
    ? daftar.findIndex((trip) => trip.id === setelahTripId) + 1
    : 0;
  const mulai = Math.max(0, indeksAwal);

  const kandidat = daftar
    .slice(mulai)
    .map((trip) => ({
      trip,
      tibaMenit: jadwalHalteMenit(trip, urutanHalte, jumlahHalte, durasiMenit),
    }))
    .find((item) => item.tibaMenit >= sekarangMenit);

  if (kandidat) {
    return {
      ...kandidat,
      menitMenuju: kandidat.tibaMenit - sekarangMenit,
      besok: false,
    };
  }

  const pertama = daftar[mulai] ?? daftar[0];
  const tibaMenit =
    jadwalHalteMenit(pertama, urutanHalte, jumlahHalte, durasiMenit) + MENIT_PER_HARI;

  return {
    trip: pertama,
    tibaMenit,
    menitMenuju: tibaMenit - sekarangMenit,
    besok: true,
  };
}

export function cariTripTerakhir(
  jadwal: readonly JadwalTrip[],
  koridorId: KoridorId,
): JadwalTrip | null {
  const daftar = jadwal.filter((trip) => trip.koridorId === koridorId);
  if (daftar.length === 0) return null;

  return daftar.reduce((terakhir, trip) =>
    jamKeMenit(trip.berangkat) > jamKeMenit(terakhir.berangkat) ? trip : terakhir,
  );
}

export function statusLayanan(
  jadwal: readonly JadwalTrip[],
  koridorId: KoridorId,
  sekarangMenit: number,
): StatusLayanan {
  const berikutnya = cariTripBerikutnya(jadwal, koridorId, sekarangMenit);
  const terakhir = cariTripTerakhir(jadwal, koridorId);
  const jamTerakhir = terakhir ? jamKeMenit(terakhir.berangkat) : 0;

  if (sekarangMenit < JAM_OPERASIONAL_MULAI_MENIT) {
    return {
      aktif: false,
      pesan: "Layanan belum dimulai. Keberangkatan pertama hari ini pukul 05:30.",
      tripBerikutnya: berikutnya?.trip ?? null,
      menitMenuju: berikutnya?.menitMenuju ?? 0,
      besok: false,
    };
  }

  if (sekarangMenit > JAM_OPERASIONAL_SELESAI_MENIT) {
    return {
      aktif: false,
      pesan: "Layanan hari ini selesai. Keberangkatan pertama besok pukul 05:30.",
      tripBerikutnya: berikutnya?.trip ?? null,
      menitMenuju: berikutnya?.menitMenuju ?? 0,
      besok: true,
    };
  }

  if (sekarangMenit > jamTerakhir) {
    return {
      aktif: true,
      pesan: `Tidak ada keberangkatan lagi hari ini. Trip terakhir berangkat pukul ${terakhir?.berangkat ?? "18:00"}.`,
      tripBerikutnya: berikutnya?.trip ?? null,
      menitMenuju: berikutnya?.menitMenuju ?? 0,
      besok: true,
    };
  }

  return {
    aktif: true,
    pesan: berikutnya
      ? `Trip berikutnya pukul ${berikutnya.trip.berangkat}.`
      : "Menunggu jadwal keberangkatan berikutnya.",
    tripBerikutnya: berikutnya?.trip ?? null,
    menitMenuju: berikutnya?.menitMenuju ?? 0,
    besok: berikutnya?.besok ?? false,
  };
}

export function formatHitungMundur(menit: number): string {
  const bulat = Math.max(0, Math.floor(menit));
  if (bulat < 1) return "Kurang dari 1 menit";
  if (bulat < 60) return `${bulat} mnt`;

  const jam = Math.floor(bulat / 60);
  const sisa = bulat % 60;
  return sisa === 0 ? `${jam} jam` : `${jam} jam ${sisa} mnt`;
}

export function formatHitungMundurDetik(detik: number): string {
  const total = Math.max(0, Math.floor(detik));

  if (total < 60) return `${total} dtk`;

  const menit = Math.floor(total / 60);
  const sisaDetik = total % 60;

  if (menit < 60) {
    return `${menit} mnt ${String(sisaDetik).padStart(2, "0")} dtk`;
  }

  const jam = Math.floor(menit / 60);
  const sisaMenit = menit % 60;
  return `${jam} jam ${String(sisaMenit).padStart(2, "0")} mnt`;
}

export function detikKeBerangkatan(
  jadwal: readonly JadwalTrip[],
  koridorId: KoridorId,
  sekarangMenit: number,
  detikTambahan = 0,
): number | null {
  const berikutnya = cariTripBerikutnya(jadwal, koridorId, sekarangMenit);
  if (!berikutnya) return null;
  return Math.max(0, berikutnya.menitMenuju * 60 - detikTambahan);
}
