# Phase 5C — visual overhaul, checkpoint 1

4 November 2026. **Implementasi utama sudah berjalan pada build produksi lokal. Phase 5C belum dinyatakan selesai untuk membuka Closed Beta.** Perlu review visual pemilik, pengujian perangkat fisik dan penyempurnaan yang disebutkan di bawah. Phase 6 tidak dimulai; provisioning Railway/S3 serta publikasi beta tetap ditahan.

## Perlindungan data dan checkpoint

Checkpoint kode sebelum perubahan: `100b70fd3e1d0bf11f2c5f347e69b95e4acc1ecb`, dipertahankan pada branch rilis Phase 5B. Pekerjaan visual berada pada branch lokal `feature/phase-5c-visual-overhaul` di checkout Git terpisah. PR Phase 5B tidak diubah menjadi deployment visual yang belum disetujui.

Sebelum mengubah UI, diambil backup SQLite konsisten terenkripsi dan dilakukan restore serta pembandingan semua tabel. Detail privat disimpan pada laporan operator lokal yang dikecualikan dari Git. Setelah restart ke build produksi Phase 5C, signature **seluruh 25 tabel** tetap identik. Dunia permanen tetap revisi 0 dengan **32 objek asli**, seluruh ID, koordinat, terrain, schema dan histori tetap utuh. Tidak ada migrasi database untuk redesign ini. Backend voting, otorisasi, radius chat dan konfigurasi deployment Phase 5B tidak diubah.

Screenshot BEFORE berasal dari aplikasi lama yang berjalan. Lampiran permintaan yang tersedia hanya teks; tidak ada screenshot tambahan dari pemilik dalam folder lampiran. Seluruh AFTER di bawah berasal dari aplikasi Three.js nyata, bukan image generation atau mockup.

## Implementasi Stage A–F

| Stage | Yang sudah berfungsi | Batas checkpoint |
|---|---|---|
| A — Game shell | canvas `100dvh` penuh, top HUD, toolbar kiri mengambang, drawer yang dapat ditutup, dock kategori, kontrol kamera/layers/quality, status penyimpanan | tidak ada sidebar permanen; canvas tetap sama saat drawer dibuka/ditutup |
| B — Aset 3D | rumah dengan atap tebal/overhang, kusen/jendela/pintu, teras, tangga, planter dan cerobong; varian dormer/kanopi; balai dengan pilar/tangga/atap landmark; klinik dengan canopy dan identitas kesehatan; pohon bercabang, bangku/taman, ruas jalan dan curb | aset prosedural orisinal; masih perlu art pass lanjutan pada detail fasad/gable dan beberapa siluet |
| C — Lingkungan/kamera | palet terrain berbasis biome dengan variasi global, laut shader beranimasi, batu pesisir, pepohonan bukit instanced, ACES tone mapping, sunlight/fill/shadow PCF, pan/orbit/zoom/focus halus, overview nasional | generator terrain tidak diubah. Coastline masih mengikuti mesh generator lama; transisi pantai dan air berbasis kedalaman dapat ditingkatkan |
| D — Interaksi | pencarian/filter katalog, thumbnail memakai komponen Model yang sama, preview valid/tidak valid, rotasi, pemindahan, hapus, undo/redo, ACK autosave, pemilihan/fokus, layers administratif | preview dan objek tersimpan memakai ID yang sama sehingga varian visual tidak berubah saat commit. Tidak ada tombol Save palsu |
| E — Warga/pemerintahan | Explore fullscreen, status koneksi/pulau, roster aktual, chat mengambang/minimize, gestur/kantor, joystick analog, skala avatar terhadap rumah, nameplate ringkas, studio warga dan tema portal konsisten, avatar 3D kandidat | tidak ada statistik online nasional rekaan. Roster adalah pemain terlihat; backend tetap otoritatif. Portrait kandidat banyak sekaligus masih perlu optimasi |
| F — Verifikasi | desktop 1920×1080 dan 1440×900, tablet 768×1024, mobile 390×844, sentuh joystick emulasi, keyboard/focus styling, build dan regresi | belum ada pengujian ponsel fisik, audit aksesibilitas formal, atau soak test panjang |

Kategori Hunian, Pemerintahan, Kesehatan, Jalan dan Alam memakai enam aset domain yang benar-benar tersedia. Transportasi, Utilitas dan Dekorasi ditampilkan **terkunci/belum tersedia**, bukan tombol yang mengklaim membangun aset yang belum ada. Izin pembangunan tetap berasal dari sesi admin server; jabatan warga tidak memberikan hak tersebut.

## Model, skala dan jalan

Footprint domain tetap: rumah/pohon/jalan 2×2, balai/taman 4×4, klinik 4×2. Skala avatar dunia memakai faktor visual 0,55; kepala dan identitas Look tetap sama, dan ukuran visual mendekati collider warga yang sudah ada. Portrait/studio memakai karakter asli yang sama, bukan karakter baru. Tidak ada koordinat server yang dikalikan atau dipindahkan.

