# TRD.md: Technical Requirements Document JAMBI JALAN

Dokumen ini berisi spesifikasi teknis lengkap untuk membangun prototipe **JAMBI JALAN** menggunakan Next.js App Router, TypeScript, Tailwind CSS, Zustand, dan `BroadcastChannel`.

---

## 1. Struktur Folder Proyek Next.js (`jambi-jalan/`)

```text
jambi-jalan/
├─ AGENTS.md                           # Salinan aturan kerja AI agent
├─ PRODUCT.md                          # Konteks produk & batasan data
├─ DESIGN.md                           # Panduan UI/UX & token warna
├─ package.json
├─ tsconfig.json
├─ next.config.mjs
├─ public/
│  ├─ manifest.json                    # Konfigurasi PWA
│  └─ icons/                           # Ikon SVG/PNG geometris bus listrik
├─ src/
│  ├─ app/
│  │  ├─ globals.css                   # Variabel CSS token DESIGN.md & class .mode-aksesibel
│  │  ├─ layout.tsx                    # Root layout (Plus Jakarta Sans & JetBrains Mono)
│  │  ├─ (penumpang)/
│  │  │  ├─ layout.tsx                 # Header mobile + Bottom Nav 5 menu + banner mode aksesibel
│  │  │  ├─ page.tsx                   # P1: Beranda Jadwal (Schedule-First)
│  │  │  ├─ peta/page.tsx              # P2: Peta Koridor & Garis Rute Termometer
│  │  │  ├─ rencana/page.tsx           # P3: Perencanaan Perjalanan Asal -> Tujuan
│  │  │  ├─ terdekat/page.tsx          # P4: Pencari Halte Terdekat
│  │  │  ├─ panduan-tap/page.tsx       # P5: Panduan Tap KTP / SIM / E-Money
│  │  │  ├─ aksesibel/page.tsx         # P6: Pengaturan Teks Besar, Kontras, & Suara
│  │  │  └─ tentang-data/page.tsx      # U-3: Transparansi Sumber Data Publik vs Contoh
│  │  ├─ pramudi/
│  │  │  ├─ layout.tsx                 # Layout fokus tinggi tanpa distraksi
│  │  │  ├─ page.tsx                   # D1: Pilih Armada, Koridor, & Trip
│  │  │  └─ trip/page.tsx              # D2: Panel 1-Tombol Mulai/Akhiri Trip & Replay GPS
│  │  └─ dishub/
│  │     ├─ layout.tsx                 # Sidebar navigasi Dishub (responsif di mobile)
│  │     ├─ page.tsx                   # A1: Monitoring Armada & Peringatan Gangguan
│  │     ├─ kinerja/page.tsx           # A2: Laporan Kinerja & Data Uji Coba 2025
│  │     ├─ permintaan/page.tsx        # A3: Heatmap Permintaan Halte x Jam
│  │     ├─ rute/page.tsx              # A4: Kelola Koridor & 99 Titik Halte
│  │     └─ simulator/page.tsx         # A5: Simulator Tarif & Armada (F-13)
│  ├─ components/
│  │  ├─ ui/
│  │  │  ├─ HonestyBadge.tsx           # Badge [POSISI LANGSUNG], [PERKIRAAN JADWAL], [DATA CONTOH]
│  │  │  ├─ EmptyStateCard.tsx         # Komponen keadaan kosong terstandar (R-27)
│  │  │  ├─ ErrorFallbackCard.tsx      # Komponen keadaan gagal/offline (R-27)
│  │  │  └─ SkeletonBlock.tsx          # Komponen kerangka pemuatan (R-27)
│  │  ├─ penumpang/
│  │  │  ├─ DepartureBoardCard.tsx     # Kartu Papan Keberangkatan (F-14, F-04, F-15)
│  │  │  ├─ RouteThermometer.tsx       # Garis rute vertikal berurutan + ETA per halte (F-02)
│  │  │  ├─ CorridorMap.tsx            # Peta MapLibre + fallback bagan skematik otomatis (F-01)
│  │  │  ├─ CrowdReasonSheet.tsx       # Panel alasan kepenuhan & saran jam longgar (F-04)
│  │  │  ├─ ShareWhatsAppButton.tsx    # Tombol bagikan info trip ke WhatsApp (F-17)
│  │  │  └─ SimClockBar.tsx            # Bar kecil pengatur jam simulasi untuk demo juri
│  │  ├─ pramudi/
│  │  │  ├─ GiantTripButton.tsx        # Tombol 72px Mulai/Akhiri Trip (F-07)
│  │  │  └─ TelemetryStatusCard.tsx    # Penghitung ping 10 detik, antrean offline, & saklar replay (F-08)
│  │  └─ dishub/
│  │     ├─ FleetStatusTable.tsx       # Tabel status bus + alert terlambat >10 menit (F-09)
│  │     ├─ SimulatorControlPanel.tsx  # Slider tarif, unit bus/angkot, & elastisitas (F-13)
│  │     ├─ SimulatorImpactCards.tsx   # Kartu hasil perbandingan & grafik dampak (F-13)
│  │     └─ FormulaExplanationBox.tsx  # Penjelasan transparan rumus simulator
│  ├─ data/
│  │  ├─ koridor.ts                    # Data 3 koridor resmi (K1, K2, K3)
│  │  ├─ halte.ts                      # Daftar lengkap 99 titik halte dari DATA_TRANS_BAHAGIA.md
│  │  ├─ jadwal.ts                     # 8 trip dari Rawasari + catatan waktu ganda trip 5-8
│  │  ├─ armada.ts                     # Data 3 bus medium, 3 angkot listrik, +4 unit tambahan
│  │  └─ ujiCoba2025.ts                # Data kalibrasi Goodcar (36.040 penumpang, 3.066 trip)
│  ├─ lib/
│  │  ├─ types.ts                      # Seluruh kontrak TypeScript
│  │  ├─ scheduleEngine.ts             # Perhitungan trip berikutnya, trip terakhir, & ETA
│  │  ├─ confidenceEngine.ts           # Penurunan status langsung -> perkiraan jadwal (>20 dtk)
│  │  ├─ simulatorEngine.ts            # Rumus matematis Simulator Tarif & Armada
│  │  ├─ geoUtils.ts                   # Rumus jarak Haversine & interpolasi koordinat koridor
│  │  ├─ speechHelper.ts               # Pembungkus Web Speech API Bahasa Indonesia (id-ID)
│  │  └─ broadcastSync.ts              # Sinkronisasi real-time antar-tab via BroadcastChannel
│  └─ store/
│     └─ useJambiJalanStore.ts         # Zustand store terpadu + localStorage persistence
```

