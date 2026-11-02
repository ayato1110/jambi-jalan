# DESIGN.md: Sistem Desain & Panduan UI/UX JAMBI JALAN

## 1. Design Read & Dials (Wajib)

> **Reading this as:** Public transit passenger & driver utility (`/` & `/pramudi`) + government policy simulator (`/dishub`) for Kota Jambi citizens, bus drivers, and Dishub evaluators, in a **Papan Informasi Halte & Wayfinding Transit** visual language, dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

- **Surface Mode (Impeccable):** **Operate** (dan **Read** pada halaman Panduan Tap & Tentang Data). Kejelasan baca di bawah terik matahari, kecepatan mengenali angka hitung mundur, dan konsistensi kontrol mengalahkan dekorasi yang tidak perlu.
- **Dial Settings:**
  - `ENERGY: 2 (Balanced)`: Memiliki karakter rambu transit fisik yang tegas (header kartu kontras tinggi, kode koridor berwarna jelas, tipografi tabular besar), tanpa animasi berlebihan yang mengganggu tugas pengguna.
  - `RHYTHM: 2 (Consistent with purposeful breaks)`: Mengikuti tata letak satu kolom yang rapi di mobile, dengan satu pemecah ritme utama berupa **Kartu Papan Keberangkatan (*Departure Board Card*)** di bagian atas layar.
  - `MOTION: 1 (State-driven only)`: Transisi `150ms sampai 200ms` hanya untuk perubahan status nyata (badge posisi langsung vs perkiraan jadwal, indikator perekaman GPS pramudi, dan pergeseran grafik simulator). Semua animasi non-esensial berhenti saat `prefers-reduced-motion: reduce` aktif.

---

## 2. Referensi UI/UX Nyata & Design Guide Publik yang Bisa Diakses

Untuk memastikan tampilan tidak terlihat seperti template AI generik (*anti-slop*), desain JAMBI JALAN mengambil disiplin dari 4 sistem desain transportasi dan layanan publik dunia yang dokumentasinya terbuka:

1. **Transit App (`transitapp.com`) — Referensi Utama Layar Penumpang (`/`):**
   - **Apa yang diambil:** Hirarki *schedule-first* di mana baris koridor langsung memampang angka menit hitung mundur berukuran raksasa di sebelah kanan, pemisahan visual yang sangat jelas antara status *real-time* (gelombang sinyal aktif) vs *scheduled* (angka statis), dan pembagian layar peta di atas dengan *bottom sheet* rute di bawah.
2. **GOV.UK Design System (`design-system.service.gov.uk`) & Panduan Standar Pelayanan Digital Pemerintah Indonesia (SPBE):**
   - **Apa yang diambil:** Standar aksesibilitas lansia, fokus *keyboard/screen-reader* yang sangat jelas (outline kuning/hitam 3px), komponen *Warning Banner / Callout Box* untuk menandai data contoh dan asumsi simulasi, serta cara menampilkan instruksi langkah demi langkah pada **Panduan Tap (F-16)**.
3. **SBB Design System — Swiss Federal Railways (`digital.sbb.ch`):**
   - **Apa yang diambil:** Estetika papan keberangkatan stasiun (*station departure board*), penggunaan garis rute vertikal (*thermometer route line*) dengan titik-titik halte yang jelas mana yang sudah dilewati, mana posisi bus sekarang, dan mana halte tujuan, serta ketegasan tipografi angka tabular (`font-variant-numeric: tabular-nums`).
4. **Material Design 3 Automotive / Android Auto Guidelines (`m3.material.io`):**
   - **Apa yang diambil:** Prinsip layar **Pramudi (`/pramudi`)** saat kendaraan beroperasi: satu aksi utama berukuran raksasa (minimal tinggi `64px` sampai `72px`), kontras ekstrem, nol distraksi navigasi sekunder saat trip berjalan, dan umpan balik status koneksi yang bisa dilihat dalam 0,5 detik.

---

## 3. Identitas Visual & Motif Khas (*Identity Motif*)

Jika nama aplikasi dan logo dicopot, pengguna tetap langsung mengenali bahwa ini adalah **JAMBI JALAN** dari tiga motif khas berikut:

1. **Papan Keberangkatan Terminal (*Split-Header Departure Card*):**
   - Kartu utama di beranda memiliki bagian kepala (*header strip*) berwarna gelap `#111C18` dengan teks putih/kuning rambu yang menampilkan nama halte aktif dan jam operasional (`05.30 s.d. 20.30 WIB`), diikuti badan kartu terang `#FFFFFF` yang memampang angka hitung mundur besar dan lencana koridor (`K1`, `K2`, `K3`).