Jalan tetap merupakan objek yang dapat dipilih/dibangun/dipindah. Renderer membaca tetangga grid untuk memilih marka dan curb; bukan texture plane pengganti objek. `RoadSurface` mengonformasikan salinan geometri mesh dalam koordinat dunia berdasarkan sampler terrain, termasuk marka dan curb. Geometri sumber bersama tidak dimutasi; salinan dilepas saat perubahan/unmount. Tes membuktikan ketinggian sambungan tile bertetangga termasuk tile yang diputar. Jalan masih berbasis segmen grid 2 meter; bukan spline jaringan jalan bebas.

Vegetasi tambahan dan batu pesisir adalah dressing render-only yang diturunkan secara deterministik dari terrain, menghindari area bangunan. Tidak ada objek atau world event baru yang disisipkan ke database. Pohon/batu tidak boleh ditafsirkan sebagai bangunan domain baru. Tidak ada NPC atau warga online palsu untuk meramaikan scene.

## Pengujian

- **31/31 tes unit lulus**, termasuk kontinuitas terrain/collision/persistence, kelengkapan sumber migrasi, dan konformasi jalan tanpa merusak geometri bersama.
- TypeScript dan build produksi berhasil pada runtime utama serta checkout Git terpisah.
- `tests/visual-overhaul.mjs`: viewport utuh tanpa overflow pada desktop/tablet/mobile; canvas bertahan setelah empat siklus katalog; pencarian/filter; place/rotate/move/refresh; ID preview sama dengan objek tersimpan; semua 32 objek referensi tetap identik; fokus rumah/balai/klinik; atlas, screenshot dan metrik. **0 pageerror dan 0 warning WebGL/Three** pada run final.
- `tests/placement.mjs`: penempatan viewport (18,12), ACK, refresh dan picking mesh, akses/validasi API, preview tanpa commit, Sagara, sculpt, undo/redo, overview serta restart produksi. Lulus. Proyeksi klik kini berasal dari kamera sebenarnya, menggantikan asumsi lama zoom tetap 10.
- `tests/citizens.mjs`: dua akun, versi karakter, peer movement, tabrakan balai, travel/reconnect/login, penolakan hak admin. Lulus. Konteks mobile 390×844 menggunakan CDP touch start/move/end pada joystick dan peer melihat posisi otoritatif berubah.
- `tests/chat-browser.mjs`: tiga akun, dekat/jauh/lintas pulau, isolasi frame, mute/block/report/sanksi, HTML, spoof/replay/rate limit dan reconnect. Lulus; radius server tetap 120 meter.
- `tests/government-browser.mjs`: pencalonan/review/voting, suara paralel 200/400, outsider ditolak, hasil 2:1, finalisasi idempotent, titel/seragam/gestur, penolakan hak platform, backup panel. Lulus pada dataset terisolasi.
- `tests/postgres-runtime.mjs --mobile`: PostgreSQL native, HTTPS/WSS loopback, Secure cookie, kontrol sentuh, chat/travel/reconnect/voting dan restore database kedua. Lulus. Bukan bukti beta internet atau S3 nyata.

Semua mutasi acceptance berada pada SQLite/PostgreSQL fixture terpisah. Beberapa screenshot fixture menampilkan 33 objek karena rumah uji baru ditambahkan; **dunia permanen tetap 32 objek**. Snapshot AFTER live dan coastline/road live diambil secara read-only dari sumber permanen.

## Pengukuran aktual

Build produksi, Edge 156.0.4314.58 pada Windows; renderer yang dilaporkan: AMD Radeon (TM) Graphics melalui ANGLE Direct3D11. Flag pengujian mengizinkan fallback SwiftShader, tetapi string renderer aktual menunjukkan GPU AMD. Kamera home 1920×1080, kualitas normal, laut animasi/shadow aktif, 33 objek fixture, drawer ditutup, enam sampel sekitar 0,6 detik.

| Metrik | Hasil run final |
|---|---:|
| FPS teramati | sekitar 90; rentang 89,96–90,09 |
| Draw calls canvas utama | 338 |
| Triangles canvas utama | 19.900 |
| Geometri WebGL tercatat | 117, termasuk salinan konformasi jalan |
| Tekstur WebGL tercatat | 1 |
| JavaScript heap | sekitar 21–44 MB selama sampel; GC berpengaruh |
| Observasi world ready | 2.012 ms, **termasuk tunggu kamera 850 ms** dan kesiapan instrumentation; bukan pengukuran latency jaringan murni |
| Total JavaScript statis seluruh route | sekitar 1,7 MB tidak terkompresi; bukan initial download compressed |