---

## 2. Model Data TypeScript (`src/lib/types.ts`)

```ts
export type KoridorId = 'K1' | 'K2' | 'K3';
export type StatusKeyakinan = 'langsung' | 'perkiraan_jadwal' | 'tidak_aktif';
export type TingkatKepenuhan = 'Longgar' | 'Sedang' | 'Padat';
export type SumberData = 'publik' | 'perkiraan' | 'contoh' | 'asumsi';

export interface Halte {
  id: string;                     // Contoh: "K1-01", "K2-15", "K3-34"
  koridorId: KoridorId;
  urutan: number;                 // 1 s.d. 34
  nama: string;                   // Nama ejaan baku
  namaSumber: string;             // Nama asli dari pemberitaan berita
  lat: number;                    // Koordinat perkiraan untuk peta Kota Jambi
  lng: number;
  sumberKoordinat: 'perkiraan' | 'belum-ada';
  isTerminal?: boolean;
}

export interface Koridor {
  id: KoridorId;
  kode: string;                   // "Koridor 1", "Koridor 2", "Koridor 3"
  nama: string;
  asal: string;
  tujuan: string;
  via: string;
  jumlahTitik: number;            // K1: 31, K2: 34, K3: 34
  warnaHex: string;               // K1: #0F766E, K2: #1D4ED8, K3: #9333EA
  durasiTempuhMenit: number;      // Default 45 menit (dari jadwal 05.30 -> 06.15)
  jarakKmPerkiraan: number;       // Rata-rata ~13 km per trip (data uji coba 2025)
  sumberUrutan: string;
}

export interface JadwalTrip {
  id: string;                     // Contoh: "K1-T1"
  koridorId: KoridorId;
  nomorTrip: number;              // 1 s.d. 8
  berangkat: string;              // Format "HH:mm", misal "05:30"
  tiba: string;                   // Format "HH:mm", misal "06:15"
  berangkatAlternatif?: string;   // Untuk trip 6-8 yang memiliki 2 kemungkinan jam
  tibaAlternatif?: string;        // Untuk trip 5-8 yang memiliki 2 kemungkinan jam
  catatanWaktu?: string;          // Penjelasan jujur adanya 2 versi waktu di berita
  isAsumsiArahBalik: boolean;     // true untuk K2 (Alam Barajo -> Rawasari)
  kepenuhan: TingkatKepenuhan;
  alasanKepenuhan: string;        // Alasan kontekstual (berlabel data contoh)
  saranTripLonggar?: string;      // Jam trip alternatif yang lebih lengang
}

export interface StatusArmadaAktif {
  busId: string;                  // Contoh: "BUS-01"
  namaArmada: string;             // Contoh: "Bus Listrik Medium 01 (26 Kursi)"
  jenis: 'bus_medium' | 'angkot_listrik';
  kapasitas: number;              // 26 atau 10
  koridorId: KoridorId;
  tripId: string;
  statusTrip: 'terjadwal' | 'berjalan' | 'selesai' | 'terlambat_mulai';
  indeksHalteSekarang: number;    // Posisi progres di sepanjang urutan halte (float, misal 4.5)
  lat: number;
  lng: number;
  terakhirDiperbaruiMs: number;   // Timestamp epoch ms saat ping terakhir diterima
  sinyalDiputusSimulasi: boolean; // Saklar untuk mendemokan F-15 di depan juri
  antreanOfflineCount: number;    // Jumlah titik koordinat yang disimpan saat sinyal putus
}

export interface ParameterSimulasi {
  koridorTarget: KoridorId | 'SEMUA';
  tarifRupiah: number;            // Slider: 0 s.d. 10.000 (step 500)
  tarifAcuanRupiah: number;       // Default: 5.000
  jumlahBusMedium: number;        // Default eksisting: 4 unit (3 awal + 1 tambahan Okt 2025)
  jumlahAngkotListrik: number;    // Default eksisting: 6 unit (3 awal + 3 tambahan Okt 2025)
  elastisitasTarif_a: number;     // Default: 0.25 (setiap naik Rp5.000, permintaan turun 25%)
  elastisitasFrekuensi_b: number; // Default: 0.35 (sensitivitas terhadap penambahan armada)
  penumpangDasarHarian_P0: number;// Kalibrasi uji coba: ~288 penumpang/hari (12 org x 24 trip)
  durasiPutaranMenit_C: number;   // Default: 90 menit (pergi-pulang)
  jamOperasiMenit_J: number;      // Default: 900 menit (05.30 s.d. 20.30 = 15 jam)
  hariOperasiBulanan_D: number;   // Default: 30 hari
}

export interface HasilSimulasi {
  headwayMenit: number;           // Jarak waktu antar kendaraan
  kapasitasHarianTotal: number;   // Total kursi tersedia per hari
  perkiraanPenumpangHarian: number;
  selisihPenumpangPersen: number;
  pendapatanHarianRupiah: number;
  pendapatanBulananRupiah: number;
  tingkatKeterisianPersen: number;// Rasio penumpang terhadap kapasitas kursi
  melebihiKapasitas: boolean;     // true jika keterisian > 100%
  rekomendasiKebijakan: string;
}
```

