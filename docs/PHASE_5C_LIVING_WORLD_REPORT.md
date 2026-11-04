# Phase 5C — Living World checkpoint

Status: implementasi lokal dan acceptance inti lulus. Masih draft untuk review visual; bukan persetujuan Closed Beta, deployment, atau penutupan seluruh Phase 5C. Tambahan ini melengkapi [visual overhaul](PHASE_5C_VISUAL_OVERHAUL_REPORT.md), tidak mengganti scope sebelumnya.

## Sumber dan keamanan data

- Basis source: release Phase 5B `100b70fd3e1d0bf11f2c5f347e69b95e4acc1ecb`, sumber PR #1; checkpoint visual `cc44bb9`. Branch checkpoint `checkpoint/phase-5c-before-living-world` dibuat sebelum tambahan ini.
- Database permanen tetap `data/nation.sqlite`, revisi 0, 32 objek asli. Audit seluruh 25 tabel dibandingkan sebelum/sesudah. Tidak ada akun NPC, migrasi, reset, penulisan posisi dekoratif, atau pengubahan koordinat/ID sumber.
- Backup lokal terenkripsi dibuat sebelum integrasi dan dipulihkan ke file sementara terpisah. Seluruh signature tabel sama. Identitas vault dan laporan operator disimpan privat di luar source publik; recovery key tidak dipublikasikan.
- Persiapan Railway, PostgreSQL, S3, biaya, migrasi dan gate Closed Beta Phase 5B dipertahankan. Tidak ada provisioning, merge, production deployment, atau pekerjaan Phase 6.

## Fitur yang berjalan

- NPC memakai komponen Chibi Character Creator: tiga rambut, dua bentuk wajah/mata, warna rambut/pakaian, jaket/tunik, syal/baret/tanpa aksesori. Berjalan, idle, melambai dan duduk pada bench taman. Jadwal lokal seeded berbeda antar-NPC.
- State `IDLE → WALKING → ARRIVING → ACTIVITY → NEXT_DESTINATION`; tujuan berada di akses rumah, balai, klinik, taman dan bench. Mereka berjalan dari luar pintu, bukan menembus interior bangunan.
- A* ringan di graf daratan maksimal 53×53 per pulau aktif. Seluruh segmen dicek setiap 0,2 meter untuk daratan, perubahan elevasi, dan tapak objek dengan clearance. Biaya rute mengutamakan tepi jalan; menyeberang jalan lebih mahal. Elevasi visual mengikuti sampler terrain yang sama.
- Lima model kendaraan 3D asli: mobil, motor, minibus, layanan, dan kendaraan konstruksi dekoratif. Body, roda berputar, kaca, lampu, warna dan orientasi arah jalan. Kendaraan konstruksi tidak memiliki mekanik pembangunan Phase 6.
- Routing mengambil sambungan 2 meter antar-road Phase 1–5. Dua lajur visual, pergantian arah, jeda persimpangan/ujung jalan, headway dan jeda layanan sementara. Envelope jalan harus kering dan bebas objek solid. Belokan transisi berlangsung di dalam tile yang ada, tanpa menambah metadata permanen.
- Kontrol HUD dan Explore: Off/Low/Medium/High, Pause/Resume, 1x/2x, debug path. Badge melaporkan **Populasi simulasi**, terpisah dari roster pemain server. NPC tidak punya chat, suara pemilu, jabatan, akun, statistik warga, atau izin admin.
- Default Low: 5 NPC, maksimal 2 kendaraan. Desktop Medium 10/4, High 18/7; jumlah kendaraan juga dibatasi panjang jalan (pada seed hanya 5). Layar <650 px membatasi aktif ke 5/2 walau High dipilih. Pulau tanpa tujuan bangunan tidak mengarang populasi.
- Fixed update 30 Hz, tab tersembunyi menghentikan integrasi, shared geometri/material, animation LOD, spatial visibility dan batas agen. Semua mesh simulasi tidak menerima raycast sehingga tidak mencuri pemilihan/placement admin. Pergantian pulau/topologi melepaskan agen/graf lama; density/topologi yang berubah memulai ulang simulasi dekoratif, bukan reset dunia.

## Verifikasi

| Pemeriksaan | Hasil |
|---|---|
| Unit/domain tests | 35/35; seeded reproducibility, rute aman, tujuan/aktivitas/duduk, jalan bercabang, topology rebuild, source immutable |
| Typecheck dan build produksi | Lulus |
| Browser Living World Edge nyata | Gerak NPC/kendaraan, pause/resume, 2x, density, debug, batas mobile, nol request mutasi pergerakan, nol page error |
| Belokan | Fixture terisolasi dengan simpang T; kendaraan berpindah arah pada jalan aktual |
| Fullscreen/UI | 1920×1080, 1440×900, 768×1024, 390×844; canvas persisten, katalog, placement/move/rotate/refresh, tidak overflow |
| Citizens/multiplayer | Dua akun, Character Creator, joystick sentuh, collision, reconnect, pulau, logout/login, denial admin; perjalanan berulang tidak menduplikasi NPC; tabel citizens tepat dua akun fixture |
| Proximity Chat | Tiga akun, isolasi jarak, lintas sel/wilayah, block/report/suspend, reconnect, spoof/replay/rate rejection |
| Pemerintahan | Nominasi/review/voting konkuren, hasil 2:1, jabatan/seragam/gesture, izin platform ditolak, panel backup |
| Phase 5B | PostgreSQL 18.6 native, HTTPS/WSS lokal, beta, mobile, migrasi dan restore database kedua; kontrak S3 memakai stub, bukan bucket nyata |
| Database sumber aktual | Signature 25 tabel, revisi 0, 32 objek, integrity OK tetap sama |