Hasil ini memenuhi target 60 FPS **pada skenario dan GPU ini saja**. Tidak menetapkan kapasitas negara besar, pemain serentak, semua laptop, atau 30 FPS ponsel fisik. Kamera/interaksi diverifikasi berfungsi, tetapi latency input-to-photon belum diprofilkan terpisah. VRAM tidak dapat diukur andal dari API browser; angka heap bukan VRAM. Metrik utama tidak menjumlahkan draw call dari seluruh canvas thumbnail/portrait. Berkas data: [browser verification](phase-5c/browser-verification.json), [bundle measurement](phase-5c/bundle-measurement.json).

## Bukti visual

- [BEFORE desktop](phase-5c/before-desktop.png).
- [AFTER live overview — sumber permanen 32 objek](phase-5c/after-live-overview.png).
- [Build mode](phase-5c/after-build-mode.png), [katalog model nyata](phase-5c/after-catalog.png).
- [Rumah](phase-5c/after-house.png), [balai](phase-5c/after-hall.png), [klinik](phase-5c/after-clinic.png).
- [Jalan pada dunia permanen](phase-5c/after-road-live.png), [coastline pada dunia permanen](phase-5c/after-coastline-live.png), [atlas](phase-5c/after-atlas.png).
- [Explore desktop dua karakter](phase-5c/after-explore-desktop.png), [Explore mobile](phase-5c/after-explore-mobile.png).
- [Pemerintahan](phase-5c/after-government.png), [pemilu dataset tes](phase-5c/after-election.png).
- [Desktop 1440×900](phase-5c/after-desktop-1440.png), [tablet](phase-5c/after-tablet.png), [mobile](phase-5c/after-mobile.png), [bottom sheet mobile](phase-5c/after-mobile-catalog.png).

## File yang berubah

- `apps/web/app/layout.tsx`, `game.css`, `pemerintahan/page.jsx`: identitas tampilan, design system dan kartu kandidat.
- `apps/web/components/Game.tsx`, `GameView.tsx`, `GameIcon.tsx`, `AssetPreview.tsx`, `editor.ts`: shell, HUD, katalog, state render/interaction dan ikon SVG orisinal.
- `Scene.tsx`, `WorldAtmosphere.tsx`, `RoadSurface.tsx`: kamera, tone mapping, terrain/water/vegetasi, layers, metrik dan konformasi jalan.
- `Citizen.tsx`, `Explore.tsx`, `TouchJoystick.tsx`: studio, fullscreen multiplayer, nameplate/skala dan input sentuh. Sistem pesan LocalChat dan router server dipertahankan.
- `packages/world-engine/Models.tsx`, `road-surface.ts`: model/geometri/material bersama dan helper visual jalan.
- `tests/visual-overhaul.mjs`, `road-visual.test.ts`, `placement.mjs`, `citizens.mjs`, `government-browser.mjs`: acceptance, regression dan bukti visual.
- `apps/web/AGENTS.md` dihasilkan Next dev; mengikuti panduan client/server components bundled pada versi yang terpasang.

## Pekerjaan yang masih tersisa sebelum penutupan Phase 5C

1. Review pemilik terhadap arah art/UI berdasarkan aplikasi dan screenshot aktual. Ini checkpoint yang berfungsi, bukan klaim semua standar visual subjektif telah disetujui.
2. Art pass lanjutan: transisi pantai yang masih mengikuti grid generator, warna air berdasarkan kedalaman aktual, detail/siluet/gable bangunan, dan variasi vegetasi pesisir. Jangan mengubah generator tersimpan untuk memperhalus screenshot.
3. Pengujian ponsel fisik: pinch/orbit kamera, keyboard chat, safe area, thermal throttling dan FPS. Emulasi sentuh sudah lulus, perangkat fisik belum.
4. Soak test buka/tutup panel, travel berulang, banyak avatar/kandidat; optimasi portrait dan batching aset pada dataset besar. Belum ada janji FPS nasional besar.
5. Audit aksesibilitas penuh dan profil input-to-photon terpisah. Focus ring, dialog focus containment/Escape dan reduced-motion CSS sudah diterapkan, tetapi belum audit WCAG menyeluruh.

Tidak ada provisioning cloud, layanan berbayar atau pembukaan beta publik pada pekerjaan ini. Persiapan Railway/PostgreSQL/S3 tetap ada. Penutupan visual dan persetujuan pemilik diperlukan sebelum kembali ke gate Closed Beta.

## Tambahan Living World

Checkpoint berikutnya menambahkan NPC Chibi dan kendaraan bergerak, routing daratan/jalan, kontrol simulasi HUD/Explore, serta bukti browser dan rekaman aktual. Lihat [laporan Living World](PHASE_5C_LIVING_WORLD_REPORT.md). Validasi terbaru: 35 unit tests, build/typecheck, regresi visual, penempatan, citizens/travel, chat, pemerintahan, PostgreSQL dan recovery lulus. Audit runtime permanen tetap 25 tabel sama, 32 objek dan revisi 0. Batasan/art pass pada daftar penutupan di atas tetap berlaku.
