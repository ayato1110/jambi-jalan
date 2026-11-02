"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CorridorPicker } from "@/components/penumpang/CorridorPicker";
import { DepartureBoardCard } from "@/components/penumpang/DepartureBoardCard";
import { SimClockBar } from "@/components/penumpang/SimClockBar";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { ErrorFallbackCard } from "@/components/ui/ErrorFallbackCard";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { KORIDOR_MAP } from "@/data/koridor";
import { JADWAL_MAP, JADWAL_PER_KORIDOR } from "@/data/jadwal";
import { evaluasiKeyakinan } from "@/lib/confidenceEngine";
import {
  cariTripBerikutnyaDiHalte,
  cariTripTerakhir,
  etaSemuaHalte,
  formatHitungMundur,
  jadwalHalteMenit,
  menitKeJam,
  statusLayanan,
  type TripDiHalte,
} from "@/lib/scheduleEngine";
import { bacaTeks, dukunganSuara, hentikanSuara } from "@/lib/speechHelper";
import { useSimClock } from "@/lib/useSimClock";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

export default function BerandaJadwalPage() {
  const koridorAktif = useJambiJalanStore((state) => state.koridorAktif);
  const halteKeberangkatanId = useJambiJalanStore((state) => state.halteKeberangkatanId);
  const jamSimulasiMenit = useJambiJalanStore((state) => state.jamSimulasiMenit);
  const daftarHalte = useJambiJalanStore((state) => state.daftarHalte);
  const armadaAktif = useJambiJalanStore((state) => state.armadaAktif);
  const suaraOtomatis = useJambiJalanStore((state) => state.suaraOtomatis);
  const setKoridorAktif = useJambiJalanStore((state) => state.setKoridorAktif);
  const setHalteKeberangkatan = useJambiJalanStore((state) => state.setHalteKeberangkatan);
  const setJamSimulasiMenit = useJambiJalanStore((state) => state.setJamSimulasiMenit);
  const kembalikanHaltePublik = useJambiJalanStore((state) => state.kembalikanHaltePublik);

  const jam = useSimClock(jamSimulasiMenit);
  const [offline, setOffline] = useState(false);
  const [pesanSuara, setPesanSuara] = useState<string | null>(null);

  const koridor = KORIDOR_MAP[koridorAktif];
  const jadwal = JADWAL_PER_KORIDOR[koridorAktif];

  const halteKoridor = useMemo(
    () =>
      daftarHalte
        .filter((halte) => halte.koridorId === koridorAktif)
        .sort((a, b) => a.urutan - b.urutan),
    [daftarHalte, koridorAktif],
  );

  const halte = useMemo(
    () =>
      halteKoridor.find((item) => item.id === halteKeberangkatanId) ??
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
  const labelKeyakinan = keyakinan.status === "tidak_aktif" ? "Jadwal Reguler" : keyakinan.label;
  const status = statusLayanan(jadwal, koridorAktif, jam.menit);
  const tripAktif = armadaBerjalan ? (JADWAL_MAP.get(armadaBerjalan.tripId) ?? null) : null;

  const berikutnya = useMemo<TripDiHalte | null>(() => {
    if (!halte) return null;

    if (tripAktif && armadaBerjalan) {
      const eta = etaSemuaHalte(
        tripAktif,
        armadaBerjalan.indeksHalteSekarang,
        jam.menit,
        halteKoridor.length,
        koridor.durasiTempuhMenit,
      ).find((item) => item.indeksHalte === halte.urutan);

      if (eta && !eta.sudahDilewati) {
        return {
          trip: tripAktif,
          tibaMenit: eta.etaMenit,
          menitMenuju: Math.max(0, eta.etaMenit - jam.menit),
          besok: false,
        };
      }
    }

    return cariTripBerikutnyaDiHalte(
      jadwal,
      koridorAktif,
      halte.urutan,
      halteKoridor.length,
      jam.menit,
      koridor.durasiTempuhMenit,
    );
  }, [
    armadaBerjalan,
    halte,
    halteKoridor.length,
    jadwal,
    jam.menit,
    koridor.durasiTempuhMenit,
    koridorAktif,
    tripAktif,
  ]);

  const terakhir = useMemo(() => {
    const trip = cariTripTerakhir(jadwal, koridorAktif);
    if (!trip || !halte) return null;

    return {
      trip,
      tibaMenit: jadwalHalteMenit(
        trip,
        halte.urutan,
        halteKoridor.length,
        koridor.durasiTempuhMenit,
      ),
    };
  }, [halte, halteKoridor.length, jadwal, koridor.durasiTempuhMenit, koridorAktif]);

  const opsiKetinggalan = useMemo(() => {
    if (!berikutnya || !halte) return null;
    return cariTripBerikutnyaDiHalte(
      jadwal,
      koridorAktif,
      halte.urutan,
      halteKoridor.length,
      jam.menit,
      koridor.durasiTempuhMenit,
      berikutnya.trip.id,
    );
  }, [
    berikutnya,
    halte,
    halteKoridor.length,
    jadwal,
    jam.menit,
    koridor.durasiTempuhMenit,
    koridorAktif,
  ]);

  const detikMenuju = berikutnya
    ? Math.max(0, Math.round((berikutnya.tibaMenit - jam.menit) * 60))
    : 0;

  const teksBagikan = useMemo(() => {
    if (!halte || !berikutnya) {
      return "JAMBI JALAN. Jadwal bus Trans Bahagia Kota Jambi sedang tidak tersedia.";
    }

    return [
      "JAMBI JALAN",
      `Koridor ${koridor.id}, via ${koridor.via}`,
      `Halte: ${halte.nama}`,
      `${berikutnya.besok ? "Besok, " : ""}Trip ${berikutnya.trip.nomorTrip} pukul ${berikutnya.trip.berangkat} WIB`,
      `Tiba di halte ini sekitar ${menitKeJam(berikutnya.tibaMenit)} WIB`,
      `Status posisi: ${labelKeyakinan}`,
      `Kepadatan: ${berikutnya.trip.kepenuhan}`,
      terakhir ? `Trip terakhir hari ini pukul ${terakhir.trip.berangkat} WIB` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [berikutnya, halte, koridor.id, koridor.via, labelKeyakinan, terakhir]);

  const tampilPapan = Boolean(halte && berikutnya && status.aktif && !status.besok);

  const bacakanJadwal = useCallback(() => {
    if (!dukunganSuara()) {
      setPesanSuara(
        "Perangkat ini belum mendukung pembaca suara otomatis. Gunakan tombol A+ untuk teks besar.",
      );
      return;
    }

    if (!halte || !berikutnya) {
      setPesanSuara("Belum ada jadwal yang dapat dibacakan.");
      return;
    }

    const kalimat = [
      `Koridor ${koridor.id}, ${koridor.asal} menuju ${koridor.tujuan} via ${koridor.via}.`,
      `Halte ${halte.nama}.`,
      `Trip berikutnya nomor ${berikutnya.trip.nomorTrip} pukul ${berikutnya.trip.berangkat} WIB.`,
      `Tiba di halte ini sekitar pukul ${menitKeJam(berikutnya.tibaMenit)} WIB, ${formatHitungMundur(berikutnya.menitMenuju)} lagi.`,
      `Status posisi: ${labelKeyakinan}.`,
      `Perkiraan kondisi bus ${berikutnya.trip.kepenuhan.toLowerCase()}.`,
      terakhir ? `Trip terakhir hari ini pukul ${terakhir.trip.berangkat} WIB.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const berhasil = bacaTeks(kalimat, { onSelesai: () => setPesanSuara(null) });
    setPesanSuara(
      berhasil
        ? "Pembaca suara Bahasa Indonesia sedang membacakan jadwal."
        : "Pembaca suara tidak dapat dijalankan di peramban ini.",
    );
  }, [berikutnya, halte, koridor, labelKeyakinan, terakhir]);

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

  const bacakanRef = useRef(bacakanJadwal);
  const tripDibacakanRef = useRef<string | null>(null);

  useEffect(() => {
    bacakanRef.current = bacakanJadwal;
  }, [bacakanJadwal]);

  useEffect(() => {
    if (!suaraOtomatis) {
      tripDibacakanRef.current = null;
      return;
    }
    if (!jam.siap || !berikutnya) return;
    if (tripDibacakanRef.current === berikutnya.trip.id) return;

    tripDibacakanRef.current = berikutnya.trip.id;
    bacakanRef.current();
  }, [berikutnya, jam.siap, suaraOtomatis]);

  useEffect(() => {
    const penanganan = () => bacakanRef.current();
    window.addEventListener("jambi-jalan:bacakan-jadwal", penanganan);
    return () => window.removeEventListener("jambi-jalan:bacakan-jadwal", penanganan);
  }, []);

  useEffect(() => () => hentikanSuara(), []);

  const judulKosong = status.pesan.toLowerCase().includes("belum dimulai")
    ? "Layanan Belum Dimulai"
    : status.aktif
      ? "Tidak Ada Keberangkatan Lagi Hari Ini"
      : "Layanan Hari Ini Telah Selesai";

  const pesanKosong = status.pesan.toLowerCase().includes("pertama")
    ? status.pesan
    : `${status.pesan} Keberangkatan pertama berikutnya pukul 05.30 WIB dari Terminal Rawasari.`;

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-6">
      <header className="mb-4">
        <p className="text-xs font-semibold text-brand-deep">Beranda Penumpang</p>
        <h1 className="mt-1 text-[1.375rem] font-bold leading-tight text-ink">
          Jadwal Keberangkatan
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Informasi keberangkatan, estimasi waktu tiba, dan kepadatan armada Trans Bahagia.
        </p>
      </header>

      <div className="space-y-4">
        {offline ? (
          <ErrorFallbackCard
            judul="Koneksi terputus: Menampilkan jadwal reguler tersimpan"
            pesan="Jadwal dan daftar halte tetap dapat dibaca dari data yang tersimpan di perangkat. Peta mungkin tidak dapat memuat ubin."
            labelAksi="Coba Sambung Lagi"
            onAksi={() => window.location.reload()}
          />
        ) : null}

        <section aria-label="Pilih perjalanan" className="rounded-xl border border-line bg-surface p-4">
          <CorridorPicker nilai={koridorAktif} onUbah={setKoridorAktif} />

          <div className="mt-4">
            <label
              htmlFor="halte-keberangkatan"
              className="block text-sm font-semibold text-ink"
            >
              Halte keberangkatan
            </label>
            <select
              id="halte-keberangkatan"
              value={halte?.id ?? ""}
              onChange={(event) => setHalteKeberangkatan(event.target.value)}
              disabled={halteKoridor.length === 0}
              className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-ink disabled:bg-elevated"
            >
              {halteKoridor.length === 0 ? <option value="">Belum ada halte</option> : null}
              {halteKoridor.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.urutan}. {item.nama}
                </option>
              ))}
            </select>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/terdekat"
                className="inline-flex min-h-11 items-center rounded-lg border border-line bg-canvas px-3 text-xs font-semibold text-ink-secondary hover:bg-elevated"
              >
                Cari Halte Terdekat
              </Link>
            </div>
          </div>
        </section>

        {!jam.siap ? (
          <SkeletonBlock baris={7} label="Memuat papan keberangkatan" />
        ) : halteKoridor.length === 0 || !halte ? (
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
        ) : tampilPapan && berikutnya ? (
          <DepartureBoardCard
            koridor={koridor}
            halte={halte}
            trip={berikutnya.trip}
            tibaMenit={berikutnya.tibaMenit}
            detikMenuju={detikMenuju}
            keyakinan={keyakinan}
            terakhir={terakhir}
            opsiKetinggalan={opsiKetinggalan}
            teksBagikan={teksBagikan}
            onBacakan={bacakanJadwal}
            pesanSuara={pesanSuara}
          />
        ) : (
          <EmptyStateCard
            judul={judulKosong}
            pesan={pesanKosong}
            catatan={
              terakhir
                ? `Trip terakhir hari ini berangkat pukul ${terakhir.trip.berangkat} WIB dan tiba di halte ini sekitar pukul ${menitKeJam(terakhir.tibaMenit)} WIB.`
                : undefined
            }
            aksi={
              <>
                <button
                  type="button"
                  onClick={() => setJamSimulasiMenit(6 * 60 + 50)}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep active:translate-y-px"
                >
                  Atur Waktu Uji 06.50
                </button>
                <Link
                  href="/peta"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-elevated"
                >
                  Lihat Peta & Halte
                </Link>
              </>
            }
          />
        )}

        <SimClockBar
          nilaiMenit={jam.menit}
          jamSimulasiMenit={jamSimulasiMenit}
          onUbah={setJamSimulasiMenit}
          onReset={() => setJamSimulasiMenit(null)}
        />
      </div>
    </div>
  );
}
