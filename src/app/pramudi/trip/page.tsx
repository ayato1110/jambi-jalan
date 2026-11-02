"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ARMADA_LENGKAP } from "@/data/armada";
import { JADWAL_MAP } from "@/data/jadwal";
import { KORIDOR_MAP } from "@/data/koridor";
import { evaluasiKeyakinan } from "@/lib/confidenceEngine";
import { useSimClock } from "@/lib/useSimClock";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

function SaklarDemo({
  id,
  label,
  deskripsi,
  checked,
  onUbah,
  disabled,
}: {
  id: string;
  label: string;
  deskripsi: string;
  checked: boolean;
  onUbah: (checked: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 py-3 ${disabled ? "opacity-60" : ""}`}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-pramudi-text">
          {label}
        </label>
        <p id={`${id}-deskripsi`} className="mt-1 text-xs leading-relaxed text-pramudi-muted">
          {deskripsi}
        </p>
      </div>

      <label
        className={`relative inline-flex min-h-11 min-w-14 shrink-0 items-center justify-center ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onUbah(event.target.checked)}
          disabled={disabled}
          aria-describedby={`${id}-deskripsi`}
          aria-label={label}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative inline-flex h-7 w-12 items-center rounded-full border border-pramudi-line bg-pramudi-bg transition-colors duration-150 peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pramudi-live"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1.5 top-1/2 size-5 -translate-y-1/2 rounded-full border border-pramudi-line bg-pramudi-text transition-transform duration-150 peer-checked:translate-x-5"
        />
      </label>
    </div>
  );
}

