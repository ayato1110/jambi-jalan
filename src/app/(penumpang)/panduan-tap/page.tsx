"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { bacaTeks, dukunganSuara, hentikanSuara } from "@/lib/speechHelper";

const langgananKosong = () => () => undefined;

type IdPanduan = "ktp" | "emoney" | "sim";

interface Panduan {
  id: IdPanduan;
  label: string;
  judul: string;
  ringkas: string;
  langkah: string[];
  catatan: string;
}

const PANDUAN: Panduan[] = [
  {
    id: "ktp",
    label: "KTP Elektronik",
    judul: "Tap KTP Elektronik",
    ringkas: "KTP Elektronik dipakai sebagai identitas penumpang saat naik bus.",
    langkah: [
      "Siapkan KTP Elektronik yang masih aktif dan tidak rusak.",
      "Tempelkan KTP pada pembaca kartu yang tersedia di dalam bus.",
      "Tunggu konfirmasi perangkat atau petugas sebelum mengambil kartu kembali.",
    ],
    catatan: "Tidak ada biaya tambahan untuk tap KTP.",
  },
  {
    id: "emoney",
    label: "Uang Elektronik",
    judul: "Tap Kartu Uang Elektronik",
    ringkas: "Kartu uang elektronik dipakai untuk tap saat naik bus.",
    langkah: [
      "Pastikan kartu uang elektronik aktif dan tidak rusak.",
      "Tempelkan kartu pada pembaca saat naik bus.",
      "Tunggu konfirmasi, lalu simpan kartu sampai perjalanan selesai.",
    ],
    catatan: "Tarif saat ini Rp0 selama masa sosialisasi.",
  },
  {
    id: "sim",
    label: "SIM",
    judul: "Tap SIM",
    ringkas: "SIM yang masih berlaku dapat dipakai sebagai identitas penumpang.",
    langkah: [
      "Siapkan SIM yang masih berlaku.",
      "Tempelkan SIM pada pembaca kartu di dalam bus.",
      "Tunggu konfirmasi perangkat atau petugas.",
    ],
    catatan: "Tarif saat ini Rp0 selama masa sosialisasi.",
  },
];

