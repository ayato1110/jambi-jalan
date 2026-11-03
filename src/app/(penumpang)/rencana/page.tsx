"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArahBalikCard, TransitPlanCard } from "@/components/penumpang/TransitPlanCard";
import type { RencanaArahBalikData, RencanaTransitData, TahapTransitData } from "@/components/penumpang/TransitPlanCard";
import { RoutePlanCard } from "@/components/penumpang/RoutePlanCard";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { HALTE_MAP } from "@/data/halte";
import { JADWAL_PER_KORIDOR } from "@/data/jadwal";
import { KORIDOR, KORIDOR_MAP } from "@/data/koridor";
import { estimasiJalanKakiMenit, formatJarak, haversineKm } from "@/lib/geoUtils";
import { cariTripBerikutnyaDiHalte, jadwalHalteMenit, menitKeJam } from "@/lib/scheduleEngine";
import type { Halte, KoridorId } from "@/lib/types";
import { useSimClock } from "@/lib/useSimClock";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

const RUTE_POPULER = [
  { asalId: "K1-01", tujuanId: "K1-09" },
  { asalId: "K1-01", tujuanId: "K1-31" },
  { asalId: "K2-19", tujuanId: "K2-29" },
  { asalId: "K3-01", tujuanId: "K3-17" },
];

const KANDIDAT_TRANSIT: Array<{
  nama: string;
  idPerKoridor: Partial<Record<KoridorId, string>>;
}> = [
  {
    nama: "Pasar Keluarga",
    idPerKoridor: { K1: "K1-18", K2: "K2-17" },
  },
  {
    nama: "Terminal Rawasari",
    idPerKoridor: { K1: "K1-01", K2: "K2-34", K3: "K3-01" },
  },
  {
    nama: "Terminal Alam Barajo",
    idPerKoridor: { K1: "K1-31", K2: "K2-01" },
  },
];

const PASANGAN_KORIDOR: Partial<Record<KoridorId, KoridorId>> = {
  K1: "K2",
  K2: "K1",
};

function buatTahap(
  koridorId: KoridorId,
  dari: Halte,
  ke: Halte,
  mulaiMenit: number,
  daftarHalte: Halte[],
): TahapTransitData | null {
  const koridor = KORIDOR_MAP[koridorId];
  const daftarKoridor = daftarHalte
    .filter((halte) => halte.koridorId === koridorId)
    .sort((a, b) => a.urutan - b.urutan);

  if (daftarKoridor.length === 0) return null;

  if (dari.urutan <= ke.urutan) {
    const berikutnya = cariTripBerikutnyaDiHalte(
      JADWAL_PER_KORIDOR[koridorId],
      koridorId,
      dari.urutan,
      daftarKoridor.length,
      mulaiMenit,
      koridor.durasiTempuhMenit,
    );

    if (!berikutnya) return null;

    return {
      koridor,
      dari,
      ke,
      trip: berikutnya.trip,
      berangkatDariMenit: berikutnya.tibaMenit,
      tibaDiKeMenit: jadwalHalteMenit(
        berikutnya.trip,
        ke.urutan,
        daftarKoridor.length,
        koridor.durasiTempuhMenit,
      ),
      arahBalik: false,
      besok: berikutnya.besok,
    };
  }

  const durasi = Math.max(
    0,
    Math.round(
      ((dari.urutan - ke.urutan) / Math.max(1, daftarKoridor.length - 1)) *
        koridor.durasiTempuhMenit,
    ),
  );
  const tibaDiKeMenit = mulaiMenit + durasi;

  return {
    koridor,
    dari,
    ke,
    trip: null,
    berangkatDariMenit: mulaiMenit,
    tibaDiKeMenit,
    arahBalik: true,
    besok: tibaDiKeMenit >= 24 * 60,
  };
}

