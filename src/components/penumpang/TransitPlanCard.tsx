import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { menitKeJam } from "@/lib/scheduleEngine";
import type { Halte, JadwalTrip, Koridor } from "@/lib/types";

export interface TahapTransitData {
  koridor: Koridor;
  dari: Halte;
  ke: Halte;
  trip: JadwalTrip | null;
  berangkatDariMenit: number;
  tibaDiKeMenit: number;
  arahBalik: boolean;
  besok: boolean;
}

export interface RencanaTransitData {
  titikTransit: string;
  tahap1: TahapTransitData;
  tahap2: TahapTransitData;
  totalMenit: number;
  adaArahBalik: boolean;
}

export interface RencanaArahBalikData {
  koridor: Koridor;
  asal: Halte;
  tujuan: Halte;
  durasiMenit: number;
  tibaMenit: number;
  pasanganKoridor: Koridor | null;
}

function labelWaktu(menit: number, besok: boolean): string {
  return `${besok ? "Besok " : ""}${menitKeJam(menit)} WIB`;
}

function TahapTransit({
  nomor,
  tahap,
}: {
  nomor: number;
  tahap: TahapTransitData;
}) {
  const durasi = Math.max(0, tahap.tibaDiKeMenit - tahap.berangkatDariMenit);

  return (
    <article className="rounded-lg border border-line bg-canvas p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold text-brand-deep">Tahap {nomor}</p>
        <span
          className="inline-flex rounded px-1.5 py-0.5 text-xs font-bold text-white"
          style={{ backgroundColor: tahap.koridor.warnaHex }}
        >
          {tahap.koridor.id}
        </span>
        {tahap.arahBalik ? (
          <span className="rounded border border-amber bg-amber-soft px-1.5 py-0.5 text-xs font-semibold text-amber-deep">
            Arah balik
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm font-semibold leading-snug text-ink">
        {tahap.dari.nama} menuju {tahap.ke.nama}
      </p>

      {tahap.trip ? (
        <div className="mt-2 space-y-1 text-xs leading-relaxed text-ink-secondary">
          <p>
            Trip {tahap.trip.nomorTrip} berangkat dari {tahap.koridor.asal} pukul{" "}
            <span className="font-mono font-semibold tabular text-ink">
              {tahap.trip.berangkat}
            </span>{" "}
            WIB.
          </p>
          <p>
            Tiba di {tahap.dari.nama} pukul{" "}
            <span className="font-mono font-semibold tabular text-ink">
              {labelWaktu(tahap.berangkatDariMenit, tahap.besok)}
            </span>
            , lalu tiba di {tahap.ke.nama} pukul{" "}
            <span className="font-mono font-semibold tabular text-ink">
              {labelWaktu(tahap.tibaDiKeMenit, tahap.besok)}
            </span>
            .
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
          Arah balik. Estimasi perjalanan {durasi} menit, tiba di {tahap.ke.nama} sekitar{" "}
          <span className="font-mono font-semibold tabular text-ink">
            {labelWaktu(tahap.tibaDiKeMenit, tahap.besok)}
          </span>
          .
        </p>
      )}
    </article>
  );
}

export function TransitPlanCard({ rencana }: { rencana: RencanaTransitData }) {
  return (
    <section
      aria-labelledby="judul-rencana-transit"
      className="rounded-xl border border-line bg-surface p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="judul-rencana-transit" className="text-lg font-semibold text-ink">
            Rekomendasi Rute Transit
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
            Transit di {rencana.titikTransit}. Total sekitar {rencana.totalMenit} menit, termasuk
            waktu tunggu.
          </p>
        </div>
        <HonestyBadge
          jenis={rencana.adaArahBalik ? "perkiraan" : "publik"}
          label={rencana.adaArahBalik ? "Estimasi Transit" : "Rute Transit"}
        />
      </div>

      <ol className="mt-4 space-y-3">
        <li>
          <TahapTransit nomor={1} tahap={rencana.tahap1} />
        </li>
        <li>
          <TahapTransit nomor={2} tahap={rencana.tahap2} />
        </li>
      </ol>

      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        Jadwal tahap 1 dan tahap 2 mengikuti trip yang tersedia. Jika salah satu tahap bertanda
        arah balik, waktunya adalah estimasi dari urutan halte.
      </p>
    </section>
  );
}

export function ArahBalikCard({ rencana }: { rencana: RencanaArahBalikData }) {
  const besok = rencana.tibaMenit >= 24 * 60;

  return (
    <section
      aria-labelledby="judul-arah-balik"
      className="rounded-xl border border-amber bg-surface p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="judul-arah-balik" className="text-lg font-semibold text-ink">
            Rekomendasi Arah Balik
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
            {rencana.koridor.kode}, {rencana.asal.nama} menuju {rencana.tujuan.nama}.
          </p>
        </div>
        <HonestyBadge jenis="perkiraan" label="Estimasi Arah Balik" />
      </div>

      <p className="mt-3 font-mono text-2xl font-bold tabular text-ink">
        {rencana.durasiMenit} menit
      </p>
      <p className="mt-1 text-sm text-ink-secondary">
        Tiba sekitar{" "}
        <span className="font-mono font-semibold tabular text-ink">
          {labelWaktu(rencana.tibaMenit, besok)}
        </span>
        .
      </p>

      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        {rencana.pasanganKoridor
          ? `Untuk jadwal trip, gunakan koridor pasangan ${rencana.pasanganKoridor.id}, ${rencana.pasanganKoridor.nama}, dari arah sebaliknya.`
          : "Belum ada koridor pasangan untuk arah ini. Estimasi durasi dihitung dari selisih urutan halte."}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
        Jadwal publik yang tersedia hanya satu arah. Angka ini estimasi durasi perjalanan, bukan
        jadwal keberangkatan resmi.
      </p>
    </section>
  );
}
