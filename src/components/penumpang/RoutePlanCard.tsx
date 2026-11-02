import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { formatJarak } from "@/lib/geoUtils";
import { menitKeJam } from "@/lib/scheduleEngine";
import type { Halte, JadwalTrip, Koridor } from "@/lib/types";
import { gayaKepenuhan } from "./CrowdReasonSheet";
import { ShareWhatsAppButton } from "./ShareWhatsAppButton";

export function RoutePlanCard({
  koridor,
  asal,
  tujuan,
  trip,
  tibaMenit,
  jarakKm,
  jalanKakiMenit,
  besok,
  teksBagikan,
}: {
  koridor: Koridor;
  asal: Halte;
  tujuan: Halte;
  trip: JadwalTrip;
  tibaMenit: number;
  jarakKm: number;
  jalanKakiMenit: number;
  besok: boolean;
  teksBagikan: string;
}) {
  return (
    <article aria-label={`Rencana perjalanan dari ${asal.nama} ke ${tujuan.nama}`} className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="bg-board p-4 text-[#F6F5F0] sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex rounded-md px-2 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: koridor.warnaHex }}
          >
            {koridor.id}
          </span>
          <p className="text-xs font-medium text-[#D5D2C8]">
            {koridor.kode}, via {koridor.via}
          </p>
        </div>
        <h2 className="mt-3 text-xl font-bold leading-snug">{asal.nama}</h2>
        <p className="mt-1 text-sm text-[#D5D2C8]">menuju {tujuan.nama}</p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <HonestyBadge jenis="jadwal" label="Jadwal Trip" />
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${gayaKepenuhan(trip.kepenuhan)}`}
          >
            {trip.kepenuhan}
          </span>
          <HonestyBadge jenis="data-contoh" />
        </div>

        <p className="mt-4 text-xs font-medium text-ink-muted">
          {besok ? "Besok, tiba di tujuan sekitar" : "Tiba di tujuan sekitar"}
        </p>
        <p className="font-mono text-4xl font-bold leading-none tabular text-ink">
          {menitKeJam(tibaMenit)} <span className="text-sm font-medium text-ink-muted">WIB</span>
        </p>

        <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
          <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
            <dt className="text-xs font-medium text-ink-muted">Halte naik</dt>
            <dd className="font-semibold text-ink">
              {asal.urutan}. {asal.nama}
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
            <dt className="text-xs font-medium text-ink-muted">Halte turun</dt>
            <dd className="font-semibold text-ink">
              {tujuan.urutan}. {tujuan.nama}
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
            <dt className="text-xs font-medium text-ink-muted">Melewati</dt>
            <dd className="text-ink-secondary">
              {tujuan.urutan - asal.urutan} halte, termasuk halte turun
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
            <dt className="text-xs font-medium text-ink-muted">Jarak garis lurus</dt>
            <dd className="text-ink-secondary">
              {formatJarak(jarakKm)}, sekitar {jalanKakiMenit} menit jalan kaki
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
            <dt className="text-xs font-medium text-ink-muted">Trip berikutnya</dt>
            <dd className="text-ink-secondary">
              {besok ? "Besok, " : ""}Trip {trip.nomorTrip} pukul{" "}
              <span className="font-mono font-semibold tabular text-ink">{trip.berangkat}</span>{" "}
              WIB dari {asal.nama}
            </dd>
          </div>
        </dl>

        <div className="mt-4 rounded-lg border border-line bg-canvas p-3">
          <p className="text-xs font-semibold text-ink">Perkiraan kepenuhan</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{trip.alasanKepenuhan}</p>
          {trip.saranTripLonggar ? (
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {trip.saranTripLonggar}
            </p>
          ) : null}
        </div>

        <div className="mt-4">
          <ShareWhatsAppButton teks={teksBagikan} />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-muted">
          Jarak garis lurus bukan jarak tempuh kendaraan. Urutan halte mengikuti data operasional
          dan kepadatan merupakan estimasi operasional.
        </p>
      </div>
    </article>
  );
}
