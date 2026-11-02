import type { JadwalTrip, KoridorId, TingkatKepenuhan } from "@/lib/types";

interface DefinisiTrip {
  nomorTrip: number;
  berangkat: string;
  tiba: string;
  berangkatAlternatif?: string;
  tibaAlternatif?: string;
  catatanWaktu?: string;
  kepenuhan: TingkatKepenuhan;
  alasanKepenuhan: string;
  saranTripLonggar?: string;
}

const DEFINISI_TRIP: DefinisiTrip[] = [
  {
    nomorTrip: 1,
    berangkat: "05:30",
    tiba: "06:15",
    kepenuhan: "Sedang",
    alasanKepenuhan: "pelajar dan pekerja shift pagi.",
  },
  {
    nomorTrip: 2,
    berangkat: "07:00",
    tiba: "07:45",
    kepenuhan: "Padat",
    alasanKepenuhan: "jam masuk sekolah dan kantor.",
    saranTripLonggar: "Naik Trip 1 pukul 05:30 atau Trip 3 pukul 08:30.",
  },
  {
    nomorTrip: 3,
    berangkat: "08:30",
    tiba: "09:15",
    kepenuhan: "Longgar",
    alasanKepenuhan: "waktu ideal untuk lansia dan belanja pasar.",
  },
  {
    nomorTrip: 4,
    berangkat: "10:00",
    tiba: "10:45",
    kepenuhan: "Longgar",
    alasanKepenuhan: "waktu ideal di luar jam sibuk.",
  },
  {
    nomorTrip: 5,
    berangkat: "13:00",
    tiba: "13:45",
    tibaAlternatif: "14:30",
    catatanWaktu: "Terdapat dua versi waktu tiba: 13:45 atau 14:30.",
    kepenuhan: "Sedang",
    alasanKepenuhan: "jam pulang sekolah siang.",
  },
  {
    nomorTrip: 6,
    berangkat: "14:30",
    tiba: "15:15",
    berangkatAlternatif: "15:30",
    tibaAlternatif: "16:30",
    catatanWaktu:
      "Terdapat dua versi waktu: berangkat 14:30 atau 15:30, tiba 15:15 atau 16:30.",
    kepenuhan: "Padat",
    alasanKepenuhan: "jam pulang pelajar dan pegawai.",
    saranTripLonggar: "Naik Trip 5 pukul 13:00 atau Trip 7 pukul 16:00.",
  },
  {
    nomorTrip: 7,
    berangkat: "16:00",
    tiba: "16:45",
    berangkatAlternatif: "17:30",
    tibaAlternatif: "18:30",
    catatanWaktu:
      "Terdapat dua versi waktu: berangkat 16:00 atau 17:30, tiba 16:45 atau 18:30.",
    kepenuhan: "Sedang",
    alasanKepenuhan: "pekerja sore.",
  },
  {
    nomorTrip: 8,
    berangkat: "18:00",
    tiba: "18:45",
    berangkatAlternatif: "19:30",
    tibaAlternatif: "20:30",
    catatanWaktu:
      "Terdapat dua versi waktu: berangkat 18:00 atau 19:30, tiba 18:45 atau 20:30.",
    kepenuhan: "Longgar",
    alasanKepenuhan: "trip terakhir hari ini.",
  },
];

const CATATAN_ARAH_BALIK =
  "Jadwal arah Alam Barajo ke Rawasari mengikuti asumsi operasional.";

const KORIDOR: KoridorId[] = ["K1", "K2", "K3"];

export const JADWAL_TRIP: JadwalTrip[] = KORIDOR.flatMap((koridorId) =>
  DEFINISI_TRIP.map((trip) => ({
    id: `${koridorId}-T${trip.nomorTrip}`,
    koridorId,
    nomorTrip: trip.nomorTrip,
    berangkat: trip.berangkat,
    tiba: trip.tiba,
    berangkatAlternatif: trip.berangkatAlternatif,
    tibaAlternatif: trip.tibaAlternatif,
    catatanWaktu:
      koridorId === "K2"
        ? [trip.catatanWaktu, CATATAN_ARAH_BALIK].filter(Boolean).join(" ")
        : trip.catatanWaktu,
    isAsumsiArahBalik: koridorId === "K2",
    kepenuhan: trip.kepenuhan,
    alasanKepenuhan: trip.alasanKepenuhan,
    saranTripLonggar: trip.saranTripLonggar,
  })),
);

export const JADWAL_PER_KORIDOR: Record<KoridorId, JadwalTrip[]> = {
  K1: JADWAL_TRIP.filter((trip) => trip.koridorId === "K1"),
  K2: JADWAL_TRIP.filter((trip) => trip.koridorId === "K2"),
  K3: JADWAL_TRIP.filter((trip) => trip.koridorId === "K3"),
};

export const JADWAL_MAP = new Map(JADWAL_TRIP.map((trip) => [trip.id, trip]));

export function ambilTrip(koridorId: KoridorId, nomorTrip: number): JadwalTrip | undefined {
  return JADWAL_PER_KORIDOR[koridorId].find((trip) => trip.nomorTrip === nomorTrip);
}
