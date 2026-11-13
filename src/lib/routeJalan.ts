import { RUTE_JALAN } from "@/data/ruteJalan";
import type { KoridorId } from "@/lib/types";

interface RuteCache {
  koordinat: Array<[number, number]>;
  jarakTitikM: number[];
  totalM: number;
}

const cache = new Map<KoridorId, RuteCache>();

function jarakMeter(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const rad = (derajat: number) => (derajat * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const lat1 = rad(a[1]);
  const lat2 = rad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function ambilCache(koridorId: KoridorId): RuteCache | null {
  const tersimpan = cache.get(koridorId);
  if (tersimpan) return tersimpan;

  const rute = RUTE_JALAN[koridorId];
  if (!rute) return null;

  const jarakTitikM = [0];
  for (let i = 1; i < rute.koordinat.length; i++) {
    jarakTitikM.push(jarakTitikM[i - 1] + jarakMeter(rute.koordinat[i - 1], rute.koordinat[i]));
  }

  const hasil = {
    koordinat: rute.koordinat,
    jarakTitikM,
    totalM: jarakTitikM[jarakTitikM.length - 1] ?? 0,
  };
  cache.set(koridorId, hasil);
  return hasil;
}

export function posisiDiRute(
  koridorId: KoridorId,
  posisiHalte: number,
): { lat: number; lng: number } | null {
  const cacheRute = ambilCache(koridorId);
  const rute = RUTE_JALAN[koridorId];
  if (!cacheRute || !rute || cacheRute.koordinat.length < 2) return null;

  const jumlahHalte = rute.jarakHalteM.length;
  if (jumlahHalte < 2) return null;

  const posisi = Math.min(Math.max(posisiHalte, 1), jumlahHalte);
  const bawah = Math.min(jumlahHalte, Math.max(1, Math.floor(posisi)));
  const atas = Math.min(jumlahHalte, Math.max(1, Math.ceil(posisi)));
  const pecahan = posisi - bawah;
  const jarakBawah = rute.jarakHalteM[bawah - 1] ?? 0;
  const jarakAtas = rute.jarakHalteM[atas - 1] ?? jarakBawah;
  const targetM = Math.min(
    cacheRute.totalM,
    Math.max(0, jarakBawah + (jarakAtas - jarakBawah) * pecahan),
  );

  let kiri = 0;
  let kanan = cacheRute.jarakTitikM.length - 1;
  while (kiri < kanan) {
    const tengah = Math.floor((kiri + kanan) / 2);
    if (cacheRute.jarakTitikM[tengah] < targetM) kiri = tengah + 1;
    else kanan = tengah;
  }

  const indeks = kiri;
  const titik = cacheRute.koordinat[indeks];
  if (!titik) return null;

  if (indeks === 0) return { lng: titik[0], lat: titik[1] };

  const titikSebelum = cacheRute.koordinat[indeks - 1];
  const jarakSebelum = cacheRute.jarakTitikM[indeks - 1];
  const jarakSekarang = cacheRute.jarakTitikM[indeks];
  const panjang = jarakSekarang - jarakSebelum;
  const rasio = panjang > 0 ? (targetM - jarakSebelum) / panjang : 0;

  return {
    lng: titikSebelum[0] + (titik[0] - titikSebelum[0]) * rasio,
    lat: titikSebelum[1] + (titik[1] - titikSebelum[1]) * rasio,
  };
}

export function cariIndeksHalteTerdekat(
  koridorId: KoridorId,
  lat: number,
  lng: number,
): number {
  const rute = RUTE_JALAN[koridorId];
  if (!rute || rute.jarakHalteM.length === 0) return 1;

  let terdekat = 1;
  let jarakTerdekat = Infinity;

  for (let indeks = 1; indeks <= rute.jarakHalteM.length; indeks += 1) {
    const titik = posisiDiRute(koridorId, indeks);
    if (!titik) continue;

    const jarak = (titik.lat - lat) ** 2 + (titik.lng - lng) ** 2;
    if (jarak < jarakTerdekat) {
      jarakTerdekat = jarak;
      terdekat = indeks;
    }
  }

  return terdekat;
}
