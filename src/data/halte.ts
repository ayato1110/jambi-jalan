import { sebarTitikSepanjangPolyline, type Koordinat } from "@/lib/geoUtils";
import { KOORDINAT_K1, KOORDINAT_K1R } from "@/data/k1Kml";
import { KOORDINAT_K2, KOORDINAT_K2R } from "@/data/k2Kml";
import { KOORDINAT_K3, KOORDINAT_K3R } from "@/data/k3Kml";
import type { Halte, KoridorId } from "@/lib/types";

const RAWASARI: Koordinat = { lat: -1.5944, lng: 103.6158 };
const SIPIN: Koordinat = { lat: -1.6115, lng: 103.589 };
const SIMPANG_KAWAT: Koordinat = { lat: -1.6235, lng: 103.593 };
const ALAM_BARAJO: Koordinat = { lat: -1.6358, lng: 103.5583 };
const JELUTUNG: Koordinat = { lat: -1.618, lng: 103.631 };
const ASRAMA_HAJI: Koordinat = { lat: -1.6375, lng: 103.6195 };
const PAAL_X: Koordinat = { lat: -1.658, lng: 103.612 };
const JALAN_ASSAAT: Koordinat = { lat: -1.5962, lng: 103.617 };

const NAMA_K3 = [
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
  "Kantor Lurah Kebun Handil (SPBU)",
  "SDN 35",
  "Puskesmas Kebun Handil",
  "SDN 77",
  "Asrama Haji Kota Jambi",
  "Dinas Kesehatan Kota Jambi",
  "Poltekkes Kemenkes Jambi",
  "GOR Kota Baru Jambi",
  "Dinas PU Provinsi Jambi",
  "RS Mitra Kota Jambi",
  "Kantor Camat Kotabaru",
  "Alfamart Pangeran Hidayat",
  "BPK Perwakilan Provinsi Jambi",
  "Fresh Star",
  "Simpang Letmud Sarniem",
  "SMK Taruna",
  "Masjid At Taqwa",
  "SMAN 8 Kota Jambi",
  "SMPN 18 Kota Jambi",
  "SDN 206 Kota Jambi",
  "Puskesmas Paal X",
  "Warung Lesehan Jempol",
] as const;

