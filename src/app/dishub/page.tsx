"use client";

import { FleetMap } from "@/components/dishub/FleetMap";
import { StatCard } from "@/components/dishub/StatCard";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { JADWAL_TRIP } from "@/data/jadwal";
import { KORIDOR_MAP } from "@/data/koridor";
import { evaluasiKeyakinan } from "@/lib/confidenceEngine";
import { jamKeMenit, menitKeJam } from "@/lib/scheduleEngine";
import { useSimClock } from "@/lib/useSimClock";
import type { StatusArmadaAktif } from "@/lib/types";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

type StatusBaris =
  | "Berjalan"
  | "Sinyal putus"
  | "Selesai"
  | "Terlambat mulai"
  | "Menunggu mulai"
  | "Tidak tercatat"
  | "Terjadwal";

function gayaStatus(status: StatusBaris): string {
  switch (status) {
    case "Berjalan":
      return "border-brand bg-brand-soft text-brand-deep";
    case "Sinyal putus":
    case "Menunggu mulai":
      return "border-amber bg-amber-soft text-amber-deep";
    case "Terlambat mulai":
      return "border-danger bg-danger-soft text-danger-deep";
    case "Selesai":
      return "border-line bg-elevated text-ink-secondary";
    case "Tidak tercatat":
      return "border-line bg-canvas text-ink-muted";
    default:
      return "border-line bg-elevated text-ink-secondary";
  }
}

