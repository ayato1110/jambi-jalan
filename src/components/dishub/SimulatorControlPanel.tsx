"use client";

import { CorridorFilter } from "@/components/dishub/CorridorFilter";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import {
  SKENARIO_KONDISI_AWAL,
  SKENARIO_OKTOBER_2025,
} from "@/lib/simulatorEngine";
import type { KoridorId, ParameterSimulasi } from "@/lib/types";
import { formatDesimal, formatRupiah } from "@/lib/format";

function Slider({
  id,
  label,
  nilai,
  min,
  max,
  step,
  tampil,
  onUbah,
}: {
  id: string;
  label: string;
  nilai: number;
  min: number;
  max: number;
  step: number;
  tampil: string;
  onUbah: (nilai: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <span className="font-mono text-sm font-semibold tabular text-ink">{tampil}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={nilai}
        onChange={(event) => onUbah(Number(event.target.value))}
        className="mt-1 h-11 w-full cursor-pointer accent-[var(--brand-primary)]"
      />
    </div>
  );
}

export function SimulatorControlPanel({
  parameter,
  onUbah,
  onSkenario,
  onReset,
}: {
  parameter: ParameterSimulasi;
  onUbah: (perubahan: Partial<ParameterSimulasi>) => void;
  onSkenario: (parameter: ParameterSimulasi) => void;
  onReset: () => void;
}) {
  return (
    <section aria-labelledby="judul-panel-simulasi" className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="judul-panel-simulasi" className="text-lg font-semibold text-ink">
          Panel Simulasi
        </h2>
        <HonestyBadge jenis="asumsi" />
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-ink">Koridor target</p>
        <div className="mt-2">
          <CorridorFilter
            nilai={parameter.koridorTarget}
            onUbah={(nilai) => onUbah({ koridorTarget: nilai as KoridorId | "SEMUA" })}
            termasukSemua
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            onSkenario({ ...SKENARIO_KONDISI_AWAL, koridorTarget: parameter.koridorTarget })
          }
          className="min-h-11 rounded-lg border border-line bg-canvas px-3 text-left text-xs font-semibold text-ink-secondary hover:bg-elevated active:translate-y-px"
        >
          Kondisi Awal (6 Unit, Rp0)
        </button>
        <button
          type="button"
          onClick={() =>
            onSkenario({ ...SKENARIO_OKTOBER_2025, koridorTarget: parameter.koridorTarget })
          }
          className="min-h-11 rounded-lg border border-line bg-canvas px-3 text-left text-xs font-semibold text-ink-secondary hover:bg-elevated active:translate-y-px"
        >
          Skenario +4 Unit Oktober 2025 (10 Unit)
        </button>
      </div>

      <div className="mt-5 space-y-5 border-t border-line pt-4">
        <Slider
          id="tarif"
          label="Tarif per penumpang"
          nilai={parameter.tarifRupiah}
          min={0}
          max={10000}
          step={500}
          tampil={formatRupiah(parameter.tarifRupiah)}
          onUbah={(nilai) => onUbah({ tarifRupiah: nilai })}
        />
        <Slider
          id="bus-medium"
          label="Bus Medium, 26 kursi"
          nilai={parameter.jumlahBusMedium}
          min={0}
          max={12}
          step={1}
          tampil={`${parameter.jumlahBusMedium} unit`}
          onUbah={(nilai) => onUbah({ jumlahBusMedium: nilai })}
        />
        <Slider
          id="angkot-listrik"
          label="Angkot Listrik, 10 kursi"
          nilai={parameter.jumlahAngkotListrik}
          min={0}
          max={18}
          step={1}
          tampil={`${parameter.jumlahAngkotListrik} unit`}
          onUbah={(nilai) => onUbah({ jumlahAngkotListrik: nilai })}
        />
        <Slider
          id="elastisitas-a"
          label="Elastisitas tarif (a)"
          nilai={parameter.elastisitasTarif_a}
          min={0.05}
          max={1}
          step={0.05}
          tampil={formatDesimal(parameter.elastisitasTarif_a, 2)}
          onUbah={(nilai) => onUbah({ elastisitasTarif_a: nilai })}
        />
        <Slider
          id="elastisitas-b"
          label="Elastisitas frekuensi (b)"
          nilai={parameter.elastisitasFrekuensi_b}
          min={0.05}
          max={1.5}
          step={0.05}
          tampil={formatDesimal(parameter.elastisitasFrekuensi_b, 2)}
          onUbah={(nilai) => onUbah({ elastisitasFrekuensi_b: nilai })}
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-elevated active:translate-y-px"
      >
        Reset ke Kondisi Saat Ini (Rp0)
      </button>

      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        Kalibrasi awal memakai 12 penumpang per trip dari uji coba 2025. Angka berubah langsung saat
        slider digeser.
      </p>
    </section>
  );
}
