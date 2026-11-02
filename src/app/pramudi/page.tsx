"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ARMADA_LENGKAP } from "@/data/armada";
import { JADWAL_MAP, JADWAL_PER_KORIDOR } from "@/data/jadwal";
import { KORIDOR, KORIDOR_MAP } from "@/data/koridor";
import { jamKeMenit } from "@/lib/scheduleEngine";
import { useSimClock } from "@/lib/useSimClock";
import type { KoridorId } from "@/lib/types";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

export default function PilihPenugasanPage() {
  const router = useRouter();
  const unitPramudiId = useJambiJalanStore((state) => state.unitPramudiId);
  const tripPramudiId = useJambiJalanStore((state) => state.tripPramudiId);
  const armadaAktif = useJambiJalanStore((state) => state.armadaAktif);
  const jamSimulasiMenit = useJambiJalanStore((state) => state.jamSimulasiMenit);
  const setUnitPramudiId = useJambiJalanStore((state) => state.setUnitPramudiId);
  const setTripPramudiId = useJambiJalanStore((state) => state.setTripPramudiId);

  const [koridorLokal, setKoridorLokal] = useState<KoridorId>("K1");
  const [pesan, setPesan] = useState<string | null>(null);
  const jam = useSimClock(jamSimulasiMenit);

  const unit = ARMADA_LENGKAP.find((item) => item.id === unitPramudiId) ?? null;
  const trip = tripPramudiId ? (JADWAL_MAP.get(tripPramudiId) ?? null) : null;
  const koridorId = trip?.koridorId ?? koridorLokal;
  const koridor = KORIDOR_MAP[koridorId];
  const daftarTrip = JADWAL_PER_KORIDOR[koridorId];

  const unitAktifIds = new Set(
    armadaAktif
      .filter((armada) => armada.statusTrip === "berjalan")
      .map((armada) => armada.busId),
  );
  const armadaUnit = unit
    ? (armadaAktif.find(
        (armada) => armada.busId === unit.id && armada.statusTrip === "berjalan",
      ) ?? null)
    : null;
  const tripAktifUnit = armadaUnit ? (JADWAL_MAP.get(armadaUnit.tripId) ?? null) : null;

  const semuaTripLewat =
    jam.siap && jam.menit > jamKeMenit(daftarTrip[daftarTrip.length - 1].berangkat);

  const pilihUnit = (id: string) => {
    setUnitPramudiId(id);
    setPesan(null);
  };

  const pilihKoridor = (id: KoridorId) => {
    setKoridorLokal(id);
    if (trip && trip.koridorId !== id) setTripPramudiId(null);
    setPesan(null);
  };

  const pilihTrip = (id: string) => {
    setTripPramudiId(id);
    setPesan(null);
  };

  const lanjut = () => {
    if (!unit) {
      setPesan("Pilih unit armada terlebih dahulu.");
      return;
    }
    if (!trip) {
      setPesan("Pilih jam trip terlebih dahulu.");
      return;
    }
    setPesan(null);
    router.push("/pramudi/trip");
  };

  const bus = ARMADA_LENGKAP.filter((item) => item.jenis === "bus_medium");
  const angkot = ARMADA_LENGKAP.filter((item) => item.jenis === "angkot_listrik");

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-6">
      <header className="mb-4">
        <p className="text-xs font-semibold text-pramudi-live">Panel Pramudi</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-pramudi-text">
          Pilih Penugasan
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-pramudi-subtext">
          Pilih unit, koridor, dan jam trip hari ini sebelum membuka panel perjalanan.
        </p>
      </header>

      <div className="space-y-4">
        <section aria-labelledby="judul-unit" className="rounded-xl border border-pramudi-line bg-pramudi-panel p-4">
          <h2 id="judul-unit" className="text-sm font-semibold text-pramudi-text">
            1. Unit Armada
          </h2>

          <p className="mt-3 text-xs font-semibold text-pramudi-muted">
            Bus Medium, 26 kursi
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {bus.map((item) => {
              const dipilih = item.id === unit?.id;
              const sedangAktif = unitAktifIds.has(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pilihUnit(item.id)}
                  aria-pressed={dipilih}
                  className={`min-h-12 rounded-lg border p-3 text-left active:translate-y-px ${
                    dipilih
                      ? "border-pramudi-live bg-pramudi-raised"
                      : "border-pramudi-line bg-pramudi-bg hover:bg-pramudi-raised"
                  }`}
                >
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-pramudi-text">{item.nama}</span>
                    {sedangAktif ? (
                      <span className="rounded border border-pramudi-amber px-1.5 py-0.5 text-[0.625rem] font-semibold text-pramudi-amber">
                        Aktif
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs text-pramudi-muted">
                    ID {item.id}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs font-semibold text-pramudi-muted">
            Angkot Listrik, 10 kursi
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {angkot.map((item) => {
              const dipilih = item.id === unit?.id;
              const sedangAktif = unitAktifIds.has(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pilihUnit(item.id)}
                  aria-pressed={dipilih}
                  className={`min-h-12 rounded-lg border p-3 text-left active:translate-y-px ${
                    dipilih
                      ? "border-pramudi-live bg-pramudi-raised"
                      : "border-pramudi-line bg-pramudi-bg hover:bg-pramudi-raised"
                  }`}
                >
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-pramudi-text">{item.nama}</span>
                    {sedangAktif ? (
                      <span className="rounded border border-pramudi-amber px-1.5 py-0.5 text-[0.625rem] font-semibold text-pramudi-amber">
                        Aktif
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs text-pramudi-muted">
                    ID {item.id}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="judul-koridor" className="rounded-xl border border-pramudi-line bg-pramudi-panel p-4">
          <h2 id="judul-koridor" className="text-sm font-semibold text-pramudi-text">
            2. Koridor
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {KORIDOR.map((item) => {
              const dipilih = item.id === koridorId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pilihKoridor(item.id)}
                  aria-pressed={dipilih}
                  aria-label={`${item.id}, ${item.kode}, via ${item.via}`}
                  className={`min-h-14 rounded-lg border-2 px-2 py-2 text-left active:translate-y-px ${
                    dipilih
                      ? "border-pramudi-live bg-pramudi-raised"
                      : "border-pramudi-line bg-pramudi-bg hover:bg-pramudi-raised"
                  }`}
                >
                  <span
                    className="inline-flex rounded px-1.5 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: item.warnaHex }}
                  >
                    {item.id}
                  </span>
                  <span className="mt-1 block text-[0.6875rem] leading-tight text-pramudi-subtext">
                    via {item.via.split(",")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="judul-trip" className="rounded-xl border border-pramudi-line bg-pramudi-panel p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="judul-trip" className="text-sm font-semibold text-pramudi-text">
              3. Jam Trip Hari Ini
            </h2>
            <span className="text-xs text-pramudi-muted">{koridor.kode}, via {koridor.via}</span>
          </div>

          {!jam.siap ? (
            <div role="status" aria-label="Memuat jadwal trip" className="mt-3 grid grid-cols-2 gap-2">
              <span className="sr-only">Memuat jadwal trip</span>
              {Array.from({ length: 4 }, (_, indeks) => (
                <div key={indeks} className="h-20 animate-pulse rounded-lg bg-pramudi-raised" />
              ))}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {daftarTrip.map((item) => {
                const dipilih = item.id === trip?.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pilihTrip(item.id)}
                    aria-pressed={dipilih}
                    className={`min-h-20 rounded-lg border p-3 text-left active:translate-y-px ${
                      dipilih
                        ? "border-pramudi-live bg-pramudi-raised"
                        : "border-pramudi-line bg-pramudi-bg hover:bg-pramudi-raised"
                    }`}
                  >
                    <span className="block font-mono text-lg font-bold tabular text-pramudi-text">
                      {item.berangkat}
                    </span>
                    <span className="mt-0.5 block text-xs text-pramudi-subtext">
                      Trip {item.nomorTrip}, tiba {item.tiba}
                    </span>
                    <span className="mt-1 block text-[0.625rem] text-pramudi-muted">
                      {item.kepenuhan}
                      {item.catatanWaktu ? ", 2 versi waktu" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {semuaTripLewat ? (
            <p role="status" className="mt-3 rounded-lg border border-pramudi-amber bg-pramudi-bg p-3 text-xs leading-relaxed text-pramudi-amber">
              Semua trip reguler hari ini sudah berangkat. Pilihan trip tetap dibuka untuk simulasi
              dan pengujian.
            </p>
          ) : null}
        </section>

        {unit && trip ? (
          <section aria-labelledby="judul-ringkasan" className="rounded-xl border border-pramudi-live bg-pramudi-panel p-4">
            <h2 id="judul-ringkasan" className="text-xs font-semibold text-pramudi-muted">
              Penugasan dipilih
            </h2>
            <p className="mt-1 text-sm font-semibold text-pramudi-text">{unit.nama}</p>
            <p className="text-xs text-pramudi-subtext">
              {koridor.kode}, via {koridor.via}
            </p>
            <p className="mt-2 font-mono text-2xl font-bold tabular text-pramudi-live">
              {trip.berangkat} WIB
            </p>
            <p className="text-xs text-pramudi-subtext">
              Trip {trip.nomorTrip}, tiba {trip.tiba} WIB
            </p>

            {armadaUnit && tripAktifUnit ? (
              <p className="mt-3 rounded-lg border border-pramudi-amber bg-pramudi-bg p-3 text-xs leading-relaxed text-pramudi-amber">
                {tripAktifUnit.id === trip.id
                  ? "Unit ini sedang menjalankan trip ini. Buka panel untuk melanjutkan."
                  : `Unit ini sedang bertugas pada Trip ${tripAktifUnit.nomorTrip} pukul ${tripAktifUnit.berangkat}. Memulai trip baru akan mengganti penugasan.`}
              </p>
            ) : null}
          </section>
        ) : null}

        {pesan ? (
          <p role="alert" className="rounded-lg border border-pramudi-danger bg-pramudi-bg p-3 text-sm text-pramudi-danger">
            {pesan}
          </p>
        ) : null}

        <button
          type="button"
          onClick={lanjut}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-brand px-4 text-base font-extrabold text-white hover:bg-brand-deep active:translate-y-px"
        >
          Buka Panel Perjalanan
        </button>

        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-xs font-semibold text-pramudi-muted underline decoration-pramudi-line underline-offset-4 hover:text-pramudi-text"
        >
          Kembali ke Aplikasi Penumpang
        </Link>

        <p className="text-xs leading-relaxed text-pramudi-muted">
          Pastikan unit armada dan jadwal trip sesuai dengan penugasan operasional hari ini.
        </p>
      </div>
    </div>
  );
}