export default function MonitoringArmadaPage() {
  const daftarHalte = useJambiJalanStore((state) => state.daftarHalte);
  const armadaAktif = useJambiJalanStore((state) => state.armadaAktif);
  const jamSimulasiMenit = useJambiJalanStore((state) => state.jamSimulasiMenit);
  const jam = useSimClock(jamSimulasiMenit);

  if (!jam.siap) {
    return (
      <div className="space-y-4">
        <header>
          <p className="text-xs font-semibold text-brand-deep">Dashboard Dishub</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-ink">Monitoring Armada</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
            Pantau armada, trip, dan gangguan sinyal pramudi.
          </p>
        </header>
        <SkeletonBlock baris={8} label="Memuat monitoring armada" />
      </div>
    );
  }

  const petaArmada = new Map<string, StatusArmadaAktif>();
  for (const armada of armadaAktif) {
    const sebelumnya = petaArmada.get(armada.tripId);
    if (!sebelumnya || sebelumnya.statusTrip !== "berjalan") {
      petaArmada.set(armada.tripId, armada);
    }
  }

  const baris = JADWAL_TRIP.map((trip) => {
    const armada = petaArmada.get(trip.id) ?? null;
    const keyakinan = armada ? evaluasiKeyakinan(armada, jam.ms) : null;
    const berjalan = armada?.statusTrip === "berjalan";
    const selesai = armada?.statusTrip === "selesai";
    const selisihMenit = jam.menit - jamKeMenit(trip.berangkat);
    const terlambat = !berjalan && !selesai && selisihMenit > 10 && selisihMenit <= 60;
    const menunggu = !berjalan && !selesai && selisihMenit > 0 && selisihMenit <= 10;
    const tidakTercatat = !berjalan && !selesai && selisihMenit > 60;

    const status: StatusBaris = berjalan
      ? keyakinan?.status === "perkiraan_jadwal"
        ? "Sinyal putus"
        : "Berjalan"
      : selesai
        ? "Selesai"
        : terlambat
          ? "Terlambat mulai"
          : menunggu
            ? "Menunggu mulai"
            : tidakTercatat
              ? "Tidak tercatat"
              : "Terjadwal";

    const umurPing = berjalan
      ? Math.max(0, Math.floor((jam.ms - (armada?.terakhirDiperbaruiMs ?? jam.ms)) / 1000))
      : null;

    return {
      trip,
      armada,
      status,
      umurPing,
      lewatMenit: Math.max(0, Math.round(selisihMenit - 10)),
    };
  });

  const armadaBerjalan = baris.filter(
    (item) => item.status === "Berjalan" || item.status === "Sinyal putus",
  ).length;
  const alertTerlambat = baris.filter((item) => item.status === "Terlambat mulai");
  const alertSinyal = baris.filter((item) => item.status === "Sinyal putus");
  const jumlahAlert = alertTerlambat.length + alertSinyal.length;
  const pakaiJamDemo = jamSimulasiMenit !== null;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-brand-deep">Dashboard Dishub</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-ink">Monitoring Armada</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
            Pantau armada, trip, dan gangguan sinyal pramudi. Status diperbarui dari panel pramudi.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface px-3 py-2">
          <p className="text-xs text-ink-muted">
            {pakaiJamDemo ? "Waktu Uji" : "Waktu Perangkat"}
          </p>
          <p className="font-mono text-lg font-bold tabular text-ink">
            {menitKeJam(jam.menit)} <span className="text-xs font-medium text-ink-muted">WIB</span>
          </p>
          <p className="text-[0.625rem] text-ink-muted">
            {pakaiJamDemo ? "Diatur dari halaman Beranda." : "Mengikuti waktu perangkat."}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">Ringkasan Operasional</h2>
        <HonestyBadge jenis="data-contoh" label="Pemantauan Aktif" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Armada berjalan"
          value={armadaBerjalan}
          note="Unit yang sedang melayani trip."
          tone="brand"
        />
        <StatCard label="Trip hari ini" value={JADWAL_TRIP.length} note="8 trip per koridor, 3 koridor." />
        <StatCard
          label="Trip terlambat"
          value={alertTerlambat.length}
          note="Belum dimulai lebih dari 10 menit."
          tone={alertTerlambat.length > 0 ? "danger" : "neutral"}
        />
        <StatCard
          label="Sinyal pramudi"
          value={alertSinyal.length}
          note="Posisi mengikuti estimasi jadwal."
          tone={alertSinyal.length > 0 ? "amber" : "neutral"}
        />
      </div>

      <section
        aria-labelledby="judul-alert-armada"
        className={`rounded-xl border p-4 ${
          jumlahAlert > 0 ? "border-danger bg-danger-soft" : "border-line bg-surface"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="judul-alert-armada"
            className={`text-lg font-semibold ${jumlahAlert > 0 ? "text-danger-deep" : "text-ink"}`}
          >
            Peringatan Gangguan
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <HonestyBadge jenis="data-contoh" label="Pemantauan Aktif" />
            <span className="rounded-md border border-current px-2 py-0.5 text-xs font-semibold">
              {jumlahAlert} peringatan
            </span>
          </div>
        </div>

        {jumlahAlert > 0 ? (
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-danger-deep">
            {alertTerlambat.map((item) => (
              <li key={`terlambat-${item.trip.id}`}>
                {item.trip.koridorId} Trip {item.trip.nomorTrip} pukul{" "}
                <span className="font-mono font-semibold tabular">{item.trip.berangkat}</span>{" "}
                belum dimulai, {item.lewatMenit} menit lewat batas 10 menit.
              </li>
            ))}
            {alertSinyal.map((item) => (
              <li key={`sinyal-${item.trip.id}`}>
                {item.armada?.namaArmada ?? "Armada"} di {item.trip.koridorId} Trip{" "}
                {item.trip.nomorTrip}: pembaruan terakhir {item.umurPing ?? 0} detik lalu, status
                estimasi jadwal.
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-secondary">
            Tidak ada trip terlambat atau sinyal putus pada jendela pantau saat ini.
          </p>
        )}

        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          Peringatan terlambat dihitung untuk trip yang jadwalnya lewat 10 sampai 60 menit lalu.
          Trip yang lebih lama tidak diberi peringatan agar daftar tetap terbaca.
        </p>
      </section>

      <section aria-labelledby="judul-peta-armada">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="judul-peta-armada" className="text-lg font-semibold text-ink">
              Peta Tiga Koridor
            </h2>
            <p className="mt-1 text-xs text-ink-secondary">
              Garis koridor dan penanda BUS aktif. Posisi diperbarui dari panel pramudi.
            </p>
          </div>
          <HonestyBadge jenis="data-contoh" label="Peta Operasional" />
        </div>
        <FleetMap daftarHalte={daftarHalte} armadaAktif={armadaAktif} />
      </section>

      <section aria-labelledby="judul-tabel-armada" className="rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4">
          <div>
            <h2 id="judul-tabel-armada" className="text-lg font-semibold text-ink">
              Status Armada dan Trip Hari Ini
            </h2>
            <p className="mt-1 text-xs text-ink-secondary">
              Pembaruan panel pramudi langsung tampil di sini.
            </p>
          </div>
          <HonestyBadge jenis="data-contoh" label="Pemantauan Aktif" />
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <caption className="sr-only">Tabel status armada dan trip hari ini</caption>
            <thead className="bg-elevated">
              <tr>
                <th scope="col" className="p-3 font-semibold text-ink">Koridor</th>
                <th scope="col" className="p-3 font-semibold text-ink">Trip</th>
                <th scope="col" className="p-3 font-semibold text-ink">Berangkat</th>
                <th scope="col" className="p-3 font-semibold text-ink">Armada</th>
                <th scope="col" className="p-3 font-semibold text-ink">Status</th>
                <th scope="col" className="p-3 font-semibold text-ink">Pembaruan terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {baris.map((item) => {
                const koridor = KORIDOR_MAP[item.trip.koridorId];
                return (
                  <tr key={item.trip.id}>
                    <td className="p-3 align-top">
                      <span
                        className="inline-flex rounded px-1.5 py-0.5 text-xs font-bold text-white"
                        style={{ backgroundColor: koridor.warnaHex }}
                      >
                        {item.trip.koridorId}
                      </span>
                    </td>
                    <td className="p-3 align-top font-semibold text-ink">Trip {item.trip.nomorTrip}</td>
                    <td className="p-3 align-top font-mono tabular text-ink">{item.trip.berangkat}</td>
                    <td className="p-3 align-top text-ink-secondary">
                      {item.armada?.namaArmada ?? "Belum ada"}
                    </td>
                    <td className="p-3 align-top">
                      <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${gayaStatus(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 align-top font-mono tabular text-ink-secondary">
                      {item.umurPing === null ? "Tidak ada" : `${item.umurPing} detik`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ul className="divide-y divide-line md:hidden">
          {baris.map((item) => {
            const koridor = KORIDOR_MAP[item.trip.koridorId];
            return (
              <li key={item.trip.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex rounded px-1.5 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: koridor.warnaHex }}
                    >
                      {item.trip.koridorId}
                    </span>
                    <p className="text-sm font-semibold text-ink">Trip {item.trip.nomorTrip}</p>
                  </div>
                  <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${gayaStatus(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink-secondary">
                  Berangkat {item.trip.berangkat}, {item.armada?.namaArmada ?? "belum ada armada"}.
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Pembaruan terakhir: {item.umurPing === null ? "tidak ada" : `${item.umurPing} detik lalu`}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-line p-4 text-xs leading-relaxed text-ink-muted">
          Jadwal arah balik K2 mengikuti asumsi operasional. Pemantauan ini tidak menggantikan
          catatan operasional resmi Dishub.
        </p>
      </section>
    </div>
  );
}