2. **Garis Rute Termometer (*Connected Route Spine*):**
   - Daftar halte tidak pernah ditampilkan sebagai kartu-kartu terpisah yang mengambang, melainkan selalu terhubung oleh garis vertikal tebal (`4px`) sesuai warna koridor, lengkap dengan lingkaran halte (kosong = sudah lewat, berdenyut hijau = posisi bus, tebal = halte dipilih).
3. **Lencana Kejujuran Sinyal & Data (*Explicit Honesty Badges*):**
   - Setiap informasi dinamis selalu didampingi lencana berbingkai tegas (bukan sekadar titik warna):
     - `[● POSISI LANGSUNG]` (Hijau Koridor)
     - `[◷ PERKIRAAN JADWAL]` (Kuning Rambu, garis putus-putus)
     - `[DATA CONTOH]` / `[ASUMSI SIMULASI]` (Abu-abu Arsip / Kuning Peringatan)

### Aset Identitas / Logo (Kepatuhan R-23)
- Tidak menggunakan gambar logo hasil karangan AI atau logo resmi Pemkot Jambi tanpa izin.
- Menggunakan **Wordmark Tipografi Tegas**:
  - Ikon kotak bersudut `8px` berwarna `#0F766E` berisi siluet bus listrik geometris SVG sederhana (buatan kode langsung, `24x24px`).
  - Teks utama: **JAMBI JALAN** (`font-bold tracking-tight text-[#111C18]`).
  - Lencana pendamping: `TRANS BAHAGIA` (`text-xs font-semibold bg-[#E6F4F1] text-[#0F766E] px-2 py-0.5 rounded`).

---

## 4. Sistem Warna & Kontras (WCAG AA/AAA Verified)

Menggunakan maksimal **2 warna inti + 1 aksen peringatan** di atas kanvas netral hangat (patuh aturan R-29), ditambah kode warna 3 koridor untuk pemetaan:

### 4.1 Warna Kanvas & Teks (Light Mode Default)
| Token CSS | Hex | Penggunaan | Rasio Kontras & Alasan (R-31) |
|---|---|---|---|
| `--bg-canvas` | `#F6F5F0` | Latar belakang utama halaman (*Warm Paper*) | Mengurangi silau (*glare*) saat penumpang melihat layar ponsel di halte terbuka Kota Jambi pada siang hari. |
| `--bg-surface` | `#FFFFFF` | Permukaan kartu utama, tabel, dan panel | Kontras bersih terhadap kanvas `#F6F5F0` dengan batas border tegas. |
| `--bg-elevated` | `#ECEAE2` | Latar bagian sekunder, pill filter non-aktif, skeleton | Membedakan area kontrol sekunder tanpa menggunakan bayangan tebal. |
| `--bg-board` | `#111C18` | Header kartu keberangkatan & mode gelap Pramudi | Kontras tinggi `17.2:1` terhadap putih; meniru papan informasi elektronik terminal. |
| `--text-primary` | `#111C18` | Judul, nama halte, jam keberangkatan, isi utama | Kontras `16.1:1` di atas `#F6F5F0` dan `17.2:1` di atas `#FFFFFF` (Lolos WCAG AAA). |
| `--text-secondary` | `#3F4D47` | Subteks, jalur via, keterangan alasan kepenuhan | Kontras `7.8:1` di atas `#FFFFFF` (Lolos WCAG AAA, tidak memakai abu-abu pucat). |
| `--text-muted` | `#576660` | Label tersier, catatan kaki sumber data | Kontras `5.4:1` di atas `#FFFFFF` (Lolos WCAG AA > 4.5:1). |
| `--border-subtle` | `#D5D2C8` | Garis pemisah kartu dan baris tabel (`1px solid`) | Memberi struktur fisik yang jelas tanpa efek mengambang. |
| `--border-strong` | `#111C18` | Bingkai kartu aktif & Mode Kontras Tinggi (`2px solid`) | Memastikan batas komponen terlihat jelas bagi lansia. |