---

## 3. Data Referensi Resmi (`src/data/`)

Agent yang membangun website **WAJIB** memasukkan seluruh daftar halte dari `REFERENCE/DATA_TRANS_BAHAGIA.md` tanpa dipotong:

1. **Koridor 1 (`K1`):** Terminal Rawasari ke Terminal Alam Barajo (via Sipin), **31 titik** (Sumber: Tribun Jambi, 16 Juli 2025):
   `Terminal Rawasari`, `Saimens Pasar`, `NH Plaza`, `Simpang Mangga`, `Kebun Jahe`, `SDN 31`, `D'Boss Laundry (depan Apotek K24)`, `SDN 9`, `RS Baiturrahim`, `Samsung Service Centre`, `Tribun Jambi`, `Lorong Nusantara`, `Toko Permai (depan Dishub Jambi)`, `Pempek Noni`, `Agatha Travel`, `Dinas Damkar`, `Pempek Mamad (Inti Sehat Medika)`, `Depan Pasar Keluarga`, `Indomaret Tugu Juang`, `STM Bawah`, `Apotek K24 Sipin`, `Nusa Indah 1`, `Transito`, `Kuburan Cina`, `Lorong Hidayat`, `Mitra Bangunan`, `Azila Store Simpang Rimbo`, `SDN 205`, `Dinas Pertanian dan Ketahanan Pangan Kota Jambi`, `Perwakilan NPM Simpang Rimbo`, `Terminal Alam Barajo`.