Seluruh pengujian mutasi memakai fixture terisolasi. Sumber aktual hanya dibaca, diaudit, dan di-backup; tidak didaftarkan warga pengujian.

## Performa terukur

Edge 156 pada AMD Radeon/D3D11, viewport 1440×900. Tiga sampel per density, bukan hasil ponsel fisik/soak/kapasitas nasional. Detail terukur ada di [JSON browser](phase-5c/living-world/browser-verification.json).

| Density | NPC | Kendaraan seed | FPS teramati | Draw calls |
|---|---:|---:|---:|---:|
| Off | 0 | 0 | sekitar 90 | 321 |
| Low | 5 | 2 | sekitar 90 | 485 |
| Medium | 10 | 4 | sekitar 90 | 657 |
| High | 18 | 5 | sekitar 90 | 905 |

Jangan menafsirkan angka ini sebagai jaminan FPS pada perangkat lain. Rendering Chibi masih beberapa mesh per karakter; batching/skinning instanced untuk ratusan agen belum dilakukan dan jumlah agen sengaja kecil.

## Bukti aplikasi nyata

- [Desktop aktif](phase-5c/living-world/desktop-active.png), [pengaturan/debug](phase-5c/living-world/desktop-controls.png), [mobile emulasi](phase-5c/living-world/mobile-active.png).
- [Simpang fixture](phase-5c/living-world/intersection-fixture.png): perubahan jalan hanya fixture, bukan 32 objek permanen.
- [Rekaman WebM 6,5 detik](phase-5c/living-world/living-world.webm): diambil dengan captureStream dari canvas WebGL aplikasi berjalan, tidak dihasilkan dari gambar/animasi eksternal. HUD tidak termasuk rekaman canvas; screenshot menyertakan HUD.
- `live-source.png` di direktori bukti menampilkan sumber SQLite permanen yang benar-benar berjalan di localhost.

## Batasan sebelum penutupan Phase 5C

1. Dunia permanen hanya mempunyai jalan lurus. Belokan dan berhenti di simpang telah diuji pada fixture; tidak mengarang persimpangan di sumber produksi.
2. Traffic sederhana berbasis tile, bukan simulator lalu lintas otoritatif: belum ada lampu lalu lintas, overtaking, prioritas persimpangan formal, garasi/interior, jadwal angkutan atau penumpang. Antrean di jaringan sempit/padat masih bisa macet; belum ada jaminan deadlock-free. Parkir adalah jeda visual layanan di jalur, belum slot parkir terpisah.
3. NPC mempunyai rute aman terhadap objek domain, bukan navmesh interior atau collision dengan setiap vegetasi render-only. Pejalan kaki dapat saling berpapasan; belum ada crowd avoidance penuh. Belum ada NPC interaktif yang dipilih.
4. Simulasi dekoratif tidak disinkronkan antarclient. Seed yang sama dapat direproduksi, tetapi waktu buka/pause/density berbeda memberi keadaan visual berbeda. Ini sengaja tidak mengubah server atau warga asli.
5. Graf dibatasi sekitar pusat pulau; area lebih jauh dari 26 meter belum ikut simulasi. Perubahan topologi/density membangun ulang agen lokal. Memindahkan kamera tidak memuat populasi nasional tak terbatas.
6. Masih perlu review visual pemilik, art pass pantai/air/fasad dari laporan visual, ponsel fisik, soak panjang dan audit aksesibilitas menyeluruh. Phase 5C keseluruhan tetap checkpoint, belum ditutup atau dianggap siap beta publik.

## File utama

`packages/world-engine/living-world.ts`, `Vehicles.tsx`, `Chibi.tsx`; `apps/web/components/LivingWorld.tsx`, `world-activity.ts`, `WorldActivityControls.tsx`, `Scene.tsx`, `GameView.tsx`, `Explore.tsx`, `apps/web/app/game.css`; `tests/living-world.test.ts`, `living-world-browser.mjs`, `citizens.mjs`.

## Visual Quality Pass 2

Pass lanjutan mempertahankan HUD, memperkaya bangunan/jalan/pantai/lingkungan 3D, serta menambahkan Demo City terisolasi di `/demo-city`. Geometri dunia dibatch dengan picking ID domain, dan simulasi mendapat perbaikan arah/gerak. [Laporan Pass 2](PHASE_5C_QUALITY_PASS_2_REPORT.md) memuat bukti aktual, pengukuran dua dunia, hasil regresi dan batasan terbaru. Data permanen tetap 25 tabel/32 objek/revisi 0. Tidak ada merge, provisioning berbayar, atau Phase 6.
