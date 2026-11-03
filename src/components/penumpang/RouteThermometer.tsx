"use client";

import { useMemo } from "react";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import type { KeyakinanPosisi } from "@/lib/confidenceEngine";
import {
  etaSemuaHalte,
  jadwalHalteMenit,
  menitKeJam,
  type EtaHalte,
} from "@/lib/scheduleEngine";
import type { Halte, JadwalTrip, Koridor } from "@/lib/types";

export function RouteThermometer({
  daftarHalte,
  koridor,
  tripAcuan,
  posisiBus,
  jamSekarangMenit,
  keyakinan,
  selectedHalteId,
  onPilihHalte,
}: {
  daftarHalte: Halte[];
  koridor: Koridor;
  tripAcuan: JadwalTrip | null;
  posisiBus: number | null;
  jamSekarangMenit: number;
  keyakinan: KeyakinanPosisi;
  selectedHalteId: string;
  onPilihHalte: (halteId: string) => void;
}) {
  const jumlahHalte = daftarHalte.length;
  const posisiAktif = posisiBus !== null && keyakinan.status !== "tidak_aktif";

  const etas = useMemo(() => {
    const peta = new Map<number, EtaHalte>();
    if (!tripAcuan) return peta;

    if (posisiAktif && posisiBus !== null) {
      for (const eta of etaSemuaHalte(
        tripAcuan,
        posisiBus,
        jamSekarangMenit,
        jumlahHalte,
        koridor.durasiTempuhMenit,
      )) {
        peta.set(eta.indeksHalte, eta);
      }
      return peta;
    }

    for (const halte of daftarHalte) {
      const etaMenit = jadwalHalteMenit(
        tripAcuan,
        halte.urutan,
        jumlahHalte,
        koridor.durasiTempuhMenit,
      );
      peta.set(halte.urutan, {
        indeksHalte: halte.urutan,
        etaMenit,
        etaJam: menitKeJam(etaMenit),
        sudahDilewati: false,
      });
    }

    return peta;
  }, [
    daftarHalte,
    jamSekarangMenit,
    jumlahHalte,
    koridor.durasiTempuhMenit,
    posisiAktif,
    posisiBus,
    tripAcuan,
  ]);

  const indeksBaruLewat =
    posisiAktif && posisiBus !== null
      ? Math.floor(posisiBus) === Math.ceil(posisiBus)
        ? posisiBus - 1
        : Math.floor(posisiBus)
      : null;
  const indeksBerikutnya =
    posisiAktif && posisiBus !== null
      ? Math.floor(posisiBus) === Math.ceil(posisiBus)
        ? posisiBus
        : Math.ceil(posisiBus)
      : null;
  const halteBerikutnya =
    indeksBerikutnya !== null
      ? daftarHalte.find((halte) => halte.urutan === indeksBerikutnya)
      : null;
  const halteSebelumnya =
    indeksBaruLewat !== null
      ? daftarHalte.find((halte) => halte.urutan === indeksBaruLewat)
      : null;

  return (
    <section aria-labelledby="judul-urutan-halte" className="min-w-0 rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="judul-urutan-halte" className="text-lg font-semibold text-ink">
            Urutan Halte
          </h2>
          <p className="mt-1 text-xs text-ink-secondary">
            {jumlahHalte} titik, {koridor.asal} menuju {koridor.tujuan}
          </p>
        </div>
        <HonestyBadge
          jenis={
            keyakinan.status === "langsung"
              ? "langsung"
              : keyakinan.status === "perkiraan_jadwal"
                ? "perkiraan"
                : "jadwal"
          }
        />
      </div>

      {tripAcuan ? (
        <p className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2 text-xs leading-relaxed text-ink-secondary">
          Acuan: Trip {tripAcuan.nomorTrip} pukul{" "}
          <span className="font-mono font-semibold tabular text-ink">{tripAcuan.berangkat}</span>{" "}
          WIB.
          {posisiAktif && posisiBus !== null
            ? halteBerikutnya
              ? halteSebelumnya && Math.floor(posisiBus) !== Math.ceil(posisiBus)
                ? ` Posisi bus antara ${halteSebelumnya.nama} dan ${halteBerikutnya.nama}.`
                : ` Posisi bus di ${halteBerikutnya.nama}.`
              : ""
            : " ETA memakai jadwal statis karena belum ada trip aktif."}
        </p>
      ) : (
        <p className="mt-3 text-sm text-ink-secondary">Belum ada jadwal untuk ditampilkan.</p>
      )}

      {keyakinan.status === "perkiraan_jadwal" ? (
        <p role="status" className="mt-3 rounded-lg border border-amber bg-amber-soft px-3 py-2 text-xs leading-relaxed text-amber-deep">
          {keyakinan.pesan}
        </p>
      ) : null}

      <div className="mt-4">
        <div className="space-y-0.5">
          {daftarHalte.map((halte) => {
            const eta = etas.get(halte.urutan);
            const dipilih = halte.id === selectedHalteId;
            const status =
              !posisiAktif || indeksBaruLewat === null || indeksBerikutnya === null
                ? "D"
                : halte.urutan < indeksBaruLewat
                  ? "A"
                  : halte.urutan === indeksBaruLewat && indeksBaruLewat >= 1
                    ? "B"
                    : halte.urutan === indeksBerikutnya
                      ? "C"
                      : "D";
            const statusBaris =
              !posisiAktif
                ? "Jadwal trip"
                : status === "A"
                  ? "Sudah terlewat"
                  : status === "B"
                    ? "Baru saja dilewati bus"
                    : status === "C"
                      ? "Bus sedang menuju halte ini"
                      : "Halte berikutnya";
            const warnaBaris =
              status === "B"
                ? "border border-amber/40 bg-amber-soft/60"
                : status === "C"
                  ? "border border-brand bg-brand-soft"
                  : "border border-transparent";
            const interaksi =
              status === "A" || status === "D" ? "hover:bg-elevated" : "";
            const garisAtas =
              status === "A" || status === "B"
                ? "bg-line"
                : status === "C"
                  ? "bg-amber"
                  : "";
            const garisBawah =
              status === "A" ? "bg-line" : status === "B" ? "bg-amber" : "";
            const gayaGarisAtas =
              status === "D" ? { backgroundColor: koridor.warnaHex } : undefined;
            const gayaGarisBawah =
              status === "C" || status === "D"
                ? { backgroundColor: koridor.warnaHex }
                : undefined;
            const bulatan =
              status === "A"
                ? "size-3 rounded-full border-2 border-line bg-elevated"
                : status === "B"
                  ? "size-3.5 rounded-full border-2 border-white bg-amber ring-2 ring-amber"
                  : status === "C"
                    ? "size-4 rounded-full border-2 border-white bg-brand ring-2 ring-brand"
                    : "size-3.5 rounded-full border-2 bg-surface";
            const teksUtama =
              status === "A"
                ? "text-ink-muted"
                : status === "B"
                  ? "text-amber-deep font-semibold"
                  : status === "C"
                    ? "text-brand-deep font-bold"
                    : "text-ink font-semibold";
            const teksStatus =
              status === "A"
                ? "text-ink-muted"
                : status === "B"
                  ? "text-amber-deep"
                  : status === "C"
                    ? "text-brand-deep"
                    : "text-ink-muted";

            return (
              <button
                key={halte.id}
                type="button"
                onClick={() => onPilihHalte(halte.id)}
                aria-current={dipilih ? "true" : undefined}
                aria-label={`Halte ${halte.urutan}, ${halte.nama}. ${statusBaris}. ETA ${eta ? menitKeJam(eta.etaMenit) : "belum tersedia"}.`}
                className={`relative z-10 flex min-h-11 w-full items-center gap-3 rounded-lg px-1 text-left ${warnaBaris} ${interaksi} ${
                  dipilih ? "outline outline-2 outline-line-strong" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className="relative grid w-8 shrink-0 place-items-center self-stretch"
                >
                  <span
                    className={`absolute left-1/2 top-0 bottom-1/2 w-1 -translate-x-1/2 ${garisAtas}`}
                    style={gayaGarisAtas}
                  />
                  <span
                    className={`absolute left-1/2 top-1/2 bottom-0 w-1 -translate-x-1/2 ${garisBawah}`}
                    style={gayaGarisBawah}
                  />
                  <span
                    className={`relative z-10 block ${bulatan}`}
                    style={
                      status === "D" ? { borderColor: koridor.warnaHex } : undefined
                    }
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className={`block text-sm leading-snug ${teksUtama}`}>
                    {halte.urutan}. {halte.nama}
                  </span>
                  <span className={`block text-[0.6875rem] leading-snug ${teksStatus}`}>
                    {statusBaris}
                  </span>
                </span>

                {status === "B" ? (
                  <span className="shrink-0 rounded border border-amber bg-amber-soft px-2 py-0.5 text-xs font-semibold text-amber-deep">
                    Baru lewat
                  </span>
                ) : (
                  <span
                    className={`shrink-0 font-mono text-sm font-semibold tabular ${
                      status === "C"
                        ? "text-brand-deep font-bold"
                        : status === "A"
                          ? "text-ink-muted"
                          : "text-ink"
                    }`}
                  >
                    {status === "A" ? "Lewat" : (eta?.etaJam ?? "--:--")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3 text-xs text-ink-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full border-2 border-line bg-elevated" />
          Sudah terlewat
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-3.5 rounded-full border-2 border-white bg-amber ring-2 ring-amber"
          />
          Baru saja terlewat
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-4 rounded-full border-2 border-white bg-brand ring-2 ring-brand"
          />
          Bus menuju halte ini
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-3.5 rounded-full border-2 bg-surface"
            style={{ borderColor: koridor.warnaHex }}
          />
          Halte berikutnya
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        ETA dihitung dari durasi tempuh 45 menit per koridor dan selisih posisi bus terakhir.
        Ketuk titik atau nama halte untuk melihat estimasi waktu tiba di setiap pemberhentian.
      </p>
    </section>
  );
}
