"use client";

import { useState } from "react";
import { CorridorFilter } from "@/components/dishub/CorridorFilter";
import { StatCard } from "@/components/dishub/StatCard";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { KETERISIAN_CONTOH } from "@/data/contohDishub";
import { JADWAL_PER_KORIDOR } from "@/data/jadwal";
import { KORIDOR_MAP } from "@/data/koridor";
import { UJI_COBA_2025 } from "@/data/ujiCoba2025";
import { formatAngka, formatPersen } from "@/lib/format";
import type { KoridorId } from "@/lib/types";

export default function KinerjaPage() {
  const [koridor, setKoridor] = useState<KoridorId>("K1");
  const nilai = KETERISIAN_CONTOH[koridor];
  const daftarTrip = JADWAL_PER_KORIDOR[koridor];
  const koridorData = KORIDOR_MAP[koridor];
  const tripLewat = daftarTrip.filter((_, indeks) => (nilai[indeks] ?? 0) >= 80);

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold text-brand-deep">Dashboard Dishub</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-ink">Laporan Kinerja</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          Ringkasan uji coba Trans Bahagia 2025 dan keterisian per trip. Keterisian per trip
          merupakan estimasi operasional.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total penumpang uji coba"
          value={formatAngka(UJI_COBA_2025.totalPenumpang)}
          note={UJI_COBA_2025.periode}
          tone="brand"
        />
        <StatCard
          label="Total trip uji coba"
          value={formatAngka(UJI_COBA_2025.totalTrip)}
          note="Akumulasi seluruh koridor."
        />
        <StatCard
          label="Rata-rata per trip"
          value={`${UJI_COBA_2025.rataRataPenumpangPerTrip} orang`}
          note="Angka operasional dibulatkan dari total."
        />
        <StatCard
          label="Penurunan emisi"
          value={formatPersen(UJI_COBA_2025.penurunanEmisiPersen, 0)}
          note="Angka uji coba 2025, belum diaudit ulang tim."
          tone="amber"
        />
      </div>

      <section aria-labelledby="judul-grafik-kinerja" className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="judul-grafik-kinerja" className="text-lg font-semibold text-ink">
              Keterisian per Trip
            </h2>
            <p className="mt-1 text-xs text-ink-secondary">
              {koridorData.kode}, via {koridorData.via}. Garis putus-putus adalah ambang 80%.
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

        <div className="relative mt-5 h-56 border-b border-line">
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end gap-1 px-1" aria-hidden="true">
            {nilai.map((persen, indeks) => (
              <div key={daftarTrip[indeks]?.id ?? indeks} className="flex h-full flex-1 items-end">
                <div
                  className={`w-full rounded-t ${persen >= 80 ? "bg-danger" : "bg-brand"}`}
                  style={{ height: `${Math.max(2, Math.min(100, persen))}%` }}
                />
              </div>
            ))}
          </div>
          <div
            className="absolute inset-x-0 border-t-2 border-dashed border-danger"
            style={{ bottom: "80%" }}
          >
            <span className="absolute -top-5 right-0 rounded bg-surface px-1 text-[0.625rem] font-semibold text-danger-deep">
              Ambang 80%
            </span>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-8 gap-1 text-center text-[0.625rem] leading-tight">
          {daftarTrip.map((trip, indeks) => (
            <div key={trip.id}>
              <span
                className={`block font-mono font-bold tabular ${
                  (nilai[indeks] ?? 0) >= 80 ? "text-danger-deep" : "text-ink"
                }`}
              >
                {nilai[indeks]}%
              </span>
              <span className="block text-ink-muted">T{trip.nomorTrip}</span>
              <span className="block font-mono text-ink-muted">{trip.berangkat}</span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          Keterisian per trip merupakan estimasi operasional. Agregat uji coba 2025 memuat 36.040
          penumpang dan 3.066 trip.
        </p>
      </section>

      <section
        aria-labelledby="judul-rekomendasi-kinerja"
        className={`rounded-xl border p-4 ${
          tripLewat.length > 0 ? "border-amber bg-amber-soft" : "border-line bg-surface"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="judul-rekomendasi-kinerja"
            className={`text-sm font-semibold ${
              tripLewat.length > 0 ? "text-amber-deep" : "text-ink"
            }`}
          >
            Rekomendasi Penambahan Trip
          </h2>
          <span className="text-xs font-medium text-ink-secondary">
            {tripLewat.length} trip melewati 80%
          </span>
          <HonestyBadge jenis="data-contoh" />
        </div>
        <p
          className={`mt-2 text-sm leading-relaxed ${
            tripLewat.length > 0 ? "text-amber-deep" : "text-ink-secondary"
          }`}
        >
          {tripLewat.length > 0
            ? `Keterisian melewati 80% pada ${tripLewat
                .map((trip) => `Trip ${trip.nomorTrip} pukul ${trip.berangkat}`)
                .join(", ")}. Disarankan menambah trip pada jam tersebut atau menyiapkan unit cadangan.`
            : "Tidak ada trip yang melewati ambang 80% pada estimasi operasional koridor ini."}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Rekomendasi hanya alat bantu evaluasi. Keputusan operasional tetap mengikuti data tap on
          bus dan kebijakan Dishub.
        </p>
      </section>
    </div>
  );
}
