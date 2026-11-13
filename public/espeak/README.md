# eSpeak NG fallback

Folder ini berisi mesin suara cadangan Bahasa Indonesia untuk JAMBI JALAN.

- Sumber: https://github.com/steveseguin/espeakng.js
- Basis: eSpeak NG, voice `id` (Indonesian)
- Lisensi: GPLv3, lihat `COPYING`
- Dipakai hanya bila peramban tidak menyediakan voice Bahasa Indonesia bawaan dan suara Google tidak tersedia.

Aplikasi memprioritaskan voice Indonesia dari sistem atau peramban. Bila tidak ada, aplikasi mencoba suara Google lewat proxy server, lalu eSpeak NG sebagai cadangan offline supaya pembaca suara tidak jatuh ke aksen Inggris.