2. **Koridor 2 (`K2`):** Terminal Alam Barajo ke Terminal Rawasari (via Simpang Kawat), **34 titik** (Sumber: Jentik, 29 April 2026):
   `Terminal Alam Barajo`, `Jalan Palang`, `PT United Tractors`, `Linda Fashion`, `Sanjaya Ban`, `Golden Harvest`, `Toko Tanah Abang Jambi`, `UPT BKN Jambi`, `Lorong Riska Tani`, `SPBU Kuburan Cina`, `Kantor Pimpinan Wilayah Muhammadiyah`, `Kedai Sop Uni Linda`, `Solo Berseri (STM Atas)`, `Spartan Plafon (STM Bawah)`, `ATM BRI Jamtos`, `Hotel Nusa Wijaya`, `Pasar Keluarga`, `Balai Diklat Kejaksaan Tinggi`, `JCC Simpang Kawat`, `BRI Simpang Kawat`, `Lorong Keluarga`, `Jalan Batam`, `Indomaret SMPN 5`, `Hotel Aston`, `Lappindo`, `Murni`, `Benteng`, `Masjid Agung Al Falah`, `Pasar Angso Duo`, `WTC (Starbucks)`, `Kantor Pos Ancol`, `RS Bhayangkara`, `SMPN 1`, `Terminal Rawasari`.
3. **Koridor 3 (`K3`):** Terminal Rawasari ke Paal X (via Jelutung, Kebun Handil, Asrama Haji), **34 titik** termasuk titik awal Rawasari (Sumber: Metro Jambi, 24 Juli 2025):
   `Terminal Rawasari`, `Jalan Mr. Assaat`, `MTS Al-Khairiyah`, `SMPN 2 Kota Jambi`, `Bank Mandiri`, `Warung Ahok`, `Lorong Gerobak`, `BNN`, `Jalan Moh. Bafadhal`, `Pondok Kelapo`, `Kantor Lurah Jelutung`, `Pasar Kebun Handil (Alfamart)`, `Pasar Kebun Handil (SPBU)`, `SDN 35`, `Puskesmas Kebun Handil`, `SDN 77`, `Asrama Haji Kota Jambi`, `Dinas Kesehatan Kota Jambi`, `Poltekes Kemenkes Jambi`, `GOR Kota Baru`, `Dinas PU Provinsi Jambi`, `RS Mitra Kota Jambi`, `Kantor Camat Kota Baru`, `Alfamart Pangeran Hidayat`, `BPK Perwakilan Provinsi Jambi`, `Fresh Star Buah`, `Simpang Letmud Sarniem`, `SMK Taruna`, `Masjid At-Taqwa`, `SMAN 8 Kota Jambi`, `SMPN 18 Kota Jambi`, `SDN 206 Kota Jambi`, `Puskesmas Paal X`, `Warung Lesehan Jempol`.

### Koordinat Halte Perkiraan (Interpolasi Halus Kota Jambi)
Karena koordinat resmi per titik belum dipublikasikan Dishub, buat fungsi generator deterministik di `src/data/halte.ts` yang menginterpolasi koordinat secara realistis melewati titik-titik jangkar (*anchor coordinates*) Kota Jambi berikut, dan tandai setiap halte dengan `sumberKoordinat: 'perkiraan'`:
- **Terminal Rawasari:** `lat: -1.5944, lng: 103.6158`
- **Kawasan Sipin / Tugu Juang (Jalur K1):** `lat: -1.6115, lng: 103.5890`
- **Simpang Kawat / Jamtos (Jalur K2):** `lat: -1.6235, lng: 103.5930`
- **Terminal Alam Barajo:** `lat: -1.6358, lng: 103.5583`
- **Jelutung / Kebun Handil (Jalur K3 tengah):** `lat: -1.6180, lng: 103.6310`
- **Asrama Haji / Kota Baru (Jalur K3):** `lat: -1.6375, lng: 103.6195`
- **Paal X / Warung Lesehan Jempol (Ujung K3):** `lat: -1.6580, lng: 103.6120`