export default function RencanaPerjalananPage() {
  const halteKeberangkatanId = useJambiJalanStore((state) => state.halteKeberangkatanId);
  const daftarHalte = useJambiJalanStore((state) => state.daftarHalte);
  const jamSimulasiMenit = useJambiJalanStore((state) => state.jamSimulasiMenit);
  const setHalteKeberangkatan = useJambiJalanStore((state) => state.setHalteKeberangkatan);

  const [tujuanId, setTujuanId] = useState("");
  const [cari, setCari] = useState("");
  const jam = useSimClock(jamSimulasiMenit);
  const hasilRef = useRef<HTMLDivElement>(null);
  const tujuanSebelumnya = useRef("");

  useEffect(() => {
    if (tujuanId && tujuanSebelumnya.current !== tujuanId) {
      const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      hasilRef.current?.scrollIntoView({
        behavior: kurangiGerak ? "auto" : "smooth",
        block: "start",
      });
    }
    tujuanSebelumnya.current = tujuanId;
  }, [tujuanId]);

  const asal =
    daftarHalte.find((halte) => halte.id === halteKeberangkatanId) ??
    HALTE_MAP.get(halteKeberangkatanId) ??
    daftarHalte[0] ??
    HALTE_MAP.get("K1-01") ??
    null;
  const tujuan = tujuanId
    ? (daftarHalte.find((halte) => halte.id === tujuanId) ?? HALTE_MAP.get(tujuanId) ?? null)
    : null;

  const hasilCari = useMemo(() => {
    const kueri = cari.trim().toLowerCase();
    if (!kueri) return [];

    return daftarHalte
      .filter((halte) => {
        const koridor = KORIDOR_MAP[halte.koridorId];
        return `${halte.nama} ${halte.namaSumber} ${halte.koridorId} ${koridor.nama}`
          .toLowerCase()
          .includes(kueri);
      })
      .sort((a, b) => a.koridorId.localeCompare(b.koridorId) || a.urutan - b.urutan)
      .slice(0, 8);
  }, [cari, daftarHalte]);

  const rencana = useMemo(() => {
    if (!asal || !tujuan) return null;
    if (asal.koridorId !== tujuan.koridorId || asal.urutan >= tujuan.urutan) return null;

    const koridor = KORIDOR_MAP[asal.koridorId];
    const daftarKoridor = daftarHalte
      .filter((halte) => halte.koridorId === asal.koridorId)
      .sort((a, b) => a.urutan - b.urutan);

    if (daftarKoridor.length === 0) return null;

    const berikutnya = cariTripBerikutnyaDiHalte(
      JADWAL_PER_KORIDOR[asal.koridorId],
      asal.koridorId,
      asal.urutan,
      daftarKoridor.length,
      jam.menit,
      koridor.durasiTempuhMenit,
    );

    if (!berikutnya) return null;

    const jarakKm = haversineKm(asal, tujuan);
    return {
      koridor,
      trip: berikutnya.trip,
      tibaMenit: jadwalHalteMenit(
        berikutnya.trip,
        tujuan.urutan,
        daftarKoridor.length,
        koridor.durasiTempuhMenit,
      ),
      besok: berikutnya.besok,
      jarakKm,
      jalanKakiMenit: estimasiJalanKakiMenit(jarakKm),
    };
  }, [asal, daftarHalte, jam.menit, tujuan]);

  const transit = useMemo<RencanaTransitData | null>(() => {
    if (!asal || !tujuan || asal.koridorId === tujuan.koridorId) return null;

    let terbaik: RencanaTransitData | null = null;
    let skorTerbaik = Number.POSITIVE_INFINITY;

    for (const titik of KANDIDAT_TRANSIT) {
      const idAsal = titik.idPerKoridor[asal.koridorId];
      const idTujuan = titik.idPerKoridor[tujuan.koridorId];
      if (!idAsal || !idTujuan) continue;

      const halteTransitAsal = daftarHalte.find((halte) => halte.id === idAsal);
      const halteTransitTujuan = daftarHalte.find((halte) => halte.id === idTujuan);
      if (!halteTransitAsal || !halteTransitTujuan) continue;

      const tahap1 = buatTahap(
        asal.koridorId,
        asal,
        halteTransitAsal,
        jam.menit,
        daftarHalte,
      );
      if (!tahap1) continue;

      const tahap2 = buatTahap(
        tujuan.koridorId,
        halteTransitTujuan,
        tujuan,
        tahap1.tibaDiKeMenit,
        daftarHalte,
      );
      if (!tahap2) continue;

      const totalMenit = Math.max(0, tahap2.tibaDiKeMenit - tahap1.berangkatDariMenit);
      const jumlahArahBalik = Number(tahap1.arahBalik) + Number(tahap2.arahBalik);
      const skor = jumlahArahBalik * 10_000 + totalMenit;

      if (skor < skorTerbaik) {
        skorTerbaik = skor;
        terbaik = {
          titikTransit: titik.nama,
          tahap1,
          tahap2,
          totalMenit,
          adaArahBalik: jumlahArahBalik > 0,
        };
      }
    }

    return terbaik;
  }, [asal, daftarHalte, jam.menit, tujuan]);

  const arahBalik = useMemo<RencanaArahBalikData | null>(() => {
    if (!asal || !tujuan) return null;
    if (asal.koridorId !== tujuan.koridorId || asal.urutan <= tujuan.urutan) return null;

    const koridor = KORIDOR_MAP[asal.koridorId];
    const daftarKoridor = daftarHalte
      .filter((halte) => halte.koridorId === asal.koridorId)
      .sort((a, b) => a.urutan - b.urutan);

    const durasiMenit = Math.max(
      0,
      Math.round(
        ((asal.urutan - tujuan.urutan) / Math.max(1, daftarKoridor.length - 1)) *
          koridor.durasiTempuhMenit,
      ),
    );
    const pasanganId = PASANGAN_KORIDOR[asal.koridorId] ?? null;

    return {
      koridor,
      asal,
      tujuan,
      durasiMenit,
      tibaMenit: jam.menit + durasiMenit,
      pasanganKoridor: pasanganId ? KORIDOR_MAP[pasanganId] : null,
    };
  }, [asal, daftarHalte, jam.menit, tujuan]);

  const teksBagikan = useMemo(() => {
    if (!asal || !tujuan || !rencana) return "";
    return [
      "JAMBI JALAN",
      "Rencana perjalanan",
      `${rencana.koridor.kode}, via ${rencana.koridor.via}`,
      `Naik: ${asal.nama} (halte ${asal.urutan})`,
      `Turun: ${tujuan.nama} (halte ${tujuan.urutan})`,
      `${rencana.besok ? "Besok, " : ""}Trip ${rencana.trip.nomorTrip} pukul ${rencana.trip.berangkat} WIB`,
      `Tiba di tujuan sekitar ${menitKeJam(rencana.tibaMenit)} WIB`,
      `Kepadatan: ${rencana.trip.kepenuhan}`,
      `Jarak garis lurus ${formatJarak(rencana.jarakKm)}, sekitar ${rencana.jalanKakiMenit} menit jalan kaki`,
    ].join("\n");
  }, [asal, rencana, tujuan]);

  const pilihAsal = (id: string) => {
    setHalteKeberangkatan(id);
    if (tujuanId === id) setTujuanId("");
  };

  const pilihTujuan = (id: string) => {
    setTujuanId(id);
    setCari("");
  };

  const tukarArah = () => {
    if (!asal || !tujuan) return;
    const asalLama = asal.id;
    setHalteKeberangkatan(tujuan.id);
    setTujuanId(asalLama);
  };

  const pakaiRutePopuler = (asalId: string, tujuanBaruId: string) => {
    setHalteKeberangkatan(asalId);
    setTujuanId(tujuanBaruId);
    setCari("");
  };

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-6">
      <header className="mb-4">
        <p className="text-xs font-semibold text-brand-deep">Rencana Perjalanan</p>
        <h1 className="mt-1 text-[1.375rem] font-bold leading-tight text-ink">
          Cari Rute Perjalanan
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Pilih halte asal dan tujuan. Jarak dan kepadatan merupakan estimasi operasional.
        </p>
      </header>

      <div className="space-y-4">
        <section aria-label="Pilih halte asal dan tujuan" className="rounded-xl border border-line bg-surface p-4">
          <div>
            <label htmlFor="halte-asal" className="block text-sm font-semibold text-ink">
              Halte asal
            </label>
            <select
              id="halte-asal"
              value={asal?.id ?? ""}
              onChange={(event) => pilihAsal(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-ink"
            >
              {KORIDOR.map((koridor) => {
                const daftar = daftarHalte
                  .filter((halte) => halte.koridorId === koridor.id)
                  .sort((a, b) => a.urutan - b.urutan);

                return (
                  <optgroup key={koridor.id} label={`${koridor.id}, ${koridor.nama}`}>
                    {daftar.map((halte) => (
                      <option key={halte.id} value={halte.id}>
                        {halte.urutan}. {halte.nama}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <Link
              href="/terdekat"
              className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-brand-deep underline decoration-line underline-offset-4 hover:text-ink"
            >
              Gunakan Halte Terdekat Saya
            </Link>
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <label htmlFor="halte-tujuan" className="block text-sm font-semibold text-ink">
              Halte tujuan
            </label>
            <select
              id="halte-tujuan"
              value={tujuanId}
              onChange={(event) => pilihTujuan(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-ink"
            >
              <option value="">Pilih halte tujuan</option>
              {KORIDOR.map((koridor) => {
                const daftar = daftarHalte
                  .filter((halte) => halte.koridorId === koridor.id)
                  .sort((a, b) => a.urutan - b.urutan);

                return (
                  <optgroup key={koridor.id} label={`${koridor.id}, ${koridor.nama}`}>
                    {daftar.map((halte) => (
                      <option key={halte.id} value={halte.id}>
                        {halte.urutan}. {halte.nama}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            <label
              htmlFor="cari-tujuan"
              className="mt-3 block text-sm font-semibold text-ink"
            >
              Filter / ketik nama halte tujuan
            </label>
            <input
              id="cari-tujuan"
              type="search"
              value={cari}
              onChange={(event) => setCari(event.target.value)}
              placeholder="Contoh: RS Baiturrahim, Pasar Angso Duo"
              className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted"
            />

            {cari.trim() ? (
              hasilCari.length > 0 ? (
                <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
                  {hasilCari.map((halte) => {
                    const koridor = KORIDOR_MAP[halte.koridorId];
                    return (
                      <li key={halte.id}>
                        <button
                          type="button"
                          onClick={() => pilihTujuan(halte.id)}
                          className="flex min-h-12 w-full items-center gap-3 px-3 text-left hover:bg-elevated"
                        >
                          <span
                            className="inline-flex shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold text-white"
                            style={{ backgroundColor: koridor.warnaHex }}
                          >
                            {halte.koridorId}
                          </span>
                          <span className="min-w-0 flex-1 text-sm font-medium text-ink">
                            {halte.urutan}. {halte.nama}
                          </span>
                          <span className="text-xs text-ink-muted">Pilih</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-2 rounded-lg border border-line bg-canvas p-3">
                  <p className="text-sm text-ink-secondary">
                    Tidak ada halte dengan nama tersebut.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCari("")}
                    className="mt-2 inline-flex min-h-11 items-center rounded-lg border border-line-strong bg-surface px-3 text-xs font-semibold text-ink hover:bg-elevated"
                  >
                    Hapus Pencarian
                  </button>
                </div>
              )
            ) : null}

            {tujuan ? (
              <div className="mt-3 rounded-lg border border-line bg-canvas p-3">
                <p className="text-xs font-medium text-ink-muted">Halte tujuan</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {tujuan.urutan}. {tujuan.nama}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTujuanId("")}
                    className="inline-flex min-h-11 items-center rounded-lg border border-line-strong bg-surface px-3 text-xs font-semibold text-ink hover:bg-elevated"
                  >
                    Ganti Tujuan
                  </button>
                  <button
                    type="button"
                    onClick={tukarArah}
                    className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink-secondary hover:bg-elevated"
                  >
                    Tukar Arah
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <p className="text-sm font-semibold text-ink">Rute Populer</p>
            <div className="mt-2 grid gap-2">
              {RUTE_POPULER.map((rute) => {
                const asalRute = HALTE_MAP.get(rute.asalId);
                const tujuanRute = HALTE_MAP.get(rute.tujuanId);
                if (!asalRute || !tujuanRute) return null;

                return (
                  <button
                    key={`${rute.asalId}-${rute.tujuanId}`}
                    type="button"
                    onClick={() => pakaiRutePopuler(rute.asalId, rute.tujuanId)}
                    className="flex min-h-12 w-full items-center justify-between gap-2 rounded-lg border border-line bg-canvas px-3 text-left text-xs font-semibold text-ink-secondary hover:bg-elevated"
                  >
                    <span className="min-w-0">
                      {asalRute.nama} ke {tujuanRute.nama}
                    </span>
                    <span className="shrink-0 text-ink-muted">Pakai</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div ref={hasilRef} className="scroll-mt-28">
          {!jam.siap ? (
          <SkeletonBlock baris={7} label="Memuat rencana perjalanan" />
        ) : !tujuan ? (
          <EmptyStateCard
            judul="Pilih Halte Tujuan"
            pesan="Pilih halte tujuan dari daftar, cari nama halte, atau pilih salah satu rute populer di atas."
            catatan="Data rute memakai urutan halte operasional. Jarak jalan kaki dihitung garis lurus."
          />
        ) : tujuan.id === asal?.id ? (
          <EmptyStateCard
            judul="Halte Asal dan Tujuan Sama"
            pesan="Pilih halte tujuan yang berbeda dari halte asal."
            aksi={
              <button
                type="button"
                onClick={() => setTujuanId("")}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep active:translate-y-px"
              >
                Pilih Tujuan Lain
              </button>
            }
          />
        ) : rencana && asal && tujuan ? (
          <>
            <RoutePlanCard
              koridor={rencana.koridor}
              asal={asal}
              tujuan={tujuan}
              trip={rencana.trip}
              tibaMenit={rencana.tibaMenit}
              jarakKm={rencana.jarakKm}
              jalanKakiMenit={rencana.jalanKakiMenit}
              besok={rencana.besok}
              teksBagikan={teksBagikan}
            />
            <div className="flex flex-wrap gap-2">
              <HonestyBadge jenis="perkiraan" label="Estimasi Jarak" />
              <HonestyBadge jenis="publik" label="Urutan Halte Operasional" />
            </div>
          </>
        ) : transit ? (
          <TransitPlanCard rencana={transit} />
        ) : arahBalik ? (
          <ArahBalikCard rencana={arahBalik} />
        ) : (
          <EmptyStateCard
            judul="Jadwal Belum Tersedia"
            pesan="Belum ada trip yang dapat ditampilkan untuk rute ini."
            aksi={
              <Link
                href="/peta"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-elevated"
              >
                Lihat Peta & Halte
              </Link>
            }
          />
        )}
        </div>
      </div>
    </div>
  );
}
