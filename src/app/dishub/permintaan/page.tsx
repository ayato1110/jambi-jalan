"use client";

import { useState } from "react";
import { CorridorFilter } from "@/components/dishub/CorridorFilter";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { JAM_PERMINTAAN, PERMINTAAN_CONTOH } from "@/data/contohDishub";
import { HALTE_MAP } from "@/data/halte";
import { KORIDOR_MAP } from "@/data/koridor";
import type { KoridorId } from "@/lib/types";

function gayaSel(nilai: number): string {
  if (nilai >= 80) return "bg-brand-deep text-white";
  if (nilai >= 55) return "bg-brand text-white";
  if (nilai >= 30) return "bg-brand-soft text-brand-deep";
  return "bg-canvas text-ink-secondary";
}

export default function PermintaanPage() {
  const [koridor, setKoridor] = useState<KoridorId>("K1");
  const data = PERMINTAAN_CONTOH[koridor];
  const koridorData = KORIDOR_MAP[koridor];

  const peringkat = data
    .map((baris) => {
      const halte = HALTE_MAP.get(baris.halteId);
      const rata = baris.nilai.reduce((jumlah, nilai) => jumlah + nilai, 0) / baris.nilai.length;
      const puncak = Math.max(...baris.nilai);
      return { ...baris, halte, rata, puncak };
    })
    .filter((baris) => Boolean(baris.halte))
    .sort((a, b) => b.rata - a.rata);

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold text-brand-deep">Dashboard Dishub</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-ink">Analisis Permintaan</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          Pola permintaan halte populer per jam operasional. Matriks ini estimasi operasional untuk
          evaluasi, bukan hasil tap on bus.
        </p>
      </header>

      <section aria-labelledby="judul-heatmap" className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="judul-heatmap" className="text-lg font-semibold text-ink">
              Permintaan Halte x Jam
            </h2>
            <p className="mt-1 text-xs text-ink-secondary">
              {koridorData.kode}, via {koridorData.via}. Skala nilai 0 sampai 100.
            </p>
          </div>
          <HonestyBadge jenis="data-contoh" />
        </div>

        <div className="mt-3">
          <CorridorFilter
            nilai={koridor}
            onUbah={(id) => {
              if (id !== "SEMUA") setKoridor(id);
            }}
          />
        </div>

        <p className="mt-3 text-xs text-ink-secondary md:hidden">
          Geser tabel ke samping untuk melihat semua jam.
        </p>

        <div className="mt-2 overflow-x-auto rounded-lg border border-line md:mt-4">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Matriks permintaan halte populer per jam operasional, estimasi operasional
            </caption>
            <thead className="bg-elevated">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 w-[132px] min-w-[132px] bg-elevated p-3 text-xs font-semibold text-ink md:w-auto md:min-w-[220px] md:text-sm"
                >
                  Halte
                </th>
                {JAM_PERMINTAAN.map((jam) => (
                  <th key={jam} scope="col" className="p-2 text-center font-mono text-xs font-semibold text-ink">
                    {jam}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((baris) => {
                const halte = HALTE_MAP.get(baris.halteId);
                return (
                  <tr key={baris.halteId}>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 w-[132px] min-w-[132px] bg-surface p-3 align-top text-xs font-medium text-ink md:w-auto md:min-w-[220px] md:text-sm"
                    >
                      <span className="block text-xs text-ink-muted">{baris.halteId}</span>
                      {halte?.nama ?? "Halte tidak ditemukan"}
                    </th>
                    {baris.nilai.map((nilai, indeks) => (
                      <td key={`${baris.halteId}-${indeks}`} className="p-1 text-center align-middle">
                        <span
                          className={`inline-flex min-h-8 min-w-9 items-center justify-center rounded px-1 font-mono text-xs font-semibold tabular ${gayaSel(nilai)}`}
                        >
                          {nilai}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-secondary">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded bg-canvas ring-1 ring-line" />
            Rendah 0-29
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded bg-brand-soft ring-1 ring-brand" />
            Sedang 30-54
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded bg-brand" />
            Tinggi 55-79
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded bg-brand-deep" />
            Sangat tinggi 80-100
          </span>
        </div>
      </section>

      <section aria-labelledby="judul-peringkat" className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="judul-peringkat" className="text-lg font-semibold text-ink">
            5 Halte dengan Permintaan Tertinggi
          </h2>
          <HonestyBadge jenis="data-contoh" />
        </div>
        <ol className="mt-3 divide-y divide-line">
          {peringkat.map((baris, indeks) => (
            <li key={baris.halteId} className="flex items-start gap-3 py-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-board font-mono text-sm font-bold text-white">
                {indeks + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{baris.halte?.nama}</p>
                <p className="mt-1 text-xs text-ink-secondary">
                  Rata-rata {baris.rata.toFixed(0)}, puncak {baris.puncak} pada skala 0 sampai 100.
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          Angka permintaan merupakan estimasi operasional. Data tap on bus resmi belum
          dipublikasikan per halte dan per jam.
        </p>
      </section>
    </div>
  );
}
