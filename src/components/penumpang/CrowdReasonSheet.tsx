"use client";

import { useEffect, useRef } from "react";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import type { TingkatKepenuhan } from "@/lib/types";

const GAYA_KEPENUHAN: Record<TingkatKepenuhan, string> = {
  Longgar: "border-brand bg-brand-soft text-brand-deep",
  Sedang: "border-amber bg-amber-soft text-amber-deep",
  Padat: "border-danger bg-danger-soft text-danger-deep",
};

export function labelKepenuhan(kepenuhan: TingkatKepenuhan): string {
  return kepenuhan;
}

export function gayaKepenuhan(kepenuhan: TingkatKepenuhan): string {
  return GAYA_KEPENUHAN[kepenuhan];
}

export function CrowdReasonSheet({
  terbuka,
  onTutup,
  kepenuhan,
  alasan,
  saran,
  nomorTrip,
  jamBerangkat,
}: {
  terbuka: boolean;
  onTutup: () => void;
  kepenuhan: TingkatKepenuhan;
  alasan: string;
  saran?: string;
  nomorTrip: number;
  jamBerangkat: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (terbuka && !dialog.open) {
      dialog.showModal();
    } else if (!terbuka && dialog.open) {
      dialog.close();
    }
  }, [terbuka]);

  return (
    <dialog
      ref={dialogRef}
      className="sheet-dialog"
      aria-labelledby="judul-alasan-kepenuhan"
      onClose={onTutup}
      onClick={(event) => {
        if (event.target === event.currentTarget) onTutup();
      }}
    >
      <div className="rounded-t-xl border border-line bg-surface p-5 shadow-[0_4px_12px_rgba(17,28,24,0.08)] sm:rounded-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-ink-muted">
              Trip {nomorTrip} pukul {jamBerangkat} WIB
            </p>
            <h2 id="judul-alasan-kepenuhan" className="mt-1 text-lg font-semibold text-ink">
              Alasan Estimasi Kepadatan
            </h2>
          </div>
          <button
            type="button"
            onClick={onTutup}
            className="min-h-11 rounded-lg border border-line bg-canvas px-3 text-sm font-semibold text-ink hover:bg-elevated active:translate-y-px"
          >
            Tutup
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-1 text-sm font-semibold ${GAYA_KEPENUHAN[kepenuhan]}`}
          >
            {kepenuhan}
          </span>
          <HonestyBadge jenis="data-contoh" />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{alasan}</p>

        <div className="mt-4 rounded-lg border border-line bg-canvas p-3">
          <p className="text-xs font-semibold text-ink">Saran jam lebih lengang</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
            {saran ?? "Belum ada saran jam lain untuk trip ini."}
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-muted">
          Estimasi ini disusun dari pola jam sibuk, bukan hasil hitung penumpang resmi per halte.
        </p>

        <button
          type="button"
          onClick={onTutup}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep active:translate-y-px"
        >
          Mengerti
        </button>
      </div>
    </dialog>
  );
}
