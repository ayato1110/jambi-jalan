"use client";

import { useRef, useState, type FormEvent } from "react";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { HonestyBadge } from "@/components/ui/HonestyBadge";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { HALTE_PER_KORIDOR } from "@/data/halte";
import { KORIDOR } from "@/data/koridor";
import { useStoreHydrated } from "@/lib/useStoreHydrated";
import type { Halte, KoridorId } from "@/lib/types";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

interface FormHalte {
  nama: string;
  namaSumber: string;
  koridorId: KoridorId;
  urutan: string;
  lat: string;
  lng: string;
}

function formBaru(koridorId: KoridorId, daftarHalte: Halte[]): FormHalte {
  const daftar = daftarHalte
    .filter((halte) => halte.koridorId === koridorId)
    .sort((a, b) => a.urutan - b.urutan);
  const akhir = daftar[daftar.length - 1] ?? HALTE_PER_KORIDOR[koridorId][0];

  return {
    nama: "",
    namaSumber: "",
    koridorId,
    urutan: String((akhir?.urutan ?? 0) + 1),
    lat: String(akhir?.lat ?? -1.6),
    lng: String(akhir?.lng ?? 103.6),
  };
}

export default function KelolaRutePage() {
  const daftarHalte = useJambiJalanStore((state) => state.daftarHalte);
  const tambahHalte = useJambiJalanStore((state) => state.tambahHalte);
  const ubahHalte = useJambiJalanStore((state) => state.ubahHalte);
  const kembalikanHaltePublik = useJambiJalanStore((state) => state.kembalikanHaltePublik);
  const hidrasi = useStoreHydrated();

  const [cari, setCari] = useState("");
  const [filterKoridor, setFilterKoridor] = useState<KoridorId | "SEMUA">("SEMUA");
  const [form, setForm] = useState<FormHalte>(() => formBaru("K1", daftarHalte));
  const [editId, setEditId] = useState<string | null>(null);
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [pesan, setPesan] = useState<{ tipe: "sukses" | "gagal"; teks: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const kueri = cari.trim().toLowerCase();
  const hasil = daftarHalte
    .filter((halte) => {
      const cocokKoridor = filterKoridor === "SEMUA" || halte.koridorId === filterKoridor;
      const cocokCari =
        !kueri ||
        `${halte.nama} ${halte.namaSumber} ${halte.id}`.toLowerCase().includes(kueri);
      return cocokKoridor && cocokCari;
    })
    .sort((a, b) => a.koridorId.localeCompare(b.koridorId) || a.urutan - b.urutan);

  if (!hidrasi) {
    return (
      <div className="space-y-4">
        <header>
          <p className="text-xs font-semibold text-brand-deep">Dashboard Dishub</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-ink">Kelola Rute &amp; Halte</h1>
          <p className="mt-2 text-sm text-ink-secondary">Memuat data halte dari perangkat.</p>
        </header>
        <SkeletonBlock baris={10} label="Memuat tabel halte" />
      </div>
    );
  }

  const bukaTambah = () => {
    const koridorAwal = filterKoridor === "SEMUA" ? "K1" : filterKoridor;
    setEditId(null);
    setForm(formBaru(koridorAwal, daftarHalte));
    setFormTerbuka(true);
    setPesan(null);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const bukaUbah = (halte: Halte) => {
    setEditId(halte.id);
    setForm({
      nama: halte.nama,
      namaSumber: halte.namaSumber,
      koridorId: halte.koridorId,
      urutan: String(halte.urutan),
      lat: String(halte.lat),
      lng: String(halte.lng),
    });
    setFormTerbuka(true);
    setPesan(null);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const tutupForm = () => {
    setFormTerbuka(false);
    setEditId(null);
  };

  const ubahKoridorForm = (koridorId: KoridorId) => {
    setForm((lama) => {
      const baru = formBaru(koridorId, daftarHalte);
      return {
        ...baru,
        nama: lama.nama,
        namaSumber: lama.namaSumber,
      };
    });
  };

  const simpan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nama = form.nama.trim();
    const namaSumber = form.namaSumber.trim() || nama;
    const urutan = Number(form.urutan);
    const lat = Number(form.lat);
    const lng = Number(form.lng);

    if (!nama) {
      setPesan({ tipe: "gagal", teks: "Nama baku halte wajib diisi." });
      return;
    }
    if (!Number.isInteger(urutan) || urutan < 1) {
      setPesan({ tipe: "gagal", teks: "Urutan halte harus bilangan bulat minimal 1." });
      return;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setPesan({ tipe: "gagal", teks: "Koordinat lintang dan bujur harus berupa angka." });
      return;
    }

    if (editId) {
      ubahHalte(editId, {
        nama,
        namaSumber,
        lat,
        lng,
        sumberKoordinat: "perkiraan",
        isTerminal: nama.startsWith("Terminal"),
      });
      setPesan({ tipe: "sukses", teks: `${nama} berhasil diubah.` });
      tutupForm();
      return;
    }

    const id = `${form.koridorId}-${String(urutan).padStart(2, "0")}`;
    if (daftarHalte.some((halte) => halte.id === id)) {
      setPesan({
        tipe: "gagal",
        teks: `ID halte ${id} sudah dipakai. Ubah urutan atau gunakan tombol Ubah pada baris tersebut.`,
      });
      return;
    }

    tambahHalte({
      id,
      koridorId: form.koridorId,
      urutan,
      nama,
      namaSumber,
      lat,
      lng,
      sumberKoordinat: "perkiraan",
      isTerminal: nama.startsWith("Terminal"),
    });
    setPesan({ tipe: "sukses", teks: `${nama} berhasil ditambahkan.` });
    tutupForm();
  };

  const resetPublik = () => {
    const setuju = window.confirm(
      "Reset seluruh data halte ke data baku? Perubahan lokal akan dihapus.",
    );
    if (!setuju) return;

    kembalikanHaltePublik();
    setFormTerbuka(false);
    setEditId(null);
    setCari("");
    setFilterKoridor("SEMUA");
    setPesan({
      tipe: "sukses",
      teks: "Data halte dikembalikan ke 99 titik baku.",
    });
  };

  const hapusFilter = () => {
    setCari("");
    setFilterKoridor("SEMUA");
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-brand-deep">Dashboard Dishub</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-ink">Kelola Rute &amp; Halte</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
            Kelola 99 titik halte baku dan tambahan lokal. Perubahan langsung disinkronkan ke layar
            informasi penumpang.
          </p>
        </div>
        <span className="inline-flex rounded-md border border-line bg-elevated px-2 py-0.5 text-xs font-semibold text-ink-secondary">
          {daftarHalte.length} halte
        </span>
      </header>

      <section aria-label="Pencarian dan aksi halte" className="rounded-xl border border-line bg-surface p-4">
        <div className="grid gap-3 md:grid-cols-2 md:items-end xl:grid-cols-[minmax(0,1fr)_180px_auto_auto]">
          <div className="min-w-0">
            <label htmlFor="cari-halte" className="block text-sm font-semibold text-ink">
              Cari halte
            </label>
            <input
              id="cari-halte"
              type="search"
              value={cari}
              onChange={(event) => setCari(event.target.value)}
              placeholder="Nama halte, alias, atau ID"
              className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted"
            />
          </div>
          <div>
            <label htmlFor="filter-koridor" className="block text-sm font-semibold text-ink">
              Koridor
            </label>
            <select
              id="filter-koridor"
              value={filterKoridor}
              onChange={(event) => setFilterKoridor(event.target.value as KoridorId | "SEMUA")}
              className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink"
            >
              <option value="SEMUA">Semua koridor</option>
              {KORIDOR.map((koridor) => (
                <option key={koridor.id} value={koridor.id}>
                  {koridor.id}, {koridor.nama}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={bukaTambah}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep active:translate-y-px"
          >
            Tambah Halte
          </button>
          <button
            type="button"
            onClick={resetPublik}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-elevated active:translate-y-px"
          >
            Reset ke Data Baku
          </button>
        </div>

        <p className="mt-3 text-xs text-ink-secondary">
          Menampilkan {hasil.length} dari {daftarHalte.length} halte.
        </p>
      </section>

      {pesan ? (
        <p
          role={pesan.tipe === "gagal" ? "alert" : "status"}
          className={`rounded-lg border p-3 text-sm ${
            pesan.tipe === "gagal"
              ? "border-danger bg-danger-soft text-danger-deep"
              : "border-brand bg-brand-soft text-brand-deep"
          }`}
        >
          {pesan.teks}
        </p>
      ) : null}

      {formTerbuka ? (
        <section ref={formRef} aria-labelledby="judul-form-halte" className="scroll-mt-4 rounded-xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="judul-form-halte" className="text-lg font-semibold text-ink">
              {editId ? "Ubah Halte" : "Tambah Halte"}
            </h2>
            <button
              type="button"
              onClick={tutupForm}
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-canvas px-3 text-sm font-semibold text-ink hover:bg-elevated"
            >
              Tutup Form
            </button>
          </div>

          <form onSubmit={simpan} className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="nama-halte" className="block text-sm font-semibold text-ink">
                Nama baku
              </label>
              <input
                id="nama-halte"
                value={form.nama}
                onChange={(event) => setForm({ ...form, nama: event.target.value })}
                required
                className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink"
              />
            </div>
            <div>
              <label htmlFor="nama-sumber" className="block text-sm font-semibold text-ink">
                Patokan / Nama Alias
              </label>
              <input
                id="nama-sumber"
                value={form.namaSumber}
                onChange={(event) => setForm({ ...form, namaSumber: event.target.value })}
                placeholder="Contoh: depan pasar, seberang klinik"
                className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted"
              />
            </div>
            <div>
              <label htmlFor="koridor-halte" className="block text-sm font-semibold text-ink">
                Koridor
              </label>
              <select
                id="koridor-halte"
                value={form.koridorId}
                onChange={(event) => ubahKoridorForm(event.target.value as KoridorId)}
                disabled={Boolean(editId)}
                className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink disabled:bg-elevated"
              >
                {KORIDOR.map((koridor) => (
                  <option key={koridor.id} value={koridor.id}>
                    {koridor.id}, {koridor.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="urutan-halte" className="block text-sm font-semibold text-ink">
                Urutan
              </label>
              <input
                id="urutan-halte"
                type="number"
                min={1}
                value={form.urutan}
                onChange={(event) => setForm({ ...form, urutan: event.target.value })}
                disabled={Boolean(editId)}
                className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink disabled:bg-elevated"
              />
            </div>
            <div>
              <label htmlFor="lat-halte" className="block text-sm font-semibold text-ink">
                Lintang
              </label>
              <input
                id="lat-halte"
                type="number"
                step="0.000001"
                value={form.lat}
                onChange={(event) => setForm({ ...form, lat: event.target.value })}
                className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 font-mono text-sm text-ink"
              />
            </div>
            <div>
              <label htmlFor="lng-halte" className="block text-sm font-semibold text-ink">
                Bujur
              </label>
              <input
                id="lng-halte"
                type="number"
                step="0.000001"
                value={form.lng}
                onChange={(event) => setForm({ ...form, lng: event.target.value })}
                className="mt-2 min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 font-mono text-sm text-ink"
              />
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep active:translate-y-px"
              >
                Simpan Halte
              </button>
              <button
                type="button"
                onClick={tutupForm}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-canvas px-4 text-sm font-semibold text-ink hover:bg-elevated"
              >
                Batal
              </button>
            </div>
          </form>

          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
            Titik baru mengikuti koordinat koridor. Koridor dan urutan tidak diubah saat mengedit
            agar ID halte tetap stabil.
          </p>
        </section>
      ) : null}

      {hasil.length === 0 ? (
        <EmptyStateCard
          judul="Tidak ada halte dengan nama tersebut"
          pesan="Coba kata kunci lain atau hapus filter untuk melihat seluruh 99 titik halte."
          aksi={
            <button
              type="button"
              onClick={hapusFilter}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Hapus Filter
            </button>
          }
        />
      ) : (
        <section aria-labelledby="judul-tabel-halte" className="rounded-xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4">
            <h2 id="judul-tabel-halte" className="text-lg font-semibold text-ink">
              Daftar Halte
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <HonestyBadge jenis="perkiraan" label="Titik Halte Koridor" />
              <span className="text-xs text-ink-secondary">{hasil.length} baris</span>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <caption className="sr-only">Tabel data halte Trans Bahagia</caption>
              <thead className="bg-elevated">
                <tr>
                  <th scope="col" className="p-3 font-semibold text-ink">Urutan</th>
                  <th scope="col" className="p-3 font-semibold text-ink">Nama Baku</th>
                  <th scope="col" className="p-3 font-semibold text-ink">Patokan / Nama Alias</th>
                  <th scope="col" className="p-3 font-semibold text-ink">Status Koordinat</th>
                  <th scope="col" className="p-3 font-semibold text-ink">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {hasil.map((halte) => (
                  <tr key={halte.id}>
                    <td className="p-3 align-top font-mono tabular text-ink-secondary">
                      {halte.urutan}
                      <span className="block text-[0.625rem] text-ink-muted">{halte.id}</span>
                    </td>
                    <td className="p-3 align-top font-medium text-ink">{halte.nama}</td>
                    <td className="p-3 align-top text-ink-secondary">
                      {halte.namaSumber || halte.nama}
                    </td>
                    <td className="p-3 align-top text-ink-secondary">
                      {halte.sumberKoordinat === "perkiraan" ? "Titik Koridor" : "Belum ada"}
                    </td>
                    <td className="p-3 align-top">
                      <button
                        type="button"
                        onClick={() => bukaUbah(halte)}
                        className="inline-flex min-h-11 items-center rounded-lg border border-line-strong bg-surface px-3 text-xs font-semibold text-ink hover:bg-elevated"
                      >
                        Ubah
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line md:hidden">
            {hasil.map((halte) => (
              <li key={halte.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-ink-muted">
                      {halte.id}, urutan {halte.urutan}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink">{halte.nama}</p>
                    <p className="mt-1 text-xs text-ink-secondary">
                      {halte.namaSumber || halte.nama}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {halte.sumberKoordinat === "perkiraan" ? "Titik koridor" : "Belum ada"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => bukaUbah(halte)}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-line-strong bg-surface px-3 text-xs font-semibold text-ink hover:bg-elevated"
                  >
                    Ubah
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs leading-relaxed text-ink-muted">
        Nama dan urutan halte mengikuti data operasional. Perubahan langsung muncul di halaman
        Jadwal dan Peta Penumpang setelah tersinkron.
      </p>
    </div>
  );
}
