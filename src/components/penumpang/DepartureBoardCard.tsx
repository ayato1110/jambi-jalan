"use client";

import { useState } from "react";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import type { KeyakinanPosisi } from "@/lib/confidenceEngine";
import {
  formatHitungMundurDetik,
  menitKeJam,
  type TripDiHalte,
} from "@/lib/scheduleEngine";
import type { Halte, JadwalTrip, Koridor, TingkatKepenuhan } from "@/lib/types";
import { CrowdReasonSheet, gayaKepenuhan } from "./CrowdReasonSheet";
import { ShareWhatsAppButton } from "./ShareWhatsAppButton";

function BadgeKecil({ kepenuhan }: { kepenuhan: TingkatKepenuhan }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${gayaKepenuhan(kepenuhan)}`}
    >
      {kepenuhan}
    </span>
  );
}

export function DepartureBoardCard({
  koridor,
  halte,
  trip,
  tibaMenit,
  detikMenuju,
  keyakinan,
  terakhir,
  opsiKetinggalan,
  teksBagikan,
  onBacakan,
  pesanSuara,
}: {
  koridor: Koridor;
  halte: Halte;
  trip: JadwalTrip;
  tibaMenit: number;
  detikMenuju: number;
  keyakinan: KeyakinanPosisi;
  terakhir: { trip: JadwalTrip; tibaMenit: number } | null;
  opsiKetinggalan: TripDiHalte | null;
  teksBagikan: string;
  onBacakan: () => void;
  pesanSuara: string | null;
}) {
  const [alasanTerbuka, setAlasanTerbuka] = useState(false);
  const jenisKeyakinan =
    keyakinan.status === "langsung"
      ? "langsung"
      : keyakinan.status === "perkiraan_jadwal"
        ? "perkiraan"
        : "jadwal";
  const umurPingDetik = Math.round(keyakinan.umurPingMs / 1000);
  const sudahTiba = detikMenuju <= 30;

  return (
    <article aria-label={`Papan keberangkatan ${halte.nama}`} className="overflow-hidden rounded-xl border border-line bg-surface">
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
        <h2 className="mt-3 text-xl font-bold leading-snug">{halte.nama}</h2>
        <p className="mt-1 font-mono text-xs text-[#D5D2C8]">
          Jam operasional 05.30 sampai 20.30 WIB
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-auto text-sm font-semibold text-ink">Trip berikutnya</p>
          <HonestyBadge jenis={jenisKeyakinan} />
          <button
            type="button"
            onClick={() => setAlasanTerbuka(true)}
            aria-haspopup="dialog"
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold active:translate-y-px ${gayaKepenuhan(trip.kepenuhan)}`}
          >
            {trip.kepenuhan}
          </button>
        </div>

        <p className="mt-4 font-mono text-4xl font-bold leading-none tabular text-ink">
          {formatHitungMundurDetik(detikMenuju)}
        </p>
        <p className="mt-2 text-sm font-medium text-ink-secondary">
          {sudahTiba ? "Bus sedang di halte ini atau sebentar lagi tiba." : "Menuju halte ini."}
        </p>

        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Trip {trip.nomorTrip} berangkat pukul {trip.berangkat} WIB dari {koridor.asal}. Tiba di
          halte ini sekitar pukul {menitKeJam(tibaMenit)} WIB.
        </p>

        {keyakinan.status === "perkiraan_jadwal" ? (
          <div
            role="status"
            className="mt-4 rounded-lg border border-amber bg-amber-soft p-3 text-sm leading-relaxed text-amber-deep"
          >
            <p className="font-semibold">Posisi bus sedang tidak terkirim.</p>
            <p className="mt-1">{keyakinan.pesan}</p>
          </div>
        ) : null}

        {keyakinan.status === "langsung" ? (
          <p className="mt-4 border-l-4 border-brand bg-brand-soft px-3 py-2 text-xs font-medium text-brand-deep">
            Pembaruan posisi terakhir {umurPingDetik <= 1 ? "baru saja" : `${umurPingDetik} detik lalu`}.
          </p>
        ) : null}

        {trip.catatanWaktu ? (
          <div className="mt-4 rounded-lg border border-line bg-canvas p-3">
            <p className="text-xs font-semibold text-ink">Catatan jadwal</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{trip.catatanWaktu}</p>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-line border-y border-line">
          <div className="py-3">
            <dt className="text-xs font-medium text-ink-muted">Trip terakhir hari ini</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
              {terakhir ? (
                <>
                  <span className="font-mono tabular">{terakhir.trip.berangkat} WIB</span>
                  <span className="text-xs font-normal text-ink-secondary">
                    tiba di halte ini {menitKeJam(terakhir.tibaMenit)} WIB
                  </span>
                  <BadgeKecil kepenuhan={terakhir.trip.kepenuhan} />
                </>
              ) : (
                <span>Tidak ada data trip terakhir.</span>
              )}
            </dd>
          </div>

          <div className="py-3">
            <dt className="text-xs font-medium text-ink-muted">Jika ketinggalan trip ini</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
              {opsiKetinggalan ? (
                <>
                  <span className="font-mono tabular">
                    {opsiKetinggalan.besok ? "Besok, " : ""}Trip {opsiKetinggalan.trip.nomorTrip}{" "}
                    pukul {opsiKetinggalan.trip.berangkat} WIB
                  </span>
                  <span className="text-xs font-normal text-ink-secondary">
                    tiba di halte ini {menitKeJam(opsiKetinggalan.tibaMenit)} WIB
                  </span>
                  <BadgeKecil kepenuhan={opsiKetinggalan.trip.kepenuhan} />
                </>
              ) : (
                <span>Tidak ada trip lain yang terdaftar.</span>
              )}
            </dd>
            {opsiKetinggalan?.trip.saranTripLonggar ? (
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                {opsiKetinggalan.trip.saranTripLonggar}
              </p>
            ) : null}
          </div>
        </dl>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <ShareWhatsAppButton teks={teksBagikan} />
          <button
            type="button"
            onClick={onBacakan}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-elevated active:translate-y-px"
          >
            Dengarkan Jadwal
          </button>
        </div>

        {pesanSuara ? (
          <p role="status" className="mt-3 text-xs leading-relaxed text-ink-muted">
            {pesanSuara}
          </p>
        ) : null}

        <p className="mt-4 text-xs leading-relaxed text-ink-muted">
          Estimasi waktu tiba dan tingkat kepadatan diperbarui mengikuti posisi armada serta jadwal
          operasional.
        </p>
      </div>

      <CrowdReasonSheet
        terbuka={alasanTerbuka}
        onTutup={() => setAlasanTerbuka(false)}
        kepenuhan={trip.kepenuhan}
        alasan={trip.alasanKepenuhan}
        saran={trip.saranTripLonggar}
        nomorTrip={trip.nomorTrip}
        jamBerangkat={trip.berangkat}
      />
    </article>
  );
}