### Jadwal 8 Trip dari Terminal Rawasari (`src/data/jadwal.ts`)
| Trip | Jam Berangkat Utama | Jam Tiba Utama | Waktu Alternatif (Sumber Berita) | Tingkat Kepenuhan Default (Data Contoh) |
|---|---|---|---|---|
| **Trip 1** | `05:30` | `06:15` | Tidak ada | `Sedang` (Pelajar & pekerja shift pagi) |
| **Trip 2** | `07:00` | `07:45` | Tidak ada | `Padat` (Jam masuk sekolah & kantor; saran naik Trip 1 `05:30` atau Trip 3 `08:30`) |
| **Trip 3** | `08:30` | `09:15` | Tidak ada | `Longgar` (Waktu ideal untuk lansia & belanja pasar) |
| **Trip 4** | `10:00` | `10:45` | Tidak ada | `Longgar` (Waktu ideal luar jam sibuk) |
| **Trip 5** | `13:00` | `13:45` | Tiba `13:45` atau `14:30` | `Sedang` (Jam pulang sekolah siang) |
| **Trip 6** | `14:30` | `15:15` | Berangkat `14:30/15:30`, Tiba `15:15/16:30` | `Padat` (Jam pulang pelajar & pegawai; saran naik Trip 5 `13:00` atau Trip 7 `16:00`) |
| **Trip 7** | `16:00` | `16:45` | Berangkat `16:00/17:30`, Tiba `16:45/18:30` | `Sedang` (Pekerja sore) |
| **Trip 8** | `18:00` | `18:45` | Berangkat `18:00/19:30`, Tiba `18:45/20:30` | `Longgar` (Trip terakhir hari ini) |

---

## 4. Spesifikasi Logika Perhitungan (`src/lib/`)

### 4.1 Logika Estimasi Waktu Tiba (ETA) & Jadwal per Halte (`scheduleEngine.ts`)
1. Setiap koridor memiliki durasi tempuh dasar $D_{koridor} = 45\text{ menit}$ dari halte pertama ($i = 1$) ke halte terakhir ($i = N$).
2. Jadwal tiba terencana di halte ke-$i$ untuk trip yang berangkat pada menit $T_{berangkat}$ adalah:
   $$\text{JadwalHalte}(i) = T_{berangkat} + \text{round}\left(\frac{i - 1}{N - 1} \times D_{koridor}\right)$$
3. Jika ada bus aktif yang sedang berjalan pada indeks halte $p_{bus}$ pada waktu sekarang $T_{sekarang}$, maka jadwal seharusnya bus berada di titik itu adalah:
   $$T_{jadwal\_posisi} = T_{berangkat} + \left(\frac{p_{bus} - 1}{N - 1} \times D_{koridor}\right)$$
4. Selisih keterlambatan saat ini adalah $\Delta = T_{sekarang} - T_{jadwal\_posisi}$.
5. Maka **ETA di halte ke-$i$** (untuk semua halte di depan posisi bus, $i \ge p_{bus}$) adalah:
   $$\text{ETA}(i) = \text{JadwalHalte}(i) + \Delta$$

### 4.2 Logika Status Keyakinan Posisi (`confidenceEngine.ts` — F-15)
- Setiap kali `/pramudi/trip` mengirim ping (setiap 10 detik), `terakhirDiperbaruiMs` diperbarui.
- Pada sisi Penumpang dan Dishub, evaluasi dilakukan setiap detik:
  - Jika `statusTrip === 'berjalan'` **DAN** `!sinyalDiputusSimulasi` **DAN** `(Date.now() - terakhirDiperbaruiMs) <= 20000` (20 detik, yaitu 2x interval kirim 10 detik):
    - Status = `'langsung'` -> Tampilkan badge hijau `[● Posisi Langsung]`.
  - Jika `statusTrip === 'berjalan'` **TETAPI** `(sinyalDiputusSimulasi || Date.now() - terakhirDiperbaruiMs > 20000)`:
    - Status = `'perkiraan_jadwal'` -> Tampilkan badge kuning `[◷ Perkiraan dari Jadwal]` dan banner: `"Sinyal lokasi bus sedang terputus. Waktu tiba dihitung dari jadwal resmi dan posisi terakhir."`
  - Jika tidak ada trip yang sedang berjalan pada koridor tersebut:
    - Status = `'tidak_aktif'` -> Tampilkan jadwal keberangkatan berikutnya secara jujur.

