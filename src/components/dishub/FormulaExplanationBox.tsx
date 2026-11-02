"use client";

import { formatAngka, formatDesimal, formatPersen } from "@/lib/format";
import type { HasilSimulasi, ParameterSimulasi } from "@/lib/types";

export function FormulaExplanationBox({
  parameter,
  hasil,
}: {
  parameter: ParameterSimulasi;
  hasil: HasilSimulasi;
}) {
  const bus = Math.round(parameter.jumlahBusMedium);
  const angkot = Math.round(parameter.jumlahAngkotListrik);
  const unit = bus + angkot;
  const jumlahKoridor = parameter.koridorTarget === "SEMUA" ? 3 : 1;
  const unitKoridor = parameter.koridorTarget === "SEMUA" ? unit / 3 : unit;
  const faktorTarif = Math.max(
    0.15,
    1 - parameter.elastisitasTarif_a * (parameter.tarifRupiah / parameter.tarifAcuanRupiah),
  );
  const faktorArmada = unit > 0 ? (unit / 6) ** parameter.elastisitasFrekuensi_b : 0;
  const penumpangDasar =
    (parameter.penumpangDasarHarian_P0 / 3) * jumlahKoridor;
  const jumlahTrip = 8 * jumlahKoridor * (unit / 6);
  const kapasitasRataRata =
    unit > 0 ? (bus * 26 + angkot * 10) / unit : 0;

  return (
    <details className="rounded-xl border border-line bg-surface p-4">
      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 text-sm font-semibold text-ink">
        Bagaimana Angka Ini Dihitung?
        <span className="text-xs font-medium text-ink-muted">Buka rumus</span>
      </summary>

      <div className="mt-3 border-t border-line pt-3">
        <dl className="space-y-2 text-sm leading-relaxed">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-secondary">Unit aktif</dt>
            <dd className="font-mono text-ink">{bus} bus + {angkot} angkot = {unit} unit</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-secondary">Unit per koridor</dt>
            <dd className="font-mono text-ink">{formatDesimal(unitKoridor, 2)} unit</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-secondary">Headway</dt>
            <dd className="font-mono text-ink">
              {parameter.durasiPutaranMenit_C} menit / {formatDesimal(unitKoridor, 2)} ={" "}
              {hasil.headwayMenit} menit
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-secondary">Faktor tarif</dt>
            <dd className="font-mono text-ink">
              max(0,15; 1 - {formatDesimal(parameter.elastisitasTarif_a, 2)} × T/Tacuan) ={" "}
              {formatDesimal(faktorTarif, 2)}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-secondary">Faktor armada</dt>
            <dd className="font-mono text-ink">
              ({unit} / 6) pangkat {formatDesimal(parameter.elastisitasFrekuensi_b, 2)} ={" "}
              {formatDesimal(faktorArmada, 2)}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-secondary">Penumpang harian</dt>
            <dd className="font-mono text-ink">
              round({formatAngka(penumpangDasar)} × {formatDesimal(faktorTarif, 2)} ×{" "}
              {formatDesimal(faktorArmada, 2)}) = {formatAngka(hasil.perkiraanPenumpangHarian)}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-secondary">Kapasitas harian</dt>
            <dd className="font-mono text-ink">
              {formatDesimal(jumlahTrip, 2)} trip × {formatDesimal(kapasitasRataRata, 1)} kursi ={" "}
              {formatAngka(hasil.kapasitasHarianTotal)} kursi
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-secondary">Keterisian</dt>
            <dd className="font-mono text-ink">
              {formatAngka(hasil.perkiraanPenumpangHarian)} /{" "}
              {formatAngka(hasil.kapasitasHarianTotal)} × 100 ={" "}
              {formatPersen(hasil.tingkatKeterisianPersen)}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          P0 adalah 288 penumpang per hari untuk semua koridor, atau 96 untuk satu koridor.
          Untuk satu koridor, seluruh unit dihitung melayani koridor itu. Untuk semua koridor, unit
          dibagi rata. Kalibrasi awal 12 penumpang per trip dari uji coba 2025. Hasil ini proyeksi
          simulasi, bukan prediksi resmi.
        </p>
      </div>
    </details>
  );
}
