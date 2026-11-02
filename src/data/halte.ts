import { sebarTitikSepanjangPolyline, type Koordinat } from "@/lib/geoUtils";
import type { Halte, KoridorId } from "@/lib/types";

const RAWASARI: Koordinat = { lat: -1.5944, lng: 103.6158 };
const SIPIN: Koordinat = { lat: -1.6115, lng: 103.589 };
const SIMPANG_KAWAT: Koordinat = { lat: -1.6235, lng: 103.593 };
const ALAM_BARAJO: Koordinat = { lat: -1.6358, lng: 103.5583 };
const JELUTUNG: Koordinat = { lat: -1.618, lng: 103.631 };
const ASRAMA_HAJI: Koordinat = { lat: -1.6375, lng: 103.6195 };
const PAAL_X: Koordinat = { lat: -1.658, lng: 103.612 };

const NAMA_HALTE: Record<KoridorId, readonly string[]> = {
  K1: [
    "Terminal Rawasari",
    "Saimens Pasar",
    "NH Plaza",
    "Simpang Mangga",
    "Kebun Jahe",
    "SDN 31",
    "D'Boss Laundry (depan Apotek K24)",
    "SDN 9",
    "RS Baiturrahim",
    "Samsung Service Centre",
    "Tribun Jambi",
    "Lorong Nusantara",
    "Toko Permai (depan Dishub Jambi)",
    "Pempek Noni",
    "Agatha Travel",
    "Dinas Damkar",
    "Pempek Mamad (Inti Sehat Medika)",
    "Depan Pasar Keluarga",
    "Indomaret Tugu Juang",
    "STM Bawah",
    "Apotek K24 Sipin",
    "Nusa Indah 1",
    "Transito",
    "Kuburan Cina",
    "Lorong Hidayat",
    "Mitra Bangunan",
    "Azila Store Simpang Rimbo",
    "SDN 205",
    "Dinas Pertanian dan Ketahanan Pangan Kota Jambi",
    "Perwakilan NPM Simpang Rimbo",
    "Terminal Alam Barajo",
  ],
  K2: [
    "Terminal Alam Barajo",
    "Jalan Palang",
    "PT United Tractors",
    "Linda Fashion",
    "Sanjaya Ban",
    "Golden Harvest",
    "Toko Tanah Abang Jambi",
    "UPT BKN Jambi",
    "Lorong Riska Tani",
    "SPBU Kuburan Cina",
    "Kantor Pimpinan Wilayah Muhammadiyah",
    "Kedai Sop Uni Linda",
    "Solo Berseri (STM Atas)",
    "Spartan Plafon (STM Bawah)",
    "ATM BRI Jamtos",
    "Hotel Nusa Wijaya",
    "Pasar Keluarga",
    "Balai Diklat Kejaksaan Tinggi",
    "JCC Simpang Kawat",
    "BRI Simpang Kawat",
    "Lorong Keluarga",
    "Jalan Batam",
    "Indomaret SMPN 5",
    "Hotel Aston",
    "Lappindo",
    "Murni",
    "Benteng",
    "Masjid Agung Al Falah",
    "Pasar Angso Duo",
    "WTC (Starbucks)",
    "Kantor Pos Ancol",
    "RS Bhayangkara",
    "SMPN 1",
    "Terminal Rawasari",
  ],
  K3: [
    "Terminal Rawasari",
    "Jalan Mr. Assaat",
    "MTS Al-Khairiyah",
    "SMPN 2 Kota Jambi",
    "Bank Mandiri",
    "Warung Ahok",
    "Lorong Gerobak",
    "BNN",
    "Jalan Moh. Bafadhal",
    "Pondok Kelapo",
    "Kantor Lurah Jelutung",
    "Pasar Kebun Handil (Alfamart)",
    "Pasar Kebun Handil (SPBU)",
    "SDN 35",
    "Puskesmas Kebun Handil",
    "SDN 77",
    "Asrama Haji Kota Jambi",
    "Dinas Kesehatan Kota Jambi",
    "Poltekes Kemenkes Jambi",
    "GOR Kota Baru",
    "Dinas PU Provinsi Jambi",
    "RS Mitra Kota Jambi",
    "Kantor Camat Kota Baru",
    "Alfamart Pangeran Hidayat",
    "BPK Perwakilan Provinsi Jambi",
    "Fresh Star Buah",
    "Simpang Letmud Sarniem",
    "SMK Taruna",
    "Masjid At-Taqwa",
    "SMAN 8 Kota Jambi",
    "SMPN 18 Kota Jambi",
    "SDN 206 Kota Jambi",
    "Puskesmas Paal X",
    "Warung Lesehan Jempol",
  ],
};

const JANGKAR: Record<KoridorId, readonly Koordinat[]> = {
  K1: [RAWASARI, SIPIN, ALAM_BARAJO],
  K2: [ALAM_BARAJO, SIMPANG_KAWAT, RAWASARI],
  K3: [RAWASARI, JELUTUNG, ASRAMA_HAJI, PAAL_X],
};

function buatHalte(koridorId: KoridorId): Halte[] {
  const daftarNama = NAMA_HALTE[koridorId];
  const koordinat = sebarTitikSepanjangPolyline(JANGKAR[koridorId], daftarNama.length);

  return daftarNama.map((nama, i) => {
    const urutan = i + 1;
    const titik = koordinat[i];

    return {
      id: `${koridorId}-${String(urutan).padStart(2, "0")}`,
      koridorId,
      urutan,
      nama,
      namaSumber: nama,
      lat: Number(titik.lat.toFixed(6)),
      lng: Number(titik.lng.toFixed(6)),
      sumberKoordinat: "perkiraan",
      isTerminal: nama.startsWith("Terminal"),
    };
  });
}

export const HALTE: Halte[] = [
  ...buatHalte("K1"),
  ...buatHalte("K2"),
  ...buatHalte("K3"),
];

export const HALTE_PER_KORIDOR: Record<KoridorId, Halte[]> = {
  K1: HALTE.filter((halte) => halte.koridorId === "K1"),
  K2: HALTE.filter((halte) => halte.koridorId === "K2"),
  K3: HALTE.filter((halte) => halte.koridorId === "K3"),
};

export const HALTE_MAP = new Map(HALTE.map((halte) => [halte.id, halte]));

export function ambilHalte(koridorId: KoridorId, urutan: number): Halte | undefined {
  return HALTE_PER_KORIDOR[koridorId][urutan - 1];
}

export function haltePertama(koridorId: KoridorId): Halte {
  return HALTE_PER_KORIDOR[koridorId][0];
}
