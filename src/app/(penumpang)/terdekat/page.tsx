"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { ErrorFallbackCard } from "@/components/ui/ErrorFallbackCard";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { HALTE_MAP, HALTE_PER_KORIDOR } from "@/data/halte";
import { KORIDOR_MAP } from "@/data/koridor";
import { cariHalteTerdekat, formatJarak } from "@/lib/geoUtils";
import type { Halte } from "@/lib/types";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

type StatusLokasi = "idle" | "memuat" | "siap" | "gagal";

interface Lokasi {
  lat: number;
  lng: number;
  nama: string;
}

const TITIK_SIMULASI: Lokasi[] = [
  { nama: "Terminal Rawasari", lat: -1.5944, lng: 103.6158 },
  { nama: "Sipin", lat: -1.6115, lng: 103.589 },
  { nama: "Simpang Kawat", lat: -1.6235, lng: 103.593 },
  { nama: "Terminal Alam Barajo", lat: -1.6358, lng: 103.5583 },
  { nama: "Paal X", lat: -1.658, lng: 103.612 },
];

const HALTE_UTAMA = [
  HALTE_PER_KORIDOR.K1[0],
  HALTE_PER_KORIDOR.K2[0],
  HALTE_MAP.get("K3-33") ?? HALTE_PER_KORIDOR.K3[HALTE_PER_KORIDOR.K3.length - 1],
].filter((halte): halte is Halte => Boolean(halte));

