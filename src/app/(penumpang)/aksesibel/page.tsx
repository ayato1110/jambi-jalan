"use client";

import { useState, useSyncExternalStore } from "react";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { bacaTeks, dukunganSuara } from "@/lib/speechHelper";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

const langgananKosong = () => () => undefined;

function Saklar({
  id,
  judul,
  deskripsi,
  aktif,
  onUbah,
}: {
  id: string;
  judul: string;
  deskripsi: string;
  aktif: boolean;
  onUbah: (aktif: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {judul}
        </label>
        <p id={`${id}-deskripsi`} className="mt-1 text-xs leading-relaxed text-ink-secondary">
          {deskripsi}
        </p>
      </div>

      <label className="relative inline-flex min-h-11 min-w-14 shrink-0 cursor-pointer items-center justify-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={aktif}
          onChange={(event) => onUbah(event.target.checked)}
          aria-describedby={`${id}-deskripsi`}
          aria-label={judul}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative inline-flex h-7 w-12 items-center rounded-full border border-line-strong bg-elevated transition-colors duration-150 peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1.5 top-1/2 size-5 -translate-y-1/2 rounded-full border border-line-strong bg-white transition-transform duration-150 peer-checked:translate-x-5"
        />
      </label>
    </div>
  );
}

export default function AksesibelPage() {
  const modeAksesibel = useJambiJalanStore((state) => state.modeAksesibel);
  const kontrasTinggi = useJambiJalanStore((state) => state.kontrasTinggi);
  const suaraOtomatis = useJambiJalanStore((state) => state.suaraOtomatis);
  const setModeAksesibel = useJambiJalanStore((state) => state.setModeAksesibel);
  const setKontrasTinggi = useJambiJalanStore((state) => state.setKontrasTinggi);
  const setSuaraOtomatis = useJambiJalanStore((state) => state.setSuaraOtomatis);

  const [pesan, setPesan] = useState<string | null>(null);
  const didukung = useSyncExternalStore(langgananKosong, dukunganSuara, () => true);

  const ujiSuara = () => {
    const berhasil = bacaTeks(
      "Pratinjau mode aksesibel. Trip berikutnya pukul tujuh pagi. Sekitar sepuluh menit lagi. Perkiraan kondisi bus padat.",
      { onSelesai: () => setPesan(null) },
    );
    setPesan(
      berhasil
        ? "Pembaca suara sedang membacakan pratinjau."
        : "Pembaca suara tidak dapat dijalankan di peramban ini.",
    );
  };

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-6">
      <header className="mb-4">
        <p className="text-xs font-semibold text-brand-deep">Mode Aksesibel</p>
        <h1 className="mt-1 text-[1.375rem] font-bold leading-tight text-ink">
          Pengaturan Aksesibel
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Atur ukuran teks, kontras, dan suara. Pengaturan tersimpan di peramban ini.
        </p>
      </header>

      <div className="space-y-4">
        <div className="space-y-3">
          <Saklar
            id="teks-besar"
            judul="Ukuran Teks Besar (+25%)"
            deskripsi="Menaikkan ukuran teks seluruh halaman agar lebih mudah dibaca."
            aktif={modeAksesibel}
            onUbah={setModeAksesibel}
          />
          <Saklar
            id="kontras-tinggi"
            judul="Mode Kontras Tinggi"
            deskripsi="Mengganti latar menjadi putih dan menebalkan garis menjadi 2px."
            aktif={kontrasTinggi}
            onUbah={setKontrasTinggi}
          />
          <Saklar
            id="suara-otomatis"
            judul="Pembaca Suara Otomatis"
            deskripsi="Membacakan jadwal di Beranda saat data siap. Suara tetap dapat dihentikan dari tombol A+."
            aktif={suaraOtomatis}
            onUbah={setSuaraOtomatis}
          />
        </div>

        <section aria-labelledby="judul-pratinjau" className="rounded-xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="judul-pratinjau" className="text-lg font-semibold text-ink">
              Pratinjau Langsung
            </h2>
            <HonestyBadge jenis="data-contoh" />
          </div>

          <div className="mt-3 rounded-lg border border-line bg-canvas p-4">
            <p className="text-xs font-medium text-ink-muted">Trip berikutnya</p>
            <p className="mt-1 font-mono text-4xl font-bold leading-none tabular text-ink">
              07:00 <span className="text-sm font-medium text-ink-muted">WIB</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Sekitar 10 menit lagi dari Terminal Rawasari. Perkiraan kondisi bus Padat.
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              Teks pratinjau untuk melihat ukuran huruf dan ketebalan garis.
            </p>
          </div>

          <button
            type="button"
            onClick={ujiSuara}
            disabled={!didukung}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep active:translate-y-px disabled:bg-elevated disabled:text-ink-muted"
          >
            Uji Suara Sekarang
          </button>

          {!didukung ? (
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Perangkat ini belum mendukung pembaca suara otomatis. Pengaturan teks besar dan
              kontras tetap dapat digunakan.
            </p>
          ) : null}
          {pesan ? (
            <p role="status" className="mt-2 text-xs leading-relaxed text-ink-muted">
              {pesan}
            </p>
          ) : null}
        </section>

        <button
          type="button"
          onClick={() => {
            setModeAksesibel(false);
            setKontrasTinggi(false);
            setSuaraOtomatis(false);
            setPesan(null);
          }}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink-secondary hover:bg-elevated"
        >
          Kembalikan Pengaturan Standar
        </button>

        <p className="text-xs leading-relaxed text-ink-muted">
          Pengaturan tersimpan di perangkat ini. Jika penyimpanan diblokir, pengaturan tetap berlaku
          selama halaman ini terbuka.
        </p>
      </div>
    </div>
  );
}
