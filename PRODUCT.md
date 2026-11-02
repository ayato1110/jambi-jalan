# PRODUCT.md: Konteks Produk JAMBI JALAN

## 1. Identitas Produk
- **Nama Aplikasi:** JAMBI JALAN
- **Subjudul:** Aplikasi Transportasi Publik dan Simulator Tarif untuk Bus Listrik Trans Bahagia Kota Jambi
- **Kompetisi:** Jambi Smart City Application Challenge 2026 (Dinas Komunikasi dan Informatika Kota Jambi)
- **Dimensi Smart City:** Smart Living (utama), Smart Governance (dashboard & simulator kebijakan), Smart Society (aksesibilitas lansia & panduan tap).
- **Tim Pengembang:** Kata Raffi kalo menang bakal ke Bandung! (Universitas Jambi, Program Studi Sistem Informasi):
  1. Ripa Bagaskara (F1E124025), Ketua Tim
  2. Satria Raziq Hamizan (F1E125003), Anggota
  3. Muhammad Raffi (F1E124044), Anggota

## 2. Masalah Nyata yang Diselesaikan
1. **Informasi jadwal dan posisi tidak terpusat:** Jadwal keberangkatan Trans Bahagia hanya ada di Instagram (`@kalistaev`, `@dishub_kota_jambi`) dan posisi bus hanya bisa ditanyakan lewat grup WhatsApp. Karena bus hanya berangkat 8 kali sehari dari Terminal Rawasari (05.30 sampai 20.30), ketinggalan satu trip berarti menunggu lama tanpa kepastian.
2. **Data evaluasi belum terolah per halte dan per jam:** Mesin *Tap on Bus* sudah mewajibkan tap kartu uang elektronik, KTP, atau SIM sejak 1 April 2026, namun belum diolah menjadi laporan keterisian dan permintaan per halte untuk publik/evaluasi cepat.
3. **Kelompok rentan kesulitan memakai kanal yang ada:** Lansia dan pengguna dengan literasi digital rendah kesulitan membaca teks kecil atau mengetik di grup WhatsApp.
4. **Penetapan tarif dan penambahan armada belum punya alat simulasi:** Pemerintah Kota Jambi sedang membahas skema tarif dan telah menambah 4 unit kendaraan listrik pada Oktober 2025, namun belum ada alat bantu hitung cepat untuk melihat perkiraan dampak tarif dan jumlah unit terhadap jumlah penumpang, pendapatan, dan jarak antar bus (*headway*).

## 3. Tiga Klien dalam Satu Aplikasi Web (PWA)
Aplikasi dibangun sebagai satu proyek Next.js terpadu dengan tiga permukaan (*surfaces*):
1. **Aplikasi Penumpang (`/`, Mobile-First PWA):** Berfokus pada jadwal keberangkatan berikutnya (*schedule-first*), hitung mundur, trip terakhir hari ini, estimasi waktu tiba (ETA) per halte, peta posisi dengan indikator keyakinan sinyal, perkiraan kepenuhan beserta alasan, mode aksesibel (teks besar, kontras tinggi, pembaca suara), panduan *tap*, dan tombol bagikan jadwal ke WhatsApp.
2. **Aplikasi Pramudi (`/pramudi`, Mobile-First 1-Tombol):** Berfokus pada kecepatan dan keamanan saat bertugas. Pramudi cukup memilih koridor/trip dan menekan satu tombol besar untuk memulai pengiriman koordinat berkala setiap 10 detik, dilengkapi antrean offline otomatis dan tombol simulasi/replay untuk keperluan demo.
3. **Dashboard Dinas Perhubungan (`/dishub`, Desktop-First Responsive Web):** Berfokus pada pemantauan seluruh armada, peringatan trip yang terlambat dimulai (>10 menit), laporan ketepatan waktu dan keterisian, peta panas (*heatmap*) permintaan halte per jam, pengelolaan data koridor/halte, serta **Simulator Tarif dan Armada**.

## 4. Lima Pembeda Utama
1. **Simulator Tarif dan Armada untuk Dishub:** Alat bantu diskusi kebijakan dengan rumus transparan yang dikalibrasi awal dari data uji coba 2025 (rata-rata 12 penumpang/trip, kapasitas 26 orang untuk bus medium dan 10 orang untuk angkot listrik).
2. **Layar Utama Berbasis Jadwal (*Schedule-First*):** Karena frekuensi layanan 8 trip per hari, pertanyaan pertama penumpang adalah "Kapan bus berikutnya dan kapan bus terakhir?", bukan sekadar peta kosong.
3. **Status Keyakinan Posisi (*Position Confidence*):** Pelacakan hanya memakai ponsel pramudi tanpa alat GPS tambahan. Saat sinyal ponsel terputus lebih dari batas waktu, status otomatis turun dari `Posisi Langsung` menjadi `Perkiraan dari Jadwal` dengan pemberitahuan yang jujur kepada penumpang.
4. **Perkiraan Kepenuhan Beserta Alasan dan Saran:** Menampilkan tingkat kepadatan (`Longgar`, `Sedang`, `Padat`) lengkap dengan alasan kontekstual dan saran trip berikutnya yang lebih lengang.
5. **Kanal Aksesibel dan Panduan Tap Lokal:** Menyediakan tombol pembesar teks, kontras tinggi, pembaca suara Bahasa Indonesia (Web Speech API), tombol bagikan ke WhatsApp untuk keluarga lansia, serta panduan langkah *tap* KTP/SIM/E-Money.

## 5. Batasan Kejujuran Data (Wajib Dipatuhi)
- **Bukan Penentu Kebijakan Resmi:** JAMBI JALAN tidak menetapkan tarif dan tidak memproses pembayaran. Semua keluaran simulator diberi label `ASUMSI SIMULASI`.
- **Pemisahan Data Publik vs Data Contoh:**
  - *Sumber Publik:* Nama 3 koridor, daftar 99 titik halte (31 di K1, 34 di K2, 34 di K3), 8 waktu keberangkatan dari Terminal Rawasari, data armada Kalista, dan agregat hasil uji coba Mei sampai September 2025 (36.040 penumpang, 3.066 trip, penurunan emisi 30%).
  - *Data Contoh / Perkiraan:* Koordinat lintang-bujur halte (hasil pemetaan manual/skematik), jadwal arah balik dari Alam Barajo/Paal X, posisi bus berjalan saat demo, dan angka kepenuhan per halte/jam. Semua wajib diberi penanda visual yang jujur di UI.