### 4.2 Warna Inti, Status, & Koridor
| Token CSS | Hex | Teks Pasangan | Rasio Kontras | Penggunaan & Alasan (R-31) |
|---|---|---|---|---|
| `--brand-primary` | `#0F766E` | `#FFFFFF` | `5.4:1` (AA) | **Hijau Bus Listrik**: Tombol aksi utama, status `Posisi Langsung`, identitas transportasi ramah lingkungan. |
| `--brand-primary-soft`| `#E6F4F1` | `#0B5650` | `7.6:1` (AAA) | Latar badge aktif dan highlight halte terpilih. |
| `--accent-amber` | `#B45309` | `#FFFFFF` | `5.0:1` (AA) | **Kuning/Jingga Rambu**: Status `Perkiraan dari Jadwal`, peringatan keterisian >80%, banner `ASUMSI SIMULASI`. |
| `--accent-amber-soft` | `#FEF3C7` | `#78350F` | `8.9:1` (AAA) | Latar banner informasi penurunan status sinyal dan kepenuhan `Sedang`. |
| `--status-danger` | `#B91C1C` | `#FFFFFF` | `6.4:1` (AA) | Tombol `Akhiri Trip`, status kepenuhan `Padat`, peringatan `Trip Belum Dimulai >10 Menit`. |
| `--status-danger-soft`| `#FEE2E2` | `#7F1D1D` | `9.1:1` (AAA) | Latar badge kepenuhan `Padat` dan pesan gagal. |
| `--corridor-k1` | `#0F766E` | `#FFFFFF` | `5.4:1` | **Koridor 1**: Rawasari ke Alam Barajo (via Sipin). |
| `--corridor-k2` | `#1D4ED8` | `#FFFFFF` | `6.7:1` | **Koridor 2**: Alam Barajo ke Rawasari (via Simpang Kawat). |
| `--corridor-k3` | `#9333EA` | `#FFFFFF` | `5.3:1` | **Koridor 3**: Rawasari ke Paal X. |

> **Catatan Aksesibilitas:** Kode koridor tidak pernah dibedakan dari warna saja (R-39). Setiap koridor selalu menulis label teks eksplisit `K1`, `K2`, atau `K3` dengan bentuk lencana yang konsisten.

---

## 5. Tipografi & Skala Ukuran

### 5.1 Pemilihan Huruf (Alasan R-06 & R-31)
- **UI & Bacaan Utama (`--font-sans`):** `Plus Jakarta Sans` (fallback: `system-ui, -apple-system, sans-serif`).
  - *Alasan:* Memiliki bukaan huruf (*aperture*) lebar dan tinggi huruf kecil (*x-height*) yang besar sehingga nama jalan dan nama toko/halte di Kota Jambi tetap terbaca jelas pada ukuran kecil maupun saat diperbesar untuk lansia.
- **Angka Jadwal, Hitung Mundur, & Rumus Simulator (`--font-mono`):** `JetBrains Mono` atau `Geist Mono` dengan `font-variant-numeric: tabular-nums`.
  - *Alasan:* Hanya dipakai pada jam (`05:30`), hitung mundur (`14 mnt`), koordinat GPS, dan angka rupiah simulator agar lebar digit tidak bergeser saat angka berubah setiap detik. **Dilarang** memakai font monospace untuk judul halaman.

### 5.2 Skala Ukuran Tetap (Operate Mode) & Mode Teks Besar Lansia (F-05)
Ketika pengguna mengaktifkan toggle **Mode Aksesibel (F-05)**, class `.mode-aksesibel` ditambahkan pada elemen `<html>`, menaikkan `root font-size` dari `16px` menjadi `20px` (+25%) dan menebalkan semua border menjadi `2px solid #111C18`.

| Elemen | Ukuran Normal (`rem` / `px`) | Ukuran Mode Aksesibel (`20px` root) | Line Height | Weight |
|---|---|---|---|---|
| Angka Hitung Mundur Utama | `2.25rem` (`36px`) | `2.25rem` (`45px`) | `1.1` | `700` (`tabular-nums`) |
| Judul Halaman (`h1`) | `1.375rem` (`22px`) | `1.375rem` (`27.5px`) | `1.25` | `700` |
| Judul Bagian / Nama Halte (`h2`) | `1.125rem` (`18px`) | `1.125rem` (`22.5px`) | `1.3` | `600` |
| Teks Isi & Daftar Halte (`body`) | `1rem` (`16px`) | `1rem` (`20px`) | `1.5` | `400` / `500` |
| Label Sekunder & Alasan Kepenuhan | `0.875rem` (`14px`) | `0.875rem` (`17.5px`) | `1.4` | `500` |
| Lencana / Badge Status | `0.75rem` (`12px`) | `0.8125rem` (`16px`) | `1.2` | `600` |

---

## 6. Tata Letak Mobile-First & Reflow Lintas Layar (`antislop-layoutmobile`)

Prinsip utama: **Layar mobile adalah desain asli untuk Penumpang dan Pramudi, bukan layar desktop yang diperkecil.**

