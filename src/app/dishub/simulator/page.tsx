"use client";

import { FormulaExplanationBox } from "@/components/dishub/FormulaExplanationBox";
import { SimulatorControlPanel } from "@/components/dishub/SimulatorControlPanel";
import { SimulatorImpactCards } from "@/components/dishub/SimulatorImpactCards";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import {
  PARAMETER_SIMULASI_AWAL,
  hitungSimulasi,
} from "@/lib/simulatorEngine";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

export default function SimulatorPage() {
  const parameter = useJambiJalanStore((state) => state.parameterSimulasi);
  const setParameterSimulasi = useJambiJalanStore((state) => state.setParameterSimulasi);

  const hasil = hitungSimulasi(parameter);
  const baseline = hitungSimulasi({
    ...PARAMETER_SIMULASI_AWAL,
    koridorTarget: parameter.koridorTarget,
  });
  const resetParameter = () =>
    setParameterSimulasi({
      ...PARAMETER_SIMULASI_AWAL,
      koridorTarget: parameter.koridorTarget,
    });

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold text-brand-deep">Dashboard Dishub</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-ink">
          Simulator Tarif &amp; Armada
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          Ubah tarif dan jumlah unit untuk melihat proyeksi penumpang, pendapatan, headway, dan
          keterisian kursi. Simulasi dihitung menggunakan model elastisitas permintaan dan parameter
          kapasitas armada untuk mendukung evaluasi kebijakan tarif Dishub Kota Jambi.
        </p>
      </header>

      <div role="note" className="rounded-xl border border-amber bg-amber-soft p-4 text-amber-deep">
        <div className="flex flex-wrap items-center gap-2">
          <HonestyBadge jenis="asumsi" />
          <p className="text-sm font-semibold">
            ASUMSI SIMULASI: Bahan diskusi kebijakan, bukan prediksi resmi.
          </p>
        </div>
        <p className="mt-1 text-xs leading-relaxed">
          Semua angka berasal dari rumus dan asumsi yang dapat diubah. Bukan penetapan tarif dan
          bukan janji jumlah penumpang.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_1fr] xl:items-start">
        <div className="min-w-0 xl:sticky xl:top-4">
          <SimulatorControlPanel
            parameter={parameter}
            onUbah={setParameterSimulasi}
            onSkenario={setParameterSimulasi}
            onReset={resetParameter}
          />
        </div>

        <div className="min-w-0 space-y-4">
          <SimulatorImpactCards hasil={hasil} baseline={baseline} />
          <FormulaExplanationBox parameter={parameter} hasil={hasil} />
          <p className="text-xs leading-relaxed text-ink-muted">
            Kalibrasi awal memakai hasil uji coba operasional 2025: rata-rata 12 penumpang per
            trip, 8 trip per koridor, 3 koridor, dan 30 hari operasi per bulan. Nilai parameter
            tersimpan di perangkat ini.
          </p>
        </div>
      </div>
    </div>
  );
}
