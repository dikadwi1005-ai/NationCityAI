# Phase 5C — refinement wilayah dan lingkungan

Source: Phase 5C Pass 3 `0f39194eb7309c50c1f26777db54487c15b00be1`. Instruksi pemilik terbaru mengizinkan fondasi Phase 6 lokal/offline. HUD fullscreen dipertahankan; fitur baru berada pada demo terisolasi, bukan provisioning cloud.

## Perubahan visual dan tata ruang

Demo City memiliki **354 objek domain dan 9 aset fasilitas/komersial fixture**, dibanding 266+7 sebelumnya. Inti Cendana mendapat jalan penghubung tambahan dan baris hunian lebih rapat, dengan pintu menghadap akses jalan yang sesuai. Pusat provinsi memiliki kolektor, kantor daerah dan klinik; Desa Tanjung memiliki frontage lebih renggang dan vegetasi dominan. Pasar kota, parkir, taman, plaza dan promenade pesisir tetap memakai renderer yang sama.

Tujuh distrik mempunyai metadata `role`, `level` dan `parentId`: pusat negara → pusat provinsi → kawasan kota → desa, dengan kawasan hijau/pesisir sebagai fungsi lanskap. Nama wilayah tampil saat kamera fokus dan pada selector distrik yang sudah ada. Metadata ini adalah struktur perencanaan/presentasi fixture, bukan perubahan kewenangan pemerintahan atau batas administratif database. Kepadatan tidak diseragamkan.

Demo mendapat perbukitan Rimba, biome hutan dan pasir pesisir; warna terrain kini menghormati biome pasir yang dicat. Geo permanen, ID, koordinat dan generator sumber tidak diubah. Laut tetap memakai depth/coast-distance field dan foam bergerak yang telah ada.

Sky dome prosedural menampilkan warna langit, awan bergerak dan haze ringan. Environment reflection memakai analytic Sky/PMREM. Tidak ada cloud volume, bayangan awan dinamis, asset HDR unduhan atau weather simulation penuh.

Fauna dekoratif memakai instancing: burung terbang, kambing/ayam pada habitat desa, kucing/anjing dekat hunian. Cap total Low/mobile 5, Medium 12, High 16, termasuk burung. Posisi hewan darat diperiksa terhadap air, bangunan dan jalan pada interval terbatas; tidak membuat akun, vote, chat atau statistik warga. Model dan gerak adalah presentasi sederhana, bukan AI pet/peternakan.

Audit skala mempertahankan adapter 1 unit domain = 3 meter visual: Chibi sekitar 1,8 m, mobil 4,05 × 1,74 m, road envelope 6 m. Fauna kira-kira setinggi 0,4 m (kucing), 0,62 m (anjing), 0,98 m (kambing termasuk tanduk), dan 0,34 m (ayam). Footprint dan personal-space collider server tetap memakai kontrak lama. Tidak ada migrasi koordinat fisik.

Bug zoom/orbit yang memutasi posisi sebelum menghitung offset telah diperbaiki. Regresi browser memeriksa pembesaran proporsional dan round-trip zoom agar kamera tidak lagi jatuh ke target.

## Performa aktual

Edge 156, AMD Radeon integrated desktop, viewport CSS 1600×1000, City Overview, 10 NPC / 4 kendaraan; tiga sampel per kualitas. Pengukuran dunia permanen membaca SQLite asli, bukan database baru. Mobile adalah emulasi 390×844 pada GPU desktop, belum perangkat fisik.

| Runtime | Kualitas | FPS | Draw calls | DPR |
| --- | --- | --- | --- | --- |
| permanent | low | 90 / 90 / 90 | 303 | 1 |
| permanent | medium | 90 / 90 / 90 | 359 | 1 |
| permanent | high | 90 / 90 / 90 | 361 | 1.2 |
| demo | low | 90 / 90 / 90 | 383 | 1 |
| demo | medium | 90 / 90 / 90 | 441 | 1 |
| demo | high | 68 / 64 / 63 | 443 | 1.2 |

Siklus penggantian profil/rekonstruksi: geometry 78 → 78, texture 21 → 21. Tidak ada page/GPU error. Mobile emulation terakhir sekitar 70 FPS / 84 draw calls, fauna 3; angka ini bukan performa telepon fisik. Shader sky melewati piksel bawah horizon untuk menghindari pekerjaan yang tidak terlihat.

NPC/kendaraan tetap mengikuti cap dan routing lokal yang ada. Jendela pedestrian masih dibatasi; ini tidak menyimulasikan seluruh negara sekaligus. Pengujian resource berupa siklus pendek, bukan jaminan sesi tanpa batas atau bebas semua memory leak.

## Bukti aplikasi nyata

Folder `docs/phase6-local` berisi permanent-refined, refined-city-overview, capital-core, provincial-center, rural-habitat, waterfront-environment, green-district dan tropical-sky-clouds. Screenshot konstruksi dan video berada di folder yang sama. Seluruhnya berasal dari aplikasi/WebGL yang berjalan; tidak ada mockup AI.

## Validasi dan keselamatan

49 tes unit/domain, typecheck dan production build; acceptance browser refinement/konstruksi, invalid command, pause/resume, zoom, growth, mobile dan resource; regresi Phase 1–5C termasuk placement, terrain, multiplayer, chat, pemilu, PostgreSQL dan recovery. Hasil mentah ada pada browser-verification.json dan regression-verification.json di folder evidence.

Backup terenkripsi dibuat sebelum perubahan dan di-restore ke file terpisah; seluruh 25 signature tabel dibandingkan. Dunia permanen tetap **25 tabel, 32 objek asli, revisi 0**. Semua backend/API/deployment Phase 5B yang diperiksa tetap sama. Tidak ada SQLite, environment, key, backup maupun laporan operator privat dalam Git.

Refinement dan fondasi Phase 6 tetap menunggu review pemilik. Hosting Railway/AWS berbayar tidak diaktifkan, tidak ada merge atau deployment production. Physical mobile, long soak, skala negara besar dan cloud acceptance nyata masih belum dilakukan.
