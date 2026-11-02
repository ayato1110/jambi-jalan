export type KoridorId = "K1" | "K2" | "K3";
export type StatusKeyakinan = "langsung" | "perkiraan_jadwal" | "tidak_aktif";
export type TingkatKepenuhan = "Longgar" | "Sedang" | "Padat";
export type SumberData = "publik" | "perkiraan" | "contoh" | "asumsi";

export interface Halte {
  id: string;
  koridorId: KoridorId;
  urutan: number;
  nama: string;
  namaSumber: string;
  lat: number;
  lng: number;
  sumberKoordinat: "perkiraan" | "belum-ada";
  isTerminal?: boolean;
}

export interface Koridor {
  id: KoridorId;
  kode: string;
  nama: string;
  asal: string;
  tujuan: string;
  via: string;
  jumlahTitik: number;
  warnaHex: string;
  durasiTempuhMenit: number;
  jarakKmPerkiraan: number;
  sumberUrutan: string;
}

export interface JadwalTrip {
  id: string;
  koridorId: KoridorId;
  nomorTrip: number;
  berangkat: string;
  tiba: string;
  berangkatAlternatif?: string;
  tibaAlternatif?: string;
  catatanWaktu?: string;
  isAsumsiArahBalik: boolean;
  kepenuhan: TingkatKepenuhan;
  alasanKepenuhan: string;
  saranTripLonggar?: string;
}

export interface StatusArmadaAktif {
  busId: string;
  namaArmada: string;
  jenis: "bus_medium" | "angkot_listrik";
  kapasitas: number;
  koridorId: KoridorId;
  tripId: string;
  statusTrip: "terjadwal" | "berjalan" | "selesai" | "terlambat_mulai";
  indeksHalteSekarang: number;
  lat: number;
  lng: number;
  terakhirDiperbaruiMs: number;
  sinyalDiputusSimulasi: boolean;
  antreanOfflineCount: number;
}

export interface ParameterSimulasi {
  koridorTarget: KoridorId | "SEMUA";
  tarifRupiah: number;
  tarifAcuanRupiah: number;
  jumlahBusMedium: number;
  jumlahAngkotListrik: number;
  elastisitasTarif_a: number;
  elastisitasFrekuensi_b: number;
  penumpangDasarHarian_P0: number;
  durasiPutaranMenit_C: number;
  jamOperasiMenit_J: number;
  hariOperasiBulanan_D: number;
}

export interface HasilSimulasi {
  headwayMenit: number;
  kapasitasHarianTotal: number;
  perkiraanPenumpangHarian: number;
  selisihPenumpangPersen: number;
  pendapatanHarianRupiah: number;
  pendapatanBulananRupiah: number;
  tingkatKeterisianPersen: number;
  melebihiKapasitas: boolean;
  rekomendasiKebijakan: string;
}
