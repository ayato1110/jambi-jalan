"use client";

import { useEffect, useMemo, useState } from "react";
import { CorridorMap } from "@/components/penumpang/CorridorMap";
import { CorridorPicker } from "@/components/penumpang/CorridorPicker";
import { RouteThermometer } from "@/components/penumpang/RouteThermometer";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { ErrorFallbackCard } from "@/components/ui/ErrorFallbackCard";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { KORIDOR_MAP } from "@/data/koridor";
import { JADWAL_MAP, JADWAL_PER_KORIDOR } from "@/data/jadwal";
import { evaluasiKeyakinan } from "@/lib/confidenceEngine";
import {
  cariTripBerikutnyaDiHalte,
  etaSemuaHalte,
  jadwalHalteMenit,
  menitKeJam,
  statusLayanan,
} from "@/lib/scheduleEngine";
import { useSimClock } from "@/lib/useSimClock";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

export default function PetaHaltePage() {
  const koridorAktif = useJambiJalanStore((state) => state.koridorAktif);
  const halteKeberangkatanId = useJambiJalanStore((state) => state.halteKeberangkatanId);
  const jamSimulasiMenit = useJambiJalanStore((state) => state.jamSimulasiMenit);
  const daftarHalte = useJambiJalanStore((state) => state.daftarHalte);
  const armadaAktif = useJambiJalanStore((state) => state.armadaAktif);
  const setKoridorAktif = useJambiJalanStore((state) => state.setKoridorAktif);
  const setHalteKeberangkatan = useJambiJalanStore((state) => state.setHalteKeberangkatan);
  const kembalikanHaltePublik = useJambiJalanStore((state) => state.kembalikanHaltePublik);

  const jam = useSimClock(jamSimulasiMenit);
  const [offline, setOffline] = useState(false);

  const koridor = KORIDOR_MAP[koridorAktif];
  const jadwal = JADWAL_PER_KORIDOR[koridorAktif];

  const halteKoridor = useMemo(
    () =>
      daftarHalte
        .filter((halte) => halte.koridorId === koridorAktif)
        .sort((a, b) => a.urutan - b.urutan),
    [daftarHalte, koridorAktif],
  );

  const halteTerpilih = useMemo(
    () =>
      halteKoridor.find((halte) => halte.id === halteKeberangkatanId) ??
      halteKoridor[0] ??
      null,
    [halteKeberangkatanId, halteKoridor],
  );

  const armadaBerjalan = useMemo(
    () =>
      armadaAktif.find(
        (armada) => armada.koridorId === koridorAktif && armada.statusTrip === "berjalan",
      ) ?? null,
    [armadaAktif, koridorAktif],
  );

  const keyakinan = evaluasiKeyakinan(armadaBerjalan, jam.ms);
  const status = statusLayanan(jadwal, koridorAktif, jam.menit);
  const tripAktif = armadaBerjalan ? (JADWAL_MAP.get(armadaBerjalan.tripId) ?? null) : null;

  const tripAcuan = useMemo(() => {
    if (tripAktif) return tripAktif;

    const berikutnya = cariTripBerikutnyaDiHalte(
      jadwal,
      koridorAktif,
      1,
      halteKoridor.length,
      jam.menit,
      koridor.durasiTempuhMenit,
    );

    return berikutnya?.trip ?? jadwal[0] ?? null;
  }, [halteKoridor.length, jadwal, jam.menit, koridor.durasiTempuhMenit, koridorAktif, tripAktif]);

  const etaTerpilih = useMemo(() => {
    if (!tripAcuan || !halteTerpilih) return null;

    if (armadaBerjalan && tripAktif) {
      const eta = etaSemuaHalte(
        tripAktif,
        armadaBerjalan.indeksHalteSekarang,
        jam.menit,
        halteKoridor.length,
        koridor.durasiTempuhMenit,
      ).find((item) => item.indeksHalte === halteTerpilih.urutan);

      if (eta) return eta;
    }

    const etaMenit = jadwalHalteMenit(
      tripAcuan,
      halteTerpilih.urutan,
      halteKoridor.length,
      koridor.durasiTempuhMenit,
    );

    return {
      indeksHalte: halteTerpilih.urutan,
      etaMenit,
      etaJam: menitKeJam(etaMenit),
      sudahDilewati: false,
    };
  }, [
    armadaBerjalan,
    halteKoridor.length,
    halteTerpilih,
    jam.menit,
    koridor.durasiTempuhMenit,
    tripAcuan,
    tripAktif,
  ]);

  useEffect(() => {
    const periksaKoneksi = () => setOffline(!navigator.onLine);
    periksaKoneksi();
    window.addEventListener("online", periksaKoneksi);
    window.addEventListener("offline", periksaKoneksi);
    return () => {
      window.removeEventListener("online", periksaKoneksi);
      window.removeEventListener("offline", periksaKoneksi);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 pt-6">
      <header className="mb-4">
        <p className="text-xs font-semibold text-brand-deep">Peta & Halte</p>
        <h1 className="mt-1 text-[1.375rem] font-bold leading-tight text-ink">
          Peta dan Urutan Halte
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          Lihat garis koridor, posisi bus terakhir, dan perkiraan waktu tiba di setiap halte.
          Ketuk titik halte untuk melihat rinciannya.
        </p>
      </header>

      <div className="space-y-4">
        {offline ? (
          <ErrorFallbackCard
            judul="Koneksi terputus: Peta mungkin tidak tampil"
            pesan="Daftar halte dan ETA jadwal tetap tersedia. Peta otomatis beralih ke bagan skematik jika ubin gagal dimuat."
            labelAksi="Coba Sambung Lagi"
            onAksi={() => window.location.reload()}
          />
        ) : null}

        <section aria-label="Pilih koridor" className="rounded-xl border border-line bg-surface p-4">
          <CorridorPicker nilai={koridorAktif} onUbah={setKoridorAktif} />
        </section>

        {!jam.siap ? (
          <div className="grid gap-4 md:grid-cols-2">
            <SkeletonBlock className="h-[300px]" baris={2} label="Memuat peta koridor" />
            <SkeletonBlock baris={9} label="Memuat urutan halte" />
          </div>
        ) : halteKoridor.length === 0 || !halteTerpilih ? (
          <EmptyStateCard
            judul="Belum Ada Halte"
            pesan="Data halte untuk koridor ini belum tersedia. Reset ke data baku untuk memulai lagi."
            aksi={
              <button
                type="button"
                onClick={kembalikanHaltePublik}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep active:translate-y-px"
              >
                Reset ke Data Baku
              </button>
            }
          />
        ) : (
          <>
            <div
              role="status"
              className={`rounded-xl border p-4 ${
                keyakinan.status === "perkiraan_jadwal"
                  ? "border-amber bg-amber-soft"
                  : "border-line bg-surface"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <HonestyBadge
                  jenis={
                    keyakinan.status === "langsung"
                      ? "langsung"
                      : keyakinan.status === "perkiraan_jadwal"
                        ? "perkiraan"
                        : "jadwal"
                  }
                />
                {armadaBerjalan ? (
                  <span className="text-xs font-medium text-ink-secondary">
                    {armadaBerjalan.namaArmada}
                  </span>
                ) : null}
              </div>
              <p
                className={`mt-2 text-sm leading-relaxed ${
                  keyakinan.status === "perkiraan_jadwal" ? "text-amber-deep" : "text-ink-secondary"
                }`}
              >
                {armadaBerjalan
                  ? (keyakinan.pesan ??
                    `Pembaruan posisi terakhir ${Math.max(0, Math.round(keyakinan.umurPingMs / 1000))} detik lalu.`)
                  : `${status.pesan} Peta menampilkan garis koridor dan jadwal statis untuk trip berikutnya.`}
              </p>
            </div>

            <div className="grid min-w-0 gap-4 md:grid-cols-[1.05fr_0.95fr] md:items-start">
              <div className="min-w-0 space-y-4 md:sticky md:top-20">
                <CorridorMap
                  koridor={koridor}
                  daftarHalte={halteKoridor}
                  selectedHalteId={halteTerpilih.id}
                  onPilihHalte={setHalteKeberangkatan}
                  armadaAktif={armadaBerjalan}
                />

                <section
                  aria-labelledby="judul-detail-halte"
                  className="min-w-0 rounded-xl border border-line bg-surface p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-ink-muted">
                        Halte {halteTerpilih.urutan} dari {halteKoridor.length}
                      </p>
                      <h2
                        id="judul-detail-halte"
                        className="mt-1 text-lg font-semibold leading-snug text-ink"
                      >
                        {halteTerpilih.nama}
                      </h2>
                    </div>
                    <HonestyBadge jenis="perkiraan" label="Titik Halte Koridor" />
                  </div>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-y border-line py-3">
                    <div>
                      <p className="text-xs font-medium text-ink-muted">
                        {etaTerpilih?.sudahDilewati ? "Sudah dilewati" : "Perkiraan tiba"}
                      </p>
                      <p className="font-mono text-2xl font-bold tabular text-ink">
                        {etaTerpilih?.sudahDilewati ? (
                          "Lewat"
                        ) : (
                          <>
                            {etaTerpilih?.etaJam ?? "--:--"}{" "}
                            <span className="text-xs font-medium text-ink-muted">WIB</span>
                          </>
                        )}
                      </p>
                    </div>
                    {tripAcuan ? (
                      <p className="text-xs text-ink-secondary">
                        Acuan {status.besok ? "besok " : ""}Trip {tripAcuan.nomorTrip} pukul{" "}
                        <span className="font-mono font-semibold tabular text-ink">
                          {tripAcuan.berangkat}
                        </span>{" "}
                        WIB
                      </p>
                    ) : null}
                  </div>

                  <dl className="mt-3 space-y-2 text-xs leading-relaxed">
                    <div>
                      <dt className="font-semibold text-ink">Patokan Lokasi</dt>
                      <dd className="text-ink-secondary">
                        {halteTerpilih.namaSumber &&
                        halteTerpilih.namaSumber !== halteTerpilih.nama
                          ? halteTerpilih.namaSumber
                          : halteTerpilih.nama}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Status koordinat</dt>
                      <dd className="text-ink-secondary">
                        {halteTerpilih.sumberKoordinat === "perkiraan"
                          ? "Titik halte mengikuti jalur koridor."
                          : "Titik halte belum tersedia."}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>

              <div className="min-w-0">
                <RouteThermometer
                  daftarHalte={halteKoridor}
                  koridor={koridor}
                  tripAcuan={tripAcuan}
                  posisiBus={armadaBerjalan?.indeksHalteSekarang ?? null}
                  jamSekarangMenit={jam.menit}
                  keyakinan={keyakinan}
                  selectedHalteId={halteTerpilih.id}
                  onPilihHalte={setHalteKeberangkatan}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
