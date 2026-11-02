"use client";

import { KORIDOR } from "@/data/koridor";
import type { KoridorId } from "@/lib/types";

export function CorridorFilter({
  nilai,
  onUbah,
  termasukSemua = false,
}: {
  nilai: KoridorId | "SEMUA";
  onUbah: (nilai: KoridorId | "SEMUA") => void;
  termasukSemua?: boolean;
}) {
  const opsi: Array<{ id: KoridorId | "SEMUA"; label: string; warna?: string }> = [
    ...(termasukSemua ? [{ id: "SEMUA" as const, label: "Semua Koridor" }] : []),
    ...KORIDOR.map((koridor) => ({
      id: koridor.id,
      label: koridor.id,
      warna: koridor.warnaHex,
    })),
  ];

  return (
    <div role="group" aria-label="Pilih koridor" className="flex flex-wrap gap-2">
      {opsi.map((item) => {
        const aktif = item.id === nilai;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onUbah(item.id)}
            aria-pressed={aktif}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold active:translate-y-px ${
              aktif
                ? "border-line-strong bg-brand-soft text-brand-deep"
                : "border-line bg-surface text-ink-secondary hover:bg-elevated"
            }`}
          >
            {item.warna ? (
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: item.warna }}
                aria-hidden="true"
              />
            ) : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