### 4.3 Logika Simulator Tarif & Armada (`simulatorEngine.ts` — F-13)
Kalibrasi awal memakai data nyata uji coba 2025 (`Goodcar, 2025` & `Kalista, 2025`):
- Rata-rata penumpang per trip saat tarif Rp0 = $12\text{ orang}$.
- Dengan 8 trip per koridor x 3 koridor = $24\text{ trip/hari}$, maka penumpang dasar harian seluruh koridor adalah $P_0 = 288\text{ penumpang/hari}$ (atau $96\text{ penumpang/hari}$ untuk 1 koridor).
- Armada awal $U_0$: 3 bus medium (kapasitas 26) + 3 angkot listrik (kapasitas 10) = 6 unit. Tambahan Oktober 2025: +1 bus medium dan +3 angkot listrik (total 10 unit: 4 bus medium, 6 angkot listrik).

**Rumus yang dijalankan saat slider digeser:**
1. **Total Unit Aktif ($U$):**
   $$U = U_{bus} + U_{angkot}$$
2. **Jarak Antar Kendaraan / *Headway* ($H$, dalam menit):**
   $$H = \frac{C}{U_{\text{koridor}}}$$
   Di mana $C = 90\text{ menit}$ (waktu putaran pulang-pergi) dan $U_{\text{koridor}}$ adalah jumlah unit pada koridor yang dipilih.
3. **Faktor Dampak Tarif ($F_{\text{tarif}}$):**
   $$F_{\text{tarif}} = \max\left(0.15,\ 1 - a \times \left(\frac{T}{T_{\text{acuan}}}\right)\right)$$
   Saat $T = 0$ (gratis), $F_{\text{tarif}} = 1$. Saat $T = 5.000$ dan $a = 0.25$, penumpang menjadi $75\%$ dari kondisi gratis.
4. **Faktor Dampak Penambahan Armada ($F_{\text{armada}}$):**
   $$F_{\text{armada}} = \left(\frac{U}{U_0}\right)^{b}$$
5. **Perkiraan Penumpang Harian ($P$):**
   $$P = \text{round}\left(P_0 \times F_{\text{tarif}} \times F_{\text{armada}}\right)$$
6. **Perkiraan Pendapatan Bulanan ($R$):**
   $$R = P \times T \times D$$
7. **Tingkat Keterisian Kursi ($\text{Load Factor}$):**
   - Kapasitas rata-rata per kendaraaan $\bar{K} = \frac{(U_{bus} \times 26) + (U_{angkot} \times 10)}{U}$
   - Jumlah keberangkatan harian $N_{\text{trip}} = 8 \times \text{jumlah koridor} \times \left(\frac{U}{U_0}\right)$
   - $\text{Keterisian (\%)} = \frac{P}{N_{\text{trip}} \times \bar{K}} \times 100\%$

---

## 5. Mekanisme Sinkronisasi Antar-Tab Tanpa Backend (`broadcastSync.ts`)

Agar saat presentasi juri kamu bisa membuka Tab 1 (`/` Penumpang), Tab 2 (`/pramudi` Pramudi), dan Tab 3 (`/dishub` Admin Dishub) secara berdampingan dan melihat perubahan seketika:
1. Gunakan `new BroadcastChannel('jambi_jalan_sync_v1')` di dalam hook Zustand.
2. Setiap kali state di `useJambiJalanStore` berubah (misal: pramudi menekan `MULAI TRIP`, posisi bus bergeser, sinyal diputus, atau admin menambah halte baru di `/dishub/rute`), simpan ke `localStorage` **DAN** kirim pesan `channel.postMessage({ type: 'STATE_UPDATED', payload })`.
3. Tambahkan juga listener `window.addEventListener('storage', ...)` sebagai cadangan otomatis.
4. Dengan kombinasi `BroadcastChannel` + `localStorage`, demo 100% berjalan mulus baik saat online di Vercel maupun saat koneksi Wi-Fi gedung lomba mati total.
