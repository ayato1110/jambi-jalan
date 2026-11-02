import { HonestyBadge } from "@/components/ui/HonestyBadge";

const DATA_PUBLIK = [
  {
    komponen: "Koridor dan urutan halte",
    isi: "3 koridor, 99 titik halte. K1 31 titik, K2 34 titik, K3 34 titik.",
    sumber: "Tribun Jambi 16 Juli 2025, Jentik 29 April 2026, Metro Jambi 24 Juli 2025",
  },
  {
    komponen: "Jadwal keberangkatan",
    isi: "8 trip dari Terminal Rawasari. Keberangkatan utama 05.30 sampai 18.00, dengan versi alternatif sampai 19.30. Trip 5 sampai 8 memiliki dua versi waktu di pemberitaan.",
    sumber: "Publikasi jadwal Trans Bahagia dan pemberitaan terkait",
  },
  {
    komponen: "Armada",
    isi: "3 bus medium 26 kursi dan 3 angkot listrik 10 kursi. Tambahan Oktober 2025: 1 bus medium dan 3 angkot listrik.",
    sumber: "Kalista, 2025",
  },
  {
    komponen: "Hasil uji coba 2025",
    isi: "36.040 penumpang, 3.066 trip, rata-rata sekitar 12 penumpang per trip, dan klaim penurunan emisi 30 persen.",
    sumber: "Goodcar, 2025 dan Kalista, 2025",
  },
];

const DATA_CONTOH = [
  {
    komponen: "Koordinat halte",
    isi: "Titik peta hasil interpolasi jangkar kota, bukan koordinat resmi Dishub.",
    label: "Perkiraan",
  },
  {
    komponen: "Jadwal arah balik",
    isi: "Jadwal K2 dari Alam Barajo ke Rawasari adalah asumsi tim. Sumber publik hanya memuat keberangkatan dari Terminal Rawasari.",
    label: "Asumsi",
  },
  {
    komponen: "Posisi bus langsung",
    isi: "Berasal dari ping ponsel pramudi saat demo, bukan alat GPS resmi armada.",
    label: "Data contoh",
  },
  {
    komponen: "Kepenuhan per trip",
    isi: "Tingkat Longgar, Sedang, dan Padat disusun dari pola jam sibuk, bukan hitungan penumpang per halte.",
    label: "Data contoh",
  },
  {
    komponen: "Permintaan per halte dan jam",
    isi: "Matriks permintaan pada dashboard Dishub adalah data contoh untuk evaluasi simulasi.",
    label: "Data contoh",
  },
  {
    komponen: "Hasil simulator tarif dan armada",
    isi: "Angka penumpang, pendapatan, headway, dan keterisian adalah keluaran rumus dengan asumsi yang dapat diubah.",
    label: "Asumsi simulasi",
  },
];

const INKONSISTENSI = [
  {
    topik: "Trip 5",
    versiA: "Tiba 13.45",
    versiB: "Tiba 14.30",
    sikap: "Jam utama 13.45 ditampilkan, versi 14.30 ditulis sebagai catatan sumber.",
  },
  {
    topik: "Trip 6",
    versiA: "Berangkat 14.30, tiba 15.15",
    versiB: "Berangkat 15.30, tiba 16.30",
    sikap: "Jam utama dipakai, dua versi ditulis pada kartu trip.",
  },
  {
    topik: "Trip 7",
    versiA: "Berangkat 16.00, tiba 16.45",
    versiB: "Berangkat 17.30, tiba 18.30",
    sikap: "Jam utama dipakai, dua versi ditulis pada kartu trip.",
  },
  {
    topik: "Trip 8",
    versiA: "Berangkat 18.00, tiba 18.45",
    versiB: "Berangkat 19.30, tiba 20.30",
    sikap: "Jam utama dipakai, dua versi ditulis pada kartu trip.",
  },
  {
    topik: "Arah balik K2",
    versiA: "Tidak dipublikasikan",
    versiB: "Dibutuhkan untuk layar penumpang",
    sikap: "Diberi label asumsi dan tidak diklaim sebagai jadwal resmi.",
  },
  {
    topik: "Rincian 4 unit tambahan",
    versiA: "4 unit kendaraan listrik",
    versiB: "Rincian jenis tidak dirinci dalam ringkasan berita",
    sikap: "Aplikasi memakai rincian 1 bus medium dan 3 angkot listrik sesuai data armada.",
  },
  {
    topik: "Penurunan emisi",
    versiA: "30 persen",
    versiB: "Belum diaudit ulang oleh tim",
    sikap: "Angka ditampilkan sebagai klaim sumber Kalista, bukan hasil ukur tim.",
  },
];