const NAMA_HALTE: Record<KoridorId, readonly string[]> = {
  K1: [
    "Terminal Rawasari",
    "Saimens Pasar",
    "NH Plaza",
    "Simpang Mangga",
    "Halte Trans Bahagia Kebun Jahe",
    "SDN 31",
    "D'Boss Laundry (Depan Apotik K24)",
    "Taman Simpang Pulai",
    "Masjid Azizi",
    "RM Sederhana",
    "Pempek Selamat",
    "Cosera Resto",
    "Kantor OJK",
    "Honda Sipin",
    "Universitas NH",
    "Kerinci Permata Motor",
    "Indomaret Tugu Juang",
    "Taman Tugu Juang",
    "STM Bawah",
    "Apotek K24 Sipin",
    "Nusa Indah 1",
    "Transito",
    "Kuburan Cina",
    "Lorong Hidayat",
    "Mitra Bangunan",
    "Azila Store Simpang Rimbo",
    "SDN 205",
    "Dinas Pertanian dan Ketahanan Pangan (DPKP) Kota Jambi",
    "Perwakilan NPM Simpang Rimbo",
    "Terminal Alam Barajo",
  ],
  K1R: [
    "Terminal Alam Barajo",
    "Jalan Pelangi",
    "PT United Tractors",
    "Linda Fashion",
    "Sanjaya Ban",
    "Golden Harvest",
    "Toko Tanah Abang Jambi",
    "UPT BKN Jambi",
    "Lorong Riska Tani",
    "SPBU Kuburan Cina",
    "Kantor Pimpinan Wilayah Muhammadiyah Jambi",
    "Kedai Sop Uni Linda",
    "Solo Berseri (STM Atas)",
    "Spartan Plafon (STM Bawah)",
    "ATM BRI Jamtos",
    "Hotel Nusa Wijaya",
    "Masjid Nurdin Hamzah",
    "STMIK NH",
    "Lorong Diamond",
    "Pasar TAC",
    "Kantor Telkom",
    "Saung Kito Sipin",
    "SMA Ferdy Ferry Putra",
    "Gramedia",
    "SPBU Kebun Jeruk",
    "Alfamart Kebun Jeruk",
    "Hotel Aston",
    "Leppindo",
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
  K2: [
    "Terminal Rawasari",
    "Saimens Pasar",
    "NH Plaza",
    "Simpang Mangga",
    "Kebun Jahe",
    "SDN 31",
    "D'Boss Laundry (Depan Apotik K24)",
    "SDN 9",
    "RS Baiturrahim",
    "Samsung Service Centre",
    "Tribun Jambi",
    "Lorong Nusantara",
    "Toko Permai (Depan Dishub Jambi)",
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
  K2R: [
    "Terminal Alam Barajo",
    "Jalan Pelangi",
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
    "Leppindo",
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
  K3: NAMA_K3,
  K3R: [...NAMA_K3].reverse(),
};

const JANGKAR: Record<KoridorId, readonly Koordinat[]> = {
  K1: [RAWASARI, SIPIN, ALAM_BARAJO],
  K1R: [ALAM_BARAJO, SIPIN, RAWASARI],
  K2: [RAWASARI, SIMPANG_KAWAT, ALAM_BARAJO],
  K2R: [ALAM_BARAJO, SIMPANG_KAWAT, RAWASARI],
  K3: [JALAN_ASSAAT, JELUTUNG, ASRAMA_HAJI, PAAL_X],
  K3R: [PAAL_X, ASRAMA_HAJI, JELUTUNG, JALAN_ASSAAT],
};

function buatHalte(koridorId: KoridorId): Halte[] {
  const daftarNama = NAMA_HALTE[koridorId];
  const koordinat = sebarTitikSepanjangPolyline(JANGKAR[koridorId], daftarNama.length);

  return daftarNama.map((nama, i) => {
    const urutan = i + 1;
    const kml =
      koridorId === "K1"
        ? KOORDINAT_K1[i]
        : koridorId === "K1R"
          ? KOORDINAT_K1R[i]
          : koridorId === "K2"
            ? KOORDINAT_K2[i]
            : koridorId === "K2R"
              ? KOORDINAT_K2R[i]
              : koridorId === "K3"
                ? KOORDINAT_K3[i]
                : koridorId === "K3R"
                  ? KOORDINAT_K3R[i]
                  : null;
    const titik = kml ?? koordinat[i];

    return {
      id: `${koridorId}-${String(urutan).padStart(2, "0")}`,
      koridorId,
      urutan,
      nama,
      namaSumber: nama,
      lat: Number(titik.lat.toFixed(6)),
      lng: Number(titik.lng.toFixed(6)),
      sumberKoordinat: kml ? "publik" : "perkiraan",
      isTerminal: nama.startsWith("Terminal"),
    };
  });
}

export const HALTE: Halte[] = [
  ...buatHalte("K1"),
  ...buatHalte("K1R"),
  ...buatHalte("K2"),
  ...buatHalte("K2R"),
  ...buatHalte("K3"),
  ...buatHalte("K3R"),
];

export const HALTE_PER_KORIDOR: Record<KoridorId, Halte[]> = {
  K1: HALTE.filter((halte) => halte.koridorId === "K1"),
  K1R: HALTE.filter((halte) => halte.koridorId === "K1R"),
  K2: HALTE.filter((halte) => halte.koridorId === "K2"),
  K2R: HALTE.filter((halte) => halte.koridorId === "K2R"),
  K3: HALTE.filter((halte) => halte.koridorId === "K3"),
  K3R: HALTE.filter((halte) => halte.koridorId === "K3R"),
};

export const HALTE_MAP = new Map(HALTE.map((halte) => [halte.id, halte]));

export function ambilHalte(koridorId: KoridorId, urutan: number): Halte | undefined {
  return HALTE_PER_KORIDOR[koridorId][urutan - 1];
}

export function haltePertama(koridorId: KoridorId): Halte | undefined {
  return HALTE_PER_KORIDOR[koridorId][0];
}
