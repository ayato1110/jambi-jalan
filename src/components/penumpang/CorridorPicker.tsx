"use client";

import { KORIDOR } from "@/data/koridor";
import { koridorArah, koridorDasar } from "@/lib/koridorArah";
import type { KoridorId } from "@/lib/types";

export function CorridorPicker({
  nilai,
  onUbah,
  label = "Pilih koridor",
}: {
  nilai: KoridorId;
  onUbah: (koridorId: KoridorId) => void;
  label?: string;
}) {
  const dasar =
    KORIDOR.find((koridor) => koridor.id === koridorDasar(nilai)) ?? KORIDOR[0];
  const balik = nilai !== dasar.id;

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="grid grid-cols-3 gap-2">
        {KORIDOR.map((koridor) => {
          const aktif = koridor.id === dasar.id;

          return (
            <button
              key={koridor.id}
              type="button"
              onClick={() => onUbah(koridorArah(koridor.id, balik))}
              aria-pressed={aktif}
              aria-label={`${koridor.id}, ${koridor.kode}, via ${koridor.via}`}
              className={`min-h-12 rounded-lg border-2 px-2 py-2 text-left transition-colors duration-150 active:translate-y-px ${
                aktif
                  ? "border-line-strong bg-brand-soft"
                  : "border-line bg-surface hover:bg-elevated"
              }`}
            >
              <span
                className="inline-flex rounded-md px-1.5 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: koridor.warnaHex }}
              >
                {koridor.id}
              </span>
              <span
                className="mt-1 block text-[0.6875rem] font-medium leading-tight text-ink-secondary"
                title={koridor.via}
              >
                via {koridor.via.split(",")[0]}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="group"
        aria-label="Arah perjalanan"
        className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-line bg-canvas p-1"
      >
        <button
          type="button"
          onClick={() => onUbah(dasar.id)}
          aria-pressed={!balik}
          className={`min-h-10 rounded-md px-2 text-xs font-semibold ${
            !balik ? "bg-brand text-white" : "text-ink-secondary hover:bg-elevated"
          }`}
        >
          Berangkat
        </button>
        <button
          type="button"
          onClick={() => onUbah(koridorArah(dasar.id, true))}
          aria-pressed={balik}
          className={`min-h-10 rounded-md px-2 text-xs font-semibold ${
            balik ? "bg-brand text-white" : "text-ink-secondary hover:bg-elevated"
          }`}
        >
          Arah balik
        </button>
      </div>
    </fieldset>
  );
}