export default function HalteTerdekatPage() {
  const router = useRouter();
  const daftarHalte = useJambiJalanStore((state) => state.daftarHalte);
  const setHalteKeberangkatan = useJambiJalanStore((state) => state.setHalteKeberangkatan);

  const [lokasi, setLokasi] = useState<Lokasi | null>(null);
  const [status, setStatus] = useState<StatusLokasi>("idle");
  const [pesanGagal, setPesanGagal] = useState("");

  const hasil = useMemo(() => {
    if (!lokasi) return [];
    return cariHalteTerdekat(daftarHalte, lokasi.lat, lokasi.lng, 12);
  }, [daftarHalte, lokasi]);

  const mintaGps = () => {
    if (!("geolocation" in navigator)) {
      setStatus("gagal");
      setPesanGagal("Perangkat ini tidak mendukung pembacaan lokasi GPS.");
      return;
    }

    setStatus("memuat");
    setPesanGagal("");

    navigator.geolocation.getCurrentPosition(
      (posisi) => {
        setLokasi({
          lat: posisi.coords.latitude,
          lng: posisi.coords.longitude,
          nama: "Lokasi GPS perangkat",
        });
        setStatus("siap");
      },
      (error) => {
        setStatus("gagal");
        setPesanGagal(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi belum aktif. Pilih lokasi perkiraan Anda di bawah ini agar daftar halte terdekat tetap bisa dihitung."
            : "Lokasi tidak dapat dibaca. Pilih lokasi perkiraan Anda di bawah ini.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const pilihSimulasi = (titik: Lokasi) => {
    setLokasi(titik);
    setStatus("siap");
    setPesanGagal("");
  };

  const pilihSebagaiAsal = (halteId: string) => {
    setHalteKeberangkatan(halteId);
    router.push("/rencana");
  };

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-6">
      <header className="mb-4">
        <p className="text-xs font-semibold text-brand-deep">Halte Terdekat</p>
        <h1 className="mt-1 text-[1.375rem] font-bold leading-tight text-ink">
          Cari Halte Terdekat
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Gunakan GPS perangkat atau pilih lokasi simulasi Kota Jambi. Lokasi hanya dipakai di
          perangkat ini.
        </p>
      </header>

      <div className="space-y-4">
        <section aria-label="Ambil lokasi" className="rounded-xl border border-line bg-surface p-4">
          <button
            type="button"
            onClick={mintaGps}
            disabled={status === "memuat"}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep active:translate-y-px disabled:bg-elevated disabled:text-ink-muted"
          >
            {status === "memuat" ? "Mencari Lokasi GPS..." : "Ambil Lokasi GPS Saya"}
          </button>

          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            Jika izin GPS ditolak, pilih salah satu lokasi simulasi di bawah ini.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {TITIK_SIMULASI.map((titik) => (
              <button
                key={titik.nama}
                type="button"
                onClick={() => pilihSimulasi(titik)}
                aria-pressed={lokasi?.nama === titik.nama}
                className={`min-h-11 rounded-lg border px-2 text-xs font-semibold active:translate-y-px ${
                  lokasi?.nama === titik.nama
                    ? "border-brand bg-brand-soft text-brand-deep"
                    : "border-line bg-canvas text-ink-secondary hover:bg-elevated"
                }`}
              >
                {titik.nama}
              </button>
            ))}
            <Link
              href="/rencana"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-canvas px-2 text-xs font-semibold text-ink-secondary hover:bg-elevated"
            >
              Kembali ke Rencana
            </Link>
          </div>

          <p role="status" aria-live="polite" className="mt-3 text-xs leading-relaxed text-ink-secondary">
            {lokasi ? `Lokasi aktif: ${lokasi.nama}.` : "Belum ada lokasi yang dipilih."}
          </p>
        </section>

        {status === "gagal" ? (
          <ErrorFallbackCard
            judul="Lokasi belum aktif"
            pesan={pesanGagal}
            labelAksi="Coba GPS Lagi"
            onAksi={mintaGps}
          />
        ) : null}

        {status === "memuat" ? (
          <SkeletonBlock baris={5} label="Membaca lokasi dan menghitung jarak halte" />
        ) : hasil.length > 0 ? (
          <section aria-label="Daftar halte terdekat" className="rounded-xl border border-line bg-surface">
            <div className="border-b border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-ink">12 Halte Terdekat</h2>
                <HonestyBadge jenis="perkiraan" label="Jarak Lurus" />
              </div>
              <p className="mt-1 text-xs text-ink-secondary">
                Diurutkan dari {lokasi?.nama}. Jarak memakai garis lurus.
              </p>
            </div>
            <ul className="divide-y divide-line">
              {hasil.map((item) => {
                const koridor = KORIDOR_MAP[item.halte.koridorId];
                return (
                  <li key={item.halte.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex rounded-md px-1.5 py-0.5 text-xs font-bold text-white"
                          style={{ backgroundColor: koridor.warnaHex }}
                        >
                          {item.halte.koridorId}
                        </span>
                        <span className="text-sm font-semibold text-ink">{item.halte.nama}</span>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">
                        {formatJarak(item.jarakKm)} dari lokasi, sekitar {item.jalanKakiMenit} menit
                        jalan kaki
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => pilihSebagaiAsal(item.halte.id)}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface px-3 text-xs font-semibold text-ink hover:bg-elevated active:translate-y-px"
                    >
                      Jadikan Halte Asal
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <section aria-label="Halte utama per koridor" className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-lg font-semibold text-ink">Halte Utama per Koridor</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
              Pilih lokasi di atas untuk melihat urutan halte terdekat.
            </p>
            <ul className="mt-3 divide-y divide-line">
              {HALTE_UTAMA.map((halte) => {
                const koridor = KORIDOR_MAP[halte.koridorId];
                return (
                  <li key={halte.id} className="flex items-center gap-3 py-3">
                    <span
                      className="inline-flex shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: koridor.warnaHex }}
                    >
                      {halte.koridorId}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{halte.nama}</p>
                      <p className="text-xs text-ink-muted">{koridor.nama}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => pilihSebagaiAsal(halte.id)}
                      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas px-2 text-xs font-semibold text-ink-secondary hover:bg-elevated"
                    >
                      Pilih
                    </button>
                  </li>
                );
              })}
            </ul>
            {daftarHalte.length === 0 ? (
              <EmptyStateCard
                judul="Belum Ada Halte"
                pesan="Data halte belum tersedia di perangkat ini."
                className="mt-4"
              />
            ) : null}
          </section>
        )}
      </div>
    </div>
  );
}
