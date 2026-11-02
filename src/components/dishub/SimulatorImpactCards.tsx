"use client";

import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { StatCard } from "@/components/dishub/StatCard";
import { formatAngka, formatDesimal, formatPersen, formatRupiah } from "@/lib/format";
import type { HasilSimulasi } from "@/lib/types";

function selisihPersen(nilai: number, dasar: number): number {
  return dasar > 0 ? ((nilai - dasar) / dasar) * 100 : 0;
}

function lebarBar(nilai: number, maksimum: number): string {
  if (nilai <= 0) return "0%";
  return `${Math.max(2, (nilai / maksimum) * 100)}%`;
}

function BarisPerbandingan({
  label,
  saatIni,
  simulasi,
  format,
}: {
  label: string;
  saatIni: number;
  simulasi: number;
  format: (nilai: number) => string;
}) {
  const maksimum = Math.max(1, saatIni, simulasi);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-secondary">
          Saat ini {format(saatIni)}, simulasi {format(simulasi)}
        </p>
      </div>
      <div className="mt-2 space-y-1" aria-hidden="true">
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[0.625rem] font-medium text-ink-muted">Saat ini</span>
          <span className="h-2 flex-1 rounded-full bg-elevated">
            <span
              className="block h-2 rounded-full bg-ink/45"
              style={{ width: lebarBar(saatIni, maksimum) }}
            />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[0.625rem] font-medium text-brand-deep">Simulasi</span>
          <span className="h-2 flex-1 rounded-full bg-brand-soft">
            <span
              className="block h-2 rounded-full bg-brand"
              style={{ width: lebarBar(simulasi, maksimum) }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

export function SimulatorImpactCards({
  hasil,
  baseline,
}: {
  hasil: HasilSimulasi;
  baseline: HasilSimulasi;
}) {
  const deltaPenumpang = selisihPersen(
    hasil.perkiraanPenumpangHarian,
    baseline.perkiraanPenumpangHarian,
  );
  const deltaPendapatan = selisihPersen(
    hasil.pendapatanBulananRupiah,
    baseline.pendapatanBulananRupiah,
  );
  const selisihHeadway = hasil.headwayMenit - baseline.headwayMenit;
  const selisihKeterisian = hasil.tingkatKeterisianPersen - baseline.tingkatKeterisianPersen;
  const catatanPendapatan =
    baseline.pendapatanBulananRupiah > 0
      ? `${deltaPendapatan >= 0 ? "+" : ""}${formatPersen(deltaPendapatan)} dibanding kondisi saat ini.`
      : hasil.pendapatanBulananRupiah > 0
        ? "Naik dari Rp0 pada kondisi saat ini."
        : "Sama dengan kondisi saat ini (Rp0).";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">Hasil Simulasi</h2>
        <HonestyBadge jenis="asumsi" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label="Proyeksi penumpang per hari"
          value={formatAngka(hasil.perkiraanPenumpangHarian)}
          note={`${deltaPenumpang >= 0 ? "+" : ""}${formatPersen(deltaPenumpang)} dibanding kondisi saat ini.`}
          tone="brand"
        />
        <StatCard
          label="Jarak antar bus / headway"
          value={`${hasil.headwayMenit} menit`}
          note={
            Math.abs(selisihHeadway) < 0.05
              ? "Sama dengan kondisi saat ini."
              : `${selisihHeadway < 0 ? "Lebih pendek" : "Lebih panjang"} ${formatDesimal(Math.abs(selisihHeadway), 1)} menit.`
          }
          tone="neutral"
        />
        <StatCard
          label="Pendapatan per bulan"
          value={formatRupiah(hasil.pendapatanBulananRupiah)}
          note={catatanPendapatan}
          tone="neutral"
        />
        <StatCard
          label="Rata-rata keterisian kursi"
          value={formatPersen(hasil.tingkatKeterisianPersen)}
          note={`${selisihKeterisian >= 0 ? "+" : ""}${formatPersen(selisihKeterisian)} poin dari kondisi saat ini.`}
          tone={hasil.melebihiKapasitas ? "danger" : "brand"}
        />
      </div>

      {hasil.melebihiKapasitas ? (
        <section role="alert" className="rounded-xl border border-danger bg-danger-soft p-4 text-danger-deep">
          <h2 className="text-sm font-semibold">Permintaan melebihi kapasitas kursi</h2>
          <p className="mt-1 text-sm leading-relaxed">
            {hasil.rekomendasiKebijakan} Sesuaikan tarif jika perlu.
          </p>
        </section>
      ) : null}

      <section aria-labelledby="judul-grafik-simulasi" className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="judul-grafik-simulasi" className="text-lg font-semibold text-ink">
            Perbandingan Skenario
          </h2>
          <HonestyBadge jenis="asumsi" />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
          Bar abu-abu adalah kondisi saat ini pada koridor target yang dipilih. Bar hijau adalah
          parameter simulasi.
        </p>
        <div className="mt-4 space-y-4">
          <BarisPerbandingan
            label="Penumpang per hari"
            saatIni={baseline.perkiraanPenumpangHarian}
            simulasi={hasil.perkiraanPenumpangHarian}
            format={formatAngka}
          />
          <BarisPerbandingan
            label="Keterisian kursi"
            saatIni={baseline.tingkatKeterisianPersen}
            simulasi={hasil.tingkatKeterisianPersen}
            format={(nilai) => formatPersen(nilai)}
          />
          <BarisPerbandingan
            label="Pendapatan per bulan"
            saatIni={baseline.pendapatanBulananRupiah}
            simulasi={hasil.pendapatanBulananRupiah}
            format={formatRupiah}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          Rekomendasi: {hasil.rekomendasiKebijakan}
        </p>
      </section>
    </div>
  );
}
