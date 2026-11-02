# JAMBI JALAN

JAMBI JALAN adalah sistem informasi penumpang dan evaluasi operasional Bus Listrik Trans Bahagia Kota Jambi. Aplikasi mencakup jadwal keberangkatan, peta dan urutan halte, perencanaan perjalanan, pencarian halte terdekat, panduan tap, mode aksesibel, panel pramudi, serta dashboard evaluasi Dishub.

## Modul Utama

- `/`: jadwal keberangkatan, estimasi waktu tiba, dan kepadatan armada.
- `/peta`: peta koridor, urutan halte, dan estimasi waktu tiba per halte.
- `/rencana`: pencarian rute perjalanan dari halte asal ke halte tujuan.
- `/terdekat`: pencarian halte terdekat dari lokasi perangkat atau lokasi uji.
- `/panduan-tap`: panduan tap kartu saat naik bus.
- `/aksesibel`: pengaturan teks besar, kontras tinggi, dan pembaca suara.
- `/pramudi`: pemilihan unit dan jadwal trip untuk pramudi.
- `/pramudi/trip`: panel perjalanan, pembaruan posisi, dan simulasi uji lapangan.
- `/dishub`: pemantauan armada, peringatan gangguan, peta operasional, dan status trip.
- `/dishub/simulator`: simulator tarif dan armada untuk evaluasi kebijakan.
- `/dishub/kinerja`: laporan kinerja dan rekomendasi penambahan trip.
- `/dishub/permintaan`: analisis permintaan halte per jam operasional.
- `/dishub/rute`: pengelolaan data halte dan titik koridor.
- `/tentang-data`: sumber data, batasan, dan penjelasan estimasi.

## Teknologi

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- MapLibre GL dengan tile OpenStreetMap
- Manifest PWA dan ikon aplikasi

## Menjalankan Aplikasi

Prasyarat: Node.js 20 atau lebih baru.

```powershell
npm install
npm run dev
```

Buka `http://localhost:3000`.

Untuk mode produksi:

```powershell
npm run build
npm run start
```

Jika port 3000 sudah digunakan:

```powershell
npm run dev -- -p 3001
```

Perintah pemeriksaan:

```powershell
npm run lint
npm run build
```

## Catatan Data

Data operasional dan estimasi dipisahkan pada antarmuka. Penjelasan sumber, batasan, dan asumsi tersedia di `/tentang-data`.
