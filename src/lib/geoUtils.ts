import type { Halte } from "./types";
import { formatDesimal } from "./format";

export interface Koordinat {
  lat: number;
  lng: number;
}

export interface HalteTerdekat {
  halte: Halte;
  jarakKm: number;
  jalanKakiMenit: number;
}

const RADIUS_BUMI_KM = 6371;
const KECEPATAN_JALAN_KAKI_KM_PER_JAM = 4.5;

function derajatKeRadian(derajat: number): number {
  return (derajat * Math.PI) / 180;
}

export function haversineKm(a: Koordinat, b: Koordinat): number {
  const dLat = derajatKeRadian(b.lat - a.lat);
  const dLng = derajatKeRadian(b.lng - a.lng);
  const latA = derajatKeRadian(a.lat);
  const latB = derajatKeRadian(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(dLng / 2) ** 2;

  return 2 * RADIUS_BUMI_KM * Math.asin(Math.sqrt(Math.min(1, h)));
}

export function interpolasiLinear(a: Koordinat, b: Koordinat, t: number): Koordinat {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

export function sebarTitikSepanjangPolyline(
  jangkar: readonly Koordinat[],
  jumlahTitik: number,
): Koordinat[] {
  if (jumlahTitik <= 0 || jangkar.length === 0) return [];
  if (jumlahTitik === 1) return [{ ...jangkar[0] }];

  const panjangSegmen = jangkar.slice(1).map((titik, i) => haversineKm(jangkar[i], titik));
  const total = panjangSegmen.reduce((jumlah, km) => jumlah + km, 0);

  if (total === 0) {
    return Array.from({ length: jumlahTitik }, () => ({ ...jangkar[0] }));
  }

  return Array.from({ length: jumlahTitik }, (_, i) => {
    const target = (total * i) / (jumlahTitik - 1);
    let terlewati = 0;

    for (let s = 0; s < panjangSegmen.length; s += 1) {
      const panjang = panjangSegmen[s];
      if (terlewati + panjang >= target) {
        const t = panjang === 0 ? 0 : (target - terlewati) / panjang;
        return interpolasiLinear(jangkar[s], jangkar[s + 1], t);
      }
      terlewati += panjang;
    }

    return { ...jangkar[jangkar.length - 1] };
  });
}

export function formatJarak(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${formatDesimal(km, 1)} km`;
}

export function estimasiJalanKakiMenit(km: number): number {
  return Math.max(1, Math.ceil((km / KECEPATAN_JALAN_KAKI_KM_PER_JAM) * 60));
}

export function cariHalteTerdekat(
  daftarHalte: readonly Halte[],
  lat: number,
  lng: number,
  batas = 5,
): HalteTerdekat[] {
  return daftarHalte
    .map((halte) => {
      const jarakKm = haversineKm({ lat, lng }, halte);
      return { halte, jarakKm, jalanKakiMenit: estimasiJalanKakiMenit(jarakKm) };
    })
    .sort((a, b) => a.jarakKm - b.jarakKm)
    .slice(0, Math.max(0, batas));
}

export function posisiInterpolasiHalte(daftarHalte: readonly Halte[], indeks: number): Koordinat {
  if (daftarHalte.length === 0) return { lat: 0, lng: 0 };

  const dibatasi = Math.min(Math.max(indeks, 1), daftarHalte.length);
  const bawah = Math.floor(dibatasi);
  const atas = Math.ceil(dibatasi);
  const halteBawah = daftarHalte[bawah - 1];
  const halteAtas = daftarHalte[atas - 1];

  return interpolasiLinear(halteBawah, halteAtas, dibatasi - bawah);
}