function Ilustrasi({ id }: { id: IdPanduan }) {
  if (id === "ktp") {
    return (
      <svg viewBox="0 0 240 130" className="h-36 w-full" aria-hidden="true">
        <rect x="18" y="20" width="150" height="92" rx="8" fill="#F6F5F0" stroke="#111C18" strokeWidth="2" />
        <rect x="30" y="34" width="38" height="28" rx="4" fill="#B45309" />
        <rect x="36" y="42" width="26" height="4" rx="2" fill="#FEF3C7" />
        <rect x="36" y="50" width="26" height="4" rx="2" fill="#FEF3C7" />
        <circle cx="52" cy="82" r="13" fill="#D5D2C8" />
        <rect x="76" y="40" width="76" height="6" rx="3" fill="#111C18" />
        <rect x="76" y="52" width="58" height="6" rx="3" fill="#3F4D47" />
        <rect x="76" y="64" width="66" height="6" rx="3" fill="#3F4D47" />
        <rect x="76" y="80" width="42" height="6" rx="3" fill="#0F766E" />
        <rect x="188" y="48" width="34" height="46" rx="6" fill="#111C18" />
        <path d="M196 62c6-7 14-7 20 0M200 70c4-4 8-4 12 0M204 78c1-1 3-1 4 0" stroke="#F6F5F0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "emoney") {
    return (
      <svg viewBox="0 0 240 130" className="h-36 w-full" aria-hidden="true">
        <rect x="18" y="28" width="136" height="82" rx="8" fill="#0F766E" />
        <rect x="32" y="42" width="34" height="24" rx="4" fill="#FEF3C7" />
        <rect x="32" y="78" width="74" height="6" rx="3" fill="#E6F4F1" />
        <rect x="32" y="90" width="52" height="6" rx="3" fill="#E6F4F1" />
        <path d="M122 58c8-9 18-9 26 0M128 67c5-5 11-5 16 0M134 76c2-2 5-2 7 0" stroke="#F6F5F0" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="182" y="40" width="40" height="58" rx="6" fill="#111C18" />
        <rect x="190" y="52" width="24" height="18" rx="3" fill="#E6F4F1" />
        <path d="M194 84l4 4 9-10" stroke="#0F766E" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 240 130" className="h-36 w-full" aria-hidden="true">
      <rect x="18" y="20" width="150" height="92" rx="8" fill="#F6F5F0" stroke="#111C18" strokeWidth="2" />
      <rect x="30" y="34" width="54" height="6" rx="3" fill="#B45309" />
      <circle cx="56" cy="76" r="17" fill="#D5D2C8" />
      <rect x="86" y="44" width="64" height="6" rx="3" fill="#111C18" />
      <rect x="86" y="56" width="52" height="6" rx="3" fill="#3F4D47" />
      <rect x="86" y="72" width="38" height="6" rx="3" fill="#0F766E" />
      <circle cx="118" cy="94" r="13" fill="none" stroke="#111C18" strokeWidth="3" />
      <path d="M118 84v10l8 5" stroke="#111C18" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="188" y="48" width="34" height="46" rx="6" fill="#111C18" />
      <path d="M196 62c6-7 14-7 20 0M200 70c4-4 8-4 12 0" stroke="#F6F5F0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function PanduanTapPage() {
  const [aktif, setAktif] = useState<IdPanduan>("ktp");
  const [pesan, setPesan] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const didukung = useSyncExternalStore(langgananKosong, dukunganSuara, () => true);

  const panduan = PANDUAN.find((item) => item.id === aktif) ?? PANDUAN[0];

  useEffect(() => () => hentikanSuara(), []);

  const pindahTab = (id: IdPanduan) => {
    hentikanSuara();
    setPesan(null);
    setAktif(id);
    document.getElementById(`tab-${id}`)?.focus();
  };

  const tekanTab = (event: KeyboardEvent<HTMLButtonElement>, indeks: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const arah = event.key === "ArrowRight" ? 1 : -1;
      const berikut = PANDUAN[(indeks + arah + PANDUAN.length) % PANDUAN.length];
      pindahTab(berikut.id);
    }
    if (event.key === "Home") {
      event.preventDefault();
      pindahTab(PANDUAN[0].id);
    }
    if (event.key === "End") {
      event.preventDefault();
      pindahTab(PANDUAN[PANDUAN.length - 1].id);
    }
  };

  const bacakan = () => {
    const kalimat = [
      `Panduan ${panduan.judul}.`,
      ...panduan.langkah.map((langkah, i) => `Langkah ${i + 1}. ${langkah}`),
      panduan.catatan,
    ].join(" ");

    const berhasil = bacaTeks(kalimat, { onSelesai: () => setPesan(null) });
    setPesan(
      berhasil
        ? "Pembaca suara sedang membacakan panduan."
        : "Pembaca suara tidak dapat dijalankan di peramban ini.",
    );
  };

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pt-6">
      <header className="mb-4">
        <p className="text-xs font-semibold text-brand-deep">Panduan Tap</p>
        <h1 className="mt-1 text-[1.375rem] font-bold leading-tight text-ink">
          Panduan Tap Kartu
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Sejak 1 April 2026, penumpang wajib tap KTP, SIM, atau kartu uang elektronik saat naik bus.
        </p>
      </header>

      <div className="space-y-4">
        <div role="tablist" aria-label="Pilih jenis kartu" className="grid grid-cols-3 gap-2">
          {PANDUAN.map((item, indeks) => {
            const dipilih = item.id === aktif;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={dipilih}
                aria-controls={`panel-${item.id}`}
                tabIndex={dipilih ? 0 : -1}
                onClick={() => {
                  hentikanSuara();
                  setPesan(null);
                  setAktif(item.id);
                }}
                onKeyDown={(event) => tekanTab(event, indeks)}
                className={`min-h-12 rounded-lg border px-2 text-xs font-semibold leading-tight active:translate-y-px ${
                  dipilih
                    ? "border-line-strong bg-brand-soft text-brand-deep"
                    : "border-line bg-surface text-ink-secondary hover:bg-elevated"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <section
          id={`panel-${panduan.id}`}
          ref={panelRef}
          role="tabpanel"
          aria-labelledby={`tab-${panduan.id}`}
          tabIndex={0}
          className="rounded-xl border border-line bg-surface p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          <h2 className="text-lg font-semibold text-ink">{panduan.judul}</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{panduan.ringkas}</p>

          <div className="mt-4 rounded-lg border border-line bg-canvas p-3">
            <Ilustrasi id={panduan.id} />
          </div>

          <ol className="mt-4 space-y-3">
            {panduan.langkah.map((langkah, indeks) => (
              <li key={langkah} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-board text-sm font-bold text-white">
                  {indeks + 1}
                </span>
                <span className="pt-1 text-sm leading-relaxed text-ink-secondary">{langkah}</span>
              </li>
            ))}
          </ol>

          <div className="mt-4 rounded-lg border border-amber bg-amber-soft p-3">
            <p className="text-xs font-semibold text-amber-deep">Catatan tarif</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-deep">
              Tarif saat ini Rp0 selama masa sosialisasi. Tarif dapat berubah mengikuti pengumuman
              resmi Dishub Kota Jambi.
            </p>
          </div>

          <button
            type="button"
            onClick={bacakan}
            disabled={!didukung}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-elevated active:translate-y-px disabled:bg-elevated disabled:text-ink-muted"
          >
            Bacakan Panduan
          </button>
          {!didukung ? (
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Perangkat ini belum mendukung pembaca suara otomatis. Gunakan tombol Teks Besar (A+)
              di header.
            </p>
          ) : null}
          {pesan ? (
            <p role="status" className="mt-2 text-xs leading-relaxed text-ink-muted">
              {pesan}
            </p>
          ) : null}
        </section>

        <p className="text-xs leading-relaxed text-ink-muted">
          Panduan ini menjelaskan alur umum. Aturan resmi tetap mengikuti Dishub Kota Jambi.
        </p>
      </div>
    </div>
  );
}
