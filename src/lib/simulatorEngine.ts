import type { HasilSimulasi, ParameterSimulasi } from "./types";

export const TARIF_ACUAN_DEFAULT = 5_000;
export const TARIF_MAKSIMUM = 10_000;
export const UNIT_AWAL_U0 = 6;
export const JUMLAH_KORIDOR = 3;
export const TRIP_PER_KORIDOR_PER_HARI = 8;

const KAPASITAS_BUS = 26;
const KAPASITAS_ANGKOT = 10;

export const PARAMETER_SIMULASI_AWAL: ParameterSimulasi = {
  koridorTarget: "SEMUA",
  tarifRupiah: 0,
  tarifAcuanRupiah: TARIF_ACUAN_DEFAULT,
  jumlahBusMedium: 4,
  jumlahAngkotListrik: 6,
  elastisitasTarif_a: 0.25,
  elastisitasFrekuensi_b: 0.35,
  penumpangDasarHarian_P0: 288,
  durasiPutaranMenit_C: 90,
  jamOperasiMenit_J: 900,
  hariOperasiBulanan_D: 30,
};

export const SKENARIO_KONDISI_AWAL: ParameterSimulasi = {
  ...PARAMETER_SIMULASI_AWAL,
  tarifRupiah: 0,
  jumlahBusMedium: 3,
  jumlahAngkotListrik: 3,
};

export const SKENARIO_OKTOBER_2025: ParameterSimulasi = {
  ...PARAMETER_SIMULASI_AWAL,
  tarifRupiah: 0,
  jumlahBusMedium: 4,
  jumlahAngkotListrik: 6,
};

function batasiNilai(nilai: number, minimum: number, maksimum: number): number {
  return Math.min(Math.max(nilai, minimum), maksimum);
}

function rekomendasi(
  unitAktif: number,
  keterisianPersen: number,
  melebihiKapasitas: boolean,
): string {
  if (unitAktif === 0) {
    return "Tidak ada kendaraan aktif. Tambah unit sebelum layanan dijalankan.";
  }
  if (melebihiKapasitas) {
    return `Keterisian ${keterisianPersen.toFixed(0)} persen melebihi kapasitas kursi. Tambah unit atau trip pada jam sibuk.`;
  }
  if (keterisianPersen >= 80) {
    return `Keterisian ${keterisianPersen.toFixed(0)} persen mendekati batas. Siapkan unit cadangan pada jam sibuk.`;
  }
  if (keterisianPersen < 40) {
    return `Keterisian ${keterisianPersen.toFixed(0)} persen masih rendah. Pertimbangkan mengurangi unit atau menyesuaikan frekuensi.`;
  }
  return `Keterisian ${keterisianPersen.toFixed(0)} persen berada dalam rentang wajar untuk simulasi ini.`;
}

export function hitungSimulasi(parameter: ParameterSimulasi): HasilSimulasi {
  const bus = Math.max(0, Math.round(parameter.jumlahBusMedium));
  const angkot = Math.max(0, Math.round(parameter.jumlahAngkotListrik));
  const unitAktif = bus + angkot;
  const jumlahKoridor = parameter.koridorTarget === "SEMUA" ? JUMLAH_KORIDOR : 1;

  // Unit dibagi rata saat target SEMUA. Untuk satu koridor, semua unit dianggap melayani koridor itu.
  const unitKoridor =
    parameter.koridorTarget === "SEMUA" ? unitAktif / JUMLAH_KORIDOR : unitAktif;
  const headwayMenit =
    unitKoridor > 0 ? parameter.durasiPutaranMenit_C / unitKoridor : 0;

  const tarifAcuan = Math.max(1, parameter.tarifAcuanRupiah);
  const faktorTarif = Math.max(
    0.15,
    1 - parameter.elastisitasTarif_a * (parameter.tarifRupiah / tarifAcuan),
  );
  const faktorArmada =
    UNIT_AWAL_U0 > 0 ? (unitAktif / UNIT_AWAL_U0) ** parameter.elastisitasFrekuensi_b : 0;

  const penumpangDasar =
    (parameter.penumpangDasarHarian_P0 / JUMLAH_KORIDOR) * jumlahKoridor;
  const perkiraanPenumpangHarian = Math.max(
    0,
    Math.round(penumpangDasar * faktorTarif * faktorArmada),
  );

  const jumlahTripHarian =
    TRIP_PER_KORIDOR_PER_HARI *
    jumlahKoridor *
    (UNIT_AWAL_U0 > 0 ? unitAktif / UNIT_AWAL_U0 : 0);
  const kapasitasRataRata =
    unitAktif > 0 ? (bus * KAPASITAS_BUS + angkot * KAPASITAS_ANGKOT) / unitAktif : 0;
  const kapasitasHarianTotal = jumlahTripHarian * kapasitasRataRata;

  const tingkatKeterisianPersen =
    kapasitasHarianTotal > 0
      ? (perkiraanPenumpangHarian / kapasitasHarianTotal) * 100
      : 0;
  const melebihiKapasitas = tingkatKeterisianPersen > 100;

  const pendapatanHarianRupiah = Math.round(
    perkiraanPenumpangHarian * Math.max(0, parameter.tarifRupiah),
  );
  const pendapatanBulananRupiah = Math.round(
    pendapatanHarianRupiah * Math.max(0, parameter.hariOperasiBulanan_D),
  );

  const selisihPenumpangPersen =
    penumpangDasar > 0
      ? ((perkiraanPenumpangHarian - penumpangDasar) / penumpangDasar) * 100
      : 0;

  return {
    headwayMenit: Number(headwayMenit.toFixed(1)),
    kapasitasHarianTotal: Math.round(kapasitasHarianTotal),
    perkiraanPenumpangHarian,
    selisihPenumpangPersen: Number(selisihPenumpangPersen.toFixed(1)),
    pendapatanHarianRupiah,
    pendapatanBulananRupiah,
    tingkatKeterisianPersen: Number(tingkatKeterisianPersen.toFixed(1)),
    melebihiKapasitas,
    rekomendasiKebijakan: rekomendasi(
      unitAktif,
      batasiNilai(tingkatKeterisianPersen, 0, 999),
      melebihiKapasitas,
    ),
  };
}
