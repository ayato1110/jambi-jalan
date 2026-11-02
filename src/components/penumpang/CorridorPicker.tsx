"use client";

import { KORIDOR } from "@/data/koridor";
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
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="grid grid-cols-3 gap-2">
        {KORIDOR.map((koridor) => {
          const aktif = koridor.id === nilai;

          return (
            <button
              key={koridor.id}
              type="button"
              onClick={() => onUbah(koridor.id)}
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
    </fieldset>
  );
}