### 6.1 Tiga State Lebar Layar (Bukan Cuma HP vs Desktop)
1. **Compact / Phone (`< 640px`):**
   - **Penumpang (`/`):** Satu kolom penuh (`padding: 16px`), header ringkas tinggi `56px` berisi identitas & tombol cepat `A+ Suara` (Mode Aksesibel), serta **Bottom Navigation Bar** tinggi `64px` dengan 5 menu utama: `Jadwal`, `Peta & Halte`, `Rencana`, `Panduan Tap`, `Aksesibel`. Ruang bawah halaman diberi `padding-bottom: calc(80px + env(safe-area-inset-bottom))` agar tidak ada konten yang tertutup.
   - **Pramudi (`/pramudi`):** Satu kolom penuh tanpa bottom nav agar tidak terpencet tidak sengaja saat bertugas. Tombol `MULAI TRIP` / `AKHIRI TRIP` berukuran tinggi minimal `68px` dan lebar penuh.
   - **Dashboard Dishub (`/dishub`):** Tetap dapat dibuka di ponsel tanpa horizontal scroll: sidebar berubah menjadi menu pemilih tab horizontal yang bisa digeser di bagian atas, dan tabel armada otomatis berubah menjadi tumpukan kartu per bus.
2. **Medium / Tablet & Split View (`640px sampai 1023px`):**
   - **Penumpang (`/`):** Tata letak 2 kolom untuk halaman Peta & Halte (daftar halte di kiri `320px`, peta di kanan mengisi sisa ruang) dan kartu koridor berjajar 2 kolom.
   - **Dashboard Dishub (`/dishub`):** Grid 2 kolom untuk kartu metrik dan simulator (panel slider di atas/kiri, grafik dampak di kanan).
3. **Expanded / Desktop (`>= 1024px`):**
   - **Penumpang (`/`) & Pramudi (`/pramudi`):** Ditampilkan dalam kontainer terpusat (`max-width: 960px` untuk halaman dengan peta berdampingan, atau `max-width: 520px` untuk layar Pramudi) di atas latar kanvas `#ECEAE2` dengan bilah navigasi atas/samping yang jelas, sehingga saat didemokan di proyektor juri tetap terlihat proporsional dan tidak melar.
   - **Dashboard Dishub (`/dishub`):** Layout penuh dengan Sidebar kiri tetap (`240px`) dan area kerja kanan (`max-width: 1280px`).

### 6.2 Aturan Komponen & Sentuhan (R-03, R-11, R-12, R-39)
- **Target Sentuh Minimal:** Semua tombol, pill koridor, item halte, dan toggle minimal berukuran `44px x 44px` dengan jarak antar elemen minimal `8px`.
- **Variasi Border Radius (R-11):**
  - Kartu dan panel: `12px` (`rounded-xl`)
  - Tombol aksi dan input form: `8px` (`rounded-lg`)
  - Lencana kode koridor (`K1`, `K2`, `K3`) dan status sinyal: `6px` (`rounded-md`), **bukan** semuanya berbentuk kapsul/pill.
- **Bayangan & Elevasi (R-12):**
  - Kartu biasa menggunakan border `1px solid #D5D2C8` tanpa bayangan.
  - Bayangan halus (`0 4px 12px rgba(17, 28, 24, 0.08)`) **hanya** digunakan pada Bottom Navigation Bar dan panel mengambang di atas peta untuk membedakan lapisan elevasi.

---

## 7. Alasan Tertulis Setiap Keputusan Desain (Kepatuhan R-31)

1. **Mengapa warna kanvas `#F6F5F0` dan hijau `#0F766E`?** Karena penumpang membaca layar di halte luar ruang yang terik sehingga butuh latar terang yang tidak menyilaukan, sedangkan hijau `#0F766E` merepresentasikan armada bus listrik Trans Bahagia dengan kontras teks putih yang lolos WCAG AA.
2. **Mengapa layar utama dimulai dari Kartu Papan Keberangkatan, bukan peta layar penuh?** Karena bus Trans Bahagia hanya berangkat 8 kali sehari dari Terminal Rawasari, sehingga kepastian jam keberangkatan berikutnya jauh lebih mendesak daripada melihat peta kosong saat bus belum jalan.
3. **Mengapa memakai `Plus Jakarta Sans` + angka `tabular-nums`?** Agar nama halte yang panjang mudah dipindai oleh semua kelompok usia, dan angka hitung mundur detik/menit tidak bergoyang kiri-kanan saat berkurang.
4. **Mengapa daftar halte memakai garis vertikal terhubung, bukan grid kartu?** Karena urutan titik pemberhentian dalam satu koridor bersifat sekuensial dari asal ke tujuan; garis terhubung langsung menunjukkan arah perjalanan dan posisi bus relatif terhadap halte penumpang.
5. **Mengapa tombol Mode Aksesibel (`A+ & Suara`) ditaruh langsung di header atas beranda?** Agar lansia atau pendampingnya tidak perlu masuk ke menu berlapis-lapis terlebih dahulu hanya untuk memperbesar huruf dan mendengarkan jadwal.