export default function PanelTripPage() {
  const unitPramudiId = useJambiJalanStore((state) => state.unitPramudiId);
  const tripPramudiId = useJambiJalanStore((state) => state.tripPramudiId);
  const daftarHalte = useJambiJalanStore((state) => state.daftarHalte);
  const armadaAktif = useJambiJalanStore((state) => state.armadaAktif);
  const jamSimulasiMenit = useJambiJalanStore((state) => state.jamSimulasiMenit);
  const mulaiTrip = useJambiJalanStore((state) => state.mulaiTrip);
  const akhiriTrip = useJambiJalanStore((state) => state.akhiriTrip);
  const setSinyalDiputus = useJambiJalanStore((state) => state.setSinyalDiputus);

  const jam = useSimClock(jamSimulasiMenit);
  const [autoMove, setAutoMove] = useState(false);
  const [jumlahPing, setJumlahPing] = useState(0);
  const [pesanDemo, setPesanDemo] = useState<string | null>(null);

  const unit = ARMADA_LENGKAP.find((item) => item.id === unitPramudiId) ?? null;
  const tripTerpilih = tripPramudiId ? (JADWAL_MAP.get(tripPramudiId) ?? null) : null;
  const armadaUnit = unit
    ? (armadaAktif.find((armada) => armada.busId === unit.id) ?? null)
    : null;
  const aktif = armadaUnit?.statusTrip === "berjalan" ? armadaUnit : null;
  const trip = aktif ? (JADWAL_MAP.get(aktif.tripId) ?? tripTerpilih) : tripTerpilih;
  const koridor = trip ? KORIDOR_MAP[trip.koridorId] : null;
  const berjalan = Boolean(aktif);
  const sinyalPutus = aktif?.sinyalDiputusSimulasi ?? false;

  const halteKoridor = trip
    ? daftarHalte
        .filter((halte) => halte.koridorId === trip.koridorId)
        .sort((a, b) => a.urutan - b.urutan)
    : [];

  const posisi = aktif?.indeksHalteSekarang ?? 1;
  const berikutnya =
    halteKoridor.find((halte) => halte.urutan === Math.ceil(posisi)) ??
    halteKoridor[halteKoridor.length - 1] ??
    null;
  const halteAwal = halteKoridor[0] ?? null;
  const keyakinan = aktif && jam.siap ? evaluasiKeyakinan(aktif, jam.ms) : null;
  const sinyalBermasalah = Boolean(aktif && keyakinan?.status === "perkiraan_jadwal");
  const umurPing =
    aktif && jam.siap
      ? Math.max(0, Math.floor((jam.ms - aktif.terakhirDiperbaruiMs) / 1000))
      : null;

  useEffect(() => {
    if (!unit || !berjalan) return;

    const interval = window.setInterval(() => {
      const state = useJambiJalanStore.getState();
      const armadaSekarang = state.armadaAktif.find(
        (armada) => armada.busId === unit.id && armada.statusTrip === "berjalan",
      );
      if (!armadaSekarang) return;

      if (autoMove) {
        state.majukanPosisi(unit.id, 0.5);
      } else {
        state.perbaruiPosisi(unit.id, armadaSekarang.indeksHalteSekarang);
      }
      setJumlahPing((jumlah) => jumlah + 1);
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [autoMove, berjalan, unit]);

  const mulai = () => {
    if (!unit || !tripTerpilih) return;
    mulaiTrip({
      busId: unit.id,
      namaArmada: unit.nama,
      jenis: unit.jenis,
      kapasitas: unit.kapasitas,
      koridorId: tripTerpilih.koridorId,
      tripId: tripTerpilih.id,
    });
    setAutoMove(false);
    setJumlahPing(1);
    setPesanDemo(null);
  };

  const akhiri = () => {
    if (!unit) return;
    akhiriTrip(unit.id);
    setAutoMove(false);
    setPesanDemo("Trip diakhiri. Posisi terakhir tetap tersimpan.");
  };

  const ubahSinyal = (putus: boolean) => {
    if (!unit || !aktif) return;
    setSinyalDiputus(unit.id, putus);
    setPesanDemo(
      putus
        ? "Sinyal diputus. Ping baru masuk antrean offline."
        : "Sinyal pulih. Antrean offline dikosongkan dan status kembali langsung.",
    );
  };

  if (!unit || !trip) {
    return (
      <div className="mx-auto w-full max-w-[560px] px-4 pt-6">
        <section className="rounded-xl border border-pramudi-line bg-pramudi-panel p-5">
          <p className="text-xs font-semibold text-pramudi-live">Panel Perjalanan</p>
          <h1 className="mt-1 text-2xl font-bold text-pramudi-text">Belum Ada Penugasan</h1>
          <p className="mt-2 text-sm leading-relaxed text-pramudi-subtext">
            Pilih unit armada dan jam trip terlebih dahulu sebelum membuka panel perjalanan.
          </p>
          <Link
            href="/pramudi"
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Pilih Penugasan
          </Link>
        </section>
      </div>
    );
  }

  const labelStatus = !aktif
    ? armadaUnit?.statusTrip === "selesai"
      ? "Trip Selesai"
      : "Siap Berangkat"
    : sinyalPutus
      ? "Sinyal Putus"
      : sinyalBermasalah
        ? "Estimasi Jadwal"
        : "Posisi Langsung";

  const gayaStatus = !aktif
    ? "border-pramudi-line text-pramudi-muted"
    : sinyalPutus || sinyalBermasalah
      ? "border-pramudi-amber text-pramudi-amber"
      : "border-pramudi-live text-pramudi-live";

  const judulStatus = aktif
    ? "Trip Sedang Berjalan"
    : armadaUnit?.statusTrip === "selesai"
      ? "Trip Selesai"
      : "Siap Berangkat";

  const teksPosisi = Number.isInteger(posisi)
    ? `Di halte ${posisi}`
    : `Antara halte ${Math.floor(posisi)} dan ${Math.ceil(posisi)}`;

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-6">
      <section
        aria-labelledby="judul-status-trip"
        className="rounded-xl border border-pramudi-line bg-pramudi-panel p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-pramudi-muted">Status perjalanan</p>
          <span
            role="status"
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${gayaStatus}`}
          >
            {aktif && !sinyalPutus ? (
              <span aria-hidden="true" className="size-2 rounded-full bg-pramudi-live" />
            ) : null}
            {labelStatus}
          </span>
        </div>

        <h1 id="judul-status-trip" className="mt-2 text-2xl font-bold leading-tight text-pramudi-text">
          {judulStatus}
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-pramudi-subtext">
          {unit.nama}
        </p>
        <p className="mt-1 text-xs text-pramudi-muted">
          {koridor?.kode}, via {koridor?.via}. Trip {trip.nomorTrip} pukul{" "}
          <span className="font-mono font-semibold tabular text-pramudi-text">{trip.berangkat}</span>{" "}
          WIB.
        </p>
      </section>

      <button
        type="button"
        onClick={berjalan ? akhiri : mulai}
        className={`mt-4 inline-flex min-h-[72px] w-full items-center justify-center rounded-xl px-4 text-lg font-extrabold tracking-tight text-white active:translate-y-px ${
          berjalan ? "bg-danger hover:bg-danger-deep" : "bg-brand hover:bg-brand-deep"
        }`}
      >
        {berjalan ? "AKHIRI TRIP" : "MULAI TRIP SEKARANG"}
      </button>

      {sinyalBermasalah && aktif ? (
        <p
          role="status"
          className="mt-3 rounded-lg border border-pramudi-amber bg-pramudi-panel p-3 text-sm leading-relaxed text-pramudi-amber"
        >
          {sinyalPutus
            ? `Sinyal terputus: ${aktif.antreanOfflineCount} titik lokasi disimpan di ponsel dan akan dikirim ulang saat sinyal pulih.`
            : "Ping tidak diterima lebih dari 20 detik. Status turun ke perkiraan dari jadwal."}
        </p>
      ) : null}

      <section aria-labelledby="judul-posisi" className="mt-4 rounded-xl border border-pramudi-line bg-pramudi-panel p-4">
        <h2 id="judul-posisi" className="text-sm font-semibold text-pramudi-text">
          Posisi dan Pengiriman
        </h2>
        <dl className="mt-3 divide-y divide-pramudi-line">
          <div className="grid gap-1 py-3 sm:grid-cols-[150px_1fr]">
            <dt className="text-xs font-medium text-pramudi-muted">Halte berikutnya</dt>
            <dd className="text-sm font-semibold text-pramudi-text">
              {aktif
                ? (berikutnya?.nama ?? "Halte terakhir")
                : `Siap berangkat dari ${halteAwal?.nama ?? "-"}`}
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[150px_1fr]">
            <dt className="text-xs font-medium text-pramudi-muted">Posisi bus</dt>
            <dd className="text-sm text-pramudi-subtext">{aktif ? teksPosisi : "Belum berjalan"}</dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[150px_1fr]">
            <dt className="text-xs font-medium text-pramudi-muted">Ping terakhir</dt>
            <dd className="text-sm text-pramudi-subtext">
              {aktif
                ? umurPing === null
                  ? "Menghitung..."
                  : umurPing <= 1
                    ? "Baru saja"
                    : `${umurPing} detik lalu`
                : "Belum ada ping"}
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[150px_1fr]">
            <dt className="text-xs font-medium text-pramudi-muted">Siklus ping sesi ini</dt>
            <dd className="font-mono text-sm font-semibold tabular text-pramudi-text">
              {jumlahPing}
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-xs leading-relaxed text-pramudi-muted">
          Ping dikirim setiap 10 detik saat trip berjalan. Badge penumpang berubah menjadi
          perkiraan jadwal bila ping tidak diterima lebih dari 20 detik.
        </p>
      </section>

      <section aria-labelledby="judul-demo" className="mt-4 rounded-xl border border-pramudi-line bg-pramudi-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="judul-demo" className="text-sm font-semibold text-pramudi-text">
            Simulasi Uji Lapangan
          </h2>
          <span className="rounded border border-pramudi-amber px-2 py-0.5 text-[0.625rem] font-semibold text-pramudi-amber">
            Uji Lapangan
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-pramudi-muted">
          Gunakan pengatur ini untuk menguji perpindahan halte dan kondisi jaringan saat pengujian
          tanpa pergerakan kendaraan.
        </p>

        <div className="mt-2 divide-y divide-pramudi-line">
          <SaklarDemo
            id="auto-move"
            label="Simulasi Bus Bergerak Otomatis"
            deskripsi="Menggeser posisi bus ke halte berikutnya setiap 10 detik."
            checked={autoMove}
            onUbah={setAutoMove}
            disabled={!berjalan}
          />
          <SaklarDemo
            id="sinyal-putus"
            label={sinyalPutus ? "Pulihkan Sinyal" : "Simulasi Sinyal Putus"}
            deskripsi="Saat putus, ping disimpan di antrean offline perangkat."
            checked={sinyalPutus}
            onUbah={ubahSinyal}
            disabled={!berjalan}
          />
        </div>

        <div className="mt-3 rounded-lg border border-pramudi-line bg-pramudi-bg p-3">
          <p className="text-xs font-medium text-pramudi-muted">Antrean koordinat offline</p>
          <p className="mt-1 font-mono text-3xl font-bold tabular text-pramudi-text">
            {aktif?.antreanOfflineCount ?? 0}
            <span className="ml-1 text-sm font-medium text-pramudi-muted">titik</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-pramudi-subtext">
            {aktif?.antreanOfflineCount
              ? "Koordinat disimpan di perangkat dan dikirim saat sinyal pulih."
              : "Tidak ada koordinat tertunda."}
          </p>
        </div>

        {!berjalan ? (
          <p className="mt-3 text-xs leading-relaxed text-pramudi-muted">
            Mulai trip untuk mengaktifkan simulasi uji lapangan.
          </p>
        ) : null}

        {pesanDemo ? (
          <p role="status" className="mt-3 text-xs leading-relaxed text-pramudi-amber">
            {pesanDemo}
          </p>
        ) : null}
      </section>

      {!berjalan ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/pramudi"
            className="inline-flex min-h-11 items-center rounded-lg border border-pramudi-line bg-pramudi-panel px-3 text-xs font-semibold text-pramudi-subtext hover:bg-pramudi-raised"
          >
            Ganti Penugasan
          </Link>
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-pramudi-muted">
        Pembaruan posisi halte dan kepadatan langsung disinkronkan ke layar informasi penumpang dan
        pusat kendali Dishub.
      </p>
    </div>
  );
}
