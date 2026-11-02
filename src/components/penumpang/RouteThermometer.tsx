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

  const berikutnya = posisiAktif && posisiBus !== null ? Math.ceil(posisiBus) : null;
  const halteBerikutnya = berikutnya ? daftarHalte.find((halte) => halte.urutan === berikutnya) : null;
  const halteSebelumnya = berikutnya ? daftarHalte.find((halte) => halte.urutan === berikutnya - 1) : null;

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

      <div className="relative mt-4">
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-[15px] top-4 w-1 rounded-full"
          style={{ backgroundColor: koridor.warnaHex }}
        />

        <div className="space-y-0.5">
          {daftarHalte.map((halte) => {
            const eta = etas.get(halte.urutan);
            const dipilih = halte.id === selectedHalteId;
            const dilewati = eta?.sudahDilewati ?? false;
            const iniBerikutnya = berikutnya === halte.urutan;
            const statusBaris = dilewati
              ? "Sudah dilewati"
              : iniBerikutnya
                ? "Bus menuju halte ini"
                : posisiAktif
                  ? "Halte berikutnya"
                  : "Jadwal trip";

            return (
              <button
                key={halte.id}
                type="button"
                onClick={() => onPilihHalte(halte.id)}
                aria-current={dipilih ? "true" : undefined}
                aria-label={`Halte ${halte.urutan}, ${halte.nama}. ${statusBaris}. ETA ${eta ? menitKeJam(eta.etaMenit) : "belum tersedia"}.`}
                className={`relative z-10 flex min-h-11 w-full items-center gap-3 rounded-lg px-1 py-2 text-left ${
                  dipilih ? "bg-brand-soft outline outline-2 outline-line-strong" : "hover:bg-elevated"
                }`}
              >
                <span className="grid w-8 shrink-0 place-items-center">
                  <span
                    aria-hidden="true"
                    className={`block rounded-full border-2 ${
                      iniBerikutnya && posisiAktif
                        ? "size-4 border-white bg-brand"
                        : dipilih
                          ? "size-4 border-line-strong bg-surface"
                          : dilewati
                            ? "size-3 border-line bg-canvas"
                            : "size-3 bg-surface"
                    }`}
                    style={
                      !iniBerikutnya && !dipilih && !dilewati
                        ? { borderColor: koridor.warnaHex }
                        : undefined
                    }
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm font-semibold leading-snug ${
                      dilewati ? "text-ink-muted" : "text-ink"
                    }`}
                  >
                    {halte.urutan}. {halte.nama}
                  </span>
                  <span className="block text-[0.6875rem] leading-snug text-ink-muted">
                    {statusBaris}
                  </span>
                </span>

                <span
                  className={`shrink-0 font-mono text-sm font-semibold tabular ${
                    dilewati ? "text-ink-muted" : "text-ink"
                  }`}
                >
                  {dilewati ? "Lewat" : (eta?.etaJam ?? "--:--")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3 text-xs text-ink-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full border-2 border-line bg-canvas" />
          Sudah dilewati
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full border-2 border-white bg-brand" />
          Posisi bus
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full border-2 border-line-strong bg-surface" />
          Halte dipilih
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        ETA dihitung dari durasi tempuh 45 menit per koridor dan selisih posisi bus terakhir.
        Ketuk titik atau nama halte untuk melihat estimasi waktu tiba di setiap pemberhentian.
      </p>
    </section>
  );
}