function TabelData({
  caption,
  kolom,
  baris,
}: {
  caption: string;
  kolom: string[];
  baris: string[][];
}) {
  return (
    <>
      <div className="mt-3 hidden overflow-x-auto rounded-xl border border-line sm:block">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-elevated">
            <tr>
              {kolom.map((judul) => (
                <th key={judul} scope="col" className="p-3 font-semibold text-ink">
                  {judul}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {baris.map((row) => (
              <tr key={row[0]}>
                {row.map((sel, indeks) =>
                  indeks === 0 ? (
                    <th key={indeks} scope="row" className="p-3 align-top font-semibold text-ink">
                      {sel}
                    </th>
                  ) : (
                    <td key={indeks} className="p-3 align-top text-ink-secondary">
                      {sel}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-3 space-y-3 sm:hidden">
        {baris.map((row) => (
          <li key={row[0]} className="rounded-xl border border-line bg-surface p-3">
            <p className="text-sm font-semibold text-ink">{row[0]}</p>
            <dl className="mt-2 space-y-2">
              {row.slice(1).map((sel, indeks) => (
                <div key={kolom[indeks + 1]}>
                  <dt className="text-xs font-medium text-ink-muted">{kolom[indeks + 1]}</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-ink-secondary">{sel}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function TentangDataPage() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pt-6">
      <header className="mb-5">
        <p className="text-xs font-semibold text-brand-deep">Tentang Data</p>
        <h1 className="mt-1 text-[1.375rem] font-bold leading-tight text-ink">
          Sumber Data dan Batasannya
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Halaman ini memisahkan data publik dari data contoh, perkiraan, dan asumsi simulasi.
        </p>
      </header>

      <div className="space-y-6">
        <section aria-labelledby="judul-publik">
          <h2 id="judul-publik" className="text-lg font-semibold text-ink">
            Data Publik
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
            Data berikut berasal dari publikasi atau pemberitaan yang dicantumkan sumbernya.
          </p>
          <TabelData
            caption="Tabel data publik dan sumbernya"
            kolom={["Komponen", "Isi", "Sumber"]}
            baris={DATA_PUBLIK.map((baris) => [baris.komponen, baris.isi, baris.sumber])}
          />
        </section>

        <section aria-labelledby="judul-contoh">
          <h2 id="judul-contoh" className="text-lg font-semibold text-ink">
            Data Contoh dan Perkiraan
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
            Bagian ini tidak boleh dibaca sebagai angka resmi Dishub.
          </p>
          <TabelData
            caption="Tabel data contoh, perkiraan, dan asumsi"
            kolom={["Komponen", "Penjelasan", "Label"]}
            baris={DATA_CONTOH.map((baris) => [baris.komponen, baris.isi, baris.label])}
          />
        </section>

        <section aria-labelledby="judul-inkonsistensi">
          <h2 id="judul-inkonsistensi" className="text-lg font-semibold text-ink">
            Inkonsistensi Sumber Berita
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
            Perbedaan berikut ditemukan saat tim menyusun data. Aplikasi memilih satu angka utama
            dan menampilkan catatan agar perbedaan tidak hilang.
          </p>
          <TabelData
            caption="Tabel inkonsistensi sumber berita"
            kolom={["Topik", "Versi A", "Versi B", "Sikap aplikasi"]}
            baris={INKONSISTENSI.map((baris) => [
              baris.topik,
              baris.versiA,
              baris.versiB,
              baris.sikap,
            ])}
          />
        </section>

        <section aria-labelledby="judul-label" className="rounded-xl border border-line bg-surface p-4">
          <h2 id="judul-label" className="text-lg font-semibold text-ink">
            Cara Kami Memberi Label
          </h2>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ink-secondary">
            <li className="flex flex-wrap items-center gap-2">
              <HonestyBadge jenis="publik" />
              <span>Data yang berasal dari publikasi atau pemberitaan.</span>
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <HonestyBadge jenis="data-contoh" />
              <span>Angka contoh untuk latihan tampilan atau evaluasi.</span>
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <HonestyBadge jenis="perkiraan" />
              <span>Perhitungan dari jadwal dan posisi terakhir ketika sinyal tidak tersedia.</span>
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <HonestyBadge jenis="asumsi" />
              <span>Keluaran simulator atau asumsi tim yang dapat berubah.</span>
            </li>
          </ul>
        </section>

        <section aria-labelledby="judul-catatan" className="rounded-xl border border-amber bg-amber-soft p-4">
          <h2 id="judul-catatan" className="text-sm font-semibold text-amber-deep">
            Catatan Penting
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-deep">
            JAMBI JALAN bukan penentu kebijakan resmi, tidak memproses pembayaran, dan tidak
            menggantikan pengumuman Dishub Kota Jambi. Tarif Rp0 dan jadwal dapat berubah. Klaim
            penurunan emisi 30 persen berasal dari materi Kalista dan belum diaudit ulang oleh tim.
          </p>
        </section>
      </div>
    </div>
  );
}
