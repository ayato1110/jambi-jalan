"use client";

import { useState } from "react";
import { menitKeJam } from "@/lib/scheduleEngine";

const PRESET = [
  { label: "Pagi 06.50", menit: 6 * 60 + 50 },
  { label: "Siang 14.15", menit: 14 * 60 + 15 },
  { label: "Malam 21.00", menit: 21 * 60 },
];

export function SimClockBar({
  nilaiMenit,
  jamSimulasiMenit,
  onUbah,
  onReset,
}: {
  nilaiMenit: number;
  jamSimulasiMenit: number | null;
  onUbah: (menit: number) => void;
  onReset: () => void;
}) {
  const nilai = Math.min(1439, Math.max(0, Math.round(nilaiMenit)));
  const aktif = jamSimulasiMenit !== null;
  const [terbuka, setTerbuka] = useState(false);

  return (
    <section
      aria-label="Simulasi waktu operasional"
      className="rounded-xl border border-line bg-surface p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            Waktu Operasional:{" "}
            <span className="font-mono text-lg font-bold tabular">{menitKeJam(nilai)} WIB</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            {aktif ? "Waktu uji aktif." : "Mengikuti waktu perangkat."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTerbuka((nilaiTerbuka) => !nilaiTerbuka)}
            aria-expanded={terbuka}
            aria-controls="pengatur-waktu-operasional"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong bg-surface px-3 text-xs font-semibold text-ink hover:bg-elevated active:translate-y-px"
          >
            {terbuka ? "Tutup Pengatur" : "Atur Waktu Uji"}
          </button>
          {aktif ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand bg-brand-soft px-3 text-xs font-semibold text-brand-deep hover:bg-elevated active:translate-y-px"
            >
              Waktu Sekarang
            </button>
          ) : null}
        </div>
      </div>

      {terbuka ? (
        <div id="pengatur-waktu-operasional" className="mt-4 border-t border-line pt-4">
          <p className="text-sm font-semibold text-ink">Simulasi Waktu Operasional</p>
          <label
            htmlFor="simulasi-waktu"
            className="mt-2 block text-xs font-medium text-ink-secondary"
          >
            Uji jadwal pada jam operasional berbeda
          </label>
          <input
            id="simulasi-waktu"
            type="range"
            min={0}
            max={1439}
            step={5}
            value={nilai}
            onChange={(event) => onUbah(Number(event.target.value))}
            aria-describedby="catatan-simulasi-waktu"
            aria-label="Atur simulasi waktu operasional"
            className="mt-1 h-11 w-full cursor-pointer accent-[var(--brand-primary)]"
          />

          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET.map((preset) => (
              <button
                key={preset.menit}
                type="button"
                onClick={() => onUbah(preset.menit)}
                className="min-h-11 rounded-lg border border-line bg-canvas px-3 text-xs font-semibold text-ink-secondary hover:bg-elevated active:translate-y-px"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p id="catatan-simulasi-waktu" className="mt-2 text-xs leading-relaxed text-ink-muted">
            Mengubah tampilan jadwal di layar, bukan waktu perangkat.
          </p>
        </div>
      ) : null}
    </section>
  );
}
